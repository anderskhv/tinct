// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabAskPane } from './LabAskPane'
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
