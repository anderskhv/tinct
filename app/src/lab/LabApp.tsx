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
  labShowPhoneBar,
  labShowReaderRail,
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
  labPaginationPaintRoot,
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
  bibleEditions,
  labFontFamilyCss,
  labFootProgress,
  labReaderProgressLabel,
  editionLabelFor,
  readLabPrefs,
  writeLabPrefs,
  syncLabAudioEdition,
  effectiveLabAudioEdition,
  type LabPrefs,
  type LabAppearanceProfile,
  type LabReaderProgressMode,
} from './labPrefs'
import { labLayoutOverride, labVoiceVersion } from './labRoute'
import { LabAskPane } from './LabAskPane'
import { LabConversationOverlay, LabVoiceGate } from './LabConversation'
import { LabNativePaginator, shrinkNativePageAfterPaint } from './LabNativePaginator'
import { LabChapterCover } from './LabChapterCover'
import { LabVoiceActionPanel } from './LabVoiceActionPanel'
import { LabPageMeasurePaint, LabPassage } from './LabPassage'
import { LabInTheBook } from './LabInTheBook'
import { bibleBookOpeningTitle, bibleFallbackSource, loadLabBookSource, nextLabChapter, prevLabChapter, prefetchLabChapterTexts, type LabMark, type LabSource } from './labSource'
import { bootLabReading, useLabPositionSync } from './useLabPositionSync'
import { consumeLabReaderHandoffForPage, pendingLabSourceForHandoff, prefsFromLabReaderHandoff, prefsFromLabResumePlace, releaseLabReaderHandoffForPage } from './labReaderHandoff'
import type { LabReaderStateSnapshot } from './labPosition'
import { isResumeListenCommand, resolveLabPlaybackSkip, type LabPlaybackSkip } from './labAsk'
import { adjacentPageIndex, applyPaintShrink, canUseLabPageBudget, chapterHearingPages, chapterPageSegments, chapterPageTail, clampedChapterProgress, cutPageTailTo, ensurePageIdentity, followOnReadingPage, growPageByFirstOmittedWord, growPageByWords, growPaintedPageIfSlack, labChapterProgress, labNavPageList, labPageBudgetFromMetrics, leftoverWordCount, pageAnchorOf, pageIndexForPlace, reflowAfterCut, restorePageIndexForAnchor, sameChapterPages, sentenceStartWordIndex, snapShrinkEndToSentence, tokenizeHearingWords, type ChapterHearingPage } from './labHearing'
import { SelectionPopup, type PopupMode, type SelectionInfo } from '../components/reader/SelectionPopup'
import { useDefine } from '../components/reader/useDefine'
import { defaultPopupMode } from '../components/reader/selectionPopupMode'
import type { HighlightColor } from '../types'
import { type LabHighlight, type LabHighlightRange } from './labHighlights'
import { useLabHighlights } from './useLabHighlights'
import { readLabTalkHistory } from './labTalkHistory'
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
import { getBook } from '../data/bookRegistry'
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
  // Compare is two synchronized paints of one page map. Only the primary
  // column may author that map; including both columns here can make the
  // compare tail repeatedly peel valid primary text after a resize.
  const paintRoot = labPaginationPaintRoot(passage)
  let painted = measurePaintedOverflow(paintRoot, chromeEl)
  const onScreenTop = measureLabOnScreenBarTop(wrap.ownerDocument, chromeEl)
  if (onScreenTop <= 0) return painted
  const inkBottom = [...paintRoot.querySelectorAll('.lab-hearing-line > span, .lab-hearing-word')]
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.6 6.4v11.2L17.8 12 8.6 6.4Z" fill="currentColor" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
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

function SkipIcon({ direction, seconds = 15 }: { direction: 'back' | 'forward'; seconds?: number }) {
  const path = direction === 'back'
    ? 'M8.25 7.15H4.7v-3.5M4.9 7.05A8 8 0 1 1 4.15 15'
    : 'M15.75 7.15h3.55v-3.5M19.1 7.05A8 8 0 1 0 19.85 15'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
      <text x="12" y="14.15" textAnchor="middle" fill="currentColor" stroke="none" fontSize="6.5" fontFamily="IBM Plex Mono, monospace">{seconds}</text>
    </svg>
  )
}

function ReadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 5.5c2.7-.8 5.2-.2 8.5 1.8v11c-3.3-2-5.8-2.6-8.5-1.8v-11Zm17 0c-2.7-.8-5.2-.2-8.5 1.8v11c3.3-2 5.8-2.6 8.5-1.8v-11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
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

function TuneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h7M15 7h5M4 17h5M13 17h7" />
      <circle cx="13" cy="7" r="2" />
      <circle cx="11" cy="17" r="2" />
    </svg>
  )
}

