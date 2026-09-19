import { buildGrokReaderReference, buildGrokVoiceInstructions } from './grokConfig'
import type { VoiceReaderContext } from './types'

const CURRENT_PARAGRAPH_CAP = 600
const NEARBY_PARAGRAPH_CAP = 400
const VISIBLE_TEXT_CAP = 800
const NEARBY_RADIUS = 2

function clip(text: string | undefined, cap: number): string {
  if (!text) return ''
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= cap) return trimmed
  return `${trimmed.slice(0, cap).trim()}…`
}

export function nearbyParagraphWindow(paragraphs: string[], currentIndex: number): string[] {
  if (paragraphs.length === 0) return []
  const idx = Math.max(0, Math.min(paragraphs.length - 1, currentIndex))
  const start = Math.max(0, idx - NEARBY_RADIUS)
  const end = Math.min(paragraphs.length - 1, idx + NEARBY_RADIUS)
  const nearby: string[] = []
  for (let i = start; i <= end; i++) {
    if (i === idx) continue
    const text = clip(paragraphs[i], NEARBY_PARAGRAPH_CAP)
    if (text) nearby.push(text)
  }
  return nearby
}

export function buildVoiceReaderContext(input: VoiceReaderContext): string {
  const edition = input.editionLabel || input.editionKey
  const exactLocation = [
    typeof input.chapterNumber === 'number' ? `chapter ${input.chapterNumber}` : input.chapterLabel,
    typeof input.paragraphIndex === 'number' ? `paragraph ${input.paragraphIndex + 1}` : null,
    typeof input.pageNumber === 'number'
      ? `page ${input.pageNumber}${typeof input.totalPages === 'number' ? ` of ${input.totalPages}` : ''}`
      : null,
  ].filter(Boolean).join(', ')
  const lines = [
    `[Current state]`,
    `Right now listening to: ${input.bookTitle} by ${input.bookAuthor} — ${input.chapterLabel}`,
    exactLocation ? `Exact reader position: ${exactLocation}` : '',
    edition ? `Edition: ${edition}` : '',
  ].filter(Boolean)

  if (input.readingAngle) {
    lines.push(`Reading angle: ${clip(input.readingAngle, 240)}`)
  }

  const current = clip(input.currentParagraph, CURRENT_PARAGRAPH_CAP)
  if (current) {
    lines.push(`Current paragraph:\n"${current}"`)
  }

  const nearby = (input.nearbyParagraphs || [])
    .map(p => clip(p, NEARBY_PARAGRAPH_CAP))
    .filter(Boolean)
    .slice(0, 4)
  if (nearby.length > 0) {
    lines.push(`Nearby paragraphs:\n${nearby.map(p => `- "${p}"`).join('\n')}`)
  }

  const visible = clip(input.visibleText, VISIBLE_TEXT_CAP)
  if (visible) {
    lines.push(`Visible text:\n"${visible}"`)
  }

  const profile = input.readerProfile
  if (profile) {
    const memoryLines: string[] = []
    if (profile.libraryBooks.length > 0) {
      memoryLines.push(`Books in the reader's library: ${profile.libraryBooks.map(book => `${book.title} by ${book.author}`).join('; ')}`)
    }
    if (profile.recentBooks.length > 0) {
      memoryLines.push(`Recently read: ${profile.recentBooks.map(book => `${book.title} (chapter ${book.chapterNumber}${typeof book.paragraphIndex === 'number' ? `, paragraph ${book.paragraphIndex + 1}` : ''})`).join('; ')}`)
    }
    if (profile.recentExchanges.length > 0) {
      memoryLines.push(`Recent questions and answers:\n${profile.recentExchanges.map(exchange => {
        const answer = exchange.answer ? `\n  Tinct answered: ${clip(exchange.answer, 300)}` : ''
        return `- In ${exchange.bookTitle}, the reader asked: ${clip(exchange.question, 220)}${answer}`
      }).join('\n')}`)
    }
    if (profile.readingLanguages.length > 0) {
      memoryLines.push(`Reading languages: ${profile.readingLanguages.join(', ')}`)
    }
    if (memoryLines.length > 0) lines.push(`[Quiet continuity memory]\n${memoryLines.join('\n')}`)
  }

  return lines.join('\n\n')
}

/** The classic reader's prompt: the minimal Tinct instructions plus the position and passage as reference data. */
export function buildVoiceInstructions(context: VoiceReaderContext): string {
  return buildGrokVoiceInstructions(buildGrokReaderReference(context))
}

export const VOICE_TOOLS = [
  {
    type: 'function',
    name: 'resume_audiobook',
    description: 'Return control to audiobook playback at the exact paused timestamp. Call only when the reader explicitly says resume, continue reading, back to the book, keep going, or that\'s enough. Do not call for thanks or thank you.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    type: 'function',
    name: 'end_voice_session',
    description: 'End Talk after one short natural goodbye. Call only when the reader clearly ends the conversation, such as bye, goodbye, see you later, or "okay thanks, that\'s it for now." A bare thanks or thank you is not enough.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    type: 'function',
    name: 'hold_voice_session',
    description: 'Keep the voice session open and do not resume the audiobook. Call when the reader says wait, don\'t resume, let\'s talk, I have another question, pause the book, stay in voice mode, or otherwise wants to keep talking.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
] as const
