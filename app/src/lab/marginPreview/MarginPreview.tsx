/**
 * /reader?book=<id>&margin=1: a registered book in the margin reader, as a
 * preview for testing (Anders, 2026-10-19). The margin reader is the static
 * page at /lab/addbook/book (book.html), shown full screen in a same-origin frame so the
 * address stays /reader. The page asks this one for the book
 * (`window.TinctMarginPreview.load()`, js/tinct-book.js) and leaves through
 * the top window ("Back to normal reader", the library).
 *
 * The book reader (LabApp) is not mounted. What the margin view keeps goes through the book reader's own stores
 * (MarginPreviewSync, mounted once the book is loaded): the place, highlights and notes, cards.
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getBook } from '../../data/bookRegistry'
import { useAuth } from '../../hooks/useAuth'
import { readSupabaseAccessToken } from '../labAuth'
import { useLabReadingYear } from '../useLabReadingYear'
import { ownBookFrameUrl, userBookId } from '../userBook/userBookId'
import { LAB_PREFS_KEY, parseLabPrefs } from '../labPrefs'
import { marginPreviewAtForPage } from './marginPreviewFlag'
import { loadMarginPreviewBookParts, type MarginPreviewParts } from './marginPreviewLoad'
import { marginPreviewMenu, type MarginPreviewMenuApi } from './marginPreviewMenu'
import type { MarginNavApi, MarginNavBook, MarginNavRequest } from './MarginPreviewNav'
import { MarginPreviewSync, type MarginPreviewSyncBridge } from './MarginPreviewSync'
import { useMarginListen, type MarginListenApi } from './useMarginListen'
import { useMarginTalk, type MarginTalkApi } from './MarginTalk'
import {
  marginPreviewCompareEdition,
  marginPreviewLayoutHref,
  marginPreviewPaper,
  normalReaderHref,
  type MarginPreviewBook,
  type MarginPreviewPaper,
  type MarginPreviewPlace,
  type MarginPreviewView,
} from './marginPreviewModel'

import { marginPreviewFrameSrc } from './marginPreviewFrame'
export { MARGIN_PREVIEW_FRAME_SRC, marginPreviewFrameSrc } from './marginPreviewFrame'

// The book reader's Reading now and Contents over the frame (the title and the chapter pill), fetched on first use.
const MarginPreviewNav = lazy(() => import('./MarginPreviewNav'))

declare global {
  interface Window {
    TinctMarginPreview?: {
      /** A registered book's id, or a reader's own book's (`userbook-<hex>`: MarginOwnBook, no load, paper or layouts). */
      bookId: string
      load?: () => Promise<MarginPreviewBook>
      /**
       * The first chapter first (22 Oct 2026): the chapters at the place, as soon as they are in, the others pending
       * (MarginPreviewBook.partial); null when the book opens whole. `load` stays the whole book.
       */
      first?: () => Promise<MarginPreviewBook | null>
      /** The desktop paper for a window this wide: the book reader's text, as it sets it now. */
      paper?: (viewportWidth: number) => MarginPreviewPaper
      /** Two-page or Compare: the book reader at this place, in that layout. */
      layoutHref?: (view: MarginPreviewView, place: MarginPreviewPlace) => string
      /** A reader's own book (MarginOwnBook): the frame tells this page it opened, and each of the reader's actions. */
      own?: MarginOwnBridge
      /** The account's sync (MarginPreviewSync), once the book is loaded; null before and after. */
      sync?: MarginPreviewSyncBridge | null
      /** Listen: the book reader's player, run in this page (useMarginListen.ts; the frame's js/tinct-listen.js). */
      listen?: MarginListenApi
      /** Talk: the book reader's voice session and call, run in this page (MarginTalk.tsx); the frame's Chat keeps the turns. */
      talk?: MarginTalkApi
      /** The t menu's Profile and Reading settings (marginPreviewMenu.ts). */
      menu?: MarginPreviewMenuApi
      /** The title and the chapter pill: the book reader's Reading now and Contents (MarginPreviewNav.tsx). */
      nav?: MarginNavApi
    }
  }
}

