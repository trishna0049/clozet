# Complete Guide: Upload Images to Cloudinary & Link in Aakaar

## Overview

**The Flow:**
```
1. Upload image to Cloudinary
2. Get the image URL from Cloudinary
3. Store that URL in Supabase database (or catalog.json)
4. Frontend fetches and displays the image
```

You're **NOT** storing images in Supabase. Supabase stores the **image URLs**, and Cloudinary stores the actual images.

---

## Step 1: Understanding the Current Setup

### What You Have:
- ✅ Cloudinary account configured
- ✅ API keys already in `.env`
- ✅ Signed upload API route ready at `/api/cloudinary/signature`
- ✅ Current images are from Unsplash (placeholder)

### Environment Variables Already Set:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=di67gryqm
CLOUDINARY_API_KEY=187877154644197
CLOUDINARY_API_SECRET=emyVuUVz5BSqCtG1sRAqoDgyN68
CLOUDINARY_UPLOAD_PRESET=ml_default
```

---

## Step 2: Where Images Are Stored

### Two Options:

#### **Option A: catalog.json (Current - For Prints/Products)**
```json
{
  "prints": [
    {
      "slug": "floral-garden",
      "image": "https://res.cloudinary.com/di67gryqm/image/upload/v1234567890/aakaar/print-floral.jpg",
      "bannerImage": "https://res.cloudinary.com/di67gryqm/image/upload/v1234567890/aakaar/banner-floral.jpg"
    }
  ]
}
```

#### **Option B: Supabase Database (For User-Uploaded Images)**
Tables you might create:
- `profile_images` (user avatar images)
- `review_images` (customer review photos)

---

## Step 3: Upload Images to Cloudinary

### Method 1: Manual Upload via Cloudinary Dashboard (Easiest for Admin)

1. **Go to Cloudinary Console:**
   - Visit: https://cloudinary.com/console
   - Login with your account

2. **Upload Images:**
   - Click "Media Library"
   - Click "Upload" button
   - Select image file
   - Choose folder: `aakaar` (creates if doesn't exist)
   - Click "Upload"

3. **Get Image URL:**
   - Click on uploaded image
   - Copy the "Secure URL" (starts with `https://res.cloudinary.com/...`)
   - Example: `https://res.cloudinary.com/di67gryqm/image/upload/v1234567890/aakaar/print-name.jpg`

4. **Replace URLs in catalog.json:**
   ```json
   "image": "https://res.cloudinary.com/di67gryqm/image/upload/v1234567890/aakaar/floral-garden.jpg"
   ```

---

### Method 2: Upload via API (For Application)

You can create an upload component for your app:

#### **Create Image Upload Component**

```typescript
// frontend/src/components/image-upload.tsx
"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onSuccess={(result: any) => {
        const url = result.info.secure_url;
        console.log("✅ Image uploaded:", url);
        onUpload(url);
      }}
      onError={() => {
        console.error("❌ Upload failed");
      }}
    >
      {({ open }) => (
        <button
          onClick={() => open()}
          className="px-4 py-2 bg-cocoa text-cream rounded-lg"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      )}
    </CldUploadWidget>
  );
}
```

#### **Install next-cloudinary:**
```bash
cd frontend
npm install next-cloudinary
```

---

## Step 4: Store Image URLs in Supabase

### Current Database Structure

**For Prints (in catalog.json → seeded to Supabase):**
```sql
-- prints table
| id | slug | name | image | bannerImage | ...
|print-floral|floral-garden|Floral Garden|https://cloudinary.../floral.jpg|...
```

**For Products (in catalog.json → seeded to Supabase):**
```sql
-- products table
| id | slug | printId | title | image | ...
|prod-floral-corset|floral-garden-corset|print-floral|Floral Garden Corset|https://cloudinary.../corset.jpg|...
```

### Option: Create User-Specific Image Tables

If users upload their own images (profile picture, review photos):

```sql
-- User Profile Images
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  avatar_image_url TEXT,  -- Cloudinary URL
  cover_image_url TEXT,   -- Cloudinary URL
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Review Images
CREATE TABLE review_images (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews(id),
  image_url TEXT,  -- Cloudinary URL
  uploaded_at TIMESTAMP
);
```

---

## Step 5: Update Catalog & Sync to Supabase

### Step A: Update shared/catalog.json

