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
import { createAllowanceGate, loadPremiumAccess, requestAllowsAiFeature } from './worker/lib/aiAllowance'
import { handleAiAllowance } from './worker/routes/aiAllowance'
import type { UsageCoordinator } from './worker/usageCoordinator'
import type { ShareStore } from './worker/shareStore'
import { handleShareApi, handleSharePage } from './worker/routes/share'
import { isValidUUID } from './worker/lib/security'
import { supabaseGet } from './worker/lib/supabase'
import { handleAudioFile, handleAudioManifest, parseByteRange } from './worker/routes/audio'
import { handleNarration } from './worker/routes/narration'
import { handleOwnAudio, handleOwnEnsure } from './worker/routes/ownBookNarration'
import { handleOwnCatchUp } from './worker/routes/ownCatchUp'
import {
  handleBalance,
  handleCancelSubscription,
  handleCreateCheckout,
  handleCreatePortal,
  handleSubscriptionInfo,
  handleWebhook,
} from './worker/routes/billing'
import { handleAdminIssues } from './worker/routes/adminIssues'
import { handleEvents, recordServerEvent } from './worker/routes/events'
import { handleAdminMetricsUsers } from './worker/routes/adminMetrics'
import { handleAdminDeleteUser, handleAdminExportUser } from './worker/routes/adminAccounts'
import { handleChat, handleLabChat } from './worker/routes/chat'
import { handleDictation } from './worker/routes/dictation'
import { handleLabVoiceSession, handleVoiceSession, handleVoiceUsage } from './worker/routes/voice'
import { handleLabPosition } from './worker/routes/labPosition'
import { handleLabChatHistory } from './worker/routes/labChatHistory'
import { handleLabRecap } from './worker/routes/labRecap'
import { handleLabCatchUp } from './worker/routes/labCatchUp'
import { handleLabChapterNotes } from './worker/routes/labChapterNotes'
import { handleUserBooks } from './worker/routes/userBooks'
import { COVER_RUN_LIMIT, handlePublicBooks, handlePublicEditionData, runPublicCoverJobs } from './worker/routes/publicBooks'
import { MODERN_EDITION_CRON, grantModernEdition, releaseModernCheckout, runModernEditionJobs } from './worker/routes/publicBookModern'
import { handleEditionPatches } from './worker/routes/editionPatches'
import { handleScheduled, sendEmail } from './worker/routes/emails'
import { handleEmailLink, isEmailLinkRequest } from './worker/routes/emailLinks'
import { handleAdminAnnounceEmail } from './worker/routes/adminAnnounce'
import { runLifecycleCron } from './worker/lifecycle/runtime'
import { RETENTION_CRON, runRetentionCleanup } from './worker/routes/retention'
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
import { handleProfiles, isProfileApiPath, socialProfilesOn, type ProfileAuthUser } from './worker/routes/profiles'
import { isYouAssetPage, isYouPath, serveYouPage, withSocialMarkers } from './worker/routes/socialPages'
import {
  ADMIN_SOCIAL_PATHS,
  FRIENDS_META,
  FRIENDS_PATHS,
  handleSocial,
  isSocialApiPath,
  isSocialAssetPage,
  profileHandleFromPath,
  runLeaderboardCron,
  serveProfilePage,
  serveSocialAssetPage,
  type SocialDeps,
} from './worker/routes/social'
import { socialFriendsOn } from './social/socialRules'
import {
  YOUR_READING_PATHS,
  handleIndexNowVerification,
  handleSeoAndStaticRequest,
  isBlockedBot,
  isYourReadingAssetPage,
  serveNotFoundPage,
  serveYourReadingPage,
} from './worker/routes/seo'
import { handleReadingTime, readingTimeEnabled } from './worker/routes/readingTime'
import { BEAT_MIN_GAP_MS } from './readingTime/model'


