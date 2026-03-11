# 🚀 Clozet – Full Implementation Guide

## Overview
Clozet is a full-stack hyperlocal fashion delivery platform. This guide walks you through every step to get it running.

---

## STEP 1: Set Up External Services (Do this first!)

### 1.1 MongoDB Atlas (Database)
1. Go to https://cloud.mongodb.com → Sign up free
2. Create a new cluster (M0 Free tier)
3. Create a database user (Settings → Database Access)
4. Allow all IPs (Network Access → Add 0.0.0.0/0)
5. Click "Connect" → "Connect your application"
6. Copy the URI: `mongodb+srv://user:pass@cluster.mongodb.net/clozet`
7. Add to backend `.env` as `MONGODB_URI`

### 1.2 Firebase (Phone OTP Authentication)
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable "Authentication" → "Phone" provider
4. In Project Settings → "Your apps" → Add a Web App
5. Copy the firebaseConfig values to frontend `.env`
6. For backend: Project Settings → Service Accounts → Generate new private key
7. Download the JSON and extract `project_id`, `private_key`, `client_email` to backend `.env`

**Enable Google Sign-In:**
1. Authentication → Sign-in method → Google → Enable
2. Copy the Web Client ID to both `.env` files as `GOOGLE_CLIENT_ID`

### 1.3 Cloudinary (Image Storage)
1. Sign up at https://cloudinary.com
2. Dashboard gives you Cloud Name, API Key, API Secret
3. Add to backend `.env`

### 1.4 Razorpay (Payments)
1. Sign up at https://razorpay.com
2. Settings → API Keys → Generate Key
3. Copy Key ID and Secret to backend `.env`
4. For split payments: create Route (Razorpay X) and link store owner accounts
5. Add Key ID to frontend `.env` as `VITE_RAZORPAY_KEY_ID`

### 1.5 Google Maps (for live tracking UI)
1. Go to https://console.cloud.google.com
2. Enable "Maps JavaScript API" and "Geocoding API"
3. Create API Key with referrer restrictions
4. Add to frontend `.env` as `VITE_GOOGLE_MAPS_KEY`

---

## STEP 2: Backend Setup

```bash
cd clozet/backend
npm install
cp .env.example .env
# Fill in all your keys
npm run dev
```

You should see:
```
🚀 Clozet API running on port 5000
✅ MongoDB Connected: cluster.mongodb.net
```

**Test it:** Open http://localhost:5000/health → should return `{"status":"OK"}`

---

## STEP 3: Frontend Setup

```bash
cd clozet/frontend
npm install
cp .env.example .env
# Fill in your keys
npm run dev
```

Open http://localhost:5173 → you should see the login page.

---

## STEP 4: Install firebase package (needed for OTP)

```bash
# In frontend/
npm install firebase
```

---

## STEP 5: Add Image Upload to Backend

Install multer-cloudinary:
```bash
cd backend
npm install multer multer-storage-cloudinary
```

Add to `backend/src/config/cloudinary.js`:
```js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'clozet', allowed_formats: ['jpg', 'png', 'webp'] },
});

module.exports = { cloudinary, upload: multer({ storage }) };
```

Add image upload route in `products.js`:
```js
const { upload } = require('../config/cloudinary');

router.post('/upload', protect, upload.array('images', 5), (req, res) => {
  const urls = req.files.map(f => f.path);
  res.json({ urls });
});
```

---

## STEP 6: Add Google Maps to TrackingPage

In `frontend/src/pages/TrackingPage.jsx`, replace the map placeholder with:
```jsx
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Inside component:
const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY });

// Replace the placeholder div with:
{isLoaded && (
  <GoogleMap
    center={partnerLocation || { lat: 28.6, lng: 77.2 }}
    zoom={14}
    mapContainerStyle={{ width: '100%', height: '100%' }}
  >
    {partnerLocation && <Marker position={partnerLocation} label="🛵" />}
  </GoogleMap>
)}
```

---

## STEP 7: Seed Sample Data (optional but recommended for dev)

