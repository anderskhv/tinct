// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LAB_DESKTOP_PANES, PRODUCTION_DESKTOP_PANES } from './labChrome'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'
import { followParagraphFromManifest } from './labFollow'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function sourceWithWords() {
  const base = fallbackLabSource()
  const first = followParagraphFromManifest(0, base.paragraphs[0], {
    duration: 2,
    file: 'p0.mp3',
    words: [
      { text: 'Tell', start: 0, end: 0.5 },
      { text: 'me,', start: 0.5, end: 1 },
      { text: 'O', start: 1, end: 1.4 },
      { text: 'Muse', start: 1.4, end: 2 },
    ],
  })
  return {
    ...base,
    followParagraphs: [
      first,
      ...base.paragraphs.slice(1).map((text, index) => ({
        index: index + 1,
        text,
        file: `p${index + 1}.mp3`,
        duration: 2,
      })),
    ],
  }
}

class FakeAudio {
  src = ''
  currentTime = 0
  paused = true
  preload = 'auto'
  listeners = new Map<string, Set<() => void>>()

  addEventListener(type: string, fn: () => void) {
    const set = this.listeners.get(type) ?? new Set()
    set.add(fn)
    this.listeners.set(type, set)
  }

  removeEventListener(type: string, fn: () => void) {
    this.listeners.get(type)?.delete(fn)
  }

  play() {
    this.paused = false
    return Promise.resolve()
  }

  pause() {
    this.paused = true
  }

  load() { /* jsdom audio stub */ }

  removeAttribute() {
    this.src = ''
  }

  emit(type: string) {
    for (const fn of this.listeners.get(type) ?? []) fn()
  }
}

