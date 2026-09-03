import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import { AccessibleButton } from '../components/AccessibleButton';
import { VoiceNavigator } from '../components/VoiceNavigator';

export function Dashboard() {
  const { speak } = useAccessibility();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock user_1 as instructed in Stage 1 seed data
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/users/user_1`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setBalance(data.balance);
      speak(`Your balance is ${data.balance} dollars`);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve balance.');
      speak("Sorry, I could not retrieve your balance at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section aria-label="Account Summary" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Account Balance</h2>
        
        <div aria-live="polite" aria-atomic="true" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>
          {loading && <span>Loading...</span>}
          {error && <span style={{ color: 'var(--error-color)' }}>{error}</span>}
          {balance !== null && !loading && !error && <span>${balance.toFixed(2)}</span>}
          {balance === null && !loading && !error && <span>Balance hidden</span>}
        </div>
      </section>

      <section aria-label="Quick Actions" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px'
      }}>
        <AccessibleButton 
          onClick={fetchBalance} 
          ariaLabel="Check Balance" 
          readOnHover={true}
        >
          💰 Check Balance
        </AccessibleButton>
        
        <AccessibleButton 
          onClick={() => {
            speak("Transfer funds feature selected.");
            navigate('/send-money');
          }} 
          ariaLabel="Transfer Funds" 
          readOnHover={true}
        >
          💸 Transfer Funds
        </AccessibleButton>
        
        <AccessibleButton 
          onClick={() => speak("Pay bills feature selected.")} 
          ariaLabel="Pay Bills" 
          readOnHover={true}
        >
          🧾 Pay Bills
        </AccessibleButton>
      </section>

      <VoiceNavigator />
    </main>
  );
}
