import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Header } from './components/Header'
import { TrialBanner } from './components/TrialBanner'
import { Reader } from './components/Reader'
import { SplitReader } from './components/SplitReader'
import { SidePanel } from './components/SidePanel'
import { Onboarding } from './components/Onboarding'
import { BookOnboarding, type BookOnboardingResult } from './components/BookOnboarding'
import { ProgressPrompt } from './components/ProgressPrompt'
import { SettingsSheet } from './components/SettingsSheet'
import { AuthModal } from './components/AuthModal'
import { UsageDashboard } from './components/UsageDashboard'
import { TopUpModal } from './components/TopUpModal'
import { BookStore } from './components/BookStore'
import { TierChooser } from './components/TierChooser'
import { HomeRolePrompt } from './components/HomeRolePrompt'
import { PricingModal } from './components/PricingModal'
import { BottomBar } from './components/BottomBar'
import type { BottomBarHandle } from './components/BottomBar'
import { TocOverlay } from './components/TocOverlay'
import { ShareModal } from './components/ShareModal'
import { TierProvider } from './contexts/TierContext'
import { ALL_BOOKS as BOOKS, ODYSSEY, getBook } from './data/bookRegistry'
import { loadEdition, reloadEdition } from './data/editionLoader'
import { AudioStrip } from './components/AudioStrip'
import { usePreferences } from './hooks/usePreferences'
import { useHighlights } from './hooks/useHighlights'
import { useNotes } from './hooks/useNotes'
import { useReadingPosition, getSavedPosition, getReadingProgress, markCloudPosition, markUserNav } from './hooks/useReadingPosition'
import { useClaude } from './hooks/useClaude'
import { useThreads } from './hooks/useThreads'
import { useAuth } from './hooks/useAuth'
import { useBalance } from './hooks/useBalance'
import { useOffline } from './hooks/useOffline'
import { DownloadManager } from './components/DownloadManager'
import { SearchOverlay } from './components/SearchOverlay'
import { useReadingSpeed } from './hooks/useReadingSpeed'
import { useMobile } from './hooks/useMobile'
import { useChatHistory } from './hooks/useChatHistory'
import { useLibrary } from './hooks/useLibrary'
import { useReadingLog } from './hooks/useReadingLog'
import { storage, setStorageProvider, localStorageProvider } from './services/storage'
import { SupabaseStorageProvider } from './services/supabaseStorage'
import type { EditionData, HighlightColor, Style, Language, EditionKey, ReadingPosition, FontSize, FontFamily, ChatMessage, ChatConversation } from './types'
import { makeEditionKey } from './types'
import { apiUrl } from './utils/apiUrl'
import { trackPageview } from './utils/analytics'
import { AUDIO_BASE_URL } from './utils/audioUrl'
import { formatProgressLabel } from './utils/formatProgress'

/** Pick the most recently updated position. Falls back to furthest if no timestamps. */
function pickLatest(a: ReadingPosition | null, b: ReadingPosition | null): ReadingPosition | null {
  if (!a) return b
  if (!b) return a
  // Prefer most recent timestamp
  if (a.updatedAt && b.updatedAt) return a.updatedAt >= b.updatedAt ? a : b
  if (a.updatedAt) return a
  if (b.updatedAt) return b
  // No timestamps — fall back to furthest (legacy data)
  if (a.chapterNumber > b.chapterNumber) return a
  if (b.chapterNumber > a.chapterNumber) return b
  const fracA = a.scrollFraction ?? 0
  const fracB = b.scrollFraction ?? 0
  return fracA >= fracB ? a : b
}

