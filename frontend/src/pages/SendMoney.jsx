import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibleButton } from '../components/AccessibleButton';
import { useAccessibility } from '../hooks/useAccessibility';

export function SendMoney() {
  const navigate = useNavigate();
  const { speak, uiTier } = useAccessibility();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipient || !amount) {
      speak("Please provide both recipient and amount.");
      setStatus("Please fill in all fields.");
      return;
    }

    setStatus("Sending...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/users/user_1/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, amount: parseFloat(amount) })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus(`Successfully sent $${amount} to ${recipient}.`);
        speak(`Money sent successfully to ${recipient}. Returning to dashboard.`);
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setStatus(data.error || "Failed to send money.");
        speak(`Error: ${data.error || "Failed to send money."}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("An error occurred.");
      speak("An error occurred while sending money.");
    }
  };

  return (
    <main>
      <h2 tabIndex="0">Send Money</h2>
      
      <div aria-live="polite" style={{ marginBottom: '16px', fontWeight: 'bold' }}>
        {status && <p>{status}</p>}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: uiTier === 'simplified' ? '32px' : '16px', maxWidth: '400px' }}>
        <div>
          <label htmlFor="recipient" style={{ display: 'block', marginBottom: '8px', fontSize: uiTier === 'simplified' ? '1.5rem' : '1rem' }}>
            {uiTier === 'simplified' ? "Who to send to:" : "Recipient Name"}
          </label>
          <input 
            id="recipient" 
            type="text" 
            aria-required="true"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ width: '100%', padding: uiTier === 'simplified' ? '20px' : '12px', fontSize: uiTier === 'simplified' ? '1.5rem' : '1.2rem' }}
          />
        </div>
        <div>
          <label htmlFor="amount" style={{ display: 'block', marginBottom: '8px', fontSize: uiTier === 'simplified' ? '1.5rem' : '1rem' }}>
            {uiTier === 'simplified' ? "How much:" : "Amount (in dollars)"}
          </label>
          <input 
            id="amount" 
            type="number" 
            min="1"
            step={uiTier === 'simplified' ? "1" : "0.01"}
            aria-required="true"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: uiTier === 'simplified' ? '20px' : '12px', fontSize: uiTier === 'simplified' ? '1.5rem' : '1.2rem' }}
          />
        </div>
        <AccessibleButton type="submit" ariaLabel="Confirm and send money" style={uiTier === 'simplified' ? { fontSize: '1.5rem', padding: '24px' } : {}}>
          Send
        </AccessibleButton>
        <AccessibleButton 
          type="button" 
          variant="secondary"
          onClick={() => navigate('/dashboard')}
          ariaLabel="Cancel and return to dashboard"
          style={uiTier === 'simplified' ? { fontSize: '1.5rem', padding: '24px' } : {}}
        >
          Cancel
        </AccessibleButton>
      </form>
    </main>
  );
}
