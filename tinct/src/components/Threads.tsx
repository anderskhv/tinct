import { useState, useMemo } from 'react'
import type { ThreadCharacter, CharacterMention, Language } from '../types'

interface ThreadsProps {
  characters: ThreadCharacter[]
  currentChapter: number
  editionKey: string
  language: Language
  getMentions: (char: ThreadCharacter, upToChapter?: number) => CharacterMention[]
  onNavigateToChapter: (chapter: number) => void
}

export function Threads({
  characters,
  currentChapter,
  editionKey,
  language,
  getMentions,
  onNavigateToChapter,
}: ThreadsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [spoilerIds, setSpoilerIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'mortal' | 'god' | 'creature'>('all')

  const summaryKey = useMemo(() => {
    const valid = ['modern-en', 'kids-en', 'modern-da', 'kids-da']
    if (valid.includes(editionKey)) return editionKey
    return language === 'da' ? 'modern-da' : 'modern-en'
  }, [editionKey, language])

  const filtered = useMemo(() => {
    let chars = characters
    if (filter !== 'all') chars = chars.filter(c => c.role === filter)
    return [...chars].sort((a, b) => {
      const aChapters = Object.keys(a.chapters).map(Number).filter(n => n <= currentChapter)
      const bChapters = Object.keys(b.chapters).map(Number).filter(n => n <= currentChapter)
      return bChapters.length - aChapters.length
    })
  }, [characters, filter, currentChapter])

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

  return (
    <div className="threads">
      <div className="threads-header">
        <h3>Threads</h3>
        <div className="threads-filters">
          {(['all', 'mortal', 'god', 'creature'] as const).map(f => (
            <button
              key={f}
              className={`threads-filter-btn ${filter === f ? 'threads-filter-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'mortal' ? 'Mortals' : f === 'god' ? 'Gods' : 'Creatures'}
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
          filtered.map(char => {
            const isExpanded = expandedId === char.id
            const showSpoilers = spoilerIds.has(char.id)
            const chapterNums = Object.keys(char.chapters).map(Number).sort((a, b) => a - b)
            const visibleChapters = chapterNums.filter(n => n <= currentChapter)
            const hiddenChapters = chapterNums.filter(n => n > currentChapter)
            const mentions = isExpanded ? getMentions(char, showSpoilers ? undefined : currentChapter) : []
            const displayName = char.name[language] || char.name.en
            const displayEpithet = char.epithet[language] || char.epithet.en

            return (
              <div key={char.id} className={`thread-card ${isExpanded ? 'thread-card-expanded' : ''}`}>
                <div className="thread-card-header" onClick={() => toggleExpand(char.id)}>
                  <div className="thread-card-title">
                    <span className="thread-name">{displayName}</span>
                    <span className="thread-epithet">{displayEpithet}</span>
                  </div>
                  <div className="thread-card-meta">
                    <span className={`thread-role thread-role-${char.role}`}>
                      {char.role === 'mortal' ? 'Mortal' : char.role === 'god' ? 'God' : 'Creature'}
                    </span>
                    <span className="thread-chapter-count">
                      {visibleChapters.length}/{chapterNums.length}
                    </span>
                    <span className="thread-expand-icon">{isExpanded ? '\u2212' : '+'}</span>
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
                        Read on Wikipedia \u2192
                      </a>
                    )}

                    {visibleChapters.length > 0 ? (
                      <div className="thread-summaries">
                        <h5 className="thread-section-title">Story so far</h5>
                        {visibleChapters.map(num => {
                          const summary = char.chapters[String(num)]?.[summaryKey]
                            || char.chapters[String(num)]?.['modern-en']
                          return summary ? (
                            <div key={num} className="thread-summary">
                              <span
                                className="thread-chapter-label"
                                onClick={e => { e.stopPropagation(); onNavigateToChapter(num) }}
                              >
                                Book {num}
                              </span>
                              <p className="thread-summary-text">{summary}</p>
                            </div>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <p className="thread-not-yet">
                        This character hasn't appeared yet in your reading.
                      </p>
                    )}

                    {hiddenChapters.length > 0 && !showSpoilers && (
                      <button
                        className="thread-spoiler-btn"
                        onClick={e => { e.stopPropagation(); toggleSpoiler(char.id) }}
                      >
                        Show what happens later ({hiddenChapters.length} more {hiddenChapters.length === 1 ? 'book' : 'books'})
                      </button>
                    )}

                    {showSpoilers && hiddenChapters.length > 0 && (
                      <div className="thread-summaries thread-summaries-spoiler">
                        <h5 className="thread-section-title thread-spoiler-label">Later chapters</h5>
                        {hiddenChapters.map(num => {
                          const summary = char.chapters[String(num)]?.[summaryKey]
                            || char.chapters[String(num)]?.['modern-en']
                          return summary ? (
                            <div key={num} className="thread-summary thread-summary-spoiler">
                              <span
                                className="thread-chapter-label"
                                onClick={e => { e.stopPropagation(); onNavigateToChapter(num) }}
                              >
                                Book {num}
                              </span>
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

                    {mentions.length > 0 && (
                      <div className="thread-mentions">
                        <h5 className="thread-section-title">Appearances in text</h5>
                        {mentions.slice(0, 25).map((m, i) => (
                          <div
                            key={i}
                            className="thread-mention"
                            onClick={e => { e.stopPropagation(); onNavigateToChapter(m.chapter) }}
                          >
                            <span className="thread-mention-chapter">Book {m.chapter}</span>
                            <span className="thread-mention-text">&ldquo;{m.excerpt}&rdquo;</span>
                          </div>
                        ))}
                        {mentions.length > 25 && (
                          <p className="thread-mention-more">
                            and {mentions.length - 25} more appearances\u2026
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