function FullscreenIcon({ on }: { on?: boolean }) {
  return (
    <svg data-icon={on ? 'close' : 'fullscreen'} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {on ? (
        <>
          <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" />
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.75" y="4.25" width="8" height="15.5" rx="1.65" />
      <rect x="13.25" y="4.25" width="8" height="15.5" rx="1.65" />
      <path d="M5.25 8h3M5.25 11h3M15.75 8h3M15.75 11h3" />
    </svg>
  )
}

export interface LabAppProps {
  pathname?: string
  /** Query string. Only `?voice=v2` on `/lab/reader` selects the Voice V2 preview. */
  search?: string
  online?: boolean
  source?: LabSource
  authToken?: string | null
}

function readOnline(override?: boolean): boolean {
  if (typeof override === 'boolean') return override
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export function LabApp({ pathname, search, online, source, authToken }: LabAppProps) {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/lab')
  const layoutOverride = labLayoutOverride(path)
  const voiceVersion = labVoiceVersion(path, search ?? (typeof window !== 'undefined' ? window.location.search : ''))
  const [isPhone, setIsPhone] = useState(() => readPhoneSurface(layoutOverride))
  const [showPhoneChrome, setShowPhoneChrome] = useState(() => {
    const phone = readPhoneSurface(layoutOverride)
    return readPhoneFooter(layoutOverride, phone)
  })
  const appearanceProfile: LabAppearanceProfile = showPhoneChrome ? 'phone' : 'desktop'
  const [readerHandoff] = useState(() => source ? null : consumeLabReaderHandoffForPage())
  const boot = bootLabReading(source)
  const [book, setBook] = useState<LabSource>(() => readerHandoff ? pendingLabSourceForHandoff(readerHandoff) : boot.book)
  const [readerLoadError, setReaderLoadError] = useState('')
  const [prefs, setPrefs] = useState<LabPrefs>(() => {
    const stored = syncLabAudioEdition(readLabPrefs(appearanceProfile))
    const restored = readerHandoff
      ? prefsFromLabReaderHandoff(stored, readerHandoff)
      : prefsFromLabResumePlace(stored, boot.resume)
    return syncLabAudioEdition(restored, book.editions?.length ? book.editions : bibleEditions())
  })
  const bookEditions = book.editions?.length ? book.editions : bibleEditions()
  const [systemDark, setSystemDark] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
  const resolvedDarkMode = prefs.theme === 'dark' || (prefs.theme === 'system' && systemDark)
  const resolvedTheme = prefs.theme === 'system' ? (systemDark ? 'dark' : 'light') : prefs.theme
  const resumeInCompare = !readerHandoff && boot.resume?.readerMode === 'compare'
  const [mobileCompareActive, setMobileCompareActive] = useState(resumeInCompare)
  const [desktopCompareActive, setDesktopCompareActive] = useState(resumeInCompare)
  const [speedPopoverOpen, setSpeedPopoverOpen] = useState(false)
  const audioEditionKey = effectiveLabAudioEdition(prefs, bookEditions)
  const updatePrefs = useCallback((next: LabPrefs) => {
    const synced = syncLabAudioEdition(next, bookEditions)
    setPrefs(synced)
    writeLabPrefs(synced, appearanceProfile)
  }, [appearanceProfile, bookEditions])
  const prefsProfileRef = useRef(appearanceProfile)
  useLayoutEffect(() => {
    if (prefsProfileRef.current === appearanceProfile) return
    prefsProfileRef.current = appearanceProfile
    setPrefs(syncLabAudioEdition(readLabPrefs(appearanceProfile), bookEditions))
  }, [appearanceProfile, bookEditions])
  useEffect(() => {
    releaseLabReaderHandoffForPage(readerHandoff)
    if (readerHandoff) writeLabPrefs(prefs, appearanceProfile)
    // This effect only releases the StrictMode bridge after the committed mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [tocOpen, setTocOpen] = useState(false)
  const [finishedChapters, setFinishedChapters] = useState(() => readFinishedChapters())
  const [fullscreen, setFullscreen] = useState(false)
  const [readerControlsVisible, setReaderControlsVisible] = useState(true)
  const [pageTurn, setPageTurn] = useState<{
    direction: 'next' | 'previous'
    nonce: number
  } | null>(null)
  useEffect(() => {
    if (!pageTurn) return
    const nonce = pageTurn.nonce
    const timer = window.setTimeout(() => {
      setPageTurn(current => current?.nonce === nonce ? null : current)
    }, 220)
    return () => window.clearTimeout(timer)
  }, [pageTurn])
  const [readerProgressMode, setReaderProgressMode] = useState<LabReaderProgressMode>('book')
  const [settingsSection, setSettingsSection] = useState<'reading' | 'layout'>('reading')
  const [voiceLabView, setVoiceLabView] = useState<VoiceTinctView>('read')
  const [voiceHistoryFixture, setVoiceHistoryFixture] = useState(true)
  const [voiceActions, setVoiceActions] = useState<LabVoiceActionEntry[]>([])
  const [inTheBookOpen, setInTheBookOpen] = useState(false)
  const [peekBook, setPeekBook] = useState(false)
  const [phoneAskOpen, setPhoneAskOpen] = useState(false)
  const [phoneKeyboardOpen, setPhoneKeyboardOpen] = useState(false)
  const askInputRef = useRef<HTMLInputElement | null>(null)
  const [gearOpen, setGearOpen] = useState(false)
  const [desktopAskOpen, setDesktopAskOpen] = useState(false)
  const [marks, setMarks] = useState<LabMark[]>([])
  const [focusParagraph, setFocusParagraph] = useState<number | null>(null)
  const [chrome, setChrome] = useState<LabChromeState>('reading')
  const mobileCompareEnabled = showPhoneChrome && prefs.compareOpen && book.compareParagraphs.length > 0
  const desktopCompareEnabled = !showPhoneChrome && prefs.compareOpen && book.compareParagraphs.length > 0
  const readerParagraphs = mobileCompareActive && mobileCompareEnabled
    ? book.compareParagraphs
    : book.paragraphs
  const readerEditionKey = mobileCompareActive && mobileCompareEnabled
    ? prefs.compareEdition
    : prefs.primaryEdition
  const primaryEditionLabel = editionLabelFor(prefs.primaryEdition, bookEditions)
  const compareEditionLabel = editionLabelFor(prefs.compareEdition, bookEditions)
  const nativePhonePaging = showPhoneChrome && browserHasNativePaging()
  const [returnTo, setReturnTo] = useState<LabReturnTo>('reading')
  const [draft, setDraft] = useState('')
  const [voiceGate, setVoiceGate] = useState<LabVoiceGatePhase>('off')
  const [readingPageIndex, setReadingPageIndex] = useState(
    readerHandoff?.savedPlace?.page ?? boot.resume?.pageIndex ?? 0,
  )
  const [nativePagesRevision, setNativePagesRevision] = useState(0)
  const readerStateRef = useRef<LabReaderStateSnapshot>({
    pageIndex: readingPageIndex,
    primaryEditionKey: prefs.primaryEdition,
    compareEditionKey: prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition ? prefs.compareEdition : undefined,
    readerMode: resumeInCompare ? 'compare' : 'read',
  })
  readerStateRef.current = {
    pageIndex: readingPageIndex,
    primaryEditionKey: prefs.primaryEdition,
    compareEditionKey: prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition ? prefs.compareEdition : undefined,
    readerMode: (showPhoneChrome ? mobileCompareActive : desktopCompareActive) ? 'compare' : 'read',
  }
  const countedPageRef = useRef<string | null>(null)
  const initialFrontispieceRef = useRef(Boolean(readerHandoff && !readerHandoff.savedPlace))
  const [chapterCoverTitle, setChapterCoverTitle] = useState<string | null>(() => (
    readerHandoff && !readerHandoff.savedPlace ? book.bookTitle : null
  ))
  const pendingMapHighlightRef = useRef<LabHighlight | null>(null)
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
  const mobilePrimaryPagesRef = useRef<ChapterHearingPage[] | null>(null)
  const mobileCompareReturnPlaceRef = useRef<{ paragraphIndex: number; wordIndex: number } | null>(null)
  // A later page or chapter action owns the reader. This prevents an older
  // async chapter response from replacing the tuple after the user turned back.
  const chapterNavigationRef = useRef(0)

  useEffect(() => {
    const identity = `${book.chapterNumber}:${readingPageIndex}:${chapterCoverTitle ? 'cover' : 'text'}`
    if (countedPageRef.current == null) { countedPageRef.current = identity; return }
    if (countedPageRef.current === identity) return
    countedPageRef.current = identity
    try {
      const current = Math.max(0, Number(localStorage.getItem('tinct-lab-page-turns') || 0))
      localStorage.setItem('tinct-lab-page-turns', String(current + 1))
    } catch { /* private mode */ }
  }, [book.chapterNumber, chapterCoverTitle, readingPageIndex])

  useEffect(() => {
    let last = Date.now()
    const timer = window.setInterval(() => {
      const now = Date.now()
      if (document.visibilityState === 'visible' && !gearOpen && !tocOpen) {
        try {
          const elapsed = Math.min(60, Math.max(0, Math.round((now - last) / 1000)))
          const current = Math.max(0, Number(localStorage.getItem('tinct-lab-reading-seconds') || 0))
          localStorage.setItem('tinct-lab-reading-seconds', String(current + elapsed))
        } catch { /* private mode */ }
      }
      last = now
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [gearOpen, tocOpen])

  useEffect(() => {
    if (!mobileCompareEnabled && book.paragraphs.length > 0) setMobileCompareActive(false)
  }, [book.paragraphs.length, mobileCompareEnabled])

  useEffect(() => {
    if (!desktopCompareEnabled && book.paragraphs.length > 0) setDesktopCompareActive(false)
  }, [book.paragraphs.length, desktopCompareEnabled])

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
  const handoffPlace = readerHandoff
    ? { paragraphIndex: readerHandoff.savedPlace?.paragraphIndex ?? 0, wordIndex: 0 }
    : null
  const initialPlace = handoffPlace ?? boot.place
  const placeRef = useRef(initialPlace)
  const restorePlaceRef = useRef<{ paragraphIndex: number; wordIndex: number } | null>(
    handoffPlace
      ? (handoffPlace.paragraphIndex || handoffPlace.wordIndex ? handoffPlace : null)
      : (boot.place.paragraphIndex || boot.place.wordIndex ? boot.place : null),
  )
  const restorePageRef = useRef<number | null>(
    readerHandoff
      ? (readerHandoff.savedPlace?.paragraphIndex === undefined ? (readerHandoff.savedPlace?.page ?? null) : null)
      : (boot.resume && (boot.resume.paragraphIndex || boot.resume.wordIndex)
          ? null
          : (boot.resume?.pageIndex ?? null)),
  )
  const handoffActivatedRef = useRef(false)
  const headlineHeightRef = useRef(0)
  const chapterTitleRef = useRef(book.chapterTitle)
  const chapterNumberRef = useRef(book.chapterNumber)
  chapterNumberRef.current = book.chapterNumber
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
    getTheme: () => resolvedDarkMode ? 'dark' : 'light',
    setTheme: theme => updatePrefs({ ...prefs, theme, darkMode: theme === 'dark' }),
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
    bookId: book.bookId || 'bible',
    chapterNumber: book.chapterNumber,
    paragraphs: book.paragraphs,
    followParagraphs: book.followParagraphs,
    audioTitle: book.audioTitle,
  }))
  const [browseWhileListening, setBrowseWhileListening] = useState(false)
  const [audioChapterTransitioning, setAudioChapterTransitioning] = useState(false)
  const audioChapterCompleteRef = useRef<() => boolean>(() => false)
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
    voiceVersion,
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
    bookId: listenSource.bookId,
    paragraphs: listenSource.paragraphs,
    followParagraphs: listenSource.followParagraphs,
    chapterNumber: listenSource.chapterNumber,
    audioEdition: audioEditionKey,
    playbackSpeed: prefs.audioSpeed,
    onPlaybackSpeedChange: (audioSpeed) => updatePrefs({ ...prefs, audioSpeed }),
    titleClip: listenSource.audioTitle,
    onChapterComplete: () => audioChapterCompleteRef.current(),
  })
  listenSpeedRef.current = listen.speed
  listenPlayingRef.current = listen.playing

  useEffect(() => {
    if (listen.playing || browseWhileListening) return
    setListenSource({
      bookId: book.bookId || 'bible',
      chapterNumber: book.chapterNumber,
      paragraphs: book.paragraphs,
      followParagraphs: book.followParagraphs,
      audioTitle: book.audioTitle,
    })
  }, [book.bookId, book.chapterNumber, book.paragraphs, book.followParagraphs, book.audioTitle, listen.playing, browseWhileListening])

  const positionWritesSuspended = Boolean(
    readerHandoff
    && ((book.bookId || 'bible') !== readerHandoff.bookId || book.paragraphs.length === 0),
  )
  const { notePlace, biblicalBook } = useLabPositionSync({
    book,
    placeRef,
    readerStateRef,
    sourceLocked: Boolean(source || readerHandoff),
    writesSuspended: positionWritesSuspended,
    authToken,
    onRemoteResume: (place) => {
      setChapterCoverTitle(null)
      restorePlaceRef.current = { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
      placeRef.current = { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
      const resumeBookId = (book.bookId || 'bible') === 'bible' ? 'bible' : place.bookId
      const compareEditionKey = prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition
        ? prefs.compareEdition
        : undefined
      void loadLabBookSource({
        bookId: resumeBookId,
        chapterNumber: place.sequentialChapter,
        primaryEditionKey: prefs.primaryEdition,
        compareEditionKey,
        audioEditionKey,
      }).then(setBook).catch(() => {})
    },
  })

  const editionTupleRef = useRef(`${prefs.primaryEdition}\u0000${prefs.compareEdition}\u0000${prefs.compareOpen}`)
  useEffect(() => {
    const next = `${prefs.primaryEdition}\u0000${prefs.compareEdition}\u0000${prefs.compareOpen}`
    if (next === editionTupleRef.current) return
    editionTupleRef.current = next
    readerStateRef.current = {
      ...readerStateRef.current,
      primaryEditionKey: prefs.primaryEdition,
      compareEditionKey: prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition
        ? prefs.compareEdition
        : undefined,
    }
    notePlace('mode-change')
  }, [notePlace, prefs.compareEdition, prefs.compareOpen, prefs.primaryEdition])

  useLayoutEffect(() => {
    if (!readerHandoff || positionWritesSuspended || handoffActivatedRef.current) return
    handoffActivatedRef.current = true
    notePlace('open-book', {
      sequentialChapter: book.chapterNumber,
      paragraphIndex: placeRef.current.paragraphIndex,
      wordIndex: placeRef.current.wordIndex,
    })
  }, [book.chapterNumber, notePlace, positionWritesSuspended, readerHandoff])

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
    if (typeof matchMedia !== 'function') return
    const media = matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(media.matches)
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  useLayoutEffect(() => {
    const root = document.documentElement
    const prev = root.getAttribute('data-theme')
    const prevColorScheme = root.style.colorScheme
    const existingThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const themeColor = existingThemeColor ?? document.createElement('meta')
    const previousThemeColor = themeColor.getAttribute('content')
    if (!existingThemeColor) {
      themeColor.name = 'theme-color'
      document.head.appendChild(themeColor)
    }
    root.setAttribute('data-theme', resolvedTheme)
    root.style.colorScheme = resolvedDarkMode ? 'dark' : 'light'
    themeColor.content = resolvedTheme === 'dark' ? '#2e2a24' : resolvedTheme === 'book' ? '#e7dcc7' : '#f2eee4'
    return () => {
      root.setAttribute('data-theme', prev ?? 'light')
      root.style.colorScheme = prevColorScheme
      if (!existingThemeColor) themeColor.remove()
      else if (previousThemeColor == null) themeColor.removeAttribute('content')
      else themeColor.content = previousThemeColor
    }
  }, [resolvedDarkMode, resolvedTheme])

  useEffect(() => {
    if (source) {
      chapterNavigationRef.current += 1
      setChapterCoverTitle(null)
      setBook(source)
      return
    }
    let cancelled = false
    const navigation = ++chapterNavigationRef.current
    const wanted = chapterNumberRef.current
    const activeBookId = book.bookId || 'bible'
    const primaryEditionKey = bookEditions.some(edition => edition.key === prefs.primaryEdition)
      ? prefs.primaryEdition
      : (bookEditions.find(edition => edition.style === 'original' && edition.language === 'en') || bookEditions[0])?.key
    if (!primaryEditionKey) {
      setReaderLoadError('This book does not currently have a readable edition.')
      return
    }
    const compareEditionKey = prefs.compareOpen
      && prefs.compareEdition !== primaryEditionKey
      && bookEditions.some(edition => edition.key === prefs.compareEdition)
      ? prefs.compareEdition
      : undefined
    loadLabBookSource({
      bookId: activeBookId,
      chapterNumber: wanted,
      primaryEditionKey,
      compareEditionKey,
      audioEditionKey: bookEditions.some(edition => edition.key === audioEditionKey && edition.hasAudio) ? audioEditionKey : undefined,
    }).then((loaded) => {
      if (cancelled || navigation !== chapterNavigationRef.current) return
      // Bible's legacy loader has a Genesis fallback for network failures;
      // never let that replace a requested Bible chapter. Generic books may
      // safely normalize an invalid saved chapter to their own first chapter.
      if (activeBookId === 'bible' && loaded.chapterNumber !== wanted && wanted !== 1) return
      if (restorePlaceRef.current) {
        const paragraphIndex = restorePlaceRef.current.paragraphIndex
        if (paragraphIndex >= loaded.paragraphs.length) {
          restorePlaceRef.current = { paragraphIndex: 0, wordIndex: 0 }
          placeRef.current = restorePlaceRef.current
        }
      }
      setReaderLoadError('')
      setChapterCoverTitle(current => initialFrontispieceRef.current ? loaded.bookTitle : current)
      initialFrontispieceRef.current = false
      setBook(loaded)
    }).catch((error) => {
      if (!cancelled && navigation === chapterNavigationRef.current) {
        console.warn('[labReader] Failed to load selected edition', error)
        setReaderLoadError('This edition is temporarily unavailable. Choose another edition from settings or return to the library.')
      }
    })
    return () => { cancelled = true }
  }, [source, book.bookId, bookEditions, prefs.primaryEdition, prefs.compareEdition, prefs.compareOpen, audioEditionKey])

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
    const settledPrimaryPages = contentChanged && !mobileCompareActive
      ? mobilePrimaryPagesRef.current
      : null
    const next = settledPrimaryPages
      ?? chapterHearingPages(readerParagraphs, canUseLabPageBudget(budget) ? budget : null)
    if (settledPrimaryPages) {
      mobilePrimaryPagesRef.current = null
      pagesStableRef.current = true
      didBudgetPageRef.current = true
      setSettleIndex(null)
      settleIndexRef.current = null
    }
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
      } else if (!nativePhonePaging && restorePageRef.current != null) {
        const idx = Math.max(0, Math.min(restorePageRef.current, next.length - 1))
        restorePageRef.current = null
        const anchor = pageAnchorOf(next[idx])
        if (anchor) {
          pageAnchorRef.current = anchor
          placeRef.current = anchor
        }
        readingPageIndexRef.current = idx
        setReadingPageIndex(idx)
      } else if (landing !== 'end') {
        pageAnchorRef.current = pageAnchorOf(next[0])
        placeRef.current = { paragraphIndex: 0, wordIndex: 0 }
        readingPageIndexRef.current = 0
        setReadingPageIndex(0)
      }
    }
  }, [book.chapterTitle, mobileCompareActive, readerParagraphs, nativePhonePaging])

  useEffect(() => {
    mobilePrimaryPagesRef.current = null
  }, [book.bookId, book.chapterNumber, prefs.fontFamily, prefs.fontSize, prefs.alignment, prefs.lineSpacing, prefs.margins, prefs.paragraphSpacing])

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
  }, [prefs.fontFamily, prefs.fontSize, prefs.alignment, prefs.lineSpacing, prefs.margins, prefs.paragraphSpacing, nativePhonePaging])

  const lastVvRef = useRef(0)
  const lastBarTopRef = useRef(0)
  const lastAdjustRef = useRef<LabPageAdjust>(null)
  const beforeGrowPagesRef = useRef<ChapterHearingPage[] | null>(null)
  const nativePaintPageRef = useRef<string | null>(null)
  const nativePaintSettledRef = useRef<string | null>(null)
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
    const keep = mobileCompareReturnPlaceRef.current ?? pageAnchorRef.current ?? pageAnchorOf(current[currentIndex])
    const landing = chapterLandingRef.current

    pagesStableRef.current = true
    didBudgetPageRef.current = true
    unmeasuredTriesRef.current = 0
    lastAdjustRef.current = null
    beforeGrowPagesRef.current = null
    nativePaintPageRef.current = null
    nativePaintSettledRef.current = null
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
    if (restorePageRef.current != null) {
      nextIndex = Math.max(0, Math.min(restorePageRef.current, next.length - 1))
      restorePageRef.current = null
      const restored = pageAnchorOf(next[nextIndex])
      if (restored) {
        pageAnchorRef.current = restored
        placeRef.current = restored
      }
    }
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
    // The native map can equal the provisional map. Still schedule the
    // rendered-page verification now that the font-settled preflight is the
    // authority; refs alone do not trigger that verification effect.
    setNativePagesRevision(revision => revision + 1)
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
      audioTitle: book.audioTitle,
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
    await listen.startAtPlace(place)
  }, [book, listen, listenSource.chapterNumber, notePlace])

  useLayoutEffect(() => {
    lastVvRef.current = 0
    lastBarTopRef.current = 0
    lastAdjustRef.current = null
    beforeGrowPagesRef.current = null
    mobileCompareReturnPlaceRef.current = null
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
        const paintRoot = labPaginationPaintRoot(passage)
        painted = measurePaintedOverflow(paintRoot, chromeEl) ?? painted
        const hasWordInk = [...paintRoot.querySelectorAll('.lab-hearing-line > span, .lab-hearing-word')]
          .some(node => {
            const rect = node.getBoundingClientRect()
            return rect.height > 8 && rect.bottom > 40
          })
        if (!hasWordInk) {
          const line = paintRoot.querySelector('.lab-hearing-line') as HTMLElement | null
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
            const inkBottom = [...paintRoot.querySelectorAll('.lab-hearing-line > span, .lab-hearing-word')]
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
        if (
          !listenPlayingRef.current
          && !browseWhileListeningRef.current
          && lastAdjustRef.current !== 'bounded'
        ) {
          const estimated = growPaintedPageIfSlack(pages, pageIdx, painted, lastAdjustRef.current, readerParagraphs)
          const grown = sameChapterPages(estimated, pages)
            ? growPageByFirstOmittedWord(pages, pageIdx, readerParagraphs)
            : estimated
          if (!sameChapterPages(grown, pages)) {
            beforeGrowPagesRef.current = pages
            lastAdjustRef.current = 'grow'
            return applyPageList(grown, sameAsVisible)
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
        lastAdjustRef.current = 'bounded'
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
      lastAdjustRef.current = 'peel'
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
  }, [isPhone, showPhoneChrome, listen.playing, chrome, phoneAskOpen, readerControlsVisible, gearOpen, prefs.fontFamily, prefs.fontSize, prefs.alignment, prefs.lineSpacing, prefs.margins, prefs.paragraphSpacing, fullscreen, nativePhonePaging])

  useLayoutEffect(() => {
    if (
      (nativePhonePaging ? nativePagesRevision === 0 : !pagesStableRef.current)
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
    if (!painted) return

    // Hidden preflight catches most pages. This visible-page check is the final
    // invariant for font/browser rounding differences on a page turn.
    const pageIdx = Math.max(0, Math.min(readingPageIndexRef.current, readingPagesRef.current.length - 1))
    if (nativePhonePaging) {
      const pages = readingPagesRef.current
      const page = pages[pageIdx]
      const head = pageAnchorOf(page)
      const paintPage = `${book.chapterNumber}:${pageIdx}:${head?.paragraphIndex ?? -1}:${head?.wordIndex ?? -1}`
      if (nativePaintPageRef.current !== paintPage) {
        nativePaintPageRef.current = paintPage
        lastAdjustRef.current = null
        beforeGrowPagesRef.current = null
      }

      if (labPageFitsPaint(painted)) {
        if (nativePaintSettledRef.current === paintPage) return
        const estimated = growPaintedPageIfSlack(
          pages,
          pageIdx,
          painted,
          lastAdjustRef.current,
          readerParagraphs,
        )
        const next = lastAdjustRef.current === 'bounded'
          ? pages
          : sameChapterPages(estimated, pages)
            ? growPageByFirstOmittedWord(pages, pageIdx, readerParagraphs)
            : estimated
        if (sameChapterPages(next, pages)) return
        beforeGrowPagesRef.current = pages
        lastAdjustRef.current = 'grow'
        workingPagesRef.current = next
        readingPagesRef.current = next
        setDraftPages(next)
        setReadingPages(next)
        return
      }

      // The column preflight and the visible word paint do not always wrap a
      // hyphenated word identically. If a visible growth trial overflows,
      // restore the last page map that actually fit and stop at that bound.
      if (lastAdjustRef.current === 'grow' && beforeGrowPagesRef.current) {
        const fitted = beforeGrowPagesRef.current
        const trialWords = Math.max(
          1,
          leftoverWordCount(page) - leftoverWordCount(fitted[pageIdx]),
        )
        if (trialWords > 1) {
          const refined = growPageByWords(fitted, pageIdx, Math.max(1, Math.floor(trialWords / 2)))
          if (!sameChapterPages(refined, fitted)) {
            beforeGrowPagesRef.current = fitted
            lastAdjustRef.current = 'grow'
            workingPagesRef.current = refined
            readingPagesRef.current = refined
            setDraftPages(refined)
            setReadingPages(refined)
            return
          }
        }
        beforeGrowPagesRef.current = null
        lastAdjustRef.current = 'bounded'
        nativePaintSettledRef.current = paintPage
        workingPagesRef.current = fitted
        readingPagesRef.current = fitted
        setDraftPages(fitted)
        setReadingPages(fitted)
        return
      }

      const next = shrinkNativePageAfterPaint(readerParagraphs, pages, pageIdx, painted)
      if (sameChapterPages(next, pages)) return
      lastAdjustRef.current = 'peel'
      workingPagesRef.current = next
      readingPagesRef.current = next
      setDraftPages(next)
      setReadingPages(next)
      return
    }
    if (labPageFitsPaint(painted)) return
    pagesStableRef.current = false
    unmeasuredTriesRef.current = 0
    workingPagesRef.current = readingPagesRef.current
    setDraftPages(readingPagesRef.current)
    settleIndexRef.current = pageIdx
    setSettleIndex(pageIdx)
  }, [readingPageIndex, readingPages, nativePagesRevision, phoneAskOpen, listen.playing, browseWhileListening, nativePhonePaging, readerControlsVisible, gearOpen, chrome, readerParagraphs, book.chapterNumber])

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
      const keep = mobileCompareReturnPlaceRef.current ?? pageAnchorRef.current
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
        // A Compare edition switch first produces an estimated map and then
        // the font-painted map. Keep the semantic transition anchor until the
        // latter is stable, otherwise the provisional page can snap Read back
        // to an earlier page even while the persisted place stays unchanged.
        if (anchor && pagesStableRef.current && !mobileCompareReturnPlaceRef.current) pageAnchorRef.current = anchor
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
    const hearingNow = listen.playing
    // Opening a companion pauses audio once. Follow-up actions inside that
    // companion must not overwrite the original return mode after the audio
    // element is already paused.
    if (!hearingNow && pausedForAskRef.current) return
    const returnMode: LabReturnTo = hearingNow ? 'hearing' : 'reading'
    pausedForAskRef.current = hearingNow
    setReturnTo(returnMode)
    returnToRef.current = returnMode
    if (hearingNow) listen.pause()
  }, [listen])

  const resumeListenAfterAsk = useCallback((forceHearing = false) => {
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
    // Closing Talk returns to the mode it interrupted. The explicit voice
    // command "resume the audiobook" is different: it must begin audio even
    // when Talk was opened from ordinary reading.
    const shouldHear = forceHearing || pausedForAskRef.current || returnToRef.current === 'hearing'
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
  resumeListenRef.current = () => resumeListenAfterAsk(true)
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
  const frontispieceVisible = chapterCoverTitle != null
  const voiceOverlayOpen = showPhoneChrome && chrome === 'talking' && !phoneAskOpen
  const phoneAsk = showPhoneChrome && phoneAskOpen
  const showHearing = !mobileCompareActive && !peekBook && !phoneAsk && (
    chrome === 'hearing' || (chrome === 'talking' && returnTo === 'hearing')
  )
  const showPhoneBar = !frontispieceVisible && !fullscreen && labShowPhoneBar({
    phoneChrome: showPhoneChrome,
    fullscreen,
    phoneAsk,
  })
  const audioBarActive = showPhoneChrome
    && showPhoneBar
    && !phoneAsk
    && !mobileCompareActive
    && (listen.playing || audioChapterTransitioning)
  useEffect(() => {
    if (showPhoneChrome ? !audioBarActive : !listen.playing) setSpeedPopoverOpen(false)
  }, [audioBarActive, listen.playing, showPhoneChrome])
  const phoneReaderControlsVisible = readerControlsVisible
    || listen.playing
    || phoneAsk
    || chrome === 'talking'
    || gearOpen
  const canPrevChapter = prevLabChapter(book.chapters, book.chapterNumber) != null
  const canNextChapter = nextLabChapter(book.chapters, book.chapterNumber) != null
  const currentOpeningTitle = book.bookTitle === LAB_COPY.bookTitle
    ? bibleBookOpeningTitle(book.chapters, book.chapterNumber)
    : null
  const showReaderRail = !frontispieceVisible && !fullscreen && labShowReaderRail({
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
  const barReturnsFromConversation = phoneAsk || chrome === 'talking'
  const barPrimaryLabel = mobileCompareActive
    ? LAB_COPY.read
    : barReturnsFromConversation
      ? (returnTo === 'hearing' ? LAB_COPY.play : LAB_COPY.read)
      : (listen.playing ? LAB_COPY.pause : LAB_COPY.play)
  lockPaginationRef.current = showHearing && listen.playing && !browseWhileListening
  const fullPageWordCounts = readingPages
    .slice(0, Math.max(1, readingPages.length - 1))
    .map(page => chapterPageSegments(page).reduce((total, segment) => total + Math.max(0, segment.to - segment.from), 0))
    .filter(count => count > 0)
    .sort((a, b) => a - b)
  const measuredWordsPerPage = fullPageWordCounts.length > 0
    ? fullPageWordCounts[Math.floor(fullPageWordCounts.length / 2)]
    : Math.max(1, Math.round(chapterProgress.wordsTotal / Math.max(1, chapterProgress.totalPages)))
  const phoneProgressLabel = labReaderProgressLabel({
    mode: readerProgressMode,
    currentPage: chapterProgress.currentPage,
    totalPages: chapterProgress.totalPages,
    chapterPercent: chapterProgress.percent,
    chapterNumber: book.chapterNumber,
    chapterWordsRead: chapterProgress.wordsRead,
    chapterWordCounts: book.chapters,
    wordsPerPage: measuredWordsPerPage,
  })
  const footProgressLabel = showPhoneChrome
    ? phoneProgressLabel
    : `${chapterProgress.currentPage} of ${chapterProgress.totalPages}`

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
      const followAlreadyVisible = showPhoneChrome
        ? !!page && page.paragraphIndex === follow.paragraphIndex
          && follow.wordIndex < page.to && follow.wordIndex >= page.from
        : followOnReadingPage(follow, readingPages, readingPageIndex)
      if (followAlreadyVisible) return
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
      const followAlreadyVisible = showPhoneChrome
        ? !!page && page.paragraphIndex === follow.paragraphIndex
        : followOnReadingPage(follow, readingPages, readingPageIndex)
      if (followAlreadyVisible) return
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
  }, [listen.follow, readingPages, readingPageIndex, showHearing, showPhoneChrome, listen.clipIndex, listen.currentTime])

  useEffect(() => {
    if (!showHearing || !listen.playing || browseWhileListeningRef.current) return
    const follow = listen.follow
    if (follow.kind !== 'word' && follow.kind !== 'paragraph') return
    if (!showPhoneChrome && followOnReadingPage(follow, readingPages, readingPageIndexRef.current)) return
    const next = follow.kind === 'word'
      ? pageIndexForPlace(readingPages, follow.paragraphIndex, follow.wordIndex)
      : pageIndexForPlace(readingPages, follow.paragraphIndex, 0)
    if (next === readingPageIndexRef.current) return
    const page = readingPages[next]
    const anchor = pageAnchorOf(page)
    if (anchor) pageAnchorRef.current = anchor
    readingPageIndexRef.current = next
    setReadingPageIndex(next)
  }, [readingPages, showHearing, showPhoneChrome, listen.playing, listen.follow])

  useEffect(() => {
    if ((book.bookId || 'bible') !== 'bible') return
    const editions = {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
      audio: audioEditionKey,
    }
    prefetchLabChapterTexts(book.chapterNumber, editions, 3)
  }, [book.bookId, book.chapterNumber, book.chapters, prefs.primaryEdition, prefs.compareEdition, audioEditionKey])

  const warmChapterTexts = useCallback((number: number) => {
    if ((book.bookId || 'bible') !== 'bible') return
    prefetchLabChapterTexts(number, {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
    }, 1)
  }, [book.bookId, prefs.primaryEdition, prefs.compareEdition])

  useLayoutEffect(() => {
    if (!selectionPopup) return
    const el = popupRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
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
      if (target.closest('.selection-popup')) return
      dismissSelectionPopup()
    }
    document.addEventListener('pointerdown', onPointer, true)
    return () => document.removeEventListener('pointerdown', onPointer, true)
  }, [dismissSelectionPopup, selectionPopup])

  const handleSelectRange = useCallback((range: LabHighlightRange, clientX: number, clientY: number) => {
    // A completed selection is a saved gold highlight immediately. The menu
    // edits that record; dismissing it never throws the reader's work away.
    const existing = highlightsApi.findRange(range) ?? highlightsApi.findContainingRange(range)
    const highlight = existing ?? highlightsApi.addOrReuse(range, 'gold')
    const mode = defaultPopupMode(range.text, existing?.id)
    setPopupMode(mode)
    setNoteInput(highlight.note || '')
    if (mode === 'define') define.begin(range.text)
    const anchorY = clientY
    const showBelow = window.innerHeight - anchorY > anchorY
    const mobile = typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(max-width: 768px)').matches
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
      existingHighlightId: highlight.id,
      existingNote: highlight.note,
      homeMode: mode,
      range,
    })
  }, [define, highlightsApi])

  useEffect(() => {
    if (!phoneAskOpen) setPhoneKeyboardOpen(false)
  }, [phoneAskOpen])

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
    mobileCompareReturnPlaceRef.current = null
    chapterNavigationRef.current += 1
    const reading = readingPagesRef.current
    const working = workingPagesRef.current
    const navPages = labNavPageList(pagesStableRef.current, working, reading)
    let page = navPages[index]
    if (!page) page = reading[index]
    if (!page) return
    setChapterCoverTitle(null)
    const committed = navPages[index] ? navPages : reading
    commitUnsettledNav(committed)
    chapterLandingRef.current = null
    landingChapterRef.current = null
    openAtEndRef.current = false
    setOpenAtEnd(false)
    const activeAnchor = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
    pageAnchorRef.current = activeAnchor
    const clamped = Math.max(0, Math.min(index, Math.max(0, committed.length - 1)))
    const previousPageIndex = readingPageIndexRef.current
    if (clamped !== previousPageIndex) {
      setPageTurn(current => ({
        direction: clamped > previousPageIndex ? 'next' : 'previous',
        nonce: (current?.nonce ?? 0) + 1,
      }))
    }
    readingPageIndexRef.current = clamped
    readerStateRef.current = { ...readerStateRef.current, pageIndex: clamped }
    setReadingPageIndex(clamped)
    if (listen.playing || browseWhileListeningRef.current) {
      browseWhileListeningRef.current = true
      setBrowseWhileListening(true)
    } else {
      const primaryAnchor = primaryAnchorFor(activeAnchor)
      placeRef.current = primaryAnchor
      notePlace('page-turn', primaryAnchor)
    }
  }, [commitUnsettledNav, listen, mobileCompareActive, notePlace, primaryAnchorFor])

  const handleMobileCompare = useCallback(() => {
    if (!mobileCompareEnabled) return
    const current = readingPagesRef.current
    const currentIndex = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, current.length - 1)))
    const nextActive = !mobileCompareActive
    const visiblePageAnchor = pageAnchorOf(current[currentIndex]) ?? pageAnchorRef.current ?? { paragraphIndex: 0, wordIndex: 0 }
    // Enter Compare from the precise primary ReaderSession place. Playback can
    // pause between page boundaries, and falling back to the visible page head
    // would silently rewind that semantic word.
    const sourceAnchor = nextActive ? { ...placeRef.current } : visiblePageAnchor
    if (nextActive) mobilePrimaryPagesRef.current = current
    const targetParagraphs = nextActive ? book.compareParagraphs : book.paragraphs
    const mapped = nextActive
      ? mapLabCompareAnchor(readerParagraphs, targetParagraphs, sourceAnchor)
      : { ...placeRef.current }
    const primaryAnchor = nextActive ? sourceAnchor : mapped
    const budget = pageMetricsRef.current ? labPageBudgetFromMetrics(pageMetricsRef.current) : null
    const settledPrimaryPages = !nextActive ? mobilePrimaryPagesRef.current : null
    const nextPages = settledPrimaryPages
      ?? chapterHearingPages(targetParagraphs, canUseLabPageBudget(budget) ? budget : null)
    const nextIndex = pageIndexForPlace(nextPages, mapped.paragraphIndex, mapped.wordIndex)

    // Entering Compare interrupts playback, but returning to Read is a pure
    // reader-mode transition. The Read action must not mutate the audio tuple.
    if (nextActive && listen.playing) listen.pause()
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    setChrome('reading')
    setReturnTo('reading')
    setPeekBook(false)
    setInTheBookOpen(false)
    setChapterCoverTitle(null)
    pageAnchorRef.current = mapped
    placeRef.current = primaryAnchor
    mobileCompareReturnPlaceRef.current = nextActive ? null : primaryAnchor
    readerStateRef.current = {
      ...readerStateRef.current,
      pageIndex: nextIndex,
      readerMode: nextActive ? 'compare' : 'read',
    }
    notePlace('mode-change', primaryAnchor)
    pagesStableRef.current = false
    readingPagesRef.current = nextPages
    workingPagesRef.current = nextPages
    readingPageIndexRef.current = nextIndex
    setReadingPages(nextPages)
    setDraftPages(nextPages)
    setReadingPageIndex(nextIndex)
    setMobileCompareActive(nextActive)
  }, [book.compareParagraphs, book.paragraphs, listen, mobileCompareActive, mobileCompareEnabled, notePlace, readerParagraphs])

  const handleDesktopCompare = useCallback(() => {
    if (!desktopCompareEnabled) return
    const nextActive = !desktopCompareActive
    readerStateRef.current = {
      ...readerStateRef.current,
      pageIndex: readingPageIndexRef.current,
      readerMode: nextActive ? 'compare' : 'read',
    }
    setDesktopCompareActive(nextActive)
    notePlace('mode-change')
  }, [desktopCompareActive, desktopCompareEnabled, notePlace])

  const browseToChapter = useCallback(async (number: number, landing: 'start' | 'end') => {
    const navigation = ++chapterNavigationRef.current
    if (listen.playing) {
      browseWhileListeningRef.current = true
      setBrowseWhileListening(true)
    }
    if ((book.bookId || 'bible') === 'bible') {
      prefetchLabChapterTexts(number, {
        primary: prefs.primaryEdition,
        compare: prefs.compareEdition,
      }, 3)
    }
    pageAnchorRef.current = null
    restorePlaceRef.current = null
    chapterLandingRef.current = landing
    landingChapterRef.current = number
    openAtEndRef.current = landing === 'end'
    if (landing === 'start') {
      placeRef.current = { paragraphIndex: 0, wordIndex: 0 }
    }
    readerStateRef.current = {
      ...readerStateRef.current,
      pageIndex: landing === 'start' ? 0 : readerStateRef.current.pageIndex,
    }
    notePlace('chapter-jump', {
      sequentialChapter: number,
      paragraphIndex: 0,
      wordIndex: 0,
    })
    let loaded: LabSource
    try {
      loaded = await loadLabBookSource({
        bookId: book.bookId || 'bible',
        chapterNumber: number,
        primaryEditionKey: prefs.primaryEdition,
        compareEditionKey: prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition ? prefs.compareEdition : undefined,
        audioEditionKey: bookEditions.some(edition => edition.key === audioEditionKey && edition.hasAudio) ? audioEditionKey : undefined,
      })
    } catch {
      if (navigation === chapterNavigationRef.current) {
        setReaderLoadError('That chapter is temporarily unavailable. Your current reading place has been preserved.')
      }
      return
    }
    if (
      navigation !== chapterNavigationRef.current
      || loaded.chapterNumber !== number
      || loaded.paragraphs.length === 0
    ) return
    setReaderLoadError('')
    setChapterCoverTitle(null)
    setBook(loaded)
    setOpenAtEnd(landing === 'end')
  }, [book.bookId, bookEditions, listen.playing, notePlace, prefs.compareEdition, prefs.compareOpen, prefs.primaryEdition, audioEditionKey])

  const goToChapter = useCallback(async (number: number, landing: 'start' | 'end') => {
    const navigation = ++chapterNavigationRef.current
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    if ((book.bookId || 'bible') === 'bible') {
      prefetchLabChapterTexts(number, {
        primary: prefs.primaryEdition,
        compare: prefs.compareEdition,
      }, 1)
    }
    keepPlayingChapterRef.current = listen.playing ? number : null
    if (listen.playing) setAudioChapterTransitioning(true)
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
    readerStateRef.current = {
      ...readerStateRef.current,
      pageIndex: landing === 'start' ? 0 : readerStateRef.current.pageIndex,
    }
    notePlace('chapter-jump', {
      sequentialChapter: number,
      paragraphIndex: 0,
      wordIndex: 0,
    })
    let loaded: LabSource
    try {
      loaded = await loadLabBookSource({
        bookId: book.bookId || 'bible',
        chapterNumber: number,
        primaryEditionKey: prefs.primaryEdition,
        compareEditionKey: prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition ? prefs.compareEdition : undefined,
        audioEditionKey: bookEditions.some(edition => edition.key === audioEditionKey && edition.hasAudio) ? audioEditionKey : undefined,
      })
    } catch {
      if (navigation === chapterNavigationRef.current) {
        setAudioChapterTransitioning(false)
        setReaderLoadError('That chapter is temporarily unavailable. Your current reading place has been preserved.')
      }
      return
    }
    if (
      navigation !== chapterNavigationRef.current
      || loaded.chapterNumber !== number
      || loaded.paragraphs.length === 0
    ) {
      if (navigation === chapterNavigationRef.current) setAudioChapterTransitioning(false)
      return
    }
    setReaderLoadError('')
    setChapterCoverTitle(
      landing === 'start' && loaded.bookTitle === LAB_COPY.bookTitle
        ? bibleBookOpeningTitle(loaded.chapters, number)
        : null,
    )
    setListenSource({
      bookId: loaded.bookId || 'bible',
      chapterNumber: loaded.chapterNumber,
      paragraphs: loaded.paragraphs,
      followParagraphs: loaded.followParagraphs,
      audioTitle: loaded.audioTitle,
    })
    setBook(loaded)
    setOpenAtEnd(landing === 'end')
  }, [book.bookId, bookEditions, listen, notePlace, prefs.compareEdition, prefs.compareOpen, prefs.primaryEdition, audioEditionKey])

  audioChapterCompleteRef.current = () => {
    const next = nextLabChapter(book.chapters, book.chapterNumber)
    if (next == null) return false
    void goToChapter(next, 'start')
    return true
  }

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
    void listenStartRef.current(place).finally(() => setAudioChapterTransitioning(false))
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

  useEffect(() => {
    const highlight = pendingMapHighlightRef.current
    if (!highlight || highlight.chapterNumber !== book.chapterNumber) return
    pendingMapHighlightRef.current = null
    goToParagraph(highlight.paragraphIndex)
  }, [book.chapterNumber, goToParagraph])

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
    if (chapterCoverTitle) {
      if (book.paragraphs.length === 0) return
      chapterNavigationRef.current += 1
      setChapterCoverTitle(null)
      chapterLandingRef.current = null
      landingChapterRef.current = null
      openAtEndRef.current = false
      setOpenAtEnd(false)
      const first = readingPagesRef.current[0]
      pageAnchorRef.current = pageAnchorOf(first)
      readingPageIndexRef.current = 0
      setReadingPageIndex(0)
      return
    }
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
  }, [book.chapterNumber, book.chapters, book.paragraphs.length, browseToChapter, chapterCoverTitle, goToChapter, goToPage, listen.playing])

  const goPrev = useCallback(() => {
    if (chapterCoverTitle) {
      chapterNavigationRef.current += 1
      const previousChapter = prevLabChapter(book.chapters, book.chapterNumber)
      if (previousChapter != null) {
        if (listen.playing) void browseToChapter(previousChapter, 'end')
        else void goToChapter(previousChapter, 'end')
      }
      return
    }
    const reading = readingPagesRef.current
    const working = workingPagesRef.current
    const pages = labNavPageList(pagesStableRef.current, working, reading)
    const index = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, pages.length - 1)))
    const openingTitle = book.bookTitle === LAB_COPY.bookTitle
      ? bibleBookOpeningTitle(book.chapters, book.chapterNumber)
      : (book.chapterNumber === book.chapters[0]?.number ? book.bookTitle : null)
    if (index === 0 && openingTitle && !listen.playing) {
      setChapterCoverTitle(openingTitle)
      return
    }
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
  }, [book.chapterNumber, book.chapters, browseToChapter, chapterCoverTitle, goToChapter, goToPage, listen.playing])

  const startHearing = useCallback((opts?: { force?: boolean }) => {
    mobileCompareReturnPlaceRef.current = null
    setChapterCoverTitle(null)
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
    const firstVisibleWord = pageWrapRef.current?.querySelector<HTMLElement>('[data-testid="lab-word"]')
    const visibleParagraphIndex = Number(firstVisibleWord?.dataset.paragraphIndex)
    const visibleWordIndex = Number(firstVisibleWord?.dataset.wordIndex)
    const visiblePlace = Number.isInteger(visibleParagraphIndex) && Number.isInteger(visibleWordIndex)
      ? { paragraphIndex: visibleParagraphIndex, wordIndex: visibleWordIndex }
      : null
    const place = (!showPhoneChrome ? visiblePlace : null) ?? (page
      ? { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
      : placeRef.current)
    const follow = listen.follow
    const onThisPage = follow.kind === 'word' && (showPhoneChrome
      ? !!page && follow.paragraphIndex === page.paragraphIndex
        && follow.wordIndex >= page.from && follow.wordIndex < page.to
      : followOnReadingPage(follow, readingPages, readingPageIndex))
    placeRef.current = onThisPage
      ? { paragraphIndex: follow.paragraphIndex, wordIndex: follow.wordIndex }
      : place
    flushSync(() => setListenSource({
      bookId: book.bookId || 'bible',
      chapterNumber: book.chapterNumber,
      paragraphs: book.paragraphs,
      followParagraphs: book.followParagraphs,
      audioTitle: book.audioTitle,
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
  }, [chrome, listen, notePlace, readingPageIndex, readingPages, showPhoneChrome])

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
    setTocOpen(false)
    interruptHearForAsk()
    setVoiceGate('connecting')
    setChrome('talking')
    if (!showPhoneChrome) {
      setDesktopAskOpen(true)
      void ask.startVoice().then((started) => {
        if (!started) setVoiceGate('off')
      })
      return
    }
    openPhoneAsk()
    void ask.startVoice().then((started) => {
      if (!started) setVoiceGate('off')
    })
  }, [ask, interruptHearForAsk, openPhoneAsk, showPhoneChrome])

  const handleChat = useCallback(() => {
    setGearOpen(false)
    setTocOpen(false)
    setVoiceGate('off')
    if (!showPhoneChrome) {
      if (desktopAskOpen && chrome !== 'talking') {
        resumeListenAfterAsk()
        return
      }
      interruptHearForAsk()
      setDesktopAskOpen(true)
      if (ask.voiceActive) ask.stopVoice()
      return
    }
    stayInAskRef.current = true
    // iOS raises the keyboard only for a focus() that runs synchronously
    // inside the tap, so commit the sheet now and focus before returning.
    // Every other way into the sheet (Ask about, voice view) stays unfocused.
    flushSync(() => openPhoneAsk())
    if (ask.voiceActive) ask.stopVoice()
    else stayInAskRef.current = false
    askInputRef.current?.focus({ preventScroll: true })
  }, [ask, chrome, desktopAskOpen, interruptHearForAsk, openPhoneAsk, resumeListenAfterAsk, showPhoneChrome])

  const handleBarListen = useCallback(() => {
    setGearOpen(false)
    if (phoneAskOpen || chrome === 'talking') {
      resumeListenAfterAsk()
      return
    }
    if (mobileCompareActive) {
      handleMobileCompare()
      return
    }
    if (chrome === 'hearing') {
      if (listen.playing) {
        // The phone Pause control is also the explicit return to the reading
        // surface. Reuse the full transition so the visible page, persisted
        // place and contextual Chat/Talk return label stay coherent.
        startHearing()
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
  }, [chrome, handleMobileCompare, listen, mobileCompareActive, phoneAskOpen, resumeListenAfterAsk, startHearing])

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
      lang={bookEditions.find(edition => edition.key === readerEditionKey)?.language || 'en'}
      className={`lab ${isPhone ? 'is-phone' : 'is-desktop'}${frontispieceVisible ? ' is-frontispiece' : ''}${showPhoneChrome ? ' has-phone-chrome' : ''}${showPhoneChrome && phoneReaderControlsVisible ? ' has-reader-controls' : ''}${ask.notice ? ' has-notice' : ''}${phoneAskOpen ? ' has-phone-ask' : ''}${phoneKeyboardOpen ? ' has-phone-keyboard' : ''}${resolvedDarkMode ? ' is-night' : ''}${prefs.theme === 'book' ? ' is-book-theme' : ''}${fullscreen ? ' is-fullscreen' : ''}`}
      data-testid="lab-root"
      data-theme={resolvedTheme}
      data-lab-layout={showPhoneChrome ? 'phone' : 'desktop'}
      data-chrome-state={chrome}
      data-phone-bar={showPhoneBar ? labPhoneBarMode(chrome, peekBook, phoneAskOpen) : 'none'}
      data-page-height={pageMetrics ? String(pageMetrics.height) : ''}
      data-chapter={String(book.chapterNumber)}
      data-book-id={book.bookId || 'bible'}
      data-cover-page={chapterCoverTitle ? 'true' : 'false'}
      data-reader-ready={book.paragraphs.length > 0 ? 'true' : 'false'}
      data-biblical-book={biblicalBook}
      data-place={`${placeRef.current.paragraphIndex}:${placeRef.current.wordIndex}`}
      data-playing={listen.playing ? 'true' : 'false'}
      data-fullscreen={fullscreen ? 'true' : 'false'}
      data-reader-controls={frontispieceVisible
        ? 'hidden'
        : showPhoneChrome ? (phoneReaderControlsVisible ? 'visible' : 'hidden') : 'desktop'}
      data-reader-edition={readerEditionKey}
      data-compare-active={(showPhoneChrome ? mobileCompareActive : desktopCompareActive) ? 'true' : 'false'}
      data-desktop-view={desktopCompareActive ? 'compare' : 'read'}
      data-desktop-panel={!showPhoneChrome && desktopAskOpen ? (chrome === 'talking' ? 'talk' : 'chat') : 'none'}
      data-voice-surface={voiceLabView}
      data-voice-version={voiceVersion}
      data-voice-history-fixture={voiceHistoryFixture ? 'true' : 'false'}
      data-audio-speed={String(listen.speed)}
      style={{
        ['--lab-font-reader' as string]: labFontFamilyCss(prefs.fontFamily),
        ['--lab-font-size' as string]: String(prefs.fontSize),
        ['--lab-text-align' as string]: prefs.alignment,
        ['--lab-line-height' as string]: prefs.lineSpacing === 'compact' ? '1.34' : prefs.lineSpacing === 'open' ? '1.62' : '1.48',
        ['--lab-reader-margin' as string]: prefs.margins === 'narrow' ? '1.1rem' : prefs.margins === 'wide' ? '2.2rem' : '1.55rem',
        ['--lab-paragraph-gap' as string]: prefs.paragraphSpacing === 'compact' ? '.08em' : prefs.paragraphSpacing === 'generous' ? '.55em' : '.28em',
      }}
    >
      {fullscreen && !showPhoneChrome && (
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
      {!frontispieceVisible && <header className="lab-header">
        <div
          className="lab-header-brand"
          onClick={showPhoneChrome && !phoneReaderControlsVisible ? () => setReaderControlsVisible(true) : undefined}
        >
          <h1 className="lab-header-work" data-testid="lab-header-work">{book.bookTitle}</h1>
          <span className="lab-title-sep" aria-hidden="true"> · </span>
          <button
            type="button"
            className="lab-header-chapter"
            data-testid="lab-header-chapter"
            aria-label={`Table of contents, ${book.chapterLabel}`}
            onClick={() => { setGearOpen(false); setReaderControlsVisible(true); setTocOpen(true) }}
          >
            <span className="lab-header-chapter-label">{book.chapterLabel}</span>
            <span className="lab-header-chevron" aria-hidden="true">∨</span>
          </button>
        </div>
        <div className="lab-header-controls">
          {!showPhoneChrome && <button
            type="button"
            className={`lab-fullscreen ${fullscreen ? 'is-on' : ''}`}
            onClick={() => { void toggleFullscreen() }}
            aria-label={fullscreen ? LAB_COPY.exitFullScreen : LAB_COPY.fullScreen}
            data-testid="lab-fullscreen"
          >
            <FullscreenIcon on={fullscreen} />
          </button>}
          <button
            type="button"
            className={`lab-gear ${gearOpen ? 'is-open' : ''}`}
            onClick={() => { setTocOpen(false); setGearOpen(open => !open); setSettingsSection('reading') }}
            aria-label={LAB_COPY.settings}
            aria-expanded={gearOpen}
            aria-haspopup="dialog"
            aria-hidden={showPhoneChrome && !phoneReaderControlsVisible}
            tabIndex={showPhoneChrome && !phoneReaderControlsVisible ? -1 : undefined}
            data-testid="lab-gear"
          >
            <TuneIcon />
          </button>
        </div>
        <p className="lab-status" data-testid="lab-status">
          {labStatusLine(
            labVisibleChrome(chrome, peekBook),
            book.chapterLabel,
            showPhoneChrome ? 'phone' : 'desktop',
          )}
        </p>
      </header>}
      {readerLoadError && (
        <div className="lab-reader-load-error" role="alert" data-testid="lab-reader-load-error">
          <p>{readerLoadError}</p>
          <a href="/lab/library">Return to the library</a>
        </div>
      )}


      <div className="lab-body">
        {!(showPhoneChrome && phoneAsk) && (
        <div
          className="lab-page-wrap"
          ref={pageWrapRef}
          data-testid="lab-page-wrap"
        >
          {chapterCoverTitle ? (
            <LabChapterCover
              title={chapterCoverTitle}
              series={chapterCoverTitle === book.bookTitle ? book.bookAuthor : book.bookTitle}
              editionLabel={book.editionLabel}
              ground={getBook(book.bookId || 'bible')?.coverColor}
              accent={getBook(book.bookId || 'bible')?.coverAccent}
              onPageTurn={(direction) => {
                if (direction > 0) {
                  setReaderControlsVisible(true)
                  goNext()
                } else {
                  goPrev()
                }
              }}
              onToggleControls={() => setReaderControlsVisible(visible => !visible)}
            />
          ) : <LabPassage
            chapterTitle={book.chapterTitle}
            paragraphs={readerParagraphs}
            compareParagraphs={book.compareParagraphs}
            compare={desktopCompareActive && desktopCompareEnabled}
            mode={showPhoneChrome && showHearing ? 'hearing' : 'reading'}
            follow={showHearing && listen.playing && !browseWhileListening ? listen.follow : { kind: 'none' }}
            followParagraphs={listen.followParagraphs}
            clips={listen.clips}
            playing={listen.playing}
            clipIndex={listen.clipIndex}
            currentTime={listen.currentTime}
            speed={listen.speed}
            browseWhileListening={browseWhileListening}
            inlineHearingPaint={!showPhoneChrome && showHearing && listen.playing && !browseWhileListening}
            onSeekToWord={listen.playing ? seekAudioToWord : undefined}
            onTogglePlay={() => {
              if (listen.playing) listen.pause()
              else if (listen.src) listen.resume()
              else void listen.start()
            }}
            onSeek={listen.seek}
            onCycleSpeed={listen.cycleSpeed}
            hideTransport
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
            pageTurn={pageTurn}
            onSelectRange={phoneAsk || mobileCompareActive ? undefined : handleSelectRange}
            onPageTurn={showPhoneChrome && !phoneAsk && !selectionPopup
              ? (direction) => {
                  setReaderControlsVisible(false)
                  if (direction > 0) goNext()
                  else goPrev()
                }
              : undefined}
            onToggleControls={showPhoneChrome && !phoneAsk && !selectionPopup
              ? () => setReaderControlsVisible(visible => !visible)
              : undefined}
          />}
          {!chapterCoverTitle && nativePhonePaging && (
            <LabNativePaginator
              chapterTitle={book.chapterTitle}
              paragraphs={readerParagraphs}
              layoutKey={[
                book.chapterNumber,
                readerEditionKey,
                prefs.fontFamily,
                prefs.fontSize,
                prefs.alignment,
                prefs.lineSpacing,
                prefs.margins,
                prefs.paragraphSpacing,
                fullscreen ? 'fullscreen' : 'windowed',
              ].join(':')}
              onPages={applyNativePages}
            />
          )}
          {!chapterCoverTitle && !nativePhonePaging && settleIndex != null && draftPages[settleIndex] && (
            <div
              className="lab-page-measure"
              ref={measureHostRef}
              aria-hidden="true"
              key={`${settleIndex}-${draftPages[settleIndex].from}-${draftPages[settleIndex].to}`}
            >
              <LabPageMeasurePaint
                chapterTitle={book.chapterTitle}
                paragraphs={readerParagraphs}
                page={draftPages[settleIndex]}
                hearingPaint={false}
              />
            </div>
          )}
        </div>
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
            desktopCompanion={!showPhoneChrome ? (chrome === 'talking' ? 'talk' : 'chat') : undefined}
            onKeyboardOpenChange={setPhoneKeyboardOpen}
            inputRef={askInputRef}
            chapterLabels={Object.fromEntries(book.chapters.map(chapter => [chapter.number, chapter.title]))}
          />
        )}
        {!showPhoneChrome && !frontispieceVisible && (
          <nav className="lab-desktop-action-rail" data-testid="lab-desktop-action-rail" aria-label="Reader actions">
            <button
              type="button"
              className={`lab-desktop-action is-play${desktopCompareActive || listen.playing ? ' is-active' : ''}`}
              onClick={desktopCompareActive ? handleDesktopCompare : handleHeaderListen}
              aria-label={desktopCompareActive ? LAB_COPY.read : (listen.playing ? LAB_COPY.pause : LAB_COPY.play)}
              data-reader-action={desktopCompareActive ? 'read' : 'listen'}
              data-testid="lab-listen"
            >
              <span
                className="lab-desktop-action-icon"
                data-testid={desktopCompareActive ? 'lab-desktop-read' : 'lab-desktop-play'}
                aria-hidden="true"
              >
                {desktopCompareActive
                  ? <ReadIcon size={19} />
                  : (listen.playing ? <PauseIcon size={19} /> : <PlayIcon size={19} />)}
              </span>
              <span>{desktopCompareActive ? LAB_COPY.read : (listen.playing ? LAB_COPY.pause : LAB_COPY.play)}</span>
            </button>
            {desktopCompareEnabled && (
              <button
                type="button"
                className={`lab-desktop-action${desktopCompareActive ? ' is-active' : ''}`}
                onClick={handleDesktopCompare}
                aria-label={desktopCompareActive ? `Close ${LAB_COPY.compare}` : LAB_COPY.compare}
                aria-pressed={desktopCompareActive}
                data-testid="lab-desktop-compare"
              >
                <CompareIcon />
                <span>{LAB_COPY.compare}</span>
              </button>
            )}
            <button
              type="button"
              className={`lab-desktop-action${desktopAskOpen && chrome !== 'talking' ? ' is-active' : ''}`}
              onClick={handleChat}
              aria-pressed={desktopAskOpen && chrome !== 'talking'}
              data-testid="lab-desktop-chat"
            >
              <ChatIcon />
              <span>{LAB_COPY.chat}</span>
            </button>
            <button
              type="button"
              className={`lab-desktop-action${desktopAskOpen && chrome === 'talking' ? ' is-active' : ''}`}
              onClick={handleTalk}
              aria-pressed={desktopAskOpen && chrome === 'talking'}
              data-testid="lab-desktop-talk"
            >
              <TalkIcon />
              <span>{LAB_COPY.talk}</span>
            </button>
          </nav>
        )}
      </div>

      {!frontispieceVisible && <div className="lab-bottom-chrome" ref={bottomChromeRef} data-testid="lab-bottom-chrome">
      {showReaderRail && (
        <nav className={`lab-page-turn ${showPhoneChrome ? 'is-phone-rail' : ''}`} data-testid="lab-page-turn" aria-label="Page">
          {(!chapterCoverTitle && !!currentOpeningTitle) || readingPageIndex > 0 || canPrevChapter ? (
            <button
              type="button"
              className={showPhoneChrome ? 'lab-visually-hidden' : 'lab-page-turn-btn'}
              data-testid="lab-page-prev"
              aria-label={LAB_COPY.previous}
              onClick={goPrev}
            >
              {showPhoneChrome ? '←' : '‹'}
            </button>
          ) : (
            !showPhoneChrome ? <span className="lab-page-turn-spacer" /> : null
          )}
          {showPhoneChrome ? (
            <button
              type="button"
              className="lab-chapter-progress is-interactive"
              data-testid="lab-chapter-progress"
              title={readerProgressMode === 'book' ? 'Show chapter progress' : 'Show book progress'}
              aria-label={`${footProgressLabel}. Show ${readerProgressMode === 'book' ? 'chapter' : 'book'} progress`}
              onClick={() => setReaderProgressMode(mode => mode === 'book' ? 'chapter' : 'book')}
            >
              <span className="lab-chapter-progress-info">{footProgressLabel}</span>
            </button>
          ) : (
            <div
              className="lab-chapter-progress"
              data-testid="lab-chapter-progress"
              title={footProgress}
            >
              <span className="lab-chapter-progress-info">{footProgressLabel}</span>
            </div>
          )}
          {chapterCoverTitle || readingPageIndex < labNavPageList(pagesStableRef.current, draftPages, readingPages).length - 1 || canNextChapter ? (
            <button
              type="button"
              className={showPhoneChrome ? 'lab-visually-hidden' : 'lab-page-turn-btn'}
              data-testid="lab-page-next"
              aria-label={LAB_COPY.next}
              onClick={goNext}
            >
              {showPhoneChrome ? '→' : '›'}
            </button>
          ) : (
            !showPhoneChrome ? <span className="lab-page-turn-spacer" /> : null
          )}
        </nav>
      )}

      {!showPhoneChrome && listen.playing && (
        <section className="lab-desktop-audio-dock" data-testid="lab-desktop-audio-dock" aria-label="Audio player">
          <button type="button" className="lab-desktop-audio-speed" data-testid="lab-hearing-speed" onClick={() => setSpeedPopoverOpen(open => !open)} aria-label={`Playback speed ${listen.speed} times`} aria-expanded={speedPopoverOpen}>{listen.speed}×</button>
          <button type="button" data-testid="lab-hearing-back" onClick={() => listen.seek(-15)} aria-label="Back 15 seconds"><SkipIcon direction="back" /></button>
          <button type="button" className="is-primary" data-testid="lab-hearing-pause" onClick={handleHeaderListen} aria-label={LAB_COPY.pause}><PauseIcon size={22} /></button>
          <button type="button" data-testid="lab-hearing-forward" onClick={() => listen.seek(30)} aria-label="Forward 30 seconds"><SkipIcon direction="forward" seconds={30} /></button>
          <div className="lab-desktop-audio-track">
            <strong>{book.bookTitle}</strong>
            <span>{book.chapterLabel} · {primaryEditionLabel}</span>
            <i><b style={{ width: `${Math.max(0, Math.min(100, ((listen.currentTime || 0) / Math.max(1, listen.clips[listen.clipIndex]?.duration || 1)) * 100))}%` }} /></i>
          </div>
        </section>
      )}

      {(audioBarActive || (!showPhoneChrome && listen.playing)) && speedPopoverOpen && (
        <section
          id="lab-audio-speed-popover"
          className="lab-audio-speed-popover"
          data-testid="lab-audio-speed-popover"
          aria-label="Playback speed"
        >
          <div className="lab-audio-speed-heading">
            <span>Playback speed</span>
            <output htmlFor="lab-audio-speed-slider">{listen.speed}×</output>
          </div>
          <input
            id="lab-audio-speed-slider"
            data-testid="lab-audio-speed-slider"
            type="range"
            min="0.5"
            max="3"
            step="0.25"
            value={listen.speed}
            aria-label="Playback speed"
            onChange={(event) => listen.setSpeed(Number(event.target.value))}
          />
          <div className="lab-audio-speed-scale" aria-hidden="true">
            <span>0.5×</span>
            <span>1×</span>
            <span>2×</span>
            <span>3×</span>
          </div>
        </section>
      )}

      {showPhoneBar && (
        <footer className="lab-phone-bar" data-testid="lab-phone-bar">
          {ask.notice && !phoneAsk && (
            <p className="lab-phone-notice" data-testid="lab-voice-notice">{ask.notice}</p>
          )}
          <div className={`lab-phone-bar-row ${audioBarActive ? 'is-audio has-5' : `is-read ${mobileCompareEnabled ? 'has-4' : 'has-3'}`}`}>
            {audioBarActive ? (
              <>
                <button type="button" className="lab-phone-fat lab-audio-control is-active" onClick={handleBarListen} aria-label="Pause and return to reading" data-testid="lab-listen">
                  <span data-testid="lab-hearing-pause" className="lab-visually-hidden">{LAB_COPY.pause}</span>
                  <PauseIcon size={21} />
                </button>
                <button type="button" className="lab-phone-fat lab-audio-control" data-testid="lab-hearing-back" aria-label="Back 15 seconds" onClick={() => listen.seek(-15)}>
                  <SkipIcon direction="back" />
                </button>
                <button
                  type="button"
                  className="lab-phone-fat lab-audio-control lab-audio-speed"
                  data-testid="lab-hearing-speed"
                  aria-label={`Playback speed ${listen.speed} times. Open speed control`}
                  aria-expanded={speedPopoverOpen}
                  aria-controls="lab-audio-speed-popover"
                  onClick={() => setSpeedPopoverOpen(open => !open)}
                >
                  {listen.speed}×
                </button>
                <button type="button" className="lab-phone-fat lab-audio-control" data-testid="lab-hearing-forward" aria-label="Forward 15 seconds" onClick={() => listen.seek(15)}>
                  <SkipIcon direction="forward" />
                </button>
                <button type="button" className="lab-phone-fat lab-audio-control" onClick={handleTalk} aria-label={LAB_COPY.talk} data-testid="lab-phone-talk">
                  <TalkIcon />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="lab-phone-fat"
                  onClick={handleBarListen}
                  aria-label={barPrimaryLabel}
                  data-reader-action={mobileCompareActive ? 'read' : 'listen'}
                  data-testid="lab-listen"
                >
                  {mobileCompareActive || (barReturnsFromConversation && returnTo === 'reading') ? (
                    <span data-testid="lab-reader-primary-read-icon" aria-hidden="true">
                      <ReadIcon size={18} />
                    </span>
                  ) : (
                    <span className="lab-header-play" data-testid="lab-listen-play" aria-hidden="true">
                      <PlayIcon size={18} />
                    </span>
                  )}
                  {barPrimaryLabel}
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
              </>
            )}
          </div>
        </footer>
      )}
      </div>}

      <LabVoiceActionPanel
        active={ask.voiceActive}
        view={voiceLabView}
        darkMode={resolvedDarkMode}
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
        editions={bookEditions}
        audioEditions={bookEditions.filter(edition => edition.hasAudio)}
        onOpenThisBook={() => {
          setGearOpen(false)
          setPhoneAskOpen(false)
          setInTheBookOpen(true)
          setPeekBook(chrome === 'hearing')
        }}
        desktop={!showPhoneChrome}
      />

      {tocOpen && (
        <div className="lab-toc" data-testid="lab-toc">
          <LabPhoneBibleTree
            title={book.bookTitle}
            chapters={book.chapters}
            currentChapter={book.chapterNumber}
            sections={book.sections}
            finishedChapters={finishedChapters}
            highlights={highlightsApi.highlights}
            conversations={readLabTalkHistory(biblicalBook)}
            onSelectChapter={(number) => {
              setTocOpen(false)
              if (listen.playing) void browseToChapter(number, 'start')
              else void goToChapter(number, 'start')
            }}
            onWarmChapter={warmChapterTexts}
            onSelectHighlight={(highlight) => {
              setTocOpen(false)
              pendingMapHighlightRef.current = highlight
              void goToChapter(highlight.chapterNumber, 'start')
            }}
            onOpenConversation={() => {
              setTocOpen(false)
              handleChat()
            }}
            onNewConversation={(number) => {
              setTocOpen(false)
              void goToChapter(number, 'start').then(() => window.setTimeout(handleChat, 0))
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

      {selectionPopup && (
        <SelectionPopup
          selection={selectionPopup}
          popupRef={popupRef}
          popupMode={popupMode}
          setPopupMode={setPopupMode}
          currentHighlightColor={selectionPopup.existingHighlightId
            ? highlightsApi.highlights.find(highlight => highlight.id === selectionPopup.existingHighlightId)?.color
            : undefined}
          onColorClick={(color: HighlightColor) => {
            if (selectionPopup.existingHighlightId) {
              highlightsApi.setColor(selectionPopup.existingHighlightId, color)
            } else if (selectionPopup.range) {
              highlightsApi.addOrReuse(selectionPopup.range, color)
            }
            dismissSelectionPopup()
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
          onRequestNote={() => {
            if (!selectionPopup.existingHighlightId && selectionPopup.range) {
              const created = highlightsApi.addOrReuse(selectionPopup.range, 'gold')
              setSelectionPopup(current => current ? {
                ...current,
                existingHighlightId: created.id,
                existingNote: created.note,
              } : current)
            }
            setPopupMode('note')
          }}
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
