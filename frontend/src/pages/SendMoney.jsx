import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibleButton } from '../components/AccessibleButton';
import { useAccessibility } from '../hooks/useAccessibility';

export function SendMoney() {
  const navigate = useNavigate();
  const { speak } = useAccessibility();

  const handleSend = (e) => {
    e.preventDefault();
    speak("Money sent successfully. Returning to dashboard.");
    navigate('/dashboard');
  };

  return (
    <main>
      <h2>Send Money</h2>
      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <div>
          <label htmlFor="recipient" style={{ display: 'block', marginBottom: '8px' }}>Recipient Name</label>
          <input 
            id="recipient" 
            type="text" 
            aria-required="true"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label htmlFor="amount" style={{ display: 'block', marginBottom: '8px' }}>Amount</label>
          <input 
            id="amount" 
            type="number" 
            aria-required="true"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <AccessibleButton type="submit" ariaLabel="Confirm and send money">
          Send Money
        </AccessibleButton>
        <AccessibleButton 
          type="button" 
          variant="secondary"
          onClick={() => navigate('/dashboard')}
          ariaLabel="Cancel and return to dashboard"
        >
          Cancel
        </AccessibleButton>
      </form>
    </main>
  );
}
