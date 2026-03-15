-- ============================================================
-- Migration 001: Add comprehensive RLS policies
-- ============================================================

-- Add user_id alias column to rumors (points to same value as author_id)
ALTER TABLE rumors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Backfill user_id from author_id
UPDATE rumors SET user_id = author_id WHERE user_id IS NULL AND author_id IS NOT NULL;

-- Add index on rumors.user_id
CREATE INDEX IF NOT EXISTS idx_rumors_user_id ON rumors(user_id);
CREATE INDEX IF NOT EXISTS idx_rumors_author ON rumors(author_id);

-- ============================================================
-- MISSING RLS POLICIES
-- ============================================================

-- Rumor Votes
CREATE POLICY "Anyone can read votes" ON rumor_votes
  FOR SELECT USING (true);

CREATE POLICY "Auth users can vote" ON rumor_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON rumor_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Rumor Comments
CREATE POLICY "Anyone can read comments" ON rumor_comments
  FOR SELECT USING (true);

CREATE POLICY "Auth users can create comments" ON rumor_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update own comments" ON rumor_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments" ON rumor_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Mythbuster Evidence
CREATE POLICY "Anyone can read evidence" ON mythbuster_evidence
  FOR SELECT USING (true);

CREATE POLICY "Auth users can submit evidence" ON mythbuster_evidence
  FOR INSERT WITH CHECK (auth.uid() = investigator_id);

CREATE POLICY "Investigators can update own evidence" ON mythbuster_evidence
  FOR UPDATE USING (auth.uid() = investigator_id);

-- Challenges
CREATE POLICY "Anyone can read active challenges" ON challenges
  FOR SELECT USING (status IN ('waiting_for_players', 'active', 'judging', 'completed'));

CREATE POLICY "Auth users can create challenges" ON challenges
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own challenges" ON challenges
  FOR UPDATE USING (auth.uid() = created_by);

-- Challenge Participants
CREATE POLICY "Anyone can read participants" ON challenge_participants
  FOR SELECT USING (true);

CREATE POLICY "Auth users can join challenges" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Challenge Submissions
CREATE POLICY "Anyone can read submissions" ON challenge_submissions
  FOR SELECT USING (true);

CREATE POLICY "Participants can submit" ON challenge_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON challenge_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Feed Posts
CREATE POLICY "Anyone can read visible feed posts" ON feed_posts
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Auth users can create posts" ON feed_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts" ON feed_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts" ON feed_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Support Messages
CREATE POLICY "Users can read own ticket messages" ON support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages on own tickets" ON support_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Users: allow INSERT for new signups
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Wallets: allow insert (auto-created by trigger but just in case)
CREATE POLICY "System can create wallets" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: allow insert for authenticated users (own records)
CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: allow insert (system inserts, but service role bypasses RLS)
-- No user-facing insert policy needed since service role inserts notifications

-- Memberships RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own memberships" ON memberships
  FOR SELECT USING (auth.uid() = user_id);

-- Admin roles: read access for admins
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can check own admin role" ON admin_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Reports RLS policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Moderation logs: admin only (service role), no user policies needed
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
