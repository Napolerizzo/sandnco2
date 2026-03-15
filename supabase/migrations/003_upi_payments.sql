-- ============================================================
-- UPI PAYMENTS TABLE
-- Tracks manual UPI payments with unique amounts for auto-matching
-- ============================================================

CREATE TABLE upi_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  unique_amount DECIMAL(12, 2) NOT NULL,
  utr_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'failed', 'expired')),
  verified_by TEXT,
  sms_raw_text TEXT,
  transaction_id UUID REFERENCES transactions(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upi_payments_status ON upi_payments(status, created_at DESC);
CREATE INDEX idx_upi_payments_unique_amount ON upi_payments(unique_amount, status);
CREATE INDEX idx_upi_payments_user ON upi_payments(user_id);

ALTER TABLE upi_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own upi payments" ON upi_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create upi payments" ON upi_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_upi_payments_updated_at
  BEFORE UPDATE ON upi_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
