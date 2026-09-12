// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LAB_ASK_LOAD_MORE_PX, LAB_ASK_MAX_COMPOSER_PX, LAB_ASK_WINDOW, LabAskPane } from './LabAskPane'
import type { LabConversationState } from './labAsk'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function pane(
  state: LabConversationState,
  onMic = vi.fn(),
  onVoiceMode = vi.fn(),
  onDone?: () => void,
) {
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
      onDone={onDone}
      phoneSheet={!!onDone}
    />
  )
}

describe('lab ask living circle', () => {
  it('puts listening and speaking only on the filled circle', () => {
    const { rerender } = render(pane('listening'))
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-listening')
    expect(screen.getByTestId('lab-ask-voice-status').textContent).toBe('Listening')
    expect(screen.getByTestId('lab-ask-voice-status').getAttribute('data-voice-phase')).toBe('listening')
    expect(document.querySelectorAll('.lab-ask-voice-status-glyph i')).toHaveLength(3)
    expect(screen.getByTestId('lab-ask-voice').textContent).not.toContain('Listening')
    expect(screen.getByTestId('lab-ask-mic').className).not.toMatch(/is-listening|is-speaking|is-connecting/)

    rerender(pane('speaking'))
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-speaking')
    expect(screen.getByTestId('lab-ask-voice-status').textContent).toContain('Speaking')
    expect(screen.getByTestId('lab-ask-voice').textContent).not.toContain('Speaking')
    expect(screen.getByTestId('lab-ask-mic').className).not.toMatch(/is-listening|is-speaking|is-connecting/)

    rerender(pane('thinking'))
    expect(screen.getByTestId('lab-ask-voice-status').textContent).toBe('Thinking')
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-thinking')

    rerender(pane('idle'))
    expect(screen.queryByTestId('lab-ask-voice-status')).toBeNull()
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

describe('lab ask phone done', () => {
  it('shows Done only when onDone is provided and calls it', () => {
    const onDone = vi.fn()
    const { rerender } = render(pane('idle'))
    expect(screen.queryByTestId('lab-ask-done')).toBeNull()
    rerender(pane('idle', vi.fn(), vi.fn(), onDone))
    fireEvent.click(screen.getByTestId('lab-ask-done'))
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Ask about this page.')).toBeTruthy()
  })
})

describe('lab ask typed send', () => {
  it('keeps Send visible and submits on send and enter', () => {
    const onSubmit = vi.fn()
    const onDraftChange = vi.fn()
    render(
      <LabAskPane
        conversationState="idle"
        voiceActive={false}
        typedLoading={false}
        turns={[]}
        draft="Who is Calypso?"
        onDraftChange={onDraftChange}
        onSubmit={onSubmit}
        onMic={() => { /* unused */ }}
        onVoiceMode={() => { /* unused */ }}
        phoneSheet
      />,
    )
    expect(screen.getByTestId('lab-ask-send').textContent).toBe('Send')
    const send = screen.getByTestId('lab-ask-send')
    expect(fireEvent.pointerDown(send)).toBe(false)
    fireEvent.click(send)
    expect(onSubmit).toHaveBeenCalledWith('Who is Calypso?')
    fireEvent.keyDown(screen.getByPlaceholderText('Ask'), { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('shows Send even when the box is empty', () => {
    render(pane('idle'))
    expect(screen.getByTestId('lab-ask-send')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-send').textContent).toBe('Send')
  })
})

describe('lab ask phone listen', () => {
  it('does not add a Listen control on the phone sheet', () => {
    render(pane('idle', vi.fn(), vi.fn(), vi.fn()))
    expect(screen.queryByTestId('lab-phone-listen')).toBeNull()
    expect(screen.getByTestId('lab-ask-composer')).toBeTruthy()
    expect(screen.getByPlaceholderText('Ask')).toBeTruthy()
  })
})

describe('lab ask thread above composer', () => {
  it('renders assistant Markdown through React without enabling raw HTML', () => {
    render(
      <LabAskPane
        conversationState="idle"
        voiceActive={false}
        typedLoading={false}
        turns={[{
          id: 'a1',
          role: 'assistant',
          content: '**Heir of all things**\n\n- *First* point\n- `Second` point\n\n<script>bad()</script>',
          source: 'typed',
        }]}
        draft=""
        onDraftChange={() => { /* unused */ }}
        onSubmit={() => { /* unused */ }}
        onMic={() => { /* unused */ }}
        onVoiceMode={() => { /* unused */ }}
      />,
    )

    const reply = screen.getByTestId('lab-ask-turn-assistant')
    expect(reply.querySelector('strong')?.textContent).toBe('Heir of all things')
    expect(reply.querySelector('em')?.textContent).toBe('First')
    expect(reply.querySelector('code')?.textContent).toBe('Second')
    expect(reply.querySelectorAll('li')).toHaveLength(2)
    expect(reply.textContent).not.toContain('**')
    expect(reply.querySelector('script')).toBeNull()
    expect(reply.textContent).toContain('<script>bad()</script>')
  })

  it('keeps Talk chrome in flow so the last assistant turn sits above Ask', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toMatch(/\.lab-ask-thread\s*\{[^}]*padding-bottom:\s*1\.75rem/)
    expect(css).toMatch(/\.lab-ask\.is-phone-sheet \.lab-ask-thread[^{]*\{[^}]*overflow-y:\s*auto/)
    expect(css).toMatch(/\.lab-ask\.is-phone-sheet \.lab-ask-chrome[^{]*\{[^}]*position:\s*static/)
    expect(css).not.toMatch(/\.lab-ask\.is-phone-sheet \.lab-ask-chrome[^{]*\{[^}]*position:\s*absolute/)
    expect(css).not.toMatch(/--lab-ask-chrome-inset/)
    expect(css).not.toMatch(/\.lab-ask\.is-phone-sheet \.lab-ask-thread[^{]*\{[^}]*5\.5rem/)

    const turns = [
      { id: 'u1', role: 'user' as const, content: 'Who is Calypso?', source: 'voice' as const },
      { id: 'a1', role: 'assistant' as const, content: 'Calypso keeps Odysseus on Ogygia.', source: 'voice' as const },
    ]
    render(
      <LabAskPane
        conversationState="idle"
        voiceActive={false}
        typedLoading={false}
        turns={turns}
        draft=""
        onDraftChange={() => { /* unused */ }}
        onSubmit={() => { /* unused */ }}
        onMic={() => { /* unused */ }}
        onVoiceMode={() => { /* unused */ }}
        phoneSheet
      />,
    )
    const thread = screen.getByTestId('lab-ask-thread')
    const last = screen.getByTestId('lab-ask-turn-assistant')
    const composer = screen.getByTestId('lab-ask-composer')
    const chrome = screen.getByTestId('lab-ask-chrome')
    const pane = screen.getByTestId('lab-ask-pane')
    expect(thread.contains(last)).toBe(true)
    expect(thread.contains(composer)).toBe(false)
    expect(chrome.contains(composer)).toBe(true)
    expect(screen.queryByTestId('lab-phone-listen')).toBeNull()
    expect(last.compareDocumentPosition(composer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(pane.style.getPropertyValue('--lab-ask-chrome-inset')).toBe('')
  })

  it('renders every user turn in order so the first line is not a stuck headline', () => {
    render(
      <LabAskPane
        conversationState="idle"
        voiceActive={false}
        typedLoading={false}
        turns={[
          { id: 'u1', role: 'user', content: 'Hey, how are you?', source: 'voice' },
          { id: 'a1', role: 'assistant', content: 'Ooh, that sounds like a great plan. We are still on Odyssey Book 1.', source: 'voice' },
          { id: 'u2', role: 'user', content: "I'm thinking about reading the Bible", source: 'voice' },
        ]}
        draft=""
        onDraftChange={() => { /* unused */ }}
        onSubmit={() => { /* unused */ }}
        onMic={() => { /* unused */ }}
        onVoiceMode={() => { /* unused */ }}
      />,
    )
    const users = screen.getAllByTestId('lab-ask-turn-user')
    expect(users).toHaveLength(2)
    expect(users[0].textContent).toContain('Hey, how are you?')
    expect(users[1].textContent).toContain('thinking about reading the Bible')
    expect(screen.getByTestId('lab-ask-turn-assistant').textContent).toContain('still on Odyssey Book 1')
    expect(document.querySelector('.lab-passage-headline')).toBeNull()
  })

  it('keeps chapter context with the historical turns that created it', () => {
    render(
      <LabAskPane
        conversationState="idle"
        voiceActive={false}
        typedLoading={false}
        turns={[
          { id: 'u1', role: 'user', content: 'What happens here?', source: 'typed', chapterNumber: 1 },
          { id: 'a1', role: 'assistant', content: 'Light is created.', source: 'typed', chapterNumber: 1 },
          { id: 'u2', role: 'user', content: 'And here?', source: 'typed', chapterNumber: 2 },
        ]}
        chapterLabels={{ 1: 'Genesis 1', 2: 'Genesis 2' }}
        draft=""
        onDraftChange={() => { /* unused */ }}
        onSubmit={() => { /* unused */ }}
        onMic={() => { /* unused */ }}
        onVoiceMode={() => { /* unused */ }}
      />,
    )

    expect(screen.getAllByTestId('lab-ask-location').map(node => node.textContent)).toEqual([
      'Genesis 1',
      'Genesis 2',
    ])
  })

  it('hands the composer input to the host so a tap can focus it', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(
      <LabAskPane
        conversationState="idle"
        voiceActive={false}
        typedLoading={false}
        turns={[]}
        draft=""
        onDraftChange={vi.fn()}
        onSubmit={vi.fn()}
        onMic={vi.fn()}
        onVoiceMode={vi.fn()}
        phoneSheet
        inputRef={ref}
      />,
    )
    expect(ref.current).toBe(screen.getByTestId('lab-ask-input'))
    ref.current?.focus({ preventScroll: true })
    expect(document.activeElement).toBe(screen.getByTestId('lab-ask-input'))
  })

  it('does not pull the thread while the same assistant reply streams', () => {
    const props = {
      conversationState: 'idle' as const,
      voiceActive: false,
      typedLoading: true,
      draft: '',
      onDraftChange: () => { /* unused */ },
      onSubmit: () => { /* unused */ },
      onMic: () => { /* unused */ },
      onVoiceMode: () => { /* unused */ },
    }
    const { rerender } = render(<LabAskPane {...props} turns={[
      { id: 'u1', role: 'user', content: 'Why?', source: 'typed' },
      { id: 'a1', role: 'assistant', content: 'Because', source: 'typed' },
    ]} />)
    const thread = screen.getByTestId('lab-ask-thread')
    Object.defineProperty(thread, 'scrollHeight', { configurable: true, value: 900 })
    thread.scrollTop = 125

    rerender(<LabAskPane {...props} turns={[
      { id: 'u1', role: 'user', content: 'Why?', source: 'typed' },
      { id: 'a1', role: 'assistant', content: 'Because this reply is still arriving.', source: 'typed' },
    ]} />)

    expect(thread.scrollTop).toBe(125)

    rerender(<LabAskPane {...props} turns={[
      { id: 'u1', role: 'user', content: 'Why?', source: 'typed' },
      { id: 'a1', role: 'assistant', content: 'Because this reply is still arriving.', source: 'typed' },
      { id: 'u2', role: 'user', content: 'What next?', source: 'typed' },
    ]} />)
    expect(thread.scrollTop).toBe(900)
  })
})

describe('lab ask thread opens at the newest message', () => {
  // perTurn > 0 derives scrollHeight from the rendered turns, so the thread
  // grows when older turns are prepended (windowing tests).
  const metrics = { scrollHeight: 0, clientHeight: 300, perTurn: 0 }
  const scrollHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
  const clientHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
  const isThread = (node: HTMLElement) => node.getAttribute('data-testid') === 'lab-ask-thread'

  beforeEach(() => {
    metrics.scrollHeight = 2000
    metrics.perTurn = 0
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get(this: HTMLElement) {
        if (!isThread(this)) return 0
        return metrics.perTurn > 0 ? this.querySelectorAll('.lab-ask-turn').length * metrics.perTurn : metrics.scrollHeight
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get(this: HTMLElement) { return isThread(this) ? metrics.clientHeight : 0 },
    })
  })

  afterEach(() => {
    if (scrollHeightDescriptor) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scrollHeightDescriptor)
    if (clientHeightDescriptor) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeightDescriptor)
  })

  const history = (count: number, extra: Array<{ id: string; role: 'user' | 'assistant'; content: string }> = []) => [
    ...Array.from({ length: count }, (_, i) => ({
      id: `t${i}`,
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Turn ${i} of a long conversation about Jeremiah.`,
      source: 'typed' as const,
    })),
    ...extra.map(turn => ({ ...turn, source: 'typed' as const })),
  ]

  const props = {
    conversationState: 'idle' as const,
    voiceActive: false,
    typedLoading: false,
    draft: '',
    onDraftChange: () => { /* unused */ },
    onSubmit: () => { /* unused */ },
    onMic: () => { /* unused */ },
    onVoiceMode: () => { /* unused */ },
    phoneSheet: true,
    onDone: () => { /* unused */ },
  }

  it('opens scrolled to the bottom with a long seeded history', () => {
    render(<LabAskPane {...props} turns={history(40)} />)
    const thread = screen.getByTestId('lab-ask-thread')
    expect(thread.scrollTop).toBe(2000)
  })

  it('renders only the newest window of a long history and reveals older turns on scroll-to-top, keeping the line in place', () => {
    metrics.perTurn = 50
    const turns = history(120)
    const { rerender } = render(<LabAskPane {...props} turns={turns} />)
    const thread = screen.getByTestId('lab-ask-thread')
    expect(LAB_ASK_WINDOW).toBe(40)
    expect(document.querySelectorAll('.lab-ask-turn')).toHaveLength(40)
    expect(screen.getAllByTestId('lab-ask-turn-user')[0].textContent).toContain('Turn 80 ')
    expect(thread.getAttribute('data-hidden-turns')).toBe('80')
    expect(screen.getByTestId('lab-ask-older').textContent).toBe('80 earlier messages')
    expect(thread.scrollTop).toBe(2000)

    // Reading upward: near the top, the next 40 are prepended and the
    // reader's line stays where it was (scrollTop grows by the added height).
    thread.scrollTop = LAB_ASK_LOAD_MORE_PX - 20
    fireEvent.scroll(thread)
    expect(document.querySelectorAll('.lab-ask-turn')).toHaveLength(80)
    expect(screen.getAllByTestId('lab-ask-turn-user')[0].textContent).toContain('Turn 40 ')
    expect(thread.getAttribute('data-hidden-turns')).toBe('40')
    expect(thread.scrollTop).toBe(LAB_ASK_LOAD_MORE_PX - 20 + 2000)

    // The button is the same reveal for readers who do not scroll.
    fireEvent.click(screen.getByTestId('lab-ask-older'))
    expect(document.querySelectorAll('.lab-ask-turn')).toHaveLength(120)
    expect(screen.queryByTestId('lab-ask-older')).toBeNull()
    expect(thread.getAttribute('data-hidden-turns')).toBe('0')

    // A new reply appends without re-hiding what was revealed.
    rerender(<LabAskPane {...props} turns={history(120, [{ id: 'a-new', role: 'assistant', content: 'A fresh reply.' }])} />)
    expect(document.querySelectorAll('.lab-ask-turn')).toHaveLength(121)
  })

  it('resets the window to the newest messages when a different history opens', () => {
    const { rerender } = render(<LabAskPane {...props} turns={history(120)} />)
    fireEvent.click(screen.getByTestId('lab-ask-older'))
    expect(document.querySelectorAll('.lab-ask-turn')).toHaveLength(80)
    // Ends on the reader's own question, so the thread pins to the bottom.
    const other = Array.from({ length: 91 }, (_, i) => ({
      id: `o${i}`,
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Other book turn ${i}.`,
      source: 'typed' as const,
    }))
    rerender(<LabAskPane {...props} turns={other} />)
    expect(document.querySelectorAll('.lab-ask-turn')).toHaveLength(40)
    expect(screen.getByTestId('lab-ask-older').textContent).toBe('51 earlier messages')
    expect(screen.getByTestId('lab-ask-thread').scrollTop).toBe(2000)
  })

  it('shows the chapter label for the first visible turn of a window', () => {
    const turns = history(120).map((turn, i) => ({ ...turn, chapterNumber: i < 100 ? 3 : 4 }))
    render(<LabAskPane {...props} turns={turns} chapterLabels={{ 3: 'Genesis 3', 4: 'Genesis 4' }} />)
    expect(screen.getAllByTestId('lab-ask-location').map(node => node.textContent)).toEqual(['Genesis 3', 'Genesis 4'])
  })

  it('follows a new assistant message while the reader is at the bottom', () => {
    const { rerender } = render(<LabAskPane {...props} turns={history(40)} />)
    const thread = screen.getByTestId('lab-ask-thread')
    expect(thread.scrollTop).toBe(2000)
    metrics.scrollHeight = 2400
    rerender(<LabAskPane {...props} turns={history(40, [{ id: 'a-new', role: 'assistant', content: 'In chapter 32, Jeremiah bought a field.' }])} />)
    expect(thread.scrollTop).toBe(2400)
    // Within LAB_ASK_FOLLOW_PX of the bottom still counts as at the bottom.
    thread.scrollTop = 2400 - 300 - 40
    fireEvent.scroll(thread)
    metrics.scrollHeight = 2600
    rerender(<LabAskPane {...props} turns={history(40, [
      { id: 'a-new', role: 'assistant', content: 'In chapter 32, Jeremiah bought a field.' },
      { id: 'a-new-2', role: 'assistant', content: 'Then in chapter 37 Zedekiah moved him.' },
    ])} />)
    expect(thread.scrollTop).toBe(2600)
  })

  it('does not yank a reader who scrolled up to read older messages', () => {
    const { rerender } = render(<LabAskPane {...props} turns={history(40)} />)
    const thread = screen.getByTestId('lab-ask-thread')
    thread.scrollTop = 120
    fireEvent.scroll(thread)
    metrics.scrollHeight = 2400
    rerender(<LabAskPane {...props} turns={history(40, [{ id: 'a-new', role: 'assistant', content: 'A message arriving while they read.' }])} />)
    expect(thread.scrollTop).toBe(120)
    // Their own new question still brings them to it.
    metrics.scrollHeight = 2500
    rerender(<LabAskPane {...props} turns={history(40, [
      { id: 'a-new', role: 'assistant', content: 'A message arriving while they read.' },
      { id: 'u-new', role: 'user', content: 'And then?' },
    ])} />)
    expect(thread.scrollTop).toBe(2500)
  })
})

describe('lab ask thread shows the answer begin', () => {
  const metrics = { scrollHeight: 0, clientHeight: 300 }
  const descriptors = {
    scrollHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight'),
    clientHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight'),
    rect: HTMLElement.prototype.getBoundingClientRect,
  }
  const isThread = (node: HTMLElement) => node.getAttribute('data-testid') === 'lab-ask-thread'
  const TURN_HEIGHT = 100

  beforeEach(() => {
    metrics.scrollHeight = 4000
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get(this: HTMLElement) { return isThread(this) ? metrics.scrollHeight : 0 } })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get(this: HTMLElement) { return isThread(this) ? metrics.clientHeight : 0 } })
    // Each turn is TURN_HEIGHT tall, stacked from the top of the thread.
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      const thread = this.closest('[data-testid="lab-ask-thread"]') as HTMLElement | null
      let top = 0
      if (isThread(this)) top = 0
      else if (thread && this.classList.contains('lab-ask-turn')) {
        const turnsBefore = Array.from(thread.querySelectorAll('.lab-ask-turn')).indexOf(this)
        top = turnsBefore * TURN_HEIGHT - thread.scrollTop
      }
      return { top, bottom: top + TURN_HEIGHT, left: 0, right: 0, width: 0, height: TURN_HEIGHT, x: 0, y: top, toJSON: () => ({}) } as DOMRect
    }
  })

  afterEach(() => {
    if (descriptors.scrollHeight) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', descriptors.scrollHeight)
    if (descriptors.clientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', descriptors.clientHeight)
    HTMLElement.prototype.getBoundingClientRect = descriptors.rect
  })

  const turnsOf = (count: number) => Array.from({ length: count }, (_, i) => ({
    id: `t${i}`,
    role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
    content: `Turn ${i}.`,
    source: 'typed' as const,
  }))

  const props = {
    conversationState: 'idle' as const,
    voiceActive: false,
    draft: '',
    onDraftChange: () => { /* unused */ },
    onSubmit: () => { /* unused */ },
    onMic: () => { /* unused */ },
    onVoiceMode: () => { /* unused */ },
    phoneSheet: true,
    onDone: () => { /* unused */ },
  }

  it('scrolls the first line of a new reply near the top, then follows only while its end is within reach', () => {
    const history = turnsOf(40)
    const { rerender } = render(<LabAskPane {...props} typedLoading={false} turns={history} />)
    const thread = screen.getByTestId('lab-ask-thread')
    expect(thread.scrollTop).toBe(4000)
    // The reader asks; the thread follows their own question.
    const asked = [...history, { id: 'u-ask', role: 'user' as const, content: 'How did Jeremiah get out of prison?', source: 'typed' as const }]
    metrics.scrollHeight = 4100
    rerender(<LabAskPane {...props} typedLoading turns={asked} />)
    expect(thread.scrollTop).toBe(4100)
    // The reply begins: its first line is pinned near the top of the viewport (turn index 41).
    const replying = [...asked, { id: 'a-reply', role: 'assistant' as const, content: 'In chapter 32', source: 'typed' as const }]
    metrics.scrollHeight = 4200
    rerender(<LabAskPane {...props} typedLoading turns={replying} />)
    expect(thread.scrollTop).toBe(41 * TURN_HEIGHT - 8)
    // Room below the reply so its first line can hold the top of the viewport while it is short.
    expect(screen.getByTestId('lab-ask-thread-spacer').style.height).toBe(`${300 - TURN_HEIGHT - 8}px`)
    // Streaming continues under a held first line: the text fills downward, the top does not move.
    metrics.scrollHeight = 4300
    rerender(<LabAskPane {...props} typedLoading turns={[...asked, { ...replying[replying.length - 1], content: 'In chapter 32, Jeremiah bought a field while in the court of the prison.' }]} />)
    expect(thread.scrollTop).toBe(41 * TURN_HEIGHT - 8)
    // A long reply grows past the viewport: the reader keeps reading from where they are.
    thread.scrollTop = 3500
    fireEvent.scroll(thread)
    metrics.scrollHeight = 5000
    rerender(<LabAskPane {...props} typedLoading turns={[...asked, { ...replying[replying.length - 1], content: 'A much longer reply. '.repeat(40) }]} />)
    expect(thread.scrollTop).toBe(3500)
    // The next question clears the room and follows the reader's own message again.
    metrics.scrollHeight = 5100
    rerender(<LabAskPane {...props} typedLoading turns={[...asked, replying[replying.length - 1], { id: 'u-next', role: 'user' as const, content: 'And then?', source: 'typed' as const }]} />)
    expect(screen.getByTestId('lab-ask-thread-spacer').style.height).toBe('0px')
    expect(thread.scrollTop).toBe(5100)
  })
})

it('shows stored dates in V2 and keeps older messages accessible', () => {
  const onDone = vi.fn()
  const turns = Array.from({ length: 45 }, (_, index) => ({ id: `dated-${index}`, role: 'user' as const, content: `Saved question ${index}`, source: 'typed' as const, timestamp: Date.UTC(2026, 8, 1, 9, index) }))
  render(<LabAskPane chromeV2 conversationState="idle" voiceActive={false} typedLoading={false} turns={turns} draft="" onDraftChange={vi.fn()} onSubmit={vi.fn()} onMic={vi.fn()} onVoiceMode={vi.fn()} onDone={onDone} phoneSheet />)
  expect(document.querySelector('time')?.getAttribute('datetime')).toBe(new Date(turns[5].timestamp).toISOString())
  fireEvent.click(screen.getByTestId('lab-ask-older'))
  expect(screen.getByText('Saved question 0')).toBeTruthy()
  expect(document.querySelectorAll('time')).toHaveLength(45)
  fireEvent.click(screen.getByText('← Back to book'))
  expect(onDone).toHaveBeenCalledOnce()
})

it('reveals the requested old conversation beyond the initial history window', () => {
  const turns = Array.from({ length: 60 }, (_, index) => ({ id: `selected-${index}`, role: 'user' as const, content: `History question ${index}`, source: 'typed' as const }))
  render(<LabAskPane chromeV2 focusTurnId="selected-2" conversationState="idle" voiceActive={false} typedLoading={false} turns={turns} draft="" onDraftChange={vi.fn()} onSubmit={vi.fn()} onMic={vi.fn()} onVoiceMode={vi.fn()} phoneSheet />)
  expect(screen.getByText('History question 2')).toBeTruthy()
  expect(document.querySelector('[data-turn-id="selected-2"]')).toBeTruthy()
})

describe('V2 multiline composer and copying', () => {
  const base = {
    chromeV2: true, conversationState: 'idle' as const, voiceActive: false,
    typedLoading: false, turns: [], onDraftChange: vi.fn(), onSubmit: vi.fn(),
    onMic: vi.fn(), onVoiceMode: vi.fn(), phoneSheet: true,
  }
  it('dismisses the mobile keyboard when sending a question', () => {
    const onSubmit = vi.fn(), onKeyboardOpenChange = vi.fn()
    render(<LabAskPane {...base} draft="Why?" onSubmit={onSubmit} onKeyboardOpenChange={onKeyboardOpenChange} />)
    const field = screen.getByTestId('lab-ask-input')
    field.focus()
    expect(document.activeElement).toBe(field)
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    expect(document.activeElement).not.toBe(field)
    expect(onKeyboardOpenChange).toHaveBeenLastCalledWith(false)
    expect(onSubmit).toHaveBeenCalledWith('Why?')
  })
  it('grows the writing area, swaps voice for send, and uses Enter for a new line', () => {
    const onSubmit = vi.fn()
    const { rerender } = render(<LabAskPane {...base} draft="" onSubmit={onSubmit} />)
    const field = screen.getByTestId('lab-ask-input') as HTMLTextAreaElement
    expect(field.tagName).toBe('TEXTAREA')
    expect(screen.getByTestId('lab-ask-send').hidden).toBe(true)
    Object.defineProperty(field, 'scrollHeight', { configurable: true, value: 120 })
    rerender(<LabAskPane {...base} draft={'First line\nSecond line'} onSubmit={onSubmit} />)
    expect(field.style.height).toBe('120px')
    expect(screen.queryByTestId('lab-ask-voice')).toBeNull()
    expect(screen.getByTestId('lab-ask-send').hidden).toBe(false)
    expect(fireEvent.keyDown(field, { key: 'Enter' })).toBe(true)
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.keyDown(field, { key: 'Enter', ctrlKey: true })
    expect(onSubmit).toHaveBeenCalledWith('First line\nSecond line')
    Object.defineProperty(field, 'scrollHeight', { configurable: true, value: 800 })
    rerender(<LabAskPane {...base} draft={'Long question\n'.repeat(30)} />)
    expect(field.style.height).toBe('180px')
  })
  it('copies the complete question and answer without speaker labels', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<LabAskPane {...base} draft="" turns={[
      { id: 'copy-q', role: 'user', content: 'What does this mean?\nSecond line.', source: 'typed' },
      { id: 'copy-a', role: 'assistant', content: 'It means **this**.', source: 'typed' },
    ]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy question' }))
    expect(writeText).toHaveBeenLastCalledWith('What does this mean?\nSecond line.')
    await screen.findByRole('button', { name: 'Copied' })
    fireEvent.click(screen.getByRole('button', { name: 'Copy answer' }))
    expect(writeText).toHaveBeenLastCalledWith('It means **this**.')
    await screen.findByRole('button', { name: 'Copy question' })
  })
})

describe('chat dictation control', () => {
  it('shows a stop square while starting and listening, then restores the microphone', () => {
    const onMic = vi.fn()
    const props = {
      chromeV2: true, conversationState: 'idle' as const, voiceActive: false,
      typedLoading: false, turns: [], draft: '', onDraftChange: vi.fn(),
      onSubmit: vi.fn(), onMic, onVoiceMode: vi.fn(),
    }
    const { rerender } = render(<LabAskPane {...props} dictationState="idle" />)
    expect(screen.getByRole('button', { name: 'Dictate a question' }).querySelector('path')).toBeTruthy()
    for (const dictationState of ['starting', 'listening'] as const) {
      rerender(<LabAskPane {...props} dictationState={dictationState} />)
      expect(screen.queryByTestId('lab-ask-voice')).toBeNull()
      const stop = screen.getByRole('button', { name: 'Stop dictation' })
      expect(stop.querySelector('rect')?.getAttribute('width')).toBe('12')
      expect(stop.querySelector('path')).toBeNull()
      fireEvent.click(stop)
    }
    expect(onMic).toHaveBeenCalledTimes(2)
    rerender(<LabAskPane {...props} dictationState="idle" draft="A dictated question" />)
    expect(screen.queryByTestId('lab-ask-voice')).toBeNull()
    rerender(<LabAskPane {...props} dictationState="idle" />)
    expect(screen.getByTestId('lab-ask-voice')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Dictate a question' }).querySelector('path')).toBeTruthy()
  })
})

describe('lab ask composer: Enter', () => {
  const base = (onSubmit: (text: string) => void, phoneSheet: boolean) => (
    <LabAskPane
      chromeV2
      conversationState="idle"
      voiceActive={false}
      typedLoading={false}
      turns={[]}
      draft="What does this passage mean?"
      onDraftChange={vi.fn()}
      onSubmit={onSubmit}
      onMic={vi.fn()}
      onVoiceMode={vi.fn()}
      phoneSheet={phoneSheet}
    />
  )

  it('sends on a plain Enter on the desktop', () => {
    const onSubmit = vi.fn()
    render(base(onSubmit, false))
    const notDefaulted = fireEvent.keyDown(screen.getByTestId('lab-ask-input'), { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('What does this passage mean?')
    // preventDefault was called, so no newline lands in the textarea.
    expect(notDefaulted).toBe(false)
  })

  it('leaves Shift+Enter as a newline on the desktop', () => {
    const onSubmit = vi.fn()
    render(base(onSubmit, false))
    const notDefaulted = fireEvent.keyDown(screen.getByTestId('lab-ask-input'), { key: 'Enter', shiftKey: true })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(notDefaulted).toBe(true)
  })

  it('still sends on Cmd+Enter on the desktop', () => {
    const onSubmit = vi.fn()
    render(base(onSubmit, false))
    fireEvent.keyDown(screen.getByTestId('lab-ask-input'), { key: 'Enter', metaKey: true })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not send on a plain Enter while an IME is composing', () => {
    const onSubmit = vi.fn()
    render(base(onSubmit, false))
    fireEvent.keyDown(screen.getByTestId('lab-ask-input'), { key: 'Enter', isComposing: true })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('leaves the phone sheet alone: Enter is a newline, Cmd+Enter sends', () => {
    const onSubmit = vi.fn()
    render(base(onSubmit, true))
    const notDefaulted = fireEvent.keyDown(screen.getByTestId('lab-ask-input'), { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(notDefaulted).toBe(true)
    fireEvent.keyDown(screen.getByTestId('lab-ask-input'), { key: 'Enter', metaKey: true })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('lab ask composer: the growing field never flashes a scrollbar', () => {
  const pane = (draft: string) => (
    <LabAskPane
      chromeV2
      conversationState="idle"
      voiceActive={false}
      typedLoading={false}
      turns={[]}
      draft={draft}
      onDraftChange={vi.fn()}
      onSubmit={vi.fn()}
      onMic={vi.fn()}
      onVoiceMode={vi.fn()}
      phoneSheet={false}
    />
  )

  /** jsdom has no layout, so scrollHeight is driven by the line count. */
  function stubScrollHeight(perLine: number) {
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get(this: HTMLTextAreaElement) {
        // A collapsed field still reports its full content height, which is
        // what makes the measurement moment overflow.
        return Math.max(1, this.value.split('\n').length) * perLine
      },
    })
  }

  afterEach(() => {
    Reflect.deleteProperty(HTMLTextAreaElement.prototype, 'scrollHeight')
  })

  it('keeps overflow hidden while the field still fits its text', () => {
    stubScrollHeight(30)
    const { rerender } = render(pane('One line'))
    const field = screen.getByTestId('lab-ask-input') as HTMLTextAreaElement
    expect(field.style.overflowY).toBe('hidden')
    expect(field.style.height).toBe('30px')

    // Every added line grows the box and still shows no scrollbar — the
    // top-right artifact the measurement used to flash.
    for (const lines of [2, 3, 4, 5]) {
      rerender(pane(Array(lines).fill('Line').join('\n')))
      expect(field.style.overflowY).toBe('hidden')
      expect(field.style.height).toBe(`${lines * 30}px`)
    }
  })

  it('gives the scrollbar back only once the field is capped and really clips', () => {
    stubScrollHeight(30)
    const { rerender } = render(pane(Array(6).fill('Line').join('\n')))
    const field = screen.getByTestId('lab-ask-input') as HTMLTextAreaElement
    expect(field.style.height).toBe(`${LAB_ASK_MAX_COMPOSER_PX}px`)
    expect(field.style.overflowY).toBe('hidden')

    rerender(pane(Array(7).fill('Line').join('\n')))
    expect(field.style.height).toBe(`${LAB_ASK_MAX_COMPOSER_PX}px`)
    expect(field.style.overflowY).toBe('auto')

    // Shrinking back under the cap puts it away again.
    rerender(pane('One line'))
    expect(field.style.overflowY).toBe('hidden')
  })
})

describe('lab ask thread and the account history that arrives late', () => {
  const metrics = { scrollHeight: 0, clientHeight: 300 }
  const scrollHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
  const clientHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
  const isThread = (node: HTMLElement) => node.getAttribute('data-testid') === 'lab-ask-thread'

  beforeEach(() => {
    metrics.scrollHeight = 2000
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get(this: HTMLElement) { return isThread(this) ? metrics.scrollHeight : 0 },
    })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get(this: HTMLElement) { return isThread(this) ? metrics.clientHeight : 0 },
    })
  })

  afterEach(() => {
    if (scrollHeightDescriptor) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scrollHeightDescriptor)
    if (clientHeightDescriptor) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeightDescriptor)
  })

  const props = {
    conversationState: 'idle' as const,
    voiceActive: false,
    typedLoading: false,
    draft: '',
    onDraftChange: () => { /* unused */ },
    onSubmit: () => { /* unused */ },
    onMic: () => { /* unused */ },
    onVoiceMode: () => { /* unused */ },
    phoneSheet: true,
    onDone: () => { /* unused */ },
  }

  const MAY = Date.parse('2026-05-25T10:00:00Z')
  const stale = [
    { id: 'may-u', role: 'user' as const, content: 'Hvorfor taler Jesus om skilsmisse i vers 32?', source: 'typed' as const, timestamp: MAY, chapterNumber: 930 },
    { id: 'may-a', role: 'assistant' as const, content: 'Fordi Bjergpraedikenen skaerper loven.', source: 'typed' as const, timestamp: MAY + 1000, chapterNumber: 930 },
  ]
  const today = Date.now()
  const reconciled = [
    ...stale,
    { id: 'now-u', role: 'user' as const, content: 'who was it that conquered the babylonnians?', source: 'typed' as const, timestamp: today, chapterNumber: 774 },
    { id: 'now-a', role: 'assistant' as const, content: 'Cyrus of Persia took Babylon in 539 BC.', source: 'typed' as const, timestamp: today + 1000, chapterNumber: 774 },
  ]

  it('says the thread is still being checked against the account while the cloud row is in flight', () => {
    render(<LabAskPane {...props} turns={stale} historyStatus="loading" />)
    expect(screen.getByTestId('lab-ask-syncing')).toBeTruthy()
    // An empty device copy must not greet the reader as if they had no history.
    cleanup()
    render(<LabAskPane {...props} turns={[]} historyStatus="loading" />)
    expect(screen.getByText('Loading your saved conversations…')).toBeTruthy()
  })

  it('drops the notice and shows the newest turn once the account history lands', () => {
    const { rerender } = render(<LabAskPane {...props} turns={stale} historyStatus="loading" />)
    const thread = screen.getByTestId('lab-ask-thread')
    // The reader is reading the stale May conversation, scrolled up.
    thread.scrollTop = 0
    fireEvent.scroll(thread)
    metrics.scrollHeight = 4000
    rerender(<LabAskPane {...props} turns={reconciled} historyStatus="ready" />)
    expect(screen.queryByTestId('lab-ask-syncing')).toBeNull()
    // Not left parked in May: the thread ends on today's turn and is scrolled there.
    expect(thread.scrollTop).toBe(4000)
    const turnNodes = Array.from(document.querySelectorAll('.lab-ask-turn'))
    expect(turnNodes[turnNodes.length - 1].textContent).toContain('Cyrus of Persia')
  })

  it('shows the newest window, not the oldest turn, when a long account history lands', () => {
    const long = Array.from({ length: 200 }, (_, i) => ({
      id: `t${i}`,
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Turn ${i}.`,
      source: 'typed' as const,
      timestamp: MAY + i * 1000,
    }))
    const { rerender } = render(<LabAskPane {...props} turns={long.slice(0, 60)} historyStatus="loading" />)
    const thread = screen.getByTestId('lab-ask-thread')
    fireEvent.click(screen.getByTestId('lab-ask-older'))
    expect(thread.getAttribute('data-hidden-turns')).toBe('0')
    rerender(<LabAskPane {...props} turns={long} historyStatus="ready" />)
    expect(thread.getAttribute('data-hidden-turns')).toBe('160')
    // The first turn the reader sees is inside the newest window, and the last
    // turn in the DOM is the most recent one in the thread.
    const turnNodes = Array.from(document.querySelectorAll('.lab-ask-turn'))
    expect(turnNodes).toHaveLength(40)
    expect(turnNodes[0].textContent).toContain('Turn 160.')
    expect(turnNodes[turnNodes.length - 1].textContent).toContain('Turn 199.')
    expect(thread.scrollTop).toBe(metrics.scrollHeight)
  })

  it('dates a chapter divider whose turns are not from today, and marks a question that got no answer', () => {
    render(<LabAskPane {...props} turns={reconciled} chapterLabels={{ 930: 'Matthew 5', 774: 'Jeremiah 50' }} />)
    const dividers = screen.getAllByTestId('lab-ask-location').map(node => node.textContent)
    // The date's own shape follows the reader's locale; what matters is that
    // the divider carries the day the turns under it are from.
    expect(dividers[0]).toMatch(/^Matthew 5 · .*25/)
    expect(dividers[0]).toMatch(/May/)
    expect(dividers[1]).toBe('Jeremiah 50')
    expect(screen.queryByTestId('lab-ask-unanswered')).toBeNull()

    cleanup()
    render(<LabAskPane {...props} turns={reconciled.filter(turn => turn.id !== 'now-a')} />)
    expect(screen.getByTestId('lab-ask-unanswered')).toBeTruthy()
    // A reply still streaming is not a failure.
    cleanup()
    render(<LabAskPane {...props} typedLoading turns={reconciled.filter(turn => turn.id !== 'now-a')} />)
    expect(screen.queryByTestId('lab-ask-unanswered')).toBeNull()
  })
})
