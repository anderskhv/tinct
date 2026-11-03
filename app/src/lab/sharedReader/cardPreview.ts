/**
 * What a minimised margin card shows (Anders, 3 Nov 2026, approved mockup): the reader's first question,
 * when the card is an Ask, and the first answer's bottom line, whole, then how many follow-ups it holds.
 * Before, it was the last turn's first 160 characters, cut mid-word, so a follow-up's opening
 * ("The document doesn't discuss this…") stood for the whole card.
 */
import { splitLead } from '../marginPhone/LabPhoneCard'

export interface FoldedPreview {
  preview: string
  previewQuestion?: string
  previewMore?: number
}

const MAX_LEAD = 220
const MAX_QUESTION = 140

/** Text cut at a word boundary, with an ellipsis, when longer than `max`. */
export function clampWords(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max + 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut.slice(0, max)).replace(/[\s,;:–—-]+$/, '')}…`
}

/** Markdown marks taken off, for a line of plain text. */
function plain(text: string): string {
  return text.replace(/^\s{0,3}(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s*)/, '').replace(/\*\*|__|`/g, '').replace(/(^|\W)[*_](\S[^*_]*?)[*_](?=\W|$)/g, '$1$2')
}

/** An answer's bottom line: the first sentence of its first paragraph, as plain text. */
export function answerLead(raw: string): string {
  const first = raw.trim().split(/\n{2,}/).find(block => block.trim()) ?? ''
  return clampWords(plain(splitLead(plain(first.split('\n')[0] ?? '')).lead), MAX_LEAD)
}

/**
 * A card's folded preview from its turns (user and assistant, in order). `answer` turns a structured
 * answer (a Primer, a definition) into its own line; plain answers give their bottom line.
 */
export function foldedPreview(kind: string, turns: ReadonlyArray<{ role: string; content: string }>, answer: (raw: string) => string = answerLead): FoldedPreview {
  const at = turns.findIndex(turn => turn.role === 'assistant')
  const first = at >= 0 ? turns[at].content : ''
  // The question an Ask was opened with; any question after the first answer is a follow-up.
  const question = kind === 'ask' ? turns.slice(0, Math.max(0, at)).find(turn => turn.role === 'user')?.content?.trim() : ''
  const more = at >= 0 ? turns.slice(at + 1).filter(turn => turn.role === 'user').length : 0
  // A note (no answer yet): its own words.
  if (at < 0) return { preview: clampWords(turns.find(turn => turn.role === 'user')?.content ?? '', MAX_LEAD) }
  return {
    preview: answer(first),
    ...(question ? { previewQuestion: clampWords(question, MAX_QUESTION) } : {}),
    ...(more ? { previewMore: more } : {}),
  }
}
