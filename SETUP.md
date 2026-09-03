# SETUP.md — SAHAY-24 Environment & Workflow Setup

## Prerequisites

- Node.js (LTS) + npm/yarn
- Git
- A screen reader installed for testing:
  - **Windows:** NVDA (free) — download from nvaccess.org
  - **Mac:** VoiceOver (built in — enable via System Settings > Accessibility > VoiceOver)
- Antigravity (or your chosen AI-native IDE) configured with this repo

## Initial Setup

```bash
# Clone the repo
git clone <repo-url>
cd sahay-24

# Confirm you're on main and it's up to date
git checkout main
git pull

# Install dependencies
npm install

# Start the dev server
npm run dev
```

## Git Branching Workflow — Required for Every Task

**`main` is the default branch and must always stay in a working, demoable state.**

### Before starting ANY feature, fix, or task:

```bash
git checkout main
git pull
git checkout -b feature/<short-description>
```

Examples:
```bash
git checkout -b feature/screen-reader-login
git checkout -b feature/voice-payment-readback
git checkout -b feature/keyboard-nav-send-money
git checkout -b fix/keyboard-trap-modal
git checkout -b chore/extend-otp-timeout
```

### While working:

- Commit incrementally, don't wait until the feature is fully done to make your first commit
- Commit message format: `<type>: <short description>`
  - `feat: add ARIA labels to balance page`
  - `fix: restore focus after send-money modal closes`
  - `chore: increase OTP timeout to 90 seconds`

### When the feature works end-to-end:

```bash
git checkout main
git pull
git merge feature/<short-description>
# or open a PR if you're using GitHub/GitLab review flow
git branch -d feature/<short-description>
```

### Rules, no exceptions:

- Never commit directly to `main`
- Never force-push to `main`
- One branch = one feature/task — don't bundle unrelated changes
- Branch first even for "quick" fixes — this is what keeps `main` demo-safe at every hour of the 24-hour build

## Track Setup

### Dhyanesh's track — Accessibility markup, keyboard nav, detection

```bash
git checkout -b feature/screen-reader-login
```
Start with the login page. Test with NVDA/VoiceOver turned on as you build — after every meaningful change, not just at the end. Reference the checklist in `CONTEXT.md`.

### Oviam's track — Voice layer, plain-language UI

```bash
git checkout -b feature/voice-payment-readback
```
Reuse the Bhashini/Whisper TTS+ASR integration pattern from prior projects. Start with the send-money page's payment readback flow.

## Testing Checklist Before Any Merge to `main`

- [ ] Feature works with a mouse
- [ ] Feature works with keyboard only (unplug the mouse and verify)
- [ ] Feature works with a screen reader turned on
- [ ] No console errors
- [ ] Doesn't break any of the other 2 pages

## Demo-Day Environment Checklist

- [ ] `main` branch checked out, fully merged, and tested end-to-end at least 3 times
- [ ] Screen reader (NVDA/VoiceOver) enabled and ready to switch on live
- [ ] Mouse physically ready to unplug for the keyboard-only demo moment
- [ ] Voice/audio output tested on the actual demo machine and speakers, not just your dev laptop
- [ ] Backup: a screen-recorded video of the full flow working, in case live demo hardware fails
