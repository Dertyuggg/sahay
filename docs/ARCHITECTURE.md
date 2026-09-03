# SAHAY-24 Technical Architecture

## System Overview
SAHAY-24 is a client-server web application designed with extreme accessibility and performance in mind.

### Frontend (Client)
- **Framework:** Vite + React
- **Styling:** Vanilla CSS 
  - *Why?* To maintain absolute control over CSS variables for dynamic font scaling and high-contrast theming without the overhead of heavy CSS frameworks.
- **Accessibility Layer:** 
  - `useAccessibility.js`: Global context managing font-size multipliers and contrast themes.
  - `VoiceNavigator.jsx`: Component wrapping the Web Speech API for TTS (Text-to-Speech).

### Backend (Server)
- **Framework:** Node.js + Express
- **API:** RESTful JSON API
- **Data:** In-memory mock data (for hackathon speed), abstracted behind a data access layer for easy swapping to a real DB later.

## Data Flow
1. User interacts via Keyboard, Voice, or Touch (large hit areas).
2. Frontend dispatches an accessible event.
3. If data is required, fetch from Express API.
4. Express validates request and returns JSON.
5. React updates state.
6. Screen readers announce state change via ARIA Live regions.

## Component Diagram
```
[ User Input (Keyboard/Voice/Touch) ]
               |
               v
+-----------------------------------+
|         React Frontend            |
| - A11y Context (Theme, Size)      |
| - Semantic HTML / ARIA UI         |
+-----------------------------------+
               |
          HTTP / REST
               |
               v
+-----------------------------------+
|         Express Backend           |
| - Auth Middleware (Mock)          |
| - Transaction Controllers         |
+-----------------------------------+
               |
               v
      [ JSON Mock Database ]
```
