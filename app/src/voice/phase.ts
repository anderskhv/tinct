import type { VoiceMachineSnapshot, VoicePhase } from './types'
import type { VoiceTurnState } from './voiceTurn'

/**
 * Visual phase for an orb or composer control.
 * A short pause stays `listening` until the model actually opens a response.
 */
export function voicePhaseFrom(
  machine: VoiceMachineSnapshot,
  turn: VoiceTurnState,
): VoicePhase {
  if (machine.state === 'reading') return 'idle'
  if (machine.state === 'answering' || turn.audioPlaying) return 'speaking'
  if (turn.responseOpen || turn.pendingFunctionCall) return 'thinking'
  if (machine.state === 'listening') return 'listening'
  return 'idle'
}
