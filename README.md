# SAHAY-24
A 24-hour banking accessibility hackathon project designed specifically for three core user groups: blind/visually impaired, elderly/low literacy, and motor-impaired individuals.

## The Problem
Modern banking applications are highly complex and fundamentally exclude individuals with diverse accessibility needs. SAHAY-24 re-imagines digital banking from the ground up, prioritizing extreme accessibility without sacrificing utility.

## Key Features
- **Voice-First Navigation (Blind/Visually Impaired):** Complete integration of text-to-speech, ARIA role optimization, and voice-command prompts.
- **High-Clarity Interface (Elderly/Low Literacy):** Icon-driven actions, large typography, and simplified workflows to eliminate cognitive overload.
- **Precision Motor Support (Motor-Impaired):** Large hit areas, full keyboard navigation, and prevention of complex gesture requirements.

## Tech Stack
- **Frontend**: React (Vite), Vanilla CSS (High Contrast Design System)
- **Backend**: Node.js, Express
- **Mock DB**: JSON-based in-memory state for rapid hackathon iteration

## Getting Started
### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm start
```

## Stage 0 Alignment Contracts

**Agreed Banking Flows:**
1. Balance Check
2. Send Money to Saved Contact

**Interaction Event Schema & Friction Score Contract:**
```json
POST /interaction-events
{ 
  "user_id": "string",
  "event_type": "mistap"|"hesitation"|"back_nav"|"abandon_retry"|"erratic_scroll",
  "screen_id": "string",
  "timestamp": "string",
  "meta": {} 
}

GET /friction-score?user_id=...
-> { 
  "score": "number", 
  "tier": "standard"|"simplified"|"voice_offer" 
}
```
