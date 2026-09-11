import { useEffect, useRef } from 'react'
import { LAB_COPY } from './labCopy'
import type { LabAskTurn } from './labAsk'
import { LAB_CALL_COPY, labCallCaption, labCallUtterance, type LabCallView } from './labVoiceCall'
import {
  VoiceControl,
  VoiceEndIcon,
  VoiceExpandIcon,
  VoiceMicIcon,
  VoiceMinimizeIcon,
  VoiceReconnectIcon,
  VoiceTranscriptIcon,
} from './LabVoiceIcons'
import { VoiceOrb } from './VoiceOrb'

/**
 * The desktop voice surface. The conversation lives in the companion panel:
 * orb on top with the status word and connection beneath, the transcript in
 * the panel body, Mute and End at the bottom. A minimize control collapses
 * it to a pill in the corner of the page while the call keeps running.
 *
 * Both are rendering only. The view they draw is the same `LabCallView`
 * the phone call surface draws, and every control calls back into the
 * reader-owned session; nothing here starts, stops or moves anything.
 */

export const LAB_VOICE_PANEL_ORB_PX = 170
export const LAB_VOICE_PILL_ORB_PX = 84

function ConnectionLine({ view, testId }: { view: LabCallView; testId: string }) {
  return (
    <span className="lab-voice-connection" data-testid={testId}>
      <span className="lab-voice-connection-dot" aria-hidden="true" />
      {view.connectionText}
    </span>
  )
}

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
      onClick={onMuteToggle}
    />
  )
}

interface LabVoiceDesktopPanelProps {
  view: LabCallView
  turns: LabAskTurn[]
  getAssistantLevel?: () => number | null
  reducedMotion?: boolean
  notice?: string | null
  onMuteToggle: () => void
  onEnd: () => void
  onReconnect: () => void
  onMinimize: () => void
}

export function LabVoiceDesktopPanel({
  view,
  turns,
  getAssistantLevel,
  reducedMotion = false,
  notice,
  onMuteToggle,
  onEnd,
  onReconnect,
  onMinimize,
}: LabVoiceDesktopPanelProps) {
  const threadRef = useRef<HTMLDivElement | null>(null)
  const followRef = useRef(true)
  const lastTurn = turns[turns.length - 1]
  const streamingId = view.status === 'speaking' && lastTurn?.role === 'assistant' ? lastTurn.id : null

  // The transcript follows the newest line unless the reader has scrolled
  // up to read something earlier.
  useEffect(() => {
    const node = threadRef.current
    if (!node || !followRef.current) return
    node.scrollTop = node.scrollHeight
  }, [turns, view.status])

  const onScroll = () => {
    const node = threadRef.current
    if (!node) return
    followRef.current = node.scrollHeight - node.scrollTop - node.clientHeight <= 48
  }

  const motion = reducedMotion ? 'still' : view.motion
  return (
    <aside
      className={`lab-voice-panel is-${view.status}`}
      data-testid="lab-voice-panel"
      data-status={view.status}
      data-connection={view.connected ? 'connected' : view.showReconnect ? 'lost' : 'connecting'}
      aria-label={LAB_CALL_COPY.callLabel}
    >
      <div className="lab-voice-panel-head">
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
        <ConnectionLine view={view} testId="lab-voice-panel-connection" />
        {view.micOff && view.status !== 'muted' && (
          <p className="lab-voice-panel-line" data-testid="lab-voice-panel-micoff">{LAB_CALL_COPY.micOff}</p>
        )}
        {view.status === 'disconnected' && (
          <p className="lab-voice-panel-line" data-testid="lab-voice-panel-help">{LAB_CALL_COPY.disconnectedHelp}</p>
        )}
        {notice && <p className="lab-voice-panel-line" data-testid="lab-voice-panel-notice">{notice}</p>}
      </div>
      <div className="lab-voice-panel-thread" data-testid="lab-voice-panel-thread" ref={threadRef} onScroll={onScroll}>
        {turns.length === 0 && (
          <p className="lab-voice-panel-empty" data-testid="lab-voice-panel-empty">{LAB_CALL_COPY.askAboutPage}</p>
        )}
        {turns.map(turn => (
          <div
            key={turn.id}
            className={`lab-voice-turn is-${turn.role}`}
            data-testid={`lab-voice-turn-${turn.role}`}
            data-turn-id={turn.id}
          >
            <span className="lab-voice-turn-label">{turn.role === 'user' ? LAB_COPY.youLabel : LAB_COPY.tinctLabel}</span>
            <p className="lab-voice-turn-text">
              {turn.content}
              {streamingId === turn.id && <span className="lab-voice-caret" aria-hidden="true" />}
            </p>
          </div>
        ))}
      </div>
      <div className="lab-voice-panel-controls">
        <MuteOrReconnect view={view} testIdPrefix="lab-voice-panel" onMuteToggle={onMuteToggle} onReconnect={onReconnect} />
        <VoiceControl
          testId="lab-voice-panel-end"
          word={LAB_CALL_COPY.endWord}
          label={LAB_CALL_COPY.end}
          icon={<VoiceEndIcon size={22} />}
          filled
          onClick={onEnd}
        />
      </div>
    </aside>
  )
}

interface LabVoicePillProps {
  view: LabCallView
  turns: LabAskTurn[]
  getAssistantLevel?: () => number | null
  reducedMotion?: boolean
  onMuteToggle: () => void
  onEnd: () => void
  onReconnect: () => void
  /** Brings the panel back: the orb, Transcript and the expand control all do this. */
  onExpand: () => void
}

export function LabVoicePill({
  view,
  turns,
  getAssistantLevel,
  reducedMotion = false,
  onMuteToggle,
  onEnd,
  onReconnect,
  onExpand,
}: LabVoicePillProps) {
  const motion = reducedMotion ? 'still' : view.motion
  const line = labCallCaption(view, labCallUtterance(turns))
  return (
    <div
      className={`lab-voice-pill is-${view.status}`}
      data-testid="lab-voice-pill"
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
        {line && <span className="lab-voice-pill-line" data-testid="lab-voice-pill-line">{line}</span>}
      </div>
      <div className="lab-voice-pill-controls">
        <MuteOrReconnect view={view} testIdPrefix="lab-voice-pill" compact onMuteToggle={onMuteToggle} onReconnect={onReconnect} />
        <VoiceControl
          testId="lab-voice-pill-transcript"
          word={LAB_CALL_COPY.transcript}
          icon={<VoiceTranscriptIcon size={22} />}
          compact
          onClick={onExpand}
        />
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
