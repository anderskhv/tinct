// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import type { Section } from '../types'
import { LabPhoneBibleTree } from './LabPhoneBibleTree'

afterEach(cleanup)
const sections: Section[] = [{ title: 'Old Testament', sections: [{ title: 'The Pentateuch', sections: [{ title: 'Genesis', chapters: [1, 2] }, { title: 'Exodus', chapters: [3] }] }] }]
const chapters = [{ number: 1, title: 'Genesis 1' }, { number: 2, title: 'Genesis 2' }, { number: 3, title: 'Exodus 1' }]
function renderMap(extra: Partial<ComponentProps<typeof LabPhoneBibleTree>> = {}) {
  return render(<LabPhoneBibleTree title="The Bible" chapters={chapters} currentChapter={1} sections={sections} finishedChapters={new Set()} onSelectChapter={() => {}} onClose={() => {}} {...extra} />)
}

describe('Lab Reading Map', () => {
  it('opens centered on the current book with a single back exit', () => {
    renderMap()
    expect(screen.getByText('Genesis')).toBeTruthy()
    expect(screen.getByTestId('lab-tree-chapter-1').textContent).toContain('Reading now')
    expect(screen.getByTestId('lab-tree-chapter-1').getAttribute('aria-current')).toBe('true')
    expect(screen.getByTestId('lab-tree-chapter-2').getAttribute('aria-current')).toBeNull()
    expect(screen.getByRole('button', { name: 'Back to reader' })).toBeTruthy()
    expect(screen.queryByText('Collapse')).toBeNull()
  })

  it('drills back through the hierarchy and returns to current chapter', () => {
    renderMap()
    fireEvent.click(screen.getByText(/The Pentateuch/))
    fireEvent.click(screen.getByText(/Old Testament/))
    fireEvent.click(screen.getByText(/Contents/))
    expect(screen.getByText('Old Testament')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Current chapter/ }))
    expect(screen.getByTestId('lab-tree-chapter-1')).toBeTruthy()
  })

  it('filters annotations and opens a highlight at its source', () => {
    const onSelectHighlight = vi.fn()
    const highlight = { id: 'h1', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 2, color: 'gold' as const, note: 'Creation begins' }
    renderMap({ highlights: [highlight], onSelectHighlight })
    fireEvent.click(screen.getByText('Highlights'))
    fireEvent.click(screen.getByText('Creation begins'))
    expect(onSelectHighlight).toHaveBeenCalledWith(highlight)
  })

  it('searches chapter titles and conversations', () => {
    renderMap({ conversations: [{ id: 'c1', bookId: 'genesis', chapterNumber: 1, startTimestamp: 1, endTimestamp: 2, preview: 'Why light first?', messages: [{ id: 'm1', role: 'user', content: 'Why light first?', timestamp: 1, bookId: 'genesis' }] }] })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    fireEvent.change(screen.getByPlaceholderText('Search this book'), { target: { value: 'light' } })
    expect(screen.getByText('Chat')).toBeTruthy()
    expect(screen.getByText('Why light first?')).toBeTruthy()
  })

  it('keeps long non-Bible chapter titles as readable rows', () => {
    render(<LabPhoneBibleTree title="The Odyssey" chapters={[{ number: 1, title: 'Book 1 — The gods in council' }]} currentChapter={1} finishedChapters={new Set()} onSelectChapter={() => {}} onClose={() => {}} />)
    expect(screen.getByTestId('lab-tree-chapter-1').textContent).toContain('The gods in council')
  })

  it('opens with the current chapter scrolled into the top third of the list', () => {
    const many = Array.from({ length: 52 }, (_, i) => ({ number: 746 + i, title: `Jeremiah ${i + 1}` }))
    const jeremiah: Section[] = [{ title: 'Old Testament', sections: [{ title: 'Prophecy', sections: [{ title: 'Jeremiah', chapters: many.map(c => c.number) }] }] }]
    // jsdom has no layout: give the body a height and a scroll store, and each row a position by its order.
    const scrollTops = new WeakMap<Element, number>()
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return this.classList.contains('lab-map-body') ? 600 : 0 } })
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', { configurable: true, get() { return scrollTops.get(this) ?? 0 }, set(value: number) { scrollTops.set(this, value) } })
    const rect = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const testId = this.querySelector('[data-testid^="lab-tree-chapter-"]')?.getAttribute('data-testid')
      const top = testId && this.classList.contains('lab-map-chapter') ? (Number(testId.replace('lab-tree-chapter-', '')) - 746) * 60 + 80 : 0
      return { top, bottom: top + 60, left: 0, right: 0, width: 0, height: 60, x: 0, y: top, toJSON() {} } as DOMRect
    })
    renderMap({ title: 'The Bible', chapters: many, sections: jeremiah, currentChapter: 746 + 31 })
    const body = document.querySelector('.lab-map-body') as HTMLElement
    expect(screen.getByText('Jeremiah')).toBeTruthy()
    expect(screen.getByTestId('lab-tree-chapter-777').getAttribute('aria-current')).toBe('true')
    expect(screen.getByTestId('lab-tree-chapter-777').textContent).toContain('Reading now')
    // Row 32 sits 31*60+80 = 1940px down; top third of a 600px body means scrollTop = 1940 - 200.
    expect(body.scrollTop).toBe(1740)
    expect(screen.queryByRole('button', { name: /Current chapter/ })).toBeNull()
    rect.mockRestore()
    delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight
    delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollTop
  })

  it('tells the truth per chapter: finished, in progress with page and date, not started, and counts finished', () => {
    const statuses = new Map([
      [2, { kind: 'finished' as const, finishedAt: Date.UTC(2026, 8, 4, 12) }],
      [3, { kind: 'in-progress' as const, page: 2, totalPages: 5, lastReadAt: Date.UTC(2026, 8, 5, 12) }],
    ])
    renderMap({ statuses, finishedChapters: new Set([2]) })
    expect(screen.getByTestId('lab-tree-chapter-1').textContent).toContain('Reading now')
    expect(screen.getByTestId('lab-tree-chapter-2').textContent).toContain('Finished · Sep 4')
    fireEvent.click(screen.getByText(/The Pentateuch/))
    expect(screen.getByText('1 of 2 finished')).toBeTruthy()
    fireEvent.click(screen.getByText(/Exodus/))
    expect(screen.getByTestId('lab-tree-chapter-3').textContent).toContain('In progress · page 2 of 5 · last read Sep 5')
    fireEvent.click(screen.getByText(/The Pentateuch/))
    fireEvent.click(screen.getByText(/Old Testament/))
    fireEvent.click(screen.getByText(/Contents/))
    // Root header: last activity and the finished share, not a hard-coded "today".
    expect(screen.getByText(/Last read Sep 5 · 33% finished/)).toBeTruthy()
  })

  it('marks and reports the current row in a flat non-Bible contents list', () => {
    const chapters = [{ number: 1, title: 'Book 1' }, { number: 2, title: 'Book 2' }, { number: 3, title: 'Book 3' }]
    const statuses = new Map([[1, { kind: 'finished' as const }]])
    render(<LabPhoneBibleTree title="The Odyssey" chapters={chapters} currentChapter={2} finishedChapters={new Set([1])} statuses={statuses} onSelectChapter={() => {}} onClose={() => {}} />)
    expect(screen.getByTestId('lab-tree-chapter-1').textContent).toContain('Finished')
    expect(screen.getByTestId('lab-tree-chapter-2').getAttribute('aria-current')).toBe('true')
    expect(screen.getByTestId('lab-tree-chapter-2').closest('[data-current="true"]')).toBeTruthy()
    expect(screen.getByTestId('lab-tree-chapter-2').textContent).toContain('Reading now')
    expect(screen.getByTestId('lab-tree-chapter-3').textContent).toContain('Not started')
    expect(screen.queryByRole('button', { name: /Current chapter/ })).toBeNull()
  })

  it('lists highlights under their chapter in a flat non-Bible contents list', () => {
    const onSelectHighlight = vi.fn()
    const chapters = [{ number: 1, title: 'Book 1' }, { number: 2, title: 'Book 2' }, { number: 3, title: 'Book 3' }]
    const highlight = { id: 'h3', chapterNumber: 3, paragraphIndex: 0, fromWord: 2, endParagraphIndex: 0, toWord: 7, color: 'gold' as const }
    render(<LabPhoneBibleTree title="The Odyssey" chapters={chapters} currentChapter={3} finishedChapters={new Set()} highlights={[highlight]} onSelectChapter={() => {}} onSelectHighlight={onSelectHighlight} onClose={() => {}} />)
    const annotation = screen.getByText('Highlighted passage')
    expect(annotation.closest('.lab-map-chapter')?.contains(screen.getByTestId('lab-tree-chapter-3'))).toBe(true)
    expect(screen.getByTestId('lab-tree-chapter-2').closest('.lab-map-chapter')?.querySelector('.lab-map-annotation')).toBeNull()
    fireEvent.click(annotation)
    expect(onSelectHighlight).toHaveBeenCalledWith(highlight)
  })
})
