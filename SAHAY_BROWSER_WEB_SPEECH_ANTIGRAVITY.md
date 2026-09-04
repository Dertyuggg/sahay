# SAHAY — Browser Web Speech API Live Voice Assistant
## Detailed Antigravity Implementation Guide

## 1. Objective

Replace the current Hugging Face Whisper/API-based voice transcription approach in SAHAY with the browser's native Web Speech API.

The goal is live transcription while the user is speaking.

The user should be able to:

1. Press a microphone button.
2. Speak naturally.
3. See words appear on the screen while speaking.
4. Continue speaking without recording or uploading audio.
5. Stop speaking by pressing the microphone button again or when recognition ends.
6. Pass the final transcript into SAHAY's existing intent/parser flow.
7. Keep all existing banking confirmation and security behavior unchanged.

Prioritize:

- Fast response
- Live/interim transcription
- Accessibility
- Clear visual feedback
- Minimal backend complexity
- No paid speech-to-text API
- No audio-file upload
- No Hugging Face dependency for voice transcription

---

## 2. Architecture Decision

Do NOT use Hugging Face Whisper for the live voice feature.

Do NOT create a record → stop → upload → transcribe workflow.

Do NOT send microphone audio to the Express backend for transcription.

Use:

```text
Browser microphone
        ↓
Web Speech API
        ↓
Live transcript
        ↓
Existing SAHAY intent parser
        ↓
Existing banking flow
        ↓
Existing confirmation/security system
```

The backend remains responsible for existing application/API operations such as balance retrieval and money transfers.

The browser handles speech recognition.

---

## 3. Technology

Use:

```js
window.SpeechRecognition || window.webkitSpeechRecognition
```

Configure:

```js
recognition.lang = "en-IN";
recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 1;
```

`interimResults = true` is essential because SAHAY needs text to appear while the user is still speaking.

---

## 4. First Step — Inspect the Existing Repository

Before modifying anything:

1. Inspect the complete repository structure.
2. Identify the frontend entry point.
3. Identify the main App/component.
4. Find all voice-related files.
5. Find microphone button components.
6. Find existing speech/Whisper/Hugging Face code.
7. Find the existing intent parser.
8. Find balance-check handling.
9. Find send-money handling.
10. Find confirmation/security handling.
11. Find backend API routes.
12. Find existing styling for the voice interface.

Do not immediately create new files.

First understand how the current application works.

Do not rewrite unrelated parts of the application.

---

## 5. Remove/Disable Hugging Face Voice Dependency

The existing Hugging Face Whisper implementation should no longer be used for live transcription.

Search for:

```text
huggingface
@huggingface/inference
Whisper
HF_TOKEN
HF_MODEL
HF_PROVIDER
transcribe
/api/transcribe
multer
audio upload
FormData
```

Determine whether each item is actually used elsewhere.

Remove or disable the Hugging Face voice implementation only if it is specifically related to speech transcription.

Do not remove unrelated dependencies or APIs.

The final voice system must work without:

- Hugging Face API
- HF token
- Whisper API calls
- audio uploads
- server-side transcription
- paid speech-to-text services

If `.env` contains an HF token used only for this feature, stop depending on it.

Never expose a secret token in frontend code.

---

## 6. Create a Reusable Speech Recognition Layer

Prefer a small reusable hook or service instead of putting all recognition logic inside a large UI component.

For React, a possible structure is:

```text
src/
  components/
  hooks/
    useSpeechRecognition.js
```

Use the existing project structure if it already has a suitable pattern.

The speech layer should expose state and controls approximately like:

```text
transcript
interimTranscript
isListening
isSupported
startListening
stopListening
resetTranscript
error
```

Do not create duplicate speech-recognition implementations.

---

## 7. Browser Compatibility

Safely detect support:

```js
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
```

If unavailable, do not crash the application.

Expose a clear message such as:

```text
Speech recognition is not supported in this browser.
```

The rest of SAHAY must continue working.

---

## 8. Recognition Configuration

Use:

```js
recognition.lang = "en-IN";
recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 1;
```

Start with English India recognition.

Do not introduce a complex language-selection system unless the existing application already has one.

---

## 9. Live Transcription

The most important requirement is that words appear while the user is speaking.

Recognition produces:

- Final results
- Interim results

Final results are confirmed speech.

Interim results are temporary results that can change.

Example:

```text
User speaks:
"What is my balance"
```

The UI should progressively show something like:

