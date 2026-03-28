interface ReadingProgressBarProps {
  percentComplete: number
  timeRemainingLabel: string
  isLearned: boolean
  currentPage: number
  totalPages: number
}

export function ReadingProgressBar({ percentComplete, timeRemainingLabel, isLearned, currentPage, totalPages }: ReadingProgressBarProps) {
  const canGoPrev = currentPage > 0
  const canGoNext = currentPage < totalPages - 1

  return (
    <div className="reading-tracker">
      <button
        className="reading-tracker-nav"
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))}
        disabled={!canGoPrev}
        aria-label="Previous page"
      >
        &larr;
      </button>
      <div className="reading-tracker-bar">
        <div className="reading-tracker-fill" style={{ width: `${percentComplete}%` }} />
      </div>
      <div className="reading-tracker-info">
        {totalPages > 1 && (
          <span className="reading-tracker-page">{currentPage + 1}/{totalPages}</span>
        )}
        <span className="reading-tracker-percent">{percentComplete}%</span>
        <span className="reading-tracker-time">
          {timeRemainingLabel}
          {!isLearned && percentComplete > 0 && <span className="reading-tracker-est" title="Based on average reading speed of 250 wpm"> (est.)</span>}
        </span>
      </div>
      <button
        className="reading-tracker-nav"
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))}
        disabled={!canGoNext}
        aria-label="Next page"
      >
        &rarr;
      </button>
    </div>
  )
}
