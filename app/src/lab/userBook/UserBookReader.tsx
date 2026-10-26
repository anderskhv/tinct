import type { PdfConversionProgress } from './pdfEdition'
/**
 * `/reader?userBook=<hex>`: a reader's own book, at its one address (Anders, 22 Oct 2026, "One Tinct").
 * Opens this account's file from this device (converting it the first time), or
 * the account's private copy when it is not on this device or the copy here
 * is damaged (userBookStore.ts). The place is reconciled with the account's
 * (ownSync.ts: the later read wins) before the reader draws its first page.
 * A text PDF opens here as its Tinct text (converted on this device, its
 * place shared with Original pages: pdfEditions.ts).
 *
 * The margin reader's books (an EPUB in Margin view, the desktop's default; a PDF read in Original pages; a
 * scan without text; a book not on this device yet; a link asking for the pages, `&pages`): on a desktop the
 * margin reader opens here, in the same shell as Tinct's books (MarginPreview.tsx MarginOwnBook: the frame at
 * /lab/addbook/book, the book reader's Reading now and Contents over it, reading time); the address stays
 * /reader?userBook=<hex>. The frame is then the only writer of the place: it reconciles a PDF's with the
 * account as it opens (reader.js placeSync), as it did on its own page; nothing here reads or writes it.
 * A phone goes on to the margin reader's page itself (/lab/addbook/book?userBook=<hex>), as before.
 */
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { LabApp } from '../LabApp'
import { LabWait } from '../LabWait'
import { ownBookFrameUrl, USER_BOOKS_SHELF_URL } from './userBookId'
import { MARGIN_PREVIEW_KEY, MARGIN_PREVIEW_PARAM } from '../marginPreview/marginPreviewFlag'
import { registerUserBook } from './userBookSource'
import { hasOwnedPdfText, loadOwnedPdfBytes, openUserBook, readOwnedBookFileId, readOwnedPdfScanEntries, type LoadedUserBook, type UserBookOpenResult } from './userBookStore'
import { reconcileOpenPlace, reconcilePdfPlace } from './ownSync'
import { PDF_EDITION_PREFIX, readPdfTextPlace } from './pdfEditions'
import { epubViewHere, readEpubPlace, type EpubView } from './epubView'
import { registerFigureAssets } from '../labFigures'
import { readLabHighlights } from '../labHighlights'
import { adoptUnassignedOwnTextMarks, guardOwnTextMarks, listenOwnTextMarks, releaseOwnTextMarksGuard, startOwnTextMarksSync, unassignedOwnTextMarkCount, type OwnTextMarksSync } from './ownTextMarksSync'
import { currentOwnBookMetadata, withOwnBookMetadata } from './ownBookMetadata'
import { adoptUnassignedOwnTextCards, OwnTextCardsSync, unassignedOwnTextCardCount } from './ownTextCardsSync'
import { allLegacyEpubNotebookItems, claimLegacyEpubAnnotations, migrateVerifiedLegacyEpubMarks, syncClaimedLegacyEpubPages, unclaimedLegacyEpubCount, type LegacyOwnEpubItem } from './legacyEpubMarks'
import { openPdfOriginalPlace, notePdfOriginalPlace, notePdfOriginalZoom, readPdfOriginalZoom, type OriginalPagePlace } from './pdfOriginalPlace'
import { PdfOriginalReaderShell } from '../sharedReader/pdf/PdfOriginalReaderShell'
import { discoverOriginalPdfHeadings } from './pdfOriginalHeadings'
import { pdfReaderViewUrl } from './pdfReaderHandoff'
import { usePdfOriginalServices } from './usePdfOriginalServices'

// The margin reader's frame and its shell, loaded only for a book that opens there.
const MarginOwnBook = lazy(() => import('../marginPreview/MarginPreview').then(module => ({ default: module.MarginOwnBook })))

type ReaderIdentity = { hex: string; owner: string | null; sharedReader: boolean }
type ReaderState = { status: 'opening' } | (ReaderIdentity & (
  { status: 'ready'; book: LoadedUserBook; marks: OwnTextMarksSync | null; cards: OwnTextCardsSync | null; fileId: string | null }
  | { status: 'original'; title: string; author: string; place: OriginalPagePlace | null; hasText: boolean; scanOutline: Awaited<ReturnType<typeof readOwnedPdfScanEntries>> }
  | { status: 'margin' } | { status: 'failed'; message: string }))

