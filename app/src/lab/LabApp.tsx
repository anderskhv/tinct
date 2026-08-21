import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LAB_COPY } from './labCopy'
import { LAB_DESKTOP_PANES } from './labChrome'
import { followAtTime, type FollowTarget } from './labFollow'
import { labLayoutOverride } from './labRoute'
import { LabAskPane } from './LabAskPane'
import { LabBookPage } from './LabBookPage'
import { LabConversationOverlay } from './LabConversation'
import { LabInTheBook } from './LabInTheBook'
import { fallbackLabSource, loadLabSource, type LabMark, type LabSource } from './labSource'
import { useLabAsk } from './useLabAsk'
import './lab.css'

const PHONE_QUERY = '(max-width: 1024px)'

export interface LabAppProps {
  pathname?: string
  online?: boolean
  source?: LabSource
  authToken?: string | null
}

function readOnline(override?: boolean): boolean {
  if (typeof override === 'boolean') return override
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export function LabApp({ pathname, online, source, authToken }: LabAppProps) {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/lab')
  const layoutOverride = labLayoutOverride(path)
  const [isPhone, setIsPhone] = useState(() => {
    if (layoutOverride === 'phone') return true
    if (layoutOverride === 'desktop') return false
    return typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches
  })
  const [book, setBook] = useState<LabSource>(source ?? fallbackLabSource())
  const [compare, setCompare] = useState(false)
  const [inTheBookOpen, setInTheBookOpen] = useState(false)
  const [marks, setMarks] = useState<LabMark[]>([])
  const [focusParagraph, setFocusParagraph] = useState<number | null>(null)
  const [mode, setMode] = useState<'reading' | 'listening' | 'conversation'>('reading')
  const [returnTo, setReturnTo] = useState<'reading' | 'listening'>('reading')
  const [desktopVoiceOpen, setDesktopVoiceOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const clockRef = useRef<number | null>(null)
  const startedAtRef = useRef(0)
  const elapsedRef = useRef(0)

  const ask = useLabAsk({
    bookTitle: book.bookTitle,
    bookAuthor: book.bookAuthor,
    chapterLabel: book.chapterLabel,
    paragraphs: book.paragraphs,
    paragraphIndex: focusParagraph ?? 0,
    authToken,
  })

  useEffect(() => {
    document.title = LAB_COPY.documentTitle
    const existing = document.querySelector('meta[name="robots"]')
    if (existing) {
      existing.setAttribute('content', 'noindex, noarchive')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'robots'
      meta.content = 'noindex, noarchive'
      document.head.appendChild(meta)
    }
  }, [])

  useEffect(() => {
    if (source) {
      setBook(source)
      return
    }
    let cancelled = false
    loadLabSource().then((loaded) => {
      if (!cancelled) setBook(loaded)
    })
    return () => { cancelled = true }
  }, [source])

  useEffect(() => {
    if (layoutOverride) {
      setIsPhone(layoutOverride === 'phone')
      return
    }
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(PHONE_QUERY)
    const onChange = (event: MediaQueryListEvent) => setIsPhone(event.matches)
    setIsPhone(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [layoutOverride])

  const stopClock = useCallback(() => {
    if (clockRef.current != null) {
      window.clearInterval(clockRef.current)
      clockRef.current = null
    }
  }, [])

  const startClock = useCallback((from = elapsedRef.current) => {
    stopClock()
    startedAtRef.current = Date.now() - from * 1000
    clockRef.current = window.setInterval(() => {
      const next = (Date.now() - startedAtRef.current) / 1000
      elapsedRef.current = next
      setElapsed(next)
    }, 80)
  }, [stopClock])

  useEffect(() => () => {
    stopClock()
  }, [stopClock])

  useEffect(() => {
    if (ask.voiceActive) {
      stopClock()
      return
    }
    if (mode === 'listening' && clockRef.current == null) {
      startClock(elapsedRef.current)
    }
  }, [ask.voiceActive, mode, startClock, stopClock])

  const followEnabled = !isPhone
    ? mode === 'listening' && !ask.voiceActive
    : (mode === 'listening' && !ask.voiceActive) || (mode === 'reading' && returnTo === 'listening')

  const follow: FollowTarget = useMemo(() => {
    if (!followEnabled) return { kind: 'none' }
    return followAtTime(book.followParagraphs, elapsed)
  }, [book.followParagraphs, elapsed, followEnabled])

  const markedIndexes = useMemo(() => new Set(marks.map(mark => mark.paragraphIndex)), [marks])
  const isOnline = readOnline(online)
  const voiceOverlayOpen = isPhone ? mode === 'conversation' : desktopVoiceOpen

  const openConversation = useCallback((from: 'reading' | 'listening') => {
    setReturnTo(from)
    if (from === 'listening') stopClock()
    setMode('conversation')
    setInTheBookOpen(false)
  }, [stopClock])

  const leaveConversation = useCallback(() => {
    ask.stopVoice()
    setDesktopVoiceOpen(false)
    setMode(returnTo)
    if (returnTo === 'listening') startClock(elapsedRef.current)
  }, [ask, returnTo, startClock])

  const startListening = useCallback(() => {
    setReturnTo('listening')
    setMode('listening')
    startClock(0)
  }, [startClock])

  const handleMic = useCallback(() => {
    if (isPhone && mode !== 'conversation') {
      openConversation(mode === 'listening' ? 'listening' : 'reading')
    }
    void ask.toggleInChatVoice()
  }, [ask, isPhone, mode, openConversation])

  const handleVoiceMode = useCallback(async () => {
    if (isPhone) {
      openConversation(mode === 'listening' ? 'listening' : 'reading')
      const started = await ask.startVoice()
      if (!started) return
      return
    }
    const started = ask.voiceActive || await ask.startVoice()
    if (started) setDesktopVoiceOpen(true)
    else setDesktopVoiceOpen(false)
  }, [ask, isPhone, mode, openConversation])

  const handleOrb = useCallback(() => {
    if (ask.voiceActive) return
    void ask.startVoice()
  }, [ask])

  const handleAsk = useCallback((value: string) => {
    setDraft('')
    void ask.sendTyped(value)
  }, [ask])

  const handleAskAbout = useCallback((name: string) => {
    const question = `Who is ${name} on this page?`
    setInTheBookOpen(false)
    if (isPhone) {
      openConversation(mode === 'listening' ? 'listening' : 'reading')
      return
    }
    setDraft('')
    void ask.sendTyped(question)
  }, [ask, isPhone, mode, openConversation])

  const handleMark = useCallback((index: number) => {
    setMarks((current) => {
      if (current.some(mark => mark.paragraphIndex === index)) {
        return current.filter(mark => mark.paragraphIndex !== index)
      }
      return [
        ...current,
        { id: `mark-${index}`, paragraphIndex: index, text: book.paragraphs[index] || '' },
      ]
    })
  }, [book.paragraphs])

  return (
    <div
      className={`lab ${isPhone ? 'is-phone' : 'is-desktop'}`}
      data-testid="lab-root"
      data-lab-layout={isPhone ? 'phone' : 'desktop'}
    >
      <header className="lab-header">
        <div className="lab-header-brand">
          <p className="lab-kicker">{LAB_COPY.labNote}</p>
          <h1 className="lab-title">{book.bookTitle}</h1>
          <p className="lab-sub">{book.bookAuthor}</p>
        </div>
        <div className="lab-header-controls">
          <LabInTheBook
            open={inTheBookOpen}
            onToggle={() => setInTheBookOpen(open => !open)}
            onClose={() => setInTheBookOpen(false)}
            paragraphs={book.paragraphs}
            chapters={book.chapters}
            currentChapter={1}
            marks={marks}
            cast={book.cast}
            online={isOnline}
            onAskAbout={handleAskAbout}
            onJumpParagraph={setFocusParagraph}
          />
          {!isPhone && (
            <button
              type="button"
              className={`lab-header-btn ${mode === 'listening' ? 'is-open' : ''}`}
              onClick={startListening}
              data-testid="lab-listen"
            >
              {LAB_COPY.listen}
            </button>
          )}
          <button
            type="button"
            className={`lab-header-btn ${compare ? 'is-open' : ''}`}
            onClick={() => setCompare(value => !value)}
            data-testid="lab-compare"
            aria-pressed={compare}
          >
            {LAB_COPY.compare}
          </button>
        </div>
      </header>

      <div className="lab-body">
        <div className="lab-page-wrap">
          <LabBookPage
            chapterTitle={book.chapterTitle}
            editionLabel={book.editionLabel}
            paragraphs={book.paragraphs}
            compareParagraphs={book.compareParagraphs}
            compare={compare}
            follow={follow}
            followEnabled={followEnabled}
            followParagraphs={book.followParagraphs}
            markedIndexes={markedIndexes}
            onMark={handleMark}
            focusParagraph={focusParagraph}
            dimmed={voiceOverlayOpen}
          />
        </div>
        {!isPhone && (
          <LabAskPane
            conversationState={ask.conversationState}
            voiceActive={ask.voiceActive}
            typedLoading={ask.typedLoading}
            turns={ask.turns}
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={handleAsk}
            onMic={handleMic}
            onVoiceMode={() => { void handleVoiceMode() }}
            notice={ask.notice}
          />
        )}
      </div>

      {isPhone && mode !== 'conversation' && (
        <footer className="lab-phone-bar">
          <button type="button" className="lab-text-btn" onClick={startListening}>
            {LAB_COPY.listen}
          </button>
          <button
            type="button"
            className="lab-text-btn lab-text-btn-strong"
            onClick={() => openConversation(mode === 'listening' ? 'listening' : 'reading')}
            data-testid="lab-phone-ask"
          >
            {LAB_COPY.ask}
          </button>
        </footer>
      )}

      {voiceOverlayOpen && (
        <LabConversationOverlay
          state={ask.conversationState}
          notice={ask.notice}
          onLeave={leaveConversation}
          onActivate={handleOrb}
        />
      )}

      {!isPhone && (
        <p className="lab-visually-hidden" data-testid="lab-desktop-panes">
          {LAB_DESKTOP_PANES.join(', ')}
        </p>
      )}
    </div>
  )
}

export default LabApp
