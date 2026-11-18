// @vitest-environment jsdom

import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LabPassage } from './LabPassage'
import { LabFootnote, type OpenFootnote } from './LabFootnote'
import { placeFootnotes, type Footnote } from './labFootnotes'

afterEach(cleanup)

const paragraphs = ['Some things in the world do not go as the pastor preaches. Fortunately so.', 'A second paragraph follows here.']
const notes: Footnote[] = [{ id: 'f1', chapter: 4, paragraph: 0, offset: 58, after: 'preaches.', text: 'In the old days people said: it is a pity.' }]

function Harness({ withNotes }: { withNotes: boolean }) {
  const [open, setOpen] = useState<OpenFootnote | null>(null)
  const footnotes = withNotes ? placeFootnotes(notes, 4, paragraphs) : undefined
  return <>
    <LabPassage
      chapterTitle="Four" paragraphs={paragraphs} compareParagraphs={[]} compare={false} mode="reading"
      follow={{ kind: 'none' }} followParagraphs={paragraphs.map((text, index) => ({ index, text }))}
      markedIndexes={new Set<number>()} chapterNumber={4}
      readingPage={{ paragraphIndex: 0, from: 0, to: 12, segments: [{ paragraphIndex: 0, from: 0, to: 12 }, { paragraphIndex: 1, from: 0, to: 5 }] }}
      footnotes={footnotes}
      onFootnote={(note, marker) => { const rect = marker.getBoundingClientRect(); setOpen({ note, x: rect.left, y: rect.bottom, showBelow: true }) }}
    />
    {open && <LabFootnote open={open} onClose={() => setOpen(null)} />}
  </>
}

const words = (root: HTMLElement) => [...root.querySelectorAll('[data-testid="lab-word"]')].map(el => [el.getAttribute('data-paragraph-index'), el.getAttribute('data-word-index'), el.textContent])

describe('footnote marker', () => {
  it('paints a marker after its word and opens the note on click', () => {
    render(<Harness withNotes />)
    const marker = screen.getByTestId('lab-footnote-mark')
    expect(marker.textContent).toBe('1')
    expect(marker.closest('[data-word-index]')).toBeNull()
    expect(marker.closest('.lab-footnote-anchor')?.previousElementSibling?.textContent).toContain('preaches.')
    expect(screen.queryByTestId('lab-footnote')).toBeNull()
    fireEvent.click(marker)
    expect(screen.getByTestId('lab-footnote').textContent).toContain('In the old days people said: it is a pity.')
  })

  it('closes on Escape and on an outside press', () => {
    render(<Harness withNotes />)
    fireEvent.click(screen.getByTestId('lab-footnote-mark'))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByTestId('lab-footnote')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-footnote-mark'))
    fireEvent.pointerDown(document.body)
    expect(screen.queryByTestId('lab-footnote')).toBeNull()
  })

  it('leaves word indexes and word text exactly as without notes', () => {
    const plain = render(<Harness withNotes={false} />)
    const without = words(plain.container)
    cleanup()
    const noted = render(<Harness withNotes />)
    expect(screen.getAllByTestId('lab-footnote-mark')).toHaveLength(1)
    expect(words(noted.container)).toEqual(without)
    expect(without.length).toBeGreaterThan(10)
  })
})
