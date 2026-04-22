-- user_kudo_stats table + tier_change_events + triggers.
-- Tier thresholds (D-plan-1): new 0–9, rising 10–29, super 30–99, legend ≥100.

BEGIN;

-- =====================================================================
-- 1. user_kudo_stats — denormalised per-user counters + tier
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.user_kudo_stats (
  user_id          uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  received         integer NOT NULL DEFAULT 0 CHECK (received >= 0),
  sent             integer NOT NULL DEFAULT 0 CHECK (sent >= 0),
  hearts           integer NOT NULL DEFAULT 0 CHECK (hearts >= 0),
  boxes_opened     integer NOT NULL DEFAULT 0 CHECK (boxes_opened >= 0),
  boxes_unopened   integer NOT NULL DEFAULT 0 CHECK (boxes_unopened >= 0),
  tier             text NOT NULL DEFAULT 'new' CHECK (tier IN ('new','rising','super','legend')),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_kudo_stats ENABLE ROW LEVEL SECURITY;

-- Full row is readable only by self (contains secret-box counters).
CREATE POLICY user_kudo_stats_select_self
  ON public.user_kudo_stats
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================================
-- 2. user_tiers_public — public projection (user_id, tier) for tier-badge rendering
-- =====================================================================
CREATE OR REPLACE VIEW public.user_tiers_public
WITH (security_invoker = true)
AS
  SELECT user_id, tier FROM public.user_kudo_stats;

GRANT SELECT ON public.user_tiers_public TO authenticated;

-- =====================================================================
-- 3. tier_change_events — log of tier upgrades (used by leaderboard)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.tier_change_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_tier  text NOT NULL,
  to_tier    text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tier_change_events_changed_at_idx ON public.tier_change_events (changed_at DESC);

ALTER TABLE public.tier_change_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tier_change_events_select_authenticated
  ON public.tier_change_events
  FOR SELECT
  TO authenticated
  USING (true);
-- INSERT is trigger-only; no client INSERT policy.

-- =====================================================================
-- 4. compute_tier — pure fn (mirrors frontend computeTier)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.compute_tier(received integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN received >= 100 THEN 'legend'
    WHEN received >= 30  THEN 'super'
    WHEN received >= 10  THEN 'rising'
    ELSE 'new'
  END;
$$;

-- =====================================================================
-- 5. upsert_user_stats_row — ensure stats row exists for a user
-- =====================================================================
CREATE OR REPLACE FUNCTION public.ensure_user_stats(target_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_kudo_stats (user_id) VALUES (target_user)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- =====================================================================
-- 6. Trigger: on kudos insert — bump sender.sent and recipient.received;
--    advance recipient tier if threshold crossed; grant a secret_box;
--    log tier_change_events.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_user_stats_on_kudo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_tier text;
  next_tier text;
  new_received integer;
BEGIN
  PERFORM public.ensure_user_stats(NEW.sender_id);
  PERFORM public.ensure_user_stats(NEW.recipient_id);

  UPDATE public.user_kudo_stats
    SET sent = sent + 1, updated_at = now()
    WHERE user_id = NEW.sender_id;

  UPDATE public.user_kudo_stats
    SET received = received + 1, updated_at = now()
    WHERE user_id = NEW.recipient_id
    RETURNING received, tier INTO new_received, prev_tier;

  next_tier := public.compute_tier(new_received);

  IF next_tier <> prev_tier THEN
    UPDATE public.user_kudo_stats
      SET tier = next_tier,
          boxes_unopened = boxes_unopened + 1,
          updated_at = now()
      WHERE user_id = NEW.recipient_id;

    INSERT INTO public.tier_change_events (user_id, from_tier, to_tier)
      VALUES (NEW.recipient_id, prev_tier, next_tier);

    INSERT INTO public.secret_boxes (user_id, reward_kind, reward_payload)
      VALUES (
        NEW.recipient_id,
        'points',
        jsonb_build_object('amount', CASE next_tier
          WHEN 'rising' THEN 50
          WHEN 'super'  THEN 200
          WHEN 'legend' THEN 1000
          ELSE 10
        END)
      );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kudos_update_user_stats ON public.kudos;
CREATE TRIGGER kudos_update_user_stats
  AFTER INSERT ON public.kudos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats_on_kudo();

-- =====================================================================
-- 7. Trigger: on reaction insert/delete — bump recipient.hearts
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_user_stats_on_reaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT recipient_id INTO target_user FROM public.kudos WHERE id = NEW.kudo_id;
    IF target_user IS NOT NULL THEN
      PERFORM public.ensure_user_stats(target_user);
      UPDATE public.user_kudo_stats
        SET hearts = hearts + 1, updated_at = now()
        WHERE user_id = target_user;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT recipient_id INTO target_user FROM public.kudos WHERE id = OLD.kudo_id;
    IF target_user IS NOT NULL THEN
      UPDATE public.user_kudo_stats
        SET hearts = GREATEST(hearts - 1, 0), updated_at = now()
        WHERE user_id = target_user;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS kudo_reactions_update_user_stats_ins ON public.kudo_reactions;
CREATE TRIGGER kudo_reactions_update_user_stats_ins
  AFTER INSERT ON public.kudo_reactions
  FOR EACH ROW
  WHEN (NEW.type = 'heart')
  EXECUTE FUNCTION public.update_user_stats_on_reaction();

DROP TRIGGER IF EXISTS kudo_reactions_update_user_stats_del ON public.kudo_reactions;
CREATE TRIGGER kudo_reactions_update_user_stats_del
  AFTER DELETE ON public.kudo_reactions
  FOR EACH ROW
  WHEN (OLD.type = 'heart')
  EXECUTE FUNCTION public.update_user_stats_on_reaction();

COMMIT;
