import React, { useState } from 'react';
import { ShieldCheck, Volume2, ArrowDownLeft, Store, Zap, Search, Download, ArrowLeft, ArrowUpRight, CheckCircle2, FileText, X } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../types';
import { TopBar } from '../components/Shared';
import { speakEnglish, soundFX } from '../utils/speech';

export function PassbookView({ balance, onBack, onSendMoney, onOpenProfile }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const filteredTransactions = MOCK_TRANSACTIONS.filter(tx => {
    if (filter === 'credit' && tx.type !== 'credit') return false;
    if (filter === 'debit' && tx.type !== 'debit') return false;
    if (searchTerm.trim() && !tx.title.toLowerCase().includes(searchTerm.toLowerCase()) && !tx.category.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleReadSummary = () => {
    soundFX.playTap();
    setIsReadingAloud(true);
    const text = `Here is your account statement summary. Your current balance is ${balance.toLocaleString()} rupees. Your latest transaction was a credit of eighteen thousand five hundred rupees from Government Pension on today at ten fifteen AM. All accounts are safe and verified.`;
    speakEnglish(text, () => setIsReadingAloud(false));
  };

  const handleDownload = () => {
    soundFX.playSuccessChime();
    setDownloadSuccess(true);
    speakEnglish("Your official bank statement has been downloaded safely to your device.");
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const renderIcon = (icon, type) => {
    if (type === 'credit') {
      return <ArrowDownLeft size={24} className="text-brand-success" />;
    }
    if (icon === 'zap') return <Zap size={24} className="text-amber-600" />;
    if (icon === 'store') return <Store size={24} className="text-slate-600" />;
    return <ArrowUpRight size={24} className="text-brand-tangerine" />;
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-36">
      <TopBar 
        title="SAHAY" 
        subtitle="Passbook & Statement" 
        onBack={onBack} 
        showSafeBadge={true} 
        onProfileClick={onOpenProfile} 
        onAudioClick={handleReadSummary}
      />

      <div className="px-6 py-2">
        {/* Passbook Summary Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-brand-text-muted font-semibold text-xs uppercase tracking-wider">Account Statement</p>
              <h2 className="text-2xl font-bold text-brand-text-dark mt-0.5">State Bank of India</h2>
              <p className="text-brand-text-muted text-xs font-medium">Pension Account •••• 4821</p>
            </div>
            <button 
              onClick={handleReadSummary}
              className={`px-3.5 py-2 rounded-full font-bold flex items-center gap-1.5 text-xs shadow-xs transition-all ${
                isReadingAloud 
                  ? 'bg-brand-teal text-white animate-pulse' 
                  : 'bg-brand-teal-light text-brand-teal hover:bg-brand-teal/20'
              }`}
            >
              <Volume2 size={16} />
              {isReadingAloud ? 'Reading...' : 'Read Aloud'}
            </button>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
            <div>
              <span className="text-xs text-brand-text-muted font-medium">Current Available Balance:</span>
              <p className="text-3xl font-bold text-brand-text-dark">₹{balance.toLocaleString()}.00</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] bg-brand-success-light text-brand-success px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                <CheckCircle2 size={12} /> RBI Insured
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, grocery, medicine..."
              className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl text-sm border border-slate-200 outline-none focus:border-brand-teal text-brand-text-dark placeholder-slate-400 shadow-xs font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Activity' },
              { key: 'credit', label: 'Money In (Deposits)' },
              { key: 'debit', label: 'Money Out (Payments)' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  soundFX.playTap();
                  setFilter(tab.key);
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.key 
                    ? 'bg-brand-teal text-white shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3 mb-6">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-brand-text-muted border border-slate-100">
              <FileText size={36} className="mx-auto mb-2 opacity-40 text-brand-teal" />
              <p className="font-bold text-base text-brand-text-dark">No entries found</p>
              <p className="text-xs mt-1">Try clearing your search term.</p>
            </div>
          ) : (
            filteredTransactions.map(tx => (
              <div 
                key={tx.id} 
                onClick={() => {
                  soundFX.playTap();
                  setSelectedTx(tx);
                }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-brand-teal/30 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    tx.type === 'credit' ? 'bg-brand-success-light text-brand-success' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {renderIcon(tx.icon, tx.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-brand-text-dark leading-snug mb-0.5">{tx.title}</h3>
                    <p className="text-brand-text-muted text-xs font-medium">{tx.subtitle}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-brand-success' : 'text-brand-text-dark'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </p>
                  <span className={`text-[11px] font-bold ${tx.type === 'credit' ? 'text-brand-success' : 'text-brand-text-muted'}`}>
                    {tx.type === 'credit' ? 'Credit' : 'Debit'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Download Statement Box */}
        <div className="bg-brand-teal-light rounded-3xl p-5 border border-brand-teal/20 mb-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-teal shadow-xs">
              <Download size={24} />
            </div>
            <div>
              <h4 className="font-bold text-brand-text-dark text-sm">Download Official Statement</h4>
              <p className="text-brand-text-muted text-xs font-medium">Safe PDF for this month</p>
            </div>
          </div>
          <button 
            onClick={handleDownload}
            className="bg-brand-teal text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-teal-dark shadow-xs transition-colors"
          >
            {downloadSuccess ? 'Downloaded!' : 'Download'}
          </button>
        </div>

        {downloadSuccess && (
          <div className="bg-brand-success-light text-brand-success p-3 rounded-2xl mb-6 text-xs font-bold text-center border border-brand-success/20 animate-in fade-in">
            ✓ Passbook statement saved in Downloads as PDF.
          </div>
        )}

        {/* Bottom Quick Action */}
        <div className="space-y-3">
          <button 
            onClick={onSendMoney}
            className="w-full bg-brand-tangerine text-white py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-brand-tangerine-dark transition-colors"
          >
            Send Money to Someone
          </button>
          <button 
            onClick={onBack}
            className="w-full bg-white text-brand-text-dark border border-slate-200 py-3.5 rounded-2xl font-bold text-base hover:bg-slate-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-brand-text-dark">Transaction Receipt</h3>
              <button 
                onClick={() => setSelectedTx(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="py-6 text-center">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
                selectedTx.type === 'credit' ? 'bg-brand-success-light text-brand-success' : 'bg-slate-100 text-slate-600'
              }`}>
                {renderIcon(selectedTx.icon, selectedTx.type)}
              </div>
              <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">{selectedTx.category}</p>
              <h4 className="text-xl font-bold text-brand-text-dark mb-1">{selectedTx.title}</h4>
              <p className={`text-3xl font-bold ${selectedTx.type === 'credit' ? 'text-brand-success' : 'text-brand-text-dark'}`}>
                {selectedTx.type === 'credit' ? '+' : '-'}₹{selectedTx.amount.toLocaleString()}.00
              </p>
              <span className="inline-block mt-2 bg-brand-success-light text-brand-success px-3 py-1 rounded-full text-xs font-bold">
                ✓ Bank Confirmed & Settled
              </span>
            </div>

            <div className="bg-brand-surface rounded-2xl p-4 space-y-3 mb-6 border border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-text-muted font-medium">Reference Number:</span>
                <span className="font-mono font-bold text-brand-text-dark">{selectedTx.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-muted font-medium">Date & Time:</span>
                <span className="font-bold text-brand-text-dark">{selectedTx.date}, {selectedTx.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-muted font-medium">Account:</span>
                <span className="font-bold text-brand-text-dark">SBI Pension A/C •••• 4821</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-muted font-medium">Transfer Method:</span>
                <span className="font-bold text-brand-teal">Direct RBI NEFT / UPI Safe</span>
              </div>
            </div>

            <button 
              onClick={() => {
                soundFX.playTap();
                const announce = `${selectedTx.title}, amount ${selectedTx.amount} rupees ${selectedTx.type === 'credit' ? 'received' : 'paid'} on ${selectedTx.date}. Reference ID ${selectedTx.referenceId}.`;
                speakEnglish(announce);
              }}
              className="w-full bg-brand-teal-light text-brand-teal py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mb-3 hover:bg-brand-teal/20"
            >
              <Volume2 size={18} />
              Read Receipt Aloud
            </button>

            <button 
              onClick={() => setSelectedTx(null)}
              className="w-full bg-brand-tangerine text-white py-3 rounded-xl font-bold text-base hover:bg-brand-tangerine-dark transition-colors"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
