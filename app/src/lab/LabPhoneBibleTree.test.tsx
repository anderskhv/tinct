// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Section } from '../types'
import { LabPhoneBibleTree } from './LabPhoneBibleTree'
import { LAB_FINISHED_STORAGE_KEY } from './labBibleTree'

afterEach(() => {
  cleanup()
  try { localStorage.removeItem(LAB_FINISHED_STORAGE_KEY) } catch { /* jsdom */ }
})

const sections: Section[] = [
  {
    title: 'Old Testament',
    sections: [
      {
        title: 'The Pentateuch',
        sections: [
          { title: 'Genesis', chapters: [1, 2, 3] },
          { title: 'Exodus', chapters: [4, 5] },
        ],
      },
    ],
  },
  {
    title: 'New Testament',
    sections: [
      {
        title: 'Pauline Epistles',
        sections: [
          { title: 'Romans', chapters: [30, 31] },
          { title: '1 Corinthians', chapters: [32] },
        ],
      },
    ],
  },
]

const chapters = [
  { number: 1, title: 'Genesis 1' },
  { number: 2, title: 'Genesis 2' },
  { number: 3, title: 'Genesis 3' },
  { number: 4, title: 'Exodus 1' },
  { number: 5, title: 'Exodus 2' },
  { number: 30, title: 'Romans 1' },
  { number: 31, title: 'Romans 2' },
  { number: 32, title: '1 Corinthians 1' },
]

function renderTree(opts?: {
  currentChapter?: number
  finished?: number[]
  chapterSignals?: Record<number, { highlights: number; chats: number }>
  onSelectChapter?: (n: number) => void
}) {
  return render(
    <div className="lab-toc" data-testid="lab-toc">
      <LabPhoneBibleTree
        title="The Bible"
        chapters={chapters}
        currentChapter={opts?.currentChapter ?? 30}
        sections={sections}
        finishedChapters={new Set(opts?.finished ?? [1])}
        chapterSignals={opts?.chapterSignals}
        onSelectChapter={opts?.onSelectChapter ?? (() => {})}
        onClose={() => {}}
      />
    </div>,
  )
}

function row(label: string) {
  return [...document.querySelectorAll('.lab-tree-row')].find(node => (
    node.textContent?.includes(label) && !node.classList.contains('lab-tree-chapter')
  )) as HTMLElement
}

function expand(label: string) {
  const header = row(label)
  if (header && !header.classList.contains('is-expanded')) fireEvent.click(header)
  return header
}

