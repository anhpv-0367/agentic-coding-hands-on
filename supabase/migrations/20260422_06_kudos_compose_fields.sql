-- Kudos Compose: add title + is_anonymous to kudos, add kudo_drafts table.
-- Updates kudo_to_json() to include new fields and mask sender when is_anonymous.

BEGIN;

-- =====================================================================
-- 1. Extend kudos with title + is_anonymous
-- =====================================================================
ALTER TABLE public.kudos
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT ''
    CHECK (char_length(title) <= 80);

ALTER TABLE public.kudos
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;

-- =====================================================================
-- 2. Update kudo_to_json() — include title + is_anonymous; mask sender
--    when anonymous; fall back title to first hashtag when empty.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.kudo_to_json(k public.kudos)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_profile    jsonb;
  recipient_profile jsonb;
  attachments       jsonb;
  liked_by_me       boolean;
  sender_tier       text;
  recipient_tier    text;
  me                uuid := auth.uid();
  effective_title   text;
BEGIN
  SELECT COALESCE(tier, 'new') INTO sender_tier    FROM public.user_kudo_stats WHERE user_id = k.sender_id;
  SELECT COALESCE(tier, 'new') INTO recipient_tier FROM public.user_kudo_stats WHERE user_id = k.recipient_id;

  IF k.is_anonymous THEN
    sender_profile := jsonb_build_object(
      'id', NULL,
      'display_name', 'Ẩn danh',
      'avatar_url', NULL,
      'tier', 'new',
      'department', NULL
    );
  ELSE
    SELECT jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'avatar_url', p.avatar_url,
      'tier', COALESCE(sender_tier, 'new'),
      'department', p.department
    ) INTO sender_profile
    FROM public.profiles p WHERE p.id = k.sender_id;
  END IF;

  SELECT jsonb_build_object(
    'id', p.id,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url,
    'tier', COALESCE(recipient_tier, 'new'),
    'department', p.department
  ) INTO recipient_profile
  FROM public.profiles p WHERE p.id = k.recipient_id;

  SELECT COALESCE(jsonb_agg(ka.url ORDER BY ka.position, ka.id), '[]'::jsonb) INTO attachments
  FROM public.kudo_attachments ka WHERE ka.kudo_id = k.id;

  IF me IS NULL THEN
    liked_by_me := false;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.kudo_reactions r
      WHERE r.kudo_id = k.id AND r.user_id = me AND r.type = 'heart'
    ) INTO liked_by_me;
  END IF;

  effective_title := NULLIF(k.title, '');
  IF effective_title IS NULL AND array_length(k.hashtags, 1) >= 1 THEN
    effective_title := k.hashtags[1];
  END IF;

  RETURN jsonb_build_object(
    'id', k.id,
    'sender', sender_profile,
    'recipient', recipient_profile,
    'title', COALESCE(effective_title, ''),
    'is_anonymous', k.is_anonymous,
    'message', k.message,
    'hashtags', to_jsonb(k.hashtags),
    'created_at', k.created_at,
    'heart_count', k.heart_count,
    'liked_by_me', liked_by_me,
    'attachment_urls', attachments,
    'share_url', '/kudos/' || k.id::text
  );
END;
$$;

-- =====================================================================
-- 3. kudo_drafts — one active draft per user
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.kudo_drafts (
  user_id    uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  payload    jsonb NOT NULL CHECK (pg_column_size(payload) <= 65536),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kudo_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kudo_drafts_select_self ON public.kudo_drafts;
CREATE POLICY kudo_drafts_select_self
  ON public.kudo_drafts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS kudo_drafts_insert_self ON public.kudo_drafts;
CREATE POLICY kudo_drafts_insert_self
  ON public.kudo_drafts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS kudo_drafts_update_self ON public.kudo_drafts;
CREATE POLICY kudo_drafts_update_self
  ON public.kudo_drafts FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS kudo_drafts_delete_self ON public.kudo_drafts;
CREATE POLICY kudo_drafts_delete_self
  ON public.kudo_drafts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_kudo_drafts_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kudo_drafts_touch_updated_at ON public.kudo_drafts;
CREATE TRIGGER kudo_drafts_touch_updated_at
  BEFORE UPDATE ON public.kudo_drafts
  FOR EACH ROW EXECUTE FUNCTION public.touch_kudo_drafts_updated_at();

COMMIT;
