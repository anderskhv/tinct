import { useState, useMemo } from 'react'
import type { ThreadCharacter, CharacterMention, Language, Section } from '../types'

interface ThreadsProps {
  characters: ThreadCharacter[]
  currentChapter: number
  editionKey: string
  language: Language
  /** Hierarchical sections — when present (e.g. Bible), Cast scopes to the current leaf sub-book. */
  sections?: Section[]
  getMentions: (char: ThreadCharacter, upToChapter?: number) => CharacterMention[]
  onNavigateToChapter: (chapter: number, paragraphIndex?: number, editionKey?: string) => void
  /** Paragraphs currently visible on the page, for page-level character detection */
  visibleParagraphs?: string[]
  visibleParagraphIndices?: number[]
  chapterLabelByNumber?: Record<number, string>
}

type RoleFilter = 'all' | ThreadCharacter['role']
type Prominence = 'major' | 'supporting' | 'minor'

interface LeafBook {
  title: string
  chapters: number[]
  firstChapter: number
}

function flattenLeafBooks(sections?: Section[]): LeafBook[] {
  if (!sections) return []
  const out: LeafBook[] = []
  const walk = (nodes: Section[]) => {
    for (const n of nodes) {
      if (n.chapters && n.chapters.length > 0) {
        out.push({ title: n.title, chapters: n.chapters, firstChapter: n.chapters[0] })
      } else if (n.sections) {
        walk(n.sections)
      }
    }
  }
  walk(sections)
  return out
}

const PROMINENCE_RANK: Record<Prominence, number> = { major: 0, supporting: 1, minor: 2 }

const ROLE_LABEL: Record<ThreadCharacter['role'], string> = {
  mortal: 'Mortal',
  god: 'God',
  creature: 'Creature',
  people: 'People',
  concept: 'Concept',
  narrator: 'Narrator',
}

