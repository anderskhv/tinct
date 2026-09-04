// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

    rerender(pane('checking'))
    expect(screen.getByTestId('lab-ask-voice-status').textContent).toBe('Checking the text')
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-checking')

    rerender(pane('preparing'))
    expect(screen.getByTestId('lab-ask-voice-status').textContent).toBe('Preparing answer')
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-preparing')

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
