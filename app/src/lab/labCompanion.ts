import {
  buildCompanionSystemBlocks,
  flattenCompanionSystem,
  type CompanionSystemBlock,
} from '../chat/companionPrompt'
import { nearbyParagraphWindow } from '../voice/context'

export interface LabAskContext {
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  chapterNumber?: number
  paragraphs: string[]
  paragraphIndex: number
  readingAngle?: string
}

/** 1-based paragraph numbers so "second paragraph of Book 1" is in the payload. */
export function numberedLabChapter(paragraphs: string[]): string {
  return paragraphs
    .map((text, index) => `[${index + 1}] ${text.replace(/\s+/g, ' ').trim()}`)
    .filter(line => line.length > 4)
    .join('\n\n')
}

export const ASK_READING_COMPANION_TOOL = 'ask_reading_companion'
export const SET_PLAYBACK_SPEED_TOOL = 'set_playback_speed'
export const SKIP_PARAGRAPH_TOOL = 'skip_paragraph'
export const NEXT_CHAPTER_TOOL = 'next_chapter'
export const RESUME_LISTENING_TOOL = 'resume_listening'

export const LAB_COMPANION_VOICE = `Speak in complete sentences. Warm, literary, and calm. Do not use the formula "it's not X, it's Y." Almost never use em dashes. Do not land on staccato punch lines.`

export const LAB_SPOILER_POLICY = `Hard spoiler rule: you only know as far as the reader has read. Nothing after the current chapter exists for you — no later books, no Book 3, no ending, no plot that is not in this chapter. If asked for the ending or anything after this chapter, say you only have this chapter so far.

If they ask you to read a paragraph that is in the chapter payload below, read it from that payload. Do not ask them to paste. Do not say you lack the book.

If they ask about coding, UI, stocks, news, or paste a note that is not about the chapter, say you are here to talk about the book and wait.`

const PLAYBACK_COMMAND = /\b(go\s+faster|go\s+slower|speed\s+up|slow\s+down|faster|slower|\d+(\.\d+)?\s*x|next\s+chapter|previous\s+chapter|skip(\s+(ahead|forward|back|this))?\b|next\s+paragraph|previous\s+paragraph|resume|continue|keep\s+going|back\s+to\s+the\s+book|play|pause)\b/i

const HARD_QUESTION = /\b(what does (this|that|it) mean|mean(ing)?|theology|theological|compar(e|ison)|character|argument|why does|why is|theme|symbol|foreshadow|homeric|odysseus|telemachus|athena|poseidon|calypso|muse|explain|interpret|notice)\b/i

export const LAB_COVER_LINES = [
  'Let me look at the passage.',
  'I am looking at this with you.',
  'Give me a moment with the page.',
] as const

export type LabPlaybackCommand =
  | { type: 'speed'; rate?: number }
  | { type: 'skip'; direction: 'forward' | 'back' }
  | { type: 'next_chapter' }
  | { type: 'resume' }

export interface LabPlaybackResult {
  ok: boolean
  note?: string
}

export interface LabTalkToolResult {
  handled: boolean
  output: string
  covered: boolean
  queriedClaude: boolean
  continueResponse: boolean
  responseInstructions?: string
  scheduleHearResume?: boolean
}

const PLAYBACK_CONFIRM = 'Speak one short spoken confirm, then stop. Do not add a reading answer.'
const SPEAK_CLAUDE_VERBATIM = 'The reading companion answered. Speak that answer as your own. Do not invent a thinner substitute. Do not summarize it into a weaker reply. Do not mention a tool, a hop, or a second model.'

export function isLabPlaybackCommand(text: string): boolean {
  return PLAYBACK_COMMAND.test(text.trim())
}

/**
 * Cost gate: only hard book questions hop to Claude.
 * Playback, greetings, and thin confirms stay on Realtime.
 */
export function shouldEscalateToCompanion(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  if (isLabPlaybackCommand(trimmed) && !HARD_QUESTION.test(trimmed)) return false
  return HARD_QUESTION.test(trimmed) || trimmed.length > 48
}

export function pickLabCoverLine(index = 0): string {
  return LAB_COVER_LINES[Math.abs(index) % LAB_COVER_LINES.length]
}

export function buildLabCompanionExtraPolicy(input: LabAskContext): string {
  const last = Math.max(0, input.paragraphs.length - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))
  return [
    LAB_SPOILER_POLICY,
    LAB_COMPANION_VOICE,
    `The reader has gotten as far as paragraph ${idx + 1} of ${input.paragraphs.length} in ${input.chapterLabel}. Treat later chapters as unknown.`,
    'This is the /lab companion beside the page, not an in-car interruption. Stay with the question. Do not resume an audiobook.',
  ].join('\n\n')
}

export function buildLabAskInstructions(input: LabAskContext): string {
  return flattenCompanionSystem(buildLabCompanionSystem(input))
}

