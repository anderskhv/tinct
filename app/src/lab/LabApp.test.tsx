// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LAB_DESKTOP_PANES, PRODUCTION_DESKTOP_PANES } from './labChrome'
import { LabApp } from './LabApp'
import { LabPassage } from './LabPassage'
import { hearingPages } from './labHearing'
import { LabVoiceGate } from './LabConversation'
import { bibleFallbackSource, fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { followParagraphFromManifest } from './labFollow'
import { persistLabTalkTurn } from './labTalkHistory'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  try { localStorage.removeItem('tinct-lab-prefs') } catch { /* jsdom */ }
    try { localStorage.removeItem('tinct-lab-position') } catch { /* jsdom */ }
    try { localStorage.removeItem('tinct-lab-finished-chapters') } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct:chat-history:lab') } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

function phoneProgressInfo(): string {
  return screen.getByTestId('lab-chapter-progress').querySelector('.lab-chapter-progress-info')?.textContent?.trim() || ''
}

async function waitForPhoneProgress() {
  await waitFor(async () => {
    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    })
    expect(phoneProgressInfo()).toMatch(/^\d+\s*\/\s*\d+$/)
  }, { timeout: 5000 })
}

function sourceWithWords() {
  const base = fallbackLabSource()
  const first = followParagraphFromManifest(0, base.paragraphs[0], {
    duration: 20,
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
        duration: 20,
      })),
    ],
  }
}

function sourceWithFilesNoWords() {
  const base = fallbackLabSource()
  return {
    ...base,
    followParagraphs: base.paragraphs.map((text, index) => ({
      index,
      text,
      file: `p${index}.mp3`,
      duration: 20,
    })),
  }
}

