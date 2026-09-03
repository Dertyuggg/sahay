# SAHAY — Stage-Wise Build Plan (2-Person Team)
**Team:** Oviam (Frontend / Adaptive UI / Voice) · Dhyanesh (Backend / Friction Logic / Infra)
**Total window:** ~36 hours · **Sync checkpoints:** every stage ends with a 10–15 min joint check-in before moving on.

Rule for both of you: **don't start a stage until the previous stage's exit criteria are met.** It's a hackathon, but this build has a hard dependency chain — voice can't be tested without the task executor, and the adaptive UI can't be tested without the friction score. Sequence discipline is the thing most likely to save you.

---

## Stage 0 — Setup & Alignment
**Window:** Hour 0–2 · **Goal:** Everyone building against the same contract before any UI or logic exists.

| Owner | Tasks |
|---|---|
| **Both** | Repo created, Supabase project created, shared `.env` template, agree on the 2 banking flows (balance check, send money to saved contact) — write them down, don't revisit |
| **Both** | Agree on the **interaction event schema** and **friction score contract** (see below) — this is the interface between your two tracks, lock it now |
| **Dhyanesh** | Sketch Supabase tables on paper/whiteboard: `users`, `interaction_events`, `saved_contacts`, `mock_balances` |
| **Oviam** | Sketch the 3 UI tiers (standard / simplified / voice-offer) as rough wireframes — doesn't need to be pretty, needs to be agreed |

**Interface contract to agree on right now** (write it in the repo README):
```
POST /interaction-events
{ user_id, event_type: "mistap"|"hesitation"|"back_nav"|"abandon_retry"|"erratic_scroll",
  screen_id, timestamp, meta: {...} }

GET /friction-score?user_id=...
→ { score: number, tier: "standard"|"simplified"|"voice_offer" }
```
Agreeing on this now means you can both build in parallel for the next 12 hours without blocking each other.

**Exit criteria:** repo + Supabase live, both people can read/write to it, event schema and score contract written down and agreed.

---

## Stage 1 — Foundation Build (Parallel)
**Window:** Hour 2–6 · **Goal:** Each track has its own core data flowing, independently testable.

**Dhyanesh — Backend foundation**
- [ ] Supabase schema live: `users`, `interaction_events`, `saved_contacts`, `mock_balances`
- [ ] Seed data: 1–2 mock users, 2–3 saved contacts each, starting balances
- [ ] Edge Function or API route that accepts `POST /interaction-events` and writes rows
- [ ] Quick sanity check: insert events via `curl`/Postman, confirm they land in the table

