import type { ReaderPositionCoordinator } from './worker/readerPositionCoordinator'
import { handleRecapPreparation } from './worker/routes/recapPreparation'
import type { RecapPreparationCoordinator } from './worker/recapPreparationCoordinator'
import { handleFeaturedPreview } from './worker/routes/featuredPreview'
import { handleVoiceResearch } from './worker/routes/voiceResearch'
/**
 * Cloudflare Worker entry point.
 * Handles /api/* routes and falls through to static assets for everything else.
 */

import { handleOptions, jsonResponse } from './worker/lib/responses'
import { createRateLimiter } from './worker/lib/rateLimit'
import { createGuestSpendReserver } from './worker/lib/aiSpend'
import type { UsageCoordinator } from './worker/usageCoordinator'
import { isValidUUID } from './worker/lib/security'
import { supabaseGet } from './worker/lib/supabase'
import { handleAudioFile, handleAudioManifest, parseByteRange } from './worker/routes/audio'
import { handleNarration } from './worker/routes/narration'
import {
  handleBalance,
  handleCancelSubscription,
  handleCreateCheckout,
  handleCreatePortal,
  handleSubscriptionInfo,
  handleWebhook,
} from './worker/routes/billing'
import { handleAdminIssues } from './worker/routes/adminIssues'
import { handleEvents } from './worker/routes/events'
import { handleAdminMetricsUsers } from './worker/routes/adminMetrics'
import { handleChat, handleLabChat } from './worker/routes/chat'
import { handleLabVoiceSession, handleVoiceSession, handleVoiceUsage } from './worker/routes/voice'
import { handleLabPosition } from './worker/routes/labPosition'
import { handleLabChatHistory } from './worker/routes/labChatHistory'
import { handleLabRecap } from './worker/routes/labRecap'
import { handleLabCatchUp } from './worker/routes/labCatchUp'
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


interface Env {
  READER_POSITION?: DurableObjectNamespace<ReaderPositionCoordinator>
  RECAP_PREPARATION?: DurableObjectNamespace<RecapPreparationCoordinator>
  /** Atomic rate-limit windows and the daily ceiling for signed-out AI. */
  USAGE_COORDINATOR?: DurableObjectNamespace<UsageCoordinator>
  /** Whole US cents per UTC day for signed-out AI; see lib/aiSpend.ts. */
  GUEST_AI_DAILY_CENTS?: string
  ANTHROPIC_API_KEY: string
  OPENAI_API_KEY?: string
  XAI_API_KEY?: string
  INDEXNOW_KEY?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_PREMIUM?: string
  STRIPE_PRICE_CHAT_100?: string
  STRIPE_PRICE_CHAT_200?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  BREVO_API_KEY?: string
  /** Fish Audio narration pilot (docs/fish-audio-pilot-2026-09-18.md). Secret; never sent to clients. */
  FISH_AUDIO_API_KEY?: string
  NARRATION_PILOT?: string
  NARRATION_MODEL?: string
  NARRATION_VOICE_A_ID?: string
  NARRATION_VOICE_A_LABEL?: string
  NARRATION_VOICE_B_ID?: string
  NARRATION_VOICE_B_LABEL?: string
  NARRATION_DAILY_BYTES?: string
  NARRATION_MONTHLY_BYTES?: string
  RATE_LIMIT?: KVNamespace
  AUDIO_BUCKET?: R2Bucket
  ASSETS: { fetch: (request: Request) => Promise<Response> }
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

/** Ledger attribution for routes that accept signed-out callers: resolved in the background write only. */
function ledgerUser(env: Env) {
  return async (request: Request): Promise<string | null> => {
    if (!request.headers.get('authorization')) return null
    const user = await verifyUser(env, request)
    return user && isValidUUID(user.id) ? user.id : null
  }
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

    // Atomic and fail-closed (see lib/rateLimit.ts).
    const checkRateLimit = createRateLimiter(env)
    const reserveGuestSpend = createGuestSpendReserver(env)

    if (url.pathname.startsWith('/api/narration/')) {
      return handleNarration(request, env, ctx, { verifyUser, verifySiteAdmin, checkRateLimit })
    }

    switch (url.pathname) {
      case '/api/featured-preview': return handleFeaturedPreview(request, env, verifySiteAdmin)
      case '/api/chat': return handleChat(request, env, ctx, verifyUser, checkRateLimit)
      case '/api/lab-chat': return handleLabChat(request, env, ctx, checkRateLimit, reserveGuestSpend)
      case '/api/voice-research': return handleVoiceResearch(request, env, verifyUser, checkRateLimit, ctx)
      case '/api/voice-session': return handleVoiceSession(request, env, ctx, verifyUser, checkRateLimit)
      case '/api/events': return handleEvents(request, env, ctx, verifyUser, checkRateLimit)
      case '/api/voice-usage': return handleVoiceUsage(request, env, ctx, verifyUser, checkRateLimit)
      case '/api/lab-voice-session': return handleLabVoiceSession(request)
      case '/api/lab-position': return handleLabPosition(request, env, verifyUser)
      case '/api/lab-chat-history': return handleLabChatHistory(request, env, verifyUser)
      case '/api/recap-preparation': return handleRecapPreparation(request, env, verifyUser)
      case '/api/lab-recap': return handleLabRecap(request, env, ctx, checkRateLimit, { reserveGuestSpend, resolveUser: ledgerUser(env), prepared: async target => {
        if (!env.RECAP_PREPARATION) return null
        const user = await verifyUser(env, request)
        return user && isValidUUID(user.id) ? env.RECAP_PREPARATION.getByName(user.id).lookup(target) : null
      } })
      case '/api/lab-catch-up': return handleLabCatchUp(request, env, ctx, checkRateLimit, { reserveGuestSpend, resolveUser: ledgerUser(env) })
      case '/api/balance': return handleBalance(request, env, verifyUser)
      case '/api/create-checkout': return handleCreateCheckout(request, env, verifyUser, ctx)
      case '/api/webhook': return handleWebhook(request, env, ctx)
      case '/api/create-portal': return handleCreatePortal(request, env, verifyUser)
      case '/api/cancel-subscription': return handleCancelSubscription(request, env, verifyUser)
      case '/api/subscription-info': return handleSubscriptionInfo(request, env, verifyUser)
      case '/api/report-issue': return handleReportIssue(request, env, ctx, verifyUser, sendEmail, { checkRateLimit, reserveGuestSpend })
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
