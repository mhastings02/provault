const express = require('express');
const passport = require('passport');
const router = express.Router();

// Real login using Passport
router.post('/login', passport.authenticate('local'), (req, res) => {
  if (req.user.role === 'admin') {
    return res.redirect('/admin-vault.html');
  } else {
    return res.redirect('/vault.html');
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
