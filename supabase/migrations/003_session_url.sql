-- Store the Didit-hosted session URL so recruiters can resend links from the candidate profile
ALTER TABLE public.verifications
  ADD COLUMN IF NOT EXISTS session_url text;
