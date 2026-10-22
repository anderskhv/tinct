/**
 * Listen in the margin preview: the book reader's own player (useLabListen,
 * with its clip buffer, stall recovery, lock screen and speed), run here in
 * the page that frames the margin reader, and handed to the frame as a small
 * same-origin API (`window.TinctMarginPreview.listen`). The frame
 * (public/lab/addbook/js/tinct-listen.js) draws Play, the transport and the
 * follow highlight from its snapshots and calls back with places.
 *
 * Why here and not in the frame: the player is a React hook with its own
 * lifecycle, the media element and the Media Session belong to the top page
 * (the lock screen, AirPods and the media keys reach that one), and a second
 * player in plain JS would be a second engine to keep in step. The frame is
 * same-origin, so a direct API needs no message protocol.
 *
 * Nothing is generated beyond the player's own capped play-ahead (its ensure
 * calls and look-ahead while playing); the book reader's next-chapter warming
 * (useNarrationPrefetch) is deliberately not run here. A next chapter's opening
 * already cached on this device still bridges the chapter end.
 * Where listening stops is written as the book reader's place for the book
 * on this device (marginListenModel withAudioPlace), so the book reader
 * resumes there.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getBook } from '../../data/bookRegistry'
import { readSupabaseAccessToken } from '../labAuth'
import { ensureNarration, fetchNarrationPilotInfo, type NarrationPilotInfo } from '../labNarration'
import { LAB_PREFS_KEY, parseLabPrefs, writeLabPrefs, type LabPrefs } from '../labPrefs'
import { loadLabBookSource, nextLabChapter, type LabSource } from '../labSource'
import { readLabDeviceId, readLabPositionLocal, writeLabPositionLocal } from '../labPositionStore'
import { readNarrationReplay, storeNarrationReplay } from '../narrationReplayCache'
import { narrationBridgeUrls, useLabListen } from '../useLabListen'
import { useLabListenReport } from '../useLabListenReport'
import { heardPlace, marginListenSnapshot, marginNarrationPlan, marginVoiceChoices, withAudioPlace, withMarginVoice, type MarginListenAt, type MarginListenSnapshot, type MarginVoiceChoices } from './marginListenModel'

/** The frame's way to the player (MarginPreview.tsx puts it on window.TinctMarginPreview). */
export interface MarginListenApi {
  snapshot: () => MarginListenSnapshot
  /** Called with every new snapshot; -> unsubscribe. */
  subscribe: (listener: (snapshot: MarginListenSnapshot) => void) => () => void
  /** Play from this place (or, already loaded in this chapter, move the playing narration there). */
  play: (at: MarginListenAt) => void
  /** Paused with a recording loaded: go on from the start of the sentence heard. -> false when there is nothing to resume. */
  resume: () => boolean
  pause: () => void
  /** Seconds back (negative) or forward. */
  skip: (seconds: number) => void
  /** To this many seconds into the chapter (the transport's slider). */
  seekChapter: (seconds: number) => void
  setSpeed: (rate: number) => void
  /** Audio settings' Voice: the choices and the one chosen, as the book reader offers them. */
  voices: () => MarginVoiceChoices
  setVoice: (value: string) => void
  /** Put the transport away; the place is kept. */
  stop: () => void
}

/** How often the place heard is kept while listening (the book reader keeps its place at least this often). */
export const MARGIN_LISTEN_PLACE_MS = 10_000

interface Request { chapterNumber: number; paragraphIndex: number; wordIndex: number; mode: 'place' | 'start' }

function readPrefs(): LabPrefs {
  let raw: unknown = null
  try { raw = JSON.parse(localStorage.getItem(LAB_PREFS_KEY) || 'null') } catch { /* defaults */ }
  return parseLabPrefs(raw, 'desktop')
}

