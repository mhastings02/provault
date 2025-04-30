const express = require('express');
const passport = require('passport');
const router = express.Router();

// ✅ Login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      console.log('❌ Login failed');
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log('✅ Login successful:', user.email);
      return res.json({ success: true, role: user.role });
    });
  })(req, res, next);
});

// ✅ Logout route
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// ✅ Admin check route
router.get('/check', (req, res) => {
  res.json({ isAdmin: req.user?.role === 'admin' });
});

module.exports = router;
