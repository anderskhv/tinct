// Offline English dictionary backed by 26 letter-sharded JSON files served
// from /data/dict/{a..z}.json. Each shard is a Record<string, string[]> —
// keys are normalized words/phrases (lowercase, may contain spaces or dots),
// values are arrays of definition strings.
//
// Reconstructed 2026-05-05 after the original was lost in a bad deploy
// script. The dictionary data files were recovered intact from production;
// this is the read/cache layer that sits in front of them. The public API
// (lookup / isFullyLoaded / preloadAll / DictResult) matches the call sites
// in Reader.tsx, SplitReader.tsx, SettingsSheet.tsx.

export type DictResult = {
  word: string
  definitions: string[]
  resolvedFrom?: string
}

const SHARD_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

const shardCache: Map<string, Record<string, string[]>> = new Map()
const shardLoading: Map<string, Promise<Record<string, string[]>>> = new Map()
const failedShards: Set<string> = new Set()

function shardKey(word: string): string | null {
  const first = word.trim().toLowerCase().charAt(0)
  return SHARD_LETTERS.includes(first) ? first : null
}

async function loadShard(letter: string): Promise<Record<string, string[]>> {
  const cached = shardCache.get(letter)
  if (cached) return cached
  const inflight = shardLoading.get(letter)
  if (inflight) return inflight
  if (failedShards.has(letter)) return {}

  const promise = (async () => {
    try {
      const res = await fetch(`/data/dict/${letter}.json`)
      if (!res.ok) throw new Error(`shard ${letter} HTTP ${res.status}`)
      const data = (await res.json()) as Record<string, string[]>
      shardCache.set(letter, data)
      return data
    } catch (err) {
      failedShards.add(letter)
      console.warn(`[dictionary] failed to load shard ${letter}:`, err)
      return {}
    } finally {
      shardLoading.delete(letter)
    }
  })()
  shardLoading.set(letter, promise)
  return promise
}

function normalize(word: string): string {
  return word.trim().toLowerCase().replace(/[‘’]/g, "'")
}

// Conservative stems — strip common English suffixes one at a time and try
// each candidate against the shard. Order matters: try longer suffixes first
// so we don't shave "running" to "runn" before trying "run". We don't try to
// be smart about doubled consonants beyond the obvious cases (running → run,
// stopped → stop) because the dictionary already includes many inflected
// forms; this is a fallback for the ones it doesn't.
function stemCandidates(word: string): string[] {
  const out: string[] = []
  const seen = new Set<string>([word])
  const push = (s: string) => {
    if (s && s.length >= 2 && !seen.has(s)) {
      seen.add(s)
      out.push(s)
    }
  }

  if (word.endsWith("'s")) push(word.slice(0, -2))
  if (word.endsWith("s'")) push(word.slice(0, -2))

  if (word.endsWith('ies') && word.length > 4) push(word.slice(0, -3) + 'y')
  if (word.endsWith('ied') && word.length > 4) push(word.slice(0, -3) + 'y')
  if (word.endsWith('ily') && word.length > 4) push(word.slice(0, -3) + 'y')

  if (word.endsWith('es') && word.length > 3) push(word.slice(0, -2))
  if (word.endsWith('ed') && word.length > 3) {
    push(word.slice(0, -2))
    push(word.slice(0, -1))
    if (/(.)\1ed$/.test(word)) push(word.slice(0, -3))
  }
  if (word.endsWith('ing') && word.length > 4) {
    push(word.slice(0, -3))
    push(word.slice(0, -3) + 'e')
    if (/(.)\1ing$/.test(word)) push(word.slice(0, -4))
  }
  if (word.endsWith('ly') && word.length > 3) push(word.slice(0, -2))
  if (word.endsWith('er') && word.length > 3) {
    push(word.slice(0, -2))
    push(word.slice(0, -1))
  }
  if (word.endsWith('est') && word.length > 4) {
    push(word.slice(0, -3))
    push(word.slice(0, -2))
  }
  if (word.endsWith('s') && word.length > 2) push(word.slice(0, -1))

  return out
}

export async function lookup(input: string): Promise<DictResult | null> {
  const word = normalize(input)
  if (!word) return null
  const letter = shardKey(word)
  if (!letter) return null

  const shard = await loadShard(letter)

  const direct = shard[word]
  if (direct && direct.length) return { word, definitions: direct }

  for (const candidate of stemCandidates(word)) {
    const stemLetter = shardKey(candidate)
    if (!stemLetter) continue
    const stemShard = stemLetter === letter ? shard : await loadShard(stemLetter)
    const hit = stemShard[candidate]
    if (hit && hit.length) {
      return { word: candidate, resolvedFrom: word, definitions: hit }
    }
  }
  return null
}

export function isFullyLoaded(): boolean {
  return SHARD_LETTERS.every(l => shardCache.has(l) || failedShards.has(l))
}

export async function preloadAll(
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const total = SHARD_LETTERS.length
  let done = SHARD_LETTERS.filter(l => shardCache.has(l) || failedShards.has(l)).length
  onProgress?.(done, total)
  // Sequential so the progress bar advances visibly and we're polite to the
  // edge cache. 26 small JSON requests aren't worth parallelising.
  for (const letter of SHARD_LETTERS) {
    if (shardCache.has(letter) || failedShards.has(letter)) continue
    await loadShard(letter)
    done++
    onProgress?.(done, total)
  }
}
