// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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

it('keeps the Library row outside the scrolling list so many books never push it out of view', () => {
  const many = Array.from({ length: 12 }, (_, index) => row(`book-${index}`, `Book ${index}`))
  render(<LabBookSwitcher {...props} rows={many} />)
  const library = screen.getByRole('button', { name: 'Library' })
  const list = document.querySelector('.lab-book-switcher-list')!
  expect(list.contains(library)).toBe(false)
  expect(library.parentElement?.classList.contains('lab-book-switcher')).toBe(true)
  // The sheet is a column whose list alone scrolls; head and Library never shrink.
  const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
  const rule = (selector: string) => css.match(new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`))?.[1] ?? ''
  expect(rule('.lab-book-switcher')).toMatch(/display:\s*flex/)
  expect(rule('.lab-book-switcher')).toMatch(/flex-direction:\s*column/)
  expect(rule('.lab-book-switcher-list')).toMatch(/min-height:\s*0/)
  expect(rule('.lab-book-switcher-list')).toMatch(/overflow-y:\s*auto/)
  expect(css).not.toMatch(/\.lab-book-switcher-list\s*\{[^}]*max-height/)
  expect(rule('.lab-book-switcher-head, .lab-book-switcher-library')).toMatch(/flex:\s*none/)
})
