import { LAB_COPY } from './labCopy'
import { hearingProgress, hearingStageLines } from './labHearing'
import type { FollowParagraph, FollowTarget } from './labFollow'

interface LabHearingStageProps {
  paragraphs: FollowParagraph[]
  follow: FollowTarget
  playing: boolean
  clipIndex: number
  currentTime: number
  speed: number
  onTogglePlay: () => void
  onSeek: (deltaSeconds: number) => void
  onCycleSpeed: () => void
}

export function LabHearingStage({
  paragraphs,
  follow,
  playing,
  clipIndex,
  currentTime,
  speed,
  onTogglePlay,
  onSeek,
  onCycleSpeed,
}: LabHearingStageProps) {
  const paragraph = follow.kind === 'none'
    ? paragraphs[clipIndex] || paragraphs[0]
    : paragraphs.find(item => item.index === follow.paragraphIndex) || paragraphs[clipIndex]
  const lines = hearingStageLines(paragraph, follow.kind === 'none' && paragraph
    ? { kind: paragraph.words ? 'word' : 'paragraph', paragraphIndex: paragraph.index, wordIndex: 0 }
    : follow)
  const progress = hearingProgress(paragraphs, clipIndex, currentTime)
  const progressPercent = progress ? Math.min(100, (progress.current / progress.total) * 100) : null

  return (
    <section className="lab-hearing" data-testid="lab-hearing">
      <div className="lab-hearing-stage" data-testid="lab-hearing-stage">
        {lines.map((line, lineIndex) => (
          <p key={lineIndex} className="lab-hearing-line">
            {line.words.map((word, wordIndex) => (
              <span
                key={`${lineIndex}-${wordIndex}`}
                className={`lab-hearing-word is-${word.role}`}
                data-testid={word.role === 'current' ? 'lab-hearing-current' : undefined}
              >
                {wordIndex > 0 && !word.text.startsWith("'") && !word.text.startsWith(',') && !word.text.startsWith('.') ? ' ' : ''}
                {word.text}
              </span>
            ))}
          </p>
        ))}
      </div>
      <div className="lab-hearing-transport" data-testid="lab-hearing-transport">
        <button type="button" className="lab-text-btn" onClick={onTogglePlay} data-testid="lab-hearing-pause">
          {playing ? LAB_COPY.pause : LAB_COPY.play}
        </button>
        <button type="button" className="lab-text-btn" onClick={() => onSeek(-15)} data-testid="lab-hearing-back">
          {LAB_COPY.back15}
        </button>
        <button type="button" className="lab-text-btn" onClick={() => onSeek(15)} data-testid="lab-hearing-forward">
          {LAB_COPY.forward15}
        </button>
        <button type="button" className="lab-text-btn" onClick={onCycleSpeed} data-testid="lab-hearing-speed">
          {speed}×
        </button>
      </div>
      {progressPercent != null && (
        <div className="lab-hearing-progress" data-testid="lab-hearing-progress">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      )}
    </section>
  )
}
