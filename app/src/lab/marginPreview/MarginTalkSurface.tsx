/**
 * Talk's call over the margin reader (MarginTalk.tsx): the book reader's call surface (LabVoiceCall: the orb, one
 * status line, mute, end and reconnect), in a panel at the foot of the window, in the reader's own look (Paper or
 * Night). Loaded the first time Talk opens, with the book reader's styles.
 */
import '../lab.css'
import { LabVoiceCall } from '../LabVoiceCall.tsx'
import type { LabCallView } from '../labVoiceCall'

export default function MarginTalkSurface(props: {
  view: LabCallView
  dark: boolean
  getAssistantLevel: () => number | null
  notice: string | null
  onMuteToggle: () => void
  onEnd: () => void
  onReconnect: () => void
}) {
  const { dark, ...call } = props
  return (
    <div className={`lab${dark ? ' is-night' : ''}`} data-chrome-version="v2" style={{ minHeight: 0, background: 'transparent' }}>
      {/* The phone's full-screen call, held in this panel (as the library's Talk holds it in its own). */}
      <style>{'.lab[data-chrome-version="v2"] .lab-margin-talk .lab-call{position:relative;inset:auto;z-index:auto;min-height:0;height:auto;width:100%;padding:8px 0;background:transparent}'}</style>
      <section className="lab-margin-talk" role="dialog" aria-label="Talk" data-testid="margin-talk"
        style={{ position: 'fixed', right: 24, bottom: 24, width: 320, minHeight: 300, zIndex: 40, display: 'grid', placeItems: 'center', borderRadius: 18, background: 'var(--lab-call-panel, rgba(249, 245, 236, 0.96))', border: '1px solid var(--lab-call-panel-border, rgba(123, 108, 85, 0.22))', boxShadow: 'var(--lab-call-pill-shadow, 0 14px 36px rgba(53, 43, 30, 0.14))', padding: 16 }}>
        <LabVoiceCall orbSize={140} {...call} />
      </section>
    </div>
  )
}
