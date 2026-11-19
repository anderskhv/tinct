/** Original PDF Talk reuses the private, owner-qualified chat journal and realtime voice session. */
import { useEffect, useRef, useState } from 'react'
import type { ChatConversation, ChatMessage } from '../../types'
import { useVoiceSession } from '../../hooks/useVoiceSession'
import { LabVoiceDesktopPanel, LabVoicePill } from '../LabVoiceDesktop'
import { labCallView } from '../labVoiceCall'
import { appendLabChatTurnTo } from '../labChatHistory'
import { listAccountBooks, ownBookToken } from './ownAccount'
import { userBookId } from './userBookId'
import { userBookOwner } from './userBookStore'
import type { OwnTextCardsSync } from './ownTextCardsSync'

export function pdfTalkConversations(rows: ChatConversation[]) {
  return rows.filter(row => !row.card && row.messages.some(message => message.source === 'voice'))
    .map(row => ({ id: row.id, page: row.id.startsWith('pdf-original-') ? row.chapterNumber : null, at: row.startTimestamp,
      turns: row.messages.filter(message => message.role === 'user' || message.role === 'assistant')
        .map(message => ({ role: message.role as 'user' | 'assistant', content: message.content })), localOnly: true as const }))
}

export function PdfOriginalTalkCard({ hex, owner, fileId, chat, page, text, selectedText, reference, title = 'Your PDF', author = '', onClose }: {
  hex: string; owner: string; fileId: string; chat: OwnTextCardsSync; page: number; text: string; selectedText?: string; reference?: string;
  title?: string; author?: string; onClose: () => void
}) {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [turns, setTurns] = useState(() => pdfTalkConversations(chat.readAll()))
  const pageRef = useRef(page)
  pageRef.current = page
  const conversationId = useRef<string | null>(null)
  const trusted = () => userBookOwner() === owner && chat.isTrusted()
  useEffect(() => chat.subscribe(() => setTurns(pdfTalkConversations(chat.readAll()))), [chat])
  useEffect(() => {
    let live = true
    void (async () => {
      const access = await ownBookToken()
      const books = access ? await listAccountBooks(access) : null
      if (!live || !trusted()) return
      if (!access || !books?.some(book => book.id === fileId && book.type === 'pdf' && book.sha256.slice(0, 24) === hex)) {
        setNotice('This PDF account copy is unavailable. Talk could not start.'); return
      }
      setToken(access); setReady(true)
    })()
    return () => { live = false }
  }, [hex, owner, fileId, chat])

  const record = (message: ChatMessage) => {
    if (!trusted() || (message.role !== 'user' && message.role !== 'assistant')) return
    const current = chat.read(), count = chat.readAll().reduce((total, row) => total + row.messages.length, 0)
    // The shared conversation format has bounded content and history. Refuse
    // overflow rather than claiming an older private turn survived truncation.
    const messages = current.find(row => row.id === conversationId.current)?.messages
    const last = messages?.[messages.length - 1]
    const extendingAssistant = message.role === 'assistant' && last?.role === 'assistant' && last.source === 'voice'
    if (message.content.trim().length > 8000 || count >= 600 && !extendingAssistant) {
      setNotice('This Talk transcript is full. Copy it from Notebook before continuing.'); return
    }
    let next: ChatConversation[]
    if (!conversationId.current) {
      const first = appendLabChatTurnTo([], userBookId(hex), message, pageRef.current)[0]
      if (!first) return
      const id = `pdf-original-${crypto.randomUUID()}`
      next = [...current, { ...first, id }]
      conversationId.current = id
    } else next = appendLabChatTurnTo(current, userBookId(hex), message, pageRef.current, undefined, conversationId.current)
    if (!chat.persist(next)) {
      if (!current.some(row => row.id === conversationId.current)) conversationId.current = null
      setNotice('This turn could not be saved on this device. Copy it before leaving Talk.')
    }
  }
  const voice = useVoiceSession({
    authToken: token, isAnonymous: !token, bookId: userBookId(hex), bookTitle: title, bookAuthor: author,
    chapterNumber: page, chapterTitle: `Original PDF page ${page}`, chapterParagraphs: [text.slice(0, 9000)],
    paragraphIndex: 0, pageNumber: page, visibleText: selectedText || '', reference, isAudioPlaying: false,
    pausePlayback: () => null, resumePlayback: () => {}, recordMessage: record, appendLocalMessage: () => {},
    onNeedAuth: () => setNotice('Sign in to use Talk.'),
    onInsufficientBalance: () => setNotice('Talk is unavailable for this account right now.'),
    onEndConversation: onClose, onBeforeUserTurn: () => {
      if (!trusted()) return false
      if (chat.readAll().reduce((total, row) => total + row.messages.length, 0) <= 598) return true
      setNotice('This Talk transcript is full. Copy it from Notebook before continuing.')
      return false
    },
    mode: 'conversation', warm: false,
  })
  const stopRef = useRef(voice.stop)
  stopRef.current = voice.stop
  useEffect(() => () => stopRef.current(), [])
  useEffect(() => { if (!trusted()) { voice.stop(); setReady(false) } }, [owner, fileId, hex, voice.stop])
  const start = () => {
    if (!ready || !token || !trusted()) return
    setNotice(null)
    // start() primes the microphone synchronously within this tap, including on iOS.
    void voice.start().catch(() => setNotice('Talk could not connect. Try again.'))
  }
  const end = () => { voice.stop(); onClose() }
  const activity = voice.activity === 'checking_text' ? 'checking' : voice.activity === 'preparing_answer' ? 'preparing' : voice.activity
  const view = labCallView({ connection: voice.connection, activity, micMuted: voice.micMuted })
  return <div className="pdf-original-talk" data-testid="pdf-original-talk">
    {!voice.isActive && voice.connection !== 'connecting' && <button type="button" disabled={!ready || !trusted()} onClick={start}>Start Talk</button>}
    {(voice.isActive || voice.connection === 'connecting' || voice.connection === 'disconnected') && (minimized
      ? <LabVoicePill view={view} getAssistantLevel={voice.getAssistantLevel} onMuteToggle={() => voice.setMicMuted(!voice.micMuted)} onReconnect={start} onEnd={end} onExpand={() => setMinimized(false)} />
      : <LabVoiceDesktopPanel view={view} getAssistantLevel={voice.getAssistantLevel} notice={voice.error || notice} onMuteToggle={() => voice.setMicMuted(!voice.micMuted)} onReconnect={start} onEnd={end} onMinimize={() => setMinimized(true)} />)}
    {notice && !voice.isActive && <p role="status">{notice}</p>}
    {trusted() && turns.length > 0 && <div aria-label="Talk transcript">{turns.flatMap(row => row.turns.map((turn, index) => <p key={`${row.id}:${index}`}><strong>{turn.role === 'user' ? 'You' : 'Tinct'}:</strong> {turn.content}</p>))}</div>}
    <p>Saved on this device</p>
    <button type="button" onClick={end}>End Talk</button>
  </div>
}
