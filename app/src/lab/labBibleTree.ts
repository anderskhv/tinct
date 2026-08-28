import type { Section } from '../types'
import type { LabChapter } from './labSource'

export const LAB_FINISHED_STORAGE_KEY = 'tinct-lab-finished-chapters'

export type LabTreeKind = 'testament' | 'section' | 'book' | 'chapter'
export type LabTreeMark = 'empty' | 'progress' | 'done'

export interface LabTreeNode {
  key: string
  kind: LabTreeKind
  title: string
  children?: LabTreeNode[]
  chapterNumbers: number[]
  chapterNumber?: number
}

export interface LabTreeChapter {
  number: number
  title: string
}

const SECTION_LABELS: Record<string, string> = {
  'The Gospels': 'Gospels',
  'Pauline Epistles': 'Paul',
}

const FLATTEN_WRAPPERS = new Set(['History', 'Prophecy'])

function slugTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'node'
}

function uniqueKey(path: string[], title: string): string {
  return [...path, slugTitle(title)].join('/')
}

function isBookSection(section: Section): boolean {
  return !!section.chapters?.length && !section.sections?.length
}

function flattenSection(section: Section): Section {
  const kids = section.sections || []
  if (
    FLATTEN_WRAPPERS.has(section.title)
    && !section.chapters?.length
    && kids.length === 1
    && isBookSection(kids[0])
  ) {
    return kids[0]
  }
  return section
}

function displayTitle(title: string): string {
  return SECTION_LABELS[title] || title
}

function allChaptersInSection(section: Section): number[] {
  const result: number[] = []
  if (section.chapters) result.push(...section.chapters)
  if (section.sections) {
    for (const child of section.sections) result.push(...allChaptersInSection(child))
  }
  return result
}

function nodeFromSection(section: Section, path: string[]): LabTreeNode {
  const flat = flattenSection(section)
  const title = displayTitle(flat.title)
  const key = uniqueKey(path, title)
  const chapterNumbers = allChaptersInSection(flat)
  if (isBookSection(flat)) {
    return {
      key,
      kind: 'book',
      title,
      chapterNumbers,
    }
  }
  const kind: LabTreeKind = /testament/i.test(flat.title) || path.length === 0 ? 'testament' : 'section'
  const nextPath = [...path, slugTitle(title)]
  return {
    key,
    kind,
    title,
    chapterNumbers,
    children: (flat.sections || []).map(child => nodeFromSection(child, nextPath)),
  }
}

export function buildLabBibleTree(sections: Section[] | undefined, chapters: LabTreeChapter[]): LabTreeNode[] {
  if (sections && sections.length > 0) {
    return sections.map(section => nodeFromSection(section, []))
  }
  return chapters.map(chapter => ({
    key: `chapter/${chapter.number}`,
    kind: 'chapter' as const,
    title: chapter.title,
    chapterNumbers: [chapter.number],
    chapterNumber: chapter.number,
  }))
}

export function collectBookKeys(nodes: LabTreeNode[]): string[] {
  const keys: string[] = []
  for (const node of nodes) {
    if (node.kind === 'book') keys.push(node.key)
    if (node.children) keys.push(...collectBookKeys(node.children))
  }
  return keys
}

export function findNodeForChapter(nodes: LabTreeNode[], chapterNumber: number): LabTreeNode | null {
  for (const node of nodes) {
    if (node.kind === 'chapter' && node.chapterNumber === chapterNumber) return node
    if (node.kind === 'book' && node.chapterNumbers.includes(chapterNumber)) return node
    if (node.children) {
      const found = findNodeForChapter(node.children, chapterNumber)
      if (found) return found
    }
  }
  return null
}

export function ancestorKeysForChapter(nodes: LabTreeNode[], chapterNumber: number, trail: string[] = []): string[] {
  for (const node of nodes) {
    const next = [...trail, node.key]
    if (node.kind === 'chapter' && node.chapterNumber === chapterNumber) return next
    if (node.kind === 'book' && node.chapterNumbers.includes(chapterNumber)) return next
    if (node.children) {
      const found = ancestorKeysForChapter(node.children, chapterNumber, next)
      if (found.length) return found
    }
  }
  return []
}

