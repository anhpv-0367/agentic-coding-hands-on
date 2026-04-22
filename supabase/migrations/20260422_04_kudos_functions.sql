-- Read-heavy RPCs for the Kudos Live Board.
-- Return shape aligned with frontend Kudo / SpotlightNode / LeaderboardEntry types.

BEGIN;

-- =====================================================================
-- 1. kudo_to_json — helper that composes a full Kudo payload
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
BEGIN
  SELECT COALESCE(tier, 'new') INTO sender_tier    FROM public.user_kudo_stats WHERE user_id = k.sender_id;
  SELECT COALESCE(tier, 'new') INTO recipient_tier FROM public.user_kudo_stats WHERE user_id = k.recipient_id;

  SELECT jsonb_build_object(
    'id', p.id,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url,
    'tier', COALESCE(sender_tier, 'new'),
    'department', p.department
  ) INTO sender_profile
  FROM public.profiles p WHERE p.id = k.sender_id;

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

  RETURN jsonb_build_object(
    'id', k.id,
    'sender', sender_profile,
    'recipient', recipient_profile,
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
-- 2. get_kudos_highlights_7d — top 5 kudos in last 7 days
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_kudos_highlights_7d()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(public.kudo_to_json(k) ORDER BY k.heart_count DESC, k.created_at DESC), '[]'::jsonb)
  FROM public.kudos k
  WHERE k.created_at >= now() - interval '7 days'
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION public.get_kudos_highlights_7d() TO authenticated;

-- =====================================================================
-- 3. list_kudos_paginated — cursor pagination with filters
-- Cursor format: <timestamptz>__<uuid> (ISO ts + kudo id for tiebreak).
-- =====================================================================
CREATE OR REPLACE FUNCTION public.list_kudos_paginated(
  p_cursor       text DEFAULT NULL,
  p_limit        integer DEFAULT 10,
  p_hashtag      text DEFAULT NULL,
  p_department   text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cursor_ts   timestamptz;
  cursor_id   uuid;
  rows_json   jsonb;
  next_cur    text;
  last_row    public.kudos%ROWTYPE;
  row_count   integer;
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 50 THEN
    p_limit := 10;
  END IF;

  IF p_cursor IS NOT NULL AND position('__' in p_cursor) > 0 THEN
    cursor_ts := split_part(p_cursor, '__', 1)::timestamptz;
    cursor_id := split_part(p_cursor, '__', 2)::uuid;
  END IF;

  WITH filtered AS (
    SELECT k.* FROM public.kudos k
    LEFT JOIN public.profiles p ON p.id = k.recipient_id
    WHERE (p_hashtag IS NULL OR p_hashtag = ANY(k.hashtags))
      AND (p_department IS NULL OR p.department = p_department)
      AND (
        p_cursor IS NULL
        OR (k.created_at < cursor_ts)
        OR (k.created_at = cursor_ts AND k.id < cursor_id)
      )
    ORDER BY k.created_at DESC, k.id DESC
    LIMIT p_limit
  )
  SELECT
    COALESCE(jsonb_agg(public.kudo_to_json(f) ORDER BY f.created_at DESC, f.id DESC), '[]'::jsonb),
    count(*)
  INTO rows_json, row_count
  FROM filtered f;

  IF row_count = p_limit THEN
    SELECT * INTO last_row FROM public.kudos
      WHERE id IN (SELECT (value->>'id')::uuid FROM jsonb_array_elements(rows_json))
      ORDER BY created_at ASC, id ASC LIMIT 1;
    IF FOUND THEN
      next_cur := last_row.created_at::text || '__' || last_row.id::text;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'items', rows_json,
    'next_cursor', next_cur
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_kudos_paginated(text, integer, text, text) TO authenticated;

-- =====================================================================
-- 4. get_spotlight_feed — most-recent N kudos as lightweight nodes
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_spotlight_feed(p_limit integer DEFAULT 118)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total integer;
  nodes jsonb;
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 500 THEN
    p_limit := 118;
  END IF;

  SELECT count(*) INTO total FROM public.kudos;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'kudo_id', k.id,
    'recipient', jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'avatar_url', p.avatar_url,
      'tier', COALESCE(s.tier, 'new'),
      'department', p.department
    ),
    'received_at', k.created_at
  ) ORDER BY k.created_at DESC), '[]'::jsonb) INTO nodes
  FROM (
    SELECT * FROM public.kudos ORDER BY created_at DESC LIMIT p_limit
  ) k
  JOIN public.profiles p ON p.id = k.recipient_id
  LEFT JOIN public.user_kudo_stats s ON s.user_id = p.id;

  RETURN jsonb_build_object('total', total, 'nodes', nodes);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_spotlight_feed(integer) TO authenticated;