class FakeAudio {
  src = ''
  currentTime = 0
  duration = 20
  playbackRate = 1
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


function openDesktopAsk() {
  const tab = screen.queryByTestId('lab-ask-tab')
  if (tab) fireEvent.click(tab)
}

function openThisBook() {
  const gear = screen.queryByTestId('lab-gear')
  if (gear) fireEvent.click(gear)
  fireEvent.click(screen.getByTestId('lab-in-the-book'))
}

describe('lab chrome', () => {
  it('keeps Ask as the only desktop pane', () => {
    expect(LAB_DESKTOP_PANES).toEqual(['Ask'])
    expect(PRODUCTION_DESKTOP_PANES.some(pane => LAB_DESKTOP_PANES.includes(pane as never))).toBe(false)

    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)

    expect(screen.getByTestId('lab-ask-tab')).toBeTruthy()
    expect(screen.queryByTestId('lab-phone-talk')).toBeNull()
    expect(screen.queryByTestId('lab-phone-listen')).toBeNull()
    expect(screen.queryByTestId('lab-phone-bar')).toBeNull()
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    openDesktopAsk()
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
    expect(document.querySelector('.lab-ask-bubble')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Chat' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Feed' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cast' })).toBeNull()
    expect(document.querySelector('.card-rail')).toBeNull()
    expect(document.querySelector('.panel-tab')).toBeNull()
    expect(document.querySelector('.lab-orb')).toBeNull()
    expect(screen.getByTestId('lab-ask-voice')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Listen' })).toBeTruthy()
    expect(screen.getByTestId('lab-listen-play')).toBeTruthy()
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Book 1 — The gods in council')
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'Who is Calypso?' } })
    expect(screen.getByTestId('lab-ask-send')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-send').textContent).toBe('Send')
    expect(screen.queryByTestId('lab-ask-voice')).toBeNull()
  })

  it('keeps the desktop Ask composer in the viewport at scrollTop 0', () => {
    const long = {
      ...fallbackLabSource(),
      paragraphs: Array.from({ length: 80 }, (_, index) => (
        `Paragraph ${index + 1}. ${'The Odyssey continues on this page. '.repeat(24)}`
      )),
    }
    render(<LabApp pathname="/lab/desktop" source={long} />)
    openDesktopAsk()
    const composer = screen.getByTestId('lab-ask-composer')
    const ask = screen.getByTestId('lab-ask-pane')
    const page = document.querySelector('.lab-page-wrap')
    expect(ask.contains(composer)).toBe(true)
    expect(page?.contains(composer)).toBe(false)
    expect(page?.contains(ask)).toBe(false)
    expect(ask.lastElementChild).toBe(composer)
  })

  it('locks the desktop Ask pane to the viewport instead of the chapter height', () => {
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    expect(css).toMatch(/\.lab\.is-desktop\s*\{[^}]*height:\s*100vh/)
    expect(css).toMatch(/\.lab\.is-desktop\s*\{[^}]*overflow:\s*hidden/)
    expect(css).toMatch(/\.lab\.is-desktop\s+\.lab-page-wrap\s*\{[^}]*overflow:\s*auto/)
    expect(css).toMatch(/\.lab\.is-desktop\s+\.lab-ask\s*\{[^}]*position:\s*sticky/)
    expect(css).toMatch(/\.lab\.is-desktop\s+\.lab-ask\s*\{[^}]*height:\s*100%/)
    expect(css).toMatch(/\.lab-ask\.is-empty\s*,\s*\.lab-ask\.has-thread\s*\{[^}]*justify-content:\s*flex-end/)
    expect(css).not.toMatch(/\.lab-ask\.is-empty\s*\{[^}]*justify-content:\s*center/)
    expect(css).toMatch(/\.lab\.is-phone\s+\.lab-ask,\s*\.lab-ask\.is-phone-sheet\s*\{[^}]*width:\s*100%/)
    expect(css).toMatch(/\.lab\.is-phone\s+\.lab-ask,\s*\.lab-ask\.is-phone-sheet\s*\{[^}]*z-index:\s*300/)
    expect(css).toMatch(/\.lab-voice-gate\s*\{[^}]*z-index:\s*400/)
    expect(css).toMatch(/\.lab-voice-gate\s*\{[^}]*background:\s*#ece7db/)
    expect(css).toMatch(/\.lab-phone-bar\s*\{[^}]*z-index:\s*200/)
    expect(css).toMatch(/\.lab-phone-bar\s*\{[^}]*safe-area-inset-bottom/)
    expect(css).not.toMatch(/\.lab-phone-bar\s*\{[^}]*\+\s*56px/)
    expect(css).toMatch(/\.lab-phone-fat\s*\{[^}]*width:\s*100%/)    
    expect(css).not.toMatch(/\.lab-phone-actions/)
    expect(css).not.toMatch(/\.lab-settings-menu/)
    expect(css).not.toMatch(/\.lab-fullscreen-bar/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-header-brand\s*\{[^}]*flex-direction:\s*row/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-header-brand\s*\{[^}]*white-space:\s*nowrap/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-title,\s*\.lab\.is-phone \.lab-sub\s*\{[^}]*white-space:\s*nowrap/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-logo\s*\{[^}]*Playfair Display/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-logo\s*\{[^}]*font-size:\s*1\.1rem/)
    expect(css).not.toMatch(/\.lab-chapter-progress-bar\s*\{/)
    expect(css).toMatch(/\.lab-header-chapter\s*\{/)
    expect(css).toMatch(/\.lab-header-chapter\s*\{[^}]*background:\s*#e2d8c4/)
    expect(css).toMatch(/\.lab-header-chapter\s*\{[^}]*border-radius:\s*999px/)
    expect(css).toMatch(/\.lab-header-chapter\s*\{[^}]*flex:\s*0 1 auto/)
    expect(css).toMatch(/\.lab-ss-overlay,\s*\.lab-toc \.toc-overlay\s*\{[^}]*width:\s*100%/)
    expect(css).toMatch(/\.lab-ss-overlay,\s*\.lab-toc \.toc-overlay\s*\{[^}]*height:\s*100%/)
    expect(css).toMatch(/\.lab-ss-overlay,\s*\.lab-toc \.toc-overlay\s*\{[^}]*background:\s*#ece7db/)
    expect(css).toMatch(/\.lab-ss-sheet,\s*\.lab-toc \.toc-panel\s*\{[^}]*width:\s*100%/)
    expect(css).toMatch(/\.lab-ss-sheet,\s*\.lab-toc \.toc-panel\s*\{[^}]*height:\s*100%/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-ss-overlay,\s*\.lab\.is-phone \.lab-toc \.toc-overlay\s*\{[^}]*var\(--lab-vvh,\s*100%\)/)
    expect(css).not.toMatch(/\.lab-ss-sheet\s*\{[^}]*92vw/)
    expect(css).not.toMatch(/\.lab-ss-sheet\s*\{[^}]*95%/)
    expect(css).not.toMatch(/\.lab-toc \.toc-panel\s*\{[^}]*85vw/)
    expect(css).not.toMatch(/\.lab-toc \.toc-panel\s*\{[^}]*95%/)
    expect(css).toMatch(/\.lab-fullscreen\s*\{/)
    expect(css).toMatch(/\.lab-phone-fat\s*\{[^}]*background:\s*transparent/)
    expect(css).not.toMatch(/\.lab-phone-bar-row \.lab-phone-fat\s*\{[^}]*border-right:\s*1px solid #3a3a3a/)
    expect(css).not.toMatch(/\.lab-phone-fat\s*\{[^}]*background:\s*#0b0b0b/)
    expect(css).toMatch(/\.lab-phone-bar-row \.lab-phone-fat\s*\{[^}]*flex-direction:\s*column/)
    expect(css).not.toMatch(/\.lab-phone-bar-row \.lab-phone-fat\s*\{[^}]*flex-direction:\s*row/)
    expect(css).toMatch(/\.lab-phone-icon\s*\{/)
    expect(css).toMatch(/\.lab-ask-greeting\s*\{[^}]*display:\s*block/)
    expect(css).not.toMatch(/\.lab-ask-greeting\s*\{[^}]*display:\s*none/)
    expect(css).toMatch(/\.lab-inbook-backdrop\s*\{[^}]*z-index:\s*190/)
    expect(css).toMatch(/\.lab\.is-phone\s+\.lab-inbook-panel[^{]*\{[^}]*z-index:\s*200/)
    expect(css).toMatch(/\.lab-ask\s*\{[^}]*background:\s*#ece7db/)
    expect(css).toMatch(/\.lab-ask\s*\{[^}]*border-left:\s*1px solid #d4cdc0/)
    expect(css).toMatch(/\.lab-ask-composer\s*\{[^}]*background:\s*#ece7db/)
    expect(css).toMatch(/\.lab-ask-composer\s*\{[^}]*margin-top:\s*auto/)
    expect(css).toMatch(/\.lab-ask-composer\s*\{[^}]*border-radius:\s*3px/)
    expect(css).not.toMatch(/\.lab-ask-composer\s*\{[^}]*border-radius:\s*28px/)
    expect(css).not.toMatch(/\.lab-ask-composer\s*\{[^}]*height:\s*52px/)
    expect(css).not.toMatch(/\.lab-ask-bubble/)
    expect(css).not.toMatch(/border-radius:\s*1\.15rem/)
    expect(css).toMatch(/\.lab-ask-user\s*\{[^}]*font-family:\s*'EB Garamond'/)
    expect(css).toMatch(/\.lab\.is-phone\s*\{[^}]*overflow:\s*hidden/)
    expect(css).toMatch(/\.lab\.is-phone\s*\{[^}]*var\(--lab-vvh,\s*100svh\)/)
    expect(css).toMatch(/\.lab\.is-phone\s*\{[^}]*min-height:\s*0/)
    expect(css).not.toMatch(/\.lab\.is-phone\s*\{[^}]*height:\s*100dvh/)
    expect(css).toMatch(/\.lab-bottom-chrome\s*\{[^}]*flex:\s*none/)
    expect(css).toMatch(/\.lab-page-turn\s*\{[^}]*flex:\s*none/)
    expect(css).toMatch(/\.lab-page-turn-btn\s*\{/)
    expect(css).toMatch(/\.lab\.is-phone\s+\.lab-page-wrap\s*\{[^}]*overflow:\s*hidden/)
    expect(css).toMatch(/\.lab-status\s*\{[^}]*font-family:\s*'IBM Plex Mono'/)
    expect(css).toMatch(/\.lab-passage\.is-hearing \.lab-hearing-word\.is-current\s*,?[^}]*background:\s*#e8dcc4/)
    expect(css).toMatch(/\.lab-passage\.is-reading \.lab-hearing-word[^{]*\{[^}]*background:\s*none/)
    expect(css).toMatch(/\.lab-passage\.is-hearing \.lab-hearing-word\.is-upcoming\s*\{[^}]*color:\s*#9a9486/)
    expect(css).toMatch(/\.lab-hearing-stage\s*\{[^}]*justify-content:\s*flex-start/)
    expect(css).not.toMatch(/\.lab-hearing-stage\s*\{[^}]*justify-content:\s*center/)
    expect(css).not.toMatch(/\.lab-hearing-stage\s*\{[^}]*justify-content:\s*flex-end/)
    expect(css).toMatch(/\.lab\.is-phone\s+\.lab-hearing-stage\s*\{[^}]*flex-start/)
    expect(css).toMatch(/\.lab\.is-phone\s+\.lab-hearing-stage\s*\{[^}]*overflow-x:\s*hidden/)
    expect(css).toMatch(/last line cannot paint under the bar/)
    expect(css).not.toMatch(/--lab-chrome-inset/)
    expect(css).not.toMatch(/--lab-ask-chrome-inset/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-passage[^{]*\{[^}]*overflow-y:\s*auto/)
    expect(css).toMatch(/\.lab\.has-phone-chrome\[data-phone-bar="hearing"\]\s+\.lab-passage[^{]*\{[^}]*overflow-y:\s*auto/)
    expect(css).toMatch(/\.lab\.has-phone-chrome\[data-phone-bar="hearing"\]\s+\.lab-page-wrap[^{]*\{[^}]*overflow:\s*hidden/)
    expect(css).toMatch(/\.lab-ask\.is-phone-sheet \.lab-ask-thread[^{]*\{[^}]*overflow-y:\s*auto/)
    expect(css).toMatch(/\.lab-phone-bar\s*\{[^}]*isolation:\s*isolate/)
    expect(css).toMatch(/\.lab-phone-bar\s*\{[^}]*flex:\s*none/)
    expect(css).not.toMatch(/\.lab-phone-bar\s*\{[^}]*position:\s*fixed/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-phone-bar[^{]*\{[^}]*position:\s*static/)
    expect(css).not.toMatch(/\.lab\.is-phone \.lab-phone-bar[^{]*\{[^}]*position:\s*fixed/)
    expect(css).toMatch(/\.lab-ask\.is-phone-sheet \.lab-ask-chrome[^{]*\{[^}]*position:\s*static/)
    expect(css).not.toMatch(/\.lab-ask\.is-phone-sheet \.lab-ask-chrome[^{]*\{[^}]*position:\s*absolute/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-ask,\s*\.lab-ask\.is-phone-sheet\s*\{[^}]*position:\s*static/)
    expect(css).not.toMatch(/9\.5rem/)
    expect(css).not.toMatch(/10\.75rem/)
    expect(css).toMatch(/\.lab-phone-fat\s*\{[^}]*min-height:\s*2\.35rem/)
    expect(css).not.toMatch(/\.lab-phone-fat\s*\{[^}]*min-height:\s*3\.25rem/)
    expect(css).toMatch(/\.lab-passage-headline\s*\{[^}]*font-size:\s*2\.45rem/)
    expect(css).toMatch(/\.lab-passage-headline\s*\{[^}]*line-height:\s*1\.45/)
    expect(css).toMatch(/\.lab-passage-headline\s*\{[^}]*font-weight:\s*700/)
    expect(css).toMatch(/\.lab-passage-headline\s*\{[^}]*EB Garamond/)
    expect(css).not.toMatch(/\.lab-passage-headline\s*\{[^}]*Playfair/)
    expect(css).not.toMatch(/\.lab-passage-headline\s*\{[^}]*clamp\(/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-passage-headline\s*\{[^}]*font-size:\s*calc\(/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-passage-headline\s*\{[^}]*line-height:\s*1\.42/)
    expect(css).toMatch(/\.lab h1\.lab-passage-headline\s*\{[^}]*font-size:\s*2\.45rem/)
    expect(css).toMatch(/\.lab\.is-phone h1\.lab-passage-headline\s*\{[^}]*font-size:\s*calc\(/)
    expect(css).not.toMatch(/\.lab-passage-headline\s*\{[^}]*font-size:\s*2\.85rem/)
    expect(css).not.toMatch(/\.lab\.is-phone \.lab-passage-headline\s*\{[^}]*font-size:\s*2\.4rem/)
    expect(css).not.toMatch(/\.lab\.is-phone \.lab-passage-headline\s*\{[^}]*font-size:\s*1\.2rem/)
    expect(css).toMatch(/\.lab-hearing-line\s*\{[^}]*font-size:\s*calc\(/)
    expect(css).toMatch(/\.lab-hearing-line\s*\{[^}]*var\(--lab-font-reader/)
    expect(css).toMatch(/\.lab\.is-phone \.lab-hearing-line\s*\{[^}]*font-size:\s*calc\(/)
    const phoneHeadlineSize = css.match(/\.lab\.is-phone \.lab-passage-headline\s*\{[^}]*font-size:\s*calc\(/)
    const phoneHearingSize = css.match(/\.lab\.is-phone \.lab-hearing-line\s*\{[^}]*font-size:\s*calc\(/)
    expect(phoneHeadlineSize).toBeTruthy()
    expect(phoneHearingSize).toBeTruthy()
    expect(css).toMatch(/\.lab-p\s*\{[^}]*font-size:\s*1\.18rem/)
    expect(css).toMatch(/\.lab-p\s*\{[^}]*line-height:\s*1\.62/)
    expect(css).not.toMatch(/\.lab-p\s*\{[^}]*font-weight:\s*700/)
    expect(css).not.toMatch(/\.lab-passage\.is-reading \.lab-hearing-line\s*\{[^}]*font-size:\s*1\.18rem/)
    expect(css).not.toMatch(/\.lab\.is-phone \.lab-passage\.is-reading \.lab-hearing-line\s*\{[^}]*font-size:\s*1\.18rem/)
    expect(css).not.toMatch(/\.lab\.is-phone\s+\.lab-hearing-stage\s*\{[^}]*56px/)
    expect(css).not.toMatch(/8\.25rem/)
    expect(css).toMatch(/\.lab-hearing-line\s*\{[^}]*overflow-wrap:\s*anywhere/)
    expect(css).toMatch(/\.lab-kicker\s*\{[^}]*display:\s*none/)
    expect(css).toMatch(/\.lab-ask-tab\s*\{/)
    expect(css).not.toMatch(/Helvetica/)
    expect(css).not.toMatch(/gold|#f5d76e|#ffeaa7|#ffd54f|#fff59d/i)
    expect(css).not.toMatch(/\.lab-ask\s*\{[^}]*background:\s*#faf9f6/)
    expect(css).not.toMatch(/\.lab-ask-composer\s*\{[^}]*background:\s*#fff/)
    expect(css).not.toMatch(/\.lab-phone-notice\s*\{[^}]*position:\s*fixed/)

    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
    expect(screen.getByTestId('lab-root').className).toContain('is-desktop')
    openDesktopAsk()
    expect(screen.getByTestId('lab-ask-pane').className).toContain('is-empty')
    expect(screen.getByTestId('lab-ask-composer')).toBeTruthy()
    expect(screen.getByPlaceholderText('Ask')).toBeTruthy()
  })

  it('keeps the phone orb away until a real voice session starts', async () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)

    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-phone-talk'))

    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect(screen.getByPlaceholderText('Ask')).toBeTruthy()
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
    expect(screen.getByTestId('lab-phone-chat')).toBeTruthy()
    expect(screen.queryByTestId('lab-ask-done')).toBeNull()
    expect(screen.queryByTestId('lab-phone-listen')).toBeNull()
    expect(screen.getByTestId('lab-listen').textContent).toContain('Play')
    expect(screen.getByText('Ask about this page.')).toBeTruthy()
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
    expect(screen.queryByTestId('lab-orb')).toBeNull()
    expect(screen.queryByRole('log')).toBeNull()
    expect(screen.queryByTestId('lab-book')).toBeNull()
    expect(screen.queryByTestId('lab-hearing')).toBeNull()
  })

  it('does not POST /api/voice-session without a signed-in token', async () => {
    const fetchMock = vi.fn(() => new Promise(() => { /* hang lab guest token */ }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => new Promise(() => { /* hang */ }),
      },
    })
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken={null} />)
    openDesktopAsk()
    fireEvent.click(screen.getByTestId('lab-ask-mic'))
    await waitFor(() => {
      expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/api/lab-voice-session'))).toBe(true)
    })
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/api/voice-session') && !String(call[0]).includes('/api/lab-voice-session'))).toBe(false)
    const init = fetchMock.mock.calls.find(call => String(call[0]).includes('/api/lab-voice-session'))?.[1] as RequestInit
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
    expect(screen.queryByText('Sign in to ask by voice.')).toBeNull()
    expect(screen.queryByText('Sign in to ask about this page.')).toBeNull()
  })

  it('does not invent a conversation cycle when voice cannot start', async () => {
    vi.stubGlobal('fetch', () => new Promise(() => { /* hang guest token */ }))
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => new Promise(() => { /* hang so connecting stays visible */ }),
      },
    })
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken={null} />)
    openDesktopAsk()
    fireEvent.click(screen.getByTestId('lab-ask-mic'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('connecting')
    })
    expect(screen.queryByText('Sign in to ask by voice.')).toBeNull()
    expect(screen.queryByText('Listening.')).toBeNull()
    expect(screen.queryByText('Speaking.')).toBeNull()
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
    expect(screen.queryByTestId('lab-orb')).toBeNull()
  })

  it('pins the composer under a thread and drops the empty greeting', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('/api/lab-chat')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ content: [{ text: 'Odysseus is the man of the story.' }] }),
        }
      }
      return { ok: false, json: async () => ({}) }
    }))
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)
    openDesktopAsk()
    fireEvent.click(screen.getByTestId('lab-gear'))
    fireEvent.click(screen.getByTestId('lab-in-the-book'))
    fireEvent.click(screen.getByRole('tab', { name: 'People on this page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ask about this person' }))

    expect(screen.getByTestId('lab-ask-pane').className).toContain('has-thread')
    expect(document.querySelector('.lab-ask-greeting')).toBeNull()
    expect(screen.getByTestId('lab-ask-composer')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('Who is Odysseus on this page?')
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('You')
    expect(document.querySelector('.lab-ask-bubble')).toBeNull()
    expect(await screen.findByTestId('lab-ask-turn-assistant')).toBeTruthy()
    expect(screen.queryByText('Sign in to ask about this page.')).toBeNull()
  })

  it('marks the client document noindex', () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
    expect(document.title).toBe('Tinct lab')
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('noindex')
    expect(screen.queryByText('Private lab for the new reading chrome.')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-gear'))
    expect(screen.getByTestId('lab-in-the-book').textContent).toBe('This book')
  })

  it('keeps Compare as a page split from Reading settings', () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
    fireEvent.click(screen.getByTestId('lab-gear'))
    fireEvent.click(screen.getByTestId('lab-compare'))
    expect(screen.getByTestId('lab-compare-col')).toBeTruthy()
    expect(screen.getByTestId('lab-book').className).toContain('is-compare')
  })

  it('sends character questions to Ask when online', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('/api/lab-chat')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ content: [{ text: 'Odysseus is the man of the story.' }] }),
        }
      }
      return { ok: false, json: async () => ({}) }
    }))
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online authToken={null} />)
    openDesktopAsk()
    fireEvent.click(screen.getByTestId('lab-gear'))
    fireEvent.click(screen.getByTestId('lab-in-the-book'))
    fireEvent.click(screen.getByRole('tab', { name: 'People on this page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ask about this person' }))
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('Who is Odysseus on this page?')
    expect((await screen.findByTestId('lab-ask-turn-assistant')).textContent).toContain('Odysseus')
    expect(screen.queryByText('Sign in to ask about this page.')).toBeNull()
  })

  it('sends typed Ask without a session and does not show sign-in', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/api/lab-chat')) {
        expect(init?.headers && (init.headers as Record<string, string>).Authorization).toBeUndefined()
        return {
          ok: true,
          status: 200,
          json: async () => ({ content: [{ text: 'Paul wrote Romans.' }] }),
        }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken={null} />)
    openDesktopAsk()
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'Who wrote Romans?' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    expect((await screen.findByTestId('lab-ask-turn-user')).textContent).toContain('Who wrote Romans?')
    expect((await screen.findByTestId('lab-ask-turn-assistant')).textContent).toContain('Paul wrote Romans.')
    expect(screen.queryByText('Sign in to ask about this page.')).toBeNull()
    expect(screen.queryByTestId('lab-ask-notice')).toBeNull()
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/api/lab-chat'))).toBe(true)
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/api/chat') && !String(call[0]).includes('/api/lab-chat'))).toBe(false)
  })

  it('starts Hear from the live Odyssey Book 1 manifest onto a real audio element', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    const liveManifest = {
      chapter: 1,
      title: 'Book 1',
      paragraphs: [
        { paragraph: -1, file: 'title.mp3', duration: 1.675, words: [] },
        { paragraph: 0, file: 'p0.mp3', duration: 35.15, words: [
          { text: 'Tell', start: 0, end: 0.5 },
          { text: 'me,', start: 0.5, end: 1 },
          { text: 'O', start: 1, end: 1.4 },
          { text: 'Muse,', start: 1.4, end: 2 },
        ] },
        { paragraph: 1, file: 'p1.mp3', duration: 37.226, words: [] },
        { paragraph: 2, file: 'p2.mp3', duration: 26.975, words: [] },
      ],
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('audio-manifest') && url.includes('bible') && url.includes('ch1')) {
        return { ok: true, json: async () => liveManifest }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-listen'))

    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('/api/audio-file')
    })
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/api/audio-manifest'))).toBe(true)
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('bible%2Fkjv-en%2Fch1%2Fp0.mp3')
    expect(audio.src).toContain('/api/audio-file')
    expect(audio.src).toContain('p0.mp3')
    expect(audio.paused).toBe(false)
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-listen').textContent).toBe('Read')
    expect(screen.getByTestId('lab-listen').className).not.toContain('is-open')
    expect(screen.getByTestId('lab-hearing-stage')).toBeTruthy()
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Book 1 — The gods in council')
    expect(document.querySelectorAll('.lab-p').length).toBe(0)
    expect(screen.getByTestId('lab-hearing-current').textContent).toContain('Tell')
    expect(screen.queryByTestId('lab-hearing-progress')).toBeNull()

    audio.currentTime = 10
    act(() => { audio.emit('timeupdate') })

    fireEvent.click(screen.getByTestId('lab-hearing-forward'))
    expect(audio.currentTime).toBe(25)
    fireEvent.click(screen.getByTestId('lab-hearing-back'))
    expect(audio.currentTime).toBe(10)
    fireEvent.click(screen.getByTestId('lab-hearing-pause'))
    expect(audio.paused).toBe(true)
  })

  it('follows manifest word timings when words.json is missing', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    const liveManifest = {
      chapter: 1,
      title: 'Genesis 1',
      paragraphs: [
        { paragraph: -1, file: 'title.mp3', duration: 1.675, words: [] },
        { paragraph: 0, file: 'p0.mp3', duration: 4 },
        { paragraph: 1, file: 'p1.mp3', duration: 37.226, words: [] },
      ],
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('audio-manifest') && url.includes('bible') && url.includes('ch1')) {
        return { ok: true, json: async () => liveManifest }
      }
      if (url.includes('/api/audio-file') && url.includes('words.json')) {
        return { ok: false, status: 404, json: async () => ({}) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)

    const base = fallbackLabSource()
    const short = 'Tell me O Muse'
    render(<LabApp pathname="/lab/desktop" source={{
      ...base,
      paragraphs: [short, base.paragraphs[1]],
      followParagraphs: [
        {
          index: 0,
          text: short,
          file: 'p0.mp3',
          duration: 4,
          words: [
            { text: 'Tell', start: 0, end: 1 },
            { text: 'me', start: 1, end: 2 },
            { text: 'O', start: 2, end: 3 },
            { text: 'Muse', start: 3, end: 4 },
          ],
        },
        { index: 1, text: base.paragraphs[1] },
      ],
    }} />)
    fireEvent.click(screen.getByTestId('lab-listen'))

    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('bible%2Fkjv-en%2Fch1%2Fp0.mp3')
    })
    expect(fetchMock.mock.calls.some(call => String(call[0]) === '/odyssey-ch1-words.json')).toBe(false)
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-hearing-current').textContent).toContain('Tell')
    expect(document.querySelector('.lab-hearing-word.is-current')).toBeTruthy()
    expect(audio.paused).toBe(false)

    fireEvent.click(screen.getByTestId('lab-hearing-pause'))
    expect(audio.paused).toBe(true)
    expect(screen.queryByTestId('lab-hearing-current')).toBeNull()
    expect(document.querySelector('.lab-hearing-word.is-current')).toBeNull()
    expect(document.querySelector('.lab-hearing-word.is-upcoming')).toBeNull()
  })

  it('keeps playing every paragraph MP3 in the chapter after a stale ended', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    const paragraphs = [
      'In the beginning God created the heaven and the earth.',
      'And God said, Let there be a firmament in the midst of the waters.',
      'And God said, Let the earth bring forth grass.',
    ]
    const wordsFor = (text: string, duration: number) => {
      const parts = text.split(/\s+/).filter(Boolean)
      const unit = duration / parts.length
      return parts.map((word, index) => ({
        text: word,
        start: index * unit,
        end: (index + 1) * unit,
      }))
    }
    const source = {
      ...bibleFallbackSource(),
      paragraphs,
      followParagraphs: paragraphs.map((text, index) => ({
        index,
        text,
        file: `p${index}.mp3`,
        duration: 10,
        words: wordsFor(text, 10),
      })),
    }
    render(<LabApp pathname="/lab/phone" source={source} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('p0.mp3')
    })
    expect(screen.getByTestId('lab-hearing-current').textContent).toContain('In')

    audio.currentTime = 10
    act(() => {
      audio.emit('ended')
      audio.emit('ended')
    })
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('p1.mp3')
    })
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:1')
    expect(audio.paused).toBe(false)
    expect(screen.getByTestId('lab-hearing-current').textContent).toContain('And')

    audio.currentTime = 10
    act(() => { audio.emit('ended') })
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:2')
    })
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('p2.mp3')

    audio.currentTime = 10
    act(() => { audio.emit('ended') })
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    })
    expect(audio.paused).toBe(true)
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
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('bible')
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('p0.mp3')
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Book 1 — The gods in council')
    expect(screen.getByTestId('lab-hearing-current').textContent).toContain('Tell')

    audio.currentTime = 1.2
    act(() => { audio.emit('timeupdate') })
    const current = screen.getByTestId('lab-hearing-current').textContent || ''
    expect(current).toMatch(/O|Muse/)
    expect(current).not.toContain('me,')
  })

  it('keeps desktop conversation in the composer with an immediate living icon', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => new Promise(() => { /* hang so connecting stays visible */ }),
      },
    })
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} authToken="signed-in" />)
    openDesktopAsk()

    expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('idle')
    fireEvent.click(screen.getByTestId('lab-ask-voice'))

    expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('connecting')
    expect(screen.getByTestId('lab-status').textContent).toBe('Talking · tap × to stop')
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-connecting')
    expect(screen.getByTestId('lab-ask-voice-status').textContent).toContain('Starting')
    expect(screen.getByTestId('lab-ask-voice').textContent).not.toContain('Starting')
    expect(screen.getByTestId('lab-ask-mic').className).not.toContain('is-connecting')
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
    expect(screen.queryByTestId('lab-orb')).toBeNull()
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.getByTestId('lab-book').className).not.toContain('is-dimmed')
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect(screen.queryByTestId('lab-hearing')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
    expect(screen.getByTestId('lab-ask-tab')).toBeTruthy()
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
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
    openDesktopAsk()
    fireEvent.change(screen.getByPlaceholderText('Ask'), {
      target: { value: 'Read the second paragraph of Book 1.' },
    })
    fireEvent.click(screen.getByTestId('lab-ask-send'))

    expect(await screen.findByTestId('lab-ask-turn-assistant')).toBeTruthy()
    const chatCall = fetchMock.mock.calls.find(call => {
      const url = String(call[0])
      return url.includes('/api/chat') && !url.includes('/api/lab-chat')
    })
    const body = JSON.parse(String(chatCall?.[1]?.body))
    expect(body.system).toContain('[2] So now all who escaped death')
    expect(body.system).toContain('only have this chapter so far')
    expect(body.system).not.toContain('Speak for about 20')
    expect(body.system).toContain('resume_audiobook')
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
    expect(screen.queryByTestId('lab-hearing')).toBeNull()
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('You')
    expect(document.querySelector('.lab-ask-bubble')).toBeNull()
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
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    expect(screen.getByTestId('lab-hearing-transport')).toBeTruthy()
    expect(screen.queryByTestId('lab-hearing-progress')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-gear'))
    fireEvent.click(screen.getByTestId('lab-in-the-book'))
    expect(screen.getByTestId('lab-book').className).toContain('is-peek')
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
    expect(screen.queryByTestId('lab-hearing')).toBeNull()
  })

  it('puts phone Hearing transport in the in-flow footer, not the clipped stage', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    })
    const bar = screen.getByTestId('lab-phone-bar')
    const chrome = screen.getByTestId('lab-bottom-chrome')
    expect(bar.contains(screen.getByTestId('lab-listen'))).toBe(true)
    expect(bar.contains(screen.getByTestId('lab-hearing-pause'))).toBe(true)
    expect(bar.contains(screen.getByTestId('lab-phone-chat'))).toBe(true)
    expect(bar.contains(screen.getByTestId('lab-phone-talk'))).toBe(true)
    expect(chrome.contains(screen.getByTestId('lab-hearing-back'))).toBe(true)
    expect(chrome.contains(screen.getByTestId('lab-hearing-forward'))).toBe(true)
    expect(chrome.contains(screen.getByTestId('lab-hearing-speed'))).toBe(true)
    expect(screen.getByTestId('lab-page-turn').contains(screen.getByTestId('lab-chapter-progress'))).toBe(true)
    expect(screen.getByTestId('lab-page-turn').contains(screen.getByTestId('lab-hearing-back'))).toBe(true)
    expect(screen.getByTestId('lab-page-turn').contains(screen.getByTestId('lab-hearing-forward'))).toBe(true)
    expect(screen.getByTestId('lab-page-turn').contains(screen.getByTestId('lab-hearing-speed'))).toBe(true)
    expect(screen.getByTestId('lab-phone-talk').textContent).toContain('Talk')
    expect(screen.getByTestId('lab-phone-talk').querySelector('svg')).toBeTruthy()
    expect(screen.getByTestId('lab-phone-chat').querySelector('svg')).toBeTruthy()
    expect(screen.getByTestId('lab-listen').textContent).toContain('Pause')
    expect(document.querySelector('.lab-header')?.contains(screen.getByTestId('lab-listen'))).toBe(false)
    expect(screen.queryByRole('button', { name: 'Ask' })).toBeNull()
    expect(screen.getByTestId('lab-hearing-back').textContent).not.toContain('Back 15')
    expect(screen.getByTestId('lab-hearing-forward').textContent).not.toContain('Forward 15')
    expect(screen.queryByTestId('lab-hearing-transport')).toBeNull()
    await waitForPhoneProgress()
    const progressEl = screen.getByTestId('lab-chapter-progress')
    const playingLabel = progressEl.querySelector('.lab-chapter-progress-info')?.textContent?.trim() || ''
    expect(playingLabel).toMatch(/^\d+\s*\/\s*\d+$/)
    expect(playingLabel).not.toContain('—')
    expect(playingLabel).not.toContain('Book')
    expect(document.querySelector('.lab.has-slim-transport')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    expect(screen.getByTestId('lab-ask-pane').className).toContain('is-phone-sheet')
    expect((screen.getByPlaceholderText('Ask') as HTMLInputElement).type).toBe('text')
    expect(screen.queryByTestId('lab-ask-done')).toBeNull()
    expect(screen.queryByTestId('lab-phone-listen')).toBeNull()
    expect(screen.getByTestId('lab-listen').textContent).toContain('Play')
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
    expect(screen.queryByTestId('lab-hearing-pause')).toBeNull()
    expect(screen.queryByTestId('lab-hearing-speed')).toBeNull()
  })

  it('keeps the phone Hearing footer in flow so the passage scrollport ends at the bar', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    })
    const root = screen.getByTestId('lab-root')
    const footer = screen.getByTestId('lab-phone-bar')
    const passage = document.querySelector('.lab-passage') as HTMLElement | null
    expect(root.contains(footer)).toBe(true)
    expect(root.style.getPropertyValue('--lab-chrome-inset')).toBe('')
    expect(root.style.getPropertyValue('--lab-vvh')).toMatch(/px$/)
    expect(screen.getByTestId('lab-page-turn').contains(screen.getByTestId('lab-chapter-progress'))).toBe(true)
    expect(screen.getByTestId('lab-page-turn').contains(screen.getByTestId('lab-hearing-back'))).toBe(true)
    expect(passage).toBeTruthy()
    expect(passage?.contains(footer)).toBe(false)
    expect(footer.compareDocumentPosition(passage as Node) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
    const lastLine = document.querySelector('.lab-hearing-line:last-child') as HTMLElement | null
    expect(lastLine).toBeTruthy()
    expect(footer.contains(lastLine)).toBe(false)
    expect(screen.queryByTestId('lab-hearing-progress')).toBeNull()
  })

  it('shows Reading on the phone when In the book peeks the page over Hear', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    })
    openThisBook()
    expect(screen.getByTestId('lab-book').className).toContain('is-peek')
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
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
    openDesktopAsk()

    audio.currentTime = 8
    act(() => { audio.emit('timeupdate') })
    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    expect(screen.getByTestId('lab-status').textContent).toBe('Talking · tap × to stop')
    expect(audio.paused).toBe(true)
    expect(audio.currentTime).toBe(8)
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')

    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(audio.currentTime).toBe(8)
    expect(audio.paused).toBe(false)
  })

  it('pauses Hear when typed Ask starts and resumes when the reply completes', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    let finishReply: (value: {
      ok: boolean
      status: number
      json: () => Promise<{ content: Array<{ text: string }> }>
    }) => void = () => { /* set below */ }
    const reply = new Promise<{
      ok: boolean
      status: number
      json: () => Promise<{ content: Array<{ text: string }> }>
    }>((resolve) => { finishReply = resolve })
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('/api/chat')) return reply
      return Promise.resolve({ ok: false, json: async () => ({}) })
    }))

    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    openDesktopAsk()

    audio.currentTime = 8
    act(() => { audio.emit('timeupdate') })
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'Who is Telemachus?' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))

    expect(audio.paused).toBe(true)
    expect(audio.currentTime).toBe(8)
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    expect(await screen.findByTestId('lab-ask-turn-user')).toBeTruthy()

    await act(async () => {
      finishReply({
        ok: true,
        status: 200,
        json: async () => ({ content: [{ text: 'Telemachus is the son of Odysseus, just coming of age.' }] }),
      })
    })

    expect(await screen.findByTestId('lab-ask-turn-assistant')).toBeTruthy()
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    expect(audio.paused).toBe(true)
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-ask-done'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(audio.currentTime).toBe(8)
    expect(audio.paused).toBe(false)
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
  })

  it('pauses Hear on a voice click even when unsigned-in', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    vi.stubGlobal('fetch', () => new Promise(() => { /* hang guest token */ }))
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => new Promise(() => { /* hang so Talk stays connecting */ }),
      },
    })
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    openDesktopAsk()

    audio.currentTime = 8
    act(() => { audio.emit('timeupdate') })
    fireEvent.click(screen.getByTestId('lab-ask-voice'))

    expect(audio.paused).toBe(true)
    expect(audio.currentTime).toBe(8)
    expect(screen.queryByText('Sign in to ask by voice.')).toBeNull()
    expect(screen.queryByText('Sign in to ask about this page.')).toBeNull()
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    })
    expect(audio.paused).toBe(true)
    expect(audio.currentTime).toBe(8)
  })

  it('marks the current Hearing paragraph when word timings are missing', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })))
    render(<LabApp pathname="/lab/desktop" source={sourceWithFilesNoWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('/api/audio-file')
    })
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    expect(document.querySelectorAll('.lab-p').length).toBe(0)
    expect(screen.queryByText(/Now Neptune had gone off/)).toBeNull()
    const hearingStage = screen.getByTestId('lab-hearing-stage')
    expect(hearingStage.querySelector('.lab-hearing-word.is-current')).toBeNull()
    expect(screen.queryByTestId('lab-hearing-current')).toBeNull()
    expect(screen.getByTestId('lab-book').querySelector('.lab-word-current')).toBeNull()
    expect(screen.queryByTestId('lab-hearing-progress')).toBeNull()
    expect(screen.getByTestId('lab-passage-headline')).toBeTruthy()
    expect(hearingStage.textContent).toContain('Tell')

    audio.currentTime = 8
    act(() => { audio.emit('timeupdate') })

    act(() => { audio.emit('ended') })
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:1')
    })
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toContain('p1.mp3')
    expect(screen.queryByTestId('lab-hearing-current')).toBeNull()
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    expect(screen.queryByText(/Now Neptune had gone off/)).toBeNull()
  })

  it('returns to Hearing from phone Listen after Talk interrupted the book', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    audio.currentTime = 8
    act(() => { audio.emit('timeupdate') })
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
    expect(screen.queryByTestId('lab-book')).toBeNull()
    expect(screen.queryByTestId('lab-hearing')).toBeNull()
    expect(audio.paused).toBe(true)
    fireEvent.click(screen.getByTestId('lab-listen'))
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(audio.currentTime).toBe(8)
    expect(audio.paused).toBe(false)
  })

  it('closes Ask for a go-back-to-audiobook command without posting chat', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    openDesktopAsk()
    audio.currentTime = 8
    act(() => { audio.emit('timeupdate') })
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'go back to the audiobook' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/api/chat'))).toBe(false)
    expect(screen.queryByTestId('lab-ask-turn-user')).toBeNull()
    expect(screen.getByTestId('lab-status').textContent).toBe('Hearing · Book 1')
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(audio.currentTime).toBe(8)
  })

  it('seeks the real audio element and only marks the living circle', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => new Promise(() => { /* hang */ }),
      },
    })
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    openDesktopAsk()

    audio.currentTime = 8
    act(() => { audio.emit('timeupdate') })
    fireEvent.click(screen.getByTestId('lab-hearing-back'))
    expect(audio.currentTime).toBe(0)
    fireEvent.click(screen.getByTestId('lab-hearing-forward'))
    expect(audio.currentTime).toBe(15)
    fireEvent.click(screen.getByTestId('lab-hearing-pause'))
    expect(audio.paused).toBe(true)
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')

    fireEvent.click(screen.getByTestId('lab-ask-voice'))
    expect(screen.getByTestId('lab-ask-voice').className).toContain('is-connecting')
    expect(screen.getByTestId('lab-ask-mic').className).not.toMatch(/is-connecting|is-listening|is-speaking/)
    expect(screen.queryByTestId('lab-orb')).toBeNull()
  })

  it('dims the book sheet and shortens People on phone', () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    openThisBook()
    expect(screen.getByTestId('lab-in-the-book-panel')).toBeTruthy()
    expect(screen.getByTestId('lab-inbook-backdrop')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'People' })).toBeTruthy()
    expect(screen.queryByRole('tab', { name: 'People on this page' })).toBeNull()
    fireEvent.click(screen.getByTestId('lab-inbook-backdrop'))
    expect(screen.queryByTestId('lab-in-the-book-panel')).toBeNull()
  })

  it('applies a typed set_playback_speed tag to the hearing audio', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: [{ text: 'Playing at two times. [[set_playback_speed:2]]' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(audio.playbackRate).toBe(1)
    openDesktopAsk()
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: '2x please' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    await waitFor(() => {
      expect(audio.playbackRate).toBe(2)
    })
    expect(screen.getByTestId('lab-hearing-speed').textContent).toBe('2×')
    expect(screen.getByTestId('lab-ask-turn-assistant').textContent).toContain('Playing at two times')
    expect(screen.getByTestId('lab-ask-turn-assistant').textContent).not.toContain('set_playback_speed')
  })

  it('can still render a ready gate label if asked, but Talk does not wait on it', () => {
    render(<LabVoiceGate phase="ready" />)
    expect(screen.getByTestId('lab-voice-gate').textContent).toBe('Ready to speak')
    expect(screen.getByTestId('lab-voice-gate').getAttribute('data-phase')).toBe('ready')
    const chrome = readFileSync(resolve(__dirname, 'labChrome.ts'), 'utf8')
    expect(chrome).toMatch(/current === 'off' && conversationState === 'connecting'/)
    expect(chrome).not.toMatch(/current === 'connecting' && conversationState === 'listening'\) return 'ready'/)
  })

  it('drops Starting when the session is ready instead of holding Ready to speak', () => {
    const app = readFileSync(resolve(__dirname, 'LabApp.tsx'), 'utf8')
    const chrome = readFileSync(resolve(__dirname, 'labChrome.ts'), 'utf8')
    expect(app).not.toMatch(/LAB_READY_HOLD_MS/)
    expect(app).toMatch(/userSpeechStarted/)
    expect(chrome).toMatch(/userSpeechStarted/)
    expect(chrome).not.toMatch(/LAB_READY_HOLD_MS/)
  })

  it('covers the phone chat with a Starting overlay on Talk', () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => new Promise(() => { /* hang so connecting stays visible */ }),
      },
    })
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    const gate = screen.getByTestId('lab-voice-gate')
    expect(gate.textContent).toContain('Starting')
    expect(gate.getAttribute('data-phase')).toBe('connecting')
    expect(screen.getByTestId('lab-ask-pane').className).toContain('is-phone-sheet')
    expect(screen.queryByTestId('lab-phone-listen')).toBeNull()
    expect(screen.getByTestId('lab-listen').textContent).toContain('Play')
    expect(screen.queryByTestId('lab-hearing-pause')).toBeNull()
  })

  it('drops Starting and shows the chat sheet when unsigned-in Talk fails', async () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    expect((await screen.findByTestId('lab-ask-notice')).textContent).toContain("Couldn't start voice")
    expect(screen.queryByText('Sign in to ask by voice.')).toBeNull()
    expect(screen.queryByTestId('lab-voice-gate')).toBeNull()
    expect(screen.getByTestId('lab-ask-pane').className).toContain('is-phone-sheet')
    expect(screen.getByPlaceholderText('Ask')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('idle')
    fireEvent.click(screen.getByTestId('lab-listen'))
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.getByTestId('lab-phone-talk')).toBeTruthy()
  })

  it('drops Starting after 8s if voice never reaches listening', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', () => new Promise(() => { /* hang token fetch */ }))
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: {
        getUserMedia: () => new Promise(() => { /* hang so connecting stays visible */ }),
      },
    })
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    expect(screen.getByTestId('lab-voice-gate').textContent).toContain('Starting')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8000)
    })
    expect(screen.queryByTestId('lab-voice-gate')).toBeNull()
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-notice').textContent).toContain("Couldn't start voice")
    expect(screen.getByPlaceholderText('Ask')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-listen'))
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
  })

  it('keeps phone Reading on footer Play plus Talk, not the car stage', async () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.queryByTestId('lab-hearing')).toBeNull()
    const bar = screen.getByTestId('lab-phone-bar')
    expect(screen.getByTestId('lab-listen').textContent).toContain('Play')
    expect(screen.getByTestId('lab-listen-play')).toBeTruthy()
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Book 1 — The gods in council')
    expect(bar.contains(screen.getByTestId('lab-listen'))).toBe(true)
    expect(bar.contains(screen.getByTestId('lab-phone-chat'))).toBe(true)
    expect(bar.contains(screen.getByTestId('lab-phone-talk'))).toBe(true)
    expect(document.querySelector('.lab-header')?.contains(screen.getByTestId('lab-listen'))).toBe(false)
    expect(screen.getByTestId('lab-phone-talk').textContent).toContain('Talk')
    expect(screen.getByTestId('lab-phone-chat').textContent).toContain('Chat')
    expect(screen.getByTestId('lab-gear')).toBeTruthy()
    expect(screen.queryByTestId('lab-gear-menu')).toBeNull()
    expect(screen.queryByTestId('lab-settings')).toBeNull()
    expect(screen.queryByTestId('lab-phone-listen')).toBeNull()
    expect(screen.queryByTestId('lab-phone-ask')).toBeNull()
    expect(screen.queryByTestId('lab-hearing-pause')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ask' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Library' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Saved' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Profile' })).toBeNull()
    expect(screen.getByTestId('lab-page-turn')).toBeTruthy()
    expect(screen.queryByTestId('lab-page-prev')).toBeNull()
    expect(screen.getByTestId('lab-page-next')).toBeTruthy()
    expect(screen.getByTestId('lab-page-next').textContent).toContain('→')
    expect(screen.getByLabelText('Next')).toBeTruthy()
    expect(screen.getByTestId('lab-wordmark').textContent).toBe('Tinct')
    expect(document.querySelector('.lab-header-brand')?.textContent).toContain('Tinct')
    expect(document.querySelector('.lab-header-brand')?.textContent).toContain('The Odyssey')
    expect(document.querySelector('.lab-header-brand')?.textContent).toContain('Book 1')
    expect(document.querySelector('.lab-header-brand')?.textContent).not.toContain('Homer')
    expect(screen.getByTestId('lab-header-work').textContent).toBe('The Odyssey')
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Book 1/)
    expect(screen.getByTestId('lab-header-chapter').textContent).toContain('∨')
    expect(screen.getByTestId('lab-fullscreen')).toBeTruthy()
    await waitForPhoneProgress()
    const progress = phoneProgressInfo()
    expect(progress).toMatch(/^\d+\s*\/\s*\d+$/)
    expect(progress).not.toContain('—')
    expect(progress).not.toContain('Book 1')
    expect(progress).not.toMatch(/ ch$/)
    const progressEl = screen.getByTestId('lab-chapter-progress')
    expect(progressEl.querySelector('.lab-chapter-progress-bar')).toBeNull()
    expect(screen.getByTestId('lab-page-turn').contains(progressEl)).toBe(true)
    expect(document.querySelector('.lab-header')?.contains(progressEl)).toBe(false)
    const first = document.querySelector('.lab-hearing-line')?.textContent || ''
    expect(first).toContain('Tell me, O Muse')
    fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    const second = document.querySelector('.lab-hearing-line')?.textContent || ''
    expect(second).not.toBe(first)
    expect(screen.getByTestId('lab-page-prev')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    expect(screen.getByTestId('lab-passage-headline')).toBeTruthy()
  })

  it('returns to the page from Talk opened in Reading and does not start the book', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithWords()} authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    expect(screen.queryByTestId('lab-phone-listen')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-listen'))
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    expect(audio.paused).toBe(true)
  })

  it('opens Chat as the typed thread and does not start voice', () => {
    const getUserMedia = vi.fn()
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: { getUserMedia },
    })
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-phone-chat'))
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect(screen.getByPlaceholderText('Ask')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-send').textContent).toBe('Send')
    expect(screen.queryByTestId('lab-phone-listen')).toBeNull()
    expect(screen.queryByTestId('lab-voice-gate')).toBeNull()
    expect(getUserMedia).not.toHaveBeenCalled()
    expect(screen.getByTestId('lab-ask-composer').getAttribute('data-voice-phase')).toBe('idle')
    fireEvent.click(screen.getByTestId('lab-listen'))
    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    expect(screen.getByTestId('lab-book')).toBeTruthy()
    expect(screen.getByTestId('lab-status').textContent).toBe('Reading · Book 1')
  })

  it('submits typed Chat on Send and on Enter without Starting', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: [{ text: 'Calypso keeps him on Ogygia.' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-phone-chat'))
    expect(screen.queryByTestId('lab-voice-gate')).toBeNull()
    const input = screen.getByPlaceholderText('Ask')
    fireEvent.change(input, { target: { value: 'Who is Calypso?' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    expect(await screen.findByTestId('lab-ask-turn-user')).toBeTruthy()
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('Who is Calypso?')
    expect(screen.queryByTestId('lab-voice-gate')).toBeNull()
    await screen.findByTestId('lab-ask-turn-assistant')
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'And Hermes?' } })
    fireEvent.keyDown(screen.getByPlaceholderText('Ask'), { key: 'Enter' })
    expect((await screen.findAllByTestId('lab-ask-turn-user')).map(node => node.textContent).join(' ')).toContain('And Hermes?')
    fireEvent.click(screen.getByTestId('lab-phone-talk'))
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect(screen.getAllByTestId('lab-ask-turn-user').length).toBeGreaterThan(0)
  })

  it('opens Library / Reading / Layout from the phone gear, not a tab bar', () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    expect(screen.getByTestId('lab-gear')).toBeTruthy()
    expect(screen.getByTestId('lab-fullscreen')).toBeTruthy()
    expect(screen.queryByTestId('lab-in-the-book')).toBeNull()
    expect(screen.queryByTestId('lab-compare')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-gear'))
    const sheet = screen.getByTestId('lab-settings-sheet')
    expect(sheet.className).toContain('lab-ss-overlay')
    expect(sheet.querySelector('.lab-ss-sheet')).toBeTruthy()
    expect(sheet.querySelector('.lab-ss-close')).toBeTruthy()
    expect(sheet.textContent).toContain('Library')
    expect(sheet.textContent).toContain('Reading')
    expect(sheet.textContent).toContain('Layout')
    expect(sheet.textContent).not.toContain('Home')
    expect(sheet.textContent).not.toContain('Saved')
    expect(sheet.textContent).not.toContain('Profile')
    expect(screen.getByTestId('lab-settings-library').getAttribute('href')).toBe('/read/')
    fireEvent.click(screen.getByTestId('lab-compare'))
    expect(screen.getByTestId('lab-compare-col')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-settings-layout'))
    expect(screen.getByTestId('lab-theme')).toBeTruthy()
    expect(screen.getByTestId('lab-progress-metric')).toBeTruthy()
  })

  it('applies a typed set_assistant_pace tag without changing book speed', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: [{ text: 'I will speak more slowly. [[set_assistant_pace:slow]]' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(audio.playbackRate).toBe(1)
    openDesktopAsk()
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'talk slower please' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-ask-turn-assistant').textContent).toContain('I will speak more slowly')
    })
    expect(audio.playbackRate).toBe(1)
    expect(screen.getByTestId('lab-hearing-speed').textContent).toBe('1×')
    expect(screen.getByTestId('lab-ask-turn-assistant').textContent).not.toContain('set_assistant_pace')
  })
})

