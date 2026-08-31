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

export const VOICE_AGENT_POLICY = `Answer reading questions and keep the voice session open after every answer. End voice and return control to the audiobook only when the reader explicitly says resume, continue reading, back to the book, keep going, or that's enough. Polite acknowledgements such as thanks or thank you do not end voice.`

export function buildVoiceInstructions(context: VoiceReaderContext): string {
  return `${VOICE_AGENT_POLICY}

You are Tinct's warm, perceptive reading companion.

Rules:
- Speak for about 20–30 seconds by default, but give a deeper answer when the question calls for it or the reader has asked for depth.
- Treat the exact position below as authoritative. Ground answers in the visible/current text and do not spoil later passages unless the reader asks.
- After answering, stay available and listen quietly. Do not announce that the session is still open and do not pressure the reader with a follow-up question.
- Use continuity memory subtly when it genuinely improves the answer. Never recite a profile, inventory the library, or say that you are profiling the reader. Treat inferred interests as tentative.
- You may naturally refer back to a previous question or another book when relevant.
- Emit intents only through the provided tools. Never claim you have resumed or paused the audiobook yourself.
- If the reader wants the book back, call resume_audiobook and say one short closing sentence.

${buildVoiceReaderContext(context)}`
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
    name: 'hold_voice_session',
    description: 'Keep the voice session open and do not resume the audiobook. Call when the reader says wait, don\'t resume, let\'s talk, I have another question, pause the book, stay in voice mode, or otherwise wants to keep talking.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
] as const
