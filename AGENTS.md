# AGENTS.md — SAHAY-24 Build Rules for AI Coding Agents

This file tells any AI coding agent (Antigravity, Claude, Copilot, Cursor, etc.) working on this repo how to behave. Read this before generating or modifying any code.

---

## 0. Git Workflow — Follow This Exactly, No Exceptions

- **`main` is the default branch and is always in a working, demoable state.** Never commit directly to `main`.
- **Before starting any new feature, task, or fix, create a new branch from `main` first.** Do not start writing code on `main` or on an unrelated branch.
- **Branch naming convention:**
  - `feature/<short-description>` — new functionality (e.g. `feature/screen-reader-login`, `feature/voice-payment-readback`)
  - `fix/<short-description>` — bug fixes (e.g. `fix/keyboard-trap-modal`)
  - `chore/<short-description>` — non-feature work: config, docs, dependencies (e.g. `chore/update-setup-md`)
- **One branch = one feature/task.** Do not bundle unrelated changes into the same branch.
- **Workflow for every task:**
  1. `git checkout main`
  2. `git pull` (if remote exists)
  3. `git checkout -b feature/<short-description>`
  4. Do the work, commit incrementally with clear messages
  5. Open a PR / merge back into `main` only once the feature works end-to-end
  6. Delete the feature branch after merging
- **Never force-push to `main`.**
- **If asked to "just fix this quickly," still branch first.** There is no exception for small changes — the branch-first rule exists specifically so `main` never breaks during a live demo rehearsal.
- **Commit message format:** `<type>: <short description>` — e.g. `feat: add ARIA labels to login page`, `fix: restore focus after modal close`, `chore: add extended OTP timeout config`. Types: `feat`, `fix`, `chore`, `docs`, `refactor`.

---

## 1. What This Project Is

SAHAY-24 is a bank-website accessibility integration built for a 24-hour hackathon, targeting three distinct user groups with three distinct, genuinely working features — not one generic "accessible mode." See `CONTEXT.md` for full scope and architecture.

**Do not expand scope beyond what's in CONTEXT.md without being asked.** The plan deliberately covers 3 pages and 3 features — resist the urge to add a fourth "since it would be easy."

---

## 2. Team & Ownership

The primary developer interacting with the agent in this session is **Dhyanesh**.

| Track | Owner | Scope & Responsibilities |
|---|---|---|
| **Backend / Friction Logic / Infra** | **Dhyanesh (Active User)** | • Supabase schema: `users`, `interaction_events`, `saved_contacts`, `mock_balances`<br>• Event ingestion: `POST /interaction-events`<br>• Friction scoring engine: `GET /friction-score`<br>• Banking task executor: `POST /execute-task`<br>• Backend edge cases, concurrency, and score hardening |
| **Frontend / Adaptive UI / Voice** | **Oviam** | • Wireframes and 3 UI tiers: `standard`, `simplified`, `voice_offer`<br>• Client telemetry capture (taps, coordinates, retries)<br>• Voice assistant flow (ASR, TTS readback, confirm-before-act)<br>• Simulate struggle manual trigger button |

**Important Rules for Dhyanesh's Agent:**
1. **Default focus**: Prioritize Dhyanesh's backend, schema, scoring engine, and task execution endpoints.
2. **Cross-track changes**: If asked to modify Oviam's frontend/voice files (`frontend/`), confirm with Dhyanesh before proceeding unless it is wiring contracts or requested explicitly.
3. **Friction Scoring Contract**:
   - Mis-tap near target: `+20` per occurrence
   - Long hesitation (>8s idle): `+15`
   - Repeated back-navigation (2+): `+20`
   - Task abandon + retry within 2 min: `+25`
   - Slow/erratic scrolling: `+10`
   - Score Tiers: `<30` = `standard`, `30–59` = `simplified`, `≥60` = `voice_offer`
4. **Git workflow**: Always checkout a new `feature/<short-description>` branch before writing any code!

---

## 3. Code Standards

- **Accessibility work is not optional polish — it is the product.** Every component touched must be manually checked against the checklist in `CONTEXT.md` Section "Concrete Build Checklist" before being considered done.
- **Every interactive element needs a keyboard path.** No mouse-only or drag-only interactions, ever, on any of the 3 core pages (login, balance, send-money).
- **Every icon-only button needs an `aria-label`.** No exceptions, even for "obvious" icons.
- **Voice features always need a non-voice fallback.** If ASR/TTS fails or isn't available, the user must be able to complete the task via tap/text instead.
- **Test with a screen reader turned on as you build, not just at the end.** NVDA (Windows) or VoiceOver (Mac) — do not rely on automated linting (e.g. axe-core) alone; it catches roughly a third of real issues.
- **Never strip the default focus outline without replacing it with an equally visible custom one.**

## 4. What NOT to Build (Explicitly Out of Scope for This 24-Hour Build)

Do not implement these even if asked to "just add it quickly" — they were deliberately cut for time. If the user wants one added, confirm it replaces something else in scope, since the plan has no slack:

- Switch-access device support
- Braille display testing
- Tagged-PDF statement generation
- Trusted-contact notifications
- Dialect coverage beyond one language
- Any page beyond login, balance, and send-money

## 5. When in Doubt

Re-read `CONTEXT.md` for the current scope and `SETUP.md` for environment/stack details before assuming. If a request conflicts with the scope in `CONTEXT.md`, flag the conflict to the user rather than silently expanding scope.
