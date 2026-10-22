/**
 * Talk's call over the margin reader (MarginTalk.tsx): the book reader's own desktop Talk window (LabVoiceDesktopPanel:
 * the orb, its status line, mute or reconnect, Talk's speed and End, minimised to LabVoicePill), drawn in the reader's
 * look (Paper or Night). Loaded the first time Talk opens, with the book reader's styles. No surface of its own.
 */
import '../lab.css'
import { useState } from 'react'
import { LabVoiceDesktopPanel, LabVoicePill } from '../LabVoiceDesktop.tsx'
import type { LabCallView } from '../labVoiceCall'

export default function MarginTalkSurface(props: {
  view: LabCallView
  dark: boolean
  getAssistantLevel: () => number | null
  notice: string | null
  talkSpeed: number
  onTalkSpeedChange: (speed: number) => void
  onMuteToggle: () => void
  onEnd: () => void
  onReconnect: () => void
}) {
  const { dark, talkSpeed, onTalkSpeedChange, ...call } = props
  const [minimized, setMinimized] = useState(false)
  const reducedMotion = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return (
    <div className={`lab is-desktop${dark ? ' is-night' : ''}`} data-chrome-version="v2" data-testid="margin-talk" style={{ minHeight: 0, background: 'transparent', position: 'relative', zIndex: 40 }}>
      {minimized
        ? <LabVoicePill {...call} reducedMotion={reducedMotion} onExpand={() => setMinimized(false)} />
        : <LabVoiceDesktopPanel {...call} reducedMotion={reducedMotion} onMinimize={() => setMinimized(true)} talkSpeed={talkSpeed} onTalkSpeedChange={onTalkSpeedChange} />}
    </div>
  )
}
