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
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Simple admin middleware
const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access only' });
};

// Get all users
router.get('/users', isAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Create a new user
router.post('/create-user', isAdmin, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username: name,
    email,
    password: hashedPassword,
    role: 'user' // default to 'user'
  });

  await newUser.save();
  res.status(201).json({ message: 'User created successfully' });
});

// Delete a user
router.delete('/delete-user/:id', isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// Promote a user
router.patch('/promote-user/:id', isAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: 'admin' },
    { new: true }
  );
  res.json({ message: 'User promoted', user });
});

module.exports = router;

