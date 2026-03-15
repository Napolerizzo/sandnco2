-- ============================================================
-- Migration 002: Auto-create public.users profile on signup
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
  v_pfp_style TEXT;
BEGIN
  -- Extract metadata passed during signUp
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '_', 'g')) || '_' || FLOOR(RANDOM() * 9000 + 1000)::TEXT
  );
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    v_username
  );
  v_pfp_style := COALESCE(NEW.raw_user_meta_data->>'pfp_style', 'neon_orb');

  -- Insert profile row (ignore conflicts — profile may already exist from callback)
  INSERT INTO public.users (
    id, email, username, display_name, pfp_style, profile_picture_url
  ) VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_display_name,
    v_pfp_style,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also ensure username uniqueness violations fall back to random name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
  v_pfp_style TEXT;
  v_attempt INT := 0;
BEGIN
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  v_pfp_style := COALESCE(NEW.raw_user_meta_data->>'pfp_style', 'neon_orb');

  LOOP
    v_username := CASE
      WHEN v_attempt = 0 THEN COALESCE(
        NEW.raw_user_meta_data->>'username',
        LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '_', 'g')) || '_' || FLOOR(RANDOM() * 9000 + 1000)::TEXT
      )
      ELSE LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '_', 'g')) || '_' || FLOOR(RANDOM() * 900000 + 100000)::TEXT
    END;

    BEGIN
      INSERT INTO public.users (
        id, email, username, display_name, pfp_style, profile_picture_url
      ) VALUES (
        NEW.id,
        NEW.email,
        v_username,
        v_display_name,
        v_pfp_style,
        NEW.raw_user_meta_data->>'avatar_url'
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      v_attempt := v_attempt + 1;
      IF v_attempt > 5 THEN
        RETURN NEW; -- Give up, profile will be created by API fallback
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
