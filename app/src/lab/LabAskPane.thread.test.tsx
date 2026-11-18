// @vitest-environment jsdom
// The redrawn chat thread in the book reader (Anders, 9 Oct 2026; docs/chat/BRIEF.md,
// docs/chat/mockup.html). The shared model is tested in chatThread.test.ts; this file
// checks the React home renders it: dividers, the hover/press row, the kept copy mark,
// the quote, streaming, the composer's keys, and nothing the mockup leaves out.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabAskPane } from './LabAskPane'
import type { LabAskTurn } from './labAsk'
import { HINT_TEXT, PRESS_FADE_MS, PRESS_HOLD_MS, threadHtml } from '../../public/lab/chat-thread.js'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  try { sessionStorage.clear() } catch { /* none */ }
})

const DAY1 = new Date(2026, 9, 3, 10, 24).getTime()
const DAY2 = new Date(2026, 9, 9, 9, 5).getTime()
const LABELS = { 1: 'The Window · 1', 2: 'The Window · 2' }

const turn = (id: string, role: 'user' | 'assistant', content: string, timestamp: number | undefined, chapterNumber: number, extra: Partial<LabAskTurn> = {}): LabAskTurn =>
  ({ id, role, content, timestamp, chapterNumber, source: 'typed', ...extra })

const twoChaptersTwoDays = [
  turn('q1', 'user', 'Who is James?', DAY1, 1),
  turn('a1', 'assistant', 'The Ramsays’ youngest son.', DAY1 + 1000, 1),
  turn('q2', 'user', 'What is she really saying?', DAY1 + 60_000, 2),
  turn('a2', 'assistant', 'She gives James hope and hedges it.', DAY1 + 61_000, 2),
  turn('q3', 'user', 'Why “up with the lark”?', DAY2, 2, { highlightedText: '“But you’ll have to be up with the lark,” she added.' }),
  turn('a3', 'assistant', 'Larks sing at first light.', DAY2 + 1000, 2),
]

function pane(props: Partial<Parameters<typeof LabAskPane>[0]> = {}) {
  return (
    <LabAskPane
      conversationState="idle"
      voiceActive={false}
      typedLoading={false}
      turns={twoChaptersTwoDays}
      chapterLabels={LABELS}
      draft=""
      onDraftChange={vi.fn()}
      onSubmit={vi.fn()}
      onMic={vi.fn()}
      onVoiceMode={vi.fn()}
      onDone={vi.fn()}
      {...props}
    />
  )
}

describe('dividers', () => {
  it('a thread with messages from two chapters and two days shows exactly two dividers', () => {
    render(pane())
    expect(screen.getAllByTestId('lab-ask-location').map(node => node.textContent)).toEqual([
      'The Window · 2 · 3 October',
      'The Window · 2 · 9 October',
    ])
  })
  it('the same chapter on the same day shows none', () => {
    render(pane({ turns: twoChaptersTwoDays.slice(0, 2) }))
    expect(screen.queryAllByTestId('lab-ask-location')).toHaveLength(0)
  })
})