```text
What
```

then:

```text
What is
```

then:

```text
What is my
```

then:

```text
What is my balance
```

Do not wait until the user stops speaking to show text.

---

## 10. Result Processing

Use the recognition `onresult` event.

Conceptually:

```js
recognition.onresult = (event) => {
  let finalText = "";
  let interimText = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;

    if (event.results[i].isFinal) {
      finalText += transcript;
    } else {
      interimText += transcript;
    }
  }
};
```

Integrate this with React state correctly.

Avoid stale-state problems.

Do not repeatedly append the entire recognition result if the browser is already returning previous results.

Use `event.resultIndex` correctly.

---

## 11. Separate Final and Interim Text

Maintain a distinction between:

```text
final transcript
```

and:

```text
interim transcript
```

Example:

```text
Final transcript:
What is my

Interim transcript:
balance
```

Display them together:

```text
What is my balance
```

When the browser confirms "balance", move it into the final transcript.

This prevents duplicated text.

---

## 12. React State

Use existing equivalent state if it already exists.

A typical structure is:

```js
const [transcript, setTranscript] = useState("");
const [interimTranscript, setInterimTranscript] = useState("");
const [isListening, setIsListening] = useState(false);
const [speechError, setSpeechError] = useState("");
```

Do not create duplicate state unnecessarily.

---

## 13. Starting Recognition

When the user activates the microphone:

```js
recognition.start();
```

Before starting, ensure recognition is not already running.

Set:

```text
isListening = true
```

Clear an old speech error.

Do not start multiple recognition instances simultaneously.

The microphone button must visibly change state.

Example:

```text
Idle:
🎤 Speak

Listening:
🔴 Listening...
```

Use the existing SAHAY visual style.

---

## 14. Stopping Recognition

When the user presses the microphone button while listening:

```js
recognition.stop();
```

Then:

```text
isListening = false
```

Keep the final transcript visible.

Do not erase the transcript when stopping.

---

## 15. Recognition End

Implement:

```js
recognition.onend = ...
```

The browser may stop recognition automatically.

For the first implementation, prefer predictable behavior.

If `isListening` is intentionally false, do not restart.

If automatic restart is implemented, protect against:

- Infinite restart loops
- Duplicate recognition instances
- Repeated commands
- Browser errors
- Component unmounting

Do not implement aggressive auto-restart unless it is genuinely required.

---

## 16. Error Handling

Implement:

```js
recognition.onerror = (event) => {
  ...
};
```

Handle common errors:

```text
not-allowed
no-speech
audio-capture
network
aborted
```

Show understandable messages.

Examples:

```text
Microphone permission was denied.
```

```text
I didn't hear anything. Please try again.
```

```text
Microphone could not be accessed.
```

Do not expose raw browser exceptions to normal users.

---

## 17. Microphone Permission

Chrome may request microphone permission the first time.

Do not bypass browser permissions.

If permission is denied:

- Stop listening
- Update the UI
- Display an accessible error
- Allow the user to try again

Do not repeatedly request permission.

---

## 18. UI Requirements

The listening state must be obvious.

At minimum:

### Idle

```text
🎤 Tap to speak
```

### Listening

```text
🔴 Listening...
```

Only show "Processing..." if the existing application actually has a processing stage.

Do not make the interface look like it is uploading audio.

---

## 19. Live Transcript Display

Add or reuse a clear transcript area.

Example:

```text
You said:

What is my balance
```

During speech:

```text
You said:

What is my balance...
```

Interim text may be visually distinguished from final text, but it must remain readable.

The transcript should be suitable for:

- Visually impaired users
- Elderly users
- Low-literacy users
- Users with motor difficulties

Follow the existing SAHAY accessibility design.

---

## 20. Voice Command Integration

The speech system must not create a second command-processing system.

Final speech should be passed into the existing SAHAY intent parser.

Example:

```text
SpeechRecognition
        ↓
"what is my balance"
        ↓
Existing parser
        ↓
BALANCE_CHECK
        ↓
Existing balance flow
```

For:

```text
send 500 rupees to mom
```

the flow should remain:

```text
SpeechRecognition
        ↓
"send 500 rupees to mom"
        ↓
Existing parser
        ↓
SEND_MONEY
        ↓
Existing recipient/amount handling
        ↓
Existing confirmation
        ↓
Existing secure API operation
```

Do not bypass confirmation.

---

## 21. Banking Security

Do not change the existing security architecture.

