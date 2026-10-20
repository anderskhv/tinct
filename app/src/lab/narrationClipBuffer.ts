/**
 * Narration clip buffer: the recordings after the playing one, downloaded
 * whole into memory ahead of their turn, so a clip boundary never waits on
 * the network.
 *
 * Measured 2026-10-20 (scripts/check-narration-gaps.mjs): the element's own
 * request for the next clip went to the network whenever the two-clip
 * download-ahead had not reached it or the browser cache did not answer a
 * media range request from it, and on a phone network that is the silence a
 * listener hears as "it stopped". A blob: URL plays from memory: the swap on
 * `ended` stays on the same element (lock screen, iOS) and costs only the
 * decoder's start. The CSP's media-src already admits blob: (the hold's
 * silence uses it).
 *
 * The window is time, not clips: short paragraphs are a few seconds each.
 * Save-Data caps it; a hidden page (a locked phone) reaches further, because
 * nobody can tap Retry there.
 */

/** Seconds of audio (at 1x) kept downloaded ahead of the playhead while the page is visible. */
export const CLIP_BUFFER_VISIBLE_SECONDS = 120
/** The same while the page is hidden: a locked phone in a car crosses dead spots. */
export const CLIP_BUFFER_HIDDEN_SECONDS = 300
/** With Save-Data on, the window shrinks to this (hidden: twice it). */
export const CLIP_BUFFER_SAVE_DATA_SECONDS = 45
/** At least this many clips ahead, whatever their length (the next one or two are what a boundary needs). */
export const CLIP_BUFFER_MIN_CLIPS = 2
/** Memory ceiling for downloaded clips; ~17 minutes of 128 kbps narration. */
export const CLIP_BUFFER_MAX_BYTES = 16 * 1024 * 1024
/** Downloads at once: one keeps the nearest clip first on a thin connection. */
const CONCURRENCY = 1
/** Back-off after a failed download before the same URL is asked again. */
const RETRY_AFTER_MS = 4_000

export interface ClipBufferConditions {
  hidden: boolean
  saveData: boolean
  /** Playback rate: the window is listening time, so 2x needs twice the audio. */
  rate: number
}

/** Seconds of recording to keep ahead of the playhead in these conditions. */
export function clipBufferSeconds({ hidden, saveData, rate }: ClipBufferConditions): number {
  const base = saveData
    ? CLIP_BUFFER_SAVE_DATA_SECONDS * (hidden ? 2 : 1)
    : hidden ? CLIP_BUFFER_HIDDEN_SECONDS : CLIP_BUFFER_VISIBLE_SECONDS
  const speed = Number.isFinite(rate) && rate > 0 ? Math.min(4, Math.max(1, rate)) : 1
  return base * speed
}

/** Save-Data, from the Network Information API where the browser has it. */
export function connectionSavesData(): boolean {
  try {
    const connection = (typeof navigator !== 'undefined' ? (navigator as Navigator & { connection?: { saveData?: boolean } }).connection : undefined)
    return connection?.saveData === true
  } catch {
    return false
  }
}

export interface BufferCandidate {
  /** Fetchable URL of the recording; absent while it is still being made. */
  url?: string
  /** Seconds, when known. */
  duration?: number
}

/** Seconds assumed for a clip whose length is not known yet. */
const UNKNOWN_CLIP_SECONDS = 10

/**
 * The URLs to hold, in playing order: the clips after `fromIndex` up to
 * `targetSeconds` of audio past the playhead (and never fewer than
 * `minClips`). `remainingInCurrent` is what is left of the playing clip.
 * Stops at the first clip that has no recording yet: the look-ahead makes
 * those, and a later one would not play before it anyway.
 */
export function clipsToBuffer(
  clips: BufferCandidate[],
  fromIndex: number,
  remainingInCurrent: number,
  targetSeconds: number,
  minClips = CLIP_BUFFER_MIN_CLIPS,
): string[] {
  const urls: string[] = []
  let ahead = Math.max(0, remainingInCurrent)
  for (let index = fromIndex + 1; index < clips.length; index += 1) {
    if (ahead >= targetSeconds && urls.length >= minClips) break
    const clip = clips[index]
    if (!clip.url) break
    if (!urls.includes(clip.url)) urls.push(clip.url)
    ahead += typeof clip.duration === 'number' && clip.duration > 0 ? clip.duration : UNKNOWN_CLIP_SECONDS
  }
  return urls
}

interface Entry {
  url: string
  state: 'queued' | 'loading' | 'ready' | 'failed'
  objectUrl?: string
  bytes: number
  failedAt?: number
  controller?: AbortController
}

export interface ClipBufferDeps {
  fetch: typeof fetch
  /** Absent where blob: URLs are not available (the download then only warms the HTTP cache). */
  createObjectURL?: (blob: Blob) => string
  revokeObjectURL?: (url: string) => void
  now: () => number
  maxBytes: number
}

/** blob: URL → the clip URL it holds, for every buffer (the element only knows its src). */
const sourceOrigins = new Map<string, string>()

/** The clip URL behind an element source: the blob's origin, else the source itself. */
export function clipUrlOfSource(src: string | null | undefined): string | null {
  if (!src) return null
  return sourceOrigins.get(src) ?? src
}

