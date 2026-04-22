-- Storage bucket for kudos attachments.

BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kudos-attachments',
  'kudos-attachments',
  true,
  5 * 1024 * 1024,               -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Authenticated users can upload under their own user_id prefix.
-- Path convention: `{auth.uid()}/{filename}`.
CREATE POLICY kudos_attachments_insert_owner
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'kudos-attachments'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- Public read on the bucket (since bucket.public = true, this is mostly implicit
-- but the policy lets us tighten later if we flip public→false).
CREATE POLICY kudos_attachments_select_public
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'kudos-attachments');

-- Owner-only delete (optional — lets a user clean up their own uploads).
CREATE POLICY kudos_attachments_delete_owner
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'kudos-attachments'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

COMMIT;
