import { LAB_CALL_COPY, type LabCallView } from './labVoiceCall'
import {
  VoiceControl,
  VoiceEndIcon,
  VoiceExpandIcon,
  VoiceMicIcon,
  VoiceMinimizeIcon,
  VoiceReconnectIcon,
} from './LabVoiceIcons'
import { VoiceOrb } from './VoiceOrb'
import { LabTalkSpeedControl } from './LabTalkSpeedControl'
import { useReaderWindow } from './useReaderWindow'
import { useDraggableSurface } from './useDraggableSurface'

/**
 * The desktop voice surface (minimal Talk, 2026-10-09): a compact window with
 * the orb, one status line (Connecting to AI… / Listening. / Speaking. …,
 * announced through aria-live) and the controls row: Mute or Reconnect,
 * speed and End as icons (their names are aria-labels and tooltips; only the
 * speed shows its value). The transcript is kept by the session for history
 * and usage but not drawn here. A minimize control collapses it to a pill in
 * the corner of the page while the call keeps running.
 *
 * Both are rendering only. The view they draw is the same `LabCallView`
 * the phone call surface draws, and every control calls back into the
 * reader-owned session; nothing here starts, stops or moves anything.
 */

/** 108px: about 64% of the original 170px orb (2026-10-09, tighter Talk window). */
export const LAB_VOICE_PANEL_ORB_PX = 108
export const LAB_VOICE_PILL_ORB_PX = 60

function MuteOrReconnect({
  view,
  testIdPrefix,
  compact,
  onMuteToggle,
  onReconnect,
}: {
  view: LabCallView
  testIdPrefix: string
  compact?: boolean
  onMuteToggle: () => void
  onReconnect: () => void
}) {
  if (view.showReconnect) {
    return (
      <VoiceControl
        testId={`${testIdPrefix}-reconnect`}
        word={LAB_CALL_COPY.reconnect}
        icon={<VoiceReconnectIcon size={22} />}
        compact={compact}
        onClick={onReconnect}
      />
    )
  }
  return (
    <VoiceControl
      testId={`${testIdPrefix}-mute`}
      word={view.micOff ? LAB_CALL_COPY.unmute : LAB_CALL_COPY.mute}
      icon={<VoiceMicIcon size={22} off={view.micOff} />}
      on={view.micOff}
      pressed={view.micOff}
      compact={compact}
      iconOnly
      onClick={onMuteToggle}
    />
  )
}

interface LabVoiceDesktopPanelProps {
  view: LabCallView
  getAssistantLevel?: () => number | null
  reducedMotion?: boolean
  /** A failure the reader must act on (sign in, allowance, start failed). */
  notice?: string | null
  onMuteToggle: () => void
  onEnd: () => void
  onReconnect: () => void
  onMinimize: () => void
  /** Talk's saved speaking speed; the control shows when a setter is given. */
  talkSpeed?: number
  onTalkSpeedChange?: (speed: number) => void
}

