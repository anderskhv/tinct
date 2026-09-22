type AudioMode = 'playback' | 'play-and-record'
type BrowserSession = { type: string }

// Conversation takes priority over narration, including React's delayed
// playback-effect cleanup when Talk starts. Unsupported browsers use auto.
const owners = new Map<symbol, AudioMode>()
let session: BrowserSession | undefined
let previous = 'auto'

function applyMode(): void {
  if (!session) return
  const type = [...owners.values()].includes('play-and-record')
    ? 'play-and-record' : owners.size ? 'playback' : previous
  try { session.type = type } catch { /* Optional browser capability. */ }
}

export function acquireBrowserAudioSession(mode: AudioMode): () => void {
  if (typeof navigator === 'undefined') return () => {}
  const available = (navigator as Navigator & { audioSession?: BrowserSession }).audioSession
  if (!available) return () => {}
  if (!owners.size) { session = available; previous = available.type }
  const owner = Symbol(mode)
  owners.set(owner, mode)
  applyMode()
  return () => {
    if (!owners.delete(owner)) return
    applyMode()
    if (!owners.size) session = undefined
  }
}
