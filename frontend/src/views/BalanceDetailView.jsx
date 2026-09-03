import React, { useState } from 'react';
import { ShieldCheck, Volume2, Phone, CheckCircle2 } from 'lucide-react';
import { TopBar } from '../components/Shared';
import { speakEnglish, soundFX } from '../utils/speech';

export function BalanceDetailView({ balance, onBack, onSendMoney, onOpenProfile }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCallAlert, setShowCallAlert] = useState(false);

  const handleListen = () => {
    soundFX.playTap();
    setIsPlaying(true);
    const spokenText = `Your current available balance is ${balance.toLocaleString()} rupees. You have twenty-four thousand eight hundred fifty rupees available to spend safely. Your monthly pension of eighteen thousand five hundred rupees was credited on the first of this month. Your account is 100 percent safe and protected.`;
    speakEnglish(spokenText, () => setIsPlaying(false));
  };

  const handleCallCare = () => {
    soundFX.playTap();
    setShowCallAlert(true);
    speakEnglish("Calling Sunita, your SAHAY Senior Banking Care Specialist.");
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-36">
      <TopBar 
        title="SAHAY" 
        subtitle="Account Balance" 
        onBack={onBack} 
        showSafeBadge={true} 
        onProfileClick={onOpenProfile} 
      />

      <div className="px-6 py-4">
        {/* Main Balance Display Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-success"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
              State Bank of India • Pension Account
            </span>
          </div>

          <h1 className="text-[44px] font-bold text-brand-text-dark leading-tight my-2">
            ₹{balance.toLocaleString()}.00
          </h1>

          <div className="bg-brand-teal-light text-brand-teal rounded-2xl p-4 my-4 border border-brand-teal/15 text-left flex items-start gap-3">
            <ShieldCheck size={24} className="shrink-0 mt-0.5 text-brand-teal" />
            <p className="font-semibold text-sm leading-snug">
              You have twenty-four thousand eight hundred fifty rupees available to spend safely.
            </p>
          </div>

          {/* Listen to Balance Button */}
          <button
            onClick={handleListen}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-sm ${
              isPlaying
                ? 'bg-brand-teal text-white animate-pulse'
                : 'bg-brand-tangerine text-white shadow-lg shadow-brand-tangerine/25 hover:bg-brand-tangerine-dark'
            }`}
          >
            <Volume2 size={24} />
            {isPlaying ? 'Speaking to You Now...' : 'Listen to Balance'}
          </button>
          <p className="text-xs text-brand-text-muted font-semibold mt-2">
            Tap to hear amount read aloud in clear English
          </p>

          <p className="text-xs text-brand-text-muted font-medium mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1">
            <CheckCircle2 size={14} className="text-brand-success" />
            Last updated: Today, 10:15 AM (Safe & RBI Synced)
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 space-y-4">
          <h3 className="font-bold text-lg text-brand-text-dark mb-2">Account Breakdown</h3>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <div>
              <p className="font-bold text-brand-text-dark text-base">Monthly Pension Deposit</p>
              <p className="text-brand-text-muted text-xs font-medium">Deposited safely on 1st of this month</p>
            </div>
            <span className="font-bold text-brand-success text-lg">+₹18,500.00</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <div>
              <p className="font-bold text-brand-text-dark text-base">Primary Account Number</p>
              <p className="text-brand-text-muted text-xs font-medium">State Bank of India</p>
            </div>
            <span className="font-bold text-brand-text-dark text-base">•••• 4821</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-bold text-brand-text-dark text-base">Available for Transfer</p>
              <p className="text-brand-text-muted text-xs font-medium">Safe to transfer anytime</p>
            </div>
            <span className="font-bold text-brand-teal text-lg">₹{balance.toLocaleString()}.00</span>
          </div>
        </div>

        {/* Care Manager Prompt */}
        <div className="bg-brand-surface-card rounded-3xl p-5 border border-slate-200 mb-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-teal text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
            <Phone size={22} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-brand-text-dark text-base mb-1">Need this explained over phone?</h4>
            <p className="text-brand-text-muted text-sm font-medium leading-snug mb-3">
              Sunita, your dedicated SAHAY Senior Care Manager, is free to talk.
            </p>
            <button
              onClick={handleCallCare}
              className="bg-brand-teal text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand-teal-dark shadow-sm"
            >
              <Phone size={16} />
              Call Sunita Now
            </button>
          </div>
        </div>

        {showCallAlert && (
          <div className="bg-brand-teal-light text-brand-teal p-4 rounded-2xl mb-6 border border-brand-teal/20 text-center font-bold animate-in fade-in">
            Connecting you to Care Specialist Sunita Kapoor (1800-200-7242)...
          </div>
        )}

        {/* Return Home Button */}
        <div className="space-y-3">
          <button
            onClick={onSendMoney}
            className="w-full bg-brand-tangerine text-white py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-brand-tangerine-dark transition-colors"
          >
            Send Money Now
          </button>
          <button
            onClick={onBack}
            className="w-full bg-white text-brand-text-dark border border-slate-200 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors"
          >
            Done — Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
