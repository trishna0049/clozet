# Clozet – Complete Implementation Guide

## Overview
This guide walks you through setting up and fully implementing Clozet from scratch. Follow each phase in order.

---

## PHASE 1: Prerequisites & Accounts to Create

Before touching code, create these free accounts:

### 1.1 MongoDB Atlas (Database)
1. Go to https://cloud.mongodb.com → Sign up free
2. Create a new Cluster (free tier M0)
3. Click "Connect" → "Connect your application" → copy the connection string
4. Replace `<password>` with your DB user password
5. Save as: `MONGO_URI=mongodb+srv://...`

### 1.2 Google Cloud Console (OAuth + Maps)
1. Go to https://console.cloud.google.com
2. Create new project → "Clozet"
3. APIs & Services → Enable:
   - Google Maps JavaScript API
   - Maps Geocoding API
4. Credentials → Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
5. Copy Client ID → save as `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`

### 1.3 Razorpay (Payments)
1. Go to https://razorpay.com → Sign up
2. Dashboard → Settings → API Keys → Generate Test Keys
3. Save Key ID as `RAZORPAY_KEY_ID` and `VITE_RAZORPAY_KEY_ID`
4. Save Key Secret as `RAZORPAY_KEY_SECRET`
5. For split payments: Settings → Route → Create linked accounts for stores

### 1.4 Cloudinary (Image Storage)
1. Go to https://cloudinary.com → Sign up free
2. Dashboard → Copy Cloud Name, API Key, API Secret
3. Create an upload preset: Settings → Upload → Add upload preset → name it "clozet_products"

### 1.5 Twilio (SMS OTP) — Optional for dev
1. Go to https://twilio.com → Sign up
2. Get a free phone number
3. Copy Account SID, Auth Token, phone number

### 1.6 Gmail App Password (Email OTP)
1. Google Account → Security → 2-Step Verification → App passwords
2. Create app password for "Mail"
3. Save as `EMAIL_USER` and `EMAIL_PASS`

---

## PHASE 2: Local Setup

### 2.1 Install Node.js
Download Node.js 20+ from https://nodejs.org

### 2.2 Set Up Backend
```bash
cd clozet/backend
npm install
cp .env.example .env
# Fill in .env with all your keys from Phase 1
```

### 2.3 Set Up Frontend
```bash
cd clozet/frontend
npm install
cp .env.example .env
# Fill in VITE_ keys
```

### 2.4 Run Both Servers
Terminal 1 (backend):
```bash
cd clozet/backend
npm run dev
# Should print: "Clozet API running on port 5000" + "MongoDB connected"
```

Terminal 2 (frontend):
```bash
cd clozet/frontend
npm run dev
# Visit http://localhost:5173
```

---

## PHASE 3: Implement Remaining Pages

The following pages are provided as stubs. Here's what to build in each:

### 3.1 ProductBrowse (`/products`)
- Infinite scroll grid of ProductCard components
- Filter sidebar: category, size, color, price range, store
- Sort dropdown: trending, newest, price asc/desc
- Use `getProducts(params)` API call with react-query

```jsx
// Key pattern:
const [filters, setFilters] = useState({})
const { data, fetchNextPage } = useInfiniteQuery('products', 
  ({ pageParam = 1 }) => getProducts({ ...filters, page: pageParam }),
  { getNextPageParam: (last, all) => all.length + 1 }
)
```

### 3.2 StoreBrowse (`/stores`)
- Grid of store cards showing logo, name, distance, open/closed status
- Location permission → fetch nearby stores via getNearbyStores()
- Click store → go to /stores/:id

### 3.3 StoreDetail (`/stores/:id`)
- Store header: logo, name, rating, exchange policy
- Grid of products from that store only
- Use getStoreProducts(storeId) API call

### 3.4 SearchPage (`/search`)
- Large search input (auto-focus on mount)
- Debounced search: call searchProducts(q) after 300ms
- Show results in product grid
- Recent searches saved to localStorage

```jsx
// Debounce pattern:
const [q, setQ] = useState('')
useEffect(() => {
  const t = setTimeout(() => { if (q.length > 2) searchProducts(q) }, 300)
  return () => clearTimeout(t)
}, [q])
```

### 3.5 WishlistPage (`/wishlist`)
- Fetch wishlist via getWishlist()
- Show ProductCard grid with remove button
- If wishlist empty: show "Save your favourites" empty state

### 3.6 OrderHistory (`/orders`)
- List of past orders via getMyOrders()
- Each card: order ID, date, status badge, total, thumbnail of items
- Click → go to /track/:orderId
- Status badge colors: placed=gray, accepted=blue, out_for_delivery=orange, delivered=green

### 3.7 AccountPage (`/account`)
- Tabs: Profile, Addresses, Payment Methods, Preferences
- Profile: edit name, gender, DOB via setupProfile() API
- Addresses: CRUD saved addresses
- Logout button that calls useAuthStore().logout()

---

## PHASE 4: Store Owner Dashboard

### 4.1 StoreLogin
- Separate login with role='store'
- On first login, redirect to store onboarding (create store form)

### 4.2 StoreInventory
- Table of products with edit/delete
- "Add Product" modal: name, description, price, images (Cloudinary upload), sizes, colors, stock
- Cloudinary upload:
```bash
# Backend: install multer-storage-cloudinary
# Frontend: use FormData + axios to POST /api/products with images
```

### 4.3 StoreOrders  
- Real-time order feed via Socket.IO
- Listen to 'newOrder' events
- Buttons to update status: Accept → Picked → Out for Delivery → Delivered
- When updating: emit status via PUT /api/orders/:id/status
- Input field for delivery partner name and phone

