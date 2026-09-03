// Mock Data & Constants for SAHAY Banking (JavaScript)

export const MOCK_PAYEES = [
  { 
    id: '1', 
    name: 'Ananya Sharma', 
    relation: 'Daughter', 
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 
    accountEnding: '4092', 
    bankName: 'State Bank of India',
    phone: '+91 98765 43210',
    upiId: 'ananya@oksbi'
  },
  { 
    id: '2', 
    name: 'Sunil Kumar', 
    relation: 'Grocer', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 
    accountEnding: '1120', 
    bankName: 'HDFC Bank',
    phone: '+91 98234 56789',
    upiId: 'sunilgrocery@okhdfc'
  },
  { 
    id: '3', 
    name: 'Dr. Sharma', 
    relation: 'Family Clinic', 
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80', 
    accountEnding: '9982', 
    bankName: 'ICICI Bank',
    phone: '+91 97123 45678',
    upiId: 'drsharma@okicici'
  },
  { 
    id: '4', 
    name: 'Rohan Verma', 
    relation: 'Home Repairs', 
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 
    accountEnding: '3341', 
    bankName: 'Punjab National Bank',
    phone: '+91 96543 21098',
    upiId: 'rohanrepairs@okpnb'
  },
];

export const MOCK_TRANSACTIONS = [
  { 
    id: 'TXN-98231', 
    title: 'Govt. Pension Credit', 
    subtitle: 'Central Pension Dept • Today, 10:15 AM', 
    amount: 18500, 
    type: 'credit', 
    date: 'Today', 
    time: '10:15 AM',
    status: 'success', 
    icon: 'arrow-down-left',
    category: 'Pension',
    referenceId: 'GOV-PEN-482910'
  },
  { 
    id: 'TXN-98230', 
    title: 'Fresh Milk & Dairy Store', 
    subtitle: 'Daily essentials • Yesterday, 7:30 AM', 
    amount: 120, 
    type: 'debit', 
    date: 'Yesterday', 
    time: '07:30 AM',
    status: 'success', 
    icon: 'store',
    category: 'Groceries',
    referenceId: 'UPI-DAIRY-771829'
  },
  { 
    id: 'TXN-98229', 
    title: 'Electricity Bill (Power Corp)', 
    subtitle: 'State Power Board • 28 Oct, 4:40 PM', 
    amount: 1450, 
    type: 'debit', 
    date: '28 Oct', 
    time: '04:40 PM',
    status: 'success', 
    icon: 'zap',
    category: 'Utility',
    referenceId: 'EB-BIL-839210'
  },
  { 
    id: 'TXN-98228', 
    title: 'Apollo Medical & Pharmacy', 
    subtitle: 'Monthly Prescription • 24 Oct, 11:20 AM', 
    amount: 850, 
    type: 'debit', 
    date: '24 Oct', 
    time: '11:20 AM',
    status: 'success', 
    icon: 'store',
    category: 'Healthcare',
    referenceId: 'MED-APO-552918'
  },
  { 
    id: 'TXN-98227', 
    title: 'Quarterly Savings Interest', 
    subtitle: 'State Bank Interest Credit • 01 Oct, 09:00 AM', 
    amount: 420, 
    type: 'credit', 
    date: '01 Oct', 
    time: '09:00 AM',
    status: 'success', 
    icon: 'arrow-down-left',
    category: 'Interest',
    referenceId: 'SBI-INT-102948'
  },
];
