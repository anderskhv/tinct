import { VoiceOrb } from './VoiceOrb'
import { useDraggableSurface } from './useDraggableSurface'

export function LabCompanionOrb({ busy, onRestore }: { busy: boolean; onRestore: () => void }) {
  const drag = useDraggableSurface<HTMLButtonElement>('tinct-chat-orb-position', true, true)
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  return <button ref={drag.ref} style={drag.style} type="button"
    className="lab-companion-orb" aria-label="Restore chat" title="Restore chat — drag to move"
    data-testid="lab-chat-orb" onClick={onRestore}>
    <VoiceOrb status={busy ? 'thinking' : 'listening'} motion={reduced ? 'still' : busy ? 'rotate' : 'breathe'}
      reducedMotion={reduced} size={60} testId="lab-chat-orb-canvas"/>
  </button>
}
