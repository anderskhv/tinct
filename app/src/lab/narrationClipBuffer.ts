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
/** Downloads at once while healthy: one keeps the nearest clip first on a thin connection. */
const CONCURRENCY = 1
/** Downloads at once while the buffer is low or the network weak: the next clips side by side. */
export const CLIP_BUFFER_URGENT_CONCURRENCY = 3
/**
 * Low-water mark, listening seconds ready ahead: below it the buffer is
 * topped up urgently (parallel downloads) long before anything is audible.
 */
export const CLIP_BUFFER_LOW_WATER_SECONDS = 45
/** Under this many listening seconds ahead, downloads go one at a time, nearest first, whatever else holds. */
export const CLIP_BUFFER_NEAREST_FIRST_SECONDS = 10
/** Under this many listening seconds ahead, with the next clip not here, the transport shows buffering. */
export const CLIP_BUFFER_DRY_SECONDS = 5
/** A download that has received no bytes for this long is stalled: aborted and resumed at once. */
export const CLIP_FETCH_STALL_MS = 3_000
/** Waits before each resume of a stalled download (then the last, repeated). */
export const CLIP_FETCH_RETRY_MS = [0, 500, 1_000, 2_000, 4_000]
/** A stall or a too-slow download marks the network weak for this long: wider window, parallel downloads. */
export const CLIP_BUFFER_WEAK_MS = 30_000
/** While weak, the window is this many times wider (never with Save-Data). */
export const CLIP_BUFFER_WEAK_FACTOR = 2
/** A download is judged for speed only after this long, so one slow first packet is not a verdict. */
const RATE_SAMPLE_MS = 2_000
/** How often the in-flight downloads are checked while any runs (fetch callbacks and the player's clock check too). */
const CHECK_MS = 1_000
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
  /** Bytes of the download so far (kept across a resume), and its size when the server said. */
  parts: Uint8Array[]
  received: number
  total?: number
  type?: string
  /** This attempt: when it started, when bytes last arrived, what it had then. */
  startedAt: number
  dataAt: number
  attemptReceived: number
  /** Stalled downloads resumed so far, and the earliest moment for the next. */
  retries: number
  notBefore: number
  /** Seconds of audio, when the player knows (judges a download's speed against playback). */
  duration?: number
  /** Aborted on purpose to resume: not a failure. */
  resuming?: boolean
}

/** What the buffer reports when it acts early (window `tinct:narration-buffer` events; counted nowhere). */
export interface ClipBufferSignal {
  kind: 'fetch-stalled' | 'fetch-slow' | 'low-water' | 'recovered'
  url?: string
  /** Listening seconds ready ahead when it fired. */
  aheadSeconds?: number
  retries?: number
}

export interface WantOptions {
  /** Listening seconds ready ahead of the playhead (the player's view). */
  aheadSeconds?: number
  /** Playback rate: a download slower than the audio it carries, at this rate, is too slow. */
  rate?: number
  /** Seconds of audio of each URL, when known. */
  durations?: Record<string, number | undefined>
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
  private weakUntil = 0
  private lowWater = false
  private rate = 1
  private aheadSeconds: number | undefined
  private checkTimer: ReturnType<typeof setTimeout> | undefined
  private pumpTimer: ReturnType<typeof setTimeout> | undefined
  /** Signals, for the reader's diagnostics and the gap harness. */
  onSignal: ((signal: ClipBufferSignal) => void) | null = defaultSignal

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

