import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { AccessibleButton } from './AccessibleButton';

export const VoiceNavigator = () => {
  const { speak } = useAccessibility();
  const [listening, setListening] = useState(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('Voice Command:', command);
      
      if (command.includes('balance')) {
        speak("Your current balance is five hundred dollars.");
      } else if (command.includes('transfer')) {
        speak("Opening transfer funds page.");
      } else {
        speak(`I heard ${command}, but I don't know how to do that yet.`);
      }
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    if (listening) {
      speak("Listening for command.");
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [listening, speak]);

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '2px dashed var(--primary-color)', borderRadius: '12px' }}>
      <h2 style={{fontSize: '1.5rem', marginBottom: '16px'}}>Voice Assistant</h2>
      <AccessibleButton 
        onClick={() => setListening(!listening)} 
        ariaLabel={listening ? "Stop listening" : "Start voice command"}
        variant="secondary"
      >
        {listening ? "🛑 Stop Listening" : "🎤 Tap to Speak"}
      </AccessibleButton>
      {listening && <p style={{marginTop: '12px', fontWeight: 'bold'}}>Listening... try saying "Check Balance"</p>}
    </div>
  );
};
