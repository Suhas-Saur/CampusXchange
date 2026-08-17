# 🎓 CampusConnect — College Trade & Lost-Found Platform

CampusConnect is a private college ecosystem where verified students can trace lost belongings, list and trade marketplace products, execute UPI payments, message each other in real-time, and receive push notifications.

It features a **hybrid data mode** (working seamlessly with either a MongoDB database or an in-memory fallback store) and is optimized for direct college peer-to-peer handovers.

---

## 🌟 Key Features

### 1. 🔑 Pre-filled Role Switcher Login
- Access student and administrator accounts in one click using pre-configured logins.
- Defaults to the **Student Profile** with credentials pre-populated.
- Click **Admin Profile** to automatically pre-fill the administrator credentials.

### 2. 🛒 Smart Peer-to-Peer Marketplace
- Complete listings gallery showing available books, calculators, and college supplies.
- **Pay & Buy Shortcuts**: Skip the product detail page and initiate checkout directly from the marketplace listing card.
- Click anywhere else on the card to inspect the item description, condition, and location.

### 3. 📱 Mobile Gateway & UPI Integration
- Default integration supporting direct transfers to recipient address `9901535561@ibl`.
- **UPI Deep-Linking**: On mobile, it triggers deep-link prompts (`phonepe://pay`) to launch PhonePe/installed UPI apps directly with prefilled parameters.
- **UPI QR Fallback**: On desktop, a dynamically generated QR Code is presented alongside a countdown timer.
- **Razorpay Sandbox**: Integrated support for Razorpay payment simulations.

### 4. 💬 Dynamic Post-Payment Communication Handovers
- **WhatsApp Chat Direct**: Once a transfer is verified, a green button links the buyer directly to WhatsApp (+91 format) with a pre-filled template message detailing the product, price, and pickup location.
- **Open Campus Chat**: An alternative button loads the built-in real-time socket-based chatroom between the buyer and the seller.

### 5. 💼 Seller Applications Dashboard
- Centered search feature: **`ENTER ITEM ID TO SEE APPLICATIONS:`**
- Query buy bids/applications for any listing by ID to display buyer details, coordinates, status badges, and request timestamps.

### 6. 📈 Admin Metrics Panels
- Standardized grid view containing the 6 core indicators:
  - **TOTAL USERS**
  - **LOST ITEMS**
  - **FOUND ITEMS**
  - **MARKETPLACE ITEMS**
  - **APPLICATIONS**
  - **MEETINGS**
- Full capabilities to delete or pause listings, modify users, and monitor activities.

### 7. 🔌 Database-Free Fallback Mode (100% Offline Coverage)
- If a local MongoDB instance (`port 27017`) is not running, the application gracefully intercepts connections and operates using an in-memory store.
- **Self-Healing Sessions**: Re-seeds and restores mock user sessions dynamically upon backend restarts, preventing session invalidation/401 errors.

---

## 🛠️ Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Socket.io-client.
- **Backend**: Node.js, Express.js, TypeScript, REST API, Socket.io (WebSockets).
- **Database**: MongoDB (Mongoose) with local/in-memory fallback support.
- **Auth**: JWT-based bearer authentication with bcryptjs hashing.

---

## 📁 Project Structure

```text
CampusXchange/
├── client/
│   ├── src/
│   │   ├── components/       # Core UI inputs, labels
│   │   ├── context/          # Auth & WebSocket Contexts
│   │   ├── layouts/          # Navigation Headers & Mobile Menus
│   │   ├── pages/            # Dashboards, Seller Panel, Checkout, Messages
│   │   └── services/         # Axios API service (baseURL set to localhost:5000)
│   ├── index.html
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── config/           # Socket.io gateways, MongoDB connector
│   │   ├── controllers/      # Route controllers (Auth, Payments, Products, Messages)
│   │   ├── middleware/       # JWT Auth protectors, Multer file uploaders
│   │   ├── models/           # Mongoose schemas
│   │   ├── utils/            # In-memory mock database collections
│   │   └── server.ts         # Runner bootloader file
│   └── tsconfig.json
├── package.json              # Monorepo runner scripts
└── .env.example              # Variables template
```

---

## ⚙️ Setup & Configuration

### 1. Environment File (`.env`)
Create a `.env` file at the project root directory (`/CampusXchange/.env`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
JWT_SECRET=campusconnect_secure_jwt_token_secret_2026

# College Domain configuration
COLLEGE_NAME="LNM Institute of Information Technology"
COLLEGE_EMAIL_DOMAIN="lnmiit.ac.in"

# Razorpay Sandbox Credentials
RAZORPAY_KEY_ID=rzp_test_abc123xyz
RAZORPAY_KEY_SECRET=def456uvw
RAZORPAY_WEBHOOK_SECRET=webhooksecret123
```

### 2. Install Dependencies
Run from the root workspace directory:
```bash
npm run install:all
```

### 3. Launch Development Servers
Start Express (port 5000) and React (port 3000) concurrently:
```bash
npm run dev
```
Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 👤 Test Accounts (Pre-seeded)

| Role | Username / Email | Password |
|---|---|---|
| **Student** | `student@lnmiit.ac.in` | `password123` |
| **Admin** | `admin@lnmiit.ac.in` | `password123` |
| **Guest Admin** | `admin@campusconnect.demo` | `password123` |
