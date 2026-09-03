import { useState, useEffect, createContext, useContext } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(1);
  const [isHighContrast, setIsHighContrast] = useState(true);
  
  // Apply font size multiplier to root
  useEffect(() => {
    document.documentElement.style.setProperty('--font-multiplier', fontSize);
  }, [fontSize]);

  // Apply theme data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isHighContrast ? 'dark' : 'light');
  }, [isHighContrast]);

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 0.2, 2.0));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 0.2, 1.0));
  const toggleHighContrast = () => setIsHighContrast(prev => !prev);

  // Simple text to speech utility
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      fontSize, increaseFontSize, decreaseFontSize,
      isHighContrast, toggleHighContrast,
      speak
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
