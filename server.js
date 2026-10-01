/**
 * ArkaShine Innovations – SoilENZ, Soil Sparsh & Soil Life Inventory Backend Server
 * High-Performance Zero-Dependency Native Node.js Server with SQLite Persistence
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'inventory.db');

// Ensure database directory exists (supports Render persistent disks e.g. /var/data)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite Database
let db;
try {
  db = new DatabaseSync(DB_PATH);
  console.log(`[Database] SQLite Database loaded at: ${DB_PATH}`);
  initSchema();
} catch (err) {
  console.error('[Database Error]', err);
  process.exit(1);
}

function initSchema() {
  db.exec(`
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
      purchaseDate TEXT,
      batch TEXT,
      qty INTEGER DEFAULT 0,
      unit TEXT DEFAULT 'Pcs',
      qtyPerMachine INTEGER DEFAULT 1,
      threshold INTEGER DEFAULT 5,
      rack TEXT,
      vendorName TEXT,
      vendorPhone TEXT,
      vendorAddress TEXT,
      operator TEXT,
      notes TEXT,
      status TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      product TEXT DEFAULT 'SoilENZ',
      serialNumber TEXT UNIQUE,
      model TEXT,
      status TEXT,
      registeredDate TEXT,
      allocatedComponents TEXT,
      dispatchId TEXT
    );

    CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY,
      timestamp TEXT,
      type TEXT,
      compId TEXT,
      compName TEXT,
      qty INTEGER,
      balanceAfter INTEGER,
      reason TEXT,
      machineRef TEXT,
      operator TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS dispatches (
      id TEXT PRIMARY KEY,
      product TEXT DEFAULT 'SoilENZ',
      machineSerial TEXT,
      machineModel TEXT,
      dispatchDate TEXT,
      destinationName TEXT,
      destinationAddress TEXT,
      pathRoute TEXT,
      consigneeContact TEXT,
      transporter TEXT,
      trackingWaybill TEXT,
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

  // Migrate columns safely if table previously existed without product
  try { db.exec("ALTER TABLE components ADD COLUMN product TEXT DEFAULT 'SoilENZ'"); } catch(e) {}
  try { db.exec("ALTER TABLE machines ADD COLUMN product TEXT DEFAULT 'SoilENZ'"); } catch(e) {}
  try { db.exec("ALTER TABLE dispatches ADD COLUMN product TEXT DEFAULT 'SoilENZ'"); } catch(e) {}

  // Check if Soil Life components exist; if not, reseed with 3 products
  const hasSoilLife = db.prepare("SELECT count(*) as count FROM components WHERE product = 'Soil Life'").get();
  if (!hasSoilLife || hasSoilLife.count === 0) {
    console.log('[Database] Seeding complete 3-Product inventory (SoilENZ, Soil Sparsh, Soil Life)...');
    seedDatabase();
  }
}

function seedDatabase() {
  db.exec("DELETE FROM components; DELETE FROM machines; DELETE FROM dispatches; DELETE FROM movements; DELETE FROM notifications;");

  const insertComp = db.prepare(`
    INSERT INTO components (id, product, name, category, model, hsn, sku, link, price, purchaseDate, batch, qty, unit, qtyPerMachine, threshold, rack, vendorName, vendorPhone, vendorAddress, operator, notes, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialItems = [
    // 1. SoilENZ
    ["COMP-ENZ-01", "SoilENZ", "Multi-Wavelength Spectrophotometer Reagent Chamber", "Lab & Chemicals", "SPEC-CU-V3", "90273090", "ENZ-SPEC-01", "https://arkashine.in/internal/specs", 12500.00, "2026-08-25", "LOT-2026-OPT-08", 6, "Kits", 1, 3, "Cold Shelf Cabinet 1, Bin A", "ArkaShine Precision Optics Lab", "+91 8482 255100", "Bidar Agritech Hub, Bidar, Karnataka", "Dr. R&D Lead", "Custom 420nm, 540nm, 660nm, 880nm calibrated LEDs for enzymatic testing", "In Stock", "2026-08-25T16:00:00.000Z"],
    ["COMP-ENZ-02", "SoilENZ", "Peristaltic Reagent Metering Pump 12V DC", "Motors & Actuators", "PMP-12V-100ML", "84138190", "ENZ-PMP-02", "https://robu.in/product/12v-peristaltic-pump/", 850.00, "2026-09-12", "LOT-2026-PMP-09", 0, "Pcs", 2, 4, "Rack C, Shelf 1, Bin 05", "Robu.in", "+91 20 6731 4444", "Pune, MH", "Store Incharge", "Restock PO #AS-2026-PO-109 issued for SoilENZ line", "Out of Stock", "2026-09-12T12:00:00.000Z"],
    ["COMP-ENZ-03", "SoilENZ", "Optical Reagent Micro-Cuvette Vials (Box of 100)", "Lab & Chemicals", "CVT-100-UV", "39269099", "ENZ-CVT-03", "https://www.tarson.com/cuvettes", 980.00, "2026-09-15", "LOT-2026-TAR-09", 25, "Kits", 1, 8, "Cold Shelf Cabinet 2, Bin C", "Tarsons Products Ltd", "+91 33 2289 1234", "Kolkata, WB", "Store Incharge", "High optical clarity 340-900nm for enzyme absorbance", "In Stock", "2026-09-15T09:00:00.000Z"],
    ["COMP-ENZ-04", "SoilENZ", "Soil Dehydrogenase & Urease Assay Reagent Kit", "Lab & Chemicals", "ASSAY-DH-UR-50", "38220090", "ENZ-KIT-04", "https://arkashine.in/reagents", 3400.00, "2026-09-18", "LOT-2026-REA-09", 14, "Kits", 1, 5, "Cold Storage Refrigerator 4°C", "HiMedia Laboratories", "+91 22 6147 6666", "Mumbai, MH", "Lab Analyst", "50 tests capacity per kit for biological fertility assessment", "In Stock", "2026-09-18T10:00:00.000Z"],

    // 2. Soil Sparsh
    ["COMP-SPR-01", "Soil Sparsh", "Soil NPK 3-in-1 Sensor Probe (RS485 Modbus)", "Sensors & Probes", "NPK-RS485-M12", "90278090", "SPR-NPK-01", "https://robu.in/product/soil-npk-sensor/", 4200.00, "2026-09-02", "LOT-2026-NPK-09", 12, "Pcs", 1, 6, "Rack B, Shelf 1, Bin 12", "Goutham Electronics", "+91 80 2221 3456", "Electronics Market, SP Road, Bengaluru", "Assembly Tech", "Stainless steel 316 waterproof probes calibrated for Soil Sparsh", "In Stock", "2026-09-02T09:30:00.000Z"],
    ["COMP-SPR-02", "Soil Sparsh", "Soil pH Electrode & Signal Transmitter Module", "Sensors & Probes", "PH-E201-BNC", "90278090", "SPR-PH-02", "https://www.dfrobot.com/product-1782.html", 2150.00, "2026-09-05", "LOT-2026-PH-09", 3, "Pcs", 1, 5, "Rack B, Shelf 1, Bin 14", "Robu.in", "+91 20 6731 4444", "Pune, MH", "Store Incharge", "Requires pH 4.01 & 7.00 buffer calibration", "Low Stock", "2026-09-05T14:15:00.000Z"],
    ["COMP-SPR-03", "Soil Sparsh", "Soil EC / Salinity & Temp Probe (RS485)", "Sensors & Probes", "EC-TEMP-MOD-01", "90278090", "SPR-EC-03", "https://robu.in/product/soil-ec-sensor/", 3600.00, "2026-09-08", "LOT-2026-EC-09", 15, "Pcs", 1, 5, "Rack B, Shelf 2, Bin 03", "Goutham Electronics", "+91 80 2221 3456", "SP Road, Bengaluru", "Store Incharge", "Range 0-20000 us/cm", "In Stock", "2026-09-08T15:20:00.000Z"],
    ["COMP-SPR-04", "Soil Sparsh", "Handheld Ergonomic ABS Enclosure with Grip Handle", "Packaging & Enclosures", "ENC-SPARSH-HD2", "39269099", "SPR-ENC-04", "https://arkashine.in/hardware/sparsh", 1800.00, "2026-09-10", "LOT-2026-ENC-09", 18, "Pcs", 1, 4, "Rack C, Shelf 2, Bin 08", "Om Precision Polymers", "+91 80 2839 1122", "Peenya, Bengaluru", "Assembly Tech", "Rubberized grip with IP65 ingress protection", "In Stock", "2026-09-10T16:00:00.000Z"],

    // 3. Soil Life
    ["COMP-LIF-01", "Soil Life", "Microbial Soil Respiration CO2 Flux NDIR Gas Sensor", "Sensors & Probes", "CO2-NDIR-5000PPM", "90278090", "LIF-CO2-01", "https://robu.in/product/co2-sensor-ndir/", 8900.00, "2026-09-01", "LOT-2026-NDIR-09", 8, "Pcs", 1, 3, "Rack B, Shelf 3, Bin 01", "SenseAir India", "+91 80 4900 8800", "Whitefield, Bengaluru", "Dr. R&D Lead", "Measures soil biological microbial respiration rate", "In Stock", "2026-09-01T11:00:00.000Z"],
    ["COMP-LIF-02", "Soil Life", "Soil Organic Carbon (SOC) NIR Spectroscopy Sensor", "Sensors & Probes", "SOC-NIR-900-1700", "90273090", "LIF-SOC-02", "https://arkashine.in/sensors/soc", 11200.00, "2026-09-04", "LOT-2026-SOC-09", 5, "Pcs", 1, 3, "Rack B, Shelf 3, Bin 04", "Hamamatsu Photonics India", "+91 22 2831 4400", "Andheri East, Mumbai", "Dr. R&D Lead", "Active NIR reflectance sensor for real-time organic carbon estimation", "In Stock", "2026-09-04T14:30:00.000Z"],
    ["COMP-LIF-03", "Soil Life", "Biological Incubation Micro-Cell 37°C Chamber", "Lab & Chemicals", "BIO-INC-V2", "84198990", "LIF-BIO-03", "https://arkashine.in/hardware/life", 5600.00, "2026-09-07", "LOT-2026-INC-09", 7, "Kits", 1, 2, "Rack C, Shelf 3, Bin 02", "ArkaShine Precision Optics Lab", "+91 8482 255100", "Bidar Agritech Hub, Bidar", "Assembly Tech", "Peltier-controlled thermal incubation cell for active soil microbes", "In Stock", "2026-09-07T13:00:00.000Z"],

    // 4. Common Parts
    ["COMP-COM-01", "Common", "Raspberry Pi 4 Model B (4GB RAM)", "Microcontrollers & SBCs", "RPI-4B-4GB", "84715000", "COM-RPI4-01", "https://www.raspberrypi.com/products/raspberry-pi-4-model-b/", 5499.00, "2026-08-15", "LOT-2026-RPI-08", 24, "Pcs", 1, 5, "Rack A, Shelf 2, Bin 04", "Robu.in / Macfos Ltd", "+91 20 6731 4444", "Bhosari Industrial Estate, Pune, MH", "Store Incharge", "QC Passed, used in SoilENZ, Sparsh & Life systems", "In Stock", "2026-08-15T10:00:00.000Z"],
    ["COMP-COM-02", "Common", "7-Inch Capacitive IPS Touch Display HDMI", "Displays & Cameras", "WVS-70-IPS-1024", "85285200", "COM-DSP-02", "https://www.waveshare.com/7inch-hdmi-lcd-c.htm", 3850.00, "2026-08-20", "LOT-2026-DSP-08", 18, "Pcs", 1, 4, "Rack A, Shelf 3, Bin 01", "Waveshare Electronics", "+91 80 4123 9988", "SP Road, Bengaluru - 560002", "Store Incharge", "Includes ribbon cable and brass standoffs", "In Stock", "2026-08-20T11:00:00.000Z"],
    ["COMP-COM-03", "Common", "12V 10000mAh LiFePO4 Battery Pack with BMS", "Power & Battery", "LFP-12V-10AH-BMS", "85076000", "COM-BAT-03", "https://www.evlithium.com/12v-lifepo4-battery.html", 4950.00, "2026-09-10", "LOT-2026-BAT-09", 8, "Pcs", 1, 4, "Battery Fire-Safe Cabinet, Rack C", "Ampere Energy Systems", "+91 44 2855 1234", "Ambattur Industrial Estate, Chennai", "Store Incharge", "Equipped with 20A BMS, safety tested", "In Stock", "2026-09-10T11:45:00.000Z"],
    ["COMP-COM-04", "Common", "Heavy-Duty All-Weather Field Backpack Chassis", "Packaging & Enclosures", "BPK-MIL-SOIL-V2", "42029200", "COM-BPK-04", "https://arkashine.in/hardware/enclosures", 3400.00, "2026-08-30", "LOT-2026-BPK-08", 10, "Pcs", 1, 3, "Bulk Storage Bay 2", "Karnataka Canvas & Gear Works", "+91 80 2344 5678", "Peenya Industrial Area, Bengaluru", "Assembly Tech", "Shockproof EVA custom molded insert included", "In Stock", "2026-08-30T10:10:00.000Z"]
  ];

  for (const item of initialItems) {
    insertComp.run(...item);
  }

  // Seed Machines for 3 products
  const insertMach = db.prepare(`INSERT INTO machines (id, product, serialNumber, model, status, registeredDate, allocatedComponents, dispatchId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  insertMach.run("MACH-2026-001", "SoilENZ", "SE-2026-012", "SoilENZ AI Automated Lab System V2", "Dispatched", "2026-09-01", JSON.stringify([
    { compId: "COMP-ENZ-01", compName: "Multi-Wavelength Spectrophotometer Chamber", qty: 1 },
    { compId: "COMP-ENZ-03", compName: "Optical Reagent Micro-Cuvette Vials", qty: 1 },
    { compId: "COMP-COM-01", compName: "Raspberry Pi 4 Model B (4GB RAM)", qty: 1 },
    { compId: "COMP-COM-02", compName: "7-Inch Capacitive IPS Touch Display HDMI", qty: 1 },
    { compId: "COMP-COM-03", compName: "12V 10000mAh LiFePO4 Battery Pack", qty: 1 }
  ]), "DISP-2026-089");

  insertMach.run("MACH-2026-002", "Soil Sparsh", "SP-2026-045", "Soil Sparsh Rapid Multi-Sensor Analyzer", "Assembled", "2026-09-15", JSON.stringify([
    { compId: "COMP-SPR-01", compName: "Soil NPK 3-in-1 Sensor Probe", qty: 1 },
    { compId: "COMP-SPR-02", compName: "Soil pH Electrode & Transmitter", qty: 1 },
    { compId: "COMP-SPR-03", compName: "Soil EC / Salinity & Temp Probe", qty: 1 },
    { compId: "COMP-SPR-04", compName: "Handheld Ergonomic ABS Enclosure", qty: 1 }
  ]), null);

  insertMach.run("MACH-2026-003", "Soil Life", "SL-2026-008", "Soil Life Bio-Activity & Microbial Station", "In Assembly", "2026-09-22", JSON.stringify([
    { compId: "COMP-LIF-01", compName: "Microbial Respiration CO2 Flux Sensor", qty: 1 },
    { compId: "COMP-LIF-02", compName: "Soil Organic Carbon NIR Sensor", qty: 1 },
    { compId: "COMP-LIF-03", compName: "Biological Incubation Micro-Cell", qty: 1 }
  ]), null);

  // Seed Dispatches
  const insertDisp = db.prepare(`INSERT INTO dispatches (id, product, machineSerial, machineModel, dispatchDate, destinationName, destinationAddress, pathRoute, consigneeContact, transporter, trackingWaybill, operator, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insertDisp.run("DISP-2026-089", "SoilENZ", "SE-2026-012", "SoilENZ AI Automated Lab System V2", "2026-09-25", "Agri Innovation Centre, UAS Bangalore", "GKVK Campus, Bellary Road, Bangalore - 560065", "Bidar R&D Center → Kalaburagi Hub → NH44 Express → Bengaluru GKVK Station", "Dr. K. S. Patil - +91 94801 23456", "VRL Logistics Express Cargo", "VRL-BLR-892104", "Dispatch Supervisor - M. R. Swamy", "Pre-calibrated for enzymatic black cotton soil testing. Reagent kit included.", "2026-09-25T14:30:00.000Z");

  // Seed Movements
  const insertMov = db.prepare(`INSERT INTO movements (id, timestamp, type, compId, compName, qty, balanceAfter, reason, machineRef, operator, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insertMov.run("TX-1001", "2026-08-15 10:15", "IN", "COMP-COM-01", "Raspberry Pi 4 Model B (4GB RAM)", 25, 25, "Direct Supplier Purchase", "N/A", "Store Incharge", "Supplier Invoice #ROBU-INV-2026-88");
  insertMov.run("TX-1002", "2026-09-18 16:00", "OUT", "COMP-ENZ-01", "Multi-Wavelength Spectrophotometer Chamber", 1, 6, "Machine Allocation", "SE-2026-012", "Assembly Tech", "Installed into SoilENZ System SE-2026-012");
  insertMov.run("TX-1003", "2026-09-20 11:30", "OUT", "COMP-ENZ-02", "Peristaltic Reagent Metering Pump 12V DC", 2, 0, "Machine Allocation", "SE-2026-012", "Assembly Tech", "Final stock exhausted - reorder pending");

  // Seed Notifications
  const insertNotif = db.prepare(`INSERT INTO notifications (id, type, title, message, timestamp, read) VALUES (?, ?, ?, ?, ?, ?)`);
  insertNotif.run("NOTIF-1", "danger", "Stock Depleted: Peristaltic Reagent Metering Pump (SoilENZ)", "Inventory reached 0 Pcs. Machine assembly for SoilENZ System is paused until restocked.", "2026-09-20 11:30", 0);
  insertNotif.run("NOTIF-2", "warning", "Low Stock Alert: Soil pH Electrode (Soil Sparsh)", "Remaining stock is 3 Pcs (Safety threshold is 5 Pcs).", "2026-09-21 09:15", 0);
  insertNotif.run("NOTIF-3", "success", "Machine Dispatched: SoilENZ SE-2026-012", "En route to UAS Bangalore via VRL Logistics (Waybill: VRL-BLR-892104).", "2026-09-25 14:35", 0);

  console.log('[Database] 3-Product initial seeding completed.');
}

// Helpers
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

// Server Request Handler
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // --- API Endpoints ---
  if (pathname.startsWith('/api/')) {
    try {
      if (pathname === '/api/health' && method === 'GET') {
        return sendJSON(res, 200, { status: 'ok', database: 'sqlite', products: ['SoilENZ', 'Soil Sparsh', 'Soil Life'], timestamp: new Date().toISOString() });
      }

      if (pathname === '/api/data' && method === 'GET') {
        const components = db.prepare('SELECT * FROM components ORDER BY createdAt DESC').all();
        const rawMachines = db.prepare('SELECT * FROM machines ORDER BY registeredDate DESC').all();
        const machines = rawMachines.map(m => ({
          ...m,
          allocatedComponents: m.allocatedComponents ? JSON.parse(m.allocatedComponents) : []
        }));
        const movements = db.prepare('SELECT * FROM movements ORDER BY id ASC').all();
        const dispatches = db.prepare('SELECT * FROM dispatches ORDER BY timestamp DESC').all();
        const rawNotifs = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC').all();
        const notifications = rawNotifs.map(n => ({ ...n, read: Boolean(n.read) }));

        return sendJSON(res, 200, { components, machines, movements, dispatches, notifications });
      }

      if (pathname === '/api/save-all' && method === 'POST') {
        const payload = await parseJSONBody(req);
        const { components, machines, movements, dispatches, notifications } = payload;

        if (components && Array.isArray(components)) {
          const stmtComp = db.prepare(`
            INSERT OR REPLACE INTO components (
              id, product, name, category, model, hsn, sku, link, price, purchaseDate, batch, qty, unit, qtyPerMachine, threshold, rack, vendorName, vendorPhone, vendorAddress, operator, notes, status, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const c of components) {
            stmtComp.run(
              c.id, c.product || 'SoilENZ', c.name || '', c.category || '', c.model || '', c.hsn || '', c.sku || '', c.link || '',
              Number(c.price) || 0, c.purchaseDate || '', c.batch || '', Number(c.qty) || 0, c.unit || 'Pcs',
              Number(c.qtyPerMachine) || 1, Number(c.threshold) || 5, c.rack || '', c.vendorName || '',
              c.vendorPhone || '', c.vendorAddress || '', c.operator || '', c.notes || '', c.status || 'In Stock',
              c.createdAt || new Date().toISOString(), c.updatedAt || new Date().toISOString()
            );
          }
        }

        if (machines && Array.isArray(machines)) {
          const stmtMach = db.prepare(`
            INSERT OR REPLACE INTO machines (id, product, serialNumber, model, status, registeredDate, allocatedComponents, dispatchId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const m of machines) {
            stmtMach.run(m.id, m.product || 'SoilENZ', m.serialNumber, m.model, m.status, m.registeredDate, JSON.stringify(m.allocatedComponents || []), m.dispatchId || null);
          }
        }

        if (movements && Array.isArray(movements)) {
          const stmtMov = db.prepare(`
            INSERT OR REPLACE INTO movements (id, timestamp, type, compId, compName, qty, balanceAfter, reason, machineRef, operator, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const m of movements) {
            stmtMov.run(m.id, m.timestamp, m.type, m.compId, m.compName, m.qty, m.balanceAfter, m.reason, m.machineRef, m.operator, m.notes);
          }
        }

        if (dispatches && Array.isArray(dispatches)) {
          const stmtDisp = db.prepare(`
            INSERT OR REPLACE INTO dispatches (id, product, machineSerial, machineModel, dispatchDate, destinationName, destinationAddress, pathRoute, consigneeContact, transporter, trackingWaybill, operator, notes, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const d of dispatches) {
            stmtDisp.run(d.id, d.product || 'SoilENZ', d.machineSerial, d.machineModel, d.dispatchDate, d.destinationName, d.destinationAddress, d.pathRoute, d.consigneeContact, d.transporter, d.trackingWaybill, d.operator, d.notes, d.timestamp);
          }
        }

        return sendJSON(res, 200, { success: true, message: 'All tables synced to SQLite database successfully.' });
      }

      if (pathname.startsWith('/api/components/') && method === 'DELETE') {
        const id = pathname.replace('/api/components/', '');
        db.prepare('DELETE FROM components WHERE id = ?').run(id);
        return sendJSON(res, 200, { success: true, deleted: id });
      }

      return sendJSON(res, 404, { error: 'API route not found' });
    } catch (apiErr) {
      console.error('[API Error]', apiErr);
      return sendJSON(res, 500, { error: apiErr.message });
    }
  }

  // --- Static Files ---
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

server.listen(PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log(' ArkaShine Innovations – 3 Products Inventory Portal Backend');
  console.log(' Products Supported: [SoilENZ, Soil Sparsh, Soil Life]');
  console.log(` Server is running live at: http://0.0.0.0:${PORT}`);
  console.log(` SQLite Database: ${DB_PATH}`);
  console.log('================================================================');
});
