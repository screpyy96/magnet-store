-- =====================================================
-- NEWSLETTER & DISCOUNT SYSTEM - SIMPLE VERSION
-- Fixed for TEXT order IDs
-- =====================================================

-- Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    discount_code TEXT,
    discount_code_used BOOLEAN DEFAULT FALSE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
    value DECIMAL(10,2) NOT NULL,
    minimum_order DECIMAL(10,2) DEFAULT 0.00,
    usage_limit INTEGER NULL,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discount Usage History Table - NO FOREIGN KEY TO ORDERS
CREATE TABLE IF NOT EXISTS discount_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL, -- No foreign key - just reference
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL,
    email TEXT,
    discount_amount DECIMAL(10,2) NOT NULL,
    order_total DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read active discount codes" ON discount_codes
    FOR SELECT USING (is_active = true);

CREATE POLICY "System can create discount usage records" ON discount_usage
    FOR INSERT WITH CHECK (true);

-- Function to validate discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
    p_code TEXT,
    p_order_total DECIMAL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_amount DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    code_record discount_codes%ROWTYPE;
    calculated_discount DECIMAL;
BEGIN
    -- Get discount code details
    SELECT * INTO code_record
    FROM discount_codes
    WHERE code = p_code AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false::BOOLEAN, 0.00::DECIMAL, 'Invalid discount code'::TEXT;
        RETURN;
    END IF;
    
    -- Check minimum order amount
    IF p_order_total < code_record.minimum_order THEN
        RETURN QUERY SELECT false::BOOLEAN, 0.00::DECIMAL, 
            format('Minimum order amount is £%.2f', code_record.minimum_order)::TEXT;
        RETURN;
    END IF;
    
    -- Calculate discount amount
    IF code_record.type = 'percentage' THEN
        calculated_discount := p_order_total * (code_record.value / 100);
    ELSE
        calculated_discount := code_record.value;
        IF calculated_discount > p_order_total THEN
            calculated_discount := p_order_total;
        END IF;
    END IF;
    
    RETURN QUERY SELECT true::BOOLEAN, calculated_discount, ''::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default discount codes
INSERT INTO discount_codes (code, type, value, minimum_order, description, is_active) VALUES
('WELCOME10', 'percentage', 10.00, 0.00, 'Welcome discount for newsletter subscribers', true),
('SAVE15', 'percentage', 15.00, 50.00, '15% off orders over £50', true),
('FREESHIP', 'fixed_amount', 5.99, 25.00, 'Free shipping on orders over £25', true)
ON CONFLICT (code) DO NOTHING;

-- Grant permissions
GRANT ALL ON newsletter_subscriptions TO authenticated;
GRANT ALL ON discount_codes TO authenticated;
GRANT ALL ON discount_usage TO authenticated;
GRANT EXECUTE ON FUNCTION validate_discount_code(TEXT, DECIMAL) TO authenticated;

-- Success message
SELECT 'Newsletter & Discount System Setup Complete! ✅' as result; 