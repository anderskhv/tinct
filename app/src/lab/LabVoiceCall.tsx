import { useEffect, useRef } from 'react'
import {
  LAB_CALL_COPY,
  labCallCue,
  type LabCallCue,
  type LabCallView,
} from './labVoiceCall'
import {
  VoiceControl,
  VoiceEndIcon,
  VoiceMicIcon,
  VoiceReconnectIcon,
} from './LabVoiceIcons'
import { VoiceOrb } from './VoiceOrb'
import { LabTalkSpeedControl } from './LabTalkSpeed'

/**
 * The phone call surface (minimal Talk, 2026-10-09): the dotted orb, one
 * status line (Connecting to AI… / Listening. / Speaking. …, announced through
 * aria-live) and the round icon buttons, centred together on the screen.
 * Nothing else is drawn: no book line, captions or transcript.
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
  /** A failure the reader must act on (sign in, allowance, start failed). */
  notice?: string | null
  onMuteToggle: () => void
  onEnd: () => void
  onReconnect: () => void
  /** Talk's saved speaking speed; the control shows when a setter is given. */
  talkSpeed?: number
  onTalkSpeedChange?: (speed: number) => void
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

/** 176px: about 63% of the original 280px orb (2026-10-09, tighter call). */
export const LAB_CALL_ORB_PX = 176

export function LabVoiceCall({
  view,
  getAssistantLevel,
  reducedMotion = false,
  notice,
  onMuteToggle,
  onEnd,
  onReconnect,
  talkSpeed = 1,
  onTalkSpeedChange,
}: LabVoiceCallProps) {
  const previousRef = useRef<LabCallView | null>(null)
  useEffect(() => {
    const cue = labCallCue(previousRef.current, view)
    previousRef.current = view
    if (cue) playCallCue(cue)
  }, [view])

  const motion = reducedMotion ? 'still' : view.motion
  return (
    <div
      className={`lab-call is-${view.status}`}
      data-testid="lab-call"
      data-status={view.status}
      data-connection={view.connected ? 'connected' : view.showReconnect ? 'lost' : 'connecting'}
      role="dialog"
      aria-label={LAB_CALL_COPY.callLabel}
    >
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
            iconOnly
            onClick={onMuteToggle}
          />
        )}
        {onTalkSpeedChange && (
          <LabTalkSpeedControl speed={talkSpeed} onChange={onTalkSpeedChange} testIdPrefix="lab-call" />
        )}
        <VoiceControl
          testId="lab-call-end"
          word={LAB_CALL_COPY.end}
          icon={<VoiceEndIcon />}
          filled
          iconOnly
          onClick={onEnd}
        />
      </div>
    </div>
  )
}
