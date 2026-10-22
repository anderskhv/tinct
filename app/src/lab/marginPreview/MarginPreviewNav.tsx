/**
 * The margin preview's book title and chapter pill do what the book reader's do (Anders, 22 Oct 2026: "lets have the
 * margin reader just do exactly as the normal reader for book and chapter clicks"). The frame
 * (public/lab/addbook/js/reader.js previewNav) asks through `window.TinctMarginPreview.nav`; this page draws the book
 * reader's own Reading now (LabBookSwitcher) and Contents (LabContentsV2) over the frame, from the book reader's
 * stores. Another book opens as the book reader's switcher opens it (a reader hand-off to /reader, after the frame has
 * written its place); a chapter or passage picked moves the frame there, and the frame keeps that place as it keeps
 * any other.
 *
 * A reader's own book (22 Oct 2026, "One Tinct": MarginPreview.tsx MarginOwnBook) gets the same two: its chapters
 * come with the request (the frame's contents), its row and cover from My shelf, and no Introduction.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BOOKS, getBook } from '../../data/bookRegistry'
import { useAuth } from '../../hooks/useAuth'
import { readShelfMembership } from '../../libraryTwoSaved'
import { continueHandoff } from '../../preReader/continueHandoff'
import { ownQuickBookRows, quickBookCompletedIds, quickBookPositions, quickBookRows, withOwnBookRows, type QuickAddedBooks, type QuickBookCatalogueEntry, type QuickBookRow } from '../../preReader/quickBookSwitcher'
import { readDeviceReadingMemory } from '../../readingMemory'
import type { Section } from '../../types'
import { fetchPublicBooksIndex, mentionsPublicBook, registeredPublicCover, registeredPublicEntries } from '../../utils/publicBooks'
import { resolveBookCover } from '../../../public/lab/book-cover.js'
import { readerPreviewSearch } from '../../../public/lab/library-model.js'
import { isPublicBookId } from '../../../public/lab/public-books.js'
import { LabBookSwitcher } from '../LabBookSwitcher'
import { LabContentsV2 } from '../LabContentsV2'
import { readSupabaseAccessToken } from '../labAuth'
import { labChapterStatuses } from '../labChapterStatus'
import { readLabBookChat } from '../labChatHistory'
import { isLabChapterNote, readLabHighlights } from '../labHighlights'
import { readCachedSupabaseUser } from '../labLibraryBoot'
import { accountLabPositionRecord, finishedChaptersFor } from '../labPosition'
import { readLabPositionLocal } from '../labPositionStore'
import { labLibraryIntroductionUrl } from '../labPrefs'
import { LAB_READER_HANDOFF_KEY } from '../labReaderHandoff'
import { ownReadingNow, readOwnShelf } from '../userBook/ownShelf'
import { isUserBookId } from '../userBook/userBookId'
import { ownReadingNowWithAccount } from '../userBook/ownSync'
import type { MarginFramePlace } from './marginPreviewMenu'
import type { MarginPreviewBook, MarginPreviewChapter } from './marginPreviewModel'
import '../lab.css'

/** What the frame asks for: Reading now (the title) or Contents (the chapter pill), with its place and its ways back. */
export interface MarginNavRequest {
  kind: 'switcher' | 'contents'
  theme: 'light' | 'dark' | 'book'
  /** The frame's place: its page (one per chapter) and how far into it (0–100). */
  page: number
  percent: number
  /** The chapter pill's label. */
  chapterLabel: string
  /** Move the frame to a chapter (para and word 0) or a passage. */
  go: (at: MarginFramePlace) => void
  /** The frame writes its place and stops reading aloud: the page is about to be left. */
  leave: () => void
  /** The frame's own way to the library (Library, as its t menu goes). */
  library: () => void
  /** The overlay closed without leaving: focus back to the frame's button. */
  closed?: () => void
  /**
   * A reader's own book: what Reading now and Contents show of it, from the frame. Its chapters are the frame's
   * contents entries in order (`number`: 1, 2, …), and `page`/`go` count in them.
   */
  book?: { title: string; chapters: MarginNavChapter[]; cover?: string }
}

export type MarginNavChapter = Pick<MarginPreviewChapter, 'number' | 'title' | 'section'>

/** The book the two show: a registered book's loaded edition, or an own book's contents (MarginPreview.tsx marginOwnNavBook). */
export interface MarginNavBook {
  bookId: string
  title: string
  editionKey: string
  editionLabel: string
  chapters: MarginNavChapter[]
  /** An own book's cover (the frame's); a registered book's comes from its id. */
  cover?: string
}

