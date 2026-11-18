import { acquireBrowserAudioSession } from '../utils/browserAudioSession'
import { LAB_AUDIO_CONSTRAINTS } from './types'

/**
 * Talk's microphone request, made in the reader's tap.
 *
 * WebKit marks a getUserMedia call as gesture-privileged only while the tap's
 * user gesture is still being processed (MediaDevices::computeUserGesturePriviledge
 * reads UserGestureIndicator). A request made after a network await (the lazily
 * loaded Talk code on a first tap, a Supabase session refresh) is not, and
 * Safari then auto-denies it without a prompt once a request on the page was
 * denied, and will not reuse an older grant after capture has been idle. So
 * the request starts here, synchronously, and the session awaits its result.
 *
 * This file stays small and outside the lazily loaded voice chunk on purpose.
 */

export const VOICE_MICROPHONE_TIMEOUT_MS = 30_000

export type MicrophoneFailure = 'denied' | 'missing' | 'busy' | 'constraints' | 'audio_session' | 'timeout' | 'unavailable' | 'unknown'

/** One line each: what happened and the next step. Shown on the device only. */
export const MICROPHONE_MESSAGES: Record<MicrophoneFailure, string> = {
  denied: 'Microphone access is blocked. Allow the microphone for this site in your browser settings, then tap Talk again.',
  missing: 'No microphone was found. Connect one, then tap Talk again.',
  busy: 'The microphone is in use by another app or call. Close it, then tap Talk again.',
  // WebKit also answers OverconstrainedError ("Invalid constraint") when there is no microphone at all.
  constraints: 'No microphone could start for Talk. Check that one is connected and enabled, then tap Talk again.',
  audio_session: 'Audio is busy on this device. Stop other audio, then tap Talk again.',
  timeout: "Microphone did not become ready. Answer the browser's microphone prompt, then tap Talk again.",
  unavailable: "Couldn't start voice. Microphone access is unavailable. Type a question instead.",
  unknown: 'The microphone could not start. Tap Talk again, or type your question.',
}

/**
 * Why the microphone step failed, as a fixed code for `talk_failed.reason`:
 * the browser's error name from a closed list, or what Tinct saw. Never text.
 */
export type MicrophoneFailureReason =
  | 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' | 'OverconstrainedError' | 'AbortError'
  | 'SecurityError' | 'InvalidStateError' | 'TypeError' | 'timeout' | 'cancelled' | 'unavailable' | 'other'

const REPORTED_ERROR_NAMES = new Set<string>(['NotAllowedError', 'NotFoundError', 'NotReadableError', 'OverconstrainedError', 'AbortError', 'SecurityError', 'InvalidStateError', 'TypeError'])

export function microphoneFailureReason(error: unknown): MicrophoneFailureReason {
  if (error instanceof MicrophoneRequestError) {
    if (error.failure === 'timeout') return 'timeout'
    if (error.failure === 'unavailable') return 'unavailable'
    return error.errorName && REPORTED_ERROR_NAMES.has(error.errorName) ? error.errorName as MicrophoneFailureReason : 'other'
  }
  if (error instanceof MicrophoneCancelledError) return 'cancelled'
  return 'other'
}

/** The start ended (the reader closed Talk) before the microphone answered. */
export class MicrophoneCancelledError extends Error {
  constructor() { super('Voice setup cancelled.'); this.name = 'MicrophoneCancelledError' }
}

export class MicrophoneRequestError extends Error {
  constructor(readonly failure: MicrophoneFailure, readonly errorName?: string) {
    super(MICROPHONE_MESSAGES[failure])
    this.name = 'MicrophoneRequestError'
  }
}

/** getUserMedia's DOMException names, mapped to the reader's next step. */
export function microphoneFailureFor(error: unknown): MicrophoneFailure {
  const name = error && typeof error === 'object' && typeof (error as { name?: unknown }).name === 'string' ? (error as { name: string }).name : ''
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'denied'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'missing'
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'busy'
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'constraints'
    // WebKit rejects capture while the page's audio session category is not
    // play-and-record (MediaDevices.cpp, categoryOverride check).
    case 'InvalidStateError':
      return 'audio_session'
    default:
      return 'unknown'
  }
}

export interface PendingMicrophone {
  /** Resolves with the stream, or rejects with a MicrophoneRequestError (or a cancellation). */
  readonly stream: Promise<MediaStream>
  /** Ends the request: a stream that arrives later is stopped, the audio session is let go. Idempotent. */
  cancel: () => void
  /** Lets go of the play-and-record audio session this request holds. Idempotent. */
  releaseAudioSession: () => void
  /** True once the browser answered, the request timed out or it was cancelled. */
  readonly settled: boolean
}

export function microphoneSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function'
}

/**
 * Ask for the microphone now. Call it synchronously inside the reader's tap.
 * The audio session is set to play-and-record first: WebKit refuses audio
 * capture while a page's category override is anything else (narration sets
 * 'playback'), so it must not wait for the grant.
 */
export function requestTalkMicrophone(timeoutMs = VOICE_MICROPHONE_TIMEOUT_MS): PendingMicrophone {
  if (!microphoneSupported()) {
    const stream = Promise.reject(new MicrophoneRequestError('unavailable'))
    stream.catch(() => {})
    return { stream, cancel: () => {}, releaseAudioSession: () => {}, settled: true }
  }
  const releaseAudioSession = acquireBrowserAudioSession('play-and-record')
  let settled = false
  let cancelled = false
  let granted: MediaStream | null = null
  let resolveStream!: (stream: MediaStream) => void
  let rejectStream!: (error: Error) => void
  const stream = new Promise<MediaStream>((resolve, reject) => { resolveStream = resolve; rejectStream = reject })
  // A request nobody ends up awaiting must not surface as an unhandled rejection.
  stream.catch(() => {})
  const stopTracks = (media: MediaStream | undefined | null) => media?.getTracks().forEach(track => track.stop())
  const finish = (error?: Error, media?: MediaStream) => {
    if (settled) { stopTracks(media); return }
    settled = true
    clearTimeout(timer)
    if (error) { releaseAudioSession(); rejectStream(error) }
    else { granted = media!; resolveStream(media!) }
  }
  const timer = setTimeout(() => finish(new MicrophoneRequestError('timeout')), timeoutMs)
  try {
    navigator.mediaDevices.getUserMedia({ audio: { ...LAB_AUDIO_CONSTRAINTS } })
      .then(media => finish(undefined, media), error => finish(new MicrophoneRequestError(microphoneFailureFor(error), (error as { name?: string })?.name)))
  } catch (error) {
    finish(new MicrophoneRequestError(microphoneFailureFor(error), (error as { name?: string })?.name))
  }
  return {
    stream,
    releaseAudioSession,
    get settled() { return settled },
    cancel: () => {
      if (cancelled) return
      cancelled = true
      finish(new MicrophoneCancelledError())
      stopTracks(granted)
      granted = null
      releaseAudioSession()
    },
  }
}
