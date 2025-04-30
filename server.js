const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const app = express();

// ✅ In-memory fake users
const users = [
  {
    id: '1',
    username: 'Admin',
    email: 'admin@example.com',
    password: 'Admin123!', // plain text (demo only!)
    role: 'admin'
  },
  {
    id: '2',
    username: 'NormalUser',
    email: 'user@example.com',
    password: 'User123!',
    role: 'user'
  }
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

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Auth routes
app.post('/auth/login', passport.authenticate('local'), (req, res) => {
  res.json({ success: true, role: req.user.role });
});

app.post('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

app.get('/auth/check', (req, res) => {
  res.json({ isAdmin: req.user?.role === 'admin' });
});

// ✅ Admin user management — in-memory
app.get('/admin/users', (req, res) => {
  if (req.user?.role !== 'admin') return res.sendStatus(403);
  res.json(users);
});

app.post('/admin/create-user', (req, res) => {
  if (req.user?.role !== 'admin') return res.sendStatus(403);
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  if (users.some(u => u.email === email)) {
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

// ✅ Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Fallback
app.use((req, res) => {
  res.status(404).send('Not found');
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));