interface Env {
  READER_POSITION?: DurableObjectNamespace<ReaderPositionCoordinator>
  RECAP_PREPARATION?: DurableObjectNamespace<RecapPreparationCoordinator>
  /** Atomic rate-limit windows and the daily ceiling for signed-out AI. */
  USAGE_COORDINATOR?: DurableObjectNamespace<UsageCoordinator>
  /** Shared highlight links (routes/share.ts). */
  SHARE_STORE?: DurableObjectNamespace<ShareStore>
  /** Whole US cents per UTC day for signed-out AI; see lib/aiSpend.ts. */
  GUEST_AI_DAILY_CENTS?: string
  ANTHROPIC_API_KEY: string
  OPENAI_API_KEY?: string
  XAI_API_KEY?: string
  INDEXNOW_KEY?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_PREMIUM?: string
  STRIPE_PRICE_PREMIUM_YEARLY?: string
  STRIPE_PRICE_CHAT_100?: string
  STRIPE_PRICE_CHAT_200?: string
  STRIPE_PRICE_TOP_UP_10?: string
  /** The $10 top-up under the name the Cloudflare secret was created with; read as STRIPE_PRICE_TOP_UP_10. */
  STRIPE_PRICE_TOPUP_10?: string
  STRIPE_AUTOMATIC_TAX?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  BREVO_API_KEY?: string
  /** "1": lifecycle emails (src/worker/lifecycle/runtime.ts). Off by default. */
  LIFECYCLE_EMAILS?: string
  /** "1": the trial-ending / trial-ended notices. Off until checkout is confirmed. */
  LIFECYCLE_TRIAL_NOTICES?: string
  /** Secret: signs one-click unsubscribe and confirm links in lifecycle emails. */
  EMAIL_LINK_SECRET?: string
  /** Optional Reply-To for lifecycle emails (Anders's inbox). */
  LIFECYCLE_REPLY_TO?: string
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
  /** "1": read-aloud of readers' own books (routes/ownBookNarration.ts). Off when absent. */
  OWN_BOOK_NARRATION?: string
  OWN_BOOK_NARRATION_MONTHLY_USD?: string
  OWN_BOOK_NARRATION_GLOBAL_MONTHLY_USD?: string
  RATE_LIMIT?: KVNamespace
  AUDIO_BUCKET?: R2Bucket
  /** Private bucket for readers' own PDF/EPUB files (routes/userBooks.ts). Never public. */
  USER_BOOKS?: R2Bucket
  /** Optional dedicated bucket for added public-domain books; AUDIO_BUCKET's public-books/ prefix otherwise (routes/publicBooks.ts). */
  PUBLIC_BOOKS?: R2Bucket
  /** "1": a model places added books the rules cannot. Production only; off by default. */
  PUBLIC_BOOK_AI_CLASSIFY?: string
  /** "1": queue painted xAI covers for added books. Production only; off by default. */
  PUBLIC_BOOK_PAINTED_COVERS?: string
  /** "1": offer and generate paid Modern English editions of added books (routes/publicBookModern.ts). Off by default. */
  PUBLIC_BOOK_MODERN_EDITIONS?: string
  PUBLIC_BOOK_MODERN_MODEL?: string
  /** Stripe prices of the four Modern English tiers (secrets). */
  STRIPE_PRICE_MODERN_T1?: string
  STRIPE_PRICE_MODERN_T2?: string
  STRIPE_PRICE_MODERN_T3?: string
  STRIPE_PRICE_MODERN_T4?: string
  /** "1": reading time ledger, the new account-sheet block and Your reading (routes/readingTime.ts). Off by default. */
  SOCIAL_READING_TIME?: string
  /** "1": profiles (social ship 2). Off by default: no profile route, page or marker exists. */
  SOCIAL_PROFILES?: string
  /** "1" (with SOCIAL_PROFILES "1"): social ship 3, follows, leaderboard, @profiles (routes/social.ts). Off by default. */
  SOCIAL_FRIENDS?: string
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
    // The AI allowance (lib/aiAllowance.ts); with the switch off it reads nothing.
    const allowanceGate = createAllowanceGate(env)
    const allowsAi = (feature: 'recap' | 'chapter_notes' | 'catch_up') => (req: Request) => requestAllowsAiFeature(allowanceGate, ledgerUser(env), req, feature)

