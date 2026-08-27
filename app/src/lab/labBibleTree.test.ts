// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import type { Section } from '../types'
import {
  LAB_FINISHED_STORAGE_KEY,
  ancestorKeysForChapter,
  buildLabBibleTree,
  chapterRowsForBook,
  collectBookKeys,
  exclusiveToggleBook,
  initialExpandedKeys,
  isNamedTitleList,
  labTreeMark,
  labTreeProgressLabel,
  markChapterFinished,
  readFinishedChapters,
  writeFinishedChapters,
} from './labBibleTree'

afterEach(() => {
  try { localStorage.removeItem(LAB_FINISHED_STORAGE_KEY) } catch { /* jsdom */ }
})

const bibleSections: Section[] = [
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
        title: 'The Gospels',
        sections: [
          { title: 'Matthew', chapters: [10, 11] },
        ],
      },
      {
        title: 'History',
        sections: [
          { title: 'Acts', chapters: [20] },
        ],
      },
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
  { number: 10, title: 'Matthew 1' },
  { number: 11, title: 'Matthew 2' },
  { number: 20, title: 'Acts 1' },
  { number: 30, title: 'Romans 1' },
  { number: 31, title: 'Romans 2' },
  { number: 32, title: '1 Corinthians 1' },
]

function tree() {
  return buildLabBibleTree(bibleSections, chapters)
}

function book(title: string) {
  const found = collectBooks(tree()).find(node => node.title === title)
  if (!found) throw new Error(`missing ${title}`)
  return found
}

function collectBooks(nodes: ReturnType<typeof tree>): ReturnType<typeof tree> {
  return nodes.flatMap(node => (
    node.kind === 'book' ? [node] : collectBooks(node.children || [])
  ))
}

describe('lab bible tree model', () => {
  it('builds Testament → section → book, flattening a one-book History into Acts', () => {
    const nodes = tree()
    expect(nodes.map(node => node.title)).toEqual(['Old Testament', 'New Testament'])
    const nt = nodes[1]
    expect(nt.children?.map(child => child.title)).toEqual(['Gospels', 'Acts', 'Paul'])
    expect(nt.children?.[1].kind).toBe('book')
    expect(book('Romans').kind).toBe('book')
    expect(book('Genesis').chapterNumbers).toEqual([1, 2, 3])
  })

  it('keeps Odyssey chapters as named title rows, not a keypad', () => {
    const nodes = buildLabBibleTree(undefined, [
      { number: 1, title: 'Book 1 — The gods in council' },
      { number: 2, title: 'Book 2 — The assembly' },
    ])
    expect(isNamedTitleList(nodes)).toBe(true)
    expect(nodes.map(node => node.title)).toEqual([
      'Book 1 — The gods in council',
      'Book 2 — The assembly',
    ])
    expect(nodes.every(node => node.kind === 'chapter')).toBe(true)
  })

  it('lists named chapter rows for a Bible book', () => {
    const rows = chapterRowsForBook(book('Genesis'), chapters)
    expect(rows.map(row => row.title)).toEqual(['Genesis 1', 'Genesis 2', 'Genesis 3'])
    expect(rows.every(row => !/^\d+$/.test(row.title))).toBe(true)
  })

  it('collapses the last book when another opens', () => {
    const keys = collectBookKeys(tree())
    const genesis = book('Genesis').key
    const romans = book('Romans').key
    const opened = exclusiveToggleBook(new Set([genesis]), romans, keys)
    expect(opened.has(romans)).toBe(true)
    expect(opened.has(genesis)).toBe(false)
    const closed = exclusiveToggleBook(opened, romans, keys)
    expect(closed.has(romans)).toBe(false)
  })

  it('opens the current book and its ancestors', () => {
    const nodes = tree()
    const expanded = initialExpandedKeys(nodes, 30)
    expect(expanded.has(book('Romans').key)).toBe(true)
    expect(ancestorKeysForChapter(nodes, 30).some(key => key.includes('new-testament'))).toBe(true)
    expect(expanded.has(book('Genesis').key)).toBe(false)
  })
})

describe('lab finished chapter marks', () => {
  it('reads and writes tinct-lab-finished-chapters', () => {
    expect(readFinishedChapters().size).toBe(0)
    markChapterFinished(1)
    markChapterFinished(2)
    expect([...readFinishedChapters()].sort((a, b) => a - b)).toEqual([1, 2])
    expect(JSON.parse(localStorage.getItem(LAB_FINISHED_STORAGE_KEY) || '[]')).toEqual([1, 2])
  })

  it('marks a finished book with a check, current/in-progress with a solid, unread with empty', () => {
    const finished = new Set([1, 2, 3])
    expect(labTreeMark(book('Genesis'), finished, 30)).toBe('done')
    expect(labTreeMark(book('Romans'), new Set(), 30)).toBe('progress')
    expect(labTreeMark(book('Exodus'), new Set(), 30)).toBe('empty')
    expect(labTreeMark({
      key: 'chapter/1',
      kind: 'chapter',
      title: 'Genesis 1',
      chapterNumbers: [1],
      chapterNumber: 1,
    }, finished, 30)).toBe('progress')
    expect(labTreeMark({
      key: 'chapter/31',
      kind: 'chapter',
      title: 'Romans 2',
      chapterNumbers: [31],
      chapterNumber: 31,
    }, new Set(), 30)).toBe('empty')
  })

  it('never prints a zero progress count', () => {
    const empty = new Set<number>()
    const ot = tree()[0]
    expect(labTreeProgressLabel(ot, empty)).toBeNull()
    expect(labTreeProgressLabel(book('Genesis'), empty)).toBeNull()
    expect(labTreeProgressLabel(book('Genesis'), new Set([1]))).toBe('1 of 3')
    expect(labTreeProgressLabel(ot, new Set([1, 2, 3]))).toBe('1 of 2 books')
    expect(labTreeProgressLabel(book('Genesis'), new Set([1, 2, 3]))).toBeNull()
  })

  it('replaces a stale finished list instead of merging junk', () => {
    writeFinishedChapters([1])
    writeFinishedChapters([30])
    expect([...readFinishedChapters()]).toEqual([30])
  })
})
