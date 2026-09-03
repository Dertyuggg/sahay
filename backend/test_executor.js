/**
 * SAHAY-24 Banking Task Executor — Integration Tests
 *
 * Tests POST /execute-task with both intents against the in-memory store.
 *
 * Run: node test_executor.js
 */

process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('./server');

const server = http.createServer(app);

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  ✓ [PASS] ${description}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`         Expected: ${JSON.stringify(expected)}`);
    console.error(`         Actual:   ${JSON.stringify(actual)}`);
  }
}

function assertTruthy(description, value) {
  if (value) {
    passed++;
    console.log(`  ✓ [PASS] ${description}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${description} — got falsy: ${JSON.stringify(value)}`);
  }
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
}

server.listen(0, async () => {
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  console.log(`[TEST] Task executor tests on ${base}\n`);

  try {
    // ────────────────────────────────────────────────────
    // 1. Missing intent → 400
    // ────────────────────────────────────────────────────
    console.log('── Missing / Invalid Intent ──────────────────────────');
    {
      const r = await post(`${base}/execute-task`, {});
      assert('missing intent → 400', r.status, 400);
      assertTruthy('error message present', r.data.error);
    }
    {
      const r = await post(`${base}/execute-task`, { intent: 'hack_the_bank' });
      assert('invalid intent → 400', r.status, 400);
      assertTruthy('error mentions invalid intent', r.data.error.includes('Invalid intent'));
    }

    // ────────────────────────────────────────────────────
    // 2. check_balance — happy path
    // ────────────────────────────────────────────────────
    console.log('\n── check_balance ────────────────────────────────────');
    {
      const r = await post(`${base}/execute-task`, {
        intent: 'check_balance',
        params: { user_id: 'e1111111-1111-1111-1111-111111111111' }
      });
      assert('check_balance → 200', r.status, 200);
      assert('success true', r.data.success, true);
      assert('intent echoed', r.data.intent, 'check_balance');
      assert('user_name correct', r.data.data.user_name, 'Ramesh Kumar');
      assert('balance is 15450', r.data.data.balance, 15450);
      assert('currency is INR', r.data.data.currency, 'INR');
      assertTruthy('readback contains balance', r.data.data.readback.includes('15,450'));
    }
    {
      const r = await post(`${base}/execute-task`, {
        intent: 'check_balance',
        params: { user_id: 'nonexistent-user' }
      });
      assert('check_balance unknown user → 400', r.status, 400);
      assert('success false', r.data.success, false);
    }
    {
      const r = await post(`${base}/execute-task`, {
        intent: 'check_balance',
        params: {}
      });
      assert('check_balance missing user_id → 400', r.status, 400);
    }

    // ────────────────────────────────────────────────────
    // 3. send_money — happy path
    // ────────────────────────────────────────────────────
    console.log('\n── send_money ───────────────────────────────────────');
    {
      const r = await post(`${base}/execute-task`, {
        intent: 'send_money',
        params: {
          user_id: 'e1111111-1111-1111-1111-111111111111',
          contact_name: 'Sita Devi',
          amount: 2000
        }
      });
      assert('send_money → 200', r.status, 200);
      assert('success true', r.data.success, true);
      assert('intent echoed', r.data.intent, 'send_money');
      assert('recipient correct', r.data.data.recipient_name, 'Sita Devi');
      assert('amount_sent correct', r.data.data.amount_sent, 2000);
      assert('previous_balance was 15450', r.data.data.previous_balance, 15450);
      assert('new_balance is 13450', r.data.data.new_balance, 13450);
      assertTruthy('readback mentions Sita Devi', r.data.data.readback.includes('Sita Devi'));
      assertTruthy('transaction_id present', r.data.data.transaction_id);
    }

    // ────────────────────────────────────────────────────
    // 4. send_money — verify balance actually deducted
    // ────────────────────────────────────────────────────
    console.log('\n── Balance deduction verification ───────────────────');
    {
      const r = await post(`${base}/execute-task`, {
        intent: 'check_balance',
        params: { user_id: 'e1111111-1111-1111-1111-111111111111' }
      });
      assert('balance after send is 13450', r.data.data.balance, 13450);
    }

    // ────────────────────────────────────────────────────
    // 5. send_money — case-insensitive contact lookup
    // ────────────────────────────────────────────────────
    console.log('\n── Case-insensitive contact match ───────────────────');
    {
      const r = await post(`${base}/execute-task`, {
        intent: 'send_money',
        params: {
          user_id: 'e1111111-1111-1111-1111-111111111111',
          contact_name: 'SURESH PATEL',
          amount: 500
        }
      });
      assert('case-insensitive contact → 200', r.status, 200);
      assert('matched Suresh Patel', r.data.data.recipient_name, 'Suresh Patel');
    }

    // ────────────────────────────────────────────────────
    // 6. send_money — validation failures
    // ────────────────────────────────────────────────────
    console.log('\n── send_money validation ────────────────────────────');
    {
      // Unknown contact
      const r = await post(`${base}/execute-task`, {
        intent: 'send_money',
        params: {
          user_id: 'e1111111-1111-1111-1111-111111111111',
          contact_name: 'Random Stranger',
          amount: 100
        }
      });
      assert('unsaved contact → 400', r.status, 400);
      assertTruthy('error mentions saved contacts', r.data.error.includes('saved contacts'));
    }
    {
      // Insufficient funds
      const r = await post(`${base}/execute-task`, {
        intent: 'send_money',
        params: {
          user_id: 'e1111111-1111-1111-1111-111111111111',
          contact_name: 'Kiran Sharma',
          amount: 999999
        }
      });
      assert('insufficient funds → 400', r.status, 400);
      assertTruthy('error mentions Insufficient funds', r.data.error.includes('Insufficient funds'));
    }
    {
      // Missing contact_name
      const r = await post(`${base}/execute-task`, {
        intent: 'send_money',
        params: { user_id: 'e1111111-1111-1111-1111-111111111111', amount: 100 }
      });
      assert('missing contact_name → 400', r.status, 400);
    }
    {
      // Negative amount
      const r = await post(`${base}/execute-task`, {
        intent: 'send_money',
        params: {
          user_id: 'e1111111-1111-1111-1111-111111111111',
          contact_name: 'Kiran Sharma',
          amount: -50
        }
      });
      assert('negative amount → 400', r.status, 400);
    }

    // ────────────────────────────────────────────────────
    // Summary
    // ────────────────────────────────────────────────────
    const total = passed + failed;
    console.log(`\n${'─'.repeat(55)}`);
    if (failed === 0) {
      console.log(`✓ ALL ${total} TASK EXECUTOR TESTS PASSED`);
    } else {
      console.error(`✗ ${failed}/${total} tests FAILED`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exitCode = 1;
  } finally {
    server.close(() => process.exit(process.exitCode || 0));
  }
});