/** The book reader's desktop preferences on this device, read only. */
function desktopPrefs() {
  let raw: unknown = null
  try { raw = JSON.parse(localStorage.getItem(LAB_PREFS_KEY) || 'null') } catch { /* defaults */ }
  return parseLabPrefs(raw, 'desktop')
}

/** What the frame of a reader's own book tells this page (js/tinct-book.js, its own-book part). */
export interface MarginOwnBridge {
  /** The book is open in the frame, at its restored place: reading time counts from here. */
  opened(): void
  /** The reader did something in the frame (a tap, key, wheel or touch), or it is reading aloud: active reading. */
  active(): void
}

export function marginPreviewBridge(bookId: string, pending: Promise<MarginPreviewBook>, listen?: MarginListenApi, first?: Promise<MarginPreviewBook | null>): NonNullable<Window['TinctMarginPreview']> {
  const book = getBook(bookId)
  return {
    bookId,
    ...(listen ? { listen } : {}),
    load: () => pending,
    first: () => first ?? Promise.resolve(null),
    menu: marginPreviewMenu(bookId, pending),
    paper: width => marginPreviewPaper(desktopPrefs(), width, { shakespeare: book?.author === 'William Shakespeare' }),
    layoutHref: (view, place) => marginPreviewLayoutHref(bookId, view, place, book ? marginPreviewCompareEdition(book, desktopPrefs(), place.editionKey) : undefined),
  }
}

/** The margin reader's window in this page, for Talk's turns. */
const frameWindow = () => (document.querySelector('iframe[data-testid="margin-preview-frame"]') as HTMLIFrameElement | null)?.contentWindow ?? null
/** The account cards (with Premium and sign-in) over the book: what the book reader's account sheet is. */
function openAccount() {
  let dark = false
  try { dark = !!frameWindow()?.document.querySelector('.lab.is-night') } catch { /* the frame's look stays unknown */ }
  void import('../../cards/openCards').then(cards => cards.accountCardsOpen() || cards.openAccountCards({ start: 'you', dark, deskTop: 76 })).catch(() => { /* offline: nothing opened */ })
}

