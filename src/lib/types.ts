export type UserRole = 'admin' | 'recruiter' | 'client_viewer'

export type CandidateStatus =
  | 'pending'
  | 'not_started'
  | 'in_progress'
  | 'awaiting_user'
  | 'in_review'
  | 'approved'
  | 'declined'
  | 'resubmitted'
  | 'abandoned'
  | 'expired'
  | 'kyc_expired'

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Client {
  id: string
  name: string
  contact: string | null
  org_id: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  client_id: string | null
  org_id: string | null
}

export interface Invitation {
  id: string
  org_id: string
  email: string
  role: UserRole
  token: string
  invited_by: string | null
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export interface Candidate {
  id: string
  full_name: string
  email: string
  phone: string | null
  role_applied: string | null
  client_id: string | null
  recruiter_id: string
  didit_session_id: string | null
  overall_status: CandidateStatus
  aml_enabled: boolean
  created_at: string
  clients?: { name: string }
}

export interface Verification {
  id: string
  candidate_id: string
  checkpoint: 'C1' | 'C2' | 'C3' | null
  didit_session_id: string
  workflow_id: string
  status: CandidateStatus
  decision_json: DiditDecision | null
  face_match_score: number | null
  liveness_score: number | null
  aml_hits: number | null
  session_url: string | null
  reference_image_url: string | null
  duplicate_face_flag: boolean
  duplicate_candidate_id: string | null
  created_at: string
  completed_at: string | null
}

export interface DiditDecision {
  session_id: string
  status: string
  vendor_data?: string
  id_verifications?: IdVerification[]
  liveness_checks?: LivenessCheck[]
  face_matches?: FaceMatch[]
  ip_analyses?: IpAnalysis[]
  aml_screenings?: AmlScreening[]
}

export interface DiditWarning {
  risk?: string
  feature?: string
  node_id?: string
  log_type?: string
  additional_data?: Record<string, unknown>
  long_description?: string
  short_description?: string
}

export interface IdVerification {
  name?: string
  document_type?: string
  document_number?: string
  dob?: string
  nationality?: string
  expiration?: string
  warnings?: (string | DiditWarning)[]
}

export interface LivenessCheck {
  status: string
  score: number
  method: string
}

export interface FaceMatch {
  status: string
  score: number
  images?: Record<string, string>
  warnings?: string[]
}

export interface IpAnalysis {
  vpn: boolean
  proxy: boolean
  tor: boolean
  hosting: boolean
  risk_score: number
}

export interface AmlScreening {
  status: string
  total_hits: number
  hits?: AmlHit[]
}

export interface AmlHit {
  name?: string
  match_type?: string
  categories?: string[]
  risk?: string
  feature?: string
  node_id?: string
  log_type?: string
  additional_data?: Record<string, unknown>
  long_description?: string
  short_description?: string
}

export interface WebhookEvent {
  id: string
  session_id: string
  webhook_type: string
  timestamp: number
  payload: Record<string, unknown>
}

export interface AuditEntry {
  id: string
  actor_id: string | null
  action: string
  candidate_id: string | null
  meta: Record<string, unknown>
  created_at: string
}
