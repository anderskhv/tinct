import type { VoiceIntent } from './types'

const OPEN_CONVERSATION_PHRASES = [
  'help me think through this',
  'explain this whole theme',
  'what should i notice here',
  "let's talk about this",
  'lets talk about this',
]

const HOLD_CONTAINS = [
  "don't resume",
  'do not resume',
  "let's talk",
  'lets talk',
  'i have another question',
  'pause the book',
  'stay in voice mode',
  'talk more',
  'stay here',
]

const HOLD_EXACT = ['wait', 'pause', "don't", 'dont']

const RESUME_PHRASES = [
  'back to the book',
  'continue reading',
  'keep going',
  "that's enough",
  'thats enough',
  'resume',
  'continue',
]

const END_EXACT = new Set([
  'bye',
  'bye for now',
  'goodbye',
  'good bye',
  'see you',
  'see you later',
  'see you next time',
  'talk later',
  'talk to you later',
  "that's it",
  'thats it',
  "that's it for now",
  'thats it for now',
  "that's all",
  'thats all',
  "that's all for now",
  'thats all for now',
  "i'm done",
  'im done',
  "i'm done for now",
  'im done for now',
  "we're done",
  'were done',
  'nothing else',
  'end the conversation',
  'end this conversation',
  'end voice mode',
  'stop talking',
])

function isExplicitSessionEnd(text: string): boolean {
  if (END_EXACT.has(text)) return true
  const withoutPoliteLead = text.replace(
    /^(?:(?:ok|okay|alright|all right)\s+)?(?:(?:thanks|thank you)\s+)?/,
    '',
  )
  return withoutPoliteLead !== text && END_EXACT.has(withoutPoliteLead)
}

export function normalizeVoiceUtterance(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Local classifier. The model may also emit tool intents, but the app
 * decides what those mean. Open-ended / hold phrases win over resume.
 */
export function classifyVoiceUtterance(text: string): VoiceIntent {
  const t = normalizeVoiceUtterance(text)
  if (!t) return 'none'

  if (OPEN_CONVERSATION_PHRASES.some(phrase => t.includes(phrase))) {
    return 'open_conversation'
  }

  if (HOLD_CONTAINS.some(phrase => t.includes(phrase)) || HOLD_EXACT.includes(t)) {
    return 'hold_session'
  }

  if (isExplicitSessionEnd(t)) {
    return 'end_voice_session'
  }

  if (RESUME_PHRASES.some(phrase => t === phrase || t.startsWith(`${phrase} `))) {
    return 'resume_audiobook'
  }

  return 'none'
}

/**
 * The model must not resume the book from vibes. Honor resume_audiobook
 * only when the reader actually asked to go back.
 */
export function shouldHonorModelResume(lastUserIntent: VoiceIntent): boolean {
  return lastUserIntent === 'resume_audiobook'
}

/** End is separately gated so a goodbye never forces a paused audiobook to play. */
export function shouldHonorModelEnd(lastUserIntent: VoiceIntent): boolean {
  return lastUserIntent === 'end_voice_session'
}
