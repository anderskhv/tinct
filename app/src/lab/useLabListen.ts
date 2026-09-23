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
import { acquireBrowserAudioSession } from '../utils/browserAudioSession'
import { NarrationEnsureError, narrationFailureMessage, type NarrationEnsureRequest, type NarrationParagraphNotReady, type NarrationParagraphResult } from './labNarration'
import { chunkNarrationTokens, narrationTextForParagraph, narrationTokens, sha256Hex } from '../narration/narrationCore'
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

/** `src` reported while a narration chunk is being prepared: truthy so the shell resumes through the hook, never a URL. */
export const NARRATION_PENDING_SRC = 'narration:pending'
export const NARRATION_BUFFER_TARGET_SECONDS = 45

export interface UseLabListenOptions {
  playbackUnavailable?: boolean
  /** V2: cancelled or superseded play requests cannot skip or repaint clips. */
  guardPlaybackRequests?: boolean
  bookId?: string
  bookTitle?: string
  chapterTitle?: string
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
  /** One call generates at most one missing sentence group (`mode: 'next'`) and reports every requested paragraph's state. */
  ensure: (paragraphIndexes: number[], signal: AbortSignal, mode?: NarrationEnsureRequest['mode'], fromChunks?: Record<number, number>) => Promise<NarrationParagraphResult[]>
  /** Paragraphs kept complete ahead of the one playing (default 2, at most 3). */
  lookAhead?: number
}

export type LabNarrationState =
  | { status: 'idle' }
  | { status: 'loading'; paragraphIndex: number }
  | { status: 'error'; paragraphIndex: number; message: string; reason?: string }

interface PreparedChunk {
  index: number
  wordFrom: number
  wordTo: number
  ready: boolean
  url?: string
  duration?: number
  words?: FollowParagraph['words']
}

/** What the reader knows about one paragraph's narration for the current tuple. */
interface ParagraphNarration {
  textHash: string
  chunkCount: number
  chunks: PreparedChunk[]
  duration?: number
  words?: FollowParagraph['words']
  failure?: { reason: string; retryAfterMs?: number }
  retryAfterMs?: number
}

type NarrationOutcome = { ok: true } | { ok: false; reason: string; retryAfterMs?: number }

interface ChunkTarget { paragraphIndex: number; chunkIndex: number }

type PlaceInput = { paragraphIndex?: number; wordIndex?: number } | undefined