describe('lab phone bible tree', () => {
  it('centers Jeremiah only on open and does not pull back while expanding Genesis', () => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    try {
      renderTree({ currentChapter: 30 })
      expect(scrollIntoView).toHaveBeenCalledTimes(1)
      fireEvent.click(row('Old Testament'))
      fireEvent.click(row('The Pentateuch'))
      fireEvent.click(row('Genesis'))
      expect(scrollIntoView).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('lab-tree-chapter-3').textContent).toContain('Genesis 3')
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', original)
      else delete (HTMLElement.prototype as { scrollIntoView?: unknown }).scrollIntoView
    }
  })

  it('shows books first and named chapter rows, never a number keypad', () => {
    renderTree({ currentChapter: 1, finished: [1] })
    const toc = screen.getByTestId('lab-bible-tree')
    expect(toc.textContent).toContain('The Bible')
    expect(toc.textContent).toContain('Old Testament')
    expect(toc.textContent).toContain('Genesis')
    expect(toc.querySelector('.toc-item-number')).toBeNull()
    expect(toc.querySelector('.lab-tree-grid')).toBeNull()
    expect(getComputedStyle(toc.querySelector('.lab-tree-list') as Element).display).not.toBe('grid')
    expand('Old Testament')
    expand('The Pentateuch')
    expand('Genesis')
    expect(screen.getByTestId('lab-tree-chapter-1').textContent).toContain('Genesis 1')
    expect(screen.getByTestId('lab-tree-chapter-2').textContent).toContain('Genesis 2')
    const chapterLabels = [...toc.querySelectorAll('.lab-tree-chapter .lab-tree-label')].map(node => node.textContent)
    expect(chapterLabels).toEqual(['Genesis 1', 'Genesis 2', 'Genesis 3'])
    expect(chapterLabels.every(label => !/^\d+$/.test(label || ''))).toBe(true)
    expect(toc.querySelectorAll('.lab-tree-chapter')).toHaveLength(3)
  })

  it('collapses the last book when another opens', () => {
    renderTree({ currentChapter: 1 })
    expand('Old Testament')
    expand('The Pentateuch')
    expand('Genesis')
    expect(screen.getByTestId('lab-tree-chapter-2').textContent).toContain('Genesis 2')
    expand('New Testament')
    expand('Paul')
    fireEvent.click(row('Romans'))
    expect(screen.getByTestId('lab-tree-chapter-30').textContent).toContain('Romans 1')
    expect(screen.queryByTestId('lab-tree-chapter-2')).toBeNull()
    expect(row('Genesis').classList.contains('is-expanded')).toBe(false)
    expect(row('Romans').classList.contains('is-expanded')).toBe(true)
  })

  it('marks finished and current chapters from real finished storage', () => {
    renderTree({ currentChapter: 30, finished: [1, 30] })
    expand('Old Testament')
    expand('The Pentateuch')
    expect(row('Genesis').getAttribute('data-mark')).toBe('progress')
    expand('Genesis')
    expect(screen.getByTestId('lab-tree-chapter-1').getAttribute('data-mark')).toBe('done')
    expect(screen.getByTestId('lab-tree-chapter-2').getAttribute('data-mark')).toBe('empty')
    expand('New Testament')
    expand('Paul')
    expect(row('Romans').classList.contains('is-current')).toBe(true)
    expect(row('Romans').getAttribute('data-mark')).toBe('progress')
    fireEvent.click(row('Romans'))
    expect(screen.getByTestId('lab-tree-chapter-30').getAttribute('data-mark')).toBe('progress')
    expect(screen.getByTestId('lab-tree-chapter-31').getAttribute('data-mark')).toBe('empty')
  })

  it('shows quiet chat and highlight signals on chapters and collapsed ancestors', () => {
    renderTree({
      currentChapter: 30,
      chapterSignals: {
        2: { highlights: 2, chats: 0 },
        3: { highlights: 0, chats: 1 },
      },
    })
    const oldTestament = row('Old Testament')
    expect(oldTestament.querySelector('.lab-tree-signal.is-highlight')).toBeTruthy()
    expect(oldTestament.querySelector('.lab-tree-signal.is-chat')).toBeTruthy()
    fireEvent.click(oldTestament)
    expand('The Pentateuch')
    expand('Genesis')
    expect(screen.getByTestId('lab-tree-chapter-2').querySelector('.is-highlight')).toBeTruthy()
    expect(screen.getByTestId('lab-tree-chapter-3').querySelector('.is-chat')).toBeTruthy()
  })

  it('uses a checkmark when every chapter in a book is finished', () => {
    renderTree({ currentChapter: 30, finished: [1, 2, 3] })
    expand('Old Testament')
    expand('The Pentateuch')
    expect(row('Genesis').getAttribute('data-mark')).toBe('done')
    expect(row('Genesis').querySelector('.lab-tree-mark.is-done')).toBeTruthy()
    expect(row('Old Testament').textContent).toContain('1 of 2 books')
    expect(row('The Pentateuch').textContent).not.toMatch(/0 of /)
  })

  it('keeps Odyssey chapters as title rows', () => {
    render(
      <LabPhoneBibleTree
        title="The Odyssey"
        chapters={[
          { number: 1, title: 'Book 1 — The gods in council' },
          { number: 2, title: 'Book 2 — The assembly' },
        ]}
        currentChapter={1}
        finishedChapters={new Set()}
        onSelectChapter={() => {}}
        onClose={() => {}}
      />,
    )
    expect(screen.getByTestId('lab-tree-chapter-1').textContent).toContain('Book 1 — The gods in council')
    expect(screen.getByTestId('lab-tree-chapter-2').textContent).toContain('Book 2 — The assembly')
    expect(document.querySelector('.toc-item-number')).toBeNull()
  })

  it('lets the current book collapse in place without a global Collapse button', () => {
    renderTree({ currentChapter: 30 })
    expect(screen.queryByTestId('lab-tree-collapse')).toBeNull()
    const romans = screen.getByTestId('lab-tree-book-new-testament/paul/romans')
    expect(romans.textContent).toContain('Chapter 1 of 2')
    expect(screen.getByTestId('lab-tree-chapter-30')).toBeTruthy()
    fireEvent.click(romans)
    expect(screen.queryByTestId('lab-tree-chapter-30')).toBeNull()
    expect(romans.getAttribute('aria-expanded')).toBe('false')
  })

  it('uses SVG chevrons and one Garamond stack in the tree', () => {
    renderTree()
    const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
    const treeCss = css.split('.lab-tree')[1] ? css.slice(css.indexOf('.lab-tree')) : css
    expect(screen.getByTestId('lab-bible-tree').querySelector('svg.lab-tree-chevron')).toBeTruthy()
    expect(screen.getByTestId('lab-bible-tree').textContent).not.toMatch(/^[vV]$/m)
    expect(css).toMatch(/\.lab-tree[^{]*\{[^}]*font-family:\s*'EB Garamond', Georgia, 'Times New Roman', serif/)
    expect(css).toMatch(/\.lab-tree-row[^{]*\{[^}]*font-family:\s*'EB Garamond', Georgia, 'Times New Roman', serif/)
    expect(css).toMatch(/\.lab-tree-progress[^{]*\{[^}]*font-family:\s*'EB Garamond', Georgia, 'Times New Roman', serif/)
    expect(css).not.toMatch(/\.lab-tree[^{]*\{[^}]*system-ui/)
    expect(css).not.toMatch(/\.lab-tree[^{]*\{[^}]*IBM Plex/)
    expect(css).not.toMatch(/\.lab-tree[^{]*\{[^}]*ui-sans-serif/)
    expect(css).not.toMatch(/\.lab-tree[^{]*\{[^}]*ui-monospace/)
    expect(treeCss).not.toMatch(/grid-template-columns:\s*repeat\(\s*6/)
    expect(css).not.toMatch(/\.lab-tree-list[^{]*\{[^}]*grid-template-columns/)
    expect(css).not.toMatch(/\.lab-tree-children[^{]*\{[^}]*grid-template-columns/)
  })
})
