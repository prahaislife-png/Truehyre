#!/usr/bin/env node
/**
 * Creates the C2/C3 active-liveness re-check workflow.
 * Usage: node scripts/setup-c2c3.mjs
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'

try {
  const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length && !key.startsWith('#')) {
      process.env[key.trim()] = rest.join('=').trim()
    }
  }
} catch {}

const BASE = 'https://verification.didit.me'
const KEY = process.env.DIDIT_API_KEY
if (!KEY) { console.error('DIDIT_API_KEY not set'); process.exit(1) }

const headers = { 'Content-Type': 'application/json', 'x-api-key': KEY }

const res = await fetch(`${BASE}/v3/workflows/`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    workflow_label: 'TrueHire Identity Recheck (C2/C3)',
    features: [
      { feature: 'LIVENESS', config: { face_liveness_method: 'ACTIVE_3D' } },
    ],
  }),
})
const workflow = await res.json()
if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(workflow)}`)

const id = workflow.uuid || workflow.workflow_id
console.log('\n=== ADD TO .env.local AND VERCEL ENV VARS ===')
console.log(`DIDIT_WORKFLOW_RECHECK=${id}`)
console.log('=============================================')
