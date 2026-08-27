import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const app = express();

const localOrigins = [
  'https://dineconnect-36bc7.web.app',
  'https://dineconnect-36bc7.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://localhost:5185',
];

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.FIREBASE_HOSTING_URL,
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  ...localOrigins,
].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  return /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.(web\.app|firebaseapp\.com)$/.test(origin);
}

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'dineconnect' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'not found' }));

app.use((err, req, res, next) => {
  console.error('[server error]', err?.message || err);
  res.status(err?.status || 500).json({ error: err?.message || 'server error' });
});

export default app;
