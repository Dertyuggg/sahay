import React from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

export const AccessibleButton = ({ 
  children, 
  onClick, 
  ariaLabel, 
  variant = 'primary', 
  readOnHover = false,
  ...props 
}) => {
  const { speak } = useAccessibility();

  const handleMouseEnter = () => {
    if (readOnHover && ariaLabel) {
      speak(ariaLabel);
    }
  };

  const style = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: variant === 'primary' ? 'var(--primary-color)' : 'var(--secondary-color)',
    color: variant === 'primary' ? '#000' : '#fff',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s',
  };

  return (
    <button 
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      aria-label={ariaLabel}
      style={style}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      {...props}
    >
      {children}
    </button>
  );
};
