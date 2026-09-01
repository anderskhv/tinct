import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { LAB_COPY } from './labCopy'
import {
  LAB_DESKTOP_PANES,
  bindLabVisualViewportHeight,
  isLabPhoneSurface,
  shouldShowLabPhoneFooter,
  LAB_CONNECTING_FAIL_MS,
  labAfterTalk,
  labPhoneBarMode,
  labPullOpensToc,
  labShowPhoneBar,
  labShowReaderRail,
  labShowSlimTransport,
  labStatusLine,
  labVisibleChrome,
  afterLabPaint,
  LAB_OVERFLOW_CLEAR_PX,
  labPageFitsPaint,
  labPageGeometryChanged,
  labBarMoved,
  measureLabBarTop,
  measureLabOnScreenBarTop,
  measureLabPageMetrics,
  measurePaintedOverflow,
  stabilizeLabPageMetrics,
  nextLabVoiceGate,
  nextPaintShrinkTo,
  type LabPageAdjust,
  type LabPageMetrics,
  type LabChromeState,
  type LabReturnTo,
  type LabVoiceGatePhase,
} from './labChrome'
import { LabPhoneBibleTree } from './LabPhoneBibleTree'
import { markChapterFinished, readFinishedChapters } from './labBibleTree'
import { LabSettingsSheet } from './LabSettingsSheet'
import {
  bibleAudioEditions,
  bibleEditions,
  labFontFamilyCss,
  labFootProgress,
  labFootProgressPages,
  editionLabelFor,
  readLabPrefs,
  writeLabPrefs,
  syncLabAudioEdition,
  effectiveLabAudioEdition,
  type LabPrefs,
} from './labPrefs'
import { labLayoutOverride } from './labRoute'
import { LabAskPane } from './LabAskPane'
import { LabConversationOverlay, LabVoiceGate } from './LabConversation'
import { LabNativePaginator } from './LabNativePaginator'
import { LabVoiceActionPanel } from './LabVoiceActionPanel'
import { LabPageMeasurePaint, LabPassage } from './LabPassage'
import { LabInTheBook } from './LabInTheBook'
import { bibleFallbackSource, loadLabSource, nextLabChapter, prevLabChapter, prefetchLabChapterTexts, type LabMark, type LabSource } from './labSource'
import { bootLabReading, useLabPositionSync } from './useLabPositionSync'
import { isResumeListenCommand, resolveLabPlaybackSkip, type LabPlaybackSkip } from './labAsk'
import { adjacentPageIndex, applyPaintShrink, canUseLabPageBudget, chapterHearingPages, chapterPageSegments, chapterPageTail, clampedChapterProgress, cutPageTailTo, ensurePageIdentity, followOnReadingPage, growPageByWords, growPaintedPageIfSlack, labChapterProgress, labNavPageList, labPageBudgetFromMetrics, leftoverWordCount, pageAnchorOf, polishPageEnd, pageIndexForPlace, reflowAfterCut, restorePageIndexForAnchor, sameChapterPages, sentenceStartWordIndex, snapShrinkEndToSentence, tokenizeHearingWords, type ChapterHearingPage } from './labHearing'
import { SelectionPopup, type PopupMode, type SelectionInfo } from '../components/reader/SelectionPopup'
import { useDefine } from '../components/reader/useDefine'
import { defaultPopupMode } from '../components/reader/selectionPopupMode'
import type { HighlightColor } from '../types'
import { type LabHighlightRange } from './labHighlights'
import { useLabHighlights } from './useLabHighlights'
import { useLabAsk } from './useLabAsk'
import { useLabListen } from './useLabListen'
import { mapLabCompareAnchor } from './labCompare'
import {
  createLabVoiceToolAdapter,
  getLabVoiceReadingHistory,
  type LabVoiceActionEntry,
  type LabVoiceViewSnapshot,
} from './labVoiceControls'
import type { VoiceTinctView } from '../voice/tinctTools'
import './lab.css'

const PHONE_QUERY = '(max-width: 1024px)'

type LabFullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

type LabFullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

function phoneSurfaceInput(layoutOverride: ReturnType<typeof labLayoutOverride>) {
  if (typeof window === 'undefined') {
    return { override: layoutOverride }
  }
  const matchMediaPhone = typeof window.matchMedia === 'function'
    ? window.matchMedia(PHONE_QUERY).matches
    : false
  return {
    override: layoutOverride,
    matchMediaPhone,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    innerWidth: window.innerWidth,
    maxTouchPoints: typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0,
    screenWidth: window.screen?.width,
  }
}

function readPhoneSurface(layoutOverride: ReturnType<typeof labLayoutOverride>): boolean {
  if (typeof window === 'undefined') return layoutOverride === 'phone'
  return isLabPhoneSurface(phoneSurfaceInput(layoutOverride))
}

function readPhoneFooter(layoutOverride: ReturnType<typeof labLayoutOverride>, isPhone: boolean): boolean {
  if (typeof window === 'undefined') return layoutOverride === 'phone' || isPhone
  return shouldShowLabPhoneFooter({
    isPhone,
    ...phoneSurfaceInput(layoutOverride),
  })
}

function browserHasNativePaging(): boolean {
  return typeof CSS !== 'undefined'
    && typeof CSS.supports === 'function'
    && CSS.supports('column-width', '1px')
    && CSS.supports('column-fill', 'auto')
}

function measureVisiblePageOverflow(
  wrap: HTMLElement,
  passage: HTMLElement,
  chromeEl: HTMLElement,
) {
  let painted = measurePaintedOverflow(passage, chromeEl)
  const onScreenTop = measureLabOnScreenBarTop(wrap.ownerDocument, chromeEl)
  if (onScreenTop <= 0) return painted
  const inkBottom = [...passage.querySelectorAll('.lab-hearing-line > span, .lab-hearing-word')]
    .reduce((max, node) => {
      const rect = node.getBoundingClientRect()
      return rect.height > 8 ? Math.max(max, rect.bottom) : max
    }, 0)
  if (inkBottom >= onScreenTop - LAB_OVERFLOW_CLEAR_PX) {
    painted = {
      lastBottom: inkBottom,
      chromeTop: onScreenTop,
      lineHeight: painted?.lineHeight || 40,
      lastLineWords: painted?.lastLineWords || 0,
      scrollOverflow: true,
    }
  }
  return painted
}


function PlayIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.2v13.6L19.2 12 8 5.2z" />
    </svg>
  )
}

function PauseIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="0.5" />
      <rect x="14" y="5" width="4" height="14" rx="0.5" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function FullscreenIcon({ on }: { on?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {on ? (
        <>
          <path d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5" />
        </>
      ) : (
        <>
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </>
      )}
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.4 10.8c0-3.1 2.9-5.6 6.5-5.6s6.5 2.5 6.5 5.6-2.9 5.6-6.5 5.6c-.7 0-1.4-.1-2.1-.3L5 17.6l.5-2.8c-.7-1.1-1.1-2.5-1.1-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M11.2 16.6c.6.2 1.3.4 2.1.4 3.6 0 6.5-2.2 6.5-5 0-1.1-.5-2.2-1.2-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TalkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4.2" y="9" width="2.6" height="6" rx="1.1" />
      <rect x="10.7" y="5" width="2.6" height="14" rx="1.1" />
      <rect x="17.2" y="8" width="2.6" height="8" rx="1.1" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="10.5" height="13" rx="1.5" />
      <rect x="10" y="3" width="10.5" height="13" rx="1.5" />
      <path d="m7 9-2 2 2 2M17 11l2-2-2-2" />
    </svg>
  )
}

