/**
 * What a static scene page (`/read/{bookId}/{scene}`, src/seo/scenePages.tsx) asks the reader to do when it hands
 * over. The page opens `/reader?book=…&chapter=…&edition=modern-en` (a normal deep link) with the action in the
 * hash: `#scene=explain&sel=12.3-12.18`, `#scene=ask&q=…`, `#scene=primer`. The hash never reaches a server, a
 * referrer or the attribution record, so a reader's question is not written into any log; the reader reads it once
 * with the deep link and removes it from the address (labReaderHandoff.ts), so a reload never replays it.
 *
 * The page script (public/read/scene-page.js) writes the same format; scenePageClient.test.ts holds the two together.
 */

/** The edition a scene page shows, and so the edition the reader opens for a hand-over. */
export const SCENE_HANDOFF_EDITION = 'modern-en'

export const SCENE_HANDOFF_ACTIONS = [
  // A selection's actions (the reader's selection bar), or a typed question about the scene (`ask` with `q`).
  'ask', 'explain', 'simplify', 'more',
  // The margin's and the scene end's links.
  'primer', 'summary', 'recap', 'quiz',
  // The top bar.
  'contents', 'notebook', 'appearance', 'menu',
] as const
export type SceneHandoffAction = typeof SCENE_HANDOFF_ACTIONS[number]

/** Words `[p1.w1, p2.w2]` inclusive, in the reader's coordinates (paragraph index, word index by /\S+/). */
export interface SceneSelection { paragraphIndex: number; wordIndex: number; endParagraphIndex: number; endWordIndex: number }

export interface SceneHandoff {
  action: SceneHandoffAction
  /** A typed question (`ask` without a selection), at most SCENE_QUESTION_MAX characters. */
  question?: string
  selection?: SceneSelection
}

export const SCENE_QUESTION_MAX = 500
const ACTIONS = new Set<string>(SCENE_HANDOFF_ACTIONS)
const SELECTION_ACTIONS = new Set<SceneHandoffAction>(['ask', 'explain', 'simplify', 'more'])
const SELECTION_RE = /^(\d{1,5})\.(\d{1,6})-(\d{1,5})\.(\d{1,6})$/

export function sceneHandoffHash(handoff: SceneHandoff): string {
  const params = new URLSearchParams({ scene: handoff.action })
  if (handoff.selection) {
    const s = handoff.selection
    params.set('sel', `${s.paragraphIndex}.${s.wordIndex}-${s.endParagraphIndex}.${s.endWordIndex}`)
  }
  if (handoff.question) params.set('q', handoff.question.slice(0, SCENE_QUESTION_MAX))
  return `#${params.toString()}`
}

/** The hand-over a reader address carries in its hash, or null. Anything malformed is ignored, never guessed at. */
export function parseSceneHandoff(hash: string | null | undefined): SceneHandoff | null {
  if (!hash || !hash.startsWith('#scene=')) return null
  let params: URLSearchParams
  try { params = new URLSearchParams(hash.slice(1)) } catch { return null }
  const action = params.get('scene') || ''
  if (!ACTIONS.has(action)) return null
  const handoff: SceneHandoff = { action: action as SceneHandoffAction }
  const sel = params.get('sel')
  if (sel) {
    const match = sel.match(SELECTION_RE)
    if (!match || !SELECTION_ACTIONS.has(handoff.action)) return null
    const [paragraphIndex, wordIndex, endParagraphIndex, endWordIndex] = match.slice(1).map(Number)
    if (endParagraphIndex < paragraphIndex || (endParagraphIndex === paragraphIndex && endWordIndex < wordIndex)) return null
    handoff.selection = { paragraphIndex, wordIndex, endParagraphIndex, endWordIndex }
  }
  const question = (params.get('q') || '').trim()
  if (question) {
    if (handoff.action !== 'ask' || handoff.selection) return null
    handoff.question = question.slice(0, SCENE_QUESTION_MAX)
  }
  // Explain, Simplify and the full menu need a passage; a bare Ask needs a question.
  if ((handoff.action === 'explain' || handoff.action === 'simplify' || handoff.action === 'more') && !handoff.selection) return null
  if (handoff.action === 'ask' && !handoff.selection && !handoff.question) return null
  return handoff
}
