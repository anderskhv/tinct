import { readingChatTurns, readingChatFocusTurn } from './readingChatTurns'
import { useReadingScrollActivity } from './sharedReader/useReadingScrollActivity'
import { ReaderNotebookIcon } from './ReaderNotebookIcon'
import { bibleBookTransition } from '../narration/bookTransition'
import { consumeDismissGesture } from '../utils/consumeDismissGesture'
import { useRecapPreparation } from './useRecapPreparation'
import type {ChapterSelectionPart,SelectionChapter} from './labChapterSelection'
import { readNarrationReplay, storeNarrationReplay } from './narrationReplayCache'
import { useDesktopCommands, useDesktopAppearance } from '../desktopCommands'
import { lookupWordAtPoint } from './labLookupWord'
import { registerLoadedChapter } from './labPoetry'
import { useBackCloses } from './useBackCloses'
import { editionHold, TEMPORARY_HOLD_NOTICE } from '../data/editionAvailability'
import { EditionHoldPanel } from './EditionHoldPanel'
import { usesRetainedBella } from '../narration/bellaRetention'
import { ReadIcon, ChatIcon, TalkIcon, LoadingIcon } from './LabReaderIcons'
import { useDesktopDockPlacement } from './labAudioDock'
import { isAudioHeld } from '../data/audioAvailability'
import { useCharacterCards } from '../services/characters/useCharacterCards'
import { useLabAutoOffline } from './useLabAutoOffline'
import { offlineEditionKeys } from './labOfflineBook'
import { useChapterFootnotes, type PlacedFootnote } from './labFootnotes'
import { LabFootnote, type OpenFootnote } from './LabFootnote'
import { namesakesAt, resolveCharacter, wordSelectionOffsets } from '../services/characters/characterCards'
import { LabBookSwitcher } from './LabBookSwitcher'
import { LabWait } from './LabWait'
import { LabChapterEnd } from './LabChapterEnd'
import { LabChapterNoteEditor } from './LabChapterNoteEditor'
import { useFinishedCard } from '../social/useFinishedCard'
import { CHAPTER_CHAT_MESSAGES, createChapterChatRequest, recapHighlightPassages } from './labChapterChat'
import { LabDesktopPaginator, type LabLeafCapacity } from './LabDesktopPaginator'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { sourceAuthorship, withAuthorship } from '../companion/authorship'
import {
  applyNarrationPilotFlag,
  ensureNarration,
  ensureOwnNarration,
  fetchNarrationPilotInfo,
  initialNarrationPilotInfo,
  narrationPilotApplies,
  narrationPilotFlag,
  resolveNarrationVoice,
  type NarrationPilotInfo,
  type NarrationParagraphResult,
} from './labNarration'
import { readSupabaseAccessToken } from './labAuth'
import { useLabFunnel } from './useLabFunnel'
import { useLabListenReport } from './useLabListenReport'
import { trackFunnel, trackFunnelOnce } from '../utils/funnel'
import { apiUrl } from '../utils/apiUrl'
import { useNarrationPrefetch } from './useNarrationPrefetch'
import { useVoicePersonaSync } from './useVoicePersonaSync'
import { useSwipeDownClose } from './useSwipeDownClose'
import { flushSync } from 'react-dom'
import { readerPreviewSearch } from '../../public/lab/library-model.js'
import { sharedReaderDestination } from './sharedReader/sharedReaderFlag'
import { ContinuousReader } from './sharedReader/ContinuousReader'
import { pdfReaderViewUrl } from './userBook/pdfReaderHandoff'
import { marginChapterBoundary, marginSourceWord, type MarginSourceAnchor } from './sharedReader/marginSource'
import { withConvertedNote, askCardSource, isSourcePoint } from './sharedReader/sharedReaderCards'
import { SourceMarginRail, type SourceMarginEntry } from './sharedReader/SourceMarginRail'
import { LabFigurePreview } from './LabFigurePreview'
import { LabInlineMarkdown } from './LabMarkdown'
import { LabDesktopCard } from './sharedReader/LabDesktopCard'
import { acceptContinuousReaderPlace, type ContinuousReaderEpoch } from './sharedReader/continuousReaderEpoch'
import { leaveForLibrary } from './labLeaveForLibrary'
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
  labKeyboardPageDirection,
  nextPaintShrinkTo,
  type LabPageAdjust,
  type LabPageMetrics,
  type LabChromeState,
  type LabReturnTo,
  LAB_PHONE_QUERY,
  labPageTurnAffordance,
  labPageTurnSurfaceEnabled,
  labNeedsGestureAudioUnlock,
  labPhoneSurfaceInput,
} from './labChrome'
import { LabContentsV2, type LegacyOwnEpubNotebookItem } from './LabContentsV2'
import type { OwnTextCardsSync } from './userBook/ownTextCardsSync'
import { userBookEditionKey as ownSourceEditionKey } from './userBook/userBookSource'
import type { ContentsPlace } from './labContents'
import { readLabBookChat } from './labChatHistory'
import { labChapterStatuses } from './labChapterStatus'
import { loadChapterText, readDeviceReadingMemory } from '../readingMemory'
import { useAuth } from '../hooks/useAuth'
import { useLabReadingYear } from './useLabReadingYear'
import { LabSuperButton } from './LabSuperButton'
import { LabSuperMenu } from './LabSuperMenu.tsx'
import { LabV2Sheet } from './LabV2Sheet.tsx'
import { CATCH_UP_TITLE, LabCatchUpSheet } from './LabCatchUpSheet'
import { LabOwnCatchUpSheet } from './userBook/LabOwnCatchUpSheet'
import { getLibraryMeta } from '../data/libraryTaxonomy'
import { LabFigureCard } from './LabFigure'
import { figureReadingText, type LabFigure } from './labFigures'
import { figureImageBlock } from './labFigureImage'
import { LabShareSheet, type LabShareTarget } from './LabShareSheet'
import type { OwnChapterNotesSource } from './userBook/ownChapterNotes'
import { LabChapterNotesSheet } from './LabChapterNotesSheet'
import { chapterNotesText, saveExplanation } from './labChapterNotes'
import type { ChapterNotesBeat, ChapterNotesKind, ChapterNotesRequest } from '../chapterNotes'
import { LAB_V2_VERSION_PILL_MS, labPrefsForMainEdition, type LabV2SheetLayer } from './labV2Sheet'
import { formatModernPrice, markPendingPurchase, MODERN_EDITION_KEY, MODERN_PREMIUM_REQUIRED, startModernCheckout, useLabModernEdition, type ModernVisible } from './labModernEdition'
import { LabModernReadyNotice, LabModernWait, MODERN_WAIT_COPY } from './LabModernWait'
import { cancelModernCheckout } from './labModernEditionApi'
import { isPublicBookId, modernEditionsEnabled } from '../../public/lab/public-books.js'
import { LAB_SUPER_FIRST_VIEW_DELAY_MS, LAB_V2_PLAY_PX } from './labSuperGlyph'
import type { LabSuperMenuId } from './labSuperMenu'
import {
  labLineHeight, labMarginScale, labParagraphGap,
  LAB_LIBRARY_URL,
  labLibraryIntroductionUrl,
  bibleEditions,
  labFontFamilyCss,
  labReadingFont,
  labDesktopDefaultFontSize,
  labReadingFontSize,
  labFootProgress,
  labBookPageEstimate,
  labPageFolio,
  labReaderProgressLabel,
  readStoredWordsPerPage,
  proseChapter,
  MIN_WORDS_PER_PAGE,
  storeWordsPerPage,
  defaultReaderProgressMode,
  readStoredReaderProgressMode,
  storeReaderProgressMode,
  initialLabCompareView,
  readStoredCompareView,
  storeCompareView,
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
  labSignInUrl,
} from './labPrefs'
import { consumeCardParam } from '../cards/cardsBoot'
import { useFollowRequestDot } from '../social/useFollowRequestDot'
import type { CardName } from '../cards/cardRoutes'
import { savedPlaceFallbackEditionKey } from '../data/editionDefaults'
import { matchingAudioEditions, resolvedAudioIsAvailable } from '../utils/audioEditionSelection'
import { labLayoutOverride } from './labRoute'
import { holdPlaceWrite, labRestoreChapterKey, restoreLanded, restoreRetryIndex, restoreTargetFor, restoreTargetIn, type LabRestoreView, type LabRestoreWatch } from './labRestoreTarget'
import { useLabDictation } from './useLabDictation'
import { buildDictationKeyterms } from './labDictationKeyterms'
import { LabAskPane } from './LabAskPane'
import { LabNativePaginator, shrinkNativePageAfterPaint } from './LabNativePaginator'
import { LabChapterCover } from './LabChapterCover'
import { LabVoiceActionPanel } from './LabVoiceActionPanel'
import { LabVoiceCall } from './LabVoiceCall.tsx'
import { LabVoiceDesktopPanel, LabVoicePill } from './LabVoiceDesktop.tsx'
import { labCallRestore, labCallView, type LabCallAnchor } from './labVoiceCall'
import { LabPageMeasurePaint, LabPassage } from './LabPassage'
import { LabInTheBook } from './LabInTheBook'
import { readerEditionLabel } from './editionDifficulty'
import { bibleEditionHasChapter, bibleVerseNumbersCorrespond } from '../data/bibleEditionChapters'
import { withTextRetries } from './labTextRetry'
import { bibleBookOpeningTitle, bibleFallbackSource, loadLabBookSource, nextLabChapter, prevLabChapter, prefetchLabChapterTexts, type LabMark, type LabSource } from './labSource'
import { bootLabReading, remoteResumeSelection, useLabPositionSync } from './useLabPositionSync'
import { readCachedSupabaseUser, readLabLibraryBootSnapshot, snapshotWithReaderPlace, writeLabLibraryBootSnapshot } from './labLibraryBoot'
import { LAB_THEME_PAPER } from './readerBoot'
import { hyphenLangForEdition, loadHyphenator } from './labHyphenate'
import { LAB_READER_HANDOFF_KEY, consumeLabReaderHandoffForPage, deepLinkViewForPage, modernReturnForPage, sharedLinkForPage, pendingLabSourceForHandoff, prefsFromLabReaderHandoff, prefsFromLabResumePlace, releaseLabReaderHandoffForPage } from './labReaderHandoff'
import { initialDesktopReaderLayout, storeDesktopReaderLayout } from './labDesktopLayout'
import { marginPreviewOptedIn } from './marginPreview/marginPreviewFlag'
import { isMarginPreviewBook, marginPreviewReturnHref } from './marginPreview/marginPreviewModel'
import { accountLabPositionRecord, recentChapterPlace, type LabBookPlace, type LabReaderStateSnapshot } from './labPosition'
import { isResumeListenCommand, resolveLabPlaybackSkip, type LabPlaybackSkip } from './labAsk'
import { adjacentPageIndex, applyPaintShrink, canUseLabPageBudget, chapterHearingPages, chapterPageSegments, chapterPageTail, clampedChapterProgress, cutPageTailTo, followOnReadingPage, growPageByFirstOmittedWord, growPageByWords, growPaintedPageIfSlack, labChapterProgress, labNavPageList, labPageBudgetFromMetrics, leftoverWordCount, listeningSentenceStart, pageAnchorOf, pageIndexForPlace, reflowAfterCut, restorePageIndexForAnchor, sameChapterPages, snapShrinkEndToSentence, tokenizeHearingWords, type ChapterHearingPage } from './labHearing'
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
import { clearLabAiActionCount, labCurrentPath, type LabAccountPromptRequest } from './labAccountPrompt'
import { narrationBridgeUrls, useLabListen, type NextChapterAudio } from './useLabListen'
import { labComparePassagePages, mapLabCompareAnchor, mapLabCompareEnd, type LabCompareAnchor } from './labCompare'
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
import { isUserBookId, ownBookOpenUrl, USER_BOOKS_SHELF_URL, userBookHex } from './userBook/userBookId'
import { registerUserBook, userBookLabSource } from './userBook/userBookSource'
import { userBookLangAttribute } from './userBook/userBookLanguage'
import { readUserBookPlace, writeUserBookPlace } from './userBook/userBookPlace'
import { flushOwnPlaces, noteOwnPlace, notePdfPlace } from './userBook/ownSync'
import { choosePdfPageAt, PDF_PAGES_EDITION_KEY, showPdfPageAt } from './userBook/pdfEditions'
import { chooseEpubMargin, EPUB_MARGIN_EDITION_KEY } from './userBook/epubView'
import type { LoadedUserBook } from './userBook/userBookStore'
import { readerMediaSession, readerMediaMetadata } from '../utils/readerMediaSession'
import { continueHandoff } from '../preReader/continueHandoff'
import { ownQuickBookRows, quickBookCompletedIds, quickBookPositions, quickBookRows, withOwnBookRows, type QuickAddedBooks, type QuickBookCatalogueEntry, type QuickBookRow } from '../preReader/quickBookSwitcher'
import { ownReadingNow, readOwnShelf } from './userBook/ownShelf'
import { ownReadingNowWithAccount } from './userBook/ownSync'
import { loadShelfMembership, readShelfMembership } from '../libraryTwoSaved'
import { resolveBookCover } from '../../public/lab/book-cover.js'
import { fetchPublicBooksIndex, mentionsPublicBook, registeredPublicCover, registeredPublicEntries } from '../utils/publicBooks'
import { MarginPhoneContext, catchUpAvailable, unitName, type MarginPhonePills } from './marginPhone/marginPhoneContext'
import { LabPhoneBar, lastHighlightColor, type PhoneMoreId } from './marginPhone/LabPhoneBar'
import { LabPhoneCard } from './marginPhone/LabPhoneCard'
import { flashNotebookPassage } from './marginPhone/flashNotebookPassage'
import { markPhoneCardPassage, type PhoneCardRange } from './marginPhone/phoneCardPassage'
import { liveCardFollowupTurns, PHONE_CARD_NAMES, PhoneCharacterBody, PhoneFollowField, PhoneNoteBody, PhonePassageBody, PhoneQuizBody, PhoneStreamAnswer, PhoneTalkFrame, type PhoneCard, type PhonePassage } from './marginPhone/LabPhoneCards'
import { contextualLookupPreview, parseContextualLookup } from '../components/reader/contextualLookup'
import { ContextualLookupView, DefinitionFallback } from '../components/reader/DefinitionFallback'
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
  return labPhoneSurfaceInput(layoutOverride)
}

/** How long the first page's fade-in class stays; the animation itself is shorter (lab.css). */
const LAB_FIRST_REVEAL_MS = 400
/** Longest a page turn waits for the rest of a head-first chapter map before using the one it has. */
const LAB_HEAD_FIRST_HOLD_MS = 3000
/** Whether the map on screen is a head-first map whose rest is still being laid out (LabNativePaginator `headFirst`). */
function headFirstPending(since: number): boolean {
  return since > 0 && performance.now() - since < LAB_HEAD_FIRST_HOLD_MS
}
/** Longest the first text waits for hyphenation patterns before paging without them. */
const LAB_HYPHENATION_WAIT_MS = 300

/** The account cards' code (views, styles), fetched the first time a card opens. */
let accountCardsModule: Promise<typeof import('../cards/openCards')> | null = null
function loadAccountCards(): Promise<typeof import('../cards/openCards')> {
  accountCardsModule ??= import('../cards/openCards').catch((error) => {
    accountCardsModule = null
    throw error
  })
  return accountCardsModule
}
/** Close the cards if they were ever opened in this page (never loads them to close). */
function closeLoadedAccountCards(): void {
  void accountCardsModule?.then(cards => cards.closeAccountCards(), () => {})
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

/** The device needs the narration element unlocked inside a companion-opening tap (labNeedsGestureAudioUnlock). */
function readNeedsGestureAudioUnlock(): boolean {
  if (typeof window === 'undefined') return false
  const matches = (query: string) => {
    try { return typeof window.matchMedia === 'function' && window.matchMedia(query).matches } catch { return false }
  }
  return labNeedsGestureAudioUnlock({
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    maxTouchPoints: typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0,
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

function LibraryBackIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5.6M11 6.2 5.2 12l5.8 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
  /** Query string. Only `?voice=v2` on `/reader` selects the Voice V2 preview. */
  search?: string
  online?: boolean
  source?: LabSource
  authToken?: string | null
  /**
   * A reader's own EPUB (`/reader?userBook=…`, see userBook/). Its text,
   * place, highlights and chat stay on this device; registry-only features
   * (Cast, narration, Compare, editions, Talk, library progress) are hidden.
   */
  userBook?: LoadedUserBook
  /**
   * The phone's margin mode (`/reader?book=<id>&margin=1` on a phone,
   * marginPreview/marginPreviewMount.ts): this reader as it is, with the dark
   * selection bar, bottom cards in place of every pop-up, and the chapter pills.
   */
  marginPhone?: boolean
  /** URL-only shared-reader entry; the initial slice retains this reader's layout and single position owner. */
  sharedReader?: boolean
  /** Owner-gated, unresolved original EPUB page marks, read-only in Notebook. */
  legacyOwnEpubItems?: LegacyOwnEpubNotebookItem[]
  ownNotebookRecovery?: ReactNode
  /** Preopened, owner-gated private text cards and Talk history. */
  ownCardController?: OwnTextCardsSync | null
}

function readOnline(override?: boolean): boolean {
  if (typeof override === 'boolean') return override
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

/** Built-in books only: added books (`pd-…`) have no `/covers/v2` art and come with their own entries (registeredPublicEntries). */
function quickCatalogueFallback(current: LabSource): QuickBookCatalogueEntry[] {
  const currentBookId = current.bookId || 'bible'
  return BOOKS.filter(book => !isPublicBookId(book.id)).map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    art: { src: `/covers/v2/${book.id}.webp` },
    readingStructure: book.id === currentBookId
      ? { chapters: current.chapters.map(chapter => ({ number: chapter.number, title: chapter.title })) }
      : null,
  }))
}

/**
 * The switcher's cover for the book open now, by the library's rule (book-cover.js):
 * its painting, else its catalogue art, else an own book's kept picture (or the account's copy of it).
 */
function currentSwitcherCover(bookId: string, ownBook: { cover?: string | null; storedCover?: string | null } | null | undefined): { coverSrc: string; coverSrcSet: string | null } {
  const cover = ownBook
    ? resolveBookCover({ bookId, ownCover: ownBook.cover ?? null, storedCover: ownBook.storedCover ?? null })
    : resolveBookCover({ bookId, art: isPublicBookId(bookId) ? registeredPublicCover(bookId) : `/covers/v2/${bookId}.webp` })
  return { coverSrc: cover?.src ?? '', coverSrcSet: cover?.srcSet ?? null }
}

/** Desktop commands that do not apply to a user book: one edition; Listen only when own-book narration is on. */
const USER_BOOK_HIDDEN_COMMANDS = new Set(['listen', 'editions', 'original', 'modern', 'compare'])

/** The view (Read or Compare) this device's latest place in the book was left in; null when it keeps none. */
function labBookSavedReaderMode(bookId: string): 'read' | 'compare' | null {
  const latest = Object.values(readLabPositionLocal().books)
    .filter(place => bookId === 'bible'
      ? place.bookId === 'bible' || (!getBook(place.bookId) && !isUserBookId(place.bookId))
      : place.bookId === bookId)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0]
  return latest ? latest.readerMode ?? 'read' : null
}

/** A user book reads in its one edition; the reader's edition choices for other books are left as they are. */
function userBookPrefs(prefs: LabPrefs, editionKey: string): LabPrefs {
  if (prefs.primaryEdition === editionKey && prefs.compareEdition === editionKey && prefs.audioEdition === editionKey && !prefs.compareOpen) return prefs
  return { ...prefs, primaryEdition: editionKey, compareEdition: editionKey, audioEdition: editionKey, audioFollowsPrimary: true, compareOpen: false }
}

function privateLibraryDestination(destination: string, enabled: boolean): string {
  if (!enabled || !destination.startsWith('/') || destination.startsWith('//')) return destination
  const url = new URL(destination, 'https://tinct.app')
  if (url.pathname !== '/library') return destination
  url.searchParams.set('sharedReader', '1')
  return `${url.pathname}${url.search}${url.hash}`
}

