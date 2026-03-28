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

export interface AudioPlayerHandle {
  seekToParagraph: (index: number) => void
}

interface AudioPlayerProps {
  bookId: string
  editionKey: string
  chapterNumber: number
  /** Callback when the currently playing paragraph changes */
  onParagraphChange?: (paragraphIndex: number) => void
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2]

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  function AudioPlayer({ bookId, editionKey, chapterNumber, onParagraphChange }, ref) {
    const [manifest, setManifest] = useState<AudioManifest | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentParagraph, setCurrentParagraph] = useState(0)
    const [progress, setProgress] = useState(0)
    const [hasAudio, setHasAudio] = useState(false)
    const [speed, setSpeed] = useState(1)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const speedRef = useRef(speed)
    speedRef.current = speed

    // Load manifest for this chapter
    useEffect(() => {
      const url = `${AUDIO_BASE_URL}/${bookId}/${editionKey}/ch${chapterNumber}/manifest.json`
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

    // Play the current paragraph
    const playParagraph = useCallback((index: number) => {
      if (!manifest) return
      const para = manifest.paragraphs[index]
      if (!para) return

      const url = `${AUDIO_BASE_URL}/${bookId}/${editionKey}/ch${chapterNumber}/${para.file}`

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
      }

      const audio = new Audio(url)
      audio.playbackRate = speedRef.current
      audioRef.current = audio

      audio.addEventListener('timeupdate', () => {
        if (audio.duration > 0) {
          setProgress(audio.currentTime / audio.duration)
        }
      })

      audio.addEventListener('ended', () => {
        // Auto-advance to next paragraph
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

    // Expose seekToParagraph to parent
    useImperativeHandle(ref, () => ({
      seekToParagraph(paragraphIndex: number) {
        if (!manifest) return
        // Find the manifest entry matching this paragraph index
        const idx = manifest.paragraphs.findIndex(p => p.paragraph === paragraphIndex)
        if (idx >= 0) {
          playParagraph(idx)
        }
      }
    }), [manifest, playParagraph])

    const togglePlay = useCallback(() => {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        playParagraph(currentParagraph)
      }
    }, [isPlaying, currentParagraph, playParagraph])

    const skipBack = useCallback(() => {
      const prev = Math.max(0, currentParagraph - 1)
      playParagraph(prev)
    }, [currentParagraph, playParagraph])

    const skipForward = useCallback(() => {
      if (!manifest) return
      const next = Math.min(manifest.paragraphs.length - 1, currentParagraph + 1)
      playParagraph(next)
    }, [currentParagraph, manifest, playParagraph])

    const cycleSpeed = useCallback(() => {
      setSpeed(prev => {
        const idx = SPEED_OPTIONS.indexOf(prev)
        const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]
        if (audioRef.current) {
          audioRef.current.playbackRate = next
        }
        return next
      })
    }, [])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        audioRef.current?.pause()
      }
    }, [])

    if (!hasAudio) return null

    // Calculate total duration and current position
    const totalDuration = manifest?.paragraphs.reduce((sum, p) => sum + p.duration, 0) || 0
    const elapsedDuration = manifest
      ? manifest.paragraphs.slice(0, currentParagraph).reduce((sum, p) => sum + p.duration, 0)
        + (manifest.paragraphs[currentParagraph]?.duration || 0) * progress
      : 0

    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
      <div className="audio-player">
        <button className="audio-btn" onClick={skipBack} title="Previous paragraph">
          ⏮
        </button>
        <button className="audio-btn audio-play" onClick={togglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="audio-btn" onClick={skipForward} title="Next paragraph">
          ⏭
        </button>
        <div className="audio-progress">
          <div className="audio-progress-bar">
            <div
              className="audio-progress-fill"
              style={{ width: `${totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0}%` }}
            />
          </div>
          <span className="audio-time">
            {formatTime(elapsedDuration)} / {formatTime(totalDuration)}
          </span>
        </div>
        <button className="audio-speed-btn" onClick={cycleSpeed} title="Playback speed">
          {speed}x
        </button>
      </div>
    )
  }
)
