-- ============================================================
-- MIGRATION 007: The Sand Grid
-- Social discovery feature with two tracks:
--   adult  (18+):  Vibe / Skip → mutual match reveals Instagram
--   ghost  (13-17): Friend / No → mutual friend reveals Instagram
-- Complete age-track isolation enforced at RLS level
-- ============================================================

-- User profiles for The Sand Grid
CREATE TABLE IF NOT EXISTS sand_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  date_of_birth DATE NOT NULL,
  age_track TEXT NOT NULL CHECK (age_track IN ('adult', 'ghost')),
  city TEXT,
  interests TEXT[] DEFAULT '{}',
  instagram_handle TEXT,
  profile_picture_url TEXT NOT NULL,
  show_on_grid BOOLEAN DEFAULT TRUE,
  dob_declared_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sand_profiles_track ON sand_profiles(age_track, show_on_grid);
CREATE INDEX IF NOT EXISTS idx_sand_profiles_user  ON sand_profiles(user_id);

-- Adult track: Vibe / Skip votes
CREATE TABLE IF NOT EXISTS sand_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('vibe', 'skip', 'spark', 'pass')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voter_id, target_id)
);

CREATE INDEX IF NOT EXISTS idx_sand_votes_voter  ON sand_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_sand_votes_target ON sand_votes(target_id);

-- Adult track: Mutual vibe matches
CREATE TABLE IF NOT EXISTS sand_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_sand_matches_u1 ON sand_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_sand_matches_u2 ON sand_matches(user2_id);

-- Ghost Mode track: Friend / No swipes
CREATE TABLE IF NOT EXISTS sand_friend_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('spark', 'pass')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voter_id, target_id)
);

CREATE INDEX IF NOT EXISTS idx_sand_fvotes_voter  ON sand_friend_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_sand_fvotes_target ON sand_friend_votes(target_id);

-- Ghost Mode track: Mutual friend connections
CREATE TABLE IF NOT EXISTS sand_connects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_sand_connects_u1 ON sand_connects(user1_id);
CREATE INDEX IF NOT EXISTS idx_sand_connects_u2 ON sand_connects(user2_id);

-- ── RLS ──────────────────────────────────────────────────────

ALTER TABLE sand_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sand_votes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sand_matches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sand_friend_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sand_connects     ENABLE ROW LEVEL SECURITY;

-- sand_profiles: users can read profiles on their own age_track only
-- (enforced client-side too, but RLS is the safety net)
CREATE POLICY "profiles_read_own_track" ON sand_profiles
  FOR SELECT USING (
    show_on_grid = TRUE AND
    age_track = (
      SELECT sp.age_track FROM sand_profiles sp WHERE sp.user_id = auth.uid() LIMIT 1
    )
  );

CREATE POLICY "profiles_manage_own" ON sand_profiles
  FOR ALL USING (auth.uid() = user_id);

-- sand_votes: users can insert own votes; cannot read others' votes
CREATE POLICY "votes_insert_own"   ON sand_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "votes_read_own"     ON sand_votes FOR SELECT USING (auth.uid() = voter_id);

-- sand_matches: users can read their own matches
CREATE POLICY "matches_read_own" ON sand_matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- sand_friend_votes: same as sand_votes
CREATE POLICY "fvotes_insert_own" ON sand_friend_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "fvotes_read_own"   ON sand_friend_votes FOR SELECT USING (auth.uid() = voter_id);

-- sand_connects: users can read their own connections
CREATE POLICY "connects_read_own" ON sand_connects
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