/** Optional account detail must not keep a locally converted book on Opening indefinitely. */
async function openingDetail<T>(work: Promise<T>, ms = 700): Promise<{ ready: true; value: T } | { ready: false }> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      work.then(value => ({ ready: true as const, value })),
      new Promise<{ ready: false }>(resolve => { timer = setTimeout(() => resolve({ ready: false }), ms) }),
    ])
  } finally { if (timer !== undefined) clearTimeout(timer) }
}

/**
 * `owner`: the account the page was opened with, read before anything else ran
 * (main.tsx). Supabase drops a lapsed session from storage as it starts, and Add
 * a book tags files with the account even when its sign-in has lapsed.
 */
const replaceLocation = (url: string) => window.location.replace(url)

const reconcilePlace = (hex: string, book: LoadedUserBook, owner?: string | null) => book.kind === 'pdf'
  ? reconcilePdfPlace(hex, { ...(owner ? { owner } : {}) }).then(() => {})
  : reconcileOpenPlace(hex, { chapters: book.edition.chapters, ...(owner ? { owner } : {}) })

/**
 * The phone's margin mode for an own book (the dark bar and the bottom cards: LabApp `marginPhone`; chapter pills stay a Tinct book's), on
 * the rule a Tinct book follows on this phone (marginPreviewMount.ts): `margin=1` / `margin=0` in the link, else
 * this device's opt-in. Own books follow it as Tinct books do (Anders, 22 Oct 2026).
 */
export function ownMarginPhone(
  search: string,
  read: (key: string) => string | null = key => { try { return localStorage.getItem(key) } catch { return null } },
  write: (key: string, on: boolean) => void = (key, on) => { try { if (on) localStorage.setItem(key, '1'); else localStorage.removeItem(key) } catch { /* a device convenience only */ } },
): boolean {
  let flag: string | null = null
  try { flag = new URLSearchParams(search).get(MARGIN_PREVIEW_PARAM) } catch { /* the device's choice */ }
  // A link's choice is this device's from now on, as for a Tinct book (marginPreviewMount.ts stores the opt-in).
  if (flag === '1' || flag === '0') { write(MARGIN_PREVIEW_KEY, flag === '1'); return flag === '1' }
  return read(MARGIN_PREVIEW_KEY) === '1'
}

/** The same query with `pages` (a scan: the margin reader shows its pages and never sends it back here). */
function withPages(search: string): string {
  const params = new URLSearchParams(search)
  params.set('pages', '1')
  return `?${params}`
}

/** A link's `&pages` (a look at a page, "Show page"): the margin reader's pages, whatever this device reads the book in. */
function pagesAsked(): boolean {
  try { return new URLSearchParams(window.location.search).has('pages') } catch { return false }
}

/**
 * Takes what only the first open needed (`page`, `frac`) off the address, in place: the place read from here on is
 * the book's own, so a reload must not go back to the page the link named (D's matrix, 22 Oct 2026: a phone's PDF
 * reopened at its link's page after the reader had moved on).
 */
export function dropOpenParams(): void {
  try {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('page') && !params.has('frac')) return
    params.delete('page')
    params.delete('frac')
    const query = params.toString()
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
  } catch { /* the address stays */ }
}

/** A link's `&page=<n>` (Original pages' "Tinct text" button): the page to open the text at. */
function pageParam(): number | null {
  try {
    const page = Number(new URLSearchParams(window.location.search).get('page'))
    return Number.isInteger(page) && page >= 1 ? page : null
  } catch { return null }
}