export function buildLabCompanionSystem(input: LabAskContext): CompanionSystemBlock[] {
  const last = Math.max(0, input.paragraphs.length - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))
  const current = (input.paragraphs[idx] || '').replace(/\s+/g, ' ').trim()
  const chapter = numberedLabChapter(input.paragraphs)
  return buildCompanionSystemBlocks({
    bookTitle: input.bookTitle,
    bookAuthor: input.bookAuthor,
    chapterTitle: `${input.chapterLabel} (Butler)`,
    readingObjective: input.readingAngle,
    currentChapterText: chapter,
    visibleText: current,
    extraPolicy: buildLabCompanionExtraPolicy(input),
  })
}

export function buildLabTalkInstructions(input: LabAskContext): string {
  const last = Math.max(0, input.paragraphs.length - 1)
  const idx = Math.max(0, Math.min(last, input.paragraphIndex))
  const current = (input.paragraphs[idx] || '').replace(/\s+/g, ' ').trim()
  const nearby = nearbyParagraphWindow(input.paragraphs, idx)
  const lines = [
    `You are Tinct's ear and mouth beside the page on /lab. You greet, listen, handle barge-in, and run playback tools. You do not do the deep thinking.`,
    `Greet once with a short "I'm listening," then wait. Do not greet again.`,
    `Playback stays instant. For go faster, slower, skip, next chapter, resume, or play, call the matching playback tool immediately. Never call ${ASK_READING_COMPANION_TOOL} for those.`,
    `Easy questions you can answer from the passage already below, you answer yourself in a short, warm, literary line.`,
    `When the turn is a book question that needs a mind — meaning, theology, comparison, "what does this mean", character, argument — first speak one short natural line as if you are looking at the passage, then call ${ASK_READING_COMPANION_TOOL}. Do not sit in silence. Do not sound like a call-center hold.`,
    `After ${ASK_READING_COMPANION_TOOL} returns, speak that answer as your own. Do not invent a thinner substitute.`,
    LAB_COMPANION_VOICE,
    `Stay in the conversation. Do not call resume_audiobook or return control to an in-car audiobook.`,
    `[Current state]`,
    `Right now reading: ${input.bookTitle} by ${input.bookAuthor} — ${input.chapterLabel} (Butler).`,
    `The reader is on paragraph ${idx + 1} of ${input.paragraphs.length}.`,
  ]

  if (input.readingAngle) lines.push(`Reading angle: ${input.readingAngle}`)
  if (current) lines.push(`Current paragraph [${idx + 1}]:\n"${current}"`)
  if (nearby.length > 0) {
    lines.push(`Nearby paragraphs:\n${nearby.map(text => `- "${text}"`).join('\n')}`)
  }

  return lines.join('\n\n')
}

export const LAB_TALK_TOOLS = [
  {
    type: 'function',
    name: SET_PLAYBACK_SPEED_TOOL,
    description: 'Change hearing speed immediately. Call for go faster, slower, speed up, slow down, or a rate like 1.5x. Do not ask the reading companion.',
    parameters: {
      type: 'object',
      properties: {
        rate: { type: 'number', description: 'Playback rate such as 0.75, 1, 1.25, 1.5, or 2.' },
      },
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: SKIP_PARAGRAPH_TOOL,
    description: 'Skip to the next or previous paragraph immediately. Call for skip, skip ahead, next paragraph, or go back a paragraph. Do not ask the reading companion.',
    parameters: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['forward', 'back'] },
      },
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: NEXT_CHAPTER_TOOL,
    description: 'Advance chapter immediately. Call for next chapter. Do not ask the reading companion.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    type: 'function',
    name: RESUME_LISTENING_TOOL,
    description: 'Return to hearing the book. Call for resume, continue, play, keep going, or back to the book. Speak a short confirm first. Do not ask the reading companion.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    type: 'function',
    name: ASK_READING_COMPANION_TOOL,
    description: 'Ask Tinct\'s reading companion for a spoiler-safe book answer. Use only for meaning, theology, comparison, character, argument, or "what does this mean". Speak a short looking-at-the-passage line first. Never use for skip, speed, next chapter, resume, or play.',
    parameters: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'The reader\'s book question.' },
      },
      required: ['question'],
      additionalProperties: false,
    },
  },
] as const

export async function runEscalatedCompanionTurn(input: {
  question: string
  alreadySpeaking: boolean
  speakCover: (line: string) => boolean
  query: (question: string) => Promise<string>
  coverLine?: string
}): Promise<{ answer: string; covered: boolean }> {
  const covered = input.alreadySpeaking
    ? true
    : input.speakCover(input.coverLine || pickLabCoverLine())
  const answer = await input.query(input.question)
  return { answer, covered }
}