export default function App() {
  const [currentBookId, setCurrentBookId] = useState(() => {
    return storage.get<string>('tinct-current-book') || ODYSSEY.id
  })
  const book = getBook(currentBookId) || ODYSSEY

  // Auth & billing
  const { user, profile, session, isLoading: authLoading, signUp, signIn, signInWithGoogle, signOut, refreshProfile, resetPassword, updatePassword, isPasswordRecovery, clearPasswordRecovery } = useAuth()
  const { messagesRemaining, monthlyRemaining, messageBalance, hasBalance, deductUsage, isAnonymous, isSubscribed } = useBalance(session, profile)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')
  const [showUsageDashboard, setShowUsageDashboard] = useState(false)
  const [showTopUp, setShowTopUp] = useState(false)
  const [fixesCount, setFixesCount] = useState<number | undefined>(undefined)
  const [showStore, setShowStore] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showDownloadManager, setShowDownloadManager] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const { isOnline, offlineMeta, downloadState, storageMB, downloadBook, downloadChapter, removeDownload, cancelDownload, isBookDownloaded } = useOffline()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  // Swap storage provider when user signs in/out — enables cross-device sync
  // Start false to prevent hooks from writing defaults before cloud data loads
  const [storageReady, setStorageReady] = useState(false)
  // Bumped each time Supabase init successfully populates the cache. The
  // cloud-restore effect watches this so it can re-fire when init lands AFTER
  // the 5s timeout already flipped storageReady=true. Without this, a slow
  // cloud-fetch on cold start meant restore ran against stale localStorage
  // (e.g. opened on a book the user wasn't actually reading anymore).
  const [supabaseInitTick, setSupabaseInitTick] = useState(0)
  const supabaseProviderRef = useRef<SupabaseStorageProvider | null>(null)
  useEffect(() => {
    // Wait for auth to resolve before deciding on storage provider
    if (authLoading) return
    if (user) {
      const provider = new SupabaseStorageProvider(user.id)
      // Timeout: if Supabase init takes >5s, proceed with localStorage (don't block the app)
      const initTimeout = setTimeout(() => {
        console.warn('[App] Supabase init timeout — proceeding with localStorage')
        setStorageReady(true)
      }, 5000)
      provider.init().then(() => {
        clearTimeout(initTimeout)
        // Migrate any existing localStorage data to Supabase.
        // For position keys, prefer whichever has the more recent updatedAt timestamp.
        // For all other keys, only write to Supabase if it has no value yet.
        const localData = localStorageProvider.getAllData()
        for (const [key, value] of Object.entries(localData)) {
          const cloudValue = provider.get(key)
          if (!cloudValue) {
            provider.set(key, value)
          } else if (key.startsWith('position:')) {
            // Prefer the more recently updated position (cross-device conflict resolution)
            const local = value as { updatedAt?: number }
            const cloud = cloudValue as { updatedAt?: number }
            if (local?.updatedAt && cloud?.updatedAt && local.updatedAt > cloud.updatedAt) {
              provider.set(key, value)
            }
          }
        }
        setStorageProvider(provider)
        supabaseProviderRef.current = provider
        // Start real-time sync for cross-device updates. This is best-effort
        // — when CSP or a corp firewall blocks WebSockets, subscribe() throws.
        // We must NOT let that failure prevent the rest of init from completing,
        // because losing the storage provider here means every write falls back
        // to localStorage and never reaches Supabase. (That was the silent bug
        // since 2026-04-22: CSP missed wss://, subscribe() threw, the catch
        // below ran instead of setStorageProvider(), and we lost cloud sync.)
        try {
          provider.subscribe()
        } catch (e) {
          console.warn('[App] Supabase realtime subscribe failed (continuing without live sync):', e)
        }
        setStorageReady(true)
        setSupabaseInitTick(t => t + 1)
      }).catch((err) => {
        console.error('[App] Supabase init failed:', err)
        clearTimeout(initTimeout)
        // Even on init failure, install the provider so writes still hit
        // Supabase via REST. Cache will be empty (no preload) but writes will
        // succeed. Far better than silently dropping every write.
        setStorageProvider(provider)
        supabaseProviderRef.current = provider
        setStorageReady(true)
      })
    } else {
      // Clean up previous subscription
      if (supabaseProviderRef.current) {
        supabaseProviderRef.current.unsubscribe()
      }
      setStorageProvider(localStorageProvider)
      supabaseProviderRef.current = null
      setStorageReady(true)
    }
    return () => {
      supabaseProviderRef.current?.unsubscribe()
    }
  }, [user, authLoading])

  // Library
  const { libraryIds, addBook, removeBook, isEmpty: libraryEmpty, refreshFromStorage: refreshLibrary } = useLibrary(storageReady)

  const {
    preferences,
    setLanguage,
    setStyle,
    toggleSplitView,
    toggleDarkMode,
    setPanelTab,
    togglePanel,
    setSplitEditionKey,
    setReadingObjective,
    setOnboardingComplete,
    setFontSize,
    setFontFamily,
    setAccountDecisionSeen,
    setProgressDisplay,
    setChatHidden,
    setFeedHidden,
    setCastHidden,
    setReadingLanguages,
    refreshFromStorage,
  } = usePreferences(storageReady)

  // Library books (filtered to what user has added)
  const libraryBooks = useMemo(() => {
    if (libraryIds.length === 0) return BOOKS // fallback: show all if library empty
    return BOOKS.filter(b => libraryIds.includes(b.id))
  }, [libraryIds])

  // Mobile
  const { isMobile, activeView, setActiveView, swipeHandlers } = useMobile(preferences.splitView)

  // Restore last reading position on mount or book change
  const savedPos = useRef(getSavedPosition(book.id))
  const [currentChapter, setCurrentChapter] = useState(() => {
    const ch = savedPos.current?.chapterNumber || 1
    // Bounds check: chapter must be positive (full bounds check happens after data loads)
    return ch >= 1 ? ch : 1
  })
  const [primaryData, setPrimaryData] = useState<EditionData | null>(null)
  const [primaryLoadError, setPrimaryLoadError] = useState<string | null>(null)
  const [splitData, setSplitData] = useState<EditionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingHighlight, setPendingHighlight] = useState<string | null>(null)
  const [shareText, setShareText] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const readerRef = useRef<HTMLDivElement>(null)
  const compareReaderRef = useRef<HTMLDivElement>(null)
  const [readerKey, setReaderKey] = useState(0)
  const targetParagraphRef = useRef<number | undefined>(savedPos.current?.lastParagraphIndex)
  const [backPosition, setBackPosition] = useState<{ chapter: number; scrollFraction: number; style: Style; language: Language } | null>(null)
  const backTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Audio state
  const [audioPlayingParagraph, setAudioPlayingParagraph] = useState<number | undefined>(undefined)
  const [audioIsPlaying, setAudioIsPlaying] = useState(false)
  const [audioStripOpen, setAudioStripOpen] = useState(false)
  // Fraction (0-1) through the paragraph currently being narrated. Bubbled
  // from BottomBar at ~3 Hz so the Reader can keep the visible page in sync
  // even when a single paragraph spans a page break.
  const [audioProgress, setAudioProgress] = useState(0)
  const [hasAudio, setHasAudio] = useState(false)
  const [audioEditionKey, setAudioEditionKey] = useState<string | null>(null)
  const [firstVisibleParagraph, setFirstVisibleParagraph] = useState(0)
  const [compareFirstVisibleParagraph, setCompareFirstVisibleParagraph] = useState(0)
  const [compareSyncSignal, setCompareSyncSignal] = useState<{ paragraph: number; nonce: number } | undefined>(undefined)
  const [readSyncSignal, setReadSyncSignal] = useState<{ paragraph: number; nonce: number } | undefined>(undefined)
  const bottomBarRef = useRef<BottomBarHandle>(null)

  // Sync between Read (view 0) and Compare (view 1) on tab switch. Whichever
  // view the user leaves is the source of truth — the incoming view snaps to
  // match. Both Readers report their own firstVisibleParagraph, and a nonce
  // forces re-sync even when the paragraph index hasn't changed.
  const firstVisibleParagraphRef = useRef(firstVisibleParagraph)
  firstVisibleParagraphRef.current = firstVisibleParagraph
  const compareFirstVisibleParagraphRef = useRef(compareFirstVisibleParagraph)
  compareFirstVisibleParagraphRef.current = compareFirstVisibleParagraph
  useEffect(() => {
    if (activeView === 1) {
      // Switching INTO Compare — snap Compare to Read's position (skip if
      // they're already aligned; avoids a spurious jump on rapid tab switching
      // before the destination has reported its first-visible paragraph).
      const source = firstVisibleParagraphRef.current
      const dest = compareFirstVisibleParagraphRef.current
      if (source !== dest) {
        setCompareSyncSignal({ paragraph: source, nonce: Date.now() })
      }
    } else if (activeView === 0) {
      const source = compareFirstVisibleParagraphRef.current
      const dest = firstVisibleParagraphRef.current
      if (source !== dest) {
        setReadSyncSignal({ paragraph: source, nonce: Date.now() })
      }
    }
    // Readers stay mounted (CSS hidden) — no remount needed, position preserved
  }, [activeView])

  // ToC overlay state
  const [showToc, setShowToc] = useState(false)

  // Book Onboarding state
  const [showBookOnboarding, setShowBookOnboarding] = useState(false)
  const [bookOnboardingMode, setBookOnboardingMode] = useState<'full' | 'edition-only'>('full')
  const deepLinkParsedRef = useRef(false)

  // Focus mode: hides header, bottom bar, and side panel for an immersive
  // reading experience. Toggled via a floating button or the F key. Transient
  // (not persisted) — each session starts with full chrome.
  const [focusMode, setFocusMode] = useState(false)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape' && focusMode) { setFocusMode(false); e.preventDefault() }
      else if (e.key === 'f' || e.key === 'F') { setFocusMode(v => !v); e.preventDefault() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [focusMode])

  // (Tier-chooser modal is retired — account creation is now the final step
  // of BookOnboarding when the user is anonymous.)

  // Issue report toast listener
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<{ message: string }>).detail.message
      setToastMessage(msg)
      setTimeout(() => setToastMessage(null), 5000)
    }
    window.addEventListener('tinct:toast', handler)
    return () => window.removeEventListener('tinct:toast', handler)
  }, [])

  // Issue fix confirmation modal
  const [showFixModal, setShowFixModal] = useState(false)
  useEffect(() => {
    const handler = () => setShowFixModal(true)
    window.addEventListener('tinct:issue-fixed', handler)
    return () => window.removeEventListener('tinct:issue-fixed', handler)
  }, [])

  // Analytics: track pageviews on book/chapter/view changes
  useEffect(() => {
    let path: string
    if (showStore) {
      path = '/store'
    } else if (showUsageDashboard) {
      path = '/usage'
    } else {
      path = `/read/${currentBookId}/${currentChapter}`
    }
    trackPageview(path, user?.id)
  }, [currentBookId, currentChapter, showStore, showUsageDashboard, user?.id])

  // Fetch user's confirmed fixes count when dashboard opens
  useEffect(() => {
    if (!showUsageDashboard || !session?.access_token) return
    fetch(apiUrl('/api/fixes-count'), { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(r => r.json())
      .then((d: { count: number }) => setFixesCount(d.count))
      .catch(() => {})
  }, [showUsageDashboard, session?.access_token])

  // Re-read position, preferences, and library from cloud storage once Supabase syncs.
  // Re-runs when supabaseInitTick increments (init landed AFTER the 5s timeout
  // already flipped storageReady=true). Without that, a slow cold-start cloud
  // fetch meant restore ran against stale localStorage and the user opened on
  // a book they weren't actually reading anymore. Now: restore once on
  // ready, and again the moment cloud data is genuinely available.
  const hasRestoredFromCloud = useRef(false)
  useEffect(() => {
    if (!storageReady || !user) return
    // Allow re-restore when supabaseInitTick fires (cloud data just landed).
    // The first restore (against possibly-stale localStorage) is harmless;
    // the second corrects to true cloud values.
    refreshFromStorage()
    refreshLibrary()
    // Current book — switch if cloud disagrees with what we have on screen.
    const cloudBookId = storage.get<string>('tinct-current-book')
    const validCloudBook = cloudBookId && !!getBook(cloudBookId)
    const targetBookId = validCloudBook ? cloudBookId : book.id
    if (validCloudBook && cloudBookId !== currentBookId) {
      setCurrentBookId(cloudBookId)
    }
    // Restore reading position only on the FIRST restore. Subsequent
    // restores (e.g. supabaseInitTick fires after the user has been
    // reading for a few seconds) must NOT yank the user back to where
    // they were last time — the current state on screen is more recent.
    if (!hasRestoredFromCloud.current) {
      hasRestoredFromCloud.current = true
      const cloudPos = getSavedPosition(targetBookId)
      // Mark cloud-known chapter so the regression guard knows what the
      // authoritative position is. Without this, the first heartbeat
      // after a buggy default-state remount (B19) would be allowed to
      // write chapter 1 because the guard had no baseline to compare.
      markCloudPosition(targetBookId, cloudPos)
      if (cloudPos) {
        const localPos = savedPos.current
        const winner = pickLatest(localPos, cloudPos)
        if (winner) {
          savedPos.current = winner
          if (winner.lastParagraphIndex !== undefined) {
            targetParagraphRef.current = winner.lastParagraphIndex
          }
          // Restoring from cloud counts as a user-initiated landing point;
          // any write within USER_NAV_GRACE_MS of this is allowed even if
          // it appears to regress (e.g. cloud at chapter 5, local was at
          // chapter 7 from a never-uploaded session — winner is 7, but we
          // briefly need to allow a chapter-5 confirmation write while
          // re-rendering at the chosen winner).
          markUserNav(targetBookId)
          setCurrentChapter(winner.chapterNumber)
          setCurrentPage(0)
          setReaderKey(k => k + 1)
        }
      }
    }
  }, [storageReady, supabaseInitTick, user, book.id, currentBookId, refreshFromStorage, refreshLibrary])

  // Real-time cross-device sync: listen for remote preference changes
  // Note: position sync is handled on refresh/focus, not real-time,
  // to avoid two devices fighting over the same position key
  useEffect(() => {
    const provider = supabaseProviderRef.current
    if (!provider) return
    const unsubscribe = provider.onChange((key, _value) => {
      if (key === 'preferences') {
        refreshFromStorage()
      }
    })
    return unsubscribe
  }, [refreshFromStorage])

  // Cross-book bleed guard. **INVARIANT 2** in CLAUDE.md.
  //
  // Every code path that changes `currentBookId` MUST also reset chapter/page
  // state to match the new book — otherwise the next heartbeat writes
  // `position:newBook` carrying the OLD book's chapterNumber. That's how
  // Genesis 39 leaked into The Awakening's saved position (B1).
  //
  // DO NOT remove this effect, even if a refactor seems to make
  // handleBookChange cover the same ground. Cloud-sync paths
  // (visibility-handler, real-time onChange) call setCurrentBookId
  // directly and rely on this effect to re-derive chapter. Removing it
  // re-opens the cross-book chapter-index leak.
  //
  // `handleBookChange` does this manually, but the cloud-sync paths
  // (initial cloud restore at line 358, visibility-handler at line 435)
  // only call setCurrentBookId. Centralizing the reset in this effect makes
  // the rule unconditional: any future code path that changes the book gets
  // automatic chapter/savedPos reset, regardless of how it triggered the change.
  const prevBookIdRef = useRef(currentBookId)
  useEffect(() => {
    if (prevBookIdRef.current === currentBookId) return
    prevBookIdRef.current = currentBookId
    const pos = getSavedPosition(currentBookId)
    // Mark cloud-known chapter for the new book so the regression guard has
    // a baseline. Mark user-nav so the first heartbeat-after-book-change
    // (which may render at the old chapter for a render or two) doesn't get
    // wrongly classified as a regression.
    markCloudPosition(currentBookId, pos)
    markUserNav(currentBookId)
    savedPos.current = pos
    targetParagraphRef.current = pos?.lastParagraphIndex
    setCurrentChapter(pos?.chapterNumber || 1)
    setCurrentPage(0)
    // Reset totalPages so the reader's effects gate writes during relayout
    // (useReadingPosition skips page-level writes when totalPages <= 1).
    setTotalPages(1)
    setReaderKey(k => k + 1)
    // Reading angle is per-book (B24). Load the new book's angle into
    // preferences.readingObjective so chat / system-prompt consumers see
    // the right one. If the new book has no saved angle, clear — never
    // fall back to the previous book's angle.
    const savedAngle = storage.get<string>(`reading-angle:${currentBookId}`)
    setReadingObjective(savedAngle || '')
  }, [currentBookId, setReadingObjective])

  // Hoisted derivations needed by the visibility effect below.
  // Defined here (not lower down) to avoid TDZ in dep arrays.
  //
  // IMPORTANT: do NOT fall back to book.editions.length when chapters
  // is empty. Editions and chapters are unrelated — falling back would
  // make Feed render N "chapters" that don't exist and TOC look broken.
  // 0 here is a load-in-progress / load-failed signal that downstream
  // components handle (Feed renders empty, TOC is gated behind primaryData).
  const totalChapters = primaryData?.chapters.length ?? 0

  // Position validation at book-open time.
  //
  // When primaryData loads we know two things the rest of the app didn't:
  // the actual chapter count, and the actual paragraph count of each chapter.
  // Validate the saved position against both. Anything out of bounds is a
  // pre-Phase-1 cross-book bleed (B1) and gets nuked from storage so it
  // can't resurrect from cache or sync.
  //
  //   1. chapterNumber must be in [1, totalChapters] — catches "Genesis 39
  //      applied to a 12-chapter book" and similar.
  //   2. lastParagraphIndex must be < paragraphs.length of the current
  //      chapter — catches the page-19-of-21 phantom: a paragraph index
  //      from a longer book's chapter 1 gets applied to a shorter book's
  //      chapter 1, so the reader scrolled to a paragraph that exists in
  //      the bleed-source but not the current book. The chapter happens
  //      to be valid (chapter 1 is always valid), but the paragraph isn't.
  //
  // Reset path: clear savedPos.current and targetParagraphRef.current so
  // Reader doesn't restore to the bad position; setCurrentPage(0) and bump
  // readerKey to force a clean remount. Storage delete prevents the phantom
  // from re-appearing on next session via cloud cache.
  useEffect(() => {
    if (!primaryData || totalChapters === 0) return

    // Chapter bounds
    if (currentChapter < 1 || currentChapter > totalChapters) {
      console.warn(`[position-cleanup] ${book.id}: chapter ${currentChapter} out of range (1..${totalChapters}); resetting position`)
      targetParagraphRef.current = undefined
      savedPos.current = null
      storage.delete(`position:${book.id}`)
      setCurrentChapter(1)
      setCurrentPage(0)
      setReaderKey(k => k + 1)
      return
    }

    // Paragraph bounds — catches cross-book paragraph-index bleed even when
    // the chapter index happens to be valid for this book.
    const chapter = primaryData.chapters[currentChapter - 1]
    const paragraphCount = chapter?.paragraphs.length ?? 0
    const target = targetParagraphRef.current
    if (typeof target === 'number' && target >= paragraphCount) {
      console.warn(`[position-cleanup] ${book.id} ch${currentChapter}: paragraph ${target} out of range (max ${paragraphCount - 1}); resetting position`)
      targetParagraphRef.current = undefined
      savedPos.current = null
      storage.delete(`position:${book.id}`)
      setCurrentPage(0)
      setReaderKey(k => k + 1)
    }
  }, [primaryData, totalChapters, currentChapter, book.id])

  // Re-sync from Supabase when tab regains focus (cross-device sync)
  const lastSyncRef = useRef(0)
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible') return
      const provider = supabaseProviderRef.current
      if (!provider || !user) return
      const now = Date.now()
      if (now - lastSyncRef.current < 5000) return // debounce 5s
      lastSyncRef.current = now
      await provider.refresh()
      // If the cloud's current-book pointer has changed (user opened a
      // different book on another device), switch to it. Without this,
      // two devices stay on their own last-opened book even after sync.
      const cloudBookId = storage.get<string>('tinct-current-book')
      if (cloudBookId && cloudBookId !== book.id && !!getBook(cloudBookId)) {
        setCurrentBookId(cloudBookId)
        // Don't also try to restore position for the OLD book — let the
        // book-change effect re-trigger restore for the new book.
        return
      }
      const cloudPos = getSavedPosition(book.id)
      if (cloudPos) {
        // Don't sync if layout hasn't settled (totalPages=1 means stale state)
        if (totalPages <= 1) return
        // Bounds check: chapter must be valid for this book
        if (cloudPos.chapterNumber < 1 || cloudPos.chapterNumber > totalChapters) return
        // Update the regression baseline whenever we successfully read cloud.
        // Even if we don't adopt the cloud value (because we're ahead), the
        // guard needs to know cloud's chapter so heartbeats can't regress
        // below it.
        markCloudPosition(book.id, cloudPos)
        // The on-screen position is the source of truth for "where I'm
        // reading on THIS device". If the cloud reflects what we last saved
        // from this device (or is older), do nothing — we don't want to
        // rewind the user to an older spot just because an in-flight upsert
        // hasn't landed yet. Only adopt cloud when it's clearly a different
        // session writing to it (chapter differs, or scrollFraction is
        // materially ahead of where we are right now).
        const localFraction = currentPage / Math.max(totalPages - 1, 1)
        const cloudFraction = cloudPos.scrollFraction ?? 0
        const chapterDiffers = cloudPos.chapterNumber !== currentChapter
        const cloudIsAhead = cloudPos.chapterNumber === currentChapter && cloudFraction > localFraction + 0.02
        const cloudIsBehind = cloudPos.chapterNumber === currentChapter && cloudFraction < localFraction - 0.02
        // Cloud "ahead" → other device made progress; adopt it.
        // Cloud "behind" → either our save hasn't landed yet, or another device
        //   went backwards. Either way, don't yank the user backwards on focus
        //   — the heartbeat will reconcile within 30s.
        if (chapterDiffers || cloudIsAhead) {
          // If our local savedPos is actually newer than cloud, prefer ours.
          // (Edge case: device A signed in offline, made progress, came back
          // online. Cloud has older value. Local in-memory savedPos has
          // updatedAt that beats cloud.)
          const local = savedPos.current
          if (local?.updatedAt && cloudPos.updatedAt && local.updatedAt > cloudPos.updatedAt && !cloudIsAhead) {
            return
          }
          savedPos.current = cloudPos
          if (cloudPos.lastParagraphIndex !== undefined) {
            targetParagraphRef.current = cloudPos.lastParagraphIndex
          }
          setCurrentChapter(cloudPos.chapterNumber)
          setCurrentPage(0)
          setReaderKey(k => k + 1)
        } else if (cloudIsBehind) {
          // No-op — log only so we can spot the pattern in DevTools if it
          // turns out the heartbeat is failing on this device.
          if (typeof window !== 'undefined') {
            (window as unknown as { __tinctSyncDebug?: { lastBehindAt: number; gap: number } }).__tinctSyncDebug = {
              lastBehindAt: Date.now(),
              gap: localFraction - cloudFraction,
            }
          }
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [user, book.id, currentChapter, currentPage, totalPages, totalChapters])


  // Get current chapter data early so we can pass context to chat
  // Fall back when the user's saved style+language combo doesn't exist on this
  // book (e.g. preferences default to 'original-en' but the Bible has no
  // 'original' style — only kjv-en, web-en, modern-en, modern-da). Without
  // this, the app tries to fetch bible-original-en.json, 404s, and shows
  // "Edition returned invalid JSON".
  const requestedEditionKey = makeEditionKey(preferences.style, preferences.language)
  const primaryEditionKey = book.editions.some(ed => ed.key === requestedEditionKey)
    ? requestedEditionKey
    : (book.editions.find(ed => ed.language === preferences.language)?.key
       ?? book.editions[0]?.key
       ?? requestedEditionKey)
  // Bounds check: clamp chapter to valid range after data loads
  if (currentChapter > totalChapters && totalChapters > 0) {
    setCurrentChapter(totalChapters)
  }
  const primaryChapter = primaryData?.chapters.find(c => c.number === currentChapter)
  const chapterTitle = primaryChapter?.title || `Chapter ${currentChapter}`

  // Absolute page numbers: content-based, device-independent (~1500 chars per page)
  const CHARS_PER_PAGE = 1500
  const absolutePage = useMemo(() => {
    if (!primaryChapter) return { current: 1, total: 1 }
    const paras = primaryChapter.paragraphs
    const totalChars = paras.reduce((s, p) => s + p.length, 0)
    const total = Math.max(1, Math.ceil(totalChars / CHARS_PER_PAGE))
    const charsBeforeCurrent = paras.slice(0, firstVisibleParagraph).reduce((s, p) => s + p.length, 0)
    const current = Math.min(Math.floor(charsBeforeCurrent / CHARS_PER_PAGE) + 1, total)
    return { current, total }
  }, [primaryChapter, firstVisibleParagraph])

  // Book-level absolute pages (scope='book' for page metric)
  const bookAbsolutePage = useMemo(() => {
    if (!primaryData) return { current: 1, total: 1 }
    let totalChars = 0, charsBefore = 0
    primaryData.chapters.forEach((ch, i) => {
      const chChars = ch.paragraphs.reduce((s, p) => s + p.length, 0)
      if (i < currentChapter - 1) charsBefore += chChars
      else if (i === currentChapter - 1)
        charsBefore += ch.paragraphs.slice(0, firstVisibleParagraph).reduce((s, p) => s + p.length, 0)
      totalChars += chChars
    })
    const total = Math.max(1, Math.ceil(totalChars / CHARS_PER_PAGE))
    return { current: Math.min(Math.floor(charsBefore / CHARS_PER_PAGE) + 1, total), total }
  }, [primaryData, currentChapter, firstVisibleParagraph])

  // Short labels for chapter dropdown
  const chapterLabels = useMemo(() => {
    if (!primaryData) return []
    return primaryData.chapters.map(c => {
      const parts = c.title.split(' — ')
      return parts[0]
    })
  }, [primaryData])

  // Approximate visible paragraphs based on current page position
  const visibleParagraphs = useMemo(() => {
    const paras = primaryChapter?.paragraphs || []
    if (paras.length === 0 || totalPages <= 0) return [] as string[]
    const startIdx = Math.floor((currentPage / Math.max(totalPages, 1)) * paras.length)
    const endIdx = Math.min(startIdx + Math.ceil(paras.length / Math.max(totalPages, 1)) + 1, paras.length)
    return paras.slice(startIdx, endIdx)
  }, [primaryChapter?.paragraphs, currentPage, totalPages])

  const visibleText = useMemo(() => visibleParagraphs.join(' '), [visibleParagraphs])

  // Handle insufficient balance — anonymous users get prompted to sign up,
  // signed-in users get the focused TopUpModal (not the full UsageDashboard,
  // which buries the buy buttons under usage stats and subscription mgmt).
  const handleInsufficientBalance = useCallback(() => {
    if (isAnonymous) {
      setShowAuthModal(true)
    } else {
      setShowTopUp(true)
    }
  }, [isAnonymous])

  // Handle Stripe checkout (subscription or chat packs)
  const handleCheckout = useCallback(async (type: 'subscription' | 'chat_pack_100' | 'chat_pack_200') => {
    if (!session?.access_token) return

    try {
      const response = await fetch(apiUrl('/api/create-checkout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout error:', data)
        alert(`Checkout failed: ${data.error || 'Unknown error'}${data.details ? '\n' + JSON.stringify(data.details) : ''}`)
      }
    } catch (err) {
      console.error('Checkout failed:', err)
      alert('Checkout failed — check console for details')
    }
  }, [session])

  // Handle subscription cancellation (cancel at period end)
  const handleCancelSubscription = useCallback(async () => {
    if (!session?.access_token) return

    try {
      const response = await fetch(apiUrl('/api/cancel-subscription'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      const data = await response.json()
      if (data.canceled) {
        refreshProfile()
      } else if (data.error) {
        alert(`Cancellation failed: ${data.error}`)
      }
    } catch (err) {
      console.error('Cancel failed:', err)
    }
  }, [session, refreshProfile])

  // Check for payment success on URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      refreshProfile()
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [refreshProfile])

  const { conversations: chatConversations, recordMessage, getChapterChatSummary, getChapterConversations, setSummary: setChatSummary } = useChatHistory(book.id, storageReady)
  const [summarizingChatId, setSummarizingChatId] = useState<string | null>(null)

  const handleSummarizeChat = useCallback(async (convId: string) => {
    const conv = chatConversations.find(c => c.id === convId)
    if (!conv || conv.messages.length < 4) return

    setSummarizingChatId(convId)
    try {
      const transcript = conv.messages.map(m =>
        `${m.role === 'user' ? 'Reader' : 'Tinct'}: ${m.content}`
      ).join('\n\n')

      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          system: 'Summarize this reading discussion into 2-4 concise bullet points. Preserve all specific insights, character references, and thematic observations. Do not lose context that would be valuable to revisit later. Be concise but complete.',
          messages: [{ role: 'user', content: transcript }],
        }),
      })

      const data = await response.json()
      const summary = data.content?.[0]?.text
      if (summary) {
        setChatSummary(convId, summary)
      }
    } catch {
      // Silent fail — conversation stays unsummarized
    } finally {
      setSummarizingChatId(null)
    }
  }, [chatConversations, session?.access_token, setChatSummary])

  const { messages, isLoading: chatLoading, sendMessage, clearMessages, loadMessages } = useClaude({
    bookTitle: book.title,
    bookAuthor: book.author,
    chapterTitle,
    readingObjective: preferences.readingObjective,
    visibleText,
    authToken: session?.access_token,
    onInsufficientBalance: handleInsufficientBalance,
    onUsage: deductUsage,
    chatMemory: getChapterChatSummary(currentChapter) || undefined,
  })

  // Load chat history when the book changes. Chat is now ONE continuous
  // conversation per book, not chapter-divided — each message carries its
  // own bookId/chapterNumber/paragraphIndex tag so the reader can click back
  // to where it was sent. Use the Feed if you want chapter-grouped view.
  const chatLoadedForBookRef = useRef<string | null>(null)
  useEffect(() => {
    if (chatLoadedForBookRef.current !== book.id) {
      chatLoadedForBookRef.current = book.id
      clearMessages()
    }
    if (chatConversations.length === 0) return
    const allMsgs: ChatMessage[] = []
    for (const conv of chatConversations) {
      // Defensive filter: storage is keyed per book, but legacy/future bugs
      // could mix. Only show messages whose bookId matches (or is unset).
      if (conv.bookId && conv.bookId !== book.id) continue
      allMsgs.push(...conv.messages.filter(m =>
        !m.chapterDivider &&             // skip persisted chapter-divider markers (legacy bug)
        (m.content || '').trim() !== '' && // skip the empty bodies left behind by that bug
        (!m.bookId || m.bookId === book.id)
      ))
    }
    if (allMsgs.length > 0) loadMessages(allMsgs)
  }, [chatConversations, loadMessages, clearMessages, book.id])

  // One-shot cleanup: prior code persisted chapter-divider markers as fake
  // assistant messages with empty content. They polluted chat-history blobs
  // for every book where the user navigated chapters mid-thread. Strip them
  // and rewrite storage once per session per book. Safe to run multiple times
  // because it's a no-op when the data is already clean.
  const chatCleanupRanRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (!storageReady) return
    if (chatConversations.length === 0) return
    if (chatCleanupRanRef.current.has(book.id)) return
    chatCleanupRanRef.current.add(book.id)

    let dirty = false
    const cleaned: ChatConversation[] = []
    for (const conv of chatConversations) {
      const realMsgs = (conv.messages || []).filter(m =>
        !m.chapterDivider &&
        (m.content || '').trim() !== '' &&
        // Strip transient "Something went wrong / Refresh page" error
        // messages that useClaude.ts wrote into the thread on API failure.
        // refreshAction=true is the unique flag for those errors.
        !m.refreshAction
      )
      if (realMsgs.length !== (conv.messages || []).length) dirty = true
      // Drop conversations that became empty after stripping dividers
      if (realMsgs.length > 0) cleaned.push({ ...conv, messages: realMsgs })
      else if ((conv.messages || []).length > 0) dirty = true
    }
    if (dirty) {
      storage.set(`chat-history:${book.id}`, cleaned)
      console.log(`[chat] cleaned ${chatConversations.length - cleaned.length} polluted conversation(s) for ${book.id}`)
    }
  }, [book.id, chatConversations, storageReady])

  // Global one-shot cleanup: walk every book in the registry once per session
  // and strip divider-pollution from its chat-history blob. Without this, the
  // user has to actually open each polluted book before its history is
  // cleaned. Heavy users (Macbeth = 2300+ divider messages, Odyssey = 50+)
  // would otherwise see junk in the Feed for weeks.
  const globalChatCleanupRanRef = useRef(false)
  useEffect(() => {
    if (!storageReady) return
    if (globalChatCleanupRanRef.current) return
    globalChatCleanupRanRef.current = true

    let totalCleaned = 0
    for (const b of BOOKS) {
      const key = `chat-history:${b.id}`
      const stored = storage.get<ChatConversation[]>(key)
      if (!stored || stored.length === 0) continue
      let dirty = false
      let dupesRemoved = 0
      const cleaned: ChatConversation[] = []
      for (const conv of stored) {
        // Strip dividers + empty bodies (legacy bug) AND collapse duplicate
        // message IDs (chapter-22 bug: a single assistant message getting
        // appended 4–7 times in a row).
        const seenIds = new Set<string>()
        const realMsgs: ChatMessage[] = []
        for (const m of (conv.messages || [])) {
          if (m.chapterDivider) continue
          if ((m.content || '').trim() === '') continue
          // Strip transient API-failure error messages (useClaude.ts adds
          // them with refreshAction=true). They never should have been
          // persisted — they're UI affordances, not real assistant turns.
          if (m.refreshAction) continue
          if (m.id && seenIds.has(m.id)) { dupesRemoved++; continue }
          if (m.id) seenIds.add(m.id)
          realMsgs.push(m)
        }
        if (realMsgs.length !== (conv.messages || []).length) dirty = true
        if (realMsgs.length > 0) cleaned.push({ ...conv, messages: realMsgs })
        else if ((conv.messages || []).length > 0) dirty = true
      }
      if (dirty) {
        storage.set(key, cleaned)
        totalCleaned += stored.length - cleaned.length
        console.log(`[chat] cleaned ${stored.length - cleaned.length} empty conv(s) and ${dupesRemoved} duplicate msg(s) for ${b.id}`)
      }
    }
    if (totalCleaned > 0) {
      console.log(`[chat] global cleanup removed ${totalCleaned} polluted conversation(s) across all books`)
    }
  }, [storageReady])

  // Global one-shot cleanup: reset progress entries that were poisoned by
  // pre-Phase-1 cross-book chapter-index leaks (B1).
  //
  // Symptom Anders saw: The Awakening showed as 100% complete despite never
  // being read. Mechanism: Bible's Genesis 39 chapter index leaked into
  // The Awakening's saved position (39 happens to be exactly The Awakening's
  // chapter count). The progress tracker saw chapterNumber=39 in a 39-chapter
  // book, marked highestCompletedChapter=39, and the value stuck because
  // progress only ever moves up.
  //
  // Heuristic: if highestCompletedChapter is more than 3 chapters ahead of
  // the saved position's chapterNumber, the progress was almost certainly
  // poisoned. Real readers progress = position.chapter or position.chapter-1.
  // The +3 tolerance allows for users who completed chapter N and immediately
  // jumped ahead to read chapters out of order.
  //
  // Conservative: we only delete (not synthesize) progress, so the bar
  // restarts blank rather than guessing. As the user reads forward, progress
  // rebuilds correctly via the normal heartbeat write path.
  const progressCleanupRanRef = useRef(false)
  useEffect(() => {
    if (!storageReady) return
    if (progressCleanupRanRef.current) return
    progressCleanupRanRef.current = true

    let cleaned = 0
    for (const b of BOOKS) {
      const progress = storage.get<{ highestCompletedChapter?: number }>(`progress:${b.id}`)
      if (!progress || typeof progress.highestCompletedChapter !== 'number') continue
      const position = getSavedPosition(b.id)
      const positionChapter = position?.chapterNumber ?? 1
      if (progress.highestCompletedChapter > positionChapter + 3) {
        console.warn(`[progress-cleanup] resetting ${b.id}: progress.highestCompletedChapter=${progress.highestCompletedChapter} >> position.chapterNumber=${positionChapter}`)
        storage.delete(`progress:${b.id}`)
        cleaned++
      }
    }
    if (cleaned > 0) {
      console.log(`[progress-cleanup] reset ${cleaned} corrupted progress entries`)
    }
  }, [storageReady])

  // Handle book change
  const handleBookChange = useCallback((bookId: string) => {
    storage.set('tinct-current-book', bookId)
    setCurrentBookId(bookId)
    const pos = getSavedPosition(bookId)
    setCurrentChapter(pos?.chapterNumber || 1)
    setCurrentPage(0) // will be corrected by Reader from scrollFraction after layout
    setTotalPages(1) // Reset so useReadingPosition guard (totalPages <= 1) prevents stale saves
    savedPos.current = pos
    // Reset target paragraph so the previous book's position doesn't leak.
    // A fresh book (no saved pos) starts on page 1; a returning book uses its own paragraph.
    targetParagraphRef.current = pos?.lastParagraphIndex
    clearMessages()
    setReaderKey(k => k + 1) // Force Reader remount with correct initialPage
  }, [clearMessages])

  const { highlights, addHighlight, removeHighlight, updateHighlightNote, updateHighlightColor, getEditionHighlights, getAllBookHighlights } = useHighlights(book.id, currentChapter)
  const { notes, addNote, deleteNote, updateNote, replaceAllNotes, getAllBookNotes } = useNotes(book.id, currentChapter)

  // Effective paragraph: audio position takes priority over reading position
  const effectiveParagraph = audioPlayingParagraph ?? firstVisibleParagraph
  const chapterParagraphCount = primaryChapter?.paragraphs.length

  // Suspend position writes whenever an overlay/auth/onboarding flow is in
  // front of the reader. **INVARIANT 3** in CLAUDE.md.
  //
  // The reader is "non-reading" in these states — any heartbeat or
  // visibility-driven write risks capturing stale or default in-memory
  // state (B19: modal interaction → bad chapter-1 write).
  //
  // We only suspend for flows that explicitly displace the reader OR involve
  // identity changes (auth, subscription). Settings / search / TOC stay
  // write-enabled because the user is mid-reading and likely to resume on
  // the same page. If you add a new full-screen overlay, ADD IT HERE.
  const writeSuspended =
    showAuthModal ||
    showPricingModal ||
    showStore ||
    showBookOnboarding ||
    showFixModal ||
    isPasswordRecovery ||
    libraryEmpty

  useReadingPosition(book.id, currentChapter, currentPage, totalPages, totalChapters, storageReady, effectiveParagraph, writeSuspended)
  const isAudioActive = audioPlayingParagraph !== undefined
  const { log: readingLog } = useReadingLog(book.id, currentChapter, primaryEditionKey, currentPage, totalPages, storageReady, effectiveParagraph, chapterParagraphCount, isAudioActive)

  const { threadsData, getMentions } = useThreads(book.id, primaryData)

  // All chapter paragraphs for word counting (reading speed model)
  const allParagraphs = useMemo(() => {
    if (!primaryData) return null
    return primaryData.chapters.map(c => c.paragraphs)
  }, [primaryData])

  const {
    percentComplete: readingPercent,
    timeRemainingLabel,
    isLearned: isSpeedLearned,
    wordsPerMinute,
    trackPageView,
  } = useReadingSpeed(book.id, currentChapter, currentPage, totalPages, totalChapters, allParagraphs)

  // Running-footer progress label — honors preferences.progressDisplay
  // (percent / page / time / location × book / chapter / section). The
  // Reader and SplitReader render this to the right of the chapter title.
  // Recomputed whenever any input changes so toggling the metric in
  // Settings updates the footer immediately. (Same logic the old
  // BottomBar used; extracted to formatProgressLabel.)
  const chapterPercentComplete = totalPages > 1 ? Math.round(((currentPage + 1) / totalPages) * 100) : 100
  const chapterTimeLabel = useMemo(() => {
    if (totalPages <= 1) return 'Done'
    const chapterWords = primaryChapter?.paragraphs.reduce((s, p) => s + p.split(/\s+/).length, 0) || 0
    const pagesAhead = Math.max(0, totalPages - currentPage)
    const wordsLeft = Math.round(chapterWords * pagesAhead / totalPages)
    const wpm = wordsPerMinute > 0 ? wordsPerMinute : 250
    const rawSecs = (wordsLeft / wpm) * 60
    if (rawSecs <= 5) return 'Done'
    if (rawSecs < 90) return `${Math.max(5, Math.round(rawSecs / 5) * 5)}s left`
    return `${Math.round(rawSecs / 60)}min left`
  }, [primaryChapter, currentPage, totalPages, wordsPerMinute])
  const progressLabel = useMemo(() => formatProgressLabel({
    progressDisplay: preferences.progressDisplay,
    percentComplete: readingPercent,
    timeRemainingLabel,
    isLearned: isSpeedLearned,
    currentPage,
    totalPages,
    absoluteCurrentPage: absolutePage.current,
    absoluteTotalPages: absolutePage.total,
    bookCurrentPage: bookAbsolutePage.current,
    bookTotalPages: bookAbsolutePage.total,
    chapterPercentComplete,
    chapterTimeLabel,
    locationCurrent: primaryData ? primaryData.chapters.slice(0, currentChapter - 1).reduce((sum, c) => sum + c.paragraphs.length, 0) + (firstVisibleParagraph || 0) : 0,
    locationTotal: primaryData ? primaryData.chapters.reduce((sum, c) => sum + c.paragraphs.length, 0) : 0,
    locationCurrentChapter: firstVisibleParagraph,
    locationTotalChapter: primaryChapter?.paragraphs.length,
  }), [preferences.progressDisplay, readingPercent, timeRemainingLabel, isSpeedLearned, currentPage, totalPages, absolutePage, bookAbsolutePage, chapterPercentComplete, chapterTimeLabel, primaryData, primaryChapter, currentChapter, firstVisibleParagraph])


  // Navigate to a chapter (and optionally a paragraph/edition) from side panel
  const handleNavigateToChapter = useCallback((chapter: number, paragraphIndex?: number, editionKey?: string) => {
    // Save current position + edition for "back" button
    const frac = totalPages > 1 ? currentPage / (totalPages - 1) : 0
    setBackPosition({
      chapter: currentChapter,
      scrollFraction: frac,
      style: preferences.style,
      language: preferences.language,
    })
    // Auto-dismiss after 10s
    if (backTimeoutRef.current) clearTimeout(backTimeoutRef.current)
    backTimeoutRef.current = setTimeout(() => setBackPosition(null), 10000)

    // Switch edition if highlight was made in a different one
    if (editionKey) {
      const parts = editionKey.split('-')
      const hlStyle = parts[0] as Style
      const hlLang = parts.slice(1).join('-') as 'en' | 'da'
      if (hlStyle !== preferences.style) setStyle(hlStyle)
      if (hlLang !== preferences.language) setLanguage(hlLang)
    }

    targetParagraphRef.current = paragraphIndex
    // Always reset savedPos so the Reader lands on page 1 of the chosen
    // chapter (or on the target paragraph if one was passed). Even when the
    // user taps the current chapter in the TOC, we want to snap to page 1 —
    // no "smart" restore to their previous position within the chapter.
    savedPos.current = {
      bookId: book.id,
      chapterNumber: chapter,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: paragraphIndex !== undefined ? -1 : 0,
    }
    // Snap firstVisibleParagraph to the destination immediately. If we don't,
    // the BottomBar's "absolute page" calc (which takes paragraphs.slice(0,
    // firstVisibleParagraph) of the NEW chapter) shows page 2 or 3 for a
    // beat — looks like ToC took you to the wrong page. Reader will re-emit
    // onFirstVisibleParagraph after layout, which will overwrite this with
    // the same value when no paragraph target was set.
    setFirstVisibleParagraph(paragraphIndex ?? 0)
    setCurrentPage(0)
    setTotalPages(1)
    if (chapter !== currentChapter) {
      setCurrentChapter(chapter)
    }
    setReaderKey(k => k + 1)
  }, [currentChapter, currentPage, totalPages, preferences.style, preferences.language, setStyle, setLanguage, book.id])

  // Go back to saved position (restores edition + chapter + page)
  const handleBackToPosition = useCallback(() => {
    if (!backPosition) return
    targetParagraphRef.current = undefined
    // Restore edition
    if (backPosition.style !== preferences.style) setStyle(backPosition.style)
    if (backPosition.language !== preferences.language) setLanguage(backPosition.language)
    savedPos.current = {
      bookId: book.id,
      chapterNumber: backPosition.chapter,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: backPosition.scrollFraction,
    }
    if (backPosition.chapter !== currentChapter) {
      setCurrentChapter(backPosition.chapter)
    }
    setReaderKey(k => k + 1)
    setBackPosition(null)
    if (backTimeoutRef.current) clearTimeout(backTimeoutRef.current)
  }, [backPosition, currentChapter, book.id, preferences.style, preferences.language, setStyle, setLanguage])

  // Handle page changes from Reader — track reading speed
  const handlePageChange = useCallback((page: number, total: number) => {
    // Track reading speed before updating page
    if (primaryChapter && total > 0) {
      const wordsOnPage = Math.ceil(
        primaryChapter.paragraphs.reduce((s, p) => s + p.split(/\s+/).length, 0) / Math.max(total, 1)
      )
      trackPageView(wordsOnPage)
    }
    setCurrentPage(page)
    setTotalPages(total)
    // Dismiss back-to-position on manual page turn (but not on initial layout)
    if (backPosition && total > 1) {
      setBackPosition(null)
      if (backTimeoutRef.current) clearTimeout(backTimeoutRef.current)
    }
  }, [primaryChapter, trackPageView, backPosition])

  // Onboarding complete handler
  const handleOnboardingComplete = useCallback((objective: string) => {
    setReadingObjective(objective)
    if (objective) storage.set(`reading-angle:${book.id}`, objective)
    setOnboardingComplete(true)
  }, [setReadingObjective, setOnboardingComplete, book.id])

  // Per-book wrapper around setReadingObjective. Every "user changed the
  // reading angle" code path (settings sheet, inline editor, mobile
  // settings) goes through this so the angle persists keyed by current
  // book — never leaks to the next book opened (B24).
  const setReadingAngleForCurrentBook = useCallback((angle: string) => {
    setReadingObjective(angle)
    if (angle) storage.set(`reading-angle:${book.id}`, angle)
    else storage.delete(`reading-angle:${book.id}`)
  }, [setReadingObjective, book.id])

  // Deep-link URL parser — runs once, determines entry mode + book
  useEffect(() => {
    if (deepLinkParsedRef.current || !storageReady) return
    deepLinkParsedRef.current = true
    try {
      const path = window.location.pathname
      const segments = path.split('/').filter(Boolean)
      if (segments.length === 0) return
      const first = segments[0]
      // `/read` or `/read/{bookId}` — library entry, full mode
      if (first === 'read') {
        if (segments[1]) {
          const target = BOOKS.find(b => b.id === segments[1])
          if (target) {
            handleBookChange(target.id)
            setBookOnboardingMode('full')
          }
        }
        return
      }
      // `/{bookId}` — direct deep link, edition-only mode
      const target = BOOKS.find(b => b.id === first)
      if (target) {
        handleBookChange(target.id)
        setBookOnboardingMode('edition-only')
      }
    } catch { /* ignore */ }
  }, [storageReady])

  // One-time migration: grandfather in users who started reading before the
  // onboarding system existed. For each book in their library that has a
  // saved position but no onboarded flag, set the flag once. After this
  // runs, the trigger effect below can use the explicit flag as the only
  // gate — no more "hasPosition" fallback that gets shadowed by phantom
  // positions (B10: Anders saw Apology and Peloponnesian War skip
  // onboarding because phantom cloud positions made hasPosition=true).
  const onboardingMigrationRanRef = useRef(false)
  useEffect(() => {
    if (!storageReady) return
    if (onboardingMigrationRanRef.current) return
    onboardingMigrationRanRef.current = true
    let migrated = 0
    for (const id of libraryIds) {
      if (storage.get(`book-onboarded:${id}`)) continue
      let legacy = false
      try { legacy = !!localStorage.getItem(`tinct-book-onboarded-${id}`) } catch { /* ignore */ }
      if (legacy) { storage.set(`book-onboarded:${id}`, true); migrated++; continue }
      // Heuristic for "user has actually read this book": position exists
      // AND has either a chapter > 1 OR a non-zero scrollFraction. A
      // chapter-1 + scrollFraction=0 position is almost certainly a phantom
      // (or never-actually-read default).
      const pos = storage.get<{ chapterNumber?: number; scrollFraction?: number }>(`position:${id}`)
      if (pos && ((pos.chapterNumber ?? 1) > 1 || (pos.scrollFraction ?? 0) > 0.05)) {
        storage.set(`book-onboarded:${id}`, true)
        migrated++
      }
    }
    if (migrated > 0) console.log(`[onboarding-migration] grandfathered ${migrated} book(s) with existing reading progress`)
  }, [storageReady, libraryIds])

  // Book Onboarding trigger — fires when current book hasn't been onboarded yet.
  // Uses ONLY the explicit flag (set on completion or close, plus the migration
  // above for legacy users). Phantom positions no longer suppress onboarding.
  useEffect(() => {
    if (!storageReady) return
    if (libraryEmpty || showStore) {
      setShowBookOnboarding(false)
      return
    }
    const seen = storage.get<boolean>(`book-onboarded:${book.id}`)
    let legacy = false
    try { legacy = !!localStorage.getItem(`tinct-book-onboarded-${book.id}`) } catch { /* ignore */ }
    if (legacy && !seen) storage.set(`book-onboarded:${book.id}`, true)
    setShowBookOnboarding(!(seen || legacy))
  }, [book.id, storageReady, libraryEmpty, showStore])

  // Book Onboarding completion — sets edition + angle, marks book as onboarded.
  // Note: uses primitive setters (setStyle/setLanguage/setSplitEditionKey) rather than
  // the higher-level handlers, because those are declared later in this component.
  const handleBookOnboardingComplete = useCallback((result: BookOnboardingResult) => {
    const chosenEdition = book.editions.find(e => e.key === result.editionKey)
    if (chosenEdition) {
      setLanguage(chosenEdition.language)
      setStyle(chosenEdition.style)
    }
    if (result.splitEditionKey) {
      setSplitEditionKey(result.splitEditionKey)
      if (!preferences.splitView) toggleSplitView()
    }
    if (result.angle) {
      setReadingObjective(result.angle)
      // Persist per-book so it doesn't leak across books (B24). The
      // bookId-change effect re-loads this key on every book switch.
      storage.set(`reading-angle:${book.id}`, result.angle)
    }
    storage.set(`book-onboarded:${book.id}`, true)
    setShowBookOnboarding(false)
    setOnboardingComplete(true)
  }, [book.id, book.editions, setLanguage, setStyle, setSplitEditionKey, preferences.splitView, toggleSplitView, setReadingObjective, setOnboardingComplete])

  const handleBookOnboardingClose = useCallback(() => {
    storage.set(`book-onboarded:${book.id}`, true)
    setShowBookOnboarding(false)
    setOnboardingComplete(true)
  }, [book.id, setOnboardingComplete])

  // Progress prompt trigger — anonymous user past end of Chapter 1 or page 20
  const showProgressPrompt = useMemo(() => {
    if (user) return false
    if (showBookOnboarding || showStore) return false
    const past = currentChapter >= 2 || (currentChapter === 1 && currentPage >= 20)
    return past
  }, [user, currentChapter, currentPage, showBookOnboarding, showStore])

  // Edit objective from chat welcome
  const [editingObjective, setEditingObjective] = useState(false)
  const handleEditObjective = useCallback(() => {
    setEditingObjective(true)
  }, [])

  // Determine if editions are verse (for ParagraphRenderer)
  const primaryIsVerse = preferences.style === 'verse'
  const splitIsVerse = (() => {
    const splitEd = book.editions.find(ed => ed.key === preferences.splitEditionKey)
    return splitEd?.style === 'verse'
  })()

  // Get aligned editions for split pane (excluding current primary)
  // All aligned editions (the picker UI uses this list — user can pick the
  // same edition for both panes if they want; we don't override their intent).
  // Previous behavior excluded primary here, which silently substituted a
  // different edition when the user explicitly picked original/original or
  // modern/modern — the displayed compare pane disagreed with the dropdown.
  const alignedEditions = useMemo(() => {
    return book.editions.filter(ed => ed.aligned)
  }, [book.editions])

  // Split edition key — validate against the full aligned list (including
  // primary), so the user's choice is always honored. Default fallback when
  // no preference is set (or when the saved key isn't valid for this book)
  // prefers a *different* edition for usefulness, but only as a default.
  const splitEditionKey = useMemo(() => {
    const preferred = preferences.splitEditionKey
    const exists = alignedEditions.some(ed => ed.key === preferred)
    if (exists) return preferred
    // No saved preference matches: prefer something different from primary
    // for a useful first-time split-view, then any aligned edition.
    return alignedEditions.find(ed => ed.key !== primaryEditionKey)?.key
      || alignedEditions[0]?.key
      || 'modern-en'
  }, [preferences.splitEditionKey, alignedEditions, primaryEditionKey])

  // Load primary edition
  useEffect(() => {
    setIsLoading(true)
    setPrimaryLoadError(null)
    loadEdition(book.id, primaryEditionKey)
      .then(data => {
        setPrimaryData(data)
        setIsLoading(false)
        // Safety: if the saved chapter doesn't exist or has no content, reset to chapter 1
        const ch = data.chapters.find(c => c.number === currentChapter)
        if (!ch || ch.paragraphs.length === 0) {
          setCurrentChapter(1)
          setCurrentPage(0)
        }
      })
      .catch(err => {
        console.error(`[App] Failed to load primary edition ${book.id}/${primaryEditionKey}:`, err)
        setPrimaryData(null)
        setPrimaryLoadError(err?.message || 'Could not load this edition.')
        setIsLoading(false)
      })
  }, [book.id, primaryEditionKey])

  // Preload split edition so it's ready when toggle happens.
  // Failures here are non-fatal — Compare just won't render — so we
  // swallow the rejection rather than surfacing it.
  useEffect(() => {
    loadEdition(book.id, splitEditionKey)
      .then(setSplitData)
      .catch(() => setSplitData(null))
  }, [splitEditionKey, book.id])

  const splitChapter = splitData?.chapters.find(c => c.number === currentChapter)

  // Get available styles for current language
  const availableStyles = useMemo(() => {
    return book.editions
      .filter(ed => ed.language === preferences.language)
      .map(ed => ({ style: ed.style, label: ed.label }))
  }, [preferences.language])

  // Check if split view is available
  const splitViewAvailable = alignedEditions.length > 0

  // Effective audio edition — separate from primary, falls back to first edition with audio
  const effectiveAudioEditionKey = useMemo(() => {
    if (audioEditionKey && book.editions.some(ed => ed.hasAudio && ed.key === audioEditionKey)) {
      return audioEditionKey
    }
    // Use primary if it has audio
    if (book.editions.some(ed => ed.hasAudio && ed.key === primaryEditionKey)) {
      return primaryEditionKey
    }
    // Fall back to any edition that has audio
    const audioEd = book.editions.find(ed => ed.hasAudio)
    return audioEd?.key || primaryEditionKey
  }, [audioEditionKey, primaryEditionKey, book.editions])

  // Get edition label
  const primaryEdition = book.editions.find(ed => ed.key === primaryEditionKey)
  const editionLabel = primaryEdition?.label || primaryEditionKey

  // Clear chat when changing chapters (chat is chapter-scoped)
  const prevChapterRef = useRef(currentChapter)
  useEffect(() => {
    prevChapterRef.current = currentChapter
  }, [currentChapter])

  // When language changes, check if current style is available
  useEffect(() => {
    const hasStyle = book.editions.some(
      ed => ed.language === preferences.language && ed.style === preferences.style
    )
    if (!hasStyle) {
      const fallback = book.editions.find(ed => ed.language === preferences.language)
      if (fallback) setStyle(fallback.style)
    }
  }, [preferences.language, preferences.style, setStyle])

  // Handle text selection → chat
  const handleTextSelect = useCallback((text: string) => {
    setPendingHighlight(text)
    if (preferences.panelTab !== 'chat') setPanelTab('chat')
    if (!preferences.panelOpen) togglePanel()
  }, [preferences.panelTab, preferences.panelOpen, setPanelTab, togglePanel])

  // Handle highlighting in single reader
  const handleHighlight = useCallback((
    paragraphIndex: number,
    startOffset: number,
    endOffset: number,
    text: string,
    color: HighlightColor,
  ) => {
    addHighlight(primaryEditionKey, paragraphIndex, startOffset, endOffset, text, color)
  }, [addHighlight, primaryEditionKey])

  // Handle highlighting in split reader
  const handleSplitHighlight = useCallback((
    paragraphIndex: number,
    startOffset: number,
    endOffset: number,
    text: string,
    color: HighlightColor,
    side: 'left' | 'right',
  ) => {
    const edKey = side === 'left' ? primaryEditionKey : splitEditionKey
    addHighlight(edKey, paragraphIndex, startOffset, endOffset, text, color)
  }, [addHighlight, primaryEditionKey, splitEditionKey])

  // Record assistant messages to chat history when they arrive.
  // Defensive guards: never persist a divider marker, never persist an empty
  // body. Both shielded the storage from a bug where divider markers (role:
  // 'assistant', content: '', chapterDivider: N) were being written as real
  // messages and rendered as blank chat after the divider rendering was
  // changed to skip them.
  const lastRecordedMsgRef = useRef<string | null>(null)
  useEffect(() => {
    if (messages.length === 0) return
    const last = messages[messages.length - 1]
    if (
      last.role === 'assistant' &&
      !last.chapterDivider &&
      // Don't persist transient "Something went wrong" / Refresh-page error
      // messages from useClaude.ts. Those are UI affordances for the current
      // session only — recording them was the source of the polluted chat
      // history Anders found (B25).
      !last.refreshAction &&
      (last.content || '').trim() !== '' &&
      last.id !== lastRecordedMsgRef.current
    ) {
      lastRecordedMsgRef.current = last.id
      recordMessage(last, currentChapter, firstVisibleParagraph)
    }
  }, [messages, recordMessage, currentChapter, firstVisibleParagraph])

  // Chat message handler — also records to chat history
  const handleSendMessage = useCallback((content: string, highlightedText?: string) => {
    // Record user message to history
    recordMessage({
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      highlightedText,
    }, currentChapter, firstVisibleParagraph)
    sendMessage(content, highlightedText)
  }, [sendMessage, recordMessage, currentChapter, firstVisibleParagraph])

  // Copy to notes from chat
  const handleCopyToNotes = useCallback((content: string) => {
    addNote(content, 'from-chat')
    setPanelTab('notes')
  }, [addNote, setPanelTab])

  // AI note cleanup
  const handleCleanupNotes = useCallback(async (aggressive: boolean) => {
    if (notes.length === 0) return
    setIsCleaningUp(true)

    const allContent = notes.map(n => n.content).join('\n\n---\n\n')
    const prompt = aggressive
      ? `Synthesize these reading notes into a brief, dense summary — the essential insights only. Target 30-50% of the original length. Organize by theme, not chronologically. Cut anything redundant or peripheral. Use **bold** for key terms.\n\nNotes:\n${allContent}`
      : `Clean up these reading notes: fix any typos, remove redundancies, and improve clarity. Keep the original structure and voice. Use **bold** for key terms and section headings.\n\nNotes:\n${allContent}`

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: 'You are a helpful editor. Return only the cleaned-up text, nothing else.',
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (response.status === 402) {
        handleInsufficientBalance()
        return
      }

      const data = await response.json()
      const cleanedText = data.content?.[0]?.text

      // Track usage
      if (data.usage) {
        deductUsage()
      }

      if (cleanedText) {
        replaceAllNotes([{
          id: `note_${Date.now()}_cleaned`,
          bookId: book.id,
          chapterNumber: currentChapter,
          content: cleanedText,
          sourceType: 'freeform',
          timestamp: Date.now(),
        }])
      }
    } catch (err) {
      console.error('Note cleanup failed:', err)
    } finally {
      setIsCleaningUp(false)
    }
  }, [notes, currentChapter, replaceAllNotes, session, handleInsufficientBalance, deductUsage])

  // End-of-book summary generation
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const handleGenerateSummary = useCallback(async () => {
    setIsGeneratingSummary(true)
    try {
      const allHighlights = getAllBookHighlights()
      const allNotes = getAllBookNotes()

      const highlightTexts = allHighlights
        .sort((a, b) => a.chapterNumber - b.chapterNumber || a.paragraphIndex - b.paragraphIndex)
        .map(h => `[Book ${h.chapterNumber}] "${h.text}"${h.note ? ` — Note: ${h.note}` : ''}`)
        .join('\n')

      const noteTexts = allNotes
        .sort((a, b) => a.chapterNumber - b.chapterNumber)
        .map(n => `[Book ${n.chapterNumber}] ${n.content}`)
        .join('\n')

      const hasContent = highlightTexts || noteTexts
      const readingAngle = preferences.readingObjective
        ? `\n\nThe reader's reading angle was: "${preferences.readingObjective}". Weave this perspective into the summary where it naturally connects.`
        : ''

      const prompt = hasContent
        ? `The reader has finished The Odyssey by Homer. Here are all their highlights and notes from across the book:\n\n${highlightTexts ? `HIGHLIGHTS:\n${highlightTexts}\n\n` : ''}${noteTexts ? `NOTES:\n${noteTexts}\n\n` : ''}Create a rich, personal reading journal summary that:\n1. Reflects back the reader's journey through the book based on what they highlighted and noted\n2. Identifies the themes and passages that clearly mattered most to them\n3. Connects their observations across chapters into larger patterns\n4. Adds 2-3 deeper insights the reader might not have explicitly noted but that emerge from their pattern of attention\n\nWrite in second person ("You were drawn to..."). Be warm and literary, not academic. Keep it to 400-600 words.${readingAngle}`
        : `The reader has finished The Odyssey by Homer but didn't leave highlights or notes. Write a brief, warm reflection on completing The Odyssey — what makes this journey meaningful, and what they might notice on a re-read. Keep it to 200 words.${readingAngle}`

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: 'You are a thoughtful literary companion creating a personal reading journal summary. Be warm, specific, and insightful.',
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (response.status === 402) {
        handleInsufficientBalance()
        return
      }

      const data = await response.json()
      const summaryText = data.content?.[0]?.text

      if (data.usage) {
        deductUsage()
      }

      if (summaryText) {
        addNote(`READING JOURNAL — The Odyssey\n\n${summaryText}`, 'freeform')
        setPanelTab('notes')
        if (!preferences.panelOpen) togglePanel()
      }
    } catch (err) {
      console.error('Summary generation failed:', err)
    } finally {
      setIsGeneratingSummary(false)
    }
  }, [getAllBookHighlights, getAllBookNotes, preferences.readingObjective, preferences.panelOpen, addNote, setPanelTab, togglePanel, session, handleInsufficientBalance, deductUsage])

  // Chapter reflection
  const handleReflect = useCallback(() => {
    const chapterTitle = primaryChapter?.title || `Book ${currentChapter}`
    const reflectPrompt = `I've just finished reading ${chapterTitle} of ${book.title}. Help me reflect on the key themes, memorable moments, and anything I might have missed.`
    setPanelTab('chat')
    if (isMobile) {
      setActiveView(2)
    } else if (!preferences.panelOpen) {
      togglePanel()
    }
    sendMessage(reflectPrompt)
  }, [primaryChapter, currentChapter, book.title, setPanelTab, isMobile, setActiveView, preferences.panelOpen, togglePanel, sendMessage])

  // Audio paragraph change handler
  const handleAudioParagraphChange = useCallback((paragraphIndex: number) => {
    setAudioPlayingParagraph(paragraphIndex)
  }, [])

  // Audio paragraph click handler (tap-to-play)
  const handleParagraphClick = useCallback((paragraphIndex: number) => {
    bottomBarRef.current?.seekToParagraph(paragraphIndex)
  }, [])

  // Detect if audio is available for the current chapter.
  //
  // Trust registry metadata optimistically — if any edition has hasAudio=true,
  // assume audio works for this book. Then run a HEAD probe as confirmation,
  // and downgrade to false only on a real 404. We do NOT downgrade on probe
  // failure (network error / CORS block) because R2 only whitelists the
  // `https://tinct.app` origin for CORS, so the Capacitor APK (which runs
  // at `https://localhost`) sees its HEAD request blocked by the browser
  // before the response is even inspected. Trusting metadata makes the
  // audio icon show on APK; playback via the `<audio>` element works
  // cross-origin regardless (audio/video tags are not subject to CORS in
  // the same way as fetch).
  useEffect(() => {
    if (audioEditionKey === 'none') { setHasAudio(false); return }
    const anyAudioEdition = book.editions.some(e => e.hasAudio)
    if (!anyAudioEdition) {
      setHasAudio(false)
      return
    }
    setHasAudio(true)
    const url = `${AUDIO_BASE_URL}/${book.id}/${effectiveAudioEditionKey}/ch${currentChapter}/manifest.json`
    fetch(url, { method: 'HEAD' })
      .then(res => {
        if (!res.ok) setHasAudio(false)
        // res.ok → leave the optimistic true in place
      })
      .catch(() => {
        // Probe blocked (CORS on APK) or offline — keep the optimistic true.
        // Playback will still fail gracefully if the manifest truly isn't there.
      })
  }, [book.id, book.editions, effectiveAudioEditionKey, currentChapter, audioEditionKey])

  // User-initiated chapter advance is debounced (500ms) so a single tap
  // can't turn into a double chapter skip on e-ink devices where ghost
  // taps are common during the post-remount transient layout state.
  // Audio-driven chapter advance (onChapterEnd) calls handleNextChapter
  // directly and is NOT debounced — it must always fire when playback
  // crosses the chapter boundary.
  const userAdvanceLockRef = useRef(0)
  const userChapterNext = useCallback(() => {
    const now = Date.now()
    if (now - userAdvanceLockRef.current < 500) return
    userAdvanceLockRef.current = now
    handleNextChapterRef.current?.()
  }, [])
  const userChapterPrev = useCallback(() => {
    const now = Date.now()
    if (now - userAdvanceLockRef.current < 500) return
    userAdvanceLockRef.current = now
    handlePrevChapterRef.current?.()
  }, [])

  // Chapter navigation from page arrows or audio chapter-end
  // When advancing forward, mark the current chapter as completed in progress
  // (covers the audio case where page never reaches the last page)
  const handleNextChapter = useCallback(() => {
    if (currentChapter < totalChapters) {
      const existing = getReadingProgress(book.id)
      const prev = existing?.highestCompletedChapter || 0
      if (currentChapter > prev) {
        storage.set(`progress:${book.id}`, {
          bookId: book.id,
          highestCompletedChapter: currentChapter,
          totalChapters,
          percent: Math.round((currentChapter / totalChapters) * 100),
        })
      }
      targetParagraphRef.current = undefined
      // Forward across chapter boundary → always first page of next chapter
      savedPos.current = {
        bookId: book.id,
        chapterNumber: currentChapter + 1,
        currentPage: 0,
        totalPages: 1,
        scrollFraction: 0,
      }
      setFirstVisibleParagraph(0)
      setCurrentPage(0)
      setTotalPages(1)
      setCurrentChapter(currentChapter + 1)
      setReaderKey(k => k + 1) // Remount so currentPage resets and initialPage re-applies
    }
  }, [currentChapter, totalChapters, book.id])
  const handlePrevChapter = useCallback(() => {
    if (currentChapter > 1) {
      targetParagraphRef.current = undefined
      // Back across chapter boundary → always last page of previous chapter
      // (scrollFraction: 1 forces last page regardless of any prior reading
      // position for that chapter)
      savedPos.current = {
        bookId: book.id,
        chapterNumber: currentChapter - 1,
        currentPage: 0,
        totalPages: 1,
        scrollFraction: 1,
      }
      setFirstVisibleParagraph(0) // Reader will re-emit after layout once it knows where the last page lands
      setCurrentPage(0)
      setTotalPages(1)
      setCurrentChapter(currentChapter - 1)
      setReaderKey(k => k + 1) // Remount so currentPage resets and initialPage re-applies
    }
  }, [currentChapter, book.id])

  // Refs so the debounced user-nav wrappers always see the latest handlers
  // without having to be recreated on every currentChapter change.
  const handleNextChapterRef = useRef(handleNextChapter)
  handleNextChapterRef.current = handleNextChapter
  const handlePrevChapterRef = useRef(handlePrevChapter)
  handlePrevChapterRef.current = handlePrevChapter

  // Wrap split view toggle to preserve position
  const handleToggleSplitView = useCallback(() => {
    // Compute first visible paragraph directly from the DOM to avoid stale state
    let visiblePara = firstVisibleParagraph
    const content = readerRef.current?.querySelector('.reader-columns') as HTMLElement | null
    if (content) {
      const colWidth = content.offsetWidth
      const gap = parseInt(getComputedStyle(content).columnGap || '0', 10)
      const pageLeft = currentPage * (colWidth + gap)
      const pageRight = pageLeft + colWidth
      const paraEls = content.querySelectorAll('[data-paragraph-index]')
      for (const el of paraEls) {
        const htmlEl = el as HTMLElement
        if (htmlEl.offsetLeft < pageRight && htmlEl.offsetLeft + htmlEl.offsetWidth > pageLeft) {
          visiblePara = parseInt(htmlEl.getAttribute('data-paragraph-index') || '0', 10)
          break
        }
      }
    }
    // Anchor restore by paragraph index — page counts differ between single and split
    targetParagraphRef.current = visiblePara
    const frac = totalPages > 1 ? currentPage / (totalPages - 1) : 0
    savedPos.current = {
      bookId: book.id,
      chapterNumber: currentChapter,
      currentPage,
      totalPages,
      scrollFraction: frac,
      lastParagraphIndex: visiblePara,
    }
    toggleSplitView()
    setReaderKey(k => k + 1)
  }, [toggleSplitView, currentPage, totalPages, currentChapter, book.id, firstVisibleParagraph])

  // Handle style change with fallback for split edition
  const handleStyleChange = useCallback((newStyle: Style) => {
    setStyle(newStyle)
    const newPrimaryKey = makeEditionKey(newStyle, preferences.language)
    if (newPrimaryKey === splitEditionKey) {
      const alt = alignedEditions.find(ed => ed.key !== newPrimaryKey)
      if (alt) setSplitEditionKey(alt.key)
    }
  }, [setStyle, preferences.language, splitEditionKey, alignedEditions, setSplitEditionKey])

  // Inline objective editor state
  const [inlineObjective, setInlineObjective] = useState(preferences.readingObjective)
  useEffect(() => {
    if (editingObjective) setInlineObjective(preferences.readingObjective)
  }, [editingObjective, preferences.readingObjective])

  // Auto-set accountDecisionSeen for existing users with accounts
  useEffect(() => {
    if (user && !preferences.accountDecisionSeen) {
      setAccountDecisionSeen(true)
    }
  }, [user, preferences.accountDecisionSeen, setAccountDecisionSeen])

  // (showAccountDecision is declared up top alongside the other modal state.)

  // Show loading skeleton while auth + storage are resolving (prevents writing defaults to cloud)
  if (!storageReady) {
    return (
      <div className="app">
        <div className="loading-shell">
          <div className="loading-spinner" />
        </div>
      </div>
    )
  }

  // Wait for cloud storage to load before rendering (prevents flash of ch1 on fresh installs)
  if (user && !storageReady) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}>
        <p>Loading your library...</p>
      </div>
    )
  }

  return (
    <TierProvider user={user} profile={profile}>
    <div className={`app ${hasAudio ? 'has-audio' : ''} ${focusMode ? 'focus-mode' : ''}`}>
      {focusMode && (
        <button
          className="focus-exit"
          onClick={() => setFocusMode(false)}
          aria-label="Exit focus mode"
          title="Exit focus (F or Esc)"
        >
          ×
        </button>
      )}
      {/* New user: show store first, then onboarding after picking a book */}
      {(libraryEmpty || showStore) && (
        <BookStore
          books={BOOKS}
          libraryIds={libraryIds}
          onAddBook={addBook}
          onRemoveBook={(bookId) => {
            if (bookId === currentBookId) handleBookChange(libraryIds.find(id => id !== bookId) || BOOKS[0].id)
            removeBook(bookId)
          }}
          onSelectBook={(bookId) => {
            handleBookChange(bookId)
            setShowStore(false)
          }}
          onClose={!libraryEmpty ? () => setShowStore(false) : undefined}
        />
      )}

      {!libraryEmpty && !showStore && showBookOnboarding && (
        <BookOnboarding
          book={book}
          editions={book.editions}
          mode={bookOnboardingMode}
          defaultEditionKey={primaryEditionKey}
          showAccountStep={!user}
          onComplete={handleBookOnboardingComplete}
          onClose={handleBookOnboardingClose}
          onCreateAccount={() => {
            setAuthModalMode('signup')
            setShowAuthModal(true)
          }}
          onBackToLibrary={() => {
            setShowBookOnboarding(false)
            setShowStore(true)
          }}
          readingLanguages={preferences.readingLanguages}
          onReadingLanguagesChange={setReadingLanguages}
        />
      )}

      {showProgressPrompt && (
        <ProgressPrompt
          bookId={book.id}
          onCreateAccount={() => {
            setAuthModalMode('signup')
            setShowAuthModal(true)
          }}
        />
      )}

      <SettingsSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={preferences.darkMode}
        onToggleDarkMode={toggleDarkMode}
        chatHidden={preferences.chatHidden}
        onToggleChatHidden={() => setChatHidden(!preferences.chatHidden)}
        feedHidden={preferences.feedHidden}
        onToggleFeedHidden={() => setFeedHidden(!preferences.feedHidden)}
        castHidden={preferences.castHidden}
        onToggleCastHidden={() => setCastHidden(!preferences.castHidden)}
        fontSize={preferences.fontSize}
        onFontSizeChange={(size) => {
          const frac = totalPages > 1 ? currentPage / (totalPages - 1) : 0
          savedPos.current = {
            bookId: book.id,
            chapterNumber: currentChapter,
            currentPage,
            totalPages,
            scrollFraction: frac,
          }
          setFontSize(size)
          setReaderKey(k => k + 1)
        }}
        fontFamily={preferences.fontFamily}
        onFontFamilyChange={(family) => {
          const frac = totalPages > 1 ? currentPage / (totalPages - 1) : 0
          savedPos.current = {
            bookId: book.id,
            chapterNumber: currentChapter,
            currentPage,
            totalPages,
            scrollFraction: frac,
          }
          setFontFamily(family)
          setReaderKey(k => k + 1)
        }}
        allEditions={book.editions}
        primaryEditionKey={primaryEditionKey}
        language={preferences.language}
        style={preferences.style}
        onLanguageChange={setLanguage}
        onStyleChange={handleStyleChange}
        alignedEditions={book.editions.filter(ed => ed.aligned)}
        splitEditionKey={preferences.splitEditionKey}
        onSplitEditionChange={setSplitEditionKey}
        splitView={preferences.splitView}
        onToggleSplitView={handleToggleSplitView}
        audioEditions={book.editions.filter(ed => ed.hasAudio)}
        audioEditionKey={effectiveAudioEditionKey}
        onAudioEditionChange={setAudioEditionKey}
        progressDisplay={preferences.progressDisplay}
        onProgressDisplayChange={setProgressDisplay}
        hasSections={!!(primaryData?.sections?.length)}
        readingObjective={preferences.readingObjective}
        onSaveObjective={setReadingAngleForCurrentBook}
        isBookDownloaded={isBookDownloaded(book.id)}
        onOpenDownloads={() => setShowDownloadManager(true)}
        user={user}
        messagesRemaining={messagesRemaining}
        hasBalance={hasBalance}
        isAnonymous={isAnonymous}
        onSignIn={() => { setAuthModalMode('signin'); setShowAuthModal(true) }}
        onSignOut={signOut}
        onOpenUsage={() => setShowUsageDashboard(true)}
        onResetPassword={resetPassword}
        onDeleteAccount={user ? async () => {
          await signOut()
        } : undefined}
        onOpenStore={() => setShowStore(true)}
        onRedoOnboarding={() => {
          storage.delete(`book-onboarded:${book.id}`)
          try { localStorage.removeItem(`tinct-book-onboarded-${book.id}`) } catch { /* ignore */ }
          setShowSettings(false)
          setShowBookOnboarding(true)
        }}
      />


      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSignIn={async (email, password) => {
            const result = await signIn(email, password)
            if (!result.error) setShowAuthModal(false)
            return result
          }}
          onSignUp={signUp}
          onGoogleSignIn={signInWithGoogle}
          onResetPassword={resetPassword}
          defaultMode={authModalMode}
        />
      )}

      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          onCreateAccount={() => {
            setShowPricingModal(false)
            setAuthModalMode('signup')
            setShowAuthModal(true)
          }}
        />
      )}

      {isPasswordRecovery && (
        <div className="password-reset-page">
          <div className="password-reset-card">
            <h1 className="password-reset-title">Set new password</h1>
            <p className="password-reset-subtitle">Choose a new password for your account.</p>
            {resetSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--accent)', marginBottom: 16 }}>Password updated successfully.</p>
                <button className="onboarding-start" onClick={() => { clearPasswordRecovery(); setResetSuccess(false); setNewPassword(''); setConfirmPassword('') }}>
                  Continue reading
                </button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault()
                if (newPassword !== confirmPassword) {
                  setResetError('Passwords do not match')
                  return
                }
                if (newPassword.length < 6) return
                const result = await updatePassword(newPassword)
                if (result.error) setResetError(result.error)
                else setResetSuccess(true)
              }}>
                <div className="password-reset-field">
                  <label className="onboarding-label" htmlFor="new-password">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    className="auth-input"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setResetError('') }}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    autoFocus
                  />
                </div>
                <div className="password-reset-field">
                  <label className="onboarding-label" htmlFor="confirm-password">Confirm password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="auth-input"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setResetError('') }}
                    placeholder="Repeat your new password"
                    required
                    minLength={6}
                  />
                </div>
                {resetError && <p className="auth-error">{resetError}</p>}
                <button
                  className="onboarding-start"
                  type="submit"
                  disabled={newPassword.length < 6 || confirmPassword.length < 6}
                >
                  Update password
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showUsageDashboard && (
        <UsageDashboard
          profile={profile}
          onClose={() => setShowUsageDashboard(false)}
          onCheckout={handleCheckout}
          onCancelSubscription={handleCancelSubscription}
          isAnonymous={isAnonymous}
          isSubscribed={isSubscribed}
          isCanceled={profile?.subscription_status === 'canceled'}
          onSignIn={() => { setShowUsageDashboard(false); setShowAuthModal(true) }}
          messagesRemaining={messagesRemaining}
          monthlyRemaining={monthlyRemaining}
          messageBalance={messageBalance}
          session={session}
          fixesCount={fixesCount}
        />
      )}

      {showTopUp && (
        <TopUpModal
          monthlyRemaining={monthlyRemaining}
          messageBalance={messageBalance}
          onCheckout={(type) => { setShowTopUp(false); handleCheckout(type) }}
          onClose={() => setShowTopUp(false)}
        />
      )}

      {showDownloadManager && (
        <DownloadManager
          books={libraryBooks}
          offlineMeta={offlineMeta}
          downloadState={downloadState}
          storageMB={storageMB}
          isOnline={isOnline}
          onDownloadBook={(b) => downloadBook(b)}
          onDownloadChapter={(book, ch) => downloadChapter(book, ch)}
          onRemove={removeDownload}
          onCancel={cancelDownload}
          onClose={() => setShowDownloadManager(false)}
        />
      )}

      {editingObjective && (
        <div className="objective-editor-overlay" onClick={() => setEditingObjective(false)}>
          <div className="objective-editor-card" onClick={e => e.stopPropagation()}>
            <h3 className="objective-editor-title">Edit your reading angle</h3>
            <textarea
              className="objective-editor-input"
              value={inlineObjective}
              onChange={e => setInlineObjective(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="objective-editor-actions">
              <button className="objective-editor-cancel" onClick={() => setEditingObjective(false)}>Cancel</button>
              <button className="objective-editor-save" onClick={() => {
                setReadingAngleForCurrentBook(inlineObjective.trim())
                setEditingObjective(false)
              }}>Save</button>
            </div>
          </div>
        </div>
      )}

      <Header
        bookTitle={book.title}
        bookAuthor={book.author}
        books={libraryBooks}
        currentBookId={book.id}
        onBookChange={handleBookChange}
        language={preferences.language}
        onLanguageChange={setLanguage}
        style={preferences.style}
        onStyleChange={handleStyleChange}
        availableStyles={availableStyles}
        currentChapter={currentChapter}
        totalChapters={totalChapters}
        chapterLabels={chapterLabels}
        onChapterChange={setCurrentChapter}
        splitView={preferences.splitView}
        onToggleSplitView={handleToggleSplitView}
        splitViewAvailable={splitViewAvailable}
        darkMode={preferences.darkMode}
        onToggleDarkMode={toggleDarkMode}
        panelOpen={preferences.panelOpen}
        readingProgress={getReadingProgress(book.id)?.percent}
        user={user}
        messagesRemaining={messagesRemaining}
        hasBalance={hasBalance}
        isAnonymous={isAnonymous}
        onSignIn={() => { setAuthModalMode('signin'); setShowAuthModal(true) }}
        onSignOut={signOut}
        onResetPassword={resetPassword}
        onDeleteAccount={user ? async () => {
          await signOut()
          // TODO: call Supabase admin API to delete user data
        } : undefined}
        onOpenUsage={() => setShowUsageDashboard(true)}
        onOpenStore={() => setShowStore(true)}
        onOpenDownloads={() => setShowDownloadManager(true)}
        isBookDownloaded={isBookDownloaded(book.id)}
        hasAudio={hasAudio}
        isAudioPlaying={audioStripOpen || audioIsPlaying}
        onToggleAudio={() => setAudioStripOpen(o => !o)}
        onOpenSearch={() => setShowSearch(true)}
        onOpenNotes={() => { setPanelTab('notes'); if (isMobile) setActiveView(3) }}
        onOpenCast={() => { setPanelTab('threads'); if (isMobile) setActiveView(4) }}
        fontSize={preferences.fontSize}
        onFontSizeChange={(size: FontSize) => {
          const frac = totalPages > 1 ? currentPage / (totalPages - 1) : 0
          savedPos.current = {
            bookId: book.id,
            chapterNumber: currentChapter,
            currentPage,
            totalPages,
            scrollFraction: frac,
          }
          setFontSize(size)
          setReaderKey(k => k + 1)
        }}
        fontFamily={preferences.fontFamily}
        onFontFamilyChange={(family: string) => {
          const frac = totalPages > 1 ? currentPage / (totalPages - 1) : 0
          savedPos.current = {
            bookId: book.id,
            chapterNumber: currentChapter,
            currentPage,
            totalPages,
            scrollFraction: frac,
          }
          setFontFamily(family as FontFamily)
          setReaderKey(k => k + 1)
        }}
        readingObjective={preferences.readingObjective}
        onEditObjective={handleEditObjective}
        onSaveObjective={setReadingAngleForCurrentBook}
        onOpenToc={() => setShowToc(true)}
        onOpenSettings={() => setShowSettings(true)}
        focusMode={focusMode}
        onToggleFocusMode={() => setFocusMode(v => !v)}
        sections={primaryData?.sections}
        progressDisplay={preferences.progressDisplay}
        onProgressDisplayChange={setProgressDisplay}
        isMobile={isMobile}
        splitEditionKey={preferences.splitEditionKey}
        onSplitEditionChange={setSplitEditionKey}
        alignedEditions={book.editions.filter(ed => ed.aligned).map(ed => ({ key: ed.key, label: ed.label }))}
        audioEditions={book.editions.filter(ed => ed.hasAudio).map(ed => ({ key: ed.key, label: ed.label }))}
        audioEditionKey={effectiveAudioEditionKey}
        onAudioEditionChange={setAudioEditionKey}
        hasSections={!!(primaryData?.sections?.length)}
      />

      <TrialBanner
        onSubscribe={() => handleCheckout('subscription')}
        onCreateAccount={() => {
          setAuthModalMode('signup')
          setShowAuthModal(true)
        }}
      />

      <HomeRolePrompt />

      {hasAudio && (
        <AudioStrip
          isOpen={audioStripOpen}
          onClose={() => setAudioStripOpen(false)}
          isPlaying={audioIsPlaying}
          audioRef={bottomBarRef}
        />
      )}

      {!isOnline && (
        <div className="offline-banner">
          You're offline — reading and audio work for downloaded books. Chat is unavailable.
        </div>
      )}

      {primaryLoadError && (
        <div className="edition-error-banner">
          <span>This book didn&rsquo;t load correctly: {primaryLoadError}</span>
          <button
            className="edition-error-retry"
            onClick={async () => {
              setPrimaryLoadError(null)
              setIsLoading(true)
              try {
                const fresh = await reloadEdition(book.id, primaryEditionKey)
                setPrimaryData(fresh)
              } catch (err) {
                setPrimaryLoadError((err as Error).message || 'Could not load this edition.')
              } finally {
                setIsLoading(false)
              }
            }}
          >
            Retry
          </button>
        </div>
      )}

      <main
        className={`main-layout ${isMobile ? 'main-layout-mobile' : ''} ${!preferences.panelOpen ? 'panel-closed' : ''}`}
      >
        {isMobile ? (
          <div className="mobile-views">
            {/* View 0: Reader */}
            <div className={`mobile-view ${activeView === 0 ? 'mobile-view-active' : ''}`}>
              <Reader
                key={`${currentChapter}-${readerKey}`}
                isActive={activeView === 0}
                paragraphs={primaryChapter?.paragraphs || []}
                chapterTitle={primaryChapter?.title || `Book ${currentChapter}`}
                progressLabel={progressLabel}
                editionLabel={editionLabel}
                isLoading={isLoading}
                highlights={getEditionHighlights(primaryEditionKey)}
                onHighlight={handleHighlight}
                onTextSelect={(text) => { handleTextSelect(text); setActiveView(2) }}
                onReflect={user ? handleReflect : undefined}
                onGenerateSummary={handleGenerateSummary}
                isGeneratingSummary={isGeneratingSummary}
                isFinalChapter={currentChapter === totalChapters}
                readerRef={readerRef}
                onPageChange={handlePageChange}
                onFirstVisibleParagraph={setFirstVisibleParagraph}
                initialPage={savedPos.current?.chapterNumber === currentChapter ? (savedPos.current?.scrollFraction ?? (savedPos.current?.totalPages > 1 ? savedPos.current.currentPage / (savedPos.current.totalPages - 1) : undefined)) : undefined}
                isVerse={primaryIsVerse}
                targetParagraphIndex={readSyncSignal?.paragraph ?? targetParagraphRef.current}
                targetParagraphNonce={readSyncSignal?.nonce}
                playingParagraphIndex={audioPlayingParagraph}
                playingParagraphProgress={audioProgress}
                isAudioPlaying={audioIsPlaying}
                onParagraphClick={handleParagraphClick}
                hasAudio={hasAudio}
                panelOpen={preferences.panelOpen}
                onNextChapter={currentChapter < totalChapters ? userChapterNext : undefined}
                onPrevChapter={currentChapter > 1 ? userChapterPrev : undefined}
              />
            </div>
            {/* View 1: Compare — shows secondary edition full-width on mobile */}
            <div className={`mobile-view ${activeView === 1 ? 'mobile-view-active' : ''}`}>
              {splitViewAvailable && splitChapter ? (
                <Reader
                  key={`mobile-compare-${currentChapter}-${splitEditionKey}-${readerKey}`}
                  isActive={activeView === 1}
                  paragraphs={splitChapter.paragraphs}
                  chapterTitle={`${splitChapter.title || `Book ${currentChapter}`}`}
                  progressLabel={progressLabel}
                  isLoading={isLoading}
                  highlights={getEditionHighlights(splitEditionKey)}
                  onHighlight={(pIdx, start, end, text, color) => addHighlight(splitEditionKey, pIdx, start, end, text, color)}
                  onTextSelect={(text) => { handleTextSelect(text); setActiveView(2) }}
                  onReflect={user ? handleReflect : undefined}
                  onGenerateSummary={handleGenerateSummary}
                  isGeneratingSummary={isGeneratingSummary}
                  isFinalChapter={currentChapter === totalChapters}
                  readerRef={compareReaderRef}
                  isVerse={splitIsVerse}
                  onPageChange={handlePageChange}
                  onFirstVisibleParagraph={setCompareFirstVisibleParagraph}
                  initialPage={savedPos.current?.chapterNumber === currentChapter ? (savedPos.current?.scrollFraction ?? undefined) : undefined}
                  targetParagraphIndex={compareSyncSignal?.paragraph}
                  targetParagraphNonce={compareSyncSignal?.nonce}
                  playingParagraphIndex={audioPlayingParagraph}
                  playingParagraphProgress={audioProgress}
                  isAudioPlaying={audioIsPlaying}
                  onParagraphClick={handleParagraphClick}
                  hasAudio={hasAudio}
                  editionLabel={book.editions.find(ed => ed.key === splitEditionKey)?.label || splitEditionKey}
                  onNextChapter={currentChapter < totalChapters ? userChapterNext : undefined}
                  onPrevChapter={currentChapter > 1 ? userChapterPrev : undefined}
                />
              ) : (
                <div className="mobile-view-placeholder">
                  <p style={{ padding: 24, color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    No aligned editions available for comparison.
                  </p>
                </div>
              )}
            </div>
            {/* Views 2-4: SidePanel tabs (Chat, Notes, Cast) */}
            {([2, 3, 4] as const).map(viewIndex => (
              <div key={viewIndex} className={`mobile-view ${activeView === viewIndex ? 'mobile-view-active' : ''}`}>
                <SidePanel
                  isMobile={true}
                  isOpen={true}
                  activeTab={viewIndex === 2 ? 'chat' : viewIndex === 3 ? 'notes' : 'threads'}
                  onTabChange={(tab) => {
                    setPanelTab(tab)
                    setActiveView(tab === 'chat' ? 2 : tab === 'notes' ? 3 : 4)
                  }}
                  messages={messages}
                  isChatLoading={chatLoading}
                  onSendMessage={handleSendMessage}
                  onClearChat={clearMessages}
                  pendingHighlight={pendingHighlight}
                  onClearHighlight={() => setPendingHighlight(null)}
                  bookTitle={book.title}
                  bookId={book.id}
                  chapterTitle={chapterTitle}
                  readingObjective={preferences.readingObjective}
                  onEditObjective={handleEditObjective}
                  notes={notes}
                  highlights={highlights}
                  onAddNote={addNote}
                  onDeleteNote={deleteNote}
                  onDeleteHighlight={removeHighlight}
                  onUpdateNote={updateNote}
                  onCopyToNotes={handleCopyToNotes}
                  allBookHighlights={getAllBookHighlights()}
                  allBookNotes={getAllBookNotes()}
                  chapterLabels={chapterLabels}
                  readingLog={readingLog}
                  totalChapters={totalChapters}
                  sections={primaryData?.sections}
                  threadCharacters={threadsData?.characters || []}
                  currentChapter={currentChapter}
                  editionKey={primaryEditionKey}
                  language={preferences.language}
                  getMentions={getMentions}
                  visibleParagraphs={visibleParagraphs}
                  onNavigateToChapter={(ch, pi, ek) => { handleNavigateToChapter(ch, pi, ek); setActiveView(0) }}
                  onSignIn={() => { setAuthModalMode('signup'); setShowAuthModal(true) }}
                  onShowPricing={() => setShowPricingModal(true)}
                  chatConversations={chatConversations}
                  onSummarizeChat={handleSummarizeChat}
                  summarizingId={summarizingChatId}
                  chatHidden={preferences.chatHidden}
                  feedHidden={preferences.feedHidden}
                  castHidden={preferences.castHidden}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            {preferences.splitView && splitChapter ? (
              <SplitReader
                key={`split-${currentChapter}-${readerKey}`}
                leftParagraphs={primaryChapter?.paragraphs || []}
                rightParagraphs={splitChapter?.paragraphs || []}
                chapterTitle={primaryChapter?.title || `Book ${currentChapter}`}
                progressLabel={progressLabel}
                leftLabel={editionLabel}
                rightLabel={book.editions.find(ed => ed.key === splitEditionKey)?.label || splitEditionKey}
                isLoading={isLoading}
                leftHighlights={getEditionHighlights(primaryEditionKey)}
                rightHighlights={getEditionHighlights(splitEditionKey)}
                alignedEditions={alignedEditions}
                currentRightEditionKey={splitEditionKey}
                onRightEditionChange={setSplitEditionKey}
                onHighlight={handleSplitHighlight}
                onTextSelect={handleTextSelect}
                onReflect={user ? handleReflect : undefined}
                onGenerateSummary={handleGenerateSummary}
                isGeneratingSummary={isGeneratingSummary}
                isFinalChapter={currentChapter === totalChapters}
                readerRef={readerRef}
                isLeftVerse={primaryIsVerse}
                isRightVerse={splitIsVerse}
                onPageChange={handlePageChange}
                onFirstVisibleParagraph={setFirstVisibleParagraph}
                initialPage={savedPos.current?.chapterNumber === currentChapter ? (savedPos.current?.scrollFraction ?? undefined) : undefined}
                targetParagraphIndex={targetParagraphRef.current}
                playingParagraphIndex={audioPlayingParagraph}
                playingParagraphProgress={audioProgress}
                onParagraphClick={handleParagraphClick}
                hasAudio={hasAudio}
                isAudioPlaying={audioIsPlaying}
                panelOpen={preferences.panelOpen}
                onNextChapter={currentChapter < totalChapters ? userChapterNext : undefined}
                onPrevChapter={currentChapter > 1 ? userChapterPrev : undefined}
                onDeleteHighlight={removeHighlight}
                onUpdateHighlightNote={updateHighlightNote}
                onUpdateHighlightColor={updateHighlightColor}
                onShare={setShareText}
                bookId={book.id}
                primaryEditionKey={primaryEditionKey}
                splitEditionKey={splitEditionKey}
                currentChapter={currentChapter}
                authToken={session?.access_token}
              />
            ) : (
              <Reader
                key={`${currentChapter}-${readerKey}`}
                paragraphs={primaryChapter?.paragraphs || []}
                chapterTitle={primaryChapter?.title || `Book ${currentChapter}`}
                progressLabel={progressLabel}
                editionLabel={editionLabel}
                isLoading={isLoading}
                highlights={getEditionHighlights(primaryEditionKey)}
                onHighlight={handleHighlight}
                onTextSelect={handleTextSelect}
                onReflect={user ? handleReflect : undefined}
                onGenerateSummary={handleGenerateSummary}
                isGeneratingSummary={isGeneratingSummary}
                isFinalChapter={currentChapter === totalChapters}
                readerRef={readerRef}
                onPageChange={handlePageChange}
                onFirstVisibleParagraph={setFirstVisibleParagraph}
                initialPage={savedPos.current?.chapterNumber === currentChapter ? (savedPos.current?.scrollFraction ?? (savedPos.current?.totalPages > 1 ? savedPos.current.currentPage / (savedPos.current.totalPages - 1) : undefined)) : undefined}
                isVerse={primaryIsVerse}
                targetParagraphIndex={targetParagraphRef.current}
                playingParagraphIndex={audioPlayingParagraph}
                playingParagraphProgress={audioProgress}
                onParagraphClick={handleParagraphClick}
                hasAudio={hasAudio}
                isAudioPlaying={audioIsPlaying}
                panelOpen={preferences.panelOpen}
                onNextChapter={currentChapter < totalChapters ? userChapterNext : undefined}
                onPrevChapter={currentChapter > 1 ? userChapterPrev : undefined}
                onDeleteHighlight={removeHighlight}
                onUpdateHighlightNote={updateHighlightNote}
                onUpdateHighlightColor={updateHighlightColor}
                onShare={setShareText}
                bookId={book.id}
                editionKey={primaryEditionKey}
                currentChapter={currentChapter}
                authToken={session?.access_token}
              />
            )}

            <SidePanel
              isOpen={preferences.panelOpen}
              activeTab={preferences.panelTab}
              onTabChange={setPanelTab}
              onOpenPanel={() => { if (!preferences.panelOpen) togglePanel() }}
              onClosePanel={() => { if (preferences.panelOpen) togglePanel() }}
              messages={messages}
              isChatLoading={chatLoading}
              onSendMessage={handleSendMessage}
              onClearChat={clearMessages}
              pendingHighlight={pendingHighlight}
              onClearHighlight={() => setPendingHighlight(null)}
              bookTitle={book.title}
              bookId={book.id}
              chapterTitle={chapterTitle}
              readingObjective={preferences.readingObjective}
              onEditObjective={handleEditObjective}
              notes={notes}
              highlights={highlights}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
              onDeleteHighlight={removeHighlight}
              onUpdateNote={updateNote}
              onCopyToNotes={handleCopyToNotes}
              allBookHighlights={getAllBookHighlights()}
              allBookNotes={getAllBookNotes()}
              chapterLabels={chapterLabels}
              readingLog={readingLog}
              totalChapters={totalChapters}
              sections={primaryData?.sections}
              threadCharacters={threadsData?.characters || []}
              currentChapter={currentChapter}
              editionKey={primaryEditionKey}
              language={preferences.language}
              getMentions={getMentions}
              visibleParagraphs={visibleParagraphs}
              onNavigateToChapter={handleNavigateToChapter}
              messagesRemaining={messagesRemaining}
              hasBalance={hasBalance}
              isAnonymous={isAnonymous}
              onTopUp={() => setShowTopUp(true)}
              onSignIn={() => { setAuthModalMode('signup'); setShowAuthModal(true) }}
              onShowPricing={() => setShowPricingModal(true)}
              chatConversations={chatConversations}
              chatHidden={preferences.chatHidden}
              feedHidden={preferences.feedHidden}
              castHidden={preferences.castHidden}
            />
          </>
        )}
      </main>

      {showToc && primaryData && (
        <TocOverlay
          chapters={primaryData.chapters.map(c => ({ number: c.number, title: c.title }))}
          currentChapter={currentChapter}
          onSelectChapter={(n) => handleNavigateToChapter(n)}
          onClose={() => setShowToc(false)}
          sections={primaryData.sections}
        />
      )}

      {showSearch && primaryData && (
        <SearchOverlay
          chapters={primaryData.chapters}
          sections={primaryData.sections}
          currentChapter={currentChapter}
          onNavigate={(chapter, paragraphIndex) => {
            targetParagraphRef.current = paragraphIndex
            setCurrentChapter(chapter)
            setReaderKey(k => k + 1)
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Mobile bottom navigation */}
      {isMobile && (
        <nav className="mobile-nav">
          <button className={`mobile-nav-btn ${activeView === 0 ? 'mobile-nav-active' : ''}`} onClick={() => setActiveView(0)}>
            Read
          </button>
          <button className={`mobile-nav-btn ${activeView === 1 ? 'mobile-nav-active' : ''}`} onClick={() => setActiveView(1)}>
            Compare
          </button>
          <button className={`mobile-nav-btn ${activeView === 2 ? 'mobile-nav-active' : ''}`} onClick={() => { setPanelTab('chat'); setActiveView(2) }}>
            Chat
          </button>
          <button className={`mobile-nav-btn ${activeView === 3 ? 'mobile-nav-active' : ''}`} onClick={() => { setPanelTab('notes'); setActiveView(3) }}>
            Feed
          </button>
          <button className={`mobile-nav-btn ${activeView === 4 ? 'mobile-nav-active' : ''}`} onClick={() => { setPanelTab('threads'); setActiveView(4) }}>
            Cast
          </button>
        </nav>
      )}

      {backPosition && (
        <button className="back-to-position" onClick={handleBackToPosition}>
          &larr; Back to reading position
        </button>
      )}

      <BottomBar
        ref={bottomBarRef}
        chapterTitle={chapterTitle}
        percentComplete={readingPercent}
        timeRemainingLabel={timeRemainingLabel}
        isLearned={isSpeedLearned}
        currentPage={currentPage}
        totalPages={totalPages}
        absoluteCurrentPage={absolutePage.current}
        absoluteTotalPages={absolutePage.total}
        bookCurrentPage={bookAbsolutePage.current}
        bookTotalPages={bookAbsolutePage.total}
        chapterPercentComplete={totalPages > 1 ? Math.round(((currentPage + 1) / totalPages) * 100) : 100}
        chapterTimeLabel={(() => {
          if (totalPages <= 1) return 'Done'
          // Time remaining INCLUDING the page you're on. The old calc excluded
          // current page (so the last page showed "<1min" instantly) and used
          // Math.ceil (so several mid-chapter pages all rounded to the same
          // minute and the value never appeared to change).
          const chapterWords = primaryChapter?.paragraphs.reduce((s, p) => s + p.split(/\s+/).length, 0) || 0
          const pagesAhead = Math.max(0, totalPages - currentPage)
          const wordsLeft = Math.round(chapterWords * pagesAhead / totalPages)
          const wpm = wordsPerMinute > 0 ? wordsPerMinute : 250
          const rawSecs = (wordsLeft / wpm) * 60
          if (rawSecs <= 5) return 'Done'
          // Show seconds when under 90s so the last page actually ticks
          // visibly toward done instead of sticking at "1 min left".
          if (rawSecs < 90) return `${Math.max(5, Math.round(rawSecs / 5) * 5)}s left`
          return `${Math.round(rawSecs / 60)}min left`
        })()}
        locationCurrent={primaryData ? primaryData.chapters.slice(0, currentChapter - 1).reduce((sum, c) => sum + c.paragraphs.length, 0) + (firstVisibleParagraph || 0) : 0}
        locationTotal={primaryData ? primaryData.chapters.reduce((sum, c) => sum + c.paragraphs.length, 0) : 0}
        locationCurrentChapter={firstVisibleParagraph}
        locationTotalChapter={primaryChapter?.paragraphs.length}
        progressDisplay={preferences.progressDisplay}
        bookId={book.id}
        editionKey={effectiveAudioEditionKey}
        chapterNumber={currentChapter}
        onParagraphChange={handleAudioParagraphChange}
        onPlayStateChange={setAudioIsPlaying}
        onProgressChange={setAudioProgress}
        onChapterEnd={currentChapter < totalChapters ? handleNextChapter : undefined}
        firstVisibleParagraph={firstVisibleParagraph}
        compact={isMobile}
        onNextChapter={currentChapter < totalChapters ? handleNextChapter : undefined}
        onPrevChapter={currentChapter > 1 ? handlePrevChapter : undefined}
        initialAudioParagraph={savedPos.current?.chapterNumber === currentChapter ? savedPos.current?.lastParagraphIndex : undefined}
        chapterTicks={(() => {
          if (!primaryData || primaryData.chapters.length <= 1) return undefined
          const total = primaryData.chapters.reduce((s, c) => s + c.paragraphs.length, 0)
          if (total === 0) return undefined

          // For books with sections (e.g. Bible, Plato), show section boundaries.
          // For everything else, show chapter boundaries — but cap so the bar
          // doesn't read as a solid comb on long books.
          const sections = primaryData.sections
          if (sections && sections.length > 1) {
            // Sum paragraphs per top-level section by walking chapters in order.
            const sectionEnds: number[] = []
            let accum = 0
            for (const sec of sections) {
              const collect = (s: typeof sec): number[] => {
                if (s.chapters && s.chapters.length) return s.chapters
                if (s.sections) return s.sections.flatMap(collect)
                return []
              }
              const chapterNumbers = collect(sec)
              for (const chN of chapterNumbers) {
                const ch = primaryData.chapters.find(c => c.number === chN)
                if (ch) accum += ch.paragraphs.length
              }
              sectionEnds.push(accum / total)
            }
            // Drop the last (always 1.0)
            return sectionEnds.slice(0, -1)
          }

          // No sections: chapter ticks, capped at 16 so they read as discrete marks.
          const chapterCount = primaryData.chapters.length
          const MAX = 16
          if (chapterCount - 1 <= MAX) {
            const ticks: number[] = []
            let accum2 = 0
            for (let i = 0; i < chapterCount - 1; i++) {
              accum2 += primaryData.chapters[i].paragraphs.length
              ticks.push(accum2 / total)
            }
            return ticks
          }
          // Sample evenly when too many chapters
          const ticks: number[] = []
          for (let i = 1; i <= MAX; i++) {
            ticks.push(i / (MAX + 1))
          }
          return ticks
        })()}
        currentChapterIndex={currentChapter}
      />

    </div>

      {/* Share modal */}
      {shareText && (
        <ShareModal
          text={shareText}
          author={book.author}
          bookTitle={book.title}
          theme={preferences.darkMode ? 'dark' : 'light'}
          onClose={() => setShareText(null)}
        />
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="tinct-toast" onClick={() => setToastMessage(null)}>
          {toastMessage}
        </div>
      )}

      {showFixModal && (
        <div className="fix-modal-overlay" onClick={() => setShowFixModal(false)}>
          <div className="fix-modal" onClick={e => e.stopPropagation()}>
            <div className="fix-modal-icon">&#10003;</div>
            <h3>Issue fixed</h3>
            <p>Thank you — the fix you pointed out has been deployed. The text has been updated. For every 5 approved fixes, you earn a free month of Premium.</p>
            <button className="fix-modal-btn" onClick={() => setShowFixModal(false)}>OK</button>
          </div>
        </div>
      )}

    </TierProvider>
  )
}
