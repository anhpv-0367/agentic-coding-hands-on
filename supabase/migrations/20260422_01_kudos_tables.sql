-- Kudos Live Board: core tables + RLS
-- Creates: profiles (shadow of auth.users), kudos, kudo_attachments, kudo_reactions.

BEGIN;

-- =====================================================================
-- 0. Extensions
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. profiles — light shadow of auth.users for public display
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY,
  display_name text NOT NULL,
  avatar_url   text,
  department   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read public profile fields.
CREATE POLICY profiles_select_authenticated
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- A user can update their own profile only.
CREATE POLICY profiles_update_self
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================================
-- 2. kudos — main entries
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.kudos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message       text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  hashtags      text[] NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  heart_count   integer NOT NULL DEFAULT 0,
  CONSTRAINT kudos_sender_not_recipient CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS kudos_created_at_idx   ON public.kudos (created_at DESC);
CREATE INDEX IF NOT EXISTS kudos_recipient_id_idx ON public.kudos (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS kudos_sender_id_idx    ON public.kudos (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS kudos_hashtags_gin_idx ON public.kudos USING gin (hashtags);

ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read any kudos.
CREATE POLICY kudos_select_authenticated
  ON public.kudos
  FOR SELECT
  TO authenticated
  USING (true);

-- A user can only insert a kudos as themselves.
CREATE POLICY kudos_insert_self
  ON public.kudos
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Only the sender can delete their own kudos.
CREATE POLICY kudos_delete_owner
  ON public.kudos
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- =====================================================================
-- 3. kudo_attachments — image URLs per kudo
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.kudo_attachments (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kudo_id  uuid NOT NULL REFERENCES public.kudos(id) ON DELETE CASCADE,
  url      text NOT NULL,
  position smallint NOT NULL DEFAULT 0,
  CONSTRAINT kudo_attachments_position_nonneg CHECK (position >= 0),
  CONSTRAINT kudo_attachments_url_scheme CHECK (url LIKE 'http%')
);

CREATE INDEX IF NOT EXISTS kudo_attachments_kudo_id_idx ON public.kudo_attachments (kudo_id, position);

ALTER TABLE public.kudo_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY kudo_attachments_select_authenticated
  ON public.kudo_attachments
  FOR SELECT
  TO authenticated
  USING (true);

-- Only the kudos sender can insert attachments for their kudo.
CREATE POLICY kudo_attachments_insert_owner
  ON public.kudo_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kudos k
      WHERE k.id = kudo_id AND k.sender_id = auth.uid()
    )
  );

-- Only the kudos sender can delete attachments of their kudo.
CREATE POLICY kudo_attachments_delete_owner
  ON public.kudo_attachments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.kudos k
      WHERE k.id = kudo_id AND k.sender_id = auth.uid()
    )
  );

-- =====================================================================
-- 4. kudo_reactions — heart reactions with idempotency
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.kudo_reactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kudo_id    uuid NOT NULL REFERENCES public.kudos(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       text NOT NULL DEFAULT 'heart' CHECK (type IN ('heart')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kudo_id, user_id, type)
);

CREATE INDEX IF NOT EXISTS kudo_reactions_kudo_id_idx ON public.kudo_reactions (kudo_id);
CREATE INDEX IF NOT EXISTS kudo_reactions_user_id_idx ON public.kudo_reactions (user_id, created_at DESC);

ALTER TABLE public.kudo_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY kudo_reactions_select_authenticated
  ON public.kudo_reactions
  FOR SELECT
  TO authenticated
  USING (true);

-- A user can only insert a reaction as themselves.
CREATE POLICY kudo_reactions_insert_self
  ON public.kudo_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only the reactor can delete their own reaction.
CREATE POLICY kudo_reactions_delete_self
  ON public.kudo_reactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================================
-- 5. Maintain kudos.heart_count via triggers on kudo_reactions
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_kudos_heart_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.kudos SET heart_count = heart_count + 1 WHERE id = NEW.kudo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.kudos SET heart_count = GREATEST(heart_count - 1, 0) WHERE id = OLD.kudo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS kudo_reactions_heart_count_ins ON public.kudo_reactions;
CREATE TRIGGER kudo_reactions_heart_count_ins
  AFTER INSERT ON public.kudo_reactions
  FOR EACH ROW
  WHEN (NEW.type = 'heart')
  EXECUTE FUNCTION public.update_kudos_heart_count();

DROP TRIGGER IF EXISTS kudo_reactions_heart_count_del ON public.kudo_reactions;
CREATE TRIGGER kudo_reactions_heart_count_del
  AFTER DELETE ON public.kudo_reactions
  FOR EACH ROW
  WHEN (OLD.type = 'heart')
  EXECUTE FUNCTION public.update_kudos_heart_count();

COMMIT;
