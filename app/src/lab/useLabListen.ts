import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clipsFromFollowParagraphs,
  clipsFromManifest,
  followPlayingClip,
  labAudioFileUrl,
  labAudioManifestUrl,
  labAudioSidecarUrl,
  type LabAudioClip,
} from './labListen'
import { nextHearingSpeed, seekAcrossClips } from './labHearing'
import {
  followParagraphFromManifest,
  mergeSidecarWords,
  type FollowParagraph,
  type FollowTarget,
  type ManifestParagraph,
  type WordSidecar,
} from './labFollow'

export interface UseLabListenOptions {
  paragraphs: string[]
  followParagraphs: FollowParagraph[]
  createAudio?: () => HTMLAudioElement
}

function defaultCreateAudio(): HTMLAudioElement {
  const audio = new Audio()
  audio.preload = 'auto'
  return audio
}

export function useLabListen(options: UseLabListenOptions) {
  const [playing, setPlaying] = useState(false)
  const [follow, setFollow] = useState<FollowTarget>({ kind: 'none' })
  const [src, setSrc] = useState<string | null>(null)
  const [clipIndex, setClipIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [followParagraphs, setFollowParagraphs] = useState<FollowParagraph[]>(options.followParagraphs)
  const [clips, setClips] = useState<LabAudioClip[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const clipsRef = useRef<LabAudioClip[]>([])
  const paragraphsRef = useRef<FollowParagraph[]>(options.followParagraphs)
  const clipIndexRef = useRef(0)
  const playClipRef = useRef<(index: number, offsetSeconds: number) => boolean>(() => false)
  const optionsRef = useRef(options)
  optionsRef.current = options
  paragraphsRef.current = options.followParagraphs

  useEffect(() => {
    setFollowParagraphs(options.followParagraphs)
    paragraphsRef.current = options.followParagraphs
  }, [options.followParagraphs])

  const applyRate = useCallback((audio: HTMLAudioElement, rate: number) => {
    try { audio.playbackRate = rate } catch { /* jsdom */ }
  }, [])

  const syncFollow = useCallback((index: number, time: number) => {
    const clip = clipsRef.current[index]
    setCurrentTime(time)
    setFollow(followPlayingClip(paragraphsRef.current, clip, time))
  }, [])

  const attachAudio = useCallback((audio: HTMLAudioElement) => {
    const handleTimeUpdate = () => {
      syncFollow(clipIndexRef.current, audio.currentTime || 0)
    }
    const handleEnded = () => {
      const next = clipIndexRef.current + 1
      const clip = clipsRef.current[next]
      if (!clip) {
        setPlaying(false)
        setFollow({ kind: 'none' })
        setSrc(null)
        return
      }
      playClipRef.current(next, 0)
    }
    const handleError = () => {
      const next = clipIndexRef.current + 1
      if (next < clipsRef.current.length) playClipRef.current(next, 0)
      else {
        setPlaying(false)
        setFollow({ kind: 'none' })
      }
    }
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [syncFollow])

  const detachRef = useRef<(() => void) | null>(null)

  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current
    const audio = (optionsRef.current.createAudio || defaultCreateAudio)()
    audioRef.current = audio
    detachRef.current = attachAudio(audio)
    return audio
  }, [attachAudio])

  useEffect(() => () => {
    detachRef.current?.()
    const audio = audioRef.current
    if (audio) {
      try { audio.pause() } catch { /* jsdom */ }
      try { audio.removeAttribute('src') } catch { /* jsdom */ }
    }
    audioRef.current = null
  }, [])

  const playClip = useCallback((index: number, offsetSeconds: number) => {
    const audio = ensureAudio()
    const clip = clipsRef.current[index]
    if (!clip) return false
    const url = labAudioFileUrl(clip.file)
    clipIndexRef.current = index
    setClipIndex(index)
    setSrc(url)
    try { audio.pause() } catch { /* ignore */ }
    audio.src = url
    try { audio.load() } catch { /* ignore */ }
    const start = () => {
      if (offsetSeconds > 0) {
        try { audio.currentTime = offsetSeconds } catch { /* ignore */ }
      }
    }
    audio.addEventListener('loadedmetadata', start, { once: true })
    applyRate(audio, speed)
    syncFollow(index, offsetSeconds)
    audio.play().then(() => {
      applyRate(audio, speed)
      setPlaying(true)
      syncFollow(index, audio.currentTime || offsetSeconds)
    }).catch(() => {
      setPlaying(false)
    })
    return true
  }, [applyRate, ensureAudio, speed, syncFollow])
  playClipRef.current = playClip

  const resolveClips = useCallback(async (): Promise<LabAudioClip[]> => {
    const fromSource = clipsFromFollowParagraphs(optionsRef.current.followParagraphs)
    if (fromSource.length > 0) {
      clipsRef.current = fromSource
      setClips(fromSource)
      paragraphsRef.current = optionsRef.current.followParagraphs
      setFollowParagraphs(optionsRef.current.followParagraphs)
      return fromSource
    }

    const [manifestRes, sidecarRes] = await Promise.all([
      fetch(labAudioManifestUrl()),
      fetch(labAudioSidecarUrl()).catch(() => null),
    ])
    if (!manifestRes.ok) return []
    const manifest = await manifestRes.json() as { paragraphs?: ManifestParagraph[] }
    let followed = optionsRef.current.paragraphs.map((text, index) => {
      const entries = manifest.paragraphs || []
      const match = entries.find(entry => entry.paragraph === index)
        || entries.find(entry => entry.paragraph === index + 1)
      return followParagraphFromManifest(index, text, match)
    })
    if (sidecarRes && 'ok' in sidecarRes && sidecarRes.ok) {
      const sidecar = await sidecarRes.json() as WordSidecar
      followed = mergeSidecarWords(followed, sidecar)
    }
    paragraphsRef.current = followed
    setFollowParagraphs(followed)
    const clips = clipsFromManifest(optionsRef.current.paragraphs, manifest.paragraphs || [])
      .map((clip) => {
        const words = followed.find(item => item.index === clip.index)?.words
        return words ? { ...clip, words } : clip
      })
    clipsRef.current = clips
    setClips(clips)
    return clips
  }, [])

  const start = useCallback(async () => {
    const clips = await resolveClips()
    if (clips.length === 0) return false
    return playClip(0, 0)
  }, [playClip, resolveClips])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setPlaying(false)
  }, [])

  const resume = useCallback(() => {
    const audio = audioRef.current
    if (!audio?.src) {
      void start()
      return
    }
    applyRate(audio, speed)
    audio.play().then(() => {
      applyRate(audio, speed)
      setPlaying(true)
      syncFollow(clipIndexRef.current, audio.currentTime || 0)
    }).catch(() => {
      setPlaying(false)
    })
  }, [applyRate, speed, start, syncFollow])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
    }
    clipIndexRef.current = 0
    setClipIndex(0)
    setCurrentTime(0)
    setPlaying(false)
    setFollow({ kind: 'none' })
    setSrc(null)
  }, [])

  const seek = useCallback((deltaSeconds: number) => {
    const audio = ensureAudio()
    const point = seekAcrossClips({
      clips: clipsRef.current,
      clipIndex: clipIndexRef.current,
      currentTime: audio.currentTime || currentTime,
      deltaSeconds,
      knownDuration: Number.isFinite(audio.duration) ? audio.duration : undefined,
    })
    const sameClip = point.clipIndex === clipIndexRef.current && audio.src
    if (sameClip) {
      try { audio.currentTime = point.offsetSeconds } catch { /* ignore */ }
      syncFollow(point.clipIndex, point.offsetSeconds)
      return
    }
    playClip(point.clipIndex, point.offsetSeconds)
    if (!playing) {
      audio.pause()
      setPlaying(false)
    }
  }, [currentTime, ensureAudio, playClip, playing, syncFollow])

  const cycleSpeed = useCallback(() => {
    setSpeed((current) => {
      const next = nextHearingSpeed(current)
      if (audioRef.current) applyRate(audioRef.current, next)
      return next
    })
  }, [applyRate])

  return {
    playing,
    follow,
    followParagraphs,
    clips,
    src,
    clipIndex,
    currentTime,
    speed,
    start,
    pause,
    resume,
    stop,
    seek,
    cycleSpeed,
  }
}
