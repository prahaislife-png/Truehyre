-- ============================================================
-- Migration 005: Multi-tenancy — organizations + invitations
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- New table: organizations (one per paying customer / workspace)
CREATE TABLE IF NOT EXISTS public.organizations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- New table: invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
  email        text NOT NULL,
  role         text NOT NULL DEFAULT 'recruiter' CHECK (role IN ('admin','recruiter','client_viewer')),
  token        text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by   uuid REFERENCES auth.users ON DELETE SET NULL,
  accepted_at  timestamptz,
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Add org_id to existing tables
ALTER TABLE public.users       ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations ON DELETE SET NULL;
ALTER TABLE public.candidates  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations ON DELETE CASCADE;
ALTER TABLE public.clients     ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS users_org_id_idx       ON public.users (org_id);
CREATE INDEX IF NOT EXISTS candidates_org_id_idx  ON public.candidates (org_id);
CREATE INDEX IF NOT EXISTS clients_org_id_idx     ON public.clients (org_id);
CREATE INDEX IF NOT EXISTS invitations_org_id_idx ON public.invitations (org_id);
CREATE INDEX IF NOT EXISTS invitations_token_idx  ON public.invitations (token);

-- ============================================================
-- New helper function
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid();
$$;

-- ============================================================
-- RLS — organizations
-- ============================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_member_select" ON public.organizations
  FOR SELECT USING (id = public.current_user_org_id());

-- ============================================================
-- RLS — invitations (admins manage; service role handles accepts)
-- ============================================================

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_admin_all" ON public.invitations
  FOR ALL USING (
    org_id = public.current_user_org_id()
    AND public.current_user_role() = 'admin'
  );

-- ============================================================
-- RLS — update users policies
-- ============================================================

DROP POLICY IF EXISTS "users_select_self" ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;

-- Own row always readable; org members readable once both have org_id
CREATE POLICY "users_select" ON public.users FOR SELECT USING (
  id = auth.uid()
  OR (
    org_id IS NOT NULL
    AND org_id = public.current_user_org_id()
  )
);
CREATE POLICY "users_update_self" ON public.users FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- RLS — update clients policies (org-scoped)
-- ============================================================

DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_all_admin" ON public.clients;

CREATE POLICY "clients_org_select" ON public.clients FOR SELECT USING (
  org_id = public.current_user_org_id()
);
CREATE POLICY "clients_org_admin" ON public.clients
  FOR ALL USING (
    org_id = public.current_user_org_id()
    AND public.current_user_role() = 'admin'
  );

-- ============================================================
-- RLS — update candidates policies (org-scoped)
-- ============================================================

DROP POLICY IF EXISTS "candidates_select" ON public.candidates;
DROP POLICY IF EXISTS "candidates_insert_recruiter" ON public.candidates;
DROP POLICY IF EXISTS "candidates_update_recruiter" ON public.candidates;

CREATE POLICY "candidates_org_select" ON public.candidates FOR SELECT USING (
  org_id = public.current_user_org_id()
  AND (
    public.current_user_role() = 'admin'
    OR recruiter_id = auth.uid()
    OR (public.current_user_role() = 'client_viewer' AND client_id = public.current_user_client_id())
  )
);
CREATE POLICY "candidates_org_insert" ON public.candidates FOR INSERT
  WITH CHECK (
    org_id = public.current_user_org_id()
    AND (recruiter_id = auth.uid() OR public.current_user_role() = 'admin')
  );
CREATE POLICY "candidates_org_update" ON public.candidates FOR UPDATE USING (
  org_id = public.current_user_org_id()
  AND (recruiter_id = auth.uid() OR public.current_user_role() = 'admin')
);
