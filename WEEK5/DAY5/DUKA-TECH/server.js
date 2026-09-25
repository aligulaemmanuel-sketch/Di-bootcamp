require('dotenv').config();
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data', 'duka-db.json');
const databasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'duka_tech',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

async function ensureUsersTable() {
  await databasePool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'manager')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

const seedData = {
  products: [
    { id: 1, name: 'White Bread', category: 'Bakery', stock: 18, price: 60, threshold: 5, unit: 'loaf' },
    { id: 2, name: 'Brown Bread', category: 'Bakery', stock: 14, price: 75, threshold: 5, unit: 'loaf' },
    { id: 3, name: 'Sourdough Bread', category: 'Bakery', stock: 10, price: 95, threshold: 4, unit: 'loaf' },
    { id: 4, name: 'Fresh Milk', category: 'Dairy', stock: 20, price: 70, threshold: 8, unit: 'packet' },
    { id: 5, name: 'Skim Milk', category: 'Dairy', stock: 12, price: 80, threshold: 6, unit: 'packet' },
    { id: 6, name: 'Bath Soap', category: 'Household', stock: 18, price: 140, threshold: 6, unit: 'bar' },
    { id: 7, name: 'Liquid Soap', category: 'Household', stock: 8, price: 220, threshold: 4, unit: 'bottle' },
    { id: 8, name: 'Rice', category: 'Staples', stock: 30, price: 260, threshold: 10, unit: 'bag' },
    { id: 9, name: 'Festive Bread', category: 'Bakery', stock: 20, price: 65, threshold: 5, unit: 'loaf' },
    { id: 10, name: 'Broadways Bread', category: 'Bakery', stock: 20, price: 70, threshold: 5, unit: 'loaf' },
    { id: 11, name: 'Eliot Bread', category: 'Bakery', stock: 16, price: 68, threshold: 5, unit: 'loaf' },
    { id: 12, name: 'Superloaf Bread', category: 'Bakery', stock: 22, price: 75, threshold: 5, unit: 'loaf' },
    { id: 13, name: 'Menengai Soap', category: 'Household', stock: 18, price: 55, threshold: 6, unit: 'bar' },
    { id: 14, name: 'Geisha Soap', category: 'Household', stock: 18, price: 65, threshold: 6, unit: 'bar' },
    { id: 15, name: 'Sunlight Soap', category: 'Household', stock: 16, price: 75, threshold: 5, unit: 'bar' },
    { id: 16, name: 'Whitewash Soap', category: 'Household', stock: 14, price: 60, threshold: 5, unit: 'bar' },
    { id: 17, name: 'Msafi Soap', category: 'Household', stock: 16, price: 50, threshold: 5, unit: 'bar' },
    { id: 18, name: 'Flamingo Soap', category: 'Household', stock: 12, price: 70, threshold: 4, unit: 'bar' },
    { id: 19, name: 'Imperial Soap', category: 'Household', stock: 14, price: 80, threshold: 5, unit: 'bar' },
    { id: 20, name: 'Brookside Milk', category: 'Dairy', stock: 20, price: 75, threshold: 8, unit: 'packet' },
    { id: 21, name: 'Daima Milk', category: 'Dairy', stock: 20, price: 68, threshold: 8, unit: 'packet' },
    { id: 22, name: 'Longlife Milk', category: 'Dairy', stock: 18, price: 85, threshold: 6, unit: 'packet' },
    { id: 23, name: 'Tuzo Milk', category: 'Dairy', stock: 18, price: 65, threshold: 6, unit: 'packet' },
    { id: 24, name: 'Ilara Milk', category: 'Dairy', stock: 16, price: 72, threshold: 6, unit: 'packet' },
    { id: 25, name: 'Coca-Cola', category: 'Drinks', stock: 24, price: 80, threshold: 8, unit: 'bottle' },
    { id: 26, name: 'Fanta', category: 'Drinks', stock: 24, price: 80, threshold: 8, unit: 'bottle' },
    { id: 27, name: 'Sprite', category: 'Drinks', stock: 24, price: 80, threshold: 8, unit: 'bottle' },
    { id: 28, name: 'Afia Juice', category: 'Drinks', stock: 18, price: 120, threshold: 6, unit: 'bottle' },
    { id: 29, name: 'Pishori Rice', category: 'Staples', stock: 24, price: 300, threshold: 8, unit: 'bag' },
    { id: 30, name: 'Jogoo Maize Flour', category: 'Staples', stock: 30, price: 150, threshold: 10, unit: 'packet' },
    { id: 31, name: 'Unga Maize Flour', category: 'Staples', stock: 30, price: 145, threshold: 10, unit: 'packet' },
    { id: 32, name: 'Mumias Sugar', category: 'Staples', stock: 20, price: 180, threshold: 7, unit: 'packet' },
    { id: 33, name: 'Elianto Cooking Oil', category: 'Cooking', stock: 16, price: 280, threshold: 5, unit: 'bottle' },
    { id: 34, name: 'Fortune Cooking Oil', category: 'Cooking', stock: 16, price: 270, threshold: 5, unit: 'bottle' },
    { id: 35, name: 'Kimbo Cooking Fat', category: 'Cooking', stock: 14, price: 190, threshold: 5, unit: 'packet' },
    { id: 36, name: 'Blue Band', category: 'Cooking', stock: 18, price: 180, threshold: 6, unit: 'tub' },
    { id: 37, name: 'Omo Detergent', category: 'Cleaning', stock: 16, price: 250, threshold: 5, unit: 'packet' },
    { id: 38, name: 'Ariel Detergent', category: 'Cleaning', stock: 16, price: 280, threshold: 5, unit: 'packet' },
    { id: 39, name: 'Harpic Toilet Cleaner', category: 'Cleaning', stock: 12, price: 220, threshold: 4, unit: 'bottle' },
    { id: 40, name: 'Jik Bleach', category: 'Cleaning', stock: 12, price: 180, threshold: 4, unit: 'bottle' },
    { id: 41, name: 'Colgate Toothpaste', category: 'Personal Care', stock: 18, price: 160, threshold: 6, unit: 'tube' },
    { id: 42, name: 'Vaseline Jelly', category: 'Personal Care', stock: 14, price: 180, threshold: 5, unit: 'jar' },
    { id: 43, name: 'Nivea Lotion', category: 'Personal Care', stock: 12, price: 350, threshold: 4, unit: 'bottle' },
    { id: 44, name: 'Always Sanitary Towels', category: 'Personal Care', stock: 18, price: 180, threshold: 6, unit: 'pack' },
    { id: 45, name: 'Tropical Heat Crisps', category: 'Snacks', stock: 24, price: 70, threshold: 8, unit: 'pack' },
    { id: 46, name: 'Dairiboard Biscuits', category: 'Snacks', stock: 20, price: 60, threshold: 6, unit: 'pack' }
  ],
  sales: [
    { id: 101, productId: 1, productName: 'Bread', quantity: 2, unitPrice: 60, customer: 'Amina', timestamp: '2026-09-18T08:15:00.000Z' },
    { id: 102, productId: 2, productName: 'Milk', quantity: 3, unitPrice: 70, customer: 'Kibet', timestamp: '2026-09-18T10:05:00.000Z' },
    { id: 103, productId: 3, productName: 'Soap', quantity: 2, unitPrice: 140, customer: 'Walk-in', timestamp: '2026-09-18T12:40:00.000Z' }
  ],
  suppliers: [
    { id: 201, name: 'Nairobi Bulk Foods', phone: '0700-111-222', product: 'Bread', balance: 2500, lastPurchase: '2026-09-12' },
    { id: 202, name: 'Mombasa Dairy Co.', phone: '0722-555-111', product: 'Milk', balance: 1300, lastPurchase: '2026-09-15' }
  ],
  bulkOrders: []
};

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(seedData, null, 2));
  }
}