function bareFollowParagraphs(paragraphs: FollowParagraph[]): FollowParagraph[] {
  return paragraphs.map(paragraph => ({ index: paragraph.index, text: paragraph.text }))
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isNotReady(result: NarrationParagraphResult): result is NarrationParagraphNotReady {
  return result.status === 'failed' || result.status === 'text_mismatch'
}

function chapterHasWordTimings(paragraphs: FollowParagraph[]): boolean {
  return paragraphs.some(paragraph => paragraphHasWordTimings(paragraph))
}

function waitingForNarration(clip: LabAudioClip | undefined, audio: HTMLAudioElement): boolean {
  return clip?.kind === 'paragraph' && !!clip.narration && (!clip.url || !audio.src.endsWith(clip.url))
}

function defaultCreateAudio(): HTMLAudioElement {
  const audio = new Audio()
  audio.preload = 'auto'
  // Keep one native media element eligible for iOS lock-screen ownership.
  // `playsinline` avoids a separate fullscreen media lifecycle on WebKit.
  if (typeof audio.setAttribute === 'function') audio.setAttribute('playsinline', '')
  return audio
}

export function useLabListen(options: UseLabListenOptions) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => playing ? acquireBrowserAudioSession('playback') : undefined, [playing])
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
  const chapterHandoffRef = useRef(false)
  const playRequestRef = useRef(0)
  const requestIsCurrent = (request: number) => !optionsRef.current.guardPlaybackRequests || request === playRequestRef.current
  // Narration pilot: prepared recordings for the current tuple, requests in
  // flight (shared between play and look-ahead), and one abort controller
  // that a tuple or voice change trips.
  const narrationRequestRef = useRef(0)
  const narrationAbortRef = useRef<AbortController | null>(null)
  const narrationPreparedRef = useRef<Map<number, ParagraphNarration>>(new Map())
  /** Paragraph index → hash of its narration text, for the current tuple. */
  const narrationHashesRef = useRef<Map<number, string>>(new Map())
  const narrationRoundRef = useRef<Promise<NarrationParagraphResult[]> | null>(null)
  const narrationLookAheadRef = useRef<Promise<void> | null>(null)
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

  const findClipIndex = (target: ChunkTarget): number => clipsRef.current.findIndex(clip => (
    clip.kind === 'paragraph' && clip.index === target.paragraphIndex
    && (clip.chunk ? clip.chunk.index === target.chunkIndex : target.chunkIndex === 0)
  ))

  const chunkReady = (target: ChunkTarget): boolean => {
    const entry = narrationPreparedRef.current.get(target.paragraphIndex)
    return Boolean(entry?.chunks[target.chunkIndex]?.ready && entry.chunks[target.chunkIndex].url)
  }

  const paragraphComplete = (paragraphIndex: number): boolean => {
    const entry = narrationPreparedRef.current.get(paragraphIndex)
    return Boolean(entry && entry.chunkCount > 0 && entry.chunks.length === entry.chunkCount && entry.chunks.every(chunk => chunk.ready))
  }

  /** Clips for the narration tuple: one per known sentence group, or one placeholder per paragraph. */
  const rebuildNarrationClips = useCallback(() => {
    const before = clipsRef.current[clipIndexRef.current]
    const identity: ChunkTarget | null = before?.kind === 'paragraph'
      ? { paragraphIndex: before.index, chunkIndex: before.chunk?.index ?? 0 }
      : null
    const hashes = narrationHashesRef.current
    const clips: LabAudioClip[] = []
    for (const paragraph of paragraphsRef.current) {
      const textHash = hashes.get(paragraph.index)
      if (textHash == null) continue
      const entry = narrationPreparedRef.current.get(paragraph.index)
      const layout = chunkNarrationTokens(narrationTokens(paragraph.text))
      for (const expected of layout) {
        const chunk = entry?.textHash === textHash ? entry.chunks[expected.index] : undefined
        clips.push({
          kind: 'paragraph', index: paragraph.index,
          file: `narration-p${paragraph.index}-c${expected.index}.mp3`,
          url: chunk?.ready ? chunk.url : undefined,
          duration: chunk?.ready ? chunk.duration : undefined,
          words: chunk?.ready ? chunk.words : undefined,
          chunk: { index: expected.index, count: layout.length, wordFrom: expected.wordFrom, wordTo: expected.wordTo },
          narration: { textHash, ready: Boolean(chunk?.ready) },
        })
      }
    }
    clipsRef.current = clips
    setClips(clips)
    if (identity) {
      const index = findClipIndex(identity)
      if (index >= 0) { clipIndexRef.current = index; setClipIndex(index) }
    }
    commitFollowParagraphs(paragraphsRef.current.map((paragraph) => {
      const entry = narrationPreparedRef.current.get(paragraph.index)
      if (!entry || entry.textHash !== hashes.get(paragraph.index)) return paragraph.words || paragraph.duration ? { index: paragraph.index, text: paragraph.text } : paragraph
      return { index: paragraph.index, text: paragraph.text, duration: entry.duration, words: entry.words }
    }))
  }, [commitFollowParagraphs])

  /** Adopt paragraph states whose text hash still matches the text on the page. */
  const applyPreparedNarration = useCallback((results: NarrationParagraphResult[]) => {
    const prepared = narrationPreparedRef.current
    const hashes = narrationHashesRef.current
    let changed = false
    for (const result of results) {
      if (result.status !== 'ready' && result.status !== 'partial' && result.status !== 'pending') continue
      const expected = hashes.get(result.paragraph)
      if (expected == null || result.textHash !== expected) continue
      const paragraph = paragraphsRef.current.find(item => item.index === result.paragraph)
      if (!paragraph) continue
      // A stale answer never shortens what is already playable.
      const known = prepared.get(result.paragraph)
      const tokens = narrationTokens(paragraph.text)
      const chunks: PreparedChunk[] = result.chunks.map((chunk) => {
        if (!chunk.ready && known?.textHash === result.textHash && known.chunks[chunk.index]?.ready) return known.chunks[chunk.index]
        const chunkText = tokens.slice(chunk.wordFrom, chunk.wordTo).join(' ')
        const words = chunk.ready && chunk.words
          ? alignTimedWordsToText(chunkText, wordsFromManifestParagraph({ words: chunk.words }))
          : undefined
        return { index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready: Boolean(chunk.ready && chunk.url), url: chunk.url, duration: chunk.duration, words }
      })
      const complete = result.status === 'ready'
      const words = complete && result.words
        ? alignTimedWordsToText(paragraph.text, wordsFromManifestParagraph({ words: result.words }))
        : undefined
      prepared.set(result.paragraph, {
        textHash: result.textHash,
        chunkCount: result.chunkCount,
        chunks,
        duration: complete ? result.duration : undefined,
        words,
        failure: result.failure ? { reason: result.failure.reason, retryAfterMs: result.failure.retryAfterMs } : undefined,
        retryAfterMs: result.retryAfterMs,
      })
      changed = true
    }
    if (changed) rebuildNarrationClips()
  }, [rebuildNarrationClips])

  /**
   * One ensure round: the Worker generates at most one missing sentence
   * group for the first incomplete paragraph in `indexes` and reports every
   * requested paragraph. Rounds are serialised so two loops never race the
   * same chunk; a caller that finds a round in flight awaits it.
   */
  const ensureRound = useCallback(async (indexes: number[], satisfied?: () => boolean, fromChunks?: Record<number, number>): Promise<NarrationOutcome> => {
    const narration = optionsRef.current.narration
    if (!narration || indexes.length === 0) return { ok: false, reason: 'not_configured' }
    while (narrationRoundRef.current) {
      try { await narrationRoundRef.current } catch { /* reported by its own caller */ }
      // The round in flight may have landed exactly what this caller needs.
      if (satisfied?.()) return { ok: true }
    }
    const signal = narrationSignal()
    const round = fromChunks ? narration.ensure(indexes, signal, 'next', fromChunks) : narration.ensure(indexes, signal, 'next')
    narrationRoundRef.current = round
    try {
      const results = await round
      if (signal.aborted) return { ok: false, reason: 'cancelled' }
      applyPreparedNarration(results)
      const first = results.find(item => item.paragraph === indexes[0])
      if (!first) return { ok: false, reason: 'unavailable' }
      // An answer about different words than the page shows is never used.
      if (!isNotReady(first) && first.textHash !== narrationHashesRef.current.get(indexes[0])) return { ok: false, reason: 'text_mismatch' }
      if (isNotReady(first)) {
        return { ok: false, reason: first.status === 'failed' ? first.reason || 'failed' : first.status, retryAfterMs: first.retryAfterMs }
      }
      if (first.failure) return { ok: false, reason: first.failure.reason, retryAfterMs: first.failure.retryAfterMs }
      if (first.status === 'pending' && first.readyChunks === 0) return { ok: false, reason: 'pending', retryAfterMs: first.retryAfterMs ?? 1500 }
      return { ok: true }
    } catch (error) {
      if ((error as Error)?.name === 'AbortError' || signal.aborted) return { ok: false, reason: 'cancelled' }
      if (error instanceof NarrationEnsureError && error.code === 'rate_limited') return { ok: false, reason: 'pending', retryAfterMs: 3000 }
      return { ok: false, reason: error instanceof NarrationEnsureError ? error.code : 'network' }
    } finally {
      if (narrationRoundRef.current === round) narrationRoundRef.current = null
    }
  }, [applyPreparedNarration])

  /**
   * Leave the element silent and the clock at the target while a sentence
   * group is prepared: the previous chunk must not keep playing under the
   * "Preparing narration…" notice, its clock must not paint the target's
   * words, and an `ended` from it must not advance past the target.
   */
  const enterPreparing = useCallback((index: number, offsetSeconds: number) => {
    const audio = audioRef.current
    switchingRef.current = true
    // An ended native element can retain its media session while the next
    // generated clip arrives. Clearing it here breaks locked-screen handoff.
    // Manual seeks still silence and clear a recording that has not ended.
    const continuousBoundary = Boolean(playingRef.current && audio?.ended)
    if (audio && !continuousBoundary) {
      try { audio.pause() } catch { /* ignore */ }
      try { audio.removeAttribute('src') } catch { /* ignore */ }
    }
    clipIndexRef.current = index
    setClipIndex(index)
    positionRef.current = { clipIndex: index, time: offsetSeconds }
    setCurrentTime(offsetSeconds)
    setFollow({ kind: 'none' })
    // A sentinel keeps the shell on the resume path, which re-enters playClip.
    setSrc(NARRATION_PENDING_SRC)
    switchingRef.current = false
  }, [])

  /**
   * Prepare one sentence group, then run `resume` — unless a newer
   * preparation, a tuple change, or any playback request in between (pause,
   * stop, another play) superseded this one. A reader who pauses while
   * "Preparing narration…" must not hear the recording start on its own.
   */
  const prepareThenRun = useCallback(async (target: ChunkTarget, resume: () => void) => {
    const request = ++narrationRequestRef.current
    const playRequest = playRequestRef.current
    const superseded = () => request !== narrationRequestRef.current || playRequest !== playRequestRef.current
    setNarrationState({ status: 'loading', paragraphIndex: target.paragraphIndex })
    let outcome: NarrationOutcome = { ok: true }
    let polls = 0
    // Each round lands one chunk; a chunk beyond the ready prefix needs as
    // many rounds as it is deep, plus a few for waits on other generators.
    for (let round = 0; round < target.chunkIndex + 6 && !chunkReady(target); round += 1) {
      outcome = await ensureRound([target.paragraphIndex], () => chunkReady(target), { [target.paragraphIndex]: target.chunkIndex })
      if (superseded()) return
      if (!outcome.ok) {
        if (outcome.reason !== 'pending' || polls >= 3) break
        polls += 1
        await wait(Math.min(5000, Math.max(500, outcome.retryAfterMs ?? 1500)))
        if (superseded()) return
      }
    }
    if (superseded()) return
    if (chunkReady(target)) outcome = { ok: true }
    else if (outcome.ok) outcome = { ok: false, reason: 'unavailable' }
    if (!outcome.ok) {
      if (outcome.reason === 'cancelled') return
      narrationRetryRef.current = () => { void prepareThenRun(target, resume) }
      setNarrationState({ status: 'error', paragraphIndex: target.paragraphIndex, message: narrationFailureMessage(outcome.reason), reason: outcome.reason })
      try { audioRef.current?.pause() } catch { /* ignore */ }
      playingRef.current = false
      setPlaying(false)
      return
    }
    setNarrationState({ status: 'idle' })
    resume()
  }, [ensureRound])

  /**
   * Keep roughly 45 seconds ready ahead of the actual playhead,
   * one sentence group per round, ahead of playback. One loop at a time; it
   * follows the playing clip as it moves and ends on a tuple change, a stop,
   * or when nothing in the window is missing. Failures here are silent — the
   * clip that fails is retried, with a visible state, when playback reaches it.
   */
  const scheduleNarrationLookAhead = useCallback(() => {
    const narration = optionsRef.current.narration
    if (!narration || narrationLookAheadRef.current) return
    const loop = async () => {
      let idle = 0
      for (let round = 0; round < 60; round += 1) {
        if (!playingRef.current) return
        const current = clipsRef.current[clipIndexRef.current]
        if (!current || current.kind !== 'paragraph') return
        const indexes: number[] = []
        const fromChunks: Record<number, number> = {}
        let buffered = 0
        const targetSeconds = NARRATION_BUFFER_TARGET_SECONDS * (audioRef.current?.playbackRate || 1)
        for (let position = clipIndexRef.current; position < clipsRef.current.length && buffered < targetSeconds; position += 1) {
          const clip = clipsRef.current[position]
          if (clip.kind !== 'paragraph') continue
          if (clip.url && typeof clip.duration === 'number' && indexes.length === 0) {
            buffered += Math.max(0, clip.duration - (position === clipIndexRef.current ? positionRef.current.time : 0))
          } else if (!clip.url && !indexes.includes(clip.index)) {
            indexes.push(clip.index)
            fromChunks[clip.index] = clip.chunk?.index ?? 0
            if (indexes.length >= 3) break
          }
        }
        if (buffered >= targetSeconds || indexes.length === 0) return
        const before = indexes.map(index => narrationPreparedRef.current.get(index)?.chunks.filter(chunk => chunk.ready).length ?? 0).join(',')
        const outcome = await ensureRound(indexes, () => indexes.every(paragraphComplete), fromChunks)
        if (!outcome.ok && outcome.reason === 'cancelled') return
        const after = indexes.map(index => narrationPreparedRef.current.get(index)?.chunks.filter(chunk => chunk.ready).length ?? 0).join(',')
        if (after === before) {
          idle += 1
          if (idle >= 3 || (!outcome.ok && outcome.reason !== 'pending')) return
          await wait(Math.min(5000, Math.max(750, (!outcome.ok && outcome.retryAfterMs) || 1500)))
        } else {
          idle = 0
        }
      }
    }
    narrationLookAheadRef.current = loop().finally(() => { narrationLookAheadRef.current = null })
  }, [ensureRound])

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
    narrationHashesRef.current = new Map()
    narrationRoundRef.current = null
    narrationRetryRef.current = null
    setNarrationState({ status: 'idle' })
    setFollowParagraphs(optionsRef.current.narration ? bareFollowParagraphs(options.followParagraphs) : options.followParagraphs)
    clipsRef.current = []
    setClips([])
    if (!chapterHandoffRef.current) {
      setSrc(null)
      playingRef.current = false
      setPlaying(false)
    }
    setFollow({ kind: 'none' })
  }, [options.audioEdition, options.bookId, options.chapterNumber, narrationActive, narrationVoice])

  useEffect(() => {
    setFollowParagraphs((current) => {
      if (optionsRef.current.narration) {
        // Kokoro manifest words belong to Kokoro audio; only words timed for
        // the prepared Fish recording may paint over narrated text.
        const prepared = narrationPreparedRef.current
        const hashes = narrationHashesRef.current
        return options.followParagraphs.map((paragraph) => {
          const ready = prepared.get(paragraph.index)
          return ready && ready.textHash === hashes.get(paragraph.index)
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
      audio.autoplay = false
      playingRef.current = false
      setPlaying(false)
      setFollow({ kind: 'none' })
      setSrc(null)
    }
    const handleTimeUpdate = () => {
      const current = clipsRef.current[clipIndexRef.current]
      if (waitingForNarration(current, audio)) return
      syncFollow(clipIndexRef.current, audio.currentTime || 0)
    }
    const handleEnded = () => {
      // Safari fires ended again when src changes on an already-ended element.
      if (!playingRef.current || !audio.src) return
      const pending = clipsRef.current[clipIndexRef.current]
      if (waitingForNarration(pending, audio)) return
      if (switchingRef.current) {
        const current = clipsRef.current[clipIndexRef.current]
        // Ignore Safari's stale post-swap event at time zero, but do not lose
        // a genuine very short clip that reaches its known end before the
        // normal `playing` event has disarmed the transition guard.
        const reachedKnownEnd = typeof current?.duration === 'number' && audio.currentTime >= current.duration - 0.05
        if (!reachedKnownEnd && !(audio.ended && audio.currentTime > 0)) return
        switchingRef.current = false
      }
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
        if (!playingRef.current) return
        // Never skip ahead or swap narrators behind the reader's back: stop
        // visibly and offer a retry of the same recording, reloaded.
        const identity: ChunkTarget = { paragraphIndex: current.index, chunkIndex: current.chunk?.index ?? 0 }
        narrationRetryRef.current = () => {
          try { audio.removeAttribute('src') } catch { /* ignore */ }
          const index = findClipIndex(identity)
          if (index >= 0) playClipRef.current(index, 0)
        }
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
      const current = clipsRef.current[clipIndexRef.current]
      const preparing = audio && waitingForNarration(current, audio)
      if (audio && !preparing) {
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
      // On-demand narration: prepare this sentence group, then play it for
      // real. The clock starts over here so the previous clip's end time
      // cannot leak into the follow paint or the progress bar while we wait.
      const target: ChunkTarget = { paragraphIndex: clip.index, chunkIndex: clip.chunk?.index ?? 0 }
      enterPreparing(index, offsetSeconds)
      if (!andPlay) return true
      void prepareThenRun(target, () => {
        const ready = findClipIndex(target)
        if (ready >= 0) playClipRef.current(ready, offsetSeconds, andPlay)
      })
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
    // At an automatic boundary, pausing the ended element before assigning
    // the next source makes WebKit hand lock-screen ownership back to the
    // page. Preserve the active native media session and arm autoplay before
    // the synchronous source swap. Manual seeks/source changes still pause.
    const continuousBoundary = Boolean(andPlay && playingRef.current && audio.ended)
    audio.autoplay = andPlay
    if (!continuousBoundary) {
      try { audio.pause() } catch { /* ignore */ }
    }
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
      audio.autoplay = false
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
    if (clip.kind === 'paragraph' && clip.narration) scheduleNarrationLookAhead()
    void playAudioTransition(
      audio,
      expectedSrc,
      () => requestIsCurrent(request) && playingRef.current,
    ).then(started => {
      if (!requestIsCurrent(request) || audio.src !== expectedSrc) return
      switchingRef.current = false
      if (started) {
        chapterHandoffRef.current = false
        applyRate(audio, speed)
        syncFollow(index, audio.currentTime || offsetSeconds)
        return
      }
      playingRef.current = false
      chapterHandoffRef.current = false
      setPlaying(false)
      setFollow({ kind: 'none' })
    })
    return true
  }, [applyRate, ensureAudio, enterPreparing, prepareThenRun, scheduleNarrationLookAhead, speed, syncFollow])
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
    let clip = clips[index]
    if (clip?.kind === 'paragraph' && clip.chunk) {
      // Sentence-group clips: the one whose token range holds the word.
      const owner = clips.findIndex(item => item.kind === 'paragraph' && item.index === paragraphIndex && !!item.chunk
        && item.chunk.wordFrom <= wordIndex && (wordIndex < item.chunk.wordTo || item.chunk.index === item.chunk.count - 1))
      if (owner >= 0) { index = owner; clip = clips[owner] }
    }
    if (clip?.kind === 'paragraph' && clip.narration && !clip.url) {
      const target: ChunkTarget = { paragraphIndex: clip.index, chunkIndex: clip.chunk?.index ?? 0 }
      ensureAudio()
      enterPreparing(index, 0)
      if (!andPlay) { playingRef.current = false; setPlaying(false); return true }
      void prepareThenRun(target, () => { playPlaceRef.current(clipsRef.current, place, andPlay, includeTitleAtChapterStart) })
      return true
    }
    const words = clip?.kind === 'paragraph' ? clip.words : undefined
    const localIndex = clip?.kind === 'paragraph' && clip.chunk ? wordIndex - clip.chunk.wordFrom : wordIndex
    const clamped = words && words.length > 0
      ? Math.max(0, Math.min(localIndex, words.length - 1))
      : 0
    const offset = words?.[clamped]?.start ?? 0
    return playClip(index, offset, andPlay)
  }, [enterPreparing, ensureAudio, playClip, prepareThenRun])
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
      // Narration pilot: clips are sentence groups that arrive on demand.
      // Anything prepared earlier for this tuple is reused as long as the
      // paragraph text still hashes the same.
      const hashes = await Promise.all(sourceParagraphs.map(text => sha256Hex(narrationTextForParagraph(text))))
      if (!tupleMatches()) return []
      narrationHashesRef.current = new Map(hashes.map((hash, index) => [index, hash]))
      for (const [index, entry] of Array.from(narrationPreparedRef.current.entries())) {
        if (entry.textHash !== hashes[index]) narrationPreparedRef.current.delete(index)
      }
      paragraphsRef.current = sourceParagraphs.map((text, index) => ({ index, text }))
      rebuildNarrationClips()
      return clipsRef.current
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
  }, [commitFollowParagraphs, rebuildNarrationClips])

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
    chapterHandoffRef.current = false
    playRequestRef.current += 1
    narrationRequestRef.current += 1
    narrationAbortRef.current?.abort()
    narrationAbortRef.current = null
    setNarrationState(current => (current.status === 'loading' ? { status: 'idle' } : current))
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.autoplay = false
    playingRef.current = false
    setPlaying(false)
    // Pause retains the verified last word; chapter/source changes still clear it.
  }, [])

  const resume = useCallback((fromSentenceStart = false) => {
    if (optionsRef.current.playbackUnavailable) return false
    const request = ++playRequestRef.current
    const audio = audioRef.current
    // Narration: the current clip may still need preparing, or its recording
    // arrived while paused and the element still holds the previous chunk;
    // either way re-enter through playClip rather than replaying the element.
    const current = clipsRef.current[clipIndexRef.current]
    if (current?.kind === 'paragraph' && current.narration && (!audio?.src || !current.url || !audio.src.endsWith(current.url))) {
      playClip(clipIndexRef.current, positionRef.current.time)
      return
    }
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
  }, [applyRate, playClip, speed, start, syncFollow])

  const stop = useCallback(() => {
    chapterHandoffRef.current = false
    playRequestRef.current += 1
    narrationRequestRef.current += 1
    // Stop ends look-ahead too; prepared recordings for this tuple are kept.
    narrationAbortRef.current?.abort()
    narrationAbortRef.current = null
    setNarrationState(current => (current.status === 'loading' ? { status: 'idle' } : current))
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.autoplay = false
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

  /** Preserve native media-session ownership while React loads the next chapter. */
  const handoffChapter = useCallback(() => {
    playRequestRef.current += 1
    narrationRequestRef.current += 1
    narrationAbortRef.current?.abort()
    narrationAbortRef.current = null
    chapterHandoffRef.current = true
    const audio = audioRef.current
    if (audio) audio.autoplay = true
    playingRef.current = true
    setPlaying(true)
    setFollow({ kind: 'none' })
  }, [])

  const seek = useCallback((deltaSeconds: number) => {
    const audio = ensureAudio()
    const preparing = waitingForNarration(clipsRef.current[clipIndexRef.current], audio)
    const live = preparing ? positionRef.current.time : playbackTimeSeconds(audio.currentTime || 0, positionRef.current.time || currentTime)
    const point = seekAcrossClips({
      clips: clipsRef.current,
      clipIndex: clipIndexRef.current,
      currentTime: live,
      deltaSeconds,
      knownDuration: !preparing && Number.isFinite(audio.duration) ? audio.duration : undefined,
    })
    positionRef.current = { clipIndex: point.clipIndex, time: point.offsetSeconds }
    const sameClip = !preparing && point.clipIndex === clipIndexRef.current && audio.src
    if (sameClip) {
      try { audio.currentTime = point.offsetSeconds } catch { /* ignore */ }
      syncFollow(point.clipIndex, point.offsetSeconds)
      return
    }
    // A seek into a paragraph that still needs preparing must not start
    // playback by itself once the recording arrives.
    const target = clipsRef.current[point.clipIndex]
    const deferred = target?.kind === 'paragraph' && !!target.narration && !target.url
    playClip(point.clipIndex, point.offsetSeconds, deferred ? playing : true)
    if (!playing) {
      audio.pause()
      setPlaying(false)
    }
  }, [currentTime, ensureAudio, playClip, playing, syncFollow])

  const estimatedClipDuration = useCallback((clip: LabAudioClip): number => {
    if (typeof clip.duration === 'number' && clip.duration > 0) return clip.duration
    if (clip.kind === 'title') return 0
    const text = paragraphsRef.current.find(paragraph => paragraph.index === clip.index)?.text || ''
    const tokens = text.split(/\s+/).filter(Boolean)
    const from = clip.chunk?.wordFrom ?? 0
    const to = clip.chunk?.wordTo && clip.chunk.wordTo > from ? clip.chunk.wordTo : tokens.length
    const chars = tokens.slice(from, to).join(' ').length || text.length
    return Math.max(1, chars / 14)
  }, [])

  const chapterTimeline = (() => {
    let elapsed = 0
    let duration = 0
    let estimated = false
    clips.forEach((clip, index) => {
      const clipDuration = estimatedClipDuration(clip)
      if (!(typeof clip.duration === 'number' && clip.duration > 0)) estimated = true
      if (index < clipIndex) elapsed += clipDuration
      else if (index === clipIndex) elapsed += Math.max(0, Math.min(currentTime, clipDuration))
      duration += clipDuration
    })
    return { elapsed, duration, estimated }
  })()

  const seekChapter = useCallback((seconds: number) => {
    const all = clipsRef.current
    if (all.length === 0) return
    let cursor = 0
    for (let index = 0; index < all.length; index += 1) {
      const clip = all[index]
      const duration = estimatedClipDuration(clip)
      if (seconds > cursor + duration && index < all.length - 1) { cursor += duration; continue }
      const local = Math.max(0, Math.min(duration, seconds - cursor))
      if (clip.kind === 'paragraph' && clip.narration && !clip.url) {
        const paragraph = paragraphsRef.current.find(item => item.index === clip.index)
        const tokens = narrationTokens(paragraph?.text || '')
        const from = clip.chunk?.wordFrom ?? 0
        const to = clip.chunk?.wordTo && clip.chunk.wordTo > from ? clip.chunk.wordTo : tokens.length
        const wordIndex = Math.min(Math.max(from, to - 1), from + Math.floor((local / Math.max(1, duration)) * Math.max(1, to - from)))
        playPlace(clipsRef.current, { paragraphIndex: clip.index, wordIndex }, playing, false)
      } else {
        playClip(index, local, playing)
      }
      return
    }
  }, [estimatedClipDuration, playClip, playPlace, playing])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    const session = navigator.mediaSession
    try {
      if (typeof MediaMetadata !== 'undefined') session.metadata = new MediaMetadata({
        title: options.bookTitle || options.bookId || 'Tinct audiobook',
        album: options.chapterTitle || `Chapter ${options.chapterNumber ?? 1}`,
      })
      session.setActionHandler('play', () => resume())
      session.setActionHandler('pause', pause)
      session.setActionHandler('seekbackward', details => seek(-(details.seekOffset || 15)))
      session.setActionHandler('seekforward', details => seek(details.seekOffset || 30))
      session.setActionHandler('seekto', details => { if (typeof details.seekTime === 'number') seekChapter(details.seekTime) })
    } catch { /* unsupported action or incomplete metadata */ }
    return () => {
      try { session.setActionHandler('play', null); session.setActionHandler('pause', null); session.setActionHandler('seekbackward', null); session.setActionHandler('seekforward', null); session.setActionHandler('seekto', null) } catch { /* unsupported */ }
    }
  }, [options.bookId, options.bookTitle, options.chapterNumber, options.chapterTitle, pause, resume, seek, seekChapter])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused' } catch { /* unsupported */ }
  }, [playing])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || chapterTimeline.duration <= 0) return
    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(0.001, chapterTimeline.duration),
        playbackRate: speed,
        position: Math.max(0, Math.min(chapterTimeline.elapsed, Math.max(0, chapterTimeline.duration - 0.001))),
      })
    } catch { /* unsupported or incomplete metadata */ }
  }, [chapterTimeline.duration, chapterTimeline.elapsed, speed])

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
    chapterTime: chapterTimeline.elapsed,
    chapterDuration: chapterTimeline.duration,
    chapterDurationEstimated: chapterTimeline.estimated,
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
    handoffChapter,
    seek,
    seekChapter,
    cycleSpeed,
    setSpeed,
  }
}
