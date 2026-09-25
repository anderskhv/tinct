import { editionHold, TEMPORARY_HOLD_NOTICE } from '../data/editionAvailability'
import { EditionHoldPanel } from './EditionHoldPanel'
import { usesRetainedBella } from '../narration/bellaRetention'
import { readCoverTransition } from '../../public/lab/cover-transition.js'
import { ReadIcon, ChatIcon, TalkIcon, LoadingIcon } from './LabReaderIcons'
import { isAudioHeld, isEditionDiscoverable } from '../data/audioAvailability'
import { useCharacterCards } from '../services/characters/useCharacterCards'
import { resolveCharacter, wordSelectionOffsets } from '../services/characters/characterCards'
import { LabBookPreface } from './LabBookPreface'
import { LabBookSwitcher } from './LabBookSwitcher'
import { getBookPreface } from '../data/bookPrefaces'
import { LabChapterEnd } from './LabChapterEnd'
import { CHAPTER_CHAT_MESSAGES, createChapterChatRequest } from './labChapterChat'
import { LabDesktopPaginator, type LabLeafCapacity } from './LabDesktopPaginator'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import {
  applyNarrationPilotFlag,
  ensureNarration,
  fetchNarrationPilotInfo,
  initialNarrationPilotInfo,
  narrationPilotApplies,
  narrationPilotFlag,
  resolveNarrationVoice,
  type NarrationPilotInfo,
} from './labNarration'
import { readSupabaseAccessToken } from './labAuth'
import { useNarrationPrefetch } from './useNarrationPrefetch'
import { useVoicePersonaSync } from './useVoicePersonaSync'
import { flushSync } from 'react-dom'
import { readerPreviewSearch } from '../../public/lab/library-model.js'
import { LAB_COPY } from './labCopy'
import {
  LAB_DESKTOP_PANES,
  labShouldAutofocusComposer,
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
  labKeyboardPageDirection,
  nextPaintShrinkTo,
  type LabPageAdjust,
  type LabPageMetrics,
  type LabChromeState,
  type LabReturnTo,
  type LabVoiceGatePhase,
  LAB_PHONE_QUERY,
  labPageTurnAffordance,
  labPageTurnSurfaceEnabled,
} from './labChrome'
import { LabPhoneBibleTree } from './LabPhoneBibleTree'
import { LabContentsV2 } from './LabContentsV2'
import type { ContentsPlace } from './labContents'
import { readLabBookChat } from './labChatHistory'
import { labChapterStatuses, labFinishedChapterSet } from './labChapterStatus'
import { loadChapterText, readDeviceReadingMemory } from '../readingMemory'
import { useAuth } from '../hooks/useAuth'
import { LabSettingsSheet } from './LabSettingsSheet'
import { LabSuperButton } from './LabSuperButton'
import { LabSuperMenu } from './LabSuperMenu.tsx'
import { LabV2Sheet } from './LabV2Sheet.tsx'
import { LAB_V2_VERSION_PILL_MS, type LabV2SheetLayer } from './labV2Sheet'
import { LAB_SUPER_FIRST_VIEW_DELAY_MS, LAB_V2_PLAY_PX } from './labSuperGlyph'
import type { LabSuperMenuId } from './labSuperMenu'
import {
  labLineHeight, labMarginScale, labParagraphGap,
  LAB_LIBRARY_URL,
  labAccountUrl,
  bibleEditions,
  labFontFamilyCss,
  labReadingFont,
  labFootProgress,
  labBookPageEstimate,
  labPageFolio,
  labReaderProgressLabel,
  LAB_PROGRESS_HOLD_MS,
  editionLabelFor,
  readLabPrefs,
  writeLabPrefs,
  syncLabAudioEdition,
  effectiveLabAudioEdition,
  migrateLabPrefsEditions,
  selectableLabEditions,
  type LabPrefs,
  type LabAppearanceProfile,
  type LabReaderProgressMode,
} from './labPrefs'
import { savedPlaceFallbackEditionKey } from '../data/editionDefaults'
import { matchingAudioEditions, resolvedAudioIsAvailable } from '../utils/audioEditionSelection'
import { labChromeVersion, labLayoutOverride, labVoiceVersion } from './labRoute'
import { useLabDictation } from './useLabDictation'
import { LabAskPane } from './LabAskPane'
import { LabConversationOverlay, LabVoiceGate } from './LabConversation'
import { LabNativePaginator, shrinkNativePageAfterPaint } from './LabNativePaginator'
import { LabChapterCover } from './LabChapterCover'
import { LabVoiceActionPanel } from './LabVoiceActionPanel'
import { LabVoiceCall } from './LabVoiceCall.tsx'
import { LabVoiceDesktopPanel, LabVoicePill } from './LabVoiceDesktop.tsx'
import { labCallRestore, labCallUtterance, labCallView, type LabCallAnchor } from './labVoiceCall'
import { LabPageMeasurePaint, LabPassage } from './LabPassage'
import { LabInTheBook } from './LabInTheBook'
import { readerEditionLabel } from './editionDifficulty'
import { bibleEditionHasChapter, bibleVerseNumbersCorrespond } from '../data/bibleEditionChapters'
import { bibleBookOpeningTitle, bibleFallbackSource, loadLabBookSource, nextLabChapter, prevLabChapter, prefetchLabChapterTexts, type LabMark, type LabSource } from './labSource'
import { bootLabReading, remoteResumeSelection, useLabPositionSync } from './useLabPositionSync'
import { readCachedSupabaseUser, readLabLibraryBootSnapshot, snapshotWithReaderPlace, writeLabLibraryBootSnapshot } from './labLibraryBoot'
import { LAB_READER_HANDOFF_KEY, consumeLabReaderHandoffForPage, pendingLabSourceForHandoff, prefsFromLabReaderHandoff, prefsFromLabResumePlace, releaseLabReaderHandoffForPage } from './labReaderHandoff'
import { accountLabPositionRecord, recentChapterPlace, type LabBookPlace, type LabReaderStateSnapshot } from './labPosition'
import { isResumeListenCommand, resolveLabPlaybackSkip, type LabPlaybackSkip } from './labAsk'
import { adjacentPageIndex, applyPaintShrink, canUseLabPageBudget, chapterHearingPages, chapterPageSegments, chapterPageTail, clampedChapterProgress, cutPageTailTo, ensurePageIdentity, followOnReadingPage, growPageByFirstOmittedWord, growPageByWords, growPaintedPageIfSlack, labChapterProgress, labNavPageList, labPageBudgetFromMetrics, leftoverWordCount, pageAnchorOf, pageIndexForPlace, reflowAfterCut, restorePageIndexForAnchor, sameChapterPages, sentenceStartWordIndex, snapShrinkEndToSentence, tokenizeHearingWords, type ChapterHearingPage } from './labHearing'
import { SelectionPopup, type PopupMode, type SelectionInfo } from '../components/reader/SelectionPopup'
import { useDefine } from '../components/reader/useDefine'
import { defaultPopupMode } from '../components/reader/selectionPopupMode'
import type { ChatConversation, HighlightColor } from '../types'
import { buildHighlightRange, type LabHighlight, type LabHighlightRange } from './labHighlights'
import { useLabHighlights } from './useLabHighlights'
import { useLabAsk } from './useLabAsk'
import { readLabPositionLocal } from './labPositionStore'
import { markReaderLoadTrace } from '../utils/readerLoadTrace'
import { LabAccountSheet } from './LabAccountPrompt.tsx'
import { clearLabAiActionCount, labCurrentPath, labBookSignInReturn, type LabAccountPromptRequest } from './labAccountPrompt'
import { useLabListen } from './useLabListen'
import { labComparePassagePages, mapLabCompareAnchor, mapLabCompareEnd, splitLabPagesAtAnchor, type LabCompareAnchor } from './labCompare'
import { buildVerseAlignment, needsVerseAlignment } from './labVerseAlignment'
import {
  createLabVoiceToolAdapter,
  getLabVoiceReadingHistory,
  type LabVoiceActionEntry,
  type LabVoiceViewSnapshot,
  shouldResumePlaybackAfterNavigation,
  type LabPlaybackNavigationOutcome,
} from './labVoiceControls'
import type { VoiceTinctView } from '../voice/tinctTools'
import { isShakespearePhone } from './labShakespeare'
import { BOOKS, getBook } from '../data/bookRegistry'
import { useLabReadingMemory } from '../readingMemory/useLabReadingMemory'
import { continueHandoff } from '../preReader/continueHandoff'
import { quickBookCompletedIds, quickBookPositions, quickBookRows, type QuickBookCatalogueEntry, type QuickBookRow } from '../preReader/quickBookSwitcher'
import './lab.css'

const PHONE_QUERY = LAB_PHONE_QUERY

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

const POINTER_QUERIES = [
  '(any-pointer: fine)',
  '(any-hover: hover)',
  '(any-pointer: coarse)',
  '(pointer: coarse)',
  '(hover: none)',
] as const

/**
 * The pointer, not the window width, decides how pages are turned. A narrow
 * desktop window is still a mouse: it keeps the visible previous/next buttons.
 */
