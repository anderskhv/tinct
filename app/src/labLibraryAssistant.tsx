import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useAuth } from './hooks/useAuth'
import { useVoiceSession } from './hooks/useVoiceSession'
import { LabMarkdown } from './lab/LabMarkdown'
import { LabVoiceCall } from './lab/LabVoiceCall.tsx'
import { labCallUtterance, labCallView } from './lab/labVoiceCall'
import { gateLabAiAction, labSignInHref } from './lab/labAccountPrompt'
import { readAnthropicResponse } from './lab/labCompanion'
import { COMPANION_EFFORT_TYPED, COMPANION_MODEL } from './companionModel'
import { apiUrl } from './utils/apiUrl'
import type { ChatMessage } from './types'
import labVoiceCss from './lab/lab.css?inline'
import {
  eligibleLibraryBooks,
  estimatedHours,
  libraryCataloguePrompt,
  recommendationBookIds,
  searchLibraryCatalogue,
  visibleLibrarianText,
  type LibraryCatalogue,
  type LibraryCatalogueBook,
} from './lab/libraryLibrarian'

type Mode = 'search' | 'chat' | 'talk' | null
type Turn = { id: string; role: 'user' | 'assistant'; content: string; pending?: boolean; error?: boolean }

declare global {
  interface Window {
    __tinctLabPreReader?: {
      ready: boolean
      openBookPage: (bookId: string) => Promise<boolean>
    }
  }
}

