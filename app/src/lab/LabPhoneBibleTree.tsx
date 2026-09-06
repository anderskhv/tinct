import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ChatConversation, Section } from '../types'
import type { LabHighlight } from './labHighlights'
import type { LabChapter } from './labSource'
import { buildLabBibleTree, chapterRowsForBook, labTreeProgressLabel, type LabTreeNode } from './labBibleTree'
import { labChapterStatusLine, labLastReadAt, type LabChapterStatus } from './labChapterStatus'

type Filter = 'all' | 'highlights' | 'chats'
interface Props { title: string; chapters: LabChapter[]; currentChapter: number; sections?: Section[]; finishedChapters: Set<number>; statuses?: Map<number, LabChapterStatus>; highlights?: LabHighlight[]; conversations?: ChatConversation[]; onSelectChapter: (number: number) => void; onSelectHighlight?: (highlight: LabHighlight) => void; onOpenConversation?: (conversation: ChatConversation) => void; onNewConversation?: (chapter: number) => void; onWarmChapter?: (number: number) => void; onClose: () => void }

/** Put the current row in the top third of the scrolling body so the reader sees where they are and what comes next. */
function scrollCurrentIntoView(body: HTMLElement | null) {
  const row = body?.querySelector<HTMLElement>('[data-current="true"]')
  if (!body || !row) return
  const offset = row.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop
  body.scrollTop = Math.max(0, offset - body.clientHeight / 3)
}

function findPath(nodes: LabTreeNode[], chapter: number, path: LabTreeNode[] = []): LabTreeNode[] {
  for (const node of nodes) {
    const next = [...path, node]
    if (node.kind === 'book' && node.chapterNumbers.includes(chapter)) return next
    const found = node.children ? findPath(node.children, chapter, next) : []
    if (found.length) return found
  }
  return []
}
function formatDate(value: number) { return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value)) }

