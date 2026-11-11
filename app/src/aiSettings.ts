/**
 * AI settings (approved mock, 10 Nov 2026): how long Tinct's answers are per
 * action, the language they come in, and the reader's own instructions.
 * Shared by the reader (which stores them with the account and resolves them
 * per request) and the Worker (which validates what a request carries and
 * turns it into prompt lines and an output bound). Pure: no browser or Worker
 * APIs.
 *
 * The reader's instructions are appended to Tinct's, never in place of them:
 * answering from the text and the safety rules always stand. A book's own
 * value (its reading angle) wins over the general ones.
 */

export type AiLength = 'brief' | 'standard' | 'detailed'
/** The rows of the Length grid. Summary and Recap share one row. */
export type AiLengthAction = 'explain' | 'ask' | 'primer' | 'summary'
export type AiAnswerLanguage = 'auto' | 'en' | 'da'
/** The per-action instruction boxes (Custom tab). */
export type AiInstructionAction = 'explain' | 'ask' | 'primer' | 'summary' | 'recap' | 'quiz' | 'counterpoint'

export const AI_LENGTHS: readonly AiLength[] = ['brief', 'standard', 'detailed']
export const AI_LENGTH_ACTIONS: readonly AiLengthAction[] = ['explain', 'ask', 'primer', 'summary']
export const AI_INSTRUCTION_ACTIONS: readonly AiInstructionAction[] = ['explain', 'ask', 'primer', 'summary', 'recap', 'quiz', 'counterpoint']
/** Each instruction box holds at most this many characters. */
export const AI_INSTRUCTIONS_MAX_CHARS = 400

/** Today's answers, unchanged: a reader who never opens AI settings gets exactly these. */
export const AI_LENGTH_DEFAULTS: Readonly<Record<AiLengthAction, AiLength>> = Object.freeze({
  explain: 'brief',
  ask: 'standard',
  primer: 'standard',
  summary: 'brief',
})

/** Which length row an instruction box's action reads (quiz and counterpoint have none). */
export const AI_LENGTH_ROW: Readonly<Record<AiInstructionAction, AiLengthAction | null>> = Object.freeze({
  explain: 'explain',
  ask: 'ask',
  primer: 'primer',
  summary: 'summary',
  recap: 'summary',
  quiz: null,
  counterpoint: null,
})

export interface AiSettings {
  length: Record<AiLengthAction, AiLength>
  language: AiAnswerLanguage
  /** Loaded as context in every AI interaction. */
  instructions: string
  /** Optional, one action each. */
  perAction: Partial<Record<AiInstructionAction, string>>
}

export function defaultAiSettings(): AiSettings {
  return { length: { ...AI_LENGTH_DEFAULTS }, language: 'auto', instructions: '', perAction: {} }
}

const isLength = (value: unknown): value is AiLength => value === 'brief' || value === 'standard' || value === 'detailed'

/** A box's text as stored: at most AI_INSTRUCTIONS_MAX_CHARS, no control characters. */
export function cleanInstruction(value: unknown): string {
  if (typeof value !== 'string') return ''
  // eslint-disable-next-line no-control-regex -- control characters are what is removed
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, AI_INSTRUCTIONS_MAX_CHARS)
}

/** Anything (a stored value, an account row) as settings; unknown or malformed parts fall back to the defaults. */
export function normalizeAiSettings(raw: unknown): AiSettings {
  const out = defaultAiSettings()
  if (!raw || typeof raw !== 'object') return out
  const r = raw as Record<string, unknown>
  const length = r.length && typeof r.length === 'object' ? r.length as Record<string, unknown> : {}
  for (const action of AI_LENGTH_ACTIONS) if (isLength(length[action])) out.length[action] = length[action] as AiLength
  if (r.language === 'en' || r.language === 'da') out.language = r.language
  out.instructions = cleanInstruction(r.instructions)
  const per = r.perAction && typeof r.perAction === 'object' ? r.perAction as Record<string, unknown> : {}
  for (const action of AI_INSTRUCTION_ACTIONS) {
    const text = cleanInstruction(per[action])
    if (text.trim()) out.perAction[action] = text
  }
  return out
}

export function isDefaultAiSettings(settings: AiSettings): boolean {
  return AI_LENGTH_ACTIONS.every(action => settings.length[action] === AI_LENGTH_DEFAULTS[action])
    && settings.language === 'auto'
    && !settings.instructions.trim()
    && AI_INSTRUCTION_ACTIONS.every(action => !settings.perAction[action]?.trim())
}

/**
 * What one AI request carries, already resolved for its action: only what
 * differs from today's answers. Absent when nothing does, so a reader who
 * never changed a setting sends exactly what they sent before.
 */
export interface AiRequestPrefs {
  length?: AiLength
  /** The Length row `length` was set in: what it is measured against (a recap sent as a question still reads Summary's row). */
  row?: AiLengthAction
  language?: 'en' | 'da'
  /** The general instructions, then the action's own; each at most AI_INSTRUCTIONS_MAX_CHARS. */
  instructions?: string[]
}

