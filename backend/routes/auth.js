import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return user.toSafeJSON();
}

// --- signup ---
router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ error: 'username must be 3-30 chars (letters, numbers, _ . -)' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'email looks invalid' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'password must be at least 6 characters' });
    }
    if (role && !['customer', 'restaurant-admin', 'super-admin'].includes(role)) {
      return res.status(400).json({ error: 'invalid role' });
    }

    const lowerEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({
      $or: [{ email: lowerEmail }, { username }],
    });
    if (existing) {
      const field = existing.email === lowerEmail ? 'email' : 'username';
      return res.status(409).json({ error: `an account with that ${field} already exists`, field });
    }

    const user = await User.create({
      username: String(username).trim(),
      email: lowerEmail,
      password: String(password),
      role: role || 'customer',
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'an account with that email or username already exists' });
    }
    return next(err);
  }
});

// --- login ---
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body || {};
    const login = (email || '').toString().toLowerCase().trim();
    if (!login || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await User.findOne({ email: login });
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

// --- check-email (live availability for the signup form) ---
router.get('/check-email', async (req, res, next) => {
  try {
    const email = String(req.query.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'email is required' });
    if (!EMAIL_RE.test(email)) return res.json({ exists: false, valid: false });
    const found = await User.findOne({ email }).select('_id').lean();
    return res.json({ exists: !!found, valid: true });
  } catch (err) {
    return next(err);
  }
});

// --- check-username (live availability for the signup form) ---
router.get('/check-username', async (req, res, next) => {
  try {
    const username = String(req.query.username || '').trim();
    if (!username) return res.status(400).json({ error: 'username is required' });
    if (!USERNAME_RE.test(username)) return res.json({ exists: false, valid: false });
    const found = await User.findOne({ username }).select('_id').lean();
    return res.json({ exists: !!found, valid: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
