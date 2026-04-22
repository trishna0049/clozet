-- Create user_cart table
CREATE TABLE IF NOT EXISTS public.user_cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id)
);

-- Create user_wishlist table
CREATE TABLE IF NOT EXISTS public.user_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wishlist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_cart_user_id ON public.user_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id ON public.user_wishlist(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read/write their own cart
CREATE POLICY "Users can manage their own cart" ON public.user_cart
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policy: Users can only read/write their own wishlist
CREATE POLICY "Users can manage their own wishlist" ON public.user_wishlist
  FOR ALL USING (auth.uid() = user_id);