  /** The network looked weak lately (a stalled or too-slow download): the player widens its window. */
  get weak(): boolean {
    return Boolean(this.deps && this.deps.now() < this.weakUntil)
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
   * Everything else is dropped. Safe to call often (the player calls it from
   * its clock): each URL is fetched once, and each call also checks the
   * downloads in flight, so the checks run on a locked phone too, where
   * timers are throttled but media events still arrive.
   */
  want(urls: string[], retain: string[] = [], options: WantOptions = {}): void {
    if (!this.deps) return
    const now = this.deps.now()
    const kept = new Set([...urls, ...retain.filter(Boolean)])
    for (const [url, entry] of Array.from(this.entries.entries())) {
      if (!kept.has(url)) this.drop(url, entry)
    }
    this.order = urls
    if (typeof options.rate === 'number' && options.rate > 0) this.rate = options.rate
    this.aheadSeconds = options.aheadSeconds
    const low = typeof options.aheadSeconds === 'number' && options.aheadSeconds < CLIP_BUFFER_LOW_WATER_SECONDS && urls.some(url => !this.isReady(url))
    if (low && !this.lowWater) this.signal({ kind: 'low-water', aheadSeconds: options.aheadSeconds })
    this.lowWater = low
    for (const url of urls) {
      const entry = this.entries.get(url)
      const duration = options.durations?.[url]
      if (!entry) this.entries.set(url, { url, state: 'queued', bytes: 0, parts: [], received: 0, startedAt: 0, dataAt: 0, attemptReceived: 0, retries: 0, notBefore: 0, duration })
      else {
        if (duration) entry.duration = duration
        if (entry.state === 'failed' && now - (entry.failedAt ?? 0) >= RETRY_AFTER_MS) entry.state = 'queued'
      }
    }
    this.check()
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
    clearTimeout(this.checkTimer)
    clearTimeout(this.pumpTimer)
    this.checkTimer = undefined
    this.pumpTimer = undefined
  }

  /**
   * Early warning on the downloads in flight: one that has received nothing
   * for CLIP_FETCH_STALL_MS is aborted and resumed from its last byte at once
   * (short back-off); one slower than the audio it carries marks the network
   * weak. Both happen while the player still has its buffer to play.
   */
  check(): void {
    const deps = this.deps
    if (!deps) return
    const now = deps.now()
    for (const entry of this.entries.values()) {
      if (entry.state !== 'loading') continue
      if (now - entry.dataAt >= CLIP_FETCH_STALL_MS) {
        this.weakUntil = now + CLIP_BUFFER_WEAK_MS
        entry.resuming = true
        entry.notBefore = now + CLIP_FETCH_RETRY_MS[Math.min(entry.retries, CLIP_FETCH_RETRY_MS.length - 1)]
        entry.retries += 1
        this.signal({ kind: 'fetch-stalled', url: entry.url, aheadSeconds: this.aheadSeconds, retries: entry.retries })
        entry.controller?.abort()
        continue
      }
      const elapsed = now - entry.startedAt
      if (entry.duration && entry.total && elapsed >= RATE_SAMPLE_MS && entry.received < entry.total) {
        const bytesPerSecond = ((entry.received - entry.attemptReceived) * 1000) / elapsed
        const needed = (entry.total / entry.duration) * this.rate
        if (bytesPerSecond < needed && now >= this.weakUntil) {
          this.weakUntil = now + CLIP_BUFFER_WEAK_MS
          this.signal({ kind: 'fetch-slow', url: entry.url, aheadSeconds: this.aheadSeconds })
        }
      }
    }
    this.armCheck()
  }

  private armCheck(): void {
    if (this.checkTimer !== undefined || !Array.from(this.entries.values()).some(entry => entry.state === 'loading')) return
    this.checkTimer = setTimeout(() => { this.checkTimer = undefined; this.check(); this.pump() }, CHECK_MS)
  }

  private signal(signal: ClipBufferSignal): void {
    try { this.onSignal?.(signal) } catch { /* diagnostics only */ }
  }

  private drop(url: string, entry: Entry): void {
    entry.resuming = false
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
    const now = deps.now()
    // Side by side only while the nearest clip is not critical yet: on a thin
    // link, parallel downloads share the bandwidth and the next clip, the one
    // that decides whether a boundary is silent, would arrive later.
    const nearestFirst = typeof this.aheadSeconds === 'number' && this.aheadSeconds < CLIP_BUFFER_NEAREST_FIRST_SECONDS
    const limit = !nearestFirst && (this.lowWater || now < this.weakUntil) ? CLIP_BUFFER_URGENT_CONCURRENCY : CONCURRENCY
    let wake = Infinity
    while (this.active < limit) {
      if (this.bytes >= deps.maxBytes) return
      const queued = this.order.map(url => this.entries.get(url)).filter((entry): entry is Entry => entry?.state === 'queued')
      const next = queued.find(entry => entry.notBefore <= now)
      if (!next) {
        for (const entry of queued) wake = Math.min(wake, entry.notBefore)
        break
      }
      this.load(next, deps)
    }
    if (wake < Infinity && this.pumpTimer === undefined) {
      this.pumpTimer = setTimeout(() => { this.pumpTimer = undefined; this.pump() }, Math.max(0, wake - now))
    }
  }

  private load(entry: Entry, deps: ClipBufferDeps): void {
    entry.state = 'loading'
    entry.resuming = false
    const now = deps.now()
    entry.startedAt = now
    entry.dataAt = now
    entry.attemptReceived = entry.received
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
    entry.controller = controller
    this.active += 1
    const current = () => this.entries.get(entry.url) === entry && entry.controller === controller
    const settle = () => {
      this.active -= 1
      if (entry.controller === controller) entry.controller = undefined
      this.pump()
    }
    // A resumed download asks only for the bytes it lacks.
    const resumeFrom = entry.received
    const headers = resumeFrom > 0 ? { Range: `bytes=${resumeFrom}-` } : undefined
    this.armCheck()
    void Promise.resolve()
      .then(() => deps.fetch(entry.url, { cache: 'force-cache', credentials: 'same-origin', ...(headers ? { headers } : {}), ...(controller ? { signal: controller.signal } : {}) }))
      .then(async (response) => {
        if (!response?.ok) throw new Error(String(response?.status))
        if (!deps.createObjectURL) {
          // No blob: URLs here: the download still warms the HTTP cache the element reads from.
          await response.arrayBuffer()
          if (current()) entry.state = 'ready'
          return
        }
        let blob: Blob
        const reader = response.body && typeof response.body.getReader === 'function' ? response.body.getReader() : null
        if (reader) {
          if (resumeFrom > 0 && response.status !== 206) { entry.parts = []; entry.received = 0; entry.attemptReceived = 0 }
          const length = Number(response.headers?.get?.('content-length'))
          if (Number.isFinite(length) && length > 0) entry.total = entry.received + length
          entry.type = response.headers?.get?.('content-type') || entry.type
          for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            if (!current()) { try { await reader.cancel() } catch { /* ignore */ } return }
            if (value?.length) {
              entry.parts.push(value)
              entry.received += value.length
              entry.dataAt = deps.now()
            }
          }
          blob = new Blob(entry.parts as BlobPart[], { type: entry.type && entry.type.startsWith('audio/') ? entry.type : 'audio/mpeg' })
        } else {
          blob = typeof response.blob === 'function'
            ? await response.blob()
            : new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' })
        }
        if (!blob || blob.size === 0) throw new Error('empty')
        if (!current()) return
        const typed = blob.type && blob.type.startsWith('audio/') ? blob : new Blob([blob], { type: 'audio/mpeg' })
        entry.parts = []
        entry.objectUrl = deps.createObjectURL(typed)
        sourceOrigins.set(entry.objectUrl, entry.url)
        entry.bytes = typed.size
        entry.state = 'ready'
        if (entry.retries > 0) this.signal({ kind: 'recovered', url: entry.url, aheadSeconds: this.aheadSeconds, retries: entry.retries })
      })
      .catch(() => {
        if (this.entries.get(entry.url) !== entry) return
        if (entry.resuming) {
          // Aborted by the stall check: resume (from the last byte) after the back-off.
          entry.state = 'queued'
          return
        }
        if (entry.controller !== controller) return
        // Never in the way of playback: the element streams the URL itself.
        entry.state = 'failed'
        entry.failedAt = deps.now()
        entry.parts = []
        entry.received = 0
      })
      .finally(settle)
  }
}

/** Signals go to the page as `tinct:narration-buffer` events: nothing listens in the app; the gap harness does. */
function defaultSignal(signal: ClipBufferSignal): void {
  if (typeof window === 'undefined' || typeof CustomEvent !== 'function') return
  window.dispatchEvent(new CustomEvent('tinct:narration-buffer', { detail: { ...signal, at: new Date().getTime() } }))
}
