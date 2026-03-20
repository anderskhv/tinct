interface ReadingProgressBarProps {
  percentComplete: number
  timeRemainingLabel: string
  isLearned: boolean
  currentPage: number
  totalPages: number
}

export function ReadingProgressBar({ percentComplete, timeRemainingLabel, isLearned, currentPage, totalPages }: ReadingProgressBarProps) {
  return (
    <div className="reading-tracker">
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
    </div>
  )
}