function parseToolArgs(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || '{}') as Record<string, unknown>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export async function handleLabTalkTool(input: {
  name: string
  args: string
  alreadySpeaking: boolean
  speakCover: (line: string) => boolean
  queryCompanion: (question: string) => Promise<string>
  onPlayback: (command: LabPlaybackCommand) => LabPlaybackResult
}): Promise<LabTalkToolResult> {
  const args = parseToolArgs(input.args)

  if (input.name === SET_PLAYBACK_SPEED_TOOL) {
    const rate = typeof args.rate === 'number' ? args.rate : undefined
    const result = input.onPlayback({ type: 'speed', rate })
    return {
      handled: true,
      output: JSON.stringify({ ok: result.ok, action: 'speed', note: result.note }),
      covered: false,
      queriedClaude: false,
      continueResponse: true,
      responseInstructions: PLAYBACK_CONFIRM,
    }
  }

  if (input.name === SKIP_PARAGRAPH_TOOL) {
    const direction = args.direction === 'back' ? 'back' : 'forward'
    const result = input.onPlayback({ type: 'skip', direction })
    return {
      handled: true,
      output: JSON.stringify({ ok: result.ok, action: 'skip', direction, note: result.note }),
      covered: false,
      queriedClaude: false,
      continueResponse: true,
      responseInstructions: PLAYBACK_CONFIRM,
    }
  }

  if (input.name === NEXT_CHAPTER_TOOL) {
    const result = input.onPlayback({ type: 'next_chapter' })
    return {
      handled: true,
      output: JSON.stringify({ ok: result.ok, action: 'next_chapter', note: result.note }),
      covered: false,
      queriedClaude: false,
      continueResponse: true,
      responseInstructions: PLAYBACK_CONFIRM,
    }
  }

  if (input.name === RESUME_LISTENING_TOOL) {
    const result = input.onPlayback({ type: 'resume' })
    return {
      handled: true,
      output: JSON.stringify({ ok: result.ok, action: 'resume_listening', wait_for_speech: true, note: result.note }),
      covered: false,
      queriedClaude: false,
      continueResponse: true,
      responseInstructions: PLAYBACK_CONFIRM,
      scheduleHearResume: true,
    }
  }

  if (input.name !== ASK_READING_COMPANION_TOOL) {
    return {
      handled: false,
      output: '',
      covered: false,
      queriedClaude: false,
      continueResponse: false,
    }
  }

  const question = typeof args.question === 'string' ? args.question.trim() : ''
  if (!question) {
    return {
      handled: true,
      output: JSON.stringify({ ok: false, error: 'missing_question' }),
      covered: false,
      queriedClaude: false,
      continueResponse: true,
      responseInstructions: PLAYBACK_CONFIRM,
    }
  }

  if (isLabPlaybackCommand(question) && !shouldEscalateToCompanion(question)) {
    return handleLabTalkTool({
      ...input,
      name: playbackToolForUtterance(question),
      args: JSON.stringify(playbackArgsForUtterance(question)),
    })
  }

  const hop = await runEscalatedCompanionTurn({
    question,
    alreadySpeaking: input.alreadySpeaking,
    speakCover: input.speakCover,
    query: input.queryCompanion,
  })

  return {
    handled: true,
    output: JSON.stringify({
      speak_verbatim: true,
      answer: hop.answer,
    }),
    covered: hop.covered,
    queriedClaude: true,
    continueResponse: true,
    responseInstructions: SPEAK_CLAUDE_VERBATIM,
  }
}

function playbackToolForUtterance(text: string): string {
  if (/\b(next\s+chapter)\b/i.test(text)) return NEXT_CHAPTER_TOOL
  if (/\b(resume|continue|keep\s+going|back\s+to\s+the\s+book|play)\b/i.test(text)) return RESUME_LISTENING_TOOL
  if (/\b(skip|next\s+paragraph|previous\s+paragraph)\b/i.test(text)) return SKIP_PARAGRAPH_TOOL
  return SET_PLAYBACK_SPEED_TOOL
}

function playbackArgsForUtterance(text: string): Record<string, unknown> {
  if (/\b(skip|previous\s+paragraph|go\s+back)\b/i.test(text) && /\b(back|previous)\b/i.test(text)) {
    return { direction: 'back' }
  }
  if (/\b(skip|next\s+paragraph)\b/i.test(text)) return { direction: 'forward' }
  if (/\b(slow|slower)\b/i.test(text)) return { rate: 0.75 }
  if (/\b(fast|faster|speed\s+up)\b/i.test(text)) return { rate: 1.5 }
  return {}
}

export function decideHearResume(input: {
  pending: boolean
  sawSpeaking: boolean
  state: 'idle' | 'connecting' | 'listening' | 'speaking'
}): 'wait' | 'resume' {
  if (!input.pending) return 'wait'
  if (input.state === 'speaking') return 'wait'
  if (input.sawSpeaking) return 'resume'
  return 'wait'
}