**Oviam — Frontend foundation**
- [ ] React app scaffolded, routing for the demo screens (balance, send money)
- [ ] Interaction telemetry capture wired: tap coordinates, timestamps, retry count, back-navigation count as local state first (don't worry about sending to backend yet)
- [ ] Standard-tier UI built for both flows (this is your baseline — build it well, the other tiers are variations of it)

**Checkpoint (end of Stage 1, ~15 min):** Dhyanesh shows events landing in Supabase from a manual test call. Oviam shows telemetry values updating live in the console as they tap around. Don't connect them yet — just confirm both halves work alone.

**Exit criteria:** backend can receive and store an event; frontend can detect and log an event locally.

---

## Stage 2 — Core Logic Build (Parallel)
**Window:** Hour 6–10 · **Goal:** The friction score is real; the adaptive UI tiers are real. Still not wired together.

**Dhyanesh — Friction scoring engine**
- [ ] Implement the weighted scoring function exactly as specced:

| Signal | Weight |
|---|---|
| Repeated mis-tap near target | +20 per occurrence |
| Long hesitation (>8s idle) | +15 |
| Repeated back-navigation (2+) | +20 |
| Task abandon + retry within 2 min | +25 |
| Slow/erratic scrolling | +10 |

- [ ] Score ≥60 → `voice_offer`, 30–59 → `simplified`, <30 → `standard`
- [ ] `GET /friction-score?user_id=` returns current tier
- [ ] Unit-test it with a few synthetic event sequences (this table is demoable on its own — screenshot it working before you move on)

**Oviam — Adaptive UI tiers**
- [ ] Build `simplified` tier: larger tap targets, fewer fields per screen, plain-language labels — make the contrast with `standard` dramatic and obvious, not subtle
- [ ] Build `voice_offer` tier: the "Would you like to do this by speaking instead?" prompt screen — explicit opt-in, no auto-switch
- [ ] Wire local telemetry events to actually `POST` to `/interaction-events` now that Dhyanesh's endpoint is live

**Checkpoint (end of Stage 2):** Dhyanesh demos the score function with hardcoded event sequences producing all 3 tiers correctly. Oviam demos all 3 UI tiers rendering side by side (even if triggered manually via a dropdown for now).

**Exit criteria:** score function is correct against test cases; all 3 UI tiers exist and look distinct.

---

## Stage 3 — Task Executor & Voice Flow (Parallel)
**Window:** Hour 10–14 · **Goal:** The two banking tasks actually "execute" (mocked), and voice can trigger them.

**Dhyanesh — Banking task executor**
- [ ] `POST /execute-task` accepting `{ intent: "check_balance"|"send_money", params }`
- [ ] Balance check → returns mocked balance for user
- [ ] Send money → validates against `saved_contacts`, deducts from `mock_balances`, returns confirmation payload
- [ ] Simple rule-based intent-to-task mapping (no LLM agent needed — keep it narrow)

**Oviam — Voice assistant flow**
- [ ] Wire ASR (Bhashini, Whisper as failover) to capture speech input
- [ ] Build the confirm-before-acting flow: transcribe → match intent → **read back in plain language** → wait for explicit yes → call `/execute-task`
- [ ] Text-to-speech for the confirmation and result readout
- [ ] **Fallback for ASR failure:** if ASR errors or confidence is low, drop to a text input box instead of crashing — build this now, not during polish

**Checkpoint (end of Stage 3):** Dhyanesh demos `/execute-task` via Postman for both flows. Oviam demos one full voice interaction (mic → confirm → mocked response, even if `/execute-task` is stubbed with a fake response at this point).

**Exit criteria:** both banking tasks executable via API; voice flow runs start-to-finish for at least one flow, including the confirm step.

---

## Stage 4 — Full Integration
**Window:** Hour 14–20 · **Goal:** Everything is now one system. This is the highest-risk stage — budget real time for it.

- [ ] Connect the full chain: interaction events → friction score → adaptive UI trigger → (if user accepts) voice assistant → intent match → confirm → task executor → spoken/visual confirmation
- [ ] Build the **"simulate struggle" fallback trigger** now, even if real telemetry works — a manual button that forces mis-taps/hesitation into the event stream. This is your insurance policy for the live demo (Section 10 of the original plan flags this as the first thing to cut down to, so pre-build it rather than scrambling later)
- [ ] Run the deliberate struggle path end-to-end: mis-tap twice → hesitate → go back once → watch score climb → see UI shift to `voice_offer` → accept → complete a task by voice
- [ ] Test both voice flows end-to-end in at least one dialect
- [ ] Test the "confident user" path in parallel — standard tier, no interruption, task completes normally

**Checkpoint (end of Stage 4):** Full demo path runs live, once, start to finish, without anyone touching a debug console. If it doesn't, that's what Stage 5 is for — don't panic, don't add scope.

**Exit criteria:** the exact demo sequence (Section 11 of the plan) runs successfully at least once, live.

---

## Stage 5 — Testing & Hardening
**Window:** Hour 20–24 · **Goal:** Make the one path that matters unbreakable. Stop building features.

| Owner | Tasks |
|---|---|
| **Both** | Run the full demo sequence 5+ times back to back; log every failure point |
| **Dhyanesh** | Harden the score function and task executor against edge cases surfaced above (e.g., double-submits, race conditions between events and score reads) |
| **Oviam** | Harden ASR fallback, make sure the "simulate struggle" button is reliable and fast — this is what you'll actually use on stage if live telemetry is flaky |
| **Both** | Decide now, explicitly, what's cut if something is still broken (see cut list below) — don't decide this live on stage |

**Cut list, in order, if you're still behind:**
1. Telemetry unreliable → use the manual "simulate struggle" button as the demo path (still shows the real adaptive logic underneath)
2. ASR flaky → use pre-recorded sample audio clips instead of live mic
3. Intent parsing fragile → cut to 1 voice flow (balance check) instead of 2
4. UI tiers look too similar → spend remaining polish time only on making `standard` vs `simplified` contrast obvious

**Never cut:** the live adaptive-UI-switch moment, and the voice confirm-before-acting step. Everything else is negotiable; these two carry the pitch.

**Exit criteria:** demo sequence succeeds 3 times in a row without manual intervention beyond the agreed fallback buttons.

---

## Stage 6 — Polish, Deck, Rehearsal
**Window:** Hour 24–30 · **Goal:** Make it presentable and make sure you can say it under pressure.

- [ ] Visual polish pass on `standard` vs `simplified` contrast (biggest visual "wow" moment — spend disproportionate time here)
- [ ] Build the 6–7 slide deck: Problem → Insight (adaptive, not static) → Solution → Live Demo → Architecture → Impact/Roadmap → Ask
- [ ] Prepare answers for the anticipated judge questions (toggle vs detection, privacy, voice consent, scaling beyond 2 flows) — write one-liners, don't improvise these live
- [ ] **Rehearse the full demo 3+ times, timed**, with one person narrating and one person driving — swap roles once so either of you can present if needed
- [ ] Sleep in shifts — schedule this explicitly, don't let it slide

**Exit criteria:** both people can run the demo solo if needed; deck is done; timing fits the slot.

---

## Stage 7 — Buffer
**Window:** Hour 30–36 · **Goal:** Reserved slack — budgeted from the start, not a sign something went wrong.

- [ ] Final full run-through, morning-of
- [ ] Charge everything, check venue wifi/mic, have offline fallback (recorded demo video) ready in case live demo infra fails on stage
- [ ] Nothing new gets built here — only fixes to what already exists

---

## One-Page Summary Table

| Stage | Hours | Oviam | Dhyanesh | Sync checkpoint |
|---|---|---|---|---|
| 0. Setup | 0–2 | Wireframes | Schema sketch | Contract agreed |
| 1. Foundation | 2–6 | Telemetry capture + standard UI | Supabase + event ingest | Both halves work alone |
| 2. Core logic | 6–10 | Simplified + voice-offer tiers | Friction scoring engine | Score correct, tiers distinct |
| 3. Task + voice | 10–14 | ASR + confirm-before-act flow | Task executor + intent mapping | Both APIs + 1 voice flow work |
| 4. Integration | 14–20 | Wire full chain + struggle simulator | Wire full chain | Full demo path runs once, live |
| 5. Hardening | 20–24 | Harden ASR fallback | Harden score/executor | Demo succeeds 3x in a row |
| 6. Polish | 24–30 | Visual polish | Deck content | Either person can present solo |
| 7. Buffer | 30–36 | — | — | Final run-through, offline backup ready |
