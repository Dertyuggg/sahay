import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAccessibility } from './hooks/useAccessibility';
import { AccessibleButton } from './components/AccessibleButton';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SendMoney } from './pages/SendMoney';
import './index.css';

function App() {
  const location = useLocation();
  const { 
    increaseFontSize, 
    decreaseFontSize, 
    toggleHighContrast, 
    speak 
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
      </section>

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
