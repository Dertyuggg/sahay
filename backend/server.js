require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase, isConfigured, memoryStore } = require('./supabaseClient');
const { computeFrictionScore } = require('./frictionScore');
const { executeTask } = require('./taskExecutor');

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

// ==========================================
// Interaction Events Ingestion (Telemetry)
// Contract: POST /interaction-events
// ==========================================
app.post('/interaction-events', async (req, res) => {
  const { user_id, event_type, screen_id, timestamp, meta } = req.body;

  // Validate required fields
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

  // Persist to Supabase if configured, with graceful fallback to memoryStore
  if (supabase) {
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

  // Supabase not configured: save to memoryStore
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
  const { user_id, limit = 50 } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Query parameter "user_id" is required' });
  }

  if (supabase) {
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

  // Memory fallback query
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
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Query parameter "user_id" is required' });
  }

  let events = [];

  if (supabase) {
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

  const result = await executeTask(intent, params || {});

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.json(result);
});

// ==========================================
// Legacy / Mock Banking Routes (Preserved for backward compat)
// ==========================================
let users = {
  "user_1": {
    id: "user_1",
    name: "Arthur Pendelton",
    balance: 1250.00,
    transactions: [
      { id: "tx_1", date: "2026-09-01", amount: -50.00, description: "Groceries" },
      { id: "tx_2", date: "2026-08-28", amount: 2000.00, description: "Pension Deposit" }
    ]
  }
};

app.get('/api/users/:id', (req, res) => {
  const user = users[req.params.id];
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post('/api/users/:id/transfer', (req, res) => {
  const { amount, to } = req.body;
  const user = users[req.params.id];
  
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.balance < amount) return res.status(400).json({ error: "Insufficient funds" });
  
  user.balance -= amount;
  user.transactions.unshift({
    id: `tx_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    amount: -amount,
    description: `Transfer to ${to}`
  });
  
  res.json({ success: true, balance: user.balance });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`SAHAY-24 Backend running on http://localhost:${PORT}`);
    console.log(`Supabase integration status: ${isConfigured ? 'CONNECTED' : 'IN-MEMORY FALLBACK'}`);
  });
}

module.exports = app;
