#!/usr/bin/env node
/**
 * Run once at setup: creates the Didit C1 workflow and registers the webhook destination.
 * Usage: node scripts/setup-didit.mjs
 * Requires .env.local to have DIDIT_API_KEY and NEXT_PUBLIC_APP_URL set.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually
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
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://truehyre.vercel.app'

if (!KEY) {
  console.error('DIDIT_API_KEY not set in .env.local')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': KEY,
}

async function createWorkflow() {
  const res = await fetch(`${BASE}/v3/workflows/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      workflow_label: 'TrueHire C1',
      features: [
        { feature: 'OCR' },
        { feature: 'LIVENESS', config: { face_liveness_method: 'PASSIVE' } },
        { feature: 'FACE_MATCH' },
        { feature: 'IP_ANALYSIS' },
      ],
    }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`createWorkflow ${res.status}: ${JSON.stringify(body)}`)
  return body
}

async function registerWebhook() {
  const res = await fetch(`${BASE}/v3/webhook/destinations/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      url: `${APP_URL}/api/webhooks/didit`,
      label: 'prod',
      subscribed_events: ['status.updated', 'data.updated'],
    }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`registerWebhook ${res.status}: ${JSON.stringify(body)}`)
  return body
}

console.log('Creating Didit workflow C1...')
const workflow = await createWorkflow()
console.log('Workflow created:', workflow)

console.log('\nRegistering webhook destination...')
const webhook = await registerWebhook()
console.log('Webhook registered:', webhook)

const workflowId = workflow.uuid || workflow.id || workflow.workflow_id
const webhookSecret = webhook.secret_shared_key || webhook.secret

console.log('\n=== ADD THESE TO .env.local AND VERCEL ENV VARS ===')
console.log(`DIDIT_WORKFLOW_C1=${workflowId}`)
console.log(`DIDIT_WEBHOOK_SECRET=${webhookSecret}`)
console.log('====================================================')