describe('lab bible book', () => {
  afterEach(() => {
    resetLabBibleManifestCache()
  })

  function mockBibleFetch() {
    const manifest = {
      format: 'tinct-edition-chapters-v1',
      bookId: 'bible',
      editionKey: 'kjv-en',
      chapters: [
        { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
        { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
      ],
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('bible-kjv-en/manifest.json')) return { ok: true, json: async () => manifest }
      if (url.includes('bible-kjv-en/ch0001.json')) {
        return { ok: true, json: async () => ({ number: 1, title: 'Genesis 1', paragraphs: ['In the beginning God created the heaven and the earth.', 'And the earth was without form, and void.'] }) }
      }
      if (url.includes('bible-kjv-en/ch0002.json')) {
        return { ok: true, json: async () => ({ number: 2, title: 'Genesis 2', paragraphs: ['Thus the heavens and the earth were finished.', 'And on the seventh day God ended his work.'] }) }
      }
      if (url.includes('bible-modern-en')) return { ok: true, json: async () => ({ paragraphs: [] }) }
      if (url.includes('bible-threads.json')) return { ok: true, json: async () => ({ characters: [] }) }
      if (url.includes('audio-manifest')) {
        return { ok: true, json: async () => ({ chapter: 1, paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 4 }] }) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  it('shows Tinct. then Genesis · 1 and turns into the next Bible chapter', async () => {
    mockBibleFetch()
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      paragraphs: ['In the beginning God created the heaven and the earth.'],
      followParagraphs: [{ index: 0, text: 'In the beginning God created the heaven and the earth.' }],
      chapters: [
        { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
        { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
      ],
    }} />)
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 1/)
    expect(screen.getByTestId('lab-wordmark').textContent).toBe('Tinct')
    expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('1')
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Genesis 1')
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
    expect(screen.getByTestId('lab-listen').textContent).toContain('Play')
    expect(screen.getByTestId('lab-chapter-progress')).toBeTruthy()

    fireEvent.click(screen.getByTestId('lab-page-next'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 2/)
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Genesis 2')
    expect(document.querySelector('.lab-hearing-line')?.textContent).toContain('heavens and the earth were finished')

    fireEvent.click(screen.getByTestId('lab-page-prev'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('1')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 1/)
    await waitForPhoneProgress()
    const genesis1Progress = phoneProgressInfo()
    expect(genesis1Progress).toMatch(/^\s*\d+\s*\/\s*\d+\s*$/)
    expect(genesis1Progress).not.toContain('Genesis 1')
  })

  it('Previous on Genesis 2 page 1 goes to Genesis 1 last', async () => {
    const pageA = ['In the beginning God created the heaven and the earth.', ...Array.from({ length: 79 }, (_, i) => `g1a${i}`)].join(' ')
    const pageB = Array.from({ length: 80 }, (_, i) => `g1b${i}`).join(' ')
    const pageC = 'And God made two great lights; the greater light to rule the day, and to divide the light from the darkness. ' + Array.from({ length: 70 }, (_, i) => `g1c${i}`).join(' ')
    const genesis1 = [pageA, pageB, pageC]
    const genesis2 = ['Thus the heavens and the earth were finished.', 'And on the seventh day God ended his work.']
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('bible-kjv-en/manifest.json')) {
        return { ok: true, json: async () => ({
          format: 'tinct-edition-chapters-v1',
          bookId: 'bible',
          editionKey: 'kjv-en',
          chapters: [
            { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
            { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
          ],
        }) }
      }
      if (url.includes('bible-kjv-en/ch0001.json')) {
        return { ok: true, json: async () => ({ number: 1, title: 'Genesis 1', paragraphs: genesis1 }) }
      }
      if (url.includes('bible-kjv-en/ch0002.json')) {
        return { ok: true, json: async () => ({ number: 2, title: 'Genesis 2', paragraphs: genesis2 }) }
      }
      if (url.includes('bible-modern-en')) return { ok: true, json: async () => ({ paragraphs: [] }) }
      if (url.includes('bible-threads.json')) return { ok: true, json: async () => ({ characters: [] }) }
      if (url.includes('audio-manifest')) {
        return { ok: true, json: async () => ({ chapter: 1, paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 4 }] }) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      paragraphs: genesis1,
      followParagraphs: genesis1.map((text, index) => ({ index, text })),
      chapters: [
        { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
        { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
      ],
    }} />)
    const progress = () => phoneProgressInfo()
    const line = () => (document.querySelector('.lab-hearing-line')?.textContent || '')
    await waitForPhoneProgress()
    expect(progress()).toMatch(/1 \/ \d+/)
    expect(line()).toContain('In the beginning')
    for (let i = 0; i < 8; i++) {
      if (screen.getByTestId('lab-root').getAttribute('data-chapter') === '2') break
      fireEvent.click(screen.getByTestId('lab-page-next'))
    }
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 2/)
    await waitForPhoneProgress()
    expect(progress()).toContain('1 /')
    expect(line()).toContain('heavens and the earth were finished')
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('1')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 1/)
    await waitForPhoneProgress()
    const back = progress()
    expect(back).toMatch(/^\s*(\d+)\s*\/\s*(\1)\s*$/)
    await waitFor(() => {
      expect(line()).toMatch(/g1c\d+/)
      expect(line()).not.toContain('In the beginning')
    })
    fireEvent.click(screen.getByTestId('lab-page-next'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2')
    })
    expect(line()).toContain('heavens and the earth were finished')
  })

  it('labels Proverbs 16 with the biblical name, never the linear index', async () => {
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapterNumber: 644,
      chapterLabel: 'Proverbs 16',
      chapterTitle: 'Proverbs 16',
      headerBook: 'Proverbs',
      headerChapter: '16',
      paragraphs: ['Every one that is proud in heart is an abomination to the LORD: though hand join in hand, he shall not be unpunished.'],
      followParagraphs: [{
        index: 0,
        text: 'Every one that is proud in heart is an abomination to the LORD: though hand join in hand, he shall not be unpunished.',
      }],
      chapters: [
        { number: 643, title: 'Proverbs 15', path: 'ch0643.json' },
        { number: 644, title: 'Proverbs 16', path: 'ch0644.json' },
        { number: 645, title: 'Proverbs 17', path: 'ch0645.json' },
      ],
    }} />)
    await waitForPhoneProgress()
    const label = phoneProgressInfo()
    expect(label).toMatch(/^\s*1\s*\/\s*\d+\s*$/)
    expect(label).not.toContain('Proverbs')
    expect(label).not.toMatch(/Chapter 644/)
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Proverbs 16/)
  })

  it('page-next from Proverbs 16 last goes to Proverbs 17 p1, and prev returns to 16 last', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('manifest.json') && !url.includes('audio-manifest')) {
        return {
          ok: true,
          json: async () => ({
            format: 'tinct-edition-chapters-v1',
            bookId: 'bible',
            editionKey: 'kjv-en',
            chapters: [
              { number: 644, title: 'Proverbs 16', path: 'ch0644.json' },
              { number: 645, title: 'Proverbs 17', path: 'ch0645.json' },
            ],
          }),
        }
      }
      if (url.includes('ch0644.json')) {
        return {
          ok: true,
          json: async () => ({
            number: 644,
            title: 'Proverbs 16',
            paragraphs: ['Commit thy works unto the LORD, and thy thoughts shall be established. He shall not be unpunished.'],
          }),
        }
      }
      if (url.includes('ch0645.json')) {
        return {
          ok: true,
          json: async () => ({
            number: 645,
            title: 'Proverbs 17',
            paragraphs: ['Better is a dry morsel, and quietness therewith, than an house full of sacrifices with strife.'],
          }),
        }
      }
      if (url.includes('bible-modern-en')) return { ok: true, json: async () => ({ paragraphs: [] }) }
      if (url.includes('bible-threads.json')) return { ok: true, json: async () => ({ characters: [] }) }
      if (url.includes('audio-manifest')) {
        return { ok: true, json: async () => ({ chapter: 644, paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 4 }] }) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapterNumber: 644,
      chapterLabel: 'Proverbs 16',
      chapterTitle: 'Proverbs 16',
      headerBook: 'Proverbs',
      headerChapter: '16',
      paragraphs: ['Commit thy works unto the LORD, and thy thoughts shall be established. He shall not be unpunished.'],
      followParagraphs: [{
        index: 0,
        text: 'Commit thy works unto the LORD, and thy thoughts shall be established. He shall not be unpunished.',
      }],
      chapters: [
        { number: 644, title: 'Proverbs 16', path: 'ch0644.json' },
        { number: 645, title: 'Proverbs 17', path: 'ch0645.json' },
      ],
    }} />)
    await waitForPhoneProgress()
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Proverbs 16/)
    // One short paragraph = last page. Next must hop to Proverbs 17 p1.
    fireEvent.click(screen.getByTestId('lab-page-next'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('645')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Proverbs 17/)
    await waitForPhoneProgress()
    expect(phoneProgressInfo()).toMatch(/^1\s*\/\s*\d+$/)
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('644')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Proverbs 16/)
    await waitForPhoneProgress()
    const back = phoneProgressInfo()
    expect(back).toMatch(/^\d+\s*\/\s*\d+$/)
    expect(back).not.toContain('644')
    expect(document.querySelector('.lab-hearing-line')?.textContent).toMatch(/unpunished|Commit thy works/i)
  })

  it('next_chapter moves Genesis and plays after the confirm line', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    const bibleFetch = mockBibleFetch()
    vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/chat')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ content: [{ text: 'Genesis 2. [[next_chapter]]' }] }),
        }
      }
      return bibleFetch(input)
    })
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      paragraphs: ['In the beginning God created the heaven and the earth.', 'And the earth was without form, and void.'],
      followParagraphs: [
        { index: 0, text: 'In the beginning God created the heaven and the earth.', file: 'p0.mp3', duration: 4 },
        { index: 1, text: 'And the earth was without form, and void.', file: 'p1.mp3', duration: 4 },
      ],
      chapters: [
        { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
        { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
      ],
    }} authToken="signed-in" />)
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 1/)
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    fireEvent.click(screen.getByTestId('lab-phone-chat'))
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'next chapter' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 2/)
    expect(JSON.parse(localStorage.getItem('tinct-lab-finished-chapters') || '[]')).toContain(1)
    expect(screen.getByTestId('lab-chapter-progress')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(screen.getByTestId('lab-phone-chat').textContent).toContain('Chat')
    expect(screen.getByTestId('lab-phone-talk').textContent).toContain('Talk')
  })

  it('does not start the book after a plain book question', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    const bibleFetch = mockBibleFetch()
    vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/chat')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ content: [{ text: 'Abraham is named in this chapter as the father of many nations.' }] }),
        }
      }
      return bibleFetch(input)
    })
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapters: [
        { number: 1, title: 'Genesis 1' },
        { number: 2, title: 'Genesis 2' },
      ],
    }} authToken="signed-in" />)
    fireEvent.click(screen.getByTestId('lab-phone-chat'))
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'who is Abraham' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-ask-turn-assistant').textContent).toContain('Abraham')
    })
    expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('1')
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    expect(screen.getByTestId('lab-listen').textContent).toContain('Play')
  })

  it('keeps Talk and Chat on this Bible chapter', async () => {
    mockBibleFetch()
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapters: [
        { number: 1, title: 'Genesis 1' },
        { number: 2, title: 'Genesis 2' },
      ],
    }} authToken="signed-in" />)
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 1/)
    expect(screen.getByTestId('lab-phone-chat').textContent).toContain('Chat')
    expect(screen.getByTestId('lab-phone-talk').textContent).toContain('Talk')
    fireEvent.click(screen.getByTestId('lab-phone-chat'))
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect(screen.getByPlaceholderText('Ask')).toBeTruthy()
  })
})

