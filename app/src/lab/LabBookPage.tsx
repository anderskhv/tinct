import { LAB_COPY } from './labCopy'
import type { FollowParagraph, FollowTarget } from './labFollow'

interface LabBookPageProps {
  chapterTitle: string
  editionLabel: string
  paragraphs: string[]
  compareParagraphs: string[]
  compare: boolean
  follow: FollowTarget
  followEnabled: boolean
  followParagraphs: FollowParagraph[]
  markedIndexes: Set<number>
  onMark: (index: number) => void
  focusParagraph?: number | null
  dimmed?: boolean
  peek?: boolean
}

function renderFollowedText(
  paragraph: FollowParagraph,
  follow: FollowTarget,
  followEnabled: boolean,
) {
  const isCurrent = follow.kind !== 'none' && follow.paragraphIndex === paragraph.index
  if (!followEnabled || !isCurrent) {
    return paragraph.text
  }

  if (follow.kind === 'word' && paragraph.words) {
    return paragraph.words.map((word, wordIndex) => (
      <span
        key={`${paragraph.index}-${wordIndex}`}
        className={wordIndex === follow.wordIndex ? 'lab-word-current' : undefined}
      >
        {wordIndex > 0 && !word.text.startsWith("'") && !word.text.startsWith(',') && !word.text.startsWith('.') ? ' ' : ''}
        {word.text}
      </span>
    ))
  }

  return <span className="lab-paragraph-current">{paragraph.text}</span>
}

export function LabBookPage({
  chapterTitle,
  editionLabel,
  paragraphs,
  compareParagraphs,
  compare,
  follow,
  followEnabled,
  followParagraphs,
  markedIndexes,
  onMark,
  focusParagraph,
  dimmed,
  peek,
}: LabBookPageProps) {
  return (
    <article
      className={`lab-book ${dimmed ? 'is-dimmed' : ''} ${compare ? 'is-compare' : ''} ${peek ? 'is-peek' : ''}`}
      data-testid="lab-book"
    >
      <header className="lab-book-header">
        <p className="lab-book-kicker">{editionLabel}</p>
        <h1 className="lab-book-title">{chapterTitle}</h1>
      </header>
      <div className="lab-book-columns">
        <div className="lab-book-col">
          {paragraphs.map((text, index) => {
            const followed = followParagraphs[index] || { index, text }
            const isFollowed = followEnabled && follow.kind !== 'none' && follow.paragraphIndex === index
            return (
              <p
                key={index}
                id={`lab-p-${index}`}
                className={[
                  'lab-p',
                  markedIndexes.has(index) ? 'is-marked' : '',
                  isFollowed && follow.kind === 'paragraph' ? 'is-follow-paragraph' : '',
                  focusParagraph === index ? 'is-focus' : '',
                ].filter(Boolean).join(' ')}
              >
                {renderFollowedText(followed, follow, followEnabled)}
                <button
                  type="button"
                  className="lab-mark-btn"
                  onClick={() => onMark(index)}
                >
                  {LAB_COPY.markAction}
                </button>
              </p>
            )
          })}
        </div>
        {compare && (
          <div className="lab-book-col lab-book-col-compare" data-testid="lab-compare-col">
            <p className="lab-book-kicker">Modern English</p>
            {(compareParagraphs.length > 0 ? compareParagraphs : paragraphs).map((text, index) => (
              <p key={index} className="lab-p">{text}</p>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
