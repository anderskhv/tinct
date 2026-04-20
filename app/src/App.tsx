import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Header } from './components/Header'
import { TrialBanner } from './components/TrialBanner'
import { Reader } from './components/Reader'
import { SplitReader } from './components/SplitReader'
import { SidePanel } from './components/SidePanel'
import { Onboarding } from './components/Onboarding'
import { SettingsSheet } from './components/SettingsSheet'
import { ProactiveInsight } from './components/ProactiveInsight'
import { AuthModal } from './components/AuthModal'
import { UsageDashboard } from './components/UsageDashboard'
import { BookStore } from './components/BookStore'
import { AccountDecision } from './components/AccountDecision'
import { PricingModal } from './components/PricingModal'
import { BottomBar } from './components/BottomBar'
import type { BottomBarHandle } from './components/BottomBar'
import { TocOverlay } from './components/TocOverlay'
import { ShareModal } from './components/ShareModal'
import { TierProvider } from './contexts/TierContext'
import { ALL_BOOKS as BOOKS, ODYSSEY, getBook } from './data/bookRegistry'
import { loadEdition } from './data/editionLoader'
import { usePreferences } from './hooks/usePreferences'
import { useHighlights } from './hooks/useHighlights'
import { useNotes } from './hooks/useNotes'
import { useReadingPosition, getSavedPosition, getReadingProgress } from './hooks/useReadingPosition'
import { useClaude } from './hooks/useClaude'
import { useProactiveInsight } from './hooks/useProactiveInsight'
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
import type { EditionData, HighlightColor, Style, EditionKey, ReadingPosition, FontSize, FontFamily } from './types'
import { makeEditionKey } from './types'
import { apiUrl } from './utils/apiUrl'
import { trackPageview } from './utils/analytics'
import { AUDIO_BASE_URL } from './utils/audioUrl'

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
        // Start real-time sync for cross-device updates
        provider.subscribe()
        setStorageReady(true)
      }).catch((err) => {
        console.error('[App] Supabase init failed:', err)
        clearTimeout(initTimeout)
        setStorageReady(true) // Proceed with localStorage fallback
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
  const { libraryIds, addBook, isEmpty: libraryEmpty, refreshFromStorage: refreshLibrary } = useLibrary(storageReady)

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
  const [backPosition, setBackPosition] = useState<{ chapter: number; scrollFraction: number; style: Style; language: 'en' | 'da' } | null>(null)
  const backTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Audio state
  const [audioPlayingParagraph, setAudioPlayingParagraph] = useState<number | undefined>(undefined)
  const [audioIsPlaying, setAudioIsPlaying] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)
  const [audioEditionKey, setAudioEditionKey] = useState<string | null>(null)
  const [firstVisibleParagraph, setFirstVisibleParagraph] = useState(0)
  const [compareSyncSignal, setCompareSyncSignal] = useState<{ paragraph: number; nonce: number } | undefined>(undefined)
  const bottomBarRef = useRef<BottomBarHandle>(null)

  // Sync Compare reader to Read reader's position when switching to Compare tab
  const firstVisibleParagraphRef = useRef(firstVisibleParagraph)
  firstVisibleParagraphRef.current = firstVisibleParagraph
  useEffect(() => {
    if (activeView === 1) {
      setCompareSyncSignal({ paragraph: firstVisibleParagraphRef.current, nonce: Date.now() })
    }
    // Reader stays mounted (CSS hidden) — no remount needed, position preserved naturally
  }, [activeView])

  // ToC overlay state
  const [showToc, setShowToc] = useState(false)

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

  // Re-read position, preferences, and library from cloud storage once Supabase syncs
  const hasRestoredFromCloud = useRef(false)
  useEffect(() => {
    if (storageReady && user && !hasRestoredFromCloud.current) {
      hasRestoredFromCloud.current = true
      // Refresh preferences and library from Supabase
      refreshFromStorage()
      refreshLibrary()
      // Restore current book from cloud (may differ from default)
      // Guard: only switch if the book actually exists in the registry
      const cloudBookId = storage.get<string>('tinct-current-book')
      const validCloudBook = cloudBookId && !!getBook(cloudBookId)
      const targetBookId = validCloudBook ? cloudBookId : book.id
      if (validCloudBook && cloudBookId !== currentBookId) {
        setCurrentBookId(cloudBookId)
      }
      // Restore reading position for the correct book
      // Use lastParagraphIndex for device-independent restore (paragraph-anchored)
      const cloudPos = getSavedPosition(targetBookId)
      if (cloudPos) {
        const localPos = savedPos.current
        const winner = pickLatest(localPos, cloudPos)
        if (winner) {
          savedPos.current = winner
          if (winner.lastParagraphIndex !== undefined) {
            targetParagraphRef.current = winner.lastParagraphIndex
          }
          setCurrentChapter(winner.chapterNumber)
          setCurrentPage(0)
          setReaderKey(k => k + 1)
        }
      }
    }
  }, [storageReady, user, book.id, currentBookId, refreshFromStorage, refreshLibrary])

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

  // Hoisted derivations needed by the visibility effect below.
  // Defined here (not lower down) to avoid TDZ in dep arrays.
  const totalChapters = primaryData?.chapters.length || book.editions.length

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
      const cloudPos = getSavedPosition(book.id)
      if (cloudPos) {
        // Don't sync if layout hasn't settled (totalPages=1 means stale state)
        if (totalPages <= 1) return
        // Bounds check: chapter must be valid for this book
        if (cloudPos.chapterNumber < 1 || cloudPos.chapterNumber > totalChapters) return
        const localPos: ReadingPosition = {
          bookId: book.id,
          chapterNumber: currentChapter,
          currentPage,
          totalPages,
          scrollFraction: totalPages > 1 ? currentPage / (totalPages - 1) : 0,
        }
        const winner = pickLatest(localPos, cloudPos)
        if (winner && winner.chapterNumber >= 1 && winner.chapterNumber <= totalChapters &&
            (winner.chapterNumber !== currentChapter ||
            (winner.scrollFraction ?? 0) > (localPos.scrollFraction ?? 0) + 0.01)) {
          savedPos.current = winner
          if (winner.lastParagraphIndex !== undefined) {
            targetParagraphRef.current = winner.lastParagraphIndex
          }
          setCurrentChapter(winner.chapterNumber)
          setCurrentPage(0)
          setReaderKey(k => k + 1)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [user, book.id, currentChapter, currentPage, totalPages, totalChapters])


  // Get current chapter data early so we can pass context to chat
  const primaryEditionKey = makeEditionKey(preferences.style, preferences.language)
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

  // Handle insufficient balance
  const handleInsufficientBalance = useCallback(() => {
    if (isAnonymous) {
      setShowAuthModal(true)
    } else {
      setShowUsageDashboard(true)
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

  const { conversations: chatConversations, recordMessage, getChapterChatSummary, getChapterConversations, setSummary: setChatSummary } = useChatHistory(book.id)
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

  // Load chat history on mount — get recent messages across all chapters
  const chatLoadedRef = useRef(false)
  useEffect(() => {
    if (chatLoadedRef.current) return
    if (chatConversations.length === 0) return // wait for storage to load
    chatLoadedRef.current = true
    // Load the last few conversations (across chapters) as initial chat history
    const allConvs = chatConversations.slice(-5) // last 5 conversations
    if (allConvs.length > 0) {
      const allMsgs: ChatMessage[] = []
      let lastChapter = -1
      for (const conv of allConvs) {
        if (conv.chapterNumber !== lastChapter && lastChapter !== -1) {
          // Insert chapter divider
          allMsgs.push({
            id: `divider-${conv.chapterNumber}`,
            role: 'assistant' as const,
            content: '',
            timestamp: conv.startTimestamp - 1,
            chapterDivider: conv.chapterNumber,
          })
        }
        lastChapter = conv.chapterNumber
        allMsgs.push(...conv.messages)
      }
      loadMessages(allMsgs)
    }
  }, [chatConversations, loadMessages])

  // Insert chapter divider when chapter changes (after initial load)
  const prevChapterForChat = useRef(currentChapter)
  useEffect(() => {
    if (prevChapterForChat.current !== currentChapter && chatLoadedRef.current) {
      prevChapterForChat.current = currentChapter
      // Don't clear — just add a divider if there are existing messages
      if (messages.length > 0) {
        loadMessages([...messages, {
          id: `divider-${currentChapter}-${Date.now()}`,
          role: 'assistant' as const,
          content: '',
          timestamp: Date.now(),
          chapterDivider: currentChapter,
        }])
      }
    }
  }, [currentChapter, messages, loadMessages])

  // Handle book change
  const handleBookChange = useCallback((bookId: string) => {
    storage.set('tinct-current-book', bookId)
    setCurrentBookId(bookId)
    const pos = getSavedPosition(bookId)
    setCurrentChapter(pos?.chapterNumber || 1)
    setCurrentPage(0) // will be corrected by Reader from scrollFraction after layout
    setTotalPages(1) // Reset so useReadingPosition guard (totalPages <= 1) prevents stale saves
    savedPos.current = pos
    clearMessages()
    setReaderKey(k => k + 1) // Force Reader remount with correct initialPage
  }, [clearMessages])

  const { highlights, addHighlight, removeHighlight, updateHighlightNote, updateHighlightColor, getEditionHighlights, getAllBookHighlights } = useHighlights(book.id, currentChapter)
  const { notes, addNote, deleteNote, updateNote, replaceAllNotes, getAllBookNotes } = useNotes(book.id, currentChapter)

  // Effective paragraph: audio position takes priority over reading position
  const effectiveParagraph = audioPlayingParagraph ?? firstVisibleParagraph
  const chapterParagraphCount = primaryChapter?.paragraphs.length

  useReadingPosition(book.id, currentChapter, currentPage, totalPages, totalChapters, storageReady, effectiveParagraph)
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

  const { insight, checkForInsight, dismiss: dismissInsight, getInsightForDiscussion } = useProactiveInsight({
    readingObjective: preferences.readingObjective,
    bookTitle: book.title,
    bookAuthor: book.author,
    chapterTitle,
    paragraphs: primaryChapter?.paragraphs || [],
  })

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
    if (chapter !== currentChapter) {
      savedPos.current = {
        bookId: book.id,
        chapterNumber: chapter,
        currentPage: 0,
        totalPages: 1,
        scrollFraction: paragraphIndex !== undefined ? -1 : 0,
      }
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

  // Handle page changes from Reader — also trigger proactive insights and track speed
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
    checkForInsight(page, total)
    // Dismiss back-to-position on manual page turn (but not on initial layout)
    if (backPosition && total > 1) {
      setBackPosition(null)
      if (backTimeoutRef.current) clearTimeout(backTimeoutRef.current)
    }
  }, [checkForInsight, primaryChapter, trackPageView, backPosition])

  // Onboarding complete handler
  const handleOnboardingComplete = useCallback((objective: string) => {
    setReadingObjective(objective)
    setOnboardingComplete(true)
  }, [setReadingObjective, setOnboardingComplete])

  // Edit objective from chat welcome
  const [editingObjective, setEditingObjective] = useState(false)
  const handleEditObjective = useCallback(() => {
    setEditingObjective(true)
  }, [])

  // Discuss proactive insight
  const handleDiscussInsight = useCallback(() => {
    const text = getInsightForDiscussion()
    if (text) {
      setPanelTab('chat')
      if (!preferences.panelOpen) togglePanel()
      sendMessage(`The AI noticed a connection to my reading angle: "${text}". Can you elaborate on this?`)
    }
  }, [getInsightForDiscussion, setPanelTab, preferences.panelOpen, togglePanel, sendMessage])

  // Determine if editions are verse (for ParagraphRenderer)
  const primaryIsVerse = preferences.style === 'verse'
  const splitIsVerse = (() => {
    const splitEd = book.editions.find(ed => ed.key === preferences.splitEditionKey)
    return splitEd?.style === 'verse'
  })()

  // Get aligned editions for split pane (excluding current primary)
  const alignedEditions = useMemo(() => {
    return book.editions.filter(ed => ed.aligned && ed.key !== primaryEditionKey)
  }, [primaryEditionKey, book.editions])

  // Split edition key — validate against current book's editions, fall back if stale
  const splitEditionKey = useMemo(() => {
    const preferred = preferences.splitEditionKey
    const exists = alignedEditions.some(ed => ed.key === preferred)
    if (exists) return preferred
    // Fall back to first aligned edition, or 'modern-en'
    return alignedEditions[0]?.key || 'modern-en'
  }, [preferences.splitEditionKey, alignedEditions])

  // Load primary edition
  useEffect(() => {
    setIsLoading(true)
    loadEdition(book.id, primaryEditionKey).then(data => {
      setPrimaryData(data)
      setIsLoading(false)
      // Safety: if the saved chapter doesn't exist or has no content, reset to chapter 1
      if (data) {
        const ch = data.chapters.find(c => c.number === currentChapter)
        if (!ch || ch.paragraphs.length === 0) {
          setCurrentChapter(1)
          setCurrentPage(0)
        }
      }
    })
  }, [book.id, primaryEditionKey])

  // Preload split edition so it's ready when toggle happens
  useEffect(() => {
    loadEdition(book.id, splitEditionKey).then(setSplitData)
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

  // Record assistant messages to chat history when they arrive
  const lastRecordedMsgRef = useRef<string | null>(null)
  useEffect(() => {
    if (messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last.role === 'assistant' && last.id !== lastRecordedMsgRef.current) {
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

  // Detect if audio is available for current edition — check on edition/chapter change
  useEffect(() => {
    if (audioEditionKey === 'none') { setHasAudio(false); return }
    const url = `${AUDIO_BASE_URL}/${book.id}/${primaryEditionKey}/ch${currentChapter}/manifest.json`
    fetch(url, { method: 'HEAD' })
      .then(res => setHasAudio(res.ok))
      .catch(() => setHasAudio(false))
  }, [book.id, primaryEditionKey, currentChapter, audioEditionKey])

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
      savedPos.current = {
        bookId: book.id,
        chapterNumber: currentChapter + 1,
        currentPage: 0,
        totalPages: 1,
        scrollFraction: 0,
      }
      setCurrentChapter(currentChapter + 1)
    }
  }, [currentChapter, totalChapters, book.id])
  const handlePrevChapter = useCallback(() => {
    if (currentChapter > 1) {
      targetParagraphRef.current = undefined
      // Navigate to last page of previous chapter
      savedPos.current = {
        bookId: book.id,
        chapterNumber: currentChapter - 1,
        currentPage: 0,
        totalPages: 1,
        scrollFraction: 1,
      }
      setCurrentChapter(currentChapter - 1)
    }
  }, [currentChapter, book.id])

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

  // Show account decision: after picking a book, before onboarding, if not yet seen and no user
  const showAccountDecision = !libraryEmpty && !showStore && !preferences.accountDecisionSeen && !user

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
    <div className={`app ${hasAudio ? 'has-audio' : ''}`}>
      {/* New user: show store first, then onboarding after picking a book */}
      {(libraryEmpty || showStore) && (
        <BookStore
          books={BOOKS}
          libraryIds={libraryIds}
          onAddBook={addBook}
          onSelectBook={(bookId) => {
            handleBookChange(bookId)
            setShowStore(false)
          }}
          onClose={!libraryEmpty ? () => setShowStore(false) : undefined}
        />
      )}

      {showAccountDecision && (
        <AccountDecision
          bookTitle={book.title}
          bookAuthor={book.author}
          onCreateAccount={() => {
            setAuthModalMode('signup')
            setShowAuthModal(true)
          }}
          onSkip={() => {
            setAccountDecisionSeen(true)
          }}
          onShowPricing={() => setShowPricingModal(true)}
        />
      )}

      {!libraryEmpty && !showStore && !showAccountDecision && !preferences.onboardingComplete && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      <SettingsSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={preferences.darkMode}
        onToggleDarkMode={toggleDarkMode}
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
        onSaveObjective={setReadingObjective}
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

      {showDownloadManager && (
        <DownloadManager
          books={libraryBooks}
          offlineMeta={offlineMeta}
          downloadState={downloadState}
          storageMB={storageMB}
          isOnline={isOnline}
          onDownloadBook={(b) => downloadBook(b, effectiveAudioEditionKey)}
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
                setReadingObjective(inlineObjective.trim())
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
        isAudioPlaying={audioIsPlaying}
        onToggleAudio={() => bottomBarRef.current?.togglePlay()}
        onOpenSearch={() => setShowSearch(true)}
        onOpenNotes={() => { setPanelTab('notes'); if (isMobile) setActiveView(3) }}
        onOpenCast={() => { setPanelTab('threads'); if (isMobile) setActiveView(4) }}
        fontSize={preferences.fontSize}
        onFontSizeChange={(size: string) => {
          const frac = totalPages > 1 ? currentPage / (totalPages - 1) : 0
          savedPos.current = {
            bookId: book.id,
            chapterNumber: currentChapter,
            currentPage,
            totalPages,
            scrollFraction: frac,
          }
          setFontSize(size as FontSize)
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
        onSaveObjective={setReadingObjective}
        onOpenToc={() => setShowToc(true)}
        onOpenSettings={() => setShowSettings(true)}
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

      <TrialBanner onSubscribe={() => handleCheckout('subscription')} />

      {!isOnline && (
        <div className="offline-banner">
          You're offline — reading and audio work for downloaded books. Chat is unavailable.
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
                paragraphs={primaryChapter?.paragraphs || []}
                chapterTitle={primaryChapter?.title || `Book ${currentChapter}`}
                editionLabel={editionLabel}
                isLoading={isLoading}
                highlights={getEditionHighlights(primaryEditionKey)}
                onHighlight={handleHighlight}
                onTextSelect={(text) => { handleTextSelect(text); setActiveView(2) }}
                onReflect={handleReflect}
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
                onParagraphClick={handleParagraphClick}
                hasAudio={hasAudio}
                panelOpen={preferences.panelOpen}
                onNextChapter={currentChapter < totalChapters ? handleNextChapter : undefined}
                onPrevChapter={currentChapter > 1 ? handlePrevChapter : undefined}
              />
            </div>
            {/* View 1: Compare — shows secondary edition full-width on mobile */}
            <div className={`mobile-view ${activeView === 1 ? 'mobile-view-active' : ''}`}>
              {splitViewAvailable && splitChapter ? (
                <Reader
                  key={`mobile-compare-${currentChapter}-${splitEditionKey}-${readerKey}`}
                  paragraphs={splitChapter.paragraphs}
                  chapterTitle={`${splitChapter.title || `Book ${currentChapter}`}`}
                  isLoading={isLoading}
                  highlights={getEditionHighlights(splitEditionKey)}
                  onHighlight={(pIdx, start, end, text, color) => addHighlight(splitEditionKey, pIdx, start, end, text, color)}
                  onTextSelect={(text) => { handleTextSelect(text); setActiveView(2) }}
                  onReflect={handleReflect}
                  onGenerateSummary={handleGenerateSummary}
                  isGeneratingSummary={isGeneratingSummary}
                  isFinalChapter={currentChapter === totalChapters}
                  readerRef={compareReaderRef}
                  isVerse={splitIsVerse}
                  onPageChange={handlePageChange}
                  initialPage={savedPos.current?.chapterNumber === currentChapter ? (savedPos.current?.scrollFraction ?? undefined) : undefined}
                  targetParagraphIndex={compareSyncSignal?.paragraph}
                  targetParagraphNonce={compareSyncSignal?.nonce}
                  playingParagraphIndex={audioPlayingParagraph}
                  onParagraphClick={handleParagraphClick}
                  hasAudio={hasAudio}
                  editionLabel={book.editions.find(ed => ed.key === splitEditionKey)?.label || splitEditionKey}
                  onNextChapter={currentChapter < totalChapters ? handleNextChapter : undefined}
                  onPrevChapter={currentChapter > 1 ? handlePrevChapter : undefined}
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
                onReflect={handleReflect}
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
                onParagraphClick={handleParagraphClick}
                hasAudio={hasAudio}
                isAudioPlaying={audioIsPlaying}
                panelOpen={preferences.panelOpen}
                onNextChapter={currentChapter < totalChapters ? handleNextChapter : undefined}
                onPrevChapter={currentChapter > 1 ? handlePrevChapter : undefined}
                onDeleteHighlight={removeHighlight}
                onUpdateHighlightNote={updateHighlightNote}
                onUpdateHighlightColor={updateHighlightColor}
                onShare={setShareText}
                bookId={book.id}
                primaryEditionKey={primaryEditionKey}
                currentChapter={currentChapter}
                authToken={session?.access_token}
              />
            ) : (
              <Reader
                key={`${currentChapter}-${readerKey}`}
                paragraphs={primaryChapter?.paragraphs || []}
                chapterTitle={primaryChapter?.title || `Book ${currentChapter}`}
                editionLabel={editionLabel}
                isLoading={isLoading}
                highlights={getEditionHighlights(primaryEditionKey)}
                onHighlight={handleHighlight}
                onTextSelect={handleTextSelect}
                onReflect={handleReflect}
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
                onParagraphClick={handleParagraphClick}
                hasAudio={hasAudio}
                isAudioPlaying={audioIsPlaying}
                panelOpen={preferences.panelOpen}
                onNextChapter={currentChapter < totalChapters ? handleNextChapter : undefined}
                onPrevChapter={currentChapter > 1 ? handlePrevChapter : undefined}
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
              onTopUp={() => setShowUsageDashboard(true)}
              onSignIn={() => { setAuthModalMode('signup'); setShowAuthModal(true) }}
              onShowPricing={() => setShowPricingModal(true)}
              chatConversations={chatConversations}
            />
          </>
        )}
      </main>

      {showToc && primaryData && (
        <TocOverlay
          chapters={primaryData.chapters.map(c => ({ number: c.number, title: c.title }))}
          currentChapter={currentChapter}
          onSelectChapter={setCurrentChapter}
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
          const chapterWords = primaryChapter?.paragraphs.reduce((s, p) => s + p.split(/\s+/).length, 0) || 0
          const wordsLeft = Math.ceil(chapterWords * (totalPages - currentPage - 1) / totalPages)
          const minsLeft = wordsPerMinute > 0 ? Math.ceil(wordsLeft / wordsPerMinute) : Math.ceil((totalPages - currentPage - 1) * 0.5)
          return minsLeft < 1 ? '<1min left' : `${minsLeft}min left`
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

      {insight && (
        <ProactiveInsight
          text={insight}
          onDiscuss={handleDiscussInsight}
          onDismiss={dismissInsight}
        />
      )}

    </div>

      {/* Share modal */}
      {shareText && (
        <ShareModal
          text={shareText}
          author={book.author}
          bookTitle={book.title}
          theme={preferences.theme === 'dark' ? 'dark' : 'light'}
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
