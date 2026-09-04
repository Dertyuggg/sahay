require('dotenv').config({ path: '../.env' }); // Load from root
const express = require('express');
const cors = require('cors');
const { supabase, isConfigured, memoryStore } = require('./supabaseClient');
const { computeFrictionScore } = require('./frictionScore');
const { executeTask } = require('./taskExecutor');
const { parseBankingIntent, generateText, streamText } = require('./geminiService');

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed event types for interaction telemetry
const VALID_EVENT_TYPES = new Set([
  'mistap',
  'hesitation',
  'back_nav',
  'abandon_retry',
  'erratic_scroll'
]);

// Fallback user ID for testing
const DEFAULT_USER_ID = 'e1111111-1111-1111-1111-111111111111';

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SAHAY-24 Backend',
    supabase_configured: isConfigured,
    timestamp: new Date().toISOString()
  });
});

// 1. Get user and balance
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id === 'user_1' ? DEFAULT_USER_ID : req.params.id;

  if (supabase && isConfigured) {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*, mock_balances(balance)')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!user) return res.status(404).json({ error: "User not found" });

      const formattedUser = {
        id: user.id,
        name: user.name,
        balance: user.mock_balances?.[0]?.balance || 0,
      };

      return res.json(formattedUser);
    } catch (error) {
      console.error('Error fetching user from Supabase:', error);
      // Fallback below
    }
  }

  // Memory fallback
  const user = memoryStore.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found in memory" });
  
  const bal = memoryStore.mock_balances.find(b => b.user_id === userId);
  
  const formattedUser = {
    id: user.id,
    name: user.name,
    balance: bal ? bal.balance : 0,
  };
  
  res.json(formattedUser);
});

// 2. Transfer money
app.post('/api/users/:id/transfer', async (req, res) => {
  const userId = req.params.id === 'user_1' ? DEFAULT_USER_ID : req.params.id;
  const { amount, to } = req.body;

  if (supabase && isConfigured) {
    try {
      const { data: balanceData, error: balanceError } = await supabase
        .from('mock_balances')
        .select('balance, id')
        .eq('user_id', userId)
        .single();

      if (balanceError) throw balanceError;
      if (!balanceData) return res.status(404).json({ error: "Balance not found" });

      if (balanceData.balance < amount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }

      const newBalance = balanceData.balance - amount;

      const { error: updateError } = await supabase
        .from('mock_balances')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', balanceData.id);

      if (updateError) throw updateError;
      
      return res.json({ success: true, balance: newBalance });
    } catch (error) {
      console.error('Error processing transfer in Supabase:', error);
      // Fallback below
    }
  }

  // Memory fallback
  const bal = memoryStore.mock_balances.find(b => b.user_id === userId);
  if (!bal) return res.status(404).json({ error: "Balance not found in memory" });
  
  if (bal.balance < amount) {
    return res.status(400).json({ error: "Insufficient funds" });
  }
  
  bal.balance -= amount;
  res.json({ success: true, balance: bal.balance });
});

// ==========================================
// Interaction Events Ingestion (Telemetry)
// Contract: POST /interaction-events
// ==========================================
app.post('/interaction-events', async (req, res) => {
  let { user_id, event_type, screen_id, timestamp, meta } = req.body;
  if (user_id === 'user_1') user_id = DEFAULT_USER_ID;

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid required field: user_id' });
  }

  if (!event_type || !VALID_EVENT_TYPES.has(event_type)) {
    return res.status(400).json({
      error: `Invalid event_type: "${event_type}". Must be one of: ${Array.from(VALID_EVENT_TYPES).join(', ')}`
    });
  }

  if (!screen_id || typeof screen_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid required field: screen_id' });
  }

  const eventRecord = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id,
    event_type,
    screen_id,
    timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    meta: meta && typeof meta === 'object' ? meta : {}
  };

  if (supabase && isConfigured) {
    try {
      const { data, error } = await supabase
        .from('interaction_events')
        .insert([{
          user_id: eventRecord.user_id,
          event_type: eventRecord.event_type,
          screen_id: eventRecord.screen_id,
          timestamp: eventRecord.timestamp,
          meta: eventRecord.meta
        }])
        .select()
        .single();

      if (error) {
        console.warn('[SAHAY-24] Supabase insert warning (falling back to memory):', error.message);
        memoryStore.interaction_events.unshift(eventRecord);
        return res.status(201).json({
          success: true,
          source: 'memory_fallback',
          event: eventRecord
        });
      }

      return res.status(201).json({
        success: true,
        source: 'supabase',
        event: data || eventRecord
      });
    } catch (err) {
      console.error('[SAHAY-24] Supabase unexpected error:', err.message);
      memoryStore.interaction_events.unshift(eventRecord);
      return res.status(201).json({
        success: true,
        source: 'memory_fallback',
        event: eventRecord
      });
    }
  }

  memoryStore.interaction_events.unshift(eventRecord);
  return res.status(201).json({
    success: true,
    source: 'memory',
    event: eventRecord
  });
});