describe('lab passage headline pages', () => {
  it('shows the chapter headline only on the first hearing page', () => {
    const words = Array.from({ length: 200 }, (_, index) => ({
      text: (index + 1) % 20 === 0 ? `w${index}.` : `w${index}`,
      start: index * 0.3,
      end: index * 0.3 + 0.25,
    }))
    const first = followParagraphFromManifest(0, words.map(word => word.text).join(' '), {
      duration: 60,
      words,
    })
    const pages = hearingPages(words)
    expect(pages.length).toBeGreaterThan(1)
    const props = {
      chapterTitle: 'Book 1 — The gods in council',
      paragraphs: [first.text],
      compareParagraphs: [],
      compare: false,
      mode: 'hearing' as const,
      followParagraphs: [first],
      markedIndexes: new Set<number>(),
      onMark: () => { /* unused */ },
    }
    const { rerender } = render(
      <LabPassage {...props} playing follow={{ kind: 'word', paragraphIndex: 0, wordIndex: 4 }} />,
    )
    expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Book 1')
    rerender(
      <LabPassage {...props} playing follow={{ kind: 'word', paragraphIndex: 0, wordIndex: pages[1].from }} />,
    )
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
  })

  it('does not paint follow roles in Reading even when follow is still set', () => {
    const words = [
      { text: 'Tell', start: 0, end: 0.4 },
      { text: 'me,', start: 0.4, end: 0.7 },
      { text: 'O', start: 0.7, end: 0.9 },
      { text: 'Muse', start: 0.9, end: 1.4 },
    ]
    const first = followParagraphFromManifest(0, 'Tell me, O Muse', { duration: 2, words })
    render(
      <LabPassage
        chapterTitle="Book 1"
        paragraphs={[first.text]}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        playing={false}
        follow={{ kind: 'word', paragraphIndex: 0, wordIndex: 1 }}
        followParagraphs={[first]}
        markedIndexes={new Set()}
        onMark={() => { /* unused */ }}
        readingPage={{ paragraphIndex: 0, from: 0, to: 4 }}
      />,
    )
    const book = screen.getByTestId('lab-book')
    expect(book.getAttribute('data-passage-mode')).toBe('reading')
    expect(book.className).toContain('is-reading')
    expect(book.className).not.toContain('is-hearing')
    expect(screen.getByTestId('lab-reading-stage').textContent).toContain('Tell')
    expect(document.querySelector('.lab-hearing-word.is-current')).toBeNull()
    expect(document.querySelector('.lab-hearing-word.is-upcoming')).toBeNull()
    expect(document.querySelector('.lab-hearing-word.is-spoken')).toBeNull()
    expect(screen.queryByTestId('lab-hearing-current')).toBeNull()
  })

  it('renders multi-digit verse markers in reading with lab-verse-mark', () => {
    const text = '⁹ before ¹⁰ verse ten ²⁰ twenty'
    render(
      <LabPassage
        chapterTitle="Jeremiah 23"
        paragraphs={[text]}
        compareParagraphs={[]}
        compare={false}
        mode="reading"
        playing={false}
        follow={{ kind: 'none' }}
        followParagraphs={[]}
        markedIndexes={new Set()}
        onMark={() => { /* unused */ }}
        readingPage={{ paragraphIndex: 0, from: 0, to: 8 }}
      />,
    )
    const marks = Array.from(document.querySelectorAll('.lab-verse-mark'))
    expect(marks.map((el) => el.textContent)).toEqual(['9', '10', '20'])
  })
})



