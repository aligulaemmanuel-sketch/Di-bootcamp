require('dotenv').config();
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_DIRECTORY = path.resolve(process.env.DUKA_DATA_DIR || path.join(__dirname, 'data'));
const DATA_FILE = path.join(DATA_DIRECTORY, 'duka-db.json');
const USERS_FILE = path.join(DATA_DIRECTORY, 'duka-users.json');
const PRIVATE_DOCUMENTS_DIR = path.resolve(process.env.VERIFICATION_DOCUMENTS_DIR || path.join(os.homedir(), '.duka-tech-private-documents'));
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
let VERIFICATION_ENCRYPTION_KEY = process.env.VERIFICATION_ENCRYPTION_KEY || '';
const VERIFICATION_KEY_FILE = path.join(PRIVATE_DOCUMENTS_DIR, '.encryption-key');
const SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;
const verificationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 2, fileSize: 5 * 1024 * 1024 }
});
const hasDatabaseConfig = Boolean(process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGUSER));
const databasePool = hasDatabaseConfig ? new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'duka_tech',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

app.use(cors());
app.use(express.json());
app.use('/data', (req, res) => res.status(404).json({ message: 'Not found.' }));
app.use(express.static(__dirname));

async function ensureUsersTable() {
  if (!databasePool) return;

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

async function ensureVerificationEncryptionKey() {
  const relativeDocumentsPath = path.relative(__dirname, PRIVATE_DOCUMENTS_DIR);
  if (!relativeDocumentsPath.startsWith(`..${path.sep}`) && relativeDocumentsPath !== '..') {
    throw new Error('Verification documents must be stored outside the public web directory.');
  }
  await fs.mkdir(PRIVATE_DOCUMENTS_DIR, { recursive: true, mode: 0o700 });

  let storedKey = '';
  try {
    storedKey = (await fs.readFile(VERIFICATION_KEY_FILE, 'utf8')).trim();
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (VERIFICATION_ENCRYPTION_KEY) {
    if (VERIFICATION_ENCRYPTION_KEY.length < 32) {
      throw new Error('VERIFICATION_ENCRYPTION_KEY must contain at least 32 characters.');
    }
    if (storedKey && storedKey !== VERIFICATION_ENCRYPTION_KEY) {
      throw new Error('VERIFICATION_ENCRYPTION_KEY does not match the private key used for shop documents.');
    }
    if (!storedKey) {
      try {
        await fs.writeFile(VERIFICATION_KEY_FILE, VERIFICATION_ENCRYPTION_KEY, { flag: 'wx', mode: 0o600 });
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        storedKey = (await fs.readFile(VERIFICATION_KEY_FILE, 'utf8')).trim();
        if (storedKey !== VERIFICATION_ENCRYPTION_KEY) {
          throw new Error('VERIFICATION_ENCRYPTION_KEY does not match the private key used for shop documents.');
        }
      }
    }
    return;
  }

  VERIFICATION_ENCRYPTION_KEY = storedKey;
  if (!VERIFICATION_ENCRYPTION_KEY) {
    const generatedKey = crypto.randomBytes(32).toString('hex');
    try {
      await fs.writeFile(VERIFICATION_KEY_FILE, generatedKey, { flag: 'wx', mode: 0o600 });
      VERIFICATION_ENCRYPTION_KEY = generatedKey;
    } catch (writeError) {
      if (writeError.code !== 'EEXIST') throw writeError;
      VERIFICATION_ENCRYPTION_KEY = (await fs.readFile(VERIFICATION_KEY_FILE, 'utf8')).trim();
    }
  }
  if (VERIFICATION_ENCRYPTION_KEY.length < 32) {
    throw new Error('The stored shop verification encryption key is invalid.');
  }
}

const seedData = {
  shops: [{ id: 1, ownerId: 1, name: 'Duka-Tech Demo Shop', location: '', verificationStatus: 'approved' }],
  products: [
    { id: 1, name: 'White Bread', category: 'Bakery', stock: 18, price: 60, threshold: 5, unit: 'loaf' },
    { id: 2, name: 'Brown Bread', category: 'Bakery', stock: 14, price: 75, threshold: 5, unit: 'loaf' },
    { id: 3, name: 'Sourdough Bread', category: 'Bakery', stock: 10, price: 95, threshold: 4, unit: 'loaf' },
    { id: 4, name: 'Fresh Milk', category: 'Dairy', stock: 20, price: 70, threshold: 8, unit: 'packet' },
    { id: 5, name: 'Skim Milk', category: 'Dairy', stock: 12, price: 80, threshold: 6, unit: 'packet' },
    { id: 6, name: 'Imperial Leather Classic Bath Soap', category: 'Household', stock: 18, price: 140, threshold: 6, unit: 'bar' },
    { id: 7, name: 'Morning Fresh Dishwashing Liquid', category: 'Household', stock: 8, price: 220, threshold: 4, unit: 'bottle' },
    { id: 8, name: 'Rice', category: 'Staples', stock: 30, price: 260, threshold: 10, unit: 'bag' },
    { id: 9, name: 'Festive Supreme White Bread', category: 'Bakery', stock: 20, price: 65, threshold: 5, unit: 'loaf' },
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
  const database = JSON.parse(data);
  let changed = false;

  if (!Array.isArray(database.shops) || database.shops.length === 0) {
    database.shops = [{ id: 1, ownerId: 1, name: 'Duka-Tech Demo Shop', location: '', verificationStatus: 'approved' }];
    changed = true;
  }

  const defaultShop = database.shops[0];
  for (const shop of database.shops) {
    if (!shop.verificationStatus) {
      const isSeededDemoShop = Number(shop.id) === 1 && Number(shop.ownerId) === 1;
      shop.verificationStatus = isSeededDemoShop ? 'approved' : 'rejected';
      if (isSeededDemoShop) {
        shop.verifiedAt = new Date().toISOString();
      } else {
        shop.verificationReviewNote = 'Submit your owner ID and business license documents for administrator review.';
      }
      changed = true;
    }
  }
  for (const product of database.products) {
    if (product.shopId === undefined) {
      product.shopId = defaultShop.id;
      changed = true;
    }
  }
  for (const sale of database.sales) {
    if (sale.shopId === undefined) {
      const product = database.products.find((entry) => entry.id === sale.productId);
      sale.shopId = product ? product.shopId : defaultShop.id;
      sale.shopName = database.shops.find((shop) => shop.id === sale.shopId)?.name || defaultShop.name;
      changed = true;
    }
  }
  for (const supplier of database.suppliers) {
    if (supplier.shopId === undefined) {
      supplier.shopId = defaultShop.id;
      changed = true;
    }
  }
  if (!Array.isArray(database.bulkOrders)) {
    database.bulkOrders = [];
    changed = true;
  }

  if (changed) await writeDatabase(database);
  return database;
}

async function writeDatabase(database) {
  await fs.writeFile(DATA_FILE, JSON.stringify(database, null, 2));
}

async function ensureUsersStore() {
  try {
    await fs.access(USERS_FILE);
    return;
  } catch (error) {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    const defaultUsers = [
      {
        id: 1,
        name: 'Manager',
        email: 'manager@duka.com',
        username: 'manager',
        password_hash: await bcrypt.hash('manager123', 12),
        role: 'manager'
      },
      {
        id: 2,
        name: 'Customer',
        email: 'customer@duka.com',
        username: 'customer',
        password_hash: await bcrypt.hash('customer123', 12),
        role: 'customer'
      }
    ];
    await fs.writeFile(USERS_FILE, JSON.stringify({ users: defaultUsers }, null, 2));
  }
}

async function readUsers() {
  await ensureUsersStore();
  const data = await fs.readFile(USERS_FILE, 'utf8');
  const parsed = JSON.parse(data);
  return Array.isArray(parsed.users) ? parsed.users : [];
}

function createAuthToken(userId) {
  const expiresAt = Date.now() + SESSION_LIFETIME_MS;
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function getAuthenticatedUserId(req) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const [userIdText, expiresAtText, signature] = token.split('.');
  const userId = Number(userIdText);
  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(userId) || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() || !signature) {
    return null;
  }

  const payload = `${userIdText}.${expiresAtText}`;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const suppliedSignature = Buffer.from(signature, 'hex');
  const expectedSignature = Buffer.from(expected, 'hex');
  if (suppliedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(suppliedSignature, expectedSignature)) {
    return null;
  }
  return userId;
}

function hasVerificationEncryptionKey() {
  return VERIFICATION_ENCRYPTION_KEY.length >= 32;
}

function encryptSensitiveValue(value) {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash('sha256').update(VERIFICATION_ENCRYPTION_KEY).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptSensitiveValue(value) {
  if (!value) return '';
  const [ivHex, tagHex, encryptedHex] = String(value || '').split(':');
  const key = crypto.createHash('sha256').update(VERIFICATION_ENCRYPTION_KEY).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]).toString('utf8');
}

function encryptDocument(buffer) {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash('sha256').update(VERIFICATION_ENCRYPTION_KEY).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
}

function decryptDocument(buffer) {
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const key = crypto.createHash('sha256').update(VERIFICATION_ENCRYPTION_KEY).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isSupportedDocument(file) {
  if (file.mimetype === 'application/pdf') return file.buffer.subarray(0, 5).toString() === '%PDF-';
  if (file.mimetype === 'image/jpeg') {
    return file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
  }
  if (file.mimetype === 'image/png') {
    return file.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  return false;
}

function parseVerificationUpload(req, res, next) {
  verificationUpload.fields([
    { name: 'ownerIdDocument', maxCount: 1 },
    { name: 'businessLicenseDocument', maxCount: 1 }
  ])(req, res, (error) => {
    if (!error) return next();
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Each verification document must be 5 MB or smaller.'
      : error.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'Upload one owner ID and one business license document.'
        : 'Unable to read the verification documents.';
    res.status(400).json({ message });
  });
}

async function saveVerificationDocuments(files) {
  await fs.mkdir(PRIVATE_DOCUMENTS_DIR, { recursive: true });
  const saved = [];
  try {
    for (const [field, file] of Object.entries(files)) {
      const document = file[0];
      if (!isSupportedDocument(document)) {
        throw new Error('Documents must be valid PDF, JPG, or PNG files.');
      }
      const id = crypto.randomUUID();
      const extension = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png' }[document.mimetype];
      const storageName = `${id}${extension}.enc`;
      await fs.writeFile(path.join(PRIVATE_DOCUMENTS_DIR, storageName), encryptDocument(document.buffer), { flag: 'wx' });
      saved.push({
        id,
        kind: field === 'ownerIdDocument' ? 'Owner ID' : 'Business license',
        originalName: path.basename(document.originalname).replace(/[^\w.-]/g, '_').slice(0, 120),
        mimeType: document.mimetype,
        storageName
      });
    }
    return saved;
  } catch (error) {
    await Promise.all(saved.map((document) => fs.unlink(path.join(PRIVATE_DOCUMENTS_DIR, document.storageName)).catch(() => {})));
    throw error;
  }
}

async function getAdminContext(req) {
  const userId = getAuthenticatedUserId(req);
  if (userId !== 0 || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return null;
  return { role: 'admin' };
}

async function requireAdmin(req, res) {
  const admin = await getAdminContext(req);
  if (!admin) {
    res.status(401).json({ message: 'Sign in with a configured administrator account to review shop applications.' });
    return null;
  }
  return admin;
}

async function getManagerContext(req) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return null;

  let user;
  if (databasePool) {
    const result = await databasePool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1 AND role = $2',
      [userId, 'manager']
    );
    user = result.rows[0];
  } else {
    const users = await readUsers();
    user = users.find((candidate) => candidate.id === userId && candidate.role === 'manager');
  }
  if (!user) return null;

  const database = await readDatabase();
  let shop = database.shops.find((entry) => Number(entry.ownerId) === userId);
  if (!shop) {
    shop = { id: userId, ownerId: userId, name: `${user.name}'s Shop`, location: '', verificationStatus: 'approved' };
    database.shops.push(shop);
    await writeDatabase(database);
  }
  return { user, shop };
}

function requireApprovedShop(manager, res) {
  if (manager.shop.verificationStatus !== 'approved') {
    res.status(403).json({ message: 'Your shop must be verified by a Duka-Tech administrator before it can sell products.' });
    return false;
  }
  return true;
}

async function requireManager(req, res) {
  const manager = await getManagerContext(req);
  if (!manager) {
    res.status(401).json({ message: 'Sign in with a manager account to manage this shop.' });
    return null;
  }
  return manager;
}

async function writeUsers(users) {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2));
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

app.post('/api/admin/signin', (req, res) => {
  const { username, password } = req.body;
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ message: 'Administrator sign-in is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in the server environment.' });
  }
  if (!safeEqual(username || '', process.env.ADMIN_USERNAME) || !safeEqual(password || '', process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ message: 'Invalid administrator sign-in details.' });
  }
  res.json({ user: { id: 0, name: 'Duka-Tech Administrator', role: 'admin', token: createAuthToken(0) } });
});

