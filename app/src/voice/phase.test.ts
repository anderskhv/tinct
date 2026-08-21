import { describe, expect, it } from 'vitest'
import { voicePhaseFrom } from './phase'
import { INITIAL_VOICE_SNAPSHOT, reduceVoiceSession } from './stateMachine'
import { INITIAL_VOICE_TURN, reduceVoiceTurn } from './voiceTurn'

describe('voicePhaseFrom', () => {
  it('stays listening through a short pause before the model responds', () => {
    const listening = reduceVoiceSession(INITIAL_VOICE_SNAPSHOT, { type: 'START', mode: 'conversation' })
    expect(voicePhaseFrom(listening, INITIAL_VOICE_TURN)).toBe('listening')

    const afterPause = reduceVoiceSession(listening, { type: 'USER_SPEECH_END' })
    expect(afterPause.state).toBe('listening')
    expect(voicePhaseFrom(afterPause, INITIAL_VOICE_TURN)).toBe('listening')
  })

  it('moves to thinking only after the model opens a response', () => {
    const listening = reduceVoiceSession(INITIAL_VOICE_SNAPSHOT, { type: 'START', mode: 'conversation' })
    const thinking = reduceVoiceTurn(INITIAL_VOICE_TURN, { type: 'response.created' }).state
    expect(voicePhaseFrom(listening, thinking)).toBe('thinking')
  })

  it('speaks while answer audio is playing', () => {
    const answering = reduceVoiceSession(
      reduceVoiceSession(INITIAL_VOICE_SNAPSHOT, { type: 'START' }),
      { type: 'ASSISTANT_SPEECH_START' },
    )
    const playing = reduceVoiceTurn(INITIAL_VOICE_TURN, { type: 'output_audio_buffer.started' }).state
    expect(voicePhaseFrom(answering, playing)).toBe('speaking')
  })

  it('is idle when the session has not started', () => {
    expect(voicePhaseFrom(INITIAL_VOICE_SNAPSHOT, INITIAL_VOICE_TURN)).toBe('idle')
  })
})