export function useMarginListen(input: { bookId: string; editionKey: string | null; chapterTitles?: Map<number, string> }): MarginListenApi {
  const { bookId, editionKey } = input
  const book = getBook(bookId)
  const editions = useMemo(() => book?.editions ?? [], [book])
  const [prefs, setPrefs] = useState(readPrefs)
  const [token, setToken] = useState<string | null | undefined>(undefined)
  const [info, setInfo] = useState<NarrationPilotInfo | null>(null)
  const [source, setSource] = useState<LabSource | null>(null)
  const [request, setRequest] = useState<Request | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    void readSupabaseAccessToken().then(t => { if (!cancelled) setToken(t ?? null) }, () => { if (!cancelled) setToken(null) })
    void fetchNarrationPilotInfo().then(i => { if (!cancelled) setInfo(i) })
    return () => { cancelled = true }
  }, [])

  // The chapter asked for decides the plan (a chapter outside the narration's scope cannot be heard).
  const chapterNumber = request?.chapterNumber ?? source?.chapterNumber ?? 1
  // Until the server's narration configuration is known nothing is decided (the book reader waits the same way).
  const plan = useMemo(() => editionKey && info
    ? marginNarrationPlan({ bookId, editions, editionKey, chapterNumber, prefs, info, signedIn: Boolean(token) })
    : null, [bookId, editions, editionKey, chapterNumber, prefs, info, token])

  // The chapter the player holds: loaded as the book reader loads it (its follow timings, its title clip).
  const loadingRef = useRef<string | null>(null)
  useEffect(() => {
    if (!request || !editionKey || !plan) return
    if (source && source.chapterNumber === request.chapterNumber) return
    const key = `${editionKey}:${plan.audioEdition}:${request.chapterNumber}`
    if (loadingRef.current === key) return
    loadingRef.current = key
    void loadLabBookSource({ bookId, primaryEditionKey: editionKey, audioEditionKey: plan.narration ? undefined : plan.audioEdition, chapterNumber: request.chapterNumber })
      .then(loaded => { if (loadingRef.current === key) setSource(loaded) })
      .catch(() => { if (loadingRef.current === key) { loadingRef.current = null; setRequest(null) } })
  }, [request, source, editionKey, plan, bookId])

  const voice = plan?.voice ?? null
  const identity = info?.voices.find(v => v.key === voice)?.cacheIdentity ?? null
  const contextRef = useRef({ bookId, editionKey: editionKey ?? '', chapter: chapterNumber, paragraphs: source?.paragraphs ?? [], voice, identity, token })
  contextRef.current = { bookId, editionKey: editionKey ?? '', chapter: source?.chapterNumber ?? chapterNumber, paragraphs: source?.paragraphs ?? [], voice, identity, token }
  const prepared = useCallback(() => {
    const c = contextRef.current
    return readNarrationReplay(c)
  }, [])
  const ensure = useCallback(async (indexes: number[], signal: AbortSignal, mode?: 'next' | 'all', fromChunks?: Record<number, number>) => {
    const c = contextRef.current
    if (!c.voice) return []
    const authToken = c.token ?? await readSupabaseAccessToken()
    const results = await ensureNarration({
      bookId: c.bookId, editionKey: c.editionKey, chapter: c.chapter, voice: c.voice,
      paragraphs: indexes.filter(i => i >= 0 && i < c.paragraphs.length).map(index => ({ index, text: c.paragraphs[index], fromChunk: fromChunks?.[index] })),
      mode: mode ?? 'next',
    }, { signal, authToken })
    if (!signal.aborted) storeNarrationReplay(c, results)
    return results
  }, [])
  const narration = useMemo(() => (plan?.narration && voice ? { voice, ensure, prepared } : null), [plan?.narration, voice, ensure, prepared])

  const chapterCompleteRef = useRef<() => boolean>(() => false)
  const nextChapterAudioRef = useRef<() => { chapterNumber: number; urls: string[] } | null>(() => null)
  const listen = useLabListen({
    guardPlaybackRequests: true,
    playbackUnavailable: !plan || plan.unavailable || !source,
    bookId,
    bookTitle: book?.title,
    chapterTitle: source?.chapterLabel,
    coverSrc: `/covers/v2/${bookId}.webp`,
    paragraphs: source?.paragraphs ?? EMPTY,
    followParagraphs: source?.followParagraphs ?? EMPTY_FOLLOW,
    chapterNumber: source?.chapterNumber,
    audioEdition: plan?.audioEdition,
    narration,
    playbackSpeed: prefs.audioSpeed,
    onPlaybackSpeedChange: (audioSpeed) => {
      const next = { ...readPrefs(), audioSpeed }
      writeLabPrefs(next, 'desktop')
      setPrefs(next)
    },
    titleClip: source?.audioTitle,
    onChapterComplete: () => chapterCompleteRef.current(),
    nextChapterAudio: () => nextChapterAudioRef.current(),
  })
  const listenRef = useRef(listen)
  const infoRef = useRef(info)
  infoRef.current = info
  listenRef.current = listen
  const sourceRef = useRef(source)
  sourceRef.current = source

  // The chapter heard to its end: the next one plays from its start, on the same element (handoffChapter).
  chapterCompleteRef.current = () => {
    if (!source) return false
    const next = nextLabChapter(source.chapters, source.chapterNumber)
    if (next == null) return false
    listenRef.current.handoffChapter()
    setRequest({ chapterNumber: next, paragraphIndex: 0, wordIndex: 0, mode: 'start' })
    return true
  }
  nextChapterAudioRef.current = () => {
    if (!narration || !source) return null
    const next = nextLabChapter(source.chapters, source.chapterNumber)
    if (next == null) return null
    const scope = { ...contextRef.current, chapter: next }
    const urls = narrationBridgeUrls(readNarrationReplay(scope))
    return urls.length > 0 ? { chapterNumber: next, urls } : null
  }

  // A chapter that cannot be heard (outside the narration's scope, held) is not waited for.
  useEffect(() => {
    if (!request || !plan?.unavailable || startedRef.current === request) return
    if (listenRef.current.playing) listenRef.current.stop()
    setRequest(null)
  }, [request, plan])

  // Once the chapter asked for is the one loaded, the player starts at the place asked for.
  const startedRef = useRef<Request | null>(null)
  useEffect(() => {
    if (!request || !source || source.chapterNumber !== request.chapterNumber || startedRef.current === request) return
    if (!plan || plan.unavailable) return
    startedRef.current = request
    const place = { paragraphIndex: request.paragraphIndex, wordIndex: request.wordIndex }
    void (request.mode === 'start' ? listenRef.current.start(place) : listenRef.current.startAtPlace(place))
  }, [request, source, plan])

  const playingChapter = source?.chapterNumber ?? null
  const heard = heardPlace(playingChapter, listen.follow)
  const heardRef = useRef(heard)
  if (heard) heardRef.current = heard

  // The audio place, kept as the book reader's place: when listening stops (here, the lock screen, a stall that
  // gives up), while it plays, and as the page goes away.
  const writePlace = useCallback(() => {
    const at = heardRef.current
    if (!at || !editionKey) return
    try {
      const deviceId = readLabDeviceId()
      writeLabPositionLocal(withAudioPlace(readLabPositionLocal(deviceId), { bookId, editionKey, at, now: Date.now(), deviceId }))
    } catch { /* storage unavailable: the book reader keeps its own place */ }
  }, [bookId, editionKey])
  const wasPlayingRef = useRef(false)
  useEffect(() => {
    if (wasPlayingRef.current && !listen.playing) writePlace()
    wasPlayingRef.current = listen.playing
    if (!listen.playing) return
    const timer = setInterval(writePlace, MARGIN_LISTEN_PLACE_MS)
    const hide = () => { if (document.visibilityState === 'hidden') writePlace() }
    addEventListener('pagehide', writePlace)
    document.addEventListener('visibilitychange', hide)
    return () => { clearInterval(timer); removeEventListener('pagehide', writePlace); document.removeEventListener('visibilitychange', hide) }
  }, [listen.playing, writePlace])

  useLabListenReport(listen.playing, bookId)

  const snapshot = marginListenSnapshot({
    available: plan && info ? !plan.unavailable : null,
    playing: listen.playing,
    pending: listen.pending,
    buffering: listen.buffering,
    hasSource: Boolean(listen.src),
    speed: listen.speed,
    chapterNumber: playingChapter ?? request?.chapterNumber ?? null,
    chapterTitle: source?.chapterLabel ?? input.chapterTitles?.get(request?.chapterNumber ?? -1) ?? '',
    follow: listen.follow,
    chapterTime: listen.chapterTime,
    chapterDuration: listen.chapterDuration,
    narration: listen.narration,
    starting: Boolean(request && startedRef.current !== request),
    dismissed,
  })
  const snapshotRef = useRef(snapshot)
  snapshotRef.current = snapshot
  const listenersRef = useRef(new Set<(s: MarginListenSnapshot) => void>())
  const signature = JSON.stringify(snapshot)
  useEffect(() => {
    for (const listener of listenersRef.current) {
      try { listener(snapshotRef.current) } catch { /* a frame that went away */ }
    }
  }, [signature])

  return useMemo<MarginListenApi>(() => ({
    snapshot: () => snapshotRef.current,
    subscribe: (listener) => {
      listenersRef.current.add(listener)
      return () => { listenersRef.current.delete(listener) }
    },
    play: (at) => {
      if (snapshotRef.current.available === false) return
      setDismissed(false)
      const l = listenRef.current
      const loaded = sourceRef.current?.chapterNumber === at.chapterNumber
      if (loaded && l.src && l.playing) { l.seekToPlace(at.paragraphIndex, at.wordIndex); return }
      if (l.playing || l.isPending()) l.pause()
      startedRef.current = null
      setRequest({ ...at, mode: 'place' })
    },
    resume: () => {
      const l = listenRef.current
      if (!l.src) return false
      setDismissed(false)
      return l.resume(true) !== false
    },
    pause: () => { listenRef.current.pause() },
    skip: (seconds) => { listenRef.current.seek(seconds) },
    seekChapter: (seconds) => { listenRef.current.seekChapter(seconds) },
    setSpeed: (rate) => { listenRef.current.setSpeed(rate) },
    voices: () => marginVoiceChoices(readPrefs(), infoRef.current?.provider),
    setVoice: (value) => {
      const next = withMarginVoice(readPrefs(), value)
      writeLabPrefs(next, 'desktop')
      setPrefs(next)
    },
    stop: () => {
      const l = listenRef.current
      if (l.playing || l.isPending()) l.pause()
      writePlace()
      setDismissed(true)
    },
  }), [writePlace])
}

const EMPTY: string[] = []
const EMPTY_FOLLOW: never[] = []
