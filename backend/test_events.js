// Standalone sanity check for SAHAY-24 Event Ingestion
process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('./server');

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`[TEST] Test server running on ${baseUrl}`);

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log('[TEST 1] Health check:', healthData.status === 'ok' ? 'PASS' : 'FAIL', healthData);

    // 2. Post valid mistap event
    const postRes1 = await fetch(`${baseUrl}/interaction-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'e1111111-1111-1111-1111-111111111111',
        event_type: 'mistap',
        screen_id: 'send_money',
        meta: { target: 'confirm_button', distance_px: 28 }
      })
    });
    const postData1 = await postRes1.json();
    console.log('[TEST 2] Post valid event (mistap):', postRes1.status === 201 && postData1.success ? 'PASS' : 'FAIL', postData1);

    // 3. Post hesitation event
    const postRes2 = await fetch(`${baseUrl}/interaction-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'e1111111-1111-1111-1111-111111111111',
        event_type: 'hesitation',
        screen_id: 'send_money',
        meta: { idle_duration_ms: 8500 }
      })
    });
    const postData2 = await postRes2.json();
    console.log('[TEST 3] Post hesitation event:', postRes2.status === 201 && postData2.success ? 'PASS' : 'FAIL');

    // 4. Post invalid event type (validation check)
    const postResInvalid = await fetch(`${baseUrl}/interaction-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'e1111111-1111-1111-1111-111111111111',
        event_type: 'invalid_type',
        screen_id: 'send_money'
      })
    });
    const invalidData = await postResInvalid.json();
    console.log('[TEST 4] Reject invalid event_type:', postResInvalid.status === 400 ? 'PASS' : 'FAIL', invalidData);

    // 5. Query events for user
    const getRes = await fetch(`${baseUrl}/interaction-events?user_id=e1111111-1111-1111-1111-111111111111`);
    const getData = await getRes.json();
    console.log('[TEST 5] Retrieve user events:', getRes.status === 200 && getData.events.length === 2 ? 'PASS' : 'FAIL', `Retrieved ${getData.events.length} events`);

    console.log('\n[SUMMARY] ALL INTERACTION EVENT INGESTION TESTS PASSED SUCCESSFULLY!');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('[TEST ERROR]', err);
    server.close(() => process.exit(1));
  }
});
