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
 *  - xAI Speech to Text, REST (grok-voice-transcribe-2.0): $0.10 per hour of
 *    audio, docs.x.ai/docs/models fetched 2026-10-07. VERIFIED. Chat dictation.
 *  - OpenAI, developers.openai.com/api/docs/pricing: gpt-4.1 $2.00/MTok input,
 *    $0.50 cached input, $8.00 output; web search tool $10.00 per 1,000 calls for
 *    non-reasoning models, search content tokens free. VERIFIED.
 *
 * Version 2026-10-09 adds:
 *  - xAI OCR of scanned own PDFs (model id grok-4-fast-non-reasoning, image
 *    input billed as input tokens): $1.25/MTok input, $2.50/MTok output.
 *    VERIFIED 9 Oct 2026 against GET api.x.ai/v1/language-models: that id is
 *    now served by grok-4.3 (prompt 12500, completion 25000 in 1e-10 USD per
 *    token), and a real 20-page test's `cost_in_usd_ticks` matched. The plan's
 *    $0.20/$0.50 was the old grok-4-fast price. The coordinator settles each
 *    call from the reply's own `cost_in_usd_ticks` when xAI sends it, so a
 *    later price change is still counted right; these rates are the fallback.
 */
/*
 * Version 2026-10-10 adds:
 *  - Modern English editions (worker/lib/modernEdition.ts, model id
 *    grok-4-fast-non-reasoning, retired 15 May 2026 and served and billed as
 *    grok-4.3): the same $1.25/MTok input, $2.50/MTok output, now named as the
 *    xAI text rates (textInputPerMTok / textOutputPerMTok) that OCR shares.
 *    Each call is settled from the reply's `cost_in_usd_ticks` when xAI sends
 *    it; these rates are the fallback.
 */
/*
 * Version 2026-10-15 adds the PDF reader's margin models (claude-api skill's
 * model table, cached 2026-10-06; re-check the live pricing page before any
 * invoice):
 *  - claude-sonnet-5-5: $2/MTok input, $10/MTok output, cache read $0.20,
 *    5-minute cache write 1.25x ($2.50): the same as Sonnet 5. (The earlier
 *    'claude-sonnet-5.5' key was not a model id; kept so old rows reprice the same.)
 *  - claude-haiku-5-5: two rate cards by prompt length (input + cache read +
 *    cache write): up to 100K tokens $0.10 input / $0.50 output, above it
 *    $0.50 / $2.50; cache reads 0.1x input, 5-minute writes 1.25x.
 */
export const AI_PRICING_VERSION = '2026-10-15'

export interface AnthropicRates { inputPerMTok: number; outputPerMTok: number; cacheReadPerMTok: number; cacheWritePerMTok: number }

const SONNET_5: AnthropicRates = { inputPerMTok: 2, outputPerMTok: 10, cacheReadPerMTok: 0.2, cacheWritePerMTok: 2.5 }
/** Haiku 4.5 list price ($1 / $5 per MTok); Catch me up's recaps. Not re-checked against the live pricing page. */
const HAIKU_4_5: AnthropicRates = { inputPerMTok: 1, outputPerMTok: 5, cacheReadPerMTok: 0.1, cacheWritePerMTok: 1.25 }
/** Haiku 5.5, prompts of up to HAIKU_5_5_LONG_PROMPT_TOKENS tokens; above that, HAIKU_5_5_LONG. */
const HAIKU_5_5: AnthropicRates = { inputPerMTok: 0.1, outputPerMTok: 0.5, cacheReadPerMTok: 0.01, cacheWritePerMTok: 0.125 }
const HAIKU_5_5_LONG: AnthropicRates = { inputPerMTok: 0.5, outputPerMTok: 2.5, cacheReadPerMTok: 0.05, cacheWritePerMTok: 0.625 }
export const HAIKU_5_5_LONG_PROMPT_TOKENS = 100_000

export const AI_PRICING = {
  version: AI_PRICING_VERSION,
  anthropic: {
    'claude-sonnet-5': SONNET_5,
    'claude-sonnet-5.5': SONNET_5,
    'claude-sonnet-5-5': SONNET_5,
    'claude-haiku-5-5': HAIKU_5_5,
    'claude-haiku-4-5-20251001': HAIKU_4_5,
    'claude-haiku-4-5': HAIKU_4_5,
  } as Record<string, AnthropicRates>,
  /** Rates used for an Anthropic model this table does not name. */
  anthropicFallback: SONNET_5,
  xai: {
    voicePerMinute: 0.08,
    ttsPerMChars: 15,
    sttPerHour: 0.1,
    /** xAI text models as billed today (grok-4.3; the retired grok-4-fast-non-reasoning id is billed so): Modern English editions. */
    textInputPerMTok: 1.25,
    textOutputPerMTok: 2.5,
    /** The OCR model (worker/lib/ocrVision.ts; grok-4-fast-non-reasoning, served as grok-4.3). */
    ocrInputPerMTok: 1.25,
    ocrOutputPerMTok: 2.5,
  },
  openai: {
    'gpt-4.1': { inputPerMTok: 2, cachedInputPerMTok: 0.5, outputPerMTok: 8 },
    webSearchPerCall: 0.01,
  },
} as const

export type AiFeature =
  | 'chat' | 'explain' | 'explain_speculative' | 'librarian' | 'recap' | 'chapter_notes' | 'catch_up' | 'lab_chat' | 'talk'
  | 'narration_generate' | 'narration_listen' | 'source_search' | 'dictation' | 'ocr' | 'modern_edition'