function sourceWithFivePages() {
  const paragraphs = Array.from({ length: 5 }, (_, page) => (
    Array.from({ length: 80 }, (_, index) => (
      (index + 1) % 20 === 0 ? `p${page}w${index}.` : `p${page}w${index}`
    )).join(' ')
  ))
  return {
    ...fallbackLabSource(),
    paragraphs,
    followParagraphs: paragraphs.map((text, index) => ({
      index,
      text,
      file: `p${index}.mp3`,
      duration: 20,
    })),
    chapters: [{ number: 1, title: 'Book 1' }],
  }
}
function sourceWithManyWords() {
  const words = Array.from({ length: 200 }, (_, index) => ({
    text: (index + 1) % 20 === 0 ? `w${index}.` : `w${index}`,
    start: index * 0.3,
    end: index * 0.3 + 0.25,
  }))
  const text = words.map(word => word.text).join(' ')
  const first = followParagraphFromManifest(0, text, {
    duration: 60,
    file: 'p0.mp3',
    words,
  })
  return {
    ...fallbackLabSource(),
    paragraphs: [text, 'Later paragraph with its own page of leftover words after Book 1 opens.'],
    followParagraphs: [
      first,
      { index: 1, text: 'Later paragraph with its own page of leftover words after Book 1 opens.', file: 'p1.mp3', duration: 8 },
    ],
  }
}

