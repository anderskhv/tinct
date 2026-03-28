import type { Highlight } from '../types'
import { HIGHLIGHT_COLORS } from '../types'

interface HighlightsProps {
  highlights: Highlight[]
  onNavigateToChapter: (chapter: number) => void
  chapterLabels: string[]
}

export function Highlights({ highlights, onNavigateToChapter, chapterLabels }: HighlightsProps) {
  if (highlights.length === 0) {
    return (
      <div className="highlights-panel">
        <div className="highlights-panel-header">
          <h3>Highlights</h3>
          <span className="highlights-panel-count">0</span>
        </div>
        <div className="highlights-panel-content">
          <div className="notes-empty">
            <p className="notes-empty-title">No highlights yet</p>
            <p className="notes-empty-hint">
              Select text in the reader and pick a color to start highlighting.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Group by chapter
  const byChapter = new Map<number, Highlight[]>()
  for (const hl of highlights) {
    const existing = byChapter.get(hl.chapterNumber) || []
    existing.push(hl)
    byChapter.set(hl.chapterNumber, existing)
  }

  // Sort chapters
  const chapters = Array.from(byChapter.entries()).sort((a, b) => a[0] - b[0])

  // Color counts
  const colorCounts = HIGHLIGHT_COLORS.map(c => ({
    ...c,
    count: highlights.filter(h => h.color === c.key).length,
  })).filter(c => c.count > 0)

  return (
    <div className="highlights-panel">
      <div className="highlights-panel-header">
        <h3>Highlights</h3>
        <span className="highlights-panel-count">{highlights.length}</span>
      </div>

      {/* Color summary */}
      <div className="highlights-color-summary">
        {colorCounts.map(c => (
          <div key={c.key} className="highlights-color-chip">
            <span className={`highlight-dot highlight-${c.key}`} />
            <span>{c.count}</span>
          </div>
        ))}
      </div>

      <div className="highlights-panel-content">
        {chapters.map(([chapterNum, chapterHighlights]) => (
          <div key={chapterNum} className="highlights-chapter-group">
            <button
              className="highlights-chapter-label"
              onClick={() => onNavigateToChapter(chapterNum)}
            >
              {chapterLabels[chapterNum - 1] || `Chapter ${chapterNum}`}
              <span className="highlights-chapter-count">{chapterHighlights.length}</span>
            </button>
            <div className="highlights-chapter-items">
              {chapterHighlights
                .sort((a, b) => a.paragraphIndex - b.paragraphIndex || a.startOffset - b.startOffset)
                .map(hl => (
                  <div
                    key={hl.id}
                    className="highlight-entry"
                    onClick={() => onNavigateToChapter(hl.chapterNumber)}
                  >
                    <div className={`highlight-dot highlight-${hl.color}`} />
                    <div className="highlight-entry-content">
                      <p className="highlight-text">
                        &ldquo;{hl.text.length > 120 ? hl.text.slice(0, 120) + '...' : hl.text}&rdquo;
                      </p>
                      {hl.note && <p className="highlight-note">{hl.note}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
