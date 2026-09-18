import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clipsFromFollowParagraphs,
  clipsFromManifest,
  followPlayingClip,
  labAudioFileUrl,
  labAudioManifestUrl,
  labAudioSidecarUrl,
  readLabWordSidecar,
  steppedPlaybackTime,
  type LabAudioClip,
  type LabAudioTitleClip,
} from './labListen'
import { sentenceStartWordIndex, nextHearingSpeed, parseHearingSpeed, playbackTimeSeconds, seekAcrossClips } from './labHearing'
import { playAudioTransition, setAudioSource } from '../utils/audioPlayback'
import { NarrationEnsureError, narrationFailureMessage, type NarrationParagraphResult } from './labNarration'
import { narrationTextForParagraph, sha256Hex } from '../narration/narrationCore'
import {
  alignTimedWordsToText,
  followParagraphFromManifest,
  isSameFollowTarget,
  mergeSidecarWords,
  paragraphHasWordTimings,
  wordsFromManifestParagraph,
  type FollowParagraph,
  type FollowTarget,
  type ManifestParagraph,
} from './labFollow'

// Validated word timestamps use media time; a small fixed visual lead prevents
// the painted word from feeling behind the voice on mobile audio output. This
// changes only follow paint; seeking and persisted playback time stay exact.
export const LAB_FOLLOW_LEAD_SECONDS = 0.08

export interface UseLabListenOptions {
  playbackUnavailable?: boolean
  /** V2: cancelled or superseded play requests cannot skip or repaint clips. */
  guardPlaybackRequests?: boolean
  bookId?: string
  paragraphs: string[]
  followParagraphs: FollowParagraph[]
  chapterNumber?: number
  audioEdition?: string
  playbackSpeed?: number
  onPlaybackSpeedChange?: (speed: number) => void
  titleClip?: LabAudioTitleClip
  createAudio?: () => HTMLAudioElement
  /** Return true when the reader accepted a transition to the next chapter. */
  onChapterComplete?: () => boolean
  /**
   * Fish narration pilot. When set, clips are prepared on demand through
   * `ensure` instead of read from the Kokoro manifest, and only words the
   * provider timed for that exact recording are painted. `voice` is part of
   * the playback tuple: changing it resets playback like an edition change.
   */
  narration?: LabNarrationOption | null
}

export interface LabNarrationOption {
  voice: string
  ensure: (paragraphIndexes: number[], signal: AbortSignal) => Promise<NarrationParagraphResult[]>
  /** Paragraphs prepared ahead of the one playing (default 2, at most 3). */
  lookAhead?: number
}

export type LabNarrationState =
  | { status: 'idle' }
  | { status: 'loading'; paragraphIndex: number }
  | { status: 'error'; paragraphIndex: number; message: string; reason?: string }

interface PreparedNarration {
  url: string
  duration: number
  words?: FollowParagraph['words']
  textHash: string
}

type NarrationOutcome = { ok: true } | { ok: false; reason: string; retryAfterMs?: number }

type PlaceInput = { paragraphIndex?: number; wordIndex?: number } | undefined

