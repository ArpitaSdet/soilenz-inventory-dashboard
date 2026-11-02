# ArkaShine Innovations – SoilENZ, Soil Sparsh & Soil Life Inventory Portal

Internal Agritech Operations & Component Management Portal for:
- 🌿 **SoilENZ** (Enzyme & Spectrophotometry Testing Systems)
- ⚡ **Soil Sparsh** (Rapid Multi-Sensor Field Analyzers)
- 🔬 **Soil Life** (Bio-Activity & Microbial Diagnostic Stations)
- 🏷️ **Others** (Custom & New Agricultural Hardware Units)
- 📦 **Common Parts** (Shared SBCs, Displays, Batteries, Hardware)

Bidar, Karnataka | CIN: U74999KA2021PTC144988

---

## ☁️ Neon Serverless PostgreSQL Connection (Permanent Cloud Storage)

To ensure your inventory data is **never deleted** (even after 15 days, 60 days, server sleep, or redeployments on Render):

### 1. Get Free Neon Database URL:
1. Go to **[neon.tech](https://neon.tech)** and sign up for free (or log in with GitHub/Google).
2. Click **Create Project** (Name: `arkashine-inventory`).
3. Under **Connection Details**, copy your **Postgres Connection String**:
   ```text
   postgresql://username:password@ep-xyz-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Connect to Render:
1. Open your Web Service on **[dashboard.render.com](https://dashboard.render.com)**.
2. Go to **Environment** (left sidebar).
3. Add or update the Environment Variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://username:password@ep-xyz-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. Click **Save Changes**. Render will automatically redeploy!
5. The portal will connect to Neon PostgreSQL and show:
   `🟢 Neon DB Live (Real-Time)` in the header.

### 3. Connect Locally:
- Copy `.env.example` to `.env`:
  ```bash
  cp .env.example .env
  ```
- Paste your `DATABASE_URL` into `.env`.
- Run `npm start`.

---

## 🔒 User Authentication & Account Access
- **First Time Access**:
  - Click **"Create Account"** in the login modal.
  - Enter your Name, Email, and Password.
  - Once registered, you will see a success message and can immediately sign in.
- **Session Persistence**:
  - Logged-in state is preserved across page refreshes.
  - Header displays your avatar and name with a **Logout** button.

---

## ⚡ Live Real-Time Updates
- Any changes made by any team member (adding parts, stock adjustments, registering machines, dispatching) are automatically synchronized in real-time across all connected devices and browsers every 3.5 seconds.

---

## 🚀 Quick Launch Locally

1. Double-click **`start_server.bat`** (or run `npm start` in terminal).
2. Open your web browser: **`http://localhost:5000`**.
3. If no `DATABASE_URL` is provided, it automatically uses the local SQLite database fallback (`inventory.db`).