    // Signed unsubscribe / confirm links from lifecycle emails. Without
    // EMAIL_LINK_SECRET (no such link was ever sent) this never matches.
    if (isEmailLinkRequest(url, env)) return handleEmailLink(request, env)

    if (url.pathname === '/api/share' || url.pathname.startsWith('/api/share/')) {
      return handleShareApi(request, env, ctx, { verifyUser: req => verifyUser(env, req), checkRateLimit })
    }
    const sharePage = url.pathname.startsWith('/q/') ? await handleSharePage(request, env, ctx) : null
    if (sharePage) return sharePage

    if (url.pathname === '/api/user-books' || url.pathname.startsWith('/api/user-books/')) {
      return handleUserBooks(request, env, { verifyUser: req => verifyUser(env, req), checkRateLimit, premiumAccess: userId => loadPremiumAccess(env, userId) })
    }

    if (url.pathname === '/api/public-books' || url.pathname.startsWith('/api/public-books/')) {
      const windows = env.USAGE_COORDINATOR
      return handlePublicBooks(request, env, {
        verifyUser: req => verifyUser(env, req),
        checkRateLimit,
        // Fail closed like the rate limiter: without the coordinator nothing is imported.
        countDaily: async (key, limit) => { try { return windows ? await windows.getByName(`rl:${key}`).hit(limit, 86_400_000) : false } catch { return false } },
        acquireLock: async bookId => { try { return windows ? await windows.getByName(`rl:public-book-lock:${bookId}`).hit(1, 600_000) : false } catch { return false } },
        premiumAccess: userId => loadPremiumAccess(env, userId),
        waitUntil: promise => ctx.waitUntil(promise),
      })
    }
    if (url.pathname.startsWith('/data/editions/pd-')) {
      const edition = await handlePublicEditionData(request, env)
      if (edition) return edition
    }

    if (url.pathname === '/api/reading-time' || url.pathname.startsWith('/api/reading-time/')) {
      const windows = env.USAGE_COORDINATOR
      // Atomic and fail-closed, like the rate limiter: no coordinator, no credit.
      const once = async (key: string, windowMs: number) => { try { return windows ? await windows.getByName(`rl:${key}`).hit(1, windowMs) : false } catch { return false } }
      return handleReadingTime(request, env, {
        verifyUser: req => verifyUser(env, req),
        beatGate: userId => once(`reading-beat:${userId}`, BEAT_MIN_GAP_MS),
        flushOnce: (userId, flushId) => once(`reading-flush:${userId}:${flushId}`, 30 * 86_400_000),
        checkRateLimit,
      })
    }
    // Your reading: a page only while reading time is switched on.
    if ((request.method === 'GET' || request.method === 'HEAD') && readingTimeEnabled(env) && YOUR_READING_PATHS.has(url.pathname)) {
      return serveYourReadingPage(request, env)
    }
    if ((request.method === 'GET' || request.method === 'HEAD') && !readingTimeEnabled(env) && isYourReadingAssetPage(url.pathname)) {
      return serveNotFoundPage(request, env)
    }
    // Profiles (social ship 2): nothing here runs while SOCIAL_PROFILES is off.
    const social = socialProfilesOn(env)
    // Social (ship 3): nothing here runs unless SOCIAL_FRIENDS and SOCIAL_PROFILES are both on.
    const friends = socialFriendsOn(env)
    const pageRequest = request.method === 'GET' || request.method === 'HEAD'
    if (social && isProfileApiPath(url.pathname)) {
      return handleProfiles(request, env, {
        verifyUser: req => verifyUser(env, req) as Promise<ProfileAuthUser | null>,
        // The brief's profile events land in the funnel while ship 3 is on.
        track: friends ? (name, userId, props) => recordServerEvent(env, ctx, { name, userId, props }) : undefined,
      })
    }
    if (social && pageRequest && isYouPath(url.pathname)) {
      const you = await serveYouPage(request, env, friends ? FRIENDS_META : '')
      if (you) return you
    }
    if (!social && pageRequest && isYouAssetPage(url.pathname)) return serveNotFoundPage(request, env)
    if (friends) {
      const socialDeps: SocialDeps = {
        verifyUser: req => verifyUser(env, req) as Promise<ProfileAuthUser | null>,
        verifySiteAdmin: req => verifySiteAdmin(env, req),
        checkRateLimit,
        track: (name, userId, props) => recordServerEvent(env, ctx, { name, userId, props }),
      }
      if (isSocialApiPath(url.pathname)) return handleSocial(request, env, socialDeps)
      if (pageRequest) {
        const handle = profileHandleFromPath(url.pathname)
        if (handle) return serveProfilePage(request, env, socialDeps, handle)
        const asset = FRIENDS_PATHS.has(url.pathname) ? '/lab/friends/' : ADMIN_SOCIAL_PATHS.has(url.pathname) ? '/lab/admin-social/' : null
        if (asset) {
          const page = await serveSocialAssetPage(request, env, asset)
          if (page) return page
        }
      }
    } else if (pageRequest && isSocialAssetPage(url.pathname)) {
      return serveNotFoundPage(request, env)
    }

