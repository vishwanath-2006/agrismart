# AgriSmart AI Marketplace 🌾🚜

**AgriSmart AI Marketplace** is an end-to-end intelligent agricultural marketplace, fair-price negotiation system, dynamic APMC mandi intelligence ticker, cold-chain logistics matching, and AgriEscrow delivery settlement platform.

Designed and implemented with precision against **Stitch Project `6556095299421505443`** as the Single Source of Truth.

---

## 🚀 Key Features & Multi-Persona Architecture

### 👨‍🌾 1. Farmer Ecosystem
* **Live Farmer Dashboard (`/farmer/dashboard`)**: 4-Stat KPI bento grid, AI supply shortage insight cards, 7-day tomato price spline trend chart, and active produce listings.
* **APMC Mandi Comparison (`/farmer/market-comparison`)**: AI optimal destination recommendations, distance vs transport expense calculators, and net profit comparisons.
* **Real-time Mandi Rates (`/farmer/market-prices`)**: Searchable live ticker with category filtering (`Vegetables`, `Fruits`, `Grains`, `Pulses`) and modal price spreads.
* **AI Price Forecast (`/farmer/price-history`)**: Historical curves, dashed AI trajectory predictions, and seasonal market drivers.
* **Produce Listing (`/farmer/add-produce`)**: Instant camera presets, AI Grade A verification scanner, dynamic price guidance, and real-time inventory publishing.
* **Farmer Profile (`/farmer/profile`)**: Ramesh Kumar farm credentials, verified badges, sales performance, and bank payout mandate.

### 🛒 2. Buyer Ecosystem
* **Direct Harvest Marketplace (`/buyer/marketplace`)**: Real-time farm produce feed with category carousel, search bar, and interactive **Produce Details Modal**.
* **AI Price Negotiation (`/buyer/negotiation`)**: AI Fair-Value Equilibrium meter (88% acceptance zone), interactive counter-offer stepper, and offer history timeline.
* **Cold-Chain Transporter Matching (`/buyer/transporter-matching`)**: Route overview and AI recommended cold-chain vehicle match (Marcus Vance Reefer 4T).
* **AgriEscrow Order Confirmation (`/buyer/order-confirmation`)**: Transparent cost breakdown, 100% AgriEscrow quality protection guarantee, and checkout.
* **Buyer Profile (`/buyer/profile`)**: XYZ Traders corporate entity, APMC license details, and trust score (98).

### 🚚 3. Transporter Ecosystem
* **Logistics Dashboard (`/transporter/dashboard`)**: On/Off duty toggle, earnings stats, active shipment card, and dynamic queue of available agricultural load requests.
* **Highway Route Optimization (`/transporter/route-optimization`)**: Interactive vector road map, NH-275 Mandya expressway advisory (12% fuel savings), and waypoints.
* **Live Telemetry & GPS Tracking (`/transporter/live-tracking`)**: Real-time vector road movement, 17.8°C reefer temperature monitor, speed tracker, driver contacts, and 5-step delivery milestones.
* **Delivery Confirmation & Settlement (`/transporter/delivery-confirmation`)**: 4-Digit OTP verification, 502kg weighbridge measurement, Grade A sign-off, and automated escrow payout release.
* **Transporter Profile (`/transporter/profile`)**: Marcus Vance fleet specs (Tata 407 Reefer 4T, KA-09-E-4421, 842 trips).

---

## 🎨 Design System & Tokens

* **Primary Palette (Agri-Green):** `#0f5238`, Container `#2d6a4f`, On-Primary `#ffffff`, On-Container `#a8e7c5`
* **Secondary Palette (Earth Brown):** `#7d562d`, Container `#ffca98`, Accent `#d4a373`
* **Tertiary Palette (Sage Green):** `#0d5237`, Container `#2c6a4e`, Fixed `#b0f1cc`
* **Typography:** Google Fonts `Inter` (Display, Headline, Title, Body, Label)
* **Iconography:** Google `Material Symbols Outlined` (24px, 2px stroke weight)
* **Grid & Viewport:** 8px spatial grid, 16px mobile margin, 40px desktop margin, 48px touch targets

---

## 🛠️ Technology Stack

* **Framework:** React 18 with TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS + Custom Design System Tokens
* **Icons & Fonts:** Material Symbols Outlined + Inter
* **State Management:** Centralized `AppContext` with `localStorage` prototype persistence
* **Routing:** React Router v6

---

## 📦 Getting Started

### 1. Installation
```bash
git clone https://github.com/vishwanath-2006/agrismart.git
cd agrismart
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 📜 License
MIT License