// ==========================================
// Interaction Events Retrieval (For Verification & Score Engine)
// Contract: GET /interaction-events?user_id=...
// ==========================================
app.get('/interaction-events', async (req, res) => {
  let { user_id, limit = 50 } = req.query;
  if (user_id === 'user_1') user_id = DEFAULT_USER_ID;

  if (!user_id) {
    return res.status(400).json({ error: 'Query parameter "user_id" is required' });
  }

  if (supabase && isConfigured) {
    try {
      const { data, error } = await supabase
        .from('interaction_events')
        .select('*')
        .eq('user_id', user_id)
        .order('timestamp', { ascending: false })
        .limit(Number(limit));

      if (!error && data) {
        return res.json({ events: data, source: 'supabase' });
      }
      console.warn('[SAHAY-24] Supabase select warning (falling back to memory):', error?.message);
    } catch (err) {
      console.error('[SAHAY-24] Supabase query error:', err.message);
    }
  }

  const events = memoryStore.interaction_events
    .filter(e => e.user_id === user_id)
    .slice(0, Number(limit));

  res.json({ events, source: 'memory' });
});

// ==========================================
// Friction Score Engine
// Contract: GET /friction-score?user_id=...
// ==========================================
app.get('/friction-score', async (req, res) => {
  let { user_id } = req.query;
  if (user_id === 'user_1') user_id = DEFAULT_USER_ID;

  if (!user_id) {
    return res.status(400).json({ error: 'Query parameter "user_id" is required' });
  }

  let events = [];

  if (supabase && isConfigured) {
    try {
      const { data, error } = await supabase
        .from('interaction_events')
        .select('*')
        .eq('user_id', user_id)
        .order('timestamp', { ascending: false })
        .limit(200);

      if (!error && data) {
        events = data;
      } else {
        console.warn('[SAHAY-24] Supabase select warning (scoring fallback to memory):', error?.message);
        events = memoryStore.interaction_events.filter(e => e.user_id === user_id);
      }
    } catch (err) {
      console.error('[SAHAY-24] Supabase query error:', err.message);
      events = memoryStore.interaction_events.filter(e => e.user_id === user_id);
    }
  } else {
    events = memoryStore.interaction_events.filter(e => e.user_id === user_id);
  }

  const result = computeFrictionScore(events);

  res.json({
    user_id,
    score: result.score,
    tier: result.tier,
    breakdown: result.breakdown,
    event_count: events.length
  });
});

// ==========================================
// Gemini NLP Intent Parser
// Contract: POST /api/parse-intent
// { text: "natural language input" }
// ==========================================
app.post('/api/parse-intent', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing required field: text' });
  }

  try {
    const result = await parseBankingIntent(text);
    return res.json({ success: true, result });
  } catch (err) {
    console.error('[SAHAY-24] Parse Intent Error:', err.message);
    return res.status(500).json({ error: 'Failed to parse intent', details: err.message });
  }
});

// ==========================================
// Banking Task Executor
// Contract: POST /execute-task
// { intent: "check_balance"|"send_money", params: {...} }
// ==========================================
app.post('/execute-task', async (req, res) => {
  const { intent, params } = req.body;

  if (!intent) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: intent. Must be "check_balance" or "send_money".'
    });
  }
  
  // Apply mapping if missing user_id in params but we know it's a mock test
  if (params && params.user_id === 'user_1') {
    params.user_id = DEFAULT_USER_ID;
  }

  const result = await executeTask(intent, params || {});

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.json(result);
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`SAHAY-24 Backend running on http://localhost:${PORT}`);
    console.log(`Supabase integration status: ${isConfigured ? 'CONNECTED' : 'IN-MEMORY FALLBACK'}`);
  });
}

module.exports = app;
