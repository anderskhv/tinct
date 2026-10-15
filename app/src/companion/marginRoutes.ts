/**
 * The PDF reader's margin: model, effort and output bound per intent, in one
 * table (Anders, 15 Oct 2026; docs/margin/FIXES-2026-10-15.md A3). Only the
 * PDF reader's requests (CompanionRequest.pdf) are routed here; the book
 * reader keeps COMPANION_MODEL / COMPANION_LOOKUP_MODEL and its own table in
 * companionRequest.ts. Pure: no browser or Worker APIs.
 *
 * Request rules both models follow (claude-api skill, Haiku 5.5 and Sonnet
 * 5.5 migration notes): no `thinking` field at all (adaptive thinking is the
 * default; `{type: "disabled"}` is a 400 on Sonnet 5.5, and `budget_tokens`
 * a 400 on both), effort set explicitly in `output_config` (Haiku 5.5
 * defaults to medium), no sampling parameters, no assistant prefill, and
 * `stop_reason: "refusal"` handled before the content is read.
 *
 * Thinking counts toward `max_tokens`, so each bound is the answer's length in
 * PROMPTS.md plus room for the thinking its effort level allows.
 */
import type { CompanionEffort } from '../companionModel'

export const MARGIN_HAIKU_MODEL = 'claude-haiku-5-5'
export const MARGIN_SONNET_MODEL = 'claude-sonnet-5-5'

/**
 * Every margin action. `primer` is the chapter action Before you start;
 * `ask` is a question typed in the margin, on a passage or about the whole
 * PDF (the column's foot), and a card's follow-up. `related` is routed now
 * and arrives as an intent in PR C.
 */
export type MarginRouteKey =
  | 'explain' | 'simplify' | 'define' | 'define_sense' | 'quiz_check' | 'related'
  | 'factcheck' | 'counterpoint' | 'quiz'
  | 'primer' | 'ask'

export interface MarginRoute {
  model: string
  effort: CompanionEffort
  maxTokens: number
}

const route = (model: string, effort: CompanionEffort, maxTokens: number): MarginRoute => Object.freeze({ model, effort, maxTokens })

export const MARGIN_ROUTES: Readonly<Record<MarginRouteKey, MarginRoute>> = Object.freeze({
  explain: route(MARGIN_HAIKU_MODEL, 'low', 800),
  simplify: route(MARGIN_HAIKU_MODEL, 'low', 800),
  define: route(MARGIN_HAIKU_MODEL, 'low', 800),
  define_sense: route(MARGIN_HAIKU_MODEL, 'low', 400),
  quiz_check: route(MARGIN_HAIKU_MODEL, 'low', 500),
  related: route(MARGIN_HAIKU_MODEL, 'low', 800),
  factcheck: route(MARGIN_HAIKU_MODEL, 'medium', 1600),
  counterpoint: route(MARGIN_HAIKU_MODEL, 'medium', 1200),
  quiz: route(MARGIN_HAIKU_MODEL, 'medium', 1400),
  primer: route(MARGIN_SONNET_MODEL, 'medium', 2000),
  ask: route(MARGIN_SONNET_MODEL, 'medium', 1800),
})

/** The route for a PDF reader request, by intent; a chapter request is a primer (the only chapter action a PDF has). */
export function marginRouteKey(intent: string, chapterAction?: string): MarginRouteKey | null {
  if (intent === 'chapter') return chapterAction === 'primer' ? 'primer' : null
  return Object.prototype.hasOwnProperty.call(MARGIN_ROUTES, intent) ? intent as MarginRouteKey : null
}
