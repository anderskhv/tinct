import { describe, expect, it } from 'vitest'
import { INITIAL_VOICE_SNAPSHOT, reduceVoiceSession } from './stateMachine'
import type { VoiceMachineSnapshot } from './types'
import {
  INITIAL_VOICE_TURN,
  noteToolCallHandled,
  reduceVoiceTurn,
  type VoiceRealtimeEvent,
  type VoiceTurnState,
} from './voiceTurn'

function drive(events: VoiceRealtimeEvent[], start: VoiceTurnState = INITIAL_VOICE_TURN) {
  const session = {
    turn: start,
    machine: reduceVoiceSession(INITIAL_VOICE_SNAPSHOT, { type: 'START' }) as VoiceMachineSnapshot,
    signals: [] as Array<'speech_start' | 'speech_end'>,
    apply(event: VoiceRealtimeEvent) {
      const result = reduceVoiceTurn(session.turn, event)
      session.turn = result.state
      if (result.signal) {
        session.signals.push(result.signal)
        session.machine = reduceVoiceSession(session.machine, {
          type: result.signal === 'speech_start' ? 'ASSISTANT_SPEECH_START' : 'ASSISTANT_SPEECH_END',
        })
      }
    },
  }

  for (const event of events) session.apply(event)
  return session
}

describe('voice turn completion', () => {
  it('audio buffer stopped mid-answer must not resume', () => {
    const session = drive([
      { type: 'response.created' },
      { type: 'output_audio_buffer.started' },
      { type: 'output_audio_buffer.stopped' },
    ])

    expect(session.signals).toEqual(['speech_start'])
    expect(session.machine).toEqual({ state: 'answering', mode: 'conversation' })

    session.apply({ type: 'output_audio_buffer.started' })
    session.apply({ type: 'response.done', response: { status: 'completed', output: [{ type: 'message' }] } })
    expect(session.machine.state).toBe('answering')

    session.apply({ type: 'output_audio_buffer.stopped' })
    expect(session.machine).toEqual({ state: 'conversation_idle', mode: 'conversation' })
  })

  it('only complete answers enter conversation_idle', () => {
    const generationDoneWhilePlaying = drive([
      { type: 'response.created' },
      { type: 'output_audio_buffer.started' },
      { type: 'response.output_audio.delta' },
      { type: 'response.done', response: { status: 'completed', output: [{ type: 'message' }] } },
    ])
    expect(generationDoneWhilePlaying.machine.state).toBe('answering')
    expect(generationDoneWhilePlaying.signals).toEqual(['speech_start'])

    generationDoneWhilePlaying.apply({ type: 'output_audio_buffer.stopped' })
    expect(generationDoneWhilePlaying.machine).toEqual({ state: 'conversation_idle', mode: 'conversation' })
    expect(generationDoneWhilePlaying.signals).toEqual(['speech_start', 'speech_end'])
  })

  it('does not start resume on a tool call mid-answer', () => {
    const session = drive([
      { type: 'response.created' },
      { type: 'output_audio_buffer.started' },
      { type: 'response.function_call_arguments.done', name: 'hold_voice_session', call_id: 'call_1' },
      { type: 'response.done', response: { status: 'completed', output: [{ type: 'function_call' }] } },
    ])

    expect(session.machine.state).toBe('answering')
    expect(session.signals).toEqual(['speech_start'])

    const afterTool = noteToolCallHandled(session.turn)
    expect(afterTool.signal).toBeNull()
    expect(afterTool.state.pendingFunctionCall).toBe(false)
    session.turn = afterTool.state

    session.apply({ type: 'response.created' })
    session.apply({ type: 'output_audio_buffer.started' })
    expect(session.machine.state).toBe('answering')

    session.apply({ type: 'response.done', response: { status: 'completed', output: [{ type: 'message' }] } })
    expect(session.machine.state).toBe('answering')

    session.apply({ type: 'output_audio_buffer.stopped' })
    expect(session.machine).toEqual({ state: 'conversation_idle', mode: 'conversation' })
  })

  it('still returns to conversation_idle after a finished spoken answer', () => {
    const session = drive([
      { type: 'response.created' },
      { type: 'output_audio_buffer.started' },
      { type: 'response.done' },
      { type: 'output_audio_buffer.stopped' },
    ])
    expect(session.machine).toEqual({ state: 'conversation_idle', mode: 'conversation' })
  })

  it('enters conversation_idle after a completed answer even if the model also called a tool', () => {
    const session = drive([
      { type: 'response.created' },
      { type: 'output_audio_buffer.started' },
      { type: 'response.function_call_arguments.done', name: 'resume_audiobook', call_id: 'call_2' },
      { type: 'response.done', response: { status: 'completed', output: [{ type: 'function_call' }] } },
      { type: 'output_audio_buffer.stopped' },
    ])
    expect(session.machine.state).toBe('answering')

    const afterTool = noteToolCallHandled(session.turn)
    expect(afterTool.signal).toBe('speech_end')
    expect(reduceVoiceSession(session.machine, { type: 'ASSISTANT_SPEECH_END' })).toEqual({
      state: 'conversation_idle',
      mode: 'conversation',
    })
  })
})
