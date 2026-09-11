import type { ReactNode } from 'react'

/**
 * Stroke icons for the voice surface, 1.5px, drawn in `currentColor`.
 * Microphone = Mute/Unmute, three lines = Transcript, X = End, a turning
 * arrow = Reconnect, diagonal arrows = minimize / expand.
 */

function Stroke({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function VoiceMicIcon({ size = 24, off = false }: { size?: number; off?: boolean }) {
  return (
    <Stroke size={size}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      {off && <path d="M4 4l16 16" />}
    </Stroke>
  )
}

export function VoiceTranscriptIcon({ size = 24 }: { size?: number }) {
  return (
    <Stroke size={size}>
      <path d="M5 7h14M5 12h14M5 17h9" />
    </Stroke>
  )
}

export function VoiceEndIcon({ size = 24 }: { size?: number }) {
  return (
    <Stroke size={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Stroke>
  )
}

export function VoiceReconnectIcon({ size = 24 }: { size?: number }) {
  return (
    <Stroke size={size}>
      <path d="M19 12a7 7 0 1 1-2.05-4.95" />
      <path d="M19 4v4h-4" />
    </Stroke>
  )
}

export function VoiceMinimizeIcon({ size = 20 }: { size?: number }) {
  return (
    <Stroke size={size}>
      <path d="M4 14h6v6M20 10h-6V4M10 14L3 21M14 10l7-7" />
    </Stroke>
  )
}

export function VoiceExpandIcon({ size = 20 }: { size?: number }) {
  return (
    <Stroke size={size}>
      <path d="M9 21H3v-6M15 3h6v6M3 21l7-7M21 3l-7 7" />
    </Stroke>
  )
}

interface VoiceControlProps {
  testId: string
  word: string
  /** The accessible name when the visible word is shorter than the action. */
  label?: string
  icon: ReactNode
  filled?: boolean
  on?: boolean
  pressed?: boolean
  /** Icon only: the word becomes the accessible name. */
  compact?: boolean
  onClick: () => void
}

/** A round icon button with one word beneath it. */
export function VoiceControl({ testId, word, label, icon, filled, on, pressed, compact, onClick }: VoiceControlProps) {
  return (
    <button
      type="button"
      className={`lab-voice-control${filled ? ' is-filled' : ''}${on ? ' is-on' : ''}${compact ? ' is-compact' : ''}`}
      data-testid={testId}
      aria-label={compact ? (label ?? word) : label}
      aria-pressed={pressed}
      title={compact ? (label ?? word) : undefined}
      onClick={onClick}
    >
      <span className="lab-voice-control-disc" aria-hidden="true">{icon}</span>
      {!compact && <span className="lab-voice-control-word">{word}</span>}
    </button>
  )
}
