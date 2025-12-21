const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. GLOBAL CACHE BUSTING (The Fix) ---
// This middleware runs for EVERY request.
// It forces the browser to never cache the response, fixing the "disappearing data" issue.
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// --- 2. MIDDLEWARE ---
app.use(cors());

// Allows your server to read JSON bodies (req.body) sent by the frontend
app.use(express.json()); 

// Helper for form data (extended: true allows nested objects)
app.use(express.urlencoded({ extended: true }));

// --- 3. ROUTES ---
// Authentication Routes (Login, Register, Me)
app.use('/api/auth', require('./routes/auth.routes'));

// Research Routes (Submit, Approve, Reject, Get All, etc.)
app.use('/api/research', require('./routes/research.routes'));

// --- 4. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));