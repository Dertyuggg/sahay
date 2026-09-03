import React, { useEffect, useState } from 'react';
import { HomeView } from './views/HomeView';
import { TransferFlow } from './views/TransferFlow';
import { PassbookView } from './views/PassbookView';
import { ProfileView } from './views/ProfileView';
import { BalanceDetailView } from './views/BalanceDetailView';
import { ContactsView } from './views/ContactsView';
import { BottomNav } from './components/Shared';
import { VoiceAssistantOverlay } from './components/VoiceOverlay';
import { MOCK_PAYEES } from './types';
import { soundFX } from './utils/speech';
import { useTelemetry } from './hooks/useTelemetry';

export default function App() {
  const [state, setState] = useState({
    currentView: 'home',
    accountBalance: 24850,
    selectedPayee: MOCK_PAYEES[0],
    transferAmount: 500,
    transferReason: 'Household & Family',
    isVoiceActive: false,
    voiceTranscript: '',
    frictionScore: 48,
    isLanguageSelectionOpen: false,
    currentLanguage: 'en',
    lastTransferSuccess: null,
    voiceHasBeenOffered: false
  });

  const { events, logEvent } = useTelemetry();

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    const checkFriction = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/friction-score?user_id=user_1`);
        if (!res.ok) return;
        const data = await res.json();
        
        updateState({ frictionScore: data.score });
        
        if (data.score >= 60 && !state.isVoiceActive && !state.voiceHasBeenOffered) {
          updateState({ isVoiceActive: true, voiceHasBeenOffered: true });
        }
      } catch (err) {
        console.error('Failed to fetch friction score', err);
      }
    };
    checkFriction();
  }, [events.length, state.isVoiceActive, state.voiceHasBeenOffered]);

  const simulateStruggle = () => {
    logEvent('mistap', { source: 'simulate_struggle' });
    setTimeout(() => logEvent('mistap', { source: 'simulate_struggle' }), 100);
    setTimeout(() => logEvent('mistap', { source: 'simulate_struggle' }), 200);
    setTimeout(() => logEvent('hesitation', { duration_ms: 10000 }), 300);
  };

  const handleNavigate = (view, payee) => {
    soundFX.playTap();
    if (view === 'home' && (state.currentView === 'send_money_amount' || state.currentView === 'confirm_transfer')) {
        logEvent('back_nav', { from: state.currentView, to: view });
    }
    if (payee) {
      updateState({ currentView: view, selectedPayee: payee });
    } else {
      updateState({ currentView: view });
    }
  };

  const handleVoiceToggle = () => {
    soundFX.playTap();
    updateState({ isVoiceActive: !state.isVoiceActive });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-brand-text-dark font-sans flex justify-center selection:bg-brand-teal selection:text-white">
      {/* Mobile Shell Wrapper */}
      <div className="w-full max-w-lg bg-brand-surface min-h-screen shadow-2xl relative flex flex-col">
        {/* Active Screen View */}
        {state.currentView === 'home' && (
          <HomeView 
            balance={state.accountBalance}
            onNavigate={handleNavigate}
            onVoiceClick={handleVoiceToggle}
          />
        )}

        {(state.currentView === 'send_money_amount' || 
          state.currentView === 'confirm_transfer' || 
          state.currentView === 'success') && (
          <TransferFlow 
            state={state} 
            updateState={updateState} 
            onNavigate={handleNavigate} 
          />
        )}

        {state.currentView === 'passbook' && (
          <PassbookView 
            balance={state.accountBalance}
            onBack={() => handleNavigate('home')}
            onSendMoney={() => handleNavigate('send_money_amount')}
            onOpenProfile={() => handleNavigate('profile')}
          />
        )}

        {state.currentView === 'profile' && (
          <ProfileView 
            onBack={() => handleNavigate('home')}
            onOpenPassbook={() => handleNavigate('passbook')}
          />
        )}

        {state.currentView === 'balance_detail' && (
          <BalanceDetailView 
            balance={state.accountBalance}
            onBack={() => handleNavigate('home')}
            onSendMoney={() => handleNavigate('send_money_amount')}
            onOpenProfile={() => handleNavigate('profile')}
          />
        )}

        {state.currentView === 'contacts' && (
          <ContactsView 
            onBack={() => handleNavigate('home')}
            onSelectPayee={(payee) => handleNavigate('send_money_amount', payee)}
            onOpenProfile={() => handleNavigate('profile')}
          />
        )}

        {/* Global Bottom Navigation (persistent across main views) */}
        {state.currentView !== 'success' && state.currentView !== 'confirm_transfer' && (
          <BottomNav 
            currentView={state.currentView} 
            onChangeView={handleNavigate} 
            onVoiceClick={handleVoiceToggle} 
          />
        )}

        {/* Full Screen Voice AI Overlay */}
        <VoiceAssistantOverlay 
          state={state} 
          updateState={updateState} 
          onNavigate={handleNavigate} 
        />
        
        {/* Floating Simulate Struggle Button for Demo */}
        <button
          onClick={simulateStruggle}
          style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 100 }}
          className="bg-red-600 text-white px-3 py-2 rounded-full text-xs font-bold shadow-lg opacity-80 hover:opacity-100 focus:ring-4 focus:ring-red-300"
          aria-label="Simulate Struggle for Demo"
        >
          🚨 Simulate Struggle
        </button>
      </div>
    </div>
  );
}
