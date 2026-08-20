/**
 * Decides when a Realtime spoken answer is actually finished.
 *
 * OpenAI can emit `response.done` when generation finishes, while WebRTC
 * audio is still playing. It can also emit `output_audio_buffer.stopped`
 * during a pause or tool call in a still-open response. Neither event
 * alone means the reader has heard the full answer.
 */

export type VoiceRealtimeEvent = {
  type?: string
  transcript?: string
  name?: string
  call_id?: string
  error?: { message?: string }
  item?: { transcript?: string; name?: string; call_id?: string }
  response?: {
    status?: string
    output?: Array<{ type?: string }>
  }
}

export type VoiceTurnSignal = 'speech_start' | 'speech_end' | null

export interface VoiceTurnState {
  responseOpen: boolean
  audioPlaying: boolean
  spokenThisTurn: boolean
  pendingFunctionCall: boolean
}

export const INITIAL_VOICE_TURN: VoiceTurnState = {
  responseOpen: false,
  audioPlaying: false,
  spokenThisTurn: false,
  pendingFunctionCall: false,
}

function canCompleteSpokenAnswer(state: VoiceTurnState): boolean {
  return state.spokenThisTurn
    && !state.audioPlaying
    && !state.responseOpen
    && !state.pendingFunctionCall
}

function maybeSpeechEnd(state: VoiceTurnState): { state: VoiceTurnState; signal: VoiceTurnSignal } {
  if (!canCompleteSpokenAnswer(state)) return { state, signal: null }
  return {
    state: { ...state, spokenThisTurn: false },
    signal: 'speech_end',
  }
}

export function reduceVoiceTurn(
  state: VoiceTurnState,
  event: VoiceRealtimeEvent,
): { state: VoiceTurnState; signal: VoiceTurnSignal } {
  switch (event.type) {
    case 'response.created':
      return {
        state: {
          ...state,
          responseOpen: true,
        },
        signal: null,
      }

    case 'output_audio_buffer.started':
    case 'response.output_audio.delta':
    case 'response.audio.delta': {
      const next: VoiceTurnState = {
        ...state,
        audioPlaying: true,
        spokenThisTurn: true,
      }
      return {
        state: next,
        signal: state.audioPlaying ? null : 'speech_start',
      }
    }

    case 'output_audio_buffer.stopped':
      return maybeSpeechEnd({ ...state, audioPlaying: false })

    case 'response.function_call_arguments.done':
      return {
        state: { ...state, pendingFunctionCall: true },
        signal: null,
      }

    case 'response.done':
      return maybeSpeechEnd({
        ...state,
        responseOpen: false,
      })

    default:
      return { state, signal: null }
  }
}

/** Clear the in-flight tool gate after the app has handled the call. */
export function noteToolCallHandled(
  state: VoiceTurnState,
): { state: VoiceTurnState; signal: VoiceTurnSignal } {
  return maybeSpeechEnd({ ...state, pendingFunctionCall: false })
}
