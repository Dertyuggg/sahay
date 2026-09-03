/**
 * SAHAY-24 Friction Scoring Engine
 *
 * Computes a weighted friction score from a user's interaction event history
 * and maps it to a UI tier.
 *
 * Scoring Contract (from AGENTS.md):
 *   mistap            +20 per occurrence
 *   hesitation        +15 per occurrence (event fired when >8s idle detected client-side)
 *   back_nav          +20 when count >= 2 (only scored once per session)
 *   abandon_retry     +25 per occurrence (client fires when task abandoned + retried < 2 min)
 *   erratic_scroll    +10 per occurrence
 *
 * Tiers:
 *   score < 30   → "standard"
 *   30 <= score < 60 → "simplified"
 *   score >= 60  → "voice_offer"
 */

const WEIGHTS = {
  mistap: 20,
  hesitation: 15,
  back_nav: null, // special: +20 only if total back_nav count >= 2
  abandon_retry: 25,
  erratic_scroll: 10,
};

const BACK_NAV_THRESHOLD = 2;
const BACK_NAV_SCORE = 20;

/**
 * Calculate friction score from an array of interaction event objects.
 * Each event: { event_type, timestamp, meta, ... }
 *
 * @param {Array} events - Array of interaction_event rows, newest first or any order.
 * @returns {{ score: number, tier: string, breakdown: object }}
 */
function computeFrictionScore(events) {
  const breakdown = {
    mistap: 0,
    hesitation: 0,
    back_nav_count: 0,
    back_nav_scored: false,
    abandon_retry: 0,
    erratic_scroll: 0,
  };

  for (const event of events) {
    switch (event.event_type) {
      case 'mistap':
        breakdown.mistap += 1;
        break;
      case 'hesitation':
        breakdown.hesitation += 1;
        break;
      case 'back_nav':
        breakdown.back_nav_count += 1;
        break;
      case 'abandon_retry':
        breakdown.abandon_retry += 1;
        break;
      case 'erratic_scroll':
        breakdown.erratic_scroll += 1;
        break;
      default:
        break;
    }
  }

  // Apply weights
  let score = 0;
  score += breakdown.mistap * WEIGHTS.mistap;
  score += breakdown.hesitation * WEIGHTS.hesitation;
  score += breakdown.abandon_retry * WEIGHTS.abandon_retry;
  score += breakdown.erratic_scroll * WEIGHTS.erratic_scroll;

  // back_nav: only contributes +20 *once* if count >= threshold
  if (breakdown.back_nav_count >= BACK_NAV_THRESHOLD) {
    score += BACK_NAV_SCORE;
    breakdown.back_nav_scored = true;
  }

  const tier = scoreTier(score);

  return { score, tier, breakdown };
}

/**
 * Map a numeric friction score to a UI tier string.
 * @param {number} score
 * @returns {"standard"|"simplified"|"voice_offer"}
 */
function scoreTier(score) {
  if (score >= 60) return 'voice_offer';
  if (score >= 30) return 'simplified';
  return 'standard';
}

module.exports = { computeFrictionScore, scoreTier, WEIGHTS, BACK_NAV_THRESHOLD, BACK_NAV_SCORE };