export interface MarginNavApi { open: (request: MarginNavRequest) => void }

/** The edition's parts as the book reader's Contents groups them: each part's chapters, in order. */
export function marginContentsSections(chapters: MarginNavChapter[]): Section[] | undefined {
  const parts: Section[] = []
  for (const chapter of chapters) {
    if (!chapter.section) continue
    const part = parts.find(p => p.title === chapter.section)
    if (part) part.chapters!.push(chapter.number)
    else parts.push({ title: chapter.section, chapters: [chapter.number] })
  }
  return parts.length ? parts : undefined
}

/** Built-in books only, as LabApp's quickCatalogueFallback: added books come with their own entries. */
function catalogueFallback(model: MarginNavBook): QuickBookCatalogueEntry[] {
  return BOOKS.filter(book => !isPublicBookId(book.id)).map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    art: { src: `/covers/v2/${book.id}.webp` },
    readingStructure: book.id === model.bookId ? { chapters: model.chapters.map(c => ({ number: c.number, title: c.title })) } : null,
  }))
}

export function MarginPreviewNav({ model, request, onDone }: { model: MarginNavBook | MarginPreviewBook; request: MarginNavRequest; onDone: () => void }) {
  const { user } = useAuth()
  const [view, setView] = useState<'switcher' | 'contents'>(request.kind)
  const [rows, setRows] = useState<QuickBookRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { setView(request.kind) }, [request])
  const bookId = model.bookId
  const viewer = user?.id ?? readCachedSupabaseUser()?.id ?? null
  const chapterNumber = model.chapters[Math.max(0, request.page - 1)]?.number ?? model.chapters[0]?.number ?? 1

  // Focus goes back to the frame's button once the overlay is gone (Contents hands focus back to what had it as it closes).
  const refocus = useCallback(() => { setTimeout(() => request.closed?.(), 0) }, [request])
  const close = useCallback(() => { onDone(); refocus() }, [onDone, refocus])
  const pageOf = useCallback((number: number) => model.chapters.findIndex(c => c.number === number) + 1, [model.chapters])
  const go = useCallback((at: { chapterNumber: number; paragraphIndex: number; wordIndex: number }) => {
    const page = pageOf(at.chapterNumber)
    onDone()
    if (page > 0) request.go({ page, para: Math.max(0, at.paragraphIndex || 0), word: Math.max(0, at.wordIndex || 0) })
    refocus()
  }, [onDone, pageOf, refocus, request])

  // Reading now: the book reader's rows (LabApp openBookSwitcher), Tinct's books and the reader's own.
  useEffect(() => {
    if (view !== 'switcher') return
    let current = true
    const rowsFor = (catalogue: QuickBookCatalogueEntry[], added: QuickAddedBooks) => {
      try {
        const local = accountLabPositionRecord(readLabPositionLocal(), null, viewer)
        return quickBookRows({
          catalogue,
          positions: quickBookPositions(local, catalogue, key => localStorage.getItem(key)),
          memory: readDeviceReadingMemory(),
          viewer,
          completedBookIds: quickBookCompletedIds(localStorage),
          added,
          membership: readShelfMembership(viewer),
        })
      } catch { return [] }
    }
    const registered: QuickAddedBooks = { entries: registeredPublicEntries(), complete: false }
    let namesAdded = false
    try { namesAdded = mentionsPublicBook(localStorage.getItem('tinct-lab-position'), JSON.stringify(readDeviceReadingMemory())) } catch { /* registered books still apply */ }
    const addedReady: Promise<QuickAddedBooks> = namesAdded
      ? fetchPublicBooksIndex().then(index => index ? { entries: [...registered.entries, ...index], complete: true } : registered)
      : Promise.resolve(registered)
    let tinctRows = rowsFor(catalogueFallback(model), registered)
    let ownRows: QuickBookRow[] = []
    const paint = () => { if (current) setRows(withOwnBookRows(tinctRows, ownRows)) }
    paint()
    setError('')
    setLoading(true)
    let ownSettled = false
    void readOwnShelf(viewer).then(books => { if (!ownSettled) { ownRows = ownQuickBookRows(ownReadingNow(books)); paint() } }, () => {})
    const ownReady = readSupabaseAccessToken().catch(() => null)
      .then(token => ownReadingNowWithAccount(viewer, { token: token ?? undefined }))
      .then(books => { ownSettled = true; ownRows = ownQuickBookRows(books); paint() }, () => {})
    void fetch('/lab/catalogue.json')
      .then(async response => {
        if (!response.ok) throw new Error(String(response.status))
        const payload = await response.json() as { books?: QuickBookCatalogueEntry[] }
        if (!Array.isArray(payload.books)) throw new Error('Invalid catalogue')
        tinctRows = rowsFor(payload.books, await addedReady)
        paint()
      })
      .catch(() => { if (current) setError('Showing books saved on this device.') })
      .finally(() => { void ownReady.finally(() => { if (current) setLoading(false) }) })
    return () => { current = false }
  }, [model, view, viewer])

  useEffect(() => {
    if (view !== 'switcher') return
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); close() } }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [close, view])

  // As LabApp switchQuickBook: the outgoing place first, then the chosen book with its own place.
  const switchTo = useCallback((row: QuickBookRow) => {
    if (row.href) { request.leave(); onDone(); window.location.assign(row.href); return }
    const intent = continueHandoff(row.target)
    if (!intent) { setError('That saved place is temporarily unavailable.'); return }
    request.leave()
    try { sessionStorage.setItem(LAB_READER_HANDOFF_KEY, JSON.stringify(intent)) } catch {
      setError('That saved place is temporarily unavailable.')
      return
    }
    onDone()
    window.location.assign(`/reader${readerPreviewSearch(window.location.search)}`)
  }, [onDone, request])

  const contents = useMemo(() => {
    if (view !== 'contents') return null
    const marks = readLabHighlights()
    const position = readLabPositionLocal()
    return {
      sections: marginContentsSections(model.chapters),
      highlights: marks.filter(h => !isLabChapterNote(h)),
      unassigned: marks.filter(h => (!h.bookId || !h.editionKey) && !isLabChapterNote(h)),
      chapterNotes: marks.filter(h => isLabChapterNote(h) && h.bookId === bookId),
      conversations: readLabBookChat(bookId),
      statuses: labChapterStatuses({
        bookId,
        chapterNumbers: model.chapters.map(c => c.number),
        finished: finishedChaptersFor(position, bookId),
        memory: readDeviceReadingMemory(),
        position,
        viewer,
        conversations: readLabBookChat(bookId),
      }),
    }
  }, [bookId, model.chapters, view, viewer])

  const own = isUserBookId(bookId)
  const cover = own
    ? { src: ('cover' in model && model.cover) || '', srcSet: null }
    : resolveBookCover({ bookId, art: isPublicBookId(bookId) ? registeredPublicCover(bookId) : `/covers/v2/${bookId}.webp` })
  const theme = request.theme === 'dark' ? ' is-night' : request.theme === 'book' ? ' is-book-theme' : ''
  return <div
    className={`lab is-desktop margin-preview-nav${theme}`}
    data-chrome-version="v2"
    data-testid="margin-preview-nav"
    style={{ position: 'fixed', inset: 0, zIndex: 40, minHeight: 0, background: 'transparent' }}
  >
    {view === 'switcher' && <LabBookSwitcher
      current={{ bookId, title: model.title, chapterLabel: request.chapterLabel, coverSrc: cover?.src ?? '', coverSrcSet: cover?.srcSet ?? null, coverTone: getBook(bookId)?.coverColor ?? null }}
      rows={rows}
      loading={loading}
      error={error}
      onClose={close}
      onSelect={switchTo}
      onLibrary={() => { onDone(); request.library() }}
    />}
    {view === 'contents' && contents && <LabContentsV2
      open
      onSwitchBook={() => setView('switcher')}
      bookId={bookId}
      title={model.title}
      editionKey={model.editionKey}
      editionLabel={model.editionLabel}
      chapters={model.chapters.map(c => ({ number: c.number, title: c.title }))}
      chaptersReady
      sections={contents.sections}
      currentChapter={chapterNumber}
      currentPage={1}
      totalPages={1}
      currentPercent={Math.max(0, Math.min(100, Math.round(request.percent)))}
      statuses={contents.statuses}
      conversations={contents.conversations}
      historyStatus="ready"
      highlights={contents.highlights}
      unassignedHighlights={contents.unassigned}
      chapterNotes={contents.chapterNotes}
      onSelectChapter={number => go({ chapterNumber: number, paragraphIndex: 0, wordIndex: 0 })}
      onOpenPassage={place => go(place)}
      onContinueConversation={conversation => go({ chapterNumber: conversation.chapterNumber, paragraphIndex: conversation.paragraphIndex || 0, wordIndex: 0 })}
      onOpenIntroduction={own ? undefined : () => { request.leave(); onDone(); window.location.assign(labLibraryIntroductionUrl(bookId, model.editionKey, readerPreviewSearch(window.location.search))) }}
      onWarmChapter={() => {}}
      onClose={close}
    />}
  </div>
}

export default MarginPreviewNav
