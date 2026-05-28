-- ============================================================
-- TrueHire initial schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop old tables from previous project
DROP TABLE IF EXISTS public.web_search_sources CASCADE;
DROP TABLE IF EXISTS public.web_search_evidence CASCADE;
DROP TABLE IF EXISTS public.web_search_jobs CASCADE;
DROP TABLE IF EXISTS public.claim_submissions CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.report_activity CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================
-- Core tables
-- ============================================================

CREATE TABLE public.clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  contact     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- users mirrors auth.users; role determines access level
CREATE TABLE public.users (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL CHECK (role IN ('admin','recruiter','client_viewer')) DEFAULT 'recruiter',
  client_id   uuid REFERENCES public.clients ON DELETE SET NULL
);

CREATE TABLE public.candidates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         text NOT NULL,
  email             text NOT NULL,
  phone             text,
  role_applied      text,
  client_id         uuid REFERENCES public.clients ON DELETE SET NULL,
  recruiter_id      uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  didit_session_id  text,
  overall_status    text NOT NULL DEFAULT 'pending',
  aml_enabled       boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.verifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id      uuid NOT NULL REFERENCES public.candidates ON DELETE CASCADE,
  checkpoint        text NOT NULL DEFAULT 'C1',
  didit_session_id  text NOT NULL,
  workflow_id       text NOT NULL,
  status            text NOT NULL DEFAULT 'pending',
  decision_json     jsonb,
  face_match_score  numeric,
  liveness_score    numeric,
  aml_hits          integer,
  created_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz
);

CREATE TABLE public.webhook_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    text NOT NULL,
  webhook_type  text NOT NULL,
  timestamp     bigint NOT NULL,
  payload       jsonb NOT NULL,
  UNIQUE (session_id, webhook_type, timestamp)
);

CREATE TABLE public.audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      uuid REFERENCES public.users ON DELETE SET NULL,
  action        text NOT NULL,
  candidate_id  uuid REFERENCES public.candidates ON DELETE SET NULL,
  meta          jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX ON public.candidates (recruiter_id);
CREATE INDEX ON public.candidates (client_id);
CREATE INDEX ON public.candidates (didit_session_id);
CREATE INDEX ON public.verifications (candidate_id);
CREATE INDEX ON public.verifications (didit_session_id);
CREATE INDEX ON public.webhook_events (session_id);
CREATE INDEX ON public.audit_log (candidate_id);

-- ============================================================
-- Auto-create user profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'recruiter')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log       ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Helper: get current user client_id
CREATE OR REPLACE FUNCTION public.current_user_client_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT client_id FROM public.users WHERE id = auth.uid();
$$;

-- clients: admins see all; recruiters/viewers see their own client
CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (
  public.current_user_role() = 'admin'
  OR id = public.current_user_client_id()
);
CREATE POLICY "clients_all_admin" ON public.clients FOR ALL USING (public.current_user_role() = 'admin');

-- users: can read own row; admins see all
CREATE POLICY "users_select_self" ON public.users FOR SELECT USING (
  id = auth.uid() OR public.current_user_role() = 'admin'
);
CREATE POLICY "users_update_self" ON public.users FOR UPDATE USING (id = auth.uid());

-- candidates: recruiters see own + their client's; admins see all; client_viewer sees their client's
CREATE POLICY "candidates_select" ON public.candidates FOR SELECT USING (
  public.current_user_role() = 'admin'
  OR recruiter_id = auth.uid()
  OR (public.current_user_role() = 'client_viewer' AND client_id = public.current_user_client_id())
);
CREATE POLICY "candidates_insert_recruiter" ON public.candidates FOR INSERT
  WITH CHECK (recruiter_id = auth.uid() OR public.current_user_role() = 'admin');
CREATE POLICY "candidates_update_recruiter" ON public.candidates FOR UPDATE USING (
  recruiter_id = auth.uid() OR public.current_user_role() = 'admin'
);

-- verifications: follow candidate visibility
CREATE POLICY "verifications_select" ON public.verifications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.candidates c WHERE c.id = candidate_id
    AND (
      public.current_user_role() = 'admin'
      OR c.recruiter_id = auth.uid()
      OR (public.current_user_role() = 'client_viewer' AND c.client_id = public.current_user_client_id())
    )
  )
);
CREATE POLICY "verifications_insert_service" ON public.verifications FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin' OR auth.uid() IS NOT NULL);

-- webhook_events: service role only (inserts bypass RLS); admins can read
CREATE POLICY "webhook_events_admin" ON public.webhook_events FOR SELECT USING (public.current_user_role() = 'admin');

-- audit_log: recruiter sees own candidate audits; admins see all
CREATE POLICY "audit_log_select" ON public.audit_log FOR SELECT USING (
  public.current_user_role() = 'admin'
  OR actor_id = auth.uid()
);