export function UserBookReader({ hex, owner, phone = false, sharedReader = false, open = openUserBook, forward = replaceLocation, reconcile = reconcilePlace }: {
  hex: string
  owner?: string | null
  /** The phone's reader (main.tsx: the same surface test as Tinct's books). A desktop shows the margin reader here. */
  phone?: boolean
  /** Explicit private entry; this book's text uses the shared React reader even when its old desktop preference is Margin. */
  sharedReader?: boolean
  open?: (hex: string, options: { onProgress?: (progress: PdfConversionProgress) => void; owner?: string | null; page?: number | null; epubView?: EpubView; desktop?: boolean; sharedReader?: boolean }) => Promise<UserBookOpenResult>
  forward?: (url: string) => void
  /** Bring this device's place in line with the account's (bounded; never rejects the open). */
  reconcile?: (hex: string, book: LoadedUserBook, owner?: string | null) => Promise<void>
}) {
  const conversionEpoch=useRef(0)
  useEffect(()=>()=>{conversionEpoch.current++},[hex,owner])
  const conversionIdentity = useRef({hex,owner})
  conversionIdentity.current = {hex,owner}
  const [textProgress,setTextProgress] = useState<PdfConversionProgress | undefined>()
  const [textBusy,setTextBusy] = useState(false)
  const [textError,setTextError] = useState<string | undefined>()
  const [state, setState] = useState<ReaderState>({ status: 'opening' })
  // The phone's margin mode, decided once for the page (the link's choice is kept as the device's).
  const [marginPhone] = useState(() => phone && (sharedReader || typeof window !== 'undefined' && ownMarginPhone(window.location.search)))
  const [marginSearch, setMarginSearch] = useState(() => typeof window === 'undefined' ? '' : window.location.search)
  const [recoverableMarks, setRecoverableMarks] = useState(0)
  const [recoverableCards, setRecoverableCards] = useState(0)
  const [unclaimedEpubMarks, setUnclaimedEpubMarks] = useState(0)
  const [legacyEpubItems, setLegacyEpubItems] = useState<LegacyOwnEpubItem[]>([])
  const [pdfPages, setPdfPages] = useState<number | undefined>()
  const identity: ReaderIdentity = { hex, owner: owner ?? null, sharedReader }
  const matches = state.status !== 'opening' && state.hex === hex && state.owner === identity.owner && state.sharedReader === sharedReader
  const [pdfServiceStatus, setPdfServiceStatus] = useState('')
  const [pdfServiceRetry, setPdfServiceRetry] = useState(0)
  const pdfServices = usePdfOriginalServices(hex, owner ?? null, sharedReader && matches && state.status === 'original',
    matches && state.status === 'original' ? { title: state.title, author: state.author } : undefined, setPdfServiceStatus, pdfServiceRetry)
  useEffect(() => {
    let live = true
    let marks: OwnTextMarksSync | null = null
    let cards: OwnTextCardsSync | null = null
    let legacyImport: ReturnType<typeof setTimeout> | null = null
    setTextBusy(false); setTextError(undefined)
    setState({ status: 'opening' })
    const page = pageParam()
    // The margin reader's book: in this page's frame on a desktop, its own page on a phone. Nothing is written here.
    const toMargin = (pagesOnly = false) => {
      if (pagesOnly) setMarginSearch(withPages(window.location.search))
      if (phone) { forward(ownBookFrameUrl(hex, pagesOnly ? withPages(window.location.search) : window.location.search)); return }
      setState({ status: 'margin', ...identity })
    }
    const toOriginal = async () => {
      if (!owner) { setState({ status: 'failed', message: 'Sign in to open your book.', ...identity }); return }
      try {
        const hasTextWork = hasOwnedPdfText(hex, owner).catch(() => false)
        const scanWork = readOwnedPdfScanEntries(hex, owner).catch(() => null)
        const details = openingDetail(Promise.all([metadata, hasTextWork, scanWork] as const))
        // Only the reconciled page is needed before first paint. Account labels,
        // the Tinct-text button and a scan outline come from independent optional
        // reads, any of which can stall while the owned PDF bytes remain usable.
        const [place, quick] = await Promise.all([openPdfOriginalPlace(hex, owner), details])
        if (!live) return
        const [account, hasText, scanOutline] = quick.ready ? quick.value : [null, false, null] as const
        const title = account?.title || account?.name.replace(/\.pdf$/i, '') || 'Your PDF'
        setState({ status: 'original', title, author: account?.author || '', place: page ? { page, frac: Math.max(0,Math.min(1,Number(new URLSearchParams(window.location.search).get('frac')) || 0)) } : place, hasText, scanOutline, ...identity })
        if (!quick.ready) {
          const update = (fields: Partial<Extract<ReaderState, { status: 'original' }>>) => {
            if (!live) return
            setState(previous => previous.status === 'original' && previous.hex === hex && previous.owner === identity.owner && previous.sharedReader === sharedReader
              ? { ...previous, ...fields } : previous)
          }
          void metadata.then(account => update({ title: account?.title || account?.name.replace(/\.pdf$/i, '') || 'Your PDF', author: account?.author || '' }))
          void hasTextWork.then(hasText => update({ hasText }))
          void scanWork.then(scanOutline => { if (scanOutline) update({ scanOutline }) })
        }
        dropOpenParams()
      } catch {
        if (live) setState({ status: 'failed', message: 'This PDF could not be opened here. Try again from your books.', ...identity })
      }
    }
    // A look at a page (&pages): the margin reader's pages at once, for a signed-in reader (the frame needs the account).
    const metadata = sharedReader && owner ? currentOwnBookMetadata(hex, owner).catch(() => null) : Promise.resolve(null)
    if (pagesAsked() && owner) {
      if (sharedReader) void toOriginal(); else toMargin()
      return () => { live = false }
    }
    // An EPUB read in Margin view on this device (the desktop's default) goes on to the margin reader.
    const epubView = sharedReader ? 'text' : epubViewHere(hex)
    void open(hex, { ...(owner !== undefined ? { owner } : {}), ...(page ? { page } : {}), epubView, desktop: !phone, ...(sharedReader ? { sharedReader: true } : {}) }).then(async result => {
      if (!live) return
      // A book not on this device yet, an EPUB in Margin view, a PDF read in its pages, or one without text to
      // reflow (a scan: the margin reader does not send it back here).
      if (!result.ok && (result.reason === 'pages' || result.reason === 'pages_only')) {
        if (sharedReader) await toOriginal(); else toMargin(result.reason === 'pages_only')
        return
      }
      if (!result.ok && result.reason === 'missing' && sharedReader) {
        const account = await metadata
        if (account?.type === 'pdf') { await toOriginal(); return }
      }
      if (!result.ok && (result.reason === 'missing' || result.reason === 'margin')) { toMargin(); return }
      if (!result.ok) { setState({ status: 'failed', message: result.message, ...identity }); return }
      // A PDF's Tinct text on a desktop reads beside the margin, in the margin reader (reader.js openPdfText; Anders,
      // 20 Oct 2026, mockup 2b: never the Tinct reader there), which takes the same place from its pages or text.
      if (!sharedReader && !phone && result.book.kind === 'pdf') { toMargin(); return }
      // A place read later on another device of the account opens here.
      await reconcile(hex, result.book, owner).catch(() => {})
      if (!live) return
      const metadataQuick = await openingDetail(metadata)
      if (!live) return
      const metadataRecord = metadataQuick.ready ? metadataQuick.value : null
      // A generation ID is required before account annotations can be shown.
      // If the account metadata is still pending, draw the text without them;
      // never guess from a hash-only record or a possibly superseded local ID.
      const localFileId = () => readOwnedBookFileId(hex, owner ?? '').catch(() => null)
      const localIdWork = metadataQuick.ready && !/^[0-9a-f]{32}$/.test(metadataRecord?.id ?? '') ? localFileId() : null
      const localId = localIdWork ? await openingDetail(localIdWork) : null
      if (!live) return
      let fileId = /^[0-9a-f]{32}$/.test(metadataRecord?.id ?? '') ? metadataRecord!.id
        : localId?.ready ? localId.value : null
      const sourceBook = withOwnBookMetadata(result.book, metadataRecord)
      const book = { ...sourceBook, place: (sourceBook.kind === 'pdf' ? readPdfTextPlace(hex, sourceBook.edition, { page }) : readEpubPlace(hex, sourceBook.edition, undefined, { requireUniqueQuote: sharedReader })) ?? sourceBook.place }
      if (sharedReader && owner) guardOwnTextMarks(hex)
      const openAnnotations = async (generation: string | null) => {
        if (!sharedReader || !owner || !live) return
        // Both owner-qualified controllers reconcile before first paint, but their
        // account requests are independent. Start each even while the other waits.
        const marksOpening = (async () => {
          try {
            if (generation) marks = startOwnTextMarksSync(hex, owner, book.edition, generation)
            // A later response is still delivered to the mounted reader.
            if (marks) await Promise.race([marks.open(), new Promise<void>(resolve => setTimeout(resolve, 2500))])
          } catch { marks?.dispose(); marks = null /* book still opens; owner-unsafe marks remain hidden */ }
        })()
        const cardsOpening = (async () => {
          try {
            if (generation) cards = new OwnTextCardsSync(hex, owner, book.edition, undefined, undefined, generation)
            if (cards) await Promise.race([cards.open(), new Promise<void>(resolve => setTimeout(resolve, 2500))])
          } catch { cards?.dispose(); cards = null }
        })()
        await Promise.all([marksOpening, cardsOpening])
        if (!live) return
        setRecoverableMarks(unassignedOwnTextMarkCount(hex, owner))
        setRecoverableCards(cards ? unassignedOwnTextCardCount(hex, owner, generation) : 0)
        if (book.kind !== 'pdf') {
          setUnclaimedEpubMarks(unclaimedLegacyEpubCount(hex, owner))
          // Page-only annotations are available in Notebook immediately. The
          // optional source-word import reparses the whole old EPUB, sometimes
          // a very large one; it must not hold the already-converted text's
          // first page behind the opening spinner.
          syncClaimedLegacyEpubPages(hex, owner, marks, cards)
          setLegacyEpubItems(allLegacyEpubNotebookItems(hex, owner, marks, cards))
        }
      }
      await openAnnotations(fileId)
      if (!live) return
      // The link's page (Original pages' "Tinct text") has been used: a reload opens at the kept place, not there again.
      dropOpenParams()
      registerUserBook(book.bookId, book.edition)
      // The pictures are handed over before the reader draws its first page.
      const images = book.images
      registerFigureAssets(key => images.get(key) ?? null)
      const { storedCoverPending, ...readyBook } = book
      setState({ status: 'ready', book: readyBook, marks, cards, fileId, ...identity })
      // This other IndexedDB cache is only for the cover. A stalled lookup
      // cannot keep the already-converted chapters behind Opening… .
      if (storedCoverPending) void storedCoverPending.then(storedCover => {
        if (!live || !storedCover) return
        setState(previous => previous.status === 'ready' && previous.hex === hex && previous.owner === identity.owner && previous.sharedReader === sharedReader
          ? { ...previous, book: { ...previous.book, storedCover } } : previous)
      }).catch(() => {})
      let legacyScheduled = false
      const scheduleLegacyImport = () => {
        if (!sharedReader || !owner || book.kind === 'pdf' || legacyScheduled || !live) return
        legacyScheduled = true
        legacyImport = setTimeout(() => {
          void migrateVerifiedLegacyEpubMarks(hex, owner, book.edition).then(imported => {
            if (!live) return
            if (imported && !fileId) marks?.changed(readLabHighlights())
            setLegacyEpubItems(allLegacyEpubNotebookItems(hex, owner, marks, cards))
          }).catch(() => {})
        }, 0)
      }
      const applyLateMetadata = (record: Awaited<typeof metadata>) => {
        if (!live || !record) return
        setState(previous => previous.status === 'ready' && previous.hex === hex && previous.owner === identity.owner && previous.sharedReader === sharedReader
          ? { ...previous, book: withOwnBookMetadata(previous.book, record) } : previous)
      }
      const attachGeneration = async (generation: string | null) => {
        if (!live || !generation || fileId || !/^[0-9a-f]{32}$/.test(generation)) { scheduleLegacyImport(); return }
        fileId = generation
        await openAnnotations(generation)
        if (!live) return
        setState(previous => previous.status === 'ready' && previous.hex === hex && previous.owner === identity.owner && previous.sharedReader === sharedReader
          ? { ...previous, marks, cards, fileId: generation } : previous)
        scheduleLegacyImport()
      }
      if (metadataQuick.ready) {
        if (localIdWork && !localId?.ready) void localIdWork.then(attachGeneration)
        else scheduleLegacyImport()
      } else void metadata.then(record => {
        if (!live) return
        applyLateMetadata(record)
        const generation = /^[0-9a-f]{32}$/.test(record?.id ?? '') ? record!.id : null
        if (generation) void attachGeneration(generation)
        else void localFileId().then(attachGeneration)
      })
    }).catch(() => {
      if (live) setState({ status: 'failed', message: 'This file could not be opened as an EPUB. Choose another file.', ...identity })
    })
    const refresh = () => { if (marks) void marks.sync(); if (cards) void cards.sync() }
    const visible = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('online', refresh)
    document.addEventListener('visibilitychange', visible)
    return () => { live = false; if (legacyImport !== null) clearTimeout(legacyImport); window.removeEventListener('online', refresh); document.removeEventListener('visibilitychange', visible); marks?.dispose(); cards?.dispose(); if (sharedReader) releaseOwnTextMarksGuard(hex) }
  }, [hex, open, owner, phone, sharedReader, forward, reconcile])

  useEffect(() => {
    if (!sharedReader || !owner || !matches || state.status !== 'ready' || state.book.kind === 'pdf') return
    const update = () => setLegacyEpubItems(allLegacyEpubNotebookItems(hex, owner, state.marks, state.cards))
    const offMarks = listenOwnTextMarks(state.book.bookId, update)
    const offCards = state.cards?.subscribe(update)
    return () => { offMarks(); offCards?.() }
  }, [hex, owner, sharedReader, state, matches])

  const missingOriginalHeadings = matches && state.status === 'original' && !state.scanOutline && sharedReader && owner
    ? `${owner}:${hex}` : null
  useEffect(() => {
    if (!missingOriginalHeadings || !owner || state.status !== 'original') return
    const controller = new AbortController()
    // The pages have already mounted. Heading discovery is optional background
    // work and never owns, waits for, or writes the reader's source position.
    const timer = setTimeout(() => {
      void discoverOriginalPdfHeadings(hex, owner, { signal: controller.signal, fileName: state.title }).then(scanOutline => {
        if (!scanOutline || controller.signal.aborted) return
        setState(previous => previous.status === 'original' && previous.hex === hex && previous.owner === owner && !previous.scanOutline
          ? { ...previous, scanOutline } : previous)
      })
    }, 0)
    return () => { clearTimeout(timer); controller.abort() }
    // Optional title updates must not restart a discovery of the same source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingOriginalHeadings, hex, owner])

  // The book's pictures are drawn from this device while it is open (labFigures),
  // from object URLs made in this page load from the bytes kept on the device.
  const images = matches && state.status === 'ready' ? state.book.images : null
  useEffect(() => {
    if (!images) return
    registerFigureAssets(key => images.get(key) ?? null)
    return () => registerFigureAssets(null)
  }, [images])

  if (matches && state.status === 'ready') return <>
    <LabApp userBook={state.book} marginPhone={marginPhone || undefined} sharedReader={sharedReader || undefined} legacyOwnEpubItems={legacyEpubItems} ownCardController={state.cards} />
    {sharedReader && owner && recoverableCards > 0 && <div role="status" className="lab-own-cards-recovery" style={{ position: 'fixed', right: 16, top: 64, zIndex: 100, padding: 16, maxWidth: 300, background: 'var(--paper, #f9f5ec)', color: 'var(--ink, #24211e)', boxShadow: '0 3px 24px #0003' }}>
      <p>{recoverableCards} older {recoverableCards === 1 ? 'conversation has' : 'conversations have'} no account label. If {recoverableCards === 1 ? 'it is' : 'they are'} yours, attach {recoverableCards === 1 ? 'it' : 'them'} to this account.</p>
      <button type="button" onClick={() => { if (adoptUnassignedOwnTextCards(hex, owner, state.fileId)) window.location.reload() }}>Attach older conversations</button>
    </div>}
    {sharedReader && owner && unclaimedEpubMarks > 0 && <div role="status" className="lab-own-marks-recovery" style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 100, padding: 16, maxWidth: 300, background: 'var(--paper, #f9f5ec)', color: 'var(--ink, #24211e)', boxShadow: '0 3px 24px #0003' }}>
      <p>{unclaimedEpubMarks} older EPUB {unclaimedEpubMarks === 1 ? 'annotation needs' : 'annotations need'} review on this device. {unclaimedEpubMarks === 1 ? 'It may have' : 'They may have'} no account label or have changed since the account backup. If {unclaimedEpubMarks === 1 ? 'it is' : 'they are'} yours, attach {unclaimedEpubMarks === 1 ? 'it' : 'them'} to this account and review {unclaimedEpubMarks === 1 ? 'it' : 'them'} in Notebook.</p>
      <button type="button" onClick={() => { if (claimLegacyEpubAnnotations(hex, owner)) window.location.reload() }}>Attach older EPUB annotations</button>
    </div>}
    {sharedReader && owner && recoverableMarks > 0 && <div role="status" className="lab-own-marks-recovery" style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 100, padding: 16, maxWidth: 300, background: 'var(--paper, #f9f5ec)', color: 'var(--ink, #24211e)', boxShadow: '0 3px 24px #0003' }}>
      <p>{recoverableMarks} older {recoverableMarks === 1 ? 'highlight has' : 'highlights have'} no account label. If {recoverableMarks === 1 ? 'it is' : 'they are'} yours, you can attach {recoverableMarks === 1 ? 'it' : 'them'} to this account.</p>
      <button type="button" onClick={() => { if (adoptUnassignedOwnTextMarks(hex, owner)) window.location.reload() }}>Attach older highlights</button>
    </div>}
  </>
  if (matches && state.status === 'original' && owner && sharedReader) return <PdfOriginalReaderShell key={`${owner}:${hex}`} bookId={`userbook-${hex}`} owner={owner} title={state.title} services={pdfServices ?? undefined} serviceStatus={pdfServiceStatus} onRetryServices={() => setPdfServiceRetry(n => n + 1)} scanOutline={state.scanOutline}
    bytes={() => loadOwnedPdfBytes(hex, owner)} initialPlace={state.place} initialZoom={readPdfOriginalZoom(hex, owner)} onZoom={zoom => notePdfOriginalZoom(hex, owner, zoom)}
    onBeforeLeave={place => { notePdfOriginalPlace(hex, owner, place, pdfPages, true) }}
    onDocument={setPdfPages} onVisiblePlace={place => notePdfOriginalPlace(hex, owner, place, pdfPages)}
    textAvailable={state.hasText} textProgress={textProgress} textBusy={textBusy} textError={textError}
    onOpenText={async place => {
      if (textBusy) return
      setTextBusy(true); setTextError(undefined); setTextProgress({ stage: 'loading' })
      const epoch=conversionEpoch.current
      const stillHere=()=>conversionEpoch.current===epoch && conversionIdentity.current.hex===hex && conversionIdentity.current.owner===owner
      try {
        // Commit the visible source spot before conversion; its fresh timestamp wins
        // over an older text position even when the PDF has not moved this session.
        notePdfOriginalPlace(hex,owner,place,pdfPages,true)
        localStorage.setItem(PDF_EDITION_PREFIX + hex, JSON.stringify('text'))
        localStorage.removeItem('tinct-addbook:desk-edition:' + hex)
        localStorage.removeItem('tinct-addbook:phone-edition:' + hex)
        const converted=await open(hex,{owner,page:place.page,desktop:!phone,sharedReader:true,epubView:'text',onProgress: progress => { if (stillHere()) setTextProgress(progress) }})
        if (!stillHere()) return
        if (!converted.ok) {
          localStorage.setItem(PDF_EDITION_PREFIX+hex,JSON.stringify('pages'))
          setTextError(converted.reason==='pages_only' ? 'This PDF needs recognised text before it can become a Tinct book. You can keep reading its original pages.' : 'The Tinct book could not be prepared. Your original pages and reading place are safe; please try again.')
          return
        }
        forward(pdfReaderViewUrl(hex,'text',place,window.location.search))
      } catch {
        if (stillHere()) { try { localStorage.setItem(PDF_EDITION_PREFIX+hex,JSON.stringify('pages')) } catch { /* keep the source open */ }; setTextError('The Tinct book could not be prepared. Your original pages are still open; please try again.') }
      } finally { if (stillHere()) setTextBusy(false) }
    }} />
  if (matches && state.status === 'margin') return <Suspense fallback={null}><MarginOwnBook hex={hex} search={marginSearch} /></Suspense>
  return (
    <div className="lab is-desktop" data-testid="user-book-status" style={{ minHeight: '100vh' }}>
      {matches && state.status === 'failed' ? (
        <div className="lab-reader-load-error" role="alert">
          <p>{state.message}</p>
          <a href={USER_BOOKS_SHELF_URL}>Return to your books</a>
        </div>
      ) : (
        // The whole page is what is loading: the reader's ring on the paper, no card (Anders, 10 Oct:
        // no pop-up saying "Opening…"); the wording stays for screen readers (LabWait).
        <div className="lab-reader-load-wait">
          <LabWait label="Opening…" testId="user-book-opening" />
        </div>
      )}
    </div>
  )
}