describe('lab read listen place and paused chrome', () => {
  it('mid-book −15 seeks 15s of audio and does not reset to clip 0 / word 0', async () => {
    const audio = new FakeAudio()
    audio.duration = 40
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    const source = sourceWithManyWords()
    render(<LabApp pathname="/lab/phone" source={source} />)
    fireEvent.click(screen.getByTestId('lab-page-next'))
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    audio.currentTime = 40
    act(() => { audio.emit('timeupdate') })
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-clip')).toBe('0')
    fireEvent.click(screen.getByTestId('lab-hearing-back'))
    expect(audio.currentTime).toBe(25)
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-clip')).toBe('0')
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    const current = screen.queryByTestId('lab-hearing-current')
    expect(current?.textContent || '').not.toMatch(/^\s*w0\s*$/)
  })

  it('page turns while playing do not seek audio or change clip', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    const firstPage = (document.querySelector('.lab-hearing-line')?.textContent || '').trim()
    audio.currentTime = 18
    act(() => { audio.emit('timeupdate') })
    const clipBefore = screen.getByTestId('lab-listen-status').getAttribute('data-clip')
    const srcBefore = screen.getByTestId('lab-listen-status').getAttribute('data-src') || ''
    fireEvent.click(screen.getByTestId('lab-page-next'))
    const pageTwo = (document.querySelector('.lab-hearing-line')?.textContent || '').trim()
    expect(pageTwo).not.toBe(firstPage)
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-clip')).toBe(clipBefore)
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-src')).toBe(srcBefore)
    expect(audio.currentTime).toBe(18)
    const progress = () => {
      const text = screen.getByTestId('lab-chapter-progress').textContent || ''
      const match = text.match(/(\d+)\s*\/\s*(\d+)/)
      return match ? { n: Number(match[1]), m: Number(match[2]) } : { n: 0, m: 0 }
    }
    const line = () => (document.querySelector('.lab-hearing-line')?.textContent || '').replace(/Keep this passage/g, '').trim()
    const frozenM = progress().m
    const pageTwoWords = line()
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    expect(line()).toBe(firstPage)
    expect(progress().m).toBe(frozenM)
    fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(line()).toBe(pageTwoWords)
    expect(progress().m).toBe(frozenM)
    fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-clip')).toBe(clipBefore)
    expect(audio.currentTime).toBe(18)
  })

  it('page turns after browse-while-listening pause do not seek audio', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    audio.currentTime = 12
    act(() => { audio.emit('timeupdate') })
    fireEvent.click(screen.getByTestId('lab-page-next'))
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    })
    const clipBefore = screen.getByTestId('lab-listen-status').getAttribute('data-clip')
    const timeBefore = audio.currentTime
    fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-clip')).toBe(clipBefore)
    expect(audio.currentTime).toBe(timeBefore)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(audio.currentTime).toBe(timeBefore)
  })

  it('keeps the same page when toggling Read and Listen', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
    const first = document.querySelector('.lab-hearing-line')?.textContent || ''
    expect(screen.getByTestId('lab-passage-headline')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-page-next'))
    const second = document.querySelector('.lab-hearing-line')?.textContent || ''
    expect(second).not.toBe(first)
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-hearing')).toBeTruthy()
      expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    })
    expect((document.querySelector('.lab-hearing-stage')?.textContent || '')).toContain(second.trim().split(/\s+/)[0])

    fireEvent.click(screen.getByTestId('lab-listen'))
    expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    expect((document.querySelector('.lab-hearing-line')?.textContent || '').replace('Keep this passage', '')).toBe(second.replace('Keep this passage', ''))
    expect(screen.getByTestId('lab-page-turn')).toBeTruthy()
    expect(screen.getByTestId('lab-listen').textContent).toContain('Play')
  })

  it('shows page-turn only while paused and transport while playing', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithWords()} />)
    expect(screen.getByTestId('lab-page-turn')).toBeTruthy()
    expect(screen.queryByTestId('lab-hearing-pause')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(screen.getByTestId('lab-page-turn')).toBeTruthy()
    expect(screen.getByTestId('lab-page-turn').contains(screen.getByTestId('lab-chapter-progress'))).toBe(true)
    expect(screen.getByTestId('lab-page-turn').contains(screen.getByTestId('lab-hearing-back'))).toBe(true)
    expect(screen.getByTestId('lab-hearing-pause')).toBeTruthy()
    expect(screen.getByTestId('lab-bottom-chrome').contains(screen.getByTestId('lab-hearing-pause'))).toBe(true)

    fireEvent.click(screen.getByTestId('lab-hearing-pause'))
    expect(screen.getByTestId('lab-page-turn')).toBeTruthy()
    expect(screen.queryByTestId('lab-hearing-pause')).toBeNull()
    expect(screen.getByTestId('lab-listen').textContent).toContain('Play')
    expect(screen.getByTestId('lab-phone-talk')).toBeTruthy()
    expect(screen.getByTestId('lab-phone-chat')).toBeTruthy()
  })

  it('keeps last text node above chrome top on reading pages and hearing chrome change', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)

    const assertLastClearsChrome = () => {
      const chrome = screen.getByTestId('lab-bottom-chrome')
      const lines = [...document.querySelectorAll('.lab-hearing-line')]
      const last = lines[lines.length - 1] as HTMLElement
      expect(last).toBeTruthy()
      const chromeTop = 560
      const lastBottom = 500
      chrome.getBoundingClientRect = () => ({ top: chromeTop, bottom: 640, height: 80, width: 390, left: 0, right: 390, x: 0, y: chromeTop, toJSON() {} })
      last.getBoundingClientRect = () => ({ top: lastBottom - 40, bottom: lastBottom, height: 40, width: 360, left: 15, right: 375, x: 15, y: lastBottom - 40, toJSON() {} })
      expect(last.getBoundingClientRect().bottom).toBeLessThan(chrome.getBoundingClientRect().top)
    }

    assertLastClearsChrome()
    fireEvent.click(screen.getByTestId('lab-page-next'))
    assertLastClearsChrome()

    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    })
    assertLastClearsChrome()
    fireEvent.click(screen.getByTestId('lab-hearing-pause'))
    assertLastClearsChrome()
  })

  it('turns the painted page when the follow word is past the last word, not to chapter start', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
    expect(screen.getByTestId('lab-passage-headline')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    const pageTwo = (document.querySelector('.lab-hearing-line')?.textContent || '').trim()
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-hearing')).toBeTruthy()
    })
    expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    expect((document.querySelector('.lab-hearing-stage')?.textContent || '')).toContain(pageTwo.trim().split(/\s+/)[0])
    const words = sourceWithManyWords().followParagraphs[0].words || []
    const lastOnPage = pageTwo.trim().split(/\s+/).filter(Boolean).at(-1)
    const lastIndex = words.findIndex(word => word.text === lastOnPage)
    const nextIndex = lastIndex >= 0 ? lastIndex + 1 : 90
    audio.currentTime = words[Math.min(nextIndex, words.length - 1)]?.start ?? 30
    await act(async () => { audio.emit('timeupdate') })
    await waitFor(() => {
      const shown = (document.querySelector('.lab-hearing-stage')?.textContent || '').trim()
      expect(shown).not.toBe(pageTwo)
      expect(screen.queryByTestId('lab-passage-headline')).toBeNull()
    })
  })

  it('paints every Reading word the same and does not carry a highlight after pause or Next', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)

    const noFollowPaint = () => {
      expect(document.querySelector('.lab-hearing-word.is-current')).toBeNull()
      expect(document.querySelector('.lab-hearing-word.is-upcoming')).toBeNull()
      expect(document.querySelector('.lab-hearing-word.is-spoken')).toBeNull()
      expect(document.querySelector('.lab-hearing-word.is-line')).toBeNull()
      expect(document.querySelector('.lab-word-current')).toBeNull()
      expect(screen.queryByTestId('lab-hearing-current')).toBeNull()
    }
    const readingChrome = () => {
      const book = screen.getByTestId('lab-book')
      expect(book.getAttribute('data-passage-mode')).toBe('reading')
      expect(book.className).toContain('is-reading')
      expect(book.className).not.toContain('is-hearing')
      expect(screen.getByTestId('lab-reading-stage')).toBeTruthy()
      noFollowPaint()
    }

    readingChrome()
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-hearing')).toBeTruthy()
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(document.querySelector('.lab-hearing-word.is-current')).toBeTruthy()

    fireEvent.click(screen.getByTestId('lab-hearing-pause'))
    noFollowPaint()

    fireEvent.click(screen.getByTestId('lab-page-next'))
    noFollowPaint()
    fireEvent.click(screen.getByTestId('lab-page-next'))
    noFollowPaint()
    fireEvent.click(screen.getByTestId('lab-page-next'))
    noFollowPaint()
  })


})



