import { useState, useEffect, useCallback, useRef } from 'react';

export function useVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('speech-recognition-not-supported');
    }
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setError('start-failed');
      }
    } else {
      setError('speech-recognition-not-supported');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  // Intent parsing logic
  const parseIntent = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check Balance Intent
    if (lowerText.includes('balance') || lowerText.includes('how much') || lowerText.includes('money do i have')) {
      return {
        intent: 'check_balance',
        params: {}
      };
    }
    
    // Send Money Intent
    // Matches patterns like "send 50 to ramesh", "pay 100 dollars to john"
    if (lowerText.includes('send') || lowerText.includes('pay') || lowerText.includes('transfer')) {
      // Regex to extract amount (digits) and recipient (word after "to")
      const amountMatch = lowerText.match(/(?:send|pay|transfer).*?(\d+)/);
      const recipientMatch = lowerText.match(/to\s+([a-zA-Z]+)/);
      
      const amount = amountMatch ? amountMatch[1] : null;
      const recipient = recipientMatch ? recipientMatch[1] : null;

      if (amount && recipient) {
        return {
          intent: 'send_money',
          params: { amount, recipient }
        };
      }
    }

    // Unrecognized intent
    return {
      intent: 'unknown',
      params: { original_text: text }
    };
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    parseIntent,
    setTranscript // export in case we need manual fallback override
  };
}
