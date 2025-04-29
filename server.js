const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express(); // ← MUST come first

app.use(cors());
app.use(express.json()); // ← Correct
app.use(express.urlencoded({ extended: true })); // ← Correct

// Serve static frontend
app.use(express.static('public'));


// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

