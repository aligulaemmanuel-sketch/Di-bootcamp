const express = require('express');
const path = require('path');
const db = require('./db');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, '..', 'shopping app');

app.use(express.json());
app.use('/api/products', productRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ status: 'ok', database: 'postgres' });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Database unavailable',
      details: error.message
    });
  }
});

app.use(express.static(frontendDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Urban Basket backend is running at http://localhost:${PORT}`);
});
