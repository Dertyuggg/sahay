# CONTEXT.md — SAHAY-24 Project Context

## Problem Statement

"Making Digital Banking Truly Accessible" — redesign digital banking experiences to enable elderly individuals and persons with visual, hearing, motor, or cognitive disabilities to independently and securely access essential financial services.

## Core Insight

Elderly users, blind users, and motor-impaired users have almost opposite needs. A screen reader does nothing for someone who's never used one. Voice confirmation does nothing for someone who's blind and needs a screen reader, not a voice assistant reading things at it. Building one generic "accessible mode" underserves all three groups. **This project builds three distinct, genuinely working tracks instead.**

## Scope: Exactly What's Being Built (Do Not Expand)

| Group | Feature | Why this one |
|---|---|---|
| Blind / visually impaired | Full screen-reader compatibility retrofit on 3 core pages + audio CAPTCHA alternative | Highest-leverage, most demoable, pure frontend/markup work |
| Elderly / low literacy | Voice-confirmed payment readback + plain-language mode toggle | Reuses existing Bhashini/voice stack from prior projects |
| Motor-impaired / no mobility | Full keyboard-only navigation + adjustable session/OTP timeout | Zero ML needed, low risk of breaking under time pressure |
| Cross-cutting | Automatic mode detection (screen-reader detection + interaction-friction detection) instead of a settings menu | Ties the three tracks into one coherent product instead of three disconnected demos |

**Explicitly cut, roadmap only — do not build:** switch-access device support, braille display testing, tagged-PDF statement generation, trusted-contact notifications, dialect coverage beyond one language, any page beyond the three below.

## The Three Pages (Exactly These, No Others)

1. **Login page** — tests keyboard nav, screen-reader labels, audio CAPTCHA
2. **Balance/dashboard page** — tests screen-reader readout of dynamic content (`aria-live`), plain-language mode
3. **Send-money page** — tests voice-confirmed payment flow, keyboard-only completion, extended OTP timeout

## Architecture

```
User arrives at any page
        │
        ▼
┌─────────────────────────┐
│  Detection Layer            │
│  - Screen-reader signal      │
│    (or manual v1 preference) │
│  - Interaction friction       │
│    (mis-taps, hesitation)     │
└──────────┬───────────────┘
           │
           ▼ (suggests, never forces)
┌─────────────────────────┐
│  Mode Router                 │
│  - Standard UI                │
│  - Plain-language mode         │
│  - Screen-reader-optimized     │
│    (always active as baseline) │
└──────────┬───────────────┘
           │
           ▼
┌─────────────────────────┐      ┌──────────────────────┐
│  Standard/Plain-Language UI │      │  Screen-Reader Layer    │
│  - Voice payment readback    │      │  - ARIA labels/live       │
│  - ASR yes/no confirmation    │      │    regions                │
│  - Extended OTP timeout        │      │  - Keyboard nav            │
└─────────────────────────┘      │  - Audio CAPTCHA           │
                                    └──────────────────────┘
```

Note: screen-reader accessibility (ARIA, keyboard nav) is a baseline that applies to ALL users at all times — it is not a "mode" someone opts into, unlike plain-language mode and voice confirmation which are adaptive/opt-in layers on top.

## Team & Split (Swapped From Usual Pattern — Confirm This Is Still Correct)

This project uses a **different split** than prior projects (Swara, RAKSHA, SAHAY general plan), where Dhyanesh usually owns backend/infra and Oviam owns frontend/voice. For this build specifically:

| Track | Owner | Reason for the swap |
|---|---|---|
| Accessibility markup, keyboard nav, detection logic | Dhyanesh | This work is closer to structured, methodical frontend engineering than infra |
| Voice layer, plain-language UI | Oviam | Reuses voice-stack experience built across prior projects |

## Tech Stack

- Frontend: React (reusing component library patterns from prior projects where compatible)
- Voice: existing Bhashini/Whisper TTS+ASR integration knowledge from prior builds
- No backend/database changes required for this build — this is a frontend/accessibility-layer project, not a new data-model project
- Screen-reader testing: NVDA (Windows) or VoiceOver (Mac) — required, not optional, tested continuously during build

## Concrete Build Checklist

**Screen-reader retrofit (apply to all 3 pages):**
- [ ] Every `<button>`/`<a>` has visible text OR an `aria-label`
- [ ] Every `<img>` has meaningful `alt` text (or `alt=""` if purely decorative)
- [ ] Every `<input>` has an associated `<label>`
- [ ] Heading tags follow logical order, not styled-to-look-right order
- [ ] Dynamic content updates wrapped in `aria-live="polite"`
- [ ] Modal dialogs trap focus and return focus on close
- [ ] Skip-navigation link is the first focusable element on every page

**Keyboard navigation:**
- [ ] Every interactive element reachable via Tab, in logical order
- [ ] Every action completable via Enter/Space, no mouse-only interactions
- [ ] Visible focus indicator on every focused element
- [ ] No keyboard traps

## Demo Script (What the Build Must Support)

1. Frame: three groups, one integration, three real tracks — not one generic mode
2. Live screen-reader walkthrough: login → balance, no mouse
3. Live keyboard-only walkthrough: complete send-money flow, no mouse, note the extended OTP timeout
4. Plain-language mode + voice-confirmed payment: "You are sending ₹2,000 to Ramesh — say yes to confirm"
5. Close: same app, same backend, three genuinely different accessible paths

## Known, Stated Limitations (Say These Out Loud in the Pitch, Don't Hide Them)

- Automatic screen-reader detection uses a manual one-time preference as a v1 stand-in, not true automatic detection — this is honest and roadmap-appropriate, not a gap to paper over
- Only 3 pages are covered — depth over breadth was the deliberate choice for 24 hours
- Only 1 language for the voice layer in this build

## Related Projects (For Context, Not This Build's Scope)

- [[swara]] — voice-native micro-commerce for rural MSMEs (source of the Bhashini/voice stack pattern)
- [[raksha]] — fraud/scam interception (separate problem statement, different project)
- [[surakshit]] — payment safety/accidental-transfer prevention (separate problem statement, different project)