/** True when the element source plays this clip URL (a buffered copy or the URL itself). */
export function sourcePlaysClip(src: string | null | undefined, url: string | null | undefined): boolean {
  if (!src || !url) return false
  const origin = sourceOrigins.get(src)
  if (origin) return origin === url || origin.endsWith(url) || url.endsWith(origin)
  return src === url || src.endsWith(url)
}

function defaultDeps(): Partial<ClipBufferDeps> {
  const deps: Partial<ClipBufferDeps> = {}
  if (typeof fetch === 'function') deps.fetch = (...args) => fetch(...args)
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' && typeof URL.revokeObjectURL === 'function' && typeof Blob !== 'undefined') {
    deps.createObjectURL = blob => URL.createObjectURL(blob)
    deps.revokeObjectURL = url => URL.revokeObjectURL(url)
  }
  return deps
}

export class NarrationClipBuffer {
  private entries = new Map<string, Entry>()
  private order: string[] = []
  private active = 0
  private readonly deps: ClipBufferDeps | null

  constructor(deps?: Partial<ClipBufferDeps>) {
    const merged: Partial<ClipBufferDeps> = { ...defaultDeps(), ...(deps ?? {}) }
    this.deps = merged.fetch
      ? { maxBytes: CLIP_BUFFER_MAX_BYTES, now: () => new Date().getTime(), ...merged } as ClipBufferDeps
      : null
  }

  /** The source to give the element for this clip: its downloaded copy, else null. */
  sourceFor(url: string): string | null {
    const entry = this.entries.get(url)
    return entry?.state === 'ready' && entry.objectUrl ? entry.objectUrl : null
  }

  isReady(url: string): boolean {
    return this.entries.get(url)?.state === 'ready'
  }

  /** Bytes held in memory. */
  get bytes(): number {
    let total = 0
    for (const entry of this.entries.values()) total += entry.bytes
    return total
  }

  /**
   * Download `urls` (in playing order, nearest first) and keep them, plus
   * anything in `retain` already held (the playing clip, the one before it
   * that the element may still read, and later clips a wider window fetched).
   * Everything else is dropped. Safe to call often; each URL is fetched once.
   */
  want(urls: string[], retain: string[] = []): void {
    if (!this.deps) return
    const kept = new Set([...urls, ...retain.filter(Boolean)])
    for (const [url, entry] of Array.from(this.entries.entries())) {
      if (!kept.has(url)) this.drop(url, entry)
    }
    this.order = urls
    for (const url of urls) {
      const entry = this.entries.get(url)
      if (!entry) this.entries.set(url, { url, state: 'queued', bytes: 0 })
      else if (entry.state === 'failed' && this.deps.now() - (entry.failedAt ?? 0) >= RETRY_AFTER_MS) entry.state = 'queued'
    }
    this.pump()
  }

  /** Drop one clip's copy (it failed to play): the element streams the URL instead. */
  forget(url: string): void {
    const entry = this.entries.get(url)
    if (entry) this.drop(url, entry)
  }

  /** Forget everything (a stop, or the hook unmounting). */
  clear(): void {
    for (const [url, entry] of Array.from(this.entries.entries())) this.drop(url, entry)
    this.order = []
  }

  private drop(url: string, entry: Entry): void {
    entry.controller?.abort()
    if (entry.objectUrl) {
      sourceOrigins.delete(entry.objectUrl)
      try { this.deps?.revokeObjectURL?.(entry.objectUrl) } catch { /* ignore */ }
    }
    this.entries.delete(url)
  }

  private pump(): void {
    const deps = this.deps
    if (!deps) return
    while (this.active < CONCURRENCY) {
      if (this.bytes >= deps.maxBytes) return
      const next = this.order.map(url => this.entries.get(url)).find(entry => entry?.state === 'queued')
      if (!next) return
      this.load(next, deps)
    }
  }

  private load(entry: Entry, deps: ClipBufferDeps): void {
    entry.state = 'loading'
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
    entry.controller = controller
    this.active += 1
    const settle = () => {
      this.active -= 1
      entry.controller = undefined
      this.pump()
    }
    void Promise.resolve()
      .then(() => deps.fetch(entry.url, { cache: 'force-cache', credentials: 'same-origin', ...(controller ? { signal: controller.signal } : {}) }))
      .then(async (response) => {
        if (!response?.ok) throw new Error(String(response?.status))
        if (!deps.createObjectURL) {
          // No blob: URLs here: the download still warms the HTTP cache the element reads from.
          await response.arrayBuffer()
          if (this.entries.get(entry.url) === entry) entry.state = 'ready'
          return
        }
        const blob = typeof response.blob === 'function'
          ? await response.blob()
          : new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' })
        if (!blob || blob.size === 0) throw new Error('empty')
        if (this.entries.get(entry.url) !== entry) return
        const typed = blob.type && blob.type.startsWith('audio/') ? blob : new Blob([blob], { type: 'audio/mpeg' })
        entry.objectUrl = deps.createObjectURL(typed)
        sourceOrigins.set(entry.objectUrl, entry.url)
        entry.bytes = typed.size
        entry.state = 'ready'
      })
      .catch(() => {
        // Never in the way of playback: the element streams the URL itself.
        if (this.entries.get(entry.url) !== entry) return
        entry.state = 'failed'
        entry.failedAt = deps.now()
      })
      .finally(settle)
  }
}
