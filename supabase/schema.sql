-- ============================================================
-- SANDNCO V2 - KING OF GOOD TIMES
-- Complete Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_status AS ENUM ('active', 'warned', 'suspended', 'banned');
CREATE TYPE rank_tier AS ENUM (
  'ghost_in_the_city',
  'street_whisperer',
  'rumor_rookie',
  'gossip_goblin',
  'myth_merchant',
  'truth_seeker',
  'chaos_agent',
  'urban_legend',
  'lord_of_vibes',
  'king_of_good_times'
);
CREATE TYPE pfp_style AS ENUM (
  'neon_orb',
  'pixel_beast',
  'glitch_portrait',
  'ascii_god',
  'geometric_chaos',
  'gradient_phantom',
  'cyber_mask',
  'void_entity'
);
CREATE TYPE rumor_status AS ENUM ('pending', 'active', 'under_review', 'resolved', 'removed');
CREATE TYPE verdict_type AS ENUM ('TRUE', 'MISLEADING', 'FALSE', 'PARTLY_TRUE', 'UNPROVEN');
CREATE TYPE challenge_status AS ENUM ('created', 'waiting_for_players', 'active', 'judging', 'completed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'challenge_entry', 'challenge_win', 'membership', 'refund', 'bonus');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE ticket_status AS ENUM ('open', 'ai_handled', 'escalated', 'resolved', 'closed');
CREATE TYPE ticket_category AS ENUM ('payment', 'wallet', 'membership', 'bug', 'appeal', 'general');
CREATE TYPE admin_role AS ENUM ('super_admin', 'platform_admin', 'moderator', 'myth_buster', 'support_staff');
CREATE TYPE notification_type AS ENUM (
  'challenge_result', 'wallet_update', 'moderation_warning',
  'support_reply', 'membership_update', 'rumor_verdict',
  'challenge_joined', 'challenge_started', 'new_follower',
  'system_announcement'
);
CREATE TYPE report_type AS ENUM ('rumor', 'comment', 'user', 'challenge_submission');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'actioned', 'dismissed');

-- ============================================================
-- USERS TABLE
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  rank rank_tier DEFAULT 'ghost_in_the_city',
  xp INTEGER DEFAULT 0,
  pfp_style pfp_style DEFAULT 'neon_orb',
  profile_picture_url TEXT,
  bio TEXT,
  city TEXT,
  status user_status DEFAULT 'active',
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT FALSE,
  google_id TEXT,
  wallet_balance DECIMAL(12, 2) DEFAULT 0.00,
  total_earned DECIMAL(12, 2) DEFAULT 0.00,
  total_spent DECIMAL(12, 2) DEFAULT 0.00,
  rumors_posted INTEGER DEFAULT 0,
  challenges_won INTEGER DEFAULT 0,
  myths_busted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rank thresholds (XP based)
-- ghost_in_the_city: 0
-- street_whisperer: 100
-- rumor_rookie: 500
-- gossip_goblin: 1500
-- myth_merchant: 3000
-- truth_seeker: 6000
-- chaos_agent: 12000
-- urban_legend: 25000
-- lord_of_vibes: 50000
-- king_of_good_times: 100000

-- ============================================================
-- ADMIN ROLES TABLE
-- ============================================================

CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  permissions JSONB DEFAULT '{}',
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ============================================================
-- RUMORS TABLE
-- ============================================================

CREATE TABLE rumors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous_alias TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  attachment_url TEXT,
  status rumor_status DEFAULT 'pending',
  verdict verdict_type,
  verdict_reason TEXT,
  verdict_by UUID REFERENCES users(id),
  verdict_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  heat_score DECIMAL(10, 4) DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT TRUE,
  is_pinned BOOLEAN DEFAULT FALSE,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RUMOR VOTES TABLE
-- ============================================================

CREATE TABLE rumor_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rumor_id UUID NOT NULL REFERENCES rumors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('believe', 'doubt', 'spicy')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rumor_id, user_id)
);

-- ============================================================
-- RUMOR COMMENTS TABLE
-- ============================================================

