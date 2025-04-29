const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple role guard middleware
const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access only' });
};

// Get all users (admin only)
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Promote or change role
router.post('/user/:id/promote', isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Could not update user role' });
  }
});

// Edit user fields
router.put('/user/:id', isAdmin, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(username && { username }), ...(email && { email }) },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Could not update user' });
  }
});

// Delete user
router.delete('/user/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete user' });
  }
});

module.exports = router;