Speech recognition only produces text.

The application must still follow:

```text
Intent detection
↓
Parameter extraction
↓
Validation
↓
Confirmation
↓
Secure backend API
↓
Transaction
```

Never implement:

```text
"Send ₹500 to Mom"
→ immediately transfer money
```

Instead:

```text
"Send ₹500 to Mom"
→ identify command
→ show confirmation
→ user confirms
→ existing transfer API
```

---

## 22. Speech Is Not Authentication

Do not treat speech recognition as authentication.

Do not assume that saying:

```text
"Yes"
```

is sufficient authorization if the existing application uses a stronger confirmation/security mechanism.

Do not add voice biometric authentication unless explicitly requested.

Do not remove existing authentication.

---

## 23. Prevent Duplicate Commands

Browser recognition may produce multiple final results.

Prevent accidental duplicate command execution.

For example:

```text
"What is my balance"
```

must produce one balance request, not several.

Do not process the same final transcript repeatedly.

---

## 24. When to Run the Intent Parser

Run the existing command parser on completed/final speech.

Do NOT execute banking actions from interim text.

For example, do not execute a transfer when the interim transcript is only:

```text
"send..."
```

while the user is still saying:

```text
"send 500 rupees to mom"
```

Interim text is for display only.

Final text is for command processing.

---

## 25. Command Boundary

For the initial implementation:

```text
User presses microphone
        ↓
User speaks command
        ↓
Final speech results arrive
        ↓
User stops microphone
        ↓
Process final transcript
```

If the existing application already has a submit/execute mechanism, integrate with it.

Do not create unnecessary end-of-command detection.

---

## 26. Balance Example

User:

```text
What is my balance?
```

Live display:

```text
What
```

Then:

```text
What is my
```

Then:

```text
What is my balance
```

Final processing:

```text
what is my balance
```

Existing parser identifies:

```text
BALANCE_CHECK
```

Existing balance API is called.

Existing UI displays the balance.

---

## 27. Send Money Example

User:

```text
Send 500 rupees to Mom
```

Live transcript:

```text
Send 500 rupees to Mom
```

Final parser:

```text
Intent: SEND_MONEY
Amount: 500
Recipient: Mom
```

Existing confirmation:

```text
Send ₹500 to Mom?

Confirm
Cancel
```

Only after confirmation should the existing transaction API be called.

---

## 28. Invalid Command

If the user says:

```text
I want to do something
```

and the parser cannot determine an intent, do not crash.

Display something like:

```text
I didn't understand that.

Try:
"Check my balance"
or
"Send ₹500 to Mom"
```

Reuse the existing help/error UI if available.

---

## 29. Accessibility

The microphone control should support:

- Keyboard focus
- Enter/Space activation
- Screen-reader accessible label
- Large click/tap target
- High contrast
- Clear listening state
- Clear error messages
- Visible transcript
- No reliance on color alone

Example accessible labels:

```text
Start voice input
```

When listening:

```text
Stop voice input
```

Use the project's existing ARIA conventions.

---

## 30. Do Not Break Manual Input

Voice is an additional input method.

Do not remove:

- Text input
- Keyboard controls
- Existing buttons
- Existing confirmation controls
- Existing dashboard functionality

Users must still be able to use SAHAY without speech recognition.

---

## 31. Browser Target

Primary demo browser:

```text
Google Chrome on Windows
```

Test primarily in Chrome.

Unsupported browsers must fail gracefully.

Use:

```js
window.SpeechRecognition || window.webkitSpeechRecognition
```

---

## 32. No Backend Speech Route

Do not create a backend transcription route such as:

```text
POST /api/transcribe
```

unless another existing feature genuinely requires it.

The intended architecture is:

```text
Browser → Web Speech API
```

The Express backend remains unchanged for banking/application APIs.

---

## 33. No Audio Files

Do not create normal voice-command recordings:

```text
.wav
.mp3
.webm
```

Do not use `MediaRecorder`.

Do not upload microphone audio.

This feature is live speech recognition, not audio recording.

---

## 34. React Cleanup

Clean up recognition when the component unmounts.

When the voice component is removed:

```text
Stop recognition
Remove or replace event handlers
```

Avoid memory leaks and recognition continuing after navigation.

---

## 35. Avoid Multiple Recognition Instances

Do not create a new recognition object on every React render.

Use a ref or equivalent architecture.

Avoid placing:

```js
const recognition = new SpeechRecognition();
```