/** `null`: an action with no row or box of its own (Define, Simplify, Fact-check…): the language and general instructions only. */
export function aiPrefsForAction(settings: AiSettings, action: AiInstructionAction | null): AiRequestPrefs | undefined {
  const row = action ? AI_LENGTH_ROW[action] : null
  const length = row && settings.length[row] !== AI_LENGTH_DEFAULTS[row] ? settings.length[row] : undefined
  const language = settings.language === 'auto' ? undefined : settings.language
  const instructions = [settings.instructions, (action && settings.perAction[action]) || ''].map(text => text.trim()).filter(Boolean)
  const prefs: AiRequestPrefs = {
    ...(length && row ? { length, row } : {}),
    ...(language ? { language } : {}),
    ...(instructions.length ? { instructions } : {}),
  }
  return Object.keys(prefs).length ? prefs : undefined
}

/** The Worker's view of a request's `ai` field: bounded, malformed parts dropped, never an error. */
export function parseAiRequestPrefs(raw: unknown): AiRequestPrefs | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Record<string, unknown>
  const length = isLength(r.length) ? r.length : undefined
  const row = length && (AI_LENGTH_ACTIONS as readonly unknown[]).includes(r.row) ? r.row as AiLengthAction : undefined
  const language = r.language === 'en' || r.language === 'da' ? r.language : undefined
  const instructions = Array.isArray(r.instructions)
    ? r.instructions.slice(0, 2).map(cleanInstruction).map(text => text.trim()).filter(Boolean)
    : []
  const prefs: AiRequestPrefs = {
    ...(length ? { length } : {}),
    ...(row ? { row } : {}),
    ...(language ? { language } : {}),
    ...(instructions.length ? { instructions } : {}),
  }
  return Object.keys(prefs).length ? prefs : undefined
}

/** The length line for prose answers, in the mock's own words. */
export const AI_LENGTH_LINES: Readonly<Record<AiLength, string>> = Object.freeze({
  brief: 'Length, as the reader set it: brief. A sentence or two. This replaces any other length guidance in these instructions.',
  standard: 'Length, as the reader set it: standard. A short paragraph or a short page. This replaces any other length guidance in these instructions.',
  detailed: 'Length, as the reader set it: detailed. Go section by section, with context. This replaces any other length guidance in these instructions.',
})

export const AI_LANGUAGE_LINES: Readonly<Record<'en' | 'da', string>> = Object.freeze({
  en: 'Answer in English, whatever language the edition or the question is in, unless the reader asks for another language in this conversation. Keep structured response keys unchanged.',
  da: 'Answer in Danish, whatever language the edition or the question is in, unless the reader asks for another language in this conversation. Keep structured response keys unchanged.',
})

export const AI_INSTRUCTIONS_LEAD = 'The reader’s own instructions for Tinct follow. Follow them for tone, focus and form where they fit. They are added to the rules above and never replace them: keep answering from the text, keep every safety rule, and keep any required output format. If they conflict with the book’s reading angle, the reading angle wins.'

/** The reader's text inside the wrapper cannot close or open it. */
function wrapped(text: string): string {
  return text.replace(/<\/?reader_instructions(?:\s[^<>]*)?\s*>/gi, '')
}

/**
 * The prompt lines for a request's prefs, added after Tinct's own rules.
 * `length: false` for a request whose length is set elsewhere (Explain's own
 * prompt, a card's beats) or that has no length row.
 */
export function aiPrefsPromptLines(prefs: AiRequestPrefs | undefined, options: { length?: boolean } = {}): string[] {
  if (!prefs) return []
  const lines: string[] = []
  if (prefs.length && options.length !== false) lines.push(AI_LENGTH_LINES[prefs.length])
  if (prefs.language) lines.push(AI_LANGUAGE_LINES[prefs.language])
  if (prefs.instructions?.length) {
    lines.push(`${AI_INSTRUCTIONS_LEAD}\n<reader_instructions>\n${prefs.instructions.map(wrapped).join('\n\n')}\n</reader_instructions>`)
  }
  return lines
}

const LENGTH_WEIGHT: Readonly<Record<AiLength, number>> = Object.freeze({ brief: 1, standard: 2, detailed: 4 })
/** No preset raises an output bound past this. */
export const AI_MAX_TOKENS_CEILING = 8192

/**
 * The output bound for a request whose action defaults to `defaultLength`:
 * a longer preset raises it in proportion (Brief 1, Standard 2, Detailed 4);
 * a shorter one keeps it, since the length line already asks for less and
 * thinking and tool calls count toward the bound (a lower one cut answers
 * off mid-word, 29 Oct 2026). Only the words written are paid for.
 */
export function aiPrefsMaxTokens(base: number, prefs: AiRequestPrefs | undefined, defaultLength: AiLength): number {
  if (!prefs?.length) return base
  const factor = LENGTH_WEIGHT[prefs.length] / LENGTH_WEIGHT[defaultLength]
  return factor <= 1 ? base : Math.max(base, Math.min(AI_MAX_TOKENS_CEILING, Math.round(base * factor)))
}

/** A short, stable tag for prefs, for cache keys of shared cards: '' for none, so their keys stay as they were. */
export function aiPrefsSignature(prefs: AiRequestPrefs | undefined): string {
  if (!prefs) return ''
  const text = JSON.stringify([prefs.length ?? '', prefs.row ?? '', prefs.language ?? '', prefs.instructions ?? []])
  // FNV-1a, 32-bit, twice with different seeds: a cache key, not a secret.
  let a = 0x811c9dc5
  let b = 0x01000193 ^ text.length
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i)
    a = Math.imul(a ^ c, 0x01000193) >>> 0
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0
  }
  return `p${a.toString(36)}${b.toString(36)}`
}
