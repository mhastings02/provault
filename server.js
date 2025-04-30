const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');

const app = express();

// ✅ Load Passport config
require('./routes/config/passport')(passport);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Sessions with valid options passed
app.use(session({
  secret: 'supersecretkey', // Use an environment variable in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  }),
}));

// ✅ Passport init
app.use(passport.initialize());
app.use(passport.session());

// ✅ Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// ✅ Homepage (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Catch-all fallback for unhandled routes
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});





