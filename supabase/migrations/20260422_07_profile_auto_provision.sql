-- Auto-provision public.profiles for any authenticated user.
-- Also backfills profiles for existing auth.users missing a shadow row.

BEGIN;

-- =====================================================================
-- 1. Function: on new auth.users row, insert a shadow profile.
--    display_name prefers user_metadata.full_name → name → email local part.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  derived_name text;
  derived_avatar text;
BEGIN
  derived_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'Sunner'
  );
  derived_avatar := NEW.raw_user_meta_data ->> 'avatar_url';

  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, derived_name, derived_avatar)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- =====================================================================
-- 2. Trigger on auth.users
-- =====================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 3. Backfill: any existing auth.users without a profiles row.
-- =====================================================================
INSERT INTO public.profiles (id, display_name, avatar_url)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    split_part(COALESCE(u.email, ''), '@', 1),
    'Sunner'
  ),
  u.raw_user_meta_data ->> 'avatar_url'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

COMMIT;
