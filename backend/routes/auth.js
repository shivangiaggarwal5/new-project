const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register — { name, email, password }
router.post(
  '/register',
  [body('name').trim().notEmpty(), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 6 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { name, email, password } = req.body;
      if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });
      const token = signToken(user._id);
      res.status(201).json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, profileImage: user.profileImage },
      });
    }  catch (err) {
  console.error('Register error:', err);

  res.status(500).json({
    message: 'Something went wrong. Please try again.'
  });
    }
  }
);

// POST /api/auth/login — { email, password }
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
      const token = signToken(user._id);
      res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, profileImage: user.profileImage },
      });
    } catch (err) {
  console.error('Login error:', err);

  res.status(500).json({
    message: 'Something went wrong. Please try again.'
  });
    }
  }
);

// POST /api/auth/logout — stateless JWT: client discards token
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/profile — protected
router.get('/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
