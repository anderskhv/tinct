import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Header } from './components/Header'
import { Reader } from './components/Reader'
import { SplitReader } from './components/SplitReader'
import { SidePanel } from './components/SidePanel'
import { Onboarding } from './components/Onboarding'
import { ProactiveInsight } from './components/ProactiveInsight'
import { AuthModal } from './components/AuthModal'
import { UsageDashboard } from './components/UsageDashboard'
import { BookStore } from './components/BookStore'
import { AccountDecision } from './components/AccountDecision'
import { PricingModal } from './components/PricingModal'
import { BottomBar } from './components/BottomBar'
import type { BottomBarHandle } from './components/BottomBar'
import { PanelToggleTab } from './components/PanelToggleTab'
import { TocOverlay } from './components/TocOverlay'
import { TierProvider } from './contexts/TierContext'
import { BOOKS, ODYSSEY, getBook } from './data/bookRegistry'
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
import { useReadingSpeed } from './hooks/useReadingSpeed'
import { useMobile } from './hooks/useMobile'
import { useLibrary } from './hooks/useLibrary'
import { storage, setStorageProvider, localStorageProvider } from './services/storage'
import { SupabaseStorageProvider } from './services/supabaseStorage'
import type { EditionData, HighlightColor, Style, EditionKey, ReadingPosition } from './types'
import { makeEditionKey } from './types'
import { trackPageview } from './utils/analytics'

/** Pick whichever position is furthest in the book (higher chapter, or higher fraction within same chapter) */
function pickFurthest(a: ReadingPosition | null, b: ReadingPosition | null): ReadingPosition | null {
  if (!a) return b
  if (!b) return a
  if (a.chapterNumber > b.chapterNumber) return a
  if (b.chapterNumber > a.chapterNumber) return b
  const fracA = a.scrollFraction ?? (a.totalPages > 1 ? a.currentPage / (a.totalPages - 1) : 0)
  const fracB = b.scrollFraction ?? (b.totalPages > 1 ? b.currentPage / (b.totalPages - 1) : 0)
  return fracA >= fracB ? a : b
}

