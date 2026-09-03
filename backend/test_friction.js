/**
 * SAHAY-24 Friction Scoring Engine — Unit Tests
 *
 * Tests the computeFrictionScore function with synthetic event sequences
 * covering all three tiers: standard (<30), simplified (30–59), voice_offer (≥60).
 *
 * Run: node test_friction.js
 */

process.env.NODE_ENV = 'test';
const { computeFrictionScore, scoreTier } = require('./frictionScore');

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  const symbol = ok ? '✓' : '✗';
  const status = ok ? 'PASS' : 'FAIL';
  if (ok) {
    passed++;
    console.log(`  ${symbol} [${status}] ${description}`);
  } else {
    failed++;
    console.error(`  ${symbol} [${status}] ${description}`);
    console.error(`         Expected: ${JSON.stringify(expected)}`);
    console.error(`         Actual:   ${JSON.stringify(actual)}`);
  }
}

function makeEvent(event_type, meta = {}) {
  return { event_type, meta, timestamp: new Date().toISOString() };
}

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Score Tier Mapping
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── scoreTier() mapping ──────────────────────────────────');
assert('score  0 → standard',    scoreTier(0),  'standard');
assert('score 15 → standard',    scoreTier(15), 'standard');
assert('score 29 → standard',    scoreTier(29), 'standard');
assert('score 30 → simplified',  scoreTier(30), 'simplified');
assert('score 45 → simplified',  scoreTier(45), 'simplified');
assert('score 59 → simplified',  scoreTier(59), 'simplified');
assert('score 60 → voice_offer', scoreTier(60), 'voice_offer');
assert('score 99 → voice_offer', scoreTier(99), 'voice_offer');

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Empty Event List
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── Empty event list ─────────────────────────────────────');
{
  const result = computeFrictionScore([]);
  assert('empty → score 0',        result.score, 0);
  assert('empty → tier standard',  result.tier,  'standard');
}

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Individual Signal Weights
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── Individual signal weights ────────────────────────────');
{
  // Single mistap = +20
  const r = computeFrictionScore([makeEvent('mistap')]);
  assert('1× mistap → score 20',   r.score, 20);
  assert('1× mistap → standard',   r.tier,  'standard');
}
{
  // Single hesitation = +15
  const r = computeFrictionScore([makeEvent('hesitation')]);
  assert('1× hesitation → score 15',  r.score, 15);
  assert('1× hesitation → standard',  r.tier,  'standard');
}
{
  // Single back_nav (count=1, below threshold) → +0
  const r = computeFrictionScore([makeEvent('back_nav')]);
  assert('1× back_nav (below threshold) → score 0',  r.score, 0);
  assert('back_nav_scored should be false',            r.breakdown.back_nav_scored, false);
}
{
  // Two back_navs (count=2, hits threshold) → +20
  const r = computeFrictionScore([makeEvent('back_nav'), makeEvent('back_nav')]);
  assert('2× back_nav → score 20',   r.score, 20);
  assert('back_nav_scored true',     r.breakdown.back_nav_scored, true);
}
{
  // Three back_navs still only scores +20 (scored once)
  const r = computeFrictionScore([makeEvent('back_nav'), makeEvent('back_nav'), makeEvent('back_nav')]);
  assert('3× back_nav → score 20 (scored only once)', r.score, 20);
}
{
  // Single abandon_retry = +25
  const r = computeFrictionScore([makeEvent('abandon_retry')]);
  assert('1× abandon_retry → score 25',  r.score, 25);
  assert('1× abandon_retry → standard',  r.tier,  'standard');
}
{
  // Single erratic_scroll = +10
  const r = computeFrictionScore([makeEvent('erratic_scroll')]);
  assert('1× erratic_scroll → score 10',  r.score, 10);
  assert('1× erratic_scroll → standard',  r.tier,  'standard');
}

// ──────────────────────────────────────────────────────────────────────────────
// Test Suite: Tier Crossing Sequences (The Demoable Ones)
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── Realistic sequences → tier crossing ─────────────────');