    // Read-aloud of a reader's own book: separate routes, storage and budget (ownBookNarration.ts).
    if (url.pathname === '/api/narration/own/ensure') return handleOwnEnsure(request, env, ctx, { verifyUser, verifySiteAdmin, checkRateLimit })
    if (url.pathname === '/api/narration/own/audio') return handleOwnAudio(request, env, Date.now())
    // Catch me up on a reader's own book: one chapter per request, recap kept privately (ownCatchUp.ts).
    if (url.pathname === '/api/own-catch-up') return handleOwnCatchUp(request, env, ctx, { verifyUser, checkRateLimit, reserveGuestSpend, allowsAi: allowsAi('catch_up') })
    if (url.pathname.startsWith('/api/narration/')) {
      return handleNarration(request, env, ctx, { verifyUser, verifySiteAdmin, checkRateLimit })
    }

    switch (url.pathname) {
      case '/api/featured-preview': return handleFeaturedPreview(request, env, verifySiteAdmin)
      case '/api/chat': return handleChat(request, env, ctx, verifyUser, checkRateLimit, { allowanceGate })
      case '/api/lab-chat': return handleLabChat(request, env, ctx, checkRateLimit, reserveGuestSpend)
      case '/api/voice-research': return handleVoiceResearch(request, env, verifyUser, checkRateLimit, ctx, allowanceGate)
      case '/api/voice-session': return handleVoiceSession(request, env, ctx, verifyUser, checkRateLimit, allowanceGate)
      case '/api/events': return handleEvents(request, env, ctx, verifyUser, checkRateLimit)
      case '/api/dictation': return handleDictation(request, env, ctx, verifyUser, checkRateLimit)
      case '/api/voice-usage': return handleVoiceUsage(request, env, ctx, verifyUser, checkRateLimit)
      case '/api/lab-voice-session': return handleLabVoiceSession(request)
      case '/api/lab-position': return handleLabPosition(request, env, verifyUser)
      case '/api/lab-chat-history': return handleLabChatHistory(request, env, verifyUser)
      case '/api/recap-preparation': return handleRecapPreparation(request, env, verifyUser)
      case '/api/lab-recap': return handleLabRecap(request, env, ctx, checkRateLimit, { reserveGuestSpend, resolveUser: ledgerUser(env), allowsAi: allowsAi('recap'), prepared: async target => {
        if (!env.RECAP_PREPARATION) return null
        const user = await verifyUser(env, request)
        return user && isValidUUID(user.id) ? env.RECAP_PREPARATION.getByName(user.id).lookup(target) : null
      } })
      case '/api/lab-catch-up': return handleLabCatchUp(request, env, ctx, checkRateLimit, { reserveGuestSpend, resolveUser: ledgerUser(env), allowsAi: allowsAi('catch_up') })
      case '/api/lab-chapter-notes': return handleLabChapterNotes(request, env, ctx, checkRateLimit, { reserveGuestSpend, resolveUser: ledgerUser(env), allowsAi: allowsAi('chapter_notes') })
      case '/api/balance': return handleBalance(request, env, verifyUser)
      case '/api/create-checkout': return handleCreateCheckout(request, env, verifyUser, ctx)
      case '/api/webhook': return handleWebhook(request, env, ctx, {
        modernEdition: session => grantModernEdition(env, session, { waitUntil: promise => ctx.waitUntil(promise) }),
        modernRelease: session => releaseModernCheckout(env, session),
      })
      case '/api/create-portal': return handleCreatePortal(request, env, verifyUser)
      case '/api/cancel-subscription': return handleCancelSubscription(request, env, verifyUser)
      case '/api/subscription-info': return handleSubscriptionInfo(request, env, verifyUser)
      case '/api/ai-allowance': return handleAiAllowance(request, env, verifyUser, allowanceGate)
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
      case '/api/admin/export-user': return handleAdminExportUser(request, env, verifySiteAdmin)
      case '/api/admin/delete-user': return handleAdminDeleteUser(request, env, verifySiteAdmin)
      case '/api/admin/announce-email': if (env.LIFECYCLE_EMAILS === '1') return handleAdminAnnounceEmail(request, env, verifySiteAdmin)
        break
      case '/api/fixes-count': return handleFixesCount(request, env, verifyUser)
      case '/api/edition-patches': return handleEditionPatches(request, env, checkRateLimit)
      case '/api/audio-manifest': return handleAudioManifest(request, env)
      case '/api/audio-file': return handleAudioFile(request, env)
    }

