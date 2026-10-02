/**
 * Per-reader AI and audio cost ledger (public.ai_usage_events).
 *
 * One row per paid event, metadata only: never message text, prompts, audio or
 * search queries. Writes are fire-and-forget (`ctx.waitUntil`), swallow every
 * failure and never touch the user's response. The pricing table below is the
 * single place a price lives; bump AI_PRICING_VERSION whenever it changes.
 */
import { supabaseInsertMinimal, type SupabaseEnv } from './supabase'

/**
 * PRICING, version 2026-09-30. Sources (each fetched from the provider's own
 * pricing page on 2026-09-30, read through a page summariser, so re-check any
 * figure before relying on it for an invoice):
 *  - Anthropic, platform.claude.com/docs/en/about-claude/pricing: Claude Sonnet 5
 *    and 5.5 are $2/MTok input, $10/MTok output, cache read $0.20/MTok, 5-minute
 *    cache write 1.25x input ($2.50). VERIFIED. The 1-hour write (2x) is not
 *    used by this app, so cache_write_tokens is priced at the 5-minute rate.
 *  - xAI, docs.x.ai/docs/models: Speech to Speech (grok-voice-think-fast-2.0)
 *    $0.08 per connected minute ($4.80/hr), matching docs/voice-grok-2026-09-18.md.
 *    VERIFIED for the page's named model; the app requests `grok-voice-latest`,
 *    an alias assumed to bill at the same rate. UNVERIFIED alias.
 *  - xAI Text to Speech: $15.00 per 1M characters (same page). VERIFIED. This is
 *    the rate for `grok-tts-v1`; narration.ts's own ceilings are in UTF-8 bytes
 *    (for English text bytes ~= characters).
 *  - OpenAI, developers.openai.com/api/docs/pricing: gpt-4.1 $2.00/MTok input,
 *    $0.50 cached input, $8.00 output; web search tool $10.00 per 1,000 calls for
 *    non-reasoning models, search content tokens free. VERIFIED.
 */
export const AI_PRICING_VERSION = '2026-09-30'

export interface AnthropicRates { inputPerMTok: number; outputPerMTok: number; cacheReadPerMTok: number; cacheWritePerMTok: number }

const SONNET_5: AnthropicRates = { inputPerMTok: 2, outputPerMTok: 10, cacheReadPerMTok: 0.2, cacheWritePerMTok: 2.5 }
/** Haiku 4.5 list price ($1 / $5 per MTok); Catch me up's recaps. Not re-checked against the live pricing page. */
const HAIKU_4_5: AnthropicRates = { inputPerMTok: 1, outputPerMTok: 5, cacheReadPerMTok: 0.1, cacheWritePerMTok: 1.25 }

export const AI_PRICING = {
  version: AI_PRICING_VERSION,
  anthropic: {
    'claude-sonnet-5': SONNET_5,
    'claude-sonnet-5.5': SONNET_5,
    'claude-haiku-4-5-20251001': HAIKU_4_5,
    'claude-haiku-4-5': HAIKU_4_5,
  } as Record<string, AnthropicRates>,
  /** Rates used for an Anthropic model this table does not name. */
  anthropicFallback: SONNET_5,
  xai: {
    voicePerMinute: 0.08,
    ttsPerMChars: 15,
  },
  openai: {
    'gpt-4.1': { inputPerMTok: 2, cachedInputPerMTok: 0.5, outputPerMTok: 8 },
    webSearchPerCall: 0.01,
  },
} as const

export type AiFeature =
  | 'chat' | 'explain' | 'librarian' | 'recap' | 'lab_chat' | 'talk'
  | 'narration_generate' | 'narration_listen' | 'source_search'
export type AiProvider = 'anthropic' | 'xai' | 'openai'

export interface AnthropicUsage {
  input_tokens?: number
  output_tokens?: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
}

const round5 = (value: number) => Math.round(value * 100_000) / 100_000
const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0)

export function anthropicCostUsd(model: string, usage: AnthropicUsage): number {
  const rates = AI_PRICING.anthropic[model] ?? AI_PRICING.anthropicFallback
  return round5((
    count(usage.input_tokens) * rates.inputPerMTok
    + count(usage.output_tokens) * rates.outputPerMTok
    + count(usage.cache_read_input_tokens) * rates.cacheReadPerMTok
    + count(usage.cache_creation_input_tokens) * rates.cacheWritePerMTok
  ) / 1_000_000)
}

export function talkCostUsd(seconds: number): number {
  return round5(Math.max(0, seconds) / 60 * AI_PRICING.xai.voicePerMinute)
}

export function narrationCostUsd(chars: number): number {
  return round5(Math.max(0, chars) / 1_000_000 * AI_PRICING.xai.ttsPerMChars)
}

export interface OpenAiUsage { input_tokens?: number; output_tokens?: number; input_tokens_details?: { cached_tokens?: number } }

export function sourceSearchCostUsd(usage: OpenAiUsage | undefined, searches: number): number {
  const rates = AI_PRICING.openai['gpt-4.1']
  const cached = Math.min(count(usage?.input_tokens_details?.cached_tokens), count(usage?.input_tokens))
  return round5((
    (count(usage?.input_tokens) - cached) * rates.inputPerMTok
    + cached * rates.cachedInputPerMTok
    + count(usage?.output_tokens) * rates.outputPerMTok
  ) / 1_000_000 + Math.max(0, searches) * AI_PRICING.openai.webSearchPerCall)
}

