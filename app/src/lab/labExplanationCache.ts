/** Private, bounded exact-context reuse. Overlapping selections are different keys. */
const VERSION = 'explanations-v1'
const MAX_AGE = 7 * 24 * 60 * 60 * 1000
type Entry = { key: string; answer: string; at: number }
const storeKey = (owner: string | null) => `tinct:${VERSION}:${owner || 'guest'}`
function read(owner: string | null): Entry[] {
  try {
    const entries: unknown = JSON.parse(localStorage.getItem(storeKey(owner)) || '[]')
    return Array.isArray(entries) ? entries.filter(e => e && typeof e.key === 'string' && typeof e.answer === 'string' && Number.isFinite(e.at) && Date.now() - e.at < MAX_AGE) : []
  } catch { return [] }
}
export async function explanationCacheKey(context: unknown): Promise<string> {
  const serialized = JSON.stringify([VERSION, context])
  if (!globalThis.crypto?.subtle) return serialized
  const bytes = new TextEncoder().encode(serialized)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('')
}
export function cachedExplanation(owner: string | null, key: string): string | undefined {
  return read(owner).find(entry => entry.key === key)?.answer
}
export function rememberExplanation(owner: string | null, key: string, answer: string): void {
  if (!answer.trim() || answer.length > 20000) return
  const entries = [...read(owner).filter(entry => entry.key !== key), { key, answer, at: Date.now() }].slice(-32)
  while (JSON.stringify(entries).length > 200000) entries.shift()
  try { localStorage.setItem(storeKey(owner), JSON.stringify(entries)) } catch { /* Cache failure never prevents an explanation. */ }
}
