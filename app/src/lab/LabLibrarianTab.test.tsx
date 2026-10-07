// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabLibrarianTab, LabLibrarianTabNote, LabLibrarianTabSettings, measureLibrarianTabFrame, type LabLibrarianTabProps } from './LabLibrarianTab.tsx'
import { LabSuperMenu } from './LabSuperMenu'
import { LabAskPane } from './LabAskPane'
import { LIBRARIAN_TAB_LONG_PRESS_MS, LIBRARIAN_TAB_PEEK_DELAY_MS, LIBRARIAN_TAB_PEEK_MS } from './labLibrarianTab'

const VIEW = { width: 390, height: 844 }
const PASSAGE = { left: 0, top: 53, right: 390, bottom: 818 }

function rect(r: { left: number; top: number; right: number; bottom: number }): DOMRect {
  return { ...r, x: r.left, y: r.top, width: r.right - r.left, height: r.bottom - r.top, toJSON: () => r } as DOMRect
}

/** A page wrap holding a painted passage with a 24.8px margin, as on a phone. */
function surface() {
  const wrap = document.createElement('div')
  const passage = document.createElement('div')
  passage.className = 'lab-passage'
  passage.style.paddingLeft = '24.8px'
  passage.style.paddingRight = '24.8px'
  passage.getBoundingClientRect = () => rect(PASSAGE)
  wrap.appendChild(passage)
  document.body.appendChild(wrap)
  const ref = createRef<HTMLElement>() as { current: HTMLElement | null }
  ref.current = wrap
  return ref
}

function renderTab(props: Partial<LabLibrarianTabProps> = {}) {
  const handlers = { onOpen: vi.fn(), onDock: vi.fn(), onHide: vi.fn(), onPeekEnd: vi.fn() }
  const utils = render(
    <div className="lab">
      <LabLibrarianTab surfaceRef={surface()} measureKey="k" dock={{ side: 'right', y: 0.62 }} mode="chat" longPressMode={null} {...handlers} {...props} />
    </div>,
  )
  return { ...handlers, ...utils, band: () => screen.getByTestId('lab-librarian-tab-band') }
}

const at = (x: number, y: number, pointerId = 1) => ({ clientX: x, clientY: y, pointerId, pointerType: 'touch', button: 0 })

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: VIEW.width })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: VIEW.height })
})

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('measuring the margin', () => {
  it('reads the painted passage and its side padding, skipping hidden measuring copies', () => {
    const ref = surface()
    const measure = document.createElement('div')
    measure.className = 'lab-page-measure'
    const ghost = document.createElement('div')
    ghost.className = 'lab-passage'
    ghost.getBoundingClientRect = () => rect({ left: 0, top: 0, right: 999, bottom: 999 })
    measure.appendChild(ghost)
    ref.current!.prepend(measure)
    const measured = measureLibrarianTabFrame(ref.current)!
    expect(measured.frame).toMatchObject({ left: 0, right: 390, top: 53, bottom: 818, marginLeft: 24.8, marginRight: 24.8 })
  })
})

