/**
 * ArkaShine Innovations – SoilENZ, Soil Sparsh & Soil Life Inventory Backend Server
 * Universal Zero-Dependency Native Node.js Server with Dual Storage:
 * 1. Native SQLite Database (node:sqlite with --experimental-sqlite in Node 22+)
 * 2. High-Performance Resilient JSON Store Fallback (works universally on any Node.js version)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'inventory.db');
const JSON_DB_PATH = path.join(path.dirname(DB_PATH), 'inventory_store.json');

// Ensure database directory exists (supports Render persistent disks e.g. /var/data)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// -------------------------------------------------------------
// SEED DATA DEFINITION
// -------------------------------------------------------------
function getInitialSeedData() {
  const components = [
    // 1. SoilENZ
    { id: "COMP-ENZ-01", product: "SoilENZ", name: "Multi-Wavelength Spectrophotometer Reagent Chamber", category: "Lab & Chemicals", model: "SPEC-CU-V3", hsn: "90273090", sku: "ENZ-SPEC-01", link: "https://arkashine.in/internal/specs", price: 12500, purchaseDate: "2026-08-25", batch: "LOT-2026-OPT-08", qty: 6, unit: "Kits", qtyPerMachine: 1, threshold: 3, rack: "Cold Shelf Cabinet 1, Bin A", vendorName: "ArkaShine Precision Optics Lab", vendorPhone: "+91 8482 255100", vendorAddress: "Bidar Agritech Hub, Bidar, Karnataka", operator: "Dr. R&D Lead", notes: "Custom 420nm, 540nm, 660nm, 880nm calibrated LEDs for enzymatic testing", status: "In Stock", createdAt: "2026-08-25T16:00:00.000Z", updatedAt: "2026-08-25T16:00:00.000Z" },
    { id: "COMP-ENZ-02", product: "SoilENZ", name: "Peristaltic Reagent Metering Pump 12V DC", category: "Motors & Actuators", model: "PMP-12V-100ML", hsn: "84138190", sku: "ENZ-PMP-02", link: "https://robu.in/product/12v-peristaltic-pump/", price: 850, purchaseDate: "2026-09-12", batch: "LOT-2026-PMP-09", qty: 0, unit: "Pcs", qtyPerMachine: 2, threshold: 4, rack: "Rack C, Shelf 1, Bin 05", vendorName: "Robu.in", vendorPhone: "+91 20 6731 4444", vendorAddress: "Pune, MH", operator: "Store Incharge", notes: "Restock PO #AS-2026-PO-109 issued for SoilENZ line", status: "Out of Stock", createdAt: "2026-09-12T12:00:00.000Z", updatedAt: "2026-09-12T12:00:00.000Z" },
    { id: "COMP-ENZ-03", product: "SoilENZ", name: "Optical Reagent Micro-Cuvette Vials (Box of 100)", category: "Lab & Chemicals", model: "CVT-100-UV", hsn: "39269099", sku: "ENZ-CVT-03", link: "https://www.tarson.com/cuvettes", price: 980, purchaseDate: "2026-09-15", batch: "LOT-2026-TAR-09", qty: 25, unit: "Kits", qtyPerMachine: 1, threshold: 8, rack: "Cold Shelf Cabinet 2, Bin C", vendorName: "Tarsons Products Ltd", vendorPhone: "+91 33 2289 1234", vendorAddress: "Kolkata, WB", operator: "Store Incharge", notes: "High optical clarity 340-900nm for enzyme absorbance", status: "In Stock", createdAt: "2026-09-15T09:00:00.000Z", updatedAt: "2026-09-15T09:00:00.000Z" },
    { id: "COMP-ENZ-04", product: "SoilENZ", name: "Soil Dehydrogenase & Urease Assay Reagent Kit", category: "Lab & Chemicals", model: "ASSAY-DH-UR-50", hsn: "38220090", sku: "ENZ-KIT-04", link: "https://arkashine.in/reagents", price: 3400, purchaseDate: "2026-09-18", batch: "LOT-2026-REA-09", qty: 14, unit: "Kits", qtyPerMachine: 1, threshold: 5, rack: "Cold Storage Refrigerator 4°C", vendorName: "HiMedia Laboratories", vendorPhone: "+91 22 6147 6666", vendorAddress: "Mumbai, MH", operator: "Lab Analyst", notes: "50 tests capacity per kit for biological fertility assessment", status: "In Stock", createdAt: "2026-09-18T10:00:00.000Z", updatedAt: "2026-09-18T10:00:00.000Z" },

    // 2. Soil Sparsh
    { id: "COMP-SPR-01", product: "Soil Sparsh", name: "Soil NPK 3-in-1 Sensor Probe (RS485 Modbus)", category: "Sensors & Probes", model: "NPK-RS485-M12", hsn: "90278090", sku: "SPR-NPK-01", link: "https://robu.in/product/soil-npk-sensor/", price: 4200, purchaseDate: "2026-09-02", batch: "LOT-2026-NPK-09", qty: 12, unit: "Pcs", qtyPerMachine: 1, threshold: 6, rack: "Rack B, Shelf 1, Bin 12", vendorName: "Goutham Electronics", vendorPhone: "+91 80 2221 3456", vendorAddress: "Electronics Market, SP Road, Bengaluru", operator: "Assembly Tech", notes: "Stainless steel 316 waterproof probes calibrated for Soil Sparsh", status: "In Stock", createdAt: "2026-09-02T09:30:00.000Z", updatedAt: "2026-09-02T09:30:00.000Z" },
    { id: "COMP-SPR-02", product: "Soil Sparsh", name: "Soil pH Electrode & Signal Transmitter Module", category: "Sensors & Probes", model: "PH-E201-BNC", hsn: "90278090", sku: "SPR-PH-02", link: "https://www.dfrobot.com/product-1782.html", price: 2150, purchaseDate: "2026-09-05", batch: "LOT-2026-PH-09", qty: 3, unit: "Pcs", qtyPerMachine: 1, threshold: 5, rack: "Rack B, Shelf 1, Bin 14", vendorName: "Robu.in", vendorPhone: "+91 20 6731 4444", vendorAddress: "Pune, MH", operator: "Store Incharge", notes: "Requires pH 4.01 & 7.00 buffer calibration", status: "Low Stock", createdAt: "2026-09-05T14:15:00.000Z", updatedAt: "2026-09-05T14:15:00.000Z" },
    { id: "COMP-SPR-03", product: "Soil Sparsh", name: "Soil EC / Salinity & Temp Probe (RS485)", category: "Sensors & Probes", model: "EC-TEMP-MOD-01", hsn: "90278090", sku: "SPR-EC-03", link: "https://robu.in/product/soil-ec-sensor/", price: 3600, purchaseDate: "2026-09-08", batch: "LOT-2026-EC-09", qty: 15, unit: "Pcs", qtyPerMachine: 1, threshold: 5, rack: "Rack B, Shelf 2, Bin 03", vendorName: "Goutham Electronics", vendorPhone: "+91 80 2221 3456", vendorAddress: "SP Road, Bengaluru", operator: "Store Incharge", notes: "Range 0-20000 us/cm", status: "In Stock", createdAt: "2026-09-08T15:20:00.000Z", updatedAt: "2026-09-08T15:20:00.000Z" },
    { id: "COMP-SPR-04", product: "Soil Sparsh", name: "Handheld Ergonomic ABS Enclosure with Grip Handle", category: "Packaging & Enclosures", model: "ENC-SPARSH-HD2", hsn: "39269099", sku: "SPR-ENC-04", link: "https://arkashine.in/hardware/sparsh", price: 1800, purchaseDate: "2026-09-10", batch: "LOT-2026-ENC-09", qty: 18, unit: "Pcs", qtyPerMachine: 1, threshold: 4, rack: "Rack C, Shelf 2, Bin 08", vendorName: "Om Precision Polymers", vendorPhone: "+91 80 2839 1122", vendorAddress: "Peenya, Bengaluru", operator: "Assembly Tech", notes: "Rubberized grip with IP65 ingress protection", status: "In Stock", createdAt: "2026-09-10T16:00:00.000Z", updatedAt: "2026-09-10T16:00:00.000Z" },

    // 3. Soil Life
    { id: "COMP-LIF-01", product: "Soil Life", name: "Microbial Soil Respiration CO2 Flux NDIR Gas Sensor", category: "Sensors & Probes", model: "CO2-NDIR-5000PPM", hsn: "90278090", sku: "LIF-CO2-01", link: "https://robu.in/product/co2-sensor-ndir/", price: 8900, purchaseDate: "2026-09-01", batch: "LOT-2026-NDIR-09", qty: 8, unit: "Pcs", qtyPerMachine: 1, threshold: 3, rack: "Rack B, Shelf 3, Bin 01", vendorName: "SenseAir India", vendorPhone: "+91 80 4900 8800", vendorAddress: "Whitefield, Bengaluru", operator: "Dr. R&D Lead", notes: "Measures soil biological microbial respiration rate", status: "In Stock", createdAt: "2026-09-01T11:00:00.000Z", updatedAt: "2026-09-01T11:00:00.000Z" },
    { id: "COMP-LIF-02", product: "Soil Life", name: "Soil Organic Carbon (SOC) NIR Spectroscopy Sensor", category: "Sensors & Probes", model: "SOC-NIR-900-1700", hsn: "90273090", sku: "LIF-SOC-02", link: "https://arkashine.in/sensors/soc", price: 11200, purchaseDate: "2026-09-04", batch: "LOT-2026-SOC-09", qty: 5, unit: "Pcs", qtyPerMachine: 1, threshold: 3, rack: "Rack B, Shelf 3, Bin 04", vendorName: "Hamamatsu Photonics India", vendorPhone: "+91 22 2831 4400", vendorAddress: "Andheri East, Mumbai", operator: "Dr. R&D Lead", notes: "Active NIR reflectance sensor for real-time organic carbon estimation", status: "In Stock", createdAt: "2026-09-04T14:30:00.000Z", updatedAt: "2026-09-04T14:30:00.000Z" },
    { id: "COMP-LIF-03", product: "Soil Life", name: "Biological Incubation Micro-Cell 37°C Chamber", category: "Lab & Chemicals", model: "BIO-INC-V2", hsn: "84198990", sku: "LIF-BIO-03", link: "https://arkashine.in/hardware/life", price: 5600, purchaseDate: "2026-09-07", batch: "LOT-2026-INC-09", qty: 7, unit: "Kits", qtyPerMachine: 1, threshold: 2, rack: "Rack C, Shelf 3, Bin 02", vendorName: "ArkaShine Precision Optics Lab", vendorPhone: "+91 8482 255100", vendorAddress: "Bidar Agritech Hub, Bidar", operator: "Assembly Tech", notes: "Peltier-controlled thermal incubation cell for active soil microbes", status: "In Stock", createdAt: "2026-09-07T13:00:00.000Z", updatedAt: "2026-09-07T13:00:00.000Z" },

    // 4. Common Parts
    { id: "COMP-COM-01", product: "Common", name: "Raspberry Pi 4 Model B (4GB RAM)", category: "Microcontrollers & SBCs", model: "RPI-4B-4GB", hsn: "84715000", sku: "COM-RPI4-01", link: "https://www.raspberrypi.com/products/raspberry-pi-4-model-b/", price: 5499, purchaseDate: "2026-08-15", batch: "LOT-2026-RPI-08", qty: 24, unit: "Pcs", qtyPerMachine: 1, threshold: 5, rack: "Rack A, Shelf 2, Bin 04", vendorName: "Robu.in / Macfos Ltd", vendorPhone: "+91 20 6731 4444", vendorAddress: "Bhosari Industrial Estate, Pune, MH", operator: "Store Incharge", notes: "QC Passed, used in SoilENZ, Sparsh & Life systems", status: "In Stock", createdAt: "2026-08-15T10:00:00.000Z", updatedAt: "2026-08-15T10:00:00.000Z" },
    { id: "COMP-COM-02", product: "Common", name: "7-Inch Capacitive IPS Touch Display HDMI", category: "Displays & Cameras", model: "WVS-70-IPS-1024", hsn: "85285200", sku: "COM-DSP-02", link: "https://www.waveshare.com/7inch-hdmi-lcd-c.htm", price: 3850, purchaseDate: "2026-08-20", batch: "LOT-2026-DSP-08", qty: 18, unit: "Pcs", qtyPerMachine: 1, threshold: 4, rack: "Rack A, Shelf 3, Bin 01", vendorName: "Waveshare Electronics", vendorPhone: "+91 80 4123 9988", vendorAddress: "SP Road, Bengaluru - 560002", operator: "Store Incharge", notes: "Includes ribbon cable and brass standoffs", status: "In Stock", createdAt: "2026-08-20T11:00:00.000Z", updatedAt: "2026-08-20T11:00:00.000Z" },
    { id: "COMP-COM-03", product: "Common", name: "12V 10000mAh LiFePO4 Battery Pack with BMS", category: "Power & Battery", model: "LFP-12V-10AH-BMS", hsn: "85076000", sku: "COM-BAT-03", link: "https://www.evlithium.com/12v-lifepo4-battery.html", price: 4950, purchaseDate: "2026-09-10", batch: "LOT-2026-BAT-09", qty: 8, unit: "Pcs", qtyPerMachine: 1, threshold: 4, rack: "Battery Fire-Safe Cabinet, Rack C", vendorName: "Ampere Energy Systems", vendorPhone: "+91 44 2855 1234", vendorAddress: "Ambattur Industrial Estate, Chennai", operator: "Store Incharge", notes: "Equipped with 20A BMS, safety tested", status: "In Stock", createdAt: "2026-09-10T11:45:00.000Z", updatedAt: "2026-09-10T11:45:00.000Z" },
    { id: "COMP-COM-04", product: "Common", name: "Heavy-Duty All-Weather Field Backpack Chassis", category: "Packaging & Enclosures", model: "BPK-MIL-SOIL-V2", hsn: "42029200", sku: "COM-BPK-04", link: "https://arkashine.in/hardware/enclosures", price: 3400, purchaseDate: "2026-08-30", batch: "LOT-2026-BPK-08", qty: 10, unit: "Pcs", qtyPerMachine: 1, threshold: 3, rack: "Bulk Storage Bay 2", vendorName: "Karnataka Canvas & Gear Works", vendorPhone: "+91 80 2344 5678", vendorAddress: "Peenya Industrial Area, Bengaluru", operator: "Assembly Tech", notes: "Shockproof EVA custom molded insert included", status: "In Stock", createdAt: "2026-08-30T10:10:00.000Z", updatedAt: "2026-08-30T10:10:00.000Z" }
  ];

  const machines = [
    {
      id: "MACH-2026-001",
      product: "SoilENZ",
      serialNumber: "SE-2026-012",
      model: "SoilENZ AI Automated Lab System V2",
      status: "Dispatched",
      registeredDate: "2026-09-01",
      allocatedComponents: [
        { compId: "COMP-ENZ-01", compName: "Multi-Wavelength Spectrophotometer Chamber", qty: 1 },
        { compId: "COMP-ENZ-03", compName: "Optical Reagent Micro-Cuvette Vials", qty: 1 },
        { compId: "COMP-COM-01", compName: "Raspberry Pi 4 Model B (4GB RAM)", qty: 1 },
        { compId: "COMP-COM-02", compName: "7-Inch Capacitive IPS Touch Display HDMI", qty: 1 },
        { compId: "COMP-COM-03", compName: "12V 10000mAh LiFePO4 Battery Pack", qty: 1 }
      ],
      dispatchId: "DISP-2026-089"
    },
    {
      id: "MACH-2026-002",
      product: "Soil Sparsh",
      serialNumber: "SP-2026-045",
      model: "Soil Sparsh Rapid Multi-Sensor Analyzer",
      status: "Assembled",
      registeredDate: "2026-09-15",
      allocatedComponents: [
        { compId: "COMP-SPR-01", compName: "Soil NPK 3-in-1 Sensor Probe", qty: 1 },
        { compId: "COMP-SPR-02", compName: "Soil pH Electrode & Transmitter", qty: 1 },
        { compId: "COMP-SPR-03", compName: "Soil EC / Salinity & Temp Probe", qty: 1 },
        { compId: "COMP-SPR-04", compName: "Handheld Ergonomic ABS Enclosure", qty: 1 }
      ],
      dispatchId: null
    },
    {
      id: "MACH-2026-003",
      product: "Soil Life",
      serialNumber: "SL-2026-008",
      model: "Soil Life Bio-Activity & Microbial Station",
      status: "In Assembly",
      registeredDate: "2026-09-22",
      allocatedComponents: [
        { compId: "COMP-LIF-01", compName: "Microbial Respiration CO2 Flux Sensor", qty: 1 },
        { compId: "COMP-LIF-02", compName: "Soil Organic Carbon NIR Sensor", qty: 1 },
        { compId: "COMP-LIF-03", compName: "Biological Incubation Micro-Cell", qty: 1 }
      ],
      dispatchId: null
    }
  ];

  const dispatches = [
    {
      id: "DISP-2026-089",
      product: "SoilENZ",
      machineSerial: "SE-2026-012",
      machineModel: "SoilENZ AI Automated Lab System V2",
      dispatchDate: "2026-09-25",
      destinationName: "Agri Innovation Centre, UAS Bangalore",
      destinationAddress: "GKVK Campus, Bellary Road, Bangalore - 560065",
      pathRoute: "Bidar R&D Center → Kalaburagi Hub → NH44 Express → Bengaluru GKVK Station",
      consigneeContact: "Dr. K. S. Patil - +91 94801 23456",
      transporter: "VRL Logistics Express Cargo",
      trackingWaybill: "VRL-BLR-892104",
      operator: "Dispatch Supervisor - M. R. Swamy",
      notes: "Pre-calibrated for enzymatic black cotton soil testing. Reagent kit included.",
      timestamp: "2026-09-25T14:30:00.000Z"
    }
  ];

  const movements = [
    { id: "TX-1001", timestamp: "2026-08-15 10:15", type: "IN", compId: "COMP-COM-01", compName: "Raspberry Pi 4 Model B (4GB RAM)", qty: 25, balanceAfter: 25, reason: "Direct Supplier Purchase", machineRef: "N/A", operator: "Store Incharge", notes: "Supplier Invoice #ROBU-INV-2026-88" },
    { id: "TX-1002", timestamp: "2026-09-18 16:00", type: "OUT", compId: "COMP-ENZ-01", compName: "Multi-Wavelength Spectrophotometer Chamber", qty: 1, balanceAfter: 6, reason: "Machine Allocation", machineRef: "SE-2026-012", operator: "Assembly Tech", notes: "Installed into SoilENZ System SE-2026-012" },
    { id: "TX-1003", timestamp: "2026-09-20 11:30", type: "OUT", compId: "COMP-ENZ-02", compName: "Peristaltic Reagent Metering Pump 12V DC", qty: 2, balanceAfter: 0, reason: "Machine Allocation", machineRef: "SE-2026-012", operator: "Assembly Tech", notes: "Final stock exhausted - reorder pending" }
  ];

  const notifications = [
    { id: "NOTIF-1", type: "danger", title: "Stock Depleted: Peristaltic Reagent Metering Pump (SoilENZ)", message: "Inventory reached 0 Pcs. Machine assembly for SoilENZ System is paused until restocked.", timestamp: "2026-09-20 11:30", read: false },
    { id: "NOTIF-2", type: "warning", title: "Low Stock Alert: Soil pH Electrode (Soil Sparsh)", message: "Remaining stock is 3 Pcs (Safety threshold is 5 Pcs).", timestamp: "2026-09-21 09:15", read: false },
    { id: "NOTIF-3", type: "success", title: "Machine Dispatched: SoilENZ SE-2026-012", message: "En route to UAS Bangalore via VRL Logistics (Waybill: VRL-BLR-892104).", timestamp: "2026-09-25 14:35", read: false }
  ];

  return { components, machines, movements, dispatches, notifications };
}

// -------------------------------------------------------------
// DUAL STORAGE ENGINE SETUP
// -------------------------------------------------------------
let db = null;
let isSqlite = false;
let jsonStore = null;

// Try to safely load native SQLite
try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_PATH);
  isSqlite = true;
  console.log(`[Database] Native SQLite loaded successfully at: ${DB_PATH}`);
  initSqliteSchema();
} catch (err) {
  isSqlite = false;
  console.warn(`[Database Info] Native node:sqlite not enabled (${err.message}).`);
  console.log(`[Database] Activating Resilient JSON Database Engine at: ${JSON_DB_PATH}`);
  initJsonStore();
}

function initJsonStore() {
  if (fs.existsSync(JSON_DB_PATH)) {
    try {
      const content = fs.readFileSync(JSON_DB_PATH, 'utf8');
      jsonStore = JSON.parse(content);
      if (jsonStore && jsonStore.components && jsonStore.machines) {
        console.log(`[Database] Loaded ${jsonStore.components.length} components from JSON store.`);
        return;
      }
    } catch (e) {
      console.error('[Database] Failed to parse existing JSON store, recreating...', e);
    }
  }

  jsonStore = getInitialSeedData();
  saveJsonStore();
  console.log(`[Database] JSON store initialized with 3-Product default catalog.`);
}

function saveJsonStore() {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(jsonStore, null, 2), 'utf8');
  } catch (err) {
    console.error('[Database Save Error]', err);
  }
}

function initSqliteSchema() {
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

  try { db.exec("ALTER TABLE components ADD COLUMN product TEXT DEFAULT 'SoilENZ'"); } catch(e) {}
  try { db.exec("ALTER TABLE machines ADD COLUMN product TEXT DEFAULT 'SoilENZ'"); } catch(e) {}
  try { db.exec("ALTER TABLE dispatches ADD COLUMN product TEXT DEFAULT 'SoilENZ'"); } catch(e) {}

  const hasSoilLife = db.prepare("SELECT count(*) as count FROM components WHERE product = 'Soil Life'").get();
  if (!hasSoilLife || hasSoilLife.count === 0) {
    console.log('[Database] Seeding complete 3-Product inventory in SQLite...');
    seedSqliteDatabase();
  }
}

function seedSqliteDatabase() {
  db.exec("DELETE FROM components; DELETE FROM machines; DELETE FROM dispatches; DELETE FROM movements; DELETE FROM notifications;");

  const seed = getInitialSeedData();

  const insertComp = db.prepare(`
    INSERT INTO components (id, product, name, category, model, hsn, sku, link, price, purchaseDate, batch, qty, unit, qtyPerMachine, threshold, rack, vendorName, vendorPhone, vendorAddress, operator, notes, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of seed.components) {
    insertComp.run(c.id, c.product, c.name, c.category, c.model, c.hsn, c.sku, c.link, c.price, c.purchaseDate, c.batch, c.qty, c.unit, c.qtyPerMachine, c.threshold, c.rack, c.vendorName, c.vendorPhone, c.vendorAddress, c.operator, c.notes, c.status, c.createdAt, c.updatedAt);
  }

  const insertMach = db.prepare(`INSERT INTO machines (id, product, serialNumber, model, status, registeredDate, allocatedComponents, dispatchId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const m of seed.machines) {
    insertMach.run(m.id, m.product, m.serialNumber, m.model, m.status, m.registeredDate, JSON.stringify(m.allocatedComponents || []), m.dispatchId);
  }

  const insertDisp = db.prepare(`INSERT INTO dispatches (id, product, machineSerial, machineModel, dispatchDate, destinationName, destinationAddress, pathRoute, consigneeContact, transporter, trackingWaybill, operator, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const d of seed.dispatches) {
    insertDisp.run(d.id, d.product, d.machineSerial, d.machineModel, d.dispatchDate, d.destinationName, d.destinationAddress, d.pathRoute, d.consigneeContact, d.transporter, d.trackingWaybill, d.operator, d.notes, d.timestamp);
  }

  const insertMov = db.prepare(`INSERT INTO movements (id, timestamp, type, compId, compName, qty, balanceAfter, reason, machineRef, operator, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const mov of seed.movements) {
    insertMov.run(mov.id, mov.timestamp, mov.type, mov.compId, mov.compName, mov.qty, mov.balanceAfter, mov.reason, mov.machineRef, mov.operator, mov.notes);
  }

  const insertNotif = db.prepare(`INSERT INTO notifications (id, type, title, message, timestamp, read) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const n of seed.notifications) {
    insertNotif.run(n.id, n.type, n.title, n.message, n.timestamp, n.read ? 1 : 0);
  }

  console.log('[Database] 3-Product initial SQLite seeding completed.');
}

// -------------------------------------------------------------
// HELPERS
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

// -------------------------------------------------------------
// HTTP SERVER & API ROUTES
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

  // --- API Endpoints ---
  if (pathname.startsWith('/api/')) {
    try {
      if (pathname === '/api/health' && method === 'GET') {
        return sendJSON(res, 200, {
          status: 'ok',
          database: isSqlite ? 'sqlite' : 'json-store',
          products: ['SoilENZ', 'Soil Sparsh', 'Soil Life', 'Others', 'Common'],
          timestamp: new Date().toISOString()
        });
      }

      if (pathname === '/api/data' && method === 'GET') {
        if (isSqlite) {
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
        } else {
          return sendJSON(res, 200, jsonStore);
        }
      }

      if (pathname === '/api/save-all' && method === 'POST') {
        const payload = await parseJSONBody(req);
        const { components, machines, movements, dispatches, notifications } = payload;

        if (isSqlite) {
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
        } else {
          // JSON store update
          if (components) jsonStore.components = components;
          if (machines) jsonStore.machines = machines;
          if (movements) jsonStore.movements = movements;
          if (dispatches) jsonStore.dispatches = dispatches;
          if (notifications) jsonStore.notifications = notifications;
          saveJsonStore();
        }

        return sendJSON(res, 200, { success: true, message: 'All tables synced successfully.', engine: isSqlite ? 'sqlite' : 'json' });
      }

      if (pathname.startsWith('/api/components/') && method === 'DELETE') {
        const id = pathname.replace('/api/components/', '');
        if (isSqlite) {
          db.prepare('DELETE FROM components WHERE id = ?').run(id);
        } else {
          jsonStore.components = jsonStore.components.filter(c => c.id !== id);
          saveJsonStore();
        }
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
  console.log(' Products: [SoilENZ, Soil Sparsh, Soil Life, Others, Common]');
  console.log(` Server is running live at: http://0.0.0.0:${PORT}`);
  console.log(` Active Database Engine: ${isSqlite ? 'Native SQLite' : 'JSON Persistent Store'}`);
  console.log('================================================================');
});
