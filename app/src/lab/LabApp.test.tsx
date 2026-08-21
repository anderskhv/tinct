// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
    words: [
      { text: 'Tell', start: 0, end: 0.5 },
      { text: 'me,', start: 0.5, end: 1 },
      { text: 'O', start: 1, end: 1.4 },
      { text: 'Muse', start: 1.4, end: 2 },
    ],
  })
  return {
    ...base,
    followParagraphs: [first, ...base.paragraphs.slice(1).map((text, index) => ({ index: index + 1, text }))],
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
    expect(document.querySelector('.lab-ask-greeting')?.textContent).toBe('Ask about this page.')
    expect(screen.getByTestId('lab-ask-pane').className).toContain('is-empty')
    expect(screen.queryByRole('heading', { name: 'Ask' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Microphone' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ask' })).toBeNull()
    expect(screen.queryByText('Ready when you are.')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Chat' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Feed' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cast' })).toBeNull()
    expect(document.querySelector('.card-rail')).toBeNull()
    expect(document.querySelector('.panel-tab')).toBeNull()
    expect(document.querySelector('.lab-orb')).toBeNull()
    expect(screen.getByTestId('lab-ask-voice')).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText('Ask about this page.'), { target: { value: 'Who is Calypso?' } })
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

    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} />)
    expect(screen.getByTestId('lab-root').className).toContain('is-desktop')
    expect(screen.getByTestId('lab-ask-pane').className).toContain('is-empty')
    expect(screen.getByTestId('lab-ask-composer')).toBeTruthy()
    expect(document.querySelector('.lab-ask-greeting')?.textContent).toBe('Ask about this page.')
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

  it('can follow a word when the source already has timings', () => {
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    expect(screen.getByTestId('lab-book')).toBeTruthy()
  })
})
