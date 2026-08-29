import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Section } from '../types'
import type { LabChapter } from './labSource'
import {
  ancestorKeysForChapter,
  buildLabBibleTree,
  chapterRowsForBook,
  collectBookKeys,
  exclusiveToggleBook,
  labTreeMark,
  labTreeProgressLabel,
  toggleExpandedKey,
  type LabTreeMark,
  type LabTreeNode,
} from './labBibleTree'

interface LabPhoneBibleTreeProps {
  title: string
  chapters: LabChapter[]
  currentChapter: number
  sections?: Section[]
  finishedChapters: Set<number>
  onSelectChapter: (number: number) => void
  onWarmChapter?: (number: number) => void
  onClose: () => void
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`lab-tree-chevron${open ? ' is-open' : ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <path
        d="M4.2 2.4 8.2 6 4.2 9.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TreeMark({ mark }: { mark: LabTreeMark }) {
  if (mark === 'done') {
    return (
      <span className="lab-tree-mark is-done" data-mark="done" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path
            d="M3 7.2 5.8 10 11 3.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }
  return (
    <span
      className={`lab-tree-mark ${mark === 'progress' ? 'is-progress' : 'is-empty'}`}
      data-mark={mark}
      aria-hidden="true"
    />
  )
}

function TreeRow({
  node,
  depth = 0,
  chapters,
  currentChapter,
  finished,
  expanded,
  onToggle,
  onSelectChapter,
  onWarmChapter,
  scrollRef,
}: {
  node: LabTreeNode
  depth?: number
  chapters: LabChapter[]
  currentChapter: number
  finished: Set<number>
  expanded: Set<string>
  onToggle: (node: LabTreeNode) => void
  onSelectChapter: (number: number) => void
  onWarmChapter?: (number: number) => void
  scrollRef: React.RefObject<HTMLButtonElement | null>
}) {
  const isOpen = expanded.has(node.key)
  const mark = labTreeMark(node, finished, currentChapter)
  const isCurrentBook = node.kind === 'book' && node.chapterNumbers.includes(currentChapter)
  const currentBookProgress = isCurrentBook
    ? `Chapter ${node.chapterNumbers.indexOf(currentChapter) + 1} of ${node.chapterNumbers.length}`
    : null
  const progress = currentBookProgress || labTreeProgressLabel(node, finished)
  const depthClass = `is-depth-${Math.min(depth, 3)}`
  const headerClass = [
    'lab-tree-row',
    'toc-section-header',
    depthClass,
    isOpen ? 'toc-section-expanded is-expanded' : '',
    isCurrentBook ? 'is-current' : '',
    `is-${node.kind}`,
  ].filter(Boolean).join(' ')

  if (node.kind === 'chapter') {
    const isCurrentChapter = node.chapterNumber === currentChapter
    return (
      <button
        type="button"
        ref={isCurrentChapter ? scrollRef : null}
        className={`lab-tree-row toc-item lab-tree-chapter ${depthClass}`}
        data-testid={`lab-tree-chapter-${node.chapterNumber}`}
        data-kind="chapter"
        data-mark={mark}
        onClick={() => { if (node.chapterNumber != null) onSelectChapter(node.chapterNumber) }}
        onPointerEnter={() => { if (node.chapterNumber != null) onWarmChapter?.(node.chapterNumber) }}
        onFocus={() => { if (node.chapterNumber != null) onWarmChapter?.(node.chapterNumber) }}
      >
        <span className="lab-tree-label">{node.title}</span>
        <TreeMark mark={mark} />
      </button>
    )
  }

  const bookChapters = node.kind === 'book' && isOpen ? chapterRowsForBook(node, chapters) : []

  return (
    <div className={`lab-tree-node is-${node.kind}`} data-testid={`lab-tree-node-${node.key}`}>
      <button
        type="button"
        className={headerClass}
        data-testid={`lab-tree-${node.kind}-${node.key}`}
        data-kind={node.kind}
        data-mark={mark}
        aria-expanded={isOpen}
        onClick={() => onToggle(node)}
      >
        <Chevron open={isOpen} />
        <span className="lab-tree-label">{node.title}</span>
        {progress && <span className="lab-tree-progress">{progress}</span>}
        <TreeMark mark={mark} />
      </button>
      {isOpen && (
        <div className="lab-tree-children">
          {node.children?.map(child => (
            <TreeRow
              key={child.key}
              node={child}
              depth={depth + 1}
              chapters={chapters}
              currentChapter={currentChapter}
              finished={finished}
              expanded={expanded}
              onToggle={onToggle}
              onSelectChapter={onSelectChapter}
              onWarmChapter={onWarmChapter}
              scrollRef={scrollRef}
            />
          ))}
          {bookChapters.map(chapter => (
            <button
              key={chapter.number}
              type="button"
              ref={chapter.number === currentChapter ? scrollRef : null}
              className={`lab-tree-row toc-item lab-tree-chapter is-depth-${Math.min(depth + 1, 3)}`}
              data-testid={`lab-tree-chapter-${chapter.number}`}
              data-kind="chapter"
              data-mark={labTreeMark({
                key: `chapter/${chapter.number}`,
                kind: 'chapter',
                title: chapter.title,
                chapterNumbers: [chapter.number],
                chapterNumber: chapter.number,
              }, finished, currentChapter)}
              onClick={() => onSelectChapter(chapter.number)}
              onPointerEnter={() => onWarmChapter?.(chapter.number)}
              onFocus={() => onWarmChapter?.(chapter.number)}
            >
              <span className="lab-tree-label">{chapter.title}</span>
              <TreeMark mark={labTreeMark({
                key: `chapter/${chapter.number}`,
                kind: 'chapter',
                title: chapter.title,
                chapterNumbers: [chapter.number],
                chapterNumber: chapter.number,
              }, finished, currentChapter)} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function LabPhoneBibleTree({
  title,
  chapters,
  currentChapter,
  sections,
  finishedChapters,
  onSelectChapter,
  onWarmChapter,
  onClose,
}: LabPhoneBibleTreeProps) {
  const tree = useMemo(() => buildLabBibleTree(sections, chapters), [sections, chapters])
  const bookKeys = useMemo(() => collectBookKeys(tree), [tree])
  const [expanded, setExpanded] = useState<Set<string>>(() => (
    new Set(ancestorKeysForChapter(tree, currentChapter))
  ))
  const scrollRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useLayoutEffect(() => {
    scrollRef.current?.scrollIntoView?.({ block: 'center' })
  }, [expanded, currentChapter])

  const onToggle = (node: LabTreeNode) => {
    if (node.kind === 'book') {
      setExpanded(prev => exclusiveToggleBook(prev, node.key, bookKeys))
      return
    }
    setExpanded(prev => toggleExpandedKey(prev, node.key))
  }

  return (
    <div className="toc-overlay lab-tree" data-testid="lab-bible-tree" onClick={onClose}>
      <div className="toc-panel lab-tree-panel" onClick={event => event.stopPropagation()}>
        <div className="lab-tree-header">
          <h2 className="lab-tree-title">{title}</h2>
          <button type="button" className="toc-close lab-tree-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="lab-tree-list">
          {tree.map(node => (
            <TreeRow
              key={node.key}
              node={node}
              depth={0}
              chapters={chapters}
              currentChapter={currentChapter}
              finished={finishedChapters}
              expanded={expanded}
              onToggle={onToggle}
              onSelectChapter={onSelectChapter}
              onWarmChapter={onWarmChapter}
              scrollRef={scrollRef}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
