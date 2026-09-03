import React, { useState } from 'react';
import { ShieldCheck, Phone, ArrowUpRight, UserPlus, Search, X, CheckCircle2, Volume2 } from 'lucide-react';
import { MOCK_PAYEES } from '../types';
import { TopBar } from '../components/Shared';
import { speakEnglish, soundFX } from '../utils/speech';

export function ContactsView({ onBack, onSelectPayee, onOpenProfile }) {
  const [payees, setPayees] = useState(MOCK_PAYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBank, setNewBank] = useState('State Bank of India');

  const filteredPayees = payees.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.relation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPayee = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    
    soundFX.playSuccessChime();
    const newPayee = {
      id: Date.now().toString(),
      name: newName.trim(),
      relation: newRelation.trim() || 'Friend',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      accountEnding: Math.floor(1000 + Math.random() * 9000).toString(),
      bankName: newBank,
      phone: newPhone.trim(),
      upiId: `${newName.toLowerCase().replace(/\s+/g, '')}@okaxis`
    };

    setPayees([newPayee, ...payees]);
    setIsAdding(false);
    setNewName('');
    setNewRelation('');
    setNewPhone('');
    speakEnglish(`${newPayee.name} has been added to your trusted contacts safely.`);
  };

  const handleCall = (payee) => {
    soundFX.playTap();
    speakEnglish(`Connecting phone call to ${payee.name} on ${payee.phone}.`);
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-36">
      <TopBar 
        title="SAHAY" 
        subtitle="Trusted Contacts" 
        onBack={onBack} 
        showSafeBadge={true} 
        onProfileClick={onOpenProfile} 
        onAudioClick={() => {
          speakEnglish(`You have ${payees.length} verified trusted contacts in your SAHAY address book. Tap any person to send money or phone call them.`);
        }}
      />

      <div className="px-6 py-2">
        {/* Header Summary */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold text-brand-text-dark">Safe Payees</h2>
            <p className="text-brand-text-muted text-xs font-medium">Fraud-verified family & friends</p>
          </div>
          <button 
            onClick={() => { soundFX.playTap(); setIsAdding(true); }}
            className="bg-brand-teal text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-brand-teal-dark transition-colors"
          >
            <UserPlus size={16} /> Add Contact
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or relationship..."
            className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl text-sm border border-slate-200 outline-none focus:border-brand-teal text-brand-text-dark placeholder-slate-400 shadow-xs font-medium"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Contacts List */}
        <div className="space-y-3 mb-6">
          {filteredPayees.map(payee => (
            <div 
              key={payee.id} 
              className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:border-brand-teal/30"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img src={payee.image} alt={payee.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs" />
                  <div className="absolute -bottom-1 -right-1 bg-brand-success text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle2 size={12} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-brand-text-dark">{payee.name}</h3>
                    <span className="bg-brand-teal-light text-brand-teal text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {payee.relation}
                    </span>
                  </div>
                  <p className="text-brand-text-muted text-xs font-medium mt-0.5">{payee.phone}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{payee.bankName} •••• {payee.accountEnding}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCall(payee)}
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  title={`Call ${payee.name}`}
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => {
                    soundFX.playTap();
                    onSelectPayee(payee);
                  }}
                  className="bg-brand-tangerine text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-brand-tangerine-dark shadow-xs transition-colors"
                >
                  Send <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Note */}
        <div className="bg-brand-teal-light rounded-3xl p-5 border border-brand-teal/20 mb-6 flex items-start gap-3">
          <ShieldCheck size={22} className="text-brand-teal mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-brand-teal text-sm mb-0.5">Whitelist Safe Protection</h4>
            <p className="text-brand-text-muted text-xs leading-relaxed">
              Every contact in this list has been pre-verified against fraud databases. Sending money to these contacts has instant RBI clearing.
            </p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="w-full bg-slate-200 text-brand-text-dark py-3.5 rounded-2xl font-bold text-base hover:bg-slate-300 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Add Payee Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-brand-text-dark">Add New Trusted Person</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddPayee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Rajesh Gupta"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-teal text-brand-text-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Relationship</label>
                <input 
                  type="text"
                  placeholder="e.g. Son, Daughter, Doctor, Electrician"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-teal text-brand-text-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Phone Number or UPI ID</label>
                <input 
                  type="text"
                  required
                  placeholder="+91 98765 00000 or name@upi"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-teal text-brand-text-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">Bank Name</label>
                <select 
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-teal text-brand-text-dark"
                >
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-brand-teal text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand-teal-dark shadow-sm"
                >
                  Save Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