directly in a component body if it creates a new instance on every render.

---

## 36. React Strict Mode

If the project uses React Strict Mode, verify that recognition does not start twice.

Development mode must not create:

- Duplicate recognition objects
- Duplicate event handlers
- Duplicate transcripts
- Duplicate command execution

---

## 37. Preserve Existing Styling

Do not redesign the entire SAHAY UI.

Only modify the voice-related interface.

Preserve:

- Existing typography
- Existing spacing
- Existing cards
- Existing buttons
- Existing colors
- Existing responsive behavior

The voice feature should feel like part of SAHAY.

---

## 38. Suggested Voice UI

Use the existing SAHAY design system, but the conceptual layout is:

```text
┌───────────────────────────────────────┐
│                                       │
│          SAHAY VOICE ASSISTANT        │
│                                       │
│              🎤                       │
│         [ Start Speaking ]            │
│                                       │
│  You said:                            │
│  "What is my balance"                 │
│                                       │
│  Listening...                         │
│                                       │
└───────────────────────────────────────┘
```

Listening state:

```text
┌───────────────────────────────────────┐
│                                       │
│          SAHAY VOICE ASSISTANT        │
│                                       │
│              🔴                       │
│         [ Stop Listening ]            │
│                                       │
│  You said:                            │
│  "What is my balance"                 │
│                                       │
│       Listening...                    │
│                                       │
└───────────────────────────────────────┘
```

Do not copy the visual design literally if SAHAY already has a voice UI.

---

## 39. Error States

### Unsupported browser

```text
Voice input is not supported in this browser.
```

### Permission denied

```text
Microphone permission was denied.
Please allow microphone access and try again.
```

### No speech

```text
I didn't hear anything.
Please try again.
```

### General error

```text
Voice input stopped.
Please try again.
```

Keep technical errors in the console when useful for development.

---

## 40. Debug Logging

During development, useful logs include:

```text
Speech recognition started
Speech recognition result
Speech recognition ended
Speech recognition error
Final transcript
Interim transcript
```

Do not leave excessive logging in the final production UI.

---

## 41. Testing Checklist

### Basic

- [ ] App starts successfully
- [ ] No console errors on page load
- [ ] Microphone button appears
- [ ] Browser support is detected
- [ ] Microphone permission works
- [ ] Recognition starts
- [ ] Recognition stops
- [ ] Recognition does not start twice

### Live transcription

- [ ] Words appear while speaking
- [ ] Interim results are visible
- [ ] Final results are preserved
- [ ] Interim text does not duplicate final text
- [ ] Transcript does not randomly reset
- [ ] Long sentences work
- [ ] Short commands work

### Commands

- [ ] "What is my balance?" works
- [ ] "Check my balance" works
- [ ] "Send 500 rupees to Mom" works
- [ ] Invalid commands are handled
- [ ] Existing intent parser is used
- [ ] Existing API calls are used

### Security

- [ ] Voice does not directly transfer money
- [ ] Existing confirmation remains
- [ ] Existing validation remains
- [ ] Existing authentication/security remains
- [ ] No secret keys are exposed in frontend

### Accessibility

- [ ] Microphone button is keyboard accessible
- [ ] Button has an accessible label
- [ ] Listening state is clearly communicated
- [ ] Transcript is readable
- [ ] Error messages are readable
- [ ] UI remains usable without voice

### Regression

- [ ] Existing manual input works
- [ ] Balance page works
- [ ] Send-money flow works
- [ ] Backend still works
- [ ] Existing navigation works
- [ ] No unrelated components were broken

---

## 42. Manual Chrome Test

Run the existing application normally.

If it uses Vite:

```bash
npm run dev
```

Open the local URL in Chrome.

Allow microphone access.

Click the microphone button.

Say:

```text
What is my balance?
```

The transcript should appear while speaking.

Then test:

```text
Send 500 rupees to Mom
```

Verify that the existing confirmation/security flow appears.

Do not expect an audio file to be created.

---

## 43. Implementation That Must NOT Be Used

Do not implement:

```text
Click microphone
↓
Record audio
↓
Stop
↓
Create Blob
↓
FormData
↓
Upload
↓
Hugging Face Whisper
↓
Wait
↓
Show transcript
```

That is not the required experience.

The required experience is:

```text
Click microphone
↓
Speak
↓
Text appears immediately
↓
Continue speaking
↓
Final text
↓
Existing SAHAY intent system
```

---

## 44. Keep Speech and Intent Separate

