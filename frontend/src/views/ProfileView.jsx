import React, { useState } from 'react';
import { ShieldCheck, Phone, Volume2, UserCheck, Lock, Bell, AlertTriangle, ArrowRight, HeartHandshake, CheckCircle2, ChevronRight } from 'lucide-react';
import { TopBar } from '../components/Shared';
import { speakEnglish, soundFX } from '../utils/speech';

export function ProfileView({ onBack, onOpenPassbook }) {
  const [voiceAssistanceAlwaysOn, setVoiceAssistanceAlwaysOn] = useState(true);
  const [dailyLimit, setDailyLimit] = useState('50,000');
  const [callModal, setCallModal] = useState(false);
  const [freezeModal, setFreezeModal] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const handleCallCareManager = () => {
    soundFX.playTap();
    setCallModal(true);
    speakEnglish("Calling your dedicated SAHAY Senior Care Manager, Sunita Kapoor. Please stay on the line.");
  };

  const handleReadProfile = () => {
    soundFX.playTap();
    speakEnglish("Hello Ramesh. Your profile is fully verified. Linked to State Bank of India pension account ending in 4 8 2 1. Your daily transfer limit is 50,000 rupees. Your dedicated care manager is Sunita Kapoor.");
  };

  const handleFreezeToggle = () => {
    soundFX.playTap();
    if (!isFrozen) {
      setIsFrozen(true);
      setFreezeModal(false);
      speakEnglish("Your account has been safely frozen for your security. No withdrawals or transfers will be permitted until you speak to your Care Manager.");
    } else {
      setIsFrozen(false);
      setFreezeModal(false);
      speakEnglish("Your account has been safely un-frozen.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-36">
      <TopBar 
        title="SAHAY" 
        subtitle="Profile & Account" 
        onBack={onBack} 
        showSafeBadge={true} 
        onAudioClick={handleReadProfile}
      />

      <div className="px-6 py-4">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-20 h-20 bg-brand-teal text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-brand-text-dark">Ramesh Sharma</h2>
                <CheckCircle2 size={18} className="text-brand-success" />
              </div>
              <p className="text-brand-text-muted text-xs font-semibold">Senior Citizen Pensioner ID: #SBI-8291</p>
              <div className="inline-flex items-center gap-1.5 bg-brand-success-light text-brand-success px-2.5 py-0.5 rounded-full text-xs font-bold mt-1.5 border border-brand-success/20">
                <ShieldCheck size={12} /> Aadhaar & KYC Verified
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-brand-text-muted font-medium">Registered Phone:</span>
              <span className="font-bold text-brand-text-dark">+91 98765 43210</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-text-muted font-medium">Primary Bank:</span>
              <span className="font-bold text-brand-text-dark">State Bank of India</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-text-muted font-medium">Account Number:</span>
              <span className="font-bold text-brand-text-dark">•••• •••• •••• 4821</span>
            </div>
          </div>
        </div>

        {/* Dedicated Senior Care Manager */}
        <div className="bg-brand-teal-light rounded-3xl p-6 border border-brand-teal/20 mb-6 shadow-xs">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" 
                alt="Sunita Kapoor" 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 bg-brand-success w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white">
                <ShieldCheck size={12} />
              </div>
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Your Personal Banker</span>
              <h3 className="text-lg font-bold text-brand-text-dark">Sunita Kapoor</h3>
              <p className="text-brand-text-muted text-xs font-medium">Senior Citizen Care Manager • SBI Connaught Place</p>
            </div>
          </div>

          <p className="text-brand-text-dark text-xs font-medium leading-relaxed mb-4 bg-white/70 p-3 rounded-2xl">
            "Namaste Ramesh ji! I am here to help you anytime with pension queries, fraud checks, or visiting the branch."
          </p>

          <button 
            onClick={handleCallCareManager}
            className="w-full bg-brand-teal text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-teal-dark shadow-sm transition-colors"
          >
            <Phone size={16} />
            Call Sunita Directly (Toll-Free)
          </button>
        </div>

        {/* Preferences & Accessibility */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold text-lg text-brand-text-dark mb-4">Accessibility & Voice Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="pr-4">
                <p className="font-bold text-base text-brand-text-dark">Always Speak in English</p>
                <p className="text-brand-text-muted text-xs">Reads every confirmation aloud automatically</p>
              </div>
              <button 
                onClick={() => {
                  soundFX.playTap();
                  setVoiceAssistanceAlwaysOn(!voiceAssistanceAlwaysOn);
                }}
                className={`w-14 h-8 rounded-full transition-colors relative ${voiceAssistanceAlwaysOn ? 'bg-brand-teal' : 'bg-slate-200'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform ${voiceAssistanceAlwaysOn ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="pr-4">
                <p className="font-bold text-base text-brand-text-dark">Daily Transfer Limit</p>
                <p className="text-brand-text-muted text-xs">Protects against large fraudulent transfers</p>
              </div>
              <span className="font-bold text-brand-teal text-base">₹{dailyLimit}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="pr-4">
                <p className="font-bold text-base text-brand-text-dark">Nominee Registered</p>
                <p className="text-brand-text-muted text-xs">Ananya Sharma (Daughter) • 100% Share</p>
              </div>
              <span className="text-brand-success text-xs font-bold bg-brand-success-light px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Freeze Account */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-brand-text-dark">Emergency Security Switch</h3>
              <p className="text-brand-text-muted text-xs">
                Worried about suspicious calls or fraud? Immediately freeze all outward payments with one tap.
              </p>
            </div>
          </div>

          <button 
            onClick={() => { soundFX.playTap(); setFreezeModal(true); }}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
              isFrozen 
                ? 'bg-brand-success text-white' 
                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
            }`}
          >
            {isFrozen ? 'Account Frozen — Tap to Unfreeze' : 'Emergency Freeze Account'}
          </button>
        </div>

        {/* Return Button */}
        <button 
          onClick={onBack}
          className="w-full bg-slate-200 text-brand-text-dark py-4 rounded-2xl font-bold text-base hover:bg-slate-300 transition-colors"
        >
          Done — Return to Dashboard
        </button>
      </div>

      {/* Call Modal */}
      {callModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-brand-teal rounded-full text-white flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Phone size={32} />
            </div>
            <h3 className="font-bold text-xl text-brand-text-dark mb-1">Calling Sunita Kapoor</h3>
            <p className="text-xs text-brand-teal font-bold mb-4">SBI Senior Citizen Priority Line (1800-200-7242)</p>
            <p className="text-sm text-brand-text-muted mb-6">
              You will be connected to your assigned manager immediately without waiting in any phone menu.
            </p>
            <button 
              onClick={() => setCallModal(false)}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Freeze Confirmation Modal */}
      {freezeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="font-bold text-xl text-brand-text-dark mb-2">
              {isFrozen ? 'Un-Freeze Account?' : 'Freeze Your Account?'}
            </h3>
            <p className="text-sm text-brand-text-muted mb-6">
              {isFrozen 
                ? 'This will restore your normal transfer and UPI abilities.' 
                : 'This will temporarily block all outgoing transactions, UPI payments, and debit card usage until you confirm with Sunita.'}
            </p>
            <div className="space-y-2">
              <button 
                onClick={handleFreezeToggle}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700"
              >
                {isFrozen ? 'Yes, Un-Freeze Now' : 'Yes, Freeze Everything Now'}
              </button>
              <button 
                onClick={() => setFreezeModal(false)}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