Create `backend/src/scripts/seed.js`:
```js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Store = require('../models/Store');
const Product = require('../models/Product');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Create a test store owner
  const owner = await User.create({ name: 'Test Owner', phone: '+919999999999', role: 'store_owner' });

  // Create a store in Delhi
  const store = await Store.create({
    owner: owner._id,
    name: 'FashionHub Delhi',
    category: 'clothing',
    location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    expressDeliveryAvailable: true,
    expressDeliveryMinutes: 45,
    isVerified: true,
  });

  // Create sample products
  await Product.create([
    { store: store._id, name: 'Floral Kurti', category: 'clothing', gender: 'women', basePrice: 799, isTrending: true, variants: [{ size: 'S', color: 'Pink', stock: 10 }, { size: 'M', color: 'Pink', stock: 5 }] },
    { store: store._id, name: 'Slim Fit Jeans', category: 'clothing', gender: 'men', basePrice: 1299, variants: [{ size: '30', color: 'Blue', stock: 8 }] },
  ]);

  console.log('✅ Seeded!');
  process.exit();
});
```

Run: `node src/scripts/seed.js`

---

## STEP 8: Deployment

### Deploy Backend to Render
1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo → select `backend/`
4. Build: `npm install` | Start: `npm start`
5. Add all environment variables in Render dashboard
6. Get your URL: `https://clozet-api.onrender.com`

### Deploy Frontend to Vercel
1. Go to https://vercel.com → New Project
2. Connect GitHub repo → select `frontend/`
3. Add environment variables
4. Set `VITE_API_URL=https://clozet-api.onrender.com/api`
5. Deploy!

---

## STEP 9: What's Already Built ✅

| Feature | Status |
|---|---|
| Phone OTP login (Firebase) | ✅ Wired up |
| Google OAuth login | ✅ Wired up |
| User profile setup | ✅ |
| Location-based store discovery | ✅ |
| Product browsing with filters | ✅ |
| Store-wise browsing | ✅ |
| Product detail page | ✅ |
| Add to cart / wishlist | ✅ |
| Checkout with address | ✅ |
| Razorpay payment + split | ✅ |
| COD support | ✅ |
| Order creation & management | ✅ |
| Live order tracking (Socket.IO) | ✅ |
| Order status updates | ✅ |
| Order history | ✅ |
| Exchange requests | ✅ |
| Search (products + stores) | ✅ |
| Review/rating system | ✅ |

---

## STEP 10: Features to Add Next

### Store Owner Dashboard
Create `/frontend/src/pages/store-owner/Dashboard.jsx` with:
- Add/edit products with image upload
- Manage inventory
- View and accept incoming orders
- Update order status

### Delivery Partner App
Create separate screens for delivery partners:
- Accept pickup requests
- Update location via Socket.IO
- Mark delivered

### Push Notifications
Use Firebase Cloud Messaging (FCM):
- Save `fcmToken` on user (already in User model)
- Send via `firebase-admin` on order events

### Wishlist Price Drop Alerts
- Cron job (node-cron) to check price changes
- Notify users whose wishlist items dropped in price

### Coupon System
Add `Coupon` model:
```js
{ code, discount, type: 'percent'|'flat', minOrder, maxUses, validUntil }
```

---

## Architecture Diagram

```
Customer App (React/Vite)
        │
        ├── REST API ──→ Express/Node.js ──→ MongoDB
        │
        └── Socket.IO ──→ Real-time tracking

Services:
  Firebase ──→ OTP Auth
  Cloudinary ──→ Product Images
  Razorpay ──→ Payments + Split
  Google Maps ──→ Location & Tracking
```

---

## Folder Reference

```
clozet/
├── backend/
│   └── src/
│       ├── index.js           Main server
│       ├── config/db.js       MongoDB
│       ├── models/            User, Store, Product, Order, Cart, Wishlist
│       ├── routes/            auth, users, stores, products, orders, cart, wishlist, search, tracking, reviews
│       ├── middleware/auth.js  JWT protect
│       └── services/          Socket.IO handler
└── frontend/
    └── src/
        ├── pages/             All page components
        ├── components/        ProductCard, StoreCard, Layout
        ├── store/             Zustand: authStore, cartStore
        └── utils/             api.js (axios), firebase.js
```
