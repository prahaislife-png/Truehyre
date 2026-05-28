-- Backfill: any verifications without an explicit checkpoint were created
-- by the candidate-creation route (C1). Set them to 'C1'.
UPDATE public.verifications
SET checkpoint = 'C1'
WHERE checkpoint IS NULL;
