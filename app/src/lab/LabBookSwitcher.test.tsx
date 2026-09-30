// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { LabBookSwitcher } from './LabBookSwitcher'
import type { QuickBookRow } from '../preReader/quickBookSwitcher'

afterEach(cleanup)

const row = (bookId: string, title: string): QuickBookRow => ({
  bookId, title, chapterLabel: 'Chapter 1', coverSrc: null, coverSrcSet: null,
  target: {} as QuickBookRow['target'], lastActiveAt: 1,
})
const current = { bookId: 'bible', title: 'The Bible', chapterLabel: 'Genesis 1', coverSrc: '' }
const props = { current, loading: false, error: '', onClose: vi.fn(), onSelect: vi.fn(), onLibrary: vi.fn() }

it('focuses the current book on open but keeps focus where the reader moved it when the catalogue arrives', () => {
  const view = render(<LabBookSwitcher {...props} rows={[row('bible', 'The Bible')]} />)
  const library = screen.getByRole('button', { name: 'Library' })
  expect(document.activeElement).not.toBe(library)
  library.focus()
  // The full catalogue replaces the fallback rows after the switcher opened.
  view.rerender(<LabBookSwitcher {...props} rows={[row('bible', 'The Bible'), row('hamlet', 'Hamlet')]} />)
  expect(document.activeElement).toBe(library)
})
