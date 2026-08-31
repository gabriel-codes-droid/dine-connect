import express from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';
import User from '../models/User.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const router = express.Router();

function publicUser(user) {
  return user.toSafeJSON();
}

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch('/me/preferences', requireAuth, async (req, res, next) => {
  try {
    const { theme } = req.body || {};
    if (theme && !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'theme must be light or dark' });
    }

    if (theme) {
      req.user.set('preferences.theme', theme);
      await req.user.save();
    }

    res.json({
      preferences: {
        theme: req.user.preferences?.theme ?? 'light',
      },
    });
  } catch (err) {
    next(err);
  }
});

// --- send email-verification code (for email change) ---
router.post('/send-verification-code', requireAuth, async (req, res, next) => {
  try {
    const { newEmail } = req.body || {};
    const cleanEmail = String(newEmail || '').toLowerCase().trim();
    if (!cleanEmail) {
      return res.status(400).json({ error: 'new email is required' });
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ error: 'email looks invalid' });
    }

    // Check the email isn't already claimed by another account
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: 'email already in use' });
    }

    // Generate a 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    req.user.emailVerificationCode = code;
    req.user.emailVerificationExpires = Date.now() + 600000; // 10 min
    req.user.pendingEmail = cleanEmail;
    await req.user.save({ validateBeforeSave: false });

    await sendEmail({
      to: cleanEmail,
      subject: 'DineConnect — your verification code',
      text: `Your verification code is: ${code}

Enter this code in Settings to confirm your new email address.

If you didn\'t request this, just ignore this email.`,
    });

    res.json({ message: 'verification code sent' });
  } catch (err) {
    next(err);
  }
});

// --- confirm email change with verification code ---
router.post('/confirm-email-change', requireAuth, async (req, res, next) => {
  try {
    const { code } = req.body || {};
    if (!code) {
      return res.status(400).json({ error: 'verification code required' });
    }

    const codeStr = String(code);
    if (
      req.user.emailVerificationCode !== codeStr ||
      !req.user.emailVerificationExpires ||
      req.user.emailVerificationExpires < Date.now()
    ) {
      return res.status(400).json({ error: 'invalid or expired code' });
    }

    // Apply the new email
    req.user.email = req.user.pendingEmail;
    req.user.emailVerificationCode = undefined;
    req.user.emailVerificationExpires = undefined;
    req.user.pendingEmail = undefined;
    await req.user.save();

    res.json({
      message: 'email updated',
      email: req.user.email,
      user: publicUser(req.user),
    });
  } catch (err) {
    next(err);
  }
});

// --- update profile picture URL ---
router.patch('/me/profile-picture', requireAuth, async (req, res, next) => {
  try {
    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ error: 'picture URL is required' });
    }
    req.user.profilePicture = url;
    await req.user.save();
    res.json({ message: 'profile picture updated', profilePicture: url });
  } catch (err) {
    next(err);
  }
});

export default router;
