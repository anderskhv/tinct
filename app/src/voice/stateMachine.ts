import type { VoiceEvent, VoiceMachineSnapshot, VoiceIntent } from './types'

export const INITIAL_VOICE_SNAPSHOT: VoiceMachineSnapshot = {
  state: 'reading',
  mode: 'quick',
}

function applyIntent(snapshot: VoiceMachineSnapshot, intent: VoiceIntent): VoiceMachineSnapshot {
  if (snapshot.state === 'reading' || intent === 'none') return snapshot

  if (intent === 'resume_audiobook') {
    return { state: 'reading', mode: 'quick' }
  }

  if (intent === 'open_conversation') {
    if (snapshot.state === 'answering') {
      return { state: 'answering', mode: 'conversation' }
    }
    return { state: 'conversation_idle', mode: 'conversation' }
  }

  if (intent === 'hold_session') {
    if (snapshot.state === 'answering') {
      return { state: 'answering', mode: snapshot.mode }
    }
    if (snapshot.mode === 'conversation') {
      return { state: 'conversation_idle', mode: 'conversation' }
    }
    return { state: 'listening', mode: snapshot.mode }
  }

  return snapshot
}

/**
 * App-owned voice session reducer. The realtime model may emit intents,
 * but only these transitions decide whether the audiobook resumes.
 */
export function reduceVoiceSession(
  snapshot: VoiceMachineSnapshot,
  event: VoiceEvent,
): VoiceMachineSnapshot {
  switch (event.type) {
    case 'START':
      if (snapshot.state !== 'reading') return snapshot
      return { state: 'listening', mode: event.mode === 'conversation' ? 'conversation' : 'quick' }

    case 'FAIL':
    case 'STOP':
    case 'EXPLICIT_RESUME':
      return INITIAL_VOICE_SNAPSHOT

    case 'INTENT':
      return applyIntent(snapshot, event.intent)

    case 'USER_SPEECH_START':
      if (snapshot.state === 'reading') return snapshot
      return { state: 'listening', mode: snapshot.mode }

    case 'USER_SPEECH_END':
      if (snapshot.state === 'listening') return snapshot
      return snapshot

    case 'ASSISTANT_SPEECH_START':
      if (snapshot.state === 'reading') return snapshot
      return { state: 'answering', mode: snapshot.mode }

    case 'ASSISTANT_SPEECH_END':
      if (snapshot.state !== 'answering') return snapshot
      if (snapshot.mode === 'conversation') {
        return { state: 'conversation_idle', mode: 'conversation' }
      }
      return { state: 'resume_pending', mode: 'quick' }

    case 'RESUME_WINDOW_ELAPSED':
      if (snapshot.state !== 'resume_pending') return snapshot
      return INITIAL_VOICE_SNAPSHOT

    case 'CONVERSATION_TIMEOUT':
      if (snapshot.state !== 'conversation_idle') return snapshot
      return INITIAL_VOICE_SNAPSHOT

    case 'MIC_TAP':
      if (snapshot.state === 'reading') return { state: 'listening', mode: 'quick' }
      if (snapshot.state === 'resume_pending' || snapshot.state === 'conversation_idle') {
        return { state: 'listening', mode: snapshot.mode }
      }
      // Listening or answering: car-default is leave voice and resume the book.
      return INITIAL_VOICE_SNAPSHOT

    default:
      return snapshot
  }
}

export function isVoiceSessionActive(state: VoiceMachineSnapshot['state']): boolean {
  return state !== 'reading'
}

export function shouldResumeAudiobookOnEnterReading(
  previous: VoiceMachineSnapshot,
  next: VoiceMachineSnapshot,
): boolean {
  return previous.state !== 'reading' && next.state === 'reading'
}
