import { LAB_COPY } from './labCopy'
import type { LabFeedCard } from './labReadingFeed'

export function LabReadingFeed({
  open,
  cards,
  onClose,
  onSelect,
  onBrowse,
}: {
  open: boolean
  cards: LabFeedCard[]
  onClose: () => void
  onSelect: (card: LabFeedCard) => void
  onBrowse: () => void
}) {
  if (!open) return null
  return (
    <div
      className="lab-ss-overlay lab-feed"
      data-testid="lab-reading-feed"
      onClick={onClose}
    >
      <div className="lab-ss-sheet" onClick={event => event.stopPropagation()}>
        <div className="lab-ss-head">
          <h2 className="lab-ss-title">{LAB_COPY.yourReading}</h2>
          <button
            type="button"
            className="lab-ss-close"
            onClick={onClose}
            aria-label="Close your reading"
          >
            ×
          </button>
        </div>
        <div className="lab-ss-body lab-feed-body">
          {cards.map(card => (
            <button
              key={card.id}
              type="button"
              className={`lab-feed-card is-${card.kind}`}
              data-testid="lab-feed-card"
              data-kind={card.kind}
              data-book={card.bookId}
              onClick={() => onSelect(card)}
            >
              <div className="lab-feed-card-kicker">{card.kicker}</div>
              {card.line ? <p className="lab-feed-card-line">{card.line}</p> : null}
              {card.action ? <span className="lab-feed-card-action">{card.action}</span> : null}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="lab-feed-browse"
          data-testid="lab-feed-browse"
          onClick={onBrowse}
        >
          {LAB_COPY.browseTheBible}
        </button>
      </div>
    </div>
  )
}
