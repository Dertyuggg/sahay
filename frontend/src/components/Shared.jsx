import React from 'react';
import { Home, ArrowUpRight, Users, Mic, Volume2, BookOpen } from 'lucide-react';
import { speakEnglish, soundFX } from '../utils/speech';

export function BottomNav({ currentView, onChangeView, onVoiceClick }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-surface-card border-t border-slate-200 px-4 py-2 flex justify-around items-center z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)] max-w-lg mx-auto">
      <NavItem 
        icon={<Home size={26} />} 
        label="Home" 
        isActive={currentView === 'home'} 
        onClick={() => { soundFX.playTap(); onChangeView('home'); }} 
      />
      <NavItem 
        icon={<ArrowUpRight size={26} />} 
        label="Send Money" 
        isActive={currentView === 'send_money_amount' || currentView === 'confirm_transfer'} 
        onClick={() => { soundFX.playTap(); onChangeView('send_money_amount'); }} 
      />
      <NavItem 
        icon={<BookOpen size={26} />} 
        label="Passbook" 
        isActive={currentView === 'passbook'} 
        onClick={() => { soundFX.playTap(); onChangeView('passbook'); }} 
      />
      <NavItem 
        icon={<Users size={26} />} 
        label="Contacts" 
        isActive={currentView === 'contacts'} 
        onClick={() => { soundFX.playTap(); onChangeView('contacts'); }} 
      />
      <NavItem 
        icon={<Mic size={26} />} 
        label="Voice AI" 
        isActive={false} 
        isVoice={true}
        onClick={() => { soundFX.playTap(); onVoiceClick(); }} 
      />
    </div>
  );
}

function NavItem({ icon, label, isActive, isVoice, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 min-w-[56px] min-h-[56px] py-1.5 px-2 rounded-2xl transition-all ${
        isActive 
          ? 'text-brand-teal' 
          : isVoice
            ? 'text-brand-tangerine hover:bg-brand-tangerine/10'
            : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <div className={`p-1.5 rounded-xl transition-all ${
        isActive 
          ? 'bg-brand-teal-light' 
          : isVoice 
            ? 'bg-brand-tangerine/10 text-brand-tangerine' 
            : ''
      }`}>
        {icon}
      </div>
      <span className={`text-[12px] whitespace-nowrap ${isActive ? 'font-bold text-brand-teal' : isVoice ? 'font-bold text-brand-tangerine' : 'font-semibold'}`}>
        {label}
      </span>
    </button>
  );
}

export function TopBar({ 
  title, 
  subtitle, 
  onBack, 
  showSafeBadge, 
  onProfileClick,
  onAudioClick
}) {
  const handleSpeaker = () => {
    soundFX.playTap();
    if (onAudioClick) {
      onAudioClick();
    } else {
      const announcement = `${title}. ${subtitle || ''}. You are on a secure banking screen with SAHAY protection.`;
      speakEnglish(announcement);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-brand-surface sticky top-0 z-30 max-w-lg mx-auto border-b border-slate-100/80">
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={() => { soundFX.playTap(); onBack(); }} 
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-brand-text-dark transition-colors"
            title="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        )}
        {!onBack && (
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
            <div className="w-6 h-6 border-2 border-brand-tangerine rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-brand-teal rounded-full"></div>
            </div>
          </div>
        )}
        <div>
          <h1 className="text-xs font-bold text-brand-teal tracking-wider uppercase">{title}</h1>
          {subtitle && <h2 className="text-xl font-bold text-brand-text-dark leading-tight">{subtitle}</h2>}
        </div>
      </div>
      
      <div className="flex items-center gap-2.5">
        {showSafeBadge && (
          <div className="hidden sm:flex bg-brand-success-light text-brand-success px-3 py-1 rounded-full text-xs font-bold items-center gap-1.5 border border-brand-success/20">
            <div className="w-2 h-2 rounded-full bg-brand-success"></div>
            Account Safe
          </div>
        )}
        <button 
          onClick={handleSpeaker}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-teal shadow-sm border border-slate-100 hover:bg-brand-teal-light transition-colors"
          title="Listen aloud in English"
        >
          <Volume2 size={20} />
        </button>
        <button 
          onClick={() => {
            soundFX.playTap();
            if (onProfileClick) onProfileClick();
          }}
          className="w-10 h-10 bg-brand-teal text-white rounded-full flex items-center justify-center shadow-sm font-bold text-base hover:bg-brand-teal-dark transition-colors"
          title="Open Ramesh Sharma's Profile"
        >
          R
        </button>
      </div>
    </div>
  );
}

export function AssistiveBanner({ frictionScore }) {
  if (frictionScore < 40) return null;
  
  return (
    <div className="mx-6 mb-4 bg-brand-teal-light rounded-3xl p-5 border-l-4 border-brand-teal flex gap-4 items-start shadow-sm">
      <div className="bg-brand-teal text-white p-2 rounded-full mt-1 shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-brand-teal font-bold text-lg">We're right here with you</h3>
          <span className="text-xs font-bold text-brand-teal bg-white px-2 py-1 rounded-full shadow-sm">Simplified Mode Active</span>
        </div>
        <p className="text-brand-text-muted text-base font-medium leading-snug mb-3">
          We noticed you might be having a little trouble. We have made everything on this screen bigger, clearer, and calmer for you.
        </p>
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-text-muted bg-white/60 inline-flex px-3 py-1.5 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-brand-tangerine"></div>
          Assistive Level • Friction Index: {frictionScore} / 100
        </div>
      </div>
    </div>
  );
}
