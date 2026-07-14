import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'dineconnect' });
});

// API routes
app.use('/api/auth', authRoutes);

// 404
app.use('/api', (req, res) => res.status(404).json({ error: 'not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('[server error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'server error' });
});

// Start server
const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[dineconnect] listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[dineconnect] failed to start:', err.message);
    process.exit(1);
  }
})();
