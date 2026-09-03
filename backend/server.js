const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock DB
let users = {
  "user_1": {
    id: "user_1",
    name: "Arthur Pendelton",
    balance: 1250.00,
    transactions: [
      { id: "tx_1", date: "2026-09-01", amount: -50.00, description: "Groceries" },
      { id: "tx_2", date: "2026-08-28", amount: 2000.00, description: "Pension Deposit" }
    ]
  }
};

// Routes
app.get('/api/users/:id', (req, res) => {
  const user = users[req.params.id];
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post('/api/users/:id/transfer', (req, res) => {
  const { amount, to } = req.body;
  const user = users[req.params.id];
  
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.balance < amount) return res.status(400).json({ error: "Insufficient funds" });
  
  user.balance -= amount;
  user.transactions.unshift({
    id: `tx_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    amount: -amount,
    description: `Transfer to ${to}`
  });
  
  res.json({ success: true, balance: user.balance });
});

// Start Server
app.listen(PORT, () => {
  console.log(`SAHAY-24 Backend running on http://localhost:${PORT}`);
});
