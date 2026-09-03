import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAccessibility } from './hooks/useAccessibility';
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
