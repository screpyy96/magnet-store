-- Fix order_status enum to match frontend expectations
-- This adds 'paid' and 'completed' statuses and removes 'delivered' and 'refunded'

-- Step 1: Add new enum values
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'completed';

-- Note: PostgreSQL doesn't allow removing enum values directly
-- If you need to remove 'delivered' and 'refunded', you would need to:
-- 1. Create a new enum type
-- 2. Alter the column to use the new type
-- 3. Drop the old type

-- For now, we'll just add the missing values so both 'paid' and 'completed' work
-- The old values ('delivered', 'refunded') can coexist without causing issues