describe('the tab', () => {
  it('draws an 18 × 40 tab flush right with the Chat icon, in a 40 × 44 band', () => {
    const { band } = renderTab()
    const tab = screen.getByTestId('lab-librarian-tab')
    expect(tab.style.width).toBe('18px')
    expect(tab.style.height).toBe('40px')
    expect(band().style.width).toBe('40px')
    expect(band().style.height).toBe('44px')
    expect(band().style.transform).toContain('350px')
    expect(band().getAttribute('aria-label')).toBe('Librarian tab')
    expect(tab.querySelector('svg')!.getAttribute('data-mode')).toBe('chat')
    expect(tab.querySelector('svg')!.getAttribute('width')).toBe('12')
  })

  it('shows the mic when a tap opens Talk', () => {
    renderTab({ mode: 'talk' })
    expect(screen.getByTestId('lab-librarian-tab').querySelector('svg')!.getAttribute('data-mode')).toBe('talk')
  })

  it('opens the default mode on a tap and on Enter', () => {
    const { band, onOpen } = renderTab()
    fireEvent.pointerDown(band(), at(380, 530))
    fireEvent.pointerUp(band(), at(380, 530))
    expect(onOpen).toHaveBeenCalledWith('chat')
    fireEvent.keyDown(band(), { key: 'Enter' })
    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it('long press does nothing with the setting off: a long hold is still a tap', () => {
    vi.useFakeTimers()
    const { band, onOpen } = renderTab({ longPressMode: null })
    fireEvent.pointerDown(band(), at(380, 530))
    expect(screen.queryByTestId('lab-librarian-tab-ring')).toBeNull()
    act(() => { vi.advanceTimersByTime(LIBRARIAN_TAB_LONG_PRESS_MS + 200) })
    expect(onOpen).not.toHaveBeenCalled()
    fireEvent.pointerUp(band(), at(380, 530))
    expect(onOpen).toHaveBeenCalledWith('chat')
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('long press opens the other mode after 450ms with the ring, and the release is not a tap', () => {
    vi.useFakeTimers()
    const { band, onOpen } = renderTab({ longPressMode: 'talk' })
    fireEvent.pointerDown(band(), at(380, 530))
    expect(screen.getByTestId('lab-librarian-tab-ring')).toBeTruthy()
    act(() => { vi.advanceTimersByTime(LIBRARIAN_TAB_LONG_PRESS_MS - 10) })
    expect(onOpen).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(20) })
    expect(onOpen).toHaveBeenCalledWith('talk')
    fireEvent.pointerUp(band(), at(380, 530))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('a drag along the edge docks where it was let go, without opening anything', () => {
    const { band, onOpen, onDock } = renderTab()
    fireEvent.pointerDown(band(), at(380, 527))
    fireEvent.pointerMove(band(), at(378, 480))
    fireEvent.pointerMove(band(), at(378, 300))
    expect(band().getAttribute('data-phase')).toBe('dragging')
    expect(screen.getByTestId('lab-librarian-tab-target')).toBeTruthy()
    fireEvent.pointerUp(band(), at(378, 300))
    expect(onOpen).not.toHaveBeenCalled()
    expect(onDock).toHaveBeenCalledTimes(1)
    const dock = onDock.mock.calls[0][0]
    expect(dock.side).toBe('right')
    expect(dock.y).toBeLessThan(0.4)
    expect(screen.queryByTestId('lab-librarian-tab-target')).toBeNull()
  })

  it('pulled off the edge it becomes the orb; dropped near the other edge it docks there', () => {
    const { band, onDock } = renderTab()
    fireEvent.pointerDown(band(), at(380, 530))
    fireEvent.pointerMove(band(), at(340, 530))
    expect(screen.queryByTestId('lab-librarian-tab-orb')).toBeNull()
    fireEvent.pointerMove(band(), at(300, 530))
    expect(screen.getByTestId('lab-librarian-tab-orb')).toBeTruthy()
    fireEvent.pointerMove(band(), at(120, 400))
    fireEvent.pointerUp(band(), at(120, 400))
    expect(onDock.mock.calls[0][0].side).toBe('left')
  })

  it('dropped on the hide target, it hides', () => {
    const { band, onHide, onDock } = renderTab()
    fireEvent.pointerDown(band(), at(380, 530))
    fireEvent.pointerMove(band(), at(300, 600))
    fireEvent.pointerMove(band(), at(195, 784))
    expect(screen.getByTestId('lab-librarian-tab-target').className).toContain('is-active')
    fireEvent.pointerUp(band(), at(195, 784))
    expect(onHide).toHaveBeenCalledTimes(1)
    expect(onDock).not.toHaveBeenCalled()
  })

  it('peeks once, about a second, after the page settles', () => {
    vi.useFakeTimers()
    const { band, onPeekEnd } = renderTab({ peek: true })
    expect(band().className).not.toContain('is-peeking')
    act(() => { vi.advanceTimersByTime(LIBRARIAN_TAB_PEEK_DELAY_MS) })
    expect(band().className).toContain('is-peeking')
    expect(screen.getByTestId('lab-librarian-tab').style.height).toBe('60px')
    act(() => { vi.advanceTimersByTime(LIBRARIAN_TAB_PEEK_MS) })
    expect(band().className).not.toContain('is-peeking')
    expect(onPeekEnd).toHaveBeenCalledTimes(1)
  })

  it('is still under reduced motion and e-ink', () => {
    const { band } = renderTab({ eink: true })
    expect(band().className).toContain('is-still')
  })

  it('draws nothing when the margin cannot hold it', () => {
    const ref = surface()
    ;(ref.current!.firstElementChild as HTMLElement).style.paddingRight = '10px'
    render(<LabLibrarianTab surfaceRef={ref} measureKey="k" dock={{ side: 'right', y: 0.62 }} mode="chat" longPressMode={null} onOpen={vi.fn()} onDock={vi.fn()} onHide={vi.fn()} />)
    expect(screen.queryByTestId('lab-librarian-tab-band')).toBeNull()
  })
})

describe('the tab settings and the Undo note', () => {
  it('offers Tab opens, Long press and Hide the tab', () => {
    const onMode = vi.fn()
    const onLongPress = vi.fn()
    const onHide = vi.fn()
    const onClose = vi.fn()
    render(<LabLibrarianTabSettings mode="chat" longPress={false} onMode={onMode} onLongPress={onLongPress} onHide={onHide} onClose={onClose} />)
    const sheet = screen.getByTestId('lab-librarian-settings')
    expect(sheet.textContent).toContain('Librarian tab')
    expect(screen.getByTestId('lab-librarian-opens-chat').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('lab-librarian-long-press-off').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByTestId('lab-librarian-opens-talk'))
    expect(onMode).toHaveBeenCalledWith('talk')
    fireEvent.click(screen.getByTestId('lab-librarian-long-press-other'))
    expect(onLongPress).toHaveBeenCalledWith(true)
    fireEvent.click(screen.getByText('Hide the tab'))
    expect(onHide).toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('offers no Talk for a reader’s own book', () => {
    render(<LabLibrarianTabSettings mode="chat" longPress={false} talkAvailable={false} onMode={vi.fn()} onLongPress={vi.fn()} onHide={vi.fn()} onClose={vi.fn()} />)
    expect((screen.getByTestId('lab-librarian-opens-talk') as HTMLButtonElement).disabled).toBe(true)
  })

  it('the note says the tab is hidden and undoes it', () => {
    const onUndo = vi.fn()
    render(<LabLibrarianTabNote onUndo={onUndo} />)
    expect(screen.getByTestId('lab-librarian-note').textContent).toContain('Librarian tab hidden')
    fireEvent.click(screen.getByText('Undo'))
    expect(onUndo).toHaveBeenCalled()
  })
})

describe('the menu’s Librarian row', () => {
  it('opens the default mode from its body and either mode from its icons', () => {
    const onSelect = vi.fn()
    const { rerender } = render(<LabSuperMenu open phone onSelect={onSelect} onClose={() => {}} />)
    expect(screen.getByTestId('lab-super-row-librarian').textContent).toBe('Librarian')
    fireEvent.click(screen.getByTestId('lab-super-row-librarian'))
    expect(onSelect).toHaveBeenLastCalledWith('chat')
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    expect(onSelect).toHaveBeenLastCalledWith('talk')
    fireEvent.click(screen.getByRole('button', { name: 'Chat' }))
    expect(onSelect).toHaveBeenLastCalledWith('chat')
    rerender(<LabSuperMenu open phone onSelect={onSelect} onClose={() => {}} librarianMode="talk" />)
    fireEvent.click(screen.getByTestId('lab-super-row-librarian'))
    expect(onSelect).toHaveBeenLastCalledWith('talk')
  })

  it('a reader’s own book: Chat and Talk as for any book, the body opening the default (2026-10-08)', () => {
    const onSelect = vi.fn()
    render(<LabSuperMenu open phone privateBook onSelect={onSelect} onClose={() => {}} librarianMode="talk" />)
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    expect(onSelect).toHaveBeenLastCalledWith('talk')
    fireEvent.click(screen.getByTestId('lab-super-row-librarian'))
    expect(onSelect).toHaveBeenLastCalledWith('talk')
    fireEvent.click(screen.getByRole('button', { name: 'Chat' }))
    expect(onSelect).toHaveBeenLastCalledWith('chat')
  })
})

describe('⋯ in the chat header', () => {
  const pane = (props: Record<string, unknown>) => (
    <LabAskPane conversationState={{ kind: 'idle' } as never} voiceActive={false} typedLoading={false} turns={[]} draft=""
      onDraftChange={() => {}} onSubmit={() => {}} onMic={() => {}} onDone={() => {}} {...props} />
  )

  it('opens the tab settings on the phone sheet, and is absent without a handler', () => {
    const onTabSettings = vi.fn()
    const { rerender } = render(pane({ phoneSheet: true, onTabSettings }))
    fireEvent.click(screen.getByTestId('lab-ask-tab-settings'))
    expect(onTabSettings).toHaveBeenCalled()
    rerender(pane({ phoneSheet: true }))
    expect(screen.queryByTestId('lab-ask-tab-settings')).toBeNull()
  })

  it('on the desktop, a minimized chat draws no orb when the tab stands in for it', () => {
    const { rerender } = render(pane({ desktopCompanion: 'chat', minimized: true, onMinimizedChange: () => {}, minimizedOrb: false, onTabSettings: () => {} }))
    expect(screen.queryByTestId('lab-chat-orb')).toBeNull()
    rerender(pane({ desktopCompanion: 'chat', minimized: true, onMinimizedChange: () => {}, minimizedOrb: true }))
    expect(screen.getByTestId('lab-chat-orb')).toBeTruthy()
  })
})