The speech layer answers:

```text
"What did the user say?"
```

The existing intent system answers:

```text
"What does the user want to do?"
```

Architecture:

```text
┌─────────────────────┐
│     Microphone      │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Web Speech API      │
│                     │
│ Live transcription  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Final Transcript    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Existing SAHAY      │
│ Intent Parser       │
└──────────┬──────────┘
           ↓
      ┌────┴─────┐
      ↓          ↓
   Balance    Send Money
                 ↓
            Confirmation
                 ↓
            Secure API
```

---

## 45. Environment Variables

The Web Speech API does not require an API key.

Do not create:

```env
WEB_SPEECH_API_KEY=
```

There is no such key.

If the old HF variables are no longer needed anywhere, they should not be required for the application to run.

Never put secret credentials in frontend code.

---

## 46. Dependencies

Prefer the browser API directly.

Do not install a large speech-recognition package unless the existing project genuinely requires one.

Do not add:

- Whisper
- OpenAI speech APIs
- Hugging Face speech APIs
- MediaRecorder
- Audio upload libraries

for this implementation.

The voice feature should remain lightweight.

---

## 47. Implementation Order

Follow this order:

### Step 1

Inspect the repository.

### Step 2

Identify the existing voice-input and intent-processing flow.

### Step 3

Identify balance and send-money flows.

### Step 4

Identify confirmation/security mechanisms.

### Step 5

Remove or disable only the Hugging Face transcription layer.

### Step 6

Implement the Web Speech API abstraction.

### Step 7

Connect live interim/final transcript to the voice UI.

### Step 8

Connect final transcript to the existing intent parser.

### Step 9

Verify balance flow.

### Step 10

Verify send-money flow.

### Step 11

Verify confirmation/security.

### Step 12

Test unsupported-browser behavior.

### Step 13

Test microphone permission and recognition errors.

### Step 14

Test React cleanup/unmount behavior.

### Step 15

Run the complete application and fix regressions.

---

## 48. Do Not Overengineer

This is a 24-hour hackathon project.

Do not introduce:

- WebSockets
- Custom streaming servers
- Audio chunk servers
- Speech microservices
- Vector databases
- New state-management libraries
- Complex speech-processing pipelines

The browser already provides the required live recognition mechanism.

Keep the implementation small and reliable.

---

## 49. Expected Final Result

Balance:

```text
User opens SAHAY
        ↓
Clicks microphone
        ↓
Browser asks for permission if necessary
        ↓
Listening indicator appears
        ↓
User says:
"What's my balance?"
        ↓
Transcript appears live
        ↓
Final transcript:
"What's my balance?"
        ↓
Existing SAHAY parser
        ↓
Balance flow
        ↓
Balance displayed
```

Send money:

```text
User says:
"Send 500 rupees to Mom"
        ↓
Live transcript
        ↓
Existing intent parser
        ↓
SEND_MONEY
        ↓
Existing confirmation UI
        ↓
User confirms
        ↓
Existing secure transfer flow
```

---

## 50. Final Requirements

Before declaring the implementation complete, verify:

1. Web Speech API is being used.
2. `continuous` is enabled.
3. `interimResults` is enabled.
4. Live words appear while speaking.
5. Final transcript is separated from interim transcript.
6. No Hugging Face API is required for voice input.
7. No Whisper API is required for voice input.
8. No audio recording/upload is required.
9. Existing SAHAY intent parsing is preserved.
10. Existing balance flow is preserved.
11. Existing send-money flow is preserved.
12. Existing confirmation/security is preserved.
13. Duplicate command execution is prevented.
14. Unsupported browsers do not crash the app.
15. Microphone permission errors are handled.
16. Manual input still works.
17. The UI remains accessible.
18. Recognition is cleaned up correctly.
19. No secret keys are exposed.
20. The project builds and runs successfully.

---

## 51. Antigravity Working Rule

Use this workflow:

```text
Inspect first
↓
Understand existing architecture
↓
Modify the minimum required files
↓
Run the application
↓
Test voice input
↓
Test existing banking flows
↓
Fix relevant issues
↓
Verify no regressions
```

Do not rewrite SAHAY from scratch.

Do not replace existing business logic.

Do not replace existing security logic.

Do not replace the existing intent parser.

Only replace the speech-to-text input layer with browser-based live speech recognition.

Final target:

**SAHAY + Browser Web Speech API + Live Transcription + Existing Intent/Security Flows**
