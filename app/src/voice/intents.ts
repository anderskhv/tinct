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
  'thanks',
  'thank you',
]

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