export function LabApp({ pathname, search, online, source, authToken, userBook, marginPhone: marginPhoneRequested = false, sharedReader = false, legacyOwnEpubItems, ownNotebookRecovery, ownCardController }: LabAppProps) {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/reader')
  const layoutOverride = labLayoutOverride(path, search ?? (typeof window !== 'undefined' ? window.location.search : ''))
  const voiceVersion = 'v2'
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
  const voicePanelSurface = !showPhoneChrome
  const [readerHandoff] = useState(() => source || userBook ? null : consumeLabReaderHandoffForPage())
  // Back from Checkout without paying: the buyer's own session is ended at once, so the
  // book is not held from other buyers until it lapses (the Worker checks it is theirs).
  useEffect(() => {
    const back = modernReturnForPage()
    if (back?.kind !== 'cancel') return
    void readSupabaseAccessToken().then(token => token ? cancelModernCheckout(back.bookId, token) : false).catch(() => false)
  }, [])
  const { user: authUser, likelyAuthenticated } = useAuth()
  const privateBook = Boolean(userBook)
  // The phone's margin mode on the phone reader: a registered book, and a reader's own book as Tinct's books (22 Oct 2026).
  const marginPhone = (sharedReader || marginPhoneRequested) && showPhoneChrome
  // A reader's own PDF read as its Tinct text: Book editions also offers its Original pages.
  const ownPdf = userBook?.kind === 'pdf'
  // A user book opens at its own saved place (userBookStore.ts), never the
  // reader's registry place; it is registered so chapter loads find it.
  const [userBookBoot] = useState(() => {
    if (!userBook) return null
    registerUserBook(userBook.bookId, userBook.edition)
    const place = userBook.place
    return {
      book: userBookLabSource(userBook.bookId, userBook.edition, place?.chapterNumber ?? 1),
      place: place ? { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex } : { paragraphIndex: 0, wordIndex: 0 },
      resume: null,
    }
  })
  const boot = userBookBoot ?? bootLabReading(source)
  const [book, setBook] = useState<LabSource>(() => readerHandoff ? pendingLabSourceForHandoff(readerHandoff) : boot.book)
  const userBookEditionKey = userBookBoot ? userBookBoot.book.editions![0].key : null
  // Stored prefs keep the reader's own edition choices: a user book writes appearance only.
  const persistPrefs = useCallback((next: LabPrefs, profile: LabAppearanceProfile) => {
    if (!userBookEditionKey) { writeLabPrefs(next, profile); return }
    const stored = readLabPrefs(profile)
    writeLabPrefs({
      ...next,
      primaryEdition: stored.primaryEdition,
      compareEdition: stored.compareEdition,
      audioEdition: stored.audioEdition,
      audioFollowsPrimary: stored.audioFollowsPrimary,
      compareOpen: stored.compareOpen,
      ...(stored.compareChosen ? { compareChosen: stored.compareChosen } : {}),
    }, profile)
  }, [userBookEditionKey])
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
    const synced = syncLabAudioEdition(flagged, book.editions?.length ? book.editions : bibleEditions())
    if (userBookEditionKey) return userBookPrefs(synced, userBookEditionKey)
    // Compare chosen in the margin preview's Layout: its compare edition is shown, even after an earlier None.
    return readerHandoff && deepLinkViewForPage() === 'compare' && !synced.compareOpen && synced.compareEdition !== synced.primaryEdition
      ? { ...synced, compareOpen: true }
      : synced
  })
  const allBookEditions = book.editions?.length ? book.editions : bibleEditions()
  const bookEditions = selectableLabEditions(book.bookId || 'bible', allBookEditions)
  // An own EPUB on the desktop has two editions too: its text here, and Margin view (Add a book's margin reader; epubView.ts).
  const ownEpubMargin = !!userBook && userBook.kind !== 'pdf' && bookEditions.some(edition => edition.key === EPUB_MARGIN_EDITION_KEY)
  const ownEditions = ownPdf || ownEpubMargin
  const heldPrimary = editionHold(book.bookId || 'bible', prefs.primaryEdition)
  const heldCompare = prefs.compareOpen ? editionHold(book.bookId || 'bible', prefs.compareEdition) : undefined
  const temporaryHold = heldPrimary || heldCompare
  const heldEditionKey = heldPrimary ? prefs.primaryEdition : prefs.compareEdition
  const holdIdentity = (book.bookId || 'bible') + '/' + heldEditionKey
  const [recoveredHold, setRecoveredHold] = useState<string | null>(null)
  const holdRecovery = recoveredHold === holdIdentity
  const isShakespeare = getBook(book.bookId || 'bible')?.author === 'William Shakespeare'
  // Long books read by chapter; a reader's own tap is remembered per book.
  const progressBookId = book.bookId || 'bible'
  const progressModeFor = (bookId: string) => readStoredReaderProgressMode(bookId) ?? defaultReaderProgressMode(getBook(bookId)?.wordCount)
  const [readerProgressMode, setReaderProgressMode] = useState<LabReaderProgressMode>(() => progressModeFor(progressBookId))
  useEffect(() => { setReaderProgressMode(progressModeFor(progressBookId)) }, [progressBookId])
  const toggleReaderProgressMode = useCallback(() => setReaderProgressMode(mode => {
    const next = mode === 'book' ? 'chapter' : 'book'
    storeReaderProgressMode(progressBookId, next)
    return next
  }), [progressBookId])
  // Tablet reader chrome can look like a phone. Flowing verse is a physical
  // phone preference, independent of that responsive chrome breakpoint.
  const phoneShakespeare = isPhone && isShakespeare && isShakespearePhone()
  const flowingShakespeare = phoneShakespeare && prefs.shakespeareLayout === 'flowing'
  const readingAlignment = prefs.alignmentExplicit === false ? (isShakespeare ? 'left' : 'justify') : prefs.alignment
  // A reader who never set a size reads at the size for their window on the
  // desktop (labDesktopDefaultFontSize) and at the phone default on a phone;
  // a size they chose is kept exactly (labReadingFontSize).
  const [desktopDefaultFontSize, setDesktopDefaultFontSize] = useState(() => labDesktopDefaultFontSize(typeof window === 'undefined' ? 0 : window.innerWidth))
  const readingFontSize = labReadingFontSize(prefs, appearanceProfile, desktopDefaultFontSize)
  const displayPrefs = { ...prefs, alignment: readingAlignment, fontSize: readingFontSize }
  const readingFont = labReadingFont(prefs.fontFamily)
  const [systemDark, setSystemDark] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
  const desktopAppearance = useDesktopAppearance()
  const resolvedDarkMode = desktopAppearance?.dark ?? (prefs.theme === 'dark' || (prefs.theme === 'system' && systemDark))
  const resolvedTheme = desktopAppearance ? (desktopAppearance.dark ? 'dark' : 'light') : prefs.theme === 'system' ? (systemDark ? 'dark' : 'light') : prefs.theme
  const compareViewBookId = book.bookId || 'bible'
  const [compareViewSavedMode] = useState(() => userBook ? null : labBookSavedReaderMode(compareViewBookId))
  const initialCompareView = (profile: LabAppearanceProfile) => !userBook && initialLabCompareView({
    profile,
    stored: readStoredCompareView(profile, compareViewBookId),
    savedMode: compareViewSavedMode,
  })
  const [mobileCompareActive, setMobileCompareActive] = useState(() => initialCompareView('phone'))
  // Two-page or Compare chosen in the margin preview's Layout (`view`, a deep link's): that layout, kept for the book.
  const [deepLinkDesktopView] = useState(() => readerHandoff && !userBook ? deepLinkViewForPage() : null)
  const desktopLayoutBookId = compareViewBookId
  const desktopLayoutSearch = search ?? (typeof window !== 'undefined' ? window.location.search : '')
  const initialDesktopLayout = () => initialDesktopReaderLayout({
    bookId: desktopLayoutBookId, search: deepLinkDesktopView ? `?view=${deepLinkDesktopView}` : desktopLayoutSearch, kind: userBook?.kind, hex: userBook?.hex,
    savedMode: labBookSavedReaderMode(desktopLayoutBookId),
  })
  const [desktopCompareActive, setDesktopCompareActive] = useState(() => sharedReader ? initialDesktopLayout() === 'compare' : deepLinkDesktopView ? deepLinkDesktopView === 'compare' : initialCompareView('desktop'))
  const [privateDesktopClassic, setPrivateDesktopClassic] = useState(() => sharedReader ? initialDesktopLayout() === 'two-page' : new URLSearchParams(desktopLayoutSearch).get('view') === 'two-page')
  const desktopLayoutBookRef = useRef(desktopLayoutBookId)
  useLayoutEffect(() => {
    if (!sharedReader || desktopLayoutBookRef.current === desktopLayoutBookId) return
    desktopLayoutBookRef.current = desktopLayoutBookId
    // An in-page book switch must derive that book's layout, never inherit the outgoing one.
    const layout = initialDesktopReaderLayout({ bookId: desktopLayoutBookId, kind: userBook?.kind, hex: userBook?.hex, savedMode: labBookSavedReaderMode(desktopLayoutBookId) })
    setDesktopCompareActive(layout === 'compare')
    setPrivateDesktopClassic(layout === 'two-page')
  }, [desktopLayoutBookId, sharedReader, userBook?.hex, userBook?.kind])
  useEffect(() => {
    if (deepLinkDesktopView) storeCompareView('desktop', compareViewBookId, deepLinkDesktopView === 'compare')
    const linked = deepLinkDesktopView ?? new URLSearchParams(desktopLayoutSearch).get('view')
    if (sharedReader && !showPhoneChrome && (linked === 'margin' || linked === 'two-page' || linked === 'compare')) storeDesktopReaderLayout(desktopLayoutBookId, linked)
  // Once, for the link this page opened with.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  /** The reader's own Compare toggle: remembered for this book in this layout. */
  const rememberCompareView = useCallback((on: boolean) => {
    if (!userBook) storeCompareView(appearanceProfile, compareViewBookId, on)
  }, [appearanceProfile, compareViewBookId, userBook])
  // Read by the text load (not one of its triggers): until the first page is
  // up, a Compare view that is not on screen gets its edition after it.
  const firstPageShownRef = useRef(false)
  // Set once the first page is on screen. Work the opening page does not
  // need (character cards, neighbouring chapters, Talk's session code) waits
  // for it rather than sharing the network and main thread with the reader's
  // first text.
  const [firstPageShown, setFirstPageShown] = useState(false)
  const compareOnScreenRef = useRef(mobileCompareActive || desktopCompareActive)
  compareOnScreenRef.current = mobileCompareActive || desktopCompareActive
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
      consumeDismissGesture(event)
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

  const audioEditionKey = effectiveLabAudioEdition(prefs, allBookEditions)
  const audioHeld = Boolean(editionHold(book.bookId || 'bible', audioEditionKey)) || isAudioHeld(book.bookId || 'bible', audioEditionKey, book.chapterNumber)
  const audioUnavailable = audioHeld || !resolvedAudioIsAvailable(audioEditionKey, prefs.primaryEdition, bookEditions)
  const [audioUnavailableNotice, setAudioUnavailableNotice] = useState(false)
  useEffect(() => setAudioUnavailableNotice(false), [book.bookId, book.chapterNumber, audioEditionKey])
  const updatePrefs = useCallback((next: LabPrefs) => {
    const synced = syncLabAudioEdition(migrateLabPrefsEditions(next, book.bookId || 'bible'), allBookEditions)
    setPrefs(synced)
    persistPrefs(synced, appearanceProfile)
  }, [appearanceProfile, book.bookId, allBookEditions, persistPrefs])
  // Talk's speaking speed is saved with the reader's other shared prefs, as
  // narration speed is; a functional update so a voice request mid-render
  // never writes over a newer choice.
  const applyTalkSpeed = useCallback((talkSpeed: number) => {
    setPrefs(current => {
      if (current.talkSpeed === talkSpeed) return current
      const next = { ...current, talkSpeed }
      persistPrefs(next, appearanceProfile)
      return next
    })
  }, [appearanceProfile, persistPrefs])
  const applyRemoteVoicePersona = useCallback((voicePersona: 'female' | 'male') => {
    setPrefs(current => {
      if (current.voicePersona === voicePersona && current.voicePersonaChosen) return current
      const next = { ...current, voicePersona, voicePersonaChosen: true }
      persistPrefs(next, appearanceProfile)
      return next
    })
  }, [appearanceProfile, persistPrefs])
  useVoicePersonaSync({ userId: authUser?.id ?? null, value: prefs.voicePersona, chosen: prefs.voicePersonaChosen === true, onRemote: applyRemoteVoicePersona })
  // English narration is available across the published catalogue. Female
  // original editions on the verified retention list stay on Bella; all
  // other tuples resolve to the exact on-demand voice returned by the Worker.
  const narrationFlag = narrationPilotFlag(search ?? (typeof window !== 'undefined' ? window.location.search : ''))
  const [narrationInfo, setNarrationInfo] = useState<NarrationPilotInfo | null>(initialNarrationPilotInfo)
  // Once the pilot has been on during this page load the Settings row stays,
  // so "Off" is reversible without the URL flag.
  useEffect(() => {
    // A user book asks only once the reader is signed in (below).
    if (privateBook) return
    let cancelled = false
    void fetchNarrationPilotInfo().then((info) => { if (!cancelled) setNarrationInfo(info) })
    return () => { cancelled = true }
  }, [privateBook])
  // Ten shared anonymous AI interactions; opening or reading books never prompts.
  const signedIn = authToken !== undefined ? Boolean(authToken) : (Boolean(authUser) || likelyAuthenticated)
  // Signed out, Orion and Eve play as Ara or Helios (cache-only openings); the stored choice stays.
  const narrationVoice = narrationInfo ? resolveNarrationVoice(prefs, narrationInfo.voices, { signedIn }) : null
  // Narration follows the text on the page: the primary edition, not the
  // Kokoro audio edition, so painted words and spoken words are one text.
  const narrationApplies = !privateBook && narrationInfo?.enabled === true
    && narrationVoice != null
    && narrationPilotApplies(prefs, book.bookId || 'bible', prefs.primaryEdition, book.chapterNumber, narrationInfo.provider)
  const retainedBella = narrationInfo?.provider !== 'grok' && usesRetainedBella(book.bookId || 'bible', prefs.primaryEdition, prefs.voicePersona)
  const prefsProfileRef = useRef(appearanceProfile)
  useLayoutEffect(() => {
    if (prefsProfileRef.current === appearanceProfile) return
    prefsProfileRef.current = appearanceProfile
    const next = syncLabAudioEdition(
      migrateLabPrefsEditions(readLabPrefs(appearanceProfile), book.bookId || 'bible'),
      allBookEditions,
    )
    setPrefs(userBookEditionKey ? userBookPrefs(next, userBookEditionKey) : next)
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
    else if (narrationFlag) persistPrefs(prefs, appearanceProfile)
    // This effect only releases the StrictMode bridge after the committed mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [tocOpen, setTocOpen] = useState(false)
  // The phone's Notebook row (t menu, 22 Oct 2026): the Contents opened at its Highlights & notes, closed back to the book.
  const [contentsNotebook, setContentsNotebook] = useState(false)
  useEffect(() => { if (!tocOpen) setContentsNotebook(false) }, [tocOpen])
  const desktopUnitPositionsRef = useRef(new Map<string, number>())
  const desktopUnitAnchorsRef = useRef(new Map<string, MarginSourceAnchor>())
  const desktopDraftsRef = useRef<Record<string, string>>({})
  const desktopNoteConversionRef = useRef(new Map<number, { highlightId?: string; created?: boolean; chapterNumber?: number; text: string }>())
  const [desktopOpenId, setDesktopOpenId] = useState<string | null>(null)
  const [desktopContinuationId, setDesktopContinuationId] = useState<string | null>(null)
  const menuMarginChatRef = useRef<() => void>(() => {})
  const [marginHost, setMarginHost] = useState<HTMLElement | null>(null)
  const readingScrollActive = useReadingScrollActivity(marginHost)
  const [marginUndo, setMarginUndo] = useState<(() => void) | null>(null)
  const [notebookCard, setNotebookCard] = useState<ChatConversation | null>(null)
  const [contentsConversation, setContentsConversation] = useState<ChatConversation | null>(null)
  const [recentChapterReturn, setRecentChapterReturn] = useState<(LabBookPlace & { libraryBookId: string }) | null>(null)
  const [contentsTarget, setContentsTarget] = useState<(ContentsPlace & { bookId: string; navigation: number; chapterOnly?: boolean; chat?: ChatConversation; flash?: PhoneCardRange['range'] }) | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [readerControlsVisible, setReaderControlsVisible] = useState(true)
  const [superMenuOpen, setSuperMenuOpen] = useState(false)
  const [superSheet, setSuperSheet] = useState<LabV2SheetLayer | null>(null)
  const [compareFromLayout, setCompareFromLayout] = useState(false)
  // Summarize, chapter-end summary and Primer: a card of beats, kept out of the chat feed.
  const [chapterNotes, setChapterNotes] = useState<{ request: ChapterNotesRequest; title: string; own?: OwnChapterNotesSource; railAnchor?: MarginSourceAnchor } | null>(null)
  const [desktopChapterCards, setDesktopChapterCards] = useState<Array<NonNullable<typeof chapterNotes>>>([])
  const [desktopCatchup, setDesktopCatchup] = useState(false)
  const [superFirstView, setSuperFirstView] = useState(false)
  const superFirstViewRef = useRef(false)
  const revealOnlyRef = useRef(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(query.matches || document.documentElement.dataset.eink === 'true')
    onChange()
    query.addEventListener?.('change', onChange)
    window.addEventListener('tinct:display-profile', onChange)
    return () => { query.removeEventListener?.('change', onChange); window.removeEventListener('tinct:display-profile', onChange) }
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
  // The chapter the reader last entered by reading on from the one before it.
  const enteredForwardRef = useRef<number | null>(null)
  // The chapter whose last page the reader reached by reading forward. Leaving
  // it from there for another chapter (Contents, a highlight, a chat) finishes
  // it, the same as turning past that page.
  const readToEndRef = useRef<number | null>(null)
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
  const [voiceLabView, setVoiceLabView] = useState<VoiceTinctView>('read')
  const [voiceHistoryFixture, setVoiceHistoryFixture] = useState(false)
  const [voiceActions, setVoiceActions] = useState<LabVoiceActionEntry[]>([])
  const [inTheBookOpen, setInTheBookOpen] = useState(false)
  const [peekBook, setPeekBook] = useState(false)
  // Back (phone back gesture, browser Back) closes the panel in front instead
  // of leaving the reader.
  useBackCloses(tocOpen, () => setTocOpen(false))
  useBackCloses(superMenuOpen, () => setSuperMenuOpen(false))
  useBackCloses(superSheet !== null, () => setSuperSheet(null))
  // The account cards (src/cards, CARDS-BRIEF.md) open over the reader while the
  // layer is 'account', so every overlay guard above applies to them; the
  // reader never unloads. An old account link arrives as ?card=<name>.
  const accountCardRef = useRef<CardName | null>(null)
  useEffect(() => {
    const card = consumeCardParam()
    if (!card) return
    accountCardRef.current = card
    setSuperSheet('account')
  }, [])
  const accountCardsWanted = superSheet === 'account'
  // The menu's Profile row shows a dot while someone asks to be friends (social/followRequests.ts).
  const requestDotUser = signedIn && !privateBook ? (authUser?.id ?? (authToken === undefined ? readCachedSupabaseUser()?.id ?? null : null)) : null
  const profileDot = useFollowRequestDot(requestDotUser, async () => authToken ?? await readSupabaseAccessToken())
  useEffect(() => {
    if (!accountCardsWanted) { closeLoadedAccountCards(); return }
    const start = accountCardRef.current ?? 'you'
    accountCardRef.current = null
    let live = true
    void loadAccountCards().then(cards => cards.openAccountCards({
      start,
      dark: resolvedDarkMode,
      deskTop: 76,
      onClose: () => setSuperSheet(layer => (layer === 'account' ? null : layer)),
    })).then(opened => {
      if (opened || !live) return
      // Signed out: the account lives behind sign-in.
      setSuperSheet(null)
      window.location.assign(labSignInUrl(labCurrentPath()))
    }, () => {
      // The cards' code could not load (offline before first use): nothing opened.
      if (live) setSuperSheet(layer => (layer === 'account' ? null : layer))
    })
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- opened once per 'account'; the theme is read at open
  }, [accountCardsWanted])
  useEffect(() => () => closeLoadedAccountCards(), [])
  useBackCloses(bookSwitcherOpen, () => setBookSwitcherOpen(false))
  useBackCloses(chapterNotes !== null, () => setChapterNotes(null))
  useBackCloses(inTheBookOpen, () => { setInTheBookOpen(false); setPeekBook(false) })
  const [phoneAskOpen, setPhoneAskOpen] = useState(false)
  const [phoneKeyboardOpen, setPhoneKeyboardOpen] = useState(false)
  const askInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  /** Rendered page for the companion's reading trail; written once chapter progress is known. */
  const askPageRef = useRef<{ pageNumber: number; totalPages: number } | null>(null)
  /** Words per page held for one leaf geometry, with the leaf it was measured at. */
  const wordsPerPageRef = useRef<{ wordsPerPage: number; leafHeight: number; stored?: boolean } | null>(null)
  const storedCapacityRef = useRef('')
  const progressTotalRef = useRef<{ key: string; total: number } | null>(null)
  /** Words one desktop leaf holds, measured from the layout by the paginator. */
  const [desktopLeafCapacity, setDesktopLeafCapacity] = useState<LabLeafCapacity | null>(null)
  const playbackInterruptedRef = useRef<() => boolean>(() => false)
  const [desktopAskOpen, setDesktopAskOpen] = useState(false)
  // Desktop Chat minimized: hidden, with no orb or tab standing in for it
  // (chat pill removed 2026-10-08). The menu's Librarian row restores it.
  const [desktopChatMinimized, setDesktopChatMinimized] = useState(false)
  useEffect(() => { if (!desktopAskOpen) setDesktopChatMinimized(false) }, [desktopAskOpen])
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
    && [prefs.primaryEdition, prefs.compareEdition].some(key => allBookEditions.find(edition => edition.key === key)?.aligned === false)
  // Bible editions do not all have the same chapters (WEB Catholic has Tobit;
  // the others do not), and Greek Daniel 3 numbers its verses differently from
  // the Hebrew: Compare says so rather than pairing different passages.
  const compareChapterMissing = (book.bookId || 'bible') === 'bible' && prefs.compareOpen
    && !bibleEditionHasChapter(prefs.compareEdition, book.chapterNumber)
  const compareNumberingDiffers = (book.bookId || 'bible') === 'bible' && prefs.compareOpen
    && !bibleVerseNumbersCorrespond(prefs.primaryEdition, prefs.compareEdition, book.chapterNumber)
  const mobileCompareEnabled = showPhoneChrome && prefs.compareOpen && book.compareParagraphs.length > 0 && !unalignedCompare && !compareNumberingDiffers
  const desktopCompareEnabled = !showPhoneChrome && prefs.compareOpen && prefs.primaryEdition !== prefs.compareEdition
    && book.compareParagraphs.length > 0 && !pairedCompareUnavailable && !unalignedCompare && !compareNumberingDiffers
  // Aa can offer Compare before a second edition has been chosen. Choosing it
  // then opens the existing version picker instead of comparing the main text
  // with itself or mounting an unavailable pair.
  const desktopCompareChoiceAvailable = !showPhoneChrome && !privateBook && bookEditions.some(edition =>
    edition.key !== prefs.primaryEdition && edition.aligned !== false
    && allBookEditions.find(main => main.key === prefs.primaryEdition)?.aligned !== false
    && ((book.bookId || 'bible') !== 'bible' || bibleEditionHasChapter(edition.key, book.chapterNumber)
      && bibleVerseNumbersCorrespond(prefs.primaryEdition, edition.key, book.chapterNumber)))
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
  const primaryEditionLabel = editionLabelFor(prefs.primaryEdition, allBookEditions)
  const compareEditionLabel = editionLabelFor(prefs.compareEdition, allBookEditions)
  const continuousReader = sharedReader && !showPhoneChrome && !desktopCompareActive && !privateDesktopClassic
  const desktopPaging = !continuousReader && !showPhoneChrome && browserHasNativePaging()
  const desktopSpread = desktopPaging && !desktopCompareActive
  const measuredPaging = !continuousReader && (showPhoneChrome || desktopPaging) && browserHasNativePaging()
  const [desktopMeasuredKey, setDesktopMeasuredKey] = useState('')
  const [returnTo, setReturnTo] = useState<LabReturnTo>('reading')
  const [draft, setDraft] = useState('')
  const [askAttachment, setAskAttachment] = useState<{ bookId: string; text: string; figure?: LabFigure; sourceLocation?: { chapterNumber: number; chapterLabel: string; paragraphIndex: number } } | null>(null)
  // The figure card over the page (LabFigure.tsx); an overlay only, it never moves the reader.
  const [figureCard, setFigureCard] = useState<LabFigure | null>(null)
  useEffect(() => {
    setAskAttachment(current => current?.bookId === book.bookId ? current : null)
  }, [book.bookId])
  // The phone call surface. `callOpen` is the reader's own intent: it stays
  // true through a dropped connection, so a call that lost its transport can
  // say so and offer to reconnect instead of vanishing.
  const [callOpen, setCallOpen] = useState(false)
  const callOpenRef = useRef(false)
  callOpenRef.current = callOpen
  const callAnchorRef = useRef<LabCallAnchor | null>(null)
  const endCallRef = useRef<() => void>(() => {})
  const talkTrialEndedRef = useRef<() => void>(() => {})
  // Desktop only: the panel collapsed to the corner pill. Rendering state; it
  // never touches the session or the reader's place.
  const [callMinimized, setCallMinimized] = useState(false)
  // The paragraph the conversation is about, tinted on the desktop page.
  const [callParagraph, setCallParagraph] = useState<number | null>(null)
  // True from the moment the reader asks for a call until the session reports
  // its first transport fact. It is the only place "no report yet" is read as
  // connecting; after that, no session means no connection.
  const [callAwaitingConnection, setCallAwaitingConnection] = useState(false)
  // A user book is read aloud only for its signed-in owner, and only when the
  // server says own-book narration is on; the voices request names no book.
  useEffect(() => {
    if (!privateBook || !signedIn) return
    let cancelled = false
    void fetchNarrationPilotInfo().then((info) => { if (!cancelled) setNarrationInfo(info) })
    return () => { cancelled = true }
  }, [privateBook, signedIn])
  const ownNarration = privateBook && signedIn && narrationInfo?.enabled === true && narrationInfo.ownBooks === true
    && narrationInfo.provider === 'grok' && narrationVoice != null && prefs.primaryEdition === 'own-en'
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
  // Paid Modern English editions of added public-domain books (labModernEdition.ts).
  const modernBookId = book.bookId || 'bible'
  const modernPrefsRef = useRef(prefs)
  modernPrefsRef.current = prefs
  const modernEnabled = !privateBook && isPublicBookId(modernBookId) && modernEditionsEnabled()
  // The paragraphs on the page in view (set below, once the pages are known): a
  // page with any paragraph not yet in Modern English is covered, never shown.
  const [modernVisible, setModernVisible] = useState<ModernVisible | null>(null)
  const modern = useLabModernEdition({
    enabled: modernEnabled,
    bookId: modernBookId,
    editionKey: prefs.primaryEdition,
    chapterNumber: book.chapterNumber,
    pending: !!book.modernPending,
    written: book.modernWritten,
    visible: modernVisible,
    paragraphCount: book.paragraphs.length,
    // Signed in, the status carries an offer only for Premium (trial included).
    readToken: signedIn ? readSupabaseAccessToken : undefined,
    // Back from a completed purchase: read the edition just bought.
    onPurchased: () => {
      const registered = getBook(modernBookId)
      if (!registered?.editions.some(edition => edition.key === MODERN_EDITION_KEY)) return
      updatePrefs(labPrefsForMainEdition(modernPrefsRef.current, MODERN_EDITION_KEY, modernBookId, registered.editions, registered.year))
    },
  })
  const modernBlocksNextRef = useRef(false)
  modernBlocksNextRef.current = modern.wait !== null
  const [modernNoteDismissed, setModernNoteDismissed] = useState<string | null>(null)
  const [modernCheckoutBusy, setModernCheckoutBusy] = useState(false)
  const buyModernEdition = useCallback(async () => {
    const token = await readSupabaseAccessToken()
    if (!token) return
    setModernCheckoutBusy(true)
    try {
      const url = await startModernCheckout(modernBookId, book.chapterNumber, token)
      markPendingPurchase(modernBookId)
      window.location.assign(url)
    } catch (error) {
      setModernCheckoutBusy(false)
      // Premium only (trial included): the account sheet, with its Premium offer, says the rest.
      if (error instanceof Error && error.message === MODERN_PREMIUM_REQUIRED) setSuperSheet('account')
    }
  }, [modernBookId, book.chapterNumber])
  const [readingPageIndex, setReadingPageIndex] = useState(
    readerHandoff?.savedPlace?.page ?? boot.resume?.pageIndex ?? 0,
  )
  const [nativePagesRevision, setNativePagesRevision] = useState(0)
  const [nativeMeasuredContent, setNativeMeasuredContent] = useState<string[] | null>(null)
  // A head-first map (LabNativePaginator `headFirst`): its opening page is
  // laid out, the rest of the chapter follows a moment later. The page is
  // shown; nothing turns onto, counts or verifies the rest until it is in.
  const [nativeHeadContent, setNativeHeadContent] = useState<string[] | null>(null)
  // When the head-first map on screen arrived (0: none). Page turns wait for
  // the full map, never for long (LAB_HEAD_FIRST_HOLD_MS).
  const nativeHeadOnlyRef = useRef(0)
  // A forward turn asked for while that map was on screen, taken once the
  // full map arrives or the existing provisional-map deadline expires.
  const headFirstTurnRef = useRef(false)
  const headFirstTurnTimerRef = useRef<number | null>(null)
  const cancelHeadFirstTurn = useCallback(() => {
    headFirstTurnRef.current = false
    if (headFirstTurnTimerRef.current !== null) window.clearTimeout(headFirstTurnTimerRef.current)
    headFirstTurnTimerRef.current = null
  }, [])
  useLayoutEffect(() => cancelHeadFirstTurn, [book.bookId, book.chapterNumber, readerEditionKey, desktopPaging, cancelHeadFirstTurn])
  useLayoutEffect(() => { setNativeMeasuredContent(null); setNativeHeadContent(null); nativeHeadOnlyRef.current = 0 }, [desktopPaging])
  const nativeContentRef = useRef(readerParagraphs)
  nativeContentRef.current = readerParagraphs
  const readerStateRef = useRef<LabReaderStateSnapshot>({
    pageIndex: readingPageIndex,
    primaryEditionKey: prefs.primaryEdition,
    compareEditionKey: prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition ? prefs.compareEdition : undefined,
    readerMode: (showPhoneChrome ? mobileCompareActive : desktopCompareActive) ? 'compare' : 'read',
  })
  readerStateRef.current = {
    pageIndex: readingPageIndex,
    primaryEditionKey: prefs.primaryEdition,
    compareEditionKey: prefs.compareOpen && prefs.compareEdition !== prefs.primaryEdition ? prefs.compareEdition : undefined,
    readerMode: (showPhoneChrome ? mobileCompareActive : desktopCompareActive) ? 'compare' : 'read',
  }
  // Only a Bible book opening (Genesis, Exodus, ...) shows a cover page.
  const [chapterCoverTitle, setChapterCoverTitle] = useState<string | null>(null)
  // A deep link to a word (a shared highlight, `paragraph=&word=`) opens the
  // page that holds it as the chapter naturally lays out — the page the
  // sharer was reading — through the same saved-place restore as Continue
  // (`restorePlaceRef`). It used to cut the map so a page began AT the word:
  // that page was built from a word-count estimate instead of the measured
  // layout, so it showed the highlight's few lines and then blank paper, and
  // on desktop both leaves stopped half-way (nightly QA, /q/fv7btyc, Oct 2026).
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
    if (!mobileCompareEnabled && book.paragraphs.length > 0) setMobileCompareActive(false)
  }, [book.paragraphs.length, mobileCompareEnabled])

  // The passage belongs to one flip: it ends when Compare does.
  useEffect(() => {
    if (mobileCompareActive) return
    comparePassageRef.current = null
  }, [mobileCompareActive])

  useEffect(() => {
    if (!desktopCompareEnabled && book.paragraphs.length > 0) setDesktopCompareActive(false)
  }, [book.paragraphs.length, desktopCompareEnabled])

  const toggleFullscreen = useCallback(async () => {
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
  const consumedOpeningRef = useRef<{ bookId: string; editionKey: string; chapterNumber: number; anchor: { paragraphIndex: number; wordIndex: number } } | null>(null)
  const chapterLandingRef = useRef<'start' | 'end' | null>(null)
  const landingChapterRef = useRef<number | null>(null)
  const handoffPlace = readerHandoff
    ? { paragraphIndex: readerHandoff.savedPlace?.paragraphIndex ?? 0, wordIndex: readerHandoff.savedPlace?.wordIndex ?? 0 }
    : null
  const initialPlace = handoffPlace ?? boot.place
  const placeRef = useRef(initialPlace)
  const [continuousAnchor, setContinuousAnchor] = useState(initialPlace)
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
    if (view === 'read') {
      endCallRef.current()
      return
    }
    setVoiceLabView(view)
    setTocOpen(false)
    if (view !== 'cast') setInTheBookOpen(false)
    if (view !== 'chat') setPhoneAskOpen(false)
    if (view !== 'chat') setDesktopAskOpen(false)
    setPeekBook(false)

    if (view === 'settings') {
      setSuperSheet('reading')
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
    setTocOpen(snapshot.tocOpen)
    setInTheBookOpen(snapshot.inTheBookOpen)
    setPeekBook(snapshot.peekBook)
  }, [])

  const voiceToolAdapter = createLabVoiceToolAdapter<LabVoiceViewSnapshot>({
    getViewSnapshot: () => ({
      view: voiceLabView,
      phoneAskOpen,
      desktopAskOpen,
      tocOpen,
      inTheBookOpen,
      peekBook,
    }),
    openView: openLabVoiceView,
    restoreView: restoreLabVoiceView,
    getTheme: () => resolvedDarkMode ? 'dark' : 'light',
    setTheme: theme => updatePrefs({ ...prefs, theme, darkMode: theme === 'dark' }),
    getFontSize: () => readingFontSize,
    setFontSize: fontSize => updatePrefs({ ...prefs, fontSize, fontSizeExplicit: true }),
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
      chapters: book.chapters,
  }))
  const [browseWhileListening, setBrowseWhileListening] = useState(false)
  const [audioChapterTransitioning, setAudioChapterTransitioning] = useState(false)
  const audioChapterCompleteRef = useRef<() => boolean>(() => false)
  /** The next chapter's warmed narration opening, played straight from `ended` on a locked phone. */
  const nextChapterAudioRef = useRef<() => NextChapterAudio | null>(() => null)
  const browseWhileListeningRef = useRef(false)
  /** A word the reader tapped while audio was paused: the place Play resumes from. */
  const pausedJumpRef = useRef<{ bookId: string; chapterNumber: number; paragraphIndex: number; wordIndex: number } | null>(null)
  const listenPlayingRef = useRef(false)

  const lockPaginationRef = useRef(false)

  useLabFunnel({ bookId: book.bookId || 'bible', ready: book.paragraphs.length > 0, signedIn, authToken })

  // An essay collection's chapters are by their own writers (companion/authorship.ts).
  const authorshipOf = useMemo(() => book.collection
    ? (chapterNumber: number | undefined) => sourceAuthorship(book, chapterNumber)
    : undefined, [book])
  const ask = useLabAsk({
    voiceWarm: firstPageShown,
    bookTitle: book.bookTitle,
    bookAuthor: book.bookAuthor,
    authorshipOf,
    headerBook: book.headerBook,
    chapterLabel: book.chapterLabel,
    chapterNumber: book.chapterNumber,
    editionLabel: book.editionLabel,
    paragraphs: book.paragraphs,
    // A user book sends only a window around this paragraph: the page on screen when nothing is in focus.
    paragraphIndex: focusParagraph ?? (privateBook ? readingPages[readingPageIndex]?.paragraphIndex ?? 0 : 0),
    authToken,
    signedIn,
    onTalkTrialEnded: () => talkTrialEndedRef.current(),
    onAccountPrompt: (request) => {
      setAccountPrompt(request)
      // Keep the unsent question in the composer; a held-back Talk never connects.
      if (request.text) setDraft(request.text)
    },
    bookId: book.bookId || 'bible',
    editionKey: readerEditionKey,
    conversationId: (sharedReader && !showPhoneChrome && desktopContinuationId) || (contentsConversation?.bookId === (book.bookId || 'bible') ? contentsConversation.id : undefined),
    chapterCount: book.chapters.length,
    getPage: () => askPageRef.current,
    playbackInterrupted: () => playbackInterruptedRef.current(),
    onResumeListen: forceAudio => resumeListenRef.current(forceAudio),
    onSetPlaybackSpeed: (rate) => setSpeedRef.current(rate),
    onPlaybackSkip: (kind) => skipRef.current(kind),
    // A user book's chat stays on this device: no account row to sync with.
    userId: userBook ? null : authToken !== undefined ? (authToken ? (authUser?.id ?? null) : null) : undefined,
    ownCardController: sharedReader && userBook ? ownCardController : null,
    privateChatGuard: sharedReader && !!userBook,
    sharedReader,
    voiceToolAdapter,
    voiceVersion,
    voicePersona: prefs.voicePersona,
    talkSpeed: prefs.talkSpeed ?? 1,
    onTalkSpeedChange: applyTalkSpeed,
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

  const narrationCacheIdentity = narrationInfo?.voices.find(voice => voice.key === narrationVoice)?.cacheIdentity ?? null
  const narrationContextRef = useRef({ bookId: listenSource.bookId, editionKey: prefs.primaryEdition, chapter: listenSource.chapterNumber, paragraphs: listenSource.paragraphs, voice: narrationVoice, identity: narrationCacheIdentity })
  narrationContextRef.current = { bookId: listenSource.bookId, editionKey: prefs.primaryEdition, chapter: listenSource.chapterNumber, paragraphs: listenSource.paragraphs, voice: narrationVoice, identity: narrationCacheIdentity }
  // Keep only a few warmed chapter openings in this reader session. The
  // player still validates each paragraph against the exact current text.
  const warmedNarrationRef = useRef(new Map<string, NarrationParagraphResult[]>())
  const warmedNarrationKey = (bookId: string, edition: string, chapter: number, voice: string | null) =>
    JSON.stringify([bookId, edition, chapter, voice])
  const narrationPrepared = useCallback(() => {
    const c = narrationContextRef.current
    if (privateBook) return []
    return [...readNarrationReplay(c), ...(warmedNarrationRef.current.get(warmedNarrationKey(c.bookId, c.editionKey, c.chapter, c.voice)) ?? [])]
  }, [privateBook])
  const narrationEnsure = useCallback(async (indexes: number[], signal: AbortSignal, mode?: 'next' | 'all', fromChunks?: Record<number, number>) => {
    const context = narrationContextRef.current
    if (!context.voice) return []
    const token = authToken ?? await readSupabaseAccessToken()
    if (privateBook) {
      // An own book: its text goes to the own-book route only, nothing is kept in the replay cache.
      const bookHex = userBookHex(context.bookId)
      if (!bookHex) return []
      return ensureOwnNarration({
        bookHex,
        voice: context.voice,
        paragraphs: indexes
          .filter(index => index >= 0 && index < context.paragraphs.length)
          .map(index => ({ index, text: context.paragraphs[index], fromChunk: fromChunks?.[index] })),
        mode: mode ?? 'next',
      }, { signal, authToken: token })
    }
    const results = await ensureNarration({
      bookId: context.bookId,
      editionKey: context.editionKey,
      chapter: context.chapter,
      voice: context.voice,
      paragraphs: indexes
        .filter(index => index >= 0 && index < context.paragraphs.length)
        .map(index => ({ index, text: context.paragraphs[index], fromChunk: fromChunks?.[index] })),
      mode: mode ?? 'next',
    }, { signal, authToken: token })
    if (!signal.aborted) storeNarrationReplay(context, results)
    return results
  }, [authToken, privateBook])
  /** The session for an own book's Catch me up (signed-in only, like its narration). */
  const ownCatchUpToken = useCallback(async () => authToken !== undefined ? authToken : await readSupabaseAccessToken(), [authToken])
  const bookTransition = useMemo(() => narrationInfo?.provider === 'grok' && !privateBook
    ? bibleBookTransition(listenSource.bookId, listenSource.chapters, listenSource.chapterNumber) : null,
  [narrationInfo?.provider, privateBook, listenSource.bookId, listenSource.chapters, listenSource.chapterNumber])
  const narrationEndingEnsure = useCallback(async (signal: AbortSignal, mode?: 'next' | 'all', fromChunk?: number) => {
    if (!bookTransition || !narrationVoice) return []
    const token = authToken ?? await readSupabaseAccessToken()
    if (signal.aborted) return []
    return ensureNarration({
      kind: 'book-transition', nextChapter: bookTransition.nextChapter,
      bookId: listenSource.bookId, editionKey: prefs.primaryEdition,
      chapter: listenSource.chapterNumber, voice: narrationVoice,
      paragraphs: [{ index: 0, text: bookTransition.text, fromChunk }], mode,
    }, { signal, authToken: token })
  }, [bookTransition, narrationVoice, authToken, listenSource.bookId, listenSource.chapterNumber, prefs.primaryEdition])
  const narrationOption = useMemo(
    () => ((narrationApplies || ownNarration) && narrationVoice ? {
      voice: narrationVoice, ensure: narrationEnsure, prepared: narrationPrepared,
      endingCue: bookTransition ? { text: bookTransition.text, ensure: narrationEndingEnsure } : undefined,
    } : null),
    [narrationApplies, ownNarration, narrationVoice, narrationEnsure, narrationPrepared, bookTransition, narrationEndingEnsure],
  )
  const listen = useLabListen({
    guardPlaybackRequests: true,
    playbackUnavailable: (privateBook && !ownNarration) || Boolean(temporaryHold) || (narrationInfo?.provider === 'grok' && prefs.primaryEdition.endsWith('-en') ? !narrationOption : narrationOption || retainedBella ? false : audioUnavailable),
    bookId: listenSource.bookId,
    bookTitle: book.bookTitle,
    chapterTitle: book.chapterLabel,
    // An own book has no cover on the server; asking for one would name it.
    coverSrc: privateBook ? undefined : `/covers/v2/${book.bookId || 'bible'}.webp`,
    paragraphs: listenSource.paragraphs,
    followParagraphs: listenSource.followParagraphs,
    chapterNumber: listenSource.chapterNumber,
    audioEdition: narrationOption || retainedBella ? prefs.primaryEdition : audioEditionKey,
    narration: narrationOption,
    playbackSpeed: prefs.audioSpeed,
    onPlaybackSpeedChange: (audioSpeed) => updatePrefs({ ...prefs, audioSpeed }),
    titleClip: listenSource.audioTitle,
    onChapterComplete: () => audioChapterCompleteRef.current(),
    nextChapterAudio: () => nextChapterAudioRef.current(),
  })
  listenSpeedRef.current = listen.speed
  listenPlayingRef.current = listen.playing
  // Listening to an own book is not reported: the report would carry its id.
  useLabListenReport(listen.playing && !privateBook, listenSource.bookId || book.bookId || 'bible')
  useLabReadingYear({
    userId: authUser?.id ?? null,
    bookId: book.bookId || 'bible',
    chapter: book.chapterNumber,
    page: readingPageIndex,
    // A user book is not counted in the reading year (no pages, no device
    // time); with the reading-time ledger on, its time counts under the one
    // private bucket, never its id.
    onCover: privateBook || Boolean(chapterCoverTitle),
    paused: tocOpen,
    listeningRef: listenPlayingRef,
    privateBook,
  })
  // Warm narration ahead of the listener: the next chapter's opening when the
  // chapter being heard nears its end. It follows the chapter playing
  // (listenSource), not the page shown, so browsing elsewhere while listening
  // does not stop the next chapter from being prepared.
  const narrationCurrentParagraph = listen.playing && listen.follow.kind !== 'none'
    ? listen.follow.paragraphIndex
    : listenSource.chapterNumber === book.chapterNumber ? (readingPages[readingPageIndex]?.paragraphIndex ?? 0) : 0
  useNarrationPrefetch({
    // Never for an own book: it is narrated on demand only, nothing ahead.
    active: !privateBook && !temporaryHold && Boolean(narrationOption) && listen.playing,
    voice: narrationVoice,
    bookId: listenSource.bookId,
    editionKey: prefs.primaryEdition,
    chapter: listenSource.chapterNumber,
    nextChapter: nextLabChapter(listenSource.chapters, listenSource.chapterNumber),
    paragraphCount: listenSource.paragraphs.length,
    currentParagraph: narrationCurrentParagraph,
    remainingSeconds: listen.chapterDuration > 0 ? Math.max(0, listen.chapterDuration - listen.chapterTime) / listen.speed : undefined,
    onPrepared: (target, results) => {
      storeNarrationReplay({ bookId: listenSource.bookId, editionKey: prefs.primaryEdition, chapter: target, identity: narrationCacheIdentity }, results)
      const cache = warmedNarrationRef.current
      const key = warmedNarrationKey(listenSource.bookId, prefs.primaryEdition, target, narrationVoice)
      cache.delete(key)
      cache.set(key, results)
      while (cache.size > 4) cache.delete(cache.keys().next().value!)
    },
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
      chapters: book.chapters,
    })
  }, [book.bookId, book.chapterNumber, book.paragraphs, book.followParagraphs, book.audioTitle, book.chapters, listen.playing, browseWhileListening])

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
  // Every tap, key, wheel or touch anywhere in the document: a reader action
  // after a saved-place restore was set owns the place from then on.
  const interactionCountRef = useRef(0)
  // The account's place being restored (labRestoreTarget.ts): no place is
  // written until the settled page on screen holds it or the reader acts.
  const restoreWatchRef = useRef<LabRestoreWatch | null>(null)
  // The chapter whose page map is on screen, as restore targets are keyed.
  const shownChapterKeyRef = useRef(labRestoreChapterKey(book.bookId, book.chapterNumber))
  const restoreViewNow = (): LabRestoreView => ({
    chapterKey: shownChapterKeyRef.current,
    settled: pagesStableRef.current && !headFirstPending(nativeHeadOnlyRef.current),
    pages: readingPagesRef.current,
    pageIndex: readingPageIndexRef.current,
  })
  const watchRestore = (place: { paragraphIndex: number; wordIndex: number }, chapterKey: string) => {
    restoreWatchRef.current = { ...place, chapterKey, interactions: interactionCountRef.current, retries: 0 }
  }
  const placeWritesSuspended = Boolean(temporaryHold) || Boolean(chapterCoverTitle) || handoffWritesSuspended || remoteResumePending || Boolean(readerLoadError) || tocOpen
  const positionSync = useLabPositionSync({
    book,
    placeRef,
    readerStateRef,
    sourceLocked: Boolean(source || userBook || (readerHandoff && !readerHandoff.resumeLatest)),
    resumeLibraryBookId: readerHandoff?.resumeLatest ? readerHandoff.bookId : undefined,
    resolveBeforePaint: true,
    writesSuspended: placeWritesSuspended,
    // A user book never reads or writes the account's position record: as a
    // signed-out reader it has no cloud to wait for, and its own place is
    // kept on this device below (userBookPlace).
    authToken: userBook ? null : authToken,
    // Same shape the reading-memory hook takes: an explicit token means an
    // explicit identity, so the position record is reconciled against the
    // same account the memory is.
    ownerId: userBook ? null : authToken !== undefined ? (authToken ? (authUser?.id ?? null) : null) : undefined,
    interactedRef: interactionRef,
    onResolvedPlace: (place) => {
      restorePlaceRef.current = { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
      watchRestore(restorePlaceRef.current, labRestoreChapterKey(book.bookId, book.chapterNumber))
      placeRef.current = { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
      setContinuousAnchor(placeRef.current)
      restorePageRef.current = null
      // On a head-first map the full map restores it (applyNativePages).
      if (pagesStableRef.current && readingPagesRef.current.length > 0 && !headFirstPending(nativeHeadOnlyRef.current)) {
        const idx = pageIndexForPlace(readingPagesRef.current, place.paragraphIndex, place.wordIndex)
        restorePlaceRef.current = null
        pageAnchorRef.current = { paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex }
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
        readingFirst: true,
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
        // Bound to the incoming chapter: the outgoing chapter's paginator can
        // still finish a measurement before this chapter commits, and must
        // not take this place as its own (labRestoreTarget.ts).
        const loadedKey = labRestoreChapterKey(loaded.bookId, loaded.chapterNumber)
        restorePlaceRef.current = restoreTargetIn({ paragraphIndex, wordIndex }, loadedKey)
        watchRestore(restorePlaceRef.current, loadedKey)
        placeRef.current = { paragraphIndex, wordIndex }
        setContinuousAnchor(placeRef.current)
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
  const { initialPositionResolved, biblicalBook, readPositionState } = positionSync
  // A user book's place: the same tuple, kept on this device under the same
  // suspensions, and saved a moment later to the reader's private copy in
  // their account (userBook/ownSync.ts: never the shared position stores),
  // so it opens there on their other devices. 'hide' sends what is waiting.
  const userPlaceBookRef = useRef(book)
  userPlaceBookRef.current = book
  const notePlace = useCallback<typeof positionSync.notePlace>((reason, at) => {
    // A restore that has not landed is retried, never saved as the page on screen.
    const watch = restoreWatchRef.current
    if (watch && holdPlaceWrite({ watch, reason, interactions: interactionCountRef.current, landed: restoreLanded(watch, restoreViewNow()) })) return
    if (!userBook) { positionSync.notePlace(reason, at); return }
    if (reason === 'hide') { flushOwnPlaces(); return }
    if (placeWritesSuspended) return
    const current = userPlaceBookRef.current
    if (current.bookId !== userBook.bookId || current.paragraphs.length === 0) return
    writeUserBookPlace(userBook.hex, {
      chapterNumber: at?.sequentialChapter ?? current.chapterNumber,
      paragraphIndex: at?.paragraphIndex ?? placeRef.current.paragraphIndex,
      wordIndex: at?.wordIndex ?? placeRef.current.wordIndex,
      updatedAt: Date.now(),
      // The rules of the conversion this place is in: converted again, the book keeps its words where they were.
      converter: userBook.edition.converter,
    })
    // A PDF's place is the one it shares with its Original pages (userBook/pdfEditions.ts).
    if (userBook.kind === 'pdf') noteOwnPlace(userBook.hex, userBook.edition.chapters, { pdf: { pages: userBook.pdfPages } })
    else noteOwnPlace(userBook.hex, userBook.edition.chapters)
  // positionSync.notePlace is the stable callback the hook returns.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userBook, placeWritesSuspended, positionSync.notePlace])
  const chooseSharedDesktopLayout = (layout: 'margin' | 'two-page' | 'compare') => {
    if (layout === 'compare' && !desktopCompareEnabled) {
      if (desktopCompareChoiceAvailable) { setCompareFromLayout(true); setSuperSheet('compareEdition') }
      return
    }
    const classic = layout === 'two-page'
    const compare = layout === 'compare'
    storeDesktopReaderLayout(compareViewBookId, layout)
    if (privateDesktopClassic === classic && desktopCompareActive === compare) { setSuperSheet(null); return }
    const anchor = { ...placeRef.current }
    chapterNavigationRef.current += 1
    readerStateRef.current = { ...readerStateRef.current, readerMode: compare ? 'compare' : 'read' }
    rememberCompareView(compare)
    setDesktopCompareActive(compare)
    setPrivateDesktopClassic(classic)
    if (!classic && !compare) setContinuousAnchor(anchor)
    else {
      pageAnchorRef.current = anchor
      restorePlaceRef.current = restoreTargetIn(anchor, labRestoreChapterKey(book.bookId, book.chapterNumber))
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (classic) url.searchParams.set('view', 'two-page')
      else if (compare) url.searchParams.set('view', 'compare')
      else url.searchParams.delete('view')
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    }
    notePlace('mode-change', anchor)
    setSuperSheet(null)
  }
  // Leaving or hiding the page sends the own book's place still waiting (keepalive).
  useEffect(() => {
    if (!userBook) return
    const onVisibility = () => { if (document.visibilityState === 'hidden') flushOwnPlaces() }
    window.addEventListener('pagehide', flushOwnPlaces)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', flushOwnPlaces)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [userBook])
  // An own book opened without a saved place is being read from its start: it
  // joins Currently reading as a Tinct book does when it is opened. The mark
  // carries no reading time (updatedAt 0), so it is never sent to the account
  // and never outranks a place read on another device.
  const userBookOpenNotedRef = useRef(false)
  useEffect(() => {
    if (!userBook || userBook.place || userBookOpenNotedRef.current || placeWritesSuspended) return
    userBookOpenNotedRef.current = true
    if (readUserBookPlace(userBook.hex, userBook.edition)) return
    writeUserBookPlace(userBook.hex, { chapterNumber: userBookBoot?.book.chapterNumber ?? 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 })
  }, [userBook, userBookBoot, placeWritesSuspended])
  const [userBookFinished, setUserBookFinished] = useState<Set<number>>(() => new Set())
  const finishedChapters = userBook ? userBookFinished : positionSync.finishedChapters
  const markChapterFinished = useCallback((chapterNumber: number) => {
    if (!userBook) { positionSync.markChapterFinished(chapterNumber); return }
    setUserBookFinished(current => current.has(chapterNumber) ? current : new Set([...current, chapterNumber]))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userBook, positionSync.markChapterFinished])
  const initialResolving = !initialPositionResolved || remoteResumePending
  const positionWritesSuspended = Boolean(temporaryHold) || Boolean(chapterCoverTitle) || handoffWritesSuspended || initialResolving || Boolean(readerLoadError)
  const continuousEpoch: ContinuousReaderEpoch = {
    bookId: book.bookId || 'bible', editionKey: prefs.primaryEdition,
    chapterNumber: book.chapterNumber, navigation: chapterNavigationRef.current,
  }
  const continuousEpochRef = useRef(continuousEpoch)
  continuousEpochRef.current = continuousEpoch
  const continuousVisibleRef = useRef(continuousAnchor)
  const currentContinuousEpoch = (): ContinuousReaderEpoch => ({ ...continuousEpochRef.current, navigation: chapterNavigationRef.current })
  const continuousReady = book.paragraphs.length > 0 && !initialResolving && !handoffWritesSuspended
  const onContinuousLanded = (reported: ContinuousReaderEpoch, anchor: { paragraphIndex: number; wordIndex: number }) => {
    if (!acceptContinuousReaderPlace(reported, currentContinuousEpoch(), continuousReady, placeWritesSuspended, anchor, book.paragraphs)) return
    continuousVisibleRef.current = anchor
    const watch = restoreWatchRef.current
    if (watch?.chapterKey === labRestoreChapterKey(book.bookId, book.chapterNumber)
      && watch.paragraphIndex === anchor.paragraphIndex && watch.wordIndex === anchor.wordIndex) restoreWatchRef.current = null
  }
  const onContinuousVisible = (reported: ContinuousReaderEpoch, anchor: { paragraphIndex: number; wordIndex: number }) => {
    if (!acceptContinuousReaderPlace(reported, currentContinuousEpoch(), continuousReady, placeWritesSuspended, anchor, book.paragraphs)) return
    continuousVisibleRef.current = anchor
    // A human scroll while audio plays belongs to the visible reader place;
    // the spoken cursor remains in listen.follow until they choose to follow.
    if (listen.playing && !browseWhileListeningRef.current) return
    placeRef.current = anchor
    notePlace('page-turn', anchor)
  }
  // The library's first paint comes from a snapshot (labLibraryBoot.ts). The
  // reader knows the account and the place: hand them over when leaving for
  // the library and whenever the page is hidden, so the library never has to
  // wait for the network to show "Reading now".
  const rememberLibraryPlace = useCallback(() => {
    // On the desktop an own book read here leads the library's first paint too, so its
    // Continue opens what was read last (continueLatest.ts). This device only; phones unchanged.
    if ((userBook && isPhone) || positionWritesSuspended || readerLoadError || book.paragraphs.length === 0) return
    const userId = authUser?.id ?? (authToken === undefined ? readCachedSupabaseUser()?.id ?? null : null)
    writeLabLibraryBootSnapshot(snapshotWithReaderPlace(readLabLibraryBootSnapshot(), {
      userId,
      bookId: userBook ? userBook.bookId : book.bookId || 'bible',
      title: book.bookTitle,
      chapterLabel: book.chapterLabel,
      now: Date.now(),
    }))
  }, [authToken, authUser?.id, book.bookId, book.bookTitle, book.chapterLabel, book.paragraphs.length, isPhone, positionWritesSuspended, readerLoadError, userBook])
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

  const rowsForQuickCatalogue = useCallback((catalogue: QuickBookCatalogueEntry[], added: QuickAddedBooks) => {
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
        added,
        // My shelf's removals, as the library last synced them here (readingNow.ts).
        membership: readShelfMembership(viewer),
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
    setTocOpen(false)
    setSuperMenuOpen(false)
    setSuperSheet(null)
    setReaderControlsVisible(true)
    setBookSwitcherError('')
    setBookSwitcherOpen(true)
    const fallback = quickCatalogueFallback(book)
    // The built catalogue never lists books added from the public catalogue
    // (`pd-…`): their titles, painted covers and chapters come from the books
    // registered on this page and, when the reading history names an added
    // book, the public-books index (the library merges the same index).
    const registered: QuickAddedBooks = { entries: registeredPublicEntries(), complete: false }
    let historyNamesAddedBook = false
    try { historyNamesAddedBook = mentionsPublicBook(localStorage.getItem('tinct-lab-position'), JSON.stringify(readDeviceReadingMemory())) } catch { /* registered books still apply */ }
    const addedReady: Promise<QuickAddedBooks> = historyNamesAddedBook
      ? fetchPublicBooksIndex().then(index => index
        ? { entries: [...registered.entries, ...index], complete: true }
        : registered)
      : Promise.resolve(registered)
    // The reader's own books being read join the list exactly like Tinct's books
    // (userBook/ownShelf.ts: this account's records on this device; nothing is sent).
    let tinctRows = rowsForQuickCatalogue(fallback, registered)
    let ownRows: QuickBookRow[] = []
    const paint = () => setBookSwitcherRows(withOwnBookRows(tinctRows, ownRows))
    paint()
    setBookSwitcherLoading(true)
    const owner = signedIn ? (authUser?.id ?? readCachedSupabaseUser()?.id ?? null) : null
    // This device's own books paint at once; the account's (a book added or read on
    // another device) follow, exactly as the library lists them (ownSync.ts).
    let ownSettled = false
    void readOwnShelf(owner)
      .then(books => { if (!ownSettled) { ownRows = ownQuickBookRows(ownReadingNow(books)); paint() } }, () => {})
    // Refresh removals even when this browser enters the reader directly,
    // without first visiting the Library that normally syncs membership.
    const membershipReady = loadShelfMembership().catch(() => null)
    const ownReady = ownReadingNowWithAccount(owner, { token: authToken ?? undefined })
      .then(books => { ownSettled = true; ownRows = ownQuickBookRows(books); paint() }, () => {})
    void fetch('/lab/catalogue.json')
      .then(async response => {
        if (!response.ok) throw new Error(String(response.status))
        const payload = await response.json() as { books?: QuickBookCatalogueEntry[] }
        if (!Array.isArray(payload.books)) throw new Error('Invalid catalogue')
        const [added] = await Promise.all([addedReady, membershipReady])
        tinctRows = rowsForQuickCatalogue(payload.books, added)
        paint()
      })
      .catch(() => setBookSwitcherError('Showing books saved on this device.'))
      .finally(() => { void ownReady.finally(() => setBookSwitcherLoading(false)) })
  }, [authToken, authUser?.id, book, readerControlsVisible, rowsForQuickCatalogue, showPhoneChrome, signedIn, tocOpen])

  const switchQuickBook = useCallback((row: QuickBookRow) => {
    if (row.href) {
      // A reader's own book opens at its own URL, at the place kept on this device.
      notePlace('hide')
      rememberLibraryPlace()
      setBookSwitcherOpen(false)
      window.location.assign(sharedReader ? sharedReaderDestination(row.href) : row.href)
      return
    }
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
    const destination = `/reader${readerPreviewSearch(window.location.search)}`
    window.location.assign(sharedReader ? sharedReaderDestination(destination) : destination)
  }, [notePlace, rememberLibraryPlace, sharedReader])

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
  useEffect(() => {
    const count = () => { interactionCountRef.current += 1 }
    const options: AddEventListenerOptions = { capture: true, passive: true }
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    for (const name of events) document.addEventListener(name, count, options)
    return () => { for (const name of events) document.removeEventListener(name, count, options) }
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
    document.title = userBook ? `${userBook.edition.title} · ${LAB_COPY.documentTitle}` : LAB_COPY.documentTitle
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
    themeColor.content = LAB_THEME_PAPER[resolvedTheme === 'dark' || resolvedTheme === 'book' ? resolvedTheme : 'light']
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
    // A user book mounts with its chapter in hand and has one edition; its
    // chapter loads go through the navigation handlers.
    if (userBook) {
      markReaderLoadTrace('required_text_ready', { outcome: 'success' })
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
    // The paginators measure a chapter once with dictionary breaks instead of
    // once without and again when the patterns land. They are small and
    // preloaded with the page, so waiting (bounded) costs the text nothing.
    const hyphenLang = hyphenLangForEdition(primaryEditionKey)
    const hyphensSettled = hyphenLang
      ? Promise.race([loadHyphenator(hyphenLang), new Promise<void>(resolve => window.setTimeout(resolve, LAB_HYPHENATION_WAIT_MS))])
      : null
    withTextRetries(() => loadLabBookSource({
        readingFirst: true,
      bookId: activeBookId,
      chapterNumber: wanted,
      primaryEditionKey,
      compareEditionKey,
      compareAfterFirstPage: !firstPageShownRef.current && !compareOnScreenRef.current,
      audioEditionKey: bookEditions.some(edition => edition.key === audioEditionKey && edition.hasAudio) ? audioEditionKey : undefined,
    }), () => !cancelled && navigation === chapterNavigationRef.current).then(loaded => hyphensSettled ? hyphensSettled.then(() => loaded) : loaded).then((loaded) => {
      if (cancelled || navigation !== chapterNavigationRef.current) return
      // Bible's legacy loader has a Genesis fallback for network failures;
      // never let that replace a requested Bible chapter. Generic books may
      // safely normalize an invalid saved chapter to their own first chapter.
      if (activeBookId === 'bible' && loaded.chapterNumber !== wanted && wanted !== 1) return
      const loadedTarget = restoreTargetFor(restorePlaceRef.current, labRestoreChapterKey(loaded.bookId, loaded.chapterNumber))
      if (loadedTarget) {
        const paragraphIndex = loadedTarget.paragraphIndex
        if (paragraphIndex >= loaded.paragraphs.length) {
          restorePlaceRef.current = { paragraphIndex: 0, wordIndex: 0 }
          placeRef.current = restorePlaceRef.current
        }
      }
      setReaderLoadError('')
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
    // modern.refresh: a Modern English chapter shown in its original text is now written; reload it in place.
  }, [source, userBook, book.bookId, bookEditions, prefs.primaryEdition, prefs.compareEdition, prefs.compareOpen, audioEditionKey, modern.refresh])

  useEffect(() => {
    markReaderLoadTrace('fonts_start', { startOf: 'fonts' })
    let cancelled = false
    void Promise.resolve(document.fonts?.ready).then(() => {
      if (!cancelled) markReaderLoadTrace('fonts_ready', { endOf: 'fonts', outcome: 'success' })
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const pending = book.supplement
    // Audio timings and the cast are not on the opening page: they are asked
    // for once it is on screen.
    if (!pending || !firstPageShown) return
    let cancelled = false
    // Keyed by the load's own request, not the book object: the Compare
    // edition (below) may land first and replace the object, same load.
    void pending().then(supporting => {
      if (!cancelled) setBook(current => current.supplement === pending ? { ...current, ...supporting, supplement: undefined } : current)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [book, firstPageShown])

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
      setDesktopDefaultFontSize(labDesktopDefaultFontSize(window.innerWidth))
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
  const chapterPagingRef = useRef(measuredPaging)

  useLayoutEffect(() => {
    if (continuousReader) {
      shownChapterKeyRef.current = labRestoreChapterKey(book.bookId, book.chapterNumber)
      if (chapterKeyRef.current !== chapterKey || chapterContentRef.current !== readerParagraphs) {
        chapterKeyRef.current = chapterKey
        chapterContentRef.current = readerParagraphs
        const incoming = chapterLandingRef.current === 'end' && landingChapterRef.current === book.chapterNumber
          ? { paragraphIndex: Math.max(0, book.paragraphs.length - 1), wordIndex: Math.max(0, tokenizeHearingWords(book.paragraphs[book.paragraphs.length - 1] || '').length - 1) }
          : { ...placeRef.current }
        placeRef.current = incoming
        setContinuousAnchor(incoming)
        chapterLandingRef.current = null
        landingChapterRef.current = null
      }
      return
    }
    const chapterChanged = chapterKeyRef.current !== chapterKey
    const contentChanged = chapterContentRef.current !== readerParagraphs
    const pagingChanged = chapterPagingRef.current !== measuredPaging
    chapterKeyRef.current = chapterKey
    shownChapterKeyRef.current = labRestoreChapterKey(book.bookId, book.chapterNumber)
    chapterContentRef.current = readerParagraphs
    chapterPagingRef.current = measuredPaging
    // Same chapter, same text, same paging: nothing this effect lays out has
    // changed (on the desktop, a resumed phone-Compare flag clearing itself
    // after load). Re-estimating here replaced the measured map with a draft
    // one under the same page index, so a reload at the chapter's last page
    // showed the page before it (check-chapter-preview, desktop Compare).
    if (!chapterChanged && !contentChanged && !pagingChanged && pagesStableRef.current && readingPagesRef.current.length > 0) return
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
    const next = withComparePassage(naturalNext, readerParagraphs)
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
      const target = restoreTargetFor(restorePlaceRef.current, shownChapterKeyRef.current)
      if (target) {
        const place = target
        restorePlaceRef.current = null
        placeRef.current = place
        const idx = pageIndexForPlace(next, place.paragraphIndex, place.wordIndex)
        // A draft page boundary is not the saved reading place. Carry the
        // exact word through to the font-settled paginator on refresh.
        pageAnchorRef.current = place
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
  }, [book.chapterNumber, book.bookId, chapterKey, mobileCompareActive, readerParagraphs, measuredPaging, continuousReader])

  useEffect(() => {
    mobilePrimaryPagesRef.current = null
  }, [book.bookId, book.chapterNumber, readingFont, readingFontSize, readingAlignment, flowingShakespeare, prefs.lineSpacing, prefs.margins, prefs.paragraphSpacing])

  useLayoutEffect(() => {
    if (continuousReader) return
    if (measuredPaging) return
    if (!pageMetrics || didBudgetPageRef.current || pagesStableRef.current) return
    if (readerParagraphs.length === 0) return
    const budget = labPageBudgetFromMetrics(pageMetrics)
    if (!canUseLabPageBudget(budget)) return
    didBudgetPageRef.current = true
    const naturalNext = chapterHearingPages(readerParagraphs, budget)
    const next = withComparePassage(naturalNext, readerParagraphs)
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
  }, [pageMetrics, readerParagraphs, measuredPaging, continuousReader])

  useLayoutEffect(() => {
    if (continuousReader) return
    didBudgetPageRef.current = false
    pagesStableRef.current = false
    unmeasuredTriesRef.current = 0
    setSettleIndex(measuredPaging ? null : 0)
    settleIndexRef.current = measuredPaging ? null : 0
  }, [readingFont, readingFontSize, readingAlignment, flowingShakespeare, prefs.lineSpacing, prefs.margins, prefs.paragraphSpacing, measuredPaging, continuousReader])

  const lastVvRef = useRef(0)
  const lastBarTopRef = useRef(0)
  const lastAdjustRef = useRef<LabPageAdjust>(null)
  const beforeGrowPagesRef = useRef<ChapterHearingPage[] | null>(null)
  // A shared highlight link (/q/{id} → /reader?…&share=id): its passage is
  // painted for this visit only, never saved to the visitor's highlights.
  const [sharedHighlight, setSharedHighlight] = useState<LabHighlight | null>(null)
  useEffect(() => {
    const link = sharedLinkForPage()
    if (!link) return
    trackFunnel('share_link_opened', { share_id: link.id, referrer_domain: link.ref || null })
    let active = true
    fetch(apiUrl(`/api/share/${link.id}`)).then(response => response.ok ? response.json() : null).then((record: { bookId?: string; editionKey?: string; chapterNumber?: number; paragraphIndex?: number; fromWord?: number; endParagraphIndex?: number; toWord?: number } | null) => {
      if (!active || !record?.bookId || !record.editionKey || typeof record.chapterNumber !== 'number') return
      setSharedHighlight({
        id: `shared-${link.id}`, bookId: record.bookId, editionKey: record.editionKey, chapterNumber: record.chapterNumber,
        paragraphIndex: record.paragraphIndex ?? 0, fromWord: record.fromWord ?? 0, endParagraphIndex: record.endParagraphIndex ?? 0, toWord: record.toWord ?? 0,
        color: 'gold',
      })
    }).catch(() => {})
    return () => { active = false }
  }, [])
  const [shareTarget, setShareTarget] = useState<LabShareTarget | null>(null)
  const highlightsApi = useLabHighlights(book.chapterNumber, { shared: sharedHighlight, bookId: book.bookId || 'bible', editionKey: prefs.primaryEdition, paragraphs: book.paragraphs, compareEditionKey: prefs.compareEdition, compareParagraphs: book.compareParagraphs, userId: userBook ? null : authToken !== undefined ? (authToken ? (authUser?.id ?? null) : null) : (authUser?.id ?? null) })
  // The Compare edition of a cold open, once the first page is up. Only the
  // load that asked for it receives it; a newer load has its own.
  useEffect(() => {
    const pending = book.compareLater
    if (!pending || !firstPageShown) return
    let cancelled = false
    void pending.then(paragraphs => {
      if (!cancelled) setBook(current => current.compareLater === pending ? { ...current, compareParagraphs: paragraphs, compareLater: undefined } : current)
    })
    return () => { cancelled = true }
  }, [book.compareLater, firstPageShown])
  const primaryCharacters = useCharacterCards(firstPageShown && !privateBook ? book.bookId : undefined, prefs.primaryEdition)
  // Verifying cards downloads their complete source edition. Do not fetch an
  // unused second book alongside the chapter when Compare is disabled.
  const compareCharacters = useCharacterCards(firstPageShown && prefs.compareOpen && !privateBook ? book.bookId : undefined, prefs.compareEdition)
  // The whole book, readable offline with no tap: main edition plus compare,
  // saved in the background once the first page is up (useLabAutoOffline.ts).
  // A reader's own books are already on this device; an added book's paid
  // Modern English edition is written on the server and read fresh.
  const offlineBookId = book.bookId || 'bible'
  const autoOfflineEditions = offlineEditionKeys(prefs.primaryEdition, prefs.compareOpen ? prefs.compareEdition : null)
    .filter(key => bookEditions.some(edition => edition.key === key) && !editionHold(offlineBookId, key)
      && !(isPublicBookId(offlineBookId) && key === MODERN_EDITION_KEY))
  useLabAutoOffline({
    bookId: offlineBookId,
    editionKeys: autoOfflineEditions,
    hasVerseLines: bookEditions.some(edition => edition.hasVerseLines),
    enabled: firstPageShown && !privateBook && !ownPdf && !isUserBookId(offlineBookId),
  })
  // Author footnotes, for the edition actually on the page; other editions never request any.
  const chapterFootnotes = useChapterFootnotes(firstPageShown && !privateBook ? book.bookId : undefined, readerEditionKey, book.chapterNumber, readerParagraphs)
  const [openFootnote, setOpenFootnote] = useState<OpenFootnote | null>(null)
  const showFootnote = useCallback((note: PlacedFootnote, marker: HTMLElement) => {
    const rect = marker.getBoundingClientRect()
    const showBelow = window.innerHeight - rect.bottom > rect.top
    setOpenFootnote({ note, x: Math.max(24, Math.min(window.innerWidth - 24, rect.left + rect.width / 2)), y: showBelow ? rect.bottom + 8 : rect.top - 8, showBelow })
  }, [])
  const define = useDefine()
  const [crossSelecting, setCrossSelecting] = useState<ChapterSelectionPart[] | null>(null)
  /** The chapter-end Note pill's editor: a private note on the whole chapter. */
  const [chapterNoteEditor, setChapterNoteEditor] = useState<{ bookId: string; chapterNumber: number; left: number; top: number; bottom: number } | null>(null)
  const openChapterNoteRef = useRef<(chapterNumber: number, pill: DOMRect) => void>(() => {})
  const [selectionPopup, setSelectionPopup] = useState<(SelectionInfo & { chapterRanges?: ChapterSelectionPart[]; range?: LabHighlightRange; editionKey?: string; side?: 'compare'; defineText?: string; chapterNumber?: number; chapterLabel?: string; paragraphs?: string[]; openedAt?: number }) | null>(null)
  const selectionPopupRef = useRef(selectionPopup)
  selectionPopupRef.current = selectionPopup
  const [popupMode, setPopupMode] = useState<PopupMode>('colors')
  const popupModeRef = useRef(popupMode)
  popupModeRef.current = popupMode
  const [noteInput, setNoteInput] = useState('')
  const popupRef = useRef<HTMLDivElement | null>(null)
  // The phone's margin mode: the one bottom card open (marginPhone/), the text in its field, and its answer once whole.
  const [phoneCard, setPhoneCard] = useState<PhoneCard | null>(null)
  const [desktopLiveCards, setDesktopLiveCards] = useState<PhoneCard[]>([])
  useLayoutEffect(() => {
    const host = continuousReader ? pageWrapRef.current?.querySelector<HTMLElement>('[data-testid="continuous-reader"]') ?? null : null
    // Do not enqueue a layout update on every commit, even with a same-value
    // updater. Pending page updates can prevent React's eager bailout and
    // keep the synchronous commit loop alive on the paged reader.
    if (marginHost !== host) setMarginHost(host)
  })
  const [sharedCardSaveError, setSharedCardSaveError] = useState(false)
  const [saveDetailsCopied, setSaveDetailsCopied] = useState(false)
  useEffect(() => { setSaveDetailsCopied(false) }, [sharedCardSaveError])
  const desktopCardRequestRef = useRef<{ key: string; id: string; at: number; savedAnswer?: string } | null>(null)
  const [phoneNote, setPhoneNote] = useState('')
  const phoneFieldRef = useRef<HTMLTextAreaElement | null>(null)
  const phoneAnswerRef = useRef<{ card: PhoneCard; answer: string; kept: boolean } | null>(null)
  const quizChapterRef = useRef<(anchor?: DOMRect) => void>(() => {})
  const desktopQuizAnchorRef = useRef<DOMRect | null>(null)
  /** The phone's margin mode: the chapter's Note pill opens its card (true), not the editor beside the pill. */
  const marginPhoneNoteRef = useRef<(chapterNumber: number) => boolean>(() => false)
  const pageMetricsRef = useRef<LabPageMetrics | null>(pageMetrics)
  pageMetricsRef.current = pageMetrics
  const pageMetricGeometryRef = useRef<{ width: number; height: number } | null>(null)
  const settledPageGeometryRef = useRef<{ width: number; height: number } | null>(null)
  const pageAnchorRef = useRef<{ paragraphIndex: number; wordIndex: number } | null>(null)
  // V2 phone: the audio transport opening or closing changes the reserved
  // foot. The page on screen (and those before it) is kept exactly; only the
  // pages after it are laid out at the new height (see labPagesKeepingPrefix).
  // `transportOpenRef` is the foot now; `mapTransportOpenRef` the foot the
  // native map in use was measured against.
  const [pageFreeze, setPageFreeze] = useState<{ content: string[]; layoutKey: string; pages: ChapterHearingPage[] } | null>(null)
  const pageFreezeRef = useRef(pageFreeze)
  pageFreezeRef.current = pageFreeze
  const transportOpenRef = useRef(false)
  const mapTransportOpenRef = useRef<boolean | null>(null)
  const keepPlayingChapterRef = useRef<number | null>(null)
  const listenStartRef = useRef(listen.start)
  listenStartRef.current = listen.start

  const applyNativePages = useCallback((incoming: ChapterHearingPage[], measuredContent?: string[], partial = false) => {
    if (measuredContent && measuredContent !== nativeContentRef.current) return
    // Every session, a deep link's included, adopts the measured map verbatim.
    const next = withComparePassage(incoming, nativeContentRef.current)
    // Audio chrome temporarily changes the available box. Keep the reading
    // page map as the single authority instead of repaginating mid-playback.
    // The transport opens and closes over the page, and the column changes
    // height with it: the new map is taken, anchored on the word being
    // spoken, so the reader stays on their paragraph and follow resolves the
    // right page of the new map on its next tick.
    const playing = listenPlayingRef.current
    if (
      !measuredPaging
      || next.length === 0
    ) return
    if (partial) {
      // A head-first map shows its opening page only. Any other place to
      // land on (a saved word, a page, the chapter's end, the word being
      // spoken) waits for the full map, so the reader never lands on a
      // stand-in page and never moves when the rest arrives.
      const wanted = restoreTargetFor(restorePlaceRef.current, shownChapterKeyRef.current) ?? (playing ? placeRef.current : null) ?? mobileCompareReturnPlaceRef.current ?? pageAnchorRef.current
      const atOpening = !wanted || pageIndexForPlace(next, wanted.paragraphIndex, wanted.wordIndex) === 0
      if (!atOpening || (restorePageRef.current ?? 0) > 0 || chapterLandingRef.current === 'end' || openAtEndRef.current) return
    }
    nativeHeadOnlyRef.current = partial ? performance.now() : 0
    if (partial) setNativeHeadContent(measuredContent ?? nativeContentRef.current)
    else {
      setNativeMeasuredContent(measuredContent ?? nativeContentRef.current)
      setNativeHeadContent(null)
      if (headFirstTurnRef.current) {
        if (headFirstTurnTimerRef.current !== null) window.clearTimeout(headFirstTurnTimerRef.current)
        headFirstTurnTimerRef.current = window.setTimeout(() => {
          headFirstTurnTimerRef.current = null
          if (!headFirstTurnRef.current) return
          headFirstTurnRef.current = false
          goNextRef.current()
        }, 0)
      }
    }
    mapTransportOpenRef.current = transportOpenRef.current
    if (new URLSearchParams(location.search).has('qaLayoutTrace')) console.log('NATIVE_MAP', JSON.stringify({layout: readerStateRef.current, incoming: incoming.slice(0,5), next: next.slice(0,5), current:readingPagesRef.current.slice(0,5), keep:pageAnchorRef.current}))
    const current = readingPagesRef.current
    const working = workingPagesRef.current
    const currentIndex = Math.max(0, Math.min(readingPageIndexRef.current, Math.max(0, current.length - 1)))
    // The first native map replaces an estimated map. Restore from the saved
    // word itself, never from the estimated page that happened to contain it.
    // Only a target for the chapter this map lays out: the outgoing chapter's
    // last measurement can land after the next chapter's place was set.
    const target = restoreTargetFor(restorePlaceRef.current, shownChapterKeyRef.current)
    const restoring = target
      && next.some(page => chapterPageSegments(page).some(segment => segment.paragraphIndex === target.paragraphIndex))
      ? target : null
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
  }, [measuredPaging, withComparePassage])

  /**
   * The standby map, off the critical path entirely: a ref write, no state,
   * so measuring the edition nobody is reading can never cause a render.
   */
  const applyStandbyPages = useCallback((pages: ChapterHearingPage[]) => {
    if (pages.length === 0) return
    standbyPagesRef.current = { key: standbyKeyRef.current, pages }
  }, [])

  /**
   * A tap on a word while the transport is up (playing or paused). It is a
   * jump: audio moves to exactly that word. Playing, it carries on from there;
   * paused, it stays paused and Play later resumes from the start of that
   * word's sentence (see resumeListeningPlace).
   */
  const seekAudioToWord = useCallback(async (paragraphIndex: number, wordIndex: number) => {
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    const snapped = wordIndex
    const place = { paragraphIndex, wordIndex: snapped }
    placeRef.current = place
    const playingNow = listen.playing || listen.isPending()
    if (!playingNow) {
      const sameChapter = listenSource.bookId === (book.bookId || 'bible') && listenSource.chapterNumber === book.chapterNumber
      // The player's own cursor moves too, so every later resume path (Play,
      // the lock screen, the end of Talk) starts from the word chosen here.
      if (sameChapter && listen.src) listen.seekToPlace(paragraphIndex, snapped)
      pausedJumpRef.current = { bookId: book.bookId || 'bible', chapterNumber: book.chapterNumber, ...place }
      setReadingPageIndex(pageIndexForPlace(readingPagesRef.current, paragraphIndex, snapped))
      notePlace('pause', place)
      return
    }
    pausedJumpRef.current = null
    const nextSource = {
      bookId: book.bookId || 'bible',
      chapterNumber: book.chapterNumber,
      paragraphs: book.paragraphs,
      followParagraphs: book.followParagraphs,
      audioTitle: book.audioTitle,
      chapters: book.chapters,
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
    if (!chapterChanged && listen.src && listen.playing) {
      listen.seekToPlace(paragraphIndex, snapped)
      return
    }
    // Still loading (or nothing loaded yet): this tap supersedes that start.
    await listen.startAtPlace(place)
  }, [book, listen, listenSource.bookId, listenSource.chapterNumber, notePlace])

  /** The first word of the sentence holding `place`, in the chapter audio is on. */
  const sentenceStartPlace = useCallback((place: { paragraphIndex: number; wordIndex: number }) => {
    const sameChapter = listenSource.bookId === (book.bookId || 'bible') && listenSource.chapterNumber === book.chapterNumber
    const paragraphs = sameChapter ? book.paragraphs : listenSource.paragraphs
    const words = tokenizeHearingWords(paragraphs[place.paragraphIndex] || '')
    return { paragraphIndex: place.paragraphIndex, wordIndex: listeningSentenceStart(words, place.wordIndex) }
  }, [book.bookId, book.chapterNumber, book.paragraphs, listenSource.bookId, listenSource.chapterNumber, listenSource.paragraphs])

  /**
   * Where paused listening picks up on this chapter: the word the reader
   * tapped since pausing, else the word last heard — always from the start
   * of its sentence, so audio never resumes mid-sentence.
   */
  const resumeListeningPlace = useCallback((): { paragraphIndex: number; wordIndex: number } | null => {
    const jump = pausedJumpRef.current
    if (jump && jump.bookId === (book.bookId || 'bible') && jump.chapterNumber === book.chapterNumber) return sentenceStartPlace(jump)
    const follow = listen.follow
    if (follow.kind === 'word') return sentenceStartPlace(follow)
    if (follow.kind === 'paragraph') return { paragraphIndex: follow.paragraphIndex, wordIndex: 0 }
    return null
  }, [book.bookId, book.chapterNumber, listen.follow, sentenceStartPlace])

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
    if (continuousReader) return
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
      const pages = workingPagesRef.current
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
        // The words-per-page figure was measured in the old box; the new
        // pages set it afresh (a page that came back short after a Stripe
        // round trip kept the short figure, 10 Oct 2026).
        wordsPerPageRef.current = null
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
  }, [isPhone, showPhoneChrome, listen.playing, chrome, phoneAskOpen, readerControlsVisible, readingFont, readingFontSize, readingAlignment, flowingShakespeare, prefs.lineSpacing, prefs.margins, prefs.paragraphSpacing, fullscreen, measuredPaging])

  useLayoutEffect(() => {
    if (continuousReader) return
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
      // The foot just changed height under this page (the transport opened
      // or closed) and the map has not caught up, or this is a page kept
      // through that change: its words stay where they are and the
      // transport covers its last line. Peeling it would move them.
      const frozen = pageFreezeRef.current
      if (
        mapTransportOpenRef.current !== transportOpenRef.current
        || (frozen && frozen.content === readerParagraphs && pageIdx < frozen.pages.length)
      ) return

      const next = shrinkNativePageAfterPaint(readerParagraphs, pages, pageIdx, painted)
      if (new URLSearchParams(location.search).has('qaLayoutTrace')) console.log('PAINT_SHRINK', JSON.stringify({pageIdx,painted,before:pages.slice(0,5),after:next.slice(0,5)}))
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
  }, [readingPageIndex, readingPages, nativePagesRevision, nativeMeasuredContent, phoneAskOpen, listen.playing, browseWhileListening, measuredPaging, readerControlsVisible, chrome, readerParagraphs, book.chapterNumber, continuousReader])

  useEffect(() => {
    if (continuousReader) return
    // A queued effect may still hold the provisional map after measurement
    // has committed a newer one. It must not rewrite the exact saved anchor.
    if (measuredPaging && readingPages !== readingPagesRef.current) return
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
    // A measured-map commit already resolves the page from the semantic
    // anchor on phones and desktop. A queued provisional-map effect must
    // never overwrite that index after the font-settled map is committed.
    if (measuredPaging) return
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
  }, [readingPages, openAtEnd, book.chapterNumber, measuredPaging, continuousReader])

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

  const interruptHearForAsk = useCallback((options?: { alwaysUnlock?: boolean }) => {
    // Captured as the companion opens: only audio that was actually playing
    // (or starting) then comes back when it closes. Paused audio stays paused.
    const hearingNow = listen.playing || listen.isPending()
    // This tap may be the last gesture before the companion starts audio
    // ("play the audiobook"), which then runs outside any gesture. Only
    // iOS/touch devices need that unlock; on a desktop it starts audio output
    // and can take shared headphones from the reader's phone (stopping its
    // music), so it is skipped there. Talk and Listen unlock on their own taps.
    if (options?.alwaysUnlock || readNeedsGestureAudioUnlock()) listen.unlockPlayback()
    // Opening a companion pauses audio once. Follow-up actions inside that
    // same companion must not overwrite the original return mode after the
    // audio element is already paused. A companion opened afresh always
    // captures anew: a flag left over from an earlier session (Talk handed
    // to Chat, a call surface) must not resume audio the reader paused.
    const companionOpen = phoneAskOpenRef.current || desktopAskOpenRef.current || callOpenRef.current || chromeRef.current === 'talking'
    if (!hearingNow && pausedForAskRef.current && companionOpen) return
    const returnMode: LabReturnTo = hearingNow ? 'hearing' : 'reading'
    pausedForAskRef.current = hearingNow
    setReturnTo(returnMode)
    returnToRef.current = returnMode
    if (hearingNow) listen.pause()
  }, [listen])

  const resumeListenAfterAsk = useCallback((forceHearing = false) => {
    if (callOpen) {
      // An explicit resume command ends the call successfully. Leaving the
      // surface mounted would mislabel that intentional stop as a disconnect.
      setCallOpen(false)
    }
    ask.stopVoice()
    ask.dismissNotice()
    if (stayInAskRef.current) {
      stayInAskRef.current = false
      setPhoneAskOpen(true)
      setChrome(current => (current === 'talking' ? (pausedForAskRef.current || returnToRef.current === 'hearing' ? 'hearing' : 'reading') : current))
      return
    }
    setPhoneAskOpen(false)
    setDesktopAskOpen(false)
    setPeekBook(false)
    // Closing Talk returns to the mode it interrupted: audio resumes only if
    // it was playing when Talk opened (captured then, in pausedForAskRef).
    // The explicit voice command "resume the audiobook" is different: it
    // must begin audio even when Talk was opened from ordinary reading.
    const interruptedAudio = pausedForAskRef.current
    const shouldHear = forceHearing || interruptedAudio
    pausedForAskRef.current = false
    if (!shouldHear) {
      setChrome('reading')
      return
    }
    if (forceHearing && !interruptedAudio) {
      startHearingRef.current()
      return
    }
    setReturnTo('hearing')
    returnToRef.current = 'hearing'
    setChrome('hearing')
    // A voice return uses the same source/follow boundary as pressing Play.
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    setInTheBookOpen(false)
    // A return from Talk, Chat or a prompt starts at the sentence's first word.
    if (listen.src) listen.resume(true)
    else {
      const place = sentenceStartPlace(placeRef.current)
      placeRef.current = place
      void listen.startAtPlace(place)
    }
  }, [ask, listen, callOpen, sentenceStartPlace])
  resumeListenRef.current = (forceAudio = true) => resumeListenAfterAsk(forceAudio)
  const closeAccountPrompt = useCallback(() => {
    const request = accountPrompt
    setAccountPrompt(null)
    // A held-back Talk leaves the talking chrome the way a closed Talk does.
    if (request?.action === 'voice') resumeListenAfterAsk()
  }, [accountPrompt, resumeListenAfterAsk])
  // A speed change alone never decides whether audio resumes after Talk:
  // that is fixed by whether audio was playing when Talk opened.
  setSpeedRef.current = (rate) => {
    listen.setSpeed(rate)
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
      if (!callOpenRef.current) setDesktopAskOpen(true)
      return
    }
    if (!wasTalking) return
    // The call surface owns its own ending. A dropped connection leaves it
    // standing so it can say "Disconnected" and offer to reconnect; only End
    // conversation (or Reconnect failing) takes it down.
    if (callOpenRef.current) {
      return
    }
    if (phoneAskOpenRef.current) {
      setChrome(current => {
        if (current !== 'talking') return current
        return pausedForAskRef.current || returnToRef.current === 'hearing' ? 'hearing' : 'reading'
      })
      return
    }
    if (pausedForAskRef.current) {
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

  const typedLoadingRef = useRef(false)
  useEffect(() => {
    const wasLoading = typedLoadingRef.current
    typedLoadingRef.current = ask.typedLoading
    if (!wasLoading || ask.typedLoading || ask.voiceActive) return
    if (phoneAskOpenRef.current || desktopAskOpenRef.current) return
    if (!pausedForAskRef.current) return
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
    readingFontSize,
    readingAlignment, flowingShakespeare,
    prefs.lineSpacing,
    prefs.margins,
    prefs.paragraphSpacing,
    fullscreen ? 'fullscreen' : 'windowed',
  ].join(':')
  const desktopLayoutKey = `${layoutKeyFor(readerEditionKey)}:${desktopCompareActive}:${book.bookId}`
  const [desktopEndInFooter, setDesktopEndInFooter] = useState(false)
  const applyDesktopPages = useCallback((pages: ChapterHearingPage[], content: string[], key: string, capacity: LabLeafCapacity | null, endInFooter = false) => {
    if (content !== nativeContentRef.current) return
    setDesktopEndInFooter(endInFooter)
    applyNativePages(pages, content)
    setDesktopMeasuredKey(key)
    setDesktopLeafCapacity(capacity)
  }, [applyNativePages])
  const standbyKey = layoutKeyFor(standbyEditionKey)
  const standbyKeyRef = useRef(standbyKey)
  standbyKeyRef.current = standbyKey
  const readerLayoutKey = [
    readingFont,
    readingFontSize,
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
  // The full-screen call, and what is left of it while the transcript is open.
  const callFullScreen = showPhoneChrome && callOpen && !phoneAskOpen
  // The desktop conversation: the companion panel, or the pill while minimized.
  const desktopVoiceOpen = voicePanelSurface && callOpen
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
  // A connect that never lands is a failed call, not a permanent "Connecting to AI…"
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
    // Desktop errors use a separate inline Retry row. Release the unused
    // playback reserve; the phone error remains above its transport bar.
    if (!showPhoneChrome && listen.narration.status === 'error') setPausedTransportVisible(false)
    else if (listen.playing || listen.pending) setPausedTransportVisible(true)
  }, [showPhoneChrome, listen.playing, listen.pending, listen.narration.status])
  useEffect(() => { setPausedTransportVisible(false) }, [book.bookId, book.chapterNumber])
  const audioBarActive = showPhoneChrome
    && phoneBarPossible
    && !phoneAsk
    && !mobileCompareActive
    && (listen.pending || listen.playing || audioChapterTransitioning || pausedTransportVisible)
  const desktopAudioBarActive = !showPhoneChrome && (listen.pending || listen.playing || pausedTransportVisible)
  // The dock rides over the leaf's foot, never over its text (labAudioDock).
  const desktopDockRef = useRef<HTMLElement | null>(null)
  useDesktopDockPlacement(desktopDockRef, desktopAudioBarActive && desktopPaging)
  const phoneTransportOpen = showPhoneChrome && audioBarActive
  transportOpenRef.current = phoneTransportOpen
  const lastPhoneTransportRef = useRef(phoneTransportOpen)
  // The page that was on screen as of the previous commit. A page turn can
  // close the paused transport in the same commit; the page turned to was
  // never seen under the old foot, so it is laid out afresh, not kept.
  const shownPageIndexRef = useRef(readingPageIndex)
  useLayoutEffect(() => {
    const previous = lastPhoneTransportRef.current
    const shownIndex = shownPageIndexRef.current
    lastPhoneTransportRef.current = phoneTransportOpen
    shownPageIndexRef.current = readingPageIndex
    if (previous === phoneTransportOpen) return
    const pages = readingPagesRef.current
    if (
      !measuredPaging || desktopPaging
      || nativeMeasuredContent !== readerParagraphs || pages.length === 0
      || comparePassageRef.current?.paragraphs === readerParagraphs
    ) {
      setPageFreeze(null)
      return
    }
    // Keep the page on screen, and every page before it, exactly as laid
    // out. The paginator lays out only what follows at the new foot, from
    // the word after the kept page — so a page reached in this same commit
    // still begins on the same word (Play never moves a word on screen:
    // scripts/check-inline-audio-loading.mjs).
    const current = Math.max(0, Math.min(readingPageIndexRef.current, pages.length - 1))
    const index = Math.min(current, Math.max(0, shownIndex))
    setPageFreeze({ content: readerParagraphs, layoutKey: layoutKeyFor(readerEditionKey), pages: pages.slice(0, index + 1) })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fires on the foot changing only; tracks the shown page every commit
  })
  // Phone Chat takes the page surface's place: the page and its paginator are
  // unmounted while Chat is open and lay the chapter out again on the way
  // back. A fresh layout is not the map the reader turned through (the visible
  // page check may have peeled those pages), so the saved page start can fall
  // inside an earlier page of it. Keep the page the reader left, and every
  // page before it, exactly as it was on screen; only what follows is laid
  // out afresh. Declared after the foot freeze so that it wins in the commit
  // Chat opens in.
  const phoneAskShownRef = useRef(phoneAsk)
  useLayoutEffect(() => {
    const wasOpen = phoneAskShownRef.current
    phoneAskShownRef.current = phoneAsk
    if (!phoneAsk || wasOpen) return
    const pages = readingPagesRef.current
    if (!measuredPaging || desktopPaging || nativeMeasuredContent !== readerParagraphs || pages.length === 0) return
    const current = Math.max(0, Math.min(readingPageIndexRef.current, pages.length - 1))
    setPageFreeze({ content: readerParagraphs, layoutKey: layoutKeyFor(readerEditionKey), pages: pages.slice(0, current + 1) })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fires on Chat opening only; reads the page map as it is then
  }, [phoneAsk])
  // Chat on screen: warm the companion's reading trail (read-only) so the
  // first question is not held back loading earlier chapters' opening lines.
  const askPaneShown = (!showPhoneChrome && desktopAskOpen && !desktopVoiceOpen) || phoneAsk
  const warmAskTrail = ask.warmTrail
  useEffect(() => {
    if (askPaneShown) warmAskTrail()
  }, [askPaneShown, warmAskTrail, book.bookId, book.chapterNumber, readerEditionKey])
  // A new chapter, edition or typography lays the whole chapter out afresh.
  const nativeLayoutKey = layoutKeyFor(readerEditionKey)
  useEffect(() => { setPageFreeze(null) }, [readerParagraphs, nativeLayoutKey])
  // There is no reading bar. Play is in the top bar and Chat, Talk and Compare
  // are in the menu; what the foot holds is the progress line, and the
  // transport for as long as audio plays. The space the bar took goes to the
  // page.
  const showPhoneBar = phoneBarPossible && audioBarActive
  // The paused phone player puts itself away from its grab handle or a swipe
  // down; while audio plays it stays.
  const phonePausedCloseAllowed = audioBarActive && !listen.playing && !listen.pending && listen.narration.status !== 'error' && !phoneAsk
  const closePausedTransport = useCallback(() => { setPausedTransportVisible(false); setSpeedPopoverOpen(false) }, [])
  const phoneBarSwipe = useSwipeDownClose<HTMLElement>(phonePausedCloseAllowed, reducedMotion, closePausedTransport)
  useEffect(() => {
    if (showPhoneChrome ? !audioBarActive : !desktopAudioBarActive) setSpeedPopoverOpen(false)
  }, [audioBarActive, desktopAudioBarActive, showPhoneChrome])
  // The chrome may hide while audio plays — the transport is what stays
  // on screen, at full opacity, so playback can always be seen and stopped.
  const phoneReaderControlsVisible = readerControlsVisible
    || phoneAsk
    || chrome === 'talking'
    || superMenuOpen
    || superSheet !== null
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
  const nextOpeningKey = desktopSpread && nextChapterNumber != null && nextChapterTitle && !nextOpensBibleBook && !book.chaptersProvisional
    ? `${book.bookId || 'bible'}:${readerEditionKey}:${nextChapterNumber}`
    : null
  const [nextOpening, setNextOpening] = useState<{ key: string; title: string; paragraphs: string[] } | null>(null)
  const [nextOpeningPage, setNextOpeningPage] = useState<{ key: string; paragraphs: string[]; page: ChapterHearingPage; continuation: { paragraphIndex: number; wordIndex: number } | null } | null>(null)
  useEffect(() => {
    if (!nextOpeningKey || nextChapterNumber == null || !nextChapterTitle || nextOpening?.key === nextOpeningKey) return
    let live = true
    void loadChapterText({
      bookId: book.bookId || 'bible', editionKey: readerEditionKey, chapterNumber: nextChapterNumber,
      version: typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : undefined,
    }).then(chapter => {
      if (!live || !chapter?.paragraphs.length) return
      registerLoadedChapter(readerEditionKey, chapter.paragraphs)
      // Use the same complete source as the destination paginator. A truncated
      // sample can mistake its last paragraph for the real chapter ending.
      setNextOpening({ key: nextOpeningKey, title: nextChapterTitle, paragraphs: chapter.paragraphs })
    }).catch(() => {})
    return () => { live = false }
  }, [nextOpeningKey])
  const applyNextOpeningPages = useCallback((pages: ChapterHearingPage[], content: string[], key: string) => {
    setNextOpeningPage(pages[0] ? { key, paragraphs: content, page: pages[0], continuation: pageAnchorOf(pages[1]) } : null)
  }, [])
  const goNextRef = useRef<() => void>(() => {})
  const [carriedEnding, setCarriedEnding] = useState<{
    bookId: string; editionKey: string; targetChapter: number; layoutKey: string; width: number; height: number;
    title: string; chapterNumber: number; paragraphs: string[]; page: ChapterHearingPage; previousAnchor: {paragraphIndex:number;wordIndex:number} | null;
    folio: number; chapterEnd: ReactNode; onPrimer?: () => void;
  } | null>(null)
  const carriedEndingCurrent = desktopSpread && carriedEnding?.bookId === (book.bookId || 'bible')
    && carriedEnding.editionKey === readerEditionKey && carriedEnding.targetChapter === book.chapterNumber
    && carriedEnding.layoutKey === `${readerLayoutKey}:${fullscreen}` && carriedEnding.width === window.innerWidth && carriedEnding.height === window.innerHeight
    ? carriedEnding : null
  const openingOnRight = Boolean(carriedEndingCurrent && readingPageIndex === 0)
  // The paragraphs on the page (or spread) in view, for an added book's Modern
  // English edition still being written (labModernEdition.ts).
  const modernSpreadPage = desktopSpread && !openingOnRight ? readingPages[readingPageIndex + 1] : undefined
  // Before paint: a page turned onto unwritten paragraphs is covered in the same frame, never shown first.
  useLayoutEffect(() => {
    if (!modernEnabled) return
    const pages = [readingPage, modernSpreadPage].filter((page): page is ChapterHearingPage => !!page)
    const indexes = pages.flatMap(page => [page.paragraphIndex, ...(page.segments ?? []).map(segment => segment.paragraphIndex)])
    const place = placeRef.current.paragraphIndex
    const next = indexes.length ? { first: Math.min(...indexes), last: Math.max(...indexes) } : { first: place, last: place }
    setModernVisible(prev => prev && prev.first === next.first && prev.last === next.last ? prev : next)
  }, [modernEnabled, readingPage, modernSpreadPage])
  const nextOpeningCurrent = nextOpening && nextOpening.key === nextOpeningKey ? nextOpening : null
  const nextOpeningLayoutKey = `${desktopLayoutKey}:next:${nextOpeningKey ?? ''}`
  const nextChapterOpening = nextOpeningCurrent && nextOpeningPage?.key === nextOpeningLayoutKey && nextOpeningPage.paragraphs === nextOpeningCurrent.paragraphs
    && !openingOnRight && readingPages.length > 0 && readingPageIndex >= readingPages.length - 1
    && (nextOpeningPage.continuation || nextLabChapter(book.chapters, nextChapterNumber!) != null)
    ? { title: nextOpeningCurrent.title, chapterNumber: nextChapterNumber!, paragraphs: nextOpeningCurrent.paragraphs, page: nextOpeningPage.page }
    : undefined
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
  // Talk on the lock screen: the book's cover and title while a call is open,
  // then back to the chapter details narration shows.
  useEffect(() => {
    if (!callOpen) return
    const session = readerMediaSession()
    if (!session) return
    const title = book.bookTitle || 'Tinct'
    // A reader's own book has no cover: its id never goes into an artwork URL.
    const artwork = privateBook ? [] : [{ src: new URL(`/covers/v2/${book.bookId || 'bible'}.webp`, window.location.href).href, sizes: '540x810', type: 'image/webp' }]
    try {
      session.metadata = readerMediaMetadata({ title: `Talking about ${title}`, artist: 'Tinct', album: title, artwork })
      session.playbackState = 'playing'
    } catch { /* unsupported */ }
    return () => {
      try {
        session.metadata = readerMediaMetadata({ title: book.chapterTitle || title, artist: `${title} · ${LAB_COPY.aiNarration}`, album: title, artwork })
        session.playbackState = 'paused'
      } catch { /* unsupported */ }
    }
  }, [callOpen, book.bookId, book.bookTitle, book.chapterTitle, privateBook])
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
    // A user book is not recorded in the reading memory (it syncs to the account).
    ready: !privateBook && !frontispieceVisible && !positionWritesSuspended && !readerLoadError && readerParagraphs.length > 0 && !tocOpen,
    pageTurnDirection: pageTurn?.direction ?? null,
    finishedChapters,
  })
  useRecapPreparation({
    playing: listen.playing,
    userId: authUser?.id ?? null,
    ready: !privateBook && !frontispieceVisible && !positionWritesSuspended && !readerLoadError && readerParagraphs.length > 0 && initialPositionResolved,
    request: {
      bookId: book.bookId || 'bible', editionKey: readerEditionKey,
      chapterNumber: book.chapterNumber, paragraphIndex: Math.max(0, placeRef.current.paragraphIndex),
      completed: finishedChapters.has(book.chapterNumber),
    },
    readToken: readSupabaseAccessToken,
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
      conversations: sharedReader && userBook ? ownCardController?.read() ?? [] : readLabBookChat(book.bookId || 'bible'),
    })
  }, [authUser?.id, book.bookId, book.chapters, finishedChapters, readPositionState, tocOpen, sharedReader, userBook, ownCardController])
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
  // Only pages before the last two are full: the last is short by nature, and
  // reserving the chapter actions can split it, leaving a short page before it
  // too. To the Lighthouse opened on The Window 2 (two paragraphs) measured
  // that 34-word page and read 2,029 pages instead of about 960.
  // Nor is the first: it carries the chapter's title. Constructor Theory's first chapter (its
  // abstract, three pages) measured its title page and set the book at 192 pages, then 177 a page
  // later (Anders, 16 Oct 2026).
  const fullPageWordCounts = readingPages
    .slice(1, Math.max(1, readingPages.length - 2))
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
  // Only a chapter of prose measures it (proseChapter): a printed contents or a list of dates
  // holds a few words a page.
  // A head-first map's pages after its first are stand-ins: words per page waits for the full map.
  const headFirstOnScreen = measuredPaging && nativeHeadContent === readerParagraphs && nativeMeasuredContent !== readerParagraphs
  const phoneMedian = fullPageWordCounts.length > 0 && proseChapter(book.paragraphs) && !headFirstOnScreen ? fullPageWordCounts[Math.floor(fullPageWordCounts.length / 2)] : 0
  const freshCapacity: { wordsPerPage: number; leafHeight: number } | null = desktopPaging && desktopLeafCapacity !== null
    ? desktopLeafCapacity
    : phoneMedian >= MIN_WORDS_PER_PAGE
      ? { wordsPerPage: phoneMedian, leafHeight: 0 }
      : null
  const held = wordsPerPageRef.current
  const capacityKey = `${readerLayoutKey}|${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : ''}`
  if (freshCapacity !== null && (held === null || held.leafHeight !== freshCapacity.leafHeight || (held.stored && !desktopPaging))) {
    // A figure kept from an earlier visit in this layout, once shown, stays for this visit: the
    // page count never moves under the reader. The new measurement is kept for the next visit.
    // (Constructor Theory read "2 / 266 of book", then "3 / 161" a chapter later: 16 Oct 2026.)
    if (!desktopPaging && storedCapacityRef.current !== `${capacityKey}=${freshCapacity.wordsPerPage}`) {
      storedCapacityRef.current = `${capacityKey}=${freshCapacity.wordsPerPage}`
      storeWordsPerPage(capacityKey, freshCapacity.wordsPerPage)
    }
    if (!held?.stored || desktopPaging) wordsPerPageRef.current = freshCapacity
  }
  if (wordsPerPageRef.current === null && freshCapacity === null && !desktopPaging) {
    const stored = readStoredWordsPerPage(capacityKey)
    if (stored !== null) wordsPerPageRef.current = { wordsPerPage: stored, leafHeight: 0, stored: true }
  }
  const phoneWordsPerPage = wordsPerPageRef.current?.wordsPerPage
    ?? freshCapacity?.wordsPerPage
    ?? null
  const measuredWordsPerPage = phoneWordsPerPage
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
    wordsPerPage: desktopPaging ? measuredWordsPerPage : phoneWordsPerPage,
    bookWordCount,
    heldTotalPages: null as number | null,
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
  // The book's page count on the phone, held from the first one shown in this layout: the pages
  // of the chapter in front of the reader are counted and the rest estimated, so a chapter change
  // would otherwise move it (Constructor Theory: "2 / 266 of book", then "3 / 161"; 16 Oct 2026).
  const progressTotalKey = !desktopPaging && progressInput.wordsPerPage != null && !book.chaptersProvisional && !initialResolving && !headFirstOnScreen && progressMeasured
    ? `${book.bookId}|${capacityKey}|${progressInput.wordsPerPage}|${bookWordCount ?? ''}|${book.chapters.length}`
    : null
  if (progressTotalKey !== null && progressTotalRef.current?.key !== progressTotalKey) {
    progressTotalRef.current = { key: progressTotalKey, total: labBookPageEstimate({ currentPage: chapterProgress.currentPage, totalPages: chapterProgress.totalPages, chapterNumber: book.chapterNumber, chapterWeights: book.chapters, wordsPerPage: progressInput.wordsPerPage as number, bookWordCount }).totalPages }
  }
  if (!desktopPaging && progressTotalRef.current && progressTotalRef.current.key.startsWith(`${book.bookId}|${capacityKey}|${progressInput.wordsPerPage}|`)) progressInput.heldTotalPages = progressTotalRef.current.total
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
  // Nor while a head-first map's rest is still being laid out: its page count is a stand-in.
  const footProgressLabel = initialResolving || (book.chaptersProvisional && book.paragraphs.length === 0)
    || headFirstOnScreen
    ? ''
    : showPhoneChrome
      ? phoneProgressLabel
      : desktopProgressLabel
  // Reading the original while Modern English is written: the folio names it, like the compare mark.
  const readingFootLabel = modern.originalNote && footProgressLabel ? `${MODERN_WAIT_COPY.originalLabel} · ${footProgressLabel}` : footProgressLabel

  useEffect(() => {
    if (!showHearing || listen.pending) return
    const follow = listen.follow
    if (continuousReader) {
      if (browseWhileListeningRef.current) return
      if (follow.kind === 'word') {
        const place = { paragraphIndex: follow.paragraphIndex, wordIndex: follow.wordIndex }
        placeRef.current = place
        // The mounted scroll surface follows spoken words itself. Re-anchor
        // only when narration leaves its bounded source window; otherwise
        // replacing the destination for every token repaints/recenters three
        // windows and can displace an exact saved location.
        const host = pageWrapRef.current?.querySelector('[data-testid="continuous-reader"]')
        if (!host?.querySelector(`[data-testid="lab-word"][data-paragraph-index="${place.paragraphIndex}"][data-word-index="${place.wordIndex}"]`))
          setContinuousAnchor(current => current.paragraphIndex === place.paragraphIndex && current.wordIndex === place.wordIndex ? current : place)
      } else if (follow.kind === 'paragraph') {
        const place = { paragraphIndex: follow.paragraphIndex, wordIndex: 0 }
        placeRef.current = place
        const host = pageWrapRef.current?.querySelector('[data-testid="continuous-reader"]')
        if (!host?.querySelector(`[data-testid="lab-word"][data-paragraph-index="${place.paragraphIndex}"]`))
          setContinuousAnchor(current => current.paragraphIndex === place.paragraphIndex ? current : place)
      }
      return
    }
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
        : (followOnReadingPage(follow, readingPages, readingPageIndex) || desktopSpread && !openingOnRight && followOnReadingPage(follow, readingPages, readingPageIndex + 1))
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
      // A paragraph-level follow names no word. When the open page already
      // begins inside that paragraph, its first word is the place: moving
      // the place back to the paragraph's start (on the leaf before) let the
      // next map adoption, e.g. when the transport opens, turn the reader
      // back a leaf on Play (check-audio-spread).
      placeRef.current = page && page.paragraphIndex === follow.paragraphIndex
        ? { paragraphIndex: follow.paragraphIndex, wordIndex: page.from }
        : { paragraphIndex: follow.paragraphIndex, wordIndex: 0 }
      const followAlreadyVisible = showPhoneChrome
        ? !!page && page.paragraphIndex === follow.paragraphIndex
        : (followOnReadingPage(follow, readingPages, readingPageIndex) || desktopSpread && !openingOnRight && followOnReadingPage(follow, readingPages, readingPageIndex + 1))
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
  }, [listen.follow, listen.pending, readingPages, readingPageIndex, showHearing, showPhoneChrome, desktopSpread, openingOnRight, listen.clipIndex, listen.currentTime, continuousReader])

  useEffect(() => {
    if (!showHearing || listen.pending || !listen.playing || browseWhileListeningRef.current) return
    const follow = listen.follow
    if (follow.kind !== 'word' && follow.kind !== 'paragraph') return
    if (!showPhoneChrome && (followOnReadingPage(follow, readingPages, readingPageIndexRef.current) || desktopSpread && !openingOnRight && followOnReadingPage(follow, readingPages, readingPageIndexRef.current + 1))) return
    const next = follow.kind === 'word'
      ? pageIndexForPlace(readingPages, follow.paragraphIndex, follow.wordIndex)
      : pageIndexForPlace(readingPages, follow.paragraphIndex, 0)
    if (next === readingPageIndexRef.current) return
    const page = readingPages[next]
    const anchor = pageAnchorOf(page)
    if (anchor) pageAnchorRef.current = anchor
    readingPageIndexRef.current = next
    setReadingPageIndex(next)
  }, [readingPages, showHearing, showPhoneChrome, desktopSpread, openingOnRight, listen.pending, listen.playing, listen.follow])

  useEffect(() => {
    if ((book.bookId || 'bible') !== 'bible' || !firstPageShown) return
    const editions = {
      primary: prefs.primaryEdition,
      compare: prefs.compareEdition,
      audio: audioEditionKey,
    }
    prefetchLabChapterTexts(book.chapterNumber, editions, 3)
  }, [book.bookId, book.chapterNumber, book.chapters, prefs.primaryEdition, prefs.compareEdition, audioEditionKey, firstPageShown])

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

  // Explain is fetched on speculation once a selection has settled under the
  // finger for a moment, so the opener is usually there before Explain is
  // tapped. The Worker meters it as explain_speculative, outside every
  // allowance (11 Oct 2026); a dismissed popup drops the fetch.
  const speculateExplanation = useCallback((text: string, paragraphIndex: number, comparison: boolean, context?: { chapterNumber?: number; chapterLabel?: string; paragraphs?: string[] }) => {
    if (text.trim().split(/\s+/).length < 2) return
    const editionKey = comparison ? prefs.compareEdition : prefs.primaryEdition
    void ask.explainSelection({ text, editionKey,
      editionLabel: editionLabelFor(editionKey, allBookEditions),
      paragraphs: context?.paragraphs ?? (comparison ? book.compareParagraphs : book.paragraphs),
      chapterNumber: context?.chapterNumber, chapterLabel: context?.chapterLabel,
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
    }, 700)
  }, [mobileCompareActive, phoneAskOpen, speculateExplanation])
  useEffect(() => () => { if (selectingTimerRef.current) window.clearTimeout(selectingTimerRef.current) }, [])
  useEffect(() => {
    // Desktop native selection never reports in progress; the popup opening is its settle.
    if (!selectionPopup || selectionPopup.existingHighlightId) return
    const editionKey = selectionPopup.editionKey || readerEditionKey
    const timer = window.setTimeout(() => speculateExplanation(selectionPopup.text, selectionPopup.paragraphIndex, editionKey === prefs.compareEdition && editionKey !== prefs.primaryEdition, selectionPopup), 500)
    return () => window.clearTimeout(timer)
  }, [selectionPopup, readerEditionKey, prefs.compareEdition, prefs.primaryEdition, speculateExplanation])

  const dismissSelectionPopup = useCallback(() => {
    // An explicit new selection may ask the same question again. Keep the
    // in-flight request object in its promise closures, but never reuse its
    // Notebook identity for a later popup.
    desktopCardRequestRef.current = null
    selectionPopupRef.current = null
    phoneAnswerRef.current = null
    setSharedCardSaveError(false)
    setSelectionPopup(null)
    setPopupMode('colors')
    setNoteInput('')
    define.setQuery('')
    ask.discardSpeculativeExplanation()
  }, [ask.discardSpeculativeExplanation, define])

  // Rendered inside the pill's tap (flushSync), so the editor's field takes
  // focus within the gesture and iOS raises the keyboard.
  openChapterNoteRef.current = (chapterNumber: number, pill: DOMRect) => {
    if (initialResolving) return
    dismissSelectionPopup()
    if (marginPhoneNoteRef.current(chapterNumber)) return
    flushSync(() => setChapterNoteEditor({ bookId: book.bookId || 'bible', chapterNumber, left: pill.left, top: pill.top, bottom: pill.bottom }))
  }
  useLayoutEffect(() => { setChapterNoteEditor(current => (current && current.bookId !== (book.bookId || 'bible') ? null : current)) }, [book.bookId])


  // A new passage/view invalidates a frozen card, including while edition data loads.
  useLayoutEffect(() => { setSelectionPopup(null) }, [book.bookId, book.chapterNumber, book.paragraphs, book.compareParagraphs, prefs.primaryEdition, prefs.compareEdition, mobileCompareActive, desktopCompareActive, initialResolving, phoneAskOpen, frontispieceVisible])
  // A new passage or view invalidates an open note, as it does a selection card.
  useLayoutEffect(() => { setOpenFootnote(null) }, [book.bookId, book.chapterNumber, readerParagraphs, readerEditionKey, desktopCompareActive, initialResolving, phoneAskOpen, frontispieceVisible])

  const handleSelectRange = useCallback((range: LabHighlightRange, clientX: number, clientY: number, side?: 'compare', intent?: 'lookup', highlightId?: string, context?: { chapterNumber: number; chapterLabel: string; paragraphs: string[] }) => {
    if (initialResolving || frontispieceVisible || phoneAskOpen) return
    const selectedChapter = context?.chapterNumber ?? book.chapterNumber
    const comparison = side === 'compare' || mobileCompareActive
    const editionKey = comparison ? prefs.compareEdition : prefs.primaryEdition
    const paragraphs = context?.paragraphs ?? (comparison ? book.compareParagraphs : book.paragraphs)
    const paragraph = paragraphs[range.paragraphIndex] || ''
    const offsets = range.endParagraphIndex === range.paragraphIndex ? wordSelectionOffsets(paragraph, range.fromWord, range.toWord) : null
    // Selection is temporary. Only an explicit Highlight or note action writes a mark.
    // A click carries the identity that painted the word/space/fragment.
    // Do not reinterpret a rendered mark as a new dictionary selection.
    const painted = intent === 'lookup' && highlightId
      ? (comparison ? highlightsApi.compareHighlights : highlightsApi.highlights).find(mark => mark.id === highlightId && mark.chapterNumber === selectedChapter)
      : undefined
    const existing = painted ?? highlightsApi.findRange(range, editionKey, selectedChapter)
      ?? (intent === 'lookup' ? highlightsApi.findContainingRange(range, editionKey, selectedChapter) : undefined)
    const character = offsets ? resolveCharacter(comparison ? compareCharacters : primaryCharacters, selectedChapter, range.paragraphIndex, ...offsets, paragraph, !!existing || highlightsApi.allHighlights.some(h => h.bookId === book.bookId && h.editionKey === editionKey && h.chapterNumber === selectedChapter && (h.paragraphIndex < range.paragraphIndex || h.paragraphIndex === range.paragraphIndex && h.fromWord < range.toWord) && (h.endParagraphIndex > range.paragraphIndex || h.endParagraphIndex === range.paragraphIndex && h.toWord > range.fromWord))) : null
    const highlight = existing
    // A click inside an existing highlight is about the thing the reader
    // marked, not the word under the cursor: Copy, Ask, Note and the note
    // editor all take the whole highlight, across paragraph boundaries.
    // Define stays word-scoped — a dictionary lookup of a whole sentence is
    // meaningless. A fresh drag has just expressed a different intent, so it
    // always keeps what was dragged even where it overlaps a highlight.
    const pickedOneWord = range.paragraphIndex === range.endParagraphIndex && range.toWord - range.fromWord <= 1
    // A shared name that no reviewed mention claims is named as shared, not guessed at.
    const namesakes = offsets && !character && !existing && pickedOneWord ? namesakesAt(comparison ? compareCharacters : primaryCharacters, selectedChapter, range.paragraphIndex, ...offsets, paragraph) : null
    const clickedWordText = pickedOneWord ? lookupWordAtPoint(range.text, range.paragraphIndex, range.fromWord, clientX, clientY, side === 'compare', Boolean(context)) : range.text
    const widerHighlight = highlight && (highlight.paragraphIndex !== range.paragraphIndex
      || highlight.endParagraphIndex !== range.endParagraphIndex
      || highlight.fromWord !== range.fromWord
      || highlight.toWord !== range.toWord)
    const subject = (intent === 'lookup' && highlight && widerHighlight
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
    if (mode === 'define') define.begin(clickedWordText)
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
    desktopCardRequestRef.current = null
    phoneAnswerRef.current = null
    setSharedCardSaveError(false)
    const nextSelection: NonNullable<typeof selectionPopup> = {
      x: Math.max(24, Math.min(window.innerWidth - 24, clientX)),
      y: shouldFloatAbove ? floatingY : showBelow ? anchorY + 12 : anchorY - 12,
      text: intent === 'lookup' ? highlight?.groupText || subject.text : subject.text,
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
      namesakes: namesakes ?? undefined,
      editionKey,
      side,
      range: subject,
      chapterNumber: selectedChapter,
      chapterLabel: context?.chapterLabel ?? book.chapterLabel,
      paragraphs,
      openedAt: Date.now(),
    }
    selectionPopupRef.current = nextSelection
    setSelectionPopup(nextSelection)
  }, [define, highlightsApi, primaryCharacters, compareCharacters, book, prefs.primaryEdition, prefs.compareEdition, mobileCompareActive, initialResolving, frontispieceVisible, phoneAskOpen])

  const selectAcrossChapters = (parts: ChapterSelectionPart[], x: number, y: number) => {
    if(parts.length<2)return
    const first=parts[0]
    handleSelectRange(first.range,x,y,undefined,undefined,undefined,first)
    setSelectionPopup(current=>current?{...current,chapterRanges:parts,text:parts.map(p=>p.range.text).join(' '),existingHighlightId:undefined,existingNote:undefined,character:undefined,namesakes:undefined,homeMode:'main'}:current)
    setPopupMode('main')
    setCrossSelecting(null)
  }
  const crossChapterRange = (chapter: number) => (crossSelecting ?? selectionPopup?.chapterRanges)?.find(part=>part.chapterNumber===chapter)?.range
  const selectionChapters: SelectionChapter[] = [
    ...(openingOnRight && carriedEndingCurrent ? [{chapterNumber:carriedEndingCurrent.chapterNumber,chapterLabel:carriedEndingCurrent.title,paragraphs:carriedEndingCurrent.paragraphs}]:[]),
    {chapterNumber:book.chapterNumber,chapterLabel:book.chapterLabel,paragraphs:readerParagraphs},
    ...(nextChapterOpening ? [{chapterNumber:nextChapterOpening.chapterNumber,chapterLabel:nextChapterOpening.title,paragraphs:nextChapterOpening.paragraphs}]:[]),
  ]

  useEffect(() => {
    if (!phoneAskOpen) setPhoneKeyboardOpen(false)
  }, [phoneAskOpen])

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
    cancelHeadFirstTurn()
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
  }, [cancelHeadFirstTurn, commitUnsettledNav, listen, mobileCompareActive, notePlace, primaryAnchorFor])

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
    // The compare page is anchored on the primary page's FIRST WORD, carried
    // to the same aligned paragraph — the persisted place is a separate thing
    // and is left exactly where it is.
    const compareHead = nextActive
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
    // one page. When it does not, pagination stays as it is. Nothing here
    // writes a place; the font is the reader's own.
    const mainTail = compareHead ? chapterPageTail(current[currentIndex]) : null
    const compareEnd = mainTail
      ? mapLabCompareEnd(readerParagraphs, targetParagraphs, { paragraphIndex: mainTail.paragraphIndex, wordIndex: mainTail.to })
      : null
    comparePassageRef.current = compareHead && compareEnd
      ? { paragraphs: targetParagraphs, start: compareHead, end: compareEnd, entryPlace: { ...sourceAnchor } }
      : null
    const nextPages = withComparePassage(naturalPages, targetParagraphs)
    // Find the natural page containing the mapped verse. Splitting at the
    // anchor creates a short leftover page without reflowing the chapter.
    swapCommittedRef.current = { paragraphs: targetParagraphs, pages: nextPages }
    const nextIndex = compareHead
      ? restorePageIndexForAnchor(nextPages, compareHead)
      : pageIndexForPlace(nextPages, mapped.paragraphIndex, mapped.wordIndex)
    setVersionPill(pill => ({
      label: nextActive ? compareEditionLabel : primaryEditionLabel,
      nonce: (pill?.nonce ?? 0) + 1,
    }))

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
  }, [book.compareParagraphs, book.paragraphs, compareEditionLabel, listen, mobileCompareActive, mobileCompareEnabled, notePlace, primaryEditionLabel, readerParagraphs, standbyKey, withComparePassage])

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
  // The reader's own toggles (the Show compare switch, the swipe, the bar,
  // the commands) are remembered for the book; a jump that leaves Compare is not.
  const toggleMobileCompareByReader = useCallback(() => {
    if (!mobileCompareEnabled) return
    rememberCompareView(!mobileCompareActive)
    handleMobileCompare()
  }, [handleMobileCompare, mobileCompareActive, mobileCompareEnabled, rememberCompareView])
  const toggleDesktopCompareByReader = useCallback(() => {
    if (!desktopCompareEnabled) return
    rememberCompareView(!desktopCompareActive)
    if (sharedReader) {
      const layout = !desktopCompareActive ? 'compare' : privateDesktopClassic ? 'two-page' : 'margin'
      storeDesktopReaderLayout(compareViewBookId, layout)
      const url = new URL(window.location.href)
      if (layout === 'margin') url.searchParams.delete('view')
      else url.searchParams.set('view', layout)
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    }
    handleDesktopCompare()
  }, [compareViewBookId, desktopCompareActive, desktopCompareEnabled, handleDesktopCompare, privateDesktopClassic, rememberCompareView, sharedReader])

  const browseToChapter = useCallback(async (number: number, landing: 'start' | 'end', continuation?: { paragraphIndex: number; wordIndex: number }) => {
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
    restoreWatchRef.current = null
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
        readingFirst: true,
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
    consumedOpeningRef.current = continuation
      ? { bookId: loaded.bookId || 'bible', editionKey: prefs.primaryEdition, chapterNumber: number, anchor: continuation }
      : null
    if (continuation) {
      restorePlaceRef.current = restoreTargetIn(continuation, labRestoreChapterKey(loaded.bookId, loaded.chapterNumber))
      pageAnchorRef.current = continuation
      placeRef.current = continuation
      // This page turn has already consumed the opening on the right leaf.
      // Persist the actual next word now; hiding the tab only flushes activity.
      notePlace('page-turn', { sequentialChapter: number, ...continuation })
    }
    setBook(loaded)
    setOpenAtEnd(landing === 'end')
  }, [book.bookId, bookEditions, listen.playing, notePlace, prefs.compareEdition, prefs.compareOpen, prefs.primaryEdition, audioEditionKey])

  const goToChapter = useCallback(async (number: number, landing: 'start' | 'end', preserveAudioSession = false, continuation?: { paragraphIndex: number; wordIndex: number }) => {
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
    restoreWatchRef.current = null
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
        readingFirst: true,
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
      !preserveAudioSession && landing === 'start' && loaded.bookTitle === LAB_COPY.bookTitle
        ? bibleBookOpeningTitle(loaded.chapters, number)
        : null,
    )
    setListenSource({
      bookId: loaded.bookId || 'bible',
      chapterNumber: loaded.chapterNumber,
      paragraphs: loaded.paragraphs,
      followParagraphs: loaded.followParagraphs,
      audioTitle: loaded.audioTitle,
      chapters: loaded.chapters,
    })
    consumedOpeningRef.current = continuation
      ? { bookId: loaded.bookId || 'bible', editionKey: prefs.primaryEdition, chapterNumber: number, anchor: continuation }
      : null
    if (continuation) {
      restorePlaceRef.current = restoreTargetIn(continuation, labRestoreChapterKey(loaded.bookId, loaded.chapterNumber))
      pageAnchorRef.current = continuation
      placeRef.current = continuation
      // This page turn has already consumed the opening on the right leaf.
      // Persist the actual next word now; hiding the tab only flushes activity.
      notePlace('page-turn', { sequentialChapter: number, ...continuation })
    }
    setBook(loaded)
    setOpenAtEnd(landing === 'end')
  }, [book.bookId, bookEditions, listen, notePlace, prefs.compareEdition, prefs.compareOpen, prefs.primaryEdition, audioEditionKey])

  nextChapterAudioRef.current = () => {
    // Only where the chapter-complete handler below continues: the chapter
    // heard is the chapter shown, warmed narration, never an own book.
    if (privateBook || !narrationOption || !narrationVoice) return null
    if (listenSource.bookId !== (book.bookId || 'bible') || listenSource.chapterNumber !== book.chapterNumber) return null
    const next = nextLabChapter(book.chapters, book.chapterNumber)
    if (next == null) return null
    const scope = { ...narrationContextRef.current, chapter: next }
    const results = [
      ...readNarrationReplay(scope),
      ...(warmedNarrationRef.current.get(warmedNarrationKey(scope.bookId, scope.editionKey, next, scope.voice)) ?? []),
    ]
    const urls = narrationBridgeUrls(results)
    return urls.length > 0 ? { chapterNumber: next, urls } : null
  }

  audioChapterCompleteRef.current = () => {
    const next = nextLabChapter(book.chapters, book.chapterNumber)
    // Hearing a chapter out is finishing it, same as turning past the last
    // page — on the book's final chapter too, where there is nothing to open.
    if (!temporaryHold) markChapterFinished(book.chapterNumber)
    if (next == null) return false
    if (nextChapterOpening?.chapterNumber === next && readingPage) {
      const endedChapter = book.chapterNumber
      setCarriedEnding({
        bookId: book.bookId || 'bible', editionKey: readerEditionKey, targetChapter: next,
        layoutKey: `${readerLayoutKey}:${fullscreen}`, width: window.innerWidth, height: window.innerHeight,
        title: book.chapterTitle, chapterNumber: book.chapterNumber, paragraphs: readerParagraphs, page: readingPage,
        previousAnchor: readingPageIndex > 0 ? pageAnchorOf(readingPages[Math.max(0, readingPageIndex - 2)]) : null,
        folio: bookPageEstimate.page, onPrimer: privateBook ? undefined : () => openChapterNotes('primer', endedChapter),
        chapterEnd: <LabChapterEnd chapterTitle={book.chapterTitle} docked={desktopEndInFooter} hasNext recap={!privateBook}
          onContinue={() => goNextRef.current()} busy={false} onDiscuss={privateBook ? undefined : () => openChapterNotes('end', endedChapter)}
          onNote={pill => openChapterNoteRef.current(endedChapter, pill)} />,
      })
    } else setCarriedEnding(null)
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
    if (continuousReader) setContinuousAnchor(placeRef.current)
    notePlace('page-turn', { paragraphIndex: next, wordIndex: 0 })
    if (opts?.seekAudio && listen.src) listen.seekToPlace(next, 0)
  }, [book.paragraphs.length, continuousReader, listen, notePlace, readingPages])

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
    // "Restart the chapter" asks to hear it from the top: it plays after the
    // confirmation whatever the audio was doing when the companion opened.
    const outcome: LabPlaybackNavigationOutcome = {
      resumePlayback: kind === 'restart_chapter' || shouldResumePlaybackAfterNavigation({ sessionStartedFromPlayback: pausedForAskRef.current }),
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
        if (!temporaryHold) markChapterFinished(book.chapterNumber)
      }
      await goToChapter(resolved.chapterNumber, resolved.landing)
      return outcome
    }
    goToParagraph(resolved.paragraphIndex, { seekAudio: outcome.resumePlayback })
    return outcome
  }, [book.chapterNumber, book.chapters, book.paragraphs.length, goToChapter, goToParagraph, markChapterFinished, temporaryHold])
  skipRef.current = applyPlaybackSkip

  const quietDesktopAfterTurn = useCallback(() => {
    // A page turn while audio is paused puts the transport away on every
    // chrome; while audio plays it stays up wherever the reader goes.
    if (!listen.playing) { setPausedTransportVisible(false); setSpeedPopoverOpen(false) }
    if (!desktopPaging) return
    setReaderControlsVisible(false)
  }, [desktopPaging, listen.playing])

  const goNext = useCallback(() => {
    // A page still being written in Modern English is covered: the reader waits there, never turning on into text they cannot see.
    if (modernBlocksNextRef.current) return
    if (continuousReader && !chapterCoverTitle) {
      const next = nextLabChapter(book.chapters, book.chapterNumber)
      if (!temporaryHold) markChapterFinished(book.chapterNumber)
      if (next != null) void goToChapter(next, 'start')
      return
    }
    // Briefly prefer the full measured map, then use the existing provisional
    // map (which covers every source word). A queued tap also needs this timer.
    if (headFirstPending(nativeHeadOnlyRef.current)) {
      headFirstTurnRef.current = true
      if (headFirstTurnTimerRef.current === null) {
        headFirstTurnTimerRef.current = window.setTimeout(() => {
          headFirstTurnTimerRef.current = null
          if (!headFirstTurnRef.current) return
          headFirstTurnRef.current = false
          goNextRef.current()
        }, Math.max(0, LAB_HEAD_FIRST_HOLD_MS - (performance.now() - nativeHeadOnlyRef.current)))
      }
      return
    }
    quietDesktopAfterTurn()
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
    const nextPage = desktopSpread ? (index + (openingOnRight ? 1 : 2) < pages.length ? index + (openingOnRight ? 1 : 2) : null) : adjacentPageIndex(pages.length, index, 1)
    if (nextPage != null) {
      trackFunnelOnce('first_page_turn', { book_id: book.bookId || 'bible' }, book.bookId || 'bible')
      goToPage(nextPage)
      return
    }
    trackFunnelOnce('first_page_turn', { book_id: book.bookId || 'bible' }, book.bookId || 'bible')
    const next = nextLabChapter(book.chapters, book.chapterNumber)
    // Turning past the last page finishes the chapter — on the book's final
    // chapter too, so the library can show the book as finished without
    // depending on a reading-memory session that may since have been pruned.
    if (!temporaryHold) markChapterFinished(book.chapterNumber)
    if (next != null) {
      // Only consume text actually painted on the outgoing right leaf.
      // The target is a source-word anchor, never a guessed page offset.
      const opening = desktopSpread && nextChapterOpening ? nextOpeningPage : null
      const continuation = opening?.continuation ?? undefined
      const afterOpening = opening && !continuation ? nextLabChapter(book.chapters, next) : null
      if (afterOpening != null && !temporaryHold) markChapterFinished(next)
      const target = afterOpening ?? next
      enteredForwardRef.current = target
      if (listen.playing) void browseToChapter(target, 'start', continuation)
      else void goToChapter(target, 'start', false, continuation)
    }
  }, [book.chapterNumber, book.chapters, book.paragraphs.length, browseToChapter, chapterCoverTitle, goToChapter, goToPage, listen.playing, markChapterFinished, temporaryHold, desktopSpread, quietDesktopAfterTurn, nextChapterOpening, nextOpeningPage, openingOnRight, continuousReader])

  goNextRef.current = goNext

  const goPrev = useCallback(() => {
    cancelHeadFirstTurn()
    quietDesktopAfterTurn()
    if (continuousReader && !chapterCoverTitle) {
      const previous = prevLabChapter(book.chapters, book.chapterNumber)
      if (previous != null) void goToChapter(previous, 'end')
      return
    }
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
    // Only the Bible has opening pages (one per biblical book). Other books
    // have no cover in the reader: their introduction lives in the library.
    const openingTitle = book.bookTitle === LAB_COPY.bookTitle
      ? bibleBookOpeningTitle(book.chapters, book.chapterNumber)
      : null
    if (index === 0 && openingTitle && !listen.playing) {
      setChapterCoverTitle(openingTitle)
      return
    }
    const consumed = consumedOpeningRef.current
    const firstAfterOpening = desktopSpread && consumed?.bookId === (book.bookId || 'bible')
      && consumed.editionKey === readerEditionKey && consumed.chapterNumber === book.chapterNumber
      ? pageIndexForPlace(pages, consumed.anchor.paragraphIndex, consumed.anchor.wordIndex) : 0
    const prevPage = desktopSpread ? (index > firstAfterOpening ? Math.max(firstAfterOpening, index - 2) : null) : adjacentPageIndex(pages.length, index, -1)
    if (prevPage != null) {
      goToPage(prevPage)
      return
    }
    if (openingOnRight && carriedEndingCurrent) {
      const {chapterNumber, previousAnchor} = carriedEndingCurrent
      const target = previousAnchor ? chapterNumber : prevLabChapter(book.chapters, chapterNumber)
      if (target != null) {
        const move = listen.playing
          ? browseToChapter(target, previousAnchor ? 'start' : 'end', previousAnchor ?? undefined)
          : goToChapter(target, previousAnchor ? 'start' : 'end', false, previousAnchor ?? undefined)
        // This is a backward landing, not an opening consumed on the next leaf.
        void move.then(() => { consumedOpeningRef.current = null })
      }
      return
    }
    const prev = prevLabChapter(book.chapters, book.chapterNumber)
    if (prev != null) {
      if (listen.playing) void browseToChapter(prev, 'end')
      else void goToChapter(prev, 'end')
    }
  }, [book.bookId, book.chapterNumber, book.chapters, readerEditionKey, browseToChapter, chapterCoverTitle, goToChapter, goToPage, listen.playing, desktopSpread, quietDesktopAfterTurn, openingOnRight, carriedEndingCurrent, continuousReader, cancelHeadFirstTurn])

  // Keyboard page turns, matching the classic Reader: ArrowRight / PageDown /
  // Space turn forward, ArrowLeft / PageUp turn back. Typing surfaces and open
  // overlays keep their keys; the chapter cover handles its own arrows and
  // marks the event handled, so it never double-turns here.
  const keyboardPageTurnsBlocked = (Boolean(temporaryHold) && !holdRecovery) || tocOpen || phoneAskOpen || inTheBookOpen || speedPopoverOpen || selectionPopup != null || chapterNoteEditor != null
  useLayoutEffect(() => {
    if (continuousReader || keyboardPageTurnsBlocked || desktopAskOpen || callOpen || bookSwitcherOpen || superMenuOpen || superSheet !== null || accountPrompt !== null) cancelHeadFirstTurn()
  }, [continuousReader, keyboardPageTurnsBlocked, desktopAskOpen, callOpen, bookSwitcherOpen, superMenuOpen, superSheet, accountPrompt, cancelHeadFirstTurn])
  useEffect(() => {
    if (continuousReader) return
    if (keyboardPageTurnsBlocked || desktopAskOpen || callOpen || bookSwitcherOpen || superMenuOpen || superSheet !== null || accountPrompt !== null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || document.documentElement.dataset.tinctCommandsOpen === 'true') return
      const direction = labKeyboardPageDirection(event.key)
      if (direction == null) return
      const target = event.target as HTMLElement | null
      if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.closest('[role=slider]') || target.isContentEditable)) return
      // Space activates a focused control. Arrow/Page keys still turn the
      // reader after a transport button was clicked, matching existing use.
      if (event.key === ' ' && target instanceof HTMLElement && target.closest('button,a,summary,[role=button]')) return
      event.preventDefault()
      if (direction > 0) goNext()
      else goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, keyboardPageTurnsBlocked, desktopAskOpen, callOpen, bookSwitcherOpen, superMenuOpen, superSheet, accountPrompt])

  const audioAccountRequiredRef = useRef(false)
  // An own book read aloud needs Premium (trial included): the account sheet, with its Premium offer, says the rest.
  const ownNarrationPremiumRequired = listen.narration.status === 'error' && listen.narration.reason === 'own_book_premium'
  useEffect(() => {
    if (!ownNarrationPremiumRequired) return
    listen.dismissNarration()
    listen.pause()
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    setChrome('reading')
    setReturnTo('reading')
    setSuperSheet('account')
  }, [ownNarrationPremiumRequired, listen.dismissNarration, listen.pause])
  const narrationAccountRequired = listen.narration.status === 'error' && listen.narration.reason === 'unauthenticated'
  useEffect(() => {
    if (!narrationAccountRequired) return
    // Signed-out readers cannot listen. Stop the request, leave the listening
    // chrome (its transport bar would replay the previous audio) and remember
    // it, so the next Play asks again instead of starting anything.
    audioAccountRequiredRef.current = true
    listen.dismissNarration()
    listen.pause()
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    setChrome('reading')
    setReturnTo('reading')
    setPeekBook(false)
    setAccountPrompt({ action: 'audio' })
  }, [narrationAccountRequired, listen.dismissNarration, listen.pause])
  useEffect(() => { if (signedIn) audioAccountRequiredRef.current = false }, [signedIn])

  const startHearing = useCallback((opts?: { force?: boolean }) => {
    if (temporaryHold || narrationInfo?.loading) return
    // An edition with no audio at all (To the Lighthouse in Danish) says so,
    // rather than asking a signed-out reader to sign in for audio.
    if (audioUnavailable && !narrationOption && !retainedBella && !prefs.primaryEdition.endsWith('-en') && !listen.isPending()) { setAudioUnavailableNotice(true); return }
    if (audioAccountRequiredRef.current && !signedIn) { setAccountPrompt({ action: 'audio' }); return }
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
    if (chrome === 'hearing' && !opts?.force && listen.playing) {
      listen.pause()
      if (continuousReader) {
        const follow = listeningHere ? listen.follow : { kind: 'none' as const }
        const place = browseWhileListeningRef.current ? continuousVisibleRef.current
          : follow.kind === 'word' ? { paragraphIndex: follow.paragraphIndex, wordIndex: follow.wordIndex }
          : follow.kind === 'paragraph' ? { paragraphIndex: follow.paragraphIndex, wordIndex: 0 }
          : continuousVisibleRef.current
        placeRef.current = place
        setContinuousAnchor(place)
        browseWhileListeningRef.current = false
        setBrowseWhileListening(false)
        setChrome('reading')
        setReturnTo('reading')
        setPeekBook(false)
        notePlace('pause', place)
        return
      }
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
    // Paused with the transport still up on this chapter (a page turn puts it
    // away): Play resumes the listening place — the word last heard, or the
    // word the reader tapped since — from the start of its sentence.
    const resumePlace = listeningHere && pausedTransportVisible ? resumeListeningPlace() : null
    const place = continuousReader ? (resumePlace ?? continuousVisibleRef.current) : resumePlace ?? visiblePlace ?? (page
      ? { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
      : placeRef.current)
    // Otherwise Reader Play starts the visible page. A saved audio cursor can
    // belong to an earlier page (or a later word on this page), so never resume it here.
    pausedJumpRef.current = null
    placeRef.current = place
    if (continuousReader) setContinuousAnchor(place)
    else {
      if (resumePlace) setReadingPageIndex(pageIndexForPlace(readingPages, resumePlace.paragraphIndex, resumePlace.wordIndex))
      pageAnchorRef.current = pageAnchorOf(page)
    }
    flushSync(() => setListenSource({
      bookId: book.bookId || 'bible',
      chapterNumber: book.chapterNumber,
      paragraphs: book.paragraphs,
      followParagraphs: book.followParagraphs,
      audioTitle: book.audioTitle,
      chapters: book.chapters,
    }))
    browseWhileListeningRef.current = false
    setBrowseWhileListening(false)
    setReturnTo('hearing')
    setChrome('hearing')
    setPeekBook(false)
    setInTheBookOpen(false)
    notePlace('play')
    void listen.startAtPlace(place)
  }, [temporaryHold, signedIn, audioUnavailable, narrationOption, narrationInfo, prefs.primaryEdition, retainedBella, book, chrome, listen, listenSource.bookId, listenSource.chapterNumber, measuredPaging, notePlace, pausedTransportVisible, readingPageIndex, readingPages, resumeListeningPlace, showPhoneChrome, continuousReader])

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

  // Vocabulary hints are read when a clip is sent, so they follow the open
  // chapter. A reader's own file sends none: its names stay on the device.
  const dictationBookRef = useRef(book)
  dictationBookRef.current = book
  const dictation = useLabDictation(book.bookId || 'bible', setDraft, {
    signedIn,
    getAuthToken: () => authToken ?? readSupabaseAccessToken(),
    getKeyterms: () => {
      const current = dictationBookRef.current
      return privateBook ? [] : buildDictationKeyterms({
        bookId: current.bookId || 'bible',
        chapters: current.chapters,
        paragraphs: current.paragraphs,
        cast: current.cast,
        chapterTitle: current.chapterTitle,
      })
    },
    language: allBookEditions.find(edition => edition.key === prefs.primaryEdition)?.language || 'en',
  })

  const handleMic = useCallback(() => {
    dictation.toggle(draft)
  }, [dictation, draft])

  const openPhoneAsk = useCallback(() => {
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
    restorePlaceRef.current = restoreTargetIn(place, labRestoreChapterKey(book.bookId, restore.chapterNumber))
    restorePageRef.current = restore.pageIndex
    placeRef.current = place
    void pending
  }, [book.bookId, book.chapterNumber, goToChapter, notePlace])

  const startCallVoice = useCallback(() => {
    void ask.startVoice().then((started) => {
      // A cancelled older attempt must not close Reconnect or a newer call.
      // A start the account policy or the microphone refused leaves nothing to
      // show a call for; the notice already says why.
      if (started === false) setCallOpen(false)
    })
  }, [ask])

  const handleTalk = useCallback(() => {
    // A reader's own book too (2026-10-08): the session hears the passage on
    // screen and the recent conversation, never the chapter (useLabAsk).
    dictation.stop()
    setTocOpen(false)
    // Talk is an explicit audio start: it keeps unlocking narration on every device.
    interruptHearForAsk({ alwaysUnlock: true })
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
  }, [captureCallAnchor, dictation.stop, focusParagraph, interruptHearForAsk, startCallVoice])

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

  // A guest's two-minute Talk trial ran out: the call closes (its place given
  // back) and the account sheet opens; closing the sheet returns to reading
  // the way a held-back Talk does (closeAccountPrompt).
  talkTrialEndedRef.current = () => {
    setCallOpen(false)
    setCallMinimized(false)
    ask.setMicMuted(false)
    restoreCallAnchor()
    setAccountPrompt({ action: 'voice' })
  }

  const reconnectCall = useCallback(() => {
    ask.stopVoice()
    setCallAwaitingConnection(true)
    startCallVoice()
  }, [ask, startCallVoice])

  const toggleCallMute = useCallback(() => {
    ask.setMicMuted(!ask.micMuted)
  }, [ask])

  const handleChat = useCallback(() => {
    setContentsConversation(null)
    setTocOpen(false)
    if (!showPhoneChrome) {
      if (desktopAskOpen && chrome !== 'talking') {
        // A minimized chat is restored, not replaced.
        if (desktopChatMinimized) { setDesktopChatMinimized(false); return }
        resumeListenAfterAsk()
        return
      }
      if (callOpen) {
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
  }, [ask, callOpen, chrome, desktopAskOpen, desktopChatMinimized, interruptHearForAsk, openPhoneAsk, restoreCallAnchor, resumeListenAfterAsk, showPhoneChrome])

  /** The chat, open (never toggled shut), for a figure the reader asks about. */
  const openChatForFigure = useCallback(() => {
    setFigureCard(null)
    setContentsConversation(null)
    setTocOpen(false)
    if (!showPhoneChrome) {
      interruptHearForAsk()
      setDesktopAskOpen(true)
      if (ask.voiceActive) ask.stopVoice()
      return
    }
    openPhoneAsk()
  }, [ask, interruptHearForAsk, openPhoneAsk, showPhoneChrome])
  const explainFigure = useCallback((figure: LabFigure) => {
    openChatForFigure()
    void ask.sendTyped('Explain this figure.', undefined, undefined, {
      highlightedText: figureReadingText(figure),
      image: () => figureImageBlock(figure),
    })
  }, [ask, openChatForFigure])
  const askAboutFigure = useCallback((figure: LabFigure) => {
    openChatForFigure()
    setAskAttachment({ bookId: book.bookId || 'bible', text: figureReadingText(figure), figure })
    setDraft('')
  }, [book.bookId, openChatForFigure])

  const [notebookReturn, setNotebookReturn] = useState<(ContentsPlace & { bookId: string; editionKey: string }) | null>(null)
  useEffect(() => { setNotebookReturn(null) }, [book.bookId, prefs.primaryEdition])
  const rememberNotebookOrigin = () => setNotebookReturn(current => current ?? {
    bookId: book.bookId || 'bible', editionKey: prefs.primaryEdition,
    chapterNumber: book.chapterNumber, ...placeRef.current,
  })
  const openContentsPassage = useCallback((place: ContentsPlace, chat?: ChatConversation, chapterOnly = false, flash?: PhoneCardRange['range']) => {
    const bookId = book.bookId || 'bible'
    if (!book.chapters.some(ch => ch.number === place.chapterNumber) || (chat && chat.bookId !== bookId)) return
    const chapter = book.chapters.find(ch => ch.number === place.chapterNumber)!
    const remembered = chapterOnly ? recentChapterPlace(readPositionState(), bookId, chapter, prefs.primaryEdition) : null
    if (place.chapterNumber !== book.chapterNumber && readToEndRef.current === book.chapterNumber && !temporaryHold) markChapterFinished(book.chapterNumber)
    setTocOpen(false)
    setPhoneAskOpen(false)
    setDesktopAskOpen(false)
    setContentsConversation(chat || null)
    if (chat) interruptHearForAsk()
    if (mobileCompareActive) handleMobileCompare()
    setContentsTarget({ ...place, bookId, navigation: chapterNavigationRef.current + (place.chapterNumber !== book.chapterNumber ? 1 : 0), chapterOnly, chat, flash })
    if (place.chapterNumber !== book.chapterNumber) {
      if (listen.playing && !chat) void browseToChapter(place.chapterNumber, 'start')
      else {
        void goToChapter(place.chapterNumber, 'start')
        // Continuing a conversation pauses playback through its source move.
        if (chat) { keepPlayingChapterRef.current = null; setAudioChapterTransitioning(false) }
      }
    }
    setRecentChapterReturn(remembered ? { ...remembered, libraryBookId: bookId } : null)
  }, [book.bookId, book.chapterNumber, book.chapters, browseToChapter, goToChapter, handleMobileCompare, interruptHearForAsk, listen.playing, markChapterFinished, mobileCompareActive, readPositionState, prefs.primaryEdition, temporaryHold])

  useEffect(() => {
    if (!contentsTarget || tocOpen || initialResolving) return
    if (contentsTarget.navigation !== chapterNavigationRef.current || contentsTarget.bookId !== (book.bookId || 'bible')) { setContentsTarget(null); return }
    if (contentsTarget.chapterNumber !== book.chapterNumber || mobileCompareActive) return
    if (chapterCoverTitle && !contentsTarget.chapterOnly) { setChapterCoverTitle(null); return }
    if (!continuousReader && !chapterCoverTitle && !pagesStableRef.current) return
    const paragraphIndex = Math.max(0, Math.min(book.paragraphs.length - 1, contentsTarget.paragraphIndex))
    const wordIndex = Math.max(0, Math.min(Math.max(0, (book.paragraphs[paragraphIndex] || '').split(/\s+/).length - 1), contentsTarget.wordIndex))
    const place = { paragraphIndex, wordIndex }
    const pageIndex = contentsTarget.chapterOnly ? 0 : pageIndexForPlace(readingPages, paragraphIndex, wordIndex)
    placeRef.current = place
    if (continuousReader) setContinuousAnchor(place)
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
    if (contentsTarget.flash) setNotebookFlash({ chapterNumber: contentsTarget.chapterNumber, range: contentsTarget.flash })
    setContentsTarget(null)
  }, [book.bookId, book.chapterNumber, book.paragraphs, chapterCoverTitle, contentsTarget, initialResolving, mobileCompareActive, nativePagesRevision, notePlace, readingPages, settleIndex, showPhoneChrome, tocOpen, continuousReader])

  const [notebookFlash, setNotebookFlash] = useState<{ chapterNumber: number; range: PhoneCardRange['range'] } | null>(null)
  useEffect(() => {
    if (!notebookFlash || notebookFlash.chapterNumber !== book.chapterNumber) return
    const clear = flashNotebookPassage(document.querySelector('[data-testid="lab-root"]'), notebookFlash, book.chapterNumber)
    const timer = window.setTimeout(() => setNotebookFlash(null), 1800)
    return () => { window.clearTimeout(timer); clear() }
  }, [notebookFlash, book.chapterNumber, book.bookId])

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
    if (phoneAskOpen || chrome === 'talking') {
      resumeListenAfterAsk()
      return
    }
    if (mobileCompareActive) {
      toggleMobileCompareByReader()
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
      startHearing({ force: true })
      return
    }
    startHearing()
  }, [chrome, listen, mobileCompareActive, phoneAskOpen, resumeListenAfterAsk, startHearing, toggleMobileCompareByReader])

  // ── Chrome V2 ────────────────────────────────────────────────────────
  const accountId = authUser?.id ?? null

  const openSuperMenu = useCallback(() => {
    setTocOpen(false)
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
    && (continuousReader || !measuredPaging || nativeMeasuredContent === readerParagraphs || nativeHeadContent === readerParagraphs)
    && (!desktopPaging || desktopMeasuredKey === desktopLayoutKey)
  // The account's place, once its chapter is on screen and settled: landed,
  // the watch ends; on another page (a stale map, a reflow), restore it again.
  // The reader acting first ends the watch: their page is the place.
  useEffect(() => {
    if (continuousReader) return
    const watch = restoreWatchRef.current
    if (!watch) return
    if (interactionCountRef.current > watch.interactions) { restoreWatchRef.current = null; return }
    if (!readerReady) return
    const view = restoreViewNow()
    if (restoreLanded(watch, view)) { restoreWatchRef.current = null; return }
    const index = restoreRetryIndex(watch, view, interactionCountRef.current)
    if (index === null) return
    watch.retries += 1
    const place = { paragraphIndex: watch.paragraphIndex, wordIndex: watch.wordIndex }
    pageAnchorRef.current = place
    placeRef.current = place
    readingPageIndexRef.current = index
    setReadingPageIndex(index)
  })
  // The first page fades in once, in the render that makes it visible.
  const [firstRevealDone, setFirstRevealDone] = useState(false)
  const firstReveal = readerReady && !firstRevealDone
  useEffect(() => {
    if (!readerReady) return
    firstPageShownRef.current = true
    setFirstPageShown(true)
    const timer = window.setTimeout(() => setFirstRevealDone(true), LAB_FIRST_REVEAL_MS)
    return () => window.clearTimeout(timer)
  }, [readerReady])
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
    if (!readerLaidOut) return
    if (superFirstViewRef.current) return
    const timer = window.setTimeout(() => {
      if (superFirstViewRef.current || listenPlayingRef.current) return
      superFirstViewRef.current = true
      setSuperFirstView(true)
    }, LAB_SUPER_FIRST_VIEW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [readerLaidOut])

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
    setDraft('')
    setAskAttachment(null)
    if (callOpen) endCall()
    else resumeListenAfterAsk()
  }, [callOpen, endCall, resumeListenAfterAsk])

  // Escape closes the Chat panel like every other sheet, on the phone as well
  // as the desktop — a phone with a hardware or Bluetooth keyboard is a real
  // reader, so this is not gated on pointer type. A menu, a settings sheet,
  // the contents, a card, a prompt or a call already answer Escape for
  // themselves and are left to it: while one of them is in front, this stays
  // out of the way and the layer on top closes first. The composer's own
  // unsent draft is discarded when the discussion surface is left.
  const chatPanelEscapes = chrome !== 'talking'
    && (showPhoneChrome ? phoneAskOpen : desktopAskOpen)
    && !superMenuOpen && superSheet === null && !tocOpen && !inTheBookOpen && !callOpen && selectionPopup == null
    && !speedPopoverOpen && accountPrompt == null
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

  const handleAsk = useCallback((value: string) => {
    if (isResumeListenCommand(value)) {
      setDraft('')
      resumeListenAfterAsk()
      return
    }
    interruptHearForAsk()
    setDesktopAskOpen(true)
    const attachment = askAttachment?.bookId === book.bookId ? askAttachment : null
    const figure = attachment?.figure
    void ask.sendTyped(value, undefined, undefined, {
      highlightedText: attachment?.text, sourceLocation: attachment?.sourceLocation,
      ...(figure ? { image: () => figureImageBlock(figure) } : {}),
      onAccepted: () => {
        setDraft('')
        setAskAttachment(null)
      },
    })
  }, [ask, askAttachment, book.bookId, interruptHearForAsk, resumeListenAfterAsk])

  const handleChapterChat = useCallback((kind: 'discuss' | 'prepare' | 'preview') => {
    if (ask.typedLoading || initialResolving || book.chaptersProvisional) return
    if (privateBook) {
      // A user book's chapter actions are ordinary questions about the
      // chapter on screen: its text goes with them, nothing is looked up.
      dictation.stop()
      interruptHearForAsk()
      setDesktopAskOpen(true)
      if (showPhoneChrome) setPhoneAskOpen(true)
      void ask.askAboutChapter(CHAPTER_CHAT_MESSAGES[kind])
      return
    }
    // Capture one coherent tuple before opening Chat or awaiting a chapter fetch.
    const request = createChapterChatRequest(kind, {
      bookId: book.bookId || 'bible', bookTitle: book.bookTitle, bookAuthor: book.bookAuthor,
      ...withAuthorship(authorshipOf?.(book.chapterNumber)),
      editionKey: readerEditionKey, editionLabel: editionLabelFor(readerEditionKey, allBookEditions),
      chapterNumber: book.chapterNumber, chapterLabel: book.chapterLabel,
      paragraphs: readerParagraphs, paragraphIndex: placeRef.current.paragraphIndex,
      chapterCount: book.chapters.length,
    }, book.chapters)
    if (!request) return
    if (kind === 'discuss') request.activity = {
      questions: ask.turns.filter(turn => turn.role === 'user' && turn.chapterNumber === book.chapterNumber && (!turn.bookId || turn.bookId === book.bookId) && !turn.chapterAction).map(turn => turn.content).slice(-3),
      highlights: recapHighlightPassages(highlightsApi.allHighlights, { bookId: book.bookId, chapterNumber: book.chapterNumber, editionKey: readerEditionKey, paragraphs: readerParagraphs }),
    }
    dictation.stop()
    interruptHearForAsk()
    setDesktopAskOpen(true)
    if (showPhoneChrome) setPhoneAskOpen(true)
    void ask.sendTyped(CHAPTER_CHAT_MESSAGES[kind], request)
  }, [ask, initialResolving, book, readerParagraphs, readerEditionKey, bookEditions, dictation, interruptHearForAsk, showPhoneChrome, highlightsApi.allHighlights, privateBook])

  const openChapterNotes = useCallback((kind: ChapterNotesKind, chapterNumber = book.chapterNumber, from: 'pill' | 'menu' = 'menu') => {
    if (initialResolving || book.chaptersProvisional) return
    const chapter = book.chapters.find(item => item.number === chapterNumber)
    // A reader's own book: Primer and Recap are made from this device's text of the chapter (userBook/ownChapterNotes.ts),
    // as the margin reader's own-book pills are; Tinct's chapter notes are made and cached on the server from its own
    // editions. The pills only: Summarize in the t menu stays a recap in the chat (One Tinct, 22 Oct 2026).
    const ownParagraphs = privateBook && chapterNumber === book.chapterNumber ? book.paragraphs : null
    if (privateBook && (kind === 'sofar' || (kind === 'end' && from !== 'pill') || !ownParagraphs?.length)) {
      setSuperMenuOpen(false)
      if (kind !== 'primer' && chapterNumber === book.chapterNumber) handleChapterChat('discuss')
      return
    }
    const label = (chapter?.title || `Chapter ${chapterNumber}`).split(/\s+[—–:]\s+/)[0]
    // The sheets carry the names the page uses for them: the heading's ✧ Primer, the chapter end's ✧ Recap (Anders, 10 Oct 2026).
    const title = kind === 'primer' ? `Primer · ${label}` : kind === 'end' ? `Recap · ${label}` : `Recap · ${label} so far`
    dictation.stop()
    setSuperMenuOpen(false)
    setChapterNotes({
      ...(continuousReader ? {railAnchor: from === 'pill' ? marginChapterBoundary(readerParagraphs, kind === 'end') ?? undefined : {paragraphIndex:placeRef.current.paragraphIndex,fromWord:placeRef.current.wordIndex ?? 0}} : {}),
      title,
      request: {
        bookId: book.bookId || 'bible', editionKey: readerEditionKey, chapterNumber, kind, bookTitle: book.bookTitle,
        ...(kind === 'sofar' ? { paragraphIndex: Math.max(0, placeRef.current.paragraphIndex) } : {}),
      },
      ...(privateBook && ownParagraphs ? { own: { bookTitle: book.bookTitle || 'Your book', bookAuthor: book.bookAuthor || '', chapterNumber, chapterTitle: chapter?.title || book.chapterLabel || label, paragraphs: ownParagraphs } } : {}),
    })
  }, [book, dictation, initialResolving, readerEditionKey, privateBook, handleChapterChat, continuousReader, readerParagraphs])

  // Chat and Talk carry the card into the conversation the reader chose.
  const continueChapterNotes = useCallback((mode: 'chat' | 'talk', title: string, beats: ChapterNotesBeat[] | null) => {
    const notes = chapterNotes
    setChapterNotes(null)
    if (notes && beats) ask.keepExplanation(title, chapterNotesText(title, beats), Math.max(0, placeRef.current.paragraphIndex), { bookId: notes.request.bookId, chapterNumber: notes.request.chapterNumber })
    if (mode === 'chat') handleChat()
    else { ask.primeVoice(); requestAnimationFrame(() => handleTalk()) }
  }, [ask, chapterNotes, handleChat, handleTalk])

  // Catch me up hands what it showed to Chat or Talk the way Explain and
  // chapter notes do: kept as a shown explanation, then the companion opens.
  // The sheet never moved the reader, so the place is the one it opened at.
  const continueCatchUp = useCallback((mode: 'chat' | 'talk', text: string) => {
    setSuperSheet(null)
    if (text) ask.keepExplanation(CATCH_UP_TITLE, text, Math.max(0, placeRef.current.paragraphIndex), { bookId: book.bookId || 'bible', chapterNumber: book.chapterNumber })
    if (mode === 'chat') handleChat()
    else { ask.primeVoice(); requestAnimationFrame(() => handleTalk()) }
  }, [ask, book.bookId, book.chapterNumber, handleChat, handleTalk])

  const handleSuperMenuSelect = useCallback((id: LabSuperMenuId) => {
    setSuperMenuOpen(false)
    // The Librarian row's body sends its mode; a bare 'librarian' never leaves the reader.
    if (id === 'chat' || id === 'librarian') { if (continuousReader) menuMarginChatRef.current(); else handleChat(); return }
    // Notebook: the existing Contents list of highlights and notes (no position write: Contents suspends them).
    if (id === 'notebook') { setReaderControlsVisible(true); setContentsNotebook(true); setTocOpen(true); return }
    if (privateBook) {
      // Back to Add a book's Your books; one edition (a PDF two), so no editions layer but a PDF's.
      // Catch me up builds its recap from this device's text, signed in only.
      if (id === 'talk') handleTalk()
      else if (id === 'catchup') { if (signedIn) setSuperSheet('catchup'); else setAccountPrompt({ action: 'chat' }) }
      else if (id === 'summarize') openChapterNotes('end')
      // Aa and Audio settings as for any book; Book settings only for a PDF (its Tinct text and Original pages).
      else if (id === 'text') setSuperSheet('reading')
      else if (id === 'audio') setSuperSheet('audio')
      else if (id === 'account') setSuperSheet('account')
      else if (id === 'editions' && ownEditions) setSuperSheet('editions')
      // Back to the library from an own book lands on the reading table, as from Tinct's (Anders, 2026-10-12).
      else if (id === 'library' && typeof window !== 'undefined') leaveForLibrary(privateLibraryDestination('/library', sharedReader))
      return
    }
    if (id === 'talk') { handleTalk(); return }
    // Summarize is the whole current chapter (Anders, 2026-10-02); the reading
    // so far is Catch me up's job.
    if (id === 'summarize') { openChapterNotes('end'); return }
    if (id === 'catchup') { setSuperSheet('catchup'); return }
    // The settings groups (22 Oct 2026), the same on the phone and the desktop: Aa, Book settings, Audio settings.
    if (id === 'text') { setSuperSheet('reading'); return }
    if (id === 'editions') { setSuperSheet('editions'); return }
    if (id === 'audio') { setSuperSheet('audio'); return }
    if (id === 'account') { setSuperSheet('account'); return }
    rememberLibraryPlace()
    if (typeof window === 'undefined') return
    leaveForLibrary(privateLibraryDestination(`${LAB_LIBRARY_URL}${readerPreviewSearch(window.location.search)}`, sharedReader))
  }, [handleChat, handleTalk, handleChapterChat, rememberLibraryPlace, privateBook, ownEditions, openChapterNotes, signedIn, sharedReader, continuousReader])

  // A PDF's Original pages, picked in Book editions: the same spot, kept as the
  // place it shares with its Tinct text and sent at once, opens in Add a book's viewer.
  // "Show page" (a selection's, a figure's): a look at that paragraph's page (&frac=: how far down it), the
  // book still read as Tinct text (&pages: the viewer does not send it back), so Back or the viewer's
  // "Tinct text" returns to the same paragraph.
  const openPdfPages = useCallback((at?: { chapterNumber: number; paragraphIndex: number; wordIndex: number }) => {
    if (!userBook || userBook.kind !== 'pdf') return
    const current = userPlaceBookRef.current
    const spot = at ?? { chapterNumber: current.chapterNumber, paragraphIndex: placeRef.current.paragraphIndex, wordIndex: placeRef.current.wordIndex }
    const place = { ...spot, updatedAt: Date.now(), converter: userBook.edition.converter }
    const { page, frac } = at
      ? showPdfPageAt(userBook.hex, userBook.edition.chapters, place, userBook.pdfPages)
      : choosePdfPageAt(userBook.hex, userBook.edition.chapters, place, userBook.pdfPages)
    if (!at) { notePdfPlace(userBook.hex, { now: true }); flushOwnPlaces() }
    setSuperSheet(null)
    window.location.assign(sharedReader ? pdfReaderViewUrl(userBook.hex,'pages',{page,frac},window.location.search) : `${ownBookOpenUrl(userBook.hex)}&page=${page}${at ? `&frac=${frac}&pages` : ''}`)
  }, [userBook,sharedReader])
  // An EPUB's Margin view, picked in Book editions: this device reads it in Add a book's margin reader from now
  // on, at the same words (epubView.ts chooseEpubMargin; the place is also sent as the reader's own first).
  const openEpubMargin = useCallback(() => {
    if (!userBook || userBook.kind === 'pdf') return
    chooseEpubMargin(userBook.hex, userBook.edition, { chapterNumber: userPlaceBookRef.current.chapterNumber, paragraphIndex: placeRef.current.paragraphIndex, wordIndex: placeRef.current.wordIndex })
    flushOwnPlaces()
    setSuperSheet(null)
    window.location.assign(ownBookOpenUrl(userBook.hex))
  }, [userBook])
  const sheetPrefs = useCallback((next: LabPrefs) => {
    if (ownPdf && next.primaryEdition === PDF_PAGES_EDITION_KEY) { openPdfPages(); return }
    if (ownEpubMargin && next.primaryEdition === EPUB_MARGIN_EDITION_KEY) { openEpubMargin(); return }
    updatePrefs(next)
  }, [ownPdf, openPdfPages, ownEpubMargin, openEpubMargin, updatePrefs])

  // Contents -> Introduction opens the book's introduction in the library.
  // The navigation waits for the commit that closes Contents: writes are
  // suspended while Contents is open, and the place must be flushed (the
  // 'hide' flush uses keepalive) before the reader document is left.
  const [introductionRequested, setIntroductionRequested] = useState(false)
  const openIntroduction = useCallback(() => {
    if (privateBook) return
    listen.pause()
    setTocOpen(false)
    setIntroductionRequested(true)
  }, [listen, privateBook])
  useEffect(() => {
    if (!introductionRequested || tocOpen) return
    setIntroductionRequested(false)
    notePlace('hide')
    rememberLibraryPlace()
    leaveForLibrary(privateLibraryDestination(labLibraryIntroductionUrl(book.bookId || 'bible', prefs.primaryEdition, readerPreviewSearch(window.location.search)), sharedReader))
  }, [book.bookId, introductionRequested, notePlace, prefs.primaryEdition, rememberLibraryPlace, tocOpen, sharedReader])

  const showChapterEnd = !initialResolving && !book.chaptersProvisional
    && nativeMeasuredContent === readerParagraphs && readingPages.length > 0
    && readingPageIndex + (desktopSpread && !openingOnRight ? 1 : 0) >= readingPages.length - 1

  // Reading on to the book's last page finishes it: there is no page to turn
  // past, and readers stop here. Browsing to the end (Contents, a search) does not.
  const finalPageReached = showChapterEnd && nextLabChapter(book.chapters, book.chapterNumber) == null
    && (pageTurn?.direction === 'next' || enteredForwardRef.current === book.chapterNumber)
  useEffect(() => {
    if (finalPageReached && !temporaryHold && !finishedChapters.has(book.chapterNumber)) markChapterFinished(book.chapterNumber)
  }, [finalPageReached, temporaryHold, finishedChapters, book.chapterNumber, markChapterFinished])
  // Reaching a chapter's last page by reading on arms readToEndRef; turning
  // back off it, or arriving anywhere else, disarms it. Browsing to the end
  // (Contents, a search) never arms it.
  const onLastPage = !initialResolving && !book.chaptersProvisional && progressMeasured && readingPages.length > 0
    && readingPageIndex + (desktopSpread && !openingOnRight ? 1 : 0) >= readingPages.length - 1
  useEffect(() => {
    if (onLastPage && (pageTurn?.direction === 'next' || (enteredForwardRef.current === book.chapterNumber && readingPageIndex === 0))) readToEndRef.current = book.chapterNumber
    else if (readToEndRef.current !== book.chapterNumber || (!onLastPage && pageTurn?.direction === 'previous')) readToEndRef.current = null
  }, [onLastPage, pageTurn, book.chapterNumber, readingPageIndex])
  // Social ship 3: the "Finished {book}" reading card at the end of a book (nothing while SOCIAL_FRIENDS is off).
  const finishedCard = useFinishedCard({ bookId: book.bookId || 'bible', title: book.bookTitle || 'the book', signedIn, privateBook })

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

  // The command menu invokes the same actions as the visible controls. No alternate
  // navigation, audio or account path: their existing saved-place guards still apply.
  // ── The phone's margin mode (marginPhone/): the bar, the one bottom card, the chapter pills ──
  // Every card is fixed over the page: opening or closing one never turns a page or writes a place.
  const phoneChapterName = unitName(paintedChapterLabel || book.chapterLabel || book.chapterTitle || '')
  const phoneCardLabel = (name: string, chapterLabel?: string) => {
    const chapter = unitName(chapterLabel || '') || phoneChapterName
    return chapter ? `${name} · ${chapter}` : name
  }
  /** The selection as a card's passage, with the same edition and chapter the popup's Explain used. */
  const phonePassageOf = (selection: NonNullable<typeof selectionPopup>): PhonePassage => {
    const editionKey = selection.editionKey || readerEditionKey
    const compare = editionKey === prefs.compareEdition && editionKey !== prefs.primaryEdition
    return {
      text: selection.text, paragraphIndex: selection.paragraphIndex,
      chapterNumber: selection.chapterNumber ?? book.chapterNumber, chapterLabel: selection.chapterLabel ?? book.chapterLabel,
      editionKey, paragraphs: selection.paragraphs ?? (compare ? book.compareParagraphs : book.paragraphs),
      ranges: selection.chapterRanges?.length
        ? selection.chapterRanges.map(part => ({ chapterNumber: part.chapterNumber, range: part.range }))
        : selection.range ? [{ chapterNumber: selection.chapterNumber ?? book.chapterNumber, range: selection.range }] : [],
      compare: selection.side === 'compare',
    }
  }
  /** One of the companion's actions on a passage, on the routes Explain uses (useLabAsk.explainSelection). */
  const phoneCompanion = (passage: PhonePassage, intent: 'define' | 'simplify' | 'factcheck' | 'counterpoint' | 'quiz' | 'quiz_check' | undefined, onDelta: (text: string) => void, quiz?: { question: string; expected: string; why?: string; answer: string; turns?: import('../companion/companionRequest').QuizTurn[] }) => ask.explainSelection({
    text: passage.text, intent, quiz,
    editionKey: passage.editionKey, editionLabel: editionLabelFor(passage.editionKey, allBookEditions),
    paragraphs: passage.paragraphs, chapterNumber: passage.chapterNumber, chapterLabel: passage.chapterLabel,
    paragraphIndex: passage.paragraphIndex,
  }, onDelta)
  /** The whole chapter on screen as a passage without words: Quiz me from the chapter's end. */
  const phoneChapterPassage = (): PhonePassage => ({
    text: '', paragraphIndex: Math.max(0, placeRef.current.paragraphIndex), chapterNumber: book.chapterNumber,
    chapterLabel: book.chapterLabel, editionKey: readerEditionKey, paragraphs: readerParagraphs,
  })
  /** Close the open card. A note is kept as typed; a highlight made only for an empty note goes again. */
  const phoneCardRef = useRef(phoneCard)
  phoneCardRef.current = phoneCard
  const phoneNoteRef = useRef(phoneNote)
  phoneNoteRef.current = phoneNote
  const closePhoneCard = useCallback(() => {
    const current = phoneCardRef.current
    phoneCardRef.current = null
    if (current?.kind === 'note') {
      const note = phoneNoteRef.current.trim()
      const mark = highlightsApi.allHighlights.find(item => item.id === current.highlightId)
      if (current.created && !note) { highlightsApi.remove(current.highlightId); setDesktopLiveCards(cards => cards.filter(card => !(card.kind === 'note' && card.highlightId === current.highlightId))) }
      else if (mark && note !== (mark.note || '').trim()) highlightsApi.setNote(current.highlightId, note)
    }
    if (current?.kind === 'chapter-note') {
      const note = phoneNoteRef.current.trim()
      const saved = highlightsApi.chapterNotes.find(item => item.chapterNumber === current.chapterNumber)?.note ?? ''
      if (note !== saved.trim()) highlightsApi.setChapterNote(current.chapterNumber, note)
    }
    setPhoneCard(null)
    setDraft('')
    phoneAnswerRef.current = null
    dictation.stop()
  }, [dictation, highlightsApi])
  // A rail card belongs to Margin. Leaving that layout folds its presentation;
  // the retained source entry, conversation and per-card draft remain available.
  const previousMarginLayout = useRef(continuousReader)
  useLayoutEffect(() => {
    const leaving = previousMarginLayout.current && !continuousReader
    previousMarginLayout.current = continuousReader
    if (!leaving) return
    if (desktopOpenId) delete desktopDraftsRef.current[desktopOpenId]
    closePhoneCard()
    setNotebookCard(null)
    setDesktopOpenId(null)
    setDesktopContinuationId(null)
    setChapterNotes(null)
    setDraft('')
  }, [continuousReader, desktopOpenId, draft, closePhoneCard])
  useEffect(() => {
    if (!continuousReader || !phoneCard || !['note','chapter-note'].includes(phoneCard.kind)) return
    const timer = window.setTimeout(() => {
      const text = phoneNote.trim()
      if (phoneCard.kind === 'note') {
        const mark = highlightsApi.allHighlights.find(mark => mark.id === phoneCard.highlightId)
        if (mark && text !== (mark.note || '').trim()) highlightsApi.setNote(phoneCard.highlightId, text)
      } else if (phoneCard.kind === 'chapter-note') {
        const saved = highlightsApi.chapterNotes.find(note => note.chapterNumber === phoneCard.chapterNumber)?.note || ''
        if (saved.trim() !== text) highlightsApi.setChapterNote(phoneCard.chapterNumber, text)
      }
    }, 500)
    return () => window.clearTimeout(timer)
  // Only editing a desktop note schedules a write; persistence changes do not restart it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuousReader, phoneCard, phoneNote])
  /** The bin: a note's words go (and a highlight made only for it); any other card is put away. */
  const deletePhoneCard = (current = phoneCardRef.current) => {
    if (current?.kind === 'note') {
      if (current.created) highlightsApi.remove(current.highlightId)
      else highlightsApi.setNote(current.highlightId, '')
    }
    if (current?.kind === 'chapter-note') highlightsApi.setChapterNote(current.chapterNumber, '')
    if (current) setDesktopLiveCards(cards => cards.filter(card => desktopCardId(card) !== desktopCardId(current)))
    setDesktopOpenId(null)
    phoneNoteRef.current = ''
    setPhoneNote('')
    phoneCardRef.current = null
    setPhoneCard(null)
    phoneAnswerRef.current = null
    dictation.stop()
  }
  /** One card at a time: anything else that pops up closes first. */
  const desktopCardId = (card: PhoneCard) => card.kind === 'note' ? `highlight:${card.highlightId}` : card.kind === 'chapter-note' ? `chapter-note:${card.chapterNumber}` : `mc_react_${card.kind === 'quiz' ? 'quiz_' : ''}${card.openedAt}`
  const openPhoneCard = (card: PhoneCard) => {
    setDesktopAskOpen(false)
    setDraft('')
    setNotebookCard(null)
    if (continuousReader) {
      if (desktopOpenId) delete desktopDraftsRef.current[desktopOpenId]
      const id = desktopCardId(card)
      setDesktopOpenId(id); setDesktopContinuationId(id.startsWith('mc_') ? id : null)
      setDesktopLiveCards(current => [...current.filter(item => desktopCardId(item) !== id), card])
    }
    if (phoneCardRef.current) closePhoneCard()
    setChapterNotes(null)
    setSuperSheet(current => (current === 'catchup' ? null : current))
    if (phoneAskOpen) { dictation.stop(); closePhoneAsk() }
    if (callOpen) endCall()
    setSelectionPopup(null)
    phoneAnswerRef.current = null
    setSharedCardSaveError(false)
    setPhoneCard(card)
  }
  useLayoutEffect(() => {
    if (showPhoneChrome || !phoneCard || !['note', 'chapter-note', 'ask'].includes(phoneCard.kind)) return
    const root = continuousReader ? document.querySelector(`.source-margin-item[data-card-id="${desktopCardId(phoneCard)}"]`) : document.querySelector('.lab-desktop-card')
    const field = root?.querySelector<HTMLTextAreaElement>('.lab-pcard-note, .lab-pcard-follow-input')
    field?.focus({ preventScroll: true })
    // A new rail entry is hidden until its source geometry is measured.
    const frame = requestAnimationFrame(() => { if (phoneCardRef.current === phoneCard && field && document.activeElement !== field) field.focus({ preventScroll: true }) })
    return () => cancelAnimationFrame(frame)
  }, [phoneCard, showPhoneChrome, continuousReader])
  menuMarginChatRef.current = () => {
    closePhoneCard()
    setNotebookCard(null)
    setDesktopOpenId(null)
    setDesktopContinuationId(null)
    setContentsConversation(null)
    setTocOpen(false)
    setSuperSheet(null)
    setAskAttachment(null)
    setDraft('')
    setPhoneAskOpen(showPhoneChrome)
    setDesktopAskOpen(!showPhoneChrome)
  }
  useLayoutEffect(() => {
    if (!(phoneAskOpen || desktopAskOpen)) return
    setNotebookCard(null)
    setPhoneCard(null)
    setDesktopOpenId(null)
  }, [phoneAskOpen, desktopAskOpen])
  // Chat, Talk, Primer, Recap and Catch me up are cards too: opening one closes the card that was open.
  useEffect(() => {
    if (!marginPhone) return
    if (phoneAskOpen || callOpen || chapterNotes || superSheet === 'catchup') setPhoneCard(null)
  }, [marginPhone, phoneAskOpen, callOpen, chapterNotes, superSheet])
  useEffect(() => {
    if (!marginPhone || !(chapterNotes || superSheet === 'catchup')) return
    if (phoneAskOpen) { dictation.stop(); closePhoneAsk() }
    else if (callOpen) endCall()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginPhone, chapterNotes, superSheet])
  // A new book or chapter closes the card, as it does a selection.
  useLayoutEffect(() => {
    desktopDraftsRef.current = {}; desktopNoteConversionRef.current.clear(); desktopUnitAnchorsRef.current.clear(); desktopUnitPositionsRef.current.clear()
    setMarginUndo(null); setNotebookCard(null); setNotebookFlash(null); setDraft(''); setPhoneNote(''); setPhoneCard(null); setDesktopLiveCards([]); setDesktopOpenId(null); setDesktopContinuationId(null); setDesktopChapterCards([]); setDesktopCatchup(false); setChapterNotes(null)
  }, [book.bookId, book.chapterNumber, authUser?.id, signedIn, authUser?.id ? undefined : authToken])
  // The card's passage stays underlined on the page while the card is open (the card does not quote it).
  const phoneCardPassage = phoneCard && 'passage' in phoneCard ? phoneCard.passage : null
  useLayoutEffect(() => {
    if (!(marginPhone || sharedReader) || !phoneCardPassage?.ranges?.length) return
    return markPhoneCardPassage(document.querySelector('[data-testid="lab-root"]'), phoneCardPassage.ranges, book.chapterNumber, !!phoneCardPassage.compare)
  }, [marginPhone, sharedReader, phoneCardPassage, book.chapterNumber])
  /** A follow-up from a card: the chat's own question, with the passage attached and the card's answer as what the reader was shown. */
  const sendPhoneFollow = (passage: PhonePassage | null, question: string) => {
    const card = phoneCardRef.current
    const conversationId = card && 'openedAt' in card ? desktopCardId(card) : desktopContinuationId ?? undefined
    const saved = conversationId ? ask.revealConversation(conversationId) : null
    const shown = phoneAnswerRef.current
    if (!saved && passage && shown && !shown.kept && shown.answer) {
      ask.keepExplanation(passage.text, shown.answer, passage.paragraphIndex, { bookId: book.bookId || 'bible', chapterNumber: passage.chapterNumber })
      shown.kept = true
    }
    dictation.stop()
    void ask.sendTyped(question, undefined, undefined, {
      highlightedText: passage?.text || undefined, conversationId,
      onAccepted: () => {
        if (continuousReader) {
          setDraft('')
          return
        }
        closePhoneCard()
        setDesktopOpenId(null)
        setSelectionPopup(null)
        setDesktopContinuationId(conversationId ?? null)
        setContentsConversation(saved)
        setDraft('')
        setPhoneAskOpen(showPhoneChrome)
        setDesktopAskOpen(!showPhoneChrome)
      },
    })
  }
  const discussSavedCard = (id: string, question: string, text?: string) => {
    const saved = ask.revealConversation(id)
    dictation.stop()
    void ask.sendTyped(question, undefined, undefined, { conversationId: id, highlightedText: text,
      onAccepted: () => {
        if (continuousReader) {
          setDraft('')
          return
        }
        closePhoneCard(); setNotebookCard(null); setDesktopOpenId(null)
        setChapterNotes(null); setSuperSheet(null); setSelectionPopup(null)
        setDesktopContinuationId(id); setContentsConversation(saved); setDraft('')
        setPhoneAskOpen(showPhoneChrome); setDesktopAskOpen(!showPhoneChrome)
      } })
  }
  const phoneCardTurns = (openedAt: number) => ask.turns.filter(turn => !turn.shownExplanation && (continuousReader ? turn.conversationId === `mc_react_${openedAt}` || turn.conversationId === `mc_react_quiz_${openedAt}` : (turn.timestamp ?? 0) >= openedAt))
  const phoneBarHighlight = (color: HighlightColor) => {
    const selection = selectionPopup
    if (!selection) return
    if (selection.existingHighlightId) { highlightsApi.setColor(selection.existingHighlightId, color); return }
    if (!selection.range) return
    const created = selection.chapterRanges ? highlightsApi.addGroup(selection.chapterRanges, color, selection.editionKey)[0] : highlightsApi.addOrReuse(selection.range, color, selection.editionKey, selection.chapterNumber)
    setSelectionPopup(current => current ? { ...current, existingHighlightId: created.id, existingNote: created.note } : current)
  }
  const phoneBarNote = () => {
    const selection = selectionPopup
    if (!selection) return
    let id = selection.existingHighlightId
    let created = false
    if (!id && selection.range) {
      const mark = selection.chapterRanges ? highlightsApi.addGroup(selection.chapterRanges, lastHighlightColor(), selection.editionKey)[0] : highlightsApi.addOrReuse(selection.range, lastHighlightColor(), selection.editionKey, selection.chapterNumber)
      id = mark.id
      created = !mark.note
    }
    if (!id) return
    const note = highlightsApi.allHighlights.find(item => item.id === id)?.note ?? selection.existingNote ?? ''
    // The field is not focused: the keyboard comes up only when the reader taps it (iPhone feedback, 20 Oct 2026).
    setPhoneNote(note)
    openPhoneCard({ kind: 'note', passage: phonePassageOf(selection), highlightId: id!, created })
  }
  const phoneBarAsk = (initialQuestion?: string) => {
    const selection = selectionPopup
    if (!selection) return
    const passage = phonePassageOf(selection)
    if (continuousReader) {
      openPhoneCard({ kind: 'ask', passage, openedAt: Date.now() })
      setDraft(initialQuestion ?? '')
      return
    }
    closePhoneCard()
    setDesktopOpenId(null)
    setContentsConversation(null)
    setDesktopContinuationId(null)
    setAskAttachment({ bookId: book.bookId || 'bible', text: passage.text, sourceLocation: { chapterNumber: passage.chapterNumber, chapterLabel: passage.chapterLabel, paragraphIndex: passage.paragraphIndex } })
    setSelectionPopup(null)
    setDraft(initialQuestion ?? '')
    setPhoneAskOpen(showPhoneChrome)
    setDesktopAskOpen(!showPhoneChrome)
  }
  const phoneBarAction = (kind: 'explain' | 'simplify' | PhoneMoreId) => {
    const selection = selectionPopup
    if (!selection) return
    if (kind === 'copy') {
      const text = selection.text
      const done = () => dismissSelectionPopup()
      if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(text).then(done, done)
      else done()
      return
    }
    const passage = phonePassageOf(selection)
    setDraft('')
    if (kind === 'define') {
      const word = selection.defineText || selection.text
      define.begin(word)
      openPhoneCard({ kind: 'define', passage, word, namesakes: selection.namesakes, openedAt: Date.now() })
      return
    }
    if (kind === 'quiz') { openPhoneCard({ kind: 'quiz', passage, chapterNumber: passage.chapterNumber, chapterLabel: passage.chapterLabel, openedAt: Date.now() }); return }
    openPhoneCard({ kind, passage, openedAt: Date.now() })
  }
  const marginCatchUp = catchUpAvailable(book.chapters, book.chapterNumber)
  const marginPills: MarginPhonePills | null = useMemo(() => (marginPhone || sharedReader) ? {
    catchUp: marginCatchUp,
    onCatchUp: () => { if (!initialResolving && !book.chaptersProvisional) { if (continuousReader) { if (phoneCardRef.current?.kind === 'note' || phoneCardRef.current?.kind === 'chapter-note') closePhoneCard(); desktopUnitAnchorsRef.current.set(`mc_unit_catchup_${book.chapterNumber}_${readerEditionKey}`, {paragraphIndex:placeRef.current.paragraphIndex,fromWord:placeRef.current.wordIndex ?? 0}); setDesktopCatchup(true); setDesktopOpenId(`mc_unit_catchup_${book.chapterNumber}_${readerEditionKey}`); setDesktopContinuationId(`mc_unit_catchup_${book.chapterNumber}_${readerEditionKey}`) } else setSuperSheet('catchup') } },
    onQuiz: anchor => { if (!initialResolving && !book.chaptersProvisional) quizChapterRef.current(anchor) },
  } : null, [marginPhone, sharedReader, marginCatchUp, initialResolving, book.chaptersProvisional, continuousReader, book.chapterNumber, readerEditionKey])
  marginPhoneNoteRef.current = (chapterNumber: number) => {
    if (!(marginPhone || sharedReader)) return false
    const chapter = book.chapters.find(item => item.number === chapterNumber)
    setPhoneNote(highlightsApi.chapterNotes.find(note => note.chapterNumber === chapterNumber)?.note ?? '')
    openPhoneCard({ kind: 'chapter-note', chapterNumber, chapterLabel: chapter?.title || book.chapterLabel })
    return true
  }
  quizChapterRef.current = anchor => { desktopQuizAnchorRef.current = anchor ?? null; setDraft(''); openPhoneCard({ kind: 'quiz', passage: null, chapterNumber: book.chapterNumber, chapterLabel: book.chapterLabel, openedAt: Date.now() }) }

  const commandOverlay = tocOpen || inTheBookOpen || speedPopoverOpen || phoneCard !== null
    || selectionPopup !== null || superMenuOpen || superSheet !== null || bookSwitcherOpen || accountPrompt !== null
  const canReadCommand = () => !initialResolving && !frontispieceVisible && !temporaryHold

  const canTurnCommand = () => !initialResolving && !temporaryHold && !phoneAskOpen && !desktopAskOpen && !callOpen
  const editionCommand = (kind: string) => bookEditions.find(e => e.key === `${kind}-en`)
  useDesktopCommands({
    blocked: () => commandOverlay || initialResolving || Boolean(temporaryHold),
    prepare: () => { setTocOpen(false); setSuperMenuOpen(false); setSuperSheet(null); setBookSwitcherOpen(false); setSpeedPopoverOpen(false); setSelectionPopup(null); setInTheBookOpen(false); setAccountPrompt(null) },
    commands: [
      { id: 'chat', label: 'Chat about this book', key: 'c', enabled: canReadCommand, run: () => { handleChat(); requestAnimationFrame(() => askInputRef.current?.focus({ preventScroll: true })) } },
      { id: 'talk', label: callOpen || ask.voiceActive ? 'End voice conversation' : 'Talk about this book', key: 't', enabled: canReadCommand, run: () => { if (callOpen) endCall(); else if (ask.voiceActive) closePhoneAsk(); else handleTalk() } },
      { id: 'listen', label: listen.playing ? 'Pause narration' : 'Listen to this page', key: 'p', enabled: () => canReadCommand() && !callOpen && !ask.voiceActive, run: handleBarListen },
      { id: 'read', label: 'Return to reading', key: 'r', run: () => { if(callOpen || phoneAskOpen || desktopAskOpen) closePhoneAsk(); else if(showPhoneChrome ? mobileCompareActive : desktopCompareActive) (showPhoneChrome ? toggleMobileCompareByReader : toggleDesktopCompareByReader)() } },
      { id: 'next', label: 'Next page', key: 'j', enabled: canTurnCommand, run: goNext },
      { id: 'previous', label: 'Previous page', key: 'k', enabled: canTurnCommand, run: goPrev },
      { id: 'next-chapter', label: 'Next chapter', key: ']', enabled: () => canTurnCommand() && nextLabChapter(book.chapters, book.chapterNumber) != null, run: () => { const n=nextLabChapter(book.chapters,book.chapterNumber); if(n!=null)void (listen.playing?browseToChapter(n,'start'):goToChapter(n,'start')) } },
      { id: 'previous-chapter', label: 'Previous chapter', key: '[', enabled: () => canTurnCommand() && prevLabChapter(book.chapters, book.chapterNumber) != null, run: () => { const n=prevLabChapter(book.chapters,book.chapterNumber); if(n!=null)void (listen.playing?browseToChapter(n,'start'):goToChapter(n,'start')) } },
      { id: 'contents', label: 'Contents, highlights and notes', key: 'i', enabled: canReadCommand, run: () => { setReaderControlsVisible(true); setTocOpen(true) } },
      { id: 'editions', label: 'Book settings', key: 'e', enabled: canReadCommand, run: () => handleSuperMenuSelect('editions') },
      { id: 'original', label: 'Read original English', key: 'o', enabled: () => canReadCommand() && !!editionCommand('original'), run: () => { const e=editionCommand('original');if(e)updatePrefs({...prefs,primaryEdition:e.key,compareOpen:prefs.compareOpen && prefs.compareEdition!==e.key}) } },
      { id: 'modern', label: 'Read modern English', key: 'm', enabled: () => canReadCommand() && !!editionCommand('modern'), run: () => { const e=editionCommand('modern');if(e)updatePrefs({...prefs,primaryEdition:e.key,compareOpen:prefs.compareOpen && prefs.compareEdition!==e.key}) } },
      { id: 'compare', label: 'Compare editions', key: 'x', enabled: () => canReadCommand() && (showPhoneChrome ? mobileCompareEnabled : desktopCompareEnabled), run: () => (showPhoneChrome ? toggleMobileCompareByReader : toggleDesktopCompareByReader)() },
      { id: 'books', label: 'Switch book', key: 'b', run: openBookSwitcher },
      { id: 'library', label: 'Open the library', key: 'l', run: () => handleSuperMenuSelect('library') },
      { id: 'settings', label: 'Aa', key: 's', run: () => handleSuperMenuSelect('text') },
      { id: 'audio', label: 'Audio settings', key: 'v', run: () => handleSuperMenuSelect('audio') },
      { id: 'account', label: 'Profile', key: 'a', run: () => handleSuperMenuSelect('account') },
      { id: 'fullscreen', label: 'Toggle full screen', key: 'f', run: () => { void toggleFullscreen() } },
    ].filter(command => !privateBook || !USER_BOOK_HIDDEN_COMMANDS.has(command.id) || (command.id === 'listen' && ownNarration) || (command.id === 'editions' && ownEditions)),
  })

  const openNotebookConversation = (conversation: ChatConversation) => {
    if (conversation.bookId !== (book.bookId || 'bible')) return
    closePhoneCard()
    setDesktopOpenId(null)
    setTocOpen(false)
    setSelectionPopup(null)
    setDraft('')
    setAskAttachment(null)
    const firstAnswer = conversation.messages.findIndex(message => message.role === 'assistant')
    const discussed = !conversation.card || conversation.card.kind === 'ask'
      || conversation.messages.slice(firstAnswer + 1).some(message => message.role === 'user')
    if (discussed && conversation.card?.kind !== 'quiz') {
      ask.revealConversation(conversation.id)
      setNotebookCard(null)
      setContentsConversation(conversation)
      setDesktopContinuationId(conversation.id)
      setPhoneAskOpen(showPhoneChrome)
      setDesktopAskOpen(!showPhoneChrome)
    } else {
      setNotebookCard(conversation)
      setContentsConversation(null)
      setDesktopContinuationId(null)
      setPhoneAskOpen(false)
      setDesktopAskOpen(false)
    }
  }

  const continueDiscussionAction = (id: string) => {
    // The margin's composer continues this card; Chat is opened from its menu.
    if (continuousReader) return null
    const saved = ask.conversations.find(row => row.id === id)
    if (!saved || saved.card?.kind === 'quiz') return null
    const firstAnswer = saved.messages.findIndex(message => message.role === 'assistant')
    if (!saved.messages.slice(firstAnswer + 1).some(message => message.role === 'user')) return null
    return <button type="button" className="lab-pcard-link" onClick={() => openNotebookConversation(saved)}>Continue discussion</button>
  }

  // The chat's thread and composer: the desktop panel, the phone's Chat sheet, or (margin mode) the Chat card.
  const askPaneElement = (
          <LabAskPane
            focusTurnId={readingChatFocusTurn(ask.turns, contentsConversation)}
            onBackToContents={contentsConversation ? returnToContents : undefined}
            dictationState={dictation.state}
            onStopVoice={callOpen ? endCall : ask.stopVoice}
            conversationState={ask.conversationState}
            voiceActive={ask.voiceActive}
            typedLoading={ask.typedLoading}
            typedStatus={ask.typedStatus}
            turns={readingChatTurns(ask.turns, ask.conversations)}
            historyStatus={ask.historyStatus}
            draft={draft}
            attachment={askAttachment && askAttachment.bookId === book.bookId ? { text: askAttachment.text, kind: askAttachment.figure ? 'figure' : 'highlight' } : null}
            onRemoveAttachment={() => setAskAttachment(null)}
            onDraftChange={(text) => { dictation.stop(); setDraft(text) }}
            onSubmit={(text) => { dictation.stop(); handleAsk(text) }}
            onMic={handleMic}
            onVoiceMode={() => {
              dictation.stop()
              handleTalk()
            }}
            onRetry={ask.retryTyped}
            notice={dictation.notice || ask.notice}
            onDone={marginPhone ? undefined : () => { dictation.stop(); closePhoneAsk() }}
            phoneSheet={!!phoneAsk}
            embeddedPhoneCard={!!(marginPhone && phoneAsk)}
            composerPlaceholder={marginPhone && phoneAsk ? `Ask about ${paintedChapterLabel || book.chapterLabel || book.bookTitle}…` : undefined}
            desktopCompanion={!showPhoneChrome ? (chrome === 'talking' ? 'talk' : 'chat') : undefined}
            onKeyboardOpenChange={marginPhone ? undefined : setPhoneKeyboardOpen}
            inputRef={askInputRef}
            chapterLabels={Object.fromEntries(book.chapters.map(chapter => [chapter.number, chapter.title]))}
            minimized={!showPhoneChrome ? desktopChatMinimized : undefined}
            onMinimizedChange={!showPhoneChrome ? setDesktopChatMinimized : undefined}

          />
  )


  /** The open card's body: the passage, what the action shows, and the follow-up line. */
  const leaveSelectionInfo = (showActions = false) => {
    dictation.stop()
    phoneAnswerRef.current = null
    setSharedCardSaveError(false)
    if (showActions) setPopupMode('main')
    else dismissSelectionPopup()
  }
  const renderPhoneCard = (card: PhoneCard, fromSelection = false) => {
    const ResponseCard = sharedReader && !showPhoneChrome ? LabDesktopCard : LabPhoneCard
    // Talk about the card: what it showed is kept first (as a follow-up keeps it), then the voice conversation opens.
    const talkAbout = (passage: PhonePassage | null) => () => {
      const shown = phoneAnswerRef.current
      if (passage && shown && !shown.kept && shown.answer) {
        ask.keepExplanation(passage.text, shown.answer, passage.paragraphIndex, { bookId: book.bookId || 'bible', chapterNumber: passage.chapterNumber })
        shown.kept = true
      }
      dictation.stop()
      ask.primeVoice()
      requestAnimationFrame(() => handleTalk())
    }
    const follow = (passage: PhonePassage | null, placeholder?: string) => (
      <>{continueDiscussionAction(desktopCardId(card))}<PhoneFollowField value={draft} onChange={text => { dictation.stop(); setDraft(text) }} onSend={text => sendPhoneFollow(passage, text)}
        onMic={handleMic} micOn={dictation.state !== 'idle'} onTalk={talkAbout(passage)} inputRef={phoneFieldRef} placeholder={placeholder} disabled={ask.typedLoading} /></>
    )
    const name = PHONE_CARD_NAMES[card.kind]
    if (card.kind === 'note' || card.kind === 'chapter-note') {
      return (
        <ResponseCard {...(continuousReader ? { embedded: true } : {})} {...(sharedReader && !showPhoneChrome && 'passage' in card ? { passageText: card.passage?.text } : {})} {...(sharedReader && !showPhoneChrome ? { hasPassage: 'passage' in card && !!card.passage?.ranges?.length } : {})} label={phoneCardLabel(name, card.kind === 'note' ? card.passage.chapterLabel : card.chapterLabel)} kind={card.kind} onClose={closePhoneCard} onDelete={() => deletePhoneCard(card)} deleteLabel={card.kind === 'note' ? 'Delete note' : 'Delete chapter note'} foot={continuousReader ? <PhoneFollowField value={draft} onChange={setDraft} placeholder="Ask about this note" onSend={question => {
          const text = phoneNoteRef.current.trim()
          if (!text) return
          const openedAt = Date.now()
          const passage = card.kind === 'note' ? { ...card.passage, text } : { ...phoneChapterPassage(), text }
          desktopNoteConversionRef.current.set(openedAt, { ...(card.kind === 'note' ? {highlightId:card.highlightId, created:card.created} : {chapterNumber:card.chapterNumber}), text })
          closePhoneCard()
          openPhoneCard({kind:'ask', passage, openedAt})
          setDraft('')
          void ask.sendTyped(question, undefined, undefined, {highlightedText:text, conversationId:`mc_react_${openedAt}`})
        }} onMic={handleMic} micOn={dictation.state !== 'idle'} onTalk={talkAbout(card.kind === 'note' ? card.passage : null)} disabled={ask.typedLoading} /> : undefined}>
          <PhoneNoteBody value={phoneNote} onChange={text => { setPhoneNote(text); if (continuousReader) { if (card.kind === 'note') highlightsApi.setNote(card.highlightId, text); else highlightsApi.setChapterNote(card.chapterNumber, text) } }} inputRef={phoneFieldRef} chapter={card.kind === 'chapter-note'} />
        </ResponseCard>
      )
    }
    if (card.kind === 'quiz') {
      const passage = card.passage ?? phoneChapterPassage()
      return (
        <ResponseCard {...(continuousReader ? { embedded: true } : {})} {...(sharedReader && !showPhoneChrome && 'passage' in card ? { passageText: card.passage?.text } : {})} {...(sharedReader && !showPhoneChrome ? { hasPassage: 'passage' in card && !!card.passage?.ranges?.length } : {})} {...(sharedReader && !showPhoneChrome && !card.passage && desktopQuizAnchorRef.current ? { getAnchor: () => desktopQuizAnchorRef.current } : {})} label={phoneCardLabel(name, card.chapterLabel)} kind="quiz" onClose={closePhoneCard} onDelete={closePhoneCard}>
          <PhoneQuizBody
            request={onDelta => phoneCompanion(passage, 'quiz', onDelta)}
            mark={(question, answer, turns) => phoneCompanion({ ...passage, text: '' }, 'quiz_check', () => {}, { question: question.q, expected: question.answer, why: question.why, answer, turns })}
            onComplete={summary => {
              if (!sharedReader) return
              const range = passage.ranges?.find(part => part.chapterNumber === passage.chapterNumber)?.range
              const saved = ask.saveCard({
                source: userBook
                  ? { kind: 'own-text', bookId: userBook.bookId, ownHex: userBook.hex, converter: userBook.edition.converter, editionKey: ownSourceEditionKey(userBook.edition) as 'own' | 'own-en' | 'own-da' }
                  : { kind: 'catalogue', bookId: book.bookId || 'bible' },
                id: `react_quiz_${card.openedAt}`, kind: 'quiz', chapterNumber: passage.chapterNumber,
                ...(range ? { anchor: { editionKey: passage.editionKey, chapterNumber: passage.chapterNumber,
                  paragraphIndex: range.paragraphIndex, fromWord: range.fromWord,
                  endParagraphIndex: range.endParagraphIndex, toWord: range.toWord } } : {}),
                text: passage.text, turns: [{ role: 'assistant', content: summary }],
                at: card.openedAt, u: Date.now(),
              })
              setSharedCardSaveError(!saved)
            }}
            draft={draft} setDraft={setDraft} onMic={handleMic} micOn={dictation.state !== 'idle'} inputRef={phoneFieldRef}
            follow={summary => {
              const key = `quiz:${card.openedAt}`
              const keep = () => { ask.keepExplanation(phoneCardLabel(name, card.chapterLabel), summary, passage.paragraphIndex, { bookId: book.bookId || 'bible', chapterNumber: card.chapterNumber }); return true }
              return pillCardFollow(key, keep, () => {
                if (pillCardKeptRef.current !== key && keep()) pillCardKeptRef.current = key
                ask.primeVoice()
                requestAnimationFrame(() => handleTalk())
              })
            }}
            thread={pillCardThread(card.openedAt)} />
          {sharedReader && sharedCardSaveError && <p role="status">This quiz is here for now. It could not be saved on this device. Copy it before leaving the reader.</p>}
        </ResponseCard>
      )
    }
    const cardTurns = phoneCardTurns(card.openedAt)
    const turns = card.kind === 'ask' ? cardTurns : liveCardFollowupTurns(cardTurns, card.openedAt)
    const pending = ask.typedLoading && turns.length > 0
    const keep = (answer: string) => {
      if (fromSelection && (selectionPopupRef.current !== selectionPopup || popupModeRef.current !== 'define')) return
      if (!continuousReader || phoneCardRef.current === card) phoneAnswerRef.current = { card, answer, kept: false }
      // Shared cards already persist the answer in the book's chat history.
      // Do not spend local quota on a second, unread legacy explanation copy.
      if (!sharedReader && card.kind === 'explain') saveExplanation({ bookId: book.bookId || 'bible', chapterNumber: card.passage.chapterNumber, paragraphIndex: card.passage.paragraphIndex, passage: card.passage.text, answer })
      if (sharedReader && card.kind !== 'ask' && answer.trim()) {
        const range = card.passage.ranges?.find(part => part.chapterNumber === card.passage.chapterNumber)?.range
        const at = card.openedAt
        const saved = ask.saveCard({
          source: userBook
            ? { kind: 'own-text', bookId: userBook.bookId, ownHex: userBook.hex, converter: userBook.edition.converter, editionKey: ownSourceEditionKey(userBook.edition) as 'own' | 'own-en' | 'own-da' }
            : { kind: 'catalogue', bookId: book.bookId || 'bible' }, id: `react_${card.openedAt}`,
          kind: card.kind, chapterNumber: card.passage.chapterNumber,
          ...(range ? { anchor: { editionKey: card.passage.editionKey, chapterNumber: card.passage.chapterNumber,
            paragraphIndex: range.paragraphIndex, fromWord: range.fromWord,
            endParagraphIndex: range.endParagraphIndex, toWord: range.toWord } } : {}),
          text: card.passage.text, turns: [{ role: 'assistant', content: answer }], at, u: Date.now(),
        })
        setSharedCardSaveError(!saved)
      }
    }
    const lead = card.kind === 'ask' ? null
      : card.kind === 'define' ? (
        <div className="lab-pcard-define" data-testid="lab-phone-define">
          {!/\s/.test(card.word.trim()) && <p className="lab-pcard-headword popup-define-word">{define.result?.word || card.word}</p>}
          <DefinitionFallback key={card.word} word={card.word} namesakes={card.namesakes}
            request={(onDelta, word) => phoneCompanion({ ...card.passage, text: word }, 'define', onDelta).then(answer => { keep(answer); return answer })}
            dictionaryDefinitions={define.loading ? undefined : define.result?.definitions} />
        </div>
      )
      : <PhoneStreamAnswer key={`${card.kind}:${card.openedAt}`} request={onDelta => phoneCompanion(card.passage, card.kind === 'explain' ? undefined : card.kind, onDelta)} onReady={keep} />
    return (
      <ResponseCard {...(continuousReader ? { embedded: true } : {})} {...(sharedReader && !showPhoneChrome && 'passage' in card ? { passageText: card.passage?.text } : {})} {...(sharedReader && !showPhoneChrome ? { hasPassage: 'passage' in card && !!card.passage?.ranges?.length } : {})} label={phoneCardLabel(name, card.passage.chapterLabel)} kind={card.kind} onClose={fromSelection ? () => leaveSelectionInfo() : closePhoneCard} onDelete={fromSelection ? () => leaveSelectionInfo() : closePhoneCard}
        foot={follow(card.passage, card.kind === 'ask' ? 'Ask about this passage' : undefined)}>
        {desktopNoteConversionRef.current.get(card.openedAt) && turns[0]?.content !== desktopNoteConversionRef.current.get(card.openedAt)!.text && <div className="lab-pcard-you"><LabInlineMarkdown>{desktopNoteConversionRef.current.get(card.openedAt)!.text}</LabInlineMarkdown></div>}
        <PhonePassageBody lead={lead} turns={turns} pending={pending} />
        {sharedReader && sharedCardSaveError && <p role="status">
          {ask.cardAccountSaved
            ? 'This answer is saved to your account, but could not be saved on this device.'
            : <>{ask.cardSaveFailure === 'quota' ? 'Tinct’s storage on this device is full. This answer could not be saved.' : ask.cardSaveFailure === 'access' ? 'This device is blocking storage. This answer could not be saved.' : 'This answer could not be saved.'} Copy the answer before leaving the reader.</>}{' '}
          <button type="button" onClick={() => { const retained = phoneAnswerRef.current; if (retained?.card.openedAt === card.openedAt) keep(retained.answer) }}>Retry saving</button>{' '}
          <button type="button" onClick={() => { void navigator.clipboard?.writeText(`Tinct answer save: ${ask.cardSaveFailure || 'unknown'}`).then(() => setSaveDetailsCopied(true), () => setSaveDetailsCopied(false)) }}>{saveDetailsCopied ? 'Save details copied' : 'Copy save details'}</button>
        </p>}
      </ResponseCard>
    )
  }

  // Primer, Recap, Summarize and Catch me up end with the follow-up field too (iPhone feedback, 21 Oct 2026), as a
  // margin card or as the phone's sheet: a follow-up joins the chat's conversation with what the card showed kept
  // first (as Chat from the card did); Talk starts the voice conversation about it.
  const pillCardKeptRef = useRef<string | null>(null)
  const pillCardFollow = (key: string, keep: () => boolean, talk: () => void) => (
    <PhoneFollowField value={draft} onChange={text => { dictation.stop(); setDraft(text) }}
      onSend={question => {
        if (pillCardKeptRef.current !== key && keep()) pillCardKeptRef.current = key
        dictation.stop()
        void ask.sendTyped(question, undefined, undefined, { onAccepted: () => setDraft('') })
      }}
      onMic={handleMic} micOn={dictation.state !== 'idle'} onTalk={() => { dictation.stop(); talk() }} inputRef={phoneFieldRef} disabled={ask.typedLoading} />
  )
  const pillCardThread = (openedAt: number) => {
    const turns = phoneCardTurns(openedAt)
    return turns.length ? <div className="lab-pcard-thread" data-testid="lab-pill-card-thread"><PhonePassageBody turns={turns} pending={ask.typedLoading} /></div> : null
  }

  const unitRailId = (notes: NonNullable<typeof chapterNotes>) => `mc_unit_${notes.request.kind === 'end' ? 'recap' : notes.request.kind}_${notes.request.chapterNumber}_${notes.request.editionKey}`
  useEffect(() => {
    if (!continuousReader || !chapterNotes) return
    const id = unitRailId(chapterNotes)
    if (chapterNotes.railAnchor) desktopUnitAnchorsRef.current.set(id, chapterNotes.railAnchor)
    if (phoneCardRef.current?.kind === 'note' || phoneCardRef.current?.kind === 'chapter-note') closePhoneCard()
    setDesktopChapterCards(current => current.some(item => unitRailId(item) === id) ? current : [...current, chapterNotes])
    setDesktopOpenId(current => current === id ? null : id)
    setDesktopContinuationId(id)
  // A deliberate pill activation opens or minimises its retained unit card.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuousReader, chapterNotes])
  // Ask starts without an AI answer. Promote it into the same source-card store
  // only when a complete response exists, retaining its source and full thread.
  useEffect(() => {
    if (!continuousReader || ask.typedLoading) return
    for (const card of desktopLiveCards) {
      if (card.kind !== 'ask') continue
      const turns = ask.turns.filter(turn => !turn.shownExplanation && !turn.cancelled && turn.conversationId === `mc_react_${card.openedAt}`)
      if (!turns.some(turn => turn.role === 'assistant' && turn.content.trim())) continue
      const id = `mc_react_${card.openedAt}`
      const existing = ask.conversations.find(item => item.id === id)
      const convertedNote = desktopNoteConversionRef.current.get(card.openedAt)
      const savedTurns = withConvertedNote(turns.map(turn => ({id:turn.id,role:turn.role,content:turn.content,at:turn.timestamp})), convertedNote ? {text:convertedNote.text,at:card.openedAt} : undefined)
      if (existing?.card && existing.messages.map(message => message.content).join('\n') === savedTurns.map(turn => turn.content).join('\n')) continue
      const range = card.passage.ranges?.find(part => part.chapterNumber === card.passage.chapterNumber)?.range
      const saved = ask.saveCard({ source: userBook ? { kind:'own-text', bookId:userBook.bookId, ownHex:userBook.hex, converter:userBook.edition.converter, editionKey:ownSourceEditionKey(userBook.edition) as 'own'|'own-en'|'own-da' } : { kind:'catalogue', bookId:book.bookId || 'bible' },
        id:`react_${card.openedAt}`, kind:'ask', chapterNumber:card.passage.chapterNumber, text:card.passage.text,
        ...askCardSource(range, card.passage.editionKey, card.passage.chapterNumber),
        turns:savedTurns, at:card.openedAt, u:Date.now() })
      if (saved && convertedNote) { if (convertedNote.highlightId) { if (convertedNote.created) highlightsApi.remove(convertedNote.highlightId); else highlightsApi.setNote(convertedNote.highlightId, ''); setDesktopLiveCards(cards => cards.filter(item => !(item.kind === 'note' && item.highlightId === convertedNote.highlightId))) }; if (convertedNote.chapterNumber != null) { highlightsApi.setChapterNote(convertedNote.chapterNumber, ''); setDesktopLiveCards(cards => cards.filter(item => !(item.kind === 'chapter-note' && item.chapterNumber === convertedNote.chapterNumber))) } }
    }
  // The store mutation is guarded by completed content equality.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuousReader, desktopLiveCards, ask.turns, ask.typedLoading])
  const chapterBoundaryAnchors = useMemo(() => ({start:marginChapterBoundary(readerParagraphs),end:marginChapterBoundary(readerParagraphs,true)}), [readerParagraphs])
  const sourceForFreeUnit = (id:string) => () => {
    const y=desktopUnitPositionsRef.current.get(id)
    if (!marginHost || y == null) return null
    const frame=marginHost.getBoundingClientRect()
    return {left:frame.left,right:frame.right,top:frame.top+y-marginHost.scrollTop,bottom:frame.top+y-marginHost.scrollTop+1}
  }
  useEffect(() => {
    if (!continuousReader || superSheet !== 'catchup') return
    if (phoneCardRef.current?.kind === 'note' || phoneCardRef.current?.kind === 'chapter-note') closePhoneCard()
    const id=`mc_unit_catchup_${book.chapterNumber}_${readerEditionKey}`
    desktopUnitAnchorsRef.current.set(id,{paragraphIndex:placeRef.current.paragraphIndex,fromWord:placeRef.current.wordIndex ?? 0})
    if (marginHost) desktopUnitPositionsRef.current.set(id,marginHost.scrollTop+Math.min(140,marginHost.clientHeight*.24))
    setDesktopCatchup(true); setDesktopOpenId(id); setDesktopContinuationId(id); setSuperSheet(null)
  // A menu activation is a free unit companion at this reading position, even if a boundary is virtualised away.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuousReader,superSheet])
  const marginConversations = ask.conversations.filter(item => item.bookId === (book.bookId || 'bible') && item.card && !item.card.gone && item.chapterNumber === book.chapterNumber && (!item.card.anchor || item.card.anchor.editionKey === readerEditionKey))
  const sourceForMargin = (anchor?: { paragraphIndex: number; fromWord: number }, atEnd = false) => () => {
    const host = marginHost
    if (!host) return null
    const sourceAnchor = anchor ?? (atEnd ? chapterBoundaryAnchors.end : chapterBoundaryAnchors.start)
    const word = sourceAnchor ? marginSourceWord(host, sourceAnchor) : null
    if (!word) return null
    const rect = word.getBoundingClientRect()
    if (!rect.height) return null
    return { left: rect.left, right: rect.right, top: rect.top + rect.height * .75, bottom: rect.bottom }
  }
  const toggleMargin = (id: string, live?: PhoneCard) => {
    if (desktopOpenId) delete desktopDraftsRef.current[desktopOpenId]
    if (desktopOpenId === id) { setDraft(''); if (live?.kind === 'note' || live?.kind === 'chapter-note') closePhoneCard(); setPhoneCard(null); setDesktopOpenId(null); setDesktopContinuationId(null); return }
    if (phoneCardRef.current?.kind === 'note' || phoneCardRef.current?.kind === 'chapter-note') closePhoneCard()
    setNotebookCard(null); setPhoneAskOpen(false); setDesktopAskOpen(false)
    setSelectionPopup(null); setDraft(''); setDesktopOpenId(id); setDesktopContinuationId(id.startsWith('mc_') ? id : null)
    if (live) {
      setPhoneCard(live)
      if (live.kind === 'note') setPhoneNote(highlightsApi.allHighlights.find(mark => mark.id === live.highlightId)?.note ?? '')
      if (live.kind === 'chapter-note') setPhoneNote(highlightsApi.chapterNotes.find(note => note.chapterNumber === live.chapterNumber)?.note ?? '')
    } else setPhoneCard(null)
  }
  const deleteMarginConversation = (item: ChatConversation) => {
    const undo = ask.deleteCard(item.id)
    if (undo) { setMarginUndo(() => () => { undo() }); setDesktopLiveCards(current => current.filter(card => desktopCardId(card) !== item.id)); if (desktopOpenId === item.id) { setDesktopOpenId(null); setPhoneCard(null) } }
  }
  const liveIds = new Set([...desktopLiveCards.map(desktopCardId), ...desktopChapterCards.map(unitRailId), ...(desktopCatchup ? [`mc_unit_catchup_${book.chapterNumber}_${readerEditionKey}`] : [])])
  const marginActionLabel = (kind: string) => ({ catchup: CATCH_UP_TITLE, primer: 'Primer', recap: 'Recap', ...PHONE_CARD_NAMES } as Record<string, string>)[kind] || kind.charAt(0).toUpperCase() + kind.slice(1)
  const desktopMarginEntries: SourceMarginEntry[] = continuousReader ? marginConversations.filter(item => !liveIds.has(item.id)).map(item => ({
    id: item.id, label: marginActionLabel(item.card!.kind),
    source: sourceForMargin(item.card!.anchor || (item.card!.data as {freeAnchor?: MarginSourceAnchor; unitAnchor?:MarginSourceAnchor} | undefined)?.freeAnchor || (item.card!.data as {unitAnchor?:MarginSourceAnchor} | undefined)?.unitAnchor, item.card!.kind === 'recap'), order: item.card!.kind === 'recap' ? 1e12 - 2 : item.card!.kind === 'primer' ? -2 : item.card!.kind === 'catchup' ? -1 : (item.card!.anchor?.paragraphIndex ?? (item.card!.data as {freeAnchor?: {paragraphIndex:number}} | undefined)?.freeAnchor?.paragraphIndex ?? 0) * 100000 + (item.card!.anchor?.fromWord ?? (item.card!.data as {freeAnchor?: {fromWord:number}} | undefined)?.freeAnchor?.fromWord ?? 0) + item.startTimestamp / 1e16,
    free: !item.card!.anchor, open: desktopOpenId === item.id, preview: item.card!.kind === 'define' ? contextualLookupPreview(item.messages.find(message => message.role === 'assistant')?.content || '') : item.messages.find(message => message.role === 'assistant')?.content, sourceText: item.card!.text,
    onToggle: () => toggleMargin(item.id), onDelete: () => deleteMarginConversation(item),
    content: <LabDesktopCard embedded label={item.card!.kind} kind={item.card!.kind} onClose={() => setDesktopOpenId(null)}>
      {item.messages.map(message => <div key={message.id} className={message.role === 'user' ? 'lab-pcard-you' : 'lab-pcard-answer'}>{item.card!.kind === 'define' && message.role === 'assistant' ? <ContextualLookupView answer={parseContextualLookup(message.content)} /> : <LabInlineMarkdown>{message.content}</LabInlineMarkdown>}</div>)}
      {desktopOpenId === item.id && <PhonePassageBody turns={ask.turns.filter(turn => !turn.shownExplanation && turn.conversationId === item.id && (turn.timestamp ?? 0) > item.endTimestamp)} pending={ask.typedLoading} />}
      {continueDiscussionAction(item.id)}
      <PhoneFollowField value={desktopOpenId === item.id ? draft : ''} onChange={setDraft} onSend={question => discussSavedCard(item.id, question, item.card!.text)} onMic={handleMic} micOn={dictation.state !== 'idle'} onTalk={() => { ask.primeVoice(); requestAnimationFrame(() => handleTalk()) }} disabled={ask.typedLoading} />
    </LabDesktopCard>,
  })) : []
  if (continuousReader) for (const live of desktopLiveCards) {
    const id = desktopCardId(live)
    const passage = 'passage' in live ? live.passage : null
    const range = passage?.ranges?.find(part => part.chapterNumber === book.chapterNumber)?.range
    const saved = marginConversations.find(item => item.id === id)
    desktopMarginEntries.push({ id, label: PHONE_CARD_NAMES[live.kind], source: sourceForMargin(range, live.kind === 'chapter-note' || live.kind === 'quiz' && !passage),
      order: live.kind === 'chapter-note' || live.kind === 'quiz' && !passage ? 1e12 : (range?.paragraphIndex ?? 0) * 100000 + (range?.fromWord ?? 0),
      open: desktopOpenId === id, focusEditor: live.kind === 'note' || live.kind === 'chapter-note' || live.kind === 'ask', preview: (live.kind === 'define' ? contextualLookupPreview(saved?.messages.find(message => message.role === 'assistant')?.content || '') : saved?.messages.find(message => message.role === 'assistant')?.content) || (live.kind === 'note' ? highlightsApi.allHighlights.find(mark => mark.id === live.highlightId)?.note : undefined),
      sourceText: passage?.text, free: live.kind === 'chapter-note' || (live.kind === 'note' || live.kind === 'ask') && isSourcePoint(range),
      onToggle: () => toggleMargin(id, live), onDelete: () => {
        if (saved) deleteMarginConversation(saved)
        else if (live.kind === 'note') { const marks = highlightsApi.allHighlights.filter(mark => mark.id === live.highlightId); highlightsApi.remove(live.highlightId); setMarginUndo(() => () => { highlightsApi.restore(marks) }); setDesktopLiveCards(current => current.filter(card => desktopCardId(card) !== id)); setDesktopOpenId(null); setPhoneCard(null) }
        else { if (live.kind === 'chapter-note') { const note = highlightsApi.chapterNotes.find(note => note.chapterNumber === live.chapterNumber)?.note || ''; highlightsApi.setChapterNote(live.chapterNumber, ''); setMarginUndo(() => () => { highlightsApi.setChapterNote(live.chapterNumber, note) }) }; setDesktopLiveCards(current => current.filter(card => desktopCardId(card) !== id)); setDesktopOpenId(null); setPhoneCard(null) }
      }, content: renderPhoneCard(live),
    })
  }
  if (continuousReader) for (const mark of highlightsApi.allHighlights.filter(mark => mark.bookId === (book.bookId || 'bible') && mark.chapterNumber === book.chapterNumber && (!mark.editionKey || mark.editionKey === readerEditionKey) && !!mark.note && mark.kind !== 'chapter')) {
    const id = `highlight:${mark.id}`
    if (liveIds.has(id)) continue
    const passage: PhonePassage = { text: mark.text || '', paragraphIndex: mark.paragraphIndex, chapterNumber: mark.chapterNumber, chapterLabel: book.chapterLabel, editionKey: mark.editionKey || readerEditionKey, paragraphs: book.paragraphs, ranges: [{ chapterNumber: mark.chapterNumber, range: mark }] }
    const live: PhoneCard = { kind: 'note', passage, highlightId: mark.id, created: false }
    desktopMarginEntries.push({ id, label: 'Note', source: sourceForMargin(mark), order: mark.paragraphIndex * 100000 + mark.fromWord, open: false, preview: mark.note, free: isSourcePoint(mark),
      onToggle: () => { setPhoneNote(mark.note || ''); openPhoneCard(live) }, onDelete: () => { highlightsApi.remove(mark.id); setMarginUndo(() => () => { highlightsApi.restore([mark]) }) }, content: null })
  }
  const saveUnitRailAnswer = (id: string, kind: 'primer' | 'recap' | 'catchup', text: string, chapterNumber = book.chapterNumber) => {
    const existing = ask.conversations.find(item => item.id === id)
    if (!text.trim() || existing?.messages.find(message => message.role === 'assistant')?.content === text) return
    const at = existing?.card?.at ?? Date.now()
    ask.saveCard({ source: userBook ? { kind: 'own-text', bookId: userBook.bookId, ownHex: userBook.hex, converter: userBook.edition.converter, editionKey: ownSourceEditionKey(userBook.edition) as 'own' | 'own-en' | 'own-da' } : { kind: 'catalogue', bookId: book.bookId || 'bible' },
      id: id.replace(/^mc_/, ''), kind, chapterNumber, ...(desktopUnitAnchorsRef.current.has(id) ? {data:{unitAnchor:desktopUnitAnchorsRef.current.get(id)}} : {}), text: '', turns: [{ role: 'assistant', content: text }], at, u: Date.now() })
  }
  const unitRailThread = (id: string) => {
    const saved = marginConversations.find(item => item.id === id)
    return <>
      {saved?.messages.slice(2).map(message => <div key={message.id} className={message.role === 'user' ? 'lab-pcard-you' : 'lab-pcard-answer'}><LabInlineMarkdown>{message.content}</LabInlineMarkdown></div>)}
      {desktopOpenId === id && <PhonePassageBody turns={ask.turns.filter(turn => !turn.shownExplanation && turn.conversationId === id && (turn.timestamp ?? 0) > (saved?.endTimestamp ?? Infinity))} pending={ask.typedLoading} />}
    </>
  }
  if (continuousReader) for (const notes of desktopChapterCards) {
    const id = unitRailId(notes), kind = notes.request.kind === 'end' ? 'recap' : 'primer'
    desktopMarginEntries.push({ id, label: kind === 'recap' ? 'Recap' : 'Primer', source: sourceForMargin(notes.railAnchor, kind === 'recap'), order: kind === 'recap' ? 1e12 - 2 : -2, open: desktopOpenId === id,
      preview: marginConversations.find(item => item.id === id)?.messages.find(message => message.role === 'assistant')?.content,
      onToggle: () => toggleMargin(id), onDelete: () => { const saved = marginConversations.find(item => item.id === id); if (saved) deleteMarginConversation(saved); setDesktopChapterCards(current => current.filter(item => unitRailId(item) !== id)); setDesktopOpenId(null) }, free: true,
      content: <LabChapterNotesSheet embedded request={notes.request} title={notes.title} own={notes.own} onClose={() => setDesktopOpenId(null)} onChat={(title, beats) => continueChapterNotes('chat', title, beats)} onTalk={(title, beats) => continueChapterNotes('talk', title, beats)} readToken={readSupabaseAccessToken}
        onReady={beats => saveUnitRailAnswer(id, kind, chapterNotesText(notes.title, beats), notes.request.chapterNumber)}
        follow={beats => <>{unitRailThread(id)}<PhoneFollowField value={desktopOpenId === id ? draft : ''} onChange={setDraft} onSend={question => { if (beats) saveUnitRailAnswer(id, kind, chapterNotesText(notes.title, beats)); discussSavedCard(id, question) }} onMic={handleMic} micOn={dictation.state !== 'idle'} onTalk={() => continueChapterNotes('talk', notes.title, beats)} disabled={ask.typedLoading} /></>} /> })
  }
  if (continuousReader && desktopCatchup && !userBook) {
    const id = `mc_unit_catchup_${book.chapterNumber}_${readerEditionKey}`
    desktopMarginEntries.push({ id, label: CATCH_UP_TITLE, source: () => sourceForMargin(desktopUnitAnchorsRef.current.get(id))() ?? sourceForFreeUnit(id)(), order: -1, open: desktopOpenId === id, free: true,
      preview: marginConversations.find(item => item.id === id)?.messages.find(message => message.role === 'assistant')?.content,
      onToggle: () => toggleMargin(id), onDelete: () => { const saved = marginConversations.find(item => item.id === id); if (saved) deleteMarginConversation(saved); setDesktopCatchup(false); setDesktopOpenId(null) },
      content: <LabCatchUpSheet embedded bookId={book.bookId || 'bible'} editionKey={readerEditionKey} bookTitle={book.bookTitle} chapters={book.chapters} sections={book.sections} chapterNumber={book.chapterNumber} paragraphIndex={0} completed={false} readToken={readSupabaseAccessToken}
        onClose={() => setDesktopOpenId(null)} onChat={text => continueCatchUp('chat', text)} onTalk={text => continueCatchUp('talk', text)}
        onReady={text => saveUnitRailAnswer(id, 'catchup', text)}
        follow={shown => <>{unitRailThread(id)}<PhoneFollowField value={desktopOpenId === id ? draft : ''} onChange={setDraft} onSend={question => { saveUnitRailAnswer(id, 'catchup', shown()); discussSavedCard(id, question) }} onMic={handleMic} micOn={dictation.state !== 'idle'} onTalk={() => continueCatchUp('talk', shown())} disabled={ask.typedLoading} /></>} /> })
  }
  if (continuousReader) for (const note of highlightsApi.chapterNotes.filter(note => note.chapterNumber === book.chapterNumber)) {
    const id = `chapter-note:${note.chapterNumber}`
    if (liveIds.has(id)) continue
    desktopMarginEntries.push({ id, label: 'Note', source: sourceForMargin(undefined, true), order: 1e12, open: false, preview: note.note, free: true,
      onToggle: () => { setPhoneNote(note.note || ''); openPhoneCard({ kind: 'chapter-note', chapterNumber: note.chapterNumber, chapterLabel: book.chapterLabel }) },
      onDelete: () => { highlightsApi.setChapterNote(note.chapterNumber, ''); setMarginUndo(() => () => { highlightsApi.setChapterNote(note.chapterNumber, note.note || '') }) }, content: null })
  }
  if (continuousReader && desktopCatchup && userBook) {
    const id = `mc_unit_catchup_${book.chapterNumber}_${readerEditionKey}`
    desktopMarginEntries.push({ id, label: CATCH_UP_TITLE, source: () => sourceForMargin(desktopUnitAnchorsRef.current.get(id))() ?? sourceForFreeUnit(id)(), order: -1, open: desktopOpenId === id, free: true,
      preview: marginConversations.find(item => item.id === id)?.messages.find(message => message.role === 'assistant')?.content,
      onToggle: () => toggleMargin(id), onDelete: () => { const saved = marginConversations.find(item => item.id === id); if (saved) deleteMarginConversation(saved); setDesktopCatchup(false); setDesktopOpenId(null) },
      content: <LabOwnCatchUpSheet embedded bookHex={userBook.hex} bookTitle={book.bookTitle} chapters={userBook.edition.chapters} chapterNumber={book.chapterNumber} paragraphIndex={0} completed={false} readToken={ownCatchUpToken}
        onClose={() => setDesktopOpenId(null)} onChat={text => continueCatchUp('chat', text)} onTalk={text => continueCatchUp('talk', text)} onReady={text => saveUnitRailAnswer(id, 'catchup', text)}
        follow={shown => <>{unitRailThread(id)}<PhoneFollowField value={desktopOpenId === id ? draft : ''} onChange={setDraft} onSend={question => { saveUnitRailAnswer(id, 'catchup', shown()); discussSavedCard(id, question) }} onMic={handleMic} micOn={dictation.state !== 'idle'} onTalk={() => continueCatchUp('talk', shown())} disabled={ask.typedLoading} /></>} /> })
  }
  const openBlankMarginNote = ({ clientY }: { clientY: number; sourceY: number }) => {
    if (desktopOpenId) { toggleMargin(desktopOpenId, desktopLiveCards.find(card => desktopCardId(card) === desktopOpenId)); return }
    const words = [...(marginHost?.querySelectorAll<HTMLElement>('[data-testid="lab-word"]') ?? [])]
    const word = words.find(word => word.getBoundingClientRect().bottom >= clientY) ?? words[words.length - 1]
    if (!word) return
    const paragraphIndex = Number(word.dataset.paragraphIndex), fromWord = Number(word.dataset.wordIndex)
    const range: LabHighlightRange = { paragraphIndex, fromWord, endParagraphIndex: paragraphIndex, toWord: fromWord, text: '' }
    const mark = highlightsApi.addOrReuse(range, lastHighlightColor(), readerEditionKey, book.chapterNumber)
    setPhoneNote('')
    openPhoneCard({ kind: 'note', created: true, highlightId: mark.id, passage: { text: '', paragraphIndex, chapterNumber: book.chapterNumber, chapterLabel: book.chapterLabel, editionKey: readerEditionKey, paragraphs: book.paragraphs, ranges: [{ chapterNumber: book.chapterNumber, range }] } })
  }
  const marginPointerDownRef = useRef({ x: 0, y: 0, cardId: '' })
  useLayoutEffect(() => {
    if (!continuousReader || !marginHost) return
    const active = marginConversations.find(item => item.id === desktopOpenId)
    const range = active?.card?.anchor
    const undoMark = range ? markPhoneCardPassage(marginHost, [{ chapterNumber: active.chapterNumber, range }], book.chapterNumber) : undefined
    const paint = () => {
      for (const word of marginHost.querySelectorAll<HTMLElement>('[data-testid="lab-word"]')) {
        const p = Number(word.dataset.paragraphIndex), w = Number(word.dataset.wordIndex)
        const item = [...marginConversations].reverse().find(item => { const a = item.card?.anchor; return a && p >= a.paragraphIndex && p <= a.endParagraphIndex && (p > a.paragraphIndex || w >= a.fromWord) && (p < a.endParagraphIndex || w < a.toWord) })
        if (item) word.dataset.sourceCardId = item.id
        else delete word.dataset.sourceCardId
      }
    }
    paint()
    let frame = 0
    const observer = new MutationObserver(() => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; paint() }) })
    observer.observe(marginHost, { childList: true, subtree: true })
    const start = (event: PointerEvent) => { marginPointerDownRef.current = { x: event.clientX, y: event.clientY, cardId: (event.target as Element)?.closest<HTMLElement>('[data-source-card-id]')?.dataset.sourceCardId || '' } }
    const click = (event: MouseEvent) => {
      const word = (event.target as Element)?.closest<HTMLElement>('[data-source-card-id]')
      const id = word?.dataset.sourceCardId || marginPointerDownRef.current.cardId
      if (!id || Math.hypot(event.clientX - marginPointerDownRef.current.x, event.clientY - marginPointerDownRef.current.y) > 5) return
      event.preventDefault(); event.stopPropagation(); setSelectionPopup(null)
      const live = desktopLiveCards.find(card => desktopCardId(card) === id)
      toggleMargin(id, live)
    }
    marginHost.addEventListener('pointerdown', start, true); marginHost.addEventListener('click', click, true)
    return () => { undoMark?.(); observer.disconnect(); cancelAnimationFrame(frame); marginHost.removeEventListener('pointerdown', start, true); marginHost.removeEventListener('click', click, true) }
  // Only source identity/open state changes require replacing the hit targets.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuousReader, marginHost, desktopOpenId, marginConversations.map(item => `${item.id}:${item.endTimestamp}`).join('|')])

  const notesOpenedAt = useMemo(() => Date.now(), [chapterNotes])
  const catchUpShown = superSheet === 'catchup'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const catchUpOpenedAt = useMemo(() => Date.now(), [catchUpShown])
  const catchUpFollowProps = {
    follow: (shown: () => string) => pillCardFollow(`catchup:${catchUpOpenedAt}`,
      () => { const text = shown(); if (!text) return false; ask.keepExplanation(CATCH_UP_TITLE, text, Math.max(0, placeRef.current.paragraphIndex), { bookId: book.bookId || 'bible', chapterNumber: book.chapterNumber }); return true },
      () => continueCatchUp('talk', shown())),
    thread: pillCardThread(catchUpOpenedAt),
  }

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
    <MarginPhoneContext.Provider value={marginPills}>
    <div
      ref={labRootRef}
      lang={userBook ? userBookLangAttribute(userBook.edition) : allBookEditions.find(edition => edition.key === readerEditionKey)?.language || 'en'}
      className={`lab ${isPhone ? 'is-phone' : 'is-desktop'}${frontispieceVisible ? ' is-frontispiece' : ''}${showPhoneChrome ? ' has-phone-chrome' : ''}${showPhoneChrome && phoneReaderControlsVisible ? ' has-reader-controls' : ''}${ask.notice ? ' has-notice' : ''}${phoneAskOpen && !marginPhone ? ' has-phone-ask' : ''}${marginPhone ? ' is-margin-phone' : ''}${phoneKeyboardOpen ? ' has-phone-keyboard' : ''}${resolvedDarkMode ? ' is-night' : ''}${prefs.theme === 'book' ? ' is-book-theme' : ''}${fullscreen ? ' is-fullscreen' : ''}${pageTurnAffordance.buttons ? ' has-page-buttons' : ''}`}
      data-testid="lab-root"
      data-shared-reader={sharedReader ? 'true' : undefined}
      data-reading-scroll={readingScrollActive ? 'true' : undefined}
      data-continuous-reader={continuousReader ? 'true' : undefined}
      data-page-turn-zones={pageTurnAffordance.tapZones === 'all' ? undefined : pageTurnAffordance.tapZones}
      data-theme={resolvedTheme}
      data-lab-layout={showPhoneChrome ? 'phone' : 'desktop'}
      data-chrome-state={chrome}
      data-phone-bar={showPhoneBar ? labPhoneBarMode(chrome, peekBook, phoneAskOpen && !marginPhone) : 'none'}
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
      data-chrome-version="v2"
      data-transport={(showPhoneChrome ? audioBarActive : desktopAudioBarActive) ? 'open' : 'closed'}
      data-super-menu={superMenuOpen ? 'open' : 'closed'}
      data-super-sheet={superSheet ?? 'closed'}
      data-voice-history-fixture={voiceHistoryFixture ? 'true' : 'false'}
      data-audio-speed={String(listen.speed)}
      style={{
        ['--lab-font-reader' as string]: labFontFamilyCss(readingFont),
        ['--lab-font-size' as string]: String(readingFontSize),
        ['--lab-text-align' as string]: readingAlignment,
        ['--lab-line-height' as string]: String(labLineHeight(prefs.lineSpacing)),
        ['--lab-reader-margin' as string]: typeof prefs.margins === 'number' ? `${1.55 * prefs.margins}rem` : prefs.margins === 'narrow' ? '1.1rem' : prefs.margins === 'wide' ? '2.2rem' : '1.55rem',
        // The desktop leaves set their side padding from their own measured
        // scale, not from a rem figure sized for the phone, so the Margins
        // preference reaches them as a factor on that scale. Both the painted
        // passage and the hidden measure box read it, so pagination and paint
        // stay in step.
        ['--lab-reader-margin-scale' as string]: String(labMarginScale(prefs.margins)),
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
        {...((showPhoneChrome || desktopPaging) ? {
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
        {/* Desktop: the way back to the library, icon only. The phone keeps
            Library in the t menu and has its own Back. */}
        {!showPhoneChrome && (
          <button
            type="button"
            className="lab-v2-library-back"
            data-testid="lab-library-back"
            aria-label="Back to library"
            title={privateBook ? 'Your books' : 'Library'}
            onClick={() => handleSuperMenuSelect('library')}
          >
            <LibraryBackIcon size={LAB_V2_PLAY_PX} />
          </button>
        )}
        <div
          className="lab-header-brand"
          onClick={showPhoneChrome && !phoneReaderControlsVisible ? () => setReaderControlsVisible(true) : undefined}
        >
          <h1 className="lab-header-work" data-testid="lab-header-work">
            <button
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
            </button>
          </h1>
          <span className="lab-title-sep" aria-hidden="true"> · </span>
          <button
            type="button"
            className="lab-header-chapter"
            data-testid="lab-header-chapter"
            aria-label={paintedChapterLabel ? `Table of contents, ${paintedChapterLabel}` : 'Table of contents'}
            onClick={() => { setReaderControlsVisible(true); setTocOpen(true) }}
          >
            <span className="lab-header-chapter-label">{paintedChapterLabel}</span>
            <span className="lab-header-chevron" aria-hidden="true">∨</span>
          </button>
        </div>
        <div className="lab-header-controls">
          {(!showPhoneChrome || phoneReaderControlsVisible) ? (
            <>
              {!isPhone && <button type="button" className="lab-header-notebook" data-testid="lab-header-notebook"
                aria-label="Notebook" title="Notebook"
                onClick={() => handleSuperMenuSelect('notebook')}><ReaderNotebookIcon /></button>}
              {(!privateBook || ownNarration) && <button
                type="button"
                className="lab-v2-play"
                data-testid="lab-v2-play"
                aria-label={narrationInfo?.loading ? 'Loading audio options' : listen.pending ? 'Cancel audio loading' : listen.playing ? LAB_COPY.pause : LAB_COPY.play}
                disabled={narrationInfo?.loading === true}
                aria-busy={narrationInfo?.loading || listen.pending || undefined}
                onClick={handleBarListen}
              >
                {narrationInfo?.loading || listen.loading || listen.buffering ? <LoadingIcon size={LAB_V2_PLAY_PX} /> : listen.playing && !listen.pending ? <PauseIcon size={LAB_V2_PLAY_PX} /> : <PlayIcon size={LAB_V2_PLAY_PX} />}
              </button>}
              {!showPhoneChrome && <button type="button" className="lab-v2-aa" data-testid="lab-header-aa"
                aria-label="Reading appearance" title="Reading appearance"
                onClick={() => { setSuperMenuOpen(false); setCompareFromLayout(false); setSuperSheet('reading') }}>Aa</button>}
              <LabSuperButton
                open={superMenuOpen}
                onToggle={handleSuperToggle}
                firstView={superFirstView}
                onFirstViewEnd={handleFirstViewEnd}
                reducedMotion={reducedMotion}
              />
            </>
          ) : null}
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
        current={{ bookId: book.bookId || 'bible', title: book.bookTitle, chapterLabel: paintedChapterLabel, ...currentSwitcherCover(book.bookId || 'bible', userBook), coverTone: userBook ? null : getBook(book.bookId || 'bible')?.coverColor ?? null }}
        rows={bookSwitcherRows}
        loading={bookSwitcherLoading}
        error={bookSwitcherError}
        onClose={() => setBookSwitcherOpen(false)}
        onSelect={switchQuickBook}
        onLibrary={() => { setBookSwitcherOpen(false); handleSuperMenuSelect('library') }}
      />}
      {!frontispieceVisible && (
        <LabSuperMenu
          open={superMenuOpen}
          phone={showPhoneChrome}
          privateBook={privateBook}
          ownPdf={ownEditions}
          sharedReader={sharedReader}
          profileDot={profileDot}
          onSelect={handleSuperMenuSelect}
          onClose={() => setSuperMenuOpen(false)}
        />
      )}
      {!frontispieceVisible && (
        <LabV2Sheet
          bookId={book.bookId || 'bible'}
          chapterNumber={book.chapterNumber}
          layer={superSheet}
          onLayer={layer => { setSuperSheet(layer); if (layer !== 'compareEdition') setCompareFromLayout(false) }}
          onClose={() => { setSuperSheet(null); setCompareFromLayout(false) }}
          prefs={displayPrefs}
          phoneShakespeare={phoneShakespeare}
          onPrefs={sheetPrefs}
          ownPdf={ownEditions}
          editionRows={!privateBook || ownEditions}
          editions={bookEditions}
          audioEditions={matchingAudioEditions(prefs.primaryEdition, bookEditions).filter(edition => !isAudioHeld(book.bookId || 'bible', edition.key))}
          compare={(showPhoneChrome ? mobileCompareEnabled : desktopCompareEnabled)
            ? { active: showPhoneChrome ? mobileCompareActive : desktopCompareActive, onToggle: () => { setSuperSheet(null); (showPhoneChrome ? toggleMobileCompareByReader : toggleDesktopCompareByReader)() } }
            : null}
          margin={!showPhoneChrome && !userBook && marginPreviewOptedIn() && isMarginPreviewBook(getBook(book.bookId || 'bible'))
            ? { onOpen: () => {
                const bookId = book.bookId!
                notePlace('hide')
                window.location.assign(marginPreviewReturnHref(bookId, { editionKey: prefs.primaryEdition, chapterNumber: book.chapterNumber, paragraphIndex: placeRef.current.paragraphIndex, wordIndex: placeRef.current.wordIndex }))
              } }
            : null}
          pdfSource={sharedReader && ownPdf ? {onOriginalPages:()=>openPdfPages()} : undefined}
          readerLayout={sharedReader && !showPhoneChrome
            ? { active: desktopCompareActive ? 'compare' : continuousReader ? 'margin' : 'two-page',
                compareAvailable: desktopCompareChoiceAvailable,
                onChoose: chooseSharedDesktopLayout }
            : null}
          compareFromLayout={compareFromLayout}
          compareUnavailable={!prefs.compareOpen ? false : unalignedCompare ? 'paragraphs' : compareChapterMissing ? 'chapter' : compareNumberingDiffers ? 'numbering' : !showPhoneChrome && pairedCompareUnavailable ? 'verses' : false}
          narrationPilot={{ info: narrationInfo, voice: narrationVoice }}
          onAccountVoice={signedIn ? undefined : () => { setSuperSheet(null); setAccountPrompt({ action: 'audio' }) }}
          modernOffer={signedIn && modern.status?.offer && !bookEditions.some(edition => edition.key === MODERN_EDITION_KEY)
            ? { price: formatModernPrice(modern.status.offer.cents), busy: modernCheckoutBusy, onBuy: () => { void buyModernEdition() } }
            : undefined}
        />
      )}
      {figureCard && (
        <LabFigureCard figure={figureCard} onClose={() => setFigureCard(null)}
          onExplain={explainFigure} onAsk={askAboutFigure}
          onShowPage={ownPdf && figureCard.chapterNumber != null && figureCard.paragraphIndex != null
            ? figure => openPdfPages({ chapterNumber: figure.chapterNumber!, paragraphIndex: figure.paragraphIndex!, wordIndex: 0 })
            : undefined} />
      )}
      {!frontispieceVisible && superSheet === 'catchup' && userBook && (
        // A reader's own book: one cumulative recap, built from this device's text a chapter at a time.
        <LabOwnCatchUpSheet
          bookHex={userBook.hex} bookTitle={book.bookTitle}
          chapters={userBook.edition.chapters}
          chapterNumber={book.chapterNumber} paragraphIndex={Math.max(0, placeRef.current.paragraphIndex)}
          completed={finishedChapters.has(book.chapterNumber)}
          readToken={ownCatchUpToken}
          onClose={() => setSuperSheet(null)}
          onChat={text => continueCatchUp('chat', text)}
          onTalk={text => continueCatchUp('talk', text)}
          onTopUp={() => setSuperSheet('account')}
          {...(showPhoneChrome ? catchUpFollowProps : {})}
        />
      )}
      {!frontispieceVisible && superSheet === 'catchup' && !continuousReader && !userBook && !book.chaptersProvisional && (
        // Read-only over the reader: it takes the place once, at open, and never writes one.
        <LabCatchUpSheet
          bookId={book.bookId || 'bible'} editionKey={readerEditionKey} bookTitle={book.bookTitle}
          chapters={book.chapters} sections={book.sections}
          chapterNumber={book.chapterNumber} paragraphIndex={Math.max(0, placeRef.current.paragraphIndex)}
          completed={finishedChapters.has(book.chapterNumber)}
          form={getLibraryMeta(book.bookId || 'bible')?.form ?? null}
          readToken={readSupabaseAccessToken}
          onClose={() => setSuperSheet(null)}
          onChat={text => continueCatchUp('chat', text)}
          onTalk={text => continueCatchUp('talk', text)}
          onTopUp={() => setSuperSheet('account')}
          card={marginPhone ? { label: phoneCardLabel(CATCH_UP_TITLE) } : undefined}
          {...(showPhoneChrome ? catchUpFollowProps : {})}
        />
      )}
      {!frontispieceVisible && chapterNotes && !continuousReader && (
        <LabChapterNotesSheet
          key={JSON.stringify(chapterNotes.request)}
          request={chapterNotes.request}
          own={chapterNotes.own}
          title={chapterNotes.title}
          onClose={() => setChapterNotes(null)}
          onChat={(title, beats) => continueChapterNotes('chat', title, beats)}
          onTalk={(title, beats) => continueChapterNotes('talk', title, beats)}
          readToken={readSupabaseAccessToken}
          onTopUp={() => { setChapterNotes(null); setSuperSheet('account') }}
          card={marginPhone}
          {...(showPhoneChrome ? {
            follow: (beats: ChapterNotesBeat[] | null) => pillCardFollow(`notes:${notesOpenedAt}`,
              () => { if (!beats) return false; ask.keepExplanation(chapterNotes.title, chapterNotesText(chapterNotes.title, beats), Math.max(0, placeRef.current.paragraphIndex), { bookId: chapterNotes.request.bookId, chapterNumber: chapterNotes.request.chapterNumber }); return true },
              () => continueChapterNotes('talk', chapterNotes.title, beats)),
            thread: pillCardThread(notesOpenedAt),
          } : {})}
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
          {privateBook ? <a href={USER_BOOKS_SHELF_URL}>Return to your books</a> : <a href="/library">Return to the library</a>}
        </div>
      )}


      <div className="lab-body">
        {!(showPhoneChrome && phoneAsk && !marginPhone) && (
        <div
          className={`lab-page-wrap${showPhoneChrome && !measuredPaging && settleIndex != null && settleIndex <= readingPageIndex ? ' is-measuring-visible-page' : ''}${initialResolving ? ' is-resolving' : ''}${firstReveal ? ' is-first-reveal' : ''}${showPhoneChrome && mobileCompareEnabled ? ' can-swap' : ''}`}
          ref={pageWrapRef}
          data-testid="lab-page-wrap"
          aria-busy={initialResolving || undefined}
        >
          {desktopCompareActive && <div className="lab-compare-divider" aria-hidden="true"><span>Compare</span></div>}
          {modern.wait && !readerLoadError && !chapterCoverTitle && (
            <LabModernWait
              wait={modern.wait}
              bookTitle={book.bookTitle}
              chapterTitle={book.chapterTitle}
              onReadOriginal={() => {
                // The edition toggle, to the original (paragraph-aligned: the place is kept).
                const original = editionCommand('original')
                modern.readOriginal()
                if (original && prefs.primaryEdition !== original.key) updatePrefs({ ...prefs, primaryEdition: original.key, compareOpen: prefs.compareOpen && prefs.compareEdition !== original.key })
              }}
            />
          )}
          {/* Reading the original meanwhile, the folio names it (readingFootLabel); once Modern
              English is ready here, one notice switches (dismissed for this chapter: the folio stays). */}
          {modern.originalNote === 'ready' && modernNoteDismissed !== `${book.bookId}:${book.chapterNumber}` && !modern.wait && !readerLoadError && !chapterCoverTitle && (
            <LabModernReadyNotice
              onDismiss={() => setModernNoteDismissed(`${book.bookId}:${book.chapterNumber}`)}
              onSwitch={() => {
                const modernEdition = editionCommand('modern')
                modern.backToModern()
                if (modernEdition) updatePrefs({ ...prefs, primaryEdition: modernEdition.key, compareOpen: prefs.compareOpen && prefs.compareEdition !== modernEdition.key })
              }}
            />
          )}
          {/* The version just swapped to, named for about a second and then
              gone. It sits on the page the reader landed on, every swap, and
              never stays: the page carries no running head. */}
          {showPhoneChrome && versionPill && (
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
              title={chapterCoverTitle}
              series={book.bookTitle}
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
          ) : continuousReader ? (initialResolving || handoffWritesSuspended ? null : <ContinuousReader
            cards={marginConversations.flatMap(item => item.card?.anchor ? [{ id: item.id, paragraphIndex: item.card.anchor.paragraphIndex, wordIndex: item.card.anchor.fromWord,
              label: `${item.card.kind.charAt(0).toUpperCase() + item.card.kind.slice(1)} · ${item.card.text || book.chapterLabel}`, onOpen: () => toggleMargin(item.id) }] : [])}
            bookMap={(book.bookId || 'bible') === 'bible' ? undefined : { chapters: book.chapters, chapterNumber: book.chapterNumber, onJumpChapter: (number, anchor) => { if (anchor) openContentsPassage({ chapterNumber: number, ...anchor }); else void goToChapter(number, 'start') } }}
            key={`${continuousEpoch.bookId}/${continuousEpoch.editionKey}/${continuousEpoch.chapterNumber}/${continuousEpoch.navigation}`}
            epoch={continuousEpoch}
            anchor={continuousAnchor}
            onVisible={onContinuousVisible}
            onLanded={onContinuousLanded}
            onUserBrowse={() => {
              if (!listen.playing) return
              browseWhileListeningRef.current = true
              setBrowseWhileListening(true)
            }}
            passage={{
              chapterTitle: book.chapterTitle,
              paragraphs: book.paragraphs,
              chapterNumber: book.chapterNumber,
              footnotes: chapterFootnotes,
              onFootnote: showFootnote,
              onOpenFigure: setFigureCard,
              highlights: highlightsApi.chapterHighlights,
              selectingRange: selectionPopup?.chapterNumber === book.chapterNumber ? selectionPopup.range : null,
              onSelectRange: handleSelectRange,
              onSelectingChange: handleSelectingChange,
              onPreviewChapter: () => openChapterNotes('primer', book.chapterNumber, 'pill'),
              chapterActionsBusy: ask.typedLoading,
              chapterEnd: <LabChapterEnd chapterTitle={book.chapterTitle}
                hasNext={nextLabChapter(book.chapters, book.chapterNumber) != null}
                onContinue={goNext} busy={false}
                onDiscuss={() => openChapterNotes('end', book.chapterNumber, 'pill')}
                onNote={pill => openChapterNoteRef.current(book.chapterNumber, pill)}
                finishedCard={finishedCard} />,
              follow: listen.follow,
              followParagraphs: listen.followParagraphs,
              playing: listen.playing,
              browseWhileListening,
              onSeekToWord: listen.playing || listen.pending ? seekAudioToWord : undefined,
              inlineHearingPaint: showHearing && listen.playing,
              markedIndexes,
              onMark: handleMark,
              focusParagraph,
              discussedParagraph: desktopVoiceOpen ? callParagraph : null,
              layoutKey: readerLayoutKey,
            }}
          />) : <LabPassage
            plannedHyphens={measuredPaging && !desktopPaging}
            pendingLayout={measuredPaging && ((nativeMeasuredContent !== readerParagraphs && nativeHeadContent !== readerParagraphs) || desktopPaging && desktopMeasuredKey !== desktopLayoutKey)}
            onPreviewChapter={() => openChapterNotes('primer', book.chapterNumber, 'pill')}
            chapterActionsBusy={ask.typedLoading}
            chapterEnd={showChapterEnd ? <LabChapterEnd
              chapterTitle={book.chapterTitle}
              docked={desktopPaging && desktopEndInFooter}
              hasNext={nextLabChapter(book.chapters, book.chapterNumber) != null} onContinue={goNext}
              busy={false} onDiscuss={() => openChapterNotes('end', book.chapterNumber, 'pill')}
              onNote={pill => openChapterNoteRef.current(book.chapterNumber, pill)}
              finishedCard={finishedCard}
            /> : undefined}
            desktopSpread={desktopSpread}
            selectionChapters={desktopSpread && !desktopCompareActive ? selectionChapters : undefined}
            onCrossChapterSelect={desktopSpread && !desktopCompareActive ? selectAcrossChapters : undefined}
            onCrossChapterSelecting={setCrossSelecting}
          nextChapterOpening={showChapterEnd && nextChapterOpening ? {
              ...nextChapterOpening,
              highlights: highlightsApi.highlights,
              selectingRange: crossChapterRange(nextChapterOpening.chapterNumber) ?? (selectionPopup?.range && selectionPopup.chapterNumber === nextChapterOpening.chapterNumber ? { ...selectionPopup.range, lookupWord: popupMode === 'define' ? selectionPopup.defineText : undefined } : null),
              onSelectRange: (range, x, y, side, intent, id) => handleSelectRange(range, x, y, side, intent, id, {
                chapterNumber: nextChapterOpening.chapterNumber, chapterLabel: nextChapterOpening.title, paragraphs: nextChapterOpening.paragraphs,
              }),
              onPrimer: privateBook ? undefined : () => openChapterNotes('primer', nextChapterOpening.chapterNumber),
            } : undefined}
            previousChapterEnding={openingOnRight && carriedEndingCurrent ? {
              ...carriedEndingCurrent, highlights: highlightsApi.highlights,
              selectingRange: crossChapterRange(carriedEndingCurrent.chapterNumber) ?? (selectionPopup?.chapterNumber === carriedEndingCurrent.chapterNumber ? selectionPopup.range : null),
              onSelectRange: (range, x, y, side, intent, id) => handleSelectRange(range, x, y, side, intent, id, {
                chapterNumber: carriedEndingCurrent.chapterNumber, chapterLabel: carriedEndingCurrent.title, paragraphs: carriedEndingCurrent.paragraphs,
              }),
            } : undefined}
            nextReadingPage={desktopSpread && !openingOnRight ? readingPages[readingPageIndex + 1] : undefined}
            alignCompare={desktopPaging}
            chapterTitle={book.chapterTitle}
            paragraphs={readerParagraphs}
            compareParagraphs={book.compareParagraphs}
            compare={desktopCompareActive && desktopCompareEnabled}
            mode="reading"
            follow={(showHearing && listen.playing || pausedTransportVisible && !listen.playing && !mobileCompareActive) ? listen.follow : { kind: 'none' }}
            followParagraphs={listen.followParagraphs}
            clips={listen.clips}
            playing={listen.playing}
            clipIndex={listen.clipIndex}
            currentTime={listen.currentTime}
            speed={listen.speed}
            browseWhileListening={browseWhileListening}
            inlineHearingPaint={pausedTransportVisible && !listen.playing && !mobileCompareActive || showHearing && listen.playing}
            onSeekToWord={listen.playing || listen.pending || (pausedTransportVisible && !mobileCompareActive) ? seekAudioToWord : undefined}
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
            peek={chrome === 'hearing' && peekBook}
            readingPage={readingPage}
            chapterPages={readingPages}
            layoutKey={readerLayoutKey}
            highlights={mobileCompareActive ? highlightsApi.compareHighlights : highlightsApi.chapterHighlights}
            keyboardSelection
            compareHighlights={highlightsApi.compareHighlights}
            chapterNumber={book.chapterNumber}
            footnotes={chapterFootnotes}
            onFootnote={showFootnote}
            onOpenFigure={setFigureCard}
            selectingRange={crossChapterRange(book.chapterNumber) ?? (selectionPopup?.range && selectionPopup.chapterNumber === book.chapterNumber ? { ...selectionPopup.range, lookupWord: popupMode === 'define' ? selectionPopup.defineText : undefined } : null)}
            selectingComparison={desktopCompareActive && selectionPopup?.side === 'compare'}
            tapZones={pageTurnAffordance.tapZones}
            onSelectRange={phoneAsk ? undefined : handleSelectRange}
            onSelectingChange={phoneAsk ? undefined : handleSelectingChange}
            onSelectionPageTurn={!phoneAsk && !selectionPopup && !mobileCompareActive && !desktopCompareActive ? direction => { if (direction > 0) goNext(); else goPrev() } : undefined}
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
            onCompareSwap={showPhoneChrome && mobileCompareEnabled && !phoneAsk && !selectionPopup
              ? toggleMobileCompareByReader
              : undefined}
            onToggleControls={showPhoneChrome && !phoneAsk && !selectionPopup
              ? () => setReaderControlsVisible(visible => !visible)
              : undefined}
          />}
          {desktopPaging && !chapterCoverTitle && !initialResolving && desktopMeasuredKey === desktopLayoutKey && nativeMeasuredContent === readerParagraphs && <div className="lab-desktop-page-footers" data-testid="lab-desktop-page-footers">
            <span>{desktopCompareActive && <b>{bookEditions.find(edition => edition.key === prefs.primaryEdition)?.style === 'original' ? 'Original' : 'Read'} · {primaryEditionLabel}</b>}<span>{labPageFolio(openingOnRight && carriedEndingCurrent ? carriedEndingCurrent.folio : bookPageEstimate.page)}</span></span>
            <span>{desktopCompareActive ? <><b>{editionLabelFor(prefs.compareEdition, allBookEditions).replace(/^Modern English$/i, 'Tinct Modern English')}</b><span>{labPageFolio(bookPageEstimate.page)}</span></> : openingOnRight ? <span>{labPageFolio(bookPageEstimate.page)}</span> : chapterProgress.currentPage < chapterProgress.totalPages ? <span>{labPageFolio(bookPageEstimate.page + 1)}</span> : null}</span>
          </div>}
          {!chapterCoverTitle && measuredPaging && !desktopPaging && (
            <LabNativePaginator
              fillPages
              chapterActions hasNextChapter={canNextChapter}
              chapterTitle={book.chapterTitle}
              paragraphs={readerParagraphs}
              editionKey={readerEditionKey}
              layoutKey={layoutKeyFor(readerEditionKey)}
              keepPages={pageFreeze && pageFreeze.content === readerParagraphs && pageFreeze.layoutKey === nativeLayoutKey ? pageFreeze.pages : undefined}
              // The reader's first page of this visit: shown before the rest
              // of its chapter is laid out (applyNativePages takes it only
              // when that page is where the reader lands).
              headFirst={!firstPageShown && !mobileCompareActive}
              onPages={applyNativePages}
            />
          )}
          {!chapterCoverTitle && desktopPaging && <LabDesktopPaginator
            chapterActions hasNextChapter={canNextChapter}
            chapterTitle={book.chapterTitle} paragraphs={readerParagraphs}
            comparison={desktopCompareActive && desktopCompareEnabled ? book.compareParagraphs : undefined}
            editionKey={readerEditionKey}
            layoutKey={desktopLayoutKey} onPages={applyDesktopPages}
          />}
          {/* The next chapter's first leaf, measured only near this chapter's end. */}
          {!chapterCoverTitle && nextOpeningCurrent && readingPages.length > 0 && readingPageIndex >= readingPages.length - 4 && <LabDesktopPaginator
            chapterActions hasNextChapter pageLimit={2}
            chapterTitle={nextOpeningCurrent.title} paragraphs={nextOpeningCurrent.paragraphs}
            editionKey={readerEditionKey}
            layoutKey={nextOpeningLayoutKey} onPages={applyNextOpeningPages}
          />}
          {/* The standby edition, measured in the same box while nobody is
              looking at it. It writes a ref and touches no state, so it can
              never paint; the swap reads it and commits the incoming page in
              one go instead of showing an estimate and correcting it. */}
          {/* After the reader's own map is whole: a head-first chapter lays its rest out first. */}
          {!chapterCoverTitle && measuredPaging && mobileCompareEnabled && standbyParagraphs.length > 0 && !headFirstOnScreen && (
            <LabNativePaginator
              fillPages
              chapterActions hasNextChapter={canNextChapter}
              chapterTitle={book.chapterTitle}
              paragraphs={standbyParagraphs}
              layoutKey={standbyKey}
              onPages={applyStandbyPages}
            />
          )}
          {!continuousReader && !chapterCoverTitle && !measuredPaging && settleIndex != null && draftPages[settleIndex] && (
            <div
              className="lab-page-measure"
              ref={measureHostRef}
              aria-hidden="true"
              key={`${settleIndex}-${draftPages[settleIndex].from}-${draftPages[settleIndex].to}`}
            >
              <LabPageMeasurePaint
                chapterActions
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
            view={callView}
            getAssistantLevel={ask.getAssistantLevel}
            reducedMotion={reducedMotion}
            notice={ask.notice}
            onMuteToggle={toggleCallMute}
            onEnd={endCall}
            onReconnect={reconnectCall}
            onMinimize={() => setCallMinimized(true)}
            talkSpeed={ask.talkSpeed}
            onTalkSpeedChange={ask.setTalkSpeed}
          />
        )}
        {desktopVoiceOpen && callMinimized && (
          <LabVoicePill
            view={callView}
            getAssistantLevel={ask.getAssistantLevel}
            reducedMotion={reducedMotion}
            onMuteToggle={toggleCallMute}
            onEnd={endCall}
            onReconnect={reconnectCall}
            onExpand={() => setCallMinimized(false)}
          />
        )}
        {((!showPhoneChrome && desktopAskOpen && !desktopVoiceOpen) || (phoneAsk && !marginPhone)) && askPaneElement}
      </div>

      <span className="lab-visually-hidden" role="status" aria-live="polite">{listen.loading ? 'Loading audio. Tap Play again to cancel.' : listen.buffering ? 'Loading audio.' : ''}</span>
      {!frontispieceVisible && <div className="lab-bottom-chrome" ref={bottomChromeRef} data-testid="lab-bottom-chrome" onPointerDown={() => { if (desktopPaging) setReaderControlsVisible(true) }}>
      {listen.narration.status === 'loading' && listen.narration.waiting && listen.pending && <div className="lab-narration-inline" role="status" data-testid="lab-narration-preparing">
        {/* The ring the Play button shows, in the row; "Preparing narration…" stays for screen readers. */}
        <LabWait label={LAB_COPY.preparingNarration} size={18} live={false} testId="lab-narration-preparing-wait" />
        <button type="button" data-testid="lab-narration-cancel" onClick={listen.pause}>Cancel</button>
      </div>}
      {listen.narration.status === 'error' && listen.narration.reason !== 'unauthenticated' && listen.narration.reason !== 'own_book_premium' && <div className="lab-narration-inline" role="status" data-testid="lab-narration-error">
        <span title={listen.narration.message} aria-label={listen.narration.message}>{listen.narration.reason === 'unauthenticated'
          ? listen.narration.message
          : listen.narration.reason === 'budget_exhausted' ? 'Daily narration limit reached.'
          : listen.narration.reason === 'text_mismatch' ? 'Passage changed. Reload to play.'
          : listen.narration.reason === 'own_book_limit' || listen.narration.reason === 'own_book_unavailable' ? listen.narration.message
          : 'Audio couldn’t start.'}</span>
        <button type="button" data-testid="lab-narration-retry" onClick={listen.retryNarration}>Retry</button>
        <button type="button" onClick={listen.dismissNarration} aria-label="Dismiss audio error">×</button>
      </div>}
      {notebookReturn && notebookReturn.bookId === (book.bookId || 'bible') && notebookReturn.editionKey === prefs.primaryEdition
        && !initialResolving && !contentsTarget && !tocOpen && !phoneAsk && !desktopAskOpen && !notebookCard && (
        <button type="button" className="lab-back-to-audio" data-testid="lab-notebook-return" onClick={() => {
          setNotebookFlash(null)
          openContentsPassage(notebookReturn)
          setNotebookReturn(null)
        }}>Back to reading</button>
      )}
      {recentChapterReturn && !initialResolving && !contentsTarget && !phoneAsk && !desktopAskOpen
        && !mobileCompareActive && !listen.playing && readingPageIndex === 0
        && recentChapterReturn.libraryBookId === (book.bookId || 'bible')
        && recentChapterReturn.sequentialChapter === book.chapterNumber
        && recentChapterReturn.paragraphIndex < book.paragraphs.length
        && (!recentChapterReturn.primaryEditionKey || recentChapterReturn.primaryEditionKey === prefs.primaryEdition) && (
        <button type="button" className="lab-back-to-audio" data-testid="lab-continue-chapter" onClick={() => {
          openContentsPassage({ chapterNumber: book.chapterNumber, paragraphIndex: recentChapterReturn.paragraphIndex, wordIndex: recentChapterReturn.wordIndex })
        }}>Continue from last position</button>
      )}
      {browseWhileListening && listen.playing && !phoneAsk && listen.follow.kind !== 'none' && (
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
      {showReaderRail && !continuousReader && (
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
              onClick={toggleReaderProgressMode}
            >
              {mobileCompareActive ? (
                <span className="lab-chapter-progress-info lab-v2-compare-mark" data-testid="lab-v2-compare-mark">{editionLabelFor(prefs.compareEdition, allBookEditions).replace(/^Modern English$/i, 'Tinct Modern English')}</span>
              ) : (
                <span className="lab-chapter-progress-info" data-original={modern.originalNote ? true : undefined}>{readingFootLabel}</span>
              )}
            </button>
          ) : (
            <button type="button"
              className="lab-chapter-progress is-interactive"
              data-testid="lab-chapter-progress"
              aria-label={`${footProgressLabel}. Show ${readerProgressMode === 'book' ? 'chapter' : 'book'} progress`}
              onClick={toggleReaderProgressMode}
            >
              <span className="lab-chapter-progress-info" data-original={modern.originalNote ? true : undefined}>{readingFootLabel}</span>
            </button>
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
        <section ref={desktopDockRef} className="lab-desktop-audio-dock" data-testid="lab-desktop-audio-dock" aria-label="Audio player">
          <button type="button" className="lab-desktop-audio-speed" data-testid="lab-hearing-speed" onClick={() => setSpeedPopoverOpen(open => !open)} aria-label={`Playback speed ${listen.speed} times`} aria-expanded={speedPopoverOpen}>{listen.speed}×</button>
          <button type="button" data-testid="lab-hearing-back" onClick={() => listen.seek(-15)} aria-label="Back 15 seconds"><SkipIcon direction="back" /></button>
          <button type="button" className="is-primary" data-testid="lab-hearing-pause" onClick={handleHeaderListen} aria-busy={listen.pending || undefined} aria-label={listen.pending ? 'Cancel audio loading' : !listen.playing ? 'Resume audiobook' : LAB_COPY.pause}>{listen.loading || listen.buffering ? <LoadingIcon size={22} /> : listen.pending || !listen.playing ? <PlayIcon size={22} /> : <PauseIcon size={22} />}</button>
          <button type="button" data-testid="lab-hearing-forward" onClick={() => listen.seek(30)} aria-label="Forward 30 seconds"><SkipIcon direction="forward" seconds={30} /></button>
          <div className="lab-desktop-audio-track">
            <strong>{book.bookTitle}</strong>
            {/* Every Tinct voice is synthetic: the dock says so beside the edition (AI Act art. 50). */}
            <span data-testid="lab-audio-ai-label">{`${editionLabelFor(narrationOption || retainedBella ? prefs.primaryEdition : audioEditionKey, bookEditions)} · ${LAB_COPY.aiNarration}`}</span>
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
          <button type="button" data-testid="lab-audio-talk" aria-label="Talk about this book" onClick={handleTalk}><TalkIcon size={22} /></button>
          {!listen.playing && !listen.pending && listen.narration.status !== 'error' && <button type="button" className="lab-desktop-audio-dismiss" aria-label="Close audio controls"
            onClick={() => { setPausedTransportVisible(false); setSpeedPopoverOpen(false) }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg></button>}
        </section>
      )}

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
            <button type="button" className="lab-audio-speed-done" onClick={() => setSpeedPopoverOpen(false)}>Done</button>
          </div>
          <input
            id="lab-audio-speed-slider"
            className="lab-v2-slider"
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

      {ask.notice && !(showPhoneChrome ? phoneAsk : desktopAskOpen) && !callOpen && (
        <aside className="lab-v2-notice" role="alert" data-testid="lab-voice-notice">
          <p>{ask.notice}</p>
          <button type="button" className="lab-v2-notice-dismiss" onClick={ask.dismissNotice} aria-label="Dismiss message">×</button>
          {/balance|credit|messages remaining|top up/i.test(ask.notice) && (
            <button type="button" onClick={() => setSuperSheet('account')}>View account</button>
          )}
        </aside>
      )}
      {showPhoneBar && (
        <footer className={`lab-phone-bar${phonePausedCloseAllowed ? ' is-swipe-closable' : ''}`} data-testid="lab-phone-bar" ref={phoneBarSwipe.ref} {...phoneBarSwipe.handlers}>
          <div className={`lab-phone-bar-row ${audioBarActive ? 'is-audio has-5' : `is-read ${mobileCompareEnabled ? 'has-4' : 'has-3'}`}`}>
            {audioBarActive ? (
              // Speed · back · pause · forward · Talk, with the pause where a
              // thumb sits.
              <>{(['speed', 'back', 'pause', 'forward', 'talk'] as const).map(control => ({
                pause: (
                  <button key="pause" type="button" className="lab-phone-fat lab-audio-control is-active" onClick={handleBarListen} aria-busy={listen.pending || undefined} aria-label={listen.pending ? 'Cancel audio loading' : listen.playing ? 'Pause audiobook' : 'Resume audiobook'} data-testid="lab-listen">
                    <span data-testid="lab-hearing-pause" className="lab-visually-hidden">{!listen.playing ? 'Resume' : LAB_COPY.pause}</span>
                    {listen.loading || listen.buffering ? <LoadingIcon size={21} /> : listen.pending || !listen.playing ? <PlayIcon size={21} /> : <PauseIcon size={21} />}
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
                  aria-label={narrationInfo?.loading && !mobileCompareActive && !barReturnsFromConversation ? 'Loading audio options' : listen.pending ? 'Cancel audio loading' : barPrimaryLabel}
                  disabled={narrationInfo?.loading === true && !mobileCompareActive && !barReturnsFromConversation}
                  aria-busy={narrationInfo?.loading && !mobileCompareActive && !barReturnsFromConversation || listen.pending || undefined}
                  data-reader-action={mobileCompareActive ? 'read' : 'listen'}
                  data-testid="lab-listen"
                >
                  {mobileCompareActive || (barReturnsFromConversation && returnTo === 'reading') ? (
                    <span data-testid="lab-reader-primary-read-icon" aria-hidden="true">
                      <ReadIcon size={18} />
                    </span>
                  ) : (
                    <span className="lab-header-play" data-testid="lab-listen-play" aria-hidden="true">
                      {narrationInfo?.loading || listen.loading ? <LoadingIcon size={18} /> : <PlayIcon size={18} />}
                    </span>
                  )}
                  {barPrimaryLabel}
                </button>
                {mobileCompareEnabled && (
                  <button
                    type="button"
                    className={`lab-phone-fat ${mobileCompareActive ? 'is-active' : ''}`}
                    onClick={toggleMobileCompareByReader}
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
          {/* The paused player's grab handle, centred above it: a tap closes
              it, as does a swipe down on the bar. */}
          {phonePausedCloseAllowed && <button
            type="button" className="lab-audio-handle" data-testid="lab-audio-handle" aria-label="Close audio controls"
            onClick={closePausedTransport}
          />}
        </footer>
      )}
      </div>}

      <LabVoiceActionPanel
        active={ask.voiceActive && !callOpen}
        view={voiceLabView}
        darkMode={resolvedDarkMode}
        fontSize={readingFontSize}
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
      <LabAccountSheet
        open={accountPrompt !== null}
        action={accountPrompt?.action ?? 'chat'}
        returnTo={signInReturnTo}
        onClose={closeAccountPrompt}
        desktop={!showPhoneChrome}
      />

      <LabContentsV2
        onSwitchBook={openBookSwitcher}
        open={tocOpen}
        bookId={book.bookId || 'bible'}
        title={book.bookTitle}
        editionKey={prefs.primaryEdition}
        editionLabel={primaryEditionLabel}
        chapters={book.chapters}
        chaptersReady={!book.chaptersProvisional}
        sections={book.sections}
        figures={book.figures}
        currentChapter={book.chapterNumber}
        currentPage={chapterProgress.currentPage}
        totalPages={chapterProgress.totalPages}
        currentPercent={chapterProgress.percent}
        statuses={pickerStatuses}
        modernStates={prefs.primaryEdition === MODERN_EDITION_KEY && modern.status?.state === 'paid' ? modern.status.chapters : undefined}
        conversations={ask.conversations}
        historyStatus={ask.historyStatus}
        highlights={highlightsApi.highlights}
        unassignedHighlights={highlightsApi.unassignedHighlights}
        chapterNotes={highlightsApi.chapterNotes}
        onSelectChapter={number => openContentsPassage({ chapterNumber: number, paragraphIndex: 0, wordIndex: 0 }, undefined, true)}
        onOpenPassage={place => {
          rememberNotebookOrigin()
          openContentsPassage(place, undefined, false, { paragraphIndex: place.paragraphIndex, endParagraphIndex: place.paragraphIndex, fromWord: place.wordIndex, toWord: place.wordIndex + 1 })
        }}
        onOpenHighlight={highlight => { rememberNotebookOrigin(); openContentsPassage({ chapterNumber: highlight.chapterNumber, paragraphIndex: highlight.paragraphIndex, wordIndex: highlight.fromWord }, undefined, false, highlight) }}
        onContinueConversation={openNotebookConversation}
        onOpenIntroduction={privateBook ? undefined : openIntroduction}
        onWarmChapter={warmChapterTexts}
        notebook={contentsNotebook}
        notebookRecovery={ownNotebookRecovery}
        sharedNotebook={sharedReader}
        legacyOwnEpubItems={sharedReader && userBook && userBook.kind !== 'pdf' ? legacyOwnEpubItems : undefined}
        onDeleteNotebookItem={sharedReader ? item => {
          if (item.kind === 'card') return ask.deleteCard(item.id)
          const mark = highlightsApi.allHighlights.find(entry => entry.id === item.id)
          if (!mark || mark.bookId !== (book.bookId || 'bible')) return null
          const saved = highlightsApi.allHighlights.filter(entry => entry.id === mark.id || (mark.groupId && entry.groupId === mark.groupId))
          if (!highlightsApi.remove(item.id)) return null
          return () => highlightsApi.restore(saved)
        } : undefined}
        onClose={() => setTocOpen(false)}
      />
      {callFullScreen && !marginPhone && (
        <LabVoiceCall
          view={callView}
          getAssistantLevel={ask.getAssistantLevel}
          reducedMotion={reducedMotion}
          notice={ask.notice}
          onMuteToggle={toggleCallMute}
          onEnd={endCall}
          onReconnect={reconnectCall}
          talkSpeed={ask.talkSpeed}
          onTalkSpeedChange={ask.setTalkSpeed}
        />
      )}

      {selectionPopup && marginPhone && popupMode === 'character' && selectionPopup.character && (
        <LabPhoneCard label={phoneCardLabel('People', selectionPopup.chapterLabel)} kind="character" testId="lab-phone-character" onClose={() => leaveSelectionInfo()}>
          <PhoneCharacterBody key={`${selectionPopup.character.card.id}:${selectionPopup.openedAt}`} character={selectionPopup.character} renderFollow={shown => {
            const passage = phonePassageOf(selectionPopup)
            const at = selectionPopup.openedAt ?? 0
            const id = `react_character_${at}_${shown.id}`
            const conversationId = `mc_${id}`
            const keep = () => {
              const range = passage.ranges?.find(part => part.chapterNumber === passage.chapterNumber)?.range
              ask.saveCard({ source: { kind: 'catalogue', bookId: book.bookId || 'bible' }, id, kind: 'define',
                ...(range ? { anchor: { editionKey: passage.editionKey, chapterNumber: passage.chapterNumber,
                  paragraphIndex: range.paragraphIndex, fromWord: range.fromWord, endParagraphIndex: range.endParagraphIndex, toWord: range.toWord } } : {}),
                chapterNumber: passage.chapterNumber, text: passage.text,
                turns: [{ role: 'assistant', content: `${shown.name}: ${shown.subtitle}\n\n${shown.body}` }], at, u: Date.now() })
              return ask.revealConversation(conversationId)
            }
            return <PhoneFollowField value={draft} onChange={text => { dictation.stop(); setDraft(text) }}
              onSend={question => {
                const saved = keep()
                dictation.stop()
                void ask.sendTyped(question, undefined, undefined, { highlightedText: passage.text, conversationId,
                  sourceLocation: { chapterNumber: passage.chapterNumber, chapterLabel: passage.chapterLabel, paragraphIndex: passage.paragraphIndex },
                  onAccepted: () => { leaveSelectionInfo(); setContentsConversation(saved); setDesktopContinuationId(conversationId); setDraft(''); setPhoneAskOpen(true) },
                })
              }} onMic={handleMic} micOn={dictation.state !== 'idle'}
              onTalk={() => { keep(); setDesktopContinuationId(conversationId); ask.primeVoice(); requestAnimationFrame(() => handleTalk()) }}
              inputRef={phoneFieldRef} disabled={ask.typedLoading} />
          }} />
        </LabPhoneCard>
      )}
      {selectionPopup && marginPhone && popupMode === 'define' && renderPhoneCard({
        kind: 'define', passage: phonePassageOf(selectionPopup), word: selectionPopup.defineText || selectionPopup.text,
        namesakes: selectionPopup.namesakes, openedAt: selectionPopup.openedAt ?? 0,
      }, true)}
      {selectionPopup && marginPhone && popupMode !== 'character' && popupMode !== 'define' && (
        <LabPhoneBar
          text={selectionPopup.text}
          fallbackY={selectionPopup.y}
          existingColor={selectionPopup.existingHighlightId ? highlightsApi.allHighlights.find(highlight => highlight.id === selectionPopup.existingHighlightId)?.color ?? lastHighlightColor() : undefined}
          noted={!!(selectionPopup.existingHighlightId && highlightsApi.allHighlights.find(highlight => highlight.id === selectionPopup.existingHighlightId)?.note)}
          onAsk={() => phoneBarAsk()}
          onExplain={() => phoneBarAction('explain')}
          onSimplify={() => phoneBarAction('simplify')}
          onMore={phoneBarAction}
          onHighlight={phoneBarHighlight}
          onNote={phoneBarNote}
          onRemove={() => { if (selectionPopup.existingHighlightId) highlightsApi.remove(selectionPopup.existingHighlightId); dismissSelectionPopup() }}
          onShowPage={ownPdf && selectionPopup.range && !selectionPopup.side
            ? () => { const range = selectionPopup.range!; setSelectionPopup(null); openPdfPages({ chapterNumber: selectionPopup.chapterNumber ?? book.chapterNumber, paragraphIndex: range.paragraphIndex, wordIndex: range.fromWord }) }
            : undefined}
          onDismiss={dismissSelectionPopup}
        />
      )}
      {(marginPhone || sharedReader) && !continuousReader && phoneCard && renderPhoneCard(phoneCard)}
      {continuousReader && <SourceMarginRail host={marginHost} entries={desktopMarginEntries} onBlankNote={openBlankMarginNote} />}
      {continuousReader && marginUndo && <div className="source-margin-undo" role="status">Deleted. <button onClick={() => { marginUndo(); setMarginUndo(null) }}>Undo</button></div>}
      <LabFigurePreview chapterNumber={book.chapterNumber} figures={book.figures ?? []} enabled={!showPhoneChrome} />
      {notebookCard && (() => {
        const Card = showPhoneChrome ? LabPhoneCard : LabDesktopCard
        const saved = notebookCard
        return <Card label={`${marginActionLabel(saved.card?.kind || 'ask')} · ${book.chapters.find(ch => ch.number === saved.chapterNumber)?.title || `Chapter ${saved.chapterNumber}`}`}
          kind={saved.card?.kind || 'ask'} onClose={() => { setNotebookCard(null); setDraft('') }}>
          {saved.card?.text && <p className="lab-pcard-source">{saved.card.text}</p>}
          {saved.messages.filter(message => message.role === 'assistant').map(message => <div key={message.id} className="lab-pcard-answer">{saved.card?.kind === 'define' ? <ContextualLookupView answer={parseContextualLookup(message.content)} /> : <LabInlineMarkdown>{message.content}</LabInlineMarkdown>}</div>)}
          <button type="button" className="lab-pcard-link" onClick={() => {
            setNotebookCard(null)
            rememberNotebookOrigin()
            openContentsPassage({ chapterNumber: saved.chapterNumber, paragraphIndex: saved.card?.anchor?.paragraphIndex ?? saved.paragraphIndex ?? 0, wordIndex: saved.card?.anchor?.fromWord ?? 0 }, undefined, false, saved.card?.anchor)
          }}>Show passage</button>
          {saved.card?.kind !== 'quiz' && <PhoneFollowField value={draft} onChange={setDraft} disabled={ask.typedLoading} onSend={question => {
            ask.revealConversation(saved.id)
            void ask.sendTyped(question, undefined, undefined, { conversationId: saved.id, highlightedText: saved.card?.text,
              onAccepted: () => { setNotebookCard(null); setContentsConversation(saved); setDesktopContinuationId(saved.id); setDraft(''); setPhoneAskOpen(showPhoneChrome); setDesktopAskOpen(!showPhoneChrome) } })
          }} />}
        </Card>
      })()}
      {marginPhone && phoneAsk && (
        <LabPhoneCard label="Chat" kind="chat" closeLabel="Close chat" onClose={() => { dictation.stop(); closePhoneAsk() }}>
          {askPaneElement}
        </LabPhoneCard>
      )}
      {marginPhone && callFullScreen && (
        <LabPhoneCard label={phoneCardLabel('Talk')} kind="talk" onClose={endCall}>
          <PhoneTalkFrame>{orbSize => (
            <LabVoiceCall
              view={callView}
              getAssistantLevel={ask.getAssistantLevel}
              reducedMotion={reducedMotion}
              notice={ask.notice}
              onMuteToggle={toggleCallMute}
              onEnd={endCall}
              onReconnect={reconnectCall}
              talkSpeed={ask.talkSpeed}
              onTalkSpeedChange={ask.setTalkSpeed}
              orbSize={orbSize}
            />
          )}</PhoneTalkFrame>
        </LabPhoneCard>
      )}

      {selectionPopup && !marginPhone && (
        <SelectionPopup
          sharedReader={sharedReader}
          saveError={sharedCardSaveError}
          selection={selectionPopup}
          popupRef={popupRef}
          onAskQuestion={sharedReader ? question => {
            const passage = phonePassageOf(selectionPopup)
            if (continuousReader) {
              const openedAt = Date.now()
              openPhoneCard({ kind: 'ask', passage, openedAt })
              dictation.stop()
              void ask.sendTyped(question, undefined, undefined, {
                highlightedText: passage.text, conversationId: `mc_react_${openedAt}`,
                sourceLocation: { chapterNumber: passage.chapterNumber, chapterLabel: passage.chapterLabel, paragraphIndex: passage.paragraphIndex },
              })
              return
            }
            closePhoneCard()
            setDesktopOpenId(null)
            setSelectionPopup(null)
            setDesktopContinuationId(null)
            setContentsConversation(null)
            setDraft('')
            setPhoneAskOpen(showPhoneChrome)
            setDesktopAskOpen(!showPhoneChrome)
            dictation.stop()
            void ask.sendTyped(question, undefined, undefined, {
              highlightedText: passage.text, conversationId: null, sourceLocation: { chapterNumber: passage.chapterNumber, chapterLabel: passage.chapterLabel, paragraphIndex: passage.paragraphIndex },
              onAccepted: () => setDraft(''),
            })
          } : undefined}
          onPassageAction={sharedReader ? phoneBarAction : undefined}
          onPassageNote={sharedReader ? phoneBarNote : undefined}
          onPassageAsk={sharedReader ? phoneBarAsk : undefined}
          onQuizPassage={sharedReader ? () => phoneBarAction('quiz') : undefined}
          onShowPage={ownPdf && selectionPopup.range && !selectionPopup.side
            ? () => { const range = selectionPopup.range!; setSelectionPopup(null); openPdfPages({ chapterNumber: selectionPopup.chapterNumber ?? book.chapterNumber, paragraphIndex: range.paragraphIndex, wordIndex: range.fromWord }) }
            : undefined}
          popupMode={popupMode}
          setPopupMode={setPopupMode}
          currentHighlightColor={selectionPopup.existingHighlightId
            ? highlightsApi.allHighlights.find(highlight => highlight.id === selectionPopup.existingHighlightId)?.color
            : undefined}
          onColorClick={(color: HighlightColor) => {
            if (selectionPopup.existingHighlightId) {
              highlightsApi.setColor(selectionPopup.existingHighlightId, color)
            } else if (selectionPopup.range) {
              const created = selectionPopup.chapterRanges ? highlightsApi.addGroup(selectionPopup.chapterRanges,color,selectionPopup.editionKey)[0] : highlightsApi.addOrReuse(selectionPopup.range, color, selectionPopup.editionKey, selectionPopup.chapterNumber)
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
              const created = selectionPopup.chapterRanges ? highlightsApi.addGroup(selectionPopup.chapterRanges,color ?? 'gold',selectionPopup.editionKey)[0] : highlightsApi.addOrReuse(selectionPopup.range, color ?? 'gold', selectionPopup.editionKey, selectionPopup.chapterNumber)
              setSelectionPopup(current => current ? {
                ...current,
                existingHighlightId: created.id,
                existingNote: created.note,
              } : current)
            }
            setPopupMode('note')
          }}
          onExplanationReady={(answer) => saveExplanation({ bookId: book.bookId || 'bible', chapterNumber: selectionPopup.chapterNumber ?? book.chapterNumber, paragraphIndex: selectionPopup.paragraphIndex, passage: selectionPopup.text, answer })}
          onExplain={(answer) => {
            const text = selectionPopup.text
            if (answer) ask.keepExplanation(text, answer, selectionPopup.paragraphIndex, { bookId: book.bookId || 'bible', chapterNumber: selectionPopup.chapterNumber ?? book.chapterNumber })
            dismissSelectionPopup()
            handleChat()
            setAskAttachment({ bookId: book.bookId || 'bible', text })
            setDraft('')
          }}
          onTalkExplanation={(answer) => {
            ask.keepExplanation(selectionPopup.text, answer, selectionPopup.paragraphIndex, { bookId: book.bookId || 'bible', chapterNumber: selectionPopup.chapterNumber ?? book.chapterNumber })
            dismissSelectionPopup()
            // Let the explanation enter the hook's context before starting voice;
            // the microphone is asked for now, in the tap (Safari).
            ask.primeVoice()
            requestAnimationFrame(() => handleTalk())
          }}
          onRequestExplanation={(onDelta, text, intent) => {
            const selected = selectionPopup
            const requestAt = Date.now()
            if (sharedReader) setSharedCardSaveError(false)
            const editionKey = selectionPopup.editionKey || readerEditionKey
            const compare = editionKey === prefs.compareEdition && editionKey !== prefs.primaryEdition
            const cardKey = JSON.stringify([book.bookId, selected.chapterNumber ?? book.chapterNumber, editionKey,
              selected.paragraphIndex, selected.range?.fromWord, selected.range?.toWord, intent, text ?? selected.text])
            let cardRequest = desktopCardRequestRef.current
            if (!cardRequest || cardRequest.key !== cardKey) {
              cardRequest = { key: cardKey, id: `react_desk_${requestAt}`, at: requestAt }
              desktopCardRequestRef.current = cardRequest
            }
            return ask.explainSelection({
              text: text ?? selectionPopup.text,
              intent,
              editionKey,
              editionLabel: editionLabelFor(editionKey, allBookEditions),
              paragraphs: selectionPopup.paragraphs ?? (compare ? book.compareParagraphs : book.paragraphs),
              chapterNumber: selectionPopup.chapterNumber, chapterLabel: selectionPopup.chapterLabel,
              paragraphIndex: selectionPopup.paragraphIndex,
            }, onDelta).then(answer => {
              if (sharedReader && answer.trim()) {
                // The contextual card may subscribe twice while its shell
                // changes modes. Both subscriptions share one answer and one
                // stable Notebook identity, with exactly one completed write.
                if (cardRequest.savedAnswer === answer) return answer
                const range = selected.range
                const chapterNumber = selected.chapterNumber ?? book.chapterNumber
                const saved = ask.saveCard({
                  source: userBook
                    ? { kind: 'own-text', bookId: userBook.bookId, ownHex: userBook.hex, converter: userBook.edition.converter, editionKey: ownSourceEditionKey(userBook.edition) as 'own' | 'own-en' | 'own-da' }
                    : { kind: 'catalogue', bookId: book.bookId || 'bible' },
                  id: cardRequest.id, kind: intent || 'explain', chapterNumber,
                  ...(range ? { anchor: { editionKey, chapterNumber,
                    paragraphIndex: range.paragraphIndex, fromWord: range.fromWord,
                    endParagraphIndex: range.endParagraphIndex, toWord: range.toWord } } : {}),
                  text: text ?? selected.text, turns: [{ role: 'assistant', content: answer }],
                  at: cardRequest.at, u: Date.now(),
                })
                if (saved) cardRequest.savedAnswer = answer
                setSharedCardSaveError(!saved)
              }
              return answer
            })
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
          onShareHighlight={privateBook ? undefined : (id) => {
            const mark = highlightsApi.highlights.find(h => h.id === id) ?? highlightsApi.compareHighlights.find(h => h.id === id)
            dismissSelectionPopup()
            if (!mark) return
            const editionKey = mark.editionKey || selectionPopup.editionKey || readerEditionKey
            setShareTarget({
              bookId: mark.bookId || book.bookId || 'bible', editionKey, editionLabel: editionLabelFor(editionKey, allBookEditions),
              chapterNumber: mark.chapterNumber, paragraphIndex: mark.paragraphIndex, fromWord: mark.fromWord,
              endParagraphIndex: mark.endParagraphIndex, toWord: mark.toWord,
            })
          }}
          dismissPopup={dismissSelectionPopup}
          lab
          keyboardDock={isPhone || showPhoneChrome}
          darkBar={!(isPhone || showPhoneChrome)}
        />
      )}
      {chapterNoteEditor && (
        <LabChapterNoteEditor
          key={chapterNoteEditor.bookId + ':' + chapterNoteEditor.chapterNumber}
          initialNote={highlightsApi.chapterNotes.find(note => note.chapterNumber === chapterNoteEditor.chapterNumber)?.note ?? ''}
          keyboardDock={isPhone || showPhoneChrome}
          anchor={chapterNoteEditor}
          onSave={note => highlightsApi.setChapterNote(chapterNoteEditor.chapterNumber, note)}
          onClose={() => setChapterNoteEditor(null)}
        />
      )}

      {openFootnote && <LabFootnote open={openFootnote} onClose={() => setOpenFootnote(null)} />}

      {shareTarget && (
        <LabShareSheet
          target={shareTarget}
          format={isPhone ? 'phone' : 'desktop'}
          align={readingAlignment}
          look={typeof document !== 'undefined' && document.documentElement.dataset.eink === 'true' ? 'eink' : resolvedDarkMode ? 'night' : prefs.theme === 'book' ? 'book' : 'paper'}
          onClose={() => setShareTarget(null)}
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
    </MarginPhoneContext.Provider>
  )
}

export default LabApp
