/**
 * Catch me up's structured answer. Each timeline entry (`/api/lab-catch-up`
 * and the brief `/api/lab-recap`) is returned through one forced tool call
 * instead of free text, so "there is nothing to summarise here" is a field
 * the model sets rather than a sentence it writes to the reader. A free-text
 * reply (a model that ignores the tool) is still accepted, but only when it
 * reads as a summary (`isUsableRecapSummary`); a reply about the passage
 * counts as an empty entry. Empty entries are never cached.
 */
import { isUsableRecapSummary } from '../../recapSummary'

export const RECAP_ENTRY_TOOL_NAME = 'write_entry'

export const RECAP_ENTRY_TOOL = {
  name: RECAP_ENTRY_TOOL_NAME,
  description: 'Record the timeline entry for the passage.',
  input_schema: {
    type: 'object',
    properties: {
      nothing_to_summarise: {
        type: 'boolean',
        description: 'True when the passage holds no narrative or argument yet: only a heading, title, address, date or salutation.',
      },
      summary: {
        type: 'string',
        description: 'The entry itself. Empty when nothing_to_summarise is true.',
      },
    },
    required: ['nothing_to_summarise', 'summary'],
    additionalProperties: false,
  },
} as const

/** Added to the request payload: the tool, forced. */
export const RECAP_ENTRY_TOOL_PAYLOAD = {
  tools: [RECAP_ENTRY_TOOL],
  tool_choice: { type: 'tool', name: RECAP_ENTRY_TOOL_NAME },
} as const

/** Appended to the system prompt of every structured entry. */
export const RECAP_ENTRY_INSTRUCTION = [
  `Answer only by calling ${RECAP_ENTRY_TOOL_NAME}.`,
  'If the passage holds nothing to summarise yet (only a heading, title, address, date or salutation), set nothing_to_summarise to true and leave summary empty.',
  'Never ask for more text and never comment on the passage itself; the reader sees summary exactly as written.',
].join('\n')

type EntryMessage = {
  content?: Array<{ type?: string; text?: string; name?: string; input?: unknown }>
  stop_reason?: string
}

export type RecapEntry = { kind: 'summary'; summary: string } | { kind: 'empty' } | { kind: 'none' }

/**
 * What the model returned: a summary, an explicit empty entry, or nothing
 * usable (a refusal, a cut-off answer, a reply that talks about the passage).
 * Only `summary` may be shown or cached.
 */
export function readRecapEntry(message: EntryMessage): RecapEntry {
  if (message.stop_reason === 'refusal' || !Array.isArray(message.content)) return { kind: 'none' }
  const call = message.content.find(block => block?.type === 'tool_use' && block.name === RECAP_ENTRY_TOOL_NAME)
  if (call) {
    if (message.stop_reason === 'max_tokens') return { kind: 'none' }
    const input = (call.input && typeof call.input === 'object' ? call.input : {}) as { nothing_to_summarise?: unknown; summary?: unknown }
    if (input.nothing_to_summarise === true) return { kind: 'empty' }
    const summary = typeof input.summary === 'string' ? input.summary.trim() : ''
    return isUsableRecapSummary(summary) ? { kind: 'summary', summary } : { kind: 'empty' }
  }
  const text = message.content
    .filter(block => block?.type === 'text' && typeof block.text === 'string')
    .map(block => block.text!.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
  if (!text) return { kind: 'none' }
  // A reply about the passage ("I need to see the actual content…") is the
  // model saying there is nothing to summarise, in words.
  return isUsableRecapSummary(text) ? { kind: 'summary', summary: text } : { kind: 'empty' }
}