    const page = await handleSeoAndStaticRequest(request, env, ctx)
    return social ? withSocialMarkers(page, request, friends ? FRIENDS_META : '') : page
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Each cron gets its own invocation: retention never re-runs the emails.
    if (event.cron === RETENTION_CRON) {
      ctx.waitUntil(runRetentionCleanup(env))
      // Painted covers for added public books (no-op unless PUBLIC_BOOK_PAINTED_COVERS=1).
      ctx.waitUntil(runPublicCoverJobs(env, { limit: COVER_RUN_LIMIT, backfill: true }).catch(() => null))
    }
    else if (event.cron === MODERN_EDITION_CRON) {
      // Modern English editions still being written (no-op unless PUBLIC_BOOK_MODERN_EDITIONS=1).
      ctx.waitUntil(runModernEditionJobs(env, { budgetMs: 8 * 60_000 }).catch(() => 0))
      // Painted covers too, so a new book is not left with a paper cover until 03:17
      // (no-op unless PUBLIC_BOOK_PAINTED_COVERS=1). A short budget: about 15 s per painting.
      ctx.waitUntil(runPublicCoverJobs(env, { limit: COVER_RUN_LIMIT, backfill: true, budgetMs: 60_000 }).catch(() => null))
      // Lifecycle emails: welcome every run, reading/trial emails hourly
      // (no-op unless LIFECYCLE_EMAILS=1; only the test aliases while gated).
      if (env.LIFECYCLE_EMAILS === '1') ctx.waitUntil(runLifecycleCron(env, event.scheduledTime).catch(error => console.error('[lifecycle]', error)))
      // The 7-day leaderboard, rebuilt hourly (no-op unless SOCIAL_FRIENDS and SOCIAL_PROFILES are on).
      if (socialFriendsOn(env)) ctx.waitUntil(runLeaderboardCron(env, event.scheduledTime).catch(() => false))
    }
    else ctx.waitUntil(handleScheduled(env))
  },
}