describe('the hover / press row', () => {
  it('is hidden by default (CSS), shown on hover (desktop) and on press-and-hold (phone), fading after 3 s', () => {
    const css = readFileSync(resolve(__dirname, '../../public/lab/chat-thread.css'), 'utf8')
    expect(css).toMatch(/\.tc \.tc-acts \{[^}]*display:\s*none/)
    expect(css).toMatch(/\.tc-turn:hover \.tc-acts/)
    expect(css).toMatch(/\.tc-turn\[data-pressed\] \.tc-acts/)
    vi.useFakeTimers()
    render(pane({ phoneSheet: true }))
    const older = screen.getAllByTestId('lab-ask-turn-assistant')[0]
    expect(older.hasAttribute('data-pressed')).toBe(false)
    fireEvent(older.querySelector('.tc-answer')!, Object.assign(new Event('pointerdown', { bubbles: true }), { pointerType: 'touch' }))
    act(() => { vi.advanceTimersByTime(PRESS_HOLD_MS) })
    expect(older.getAttribute('data-pressed')).toBe('true')
    // The row holds copy and the exact time.
    expect(older.querySelector('.tc-acts [aria-label="Copy answer"]')).toBeTruthy()
    expect(older.querySelector('.tc-acts time')?.textContent).toBe('3 Oct, 10:24')
    act(() => { vi.advanceTimersByTime(PRESS_FADE_MS) })
    expect(older.hasAttribute('data-pressed')).toBe(false)
  })

  it('the newest answer keeps its copy mark, and the mark moves when a newer answer arrives', () => {
    const { rerender } = render(pane())
    const keptOn = () => Array.from(document.querySelectorAll('.tc-acts.is-kept')).map(node => node.closest('[data-turn-id]')!.getAttribute('data-turn-id'))
    expect(keptOn()).toEqual(['a3'])
    const asked = [...twoChaptersTwoDays, turn('q4', 'user', 'And then?', DAY2 + 5000, 2)]
    rerender(pane({ turns: asked, typedLoading: true }))
    expect(keptOn()).toEqual(['a3'])
    // While the new answer arrives: the previous answer keeps its mark (nothing above moves), the new one has none, no "thinking" line.
    rerender(pane({ turns: [...asked, turn('a4', 'assistant', 'Then the evening', undefined, 2)], typedLoading: true }))
    expect(keptOn()).toEqual(['a3'])
    const live = screen.getAllByTestId('lab-ask-turn-assistant').at(-1)!
    expect(live.classList.contains('is-streaming')).toBe(true)
    expect(live.querySelector('.tc-acts')).toBeNull()
    expect(document.body.textContent).not.toMatch(/on the way|thinking/i)
    rerender(pane({ turns: [...asked, turn('a4', 'assistant', 'Then the evening comes.', DAY2 + 9000, 2)] }))
    expect(keptOn()).toEqual(['a4'])
  })

  it('before the first word arrives the answer is three faint breathing dots: no cursor, no words (Anders, 10 Oct 2026)', () => {
    render(pane({ turns: [...twoChaptersTwoDays, turn('q4', 'user', 'And then?', DAY2 + 5000, 2)], typedLoading: true }))
    const pending = screen.getByTestId('lab-ask-pending')
    expect(pending.querySelectorAll('.tc-wait i')).toHaveLength(3)
    expect(pending.querySelector('.tc-cursor')).toBeNull()
    expect(pending.textContent).toBe('')
  })

  it('while the answer arrives each word is its own span (new ones fade in); finished, it is plain text again', () => {
    const asked = [...twoChaptersTwoDays, turn('q4', 'user', 'And then?', DAY2 + 5000, 2)]
    const { rerender } = render(pane({ turns: [...asked, turn('a4', 'assistant', 'Then the', DAY2 + 6000, 2)], typedLoading: true }))
    const live = () => screen.getAllByTestId('lab-ask-turn-assistant').at(-1)!
    const first = live().querySelector('.tc-w')
    expect(Array.from(live().querySelectorAll('.tc-w')).map(node => node.textContent)).toEqual(['Then', 'the'])
    rerender(pane({ turns: [...asked, turn('a4', 'assistant', 'Then the evening comes.', DAY2 + 6000, 2)], typedLoading: true }))
    // The words already shown keep their nodes: only "evening" and "comes." mount (and fade).
    expect(live().querySelector('.tc-w')).toBe(first)
    expect(live().querySelectorAll('.tc-w')).toHaveLength(4)
    rerender(pane({ turns: [...asked, turn('a4', 'assistant', 'Then the evening comes.', DAY2 + 6000, 2)] }))
    expect(live().querySelectorAll('.tc-w')).toHaveLength(0)
    expect(live().querySelector('.tc-md')?.textContent).toBe('Then the evening comes.')
  })
})

