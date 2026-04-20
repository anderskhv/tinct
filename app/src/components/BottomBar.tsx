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
  togglePlay: () => void
}

interface ProgressDisplay {
  metric: 'percent' | 'time' | 'page' | 'location'
  scope: 'book' | 'section' | 'chapter'
}

interface BottomBarProps {
  // Reading progress
  percentComplete: number
  timeRemainingLabel: string
  isLearned: boolean
  currentPage: number
  totalPages: number
  /** Content-based absolute page (device-independent, ~1500 chars/page) */
  absoluteCurrentPage?: number
  absoluteTotalPages?: number
  // Scoped progress (for section/chapter display)
  chapterPercentComplete?: number
  chapterTimeLabel?: string
  sectionPercentComplete?: number
  sectionTimeLabel?: string
  /** Kindle-style location (paragraph index across entire book) */
  locationCurrent?: number
  locationTotal?: number
  /** Progress display preference */
  progressDisplay?: ProgressDisplay
  /** Book-level absolute pages (scope='book' for page metric) */
  bookCurrentPage?: number
  bookTotalPages?: number
  /** Chapter-level location (paragraph position within chapter) */
  locationCurrentChapter?: number
  locationTotalChapter?: number
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
  /** Called whenever play/pause state changes */
  onPlayStateChange?: (isPlaying: boolean) => void
  /** Chapter start positions as fractions (0-1) across the book — rendered as ticks */
  chapterTicks?: number[]
  /** Current chapter index (1-based) — used to highlight the current tick */
  currentChapterIndex?: number
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2]

export const BottomBar = forwardRef<BottomBarHandle, BottomBarProps>(
  function BottomBar({
    percentComplete, timeRemainingLabel, isLearned, currentPage, totalPages,
    absoluteCurrentPage, absoluteTotalPages,
    chapterPercentComplete, chapterTimeLabel, sectionPercentComplete, sectionTimeLabel,
    locationCurrent, locationTotal, progressDisplay,
    bookCurrentPage, bookTotalPages, locationCurrentChapter, locationTotalChapter,
    bookId, editionKey, chapterNumber, onParagraphChange, onChapterEnd, firstVisibleParagraph, compact,
    onNextChapter, onPrevChapter, initialAudioParagraph, onPlayStateChange,
    chapterTicks, currentChapterIndex,
  }, ref) {
    const [manifest, setManifest] = useState<AudioManifest | null>(null)
    const [isPlaying, setIsPlayingRaw] = useState(false)
    const [currentParagraph, setCurrentParagraph] = useState(0)
    const [progress, setProgress] = useState(0)
    const [hasAudio, setHasAudio] = useState(false)
    const [speed, setSpeed] = useState(1)

    const onPlayStateChangeRef = useRef(onPlayStateChange)
    onPlayStateChangeRef.current = onPlayStateChange
    const setIsPlaying = useCallback((playing: boolean) => {
      setIsPlayingRaw(playing)
      onPlayStateChangeRef.current?.(playing)
    }, [])

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
      const isAutoResume = shouldResumeRef.current

      // Stop current audio on chapter change — but keep element alive if auto-resuming
      if (audioRef.current && !isAutoResume) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
      }
      if (!isAutoResume) {
        setIsPlaying(false)
      }
      setProgress(0)

      // 'none' means user has disabled audio
      if (editionKey === 'none') {
        setManifest(null)
        manifestRef.current = null
        setHasAudio(false)
        return
      }

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
          setCurrentParagraph(isAutoResume ? 0 : startIdx)
          currentParagraphRef.current = isAutoResume ? 0 : startIdx

          if (!isAutoResume && startIdx > 0) {
            onParagraphChangeRef.current?.(data.paragraphs[startIdx].paragraph)
          }

          // Auto-resume: directly swap src — no pause, no timeout, preserves iOS audio unlock
          if (isAutoResume) {
            shouldResumeRef.current = false
            const audio = audioRef.current
            if (!audio || !data.paragraphs[0]) return
            const paraUrl = `${AUDIO_BASE_URL}/${bookId}/${editionKey}/ch${chapterNumber}/${data.paragraphs[0].file}`
            audio.src = paraUrl
            audio.playbackRate = speedRef.current
            audio.play().then(() => {
              setIsPlaying(true)
              onParagraphChangeRef.current?.(data.paragraphs[0].paragraph)
            }).catch(() => {
              setIsPlaying(false)
            })
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
      },
      togglePlay() {
        togglePlayRef.current()
      },
    }), [playParagraph])

    const togglePlayRef = useRef<() => void>(() => {})
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
    togglePlayRef.current = togglePlay

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
              {chapterTicks && chapterTicks.length > 0 && (
                <div className="progress-footer-ticks">
                  {chapterTicks.map((p, i) => (
                    <div
                      key={i}
                      className={`progress-footer-tick ${currentChapterIndex === i + 1 ? 'progress-footer-tick-current' : ''}`}
                      style={{ left: `${p * 100}%` }}
                    />
                  ))}
                </div>
              )}
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
            {chapterTicks && chapterTicks.length > 0 && (
              <div className="progress-footer-ticks">
                {chapterTicks.map((p, i) => (
                  <div
                    key={i}
                    className={`progress-footer-tick ${currentChapterIndex === i + 1 ? 'progress-footer-tick-current' : ''}`}
                    style={{ left: `${p * 100}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="reading-tracker-info">
          {(() => {
            const pd = progressDisplay || { metric: 'percent', scope: 'book' }
            const scope = pd.scope
            const metric = pd.metric

            // Pick the right values based on scope
            const pct = scope === 'chapter' ? (chapterPercentComplete ?? Math.round(((currentPage + 1) / Math.max(totalPages, 1)) * 100))
              : scope === 'section' ? (sectionPercentComplete ?? percentComplete)
              : percentComplete
            const time = scope === 'chapter' ? (chapterTimeLabel ?? timeRemainingLabel)
              : scope === 'section' ? (sectionTimeLabel ?? timeRemainingLabel)
              : timeRemainingLabel
            const scopeLabel = scope === 'chapter' ? 'ch' : scope === 'section' ? 'sec' : ''

            if (metric === 'page') {
              if (scope === 'book' && bookCurrentPage && bookTotalPages) {
                return <span className="reading-tracker-percent">{bookCurrentPage}/{bookTotalPages}</span>
              }
              const pg = absoluteCurrentPage ?? (currentPage + 1)
              const tot = absoluteTotalPages ?? totalPages
              return <span className="reading-tracker-percent">{pg}/{tot}{scope === 'chapter' ? ' ch' : ''}</span>
            }
            if (metric === 'location') {
              if (scope === 'chapter' && locationCurrentChapter !== undefined && locationTotalChapter) {
                return <span className="reading-tracker-percent">§{locationCurrentChapter}/{locationTotalChapter}</span>
              }
              if (locationCurrent !== undefined && locationTotal) {
                return <span className="reading-tracker-percent">Loc {locationCurrent}/{locationTotal}</span>
              }
            }
            if (metric === 'time') {
              return (
                <span className="reading-tracker-time">
                  {time}
                  {scopeLabel ? ` (${scopeLabel})` : ''}
                  {!isLearned && percentComplete > 0 && <span className="reading-tracker-est"> (est.)</span>}
                </span>
              )
            }
            // Default: percent
            return <span className="reading-tracker-percent">{pct}%{scopeLabel ? ` ${scopeLabel}` : ''}</span>
          })()}
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
