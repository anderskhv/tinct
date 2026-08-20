import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { resolveAudioUrl } from '../utils/audioUrl'
import { useAudioSpeed, nextAudioSpeed } from '../hooks/useAudioSpeed'
import type { AudioPlaybackAnchor, AudioPlaybackPause } from '../voice/types'

/** Push the latest audio engine event into a global so DevTools can read it.
 *  Critical for diagnosing platform-specific audio issues like the Boox
 *  "disclaimer plays, then silence" bug. Inspect via window.__tinctAudioDebug. */
function recordAudioDebug(entry: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { __tinctAudioDebug?: { last: Record<string, unknown> & { at: number }; history: Array<Record<string, unknown> & { at: number }> } }
  const stamp = { ...entry, at: Date.now() }
  const dbg = w.__tinctAudioDebug ?? { last: stamp, history: [] }
  dbg.last = stamp
  dbg.history.push(stamp)
  if (dbg.history.length > 20) dbg.history.shift()
  w.__tinctAudioDebug = dbg
}

function applyAudioRate(audio: HTMLAudioElement, rate: number) {
  audio.defaultPlaybackRate = rate
  audio.playbackRate = rate
  const pitchAudio = audio as HTMLAudioElement & {
    preservesPitch?: boolean
    mozPreservesPitch?: boolean
    webkitPreservesPitch?: boolean
  }
  pitchAudio.preservesPitch = true
  pitchAudio.mozPreservesPitch = true
  pitchAudio.webkitPreservesPitch = true
}

function warmAudioUrl(url: string) {
  if (typeof fetch === 'undefined') return
  fetch(url, { cache: 'force-cache' }).catch(() => {
    // Warmup is best-effort; playback should still use the media element path.
  })
}

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
  cycleSpeed: () => void
  getSpeed: () => number
  /** Skip relative to the current paragraph: positive forward, negative backward. */
  skipParagraphs: (delta: number) => void
  /**
   * Seek by a number of seconds within the chapter. Crosses paragraph
   * boundaries — +15 from the last 5s of one paragraph will land 10s into
   * the next paragraph. Negative delta seeks backward, clamped at 0.
   */
  skipSeconds: (delta: number) => void
  /** Whether the current book/chapter/edition has audio available. */
  hasAudio: () => boolean
  /** Pause the current paragraph and return the exact resume anchor plus whether it was playing. */
  pausePlayback: () => AudioPlaybackPause | null
  /** Resume at a previously captured paragraph + timestamp. */
  resumePlayback: (anchor: AudioPlaybackAnchor) => void
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
  /** Called when audio reaches the end of the final chapter */
  onBookEnd?: () => void
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
  /**
   * Fires as the audio progresses through the current paragraph's MP3
   * (fraction 0-1). Throttled at ~3 Hz so it's safe to wire into React
   * state. Used by the Reader to auto-flip the page mid-paragraph on
   * paragraphs that span a page break.
   */
  onProgressChange?: (progress: number) => void
  /** Chapter start positions as fractions (0-1) across the book — rendered as ticks */
  chapterTicks?: number[]
  /** Current chapter index (1-based) — used to highlight the current tick */
  currentChapterIndex?: number
  /** Title of the currently-open chapter — shown centered in the bottom bar. */
  chapterTitle?: string
}