describe('at rest: one copy mark, on the newest answer (Anders, 9 Oct 2026)', () => {
  it('with the thread’s own stylesheet applied, exactly one copy mark shows without hover or press, under the newest answer', () => {
    const style = document.createElement('style')
    // Media-gated hover rules need a pointer; jsdom applies the base rules only, which is the state at rest.
    style.textContent = readFileSync(resolve(__dirname, '../../public/lab/chat-thread.css'), 'utf8').replace(/@media[^{]*\{([\s\S]*?\})\s*\}/g, '')
    document.head.append(style)
    try {
      render(pane())
      const shown = Array.from(document.querySelectorAll<HTMLElement>('.tc-acts')).filter(row => getComputedStyle(row).display !== 'none')
      expect(shown).toHaveLength(1)
      expect(shown[0].closest('[data-turn-id]')!.getAttribute('data-turn-id')).toBe('a3')
      // No time beside it, and no mark on any bubble.
      expect(getComputedStyle(shown[0].querySelector('.tc-time')!).display).toBe('none')
      expect(Array.from(document.querySelectorAll<HTMLElement>('.tc-q .tc-acts')).every(row => getComputedStyle(row).display === 'none')).toBe(true)
      // Pressed, an older answer's row shows too (and only while pressed).
      const older = screen.getAllByTestId('lab-ask-turn-assistant')[0]
      older.setAttribute('data-pressed', 'true')
      expect(getComputedStyle(older.querySelector('.tc-acts')!).display).toBe('flex')
    } finally {
      style.remove()
    }
  })
})

describe('opening with history: a clean window, the history above it', () => {
  it.each([false, true])('opens scrolled past writing space with embeddedPhoneCard=%s; scrolling up reaches history', (embeddedPhoneCard) => {
    const client = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
    const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
    const isThread = (node: HTMLElement) => node.getAttribute('data-testid') === 'lab-ask-thread'
    // The thread's content is the messages (600px) plus whatever height the spacer has.
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get(this: HTMLElement) { return isThread(this) ? 400 : 0 } })
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get(this: HTMLElement) {
      if (!isThread(this)) return 0
      return 600 + (parseFloat((this.querySelector('[data-testid="lab-ask-thread-spacer"]') as HTMLElement | null)?.style.height || '0') || 0)
    } })
    try {
      render(pane({ embeddedPhoneCard }))
      const thread = screen.getByTestId('lab-ask-thread')
      const spacer = screen.getByTestId('lab-ask-thread-spacer')
      expect(spacer.style.height).toBe('400px')
      // Pinned to the end: the visible window (scrollTop .. scrollTop + 400) is all spacer, no message in it.
      expect(thread.scrollTop).toBe(1000)
      expect(thread.scrollTop).toBeGreaterThanOrEqual(600)
      // The history is above, reachable by scrolling up.
      thread.scrollTop = 0
      fireEvent.scroll(thread)
      expect(screen.getAllByTestId('lab-ask-turn-assistant')).toHaveLength(3)
    } finally {
      if (client) Object.defineProperty(HTMLElement.prototype, 'clientHeight', client)
      if (scroll) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scroll)
    }
  })

  it('the PDF reader opens the same way: a spacer of one screen after the history, cleared by the next question', () => {
    const reader = readFileSync(resolve(__dirname, '../../public/lab/addbook/js/reader.js'), 'utf8')
    expect(reader).toMatch(/chat\.fresh = !opts\.prompt && !opts\.explanation/)
    // The same spacer is the room under a held question once one is asked (sized by fitSpacer).
    expect(reader).toMatch(/if \(\(chat\.fresh \|\| chat\.anchor != null\) && turns\.length\) \{[^}]*space\.style\.height = \(chat\.fresh \? thread\.clientHeight : 0\) \+ 'px'/)
    expect(reader.match(/chat\.fresh = false;/g)?.length).toBeGreaterThanOrEqual(2)
  })
})

describe('quoted passage', () => {
  it('sits above the bubble, cut at 240 characters, and a tap shows the passage on the page', () => {
    const onQuote = vi.fn()
    const long = 'A sentence of the book. '.repeat(20)
    render(pane({ onQuote, turns: [turn('q', 'user', 'Why?', DAY2, 2, { highlightedText: long, paragraphIndex: 7 })] }))
    const quote = screen.getByTestId('lab-ask-history-passage')
    expect(quote.nextElementSibling?.className).toBe('tc-bubble')
    expect(quote.textContent!.length).toBeLessThanOrEqual(240)
    expect(quote.textContent!.endsWith('…')).toBe(true)
    fireEvent.click(quote)
    expect(onQuote).not.toHaveBeenCalled()
    expect(quote.tagName).toBe('DIV')
  })
})

