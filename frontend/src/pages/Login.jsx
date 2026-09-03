import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessibleButton } from '../components/AccessibleButton';
import { useAccessibility } from '../hooks/useAccessibility';

export function Login() {
  const navigate = useNavigate();
  const { speak } = useAccessibility();

  const handleLogin = (e) => {
    e.preventDefault();
    speak("Logged in successfully. Navigating to dashboard.");
    navigate('/dashboard');
  };

  return (
    <main>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '8px' }}>Username</label>
          <input 
            id="username" 
            type="text" 
            aria-required="true"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
          <input 
            id="password" 
            type="password" 
            aria-required="true"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <AccessibleButton type="submit" ariaLabel="Log in to your account">
          Log In
        </AccessibleButton>
      </form>
    </main>
  );
}
