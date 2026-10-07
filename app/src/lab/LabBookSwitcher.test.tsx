// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { LabBookSwitcher } from './LabBookSwitcher'
import type { QuickBookRow } from '../preReader/quickBookSwitcher'

afterEach(cleanup)

const row = (bookId: string, title: string): QuickBookRow => ({
  bookId, title, chapterLabel: 'Chapter 1', coverSrc: null, coverSrcSet: null, coverTone: null,
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

it('shows an added book by its title, painted cover and house-style chapter', () => {
  const lesMis: QuickBookRow = {
    ...row('pd-pg-135', 'Les Misérables'),
    coverSrc: '/api/public-books/pd-pg-135/cover', coverSrcSet: '/api/public-books/pd-pg-135/cover 1x', coverTone: '#3a4f5c',
  }
  render(<LabBookSwitcher {...props} rows={[lesMis]} />)
  const button = screen.getByRole('button', { name: /Les Misérables/ })
  expect(button.textContent).toContain('Chapter 1')
  expect(button.textContent).not.toContain('pd-pg-135')
  const cover = button.querySelector('.lab-book-switcher-cover')!
  expect(cover.classList.contains('is-fallback')).toBe(false)
  expect(cover.querySelector('img')?.getAttribute('src')).toBe('/api/public-books/pd-pg-135/cover')
})

it('gives a book without art yet the fallback cover in its own tone, for the current book too', () => {
  const unpainted: QuickBookRow = { ...row('pd-pg-135', 'Les Misérables'), coverTone: '#3a4f5c' }
  render(<LabBookSwitcher {...props} current={{ bookId: 'pd-pg-200', title: 'Middlemarch', chapterLabel: 'Chapter 3', coverSrc: '', coverTone: '#5c3a3a' }} rows={[unpainted]} />)
  const covers = [...document.querySelectorAll<HTMLElement>('.lab-book-switcher-cover')]
  expect(covers).toHaveLength(2)
  for (const cover of covers) {
    expect(cover.classList.contains('is-fallback')).toBe(true)
    expect(cover.querySelector('img')).toBeNull()
  }
  expect(covers.map(cover => cover.style.background)).toEqual(['rgb(92, 58, 58)', 'rgb(58, 79, 92)'])
})