CREATE TABLE rumor_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rumor_id UUID NOT NULL REFERENCES rumors(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  anonymous_alias TEXT,
  parent_id UUID REFERENCES rumor_comments(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MYTHBUSTER EVIDENCE TABLE
-- ============================================================

CREATE TABLE mythbuster_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rumor_id UUID NOT NULL REFERENCES rumors(id) ON DELETE CASCADE,
  investigator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('supports', 'contradicts', 'neutral')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  media_url TEXT,
  credibility_score INTEGER DEFAULT 5 CHECK (credibility_score BETWEEN 1 AND 10),
  upvotes INTEGER DEFAULT 0,
  is_verified_investigator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHALLENGES TABLE
-- ============================================================

CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rules TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  entry_fee DECIMAL(10, 2) DEFAULT 0.00,
  min_players INTEGER DEFAULT 2,
  max_players INTEGER,
  prize_pool DECIMAL(12, 2) DEFAULT 0.00,
  platform_fee_percent DECIMAL(5, 2) DEFAULT 10.00,
  status challenge_status DEFAULT 'created',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  judging_ends_at TIMESTAMPTZ,
  submission_rules TEXT,
  winner_id UUID REFERENCES users(id),
  winner_prize DECIMAL(12, 2),
  judge_ids UUID[] DEFAULT '{}',
  objective_metric TEXT,
  is_premium_only BOOLEAN DEFAULT FALSE,
  thumbnail_url TEXT,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHALLENGE PARTICIPANTS TABLE
-- ============================================================

CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  entry_fee_paid DECIMAL(10, 2) DEFAULT 0.00,
  UNIQUE(challenge_id, user_id)
);

-- ============================================================
-- CHALLENGE SUBMISSIONS TABLE
-- ============================================================

CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  external_url TEXT,
  objective_score DECIMAL(10, 4),
  judge_score DECIMAL(10, 4),
  community_score DECIMAL(10, 4),
  final_score DECIMAL(10, 4),
  is_winner BOOLEAN DEFAULT FALSE,
  disqualified BOOLEAN DEFAULT FALSE,
  disqualify_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- ============================================================
-- CHALLENGE VOTES TABLE
-- ============================================================

CREATE TABLE challenge_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES challenge_submissions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, voter_id)
);

-- ============================================================
-- WALLET TABLE
-- ============================================================

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  locked_balance DECIMAL(12, 2) DEFAULT 0.00,
  total_deposited DECIMAL(12, 2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12, 2) DEFAULT 0.00,
  total_won DECIMAL(12, 2) DEFAULT 0.00,
  total_spent_on_challenges DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  description TEXT,
  reference_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  challenge_id UUID REFERENCES challenges(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PREMIUM MEMBERSHIPS TABLE
-- ============================================================

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'king',
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUPPORT TICKETS TABLE
-- ============================================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  category ticket_category NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status DEFAULT 'open',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES users(id),
  ai_response TEXT,
  ai_handled_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUPPORT MESSAGES TABLE
-- ============================================================

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  is_ai BOOLEAN DEFAULT FALSE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REPORTS TABLE
-- ============================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type report_type NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODERATION LOGS TABLE
-- ============================================================

CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  target_content_id UUID,
  target_content_type TEXT,
  action TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CITY FEED TABLE
-- ============================================================

CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  city TEXT,
  tags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_rank ON users(rank);
CREATE INDEX idx_users_xp ON users(xp DESC);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_rumors_status ON rumors(status);
CREATE INDEX idx_rumors_heat ON rumors(heat_score DESC);
CREATE INDEX idx_rumors_created ON rumors(created_at DESC);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_ends ON challenges(ends_at);
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_support_tickets_status ON support_tickets(status, created_at DESC);
CREATE INDEX idx_feed_city ON feed_posts(city, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rumors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rumor_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rumor_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mythbuster_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

-- Users can read all public profiles, update own
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read public profiles" ON users
  FOR SELECT USING (status != 'banned');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Rumors: public read, authenticated write
CREATE POLICY "Anyone can read active rumors" ON rumors
  FOR SELECT USING (status IN ('active', 'resolved'));

CREATE POLICY "Auth users can create rumors" ON rumors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update own rumors" ON rumors
  FOR UPDATE USING (auth.uid() = author_id);

-- Wallets: users can only see own wallet
CREATE POLICY "Users can read own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Transactions: users see own only
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications: own only
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Support tickets: own only
CREATE POLICY "Users can read own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update rank based on XP
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
  NEW.rank := CASE
    WHEN NEW.xp >= 100000 THEN 'king_of_good_times'
    WHEN NEW.xp >= 50000  THEN 'lord_of_vibes'
    WHEN NEW.xp >= 25000  THEN 'urban_legend'
    WHEN NEW.xp >= 12000  THEN 'chaos_agent'
    WHEN NEW.xp >= 6000   THEN 'truth_seeker'
    WHEN NEW.xp >= 3000   THEN 'myth_merchant'
    WHEN NEW.xp >= 1500   THEN 'gossip_goblin'
    WHEN NEW.xp >= 500    THEN 'rumor_rookie'
    WHEN NEW.xp >= 100    THEN 'street_whisperer'
    ELSE 'ghost_in_the_city'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rank
  BEFORE UPDATE OF xp ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rank();

-- Auto-create wallet on user insert
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_user();

-- Update heat score for rumors
CREATE OR REPLACE FUNCTION calculate_heat_score(
  p_votes INTEGER,
  p_comments INTEGER,
  p_views INTEGER,
  p_age_hours DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN (p_votes * 3 + p_comments * 2 + p_views * 0.1) / POWER(p_age_hours + 2, 1.5);
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rumors_updated_at BEFORE UPDATE ON rumors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