function readPageTurnAffordance(layoutOverride: ReturnType<typeof labLayoutOverride>) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return labPageTurnAffordance({ override: layoutOverride })
  }
  const matches = (query: string) => {
    try { return window.matchMedia(query).matches } catch { return false }
  }
  return labPageTurnAffordance({
    override: layoutOverride,
    finePointer: matches(POINTER_QUERIES[0]),
    hover: matches(POINTER_QUERIES[1]),
    coarsePointer: matches(POINTER_QUERIES[2]),
    primaryCoarse: matches(POINTER_QUERIES[3]),
    primaryHoverNone: matches(POINTER_QUERIES[4]),
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

function quickCatalogueFallback(current: LabSource): QuickBookCatalogueEntry[] {
  const currentBookId = current.bookId || 'bible'
  return BOOKS.map(book => ({
    id: book.id,
    title: book.title,
    art: { src: `/covers/v2/${book.id}.webp` },
    readingStructure: book.id === currentBookId
      ? { chapters: current.chapters.map(chapter => ({ number: chapter.number, title: chapter.title })) }
      : null,
  }))
}

export function LabApp({ pathname, search, online, source, authToken }: LabAppProps) {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/lab')
  const layoutOverride = labLayoutOverride(path)
  const chromeV2 = labChromeVersion(path, search ?? (typeof window !== 'undefined' ? window.location.search : '')) === 'v2'
  const voiceVersion = chromeV2 ? 'v2' : labVoiceVersion(path, search ?? (typeof window !== 'undefined' ? window.location.search : ''))
  // The face on the page. A reader who has never picked one reads V2's new
  // default in V2 and the face today's reader has always set in V1.
  const [isPhone, setIsPhone] = useState(() => readPhoneSurface(layoutOverride))
  const [showPhoneChrome, setShowPhoneChrome] = useState(() => {
    const phone = readPhoneSurface(layoutOverride)
    return readPhoneFooter(layoutOverride, phone)
  })
  const [pageTurnAffordance, setPageTurnAffordance] = useState(() => readPageTurnAffordance(layoutOverride))
  const appearanceProfile: LabAppearanceProfile = showPhoneChrome ? 'phone' : 'desktop'
  // The full-screen call interface is Chrome V2, phone only. Every other
  // surface keeps the conversation overlay it ships with, untouched.
  // Chrome V2 models Talk as a call on both platforms: the reader's own
  // `callOpen` intent, an anchor for their place, and one `LabCallView`. The
  // phone draws it full screen; the desktop draws it in the companion panel
  // (or, minimized, as a pill) — see the 2026-09-11 voice surface brief.
  const voiceCallSurface = chromeV2
  const voiceCallSurfaceRef = useRef(voiceCallSurface)
  voiceCallSurfaceRef.current = voiceCallSurface
  const voicePanelSurface = chromeV2 && !showPhoneChrome
  const [readerHandoff] = useState(() => source ? null : consumeLabReaderHandoffForPage())
  const { user: authUser, likelyAuthenticated } = useAuth()
  const boot = bootLabReading(source)
  const [book, setBook] = useState<LabSource>(() => readerHandoff ? pendingLabSourceForHandoff(readerHandoff) : boot.book)
  const [readerLoadError, setReaderLoadError] = useState('')
  /** A way out of a load error: a Bible chapter another version has. */
  const [readerLoadAction, setReaderLoadAction] = useState<{ label: string; primaryEdition: string } | null>(null)
  const [prefs, setPrefs] = useState<LabPrefs>(() => {
    // Resolve audio only after the handoff identifies the book. Bible defaults
    // would otherwise erase another book's explicit audiobook on reload.
    const stored = readLabPrefs(appearanceProfile)
    const restored = readerHandoff
      ? prefsFromLabReaderHandoff(stored, readerHandoff)
      : prefsFromLabResumePlace(stored, boot.resume)
    const migrated = migrateLabPrefsEditions(restored, book.bookId || 'bible')
    // Fish narration pilot opt-in/out from the URL, applied before the first
    // render so every write of these prefs already carries it.
    const flagged = applyNarrationPilotFlag(migrated, narrationPilotFlag(search ?? (typeof window !== 'undefined' ? window.location.search : '')))
    return syncLabAudioEdition(flagged, book.editions?.length ? book.editions : bibleEditions())
  })
  const bookEditions = selectableLabEditions(
    book.bookId || 'bible',
    book.editions?.length ? book.editions : bibleEditions(),
  )
  const heldPrimary = editionHold(book.bookId || 'bible', prefs.primaryEdition)
  const heldCompare = prefs.compareOpen ? editionHold(book.bookId || 'bible', prefs.compareEdition) : undefined
  const temporaryHold = heldPrimary || heldCompare
  const heldEditionKey = heldPrimary ? prefs.primaryEdition : prefs.compareEdition
  const holdIdentity = (book.bookId || 'bible') + '/' + heldEditionKey
  const [recoveredHold, setRecoveredHold] = useState<string | null>(null)
  const holdRecovery = recoveredHold === holdIdentity
  // The face on the page. A reader who has never picked one reads V2's new
  // default in V2 and the face today's reader has always set in V1.
  const isShakespeare = getBook(book.bookId || 'bible')?.author === 'William Shakespeare'
  // Tablet reader chrome can look like a phone. Flowing verse is a physical
  // phone preference, independent of that responsive chrome breakpoint.
  const phoneShakespeare = isPhone && isShakespeare && isShakespearePhone()
  const flowingShakespeare = phoneShakespeare && prefs.shakespeareLayout === 'flowing'
  const readingAlignment = prefs.alignmentExplicit === false ? (isShakespeare ? 'left' : 'justify') : prefs.alignment
  const displayPrefs = { ...prefs, alignment: readingAlignment }
  const readingFont = labReadingFont(prefs.fontFamily, chromeV2)
  const [systemDark, setSystemDark] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
  const resolvedDarkMode = prefs.theme === 'dark' || (prefs.theme === 'system' && systemDark)
  const resolvedTheme = prefs.theme === 'system' ? (systemDark ? 'dark' : 'light') : prefs.theme
  const resumeInCompare = !readerHandoff && boot.resume?.readerMode === 'compare'
  const [mobileCompareActive, setMobileCompareActive] = useState(resumeInCompare)
  const [desktopCompareActive, setDesktopCompareActive] = useState(resumeInCompare)
  const [speedPopoverOpen, setSpeedPopoverOpen] = useState(false)
  const [bookSwitcherOpen, setBookSwitcherOpen] = useState(false)
  const [bookSwitcherRows, setBookSwitcherRows] = useState<QuickBookRow[]>([])
  const [bookSwitcherLoading, setBookSwitcherLoading] = useState(false)
  const [bookSwitcherError, setBookSwitcherError] = useState('')
  const bookTitleButtonRef = useRef<HTMLButtonElement>(null)
  const bookSwitcherWasOpenRef = useRef(false)
  useEffect(() => {
    if (!speedPopoverOpen) return
    const outside = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('#lab-audio-speed-popover, [data-testid="lab-hearing-speed"]')) return
      setSpeedPopoverOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSpeedPopoverOpen(false)
    }
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside, true)
      document.removeEventListener('keydown', escape)
    }
  }, [speedPopoverOpen])
  useEffect(() => {
    if (!bookSwitcherOpen) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBookSwitcherOpen(false)
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [bookSwitcherOpen])
  useEffect(() => {
    if (bookSwitcherWasOpenRef.current && !bookSwitcherOpen) bookTitleButtonRef.current?.focus()
    bookSwitcherWasOpenRef.current = bookSwitcherOpen
  }, [bookSwitcherOpen])

  const audioEditionKey = effectiveLabAudioEdition(prefs, bookEditions)
  const audioHeld = isAudioHeld(book.bookId || 'bible', audioEditionKey, book.chapterNumber)
  const audioUnavailable = audioHeld || !resolvedAudioIsAvailable(audioEditionKey, prefs.primaryEdition, bookEditions)
  const [audioUnavailableNotice, setAudioUnavailableNotice] = useState(false)
  useEffect(() => setAudioUnavailableNotice(false), [book.bookId, book.chapterNumber, audioEditionKey])
  const updatePrefs = useCallback((next: LabPrefs) => {
    const synced = syncLabAudioEdition(migrateLabPrefsEditions(next, book.bookId || 'bible'), bookEditions)
    setPrefs(synced)
    writeLabPrefs(synced, appearanceProfile)
  }, [appearanceProfile, book.bookId, bookEditions])
  const applyRemoteVoicePersona = useCallback((voicePersona: 'female' | 'male') => {
    setPrefs(current => {
      if (current.voicePersona === voicePersona) return current
      const next = { ...current, voicePersona }
      writeLabPrefs(next, appearanceProfile)
      return next
    })
  }, [appearanceProfile])
  useVoicePersonaSync({ userId: authUser?.id ?? null, value: prefs.voicePersona, onRemote: applyRemoteVoicePersona })
  // English narration is available across the published catalogue. Female
  // original editions on the verified retention list stay on Bella; all
  // other tuples resolve to the exact on-demand voice returned by the Worker.
  const narrationFlag = narrationPilotFlag(search ?? (typeof window !== 'undefined' ? window.location.search : ''))
  const [narrationInfo, setNarrationInfo] = useState<NarrationPilotInfo | null>(initialNarrationPilotInfo)
  // Once the pilot has been on during this page load the Settings row stays,
  // so "Off" is reversible without the URL flag.
  useEffect(() => {
    let cancelled = false
    void fetchNarrationPilotInfo().then((info) => { if (!cancelled) setNarrationInfo(info) })
    return () => { cancelled = true }
  }, [])
  const narrationVoice = narrationInfo ? resolveNarrationVoice(prefs, narrationInfo.voices) : null
  // Narration follows the text on the page: the primary edition, not the
  // Kokoro audio edition, so painted words and spoken words are one text.
  const narrationApplies = narrationInfo?.enabled === true
    && narrationVoice != null
    && narrationPilotApplies(prefs, book.bookId || 'bible', prefs.primaryEdition, book.chapterNumber, narrationInfo.provider)
  const retainedBella = narrationInfo?.provider !== 'grok' && usesRetainedBella(book.bookId || 'bible', prefs.primaryEdition, prefs.voicePersona)
  const prefsProfileRef = useRef(appearanceProfile)
  useLayoutEffect(() => {
    if (prefsProfileRef.current === appearanceProfile) return
    prefsProfileRef.current = appearanceProfile
    setPrefs(syncLabAudioEdition(
      migrateLabPrefsEditions(readLabPrefs(appearanceProfile), book.bookId || 'bible'),
      bookEditions,
    ))
  }, [appearanceProfile, book.bookId, bookEditions])
  // The book on screen is not known until its source loads (a handoff mounts a
  // placeholder first), so a withdrawn edition is corrected the moment we know
  // which book it belongs to — and written back, so the dead key is gone from
  // storage rather than waiting to break the next request.
  useEffect(() => {
    const migrated = migrateLabPrefsEditions(prefs, book.bookId || 'bible')
    if (migrated !== prefs) updatePrefs(migrated)
  }, [book.bookId, prefs, updatePrefs])
  useEffect(() => {
    releaseLabReaderHandoffForPage(readerHandoff)
    if (readerHandoff) writeLabPrefs(prefs, appearanceProfile)
    // The narration flag was folded into the initial prefs; remember it.
    else if (narrationFlag) writeLabPrefs(prefs, appearanceProfile)
    // This effect only releases the StrictMode bridge after the committed mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [tocOpen, setTocOpen] = useState(false)
  const [contentsConversation, setContentsConversation] = useState<ChatConversation | null>(null)
  const [recentChapterReturn, setRecentChapterReturn] = useState<(LabBookPlace & { libraryBookId: string }) | null>(null)
  const [contentsTarget, setContentsTarget] = useState<(ContentsPlace & { bookId: string; navigation: number; chapterOnly?: boolean; chat?: ChatConversation }) | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [readerControlsVisible, setReaderControlsVisible] = useState(true)
  const [superMenuOpen, setSuperMenuOpen] = useState(false)
  const [superSheet, setSuperSheet] = useState<LabV2SheetLayer | null>(null)
  const [superFirstView, setSuperFirstView] = useState(false)
  const superFirstViewRef = useRef(false)
  const revealOnlyRef = useRef(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(query.matches)
    const onChange = () => setReducedMotion(query.matches)
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])
  // A pointer can be plugged in or unplugged mid-session; re-read it when the
  // capability queries change rather than only at mount.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const onChange = () => setPageTurnAffordance(readPageTurnAffordance(layoutOverride))
    onChange()
    const queries = POINTER_QUERIES.map(query => {
      try { return window.matchMedia(query) } catch { return null }
    })
    for (const query of queries) query?.addEventListener?.('change', onChange)
    return () => { for (const query of queries) query?.removeEventListener?.('change', onChange) }
  }, [layoutOverride])
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
  const [voiceHistoryFixture, setVoiceHistoryFixture] = useState(!chromeV2)
  const [voiceActions, setVoiceActions] = useState<LabVoiceActionEntry[]>([])
  const [inTheBookOpen, setInTheBookOpen] = useState(false)
  const [peekBook, setPeekBook] = useState(false)
  const [phoneAskOpen, setPhoneAskOpen] = useState(false)
  const [phoneKeyboardOpen, setPhoneKeyboardOpen] = useState(false)
  const askInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  /** Rendered page for the companion's reading trail; written once chapter progress is known. */
  const askPageRef = useRef<{ pageNumber: number; totalPages: number } | null>(null)
  /** Words per page held for one leaf geometry, with the leaf it was measured at. */
  const wordsPerPageRef = useRef<{ wordsPerPage: number; leafHeight: number } | null>(null)
  /** Words one desktop leaf holds, measured from the layout by the paginator. */
  const [desktopLeafCapacity, setDesktopLeafCapacity] = useState<LabLeafCapacity | null>(null)
  const playbackInterruptedRef = useRef<() => boolean>(() => false)
  const [gearOpen, setGearOpen] = useState(false)
  const [desktopAskOpen, setDesktopAskOpen] = useState(false)
  const [marks, setMarks] = useState<LabMark[]>([])
  const [focusParagraph, setFocusParagraph] = useState<number | null>(null)
  const [chrome, setChrome] = useState<LabChromeState>('reading')
  // Bible editions keep their own paragraphing (BSB sets poetry line by line):
  // desktop pairs those verse by verse (labVerseAlignment). Only a Bible pair
  // with no shared verse numbers cannot be set side by side.
  const pairedCompareUnavailable = useMemo(() => (book.bookId || 'bible') === 'bible'
    && needsVerseAlignment(book.paragraphs, book.compareParagraphs)
    && !buildVerseAlignment(book.paragraphs, book.compareParagraphs), [book.bookId, book.paragraphs, book.compareParagraphs])
  // Outside the Bible, compare pairs paragraph by paragraph: an edition marked
  // unaligned (Jane Eyre / Pride and Prejudice Danish keep the paragraphing
  // the English editions left on 2026-09-25) cannot be paired on any device.
  const unalignedCompare = (book.bookId || 'bible') !== 'bible'
    && [prefs.primaryEdition, prefs.compareEdition].some(key => bookEditions.find(edition => edition.key === key)?.aligned === false)
  // Bible editions do not all have the same chapters (WEB Catholic has Tobit;
  // the others do not), and Greek Daniel 3 numbers its verses differently from
  // the Hebrew: Compare says so rather than pairing different passages.
  const compareChapterMissing = (book.bookId || 'bible') === 'bible' && prefs.compareOpen
    && !bibleEditionHasChapter(prefs.compareEdition, book.chapterNumber)
  const compareNumberingDiffers = (book.bookId || 'bible') === 'bible' && prefs.compareOpen
    && !bibleVerseNumbersCorrespond(prefs.primaryEdition, prefs.compareEdition, book.chapterNumber)
  const mobileCompareEnabled = showPhoneChrome && prefs.compareOpen && book.compareParagraphs.length > 0 && !unalignedCompare && !compareNumberingDiffers
  const desktopCompareEnabled = !showPhoneChrome && prefs.compareOpen && book.compareParagraphs.length > 0 && !pairedCompareUnavailable && !unalignedCompare && !compareNumberingDiffers
  const readerParagraphs = mobileCompareActive && mobileCompareEnabled
    ? book.compareParagraphs
    : book.paragraphs
  const readerEditionKey = mobileCompareActive && mobileCompareEnabled
    ? prefs.compareEdition
    : prefs.primaryEdition
  // The edition that is not on screen. While Compare is available the reader
  // is always one swipe from it, so it is paginated in the background and the
  // swap has nothing left to measure.
  const standbyParagraphs = mobileCompareActive && mobileCompareEnabled
    ? book.paragraphs
    : book.compareParagraphs
  const standbyEditionKey = mobileCompareActive && mobileCompareEnabled
    ? prefs.primaryEdition
    : prefs.compareEdition
  const primaryEditionLabel = editionLabelFor(prefs.primaryEdition, bookEditions)
  const compareEditionLabel = editionLabelFor(prefs.compareEdition, bookEditions)
  const desktopPaging = chromeV2 && !showPhoneChrome && browserHasNativePaging()
  const desktopSpread = desktopPaging && !desktopCompareActive
  const measuredPaging = (showPhoneChrome || desktopPaging) && browserHasNativePaging()
  const [desktopMeasuredKey, setDesktopMeasuredKey] = useState('')
  const [returnTo, setReturnTo] = useState<LabReturnTo>('reading')
  const [draft, setDraft] = useState('')
  const [askAttachment, setAskAttachment] = useState<{ bookId: string; text: string } | null>(null)
  useEffect(() => {
    setAskAttachment(current => current?.bookId === book.bookId ? current : null)
  }, [book.bookId])
  const [voiceGate, setVoiceGate] = useState<LabVoiceGatePhase>('off')
  // The phone call surface. `callOpen` is the reader's own intent: it stays
  // true through a dropped connection, so a call that lost its transport can
  // say so and offer to reconnect instead of vanishing.
  const [callOpen, setCallOpen] = useState(false)
  const callOpenRef = useRef(false)
  callOpenRef.current = callOpen
  const callAnchorRef = useRef<LabCallAnchor | null>(null)
  const endCallRef = useRef<() => void>(() => {})
  // Desktop only: the panel collapsed to the corner pill. Rendering state; it
  // never touches the session or the reader's place.
  const [callMinimized, setCallMinimized] = useState(false)
  // The paragraph the conversation is about, tinted on the desktop page.
  const [callParagraph, setCallParagraph] = useState<number | null>(null)
  // True from the moment the reader asks for a call until the session reports
  // its first transport fact. It is the only place "no report yet" is read as
  // connecting; after that, no session means no connection.
  const [callAwaitingConnection, setCallAwaitingConnection] = useState(false)
  // Ten shared anonymous AI interactions; opening or reading books never prompts.
  const signedIn = authToken !== undefined ? Boolean(authToken) : (Boolean(authUser) || likelyAuthenticated)
  const [accountPrompt, setAccountPrompt] = useState<LabAccountPromptRequest | null>(null)
  useEffect(() => {
    if (signedIn) {
      setAccountPrompt(null)
      // Signing in spends nothing: the anonymous allowance is handed back, so
      // a later sign-out on the same device starts from ten again.
      clearLabAiActionCount()
    }
  }, [signedIn])
  const signInReturnTo = labCurrentPath()
  const [readingPageIndex, setReadingPageIndex] = useState(
    readerHandoff?.savedPlace?.page ?? boot.resume?.pageIndex ?? 0,
  )
  const [nativePagesRevision, setNativePagesRevision] = useState(0)
  const [nativeMeasuredContent, setNativeMeasuredContent] = useState<string[] | null>(null)
  useLayoutEffect(() => { setNativeMeasuredContent(null) }, [desktopPaging])
  const nativeContentRef = useRef(readerParagraphs)
  nativeContentRef.current = readerParagraphs
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
  const initialFrontispieceRef = useRef(Boolean(readerHandoff && (!readerHandoff.savedPlace || readerHandoff.startAtSavedPlace)))
  const [chapterCoverTitle, setChapterCoverTitle] = useState<string | null>(() => (
    readerHandoff && (!readerHandoff.savedPlace || readerHandoff.startAtSavedPlace) ? book.bookTitle : null
  ))
  const explicitStartAnchor = useMemo(() => (
    readerHandoff?.startAtSavedPlace
      && readerHandoff.savedPlace?.chapterNumber === book.chapterNumber
      ? {
          paragraphIndex: readerHandoff.savedPlace.paragraphIndex ?? 0,
          wordIndex: readerHandoff.savedPlace.wordIndex ?? 0,
        }
      : null
  ), [book.chapterNumber, readerHandoff])
  const [preparationChat, setPreparationChat] = useState(false)
  const [prefaceCoverBook, setPrefaceCoverBook] = useState<string | null>(() => readerHandoff && readCoverTransition(readerHandoff.bookId) ? readerHandoff.bookId : null)
  const [preparationCompanion, setPreparationCompanion] = useState(false)
  const preparationReturnRef = useRef<string | null>(null)
  const returnToPreparation = useCallback(() => {
    const origin = preparationReturnRef.current
    preparationReturnRef.current = null
    setPreparationCompanion(false)
    if (origin !== book.bookId) return false
    setPrefaceCoverBook(origin)
    setPreparationChat(false)
    return true
  }, [book.bookId])
  useEffect(() => {
    if (preparationReturnRef.current && preparationReturnRef.current !== book.bookId) {
      preparationReturnRef.current = null
      setPreparationCompanion(false)
      setPreparationChat(false)
    }
  }, [book.bookId])
  const approvedPreface = chromeV2 ? getBookPreface(book.bookId || 'bible') : undefined
  const prefaceVisible = Boolean(approvedPreface && prefaceCoverBook === book.bookId && !preparationCompanion)
  const pendingMapHighlightRef = useRef<LabHighlight | null>(null)
  const [openAtEnd, setOpenAtEnd] = useState(false)
  const [pageMetrics, setPageMetrics] = useState<LabPageMetrics | null>(null)
  const [readingPages, setReadingPages] = useState<ChapterHearingPage[]>(() => {
    const pages = chapterHearingPages(readerParagraphs, null)
    return explicitStartAnchor ? splitLabPagesAtAnchor(pages, explicitStartAnchor) : pages
  })
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
  /**
   * The standby edition's page map, measured off-screen and keyed by the
   * layout it was measured in. A swap reads it instead of paginating, so the
   * incoming page is committed in the same paint as everything else.
   */
  const standbyPagesRef = useRef<{ key: string; pages: ChapterHearingPage[] } | null>(null)
  /**
   * The page map a swap has just committed, with the paragraphs it belongs
   * to. The content-change effect below re-paginates whenever the reader's
   * paragraphs change — which a swap is — and its estimate would overwrite
   * the measured map for the one frame before the native pass restores it.
   * That overwrite is what the reader saw as the flicker.
   */
  const swapCommittedRef = useRef<{ paragraphs: string[]; pages: ChapterHearingPage[] } | null>(null)
  /**
   * Phone Compare's passage: the compare edition's equivalent [start, end) of
   * the main page the flip started from, and the main place to return to
   * from its first page. Every compare page map is cut to it (when it fits a
   * page) so re-measuring cannot undo the cut.
   */
  const comparePassageRef = useRef<{ paragraphs: string[]; start: LabCompareAnchor; end: LabCompareAnchor; entryPlace: LabCompareAnchor } | null>(null)
  const [comparePageEnd, setComparePageEnd] = useState<{ paragraphs: string[]; at: LabCompareAnchor } | null>(null)
  const withComparePassage = useCallback((pages: ChapterHearingPage[], paragraphs: string[]) => {
    const passage = comparePassageRef.current
    return passage && passage.paragraphs === paragraphs ? labComparePassagePages(pages, passage.start, passage.end).pages : pages
  }, [])
  /** The transient pill that names the version just swapped to. */
  const [versionPill, setVersionPill] = useState<{ label: string; nonce: number } | null>(null)
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

  // The passage belongs to one flip: it ends when Compare does.
  useEffect(() => {
    if (mobileCompareActive) return
    comparePassageRef.current = null
    setComparePageEnd(null)
  }, [mobileCompareActive])

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
    ? { paragraphIndex: readerHandoff.savedPlace?.paragraphIndex ?? 0, wordIndex: readerHandoff.savedPlace?.wordIndex ?? 0 }
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
  const startHearingRef = useRef<() => void>(() => {})
  const resumeListenRef = useRef<(forceAudio?: boolean) => void>(() => {})
  const setSpeedRef = useRef<(rate: number) => void>(() => {})
  const listenSpeedRef = useRef(1)
  const skipRef = useRef<(kind: LabPlaybackSkip) => void | LabPlaybackNavigationOutcome | Promise<void | LabPlaybackNavigationOutcome>>(() => {})

  const openLabVoiceView = useCallback((view: VoiceTinctView) => {
    if (chromeV2 && view === 'read') {
      endCallRef.current()
      return
    }
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
  }, [chromeV2, showPhoneChrome])

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
      userId: authUser?.id ?? null,
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
    signedIn,
    onAccountPrompt: (request) => {
      setAccountPrompt(request)
      // Keep the unsent question in the composer; a held-back Talk never connects.
      if (request.text) setDraft(request.text)
      if (request.action === 'voice') setVoiceGate('off')
    },
    bookId: book.bookId || 'bible',
    editionKey: readerEditionKey,
    conversationId: chromeV2 && contentsConversation?.bookId === (book.bookId || 'bible') && contentsConversation.chapterNumber === book.chapterNumber ? contentsConversation.id : undefined,
    chapterCount: book.chapters.length,
    getPage: () => askPageRef.current,
    playbackInterrupted: () => playbackInterruptedRef.current(),
    onResumeListen: forceAudio => resumeListenRef.current(forceAudio),
    onSetPlaybackSpeed: (rate) => setSpeedRef.current(rate),
    onPlaybackSkip: (kind) => skipRef.current(kind),
    userId: authToken !== undefined ? (authToken ? (authUser?.id ?? null) : null) : undefined,
    voiceToolAdapter,
    voiceVersion,
    voicePersona: prefs.voicePersona,
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

  const narrationContextRef = useRef({ bookId: listenSource.bookId, editionKey: prefs.primaryEdition, chapter: listenSource.chapterNumber, paragraphs: listenSource.paragraphs, voice: narrationVoice })
  narrationContextRef.current = { bookId: listenSource.bookId, editionKey: prefs.primaryEdition, chapter: listenSource.chapterNumber, paragraphs: listenSource.paragraphs, voice: narrationVoice }
  const narrationEnsure = useCallback(async (indexes: number[], signal: AbortSignal, mode?: 'next' | 'all', fromChunks?: Record<number, number>) => {
    const context = narrationContextRef.current
    if (!context.voice) return []
    const token = authToken ?? await readSupabaseAccessToken()
    return ensureNarration({
      bookId: context.bookId,
      editionKey: context.editionKey,
      chapter: context.chapter,
      voice: context.voice,
      paragraphs: indexes
        .filter(index => index >= 0 && index < context.paragraphs.length)
        .map(index => ({ index, text: context.paragraphs[index], fromChunk: fromChunks?.[index] })),
      mode: mode ?? 'next',
    }, { signal, authToken: token })
  }, [authToken])
  const narrationOption = useMemo(
    () => (narrationApplies && narrationVoice ? { voice: narrationVoice, ensure: narrationEnsure } : null),
    [narrationApplies, narrationVoice, narrationEnsure],
  )
  const listen = useLabListen({
    guardPlaybackRequests: chromeV2,
    playbackUnavailable: Boolean(temporaryHold) || (narrationInfo?.provider === 'grok' && prefs.primaryEdition.endsWith('-en') ? !narrationOption : narrationOption || retainedBella ? false : audioUnavailable),
    bookId: listenSource.bookId,
    bookTitle: book.bookTitle,
    chapterTitle: book.chapterLabel,
    coverSrc: `/covers/v2/${book.bookId || 'bible'}.webp`,
    paragraphs: listenSource.paragraphs,
    followParagraphs: listenSource.followParagraphs,
    chapterNumber: listenSource.chapterNumber,
    audioEdition: narrationOption || retainedBella ? prefs.primaryEdition : audioEditionKey,
    narration: narrationOption,
    playbackSpeed: prefs.audioSpeed,
    onPlaybackSpeedChange: (audioSpeed) => updatePrefs({ ...prefs, audioSpeed }),
    titleClip: listenSource.audioTitle,
    onChapterComplete: () => audioChapterCompleteRef.current(),
  })
  listenSpeedRef.current = listen.speed
  listenPlayingRef.current = listen.playing
  // Warm narration ahead of the reader: the chapter's opening on arrival, the
  // next chapter's opening when the reader nears the end of this one.
  const narrationCurrentParagraph = listen.playing && listen.follow.kind !== 'none'
    ? listen.follow.paragraphIndex
    : (readingPages[readingPageIndex]?.paragraphIndex ?? 0)
  useNarrationPrefetch({
    active: !temporaryHold && Boolean(narrationOption) && listen.playing && listenSource.bookId === (book.bookId || 'bible') && listenSource.chapterNumber === book.chapterNumber,
    voice: narrationVoice,
    bookId: book.bookId || 'bible',
    editionKey: prefs.primaryEdition,
    chapter: book.chapterNumber,
    nextChapter: nextLabChapter(book.chapters, book.chapterNumber),
    paragraphCount: book.paragraphs.length,
    currentParagraph: narrationCurrentParagraph,
    speed: listen.speed,
    authToken,
    readToken: readSupabaseAccessToken,
  })

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

  const handoffWritesSuspended = Boolean(
    readerHandoff
    && ((book.bookId || 'bible') !== readerHandoff.bookId || book.paragraphs.length === 0),
  )
  // A resolved place in another chapter is loading; the reader keeps its
  // resolving state (no chapter heading, no passage) until it lands.
  const [remoteResumePending, setRemoteResumePending] = useState(false)
  // Set by the first tap, key or wheel on the reader; a cloud record that
  // lands after that never moves the page.
  const interactionRef = useRef(false)
  const { notePlace, initialPositionResolved, biblicalBook, finishedChapters, markChapterFinished, readPositionState } = useLabPositionSync({
    book,
    placeRef,
    readerStateRef,
    sourceLocked: Boolean(source || readerHandoff),
    resolveBeforePaint: chromeV2,
    writesSuspended: Boolean(temporaryHold) || prefaceVisible || Boolean(chapterCoverTitle) || handoffWritesSuspended || remoteResumePending || Boolean(readerLoadError) || (chromeV2 && tocOpen),
    authToken,
    // Same shape the reading-memory hook takes: an explicit token means an
    // explicit identity, so the position record is reconciled against the
    // same account the memory is.
    ownerId: authToken !== undefined ? (authToken ? (authUser?.id ?? null) : null) : undefined,
    interactedRef: interactionRef,
    onResolvedPlace: (place) => {
      restorePlaceRef.current = { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
      placeRef.current = { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
      restorePageRef.current = null
      if (pagesStableRef.current && readingPagesRef.current.length > 0) {
        const idx = pageIndexForPlace(readingPagesRef.current, place.paragraphIndex, place.wordIndex)
        restorePlaceRef.current = null
        pageAnchorRef.current = chromeV2 ? { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex } : pageAnchorOf(readingPagesRef.current[idx])
        readingPageIndexRef.current = idx
        setReadingPageIndex(idx)
      }
    },
    onRemoteResume: (place) => {
      // The place names the book to load: a biblical pin is the Bible, a
      // registry pin is that book (never this book's loader with another
      // book's chapter number: a Crito 3 pin must not open Genesis 3).
      const currentLibraryBookId = book.bookId || 'bible'
      const selection = remoteResumeSelection(place, { libraryBookId: currentLibraryBookId, prefs })
      if (!selection) return
      setChapterCoverTitle(null)
      // Own the reader like any chapter navigation: an older in-flight load
      // (the local chapter, an edition change) must not land after this one.
      const navigation = ++chapterNavigationRef.current
      setRemoteResumePending(true)
      void loadLabBookSource({
        readingFirst: chromeV2,
        bookId: selection.bookId,
        chapterNumber: place.sequentialChapter,
        primaryEditionKey: selection.primaryEditionKey,
        compareEditionKey: selection.compareEditionKey,
        audioEditionKey: selection.bookId === currentLibraryBookId ? audioEditionKey : undefined,
      }).then((loaded) => {
        if (navigation !== chapterNavigationRef.current) return
        if (loaded.chapterNumber !== place.sequentialChapter || !loaded.paragraphs.length) {
          throw new Error('Resume chapter unavailable')
        }
        // Install the anchor only with its own chapter. An outgoing native
        // measurement must never consume the incoming chapter's saved word.
        const paragraphIndex = Math.min(place.paragraphIndex, loaded.paragraphs.length - 1)
        const wordIndex = Math.min(place.wordIndex, Math.max(0, tokenizeHearingWords(loaded.paragraphs[paragraphIndex]).length - 1))
        restorePlaceRef.current = { paragraphIndex, wordIndex }
        placeRef.current = restorePlaceRef.current
        restorePageRef.current = null
        setReaderLoadError('')
        if (selection.prefs !== prefs) updatePrefs(selection.prefs)
        setBook(loaded)
      }).catch(() => {
        if (navigation === chapterNavigationRef.current) setReaderLoadError('Your saved chapter is temporarily unavailable. Please reload to try again.')
      }).finally(() => {
        if (navigation === chapterNavigationRef.current) setRemoteResumePending(false)
      })
    },
  })
  const initialResolving = !initialPositionResolved || remoteResumePending
  const positionWritesSuspended = Boolean(temporaryHold) || prefaceVisible || Boolean(chapterCoverTitle) || handoffWritesSuspended || initialResolving || Boolean(readerLoadError)
  // The library's first paint comes from a snapshot (labLibraryBoot.ts). The
  // reader knows the account and the place: hand them over when leaving for
  // the library and whenever the page is hidden, so the library never has to
  // wait for the network to show "Reading now".
  const rememberLibraryPlace = useCallback(() => {
    if (positionWritesSuspended || readerLoadError || book.paragraphs.length === 0) return
    const userId = authUser?.id ?? (authToken === undefined ? readCachedSupabaseUser()?.id ?? null : null)
    writeLabLibraryBootSnapshot(snapshotWithReaderPlace(readLabLibraryBootSnapshot(), {
      userId,
      bookId: book.bookId || 'bible',
      title: book.bookTitle,
      chapterLabel: book.chapterLabel,
      now: Date.now(),
    }))
  }, [authToken, authUser?.id, book.bookId, book.bookTitle, book.chapterLabel, book.paragraphs.length, positionWritesSuspended, readerLoadError])
  const rememberLibraryPlaceRef = useRef(rememberLibraryPlace)
  rememberLibraryPlaceRef.current = rememberLibraryPlace
  useEffect(() => {
    const onHide = () => rememberLibraryPlaceRef.current()
    const onVisibility = () => { if (document.visibilityState === 'hidden') onHide() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onHide)
    }
  }, [])

  const rowsForQuickCatalogue = useCallback((catalogue: QuickBookCatalogueEntry[]) => {
    try {
      const viewer = authToken !== undefined
        ? (authToken ? (authUser?.id ?? null) : null)
        : (authUser?.id ?? null)
      const local = accountLabPositionRecord(readLabPositionLocal(), null, viewer)
      const positions = quickBookPositions(local, catalogue, key => localStorage.getItem(key))
      return quickBookRows({
        catalogue,
        positions,
        memory: readDeviceReadingMemory(),
        viewer,
        completedBookIds: quickBookCompletedIds(localStorage),
      })
    } catch {
      return []
    }
  }, [authToken, authUser?.id])

  const openBookSwitcher = useCallback(() => {
    if (showPhoneChrome && !readerControlsVisible && !tocOpen) {
      setReaderControlsVisible(true)
      return
    }
    setGearOpen(false)
    setTocOpen(false)
    setSuperMenuOpen(false)
    setSuperSheet(null)
    setReaderControlsVisible(true)
    setBookSwitcherError('')
    setBookSwitcherOpen(true)
    const fallback = quickCatalogueFallback(book)
    setBookSwitcherRows(rowsForQuickCatalogue(fallback))
    setBookSwitcherLoading(true)
    void fetch('/lab/catalogue.json')
      .then(async response => {
        if (!response.ok) throw new Error(String(response.status))
        const payload = await response.json() as { books?: QuickBookCatalogueEntry[] }
        if (!Array.isArray(payload.books)) throw new Error('Invalid catalogue')
        setBookSwitcherRows(rowsForQuickCatalogue(payload.books))
      })
      .catch(() => setBookSwitcherError('Showing books saved on this device.'))
      .finally(() => setBookSwitcherLoading(false))
  }, [book, readerControlsVisible, rowsForQuickCatalogue, showPhoneChrome, tocOpen])

  const switchQuickBook = useCallback((row: QuickBookRow) => {
    const intent = continueHandoff(row.target)
    if (!intent) {
      setBookSwitcherError('That saved place is temporarily unavailable.')
      return
    }
    // Persist the outgoing coherent tuple before the document navigation. The
    // handoff then installs the selected book and its own tuple together.
    notePlace('hide')
    rememberLibraryPlace()
    try { sessionStorage.setItem(LAB_READER_HANDOFF_KEY, JSON.stringify(intent)) } catch {
      setBookSwitcherError('That saved place is temporarily unavailable.')
      return
    }
    setBookSwitcherOpen(false)
    window.location.assign(`/reader${readerPreviewSearch(window.location.search)}`)
  }, [notePlace, rememberLibraryPlace])

  useEffect(() => {
    const root = labRootRef.current
    if (!root) return
    const mark = () => { interactionRef.current = true }
    const options: AddEventListenerOptions = { capture: true, passive: true }
    root.addEventListener('pointerdown', mark, options)
    root.addEventListener('keydown', mark, options)
    root.addEventListener('wheel', mark, options)
    root.addEventListener('touchstart', mark, options)
    return () => {
      root.removeEventListener('pointerdown', mark, options)
      root.removeEventListener('keydown', mark, options)
      root.removeEventListener('wheel', mark, options)
      root.removeEventListener('touchstart', mark, options)
    }
  }, [])

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
    const prevRootBackground = root.style.backgroundColor
    const prevBodyBackground = document.body.style.backgroundColor
    const existingThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const themeColor = existingThemeColor ?? document.createElement('meta')
    const previousThemeColor = themeColor.getAttribute('content')
    if (!existingThemeColor) {
      themeColor.name = 'theme-color'
      document.head.appendChild(themeColor)
    }
    root.setAttribute('data-theme', resolvedTheme)
    root.style.colorScheme = resolvedDarkMode ? 'dark' : 'light'
    themeColor.content = resolvedTheme === 'dark' ? '#171411' : resolvedTheme === 'book' ? '#e7dcc7' : '#f2eee4'
    root.style.backgroundColor = themeColor.content
    document.body.style.backgroundColor = themeColor.content
    return () => {
      root.setAttribute('data-theme', prev ?? 'light')
      root.style.colorScheme = prevColorScheme
      root.style.backgroundColor = prevRootBackground
      document.body.style.backgroundColor = prevBodyBackground
      if (!existingThemeColor) themeColor.remove()
      else if (previousThemeColor == null) themeColor.removeAttribute('content')
      else themeColor.content = previousThemeColor
    }
  }, [resolvedDarkMode, resolvedTheme])

  useEffect(() => {
    if (source) {
      markReaderLoadTrace('required_text_ready', { outcome: 'success' })
      chapterNavigationRef.current += 1
      setChapterCoverTitle(null)
      setBook(source)
      return
    }
    let cancelled = false
    const navigation = ++chapterNavigationRef.current
    const wanted = chapterNumberRef.current
    const activeBookId = book.bookId || 'bible'
    const primaryEditionKey = (getBook(activeBookId)?.editions || bookEditions).some(edition => edition.key === prefs.primaryEdition)
      ? prefs.primaryEdition
      // New readers arrive with an edition (library handoff, Bible default);
      // a resumed place without one predates edition keys and reads the original.
      : savedPlaceFallbackEditionKey(activeBookId, bookEditions)
    if (!primaryEditionKey) {
      setReaderLoadError('This book does not currently have a readable edition.')
      return
    }
    if (activeBookId === 'bible' && !bibleEditionHasChapter(primaryEditionKey, wanted)) {
      // Never show another chapter in its place: say which version has it.
      const title = book.chapters.find(chapter => chapter.number === wanted)?.title || 'This chapter'
      const holder = bookEditions.find(edition => bibleEditionHasChapter(edition.key, wanted))
      const missingFrom = bookEditions.find(edition => edition.key === primaryEditionKey)
      setReaderLoadError(`${title} isn’t in the ${missingFrom ? readerEditionLabel(missingFrom) : primaryEditionKey}.`)
      setReaderLoadAction(holder ? { label: `Read it in the ${readerEditionLabel(holder)}`, primaryEdition: holder.key } : null)
      return
    }
    setReaderLoadAction(null)
    const compareEditionKey = prefs.compareOpen
      && prefs.compareEdition !== primaryEditionKey
      && (getBook(activeBookId)?.editions || bookEditions).some(edition => edition.key === prefs.compareEdition)
      ? prefs.compareEdition
      : undefined
    markReaderLoadTrace('required_text_start', { startOf: 'required_text' })
    loadLabBookSource({
        readingFirst: chromeV2,
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
      markReaderLoadTrace('required_text_ready', { endOf: 'required_text', outcome: 'success' })
    }).catch((error) => {
      if (!cancelled && navigation === chapterNavigationRef.current) {
        markReaderLoadTrace('required_text_error', { endOf: 'required_text', outcome: 'error' })
        console.warn('[labReader] Failed to load selected edition', error)
        setReaderLoadError('This edition is temporarily unavailable. Choose another edition from settings or return to the library.')
      }
    })
    return () => { cancelled = true }
  }, [source, book.bookId, bookEditions, prefs.primaryEdition, prefs.compareEdition, prefs.compareOpen, audioEditionKey])

  useEffect(() => {
    markReaderLoadTrace('fonts_start', { startOf: 'fonts' })
    let cancelled = false
    void Promise.resolve(document.fonts?.ready).then(() => {
      if (!cancelled) markReaderLoadTrace('fonts_ready', { endOf: 'fonts', outcome: 'success' })
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!book.supplement) return
    let cancelled = false
    void book.supplement.then(supporting => {
      if (!cancelled) setBook(current => current === book ? { ...current, ...supporting, supplement: undefined } : current)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [book])

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
  // Edition titles may differ for the same chapter. Treat only book/chapter
  // navigation as a chapter change so switching language preserves place.
  const chapterKey = `${book.bookId}:${book.chapterNumber}`
  const chapterKeyRef = useRef(chapterKey)
  const chapterContentRef = useRef(readerParagraphs)

  useLayoutEffect(() => {
    const chapterChanged = chapterKeyRef.current !== chapterKey
    const contentChanged = chapterContentRef.current !== readerParagraphs
    chapterKeyRef.current = chapterKey
    chapterContentRef.current = readerParagraphs
    if (chapterChanged || contentChanged) {
      pagesStableRef.current = false
      didBudgetPageRef.current = false
      unmeasuredTriesRef.current = 0
      setSettleIndex(measuredPaging ? null : 0)
      settleIndexRef.current = measuredPaging ? null : 0
    }
    if (readerParagraphs.length === 0) return
    const budget = pageMetrics ? labPageBudgetFromMetrics(pageMetrics) : null
    if (canUseLabPageBudget(budget)) didBudgetPageRef.current = true
    const settledPrimaryPages = contentChanged && !mobileCompareActive
      ? mobilePrimaryPagesRef.current
      : null
    // Entering Compare is the mirror of leaving it: the map is already
    // settled, so it is adopted rather than estimated again.
    const swapped = contentChanged && swapCommittedRef.current?.paragraphs === readerParagraphs
      ? swapCommittedRef.current.pages
      : null
    const naturalNext = settledPrimaryPages
      ?? swapped
      ?? chapterHearingPages(readerParagraphs, canUseLabPageBudget(budget) ? budget : null)
    const next = withComparePassage(explicitStartAnchor ? splitLabPagesAtAnchor(naturalNext, explicitStartAnchor) : naturalNext, readerParagraphs)
    swapCommittedRef.current = null
    if (settledPrimaryPages || swapped) {
      if (settledPrimaryPages) mobilePrimaryPagesRef.current = null
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
        // A draft page boundary is not the saved reading place. Carry the
        // exact word through to the font-settled paginator on refresh.
        pageAnchorRef.current = chromeV2 ? place : pageAnchorOf(next[idx])
        readingPageIndexRef.current = idx
        setReadingPageIndex(idx)
      } else if (!measuredPaging && restorePageRef.current != null) {
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
  }, [book.chapterNumber, book.bookId, chapterKey, mobileCompareActive, readerParagraphs, measuredPaging])

  useEffect(() => {
    mobilePrimaryPagesRef.current = null
  }, [book.bookId, book.chapterNumber, readingFont, prefs.fontSize, readingAlignment, flowingShakespeare, prefs.lineSpacing, prefs.margins, prefs.paragraphSpacing])

  useLayoutEffect(() => {
    if (measuredPaging) return
    if (!pageMetrics || didBudgetPageRef.current || pagesStableRef.current) return
    if (readerParagraphs.length === 0) return
    const budget = labPageBudgetFromMetrics(pageMetrics)
    if (!canUseLabPageBudget(budget)) return
    didBudgetPageRef.current = true
    const naturalNext = chapterHearingPages(readerParagraphs, budget)
    const next = withComparePassage(explicitStartAnchor ? splitLabPagesAtAnchor(naturalNext, explicitStartAnchor) : naturalNext, readerParagraphs)
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
  }, [pageMetrics, readerParagraphs, measuredPaging])

  useLayoutEffect(() => {
    didBudgetPageRef.current = false
    pagesStableRef.current = false
    unmeasuredTriesRef.current = 0
    setSettleIndex(measuredPaging ? null : 0)
    settleIndexRef.current = measuredPaging ? null : 0
  }, [readingFont, prefs.fontSize, readingAlignment, flowingShakespeare, prefs.lineSpacing, prefs.margins, prefs.paragraphSpacing, measuredPaging])

  const lastVvRef = useRef(0)
  const lastBarTopRef = useRef(0)
  const lastAdjustRef = useRef<LabPageAdjust>(null)
  const beforeGrowPagesRef = useRef<ChapterHearingPage[] | null>(null)
  const highlightsApi = useLabHighlights(book.chapterNumber, chromeV2 ? { bookId: book.bookId || 'bible', editionKey: prefs.primaryEdition, paragraphs: book.paragraphs, compareEditionKey: prefs.compareEdition, compareParagraphs: book.compareParagraphs } : undefined)
  const primaryCharacters = useCharacterCards(book.bookId, prefs.primaryEdition)
  // Verifying cards downloads their complete source edition. Do not fetch an
  // unused second book alongside the chapter when Compare is disabled.
  const compareCharacters = useCharacterCards(prefs.compareOpen ? book.bookId : undefined, prefs.compareEdition)
  const define = useDefine()
  const [selectionPopup, setSelectionPopup] = useState<(SelectionInfo & { range?: LabHighlightRange; editionKey?: string; side?: 'compare'; defineText?: string }) | null>(null)
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

  const applyNativePages = useCallback((incoming: ChapterHearingPage[], measuredContent?: string[]) => {
    if (measuredContent && measuredContent !== nativeContentRef.current) return
    // A native column can place the final words of the author's note and the
    // opening words on one leaf. Cutting that leaf at the explicit start would
    // leave an eight-word page. Rebuild only this share-link session from the
    // measured page budget so the requested paragraph begins a normally filled
    // page; ordinary reader sessions continue to adopt the native map verbatim.
    const explicitBudget = pageMetricsRef.current ? labPageBudgetFromMetrics(pageMetricsRef.current) : null
    const explicitPages = explicitStartAnchor
      ? chapterHearingPages(nativeContentRef.current, canUseLabPageBudget(explicitBudget) ? explicitBudget : null)
      : null
    const next = withComparePassage(explicitStartAnchor && explicitPages
      ? splitLabPagesAtAnchor(explicitPages, explicitStartAnchor)
      : incoming, nativeContentRef.current)
    // Audio chrome temporarily changes the available box. Keep the reading
    // page map as the single authority instead of repaginating mid-playback.
    // V1's bar never changes height, so a page map that arrives mid-playback
    // is noise and is dropped. V2's transport opens and closes over the page,
    // and the column changes height with it: the new map is taken, anchored
    // on the word being spoken, so the reader stays on their paragraph and
    // follow resolves the right page of the new map on its next tick.
    const playing = listenPlayingRef.current
    if (
      !measuredPaging
      || (playing && !chromeV2)
      || (browseWhileListeningRef.current && !chromeV2)
      || next.length === 0
    ) return
    setNativeMeasuredContent(measuredContent ?? nativeContentRef.current)
    const current = readingPagesRef.current
    const working = workingPagesRef.current
    const currentIndex = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, current.length - 1)))
    // The first native map replaces an estimated map. Restore from the saved
    // word itself, never from the estimated page that happened to contain it.
    const restoring = chromeV2 && restorePlaceRef.current
      && next.some(page => chapterPageSegments(page).some(segment => segment.paragraphIndex === restorePlaceRef.current!.paragraphIndex))
      ? restorePlaceRef.current : null
    if (restoring) {
      pageAnchorRef.current = restoring
      restorePlaceRef.current = null
    }
    const keep = restoring ?? (playing && !browseWhileListeningRef.current
      ? (placeRef.current ?? pageAnchorRef.current)
      : (mobileCompareReturnPlaceRef.current ?? pageAnchorRef.current ?? pageAnchorOf(current[currentIndex])))
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
  }, [chromeV2, explicitStartAnchor, measuredPaging, withComparePassage])

  /**
   * The standby map, off the critical path entirely: a ref write, no state,
   * so measuring the edition nobody is reading can never cause a render.
   */
  const applyStandbyPages = useCallback((pages: ChapterHearingPage[]) => {
    if (pages.length === 0) return
    standbyPagesRef.current = { key: standbyKeyRef.current, pages }
  }, [])

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
      bookId: book.bookId || 'bible',
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
    settleIndexRef.current = measuredPaging ? null : 0
    setSettleIndex(measuredPaging ? null : 0)
  }, [book.chapterTitle, measuredPaging])

  useLayoutEffect(() => {
    if (measuredPaging) return
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
      if (keep && !chromeV2) pages = ensurePageIdentity(pages, keep)
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
  }, [settleIndex, draftPages, phoneAskOpen, readerParagraphs, book.chapterTitle, measuredPaging])

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
        !measuredPaging
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
  }, [isPhone, showPhoneChrome, listen.playing, chrome, phoneAskOpen, readerControlsVisible, gearOpen, readingFont, prefs.fontSize, readingAlignment, flowingShakespeare, prefs.lineSpacing, prefs.margins, prefs.paragraphSpacing, fullscreen, measuredPaging])

  useLayoutEffect(() => {
    if (
      (measuredPaging ? nativePagesRevision === 0 : !pagesStableRef.current)
      || phoneAskOpen
      || listenPlayingRef.current
      || browseWhileListeningRef.current
    ) return
    const wrap = pageWrapRef.current
    const chromeEl = bottomChromeRef.current
    if (!wrap || !chromeEl) return
    const passage = [...wrap.querySelectorAll('.lab-passage')]
      .find(el => !el.closest('.lab-page-measure')) as HTMLElement | undefined
    if (!passage || (measuredPaging && nativeMeasuredContent !== readerParagraphs)) return
    if (desktopPaging) return
    const painted = measureVisiblePageOverflow(wrap, passage, chromeEl)
    if (!painted) return

    // Hidden preflight catches most pages. This visible-page check is the final
    // invariant for font/browser rounding differences on a page turn.
    const pageIdx = Math.max(0, Math.min(readingPageIndexRef.current, readingPagesRef.current.length - 1))
    if (measuredPaging) {
      const pages = readingPagesRef.current
      // The native chapter map already supplies a complete page. Growing it
      // word by word here causes repeated synchronous layouts before paint
      // and changes later page boundaries on every navigation.
      if (labPageFitsPaint(painted)) return

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
  }, [readingPageIndex, readingPages, nativePagesRevision, nativeMeasuredContent, phoneAskOpen, listen.playing, browseWhileListening, measuredPaging, readerControlsVisible, gearOpen, chrome, readerParagraphs, book.chapterNumber])

  useEffect(() => {
    // A queued effect may still hold the provisional map after measurement
    // has committed a newer one. It must not rewrite the exact saved anchor.
    if (desktopPaging && readingPages !== readingPagesRef.current) return
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
    // Desktop's measured-map commit already resolves the page from the
    // semantic anchor. The legacy passive pass must not quantize it again.
    if (desktopPaging) return
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
  }, [readingPages, openAtEnd, book.chapterNumber, desktopPaging])

  const chromeRef = useRef(chrome)
  chromeRef.current = chrome
  const returnToRef = useRef(returnTo)
  returnToRef.current = returnTo
  const pausedForAskRef = useRef(false)
  playbackInterruptedRef.current = () => pausedForAskRef.current
  const stayInAskRef = useRef(false)
  const phoneAskOpenRef = useRef(phoneAskOpen)
  phoneAskOpenRef.current = phoneAskOpen
  const desktopAskOpenRef = useRef(desktopAskOpen)
  desktopAskOpenRef.current = desktopAskOpen
  const askNoticeRef = useRef(ask.notice)
  askNoticeRef.current = ask.notice

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
    if (chromeV2 && callOpen) {
      // An explicit resume command ends the call successfully. Leaving the
      // surface mounted would mislabel that intentional stop as a disconnect.
      setCallOpen(false)
    }
    ask.stopVoice()
    if (chromeV2) ask.dismissNotice()
    if (!forceHearing && preparationReturnRef.current === book.bookId) {
      stayInAskRef.current = false
      pausedForAskRef.current = false
      setVoiceGate('off')
      setPhoneAskOpen(false)
      setDesktopAskOpen(false)
      setPeekBook(false)
      setChrome('reading')
      returnToPreparation()
      return
    }
    if (forceHearing) { preparationReturnRef.current = null; setPreparationCompanion(false); setPrefaceCoverBook(null) }
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
    const interruptedAudio = pausedForAskRef.current || returnToRef.current === 'hearing'
    const shouldHear = forceHearing || interruptedAudio
    pausedForAskRef.current = false
    if (!shouldHear) {
      setChrome('reading')
      return
    }
    if (chromeV2 && forceHearing && !interruptedAudio) {
      startHearingRef.current()
      return
    }
    setReturnTo('hearing')
    returnToRef.current = 'hearing'
    setChrome('hearing')
    if (chromeV2) {
      // A voice return uses the same source/follow boundary as pressing Play.
      browseWhileListeningRef.current = false
      setBrowseWhileListening(false)
      setInTheBookOpen(false)
    }
    if (listen.src) listen.resume(true)
    else void (chromeV2 ? listen.startAtPlace(placeRef.current) : listen.start(placeRef.current))
  }, [ask, listen, chromeV2, callOpen, book.bookId, returnToPreparation])
  resumeListenRef.current = (forceAudio = true) => resumeListenAfterAsk(forceAudio)
  const closeAccountPrompt = useCallback(() => {
    const request = accountPrompt
    setAccountPrompt(null)
    // A held-back Talk leaves the talking chrome the way a closed Talk does.
    if (request?.action === 'voice') resumeListenAfterAsk()
  }, [accountPrompt, resumeListenAfterAsk])
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
      // A V2 call draws its own desktop panel; the chat pane stays closed.
      if (!(voiceCallSurfaceRef.current && callOpenRef.current)) setDesktopAskOpen(true)
      return
    }
    if (!wasTalking) return
    // The call surface owns its own ending. A dropped connection leaves it
    // standing so it can say "Disconnected" and offer to reconnect; only End
    // conversation (or Reconnect failing) takes it down.
    if (voiceCallSurfaceRef.current && callOpenRef.current) {
      return
    }
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
      // Voice that ended with a notice (mic refused, token missing, timed
      // out) keeps the desktop companion open as Chat, the way the phone
      // sheet stays up, so the reader sees why and can type instead. So does
      // a V2 call the reader handed over to Chat: its chrome is already
      // 'reading' and the companion it opened is Chat's, not Talk's.
      if (!askNoticeRef.current && chromeRef.current === 'talking') setDesktopAskOpen(false)
      setChrome(current => (current === 'talking' ? labAfterTalk(returnToRef.current) : current))
    }
  }, [ask.voiceActive, ask.voiceConnection, resumeListenAfterAsk])

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
  // Typography that reaches the page as root CSS variables; LabPassage
  // re-measures continued page tails only when it changes.
  const layoutKeyFor = (editionKey: string) => [
    book.chapterNumber,
    editionKey,
    readingFont,
    prefs.fontSize,
    readingAlignment, flowingShakespeare,
    prefs.lineSpacing,
    prefs.margins,
    prefs.paragraphSpacing,
    fullscreen ? 'fullscreen' : 'windowed',
  ].join(':')
  const desktopLayoutKey = `${layoutKeyFor(readerEditionKey)}:${desktopCompareActive}:${book.bookId}`
  const applyDesktopPages = useCallback((pages: ChapterHearingPage[], content: string[], key: string, capacity: LabLeafCapacity | null) => {
    applyNativePages(pages, content)
    setDesktopMeasuredKey(key)
    setDesktopLeafCapacity(capacity)
  }, [applyNativePages])
  const standbyKey = layoutKeyFor(standbyEditionKey)
  // Marked only where the passage runs on: a page that ends exactly there needs no mark.
  const comparePageEndMarker = showPhoneChrome && mobileCompareActive && comparePageEnd?.paragraphs === readerParagraphs
    && !readingPages.some(page => {
      const head = pageAnchorOf(page)
      return head?.paragraphIndex === comparePageEnd.at.paragraphIndex && head.wordIndex === comparePageEnd.at.wordIndex
    })
    ? comparePageEnd.at
    : null
  const standbyKeyRef = useRef(standbyKey)
  standbyKeyRef.current = standbyKey
  const readerLayoutKey = [
    readingFont,
    prefs.fontSize,
    readingAlignment, flowingShakespeare,
    prefs.lineSpacing,
    prefs.margins,
    prefs.paragraphSpacing,
  ].join('|')
  // The held words-per-page belongs to one type setting; the leaf height it was
  // measured at is carried with it so a resized leaf re-measures on its own.
  useEffect(() => { wordsPerPageRef.current = null }, [readerLayoutKey])
  const isOnline = readOnline(online)
  const frontispieceVisible = chapterCoverTitle != null
  // The chapter heading appears once, naming the chapter that will be read:
  // not the local guess a cloud record may replace, not the placeholder label
  // of a handoff whose chapter is still loading. A signed-out boot from the
  // device record is final and paints at once.
  const paintedChapterLabel = initialResolving || handoffWritesSuspended ? '' : book.chapterLabel
  const voiceOverlayOpen = showPhoneChrome && !voiceCallSurface && chrome === 'talking' && !phoneAskOpen
  // The full-screen call, and what is left of it while the transcript is open.
  const callFullScreen = voiceCallSurface && showPhoneChrome && callOpen && !phoneAskOpen
  // The desktop conversation: the companion panel, or the pill while minimized.
  const desktopVoiceOpen = voicePanelSurface && callOpen
  const [callStartedAt, setCallStartedAt] = useState(0)
  const callTurns = ask.turns.filter(turn => turn.source === 'voice' && (turn.timestamp ?? 0) >= callStartedAt)
  const callUtterance = labCallUtterance(callTurns)
  const callBookLine = `${book.bookTitle}, ${book.chapterLabel}`
  const callConnection = callAwaitingConnection && ask.voiceConnection === 'idle'
    ? ('connecting' as const)
    : ask.voiceConnection
  const callView = labCallView({
    connection: callConnection,
    activity: ask.conversationState,
    fullDuplex: false,
    micMuted: ask.micMuted,
  })
  // The first transport fact the session reports ends the grace window.
  useEffect(() => {
    if (ask.voiceConnection === 'idle') return
    setCallAwaitingConnection(false)
  }, [ask.voiceConnection])
  // A connect that never lands is a failed call, not a permanent "Connecting."
  useEffect(() => {
    if (!callOpen || callConnection !== 'connecting') return
    const timer = window.setTimeout(() => {
      setCallAwaitingConnection(false)
      ask.failStart()
    }, LAB_CONNECTING_FAIL_MS)
    return () => window.clearTimeout(timer)
  }, [ask.failStart, callConnection, callOpen])
  const phoneAsk = showPhoneChrome && phoneAskOpen
  const showHearing = !(showPhoneChrome && mobileCompareActive) && !peekBook && !phoneAsk && (
    chrome === 'hearing' || (chrome === 'talking' && returnTo === 'hearing')
  )
  const phoneBarPossible = !frontispieceVisible && !fullscreen && labShowPhoneBar({
    phoneChrome: showPhoneChrome,
    fullscreen,
    phoneAsk,
  })
  const [pausedTransportVisible, setPausedTransportVisible] = useState(false)
  useEffect(() => {
    if (!chromeV2) return
    // Desktop errors use a separate inline Retry row. Release the unused
    // playback reserve; the phone error remains above its transport bar.
    if (!showPhoneChrome && listen.narration.status === 'error') setPausedTransportVisible(false)
    else if (listen.playing || listen.pending) setPausedTransportVisible(true)
  }, [chromeV2, showPhoneChrome, listen.playing, listen.pending, listen.narration.status])
  useEffect(() => { setPausedTransportVisible(false) }, [book.bookId, book.chapterNumber])
  const audioBarActive = showPhoneChrome
    && phoneBarPossible
    && !phoneAsk
    && !mobileCompareActive
    && (listen.pending || listen.playing || audioChapterTransitioning || (chromeV2 && pausedTransportVisible))
  const desktopAudioBarActive = !showPhoneChrome && (listen.pending || listen.playing || (chromeV2 && pausedTransportVisible))
  // V2 has no reading bar. Play is in the top bar and Chat, Talk and Compare
  // are in the menu; what the foot holds is the progress line, and the
  // transport for as long as audio plays. The space the bar took goes to the
  // page. V1 keeps the bar it ships with.
  const showPhoneBar = phoneBarPossible && (!chromeV2 || audioBarActive)
  useEffect(() => {
    if (showPhoneChrome ? !audioBarActive : !desktopAudioBarActive) setSpeedPopoverOpen(false)
  }, [audioBarActive, desktopAudioBarActive, showPhoneChrome])
  // V2 lets the chrome hide while audio plays — the transport is what stays
  // on screen, at full opacity, so playback can always be seen and stopped.
  const phoneReaderControlsVisible = readerControlsVisible
    || (!chromeV2 && listen.playing)
    || phoneAsk
    || chrome === 'talking'
    || gearOpen
    || (chromeV2 && (superMenuOpen || superSheet !== null))
  const canPrevChapter = prevLabChapter(book.chapters, book.chapterNumber) != null
  const canNextChapter = nextLabChapter(book.chapters, book.chapterNumber) != null
  const currentOpeningTitle = book.bookTitle === LAB_COPY.bookTitle
    ? bibleBookOpeningTitle(book.chapters, book.chapterNumber)
    : null
  // Desktop spread, not in Compare: when a chapter ends on the left leaf, the
  // right leaf shows the next chapter's opening, cut exactly as that chapter
  // will paginate, instead of a blank page. Not where the next chapter opens a
  // new Bible book: that opens on the book's cover.
  const nextChapterNumber = nextLabChapter(book.chapters, book.chapterNumber)
  const nextChapterTitle = nextChapterNumber != null ? book.chapters.find(chapter => chapter.number === nextChapterNumber)?.title ?? null : null
  const nextOpensBibleBook = book.bookTitle === LAB_COPY.bookTitle && nextChapterNumber != null && bibleBookOpeningTitle(book.chapters, nextChapterNumber) != null
  const nextOpeningKey = chromeV2 && desktopSpread && nextChapterNumber != null && nextChapterTitle && !nextOpensBibleBook && !book.chaptersProvisional
    ? `${book.bookId || 'bible'}:${readerEditionKey}:${nextChapterNumber}`
    : null
  const [nextOpening, setNextOpening] = useState<{ key: string; title: string; paragraphs: string[] } | null>(null)
  const [nextOpeningPage, setNextOpeningPage] = useState<{ key: string; paragraphs: string[]; page: ChapterHearingPage } | null>(null)
  const nextOpeningWordBudget = 3 * (desktopLeafCapacity?.wordsPerPage ?? 400)
  useEffect(() => {
    if (!nextOpeningKey || nextChapterNumber == null || !nextChapterTitle || nextOpening?.key === nextOpeningKey) return
    let live = true
    void loadChapterText({
      bookId: book.bookId || 'bible', editionKey: readerEditionKey, chapterNumber: nextChapterNumber,
      version: typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : undefined,
    }).then(chapter => {
      if (!live || !chapter?.paragraphs.length) return
      // Only the opening is measured: enough text to fill more than one leaf.
      const paragraphs: string[] = []
      let words = 0
      for (const paragraph of chapter.paragraphs) {
        paragraphs.push(paragraph)
        words += tokenizeHearingWords(paragraph).length
        if (words >= nextOpeningWordBudget) break
      }
      setNextOpening({ key: nextOpeningKey, title: nextChapterTitle, paragraphs })
    }).catch(() => {})
    return () => { live = false }
  }, [nextOpeningKey])
  const applyNextOpeningPages = useCallback((pages: ChapterHearingPage[], content: string[], key: string) => {
    setNextOpeningPage(pages[0] ? { key, paragraphs: content, page: pages[0] } : null)
  }, [])
  const showReaderRail = !frontispieceVisible && !fullscreen && (desktopPaging || labShowReaderRail({
    phoneAsk,
    phoneChrome: showPhoneChrome,
    pageCount: Math.max(readingPages.length, draftPages.length, workingPagesRef.current.length),
    playing: listen.playing,
    canPrevChapter,
    canNextChapter,
  }))
  const markedIndexes = useMemo(() => new Set(marks.map(mark => mark.paragraphIndex)), [marks])
  const rawChapterProgress = labChapterProgress({
    paragraphs: readerParagraphs,
    pages: readingPages,
    pageIndex: readingPageIndex,
    paragraphIndex: showHearing && listen.follow.kind === 'word' ? listen.follow.paragraphIndex : readingTail?.paragraphIndex,
    wordIndex: showHearing && listen.follow.kind === 'word' ? listen.follow.wordIndex : readingTail?.to,
  })
  const chapterProgress = clampedChapterProgress(rawChapterProgress)
  askPageRef.current = { pageNumber: chapterProgress.currentPage, totalPages: chapterProgress.totalPages }
  // Durable reading memory: a read-only observer of the rendered tuple. It
  // records sessions for the library recap and never touches position logic.
  useLabReadingMemory({
    bookId: book.bookId || 'bible',
    editionKey: readerEditionKey,
    chapterNumber: book.chapterNumber,
    chapterLabel: book.chapterTitle,
    paragraphs: readerParagraphs,
    pageIndex: readingPageIndex,
    pages: readingPages,
    pagesSettled: measuredPaging ? nativePagesRevision > 0 : settleIndex === null,
    ready: !frontispieceVisible && !positionWritesSuspended && !readerLoadError && readerParagraphs.length > 0 && (!chromeV2 || !tocOpen),
    pageTurnDirection: pageTurn?.direction ?? null,
    finishedChapters,
  })
  // Picker rows: the position record's finished signal cross-checked with
  // reading memory (a `completed` session marks Finished even if the flag was
  // missed; any session or pin marks In progress; a chat in a chapter with no
  // surviving reading record marks Visited). Read when the picker opens.
  const pickerStatuses = useMemo(() => {
    if (!tocOpen) return new Map()
    return labChapterStatuses({
      bookId: book.bookId || 'bible',
      chapterNumbers: book.chapters.map(chapter => chapter.number),
      finished: finishedChapters,
      memory: readDeviceReadingMemory(),
      position: readPositionState(),
      viewer: authUser?.id ?? null,
      conversations: readLabBookChat(book.bookId || 'bible'),
    })
  }, [authUser?.id, book.bookId, book.chapters, finishedChapters, readPositionState, tocOpen])
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
  // Words per page belongs to the layout, not to the chapter in front of the
  // reader. Chapters differ in word length by a few percent, and re-scaling the
  // whole book's page count on every chapter change made the number walk
  // backwards on a page turn. So the first chapter measured in a layout sets
  // the figure and every later chapter reuses it, until the type size or the
  // window changes and it is measured afresh. (A one-page Psalm has no full
  // page of its own to measure, which is the other reason not to ask it.)
  const freshCapacity: { wordsPerPage: number; leafHeight: number } | null = desktopPaging && desktopLeafCapacity !== null
    ? desktopLeafCapacity
    : fullPageWordCounts.length > 0
      ? { wordsPerPage: fullPageWordCounts[Math.floor(fullPageWordCounts.length / 2)], leafHeight: 0 }
      : null
  const held = wordsPerPageRef.current
  if (freshCapacity !== null && (held === null || held.leafHeight !== freshCapacity.leafHeight)) {
    wordsPerPageRef.current = freshCapacity
  }
  const measuredWordsPerPage = wordsPerPageRef.current?.wordsPerPage
    ?? freshCapacity?.wordsPerPage
    ?? Math.max(1, Math.round(chapterProgress.wordsTotal / Math.max(1, chapterProgress.totalPages)))
  const bookWordCount = getBook(book.bookId || 'bible')?.wordCount
  const progressInput = {
    mode: readerProgressMode,
    currentPage: chapterProgress.currentPage,
    totalPages: chapterProgress.totalPages,
    chapterPercent: chapterProgress.percent,
    chapterNumber: book.chapterNumber,
    chapterWordsRead: chapterProgress.wordsRead,
    chapterWordCounts: book.chapters,
    wordsPerPage: measuredWordsPerPage,
    bookWordCount,
  }
  // Printed books, Bibles included, number continuously through the volume.
  // The desktop spread therefore shows the book page, not the chapter page,
  // and the percentage in the foot is derived from the very same estimate so
  // the two figures can never contradict each other.
  const bookPageEstimate = labBookPageEstimate({
    currentPage: chapterProgress.currentPage,
    totalPages: chapterProgress.totalPages,
    chapterNumber: book.chapterNumber,
    chapterWeights: book.chapters,
    wordsPerPage: measuredWordsPerPage,
    bookWordCount,
  })
  // Both of the pill's numbers must come from one measured layout. Words per
  // page is now held across a chapter change, so the book scale no longer
  // moves under the reader — but the pages of the chapter in front of them
  // are still the provisional map for a moment after a chapter turn, and both
  // the chapter pair ("N / M of chapter") and the book estimate are drawn
  // through that M. Crossing Odyssey Book 1 into Book 2 the pill read
  // "68 / 1,891 of book" for as long as a second and a half before settling
  // on "50 / 1,413". So while the map on screen was not measured for the text
  // on screen, the last measured label is held and no pair is shown that no
  // layout produced. The hold is bounded: a measurement that never arrives —
  // audio holds the paginator still — releases the pill rather than freezing
  // it. The desktop leaf folios need no hold; they are already painted only
  // on a measured map.
  const progressMeasured = !measuredPaging || nativeMeasuredContent === readerParagraphs
  const [progressHoldReleased, setProgressHoldReleased] = useState(false)
  useEffect(() => {
    if (progressMeasured) { setProgressHoldReleased(false); return }
    const timer = window.setTimeout(() => setProgressHoldReleased(true), LAB_PROGRESS_HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [progressMeasured])
  const liveProgressLabels = {
    phone: labReaderProgressLabel(progressInput),
    book: readerProgressMode === 'book' ? `${bookPageEstimate.percent}% of book` : `${chapterProgress.percent}% of chapter`,
  }
  const measuredProgressLabelsRef = useRef(liveProgressLabels)
  if (progressMeasured) measuredProgressLabelsRef.current = liveProgressLabels
  const shownProgressLabels = progressMeasured || progressHoldReleased
    ? liveProgressLabels
    : measuredProgressLabelsRef.current
  const phoneProgressLabel = shownProgressLabels.phone
  const desktopProgressLabel = shownProgressLabels.book
  // No figure until the chapter list is real and the place is resolved: the
  // boot list has two chapters and would read "1 / 2 of book" for a moment.
  const footProgressLabel = initialResolving || (book.chaptersProvisional && book.paragraphs.length === 0)
    ? ''
    : showPhoneChrome
      ? phoneProgressLabel
      : chromeV2 ? desktopProgressLabel : desktopPaging ? desktopProgressLabel : `${chapterProgress.currentPage} of ${chapterProgress.totalPages}`

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
        : (followOnReadingPage(follow, readingPages, readingPageIndex) || desktopSpread && followOnReadingPage(follow, readingPages, readingPageIndex + 1))
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
        : (followOnReadingPage(follow, readingPages, readingPageIndex) || desktopSpread && followOnReadingPage(follow, readingPages, readingPageIndex + 1))
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
  }, [listen.follow, readingPages, readingPageIndex, showHearing, showPhoneChrome, desktopSpread, listen.clipIndex, listen.currentTime])

  useEffect(() => {
    if (!showHearing || !listen.playing || browseWhileListeningRef.current) return
    const follow = listen.follow
    if (follow.kind !== 'word' && follow.kind !== 'paragraph') return
    if (!showPhoneChrome && (followOnReadingPage(follow, readingPages, readingPageIndexRef.current) || desktopSpread && followOnReadingPage(follow, readingPages, readingPageIndexRef.current + 1))) return
    const next = follow.kind === 'word'
      ? pageIndexForPlace(readingPages, follow.paragraphIndex, follow.wordIndex)
      : pageIndexForPlace(readingPages, follow.paragraphIndex, 0)
    if (next === readingPageIndexRef.current) return
    const page = readingPages[next]
    const anchor = pageAnchorOf(page)
    if (anchor) pageAnchorRef.current = anchor
    readingPageIndexRef.current = next
    setReadingPageIndex(next)
  }, [readingPages, showHearing, showPhoneChrome, desktopSpread, listen.playing, listen.follow])

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
    if (!el || el.classList.contains('is-lab')) return
    const clamp = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      // The entrance animation scales the popup about its centre, so the
      // painted rect is narrower than the box it settles into. Clamp the
      // resting box: a character card measured mid-fade was pushed only as
      // far as its shrunken width needed and settled flush against the edge.
      const width = el.offsetWidth || rect.width
      const height = el.offsetHeight || rect.height
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const box = { left: cx - width / 2, right: cx + width / 2, top: cy - height / 2, bottom: cy + height / 2 }
      const vw = window.innerWidth
      const vh = window.innerHeight
      const margin = 8
      let dx = 0
      let dy = 0
      if (box.left < margin) dx = margin - box.left
      else if (box.right > vw - margin) dx = (vw - margin) - box.right
      if (box.top < margin) dy = margin - box.top
      else if (box.bottom > vh - margin) dy = (vh - margin) - box.bottom
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return
      setSelectionPopup(sp => sp ? { ...sp, x: sp.x + dx, y: sp.y + dy } : null)
    }
    clamp()
    // Measured again once the card has its final size (a define result, a
    // gallery), not only when its coordinates change.
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(clamp)
    observer.observe(el)
    return () => observer.disconnect()
  }, [selectionPopup?.x, selectionPopup?.y, selectionPopup?.showBelow, popupMode, noteInput])

  // Explain is fetched on speculation the moment a selection settles under
  // the finger, so the opener is usually there before Explain is tapped. It
  // is never charged; the tap is. A dismissed popup drops the fetch.
  const speculateExplanation = useCallback((text: string, paragraphIndex: number, comparison: boolean) => {
    if (text.trim().split(/\s+/).length < 2) return
    const editionKey = comparison ? prefs.compareEdition : prefs.primaryEdition
    void ask.explainSelection({ text, editionKey,
      editionLabel: editionLabelFor(editionKey, bookEditions),
      paragraphs: comparison ? book.compareParagraphs : book.paragraphs,
      paragraphIndex, speculative: true,
    }, () => {}).catch(() => { /* Speculation must never open an error or account prompt. */ })
  }, [ask.explainSelection, bookEditions, book.compareParagraphs, book.paragraphs, prefs.compareEdition, prefs.primaryEdition])
  const selectingTimerRef = useRef<number | null>(null)
  const handleSelectingChange = useCallback((range: LabHighlightRange | null) => {
    if (selectingTimerRef.current) window.clearTimeout(selectingTimerRef.current)
    selectingTimerRef.current = null
    if (!range || phoneAskOpen) return
    selectingTimerRef.current = window.setTimeout(() => {
      selectingTimerRef.current = null
      speculateExplanation(range.text, range.paragraphIndex, mobileCompareActive)
    }, 400)
  }, [mobileCompareActive, phoneAskOpen, speculateExplanation])
  useEffect(() => () => { if (selectingTimerRef.current) window.clearTimeout(selectingTimerRef.current) }, [])
  useEffect(() => {
    // Desktop native selection never reports in progress; the popup opening is its settle.
    if (!selectionPopup || selectionPopup.existingHighlightId) return
    const editionKey = selectionPopup.editionKey || readerEditionKey
    const timer = window.setTimeout(() => speculateExplanation(selectionPopup.text, selectionPopup.paragraphIndex, editionKey === prefs.compareEdition && editionKey !== prefs.primaryEdition), 180)
    return () => window.clearTimeout(timer)
  }, [selectionPopup, readerEditionKey, prefs.compareEdition, prefs.primaryEdition, speculateExplanation])

  const dismissSelectionPopup = useCallback(() => {
    setSelectionPopup(null)
    setPopupMode('colors')
    setNoteInput('')
    define.setQuery('')
    ask.discardSpeculativeExplanation()
  }, [ask.discardSpeculativeExplanation, define])


  // A new passage/view invalidates a frozen card, including while edition data loads.
  useLayoutEffect(() => { setSelectionPopup(null) }, [book.bookId, book.chapterNumber, book.paragraphs, book.compareParagraphs, prefs.primaryEdition, prefs.compareEdition, mobileCompareActive, desktopCompareActive, initialResolving, phoneAskOpen, frontispieceVisible])

  const handleSelectRange = useCallback((range: LabHighlightRange, clientX: number, clientY: number, side?: 'compare', intent?: 'lookup', highlightId?: string) => {
    if (initialResolving || frontispieceVisible || phoneAskOpen) return
    const comparison = side === 'compare' || mobileCompareActive
    const editionKey = comparison ? prefs.compareEdition : prefs.primaryEdition
    const paragraphs = comparison ? book.compareParagraphs : book.paragraphs
    const paragraph = paragraphs[range.paragraphIndex] || ''
    const offsets = range.endParagraphIndex === range.paragraphIndex ? wordSelectionOffsets(paragraph, range.fromWord, range.toWord) : null
    // Selection is temporary. Only an explicit Highlight or note action writes a mark.
    // A click carries the identity that painted the word/space/fragment.
    // Do not reinterpret a rendered mark as a new dictionary selection.
    const painted = intent === 'lookup' && highlightId
      ? (comparison ? highlightsApi.compareHighlights : highlightsApi.chapterHighlights).find(mark => mark.id === highlightId)
      : undefined
    const existing = painted ?? highlightsApi.findRange(range, editionKey) ?? highlightsApi.findContainingRange(range, editionKey)
    const character = offsets ? resolveCharacter(comparison ? compareCharacters : primaryCharacters, book.chapterNumber, range.paragraphIndex, ...offsets, paragraph, !!existing || highlightsApi.allHighlights.some(h => h.bookId === book.bookId && h.editionKey === editionKey && h.chapterNumber === book.chapterNumber && (h.paragraphIndex < range.paragraphIndex || h.paragraphIndex === range.paragraphIndex && h.fromWord < range.toWord) && (h.endParagraphIndex > range.paragraphIndex || h.endParagraphIndex === range.paragraphIndex && h.toWord > range.fromWord))) : null
    const highlight = existing
    // A click inside an existing highlight is about the thing the reader
    // marked, not the word under the cursor: Copy, Ask, Note and the note
    // editor all take the whole highlight, across paragraph boundaries.
    // Define stays word-scoped — a dictionary lookup of a whole sentence is
    // meaningless. A fresh drag has just expressed a different intent, so it
    // always keeps what was dragged even where it overlaps a highlight.
    const clickedWordText = range.text
    const pickedOneWord = range.paragraphIndex === range.endParagraphIndex && range.toWord - range.fromWord <= 1
    const widerHighlight = highlight && (highlight.paragraphIndex !== range.paragraphIndex
      || highlight.endParagraphIndex !== range.endParagraphIndex
      || highlight.fromWord !== range.fromWord
      || highlight.toWord !== range.toWord)
    const subject = ((intent === 'lookup' || pickedOneWord) && highlight && widerHighlight
      ? buildHighlightRange(
          paragraphs,
          { paragraphIndex: highlight.paragraphIndex, wordIndex: highlight.fromWord },
          { paragraphIndex: highlight.endParagraphIndex, wordIndex: Math.max(0, highlight.toWord - 1) },
        )
      : null) ?? range
    // A saved highlight is an explicit reader object. Its own controls take
    // precedence over an incidental dictionary/character match at the same
    // words, so tapping it always exposes Delete highlight first.
    const mode = existing ? 'main' as const : character ? 'character' as const : defaultPopupMode(subject.text)
    setPopupMode(mode)
    setNoteInput(highlight?.note || '')
    if (mode === 'define') define.begin(range.text)
    const anchorY = clientY
    const showBelow = window.innerHeight - anchorY > anchorY
    const mobile = typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(max-width: 768px)').matches
    const estimatedHeight = mode === 'define' || mode === 'character' ? 280 : 64
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
      text: subject.text,
      paragraphIndex: subject.paragraphIndex,
      startOffset: subject.fromWord,
      endOffset: subject.toWord,
      defineText: clickedWordText,
      showBelow,
      mobilePlacement: shouldFloatAbove ? 'above-selection' : 'bottom',
      existingHighlightId: highlight?.id,
      existingNote: highlight?.note,
      homeMode: character ? 'main' : defaultPopupMode(subject.text, existing?.id),
      character: character ?? undefined,
      editionKey,
      side,
      range: subject,
    })
  }, [define, highlightsApi, primaryCharacters, compareCharacters, book, prefs.primaryEdition, prefs.compareEdition, mobileCompareActive, initialResolving, frontispieceVisible, phoneAskOpen])

  useEffect(() => {
    if (!phoneAskOpen) setPhoneKeyboardOpen(false)
  }, [phoneAskOpen])

  const leaveTalking = useCallback(() => {
    if (voiceCallSurfaceRef.current && callOpenRef.current) {
      endCallRef.current()
      return
    }
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

  const primaryAnchorFor = useCallback((anchor: { paragraphIndex: number; wordIndex: number }) => {
    if (!(showPhoneChrome && mobileCompareActive)) return anchor
    // Back on the page the flip opened, the one holding the passage's start:
    // the main place it came from, exactly.
    const passage = comparePassageRef.current
    if (passage?.paragraphs === readerParagraphs) {
      const pages = readingPagesRef.current
      const entry = pageAnchorOf(pages[pageIndexForPlace(pages, passage.start.paragraphIndex, passage.start.wordIndex)])
      if (entry?.paragraphIndex === anchor.paragraphIndex && entry.wordIndex === anchor.wordIndex) return passage.entryPlace
    }
    return mapLabCompareAnchor(readerParagraphs, book.paragraphs, anchor)
  }, [book.paragraphs, mobileCompareActive, readerParagraphs, showPhoneChrome])

  const goToPage = useCallback((index: number) => {
    setRecentChapterReturn(null)
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
  }, [chromeV2, commitUnsettledNav, listen, mobileCompareActive, notePlace, primaryAnchorFor])

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
    // V2's compare page is anchored on the primary page's FIRST WORD, carried
    // to the same aligned paragraph — the persisted place is a separate thing
    // and is left exactly where it is. V1 keeps mapping the place itself.
    const compareHead = nextActive && chromeV2
      ? mapLabCompareAnchor(readerParagraphs, targetParagraphs, visiblePageAnchor)
      : null
    const mapped = compareHead
      ?? (nextActive
        ? mapLabCompareAnchor(readerParagraphs, targetParagraphs, sourceAnchor)
        : { ...placeRef.current })
    const primaryAnchor = nextActive ? sourceAnchor : mapped
    const budget = pageMetricsRef.current ? labPageBudgetFromMetrics(pageMetricsRef.current) : null
    const settledPrimaryPages = !nextActive ? mobilePrimaryPagesRef.current : null
    // The measured map beats the budget estimate, and it is the map the
    // native pass would have produced 50ms later anyway: taking it here is
    // what turns the swap from two paints into one.
    const measured = standbyPagesRef.current?.key === standbyKey ? standbyPagesRef.current.pages : null
    const naturalPages = settledPrimaryPages
      ?? (measured?.length ? measured : chapterHearingPages(targetParagraphs, canUseLabPageBudget(budget) ? budget : null))
    // The whole main page, not just its first word: its end is carried over
    // too, and the compare page is cut to exactly that passage when it fits
    // one page. When it does not, pagination stays as it is and the end is
    // marked. Nothing here writes a place; the font is the reader's own.
    const mainTail = compareHead ? chapterPageTail(current[currentIndex]) : null
    const compareEnd = mainTail
      ? mapLabCompareEnd(readerParagraphs, targetParagraphs, { paragraphIndex: mainTail.paragraphIndex, wordIndex: mainTail.to })
      : null
    comparePassageRef.current = compareHead && compareEnd
      ? { paragraphs: targetParagraphs, start: compareHead, end: compareEnd, entryPlace: { ...sourceAnchor } }
      : null
    setComparePageEnd(compareEnd ? { paragraphs: targetParagraphs, at: compareEnd } : null)
    const nextPages = withComparePassage(naturalPages, targetParagraphs)
    // Find the natural page containing the mapped verse. Splitting at the
    // anchor creates a short leftover page without reflowing the chapter.
    if (chromeV2) swapCommittedRef.current = { paragraphs: targetParagraphs, pages: nextPages }
    const nextIndex = compareHead
      ? restorePageIndexForAnchor(nextPages, compareHead)
      : pageIndexForPlace(nextPages, mapped.paragraphIndex, mapped.wordIndex)
    if (chromeV2) {
      setVersionPill(pill => ({
        label: nextActive ? compareEditionLabel : primaryEditionLabel,
        nonce: (pill?.nonce ?? 0) + 1,
      }))
    }

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
  }, [book.compareParagraphs, book.paragraphs, chromeV2, compareEditionLabel, listen, mobileCompareActive, mobileCompareEnabled, notePlace, primaryEditionLabel, readerParagraphs, standbyKey, withComparePassage])

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
    setRecentChapterReturn(null)
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
        readingFirst: chromeV2,
        bookId: book.bookId || 'bible',
        chapterNumber: number,
        primaryEditionKey: prefs.primaryEdition,
        compareEditionKey: prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition ? prefs.compareEdition : undefined,
        audioEditionKey: bookEditions.some(edition => edition.key === audioEditionKey && edition.hasAudio) ? audioEditionKey : undefined,
      })
    } catch {
      if (navigation === chapterNavigationRef.current) {
        setContentsTarget(null)
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

  const goToChapter = useCallback(async (number: number, landing: 'start' | 'end', preserveAudioSession = false) => {
    setRecentChapterReturn(null)
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
    if (preserveAudioSession && listen.playing) listen.handoffChapter()
    else listen.stop()
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
        readingFirst: chromeV2,
        bookId: book.bookId || 'bible',
        chapterNumber: number,
        primaryEditionKey: prefs.primaryEdition,
        compareEditionKey: prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition ? prefs.compareEdition : undefined,
        audioEditionKey: bookEditions.some(edition => edition.key === audioEditionKey && edition.hasAudio) ? audioEditionKey : undefined,
      })
    } catch {
      if (navigation === chapterNavigationRef.current) {
        if (preserveAudioSession) listen.stop()
        setAudioChapterTransitioning(false)
        setContentsTarget(null)
        setReaderLoadError('That chapter is temporarily unavailable. Your current reading place has been preserved.')
      }
      return
    }
    if (
      navigation !== chapterNavigationRef.current
      || loaded.chapterNumber !== number
      || loaded.paragraphs.length === 0
    ) {
      if (navigation === chapterNavigationRef.current) {
        if (preserveAudioSession) listen.stop()
        setAudioChapterTransitioning(false)
      }
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
    // Hearing a chapter out is finishing it, same as turning past the last
    // page — on the book's final chapter too, where there is nothing to open.
    markChapterFinished(book.chapterNumber)
    if (next == null) return false
    void goToChapter(next, 'start', true)
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

  const applyPlaybackSkip = useCallback(async (kind: LabPlaybackSkip): Promise<LabPlaybackNavigationOutcome> => {
    // A companion-initiated move opens the reader at the new place. It only
    // brings the audiobook back when this companion session paused it; a move
    // from ordinary reading (or one made to look something up) stays silent.
    const outcome: LabPlaybackNavigationOutcome = {
      resumePlayback: shouldResumePlaybackAfterNavigation({ sessionStartedFromPlayback: pausedForAskRef.current }),
    }
    const resolved = resolveLabPlaybackSkip({
      kind,
      chapterNumber: book.chapterNumber,
      paragraphIndex: placeRef.current.paragraphIndex,
      paragraphCount: book.paragraphs.length,
      chapters: book.chapters,
    })
    if (resolved.chapterChanged) {
      if (resolved.chapterNumber > book.chapterNumber) {
        markChapterFinished(book.chapterNumber)
      }
      await goToChapter(resolved.chapterNumber, resolved.landing)
      return outcome
    }
    goToParagraph(resolved.paragraphIndex, { seekAudio: outcome.resumePlayback })
    return outcome
  }, [book.chapterNumber, book.chapters, book.paragraphs.length, goToChapter, goToParagraph, markChapterFinished])
  skipRef.current = applyPlaybackSkip

  const quietDesktopAfterTurn = useCallback(() => {
    // A page turn while audio is paused puts the transport away on every
    // chrome; while audio plays it stays up wherever the reader goes.
    if (!listen.playing) { setPausedTransportVisible(false); setSpeedPopoverOpen(false) }
    if (!desktopPaging) return
    setReaderControlsVisible(false)
  }, [desktopPaging, listen.playing])

  const goNext = useCallback(() => {
    quietDesktopAfterTurn()
    if (chapterCoverTitle) {
      if (book.paragraphs.length === 0) return
      chapterNavigationRef.current += 1
      setChapterCoverTitle(null)
      chapterLandingRef.current = null
      landingChapterRef.current = null
      openAtEndRef.current = false
      setOpenAtEnd(false)
      const exactStartIndex = explicitStartAnchor
        ? readingPagesRef.current.findIndex(page => {
            const anchor = pageAnchorOf(page)
            return anchor?.paragraphIndex === explicitStartAnchor.paragraphIndex && anchor.wordIndex === explicitStartAnchor.wordIndex
          })
        : -1
      const startIndex = exactStartIndex >= 0 ? exactStartIndex : 0
      const first = readingPagesRef.current[startIndex]
      pageAnchorRef.current = explicitStartAnchor ?? pageAnchorOf(first)
      if (explicitStartAnchor) placeRef.current = explicitStartAnchor
      readingPageIndexRef.current = startIndex
      setReadingPageIndex(startIndex)
      return
    }
    const reading = readingPagesRef.current
    const working = workingPagesRef.current
    const pages = labNavPageList(pagesStableRef.current, working, reading)
    const index = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, pages.length - 1)))
    const nextPage = desktopSpread ? (index + 2 < pages.length ? index + 2 : null) : adjacentPageIndex(pages.length, index, 1)
    if (nextPage != null) {
      goToPage(nextPage)
      return
    }
    const next = nextLabChapter(book.chapters, book.chapterNumber)
    // Turning past the last page finishes the chapter — on the book's final
    // chapter too, so the library can show the book as finished without
    // depending on a reading-memory session that may since have been pruned.
    markChapterFinished(book.chapterNumber)
    if (next != null) {
      if (listen.playing) void browseToChapter(next, 'start')
      else void goToChapter(next, 'start')
    }
  }, [book.chapterNumber, book.chapters, book.paragraphs.length, browseToChapter, chapterCoverTitle, explicitStartAnchor, goToChapter, goToPage, listen.playing, markChapterFinished, desktopSpread, quietDesktopAfterTurn])

  const goPrev = useCallback(() => {
    quietDesktopAfterTurn()
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
    const prevPage = desktopSpread ? (index > 0 ? Math.max(0, index - 2) : null) : adjacentPageIndex(pages.length, index, -1)
    if (prevPage != null) {
      goToPage(prevPage)
      return
    }
    const prev = prevLabChapter(book.chapters, book.chapterNumber)
    if (prev != null) {
      if (listen.playing) void browseToChapter(prev, 'end')
      else void goToChapter(prev, 'end')
    }
  }, [book.chapterNumber, book.chapters, browseToChapter, chapterCoverTitle, goToChapter, goToPage, listen.playing, desktopSpread, quietDesktopAfterTurn])

  // Keyboard page turns, matching the classic Reader: ArrowRight / PageDown /
  // Space turn forward, ArrowLeft / PageUp turn back. Typing surfaces and open
  // overlays keep their keys; the chapter cover handles its own arrows and
  // marks the event handled, so it never double-turns here.
  const keyboardPageTurnsBlocked = prefaceVisible || gearOpen || tocOpen || phoneAskOpen || inTheBookOpen || speedPopoverOpen || selectionPopup != null
  useEffect(() => {
    if (keyboardPageTurnsBlocked) return
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      const direction = labKeyboardPageDirection(event.key)
      if (direction == null) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return
      event.preventDefault()
      if (direction > 0) goNext()
      else goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, keyboardPageTurnsBlocked])

  const startHearing = useCallback((opts?: { force?: boolean }) => {
    if (listen.isPending()) { listen.pause(); return }
    if ((audioUnavailable && !narrationOption && !retainedBella) || (narrationInfo?.provider === 'grok' && prefs.primaryEdition.endsWith('-en') && !narrationOption)) { setAudioUnavailableNotice(true); return }
    setAudioUnavailableNotice(false)
    mobileCompareReturnPlaceRef.current = null
    setChapterCoverTitle(null)
    if (chrome === 'talking' && !opts?.force) return
    // Audio keeps its own chapter while the reader browses. Its follow place
    // is only meaningful on the page when both are the same chapter; applied
    // to another chapter it would resume, and persist, the wrong words.
    const listeningHere = listenSource.bookId === (book.bookId || 'bible') && listenSource.chapterNumber === book.chapterNumber
    if (chrome === 'hearing' && !opts?.force && (!chromeV2 || listen.playing)) {
      listen.pause()
      browseWhileListeningRef.current = false
      setBrowseWhileListening(false)
      const follow = listeningHere ? listen.follow : { kind: 'none' as const }
      const page = readingPages[readingPageIndex]
      if (!listeningHere && page) {
        placeRef.current = { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
      } else if (follow.kind === 'word') {
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
    const onThisPage = listeningHere && follow.kind === 'word' && (showPhoneChrome && !chromeV2
      ? !!page && follow.paragraphIndex === page.paragraphIndex
        && follow.wordIndex >= page.from && follow.wordIndex < page.to
      : followOnReadingPage(follow, readingPages, readingPageIndex))
    placeRef.current = onThisPage
      ? { paragraphIndex: follow.paragraphIndex, wordIndex: follow.wordIndex }
      : place
    if (chromeV2) {
      const head = pageAnchorOf(page)
      pageAnchorRef.current = head
    }
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
    else void (chromeV2 ? listen.startAtPlace(placeRef.current) : listen.start(placeRef.current))
  }, [audioUnavailable, narrationOption, narrationInfo, prefs.primaryEdition, retainedBella, book, chrome, chromeV2, listen, listenSource.bookId, listenSource.chapterNumber, measuredPaging, notePlace, readingPageIndex, readingPages, showPhoneChrome])

  startHearingRef.current = () => startHearing({ force: true })

  const handleHeaderListen = useCallback(() => {
    if (listen.isPending()) { listen.pause(); return }
    if (peekBook && chrome === 'hearing') {
      setPeekBook(false)
      setInTheBookOpen(false)
      return
    }
    startHearing()
  }, [chrome, listen, peekBook, startHearing])

  const dictation = useLabDictation(book.bookId || 'bible', setDraft)

  const handleMic = useCallback(() => {
    if (chromeV2) { dictation.toggle(draft); return }
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
  }, [ask, chromeV2, dictation, draft, interruptHearForAsk, resumeListenAfterAsk, showPhoneChrome])

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

  /** Where the dialogue began, captured before anything the call does can move it. */
  const captureCallAnchor = useCallback(() => {
    callAnchorRef.current = {
      bookId: book.bookId || 'bible',
      chapterNumber: book.chapterNumber,
      pageIndex: readingPageIndexRef.current,
      paragraphIndex: placeRef.current.paragraphIndex,
      wordIndex: placeRef.current.wordIndex,
    }
  }, [book.bookId, book.chapterNumber])

  /**
   * Give the reading place back. Same book only, and only when the call
   * actually moved it — a restore that would be a no-op writes nothing.
   */
  const restoreCallAnchor = useCallback(() => {
    const anchor = callAnchorRef.current
    callAnchorRef.current = null
    const restore = labCallRestore(anchor, {
      bookId: book.bookId || 'bible',
      chapterNumber: book.chapterNumber,
      pageIndex: readingPageIndexRef.current,
    })
    if (restore.kind === 'none') return
    const place = { paragraphIndex: restore.paragraphIndex, wordIndex: restore.wordIndex }
    if (restore.kind === 'page') {
      placeRef.current = place
      pageAnchorRef.current = place
      readingPageIndexRef.current = restore.pageIndex
      readerStateRef.current = { ...readerStateRef.current, pageIndex: restore.pageIndex }
      setReadingPageIndex(restore.pageIndex)
      notePlace('mode-change', place)
      return
    }
    // A chapter move: hand the landing effect the page and place to restore.
    // goToChapter clears both refs on the way in, so they are set right after
    // its synchronous prefix has run.
    const pending = goToChapter(restore.chapterNumber, 'start')
    restorePlaceRef.current = place
    restorePageRef.current = restore.pageIndex
    placeRef.current = place
    void pending
  }, [book.bookId, book.chapterNumber, goToChapter, notePlace])

  const startCallVoice = useCallback(() => {
    const greeting = preparationReturnRef.current === book.bookId ? `Let’s prepare you for your reading of ${book.bookTitle}.` : undefined
    void ask.startVoice(greeting).then((started) => {
      // A start the account policy or the microphone refused leaves nothing to
      // show a call for; the notice already says why.
      if (!started) { setCallOpen(false); returnToPreparation() }
    })
  }, [ask, book.bookId, book.bookTitle, returnToPreparation])

  const handleTalk = useCallback(() => {
    setCallStartedAt(Date.now())
    dictation.stop()
    setGearOpen(false)
    setTocOpen(false)
    interruptHearForAsk()
    if (voiceCallSurface) {
      captureCallAnchor()
      setCallAwaitingConnection(true)
      setChrome('talking')
      setPhoneAskOpen(false)
      setDesktopAskOpen(false)
      setInTheBookOpen(false)
      setPeekBook(false)
      setCallMinimized(false)
      setCallParagraph(focusParagraph ?? placeRef.current.paragraphIndex)
      setCallOpen(true)
      startCallVoice()
      return
    }
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
  }, [ask, captureCallAnchor, dictation.stop, focusParagraph, interruptHearForAsk, openPhoneAsk, showPhoneChrome, startCallVoice, voiceCallSurface])

  // A move the conversation makes (a jump to a paragraph) moves the tint.
  useEffect(() => {
    if (!callOpen || focusParagraph == null) return
    setCallParagraph(focusParagraph)
  }, [callOpen, focusParagraph])

  /** The call's own end: stop the session, close the surface, give the place back. */
  const endCall = useCallback(() => {
    setCallOpen(false)
    setCallMinimized(false)
    ask.stopVoice()
    ask.setMicMuted(false)
    resumeListenAfterAsk()
    restoreCallAnchor()
  }, [ask, restoreCallAnchor, resumeListenAfterAsk])

  endCallRef.current = endCall

  const reconnectCall = useCallback(() => {
    ask.stopVoice()
    setCallAwaitingConnection(true)
    startCallVoice()
  }, [ask, startCallVoice])

  const toggleCallMute = useCallback(() => {
    ask.setMicMuted(!ask.micMuted)
  }, [ask])

  const handleChat = useCallback(() => {
    if (chromeV2) setContentsConversation(null)
    setGearOpen(false)
    setTocOpen(false)
    setVoiceGate('off')
    if (!showPhoneChrome) {
      if (desktopAskOpen && chrome !== 'talking') {
        resumeListenAfterAsk()
        return
      }
      if (chromeV2 && callOpen) {
        // Chat chosen during a desktop call: the call ends here (its place
        // given back), and the companion opens as Chat in its stead. Audio
        // the call interrupted stays paused for Chat and resumes on close.
        setCallOpen(false)
        setCallMinimized(false)
        ask.setMicMuted(false)
        restoreCallAnchor()
        setChrome(current => (current === 'talking' ? 'reading' : current))
      }
      interruptHearForAsk()
      setDesktopAskOpen(true)
      if (ask.voiceActive) ask.stopVoice()
      return
    }
    stayInAskRef.current = true
    // The phone sheet opens on the conversation, scrolled to the newest
    // message, with no focus(): a programmatic focus raises the keyboard
    // over the thread. The reader taps the field when they want to type.
    // Talk → Chat, the account sheet handing a draft back, and Ask about
    // all come through here or openPhoneAsk and stay unfocused as well.
    openPhoneAsk()
    if (ask.voiceActive) ask.stopVoice()
    else stayInAskRef.current = false
  }, [ask, callOpen, chrome, chromeV2, desktopAskOpen, interruptHearForAsk, openPhoneAsk, restoreCallAnchor, resumeListenAfterAsk, showPhoneChrome])

  const openContentsPassage = useCallback((place: ContentsPlace, chat?: ChatConversation, chapterOnly = false) => {
    const bookId = book.bookId || 'bible'
    if (!book.chapters.some(ch => ch.number === place.chapterNumber) || (chat && chat.bookId !== bookId)) return
    const chapter = book.chapters.find(ch => ch.number === place.chapterNumber)!
    const remembered = chapterOnly ? recentChapterPlace(readPositionState(), bookId, chapter, prefs.primaryEdition) : null
    setTocOpen(false)
    setPhoneAskOpen(false)
    setDesktopAskOpen(false)
    setContentsConversation(chat || null)
    if (chat) interruptHearForAsk()
    if (mobileCompareActive) handleMobileCompare()
    setContentsTarget({ ...place, bookId, navigation: chapterNavigationRef.current + (place.chapterNumber !== book.chapterNumber ? 1 : 0), chapterOnly, chat })
    if (place.chapterNumber !== book.chapterNumber) {
      if (listen.playing && !chat) void browseToChapter(place.chapterNumber, 'start')
      else {
        void goToChapter(place.chapterNumber, 'start')
        // Continuing a conversation pauses playback through its source move.
        if (chat) { keepPlayingChapterRef.current = null; setAudioChapterTransitioning(false) }
      }
    }
    setRecentChapterReturn(remembered ? { ...remembered, libraryBookId: bookId } : null)
  }, [book.bookId, book.chapterNumber, book.chapters, browseToChapter, goToChapter, handleMobileCompare, interruptHearForAsk, listen.playing, mobileCompareActive, readPositionState, prefs.primaryEdition])

  useEffect(() => {
    if (!contentsTarget || tocOpen || initialResolving) return
    if (contentsTarget.navigation !== chapterNavigationRef.current || contentsTarget.bookId !== (book.bookId || 'bible')) { setContentsTarget(null); return }
    if (contentsTarget.chapterNumber !== book.chapterNumber || mobileCompareActive) return
    if (chapterCoverTitle && !contentsTarget.chapterOnly) { setChapterCoverTitle(null); return }
    if (!chapterCoverTitle && !pagesStableRef.current) return
    const paragraphIndex = Math.max(0, Math.min(book.paragraphs.length - 1, contentsTarget.paragraphIndex))
    const wordIndex = Math.max(0, Math.min(Math.max(0, (book.paragraphs[paragraphIndex] || '').split(/\s+/).length - 1), contentsTarget.wordIndex))
    const place = { paragraphIndex, wordIndex }
    const pageIndex = contentsTarget.chapterOnly ? 0 : pageIndexForPlace(readingPages, paragraphIndex, wordIndex)
    placeRef.current = place
    pageAnchorRef.current = place
    readingPageIndexRef.current = pageIndex
    readerStateRef.current = { ...readerStateRef.current, pageIndex }
    setReadingPageIndex(pageIndex)
    setFocusParagraph(paragraphIndex)
    // The contents overlay suspended writes. Commit only the loaded, coherent
    // destination, never the book/range that was merely browsed in the menu.
    notePlace('chapter-jump', place)
    if (contentsTarget.chat) {
      setPhoneAskOpen(showPhoneChrome)
      setDesktopAskOpen(!showPhoneChrome)
    }
    setContentsTarget(null)
  }, [book.bookId, book.chapterNumber, book.paragraphs, chapterCoverTitle, contentsTarget, initialResolving, mobileCompareActive, nativePagesRevision, notePlace, readingPages, settleIndex, showPhoneChrome, tocOpen])

  const returnToContents = useCallback(() => {
    setPhoneAskOpen(false)
    setDesktopAskOpen(false)
    setTocOpen(true)
  }, [])

  // Desktop keeps the autofocus: when the companion opens as Chat (from the
  // rail, from a Talk that fell back to Chat, from Ask about) the caret goes
  // to the composer — but only on a fine-pointer surface. A tablet showing
  // the desktop layout would get the keyboard instead, so it is left alone.
  const desktopChatOpen = !showPhoneChrome && desktopAskOpen && chrome !== 'talking'
  const desktopChatWasOpenRef = useRef(false)
  useEffect(() => {
    const wasOpen = desktopChatWasOpenRef.current
    desktopChatWasOpenRef.current = desktopChatOpen
    if (!desktopChatOpen || wasOpen) return
    const pointerFine = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: fine)').matches
      : null
    const autofocus = labShouldAutofocusComposer({
      phoneChrome: showPhoneChrome,
      pointerFine,
      maxTouchPoints: typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0,
    })
    if (autofocus) askInputRef.current?.focus({ preventScroll: true })
  }, [desktopChatOpen, showPhoneChrome])

  const handleBarListen = useCallback(() => {
    if (listen.isPending()) { listen.pause(); return }
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
      if (listen.src && !chromeV2) {
        listen.resume()
        return
      }
      startHearing({ force: true })
      return
    }
    startHearing()
  }, [chrome, chromeV2, handleMobileCompare, listen, mobileCompareActive, phoneAskOpen, resumeListenAfterAsk, startHearing])

  // ── Chrome V2 ────────────────────────────────────────────────────────
  const accountId = authUser?.id ?? null

  const openSuperMenu = useCallback(() => {
    setTocOpen(false)
    setGearOpen(false)
    setSuperMenuOpen(true)
  }, [])

  const handleSuperToggle = useCallback(() => {
    if (superMenuOpen) setSuperMenuOpen(false)
    else openSuperMenu()
  }, [openSuperMenu, superMenuOpen])



  // The first view: the mark spins once per reader load, 400 ms after the
  // first page has laid out, and never over playing audio. `superFirstViewRef`
  // is the per-mount latch, so nothing that re-runs this effect later — a late
  // auth resolve, a re-layout — can arm it a second time in the same visit.
  // It is not persisted: a fresh load spins again. (It used to be once-ever
  // per identity, which with the identity flipping from device to account on
  // sign-in meant it replayed at the wrong moments and then never again.)
  const readerLaidOut = book.paragraphs.length > 0 && !initialResolving
  const readerReady = readerLaidOut
    && (!desktopPaging || desktopMeasuredKey === desktopLayoutKey && nativeMeasuredContent === readerParagraphs)
  useEffect(() => {
    if (!readerReady) return
    markReaderLoadTrace('pagination_ready', { outcome: 'success' })
    return afterLabPaint(() => {
      const passage = [...(labRootRef.current?.querySelectorAll<HTMLElement>('.lab-passage') ?? [])]
        .find(element => !element.closest('.lab-page-measure') && element.getBoundingClientRect().height > 0)
      if (passage) markReaderLoadTrace('first_visible_passage', { outcome: 'success' })
    })
  }, [readerReady])
  useEffect(() => {
    if (!chromeV2 || !readerLaidOut) return
    if (superFirstViewRef.current) return
    const timer = window.setTimeout(() => {
      if (superFirstViewRef.current || listenPlayingRef.current) return
      superFirstViewRef.current = true
      setSuperFirstView(true)
    }, LAB_SUPER_FIRST_VIEW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [chromeV2, readerLaidOut])

  // The version pill leaves on a clock, not on animationend: a clock still
  // runs when the animation was cut short, and it is the same clock in both
  // motion settings. Its length is the animation's.
  useEffect(() => {
    if (!versionPill) return
    const timer = window.setTimeout(() => {
      setVersionPill(current => current?.nonce === versionPill.nonce ? null : current)
    }, LAB_V2_VERSION_PILL_MS)
    return () => window.clearTimeout(timer)
  }, [versionPill])

  const handleFirstViewEnd = useCallback(() => {
    setSuperFirstView(false)
  }, [])

  const closePhoneAsk = useCallback(() => {
    if (callOpen) endCall()
    else resumeListenAfterAsk()
  }, [callOpen, endCall, resumeListenAfterAsk])

  // Escape closes the Chat panel like every other sheet, on the phone as well
  // as the desktop — a phone with a hardware or Bluetooth keyboard is a real
  // reader, so this is not gated on pointer type. A menu, a settings sheet,
  // the contents, a card, a prompt or a call already answer Escape for
  // themselves and are left to it: while one of them is in front, this stays
  // out of the way and the layer on top closes first. The composer's own
  // draft is not cleared — it is held in `draft` above the panel, so the same
  // half-typed line is there when Chat opens again.
  const chatPanelEscapes = chromeV2 && chrome !== 'talking'
    && (showPhoneChrome ? phoneAskOpen : desktopAskOpen)
    && !superMenuOpen && superSheet === null && !tocOpen && !inTheBookOpen && !callOpen && selectionPopup == null
    && !gearOpen && !speedPopoverOpen && accountPrompt == null && !prefaceVisible
  useEffect(() => {
    if (!chatPanelEscapes) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      dictation.stop()
      closePhoneAsk()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chatPanelEscapes, closePhoneAsk, dictation])

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
    const attachment = askAttachment?.bookId === book.bookId ? askAttachment : null
    void ask.sendTyped(value, undefined, undefined, {
      highlightedText: attachment?.text,
      onAccepted: () => {
        setDraft('')
        setAskAttachment(null)
      },
    })
  }, [ask, askAttachment, book.bookId, interruptHearForAsk, resumeListenAfterAsk])

  const handleChapterChat = useCallback((kind: 'discuss' | 'prepare' | 'preview') => {
    if (ask.typedLoading || initialResolving || book.chaptersProvisional) return
    // Capture one coherent tuple before opening Chat or awaiting a chapter fetch.
    const request = createChapterChatRequest(kind, {
      bookId: book.bookId || 'bible', bookTitle: book.bookTitle, bookAuthor: book.bookAuthor,
      editionKey: readerEditionKey, editionLabel: editionLabelFor(readerEditionKey, bookEditions),
      chapterNumber: book.chapterNumber, chapterLabel: book.chapterLabel,
      paragraphs: readerParagraphs, paragraphIndex: placeRef.current.paragraphIndex,
      chapterCount: book.chapters.length,
    }, book.chapters)
    if (!request) return
    if (kind === 'discuss') request.activity = {
      questions: ask.turns.filter(turn => turn.role === 'user' && turn.chapterNumber === book.chapterNumber && (!turn.bookId || turn.bookId === book.bookId) && !turn.chapterAction).map(turn => turn.content).slice(-3),
      highlights: highlightsApi.allHighlights.filter(mark => mark.bookId === book.bookId && mark.chapterNumber === book.chapterNumber && mark.editionKey === readerEditionKey).slice(-3).flatMap(mark => {
        const range = buildHighlightRange(readerParagraphs, { paragraphIndex: mark.paragraphIndex, wordIndex: mark.fromWord }, { paragraphIndex: mark.endParagraphIndex, wordIndex: mark.toWord - 1 })
        return range ? [range.text] : []
      }),
    }
    dictation.stop()
    interruptHearForAsk()
    setDesktopAskOpen(true)
    if (showPhoneChrome) setPhoneAskOpen(true)
    void ask.sendTyped(CHAPTER_CHAT_MESSAGES[kind], request)
  }, [ask, initialResolving, book, readerParagraphs, readerEditionKey, bookEditions, dictation, interruptHearForAsk, showPhoneChrome, highlightsApi.allHighlights])

  const handleSuperMenuSelect = useCallback((id: LabSuperMenuId) => {
    setSuperMenuOpen(false)
    if (id === 'chat') { handleChat(); return }
    if (id === 'talk') { handleTalk(); return }
    if (id === 'summarize') { handleChapterChat('discuss'); return }
    if (id === 'editions') { setSuperSheet('editions'); return }
    if (id === 'settings') { setSuperSheet('reading'); return }
    if (id === 'account') { setSuperSheet('account'); return }
    rememberLibraryPlace()
    if (typeof window === 'undefined') return
    window.location.assign(chromeV2 ? `${LAB_LIBRARY_URL}${readerPreviewSearch(window.location.search)}` : LAB_LIBRARY_URL)
  }, [chromeV2, handleChat, handleTalk, handleChapterChat, rememberLibraryPlace])

  const nextOpeningCurrent = nextOpening && nextOpening.key === nextOpeningKey ? nextOpening : null
  const nextOpeningLayoutKey = `${desktopLayoutKey}:next:${nextOpeningKey ?? ''}`
  const nextChapterOpening = nextOpeningCurrent && nextOpeningPage?.key === nextOpeningLayoutKey && nextOpeningPage.paragraphs === nextOpeningCurrent.paragraphs
    && readingPages.length > 0 && readingPageIndex >= readingPages.length - 1
    ? { title: nextOpeningCurrent.title, paragraphs: nextOpeningCurrent.paragraphs, page: nextOpeningPage.page }
    : undefined
  const showChapterEnd = chromeV2 && !initialResolving && !book.chaptersProvisional
    && nativeMeasuredContent === readerParagraphs && readingPages.length > 0
    && readingPageIndex + (desktopSpread ? 1 : 0) >= readingPages.length - 1

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

  if (temporaryHold && !holdRecovery) return (
    <EditionHoldPanel
      title={book.bookTitle}
      edition={getBook(book.bookId || 'bible')?.editions.find(edition => edition.key === heldEditionKey)?.label || heldEditionKey}
      reason={temporaryHold.reason}
      highlights={highlightsApi.allHighlights.filter(mark => mark.bookId === book.bookId)}
      onRecover={() => setRecoveredHold(holdIdentity)}
    />
  )

  return (
    <div
      ref={labRootRef}
      lang={bookEditions.find(edition => edition.key === readerEditionKey)?.language || 'en'}
      className={`lab ${isPhone ? 'is-phone' : 'is-desktop'}${frontispieceVisible ? ' is-frontispiece' : ''}${showPhoneChrome ? ' has-phone-chrome' : ''}${showPhoneChrome && phoneReaderControlsVisible ? ' has-reader-controls' : ''}${ask.notice ? ' has-notice' : ''}${phoneAskOpen ? ' has-phone-ask' : ''}${phoneKeyboardOpen ? ' has-phone-keyboard' : ''}${resolvedDarkMode ? ' is-night' : ''}${prefs.theme === 'book' ? ' is-book-theme' : ''}${fullscreen ? ' is-fullscreen' : ''}${pageTurnAffordance.buttons ? ' has-page-buttons' : ''}`}
      data-testid="lab-root"
      data-page-turn-zones={pageTurnAffordance.tapZones === 'all' ? undefined : pageTurnAffordance.tapZones}
      data-theme={resolvedTheme}
      data-lab-layout={showPhoneChrome ? 'phone' : 'desktop'}
      data-chrome-state={chrome}
      data-phone-bar={showPhoneBar ? labPhoneBarMode(chrome, peekBook, phoneAskOpen) : 'none'}
      data-page-height={pageMetrics ? String(pageMetrics.height) : ''}
      data-chapter={String(book.chapterNumber)}
      data-book-id={book.bookId || 'bible'}
      data-cover-page={chapterCoverTitle ? 'true' : 'false'}
      data-reader-ready={readerReady ? 'true' : 'false'}
      data-characters-ready={primaryCharacters ? 'true' : 'false'}
      data-position-resolving={initialResolving ? 'true' : 'false'}
      data-biblical-book={biblicalBook}
      data-place={`${placeRef.current.paragraphIndex}:${placeRef.current.wordIndex}`}
      data-playing={listen.playing ? 'true' : 'false'}
      data-fullscreen={fullscreen ? 'true' : 'false'}
      data-shakespeare={isShakespeare || undefined}
      data-shakespeare-layout={isShakespeare ? (flowingShakespeare ? 'flowing' : 'verse') : undefined}
      data-reader-controls={frontispieceVisible
        ? 'hidden'
        : showPhoneChrome || desktopPaging ? (phoneReaderControlsVisible ? 'visible' : 'hidden') : 'desktop'}
      data-reader-edition={readerEditionKey}
      data-compare-active={(showPhoneChrome ? mobileCompareActive : desktopCompareActive) ? 'true' : 'false'}
      data-desktop-paging={desktopPaging ? 'true' : undefined}
      data-desktop-view={desktopCompareActive ? 'compare' : 'read'}
      data-desktop-panel={desktopVoiceOpen
        ? (callMinimized ? 'pill' : 'talk')
        : !showPhoneChrome && desktopAskOpen ? (chrome === 'talking' ? 'talk' : 'chat') : 'none'}
      data-voice-surface={voiceLabView}
      data-voice-version={voiceVersion}
      {...(chromeV2 ? {
        'data-chrome-version': 'v2',
        'data-transport': (showPhoneChrome ? audioBarActive : desktopAudioBarActive) ? 'open' : 'closed',
        'data-super-menu': superMenuOpen ? 'open' : 'closed',
        'data-super-sheet': superSheet ?? 'closed',
      } : {})}
      data-voice-history-fixture={voiceHistoryFixture ? 'true' : 'false'}
      data-audio-speed={String(listen.speed)}
      style={{
        ['--lab-font-reader' as string]: labFontFamilyCss(readingFont),
        ['--lab-font-size' as string]: String(prefs.fontSize),
        ['--lab-text-align' as string]: readingAlignment,
        ['--lab-line-height' as string]: String(labLineHeight(prefs.lineSpacing)),
        ['--lab-reader-margin' as string]: typeof prefs.margins === 'number' ? `${1.55 * prefs.margins}rem` : prefs.margins === 'narrow' ? '1.1rem' : prefs.margins === 'wide' ? '2.2rem' : '1.55rem',
        // The V2 desktop leaves set their side padding from their own measured
        // scale, not from a rem figure sized for the phone, so the Margins
        // preference reaches them as a factor on that scale. Both the painted
        // passage and the hidden measure box read it, so pagination and paint
        // stay in step. V1 reads nothing of it, and its DOM stays as it was.
        ...(chromeV2 ? { ['--lab-reader-margin-scale' as string]: String(labMarginScale(prefs.margins)) } : {}),
        ['--lab-paragraph-gap' as string]: typeof prefs.paragraphSpacing === 'number' ? `${labParagraphGap(prefs.paragraphSpacing)}em` : prefs.paragraphSpacing === 'compact' ? '.08em' : prefs.paragraphSpacing === 'generous' ? '.55em' : '.28em',
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
      {!frontispieceVisible && <header
        className="lab-header"
        {...(chromeV2 && (showPhoneChrome || desktopPaging) ? {
          // Hidden chrome: a press anywhere in the top bar reveals it and does
          // nothing else. Caught on the way down, and the click that follows
          // the same press is swallowed too — otherwise the chapter pill under
          // the finger would open the contents on the press that revealed it.
          onPointerDownCapture: (event: ReactPointerEvent) => {
            // The swallow belongs to the press that revealed, and to nothing
            // after it. A press that never became a click — a finger that
            // slid off, a touch the browser took as a scroll — left the flag
            // set, and the next tap on the pill was swallowed as if it were
            // the reveal. Every press starts clean; only a press on hidden
            // chrome sets the flag, and only the click of that press is
            // swallowed.
            revealOnlyRef.current = false
            if (phoneReaderControlsVisible) return
            // Desktop chrome only dims after a page turn — every control is
            // still drawn, so a press on one is a press on it. Restore the
            // chrome and let the click through: swallowing it made the first
            // click on Menu, Play or the chapter pill after an arrow-key turn
            // do nothing.
            if (!showPhoneChrome) {
              setReaderControlsVisible(true)
              return
            }
            event.preventDefault()
            event.stopPropagation()
            revealOnlyRef.current = true
            setReaderControlsVisible(true)
          },
          onClickCapture: (event: ReactMouseEvent) => {
            if (!revealOnlyRef.current) return
            revealOnlyRef.current = false
            event.preventDefault()
            event.stopPropagation()
          },
        } : {})}
      >
        <div
          className="lab-header-brand"
          onClick={showPhoneChrome && !phoneReaderControlsVisible ? () => setReaderControlsVisible(true) : undefined}
        >
          <h1 className="lab-header-work" data-testid="lab-header-work">
            {chromeV2 ? <button
              ref={bookTitleButtonRef}
              type="button"
              className="lab-header-book"
              data-testid="lab-header-book"
              aria-label={`Switch books, currently ${book.bookTitle}`}
              aria-expanded={bookSwitcherOpen}
              aria-haspopup="dialog"
              onClick={openBookSwitcher}
            >
              <span>{book.bookTitle}</span>
            </button> : book.bookTitle}
          </h1>
          <span className="lab-title-sep" aria-hidden="true"> · </span>
          <button
            type="button"
            className="lab-header-chapter"
            data-testid="lab-header-chapter"
            aria-label={paintedChapterLabel ? `Table of contents, ${paintedChapterLabel}` : 'Table of contents'}
            onClick={() => { setGearOpen(false); setReaderControlsVisible(true); setTocOpen(true) }}
          >
            <span className="lab-header-chapter-label">{paintedChapterLabel}</span>
            <span className="lab-header-chevron" aria-hidden="true">∨</span>
          </button>
        </div>
        <div className="lab-header-controls">
          {chromeV2 ? ((!showPhoneChrome || phoneReaderControlsVisible) ? (
            <>
              <button
                type="button"
                className="lab-v2-play"
                data-testid="lab-v2-play"
                aria-label={listen.pending ? 'Cancel audio loading' : listen.playing ? LAB_COPY.pause : LAB_COPY.play}
                aria-busy={listen.pending || undefined}
                onClick={handleBarListen}
              >
                {listen.loading ? <LoadingIcon size={LAB_V2_PLAY_PX} /> : listen.playing && !listen.pending ? <PauseIcon size={LAB_V2_PLAY_PX} /> : <PlayIcon size={LAB_V2_PLAY_PX} />}
              </button>
              <LabSuperButton
                open={superMenuOpen}
                onToggle={handleSuperToggle}
                firstView={superFirstView}
                onFirstViewEnd={handleFirstViewEnd}
                reducedMotion={reducedMotion}
              />
            </>
          ) : null) : (<>
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
          </>)}
        </div>
        <p className="lab-status" data-testid="lab-status">
          {labStatusLine(
            labVisibleChrome(chrome, peekBook),
            paintedChapterLabel,
            showPhoneChrome ? 'phone' : 'desktop',
          )}
        </p>
      </header>}
      {bookSwitcherOpen && !frontispieceVisible && <LabBookSwitcher
        current={{ bookId: book.bookId || 'bible', title: book.bookTitle, chapterLabel: paintedChapterLabel, coverSrc: `/covers/v2/${book.bookId || 'bible'}.webp` }}
        rows={bookSwitcherRows}
        loading={bookSwitcherLoading}
        error={bookSwitcherError}
        onClose={() => setBookSwitcherOpen(false)}
        onSelect={switchQuickBook}
        onLibrary={() => { setBookSwitcherOpen(false); handleSuperMenuSelect('library') }}
      />}
      {chromeV2 && !frontispieceVisible && (
        <LabSuperMenu
          open={superMenuOpen}
          phone={showPhoneChrome}
          onSelect={handleSuperMenuSelect}
          onClose={() => setSuperMenuOpen(false)}
        />
      )}
      {chromeV2 && !frontispieceVisible && (
        <LabV2Sheet
          bookId={book.bookId || 'bible'}
          chapterNumber={book.chapterNumber}
          layer={superSheet}
          onLayer={setSuperSheet}
          onClose={() => setSuperSheet(null)}
          prefs={displayPrefs}
          phoneShakespeare={phoneShakespeare}
          onPrefs={updatePrefs}
          editions={bookEditions}
          audioEditions={matchingAudioEditions(prefs.primaryEdition, bookEditions).filter(edition => !isAudioHeld(book.bookId || 'bible', edition.key))}
          compare={(showPhoneChrome ? mobileCompareEnabled : desktopCompareEnabled)
            ? { active: showPhoneChrome ? mobileCompareActive : desktopCompareActive, onToggle: () => { setSuperSheet(null); (showPhoneChrome ? handleMobileCompare : handleDesktopCompare)() } }
            : null}
          compareUnavailable={!prefs.compareOpen ? false : unalignedCompare ? 'paragraphs' : compareChapterMissing ? 'chapter' : compareNumberingDiffers ? 'numbering' : !showPhoneChrome && pairedCompareUnavailable ? 'verses' : false}
          narrationPilot={{ info: narrationInfo, voice: narrationVoice }}
          returnTo={labBookSignInReturn(signInReturnTo, book.bookId, prefaceVisible || preparationCompanion || Boolean(chapterCoverTitle))}
        />
      )}
      {temporaryHold && holdRecovery && <div role="status" data-testid="edition-hold-recovery" style={{ padding: '12px 20px', borderBottom: '1px solid currentColor' }}>
        <strong>Preserved edition · recovery view</strong>
        <p>{TEMPORARY_HOLD_NOTICE} Your reading place and history will not advance in this view. Use Contents to access your highlights and notes.</p>
        <button type="button" onClick={() => setRecoveredHold(null)}>Review availability notice</button>{' '}
        <a href="/library">Return to the library</a>
      </div>}
      {readerLoadError && (
        <div className="lab-reader-load-error" role="alert" data-testid="lab-reader-load-error">
          <p>{readerLoadError}</p>
          {readerLoadAction && (
            <button type="button" className="lab-reader-load-action" data-testid="lab-reader-load-action"
              onClick={() => updatePrefs({ ...prefs, primaryEdition: readerLoadAction.primaryEdition, compareOpen: prefs.compareOpen && prefs.compareEdition !== readerLoadAction.primaryEdition })}>
              {readerLoadAction.label}
            </button>
          )}
          <a href="/lab/library">Return to the library</a>
        </div>
      )}


      <div className="lab-body">
        {!(showPhoneChrome && phoneAsk) && (
        <div
          className={`lab-page-wrap${chromeV2 && showPhoneChrome && !measuredPaging && settleIndex != null && settleIndex <= readingPageIndex ? ' is-measuring-visible-page' : ''}${initialResolving ? ' is-resolving' : ''}${chromeV2 && showPhoneChrome && mobileCompareEnabled ? ' can-swap' : ''}`}
          ref={pageWrapRef}
          data-testid="lab-page-wrap"
          aria-busy={initialResolving || undefined}
        >
          {chromeV2 && desktopCompareActive && <div className="lab-compare-divider" aria-hidden="true"><span>Compare</span></div>}
          {/* The version just swapped to, named for about a second and then
              gone. It sits on the page the reader landed on, every swap, and
              never stays: the page carries no running head. */}
          {chromeV2 && showPhoneChrome && versionPill && (
            <div
              key={versionPill.nonce}
              className="lab-v2-version-pill"
              data-testid="lab-v2-version-pill"
              role="status"
            >
              {versionPill.label}
            </div>
          )}
          {chapterCoverTitle ? (
            <LabChapterCover
              imageSrc={chromeV2 && chapterCoverTitle === book.bookTitle ? `/covers/v2/${book.bookId || 'bible'}.webp` : undefined}
              onLibrary={chapterCoverTitle === book.bookTitle ? () => handleSuperMenuSelect('library') : undefined}
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
              onBefore={chapterCoverTitle === book.bookTitle && approvedPreface ? () => setPrefaceCoverBook(book.bookId) : undefined}
              onStart={chapterCoverTitle === book.bookTitle ? () => goNext() : undefined}
              continued={Boolean(readerHandoff?.savedPlace && !readerHandoff.startAtSavedPlace)}
            />
          ) : <LabPassage
            pendingLayout={chromeV2 && measuredPaging && (nativeMeasuredContent !== readerParagraphs || desktopPaging && desktopMeasuredKey !== desktopLayoutKey)}
            onPreviewChapter={chromeV2 ? () => handleChapterChat('preview') : undefined}
            chapterActionsBusy={ask.typedLoading}
            chapterEnd={showChapterEnd ? <LabChapterEnd
              hasNext={nextLabChapter(book.chapters, book.chapterNumber) != null} onContinue={goNext}
              busy={ask.typedLoading} onDiscuss={() => handleChapterChat('discuss')}
            /> : undefined}
            desktopSpread={desktopSpread}
          nextChapterOpening={showChapterEnd && nextChapterOpening ? { ...nextChapterOpening, onPrimer: () => handleChapterChat('prepare') } : undefined}
            nextReadingPage={desktopSpread ? readingPages[readingPageIndex + 1] : undefined}
            alignCompare={desktopPaging}
            chapterTitle={book.chapterTitle}
            paragraphs={readerParagraphs}
            compareParagraphs={book.compareParagraphs}
            pageEndMarker={comparePageEndMarker}
            compare={desktopCompareActive && desktopCompareEnabled}
            mode={showPhoneChrome && showHearing ? 'hearing' : 'reading'}
            follow={(showHearing && listen.playing && (chromeV2 || !browseWhileListening) || chromeV2 && pausedTransportVisible && !listen.playing && !mobileCompareActive) ? listen.follow : { kind: 'none' }}
            followParagraphs={listen.followParagraphs}
            clips={listen.clips}
            playing={listen.playing}
            clipIndex={listen.clipIndex}
            currentTime={listen.currentTime}
            speed={listen.speed}
            browseWhileListening={browseWhileListening}
            inlineHearingPaint={chromeV2 && pausedTransportVisible && !listen.playing && !mobileCompareActive || showHearing && listen.playing && (chromeV2 ? (!showPhoneChrome || browseWhileListening) : !showPhoneChrome && !browseWhileListening)}
            onSeekToWord={listen.playing ? seekAudioToWord : undefined}
            onTogglePlay={() => {
              if (listen.isPending() || listen.playing) listen.pause()
              else if (listen.src) listen.resume()
              else void listen.start()
            }}
            onSeek={listen.seek}
            onCycleSpeed={listen.cycleSpeed}
            hideTransport
            markedIndexes={mobileCompareActive ? new Set<number>() : markedIndexes}
            onMark={mobileCompareActive ? undefined : handleMark}
            focusParagraph={focusParagraph}
            discussedParagraph={desktopVoiceOpen ? callParagraph : null}
            dimmed={voiceOverlayOpen}
            peek={chrome === 'hearing' && peekBook}
            readingPage={readingPage}
            chapterPages={readingPages}
            layoutKey={readerLayoutKey}
            highlights={mobileCompareActive ? highlightsApi.compareHighlights : highlightsApi.chapterHighlights}
            keyboardSelection={chromeV2}
            compareHighlights={highlightsApi.compareHighlights}
            chapterNumber={book.chapterNumber}
            selectingRange={selectionPopup?.range ?? null}
            selectingComparison={desktopCompareActive && selectionPopup?.side === 'compare'}
            pageTurn={chromeV2 ? undefined : pageTurn}
            tapZones={pageTurnAffordance.tapZones}
            onSelectRange={phoneAsk ? undefined : handleSelectRange}
            onSelectingChange={phoneAsk ? undefined : handleSelectingChange}
            onSelectionPageTurn={chromeV2 && !phoneAsk && !selectionPopup && !mobileCompareActive && !desktopCompareActive ? direction => { if (direction > 0) goNext(); else goPrev() } : undefined}
            onPageTurn={labPageTurnSurfaceEnabled({
              phoneChrome: showPhoneChrome,
              buttons: pageTurnAffordance.buttons,
              tapZones: pageTurnAffordance.tapZones,
              askOpen: phoneAsk,
              selectionOpen: selectionPopup != null,
            })
              ? (direction) => {
                  setReaderControlsVisible(false)
                  if (direction > 0) goNext()
                  else goPrev()
                }
              : undefined}
            onCompareSwap={chromeV2 && showPhoneChrome && mobileCompareEnabled && !phoneAsk && !selectionPopup
              ? handleMobileCompare
              : undefined}
            onToggleControls={showPhoneChrome && !phoneAsk && !selectionPopup
              ? () => setReaderControlsVisible(visible => !visible)
              : undefined}
          />}
          {desktopPaging && !chapterCoverTitle && !initialResolving && desktopMeasuredKey === desktopLayoutKey && nativeMeasuredContent === readerParagraphs && <div className="lab-desktop-page-footers" data-testid="lab-desktop-page-footers">
            <span>{desktopCompareActive && <b>{bookEditions.find(edition => edition.key === prefs.primaryEdition)?.style === 'original' ? 'Original' : 'Read'} · {primaryEditionLabel}</b>}<span>{labPageFolio(bookPageEstimate.page)}</span></span>
            <span>{desktopCompareActive ? <><b>{editionLabelFor(prefs.compareEdition, bookEditions).replace(/^Modern English$/i, 'Tinct Modern English')}</b><span>{labPageFolio(bookPageEstimate.page)}</span></> : chapterProgress.currentPage < chapterProgress.totalPages ? <span>{labPageFolio(bookPageEstimate.page + 1)}</span> : null}</span>
          </div>}
          {!chapterCoverTitle && measuredPaging && !desktopPaging && (
            <LabNativePaginator
              fillPages={chromeV2}
              chapterActions={chromeV2} hasNextChapter={canNextChapter}
              chapterTitle={book.chapterTitle}
              paragraphs={readerParagraphs}
              editionKey={readerEditionKey}
              layoutKey={layoutKeyFor(readerEditionKey)}
              onPages={applyNativePages}
            />
          )}
          {!chapterCoverTitle && desktopPaging && <LabDesktopPaginator
            chapterActions={chromeV2} hasNextChapter={canNextChapter}
            chapterTitle={book.chapterTitle} paragraphs={readerParagraphs}
            comparison={desktopCompareActive && desktopCompareEnabled ? book.compareParagraphs : undefined}
            editionKey={readerEditionKey}
            layoutKey={desktopLayoutKey} onPages={applyDesktopPages}
          />}
          {/* The next chapter's first leaf, measured only near this chapter's end. */}
          {!chapterCoverTitle && nextOpeningCurrent && readingPages.length > 0 && readingPageIndex >= readingPages.length - 4 && <LabDesktopPaginator
            chapterActions hasNextChapter
            chapterTitle={nextOpeningCurrent.title} paragraphs={nextOpeningCurrent.paragraphs}
            editionKey={readerEditionKey}
            layoutKey={nextOpeningLayoutKey} onPages={applyNextOpeningPages}
          />}
          {/* The standby edition, measured in the same box while nobody is
              looking at it. It writes a ref and touches no state, so it can
              never paint; the swap reads it and commits the incoming page in
              one go instead of showing an estimate and correcting it. */}
          {chromeV2 && !chapterCoverTitle && measuredPaging && mobileCompareEnabled && standbyParagraphs.length > 0 && (
            <LabNativePaginator
              fillPages={chromeV2}
              chapterActions={chromeV2} hasNextChapter={canNextChapter}
              chapterTitle={book.chapterTitle}
              paragraphs={standbyParagraphs}
              layoutKey={standbyKey}
              onPages={applyStandbyPages}
            />
          )}
          {!chapterCoverTitle && !measuredPaging && settleIndex != null && draftPages[settleIndex] && (
            <div
              className="lab-page-measure"
              ref={measureHostRef}
              aria-hidden="true"
              key={`${settleIndex}-${draftPages[settleIndex].from}-${draftPages[settleIndex].to}`}
            >
              <LabPageMeasurePaint
                chapterActions={chromeV2}
                chapterTitle={book.chapterTitle}
                paragraphs={readerParagraphs}
                page={draftPages[settleIndex]}
                hearingPaint={false}
              />
            </div>
          )}
        </div>
        )}
        {desktopVoiceOpen && !callMinimized && (
          <LabVoiceDesktopPanel
            preparationWelcome={preparationCompanion ? `Let’s prepare you for your reading of ${book.bookTitle}.` : undefined}
            view={callView}
            turns={callTurns}
            getAssistantLevel={ask.getAssistantLevel}
            reducedMotion={reducedMotion}
            notice={ask.notice}
            onMuteToggle={toggleCallMute}
            onEnd={endCall}
            onReconnect={reconnectCall}
            onMinimize={() => setCallMinimized(true)}
          />
        )}
        {desktopVoiceOpen && callMinimized && (
          <LabVoicePill
            view={callView}
            turns={callTurns}
            getAssistantLevel={ask.getAssistantLevel}
            reducedMotion={reducedMotion}
            onMuteToggle={toggleCallMute}
            onEnd={endCall}
            onReconnect={reconnectCall}
            onExpand={() => setCallMinimized(false)}
          />
        )}
        {((!showPhoneChrome && desktopAskOpen && !desktopVoiceOpen) || phoneAsk) && (
          <LabAskPane
            preparationSuggestions={preparationChat}
            chromeV2={chromeV2}
            focusTurnId={chromeV2 ? contentsConversation?.messages.find(message => message.role === 'user')?.id : undefined}
            onBackToContents={chromeV2 && contentsConversation ? returnToContents : undefined}
            dictationState={dictation.state}
            onStopVoice={chromeV2 ? (callOpen ? endCall : ask.stopVoice) : undefined}
            conversationState={ask.conversationState}
            voiceActive={ask.voiceActive}
            typedLoading={ask.typedLoading}
            turns={ask.turns}
            historyStatus={ask.historyStatus}
            draft={draft}
            attachment={askAttachment?.bookId === book.bookId ? askAttachment : null}
            onRemoveAttachment={() => setAskAttachment(null)}
            onDraftChange={(text) => { dictation.stop(); setDraft(text) }}
            onSubmit={(text) => { setPreparationChat(false); dictation.stop(); handleAsk(text) }}
            onMic={handleMic}
            onVoiceMode={chromeV2 ? () => {
              dictation.stop()
              handleTalk()
            } : handleVoiceMode}
            onRetry={ask.retryTyped}
            notice={chromeV2 ? (dictation.notice || ask.notice) : ask.notice}
            onDone={phoneAsk && !chromeV2 ? undefined : () => { setPreparationChat(false); dictation.stop(); closePhoneAsk() }}
            phoneSheet={!!phoneAsk}
            desktopCompanion={!showPhoneChrome ? (chrome === 'talking' ? 'talk' : 'chat') : undefined}
            onKeyboardOpenChange={setPhoneKeyboardOpen}
            inputRef={askInputRef}
            chapterLabels={Object.fromEntries(book.chapters.map(chapter => [chapter.number, chapter.title]))}
          />
        )}
        {/* V2 has no rail. Play is in the top bar and Compare, Chat and Talk
            are in the menu, which is what the menu is for — a rail beside it
            would be a second copy of the same four things. */}
        {!showPhoneChrome && !frontispieceVisible && !chromeV2 && (
          <nav className="lab-desktop-action-rail" data-testid="lab-desktop-action-rail" aria-label="Reader actions">
            <button
              type="button"
              className={`lab-desktop-action is-play${desktopCompareActive || listen.playing ? ' is-active' : ''}`}
              onClick={desktopCompareActive ? handleDesktopCompare : handleHeaderListen}
              aria-label={desktopCompareActive ? LAB_COPY.read : listen.pending ? 'Cancel audio loading' : (listen.playing ? LAB_COPY.pause : LAB_COPY.play)}
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
                  : listen.loading ? <LoadingIcon size={19} /> : (listen.playing && !listen.pending ? <PauseIcon size={19} /> : <PlayIcon size={19} />)}
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

      {(chromeV2 || listen.loading) && <span className="lab-visually-hidden" role="status" aria-live="polite">{listen.loading ? 'Loading audio. Tap Play again to cancel.' : ''}</span>}
      {!frontispieceVisible && <div className="lab-bottom-chrome" ref={bottomChromeRef} data-testid="lab-bottom-chrome" onPointerDown={() => { if (desktopPaging) setReaderControlsVisible(true) }}>
      {listen.narration.status === 'error' && <div className="lab-narration-inline" role="status" data-testid="lab-narration-error">
        <span title={listen.narration.message} aria-label={listen.narration.message}>{listen.narration.reason === 'unauthenticated'
          ? listen.narration.message
          : listen.narration.reason === 'budget_exhausted' ? 'Daily narration limit reached.'
          : listen.narration.reason === 'text_mismatch' ? 'Passage changed. Reload to play.'
          : 'Audio couldn’t start.'}</span>
        <button type="button" data-testid="lab-narration-retry" onClick={listen.retryNarration}>Retry</button>
        <button type="button" onClick={listen.dismissNarration} aria-label="Dismiss audio error">×</button>
      </div>}
      {chromeV2 && recentChapterReturn && !initialResolving && !contentsTarget && !phoneAsk && !desktopAskOpen
        && !mobileCompareActive && !listen.playing && readingPageIndex === 0
        && recentChapterReturn.libraryBookId === (book.bookId || 'bible')
        && recentChapterReturn.sequentialChapter === book.chapterNumber
        && recentChapterReturn.paragraphIndex < book.paragraphs.length
        && (!recentChapterReturn.primaryEditionKey || recentChapterReturn.primaryEditionKey === prefs.primaryEdition) && (
        <button type="button" className="lab-back-to-audio" data-testid="lab-continue-chapter" onClick={() => {
          openContentsPassage({ chapterNumber: book.chapterNumber, paragraphIndex: recentChapterReturn.paragraphIndex, wordIndex: recentChapterReturn.wordIndex })
        }}>Continue from last position</button>
      )}
      {chromeV2 && browseWhileListening && listen.playing && !phoneAsk && listen.follow.kind !== 'none' && (
        <button type="button" className="lab-back-to-audio" data-testid="lab-back-to-audio" onClick={() => {
          const follow = listen.follow
          if (follow.kind === 'none') return
          const wordIndex = follow.kind === 'word' ? follow.wordIndex : 0
          browseWhileListeningRef.current = false
          setBrowseWhileListening(false)
          setChapterCoverTitle(null)
          setReadingPageIndex(pageIndexForPlace(readingPages, follow.paragraphIndex, wordIndex))
        }}>Back to audio</button>
      )}
      {showReaderRail && (
        <nav className={`lab-page-turn ${showPhoneChrome ? 'is-phone-rail' : ''}`} data-testid="lab-page-turn" aria-label="Page">
          {(!chapterCoverTitle && !!currentOpeningTitle) || readingPageIndex > 0 || canPrevChapter ? (
            <button
              type="button"
              className={pageTurnAffordance.buttons ? 'lab-page-turn-btn' : 'lab-visually-hidden'}
              data-testid="lab-page-prev"
              aria-label={LAB_COPY.previous}
              onClick={goPrev}
            >
              {pageTurnAffordance.buttons ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg> : '←'}
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
              {chromeV2 && mobileCompareActive ? (
                <span className="lab-chapter-progress-info lab-v2-compare-mark" data-testid="lab-v2-compare-mark">{editionLabelFor(prefs.compareEdition, bookEditions).replace(/^Modern English$/i, 'Tinct Modern English')}</span>
              ) : (
                <span className="lab-chapter-progress-info">{footProgressLabel}</span>
              )}
            </button>
          ) : chromeV2 ? (
            <button type="button"
              className="lab-chapter-progress is-interactive"
              data-testid="lab-chapter-progress"
              aria-label={`${footProgressLabel}. Show ${readerProgressMode === 'book' ? 'chapter' : 'book'} progress`}
              onClick={() => setReaderProgressMode(mode => mode === 'book' ? 'chapter' : 'book')}
            >
              <span className="lab-chapter-progress-info">{footProgressLabel}</span>
            </button>
          ) : (
            <div className="lab-chapter-progress" data-testid="lab-chapter-progress"><span className="lab-chapter-progress-info">{footProgressLabel}</span></div>
          )}
          {chapterCoverTitle || readingPageIndex < labNavPageList(pagesStableRef.current, draftPages, readingPages).length - 1 || canNextChapter ? (
            <button
              type="button"
              className={pageTurnAffordance.buttons ? 'lab-page-turn-btn' : 'lab-visually-hidden'}
              data-testid="lab-page-next"
              aria-label={LAB_COPY.next}
              onClick={() => goNext()}
            >
              {pageTurnAffordance.buttons ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg> : '→'}
            </button>
          ) : (
            !showPhoneChrome ? <span className="lab-page-turn-spacer" /> : null
          )}
        </nav>
      )}

      {desktopAudioBarActive && (
        <section className="lab-desktop-audio-dock" data-testid="lab-desktop-audio-dock" aria-label="Audio player">
          <button type="button" className="lab-desktop-audio-speed" data-testid="lab-hearing-speed" onClick={() => setSpeedPopoverOpen(open => !open)} aria-label={`Playback speed ${listen.speed} times`} aria-expanded={speedPopoverOpen}>{listen.speed}×</button>
          <button type="button" data-testid="lab-hearing-back" onClick={() => listen.seek(-15)} aria-label="Back 15 seconds"><SkipIcon direction="back" /></button>
          <button type="button" className="is-primary" data-testid="lab-hearing-pause" onClick={handleHeaderListen} aria-busy={listen.pending || undefined} aria-label={listen.pending ? 'Cancel audio loading' : chromeV2 && !listen.playing ? 'Resume audiobook' : LAB_COPY.pause}>{listen.loading ? <LoadingIcon size={22} /> : listen.pending || (chromeV2 && !listen.playing) ? <PlayIcon size={22} /> : <PauseIcon size={22} />}</button>
          <button type="button" data-testid="lab-hearing-forward" onClick={() => listen.seek(30)} aria-label="Forward 30 seconds"><SkipIcon direction="forward" seconds={30} /></button>
          <div className="lab-desktop-audio-track">
            <strong>{book.bookTitle}</strong>
            <span>{editionLabelFor(narrationOption || retainedBella ? prefs.primaryEdition : audioEditionKey, bookEditions)}</span>
            <i
              role="slider"
              tabIndex={0}
              aria-label="Chapter position"
              aria-valuemin={0}
              aria-valuemax={Math.max(1, Math.round(listen.chapterDuration))}
              aria-valuenow={Math.round(listen.chapterTime)}
              aria-valuetext={`${Math.round(listen.chapterTime)} of ${Math.round(listen.chapterDuration)} seconds${listen.chapterDurationEstimated ? ', estimated total' : ''}`}
              onPointerDown={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                listen.seekChapter(((event.clientX - rect.left) / Math.max(1, rect.width)) * listen.chapterDuration)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') { event.preventDefault(); listen.seekChapter(Math.max(0, listen.chapterTime - 15)) }
                if (event.key === 'ArrowRight') { event.preventDefault(); listen.seekChapter(Math.min(listen.chapterDuration, listen.chapterTime + 30)) }
              }}
            ><b style={{ width: `${Math.max(0, Math.min(100, (listen.chapterTime / Math.max(1, listen.chapterDuration)) * 100))}%` }} /></i>
          </div>
          {chromeV2 && !listen.playing && !listen.pending && listen.narration.status !== 'error' && <button type="button" className="lab-desktop-audio-dismiss" aria-label="Close audio controls"
            onClick={() => { setPausedTransportVisible(false); setSpeedPopoverOpen(false) }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg></button>}
        </section>
      )}

      {chromeV2 && showPhoneChrome && audioBarActive && !listen.playing && !listen.pending && listen.narration.status !== 'error' && !phoneAsk && <button
        type="button" className="lab-audio-dismiss" aria-label="Close audio controls"
        onClick={() => { setPausedTransportVisible(false); setSpeedPopoverOpen(false) }}
      >×</button>}

      {(audioBarActive || desktopAudioBarActive) && speedPopoverOpen && (
        <section
          id="lab-audio-speed-popover"
          className="lab-audio-speed-popover"
          data-testid="lab-audio-speed-popover"
          aria-label="Playback speed"
        >
          <div className="lab-audio-speed-heading">
            <span>Playback speed</span>
            <output htmlFor="lab-audio-speed-slider">{listen.speed}×</output>
            {chromeV2 && <button type="button" className="lab-audio-speed-done" onClick={() => setSpeedPopoverOpen(false)}>Done</button>}
          </div>
          <input
            id="lab-audio-speed-slider"
            className={chromeV2 ? 'lab-v2-slider' : undefined}
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

      {chromeV2 && ask.notice && !(showPhoneChrome ? phoneAsk : desktopAskOpen) && !callOpen && (
        <aside className="lab-v2-notice" role="alert" data-testid="lab-voice-notice">
          <p>{ask.notice}</p>
          <button type="button" className="lab-v2-notice-dismiss" onClick={ask.dismissNotice} aria-label="Dismiss message">×</button>
          {/balance|credit|messages remaining|top up/i.test(ask.notice) && (
            <button type="button" onClick={() => setSuperSheet('account')}>View account</button>
          )}
        </aside>
      )}
      {showPhoneBar && (
        <footer className="lab-phone-bar" data-testid="lab-phone-bar">
          {!chromeV2 && ask.notice && !phoneAsk && (
            <p className="lab-phone-notice" data-testid="lab-voice-notice">{ask.notice}</p>
          )}
          <div className={`lab-phone-bar-row ${audioBarActive ? 'is-audio has-5' : `is-read ${mobileCompareEnabled ? 'has-4' : 'has-3'}`}`}>
            {audioBarActive ? (
              // V2 reads speed · back · pause · forward · Talk, with the
              // pause where a thumb sits; V1 keeps the order it ships with.
              <>{(chromeV2
                ? ['speed', 'back', 'pause', 'forward', 'talk'] as const
                : ['pause', 'back', 'speed', 'forward', 'talk'] as const
              ).map(control => ({
                pause: (
                  <button key="pause" type="button" className="lab-phone-fat lab-audio-control is-active" onClick={handleBarListen} aria-busy={listen.pending || undefined} aria-label={listen.pending ? 'Cancel audio loading' : chromeV2 ? (listen.playing ? 'Pause audiobook' : 'Resume audiobook') : 'Pause and return to reading'} data-testid="lab-listen">
                    <span data-testid="lab-hearing-pause" className="lab-visually-hidden">{chromeV2 && !listen.playing ? 'Resume' : LAB_COPY.pause}</span>
                    {listen.loading ? <LoadingIcon size={21} /> : listen.pending || (chromeV2 && !listen.playing) ? <PlayIcon size={21} /> : <PauseIcon size={21} />}
                  </button>
                ),
                back: (
                  <button key="back" type="button" className="lab-phone-fat lab-audio-control" data-testid="lab-hearing-back" aria-label="Back 15 seconds" onClick={() => listen.seek(-15)}>
                    <SkipIcon direction="back" />
                  </button>
                ),
                speed: (
                  <button
                    key="speed"
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
                ),
                forward: (
                  <button key="forward" type="button" className="lab-phone-fat lab-audio-control" data-testid="lab-hearing-forward" aria-label="Forward 15 seconds" onClick={() => listen.seek(15)}>
                    <SkipIcon direction="forward" />
                  </button>
                ),
                talk: (
                  <button key="talk" type="button" className="lab-phone-fat lab-audio-control" onClick={handleTalk} aria-label={LAB_COPY.talk} data-testid="lab-phone-talk">
                    <TalkIcon />
                  </button>
                ),
              }[control]))}</>
            ) : (
              <>
                <button
                  type="button"
                  className="lab-phone-fat"
                  onClick={handleBarListen}
                  aria-label={listen.pending ? 'Cancel audio loading' : barPrimaryLabel}
                  aria-busy={listen.pending || undefined}
                  data-reader-action={mobileCompareActive ? 'read' : 'listen'}
                  data-testid="lab-listen"
                >
                  {mobileCompareActive || (barReturnsFromConversation && returnTo === 'reading') ? (
                    <span data-testid="lab-reader-primary-read-icon" aria-hidden="true">
                      <ReadIcon size={18} />
                    </span>
                  ) : (
                    <span className="lab-header-play" data-testid="lab-listen-play" aria-hidden="true">
                      {listen.loading ? <LoadingIcon size={18} /> : <PlayIcon size={18} />}
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
        active={ask.voiceActive && !(chromeV2 && callOpen)}
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

      {audioUnavailableNotice && <div className="lab-audio-unavailable" role="status">
        <span>{audioHeld && !isAudioHeld(book.bookId || 'bible', audioEditionKey) ? 'Audio is temporarily unavailable for this chapter. Other chapters are available. You can keep reading.' : 'Audio is temporarily unavailable for this edition. You can keep reading.'}</span>
        <button type="button" onClick={() => setAudioUnavailableNotice(false)} aria-label="Dismiss audio notice">×</button>
      </div>}
      <LabSettingsSheet
        open={gearOpen}
        section={settingsSection}
        onSection={setSettingsSection}
        onClose={() => setGearOpen(false)}
        prefs={displayPrefs}
        phoneShakespeare={phoneShakespeare}
        onPrefs={updatePrefs}
        editions={bookEditions.filter(edition => isEditionDiscoverable(book.bookId || 'bible', edition) || edition.key === prefs.primaryEdition || edition.key === prefs.compareEdition)}
        unavailableEditionKeys={bookEditions.filter(edition => !isEditionDiscoverable(book.bookId || 'bible', edition)).map(edition => edition.key)}
        audioEditions={matchingAudioEditions(prefs.primaryEdition, bookEditions).filter(edition => !isAudioHeld(book.bookId || 'bible', edition.key))}
        onOpenThisBook={() => {
          setGearOpen(false)
          setPhoneAskOpen(false)
          setInTheBookOpen(true)
          setPeekBook(chrome === 'hearing')
        }}
        desktop={!showPhoneChrome}
        returnTo={labBookSignInReturn(signInReturnTo, book.bookId, prefaceVisible || preparationCompanion || Boolean(chapterCoverTitle))}
        onLeaveToLibrary={rememberLibraryPlace}
      />

      <LabAccountSheet
        open={accountPrompt !== null}
        action={accountPrompt?.action ?? 'chat'}
        returnTo={labBookSignInReturn(signInReturnTo, book.bookId, prefaceVisible || preparationCompanion || Boolean(chapterCoverTitle))}
        onClose={closeAccountPrompt}
        desktop={!showPhoneChrome}
      />

      {prefaceCoverBook === book.bookId && approvedPreface && <LabBookPreface
        open={prefaceVisible && accountPrompt === null}
        key={approvedPreface.bookId}
        preface={approvedPreface} title={book.bookTitle} cover={`/covers/v2/${approvedPreface.bookId}.webp`}
        continued={readerHandoff ? Boolean(readerHandoff.savedPlace && !readerHandoff.startAtSavedPlace) : Boolean(boot.resume)}
        ready={!initialResolving && book.paragraphs.length > 0}
        cast={book.cast}
        editions={bookEditions}
        audioEditions={matchingAudioEditions(prefs.primaryEdition, bookEditions).filter(edition => !isAudioHeld(book.bookId || 'bible', edition.key))}
        audioChoice={prefs.audioFollowsPrimary === false ? prefs.audioEdition : ''}
        onAudioChoice={value => updatePrefs({ ...prefs, audioEdition: value || prefs.primaryEdition, audioFollowsPrimary: value === '' })}
        primaryEdition={prefs.primaryEdition}
        secondaryEdition={prefs.compareOpen ? prefs.compareEdition : ''}
        onEditions={(primary, secondary) => updatePrefs({ ...prefs, primaryEdition: primary, compareEdition: secondary || prefs.compareEdition, compareOpen: Boolean(secondary) })}
        onBack={() => setPrefaceCoverBook(null)}
        onAsk={(question) => {
          preparationReturnRef.current = book.bookId || 'bible'
          setPreparationCompanion(true)
          setPreparationChat(true)
          setDraft(question)
          handleChat()
        }}
        onTalk={() => {
          preparationReturnRef.current = book.bookId || 'bible'
          setPreparationCompanion(true)
          handleTalk()
        }}
        onRead={() => {
          setPrefaceCoverBook(null)
          if (chapterCoverTitle === book.bookTitle) goNext()
          // Programmatic focus is useful for a hardware keyboard, but WebKit
          // paints it as a focus-visible ring after a touch-only book entry.
          if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches) {
            requestAnimationFrame(() => labRootRef.current?.querySelector<HTMLButtonElement>('[data-testid="lab-header-chapter"]')?.focus({ preventScroll: true }))
          }
        }}
      />}
      {chromeV2 && <LabContentsV2
        onSwitchBook={openBookSwitcher}
        open={tocOpen}
        bookId={book.bookId || 'bible'}
        title={book.bookTitle}
        editionKey={prefs.primaryEdition}
        editionLabel={primaryEditionLabel}
        chapters={book.chapters}
        chaptersReady={!book.chaptersProvisional}
        sections={book.sections}
        currentChapter={book.chapterNumber}
        currentPage={chapterProgress.currentPage}
        totalPages={chapterProgress.totalPages}
        currentPercent={chapterProgress.percent}
        statuses={pickerStatuses}
        conversations={ask.conversations}
        historyStatus={ask.historyStatus}
        highlights={highlightsApi.highlights}
        unassignedHighlights={highlightsApi.unassignedHighlights}
        onSelectChapter={number => openContentsPassage({ chapterNumber: number, paragraphIndex: 0, wordIndex: 0 }, undefined, true)}
        onOpenPassage={place => openContentsPassage(place)}
        onContinueConversation={conversation => openContentsPassage({ chapterNumber: conversation.chapterNumber, paragraphIndex: conversation.paragraphIndex || 0, wordIndex: 0 }, conversation)}
        onOpenCover={() => {
          listen.pause()
          setTocOpen(false)
          setPrefaceCoverBook(null)
          setChapterCoverTitle(book.bookTitle)
        }}
        onOpenPreface={approvedPreface ? () => {
          listen.pause()
          setTocOpen(false)
          // Keep the real cover mounted behind the dialog. The preface's Back
          // transition measures this exact target before returning to it.
          setChapterCoverTitle(book.bookTitle)
          setPrefaceCoverBook(book.bookId || 'bible')
        } : undefined}
        onWarmChapter={warmChapterTexts}
        onClose={() => setTocOpen(false)}
      />}
      {tocOpen && !chromeV2 && (
        <div className="lab-toc" data-testid="lab-toc">
          <LabPhoneBibleTree
            quickBookNavigation={chromeV2}
            title={book.bookTitle}
            chapters={book.chapters}
            currentChapter={book.chapterNumber}
            sections={book.sections}
            finishedChapters={labFinishedChapterSet(pickerStatuses)}
            statuses={pickerStatuses}
            highlights={highlightsApi.highlights}
            conversations={ask.conversations}
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

      {showPhoneChrome && !voiceCallSurface && voiceGate !== 'off' && (
        <LabVoiceGate phase={voiceGate === 'ready' ? 'ready' : 'connecting'} />
      )}

      {callFullScreen && (
        <LabVoiceCall
          preparationWelcome={preparationCompanion ? `Let’s prepare you for your reading of ${book.bookTitle}.` : undefined}
          view={callView}
          getAssistantLevel={ask.getAssistantLevel}
          reducedMotion={reducedMotion}
          notice={ask.notice}
          bookLine={callBookLine}
          utterance={callUtterance}
          onMuteToggle={toggleCallMute}
          onEnd={endCall}
          onReconnect={reconnectCall}
        />
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
            ? highlightsApi.allHighlights.find(highlight => highlight.id === selectionPopup.existingHighlightId)?.color
            : undefined}
          onColorClick={(color: HighlightColor) => {
            if (selectionPopup.existingHighlightId) {
              highlightsApi.setColor(selectionPopup.existingHighlightId, color)
            } else if (selectionPopup.range) {
              const created = highlightsApi.addOrReuse(selectionPopup.range, color, selectionPopup.editionKey)
              setSelectionPopup(current => current ? { ...current, existingHighlightId: created.id } : current)
            }
          }}
          defineQuery={define.query}
          setDefineQuery={define.setQuery}
          defineResult={define.result}
          defineLoading={define.loading}
          defineNotFound={define.notFound}
          runDefine={define.run}
          onDefine={() => {
            // Define stays on the clicked word even when every other action
            // has been widened to the highlight around it.
            const lookup = selectionPopup.defineText || selectionPopup.text
            if (lookup) define.begin(lookup)
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
          onRequestNote={(color) => {
            if (!selectionPopup.existingHighlightId && selectionPopup.range) {
              const created = highlightsApi.addOrReuse(selectionPopup.range, color ?? 'gold', selectionPopup.editionKey)
              setSelectionPopup(current => current ? {
                ...current,
                existingHighlightId: created.id,
                existingNote: created.note,
              } : current)
            }
            setPopupMode('note')
          }}
          onExplanationReady={(answer) => ask.keepExplanation(selectionPopup.text, answer, selectionPopup.paragraphIndex, { bookId: book.bookId || 'bible', chapterNumber: book.chapterNumber })}
          onExplain={(answer) => {
            const text = selectionPopup.text
            if (answer) ask.keepExplanation(text, answer, selectionPopup.paragraphIndex)
            dismissSelectionPopup()
            handleChat()
            setAskAttachment({ bookId: book.bookId, text })
            setDraft('')
          }}
          onTalkExplanation={(answer) => {
            ask.keepExplanation(selectionPopup.text, answer, selectionPopup.paragraphIndex)
            dismissSelectionPopup()
            // Let the explanation enter the hook's context before starting voice.
            requestAnimationFrame(() => handleTalk())
          }}
          onRequestExplanation={(onDelta, text, intent) => {
            const editionKey = selectionPopup.editionKey || readerEditionKey
            const compare = editionKey === prefs.compareEdition && editionKey !== prefs.primaryEdition
            return ask.explainSelection({
              text: text ?? selectionPopup.text,
              intent,
              editionKey,
              editionLabel: editionLabelFor(editionKey, bookEditions),
              paragraphs: compare ? book.compareParagraphs : book.paragraphs,
              paragraphIndex: selectionPopup.paragraphIndex,
            }, onDelta)
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