const icon = (name: 'search' | 'talk' | 'chat' | 'send' | 'close') => {
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    talk: <><path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/></>,
    chat: <><path d="M5 5h14v10H9l-4 4V5Z"/></>,
    send: <><path d="m5 12 14-7-5 14-2-6-7-1Z"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

const LIBRARY_VOICE_TOOLS = [
  {
    type: 'function',
    name: 'show_library_books',
    description: 'Show up to three eligible catalogue books as tappable recommendations. Call this whenever you recommend books.',
    parameters: {
      type: 'object',
      properties: { book_ids: { type: 'array', items: { type: 'string' }, maxItems: 3 } },
      required: ['book_ids'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'open_library_book',
    description: 'Open an eligible book only after the reader explicitly asks to open or choose it.',
    parameters: {
      type: 'object',
      properties: { book_id: { type: 'string' } },
      required: ['book_id'],
      additionalProperties: false,
    },
  },
] as const

function openBook(bookId: string) {
  void window.__tinctLabPreReader?.openBookPage(bookId)
}

function BookActions({ books }: { books: LibraryCatalogueBook[] }) {
  if (!books.length) return null
  return <div className="library-assistant-books" aria-label="Recommended books">
    {books.map(book => <button type="button" key={book.id} onClick={() => openBook(book.id)}>
      {book.art?.src && <img src={book.art.src} srcSet={book.art.srcSet} alt="" />}
      <span><strong>{book.title}</strong><small>{book.author}{estimatedHours(book.wordCount) ? ` · ${estimatedHours(book.wordCount)}` : ''}</small></span>
    </button>)}
  </div>
}

export function LibraryAssistant() {
  const auth = useAuth()
  const [catalogue, setCatalogue] = useState<LibraryCatalogue | null>(null)
  const [mode, setMode] = useState<Mode>(null)
  const [searchDraft, setSearchDraft] = useState('')
  const [chatDraft, setChatDraft] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [sending, setSending] = useState(false)
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null)
  const [voiceBooks, setVoiceBooks] = useState<string[]>([])
  const [accountAction, setAccountAction] = useState<'chat' | 'voice' | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const requestRef = useRef(0)
  const voiceTurnsRef = useRef<ChatMessage[]>([])
  const voiceStopRef = useRef<() => void>(() => {})
  const previousUserRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    fetch('/lab/catalogue.json?v=20260912-withheld-1')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('catalogue')))
      .then(setCatalogue)
      .catch(() => setCatalogue({ books: [] }))
  }, [])

  const signedIn = Boolean(auth.session?.access_token)
  const token = auth.session?.access_token ?? null
  const books = useMemo(() => eligibleLibraryBooks(catalogue), [catalogue])
  const byId = useMemo(() => new Map(books.map(book => [book.id, book])), [books])
  const system = useMemo(() => libraryCataloguePrompt(catalogue), [catalogue])

  const appendVoiceMessage = (message: ChatMessage) => {
    voiceTurnsRef.current = [...voiceTurnsRef.current, message].slice(-20)
  }

  const voice = useVoiceSession({
    authToken: token,
    isAnonymous: !token,
    labGuest: !token,
    bookId: 'library',
    bookTitle: 'Tinct Library',
    bookAuthor: 'Tinct',
    chapterNumber: 1,
    chapterTitle: 'Choose a book',
    chapterParagraphs: [],
    paragraphIndex: 0,
    visibleText: '',
    isAudioPlaying: false,
    pausePlayback: () => null,
    resumePlayback: () => {},
    recordMessage: () => {},
    appendLocalMessage: appendVoiceMessage,
    onNeedAuth: () => setAccountAction('voice'),
    onInsufficientBalance: () => setAccountAction('voice'),
    instructions: `${system}\n\nThis is voice mode in the library. Help choose a book. Never say "Ask about this page" and never imply a book is open. When recommending books, call show_library_books with their exact catalogue ids. Open a book only after an explicit request, using open_library_book.`,
    tools: LIBRARY_VOICE_TOOLS,
    applicationTools: LIBRARY_VOICE_TOOLS,
    onApplicationTool: async (name, args) => {
      if (name === 'show_library_books') {
        const ids = Array.isArray(args.book_ids) ? args.book_ids.filter((id): id is string => typeof id === 'string' && byId.has(id)).slice(0, 3) : []
        setVoiceBooks(ids)
        return { output: { ok: true, shown: ids }, responseInstructions: 'Continue naturally. The books are visible as tappable choices.' }
      }
      if (name === 'open_library_book' && typeof args.book_id === 'string' && byId.has(args.book_id)) {
        voiceStopRef.current()
        openBook(args.book_id)
        return { output: { ok: true, opened: args.book_id }, responseInstructions: 'Say briefly that the book is opening.' }
      }
      return { output: { ok: false, error: 'ineligible_book' }, responseInstructions: 'Ask the reader to choose another eligible catalogue book.' }
    },
    onSessionStart: () => { voiceTurnsRef.current = []; setVoiceBooks([]) },
  })
  voiceStopRef.current = voice.stop

  useEffect(() => {
    const userId = auth.user?.id ?? null
    if (previousUserRef.current !== undefined && previousUserRef.current !== userId) {
      requestRef.current += 1
      abortRef.current?.abort()
      setSending(false)
      setTurns([])
      voice.stop()
    }
    previousUserRef.current = userId
  }, [auth.user?.id, voice.stop])

  useEffect(() => () => {
    requestRef.current += 1
    abortRef.current?.abort()
  }, [])

  const showAccount = (action: 'chat' | 'voice', text?: string) => {
    if (text) setChatDraft(text)
    setAccountAction(action)
  }

  const sendChat = async (question = chatDraft) => {
    const text = question.trim()
    if (!text || sending || !catalogue) return
    if (auth.isLoading) return
    const decision = gateLabAiAction({ signedIn })
    if (!decision.allowed) { showAccount('chat', text); return }
    const request = ++requestRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const userTurn: Turn = { id: `library-user-${request}`, role: 'user', content: text }
    const assistantId = `library-assistant-${request}`
    const history = [...turns.filter(turn => !turn.pending && !turn.error), userTurn].slice(-20)
    setTurns([...history, { id: assistantId, role: 'assistant', content: '', pending: true }])
    setChatDraft('')
    setSending(true)
    setFailedQuestion(null)
    try {
      const response = await fetch(apiUrl(token ? '/api/chat' : '/api/lab-chat'), {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          model: COMPANION_MODEL,
          max_tokens: 900,
          stream: true,
          effort: COMPANION_EFFORT_TYPED,
          system,
          messages: history.map(turn => ({ role: turn.role, content: turn.content })),
        }),
      })
      if (request !== requestRef.current) return
      if (response.status === 401 || response.status === 402) {
        showAccount('chat', text)
        throw new Error('account')
      }
      if (!response.ok) throw new Error('unavailable')
      const answer = await readAnthropicResponse(response, accumulated => {
        if (request !== requestRef.current) return
        setTurns(current => current.map(turn => turn.id === assistantId ? { ...turn, content: accumulated } : turn))
      })
      if (request !== requestRef.current) return
      setTurns(current => current.map(turn => turn.id === assistantId ? { ...turn, content: answer, pending: false } : turn))
    } catch (error) {
      if (controller.signal.aborted || request !== requestRef.current) return
      setFailedQuestion(text)
      setTurns(current => current.map(turn => turn.id === assistantId
        ? { ...turn, pending: false, error: true, content: error instanceof Error && error.message === 'account' ? 'Sign in to continue with the librarian.' : 'The librarian was interrupted. Please try again.' }
        : turn))
    } finally {
      if (request === requestRef.current) setSending(false)
    }
  }

  const startTalk = async () => {
    setMode('talk')
    setAccountAction(null)
    if (auth.isLoading) return
    const decision = gateLabAiAction({ signedIn })
    if (!decision.allowed) { showAccount('voice'); return }
    voice.unlockAudio()
    await voice.start({ authToken: token })
  }

  const close = () => {
    if (mode === 'talk') voice.stop()
    abortRef.current?.abort()
    requestRef.current += 1
    setSending(false)
    setMode(null)
    setAccountAction(null)
  }

  const results = useMemo(() => searchLibraryCatalogue(catalogue, searchDraft), [catalogue, searchDraft])
  const voiceRecommended = voiceBooks.map(id => byId.get(id)).filter((book): book is LibraryCatalogueBook => Boolean(book))
  const voiceView = labCallView({ connection: voice.connection, activity: voice.activity as never, micMuted: voice.micMuted, fullDuplex: true })

  return <>
    <style>{labVoiceCss}</style>
    {mode && <section className={`library-assistant-panel is-${mode}`} role="dialog" aria-label={mode === 'search' ? 'Search the library' : mode === 'chat' ? 'Chat with the librarian' : 'Talk with the librarian'}>
      <header><span>{mode === 'search' ? 'Find a book' : 'Your librarian'}</span><button type="button" onClick={close} aria-label="Close">{icon('close')}</button></header>
      {accountAction && <div className="library-account-prompt">
        <p>Create a free account to keep using {accountAction === 'voice' ? 'Talk' : 'Chat'}.</p>
        <div><a href={labSignInHref('create', '/library')}>Create account</a><a href={labSignInHref('signin', '/library')}>Sign in</a></div>
      </div>}
      {mode === 'search' && <>
        <a className="library-search-account" href={labSignInHref('signin', '/library')}>{signedIn ? 'Account' : 'Sign in'}</a>
        <label className="library-assistant-field">{icon('search')}<input autoFocus type="search" value={searchDraft} onChange={event => setSearchDraft(event.target.value)} placeholder={`Search ${books.length} books`} aria-label="Search by title, author, subject, or description" /><button type="button" onClick={() => setSearchDraft('')} aria-label="Clear search">{searchDraft ? 'Clear' : ''}</button></label>
        <div className="library-search-results" aria-live="polite">
          {results.length ? <BookActions books={results} /> : <p>No books match “{searchDraft}”.</p>}
        </div>
      </>}
      {mode === 'chat' && <>
        <div className="library-chat-thread" aria-live="polite">
          {turns.length === 0 && <p className="library-chat-empty">Tell me what you feel like reading, or name a book you loved.</p>}
          {turns.map(turn => <div key={turn.id} className={`library-chat-turn is-${turn.role}${turn.error ? ' is-error' : ''}`}>
            <span>{turn.role === 'user' ? 'You' : 'Tinct'}</span>
            <LabMarkdown>{turn.pending && !turn.content ? 'Thinking…' : visibleLibrarianText(turn.content)}</LabMarkdown>
            {turn.role === 'assistant' && !turn.pending && <BookActions books={recommendationBookIds(turn.content, catalogue).map(id => byId.get(id)).filter((book): book is LibraryCatalogueBook => Boolean(book))} />}
          </div>)}
          {failedQuestion && !sending && <button className="library-retry" type="button" onClick={() => void sendChat(failedQuestion)}>Retry</button>}
        </div>
        <form className="library-chat-form" onSubmit={event => { event.preventDefault(); void sendChat() }}>
          <input autoFocus value={chatDraft} onChange={event => setChatDraft(event.target.value)} placeholder="What would you like to read?" aria-label="Message the librarian" />
          <button type="submit" disabled={!chatDraft.trim() || sending} aria-label="Send">{icon('send')}</button>
        </form>
      </>}
      {mode === 'talk' && !accountAction && <div className="library-voice-wrap">
        <LabVoiceCall
          view={voiceView}
          getAssistantLevel={voice.getAssistantLevel}
          notice={voice.error}
          bookLine="Tinct Library"
          utterance={labCallUtterance(voiceTurnsRef.current)}
          idleCaption="Tell me what you feel like reading."
          onMuteToggle={() => voice.setMicMuted(!voice.micMuted)}
          onEnd={close}
          onReconnect={() => void voice.start({ authToken: token })}
        />
        <BookActions books={voiceRecommended} />
      </div>}
    </section>}
    <nav className="library-glass-dock" aria-label="Find a book">
      <button type="button" aria-pressed={mode === 'search'} onClick={() => { if (mode === 'talk') voice.stop(); setAccountAction(null); setMode('search') }}>{icon('search')}<span>Search</span></button>
      <button type="button" aria-pressed={mode === 'talk'} onClick={() => void startTalk()}>{icon('talk')}<span>Talk</span></button>
      <button type="button" aria-pressed={mode === 'chat'} onClick={() => { if (mode === 'talk') voice.stop(); setAccountAction(null); setMode('chat') }}>{icon('chat')}<span>Chat</span></button>
    </nav>
  </>
}

const mount = document.querySelector<HTMLElement>('[data-library-assistant-root]')
if (mount) ReactDOM.createRoot(mount).render(<LibraryAssistant />)
