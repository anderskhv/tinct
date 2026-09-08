import { useEffect, useRef } from 'react'
import {
  LAB_CALL_COPY,
  labCallCue,
  type LabCallCue,
  type LabCallView,
} from './labVoiceCall'

/**
 * The phone call surface: one circle, one large status line, a connection line
 * kept apart from it, and four plain controls.
 *
 * Every indicator here is driven by the view it is handed, and that view is a
 * pure function of session events. The one thing this component reads for
 * itself is the assistant's real loudness while she speaks, and only through
 * `getAssistantLevel`, which returns null rather than inventing a number.
 */

interface LabVoiceCallProps {
  view: LabCallView
  /** Real assistant loudness, 0-1, or null when the audio path exposes none. */
  getAssistantLevel?: () => number | null
  reducedMotion?: boolean
  notice?: string | null
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

function CallCircle({
  view,
  getAssistantLevel,
  reducedMotion,
}: {
  view: LabCallView
  getAssistantLevel?: () => number | null
  reducedMotion: boolean
}) {
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const levelSourceRef = useRef<'audio' | 'unavailable'>('unavailable')

  // The speaking circle follows the assistant's own playback. If the audio path
  // exposes no level, the circle holds still and says so in the DOM rather than
  // running a timed animation that would only look like speech.
  useEffect(() => {
    const node = nodeRef.current
    if (!node) return
    if (view.motion !== 'pulse' || reducedMotion || !getAssistantLevel) {
      node.style.setProperty('--lab-call-level', '0')
      return
    }
    let frame = 0
    let smoothed = 0
    let stopped = false
    const tick = () => {
      if (stopped) return
      const level = getAssistantLevel()
      if (level == null) {
        levelSourceRef.current = 'unavailable'
        node.dataset.levelSource = 'unavailable'
        node.style.setProperty('--lab-call-level', '0')
        return
      }
      levelSourceRef.current = 'audio'
      node.dataset.levelSource = 'audio'
      smoothed = smoothed + (level - smoothed) * 0.35
      node.style.setProperty('--lab-call-level', smoothed.toFixed(3))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      node.style.setProperty('--lab-call-level', '0')
    }
  }, [getAssistantLevel, reducedMotion, view.motion])

  const motion = reducedMotion ? 'still' : view.motion
  return (
    <div
      className={`lab-call-circle is-${view.status} motion-${motion}`}
      data-testid="lab-call-circle"
      data-status={view.status}
      data-motion={motion}
      data-broken={view.broken ? 'true' : 'false'}
      ref={nodeRef}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" className="lab-call-ring">
        <circle className="lab-call-ring-track" cx="100" cy="100" r="86" />
        <circle className="lab-call-ring-mark" cx="100" cy="100" r="86" />
      </svg>
      <span className="lab-call-core" />
    </div>
  )
}

export function LabVoiceCall({
  view,
  getAssistantLevel,
  reducedMotion = false,
  notice,
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

  return (
    <div
      className={`lab-call is-${view.status}`}
      data-testid="lab-call"
      data-status={view.status}
      data-connection={view.connected ? 'connected' : view.showReconnect ? 'lost' : 'connecting'}
      role="dialog"
      aria-label={LAB_CALL_COPY.callLabel}
    >
      <p className="lab-call-connection" data-testid="lab-call-connection">
        <span className="lab-call-connection-dot" aria-hidden="true" />
        <span className="lab-call-connection-label">{LAB_CALL_COPY.connectionLabel}</span>
        <span className="lab-call-connection-value">{view.connectionText}</span>
      </p>

      <div className="lab-call-stage">
        <CallCircle view={view} getAssistantLevel={getAssistantLevel} reducedMotion={reducedMotion} />
        <p className="lab-call-status" data-testid="lab-call-status" aria-live="polite">
          {view.statusText}
        </p>
        {view.micOff && view.status !== 'muted' && (
          <p className="lab-call-micoff" data-testid="lab-call-micoff">{LAB_CALL_COPY.micOff}</p>
        )}
        {view.status === 'disconnected' && (
          <p className="lab-call-help" data-testid="lab-call-help">{LAB_CALL_COPY.disconnectedHelp}</p>
        )}
        {notice && <p className="lab-call-notice" data-testid="lab-call-notice">{notice}</p>}
      </div>

      <div className="lab-call-controls">
        <button
          type="button"
          className="lab-call-transcript"
          data-testid="lab-call-transcript"
          onClick={onTranscript}
        >
          {LAB_CALL_COPY.transcript}
        </button>
        <div className="lab-call-buttons">
          {view.showReconnect ? (
            <button
              type="button"
              className="lab-call-button is-reconnect"
              data-testid="lab-call-reconnect"
              onClick={onReconnect}
            >
              {LAB_CALL_COPY.reconnect}
            </button>
          ) : (
            <button
              type="button"
              className={`lab-call-button is-mute${view.micOff ? ' is-on' : ''}`}
              data-testid="lab-call-mute"
              aria-pressed={view.micOff}
              onClick={onMuteToggle}
            >
              {view.micOff ? LAB_CALL_COPY.unmute : LAB_CALL_COPY.mute}
            </button>
          )}
          <button
            type="button"
            className="lab-call-button is-end"
            data-testid="lab-call-end"
            onClick={onEnd}
          >
            {LAB_CALL_COPY.end}
          </button>
        </div>
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
