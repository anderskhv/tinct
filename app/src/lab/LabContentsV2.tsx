import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ChatConversation, EditionData, Section } from '../types'
import { loadEdition } from '../data/editionLoader'
import type { LabChapter } from './labSource'
import type { LabHighlight } from './labHighlights'
import type { LabChapterStatus } from './labChapterStatus'
import { contentsBooks, contentsChapterNumber, contentsExcerpt, contentsQuestion, contentsQuote, searchContents, type ContentsPlace } from './labContents'
import './labContentsV2.css'

type View = 'chapters' | 'books' | 'jump' | 'search' | 'highlight' | 'older'
type Filter = 'all' | 'chats' | 'highlights'
interface Props {
  open: boolean; bookId: string; title: string; editionKey: string; editionLabel: string
  chapters: LabChapter[]; sections?: Section[]; currentChapter: number; currentPage: number; totalPages: number
  chaptersReady: boolean
  statuses: Map<number, LabChapterStatus>; conversations: ChatConversation[]; highlights: LabHighlight[]; unassignedHighlights: LabHighlight[]
  historyStatus: 'loading' | 'ready' | 'unavailable'
  onOpenCover?: () => void
  onClose: () => void; onSelectChapter: (chapter: number) => void; onWarmChapter: (chapter: number) => void
  onOpenPassage: (place: ContentsPlace) => void; onContinueConversation: (conversation: ChatConversation) => void
}
function Icon({ name }: { name: 'back' | 'search' | 'down' | 'next' | 'highlight' | 'place' }) {
  const paths = {
    back: 'M19 12H5m6-6-6 6 6 6', search: 'm16.5 16.5 4 4M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0',
    down: 'm6 9 6 6 6-6', next: 'm9 6 6 6-6 6', chat: 'M20 11a8 8 0 0 1-8 8c-1.3 0-2.5-.3-3.5-.8L3 20l1.8-5.5A8 8 0 1 1 20 11Z',
    highlight: 'm14 4 6 6-9 9H5v-6Zm-9 16H2m5-8 6 6', place: 'M6 6h12v12M18 6 6 18',
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
function Match({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1
  return at < 0 ? <>{text}</> : <>{text.slice(0, at)}<mark>{text.slice(at, at + query.length)}</mark>{text.slice(at + query.length)}</>
}
function date(timestamp: number) { return Number.isFinite(timestamp) ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(timestamp) : '' }

/** Browsing is local view state. Only explicit chapter/passage actions navigate. */
export function LabContentsV2(props: Props) {
  const { open, bookId, title, editionKey, editionLabel, chapters, sections, currentChapter, currentPage, totalPages, statuses, onClose } = props
  const bible = bookId === 'bible'
  const books = useMemo(() => contentsBooks(title, chapters, sections, bible), [title, chapters, sections, bible])
  const currentBook = books.find(book => book.chapters.some(ch => ch.number === currentChapter)) || books[0]
  const [selectedBookKey, setSelectedBookKey] = useState(currentBook?.key || '')
  const selectedBook = books.find(book => book.key === selectedBookKey) || currentBook
  const [view, setView] = useState<View>('chapters')
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [bookQuery, setBookQuery] = useState('')
  const [bookGroup, setBookGroup] = useState(currentBook?.group || '')
  const [jump, setJump] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [selection, setSelection] = useState<LabHighlight | null>(null)
  const editionIdentity = `${bookId}:${editionKey}`
  const [loadedText, setLoadedText] = useState<{ key: string; data: EditionData } | null>(null)
  const data = loadedText?.key === editionIdentity ? loadedText.data : null
  const [loadError, setLoadError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [limit, setLimit] = useState(30)
  const bodyRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const scroll = useRef(new Map<string, number>())
  const reveal = useRef<number | null>(currentChapter)
  const returnView = useRef<View>('chapters')
  const preserveNextOpen = useRef(false)
  const wasOpen = useRef(false)
  const mountedBook = useRef(bookId)
  const listKey = `${selectedBook?.key}|${view}|${filter}|${query}`
  const chats = useMemo(() => props.conversations.filter(chat => chat.bookId === bookId), [props.conversations, bookId])
  const highlights = props.highlights
  const chapterNumbers = new Set(selectedBook?.chapters.map(ch => ch.number) || [])
  const selectedChats = chats.filter(chat => chapterNumbers.has(chat.chapterNumber)).sort((a, b) => b.endTimestamp - a.endTimestamp)
  const selectedHighlights = highlights.filter(highlight => chapterNumbers.has(highlight.chapterNumber))
  const results = useMemo(() => searchContents(query, chapters, data, chats, highlights), [query, chapters, data, chats, highlights])
  const needsText = open && (view === 'search' || view === 'highlight' || (view === 'chapters' && (filter === 'highlights' || highlights.some(h => expanded.has(h.chapterNumber)))))

  useEffect(() => {
    if (mountedBook.current !== bookId) {
      mountedBook.current = bookId
      scroll.current.clear(); setView('chapters'); setFilter('all'); setQuery(''); setSelection(null)
    }
    setLoadedText(null); setLoadError(false)
  }, [bookId, editionKey])
  useEffect(() => {
    if (!needsText || data) return
    let cancelled = false
    setLoadError(false)
    // Explicit whole-edition retrieval: never present a chapter window as a full-text search.
    void loadEdition(bookId, editionKey, { forceWholeBook: true }).then(edition => {
      if (!cancelled) setLoadedText({ key: editionIdentity, data: edition })
    }, () => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [bookId, editionKey, needsText, retry, data])
  useEffect(() => { setLimit(30) }, [query, filter, selectedBookKey])

  const saveScroll = () => { if (bodyRef.current) scroll.current.set(listKey, bodyRef.current.scrollTop) }
  const changeView = (next: View) => { saveScroll(); setView(next) }
  const close = () => { saveScroll(); onClose() }
  const back = () => {
    if (view === 'chapters') { close(); return }
    if (view === 'highlight') { setSelection(null); changeView(returnView.current); return }
    changeView('chapters')
  }
  const showCurrent = () => {
    saveScroll(); setSelectedBookKey(currentBook?.key || ''); setFilter('all'); setQuery(''); setView('chapters'); reveal.current = currentChapter
    requestAnimationFrame(() => scrollToChapter(currentChapter))
  }
  const scrollToChapter = (number: number) => {
    const body = bodyRef.current
    const row = body?.querySelector<HTMLElement>(`[data-chapter="${number}"]`)
    if (body && row) body.scrollTop = Math.max(0, row.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop)
  }
  useLayoutEffect(() => {
    if (!open) { wasOpen.current = false; return }
    if (!wasOpen.current) {
      wasOpen.current = true
      if (!preserveNextOpen.current) {
        setSelectedBookKey(currentBook?.key || ''); setView('chapters'); setFilter('all'); reveal.current = currentChapter
      }
      preserveNextOpen.current = false
    }
    if (!bodyRef.current) return
    if (reveal.current != null && view === 'chapters' && filter === 'all') {
      scrollToChapter(reveal.current); reveal.current = null
    } else bodyRef.current.scrollTop = scroll.current.get(listKey) || 0
  }, [open, listKey, currentChapter, currentBook?.key, props.chaptersReady])

  const backRef = useRef(back); backRef.current = back
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); backRef.current() }
      if (event.key !== 'Tab') return
      const nodes = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button,input,a[href]') || []).filter(node => !node.hasAttribute('disabled') && node.getClientRects().length)
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', key, true)
    return () => { document.removeEventListener('keydown', key, true); if (previous?.isConnected) previous.focus() }
  }, [open])
  useEffect(() => {
    if (view === 'search' || view === 'books' || view === 'jump') panelRef.current?.querySelector<HTMLInputElement>('input')?.focus()
  }, [view])

  if (!open || !selectedBook) return null
  if (!props.chaptersReady) return <div className="lab-contents-v2" data-testid="lab-toc"><div className="lc-panel" role="dialog" aria-modal="true" aria-label="Contents" ref={panelRef}><header className="lc-header"><button onClick={close} aria-label="Back to book"><Icon name="back" /></button><h2>{title}</h2></header><p className="lc-status" role="status">Loading contents…</p></div></div>
  const chapterTitle = (n: number) => chapters.find(ch => ch.number === n)?.title || `Chapter ${n}`
  const bookSummary = (chapterList: LabChapter[]) => {
    const numbers = new Set(chapterList.map(ch => ch.number))
    const read = chapterList.filter(ch => statuses.get(ch.number)?.kind === 'finished').length
    const chatCount = chats.filter(chat => numbers.has(chat.chapterNumber)).length
    const marks = highlights.filter(h => numbers.has(h.chapterNumber)).length
    return [read ? `${read} read` : '', chatCount ? `${chatCount} ${chatCount === 1 ? 'chat' : 'chats'}` : '', marks ? `${marks} ${marks === 1 ? 'highlight' : 'highlights'}` : ''].filter(Boolean).join(' · ') || `${chapterList.length} chapters`
  }
  const openChat = (chat: ChatConversation) => { saveScroll(); preserveNextOpen.current = true; props.onContinueConversation(chat) }
  const openHighlight = (highlight: LabHighlight) => { saveScroll(); returnView.current = view; setSelection(highlight); setView('highlight') }
  const chooseChapter = (number: number) => { saveScroll(); props.onSelectChapter(number) }
  const openPassage = (place: ContentsPlace) => {
    saveScroll(); preserveNextOpen.current = true
    if (view === 'highlight') setView(returnView.current)
    props.onOpenPassage(place)
  }
  const quote = (highlight: LabHighlight) => contentsQuote(highlight, data)
  const textStatus = needsText && !data && <p className="lc-status" role="status">{loadError ? <>Text could not be loaded. <button onClick={() => setRetry(n => n + 1)}>Retry</button></> : 'Loading passage text…'}</p>
  const chatRow = (chat: ChatConversation, compact = false) => <button className={`lc-annotation${compact ? ' is-compact' : ''}`} key={chat.id} onClick={() => openChat(chat)} data-testid={`contents-chat-${chat.id}`}>
    {compact && <Icon name="chat" />}<span>{!compact && <small>{chapterTitle(chat.chapterNumber)} · {date(chat.startTimestamp)}</small>}<strong><Match text={contentsExcerpt(contentsQuestion(chat), query, 180)} query={view === 'search' ? query : ''} /></strong>{!compact && <span className="lc-excerpt"><Match text={contentsExcerpt((view === 'search' && query.trim() ? chat.messages.find(message => message.content.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))?.content : null) || chat.messages.find(message => message.role === 'assistant')?.content || chat.summary || '', query)} query={view === 'search' ? query : ''} /></span>}</span>
  </button>
  const highlightRow = (highlight: LabHighlight, compact = false) => <button className={`lc-annotation lc-highlight${compact ? ' is-compact' : ''}`} key={highlight.id} onClick={() => openHighlight(highlight)} data-testid={`contents-highlight-${highlight.id}`}>
    {compact && <Icon name="highlight" />}<span>{!compact && <small>{chapterTitle(highlight.chapterNumber)}</small>}<strong><Match text={contentsExcerpt(quote(highlight) || highlight.note || (loadError ? 'Passage unavailable' : 'Loading highlighted passage…'), query)} query={view === 'search' ? query : ''} /></strong>{!compact && highlight.note && <span className="lc-excerpt"><Match text={highlight.note} query={view === 'search' ? query : ''} /></span>}</span>
  </button>
  const selectedHighlight = view === 'highlight' ? selection : null
  const more = (count: number) => count > limit && <button className="lc-more" onClick={() => setLimit(n => n + 30)}>Show more · {count - limit} remaining</button>

  return <div className="lab-contents-v2" data-testid="lab-toc">
    <button className="lc-scrim" onClick={close} aria-label="Close contents" tabIndex={-1} />
    <div className="lc-panel" role="dialog" aria-modal="true" aria-label="Contents and conversations" ref={panelRef} data-testid="lab-contents-v2" data-view={view}>
      <header className="lc-header"><button onClick={back} aria-label={view === 'chapters' ? 'Back to book' : 'Back to overview'}><Icon name="back" /></button><h2>{view === 'books' ? 'Books' : view === 'jump' ? 'Find a chapter' : view === 'highlight' ? 'Highlight' : title}</h2><button onClick={() => changeView('search')} aria-label="Search contents" className={['chapters', 'search'].includes(view) ? '' : 'lc-invisible'}><Icon name="search" /></button></header>
      <div className="lc-controls">
        {view === 'chapters' && props.onOpenCover && <button type="button" className="lc-more" onClick={props.onOpenCover}>Cover</button>}
        {view === 'chapters' && <><div className="lc-path">{bible ? <button className="lc-book" onClick={() => { setBookQuery(''); setBookGroup(selectedBook.group); changeView('books') }} aria-label={`Change Bible book, ${selectedBook.title}`}>{selectedBook.title}<Icon name="down" /></button> : <h3>{title}</h3>}<button className="lc-jump" onClick={() => { setJump(''); changeView('jump') }}>Jump to<Icon name="down" /></button></div><nav className="lc-tabs" aria-label="Contents filter">{(['all', 'chats', 'highlights'] as Filter[]).map(value => <button key={value} aria-pressed={filter === value} onClick={() => { saveScroll(); setFilter(value) }}>{value[0].toUpperCase() + value.slice(1)}</button>)}</nav></>}
        {view === 'books' && <><input aria-label="Find a Bible book" placeholder="Find a book" value={bookQuery} onChange={event => setBookQuery(event.target.value)} /><nav className="lc-tabs" aria-label="Testament">{[...new Set(books.map(book => book.group))].filter(Boolean).map(group => <button key={group} aria-pressed={bookGroup === group} onClick={() => setBookGroup(group)}>{group}</button>)}</nav></>}
        {view === 'search' && <><input aria-label={`Search ${title}`} placeholder="Words or a chapter reference" value={query} onChange={event => setQuery(event.target.value)} /><small className="lc-scope">{title} · {editionLabel} · conversations and highlights</small></>}
        {view === 'jump' && <form className="lc-jump-form" onSubmit={event => { event.preventDefault(); const n = contentsChapterNumber(selectedBook, Number(jump)); if (n != null) chooseChapter(n) }}><input type="number" inputMode="numeric" required min="1" max={selectedBook.chapters.length} value={jump} onChange={event => setJump(event.target.value)} placeholder={`Chapter 1–${selectedBook.chapters.length}`} aria-label="Chapter number" /><button type="submit">Go<Icon name="next" /></button></form>}
      </div>
      <main className="lc-body" ref={bodyRef} onScroll={saveScroll}>
        {props.historyStatus !== 'ready' && <p className="lc-status" role="status">{props.historyStatus === 'loading' ? 'Loading saved conversations…' : 'Showing conversations saved on this device. Cloud history is unavailable.'}</p>}
        {textStatus}
        {view === 'books' && [...new Set(books.map(book => book.group))].filter(group => bookQuery || !bookGroup || group === bookGroup).map(group => <section key={group}>{group && bookQuery && <h3 className="lc-section">{group}</h3>}{books.filter(book => book.group === group && book.title.toLocaleLowerCase().includes(bookQuery.toLocaleLowerCase())).map(book => <button className="lc-row" key={book.key} onClick={() => { saveScroll(); setSelectedBookKey(book.key); setFilter('all'); setView('chapters'); reveal.current = book.chapters[0]?.number || null }}><span><strong>{book.title}</strong><small>{bookSummary(book.chapters)}</small></span>{book.key === currentBook?.key ? <small>Reading here</small> : <Icon name="next" />}</button>)}</section>)}
        {view === 'jump' && Array.from({ length: Math.ceil(selectedBook.chapters.length / 10) }, (_, i) => <button className="lc-row" key={i} onClick={() => { reveal.current = selectedBook.chapters[i * 10].number; setFilter('all'); changeView('chapters') }} aria-label={`Browse chapters ${i * 10 + 1} to ${Math.min(selectedBook.chapters.length, i * 10 + 10)}`}><strong>{i * 10 + 1}–{Math.min(selectedBook.chapters.length, i * 10 + 10)}</strong><Icon name="next" /></button>)}
        {view === 'chapters' && filter === 'all' && selectedBook.chapters.map((ch, index) => {
          const cs = selectedChats.filter(chat => chat.chapterNumber === ch.number), hs = selectedHighlights.filter(h => h.chapterNumber === ch.number)
          const status = ch.number === currentChapter ? 'Reading' : statuses.get(ch.number)?.kind === 'finished' ? 'Finished' : statuses.get(ch.number)?.kind === 'in-progress' ? 'In progress' : ''
          return <section className="lc-chapter" key={ch.number} data-chapter={ch.number} data-current={ch.number === currentChapter}><button className="lc-chapter-main" data-testid={`lab-tree-chapter-${ch.number}`} aria-current={ch.number === currentChapter ? 'location' : undefined} aria-label={`${ch.title}${status ? `, ${status}` : ', not read'}`} onPointerEnter={() => props.onWarmChapter(ch.number)} onClick={() => chooseChapter(ch.number)}><strong>{bible ? `Chapter ${index + 1}` : ch.title}</strong>{status && <small>{ch.number === currentChapter && <i />}{status}</small>}</button>{(cs.length > 0 || hs.length > 0) && <button className="lc-more" aria-expanded={expanded.has(ch.number)} onClick={() => setExpanded(current => { const next = new Set(current); if (next.has(ch.number)) next.delete(ch.number); else next.add(ch.number); return next })}>{[cs.length ? `${cs.length} ${cs.length === 1 ? 'chat' : 'chats'}` : '', hs.length ? `${hs.length} ${hs.length === 1 ? 'highlight' : 'highlights'}` : ''].filter(Boolean).join(' · ')}</button>}{expanded.has(ch.number) && <>{cs.map(chat => chatRow(chat, true))}{hs.map(h => highlightRow(h, true))}</>}</section>
        })}
        {view === 'chapters' && filter === 'chats' && <>{selectedChats.slice(0, limit).map(chat => chatRow(chat))}{more(selectedChats.length)}{!selectedChats.length && props.historyStatus === 'ready' && <p className="lc-status">No saved conversations in {selectedBook.title}.</p>}</>}
        {view === 'chapters' && filter === 'highlights' && <>{selectedHighlights.slice(0, limit).map(h => highlightRow(h))}{more(selectedHighlights.length)}{!selectedHighlights.length && <p className="lc-status">No highlights saved for this edition of {selectedBook.title}.</p>}{props.unassignedHighlights.length > 0 && <button className="lc-more" onClick={() => changeView('older')}>Older highlights · book not recorded</button>}</>}
        {view === 'older' && <><p className="lc-status">These older marks have no saved book or edition. They are preserved here; their quotations cannot be identified safely.</p>{props.unassignedHighlights.map(h => <article className="lc-older" key={h.id}><small>Chapter {h.chapterNumber} · paragraph {h.paragraphIndex + 1}</small><p>{h.note || 'Highlighted passage'}</p></article>)}</>}
        {view === 'search' && query.trim() && <>
          {results.chapters.length > 0 && <section><h3 className="lc-section">Chapters</h3>{results.chapters.slice(0, limit).map(ch => <button key={ch.number} className="lc-row" onClick={() => chooseChapter(ch.number)}><strong><Match text={ch.title} query={query} /></strong><Icon name="next" /></button>)}{more(results.chapters.length)}</section>}
          {results.passages.length > 0 && <section><h3 className="lc-section">Passages</h3>{results.passages.slice(0, limit).map(place => <button className="lc-annotation" key={`${place.chapterNumber}:${place.paragraphIndex}`} onClick={() => openPassage(place)}><span><small>{place.title}</small><strong><Match text={place.text} query={query} /></strong></span></button>)}{more(results.passages.length)}</section>}
          {results.chats.length > 0 && <section><h3 className="lc-section">Conversations</h3>{results.chats.slice(0, limit).map(chat => chatRow(chat))}{more(results.chats.length)}</section>}
          {results.highlights.length > 0 && <section><h3 className="lc-section">Highlights</h3>{results.highlights.slice(0, limit).map(h => highlightRow(h.highlight))}{more(results.highlights.length)}</section>}
          {data && props.historyStatus === 'ready' && !Object.values(results).some(list => list.length) && <p className="lc-status">No matches.</p>}
        </>}
        {selectedHighlight && <article className="lc-thread"><small>{chapterTitle(selectedHighlight.chapterNumber)} · {editionLabel}</small>{quote(selectedHighlight) && <blockquote>{quote(selectedHighlight)}</blockquote>}{selectedHighlight.note && <><small>Your note</small><p>{selectedHighlight.note}</p></>}<button className="lc-continue" onClick={() => openPassage({ chapterNumber: selectedHighlight.chapterNumber, paragraphIndex: selectedHighlight.paragraphIndex, wordIndex: selectedHighlight.fromWord })}>Open passage<Icon name="next" /></button></article>}
      </main>
      <button className="lc-location" onClick={showCurrent} aria-label={`Your reading place, ${chapterTitle(currentChapter)}, page ${currentPage} of ${totalPages}`}><i /><span>{chapterTitle(currentChapter)}</span><small>{currentPage} / {totalPages}</small><Icon name="place" /></button>
    </div>
  </div>
}
