import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const TelemetryContext = createContext();

export const TelemetryProvider = ({ children }) => {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [backNavCount, setBackNavCount] = useState(0);
  
  const lastLocationRef = useRef(location.pathname);
  const idleTimerRef = useRef(null);

  // Function to log an event locally
  const logEvent = (eventType, meta = {}) => {
    const newEvent = {
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
