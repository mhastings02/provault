const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const app = express();

// ✅ In-memory users for demo
const users = [
  { id: '1', username: 'Admin', email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
  { id: '2', username: 'User', email: 'user@example.com', password: 'User123!', role: 'user' }
];

// ✅ Passport config
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

// ✅ Serve static HTML from /public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Homepage route (Fixes 404)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Auth routes
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

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


app.get('/auth/check', (req, res) => {
  res.json({ isAdmin: req.user?.role === 'admin' });
});

// ✅ Admin demo-only routes (memory)
app.get('/admin/users', (req, res) => {
  if (req.user?.role !== 'admin') return res.sendStatus(403);
  res.json(users);
});

app.post('/admin/create-user', (req, res) => {
  if (req.user?.role !== 'admin') return res.sendStatus(403);
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

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

app.patch('/admin/promote-user/:id', (req, res) => {
  if (req.user?.role !== 'admin') return res.sendStatus(403);
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    user.role = 'admin';
    res.json({ message: 'User promoted' });
  } else {
    res.sendStatus(404);
  }
});

app.delete('/admin/delete-user/:id', (req, res) => {
  if (req.user?.role !== 'admin') return res.sendStatus(403);
  const index = users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    users.splice(index, 1);
    res.json({ message: 'User deleted' });
  } else {
    res.sendStatus(404);
  }
});

// ✅ Fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ✅ Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});






