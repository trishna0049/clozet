# 🛍️ Clozet — Hyperlocal Fashion Delivery Platform

> **Fashion, Delivered in Minutes.**
> Clozet connects customers with nearby clothing stores, enabling them to browse, order, and receive fashion within the hour.

---

## 📋 Table of Contents

- [What is Clozet?](#-what-is-clozet)
- [How It Works](#-how-it-works)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Store Owner Dashboard](#-store-owner-dashboard)
- [Deployment](#-deployment)

---

## 💡 What is Clozet?

Clozet is a **hyperlocal fashion e-commerce platform** — think Zomato, but for fashion. It gives customers real-time access to local store inventories, personalized product recommendations, and express same-day delivery — all within a 15 km radius.

| Feature | Description |
|---|---|
| 🗺️ Hyperlocal | Discover stores within 15 km of your location |
| ⚡ Express Delivery | Order delivered in under 60 minutes |
| 🏪 Two Browse Modes | Shop by product or by store |
| 💳 Smart Payments | UPI, cards, wallets, COD — auto split via Razorpay |
| 📍 Live Tracking | Real-time order status via Socket.IO |
| 🔔 Wishlist Alerts | Price drop and restock notifications |

---

## 🔄 How It Works

```
Customer Journey
────────────────────────────────────────────────────────────
  1. Sign Up      →  OTP (mobile/email) or Google Login
  2. Set Location →  Allow location → finds stores within 15 km
  3. Browse       →  Products feed OR store-by-store
  4. Add to Cart  →  Pick size, colour, quantity (live stock shown)
  5. Checkout     →  Express delivery + Razorpay / COD
  6. Track Live   →  Real-time status updates via Socket.IO
────────────────────────────────────────────────────────────
```

---

## ✨ Features

### 1. Onboarding & Login

- **OTP verification** via mobile number or email
- **Google Sign-In** (one-tap, no OTP needed)
- Profile setup: name, gender, date of birth
- Location permission → auto-detects nearby stores within **15 km**

---

### 2. Homepage / Feed

- Personalised feed: **trending items** + **featured collections**
- Nearby store carousel with distance and open/closed badge
- Two prominent browse mode cards to switch between product and store views

---

### 3. Two Modes of Browsing

#### 👗 Product-wise Browsing (`/products`)
Users scroll a curated product grid across **all nearby stores**. Each card shows:
- Product image, name, price
- Store name displayed below the product
- Estimated delivery time badge

#### 🏪 Store-wise Browsing (`/stores`)
Users pick a store first, then see **only that store's live inventory**. Ideal for customers with preferred retailers like H&M or FabIndia.

---

### 4. Search & Filters

- **Keyword search** across product names, tags, and brands — debounced, updates as you type
- **Filters:**
  - Size, colour, price range
  - Category, store, availability
- **Sort by:** Trending · Newest · Price ↑ · Price ↓

---

### 5. Product Page

- Multiple high-quality images with thumbnail switcher
- **Real-time inventory** — only available sizes and colours shown
- Material details and care instructions
- Delivery time estimate based on user's current location
- **Add to Cart** and **Add to Wishlist**
- Average rating + review count from verified purchases

---

### 6. Cart & Checkout

#### Cart Review
- Item details: name, size, colour, quantity (with `+` / `−` controls)
- Estimated delivery time per item
- Delivery fee + coupon/discount field
- Live-updating total

#### Delivery
- ⚡ **Express Delivery** — dispatched immediately, arrives in under 60 minutes

#### Payment Options

| Method | Details |
|---|---|
| UPI / QR | Google Pay, PhonePe, Paytm, any UPI app |
| Credit / Debit Card | Visa, Mastercard, RuPay via Razorpay |
| Digital Wallets | Paytm, PhonePe, Amazon Pay |
| Cash on Delivery | Pay when the package arrives |
| Razorpay Split | Platform commission + store share split automatically |

**How Razorpay Split Works:**
1. Customer pays once via their preferred method
2. Funds land in Clozet's master Razorpay account
3. Razorpay automatically routes each store's share to their linked account
4. Clozet retains its platform commission — zero manual reconciliation

#### Order Confirmation
- Confirmation screen with order ID + delivery estimate
- Email and SMS sent immediately

---

### 7. Live Order Tracking (`/track/:orderId`)

Powered by **Socket.IO** — the page updates automatically without refresh.

```
Order Placed  →  Order Accepted  →  Picked Up  →  Out for Delivery  →  Delivered
     ●               ●                  ●                ●                 ✓
```

| Status | What It Means |
|---|---|
| Order Placed | Order received in the system |
| Order Accepted | Store confirmed and is preparing your order |
| Picked Up | Delivery partner collected from the store |
| Out for Delivery | On its way to you right now |
| Delivered | Package handed over — enjoy! |

- 🗺️ Map view showing delivery partner's live location
- 📞 One-tap button to call the delivery partner

---

### 8. Post-Purchase

- Rate **product quality**, fit, and accuracy after delivery
- Rate the **store** and **delivery experience** separately
- **Exchanges** per store policy (e.g., 7-day exchange window)
- Exchange pickup arranged directly through the website
- **Wishlist notifications**: price drop and restock alerts

---

### 9. Account Section

| Tab | What You Can Do |
|---|---|
| Profile | Edit name, gender, DOB, preferences |
| Orders | Full order history with reorder option |
| Addresses | Add / edit / set default delivery addresses |
| Payment Methods | Saved cards and UPI for faster checkout |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite + TailwindCSS | UI, routing, styling |
| State Management | Zustand | Cart, auth, location stores |
| Backend | Node.js + Express | REST API server |
| Database | MongoDB + Mongoose | Products, orders, users, stores |
| Auth | JWT + Google OAuth 2.0 | Secure login sessions |
| Payments | Razorpay (split payments) | UPI, cards, wallets, auto-split |
| Real-time | Socket.IO | Live order tracking updates |
| Image Storage | Cloudinary | Product and store images |
| SMS | Twilio | OTP delivery via SMS |
| Email | Nodemailer | OTP + order confirmations |
| Maps | Google Maps API | Location & delivery tracking |
| Data Fetching | React Query | Server state, caching, pagination |

---

## 📁 Project Structure

```
clozet/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   │   ├── LandingPage.jsx      # Public landing
│   │   │   │   ├── LoginPage.jsx        # OTP + Google login
│   │   │   │   ├── OTPPage.jsx          # 6-digit OTP verify
│   │   │   │   ├── ProfileSetup.jsx     # Name, gender, DOB
│   │   │   │   ├── HomePage.jsx         # Personalised feed
│   │   │   │   ├── ProductBrowse.jsx    # All products grid
│   │   │   │   ├── StoreBrowse.jsx      # Nearby stores grid
│   │   │   │   ├── StoreDetail.jsx      # Single store + products
│   │   │   │   ├── ProductDetail.jsx    # Product page
│   │   │   │   ├── CartPage.jsx         # Cart review
│   │   │   │   ├── CheckoutPage.jsx     # Address + payment
│   │   │   │   ├── OrderTracking.jsx    # Live tracking
│   │   │   │   ├── OrderHistory.jsx     # Past orders
│   │   │   │   ├── WishlistPage.jsx     # Saved products
│   │   │   │   ├── SearchPage.jsx       # Search + filters
│   │   │   │   └── AccountPage.jsx      # Profile & settings
│   │   │   ├── store/
│   │   │   │   ├── StoreLogin.jsx
│   │   │   │   ├── StoreDashboard.jsx
│   │   │   │   ├── StoreInventory.jsx
│   │   │   │   └── StoreOrders.jsx
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Navbar.jsx           # Sticky nav + cart icon
│   │   │       └── ProductCard.jsx      # Reusable product card
│   │   ├── store/
│   │   │   ├── authStore.js             # JWT + user (Zustand)
│   │   │   ├── cartStore.js             # Cart items (Zustand)
│   │   │   └── locationStore.js         # Coords + address (Zustand)
│   │   ├── services/
│   │   │   └── api.js                   # All Axios API calls
│   │   ├── App.jsx                      # Router + route guards
│   │   └── main.jsx                     # Entry point
│   ├── .env.example
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js                  # Customer + store owner
│   │   │   ├── Store.js                 # Store with geolocation
│   │   │   ├── Product.js               # Inventory, sizes, colours
│   │   │   ├── Order.js                 # Order lifecycle
│   │   │   └── Review.js                # Ratings per order
│   │   ├── controllers/
│   │   │   ├── authController.js        # OTP, Google, profile
│   │   │   ├── productController.js     # CRUD + search
│   │   │   ├── storeController.js       # Nearby + store products
│   │   │   ├── orderController.js       # Place, track, update
│   │   │   └── paymentController.js     # Razorpay create + verify
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── stores.js
│   │   │   ├── orders.js
│   │   │   ├── payments.js
│   │   │   ├── wishlist.js
│   │   │   ├── reviews.js
│   │   │   └── admin.js
│   │   ├── middleware/
│   │   │   └── auth.js                  # JWT guard + role check
│   │   ├── config/
│   │   │   └── db.js                    # MongoDB connection
│   │   └── server.js                    # Express + Socket.IO entry
│   └── .env.example
│
└── docs/
    └── SETUP_GUIDE.md                   # Full implementation guide
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free)
- Accounts for: Google Cloud, Razorpay, Cloudinary *(see `docs/SETUP_GUIDE.md`)*

### 1. Clone & Install

```bash
# Backend
cd clozet/backend
npm install
cp .env.example .env       # Fill in your keys

# Frontend
cd clozet/frontend
npm install
cp .env.example .env       # Fill in your keys
```

### 2. Run Locally

```bash
# Terminal 1 — Backend
cd clozet/backend
npm run dev
# → "Clozet API running on port 5000"
# → "MongoDB connected"

# Terminal 2 — Frontend
cd clozet/frontend
npm run dev
# → Visit http://localhost:5173
```

> **Note:** In development, OTPs are printed to the backend console instead of being sent via SMS/email.

---

## 🔐 Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/clozet

JWT_SECRET=your_secret_key_here

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your_auth_token
TWILIO_FROM=+1xxxxxxxxxx

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/send-otp` | ❌ | Request OTP to mobile or email |
| `POST` | `/api/auth/verify-otp` | ❌ | Verify OTP → receive JWT |
| `POST` | `/api/auth/google` | ❌ | Google OAuth login |
| `PUT` | `/api/auth/profile` | ✅ | Complete profile setup |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `GET` | `/api/products` | ❌ | List products (filter + sort + paginate) |
| `GET` | `/api/products/search` | ❌ | Full-text product search |
| `GET` | `/api/products/:id` | ❌ | Single product detail |
| `POST` | `/api/products` | 🏪 Store | Create product |
| `PUT` | `/api/products/:id` | 🏪 Store | Update product |
| `DELETE` | `/api/products/:id` | 🏪 Store | Delete product |
| `GET` | `/api/stores/nearby` | ❌ | Stores within radius |
| `GET` | `/api/stores/:id` | ❌ | Store detail |
| `GET` | `/api/stores/:id/products` | ❌ | All products from a store |
| `POST` | `/api/orders` | ✅ | Place an order |
| `GET` | `/api/orders/me` | ✅ | Customer's order history |
| `GET` | `/api/orders/:id` | ✅ | Single order detail |
| `PUT` | `/api/orders/:id/status` | 🏪 Store | Update order status (triggers Socket.IO) |
| `POST` | `/api/payments/create-order` | ✅ | Initiate Razorpay payment |
| `POST` | `/api/payments/verify` | ✅ | Verify Razorpay signature |
| `GET` | `/api/wishlist` | ✅ | Get wishlist items |
| `POST` | `/api/wishlist` | ✅ | Add product to wishlist |
| `DELETE` | `/api/wishlist/:id` | ✅ | Remove from wishlist |
| `GET` | `/api/admin/stats` | 👑 Admin | Platform stats |
| `PUT` | `/api/admin/stores/:id/verify` | 👑 Admin | Verify a store |

---

## 🏪 Store Owner Dashboard

Stores get a **dedicated dashboard** separate from the customer app, accessible at `/store/*`.

| Page | Route | What It Does |
|---|---|---|
| Store Login | `/store/login` | Separate login with `role: store` |
| Dashboard | `/store/dashboard` | Overview stats |
| Inventory | `/store/inventory` | Add / edit / remove products with Cloudinary image upload |
| Orders | `/store/orders` | Real-time incoming orders via Socket.IO |

**Real-time Order Flow (Store side):**
```
Customer places order
      ↓
Socket.IO emits 'newOrder' to store's dashboard
      ↓
Store clicks Accept → Picked Up → Out for Delivery → Delivered
      ↓
Each status change emits 'orderStatusUpdate' to customer's tracking page
```

---

## 🌐 Deployment

### Backend → Render

1. Push `clozet/backend` to GitHub
2. [render.com](https://render.com) → New Web Service → connect repo
3. Root directory: `clozet/backend`
4. Build: `npm install` | Start: `node src/server.js`
5. Add all environment variables in Render dashboard

### Frontend → Vercel

1. Push `clozet/frontend` to GitHub
2. [vercel.com](https://vercel.com) → New Project → connect repo
3. Root directory: `clozet/frontend` | Framework: Vite
4. Add `VITE_*` environment variables
5. Update `VITE_SOCKET_URL` to your Render backend URL

### Post-Deploy Checklist
- [ ] Update `CLIENT_URL` in backend `.env` to your Vercel URL
- [ ] Add Vercel URL to Google OAuth Authorized Origins
- [ ] Set MongoDB Atlas IP Whitelist to `0.0.0.0/0`
- [ ] Switch Razorpay from test keys to live keys

---

## 🐛 Common Issues

| Problem | Fix |
|---|---|
| CORS error | `CLIENT_URL` in backend `.env` must exactly match frontend URL (no trailing slash) |
| OTP not received | In dev, OTP is logged to backend terminal — check there first |
| Location not working | Browser needs HTTPS for geolocation; works automatically on Vercel |
| Razorpay not opening | Ensure `VITE_RAZORPAY_KEY_ID` is set and dev server restarted |
| MongoDB connection failed | Atlas → Network Access → Add `0.0.0.0/0` for development |
| Socket.IO not connecting | `VITE_SOCKET_URL` must point to backend; CORS must include frontend URL |

---

## 📄 License

Built for portfolio/internship purposes. All rights reserved.

---

<p align="center">Made with ❤️ · React · Node.js · MongoDB · Razorpay · Socket.IO</p>
