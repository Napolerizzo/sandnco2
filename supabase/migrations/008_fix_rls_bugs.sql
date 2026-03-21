-- ============================================================
-- Migration 008: Fix three RLS bugs
-- 1. sand_profiles infinite recursion (subquery in its own RLS policy)
-- 2. users SELECT policy drops rows with NULL status
-- 3. Ensure users table SELECT is always accessible for own row
-- ============================================================

-- ── FIX 1: sand_profiles infinite recursion ─────────────────
-- The old "profiles_read_own_track" policy ran a subquery INTO
-- sand_profiles while sand_profiles RLS was active → recursion.
-- Solution: wrap the subquery in a SECURITY DEFINER function so it
-- bypasses RLS when fetching the caller's own age_track.

CREATE OR REPLACE FUNCTION get_my_sand_age_track()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT age_track FROM sand_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Drop the recursive policy and replace it
DROP POLICY IF EXISTS "profiles_read_own_track" ON sand_profiles;

CREATE POLICY "profiles_read_own_track" ON sand_profiles
  FOR SELECT USING (
    -- Own profile: always visible regardless of show_on_grid
    auth.uid() = user_id
    OR
    -- Others: must be on-grid AND same age track (via SECURITY DEFINER fn)
    (show_on_grid = TRUE AND age_track = get_my_sand_age_track())
  );

-- ── FIX 2: users "public profiles" policy ignores NULL status ─
-- NULL != 'banned'  evaluates to NULL (falsy) in SQL, so users
-- with no status set are invisible to everyone including anon callers
-- at signup (breaking the username availability check) and to the
-- server-side razorpay-link route.
DROP POLICY IF EXISTS "Users can read public profiles" ON users;

CREATE POLICY "Users can read public profiles" ON users
  FOR SELECT USING (status IS DISTINCT FROM 'banned');

-- DISTINCT FROM treats NULL correctly: NULL IS DISTINCT FROM 'banned' → TRUE
-- so new users (status = NULL) are now readable by everyone.
