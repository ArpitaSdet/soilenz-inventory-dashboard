# ArkaShine Innovations – SoilENZ, Soil Sparsh & Soil Life Inventory Portal

Internal Agritech Operations & Component Management Portal for:
- 🌿 **SoilENZ** (Enzyme & Spectrophotometry Testing Systems)
- ⚡ **Soil Sparsh** (Rapid Multi-Sensor Field Analyzers)
- 🔬 **Soil Life** (Bio-Activity & Microbial Diagnostic Stations)
- 📦 **Common Parts** (Shared SBCs, Displays, Batteries, Hardware)

Bidar, Karnataka | CIN: U74999KA2021PTC144988

---

## 🚀 Quick Launch & Hosting

### Option A: Host Free on Render (Cloud Deployment)
This dashboard is completely configured and ready to be hosted on **Render** (render.com):
1. **Push your code to GitHub / GitLab**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```
2. **Deploy on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **"New +" → "Web Service"**.
   - Select your GitHub/GitLab repository.
   - Configure with these settings:
     - **Name**: `soilenz-inventory-dashboard`
     - **Runtime**: `Node`
     - **Build Command**: `npm run build` (or leave empty)
     - **Start Command**: `node server.js`
     - **Instance Type**: `Free`
   - In **Environment Variables**, add:
     - `NODE_VERSION` = `22.12.0`
3. Click **"Deploy Web Service"**!
   - Your dashboard will be live on an HTTPS URL like `https://soilenz-inventory-dashboard.onrender.com`.
   - The native SQLite database automatically loads and seeds on startup.

---

### Option B: Run Locally with Persistent SQLite Backend
1. Double-click **`start_server.bat`** (or run `node server.js` in terminal).
2. Open your web browser: **[http://localhost:5000](http://localhost:5000)**.
3. Automatically connected to **`inventory.db`** SQLite database.

### Option C: Standalone Browser Mode
- Double-click **`index.html`** in this folder to open it directly in Chrome, Edge, or Firefox (uses localStorage persistence).

---

## 🎯 Structured Workflow & 3 Product Architecture

### 1. 📦 Component Inventory (First & Primary)
Right at the start under **Component Inventory**, you can manage components for all 3 products:
- **Interactive Product Switcher**:
  - Filter and view parts specifically for **SoilENZ**, **Soil Sparsh**, **Soil Life**, or **Common Parts**.
  - Real-time SKU and stock counters for each product line.
- **Manual Component Entry**:
  - Click **"+ Add Component"** to open the manual entry form.
  - Right at the top, select which product line the part belongs to (**SoilENZ**, **Soil Sparsh**, **Soil Life**, or **Common**).
  - Fill in part name, SKU, model number, HSN code, price, stock, rack/bin location, vendor details, and purchase URL.
- **Excel / Spreadsheet Upload**:
  - Click **"Upload Excel (.xlsx)"** on the toolbar.
  - Assign all rows to a specific product (e.g., SoilENZ, Soil Sparsh, or Soil Life) or let the parser auto-detect from the spreadsheet.
  - Automatically merges or creates records and updates the dashboard immediately.
  - Pre-loaded template with all 3 products: [`Sample_Components_Import.csv`](file:///c:/Users/akash/Downloads/Inventary%20management%20dashboard/Sample_Components_Import.csv).

---

### 2. 🤖 Machines & Assembly Hub (Follows Component Inventory)
- Register serial-numbered machine units categorized by product line (**SoilENZ**, **Soil Sparsh**, **Soil Life**).
- Allocate parts and track Bill of Materials (BOM) per machine.

---

### 3. 📜 Traceability Ledger
- Complete audit trail of inward receipts, manual stock adjustments, and machine assembly allocations with balance history.
- Export to CSV anytime.

---

### 4. 🚚 Dispatch Paths & Printable Delivery Challan
- Record transit routes (*Bidar R&D → Kalaburagi → Bengaluru*).
- Official print-ready **Delivery Challan & Gate Pass** document with company CIN, consignee info, and carrier signatures.

---

### 5. 🔔 Alerts & Notification Center
- Real-time stock depletion and threshold alerts with audio feedback (Sound: ON/OFF).
