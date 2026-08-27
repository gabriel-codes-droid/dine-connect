import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[dineconnect] listening on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('[dineconnect] failed to start:', error?.message || error);
  process.exitCode = 1;
}