export const BottomBar = forwardRef<BottomBarHandle, BottomBarProps>(
  function BottomBar({
    percentComplete, timeRemainingLabel, isLearned, currentPage, totalPages,
    absoluteCurrentPage, absoluteTotalPages,
    chapterPercentComplete, chapterTimeLabel, sectionPercentComplete, sectionTimeLabel,
    locationCurrent, locationTotal, progressDisplay,
    bookCurrentPage, bookTotalPages, locationCurrentChapter, locationTotalChapter,
    bookId, editionKey, chapterNumber, onParagraphChange, onChapterEnd, onBookEnd, firstVisibleParagraph, compact,
    onNextChapter, onPrevChapter, initialAudioParagraph, onPlayStateChange, onProgressChange,
    chapterTicks, currentChapterIndex, chapterTitle,
  }, ref) {
    const [manifest, setManifest] = useState<AudioManifest | null>(null)
    const [isPlaying, setIsPlayingRaw] = useState(false)
    const [currentParagraph, setCurrentParagraph] = useState(0)
    const [progress, setProgress] = useState(0)
    const [hasAudio, setHasAudio] = useState(false)
    // Single source of truth for speed — persisted, cross-device synced.
    // The hook's `applyTo` is called wherever an audio element is created or
    // a `play` event fires so the DOM rate can never drift from the chosen value.
    const { speed, cycleSpeed: cycleSpeedFromHook, applyTo: applySpeedToAudio } = useAudioSpeed()

    const onPlayStateChangeRef = useRef(onPlayStateChange)
    onPlayStateChangeRef.current = onPlayStateChange
    const setIsPlaying = useCallback((playing: boolean) => {
      setIsPlayingRaw(playing)
      onPlayStateChangeRef.current?.(playing)
    }, [])

    // Throttled progress callback — `timeupdate` fires 2-4 Hz natively but
    // we re-sample to ~3 Hz to keep the consumer's React state quiet.
    const onProgressChangeRef = useRef(onProgressChange)
    onProgressChangeRef.current = onProgressChange
    const lastProgressFireRef = useRef(0)

    // Single reusable Audio element — avoids listener accumulation and stale closures
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const speedRef = useRef(speed)
    speedRef.current = speed
    const isPlayingRef = useRef(isPlaying)
    isPlayingRef.current = isPlaying

    // Use refs to avoid stale closures in audio event handlers
    const manifestRef = useRef(manifest)
    manifestRef.current = manifest
    const currentParagraphRef = useRef(currentParagraph)
    currentParagraphRef.current = currentParagraph
    const onParagraphChangeRef = useRef(onParagraphChange)
    onParagraphChangeRef.current = onParagraphChange
    const onChapterEndRef = useRef(onChapterEnd)
    onChapterEndRef.current = onChapterEnd
    const onBookEndRef = useRef(onBookEnd)
    onBookEndRef.current = onBookEnd
    // Track whether we should auto-resume after chapter change
    const shouldResumeRef = useRef(false)
    // True while the disclaimer is playing on the main audio element. Tells
    // the engine's permanent `handleEnded` / `handleError` to skip — the
    // disclaimer's one-shot listener handles the transition to the paragraph.
    const playingDisclaimerRef = useRef(false)
    const initialAudioParagraphRef = useRef(initialAudioParagraph)
    initialAudioParagraphRef.current = initialAudioParagraph

    // Create and configure the single Audio element once
    useEffect(() => {
      const audio = new Audio()
      audio.preload = 'auto'
      audioRef.current = audio
      // Counts consecutive load/decode errors. Reset on any successful play.
      // Prevents a cascade where a system-wide block (e.g., CSP, network) skips
      // through the entire chapter's paragraphs and jumps to the next one.
      let consecutiveErrors = 0

      const handlePlaying = () => {
        consecutiveErrors = 0
        recordAudioDebug({
          event: 'playing',
          rate: audio.playbackRate,
          readyState: audio.readyState,
          currentTime: audio.currentTime,
        })
      }

      const handleTimeUpdate = () => {
        if (audio.duration <= 0) return
        const frac = audio.currentTime / audio.duration
        setProgress(frac)
        // Throttle bubble-up to ~3 Hz — plenty for page-flip sync,
        // avoids hammering the consumer's render cycle.
        const now = performance.now()
        if (now - lastProgressFireRef.current > 300) {
          lastProgressFireRef.current = now
          onProgressChangeRef.current?.(frac)
        }
      }

      const handleEnded = () => {
        // Disclaimer is using this element — let the disclaimer's own listener
        // run; don't auto-advance to the next paragraph.
        if (playingDisclaimerRef.current) return
        const m = manifestRef.current
        if (!m) return
        const nextIndex = currentParagraphRef.current + 1
        if (nextIndex < m.paragraphs.length) {
          // Play next paragraph
          const nextPara = m.paragraphs[nextIndex]
          setCurrentParagraph(nextIndex)
          currentParagraphRef.current = nextIndex
          onParagraphChangeRef.current?.(nextPara.paragraph)
          // Reset progress so the Reader doesn't briefly reuse the previous
          // paragraph's fraction before the new audio starts reporting.
          lastProgressFireRef.current = 0
          onProgressChangeRef.current?.(0)
          const url = resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/${nextPara.file}`)
          audio.src = url
          applyAudioRate(audio, speedRef.current)
          try { audio.load() } catch { /* ignore */ }
          const followingPara = m.paragraphs[nextIndex + 1]
          if (followingPara) {
            warmAudioUrl(resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/${followingPara.file}`))
          }
          audio.play().catch(() => {
            setIsPlaying(false)
          })
        } else {
          // Chapter finished — auto-advance
          setIsPlaying(false)
          setProgress(0)
          if (onChapterEndRef.current) {
            shouldResumeRef.current = true
            onChapterEndRef.current()
          } else {
            shouldResumeRef.current = false
            onBookEndRef.current?.()
          }
        }
      }

      const handleError = () => {
        // Same skip-during-disclaimer guard as handleEnded.
        if (playingDisclaimerRef.current) return
        // Audio failed to load — try next paragraph, but bail after a few
        // consecutive failures to avoid skipping chapters on systemic errors.
        consecutiveErrors += 1
        const m = manifestRef.current
        if (!m || consecutiveErrors >= 3) {
          setIsPlaying(false)
          return
        }
        const nextIndex = currentParagraphRef.current + 1
        if (nextIndex < m.paragraphs.length) {
          // Skip broken paragraph, try next
          const nextPara = m.paragraphs[nextIndex]
          setCurrentParagraph(nextIndex)
          currentParagraphRef.current = nextIndex
          onParagraphChangeRef.current?.(nextPara.paragraph)
          const url = resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/${nextPara.file}`)
          audio.src = url
          applyAudioRate(audio, speedRef.current)
          try { audio.load() } catch { /* ignore */ }
          audio.play().catch(() => { setIsPlaying(false) })
        } else {
          setIsPlaying(false)
        }
      }

      // Reapply user-chosen speed on every play. The DOM `<audio>` element
      // resets `playbackRate` to 1.0 on certain transitions (new src, some
      // browsers' pause/play, codec switches). Without this, the visible
      // speed indicator says "1.5x" but actual playback drifts to 1.0x —
      // exactly what Anders saw in B12. Idempotent: if rate is already
      // correct, applySpeedToAudio no-ops.
      const handlePlay = () => {
        applySpeedToAudio(audio)
        applyAudioRate(audio, speedRef.current)
      }

      let lastNativeBufferAt = 0
      const handleWaiting = () => {
        lastNativeBufferAt = performance.now()
        recordAudioDebug({ event: 'waiting', rate: audio.playbackRate, readyState: audio.readyState, networkState: audio.networkState, currentTime: audio.currentTime })
      }
      const handleStalled = () => {
        lastNativeBufferAt = performance.now()
        recordAudioDebug({ event: 'stalled', rate: audio.playbackRate, readyState: audio.readyState, networkState: audio.networkState, currentTime: audio.currentTime })
      }

      // Apply once at element creation too, before any user interaction.
      applySpeedToAudio(audio)
      applyAudioRate(audio, speedRef.current)

      let lastWatchTime = 0
      let lastWatchAt = 0
      let recovering = false
      const recoverStalledPlayback = () => {
        if (recovering || playingDisclaimerRef.current || audio.paused || audio.ended || !audio.src) return
        const t = Math.max(0, audio.currentTime || 0)
        if (t > 0.25) {
          recordAudioDebug({ event: 'stall-recover-skipped-midfile', readyState: audio.readyState, networkState: audio.networkState, currentTime: t })
          return
        }
        const duration = Number.isFinite(audio.duration) ? audio.duration : 0
        if (duration > 0 && duration - t < 1) return
        recovering = true
        const src = audio.src
        const rate = speedRef.current
        recordAudioDebug({ event: 'stall-recover', rate, readyState: audio.readyState, networkState: audio.networkState, currentTime: t })
        try { audio.pause() } catch { /* ignore */ }
        audio.src = src
        applyAudioRate(audio, rate)
        const restoreTime = () => {
          audio.removeEventListener('loadedmetadata', restoreTime)
          try { audio.currentTime = t } catch { /* ignore */ }
        }
        audio.addEventListener('loadedmetadata', restoreTime)
        try { audio.load() } catch { /* ignore */ }
        audio.play()
          .then(() => { setIsPlaying(true) })
          .catch(() => { setIsPlaying(false) })
          .finally(() => {
            recovering = false
            lastWatchTime = audio.currentTime || 0
            lastWatchAt = performance.now()
          })
      }

      const watchdog = window.setInterval(() => {
        if (playingDisclaimerRef.current || audio.paused || audio.ended || !audio.src || !isPlayingRef.current) {
          lastWatchTime = audio.currentTime || 0
          lastWatchAt = performance.now()
          return
        }
        const now = performance.now()
        const cur = audio.currentTime || 0
        const progressed = cur > lastWatchTime + 0.08
        if (progressed) {
          lastWatchTime = cur
          lastWatchAt = now
          return
        }
        const nativeBufferingRecently = lastNativeBufferAt > 0 && now - lastNativeBufferAt < 8000
        const browserIsLoading = audio.networkState === audio.NETWORK_LOADING
        if (lastWatchAt && now - lastWatchAt > 12000 && audio.readyState >= 2 && !nativeBufferingRecently && !browserIsLoading) {
          recoverStalledPlayback()
        }
      }, 1500)

      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)
      audio.addEventListener('playing', handlePlaying)
      audio.addEventListener('play', handlePlay)
      audio.addEventListener('waiting', handleWaiting)
      audio.addEventListener('stalled', handleStalled)

      return () => {
        window.clearInterval(watchdog)
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
        audio.removeEventListener('playing', handlePlaying)
        audio.removeEventListener('play', handlePlay)
        audio.removeEventListener('waiting', handleWaiting)
        audio.removeEventListener('stalled', handleStalled)
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
      const url = resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/manifest.json`, 'manifest')
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
            const paraUrl = resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/${data.paragraphs[0].file}`)
            audio.src = paraUrl
            applyAudioRate(audio, speedRef.current)
            try { audio.load() } catch { /* ignore */ }
            if (data.paragraphs[1]) {
              warmAudioUrl(resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/${data.paragraphs[1].file}`))
            }
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

    const playParagraphDirect = useCallback((index: number) => {
      const m = manifestRef.current
      if (!m) {
        recordAudioDebug({ event: 'no-manifest', index })
        return
      }
      const para = m.paragraphs[index]
      if (!para) {
        recordAudioDebug({ event: 'no-paragraph', index, manifestLen: m.paragraphs.length })
        return
      }
      const audio = audioRef.current
      if (!audio) {
        recordAudioDebug({ event: 'no-audio-element', index })
        return
      }

      const url = resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/${para.file}`)
      // Explicit pause + load between src changes. Without load(), Android
      // System WebView (Boox) sometimes doesn't reload the new src — the
      // .play() call resolves against the OLD media-context, plays nothing.
      // load() forces a fresh fetch + media-context for the new url.
      try { audio.pause() } catch { /* ignore */ }
      audio.src = url
      applyAudioRate(audio, speedRef.current)
      try { audio.load() } catch { /* ignore — older WebViews may throw */ }
      const nextPara = m.paragraphs[index + 1]
      if (nextPara) {
        warmAudioUrl(resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/${nextPara.file}`))
      }
      audio.play().then(() => {
        setCurrentParagraph(index)
        currentParagraphRef.current = index
        setIsPlaying(true)
        onParagraphChange?.(para.paragraph)
        recordAudioDebug({ event: 'play-success', index, url, paragraph: para.paragraph })
      }).catch((err) => {
        // Autoplay blocked or network error. Log loudly so we can diagnose
        // the Boox-specific "disclaimer-then-silence" symptom — the catch
        // used to swallow it and the user just saw nothing.
        const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
        console.warn('[audio] play() rejected for', url, msg)
        recordAudioDebug({ event: 'play-rejected', index, url, error: msg })
        setIsPlaying(false)
      })
    }, [bookId, editionKey, chapterNumber, onParagraphChange])

    // Wraps playParagraph with a one-time-per-book AI-narration disclaimer.
    // Critical: the disclaimer plays through the SAME Audio element as the
    // book paragraphs (audioRef.current), not a freshly-created one. iOS
    // Safari and Android System WebView (the Boox case) gate autoplay per
    // Audio element — the user gesture unlocks the element it's called on.
    // Using a separate Audio for the disclaimer meant the main element was
    // never user-gesture-unlocked, so when the disclaimer ended and we
    // tried to play() the paragraph on the main element, the WebView
    // silently rejected it. Result: disclaimer played, then nothing.
    const playParagraph = useCallback((index: number) => {
      const disclaimerKey = `audio-disclaimer-heard:${bookId}`
      let heard = false
      try {
        heard = typeof localStorage !== 'undefined' && localStorage.getItem(disclaimerKey) === '1'
      } catch { /* private mode, ignore */ }

      // Capacitor Android (Boox e-reader): skip the disclaimer entirely.
      // System WebView's autoplay policy revokes the user-gesture unlock
      // when src changes between disclaimer end and paragraph play, so
      // chaining the two reliably blanks out the second play. The
      // disclaimer is a soft UX note ("AI narration may have errors") —
      // not load-bearing — and is far less important than working audio.
      const isCapacitorAndroid = typeof window !== 'undefined'
        && !!(window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor
        && (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.() === 'android'

      if (heard || isCapacitorAndroid) {
        if (isCapacitorAndroid) {
          // Mark heard so a future web-on-same-account session doesn't
          // re-play it for a book the user has already audio-listened to.
          try { localStorage.setItem(disclaimerKey, '1') } catch { /* ignore */ }
        }
        playParagraphDirect(index)
        return
      }

      const audio = audioRef.current
      if (!audio) {
        // Engine not ready yet — skip the disclaimer this time, mark heard.
        try { localStorage.setItem(disclaimerKey, '1') } catch { /* ignore */ }
        playParagraphDirect(index)
        return
      }

      // Mark heard up-front. If play fails for any reason, the next click
      // skips the disclaimer and goes straight to the paragraph — much
      // better than re-trying a failing disclaimer forever.
      try { localStorage.setItem(disclaimerKey, '1') } catch { /* ignore */ }

      const lang = editionKey.endsWith('-da') ? 'da' : 'en'
      const disclaimerUrl = resolveAudioUrl(`disclaimer-${lang}.mp3`)

      // Optimistic UI — flip Play state so the user sees feedback while the
      // disclaimer loads. The handleEnded effect listener will fire when the
      // disclaimer finishes; we replace it with our one-shot proceed handler.
      setIsPlaying(true)

      const proceed = () => {
        playingDisclaimerRef.current = false
        audio.removeEventListener('ended', onDone)
        audio.removeEventListener('error', onError)
        try { localStorage.setItem(disclaimerKey, '1') } catch { /* ignore */ }
        // Now play the actual paragraph on the SAME audio element. The element
        // was just user-gesture-unlocked by the disclaimer's play(), so this
        // .play() call will not be rejected by autoplay policy.
        playParagraphDirect(index)
      }
      const onDone = () => proceed()
      const onError = () => {
        // Disclaimer failed to load — don't block playback, still mark heard
        // so we don't retry on every play.
        proceed()
      }

      playingDisclaimerRef.current = true
      audio.addEventListener('ended', onDone, { once: true })
      audio.addEventListener('error', onError, { once: true })
      try { audio.pause() } catch { /* ignore */ }
      audio.src = disclaimerUrl
      applyAudioRate(audio, 1.0) // disclaimer always at 1x
      try { audio.load() } catch { /* ignore */ }
      recordAudioDebug({ event: 'disclaimer-start', url: disclaimerUrl })
      audio.play().then(() => {
        recordAudioDebug({ event: 'disclaimer-playing' })
      }).catch((err) => {
        const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
        recordAudioDebug({ event: 'disclaimer-rejected', error: msg })
        onError()
      })
    }, [bookId, editionKey, playParagraphDirect])

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
      cycleSpeed() {
        cycleSpeedRef.current()
      },
      getSpeed() {
        return speedRef.current
      },
      skipParagraphs(delta: number) {
        const m = manifestRef.current
        if (!m) return
        const next = Math.max(0, Math.min(m.paragraphs.length - 1, currentParagraphRef.current + delta))
        playParagraph(next)
      },
      skipSeconds(delta: number) {
        const m = manifestRef.current
        if (!m) return
        const audio = audioRef.current
        if (!audio) return
        const currentIdx = currentParagraphRef.current
        // Compute elapsed seconds up to the current position within the chapter.
        let elapsedBefore = 0
        for (let i = 0; i < currentIdx; i++) elapsedBefore += m.paragraphs[i].duration
        const currentElapsed = elapsedBefore + (audio.currentTime || 0)
        const totalDur = m.paragraphs.reduce((s, p) => s + p.duration, 0)
        const target = Math.max(0, Math.min(totalDur - 0.1, currentElapsed + delta))
        // Locate the paragraph that contains `target`.
        let cumulative = 0
        let targetIdx = m.paragraphs.length - 1
        let offsetInPara = m.paragraphs[m.paragraphs.length - 1]?.duration ?? 0
        for (let i = 0; i < m.paragraphs.length; i++) {
          const dur = m.paragraphs[i].duration
          if (cumulative + dur > target) {
            targetIdx = i
            offsetInPara = target - cumulative
            break
          }
          cumulative += dur
        }
        // Same paragraph — just seek the current element.
        if (targetIdx === currentIdx && audio.src) {
          audio.currentTime = Math.max(0, offsetInPara)
          return
        }
        // Different paragraph — swap src, wait for metadata, then seek.
        const nextPara = m.paragraphs[targetIdx]
        const wasPlaying = !audio.paused
        setCurrentParagraph(targetIdx)
        currentParagraphRef.current = targetIdx
        onParagraphChangeRef.current?.(nextPara.paragraph)
        lastProgressFireRef.current = 0
        onProgressChangeRef.current?.(0)
        const url = resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/${nextPara.file}`)
        const onLoaded = () => {
          audio.removeEventListener('loadedmetadata', onLoaded)
          try { audio.currentTime = Math.max(0, offsetInPara) } catch { /* ignore */ }
        }
        audio.addEventListener('loadedmetadata', onLoaded)
        audio.src = url
        applyAudioRate(audio, speedRef.current)
        try { audio.load() } catch { /* ignore */ }
        if (wasPlaying) {
          audio.play().catch(() => setIsPlaying(false))
        }
      },
      hasAudio() {
        return !!manifestRef.current
      },
      pausePlayback() {
        const audio = audioRef.current
        const m = manifestRef.current
        const idx = currentParagraphRef.current
        const para = m?.paragraphs[idx]
        const offset = audio?.currentTime || 0
        const wasPlaying = !!(audio && !audio.paused) || isPlayingRef.current
        if (audio && !audio.paused) {
          try { audio.pause() } catch { /* ignore */ }
        }
        setIsPlaying(false)
        return {
          anchor: {
            bookId,
            editionKey,
            chapterNumber,
            paragraphIndex: idx,
            paragraphNumber: para?.paragraph ?? idx,
            offsetSeconds: offset,
          },
          wasPlaying,
        }
      },
      resumePlayback(anchor) {
        if (anchor.bookId !== bookId || anchor.chapterNumber !== chapterNumber) return
        const m = manifestRef.current
        const audio = audioRef.current
        if (!m || !audio) return
        const idx = m.paragraphs.findIndex(p => p.paragraph === anchor.paragraphNumber)
        const targetIdx = idx >= 0 ? idx : Math.max(0, Math.min(m.paragraphs.length - 1, anchor.paragraphIndex))
        const para = m.paragraphs[targetIdx]
        if (!para) return
        const url = resolveAudioUrl(`${bookId}/${editionKey}/ch${chapterNumber}/${para.file}`)
        const offset = Math.max(0, anchor.offsetSeconds || 0)

        const startAtOffset = () => {
          try { audio.currentTime = offset } catch { /* ignore */ }
          applyAudioRate(audio, speedRef.current)
          audio.play().then(() => {
            setCurrentParagraph(targetIdx)
            currentParagraphRef.current = targetIdx
            setIsPlaying(true)
            onParagraphChangeRef.current?.(para.paragraph)
          }).catch(() => setIsPlaying(false))
        }

        const alreadyOnParagraph = !!audio.src && audio.src.includes(para.file)
        if (alreadyOnParagraph && audio.readyState >= 1) {
          startAtOffset()
          return
        }

        try { audio.pause() } catch { /* ignore */ }
        audio.src = url
        applyAudioRate(audio, speedRef.current)
        const onLoaded = () => {
          audio.removeEventListener('loadedmetadata', onLoaded)
          startAtOffset()
        }
        audio.addEventListener('loadedmetadata', onLoaded)
        try { audio.load() } catch { /* ignore */ }
      },
    }), [playParagraph, bookId, editionKey, chapterNumber])

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

    const cycleSpeedRef = useRef<() => void>(() => {})
    const cycleSpeed = useCallback(() => {
      const next = nextAudioSpeed(speedRef.current)
      speedRef.current = next
      cycleSpeedFromHook()
      // Re-apply immediately so the live audio element picks up the new rate
      // even before the next React render (otherwise the user hears 1s of
      // the old rate before the next effect fires).
      if (audioRef.current) {
        const audio = audioRef.current
        const wasPlaying = !audio.paused && !audio.ended
        const t = audio.currentTime || 0
        applyAudioRate(audio, next)
        recordAudioDebug({ event: 'speed-change', next, wasPlaying, currentTime: t, readyState: audio.readyState })
        if (wasPlaying) {
          try { audio.pause() } catch { /* ignore */ }
          try { audio.currentTime = t } catch { /* ignore */ }
          applyAudioRate(audio, next)
          audio.play().then(() => {
            setIsPlaying(true)
          }).catch((err) => {
            const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
            recordAudioDebug({ event: 'speed-change-replay-rejected', next, error: msg })
            setIsPlaying(false)
          })
        }
      }
    }, [cycleSpeedFromHook])
    cycleSpeedRef.current = cycleSpeed

    // Mobile nav — allow chapter advance when on first/last page
    const canGoPrev = currentPage > 0 || !!onPrevChapter
    const canGoNext = currentPage < totalPages - 1 || !!onNextChapter

    // Audio controls live in the AudioStrip at the top of the reader when
    // the headphones icon is open. BottomBar is now reading-progress only,
    // regardless of playback state — keeps the two UIs from competing.
    // cycleSpeed + togglePlay are still exposed via the imperative handle
    // so AudioStrip can drive the engine.

    // Compute the progress value to show on the right side per user's metric choice.
    const renderProgressValue = () => {
      const pd = progressDisplay || { metric: 'percent', scope: 'book' }
      const scope = pd.scope
      const metric = pd.metric

      const pct = scope === 'chapter' ? (chapterPercentComplete ?? Math.round(((currentPage + 1) / Math.max(totalPages, 1)) * 100))
        : scope === 'section' ? (sectionPercentComplete ?? percentComplete)
        : percentComplete
      const time = scope === 'chapter' ? (chapterTimeLabel ?? timeRemainingLabel)
        : scope === 'section' ? (sectionTimeLabel ?? timeRemainingLabel)
        : timeRemainingLabel
      const scopeLabel = scope === 'chapter' ? 'ch' : scope === 'section' ? 'sec' : ''

      if (metric === 'page') {
        if (scope === 'book' && bookCurrentPage && bookTotalPages) {
          return `${bookCurrentPage} / ${bookTotalPages}`
        }
        const pg = absoluteCurrentPage ?? (currentPage + 1)
        const tot = absoluteTotalPages ?? totalPages
        return `${pg} / ${tot}${scope === 'chapter' ? ' ch' : ''}`
      }
      if (metric === 'location') {
        if (scope === 'chapter' && locationCurrentChapter !== undefined && locationTotalChapter) {
          return `§${locationCurrentChapter} / ${locationTotalChapter}`
        }
        if (locationCurrent !== undefined && locationTotal) {
          return `Loc ${locationCurrent} / ${locationTotal}`
        }
      }
      if (metric === 'time') {
        return `${time}${scopeLabel ? ` (${scopeLabel})` : ''}${!isLearned && percentComplete > 0 ? ' (est.)' : ''}`
      }
      return `${pct}%${scopeLabel ? ` ${scopeLabel}` : ''}`
    }

    return (
      <div className="bottom-bar">
        <button
          className="bottom-bar-arrow"
          onClick={() => window.dispatchEvent(new CustomEvent('tinct:page-nav', { detail: { direction: 'prev' } }))}
          disabled={!canGoPrev}
          aria-label="Previous page"
        >
          &larr;
        </button>
        <div className="bottom-bar-center">
          {/* Always show short label "Chapter N" / "Book N" — long descriptive
              titles (e.g. Odyssey Butler summaries) overflow the running footer.
              Full title still appears in the chapter h2 at the top of the chapter. */}
          {chapterNumber !== undefined && chapterNumber > 0 && (
            <span className="bottom-bar-chapter">
              {chapterTitle && /^book\s/i.test(chapterTitle) ? `Book ${chapterNumber}` : `Chapter ${chapterNumber}`}
            </span>
          )}
        </div>
        <div className="bottom-bar-position">{renderProgressValue()}</div>
        <button
          className="bottom-bar-arrow"
          onClick={() => window.dispatchEvent(new CustomEvent('tinct:page-nav', { detail: { direction: 'next' } }))}
          disabled={!canGoNext}
          aria-label="Next page"
        >
          &rarr;
        </button>
      </div>
    )
  }
)