describe('no header, no labels, no empty-state copy', () => {
  it('has "Back to book" (not a faint ×), the collapse tab, and nothing else above the thread', () => {
    const onDone = vi.fn()
    render(pane({ desktopCompanion: 'chat', onDone }))
    expect(document.querySelector('.lab-desktop-companion-head')).toBeNull()
    expect(screen.queryByText('Chat')).toBeNull()
    expect(screen.queryByText('You')).toBeNull()
    expect(screen.queryByText('Tinct')).toBeNull()
    expect(screen.getByRole('button', { name: 'Minimize chat' }).className).toBe('tc-tab')
    const back = screen.getByTestId('lab-desktop-companion-close')
    expect(back).toBe(screen.getByRole('button', { name: 'Back to book' }))
    expect(back.className).toBe('tc-back')
    // Pressed, never dragged: it sits where the box's drag strip begins.
    expect(back.hasAttribute('data-reader-window-control')).toBe(true)
    expect(document.querySelector('.tc-close')).toBeNull()
    fireEvent.click(back)
    expect(onDone).toHaveBeenCalledOnce()
  })
  it('an empty thread is a caret: no welcome line, suggestions or placeholder', () => {
    render(pane({ turns: [] }))
    const pane_ = screen.getByTestId('lab-ask-pane')
    expect(screen.getByTestId('lab-ask-thread').textContent).toBe('')
    expect((screen.getByTestId('lab-ask-input') as HTMLTextAreaElement).placeholder).toBe('')
    expect(pane_.querySelector('.tc-field.is-empty')).toBeTruthy()
    expect(pane_.textContent).not.toMatch(/Ask about|Suggested|Welcome|reply is on the way/)
  })
  it('shows a notice as a quiet status line in the thread, not a box', () => {
    render(pane({ notice: 'Kept on this device only: it could not be saved to your account. It will be saved the next time you open it.' }))
    const notice = screen.getByTestId('lab-ask-notice')
    expect(notice.className).toBe('tc-status')
    expect(notice.textContent).toContain('Kept on this device only')
    expect(notice.getAttribute('style')).toBeNull()
  })
  it('renders no monospace, uppercase or accent colour inline either', () => {
    render(pane())
    const html = screen.getByTestId('lab-ask-pane').outerHTML
    expect(html).not.toMatch(/monospace|uppercase|1f4a5c|lab-ask-user-label|lab-ask-reply-label|lab-ask-meta/i)
  })
})

describe('composer', () => {
  // Anders, 22 Oct 2026: no keyboard hint under the composer ("we should delete that").
  it('↑ in an empty composer recalls the last question; Return sends; no keyboard hint under the composer', () => {
    const onDraftChange = vi.fn()
    render(pane({ onDraftChange, desktopCompanion: 'chat' }))
    expect(screen.queryByTestId('lab-ask-hint')).toBeNull()
    expect(document.body.textContent).not.toContain(HINT_TEXT)
    fireEvent.keyDown(screen.getByTestId('lab-ask-input'), { key: 'ArrowUp' })
    expect(onDraftChange).toHaveBeenCalledWith('Why “up with the lark”?')
  })
  it('mic and Talk are bare marks until there is text; then the send arrow replaces them', () => {
    const { rerender } = render(pane())
    expect(screen.getByTestId('lab-ask-mic')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-voice')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-send').hidden).toBe(true)
    rerender(pane({ draft: 'Is Mr. Ramsay cruel?' }))
    expect(screen.queryByTestId('lab-ask-mic')).toBeNull()
    expect(screen.queryByTestId('lab-ask-voice')).toBeNull()
    expect(screen.getByTestId('lab-ask-send').hidden).toBe(false)
  })
})

describe('one component in both readers', () => {
  it('the React thread and the PDF reader’s markup (threadHtml) are the same elements in the same order', () => {
    render(pane())
    const shape = (root: Element) => Array.from(root.querySelectorAll('.tc-divider, .tc-turn, .tc-quote, .tc-bubble, .tc-answer, .tc-acts'))
      .map(node => `${node.className.split(' ').filter(c => c.startsWith('tc-') || c === 'is-kept' || c === 'has-quote' || c === 'is-streaming').join('.')}`)
    const react = shape(screen.getByTestId('lab-ask-thread'))
    const host = document.createElement('div')
    host.innerHTML = threadHtml(twoChaptersTwoDays.map(t => ({
      role: t.role, text: t.content, at: t.timestamp, place: LABELS[t.chapterNumber as 1 | 2], quote: t.highlightedText,
    })))
    expect(shape(host)).toEqual(react)
  })
})
