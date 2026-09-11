import { useEffect, useRef } from 'react'
import {
  LAB_CALL_COPY,
  labCallCaption,
  labCallCue,
  type LabCallCue,
  type LabCallView,
} from './labVoiceCall'
import {
  VoiceControl,
  VoiceEndIcon,
  VoiceMicIcon,
  VoiceReconnectIcon,
  VoiceTranscriptIcon,
} from './LabVoiceIcons'
import { VoiceOrb } from './VoiceOrb'

/**
 * The phone call surface (locked 2026-09-11): the book line and connection
 * at the top, the dotted orb and one large status word in the middle with an
 * optional italic caption, and three round icon buttons at the bottom.
 *
 * Every indicator here is driven by the view it is handed, and that view is a
 * pure function of session events. The one thing this surface reads for
 * itself is the assistant's real loudness while she speaks, and only through
 * `getAssistantLevel`, which returns null rather than inventing a number.
 */

interface LabVoiceCallProps {
  view: LabCallView
  /** Real assistant loudness, 0-1, or null when the audio path exposes none. */
  getAssistantLevel?: () => number | null
  reducedMotion?: boolean
  notice?: string | null
  /** "The Odyssey, Book IX": the book and chapter the conversation is about. */
  bookLine?: string
  /** The newest thing the assistant said, for the caption while she speaks. */
  utterance?: string | null
  onMuteToggle: () => void
  onTranscript: () => void
  onEnd: () => void
  onReconnect: () => void
}

/** Two short tones, made in the browser: nothing to fetch, nothing to cache. */
function playCallCue(cue: LabCallCue) {
  if (typeof window === 'undefined') return
  const Ctor = (window as Window & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
    ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return
  try {
    const ctx = new Ctor()
    const now = ctx.currentTime
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.connect(gain)
    if (cue === 'ready') {
      // A quiet rising sixth: the microphone is open.
      osc.frequency.setValueAtTime(587.33, now)
      osc.frequency.setValueAtTime(880, now + 0.09)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
      osc.start(now)
      osc.stop(now + 0.32)
    } else {
      // A falling pair, deliberately unlike the readiness tone: the call dropped.
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.setValueAtTime(233.08, now + 0.14)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
      osc.start(now)
      osc.stop(now + 0.52)
    }
    osc.onended = () => { try { void ctx.close() } catch { /* ignore */ } }
  } catch { /* a browser that refuses the tone still shows the state */ }
}

export const LAB_CALL_ORB_PX = 280

export function LabVoiceCall({
  view,
  getAssistantLevel,
  reducedMotion = false,
  notice,
  bookLine,
  utterance = null,
  onMuteToggle,
  onTranscript,
  onEnd,
  onReconnect,
}: LabVoiceCallProps) {
  const previousRef = useRef<LabCallView | null>(null)
  useEffect(() => {
    const cue = labCallCue(previousRef.current, view)
    previousRef.current = view
    if (cue) playCallCue(cue)
  }, [view])

  const motion = reducedMotion ? 'still' : view.motion
  const caption = labCallCaption(view, utterance)
  return (
    <div
      className={`lab-call is-${view.status}`}
      data-testid="lab-call"
      data-status={view.status}
      data-connection={view.connected ? 'connected' : view.showReconnect ? 'lost' : 'connecting'}
      role="dialog"
      aria-label={LAB_CALL_COPY.callLabel}
    >
      <div className="lab-call-top">
        {bookLine && <span className="lab-call-book" data-testid="lab-call-book">{bookLine}</span>}
        <p className="lab-call-connection" data-testid="lab-call-connection">
          <span className="lab-call-connection-dot" aria-hidden="true" />
          <span className="lab-call-connection-value">{view.connectionText}</span>
        </p>
      </div>

      <div className="lab-call-stage">
        <VoiceOrb
          status={view.status}
          motion={motion}
          broken={view.broken}
          getAssistantLevel={getAssistantLevel}
          reducedMotion={reducedMotion}
          size={LAB_CALL_ORB_PX}
          className="lab-call-circle"
        />
        <div className="lab-call-words">
          <p className="lab-call-status" data-testid="lab-call-status" aria-live="polite">
            {view.statusText}
          </p>
          {caption && <p className="lab-call-caption" data-testid="lab-call-caption">{caption}</p>}
          {view.micOff && view.status !== 'muted' && (
            <p className="lab-call-micoff" data-testid="lab-call-micoff">{LAB_CALL_COPY.micOff}</p>
          )}
          {view.status === 'disconnected' && (
            <p className="lab-call-help" data-testid="lab-call-help">{LAB_CALL_COPY.disconnectedHelp}</p>
          )}
          {notice && <p className="lab-call-notice" data-testid="lab-call-notice">{notice}</p>}
        </div>
      </div>

      <div className="lab-call-controls">
        {view.showReconnect ? (
          <VoiceControl
            testId="lab-call-reconnect"
            word={LAB_CALL_COPY.reconnect}
            icon={<VoiceReconnectIcon />}
            onClick={onReconnect}
          />
        ) : (
          <VoiceControl
            testId="lab-call-mute"
            word={view.micOff ? LAB_CALL_COPY.unmute : LAB_CALL_COPY.mute}
            icon={<VoiceMicIcon off={view.micOff} />}
            on={view.micOff}
            pressed={view.micOff}
            onClick={onMuteToggle}
          />
        )}
        <VoiceControl
          testId="lab-call-transcript"
          word={LAB_CALL_COPY.transcript}
          icon={<VoiceTranscriptIcon />}
          onClick={onTranscript}
        />
        <VoiceControl
          testId="lab-call-end"
          word={LAB_CALL_COPY.endWord}
          label={LAB_CALL_COPY.end}
          icon={<VoiceEndIcon />}
          filled
          onClick={onEnd}
        />
      </div>
    </div>
  )
}

interface LabVoiceCallBarProps {
  view: LabCallView
  onMuteToggle: () => void
  onEnd: () => void
  onReturn: () => void
}

/**
 * What is left of the call while the transcript is open: the same status,
 * kept honest, plus mute, end, and the way back to the full surface.
 */
export function LabVoiceCallBar({ view, onMuteToggle, onEnd, onReturn }: LabVoiceCallBarProps) {
  return (
    <div className="lab-call-bar" data-testid="lab-call-bar" data-status={view.status}>
      <button
        type="button"
        className="lab-call-bar-status"
        data-testid="lab-call-bar-return"
        onClick={onReturn}
        aria-label={LAB_CALL_COPY.backToCall}
      >
        <span className={`lab-call-bar-dot is-${view.status}`} aria-hidden="true" />
        <span className="lab-call-bar-text" data-testid="lab-call-bar-text">{view.statusText}</span>
        <span className="lab-call-bar-connection" data-testid="lab-call-bar-connection">
          {view.connectionText}
        </span>
        <svg className="lab-call-bar-back" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 14.5 12 8.5l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className={`lab-call-bar-action${view.micOff ? ' is-on' : ''}`}
        data-testid="lab-call-bar-mute"
        aria-pressed={view.micOff}
        onClick={onMuteToggle}
      >
        {view.micOff ? LAB_CALL_COPY.unmute : LAB_CALL_COPY.mute}
      </button>
      <button
        type="button"
        className="lab-call-bar-action is-end"
        data-testid="lab-call-bar-end"
        onClick={onEnd}
      >
        {LAB_CALL_COPY.end}
      </button>
    </div>
  )
}
