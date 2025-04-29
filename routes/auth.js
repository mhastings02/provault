const express = require('express');
const passport = require('passport');
const router = express.Router();

// ✅ Login route using Passport with safe response
router.post('/login', passport.authenticate('local'), (req, res) => {
  if (!req.user) {
    console.log('❌ Login failed: req.user is undefined');
    return res.status(401).json({ message: 'Login failed' });
  }

  console.log('✅ Login successful:', req.user.email);

  res.json({ success: true, role: req.user.role });
});

// ✅ Logout route
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// ✅ Optional: check login status or role
router.get('/check', (req, res) => {
  res.json({ isAdmin: req.user?.role === 'admin' });
});

module.exports = router;
