// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabAskPane } from './LabAskPane'
import type { LabAskTurn } from './labAsk'
afterEach(() => { cleanup(); vi.restoreAllMocks() })
const props = { conversationState: 'idle' as const, voiceActive: false, typedLoading: false, draft: '', onDraftChange: vi.fn(), onSubmit: vi.fn(), onMic: vi.fn(), onVoiceMode: vi.fn(), desktopCompanion: 'chat' as const }
it('keeps desktop answer arrival and streaming at the reader’s chosen thread position', () => {
  const turns: LabAskTurn[] = [{ id: 'a', role: 'assistant', content: 'First part', source: 'typed' }]
  const { rerender } = render(<LabAskPane {...props} turns={turns} />)
  const thread = screen.getByTestId('lab-ask-thread')
  Object.defineProperties(thread, { scrollHeight: { configurable: true, value: 1800 }, clientHeight: { configurable: true, value: 500 } })
  thread.scrollTop = 1300
  fireEvent.scroll(thread)
  rerender(<LabAskPane {...props} typedLoading turns={[...turns, { id: 'b', role: 'assistant', content: 'New answer', source: 'typed' }]} />)
  expect(thread.scrollTop).toBe(1300)
  thread.scrollTop = 640
  fireEvent.scroll(thread)
  rerender(<LabAskPane {...props} typedLoading turns={[...turns, { id: 'b', role: 'assistant', content: 'New answer grows much longer', source: 'typed' }]} />)
  expect(thread.scrollTop).toBe(640)
})
it('outside dismissal consumes the complete gesture without activating the reader underneath', () => {
  const close = vi.fn(), navigate = vi.fn()
  render(<><button onClick={navigate}>Next page</button><LabAskPane {...props} turns={[]} onDone={close} /></>)
  const next = screen.getByText('Next page')
  fireEvent.pointerDown(screen.getByTestId('lab-ask-input'))
  expect(close).not.toHaveBeenCalled()
  fireEvent.pointerDown(next)
  fireEvent.pointerUp(next)
  fireEvent.click(next)
  expect(close).toHaveBeenCalledOnce()
  expect(navigate).not.toHaveBeenCalled()
})
