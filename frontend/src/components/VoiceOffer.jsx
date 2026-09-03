import React from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { AccessibleButton } from './AccessibleButton';

export function VoiceOffer() {
  const { setUiTier, speak } = useAccessibility();

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
      <h1 style={{ fontSize: '2.5rem', marginBottom: '24px' }} tabIndex="0">
        Would you like to do this by speaking instead?
      </h1>
      
      <p style={{ fontSize: '1.5rem', marginBottom: '48px' }} tabIndex="0">
        You can talk to me, and I'll help you complete your task.
      </p>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <AccessibleButton 
          onClick={() => {
            speak("Voice mode activated. Please tell me what you want to do.");
            console.log("Voice opt-in accepted.");
            // For now, we'll just log and maybe go to a mock voice mode or back to simplified
            // We'll leave it in voice_offer tier but in reality Stage 3 handles voice flow
          }}
          ariaLabel="Yes, use voice"
          style={{ fontSize: '1.5rem', padding: '20px 40px' }}
        >
          🎤 Yes, use voice
        </AccessibleButton>

        <AccessibleButton 
          onClick={() => {
            speak("Voice mode declined. Switching to simplified view.");
            setUiTier("simplified");
          }}
          ariaLabel="No, stay here"
          variant="secondary"
          style={{ fontSize: '1.5rem', padding: '20px 40px' }}
        >
          ❌ No, stay here
        </AccessibleButton>
      </div>
    </div>
  );
}
