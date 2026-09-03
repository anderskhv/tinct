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
    expect(screen.getByTestId('lab-tree-chapter-1').textContent).toContain('Current chapter')
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
})
