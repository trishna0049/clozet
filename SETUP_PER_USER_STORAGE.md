# Per-User Cart & Wishlist Setup Guide

## Overview
Cart and wishlist data will now be saved per account in Supabase. Each logged-in user will have their own cart and wishlist that persists across devices.

## What Was Changed

### Frontend (providers.tsx)
- **Before**: Cart and wishlist stored in browser localStorage (global, not per-user)
- **After**: 
  - For logged-in users: Stored in Supabase `user_cart` and `user_wishlist` tables
  - For guests: Still use localStorage
  - Automatic sync when user logs in/out

### Database Structure
Two new tables created in Supabase:

#### `user_cart` table
```
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users, Unique)
- cart_items (JSONB array of CartItem objects)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### `user_wishlist` table
```
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users, Unique)
- wishlist_items (JSONB array of product slugs)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## Setup Instructions

### Step 1: Run the Migration
Execute the SQL from `backend/src/migrations/create_user_cart_wishlist.sql` in Supabase SQL Editor:

1. Go to Supabase Dashboard → Your Project
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of `create_user_cart_wishlist.sql`
5. Click "Run"

### Step 2: Verify Tables
In Supabase Dashboard, go to Table Editor and confirm:
- `user_cart` table exists
- `user_wishlist` table exists
- Both have proper indexes and RLS policies

### Step 3: Test
1. Start the frontend dev server: `npm run dev`
2. As a guest: Add items to cart/wishlist (saved in localStorage)
3. Sign up for an account
4. Your cart/wishlist should load from Supabase
5. Add more items - they save to Supabase
6. Log out - cart/wishlist persist
7. Log in again - your saved items appear

## Behavior

### Logged-In Users
- ✅ Cart and wishlist auto-save to Supabase
- ✅ Data syncs across devices
- ✅ Data persists after logout/login
- ✅ Each account has separate activity

### Guest Users
- ✅ Cart and wishlist saved in localStorage
- ✅ Data persists in current browser
- ✅ Lost if localStorage is cleared
- ✅ Not synced across devices

### Sign-In Flow
1. Guest adds items to cart
2. Guest signs up/logs in
3. System loads their Supabase cart data
4. Previous guest items are replaced (optional: could merge instead)

## Security (Row Level Security)
- Users can only view/edit their own cart
- Users can only view/edit their own wishlist
- Supabase RLS policies enforce this automatically

## Future Enhancements
- Merge guest cart with user cart on signup (instead of replacing)
- Cart expiration policies
- Analytics on user shopping behavior
- Admin view of all user carts
