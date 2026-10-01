/**
 * ArkaShine Innovations – SoilENZ Component Inventory & Machine Dispatch System
 * Supported Product Lines: SoilENZ | Soil Sparsh | Soil Life | Others | Common
 * Client Application Engine with SQLite Backend Sync, Editable Categories & Machine Management
 */

// Global State
const AppState = {
  components: [],
  machines: [],
  movements: [],
  dispatches: [],
  notifications: [],
  selectedProduct: 'ALL', // 'ALL' | 'SoilENZ' | 'Soil Sparsh' | 'Soil Life' | 'Others' | 'Common'
  soundEnabled: true,
  currentView: 'table', // 'table' | 'card'
  pendingExcelRows: [],
  backendConnected: false,
  apiBase: ''
};

// ==========================================================================
// SEED DATA FOR PRODUCTS (SoilENZ, Soil Sparsh, Soil Life, Others, Common)
// ==========================================================================
const SEED_COMPONENTS = [
  // --- 1. SoilENZ Series Components ---
  {
    id: "COMP-ENZ-01",
    product: "SoilENZ",
    name: "Multi-Wavelength Spectrophotometer Reagent Chamber",
    category: "Lab & Chemicals",
    model: "SPEC-CU-V3",
    hsn: "90273090",
    sku: "ENZ-SPEC-01",
    link: "https://arkashine.in/internal/specs",
    price: 12500.00,
    purchaseDate: "2026-08-25",
    batch: "LOT-2026-OPT-08",
    qty: 6,
    unit: "Kits",
    qtyPerMachine: 1,
    threshold: 3,
    rack: "Cold Shelf Cabinet 1, Bin A",
    vendorName: "ArkaShine Precision Optics Lab",
    vendorPhone: "+91 8482 255100",
    vendorAddress: "Bidar Agritech Hub, Bidar, Karnataka",
    operator: "Dr. R&D Lead",
    notes: "Custom 420nm, 540nm, 660nm, 880nm calibrated LEDs for enzymatic testing",
    status: "In Stock",
    createdAt: "2026-08-25T16:00:00.000Z"
  },
  {
    id: "COMP-ENZ-02",
    product: "SoilENZ",
    name: "Peristaltic Reagent Metering Pump 12V DC",
    category: "Motors & Actuators",
    model: "PMP-12V-100ML",
    hsn: "84138190",
    sku: "ENZ-PMP-02",
    link: "https://robu.in/product/12v-peristaltic-pump/",
    price: 850.00,
    purchaseDate: "2026-09-12",
    batch: "LOT-2026-PMP-09",
    qty: 0,
    unit: "Pcs",
    qtyPerMachine: 2,
    threshold: 4,
    rack: "Rack C, Shelf 1, Bin 05",
    vendorName: "Robu.in",
    vendorPhone: "+91 20 6731 4444",
    vendorAddress: "Pune, MH",
    operator: "Store Incharge",
    notes: "Restock PO #AS-2026-PO-109 issued for SoilENZ line",
    status: "Out of Stock",
    createdAt: "2026-09-12T12:00:00.000Z"
  },
  {
    id: "COMP-ENZ-03",
    product: "SoilENZ",
    name: "Optical Reagent Micro-Cuvette Vials (Box of 100)",
    category: "Lab & Chemicals",
    model: "CVT-100-UV",
    hsn: "39269099",
    sku: "ENZ-CVT-03",
    link: "https://www.tarson.com/cuvettes",
    price: 980.00,
    purchaseDate: "2026-09-15",
    batch: "LOT-2026-TAR-09",
    qty: 25,
    unit: "Kits",
    qtyPerMachine: 1,
    threshold: 8,
    rack: "Cold Shelf Cabinet 2, Bin C",
    vendorName: "Tarsons Products Ltd",
    vendorPhone: "+91 33 2289 1234",
    vendorAddress: "Kolkata, WB",
    operator: "Store Incharge",
    notes: "High optical clarity 340-900nm for enzyme absorbance",
    status: "In Stock",
    createdAt: "2026-09-15T09:00:00.000Z"
  },
  {
    id: "COMP-ENZ-04",
    product: "SoilENZ",
    name: "Soil Dehydrogenase & Urease Assay Reagent Kit",
    category: "Lab & Chemicals",
    model: "ASSAY-DH-UR-50",
    hsn: "38220090",
    sku: "ENZ-KIT-04",
    link: "https://arkashine.in/reagents",
    price: 3400.00,
    purchaseDate: "2026-09-18",
    batch: "LOT-2026-REA-09",
    qty: 14,
    unit: "Kits",
    qtyPerMachine: 1,
    threshold: 5,
    rack: "Cold Storage Refrigerator 4°C",
    vendorName: "HiMedia Laboratories",
    vendorPhone: "+91 22 6147 6666",
    vendorAddress: "Mumbai, MH",
    operator: "Lab Analyst",
    notes: "50 tests capacity per kit for biological fertility assessment",
    status: "In Stock",
    createdAt: "2026-09-18T10:00:00.000Z"
  },

  // --- 2. Soil Sparsh Series Components ---
  {
    id: "COMP-SPR-01",
    product: "Soil Sparsh",
    name: "Soil NPK 3-in-1 Sensor Probe (RS485 Modbus)",
    category: "Sensors & Probes",
    model: "NPK-RS485-M12",
    hsn: "90278090",
    sku: "SPR-NPK-01",
    link: "https://robu.in/product/soil-npk-sensor/",
    price: 4200.00,
    purchaseDate: "2026-09-02",
    batch: "LOT-2026-NPK-09",
    qty: 12,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 6,
    rack: "Rack B, Shelf 1, Bin 12",
    vendorName: "Goutham Electronics",
    vendorPhone: "+91 80 2221 3456",
    vendorAddress: "Electronics Market, SP Road, Bengaluru",
    operator: "Assembly Tech",
    notes: "Stainless steel 316 waterproof probes calibrated for Soil Sparsh",
    status: "In Stock",
    createdAt: "2026-09-02T09:30:00.000Z"
  },
  {
    id: "COMP-SPR-02",
    product: "Soil Sparsh",
    name: "Soil pH Electrode & Signal Transmitter Module",
    category: "Sensors & Probes",
    model: "PH-E201-BNC",
    hsn: "90278090",
    sku: "SPR-PH-02",
    link: "https://www.dfrobot.com/product-1782.html",
    price: 2150.00,
    purchaseDate: "2026-09-05",
    batch: "LOT-2026-PH-09",
    qty: 3,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 5,
    rack: "Rack B, Shelf 1, Bin 14",
    vendorName: "Robu.in",
    vendorPhone: "+91 20 6731 4444",
    vendorAddress: "Pune, MH",
    operator: "Store Incharge",
    notes: "Requires pH 4.01 & 7.00 buffer calibration",
    status: "Low Stock",
    createdAt: "2026-09-05T14:15:00.000Z"
  },
  {
    id: "COMP-SPR-03",
    product: "Soil Sparsh",
    name: "Soil EC / Salinity & Temp Probe (RS485)",
    category: "Sensors & Probes",
    model: "EC-TEMP-MOD-01",
    hsn: "90278090",
    sku: "SPR-EC-03",
    link: "https://robu.in/product/soil-ec-sensor/",
    price: 3600.00,
    purchaseDate: "2026-09-08",
    batch: "LOT-2026-EC-09",
    qty: 15,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 5,
    rack: "Rack B, Shelf 2, Bin 03",
    vendorName: "Goutham Electronics",
    vendorPhone: "+91 80 2221 3456",
    vendorAddress: "SP Road, Bengaluru",
    operator: "Store Incharge",
    notes: "Range 0-20000 us/cm",
    status: "In Stock",
    createdAt: "2026-09-08T15:20:00.000Z"
  },
  {
    id: "COMP-SPR-04",
    product: "Soil Sparsh",
    name: "Handheld Ergonomic ABS Enclosure with Grip Handle",
    category: "Packaging & Enclosures",
    model: "ENC-SPARSH-HD2",
    hsn: "39269099",
    sku: "SPR-ENC-04",
    link: "https://arkashine.in/hardware/sparsh",
    price: 1800.00,
    purchaseDate: "2026-09-10",
    batch: "LOT-2026-ENC-09",
    qty: 18,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 4,
    rack: "Rack C, Shelf 2, Bin 08",
    vendorName: "Om Precision Polymers",
    vendorPhone: "+91 80 2839 1122",
    vendorAddress: "Peenya, Bengaluru",
    operator: "Assembly Tech",
    notes: "Rubberized grip with IP65 ingress protection",
    status: "In Stock",
    createdAt: "2026-09-10T16:00:00.000Z"
  },

  // --- 3. Soil Life Series Components ---
  {
    id: "COMP-LIF-01",
    product: "Soil Life",
    name: "Microbial Soil Respiration CO2 Flux NDIR Gas Sensor",
    category: "Sensors & Probes",
    model: "CO2-NDIR-5000PPM",
    hsn: "90278090",
    sku: "LIF-CO2-01",
    link: "https://robu.in/product/co2-sensor-ndir/",
    price: 8900.00,
    purchaseDate: "2026-09-01",
    batch: "LOT-2026-NDIR-09",
    qty: 8,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 3,
    rack: "Rack B, Shelf 3, Bin 01",
    vendorName: "SenseAir India",
    vendorPhone: "+91 80 4900 8800",
    vendorAddress: "Whitefield, Bengaluru",
    operator: "Dr. R&D Lead",
    notes: "Measures soil biological microbial respiration rate",
    status: "In Stock",
    createdAt: "2026-09-01T11:00:00.000Z"
  },
  {
    id: "COMP-LIF-02",
    product: "Soil Life",
    name: "Soil Organic Carbon (SOC) NIR Spectroscopy Sensor",
    category: "Sensors & Probes",
    model: "SOC-NIR-900-1700",
    hsn: "90273090",
    sku: "LIF-SOC-02",
    link: "https://arkashine.in/sensors/soc",
    price: 11200.00,
    purchaseDate: "2026-09-04",
    batch: "LOT-2026-SOC-09",
    qty: 5,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 3,
    rack: "Rack B, Shelf 3, Bin 04",
    vendorName: "Hamamatsu Photonics India",
    vendorPhone: "+91 22 2831 4400",
    vendorAddress: "Andheri East, Mumbai",
    operator: "Dr. R&D Lead",
    notes: "Active NIR reflectance sensor for real-time organic carbon estimation",
    status: "In Stock",
    createdAt: "2026-09-04T14:30:00.000Z"
  },
  {
    id: "COMP-LIF-03",
    product: "Soil Life",
    name: "Biological Incubation Micro-Cell 37°C Chamber",
    category: "Lab & Chemicals",
    model: "BIO-INC-V2",
    hsn: "84198990",
    sku: "LIF-BIO-03",
    link: "https://arkashine.in/hardware/life",
    price: 5600.00,
    purchaseDate: "2026-09-07",
    batch: "LOT-2026-INC-09",
    qty: 7,
    unit: "Kits",
    qtyPerMachine: 1,
    threshold: 2,
    rack: "Rack C, Shelf 3, Bin 02",
    vendorName: "ArkaShine Precision Optics Lab",
    vendorPhone: "+91 8482 255100",
    vendorAddress: "Bidar Agritech Hub, Bidar",
    operator: "Assembly Tech",
    notes: "Peltier-controlled thermal incubation cell for active soil microbes",
    status: "In Stock",
    createdAt: "2026-09-07T13:00:00.000Z"
  },

  // --- 4. Others Series Components ---
  {
    id: "COMP-OTH-01",
    product: "Others",
    name: "Portable Thermal Imaging Soil Temperature Camera",
    category: "Displays & Cameras",
    model: "TH-CAM-256-IR",
    hsn: "90275000",
    sku: "OTH-THM-01",
    link: "https://robu.in/product/thermal-camera-module/",
    price: 7800.00,
    purchaseDate: "2026-09-14",
    batch: "LOT-2026-THM-09",
    qty: 4,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 2,
    rack: "Rack D, Shelf 1, Bin 02",
    vendorName: "Flir India Distributor",
    vendorPhone: "+91 80 4100 2345",
    vendorAddress: "Bengaluru, KA",
    operator: "Store Incharge",
    notes: "Specialized thermography sensor for experimental field station",
    status: "In Stock",
    createdAt: "2026-09-14T11:00:00.000Z"
  },

  // --- 5. Common / Shared Components across Products ---
  {
    id: "COMP-COM-01",
    product: "Common",
    name: "Raspberry Pi 4 Model B (4GB RAM)",
    category: "Microcontrollers & SBCs",
    model: "RPI-4B-4GB",
    hsn: "84715000",
    sku: "COM-RPI4-01",
    link: "https://www.raspberrypi.com/products/raspberry-pi-4-model-b/",
    price: 5499.00,
    purchaseDate: "2026-08-15",
    batch: "LOT-2026-RPI-08",
    qty: 24,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 5,
    rack: "Rack A, Shelf 2, Bin 04",
    vendorName: "Robu.in / Macfos Ltd",
    vendorPhone: "+91 20 6731 4444",
    vendorAddress: "Bhosari Industrial Estate, Pune, MH",
    operator: "Store Incharge",
    notes: "QC Passed, used in SoilENZ, Sparsh & Life systems",
    status: "In Stock",
    createdAt: "2026-08-15T10:00:00.000Z"
  },
  {
    id: "COMP-COM-02",
    product: "Common",
    name: "7-Inch Capacitive IPS Touch Display HDMI",
    category: "Displays & Cameras",
    model: "WVS-70-IPS-1024",
    hsn: "85285200",
    sku: "COM-DSP-02",
    link: "https://www.waveshare.com/7inch-hdmi-lcd-c.htm",
    price: 3850.00,
    purchaseDate: "2026-08-20",
    batch: "LOT-2026-DSP-08",
    qty: 18,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 4,
    rack: "Rack A, Shelf 3, Bin 01",
    vendorName: "Waveshare Electronics",
    vendorPhone: "+91 80 4123 9988",
    vendorAddress: "SP Road, Bengaluru - 560002",
    operator: "Store Incharge",
    notes: "Includes ribbon cable and brass standoffs",
    status: "In Stock",
    createdAt: "2026-08-20T11:00:00.000Z"
  },
  {
    id: "COMP-COM-03",
    product: "Common",
    name: "12V 10000mAh LiFePO4 Battery Pack with BMS",
    category: "Power & Battery",
    model: "LFP-12V-10AH-BMS",
    hsn: "85076000",
    sku: "COM-BAT-03",
    link: "https://www.evlithium.com/12v-lifepo4-battery.html",
    price: 4950.00,
    purchaseDate: "2026-09-10",
    batch: "LOT-2026-BAT-09",
    qty: 8,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 4,
    rack: "Battery Fire-Safe Cabinet, Rack C",
    vendorName: "Ampere Energy Systems",
    vendorPhone: "+91 44 2855 1234",
    vendorAddress: "Ambattur Industrial Estate, Chennai",
    operator: "Store Incharge",
    notes: "Equipped with 20A BMS, safety tested",
    status: "In Stock",
    createdAt: "2026-09-10T11:45:00.000Z"
  },
  {
    id: "COMP-COM-04",
    product: "Common",
    name: "Heavy-Duty All-Weather Field Backpack Chassis",
    category: "Packaging & Enclosures",
    model: "BPK-MIL-SOIL-V2",
    hsn: "42029200",
    sku: "COM-BPK-04",
    link: "https://arkashine.in/hardware/enclosures",
    price: 3400.00,
    purchaseDate: "2026-08-30",
    batch: "LOT-2026-BPK-08",
    qty: 10,
    unit: "Pcs",
    qtyPerMachine: 1,
    threshold: 3,
    rack: "Bulk Storage Bay 2",
    vendorName: "Karnataka Canvas & Gear Works",
    vendorPhone: "+91 80 2344 5678",
    vendorAddress: "Peenya Industrial Area, Bengaluru",
    operator: "Assembly Tech",
    notes: "Shockproof EVA custom molded insert included",
    status: "In Stock",
    createdAt: "2026-08-30T10:10:00.000Z"
  }
];