export function MarginPreview({ bookId, load = loadMarginPreviewBookParts, frame = null }: { bookId: string; load?: (bookId: string, deps: Parameters<typeof loadMarginPreviewBookParts>[1]) => MarginPreviewParts; frame?: HTMLIFrameElement | null }) {
  const [failed, setFailed] = useState(false)
  // One load per page, shared with the frame (it may ask before or after this renders): the chapters at the place
  // first, then the whole book (the first chapter first, 22 Oct 2026).
  const parts = useMemo(() => {
    const task = load(bookId, { readToken: readSupabaseAccessToken, at: marginPreviewAtForPage() })
    task.full.catch(() => setFailed(true))
    return task
  }, [bookId, load])
  const pending = parts.full
  // The sync outlives the bridge object (rebuilt as Listen changes): kept here and put on each one.
  const syncRef = useRef<MarginPreviewSyncBridge | null>(null)
  const onBridge = useCallback((sync: MarginPreviewSyncBridge | null) => {
    syncRef.current = sync
    if (window.TinctMarginPreview?.bookId === bookId) window.TinctMarginPreview.sync = sync
  }, [bookId])
  const [shown, setShown] = useState<MarginPreviewBook | null>(null)
  useEffect(() => {
    let current = true
    pending.then(model => { if (current) setShown(model) }, () => {})
    return () => { current = false }
  }, [pending])
  const chapterTitles = useMemo(() => new Map((shown?.chapters ?? []).map(c => [c.number, c.title])), [shown])
  // The edition the frame shows is the one heard.
  const listen = useMarginListen({ bookId, editionKey: shown?.editionKey ?? null, chapterTitles })
  const { user: talkUser } = useAuth()
  const talk = useMarginTalk({ bookId, editionKey: shown?.editionKey ?? null, privateBook: false, frame: frameWindow, signedIn: Boolean(talkUser), onAccount: openAccount, pauseListen: () => listen.pause() })
  const [navRequest, setNavRequest] = useState<MarginNavRequest | null>(null)
  const nav = useMemo<MarginNavApi>(() => ({ open: request => setNavRequest(request) }), [])
  const closeNav = useCallback(() => setNavRequest(null), [])
  useEffect(() => {
    window.TinctMarginPreview = { ...marginPreviewBridge(bookId, pending, listen, parts.first), sync: syncRef.current, nav, talk: talk.api }
    const title = getBook(bookId)?.title
    if (title) document.title = `${title} · Margin preview · Tinct`
    return () => { if (window.TinctMarginPreview?.bookId === bookId) delete window.TinctMarginPreview }
  }, [bookId, pending, listen, parts.first, nav, talk.api])
  // The frame main.tsx started before this chunk loaded (marginPreviewFrame.ts) is this one's; it goes with an error.
  useEffect(() => { if (failed) frame?.remove() }, [failed, frame])
  if (failed) {
    return (
      <main data-testid="margin-preview-error" style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <p>This book could not open in the margin preview.</p>
        <p><a href={normalReaderHref(bookId)}>Open it in the normal reader</a></p>
      </main>
    )
  }
  return (
    <>
    {shown && shown.bookId === bookId ? <MarginPreviewSync model={shown} onBridge={onBridge} /> : null}
    {talk.surface}
    {frame ? null : <iframe
      data-testid="margin-preview-frame"
      title="Margin preview"
      src={marginPreviewFrameSrc(bookId)}
      allow="fullscreen; clipboard-write"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, display: 'block', background: 'var(--paper, #ece7db)' }}
    />}
    {navRequest && shown && shown.bookId === bookId ? <Suspense fallback={null}><MarginPreviewNav model={shown} request={navRequest} onDone={closeNav} /></Suspense> : null}
    </>
  )
}

/** The frame's address and what it carries: the margin reader's page for this own book (userBookId.ts ownBookFrameUrl). */
export const MARGIN_OWN_FRAME_PATH = '/lab/addbook/book'

/** The book Reading now and Contents show for an own book: what the frame says of it (reader.js previewNav). */
export function marginOwnNavBook(hex: string, request: MarginNavRequest): MarginNavBook | null {
  const book = request.book
  if (!book) return null
  return { bookId: userBookId(hex), title: book.title, editionKey: 'own', editionLabel: '', chapters: book.chapters, cover: book.cover }
}

/** The reader URL without what only the first open needed (Original pages' `page` and `frac`): a reload opens at the kept place. */
export function marginOwnAddress(search: string): string {
  const params = new URLSearchParams(search)
  params.delete('page')
  params.delete('frac')
  const query = params.toString()
  return `/reader${query ? `?${query}` : ''}`
}

/**
 * A reader's own book on the desktop, in the same shell as Tinct's books (Anders, 22 Oct 2026, "One Tinct"):
 * the margin reader's page in a full-screen frame (its top bar, Aa, Notebook, t menu, pop-ups), the address
 * /reader?userBook=<hex>. The title and the chapter pill open the book reader's Reading now and Contents over
 * it (MarginPreviewNav, from the chapters the frame sends). Reading time counts as the book reader counts an own
 * book's (useLabReadingYear: no pages, the private bucket only), from the frame's opened and active signals.
 *
 * The frame keeps everything of the book itself, as it did on its own page: the place (and a PDF's account
 * place), marks, cards. This page reads and writes none of it. Leaving goes through this window: the frame's
 * own navigations are sent here (js/tinct-book.js), and a frame that still left its page is followed.
 */
