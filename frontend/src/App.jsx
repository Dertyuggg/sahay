import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAccessibility } from './hooks/useAccessibility';
import { useTelemetry } from './hooks/useTelemetry';
import { AccessibleButton } from './components/AccessibleButton';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SendMoney } from './pages/SendMoney';
import { VoiceOffer } from './components/VoiceOffer';
import './index.css';

function App() {
  const location = useLocation();
  const { 
    increaseFontSize, 
    decreaseFontSize, 
    toggleHighContrast, 
    speak,
    uiTier,
    setUiTier
  } = useAccessibility();
  
  const { events, logEvent } = useTelemetry();

  // Dynamically check friction score and switch UI tier
  useEffect(() => {
    const checkFriction = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/friction-score?user_id=user_1`);
        if (!res.ok) return;
        const data = await res.json();
        
        // Auto-switch based on score if not already in that tier.
        // We avoid auto-downgrading from voice_offer for the demo's sake, but we can just blindly trust the backend tier.
        if (data.tier && data.tier !== uiTier) {
          // If we manually selected voice_offer, don't revert to simplified immediately
          if (!(uiTier === 'voice_offer' && data.tier !== 'voice_offer')) {
             setUiTier(data.tier);
          }
        }
      } catch (err) {
        console.error('Failed to fetch friction score', err);
      }
    };
    checkFriction();
  }, [events.length, setUiTier, uiTier]);

  const simulateStruggle = () => {
    // Force high friction score (+60 or more) to trigger voice_offer
    logEvent('mistap', { source: 'simulate_struggle' });
    setTimeout(() => logEvent('mistap', { source: 'simulate_struggle' }), 100);
    setTimeout(() => logEvent('mistap', { source: 'simulate_struggle' }), 200);
    setTimeout(() => logEvent('hesitation', { duration_ms: 10000 }), 300);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <header>
        <h1 tabIndex="0">SAHAY-24 Banking</h1>
        <p tabIndex="0" style={{ fontSize: '1.2rem', marginBottom: '32px' }}>
          Welcome back, Arthur. Accessible banking made simple.
        </p>
      </header>
      
      <section aria-label="Accessibility Controls" style={{ 
        display: 'flex', 
        gap: '16px', 
        flexWrap: 'wrap', 
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: 'rgba(128,128,128,0.1)',
        borderRadius: '12px'
      }}>
        <AccessibleButton onClick={increaseFontSize} ariaLabel="Increase text size" variant="secondary">
          A+ Text
        </AccessibleButton>
        <AccessibleButton onClick={decreaseFontSize} ariaLabel="Decrease text size" variant="secondary">
          A- Text
        </AccessibleButton>
        <AccessibleButton onClick={toggleHighContrast} ariaLabel="Toggle High Contrast Mode" variant="secondary">
          🌓 Toggle Contrast
        </AccessibleButton>
        
        <AccessibleButton 
          onClick={simulateStruggle} 
          ariaLabel="Simulate Struggle for Demo" 
          variant="secondary"
          style={{ backgroundColor: 'var(--error-color)', color: 'white', border: 'none' }}
        >
          🚨 Simulate Struggle
        </AccessibleButton>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <label htmlFor="tier-select" style={{ fontWeight: 'bold' }}>UI Tier:</label>
          <select 
            id="tier-select"
            value={uiTier} 
            onChange={(e) => setUiTier(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
          >
            <option value="standard">Standard</option>
            <option value="simplified">Simplified</option>
            <option value="voice_offer">Voice Offer</option>
          </select>
        </div>
      </section>

      {uiTier === 'voice_offer' && <VoiceOffer />}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/send-money" element={<SendMoney />} />
      </Routes>
    </div>
  );
}

export default App;
