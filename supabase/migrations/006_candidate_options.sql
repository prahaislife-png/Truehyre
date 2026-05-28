ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS proof_of_address_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS database_validation_enabled boolean NOT NULL DEFAULT false;
