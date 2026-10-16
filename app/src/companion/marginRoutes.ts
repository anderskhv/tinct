/**
 * The PDF reader's margin: model, effort and output bound per intent, in one
 * table (Anders, 15 Oct 2026; docs/margin/FIXES-2026-10-15.md A3). Only the
 * PDF reader's requests (CompanionRequest.pdf) are routed here; the book
 * reader keeps COMPANION_MODEL / COMPANION_LOOKUP_MODEL and its own table in
 * companionRequest.ts. Pure: no browser or Worker APIs.
 *
 * Request rules both models follow (claude-api skill, Haiku 5.5 and Sonnet
 * 5.5 migration notes): effort set explicitly in `output_config` (Haiku 5.5
 * defaults to medium), no `budget_tokens` (a 400 on both), no sampling
 * parameters, no assistant prefill, and `stop_reason: "refusal"` handled
 * before the content is read. A reply that stops at `max_tokens` is cut off:
 * the Worker reports it as an error (`cut_off`), never as an answer.
 *
 * Thinking: a route with `thinking` sends it as is; every other route sends no
 * `thinking` field, so the model thinks adaptively. Haiku's short lookups turn
 * thinking off (`{type: "disabled"}`, allowed on Haiku 5.5 at effort high or
 * below): on 15 Oct 2026 adaptive thinking used up their bounds and left empty
 * cards. Sonnet 5.5 refuses `{type: "disabled"}` with a 400, so its routes
 * never set it.
 *
 * Thinking counts toward `max_tokens`, so a route that thinks has a bound well
 * above its answer's length in PROMPTS.md; a route billed by tokens used pays
 * nothing for the unused room.
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

/** Sent as the request's `thinking` field; Haiku 5.5 only (Sonnet 5.5 refuses it). */
export type MarginThinking = { type: 'disabled' }

export interface MarginRoute {
  model: string
  effort: CompanionEffort
  maxTokens: number
  /** Unset: no `thinking` field is sent (adaptive thinking). */
  thinking?: MarginThinking
}

const route = (model: string, effort: CompanionEffort, maxTokens: number, thinking?: MarginThinking): MarginRoute =>
  Object.freeze({ model, effort, maxTokens, ...(thinking ? { thinking: Object.freeze({ ...thinking }) } : {}) })
const NO_THINKING: MarginThinking = { type: 'disabled' }

/**
 * Speed trials, each a one-line switch and OFF by default (round 1, 15 Oct; Anders turns them on and
 * measures on production):
 *
 * QUIZ_THINKING_OFF: Quiz me with thinking disabled at effort low (Haiku 5.5 accepts `{type: "disabled"}`
 * at effort high or below; claude-api skill), so question 1 starts at lookup speed. Off: adaptive thinking.
 */
export const QUIZ_THINKING_OFF = true
/** Quiz me's route: low effort and 6000 tokens; with `thinkingOff`, thinking disabled as the lookups. */
export function quizRoute(thinkingOff: boolean = QUIZ_THINKING_OFF): MarginRoute {
  return route(MARGIN_HAIKU_MODEL, 'low', 6000, thinkingOff ? NO_THINKING : undefined)
}

/**
 * COUNTERPOINT_THINKING_OFF (round 3, 16 Oct; ON in this PR, Anders measures it against recheck-1): Counterpoint
 * with thinking disabled at effort low, as the quiz trial. recheck-1 found its first words at 5-10 s (1-2 s
 * before) and its median output at 1,200 tokens against 303, nearly all thinking, after the stricter
 * grounding prompt. The prompt and its grounding rules are unchanged; the bound fits its 150-word answer
 * (about 200 tokens) with room for citations and a little more, so a long answer is not cut off.
 * Off: adaptive thinking at effort low with 6000 tokens, as before.
 */