const SEED_MACHINES = [
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
    status: "Completed (Ready to Dispatch)",
    registeredDate: "2026-09-15",
    allocatedComponents: [
      { compId: "COMP-SPR-01", compName: "Soil NPK 3-in-1 Sensor Probe", qty: 1 },
      { compId: "COMP-SPR-02", compName: "Soil pH Electrode & Transmitter", qty: 1 },
      { compId: "COMP-SPR-03", compName: "Soil EC / Salinity & Temp Probe", qty: 1 },
      { compId: "COMP-SPR-04", compName: "Handheld Ergonomic ABS Enclosure", qty: 1 }
    ]
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
    ]
  }
];

const SEED_DISPATCHES = [
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

const SEED_MOVEMENTS = [
  {
    id: "TX-1001",
    timestamp: "2026-08-15 10:15",
    type: "IN",
    compId: "COMP-COM-01",
    compName: "Raspberry Pi 4 Model B (4GB RAM)",
    qty: 25,
    balanceAfter: 25,
    reason: "Direct Supplier Purchase",
    machineRef: "N/A",
    operator: "Store Incharge",
    notes: "Supplier Invoice #ROBU-INV-2026-88"
  },
  {
    id: "TX-1002",
    timestamp: "2026-09-18 16:00",
    type: "OUT",
    compId: "COMP-ENZ-01",
    compName: "Multi-Wavelength Spectrophotometer Chamber",
    qty: 1,
    balanceAfter: 6,
    reason: "Machine Allocation",
    machineRef: "SE-2026-012",
    operator: "Assembly Tech",
    notes: "Installed into SoilENZ System SE-2026-012"
  },
  {
    id: "TX-1003",
    timestamp: "2026-09-20 11:30",
    type: "OUT",
    compId: "COMP-ENZ-02",
    compName: "Peristaltic Reagent Metering Pump 12V DC",
    qty: 2,
    balanceAfter: 0,
    reason: "Machine Allocation",
    machineRef: "SE-2026-012",
    operator: "Assembly Tech",
    notes: "Final stock exhausted - reorder pending"
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: "NOTIF-1",
    type: "danger",
    title: "Stock Depleted: Peristaltic Reagent Metering Pump (SoilENZ)",
    message: "Inventory reached 0 Pcs. Machine assembly for SoilENZ System is paused until restocked.",
    timestamp: "2026-09-20 11:30",
    read: false
  },
  {
    id: "NOTIF-2",
    type: "warning",
    title: "Low Stock Alert: Soil pH Electrode (Soil Sparsh)",
    message: "Remaining stock is 3 Pcs (Safety threshold is 5 Pcs).",
    timestamp: "2026-09-21 09:15",
    read: false
  },
  {
    id: "NOTIF-3",
    type: "success",
    title: "Machine Dispatched: SoilENZ SE-2026-012",
    message: "En route to UAS Bangalore via VRL Logistics (Waybill: VRL-BLR-892104).",
    timestamp: "2026-09-25 14:35",
    read: false
  }
];

// ==========================================================================
// AUDIO FEEDBACK SYSTEM (Web Audio API)
// ==========================================================================
class SoundFX {
  static init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.ctx = null;
    }
  }

  static playTone(freq, duration, type = 'sine', gainVal = 0.08) {
    if (!AppState.soundEnabled) return;
    try {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (err) {}
  }

  static playSuccess() {
    this.playTone(523.25, 0.1, 'triangle', 0.07);
    setTimeout(() => this.playTone(659.25, 0.15, 'triangle', 0.08), 80);
  }

  static playAlert() {
    this.playTone(440, 0.12, 'sawtooth', 0.07);
    setTimeout(() => this.playTone(330, 0.18, 'sawtooth', 0.07), 100);
  }

  static playClick() {
    this.playTone(800, 0.04, 'sine', 0.04);
  }
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let icon = 'check-circle';
  if (type === 'error') icon = 'circle-xmark';
  if (type === 'info') icon = 'circle-info';

  toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  if (type === 'success') SoundFX.playSuccess();
  if (type === 'error') SoundFX.playAlert();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// DATA PERSISTENCE & SYNC
// ==========================================================================
async function initDataPersistence() {
  const isHttp = window.location.protocol.startsWith('http');
  AppState.apiBase = isHttp ? '' : 'http://localhost:5000';

  let loadedFromServer = false;

  try {
    const res = await fetch(`${AppState.apiBase}/api/data`, { signal: AbortSignal.timeout(1800) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.components && data.components.length > 0) {
        AppState.components = data.components;
        AppState.machines = data.machines || [];
        AppState.movements = data.movements || [];
        AppState.dispatches = data.dispatches || [];
        AppState.notifications = data.notifications || [];
        loadedFromServer = true;
        AppState.backendConnected = true;
      }
    }
  } catch (e) {
    AppState.backendConnected = false;
  }

  if (!loadedFromServer) {
    const localComps = localStorage.getItem('soilenz_components_v3');
    if (localComps) {
      try {
        AppState.components = JSON.parse(localComps);
        AppState.machines = JSON.parse(localStorage.getItem('soilenz_machines_v3') || '[]');
        AppState.movements = JSON.parse(localStorage.getItem('soilenz_movements_v3') || '[]');
        AppState.dispatches = JSON.parse(localStorage.getItem('soilenz_dispatches_v3') || '[]');
        AppState.notifications = JSON.parse(localStorage.getItem('soilenz_notifications_v3') || '[]');
      } catch (err) {
        loadSeeds();
      }
    } else {
      loadSeeds();
    }
  }

  const serverTag = document.getElementById('server-mode-tag');
  if (serverTag) {
    if (AppState.backendConnected) {
      serverTag.innerHTML = '<span style="color:#16a34a;"><i class="fas fa-database"></i> SQLite Backend (Online)</span>';
    } else {
      serverTag.innerHTML = '<span style="color:#0284c7;"><i class="fas fa-floppy-disk"></i> Standalone Browser Mode (LocalStorage)</span>';
    }
  }

  saveAllDataLocal();
  recalculateStatuses();
  populateCategoryFilter();
  renderAllViews();
}

function loadSeeds() {
  AppState.components = JSON.parse(JSON.stringify(SEED_COMPONENTS));
  AppState.machines = JSON.parse(JSON.stringify(SEED_MACHINES));
  AppState.movements = JSON.parse(JSON.stringify(SEED_MOVEMENTS));
  AppState.dispatches = JSON.parse(JSON.stringify(SEED_DISPATCHES));
  AppState.notifications = JSON.parse(JSON.stringify(SEED_NOTIFICATIONS));
}

function saveAllDataLocal() {
  localStorage.setItem('soilenz_components_v3', JSON.stringify(AppState.components));
  localStorage.setItem('soilenz_machines_v3', JSON.stringify(AppState.machines));
  localStorage.setItem('soilenz_movements_v3', JSON.stringify(AppState.movements));
  localStorage.setItem('soilenz_dispatches_v3', JSON.stringify(AppState.dispatches));
  localStorage.setItem('soilenz_notifications_v3', JSON.stringify(AppState.notifications));
}

async function syncWithServer() {
  saveAllDataLocal();
  try {
    const res = await fetch(`${AppState.apiBase}/api/save-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        components: AppState.components,
        machines: AppState.machines,
        movements: AppState.movements,
        dispatches: AppState.dispatches,
        notifications: AppState.notifications
      })
    });
    if (res.ok) {
      AppState.backendConnected = true;
      const serverTag = document.getElementById('server-mode-tag');
      if (serverTag) {
        serverTag.innerHTML = '<span style="color:#16a34a;"><i class="fas fa-database"></i> SQLite Backend (Online)</span>';
      }
      return true;
    }
  } catch (e) {
    AppState.backendConnected = false;
  }
  return false;
}

async function saveAllDataSnapshot() {
  saveAllDataLocal();
  const serverOk = await syncWithServer();
  if (serverOk) {
    showToast('All database tables & inventory snapshot synced to SQLite backend successfully!');
  } else {
    showToast('Inventory snapshot saved to local browser database. (Backend server offline).', 'info');
  }
}

// ==========================================================================
// DYNAMIC EDITABLE CATEGORIES
// ==========================================================================
function populateCategoryFilter() {
  const filterSelect = document.getElementById('items-category-filter');
  if (!filterSelect) return;
  const currentVal = filterSelect.value || 'ALL';

  const catSet = new Set([
    "Fasteners & Hardware", "Sensors & Probes", "Microcontrollers & SBCs",
    "Electronics Modules", "Cables & Connectors", "Power & Battery",
    "Power Supply & Adapters", "Motors & Actuators", "Displays & Cameras",
    "Lab & Chemicals", "Packaging & Enclosures", "Printing", "Communication",
    "3D Printing", "Storage", "Switches & Controls", "Office & Misc", "Components"
  ]);

  AppState.components.forEach(c => {
    if (c.category && c.category.trim()) catSet.add(c.category.trim());
  });

  const sorted = Array.from(catSet).sort();
  filterSelect.innerHTML = `<option value="ALL">All Categories</option>` +
    sorted.map(cat => `<option value="${escapeHTML(cat)}" ${cat === currentVal ? 'selected' : ''}>${escapeHTML(cat)}</option>`).join('');

  // Also update category-datalist for suggestions
  const datalist = document.getElementById('category-datalist');
  if (datalist) {
    datalist.innerHTML = sorted.map(cat => `<option value="${escapeHTML(cat)}">`).join('');
  }
}

// ==========================================================================
// PRODUCT LINE SELECTOR & FILTERING
// ==========================================================================
function selectProductFilter(productName) {
  AppState.selectedProduct = productName;

  // Update button active state
  document.querySelectorAll('.product-card-btn').forEach(btn => {
    btn.classList.remove('active', 'soilsparsh', 'soillife', 'others');
  });

  if (productName === 'ALL') document.getElementById('prod-btn-all')?.classList.add('active');
  if (productName === 'SoilENZ') document.getElementById('prod-btn-soilenz')?.classList.add('active');
  if (productName === 'Soil Sparsh') document.getElementById('prod-btn-soilsparsh')?.classList.add('active', 'soilsparsh');
  if (productName === 'Soil Life') document.getElementById('prod-btn-soillife')?.classList.add('active', 'soillife');
  if (productName === 'Common') document.getElementById('prod-btn-common')?.classList.add('active');
  if (productName === 'Others') document.getElementById('prod-btn-others')?.classList.add('active', 'others');

  SoundFX.playClick();
  renderInventory();
}

function updateProductCounts() {
  const counts = {
    ALL: AppState.components.length,
    SoilENZ: AppState.components.filter(c => (c.product || 'SoilENZ') === 'SoilENZ').length,
    'Soil Sparsh': AppState.components.filter(c => c.product === 'Soil Sparsh').length,
    'Soil Life': AppState.components.filter(c => c.product === 'Soil Life').length,
    Common: AppState.components.filter(c => c.product === 'Common').length,
    Others: AppState.components.filter(c => c.product === 'Others').length
  };

  const elAll = document.getElementById('count-prod-all');
  const elEnz = document.getElementById('count-prod-soilenz');
  const elSpr = document.getElementById('count-prod-soilsparsh');
  const elLif = document.getElementById('count-prod-soillife');
  const elCom = document.getElementById('count-prod-common');
  const elOth = document.getElementById('count-prod-others');

  if (elAll) elAll.textContent = counts.ALL;
  if (elEnz) elEnz.textContent = counts.SoilENZ;
  if (elSpr) elSpr.textContent = counts['Soil Sparsh'];
  if (elLif) elLif.textContent = counts['Soil Life'];
  if (elCom) elCom.textContent = counts.Common;
  if (elOth) elOth.textContent = counts.Others;
}

function getProductBadge(product) {
  const p = product || 'SoilENZ';
  if (p === 'SoilENZ') return `<span class="badge badge-soilenz"><i class="fas fa-seedling"></i> SoilENZ</span>`;
  if (p === 'Soil Sparsh') return `<span class="badge badge-soilsparsh"><i class="fas fa-bolt"></i> Soil Sparsh</span>`;
  if (p === 'Soil Life') return `<span class="badge badge-soillife"><i class="fas fa-dna"></i> Soil Life</span>`;
  if (p === 'Others') return `<span class="badge badge-others"><i class="fas fa-tag"></i> Others</span>`;
  return `<span class="badge badge-common"><i class="fas fa-shapes"></i> Common</span>`;
}

// Modal radio card change
function onProductRadioChange(productName) {
  document.getElementById('entry-item-product').value = productName;
  document.querySelectorAll('.product-radio-card').forEach(card => card.classList.remove('selected'));

  if (productName === 'SoilENZ') document.getElementById('radio-card-soilenz')?.classList.add('selected');
  if (productName === 'Soil Sparsh') document.getElementById('radio-card-soilsparsh')?.classList.add('selected');
  if (productName === 'Soil Life') document.getElementById('radio-card-soillife')?.classList.add('selected');
  if (productName === 'Common') document.getElementById('radio-card-common')?.classList.add('selected');
  if (productName === 'Others') document.getElementById('radio-card-others')?.classList.add('selected');
}

// Machine product select change
function onMachineProductSelected() {
  const prod = document.getElementById('reg-machine-product')?.value || 'SoilENZ';
  const modelInput = document.getElementById('reg-machine-model');
  const datalist = document.getElementById('machine-model-datalist');
  if (!datalist) return;

  if (prod === 'SoilENZ') {
    datalist.innerHTML = `
      <option value="SoilENZ AI Automated Lab System V2">
      <option value="SoilENZ Micro-Spectrophotometer Unit">
      <option value="SoilENZ Lab-in-Backpack Testing Station">
    `;
    if (modelInput && !modelInput.value) modelInput.value = "SoilENZ AI Automated Lab System V2";
  } else if (prod === 'Soil Sparsh') {
    datalist.innerHTML = `
      <option value="Soil Sparsh Rapid Multi-Sensor Analyzer">
      <option value="Soil Sparsh Handheld Field Diagnostic">
      <option value="Soil Sparsh Compact NPK/pH/EC Kit">
    `;
    if (modelInput && !modelInput.value) modelInput.value = "Soil Sparsh Rapid Multi-Sensor Analyzer";
  } else if (prod === 'Soil Life') {
    datalist.innerHTML = `
      <option value="Soil Life Bio-Activity & Microbial Station">
      <option value="Soil Life Soil Respiration Analyzer">
      <option value="Soil Life Organic Carbon Optical Station">
    `;
    if (modelInput && !modelInput.value) modelInput.value = "Soil Life Bio-Activity & Microbial Station";
  } else {
    datalist.innerHTML = `
      <option value="Custom Agritech Field Unit V1">
      <option value="Experimental Sensor Telemetry Station">
    `;
  }
}

// ==========================================================================
// CALCULATE STATUSES & KPIs
// ==========================================================================
function recalculateStatuses() {
  AppState.components.forEach(item => {
    const qty = Number(item.qty) || 0;
    const thresh = Number(item.threshold) || 0;
    if (qty <= 0) {
      item.status = 'Out of Stock';
    } else if (qty <= thresh) {
      item.status = 'Low Stock';
    } else {
      item.status = 'In Stock';
    }
  });
}

function updateKPIs() {
  const totalItems = AppState.components.length;
  const totalQty = AppState.components.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const activeMachines = AppState.machines.filter(m => m.status !== 'Dispatched').length;
  const dispatched = AppState.dispatches.length;
  const alertsCount = AppState.components.filter(c => c.status === 'Out of Stock' || c.status === 'Low Stock').length;

  const elTotalItems = document.getElementById('kpi-total-items');
  const elTotalQty = document.getElementById('kpi-total-qty');
  const elActiveMachines = document.getElementById('kpi-active-machines');
  const elDispatched = document.getElementById('kpi-dispatched');
  const elAlerts = document.getElementById('kpi-alerts');
  const headerNotif = document.getElementById('header-notif-count');
  const tabAlertBadge = document.getElementById('tab-alert-badge');

  if (elTotalItems) elTotalItems.textContent = totalItems;
  if (elTotalQty) elTotalQty.textContent = totalQty.toLocaleString();
  if (elActiveMachines) elActiveMachines.textContent = activeMachines;
  if (elDispatched) elDispatched.textContent = dispatched;
  if (elAlerts) elAlerts.textContent = alertsCount;

  const unreadNotifs = AppState.notifications.filter(n => !n.read).length;
  if (headerNotif) {
    headerNotif.textContent = unreadNotifs;
    headerNotif.style.display = unreadNotifs > 0 ? 'inline-flex' : 'none';
  }
  if (tabAlertBadge) {
    tabAlertBadge.textContent = unreadNotifs;
    tabAlertBadge.style.display = unreadNotifs > 0 ? 'inline-block' : 'none';
  }

  updateProductCounts();
}

// ==========================================================================
// RENDER COMPONENT INVENTORY (TABLE & CARDS)
// ==========================================================================
function renderInventory() {
  const tbody = document.getElementById('items-tbody');
  const cardsContainer = document.getElementById('comp-cards-container');
  const countBar = document.getElementById('items-count-bar');
  if (!tbody || !cardsContainer) return;

  const searchTerm = (document.getElementById('items-search')?.value || '').toLowerCase().trim();
  const categoryFilter = document.getElementById('items-category-filter')?.value || 'ALL';
  const statusFilter = document.getElementById('items-status-filter')?.value || 'ALL';

  const filtered = AppState.components.filter(item => {
    const itemProd = item.product || 'SoilENZ';
    const matchesProduct = (AppState.selectedProduct === 'ALL') || (itemProd === AppState.selectedProduct);

    const matchesSearch = !searchTerm ||
      (item.name && item.name.toLowerCase().includes(searchTerm)) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm)) ||
      (item.model && item.model.toLowerCase().includes(searchTerm)) ||
      (item.vendorName && item.vendorName.toLowerCase().includes(searchTerm)) ||
      (item.rack && item.rack.toLowerCase().includes(searchTerm)) ||
      (item.category && item.category.toLowerCase().includes(searchTerm)) ||
      (item.product && item.product.toLowerCase().includes(searchTerm));

    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesProduct && matchesSearch && matchesCat && matchesStatus;
  });

  if (countBar) {
    const prodLabel = AppState.selectedProduct === 'ALL' ? 'All Products' : AppState.selectedProduct;
    countBar.textContent = `Showing ${filtered.length} components (${prodLabel}) | Total SKUs: ${AppState.components.length}`;
  }

  // 1. Table View
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="15" style="text-align:center;padding:36px;color:#94a3b8;">
      <i class="fas fa-box-open" style="font-size:2.2rem;margin-bottom:8px;display:block;color:#cbd5e1;"></i>
      No matching components found for <strong>${escapeHTML(AppState.selectedProduct === 'ALL' ? 'selected filters' : AppState.selectedProduct)}</strong>.
    </td></tr>`;
  } else {
    tbody.innerHTML = filtered.map((item, index) => {
      let badgeClass = 'badge-in-stock';
      if (item.status === 'Low Stock') badgeClass = 'badge-low-stock';
      if (item.status === 'Out of Stock') badgeClass = 'badge-out-of-stock';

      const priceFmt = item.price ? `₹${Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';
      const linkBtn = item.link ? `<a href="${item.link}" target="_blank" rel="noreferrer" class="table-btn" title="Open Purchase Link"><i class="fas fa-external-link-alt"></i></a>` : '—';
      const prodBadge = getProductBadge(item.product);

      return `
        <tr>
          <td><strong>${index + 1}</strong></td>
          <td>${prodBadge}</td>
          <td>
            <div style="font-weight:700;color:#0f172a;">${escapeHTML(item.name)}</div>
            <div style="font-size:0.72rem;color:#64748b;">SKU: ${escapeHTML(item.sku || '—')}</div>
          </td>
          <td>${escapeHTML(item.model || '—')}</td>
          <td><code>${escapeHTML(item.hsn || '—')}</code></td>
          <td><span class="badge badge-category">${escapeHTML(item.category || 'General')}</span></td>
          <td style="font-weight:700;color:#15803d;">${priceFmt}</td>
          <td>
            <strong style="font-size:0.95rem;">${item.qty}</strong> <span style="font-size:0.75rem;color:#64748b;">${escapeHTML(item.unit || 'Pcs')}</span>
            <div style="font-size:0.68rem;color:#94a3b8;">Min: ${item.threshold || 0}</div>
          </td>
          <td style="text-align:center;">${item.qtyPerMachine || 1}</td>
          <td><span class="badge ${badgeClass}"><i class="fas fa-circle" style="font-size:0.45rem;"></i> ${item.status}</span></td>
          <td>${escapeHTML(item.vendorName || '—')}</td>
          <td style="text-align:center;">${linkBtn}</td>
          <td>${escapeHTML(item.purchaseDate || '—')}</td>
          <td><span style="font-size:0.75rem;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${escapeHTML(item.rack || '—')}</span></td>
          <td>
            <div class="table-actions">
              <button class="table-btn" onclick="viewComponentDetail('${item.id}')" title="View Details"><i class="fas fa-eye"></i></button>
              <button class="table-btn" onclick="editComponent('${item.id}')" title="Edit Component"><i class="fas fa-pencil"></i></button>
              <button class="table-btn table-btn-in" onclick="quickStockIn('${item.id}')" title="Stock In"><i class="fas fa-plus"></i></button>
              <button class="table-btn table-btn-out" onclick="quickStockOut('${item.id}')" title="Stock Out"><i class="fas fa-minus"></i></button>
              <button class="table-btn table-btn-del" onclick="deleteComponent('${item.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Card View
  if (filtered.length === 0) {
    cardsContainer.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:36px;color:#94a3b8;">No matching components found.</div>`;
  } else {
    cardsContainer.innerHTML = filtered.map(item => {
      let badgeClass = 'badge-in-stock';
      if (item.status === 'Low Stock') badgeClass = 'badge-low-stock';
      if (item.status === 'Out of Stock') badgeClass = 'badge-out-of-stock';

      const priceFmt = item.price ? `₹${Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';
      const prodBadge = getProductBadge(item.product);

      return `
        <div class="comp-card">
          <div>
            <div class="comp-card-top">
              <div style="display:flex;gap:6px;align-items:center;">
                ${prodBadge}
                <span class="badge badge-category">${escapeHTML(item.category)}</span>
              </div>
              <span class="badge ${badgeClass}">${item.status}</span>
            </div>
            <div class="comp-card-name">${escapeHTML(item.name)}</div>
            <div class="comp-card-meta">
              <span><strong>SKU:</strong> ${escapeHTML(item.sku || '—')} | <strong>Model:</strong> ${escapeHTML(item.model || '—')}</span>
              <span><strong>Vendor:</strong> ${escapeHTML(item.vendorName || '—')}</span>
              <span><strong>Rack:</strong> ${escapeHTML(item.rack || '—')}</span>
            </div>
          </div>
          <div>
            <div class="comp-card-stock-row">
              <div>
                <span style="font-size:0.75rem;color:#64748b;">Current Stock:</span>
                <div class="comp-card-stock-val">${item.qty} <span style="font-size:0.8rem;font-weight:500;">${escapeHTML(item.unit || 'Pcs')}</span></div>
              </div>
              <div style="text-align:right;">
                <span style="font-size:0.75rem;color:#64748b;">Unit Price:</span>
                <div class="comp-card-price">${priceFmt}</div>
              </div>
            </div>
            <div class="comp-card-actions">
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="viewComponentDetail('${item.id}')"><i class="fas fa-eye"></i> Details</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="editComponent('${item.id}')"><i class="fas fa-pencil"></i> Edit</button>
              <button class="btn btn-primary btn-sm" onclick="quickStockIn('${item.id}')" title="Quick Stock IN"><i class="fas fa-plus"></i></button>
              <button class="btn btn-danger btn-sm" onclick="quickStockOut('${item.id}')" title="Stock OUT"><i class="fas fa-arrow-up"></i></button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function setView(mode) {
  AppState.currentView = mode;
  const tableView = document.getElementById('inventory-table-view');
  const cardView = document.getElementById('inventory-card-view');
  const btnTable = document.getElementById('view-table-btn');
  const btnCard = document.getElementById('view-card-btn');

  if (mode === 'table') {
    if (tableView) tableView.style.display = 'block';
    if (cardView) cardView.style.display = 'none';
    btnTable?.classList.add('active');
    btnCard?.classList.remove('active');
  } else {
    if (tableView) tableView.style.display = 'none';
    if (cardView) cardView.style.display = 'block';
    btnTable?.classList.remove('active');
    btnCard?.classList.add('active');
  }
  SoundFX.playClick();
}

// ==========================================================================
// RENDER MACHINES & ASSEMBLY HUB (WITH EDIT FUNCTIONALITY)
// ==========================================================================
function renderMachines() {
  const container = document.getElementById('machines-grid');
  if (!container) return;

  if (AppState.machines.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:32px;color:#94a3b8;">No machines registered yet. Click "Register Machine" to create one.</div>`;
    return;
  }

  container.innerHTML = AppState.machines.map(m => {
    let statusBadge = `<span class="badge badge-category">${escapeHTML(m.status)}</span>`;
    if (m.status === 'Dispatched') statusBadge = `<span class="badge badge-success"><i class="fas fa-truck"></i> Dispatched</span>`;
    else if (m.status === 'Assembled') statusBadge = `<span class="badge badge-blue"><i class="fas fa-check"></i> Assembled</span>`;
    else if (m.status === 'In Assembly') statusBadge = `<span class="badge badge-warning"><i class="fas fa-screwdriver-wrench"></i> In Assembly</span>`;
    else if (m.status === 'Completed (Ready to Dispatch)') statusBadge = `<span class="badge badge-ready"><i class="fas fa-box-check"></i> Ready to Dispatch</span>`;
    else if (m.status === 'Under Testing / Calibration') statusBadge = `<span class="badge badge-info"><i class="fas fa-flask"></i> Testing</span>`;

    const prodBadge = getProductBadge(m.product);

    const partsList = (m.allocatedComponents && m.allocatedComponents.length > 0)
      ? m.allocatedComponents.map(p => `<li><span>${escapeHTML(p.compName)}</span><strong>${p.qty} Pcs</strong></li>`).join('')
      : `<li style="color:#94a3b8;font-style:italic;">No components allocated yet.</li>`;

    const canDispatch = m.status !== 'Dispatched';

    return `
      <div class="machine-card">
        <div class="machine-card-header">
          <div>
            <div style="margin-bottom:4px;">${prodBadge}</div>
            <div class="machine-serial"><i class="fas fa-microchip" style="color:#2563eb;"></i> ${escapeHTML(m.serialNumber)}</div>
            <div class="machine-model-badge">${escapeHTML(m.model)}</div>
          </div>
          <div>${statusBadge}</div>
        </div>

        <div class="machine-allocations-box">
          <div class="machine-allocations-title">
            <span>BOM / Allocated Parts</span>
            <span>${m.allocatedComponents?.length || 0} Parts</span>
          </div>
          <ul class="machine-parts-list">
            ${partsList}
          </ul>
        </div>

        <div style="font-size:0.76rem;color:#64748b;margin-bottom:12px;">
          Registered Date: <strong>${m.registeredDate || 'N/A'}</strong>
        </div>

        <div style="display:flex;gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="editMachine('${m.serialNumber}')" title="Edit Machine Details & Status">
            <i class="fas fa-pencil"></i> Edit
          </button>
          ${canDispatch ? `
            <button class="btn btn-primary btn-sm" style="flex:1;" onclick="dispatchSpecificMachine('${m.serialNumber}')">
              <i class="fas fa-paper-plane"></i> Dispatch Unit
            </button>
          ` : `
            <button class="btn btn-outline btn-sm" style="flex:1;" onclick="viewDispatchChallanForMachine('${m.serialNumber}')">
              <i class="fas fa-file-invoice"></i> View Gate Pass
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// Edit registered machine
function editMachine(serialNumber) {
  const machine = AppState.machines.find(m => m.serialNumber === serialNumber);
  if (!machine) return;

  document.getElementById('edit-machine-orig-serial').value = machine.serialNumber;
  document.getElementById('edit-machine-serial').value = machine.serialNumber;
  document.getElementById('edit-machine-product').value = machine.product || 'SoilENZ';
  document.getElementById('edit-machine-model').value = machine.model || '';
  document.getElementById('edit-machine-status').value = machine.status || 'In Assembly';
  document.getElementById('edit-machine-date').value = machine.registeredDate || new Date().toISOString().split('T')[0];

  document.getElementById('modal-edit-machine-title').textContent = `Edit Machine: ${machine.serialNumber}`;

  openModal('modal-edit-machine');
}

function submitEditMachine(e) {
  e.preventDefault();
  const origSerial = document.getElementById('edit-machine-orig-serial').value;
  const newSerial = document.getElementById('edit-machine-serial').value.trim();
  const product = document.getElementById('edit-machine-product').value;
  const model = document.getElementById('edit-machine-model').value.trim();
  const status = document.getElementById('edit-machine-status').value;
  const regDate = document.getElementById('edit-machine-date').value;

  if (!newSerial) {
    alert("Machine serial number cannot be empty.");
    return;
  }

  if (newSerial.toLowerCase() !== origSerial.toLowerCase()) {
    if (AppState.machines.some(m => m.serialNumber.toLowerCase() === newSerial.toLowerCase())) {
      alert(`Another machine already exists with serial "${newSerial}".`);
      return;
    }
  }

  const machine = AppState.machines.find(m => m.serialNumber === origSerial);
  if (!machine) return;

  machine.serialNumber = newSerial;
  machine.product = product;
  machine.model = model;
  machine.status = status;
  if (regDate) machine.registeredDate = regDate;

  // Update references in dispatches if any
  AppState.dispatches.forEach(d => {
    if (d.machineSerial === origSerial) {
      d.machineSerial = newSerial;
      d.product = product;
      d.machineModel = model;
    }
  });

  // Update references in movements if any
  AppState.movements.forEach(mv => {
    if (mv.machineRef === origSerial) {
      mv.machineRef = newSerial;
    }
  });

  closeModal('modal-edit-machine');
  saveAllDataLocal();
  syncWithServer();
  renderAllViews();
  showToast(`Machine "${newSerial}" [${product}] updated successfully!`);
}

// ==========================================================================
// RENDER TRACEABILITY LEDGER
// ==========================================================================
function renderMovements() {
  const tbody = document.getElementById('movements-tbody');
  if (!tbody) return;

  if (AppState.movements.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:#94a3b8;">No stock transactions logged yet.</td></tr>`;
    return;
  }

  const sorted = [...AppState.movements].reverse();

  tbody.innerHTML = sorted.map(m => {
    let typeBadge = `<span class="badge badge-success"><i class="fas fa-arrow-down"></i> IN</span>`;
    if (m.type === 'OUT') typeBadge = `<span class="badge badge-danger"><i class="fas fa-arrow-up"></i> OUT</span>`;
    if (m.type === 'ALLOCATED') typeBadge = `<span class="badge badge-blue"><i class="fas fa-microchip"></i> ALLOC</span>`;

    return `
      <tr>
        <td><code>${escapeHTML(m.id)}</code></td>
        <td style="white-space:nowrap;font-size:0.78rem;">${escapeHTML(m.timestamp)}</td>
        <td>${typeBadge}</td>
        <td><strong>${escapeHTML(m.compName)}</strong></td>
        <td style="font-weight:700;">${m.qty}</td>
        <td style="color:#0f172a;font-weight:600;">${m.balanceAfter}</td>
        <td><span class="badge badge-category">${escapeHTML(m.reason || 'General')}</span> ${m.machineRef && m.machineRef !== 'N/A' ? `<span class="badge badge-blue">${escapeHTML(m.machineRef)}</span>` : ''}</td>
        <td>${escapeHTML(m.operator || 'Store Incharge')}</td>
        <td style="font-size:0.76rem;color:#64748b;">${escapeHTML(m.notes || '—')}</td>
      </tr>
    `;
  }).join('');
}

// ==========================================================================
// RENDER DISPATCH PATHS
// ==========================================================================
function renderDispatches() {
  const container = document.getElementById('dispatch-archive-container');
  if (!container) return;

  if (AppState.dispatches.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:36px;color:#94a3b8;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;">
      <i class="fas fa-truck-ramp-box" style="font-size:2.5rem;margin-bottom:10px;display:block;color:#cbd5e1;"></i>
      No dispatched machine records found yet.
    </div>`;
    return;
  }

  container.innerHTML = AppState.dispatches.map(d => {
    const routeParts = (d.pathRoute || '').split('→').map(p => p.trim());
    const visualRoute = routeParts.map((point, idx) => `
      <span>${escapeHTML(point)}</span>
      ${idx < routeParts.length - 1 ? '<i class="fas fa-arrow-right route-arrow"></i>' : ''}
    `).join(' ');

    return `
      <div class="dispatch-card">
        <div class="dispatch-card-header">
          <div>
            <div style="font-size:1.15rem;font-weight:800;color:#0f172a;">
              <i class="fas fa-truck-moving" style="color:#15803d;margin-right:6px;"></i> Machine ${escapeHTML(d.machineSerial)}
            </div>
            <div style="font-size:0.8rem;color:#64748b;margin-top:2px;">
              Model: <strong>${escapeHTML(d.machineModel)}</strong> | Dispatched: <strong>${escapeHTML(d.dispatchDate)}</strong>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="showChallanModal('${d.id}')">
            <i class="fas fa-file-invoice" style="color:#15803d;"></i> View &amp; Print Gate Pass / Challan
          </button>
        </div>

        <div class="dispatch-route-flow">
          <i class="fas fa-route" style="color:#15803d;"></i>
          <strong>Saved Journey Path:</strong>
          ${visualRoute}
        </div>

        <div class="dispatch-info-grid">
          <div class="dispatch-info-item">
            <strong>Consignee / Destination</strong>
            <span>${escapeHTML(d.destinationName)}</span>
            <div style="font-size:0.75rem;color:#94a3b8;">${escapeHTML(d.destinationAddress)}</div>
          </div>
          <div class="dispatch-info-item">
            <strong>Courier / Transporter</strong>
            <span>${escapeHTML(d.transporter || 'Direct Delivery')}</span>
            <div style="font-size:0.75rem;color:#94a3b8;">Waybill: ${escapeHTML(d.trackingWaybill || 'N/A')}</div>
          </div>
          <div class="dispatch-info-item">
            <strong>Contact &amp; Supervisor</strong>
            <span>${escapeHTML(d.consigneeContact || '—')}</span>
            <div style="font-size:0.75rem;color:#94a3b8;">By: ${escapeHTML(d.operator)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// RENDER ALERTS & NOTIFICATIONS
// ==========================================================================
function renderNotifications() {
  const feed = document.getElementById('notifications-feed');
  const modalList = document.getElementById('modal-notifications-list');

  const content = AppState.notifications.map(n => {
    let icon = 'fas fa-bell';
    let iconBg = '#eff6ff';
    let iconColor = '#2563eb';

    if (n.type === 'danger') {
      icon = 'fas fa-triangle-exclamation';
      iconBg = '#fee2e2';
      iconColor = '#dc2626';
    } else if (n.type === 'warning') {
      icon = 'fas fa-circle-exclamation';
      iconBg = '#fef3c7';
      iconColor = '#d97706';
    } else if (n.type === 'success') {
      icon = 'fas fa-check';
      iconBg = '#dcfce7';
      iconColor = '#15803d';
    }

    return `
      <div class="notif-item ${!n.read ? 'unread' : ''}">
        <div class="notif-icon" style="background:${iconBg};color:${iconColor};">
          <i class="${icon}"></i>
        </div>
        <div style="flex:1;">
          <div class="notif-title">${escapeHTML(n.title)}</div>
          <div class="notif-desc">${escapeHTML(n.message)}</div>
          <div class="notif-time"><i class="fas fa-clock"></i> ${escapeHTML(n.timestamp)}</div>
        </div>
      </div>
    `;
  }).join('');

  if (feed) feed.innerHTML = content || `<div style="text-align:center;padding:32px;color:#94a3b8;">No alerts registered.</div>`;
  if (modalList) modalList.innerHTML = content || `<div style="text-align:center;padding:32px;color:#94a3b8;">No alerts registered.</div>`;
}

function markAllNotificationsRead() {
  AppState.notifications.forEach(n => n.read = true);
  saveAllDataLocal();
  updateKPIs();
  renderNotifications();
  showToast('All notifications marked as read.');
}

function addNotification(type, title, message) {
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  AppState.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    type,
    title,
    message,
    timestamp: timeStr,
    read: false
  });
  if (type === 'danger' || type === 'warning') SoundFX.playAlert();
}

function renderAllViews() {
  updateKPIs();
  populateCategoryFilter();
  renderInventory();
  renderMachines();
  renderMovements();
  renderDispatches();
  renderNotifications();
}

// ==========================================================================
// MODAL MANAGEMENT
// ==========================================================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('active');

  if (id === 'modal-item-exit') {
    populateExitModalSelects();
  } else if (id === 'modal-dispatch-machine') {
    populateDispatchMachineSelect();
  } else if (id === 'modal-register-machine') {
    onMachineProductSelected();
  } else if (id === 'modal-item-entry' && !document.getElementById('entry-edit-id')?.value) {
    document.getElementById('modal-entry-title').textContent = 'Add New Component / Stock Entry';
    document.getElementById('entry-submit-label').textContent = 'Save Component & Stock';
    document.getElementById('form-item-entry')?.reset();
    document.getElementById('entry-item-category').value = 'Sensors & Probes';
    document.getElementById('entry-item-operator').value = 'Store Incharge';
    document.getElementById('entry-item-threshold').value = '5';
    document.getElementById('entry-item-unit').value = 'Pcs';
    document.getElementById('entry-item-qty').value = '0';

    const defaultProd = (AppState.selectedProduct !== 'ALL') ? AppState.selectedProduct : 'SoilENZ';
    onProductRadioChange(defaultProd);
    const radioToSelect = document.querySelector(`input[name="entry-product-radio"][value="${defaultProd}"]`);
    if (radioToSelect) radioToSelect.checked = true;
  }
  SoundFX.playClick();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('active');
  if (id === 'modal-item-entry') {
    document.getElementById('entry-edit-id').value = '';
  }
}

document.addEventListener('click', e => {
  if (e.target.matches('[data-close-modal]') || e.target.closest('[data-close-modal]')) {
    const modal = e.target.closest('.modal-overlay');
    if (modal) modal.classList.remove('active');
  } else if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

const soundBtn = document.getElementById('btn-sound-toggle');
if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    AppState.soundEnabled = !AppState.soundEnabled;
    soundBtn.innerHTML = AppState.soundEnabled ? '<i class="fas fa-volume-up"></i> Sound: ON' : '<i class="fas fa-volume-xmark"></i> Sound: OFF';
    showToast(`Sound feedback turned ${AppState.soundEnabled ? 'ON' : 'OFF'}.`, 'info');
  });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTabId = btn.getAttribute('data-tab');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const targetContent = document.getElementById(targetTabId);
    if (targetContent) targetContent.classList.add('active');
    SoundFX.playClick();
  });
});

document.getElementById('items-search')?.addEventListener('input', () => renderInventory());
document.getElementById('items-category-filter')?.addEventListener('change', () => renderInventory());
document.getElementById('items-status-filter')?.addEventListener('change', () => renderInventory());

// ==========================================================================
// COMPONENT CRUD (ADD / EDIT / DELETE / DETAIL)
// ==========================================================================
function submitItemEntry(e) {
  e.preventDefault();
  const editId = document.getElementById('entry-edit-id')?.value;
  const product = document.getElementById('entry-item-product').value || 'SoilENZ';
  const name = document.getElementById('entry-item-name').value.trim();
  const category = document.getElementById('entry-item-category').value.trim() || 'Components';
  const model = document.getElementById('entry-item-model').value.trim();
  const hsn = document.getElementById('entry-item-hsn').value.trim();
  const sku = document.getElementById('entry-item-sku').value.trim() || `SKU-${Date.now().toString().slice(-4)}`;
  const link = document.getElementById('entry-item-link').value.trim();
  const price = parseFloat(document.getElementById('entry-item-price').value) || 0;
  const purchaseDate = document.getElementById('entry-item-purchase-date').value;
  const batch = document.getElementById('entry-item-batch').value.trim();
  const qty = parseInt(document.getElementById('entry-item-qty').value, 10) || 0;
  const unit = document.getElementById('entry-item-unit').value.trim() || 'Pcs';
  const qtyPerMachine = parseInt(document.getElementById('entry-item-qty-per-machine').value, 10) || 1;
  const threshold = parseInt(document.getElementById('entry-item-threshold').value, 10) || 5;
  const rack = document.getElementById('entry-item-rack').value.trim();
  const vendorName = document.getElementById('entry-vendor-name').value.trim();
  const vendorPhone = document.getElementById('entry-vendor-phone').value.trim();
  const vendorAddress = document.getElementById('entry-vendor-address').value.trim();
  const operator = document.getElementById('entry-item-operator').value.trim() || 'Store Incharge';
  const notes = document.getElementById('entry-item-notes').value.trim();

  let item;
  if (editId) {
    item = AppState.components.find(c => c.id === editId);
    if (!item) return;
    const oldQty = item.qty;
    item.product = product;
    item.name = name;
    item.category = category;
    item.model = model;
    item.hsn = hsn;
    item.sku = sku;
    item.link = link;
    item.price = price;
    item.purchaseDate = purchaseDate;
    item.batch = batch;
    item.qty = qty;
    item.unit = unit;
    item.qtyPerMachine = qtyPerMachine;
    item.threshold = threshold;
    item.rack = rack;
    item.vendorName = vendorName;
    item.vendorPhone = vendorPhone;
    item.vendorAddress = vendorAddress;
    item.notes = notes;
    item.updatedAt = new Date().toISOString();

    if (qty !== oldQty) {
      const diff = qty - oldQty;
      logMovement(diff > 0 ? 'IN' : 'OUT', item.id, item.name, Math.abs(diff), qty, 'Manual Adjustment', 'N/A', operator, notes);
    }
    showToast(`Updated component "${name}" [${product}] under category "${category}".`);
  } else {
    const newId = `COMP-${Date.now().toString().slice(-4)}`;
    item = {
      id: newId,
      product,
      name,
      category,
      model,
      hsn,
      sku,
      link,
      price,
      purchaseDate,
      batch,
      qty,
      unit,
      qtyPerMachine,
      threshold,
      rack,
      vendorName,
      vendorPhone,
      vendorAddress,
      operator,
      notes,
      createdAt: new Date().toISOString()
    };
    AppState.components.unshift(item);

    if (qty > 0) {
      logMovement('IN', item.id, item.name, qty, qty, 'Initial Stock Receipt', 'N/A', operator, notes);
    }
    showToast(`Added part "${name}" under ${product}!`);
  }

  closeModal('modal-item-entry');
  recalculateStatuses();
  populateCategoryFilter();
  saveAllDataLocal();
  syncWithServer();
  renderAllViews();
}

function editComponent(id) {
  const item = AppState.components.find(c => c.id === id);
  if (!item) return;

  document.getElementById('entry-edit-id').value = item.id;
  document.getElementById('modal-entry-title').textContent = `Edit Component: ${item.name}`;
  document.getElementById('entry-submit-label').textContent = 'Update Component Details';

  const prod = item.product || 'SoilENZ';
  onProductRadioChange(prod);
  const radio = document.querySelector(`input[name="entry-product-radio"][value="${prod}"]`);
  if (radio) radio.checked = true;

  document.getElementById('entry-item-name').value = item.name || '';
  document.getElementById('entry-item-category').value = item.category || 'Components';
  document.getElementById('entry-item-model').value = item.model || '';
  document.getElementById('entry-item-hsn').value = item.hsn || '';
  document.getElementById('entry-item-sku').value = item.sku || '';
  document.getElementById('entry-item-link').value = item.link || '';
  document.getElementById('entry-item-price').value = item.price || '';
  document.getElementById('entry-item-purchase-date').value = item.purchaseDate || '';
  document.getElementById('entry-item-batch').value = item.batch || '';
  document.getElementById('entry-item-qty').value = item.qty || 0;
  document.getElementById('entry-item-unit').value = item.unit || 'Pcs';
  document.getElementById('entry-item-qty-per-machine').value = item.qtyPerMachine || 1;
  document.getElementById('entry-item-threshold').value = item.threshold || 5;
  document.getElementById('entry-item-rack').value = item.rack || '';
  document.getElementById('entry-vendor-name').value = item.vendorName || '';
  document.getElementById('entry-vendor-phone').value = item.vendorPhone || '';
  document.getElementById('entry-vendor-address').value = item.vendorAddress || '';
  document.getElementById('entry-item-operator').value = item.operator || 'Store Incharge';
  document.getElementById('entry-item-notes').value = item.notes || '';

  openModal('modal-item-entry');
}

function deleteComponent(id) {
  const item = AppState.components.find(c => c.id === id);
  if (!item) return;

  if (confirm(`Are you sure you want to delete "${item.name}" (${item.sku}) from inventory?`)) {
    AppState.components = AppState.components.filter(c => c.id !== id);
    showToast(`Deleted "${item.name}".`, 'info');
    saveAllDataLocal();
    syncWithServer();
    renderAllViews();
  }
}

function viewComponentDetail(id) {
  const item = AppState.components.find(c => c.id === id);
  if (!item) return;

  const titleEl = document.getElementById('detail-modal-title');
  const bodyEl = document.getElementById('component-detail-body');
  const editBtn = document.getElementById('detail-edit-btn');

  if (titleEl) titleEl.innerHTML = `<i class="fas fa-microchip" style="color:#15803d;"></i> ${escapeHTML(item.name)}`;
  if (editBtn) {
    editBtn.onclick = () => {
      closeModal('modal-component-detail');
      editComponent(item.id);
    };
  }

  let badgeClass = 'badge-in-stock';
  if (item.status === 'Low Stock') badgeClass = 'badge-low-stock';
  if (item.status === 'Out of Stock') badgeClass = 'badge-out-of-stock';

  const prodBadge = getProductBadge(item.product);

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e2e8f0;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;align-items:center;gap:6px;">
          ${prodBadge}
          <span class="badge badge-category">${escapeHTML(item.category)}</span>
          <span class="badge ${badgeClass}">${item.status}</span>
        </div>
        <div style="font-size:1.25rem;font-weight:800;color:#15803d;">
          ${item.price ? `₹${Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Price not set'}
        </div>
      </div>

      <div class="form-row">
        <div>
          <strong>Product Line:</strong> <span>${escapeHTML(item.product || 'SoilENZ')}</span><br>
          <strong>Category:</strong> <span class="badge badge-category">${escapeHTML(item.category || 'N/A')}</span><br>
          <strong>SKU / Part Code:</strong> <code>${escapeHTML(item.sku || 'N/A')}</code><br>
          <strong>Model Number:</strong> ${escapeHTML(item.model || 'N/A')}<br>
          <strong>HSN Code:</strong> <code>${escapeHTML(item.hsn || 'N/A')}</code><br>
          <strong>Batch / Lot:</strong> ${escapeHTML(item.batch || 'N/A')}
        </div>
        <div>
          <strong>Current Stock:</strong> <span style="font-size:1.1rem;font-weight:800;color:#0f172a;">${item.qty} ${escapeHTML(item.unit || 'Pcs')}</span><br>
          <strong>Min. Threshold:</strong> ${item.threshold || 5} ${escapeHTML(item.unit || 'Pcs')}<br>
          <strong>Qty per Machine:</strong> ${item.qtyPerMachine || 1} Pcs<br>
          <strong>Rack / Storage Bin:</strong> <span style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">${escapeHTML(item.rack || 'Not Assigned')}</span>
        </div>
      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:16px 0;">
        <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:#475569;margin-bottom:6px;"><i class="fas fa-store"></i> Vendor / Supplier</div>
        <strong>${escapeHTML(item.vendorName || 'Not recorded')}</strong><br>
        <span style="font-size:0.8rem;color:#64748b;">Phone: ${escapeHTML(item.vendorPhone || 'N/A')}</span><br>
        <span style="font-size:0.8rem;color:#64748b;">Address: ${escapeHTML(item.vendorAddress || 'N/A')}</span>
      </div>

      ${item.link ? `
        <div style="margin-bottom:12px;">
          <strong>Purchase Link:</strong> <a href="${item.link}" target="_blank" rel="noreferrer" style="color:#2563eb;word-break:break-all;">${item.link}</a>
        </div>
      ` : ''}

      <div style="font-size:0.8rem;color:#64748b;">
        <strong>Notes:</strong> ${escapeHTML(item.notes || 'None')}
      </div>
    `;
  }

  openModal('modal-component-detail');
}

function quickStockIn(id) {
  const item = AppState.components.find(c => c.id === id);
  if (!item) return;

  const qtyToAdd = prompt(`Enter quantity to add to stock for "${item.name}":`, "5");
  if (qtyToAdd === null) return;
  const num = parseInt(qtyToAdd, 10);
  if (isNaN(num) || num <= 0) {
    alert("Please enter a valid positive number.");
    return;
  }

  item.qty = (Number(item.qty) || 0) + num;
  logMovement('IN', item.id, item.name, num, item.qty, 'Quick Stock In', 'N/A', 'Store Incharge', 'Direct replenishment');
  recalculateStatuses();
  saveAllDataLocal();
  syncWithServer();
  renderAllViews();
  showToast(`Added +${num} ${item.unit || 'Pcs'} to "${item.name}".`);
}

function quickStockOut(id) {
  const item = AppState.components.find(c => c.id === id);
  if (!item) return;

  openModal('modal-item-exit');
  const select = document.getElementById('exit-item-select');
  if (select) {
    select.value = id;
    onExitItemSelected();
  }
}

// ==========================================================================
// STOCK EXIT & MACHINE ALLOCATION
// ==========================================================================
function populateExitModalSelects() {
  const itemSelect = document.getElementById('exit-item-select');
  const machineSelect = document.getElementById('exit-machine-ref');
  if (!itemSelect) return;

  itemSelect.innerHTML = `<option value="">-- Choose a component --</option>` +
    AppState.components.map(c => `<option value="${c.id}">[${c.product || 'SoilENZ'}] ${escapeHTML(c.name)} (Stock: ${c.qty} ${c.unit || 'Pcs'})</option>`).join('');

  if (machineSelect) {
    machineSelect.innerHTML = `<option value="">None / General Purpose</option>` +
      AppState.machines.filter(m => m.status !== 'Dispatched').map(m => `<option value="${m.serialNumber}">[${m.product || 'SoilENZ'}] ${escapeHTML(m.serialNumber)} - ${escapeHTML(m.model)}</option>`).join('');
  }
}

function onExitItemSelected() {
  const compId = document.getElementById('exit-item-select')?.value;
  const preview = document.getElementById('exit-stock-preview');
  if (!preview) return;

  const item = AppState.components.find(c => c.id === compId);
  if (item) {
    preview.innerHTML = `Product: <strong>${item.product || 'SoilENZ'}</strong> | Current Stock: <strong style="color:${item.qty > item.threshold ? '#15803d' : '#dc2626'};">${item.qty} ${escapeHTML(item.unit || 'Pcs')}</strong> (Min Threshold: ${item.threshold})`;
  } else {
    preview.innerHTML = '';
  }
}

function submitItemExit(e) {
  e.preventDefault();
  const compId = document.getElementById('exit-item-select').value;
  const qtyToExit = parseInt(document.getElementById('exit-item-qty').value, 10);
  const reason = document.getElementById('exit-item-reason').value;
  const machineRef = document.getElementById('exit-machine-ref')?.value || 'N/A';
  const operator = document.getElementById('exit-item-operator')?.value || 'Assembly Tech';
  const notes = document.getElementById('exit-item-notes')?.value || '';

  const item = AppState.components.find(c => c.id === compId);
  if (!item) {
    alert("Please select a valid component.");
    return;
  }

  if (qtyToExit <= 0) {
    alert("Quantity to exit must be at least 1.");
    return;
  }

  if (qtyToExit > item.qty) {
    alert(`Insufficient stock! You requested ${qtyToExit} ${item.unit || 'Pcs'}, but only ${item.qty} are available.`);
    return;
  }

  item.qty -= qtyToExit;
  const txType = (reason === 'Machine Allocation') ? 'ALLOCATED' : 'OUT';

  logMovement(txType, item.id, item.name, qtyToExit, item.qty, reason, machineRef, operator, notes);

  if (reason === 'Machine Allocation' && machineRef && machineRef !== 'N/A') {
    const machine = AppState.machines.find(m => m.serialNumber === machineRef);
    if (machine) {
      if (!machine.allocatedComponents) machine.allocatedComponents = [];
      const existingPart = machine.allocatedComponents.find(p => p.compId === item.id);
      if (existingPart) {
        existingPart.qty += qtyToExit;
      } else {
        machine.allocatedComponents.push({
          compId: item.id,
          compName: item.name,
          qty: qtyToExit
        });
      }
    }
  }

  if (item.qty === 0) {
    addNotification('danger', `Stock Depleted: ${item.name} (${item.product || 'SoilENZ'})`, `Item has reached 0 ${item.unit || 'Pcs'}. Reorder immediately.`);
  } else if (item.qty <= item.threshold) {
    addNotification('warning', `Low Stock Alert: ${item.name} (${item.product || 'SoilENZ'})`, `Current stock (${item.qty}) is below safety threshold (${item.threshold}).`);
  }

  closeModal('modal-item-exit');
  recalculateStatuses();
  saveAllDataLocal();
  syncWithServer();
  renderAllViews();
  showToast(`Recorded stock exit of ${qtyToExit} ${item.unit || 'Pcs'} for "${item.name}".`);
}

function logMovement(type, compId, compName, qty, balanceAfter, reason, machineRef, operator, notes) {
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const movement = {
    id: `TX-${1000 + AppState.movements.length + 1}`,
    timestamp: timeStr,
    type,
    compId,
    compName,
    qty,
    balanceAfter,
    reason,
    machineRef: machineRef || 'N/A',
    operator: operator || 'Store Incharge',
    notes: notes || ''
  };
  AppState.movements.push(movement);
}

// ==========================================================================
// REGISTER MACHINE & DISPATCH (WITH STATUS & EDIT SUPPORT)
// ==========================================================================
function submitRegisterMachine(e) {
  e.preventDefault();
  const serialNumber = document.getElementById('reg-machine-serial').value.trim();
  const product = document.getElementById('reg-machine-product')?.value || 'SoilENZ';
  const model = document.getElementById('reg-machine-model').value.trim();
  const status = document.getElementById('reg-machine-status')?.value || 'In Assembly';

  if (!serialNumber) {
    alert("Machine Serial Number is required.");
    return;
  }

  if (!model) {
    alert("Machine Model Variant is required.");
    return;
  }

  if (AppState.machines.some(m => m.serialNumber.toLowerCase() === serialNumber.toLowerCase())) {
    alert(`Machine with serial "${serialNumber}" already exists.`);
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const newMachine = {
    id: `MACH-${Date.now().toString().slice(-4)}`,
    product,
    serialNumber,
    model,
    status,
    registeredDate: today,
    allocatedComponents: []
  };

  AppState.machines.unshift(newMachine);
  closeModal('modal-register-machine');
  document.getElementById('form-register-machine')?.reset();
  saveAllDataLocal();
  syncWithServer();
  renderAllViews();
  showToast(`Machine ${serialNumber} (${product}) registered with status: "${status}".`);
}

function populateDispatchMachineSelect(preselectSerial = null) {
  const select = document.getElementById('dispatch-machine-select');
  if (!select) return;

  const available = AppState.machines.filter(m => m.status !== 'Dispatched');
  if (available.length === 0) {
    select.innerHTML = `<option value="">-- No machines available for dispatch --</option>`;
  } else {
    select.innerHTML = `<option value="">-- Select Machine to Dispatch --</option>` +
      available.map(m => `<option value="${m.serialNumber}" ${preselectSerial === m.serialNumber ? 'selected' : ''}>[${m.product || 'SoilENZ'}] ${escapeHTML(m.serialNumber)} (${escapeHTML(m.model)}) - ${escapeHTML(m.status)}</option>`).join('');
  }

  const dateInput = document.getElementById('dispatch-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function dispatchSpecificMachine(serialNumber) {
  openModal('modal-dispatch-machine');
  populateDispatchMachineSelect(serialNumber);
}

function submitMachineDispatch(e) {
  e.preventDefault();
  const serial = document.getElementById('dispatch-machine-select').value;
  const dispatchDate = document.getElementById('dispatch-date').value;
  const destinationName = document.getElementById('dispatch-destination-name').value.trim();
  const destinationAddress = document.getElementById('dispatch-destination-address').value.trim();
  const pathRoute = document.getElementById('dispatch-path-route').value.trim();
  const consigneeContact = document.getElementById('dispatch-consignee-contact').value.trim();
  const transporter = document.getElementById('dispatch-transporter').value.trim();
  const trackingWaybill = document.getElementById('dispatch-tracking-waybill').value.trim();
  const operator = document.getElementById('dispatch-operator').value.trim() || 'Dispatch Supervisor';
  const notes = document.getElementById('dispatch-notes').value.trim();

  const machine = AppState.machines.find(m => m.serialNumber === serial);
  if (!machine) {
    alert("Please select a valid machine unit.");
    return;
  }

  const dispatchId = `DISP-${100 + AppState.dispatches.length + 1}`;
  const dispatchRecord = {
    id: dispatchId,
    product: machine.product || 'SoilENZ',
    machineSerial: machine.serialNumber,
    machineModel: machine.model,
    dispatchDate,
    destinationName,
    destinationAddress,
    pathRoute,
    consigneeContact,
    transporter,
    trackingWaybill,
    operator,
    notes,
    timestamp: new Date().toISOString()
  };

  machine.status = 'Dispatched';
  machine.dispatchId = dispatchId;
  AppState.dispatches.unshift(dispatchRecord);

  addNotification('success', `Machine Dispatched: [${machine.product || 'SoilENZ'}] ${machine.serialNumber}`, `Dispatched to ${destinationName} via ${transporter || 'Direct Cargo'}.`);

  closeModal('modal-dispatch-machine');
  document.getElementById('form-dispatch-machine')?.reset();
  saveAllDataLocal();
  syncWithServer();
  renderAllViews();
  showToast(`Machine ${machine.serialNumber} dispatched successfully!`);

  showChallanModal(dispatchId);
}

// ==========================================================================
// DELIVERY CHALLAN & GATE PASS
// ==========================================================================
function viewDispatchChallanForMachine(serialNumber) {
  const dispatch = AppState.dispatches.find(d => d.machineSerial === serialNumber);
  if (dispatch) {
    showChallanModal(dispatch.id);
  } else {
    alert("Dispatch record not found.");
  }
}

function showChallanModal(dispatchId) {
  const d = AppState.dispatches.find(item => item.id === dispatchId);
  if (!d) return;

  const machine = AppState.machines.find(m => m.serialNumber === d.machineSerial);
  const parts = machine?.allocatedComponents || [];

  const partsRows = parts.length > 0 ? parts.map((p, idx) => `
    <tr>
      <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td>
      <td style="padding:6px;border:1px solid #cbd5e1;">${escapeHTML(p.compName)}</td>
      <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">${p.qty} Pcs</td>
      <td style="padding:6px;border:1px solid #cbd5e1;">Sub-assembly component</td>
    </tr>
  `).join('') : `
    <tr>
      <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">1</td>
      <td style="padding:6px;border:1px solid #cbd5e1;">${escapeHTML(d.machineModel)} (Complete System)</td>
      <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">1 Unit</td>
      <td style="padding:6px;border:1px solid #cbd5e1;">Fully calibrated agritech hardware</td>
    </tr>
  `;

  const printable = document.getElementById('challan-printable-content');
  if (printable) {
    printable.innerHTML = `
      <div class="challan-doc">
        <div class="challan-header">
          <div>
            <div class="challan-title">ArkaShine Innovations Private Limited</div>
            <div class="challan-company">
              Agritech Precision Hub, Old City, Bidar, Karnataka - 585401<br>
              <strong>CIN:</strong> U74999KA2021PTC144988 | <strong>Email:</strong> ops@arkashine.in
            </div>
          </div>
          <div class="challan-badge-doc">
            <div>DELIVERY CHALLAN &amp; GATE PASS</div>
            <div style="font-size:0.75rem;font-weight:600;margin-top:2px;">Challan No: <code>${escapeHTML(d.id)}</code></div>
            <div style="font-size:0.72rem;font-weight:500;">Date: ${escapeHTML(d.dispatchDate)}</div>
          </div>
        </div>

        <div class="challan-grid-2">
          <div class="challan-box">
            <h5>Consignee / Destination Details</h5>
            <strong>${escapeHTML(d.destinationName)}</strong><br>
            <span>${escapeHTML(d.destinationAddress)}</span><br>
            <span>Contact: <strong>${escapeHTML(d.consigneeContact || 'N/A')}</strong></span>
          </div>
          <div class="challan-box">
            <h5>Dispatch &amp; Transit Details</h5>
            <strong>Product Line:</strong> <span><strong>${escapeHTML(d.product || 'SoilENZ')}</strong></span><br>
            <strong>Transit Route:</strong> <span>${escapeHTML(d.pathRoute)}</span><br>
            <strong>Transporter:</strong> <span>${escapeHTML(d.transporter || 'Direct')}</span><br>
            <strong>Docket / Waybill No:</strong> <span>${escapeHTML(d.trackingWaybill || 'N/A')}</span>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <h5 style="font-size:0.78rem;text-transform:uppercase;color:#475569;margin-bottom:6px;">Consignment Specifications</h5>
          <table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:6px;border:1px solid #cbd5e1;width:40px;">#</th>
                <th style="padding:6px;border:1px solid #cbd5e1;text-align:left;">Item Description / Machine Details</th>
                <th style="padding:6px;border:1px solid #cbd5e1;width:80px;text-align:center;">Quantity</th>
                <th style="padding:6px;border:1px solid #cbd5e1;text-align:left;">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr style="font-weight:700;background:#f8fafc;">
                <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">★</td>
                <td style="padding:6px;border:1px solid #cbd5e1;">[${escapeHTML(d.product || 'SoilENZ')}] ${escapeHTML(d.machineModel)} (Serial: ${escapeHTML(d.machineSerial)})</td>
                <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">1 Unit</td>
                <td style="padding:6px;border:1px solid #cbd5e1;">Primary Agritech Machine</td>
              </tr>
              ${partsRows}
            </tbody>
          </table>
        </div>

        <div style="font-size:0.75rem;color:#64748b;margin-bottom:20px;">
          <strong>Notes:</strong> ${escapeHTML(d.notes || 'Goods dispatched for deployment & field operations. Not for commercial resale.')}
        </div>

        <div class="challan-signatures">
          <div class="challan-sig-line">Prepared &amp; Packed By<br><span style="font-size:0.72rem;color:#64748b;">(${escapeHTML(d.operator)})</span></div>
          <div class="challan-sig-line">Security Gate Officer<br><span style="font-size:0.72rem;color:#64748b;">(Verified &amp; Cleared)</span></div>
          <div class="challan-sig-line">Carrier / Receiver Signature<br><span style="font-size:0.72rem;color:#64748b;">(Goods in Sound Condition)</span></div>
        </div>
      </div>
    `;
  }

  openModal('modal-challan');
}

// ==========================================================================
// EXCEL UPLOAD & IMPORT SYSTEM (WITH PRODUCT ALLOCATION)
// ==========================================================================
function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!jsonRows || jsonRows.length === 0) {
        alert("The selected Excel file contains no data rows.");
        return;
      }

      parseExcelData(jsonRows);
    } catch (err) {
      alert("Error reading Excel file: " + err.message);
    }
  };
  reader.readAsBinaryString(file);
}

const dropzone = document.getElementById('excel-dropzone');
if (dropzone) {
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      const input = document.getElementById('excel-file-input');
      if (input) {
        input.files = dt.files;
        handleExcelUpload({ target: { files: [file] } });
      }
    }
  }, false);
}

function parseExcelData(rawRows) {
  const targetProductSetting = document.getElementById('excel-target-product')?.value || 'AUTO';
  const parsed = [];

  rawRows.forEach((row, idx) => {
    const keys = Object.keys(row);
    const getVal = (...matches) => {
      for (const m of matches) {
        const found = keys.find(k => k.trim().toLowerCase() === m.toLowerCase() || k.trim().toLowerCase().includes(m.toLowerCase()));
        if (found && row[found] !== undefined && row[found] !== '') {
          return String(row[found]).trim();
        }
      }
      return '';
    };

    const name = getVal('component name', 'component', 'part name', 'name', 'item name', 'item');
    if (!name) return;

    let product = 'SoilENZ';
    if (targetProductSetting !== 'AUTO') {
      product = targetProductSetting;
    } else {
      const detected = getVal('product line', 'product', 'system', 'brand');
      if (detected) {
        const dLower = detected.toLowerCase();
        if (dLower.includes('sparsh')) product = 'Soil Sparsh';
        else if (dLower.includes('life')) product = 'Soil Life';
        else if (dLower.includes('other')) product = 'Others';
        else if (dLower.includes('common')) product = 'Common';
        else product = 'SoilENZ';
      }
    }

    const category = getVal('category', 'group', 'type') || 'Components';
    const model = getVal('model no', 'model', 'part number');
    const hsn = getVal('hsn no', 'hsn number', 'hsn');
    const sku = getVal('sku', 'internal sku', 'part sku', 'code') || `SKU-XL-${Date.now().toString().slice(-4)}-${idx+1}`;
    const price = parseFloat(getVal('price', 'unit price', 'rate', 'cost')) || 0;
    const qty = parseInt(getVal('stock', 'qty', 'quantity', 'balance', 'units'), 10) || 0;
    const unit = getVal('unit of measure', 'unit', 'uom') || 'Pcs';
    const qtyPerMachine = parseInt(getVal('qty/machine', 'qty per machine'), 10) || 1;
    const threshold = parseInt(getVal('min. safety threshold', 'threshold', 'min safety', 'safety stock'), 10) || 5;
    const rack = getVal('rack', 'storage rack', 'bin', 'location') || 'Warehouse Bay 1';
    const vendorName = getVal('vendor', 'vendor name', 'supplier', 'supplier name');
    const vendorPhone = getVal('vendor phone', 'phone', 'contact');
    const vendorAddress = getVal('vendor address', 'address');
    const purchaseLink = getVal('purchase link', 'link', 'url');
    const purchaseDate = getVal('date of purchase', 'purchase date', 'date');
    const notes = getVal('notes', 'remarks');

    parsed.push({
      id: `COMP-${Date.now().toString().slice(-4)}-${idx+1}`,
      product,
      name,
      category,
      model,
      hsn,
      sku,
      link: purchaseLink,
      price,
      purchaseDate,
      batch: `LOT-XL-${new Date().getFullYear()}`,
      qty,
      unit,
      qtyPerMachine,
      threshold,
      rack,
      vendorName,
      vendorPhone,
      vendorAddress,
      notes,
      operator: 'Excel Import',
      createdAt: new Date().toISOString()
    });
  });

  if (parsed.length === 0) {
    alert("Could not identify any valid component rows from this file. Ensure the Excel has a column like 'Component Name' or 'Item'.");
    return;
  }

  AppState.pendingExcelRows = parsed;

  const previewContainer = document.getElementById('excel-upload-preview');
  const previewStatus = document.getElementById('excel-preview-status');
  const tbody = document.getElementById('excel-preview-tbody');
  const confirmBtn = document.getElementById('btn-confirm-excel-import');

  if (previewStatus) {
    previewStatus.innerHTML = `<i class="fas fa-check-circle" style="color:#16a34a;"></i> Found <strong>${parsed.length}</strong> component items ready to import:`;
  }

  if (tbody) {
    tbody.innerHTML = parsed.slice(0, 15).map(item => `
      <tr>
        <td>${getProductBadge(item.product)}</td>
        <td><strong>${escapeHTML(item.name)}</strong></td>
        <td><span class="badge badge-category">${escapeHTML(item.category)}</span></td>
        <td><strong>${item.qty}</strong> ${escapeHTML(item.unit)}</td>
        <td style="color:#15803d;font-weight:600;">₹${item.price}</td>
        <td>${escapeHTML(item.rack)}</td>
      </tr>
    `).join('') + (parsed.length > 15 ? `<tr><td colspan="6" style="text-align:center;font-size:0.75rem;color:#64748b;">...and ${parsed.length - 15} more components</td></tr>` : '');
  }

  if (previewContainer) previewContainer.style.display = 'block';
  if (confirmBtn) confirmBtn.style.display = 'inline-flex';
}

function confirmExcelImport() {
  if (!AppState.pendingExcelRows || AppState.pendingExcelRows.length === 0) return;

  let addedCount = 0;
  let updatedCount = 0;

  AppState.pendingExcelRows.forEach(imported => {
    const existing = AppState.components.find(c =>
      (c.sku && imported.sku && c.sku.toLowerCase() === imported.sku.toLowerCase()) ||
      (c.name && imported.name && c.name.toLowerCase() === imported.name.toLowerCase())
    );

    if (existing) {
      existing.qty = (Number(existing.qty) || 0) + (Number(imported.qty) || 0);
      if (imported.product) existing.product = imported.product;
      if (imported.category) existing.category = imported.category;
      if (imported.price) existing.price = imported.price;
      if (imported.rack) existing.rack = imported.rack;
      if (imported.vendorName) existing.vendorName = imported.vendorName;
      logMovement('IN', existing.id, existing.name, imported.qty, existing.qty, 'Excel Bulk Import Update', 'N/A', 'Excel Import', 'Stock merged from Excel');
      updatedCount++;
    } else {
      AppState.components.push(imported);
      if (imported.qty > 0) {
        logMovement('IN', imported.id, imported.name, imported.qty, imported.qty, 'Excel Bulk Import Initial', 'N/A', 'Excel Import', 'New component imported from Excel');
      }
      addedCount++;
    }
  });

  recalculateStatuses();
  populateCategoryFilter();
  saveAllDataLocal();
  syncWithServer();
  renderAllViews();

  closeModal('modal-upload-excel');
  AppState.pendingExcelRows = [];

  const fileInput = document.getElementById('excel-file-input');
  if (fileInput) fileInput.value = '';
  const previewContainer = document.getElementById('excel-upload-preview');
  if (previewContainer) previewContainer.style.display = 'none';
  const confirmBtn = document.getElementById('btn-confirm-excel-import');
  if (confirmBtn) confirmBtn.style.display = 'none';

  showToast(`Successfully imported Excel inventory! (${addedCount} added, ${updatedCount} updated)`);
}

function downloadExcelTemplate() {
  const sampleData = [
    {
      "Product Line": "SoilENZ",
      "Component Name": "Multi-Wavelength Spectrophotometer Reagent Chamber",
      "Category": "Lab & Chemicals",
      "Model No": "SPEC-CU-V3",
      "HSN No": "90273090",
      "Part SKU": "ENZ-SPEC-01",
      "Unit Price (INR)": 12500.00,
      "Stock Quantity": 10,
      "Unit of Measure": "Kits",
      "Qty Required Per Machine": 1,
      "Min Safety Threshold": 3,
      "Storage Rack / Bin": "Cold Shelf Cabinet 1, Bin A",
      "Vendor Name": "ArkaShine Optics Lab",
      "Vendor Phone": "+91 8482 255100",
      "Vendor Address": "Bidar, Karnataka",
      "Purchase Link": "https://arkashine.in",
      "Date of Purchase": "2026-09-01",
      "Notes": "For SoilENZ enzymatic analysis"
    },
    {
      "Product Line": "Soil Sparsh",
      "Component Name": "Soil NPK 3-in-1 Sensor Probe (RS485)",
      "Category": "Sensors & Probes",
      "Model No": "NPK-RS485-M12",
      "HSN No": "90278090",
      "Part SKU": "SPR-NPK-01",
      "Unit Price (INR)": 4200.00,
      "Stock Quantity": 15,
      "Unit of Measure": "Pcs",
      "Qty Required Per Machine": 1,
      "Min Safety Threshold": 4,
      "Storage Rack / Bin": "Rack B, Shelf 1, Bin 12",
      "Vendor Name": "Goutham Electronics",
      "Vendor Phone": "+91 80 2221 3456",
      "Vendor Address": "SP Road, Bengaluru",
      "Purchase Link": "https://robu.in",
      "Date of Purchase": "2026-09-05",
      "Notes": "For Soil Sparsh rapid analyzer"
    },
    {
      "Product Line": "Soil Life",
      "Component Name": "Microbial Soil Respiration CO2 Flux Sensor",
      "Category": "Sensors & Probes",
      "Model No": "CO2-NDIR-5000PPM",
      "HSN No": "90278090",
      "Part SKU": "LIF-CO2-01",
      "Unit Price (INR)": 8900.00,
      "Stock Quantity": 8,
      "Unit of Measure": "Pcs",
      "Qty Required Per Machine": 1,
      "Min Safety Threshold": 3,
      "Storage Rack / Bin": "Rack B, Shelf 3, Bin 01",
      "Vendor Name": "SenseAir India",
      "Vendor Phone": "+91 80 4900 8800",
      "Vendor Address": "Whitefield, Bengaluru",
      "Purchase Link": "https://arkashine.in",
      "Date of Purchase": "2026-09-10",
      "Notes": "For Soil Life microbial diagnostic"
    },
    {
      "Product Line": "Others",
      "Component Name": "Portable Thermal Imaging Soil Temperature Camera",
      "Category": "Displays & Cameras",
      "Model No": "TH-CAM-256-IR",
      "HSN No": "90275000",
      "Part SKU": "OTH-THM-01",
      "Unit Price (INR)": 7800.00,
      "Stock Quantity": 4,
      "Unit of Measure": "Pcs",
      "Qty Required Per Machine": 1,
      "Min Safety Threshold": 2,
      "Storage Rack / Bin": "Rack D, Shelf 1, Bin 02",
      "Vendor Name": "Flir India",
      "Vendor Phone": "+91 80 4100 2345",
      "Vendor Address": "Bengaluru",
      "Purchase Link": "https://robu.in",
      "Date of Purchase": "2026-09-14",
      "Notes": "Custom thermography component"
    },
    {
      "Product Line": "Common",
      "Component Name": "12V 10000mAh LiFePO4 Battery Pack",
      "Category": "Power & Battery",
      "Model No": "LFP-12V-10AH-BMS",
      "HSN No": "85076000",
      "Part SKU": "COM-BAT-03",
      "Unit Price (INR)": 4950.00,
      "Stock Quantity": 12,
      "Unit of Measure": "Pcs",
      "Qty Required Per Machine": 1,
      "Min Safety Threshold": 4,
      "Storage Rack / Bin": "Battery Fire Cabinet C",
      "Vendor Name": "Ampere Energy",
      "Vendor Phone": "+91 44 2855 1234",
      "Vendor Address": "Chennai",
      "Purchase Link": "https://arkashine.in",
      "Date of Purchase": "2026-09-12",
      "Notes": "Shared battery pack across all models"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory_Template");
  XLSX.writeFile(wb, "ArkaShine_SoilENZ_Sparsh_Life_Template.xlsx");
  showToast("Sample Excel Template downloaded with SoilENZ, Soil Sparsh, Soil Life & Others!");
}

function exportCompleteExcel() {
  const wb = XLSX.utils.book_new();

  const compsData = AppState.components.map((c, i) => ({
    "#": i + 1,
    "Product Line": c.product || "SoilENZ",
    "Component Name": c.name,
    "SKU": c.sku,
    "Model No": c.model,
    "HSN Code": c.hsn,
    "Category": c.category,
    "Unit Price (INR)": c.price,
    "Current Stock": c.qty,
    "Unit": c.unit,
    "Qty / Machine": c.qtyPerMachine,
    "Min Safety Threshold": c.threshold,
    "Status": c.status,
    "Vendor Name": c.vendorName,
    "Vendor Phone": c.vendorPhone,
    "Vendor Address": c.vendorAddress,
    "Storage Rack": c.rack,
    "Purchase Link": c.link,
    "Purchase Date": c.purchaseDate,
    "Batch / Lot": c.batch,
    "Operator": c.operator,
    "Notes": c.notes
  }));
  const wsComps = XLSX.utils.json_to_sheet(compsData);
  XLSX.utils.book_append_sheet(wb, wsComps, "Components_Inventory");

  const machinesData = AppState.machines.map((m, i) => ({
    "#": i + 1,
    "Product Line": m.product || "SoilENZ",
    "Serial Number": m.serialNumber,
    "Model Variant": m.model,
    "Status": m.status,
    "Registration Date": m.registeredDate,
    "Allocated Parts Count": m.allocatedComponents?.length || 0,
    "Allocated BOM Details": (m.allocatedComponents || []).map(p => `${p.compName} (${p.qty})`).join('; ')
  }));
  const wsMachines = XLSX.utils.json_to_sheet(machinesData);
  XLSX.utils.book_append_sheet(wb, wsMachines, "Machines_Assembly");

  const movementsData = AppState.movements.map(m => ({
    "Transaction ID": m.id,
    "Timestamp": m.timestamp,
    "Movement Type": m.type,
    "Component Name": m.compName,
    "Quantity": m.qty,
    "Balance After": m.balanceAfter,
    "Reason": m.reason,
    "Machine Reference": m.machineRef,
    "Operator": m.operator,
    "Notes": m.notes
  }));
  const wsMovements = XLSX.utils.json_to_sheet(movementsData);
  XLSX.utils.book_append_sheet(wb, wsMovements, "Traceability_Ledger");

  const dispatchesData = AppState.dispatches.map(d => ({
    "Dispatch ID": d.id,
    "Product Line": d.product || "SoilENZ",
    "Machine Serial": d.machineSerial,
    "Machine Model": d.machineModel,
    "Dispatch Date": d.dispatchDate,
    "Destination Name": d.destinationName,
    "Destination Address": d.destinationAddress,
    "Transit Route Path": d.pathRoute,
    "Consignee Contact": d.consigneeContact,
    "Transporter": d.transporter,
    "Waybill Number": d.trackingWaybill,
    "Dispatched By": d.operator,
    "Notes": d.notes
  }));
  const wsDispatches = XLSX.utils.json_to_sheet(dispatchesData);
  XLSX.utils.book_append_sheet(wb, wsDispatches, "Dispatched_Units");

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `ArkaShine_Inventory_Complete_${today}.xlsx`);
  showToast("Full Excel Workbook downloaded with updated products and machines!");
}

function exportMovementsCSV() {
  const data = AppState.movements.map(m => ({
    "Tx ID": m.id,
    "Date & Time": m.timestamp,
    "Type": m.type,
    "Component Name": m.compName,
    "Quantity": m.qty,
    "Balance After": m.balanceAfter,
    "Reason": m.reason,
    "Machine Ref": m.machineRef,
    "Operator": m.operator,
    "Notes": m.notes
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SoilENZ_Traceability_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Traceability Ledger exported to CSV.");
}

function exportJSONBackup() {
  const fullBackup = {
    version: "2.2",
    products: ["SoilENZ", "Soil Sparsh", "Soil Life", "Others", "Common"],
    exportDate: new Date().toISOString(),
    components: AppState.components,
    machines: AppState.machines,
    movements: AppState.movements,
    dispatches: AppState.dispatches,
    notifications: AppState.notifications
  };
  const jsonStr = JSON.stringify(fullBackup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ArkaShine_Inventory_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("JSON Backup exported successfully.");
}

function handleImportFile() {
  const fileInput = document.getElementById('import-file-input');
  if (!fileInput || !fileInput.files[0]) {
    alert("Please select a JSON backup file to restore.");
    return;
  }
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.components && Array.isArray(data.components)) {
        AppState.components = data.components;
        AppState.machines = data.machines || [];
        AppState.movements = data.movements || [];
        AppState.dispatches = data.dispatches || [];
        AppState.notifications = data.notifications || [];
        saveAllDataLocal();
        syncWithServer();
        renderAllViews();
        closeModal('modal-import-backup');
        showToast("Database restored successfully from backup!");
      } else {
        alert("Invalid backup format: 'components' array not found.");
      }
    } catch (err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function openLink(inputId) {
  const val = document.getElementById(inputId)?.value;
  if (val) {
    window.open(val, '_blank');
  } else {
    showToast("No URL entered.", "info");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  SoundFX.init();
  initDataPersistence();
});
