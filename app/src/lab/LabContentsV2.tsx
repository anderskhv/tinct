import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ChatConversation, EditionData, Section } from '../types'
import { loadEdition } from '../data/editionLoader'
import type { LabChapter } from './labSource'
import { isLabChapterNote, type LabHighlight } from './labHighlights'
import { highlightCreatedAt, labNotesOnly, orderLabHighlights, type LabHighlightOrder } from './labHighlightOrder'
import { LAB_NOTEBOOK_LABEL } from './labSuperMenu'
import { isCardTombstone } from './labChatHistory'
import type { LabChapterStatus } from './labChapterStatus'
import { contentsExcerpt, contentsQuestion, contentsQuote, searchContents, type ContentsPlace } from './labContents'
import './labContentsV2.css'
import type { LabFigure } from './labFigures'
import { LabFigureThumb } from './LabFigure'
import { ChatIcon, HighlightIcon } from './LabReaderIcons'
import { LabWait } from './LabWait'
import { sharedNotebookFilename, sharedNotebookMarkdown } from './sharedReader/sharedReaderNotebook'

import { contentsTree, flattenContents, contentsPercent, type ContentsNode } from './labContentsTree'

type View = 'search' | 'highlights' | 'chats' | 'highlight' | 'older' | 'notebook'
/** The Notebook's filters, named as the desktop margin reader's (public/lab/addbook/js/notebook.js FILTERS). */
type NotebookFilter = 'all' | 'mine' | 'ai'
const NOTEBOOK_FILTERS: Array<[NotebookFilter, string]> = [['all', 'All'], ['mine', 'My notes'], ['ai', 'AI']]
type Scope = 'all' | 'book' | 'chats'
/** A saved item from the original EPUB whose old page coordinate cannot safely map into the converted text. */
export interface LegacyOwnEpubNotebookItem {
  id: string
  kind: 'highlight' | 'card'
  text: string
  note?: string
  turns?: Array<{ role: 'user' | 'assistant'; content: string; at?: number }>
  data?: Record<string, unknown>
  page: number
  at: number
}
interface Props {
  open: boolean; bookId: string; title: string; editionKey: string; editionLabel: string
  chapters: LabChapter[]; sections?: Section[]; currentChapter: number; currentPage: number; totalPages: number; currentPercent?: number
  chaptersReady: boolean
  /** The book's figures; with any, a Figures tab sits beside Chapters. */
  figures?: LabFigure[]
  statuses: Map<number, LabChapterStatus>; conversations: ChatConversation[]; highlights: LabHighlight[]; unassignedHighlights: LabHighlight[]
  /** Notes on whole chapters (no passage), listed at their chapter's place after its highlights. */
  chapterNotes?: LabHighlight[]
  historyStatus: 'loading' | 'ready' | 'unavailable'
  /** While an added book's Modern English edition is being written: each chapter's state (labModernEdition.ts). */
  modernStates?: Record<string, 'ready' | 'preparing' | 'queued'>
  onSwitchBook?: () => void
  /**
   * Opened as the phone's Notebook (t menu, 22 Oct 2026): one list, newest first, of this book's cards (its saved
   * conversations) and the reader's highlights and notes, as the desktop margin reader's Notebook lists them, with
   * its filters (All · My notes · AI). Closing it returns to the book.
   */
  notebook?: boolean
  /** Owner-gated legacy records, shown only in this book's Notebook without inventing a converted-text anchor. */
  legacyOwnEpubItems?: LegacyOwnEpubNotebookItem[]
  /** The private shared reader's Notebook tools; omitted in the public reader. */
  sharedNotebook?: boolean
  /** Delete using the existing highlight/card store and return an undo operation using its revision rules. */
  onDeleteNotebookItem?: (item: { kind: 'highlight' | 'card'; id: string }) => (() => boolean | void) | null
  /** The book's introduction (in the library). Omitted when there is none to open. */
  onOpenIntroduction?: () => void
  onClose: () => void; onSelectChapter: (chapter: number) => void; onWarmChapter: (chapter: number) => void
  onOpenPassage: (place: ContentsPlace) => void; onContinueConversation: (conversation: ChatConversation) => void
}
/** Chat and Highlight come from LabReaderIcons, the reader's one icon for each. */
function Icon({ name }: { name: 'search' | 'next' | 'close' }) {
  const paths = {
    search: 'm21 21-4.34-4.34M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    next: 'm9 18 6-6-6-6',
    close: 'm18 6-12 12M6 6l12 12',
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
function Match({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1
  return at < 0 ? <>{text}</> : <>{text.slice(0, at)}<mark>{text.slice(at, at + query.length)}</mark>{text.slice(at + query.length)}</>
}
function ProgressPie({ percent }: { percent: number }) {
  const angle = percent / 100 * Math.PI * 2 - Math.PI / 2
  const x = 8 + 7 * Math.cos(angle), y = 8 + 7 * Math.sin(angle)
  return <svg className="progress-pie" viewBox="0 0 16 16" aria-hidden="true"><title>{percent}% read</title><circle className="track" cx="8" cy="8" r="7" />{percent === 100 ? <circle className="fill" cx="8" cy="8" r="7" /> : <path className="fill" d={`M8 8 L8 1 A7 7 0 ${percent > 50 ? 1 : 0} 1 ${x} ${y} Z`} />}</svg>
}
const MODERN_STATE_LABEL = { ready: 'Ready', preparing: 'Preparing', queued: 'Queued' } as const
const date = (timestamp: number) => Number.isFinite(timestamp) ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(timestamp) : ''
// Blank-margin notes keep a point anchor, but deliberately have no quoted words.
const isPointNote = (h: LabHighlight) => !isLabChapterNote(h) && !h.text && h.paragraphIndex === h.endParagraphIndex && h.fromWord === h.toWord
const needsQuote = (h: LabHighlight) => !h.text && !isLabChapterNote(h) && !isPointNote(h)
const savedCardDetails = (data: Record<string, unknown> | undefined) => { try { return data ? JSON.stringify(data, null, 2) : '' } catch { return '' } }

/** Design 1's final tree; browsing and overlays never commit a reading tuple. */
export function LabContentsV2(props: Props) {
  const { open, bookId, title, editionKey, editionLabel, chapters, sections, currentChapter, statuses, onClose } = props
  const nodes = useMemo(() => contentsTree(chapters, sections, bookId === 'bible'), [chapters, sections, bookId])
  const flat = useMemo(() => flattenContents(nodes), [nodes])
  const current = flat.find(node => node.chapter === currentChapter)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(current?.parents.map(n => n.id)))
  const [view, setView] = useState<View | null>(null)
  const [tab, setTab] = useState<'chapters' | 'figures'>('chapters')
  const figures = props.figures ?? []
  const [scope, setScope] = useState<Scope>('all')
  const [query, setQuery] = useState('')
  const [chapterFilter, setChapterFilter] = useState<number | null>(null)
  const [selection, setSelection] = useState<LabHighlight | null>(null)
  const [crumbs, setCrumbs] = useState<ContentsNode[]>([])
  const [limit, setLimit] = useState(30)
  const [order, setOrder] = useState<LabHighlightOrder>('oldest')
  const [notesFilter, setNotesFilter] = useState(false)
  const [notebookFilter, setNotebookFilter] = useState<NotebookFilter>('all')
  const [hiddenNotebook, setHiddenNotebook] = useState<Set<string>>(new Set())
  const [undoNotebook, setUndoNotebook] = useState<{ restore: () => boolean | void; id: string } | null>(null)
  const [notebookFeedback, setNotebookFeedback] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const notebookScroll = useRef(0)
  const returnFocus = useRef<HTMLElement | null>(null)
  const reveal = useRef(true)
  const editionIdentity = bookId + ':' + editionKey
  const [loadedText, setLoadedText] = useState<{ key: string; data: EditionData } | null>(null)
  const data = loadedText?.key === editionIdentity ? loadedText.data : null
  const [loadError, setLoadError] = useState(false)
  const [retry, setRetry] = useState(0)
  const chats = useMemo(() => props.conversations.filter(chat => chat.bookId === bookId), [props.conversations, bookId])
  const highlights = props.highlights.filter(h => h.bookId === bookId && h.editionKey === editionKey)
  const chapterNotes = (props.chapterNotes ?? []).filter(h => h.bookId === bookId)
  const chapterPlace = useMemo(() => {
    const places = new Map(chapters.map((chapter, index) => [chapter.number, index]))
    return (n: number) => places.get(n) ?? chapters.length + n
  }, [chapters])
  const results = useMemo(() => searchContents(query, chapters, data, chats, highlights), [query, chapters, data, chats, props.highlights])
  // The Notebook loads the book's text only for a mark that does not carry its own words (a reader's own book's
  // text is not an edition the loader has).
  const needsText = open && (view === 'search'
    || ((view === 'highlights' || (view === 'notebook' && notebookFilter !== 'ai')) && highlights.some(needsQuote))
    || (view === 'highlight' && !!selection && needsQuote(selection)))
  const chapterTitle = (n: number) => chapters.find(ch => ch.number === n)?.title || 'Chapter ' + n
  const quote = (h: LabHighlight) => h.text || contentsQuote(h, data)
  const sourceText = (h: LabHighlight, quoted = false) => {
    if (isPointNote(h)) return null
    const text = quote(h)
    return text ? (quoted ? `“${text}”` : text)
      : (data || loadError ? 'Passage unavailable' : <LabWait label="Loading highlighted passage…" size={16} />)
  }
  const showOverlay = (next: View, chapter: number | null = null) => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setView(next); setChapterFilter(chapter); setLimit(30)
    if (next === 'search') { setQuery(''); setScope('all') }
  }
  const closeOverlay = () => { setView(null); setSelection(null); requestAnimationFrame(() => returnFocus.current?.focus({ preventScroll: true })) }
  const closeAction = useRef(() => {})
  closeAction.current = () => {
    if (view === 'highlight') { setView(props.notebook ? 'notebook' : 'highlights'); setSelection(null) }
    else if (view === 'notebook') onClose()
    else if (view) closeOverlay()
    else onClose()
  }

  useEffect(() => {
    if (!open) return
    setExpanded(new Set(current?.parents.map(n => n.id))); setView(props.notebook ? 'notebook' : null); setChapterFilter(null)
    if (!props.sharedNotebook) setNotebookFilter('all')
    setCrumbs([]); reveal.current = true
  }, [open, bookId, currentChapter, props.chaptersReady, props.notebook])
  useEffect(() => { if (open) { setHiddenNotebook(new Set()); setUndoNotebook(null); setNotebookFeedback('') } }, [open, bookId])
  useEffect(() => { setLoadedText(null); setLoadError(false); setView(open && props.notebook ? 'notebook' : null); setTab('chapters'); setNotebookFilter('all') }, [bookId, editionKey])
  useLayoutEffect(() => { if (open && view === 'notebook' && props.sharedNotebook && resultsRef.current) resultsRef.current.scrollTop = notebookScroll.current }, [open, view])
  useEffect(() => { notebookScroll.current = 0; if (resultsRef.current) resultsRef.current.scrollTop = 0 }, [bookId, editionKey])
  useEffect(() => {
    if (!needsText || data) return
    let cancelled = false
    setLoadError(false)
    void loadEdition(bookId, editionKey, { forceWholeBook: true }).then(edition => {
      if (!cancelled) setLoadedText({ key: editionIdentity, data: edition })
    }, () => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [bookId, editionKey, needsText, retry, data])
  useEffect(() => { setLimit(30) }, [query, scope])

  const locate = (id: string) => {
    const body = bodyRef.current
    const row = body?.querySelector<HTMLElement>(`[data-id="${id}"] > .node`)
    if (body && row) body.scrollTop = Math.max(0, body.scrollTop + row.getBoundingClientRect().top - body.getBoundingClientRect().top - 64)
  }
  const breadcrumb = () => {
    const body = bodyRef.current
    if (!body) return
    const top = body.getBoundingClientRect().top
    const near = Array.from(body.querySelectorAll<HTMLElement>('li:not(.branch) > .node')).find(node => node.offsetHeight && node.getBoundingClientRect().bottom > top + 40)
    const parents = body.scrollTop < 28 ? [] : flat.find(n => n.id === near?.parentElement?.dataset.id)?.parents || []
    setCrumbs(previous => previous.map(n => n.id).join('|') === parents.map(n => n.id).join('|') ? previous : parents)
  }
  const geometry = () => {
    for (const ul of bodyRef.current?.querySelectorAll<HTMLElement>('ul.nested') || []) {
      const children = Array.from(ul.children).filter(node => node.tagName === 'LI') as HTMLElement[]
      const last = children.at(-1), rail = ul.querySelector<HTMLElement>(':scope > .rail')
      if (!last || !rail) continue
      rail.style.height = Math.max(0, last.offsetTop + (last.querySelector<HTMLElement>(':scope > .node')?.offsetHeight || 0) / 2 - 8) + 'px'
      for (const li of children) {
        const curve = li.querySelector<HTMLElement>(':scope > .curve')
        if (curve) curve.style.height = (li.querySelector<HTMLElement>(':scope > .node')?.offsetHeight || 0) / 2 + 'px'
      }
      const active = children.find(li => li.classList.contains('reading') || li.classList.contains('on-path'))
      const gold = ul.querySelector<HTMLElement>(':scope > .gold-branch')
      if (gold && active) gold.style.height = active.offsetTop + (active.querySelector<HTMLElement>(':scope > .node')?.offsetHeight || 0) / 2 + 'px'
    }
    if (reveal.current && current && bodyRef.current?.querySelector(`[data-id="${current.id}"]`)) { locate(current.id); reveal.current = false }
    breadcrumb()
  }
  const geometryRef = useRef(geometry); geometryRef.current = geometry
  useLayoutEffect(() => { if (open) geometry() }, [open, expanded, nodes, currentChapter])
  useEffect(() => {
    if (!open || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => geometryRef.current())
    if (panelRef.current) observer.observe(panelRef.current)
    const tree = bodyRef.current?.querySelector('.tree')
    if (tree) observer.observe(tree)
    return () => observer.disconnect()
  }, [open, props.chaptersReady])
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLButtonElement>('.title')?.focus({ preventScroll: true })
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeAction.current(); return }
      if (event.key !== 'Tab') return
      const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button,input') || []).filter(node => !node.closest('[inert]') && !node.hasAttribute('disabled') && node.getClientRects().length)
      const first = controls[0], last = controls.at(-1)
      if (event.shiftKey && (document.activeElement === first || !panelRef.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !panelRef.current?.contains(document.activeElement))) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', key, true)
    return () => { document.removeEventListener('keydown', key, true); if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [open])
  useEffect(() => {
    if (view) panelRef.current?.querySelector<HTMLElement>('.overlay input, .overlay [data-close]')?.focus()
  }, [view])

  const onPath = new Set(current?.parents.map(n => n.id))
  const toggle = (id: string) => setExpanded(previous => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next })
  const tree = (list: ContentsNode[], parent?: ContentsNode) => <ul className={parent ? 'nested' : undefined}>
    {parent && <button className="rail" onClick={() => { toggle(parent.id); requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>(`[data-id="${parent.id}"] > .node > .label`)?.focus()) }} aria-label={'Collapse ' + parent.label} tabIndex={-1} />}
    {list.map(node => {
      const reading = node.chapter === currentChapter
      const percent = node.chapter == null ? null : contentsPercent(statuses.get(node.chapter), reading, props.currentPercent)
      const cs = chats.filter(chat => chat.chapterNumber === node.chapter), hs = [...highlights, ...chapterNotes].filter(h => h.chapterNumber === node.chapter)
      const branch = !!node.children, unfolded = expanded.has(node.id)
      const label = node.chapter == null ? node.label : chapterTitle(node.chapter)
      const status = percent != null ? percent + '% read' : statuses.get(node.chapter!)?.kind === 'in-progress' ? 'In progress' : statuses.get(node.chapter!)?.kind === 'visited' ? 'Visited' : 'unread'
      return <li key={node.id} data-id={node.id} data-chapter={node.chapter} className={[branch ? 'branch' : '', unfolded ? 'open' : '', reading ? 'reading' : '', onPath.has(node.id) ? 'on-path' : ''].join(' ')}>
        {parent && <span className="curve" />}
        <div className="node">
          <button className="label" aria-expanded={branch ? unfolded : undefined} aria-current={reading ? 'page' : undefined} aria-label={branch ? label : label + (reading ? ', currently reading' : '') + ', ' + status} title={branch || status === 'unread' ? undefined : status}
            data-testid={node.chapter == null ? undefined : 'lab-tree-chapter-' + node.chapter}
            onPointerEnter={() => { if (node.chapter != null) props.onWarmChapter(node.chapter) }}
            onClick={() => { if (branch) toggle(node.id); else if (node.chapter != null) props.onSelectChapter(node.chapter) }}>
            <span className="text">{node.label}</span>
            {!branch && node.chapter != null && props.modernStates?.[node.chapter] && <span className="modern-state" data-testid={'lab-tree-modern-' + node.chapter}>{MODERN_STATE_LABEL[props.modernStates[node.chapter]]}</span>}
            {branch ? <Icon name="next" /> : percent != null && percent > 0 ? <ProgressPie percent={percent} /> : null}
          </button>
          {(cs.length > 0 || hs.length > 0) && <span className="tags">
            {hs.length > 0 && <button aria-label={hs.length + (hs.some(isLabChapterNote) ? ' highlights and notes in ' : ' highlights in ') + label} onClick={() => showOverlay('highlights', node.chapter!)}><HighlightIcon size={16} />{hs.length}</button>}
            {cs.length > 0 && <button aria-label={cs.length + ' chats in ' + label} onClick={() => showOverlay('chats', node.chapter!)}><ChatIcon size={16} />{cs.length}</button>}
          </span>}
        </div>
        {branch && unfolded && tree(node.children!, node)}
      </li>
    })}
    {parent && list.some(n => n.chapter === currentChapter || onPath.has(n.id)) && <span className="gold-branch" />}
  </ul>
  const relevantChats = chats.filter(chat => chapterFilter == null || chat.chapterNumber === chapterFilter).sort((a,b) => b.endTimestamp - a.endTimestamp)
  const listed = [...highlights, ...chapterNotes].filter(h => chapterFilter == null || h.chapterNumber === chapterFilter)
  const relevantHighlights = orderLabHighlights(notesFilter ? labNotesOnly(listed) : listed, order, chapterPlace)
  const chatRow = (chat: ChatConversation) => <button className="result" key={chat.id} data-testid={'contents-chat-' + chat.id} onClick={() => props.onContinueConversation(chat)}>
    <small>{chapterTitle(chat.chapterNumber)} · {date(chat.startTimestamp)}</small><p><Match text={contentsExcerpt(contentsQuestion(chat), query)} query={view === 'search' ? query : ''} /></p>
    <p className="excerpt"><Match text={contentsExcerpt((view === 'search' && query.trim() ? chat.messages.find(m => m.content.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))?.content : null) || chat.messages.find(m => m.role === 'assistant')?.content || chat.summary || '', query)} query={view === 'search' ? query : ''} /></p>
  </button>
  // The note is the reader's own words, shown whole beneath the book's.
  const noteText = (h: LabHighlight) => h.note?.trim() ? <p className="note">{h.note.trim()}</p> : null
  // Notes only (approved mockup, 12 Oct): the reader's takeaway leads, the passage it came from beneath it.
  const noteLead = (h: LabHighlight) => <p className="note-lead">{h.note?.trim()}</p>
  const highlightRow = (h: LabHighlight) => isLabChapterNote(h)
    ? <button className="result is-chapter-note" key={h.id} data-testid={'contents-chapter-note-' + h.id} onClick={() => { setSelection(h); setView('highlight') }}>
      <small>{chapterTitle(h.chapterNumber)} · Chapter note</small>{notesFilter ? noteLead(h) : noteText(h)}
    </button>
    : notesFilter && h.note?.trim()
    ? <button className="result is-note-first" key={h.id} data-testid={'contents-highlight-' + h.id} onClick={() => { setSelection(h); setView('highlight') }}>
      <small>{chapterTitle(h.chapterNumber)}</small>{noteLead(h)}{!isPointNote(h) && <p className="note-source">{sourceText(h, true)}</p>}
    </button>
    : <button className="result" key={h.id} data-testid={'contents-highlight-' + h.id} onClick={() => { setSelection(h); setView('highlight') }}>
      <small>{chapterTitle(h.chapterNumber)}</small>{!isPointNote(h) && <p>{sourceText(h)}</p>}{noteText(h)}
    </button>
  const legacyOwnEpubRow = (item: LegacyOwnEpubNotebookItem) => <article className="result" key={'legacy-epub-' + item.id} data-testid={'contents-legacy-epub-' + item.id}>
    <small>Original EPUB page {item.page} · {item.kind === 'card' ? 'Saved AI card' : 'Saved highlight'}</small>
    <p>{item.text}</p>
    {item.note?.trim() && <p className="note">{item.note.trim()}</p>}
    {item.turns?.map((turn, index) => <p className="legacy-turn" key={index}><strong>{turn.role === 'assistant' ? 'A.' : 'Q.'}</strong> {turn.content}</p>)}
    {savedCardDetails(item.data) && <details className="legacy-card-state"><summary>Saved card details</summary><pre>{savedCardDetails(item.data)}</pre></details>}
  </article>
  const notebookMarkdown = () => sharedNotebookMarkdown({ title, bookId, editionKey,
    highlights: highlights.filter(item => !hiddenNotebook.has('highlight:' + item.id)),
    chapterNotes: chapterNotes.filter(item => !hiddenNotebook.has('highlight:' + item.id)),
    conversations: chats.filter(item => !hiddenNotebook.has('card:' + item.id)),
    legacyOwnEpubItems: props.legacyOwnEpubItems, chapterTitle, quote })
  const copyNotebook = async () => {
    try { await navigator.clipboard.writeText(notebookMarkdown()); setNotebookFeedback('Notebook copied.') }
    catch { setNotebookFeedback('Could not copy the Notebook. Download is still available.') }
  }
  const downloadNotebook = () => {
    const url = URL.createObjectURL(new Blob([notebookMarkdown()], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = sharedNotebookFilename(title); document.body.append(link); link.click(); link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setNotebookFeedback('Notebook downloaded.')
  }
  const deleteNotebook = (item: { kind: 'highlight' | 'card'; id: string }) => {
    const restore = props.onDeleteNotebookItem?.(item)
    if (!restore) return
    setHiddenNotebook(current => new Set(current).add(item.kind + ':' + item.id))
    setUndoNotebook({ restore, id: item.kind + ':' + item.id })
    setNotebookFeedback('Entry deleted.')
  }
  const undoNotebookDelete = () => {
    if (!undoNotebook) return
    let restored: boolean | void
    try { restored = undoNotebook.restore() } catch { restored = false }
    if (restored === false) { setNotebookFeedback('Could not restore entry.'); return }
    setHiddenNotebook(current => { const next = new Set(current); next.delete(undoNotebook.id); return next })
    setUndoNotebook(null)
    setNotebookFeedback('Entry restored.')
  }
  // The Notebook: the same rows as Chats and Highlights & notes, in one list, newest first.
  const notebookRows = view !== 'notebook' ? [] : [
    ...(notebookFilter !== 'ai' ? [...highlights, ...chapterNotes].map(h => ({ at: highlightCreatedAt(h), id: 'highlight:' + h.id, deleteItem: { kind: 'highlight' as const, id: h.id }, row: () => highlightRow(h) })) : []),
    ...(notebookFilter !== 'mine' ? chats.filter(chat => !isCardTombstone(chat)).map(chat => ({ at: chat.endTimestamp, id: 'card:' + chat.id,
      deleteItem: chat.card ? { kind: 'card' as const, id: chat.id } : null, row: () => chatRow(chat) })) : []),
    ...(props.legacyOwnEpubItems ?? []).filter(item => notebookFilter === 'all' || (notebookFilter === 'ai') === (item.kind === 'card')).map(item => ({ at: item.at, id: 'legacy:' + item.id, deleteItem: null, row: () => legacyOwnEpubRow(item) })),
  ].filter(item => !hiddenNotebook.has(item.id)).sort((a, b) => b.at - a.at)
  const more = (count: number) => count > limit && <button className="more" onClick={() => setLimit(n => n + 30)}>Show more · {count - limit} remaining</button>
  const textStatus = needsText && !data && (loadError
    ? <p className="status" role="status">Text could not be loaded. <button onClick={() => setRetry(n => n + 1)}>Retry</button></p>
    : <p className="status"><LabWait label="Loading passage text…" size={18} /></p>)
  const historyStatus = props.historyStatus !== 'ready' && <p className="status" role="status">{props.historyStatus === 'loading' ? 'Loading saved conversations…' : 'Showing conversations saved on this device. Cloud history is unavailable.'}</p>
  const shownResults = (scope !== 'chats' ? results.chapters.length + results.passages.length : 0) + (scope !== 'book' ? results.chats.length : 0)
  if (!open) return null
  return <div className="lab-contents-v2" data-testid="lab-toc">
    <button className="lc-scrim" onClick={onClose} aria-label="Close contents" tabIndex={-1} />
    <div className="menu" role="dialog" aria-modal="true" aria-label="Contents and conversations" ref={panelRef} data-testid="lab-contents-v2">
      <header inert={view ? true : undefined}>
        <button className="title" aria-label={'Switch books, currently ' + title} onClick={props.onSwitchBook}>{title}</button>
        <div className="actions"><button onClick={() => showOverlay('search')} aria-label="Search contents" disabled={!props.chaptersReady}><Icon name="search" /></button><button onClick={() => showOverlay('highlights')} aria-label="Highlights" disabled={!props.chaptersReady}><HighlightIcon size={16} /></button><button onClick={onClose} aria-label="Back to book"><Icon name="close" /></button></div>
      </header>
      {figures.length > 0 && <nav className="tabs" aria-label="Contents" inert={view ? true : undefined}>
        <button aria-pressed={tab === 'chapters'} data-testid="lab-contents-tab-chapters" onClick={() => setTab('chapters')}>Chapters</button>
        <button aria-pressed={tab === 'figures'} data-testid="lab-contents-tab-figures" onClick={() => setTab('figures')}>Figures</button>
      </nav>}
      {tab === 'figures' && figures.length > 0 ? <div className="viewport figures" inert={view ? true : undefined}>
        <ol className="figure-list" aria-label="Figures">{figures.map(figure => (
          <li key={figure.id}>
            <button className="figure-row" data-testid="lab-contents-figure" data-figure-id={figure.id}
              onClick={() => props.onOpenPassage({ chapterNumber: figure.chapterNumber ?? currentChapter, paragraphIndex: figure.paragraphIndex ?? 0, wordIndex: 0 })}>
              <LabFigureThumb figure={figure} />
              <span className="figure-text"><small>Figure {figure.number} · {chapterTitle(figure.chapterNumber ?? currentChapter)}</small>{(figure.caption || figure.alt) && <span className="figure-caption">{figure.caption || figure.alt}</span>}</span>
            </button>
          </li>
        ))}</ol>
      </div> : <>
      {crumbs.length > 0 && !view && <nav className="crumbs" aria-label="Visible chapter path">{crumbs.map((node,index) => <span key={node.id}>{index > 0 && <Icon name="next" />}<button onClick={() => locate(node.id)}>{node.label}</button></span>)}</nav>}
      <div className="viewport" ref={bodyRef} onScroll={breadcrumb} inert={view ? true : undefined}>
        {props.chaptersReady ? <nav className="tree" aria-label="Chapters">{props.onOpenIntroduction && <div className="front-matter"><div className="node"><button className="label" onClick={props.onOpenIntroduction}><span className="text">Introduction</span><Icon name="next" /></button></div></div>}{tree(nodes)}</nav> : <p className="status"><LabWait label="Loading contents…" size={18} testId="lab-contents-loading" /></p>}
        {historyStatus}
      </div>
      </>}
      {view && <section className="overlay" aria-label={view === 'search' ? 'Search book and chats' : view === 'chats' ? 'Chats' : view === 'notebook' ? LAB_NOTEBOOK_LABEL : 'Highlights & notes'}>
        <div className="overlay-head">
          {view === 'search' ? <><Icon name="search" /><input type="search" aria-label={'Search ' + title} placeholder="Search book or chats…" value={query} onChange={event => setQuery(event.target.value)} /></> : <span className="overlay-title">{view === 'notebook' ? LAB_NOTEBOOK_LABEL : view === 'chats' ? 'Chats' : view === 'highlight' ? (selection && isLabChapterNote(selection) ? 'Chapter note' : 'Highlight') : 'Highlights & notes'}</span>}
          {view === 'notebook' && props.sharedNotebook && <div className="notebook-tools"><button aria-label="Copy all Notebook entries" onClick={() => { void copyNotebook() }}>Copy all</button><button aria-label="Download Notebook" onClick={downloadNotebook}>Download</button></div>}
          <button data-close aria-label="Close overlay" onClick={() => closeAction.current()}><Icon name="close" /></button>
        </div>
        {view === 'highlights' && <nav className="scopes" aria-label="Highlights shown">
          <button aria-pressed={!notesFilter} onClick={() => setNotesFilter(false)}>All</button>
          <button aria-pressed={notesFilter} onClick={() => setNotesFilter(true)}>Notes only</button>
          <button className="order" aria-pressed={order === 'newest'} onClick={() => setOrder(value => value === 'newest' ? 'oldest' : 'newest')}>Newest first</button>
        </nav>}
        {view === 'notebook' && <nav className="scopes" aria-label="Notebook shown">
          {NOTEBOOK_FILTERS.map(([value, label]) => <button key={value} aria-pressed={notebookFilter === value} data-testid={'contents-notebook-' + value} onClick={() => { setNotebookFilter(value); setLimit(30); notebookScroll.current = 0; if (resultsRef.current) resultsRef.current.scrollTop = 0 }}>{label}</button>)}
        </nav>}
        {view === 'search' && <nav className="scopes" aria-label="Search scope">{(['all','book','chats'] as Scope[]).map(value => <button key={value} aria-pressed={scope === value} onClick={() => setScope(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</nav>}
        <div className="results" aria-live="polite" ref={resultsRef} onScroll={view === 'notebook' && props.sharedNotebook ? event => { notebookScroll.current = event.currentTarget.scrollTop } : undefined}>
          {historyStatus}{textStatus}
          {view === 'search' && (!query.trim() ? <p className="status">Search chapters, passages and chats.</p> : <>
            {scope !== 'chats' && <>{results.chapters.slice(0,limit).map(ch => <button className="result" key={'chapter-' + ch.number} onClick={() => props.onSelectChapter(ch.number)}><small>Chapter</small><p><Match text={ch.title} query={query} /></p></button>)}{more(results.chapters.length)}
              {results.passages.slice(0,limit).map(place => <button className="result" key={place.chapterNumber + ':' + place.paragraphIndex} onClick={() => props.onOpenPassage(place)}><small>{place.title}</small><p><Match text={place.text} query={query} /></p></button>)}{more(results.passages.length)}</>}
            {scope !== 'book' && <>{results.chats.slice(0,limit).map(chatRow)}{more(results.chats.length)}</>}
            {(scope === 'chats' || data) && (scope === 'book' || props.historyStatus === 'ready') && !shownResults && <p className="status">No matches.</p>}
          </>)}
          {view === 'notebook' && <>{props.sharedNotebook && notebookFeedback && <p className="status" role="status">{notebookFeedback} {undoNotebook && <button onClick={undoNotebookDelete}>Undo</button>}</p>}{notebookRows.slice(0, limit).map(item => props.sharedNotebook && item.deleteItem && props.onDeleteNotebookItem
            ? <div className="notebook-entry" key={item.id}>{item.row()}<button className="notebook-delete" aria-label={'Delete Notebook entry ' + item.deleteItem.id} onClick={() => deleteNotebook(item.deleteItem!)}>Delete</button></div>
            : item.row())}{more(notebookRows.length)}{!notebookRows.length && props.historyStatus !== 'loading' && <p className="status">{notebookFilter === 'ai' ? 'No saved conversations.' : notebookFilter === 'mine' ? 'No highlights or notes saved for this edition.' : 'Nothing saved in this book yet.'}</p>}</>}
          {view === 'chats' && <>{relevantChats.slice(0,limit).map(chatRow)}{more(relevantChats.length)}{!relevantChats.length && props.historyStatus === 'ready' && <p className="status">No saved conversations.</p>}</>}
          {view === 'highlights' && <>{relevantHighlights.slice(0,limit).map(highlightRow)}{more(relevantHighlights.length)}{notesFilter && relevantHighlights.length > 0 && <p className="status note-count">{relevantHighlights.length === 1 ? '1 note' : `${relevantHighlights.length} notes`} in {title}</p>}{!relevantHighlights.length && <p className="status">{notesFilter ? 'No notes saved for this edition.' : 'No highlights saved for this edition.'}</p>}{props.unassignedHighlights.length > 0 && <button className="more" onClick={() => setView('older')}>Older highlights · book not recorded</button>}</>}
          {view === 'older' && <><p className="status">These older marks have no saved book or edition. They are preserved here; their quotations cannot be identified safely.</p>{props.unassignedHighlights.map(h => <article className="result" key={h.id}><small>Chapter {h.chapterNumber} · paragraph {h.paragraphIndex + 1}</small><p>{h.note || 'Highlighted passage'}</p></article>)}</>}
          {view === 'highlight' && selection && (isLabChapterNote(selection)
            ? <article className="result is-chapter-note"><small>{chapterTitle(selection.chapterNumber)}</small>{noteText(selection)}<button className="more" onClick={() => props.onOpenPassage({ chapterNumber: selection.chapterNumber, paragraphIndex: 0, wordIndex: 0 })}>Open chapter<Icon name="next" /></button></article>
            : <article className="result"><small>{chapterTitle(selection.chapterNumber)} · {editionLabel}</small>{!isPointNote(selection) && <p>{sourceText(selection)}</p>}{noteText(selection)}<button className="more" onClick={() => props.onOpenPassage({ chapterNumber: selection.chapterNumber, paragraphIndex: selection.paragraphIndex, wordIndex: selection.fromWord })}>Open passage<Icon name="next" /></button></article>)}
        </div>
      </section>}
    </div>
  </div>
}