export function MarginOwnBook({ hex, search }: { hex: string; search: string }) {
  const bookId = userBookId(hex)
  const { user } = useAuth()
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const [opened, setOpened] = useState(false)
  const listeningRef = useRef(false)
  // Reading time: the book reader's own counter, as LabApp runs it for an own book (onCover: no pages; the
  // private bucket). Paused until the frame has opened the book; it never reads a place.
  useLabReadingYear({ userId: user?.id ?? null, bookId, chapter: 1, page: 0, onCover: true, paused: !opened, listeningRef, privateBook: true })
  const src = useMemo(() => ownBookFrameUrl(hex, search), [hex, search])
  const [navRequest, setNavRequest] = useState<MarginNavRequest | null>(null)
  const nav = useMemo<MarginNavApi>(() => ({ open: request => setNavRequest(request) }), [])
  const closeNav = useCallback(() => setNavRequest(null), [])
  const own = useMemo<MarginOwnBridge>(() => ({
    opened: () => setOpened(true),
    // The reading year hears the reader's actions on this window; the frame's are its own (as useMarginPreviewPlace).
    active: () => { window.dispatchEvent(new Event('pointerdown')) },
  }), [])
  // Listen: the book reader's player and Tinct's voice for an own book too (Anders, 22 Oct 2026), its text handed over by
  // the frame (js/tinct-listen.js, reader.js ownListen); its listening counts as reading time, as in the book reader.
  // Not Premium (402): the account cards, with their Premium offer, open over the book (the book reader's account sheet).
  const ownListen = useMemo(() => ({
    hex,
    onPremiumRequired: openAccount,
  }), [hex])
  const listen = useMarginListen({ bookId, editionKey: 'own', own: ownListen })
  useEffect(() => listen.subscribe(snapshot => { listeningRef.current = snapshot.playing }), [listen])
  // Talk: the book reader's, on the passage on screen only (no id, no edition goes out).
  const talk = useMarginTalk({ bookId, editionKey: null, privateBook: true, frame: frameWindow, signedIn: Boolean(user), onAccount: openAccount, pauseListen: () => listen.pause() })
  useEffect(() => {
    window.TinctMarginPreview = { bookId, nav, own, listen, talk: talk.api }
    return () => { if (window.TinctMarginPreview?.bookId === bookId) delete window.TinctMarginPreview }
  }, [bookId, nav, own, listen, talk.api])
  // The address is the book's one address; what only the first open needed is dropped (a reload keeps the place).
  useEffect(() => {
    try {
      const next = marginOwnAddress(window.location.search)
      if (next !== window.location.pathname + window.location.search) window.history.replaceState(window.history.state, '', next + window.location.hash)
    } catch { /* the address stays */ }
  }, [])
  // The frame's title (the book's) is this page's; a frame that left its page anyway is followed by this window.
  const onLoad = useCallback(() => {
    const frame = frameRef.current
    let doc: Document | null = null
    let href = ''
    try { doc = frame?.contentDocument ?? null; href = frame?.contentWindow?.location.href ?? '' } catch { return }
    if (!doc || !href || href === 'about:blank') return
    const at = new URL(href)
    if (at.pathname !== MARGIN_OWN_FRAME_PATH) { window.location.assign(at.pathname + at.search + at.hash); return }
    const title = () => { if (doc!.title) document.title = doc!.title }
    title()
    try { new MutationObserver(title).observe(doc.head, { subtree: true, childList: true, characterData: true }) } catch { /* the first title stays */ }
  }, [])
  const navBook = navRequest ? marginOwnNavBook(hex, navRequest) : null
  return (
    <>
    <iframe
      ref={frameRef}
      data-testid="margin-preview-frame"
      title="Your book"
      src={src}
      onLoad={onLoad}
      allow="fullscreen; clipboard-write"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, display: 'block', background: 'var(--paper, #ece7db)' }}
    />
    {navRequest && navBook ? <Suspense fallback={null}><MarginPreviewNav model={navBook} request={navRequest} onDone={closeNav} /></Suspense> : null}
    {talk.surface}
    </>
  )
}
