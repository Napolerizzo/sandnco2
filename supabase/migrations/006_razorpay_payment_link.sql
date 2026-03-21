-- ============================================================
-- MIGRATION 006: Razorpay Payment Link Webhook Events
-- Stores every raw webhook payload for support queries + auto-credit
-- ============================================================

-- Store every Razorpay webhook event with full raw payload
CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  username TEXT,            -- extracted from payment.notes.username
  email TEXT,               -- extracted from payment.email
  contact TEXT,             -- phone number
  amount DECIMAL(10,2),     -- in INR
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'credited', 'failed', 'duplicate')),
  credited BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rzp_events_username    ON razorpay_webhook_events(username);
CREATE INDEX IF NOT EXISTS idx_rzp_events_payment_id  ON razorpay_webhook_events(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_rzp_events_status      ON razorpay_webhook_events(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rzp_events_credited    ON razorpay_webhook_events(credited, created_at DESC);

-- Pre-redirect pending payment records (created before user is sent to Razorpay)
CREATE TABLE IF NOT EXISTS pending_razorpay_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT DEFAULT 'wallet_deposit' CHECK (payment_type IN ('wallet_deposit', 'membership')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes'
);

CREATE INDEX IF NOT EXISTS idx_pending_rzp_username ON pending_razorpay_payments(username, status);
CREATE INDEX IF NOT EXISTS idx_pending_rzp_user     ON pending_razorpay_payments(user_id, status);

-- RLS: only admins can query razorpay_webhook_events
ALTER TABLE razorpay_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_razorpay_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own pending payments
CREATE POLICY "users_own_pending" ON pending_razorpay_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_pending" ON pending_razorpay_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