{
  // "Slightly clumsy user" — still standard
  // 1× mistap (20) + 0 others = 20 → standard
  const events = [makeEvent('mistap')];
  const r = computeFrictionScore(events);
  assert('1× mistap → score 20, standard', r.score, 20);
  assert('tier: standard', r.tier, 'standard');
}

{
  // "Struggling user" — simplified tier
  // 1× mistap (20) + 1× hesitation (15) = 35 → simplified
  const events = [makeEvent('mistap'), makeEvent('hesitation')];
  const r = computeFrictionScore(events);
  assert('mistap + hesitation → score 35', r.score, 35);
  assert('tier: simplified', r.tier, 'simplified');
}

{
  // "Full struggle demo path" — voice_offer tier
  // 2× mistap (40) + 1× hesitation (15) + 2× back_nav (20, threshold) = 75 → voice_offer
  const events = [
    makeEvent('mistap'),
    makeEvent('mistap'),
    makeEvent('hesitation'),
    makeEvent('back_nav'),
    makeEvent('back_nav'),
  ];
  const r = computeFrictionScore(events);
  assert('2× mistap + hesitation + 2× back_nav → score 75', r.score, 75);
  assert('tier: voice_offer', r.tier, 'voice_offer');
}

{
  // Exact threshold: 60 → voice_offer
  // 2× mistap (40) + 2× erratic_scroll (20) = 60 → voice_offer
  const events = [
    makeEvent('mistap'),
    makeEvent('mistap'),
    makeEvent('erratic_scroll'),
    makeEvent('erratic_scroll'),
  ];
  const r = computeFrictionScore(events);
  assert('2× mistap + 2× erratic_scroll → score 60', r.score, 60);
  assert('score exactly 60 → voice_offer', r.tier, 'voice_offer');
}

{
  // One below voice_offer threshold: 55 → simplified
  // 2× mistap (40) + 1× erratic_scroll (10) + 1× hesitation (15) = 65, let's do:
  // 2× mistap (40) + 1× erratic_scroll (10) + 0 others = 50 → simplified? Let's try mistap x2 + hesitation = 55
  const events = [
    makeEvent('mistap'),
    makeEvent('mistap'),
    makeEvent('hesitation'),
  ];
  const r = computeFrictionScore(events);
  assert('2× mistap + hesitation → score 55', r.score, 55);
  assert('score 55 → simplified', r.tier, 'simplified');
}

{
  // Worst-case "heavy struggle" — all signals, high score
  // 3× mistap (60) + 2× hesitation (30) + 1× abandon_retry (25) + 3× back_nav (20) + 2× erratic_scroll (20)
  // = 60 + 30 + 25 + 20 + 20 = 155
  const events = [
    makeEvent('mistap'), makeEvent('mistap'), makeEvent('mistap'),
    makeEvent('hesitation'), makeEvent('hesitation'),
    makeEvent('abandon_retry'),
    makeEvent('back_nav'), makeEvent('back_nav'), makeEvent('back_nav'),
    makeEvent('erratic_scroll'), makeEvent('erratic_scroll'),
  ];
  const r = computeFrictionScore(events);
  assert('all signals combined → score 155', r.score, 155);
  assert('tier: voice_offer', r.tier, 'voice_offer');
  assert('mistap count 3', r.breakdown.mistap, 3);
  assert('hesitation count 2', r.breakdown.hesitation, 2);
  assert('back_nav count 3, scored once', r.breakdown.back_nav_count, 3);
  assert('abandon_retry count 1', r.breakdown.abandon_retry, 1);
  assert('erratic_scroll count 2', r.breakdown.erratic_scroll, 2);
}

{
  // Unknown event types are ignored gracefully
  const events = [{ event_type: 'unknown_signal', meta: {} }];
  const r = computeFrictionScore(events);
  assert('unknown event_type → score 0', r.score, 0);
}

// ──────────────────────────────────────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(55)}`);
const total = passed + failed;
if (failed === 0) {
  console.log(`✓ ALL ${total} FRICTION SCORING TESTS PASSED`);
} else {
  console.error(`✗ ${failed}/${total} tests FAILED`);
  process.exit(1);
}