export function initialExpandedKeys(nodes: LabTreeNode[], currentChapter: number): Set<string> {
  return new Set(ancestorKeysForChapter(nodes, currentChapter))
}

export function exclusiveToggleBook(
  expanded: Set<string>,
  bookKey: string,
  allBookKeys: string[],
): Set<string> {
  const next = new Set(expanded)
  if (next.has(bookKey)) {
    next.delete(bookKey)
    return next
  }
  for (const key of allBookKeys) next.delete(key)
  next.add(bookKey)
  return next
}

export function toggleExpandedKey(expanded: Set<string>, key: string): Set<string> {
  const next = new Set(expanded)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}

function parseFinishedList(raw: string | null): number[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
  } catch {
    return []
  }
}

export function readFinishedChapters(): Set<number> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    return new Set(parseFinishedList(localStorage.getItem(LAB_FINISHED_STORAGE_KEY)))
  } catch {
    return new Set()
  }
}

export function writeFinishedChapters(finished: Iterable<number>): Set<number> {
  const next = new Set(Array.from(finished).filter(n => Number.isFinite(n)))
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LAB_FINISHED_STORAGE_KEY, JSON.stringify([...next].sort((a, b) => a - b)))
    } catch {
      /* private mode */
    }
  }
  return next
}

export function markChapterFinished(chapterNumber: number, finished = readFinishedChapters()): Set<number> {
  if (!Number.isFinite(chapterNumber)) return finished
  const next = new Set(finished)
  next.add(chapterNumber)
  return writeFinishedChapters(next)
}

export function countFinished(chapterNumbers: number[], finished: Set<number>): number {
  return chapterNumbers.filter(number => finished.has(number)).length
}

export function bookChapterProgress(
  chapterNumbers: number[],
  finished: Set<number>,
): { finished: number; total: number } {
  return { finished: countFinished(chapterNumbers, finished), total: chapterNumbers.length }
}

function childBooks(node: LabTreeNode): LabTreeNode[] {
  if (node.kind === 'book') return [node]
  return (node.children || []).flatMap(childBooks)
}

export function labTreeProgressLabel(node: LabTreeNode, finished: Set<number>): string | null {
  if (node.kind === 'chapter') return null
  if (node.kind === 'book') {
    const { finished: done, total } = bookChapterProgress(node.chapterNumbers, finished)
    if (done <= 0 || total <= 0 || done >= total) return null
    return `${done} of ${total}`
  }
  const books = childBooks(node)
  const doneBooks = books.filter(book => {
    const { finished: done, total } = bookChapterProgress(book.chapterNumbers, finished)
    return total > 0 && done >= total
  }).length
  if (doneBooks <= 0 || books.length <= 0) return null
  return `${doneBooks} of ${books.length} books`
}

export function labTreeMark(
  node: LabTreeNode,
  finished: Set<number>,
  currentChapter: number,
): LabTreeMark {
  if (node.kind === 'chapter') {
    if (node.chapterNumber === currentChapter) return 'progress'
    return finished.has(node.chapterNumber ?? -1) ? 'done' : 'empty'
  }
  const { finished: done, total } = bookChapterProgress(node.chapterNumbers, finished)
  if (node.kind === 'book') {
    if (total > 0 && done >= total) return 'done'
    if (done > 0 || node.chapterNumbers.includes(currentChapter)) return 'progress'
    return 'empty'
  }
  const books = childBooks(node)
  if (books.length > 0 && books.every(book => labTreeMark(book, finished, currentChapter) === 'done')) {
    return 'done'
  }
  return 'empty'
}

export function chapterRowsForBook(
  book: LabTreeNode,
  chapters: LabChapter[],
): LabTreeChapter[] {
  const byNumber = new Map(chapters.map(chapter => [chapter.number, chapter]))
  return book.chapterNumbers.flatMap((number) => {
    const chapter = byNumber.get(number)
    if (!chapter) return []
    return [{ number: chapter.number, title: chapter.title }]
  })
}

export function isNamedTitleList(nodes: LabTreeNode[]): boolean {
  return nodes.length > 0 && nodes.every(node => node.kind === 'chapter')
}
