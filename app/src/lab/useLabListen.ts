import { useCallback, useEffect, useRef, useState } from 'react'
import { trackFunnel } from '../utils/funnel'
import { hasRecordedAudio } from '../data/audioAvailability'
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
import { listeningSentenceStart, nextHearingSpeed, parseHearingSpeed, playbackTimeSeconds, seekAcrossClips, tokenizeHearingWords } from './labHearing'
import { setAudioSource } from '../utils/audioPlayback'
import { isNativeCapacitor } from '../utils/nativePlatform'
import {readerMediaSession, readerMediaMetadata, playReaderAudioTransition, playReaderAudio, endNativeNarration} from '../utils/readerMediaSession'
import { acquireBrowserAudioSession } from '../utils/browserAudioSession'
import { LAB_COPY } from './labCopy'
import { CLIP_BUFFER_DRY_SECONDS, CLIP_BUFFER_WEAK_FACTOR, NarrationClipBuffer, repeatWhilePlaying, clipBufferSeconds, clipsToBuffer, connectionSavesData, sourcePlaysClip, type BufferCandidate } from './narrationClipBuffer'
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
/**
 * Listening seconds kept generated ahead of the playhead while the page is
 * visible (the audio is this times the speed). Pressing Play authorises
 * generating the chapter as it is listened to; this window is the most a stop
 * can waste: at most 90 s of listening, ~1.2 KB of text at 1x (~2.4 KB at 2x).
 * 45 s one group at a time ran dry in a car (2026-09-25); since 2026-10-20
 * the next groups are made side by side (narrationLookAheadWidth), so the
 * window no longer has to hide serial synthesis and was cut from 150 s.
 */
export const NARRATION_BUFFER_TARGET_SECONDS = 90
/**
 * The same, while the page is hidden (a locked phone in a car): nobody can
 * tap Retry, a gap there is silence until the reader looks at the phone, and
 * a slow round or a dead spot in the network must not reach the playhead.
 */
export const NARRATION_HIDDEN_BUFFER_TARGET_SECONDS = 600
/**
 * How long a hidden player keeps holding (silence on the element) while it
 * waits for a recording or for the network to come back, before it gives up
 * with the ordinary retryable error.
 */
export const NARRATION_HOLD_MAX_MS = 10 * 60_000
/** Back-off between reloads of a clip whose audio failed to load (network). */
export function narrationReloadDelayMs(attempt: number): number {
  return Math.min(15_000, 1_000 * 2 ** Math.max(0, attempt))
}
/** Failures no wait can fix: the reader has to act (sign in, reload) or there is nothing to play. */
const NARRATION_FINAL_REASONS = new Set([
  'budget_exhausted', 'unauthenticated', 'not_configured', 'provider_auth', 'provider_payment',
  'text_mismatch', 'modern_pending', 'own_book_limit', 'own_book_cap', 'own_book_pool',
  'own_book_unavailable', 'own_book_premium', 'cancelled',
])
/**
 * Ready clips after the playing one whose audio is always downloaded ahead of
 * its turn; the clip buffer reaches further, by listening time
 * (narrationClipBuffer.ts).
 */
export const NARRATION_DOWNLOAD_AHEAD = 2
/**
 * The playing recording's clock has not moved for this long while the player
 * believes it plays: a stall (an iPhone, 20 Oct 2026, stopped mid-sentence on
 * "say" with Pause and the lock screen still showing playing).
 */
export const NARRATION_STALL_MS = 1_800
/** No `progress` from the network for this long: bytes are not arriving, the load is wedged. */
const NARRATION_STALL_NO_DATA_MS = 3_000
/**
 * Waits between stall recoveries (ms after detection): first a nudge
 * (play/seek in place), then reloads of the same recording from the same
 * second — from a copy the clip buffer downloads at once when the stall is
 * noticed, else the network — never more than 5 s apart, so playback
 * resumes within seconds of the network coming back. Visible, the player then
 * stops honestly with Retry; hidden (a locked phone) it keeps trying every
 * NARRATION_STALL_HIDDEN_RETRY_MS for up to NARRATION_HOLD_MAX_MS.
 */
export const NARRATION_STALL_RETRY_MS = [0, 1_000, 2_000, 4_000, 6_000, 8_000, 10_000, 13_000, 16_000, 20_000, 25_000, 30_000]
const NARRATION_STALL_HIDDEN_RETRY_MS = 10_000
/** Hidden, a stalled recording waits this long (in silence) for its downloaded copy before it streams from the network again. */
export const NARRATION_HIDDEN_STREAM_AFTER_MS = 20_000
/** How often the stall watchdog looks while playing. */
const NARRATION_STALL_CHECK_MS = 500
const STALL_EVENTS = ['waiting', 'stalled', 'suspend', 'emptied', 'error'] as const
/** A clip still not sounding this long after it was started reads as paused on the lock screen. */
const NARRATION_SILENT_START_MS = 1_000
/** A mid-clip wait for audio shorter than this shows nothing. */
const BUFFERING_SHOW_AFTER_MS = 300
/** How often a playing clip's clock re-tops the clip buffer (a download that failed, a window that grew). */
const CLIP_BUFFER_REFRESH_MS = 1_000
/**
 * How long Play keeps waiting while the Worker reports the first sentence
 * group as still being made (pending, another generator holding its lease, or
 * rate limited). A cold group usually lands in 4–20 s; production saw three
 * `audio_failed: pending` after the old three short polls (~5 s), each
 * playable a minute later. Only after this does the wait become an error.
 */
export const NARRATION_PREPARE_CEILING_MS = 60_000
/** Back-off between polls of a group that is still being made. */
export const NARRATION_POLL_MIN_MS = 1_000
export const NARRATION_POLL_MAX_MS = 5_000
/** A wait at least this long is counted (`audio_slow_start`, seconds only). */
export const NARRATION_SLOW_START_SECONDS = 5
/** Without any answer from the server for this long, a start is a real stall. */
const PENDING_DEADLINE_MS = 45_000

/** The n-th wait (0-based) for a group still being made: the server's hint, growing by half each time. */
export function narrationPollDelayMs(poll: number, retryAfterMs?: number): number {
  const base = Math.max(NARRATION_POLL_MIN_MS, retryAfterMs ?? 1500)
  return Math.min(NARRATION_POLL_MAX_MS, Math.round(base * 1.5 ** Math.max(0, poll)))
}

/**
 * How many sentence groups the first preparation after Play asks for at
 * once, by speed: the one Play needs, plus the next at speed.
 */
export function narrationLookAheadWidth(rate: number): number {
  if (!Number.isFinite(rate) || rate < 1.5) return 1
  return rate < 2.5 ? 2 : 3
}

/**
 * How many sentence groups the look-ahead prepares at once while playing,
 * by speed: 2 up to 1.25x, 3 from 1.5x. One at a time (the rule until
 * 2026-10-20) could not keep up at 1.75x with ~3.5 s per short paragraph
 * (Anders, To the Lighthouse): playback outran the queue. The groups are
 * always the next ones in playing order and always inside the window, so
 * this changes when they are made, never how many: the Worker's per-group
 * lease still makes each once, and its 60 ensure requests a minute per
 * reader are far above a round every few seconds.
 */
export function narrationSynthesisWidth(rate: number): number {
  if (!Number.isFinite(rate) || rate < 1.5) return 2
  return 3
}

/**
 * After iOS pauses the element by itself (a notification sound, Siri, a call),
 * play() is retried at these delays (ms from the pause), then given up: about
 * ten seconds in all. A pause the reader made is never retried.
 */
export const INTERRUPTION_RETRY_DELAYS_MS = [400, 1_000, 2_000, 3_500, 5_500, 8_000, 10_000]
/**
 * A second interruption this soon after an automatic resume is not retried:
 * another app that keeps taking the audio (music the reader started) must
 * not be fought over. The pause then stands until the reader plays.
 */
export const INTERRUPTION_REPEAT_WINDOW_MS = 30_000

/**
 * The next chapter's opening recordings, in playing order: the ready prefix of
 * each paragraph from the first, stopping at the first sentence group that is
 * not ready. Later states for the same paragraph replace earlier ones, as the
 * player adopts them. These play on the same element straight from `ended`
 * while the page loads that chapter (see `nextChapterAudio`).
 */
export function narrationBridgeUrls(results: NarrationParagraphResult[]): string[] {
  const byParagraph = new Map<number, NarrationParagraphResult>()
  for (const result of results) byParagraph.set(result.paragraph, result)
  const urls: string[] = []
  for (let paragraph = 0; byParagraph.has(paragraph); paragraph += 1) {
    const result = byParagraph.get(paragraph)!
    if (isNotReady(result)) break
    const chunks = [...result.chunks].sort((a, b) => a.index - b.index)
    for (const chunk of chunks) {
      if (!chunk.ready || !chunk.url) return urls
      urls.push(chunk.url)
    }
    if (chunks.length < result.chunkCount) break
  }
  return urls
}

export interface NextChapterAudio {
  chapterNumber: number
  /** Ready recordings of the next chapter's opening, in playing order. */
  urls: string[]
}

export interface UseLabListenOptions {
  playbackUnavailable?: boolean
  /** V2: cancelled or superseded play requests cannot skip or repaint clips. */
  guardPlaybackRequests?: boolean
  bookId?: string
  bookTitle?: string
  chapterTitle?: string
  /** Lock-screen artwork. */
  coverSrc?: string
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
   * The next chapter's opening audio, when it is already prepared. Read at
   * the chapter's last `ended`: if `onChapterComplete` accepts the
   * transition, the first URL is started on the same element inside that
   * event, so a locked iPhone keeps playing while the page loads the chapter.
   * The started chapter adopts it in place once its clips resolve.
   */
  nextChapterAudio?: () => NextChapterAudio | null
  /**
   * Fish narration pilot. When set, clips are prepared on demand through
   * `ensure` instead of read from the Kokoro manifest, and only words the
   * provider timed for that exact recording are painted. `voice` is part of
   * the playback tuple: changing it resets playback like an edition change.
   */
  narration?: LabNarrationOption | null
}

export interface LabNarrationOption {
  /** Audio-only tail, prepared by the ordinary bounded look-ahead after Play. */
  endingCue?: {
    text: string
    ensure: (signal: AbortSignal, mode?: NarrationEnsureRequest['mode'], fromChunk?: number) => Promise<NarrationParagraphResult[]>
  }
  voice: string
  /** One call generates at most one missing sentence group (`mode: 'next'`) and reports every requested paragraph's state. */
  ensure: (paragraphIndexes: number[], signal: AbortSignal, mode?: NarrationEnsureRequest['mode'], fromChunks?: Record<number, number>) => Promise<NarrationParagraphResult[]>
  /** Paragraphs kept complete ahead of the one playing (default 2, at most 3). */
  lookAhead?: number
  /** Warmed opening states; accepted only after exact text-hash validation. */
  prepared?: () => NarrationParagraphResult[]
}

export type LabNarrationState =
  | { status: 'idle' }
  /** `waiting`: the server is still making this recording; the reader sees "Preparing narration…" with Cancel. */
  | { status: 'loading'; paragraphIndex: number; waiting?: true }
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

/**
 * Wall-clock milliseconds, used only to bound and count a wait for synthesis.
 * The follow paint never reads it: that follows the audio element's clock.
 */
function waitClockMs(): number {
  return new Date().getTime()
}

