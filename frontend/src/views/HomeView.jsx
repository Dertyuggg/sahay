import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, ArrowUpRight, BookOpen, Plus, ArrowDownLeft, Store, Zap, Users, Volume2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { MOCK_PAYEES, MOCK_TRANSACTIONS } from '../types';
import { TopBar } from '../components/Shared';
import { speakEnglish, soundFX } from '../utils/speech';

export function HomeView({ balance, onNavigate, onVoiceClick }) {
  const [showBalance, setShowBalance] = useState(true);
  const [isReadingBalance, setIsReadingBalance] = useState(false);

  const handleListenBalance = (e) => {
    e.stopPropagation();
    soundFX.playTap();
    setIsReadingBalance(true);
    const spokenText = `Good morning Ramesh. Your current savings balance in State Bank of India is ${balance.toLocaleString()} rupees. All accounts are protected and verified.`;
    speakEnglish(spokenText, () => setIsReadingBalance(false));
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-36">
      <TopBar 
        title="SAHAY" 
        subtitle="Home Dashboard" 
        showSafeBadge={true} 
        onProfileClick={() => onNavigate('profile')}
        onAudioClick={() => {
          speakEnglish(`Good morning Ramesh. Welcome to SAHAY Banking. Your current balance is ${balance.toLocaleString()} rupees. You can send money, check your passbook, or tap the microphone to use voice commands.`);
        }}
      />
      
      <div className="px-6 py-2">
        {/* Friendly English Greeting */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">Welcome Back</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-text-dark leading-tight tracking-tight mt-0.5">
              Good morning,<br/>
              <span className="text-brand-teal">Mr. Ramesh</span>
            </h1>
          </div>
          <div className="bg-brand-success-light text-brand-success px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-brand-success/20">
            <CheckCircle2 size={14} /> Account Safe
          </div>
        </div>

        {/* Balance Card (Clickable to view balance details) */}
        <div 
          onClick={() => { soundFX.playTap(); onNavigate('balance_detail'); }}
          className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 mb-6 relative overflow-hidden cursor-pointer hover:border-brand-teal/40 transition-all group"
        >
          <div className="absolute right-0 top-0 w-36 h-36 bg-brand-teal-light rounded-bl-[100px] -z-0 opacity-50 transition-transform group-hover:scale-105"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-teal-light flex items-center justify-center text-brand-teal shadow-xs">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
              <div>
                <p className="text-brand-text-dark font-bold text-lg leading-tight">State Bank of India</p>
                <p className="text-brand-text-muted font-medium text-xs">Pension A/C •••• 4821</p>
              </div>
            </div>
            
            {/* Real Audio "Listen" Button in English */}
            <button 
              onClick={handleListenBalance}
              className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 text-sm shadow-sm transition-all ${
                isReadingBalance 
                  ? 'bg-brand-teal text-white animate-pulse' 
                  : 'bg-brand-teal-light text-brand-teal hover:bg-brand-teal/20'
              }`}
            >
              <Volume2 size={18} />
              {isReadingBalance ? 'Speaking...' : 'Listen'}
            </button>
          </div>

          <div className="mb-6 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-brand-text-muted font-semibold text-sm mb-1">Available Savings Balance</p>
                <div className="text-[38px] font-bold text-brand-text-dark leading-none tracking-tight flex items-center gap-2">
                  {showBalance ? `₹${balance.toLocaleString()}.00` : '••••••••'}
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  soundFX.playTap();
                  setShowBalance(!showBalance);
                }}
                className="flex items-center gap-1.5 text-brand-teal font-bold bg-brand-teal-light/60 hover:bg-brand-teal-light px-3 py-1.5 rounded-xl text-sm transition-colors"
              >
                {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                {showBalance ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="bg-brand-surface rounded-2xl p-4 flex justify-between items-center relative z-10 border border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-brand-teal" size={24} />
              <span className="text-xs font-semibold text-brand-text-muted">Govt. Insured up to<br/>₹5,00,000</span>
            </div>
            <div className="text-brand-teal font-bold text-right text-xs flex items-center gap-1">
              View Details <ChevronRight size={16} />
            </div>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => { soundFX.playTap(); onNavigate('send_money_amount'); }}
            className="bg-brand-tangerine text-white p-5 rounded-[24px] flex flex-col justify-between min-h-[145px] shadow-sm relative overflow-hidden group hover:bg-brand-tangerine-dark transition-all active:scale-[0.98]"
          >
            <div className="absolute right-3 top-3 opacity-20 transform group-hover:scale-110 transition-transform">
              <ArrowUpRight size={52} />
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
              <ArrowUpRight size={28} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-xl mb-0.5">Send Money</h3>
              <p className="text-white/85 font-medium text-xs">Instant Safe Transfer</p>
            </div>
          </button>
          
          <button 
            onClick={() => { soundFX.playTap(); onNavigate('passbook'); }}
            className="bg-white p-5 rounded-[24px] flex flex-col justify-between min-h-[145px] shadow-sm border border-slate-100 relative group hover:border-brand-teal/40 transition-all active:scale-[0.98]"
          >
            <div className="absolute right-3 top-3 text-slate-200 transform group-hover:translate-x-1 transition-transform">
              <ChevronRight size={32} />
            </div>
            <div className="w-12 h-12 bg-slate-100 text-brand-teal rounded-2xl flex items-center justify-center mb-3">
              <BookOpen size={28} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-xl text-brand-text-dark mb-0.5">Passbook</h3>
              <p className="text-brand-text-muted font-medium text-xs">View All Statements</p>
            </div>
          </button>
        </div>

        {/* Trusted People Section */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h2 className="text-2xl font-bold text-brand-text-dark flex items-center gap-2">
                Trusted People
                <span className="bg-brand-teal-light text-brand-teal text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {MOCK_PAYEES.length} Safe
                </span>
              </h2>
              <p className="text-brand-text-muted text-xs font-medium">Tap to send money safely</p>
            </div>
            <button 
              onClick={() => { soundFX.playTap(); onNavigate('contacts'); }}
              className="text-brand-teal font-bold text-sm hover:underline"
            >
              View All &gt;
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {MOCK_PAYEES.map(payee => (
              <button 
                key={payee.id} 
                onClick={() => { soundFX.playTap(); onNavigate('send_money_amount', payee); }}
                className="flex flex-col items-center min-w-[84px] group"
              >
                <div className="relative mb-2">
                  <img 
                    src={payee.image} 
                    alt={payee.name} 
                    className="w-[72px] h-[72px] rounded-full object-cover border-4 border-white shadow-sm group-hover:border-brand-teal/40 transition-all" 
                  />
                  <div className="absolute bottom-0 right-0 bg-brand-success text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    <ShieldCheck size={14} />
                  </div>
                </div>
                <p className="font-bold text-brand-text-dark text-sm leading-tight text-center truncate max-w-[80px]">
                  {payee.name}
                </p>
                <p className="text-brand-text-muted text-xs font-medium">{payee.relation}</p>
              </button>
            ))}
            
            <button 
              onClick={() => { soundFX.playTap(); onNavigate('contacts'); }}
              className="flex flex-col items-center min-w-[84px] group"
            >
              <div className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-brand-teal mb-2 bg-white group-hover:border-brand-teal transition-all">
                <Users size={28} />
                <Plus size={16} className="absolute ml-8 mb-8 bg-brand-teal text-white rounded-full p-0.5" />
              </div>
              <p className="font-bold text-brand-teal text-sm leading-tight">Add New</p>
              <p className="text-brand-teal/70 text-xs font-medium">Contact</p>
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <h2 className="text-2xl font-bold text-brand-text-dark">Recent Activity</h2>
              <p className="text-brand-text-muted text-xs font-medium">Latest updates from your bank</p>
            </div>
            <button 
              onClick={() => { soundFX.playTap(); onNavigate('passbook'); }}
              className="text-brand-teal font-bold text-sm hover:underline"
            >
              See All &gt;
            </button>
          </div>
          
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.slice(0, 3).map(tx => (
              <div 
                key={tx.id} 
                onClick={() => { soundFX.playTap(); onNavigate('passbook'); }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-brand-teal/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    tx.type === 'credit' ? 'bg-brand-success-light text-brand-success' : 'bg-slate-100 text-brand-text-muted'
                  }`}>
                    {tx.icon === 'arrow-down-left' && <ArrowDownLeft size={24} />}
                    {tx.icon === 'store' && <Store size={24} />}
                    {tx.icon === 'zap' && <Zap size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-brand-text-dark leading-tight mb-1">{tx.title}</h3>
                    <p className="text-brand-text-muted text-xs font-medium">{tx.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-brand-success' : 'text-brand-text-dark'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-brand-text-muted text-xs font-medium">
                    {tx.type === 'credit' ? 'Credited' : 'Paid via UPI'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice AI Help Banner */}
        <div 
          onClick={() => { soundFX.playTap(); onVoiceClick(); }}
          className="mt-6 bg-brand-teal-light rounded-3xl p-5 flex items-center gap-4 border border-brand-teal/20 cursor-pointer hover:bg-brand-teal/15 transition-all shadow-xs"
        >
          <div className="w-14 h-14 bg-brand-teal rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
            <Volume2 size={28} />
          </div>
          <div>
            <h3 className="text-brand-teal font-bold text-lg leading-tight mb-1">Need help doing anything?</h3>
            <p className="text-brand-text-muted font-medium text-sm leading-snug">
              Simply tap the mic below and tell us what you want to do.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
