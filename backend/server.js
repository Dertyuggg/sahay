require('dotenv').config({ path: '../.env' }); // Load from root
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Fallback user ID for testing
const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

// Routes

// 1. Get user and balance
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id === 'user_1' ? DEFAULT_USER_ID : req.params.id;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, mock_balances(balance)')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) return res.status(404).json({ error: "User not found" });

    // Format response to match previous mock DB structure (partially)
    const formattedUser = {
      id: user.id,
      name: user.name,
      balance: user.mock_balances?.[0]?.balance || 0,
      // Leaving transactions out for now unless needed, or we could fetch them if we add a transactions table
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Transfer money
app.post('/api/users/:id/transfer', async (req, res) => {
  const userId = req.params.id === 'user_1' ? DEFAULT_USER_ID : req.params.id;
  const { amount, to } = req.body;

  try {
    // 1. Get current balance
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

    // 2. Update balance
    const { error: updateError } = await supabase
      .from('mock_balances')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', balanceData.id);

    if (updateError) throw updateError;

    // (Optional) We could also insert into a transactions table here if we created one.
    
    res.json({ success: true, balance: newBalance });
  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Post interaction events (From Stage 0 plan)
app.post('/interaction-events', async (req, res) => {
  let { user_id, event_type, screen_id, timestamp, meta } = req.body;
  if (user_id === 'user_1') user_id = DEFAULT_USER_ID; // Map mock ID

  try {
    const { error } = await supabase
      .from('interaction_events')
      .insert([
        { user_id, event_type, screen_id, timestamp, meta }
      ]);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error inserting interaction event:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. Get friction score (Mock implementation for now until Stage 2 scoring engine)
app.get('/friction-score', async (req, res) => {
  let userId = req.query.user_id;
  if (userId === 'user_1') userId = DEFAULT_USER_ID; // Map mock ID

  try {
    // For now, return a standard score until we implement the actual logic
    res.json({ score: 0, tier: "standard" });
  } catch (error) {
    console.error('Error fetching friction score:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`SAHAY-24 Backend running on http://localhost:${PORT}`);
});
