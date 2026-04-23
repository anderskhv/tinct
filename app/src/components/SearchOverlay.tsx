import { useState, useEffect, useRef, useMemo } from 'react'
import type { Section } from '../types'

interface SearchResult {
  chapterNumber: number
  chapterTitle: string
  sectionTitle?: string
  paragraphIndex: number
  excerpt: string
  matchStart: number
  matchEnd: number
}

interface SearchOverlayProps {
  chapters: { number: number; title: string; paragraphs: string[] }[]
  sections?: Section[]
  currentChapter: number
  onNavigate: (chapter: number, paragraphIndex: number) => void
  onClose: () => void
}

/** Find the section title that contains a given chapter number */
function findSectionForChapter(sections: Section[], chapterNumber: number): string | undefined {
  for (const sec of sections) {
    if (sec.chapters?.includes(chapterNumber)) return sec.title
    if (sec.sections) {
      const found = findSectionForChapter(sec.sections, chapterNumber)
      if (found) return found
    }
  }
  return undefined
}

/** Extract the sentence around a match position, with some context */
function extractExcerpt(text: string, matchIndex: number, queryLength: number): { excerpt: string; matchStart: number; matchEnd: number } {
  // Find sentence boundaries (. ! ? or paragraph start/end)
  const before = text.lastIndexOf('. ', matchIndex)
  const sentenceStart = before >= 0 ? before + 2 : 0

  const after = text.indexOf('. ', matchIndex + queryLength)
  const sentenceEnd = after >= 0 ? after + 1 : text.length

  // Clamp to ~200 chars around match
  const contextStart = Math.max(sentenceStart, matchIndex - 80)
  const contextEnd = Math.min(sentenceEnd, matchIndex + queryLength + 80)

  const excerpt = (contextStart > 0 ? '...' : '') +
    text.slice(contextStart, contextEnd).trim() +
    (contextEnd < text.length ? '...' : '')

  const offset = contextStart > 0 ? 3 : 0 // account for '...'
  const matchStart = matchIndex - contextStart + offset
  const matchEnd = matchStart + queryLength

  return { excerpt, matchStart, matchEnd }
}

export function SearchOverlay({ chapters, sections, currentChapter, onNavigate, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Search with debounce
  const results = useMemo((): SearchResult[] => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    const matches: SearchResult[] = []
    const maxResults = 200

    for (const chapter of chapters) {
      for (let paraIdx = 0; paraIdx < chapter.paragraphs.length; paraIdx++) {
        const para = chapter.paragraphs[paraIdx]
        const paraLower = para.toLowerCase()
        let searchFrom = 0

        // Find all matches in this paragraph
        while (searchFrom < paraLower.length) {
          const matchIndex = paraLower.indexOf(q, searchFrom)
          if (matchIndex < 0) break

          const { excerpt, matchStart, matchEnd } = extractExcerpt(para, matchIndex, q.length)
          const sectionTitle = sections ? findSectionForChapter(sections, chapter.number) : undefined

          matches.push({
            chapterNumber: chapter.number,
            chapterTitle: chapter.title,
            sectionTitle,
            paragraphIndex: paraIdx,
            excerpt,
            matchStart,
            matchEnd,
          })

          if (matches.length >= maxResults) return matches
          searchFrom = matchIndex + q.length
        }
      }
    }

    return matches
  }, [query, chapters, sections])

  // Group results by chapter
  const grouped = useMemo(() => {
    const groups: { chapterNumber: number; chapterTitle: string; sectionTitle?: string; results: SearchResult[] }[] = []
    for (const r of results) {
      const existing = groups.find(g => g.chapterNumber === r.chapterNumber)
      if (existing) {
        existing.results.push(r)
      } else {
        groups.push({
          chapterNumber: r.chapterNumber,
          chapterTitle: r.chapterTitle,
          sectionTitle: r.sectionTitle,
          results: [r],
        })
      }
    }
    return groups
  }, [results])

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.chapterNumber, result.paragraphIndex)
    onClose()
  }

  return (
    <div className="toc-overlay" onClick={onClose}>
      <div className="toc-panel search-panel" onClick={e => e.stopPropagation()}>
        <div className="toc-header">
          <h2 className="toc-title">Search</h2>
          <button className="toc-close" onClick={onClose}>&times;</button>
        </div>

        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search in this book..."
          />
          {query && (
            <button className="search-clear" onClick={() => { setQuery(''); inputRef.current?.focus() }}>
              &times;
            </button>
          )}
        </div>

        {query.trim().length >= 2 && (
          <div className="search-count">
            {results.length === 0
              ? 'No results'
              : `${results.length}${results.length >= 200 ? '+' : ''} result${results.length !== 1 ? 's' : ''}`}
          </div>
        )}

        <div className="toc-list search-results">
          {grouped.map(group => (
            <div key={group.chapterNumber} className="search-group">
              <div className="search-group-header">
                {group.sectionTitle && (
                  <span className="search-section-label">{group.sectionTitle} · </span>
                )}
                <span className="search-chapter-label">{group.chapterTitle}</span>
                <span className="search-group-count">{group.results.length}</span>
              </div>
              {group.results.map((r, i) => (
                <button
                  key={`${r.paragraphIndex}-${i}`}
                  className={`search-result ${r.chapterNumber === currentChapter ? 'search-result-current' : ''}`}
                  onClick={() => handleSelect(r)}
                >
                  <span className="search-excerpt">
                    {r.excerpt.slice(0, r.matchStart)}
                    <mark className="search-match">{r.excerpt.slice(r.matchStart, r.matchEnd)}</mark>
                    {r.excerpt.slice(r.matchEnd)}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
