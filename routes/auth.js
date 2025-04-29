
const express = require('express');
const router = express.Router();

const hardcodedEmail = 'admin@example.com';
const hardcodedPassword = 'password123';

router.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (email === hardcodedEmail && password === hardcodedPassword) {
        const fakeToken = 'hardcoded-jwt-token';
        res.json({ token: fakeToken });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;
