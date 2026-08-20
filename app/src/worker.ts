/**
 * Cloudflare Worker entry point.
 * Handles /api/* routes and falls through to static assets for everything else.
 */

import { handleOptions, jsonResponse } from './worker/lib/responses'
import { isValidUUID } from './worker/lib/security'
import { supabaseGet } from './worker/lib/supabase'
import { handleAudioFile, handleAudioManifest, parseByteRange } from './worker/routes/audio'
import {
  handleBalance,
  handleCancelSubscription,
  handleCreateCheckout,
  handleCreatePortal,
  handleSubscriptionInfo,
  handleWebhook,
} from './worker/routes/billing'
import { handleAdminIssues } from './worker/routes/adminIssues'
import { handleAdminMetricsUsers } from './worker/routes/adminMetrics'
import { handleChat } from './worker/routes/chat'
import { handleVoiceSession } from './worker/routes/voice'
import { handleEditionPatches } from './worker/routes/editionPatches'
import { handleScheduled, sendEmail } from './worker/routes/emails'
import {
  changedSegment,
  fetchParagraphContext,
  handleReportIssue,
  queueAudioRegen,
  tryCommentReplacement,
  upsertEditionPatch,
  validateCorrectedParagraph,
} from './worker/routes/issueReports'
import { handleApproveFix } from './worker/routes/issueReview'
import { handleFixesCount, handleReportStatus } from './worker/routes/issueStatus'
import {
  handleIndexNowVerification,
  handleSeoAndStaticRequest,
  isBlockedBot,
} from './worker/routes/seo'

export { serveSpaWithMetaForTest } from './worker/routes/seo'

interface Env {
  ANTHROPIC_API_KEY: string
  OPENAI_API_KEY?: string
  INDEXNOW_KEY?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_PREMIUM?: string
  STRIPE_PRICE_CHAT_100?: string
  STRIPE_PRICE_CHAT_200?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  BREVO_API_KEY?: string
  RATE_LIMIT?: KVNamespace
  AUDIO_BUCKET?: R2Bucket
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

// ===== Rate Limiting (KV-backed, persistent across cold starts) =====

const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_MAX = 10

async function checkRateLimit(key: string, kv?: KVNamespace, maxRequests = RATE_LIMIT_MAX): Promise<boolean> {
  if (!kv) return true // Graceful degradation if KV not configured

  try {
    const kvKey = `rl:${key}`
    const entry = await kv.get<{ count: number; resetAt: number }>(kvKey, 'json')
    const now = Date.now()

    if (!entry || now > entry.resetAt) {
      await kv.put(kvKey, JSON.stringify({ count: 1, resetAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000 }), {
        expirationTtl: RATE_LIMIT_WINDOW_SECONDS * 2,
      })
      return true
    }

    if (entry.count >= maxRequests) return false

    await kv.put(kvKey, JSON.stringify({ count: entry.count + 1, resetAt: entry.resetAt }), {
      expirationTtl: Math.max(1, Math.ceil((entry.resetAt - now) / 1000) + 1),
    })
    return true
  } catch {
    return true // If KV fails, allow the request (fail open — quota check is the real guard)
  }
}

async function verifyUser(env: Env, request: Request): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ') || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  const token = authHeader.slice(7)
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': env.SUPABASE_SERVICE_ROLE_KEY },
  })
  if (!res.ok) return null
  return res.json() as Promise<{ id: string; email: string }>
}

async function verifySiteAdmin(env: Env, request: Request): Promise<boolean> {
  const user = await verifyUser(env, request)
  if (!user || !isValidUUID(user.id)) return false

  const res = await supabaseGet(env, `site_admins?user_id=eq.${user.id}&select=user_id&limit=1`)
  if (!res.ok) return false
  const rows = await res.json() as { user_id: string }[]
  return rows.length > 0
}

export const parseByteRangeForTest = parseByteRange
export const tryCommentReplacementForTest = tryCommentReplacement
export const changedSegmentForTest = changedSegment
export const validateCorrectedParagraphForTest = validateCorrectedParagraph

// ===== Router =====

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const forwardedProto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')
    if ((url.hostname === 'www.tinct.app') || (url.hostname === 'tinct.app' && forwardedProto === 'http')) {
      url.hostname = 'tinct.app'
      url.protocol = 'https:'
      return new Response(null, {
        status: 308,
        headers: {
          Location: url.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // 403 known bot UAs immediately. Cheap (no KV, no upstream fetch) and
    // keeps the free KV tier intact. Honest crawlers honour this; the rest
    // burned through quota.
    if (isBlockedBot(request)) {
      return new Response('Forbidden', {
        status: 403,
        headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain' },
      })
    }

    // Handle CORS preflight for all /api/ routes
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return handleOptions(request)
    }

    const indexNowResponse = handleIndexNowVerification(request, env)
    if (indexNowResponse) return indexNowResponse

    switch (url.pathname) {
      case '/api/chat': return handleChat(request, env, ctx, verifyUser, checkRateLimit)
      case '/api/voice-session': return handleVoiceSession(request, env, ctx, verifyUser, checkRateLimit)
      case '/api/balance': return handleBalance(request, env, verifyUser)
      case '/api/create-checkout': return handleCreateCheckout(request, env, verifyUser)
      case '/api/webhook': return handleWebhook(request, env)
      case '/api/create-portal': return handleCreatePortal(request, env, verifyUser)
      case '/api/cancel-subscription': return handleCancelSubscription(request, env, verifyUser)
      case '/api/subscription-info': return handleSubscriptionInfo(request, env, verifyUser)
      case '/api/report-issue': return handleReportIssue(request, env, ctx, verifyUser, sendEmail)
      case '/api/report-status': return handleReportStatus(request, env)
      case '/api/approve-fix': return handleApproveFix(request, env, {
        fetchParagraphContext,
        tryCommentReplacement,
        validateCorrectedParagraph,
        upsertEditionPatch,
        queueAudioRegen,
        sendEmail,
      })
      case '/api/admin/issues': return handleAdminIssues(request, env, verifySiteAdmin)
      case '/api/admin/metrics-users': return handleAdminMetricsUsers(request, env, verifySiteAdmin)
      case '/api/fixes-count': return handleFixesCount(request, env, verifyUser)
      case '/api/edition-patches': return handleEditionPatches(request, env, checkRateLimit)
      case '/api/audio-manifest': return handleAudioManifest(request, env)
      case '/api/audio-file': return handleAudioFile(request, env)
    }

    return handleSeoAndStaticRequest(request, env, ctx)
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(env))
  },
}
