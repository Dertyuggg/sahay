import React, { useEffect, useState } from 'react';
import { ShieldCheck, Volume2, ArrowRight, Mic, Home, CheckCircle2, Share2, Copy, X } from 'lucide-react';
import { MOCK_PAYEES } from '../types';
import { TopBar, AssistiveBanner } from '../components/Shared';
import { speakEnglish, amountToEnglishWords, soundFX } from '../utils/speech';

export function TransferFlow({ state, updateState, onNavigate }) {
  if (state.currentView === 'send_money_amount') {
    return <AmountScreen state={state} updateState={updateState} onNavigate={onNavigate} />;
  }
  if (state.currentView === 'confirm_transfer') {
    return <ConfirmScreen state={state} updateState={updateState} onNavigate={onNavigate} />;
  }
  if (state.currentView === 'success') {
    return <SuccessScreen state={state} updateState={updateState} onNavigate={onNavigate} />;
  }
  return null;
}

function AmountScreen({ state, updateState, onNavigate }) {
  const payee = state.selectedPayee || MOCK_PAYEES[0];
  const [amountInput, setAmountInput] = useState(state.transferAmount ? state.transferAmount.toString() : '500');
  const [purpose, setPurpose] = useState(state.transferReason || 'Household & Family');
  const [showPayeeSelector, setShowPayeeSelector] = useState(false);
  const isAssistive = state.frictionScore > 40;

  const currentNumAmount = parseInt(amountInput, 10) || 0;

  const handleContinue = () => {
    soundFX.playTap();
    if (currentNumAmount > 0) {
      updateState({ 
        transferAmount: currentNumAmount,
        selectedPayee: payee,
        transferReason: purpose,
        currentView: 'confirm_transfer' 
      });
    }
  };

  const handleHearAmount = () => {
    soundFX.playTap();
    if (currentNumAmount > 0) {
      const words = amountToEnglishWords(currentNumAmount);
      speakEnglish(`You have entered ${currentNumAmount} rupees. That is ${words} to be sent to ${payee.name}.`);
    } else {
      speakEnglish('Please enter an amount greater than zero rupees.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-36">
      <TopBar 
        title="SAHAY" 
        subtitle="Send Money" 
        onBack={() => onNavigate('home')} 
        showSafeBadge={true}
        onProfileClick={() => onNavigate('profile')}
      />
      
      <AssistiveBanner frictionScore={state.frictionScore} />

      <div className="px-6 py-2">
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-teal-light rounded-full flex items-center justify-center text-brand-teal">
              <ArrowRight size={22} />
            </div>
            <div>
              <h2 className="font-bold text-xl text-brand-text-dark">Who & How Much</h2>
              <p className="text-brand-text-muted font-medium text-xs">Review person and amount safely.</p>
            </div>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-full text-xs font-bold text-brand-text-dark shadow-sm border border-slate-100 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-brand-teal"></div>
            Step 1 of 2
          </div>
        </div>

        {/* Payee Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold tracking-wider text-brand-teal uppercase">Sending Money To</span>
            <button 
              onClick={() => { soundFX.playTap(); setShowPayeeSelector(true); }}
              className="text-brand-teal font-bold text-xs bg-brand-teal-light hover:bg-brand-teal/20 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
            >
              Change Contact
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={payee.image} 
                alt={payee.name} 
                className={`${isAssistive ? 'w-20 h-20' : 'w-16 h-16'} rounded-full object-cover shadow-sm border-2 border-slate-100`} 
              />
              <div className="absolute -bottom-1 -right-1 bg-brand-success w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white">
                <CheckCircle2 size={14} />
              </div>
            </div>
            <div>
              <h3 className={`${isAssistive ? 'text-2xl' : 'text-xl'} font-bold text-brand-text-dark flex items-center gap-2`}>
                {payee.name} 
                <span className="bg-brand-tangerine/10 text-brand-tangerine text-xs px-2 py-0.5 rounded-md font-bold">{payee.relation}</span>
              </h3>
              <p className="text-brand-text-muted font-medium text-xs mt-0.5">{payee.phone}</p>
              <p className="text-brand-success font-semibold text-xs flex items-center gap-1 mt-1">
                <ShieldCheck size={14} /> Verified {payee.bankName} Account •• {payee.accountEnding}
              </p>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 text-center">
          <label className="block text-brand-text-dark font-bold text-lg mb-2">How much money would you like to send?</label>
          <p className="text-brand-text-muted text-xs font-medium mb-4">Enter amount in Rupees</p>

          <div className={`flex items-center justify-center gap-2 bg-brand-surface rounded-2xl ${isAssistive ? 'py-6' : 'py-4'} px-6 mb-4 border border-slate-200`}>
            <span className="text-4xl font-bold text-brand-teal">₹</span>
            <input 
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0"
              className="text-[48px] font-bold text-brand-text-dark bg-transparent w-full max-w-[220px] text-center outline-none placeholder-slate-300 font-[tabular-nums]"
            />
          </div>
          
          {currentNumAmount > 0 && (
            <button 
              onClick={handleHearAmount}
              className="inline-flex items-center gap-2 bg-brand-teal-light text-brand-teal hover:bg-brand-teal/20 px-4 py-2.5 rounded-full font-bold text-sm mb-6 transition-colors shadow-xs"
            >
              <Volume2 size={18} />
              {amountToEnglishWords(currentNumAmount)}
            </button>
          )}

          {/* Quick Amounts */}
          <div className="text-left mb-2">
            <p className="text-brand-text-muted font-semibold text-xs mb-2.5 uppercase tracking-wider">Tap to quickly set amount:</p>
            <div className="grid grid-cols-4 gap-2">
              {['100', '500', '1000', '2000'].map(amt => (
                <button 
                  key={amt}
                  onClick={() => {
                    soundFX.playTap();
                    setAmountInput(amt);
                  }}
                  className={`py-3 rounded-xl font-bold text-base transition-all ${
                    amountInput === amt 
                      ? 'bg-brand-teal text-white shadow-sm' 
                      : 'bg-slate-100 text-brand-text-dark hover:bg-slate-200'
                  }`}
                >
                  ₹{parseInt(amt, 10).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Purpose */}
          <div className="text-left mt-5 pt-4 border-t border-slate-100">
            <p className="text-brand-text-muted font-semibold text-xs mb-2 uppercase tracking-wider">What is this money for?</p>
            <div className="flex flex-wrap gap-2">
              {['Household & Family', 'Medicine & Care', 'Gift', 'Groceries'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { soundFX.playTap(); setPurpose(tag); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    purpose === tag 
                      ? 'bg-brand-tangerine text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Reassurance */}
        <div className="bg-brand-surface-card rounded-2xl p-4 border border-slate-200 flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-success flex items-center justify-center text-white shrink-0 mt-0.5">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="font-bold text-brand-text-dark text-sm mb-0.5">Protected by SAHAY SafeTransfer</h4>
            <p className="text-brand-text-muted font-medium text-xs leading-snug">
              Your money will not be deducted without your final confirmation on the next screen.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleContinue}
          disabled={!currentNumAmount || currentNumAmount <= 0}
          className={`w-full py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all shadow-md ${
            currentNumAmount > 0 
              ? 'bg-brand-tangerine text-white shadow-brand-tangerine/30 hover:bg-brand-tangerine-dark active:scale-[0.99]' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Continue to Confirmation
          <ArrowRight size={22} />
        </button>
      </div>

      {/* Payee Selection Modal */}
      {showPayeeSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-brand-text-dark">Select Recipient</h3>
              <button onClick={() => setShowPayeeSelector(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {MOCK_PAYEES.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    soundFX.playTap();
                    updateState({ selectedPayee: p });
                    setShowPayeeSelector(false);
                  }}
                  className={`w-full p-4 rounded-2xl flex items-center gap-3 text-left transition-all border ${
                    p.id === payee.id ? 'border-brand-teal bg-brand-teal-light/40' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-bold text-base text-brand-text-dark">{p.name}</p>
                    <p className="text-xs text-brand-text-muted">{p.relation} • {p.bankName}</p>
                  </div>
                  {p.id === payee.id && <CheckCircle2 size={20} className="text-brand-teal" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmScreen({ state, updateState, onNavigate }) {
  const payee = state.selectedPayee || MOCK_PAYEES[0];
  const amount = state.transferAmount || 500;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleReadConfirmation = () => {
    soundFX.playTap();
    setIsSpeaking(true);
    const text = `Please review and confirm your transfer. You are sending ${amount} rupees to ${payee.name}, who is your ${payee.relation}. Money will be debited from your State Bank of India pension account ending in 4 8 2 1. The transfer fee is zero rupees. Tap the orange button to send, or white button to cancel.`;
    speakEnglish(text, () => setIsSpeaking(false));
  };

  const handleConfirmTransfer = () => {
    soundFX.playSuccessChime();
    const newBal = state.accountBalance - amount;
    updateState({
      accountBalance: newBal,
      lastTransferSuccess: {
        payee,
        amount,
        transactionId: `SHY-${Math.floor(10000000 + Math.random() * 90000000)}`,
        timestamp: 'Today, 10:22 AM'
      },
      currentView: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-36">
       <TopBar 
         title="Confirm Transfer" 
         onBack={() => updateState({ currentView: 'send_money_amount' })} 
         showSafeBadge={true}
         onProfileClick={() => onNavigate('profile')}
       />
       
       <div className="px-6 py-2">
          {/* Safety Gate Banner */}
          <div className="bg-brand-teal-light text-brand-teal rounded-2xl p-4 flex items-center gap-3 border border-brand-teal/20 mb-5 shadow-xs">
             <ShieldCheck size={28} className="shrink-0" />
             <div>
                <h4 className="font-bold text-base leading-tight">Safety Gate Active</h4>
                <p className="text-xs font-medium">No money will be moved without your final confirmation.</p>
             </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-dark leading-tight mb-1">
            Please Confirm Before We Send Money
          </h1>
          <p className="text-brand-text-muted font-medium text-sm mb-5">
            Review every detail carefully. You are always in complete control.
          </p>

          {/* Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
             {/* Read Aloud Button */}
             <button 
               onClick={handleReadConfirmation}
               className={`w-full mb-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-xs ${
                 isSpeaking 
                   ? 'bg-brand-teal text-white animate-pulse' 
                   : 'bg-brand-teal-light text-brand-teal hover:bg-brand-teal/20'
               }`}
             >
                <Volume2 size={18} />
                {isSpeaking ? 'Reading Confirmation Aloud...' : 'Listen to Confirmation Aloud'}
             </button>

             {state.voiceTranscript && (
                <div className="bg-slate-50 rounded-2xl p-3.5 mb-5 border border-slate-200">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-brand-teal mb-1">
                      <Mic size={14} /> Spoken Voice Command:
                   </div>
                   <p className="text-sm font-semibold text-brand-text-dark italic">
                      "{state.voiceTranscript}"
                   </p>
                </div>
             )}

             {/* Recipient info */}
             <div className="flex items-center gap-4 bg-brand-surface p-4 rounded-2xl mb-5 border border-slate-100">
                <img src={payee.image} alt={payee.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                   <h3 className="text-lg font-bold text-brand-text-dark flex items-center gap-1.5">
                      {payee.name} <ShieldCheck size={16} className="text-brand-success" />
                   </h3>
                   <p className="text-brand-text-muted text-xs font-medium">{payee.relation} • {payee.bankName}</p>
                   <p className="text-brand-text-muted text-xs font-medium mt-0.5">Account ending •••• {payee.accountEnding}</p>
                </div>
             </div>

             {/* Breakdown table */}
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                   <span className="text-brand-text-muted font-bold text-base">Transfer Amount</span>
                   <div className="text-right">
                      <span className="text-3xl font-bold text-brand-text-dark">₹{amount.toLocaleString()}.00</span>
                      <p className="text-brand-teal font-bold text-xs mt-0.5">{amountToEnglishWords(amount)}</p>
                   </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                   <span className="text-brand-text-muted font-bold text-base">Debit From</span>
                   <div className="text-right">
                      <span className="text-base font-bold text-brand-text-dark">Pension Account</span>
                      <p className="text-brand-text-muted font-medium text-xs mt-0.5">State Bank •••• 4821</p>
                   </div>
                </div>

                <div className="flex justify-between items-center pb-2">
                   <span className="text-brand-text-muted font-bold text-base">Transfer Fee</span>
                   <span className="text-brand-success font-bold text-base flex items-center gap-1">
                      <ShieldCheck size={18} /> ₹0 (Always Free)
                   </span>
                </div>
             </div>
          </div>

          <p className="text-center text-brand-text-muted font-semibold text-xs flex items-center justify-center gap-2 mb-5">
             <ShieldCheck size={16} className="text-brand-success" />
             Guaranteed 256-bit Bank Grade RBI Protected Escrow
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
               onClick={handleConfirmTransfer}
               className="w-full bg-brand-tangerine text-white py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-tangerine/30 hover:bg-brand-tangerine-dark active:scale-[0.99] transition-all"
            >
               <CheckCircle2 size={24} />
               Yes, Send ₹{amount} Now
            </button>
            
            <button 
               onClick={() => {
                 soundFX.playTap();
                 updateState({ currentView: 'home' });
               }}
               className="w-full bg-white text-brand-text-dark border-2 border-slate-200 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
               <X size={20} />
               No, Cancel Transfer
            </button>
          </div>
       </div>
    </div>
  );
}

function SuccessScreen({ state, updateState, onNavigate }) {
  const payee = state.selectedPayee || MOCK_PAYEES[0];
  const amount = state.transferAmount || 500;
  const txn = state.lastTransferSuccess;
  const [copied, setCopied] = useState(false);

  // Trigger voice announcement upon reaching the success screen
  useEffect(() => {
    soundFX.playSuccessChime();
    const spokenAnnouncement = `${amount} rupees have been successfully sent to ${payee.name}. Your payment is complete and safe.`;
    speakEnglish(spokenAnnouncement);
  }, [amount, payee.name]);

  const handleReplayVoice = () => {
    soundFX.playTap();
    const spokenAnnouncement = `${amount} rupees have been safely transferred to ${payee.name}. Your new available balance is ${state.accountBalance.toLocaleString()} rupees.`;
    speakEnglish(spokenAnnouncement);
  };

  const handleCopyId = () => {
    soundFX.playTap();
    if (txn?.transactionId) {
      navigator.clipboard?.writeText(txn.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = () => {
    soundFX.playTap();
    speakEnglish("Receipt details ready to share.");
    if (navigator.share) {
      navigator.share({
        title: 'SAHAY Banking Transfer Receipt',
        text: `Sent ₹${amount} safely to ${payee.name} via SAHAY Banking. Reference: ${txn?.transactionId || 'SHY-92837492'}`
      }).catch(() => {});
    } else {
      handleCopyId();
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-36">
       <TopBar 
         title="Transaction Complete" 
         showSafeBadge={true} 
         onProfileClick={() => onNavigate('profile')}
       />
       
       <div className="px-6 py-4 flex flex-col items-center text-center">
          {/* Animated Success Badge */}
          <div className="w-28 h-28 bg-brand-success-light rounded-full flex items-center justify-center mb-4 relative">
             <div className="w-20 h-20 bg-brand-success rounded-full flex items-center justify-center text-white relative z-10 shadow-lg shadow-brand-success/40">
                <CheckCircle2 size={44} />
             </div>
          </div>

          <div className="bg-brand-success-light text-brand-success px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 mb-2 border border-brand-success/20">
             <ShieldCheck size={16} /> Payment Complete
          </div>

          <h1 className="text-3xl font-bold text-brand-text-dark leading-tight mb-1">
            Money Sent Successfully!
          </h1>
          <p className="text-base text-brand-text-muted font-medium mb-6">
            ₹{amount} has been safely transferred to {payee.name}.
          </p>

          {/* Voice Announcement Card */}
          <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 text-left">
             <div className="bg-brand-teal-light rounded-2xl p-4 flex gap-3.5 items-start mb-5 border border-brand-teal/15">
                <button 
                  onClick={handleReplayVoice}
                  className="w-11 h-11 bg-brand-teal hover:bg-brand-teal-dark rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs transition-colors"
                  title="Replay Voice Announcement"
                >
                   <Volume2 size={22} />
                </button>
                <div className="flex-1">
                   <p className="text-xs font-bold text-brand-teal flex items-center gap-1 mb-1">
                      <Mic size={14} /> SAHAY VOICE ANNOUNCEMENT
                   </p>
                   <p className="font-semibold text-brand-text-dark text-base leading-snug">
                      "{amount} rupees have been successfully transferred to {payee.name}."
                   </p>
                   <p className="text-xs text-brand-teal font-medium mt-1">Tap speaker icon to hear again</p>
                </div>
             </div>

             {/* Recipient row */}
             <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                   <img src={payee.image} alt={payee.name} className="w-14 h-14 rounded-full object-cover border border-slate-100 shadow-xs" />
                   <div>
                      <p className="font-bold text-base text-brand-text-dark">{payee.name}</p>
                      <p className="text-brand-text-muted text-xs font-medium">{payee.relation} • {payee.upiId}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="font-bold text-2xl text-brand-text-dark">₹{amount}</p>
                   <p className="text-brand-success font-bold text-xs">Debited</p>
                </div>
             </div>

             {/* Details table */}
             <div className="space-y-3.5 mb-5 text-sm">
                <div className="flex justify-between items-center">
                   <span className="text-brand-text-muted font-medium">Transaction ID</span>
                   <button 
                     onClick={handleCopyId}
                     className="font-bold text-brand-text-dark flex items-center gap-1.5 hover:text-brand-teal transition-colors"
                   >
                      <span className="font-mono">{txn?.transactionId || 'SHY-92837492'}</span>
                      {copied ? <CheckCircle2 size={14} className="text-brand-success" /> : <Copy size={14} className="text-brand-teal" />}
                   </button>
                </div>
                <div className="flex justify-between">
                   <span className="text-brand-text-muted font-medium">Date & Time</span>
                   <span className="font-bold text-brand-text-dark">{txn?.timestamp || 'Today, 10:22 AM'}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-brand-text-muted font-medium">Debited Account</span>
                   <span className="font-bold text-brand-text-dark">Pension A/C •••• 4821</span>
                </div>
             </div>

             {/* Balance comparison card */}
             <div className="bg-brand-surface rounded-2xl p-4 space-y-2 border border-slate-100">
                <div className="flex justify-between text-xs">
                   <span className="text-brand-text-muted font-medium">Previous Balance:</span>
                   <span className="font-semibold text-brand-text-dark">₹{(state.accountBalance + amount).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-red-600 font-medium">Transferred:</span>
                   <span className="font-semibold text-red-600">- ₹{amount}.00</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-slate-200 mt-2">
                   <span className="text-brand-teal font-bold">New Available Balance:</span>
                   <span className="font-bold text-brand-text-dark">₹{state.accountBalance.toLocaleString()}.00</span>
                </div>
             </div>
          </div>

          <div className="w-full bg-brand-surface border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 text-left mb-6">
             <CheckCircle2 size={20} className="text-brand-success shrink-0" />
             <p className="text-brand-text-muted font-medium text-xs leading-snug">
                An official SMS confirmation has been sent to your registered mobile number (+91 ••••• ••210).
             </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button 
               onClick={() => updateState({ currentView: 'home', transferAmount: null, selectedPayee: null, voiceTranscript: '' })}
               className="w-full bg-brand-tangerine text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-sm hover:bg-brand-tangerine-dark transition-colors"
            >
               Done — Return Home <Home size={20} />
            </button>
            
            <button 
               onClick={handleShare}
               className="w-full bg-white text-brand-teal border-2 border-brand-teal/20 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
               <Share2 size={18} />
               Share Receipt Details
            </button>
          </div>
       </div>
    </div>
  );
}
