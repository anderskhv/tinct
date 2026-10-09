/**
 * Recognising the text of a scanned own PDF (Premium): switch, limits, private
 * storage keys and spending ceilings. The job itself runs in
 * ownOcrCoordinator.ts; the routes are /api/user-books/ocr/* (routes/userBooks.ts).
 *
 * Off unless the Worker var OWN_PDF_OCR is "1": with it off every OCR route
 * answers 404, exactly as before the feature existed.
 *
 * Storage, inside the owner's private prefix only (USER_BOOKS):
 *   u/{userId}/ocr/{hex}/job.json       the job (pages, state and dates in customMetadata)
 *   u/{userId}/ocr/{hex}/img/{n}.jpg    a page image the device uploaded; deleted once recognised
 *   u/{userId}/ocr/{hex}/page/{n}.json  one recognised page (its blocks)
 *   u/{userId}/ocr/{hex}/edition.json   the assembled Tinct text (ocrEdition.ts)
 * Deleting the book deletes the prefix; account deletion takes `u/{userId}/`.
 *
 * Ceilings, on NarrationCoordinator as own-book narration has them
 * (routes/ownBookNarration.ts), each per UTC calendar month:
 *   - pages per account, `ocr-pages:{userId}`: OWN_PDF_OCR_MONTHLY_PAGES (1500),
 *     or OWN_PDF_OCR_TRIAL_MONTHLY_PAGES (300) while the account is in its trial;
 *   - dollars per account, `ocr-user:{userId}`: OWN_PDF_OCR_MONTHLY_USD ($2), a backstop;
 *   - dollars for everyone, `ocr-budget:{YYYY-MM}`: OWN_PDF_OCR_GLOBAL_MONTHLY_USD ($75).
 * Dollars are counted in micro-dollars. Every provider call reserves
 * OCR_CALL_RESERVE_MICROS (3,000 input + 1,200 output tokens at the
 * grok-4-fast-non-reasoning price = $0.0012) in the account first, then the
 * pool (a refusal by the pool gives the account its share back), and the
 * difference from the provider's reported usage is refunded afterwards. A
 * page counts once against the page ceiling, however many calls it takes,
 * and is given back if it is never recognised.
 */
import { ocrCostUsd } from './aiUsage'
import type { NarrationCoordinator } from '../narrationCoordinator'
import type { UsageCoordinator } from '../usageCoordinator'
import type { SupabaseEnv } from './supabase'

export type OwnOcrEnv = SupabaseEnv & {
  AI_LEDGER_SALT?: string
  OWN_PDF_OCR?: string
  OWN_PDF_OCR_MONTHLY_PAGES?: string
  OWN_PDF_OCR_TRIAL_MONTHLY_PAGES?: string
  OWN_PDF_OCR_MONTHLY_USD?: string
  OWN_PDF_OCR_GLOBAL_MONTHLY_USD?: string
  OCR_MAX_PAGES?: string
  /** Overrides the vision model (lib/ocrVision.ts OCR_DEFAULT_MODEL). */
  OCR_MODEL?: string
  XAI_API_KEY?: string
  USER_BOOKS?: R2Bucket
  NARRATION_COORDINATOR?: DurableObjectNamespace<NarrationCoordinator>
  USAGE_COORDINATOR?: DurableObjectNamespace<UsageCoordinator>
}

export const ownPdfOcrOn = (env: { OWN_PDF_OCR?: string }) => env.OWN_PDF_OCR === '1'

export const OCR_DEFAULTS = { monthlyPages: 1500, trialMonthlyPages: 300, monthlyUsd: 2, globalMonthlyUsd: 75, maxPages: 1000 } as const
/** Tokens one provider call is assumed to use until it reports its own. */
export const OCR_RESERVE_INPUT_TOKENS = 3000
export const OCR_RESERVE_OUTPUT_TOKENS = 1200
/** 1,200 micro-dollars: $0.0012 per call. */
export const OCR_CALL_RESERVE_MICROS = Math.round(ocrCostUsd(OCR_RESERVE_INPUT_TOKENS, OCR_RESERVE_OUTPUT_TOKENS) * 1_000_000)
/** Largest page image accepted (a 1600 px greyscale JPEG at q0.75 is far smaller). */
export const OCR_MAX_IMAGE_BYTES = 1.5 * 1024 * 1024
/** Page uploads per account per minute (lib/rateLimit.ts window). */
export const OCR_UPLOADS_PER_MINUTE = 120
/** Starts, re-runs and cancels per account per minute. */
export const OCR_STARTS_PER_MINUTE = 10
/** Status and edition reads per account per minute. */
export const OCR_READS_PER_MINUTE = 120

