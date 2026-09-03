# SAHAY-24 Accessibility Checklist

This checklist ensures we meet our rigorous standards for the three target user personas during the 24-hour hackathon.

## 1. Blind / Visually Impaired
- [ ] **Semantic HTML:** All pages use proper headings (`<h1>` to `<h6>`) in sequential order.
- [ ] **ARIA Roles:** Complex widgets (like custom tabs or modals) use correct `role`, `aria-expanded`, and `aria-hidden` attributes.
- [ ] **Alt Text:** Every non-decorative image or icon has meaningful `alt` text. Decorative images have `alt=""`.
- [ ] **Screen Reader Testing:** Verify navigation flow makes sense using VoiceOver or NVDA.
- [ ] **Forms:** All inputs have explicitly associated `<label>` elements.

## 2. Elderly / Low Literacy
- [ ] **Typography:** Base font size is at least 18px. High legibility fonts (e.g., Inter, Roboto).
- [ ] **Contrast:** Text-to-background contrast ratio meets at least WCAG AA (4.5:1), aiming for AAA (7:1).
- [ ] **Cognitive Load:** Only one primary call-to-action (CTA) per screen.
- [ ] **Iconography:** Universal icons paired with explicit text labels.
- [ ] **Error Handling:** Clear, plain-language error messages (avoiding technical jargon).

## 3. Motor-Impaired
- [ ] **Keyboard Nav:** Complete operability via `Tab`, `Shift+Tab`, `Enter`, and `Space`.
- [ ] **Focus Indication:** Highly visible `:focus` or `:focus-visible` states. No `outline: none` without a custom fallback.
- [ ] **Hit Areas:** All interactive elements (buttons, links) are at least 44x44 CSS pixels.
- [ ] **Gestures:** No actions require complex gestures (swiping, multi-touch). Everything can be triggered by a single click/tap.
- [ ] **Time Limits:** No timeout-based actions without the ability to pause, stop, or extend the time.
