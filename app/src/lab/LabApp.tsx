import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  labPageFitsPaint,
  labBarMoved,
  measureLabBarTop,
  measureLabPageMetrics,
  measurePaintedOverflow,
  nextLabVoiceGate,
  nextPaintShrinkTo,
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
  readLabPrefs,
  writeLabPrefs,
  type LabPrefs,
} from './labPrefs'
import { labLayoutOverride } from './labRoute'
import { LabAskPane } from './LabAskPane'
import { LabConversationOverlay, LabVoiceGate } from './LabConversation'
import { LabPageMeasurePaint, LabPassage } from './LabPassage'
import { LabInTheBook } from './LabInTheBook'
import { bibleFallbackSource, loadLabSource, nextLabChapter, prevLabChapter, type LabMark, type LabSource } from './labSource'
import { bootLabReading, useLabPositionSync } from './useLabPositionSync'
import { isResumeListenCommand, resolveLabPlaybackSkip, type LabPlaybackSkip } from './labAsk'
import { adjacentPageIndex, canUseLabPageBudget, chapterHearingPages, clampedChapterProgress, labChapterProgress, labPageBudgetFromMetrics, pageAnchorOf, pageIndexForPlace, reflowAfterCut, restorePageIndexForAnchor, sameChapterPages, type ChapterHearingPage } from './labHearing'
import { useLabAsk } from './useLabAsk'
import { useLabListen } from './useLabListen'
import './lab.css'