app.get('/api/admin/verifications', async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  if (!hasVerificationEncryptionKey()) {
    return res.status(503).json({ message: 'Verification encryption is not configured on this server.' });
  }
  const database = await readDatabase();
  const status = req.query.status || 'pending';
  const shops = database.shops.filter((shop) =>
    ['pending', 'approved', 'rejected'].includes(shop.verificationStatus) &&
    (status === 'all' || shop.verificationStatus === status)
  );
  try {
    res.json(shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      location: shop.location,
      verificationStatus: shop.verificationStatus,
      submittedAt: shop.verificationSubmittedAt || null,
      ownerName: shop.verification?.ownerName || 'Unknown',
      ownerEmail: shop.verification?.ownerEmail || '',
      ownerIdNumber: decryptSensitiveValue(shop.verification?.ownerIdNumber),
      businessLicenseNumber: decryptSensitiveValue(shop.verification?.businessLicenseNumber),
      reviewNote: shop.verificationReviewNote || '',
      documents: (shop.verification?.documents || []).map(({ id, kind, originalName, mimeType, reviewedAt }) => ({
        id,
        kind,
        originalName,
        mimeType,
        reviewed: Boolean(reviewedAt)
      }))
    })));
  } catch (error) {
    console.error('Unable to decrypt shop verification details:', error.message);
    res.status(500).json({ message: 'Unable to read shop verification details. Check the encryption key configured on the server.' });
  }
});

