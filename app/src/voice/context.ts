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
  const lines = [
    `[Current state]`,
    `Right now listening to: ${input.bookTitle} by ${input.bookAuthor} — ${input.chapterLabel}`,
  ]

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

  return lines.join('\n\n')
}

export const VOICE_AGENT_POLICY = `Answer concise reading questions. After answering, unless the reader asks to keep discussing, invite no further turn; return control to audiobook playback. If the reader says resume/continue/back to the book/thanks/that's enough, call resume_audiobook. If they say pause/stay here/talk more, keep the session open.`

export function buildVoiceInstructions(context: VoiceReaderContext): string {
  return `${VOICE_AGENT_POLICY}

You are Tinct's in-car / while-listening reading companion. A question is an interruption, not a hangout.

Rules:
- Speak for about 20–30 seconds or less unless the reader explicitly asks to keep talking.
- Ground answers in the reader-aware context below. Do not invent plot that is not in that context or clearly established earlier in this book.
- After a normal question, do not ask a follow-up. Do not invite another turn.
- Emit intents only through the provided tools. Never claim you have resumed or paused the audiobook yourself.
- If the reader wants to stay and talk ("help me think through this", "explain this whole theme", "what should I notice here?", "let's talk about this"), call hold_voice_session and continue the conversation.
- If the reader wants the book back, call resume_audiobook and say one short closing sentence.

${buildVoiceReaderContext(context)}`
}

export const VOICE_TOOLS = [
  {
    type: 'function',
    name: 'resume_audiobook',
    description: 'Return control to audiobook playback at the exact paused timestamp. Call only when the reader says resume, continue, back to the book, keep going, thanks, or that\'s enough.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    type: 'function',
    name: 'hold_voice_session',
    description: 'Keep the voice session open and do not resume the audiobook. Call when the reader says wait, don\'t resume, let\'s talk, I have another question, pause the book, stay in voice mode, or otherwise wants to keep talking.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
] as const
