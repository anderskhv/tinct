// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LAB_DESKTOP_PANES, PRODUCTION_DESKTOP_PANES } from './labChrome'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'
import { followParagraphFromManifest } from './labFollow'

afterEach(() => {
  cleanup()
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
    expect(screen.getByRole('heading', { name: 'Ask' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Chat' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Feed' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cast' })).toBeNull()
    expect(document.querySelector('.card-rail')).toBeNull()
    expect(document.querySelector('.panel-tab')).toBeNull()
  })

  it('opens a phone conversation without a transcript', () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} />)

    expect(screen.queryByTestId('lab-ask-pane')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-phone-ask'))

    expect(screen.getByTestId('lab-conversation')).toBeTruthy()
    expect(screen.getByLabelText('Leave the conversation.')).toBeTruthy()
    expect(screen.queryByRole('log')).toBeNull()
    expect(screen.queryByText(/transcript/i)).toBeNull()

    fireEvent.click(screen.getByLabelText('Leave the conversation.'))
    expect(screen.queryByTestId('lab-conversation')).toBeNull()
    expect(screen.getByTestId('lab-book').className).not.toContain('is-dimmed')
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

  it('sends character questions to Ask when online', () => {
    render(<LabApp pathname="/lab/desktop" source={fallbackLabSource()} online />)
    fireEvent.click(screen.getByTestId('lab-in-the-book'))
    fireEvent.click(screen.getByRole('tab', { name: 'People on this page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ask about this person' }))
    expect(screen.getByTestId('lab-ask-notice').textContent).toContain('conversation')
  })

  it('can follow a word when the source already has timings', () => {
    render(<LabApp pathname="/lab/desktop" source={sourceWithWords()} />)
    fireEvent.click(screen.getByTestId('lab-listen'))
    expect(screen.getByTestId('lab-book')).toBeTruthy()
  })
})