const PHONE_QUERY = '(max-width: 1024px)'

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
  const [prefs, setPrefs] = useState<LabPrefs>(() => readLabPrefs())
  const [tocOpen, setTocOpen] = useState(false)
  const [finishedChapters, setFinishedChapters] = useState(() => readFinishedChapters())
  const [fullscreen, setFullscreen] = useState(false)
  const [settingsSection, setSettingsSection] = useState<'reading' | 'layout'>('reading')
  const [inTheBookOpen, setInTheBookOpen] = useState(false)
  const [peekBook, setPeekBook] = useState(false)
  const [phoneAskOpen, setPhoneAskOpen] = useState(false)
  const [gearOpen, setGearOpen] = useState(false)
  const [desktopAskOpen, setDesktopAskOpen] = useState(false)
  const [marks, setMarks] = useState<LabMark[]>([])
  const [focusParagraph, setFocusParagraph] = useState<number | null>(null)
  const [chrome, setChrome] = useState<LabChromeState>('reading')
  const [returnTo, setReturnTo] = useState<LabReturnTo>('reading')
  const [draft, setDraft] = useState('')
  const [voiceGate, setVoiceGate] = useState<LabVoiceGatePhase>('off')
  const [readingPageIndex, setReadingPageIndex] = useState(0)
  const [openAtEnd, setOpenAtEnd] = useState(false)
  const [pageMetrics, setPageMetrics] = useState<LabPageMetrics | null>(null)
  const [readingPages, setReadingPages] = useState<ChapterHearingPage[]>(() => chapterHearingPages(book.paragraphs, null))
  const [draftPages, setDraftPages] = useState<ChapterHearingPage[]>(readingPages)
  const [settleIndex, setSettleIndex] = useState<number | null>(0)
  const labRootRef = useRef<HTMLDivElement | null>(null)
  const pageWrapRef = useRef<HTMLDivElement | null>(null)
  const measureHostRef = useRef<HTMLDivElement | null>(null)
  const bottomChromeRef = useRef<HTMLDivElement | null>(null)
  const readingPagesRef = useRef(readingPages)
  readingPagesRef.current = readingPages
  const workingPagesRef = useRef(draftPages)
  workingPagesRef.current = draftPages
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
  const skipRef = useRef<(kind: LabPlaybackSkip) => void | Promise<void>>(() => {})

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
  })

  const listen = useLabListen({
    paragraphs: book.paragraphs,
    followParagraphs: book.followParagraphs,
    chapterNumber: book.chapterNumber,
    audioEdition: prefs.audioEdition,
  })

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
        audio: prefs.audioEdition,
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

  const updatePrefs = useCallback((next: LabPrefs) => {
    setPrefs(next)
    writeLabPrefs(next)
  }, [])

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
      audio: prefs.audioEdition,
    }).then((loaded) => {
      if (cancelled) return
      // A failed fetch returns Genesis 1. Never flash that over a restored book.
      if (loaded.chapterNumber !== wanted && wanted !== 1) return
      setBook(loaded)
    })
    return () => { cancelled = true }
  }, [source, prefs.primaryEdition, prefs.compareEdition, prefs.audioEdition])

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

  useLayoutEffect(() => {
    const chapterChanged = chapterKeyRef.current !== book.chapterTitle
    chapterKeyRef.current = book.chapterTitle
    if (chapterChanged) {
      pagesStableRef.current = false
      didBudgetPageRef.current = false
      unmeasuredTriesRef.current = 0
      setSettleIndex(0)
      settleIndexRef.current = 0
    }
    if (book.paragraphs.length === 0) return
    const budget = pageMetrics ? labPageBudgetFromMetrics(pageMetrics) : null
    if (canUseLabPageBudget(budget)) didBudgetPageRef.current = true
    const next = chapterHearingPages(book.paragraphs, canUseLabPageBudget(budget) ? budget : null)
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
  }, [book.chapterTitle, book.paragraphs])

  useLayoutEffect(() => {
    if (!pageMetrics || didBudgetPageRef.current || pagesStableRef.current) return
    if (book.paragraphs.length === 0) return
    const budget = labPageBudgetFromMetrics(pageMetrics)
    if (!canUseLabPageBudget(budget)) return
    didBudgetPageRef.current = true
    const next = chapterHearingPages(book.paragraphs, budget)
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
  }, [pageMetrics, book.paragraphs])

  const lastVvRef = useRef(0)
  const lastBarTopRef = useRef(0)
  const pageMetricsRef = useRef<LabPageMetrics | null>(pageMetrics)
  pageMetricsRef.current = pageMetrics
  const pageAnchorRef = useRef<{ paragraphIndex: number; wordIndex: number } | null>(null)
  const keepPlayingChapterRef = useRef<number | null>(null)
  const listenStartRef = useRef(listen.start)
  listenStartRef.current = listen.start

  useLayoutEffect(() => {
    lastVvRef.current = 0
    lastBarTopRef.current = 0
    pagesStableRef.current = false
    settleIndexRef.current = 0
    setSettleIndex(0)
  }, [book.chapterTitle])

  useLayoutEffect(() => {
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
    const finishSettle = () => {
      const pages = workingPagesRef.current
      pagesStableRef.current = true
      setSettleIndex(null)
      settleIndexRef.current = null
      unmeasuredTriesRef.current = 0
      if (!sameChapterPages(readingPagesRef.current, pages)) {
        readingPagesRef.current = pages
        setReadingPages(pages)
      }
      if (chapterLandingRef.current === 'end') {
        pinLandingEnd(pages)
        // Keep landing=end until the readingPages effect sees a stable
        // list. Clearing it here lets a leftover {0,0} place snap to p1.
      }
    }
    const advanceSettle = (from: number, pages: ChapterHearingPage[]) => {
      unmeasuredTriesRef.current = 0
      const nextIdx = from + 1
      if (nextIdx >= pages.length) {
        finishSettle()
        return
      }
      settleIndexRef.current = nextIdx
      setSettleIndex(nextIdx)
    }
    const visiblePassage = [...wrap.querySelectorAll('.lab-passage')].find(el => !el.closest('.lab-page-measure')) as HTMLElement | undefined
    const peelHost = (pageIdx: number): 'peeled' | 'fits' | 'unmeasured' => {
      const host = measureHostRef.current ?? wrap.querySelector('.lab-page-measure') as HTMLElement | null
      if (!host && !visiblePassage) return 'unmeasured'
      const pages = workingPagesRef.current
      const live = pages[pageIdx]
      if (!live) return 'fits'
      let painted = host ? measurePaintedOverflow(host, chromeEl) : null
      const shown = readingPagesRef.current[Math.max(0, Math.min(readingPageIndexRef.current, readingPagesRef.current.length - 1))]
      const sameAsVisible = !!shown && shown.paragraphIndex === live.paragraphIndex && shown.from === live.from && shown.to === live.to
      if (visiblePassage && sameAsVisible) {
        const hasWordInk = [...visiblePassage.querySelectorAll('.lab-hearing-line > span')]
          .some(node => {
            const rect = node.getBoundingClientRect()
            return rect.height > 8 && rect.bottom > 40
          })
        if (!hasWordInk) {
          const line = visiblePassage.querySelector('.lab-hearing-line') as HTMLElement | null
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
        }
      }
      const vv = typeof window !== 'undefined' ? (window.visualViewport?.height ?? 0) : 0
      if (painted) {
        lastVvRef.current = vv
        lastBarTopRef.current = painted.chromeTop
      }
      if (!painted) return lastBarTopRef.current > 0 ? 'unmeasured' : 'fits'
      if (labPageFitsPaint(painted)) return 'fits'
      if (live.to <= live.from + 1) return 'fits'
      const overflowPx = Math.max(0, painted.lastBottom - painted.chromeTop)
      const nextTo = nextPaintShrinkTo(live.from, live.to, painted.lastLineWords, overflowPx, painted.lineHeight)
      if (nextTo >= live.to) return 'fits'
      const metrics = pageMetricsRef.current
      const budget = metrics ? labPageBudgetFromMetrics(metrics) : null
      const shrunk = reflowAfterCut(
        book.paragraphs,
        pages,
        pageIdx,
        nextTo,
        canUseLabPageBudget(budget) ? budget : null,
        { lastLineWords: painted.lastLineWords, overflowing: true },
      )
      workingPagesRef.current = shrunk
      setDraftPages(shrunk)
      if (sameAsVisible) {
        readingPagesRef.current = shrunk
        setReadingPages(shrunk)
      }
      return 'peeled'
    }
    const shrinkIfNeeded = () => {
      if (pagesStableRef.current) return
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
    viewport?.addEventListener('scroll', onJump)
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onJump)
      window.addEventListener('orientationchange', onJump)
    }
    return () => {
      cancelPaint()
      viewport?.removeEventListener('resize', onJump)
      viewport?.removeEventListener('scroll', onJump)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onJump)
        window.removeEventListener('orientationchange', onJump)
      }
    }
  }, [settleIndex, draftPages, phoneAskOpen, book.paragraphs, book.chapterTitle])

  useLayoutEffect(() => {
    const wrap = pageWrapRef.current
    if (!wrap) return
    const apply = () => {
      const metrics = measureLabPageMetrics(wrap, bottomChromeRef.current)
      if (!metrics) return
      if (metrics.headlineHeight > 0) headlineHeightRef.current = metrics.headlineHeight
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
    viewport?.addEventListener('scroll', apply)
    return () => {
      ro?.disconnect()
      viewport?.removeEventListener('resize', apply)
      viewport?.removeEventListener('scroll', apply)
    }
  }, [isPhone, showPhoneChrome, listen.playing, chrome, phoneAskOpen, readingPageIndex])

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
  const markedIndexes = useMemo(() => new Set(marks.map(mark => mark.paragraphIndex)), [marks])
  const isOnline = readOnline(online)
  const voiceOverlayOpen = showPhoneChrome && chrome === 'talking' && !phoneAskOpen
  const phoneAsk = showPhoneChrome && phoneAskOpen
  const showHearing = !peekBook && !phoneAsk && (
    chrome === 'hearing' || (chrome === 'talking' && returnTo === 'hearing')
  )
  const showSlimTransport = showPhoneChrome && !fullscreen && labShowSlimTransport({
    playing: listen.playing,
    phoneAsk,
  })
  const showPhoneBar = labShowPhoneBar({
    phoneChrome: showPhoneChrome,
    fullscreen,
    phoneAsk,
  })
  const canPrevChapter = prevLabChapter(book.chapters, book.chapterNumber) != null
  const canNextChapter = nextLabChapter(book.chapters, book.chapterNumber) != null
  const showReaderRail = labShowReaderRail({
    phoneAsk,
    phoneChrome: showPhoneChrome,
    pageCount: readingPages.length,
    playing: listen.playing,
    canPrevChapter,
    canNextChapter,
  }) || (!phoneAsk && showPhoneChrome && fullscreen)
  const rawChapterProgress = labChapterProgress({
    paragraphs: book.paragraphs,
    pages: readingPages,
    pageIndex: readingPageIndex,
    paragraphIndex: showHearing && listen.follow.kind === 'word' ? listen.follow.paragraphIndex : readingPage?.paragraphIndex,
    wordIndex: showHearing && listen.follow.kind === 'word' ? listen.follow.wordIndex : readingPage?.to,
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

  useEffect(() => {
    if (!showHearing) return
    const follow = listen.follow
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
  }, [listen.follow, readingPages, readingPageIndex, showHearing])

  const leaveTalking = useCallback(() => {
    resumeListenAfterAsk()
  }, [resumeListenAfterAsk])

  const goToPage = useCallback((index: number) => {
    const pages = readingPagesRef.current
    const page = pages[index]
    if (!page) return
    chapterLandingRef.current = null
    landingChapterRef.current = null
    openAtEndRef.current = false
    setOpenAtEnd(false)
    pageAnchorRef.current = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
    readingPageIndexRef.current = index
    setReadingPageIndex(index)
    placeRef.current = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
    notePlace('page-turn', { paragraphIndex: page.paragraphIndex, wordIndex: page.from })
    if (listen.src) listen.seekToPlace(page.paragraphIndex, page.from)
  }, [listen, notePlace])

  const goToChapter = useCallback(async (number: number, landing: 'start' | 'end') => {
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
      audio: prefs.audioEdition,
    })
    setBook(loaded)
    setOpenAtEnd(landing === 'end')
  }, [listen, notePlace, prefs.audioEdition, prefs.compareEdition, prefs.primaryEdition])

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

  const goToParagraph = useCallback((index: number) => {
    const last = Math.max(0, book.paragraphs.length - 1)
    const next = Math.max(0, Math.min(last, index))
    placeRef.current = { paragraphIndex: next, wordIndex: 0 }
    notePlace('page-turn', { paragraphIndex: next, wordIndex: 0 })
    setFocusParagraph(next)
    setReadingPageIndex(pageIndexForPlace(readingPages, next, 0))
    if (listen.src) listen.seekToPlace(next, 0)
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
    goToParagraph(resolved.paragraphIndex)
  }, [book.chapterNumber, book.chapters, book.paragraphs.length, goToChapter, goToParagraph])
  skipRef.current = applyPlaybackSkip

  const goNext = useCallback(() => {
    const pages = readingPagesRef.current
    const index = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, pages.length - 1)))
    const nextPage = adjacentPageIndex(pages.length, index, 1)
    if (nextPage != null) {
      goToPage(nextPage)
      return
    }
    const next = nextLabChapter(book.chapters, book.chapterNumber)
    if (next != null) {
      setFinishedChapters(markChapterFinished(book.chapterNumber))
      void goToChapter(next, 'start')
    }
  }, [book.chapterNumber, book.chapters, goToChapter, goToPage])

  const goPrev = useCallback(() => {
    const pages = readingPagesRef.current
    const index = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, pages.length - 1)))
    const prevPage = adjacentPageIndex(pages.length, index, -1)
    if (prevPage != null) {
      goToPage(prevPage)
      return
    }
    const prev = prevLabChapter(book.chapters, book.chapterNumber)
    if (prev != null) void goToChapter(prev, 'end')
  }, [book.chapterNumber, book.chapters, goToChapter, goToPage])

  const startHearing = useCallback((opts?: { force?: boolean }) => {
    if (chrome === 'talking' && !opts?.force) return
    if (chrome === 'hearing' && !opts?.force) {
      listen.pause()
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
  }, [ask, chrome, listen, phoneAskOpen, resumeListenAfterAsk, startHearing])

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
      className={`lab ${isPhone ? 'is-phone' : 'is-desktop'}${showPhoneChrome ? ' has-phone-chrome' : ''}${ask.notice ? ' has-notice' : ''}${phoneAskOpen ? ' has-phone-ask' : ''}${prefs.darkMode ? ' is-night' : ''}${fullscreen ? ' is-fullscreen' : ''}`}
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
      style={{
        ['--lab-font-reader' as string]: labFontFamilyCss(prefs.fontFamily),
        ['--lab-font-size' as string]: String(prefs.fontSize),
      }}
    >
      <header className="lab-header">
        <div className="lab-header-brand">
          <h1 className="lab-logo" data-testid="lab-wordmark">{LAB_COPY.wordmark}</h1>
          <span className="lab-title-sep" aria-hidden="true"> · </span>
          <span className="lab-header-work" data-testid="lab-header-work">{book.bookTitle}</span>
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
            className={`lab-gear ${gearOpen ? 'is-open' : ''}`}
            onClick={() => { setTocOpen(false); setGearOpen(open => !open); setSettingsSection('reading') }}
            aria-label={LAB_COPY.settings}
            aria-expanded={gearOpen}
            aria-haspopup="dialog"
            data-testid="lab-gear"
          >
            <GearIcon />
          </button>
          <button
            type="button"
            className={`lab-fullscreen ${fullscreen ? 'is-on' : ''}`}
            onClick={() => setFullscreen(on => !on)}
            aria-label={fullscreen ? LAB_COPY.exitFullScreen : LAB_COPY.fullScreen}
            data-testid="lab-fullscreen"
          >
            <FullscreenIcon on={fullscreen} />
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
            if (start == null) return
            const endY = event.changedTouches[0]?.clientY ?? start
            if (labPullOpensToc(endY - start)) setTocOpen(true)
          }}
        >
          <LabPassage
            chapterTitle={book.chapterTitle}
            paragraphs={book.paragraphs}
            compareParagraphs={book.compareParagraphs}
            compare={prefs.compareOpen}
            mode={showHearing ? 'hearing' : 'reading'}
            follow={showHearing && listen.playing ? listen.follow : { kind: 'none' }}
            followParagraphs={listen.followParagraphs}
            clips={listen.clips}
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
            hideTransport={showPhoneChrome}
            markedIndexes={markedIndexes}
            onMark={handleMark}
            focusParagraph={focusParagraph}
            dimmed={voiceOverlayOpen}
            peek={chrome === 'hearing' && peekBook}
            readingPage={readingPage}
            chapterPages={readingPages}
          />
          {settleIndex != null && draftPages[settleIndex] && (
            <div
              className="lab-page-measure"
              ref={measureHostRef}
              aria-hidden="true"
              key={`${settleIndex}-${draftPages[settleIndex].from}-${draftPages[settleIndex].to}`}
            >
              <LabPageMeasurePaint
                chapterTitle={book.chapterTitle}
                paragraphs={book.paragraphs}
                page={draftPages[settleIndex]}
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
        <nav className="lab-page-turn" data-testid="lab-page-turn" aria-label="Page">
          {readingPageIndex > 0 || canPrevChapter ? (
            <button
              type="button"
              className="lab-page-turn-btn"
              data-testid="lab-page-prev"
              aria-label={LAB_COPY.previous}
              onClick={goPrev}
            >
              {showPhoneChrome ? '←' : LAB_COPY.previous}
            </button>
          ) : (
            <span className="lab-page-turn-spacer" />
          )}
          <div
            className="lab-chapter-progress"
            data-testid="lab-chapter-progress"
            title={footProgress}
          >
            <span className="lab-chapter-progress-info">{footProgress}</span>
          </div>
          {readingPageIndex < readingPages.length - 1 || canNextChapter ? (
            <button
              type="button"
              className="lab-page-turn-btn"
              data-testid="lab-page-next"
              aria-label={LAB_COPY.next}
              onClick={goNext}
            >
              {showPhoneChrome ? '→' : LAB_COPY.next}
            </button>
          ) : (
            <span className="lab-page-turn-spacer" />
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
          {showSlimTransport && (
            <div className="lab-phone-transport" data-testid="lab-phone-transport">
              <button
                type="button"
                className="lab-phone-icon"
                onClick={() => listen.seek(-15)}
                aria-label={LAB_COPY.back15}
                data-testid="lab-hearing-back"
              >
                <SeekIcon />
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
              <button
                type="button"
                className="lab-phone-icon lab-phone-speed"
                onClick={listen.cycleSpeed}
                aria-label={`${listen.speed}×`}
                data-testid="lab-hearing-speed"
              >
                {listen.speed}×
              </button>
            </div>
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
              void goToChapter(number, 'start')
            }}
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
