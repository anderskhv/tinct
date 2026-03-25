import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'

interface ParagraphAudio {
  paragraph: number
  duration: number
  file: string
}

interface AudioManifest {
  chapter: number
  title: string
  paragraphs: ParagraphAudio[]
}

export interface BottomBarHandle {
  seekToParagraph: (index: number) => void
}

interface BottomBarProps {
  // Reading progress
  percentComplete: number
  timeRemainingLabel: string
  isLearned: boolean
  currentPage: number
  totalPages: number
  // Audio
  bookId: string
  editionKey: string
  chapterNumber: number
  onParagraphChange?: (paragraphIndex: number) => void
  /** Index of the first paragraph visible on the current reader page */
  firstVisibleParagraph?: number
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2]

export const BottomBar = forwardRef<BottomBarHandle, BottomBarProps>(
  function BottomBar({
    percentComplete, timeRemainingLabel, isLearned, currentPage, totalPages,
    bookId, editionKey, chapterNumber, onParagraphChange, firstVisibleParagraph,
  }, ref) {
    const [manifest, setManifest] = useState<AudioManifest | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentParagraph, setCurrentParagraph] = useState(0)
    const [progress, setProgress] = useState(0)
    const [hasAudio, setHasAudio] = useState(false)
    const [speed, setSpeed] = useState(1)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const speedRef = useRef(speed)
    speedRef.current = speed

    // Load manifest
    useEffect(() => {
      const url = `/audio/${bookId}/${editionKey}/ch${chapterNumber}/manifest.json`
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error('No audio')
          return res.json()
        })
        .then((data: AudioManifest) => {
          setManifest(data)
          setHasAudio(true)
          setCurrentParagraph(0)
          setIsPlaying(false)
          setProgress(0)
        })
        .catch(() => {
          setManifest(null)
          setHasAudio(false)
        })
    }, [bookId, editionKey, chapterNumber])

    const playParagraph = useCallback((index: number) => {
      if (!manifest) return
      const para = manifest.paragraphs[index]
      if (!para) return
      const url = `/audio/${bookId}/${editionKey}/ch${chapterNumber}/${para.file}`
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
      }
      const audio = new Audio(url)
      audio.playbackRate = speedRef.current
      audioRef.current = audio
      audio.addEventListener('timeupdate', () => {
        if (audio.duration > 0) setProgress(audio.currentTime / audio.duration)
      })
      audio.addEventListener('ended', () => {
        const nextIndex = index + 1
        if (nextIndex < manifest.paragraphs.length) {
          setCurrentParagraph(nextIndex)
          onParagraphChange?.(manifest.paragraphs[nextIndex].paragraph)
          playParagraph(nextIndex)
        } else {
          setIsPlaying(false)
          setProgress(0)
        }
      })
      audio.play()
      setCurrentParagraph(index)
      setIsPlaying(true)
      onParagraphChange?.(para.paragraph)
    }, [manifest, bookId, editionKey, chapterNumber, onParagraphChange])

    useImperativeHandle(ref, () => ({
      seekToParagraph(paragraphIndex: number) {
        if (!manifest) return
        const idx = manifest.paragraphs.findIndex(p => p.paragraph === paragraphIndex)
        if (idx >= 0) playParagraph(idx)
      }
    }), [manifest, playParagraph])

    const togglePlay = useCallback(() => {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        // Resume from the reader's current visible position, not where audio left off
        if (manifest && firstVisibleParagraph !== undefined) {
          const idx = manifest.paragraphs.findIndex(p => p.paragraph === firstVisibleParagraph)
          if (idx >= 0) {
            playParagraph(idx)
            return
          }
          // If exact paragraph not in manifest, find the closest one at or after visible
          const closestIdx = manifest.paragraphs.findIndex(p => p.paragraph >= firstVisibleParagraph)
          if (closestIdx >= 0) {
            playParagraph(closestIdx)
            return
          }
        }
        playParagraph(currentParagraph)
      }
    }, [isPlaying, currentParagraph, playParagraph, manifest, firstVisibleParagraph])

    const cycleSpeed = useCallback(() => {
      setSpeed(prev => {
        const idx = SPEED_OPTIONS.indexOf(prev)
        const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]
        if (audioRef.current) audioRef.current.playbackRate = next
        return next
      })
    }, [])

    useEffect(() => {
      return () => { audioRef.current?.pause() }
    }, [])

    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    }

    const totalDuration = manifest?.paragraphs.reduce((sum, p) => sum + p.duration, 0) || 0
    const elapsedDuration = manifest
      ? manifest.paragraphs.slice(0, currentParagraph).reduce((sum, p) => sum + p.duration, 0)
        + (manifest.paragraphs[currentParagraph]?.duration || 0) * progress
      : 0

    // Mobile nav
    const canGoPrev = currentPage > 0
    const canGoNext = currentPage < totalPages - 1

    if (isPlaying) {
      // Audio mode
      return (
        <div className="bottom-bar bottom-bar-audio">
          <button
            className="reading-tracker-nav"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))}
            disabled={!canGoPrev}
            aria-label="Previous page"
          >
            &larr;
          </button>
          <button className="bottom-bar-play" onClick={togglePlay} title="Pause">
            ⏸
          </button>
          <div className="bottom-bar-progress">
            <div className="reading-tracker-bar">
              <div
                className="reading-tracker-fill"
                style={{ width: `${totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0}%` }}
              />
            </div>
          </div>
          <span className="bottom-bar-time">
            {formatTime(elapsedDuration)} / {formatTime(totalDuration)}
          </span>
          <button className="bottom-bar-speed" onClick={cycleSpeed} title="Playback speed">
            {speed}x
          </button>
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

    // Reading mode
    return (
      <div className="bottom-bar">
        <button
          className="reading-tracker-nav"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))}
          disabled={!canGoPrev}
          aria-label="Previous page"
        >
          &larr;
        </button>
        {hasAudio && (
          <button className="bottom-bar-play" onClick={togglePlay} title="Play audiobook">
            ▶
          </button>
        )}
        <div className="bottom-bar-progress">
          <div className="reading-tracker-bar">
            <div className="reading-tracker-fill" style={{ width: `${percentComplete}%` }} />
          </div>
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
)