async function readDatabase() {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeDatabase(database) {
  await fs.writeFile(DATA_FILE, JSON.stringify(database, null, 2));
}

function calculateSummary(database) {
  const totalRevenue = database.sales.reduce((sum, sale) => sum + (sale.quantity * sale.unitPrice), 0);
  const productSales = {};

  database.sales.forEach((sale) => {
    productSales[sale.productName] = (productSales[sale.productName] || 0) + sale.quantity;
  });

  const bestSeller = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];
  const lowStockItems = database.products.filter((product) => product.stock < product.threshold).length;

  return {
    totalRevenue,
    totalSales: database.sales.length,
    totalProducts: database.products.length,
    lowStockItems,
    bestSeller: bestSeller ? { name: bestSeller[0], quantity: bestSeller[1] } : null,
    totalInventory: database.products.reduce((sum, product) => sum + product.stock, 0)
  };
}

app.get('/api/health', async (req, res) => {
  res.json({ status: 'ok', message: 'Duka-Tech backend running' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !['customer', 'manager'].includes(role)) {
    return res.status(400).json({ message: 'Name, email, password, and a valid role are required.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await databasePool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name.trim(), email.trim().toLowerCase(), passwordHash, role]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Unable to create account.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !['customer', 'manager'].includes(role)) {
    return res.status(400).json({ message: 'Username, password, and a valid role are required.' });
  }

  try {
    const result = await databasePool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE (LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($1)) AND role = $2',
      [username.trim(), role]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid login details.' });
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to sign in.' });
  }
});

app.get('/api/products', async (req, res) => {
  const database = await readDatabase();
  res.json(database.products);
});

app.post('/api/products', async (req, res) => {
  const database = await readDatabase();
  const { name, category, stock, price, threshold, unit } = req.body;

  if (!name || !category || stock === undefined || price === undefined) {
    return res.status(400).json({ message: 'Product name, category, stock, and price are required.' });
  }

  const newProduct = {
    id: Date.now(),
    name,
    category,
    stock: Number(stock),
    price: Number(price),
    threshold: Number(threshold || 5),
    unit: unit || 'unit'
  };

  database.products.push(newProduct);
  await writeDatabase(database);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
  const database = await readDatabase();
  const productIndex = database.products.findIndex((product) => product.id === Number(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  database.products[productIndex] = {
    ...database.products[productIndex],
    ...req.body,
    id: Number(req.params.id)
  };

  await writeDatabase(database);
  res.json(database.products[productIndex]);
});

app.delete('/api/products/:id', async (req, res) => {
  const database = await readDatabase();
  const productId = Number(req.params.id);
  const originalLength = database.products.length;
  database.products = database.products.filter((product) => product.id !== productId);

  if (database.products.length === originalLength) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  database.sales = database.sales.filter((sale) => sale.productId !== productId);
  await writeDatabase(database);
  res.json({ message: 'Product deleted successfully.' });
});

app.get('/api/sales', async (req, res) => {
  const database = await readDatabase();
  res.json(database.sales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

app.post('/api/sales', async (req, res) => {
  const database = await readDatabase();
  const { productId, quantity, customer, items } = req.body;

  const requestItems = Array.isArray(items) && items.length
    ? items
    : [{ productId, quantity }];

  if (!requestItems.length) {
    return res.status(400).json({ message: 'Product and quantity are required.' });
  }

  const preparedSales = [];

  for (const item of requestItems) {
    const productInfo = Number(item.productId ?? productId);
    const qty = Number(item.quantity ?? quantity);

    if (!productInfo || !qty) {
      return res.status(400).json({ message: 'Product and quantity are required.' });
    }

    if (qty <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero.' });
    }

    const product = database.products.find((entry) => entry.id === productInfo);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: `Not enough stock available for ${product.name}.` });
    }

    product.stock -= qty;

    preparedSales.push({
      id: Date.now() + Math.random(),
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: product.price,
      customer: customer || 'Walk-in',
      timestamp: new Date().toISOString()
    });
  }

  database.sales.push(...preparedSales);
  await writeDatabase(database);
  res.status(201).json({ sales: preparedSales, total: preparedSales.reduce((sum, sale) => sum + (sale.quantity * sale.unitPrice), 0) });
});

app.get('/api/bulk-orders', async (req, res) => {
  const database = await readDatabase();
  res.json(database.bulkOrders || []);
});

app.post('/api/bulk-orders', async (req, res) => {
  const database = await readDatabase();
  const { name, phone, email, location, productId, quantity, deliveryDate, notes } = req.body;
  const product = database.products.find((entry) => entry.id === Number(productId));
  const requestedQuantity = Number(quantity);

  if (!name || !phone || !location || !product || !requestedQuantity) {
    return res.status(400).json({ message: 'Name, phone, location, product, and quantity are required.' });
  }

  if (requestedQuantity < 10) {
    return res.status(400).json({ message: 'Bulk orders must contain at least 10 items.' });
  }

  database.bulkOrders = database.bulkOrders || [];
  const bulkOrder = {
    id: `BO-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : '',
    location: location.trim(),
    productId: product.id,
    productName: product.name,
    quantity: requestedQuantity,
    deliveryDate: deliveryDate || '',
    notes: notes ? notes.trim() : '',
    status: 'Pending review',
    timestamp: new Date().toISOString()
  };

  database.bulkOrders.unshift(bulkOrder);
  await writeDatabase(database);
  res.status(201).json(bulkOrder);
});

app.get('/api/suppliers', async (req, res) => {
  const database = await readDatabase();
  res.json(database.suppliers);
});

app.post('/api/suppliers', async (req, res) => {
  const database = await readDatabase();
  const { name, phone, product, balance, lastPurchase } = req.body;

  if (!name || !product) {
    return res.status(400).json({ message: 'Supplier name and product are required.' });
  }

  const supplier = {
    id: Date.now(),
    name,
    phone: phone || 'N/A',
    product,
    balance: Number(balance || 0),
    lastPurchase: lastPurchase || new Date().toISOString().slice(0, 10)
  };

  database.suppliers.push(supplier);
  await writeDatabase(database);
  res.status(201).json(supplier);
});

app.get('/api/summary', async (req, res) => {
  const database = await readDatabase();
  res.json(calculateSummary(database));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'manager.html'));
});

app.get('/customer', (req, res) => {
  res.sendFile(path.join(__dirname, 'customer.html'));
});

app.get('*', (req, res) => {
  const requestedPath = req.path.toLowerCase();
  if (requestedPath.endsWith('.html') || requestedPath.endsWith('.css') || requestedPath.endsWith('.js')) {
    const staticPath = path.join(__dirname, requestedPath.replace(/^\//, ''));
    res.sendFile(staticPath);
    return;
  }
  res.sendFile(path.join(__dirname, 'login.html'));
});

ensureUsersTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Duka-Tech server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('PostgreSQL connection failed:', error.message);
    process.exit(1);
  });
