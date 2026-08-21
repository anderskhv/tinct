// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabAskPane } from './LabAskPane'
import type { LabConversationState } from './labAsk'

afterEach(() => {
  cleanup()
})

function pane(state: LabConversationState, onMic = vi.fn(), onVoiceMode = vi.fn()) {
  return (
    <LabAskPane
      conversationState={state}
      voiceActive={state !== 'idle'}
      typedLoading={false}
      turns={[]}
      draft=""
      onDraftChange={vi.fn()}
      onSubmit={vi.fn()}
      onMic={onMic}
      onVoiceMode={onVoiceMode}
    />
  )
}

describe('lab ask living circle', () => {
  it('puts listening and speaking only on the filled circle', () => {
    const { rerender } = render(pane('listening'))
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-listening')
    expect(screen.getByTestId('lab-ask-voice-status').textContent).toBe('Listening')
    expect(screen.getByTestId('lab-ask-voice').textContent).toContain('×')
    expect(screen.getByTestId('lab-ask-voice').textContent).not.toContain('Listening')
    expect(screen.getByTestId('lab-ask-mic').className).not.toMatch(/is-listening|is-speaking|is-connecting/)

    rerender(pane('speaking'))
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-speaking')
    expect(screen.getByTestId('lab-ask-voice-status').textContent).toBe('Speaking')
    expect(screen.getByTestId('lab-ask-voice').textContent).not.toContain('Speaking')
    expect(screen.getByTestId('lab-ask-mic').className).not.toMatch(/is-listening|is-speaking|is-connecting/)
  })

  it('toggles start then stop back to idle, including from connecting', () => {
    const onMic = vi.fn()
    const onVoiceMode = vi.fn()
    const { rerender } = render(pane('idle', onMic, onVoiceMode))
    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    expect(onVoiceMode).toHaveBeenCalledTimes(1)
    expect(onMic).not.toHaveBeenCalled()

    rerender(pane('connecting', onMic, onVoiceMode))
    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    expect(onMic).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('lab-ask-voice').textContent).toContain('×')
  })
})
