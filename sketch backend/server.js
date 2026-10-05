require('dotenv').config();

const cors = require('cors');
const express = require('express');
const db = require('./db');
const communityRoutes = require('./routes/community');

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This frontend origin is not allowed.'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api/community', communityRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ status: 'ok', database: process.env.PGDATABASE || 'dvdrental' });
  } catch {
    res.status(503).json({ status: 'error', message: 'PostgreSQL is unavailable.' });
  }
});

app.listen(port, () => {
  console.log(`Sketch backend listening at http://localhost:${port}`);
});