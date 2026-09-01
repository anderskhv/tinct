import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clipsFromFollowParagraphs,
  clipsFromManifest,
  followPlayingClip,
  labAudioFileUrl,
  labAudioManifestUrl,
  labAudioSidecarUrl,
  measureFollowParagraphWords,
  readLabWordSidecar,
  type LabAudioClip,
} from './labListen'
import { nextHearingSpeed, parseHearingSpeed, playbackTimeSeconds, seekAcrossClips } from './labHearing'
import {
  followParagraphFromManifest,
  mergeSidecarWords,
  paragraphHasWordTimings,
  type FollowParagraph,
  type FollowTarget,
  type ManifestParagraph,
} from './labFollow'

export interface UseLabListenOptions {
  paragraphs: string[]
  followParagraphs: FollowParagraph[]
  chapterNumber?: number
  audioEdition?: string
  createAudio?: () => HTMLAudioElement
}

function chapterHasWordTimings(paragraphs: FollowParagraph[]): boolean {
  return paragraphs.some(paragraph => paragraphHasWordTimings(paragraph))
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
  const [speed, setSpeedState] = useState(1)
  const [followParagraphs, setFollowParagraphs] = useState<FollowParagraph[]>(options.followParagraphs)
  const [clips, setClips] = useState<LabAudioClip[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const clipsRef = useRef<LabAudioClip[]>([])
  const paragraphsRef = useRef<FollowParagraph[]>(options.followParagraphs)
  const clipIndexRef = useRef(0)
  const positionRef = useRef({ clipIndex: 0, time: 0 })
  const playClipRef = useRef<(index: number, offsetSeconds: number, andPlay?: boolean) => boolean>(() => false)
  const switchingRef = useRef(false)
  const optionsRef = useRef(options)
  optionsRef.current = options
  paragraphsRef.current = followParagraphs

  const audioChapter = () => optionsRef.current.chapterNumber ?? 1
  const audioEdition = () => optionsRef.current.audioEdition || 'kjv-en'

  const commitFollowParagraphs = useCallback((followed: FollowParagraph[]) => {
    paragraphsRef.current = followed
    setFollowParagraphs(followed)
    return followed
  }, [])

  useEffect(() => {
    setFollowParagraphs(options.followParagraphs)
    clipsRef.current = []
    setClips([])
    setSrc(null)
    setPlaying(false)
    setFollow({ kind: 'none' })
  }, [options.chapterNumber])

  useEffect(() => {
    setFollowParagraphs((current) => {
      if (chapterHasWordTimings(current)) return current
      return options.followParagraphs
    })
  }, [options.followParagraphs])

  const applyRate = useCallback((audio: HTMLAudioElement, rate: number) => {
    try { audio.playbackRate = rate } catch { /* jsdom */ }
  }, [])

  const syncFollow = useCallback((index: number, time: number, playbackRate?: number) => {
    const clip = clipsRef.current[index]
    const audio = audioRef.current
    const rate = playbackRate ?? audio?.playbackRate ?? speed
    if (Number.isFinite(time) && (time > 0 || positionRef.current.time === 0 || positionRef.current.clipIndex !== index)) {
      positionRef.current = { clipIndex: index, time: Math.max(0, time) }
    }
    setCurrentTime(positionRef.current.time)
    setFollow(followPlayingClip(paragraphsRef.current, clip, positionRef.current.time))
  }, [speed])

  const attachAudio = useCallback((audio: HTMLAudioElement) => {
    const handleTimeUpdate = () => {
      syncFollow(clipIndexRef.current, audio.currentTime || 0)
    }
    const handleEnded = () => {
      // Safari fires ended again when src changes on an already-ended element.
      if (switchingRef.current) return
      const next = clipIndexRef.current + 1
      const clip = clipsRef.current[next]
      if (!clip) {
        try { audio.pause() } catch { /* ignore */ }
        setPlaying(false)
        setFollow({ kind: 'none' })
        setSrc(null)
        return
      }
      playClipRef.current(next, 0)
    }
    const handleError = () => {
      if (switchingRef.current) return
      const next = clipIndexRef.current + 1
      if (next < clipsRef.current.length) playClipRef.current(next, 0)
      else {
        try { audio.pause() } catch { /* ignore */ }
        setPlaying(false)
        setFollow({ kind: 'none' })
        setSrc(null)
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

  useEffect(() => {
    if (!playing) return
    let frame = 0
    const tick = () => {
      const audio = audioRef.current
      if (audio) {
        const time = playbackTimeSeconds(audio.currentTime || 0, positionRef.current.time)
        if (time > 0 || positionRef.current.time === 0) {
          syncFollow(clipIndexRef.current, time, audio.playbackRate || speed)
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, speed, syncFollow])

  useEffect(() => () => {
    detachRef.current?.()
    const audio = audioRef.current
    if (audio) {
      try { audio.pause() } catch { /* jsdom */ }
      try { audio.removeAttribute('src') } catch { /* jsdom */ }
    }
    audioRef.current = null
  }, [])

  const playClip = useCallback((index: number, offsetSeconds: number, andPlay = true) => {
    const audio = ensureAudio()
    const clip = clipsRef.current[index]
    if (!clip) return false
    const url = labAudioFileUrl(clip.file, audioChapter(), audioEdition())
    switchingRef.current = true
    clipIndexRef.current = index
    setClipIndex(index)
    setSrc(url)
    const sameSrc = audio.src === url || audio.src.endsWith(url)
    try { audio.pause() } catch { /* ignore */ }
    if (!sameSrc) {
      audio.src = url
      try { audio.currentTime = offsetSeconds } catch { /* ignore */ }
      try { audio.load() } catch { /* ignore */ }
    }
    const applyOffset = () => {
      if (offsetSeconds > 0 || audio.currentTime !== offsetSeconds) {
        try { audio.currentTime = offsetSeconds } catch { /* ignore */ }
      }
    }
    applyOffset()
    if (!sameSrc) audio.addEventListener('loadedmetadata', applyOffset, { once: true })
    applyRate(audio, speed)
    const armed = () => { switchingRef.current = false }
    audio.addEventListener('playing', armed, { once: true })
    audio.addEventListener('timeupdate', armed, { once: true })
    if (!andPlay) {
      try { audio.pause() } catch { /* ignore */ }
      switchingRef.current = false
      setPlaying(false)
      setCurrentTime(offsetSeconds)
      setFollow({ kind: 'none' })
      return true
    }
    syncFollow(index, offsetSeconds)
    setPlaying(true)
    audio.play().then(() => {
      applyRate(audio, speed)
      switchingRef.current = false
      syncFollow(index, audio.currentTime || offsetSeconds)
    }).catch(() => {
      switchingRef.current = false
      if (index + 1 < clipsRef.current.length) {
        playClipRef.current(index + 1, 0, true)
        return
      }
      setPlaying(false)
      setFollow({ kind: 'none' })
    })
    return true
  }, [applyRate, ensureAudio, speed, syncFollow])
  playClipRef.current = playClip

  const playPlace = useCallback((
    clips: LabAudioClip[],
    place: { paragraphIndex?: number; wordIndex?: number } | undefined,
    andPlay: boolean,
  ) => {
    const paragraphIndex = place?.paragraphIndex ?? 0
    let index = clips.findIndex(clip => clip.index === paragraphIndex)
    if (index < 0) index = 0
    const words = clips[index]?.words
    const wordIndex = place?.wordIndex ?? 0
    const clamped = words && words.length > 0
      ? Math.max(0, Math.min(wordIndex, words.length - 1))
      : 0
    const offset = words?.[clamped]?.start ?? 0
    return playClip(index, offset, andPlay)
  }, [playClip])

  const resolveClips = useCallback(async (): Promise<LabAudioClip[]> => {
    const chapter = audioChapter()
    const edition = audioEdition()

    const attachWords = (followed: FollowParagraph[], clips: LabAudioClip[]) => {
      const withWords = clips.map((clip) => {
        const words = followed.find(item => item.index === clip.index)?.words
        return words ? { ...clip, words } : clip
      })
      clipsRef.current = withWords
      setClips(withWords)
      return withWords
    }

    const fromSource = clipsFromFollowParagraphs(optionsRef.current.followParagraphs)
    if (fromSource.length > 0) {
      let followed = chapterHasWordTimings(optionsRef.current.followParagraphs)
        ? optionsRef.current.followParagraphs
        : paragraphsRef.current
      if (!chapterHasWordTimings(followed)) {
        const sidecarRes = await fetch(labAudioSidecarUrl(chapter, edition)).catch(() => null)
        followed = mergeSidecarWords(optionsRef.current.followParagraphs, await readLabWordSidecar(sidecarRes))
      }
      if (!chapterHasWordTimings(followed)) {
        followed = await measureFollowParagraphWords(followed, chapter, edition)
      }
      followed = commitFollowParagraphs(followed)
      return attachWords(followed, fromSource)
    }

    const [manifestRes, sidecarRes] = await Promise.all([
      fetch(labAudioManifestUrl(chapter, edition)),
      fetch(labAudioSidecarUrl(chapter, edition)).catch(() => null),
    ])
    if (!manifestRes.ok) return []
    const manifest = await manifestRes.json() as { paragraphs?: ManifestParagraph[] }
    let followed = mergeSidecarWords(
      optionsRef.current.paragraphs.map((text, index) => {
        const entries = manifest.paragraphs || []
        const match = entries.find(entry => entry.paragraph === index)
          || entries.find(entry => entry.paragraph === index + 1)
        return followParagraphFromManifest(index, text, match)
      }),
      await readLabWordSidecar(sidecarRes),
    )
    if (!chapterHasWordTimings(followed)) {
      followed = await measureFollowParagraphWords(followed, chapter, edition)
    }
    followed = commitFollowParagraphs(followed)
    const clips = clipsFromManifest(optionsRef.current.paragraphs, manifest.paragraphs || [])
    return attachWords(followed, clips)
  }, [commitFollowParagraphs])

  const start = useCallback(async (place?: { paragraphIndex: number; wordIndex?: number }) => {
    const clips = await resolveClips()
    if (clips.length === 0) return false
    return playPlace(clips, place, true)
  }, [playPlace, resolveClips])

  const seekToPlace = useCallback((paragraphIndex: number, wordIndex: number) => {
    const clips = clipsRef.current
    if (clips.length === 0) return
    playPlace(clips, { paragraphIndex, wordIndex }, playing)
  }, [playPlace, playing])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setPlaying(false)
    setFollow({ kind: 'none' })
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
    const live = playbackTimeSeconds(audio.currentTime || 0, positionRef.current.time || currentTime)
    const point = seekAcrossClips({
      clips: clipsRef.current,
      clipIndex: clipIndexRef.current,
      currentTime: live,
      deltaSeconds,
      knownDuration: Number.isFinite(audio.duration) ? audio.duration : undefined,
    })
    positionRef.current = { clipIndex: point.clipIndex, time: point.offsetSeconds }
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
    setSpeedState((current) => {
      const next = nextHearingSpeed(current)
      if (audioRef.current) applyRate(audioRef.current, next)
      return next
    })
  }, [applyRate])

  const setSpeed = useCallback((rate: number) => {
    const next = parseHearingSpeed(rate)
    if (next == null) return
    setSpeedState(next)
    if (audioRef.current) applyRate(audioRef.current, next)
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
    seekToPlace,
    pause,
    resume,
    stop,
    seek,
    cycleSpeed,
    setSpeed,
  }
}
