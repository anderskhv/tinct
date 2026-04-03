import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { AUDIO_BASE_URL } from '../utils/audioUrl'

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
  /** Called when audio reaches the end of the chapter */
  onChapterEnd?: () => void
  /** Index of the first paragraph visible on the current reader page */
  firstVisibleParagraph?: number
  /** Compact mode: show only percentage, hide page count and time */
  compact?: boolean
  /** Navigate to next/previous chapter (enables nav buttons on last/first page) */
  onNextChapter?: () => void
  onPrevChapter?: () => void
  /** Initial paragraph to resume audio from (restored from saved position) */
  initialAudioParagraph?: number
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2]

export const BottomBar = forwardRef<BottomBarHandle, BottomBarProps>(
  function BottomBar({
    percentComplete, timeRemainingLabel, isLearned, currentPage, totalPages,
    bookId, editionKey, chapterNumber, onParagraphChange, onChapterEnd, firstVisibleParagraph, compact,
    onNextChapter, onPrevChapter, initialAudioParagraph,
  }, ref) {
    const [manifest, setManifest] = useState<AudioManifest | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentParagraph, setCurrentParagraph] = useState(0)
    const [progress, setProgress] = useState(0)
    const [hasAudio, setHasAudio] = useState(false)
    const [speed, setSpeed] = useState(1)

    // Single reusable Audio element — avoids listener accumulation and stale closures
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const speedRef = useRef(speed)
    speedRef.current = speed

    // Use refs to avoid stale closures in audio event handlers
    const manifestRef = useRef(manifest)
    manifestRef.current = manifest
    const currentParagraphRef = useRef(currentParagraph)
    currentParagraphRef.current = currentParagraph
    const onParagraphChangeRef = useRef(onParagraphChange)
    onParagraphChangeRef.current = onParagraphChange
    const onChapterEndRef = useRef(onChapterEnd)
    onChapterEndRef.current = onChapterEnd
    // Track whether we should auto-resume after chapter change
    const shouldResumeRef = useRef(false)
    const initialAudioParagraphRef = useRef(initialAudioParagraph)
    initialAudioParagraphRef.current = initialAudioParagraph

    // Create and configure the single Audio element once
    useEffect(() => {
      const audio = new Audio()
      audioRef.current = audio

      const handleTimeUpdate = () => {
        if (audio.duration > 0) setProgress(audio.currentTime / audio.duration)
      }

      const handleEnded = () => {
        const m = manifestRef.current
        if (!m) return
        const nextIndex = currentParagraphRef.current + 1
        if (nextIndex < m.paragraphs.length) {
          // Play next paragraph
          const nextPara = m.paragraphs[nextIndex]
          setCurrentParagraph(nextIndex)
          currentParagraphRef.current = nextIndex
          onParagraphChangeRef.current?.(nextPara.paragraph)
          const url = `${AUDIO_BASE_URL}/${bookId}/${editionKey}/ch${chapterNumber}/${nextPara.file}`
          audio.src = url
          audio.playbackRate = speedRef.current
          audio.play().catch(() => {
            setIsPlaying(false)
          })
        } else {
          // Chapter finished — auto-advance
          setIsPlaying(false)
          setProgress(0)
          shouldResumeRef.current = true
          onChapterEndRef.current?.()
        }
      }

      const handleError = () => {
        // Audio failed to load — try next paragraph or stop
        const m = manifestRef.current
        if (!m) { setIsPlaying(false); return }
        const nextIndex = currentParagraphRef.current + 1
        if (nextIndex < m.paragraphs.length) {
          // Skip broken paragraph, try next
          const nextPara = m.paragraphs[nextIndex]
          setCurrentParagraph(nextIndex)
          currentParagraphRef.current = nextIndex
          onParagraphChangeRef.current?.(nextPara.paragraph)
          const url = `${AUDIO_BASE_URL}/${bookId}/${editionKey}/ch${chapterNumber}/${nextPara.file}`
          audio.src = url
          audio.playbackRate = speedRef.current
          audio.play().catch(() => { setIsPlaying(false) })
        } else {
          setIsPlaying(false)
        }
      }

      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
        audio.pause()
        audio.removeAttribute('src')
      }
    // Re-create audio element when book/edition/chapter changes
    // so event handler closures capture correct URL base
    }, [bookId, editionKey, chapterNumber])

    // Load manifest — stop audio on chapter change
    useEffect(() => {
      // Stop current audio immediately on chapter change
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
      }
      setIsPlaying(false)
      setProgress(0)

      const controller = new AbortController()
      const url = `${AUDIO_BASE_URL}/${bookId}/${editionKey}/ch${chapterNumber}/manifest.json`
      fetch(url, { signal: controller.signal })
        .then(res => {
          if (!res.ok) throw new Error('No audio')
          return res.json()
        })
        .then((data: AudioManifest) => {
          setManifest(data)
          manifestRef.current = data
          setHasAudio(true)
          // Restore to saved audio position if available
          const initPara = initialAudioParagraphRef.current
          let startIdx = 0
          if (initPara !== undefined && initPara > 0) {
            const found = data.paragraphs.findIndex(p => p.paragraph >= initPara)
            if (found >= 0) startIdx = found
          }
          setCurrentParagraph(startIdx)
          currentParagraphRef.current = startIdx

          // Auto-resume if chapter changed due to audio finishing previous chapter
          if (shouldResumeRef.current) {
            shouldResumeRef.current = false
            // Small delay to let the Audio element be ready after re-creation
            setTimeout(() => {
              const audio = audioRef.current
              if (!audio || !data.paragraphs[0]) return
              const paraUrl = `${AUDIO_BASE_URL}/${bookId}/${editionKey}/ch${chapterNumber}/${data.paragraphs[0].file}`
              audio.src = paraUrl
              audio.playbackRate = speedRef.current
              audio.play().then(() => {
                setIsPlaying(true)
                onParagraphChangeRef.current?.(data.paragraphs[0].paragraph)
              }).catch(() => {
                // Autoplay blocked (iOS) — user will need to tap play
                setIsPlaying(false)
              })
            }, 100)
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setManifest(null)
            manifestRef.current = null
            setHasAudio(false)
          }
        })

      return () => controller.abort()
    }, [bookId, editionKey, chapterNumber])

    const playParagraph = useCallback((index: number) => {
      const m = manifestRef.current
      if (!m) return
      const para = m.paragraphs[index]
      if (!para) return
      const audio = audioRef.current
      if (!audio) return

      const url = `${AUDIO_BASE_URL}/${bookId}/${editionKey}/ch${chapterNumber}/${para.file}`
      audio.src = url
      audio.playbackRate = speedRef.current
      audio.play().then(() => {
        setCurrentParagraph(index)
        currentParagraphRef.current = index
        setIsPlaying(true)
        onParagraphChange?.(para.paragraph)
      }).catch(() => {
        // Autoplay blocked or network error
        setIsPlaying(false)
      })
    }, [bookId, editionKey, chapterNumber, onParagraphChange])

    useImperativeHandle(ref, () => ({
      seekToParagraph(paragraphIndex: number) {
        const m = manifestRef.current
        if (!m) return
        const idx = m.paragraphs.findIndex(p => p.paragraph === paragraphIndex)
        if (idx >= 0) playParagraph(idx)
      }
    }), [playParagraph])

    const togglePlay = useCallback(() => {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        const m = manifestRef.current
        // Resume from the reader's current visible position, not where audio left off
        if (m && firstVisibleParagraph !== undefined) {
          const idx = m.paragraphs.findIndex(p => p.paragraph === firstVisibleParagraph)
          if (idx >= 0) {
            playParagraph(idx)
            return
          }
          // If exact paragraph not in manifest, find the closest one at or after visible
          const closestIdx = m.paragraphs.findIndex(p => p.paragraph >= firstVisibleParagraph)
          if (closestIdx >= 0) {
            playParagraph(closestIdx)
            return
          }
        }
        playParagraph(currentParagraphRef.current)
      }
    }, [isPlaying, playParagraph, firstVisibleParagraph])

    const cycleSpeed = useCallback(() => {
      setSpeed(prev => {
        const idx = SPEED_OPTIONS.indexOf(prev)
        const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]
        if (audioRef.current) audioRef.current.playbackRate = next
        return next
      })
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

    // Mobile nav — allow chapter advance when on first/last page
    const canGoPrev = currentPage > 0 || !!onPrevChapter
    const canGoNext = currentPage < totalPages - 1 || !!onNextChapter

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
            <span className="icon-pause" />
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
            <span className="icon-play" />
          </button>
        )}
        <div className="bottom-bar-progress">
          <div className="reading-tracker-bar">
            <div className="reading-tracker-fill" style={{ width: `${percentComplete}%` }} />
          </div>
        </div>
        <div className="reading-tracker-info">
          {!compact && totalPages > 1 && (
            <span className="reading-tracker-page">{currentPage + 1}/{totalPages}</span>
          )}
          <span className="reading-tracker-percent">{percentComplete}%</span>
          {!compact && (
            <span className="reading-tracker-time">
              {timeRemainingLabel}
              {!isLearned && percentComplete > 0 && <span className="reading-tracker-est" title="Based on average reading speed of 250 wpm"> (est.)</span>}
            </span>
          )}
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