```json
{
  "prints": [
    {
      "id": "print-floral-garden",
      "slug": "floral-garden",
      "name": "Floral Garden",
      "image": "https://res.cloudinary.com/di67gryqm/image/upload/v1713456789/aakaar/print-floral-garden.jpg",
      "bannerImage": "https://res.cloudinary.com/di67gryqm/image/upload/v1713456789/aakaar/banner-floral-garden.jpg",
      "description": "...",
      "mood": "Romantic"
    }
  ],
  "products": [
    {
      "slug": "floral-garden-corset-top",
      "title": "Floral Garden Corset Top",
      "images": [
        "https://res.cloudinary.com/di67gryqm/image/upload/v1713456789/aakaar/corset-main.jpg"
      ]
    }
  ]
}
```

### Step B: Re-run Seed Script

This will update Supabase with the new URLs:

```bash
cd backend
npm run seed
```

The seed script reads from `shared/catalog.json` and inserts into Supabase tables.

---

## Step 6: Frontend Displays Images

### How Images Flow to Frontend

```
Supabase Database
       ↓
  (contains URLs)
       ↓
Frontend queries Supabase
       ↓
Gets image URLs
       ↓
Displays via Next.js Image component
       ↓
Next.js optimizes and caches from Cloudinary CDN
```

### Example in Code:

```typescript
// src/app/products/page.tsx
async function getProducts() {
  const { data } = await supabase
    .from('products')
    .select('*');
  
  return data; // Contains image URLs from Cloudinary
}

export default async function Products({ data }) {
  return (
    <div>
      {data.map(product => (
        <Image
          src={product.images[0]}  // Cloudinary URL
          alt={product.title}
          width={400}
          height={500}
        />
      ))}
    </div>
  );
}
```

---

## Complete Workflow Summary

### **From Upload to Display:**

```
1. UPLOAD
   ├─ Go to Cloudinary Dashboard
   ├─ Upload image to "aakaar" folder
   └─ Copy secure URL
        ↓
2. STORE URL
   ├─ Update shared/catalog.json with URL
   └─ URL example: https://res.cloudinary.com/di67gryqm/image/upload/v1234/aakaar/name.jpg
        ↓
3. SYNC TO SUPABASE
   ├─ Run: npm run seed
   └─ This inserts/updates records in Supabase tables
        ↓
4. FRONTEND FETCHES
   ├─ Query Supabase (prints, products tables)
   ├─ Get image URLs
   └─ Render with Next.js <Image>
        ↓
5. USER SEES IMAGE
   └─ Served from Cloudinary CDN (optimized, cached)
```

---

## Quick Reference: Where Each Thing Is

| What | Where | What it Contains |
|------|-------|-----------------|
| **Image Files** | Cloudinary Cloud | Actual image data |
| **Image URLs** | `shared/catalog.json` | URLs pointing to Cloudinary |
| **Image URLs** | Supabase (prints, products tables) | Same URLs, synced from catalog.json |
| **Signed Upload Endpoint** | `/api/cloudinary/signature` | Generates auth for uploads |
| **Frontend Config** | `frontend/.env` | Cloudinary credentials |

---

## Troubleshooting

### Problem: Image doesn't display
**Solution:**
- Check URL is valid: paste in browser
- Verify folder name matches in Cloudinary
- Clear Next.js cache: `rm -rf .next`

### Problem: URL looks broken
**Solution:**
- Must start with: `https://res.cloudinary.com/`
- Should have your cloud name: `di67gryqm`
- Check URL doesn't have typos

### Problem: Seed script fails
**Solution:**
- Verify Supabase URL and keys in `.env`
- Check tables exist in Supabase
- Look at error message in terminal

---

## Next Steps

1. ✅ Log into Cloudinary: https://cloudinary.com/console
2. ✅ Upload your first print image
3. ✅ Copy the secure URL
4. ✅ Update `shared/catalog.json` with URLs
5. ✅ Run seed script: `npm run seed`
6. ✅ Check Supabase tables - images should be there
7. ✅ Refresh app - images should display!

---

## Example: Complete Image Upload Flow

### Your Setup Right Now:
```
Cloudinary Account: di67gryqm
Upload Preset: ml_default
Folder: aakaar
API Key: 187877154644197
```

### Test Upload:
1. Open: https://cloudinary.com/console/media_library
2. Create folder named "aakaar"
3. Upload a test image
4. Cloudinary generates URL like:
   ```
   https://res.cloudinary.com/di67gryqm/image/upload/v1713456789/aakaar/test.jpg
   ```
5. Copy this URL
6. Add to catalog.json:
   ```json
   "image": "https://res.cloudinary.com/di67gryqm/image/upload/v1713456789/aakaar/test.jpg"
   ```
7. Run seed script to sync

That's it! 🎉