-- =====================================================================
-- 5. get_tier_upgrades_leaderboard — top N most-recent upgrades
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_tier_upgrades_leaderboard(p_limit integer DEFAULT 10)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(row_to_json ORDER BY rnk), '[]'::jsonb) FROM (
    SELECT jsonb_build_object(
      'user', jsonb_build_object(
        'id', p.id,
        'display_name', p.display_name,
        'avatar_url', p.avatar_url,
        'tier', e.to_tier,
        'department', p.department
      ),
      'description', 'Lên hạng ' || e.to_tier,
      'rank', row_number() OVER (ORDER BY e.changed_at DESC),
      'meta', to_char(e.changed_at, 'DD/MM/YYYY HH24:MI')
    ) AS row_to_json,
    row_number() OVER (ORDER BY e.changed_at DESC) AS rnk
    FROM public.tier_change_events e
    JOIN public.profiles p ON p.id = e.user_id
    ORDER BY e.changed_at DESC
    LIMIT GREATEST(p_limit, 1)
  ) _sub;
$$;

GRANT EXECUTE ON FUNCTION public.get_tier_upgrades_leaderboard(integer) TO authenticated;

-- =====================================================================
-- 6. get_gift_recipients_leaderboard — top N most-recent opened boxes
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_gift_recipients_leaderboard(p_limit integer DEFAULT 10)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(row_to_json ORDER BY rnk), '[]'::jsonb) FROM (
    SELECT jsonb_build_object(
      'user', jsonb_build_object(
        'id', p.id,
        'display_name', p.display_name,
        'avatar_url', p.avatar_url,
        'tier', COALESCE(s.tier, 'new'),
        'department', p.department
      ),
      'description', 'Đã mở quà — ' || b.reward_kind,
      'rank', row_number() OVER (ORDER BY b.opened_at DESC),
      'meta', to_char(b.opened_at, 'DD/MM/YYYY HH24:MI')
    ) AS row_to_json,
    row_number() OVER (ORDER BY b.opened_at DESC) AS rnk
    FROM public.secret_boxes b
    JOIN public.profiles p ON p.id = b.user_id
    LEFT JOIN public.user_kudo_stats s ON s.user_id = b.user_id
    WHERE b.opened_at IS NOT NULL
    ORDER BY b.opened_at DESC
    LIMIT GREATEST(p_limit, 1)
  ) _sub;
$$;

GRANT EXECUTE ON FUNCTION public.get_gift_recipients_leaderboard(integer) TO authenticated;

-- =====================================================================
-- 7. get_distinct_hashtags_and_departments — filter options
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_distinct_hashtags_and_departments()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'hashtags', COALESCE((
      SELECT jsonb_agg(DISTINCT tag ORDER BY tag)
      FROM public.kudos, unnest(hashtags) AS tag
    ), '[]'::jsonb),
    'departments', COALESCE((
      SELECT jsonb_agg(DISTINCT department ORDER BY department)
      FROM public.profiles WHERE department IS NOT NULL
    ), '[]'::jsonb)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_distinct_hashtags_and_departments() TO authenticated;

-- =====================================================================
-- 8. search_sunners — autocomplete by display_name
-- =====================================================================
CREATE OR REPLACE FUNCTION public.search_sunners(p_query text, p_limit integer DEFAULT 10)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', sub.id,
    'display_name', sub.display_name,
    'avatar_url', sub.avatar_url,
    'tier', sub.tier,
    'department', sub.department
  ) ORDER BY sub.display_name ASC), '[]'::jsonb)
  FROM (
    SELECT p.id, p.display_name, p.avatar_url,
           COALESCE(s.tier, 'new') AS tier, p.department
    FROM public.profiles p
    LEFT JOIN public.user_kudo_stats s ON s.user_id = p.id
    WHERE p.display_name ILIKE '%' || COALESCE(p_query, '') || '%'
    ORDER BY p.display_name ASC
    LIMIT LEAST(GREATEST(p_limit, 1), 50)
  ) sub;
$$;

GRANT EXECUTE ON FUNCTION public.search_sunners(text, integer) TO authenticated;

-- =====================================================================
-- 9. get_my_stats — personal stats (respects RLS but this wraps for JSON shape)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_my_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me  uuid := auth.uid();
  row public.user_kudo_stats%ROWTYPE;
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;

  PERFORM public.ensure_user_stats(me);

  SELECT * INTO row FROM public.user_kudo_stats WHERE user_id = me;

  RETURN jsonb_build_object(
    'received', row.received,
    'sent', row.sent,
    'hearts', row.hearts,
    'boxes_opened', row.boxes_opened,
    'boxes_unopened', row.boxes_unopened,
    'tier', row.tier
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_stats() TO authenticated;

-- =====================================================================
-- 10. get_kudo_detail — single kudo by id
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_kudo_detail(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k public.kudos%ROWTYPE;
BEGIN
  SELECT * INTO k FROM public.kudos WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  RETURN public.kudo_to_json(k);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_kudo_detail(uuid) TO authenticated;

COMMIT;
