import { createServiceClient } from './supabase/server'

export async function logAudit(
  action: string,
  options: { actorId?: string; candidateId?: string; meta?: Record<string, unknown> } = {}
) {
  const supabase = createServiceClient()
  await supabase.from('audit_log').insert({
    actor_id: options.actorId ?? null,
    action,
    candidate_id: options.candidateId ?? null,
    meta: options.meta ?? {},
  })
}
