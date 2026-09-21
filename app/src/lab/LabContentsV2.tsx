import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ChatConversation, EditionData, Section } from '../types'
import { loadEdition } from '../data/editionLoader'
import type { LabChapter } from './labSource'
import type { LabHighlight } from './labHighlights'
import type { LabChapterStatus } from './labChapterStatus'
import { contentsExcerpt, contentsQuestion, contentsQuote, searchContents, type ContentsPlace } from './labContents'
import './labContentsV2.css'

import { contentsTree, flattenContents, contentsPercent, type ContentsNode } from './labContentsTree'

type View = 'search' | 'highlights' | 'chats' | 'highlight' | 'older'
type Scope = 'all' | 'book' | 'chats'
interface Props {
  open: boolean; bookId: string; title: string; editionKey: string; editionLabel: string
  chapters: LabChapter[]; sections?: Section[]; currentChapter: number; currentPage: number; totalPages: number; currentPercent?: number
  chaptersReady: boolean
  statuses: Map<number, LabChapterStatus>; conversations: ChatConversation[]; highlights: LabHighlight[]; unassignedHighlights: LabHighlight[]
  historyStatus: 'loading' | 'ready' | 'unavailable'
  onOpenCover?: () => void
  onClose: () => void; onSelectChapter: (chapter: number) => void; onWarmChapter: (chapter: number) => void
  onOpenPassage: (place: ContentsPlace) => void; onContinueConversation: (conversation: ChatConversation) => void
}
function Icon({ name }: { name: 'search' | 'next' | 'highlight' | 'chat' | 'close' }) {
  const paths = {
    search: 'm21 21-4.34-4.34M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    next: 'm9 18 6-6-6-6', chat: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z',
    highlight: 'm9 11-6 6v3h9l3-3 M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4',
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
const date = (timestamp: number) => Number.isFinite(timestamp) ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(timestamp) : ''

/** Design 1's final tree; browsing and overlays never commit a reading tuple. */
export function LabContentsV2(props: Props) {
  const { open, bookId, title, editionKey, editionLabel, chapters, sections, currentChapter, statuses, onClose } = props
  const nodes = useMemo(() => contentsTree(chapters, sections, bookId === 'bible'), [chapters, sections, bookId])
  const flat = useMemo(() => flattenContents(nodes), [nodes])
  const current = flat.find(node => node.chapter === currentChapter)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(current?.parents.map(n => n.id)))
  const [view, setView] = useState<View | null>(null)
  const [scope, setScope] = useState<Scope>('all')
  const [query, setQuery] = useState('')
  const [chapterFilter, setChapterFilter] = useState<number | null>(null)
  const [selection, setSelection] = useState<LabHighlight | null>(null)
  const [fullTitle, setFullTitle] = useState(false)
  const [crumbs, setCrumbs] = useState<ContentsNode[]>([])
  const [limit, setLimit] = useState(30)
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const reveal = useRef(true)
  const editionIdentity = bookId + ':' + editionKey
  const [loadedText, setLoadedText] = useState<{ key: string; data: EditionData } | null>(null)
  const data = loadedText?.key === editionIdentity ? loadedText.data : null
  const [loadError, setLoadError] = useState(false)
  const [retry, setRetry] = useState(0)
  const chats = useMemo(() => props.conversations.filter(chat => chat.bookId === bookId), [props.conversations, bookId])
  const highlights = props.highlights.filter(h => h.bookId === bookId && h.editionKey === editionKey)
  const results = useMemo(() => searchContents(query, chapters, data, chats, highlights), [query, chapters, data, chats, props.highlights])
  const needsText = open && (view === 'search' || view === 'highlights' || view === 'highlight')
  const chapterTitle = (n: number) => chapters.find(ch => ch.number === n)?.title || 'Chapter ' + n
  const quote = (h: LabHighlight) => h.text || contentsQuote(h, data)
  const showOverlay = (next: View, chapter: number | null = null) => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setView(next); setChapterFilter(chapter); setFullTitle(false); setLimit(30)
    if (next === 'search') { setQuery(''); setScope('all') }
  }
  const closeOverlay = () => { setView(null); setSelection(null); requestAnimationFrame(() => returnFocus.current?.focus({ preventScroll: true })) }
  const closeAction = useRef(() => {})
  closeAction.current = () => {
    if (view === 'highlight') { setView('highlights'); setSelection(null) }
    else if (view) closeOverlay()
    else if (fullTitle) setFullTitle(false)
    else onClose()
  }

  useEffect(() => {
    if (!open) return
    setExpanded(new Set(current?.parents.map(n => n.id))); setView(null); setFullTitle(false)
    setCrumbs([]); reveal.current = true
  }, [open, bookId, currentChapter, props.chaptersReady])
  useEffect(() => { setLoadedText(null); setLoadError(false); setView(null) }, [bookId, editionKey])
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
      const cs = chats.filter(chat => chat.chapterNumber === node.chapter), hs = highlights.filter(h => h.chapterNumber === node.chapter)
      const branch = !!node.children, unfolded = expanded.has(node.id)
      const label = node.chapter == null ? node.label : chapterTitle(node.chapter)
      const status = percent != null ? percent + '% read' : statuses.get(node.chapter!)?.kind === 'in-progress' ? 'In progress' : statuses.get(node.chapter!)?.kind === 'visited' ? 'Visited' : 'unread'
      return <li key={node.id} data-id={node.id} data-chapter={node.chapter} className={[branch ? 'branch' : '', unfolded ? 'open' : '', reading ? 'reading' : '', onPath.has(node.id) ? 'on-path' : ''].join(' ')}>
        {parent && <span className="curve" />}
        <div className="node">
          <button className="label" aria-expanded={branch ? unfolded : undefined} aria-current={reading ? 'page' : undefined} aria-label={branch ? label : label + (reading ? ', currently reading' : '') + ', ' + status} title={branch ? undefined : status}
            data-testid={node.chapter == null ? undefined : 'lab-tree-chapter-' + node.chapter}
            onPointerEnter={() => { if (node.chapter != null) props.onWarmChapter(node.chapter) }}
            onClick={() => { if (branch) toggle(node.id); else if (node.chapter != null) props.onSelectChapter(node.chapter) }}>
            <span className="text">{node.label}</span>{branch ? <Icon name="next" /> : percent != null && percent > 0 ? <ProgressPie percent={percent} /> : null}
          </button>
          {(cs.length > 0 || hs.length > 0) && <span className="tags">
            {hs.length > 0 && <button aria-label={hs.length + ' highlights in ' + label} onClick={() => showOverlay('highlights', node.chapter!)}><Icon name="highlight" />{hs.length}</button>}
            {cs.length > 0 && <button aria-label={cs.length + ' chats in ' + label} onClick={() => showOverlay('chats', node.chapter!)}><Icon name="chat" />{cs.length}</button>}
          </span>}
        </div>
        {branch && unfolded && tree(node.children!, node)}
      </li>
    })}
    {parent && list.some(n => n.chapter === currentChapter || onPath.has(n.id)) && <span className="gold-branch" />}
  </ul>
  const relevantChats = chats.filter(chat => chapterFilter == null || chat.chapterNumber === chapterFilter).sort((a,b) => b.endTimestamp - a.endTimestamp)
  const relevantHighlights = highlights.filter(h => chapterFilter == null || h.chapterNumber === chapterFilter)
  const chatRow = (chat: ChatConversation) => <button className="result" key={chat.id} data-testid={'contents-chat-' + chat.id} onClick={() => props.onContinueConversation(chat)}>
    <small>{chapterTitle(chat.chapterNumber)} · {date(chat.startTimestamp)}</small><p><Match text={contentsExcerpt(contentsQuestion(chat), query)} query={view === 'search' ? query : ''} /></p>
    <p className="excerpt"><Match text={contentsExcerpt((view === 'search' && query.trim() ? chat.messages.find(m => m.content.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))?.content : null) || chat.messages.find(m => m.role === 'assistant')?.content || chat.summary || '', query)} query={view === 'search' ? query : ''} /></p>
  </button>
  const highlightRow = (h: LabHighlight) => <button className="result" key={h.id} data-testid={'contents-highlight-' + h.id} onClick={() => { setSelection(h); setView('highlight') }}>
    <small>{chapterTitle(h.chapterNumber)}</small><p>{quote(h) || h.note || (loadError ? 'Passage unavailable' : 'Loading highlighted passage…')}</p>{h.note && <p className="excerpt">{h.note}</p>}
  </button>
  const more = (count: number) => count > limit && <button className="more" onClick={() => setLimit(n => n + 30)}>Show more · {count - limit} remaining</button>
  const textStatus = needsText && !data && <p className="status" role="status">{loadError ? <>Text could not be loaded. <button onClick={() => setRetry(n => n + 1)}>Retry</button></> : 'Loading passage text…'}</p>
  const historyStatus = props.historyStatus !== 'ready' && <p className="status" role="status">{props.historyStatus === 'loading' ? 'Loading saved conversations…' : 'Showing conversations saved on this device. Cloud history is unavailable.'}</p>
  const shownResults = (scope !== 'chats' ? results.chapters.length + results.passages.length : 0) + (scope !== 'book' ? results.chats.length : 0)
  if (!open) return null
  return <div className="lab-contents-v2" data-testid="lab-toc">
    <button className="lc-scrim" onClick={onClose} aria-label="Close contents" tabIndex={-1} />
    <div className="menu" role="dialog" aria-modal="true" aria-label="Contents and conversations" ref={panelRef} data-testid="lab-contents-v2">
      <header inert={view ? true : undefined}>
        <button className="title" aria-label={'Show full title: ' + title} aria-expanded={fullTitle} onClick={() => setFullTitle(value => !value)}>{title}</button>
        <div className="actions"><button onClick={() => showOverlay('search')} aria-label="Search contents" disabled={!props.chaptersReady}><Icon name="search" /></button><button onClick={() => showOverlay('highlights')} aria-label="Highlights" disabled={!props.chaptersReady}><Icon name="highlight" /></button></div>
      </header>
      {fullTitle && <div className="full-title">{title}</div>}
      {crumbs.length > 0 && !view && <nav className="crumbs" aria-label="Visible chapter path">{crumbs.map((node,index) => <span key={node.id}>{index > 0 && <Icon name="next" />}<button onClick={() => locate(node.id)}>{node.label}</button></span>)}</nav>}
      <div className="viewport" ref={bodyRef} onScroll={breadcrumb} inert={view ? true : undefined}>
        {props.chaptersReady ? <nav className="tree" aria-label="Chapters">{props.onOpenCover && <div className="node cover-preface"><button className="label" onClick={props.onOpenCover}><span className="text">Cover and preface</span><Icon name="next" /></button></div>}{tree(nodes)}</nav> : <p className="status" role="status">Loading contents…</p>}
        {historyStatus}
      </div>
      {view && <section className="overlay" aria-label={view === 'search' ? 'Search book and chats' : view === 'chats' ? 'Chats' : 'Highlights'}>
        <div className="overlay-head">
          {view === 'search' ? <><Icon name="search" /><input type="search" aria-label={'Search ' + title} placeholder="Search book or chats…" value={query} onChange={event => setQuery(event.target.value)} /></> : <span className="overlay-title">{view === 'chats' ? 'Chats' : view === 'highlight' ? 'Highlight' : 'Highlights'}</span>}
          <button data-close aria-label="Close overlay" onClick={() => closeAction.current()}><Icon name="close" /></button>
        </div>
        {view === 'search' && <nav className="scopes" aria-label="Search scope">{(['all','book','chats'] as Scope[]).map(value => <button key={value} aria-pressed={scope === value} onClick={() => setScope(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</nav>}
        <div className="results" aria-live="polite">
          {historyStatus}{textStatus}
          {view === 'search' && (!query.trim() ? <p className="status">Search chapters, passages and chats.</p> : <>
            {scope !== 'chats' && <>{results.chapters.slice(0,limit).map(ch => <button className="result" key={'chapter-' + ch.number} onClick={() => props.onSelectChapter(ch.number)}><small>Chapter</small><p><Match text={ch.title} query={query} /></p></button>)}{more(results.chapters.length)}
              {results.passages.slice(0,limit).map(place => <button className="result" key={place.chapterNumber + ':' + place.paragraphIndex} onClick={() => props.onOpenPassage(place)}><small>{place.title}</small><p><Match text={place.text} query={query} /></p></button>)}{more(results.passages.length)}</>}
            {scope !== 'book' && <>{results.chats.slice(0,limit).map(chatRow)}{more(results.chats.length)}</>}
            {(scope === 'chats' || data) && (scope === 'book' || props.historyStatus === 'ready') && !shownResults && <p className="status">No matches.</p>}
          </>)}
          {view === 'chats' && <>{relevantChats.slice(0,limit).map(chatRow)}{more(relevantChats.length)}{!relevantChats.length && props.historyStatus === 'ready' && <p className="status">No saved conversations.</p>}</>}
          {view === 'highlights' && <>{relevantHighlights.slice(0,limit).map(highlightRow)}{more(relevantHighlights.length)}{!relevantHighlights.length && <p className="status">No highlights saved for this edition.</p>}{props.unassignedHighlights.length > 0 && <button className="more" onClick={() => setView('older')}>Older highlights · book not recorded</button>}</>}
          {view === 'older' && <><p className="status">These older marks have no saved book or edition. They are preserved here; their quotations cannot be identified safely.</p>{props.unassignedHighlights.map(h => <article className="result" key={h.id}><small>Chapter {h.chapterNumber} · paragraph {h.paragraphIndex + 1}</small><p>{h.note || 'Highlighted passage'}</p></article>)}</>}
          {view === 'highlight' && selection && <article className="result"><small>{chapterTitle(selection.chapterNumber)} · {editionLabel}</small><p>{quote(selection)}</p>{selection.note && <p className="excerpt">{selection.note}</p>}<button className="more" onClick={() => props.onOpenPassage({ chapterNumber: selection.chapterNumber, paragraphIndex: selection.paragraphIndex, wordIndex: selection.fromWord })}>Open passage<Icon name="next" /></button></article>}
        </div>
      </section>}
    </div>
  </div>
}