export function LabPhoneBibleTree({ title, chapters, currentChapter, sections, finishedChapters, statuses, highlights = [], conversations = [], onSelectChapter, onSelectHighlight, onOpenConversation, onNewConversation, onWarmChapter, onClose }: Props) {
  const tree = useMemo(() => buildLabBibleTree(sections, chapters), [sections, chapters])
  const currentPath = useMemo(() => findPath(tree, currentChapter), [tree, currentChapter])
  const [path, setPath] = useState<LabTreeNode[]>(() => currentPath)
  const [filter, setFilter] = useState<Filter>('all')
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [conversationChapter, setConversationChapter] = useState<number | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const bodyRef = useRef<HTMLElement | null>(null)
  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [onClose])
  useEffect(() => { if (searching) inputRef.current?.focus() }, [searching])
  const active = path[path.length - 1]
  const atCurrent = active ? (active.kind === 'book' && active.chapterNumbers.includes(currentChapter)) : tree.some(node => node.kind === 'chapter' && node.chapterNumber === currentChapter)
  const countFor = (node: LabTreeNode, kind: 'highlights' | 'chats') => kind === 'highlights' ? highlights.filter(item => node.chapterNumbers.includes(item.chapterNumber)).length : conversations.filter(item => node.chapterNumbers.includes(item.chapterNumber)).length
  const visibleNodes = active?.kind === 'book' ? [] : (active?.children || tree)
  const bookChapters = active?.kind === 'book' ? chapterRowsForBook(active, chapters) : []
  const passes = (chapterNumbers: number[]) => filter === 'all' || (filter === 'highlights' ? highlights : conversations).some(item => chapterNumbers.includes(item.chapterNumber))
  const lower = query.trim().toLowerCase()
  const searchChapters = lower ? chapters.filter(chapter => chapter.title.toLowerCase().includes(lower)) : []
  const searchHighlights = lower ? highlights.filter(item => item.note?.toLowerCase().includes(lower)) : []
  const searchChats = lower ? conversations.filter(item => item.messages.some(message => message.content.toLowerCase().includes(lower))) : []
  const chapterConversations = conversationChapter == null ? [] : conversations.filter(item => item.chapterNumber === conversationChapter).sort((a, b) => b.endTimestamp - a.endTimestamp)
  const statusLine = (chapter: number) => labChapterStatusLine(statuses?.get(chapter), chapter === currentChapter, formatDate)
  const lastReadAt = statuses ? labLastReadAt(statuses) : null
  const percentFinished = Math.round((finishedChapters.size / Math.max(1, chapters.length)) * 100)
  const listKey = `${active?.key ?? 'root'}|${searching}|${conversationChapter}|${selectedConversation?.id ?? ''}`
  // Open (and re-open, after "Current chapter") with the current row in view.
  useLayoutEffect(() => { if (atCurrent) scrollCurrentIntoView(bodyRef.current) }, [atCurrent, listKey])
  const goCurrent = () => { setPath(currentPath); setConversationChapter(null); requestAnimationFrame(() => scrollCurrentIntoView(bodyRef.current)) }

  return <div className="toc-overlay lab-tree" data-testid="lab-bible-tree"><div className="toc-panel lab-tree-panel">
    <header className="lab-map-head"><button type="button" className="lab-map-back" onClick={onClose} aria-label="Back to reader">←</button>{searching ? <div className="lab-map-search"><input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this book" /><button type="button" onClick={() => { setSearching(false); setQuery('') }}>Cancel</button></div> : <><div><h2>{title}</h2>{path.length === 0 && <small>{lastReadAt ? `Last read ${formatDate(lastReadAt)} · ` : ''}{percentFinished}% finished</small>}</div><button type="button" className="lab-map-search-button" onClick={() => setSearching(true)} aria-label="Search">⌕</button></>}</header>
    {!searching && <div className="lab-map-filters">{(['all', 'highlights', 'chats'] as Filter[]).map(value => <button type="button" key={value} className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>}
    <main className="lab-map-body" ref={bodyRef}>
      {searching ? <div className="lab-map-results">{!lower && <p>Search chapters, highlights, and conversations.</p>}{searchChapters.map(chapter => <button key={`c-${chapter.number}`} onClick={() => onSelectChapter(chapter.number)}><small>Chapter</small><strong>{chapter.title}</strong></button>)}{searchHighlights.map(item => <button key={item.id} onClick={() => onSelectHighlight?.(item)}><small>Highlight</small><strong>{item.note || `Highlighted passage in ${chapters.find(c => c.number === item.chapterNumber)?.title}`}</strong></button>)}{searchChats.map(item => <button key={item.id} onClick={() => { setConversationChapter(item.chapterNumber); setSearching(false) }}><small>Chat</small><strong>{item.preview}</strong></button>)}</div>
      : selectedConversation ? <section><button className="lab-map-crumb" onClick={() => setSelectedConversation(null)}>← Conversations</button><div className="lab-map-section-title"><h3>{chapters.find(item => item.number === selectedConversation.chapterNumber)?.title}</h3><small>{formatDate(selectedConversation.startTimestamp)}</small></div><div className="lab-map-source">Source passage · paragraph {(selectedConversation.paragraphIndex ?? 0) + 1}</div><div className="lab-map-thread">{selectedConversation.messages.map(message => <div key={message.id} className={`is-${message.role}`}><small>{message.role === 'user' ? 'You' : 'Tinct'}</small><p>{message.content}</p></div>)}</div><button className="lab-map-new-chat" onClick={() => onOpenConversation?.(selectedConversation)}>Continue this conversation</button></section>
      : conversationChapter != null ? <section><button className="lab-map-crumb" onClick={() => setConversationChapter(null)}>← {chapters.find(item => item.number === conversationChapter)?.title}</button><div className="lab-map-section-title"><h3>{chapters.find(item => item.number === conversationChapter)?.title}</h3><small>{chapterConversations.length} conversations</small></div>{chapterConversations.map(item => <button className="lab-map-conversation" key={item.id} onClick={() => setSelectedConversation(item)}><time>{formatDate(item.endTimestamp)}</time><strong>{item.messages.find(message => message.role === 'user')?.content || item.preview}</strong><span>{item.messages.find(message => message.role === 'assistant')?.content || ''}</span><small>{item.messages.length} messages</small></button>)}<button className="lab-map-new-chat" onClick={() => onNewConversation?.(conversationChapter)}>Start a new conversation about this chapter</button></section>
      : <section>{path.length > 0 && <button className="lab-map-crumb" onClick={() => setPath(path.slice(0, -1))}>← {path.length > 1 ? path[path.length - 2].title : 'Contents'}</button>}<div className="lab-map-section-title"><h3>{active?.title || 'Contents'}</h3>{active && <small>{labTreeProgressLabel(active, finishedChapters) || `${active.chapterNumbers.length} chapters`}</small>}</div>
        {visibleNodes.filter(node => passes(node.chapterNumbers)).map(node => node.kind === 'chapter' ? <div className={`lab-map-chapter${node.chapterNumber === currentChapter ? ' is-current' : ''}`} key={node.key} data-current={node.chapterNumber === currentChapter ? 'true' : undefined}><button className="lab-map-chapter-main lab-tree-chapter toc-item" data-testid={`lab-tree-chapter-${node.chapterNumber}`} aria-current={node.chapterNumber === currentChapter ? 'true' : undefined} onPointerEnter={() => onWarmChapter?.(node.chapterNumber!)} onClick={() => onSelectChapter(node.chapterNumber!)}><span><strong>{node.title}</strong><small>{statusLine(node.chapterNumber!)}</small></span><b>›</b></button></div> : <button className="lab-map-row lab-tree-row toc-section-header" key={node.key} data-kind={node.kind} onClick={() => setPath([...path, node])}><span><strong>{node.title}</strong><small>{labTreeProgressLabel(node, finishedChapters) || (node.kind === 'book' ? `${node.chapterNumbers.length} chapters` : `${node.children?.length || 0} books`)}</small></span><span className="lab-map-counts">{countFor(node, 'highlights') > 0 && `▰ ${countFor(node, 'highlights')}`}{countFor(node, 'chats') > 0 && ` ◯ ${countFor(node, 'chats')}`} <b>›</b></span></button>)}
        {bookChapters.filter(chapter => passes([chapter.number])).map(chapter => { const hs = highlights.filter(item => item.chapterNumber === chapter.number); const cs = conversations.filter(item => item.chapterNumber === chapter.number); return <div className={`lab-map-chapter${chapter.number === currentChapter ? ' is-current' : ''}`} key={chapter.number} data-current={chapter.number === currentChapter ? 'true' : undefined}><button className="lab-map-chapter-main lab-tree-chapter toc-item" data-testid={`lab-tree-chapter-${chapter.number}`} aria-current={chapter.number === currentChapter ? 'true' : undefined} onPointerEnter={() => onWarmChapter?.(chapter.number)} onClick={() => onSelectChapter(chapter.number)}><span><strong>{chapter.title}</strong><small>{statusLine(chapter.number)}</small></span><b>›</b></button>{hs.map(item => <button className="lab-map-annotation" key={item.id} onClick={() => onSelectHighlight?.(item)}>▰ <span>{item.note || 'Highlighted passage'}</span></button>)}{cs.length > 0 && <button className="lab-map-annotation" onClick={() => setConversationChapter(chapter.number)}>◯ <span>{cs.length} conversation{cs.length === 1 ? '' : 's'}</span></button>}</div> })}
      </section>}
    </main>{!atCurrent && !searching && <button className="lab-map-current" onClick={goCurrent}>Current chapter · {chapters.find(item => item.number === currentChapter)?.title}</button>}
  </div></div>
}