/** The exact stored shape. Adding a field here is a schema change. */
export interface AiUsageRow {
  user_id: string | null
  guest_key: string | null
  feature: AiFeature
  provider: AiProvider
  model: string
  input_tokens: number | null
  output_tokens: number | null
  cache_read_tokens: number | null
  cache_write_tokens: number | null
  seconds: number | null
  chars: number | null
  cache_hit: boolean | null
  book_id: string | null
  cost_usd: number
}

export type AiUsageDraft = Partial<Omit<AiUsageRow, 'user_id' | 'guest_key'>> & Pick<AiUsageRow, 'feature' | 'provider' | 'model' | 'cost_usd'>

/** Who a row belongs to. `resolveUser` runs inside the background write, off the response path. */
export interface AiIdentity {
  userId?: string | null
  /** Raw client IP (or "warm"); hashed before storage. */
  guest?: string | null
  resolveUser?: () => Promise<string | null>
}

export type LedgerEnv = SupabaseEnv & { AI_LEDGER_SALT?: string }
type WaitUntil = { waitUntil(promise: Promise<unknown>): void }

/** Admin pre-warming is stored under this literal key, not hashed. */
export const WARM_GUEST_KEY = 'warm'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** HMAC of the rate-limit key, so stored guest keys cannot be reversed by enumerating IPs. */
export async function hashGuestKey(env: LedgerEnv, raw: string): Promise<string> {
  const secret = env.AI_LEDGER_SALT || env.SUPABASE_SERVICE_ROLE_KEY || 'tinct-guest'
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`guest:${raw}`)))
  return Array.from(mac.slice(0, 10)).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

const int = (value: number | null | undefined) => (value == null ? null : count(value))
const clean = (value: string | null | undefined, max: number) => (typeof value === 'string' && value ? value.slice(0, max) : null)

/** Whitelist copy: nothing outside the schema, and no text, can be stored. */
export function buildUsageRow(draft: AiUsageDraft, owner: { userId: string | null; guestKey: string | null }): AiUsageRow {
  const userId = owner.userId && UUID.test(owner.userId) ? owner.userId : null
  return {
    user_id: userId,
    guest_key: userId ? null : owner.guestKey,
    feature: draft.feature,
    provider: draft.provider,
    model: String(draft.model).slice(0, 80),
    input_tokens: int(draft.input_tokens),
    output_tokens: int(draft.output_tokens),
    cache_read_tokens: int(draft.cache_read_tokens),
    cache_write_tokens: int(draft.cache_write_tokens),
    seconds: draft.seconds == null ? null : Math.max(0, Math.round(draft.seconds * 100) / 100),
    chars: int(draft.chars),
    cache_hit: draft.cache_hit ?? null,
    book_id: clean(draft.book_id, 64),
    cost_usd: round5(Math.max(0, draft.cost_usd)),
  }
}

/**
 * Queue one ledger row. Never throws, never awaits on the caller's path, and
 * logs (without content) when the write fails.
 */
export function recordAiUsage(env: LedgerEnv, ctx: WaitUntil | undefined, identity: AiIdentity, draft: AiUsageDraft): void {
  try {
    const task = (async () => {
      try {
        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return
        const userId = identity.userId ?? (identity.resolveUser ? await identity.resolveUser().catch(() => null) : null)
        const guestKey = !userId && identity.guest ? (identity.guest === WARM_GUEST_KEY ? WARM_GUEST_KEY : await hashGuestKey(env, identity.guest)) : null
        const response = await supabaseInsertMinimal(env, 'ai_usage_events', buildUsageRow(draft, { userId: userId ?? null, guestKey }))
        if (!response.ok) console.warn(JSON.stringify({ event: 'ai_usage_write_failed', status: response.status, feature: draft.feature }))
      } catch (error) {
        console.warn(JSON.stringify({ event: 'ai_usage_write_failed', error: error instanceof Error ? error.name : 'unknown', feature: draft.feature }))
      }
    })()
    if (ctx) ctx.waitUntil(task)
  } catch { /* the ledger must never fail a request */ }
}

/** A per-request recorder bound to one identity, feature and book. */
export interface AiMeter {
  anthropic(usage: AnthropicUsage | null | undefined, model?: string): void
  sourceSearch(usage: OpenAiUsage | undefined, searches: number): void
}

export function createAiMeter(env: LedgerEnv, ctx: WaitUntil | undefined, identity: AiIdentity, options: { feature: AiFeature; bookId?: string | null; model: string }): AiMeter {
  return {
    anthropic(usage, model = options.model) {
      if (!usage) return
      recordAiUsage(env, ctx, identity, {
        feature: options.feature, provider: 'anthropic', model, book_id: options.bookId ?? null,
        input_tokens: usage.input_tokens ?? 0, output_tokens: usage.output_tokens ?? 0,
        cache_read_tokens: usage.cache_read_input_tokens ?? 0, cache_write_tokens: usage.cache_creation_input_tokens ?? 0,
        cost_usd: anthropicCostUsd(model, usage),
      })
    },
    sourceSearch(usage, searches) {
      recordAiUsage(env, ctx, identity, {
        feature: 'source_search', provider: 'openai', model: 'gpt-4.1', book_id: options.bookId ?? null,
        input_tokens: usage?.input_tokens ?? 0, output_tokens: usage?.output_tokens ?? 0,
        cache_read_tokens: usage?.input_tokens_details?.cached_tokens ?? 0,
        cost_usd: sourceSearchCostUsd(usage, searches),
      })
    },
  }
}

/** Client IP used for signed-out rate limits; the ledger hashes the same key. */
export function requestGuestKey(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'lab-guest'
}