function positive(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export interface OwnOcrLimits { monthlyPages: number; trialMonthlyPages: number; accountMicros: number; globalMicros: number; maxPages: number }

export function ownOcrLimits(env: OwnOcrEnv): OwnOcrLimits {
  return {
    monthlyPages: Math.floor(positive(env.OWN_PDF_OCR_MONTHLY_PAGES, OCR_DEFAULTS.monthlyPages)),
    trialMonthlyPages: Math.floor(positive(env.OWN_PDF_OCR_TRIAL_MONTHLY_PAGES, OCR_DEFAULTS.trialMonthlyPages)),
    accountMicros: Math.round(positive(env.OWN_PDF_OCR_MONTHLY_USD, OCR_DEFAULTS.monthlyUsd) * 1_000_000),
    globalMicros: Math.round(positive(env.OWN_PDF_OCR_GLOBAL_MONTHLY_USD, OCR_DEFAULTS.globalMonthlyUsd) * 1_000_000),
    maxPages: Math.floor(positive(env.OCR_MAX_PAGES, OCR_DEFAULTS.maxPages)),
  }
}

/** The page ceiling that applies to an account: the trial's while in the trial. */
export function monthlyPageLimit(limits: OwnOcrLimits, tier: 'premium' | 'trial' | 'none' | null | undefined): number {
  return tier === 'trial' ? limits.trialMonthlyPages : limits.monthlyPages
}

// ===== Keys =====

/** Where one own book's OCR lives: inside the owner's private prefix (userBooks.ts userBooksPrefix) only. */
export const ownOcrPrefix = (userId: string, bookHex: string) => `u/${userId}/ocr/${bookHex}/`
export const ownOcrRoot = (userId: string) => `u/${userId}/ocr/`
export const ocrJobKey = (userId: string, bookHex: string) => `${ownOcrPrefix(userId, bookHex)}job.json`
export const ocrImageKey = (userId: string, bookHex: string, n: number) => `${ownOcrPrefix(userId, bookHex)}img/${n}.jpg`
export const ocrPageKey = (userId: string, bookHex: string, n: number) => `${ownOcrPrefix(userId, bookHex)}page/${n}.json`
export const ocrEditionKey = (userId: string, bookHex: string) => `${ownOcrPrefix(userId, bookHex)}edition.json`

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** The job's coordinator: one per (account, book); the name carries no ids in the clear. */
export async function ocrCoordinatorName(userId: string, bookHex: string): Promise<string> {
  return 'ocr:' + await sha256Hex(`${userId}\n${bookHex}`)
}

export const ocrPagesName = (userId: string) => `ocr-pages:${userId}`
export const ocrUserName = (userId: string) => `ocr-user:${userId}`
export const ocrBudgetName = (month: string) => `ocr-budget:${month}`

export const dayOf = (now: number) => new Date(now).toISOString().slice(0, 10)
export const monthOf = (now: number) => new Date(now).toISOString().slice(0, 7)
/** The first instant of the next UTC month: when a month's ceilings start again. */
export function nextMonthStart(now: number): number {
  const at = new Date(now)
  return Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1)
}

// ===== Ceilings =====

export type OcrCeiling = 'account_pages' | 'account_usd' | 'global_usd'
type Spend = DurableObjectNamespace<NarrationCoordinator>
/** reserveMonth with no limit: adds what a call cost beyond its reservation (already spent, so never refused). */
const UNLIMITED = Number.MAX_SAFE_INTEGER

/** Counts one page against the account's page ceiling. */
export async function reserveOcrPage(spend: Spend, userId: string, day: string, pageLimit: number): Promise<boolean> {
  return spend.getByName(ocrPagesName(userId)).reserveMonth(day, 1, pageLimit)
}

export async function refundOcrPage(spend: Spend, userId: string, day: string): Promise<void> {
  await spend.getByName(ocrPagesName(userId)).refund(day, 1)
}

/** Reserves one call's dollars: the account first, then the pool. */
export async function reserveOcrCall(spend: Spend, userId: string, day: string, limits: OwnOcrLimits): Promise<OcrCeiling | null> {
  const account = spend.getByName(ocrUserName(userId))
  if (!await account.reserveMonth(day, OCR_CALL_RESERVE_MICROS, limits.accountMicros)) return 'account_usd'
  if (!await spend.getByName(ocrBudgetName(day.slice(0, 7))).reserve(day, OCR_CALL_RESERVE_MICROS, limits.globalMicros, limits.globalMicros)) {
    await account.refund(day, OCR_CALL_RESERVE_MICROS)
    return 'global_usd'
  }
  return null
}

/** Settles a call reserved on `day`: gives back what it did not cost, or adds what it cost beyond the reservation. */
export async function settleOcrCall(spend: Spend, userId: string, day: string, actualMicros: number): Promise<void> {
  const diff = OCR_CALL_RESERVE_MICROS - Math.max(0, Math.round(actualMicros))
  if (diff === 0) return
  const account = spend.getByName(ocrUserName(userId))
  const pool = spend.getByName(ocrBudgetName(day.slice(0, 7)))
  if (diff > 0) {
    await account.refund(day, diff)
    await pool.refund(day, diff)
  } else {
    await account.reserveMonth(day, -diff, UNLIMITED)
    await pool.reserve(day, -diff, UNLIMITED, UNLIMITED)
  }
}

/** Pages counted against the account this month (the status's `month.used`). */
export async function ocrPagesThisMonth(spend: Spend, userId: string, now: number): Promise<number> {
  const month = monthOf(now)
  const rows = await spend.getByName(ocrPagesName(userId)).usage()
  return rows.filter(row => row.day.startsWith(month)).reduce((sum, row) => sum + row.bytes, 0)
}
