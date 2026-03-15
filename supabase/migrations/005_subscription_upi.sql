-- Add subscription support to UPI payments
ALTER TABLE upi_payments ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'deposit' CHECK (payment_type IN ('deposit', 'membership'));
ALTER TABLE upi_payments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
