// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabAskPane } from './LabAskPane'
import type { LabAskTurn } from './labAsk'
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
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

it('keeps a fresh desktop chat below history when its opening layout grows', () => {
  const callbacks: Array<() => void> = []
  vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { callbacks.push(callback) } observe() {} disconnect() {} unobserve() {} })
  let height = 100
  const isThread = (node: HTMLElement) => node.dataset.testid === 'lab-ask-thread'
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function(this: HTMLElement) { return isThread(this) ? height : 0 })
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function(this: HTMLElement) { return isThread(this) ? 600 + (parseFloat(this.querySelector<HTMLElement>('.tc-spacer')?.style.height || '0') || 0) : 0 })
  render(<LabAskPane {...props} turns={[{ id: 'old', role: 'assistant', content: 'Older history', source: 'typed' }]} />)
  const thread = screen.getByTestId('lab-ask-thread')
  expect(screen.getByTestId('lab-ask-thread-spacer').style.height).toBe('100px')
  height = 400
  // The browser clamps the old scroll offset before ResizeObserver delivers.
  thread.scrollTop = 300
  act(() => callbacks.forEach(callback => callback()))
  expect(screen.getByTestId('lab-ask-thread-spacer').style.height).toBe('400px')
  expect(thread.scrollTop).toBeGreaterThanOrEqual(600)
  thread.scrollTop = 120
  fireEvent.scroll(thread)
  height = 500
  act(() => callbacks.forEach(callback => callback()))
  expect(thread.scrollTop).toBe(120)
})
