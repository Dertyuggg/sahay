import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const TelemetryContext = createContext();

export const TelemetryProvider = ({ children }) => {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [backNavCount, setBackNavCount] = useState(0);
  
  const lastLocationRef = useRef(location.pathname);
  const idleTimerRef = useRef(null);

  // Function to log an event locally and send to backend
  const logEvent = async (eventType, meta = {}) => {
    const newEvent = {
      user_id: 'user_1', // Hardcoded as per spec for now
      event_type: eventType,
      screen_id: window.location.pathname,
      timestamp: new Date().toISOString(),
      meta
    };
    
    setEvents(prev => {
      const updated = [...prev, newEvent];
      console.log('Telemetry Event Logged:', newEvent);
      return updated;
    });

    // POST to backend
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/interaction-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
    } catch (err) {
      console.error('Failed to post telemetry event:', err);
    }
  };

  // Track Clicks / Mis-taps
  useEffect(() => {
    const handleClick = (e) => {
      // Check if the click was on an interactive element
      const isInteractive = e.target.closest('button, a, input, [role="button"]');
      
      logEvent(isInteractive ? 'tap' : 'mistap', {
        x: e.clientX,
        y: e.clientY,
        target_tag: e.target.tagName
      });
      
      // Reset idle timer on interaction
      resetIdleTimer();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Track Idle Time (Hesitation)
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      logEvent('hesitation', { duration_ms: 8000 });
    }, 8000); // 8 seconds as per spec
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [location.pathname]);

  // Track Navigation (Back-nav & Abandon)
  useEffect(() => {
    if (lastLocationRef.current === '/send-money' && location.pathname === '/dashboard') {
      // Possible back navigation or abandon
      logEvent('back_nav', { from: '/send-money', to: '/dashboard' });
      setBackNavCount(prev => prev + 1);
    }
    lastLocationRef.current = location.pathname;
  }, [location]);

  return (
    <TelemetryContext.Provider value={{ events, logEvent, backNavCount }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => useContext(TelemetryContext);
