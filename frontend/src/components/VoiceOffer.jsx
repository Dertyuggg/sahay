import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { AccessibleButton } from './AccessibleButton';

export function VoiceOffer() {
  const { setUiTier, speak } = useAccessibility();
  const { 
    isListening, 
    transcript, 
    error: asrError, 
    startListening, 
    stopListening, 
    parseIntent,
    setTranscript 
  } = useVoiceAssistant();

  // 'OFFER' | 'LISTENING' | 'PROCESSING' | 'CONFIRMING' | 'EXECUTING' | 'SUCCESS' | 'FALLBACK_TEXT'
  const [voiceState, setVoiceState] = useState('OFFER'); 
  const [parsedIntent, setParsedIntent] = useState(null);
  const [fallbackText, setFallbackText] = useState('');

  // Handle ASR transcript updates
  useEffect(() => {
    if (transcript && voiceState === 'LISTENING') {
      setVoiceState('PROCESSING');
      const intent = parseIntent(transcript);
      setParsedIntent(intent);
      
      if (intent.intent === 'check_balance') {
        speak("You want to check your balance. Is that correct? Say yes or no.");
        setVoiceState('CONFIRMING');
      } else if (intent.intent === 'send_money') {
        const { amount, recipient } = intent.params;
        speak(`You want to send ${amount} dollars to ${recipient}. Is that correct? Say yes or no.`);
        setVoiceState('CONFIRMING');
      } else {
        speak("I didn't understand. Can you repeat that?");
        setVoiceState('LISTENING');
        startListening();
      }
    }
  }, [transcript, voiceState, parseIntent, startListening, speak]);

  // Handle confirmation transcript updates
  useEffect(() => {
    if (transcript && voiceState === 'CONFIRMING') {
      const lower = transcript.toLowerCase();
      if (lower.includes('yes') || lower.includes('correct') || lower.includes('right')) {
        setVoiceState('EXECUTING');
        executeTask(parsedIntent);
      } else if (lower.includes('no') || lower.includes('cancel')) {
        speak("Okay, let's try again. What would you like to do?");
        setVoiceState('LISTENING');
        startListening();
      }
    }
  }, [transcript, voiceState, parsedIntent, startListening, speak]);

  // Fallback trigger on ASR error
  useEffect(() => {
    if (asrError && asrError !== 'no-speech' && voiceState !== 'OFFER') {
      speak("I'm having trouble hearing you. Please type what you want to do.");
      setVoiceState('FALLBACK_TEXT');
    }
  }, [asrError, voiceState, speak]);

  const handleStartVoice = () => {
    speak("Voice mode activated. Please tell me what you want to do.");
    setVoiceState('LISTENING');
    startListening();
  };

  const handleFallbackSubmit = (e) => {
    e.preventDefault();
    if (!fallbackText) return;
    setVoiceState('PROCESSING');
    const intent = parseIntent(fallbackText);
    setParsedIntent(intent);
    
    // Auto execute for fallback to keep it simple, or we can confirm textually
    executeTask(intent);
  };

  const executeTask = async (intent) => {
    speak("Processing your request...");
    try {
      if (intent.intent === 'check_balance') {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/users/user_1`);
        const data = await res.json();
        speak(`Your balance is ${data.balance} dollars. Returning to dashboard.`);
      } else if (intent.intent === 'send_money') {
        const { amount, recipient } = intent.params;
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/users/user_1/transfer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: recipient, amount: parseFloat(amount) })
        });
        const data = await res.json();
        if (data.success) {
          speak(`Successfully sent ${amount} dollars to ${recipient}. Returning to dashboard.`);
        } else {
          speak(`Error sending money: ${data.error}`);
        }
      }
    } catch (err) {
      console.error(err);
      speak("An error occurred while executing the task.");
    }

    setVoiceState('SUCCESS');
    setTimeout(() => setUiTier('simplified'), 4000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '40px',
      textAlign: 'center'
    }}>
      {voiceState === 'OFFER' && (
        <>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '24px' }} tabIndex="0">
            Would you like to do this by speaking instead?
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '48px' }} tabIndex="0">
            You can talk to me, and I'll help you complete your task.
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <AccessibleButton onClick={handleStartVoice} ariaLabel="Yes, use voice" style={{ fontSize: '1.5rem', padding: '20px 40px' }}>
              🎤 Yes, use voice
            </AccessibleButton>
            <AccessibleButton onClick={() => {
              speak("Voice mode declined. Switching to simplified view.");
              setUiTier("simplified");
            }} ariaLabel="No, stay here" variant="secondary" style={{ fontSize: '1.5rem', padding: '20px 40px' }}>
              ❌ No, stay here
            </AccessibleButton>
          </div>
        </>
      )}

      {voiceState === 'LISTENING' && (
        <div aria-live="polite">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>Listening...</h1>
          <p style={{ fontSize: '1.5rem' }}>Speak your request (e.g. "Check my balance" or "Send 50 dollars to Ramesh")</p>
          {isListening && <div style={{ marginTop: '20px', fontSize: '4rem' }}>🎤</div>}
        </div>
      )}

      {voiceState === 'PROCESSING' && (
        <div aria-live="polite">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>Thinking...</h1>
        </div>
      )}

      {voiceState === 'CONFIRMING' && (
        <div aria-live="polite">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Is this correct?</h1>
          <p style={{ fontSize: '1.8rem', marginBottom: '40px' }}>
            {parsedIntent?.intent === 'check_balance' && "You want to check your balance."}
            {parsedIntent?.intent === 'send_money' && `You want to send ${parsedIntent?.params?.amount} dollars to ${parsedIntent?.params?.recipient}.`}
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <AccessibleButton onClick={() => {
              // Manual override if voice confirm fails
              setVoiceState('EXECUTING');
              executeTask(parsedIntent);
            }} style={{ fontSize: '1.5rem', padding: '20px 40px' }}>
              ✔️ Yes
            </AccessibleButton>
            <AccessibleButton onClick={() => {
              speak("Okay, let's try again. What would you like to do?");
              setVoiceState('LISTENING');
              startListening();
            }} variant="secondary" style={{ fontSize: '1.5rem', padding: '20px 40px' }}>
              ✖️ No
            </AccessibleButton>
          </div>
        </div>
      )}

      {voiceState === 'EXECUTING' && (
        <div aria-live="polite">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px' }}>Executing...</h1>
        </div>
      )}

      {voiceState === 'SUCCESS' && (
        <div aria-live="polite">
          <h1 style={{ fontSize: '3rem', marginBottom: '24px', color: 'green' }}>Success!</h1>
          <p style={{ fontSize: '1.5rem' }}>Returning to dashboard...</p>
        </div>
      )}

      {voiceState === 'FALLBACK_TEXT' && (
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Voice Unavailable</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Please type your request below:</p>
          <form onSubmit={handleFallbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              value={fallbackText} 
              onChange={(e) => setFallbackText(e.target.value)} 
              placeholder="e.g. Check my balance"
              style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}
              autoFocus
            />
            <AccessibleButton type="submit" style={{ fontSize: '1.5rem', padding: '16px' }}>
              Submit
            </AccessibleButton>
            <AccessibleButton type="button" variant="secondary" onClick={() => setUiTier('simplified')} style={{ fontSize: '1.5rem', padding: '16px' }}>
              Cancel
            </AccessibleButton>
          </form>
        </div>
      )}
    </div>
  );
}
