import { useCallback, useEffect, useMemo, useState } from 'react'
import { LAB_COPY } from './labCopy'
import { LAB_DESKTOP_PANES } from './labChrome'
import { labLayoutOverride } from './labRoute'
import { LabAskPane } from './LabAskPane'
import { LabBookPage } from './LabBookPage'
import { LabConversationOverlay } from './LabConversation'
import { LabInTheBook } from './LabInTheBook'
import { fallbackLabSource, loadLabSource, type LabMark, type LabSource } from './labSource'
import { useLabAsk } from './useLabAsk'
import { useLabListen } from './useLabListen'
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
  const [draft, setDraft] = useState('')

  const ask = useLabAsk({
    bookTitle: book.bookTitle,
    bookAuthor: book.bookAuthor,
    chapterLabel: book.chapterLabel,
    paragraphs: book.paragraphs,
    paragraphIndex: focusParagraph ?? 0,
    authToken,
  })

  const listen = useLabListen({
    paragraphs: book.paragraphs,
    followParagraphs: book.followParagraphs,
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

  useEffect(() => {
    if (ask.voiceActive) listen.pause()
  }, [ask.voiceActive, listen.pause])

  const followEnabled = listen.playing && !ask.voiceActive
  const markedIndexes = useMemo(() => new Set(marks.map(mark => mark.paragraphIndex)), [marks])
  const isOnline = readOnline(online)
  const voiceOverlayOpen = isPhone && mode === 'conversation'

  const leaveConversation = useCallback(() => {
    ask.stopVoice()
    setMode(returnTo)
    if (returnTo === 'listening') listen.resume()
  }, [ask, listen, returnTo])

  const startListening = useCallback(() => {
    setReturnTo('listening')
    if (mode === 'listening' && listen.playing) {
      listen.pause()
      return
    }
    setMode('listening')
    if (listen.src) listen.resume()
    else void listen.start()
  }, [listen, mode])

  const handleMic = useCallback(() => {
    void ask.toggleInChatVoice()
  }, [ask])

  const handleVoiceMode = useCallback(() => {
    void ask.startVoice()
  }, [ask])

  const handlePhoneAsk = useCallback(async () => {
    const from = mode === 'listening' ? 'listening' : 'reading'
    setReturnTo(from)
    if (from === 'listening') listen.pause()
    const started = ask.voiceActive || await ask.startVoice()
    if (!started) return
    setMode('conversation')
    setInTheBookOpen(false)
  }, [ask, listen, mode])

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
      void handlePhoneAsk()
      return
    }
    setDraft('')
    void ask.sendTyped(question)
  }, [ask, handlePhoneAsk, isPhone])

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
            follow={followEnabled ? listen.follow : { kind: 'none' }}
            followEnabled={followEnabled}
            followParagraphs={listen.followParagraphs}
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
            onVoiceMode={handleVoiceMode}
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
            onClick={() => { void handlePhoneAsk() }}
            data-testid="lab-phone-ask"
          >
            {LAB_COPY.ask}
          </button>
        </footer>
      )}

      {isPhone && ask.notice && mode !== 'conversation' && (
        <p className="lab-phone-notice" data-testid="lab-voice-notice">{ask.notice}</p>
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
      <p
        className="lab-visually-hidden"
        data-testid="lab-listen-status"
        data-playing={listen.playing ? 'true' : 'false'}
        data-src={listen.src || ''}
        data-clip={String(listen.clipIndex)}
      >
        {listen.playing ? `playing:${listen.clipIndex}` : 'stopped'}
      </p>
    </div>
  )
}

export default LabApp