function deferredSignal(): { promise: Promise<void>; resolve: () => void } {
  let resolve: () => void = () => {}
  const promise = new Promise<void>((done) => { resolve = done })
  return { promise, resolve }
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

/** The element is not playing the clip's recording: it is being prepared, or silence holds its place. */
function waitingForNarration(clip: LabAudioClip | undefined, audio: HTMLAudioElement): boolean {
  if (isHoldSource(audio)) return true
  return clip?.kind === 'paragraph' && !!clip.narration && (!clip.url || !sourcePlaysClip(audio.src, clip.url))
}

function pageHidden(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden'
}

/**
 * 8 ms of silence (public/lab/unlock-silence.wav). Played muted inside a tap
 * to unlock the narration element (see `unlockPlayback`); never heard and
 * never a narration source. It is a same-origin file, not a data: URI:
 * production's CSP is `media-src 'self' blob: mediastream:`, which refused the
 * data: clip, so the iPhone unlock never happened.
 */
export const LAB_SILENT_UNLOCK_SRC = '/lab/unlock-silence.wav'

function isUnlockSource(audio: HTMLAudioElement): boolean {
  // Browsers report `src` resolved to an absolute URL; compare the path.
  if (typeof audio.src !== 'string' || !audio.src) return false
  try {
    return new URL(audio.src, 'https://tinct.invalid').pathname === LAB_SILENT_UNLOCK_SRC
  } catch {
    return false
  }
}

/**
 * One second of silence (public/lab/narration-hold.wav), looped on the
 * narration element while a hidden page waits for the next recording or for
 * the network. On a locked iPhone an element that goes idle loses the audio
 * session, the page is suspended, and a later play() is refused: narration
 * stopped mid-chapter until the reader looked at the phone. Silence that keeps
 * playing keeps both; the real clip is swapped in from one of the element's
 * own events. Same-origin like the unlock clip, for the CSP's media-src.
 */
export const LAB_NARRATION_HOLD_SRC = '/lab/narration-hold.wav'

/** One second of 8 kHz, 8-bit mono PCM silence: the same bytes as the static file. */
function silentWav(): Uint8Array {
  const samples = 8000
  const bytes = new Uint8Array(44 + samples)
  const view = new DataView(bytes.buffer)
  const ascii = (offset: number, text: string) => { for (let i = 0; i < text.length; i += 1) bytes[offset + i] = text.charCodeAt(i) }
  ascii(0, 'RIFF'); view.setUint32(4, 36 + samples, true); ascii(8, 'WAVE')
  ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, 8000, true); view.setUint32(28, 8000, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true)
  ascii(36, 'data'); view.setUint32(40, samples, true)
  bytes.fill(0x80, 44)
  return bytes
}

let holdBlobUrl: string | null | undefined
/**
 * The hold's source: made in memory (a blob: URL, which the CSP admits), so
 * it plays in a tunnel with no network at all; the static file otherwise.
 */
function holdSourceUrl(): string {
  if (holdBlobUrl === undefined) {
    holdBlobUrl = null
    try {
      if (typeof Blob !== 'undefined' && typeof URL.createObjectURL === 'function') {
        holdBlobUrl = URL.createObjectURL(new Blob([silentWav()], { type: 'audio/wav' }))
      }
    } catch { /* the static file serves */ }
  }
  return holdBlobUrl ?? LAB_NARRATION_HOLD_SRC
}

function isHoldSource(audio: HTMLAudioElement): boolean {
  if (typeof audio.src !== 'string' || !audio.src) return false
  if (holdBlobUrl && audio.src === holdBlobUrl) return true
  try {
    return new URL(audio.src, 'https://tinct.invalid').pathname === LAB_NARRATION_HOLD_SRC
  } catch {
    return false
  }
}

function defaultCreateAudio(): HTMLAudioElement {
  const audio = new Audio()
  audio.preload = 'auto'
  // Keep one native media element eligible for iOS lock-screen ownership.
  // `playsinline` avoids a separate fullscreen media lifecycle on WebKit.
  if (typeof audio.setAttribute === 'function') audio.setAttribute('playsinline', '')
  return audio
}

/** Lock-screen state follows the player at once, not after React's next commit (a locked phone may not render). */
function publishPlaybackState(playing: boolean): void {
  const session = readerMediaSession()
  if (!session) return
  try { session.playbackState = playing ? 'playing' : 'paused' } catch { /* unsupported */ }
}

