/**
 * The phone call surface's state, derived from observed session facts only.
 *
 * Two inputs are kept apart on purpose, because conflating them is how a
 * dropped call goes on looking like a live one:
 *
 * - `connection` is transport truth (WebRTC / data channel / explicit end).
 * - `activity` is what the microphone and the assistant are doing.
 *
 * Nothing here reads a clock. A view is a pure function of the last events
 * the session reported, so a call that lost its transport can only ever
 * render "Disconnected", whatever the activity field still says.
 */

import type { LabConversationState } from './labAsk'
import type { VoiceConnectionState } from '../voice/VoiceSessionController'

export type LabCallStatus =
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'muted'
  | 'disconnected'

/** How the circle moves. `pulse` follows real assistant audio, never a timer. */
export type LabCallMotion = 'breathe' | 'rotate' | 'pulse' | 'still'

export const LAB_CALL_COPY = {
  connecting: 'Connecting.',
  listening: 'Listening.',
  thinking: 'Thinking.',
  speaking: 'Speaking.',
  micOff: 'Microphone off',
  disconnected: 'Disconnected',
  disconnectedHelp: 'The conversation lost its connection. Nothing is being heard.',
  connectionConnected: 'Connected',
  connectionConnecting: 'Connecting',
  connectionLost: 'Not connected',
  connectionLabel: 'Connection',
  /** The exact control label the owner specified. Do not paraphrase. */
  transcript: 'See transcript in real time.',
  end: 'End conversation',
  mute: 'Mute',
  unmute: 'Unmute',
  reconnect: 'Reconnect',
  backToCall: 'Back to the conversation',
  callLabel: 'Voice conversation',
} as const

export interface LabCallInput {
  /** Transport truth from the voice session. */
  connection: VoiceConnectionState
  /** Microphone / assistant activity, already derived from session events. */
  activity: LabConversationState
  micMuted: boolean
}

export interface LabCallView {
  status: LabCallStatus
  /** The large explicit line under the circle. */
  statusText: string
  /** Connection status, always shown apart from the activity line. */
  connectionText: string
  connected: boolean
  motion: LabCallMotion
  /** A broken ring rather than a closed circle. */
  broken: boolean
  /** The microphone is closed; show it even while the assistant speaks. */
  micOff: boolean
  showReconnect: boolean
}

function activityStatus(activity: LabConversationState): LabCallStatus {
  switch (activity) {
    case 'listening':
      return 'listening'
    case 'speaking':
      return 'speaking'
    case 'thinking':
    case 'checking':
    case 'preparing':
      return 'thinking'
    default:
      // 'connecting' and 'idle'. Never guess "listening" from an unknown phase.
      return 'connecting'
  }
}

const STATUS_TEXT: Record<LabCallStatus, string> = {
  connecting: LAB_CALL_COPY.connecting,
  listening: LAB_CALL_COPY.listening,
  thinking: LAB_CALL_COPY.thinking,
  speaking: LAB_CALL_COPY.speaking,
  muted: LAB_CALL_COPY.micOff,
  disconnected: LAB_CALL_COPY.disconnected,
}

const MOTION: Record<LabCallStatus, LabCallMotion> = {
  connecting: 'rotate',
  listening: 'breathe',
  thinking: 'rotate',
  speaking: 'pulse',
  // A muted circle must not breathe: breathing is what listening looks like.
  muted: 'still',
  disconnected: 'still',
}

export function labCallView(input: LabCallInput): LabCallView {
  const connected = input.connection === 'connected'
  const connectionText = connected
    ? LAB_CALL_COPY.connectionConnected
    : input.connection === 'connecting'
      ? LAB_CALL_COPY.connectionConnecting
      : LAB_CALL_COPY.connectionLost

  // Transport first. Nothing about microphone or assistant activity can make a
  // call without a connection look live. `idle` means there is no session at
  // all, which — on a surface the reader opened to have a call — is exactly as
  // disconnected as a dropped one.
  if (input.connection === 'disconnected' || input.connection === 'idle') {
    return {
      status: 'disconnected',
      statusText: STATUS_TEXT.disconnected,
      connectionText,
      connected: false,
      motion: 'still',
      broken: true,
      micOff: input.micMuted,
      showReconnect: true,
    }
  }

  if (!connected) {
    return {
      status: 'connecting',
      statusText: STATUS_TEXT.connecting,
      connectionText,
      connected: false,
      motion: 'rotate',
      broken: true,
      micOff: input.micMuted,
      showReconnect: false,
    }
  }

  const activity = activityStatus(input.activity)
  // Muting closes the microphone; it does not stop the assistant. While she
  // speaks the circle keeps following her voice and the closed microphone is
  // carried alongside it.
  const status: LabCallStatus = input.micMuted && activity !== 'speaking' ? 'muted' : activity
  return {
    status,
    statusText: STATUS_TEXT[status],
    connectionText,
    connected: true,
    motion: MOTION[status],
    broken: status === 'thinking' || status === 'connecting',
    micOff: input.micMuted,
    showReconnect: false,
  }
}

/** Sounds the call may announce itself with. */
export type LabCallCue = 'ready' | 'dropped'

/**
 * A cue is owed only on a real change of footing: the first moment the
 * microphone is live and listening, and an unexpected drop of a call that had
 * connected. A start that never connected is a failed start, not a drop.
 */
export function labCallCue(previous: LabCallView | null, next: LabCallView): LabCallCue | null {
  if (!previous) return null
  if (next.status === 'disconnected' && previous.status !== 'disconnected') {
    return previous.connected ? 'dropped' : null
  }
  if (
    next.status === 'listening'
    && (previous.status === 'connecting' || previous.status === 'disconnected')
  ) {
    return 'ready'
  }
  return null
}

/**
 * Where the reader was when the dialogue began. Captured on open, restored
 * when the call ends, so a call that moved the reader around gives the place
 * back. `bookId` travels with it: a restore is never applied across books.
 */
export interface LabCallAnchor {
  bookId: string
  chapterNumber: number
  pageIndex: number
  paragraphIndex: number
  wordIndex: number
}

export type LabCallRestore =
  | { kind: 'none' }
  | { kind: 'page'; pageIndex: number; paragraphIndex: number; wordIndex: number }
  | {
      kind: 'chapter'
      chapterNumber: number
      pageIndex: number
      paragraphIndex: number
      wordIndex: number
    }

export function labCallRestore(
  anchor: LabCallAnchor | null | undefined,
  current: { bookId: string; chapterNumber: number; pageIndex: number },
): LabCallRestore {
  if (!anchor) return { kind: 'none' }
  // A different book means the anchor belongs to somebody else's tuple. Never
  // write it back.
  if (anchor.bookId !== current.bookId) return { kind: 'none' }
  if (anchor.chapterNumber !== current.chapterNumber) {
    return {
      kind: 'chapter',
      chapterNumber: anchor.chapterNumber,
      pageIndex: anchor.pageIndex,
      paragraphIndex: anchor.paragraphIndex,
      wordIndex: anchor.wordIndex,
    }
  }
  if (anchor.pageIndex !== current.pageIndex) {
    return {
      kind: 'page',
      pageIndex: anchor.pageIndex,
      paragraphIndex: anchor.paragraphIndex,
      wordIndex: anchor.wordIndex,
    }
  }
  return { kind: 'none' }
}
