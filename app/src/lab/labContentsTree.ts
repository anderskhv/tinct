import type { Section } from '../types'
import type { LabChapter } from './labSource'
import type { LabChapterStatus } from './labChapterStatus'

export interface ContentsNode {
  id: string
  label: string
  chapter?: number
  children?: ContentsNode[]
}

/** Preserve the manifest's hierarchy and sequential chapter identity. */
export function contentsTree(chapters: LabChapter[], sections: Section[] | undefined, bible: boolean): ContentsNode[] {
  const byNumber = new Map(chapters.map(ch => [ch.number, ch]))
  const used = new Set<number>()
  const leaf = (number: number, parent = ''): ContentsNode[] => {
    const ch = byNumber.get(number)
    if (!ch || used.has(number)) return []
    used.add(number)
    const local = bible && parent && ch.title.startsWith(parent + ' ') ? ch.title.slice(parent.length + 1) : ''
    const prefix = parent.split(' — ')[0]
    const title = prefix && ch.title.startsWith(prefix + ', ') ? ch.title.slice(prefix.length + 2) : ch.title
    return [{ id: 'chapter-' + number, chapter: number, label: /^\d+$/.test(local) ? 'Chapter ' + local : title }]
  }
  const branch = (section: Section, id: string): ContentsNode[] => {
    const children = [
      ...(section.sections || []).flatMap((child, index) => branch(child, id + '-' + index)),
      ...(section.chapters || []).flatMap(number => leaf(number, section.title)),
    ]
    return children.length ? [{ id, label: section.title, children }] : []
  }
  const tree = (sections || []).flatMap((section, index) => branch(section, 'section-' + index))
  const remaining = chapters.flatMap(ch => leaf(ch.number))
  return tree.length ? [...tree, ...remaining] : remaining
}

export function flattenContents(nodes: ContentsNode[], parents: ContentsNode[] = []): Array<ContentsNode & { parents: ContentsNode[] }> {
  return nodes.flatMap(node => [{ ...node, parents }, ...flattenContents(node.children || [], [...parents, node])])
}

/** Use recorded progress, never the illustrative percentages in the design. */
export function contentsPercent(status: LabChapterStatus | undefined, current: boolean, currentPercent?: number): number | null {
  if (status?.kind === 'finished') return 100
  if (current && currentPercent != null && Number.isFinite(currentPercent)) return Math.max(0, Math.min(100, Math.round(currentPercent)))
  if (status?.page && status.totalPages && status.totalPages > 0) return Math.max(0, Math.min(99, Math.round(status.page / status.totalPages * 100)))
  return null
}