describe('lab chrome', () => {
  it('keeps Ask as the only desktop pane', () => {
    expect(LAB_DESKTOP_PANES).toEqual(['Ask'])
    expect(PRODUCTION_DESKTOP_PANES.some(pane => LAB_DESKTOP_PANES.includes(pane as never))).toBe(false)

    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)

    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect(screen.getByTestId('lab-desktop-panes').textContent).toBe('Ask')
    expect(screen.getByTestId('lab-ask-composer')).toBeTruthy()
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
    expect(screen.getByTestId('lab-ask-pane').className).toContain('is-empty')
    expect(screen.queryByRole('heading', { name: 'Ask' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Microphone' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ask' })).toBeNull()
    expect(screen.queryByText('Ready when you are.')).toBeNull()
    expect(screen.queryByText('Ask anything')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Chat' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Feed' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cast' })).toBeNull()
    expect(document.querySelector('.card-rail')).toBeNull()
    expect(document.querySelector('.panel-tab')).toBeNull()
    expect(document.querySelector('.lab-orb')).toBeNull()
    expect(screen.getByTestId('lab-ask-voice')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Hear' })).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'Who is Calypso?' } })
    expect(screen.getByTestId('lab-ask-send')).toBeTruthy()
    expect(screen.queryByTestId('lab-ask-voice')).toBeNull()
  })

  it('locks the desktop Ask pane to the viewport instead of the chapter height', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toMatch(/\.lab\.is-desktop\s*\{[^}]*height:\s*100vh/)
    expect(css).toMatch(/\.lab\.is-desktop\s*\{[^}]*overflow:\s*hidden/)
    expect(css).toMatch(/\.lab\.is-desktop\s+\.lab-page-wrap\s*\{[^}]*overflow:\s*auto/)
    expect(css).toMatch(/\.lab\.is-desktop\s+\.lab-ask\s*\{[^}]*position:\s*sticky/)
    expect(css).toMatch(/\.lab\.is-desktop\s+\.lab-ask\s*\{[^}]*height:\s*calc\(100vh - 5\.5rem\)/)
    expect(css).toMatch(/\.lab-ask\.is-empty\s*\{[^}]*justify-content:\s*center/)
    expect(css).not.toMatch(/\.lab\.is-phone\s+\.lab-ask\s*\{/)
    expect(css).toMatch(/\.lab-ask\s*\{[^}]*background:\s*#ece7db/)
    expect(css).toMatch(/\.lab-ask\s*\{[^}]*border-left:\s*1px solid #d4cdc0/)
    expect(css).toMatch(/\.lab-ask-composer\s*\{[^}]*background:\s*#ece7db/)
    expect(css).toMatch(/\.lab-status\s*\{[^}]*font-family:\s*'IBM Plex Mono'/)
    expect(css).toMatch(/\.lab-hearing-word\.is-current\s*,?[^}]*background:\s*#d8cbb6/)
    expect(css).not.toMatch(/Helvetica/)
    expect(css).not.toMatch(/gold|#f5d76e|#ffeaa7|#ffd54f|#fff59d/i)
    expect(css).not.toMatch(/\.lab-ask\s*\{[^}]*background:\s*#faf9f6/)
    expect(css).not.toMatch(/\.lab-ask-composer\s*\{[^}]*background:\s*#fff/)

    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
    expect(screen.getByTestId('lab-root').className).toContain('is-desktop')
    expect(screen.getByTestId('lab-ask-pane').className).toContain('is-empty')
    expect(screen.getByTestId('lab-ask-composer')).toBeTruthy()
    expect(screen.getByPlaceholderText('Ask')).toBeTruthy()
  })

  it('keeps the phone orb away until a real voice session starts', async () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)

    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-phone-ask'))

    expect((await screen.findByTestId('lab-voice-notice')).textContent).toContain('Sign in')
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
    expect(screen.queryByTestId('lab-orb')).toBeNull()
    expect(screen.queryByRole('log')).toBeNull()
    expect(screen.getByTestId('lab-book').className).not.toContain('is-dimmed')
  })

  it('does not POST /api/voice-session without a signed-in token', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-ask-mic'))
    expect(await screen.findByTestId('lab-ask-notice')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByTestId('lab-ask-notice').textContent).toBe('Sign in to ask by voice.')
    expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('idle')
  })

  it('does not invent a conversation cycle when voice cannot start', async () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken={null} />)

    fireEvent.click(screen.getByTestId('lab-ask-mic'))
    expect((await screen.findByTestId('lab-ask-notice')).textContent).toContain('Sign in')
    expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('idle')
    expect(screen.queryByText('Listening.')).toBeNull()
    expect(screen.queryByText('Speaking.')).toBeNull()
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
  })

  it('pins the composer under a thread and drops the empty greeting', async () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-in-the-book'))
    fireEvent.click(screen.getByRole('tab', { name: 'People on this page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ask about this person' }))

    expect(screen.getByTestId('lab-ask-pane').className).toContain('has-thread')
    expect(document.querySelector('.lab-ask-greeting')).toBeNull()
    expect(screen.getByTestId('lab-ask-composer')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('Who is Odysseus on this page?')
    expect((await screen.findByTestId('lab-ask-notice')).textContent).toContain('Sign in')
  })

  it('marks the client document noindex', () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
    expect(document.title).toBe('Tinct lab')
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('noindex')
  })

  it('keeps Compare as a page split', () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
    fireEvent.click(screen.getByTestId('lab-compare'))
    expect(screen.getByTestId('lab-compare-col')).toBeTruthy()
    expect(screen.getByTestId('lab-book').className).toContain('is-compare')
  })

  it('sends character questions to Ask when online', async () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-in-the-book'))
    fireEvent.click(screen.getByRole('tab', { name: 'People on this page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ask about this person' }))
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('Who is Odysseus on this page?')
    expect((await screen.findByTestId('lab-ask-notice')).textContent).toContain('Sign in')
  })

  it('plays real Odyssey paragraph MP3s and follows the playing word', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))

    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('/api/audio-file')
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('odyssey')
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('p0.mp3')
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    expect(screen.queryByTestId('lab-book')).toBeNull()
    expect(screen.getByTestId('lab-hearing-current').textContent).toContain('Tell')

    audio.currentTime = 1.2
    act(() => { audio.emit('timeupdate') })
    expect(screen.getByTestId('lab-hearing-current').textContent).toContain('O')
  })

  it('keeps desktop conversation in the composer with an immediate living icon', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => new Promise(() => { /* hang so connecting stays visible */ }),
      },
    })
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken="signed-in" />)

    expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('idle')
    fireEvent.click(screen.getByTestId('lab-ask-voice'))

    expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('connecting')
    expect(screen.getByTestId('lab-status').textContent).toBe('Talking · tap the circle to stop')
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-connecting')
    expect(screen.getByTestId('lab-ask-voice').textContent).toContain('Starting')
    expect(screen.getByTestId('lab-ask-mic').className).not.toContain('is-connecting')
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
    expect(screen.queryByTestId('lab-orb')).toBeNull()
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.getByTestId('lab-book').className).not.toContain('is-dimmed')
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect(screen.queryByTestId('lab-hearing')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('idle')
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
  })

  it('sends the numbered Book 1 chapter and a spoiler rule on typed Ask', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: [{ text: 'The second paragraph is about Ulysses detained by Calypso.' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const source = fallbackLabSource()
    render(<LabApp pathname="/lab/desktop" source={source} authToken="signed-in" />)
    fireEvent.change(screen.getByPlaceholderText('Ask'), {
      target: { value: 'Read the second paragraph of Book 1.' },
    })
    fireEvent.click(screen.getByTestId('lab-ask-send'))

    expect(await screen.findByTestId('lab-ask-turn-assistant')).toBeTruthy()
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body))
    expect(body.system).toContain('[2] So now all who escaped death')
    expect(body.system).toContain('only have this chapter so far')
    expect(body.system).not.toContain('Speak for about 20')
    expect(body.system).not.toContain('resume_audiobook')
  })

  it('does not call getUserMedia until Talk starts', () => {
    const getUserMedia = vi.fn()
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: { getUserMedia },
    })
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken="signed-in" />)
    expect(getUserMedia).not.toHaveBeenCalled()
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
  })

  it('keeps Hearing as a lyrics stage and peeks the page from In the book', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))

    await waitFor(() => {
      expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    })
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.queryByTestId('lab-book')).toBeNull()
    expect(screen.getByTestId('lab-hearing-transport')).toBeTruthy()
    expect(screen.getByTestId('lab-hearing-progress')).toBeTruthy()

    fireEvent.click(screen.getByTestId('lab-in-the-book'))
    expect(screen.getByTestId('lab-book').className).toContain('is-peek')
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    expect(screen.queryByTestId('lab-hearing')).toBeNull()
  })

  it('pauses Hear when Talk starts and returns to Hearing when Talk stops', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => new Promise(() => { /* hang so connecting stays visible */ }),
      },
    })
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })

    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    expect(screen.getByTestId('lab-status').textContent).toBe('Talking · tap the circle to stop')
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.queryByTestId('lab-hearing')).toBeNull()
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    expect(screen.getByTestId('lab-book').className).not.toContain('is-dimmed')

    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
  })
})