export type AiProvider = 'anthropic' | 'xai' | 'openai'

export interface AnthropicUsage {
  input_tokens?: number
  output_tokens?: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
}

const round5 = (value: number) => Math.round(value * 100_000) / 100_000
const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0)

/** The rates for one call: Haiku 5.5's long-prompt card applies when the whole prompt is over 100K tokens. */
function anthropicRates(model: string, usage: AnthropicUsage): AnthropicRates {
  if (model === 'claude-haiku-5-5') {
    const prompt = count(usage.input_tokens) + count(usage.cache_read_input_tokens) + count(usage.cache_creation_input_tokens)
    if (prompt > HAIKU_5_5_LONG_PROMPT_TOKENS) return HAIKU_5_5_LONG
  }
  return AI_PRICING.anthropic[model] ?? AI_PRICING.anthropicFallback
}

export function anthropicCostUsd(model: string, usage: AnthropicUsage): number {
  const rates = anthropicRates(model, usage)
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

/** Chat dictation (xAI REST speech-to-text), by seconds of audio. Never part of an AI allowance. */
export function dictationCostUsd(seconds: number): number {
  return round5(Math.max(0, seconds) / 3600 * AI_PRICING.xai.sttPerHour)
}

/** One OCR page (xAI vision, chat-completions usage), by tokens. Never part of an AI allowance. */
export function ocrCostUsd(inputTokens: number, outputTokens: number): number {
  return round5((count(inputTokens) * AI_PRICING.xai.ocrInputPerMTok + count(outputTokens) * AI_PRICING.xai.ocrOutputPerMTok) / 1_000_000)
}

/** One xAI text call (chat completions), by tokens: the fallback when the reply carries no cost_in_usd_ticks. */
export function xaiTextCostUsd(inputTokens: number, outputTokens: number): number {
  return round5((Math.max(0, inputTokens) * AI_PRICING.xai.textInputPerMTok + Math.max(0, outputTokens) * AI_PRICING.xai.textOutputPerMTok) / 1_000_000)
}

/**
 * What one xAI text call cost: the reply's own `cost_in_usd_ticks` (1e-10 USD)
 * when xAI sends it, else its tokens at the text rates.
 */
export function xaiReportedCostUsd(usage: { prompt_tokens?: unknown; completion_tokens?: unknown; cost_in_usd_ticks?: unknown } | null | undefined): number {
  const ticks = usage?.cost_in_usd_ticks
  if (typeof ticks === 'number' && Number.isFinite(ticks) && ticks >= 0) return ticks / 1e10
  return xaiTextCostUsd(count(usage?.prompt_tokens), count(usage?.completion_tokens))
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
  /**
   * Raw client IP (or "warm" / "check"); hashed before storage, and stored
   * only for signed-out callers. For a signed-in caller only "check" (Tinct's
   * own checks, `x-tinct-check: 1`) is kept, as a marker beside the account.
   */
  guest?: string | null
  resolveUser?: () => Promise<string | null>
}

export type LedgerEnv = SupabaseEnv & { AI_LEDGER_SALT?: string }
type WaitUntil = { waitUntil(promise: Promise<unknown>): void }

/** Admin pre-warming is stored under this literal key, not hashed. */
export const WARM_GUEST_KEY = 'warm'
/** Tinct's own automated checks (header x-tinct-check: 1) are stored under this literal key. */
export const CHECK_GUEST_KEY = 'check'

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
    // A signed-in row keeps its account (the allowance is summed by user_id,
    // so a client header can never make use free) and carries only the
    // `check` marker from Tinct's own checks, never an IP-derived key.
    guest_key: userId ? (owner.guestKey === CHECK_GUEST_KEY ? CHECK_GUEST_KEY : null) : owner.guestKey,
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
        const guestKey = userId
          ? (identity.guest === CHECK_GUEST_KEY ? CHECK_GUEST_KEY : null)
          : identity.guest ? (identity.guest === WARM_GUEST_KEY || identity.guest === CHECK_GUEST_KEY ? identity.guest : await hashGuestKey(env, identity.guest)) : null
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
  /**
   * `neverCharged`: a call the reader is not charged for (a margin answer that
   * ended in a refusal): its cost is recorded as Tinct's own, under a
   * never-charged feature (NEVER_CHARGED_AI_FEATURES), so it stays out of the
   * reader's allowance.
   */
  anthropic(usage: AnthropicUsage | null | undefined, model?: string, options?: { neverCharged?: boolean }): void
  sourceSearch(usage: OpenAiUsage | undefined, searches: number): void
}

export function createAiMeter(env: LedgerEnv, ctx: WaitUntil | undefined, identity: AiIdentity, options: { feature: AiFeature; bookId?: string | null; model: string }): AiMeter {
  return {
    anthropic(usage, model = options.model, call) {
      if (!usage) return
      recordAiUsage(env, ctx, identity, {
        feature: call?.neverCharged ? 'explain_speculative' : options.feature, provider: 'anthropic', model, book_id: options.bookId ?? null,
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

/**
 * Ledger identity for a signed-out caller: Tinct's own checks label themselves
 * so their usage can be told apart; everyone else is the hashed client IP.
 * Only the ledger uses this; rate limits always use requestGuestKey.
 */
export function ledgerGuestKey(request: Request): string {
  return request.headers.get('x-tinct-check') === '1' ? CHECK_GUEST_KEY : requestGuestKey(request)
}

/** Client IP used for signed-out rate limits; the ledger hashes the same key. */
export function requestGuestKey(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'lab-guest'
}
