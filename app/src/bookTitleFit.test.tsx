// @vitest-environment jsdom
/**
 * Titles never overflow their box (Anders, 2026-10-09: "book title on table overflows —
 * solve not for the particulars but the general"). One rule (public/lab/book-title.js):
 * in a small box the short form, then type fitted to the box, an ellipsis only last.
 * Real layout is checked in the browser (one-shelf Playwright run); these hold the rule.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { shortTitle, spineTitleSize, SPINE_EM_PER_CHAR } from '../public/lab/book-title.js'
import { heroTitleStep, HERO_TITLE_STEPS } from '../public/lab/library_2/hero-title.js'
import { LabBookSwitcher } from './lab/LabBookSwitcher'
import type { QuickBookRow } from './preReader/quickBookSwitcher'

const LONG = 'The Beginning of Infinity: Explanations that Transform the World'
const VERY_LONG = 'An Enquiry Concerning the Principles of Morals and the Natural History of Religion Considered at Length'
const lib = (file: string) => readFileSync(resolve(__dirname, '../public/lab/library_2/' + file), 'utf8')

afterEach(cleanup)

describe('the short form', () => {
  it('is the title before a subtitle colon, else the title itself', () => {
    expect(shortTitle(LONG)).toBe('The Beginning of Infinity')
    expect(shortTitle('Frankenstein; or, The Modern Prometheus')).toBe('Frankenstein; or, The Modern Prometheus')
    expect(shortTitle('  Hamlet ')).toBe('Hamlet')
    expect(shortTitle(VERY_LONG)).toBe(VERY_LONG)
    expect(shortTitle(': Only a subtitle')).toBe(': Only a subtitle')
    expect(shortTitle('Ratio 3:2 explained')).toBe('Ratio 3:2 explained')
    expect(shortTitle('')).toBe('')
  })
})

describe('spines', () => {
  it('fit a long title along the spine, and hold the smallest size for an ellipsis', () => {
    // A 300 px spine: the short form fits at a readable size; a very long title hits the floor.
    const size = spineTitleSize(shortTitle(LONG), 300 * 0.68)
    expect(size * shortTitle(LONG).length * SPINE_EM_PER_CHAR).toBeLessThanOrEqual(300 * 0.68 + 0.01)
    expect(size).toBeGreaterThan(7)
    expect(spineTitleSize(VERY_LONG, 300 * 0.68, { min: 7 })).toBe(7)
    expect(spineTitleSize('Emma', 300, { max: 14 })).toBe(14)
  })

  it('the reading table sets the short form in one line, fitted to its length, never past its ends', () => {
    const table = lib('reading-table.js')
    expect(table).toMatch(/const text = shortTitle\(b\.title\)/)
    expect(table).toMatch(/--tl:\$\{spine\.length\}/)
    expect(table).toMatch(/<em\$\{s\.title\}>\$\{esc\(spine\.text\)\}<\/em>/)
    const rule = lib('styles.css').match(/\.rt-spine em\{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/white-space:nowrap/)
    expect(rule).toMatch(/text-overflow:ellipsis/)
    expect(rule).toMatch(/overflow:hidden/)
    expect(rule).toMatch(/calc\(var\(--bh\)\*\.68\/\(var\(--tl,12\)\*\.86\)\)/)
    expect(rule).toMatch(/max-height:76%/)
    expect(rule).not.toMatch(/monospace|Mono/)
  })

  it('the shelf study’s spines carry the short form too', () => {
    const view = lib('bookshelf-view.js')
    expect(view).toMatch(/const spineText=shortTitle\(b\.title\)/)
    expect(view).toMatch(/>\$\{escapeText\(spineText\)\}<\/span><\/span>/)
  })
})

describe('the hero title', () => {
  it('a very long title takes the smallest step, and the box clamps it with an ellipsis', () => {
    expect(heroTitleStep(LONG)).toBe(3)
    expect(heroTitleStep(VERY_LONG)).toBe(HERO_TITLE_STEPS)
    const css = lib('styles.css')
    expect(css).toMatch(/\.rt-title-text\{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:break-word/)
  })
})

describe('My shelf cards', () => {
  it('show the short form, at most three lines, ending in an ellipsis; a long word breaks', () => {
    const rule = lib('styles.css').match(/\.collection-card h2\{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/-webkit-line-clamp:3/)
    expect(rule).toMatch(/overflow:hidden/)
    expect(rule).toMatch(/overflow-wrap:anywhere/)
    expect(lib('app.js')).toMatch(/el\('h2','',shortTitle\(book\.title\)\)/)
    expect(lib('app.js')).toMatch(/el\('h2','',shortTitle\(row\.title\)\)/)
    expect(lib('add-to-tinct.js')).toMatch(/el\('h2','',shortTitle\(book\.title\)\)/)
  })
})

describe('the reader’s book switcher', () => {
  const row = (bookId: string, title: string, extra: Partial<QuickBookRow> = {}): QuickBookRow => ({
    bookId, title, chapterLabel: 'Chapter 5', coverSrc: null, coverSrcSet: null, coverTone: null,
    target: {} as QuickBookRow['target'], lastActiveAt: 1, ...extra,
  })
  const props = { loading: false, error: '', onClose: vi.fn(), onSelect: vi.fn(), onLibrary: vi.fn() }

  it('shows the short form in one line and keeps the whole title as the row’s name', () => {
    render(<LabBookSwitcher {...props} current={{ bookId: 'bible', title: 'The Bible', chapterLabel: 'Genesis 1', coverSrc: '' }} rows={[row('userbook-aa', LONG, { coverSrc: 'data:image/jpeg;base64,AA' })]} />)
    const strong = screen.getByText('The Beginning of Infinity')
    expect(strong.tagName).toBe('STRONG')
    expect(strong.getAttribute('title')).toBe(LONG)
    const css = readFileSync(resolve(__dirname, 'lab/lab.css'), 'utf8')
    const rule = css.match(/\.lab-book-switcher-copy strong \{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/white-space: nowrap/)
    expect(rule).toMatch(/text-overflow: ellipsis/)
  })

  it('takes a painting’s small file for its 32 px cover', () => {
    render(<LabBookSwitcher {...props} current={{ bookId: 'bible', title: 'The Bible', chapterLabel: 'Genesis 1', coverSrc: '' }} rows={[row('to-the-lighthouse', 'To the Lighthouse', {
      coverSrc: '/lab/library_2/assets/to-the-lighthouse.jpg',
      coverSrcSet: '/lab/library_2/assets/thumbs/to-the-lighthouse.webp 240w, /lab/library_2/assets/to-the-lighthouse.jpg 1024w',
    })]} />)
    const img = document.querySelector<HTMLImageElement>('.lab-book-switcher-row:not(.is-active) img')!
    expect(img.getAttribute('src')).toBe('/lab/library_2/assets/to-the-lighthouse.jpg')
    expect(img.getAttribute('sizes')).toBe('32px')
    expect(img.getAttribute('srcset')).toContain('thumbs/to-the-lighthouse.webp 240w')
  })
})