export const COUNTERPOINT_THINKING_OFF = true
/** Counterpoint's answer bound with thinking off: about 300 words. */
export const COUNTERPOINT_FAST_MAX_TOKENS = 400
/** Counterpoint's route: with `thinkingOff`, effort low, thinking disabled and COUNTERPOINT_FAST_MAX_TOKENS; else adaptive at low with 6000. */
export function counterpointRoute(thinkingOff: boolean = COUNTERPOINT_THINKING_OFF): MarginRoute {
  return thinkingOff ? route(MARGIN_HAIKU_MODEL, 'low', COUNTERPOINT_FAST_MAX_TOKENS, NO_THINKING) : route(MARGIN_HAIKU_MODEL, 'low', 6000)
}

export const MARGIN_ROUTES: Readonly<Record<MarginRouteKey, MarginRoute>> = Object.freeze({
  // Short, grounded lookups: no thinking, so the bound is all answer and the reply starts at once.
  explain: route(MARGIN_HAIKU_MODEL, 'low', 800, NO_THINKING),
  simplify: route(MARGIN_HAIKU_MODEL, 'low', 800, NO_THINKING),
  define: route(MARGIN_HAIKU_MODEL, 'low', 800, NO_THINKING),
  define_sense: route(MARGIN_HAIKU_MODEL, 'low', 400, NO_THINKING),
  quiz_check: route(MARGIN_HAIKU_MODEL, 'low', 500, NO_THINKING),
  related: route(MARGIN_HAIKU_MODEL, 'low', 800, NO_THINKING),
  // Adaptive thinking at medium effort: 1200-1600 left 4 in 5 cut off (15 Oct 2026), so room to think as well.
  factcheck: route(MARGIN_HAIKU_MODEL, 'medium', 8000),
  // Low effort (15 Oct evening: 7-12 s at medium, almost all of it thinking); COUNTERPOINT_THINKING_OFF above turns thinking off.
  counterpoint: counterpointRoute(),
  // Low effort as Counterpoint (retest after train 2: first question 5-11 s against a target under 5), still adaptive, same bound
  // (QUIZ_THINKING_OFF below trials it without thinking).
  quiz: quizRoute(),
  // A primer's JSON runs to about 1,700 tokens; thinking at medium effort needs the rest (2 failures in 3 at 1200, 15 Oct).
  primer: route(MARGIN_SONNET_MODEL, 'medium', 8000),
  ask: route(MARGIN_SONNET_MODEL, 'medium', 1800),
})

/**
 * Fact-check's opening (the doc-first opening, approved 15 Oct 2026): the first paragraph, written
 * from the cached document while the source search runs. No tools and no thinking, so its words
 * start at lookup speed; the verdict round after it keeps MARGIN_ROUTES.factcheck.
 */
export const FACTCHECK_OPENING_ROUTE: MarginRoute = route(MARGIN_HAIKU_MODEL, 'low', 600, NO_THINKING)

/**
 * Speed trial, OFF by default (null): the effort of Fact-check's verdict round (the rounds after the
 * doc-first opening, chat.ts runToolLoop). 'low' trials it at low effort (8.5–14 s to the last word in
 * round 1, 15 Oct); null keeps MARGIN_ROUTES.factcheck's effort. Adaptive thinking either way.
 */
export const FACTCHECK_VERDICT_EFFORT: CompanionEffort | null = 'low'
/** The verdict round's effort: the trial's when it is set, else Fact-check's route effort. */
export function factcheckVerdictEffort(setting: CompanionEffort | null = FACTCHECK_VERDICT_EFFORT): CompanionEffort {
  return setting ?? MARGIN_ROUTES.factcheck.effort
}

/** The route for a PDF reader request, by intent; a chapter request is a primer (the only chapter action a PDF has). */
export function marginRouteKey(intent: string, chapterAction?: string): MarginRouteKey | null {
  if (intent === 'chapter') return chapterAction === 'primer' ? 'primer' : null
  return Object.prototype.hasOwnProperty.call(MARGIN_ROUTES, intent) ? intent as MarginRouteKey : null
}
