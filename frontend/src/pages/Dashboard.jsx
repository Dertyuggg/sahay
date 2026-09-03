import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import { AccessibleButton } from '../components/AccessibleButton';
import { VoiceNavigator } from '../components/VoiceNavigator';

export function Dashboard() {
  const { speak } = useAccessibility();
  const navigate = useNavigate();

  return (
    <main>
      <section aria-label="Quick Actions" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px'
      }}>
        <AccessibleButton 
          onClick={() => speak("Your balance is $1,250.00")} 
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