export function Threads({
  characters,
  currentChapter,
  editionKey,
  language,
  sections,
  getMentions,
  onNavigateToChapter,
  visibleParagraphs,
  visibleParagraphIndices,
  chapterLabelByNumber,
}: ThreadsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [spoilerIds, setSpoilerIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<RoleFilter>('all')
  const [showMinors, setShowMinors] = useState(false)

  const summaryKey = useMemo(() => {
    const valid = ['modern-en', 'kids-en', 'modern-da', 'kids-da']
    if (valid.includes(editionKey)) return editionKey
    return language === 'da' ? 'modern-da' : 'modern-en'
  }, [editionKey, language])

  const leafBooks = useMemo(() => flattenLeafBooks(sections), [sections])
  const isSectioned = leafBooks.length > 0

  const currentSubBook = useMemo(
    () => leafBooks.find(b => b.chapters.includes(currentChapter)) || null,
    [leafBooks, currentChapter]
  )

  // For sectioned books, cap "current chapter" within the current sub-book
  // so spoiler logic doesn't reveal Genesis events when reading 1 Samuel.
  const effectiveCurrentChapter = currentSubBook ? currentChapter : currentChapter

  // Set of chapter numbers that belong to the current sub-book (fast lookup).
  const currentSubBookChapters = useMemo(() => {
    if (!currentSubBook) return null
    return new Set(currentSubBook.chapters)
  }, [currentSubBook])

  // Determine which leaf book contains a given chapter number.
  const bookOfChapter = useMemo(() => {
    const map = new Map<number, LeafBook>()
    for (const b of leafBooks) for (const c of b.chapters) map.set(c, b)
    return map
  }, [leafBooks])

  // Detect which characters are mentioned on the currently visible page.
  // Word-boundary match — substring matching falsely flagged "Eve" inside
  // "nevertheless", "Lord" inside "lords", etc.
  const onPageCharIds = useMemo(() => {
    if (!visibleParagraphs || visibleParagraphs.length === 0) return new Set<string>()
    const pageText = visibleParagraphs.join(' ')
    const ids = new Set<string>()
    for (const char of characters) {
      for (const name of char.searchNames) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (new RegExp(`\\b${escaped}\\b`, 'i').test(pageText)) {
          ids.add(char.id)
          break
        }
      }
    }
    return ids
  }, [visibleParagraphs, characters])

  const filtered = useMemo(() => {
    let chars = characters.filter(c => {
      const chapterNums = Object.keys(c.chapters).map(Number)
      if (currentSubBookChapters) {
        // Sectioned book: include if char appears in current sub-book at all
        // (regardless of whether user has reached those chapters yet — the
        // per-chapter spoiler logic below hides specifics).
        return chapterNums.some(n => currentSubBookChapters.has(n))
      }
      // Non-sectioned book: existing behavior — appeared up to current chapter.
      return chapterNums.some(n => n <= currentChapter)
    })
    if (filter !== 'all') chars = chars.filter(c => c.role === filter)
    return [...chars].sort((a, b) => {
      const aOnPage = onPageCharIds.has(a.id) ? 1 : 0
      const bOnPage = onPageCharIds.has(b.id) ? 1 : 0
      if (aOnPage !== bOnPage) return bOnPage - aOnPage
      const aProm = PROMINENCE_RANK[a.prominence ?? 'supporting']
      const bProm = PROMINENCE_RANK[b.prominence ?? 'supporting']
      if (aProm !== bProm) return aProm - bProm
      // Within same tier: sort by chapter count in current scope
      const scope = currentSubBookChapters
      const count = (c: ThreadCharacter) => Object.keys(c.chapters)
        .map(Number)
        .filter(n => scope ? scope.has(n) : n <= currentChapter)
        .length
      return count(b) - count(a)
    })
  }, [characters, filter, currentChapter, onPageCharIds, currentSubBookChapters])

  // Split into shown (major + supporting) and hidden (minor) for the toggle.
  const visibleChars = useMemo(
    () => filtered.filter(c => (c.prominence ?? 'supporting') !== 'minor'),
    [filtered]
  )
  const minorChars = useMemo(
    () => filtered.filter(c => (c.prominence ?? 'supporting') === 'minor'),
    [filtered]
  )

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const toggleSpoiler = (id: string) => {
    setSpoilerIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderCard = (char: ThreadCharacter) => {
    const isExpanded = expandedId === char.id
    const showSpoilers = spoilerIds.has(char.id)
    const allChapterNums = Object.keys(char.chapters).map(Number).sort((a, b) => a - b)
    const prominence: Prominence = char.prominence ?? 'supporting'
    const isMinor = prominence === 'minor'

    // Scope chapters to current sub-book if sectioned.
    const inScope = currentSubBookChapters
      ? allChapterNums.filter(n => currentSubBookChapters.has(n))
      : allChapterNums
    const visibleChapters = currentSubBookChapters
      ? inScope.filter(n => n <= effectiveCurrentChapter)
      : inScope.filter(n => n <= currentChapter)
    const hiddenChapters = inScope.filter(n => !visibleChapters.includes(n))
    const mentions = isExpanded && !isMinor
      ? getMentions(char, showSpoilers ? undefined : currentChapter)
        .filter(m => currentSubBookChapters ? currentSubBookChapters.has(m.chapter) : true)
      : []
    const visibleParagraphSet = visibleParagraphIndices?.length ? new Set(visibleParagraphIndices) : null
    const onPageMentions = isExpanded && visibleParagraphSet
      ? getMentions(char, currentChapter)
        .filter(m => m.chapter === currentChapter && visibleParagraphSet.has(m.paragraphIndex))
      : []
    const displayName = char.name[language] || char.name.en
    const displayEpithet = char.epithet[language] || char.epithet.en
    const description = char.description?.[language] || char.description?.en
    const isOnPage = onPageCharIds.has(char.id)
    // Skip "Story so far" if every visible chapter has empty summary content
    // (e.g. originals whose broken narratives were stripped — only chapter
    // ranges and description remain).
    const hasAnySummary = visibleChapters.some(num =>
      char.chapters[String(num)]?.[summaryKey] || char.chapters[String(num)]?.['modern-en']
    )
    const hasAnyHiddenSummary = hiddenChapters.some(num =>
      char.chapters[String(num)]?.[summaryKey] || char.chapters[String(num)]?.['modern-en']
    )

    // Cross-book "Also in:" — sub-books (other than current) where this char appears.
    // Spoiler-safe: only show books whose first chapter is <= currentChapter.
    const otherBooks = isSectioned
      ? Array.from(new Set(allChapterNums
          .map(n => bookOfChapter.get(n))
          .filter((b): b is LeafBook => !!b && b !== currentSubBook)))
      : []
    const seenOtherBooks = otherBooks.filter(b => b.firstChapter <= currentChapter)
    const laterOtherBooks = otherBooks.filter(b => b.firstChapter > currentChapter)

    return (
      <div
        key={char.id}
        className={`thread-card ${isExpanded ? 'thread-card-expanded' : ''} ${!isOnPage && visibleParagraphs && visibleParagraphs.length > 0 ? 'thread-card-offpage' : ''} thread-card-${prominence}`}
      >
        <div className="thread-card-header" onClick={() => toggleExpand(char.id)}>
          <div className="thread-card-title">
            <span className="thread-name">{displayName}</span>
            <span className="thread-epithet">{displayEpithet}</span>
          </div>
          <div className="thread-card-meta">
            <span className={`thread-role thread-role-${char.role}`}>
              {ROLE_LABEL[char.role]}
            </span>
            {!isMinor && (
              <span className="thread-chapter-count">
                {visibleChapters.length}/{inScope.length}
              </span>
            )}
            <span className="thread-expand-icon">{isExpanded ? '−' : '+'}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="thread-card-body">
            {char.wikipediaUrl && (
              <a
                className="thread-wiki-link"
                href={char.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read more on Wikipedia
              </a>
            )}

            {description && (
              <p className="thread-description">{description}</p>
            )}

            {!isMinor && visibleChapters.length > 0 && hasAnySummary && (
              <div className="thread-summaries">
                <h5 className="thread-section-title">Story so far</h5>
                {visibleChapters.map(num => {
                  const summary = char.chapters[String(num)]?.[summaryKey]
                    || char.chapters[String(num)]?.['modern-en']
                  const label = currentSubBook
                    ? `${currentSubBook.title} ${currentSubBook.chapters.indexOf(num) + 1}`
                    : (chapterLabelByNumber?.[num] || `Chapter ${num}`)
                  return summary ? (
                    <div key={num} className="thread-summary">
                      <button
                        className="thread-chapter-label"
                        onClick={e => { e.stopPropagation(); onNavigateToChapter(num) }}
                      >
                        {label}
                      </button>
                      <p className="thread-summary-text">{summary}</p>
                    </div>
                  ) : null
                })}
              </div>
            )}

            {onPageMentions.length > 0 && (
              <div className="thread-mentions thread-mentions-current">
                <h5 className="thread-section-title">On this page</h5>
                {onPageMentions.slice(0, 6).map((m, i) => (
                  <button
                    key={`${m.chapter}-${m.paragraphIndex}-${i}`}
                    className="thread-mention"
                    onClick={e => { e.stopPropagation(); onNavigateToChapter(m.chapter, m.paragraphIndex) }}
                  >
                    <span className="thread-mention-chapter">p{m.paragraphIndex + 1}</span>
                    <span className="thread-mention-text">&ldquo;{m.excerpt}&rdquo;</span>
                  </button>
                ))}
              </div>
            )}

            {!isMinor && visibleChapters.length === 0 && !description && (
              <p className="thread-not-yet">
                This character hasn't appeared yet in your reading.
              </p>
            )}

            {!isMinor && hiddenChapters.length > 0 && hasAnyHiddenSummary && !showSpoilers && (
              <button
                className="thread-spoiler-btn"
                onClick={e => { e.stopPropagation(); toggleSpoiler(char.id) }}
              >
                Show later chapters ({hiddenChapters.length} more)
              </button>
            )}

            {!isMinor && showSpoilers && hiddenChapters.length > 0 && hasAnyHiddenSummary && (
              <div className="thread-summaries thread-summaries-spoiler">
                <h5 className="thread-section-title thread-spoiler-label">Later chapters</h5>
                {hiddenChapters.map(num => {
                  const summary = char.chapters[String(num)]?.[summaryKey]
                    || char.chapters[String(num)]?.['modern-en']
                  const label = currentSubBook
                    ? `${currentSubBook.title} ${currentSubBook.chapters.indexOf(num) + 1}`
                    : (chapterLabelByNumber?.[num] || `Chapter ${num}`)
                  return summary ? (
                    <div key={num} className="thread-summary thread-summary-spoiler">
                      <button
                        className="thread-chapter-label"
                        onClick={e => { e.stopPropagation(); onNavigateToChapter(num) }}
                      >
                        {label}
                      </button>
                      <p className="thread-summary-text">{summary}</p>
                    </div>
                  ) : null
                })}
                <button
                  className="thread-spoiler-btn"
                  onClick={e => { e.stopPropagation(); toggleSpoiler(char.id) }}
                >
                  Hide spoilers
                </button>
              </div>
            )}

            {seenOtherBooks.length > 0 && (
              <div className="thread-also-in">
                <span className="thread-also-in-label">Also in:</span>
                {seenOtherBooks.map((b, i) => (
                  <span key={b.title}>
                    {i > 0 && <span className="thread-also-in-sep"> · </span>}
                    <button
                      className="thread-also-in-link"
                      onClick={e => {
                        e.stopPropagation()
                        const firstAppearance = allChapterNums.find(n => b.chapters.includes(n))
                        if (firstAppearance) onNavigateToChapter(firstAppearance)
                      }}
                    >
                      {b.title}
                    </button>
                  </span>
                ))}
              </div>
            )}

            {laterOtherBooks.length > 0 && (
              <div className="thread-also-in thread-also-in-later">
                <span className="thread-also-in-label">Returns later in:</span>
                {laterOtherBooks.map((b, i) => (
                  <span key={b.title}>
                    {i > 0 && <span className="thread-also-in-sep"> · </span>}
                    <span className="thread-also-in-muted">{b.title}</span>
                  </span>
                ))}
              </div>
            )}

            {mentions.length > 0 && (
              <div className="thread-mentions">
                <h5 className="thread-section-title">Appearances in text</h5>
                {mentions.slice(0, 25).map((m, i) => {
                  const label = currentSubBook
                    ? `${currentSubBook.title} ${currentSubBook.chapters.indexOf(m.chapter) + 1}`
                    : (chapterLabelByNumber?.[m.chapter] || `Chapter ${m.chapter}`)
                  return (
                    <button
                      key={i}
                      className="thread-mention"
                      onClick={e => { e.stopPropagation(); onNavigateToChapter(m.chapter, m.paragraphIndex) }}
                    >
                      <span className="thread-mention-chapter">{label}</span>
                      <span className="thread-mention-text">&ldquo;{m.excerpt}&rdquo;</span>
                    </button>
                  )
                })}
                {mentions.length > 25 && (
                  <p className="thread-mention-more">
                    and {mentions.length - 25} more appearances…
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="threads">
      <div className="threads-header">
        <h3>
          Cast
          {currentSubBook && <span className="threads-scope">&nbsp;— {currentSubBook.title}</span>}
        </h3>
        <div className="threads-filters">
          {(['all', 'mortal', 'god', 'creature', 'people', 'concept', 'narrator'] as const).map(f => (
            <button
              key={f}
              className={`threads-filter-btn ${filter === f ? 'threads-filter-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All'
                : f === 'mortal' ? 'Mortals'
                : f === 'god' ? 'Gods'
                : f === 'creature' ? 'Creatures'
                : f === 'people' ? 'Peoples'
                : f === 'concept' ? 'Concepts'
                : 'Narrators'}
            </button>
          ))}
        </div>
      </div>

      <div className="threads-content">
        {filtered.length === 0 ? (
          <div className="threads-empty">
            <p className="threads-empty-text">No characters in this category.</p>
          </div>
        ) : (
          <>
            {visibleChars.map(renderCard)}
            {minorChars.length > 0 && (
              <button
                className="thread-show-more-btn"
                onClick={() => setShowMinors(s => !s)}
              >
                {showMinors ? `Hide ${minorChars.length} minor` : `Show ${minorChars.length} more`}
              </button>
            )}
            {showMinors && minorChars.map(renderCard)}
          </>
        )}
      </div>
    </div>
  )
}
