const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim().replace(/^["']|["']$/g, '') : '';
const supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/^["']|["']$/g, '');

let supabase = null;
const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id')
);

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('[SAHAY-24] Connected to Supabase at:', supabaseUrl);
  } catch (err) {
    console.error('[SAHAY-24] Error initializing Supabase client:', err.message);
    supabase = null;
  }
} else {
  console.log('[SAHAY-24] Supabase credentials not set or incomplete in .env.');
  console.log('[SAHAY-24] Running in-memory storage fallback for interaction events.');
}

// In-memory fallback stores
const memoryStore = {
  interaction_events: [],
  users: [
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      name: 'Ramesh Kumar',
      email: 'ramesh.kumar@example.in',
      phone: '+91 98765 43210'
    },
    {
      id: 'e2222222-2222-2222-2222-222222222222',
      name: 'Arthur Pendelton',
      email: 'arthur.pendelton@example.in',
      phone: '+91 98123 45678'
    }
  ],
  mock_balances: [
    {
      user_id: 'e1111111-1111-1111-1111-111111111111',
      account_number: 'SB-98765432101',
      balance: 15450.00,
      currency: 'INR'
    },
    {
      user_id: 'e2222222-2222-2222-2222-222222222222',
      account_number: 'SB-12345678902',
      balance: 1250.00,
      currency: 'INR'
    }
  ],
  saved_contacts: [
    {
      user_id: 'e1111111-1111-1111-1111-111111111111',
      contact_name: 'Sita Devi',
      phone: '+91 98765 11111',
      account_number: '40992381283',
      upi_id: 'sita@okhdfcbank'
    },
    {
      user_id: 'e1111111-1111-1111-1111-111111111111',
      contact_name: 'Suresh Patel',
      phone: '+91 98765 22222',
      account_number: '50123491823',
      upi_id: 'suresh@okaxis'
    },
    {
      user_id: 'e1111111-1111-1111-1111-111111111111',
      contact_name: 'Kiran Sharma',
      phone: '+91 98765 33333',
      account_number: '10293847561',
      upi_id: 'kiran@sbi'
    }
  ]
};

module.exports = {
  supabase,
  isConfigured,
  memoryStore
};
