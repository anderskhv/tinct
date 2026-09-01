import { useEffect, useState } from 'react'
import type { BottomBarHandle } from './BottomBar'
import type { VoiceModeState } from '../voice/types'
import { AUDIO_SPEED_CHANGE_EVENT } from '../hooks/useAudioSpeed'

interface AudioStripProps {
  isOpen: boolean
  onClose: () => void
  isPlaying: boolean
  /** Imperative handle to the BottomBar's audio engine. */
  audioRef: React.RefObject<BottomBarHandle>
  voiceState?: VoiceModeState
  voiceStatus?: string | null
  onVoiceButton?: () => void
  onPlayWhileVoice?: () => void
}

function voiceButtonLabel(state: VoiceModeState | undefined): string {
  if (state && state !== 'reading') return 'End voice'
  switch (state) {
    default:
      return 'Ask'
  }
}

export function AudioStrip({
  isOpen,
  onClose,
  isPlaying,
  audioRef,
  voiceState = 'reading',
  voiceStatus,
  onVoiceButton,
  onPlayWhileVoice,
}: AudioStripProps) {
  // Local mirror so the speed pill updates immediately on click — the underlying
  // engine state is in BottomBar; we just read it.
  const [speed, setSpeed] = useState<number>(() => audioRef.current?.getSpeed() ?? 1)
  const voiceActive = voiceState !== 'reading'

  useEffect(() => {
    if (!isOpen) return
    setSpeed(audioRef.current?.getSpeed() ?? 1)
  }, [isOpen, audioRef])

  useEffect(() => {
    const handleSpeedChange = (event: Event) => {
      const rate = (event as CustomEvent<number>).detail
      if (typeof rate === 'number') setSpeed(rate)
    }
    window.addEventListener(AUDIO_SPEED_CHANGE_EVENT, handleSpeedChange)
    return () => window.removeEventListener(AUDIO_SPEED_CHANGE_EVENT, handleSpeedChange)
  }, [])

  if (!isOpen) return null

  return (
    <div className="audio-strip" data-tour="audio-strip" role="region" aria-label="Audiobook player">
      <button
        type="button"
        className="audio-strip-btn audio-strip-btn-sm"
        onClick={() => audioRef.current?.skipParagraphs(-1)}
        title="Previous paragraph"
        aria-label="Previous paragraph"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" y1="19" x2="5" y2="5" />
        </svg>
      </button>

      <button
        type="button"
        className="audio-strip-btn"
        onClick={() => audioRef.current?.skipSeconds(-15)}
        title="Back 15 seconds"
        aria-label="Back 15 seconds"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 2.64-6.36" />
          <polyline points="3 4 3 10 9 10" />
        </svg>
        <span className="audio-strip-seek-label">15</span>
      </button>

      <button
        type="button"
        className="audio-strip-play"
        onClick={() => {
          if (voiceActive && onPlayWhileVoice) {
            onPlayWhileVoice()
            return
          }
          audioRef.current?.togglePlay()
        }}
        aria-label={voiceActive ? 'Back to the book' : isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying && !voiceActive ? <span className="icon-pause" /> : <span className="icon-play" />}
      </button>

      <button
        type="button"
        className="audio-strip-btn"
        onClick={() => audioRef.current?.skipSeconds(15)}
        title="Forward 15 seconds"
        aria-label="Forward 15 seconds"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <polyline points="21 4 21 10 15 10" />
        </svg>
        <span className="audio-strip-seek-label">15</span>
      </button>

      <button
        type="button"
        className="audio-strip-btn audio-strip-btn-sm"
        onClick={() => audioRef.current?.skipParagraphs(1)}
        title="Next paragraph"
        aria-label="Next paragraph"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      </button>

      <div className="audio-strip-spacer" />

      {voiceStatus && (
        <div className="audio-strip-voice-status" aria-live="polite">{voiceStatus}</div>
      )}

      {onVoiceButton && (
        <button
          type="button"
          className={`audio-strip-voice${voiceActive ? ' is-active' : ''}${voiceState === 'listening' ? ' is-listening' : ''}`}
          onClick={onVoiceButton}
          title={voiceActive ? 'End voice and return to the book' : 'Ask a question by voice'}
          aria-label={voiceActive ? 'End voice and return to the book' : 'Ask a question by voice'}
          aria-pressed={voiceActive}
        >
          {voiceButtonLabel(voiceState)}
        </button>
      )}

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
