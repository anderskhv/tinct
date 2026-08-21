import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AudioPlaybackAnchor, AudioPlaybackPause } from '../voice/types'
import {
  followAtPlayback,
  labAudioManifestUrl,
  labAudioSidecarUrl,
  labParagraphAudioUrl,
  mergeFollowAudio,
  nextPlayableIndex,
  wordsByParagraphFromSidecar,
  LAB_AUDIO_BOOK_ID,
  LAB_AUDIO_CHAPTER,
  LAB_AUDIO_EDITION,
} from './labListen'
import type { FollowParagraph, FollowTarget, ManifestParagraph } from './labFollow'

export interface UseLabListenOptions {
  followParagraphs: FollowParagraph[]
}

function emptyAnchor(paragraphIndex: number, offsetSeconds: number): AudioPlaybackAnchor {
  return {
    bookId: LAB_AUDIO_BOOK_ID,
    editionKey: LAB_AUDIO_EDITION,
    chapterNumber: LAB_AUDIO_CHAPTER,
    paragraphIndex,
    paragraphNumber: paragraphIndex + 1,
    offsetSeconds,
  }
}

export function useLabListen(options: UseLabListenOptions) {
  const [paragraphs, setParagraphs] = useState<FollowParagraph[]>(options.followParagraphs)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const paragraphsRef = useRef(paragraphs)
  const playingIndexRef = useRef<number | null>(null)
  const isPlayingRef = useRef(false)
  const currentTimeRef = useRef(0)

  paragraphsRef.current = paragraphs
  playingIndexRef.current = playingIndex
  isPlayingRef.current = isPlaying
  currentTimeRef.current = currentTime

  useEffect(() => {
    setParagraphs(current => mergeFollowAudio(options.followParagraphs, [], undefined).map((item, index) => ({
      ...item,
      file: item.file || current[index]?.file,
      words: item.words || current[index]?.words,
      duration: item.duration ?? current[index]?.duration,
    })))
  }, [options.followParagraphs])

  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current
    const audio = new Audio()
    audio.preload = 'auto'
    audioRef.current = audio
    return audio
  }, [])

  const playIndex = useCallback((index: number, offsetSeconds = 0) => {
    const next = nextPlayableIndex(paragraphsRef.current, index)
    if (next == null) {
      setIsPlaying(false)
      setPlayingIndex(null)
      return false
    }
    const paragraph = paragraphsRef.current[next]
    if (!paragraph?.file) return false

    const audio = getAudio()
    const url = labParagraphAudioUrl(paragraph.file)
    try { audio.pause() } catch { /* ignore */ }
    audio.src = url
    try { audio.load() } catch { /* older WebViews may throw */ }
    const applyOffset = () => {
      if (offsetSeconds > 0 && Number.isFinite(offsetSeconds)) {
        try { audio.currentTime = offsetSeconds } catch { /* not seekable yet */ }
      }
    }
    applyOffset()
    const nextFile = paragraphsRef.current[next + 1]?.file
    if (nextFile) {
      void fetch(labParagraphAudioUrl(nextFile), { cache: 'force-cache' }).catch(() => { /* warmup */ })
    }

    setPlayingIndex(paragraph.index)
    setCurrentTime(offsetSeconds)
    playingIndexRef.current = paragraph.index
    currentTimeRef.current = offsetSeconds

    void audio.play().then(() => {
      applyOffset()
      setIsPlaying(true)
      isPlayingRef.current = true
    }).catch(() => {
      setIsPlaying(false)
      isPlayingRef.current = false
    })
    return true
  }, [getAudio])

  useEffect(() => {
    const audio = getAudio()
    const onTime = () => {
      const time = audio.currentTime
      currentTimeRef.current = time
      setCurrentTime(time)
    }
    const onEnded = () => {
      const current = playingIndexRef.current
      const next = current == null ? null : nextPlayableIndex(paragraphsRef.current, current + 1)
      if (next == null) {
        setIsPlaying(false)
        isPlayingRef.current = false
        return
      }
      playIndex(next)
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
    }
  }, [getAudio, playIndex])

  useEffect(() => () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src')
  }, [])

  const loadRemoteAudio = useCallback(async () => {
    if (paragraphsRef.current.some(item => item.file)) return paragraphsRef.current
    try {
      const [manifestRes, sidecarRes] = await Promise.all([
        fetch(labAudioManifestUrl()),
        fetch(labAudioSidecarUrl()).catch(() => null),
      ])
      if (!manifestRes.ok) return paragraphsRef.current
      const manifest = await manifestRes.json() as { paragraphs?: ManifestParagraph[] }
      const sidecar = sidecarRes && 'ok' in sidecarRes && sidecarRes.ok
        ? wordsByParagraphFromSidecar(await sidecarRes.json())
        : undefined
      const merged = mergeFollowAudio(paragraphsRef.current, manifest.paragraphs || [], sidecar)
      paragraphsRef.current = merged
      setParagraphs(merged)
      return merged
    } catch {
      return paragraphsRef.current
    }
  }, [])

  const start = useCallback(async () => {
    const ready = await loadRemoteAudio()
    paragraphsRef.current = ready
    playIndex(0)
  }, [loadRemoteAudio, playIndex])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
    }
    setIsPlaying(false)
    isPlayingRef.current = false
    setPlayingIndex(null)
    setCurrentTime(0)
  }, [])

  const pausePlayback = useCallback((): AudioPlaybackPause | null => {
    const audio = audioRef.current
    const index = playingIndexRef.current
    if (index == null || !audio) return null
    const wasPlaying = isPlayingRef.current && !audio.paused
    const offset = audio.currentTime || currentTimeRef.current
    audio.pause()
    setIsPlaying(false)
    isPlayingRef.current = false
    return {
      wasPlaying,
      anchor: emptyAnchor(index, offset),
    }
  }, [])

  const resumePlayback = useCallback((anchor: AudioPlaybackAnchor) => {
    void loadRemoteAudio().then(ready => {
      paragraphsRef.current = ready
      playIndex(anchor.paragraphIndex, anchor.offsetSeconds)
    })
  }, [loadRemoteAudio, playIndex])

  const resumeLast = useCallback(() => {
    const index = playingIndexRef.current ?? 0
    playIndex(index, currentTimeRef.current)
  }, [playIndex])

  const follow: FollowTarget = useMemo(() => {
    if (!isPlaying) return { kind: 'none' }
    return followAtPlayback(paragraphs, playingIndex, currentTime)
  }, [currentTime, isPlaying, paragraphs, playingIndex])

  return {
    isPlaying,
    playingIndex,
    follow,
    start,
    stop,
    resumeLast,
    pausePlayback,
    resumePlayback,
  }
}
