/**
 * SAHAY-24 Banking Task Executor
 *
 * Simple rule-based intent-to-task mapping — no LLM agent.
 * Supports exactly two intents:
 *   - check_balance: returns the user's current mocked balance
 *   - send_money:    validates recipient against saved_contacts,
 *                    checks sufficient funds, deducts from mock_balances,
 *                    returns confirmation payload
 *
 * Both Supabase and in-memory fallback paths are supported.
 */

const { supabase, isConfigured, memoryStore } = require('./supabaseClient');

const VALID_INTENTS = new Set(['check_balance', 'send_money']);

/**
 * Execute a banking task.
 *
 * @param {string} intent - "check_balance" | "send_money"
 * @param {object} params - Intent-specific parameters
 *   check_balance: { user_id }
 *   send_money:    { user_id, contact_name, amount }
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
async function executeTask(intent, params) {
  if (!intent || !VALID_INTENTS.has(intent)) {
    return {
      success: false,
      error: `Invalid intent: "${intent}". Must be one of: ${Array.from(VALID_INTENTS).join(', ')}`
    };
  }

  switch (intent) {
    case 'check_balance':
      return await handleCheckBalance(params);
    case 'send_money':
      return await handleSendMoney(params);
    default:
      return { success: false, error: `Unhandled intent: "${intent}"` };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// check_balance
// ──────────────────────────────────────────────────────────────────────────────
async function handleCheckBalance(params) {
  const { user_id } = params || {};

  if (!user_id) {
    return { success: false, error: 'Missing required param: user_id' };
  }

  // -- Supabase path --
  if (supabase) {
    try {
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', user_id)
        .single();

      if (userErr || !user) {
        throw new Error(userErr?.message || `User not found in Supabase: ${user_id}`);
      }

      const { data: bal, error: balErr } = await supabase
        .from('mock_balances')
        .select('account_number, balance, currency')
        .eq('user_id', user_id)
        .single();

      if (balErr || !bal) {
        throw new Error(balErr?.message || `No balance record in Supabase for: ${user_id}`);
      }

      return {
        success: true,
        intent: 'check_balance',
        data: {
          user_id: user.id,
          user_name: user.name,
          account_number: bal.account_number,
          balance: Number(bal.balance),
          currency: bal.currency,
          readback: `Your current balance is ${bal.currency} ${Number(bal.balance).toLocaleString('en-IN')}`
        }
      };
    } catch (err) {
      console.warn('[SAHAY-24] Supabase check_balance failed, falling back to memory:', err.message);
      // fall through to memory
    }
  }

  // -- Memory fallback --
  const user = memoryStore.users.find(u => u.id === user_id);
  if (!user) {
    return { success: false, error: `User not found: ${user_id}` };
  }

  const bal = memoryStore.mock_balances.find(b => b.user_id === user_id);
  if (!bal) {
    return { success: false, error: `No balance record for user: ${user_id}` };
  }

  return {
    success: true,
    intent: 'check_balance',
    source: 'memory',
    data: {
      user_id: user.id,
      user_name: user.name,
      account_number: bal.account_number,
      balance: bal.balance,
      currency: bal.currency,
      readback: `Your current balance is ${bal.currency} ${bal.balance.toLocaleString('en-IN')}`
    }
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// send_money
// ──────────────────────────────────────────────────────────────────────────────
async function handleSendMoney(params) {
  const { user_id, contact_name, amount } = params || {};

  if (!user_id) {
    return { success: false, error: 'Missing required param: user_id' };
  }
  if (!contact_name || typeof contact_name !== 'string') {
    return { success: false, error: 'Missing required param: contact_name' };
  }
  const numericAmount = Number(amount);
  if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
    return { success: false, error: 'Invalid or missing param: amount (must be a positive number)' };
  }

  // -- Supabase path --
  if (supabase) {
    try {
      // 1. Validate user
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', user_id)
        .single();

      if (userErr || !user) {
        throw new Error(userErr?.message || `User not found in Supabase: ${user_id}`);
      }

      // 2. Validate saved contact (case-insensitive match)
      const { data: contacts, error: contactErr } = await supabase
        .from('saved_contacts')
        .select('*')
        .eq('user_id', user_id)
        .ilike('contact_name', contact_name);

      if (contactErr) {
        throw new Error(contactErr.message);
      }

      if (!contacts || contacts.length === 0) {
        // This is a genuine "not found" — don't fall through, the contact really isn't saved
        return {
          success: false,
          error: `"${contact_name}" is not in your saved contacts. You can only send money to saved contacts.`
        };
      }
      const contact = contacts[0];

      // 3. Check balance
      const { data: bal, error: balErr } = await supabase
        .from('mock_balances')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (balErr || !bal) {
        throw new Error(balErr?.message || `No balance record in Supabase for: ${user_id}`);
      }

      if (Number(bal.balance) < numericAmount) {
        return {
          success: false,
          error: `Insufficient funds. Current balance: ${bal.currency} ${Number(bal.balance).toLocaleString('en-IN')}. Requested: ${bal.currency} ${numericAmount.toLocaleString('en-IN')}`
        };
      }

      // 4. Deduct
      const newBalance = Number(bal.balance) - numericAmount;
      const { error: updateErr } = await supabase
        .from('mock_balances')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user_id);

      if (updateErr) {
        throw new Error(`Failed to update balance: ${updateErr.message}`);
      }

      return {
        success: true,
        intent: 'send_money',
        data: {
          user_id: user.id,
          user_name: user.name,
          recipient_name: contact.contact_name,
          recipient_upi: contact.upi_id || contact.account_number,
          amount_sent: numericAmount,
          currency: bal.currency,
          previous_balance: Number(bal.balance),
          new_balance: newBalance,
          transaction_id: `txn_${Date.now()}`,
          timestamp: new Date().toISOString(),
          readback: `You have sent ${bal.currency} ${numericAmount.toLocaleString('en-IN')} to ${contact.contact_name}. Your new balance is ${bal.currency} ${newBalance.toLocaleString('en-IN')}.`
        }
      };
    } catch (err) {
      console.warn('[SAHAY-24] Supabase send_money failed, falling back to memory:', err.message);
      // fall through to memory
    }
  }

  // -- Memory fallback --
  const user = memoryStore.users.find(u => u.id === user_id);
  if (!user) {
    return { success: false, error: `User not found: ${user_id}` };
  }

  // Case-insensitive contact lookup
  const contact = memoryStore.saved_contacts.find(
    c => c.user_id === user_id && c.contact_name.toLowerCase() === contact_name.toLowerCase()
  );
  if (!contact) {
    return {
      success: false,
      error: `"${contact_name}" is not in your saved contacts. You can only send money to saved contacts.`
    };
  }

  const bal = memoryStore.mock_balances.find(b => b.user_id === user_id);
  if (!bal) {
    return { success: false, error: `No balance record for user: ${user_id}` };
  }

  if (bal.balance < numericAmount) {
    return {
      success: false,
      error: `Insufficient funds. Current balance: ${bal.currency} ${bal.balance.toLocaleString('en-IN')}. Requested: ${bal.currency} ${numericAmount.toLocaleString('en-IN')}`
    };
  }

  // Deduct in memory
  const previousBalance = bal.balance;
  bal.balance -= numericAmount;

  return {
    success: true,
    intent: 'send_money',
    source: 'memory',
    data: {
      user_id: user.id,
      user_name: user.name,
      recipient_name: contact.contact_name,
      recipient_upi: contact.upi_id || contact.account_number,
      amount_sent: numericAmount,
      currency: bal.currency,
      previous_balance: previousBalance,
      new_balance: bal.balance,
      transaction_id: `txn_${Date.now()}`,
      timestamp: new Date().toISOString(),
      readback: `You have sent ${bal.currency} ${numericAmount.toLocaleString('en-IN')} to ${contact.contact_name}. Your new balance is ${bal.currency} ${bal.balance.toLocaleString('en-IN')}.`
    }
  };
}

module.exports = { executeTask, VALID_INTENTS };