describe('lab page turn identity', () => {
  it('Previous from page 5 lands on page 4 and Next returns to page 5', async () => {
    render(<LabApp pathname="/lab/phone" source={sourceWithFivePages()} />)
    const progress = () => phoneProgressInfo()
    await waitForPhoneProgress()
    expect(progress()).toContain('1 / 5')
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(progress()).toContain('5 / 5')
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    expect(progress()).toContain('4 / 5')
    expect(document.querySelector('.lab-hearing-line')?.textContent).toContain('p3w0')
    fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(progress()).toContain('5 / 5')
    expect(document.querySelector('.lab-hearing-line')?.textContent).toContain('p4w0')
  })

  it('keeps the same N/M denominator while flipping pages', async () => {
    render(<LabApp pathname="/lab/phone" source={sourceWithFivePages()} />)
    const denom = () => {
      const text = phoneProgressInfo()
      const match = text.match(/(\d+)\s*\/\s*(\d+)/)
      return match ? match[2] : ''
    }
    await waitForPhoneProgress()
    const frozen = denom()
    expect(frozen).toBe('5')
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByTestId('lab-page-next'))
      expect(denom()).toBe(frozen)
    }
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    expect(denom()).toBe(frozen)
  })

  it('rapid next/prev 10 times keeps adjacent page text and never shows N>M', () => {
    render(<LabApp pathname="/lab/phone" source={sourceWithFivePages()} />)
    const line = () => (document.querySelector('.lab-hearing-line')?.textContent || '').replace(/Keep this passage/g, '').trim()
    const nm = () => {
      const text = screen.getByTestId('lab-chapter-progress').textContent || ''
      const match = text.match(/(\d+)\s*\/\s*(\d+)/)
      return match ? { n: Number(match[1]), m: Number(match[2]), text } : { n: 0, m: 0, text }
    }
    const forward: string[] = [line()]
    for (let i = 0; i < 10; i++) {
      const btn = screen.queryByTestId('lab-page-next')
      if (!btn) break
      fireEvent.click(btn)
      const now = line()
      expect(now.length).toBeGreaterThan(0)
      forward.push(now)
      const { n, m, text } = nm()
      expect(n).toBeLessThanOrEqual(m)
      expect(text).not.toMatch(/9 \/ 8/)
    }
    expect(forward[0]).toContain('p0w0')
    expect(forward[1]).toContain('p1w0')
    expect(forward[2]).toContain('p2w0')
    expect(forward[3]).toContain('p3w0')
    expect(forward[4]).toContain('p4w0')
    const back: string[] = [line()]
    for (let i = 0; i < 10; i++) {
      const btn = screen.queryByTestId('lab-page-prev')
      if (!btn) break
      fireEvent.click(btn)
      const now = line()
      expect(now.length).toBeGreaterThan(0)
      back.push(now)
      const { n, m } = nm()
      expect(n).toBeLessThanOrEqual(m)
    }
    expect(back.some(text => text.includes('p0w0'))).toBe(true)
    expect(back[0]).toContain('p4w0')
    expect(back[1]).toContain('p3w0')
    expect(nm().text).toMatch(/1 \/ 5/)
  })

  it('Genesis 1 phone: after the page list exists, every page reports the same M', async () => {
    const genesis = JSON.parse(readFileSync(resolve(__dirname, '../../public/data/editions-chapters/bible-kjv-en/ch0001.json'), 'utf8')).paragraphs as string[]
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapterTitle: 'Genesis 1',
      chapterLabel: 'Genesis 1',
      paragraphs: genesis,
      followParagraphs: genesis.map((text, index) => ({ index, text })),
      chapters: [
        { number: 1, title: 'Genesis 1' },
        { number: 2, title: 'Genesis 2' },
      ],
    }} />)
    const nm = () => {
      const text = phoneProgressInfo()
      const match = text.match(/(\d+)\s*\/\s*(\d+)/)
      return match ? { n: Number(match[1]), m: Number(match[2]), text } : { n: 0, m: 0, text }
    }
    await waitForPhoneProgress()
    const first = nm()
    expect(first.m).toBeGreaterThan(1)
    expect(first.n).toBe(1)
    expect(first.n).toBeLessThanOrEqual(first.m)
    expect(first.text).not.toMatch(/9 \/ 8/)
    const totals = new Set<number>([first.m])
    for (let i = 0; i < 40; i++) {
      const now = nm()
      expect(now.n).toBeLessThanOrEqual(now.m)
      expect(now.n).toBeGreaterThan(0)
      expect(now.text).not.toMatch(/9 \/ 8/)
      totals.add(now.m)
      if (now.n >= now.m) break
      const btn = screen.queryByTestId('lab-page-next')
      expect(btn).toBeTruthy()
      fireEvent.click(btn!)
    }
    const last = nm()
    expect(last.n).toBe(last.m)
    const frozen = last.m
    while (nm().n > 1) {
      fireEvent.click(screen.getByTestId('lab-page-prev'))
      const back = nm()
      expect(back.m).toBe(frozen)
      expect(back.n).toBeLessThanOrEqual(back.m)
    }
    expect(nm()).toMatchObject({ n: 1, m: frozen })
    expect(totals.size).toBe(1)
  })
})

describe('lab after-paint shrink', () => {
  function stubTooTallFirstPack() {
    const proto = HTMLElement.prototype
    const original = proto.getBoundingClientRect
    proto.getBoundingClientRect = function getBoundingClientRect() {
      const testid = this.getAttribute?.('data-testid') || ''
      if (
        this.classList?.contains('lab-bottom-chrome') || testid === 'lab-bottom-chrome'
        || this.classList?.contains('lab-phone-bar')
        || this.classList?.contains('lab-page-turn')
        || this.classList?.contains('lab-phone-transport')
        || this.classList?.contains('lab-hearing-transport')
      ) {
        return { top: 400, bottom: 480, height: 80, width: 390, left: 0, right: 390, x: 0, y: 400, toJSON() {} }
      }
      if (this.classList?.contains('lab-hearing-line')) {
        const words = (this.textContent || '').replace(/Keep this passage/g, '').trim().split(/\s+/).filter(Boolean).length
        const lines = Math.max(1, Math.ceil(words / 6))
        const height = lines * 40
        return { top: 160, bottom: 160 + height, height, width: 360, left: 15, right: 375, x: 15, y: 160, toJSON() {} }
      }
      if (this.classList?.contains('lab-passage-headline')) {
        return { top: 80, bottom: 160, height: 80, width: 360, left: 15, right: 375, x: 15, y: 80, toJSON() {} }
      }
      return original.call(this)
    }
    return () => { proto.getBoundingClientRect = original }
  }

  function lineWords() {
    return (document.querySelector('.lab-hearing-line')?.textContent || '')
      .replace(/Keep this passage/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
  }

  it('shrinks a too-tall first pack after paint and moves leftover words to page 2', async () => {
    const restore = stubTooTallFirstPack()
    try {
      render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
      const firstWords = lineWords()
      expect(firstWords.length).toBeGreaterThan(40)
      await waitFor(() => {
        expect(lineWords().length).toBeLessThan(firstWords.length)
      })
      let prev = lineWords().length
      for (let i = 0; i < 12; i++) {
        await act(async () => {
          await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
        })
        const n = lineWords().length
        if (n === prev) break
        prev = n
      }
      const page1 = lineWords()
      expect(page1.length).toBeLessThan(firstWords.length)
      const leftover = firstWords[page1.length]
      expect(leftover).toBeTruthy()
      fireEvent.click(screen.getByTestId('lab-page-next'))
      const page2 = lineWords()
      expect(page2[0]).toBe(leftover)
      expect(page2.join(' ')).not.toBe(page1.join(' '))
    } finally {
      restore()
    }
  })

  it('peels visible overflow after settle when the stub paints ink on the bar', async () => {
    const restore = stubTooTallFirstPack()
    try {
      render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
      const firstWords = lineWords()
      await waitFor(() => {
        expect(lineWords().length).toBeLessThan(firstWords.length)
      })
      let prev = lineWords().length
      let stable = 0
      for (let i = 0; i < 24; i++) {
        await act(async () => {
          await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
        })
        const n = lineWords().length
        if (n === prev) stable += 1
        else {
          stable = 0
          prev = n
        }
        if (stable >= 6) break
      }
      await waitForPhoneProgress()
      const settled = lineWords().join(' ')
      const nm = () => {
        const text = phoneProgressInfo()
        const match = text.match(/(\d+)\s*\/\s*(\d+)/)
        return match ? { n: Number(match[1]), m: Number(match[2]) } : { n: 0, m: 0 }
      }
      const frozenM = nm().m
      expect(frozenM).toBeGreaterThan(1)
      fireEvent.click(screen.getByTestId('lab-page-next'))
      await waitFor(() => {
        expect(lineWords().length).toBeLessThan(80)
      })
      expect(lineWords().join(' ')).not.toBe(settled)
      expect(nm().m).toBeGreaterThanOrEqual(frozenM)
    } finally {
      restore()
    }
  })

  it('keeps last ink above the visible bar, not a lower chrome wrapper', async () => {
    const proto = HTMLElement.prototype
    const original = proto.getBoundingClientRect
    proto.getBoundingClientRect = function getBoundingClientRect() {
      const testid = this.getAttribute?.('data-testid') || ''
      if (this.classList?.contains('lab-phone-bar') || testid === 'lab-phone-bar') {
        return { top: 360, bottom: 420, height: 60, width: 390, left: 0, right: 390, x: 0, y: 360, toJSON() {} }
      }
      if (this.classList?.contains('lab-bottom-chrome') || testid === 'lab-bottom-chrome') {
        return { top: 480, bottom: 560, height: 80, width: 390, left: 0, right: 390, x: 0, y: 480, toJSON() {} }
      }
      if (this.classList?.contains('lab-hearing-line')) {
        const words = (this.textContent || '').replace(/Keep this passage/g, '').trim().split(/\s+/).filter(Boolean).length
        const lines = Math.max(1, Math.ceil(words / 6))
        const height = lines * 40
        return { top: 160, bottom: 160 + height, height, width: 360, left: 15, right: 375, x: 15, y: 160, toJSON() {} }
      }
      if (this.classList?.contains('lab-passage-headline')) {
        return { top: 80, bottom: 160, height: 80, width: 360, left: 15, right: 375, x: 15, y: 80, toJSON() {} }
      }
      return original.call(this)
    }
    try {
      render(<LabApp pathname="/lab/phone" source={sourceWithManyWords()} />)
      const firstWords = lineWords()
      await waitFor(() => {
        expect(lineWords().length).toBeLessThan(firstWords.length)
      })
      const page1 = lineWords()
      expect(page1.length).toBeLessThan(firstWords.length)
      const leftover = firstWords[page1.length]
      fireEvent.click(screen.getByTestId('lab-page-next'))
      expect(lineWords()[0]).toBe(leftover)
    } finally {
      proto.getBoundingClientRect = original
    }
  })

  function genesis1Source() {
    const text = 'In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.'
    return {
      ...bibleFallbackSource(),
      chapterTitle: 'Genesis 1',
      chapterLabel: 'Genesis 1',
      paragraphs: [text],
      followParagraphs: [{ index: 0, text, file: 'p0.mp3', duration: 20 }],
      chapters: [{ number: 1, title: 'Genesis 1' }],
    }
  }

  it('peels Genesis 1 page 1 when last ink is on the phone bar or the passage scrolls', async () => {
    const proto = HTMLElement.prototype
    const original = proto.getBoundingClientRect
    proto.getBoundingClientRect = function getBoundingClientRect() {
      const testid = this.getAttribute?.('data-testid') || ''
      if (
        this.classList?.contains('lab-bottom-chrome') || testid === 'lab-bottom-chrome'
        || this.classList?.contains('lab-phone-bar')
        || this.classList?.contains('lab-page-turn')
      ) {
        return { top: 560, bottom: 640, height: 80, width: 390, left: 0, right: 390, x: 0, y: 560, toJSON() {} }
      }
      if (this.classList?.contains('lab-hearing-line')) {
        const words = (this.textContent || '').replace(/Keep this passage/g, '').trim().split(/\s+/).filter(Boolean).length
        const lines = Math.max(1, Math.ceil(words / 6))
        const height = lines * 36
        return { top: 200, bottom: 200 + height, height, width: 360, left: 15, right: 375, x: 15, y: 200, toJSON() {} }
      }
      if (this.classList?.contains('lab-passage-headline')) {
        return { top: 80, bottom: 200, height: 120, width: 360, left: 15, right: 375, x: 15, y: 80, toJSON() {} }
      }
      return original.call(this)
    }
    const scrollGet = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
    const clientGet = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        if (this.classList?.contains('lab-passage') || this.classList?.contains('lab-page-wrap')) return 480
        return clientGet?.get?.call(this) ?? 0
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        if (this.classList?.contains('lab-passage') || this.classList?.contains('lab-page-wrap')) {
          const words = (this.textContent || '').trim().split(/\s+/).filter(Boolean).length
          return words > 28 ? 487 : 480
        }
        return scrollGet?.get?.call(this) ?? 0
      },
    })
    try {
      render(<LabApp pathname="/lab/phone" source={genesis1Source()} />)
      expect(screen.getByTestId('lab-passage-headline').textContent).toContain('Genesis 1')
      const firstWords = lineWords()
      expect(firstWords.length).toBeGreaterThan(20)
      await waitFor(() => {
        expect(lineWords().length).toBeLessThan(firstWords.length)
      })
      const page1 = lineWords()
      expect(page1.length).toBeGreaterThan(1)
      const leftover = firstWords[page1.length]
      expect(leftover).toBeTruthy()
      fireEvent.click(screen.getByTestId('lab-page-next'))
      expect(lineWords()[0]).toBe(leftover)
    } finally {
      proto.getBoundingClientRect = original
      if (scrollGet) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scrollGet)
      if (clientGet) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientGet)
    }
  })
})


