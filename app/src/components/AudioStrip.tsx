import { useEffect, useState } from 'react'
import type { BottomBarHandle } from './BottomBar'

interface AudioStripProps {
  isOpen: boolean
  onClose: () => void
  isPlaying: boolean
  /** Index of the paragraph the engine is currently playing (in book-local order). */
  playingParagraphIndex?: number
  /** Title of the chapter the engine is currently in. */
  chapterTitle?: string
  /** Text of the currently-playing paragraph (for the preview line). */
  paragraphPreview?: string
  /** Imperative handle to the BottomBar's audio engine. */
  audioRef: React.RefObject<BottomBarHandle>
}

export function AudioStrip({
  isOpen,
  onClose,
  isPlaying,
  playingParagraphIndex,
  chapterTitle,
  paragraphPreview,
  audioRef,
}: AudioStripProps) {
  // Local mirror so the speed pill updates immediately on click — the underlying
  // engine state is in BottomBar; we just read it.
  const [speed, setSpeed] = useState<number>(() => audioRef.current?.getSpeed() ?? 1)

  useEffect(() => {
    if (!isOpen) return
    setSpeed(audioRef.current?.getSpeed() ?? 1)
  }, [isOpen, audioRef])

  if (!isOpen) return null

  const trimmedPreview = paragraphPreview && paragraphPreview.length > 0
    ? paragraphPreview.length > 220 ? paragraphPreview.slice(0, 220) + '\u2026' : paragraphPreview
    : null

  return (
    <div className="audio-strip" role="region" aria-label="Audiobook player">
      <button
        type="button"
        className="audio-strip-btn"
        onClick={() => audioRef.current?.skipParagraphs(-1)}
        title="Previous paragraph"
        aria-label="Previous paragraph"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="14 6 8 12 14 18" />
        </svg>
      </button>

      <button
        type="button"
        className="audio-strip-play"
        onClick={() => audioRef.current?.togglePlay()}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <span className="icon-pause" /> : <span className="icon-play" />}
      </button>

      <button
        type="button"
        className="audio-strip-btn"
        onClick={() => audioRef.current?.skipParagraphs(1)}
        title="Next paragraph"
        aria-label="Next paragraph"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="10 6 16 12 10 18" />
        </svg>
      </button>

      <div className="audio-strip-nowplaying">
        <div className="audio-strip-meta">
          <span className="audio-strip-meta-left">
            {isPlaying ? 'Now playing' : 'Paused'}
            {chapterTitle ? ` \u00b7 ${chapterTitle}` : ''}
            {playingParagraphIndex != null ? ` \u00b7 \u00b62 of ${playingParagraphIndex + 1}` : ''}
          </span>
        </div>
        {trimmedPreview && (
          <div className="audio-strip-preview">&ldquo;{trimmedPreview}&rdquo;</div>
        )}
      </div>

      <button
        type="button"
        className="audio-strip-speed"
        onClick={() => {
          audioRef.current?.cycleSpeed()
          setSpeed(audioRef.current?.getSpeed() ?? 1)
        }}
        title="Playback speed"
      >
        {speed}&times;
      </button>

      <button
        type="button"
        className="audio-strip-close"
        onClick={onClose}
        title="Hide audio player"
        aria-label="Hide audio player"
      >
        &times;
      </button>
    </div>
  )
}
