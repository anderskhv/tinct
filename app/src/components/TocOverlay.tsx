import { useState, useEffect, useRef, useCallback } from 'react'
import type { Section } from '../types'

interface TocOverlayProps {
  chapters: { number: number; title: string }[]
  currentChapter: number
  onSelectChapter: (n: number) => void
  onClose: () => void
  /** Optional hierarchical sections for large books */
  sections?: Section[]
  /** When provided, renders a "Preface" entry at the top of the ToC.
   *  Clicking it should re-open the book preface. */
  onShowPreface?: () => void
}

/** Recursively find all chapter numbers under a section tree */
function allChaptersInSection(section: Section): number[] {
  const result: number[] = []
  if (section.chapters) result.push(...section.chapters)
  if (section.sections) {
    for (const sub of section.sections) {
      result.push(...allChaptersInSection(sub))
    }
  }
  return result
}

/** Check if a section (or any of its descendants) contains the given chapter */
function sectionContainsChapter(section: Section, chapter: number): boolean {
  return allChaptersInSection(section).includes(chapter)
}

/** Build a set of section titles that should be auto-expanded (ancestors of current chapter) */
function findExpandedSections(sections: Section[], currentChapter: number): Set<string> {
  const expanded = new Set<string>()
  function walk(secs: Section[], path: string[]) {
    for (const sec of secs) {
      const key = [...path, sec.title].join(' > ')
      if (sectionContainsChapter(sec, currentChapter)) {
        expanded.add(key)
      }
      if (sec.sections) {
        walk(sec.sections, [...path, sec.title])
      }
    }
  }
  walk(sections, [])
  return expanded
}

function SectionNode({
  section,
  depth,
  path,
  chapters,
  currentChapter,
  expanded,
  onToggle,
  onSelectChapter,
  activeRef,
}: {
  section: Section
  depth: number
  path: string[]
  chapters: Map<number, { number: number; title: string }>
  currentChapter: number
  expanded: Set<string>
  onToggle: (key: string) => void
  onSelectChapter: (n: number) => void
  activeRef: React.RefObject<HTMLButtonElement>
}) {
  const key = [...path, section.title].join(' > ')
  const isExpanded = expanded.has(key)
  const hasChildren = !!(section.sections?.length || section.chapters?.length)

  return (
    <div className="toc-section" style={{ '--toc-depth': depth } as React.CSSProperties}>
      <button
        className={`toc-section-header ${isExpanded ? 'toc-section-expanded' : ''}`}
        onClick={() => onToggle(key)}
      >
        <span className={`toc-section-arrow ${isExpanded ? 'toc-arrow-expanded' : ''}`}>
          {hasChildren ? '\u25B8' : ''}
        </span>
        <span className="toc-section-title">{section.title}</span>
      </button>

      {isExpanded && (
        <div className="toc-section-children">
          {section.sections?.map((sub, i) => (
            <SectionNode
              key={i}
              section={sub}
              depth={depth + 1}
              path={[...path, section.title]}
              chapters={chapters}
              currentChapter={currentChapter}
              expanded={expanded}
              onToggle={onToggle}
              onSelectChapter={onSelectChapter}
              activeRef={activeRef}
            />
          ))}
          {section.chapters?.map(chNum => {
            const ch = chapters.get(chNum)
            if (!ch) return null
            const isActive = ch.number === currentChapter
            return (
              <button
                key={ch.number}
                ref={isActive ? activeRef : null}
                className={`toc-item toc-item-nested ${isActive ? 'toc-active' : ''}`}
                style={{ '--toc-depth': depth + 1 } as React.CSSProperties}
                onClick={() => onSelectChapter(ch.number)}
              >
                <span className="toc-item-number">{ch.number}</span>
                <span className="toc-item-title">{ch.title}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function TocOverlay({ chapters, currentChapter, onSelectChapter, onClose, sections, onShowPreface }: TocOverlayProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  // Build expanded state from sections containing the current chapter
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    sections ? findExpandedSections(sections, currentChapter) : new Set()
  )

  const toggleSection = useCallback((key: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  useEffect(() => {
    // Delay scroll slightly so the expanded sections render first
    const timer = setTimeout(() => {
      activeRef.current?.scrollIntoView({ block: 'center' })
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Build a map for quick chapter lookup
  const chapterMap = new Map(chapters.map(ch => [ch.number, ch]))

  const hasSections = sections && sections.length > 0

  return (
    <div className="toc-overlay" onClick={onClose}>
      <div className="toc-panel" onClick={e => e.stopPropagation()}>
        <div className="toc-header">
          <h2 className="toc-title">Table of Contents</h2>
          <button className="toc-close" onClick={onClose}>&times;</button>
        </div>
        <div className="toc-list">
          {onShowPreface && (
            <button
              className="toc-item"
              onClick={() => { onShowPreface(); onClose() }}
            >
              <span className="toc-item-number">·</span>
              <span className="toc-item-title">Preface</span>
            </button>
          )}
          {hasSections ? (
            sections.map((sec, i) => (
              <SectionNode
                key={i}
                section={sec}
                depth={0}
                path={[]}
                chapters={chapterMap}
                currentChapter={currentChapter}
                expanded={expanded}
                onToggle={toggleSection}
                onSelectChapter={(n) => { onSelectChapter(n); onClose() }}
                activeRef={activeRef}
              />
            ))
          ) : (
            chapters.map(ch => (
              <button
                key={ch.number}
                ref={ch.number === currentChapter ? activeRef : null}
                className={`toc-item ${ch.number === currentChapter ? 'toc-active' : ''}`}
                onClick={() => { onSelectChapter(ch.number); onClose() }}
              >
                <span className="toc-item-number">{ch.number}</span>
                <span className="toc-item-title">{ch.title}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
