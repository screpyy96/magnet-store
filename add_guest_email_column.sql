-- Add guest_email column to orders table for guest checkout support
ALTER TABLE orders ADD COLUMN guest_email TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN orders.guest_email IS 'Email address for guest orders (when user_id is null)';
