import type { NarrationParagraphResult, NarrationParagraphState } from './labNarration'

export const NARRATION_REPLAY_KEY = 'tinct:narration-replay-v1'
const MAX_CHARS = 1_500_000
const MAX_ENTRIES = 160
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
export interface ReplayScope { bookId: string; editionKey: string; chapter: number; identity?: string | null }
interface Entry { scope: string; at: number; value: NarrationParagraphState }
function deviceStorage(): StorageLike | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}
function scopeKey(scope: ReplayScope): string | null {
  return scope.identity && /^[a-f0-9]{64}$/.test(scope.identity)
    ? JSON.stringify([scope.bookId, scope.editionKey, scope.chapter, scope.identity]) : null
}
function playable(value: NarrationParagraphResult): value is NarrationParagraphState {
  if (!value || value.status !== 'ready' || !Number.isInteger(value.paragraph) || value.paragraph < 0
    || !/^[a-f0-9]{64}$/.test(value.textHash) || !Array.isArray(value.chunks)
    || value.chunks.length === 0 || value.chunkCount !== value.chunks.length) return false
  let end = 0
  return value.chunks.every((chunk, index) => {
    if (!chunk.ready || chunk.index !== index || chunk.wordFrom !== end || !Number.isInteger(chunk.wordTo)
      || chunk.wordTo <= end || !chunk.url?.startsWith('/api/audio-file?')
      || !chunk.hash || !/^[a-f0-9]{64}$/.test(chunk.hash)
      || !Number.isFinite(chunk.duration) || chunk.duration! <= 0) return false
    try {
      const url = new URL(chunk.url, 'https://tinct.app')
      if (url.origin !== 'https://tinct.app' || url.pathname !== '/api/audio-file'
        || url.searchParams.get('path') !== 'narration/grok/blob/' + chunk.hash + '.mp3') return false
    } catch { return false }
    end = chunk.wordTo
    return true
  })
}
function entries(storage: StorageLike | null): Entry[] {
  try {
    const raw = storage?.getItem(NARRATION_REPLAY_KEY)
    if (!raw || raw.length > MAX_CHARS) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is Entry => entry && typeof entry.scope === 'string'
      && Number.isFinite(entry.at) && playable(entry.value)).slice(0, MAX_ENTRIES)
  } catch { return [] }
}
/** A fresh server fingerprint is required; the player separately checks current text hashes. */
export function readNarrationReplay(scope: ReplayScope, storage: StorageLike | null = deviceStorage()): NarrationParagraphState[] {
  const key = scopeKey(scope)
  return key ? entries(storage).filter(entry => entry.scope === key).map(entry => entry.value) : []
}
/** Only complete, validated Grok metadata is retained. This does not generate or label audio downloaded. */
export function storeNarrationReplay(scope: ReplayScope, results: NarrationParagraphResult[], storage: StorageLike | null = deviceStorage(), now = Date.now()): void {
  const key = scopeKey(scope)
  if (!key || !storage) return
  const ready = results.filter(playable)
  if (!ready.length) return
  const previous = entries(storage)
  const incoming = ready.map(value => ({ scope: key, at: now, value }))
  const next = [...incoming, ...previous.filter(entry => entry.scope !== key
    || !ready.some(value => value.paragraph === entry.value.paragraph))]
    .sort((a,b) => b.at-a.at).slice(0, MAX_ENTRIES)
  let json = JSON.stringify(next)
  while (json.length > MAX_CHARS && next.length) { next.pop(); json = JSON.stringify(next) }
  try { storage.setItem(NARRATION_REPLAY_KEY, json) } catch { /* Optional cache; normal playback still works. */ }
}
