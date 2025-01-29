// Simplified structure for MLM App
// Backend: Node.js + Express
// Frontend: React.js

// Directory structure:
// /backend
//   - server.js (Node.js server)
// /frontend
//   - src/
//     - App.js
//     - components/
//       - Login.js
//       - Dashboard.js
// /

/* --- Backend (Node.js + Express) --- */

// /backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Mock database
let users = [];

app.use(express.json());
app.use(cors());

// Routes
app.post('/api/register', (req, res) => {
  const { username, password, referralCode } = req.body;

  // Create referral code for the user
  const newReferralCode = `REF${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  const newUser = {
    id: users.length + 1,
    username,
    password,
    referralCode: newReferralCode,
    referredBy: referralCode || null,
    referrals: [],
    earnings: 0,
  };

  // Add user to mock database
  users.push(newUser);

  res.status(201).json({ message: 'User registered', referralCode: newReferralCode });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    res.status(200).json({ message: 'Login successful', user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/user/:id', (req, res) => {
  const user = users.find((u) => u.id == req.params.id);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.post('/api/refer', (req, res) => {
  const { userId, referralCode } = req.body;
  const user = users.find((u) => u.id == userId);
  const referredUser = users.find((u) => u.referralCode === referralCode);

  if (user && referredUser) {
    referredUser.referrals.push(user.username);
    referredUser.earnings += 10; // Add referral bonus
    res.status(200).json({ message: 'Referral added' });
  } else {
    res.status(404).json({ message: 'Invalid referral' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

/* --- Frontend (React.js) --- */

// /frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;

// /frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;

// /frontend/src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        const res = await axios.get(`http://localhost:5000/api/user/${storedUser.id}`);
        setUser(res.data);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Your Referral Code: {user.referralCode}</p>
      <p>Referrals: {user.referrals.length}</p>
      <p>Earnings: ${user.earnings}</p>
    </div>
  );
};

export default Dashboard;

// To run:
// 1. Start the backend: `node server.js`
// 2. Start the frontend: `npm start` in /frontend
// 3. Navigate to http://localhost:3000/ for the React app
