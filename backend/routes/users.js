import express from 'express';
import { requireAuth } from '../middleware/auth.js';

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

export default router;