```jsx
useEffect(() => {
  const socket = io(SOCKET_URL)
  socket.emit('joinStoreRoom', storeId)
  socket.on('newOrder', (data) => refetchOrders())
  return () => socket.disconnect()
}, [])
```

---

## PHASE 5: Image Upload with Cloudinary

### 5.1 Backend Setup
```javascript
// backend/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'clozet_products', allowed_formats: ['jpg', 'png', 'webp'] }
})

module.exports = { cloudinary, upload: multer({ storage }) }
```

### 5.2 Add to product route
```javascript
const { upload } = require('../config/cloudinary')
router.post('/', protect, requireRole('store'), upload.array('images', 5), c.createProduct)
// In controller: req.files.map(f => f.path) gives Cloudinary URLs
```

---

## PHASE 6: Real-time Order Tracking

The tracking is already wired up. To test end-to-end:

1. Customer places order → order created in DB
2. Store owner goes to StoreOrders → sees new order
3. Store clicks "Accept" → calls PUT /api/orders/:id/status with `{ status: 'accepted' }`
4. Backend emits `orderStatusUpdate` to room `order:<orderId>`
5. Customer's OrderTracking page receives the event and updates the timeline

To add map tracking, integrate Google Maps:
```jsx
// In OrderTracking.jsx, add a Google Maps iframe or @react-google-maps component
// Update delivery partner location every 30s via socket
socket.on('locationUpdate', ({ lat, lng }) => setDriverLocation({ lat, lng }))
```

---

## PHASE 7: Deployment

### 7.1 Backend → Render
1. Push backend to GitHub
2. https://render.com → New Web Service → connect repo
3. Root directory: `clozet/backend`
4. Build command: `npm install`
5. Start command: `node src/server.js`
6. Add all environment variables in Render dashboard
7. Copy your Render URL (e.g. https://clozet-api.onrender.com)

### 7.2 Frontend → Vercel
1. Push frontend to GitHub
2. https://vercel.com → New Project → connect repo
3. Root directory: `clozet/frontend`
4. Framework preset: Vite
5. Environment variables:
   - `VITE_GOOGLE_CLIENT_ID` = your Google client ID
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay key
   - `VITE_SOCKET_URL` = your Render backend URL
6. Update vite.config.js proxy target to your Render URL

### 7.3 Update CORS
In backend .env: `CLIENT_URL=https://your-app.vercel.app`

### 7.4 Update Google OAuth
In Google Cloud Console → OAuth credentials → add your Vercel URL to Authorized Origins

---

## PHASE 8: Testing Checklist

Before going live:

- [ ] OTP flow works (check console logs in dev)
- [ ] Google login works
- [ ] Profile setup saves and redirects
- [ ] Location permission and nearby stores show up
- [ ] Add product to cart → quantity updates in navbar
- [ ] Checkout with Razorpay test card: 4111 1111 1111 1111
- [ ] Order created → appears in /orders
- [ ] Order status can be updated from store dashboard
- [ ] Socket.IO live update works (open two browser tabs)
- [ ] Wishlist add/remove works
- [ ] Search returns relevant products
- [ ] Review submission works after delivery

---

## PHASE 9: Razorpay Split Payments (Advanced)

For auto-splitting payment between Clozet platform fee and store:

1. Store onboarding: collect store's bank details
2. Create Razorpay linked account for each store
3. Store linked account ID in Store model (`razorpayAccountId`)
4. When creating Razorpay order, use Route API:
```javascript
const order = await razorpay.orders.create({
  amount: totalAmount * 100,
  currency: 'INR',
  transfers: [{
    account: store.razorpayAccountId,
    amount: storeShare * 100,  // amount after your commission
    currency: 'INR',
  }]
})
```

---

## API Reference Quick Sheet

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/send-otp | No | Send OTP |
| POST | /api/auth/verify-otp | No | Verify OTP + get token |
| POST | /api/auth/google | No | Google login |
| PUT | /api/auth/profile | Yes | Set up profile |
| GET | /api/products | No | List products |
| GET | /api/products/search | No | Search products |
| GET | /api/products/:id | No | Product detail |
| POST | /api/products | store | Create product |
| GET | /api/stores/nearby | No | Nearby stores |
| GET | /api/stores/:id | No | Store detail |
| GET | /api/stores/:id/products | No | Store products |
| POST | /api/orders | Yes | Place order |
| GET | /api/orders/me | Yes | My orders |
| GET | /api/orders/:id | Yes | Order detail |
| PUT | /api/orders/:id/status | store | Update status |
| POST | /api/payments/create-order | Yes | Razorpay order |
| POST | /api/payments/verify | Yes | Verify payment |
| GET | /api/wishlist | Yes | Get wishlist |
| POST | /api/wishlist | Yes | Add to wishlist |
| DELETE | /api/wishlist/:id | Yes | Remove from wishlist |
| GET | /api/admin/stats | admin | Platform stats |

---

## Common Issues & Fixes

**"CORS error"**
→ Make sure CLIENT_URL in backend .env exactly matches your frontend URL (no trailing slash)

**"OTP not received"**  
→ In development, OTP is logged to backend console. Check terminal.

**"Location not working"**
→ Browser requires HTTPS for geolocation in production. Vercel deploys with HTTPS automatically.

**"Razorpay checkout not opening"**
→ Make sure VITE_RAZORPAY_KEY_ID is set in frontend .env. Restart dev server after changing .env.

**"MongoDB connection failed"**
→ Check Atlas IP whitelist: Network Access → Add IP → Allow from anywhere (0.0.0.0/0) for dev.

**Socket.IO not connecting**
→ Check VITE_SOCKET_URL points to your backend. CORS in server.js must include your frontend URL.
