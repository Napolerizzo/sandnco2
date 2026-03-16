CREATE TABLE IF NOT EXISTS beta_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by TEXT
);
-- Super admins auto-included
INSERT INTO beta_access (email, granted_by) VALUES
  ('admin@sameerjhamb.com', 'system'),
  ('sameer.jhamb1719@gmail.com', 'system')
ON CONFLICT DO NOTHING;