export function useLabListen(options: UseLabListenOptions) {
  const [playing, setPlayingState] = useState(false)
  const setPlaying = useCallback((value: boolean) => {
    setPlayingState(value)
    publishPlaybackState(value)
  }, [])
  const [pending, setPendingState] = useState(false)
  const [loading, setLoading] = useState(false)
  /**
   * The playing recording ran out of downloaded audio mid-clip (the element's
   * `waiting`): the transport shows its loading ring, after a short delay so
   * a blip never flashes, until sound resumes. Not `pending`: nothing is being
   * started, Pause still pauses, and no stall deadline runs.
   */
  const [buffering, setBufferingState] = useState(false)
  const bufferingTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const setBuffering = useCallback((value: boolean) => {
    clearTimeout(bufferingTimerRef.current)
    if (!value) { setBufferingState(false); return }
    bufferingTimerRef.current = setTimeout(() => setBufferingState(true), BUFFERING_SHOW_AFTER_MS)
  }, [])
  const pendingRef = useRef(false)
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const loadingDeadlineRef = useRef<ReturnType<typeof setTimeout>>()
  const retryPlaybackRef = useRef<() => void>(() => {})
  useEffect(() => playing ? acquireBrowserAudioSession('playback') : undefined, [playing])
  const [follow, setFollow] = useState<FollowTarget>({ kind: 'none' })
  const [src, setSrc] = useState<string | null>(null)
  const [clipIndex, setClipIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [speed, setSpeedState] = useState(() => parseHearingSpeed(options.playbackSpeed) ?? 1)
  const speedRef = useRef(speed)
  speedRef.current = speed
  const [followParagraphs, setFollowParagraphs] = useState<FollowParagraph[]>(options.followParagraphs)
  const [clips, setClips] = useState<LabAudioClip[]>([])
  const publishPositionRef = useRef<() => void>(() => {})
  const applyMetadataRef = useRef<() => void>(() => {})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const clipsRef = useRef<LabAudioClip[]>([])
  const paragraphsRef = useRef<FollowParagraph[]>(options.followParagraphs)
  const clipIndexRef = useRef(0)
  const positionRef = useRef({ clipIndex: 0, time: 0 })
  const playClipRef = useRef<(index: number, offsetSeconds: number, andPlay?: boolean, reload?: boolean) => boolean>(() => false)
  const switchingRef = useRef(false)
  const playingRef = useRef(false)
  const chapterHandoffRef = useRef(false)
  const chapterCompletedRef = useRef(false)
  const playRequestRef = useRef(0)
  /** The reader (in-app, lock screen, AirPods) or the app paused or stopped on purpose: never auto-resume. */
  const userPausedRef = useRef(false)
  /** iOS paused the element by itself; retried for a few seconds (INTERRUPTION_RETRY_DELAYS_MS). */
  const interruptionRef = useRef<{ startedAt: number; timers: Array<ReturnType<typeof setTimeout>> } | null>(null)
  const lastAutoResumeRef = useRef<number | null>(null)
  /**
   * The next chapter's opening, started on the element at the chapter's last
   * `ended` (see `nextChapterAudio`) and playing while the page loads that
   * chapter. `position` is the URL on the element; `drained` once the last
   * one ended before the chapter was adopted.
   */
  const bridgeRef = useRef<{ chapterNumber: number; urls: string[]; position: number; drained: boolean } | null>(null)
  const startBridgeRef = useRef<(audio: HTMLAudioElement, bridge: NextChapterAudio) => void>(() => {})
  const advanceBridgeRef = useRef<(audio: HTMLAudioElement) => void>(() => {})
  const beginInterruptionRef = useRef<(audio: HTMLAudioElement) => void>(() => {})
  const endInterruptionRef = useRef<() => void>(() => {})
  const attemptResumeRef = useRef<() => void>(() => {})
  const adoptBridgeRef = useRef<(clips: LabAudioClip[]) => boolean>(() => false)
  /**
   * Silence holding the element on a hidden page (LAB_NARRATION_HOLD_SRC).
   * `run` is the start waiting for the hold's next event (not before
   * `notBefore`), valid only while `request` is still the current play request.
   */
  const holdRef = useRef<{ run: (() => void) | null; request: number; notBefore: number } | null>(null)
  /** The hold clip could not play here (refused or failed to load): wait the ordinary way. */
  const holdBrokenRef = useRef(false)
  /** True while a start runs from inside one of the hold's own events. */
  const inHoldEventRef = useRef(false)
  /**
   * iOS paused the element (a call, a navigation prompt, Siri) and the reader
   * has not acted since: when iOS resumes the element itself, the player follows.
   */
  const systemPausedRef = useRef(false)
  /** Reloads of one clip after its audio failed to load: which URL, how many, since when. */
  const reloadRef = useRef<{ url: string; attempts: number; since: number } | null>(null)
  const startHoldRef = useRef<(audio: HTMLAudioElement) => boolean>(() => false)
  const reloadClipRef = useRef<(audio: HTMLAudioElement) => boolean>(() => false)
  const runHoldRef = useRef<() => void>(() => {})
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
  /** Resolves (and is replaced) each time one answer of a parallel round has been adopted. */
  const roundProgressRef = useRef(deferredSignal())
  const narrationLookAheadRef = useRef<Promise<void> | null>(null)
  /** Recordings downloaded ahead of their turn (downloadAhead); created on first use. */
  const clipBufferRef = useRef<NarrationClipBuffer | null>(null)
  /** When the clip buffer was last topped up. */
  const clipBufferAtRef = useRef(0)
  /** The playing recording's clock: where it was and when it last moved (stall watchdog). */
  const progressRef = useRef<{ src: string; time: number; at: number }>({ src: '', time: 0, at: 0 })
  /** When the element last reported bytes arriving (`progress`). */
  const dataAtRef = useRef(0)
  /** A stall being recovered: which clip, from which second, how many tries, the next one's time. */
  const stallRef = useRef<{ index: number; time: number; attempts: number; since: number; nextAt: number } | null>(null)
  const noteProgressRef = useRef<(audio: HTMLAudioElement) => void>(() => {})
  const checkStallRef = useRef<() => void>(() => {})
  const holdForStallRef = useRef<(audio: HTMLAudioElement) => boolean>(() => false)
  /** downloadAhead, for the element's handlers and the visibility listener. */
  const downloadAheadRef = useRef<() => void>(() => {})
  const narrationRetryRef = useRef<(() => void) | null>(null)
  const [narrationState, setNarrationState] = useState<LabNarrationState>({ status: 'idle' })
  // Counted, never shown: which failure code and which book, nothing else.
  useEffect(() => {
    if (narrationState.status === 'error') trackFunnel('audio_failed', { book_id: optionsRef.current.bookId || 'bible', reason: narrationState.reason || 'unknown' })
  }, [narrationState])
  const pendingPlaceRef = useRef<PlaceInput | null>(null)
  const playPlaceRef = useRef<(clips: LabAudioClip[], place: PlaceInput, andPlay: boolean, includeTitle?: boolean) => boolean>(() => false)
  const optionsRef = useRef(options)
  optionsRef.current = options
  paragraphsRef.current = followParagraphs

  // Intent is cancellable immediately; delay only the spinner to avoid flashing
  // between cached native clips. Neither preparation nor play() completion may
  // revive a cancelled request.
  // The deadline is a stall guard: it restarts whenever the server answers
  // "still being made", so only silence (a hung request) trips it; the
  // preparation loop enforces its own ceiling for long waits.
  const armPendingDeadline = useCallback(() => {
    clearTimeout(loadingDeadlineRef.current)
    loadingDeadlineRef.current = setTimeout(function expire() {
      // Never stop on a timer while audio may still come: a hidden page that
      // is still playing (silence holding, or a clip loading) keeps waiting;
      // its own waits are bounded (NARRATION_HOLD_MAX_MS, the ensure timeout).
      const held = audioRef.current
      if (held && playingRef.current && !userPausedRef.current && !held.paused && (isHoldSource(held) || pageHidden())) {
        loadingDeadlineRef.current = setTimeout(expire, PENDING_DEADLINE_MS)
        return
      }
      pendingRef.current = false
      setPendingState(false)
      setLoading(false)
      playRequestRef.current += 1
      narrationRequestRef.current += 1
      narrationAbortRef.current?.abort()
      narrationAbortRef.current = null
      if (audioRef.current) { audioRef.current.autoplay = false; audioRef.current.pause() }
      playingRef.current = false
      setPlaying(false)
      narrationRetryRef.current = () => retryPlaybackRef.current()
      setNarrationState({ status: 'error', paragraphIndex: clipsRef.current[clipIndexRef.current]?.kind === 'paragraph' ? (clipsRef.current[clipIndexRef.current] as Extract<LabAudioClip, { kind: 'paragraph' }>).index : 0,
        message: 'Audio took too long to start. Try again.', reason: 'timeout' })
    }, PENDING_DEADLINE_MS)
  }, [])

  const setPending = useCallback((value: boolean) => {
    if (pendingRef.current === value) return
    pendingRef.current = value
    setPendingState(value)
    clearTimeout(loadingTimerRef.current)
    clearTimeout(loadingDeadlineRef.current)
    if (!value) { setLoading(false); return }
    loadingTimerRef.current = setTimeout(() => setLoading(true), 150)
    armPendingDeadline()
  }, [armPendingDeadline])

  const audioChapter = () => optionsRef.current.chapterNumber ?? 1
  const audioEdition = () => optionsRef.current.audioEdition || 'kjv-en'
  const audioBook = () => optionsRef.current.bookId || 'bible'
  /** Where a clip's recording is fetched from: narration's own URL, or the Kokoro file's. */
  const clipSourceUrl = (clip: LabAudioClip): string | null => (
    clip.kind === 'paragraph' && clip.narration
      ? clip.url ?? null
      : labAudioFileUrl(clip.file, audioChapter(), audioEdition(), audioBook())
  )
  /** The source the element is given for a recording: its downloaded copy when there is one. */
  const elementSource = (url: string): string => clipBufferRef.current?.sourceFor(url) ?? url

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

  // Keep the virtual tail out of source paragraphs, followParagraphs and reader persistence.
  const narrationParagraphs = () => {
    const ending = optionsRef.current.narration?.endingCue
    return ending
      ? [...paragraphsRef.current, { index: optionsRef.current.paragraphs.length, text: ending.text }]
      : paragraphsRef.current
  }

  /** Clips for the narration tuple: one per known sentence group, or one placeholder per paragraph. */
  const rebuildNarrationClips = useCallback(() => {
    const before = clipsRef.current[clipIndexRef.current]
    const identity: ChunkTarget | null = before?.kind === 'paragraph'
      ? { paragraphIndex: before.index, chunkIndex: before.chunk?.index ?? 0 }
      : null
    const hashes = narrationHashesRef.current
    const clips: LabAudioClip[] = []
    for (const paragraph of narrationParagraphs()) {
      const textHash = hashes.get(paragraph.index)
      if (textHash == null) continue
      const entry = narrationPreparedRef.current.get(paragraph.index)
      const layout = chunkNarrationTokens(narrationTokens(paragraph.text))
      for (const expected of layout) {
        const chunk = entry?.textHash === textHash ? entry.chunks[expected.index] : undefined
        clips.push({
          kind: 'paragraph', index: paragraph.index,
          announcement: paragraph.index === optionsRef.current.paragraphs.length || undefined,
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
      const paragraph = narrationParagraphs().find(item => item.index === result.paragraph)
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
  const ensureRound = useCallback(async (
    indexes: number[],
    satisfied?: () => boolean,
    fromChunks?: Record<number, number>,
    /** Several distinct sentence groups to prepare at once (fast playback); the first is the one reported on. */
    parallel?: Array<{ index: number; chunk: number }>,
  ): Promise<NarrationOutcome> => {
    const generation = playRequestRef.current
    const narration = optionsRef.current.narration
    if (!narration || indexes.length === 0) return { ok: false, reason: 'not_configured' }
    while (narrationRoundRef.current) {
      // A round in flight may land what this caller needs part-way (its parallel answers apply as they come).
      try { await Promise.race([narrationRoundRef.current, roundProgressRef.current.promise]) } catch { /* reported by its own caller */ }
      if (generation !== playRequestRef.current) return { ok: false, reason: 'cancelled' }
      // The round in flight may have landed exactly what this caller needs.
      if (satisfied?.()) return { ok: true }
    }
    if (generation !== playRequestRef.current) return { ok: false, reason: 'cancelled' }
    const signal = narrationSignal()
    // Each parallel request names its own sentence group: the Worker makes
    // the first missing group at or after it, and its per-group lease keeps
    // two readers (or two requests) from ever paying for the same one.
    const ensureIndexes = async (indexes: number[], fromChunks?: Record<number, number>) => {
      const tail = optionsRef.current.paragraphs.length
      const source = indexes.filter(index => index < tail)
      const results = source.length ? await narration.ensure(source, signal, 'next', fromChunks) : []
      if (narration.endingCue && indexes.includes(tail) && !signal.aborted && generation === playRequestRef.current) {
        const cue = await narration.endingCue.ensure(signal, 'next', fromChunks?.[tail])
        results.push(...cue.filter(result => result.paragraph === 0).map(result => ({ ...result, paragraph: tail })))
      }
      return results
    }
    // Side by side, each answer is adopted as it arrives: the next recording
    // never waits on a slower synthesis of a later one.
    const round = parallel && parallel.length > 1
      ? Promise.all(parallel.map(target => ensureIndexes([target.index], { [target.index]: target.chunk }).then((results) => {
          // Adopted on the same terms as the round's own end: unless a tuple change or stop aborted it.
          if (!signal.aborted) {
            applyPreparedNarration(results)
            const progress = roundProgressRef.current
            roundProgressRef.current = deferredSignal()
            progress.resolve()
          }
          return results
        })))
        .then(answers => answers.flat())
      : ensureIndexes(indexes, fromChunks)
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
      if ((first.status === 'pending' && first.readyChunks === 0) || (first.retryAfterMs && satisfied && !satisfied())) return { ok: false, reason: 'pending', retryAfterMs: first.retryAfterMs ?? 1500 }
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
  const enterPreparing = useCallback((index: number, offsetSeconds: number, keepElement = false) => {
    const audio = audioRef.current
    switchingRef.current = true
    // An ended native element can retain its media session while the next
    // generated clip arrives. Clearing it here breaks locked-screen handoff.
    // Manual seeks still silence and clear a recording that has not ended.
    // `keepElement`: silence takes the element over right after (a hidden page).
    const continuousBoundary = keepElement || Boolean(playingRef.current && audio?.ended)
    if (audio && !continuousBoundary) {
      audio.loop = false
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
  /** The next `count` sentence groups after `target` that are not ready yet, in playing order. */
  const nextMissingGroups = useCallback((target: ChunkTarget, count: number): Array<{ index: number; chunk: number }> => {
    const clips = clipsRef.current
    const from = clips.findIndex(clip => clip.kind === 'paragraph' && clip.index === target.paragraphIndex && (clip.chunk?.index ?? 0) === target.chunkIndex)
    const found: Array<{ index: number; chunk: number }> = []
    for (let position = from + 1; from >= 0 && position < clips.length && found.length < count; position += 1) {
      const clip = clips[position]
      if (clip.kind === 'paragraph' && !clip.url) found.push({ index: clip.index, chunk: clip.chunk?.index ?? 0 })
    }
    return found
  }, [])

  const prepareThenRun = useCallback(async (target: ChunkTarget, resume: () => void) => {
    const request = ++narrationRequestRef.current
    const playRequest = playRequestRef.current
    const superseded = () => request !== narrationRequestRef.current || playRequest !== playRequestRef.current
    setPending(true)
    setNarrationState({ status: 'loading', paragraphIndex: target.paragraphIndex })
    const startedAt = waitClockMs()
    // Counted, never shown: how long a start waited on synthesis, no text.
    const reportWait = (outcome: 'started' | 'failed' | 'cancelled') => {
      const seconds = Math.round((waitClockMs() - startedAt) / 1000)
      if (seconds >= NARRATION_SLOW_START_SECONDS) trackFunnel('audio_slow_start', { seconds, outcome })
    }
    let outcome: NarrationOutcome = { ok: true }
    let polls = 0
    let failures = 0
    // Silence is holding the element on a hidden page: nobody can tap Retry,
    // so a dropped connection or a busy provider is waited out (bounded).
    const holding = () => {
      const audio = audioRef.current
      return Boolean(audio && isHoldSource(audio) && !audio.paused && playingRef.current)
    }
    // Each productive round lands one chunk; a chunk beyond the ready prefix
    // needs as many rounds as it is deep, plus a few spare. Waiting on a
    // group still being made does not use up rounds: it is bounded by time.
    for (let round = 0; round - polls < target.chunkIndex + 6 && !chunkReady(target); round += 1) {
      // Starting at speed, the groups after this one are asked for alongside
      // it: the first handoff would otherwise wait on a synthesis that takes
      // longer than this group plays.
      const width = round === 0 ? narrationLookAheadWidth(speedRef.current) : 1
      const following = width > 1 ? nextMissingGroups(target, width - 1) : []
      outcome = await ensureRound(
        [target.paragraphIndex],
        () => chunkReady(target),
        { [target.paragraphIndex]: target.chunkIndex },
        following.length ? [{ index: target.paragraphIndex, chunk: target.chunkIndex }, ...following] : undefined,
      )
      if (superseded()) { reportWait('cancelled'); return }
      if (!outcome.ok) {
        const ceiling = holding() ? NARRATION_HOLD_MAX_MS : NARRATION_PREPARE_CEILING_MS
        if (outcome.reason !== 'pending') {
          if (!holding() || NARRATION_FINAL_REASONS.has(outcome.reason)) break
          const delay = narrationReloadDelayMs(failures)
          if (waitClockMs() - startedAt + delay > ceiling) break
          failures += 1
          polls += 1
          armPendingDeadline()
          await wait(delay)
          if (superseded()) { reportWait('cancelled'); return }
          continue
        }
        const delay = narrationPollDelayMs(polls, outcome.retryAfterMs)
        if (waitClockMs() - startedAt + delay > ceiling) break
        polls += 1
        // The server answered: this is a wait, not a stall.
        armPendingDeadline()
        if (polls === 1) setNarrationState({ status: 'loading', paragraphIndex: target.paragraphIndex, waiting: true })
        await wait(delay)
        if (superseded()) { reportWait('cancelled'); return }
      }
    }
    if (superseded()) { reportWait('cancelled'); return }
    if (chunkReady(target)) outcome = { ok: true }
    else if (outcome.ok) outcome = { ok: false, reason: 'unavailable' }
    if (!outcome.ok) {
      if (outcome.reason === 'cancelled') { reportWait('cancelled'); return }
      reportWait('failed')
      setPending(false)
      narrationRetryRef.current = () => { void prepareThenRun(target, resume) }
      setNarrationState({ status: 'error', paragraphIndex: target.paragraphIndex, message: narrationFailureMessage(outcome.reason), reason: outcome.reason })
      try { audioRef.current?.pause() } catch { /* ignore */ }
      holdRef.current = null
      if (audioRef.current) audioRef.current.loop = false
      playingRef.current = false
      setPlaying(false)
      return
    }
    reportWait('started')
    // Starting the element may still take a moment; that is the stall guard's again.
    armPendingDeadline()
    setNarrationState({ status: 'idle' })
    resume()
  }, [armPendingDeadline, ensureRound, nextMissingGroups, setPending])

  /**
   * Keep NARRATION_BUFFER_TARGET_SECONDS ready ahead of the actual playhead,
   * one sentence group per round at normal speed (a group generates in a
   * few seconds, well inside its own length), several side by side at speed. One loop at a time; it
   * follows the playing clip as it moves and ends on a tuple change, a stop,
   * or when nothing in the window is missing. Failures here are silent — the
   * clip that fails is retried, with a visible state, when playback reaches it.
   */
  /**
   * Keep the recordings after the playing one downloaded, whole, before their
   * turn (narrationClipBuffer.ts): a clip boundary then swaps the element to
   * audio already in memory instead of waiting on a fresh request over a
   * phone network. The window is listening time (longer while hidden, shorter
   * with Save-Data), never fewer than the next NARRATION_DOWNLOAD_AHEAD clips,
   * and runs into the next chapter's prepared opening once this chapter's
   * remaining audio is inside it. Each URL is fetched once; a failure only
   * means the element streams that clip itself.
   */
  const downloadAhead = useCallback(() => {
    if (typeof fetch !== 'function') return
    clipBufferAtRef.current = waitClockMs()
    const buffer = clipBufferRef.current ?? (clipBufferRef.current = new NarrationClipBuffer())
    const clips = clipsRef.current
    const index = clipIndexRef.current
    const current = clips[index]
    if (!current) return
    const candidates: BufferCandidate[] = clips.map(clip => ({ url: clipSourceUrl(clip) ?? undefined, duration: clip.duration }))
    const audio = audioRef.current
    const live = audio && clipSourceUrl(current) && sourcePlaysClip(audio.src, clipSourceUrl(current)) && Number.isFinite(audio.currentTime) ? audio.currentTime : positionRef.current.time
    const remaining = typeof current.duration === 'number' ? Math.max(0, current.duration - live) : 0
    const rate = audio?.playbackRate || speedRef.current || 1
    const saveData = connectionSavesData()
    // A weak network (a stalled or too-slow download) widens the window until it recovers.
    const target = clipBufferSeconds({ hidden: pageHidden(), saveData, rate }) * (buffer.weak && !saveData ? CLIP_BUFFER_WEAK_FACTOR : 1)
    // This chapter's audio left, when every later clip is ready to download.
    let chapterLeft = remaining
    let chapterReady = true
    for (let position = index + 1; position < candidates.length; position += 1) {
      if (!candidates[position].url) { chapterReady = false; break }
      chapterLeft += candidates[position].duration ?? 0
    }
    if (chapterReady && chapterLeft < target) {
      // The chapter boundary is a clip boundary like any other.
      const opening = optionsRef.current.nextChapterAudio?.()
      for (const url of opening?.urls ?? []) candidates.push({ url })
    }
    const urls = clipsToBuffer(candidates, index, remaining, target, NARRATION_DOWNLOAD_AHEAD)
    // The playing recording stalled while the element streams it: download a
    // copy first, so a reload resumes from memory as soon as bytes flow again.
    const streamedUrl = clipSourceUrl(current)
    if (stallRef.current && streamedUrl && !buffer.isReady(streamedUrl) && !urls.includes(streamedUrl)) urls.unshift(streamedUrl)
    const retain = candidates.slice(Math.max(0, index - 1)).map(candidate => candidate.url).filter((url): url is string => Boolean(url))
    // Buffer health: listening seconds that will play without the network — the
    // rest of this recording (in memory or the element's buffer), then every
    // following clip already downloaded, in order.
    let ready = remaining
    const currentUrl = clipSourceUrl(current)
    if (audio && currentUrl && sourcePlaysClip(audio.src, currentUrl) && !audio.src.startsWith('blob:') && audio.buffered?.length) {
      try { ready = Math.min(remaining, Math.max(0, audio.buffered.end(audio.buffered.length - 1) - live)) } catch { /* ignore */ }
    }
    // The element itself is out of audio for this recording (a stream that underran).
    const currentDry = remaining > 0.5 && ready < 0.5
    let nextMissing = false
    for (let position = index + 1; position < candidates.length; position += 1) {
      const url = candidates[position].url
      if (!url || !buffer.isReady(url)) { nextMissing = true; break }
      ready += candidates[position].duration ?? 0
    }
    const aheadSeconds = ready / rate
    const durations: Record<string, number | undefined> = {}
    for (const candidate of candidates) if (candidate.url) durations[candidate.url] = candidate.duration
    buffer.want(urls, retain, { aheadSeconds, rate, durations })
    // About to run dry with the next recording not here: say so, before any silence.
    if (playingRef.current) setBuffering(currentDry || Boolean(stallRef.current) || (nextMissing && aheadSeconds < CLIP_BUFFER_DRY_SECONDS))
  }, [setBuffering])

  downloadAheadRef.current = downloadAhead

  /** A sentence group's length before it exists: its words at a reading voice's pace (as the chapter clock estimates). */
  const estimatedGroupSeconds = (clip: LabAudioClip): number => {
    if (typeof clip.duration === 'number' && clip.duration > 0) return clip.duration
    if (clip.kind !== 'paragraph') return 0
    const text = narrationParagraphs().find(paragraph => paragraph.index === clip.index)?.text || ''
    const tokens = text.split(/\s+/).filter(Boolean)
    const from = clip.chunk?.wordFrom ?? 0
    const to = clip.chunk?.wordTo && clip.chunk.wordTo > from ? clip.chunk.wordTo : tokens.length
    return Math.max(1, (tokens.slice(from, to).join(' ').length || text.length) / 14)
  }

  const scheduleNarrationLookAhead = useCallback(() => {
    const narration = optionsRef.current.narration
    if (!narration || narrationLookAheadRef.current) return
    const loop = async () => {
      let idle = 0
      // At speed the buffer drains faster than one synthesis at a time can
      // refill it (a ~20 s sentence group lasts ~7 s at 3x). Fast listening
      // asks for the next groups side by side instead of one after another.
      for (let round = 0; round < 60; round += 1) {
        if (!playingRef.current) return
        const current = clipsRef.current[clipIndexRef.current]
        if (!current || current.kind !== 'paragraph') return
        const indexes: number[] = []
        const fromChunks: Record<number, number> = {}
        let buffered = 0
        const rate = audioRef.current?.playbackRate || 1
        const targetSeconds = (pageHidden() ? NARRATION_HIDDEN_BUFFER_TARGET_SECONDS : NARRATION_BUFFER_TARGET_SECONDS) * rate
        const width = narrationSynthesisWidth(rate)
        const targets: Array<{ index: number; chunk: number }> = []
        // Audio seconds up to each clip, counting groups still to make at their estimated length:
        // a group starting past the window is never asked for, so a stop wastes at most the window.
        let reach = 0
        for (let position = clipIndexRef.current; position < clipsRef.current.length && buffered < targetSeconds && reach < targetSeconds; position += 1) {
          const clip = clipsRef.current[position]
          if (clip.kind !== 'paragraph') continue
          const offset = position === clipIndexRef.current ? positionRef.current.time : 0
          if (clip.url && typeof clip.duration === 'number' && indexes.length === 0) {
            buffered += Math.max(0, clip.duration - offset)
            reach = buffered
          } else if (clip.url && typeof clip.duration === 'number') {
            reach += clip.duration
          } else if (!clip.url) {
            reach += Math.max(0, estimatedGroupSeconds(clip) - offset)
            if (!indexes.includes(clip.index)) {
              indexes.push(clip.index)
              fromChunks[clip.index] = clip.chunk?.index ?? 0
            }
            if (targets.length < width) targets.push({ index: clip.index, chunk: clip.chunk?.index ?? 0 })
            if (indexes.length >= 3 && targets.length >= width) break
          }
        }
        if (buffered >= targetSeconds || indexes.length === 0) return
        const before = indexes.map(index => narrationPreparedRef.current.get(index)?.chunks.filter(chunk => chunk.ready).length ?? 0).join(',')
        const outcome = await ensureRound(indexes, () => indexes.every(paragraphComplete), fromChunks, width > 1 ? targets : undefined)
        if (!outcome.ok && outcome.reason === 'cancelled') return
        downloadAhead()
        const after = indexes.map(index => narrationPreparedRef.current.get(index)?.chunks.filter(chunk => chunk.ready).length ?? 0).join(',')
        if (after === before) {
          idle += 1
          // A dropped connection is waited out like a busy group (a car
          // between cells); only a failure no wait can fix ends the loop.
          if (idle >= 3 || (!outcome.ok && NARRATION_FINAL_REASONS.has(outcome.reason))) return
          await wait(Math.min(5000, Math.max(750, (!outcome.ok && outcome.retryAfterMs) || 1500)))
        } else {
          idle = 0
        }
      }
    }
    narrationLookAheadRef.current = loop().finally(() => { narrationLookAheadRef.current = null })
  }, [ensureRound, downloadAhead])

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
  const endingCueText = options.narration?.endingCue?.text
  useEffect(() => {
    playRequestRef.current += 1
    narrationRequestRef.current += 1
    narrationAbortRef.current?.abort()
    narrationAbortRef.current = null
    pendingPlaceRef.current = null
    chapterCompletedRef.current = false
    endInterruptionRef.current()
    reloadRef.current = null
    // A start waiting on the hold belonged to the old tuple. At a chapter
    // handoff the silence itself keeps playing until the new chapter starts.
    if (holdRef.current) holdRef.current.run = null
    if (!chapterHandoffRef.current) {
      systemPausedRef.current = false
      holdRef.current = null
      const held = audioRef.current
      if (held && isHoldSource(held)) {
        held.loop = false
        try { held.pause() } catch { /* ignore */ }
        try { held.removeAttribute('src') } catch { /* ignore */ }
      }
    }
    narrationPreparedRef.current = new Map()
    narrationHashesRef.current = new Map()
    narrationRoundRef.current = null
    narrationRetryRef.current = null
    setNarrationState({ status: 'idle' })
    setFollowParagraphs(optionsRef.current.narration ? bareFollowParagraphs(options.followParagraphs) : options.followParagraphs)
    clipsRef.current = []
    setClips([])
    if (!chapterHandoffRef.current) {
      setPending(false)
      setSrc(null)
      playingRef.current = false
      setPlaying(false)
    }
    setFollow({ kind: 'none' })
  }, [options.audioEdition, options.bookId, options.chapterNumber, narrationActive, narrationVoice, endingCueText, setPending])

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
      setPending(false)
      holdRef.current = null
      audio.loop = false
      try { audio.pause() } catch { /* ignore */ }
      audio.autoplay = false
      playingRef.current = false
      setPlaying(false)
      setFollow({ kind: 'none' })
      setSrc(null)
      endNativeNarration()
    }
    const handleTimeUpdate = () => {
      if (primingRef.current || isUnlockSource(audio)) return
      noteProgressRef.current(audio)
      // Silence is holding the element: its clock is the moment to swap in a ready clip.
      if (isHoldSource(audio)) {
        // The hold's clock is the heartbeat on a locked phone: the buffer keeps downloading from it.
        if (playingRef.current && waitClockMs() - clipBufferAtRef.current >= CLIP_BUFFER_REFRESH_MS) downloadAheadRef.current()
        runHoldRef.current()
        return
      }
      // The next chapter's opening is playing before its clips exist here.
      if (bridgeRef.current) return
      const current = clipsRef.current[clipIndexRef.current]
      if (waitingForNarration(current, audio)) return
      syncFollow(clipIndexRef.current, audio.currentTime || 0)
      if (playingRef.current && waitClockMs() - clipBufferAtRef.current >= CLIP_BUFFER_REFRESH_MS) downloadAheadRef.current()
    }
    const handleEnded = () => {
      // Safari fires ended again when src changes on an already-ended element.
      if (!playingRef.current || !audio.src) return
      if (isHoldSource(audio)) {
        // A browser that does not loop the silence: swap now, or play it again.
        runHoldRef.current()
        if (isHoldSource(audio) && audio.ended) {
          try { audio.currentTime = 0 } catch { /* ignore */ }
          void Promise.resolve(audio.play()).catch(() => { /* reconciled on return */ })
        }
        return
      }
      if (bridgeRef.current) {
        // Safari's stale post-swap `ended` reports time zero; a real end does not.
        if (audio.ended && audio.currentTime > 0) advanceBridgeRef.current(audio)
        return
      }
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
      // This recording played to its end: a later load failure starts a fresh reload budget.
      reloadRef.current = null
      const next = clipIndexRef.current + 1
      const clip = clipsRef.current[next]
      if (!clip) {
        if (chapterCompletedRef.current) return
        chapterCompletedRef.current = true
        // Read before the reader moves on: it names the chapter being left.
        const bridge = optionsRef.current.nextChapterAudio?.() ?? null
        if (optionsRef.current.onChapterComplete?.()) {
          // iOS lets a page keep playing without a gesture only on the same
          // element, started from this event; the chapter text, its clips and
          // React all arrive later. Start its opening now and adopt it then.
          if (bridge && bridge.urls.length > 0 && playingRef.current) startBridgeRef.current(audio, bridge)
          // No opening ready: hold the element with silence while the page
          // loads the chapter, so its first play() is not refused.
          else if (playingRef.current && pageHidden()) startHoldRef.current(audio)
          return
        }
        finishPlayback()
        return
      }
      playClipRef.current(next, 0)
    }
    const handleError = () => {
      if (primingRef.current || isUnlockSource(audio)) return
      if (isHoldSource(audio)) {
        // The in-memory silence failed: the static file takes over, same element, same event.
        if (holdBlobUrl && audio.src === holdBlobUrl) {
          holdBlobUrl = null
          try { audio.removeAttribute('src') } catch { /* ignore */ }
          if (playingRef.current && !userPausedRef.current) startHoldRef.current(audio)
          return
        }
        // The silence itself cannot play here: wait the ordinary way, and
        // start a clip that was waiting for the hold now.
        holdBrokenRef.current = true
        audio.loop = false
        const run = holdRef.current?.request === playRequestRef.current ? holdRef.current.run : null
        holdRef.current = null
        run?.()
        return
      }
      const failing = clipsRef.current[clipIndexRef.current]
      // The current recording failed to load (switchingRef only screens out
      // the previous source's stale events, which carry no error of their own).
      const ownError = Boolean(audio.error) && failing?.kind === 'paragraph' && !!failing.narration && !!failing.url && sourcePlaysClip(audio.src, failing.url)
      if (switchingRef.current && !ownError) return
      // A downloaded copy that will not play: drop it and stream the recording itself, same place.
      const failingUrl = failing ? clipSourceUrl(failing) : null
      if (playingRef.current && failingUrl && audio.src.startsWith('blob:') && sourcePlaysClip(audio.src, failingUrl) && clipBufferRef.current?.sourceFor(failingUrl) === audio.src) {
        clipBufferRef.current.forget(failingUrl)
        const live = Number.isFinite(audio.currentTime) ? audio.currentTime : 0
        const index = clipIndexRef.current
        const time = live > 0 ? live : positionRef.current.time
        // Hidden: never a pause on a locked phone; silence holds the element and the swap happens from its event.
        if (pageHidden() && startHoldRef.current(audio)) {
          holdRef.current = { run: () => { playClipRef.current(index, time, true, true) }, request: playRequestRef.current, notBefore: 0 }
          return
        }
        playClipRef.current(index, time)
        return
      }
      if (ownError && reloadClipRef.current(audio)) return
      // A next-chapter opening that fails is dropped; the chapter starts it normally once loaded.
      if (bridgeRef.current) { bridgeRef.current = null; return }
      // An element that is neither playing nor asked to play has nothing to
      // advance. Clearing the unlock clip's src (or a page refusing it) makes
      // the element report an error; read as a failed last clip, that moved
      // the reader to the next chapter on the first Chat open after a load.
      if (!playingRef.current && !pendingRef.current) return
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
    const handlePlaying = () => {
      // During a stall recovery `playing` is not sound yet: only a moving clock ends it.
      if (!stallRef.current) setBuffering(false)
      if (primingRef.current) return
      if (!playingRef.current) {
        if ((interruptionRef.current || systemPausedRef.current) && !userPausedRef.current) {
          // iOS resumed the element itself after an interruption, however long
          // ago it began (a call, a run of navigation prompts): follow it.
          endInterruptionRef.current()
          systemPausedRef.current = false
          playingRef.current = true
          setPlaying(true)
          // Silence was holding a recording still to come: ask for it again.
          if (isHoldSource(audio)) playClipRef.current(clipIndexRef.current, positionRef.current.time)
        } else {
          // A late native start after cancellation must stay silent.
          audio.autoplay = false
          audio.pause()
          return
        }
      }
      setPlaying(true)
      if (stallRef.current && !pageHidden()) publishPlaybackState(false)
      if (!waitingForNarration(clipsRef.current[clipIndexRef.current], audio)) setPending(false)
      // iOS can drop Now Playing details set before audio first played; restate them once it does.
      applyMetadataRef.current()
    }
    // Invariant 5: the one speed is applied on every play event too.
    const handlePlay = () => {
      if (primingRef.current || isUnlockSource(audio)) return
      try { if (audio.playbackRate !== speedRef.current) audio.playbackRate = speedRef.current } catch { /* jsdom */ }
    }
    /**
     * The element paused and the reader did not ask for it: iOS does this for
     * a call, Siri, another app's audio, a notification sound. The player
     * shows it paused, the lock screen too, and the interruption is retried.
     * Our own pauses come with `playingRef` already false, or are followed by
     * a play() before this event is dispatched; an `ended` pause is the
     * boundary path's.
     */
    const handlePause = () => {
      if (primingRef.current || isUnlockSource(audio)) return
      if (!playingRef.current || userPausedRef.current || switchingRef.current) return
      if (audio.paused !== true || audio.ended || !audio.src) return
      beginInterruptionRef.current(audio)
    }
    // Out of audio mid-recording (a stream that stalled): say so in the transport.
    const handleWaiting = () => {
      if (primingRef.current || isUnlockSource(audio) || isHoldSource(audio) || bridgeRef.current) return
      if (!playingRef.current || pendingRef.current || audio.paused) return
      setBuffering(true)
    }
    const clearBuffering = () => setBuffering(false)
    const publishPosition = () => publishPositionRef.current()
    const nowPlayingEvents = ['playing', 'timeupdate', 'seeked', 'ratechange', 'loadedmetadata'] as const
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('waiting', handleWaiting)
    for (const type of ['pause', 'ended', 'emptied'] as const) audio.addEventListener(type, clearBuffering)
    // Bytes arriving: a slow load is buffering, not wedged. A stall-type event re-checks soon.
    // Media events drive the checks too: a locked phone suspends timers, not the element's events.
    const handleProgress = () => { dataAtRef.current = waitClockMs(); checkStallRef.current() }
    const handleStallEvent = (event: Event) => {
      // Hidden and out of audio: hold now, inside this event; no timer may come to notice it later.
      // Not for a copy in memory (it only decodes) nor a source just assigned
      // (an ordinary start): `stalled` — no data for ~3 s — counts for a fresh source too.
      const streaming = !audio.src.startsWith('blob:')
      const underrun = event.type === 'stalled' || (event.type === 'waiting' && !switchingRef.current)
      if (underrun && streaming && pageHidden() && audio.readyState < 3 && !audio.paused && playingRef.current
        && holdForStallRef.current(audio)) return
      checkStallRef.current()
      setTimeout(() => checkStallRef.current(), NARRATION_STALL_MS + 50)
    }
    audio.addEventListener('progress', handleProgress)
    for (const type of STALL_EVENTS) audio.addEventListener(type, handleStallEvent)
    for (const type of nowPlayingEvents) audio.addEventListener(type, publishPosition)
    return () => {
      audio.removeEventListener('progress', handleProgress)
      for (const type of STALL_EVENTS) audio.removeEventListener(type, handleStallEvent)
      audio.removeEventListener('waiting', handleWaiting)
      for (const type of ['pause', 'ended', 'emptied'] as const) audio.removeEventListener(type, clearBuffering)
      for (const type of nowPlayingEvents) audio.removeEventListener(type, publishPosition)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [setBuffering, setPending, setPlaying, syncFollow])

  const detachRef = useRef<(() => void) | null>(null)
  const primingRef = useRef(false)
  /** The element's own muted state from before the unlock clip muted it. */
  const primingMutedRef = useRef(false)
  const unlockedRef = useRef(false)

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
      if (audio && !preparing && !bridgeRef.current) {
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
    clearTimeout(loadingTimerRef.current)
    clearTimeout(loadingDeadlineRef.current)
    clearTimeout(bufferingTimerRef.current)
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
    clipBufferRef.current?.clear()
    endNativeNarration()
  }, [])

  /**
   * Unlock the narration element inside a reader gesture. iOS WebKit lets an
   * audio element start later, outside a gesture, only once it has played
   * inside one. Audio that Talk or Chat starts ("play the audiobook") runs
   * from a WebSocket or network callback, long after the tap; on an element
   * that had never played, that first play() was refused and the reader saw
   * "Audio couldn't start" until Retry (a tap) supplied the gesture. Call
   * this synchronously from the tap that opens the companion. It plays 8 ms
   * of muted silence once, then leaves the element empty. An element that
   * already holds narration has played inside a gesture and is left alone.
   */
  const unlockPlayback = useCallback(() => {
    if (unlockedRef.current || optionsRef.current.playbackUnavailable) return
    const audio = ensureAudio()
    if (audio.src || playingRef.current || pendingRef.current) { unlockedRef.current = true; return }
    unlockedRef.current = true
    primingRef.current = true
    const wasMuted = Boolean(audio.muted)
    primingMutedRef.current = wasMuted
    try { audio.muted = true } catch { /* jsdom */ }
    const finish = (unlocked: boolean) => {
      if (!primingRef.current) return
      primingRef.current = false
      if (!unlocked) unlockedRef.current = false
      // A real play request may already own the element; leave it be.
      if (isUnlockSource(audio)) {
        try { audio.pause() } catch { /* ignore */ }
        try { audio.removeAttribute('src') } catch { /* ignore */ }
      }
      try { audio.muted = wasMuted } catch { /* jsdom */ }
    }
    try {
      audio.src = LAB_SILENT_UNLOCK_SRC
      // Calling play() inside the gesture is what unlocks the element; pause
      // at once so nothing, not even silence, keeps the output. An abort from
      // that pause still counts; a refusal (no gesture) tries again next tap.
      const played = audio.play()
      try { audio.pause() } catch { /* ignore */ }
      Promise.resolve(played).then(() => finish(true), (error: unknown) => finish((error as Error)?.name === 'AbortError'))
    } catch {
      finish(false)
    }
  }, [ensureAudio])

  const playClip = useCallback((index: number, offsetSeconds: number, andPlay = true, reload = false) => {
    pendingPlaceRef.current = null
    if (optionsRef.current.playbackUnavailable) return false
    const request = ++playRequestRef.current
    chapterCompletedRef.current = false
    endInterruptionRef.current()
    if (andPlay) userPausedRef.current = false
    systemPausedRef.current = false
    const audio = ensureAudio()
    const clip = clipsRef.current[index]
    if (!clip) { setPending(false); return false }
    setPending(andPlay)
    if (andPlay) {
      narrationRetryRef.current = null
      setNarrationState({ status: 'idle' })
      retryPlaybackRef.current = () => { playClipRef.current(index, offsetSeconds, true) }
    }
    if (clip.kind === 'paragraph' && clip.narration && !clip.url) {
      // On-demand narration: prepare this sentence group, then play it for
      // real. The clock starts over here so the previous clip's end time
      // cannot leak into the follow paint or the progress bar while we wait.
      const target: ChunkTarget = { paragraphIndex: clip.index, chunkIndex: clip.chunk?.index ?? 0 }
      // A hidden page cannot start the element again once it goes idle:
      // silence holds it, started here (inside the event or the gesture that
      // asked), until the recording is ready.
      const hold = andPlay && pageHidden() && !isNativeCapacitor() && !holdBrokenRef.current
      enterPreparing(index, offsetSeconds, hold)
      if (!andPlay) return true
      if (hold) startHoldRef.current(audio)
      void prepareThenRun(target, () => {
        const ready = findClipIndex(target)
        if (ready >= 0) playClipRef.current(ready, offsetSeconds, andPlay)
      })
      return true
    }
    const url = clip.kind === 'paragraph' && clip.url
      ? clip.url
      : labAudioFileUrl(clip.file, audioChapter(), audioEdition(), audioBook())
    if (andPlay && !inHoldEventRef.current && isHoldSource(audio) && !audio.paused) {
      // Silence is holding the element (a hidden page). The swap happens in
      // the hold's next event, ~4 times a second: a start from a network
      // callback or a timer is what a locked iPhone refuses.
      clipIndexRef.current = index
      setClipIndex(index)
      positionRef.current = { clipIndex: index, time: offsetSeconds }
      setSrc(NARRATION_PENDING_SRC)
      holdRef.current = { run: () => { playClipRef.current(index, offsetSeconds, true) }, request, notBefore: 0 }
      return true
    }
    const fromHold = isHoldSource(audio)
    holdRef.current = null
    audio.loop = false
    switchingRef.current = true
    clipIndexRef.current = index
    setClipIndex(index)
    // The clip and offset just chosen are the listening position now. The
    // clock guard in syncFollow ignores a zero time on the same clip, so a
    // jump back to a clip's first word would otherwise leave the previous
    // offset behind for a later resume or retry to replay.
    positionRef.current = { clipIndex: index, time: offsetSeconds }
    setSrc(url)
    if (primingRef.current) {
      // The unlock clip is still settling: this real request owns the element now.
      primingRef.current = false
      try { audio.muted = primingMutedRef.current } catch { /* jsdom */ }
    }
    // `reload`: a stalled element loads the recording afresh (assigning src always reloads).
    const sameSrc = !reload && sourcePlaysClip(audio.src, url)
    // At an automatic boundary, pausing the ended element before assigning
    // the next source makes WebKit hand lock-screen ownership back to the
    // page. Preserve the active native media session and arm autoplay before
    // the synchronous source swap. Android instead waits for foreground-service
    // ownership in playReaderAudioTransition before any playback can start.
    // Manual seeks/source changes still pause.
    const continuousBoundary = Boolean(andPlay && playingRef.current && (audio.ended || (fromHold && !audio.paused)))
    audio.autoplay = andPlay && !isNativeCapacitor()
    if (!continuousBoundary) {
      try { audio.pause() } catch { /* ignore */ }
    }
    if (!sameSrc) {
      // Downloaded ahead: the swap plays from memory, with no request at the boundary.
      setAudioSource(audio, elementSource(url))
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
    // A start that takes a while is silence: the lock screen says paused until sound comes ('playing').
    setTimeout(() => {
      if (requestIsCurrent(request) && playingRef.current && pendingRef.current && audio.src === expectedSrc && !audio.ended && !pageHidden()) publishPlaybackState(false)
    }, NARRATION_SILENT_START_MS)
    if (clip.kind === 'paragraph' && clip.narration) scheduleNarrationLookAhead()
    downloadAhead()
    void playReaderAudioTransition(
      audio,
      expectedSrc,
      () => requestIsCurrent(request) && playingRef.current,
    ).then(started => {
      if (!requestIsCurrent(request) || audio.src !== expectedSrc) return
      switchingRef.current = false
      setPending(false)
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
      audio.autoplay = false
      narrationAbortRef.current?.abort()
      narrationRetryRef.current = () => retryPlaybackRef.current()
      setNarrationState({ status: 'error', paragraphIndex: clip.kind === 'paragraph' ? clip.index : 0,
        message: narrationFailureMessage('playback'), reason: 'playback' })
    })
    return true
  }, [setPending, applyRate, downloadAhead, ensureAudio, enterPreparing, prepareThenRun, scheduleNarrationLookAhead, speed, syncFollow])
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
      pendingPlaceRef.current = { paragraphIndex, wordIndex }
      if (!andPlay) { playingRef.current = false; setPlaying(false); return true }
      void prepareThenRun(target, () => { playPlaceRef.current(clipsRef.current, place, andPlay, includeTitleAtChapterStart) })
      return true
    }
    pendingPlaceRef.current = null
    const words = clip?.kind === 'paragraph' ? clip.words : undefined
    const localIndex = clip?.kind === 'paragraph' && clip.chunk ? wordIndex - clip.chunk.wordFrom : wordIndex
    const clamped = words && words.length > 0
      ? Math.max(0, Math.min(localIndex, words.length - 1))
      : 0
    const offset = words?.[clamped]?.start ?? 0
    return playClip(index, offset, andPlay)
  }, [enterPreparing, ensureAudio, playClip, prepareThenRun])
  playPlaceRef.current = playPlace

  // --- Chapter boundary on a locked phone -------------------------------
  const playBridgeUrl = (audio: HTMLAudioElement, url: string) => {
    switchingRef.current = false
    holdRef.current = null
    audio.loop = false
    audio.autoplay = !isNativeCapacitor()
    setAudioSource(audio, elementSource(url))
    try { audio.currentTime = 0 } catch { /* ignore */ }
    applyRate(audio, speedRef.current)
    // Same element, synchronously from `ended`: the only start iOS allows
    // without a gesture while the screen is locked.
    void playReaderAudioTransition(audio, audio.src, () => bridgeRef.current != null && playingRef.current && !userPausedRef.current)
      .then((started) => { if (started) applyRate(audio, speedRef.current) })
  }
  startBridgeRef.current = (audio, bridge) => {
    bridgeRef.current = { chapterNumber: bridge.chapterNumber, urls: bridge.urls, position: 0, drained: false }
    playBridgeUrl(audio, bridge.urls[0])
  }
  advanceBridgeRef.current = (audio) => {
    const bridge = bridgeRef.current
    if (!bridge) return
    if (bridge.position + 1 < bridge.urls.length) {
      bridge.position += 1
      playBridgeUrl(audio, bridge.urls[bridge.position])
    } else {
      bridge.drained = true
    }
  }
  /**
   * The next chapter's clips have resolved while its opening already plays
   * on the element: take over that clip where it is (no pause, no rewind,
   * no second start). False hands the start back to the ordinary path.
   */
  adoptBridgeRef.current = (clips) => {
    const bridge = bridgeRef.current
    if (!bridge) return false
    bridgeRef.current = null
    const audio = audioRef.current
    if (!audio || !audio.src || bridge.chapterNumber !== audioChapter()) return false
    const urlOf = clipSourceUrl
    const index = clips.findIndex(clip => sourcePlaysClip(audio.src, urlOf(clip)))
    if (index < 0) return false
    const clip = clips[index]
    const listening = playingRef.current && !userPausedRef.current
    chapterHandoffRef.current = false
    pendingPlaceRef.current = null
    if (listening && audio.ended) {
      // The prepared opening ran out before the chapter arrived: go on from the clip after it.
      clipIndexRef.current = index
      if (index + 1 < clips.length) return playClipRef.current(index + 1, 0)
      setPending(false)
      chapterCompletedRef.current = true
      if (!optionsRef.current.onChapterComplete?.()) stop()
      return true
    }
    const time = audio.currentTime || 0
    clipIndexRef.current = index
    setClipIndex(index)
    setSrc(urlOf(clip))
    positionRef.current = { clipIndex: index, time }
    setPending(false)
    if (!listening) {
      // Paused during the handoff: the place is kept, nothing restarts.
      playingRef.current = false
      setPlaying(false)
      setCurrentTime(time)
      return true
    }
    // iOS refused the opening after all: start it the ordinary way, in place.
    if (audio.paused) return playClipRef.current(index, time)
    playingRef.current = true
    setPlaying(true)
    retryPlaybackRef.current = () => { playClipRef.current(index, time, true) }
    syncFollow(index, time)
    applyMetadataRef.current()
    if (clip.kind === 'paragraph' && clip.narration) scheduleNarrationLookAhead()
    downloadAhead()
    return true
  }

  // --- Silence holding the element on a hidden page ----------------------
  /**
   * Keep the element playing (looped silence) so a locked iPhone keeps the
   * audio session and the page running. Started synchronously from an event
   * on the element or a reader gesture. False when it cannot be used here.
   */
  startHoldRef.current = (audio) => {
    if (isNativeCapacitor() || holdBrokenRef.current) return false
    if (!holdRef.current) holdRef.current = { run: null, request: playRequestRef.current, notBefore: 0 }
    audio.loop = true
    if (!isHoldSource(audio)) {
      switchingRef.current = false
      setAudioSource(audio, holdSourceUrl())
    }
    audio.autoplay = true
    if (audio.paused || audio.ended) {
      let played: Promise<void>
      try { played = Promise.resolve(audio.play()) } catch (error) { played = Promise.reject(error) }
      played.catch(() => {
        // Refused: whatever waits on the hold starts on a timer instead.
        const hold = holdRef.current
        if (!hold?.run || !isHoldSource(audio) || !audio.paused) return
        setTimeout(() => runHoldRef.current(), Math.max(0, hold.notBefore - waitClockMs()))
      })
    }
    return true
  }
  /** From the hold's own events: start the clip waiting on it, if its moment has come. */
  runHoldRef.current = () => {
    const hold = holdRef.current
    if (!hold?.run || waitClockMs() < hold.notBefore) return
    const run = hold.run
    hold.run = null
    if (hold.request !== playRequestRef.current || !playingRef.current || userPausedRef.current) return
    inHoldEventRef.current = true
    try { run() } finally { inHoldEventRef.current = false }
  }
  /**
   * The playing recording failed to load (a car between cells). Load it again
   * from the same second, with back-off, holding the element with silence on
   * a hidden page, for up to NARRATION_HOLD_MAX_MS. False leaves the ordinary
   * visible error with Retry: a damaged file, a visible page's non-network
   * error, a reader who paused, or a budget used up.
   */
  reloadClipRef.current = (audio) => {
    if (!playingRef.current || userPausedRef.current || isNativeCapacitor()) return false
    const code = audio.error?.code
    // MEDIA_ERR_DECODE: the file itself is damaged; loading it again will not help.
    if (code === 3) return false
    // WebKit also reports a dropped load as MEDIA_ERR_SRC_NOT_SUPPORTED; hidden, nobody can tap Retry.
    if (code !== 2 && !pageHidden()) return false
    const index = clipIndexRef.current
    const clip = clipsRef.current[index]
    const url = clip?.kind === 'paragraph' ? clip.url : undefined
    if (!url) return false
    const now = waitClockMs()
    const prior = reloadRef.current?.url === url ? reloadRef.current : { url, attempts: 0, since: now }
    if (now - prior.since > NARRATION_HOLD_MAX_MS) { reloadRef.current = null; return false }
    reloadRef.current = { ...prior, attempts: prior.attempts + 1 }
    const live = Number.isFinite(audio.currentTime) ? audio.currentTime : 0
    const time = live > 0 ? live : positionRef.current.clipIndex === index ? positionRef.current.time : 0
    positionRef.current = { clipIndex: index, time }
    const delay = narrationReloadDelayMs(prior.attempts)
    const request = playRequestRef.current
    const run = () => { playClipRef.current(index, time, true) }
    if (pageHidden() && startHoldRef.current(audio)) {
      holdRef.current = { run, request, notBefore: now + delay }
    } else {
      setTimeout(() => {
        if (request === playRequestRef.current && playingRef.current && !userPausedRef.current) run()
      }, delay)
    }
    return true
  }

  // --- Interruptions (a call, Siri, a notification sound) ---------------
  endInterruptionRef.current = () => {
    const interruption = interruptionRef.current
    if (!interruption) return
    interruption.timers.forEach(timer => clearTimeout(timer))
    interruptionRef.current = null
  }
  beginInterruptionRef.current = (audio) => {
    if (!bridgeRef.current && !isHoldSource(audio)) positionRef.current = { clipIndex: clipIndexRef.current, time: audio.currentTime || 0 }
    systemPausedRef.current = true
    // Any start in flight is superseded; it must not report an error over this.
    playRequestRef.current += 1
    playingRef.current = false
    audio.autoplay = false
    setPending(false)
    setPlaying(false)
    if (interruptionRef.current) return
    const lastResume = lastAutoResumeRef.current
    if (lastResume != null && waitClockMs() - lastResume < INTERRUPTION_REPEAT_WINDOW_MS) return
    const timers = INTERRUPTION_RETRY_DELAYS_MS.map(delay => setTimeout(() => attemptResumeRef.current(), delay))
    // After the last retry the pause stands; one tap on Play resumes it.
    const last = INTERRUPTION_RETRY_DELAYS_MS[INTERRUPTION_RETRY_DELAYS_MS.length - 1]
    timers.push(setTimeout(() => endInterruptionRef.current(), last + 500))
    interruptionRef.current = { startedAt: waitClockMs(), timers }
  }
  attemptResumeRef.current = () => {
    if (!interruptionRef.current) return
    const audio = audioRef.current
    if (userPausedRef.current || !audio || !audio.src || playingRef.current) {
      if (userPausedRef.current || !audio?.src) endInterruptionRef.current()
      return
    }
    if (!audio.paused) {
      endInterruptionRef.current()
      playingRef.current = true
      setPlaying(true)
      return
    }
    const request = ++playRequestRef.current
    playingRef.current = true
    applyRate(audio, speedRef.current)
    let played: Promise<void>
    try { played = Promise.resolve(audio.play()) } catch (error) { played = Promise.reject(error) }
    played.then(() => {
      if (request !== playRequestRef.current || userPausedRef.current) return
      endInterruptionRef.current()
      lastAutoResumeRef.current = waitClockMs()
      applyRate(audio, speedRef.current)
      setPlaying(true)
      // Silence was holding a recording still to come: ask for it again.
      if (isHoldSource(audio)) { playClipRef.current(clipIndexRef.current, positionRef.current.time); return }
      syncFollow(clipIndexRef.current, audio.currentTime || 0)
      const current = clipsRef.current[clipIndexRef.current]
      if (current?.kind === 'paragraph' && current.narration) scheduleNarrationLookAhead()
    }, () => {
      // Still interrupted; the next retry (or the reader) tries again.
      if (request === playRequestRef.current) playingRef.current = false
    })
  }

  // --- Stalls: the element says it plays, but its clock stands still ------
  noteProgressRef.current = (audio) => {
    // The hold's looping silence is not the recording's clock: it never ends a stall.
    if (isHoldSource(audio)) return
    const progress = progressRef.current
    const time = audio.currentTime || 0
    const now = waitClockMs()
    // A reloaded recording already past the stalled second is sound again, even on its first tick.
    const resumed = audio.src !== progress.src && stallRef.current != null && time > stallRef.current.time + 0.05
    if (audio.src !== progress.src && !resumed) { progressRef.current = { src: audio.src, time, at: now }; return }
    if (resumed || time > progress.time + 0.05) {
      progressRef.current = { src: audio.src, time, at: now }
      if (stallRef.current) {
        // Sound again: the stall is over; the transport and lock screen say so.
        stallRef.current = null
        setBuffering(false)
        if (playingRef.current) publishPlaybackState(true)
      }
    } else if (time < progress.time - 0.5) {
      progressRef.current = { src: audio.src, time, at: now }
    }
  }
  /**
   * A locked iPhone refuses play() without a gesture once the element is
   * paused or idle, and it suspends timers: so on a hidden page a stall is
   * never paused out of. Silence takes the element over (same element, no
   * pause), its own events become the heartbeat that keeps the buffer
   * downloading, and the recording is swapped back in from one of those
   * events at the stalled second — from memory once the buffer's copy is
   * here (never a second wait on the network), else from the network after
   * NARRATION_HIDDEN_STREAM_AFTER_MS. Called from the watchdog and straight
   * from the element's own `waiting`/`stalled` (no timer needed). False: the
   * hold cannot be used here.
   */
  holdForStallRef.current = (audio) => {
    if (isNativeCapacitor() || holdBrokenRef.current || !playingRef.current || userPausedRef.current) return false
    if (isHoldSource(audio) || isUnlockSource(audio) || bridgeRef.current || !audio.src) return false
    const index = clipIndexRef.current
    const clip = clipsRef.current[index]
    if (!clip || waitingForNarration(clip, audio)) return false
    const now = waitClockMs()
    const live = Number.isFinite(audio.currentTime) ? audio.currentTime : 0
    let stall = stallRef.current
    if (!stall || stall.index !== index) {
      stall = { index, time: live > 0 ? live : positionRef.current.clipIndex === index ? positionRef.current.time : 0, attempts: 0, since: now, nextAt: now }
      stallRef.current = stall
      positionRef.current = { clipIndex: index, time: stall.time }
      setBufferingState(true)
    }
    stall.attempts += 1
    const at = { index, time: stall.time, request: playRequestRef.current, since: now }
    const run = () => {
      const url = clipSourceUrl(clipsRef.current[at.index] ?? clip)
      const copied = Boolean(url && clipBufferRef.current?.isReady(url))
      if (!copied && waitClockMs() - at.since < NARRATION_HIDDEN_STREAM_AFTER_MS) {
        // Not here yet: keep holding, look again at the hold's next event.
        if (holdRef.current) holdRef.current.run = run
        return
      }
      playClipRef.current(at.index, at.time, true, true)
    }
    if (!startHoldRef.current(audio)) return false
    holdRef.current = { run, request: at.request, notBefore: 0 }
    downloadAheadRef.current()
    return true
  }
  checkStallRef.current = () => {
    const audio = audioRef.current
    if (!audio || !playingRef.current || userPausedRef.current || primingRef.current) { stallRef.current = null; return }
    if (!audio.src || isUnlockSource(audio) || isHoldSource(audio) || bridgeRef.current || interruptionRef.current || audio.ended) return
    const index = clipIndexRef.current
    const clip = clipsRef.current[index]
    if (!clip || waitingForNarration(clip, audio)) return
    const now = waitClockMs()
    const progress = progressRef.current
    if (progress.src !== audio.src) { progressRef.current = { src: audio.src, time: audio.currentTime || 0, at: now }; return }
    // The element's own clock, read now: a busy page may run this check before the
    // `timeupdate` it owes, and a clock that moved is never a stall.
    noteProgressRef.current(audio)
    if (now - progressRef.current.at < NARRATION_STALL_MS) return
    let stall = stallRef.current
    if (!stall || stall.index !== index) {
      const live = Number.isFinite(audio.currentTime) ? audio.currentTime : 0
      stall = { index, time: live > 0 ? live : positionRef.current.clipIndex === index ? positionRef.current.time : 0, attempts: 0, since: now, nextAt: now }
      stallRef.current = stall
      positionRef.current = { clipIndex: index, time: stall.time }
      // Honest at once: the ring in the transport, and in front of the reader
      // paused on the lock screen. Hidden, the session stays 'playing': a
      // locked iPhone may suspend a page whose audio says paused, and the
      // recovery below keeps sound (silence) on the element meanwhile.
      clearTimeout(bufferingTimerRef.current)
      setBufferingState(true)
      if (!pageHidden()) publishPlaybackState(false)
    }
    // Bytes still arriving for a recording the element streams: a slow load, not a wedge. Wait it out.
    const loading = audio.networkState === 2 && now - dataAtRef.current < NARRATION_STALL_NO_DATA_MS
    if (loading) return
    const stalledUrl = clipSourceUrl(clip)
    const buffer = clipBufferRef.current
    // The buffer's copy of this recording just arrived: reload from memory now.
    const copyReady = Boolean(stalledUrl && buffer?.isReady(stalledUrl) && !audio.src.startsWith('blob:') && stall.attempts > 0)
    // The copy is arriving: wait for it rather than splitting the link with a second download.
    if (!copyReady && stalledUrl && stall.attempts > 0 && buffer?.isArriving(stalledUrl)) return
    if (!copyReady && now < stall.nextAt) return
    const hidden = pageHidden()
    if (!copyReady && !hidden && stall.attempts >= NARRATION_STALL_RETRY_MS.length) {
      // Out of tries in front of the reader: stop honestly, with Retry from the same second.
      const at = stall
      stallRef.current = null
      setBuffering(false)
      playRequestRef.current += 1
      playingRef.current = false
      audio.autoplay = false
      try { audio.pause() } catch { /* ignore */ }
      setPending(false)
      setPlaying(false)
      narrationRetryRef.current = () => { playClipRef.current(at.index, at.time, true, true) }
      setNarrationState({ status: 'error', paragraphIndex: clip.kind === 'paragraph' ? clip.index : 0, message: 'Audio stopped loading. Tap Retry to resume.', reason: 'stalled' })
      return
    }
    if (hidden && now - stall.since > NARRATION_HOLD_MAX_MS) return
    if (hidden && holdForStallRef.current(audio)) return
    const attempt = stall.attempts
    stall.attempts += 1
    const following = NARRATION_STALL_RETRY_MS[stall.attempts]
    stall.nextAt = now + (following != null ? following - NARRATION_STALL_RETRY_MS[attempt] : NARRATION_STALL_HIDDEN_RETRY_MS)
    applyRate(audio, speedRef.current)
    if (attempt === 0 && !copyReady) {
      // A nudge in place: some stalls only need the element asked again.
      try { if (!audio.paused) audio.currentTime = stall.time } catch { /* ignore */ }
      void Promise.resolve().then(() => audio.play()).catch(() => { /* the next attempt reloads */ })
      return
    }
    // Reload the recording from the stalled second: from its downloaded copy
    // once the buffer has it (asked for at once), else the network. A copy
    // that itself will not play is dropped for the network.
    const url = clipSourceUrl(clip)
    if (attempt >= 2 && url && audio.src.startsWith('blob:')) clipBufferRef.current?.forget(url)
    downloadAheadRef.current()
    playClipRef.current(index, stall.time, true, true)
    // Starting it again is not sound yet: the lock screen keeps saying paused until the clock moves.
    if (!pageHidden()) publishPlaybackState(false)
  }
  // The watchdog's own beat: a stalled element sends no timeupdate. It never
  // drives the follow paint, which stays on the element's clock.
  useEffect(() => {
    if (!playing) { stallRef.current = null; return }
    return repeatWhilePlaying(() => checkStallRef.current(), NARRATION_STALL_CHECK_MS)
  }, [playing])

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
      const audioParagraphs = narration.endingCue ? [...sourceParagraphs, narration.endingCue.text] : sourceParagraphs
      const hashes = await Promise.all(audioParagraphs.map(text => sha256Hex(narrationTextForParagraph(text))))
      if (!tupleMatches()) return []
      narrationHashesRef.current = new Map(hashes.map((hash, index) => [index, hash]))
      for (const [index, entry] of Array.from(narrationPreparedRef.current.entries())) {
        if (entry.textHash !== hashes[index]) narrationPreparedRef.current.delete(index)
      }
      paragraphsRef.current = sourceParagraphs.map((text, index) => ({ index, text }))
      applyPreparedNarration(narration.prepared?.() ?? [])
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
      // Streamed-only editions have no recorded manifest or sidecar to ask for.
      if (!chapterHasWordTimings(followed) && hasRecordedAudio(bookId, edition)) {
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

    if (!hasRecordedAudio(bookId, edition)) return []
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
  }, [commitFollowParagraphs, rebuildNarrationClips, applyPreparedNarration])

  const start = useCallback(async (place?: { paragraphIndex: number; wordIndex?: number }) => {
    if (optionsRef.current.playbackUnavailable || pendingRef.current) return false
    const request = ++playRequestRef.current
    endInterruptionRef.current()
    userPausedRef.current = false
    systemPausedRef.current = false
    lastAutoResumeRef.current = null
    setPending(true)
    narrationRetryRef.current = null
    setNarrationState({ status: 'idle' })
    retryPlaybackRef.current = () => { void start(place) }
    try {
      const clips = await resolveClips()
      if (request !== playRequestRef.current) return false
      if (clips.length === 0) throw new Error('No audio available')
      if (adoptBridgeRef.current(clips)) return true
      return playPlace(clips, place, true, true)
    } catch {
      if (request !== playRequestRef.current) return false
      setPending(false)
      playingRef.current = false
      setPlaying(false)
      narrationRetryRef.current = () => retryPlaybackRef.current()
      setNarrationState({ status: 'error', paragraphIndex: place?.paragraphIndex ?? 0,
        message: 'Audio could not start. Try again.', reason: 'network' })
      return false
    }
  }, [playPlace, resolveClips, setPending])

  const startAtPlace = useCallback(async (place: { paragraphIndex: number; wordIndex?: number }) => {
    if (optionsRef.current.playbackUnavailable) return false
    const request = ++playRequestRef.current
    endInterruptionRef.current()
    userPausedRef.current = false
    systemPausedRef.current = false
    lastAutoResumeRef.current = null
    setPending(true)
    narrationRetryRef.current = null
    setNarrationState({ status: 'idle' })
    retryPlaybackRef.current = () => { void startAtPlace(place) }
    try {
      const clips = await resolveClips()
      if (request !== playRequestRef.current) return false
      if (clips.length === 0) throw new Error('No audio available')
      if (adoptBridgeRef.current(clips)) return true
      return playPlace(clips, place, true, false)
    } catch {
      if (request !== playRequestRef.current) return false
      setPending(false)
      playingRef.current = false
      setPlaying(false)
      narrationRetryRef.current = () => retryPlaybackRef.current()
      setNarrationState({ status: 'error', paragraphIndex: place?.paragraphIndex ?? 0,
        message: 'Audio could not start. Try again.', reason: 'network' })
      return false
    }
  }, [playPlace, resolveClips, setPending])

  const seekToPlace = useCallback((paragraphIndex: number, wordIndex: number) => {
    const clips = clipsRef.current
    if (clips.length === 0) return
    const andPlay = playingRef.current
    playPlace(clips, { paragraphIndex, wordIndex }, andPlay, false)
    // Paused: the chosen word is the place Play resumes from, so it is also
    // the word painted as the paused listening place.
    if (!andPlay) setFollow({ kind: 'word', paragraphIndex, wordIndex })
  }, [playPlace])

  const pause = useCallback(() => {
    // A deliberate pause (in-app, lock screen, AirPods, Talk): never auto-resumed.
    userPausedRef.current = true
    systemPausedRef.current = false
    endInterruptionRef.current()
    if (holdRef.current) holdRef.current.run = null
    const paused = audioRef.current
    const current = clipsRef.current[clipIndexRef.current]
    if (paused?.src && !bridgeRef.current && !isUnlockSource(paused) && !waitingForNarration(current, paused) && Number.isFinite(paused.currentTime)) {
      positionRef.current = { clipIndex: clipIndexRef.current, time: paused.currentTime || 0 }
    }
    setPending(false)
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
  }, [setPending])

  /** The word the listening position is on: a place still being prepared, or the current clip at its clock. */
  const currentListenPlace = (): { paragraphIndex: number; wordIndex: number } | null => {
    const pendingPlace = pendingPlaceRef.current
    if (pendingPlace) return { paragraphIndex: pendingPlace.paragraphIndex ?? 0, wordIndex: pendingPlace.wordIndex ?? 0 }
    const clip = clipsRef.current[clipIndexRef.current]
    if (!clip || clip.kind !== 'paragraph') return null
    const audio = audioRef.current
    const loaded = Boolean(audio?.src && clip.url && sourcePlaysClip(audio.src, clip.url))
    const time = loaded ? playbackTimeSeconds(audio!.currentTime || 0, positionRef.current.time) : positionRef.current.time
    const base = clip.chunk?.wordFrom ?? 0
    const words = clip.words
    if (!words?.length) return { paragraphIndex: clip.index, wordIndex: base }
    let index = 0
    while (index + 1 < words.length && words[index + 1].start <= time) index++
    return { paragraphIndex: clip.index, wordIndex: base + index }
  }

  const resume = useCallback((fromSentenceStart = false) => {
    if (optionsRef.current.playbackUnavailable || pendingRef.current) return false
    endInterruptionRef.current()
    userPausedRef.current = false
    systemPausedRef.current = false
    lastAutoResumeRef.current = null
    const request = ++playRequestRef.current
    const audio = audioRef.current
    const current = clipsRef.current[clipIndexRef.current]
    const reenter = Boolean(pendingPlaceRef.current || (audio && isHoldSource(audio)) || (current?.kind === 'paragraph' && current.narration && (!audio?.src || !current.url || !sourcePlaysClip(audio.src, current.url))))
    if (fromSentenceStart && reenter) {
      // A recording that is not on the element yet: resume through the place,
      // from the start of the sentence that holds it.
      const place = currentListenPlace()
      if (place) {
        const text = narrationParagraphs().find(paragraph => paragraph.index === place.paragraphIndex)?.text
          ?? optionsRef.current.paragraphs[place.paragraphIndex] ?? ''
        const wordIndex = listeningSentenceStart(tokenizeHearingWords(text), place.wordIndex)
        pendingPlaceRef.current = null
        playPlaceRef.current(clipsRef.current, { paragraphIndex: place.paragraphIndex, wordIndex }, true)
        return
      }
    }
    if (pendingPlaceRef.current) {
      playPlaceRef.current(clipsRef.current, pendingPlaceRef.current, true)
      return
    }
    // Narration: the current clip may still need preparing, or its recording
    // arrived while paused and the element still holds the previous chunk;
    // either way re-enter through playClip rather than replaying the element.
    if (reenter) {
      playClip(clipIndexRef.current, positionRef.current.time)
      return
    }
    if (!audio?.src || isUnlockSource(audio)) {
      // The element lost its media while paused (WebKit can drop it while
      // suspended): load the same clip at the same time, synchronously, so a
      // lock-screen Play still counts as the gesture that starts it.
      if (current) { playClip(clipIndexRef.current, positionRef.current.time); return }
      void start()
      return
    }
    if (fromSentenceStart) {
      const clip = clipsRef.current[clipIndexRef.current]
      const words = clip?.kind === 'paragraph' ? clip.words : undefined
      if (words?.length) {
        let index = 0
        while (index + 1 < words.length && words[index + 1].start <= audio.currentTime) index++
        const start = words[listeningSentenceStart(words, index)].start
        audio.currentTime = start
        positionRef.current = { clipIndex: clipIndexRef.current, time: start }
      } else {
        // Without verified word timings, the current paragraph is the safe boundary.
        audio.currentTime = 0
        positionRef.current = { clipIndex: clipIndexRef.current, time: 0 }
      }
    }
    setPending(true)
    narrationRetryRef.current = null
    setNarrationState({ status: 'idle' })
    retryPlaybackRef.current = () => { playClipRef.current(clipIndexRef.current, positionRef.current.time) }
    playingRef.current = true
    applyRate(audio, speed)
    const played = playReaderAudio(audio, () => requestIsCurrent(request) && playingRef.current)
    publishPlaybackState(true)
    played.then(() => {
      if (!requestIsCurrent(request)) return
      setPending(false)
      applyRate(audio, speed)
      playingRef.current = true
      setPlaying(true)
      syncFollow(clipIndexRef.current, audio.currentTime || 0)
    }).catch(() => {
      if (!requestIsCurrent(request)) return
      setPending(false)
      narrationRetryRef.current = () => retryPlaybackRef.current()
      setNarrationState({ status: 'error', paragraphIndex: 0, message: narrationFailureMessage('playback'), reason: 'playback' })
      playingRef.current = false
      setPlaying(false)
    })
  }, [applyRate, playClip, setPending, speed, start, syncFollow])

  /**
   * Lock-screen / Control Center / AirPods Play. iOS counts the action as the
   * gesture only while it runs, so play() happens inside it, synchronously.
   * A pending flag left by a start that iOS froze (the element loaded and
   * paused) must not swallow the tap.
   */
  const playFromMediaSession = useCallback(() => {
    const audio = audioRef.current
    const current = clipsRef.current[clipIndexRef.current]
    if (pendingRef.current && audio?.src && audio.paused && !audio.ended && !isUnlockSource(audio) && (isHoldSource(audio) || !waitingForNarration(current, audio))) {
      setPending(false)
    }
    resume()
  }, [resume, setPending])

  const stop = useCallback(() => {
    userPausedRef.current = true
    systemPausedRef.current = false
    endInterruptionRef.current()
    bridgeRef.current = null
    setPending(false)
    pendingPlaceRef.current = null
    chapterHandoffRef.current = false
    playRequestRef.current += 1
    narrationRequestRef.current += 1
    // Stop ends look-ahead too; prepared recordings for this tuple are kept.
    narrationAbortRef.current?.abort()
    narrationAbortRef.current = null
    setNarrationState(current => (current.status === 'loading' ? { status: 'idle' } : current))
    const audio = audioRef.current
    holdRef.current = null
    reloadRef.current = null
    if (audio) {
      audio.loop = false
      audio.pause()
      audio.autoplay = false
      audio.removeAttribute('src')
    }
    // Stopped: nothing ahead will play from memory; free it.
    clipBufferRef.current?.clear()
    clipIndexRef.current = 0
    setClipIndex(0)
    setCurrentTime(0)
    playingRef.current = false
    setPlaying(false)
    setFollow({ kind: 'none' })
    setSrc(null)
    endNativeNarration()
  }, [setPending])

  /** Preserve native media-session ownership while React loads the next chapter. */
  const handoffChapter = useCallback(() => {
    playRequestRef.current += 1
    narrationRequestRef.current += 1
    narrationAbortRef.current?.abort()
    narrationAbortRef.current = null
    chapterHandoffRef.current = true
    userPausedRef.current = false
    systemPausedRef.current = false
    endInterruptionRef.current()
    const audio = audioRef.current
    if (audio) audio.autoplay = !isNativeCapacitor()
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
    const text = narrationParagraphs().find(paragraph => paragraph.index === clip.index)?.text || ''
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
        const paragraph = narrationParagraphs().find(item => item.index === clip.index)
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

  applyMetadataRef.current = () => {
    const session = readerMediaSession()
    if (!session) return
    try {
      // iOS shows title and artist, not album: lead with the chapter.
      const book = options.bookTitle || options.bookId || 'Tinct audiobook'
      session.metadata = readerMediaMetadata({
        title: options.chapterTitle || `Chapter ${options.chapterNumber ?? 1}`,
        // The lock screen's second line names the voice as synthetic (AI Act art. 50).
        artist: `${book} · ${LAB_COPY.aiNarration}`,
        album: book,
        ...(options.coverSrc ? { artwork: [{ src: new URL(options.coverSrc, window.location.href).href, sizes: '540x810', type: 'image/webp' }] } : {}),
      })
    } catch { /* incomplete metadata */ }
  }
  useEffect(() => {
    const session = readerMediaSession()
    if (!session) return
    applyMetadataRef.current()
    try {
      session.setActionHandler('play', () => playFromMediaSession())
      session.setActionHandler('pause', pause)
      session.setActionHandler('seekbackward', details => seek(-(details.seekOffset || 15)))
      session.setActionHandler('seekforward', details => seek(details.seekOffset || 30))
      session.setActionHandler('seekto', details => { if (typeof details.seekTime === 'number') seekChapter(details.seekTime) })
    } catch { /* unsupported action or incomplete metadata */ }
    return () => {
      try { session.setActionHandler('play', null); session.setActionHandler('pause', null); session.setActionHandler('seekbackward', null); session.setActionHandler('seekforward', null); session.setActionHandler('seekto', null) } catch { /* unsupported */ }
    }
  }, [options.bookId, options.bookTitle, options.chapterNumber, options.chapterTitle, options.coverSrc, pause, playFromMediaSession, seek, seekChapter])

  // When the page comes back (unlock, app switch, bfcache), the player says
  // what the element is doing, whatever events a suspended page missed.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const reconcile = () => {
      const audio = audioRef.current
      if (!audio || primingRef.current || isUnlockSource(audio) || typeof audio.paused !== 'boolean') return
      if (interruptionRef.current) { attemptResumeRef.current(); return }
      if (playingRef.current && audio.paused && !audio.ended && audio.src
        && !pendingRef.current && !switchingRef.current && !bridgeRef.current) {
        playRequestRef.current += 1
        playingRef.current = false
        audio.autoplay = false
        setPlaying(false)
      } else if (!playingRef.current && !audio.paused && audio.src && !pendingRef.current) {
        userPausedRef.current = false
        systemPausedRef.current = false
        playingRef.current = true
        setPlaying(true)
      }
    }
    const onHidden = () => {
      const audio = audioRef.current
      if (!audio || !playingRef.current || userPausedRef.current || primingRef.current) return
      const current = clipsRef.current[clipIndexRef.current]
      // Locked while a recording is still being prepared: hold the element
      // now, while iOS still lets it play, rather than leave it idle.
      if (current?.kind === 'paragraph' && current.narration && waitingForNarration(current, audio) && !isHoldSource(audio) && !bridgeRef.current) {
        startHoldRef.current(audio)
      }
      // The look-ahead reaches further while hidden; extend it now.
      if (current?.kind === 'paragraph' && current.narration) scheduleNarrationLookAhead()
      // So does the download window, while the page can still fetch freely.
      downloadAheadRef.current()
    }
    const onVisibility = () => { if (document.visibilityState !== 'hidden') reconcile(); else onHidden() }
    // An output change (headphones out) is not an interruption to resume from.
    const onDeviceChange = () => endInterruptionRef.current()
    const devices = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', reconcile)
    window.addEventListener('focus', reconcile)
    devices?.addEventListener?.('devicechange', onDeviceChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', reconcile)
      window.removeEventListener('focus', reconcile)
      devices?.removeEventListener?.('devicechange', onDeviceChange)
      endInterruptionRef.current()
    }
  }, [scheduleNarrationLookAhead, setPlaying])

  useEffect(() => {
    const session = readerMediaSession()
    if (!session) return
    try { session.playbackState = playing ? 'playing' : 'paused' } catch { /* unsupported */ }
  }, [playing])

  // Each sentence group swaps the element's source, and a locked phone runs no
  // animation frames to re-render. Publish the chapter clock from the native
  // media events too, so the lock screen never falls back to the group's own.
  publishPositionRef.current = () => {
    const session = readerMediaSession()
    if (!session || bridgeRef.current) return
    const audio = audioRef.current
    let elapsed = 0
    let duration = 0
    clipsRef.current.forEach((clip, index) => {
      const clipDuration = estimatedClipDuration(clip)
      if (index < clipIndexRef.current) elapsed += clipDuration
      else if (index === clipIndexRef.current) {
        const live = audio && !waitingForNarration(clip, audio) ? audio.currentTime || 0 : positionRef.current.time
        elapsed += Math.max(0, Math.min(live, clipDuration))
      }
      duration += clipDuration
    })
    if (duration <= 0) return
    try {
      session.setPositionState({
        duration: Math.max(0.001, duration),
        playbackRate: audio?.playbackRate || speed,
        position: Math.max(0, Math.min(elapsed, Math.max(0, duration - 0.001))),
      })
    } catch { /* unsupported or incomplete metadata */ }
  }

  useEffect(() => {
    if (chapterTimeline.duration > 0) publishPositionRef.current()
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
  const visibleFollow = clips[clipIndex]?.kind === 'title' || (clips[clipIndex]?.kind === 'paragraph' && (clips[clipIndex] as Extract<LabAudioClip, { kind: 'paragraph' }>).announcement)
    ? { kind: 'none' as const }
    : follow

  return {
    pending,
    loading,
    /** Playing, but waiting for audio mid-recording: show the loading ring, keep Pause. */
    buffering: buffering && playing && !pending,
    isPending: () => pendingRef.current,
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
    unlockPlayback,
    seek,
    seekChapter,
    cycleSpeed,
    setSpeed,
  }
}
