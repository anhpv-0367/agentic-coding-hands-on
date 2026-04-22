-- secret_boxes + open_next_box RPC

BEGIN;

CREATE TABLE IF NOT EXISTS public.secret_boxes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_kind     text NOT NULL CHECK (reward_kind IN ('points','badge','coupon','voucher')),
  reward_payload  jsonb NOT NULL,
  opened_at       timestamptz,
  granted_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS secret_boxes_user_unopened_idx
  ON public.secret_boxes (user_id, granted_at)
  WHERE opened_at IS NULL;

CREATE INDEX IF NOT EXISTS secret_boxes_user_opened_idx
  ON public.secret_boxes (user_id, opened_at DESC)
  WHERE opened_at IS NOT NULL;

ALTER TABLE public.secret_boxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY secret_boxes_select_self
  ON public.secret_boxes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No client INSERT policy — only trigger (in migration 02) creates boxes.
-- UPDATE only via RPC open_next_box (security definer).

-- =====================================================================
-- open_next_box — atomic: pick oldest unopened box for auth.uid(),
-- mark it opened, decrement boxes_unopened, increment boxes_opened,
-- return reward payload.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.open_next_box()
RETURNS TABLE (
  id             uuid,
  reward_kind    text,
  reward_payload jsonb,
  opened_at      timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user uuid := auth.uid();
  box_row     public.secret_boxes%ROWTYPE;
BEGIN
  IF target_user IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;

  -- Pick the oldest unopened box with row-lock to prevent double-open races.
  SELECT * INTO box_row
    FROM public.secret_boxes
    WHERE user_id = target_user AND opened_at IS NULL
    ORDER BY granted_at ASC
    LIMIT 1
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'no_unopened_boxes' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.secret_boxes
    SET opened_at = now()
    WHERE secret_boxes.id = box_row.id
    RETURNING * INTO box_row;

  UPDATE public.user_kudo_stats
    SET boxes_opened = boxes_opened + 1,
        boxes_unopened = GREATEST(boxes_unopened - 1, 0),
        updated_at = now()
    WHERE user_id = target_user;

  RETURN QUERY SELECT box_row.id, box_row.reward_kind, box_row.reward_payload, box_row.opened_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.open_next_box() TO authenticated;

COMMIT;
