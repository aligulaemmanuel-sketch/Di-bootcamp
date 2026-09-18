const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data', 'duka-db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const seedData = {
  products: [
    { id: 1, name: 'Bread', category: 'Bakery', stock: 4, price: 60, threshold: 5, unit: 'loaf' },
    { id: 2, name: 'Milk', category: 'Dairy', stock: 18, price: 70, threshold: 8, unit: 'packet' },
    { id: 3, name: 'Soap', category: 'Household', stock: 11, price: 140, threshold: 6, unit: 'bar' },
    { id: 4, name: 'Rice', category: 'Staples', stock: 30, price: 260, threshold: 10, unit: 'bag' }
  ],
  sales: [
    { id: 101, productId: 1, productName: 'Bread', quantity: 2, unitPrice: 60, customer: 'Amina', timestamp: '2026-09-18T08:15:00.000Z' },
    { id: 102, productId: 2, productName: 'Milk', quantity: 3, unitPrice: 70, customer: 'Kibet', timestamp: '2026-09-18T10:05:00.000Z' },
    { id: 103, productId: 3, productName: 'Soap', quantity: 2, unitPrice: 140, customer: 'Walk-in', timestamp: '2026-09-18T12:40:00.000Z' }
  ],
  suppliers: [
    { id: 201, name: 'Nairobi Bulk Foods', phone: '0700-111-222', product: 'Bread', balance: 2500, lastPurchase: '2026-09-12' },
    { id: 202, name: 'Mombasa Dairy Co.', phone: '0722-555-111', product: 'Milk', balance: 1300, lastPurchase: '2026-09-15' }
  ]
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
  const { productId, quantity, customer } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: 'Product and quantity are required.' });
  }

  const product = database.products.find((item) => item.id === Number(productId));

  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const qty = Number(quantity);

  if (qty <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than zero.' });
  }

  if (product.stock < qty) {
    return res.status(400).json({ message: 'Not enough stock available for this sale.' });
  }

  product.stock -= qty;

  const sale = {
    id: Date.now(),
    productId: product.id,
    productName: product.name,
    quantity: qty,
    unitPrice: product.price,
    customer: customer || 'Walk-in',
    timestamp: new Date().toISOString()
  };

  database.sales.push(sale);
  await writeDatabase(database);
  res.status(201).json(sale);
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'DUKA-TECH.html'));
});

app.listen(PORT, () => {
  console.log(`Duka-Tech server running on http://localhost:${PORT}`);
});