export default function App() {
  const [currentBookId, setCurrentBookId] = useState(() => {
    return storage.get<string>('tinct-current-book') || ODYSSEY.id
  })
  const book = getBook(currentBookId) || ODYSSEY

  // Auth & billing
  const { user, profile, session, signUp, signIn, signInWithGoogle, signOut, refreshProfile, resetPassword, updatePassword, isPasswordRecovery, clearPasswordRecovery } = useAuth()
  const { messagesRemaining, hasBalance, deductUsage, isAnonymous } = useBalance(session, profile)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')
  const [showUsageDashboard, setShowUsageDashboard] = useState(false)
  const [showStore, setShowStore] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  // Swap storage provider when user signs in/out — enables cross-device sync
  const [storageReady, setStorageReady] = useState(!user)
  const supabaseProviderRef = useRef<SupabaseStorageProvider | null>(null)
  useEffect(() => {
    if (user) {
      const provider = new SupabaseStorageProvider(user.id)
      provider.init().then(() => {
        // Migrate any existing localStorage data to Supabase
        const localData = localStorageProvider.getAllData()
        for (const [key, value] of Object.entries(localData)) {
          if (!provider.get(key)) {
            provider.set(key, value)
          }
        }
        setStorageProvider(provider)
        supabaseProviderRef.current = provider
        setStorageReady(true)
      })
    } else {
      setStorageProvider(localStorageProvider)
      supabaseProviderRef.current = null
      setStorageReady(true)
    }
  }, [user])

  // Library
  const { libraryIds, addBook, isEmpty: libraryEmpty } = useLibrary()

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
  } = usePreferences()

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
    return savedPos.current?.chapterNumber || 1
  })
  const [primaryData, setPrimaryData] = useState<EditionData | null>(null)
  const [splitData, setSplitData] = useState<EditionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingHighlight, setPendingHighlight] = useState<string | null>(null)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const readerRef = useRef<HTMLDivElement>(null)
  const compareReaderRef = useRef<HTMLDivElement>(null)
  const [readerKey, setReaderKey] = useState(0)
  const targetParagraphRef = useRef<number | undefined>(undefined)
  const [backPosition, setBackPosition] = useState<{ chapter: number; scrollFraction: number; style: Style; language: 'en' | 'da' } | null>(null)
  const backTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Audio state
  const [audioPlayingParagraph, setAudioPlayingParagraph] = useState<number | undefined>(undefined)
  const [hasAudio, setHasAudio] = useState(false)
  const [firstVisibleParagraph, setFirstVisibleParagraph] = useState(0)
  const bottomBarRef = useRef<BottomBarHandle>(null)

  // ToC overlay state
  const [showToc, setShowToc] = useState(false)

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

  // Re-read position from cloud storage once Supabase syncs — pick furthest position
  const hasRestoredFromCloud = useRef(false)
  useEffect(() => {
    if (storageReady && user && !hasRestoredFromCloud.current) {
      hasRestoredFromCloud.current = true
      const cloudPos = getSavedPosition(book.id)
      if (cloudPos) {
        const localPos = savedPos.current
        const winner = pickFurthest(localPos, cloudPos)
        if (winner) {
          savedPos.current = winner
          setCurrentChapter(winner.chapterNumber)
          setCurrentPage(0) // will be corrected by Reader from scrollFraction after layout
          setReaderKey(k => k + 1) // force Reader remount with correct initialPage
        }
      }
    }
  }, [storageReady, user, book.id])

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
        const localPos: ReadingPosition = {
          bookId: book.id,
          chapterNumber: currentChapter,
          currentPage,
          totalPages,
          scrollFraction: totalPages > 1 ? currentPage / (totalPages - 1) : 0,
        }
        const winner = pickFurthest(localPos, cloudPos)
        if (winner && (winner.chapterNumber !== currentChapter ||
            (winner.scrollFraction ?? 0) > (localPos.scrollFraction ?? 0) + 0.01)) {
          savedPos.current = winner
          setCurrentChapter(winner.chapterNumber)
          setCurrentPage(0)
          setReaderKey(k => k + 1)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [user, book.id, currentChapter, currentPage, totalPages])

  // Get current chapter data early so we can pass context to chat
  const primaryEditionKey = makeEditionKey(preferences.style, preferences.language)
  const primaryChapter = primaryData?.chapters.find(c => c.number === currentChapter)
  const chapterTitle = primaryChapter?.title || `Chapter ${currentChapter}`
  const totalChapters = primaryData?.chapters.length || book.editions.length

  // Short labels for chapter dropdown
  const chapterLabels = useMemo(() => {
    if (!primaryData) return []
    return primaryData.chapters.map(c => {
      const parts = c.title.split(' — ')
      return parts[0]
    })
  }, [primaryData])

  // Approximate visible text based on current page position
  const visibleText = useMemo(() => {
    const paras = primaryChapter?.paragraphs || []
    if (paras.length === 0 || totalPages <= 0) return ''
    const startIdx = Math.floor((currentPage / Math.max(totalPages, 1)) * paras.length)
    const endIdx = Math.min(startIdx + Math.ceil(paras.length / Math.max(totalPages, 1)) + 1, paras.length)
    return paras.slice(startIdx, endIdx).join(' ')
  }, [primaryChapter?.paragraphs, currentPage, totalPages])

  // Handle insufficient balance
  const handleInsufficientBalance = useCallback(() => {
    if (isAnonymous) {
      setShowAuthModal(true)
    } else {
      setShowUsageDashboard(true)
    }
  }, [isAnonymous])

  // Handle Stripe top-up
  const handleTopUp = useCallback(async (amountCents: number) => {
    if (!session?.access_token) return

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount_cents: amountCents }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout failed:', err)
    }
  }, [session])

  // Check for payment success on URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      refreshProfile()
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [refreshProfile])

  const { messages, isLoading: chatLoading, sendMessage, clearMessages } = useClaude({
    bookTitle: book.title,
    bookAuthor: book.author,
    chapterTitle,
    readingObjective: preferences.readingObjective,
    visibleText,
    authToken: session?.access_token,
    onInsufficientBalance: handleInsufficientBalance,
    onUsage: deductUsage,
  })

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

  const { highlights, addHighlight, getEditionHighlights, getAllBookHighlights } = useHighlights(book.id, currentChapter)
  const { notes, addNote, deleteNote, updateNote, replaceAllNotes, getAllBookNotes } = useNotes(book.id, currentChapter)
  useReadingPosition(book.id, currentChapter, currentPage, totalPages, totalChapters)

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
      setCurrentChapter(chapter)
    }
    setReaderKey(k => k + 1)
  }, [currentChapter, currentPage, totalPages, preferences.style, preferences.language, setStyle, setLanguage])

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

  // Split edition key
  const splitEditionKey = preferences.splitEditionKey

  // Load primary edition
  useEffect(() => {
    setIsLoading(true)
    loadEdition(book.id, primaryEditionKey).then(data => {
      setPrimaryData(data)
      setIsLoading(false)
    })
  }, [primaryEditionKey])

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

  // Get aligned editions for split pane (excluding current primary)
  const alignedEditions = useMemo(() => {
    return book.editions.filter(ed => ed.aligned && ed.key !== primaryEditionKey)
  }, [primaryEditionKey])

  // Check if split view is available
  const splitViewAvailable = alignedEditions.length > 0

  // Get edition label
  const primaryEdition = book.editions.find(ed => ed.key === primaryEditionKey)
  const editionLabel = primaryEdition?.label || primaryEditionKey

  // Clear chat when changing chapters (chat is chapter-scoped)
  const prevChapterRef = useRef(currentChapter)
  useEffect(() => {
    if (prevChapterRef.current !== currentChapter) {
      clearMessages()
    }
    prevChapterRef.current = currentChapter
  }, [currentChapter, clearMessages])

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

  // Chat message handler
  const handleSendMessage = useCallback((content: string, highlightedText?: string) => {
    sendMessage(content, highlightedText)
  }, [sendMessage])

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

      const response = await fetch('/api/chat', {
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
        deductUsage(data.usage.input_tokens || 0, data.usage.output_tokens || 0)
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

      const response = await fetch('/api/chat', {
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
        deductUsage(data.usage.input_tokens || 0, data.usage.output_tokens || 0)
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
    const reflectPrompt = `I've just finished reading ${chapterTitle} of The Odyssey. Help me reflect on the key themes, memorable moments, and anything I might have missed.`
    setPanelTab('chat')
    if (!preferences.panelOpen) togglePanel()
    sendMessage(reflectPrompt)
  }, [primaryChapter, currentChapter, setPanelTab, preferences.panelOpen, togglePanel, sendMessage])

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
    const url = `/audio/${book.id}/${primaryEditionKey}/ch${currentChapter}/manifest.json`
    fetch(url, { method: 'HEAD' })
      .then(res => setHasAudio(res.ok))
      .catch(() => setHasAudio(false))
  }, [book.id, primaryEditionKey, currentChapter])

  // Wrap split view toggle to preserve position
  const handleToggleSplitView = useCallback(() => {
    // Save current scroll fraction before toggling
    const frac = totalPages > 1 ? currentPage / (totalPages - 1) : 0
    savedPos.current = {
      bookId: book.id,
      chapterNumber: currentChapter,
      currentPage,
      totalPages,
      scrollFraction: frac,
    }
    toggleSplitView()
    setReaderKey(k => k + 1)
  }, [toggleSplitView, currentPage, totalPages, currentChapter, book.id])

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

      {showSettings && (
        <Onboarding
          isSettings
          onComplete={(obj) => { setReadingObjective(obj) }}
          onClose={() => setShowSettings(false)}
          allEditions={book.editions}
          primaryEditionKey={primaryEditionKey}
          onPrimaryEditionChange={(key) => {
            const parts = key.split('-')
            const newStyle = parts[0] as Style
            const newLang = parts.slice(1).join('-') as 'en' | 'da'
            if (newLang !== preferences.language) setLanguage(newLang)
            if (newStyle !== preferences.style) handleStyleChange(newStyle)
          }}
          initialObjective={preferences.readingObjective}
          splitEditionKey={preferences.splitEditionKey}
          onSplitEditionChange={setSplitEditionKey}
          alignedEditions={alignedEditions}
          splitView={preferences.splitView}
          onToggleSplitView={handleToggleSplitView}
          audioEditions={book.editions.filter(ed => ed.hasAudio)}
          audioEditionKey={primaryEditionKey}
          onAudioEditionChange={() => {/* TODO: wire audio edition preference */}}
        />
      )}

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
          onTopUp={handleTopUp}
          isAnonymous={isAnonymous}
          onSignIn={() => { setShowUsageDashboard(false); setShowAuthModal(true) }}
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
        onOpenNotes={() => { setPanelTab('notes'); setActiveView(2) }}
        onOpenCast={() => { setPanelTab('threads'); setActiveView(2) }}
        fontSize={preferences.fontSize}
        onFontSizeChange={setFontSize}
        fontFamily={preferences.fontFamily}
        onFontFamilyChange={setFontFamily}
        readingObjective={preferences.readingObjective}
        onEditObjective={handleEditObjective}
        onOpenToc={() => setShowToc(true)}
        onOpenSettings={() => setShowSettings(true)}
        sections={primaryData?.sections}
        isMobile={isMobile}
      />

      <main
        className={`main-layout ${isMobile ? 'main-layout-mobile' : ''}`}
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
              />
            </div>
            {/* View 1: Compare — shows alternate edition full-width on mobile */}
            <div className={`mobile-view ${activeView === 1 ? 'mobile-view-active' : ''}`}>
              {preferences.splitView && splitChapter ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="mobile-compare-header">
                    <select
                      className="split-edition-select"
                      value={splitEditionKey}
                      onChange={e => setSplitEditionKey(e.target.value)}
                    >
                      {alignedEditions.map(ed => (
                        <option key={ed.key} value={ed.key}>{ed.label}</option>
                      ))}
                    </select>
                  </div>
                  <Reader
                    paragraphs={splitChapter?.paragraphs || []}
                    chapterTitle={primaryChapter?.title || `Book ${currentChapter}`}
                    editionLabel={book.editions.find(ed => ed.key === splitEditionKey)?.label || splitEditionKey}
                    isLoading={isLoading}
                    highlights={getEditionHighlights(splitEditionKey)}
                    onHighlight={handleHighlight}
                    onTextSelect={(text) => { handleTextSelect(text); setActiveView(2) }}
                    isFinalChapter={currentChapter === totalChapters}
                    readerRef={compareReaderRef}
                    isVerse={splitIsVerse}
                  />
                </div>
              ) : (
                <div className="mobile-view-placeholder">
                  <p>Enable Compare view from the menu to see another edition.</p>
                </div>
              )}
            </div>
            {/* View 2: Panel */}
            <div className={`mobile-view ${activeView === 2 ? 'mobile-view-active' : ''}`}>
              <SidePanel
                isOpen={true}
                activeTab={preferences.panelTab}
                onTabChange={setPanelTab}
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
                onUpdateNote={updateNote}
                onCopyToNotes={handleCopyToNotes}
                onCleanupNotes={handleCleanupNotes}
                isCleaningUp={isCleaningUp}
                allBookHighlights={getAllBookHighlights()}
                chapterLabels={chapterLabels}
                threadCharacters={threadsData?.characters || []}
                currentChapter={currentChapter}
                editionKey={primaryEditionKey}
                language={preferences.language}
                getMentions={getMentions}
                onNavigateToChapter={(ch, pi, ek) => { handleNavigateToChapter(ch, pi, ek); setActiveView(0) }}
                onSignIn={() => { setAuthModalMode('signup'); setShowAuthModal(true) }}
                onShowPricing={() => setShowPricingModal(true)}
              />
            </div>
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
                initialPage={savedPos.current?.chapterNumber === currentChapter ? (savedPos.current?.scrollFraction ?? undefined) : undefined}
                playingParagraphIndex={audioPlayingParagraph}
                onParagraphClick={handleParagraphClick}
                hasAudio={hasAudio}
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
              />
            )}

            <PanelToggleTab isOpen={preferences.panelOpen} onClick={togglePanel} />

            <SidePanel
              isOpen={preferences.panelOpen}
              activeTab={preferences.panelTab}
              onTabChange={setPanelTab}
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
              onUpdateNote={updateNote}
              onCopyToNotes={handleCopyToNotes}
              onCleanupNotes={handleCleanupNotes}
              isCleaningUp={isCleaningUp}
              allBookHighlights={getAllBookHighlights()}
              chapterLabels={chapterLabels}
              threadCharacters={threadsData?.characters || []}
              currentChapter={currentChapter}
              editionKey={primaryEditionKey}
              language={preferences.language}
              getMentions={getMentions}
              onNavigateToChapter={handleNavigateToChapter}
              messagesRemaining={messagesRemaining}
              hasBalance={hasBalance}
              isAnonymous={isAnonymous}
              onTopUp={() => setShowUsageDashboard(true)}
              onSignIn={() => { setAuthModalMode('signup'); setShowAuthModal(true) }}
              onShowPricing={() => setShowPricingModal(true)}
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
        bookId={book.id}
        editionKey={primaryEditionKey}
        chapterNumber={currentChapter}
        onParagraphChange={handleAudioParagraphChange}
        firstVisibleParagraph={firstVisibleParagraph}
      />

      {insight && (
        <ProactiveInsight
          text={insight}
          onDiscuss={handleDiscussInsight}
          onDismiss={dismissInsight}
        />
      )}
    </div>
    </TierProvider>
  )
}