function bareFollowParagraphs(paragraphs: FollowParagraph[]): FollowParagraph[] {
  return paragraphs.map(paragraph => ({ index: paragraph.index, text: paragraph.text }))
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
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
  const [speed, setSpeedState] = useState(() => parseHearingSpeed(options.playbackSpeed) ?? 1)
  const [followParagraphs, setFollowParagraphs] = useState<FollowParagraph[]>(options.followParagraphs)
  const [clips, setClips] = useState<LabAudioClip[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const clipsRef = useRef<LabAudioClip[]>([])
  const paragraphsRef = useRef<FollowParagraph[]>(options.followParagraphs)
  const clipIndexRef = useRef(0)
  const positionRef = useRef({ clipIndex: 0, time: 0 })
  const playClipRef = useRef<(index: number, offsetSeconds: number, andPlay?: boolean) => boolean>(() => false)
  const switchingRef = useRef(false)
  const playingRef = useRef(false)
  const playRequestRef = useRef(0)
  const requestIsCurrent = (request: number) => !optionsRef.current.guardPlaybackRequests || request === playRequestRef.current
  // Narration pilot: prepared recordings for the current tuple, requests in
  // flight (shared between play and look-ahead), and one abort controller
  // that a tuple or voice change trips.
  const narrationRequestRef = useRef(0)
  const narrationAbortRef = useRef<AbortController | null>(null)
  const narrationPreparedRef = useRef<Map<number, PreparedNarration>>(new Map())
  const narrationInFlightRef = useRef<Map<number, Promise<NarrationParagraphResult[]>>>(new Map())
  const narrationRetryRef = useRef<(() => void) | null>(null)
  const [narrationState, setNarrationState] = useState<LabNarrationState>({ status: 'idle' })
  const playPlaceRef = useRef<(clips: LabAudioClip[], place: PlaceInput, andPlay: boolean, includeTitle?: boolean) => boolean>(() => false)
  const optionsRef = useRef(options)
  optionsRef.current = options
  paragraphsRef.current = followParagraphs

  const audioChapter = () => optionsRef.current.chapterNumber ?? 1
  const audioEdition = () => optionsRef.current.audioEdition || 'kjv-en'
  const audioBook = () => optionsRef.current.bookId || 'bible'

  const commitFollowParagraphs = useCallback((followed: FollowParagraph[]) => {
    paragraphsRef.current = followed
    setFollowParagraphs(followed)
    return followed
  }, [])

  const narrationSignal = () => {
    if (!narrationAbortRef.current || narrationAbortRef.current.signal.aborted) narrationAbortRef.current = new AbortController()
    return narrationAbortRef.current.signal
  }

  /** Adopt ready recordings whose text hash still matches the clip they were asked for. */
  const applyPreparedNarration = useCallback((results: NarrationParagraphResult[]) => {
    const prepared = narrationPreparedRef.current
    let changed = false
    for (const result of results) {
      if (result.status !== 'ready') continue
      const clip = clipsRef.current.find(item => item.kind === 'paragraph' && item.index === result.paragraph)
      if (!clip || clip.kind !== 'paragraph' || !clip.narration || clip.narration.textHash !== result.textHash) continue
      if (prepared.get(result.paragraph)?.url === result.url) continue
      const paragraph = paragraphsRef.current.find(item => item.index === result.paragraph)
      const words = paragraph && result.words
        ? alignTimedWordsToText(paragraph.text, wordsFromManifestParagraph({ words: result.words }))
        : undefined
      prepared.set(result.paragraph, { url: result.url, duration: result.duration, words, textHash: result.textHash })
      changed = true
    }
    if (!changed) return
    const clips = clipsRef.current.map((clip) => {
      if (clip.kind !== 'paragraph' || !clip.narration) return clip
      const ready = prepared.get(clip.index)
      if (!ready || clip.url === ready.url) return clip
      return { ...clip, url: ready.url, duration: ready.duration, words: ready.words, narration: { ...clip.narration, ready: true } }
    })
    clipsRef.current = clips
    setClips(clips)
    commitFollowParagraphs(paragraphsRef.current.map((paragraph) => {
      const ready = prepared.get(paragraph.index)
      return ready ? { ...paragraph, duration: ready.duration, words: ready.words } : paragraph
    }))
  }, [commitFollowParagraphs])

  /**
   * Make paragraphs playable. Requests already in flight for a paragraph are
   * awaited rather than repeated, so a play request landing on a paragraph
   * the look-ahead is preparing shares that work.
   */
  const prepareNarration = useCallback(async (indexes: number[]): Promise<NarrationOutcome> => {
    const narration = optionsRef.current.narration
    if (!narration || indexes.length === 0) return { ok: false, reason: 'not_configured' }
    const prepared = narrationPreparedRef.current
    const inFlight = narrationInFlightRef.current
    const awaited = indexes.map(index => inFlight.get(index)).filter((item): item is Promise<NarrationParagraphResult[]> => Boolean(item))
    const wanted = indexes.filter(index => !prepared.has(index) && !inFlight.has(index))
    const signal = narrationSignal()
    let request: Promise<NarrationParagraphResult[]> | null = null
    if (wanted.length > 0) {
      request = narration.ensure(wanted, signal).finally(() => {
        for (const index of wanted) if (inFlight.get(index) === request) inFlight.delete(index)
      })
      for (const index of wanted) inFlight.set(index, request)
    }
    const settled = await Promise.allSettled([...awaited, ...(request ? [request] : [])])
    if (signal.aborted) return { ok: false, reason: 'cancelled' }
    let failure: NarrationOutcome = { ok: false, reason: 'network' }
    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        applyPreparedNarration(outcome.value)
        const first = outcome.value.find(item => item.paragraph === indexes[0])
        if (first && first.status !== 'ready') {
          failure = { ok: false, reason: first.status === 'failed' ? first.reason || 'failed' : first.status, retryAfterMs: first.retryAfterMs }
        }
      } else if ((outcome.reason as Error)?.name === 'AbortError') {
        failure = { ok: false, reason: 'cancelled' }
      } else if (outcome.reason instanceof NarrationEnsureError) {
        failure = { ok: false, reason: outcome.reason.code }
      }
    }
    return prepared.has(indexes[0]) ? { ok: true } : failure
  }, [applyPreparedNarration])

  /** Prepare `index`, then run `resume` unless a newer request or a tuple change superseded this one. */
  const prepareThenRun = useCallback(async (index: number, resume: () => void) => {
    const request = ++narrationRequestRef.current
    const clip = clipsRef.current[index]
    const paragraphIndex = clip?.kind === 'paragraph' ? clip.index : index
    setNarrationState({ status: 'loading', paragraphIndex })
    let outcome = await prepareNarration([paragraphIndex])
    for (let poll = 0; !outcome.ok && outcome.reason === 'pending' && poll < 3; poll += 1) {
      await wait(Math.min(5000, Math.max(500, outcome.retryAfterMs ?? 1500)))
      if (request !== narrationRequestRef.current) return
      outcome = await prepareNarration([paragraphIndex])
    }
    if (request !== narrationRequestRef.current) return
    if (!outcome.ok) {
      if (outcome.reason === 'cancelled') return
      narrationRetryRef.current = () => { void prepareThenRun(index, resume) }
      setNarrationState({ status: 'error', paragraphIndex, message: narrationFailureMessage(outcome.reason), reason: outcome.reason })
      playingRef.current = false
      setPlaying(false)
      return
    }
    setNarrationState({ status: 'idle' })
    resume()
  }, [prepareNarration])

  const scheduleNarrationLookAhead = useCallback((clipIndex: number) => {
    const narration = optionsRef.current.narration
    if (!narration) return
    const ahead = Math.max(0, Math.min(narration.lookAhead ?? 2, 3))
    const indexes: number[] = []
    for (let k = 1; k <= ahead; k += 1) {
      const next = clipsRef.current[clipIndex + k]
      if (!next || next.kind !== 'paragraph' || !next.narration || next.url) continue
      if (narrationPreparedRef.current.has(next.index) || narrationInFlightRef.current.has(next.index)) continue
      indexes.push(next.index)
    }
    if (indexes.length === 0) return
    // Outcome deliberately ignored: a paragraph that failed here is retried,
    // with a visible state, when playback actually reaches it.
    void prepareNarration(indexes)
  }, [prepareNarration])

  const retryNarration = useCallback(() => {
    const retry = narrationRetryRef.current
    narrationRetryRef.current = null
    setNarrationState({ status: 'idle' })
    retry?.()
  }, [])

  const dismissNarration = useCallback(() => {
    narrationRetryRef.current = null
    setNarrationState({ status: 'idle' })
  }, [])

  const narrationActive = Boolean(options.narration)
  const narrationVoice = options.narration?.voice
  useEffect(() => {
    playRequestRef.current += 1
    narrationRequestRef.current += 1
    narrationAbortRef.current?.abort()
    narrationAbortRef.current = null
    narrationPreparedRef.current = new Map()
    narrationInFlightRef.current = new Map()
    narrationRetryRef.current = null
    setNarrationState({ status: 'idle' })
    setFollowParagraphs(optionsRef.current.narration ? bareFollowParagraphs(options.followParagraphs) : options.followParagraphs)
    clipsRef.current = []
    setClips([])
    setSrc(null)
    playingRef.current = false
    setPlaying(false)
    setFollow({ kind: 'none' })
  }, [options.audioEdition, options.bookId, options.chapterNumber, narrationActive, narrationVoice])

  useEffect(() => {
    setFollowParagraphs((current) => {
      if (optionsRef.current.narration) {
        // Kokoro manifest words belong to Kokoro audio; only words timed for
        // the prepared Fish recording may paint over narrated text.
        const prepared = narrationPreparedRef.current
        return options.followParagraphs.map((paragraph) => {
          const ready = prepared.get(paragraph.index)
          return ready
            ? { index: paragraph.index, text: paragraph.text, duration: ready.duration, words: ready.words }
            : { index: paragraph.index, text: paragraph.text }
        })
      }
      if (chapterHasWordTimings(current)) return current
      return options.followParagraphs
    })
  }, [options.followParagraphs])

  const applyRate = useCallback((audio: HTMLAudioElement, rate: number) => {
    try { audio.playbackRate = rate } catch { /* jsdom */ }
  }, [])

  useEffect(() => {
    const next = parseHearingSpeed(options.playbackSpeed)
    if (next == null) return
    setSpeedState(current => current === next ? current : next)
    if (audioRef.current) applyRate(audioRef.current, next)
  }, [applyRate, options.playbackSpeed])

  const syncFollow = useCallback((index: number, time: number) => {
    const clip = clipsRef.current[index]
    if (Number.isFinite(time) && (time > 0 || positionRef.current.time === 0 || positionRef.current.clipIndex !== index)) {
      positionRef.current = { clipIndex: index, time: Math.max(0, time) }
    }
    // Both updates are no-ops for React while the painted word and the
    // stepped clock are unchanged, so a frame with nothing new to show
    // re-renders nothing. positionRef stays exact for seeking/persistence.
    setCurrentTime(previous => steppedPlaybackTime(previous, positionRef.current.time))
    const next = followPlayingClip(
      paragraphsRef.current,
      clip,
      positionRef.current.time + LAB_FOLLOW_LEAD_SECONDS,
    )
    setFollow(previous => isSameFollowTarget(previous, next) ? previous : next)
  }, [])

  const attachAudio = useCallback((audio: HTMLAudioElement) => {
    const finishPlayback = () => {
      try { audio.pause() } catch { /* ignore */ }
      playingRef.current = false
      setPlaying(false)
      setFollow({ kind: 'none' })
      setSrc(null)
    }
    const handleTimeUpdate = () => {
      syncFollow(clipIndexRef.current, audio.currentTime || 0)
    }
    const handleEnded = () => {
      // Safari fires ended again when src changes on an already-ended element.
      if (switchingRef.current || !playingRef.current) return
      const next = clipIndexRef.current + 1
      const clip = clipsRef.current[next]
      if (!clip) {
        if (optionsRef.current.onChapterComplete?.()) return
        finishPlayback()
        return
      }
      playClipRef.current(next, 0)
    }
    const handleError = () => {
      if (switchingRef.current) return
      const current = clipsRef.current[clipIndexRef.current]
      if (current?.kind === 'paragraph' && current.narration) {
        // Never skip ahead or swap narrators behind the reader's back: stop
        // visibly and offer a retry of the same recording.
        const index = clipIndexRef.current
        narrationRetryRef.current = () => { playClipRef.current(index, 0) }
        setNarrationState({ status: 'error', paragraphIndex: current.index, message: narrationFailureMessage('playback'), reason: 'playback' })
        finishPlayback()
        return
      }
      const next = clipIndexRef.current + 1
      if (next < clipsRef.current.length) playClipRef.current(next, 0)
      else if (!optionsRef.current.onChapterComplete?.()) finishPlayback()
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
          syncFollow(clipIndexRef.current, time)
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, speed, syncFollow])

  useEffect(() => () => {
    playRequestRef.current += 1
    narrationRequestRef.current += 1
    narrationAbortRef.current?.abort()
    detachRef.current?.()
    const audio = audioRef.current
    if (audio) {
      try { audio.pause() } catch { /* jsdom */ }
      try { audio.removeAttribute('src') } catch { /* jsdom */ }
    }
    audioRef.current = null
  }, [])

  const playClip = useCallback((index: number, offsetSeconds: number, andPlay = true) => {
    if (optionsRef.current.playbackUnavailable) return false
    const request = ++playRequestRef.current
    const audio = ensureAudio()
    const clip = clipsRef.current[index]
    if (!clip) return false
    if (clip.kind === 'paragraph' && clip.narration && !clip.url) {
      // On-demand narration: prepare this paragraph, then play it for real.
      clipIndexRef.current = index
      setClipIndex(index)
      try { audio.pause() } catch { /* ignore */ }
      void prepareThenRun(index, () => { playClipRef.current(index, offsetSeconds, andPlay) })
      return true
    }
    const url = clip.kind === 'paragraph' && clip.url
      ? clip.url
      : labAudioFileUrl(clip.file, audioChapter(), audioEdition(), audioBook())
    switchingRef.current = true
    clipIndexRef.current = index
    setClipIndex(index)
    setSrc(url)
    const sameSrc = audio.src === url || audio.src.endsWith(url)
    try { audio.pause() } catch { /* ignore */ }
    if (!sameSrc) {
      setAudioSource(audio, url)
      try { audio.currentTime = offsetSeconds } catch { /* ignore */ }
    }
    const expectedSrc = audio.src
    const applyOffset = () => {
      if (!requestIsCurrent(request)) return
      if (offsetSeconds > 0 || audio.currentTime !== offsetSeconds) {
        try { audio.currentTime = offsetSeconds } catch { /* ignore */ }
      }
    }
    applyOffset()
    if (!sameSrc) audio.addEventListener('loadedmetadata', applyOffset, { once: true })
    applyRate(audio, speed)
    const armed = () => { if (requestIsCurrent(request)) switchingRef.current = false }
    audio.addEventListener('playing', armed, { once: true })
    audio.addEventListener('timeupdate', armed, { once: true })
    if (!andPlay) {
      try { audio.pause() } catch { /* ignore */ }
      switchingRef.current = false
      playingRef.current = false
      setPlaying(false)
      setCurrentTime(offsetSeconds)
      setFollow({ kind: 'none' })
      return true
    }
    syncFollow(index, offsetSeconds)
    playingRef.current = true
    setPlaying(true)
    if (clip.kind === 'paragraph' && clip.narration) scheduleNarrationLookAhead(index)
    void playAudioTransition(
      audio,
      expectedSrc,
      () => requestIsCurrent(request) && playingRef.current,
    ).then(started => {
      if (!requestIsCurrent(request) || audio.src !== expectedSrc) return
      switchingRef.current = false
      if (started) {
        applyRate(audio, speed)
        syncFollow(index, audio.currentTime || offsetSeconds)
        return
      }
      playingRef.current = false
      setPlaying(false)
      setFollow({ kind: 'none' })
    })
    return true
  }, [applyRate, ensureAudio, prepareThenRun, scheduleNarrationLookAhead, speed, syncFollow])
  playClipRef.current = playClip

  const playPlace = useCallback((
    clips: LabAudioClip[],
    place: { paragraphIndex?: number; wordIndex?: number } | undefined,
    andPlay: boolean,
    includeTitleAtChapterStart = false,
  ) => {
    const paragraphIndex = place?.paragraphIndex ?? 0
    const wordIndex = place?.wordIndex ?? 0
    const titleIndex = clips.findIndex(clip => clip.kind === 'title')
    let index = includeTitleAtChapterStart && paragraphIndex === 0 && wordIndex === 0 && titleIndex >= 0
      ? titleIndex
      : clips.findIndex(clip => clip.kind === 'paragraph' && clip.index === paragraphIndex)
    if (index < 0) index = 0
    const clip = clips[index]
    if (clip?.kind === 'paragraph' && clip.narration && !clip.url) {
      clipIndexRef.current = index
      setClipIndex(index)
      void prepareThenRun(index, () => { playPlaceRef.current(clipsRef.current, place, andPlay, includeTitleAtChapterStart) })
      return true
    }
    const words = clip?.kind === 'paragraph' ? clip.words : undefined
    const clamped = words && words.length > 0
      ? Math.max(0, Math.min(wordIndex, words.length - 1))
      : 0
    const offset = words?.[clamped]?.start ?? 0
    return playClip(index, offset, andPlay)
  }, [playClip, prepareThenRun])
  playPlaceRef.current = playPlace

  const resolveClips = useCallback(async (): Promise<LabAudioClip[]> => {
    const chapter = audioChapter()
    const edition = audioEdition()
    const bookId = audioBook()
    const sourceParagraphs = optionsRef.current.paragraphs
    const sourceFollowParagraphs = optionsRef.current.followParagraphs.map(paragraph => ({
      ...paragraph,
      words: alignTimedWordsToText(
        paragraph.text,
        wordsFromManifestParagraph({ words: paragraph.words }),
      ),
    }))
    const titleClip = optionsRef.current.titleClip
    const narration = optionsRef.current.narration
    const voice = narration?.voice
    const tupleMatches = () => (
      audioChapter() === chapter
      && audioEdition() === edition
      && audioBook() === bookId
      && optionsRef.current.narration?.voice === voice
    )

    if (narration) {
      // Narration pilot: every paragraph is a clip; recordings arrive on
      // demand. Anything prepared earlier for this tuple is reused as long as
      // the paragraph text still hashes the same.
      const hashes = await Promise.all(sourceParagraphs.map(text => sha256Hex(narrationTextForParagraph(text))))
      if (!tupleMatches()) return []
      const prepared = narrationPreparedRef.current
      const usable = (index: number) => {
        const ready = prepared.get(index)
        return ready && ready.textHash === hashes[index] ? ready : undefined
      }
      commitFollowParagraphs(sourceParagraphs.map((text, index) => {
        const ready = usable(index)
        return ready ? { index, text, duration: ready.duration, words: ready.words } : { index, text }
      }))
      const clips: LabAudioClip[] = sourceParagraphs.map((text, index) => {
        const ready = usable(index)
        return {
          kind: 'paragraph' as const,
          index,
          file: `narration-p${index}.mp3`,
          url: ready?.url,
          duration: ready?.duration,
          words: ready?.words,
          narration: { textHash: hashes[index], ready: Boolean(ready) },
        }
      })
      clipsRef.current = clips
      setClips(clips)
      return clips
    }

    const attachWords = (followed: FollowParagraph[], clips: LabAudioClip[]) => {
      const withWords = clips.map((clip) => {
        if (clip.kind === 'title') return clip
        const words = followed.find(item => item.index === clip.index)?.words
        return words ? { ...clip, words } : clip
      })
      clipsRef.current = withWords
      setClips(withWords)
      return withWords
    }

    const fromSource = clipsFromFollowParagraphs(sourceFollowParagraphs)
    if (fromSource.length > 0) {
      let followed = chapterHasWordTimings(sourceFollowParagraphs)
        ? sourceFollowParagraphs
        : paragraphsRef.current
      if (!chapterHasWordTimings(followed)) {
        const [manifestRes, sidecarRes] = await Promise.all([
          Promise.resolve(fetch(labAudioManifestUrl(chapter, edition, bookId))).catch(() => null),
          Promise.resolve(fetch(labAudioSidecarUrl(chapter, edition, bookId))).catch(() => null),
        ])
        if (manifestRes?.ok) {
          const manifest = await manifestRes.json() as { paragraphs?: ManifestParagraph[] }
          followed = sourceFollowParagraphs.map((paragraph) => {
            const match = (manifest.paragraphs || []).find(entry => entry.paragraph === paragraph.index)
              || (manifest.paragraphs || []).find(entry => entry.paragraph === paragraph.index + 1)
            const timed = followParagraphFromManifest(paragraph.index, paragraph.text, match)
            return {
              ...paragraph,
              duration: timed.duration ?? paragraph.duration,
              file: timed.file ?? paragraph.file,
              words: timed.words,
            }
          })
        }
        followed = mergeSidecarWords(followed, await readLabWordSidecar(sidecarRes), chapter)
      }
      if (!tupleMatches()) return []
      followed = commitFollowParagraphs(followed)
      const title = titleClip?.kind === 'title' ? titleClip : null
      return attachWords(followed, title ? [title, ...fromSource] : fromSource)
    }

    const [manifestRes, sidecarRes] = await Promise.all([
      fetch(labAudioManifestUrl(chapter, edition, bookId)),
      fetch(labAudioSidecarUrl(chapter, edition, bookId)).catch(() => null),
    ])
    if (!manifestRes.ok || !tupleMatches()) return []
    const manifest = await manifestRes.json() as { paragraphs?: ManifestParagraph[] }
    if (!tupleMatches()) return []
    let followed = mergeSidecarWords(
      sourceParagraphs.map((text, index) => {
        const entries = manifest.paragraphs || []
        const match = entries.find(entry => entry.paragraph === index)
          || entries.find(entry => entry.paragraph === index + 1)
        return followParagraphFromManifest(index, text, match)
      }),
      await readLabWordSidecar(sidecarRes),
      chapter,
    )
    if (!tupleMatches()) return []
    followed = commitFollowParagraphs(followed)
    const clips = clipsFromManifest(sourceParagraphs, manifest.paragraphs || [])
    return attachWords(followed, clips)
  }, [commitFollowParagraphs])

  const start = useCallback(async (place?: { paragraphIndex: number; wordIndex?: number }) => {
    if (optionsRef.current.playbackUnavailable) return false
    const request = ++playRequestRef.current
    const clips = await resolveClips()
    if (!requestIsCurrent(request) || clips.length === 0) return false
    return playPlace(clips, place, true, true)
  }, [playPlace, resolveClips])

  const startAtPlace = useCallback(async (place: { paragraphIndex: number; wordIndex?: number }) => {
    if (optionsRef.current.playbackUnavailable) return false
    const request = ++playRequestRef.current
    const clips = await resolveClips()
    if (!requestIsCurrent(request) || clips.length === 0) return false
    return playPlace(clips, place, true, false)
  }, [playPlace, resolveClips])

  const seekToPlace = useCallback((paragraphIndex: number, wordIndex: number) => {
    const clips = clipsRef.current
    if (clips.length === 0) return
    playPlace(clips, { paragraphIndex, wordIndex }, playing, false)
  }, [playPlace, playing])

  const pause = useCallback(() => {
    playRequestRef.current += 1
    audioRef.current?.pause()
    playingRef.current = false
    setPlaying(false)
    // Pause retains the verified last word; chapter/source changes still clear it.
  }, [])

  const resume = useCallback((fromSentenceStart = false) => {
    if (optionsRef.current.playbackUnavailable) return false
    const request = ++playRequestRef.current
    const audio = audioRef.current
    if (!audio?.src) {
      void start()
      return
    }
    if (fromSentenceStart) {
      const clip = clipsRef.current[clipIndexRef.current]
      const words = clip?.kind === 'paragraph' ? clip.words : undefined
      if (words?.length) {
        let index = 0
        while (index + 1 < words.length && words[index + 1].start <= audio.currentTime) index++
        audio.currentTime = words[sentenceStartWordIndex(words, index)].start
      } else {
        // Without verified word timings, the current paragraph is the safe boundary.
        audio.currentTime = 0
      }
    }
    applyRate(audio, speed)
    audio.play().then(() => {
      if (!requestIsCurrent(request)) return
      applyRate(audio, speed)
      playingRef.current = true
      setPlaying(true)
      syncFollow(clipIndexRef.current, audio.currentTime || 0)
    }).catch(() => {
      if (!requestIsCurrent(request)) return
      playingRef.current = false
      setPlaying(false)
    })
  }, [applyRate, speed, start, syncFollow])

  const stop = useCallback(() => {
    playRequestRef.current += 1
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
    }
    clipIndexRef.current = 0
    setClipIndex(0)
    setCurrentTime(0)
    playingRef.current = false
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
      optionsRef.current.onPlaybackSpeedChange?.(next)
      return next
    })
  }, [applyRate])

  const setSpeed = useCallback((rate: number) => {
    const next = parseHearingSpeed(rate)
    if (next == null) return
    setSpeedState(next)
    if (audioRef.current) applyRate(audioRef.current, next)
    optionsRef.current.onPlaybackSpeedChange?.(next)
  }, [applyRate])

  // Chapter loading can commit src/clip state in a different React batch from
  // the outgoing paragraph follow. A title clip must never expose that stale
  // body-word target, even for a single render.
  const visibleFollow = clips[clipIndex]?.kind === 'title'
    ? { kind: 'none' as const }
    : follow

  return {
    playing,
    follow: visibleFollow,
    followParagraphs,
    clips,
    src,
    clipIndex,
    currentTime,
    speed,
    narration: narrationState,
    retryNarration,
    dismissNarration,
    start,
    startAtPlace,
    seekToPlace,
    pause,
    resume,
    stop,
    seek,
    cycleSpeed,
    setSpeed,
  }
}
