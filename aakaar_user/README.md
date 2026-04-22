# Aakaar

Print-first fashion commerce built with Next.js, Supabase, Tailwind CSS, and Cloudinary.

## Core product idea

Most fashion stores start with products.
Aakaar starts with prints.

The shopping flow is:

1. Browse prints.
2. Click a print.
3. Explore multiple silhouettes in that exact print.
4. Open a product without losing the print context.
5. Jump back into other styles in the same print.

This is the main UX differentiator and the codebase is organized around it.

## Stack

- Frontend: Next.js App Router + Tailwind CSS + local cart/wishlist state
- App layer: Next.js App Router + Supabase SSR helpers
- Database: Supabase Postgres
- Media layer: Cloudinary
- Seed source: `shared/catalog.json`

## Folder structure

```text
aakaar/
├─ backend/
│  ├─ .env.example
│  ├─ package.json
│  └─ src/
│     ├─ auth.js
│     ├─ models.js
│     ├─ routes.js
│     ├─ seed.js
│     └─ server.js
├─ frontend/
│  ├─ .env.example
│  ├─ package.json
│  ├─ next.config.js
│  ├─ postcss.config.js
│  ├─ tailwind.config.ts
│  ├─ tsconfig.json
│  └─ src/
│     ├─ app/
│     ├─ components/
│     ├─ lib/
│     └─ types/
├─ shared/
│  └─ catalog.json
├─ package.json
└─ README.md
```

## What is already built

### Frontend

- Home page with hero, featured prints, shop-by-print section, trending silhouettes, new arrivals, reviews, and gallery
- Print-first shop page that shows prints instead of products
- Print detail page with all silhouettes available inside the selected print
- Product page with image gallery, size selector, fabric/fit/details, add to cart, wishlist, and "View other styles in this print"
- Cart page with quantity editing and same-print cross-sell direction
- Minimal checkout page with payment placeholder
- Account page with login/signup UI, recent orders, wishlist, and saved addresses

### Backend

- Supabase-backed prints, products, and product image relations
- Shared catalog seeding from `shared/catalog.json` into Supabase
- Supabase Auth-ready account flow
- Cloudinary signed upload route scaffold for future image management

## Database design

### `prints`

- `id`
- `slug`
- `name`
- `category`
- `image`
- `bannerImage`
- `description`
- `mood`
- `palette`
- `dropNote`
- `limitedLeft`
- `bestseller`
- `featured`

### `products`

- `print`
- `printId`
- `slug`
- `silhouette`
- `title`
- `price`
- `sizes`
- `images`
- `fabric`
- `description`
- `fit`
- `details`
- `inventory`
- `badge`

### `users`

- `name`
- `email`
- `password`
- `wishlist`
- `savedAddresses`

### `orders`

- `user`
- `items`
- `shippingAddress`
- `total`
- `status`
- `paymentMethod`
- `paymentStatus`

## API summary

### Health

- `GET /api/health`

### Prints

- `GET /api/prints`
- `GET /api/prints?category=Floral`
- `GET /api/prints?featured=true`
- `GET /api/prints/:slug`

### Products

- `GET /api/products`
- `GET /api/products?printId=print-floral-garden`
- `GET /api/products/:slug`
- `GET /api/products/recommendations/:slug`

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Orders

- `GET /api/orders`
- `POST /api/orders`

## Step-by-step implementation guide

If you want to rebuild or extend this in a clean sequence, follow this order:

1. Define the shared fashion content model in `shared/catalog.json`.
2. Create the print collection first, then map silhouettes to each print using `printId`.
3. Build the home page around the idea of print discovery, not standard product browsing.
4. Build the shop page so print cards are the first clickable commerce objects.
5. Build the print detail page to list every silhouette inside the selected print.
6. Build the product page and keep the "other styles in this print" section highly visible.
7. Add cart and checkout flows after the print-to-silhouette journey feels right.
8. Add account, wishlist, and order history once the core buying path is stable.
9. Add the backend API and seed it from the same shared catalog file.
10. Add recommendations based on print affinity first, then later improve with user behavior and purchase history.

## Local setup

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Configure environment variables

Create this file:

- `frontend/.env.local`

Use:

```env
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3. Seed Supabase

```bash
npm run seed
```

This seeds the sample print and product catalog into Supabase. Product images are optional and can be added later from Cloudinary.

### 4. Run the app

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Cloudinary signature route: `http://localhost:3000/api/cloudinary/signature`

## How to add or change product images, descriptions, prices, and prints

Everything starts in `shared/catalog.json`.

### Change a print

Edit the matching object inside the `prints` array.

You can change:

- `name`
- `category`
- `image`
- `bannerImage`
- `description`
- `palette`
- `dropNote`
- `limitedLeft`
- `bestseller`
- `featured`

### Change a product

Edit the matching object inside the `products` array.

You can change:

- `title`
- `silhouette`
- `price`
- `sizes`
- `images`
- `fabric`
- `description`
- `fit`
- `details`
- `inventory`
- `badge`

### Add a new print

1. Add a new object inside `prints`.
2. Give it a unique `id` like `print-indigo-garden`.
3. Give it a unique `slug` like `indigo-garden`.
4. Add at least 2 to 5 matching products inside `products` using that same `printId`.
5. Rerun:

```bash
npm run seed
```

### Add a new silhouette to an existing print

1. Find the print's `id`.
2. Add a new product object in `products`.
3. Set `printId` to that print's `id`.
4. Add the product's image URLs, sizes, price, and copy.
5. Rerun the seed command.

### Change product images

There are 2 good options:

#### Option 1: Use remote image URLs

Update the `images` array directly:

```json
"images": [
  "https://your-image-1.jpg",
  "https://your-image-2.jpg",
  "https://your-image-3.jpg"
]
```

Recommended image order:

1. Model shot
2. Flat lay
3. Fabric close-up

#### Option 2: Use local images

1. Create a folder like `frontend/public/images/products/`.
2. Add your image files there.
3. Reference them like:

```json
"images": [
  "/images/products/floral-garden-corset-model.jpg",
  "/images/products/floral-garden-corset-flatlay.jpg",
  "/images/products/floral-garden-corset-detail.jpg"
]
```

This is usually the best long-term option for a production store because you control filenames and optimization more easily.

### Change product descriptions

Update:

- `description` for the main marketing copy
- `fit` for fit guidance
- `details` for bullet-style attributes
- `fabric` for material information

### Change pricing

Update the `price` field directly in the product object.

Suggested pricing ranges already reflected in the sample structure:

- Tops: `600` to `1000`
- Dresses: `1000` to `1800`
- Co-ords: `1200` to `2000`

## How the print-first recommendation logic works

Right now the recommendation layer is intentionally simple and scalable:

1. Show more silhouettes from the same print first.
2. Then show products from prints in the same print category.

This is the right first version for Aakaar because the main shopper intent is print affinity, not broad category shopping.

## Deployment steps

### Frontend deployment

Best fit: Vercel

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Set the root to `frontend` or deploy the monorepo with the frontend workspace selected.
4. Add the same Supabase and Cloudinary environment variables from `frontend/.env.local`.
5. Deploy.

## Recommended next improvements

If you want to keep scaling this:

1. Replace local cart state with authenticated server-side carts.
2. Add Razorpay or Stripe payment confirmation flow.
3. Add CMS or admin panel support for print drops.
4. Add image upload storage with Cloudinary or S3.
5. Add event tracking to learn which prints convert best across silhouettes.
6. Add inventory deduction and low-stock alerts.
7. Add creator campaign pages for each print launch.
