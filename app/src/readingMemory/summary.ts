import { textOfRange, cleanExcerpt } from './textRange'
import type { RecapSummary } from './recap'
import type { ReadingSession } from './types'

export const RECAP_SUMMARY_PROMPT_VERSION = 'recap-summary-v1'
const SUMMARY_MODEL = 'claude-sonnet-4-6'
const MAX_PASSAGE_CHARS = 12_000

type FetchLike = (input: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

/**
 * Optional runtime summary of the EXACT passage the reader saw, through the
 * existing worker chat route. Signed-in only (the route needs a bearer
 * token). Any failure returns null so the card falls back to the exact
 * excerpt; nothing here fabricates content.
 */
export async function requestRecapSummary(input: {
  token: string | null | undefined
  session: ReadingSession
  paragraphs: string[]
  bookTitle?: string
  fetchImpl?: FetchLike
  apiBase?: string
}): Promise<RecapSummary | null> {
  if (!input.token) return null
  const passage = textOfRange(input.paragraphs, input.session.anchor.range)
  if (!passage) return null
  const fetchImpl = input.fetchImpl ?? (typeof fetch === 'function' ? (url: string, init: RequestInit) => fetch(url, init) : null)
  if (!fetchImpl) return null
  const clean = cleanExcerpt(passage).slice(0, MAX_PASSAGE_CHARS)
  const where = `${input.bookTitle ? `${input.bookTitle}, ` : ''}${input.session.anchor.chapterLabel}`
  const status = input.session.state === 'completed'
    ? 'The reader finished this chapter.'
    : `The reader stopped part-way through this chapter; do not describe anything beyond the passage.`
  const system = [
    'You write a two-sentence recap of a passage a reader just read.',
    'Use only the passage below. Never add events, names, or outcomes that are not in it.',
    'Do not mention dates, percentages, or how much of the book remains.',
    'Plain, warm, literary English. No preamble, no quotation marks around the whole answer.',
    `Location: ${where}. ${status}`,
  ].join('\n')
  try {
    const response = await fetchImpl(`${input.apiBase ?? ''}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.token}`,
      },
      body: JSON.stringify({
        model: SUMMARY_MODEL,
        max_tokens: 220,
        stream: false,
        system,
        messages: [{ role: 'user', content: `Passage:\n\n${clean}\n\nWrite the recap.` }],
      }),
    })
    if (!response.ok) return null
    const data = await response.json() as { content?: Array<{ type?: string; text?: string }>; model?: string }
    const text = Array.isArray(data?.content)
      ? data.content.filter(block => block?.type === 'text' && typeof block.text === 'string').map(block => block.text).join('\n').trim()
      : ''
    if (!text) return null
    return { text, model: typeof data.model === 'string' && data.model ? data.model : SUMMARY_MODEL, version: RECAP_SUMMARY_PROMPT_VERSION }
  } catch {
    return null
  }
}