app.get('/api/admin/verifications/:shopId/documents/:documentId', async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  if (!hasVerificationEncryptionKey()) {
    return res.status(503).json({ message: 'Verification document encryption is not configured on this server.' });
  }
  const database = await readDatabase();
  const shop = database.shops.find((entry) => Number(entry.id) === Number(req.params.shopId));
  const document = shop?.verification?.documents?.find((entry) => entry.id === req.params.documentId);
  if (!document) return res.status(404).json({ message: 'Verification document not found.' });
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(document.mimeType)) {
    return res.status(415).json({ message: 'Unsupported verification document type.' });
  }
  try {
    const encrypted = await fs.readFile(path.join(PRIVATE_DOCUMENTS_DIR, document.storageName));
    const contents = decryptDocument(encrypted);
    document.reviewedAt = new Date().toISOString();
    await writeDatabase(database);
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `inline; filename="${document.originalName.replace(/["\\]/g, '_')}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store'
    });
    res.send(contents);
  } catch (error) {
    console.error('Unable to read verification document:', error.message);
    res.status(500).json({ message: 'Unable to open this verification document.' });
  }
});

app.patch('/api/admin/verifications/:shopId', async (req, res) => {
  if (!await requireAdmin(req, res)) return;
  const { status, reviewNote = '' } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Choose approval or rejection for this application.' });
  }
  if (status === 'rejected' && !String(reviewNote).trim()) {
    return res.status(400).json({ message: 'Provide a reason so the shop owner can correct the application.' });
  }
  if (String(reviewNote).length > 500) {
    return res.status(400).json({ message: 'Review notes must be 500 characters or fewer.' });
  }
  const database = await readDatabase();
  const shop = database.shops.find((entry) => Number(entry.id) === Number(req.params.shopId));
  if (!shop) return res.status(404).json({ message: 'Shop application not found.' });
  if (shop.verificationStatus !== 'pending') {
    return res.status(409).json({ message: 'This shop application is no longer awaiting review.' });
  }
  if (status === 'approved') {
    const documents = shop.verification?.documents || [];
    const hasOwnerId = documents.some((document) => document.kind === 'Owner ID' && document.reviewedAt);
    const hasBusinessLicense = documents.some((document) => document.kind === 'Business license' && document.reviewedAt);
    if (!shop.verification?.ownerIdNumber || !shop.verification?.businessLicenseNumber || !hasOwnerId || !hasBusinessLicense) {
      return res.status(400).json({ message: 'Review both the owner ID and business license before approving this application.' });
    }
    try {
      await Promise.all(documents.map((document) => fs.access(path.join(PRIVATE_DOCUMENTS_DIR, document.storageName))));
    } catch (error) {
      return res.status(400).json({ message: 'A submitted verification document is unavailable and must be replaced.' });
    }
  }
  shop.verificationStatus = status;
  shop.verificationReviewedAt = new Date().toISOString();
  shop.verificationReviewNote = status === 'rejected' ? String(reviewNote).trim() : '';
  if (status === 'approved') shop.verifiedAt = shop.verificationReviewedAt;
  await writeDatabase(database);
  res.json({ id: shop.id, verificationStatus: shop.verificationStatus });
});

app.post('/api/auth/signup', parseVerificationUpload, async (req, res) => {
  const { name, email, password, role, shopName, shopLocation, ownerIdNumber, businessLicenseNumber } = req.body;

  if (!name || !email || !password || !['customer', 'manager'].includes(role)) {
    return res.status(400).json({ message: 'Name, email, password, and a valid role are required.' });
  }
  if (role === 'manager' && !String(shopName || '').trim()) {
    return res.status(400).json({ message: 'Shop name is required for manager accounts.' });
  }
  if (role === 'manager') {
    const files = req.files || {};
    if (!hasVerificationEncryptionKey()) {
      return res.status(503).json({ message: 'Shop verification is not configured. Set VERIFICATION_ENCRYPTION_KEY to a private random value of at least 32 characters and restart the server.' });
    }
    if (!String(ownerIdNumber || '').trim() || !String(businessLicenseNumber || '').trim() ||
        !files.ownerIdDocument?.[0] || !files.businessLicenseDocument?.[0]) {
      return res.status(400).json({ message: 'Owner ID number, business license number, and both supporting documents are required.' });
    }
    if (!isSupportedDocument(files.ownerIdDocument[0]) || !isSupportedDocument(files.businessLicenseDocument[0])) {
      return res.status(400).json({ message: 'Documents must be valid PDF, JPG, or PNG files.' });
    }
  }

  if (databasePool) {
    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const result = await databasePool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name.trim(), email.trim().toLowerCase(), passwordHash, role]
      );
      const user = result.rows[0];
      if (role === 'manager') {
        const database = await readDatabase();
        const documents = await saveVerificationDocuments(req.files);
        const shop = {
          id: user.id,
          ownerId: user.id,
          name: String(shopName).trim(),
          location: String(shopLocation || '').trim(),
          verificationStatus: 'pending',
          verificationSubmittedAt: new Date().toISOString(),
          verification: {
            ownerName: name.trim(),
            ownerEmail: email.trim().toLowerCase(),
            ownerIdNumber: encryptSensitiveValue(String(ownerIdNumber).trim()),
            businessLicenseNumber: encryptSensitiveValue(String(businessLicenseNumber).trim()),
            documents
          }
        };
        database.shops.push(shop);
        await writeDatabase(database);
        return res.status(201).json({ user: { ...user, shopId: shop.id, shopName: shop.name, verificationStatus: shop.verificationStatus, token: createAuthToken(user.id) } });
      }
      return res.status(201).json({ user: { ...user, token: createAuthToken(user.id) } });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ message: 'An account with that email already exists.' });
      }
      console.error(error);
      return res.status(500).json({ message: 'Unable to create account.' });
    }
  }

  try {
    const users = await readUsers();
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.find((user) => user.email.toLowerCase() === normalizedEmail || user.name.toLowerCase() === trimmedName.toLowerCase());

    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const username = (trimmedName.toLowerCase().replace(/\s+/g, '') || normalizedEmail.split('@')[0]) + (users.length + 1);
    const newUser = {
      id: Date.now(),
      name: trimmedName,
      email: normalizedEmail,
      username,
      password_hash: passwordHash,
      role
    };

    users.push(newUser);
    let shop;
    if (role === 'manager') {
      const documents = await saveVerificationDocuments(req.files);
      shop = {
        id: newUser.id,
        ownerId: newUser.id,
        name: String(shopName).trim(),
        location: String(shopLocation || '').trim(),
        verificationStatus: 'pending',
        verificationSubmittedAt: new Date().toISOString(),
        verification: {
          ownerName: newUser.name,
          ownerEmail: newUser.email,
          ownerIdNumber: encryptSensitiveValue(String(ownerIdNumber).trim()),
          businessLicenseNumber: encryptSensitiveValue(String(businessLicenseNumber).trim()),
          documents
        }
      };
      const database = await readDatabase();
      database.shops.push(shop);
      await writeDatabase(database);
    }
    await writeUsers(users);

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        token: createAuthToken(newUser.id),
        ...(shop ? { shopId: shop.id, shopName: shop.name, verificationStatus: shop.verificationStatus } : {})
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create account.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !['customer', 'manager'].includes(role)) {
    return res.status(400).json({ message: 'Username, password, and a valid role are required.' });
  }

  if (databasePool) {
    try {
      const result = await databasePool.query(
        'SELECT id, name, email, password_hash, role FROM users WHERE (LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($1)) AND role = $2',
        [username.trim(), role]
      );
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: 'Invalid login details.' });
      }

      const profile = { id: user.id, name: user.name, email: user.email, role: user.role };
      if (user.role === 'manager') {
        const database = await readDatabase();
        const shop = database.shops.find((entry) => Number(entry.ownerId) === Number(user.id));
        if (shop) Object.assign(profile, { shopId: shop.id, shopName: shop.name, verificationStatus: shop.verificationStatus });
      }
      return res.json({ user: { ...profile, token: createAuthToken(user.id) } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Unable to sign in.' });
    }
  }

  try {
    const users = await readUsers();
    const searchTerm = username.trim().toLowerCase();
    const user = users.find((candidate) => {
      const candidateRole = candidate.role;
      if (candidateRole !== role) return false;
      const emailMatch = candidate.email && candidate.email.toLowerCase() === searchTerm;
      const nameMatch = candidate.name && candidate.name.toLowerCase() === searchTerm;
      const usernameMatch = candidate.username && candidate.username.toLowerCase() === searchTerm;
      return emailMatch || nameMatch || usernameMatch;
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid login details.' });
    }

    const profile = { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role };
    if (user.role === 'manager') {
      const database = await readDatabase();
      const shop = database.shops.find((entry) => Number(entry.ownerId) === Number(user.id));
      if (shop) Object.assign(profile, { shopId: shop.id, shopName: shop.name, verificationStatus: shop.verificationStatus });
    }
    return res.json({ user: { ...profile, token: createAuthToken(user.id) } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to sign in.' });
  }
});

app.get('/api/products', async (req, res) => {
  const database = await readDatabase();
  const manager = req.get('authorization') ? await requireManager(req, res) : null;
  if (req.get('authorization') && !manager) return;
  const products = manager
    ? database.products.filter((product) => Number(product.shopId) === Number(manager.shop.id))
    : database.products.filter((product) =>
      database.shops.find((shop) => Number(shop.id) === Number(product.shopId))?.verificationStatus === 'approved'
    );
  res.json(products.map((product) => ({
    ...product,
    shopName: database.shops.find((shop) => Number(shop.id) === Number(product.shopId))?.name || 'Local shop',
    shopLocation: database.shops.find((shop) => Number(shop.id) === Number(product.shopId))?.location || ''
  })));
});

app.post('/api/products', async (req, res) => {
  const manager = await requireManager(req, res);
  if (!manager) return;
  if (!requireApprovedShop(manager, res)) return;
  const database = await readDatabase();
  const { name, imageUrl, category, stock, price, threshold, unit } = req.body;

  if (!name || !category || stock === undefined || price === undefined) {
    return res.status(400).json({ message: 'Product name, category, stock, and price are required.' });
  }

  const newProduct = {
    id: Date.now(),
    shopId: manager.shop.id,
    name,
    imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
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
  const manager = await requireManager(req, res);
  if (!manager) return;
  if (!requireApprovedShop(manager, res)) return;
  const database = await readDatabase();
  const productIndex = database.products.findIndex((product) =>
    product.id === Number(req.params.id) && Number(product.shopId) === Number(manager.shop.id)
  );

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const currentProduct = database.products[productIndex];
  const { name, imageUrl, category, stock, price, threshold, unit } = req.body;
  database.products[productIndex] = {
    ...currentProduct,
    ...(typeof name === 'string' ? { name: name.trim() } : {}),
    ...(typeof imageUrl === 'string' ? { imageUrl: imageUrl.trim() } : {}),
    ...(typeof category === 'string' ? { category } : {}),
    ...(stock !== undefined ? { stock: Number(stock) } : {}),
    ...(price !== undefined ? { price: Number(price) } : {}),
    ...(threshold !== undefined ? { threshold: Number(threshold) } : {}),
    ...(typeof unit === 'string' ? { unit: unit.trim() } : {}),
    id: Number(req.params.id),
    shopId: manager.shop.id
  };

  await writeDatabase(database);
  res.json(database.products[productIndex]);
});

app.delete('/api/products/:id', async (req, res) => {
  const manager = await requireManager(req, res);
  if (!manager) return;
  if (!requireApprovedShop(manager, res)) return;
  const database = await readDatabase();
  const productId = Number(req.params.id);
  const originalLength = database.products.length;
  database.products = database.products.filter((product) =>
    product.id !== productId || Number(product.shopId) !== Number(manager.shop.id)
  );

  if (database.products.length === originalLength) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  database.sales = database.sales.filter((sale) => sale.productId !== productId);
  await writeDatabase(database);
  res.json({ message: 'Product deleted successfully.' });
});

app.get('/api/sales', async (req, res) => {
  const database = await readDatabase();
  const manager = req.get('authorization') ? await requireManager(req, res) : null;
  if (req.get('authorization') && !manager) return;
  const sales = manager
    ? database.sales.filter((sale) => Number(sale.shopId) === Number(manager.shop.id))
    : database.sales;
  res.json(sales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

app.post('/api/sales', async (req, res) => {
  const manager = req.get('authorization') ? await requireManager(req, res) : null;
  if (req.get('authorization') && !manager) return;
  if (manager && !requireApprovedShop(manager, res)) return;
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

    if (manager && Number(product.shopId) !== Number(manager.shop.id)) {
      return res.status(403).json({ message: 'You can only record sales for your own shop.' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: `Not enough stock available for ${product.name}.` });
    }

    const shop = database.shops.find((entry) => Number(entry.id) === Number(product.shopId));
    if (shop?.verificationStatus !== 'approved') {
      return res.status(403).json({ message: 'This shop must be verified before it can sell products.' });
    }

    preparedSales.push({
      id: Date.now() + Math.random(),
      productId: product.id,
      shopId: product.shopId,
      shopName: shop?.name || 'Local shop',
      productName: product.name,
      quantity: qty,
      unitPrice: product.price,
      customer: customer || 'Walk-in',
      timestamp: new Date().toISOString()
    });
  }

  for (const sale of preparedSales) {
    const product = database.products.find((entry) => entry.id === sale.productId);
    product.stock -= sale.quantity;
  }
  database.sales.push(...preparedSales);
  await writeDatabase(database);
  res.status(201).json({ sales: preparedSales, total: preparedSales.reduce((sum, sale) => sum + (sale.quantity * sale.unitPrice), 0) });
});

app.get('/api/bulk-orders', async (req, res) => {
  const database = await readDatabase();
  res.json((database.bulkOrders || []).filter((order) =>
    database.shops.find((shop) => Number(shop.id) === Number(order.shopId))?.verificationStatus === 'approved'
  ));
});

app.post('/api/bulk-orders', async (req, res) => {
  const database = await readDatabase();
  const { name, phone, email, location, productId, quantity, deliveryDate, notes } = req.body;
  const product = database.products.find((entry) => entry.id === Number(productId));
  const requestedQuantity = Number(quantity);

  if (!name || !phone || !location || !product || !requestedQuantity) {
    return res.status(400).json({ message: 'Name, phone, location, product, and quantity are required.' });
  }
  if (database.shops.find((shop) => Number(shop.id) === Number(product.shopId))?.verificationStatus !== 'approved') {
    return res.status(403).json({ message: 'This shop must be verified before it can accept orders.' });
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
    shopId: product.shopId,
    shopName: database.shops.find((shop) => Number(shop.id) === Number(product.shopId))?.name || 'Local shop',
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
  const manager = req.get('authorization') ? await requireManager(req, res) : null;
  if (req.get('authorization') && !manager) return;
  const suppliers = manager
    ? database.suppliers.filter((supplier) => Number(supplier.shopId) === Number(manager.shop.id))
    : database.suppliers;
  res.json(suppliers);
});

app.post('/api/suppliers', async (req, res) => {
  const manager = await requireManager(req, res);
  if (!manager) return;
  const database = await readDatabase();
  const { name, phone, product, balance, lastPurchase } = req.body;

  if (!name || !product) {
    return res.status(400).json({ message: 'Supplier name and product are required.' });
  }

  const supplier = {
    id: Date.now(),
    shopId: manager.shop.id,
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

app.put('/api/suppliers/:id', async (req, res) => {
  const manager = await requireManager(req, res);
  if (!manager) return;
  const database = await readDatabase();
  const supplier = database.suppliers.find((entry) =>
    entry.id === Number(req.params.id) && Number(entry.shopId) === Number(manager.shop.id)
  );
  if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });

  const { name, phone, product, balance, lastPurchase } = req.body;
  Object.assign(supplier, {
    ...(typeof name === 'string' ? { name: name.trim() } : {}),
    ...(typeof phone === 'string' ? { phone: phone.trim() } : {}),
    ...(typeof product === 'string' ? { product: product.trim() } : {}),
    ...(balance !== undefined ? { balance: Number(balance) } : {}),
    ...(typeof lastPurchase === 'string' ? { lastPurchase } : {})
  });
  await writeDatabase(database);
  res.json(supplier);
});

app.delete('/api/suppliers/:id', async (req, res) => {
  const manager = await requireManager(req, res);
  if (!manager) return;
  const database = await readDatabase();
  const originalLength = database.suppliers.length;
  database.suppliers = database.suppliers.filter((supplier) =>
    supplier.id !== Number(req.params.id) || Number(supplier.shopId) !== Number(manager.shop.id)
  );
  if (database.suppliers.length === originalLength) {
    return res.status(404).json({ message: 'Supplier not found.' });
  }
  await writeDatabase(database);
  res.json({ message: 'Supplier deleted successfully.' });
});

app.get('/api/shops', async (req, res) => {
  const database = await readDatabase();
  res.json(database.shops.filter((shop) => shop.verificationStatus === 'approved').map((shop) => ({
    id: shop.id,
    name: shop.name,
    location: shop.location,
    productCount: database.products.filter((product) => Number(product.shopId) === Number(shop.id)).length
  })));
});

app.get('/api/shop/me', async (req, res) => {
  const manager = await requireManager(req, res);
  if (!manager) return;
  res.json({
    id: manager.shop.id,
    name: manager.shop.name,
    location: manager.shop.location,
    verificationStatus: manager.shop.verificationStatus,
    verificationSubmittedAt: manager.shop.verificationSubmittedAt || null,
    verifiedAt: manager.shop.verifiedAt || null,
    verificationReviewNote: manager.shop.verificationReviewNote || ''
  });
});

app.post('/api/shop/verification', parseVerificationUpload, async (req, res) => {
  const manager = await requireManager(req, res);
  if (!manager) return;
  if (!hasVerificationEncryptionKey()) {
    return res.status(503).json({ message: 'Shop verification is not configured on this server.' });
  }
  if (manager.shop.verificationStatus !== 'rejected') {
    return res.status(409).json({ message: 'Only a rejected application can be resubmitted.' });
  }
  const { ownerIdNumber, businessLicenseNumber } = req.body;
  const files = req.files || {};
  if (!String(ownerIdNumber || '').trim() || !String(businessLicenseNumber || '').trim() ||
      !files.ownerIdDocument?.[0] || !files.businessLicenseDocument?.[0]) {
    return res.status(400).json({ message: 'Owner ID number, business license number, and both supporting documents are required.' });
  }
  if (!isSupportedDocument(files.ownerIdDocument[0]) || !isSupportedDocument(files.businessLicenseDocument[0])) {
    return res.status(400).json({ message: 'Documents must be valid PDF, JPG, or PNG files.' });
  }

  try {
    const documents = await saveVerificationDocuments(files);
    const database = await readDatabase();
    const shop = database.shops.find((entry) => Number(entry.id) === Number(manager.shop.id));
    const oldDocuments = shop.verification?.documents || [];
    shop.verification = {
      ...shop.verification,
      ownerIdNumber: encryptSensitiveValue(String(ownerIdNumber).trim()),
      businessLicenseNumber: encryptSensitiveValue(String(businessLicenseNumber).trim()),
      documents
    };
    shop.verificationStatus = 'pending';
    shop.verificationSubmittedAt = new Date().toISOString();
    shop.verificationReviewedAt = null;
    shop.verificationReviewNote = '';
    await writeDatabase(database);
    await Promise.all(oldDocuments.map((document) =>
      fs.unlink(path.join(PRIVATE_DOCUMENTS_DIR, document.storageName)).catch((error) => {
        if (error.code !== 'ENOENT') console.error('Unable to remove replaced verification document:', error.message);
      })
    ));
    res.json({ verificationStatus: shop.verificationStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message === 'Documents must be valid PDF, JPG, or PNG files.' ? error.message : 'Unable to resubmit shop verification.' });
  }
});

app.put('/api/shop/me', async (req, res) => {
  const manager = await requireManager(req, res);
  if (!manager) return;
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const location = typeof req.body.location === 'string' ? req.body.location.trim() : manager.shop.location;
  if (!name) return res.status(400).json({ message: 'Shop name is required.' });

  const database = await readDatabase();
  const shop = database.shops.find((entry) => Number(entry.id) === Number(manager.shop.id));
  if (shop.verificationStatus === 'approved' && name !== shop.name) {
    return res.status(403).json({ message: 'A verified shop name cannot be changed without administrator review.' });
  }
  shop.name = name;
  shop.location = location;
  await writeDatabase(database);
  res.json({
    id: shop.id,
    name: shop.name,
    location: shop.location,
    verificationStatus: shop.verificationStatus,
    verificationSubmittedAt: shop.verificationSubmittedAt || null,
    verifiedAt: shop.verifiedAt || null,
    verificationReviewNote: shop.verificationReviewNote || ''
  });
});

app.get('/api/summary', async (req, res) => {
  const database = await readDatabase();
  const manager = req.get('authorization') ? await requireManager(req, res) : null;
  if (req.get('authorization') && !manager) return;
  const shopDatabase = manager ? {
    ...database,
    products: database.products.filter((product) => Number(product.shopId) === Number(manager.shop.id)),
    sales: database.sales.filter((sale) => Number(sale.shopId) === Number(manager.shop.id))
  } : database;
  res.json(calculateSummary(shopDatabase));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'manager.html'));
});

app.get('/products', (req, res) => {
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

async function startServer() {
  try {
    await ensureVerificationEncryptionKey();
    if (databasePool) {
      await ensureUsersTable();
    }

    app.listen(PORT, () => {
      console.log(`Duka-Tech server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
