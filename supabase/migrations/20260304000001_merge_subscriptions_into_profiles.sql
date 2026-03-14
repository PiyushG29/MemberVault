-- Add subscription columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscribed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Drop the standalone subscriptions table if it exists
DROP TABLE IF EXISTS public.subscriptions;
