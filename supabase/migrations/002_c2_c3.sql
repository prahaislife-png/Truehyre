-- C2/C3 checkpoint extensions
-- Run in: Supabase Dashboard → SQL Editor

ALTER TABLE public.verifications
  ADD COLUMN IF NOT EXISTS reference_image_url  text,
  ADD COLUMN IF NOT EXISTS duplicate_face_flag   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duplicate_candidate_id uuid REFERENCES public.candidates ON DELETE SET NULL;

-- Index for fast duplicate lookups
CREATE INDEX IF NOT EXISTS verifications_duplicate_candidate_id ON public.verifications (duplicate_candidate_id);