function SeekIcon({ forward }: { forward?: boolean }) {
  return (
    <span className={`lab-phone-seek${forward ? ' is-forward' : ''}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={forward ? 'M15.4 7.1 18 9.5l-2.6 2.4' : 'M8.6 7.1 6 9.5l2.6 2.4'}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={forward ? 'M17.2 9.5H9.6a4.4 4.4 0 1 0 0 8.8h1.7' : 'M6.8 9.5h7.6a4.4 4.4 0 1 1 0 8.8H12.7'}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
      <span>15</span>
    </span>
  )
}

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
  const [isPhone, setIsPhone] = useState(() => readPhoneSurface(layoutOverride))
  const [showPhoneChrome, setShowPhoneChrome] = useState(() => {
    const phone = readPhoneSurface(layoutOverride)
    return readPhoneFooter(layoutOverride, phone)
  })
  const boot = bootLabReading(source)
  const [book, setBook] = useState<LabSource>(boot.book)
  const [prefs, setPrefs] = useState<LabPrefs>(() => syncLabAudioEdition(readLabPrefs()))
  const [mobileCompareActive, setMobileCompareActive] = useState(false)
  const audioEditionKey = effectiveLabAudioEdition(prefs)
  const updatePrefs = useCallback((next: LabPrefs) => {
    const synced = syncLabAudioEdition(next)
    setPrefs(synced)
    writeLabPrefs(synced)
  }, [])
  const [tocOpen, setTocOpen] = useState(false)
  const [finishedChapters, setFinishedChapters] = useState(() => readFinishedChapters())
  const [fullscreen, setFullscreen] = useState(false)
  const [speedOpen, setSpeedOpen] = useState(false)
  const [settingsSection, setSettingsSection] = useState<'reading' | 'layout'>('reading')
  const [voiceLabView, setVoiceLabView] = useState<VoiceTinctView>('read')
  const [voiceHistoryFixture, setVoiceHistoryFixture] = useState(true)
  const [voiceActions, setVoiceActions] = useState<LabVoiceActionEntry[]>([])
  const [inTheBookOpen, setInTheBookOpen] = useState(false)
  const [peekBook, setPeekBook] = useState(false)
  const [phoneAskOpen, setPhoneAskOpen] = useState(false)
  const [gearOpen, setGearOpen] = useState(false)
  const [desktopAskOpen, setDesktopAskOpen] = useState(false)
  const [marks, setMarks] = useState<LabMark[]>([])
  const [focusParagraph, setFocusParagraph] = useState<number | null>(null)
  const [chrome, setChrome] = useState<LabChromeState>('reading')
  const mobileCompareEnabled = showPhoneChrome && prefs.compareOpen && book.compareParagraphs.length > 0
  const readerParagraphs = mobileCompareActive && mobileCompareEnabled
    ? book.compareParagraphs
    : book.paragraphs
  const readerEditionKey = mobileCompareActive && mobileCompareEnabled
    ? prefs.compareEdition
    : prefs.primaryEdition
  const primaryEditionLabel = editionLabelFor(prefs.primaryEdition, bibleEditions())
  const compareEditionLabel = editionLabelFor(prefs.compareEdition, bibleEditions())
  const nativePhonePaging = showPhoneChrome && browserHasNativePaging()
  const [returnTo, setReturnTo] = useState<LabReturnTo>('reading')
  const [draft, setDraft] = useState('')
  const [voiceGate, setVoiceGate] = useState<LabVoiceGatePhase>('off')
  const [readingPageIndex, setReadingPageIndex] = useState(0)
  const [openAtEnd, setOpenAtEnd] = useState(false)
  const [pageMetrics, setPageMetrics] = useState<LabPageMetrics | null>(null)
  const [readingPages, setReadingPages] = useState<ChapterHearingPage[]>(() => chapterHearingPages(readerParagraphs, null))
  const [draftPages, setDraftPages] = useState<ChapterHearingPage[]>(readingPages)
  const [settleIndex, setSettleIndex] = useState<number | null>(0)
  const labRootRef = useRef<HTMLDivElement | null>(null)
  const pageWrapRef = useRef<HTMLDivElement | null>(null)
  const measureHostRef = useRef<HTMLDivElement | null>(null)
  const bottomChromeRef = useRef<HTMLDivElement | null>(null)
  const nativeFullscreenRef = useRef(false)
  const readingPagesRef = useRef(readingPages)
  readingPagesRef.current = readingPages
  const workingPagesRef = useRef(draftPages)
  workingPagesRef.current = draftPages

  useEffect(() => {
    if (!mobileCompareEnabled) setMobileCompareActive(false)
  }, [mobileCompareEnabled])

  const toggleFullscreen = useCallback(async () => {
    setGearOpen(false)
    setTocOpen(false)
    setPhoneAskOpen(false)
    if (typeof document === 'undefined') {
      setFullscreen(on => !on)
      return
    }
    const doc = document as LabFullscreenDocument
    const active = document.fullscreenElement || doc.webkitFullscreenElement
    if (active) {
      try {
        if (document.exitFullscreen) await document.exitFullscreen()
        else await doc.webkitExitFullscreen?.()
        setFullscreen(false)
        return
      } catch {
        setFullscreen(false)
        return
      }
    }
    if (fullscreen) {
      setFullscreen(false)
      return
    }
    const root = labRootRef.current as LabFullscreenElement | null
    try {
      if (root?.requestFullscreen) await root.requestFullscreen()
      else if (root?.webkitRequestFullscreen) await root.webkitRequestFullscreen()
      else {
        setFullscreen(on => !on)
        return
      }
      setFullscreen(true)
    } catch {
      // Embedded previews and iPhone Safari can reject the native API. The
      // app-level layout still provides a useful distraction-free fallback.
      setFullscreen(on => !on)
    }
  }, [fullscreen])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const doc = document as LabFullscreenDocument
    const sync = () => {
      const active = !!(document.fullscreenElement || doc.webkitFullscreenElement)
      if (active) {
        nativeFullscreenRef.current = true
        setFullscreen(true)
      } else if (nativeFullscreenRef.current) {
        nativeFullscreenRef.current = false
        setFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])
  const readingPageIndexRef = useRef(readingPageIndex)
  readingPageIndexRef.current = readingPageIndex
  const settleIndexRef = useRef<number | null>(settleIndex)
  settleIndexRef.current = settleIndex
  const pagesStableRef = useRef(false)
  const unmeasuredTriesRef = useRef(0)
  const chapterLandingRef = useRef<'start' | 'end' | null>(null)
  const landingChapterRef = useRef<number | null>(null)
  const placeRef = useRef(boot.place)
  const restorePlaceRef = useRef<{ paragraphIndex: number; wordIndex: number } | null>(boot.place.paragraphIndex || boot.place.wordIndex ? boot.place : null)
  const headlineHeightRef = useRef(0)
  const chapterTitleRef = useRef(book.chapterTitle)
  const chapterNumberRef = useRef(book.chapterNumber)
  chapterNumberRef.current = book.chapterNumber
  const pullStartY = useRef<number | null>(null)

  const resumeListenRef = useRef<() => void>(() => {})
  const setSpeedRef = useRef<(rate: number) => void>(() => {})
  const listenSpeedRef = useRef(1)
  const skipRef = useRef<(kind: LabPlaybackSkip) => void | Promise<void>>(() => {})

  const openLabVoiceView = useCallback((view: VoiceTinctView) => {
    setVoiceLabView(view)
    setTocOpen(false)
    if (view !== 'settings') setGearOpen(false)
    if (view !== 'cast') setInTheBookOpen(false)
    if (view !== 'chat') setPhoneAskOpen(false)
    if (view !== 'chat') setDesktopAskOpen(false)
    setPeekBook(false)

    if (view === 'settings') {
      setSettingsSection('layout')
      setGearOpen(true)
    } else if (view === 'chat') {
      setPhoneAskOpen(showPhoneChrome)
      setDesktopAskOpen(!showPhoneChrome)
    } else if (view === 'cast') {
      setInTheBookOpen(true)
    }
  }, [showPhoneChrome])

  const restoreLabVoiceView = useCallback((snapshot: LabVoiceViewSnapshot) => {
    setVoiceLabView(snapshot.view)
    setPhoneAskOpen(snapshot.phoneAskOpen)
    setDesktopAskOpen(snapshot.desktopAskOpen)
    setGearOpen(snapshot.gearOpen)
    setTocOpen(snapshot.tocOpen)
    setInTheBookOpen(snapshot.inTheBookOpen)
    setPeekBook(snapshot.peekBook)
    setSettingsSection(snapshot.settingsSection)
  }, [])

  const voiceToolAdapter = createLabVoiceToolAdapter<LabVoiceViewSnapshot>({
    getViewSnapshot: () => ({
      view: voiceLabView,
      phoneAskOpen,
      desktopAskOpen,
      gearOpen,
      tocOpen,
      inTheBookOpen,
      peekBook,
      settingsSection,
    }),
    openView: openLabVoiceView,
    restoreView: restoreLabVoiceView,
    getTheme: () => prefs.darkMode ? 'dark' : 'light',
    setTheme: theme => updatePrefs({ ...prefs, darkMode: theme === 'dark' }),
    getFontSize: () => prefs.fontSize,
    setFontSize: fontSize => updatePrefs({ ...prefs, fontSize }),
    getAudioSpeed: () => listenSpeedRef.current,
    setAudioSpeed: speed => {
      listenSpeedRef.current = speed
      setSpeedRef.current(speed)
    },
    getReadingHistory: (period, bookQuery) => getLabVoiceReadingHistory({
      period,
      bookQuery,
      source: book,
      paragraphIndex: focusParagraph ?? placeRef.current.paragraphIndex,
      fixtureEnabled: voiceHistoryFixture,
    }),
  })

  const [listenSource, setListenSource] = useState(() => ({
    chapterNumber: book.chapterNumber,
    paragraphs: book.paragraphs,
    followParagraphs: book.followParagraphs,
  }))
  const [browseWhileListening, setBrowseWhileListening] = useState(false)
  const browseWhileListeningRef = useRef(false)
  const listenPlayingRef = useRef(false)

  const lockPaginationRef = useRef(false)

  const ask = useLabAsk({
    bookTitle: book.bookTitle,
    bookAuthor: book.bookAuthor,
    headerBook: book.headerBook,
    chapterLabel: book.chapterLabel,
    chapterNumber: book.chapterNumber,
    editionLabel: book.editionLabel,
    paragraphs: book.paragraphs,
    paragraphIndex: focusParagraph ?? 0,
    authToken,
    onResumeListen: () => resumeListenRef.current(),
    onSetPlaybackSpeed: (rate) => setSpeedRef.current(rate),
    onPlaybackSkip: (kind) => skipRef.current(kind),
    voiceToolAdapter,
    onVoiceToolAction: (entry) => {
      setVoiceActions(current => {
        const next = [...current, entry].slice(-20)
        if (typeof window !== 'undefined') {
          ;(window as Window & { __tinctLabVoiceActions?: LabVoiceActionEntry[] }).__tinctLabVoiceActions = next
        }
        return next
      })
    },
    onVoiceToolSessionStart: () => {
      setVoiceActions([])
      if (typeof window !== 'undefined') {
        ;(window as Window & { __tinctLabVoiceActions?: LabVoiceActionEntry[] }).__tinctLabVoiceActions = []
      }
    },
  })

  const listen = useLabListen({
    paragraphs: listenSource.paragraphs,
    followParagraphs: listenSource.followParagraphs,
    chapterNumber: listenSource.chapterNumber,
    audioEdition: audioEditionKey,
  })
  listenSpeedRef.current = listen.speed
  listenPlayingRef.current = listen.playing

  useEffect(() => {
    if (listen.playing || browseWhileListening) return
    setListenSource({
      chapterNumber: book.chapterNumber,
      paragraphs: book.paragraphs,
      followParagraphs: book.followParagraphs,
    })
  }, [book.chapterNumber, book.paragraphs, book.followParagraphs, listen.playing, browseWhileListening])

  const { notePlace, biblicalBook } = useLabPositionSync({
    book,
    placeRef,
    sourceLocked: Boolean(source),
    authToken,
    onRemoteResume: (place) => {
      restorePlaceRef.current = { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
      placeRef.current = { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
      void loadLabSource(place.sequentialChapter, {
        primary: prefs.primaryEdition,
        compare: prefs.compareEdition,
        audio: audioEditionKey,
      }).then(setBook)
    },
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
    const root = document.documentElement
    const prev = root.getAttribute('data-theme')
    root.setAttribute('data-theme', prefs.darkMode ? 'dark' : 'light')
    return () => {
      root.setAttribute('data-theme', prev ?? 'light')
    }
  }, [prefs.darkMode])

  useEffect(() => {
    if (source) {
      setBook(source)
      return
    }
    let cancelled = false
    const wanted = chapterNumberRef.current
    loadLabSource(wanted, {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
      audio: audioEditionKey,
    }).then((loaded) => {
      if (cancelled) return
      // A failed fetch returns Genesis 1. Never flash that over a restored book.
      if (loaded.chapterNumber !== wanted && wanted !== 1) return
      setBook(loaded)
    })
    return () => { cancelled = true }
  }, [source, prefs.primaryEdition, prefs.compareEdition, audioEditionKey])

  const openAtEndRef = useRef(false)

  useEffect(() => {
    const host = labRootRef.current
    if (!host || !isPhone) return
    return bindLabVisualViewportHeight(host)
  }, [isPhone])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sync = () => {
      const phone = readPhoneSurface(layoutOverride)
      setIsPhone(phone)
      setShowPhoneChrome(readPhoneFooter(layoutOverride, phone))
    }
    sync()
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia(PHONE_QUERY) : null
    mq?.addEventListener('change', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    return () => {
      mq?.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
    }
  }, [layoutOverride])

  const didBudgetPageRef = useRef(false)
  const chapterKeyRef = useRef(book.chapterTitle)
  const chapterContentRef = useRef(readerParagraphs)

  useLayoutEffect(() => {
    const chapterChanged = chapterKeyRef.current !== book.chapterTitle
    const contentChanged = chapterContentRef.current !== readerParagraphs
    chapterKeyRef.current = book.chapterTitle
    chapterContentRef.current = readerParagraphs
    if (chapterChanged || contentChanged) {
      pagesStableRef.current = false
      didBudgetPageRef.current = false
      unmeasuredTriesRef.current = 0
      setSettleIndex(nativePhonePaging ? null : 0)
      settleIndexRef.current = nativePhonePaging ? null : 0
    }
    if (readerParagraphs.length === 0) return
    const budget = pageMetrics ? labPageBudgetFromMetrics(pageMetrics) : null
    if (canUseLabPageBudget(budget)) didBudgetPageRef.current = true
    const next = chapterHearingPages(readerParagraphs, canUseLabPageBudget(budget) ? budget : null)
    readingPagesRef.current = next
    workingPagesRef.current = next
    setReadingPages(next)
    setDraftPages(next)
    const landing = chapterLandingRef.current
    if (landing === 'end' && next.length > 0) {
      const last = next.length - 1
      const page = next[last]
      pageAnchorRef.current = page ? { paragraphIndex: page.paragraphIndex, wordIndex: page.from } : null
      if (page) placeRef.current = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
      readingPageIndexRef.current = last
      setReadingPageIndex(last)
    } else if (chapterChanged) {
      if (restorePlaceRef.current) {
        const place = restorePlaceRef.current
        restorePlaceRef.current = null
        placeRef.current = place
        const idx = pageIndexForPlace(next, place.paragraphIndex, place.wordIndex)
        pageAnchorRef.current = pageAnchorOf(next[idx])
        readingPageIndexRef.current = idx
        setReadingPageIndex(idx)
      } else if (landing !== 'end') {
        pageAnchorRef.current = pageAnchorOf(next[0])
        placeRef.current = { paragraphIndex: 0, wordIndex: 0 }
        readingPageIndexRef.current = 0
        setReadingPageIndex(0)
      }
    }
  }, [book.chapterTitle, readerParagraphs, nativePhonePaging])

  useLayoutEffect(() => {
    if (nativePhonePaging) return
    if (!pageMetrics || didBudgetPageRef.current || pagesStableRef.current) return
    if (readerParagraphs.length === 0) return
    const budget = labPageBudgetFromMetrics(pageMetrics)
    if (!canUseLabPageBudget(budget)) return
    didBudgetPageRef.current = true
    const next = chapterHearingPages(readerParagraphs, budget)
    const keep = pageAnchorRef.current
    const landing = chapterLandingRef.current
    readingPagesRef.current = next
    workingPagesRef.current = next
    setReadingPages(next)
    setDraftPages(next)
    if (landing === 'end' && next.length > 0) {
      const last = next.length - 1
      const page = next[last]
      pageAnchorRef.current = page ? { paragraphIndex: page.paragraphIndex, wordIndex: page.from } : null
      if (page) placeRef.current = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
      readingPageIndexRef.current = last
      setReadingPageIndex(last)
    } else if (keep) {
      const idx = restorePageIndexForAnchor(next, keep)
      readingPageIndexRef.current = idx
      setReadingPageIndex(idx)
    }
    pagesStableRef.current = false
    setSettleIndex(0)
    settleIndexRef.current = 0
  }, [pageMetrics, readerParagraphs, nativePhonePaging])

  useLayoutEffect(() => {
    didBudgetPageRef.current = false
    pagesStableRef.current = false
    unmeasuredTriesRef.current = 0
    setSettleIndex(nativePhonePaging ? null : 0)
    settleIndexRef.current = nativePhonePaging ? null : 0
  }, [prefs.fontFamily, prefs.fontSize, nativePhonePaging])

  const lastVvRef = useRef(0)
  const lastBarTopRef = useRef(0)
  const lastAdjustRef = useRef<LabPageAdjust>(null)
  const beforeGrowPagesRef = useRef<ChapterHearingPage[] | null>(null)
  const highlightsApi = useLabHighlights(book.chapterNumber)
  const define = useDefine()
  const [selectionPopup, setSelectionPopup] = useState<(SelectionInfo & { range?: LabHighlightRange }) | null>(null)
  const [popupMode, setPopupMode] = useState<PopupMode>('colors')
  const [noteInput, setNoteInput] = useState('')
  const popupRef = useRef<HTMLDivElement | null>(null)
  const pageMetricsRef = useRef<LabPageMetrics | null>(pageMetrics)
  pageMetricsRef.current = pageMetrics
  const pageMetricGeometryRef = useRef<{ width: number; height: number } | null>(null)
  const settledPageGeometryRef = useRef<{ width: number; height: number } | null>(null)
  const pageAnchorRef = useRef<{ paragraphIndex: number; wordIndex: number } | null>(null)
  const keepPlayingChapterRef = useRef<number | null>(null)
  const listenStartRef = useRef(listen.start)
  listenStartRef.current = listen.start

  const applyNativePages = useCallback((next: ChapterHearingPage[]) => {
    // Audio chrome temporarily changes the available box. Keep the reading
    // page map as the single authority instead of repaginating mid-playback.
    if (
      !nativePhonePaging
      || listenPlayingRef.current
      || browseWhileListeningRef.current
      || next.length === 0
    ) return
    const current = readingPagesRef.current
    const working = workingPagesRef.current
    const currentIndex = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, current.length - 1)))
    const keep = pageAnchorRef.current ?? pageAnchorOf(current[currentIndex])
    const landing = chapterLandingRef.current

    pagesStableRef.current = true
    didBudgetPageRef.current = true
    unmeasuredTriesRef.current = 0
    lastAdjustRef.current = null
    beforeGrowPagesRef.current = null
    settleIndexRef.current = null
    setSettleIndex(null)
    const wrapRect = pageWrapRef.current?.getBoundingClientRect()
    if (wrapRect) settledPageGeometryRef.current = { width: wrapRect.width, height: wrapRect.height }

    workingPagesRef.current = next
    if (!sameChapterPages(working, next)) setDraftPages(next)
    if (!sameChapterPages(current, next)) {
      readingPagesRef.current = next
      setReadingPages(next)
    }

    let nextIndex = keep ? restorePageIndexForAnchor(next, keep) : 0
    if (landing === 'end') {
      nextIndex = next.length - 1
      const page = next[nextIndex]
      const anchor = pageAnchorOf(page)
      if (anchor) {
        pageAnchorRef.current = anchor
        placeRef.current = anchor
      }
    }
    nextIndex = Math.max(0, Math.min(nextIndex, next.length - 1))
    readingPageIndexRef.current = nextIndex
    setReadingPageIndex(currentValue => currentValue === nextIndex ? currentValue : nextIndex)
  }, [nativePhonePaging])

  const seekAudioToWord = useCallback(async (paragraphIndex: number, wordIndex: number) => {
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    const timed = book.followParagraphs.find(item => item.index === paragraphIndex)
    const snapped = timed?.words
      ? sentenceStartWordIndex(timed.words, wordIndex)
      : wordIndex
    const place = { paragraphIndex, wordIndex: snapped }
    placeRef.current = place
    const nextSource = {
      chapterNumber: book.chapterNumber,
      paragraphs: book.paragraphs,
      followParagraphs: book.followParagraphs,
    }
    const chapterChanged = nextSource.chapterNumber !== listenSource.chapterNumber
    if (chapterChanged) {
      listen.stop()
      flushSync(() => setListenSource(nextSource))
    }
    setReturnTo('hearing')
    returnToRef.current = 'hearing'
    setChrome('hearing')
    setReadingPageIndex(pageIndexForPlace(readingPagesRef.current, paragraphIndex, snapped))
    notePlace('play', place)
    if (!chapterChanged && listen.src) {
      listen.seekToPlace(paragraphIndex, snapped)
      if (!listen.playing) listen.resume()
      return
    }
    await listen.start(place)
  }, [book, listen, listenSource.chapterNumber, notePlace])

  useLayoutEffect(() => {
    lastVvRef.current = 0
    lastBarTopRef.current = 0
    lastAdjustRef.current = null
    beforeGrowPagesRef.current = null
    pagesStableRef.current = false
    settleIndexRef.current = nativePhonePaging ? null : 0
    setSettleIndex(nativePhonePaging ? null : 0)
  }, [book.chapterTitle, nativePhonePaging])

  useLayoutEffect(() => {
    if (nativePhonePaging) return
    const wrap = pageWrapRef.current
    const chromeEl = bottomChromeRef.current
    if (!wrap || !chromeEl || phoneAskOpen) return
    const pinLandingEnd = (pages: ChapterHearingPage[]) => {
      if (chapterLandingRef.current !== 'end' || pages.length === 0) return
      const last = pages.length - 1
      const page = pages[last]
      readingPageIndexRef.current = last
      setReadingPageIndex(last)
      if (page) {
        placeRef.current = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
        pageAnchorRef.current = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
      }
    }
    const fixVisiblePagePaint = (pages: ChapterHearingPage[]): ChapterHearingPage[] => {
      if (listenPlayingRef.current || browseWhileListeningRef.current) return pages
      const passage = visiblePassage()
      if (!passage) return pages
      const pageIdx = Math.max(0, Math.min(readingPageIndexRef.current, pages.length - 1))
      const live = pages[pageIdx]
      if (!live) return pages
      const painted = measureVisiblePageOverflow(wrap, passage, chromeEl)
      if (!painted) return pages
      const tail = chapterPageTail(live)
      if (!tail) return pages
      const paraWords = tokenizeHearingWords(readerParagraphs[tail.paragraphIndex] || '')
      if (!labPageFitsPaint(painted)) {
        if (tail.to <= tail.from + 1) return pages
        const overflowPx = Math.max(0, painted.lastBottom - painted.chromeTop)
        let nextTo = nextPaintShrinkTo(tail.from, tail.to, painted.lastLineWords, overflowPx, painted.lineHeight)
        nextTo = snapShrinkEndToSentence(
          paraWords,
          tail.from,
          tail.to,
          nextTo,
          Math.max(6, painted.lastLineWords || 0),
        )
        if (nextTo >= tail.to) return pages
        const shrunk = chapterPageSegments(live).length > 1
          ? cutPageTailTo(pages, pageIdx, nextTo)
          : applyPaintShrink(pages, pageIdx, nextTo, {
              lastLineWords: painted.lastLineWords,
              overflowing: true,
            })
        return sameChapterPages(shrunk, pages) ? pages : shrunk
      }
      return pages
    }
    const finishSettle = () => {
      const keep = pageAnchorRef.current
      let pages = workingPagesRef.current
      if (keep) pages = ensurePageIdentity(pages, keep)
      workingPagesRef.current = pages
      setDraftPages(pages)
      const fixed = fixVisiblePagePaint(pages)
      if (!sameChapterPages(fixed, pages)) {
        pagesStableRef.current = false
        workingPagesRef.current = fixed
        readingPagesRef.current = fixed
        setDraftPages(fixed)
        setReadingPages(fixed)
        const pageIdx = Math.max(0, Math.min(readingPageIndexRef.current, fixed.length - 1))
        settleIndexRef.current = pageIdx
        setSettleIndex(pageIdx)
        return
      }
      pagesStableRef.current = true
      const settledRect = wrap.getBoundingClientRect()
      settledPageGeometryRef.current = { width: settledRect.width, height: settledRect.height }
      setSettleIndex(null)
      settleIndexRef.current = null
      unmeasuredTriesRef.current = 0
      if (!sameChapterPages(readingPagesRef.current, pages)) {
        readingPagesRef.current = pages
        setReadingPages(pages)
      }
      if (keep) {
        const idx = restorePageIndexForAnchor(pages, keep)
        const clamped = Math.max(0, Math.min(idx, Math.max(0, pages.length - 1)))
        if (clamped !== readingPageIndexRef.current) {
          readingPageIndexRef.current = clamped
          setReadingPageIndex(clamped)
        }
      }
      if (chapterLandingRef.current === 'end') {
        pinLandingEnd(pages)
        // Keep landing=end until the readingPages effect sees a stable
        // list. Clearing it here lets a leftover {0,0} place snap to p1.
      }
    }
    const advanceSettle = (from: number, pages: ChapterHearingPage[]) => {
      unmeasuredTriesRef.current = 0
      lastAdjustRef.current = null
      beforeGrowPagesRef.current = null
      const nextIdx = from + 1
      if (nextIdx >= pages.length) {
        finishSettle()
        return
      }
      settleIndexRef.current = nextIdx
      setSettleIndex(nextIdx)
    }
    const applyPageList = (pages: ChapterHearingPage[], updateVisible: boolean) => {
      workingPagesRef.current = pages
      setDraftPages(pages)
      if (updateVisible) {
        readingPagesRef.current = pages
        setReadingPages(pages)
      }
      return 'peeled' as const
    }
    const visiblePassage = () => [...wrap.querySelectorAll('.lab-passage')].find(el => !el.closest('.lab-page-measure')) as HTMLElement | undefined
    const peelHost = (pageIdx: number): 'peeled' | 'fits' | 'unmeasured' => {
      const host = measureHostRef.current ?? wrap.querySelector('.lab-page-measure') as HTMLElement | null
      const passage = visiblePassage()
      if (!host && !passage) return 'unmeasured'
      const pages = workingPagesRef.current
      const live = pages[pageIdx]
      if (!live) return 'fits'
      let painted = host ? measurePaintedOverflow(host, chromeEl) : null
      const shown = readingPagesRef.current[Math.max(0, Math.min(readingPageIndexRef.current, readingPagesRef.current.length - 1))]
      const sameAsVisible = !!shown && sameChapterPages([shown], [live])
      if (passage && sameAsVisible) {
        painted = measurePaintedOverflow(passage, chromeEl) ?? painted
        const hasWordInk = [...passage!.querySelectorAll('.lab-hearing-line > span, .lab-hearing-word')]
          .some(node => {
            const rect = node.getBoundingClientRect()
            return rect.height > 8 && rect.bottom > 40
          })
        if (!hasWordInk) {
          const line = passage!.querySelector('.lab-hearing-line') as HTMLElement | null
          const barTop = painted?.chromeTop || measureLabBarTop(wrap.ownerDocument, chromeEl)
          if (line && barTop > 0) {
            const box = line.getBoundingClientRect()
            if (box.height > 8 && box.bottom >= barTop - 8) {
              painted = {
                lastBottom: box.bottom,
                chromeTop: barTop,
                lineHeight: painted?.lineHeight || 40,
                lastLineWords: painted?.lastLineWords || 0,
                scrollOverflow: true,
              }
            }
          }
        } else {
          const onScreenTop = measureLabOnScreenBarTop(wrap.ownerDocument, chromeEl)
          if (onScreenTop > 0) {
            const inkBottom = [...passage!.querySelectorAll('.lab-hearing-line > span, .lab-hearing-word')]
              .reduce((max, node) => {
                const rect = node.getBoundingClientRect()
                return rect.height > 8 ? Math.max(max, rect.bottom) : max
              }, 0)
            if (inkBottom >= onScreenTop - 8) {
              painted = {
                lastBottom: inkBottom,
                chromeTop: onScreenTop,
                lineHeight: painted?.lineHeight || 40,
                lastLineWords: painted?.lastLineWords || 0,
                scrollOverflow: true,
              }
            }
          }
        }
      }
      const vv = typeof window !== 'undefined' ? (window.visualViewport?.height ?? 0) : 0
      if (painted) {
        lastVvRef.current = vv
        lastBarTopRef.current = painted.chromeTop
      }
      if (!painted) return lastBarTopRef.current > 0 ? 'unmeasured' : 'fits'
      if (labPageFitsPaint(painted)) {
        if (!listenPlayingRef.current && !browseWhileListeningRef.current) {
          const grown = growPaintedPageIfSlack(pages, pageIdx, painted, lastAdjustRef.current, readerParagraphs)
          if (!sameChapterPages(grown, pages)) {
            beforeGrowPagesRef.current = pages
            lastAdjustRef.current = 'grow'
            return applyPageList(grown, sameAsVisible)
          }
        }
        const tail = chapterPageTail(live)
        if (!tail) return 'fits'
        const paraWords = tokenizeHearingWords(readerParagraphs[tail.paragraphIndex] || '')
        const polishedTo = polishPageEnd(
          paraWords,
          tail.from,
          tail.to,
          Math.max(6, painted.lastLineWords || 0),
        )
        if (polishedTo < tail.to) {
          const polished = cutPageTailTo(pages, pageIdx, polishedTo)
          if (!sameChapterPages(polished, pages)) {
            // The cleaner end is final for this page. Pulling the weak fragment
            // straight back would undo the typographic cleanup forever.
            lastAdjustRef.current = 'polish'
            return applyPageList(polished, sameAsVisible)
          }
        }
        return 'fits'
      }
      if (lastAdjustRef.current === 'grow' && beforeGrowPagesRef.current) {
        const reverted = beforeGrowPagesRef.current
        const trialWords = Math.max(
          1,
          leftoverWordCount(live) - leftoverWordCount(reverted[pageIdx]),
        )
        if (trialWords > 1) {
          const refined = growPageByWords(reverted, pageIdx, Math.max(1, Math.floor(trialWords / 2)))
          if (!sameChapterPages(refined, reverted)) {
            beforeGrowPagesRef.current = reverted
            lastAdjustRef.current = 'grow'
            return applyPageList(refined, sameAsVisible)
          }
        }
        beforeGrowPagesRef.current = null
        lastAdjustRef.current = 'polish'
        return applyPageList(reverted, sameAsVisible)
      }
      const tail = chapterPageTail(live)
      if (!tail || tail.to <= tail.from + 1) return 'fits'
      const overflowPx = Math.max(0, painted.lastBottom - painted.chromeTop)
      let nextTo = nextPaintShrinkTo(tail.from, tail.to, painted.lastLineWords, overflowPx, painted.lineHeight)
      const paraWords = tokenizeHearingWords(readerParagraphs[tail.paragraphIndex] || '')
      nextTo = snapShrinkEndToSentence(
        paraWords,
        tail.from,
        tail.to,
        nextTo,
        Math.max(6, painted.lastLineWords || 0),
      )
      if (nextTo >= tail.to) return 'fits'
      const metrics = pageMetricsRef.current
      const budget = metrics ? labPageBudgetFromMetrics(metrics) : null
      const shrunk = chapterPageSegments(live).length > 1
        ? cutPageTailTo(pages, pageIdx, nextTo)
        : reflowAfterCut(
            readerParagraphs,
            pages,
            pageIdx,
            nextTo,
            canUseLabPageBudget(budget) ? budget : null,
            { lastLineWords: painted.lastLineWords, overflowing: true },
          )
      // If the last paint was a trial grow, this peel establishes its upper
      // bound. Keep the fitted result instead of growing straight back.
      lastAdjustRef.current = lastAdjustRef.current === 'grow' ? 'polish' : 'peel'
      return applyPageList(shrunk, sameAsVisible)
    }
    const shrinkIfNeeded = () => {
      if (pagesStableRef.current) return
      if (lockPaginationRef.current) {
        finishSettle()
        return
      }
      const pages = workingPagesRef.current
      if (pages.length === 0) {
        finishSettle()
        return
      }
      const measureIdx = Math.max(0, Math.min(settleIndexRef.current ?? 0, pages.length - 1))
      const measured = peelHost(measureIdx)
      if (measured === 'peeled') return
      if (measured === 'unmeasured') {
        unmeasuredTriesRef.current += 1
        if (unmeasuredTriesRef.current <= 4) {
          afterLabPaint(shrinkIfNeeded)
          return
        }
      }
      advanceSettle(measureIdx, workingPagesRef.current)
    }
    const cancelPaint = pagesStableRef.current ? (() => {}) : afterLabPaint(shrinkIfNeeded)
    const onJump = () => {
      if (lockPaginationRef.current) return
      // Hearing chrome (slim transport, browse) changes bar metrics — do not re-settle mid-session.
      if (listenPlayingRef.current || browseWhileListeningRef.current) return
      // After settle, bar jitter should not re-paginate the whole chapter on every page turn.
      if (pagesStableRef.current) return
      const barTop = measureLabBarTop(wrap.ownerDocument, chromeEl)
      if (!labBarMoved(lastBarTopRef.current, barTop)) return
      lastBarTopRef.current = barTop
      pagesStableRef.current = false
      workingPagesRef.current = readingPagesRef.current
      setDraftPages(readingPagesRef.current)
      settleIndexRef.current = 0
      setSettleIndex(0)
    }
    const viewport = typeof window !== 'undefined' ? window.visualViewport : null
    viewport?.addEventListener('resize', onJump)
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onJump)
      window.addEventListener('orientationchange', onJump)
    }
    return () => {
      cancelPaint()
      viewport?.removeEventListener('resize', onJump)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onJump)
        window.removeEventListener('orientationchange', onJump)
      }
    }
  }, [settleIndex, draftPages, phoneAskOpen, readerParagraphs, book.chapterTitle, nativePhonePaging])

  useLayoutEffect(() => {
    const wrap = pageWrapRef.current
    if (!wrap) return
    pageMetricGeometryRef.current = null
    const apply = () => {
      const wrapRect = wrap.getBoundingClientRect()
      const geometry = { width: wrapRect.width, height: wrapRect.height }
      const previous = pageMetricGeometryRef.current
      if (
        previous
        && previous.width === geometry.width
        && previous.height === geometry.height
        && pageMetricsRef.current
      ) return
      if (
        !nativePhonePaging
        && pagesStableRef.current
        && labPageGeometryChanged(settledPageGeometryRef.current, geometry)
        && !lockPaginationRef.current
        && !listenPlayingRef.current
        && !browseWhileListeningRef.current
      ) {
        // Page breaks belong to the readable box that produced them. A phone
        // resize (including device emulation/orientation) must invalidate them.
        pagesStableRef.current = false
        settledPageGeometryRef.current = null
        didBudgetPageRef.current = false
        unmeasuredTriesRef.current = 0
        workingPagesRef.current = readingPagesRef.current
        setDraftPages(readingPagesRef.current)
        settleIndexRef.current = 0
        setSettleIndex(0)
      }
      const measured = measureLabPageMetrics(wrap, bottomChromeRef.current)
      if (!measured) return
      const metrics = stabilizeLabPageMetrics(pageMetricsRef.current, measured, headlineHeightRef.current)
      pageMetricGeometryRef.current = geometry
      if (metrics.headlineHeight > 0) headlineHeightRef.current = metrics.headlineHeight
      pageMetricsRef.current = metrics
      setPageMetrics((current) => {
        if (
          current
          && current.height === metrics.height
          && current.width === metrics.width
          && current.lineHeight === metrics.lineHeight
          && current.headlineHeight === metrics.headlineHeight
          && Math.abs(current.avgCharWidth - metrics.avgCharWidth) < 0.01
        ) {
          return current
        }
        return metrics
      })
    }
    apply()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null
    ro?.observe(wrap)
    if (bottomChromeRef.current) ro?.observe(bottomChromeRef.current)
    const viewport = typeof window !== 'undefined' ? window.visualViewport : null
    viewport?.addEventListener('resize', apply)
    const cancelPaint = afterLabPaint(() => {
      pageMetricGeometryRef.current = null
      apply()
    })
    return () => {
      cancelPaint()
      ro?.disconnect()
      viewport?.removeEventListener('resize', apply)
    }
  }, [isPhone, showPhoneChrome, listen.playing, chrome, phoneAskOpen, prefs.fontFamily, prefs.fontSize, fullscreen, nativePhonePaging])

  useLayoutEffect(() => {
    if (
      nativePhonePaging
      || !pagesStableRef.current
      || phoneAskOpen
      || listenPlayingRef.current
      || browseWhileListeningRef.current
    ) return
    const wrap = pageWrapRef.current
    const chromeEl = bottomChromeRef.current
    if (!wrap || !chromeEl) return
    const passage = [...wrap.querySelectorAll('.lab-passage')]
      .find(el => !el.closest('.lab-page-measure')) as HTMLElement | undefined
    if (!passage) return
    const painted = measureVisiblePageOverflow(wrap, passage, chromeEl)
    if (!painted || labPageFitsPaint(painted)) return

    // Hidden preflight catches most pages. This visible-page check is the final
    // invariant for font/browser rounding differences on a page turn.
    const pageIdx = Math.max(0, Math.min(readingPageIndexRef.current, readingPagesRef.current.length - 1))
    pagesStableRef.current = false
    unmeasuredTriesRef.current = 0
    workingPagesRef.current = readingPagesRef.current
    setDraftPages(readingPagesRef.current)
    settleIndexRef.current = pageIdx
    setSettleIndex(pageIdx)
  }, [readingPageIndex, readingPages, phoneAskOpen, listen.playing, browseWhileListening, nativePhonePaging])

  useEffect(() => {
    if (chapterLandingRef.current === 'end') {
      // Prev-from-next-chapter sets landing=end before the new book
      // arrives. Applying it to the still-settled outgoing chapter pins
      // that chapter's last page and then clears landing, so the incoming
      // chapter snaps to page 1 (Gen2 p1 prev → Gen1 p1).
      if (landingChapterRef.current != null && landingChapterRef.current !== book.chapterNumber) {
        return
      }
      if (readingPages.length === 0) return
      const last = readingPages.length - 1
      const page = readingPages[last]
      readingPageIndexRef.current = last
      setReadingPageIndex(last)
      if (page) {
        placeRef.current = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
        pageAnchorRef.current = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
      }
      // Stay on the last page until the chapter list has settled. Do not
      // let a leftover {0,0} anchor snap Genesis 1 back to page 1.
      if (pagesStableRef.current) {
        chapterLandingRef.current = null
        landingChapterRef.current = null
        openAtEndRef.current = false
        setOpenAtEnd(false)
      }
      return
    }
    setReadingPageIndex((current) => {
      const keep = pageAnchorRef.current
      const next = keep
        ? restorePageIndexForAnchor(readingPages, keep)
        : pageIndexForPlace(
          readingPages,
          placeRef.current.paragraphIndex,
          placeRef.current.wordIndex,
        )
      if (next !== current) {
        const page = readingPages[next]
        const anchor = pageAnchorOf(page)
        if (anchor) pageAnchorRef.current = anchor
      }
      readingPageIndexRef.current = next
      return next === current ? current : next
    })
  }, [readingPages, openAtEnd, book.chapterNumber])

  const chromeRef = useRef(chrome)
  chromeRef.current = chrome
  const returnToRef = useRef(returnTo)
  returnToRef.current = returnTo
  const pausedForAskRef = useRef(false)
  const stayInAskRef = useRef(false)
  const phoneAskOpenRef = useRef(phoneAskOpen)
  phoneAskOpenRef.current = phoneAskOpen
  const desktopAskOpenRef = useRef(desktopAskOpen)
  desktopAskOpenRef.current = desktopAskOpen

  const interruptHearForAsk = useCallback(() => {
    const hearingNow = chromeRef.current === 'hearing' || !!listen.src || listen.playing
    if (!hearingNow) return
    pausedForAskRef.current = true
    setReturnTo('hearing')
    returnToRef.current = 'hearing'
    listen.pause()
  }, [listen])

  const resumeListenAfterAsk = useCallback(() => {
    ask.stopVoice()
    if (stayInAskRef.current) {
      stayInAskRef.current = false
      setVoiceGate('off')
      setPhoneAskOpen(true)
      setChrome(current => (current === 'talking' ? (pausedForAskRef.current || returnToRef.current === 'hearing' ? 'hearing' : 'reading') : current))
      return
    }
    setPhoneAskOpen(false)
    setDesktopAskOpen(false)
    setPeekBook(false)
    const shouldHear = pausedForAskRef.current || returnToRef.current === 'hearing'
    pausedForAskRef.current = false
    if (!shouldHear) {
      setChrome('reading')
      return
    }
    setReturnTo('hearing')
    returnToRef.current = 'hearing'
    setChrome('hearing')
    if (listen.src) listen.resume()
    else void listen.start(placeRef.current)
  }, [ask, listen])
  resumeListenRef.current = resumeListenAfterAsk
  setSpeedRef.current = (rate) => {
    listen.setSpeed(rate)
    pausedForAskRef.current = true
    setReturnTo('hearing')
    returnToRef.current = 'hearing'
  }

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
      setDesktopAskOpen(true)
      return
    }
    if (!wasTalking) return
    if (phoneAskOpenRef.current) {
      setChrome(current => {
        if (current !== 'talking') return current
        return pausedForAskRef.current || returnToRef.current === 'hearing' ? 'hearing' : 'reading'
      })
      return
    }
    if (pausedForAskRef.current || returnToRef.current === 'hearing') {
      resumeListenAfterAsk()
    } else {
      setDesktopAskOpen(false)
      setChrome(current => (current === 'talking' ? labAfterTalk(returnToRef.current) : current))
    }
  }, [ask.voiceActive, resumeListenAfterAsk])

  useEffect(() => {
    setVoiceGate(current => nextLabVoiceGate(
      current,
      ask.conversationState,
      ask.voiceActive,
      ask.notice,
      ask.userSpeechStarted,
    ))
  }, [ask.conversationState, ask.voiceActive, ask.notice, ask.userSpeechStarted])

  useEffect(() => {
    if (voiceGate !== 'connecting') return
    const timer = window.setTimeout(() => {
      if (ask.conversationState !== 'connecting') return
      ask.failStart()
      setVoiceGate('off')
    }, LAB_CONNECTING_FAIL_MS)
    return () => window.clearTimeout(timer)
  }, [ask.conversationState, ask.failStart, voiceGate])

  const typedLoadingRef = useRef(false)
  useEffect(() => {
    const wasLoading = typedLoadingRef.current
    typedLoadingRef.current = ask.typedLoading
    if (!wasLoading || ask.typedLoading || ask.voiceActive) return
    if (phoneAskOpenRef.current || desktopAskOpenRef.current) return
    if (!pausedForAskRef.current && returnToRef.current !== 'hearing') return
    if (chromeRef.current === 'talking') return
    resumeListenAfterAsk()
  }, [ask.typedLoading, ask.voiceActive, resumeListenAfterAsk])

  const readingPage = readingPages[Math.max(0, Math.min(readingPageIndex, Math.max(0, readingPages.length - 1)))]
  useLayoutEffect(() => {
    const wrap = pageWrapRef.current
    if (!wrap) return
    const passage = [...wrap.querySelectorAll('.lab-passage')]
      .find(node => !node.closest('.lab-page-measure')) as HTMLElement | undefined
    if (passage) passage.scrollTop = 0
  }, [book.chapterTitle, readingPageIndex, readingPage?.paragraphIndex, readingPage?.from, readingPage?.to, readingPage?.segments])
  const readingTail = chapterPageTail(readingPage)
  const isOnline = readOnline(online)
  const voiceOverlayOpen = showPhoneChrome && chrome === 'talking' && !phoneAskOpen
  const phoneAsk = showPhoneChrome && phoneAskOpen
  const showHearing = !mobileCompareActive && !peekBook && !phoneAsk && (
    chrome === 'hearing' || (chrome === 'talking' && returnTo === 'hearing')
  )
  const showSlimTransport = showPhoneChrome && !fullscreen && labShowSlimTransport({
    playing: listen.playing,
    phoneAsk,
  })
  const speedLabel = `${listen.speed.toFixed(2)}×`
  const adjustPlaybackSpeed = (delta: number) => {
    const next = Math.max(0.5, Math.min(3, Math.round((listen.speed + delta) * 100) / 100))
    listen.setSpeed(next)
  }
  useEffect(() => {
    if (!showSlimTransport) setSpeedOpen(false)
  }, [showSlimTransport])
  const showPhoneBar = !fullscreen && labShowPhoneBar({
    phoneChrome: showPhoneChrome,
    fullscreen,
    phoneAsk,
  })
  const canPrevChapter = prevLabChapter(book.chapters, book.chapterNumber) != null
  const canNextChapter = nextLabChapter(book.chapters, book.chapterNumber) != null
  const showReaderRail = !fullscreen && labShowReaderRail({
    phoneAsk,
    phoneChrome: showPhoneChrome,
    pageCount: Math.max(readingPages.length, draftPages.length, workingPagesRef.current.length),
    playing: listen.playing,
    canPrevChapter,
    canNextChapter,
  })
  const markedIndexes = useMemo(() => new Set(marks.map(mark => mark.paragraphIndex)), [marks])
  const rawChapterProgress = labChapterProgress({
    paragraphs: readerParagraphs,
    pages: readingPages,
    pageIndex: readingPageIndex,
    paragraphIndex: showHearing && listen.follow.kind === 'word' ? listen.follow.paragraphIndex : readingTail?.paragraphIndex,
    wordIndex: showHearing && listen.follow.kind === 'word' ? listen.follow.wordIndex : readingTail?.to,
  })
  const chapterProgress = clampedChapterProgress(rawChapterProgress)
  const footProgress = labFootProgress({
    chapterNumber: book.chapterNumber,
    chapterLabel: book.chapterLabel,
    currentPage: chapterProgress.currentPage,
    totalPages: chapterProgress.totalPages,
    percent: chapterProgress.percent,
    chapterCount: book.chapters.length,
    metric: prefs.progressDisplay.metric,
    scope: prefs.progressDisplay.scope,
  })
  lockPaginationRef.current = showHearing && listen.playing && !browseWhileListening
  const footProgressCompact = showPhoneChrome && !fullscreen && listen.playing && !phoneAsk
  const footProgressLabel = footProgressCompact
    ? labFootProgressPages(chapterProgress.currentPage, chapterProgress.totalPages)
    : footProgress

  useEffect(() => {
    if (!showHearing) return
    const follow = listen.follow
    const pageIdx = Math.max(0, Math.min(readingPageIndex, Math.max(0, readingPages.length - 1)))
    if (browseWhileListeningRef.current) {
      if (followOnReadingPage(follow, readingPages, pageIdx)) return
      // Keep browse mode until the user pauses or taps a word — do not snap text mid-browse.
      return
    }
    if (follow.kind === 'word') {
      const page = readingPages[readingPageIndex]
      const midBook = !!page && (page.paragraphIndex > 0 || page.from > 0)
      const resetToStart = follow.paragraphIndex === 0 && follow.wordIndex === 0
      const inFirst15 = listen.clipIndex === 0 && listen.currentTime < 15
      if (resetToStart && midBook && !inFirst15) return
      placeRef.current = { paragraphIndex: follow.paragraphIndex, wordIndex: follow.wordIndex }
      if (page && page.paragraphIndex === follow.paragraphIndex && follow.wordIndex < page.to && follow.wordIndex >= page.from) return
      setReadingPageIndex((current) => {
        const next = pageIndexForPlace(readingPages, follow.paragraphIndex, follow.wordIndex)
        if (next !== current) {
          const page = readingPages[next]
          const anchor = pageAnchorOf(page)
          if (anchor) pageAnchorRef.current = anchor
        }
        return next === current ? current : next
      })
    } else if (follow.kind === 'paragraph') {
      const page = readingPages[readingPageIndex]
      const midBook = !!page && page.paragraphIndex > 0
      if (follow.paragraphIndex === 0 && midBook && !(listen.clipIndex === 0 && listen.currentTime < 15)) return
      placeRef.current = { paragraphIndex: follow.paragraphIndex, wordIndex: 0 }
      if (page && page.paragraphIndex === follow.paragraphIndex) return
      setReadingPageIndex((current) => {
        const next = pageIndexForPlace(readingPages, follow.paragraphIndex, 0)
        if (next !== current) {
          const page = readingPages[next]
          const anchor = pageAnchorOf(page)
          if (anchor) pageAnchorRef.current = anchor
        }
        return next === current ? current : next
      })
    }
  }, [listen.follow, readingPages, readingPageIndex, showHearing, listen.clipIndex, listen.currentTime])

  useEffect(() => {
    if (!showHearing || !listen.playing || browseWhileListeningRef.current) return
    const follow = listen.follow
    if (follow.kind !== 'word' && follow.kind !== 'paragraph') return
    const next = follow.kind === 'word'
      ? pageIndexForPlace(readingPages, follow.paragraphIndex, follow.wordIndex)
      : pageIndexForPlace(readingPages, follow.paragraphIndex, 0)
    if (next === readingPageIndexRef.current) return
    const page = readingPages[next]
    const anchor = pageAnchorOf(page)
    if (anchor) pageAnchorRef.current = anchor
    readingPageIndexRef.current = next
    setReadingPageIndex(next)
  }, [readingPages, showHearing, listen.playing, listen.follow])

  useEffect(() => {
    const editions = {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
      audio: audioEditionKey,
    }
    prefetchLabChapterTexts(book.chapterNumber, editions, 3)
  }, [book.chapterNumber, book.chapters, prefs.primaryEdition, prefs.compareEdition, audioEditionKey])

  const warmChapterTexts = useCallback((number: number) => {
    prefetchLabChapterTexts(number, {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
    }, 1)
  }, [prefs.primaryEdition, prefs.compareEdition])

  useLayoutEffect(() => {
    if (!selectionPopup) return
    const el = popupRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 8
    let dx = 0
    let dy = 0
    if (rect.left < margin) dx = margin - rect.left
    else if (rect.right > vw - margin) dx = (vw - margin) - rect.right
    if (rect.top < margin) dy = margin - rect.top
    else if (rect.bottom > vh - margin) dy = (vh - margin) - rect.bottom
    if (dx === 0 && dy === 0) return
    setSelectionPopup(sp => sp ? { ...sp, x: sp.x + dx, y: sp.y + dy } : null)
  }, [selectionPopup?.x, selectionPopup?.y, selectionPopup?.showBelow, popupMode, noteInput])

  const dismissSelectionPopup = useCallback(() => {
    setSelectionPopup(null)
    setPopupMode('colors')
    setNoteInput('')
    define.setQuery('')
  }, [define])

  useEffect(() => {
    if (!selectionPopup) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('.selection-popup') || target.closest('[data-testid="lab-word"]')) return
      dismissSelectionPopup()
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [dismissSelectionPopup, selectionPopup])

  const handleSelectRange = useCallback((range: LabHighlightRange, clientX: number, clientY: number) => {
    const created = highlightsApi.addOrReuse(range, 'gold')
    const mode = defaultPopupMode(range.text, created.id)
    setPopupMode(mode)
    setNoteInput(created.note || '')
    if (mode === 'define') define.begin(range.text)
    const anchorY = clientY
    const showBelow = window.innerHeight - anchorY > anchorY
    const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
    const estimatedHeight = mode === 'define' ? 220 : 64
    const chromeEl = bottomChromeRef.current
    const chromeTop = chromeEl?.getBoundingClientRect().top ?? window.innerHeight
    const bottomInset = Math.max(48, window.innerHeight - chromeTop + 8)
    const bottomSheetTop = chromeTop - estimatedHeight - 12
    const safeTop = 88
    const floatingY = anchorY - estimatedHeight - 12
    const hasRoomAboveSelection = floatingY >= safeTop
    const shouldFloatAbove = mobile && anchorY > bottomSheetTop - bottomInset && hasRoomAboveSelection
    setSelectionPopup({
      x: Math.max(24, Math.min(window.innerWidth - 24, clientX)),
      y: shouldFloatAbove ? floatingY : showBelow ? anchorY + 12 : anchorY - 12,
      text: range.text,
      paragraphIndex: range.paragraphIndex,
      startOffset: range.fromWord,
      endOffset: range.toWord,
      showBelow,
      mobilePlacement: shouldFloatAbove ? 'above-selection' : 'bottom',
      existingHighlightId: created.id,
      existingNote: created.note,
      range,
    })
  }, [define, highlightsApi])

  const leaveTalking = useCallback(() => {
    resumeListenAfterAsk()
  }, [resumeListenAfterAsk])

  const commitUnsettledNav = useCallback((pages: ChapterHearingPage[]) => {
    if (pagesStableRef.current) return
    pagesStableRef.current = true
    setSettleIndex(null)
    settleIndexRef.current = null
    unmeasuredTriesRef.current = 0
    workingPagesRef.current = pages
    setDraftPages(pages)
    if (!sameChapterPages(readingPagesRef.current, pages)) {
      readingPagesRef.current = pages
      setReadingPages(pages)
    }
  }, [])

  const primaryAnchorFor = useCallback((anchor: { paragraphIndex: number; wordIndex: number }) => (
    mobileCompareActive
      ? mapLabCompareAnchor(readerParagraphs, book.paragraphs, anchor)
      : anchor
  ), [book.paragraphs, mobileCompareActive, readerParagraphs])

  const goToPage = useCallback((index: number) => {
    const reading = readingPagesRef.current
    const working = workingPagesRef.current
    const navPages = labNavPageList(pagesStableRef.current, working, reading)
    let page = navPages[index]
    if (!page) page = reading[index]
    if (!page) return
    const committed = navPages[index] ? navPages : reading
    commitUnsettledNav(committed)
    chapterLandingRef.current = null
    landingChapterRef.current = null
    openAtEndRef.current = false
    setOpenAtEnd(false)
    const activeAnchor = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
    pageAnchorRef.current = activeAnchor
    const clamped = Math.max(0, Math.min(index, Math.max(0, committed.length - 1)))
    readingPageIndexRef.current = clamped
    setReadingPageIndex(clamped)
    if (listen.playing || browseWhileListeningRef.current) {
      browseWhileListeningRef.current = true
      setBrowseWhileListening(true)
    } else {
      const primaryAnchor = primaryAnchorFor(activeAnchor)
      placeRef.current = primaryAnchor
      notePlace('page-turn', primaryAnchor)
      if (listen.src && !mobileCompareActive) listen.seekToPlace(page.paragraphIndex, page.from)
    }
  }, [commitUnsettledNav, listen, mobileCompareActive, notePlace, primaryAnchorFor])

  const handleMobileCompare = useCallback(() => {
    if (!mobileCompareEnabled) return
    const current = readingPagesRef.current
    const currentIndex = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, current.length - 1)))
    const sourceAnchor = pageAnchorOf(current[currentIndex]) ?? pageAnchorRef.current ?? { paragraphIndex: 0, wordIndex: 0 }
    const nextActive = !mobileCompareActive
    const targetParagraphs = nextActive ? book.compareParagraphs : book.paragraphs
    const mapped = mapLabCompareAnchor(readerParagraphs, targetParagraphs, sourceAnchor)
    const primaryAnchor = nextActive ? sourceAnchor : mapped
    const budget = pageMetricsRef.current ? labPageBudgetFromMetrics(pageMetricsRef.current) : null
    const nextPages = chapterHearingPages(targetParagraphs, canUseLabPageBudget(budget) ? budget : null)
    const nextIndex = pageIndexForPlace(nextPages, mapped.paragraphIndex, mapped.wordIndex)

    if (listen.playing) listen.pause()
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    setChrome('reading')
    setReturnTo('reading')
    setPeekBook(false)
    setInTheBookOpen(false)
    pageAnchorRef.current = mapped
    placeRef.current = primaryAnchor
    notePlace('page-turn', primaryAnchor)
    pagesStableRef.current = false
    readingPagesRef.current = nextPages
    workingPagesRef.current = nextPages
    readingPageIndexRef.current = nextIndex
    setReadingPages(nextPages)
    setDraftPages(nextPages)
    setReadingPageIndex(nextIndex)
    setMobileCompareActive(nextActive)
  }, [book.compareParagraphs, book.paragraphs, listen, mobileCompareActive, mobileCompareEnabled, notePlace, readerParagraphs])

  const browseToChapter = useCallback(async (number: number, landing: 'start' | 'end') => {
    if (listen.playing) {
      browseWhileListeningRef.current = true
      setBrowseWhileListening(true)
    }
    prefetchLabChapterTexts(number, {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
    }, 3)
    pageAnchorRef.current = null
    restorePlaceRef.current = null
    chapterLandingRef.current = landing
    landingChapterRef.current = number
    openAtEndRef.current = landing === 'end'
    if (landing === 'start') {
      placeRef.current = { paragraphIndex: 0, wordIndex: 0 }
    }
    notePlace('chapter-jump', {
      sequentialChapter: number,
      paragraphIndex: 0,
      wordIndex: 0,
    })
    const loaded = await loadLabSource(number, {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
      audio: audioEditionKey,
    })
    setBook(loaded)
    setOpenAtEnd(landing === 'end')
  }, [listen.playing, notePlace, prefs.compareEdition, prefs.primaryEdition, audioEditionKey])

  const goToChapter = useCallback(async (number: number, landing: 'start' | 'end') => {
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    prefetchLabChapterTexts(number, {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
    }, 1)
    keepPlayingChapterRef.current = listen.playing ? number : null
    listen.stop()
    pageAnchorRef.current = null
    restorePlaceRef.current = null
    chapterLandingRef.current = landing
    landingChapterRef.current = number
    openAtEndRef.current = landing === 'end'
    // Do not flip openAtEnd until the new book is in place. Doing it
    // here retriggers the landing effect on the outgoing chapter.
    if (landing === 'start') {
      placeRef.current = { paragraphIndex: 0, wordIndex: 0 }
    }
    notePlace('chapter-jump', {
      sequentialChapter: number,
      paragraphIndex: 0,
      wordIndex: 0,
    })
    const loaded = await loadLabSource(number, {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
      audio: audioEditionKey,
    })
    setBook(loaded)
    setOpenAtEnd(landing === 'end')
  }, [listen, notePlace, prefs.compareEdition, prefs.primaryEdition, audioEditionKey])

  useEffect(() => {
    const target = keepPlayingChapterRef.current
    if (target == null || target !== book.chapterNumber) return
    keepPlayingChapterRef.current = null
    setReturnTo('hearing')
    returnToRef.current = 'hearing'
    setChrome('hearing')
    const place = openAtEndRef.current
      ? { paragraphIndex: Math.max(0, book.paragraphs.length - 1), wordIndex: 0 }
      : { paragraphIndex: 0, wordIndex: 0 }
    placeRef.current = place
    void listenStartRef.current(place)
    return () => {
      if (keepPlayingChapterRef.current == null) keepPlayingChapterRef.current = target
    }
  }, [book.chapterNumber])

  const goToParagraph = useCallback((index: number, opts?: { seekAudio?: boolean }) => {
    const last = Math.max(0, book.paragraphs.length - 1)
    const next = Math.max(0, Math.min(last, index))
    setFocusParagraph(next)
    setReadingPageIndex(pageIndexForPlace(readingPages, next, 0))
    if (listen.playing || browseWhileListeningRef.current) {
      browseWhileListeningRef.current = true
      setBrowseWhileListening(true)
      return
    }
    placeRef.current = { paragraphIndex: next, wordIndex: 0 }
    notePlace('page-turn', { paragraphIndex: next, wordIndex: 0 })
    if (opts?.seekAudio && listen.src) listen.seekToPlace(next, 0)
  }, [book.paragraphs.length, listen, notePlace, readingPages])

  const applyPlaybackSkip = useCallback(async (kind: LabPlaybackSkip) => {
    pausedForAskRef.current = true
    setReturnTo('hearing')
    returnToRef.current = 'hearing'
    const resolved = resolveLabPlaybackSkip({
      kind,
      chapterNumber: book.chapterNumber,
      paragraphIndex: placeRef.current.paragraphIndex,
      paragraphCount: book.paragraphs.length,
      chapters: book.chapters,
    })
    if (resolved.chapterChanged) {
      if (resolved.chapterNumber > book.chapterNumber) {
        setFinishedChapters(markChapterFinished(book.chapterNumber))
      }
      await goToChapter(resolved.chapterNumber, resolved.landing)
      return
    }
    goToParagraph(resolved.paragraphIndex, { seekAudio: true })
  }, [book.chapterNumber, book.chapters, book.paragraphs.length, goToChapter, goToParagraph])
  skipRef.current = applyPlaybackSkip

  const goNext = useCallback(() => {
    const reading = readingPagesRef.current
    const working = workingPagesRef.current
    const pages = labNavPageList(pagesStableRef.current, working, reading)
    const index = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, pages.length - 1)))
    const nextPage = adjacentPageIndex(pages.length, index, 1)
    if (nextPage != null) {
      goToPage(nextPage)
      return
    }
    const next = nextLabChapter(book.chapters, book.chapterNumber)
    if (next != null) {
      setFinishedChapters(markChapterFinished(book.chapterNumber))
      if (listen.playing) void browseToChapter(next, 'start')
      else void goToChapter(next, 'start')
    }
  }, [book.chapterNumber, book.chapters, browseToChapter, goToChapter, goToPage, listen.playing])

  const goPrev = useCallback(() => {
    const reading = readingPagesRef.current
    const working = workingPagesRef.current
    const pages = labNavPageList(pagesStableRef.current, working, reading)
    const index = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, pages.length - 1)))
    const prevPage = adjacentPageIndex(pages.length, index, -1)
    if (prevPage != null) {
      goToPage(prevPage)
      return
    }
    const prev = prevLabChapter(book.chapters, book.chapterNumber)
    if (prev != null) {
      if (listen.playing) void browseToChapter(prev, 'end')
      else void goToChapter(prev, 'end')
    }
  }, [book.chapterNumber, book.chapters, browseToChapter, goToChapter, goToPage, listen.playing])

  const startHearing = useCallback((opts?: { force?: boolean }) => {
    if (chrome === 'talking' && !opts?.force) return
    if (chrome === 'hearing' && !opts?.force) {
      listen.pause()
      browseWhileListeningRef.current = false
      setBrowseWhileListening(false)
      const follow = listen.follow
      const page = readingPages[readingPageIndex]
      if (follow.kind === 'word') {
        const jumpedBack = !!page && (
          follow.paragraphIndex < page.paragraphIndex
          || (follow.paragraphIndex === page.paragraphIndex && follow.wordIndex < page.from)
        )
        if (!jumpedBack) {
          placeRef.current = { paragraphIndex: follow.paragraphIndex, wordIndex: follow.wordIndex }
          setReadingPageIndex(pageIndexForPlace(readingPages, follow.paragraphIndex, follow.wordIndex))
        }
      } else if (follow.kind === 'paragraph') {
        if (!(page && follow.paragraphIndex < page.paragraphIndex)) {
          placeRef.current = { paragraphIndex: follow.paragraphIndex, wordIndex: 0 }
          setReadingPageIndex(pageIndexForPlace(readingPages, follow.paragraphIndex, 0))
        }
      }
      setChrome('reading')
      setReturnTo('reading')
      setPeekBook(false)
      notePlace('pause')
      return
    }
    const page = readingPages[Math.max(0, Math.min(readingPageIndex, Math.max(0, readingPages.length - 1)))]
    const place = page
      ? { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
      : placeRef.current
    const follow = listen.follow
    const onThisPage = follow.kind === 'word' && page
      && follow.paragraphIndex === page.paragraphIndex
      && follow.wordIndex >= page.from
      && follow.wordIndex < page.to
    placeRef.current = onThisPage
      ? { paragraphIndex: follow.paragraphIndex, wordIndex: follow.wordIndex }
      : place
    flushSync(() => setListenSource({
      chapterNumber: book.chapterNumber,
      paragraphs: book.paragraphs,
      followParagraphs: book.followParagraphs,
    }))
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    setReturnTo('hearing')
    setChrome('hearing')
    setPeekBook(false)
    setInTheBookOpen(false)
    notePlace('play')
    if (listen.src && onThisPage) listen.resume()
    else void listen.start(placeRef.current)
  }, [chrome, listen, notePlace, readingPageIndex, readingPages])

  const handleHeaderListen = useCallback(() => {
    if (peekBook && chrome === 'hearing') {
      setPeekBook(false)
      setInTheBookOpen(false)
      return
    }
    startHearing()
  }, [chrome, peekBook, startHearing])

  const handleMic = useCallback(() => {
    if (ask.voiceActive) {
      if (showPhoneChrome) {
        ask.stopVoice()
        return
      }
      resumeListenAfterAsk()
      return
    }
    interruptHearForAsk()
    setDesktopAskOpen(true)
    void ask.toggleInChatVoice()
  }, [ask, interruptHearForAsk, resumeListenAfterAsk, showPhoneChrome])

  const handleVoiceMode = useCallback(() => {
    interruptHearForAsk()
    setDesktopAskOpen(true)
    void ask.startVoice()
  }, [ask, interruptHearForAsk])

  const openPhoneAsk = useCallback(() => {
    setGearOpen(false)
    interruptHearForAsk()
    setPhoneAskOpen(true)
    setInTheBookOpen(false)
    setPeekBook(false)
  }, [interruptHearForAsk])

  const handleTalk = useCallback(() => {
    setGearOpen(false)
    interruptHearForAsk()
    setVoiceGate('connecting')
    setChrome('talking')
    openPhoneAsk()
    void ask.startVoice().then((started) => {
      if (!started) setVoiceGate('off')
    })
  }, [ask, interruptHearForAsk, openPhoneAsk])

  const handleChat = useCallback(() => {
    setGearOpen(false)
    setVoiceGate('off')
    stayInAskRef.current = true
    openPhoneAsk()
    if (ask.voiceActive) ask.stopVoice()
    else stayInAskRef.current = false
  }, [ask, openPhoneAsk])

  const handleBarListen = useCallback(() => {
    setGearOpen(false)
    if (phoneAskOpen || chrome === 'talking') {
      resumeListenAfterAsk()
      return
    }
    if (mobileCompareActive) {
      const current = readingPagesRef.current
      const index = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, current.length - 1)))
      const compareAnchor = pageAnchorOf(current[index]) ?? pageAnchorRef.current ?? { paragraphIndex: 0, wordIndex: 0 }
      const primaryAnchor = mapLabCompareAnchor(readerParagraphs, book.paragraphs, compareAnchor)
      pageAnchorRef.current = primaryAnchor
      placeRef.current = primaryAnchor
      notePlace('play', primaryAnchor)
      setMobileCompareActive(false)
      setReturnTo('hearing')
      setChrome('hearing')
      setPeekBook(false)
      setInTheBookOpen(false)
      flushSync(() => setListenSource({
        chapterNumber: book.chapterNumber,
        paragraphs: book.paragraphs,
        followParagraphs: book.followParagraphs,
      }))
      void listen.start(primaryAnchor)
      return
    }
    if (chrome === 'hearing') {
      if (listen.playing) {
        listen.pause()
        return
      }
      if (listen.src) {
        listen.resume()
        return
      }
      startHearing({ force: true })
      return
    }
    startHearing()
  }, [book.chapterNumber, book.followParagraphs, book.paragraphs, chrome, listen, mobileCompareActive, notePlace, phoneAskOpen, readerParagraphs, resumeListenAfterAsk, startHearing])

  const closePhoneAsk = useCallback(() => {
    resumeListenAfterAsk()
  }, [resumeListenAfterAsk])

  const handleOrb = useCallback(() => {
    if (ask.voiceActive) {
      leaveTalking()
      return
    }
    void ask.startVoice()
  }, [ask, leaveTalking])

  const handleAsk = useCallback((value: string) => {
    if (isResumeListenCommand(value)) {
      setDraft('')
      resumeListenAfterAsk()
      return
    }
    interruptHearForAsk()
    setDesktopAskOpen(true)
    setDraft('')
    void ask.sendTyped(value)
  }, [ask, interruptHearForAsk, resumeListenAfterAsk])

  const handleAskAbout = useCallback((name: string) => {
    const question = `Who is ${name} on this page?`
    setInTheBookOpen(false)
    if (showPhoneChrome) {
      openPhoneAsk()
      return
    }
    interruptHearForAsk()
    setDesktopAskOpen(true)
    setDraft('')
    void ask.sendTyped(question)
  }, [ask, interruptHearForAsk, openPhoneAsk, showPhoneChrome])

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
    setPhoneAskOpen(false)
    setInTheBookOpen(open => {
      const next = !open
      setPeekBook(chrome === 'hearing' ? next : false)
      return next
    })
  }, [chrome])

  return (
    <div
      ref={labRootRef}
      lang={bibleEditions().find(edition => edition.key === readerEditionKey)?.language || 'en'}
      className={`lab ${isPhone ? 'is-phone' : 'is-desktop'}${showPhoneChrome ? ' has-phone-chrome' : ''}${showSlimTransport ? ' has-slim-transport' : ''}${ask.notice ? ' has-notice' : ''}${phoneAskOpen ? ' has-phone-ask' : ''}${prefs.darkMode ? ' is-night' : ''}${fullscreen ? ' is-fullscreen' : ''}`}
      data-testid="lab-root"
      data-lab-layout={showPhoneChrome ? 'phone' : 'desktop'}
      data-chrome-state={chrome}
      data-phone-bar={showPhoneBar ? labPhoneBarMode(chrome, peekBook, phoneAskOpen) : 'none'}
      data-page-height={pageMetrics ? String(pageMetrics.height) : ''}
      data-chapter={String(book.chapterNumber)}
      data-biblical-book={biblicalBook}
      data-place={`${placeRef.current.paragraphIndex}:${placeRef.current.wordIndex}`}
      data-playing={listen.playing ? 'true' : 'false'}
      data-fullscreen={fullscreen ? 'true' : 'false'}
      data-reader-edition={readerEditionKey}
      data-compare-active={mobileCompareActive ? 'true' : 'false'}
      data-voice-surface={voiceLabView}
      data-voice-history-fixture={voiceHistoryFixture ? 'true' : 'false'}
      data-audio-speed={String(listen.speed)}
      style={{
        ['--lab-font-reader' as string]: labFontFamilyCss(prefs.fontFamily),
        ['--lab-font-size' as string]: String(prefs.fontSize),
      }}
    >
      {fullscreen && (
        <button
          type="button"
          className="lab-fullscreen-exit-hotspot"
          onClick={() => { void toggleFullscreen() }}
          aria-label={LAB_COPY.exitFullScreen}
          data-testid="lab-fullscreen-exit"
        >
          <FullscreenIcon on />
        </button>
      )}
      <header className="lab-header">
        <div className="lab-header-brand">
          <h1 className="lab-header-work" data-testid="lab-header-work">{book.bookTitle}</h1>
          <span className="lab-title-sep" aria-hidden="true"> · </span>
          <button
            type="button"
            className="lab-header-chapter"
            data-testid="lab-header-chapter"
            aria-label={`Table of contents, ${book.chapterLabel}`}
            onClick={() => { setGearOpen(false); setTocOpen(true) }}
          >
            <span className="lab-header-chapter-label">{book.chapterLabel}</span>
            <span className="lab-header-chevron" aria-hidden="true">∨</span>
          </button>
        </div>
        <div className="lab-header-controls">
          <button
            type="button"
            className={`lab-fullscreen ${fullscreen ? 'is-on' : ''}`}
            onClick={() => { void toggleFullscreen() }}
            aria-label={fullscreen ? LAB_COPY.exitFullScreen : LAB_COPY.fullScreen}
            data-testid="lab-fullscreen"
          >
            <FullscreenIcon on={fullscreen} />
          </button>
          <button
            type="button"
            className={`lab-gear ${gearOpen ? 'is-open' : ''}`}
            onClick={() => { setTocOpen(false); setGearOpen(open => !open); setSettingsSection('reading') }}
            aria-label={LAB_COPY.settings}
            aria-expanded={gearOpen}
            aria-haspopup="dialog"
            data-testid="lab-gear"
          >
            <GearIcon />
          </button>
        </div>
        <p className="lab-status" data-testid="lab-status">
          {labStatusLine(
            labVisibleChrome(chrome, peekBook),
            book.chapterLabel,
            showPhoneChrome ? 'phone' : 'desktop',
          )}
        </p>
      </header>


      <div className="lab-body">
        {!(showPhoneChrome && phoneAsk) && (
        <div
          className="lab-page-wrap"
          ref={pageWrapRef}
          onTouchStart={(event) => { pullStartY.current = event.touches[0]?.clientY ?? null }}
          onTouchEnd={(event) => {
            const start = pullStartY.current
            pullStartY.current = null
            if (start == null || selectionPopup) return
            const endY = event.changedTouches[0]?.clientY ?? start
            if (labPullOpensToc(endY - start)) setTocOpen(true)
          }}
        >
          <LabPassage
            chapterTitle={book.chapterTitle}
            paragraphs={readerParagraphs}
            compareParagraphs={book.compareParagraphs}
            compare={prefs.compareOpen && !showPhoneChrome}
            mode={showHearing ? 'hearing' : 'reading'}
            follow={showHearing && listen.playing && !browseWhileListening ? listen.follow : { kind: 'none' }}
            followParagraphs={listen.followParagraphs}
            clips={listen.clips}
            playing={listen.playing}
            clipIndex={listen.clipIndex}
            currentTime={listen.currentTime}
            speed={listen.speed}
            browseWhileListening={browseWhileListening}
            onSeekToWord={listen.playing ? seekAudioToWord : undefined}
            onTogglePlay={() => {
              if (listen.playing) listen.pause()
              else if (listen.src) listen.resume()
              else void listen.start()
            }}
            onSeek={listen.seek}
            onCycleSpeed={listen.cycleSpeed}
            hideTransport={showPhoneChrome}
            markedIndexes={mobileCompareActive ? new Set<number>() : markedIndexes}
            onMark={mobileCompareActive ? undefined : handleMark}
            focusParagraph={focusParagraph}
            dimmed={voiceOverlayOpen}
            peek={chrome === 'hearing' && peekBook}
            readingPage={readingPage}
            chapterPages={readingPages}
            highlights={mobileCompareActive ? [] : highlightsApi.chapterHighlights}
            chapterNumber={book.chapterNumber}
            selectingRange={selectionPopup?.range ?? null}
            onSelectRange={phoneAsk || mobileCompareActive ? undefined : handleSelectRange}
            onPageTurn={showPhoneChrome && !phoneAsk && !selectionPopup
              ? (direction) => { if (direction > 0) goNext(); else goPrev() }
              : undefined}
          />
          {nativePhonePaging && (
            <LabNativePaginator
              chapterTitle={book.chapterTitle}
              paragraphs={readerParagraphs}
              layoutKey={[
                book.chapterNumber,
                readerEditionKey,
                prefs.fontFamily,
                prefs.fontSize,
                fullscreen ? 'fullscreen' : 'windowed',
                chrome,
                showSlimTransport ? 'slim' : 'standard',
              ].join(':')}
              onPages={applyNativePages}
            />
          )}
          {!nativePhonePaging && settleIndex != null && draftPages[settleIndex] && (
            <div
              className="lab-page-measure"
              ref={measureHostRef}
              aria-hidden="true"
              key={`${settleIndex}-${draftPages[settleIndex].from}-${draftPages[settleIndex].to}-${showHearing && listen.playing && !browseWhileListening ? 'hear' : 'read'}`}
            >
              <LabPageMeasurePaint
                chapterTitle={book.chapterTitle}
                paragraphs={readerParagraphs}
                page={draftPages[settleIndex]}
                hearingPaint={showHearing && listen.playing && !browseWhileListening}
              />
            </div>
          )}
        </div>
        )}
        {!showPhoneChrome && !desktopAskOpen && (
          <button
            type="button"
            className="lab-ask-tab"
            data-testid="lab-ask-tab"
            onClick={() => setDesktopAskOpen(true)}
          >
            {LAB_COPY.ask}
          </button>
        )}
        {((!showPhoneChrome && desktopAskOpen) || phoneAsk) && (
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
            onDone={phoneAsk ? undefined : closePhoneAsk}
            phoneSheet={!!phoneAsk}
          />
        )}
      </div>

      <div className="lab-bottom-chrome" ref={bottomChromeRef} data-testid="lab-bottom-chrome">
      {showReaderRail && (
        <nav className={`lab-page-turn ${showPhoneChrome ? 'is-phone-rail' : ''}${showSlimTransport ? ' has-audio-controls' : ''}`} data-testid="lab-page-turn" aria-label="Page">
          {readingPageIndex > 0 || canPrevChapter ? (
            <button
              type="button"
              className={showPhoneChrome ? 'lab-visually-hidden' : 'lab-page-turn-btn'}
              data-testid="lab-page-prev"
              aria-label={LAB_COPY.previous}
              onClick={goPrev}
            >
              {showPhoneChrome ? '←' : LAB_COPY.previous}
            </button>
          ) : (
            !showPhoneChrome ? <span className="lab-page-turn-spacer" /> : null
          )}
          <div
            className="lab-chapter-progress"
            data-testid="lab-chapter-progress"
            title={footProgress}
          >
            {showSlimTransport && (
              <button
                type="button"
                className="lab-phone-icon"
                onClick={() => listen.seek(-15)}
                aria-label={LAB_COPY.back15}
                data-testid="lab-hearing-back"
              >
                <SeekIcon />
              </button>
            )}
            <span className="lab-chapter-progress-info">{footProgressLabel}</span>
            {showSlimTransport && (
              <>
                <button
                  type="button"
                  className="lab-transport-toggle"
                  onClick={listen.pause}
                  aria-label={LAB_COPY.pause}
                  data-testid="lab-transport-toggle"
                >
                  <PauseIcon size={22} />
                </button>
                <button
                  type="button"
                  className="lab-phone-icon"
                  onClick={() => listen.seek(15)}
                  aria-label={LAB_COPY.forward15}
                  data-testid="lab-hearing-forward"
                >
                  <SeekIcon forward />
                </button>
                <div className="lab-speed-control">
                  <button
                    type="button"
                    className="lab-phone-speed"
                    onClick={() => setSpeedOpen(open => !open)}
                    aria-label={`Playback speed ${speedLabel}`}
                    aria-expanded={speedOpen}
                    data-testid="lab-hearing-speed"
                  >
                    {speedLabel}
                  </button>
                  {speedOpen && (
                    <div className="lab-speed-popover" role="dialog" aria-label="Playback speed" data-testid="lab-speed-popover">
                      <span className="lab-speed-title">Playback speed</span>
                      <output className="lab-speed-value">{speedLabel}</output>
                      <div className="lab-speed-adjust">
                        <button type="button" onClick={() => adjustPlaybackSpeed(-0.05)} aria-label="Decrease playback speed">−</button>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.05"
                          value={listen.speed}
                          onChange={event => listen.setSpeed(Number(event.currentTarget.value))}
                          aria-label="Playback speed"
                          data-testid="lab-speed-slider"
                        />
                        <button type="button" onClick={() => adjustPlaybackSpeed(0.05)} aria-label="Increase playback speed">+</button>
                      </div>
                      <div className="lab-speed-scale" aria-hidden="true">
                        <span>0.50×</span><span>1.00×</span><span>3.00×</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {readingPageIndex < labNavPageList(pagesStableRef.current, draftPages, readingPages).length - 1 || canNextChapter ? (
            <button
              type="button"
              className={showPhoneChrome ? 'lab-visually-hidden' : 'lab-page-turn-btn'}
              data-testid="lab-page-next"
              aria-label={LAB_COPY.next}
              onClick={goNext}
            >
              {showPhoneChrome ? '→' : LAB_COPY.next}
            </button>
          ) : (
            !showPhoneChrome ? <span className="lab-page-turn-spacer" /> : null
          )}
          {!showPhoneChrome && (
            <button
              type="button"
              className="lab-header-btn lab-header-listen"
              onClick={handleHeaderListen}
              data-testid="lab-listen"
            >
              {chrome === 'hearing' && !peekBook ? (
                LAB_COPY.read
              ) : (
                <>
                  <span className="lab-header-play" data-testid="lab-listen-play" aria-hidden="true">
                    <PlayIcon size={16} />
                  </span>
                  {LAB_COPY.listen}
                </>
              )}
            </button>
          )}
        </nav>
      )}
      {!showPhoneChrome && !showReaderRail && (
        <button
          type="button"
          className="lab-header-btn lab-header-listen"
          onClick={handleHeaderListen}
          data-testid="lab-listen"
        >
          {chrome === 'hearing' && !peekBook ? (
            LAB_COPY.read
          ) : (
            <>
              <span className="lab-header-play" data-testid="lab-listen-play" aria-hidden="true">
                <PlayIcon size={16} />
              </span>
              {LAB_COPY.listen}
            </>
          )}
        </button>
      )}

      {showPhoneBar && (
        <footer className="lab-phone-bar" data-testid="lab-phone-bar">
          {ask.notice && !phoneAsk && (
            <p className="lab-phone-notice" data-testid="lab-voice-notice">{ask.notice}</p>
          )}
          <div className="lab-phone-bar-row">
            <button
              type="button"
              className={`lab-phone-fat ${listen.playing ? 'is-active' : ''}`}
              onClick={handleBarListen}
              aria-label={listen.playing ? LAB_COPY.pause : LAB_COPY.play}
              data-testid="lab-listen"
            >
              {listen.playing ? (
                <>
                  <span data-testid="lab-hearing-pause" className="lab-visually-hidden">{LAB_COPY.pause}</span>
                  <PauseIcon size={18} />
                </>
              ) : (
                <span className="lab-header-play" data-testid="lab-listen-play" aria-hidden="true">
                  <PlayIcon size={18} />
                </span>
              )}
              {listen.playing ? LAB_COPY.pause : LAB_COPY.play}
            </button>
            {mobileCompareEnabled && (
              <button
                type="button"
                className={`lab-phone-fat ${mobileCompareActive ? 'is-active' : ''}`}
                onClick={handleMobileCompare}
                aria-label={mobileCompareActive ? `Return to ${primaryEditionLabel}` : `Compare with ${compareEditionLabel}`}
                aria-pressed={mobileCompareActive}
                data-testid="lab-phone-compare"
              >
                <CompareIcon />
                {LAB_COPY.compare}
              </button>
            )}
            <button
              type="button"
              className={`lab-phone-fat ${phoneAsk && !ask.voiceActive ? 'is-active' : ''}`}
              onClick={handleChat}
              data-testid="lab-phone-chat"
            >
              <ChatIcon />
              {LAB_COPY.chat}
            </button>
            <button
              type="button"
              className={`lab-phone-fat ${ask.voiceActive || (phoneAsk && chrome === 'talking') ? 'is-active' : ''}`}
              onClick={handleTalk}
              data-testid="lab-phone-talk"
            >
              <TalkIcon />
              {LAB_COPY.talk}
            </button>
          </div>
        </footer>
      )}
      </div>

      <LabVoiceActionPanel
        active={ask.voiceActive}
        view={voiceLabView}
        darkMode={prefs.darkMode}
        fontSize={prefs.fontSize}
        audioSpeed={listen.speed}
        fixtureEnabled={voiceHistoryFixture}
        onFixtureEnabled={setVoiceHistoryFixture}
        actions={voiceActions}
      />

      <LabInTheBook
        open={inTheBookOpen}
        onToggle={handleInTheBook}
        onClose={() => {
          setInTheBookOpen(false)
          setPeekBook(false)
        }}
        paragraphs={book.paragraphs}
        chapters={book.chapters}
        currentChapter={book.chapterNumber}
        marks={marks}
        cast={book.cast}
        online={isOnline}
        onAskAbout={handleAskAbout}
        onJumpParagraph={setFocusParagraph}
        panel
        phone={showPhoneChrome}
        hideToggle
      />

      <LabSettingsSheet
        open={gearOpen}
        section={settingsSection}
        onSection={setSettingsSection}
        onClose={() => setGearOpen(false)}
        prefs={prefs}
        onPrefs={updatePrefs}
        editions={bibleEditions()}
        audioEditions={bibleAudioEditions()}
        onOpenThisBook={() => {
          setGearOpen(false)
          setPhoneAskOpen(false)
          setInTheBookOpen(true)
          setPeekBook(chrome === 'hearing')
        }}
      />

      {tocOpen && (
        <div className="lab-toc" data-testid="lab-toc">
          <LabPhoneBibleTree
            title={book.bookTitle}
            chapters={book.chapters}
            currentChapter={book.chapterNumber}
            sections={book.sections}
            finishedChapters={finishedChapters}
            onSelectChapter={(number) => {
              setTocOpen(false)
              if (listen.playing) void browseToChapter(number, 'start')
              else void goToChapter(number, 'start')
            }}
            onWarmChapter={warmChapterTexts}
            onClose={() => setTocOpen(false)}
          />
        </div>
      )}

      {showPhoneChrome && voiceGate !== 'off' && (
        <LabVoiceGate phase={voiceGate === 'ready' ? 'ready' : 'connecting'} />
      )}

      {voiceOverlayOpen && (
        <LabConversationOverlay
          state={ask.conversationState}
          notice={ask.notice}
          onLeave={leaveTalking}
          onActivate={handleOrb}
        />
      )}

      {selectionPopup && (
        <SelectionPopup
          selection={selectionPopup}
          popupRef={popupRef}
          popupMode={popupMode}
          setPopupMode={setPopupMode}
          onColorClick={(color: HighlightColor) => {
            if (selectionPopup.existingHighlightId) {
              highlightsApi.setColor(selectionPopup.existingHighlightId, color)
              dismissSelectionPopup()
            }
          }}
          defineQuery={define.query}
          setDefineQuery={define.setQuery}
          defineResult={define.result}
          defineLoading={define.loading}
          defineNotFound={define.notFound}
          runDefine={define.run}
          onDefine={() => {
            if (selectionPopup.text) define.begin(selectionPopup.text)
            setPopupMode('define')
          }}
          issueTag=""
          setIssueTag={() => {}}
          issueComment=""
          setIssueComment={() => {}}
          issueSubmitting={false}
          onIssueSubmit={() => {}}
          noteInput={noteInput}
          setNoteInput={setNoteInput}
          onUpdateHighlightNote={(id, note) => highlightsApi.setNote(id, note)}
          onRequestNote={() => setPopupMode('note')}
          onExplain={() => {
            if (selectionPopup.text) define.begin(selectionPopup.text)
            setPopupMode('define')
          }}
          onCopy={() => {
            const text = selectionPopup.text
            const done = () => dismissSelectionPopup()
            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText(text).finally(done)
            } else {
              done()
            }
          }}
          onShare={(text) => {
            if (typeof navigator !== 'undefined' && 'share' in navigator) {
              void navigator.share({ text }).finally(() => dismissSelectionPopup())
            } else {
              dismissSelectionPopup()
            }
          }}
          onDeleteHighlight={(id) => {
            highlightsApi.remove(id)
            dismissSelectionPopup()
          }}
          dismissPopup={dismissSelectionPopup}
          lab
        />
      )}

      {!showPhoneChrome && (
        <p className="lab-visually-hidden" data-testid="lab-desktop-panes">
          {LAB_DESKTOP_PANES.join(', ')}
        </p>
      )}
      <p
        className="lab-visually-hidden"
        data-testid="lab-listen-status"
        data-chapter={String(book.chapterNumber)}
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
