import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LAB_COPY } from './labCopy'
import {
  LAB_DESKTOP_PANES,
  labAfterTalk,
  labStatusLine,
  labVisibleChrome,
  type LabChromeState,
  type LabReturnTo,
} from './labChrome'
import { labLayoutOverride } from './labRoute'
import { LabAskPane } from './LabAskPane'
import { LabBookPage } from './LabBookPage'
import { LabConversationOverlay } from './LabConversation'
import { LabHearingStage } from './LabHearingStage'
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
  const [peekBook, setPeekBook] = useState(false)
  const [marks, setMarks] = useState<LabMark[]>([])
  const [focusParagraph, setFocusParagraph] = useState<number | null>(null)
  const [chrome, setChrome] = useState<LabChromeState>('reading')
  const [returnTo, setReturnTo] = useState<LabReturnTo>('reading')
  const [draft, setDraft] = useState('')
  const [phoneAskOpen, setPhoneAskOpen] = useState(false)

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

  const chromeRef = useRef(chrome)
  chromeRef.current = chrome

  const interruptHearForAsk = useCallback(() => {
    if (chromeRef.current !== 'hearing') return
    setReturnTo('hearing')
    listen.pause()
  }, [listen])

  useEffect(() => {
    if (ask.voiceActive) listen.pause()
  }, [ask.voiceActive, listen.pause])

  const talkingRef = useRef(false)
  useEffect(() => {
    const wasTalking = talkingRef.current
    talkingRef.current = ask.voiceActive
    if (ask.voiceActive) {
      setChrome('talking')
      setPeekBook(false)
      return
    }
    setChrome(current => (current === 'talking' ? labAfterTalk(returnTo) : current))
    if (wasTalking && returnTo === 'hearing') listen.resume()
  }, [ask.voiceActive, listen.resume, returnTo])

  const typedLoadingRef = useRef(false)
  useEffect(() => {
    const wasLoading = typedLoadingRef.current
    typedLoadingRef.current = ask.typedLoading
    if (!wasLoading || ask.typedLoading || ask.voiceActive) return
    if (returnTo !== 'hearing' || chromeRef.current === 'talking') return
    setChrome(labAfterTalk(returnTo))
    listen.resume()
  }, [ask.typedLoading, ask.voiceActive, listen, returnTo])

  const markedIndexes = useMemo(() => new Set(marks.map(mark => mark.paragraphIndex)), [marks])
  const isOnline = readOnline(online)
  const voiceOverlayOpen = isPhone && chrome === 'talking'
  const showHearing = chrome === 'hearing' && !peekBook
  const showBook = chrome !== 'hearing' || peekBook

  const leaveTalking = useCallback(() => {
    ask.stopVoice()
    const next = labAfterTalk(returnTo)
    setChrome(next)
    setPeekBook(false)
    if (next === 'hearing') listen.resume()
  }, [ask, listen, returnTo])

  const startHearing = useCallback(() => {
    if (chrome === 'talking') return
    if (chrome === 'hearing') {
      listen.pause()
      setChrome('reading')
      setReturnTo('reading')
      setPeekBook(false)
      return
    }
    setReturnTo('hearing')
    setChrome('hearing')
    setPeekBook(false)
    setInTheBookOpen(false)
    if (listen.src) listen.resume()
    else void listen.start()
  }, [chrome, listen])

  const handleMic = useCallback(() => {
    if (ask.voiceActive) {
      void ask.toggleInChatVoice()
      return
    }
    interruptHearForAsk()
    if (chromeRef.current !== 'hearing') setReturnTo('reading')
    void ask.toggleInChatVoice()
  }, [ask, interruptHearForAsk])

  const handleVoiceMode = useCallback(() => {
    interruptHearForAsk()
    if (chromeRef.current !== 'hearing') setReturnTo('reading')
    void ask.startVoice()
  }, [ask, interruptHearForAsk])

  const openPhoneAsk = useCallback(() => {
    interruptHearForAsk()
    if (chromeRef.current !== 'hearing') setReturnTo('reading')
    setPhoneAskOpen(true)
    setInTheBookOpen(false)
    setPeekBook(false)
  }, [interruptHearForAsk])

  const closePhoneAsk = useCallback(() => {
    setPhoneAskOpen(false)
    if (ask.voiceActive || chromeRef.current === 'talking') return
    if (returnTo !== 'hearing') return
    setChrome(labAfterTalk(returnTo))
    listen.resume()
  }, [ask.voiceActive, listen, returnTo])

  const handlePhoneAsk = useCallback(() => {
    if (phoneAskOpen) closePhoneAsk()
    else openPhoneAsk()
  }, [closePhoneAsk, openPhoneAsk, phoneAskOpen])

  const handleOrb = useCallback(() => {
    if (ask.voiceActive) {
      leaveTalking()
      return
    }
    void ask.startVoice()
  }, [ask, leaveTalking])

  const handleAsk = useCallback((value: string) => {
    interruptHearForAsk()
    setDraft('')
    void ask.sendTyped(value)
  }, [ask, interruptHearForAsk])

  const handleAskAbout = useCallback((name: string) => {
    const question = `Who is ${name} on this page?`
    setInTheBookOpen(false)
    if (isPhone) {
      openPhoneAsk()
      setDraft('')
      void ask.sendTyped(question)
      return
    }
    interruptHearForAsk()
    setDraft('')
    void ask.sendTyped(question)
  }, [ask, interruptHearForAsk, isPhone, openPhoneAsk])

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

  const handleInTheBook = useCallback(() => {
    if (chrome === 'hearing') {
      setPeekBook(open => !open)
      setInTheBookOpen(false)
      return
    }
    setInTheBookOpen(open => !open)
  }, [chrome])

  return (
    <div
      className={`lab ${isPhone ? 'is-phone' : 'is-desktop'}${isPhone && ask.notice && chrome !== 'talking' ? ' has-notice' : ''}${isPhone && phoneAskOpen && chrome !== 'talking' ? ' has-phone-ask' : ''}`}
      data-testid="lab-root"
      data-lab-layout={isPhone ? 'phone' : 'desktop'}
      data-chrome-state={chrome}
      data-phone-ask={phoneAskOpen ? 'open' : 'closed'}
    >
      <header className="lab-header">
        <div className="lab-header-brand">
          <p className="lab-kicker">{LAB_COPY.labNote}</p>
          <h1 className="lab-title">{book.bookTitle}</h1>
          <p className="lab-sub">{book.bookAuthor}</p>
        </div>
        <div className="lab-header-controls">
          <LabInTheBook
            open={chrome === 'hearing' ? peekBook : inTheBookOpen}
            onToggle={handleInTheBook}
            onClose={() => {
              setInTheBookOpen(false)
              setPeekBook(false)
            }}
            paragraphs={book.paragraphs}
            chapters={book.chapters}
            currentChapter={1}
            marks={marks}
            cast={book.cast}
            online={isOnline}
            onAskAbout={handleAskAbout}
            onJumpParagraph={setFocusParagraph}
            panel={chrome !== 'hearing'}
          />
          {!isPhone && (
            <button
              type="button"
              className={`lab-header-btn ${chrome === 'hearing' ? 'is-open' : ''}`}
              onClick={startHearing}
              data-testid="lab-listen"
            >
              {chrome === 'hearing' ? LAB_COPY.read : LAB_COPY.listen}
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
        <p className="lab-status" data-testid="lab-status">
          {labStatusLine(
            labVisibleChrome(chrome, peekBook),
            book.chapterLabel,
            isPhone ? 'phone' : 'desktop',
          )}
        </p>
      </header>

      <div className="lab-body">
        <div className="lab-page-wrap">
          {showHearing && (
            <LabHearingStage
              paragraphs={listen.followParagraphs}
              clips={listen.clips}
              follow={listen.follow}
              playing={listen.playing}
              clipIndex={listen.clipIndex}
              currentTime={listen.currentTime}
              speed={listen.speed}
              onTogglePlay={() => {
                if (listen.playing) listen.pause()
                else if (listen.src) listen.resume()
                else void listen.start()
              }}
              onSeek={listen.seek}
              onCycleSpeed={listen.cycleSpeed}
            />
          )}
          {showBook && (
            <LabBookPage
              chapterTitle={book.chapterTitle}
              editionLabel={book.editionLabel}
              paragraphs={book.paragraphs}
              compareParagraphs={book.compareParagraphs}
              compare={compare}
              follow={{ kind: 'none' }}
              followEnabled={false}
              followParagraphs={listen.followParagraphs}
              markedIndexes={markedIndexes}
              onMark={handleMark}
              focusParagraph={focusParagraph}
              dimmed={voiceOverlayOpen}
              peek={chrome === 'hearing' && peekBook}
            />
          )}
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

      {isPhone && phoneAskOpen && chrome !== 'talking' && (
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

      {isPhone && chrome !== 'talking' && (
        <footer className="lab-phone-bar" data-testid="lab-phone-bar">
          {ask.notice && !phoneAskOpen && (
            <p className="lab-phone-notice" data-testid="lab-voice-notice">{ask.notice}</p>
          )}
          <div className="lab-phone-bar-row">
            <button type="button" className="lab-text-btn" onClick={startHearing} data-testid="lab-listen">
              {chrome === 'hearing' ? LAB_COPY.read : LAB_COPY.listen}
            </button>
            <button
              type="button"
              className={`lab-text-btn ${phoneAskOpen ? 'is-open' : 'lab-text-btn-strong'}`}
              onClick={handlePhoneAsk}
              data-testid="lab-phone-ask"
            >
              {phoneAskOpen ? LAB_COPY.done : LAB_COPY.ask}
            </button>
          </div>
        </footer>
      )}

      {voiceOverlayOpen && (
        <LabConversationOverlay
          state={ask.conversationState}
          notice={ask.notice}
          onLeave={leaveTalking}
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