describe('lab chrome pass', () => {
  it('opens the original Tinct TOC from the chapter tap and jumps Talk context', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('manifest.json')) {
        return {
          ok: true,
          json: async () => ({
            chapters: [
              { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
              { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
            ],
            sections: [
              {
                title: 'Old Testament',
                sections: [{ title: 'The Pentateuch', sections: [{ title: 'Genesis', chapters: [1, 2] }] }],
              },
            ],
          }),
        }
      }
      if (url.includes('ch0002.json')) {
        return { ok: true, json: async () => ({ paragraphs: ['Thus the heavens and the earth were finished.'] }) }
      }
      if (url.includes('ch0001.json')) {
        return { ok: true, json: async () => ({ paragraphs: ['In the beginning God created the heaven and the earth.'] }) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapters: [
        { number: 1, title: 'Genesis 1' },
        { number: 2, title: 'Genesis 2' },
      ],
    }} />)
    expect(screen.getByTestId('lab-header-work').textContent).toBe('The Bible')
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 1/)
    expect(screen.getByTestId('lab-header-chapter').textContent).toContain('∨')
    expect(screen.getByTestId('lab-header-chapter').contains(screen.getByTestId('lab-wordmark'))).toBe(false)
    expect(screen.getByTestId('lab-header-chapter').contains(screen.getByTestId('lab-header-work'))).toBe(false)
    expect(screen.getByTestId('lab-wordmark').tagName).not.toBe('BUTTON')
    expect(screen.getByTestId('lab-header-work').tagName).not.toBe('BUTTON')
    fireEvent.click(screen.getByTestId('lab-wordmark'))
    expect(screen.queryByTestId('lab-toc')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-header-work'))
    expect(screen.queryByTestId('lab-toc')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-header-chapter'))
    const toc = screen.getByTestId('lab-toc')
    expect(toc.className).toContain('lab-toc')
    expect(toc.querySelector('.toc-overlay')).toBeTruthy()
    expect(toc.querySelector('.toc-panel')).toBeTruthy()
    expect(toc.querySelector('.toc-close')).toBeTruthy()
    expect(toc.textContent).toContain('Old Testament')
    expect(toc.querySelector('.lab-tree')).toBeTruthy()
    expect(toc.querySelector('.toc-item-number')).toBeNull()
    expect(toc.querySelector('.lab-tree-grid')).toBeNull()
    const expandIfCollapsed = (label: string) => {
      const header = [...toc.querySelectorAll('.toc-section-header')].find(node => node.textContent?.includes(label))
      if (header && !header.classList.contains('toc-section-expanded')) {
        fireEvent.click(header)
      }
    }
    expandIfCollapsed('Old Testament')
    expandIfCollapsed('The Pentateuch')
    expandIfCollapsed('Genesis')
    const genesis2 = [...toc.querySelectorAll('.toc-item')].find(node => node.textContent?.includes('Genesis 2'))
    expect(genesis2).toBeTruthy()
    fireEvent.click(genesis2 as HTMLElement)
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 2/)
    await waitForPhoneProgress()
    expect(phoneProgressInfo()).toMatch(/^\s*1\s*\/\s*\d+\s*$/)
    expect(screen.queryByTestId('lab-toc')).toBeNull()
  })

  function mockTocFetch() {
    return vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      // /api/audio-manifest?path=.../ch2/manifest.json also contains "manifest.json"
      if (url.includes('audio-manifest')) {
        return { ok: true, json: async () => ({ paragraphs: [{ paragraph: 0, file: 'p0.mp3', duration: 4 }] }) }
      }
      if (url.includes('manifest.json')) {
        return {
          ok: true,
          json: async () => ({
            chapters: [
              { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
              { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
            ],
            sections: [
              {
                title: 'Old Testament',
                sections: [{ title: 'The Pentateuch', sections: [{ title: 'Genesis', chapters: [1, 2] }] }],
              },
            ],
          }),
        }
      }
      if (url.includes('ch0002.json')) {
        return { ok: true, json: async () => ({ paragraphs: ['Thus the heavens and the earth were finished.'] }) }
      }
      if (url.includes('ch0001.json')) {
        return { ok: true, json: async () => ({ paragraphs: ['In the beginning God created the heaven and the earth.'] }) }
      }
      return { ok: false, json: async () => ({}) }
    })
  }

  function pickGenesis2() {
    fireEvent.click(screen.getByTestId('lab-header-chapter'))
    const toc = screen.getByTestId('lab-toc')
    const expandIfCollapsed = (label: string) => {
      const header = [...toc.querySelectorAll('.toc-section-header')].find(node => node.textContent?.includes(label))
      if (header && !header.classList.contains('toc-section-expanded')) {
        fireEvent.click(header)
      }
    }
    expandIfCollapsed('Old Testament')
    expandIfCollapsed('The Pentateuch')
    expandIfCollapsed('Genesis')
    const genesis2 = [...toc.querySelectorAll('.toc-item')].find(node => node.textContent?.includes('Genesis 2'))
    expect(genesis2).toBeTruthy()
    fireEvent.click(genesis2 as HTMLElement)
  }

  it('keeps playing after a TOC chapter change when Play was on', async () => {
    const audio = new FakeAudio()
    vi.stubGlobal('Audio', class {
      constructor() { return audio }
    })
    vi.stubGlobal('fetch', mockTocFetch())
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      paragraphs: ['In the beginning God created the heaven and the earth.'],
      followParagraphs: [
        { index: 0, text: 'In the beginning God created the heaven and the earth.', file: 'p0.mp3', duration: 4 },
      ],
      chapters: [
        { number: 1, title: 'Genesis 1' },
        { number: 2, title: 'Genesis 2' },
      ],
    }} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    pickGenesis2()
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 2/)
    await waitFor(() => {
      expect(screen.getByTestId('lab-listen-status').textContent).toBe('playing:0')
    })
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-playing')).toBe('true')
    expect(screen.getByTestId('lab-header-chapter').textContent).not.toMatch(/James/)
  })

  it('stays paused after a TOC chapter change when Play was off', async () => {
    vi.stubGlobal('fetch', mockTocFetch())
    render(<LabApp pathname="/lab/phone" source={{
      ...bibleFallbackSource(),
      chapters: [
        { number: 1, title: 'Genesis 1' },
        { number: 2, title: 'Genesis 2' },
      ],
    }} />)
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    pickGenesis2()
    await waitFor(() => {
      expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2')
    })
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Genesis 2/)
    expect(screen.getByTestId('lab-listen-status').textContent).toBe('stopped')
    expect(screen.getByTestId('lab-listen-status').getAttribute('data-playing')).toBe('false')
  })

  it('hides Play Chat Talk in read fullscreen and keeps the text progress', () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-fullscreen'))
    expect(screen.getByTestId('lab-root').getAttribute('data-fullscreen')).toBe('true')
    expect(screen.queryByTestId('lab-phone-bar')).toBeNull()
    expect(screen.getByTestId('lab-chapter-progress')).toBeTruthy()
    expect(screen.getByTestId('lab-page-turn')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-fullscreen'))
    expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
  })

  it('persists Layout knobs and uses cheap progress formats', async () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)
    await waitForPhoneProgress()
    fireEvent.click(screen.getByTestId('lab-gear'))
    fireEvent.click(screen.getByTestId('lab-settings-layout'))
    fireEvent.click(screen.getByText('Night'))
    expect(screen.getByTestId('lab-root').className).toContain('is-night')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    const line = document.querySelector('.lab-hearing-line')
    const word = document.querySelector('.lab-hearing-word')
    expect(line).toBeTruthy()
    expect(word).toBeTruthy()
    if (line && word) {
      const ink = getComputedStyle(line).color
      expect(ink).not.toBe('rgb(11, 11, 11)')
      expect(getComputedStyle(word).color).toBe(ink)
    }
    fireEvent.click(screen.getByText('%'))
    expect(phoneProgressInfo()).toMatch(/^\d+\s*\/\s*\d+$/)
    expect(phoneProgressInfo()).not.toContain('%')
  })
})


describe('lab reading position', () => {
  it('restores the last settled biblical book on open', async () => {
    resetLabBibleManifestCache()
    localStorage.setItem('tinct-lab-position', JSON.stringify({
      books: {
        romans: {
          bookId: 'romans',
          headerBook: 'Romans',
          chapterNumber: 8,
          sequentialChapter: 1054,
          paragraphIndex: 4,
          wordIndex: 11,
          updatedAt: 40_000,
          deviceId: 'test',
          rev: 3,
        },
      },
      lastSettledBookId: 'romans',
      lastSettledAt: 40_000,
      updatedAt: 40_000,
      deviceId: 'test',
    }))
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('manifest.json')) {
        return { ok: true, json: async () => ({
          chapters: [
            { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
            { number: 1054, title: 'Romans 8', path: 'ch1054.json' },
          ],
        }) }
      }
      if (url.includes('ch1054.json') && url.includes('kjv')) {
        return { ok: true, json: async () => ({ paragraphs: ['There is therefore now no condemnation.'] }) }
      }
      if (url.includes('ch1054.json')) {
        return { ok: true, json: async () => ({ paragraphs: ['So now there is no condemnation.'] }) }
      }
      if (url.includes('threads.json')) {
        return { ok: true, json: async () => ({ characters: [] }) }
      }
      if (url.includes('audio-manifest') || url.includes('lab-position')) {
        return { ok: true, json: async () => ({}) }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab" authToken={null} />)
    const root = screen.getByTestId('lab-root')
    expect(root.getAttribute('data-biblical-book')).toBe('romans')
    expect(root.getAttribute('data-chapter')).toBe('1054')
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/Romans/)
    expect(root.getAttribute('data-place')).toBe('4:11')
    await waitFor(() => {
      expect(screen.getByTestId('lab-passage-headline').textContent).toMatch(/Romans 8/)
    })
  })
})

describe('lab ask history persist', () => {
  function romansSource() {
    return {
      ...bibleFallbackSource(),
      chapterLabel: 'Romans 8',
      chapterTitle: 'Romans 8',
      chapterNumber: 1054,
      headerBook: 'Romans',
      headerChapter: '8',
      paragraphs: ['There is therefore now no condemnation.'],
    }
  }

  it('hydrates the Romans thread on open and hides it on Genesis', () => {
    persistLabTalkTurn({
      id: 'keller',
      role: 'user',
      content: 'What would Keller say about this?',
      timestamp: 1_777_300_000_000,
      isComplete: true,
      source: 'text',
    }, 8, 0, { bookId: 'romans', headerBook: 'Romans' })
    persistLabTalkTurn({
      id: 'g1',
      role: 'user',
      content: 'Who is speaking in the beginning?',
      timestamp: 1_777_300_000_100,
      isComplete: true,
      source: 'text',
    }, 1, 0, { bookId: 'genesis', headerBook: 'Genesis' })

    render(<LabApp pathname="/lab/desktop" source={romansSource()} authToken={null} />)
    openDesktopAsk()
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('Keller')
    expect(screen.queryByText('Who is speaking in the beginning?')).toBeNull()
    cleanup()

    render(<LabApp pathname="/lab/desktop" source={bibleFallbackSource()} authToken={null} />)
    openDesktopAsk()
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('beginning')
    expect(screen.queryByText('Keller')).toBeNull()
    cleanup()

    render(<LabApp pathname="/lab/desktop" source={romansSource()} authToken={null} />)
    openDesktopAsk()
    expect(screen.getByTestId('lab-ask-turn-user').textContent).toContain('Keller')
  })

  it('guest typed Ask does not write cloud history', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('/api/lab-chat') && !String(input).includes('history')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ content: [{ text: 'Paul wrote Romans.' }] }),
        }
      }
      return { ok: false, json: async () => ({}) }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<LabApp pathname="/lab/desktop" source={romansSource()} authToken={null} />)
    openDesktopAsk()
    fireEvent.change(screen.getByPlaceholderText('Ask'), { target: { value: 'Who wrote Romans?' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    expect((await screen.findByTestId('lab-ask-turn-assistant')).textContent).toContain('Paul wrote Romans.')
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/api/lab-chat-history'))).toBe(false)
    expect(localStorage.getItem('tinct:chat-history:lab')).toContain('Who wrote Romans?')
  })
})
