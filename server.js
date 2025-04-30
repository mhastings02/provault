const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const app = express();

// ✅ Demo Users (In-Memory)
const users = [
  { id: '1', username: 'Admin', email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
  { id: '2', username: 'User', email: 'user@example.com', password: 'User123!', role: 'user' }
];

// ✅ Passport Setup
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return done(null, false, { message: 'Invalid credentials' });
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'demo-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Homepage Fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Login Route
app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true, role: user.role });
    });
  })(req, res, next);
});

// ✅ Logout Route
app.post('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// ✅ Auth Status Check
app.get('/auth/check', (req, res) => {
  res.json({ isAdmin: req.user?.role === 'admin' });
});

// ✅ Public Registration
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User already exists' });

  const newUser = {
    id: String(users.length + 1),
    username: name,
    email,
    password,
    role: 'user'
  };
  users.push(newUser);
  res.status(201).json({ message: 'User registered' });
});

// ✅ Admin Only Routes
const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.sendStatus(403);
};

app.get('/admin/users', isAdmin, (req, res) => {
  res.json(users);
});

app.post('/admin/create-user', isAdmin, (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User already exists' });

  const newUser = {
    id: String(users.length + 1),
    username: name,
    email,
    password,
    role: 'user'
  };
  users.push(newUser);
  res.status(201).json({ message: 'User created' });
});

app.patch('/admin/promote-user/:id', isAdmin, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.sendStatus(404);
  user.role = 'admin';
  res.json({ message: 'User promoted' });
});

app.delete('/admin/delete-user/:id', isAdmin, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.sendStatus(404);
  users.splice(index, 1);
  res.json({ message: 'User deleted' });
});

// ✅ 404 Fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});







