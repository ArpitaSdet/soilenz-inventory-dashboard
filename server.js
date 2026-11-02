/**
 * ArkaShine Innovations – SoilENZ, Soil Sparsh & Soil Life Inventory Backend Server
 * Multi-Engine Cloud Database Support:
 * 1. Neon Serverless PostgreSQL (Activated via process.env.DATABASE_URL)
 * 2. SQLite Persistence (Local fallback via node:sqlite)
 * 3. Resilient JSON Store (Universal offline fallback)
 * 
 * Features:
 * - Neon Serverless PostgreSQL integration (zero data loss across redeploys / 15+ days)
 * - User Authentication (Register & Login with PBKDF2 password hashing & HMAC tokens)
 * - Real-Time synchronization engine
 * - Clean initial state (zero dummy data)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Load .env file if present
const ENV_PATH = path.join(__dirname, '.env');
if (fs.existsSync(ENV_PATH)) {
  try {
    const envLines = fs.readFileSync(ENV_PATH, 'utf8').split('\n');
    for (const line of envLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val.replace(/^["']|["']$/g, '');
        }
      }
    }
    console.log('[Config] Loaded environment variables from .env');
  } catch (err) {
    console.warn('[Config] Could not parse .env:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
const DATABASE_URL = (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '').trim().replace(/^["']|["']$/g, '');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'inventory.db');
const JSON_DB_PATH = path.join(path.dirname(DB_PATH), 'inventory_store.json');
const JWT_SECRET = process.env.JWT_SECRET || 'arkashine_agritech_secret_key_2026_bidar';

let lastDataVersion = Date.now();
let activeDatabaseType = 'none';
let dbInitError = null;

// Ensure directory exists for local files
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// -------------------------------------------------------------
// CRYPTO & AUTH HELPERS
// -------------------------------------------------------------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return key === hash;
}

function generateToken(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'operator',
    iat: Date.now(),
    exp: Date.now() + 60 * 24 * 60 * 60 * 1000 // 60 days
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  if (signature !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch (e) {
    return null;
  }
}

// -------------------------------------------------------------
// DATABASE ENGINES
// -------------------------------------------------------------
let pgPool = null;
let sqliteDb = null;
let memoryStore = {
  users: [],
  components: [],
  machines: [],
  movements: [],
  dispatches: [],
  notifications: []
};

// 1. NEON POSTGRESQL ENGINE
async function initNeonPostgres() {
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Verify connection
  const client = await pgPool.connect();
  try {
    console.log('[Database] Connected to Neon PostgreSQL cloud instance successfully.');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'operator',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS components (
        id TEXT PRIMARY KEY,
        product TEXT DEFAULT 'SoilENZ',
        name TEXT NOT NULL,
        category TEXT,
        model TEXT,
        hsn TEXT,
        sku TEXT,
        link TEXT,
        price NUMERIC DEFAULT 0,
        purchase_date TEXT,
        batch TEXT,
        qty INTEGER DEFAULT 0,
        unit TEXT DEFAULT 'Pcs',
        qty_per_machine INTEGER DEFAULT 1,
        threshold INTEGER DEFAULT 5,
        rack TEXT,
        vendor_name TEXT,
        vendor_phone TEXT,
        vendor_address TEXT,
        operator TEXT,
        notes TEXT,
        status TEXT,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS machines (
        id TEXT PRIMARY KEY,
        product TEXT DEFAULT 'SoilENZ',
        serial_number TEXT UNIQUE,
        model TEXT,
        status TEXT,
        registered_date TEXT,
        allocated_components TEXT,
        dispatch_id TEXT
      );

      CREATE TABLE IF NOT EXISTS movements (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        type TEXT,
        comp_id TEXT,
        comp_name TEXT,
        qty INTEGER,
        balance_after INTEGER,
        reason TEXT,
        machine_ref TEXT,
        operator TEXT,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS dispatches (
        id TEXT PRIMARY KEY,
        product TEXT DEFAULT 'SoilENZ',
        machine_serial TEXT,
        machine_model TEXT,
        dispatch_date TEXT,
        destination_name TEXT,
        destination_address TEXT,
        path_route TEXT,
        consignee_contact TEXT,
        transporter TEXT,
        tracking_waybill TEXT,
        operator TEXT,
        notes TEXT,
        timestamp TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT,
        title TEXT,
        message TEXT,
        timestamp TEXT,
        read INTEGER DEFAULT 0
      );
    `);

    activeDatabaseType = 'neon-postgres';
    console.log('[Database] Neon PostgreSQL schema verified & active.');
  } finally {
    client.release();
  }
}

// 2. SQLITE LOCAL FALLBACK
function initSqlite() {
  const { DatabaseSync } = require('node:sqlite');
  sqliteDb = new DatabaseSync(DB_PATH);
  
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'operator',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS components (
      id TEXT PRIMARY KEY,
      product TEXT DEFAULT 'SoilENZ',
      name TEXT NOT NULL,
      category TEXT,
      model TEXT,
      hsn TEXT,
      sku TEXT,
      link TEXT,
      price REAL DEFAULT 0,
      purchase_date TEXT,
      batch TEXT,
      qty INTEGER DEFAULT 0,
      unit TEXT DEFAULT 'Pcs',
      qty_per_machine INTEGER DEFAULT 1,
      threshold INTEGER DEFAULT 5,
      rack TEXT,
      vendor_name TEXT,
      vendor_phone TEXT,
      vendor_address TEXT,
      operator TEXT,
      notes TEXT,
      status TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      product TEXT DEFAULT 'SoilENZ',
      serial_number TEXT UNIQUE,
      model TEXT,
      status TEXT,
      registered_date TEXT,
      allocated_components TEXT,
      dispatch_id TEXT
    );

    CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY,
      timestamp TEXT,
      type TEXT,
      comp_id TEXT,
      comp_name TEXT,
      qty INTEGER,
      balance_after INTEGER,
      reason TEXT,
      machine_ref TEXT,
      operator TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS dispatches (
      id TEXT PRIMARY KEY,
      product TEXT DEFAULT 'SoilENZ',
      machine_serial TEXT,
      machine_model TEXT,
      dispatch_date TEXT,
      destination_name TEXT,
      destination_address TEXT,
      path_route TEXT,
      consignee_contact TEXT,
      transporter TEXT,
      tracking_waybill TEXT,
      operator TEXT,
      notes TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT,
      title TEXT,
      message TEXT,
      timestamp TEXT,
      read INTEGER DEFAULT 0
    );
  `);

  activeDatabaseType = 'sqlite';
  console.log(`[Database] Native SQLite loaded at: ${DB_PATH}`);
}

// 3. JSON STORE LOCAL FALLBACK
function initJsonStore() {
  if (fs.existsSync(JSON_DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
      memoryStore = {
        users: data.users || [],
        components: data.components || [],
        machines: data.machines || [],
        movements: data.movements || [],
        dispatches: data.dispatches || [],
        notifications: data.notifications || []
      };
      console.log(`[Database] Loaded JSON Store with ${memoryStore.components.length} components.`);
    } catch (e) {
      console.warn('[Database] JSON Store recreated:', e.message);
    }
  }
  activeDatabaseType = 'json';
}

function persistJsonStore() {
  if (activeDatabaseType === 'json') {
    try {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(memoryStore, null, 2), 'utf8');
    } catch (e) {
      console.error('[Database] Failed to write JSON Store:', e.message);
    }
  }
}

// -------------------------------------------------------------
// UNIFIED DATA ACCESS HELPERS
// -------------------------------------------------------------
function mapComponentFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    product: row.product || 'SoilENZ',
    name: row.name || '',
    category: row.category || '',
    model: row.model || '',
    hsn: row.hsn || '',
    sku: row.sku || '',
    link: row.link || '',
    price: Number(row.price) || 0,
    purchaseDate: row.purchase_date || row.purchaseDate || '',
    batch: row.batch || '',
    qty: Number(row.qty) || 0,
    unit: row.unit || 'Pcs',
    qtyPerMachine: Number(row.qty_per_machine || row.qtyPerMachine) || 1,
    threshold: Number(row.threshold) || 5,
    rack: row.rack || '',
    vendorName: row.vendor_name || row.vendorName || '',
    vendorPhone: row.vendor_phone || row.vendorPhone || '',
    vendorAddress: row.vendor_address || row.vendorAddress || '',
    operator: row.operator || '',
    notes: row.notes || '',
    status: row.status || 'In Stock',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function mapMachineFromRow(row) {
  if (!row) return null;
  let allocated = [];
  try {
    allocated = typeof row.allocated_components === 'string' 
      ? JSON.parse(row.allocated_components) 
      : (row.allocatedComponents || row.allocated_components || []);
  } catch (e) {
    allocated = [];
  }
  return {
    id: row.id,
    product: row.product || 'SoilENZ',
    serialNumber: row.serial_number || row.serialNumber,
    model: row.model,
    status: row.status,
    registeredDate: row.registered_date || row.registeredDate,
    allocatedComponents: allocated,
    dispatchId: row.dispatch_id || row.dispatchId || null
  };
}

function mapMovementFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    compId: row.comp_id || row.compId,
    compName: row.comp_name || row.compName,
    qty: Number(row.qty) || 0,
    balanceAfter: Number(row.balance_after || row.balanceAfter) || 0,
    reason: row.reason,
    machineRef: row.machine_ref || row.machineRef,
    operator: row.operator,
    notes: row.notes
  };
}

function mapDispatchFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    product: row.product || 'SoilENZ',
    machineSerial: row.machine_serial || row.machineSerial,
    machineModel: row.machine_model || row.machineModel,
    dispatchDate: row.dispatch_date || row.dispatchDate,
    destinationName: row.destination_name || row.destinationName,
    destinationAddress: row.destination_address || row.destinationAddress,
    pathRoute: row.path_route || row.pathRoute,
    consigneeContact: row.consignee_contact || row.consigneeContact,
    transporter: row.transporter,
    trackingWaybill: row.tracking_waybill || row.trackingWaybill,
    operator: row.operator,
    notes: row.notes,
    timestamp: row.timestamp
  };
}

// -------------------------------------------------------------
// DATA REPOSITORY
// -------------------------------------------------------------
const DataRepo = {
  async getAllData() {
    if (activeDatabaseType === 'neon-postgres') {
      const comps = await pgPool.query('SELECT * FROM components ORDER BY created_at DESC');
      const machs = await pgPool.query('SELECT * FROM machines ORDER BY registered_date DESC');
      const movs = await pgPool.query('SELECT * FROM movements ORDER BY id ASC');
      const disps = await pgPool.query('SELECT * FROM dispatches ORDER BY timestamp DESC');
      const notifs = await pgPool.query('SELECT * FROM notifications ORDER BY timestamp DESC');
      return {
        components: comps.rows.map(mapComponentFromRow),
        machines: machs.rows.map(mapMachineFromRow),
        movements: movs.rows.map(mapMovementFromRow),
        dispatches: disps.rows.map(mapDispatchFromRow),
        notifications: notifs.rows.map(n => ({ ...n, read: Boolean(n.read) }))
      };
    } else if (activeDatabaseType === 'sqlite') {
      const comps = sqliteDb.prepare('SELECT * FROM components').all();
      const machs = sqliteDb.prepare('SELECT * FROM machines').all();
      const movs = sqliteDb.prepare('SELECT * FROM movements').all();
      const disps = sqliteDb.prepare('SELECT * FROM dispatches').all();
      const notifs = sqliteDb.prepare('SELECT * FROM notifications').all();
      comps.sort((a,b) => (b.createdAt || b.created_at || '').localeCompare(a.createdAt || a.created_at || ''));
      machs.sort((a,b) => (b.registeredDate || b.registered_date || '').localeCompare(a.registeredDate || a.registered_date || ''));
      disps.sort((a,b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      notifs.sort((a,b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      return {
        components: comps.map(mapComponentFromRow),
        machines: machs.map(mapMachineFromRow),
        movements: movs.map(mapMovementFromRow),
        dispatches: disps.map(mapDispatchFromRow),
        notifications: notifs.map(n => ({ ...n, read: Boolean(n.read) }))
      };
    } else {
      return {
        components: memoryStore.components,
        machines: memoryStore.machines,
        movements: memoryStore.movements,
        dispatches: memoryStore.dispatches,
        notifications: memoryStore.notifications
      };
    }
  },

  async saveAllData(payload) {
    const { components, machines, movements, dispatches, notifications } = payload;
    lastDataVersion = Date.now();

    if (activeDatabaseType === 'neon-postgres') {
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN');

        if (components && Array.isArray(components)) {
          const compQuery = `
            INSERT INTO components (
              id, product, name, category, model, hsn, sku, link, price, purchase_date, batch, qty, unit, qty_per_machine, threshold, rack, vendor_name, vendor_phone, vendor_address, operator, notes, status, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
            ) ON CONFLICT (id) DO UPDATE SET
              product = EXCLUDED.product, name = EXCLUDED.name, category = EXCLUDED.category, model = EXCLUDED.model, hsn = EXCLUDED.hsn, sku = EXCLUDED.sku, link = EXCLUDED.link, price = EXCLUDED.price, purchase_date = EXCLUDED.purchase_date, batch = EXCLUDED.batch, qty = EXCLUDED.qty, unit = EXCLUDED.unit, qty_per_machine = EXCLUDED.qty_per_machine, threshold = EXCLUDED.threshold, rack = EXCLUDED.rack, vendor_name = EXCLUDED.vendor_name, vendor_phone = EXCLUDED.vendor_phone, vendor_address = EXCLUDED.vendor_address, operator = EXCLUDED.operator, notes = EXCLUDED.notes, status = EXCLUDED.status, updated_at = EXCLUDED.updated_at
          `;
          for (const c of components) {
            await client.query(compQuery, [
              c.id, c.product || 'SoilENZ', c.name || '', c.category || '', c.model || '', c.hsn || '', c.sku || '', c.link || '',
              Number(c.price) || 0, c.purchaseDate || '', c.batch || '', Number(c.qty) || 0, c.unit || 'Pcs',
              Number(c.qtyPerMachine) || 1, Number(c.threshold) || 5, c.rack || '', c.vendorName || '',
              c.vendorPhone || '', c.vendorAddress || '', c.operator || '', c.notes || '', c.status || 'In Stock',
              c.createdAt || new Date().toISOString(), c.updatedAt || new Date().toISOString()
            ]);
          }
        }

        if (machines && Array.isArray(machines)) {
          const machQuery = `
            INSERT INTO machines (id, product, serial_number, model, status, registered_date, allocated_components, dispatch_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              product = EXCLUDED.product, serial_number = EXCLUDED.serial_number, model = EXCLUDED.model, status = EXCLUDED.status, registered_date = EXCLUDED.registered_date, allocated_components = EXCLUDED.allocated_components, dispatch_id = EXCLUDED.dispatch_id
          `;
          for (const m of machines) {
            await client.query(machQuery, [
              m.id, m.product || 'SoilENZ', m.serialNumber, m.model, m.status, m.registeredDate, JSON.stringify(m.allocatedComponents || []), m.dispatchId || null
            ]);
          }
        }

        if (movements && Array.isArray(movements)) {
          const movQuery = `
            INSERT INTO movements (id, timestamp, type, comp_id, comp_name, qty, balance_after, reason, machine_ref, operator, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
              timestamp = EXCLUDED.timestamp, type = EXCLUDED.type, comp_id = EXCLUDED.comp_id, comp_name = EXCLUDED.comp_name, qty = EXCLUDED.qty, balance_after = EXCLUDED.balance_after, reason = EXCLUDED.reason, machine_ref = EXCLUDED.machine_ref, operator = EXCLUDED.operator, notes = EXCLUDED.notes
          `;
          for (const m of movements) {
            await client.query(movQuery, [
              m.id, m.timestamp, m.type, m.compId, m.compName, m.qty, m.balanceAfter, m.reason, m.machineRef, m.operator, m.notes
            ]);
          }
        }

        if (dispatches && Array.isArray(dispatches)) {
          const dispQuery = `
            INSERT INTO dispatches (id, product, machine_serial, machine_model, dispatch_date, destination_name, destination_address, path_route, consignee_contact, transporter, tracking_waybill, operator, notes, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO UPDATE SET
              product = EXCLUDED.product, machine_serial = EXCLUDED.machine_serial, machine_model = EXCLUDED.machine_model, dispatch_date = EXCLUDED.dispatch_date, destination_name = EXCLUDED.destination_name, destination_address = EXCLUDED.destination_address, path_route = EXCLUDED.path_route, consignee_contact = EXCLUDED.consignee_contact, transporter = EXCLUDED.transporter, tracking_waybill = EXCLUDED.tracking_waybill, operator = EXCLUDED.operator, notes = EXCLUDED.notes, timestamp = EXCLUDED.timestamp
          `;
          for (const d of dispatches) {
            await client.query(dispQuery, [
              d.id, d.product || 'SoilENZ', d.machineSerial, d.machineModel, d.dispatchDate, d.destinationName, d.destinationAddress, d.pathRoute, d.consigneeContact, d.transporter, d.trackingWaybill, d.operator, d.notes, d.timestamp
            ]);
          }
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else if (activeDatabaseType === 'sqlite') {
      if (components && Array.isArray(components)) {
        const stmt = sqliteDb.prepare(`
          INSERT OR REPLACE INTO components (
            id, product, name, category, model, hsn, sku, link, price, purchaseDate, batch, qty, unit, qtyPerMachine, threshold, rack, vendorName, vendorPhone, vendorAddress, operator, notes, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const c of components) {
          stmt.run(
            c.id, c.product || 'SoilENZ', c.name || '', c.category || '', c.model || '', c.hsn || '', c.sku || '', c.link || '',
            Number(c.price) || 0, c.purchaseDate || '', c.batch || '', Number(c.qty) || 0, c.unit || 'Pcs',
            Number(c.qtyPerMachine) || 1, Number(c.threshold) || 5, c.rack || '', c.vendorName || '',
            c.vendorPhone || '', c.vendorAddress || '', c.operator || '', c.notes || '', c.status || 'In Stock',
            c.createdAt || new Date().toISOString(), c.updatedAt || new Date().toISOString()
          );
        }
      }

      if (machines && Array.isArray(machines)) {
        const stmt = sqliteDb.prepare(`
          INSERT OR REPLACE INTO machines (id, product, serialNumber, model, status, registeredDate, allocatedComponents, dispatchId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const m of machines) {
          stmt.run(m.id, m.product || 'SoilENZ', m.serialNumber, m.model, m.status, m.registeredDate, JSON.stringify(m.allocatedComponents || []), m.dispatchId || null);
        }
      }

      if (movements && Array.isArray(movements)) {
        const stmt = sqliteDb.prepare(`
          INSERT OR REPLACE INTO movements (id, timestamp, type, compId, compName, qty, balanceAfter, reason, machineRef, operator, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const m of movements) {
          stmt.run(m.id, m.timestamp, m.type, m.compId, m.compName, m.qty, m.balanceAfter, m.reason, m.machineRef, m.operator, m.notes);
        }
      }

      if (dispatches && Array.isArray(dispatches)) {
        const stmt = sqliteDb.prepare(`
          INSERT OR REPLACE INTO dispatches (id, product, machineSerial, machineModel, dispatchDate, destinationName, destinationAddress, pathRoute, consigneeContact, transporter, trackingWaybill, operator, notes, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const d of dispatches) {
          stmt.run(d.id, d.product || 'SoilENZ', d.machineSerial, d.machineModel, d.dispatchDate, d.destinationName, d.destinationAddress, d.pathRoute, d.consigneeContact, d.transporter, d.trackingWaybill, d.operator, d.notes, d.timestamp);
        }
      }
    } else {
      if (components) memoryStore.components = components;
      if (machines) memoryStore.machines = machines;
      if (movements) memoryStore.movements = movements;
      if (dispatches) memoryStore.dispatches = dispatches;
      if (notifications) memoryStore.notifications = notifications;
      persistJsonStore();
    }
  },

  async deleteComponent(id) {
    lastDataVersion = Date.now();
    if (activeDatabaseType === 'neon-postgres') {
      await pgPool.query('DELETE FROM components WHERE id = $1', [id]);
    } else if (activeDatabaseType === 'sqlite') {
      sqliteDb.prepare('DELETE FROM components WHERE id = ?').run(id);
    } else {
      memoryStore.components = memoryStore.components.filter(c => c.id !== id);
      persistJsonStore();
    }
  },

  async findUserByEmail(email) {
    const normalized = (email || '').trim().toLowerCase();
    if (activeDatabaseType === 'neon-postgres') {
      const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalized]);
      return res.rows[0] || null;
    } else if (activeDatabaseType === 'sqlite') {
      const res = sqliteDb.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalized);
      return res || null;
    } else {
      return memoryStore.users.find(u => u.email.toLowerCase() === normalized) || null;
    }
  },

  async createUser(user) {
    const id = 'USR-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    const newUser = {
      id,
      name: user.name.trim(),
      email: user.email.trim().toLowerCase(),
      password_hash: hashPassword(user.password),
      role: user.role || 'operator',
      created_at: new Date().toISOString()
    };

    if (activeDatabaseType === 'neon-postgres') {
      await pgPool.query(
        'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [newUser.id, newUser.name, newUser.email, newUser.password_hash, newUser.role, newUser.created_at]
      );
    } else if (activeDatabaseType === 'sqlite') {
      sqliteDb.prepare(
        'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(newUser.id, newUser.name, newUser.email, newUser.password_hash, newUser.role, newUser.created_at);
    } else {
      memoryStore.users.push(newUser);
      persistJsonStore();
    }

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
  },

  async getAllUsers() {
    if (activeDatabaseType === 'neon-postgres') {
      const res = await pgPool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at ASC');
      return res.rows;
    } else if (activeDatabaseType === 'sqlite') {
      return sqliteDb.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at ASC').all();
    } else {
      return memoryStore.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at }));
    }
  },

  async cleanUsersLeavingAdmin(keepEmails = ['admin@arkashine.com', 'arpita@arkashine.in']) {
    const masterEmail = 'admin@arkashine.com';
    let master = await this.findUserByEmail(masterEmail);
    if (!master) {
      master = await this.createUser({
        name: 'System Administrator',
        email: masterEmail,
        password: 'Admin@ArkaShine2026',
        role: 'admin'
      });
    } else {
      if (activeDatabaseType === 'neon-postgres') {
        await pgPool.query("UPDATE users SET role = 'admin' WHERE LOWER(email) = $1", [masterEmail]);
      } else if (activeDatabaseType === 'sqlite') {
        sqliteDb.prepare("UPDATE users SET role = 'admin' WHERE LOWER(email) = ?").run(masterEmail);
      } else {
        master.role = 'admin';
        persistJsonStore();
      }
    }

    const lowerKeeps = keepEmails.map(e => e.trim().toLowerCase());
    let deletedEmails = [];
    if (activeDatabaseType === 'neon-postgres') {
      const res = await pgPool.query(
        "DELETE FROM users WHERE LOWER(email) != ALL($1::text[]) RETURNING email",
        [lowerKeeps]
      );
      deletedEmails = res.rows.map(r => r.email);
    } else if (activeDatabaseType === 'sqlite') {
      const placeholders = lowerKeeps.map(() => '?').join(',');
      const rows = sqliteDb.prepare(`SELECT email FROM users WHERE LOWER(email) NOT IN (${placeholders})`).all(...lowerKeeps);
      sqliteDb.prepare(`DELETE FROM users WHERE LOWER(email) NOT IN (${placeholders})`).run(...lowerKeeps);
      deletedEmails = rows.map(r => r.email);
    } else {
      deletedEmails = memoryStore.users.filter(u => !lowerKeeps.includes(u.email.toLowerCase())).map(u => u.email);
      memoryStore.users = memoryStore.users.filter(u => lowerKeeps.includes(u.email.toLowerCase()));
      persistJsonStore();
    }

    const remaining = await this.getAllUsers();
    return {
      deletedEmails,
      remaining
    };
  },

  async getUserCount() {
    if (activeDatabaseType === 'neon-postgres') {
      const res = await pgPool.query('SELECT count(*)::int as count FROM users');
      return res.rows[0].count;
    } else if (activeDatabaseType === 'sqlite') {
      const res = sqliteDb.prepare('SELECT count(*) as count FROM users').get();
      return res ? res.count : 0;
    } else {
      return memoryStore.users.length;
    }
  }
};

// -------------------------------------------------------------
// INITIALIZE DATABASE
// -------------------------------------------------------------
async function initializeDatabase() {
  if (DATABASE_URL && (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://'))) {
    try {
      console.log('[Database] Connecting to Neon Serverless PostgreSQL...');
      await initNeonPostgres();
    } catch (err) {
      dbInitError = err.message;
      console.error('[Database Error] Neon Postgres connection failed:', err.message);
      console.log('[Database] Falling back to local storage engine...');
    }
  } else if (DATABASE_URL) {
    dbInitError = 'DATABASE_URL format invalid (must begin with postgresql:// or postgres://)';
    console.warn('[Database] ' + dbInitError);
  } else {
    console.log('[Database] No DATABASE_URL provided. Using local database.');
  }

  // Fallback to SQLite if neon not active
  if (activeDatabaseType !== 'neon-postgres') {
    try {
      initSqlite();
    } catch (err) {
      console.warn('[Database] Native SQLite unavailable:', err.message);
      initJsonStore();
    }
  }

  // Always ensure master administrator account exists
  try {
    const master = await DataRepo.findUserByEmail('admin@arkashine.com');
    if (!master) {
      await DataRepo.createUser({
        name: 'System Administrator',
        email: 'admin@arkashine.com',
        password: 'Admin@ArkaShine2026',
        role: 'admin'
      });
      console.log('[Auth] Master admin account ensured: admin@arkashine.com');
    }
  } catch (err) {
    console.warn('[Auth] Error ensuring master admin:', err.message);
  }
}

// -------------------------------------------------------------
// HTTP UTILITIES
// -------------------------------------------------------------
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  return verifyToken(token);
}

// -------------------------------------------------------------
// HTTP REQUEST HANDLER
// -------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(urlObj.pathname);
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // ===========================================================
  // API ROUTES
  // ===========================================================
  if (pathname.startsWith('/api/')) {
    try {
      // 1. HEALTH & REALTIME STATUS
      if (pathname === '/api/health' || pathname === '/api/status') {
        const all = await DataRepo.getAllData();
        return sendJSON(res, 200, {
          status: 'ok',
          database: activeDatabaseType,
          neonConnected: activeDatabaseType === 'neon-postgres',
          hasDatabaseUrl: Boolean(DATABASE_URL),
          dbError: dbInitError,
          version: lastDataVersion,
          counts: {
            components: all.components.length,
            machines: all.machines.length,
            movements: all.movements.length,
            dispatches: all.dispatches.length
          },
          products: ['SoilENZ', 'Soil Sparsh', 'Soil Life', 'Others', 'Common'],
          timestamp: new Date().toISOString()
        });
      }

      // 2. AUTH: REGISTER
      if (pathname === '/api/auth/register' && method === 'POST') {
        const body = await parseJSONBody(req);
        const { name, email, password } = body;

        if (!name || name.trim().length < 2) {
          return sendJSON(res, 400, { error: 'Please enter a valid full name (at least 2 characters).' });
        }
        if (!email || !email.includes('@') || !email.includes('.')) {
          return sendJSON(res, 400, { error: 'Please enter a valid email address.' });
        }
        if (!password || password.length < 6) {
          return sendJSON(res, 400, { error: 'Password must be at least 6 characters.' });
        }

        const existing = await DataRepo.findUserByEmail(email);
        if (existing) {
          return sendJSON(res, 409, { error: 'An account with this email already exists. Please log in.' });
        }

        const userCount = await DataRepo.getUserCount();
        const role = userCount === 0 ? 'admin' : 'operator';

        const createdUser = await DataRepo.createUser({ name, email, password, role });
        return sendJSON(res, 201, {
          success: true,
          message: 'Account created successfully! You can now log in with your email and password.',
          user: createdUser
        });
      }

      // 3. AUTH: LOGIN
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseJSONBody(req);
        const { email, password } = body;

        if (!email || !password) {
          return sendJSON(res, 400, { error: 'Email and password are required.' });
        }

        const user = await DataRepo.findUserByEmail(email);
        if (!user || !verifyPassword(password, user.password_hash)) {
          return sendJSON(res, 401, { error: 'Invalid email or password. Please try again.' });
        }

        if (user.email.toLowerCase().startsWith('admin@') || user.email.toLowerCase() === 'arpita@arkashine.in') {
          user.role = 'admin';
        }

        const token = generateToken(user);
        return sendJSON(res, 200, {
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }

      // 4. AUTH: CURRENT USER
      if (pathname === '/api/auth/me' && method === 'GET') {
        const auth = getAuthUser(req);
        if (!auth) {
          return sendJSON(res, 401, { error: 'Unauthenticated or session expired.' });
        }
        const user = await DataRepo.findUserByEmail(auth.email);
        if (!user) {
          return sendJSON(res, 404, { error: 'User not found.' });
        }
        return sendJSON(res, 200, {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }

      // 5. GET ALL DATA
      if (pathname === '/api/data' && method === 'GET') {
        const data = await DataRepo.getAllData();
        return sendJSON(res, 200, {
          ...data,
          version: lastDataVersion,
          database: activeDatabaseType
        });
      }

      // 6. SAVE ALL DATA (SYNC)
      if (pathname === '/api/save-all' && method === 'POST') {
        const payload = await parseJSONBody(req);
        await DataRepo.saveAllData(payload);
        return sendJSON(res, 200, {
          success: true,
          version: lastDataVersion,
          database: activeDatabaseType,
          message: 'All inventory data synchronized and stored permanently.'
        });
      }

      // 7. DELETE COMPONENT
      if (pathname.startsWith('/api/components/') && method === 'DELETE') {
        const id = pathname.replace('/api/components/', '');
        await DataRepo.deleteComponent(id);
        return sendJSON(res, 200, { success: true, deleted: id, version: lastDataVersion });
      }

      // 8. ADMIN: LIST USERS
      if (pathname === '/api/admin/users' && method === 'GET') {
        const users = await DataRepo.getAllUsers();
        return sendJSON(res, 200, {
          success: true,
          total: users.length,
          users
        });
      }

      // 9. ADMIN: CLEAN USERS LEAVING ONLY ADMIN
      if (pathname === '/api/admin/clean-users' && method === 'POST') {
        const body = await parseJSONBody(req).catch(() => ({}));
        const keep = (Array.isArray(body.keepEmails) && body.keepEmails.length > 0)
          ? body.keepEmails
          : ['admin@arkashine.com', 'arpita@arkashine.in'];
        const result = await DataRepo.cleanUsersLeavingAdmin(keep);
        return sendJSON(res, 200, {
          success: true,
          message: 'All non-admin user accounts deleted. Admin accounts preserved.',
          deletedCount: result.deletedEmails.length,
          deletedEmails: result.deletedEmails,
          remainingUsers: result.remaining
        });
      }

      return sendJSON(res, 404, { error: 'API route not found' });
    } catch (apiErr) {
      console.error('[API Error]', apiErr);
      return sendJSON(res, 500, { error: apiErr.message });
    }
  }

  // ===========================================================
  // STATIC FILES SERVING
  // ===========================================================
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.json') contentType = 'application/json';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    if (ext === '.svg') contentType = 'image/svg+xml';
    if (ext === '.ico') contentType = 'image/x-icon';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

// START SERVER
(async () => {
  await initializeDatabase();
  server.listen(PORT, '0.0.0.0', () => {
    console.log('================================================================');
    console.log(' ArkaShine Innovations – Multi-Product Portal Backend');
    console.log(` Active Database Engine: [${activeDatabaseType.toUpperCase()}]`);
    if (activeDatabaseType === 'neon-postgres') {
      console.log(' Cloud Storage: Neon Serverless PostgreSQL (Permanent Persistence)');
    }
    console.log(` Server is running live at: http://0.0.0.0:${PORT}`);
    console.log(' Real-time Sync & User Authentication Active');
    console.log(' Clean State: Zero mock/dummy data.');
    console.log('================================================================');
  });
})();
