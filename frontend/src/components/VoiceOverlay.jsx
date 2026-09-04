import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Mic, X, CheckCircle2, Volume2, Sparkles, ArrowRight } from 'lucide-react';
import { MOCK_PAYEES } from '../types';
import { speakEnglish, stopSpeaking, soundFX } from '../utils/speech';

export function VoiceAssistantOverlay({ state, updateState, onNavigate }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Listening to your voice...');
  const [aiSpokenReply, setAiSpokenReply] = useState('');
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);
  const [recognizedAction, setRecognizedAction] = useState(null);
  
  const recognitionRef = useRef(null);
  const isNavigatingRef = useRef(false);

  const processVoiceCommand = useCallback(async (spokenText) => {
    const text = spokenText.toLowerCase().trim();
    if (!text) return;

    soundFX.playTap();
    setTranscript(spokenText);
    setStatusMessage('Understanding what you need...');

    try {
      let intent = 'unknown';
      let params = { user_id: 'user_1' };
      let aiReply = '';
      let title = 'Action';
      let details = '';
      let actionFn = () => {};

      if (text.includes('balance')) {
        intent = 'check_balance';
      } else if (text.includes('send') || text.includes('transfer') || text.includes('pay')) {
        intent = 'send_money';
        const amountMatch = text.match(/\d+/);
        params.amount = amountMatch ? parseInt(amountMatch[0], 10) : 500;
        const matchedPayee = MOCK_PAYEES.find(p => text.includes(p.name.toLowerCase()));
        params.contact_name = matchedPayee ? matchedPayee.name : 'Ananya';
      } else if (text.includes('passbook') || text.includes('statement')) {
        intent = 'show_statement';
      } else if (text.includes('profile')) {
        intent = 'profile';
      } else if (text.includes('contact')) {
        intent = 'contact';
      } else if (text.includes('home')) {
        intent = 'home';
      }

      if (intent === 'check_balance' || intent === 'send_money') {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/execute-task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intent, params })
        });

        if (!response.ok) {
          throw new Error('Backend failed to process command');
        }

        const data = await response.json();
        aiReply = data.readback || (intent === 'check_balance' ? `Your balance is ₹${state.accountBalance}` : "Task completed.");
        
        if (intent === 'check_balance') {
           title = 'Check Account Balance';
           details = `Available: ₹${state.accountBalance.toLocaleString()}.00`;
           actionFn = () => { updateState({ isVoiceActive: false }); onNavigate('balance_detail'); };
        } else if (intent === 'send_money') {
           title = `Send ₹${params.amount} to ${params.contact_name}`;
           details = `Debiting from Pension Account •••• 4821`;
           const payee = MOCK_PAYEES.find(p => p.name === params.contact_name) || MOCK_PAYEES[0];
           actionFn = () => {
             updateState({
               selectedPayee: payee,
               transferAmount: params.amount,
               voiceTranscript: spokenText,
               currentView: 'confirm_transfer',
               isVoiceActive: false
             });
           };
        }
      } else {
        if (intent === 'show_statement') {
           title = 'View Passbook & Statement';
           details = 'Reviewing recent credits and debits';
           aiReply = "Opening your passbook statement.";
           actionFn = () => { updateState({ isVoiceActive: false }); onNavigate('passbook'); };
        } else if (intent === 'profile') {
           title = 'Open Profile & Care Manager';
           aiReply = "Opening profile and care manager.";
           actionFn = () => { updateState({ isVoiceActive: false }); onNavigate('profile'); };
        } else if (intent === 'contact') {
           title = 'Open Trusted Contacts';
           aiReply = "Showing trusted contacts.";
           actionFn = () => { updateState({ isVoiceActive: false }); onNavigate('contacts'); };
        } else if (intent === 'home') {
           title = 'Return to Home';
           aiReply = "Going to home dashboard.";
           actionFn = () => { updateState({ isVoiceActive: false }); onNavigate('home'); };
        } else {
           throw new Error("Unknown intent");
        }
      }
      
      setAiSpokenReply(aiReply);
      setRecognizedAction({ type: intent, title, details, action: actionFn });

      setIsSpeakingResponse(true);
      speakEnglish(aiReply, () => {
        setIsSpeakingResponse(false);
        setTimeout(actionFn, 1200);
      });

    } catch (err) {
      console.error(err);
      const fallbackReply = `I heard: "${spokenText}". Would you like to check your balance, send money, or view your passbook?`;
      setAiSpokenReply(fallbackReply);
      setIsSpeakingResponse(true);
      speakEnglish(fallbackReply, () => setIsSpeakingResponse(false));
    }
  }, [state.accountBalance, updateState, onNavigate]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
       recognitionRef.current.stop();
       setIsListening(false);
       setStatusMessage('Processing your command...');
    }
  }, []);

  const startListening = useCallback(() => {
    stopSpeaking();
    soundFX.playMicStart();
    setIsListening(true);
    setStatusMessage('Listening carefully. Tap the mic to stop...');
    setTranscript('');
    setInterimTranscript('');
    setAiSpokenReply('');
    setRecognizedAction(null);

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setStatusMessage('Speech recognition not supported in this browser.');
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Or your preferred dialect

      recognition.onresult = (event) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(currentInterim);
        
        if (finalTranscript) {
           setTranscript(finalTranscript);
           processVoiceCommand(finalTranscript);
           recognition.stop();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
           setStatusMessage('Microphone access denied.');
        } else {
           setStatusMessage(`Transcription failed (${event.error}). Tap to retry.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (err) {
      console.error('Microphone error:', err);
      setIsListening(false);
      setStatusMessage(`Microphone error: ${err.message}`);
    }
  }, [processVoiceCommand]);

  // When overlay opens, start listening automatically
  useEffect(() => {
    if (state.isVoiceActive) {
      isNavigatingRef.current = false;
      startListening();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isVoiceActive]);

  if (!state.isVoiceActive) return null;

  const handleClose = () => {
    stopSpeaking();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    updateState({ isVoiceActive: false });
  };

  const handleHearBack = () => {
    soundFX.playTap();
    if (aiSpokenReply) {
      speakEnglish(aiSpokenReply);
    } else if (transcript) {
      speakEnglish(`You said: ${transcript}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-surface/98 backdrop-blur-lg z-50 flex flex-col pt-8 px-6 pb-8 overflow-y-auto max-w-lg mx-auto">
      {/* Top Bar for Overlay */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-tangerine rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-brand-teal rounded-full"></div>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-lg text-brand-teal">SAHAY Voice AI</h2>
            <p className="text-xs text-brand-text-muted font-semibold">Speaking in English</p>
          </div>
        </div>
        <button 
          onClick={handleClose}
          className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-text-dark hover:bg-slate-100 transition-colors"
          title="Close voice assistant"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Voice Interactive Arena */}
      <div className="flex flex-col items-center flex-1 py-2">
        {/* Status Pill */}
        <div className="bg-brand-teal-light text-brand-teal px-4 py-1.5 rounded-full font-bold text-xs mb-6 flex items-center gap-2 border border-brand-teal/20">
          <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-brand-tangerine animate-ping' : 'bg-brand-teal'}`}></div>
          {isListening ? 'Microphone Active' : isSpeakingResponse ? 'AI Replying with Voice' : 'Ready'}
        </div>

        {/* Central Mic Visualizer */}
        <div className="relative mb-6 flex items-center justify-center w-52 h-52">
          {isListening && (
            <>
              <div className="absolute inset-0 bg-brand-teal/10 rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
              <div className="absolute inset-6 bg-brand-teal/15 rounded-full animate-ping" style={{ animationDuration: '1.8s' }}></div>
              <div className="absolute inset-12 bg-brand-teal/20 rounded-full animate-pulse"></div>
            </>
          )}

          {isSpeakingResponse && (
            <div className="absolute inset-2 bg-brand-tangerine/15 rounded-full animate-pulse"></div>
          )}
          
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-transform active:scale-95 ${
              isListening 
                ? 'bg-brand-tangerine shadow-brand-tangerine/40 scale-105' 
                : isSpeakingResponse
                  ? 'bg-brand-teal shadow-brand-teal/40'
                  : 'bg-brand-teal shadow-brand-teal/30 hover:scale-105'
            }`}
            title={isListening ? 'Tap to stop listening' : 'Tap to start speaking'}
          >
            <Mic size={42} className={isListening ? 'animate-pulse' : ''} />
            {isListening && (
              <div className="flex gap-1 mt-1.5">
                <div className="w-1.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-1.5 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
              </div>
            )}
          </button>
        </div>

        {/* Status Text */}
        <h1 className="text-2xl font-bold text-center text-brand-text-dark leading-tight mb-2">
          {isListening 
            ? 'Listening to you...' 
            : isSpeakingResponse 
              ? 'Speaking Voice Reply...' 
              : transcript 
                ? 'Understood Your Command' 
                : 'Tap Mic to Speak Any Command'}
        </h1>
        <p className="text-center text-brand-text-muted text-sm font-medium max-w-[320px] mb-6">
          {statusMessage}
        </p>

        {/* Recognized Transcript or AI Spoken Response Card */}
        {(transcript || interimTranscript || aiSpokenReply) && (
          <div className="w-full bg-white rounded-3xl p-5 shadow-md border border-slate-100 mb-6 text-left animate-in fade-in">
            {(transcript || interimTranscript) && (
              <div className="mb-3">
                <span className="text-xs font-bold text-brand-teal flex items-center gap-1 mb-1">
                  <Mic size={14} /> You Spoke:
                </span>
                <p className="text-lg font-bold text-brand-text-dark leading-snug">
                  "{transcript || interimTranscript}"
                </p>
              </div>
            )}

            {aiSpokenReply && (
              <div className="bg-brand-teal-light rounded-2xl p-3.5 border border-brand-teal/20 mt-2">
                <span className="text-xs font-bold text-brand-teal flex items-center gap-1 mb-1">
                  <Sparkles size={14} /> SAHAY AI Voice Reply:
                </span>
                <p className="text-sm font-semibold text-brand-text-dark leading-relaxed">
                  {aiSpokenReply}
                </p>
                <button 
                  onClick={handleHearBack}
                  className="mt-2 text-xs font-bold text-brand-teal flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-xs hover:bg-slate-50 transition-colors"
                >
                  <Volume2 size={14} /> Replay Voice Audio
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Voice Commands for Instant 1-Tap Trigger */}
        <div className="w-full mt-auto">
          <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-2.5 px-1">
            Tap to test any voice action instantly:
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Send ₹500 to Ananya', phrase: 'Send 500 rupees to Ananya' },
              { label: 'Check my balance', phrase: 'What is my account balance' },
              { label: 'Open Passbook statement', phrase: 'Open passbook statement' },
              { label: 'Open Profile & Care Manager', phrase: 'Open profile and care manager' },
              { label: 'View Trusted Contacts', phrase: 'Show trusted contacts' },
              { label: 'Return to Home', phrase: 'Go to home dashboard' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => {
                  soundFX.playTap();
                  processVoiceCommand(item.phrase);
                }}
                className="bg-white p-3 rounded-2xl border border-slate-200 text-left hover:border-brand-teal hover:bg-brand-teal-light/20 transition-all shadow-xs group"
              >
                <p className="font-bold text-brand-text-dark text-xs leading-snug group-hover:text-brand-teal">
                  {item.label}
                </p>
                <span className="text-[11px] text-brand-text-muted mt-0.5 flex items-center gap-1">
                  <Volume2 size={12} className="text-brand-tangerine" /> Voice Command
                </span>
              </button>
            ))}
          </div>

          <button 
            onClick={handleClose}
            className="w-full bg-slate-200 text-brand-text-dark py-3.5 rounded-2xl font-bold text-base hover:bg-slate-300 transition-colors"
          >
            Close Voice Assistant
          </button>
        </div>
      </div>
    </div>
  );
}