export function LabVoiceDesktopPanel({
  view,
  getAssistantLevel,
  reducedMotion = false,
  notice,
  onMuteToggle,
  onEnd,
  onReconnect,
  onMinimize,
  talkSpeed = 1,
  onTalkSpeedChange,
}: LabVoiceDesktopPanelProps) {
  const windowRef = useReaderWindow<HTMLElement>('talk')
  const motion = reducedMotion ? 'still' : view.motion
  return (
    <aside
      ref={windowRef}
      className={`lab-voice-panel is-${view.status}`}
      data-testid="lab-voice-panel"
      data-status={view.status}
      data-connection={view.connected ? 'connected' : view.showReconnect ? 'lost' : 'connecting'}
      aria-label={LAB_CALL_COPY.callLabel}
    >
      <button type="button" data-reader-window-resize aria-label="Resize voice panel" />
      <div className="lab-voice-panel-head" data-reader-window-handle>
        <strong>Talk</strong>
        <button
          type="button"
          className="lab-voice-panel-minimize"
          data-testid="lab-voice-panel-minimize"
          aria-label={LAB_CALL_COPY.minimize}
          title={LAB_CALL_COPY.minimize}
          onClick={onMinimize}
        >
          <VoiceMinimizeIcon />
        </button>
      </div>
      <div className="lab-voice-panel-stage">
        <VoiceOrb
          status={view.status}
          motion={motion}
          broken={view.broken}
          getAssistantLevel={getAssistantLevel}
          reducedMotion={reducedMotion}
          size={LAB_VOICE_PANEL_ORB_PX}
          testId="lab-voice-panel-orb"
        />
        <p className="lab-voice-panel-status" data-testid="lab-voice-panel-status" aria-live="polite">
          {view.statusText}
        </p>
        {notice && <p className="lab-voice-panel-line" data-testid="lab-voice-panel-notice">{notice}</p>}
      </div>
      <div className="lab-voice-panel-controls">
        <MuteOrReconnect view={view} testIdPrefix="lab-voice-panel" onMuteToggle={onMuteToggle} onReconnect={onReconnect} />
        {onTalkSpeedChange && (
          <LabTalkSpeedControl speed={talkSpeed} onChange={onTalkSpeedChange} testIdPrefix="lab-voice-panel" iconSize={22} />
        )}
        <VoiceControl
          testId="lab-voice-panel-end"
          word={LAB_CALL_COPY.end}
          icon={<VoiceEndIcon size={22} />}
          filled
          iconOnly
          onClick={onEnd}
        />
      </div>
    </aside>
  )
}

interface LabVoicePillProps {
  view: LabCallView
  getAssistantLevel?: () => number | null
  reducedMotion?: boolean
  onMuteToggle: () => void
  onEnd: () => void
  onReconnect: () => void
  /** Brings the panel back: the orb and the expand control both do this. */
  onExpand: () => void
}

export function LabVoicePill({
  view,
  getAssistantLevel,
  reducedMotion = false,
  onMuteToggle,
  onEnd,
  onReconnect,
  onExpand,
}: LabVoicePillProps) {
  const motion = reducedMotion ? 'still' : view.motion
  // The call keeps running wherever the pill sits, so where it sits is the
  // reader's business: drag it off the passage being discussed and it stays
  // there, on this device, across calls.
  const drag = useDraggableSurface<HTMLDivElement>('tinct-lab-voice-pill-position', true, true)
  return (
    <div
      ref={drag.ref}
      style={drag.style}
      className={`lab-voice-pill is-${view.status}${drag.dragging ? ' is-dragging' : ''}`}
      data-testid="lab-voice-pill"
      data-near-top={drag.style && drag.style.top < 100 ? "true" : undefined}
      data-near-left={drag.style && drag.style.left < 160 ? "true" : undefined}
      data-status={view.status}
      data-connection={view.connected ? 'connected' : view.showReconnect ? 'lost' : 'connecting'}
      role="group"
      aria-label={LAB_CALL_COPY.callLabel}
    >
      <button
        type="button"
        className="lab-voice-pill-orb"
        data-testid="lab-voice-pill-orb"
        aria-label={LAB_CALL_COPY.expand}
        title={LAB_CALL_COPY.expand}
        onClick={onExpand}
      >
        <VoiceOrb
          status={view.status}
          motion={motion}
          broken={view.broken}
          getAssistantLevel={getAssistantLevel}
          reducedMotion={reducedMotion}
          size={LAB_VOICE_PILL_ORB_PX}
          testId="lab-voice-pill-orb-canvas"
        />
      </button>
      <div className="lab-voice-pill-words">
        <span className="lab-voice-pill-status" data-testid="lab-voice-pill-status">{view.statusText}</span>
      </div>
      <div className="lab-voice-pill-controls">
        <MuteOrReconnect view={view} testIdPrefix="lab-voice-pill" compact onMuteToggle={onMuteToggle} onReconnect={onReconnect} />
        <VoiceControl
          testId="lab-voice-pill-end"
          word={LAB_CALL_COPY.end}
          icon={<VoiceEndIcon size={22} />}
          filled
          compact
          onClick={onEnd}
        />
        <button
          type="button"
          className="lab-voice-pill-expand"
          data-testid="lab-voice-pill-expand"
          aria-label={LAB_CALL_COPY.expand}
          title={LAB_CALL_COPY.expand}
          onClick={onExpand}
        >
          <VoiceExpandIcon />
        </button>
      </div>
    </div>
  )
}
