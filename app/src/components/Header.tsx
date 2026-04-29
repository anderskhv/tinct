import { useState, useRef, useEffect } from 'react'
import type { Book, Language, Style, FontSize, FontFamily, Section, ProgressDisplay, ProgressMetric, ProgressScope } from '../types'
import type { User } from '@supabase/supabase-js'
import { BalanceIndicator } from './BalanceIndicator'

interface HeaderProps {
  bookTitle: string
  bookAuthor: string
  books: Book[]
  currentBookId: string
  onBookChange: (bookId: string) => void
  language: Language
  onLanguageChange: (lang: Language) => void
  style: Style
  onStyleChange: (style: Style) => void
  availableStyles: { style: Style; label: string }[]
  currentChapter: number
  totalChapters: number
  chapterLabels: string[]
  onChapterChange: (n: number) => void
  splitView: boolean
  onToggleSplitView: () => void
  splitViewAvailable: boolean
  darkMode: boolean
  onToggleDarkMode: () => void
  panelOpen: boolean
  readingProgress?: number
  // Auth & billing
  user: User | null
  messagesRemaining: number
  hasBalance: boolean
  isAnonymous: boolean
  onSignIn: () => void
  onSignOut: () => void
  onOpenUsage: () => void
  onOpenStore: () => void
  onOpenDownloads?: () => void
  isBookDownloaded?: boolean
  // E-ink audio
  hasAudio?: boolean
  isAudioPlaying?: boolean
  onToggleAudio?: () => void
  onOpenSearch?: () => void
  onOpenNotes?: () => void
  onOpenCast?: () => void
  onResetPassword?: (email: string) => Promise<{ error?: string }>
  onDeleteAccount?: () => void
  // Format
  fontSize: FontSize
  onFontSizeChange: (size: FontSize) => void
  fontFamily: FontFamily
  onFontFamilyChange: (family: FontFamily) => void
  // Reading angle
  readingObjective: string
  onEditObjective: () => void
  onSaveObjective?: (objective: string) => void
  // ToC
  onOpenToc: () => void
  // Settings (opens onboarding/settings modal)
  onOpenSettings: () => void
  // Focus mode (hides chrome for immersive reading)
  focusMode?: boolean
  onToggleFocusMode?: () => void
  // Sections (hierarchical ToC)
  sections?: Section[]
  // Progress display
  progressDisplay?: ProgressDisplay
  onProgressDisplayChange?: (pd: ProgressDisplay) => void
  // Mobile
  isMobile?: boolean
  // Split edition (for mobile compare picker)
  splitEditionKey?: string
  onSplitEditionChange?: (key: string) => void
  alignedEditions?: { key: string; label: string }[]
  // Audio editions
  audioEditions?: { key: string; label: string; hasAudio?: boolean }[]
  audioEditionKey?: string
  onAudioEditionChange?: (key: string) => void
  // Whether this book has sections (hides 'of section' scope option if false)
  hasSections?: boolean
}

type MenuOpen = null | 'format' | 'account'

/** Flatten sections into optgroup-friendly groups (uses innermost section as group label) */
function flattenSectionsForSelect(
  sections: Section[],
  chapterLabels: string[],
): { label: string; chapters: number[] }[] {
  const groups: { label: string; chapters: number[] }[] = []
  function walk(secs: Section[]) {
    for (const sec of secs) {
      if (sec.sections && sec.sections.length > 0) {
        walk(sec.sections)
      } else if (sec.chapters && sec.chapters.length > 0) {
        groups.push({ label: sec.title, chapters: sec.chapters })
      }
    }
  }
  walk(sections)
  return groups
}

export function Header({
  bookTitle,
  bookAuthor,
  books,
  currentBookId,
  onBookChange,
  language,
  onLanguageChange,
  style,
  onStyleChange,
  availableStyles,
  currentChapter,
  totalChapters,
  chapterLabels,
  onChapterChange,
  splitView,
  onToggleSplitView,
  splitViewAvailable,
  darkMode,
  onToggleDarkMode,
  panelOpen,
  readingProgress,
  user,
  messagesRemaining,
  hasBalance,
  isAnonymous,
  onSignIn,
  onSignOut,
  onOpenUsage,
  onOpenStore,
  onOpenDownloads,
  isBookDownloaded,
  hasAudio,
  isAudioPlaying,
  onToggleAudio,
  onOpenSearch,
  onOpenNotes,
  onOpenCast,
  onResetPassword,
  onDeleteAccount,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  readingObjective,
  onEditObjective,
  onSaveObjective,
  onOpenToc,
  onOpenSettings,
  focusMode,
  onToggleFocusMode,
  sections,
  progressDisplay,
  onProgressDisplayChange,
  isMobile,
  splitEditionKey,
  onSplitEditionChange,
  alignedEditions,
  audioEditions,
  audioEditionKey,
  onAudioEditionChange,
  hasSections,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSections, setMobileSections] = useState<{ format: boolean; reading: boolean; account: boolean }>({ format: true, reading: false, account: false })
  const [localObjective, setLocalObjective] = useState(readingObjective)
  const [menuOpen, setMenuOpen] = useState<MenuOpen>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [resetSent, setResetSent] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Sync local objective when prop changes or menu opens
  useEffect(() => {
    setLocalObjective(readingObjective)
  }, [readingObjective, mobileMenuOpen])

  // Get current book for all-editions picker
  const currentBook = books.find(b => b.id === currentBookId)
  const allEditions = currentBook?.editions || []
  const currentEditionKey = `${style}-${language}`

  if (isMobile) {
    return (
      <header className="header header-mobile">
        <div className="header-left">
          <h1 className="logo">Tinct</h1>
          <span className="separator">&middot;</span>
          <span className="mobile-book-title">{bookTitle}</span>
        </div>

        <nav className="menu-bar">
          <button className="menu-icon-btn" data-tour="library" onClick={onOpenStore} aria-label="Library">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </button>

          {onOpenSearch && (
            <button className="menu-icon-btn" onClick={onOpenSearch} aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4" />
                <line x1="10" y1="10" x2="14" y2="14" />
              </svg>
            </button>
          )}

          <button className="menu-icon-btn" data-tour="toc" onClick={onOpenToc} aria-label="Table of contents">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="4" x2="13" y2="4" />
              <line x1="3" y1="8" x2="11" y2="8" />
              <line x1="3" y1="12" x2="9" y2="12" />
            </svg>
          </button>

          {hasAudio && onToggleAudio && (
            <button
              className={`menu-icon-btn ${isAudioPlaying ? 'menu-icon-active' : ''}`}
              data-tour="audio"
              onClick={onToggleAudio}
              aria-label={isAudioPlaying ? 'Hide audio player' : 'Show audio player'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
                <rect x="3" y="14" width="4" height="6" />
                <rect x="17" y="14" width="4" height="6" />
              </svg>
            </button>
          )}

          {onToggleFocusMode && (
            <button className="menu-icon-btn" onClick={onToggleFocusMode} aria-label={focusMode ? 'Exit focus mode' : 'Focus mode'} title={focusMode ? 'Exit focus (Esc)' : 'Focus mode (F)'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              </svg>
            </button>
          )}

          <button className="menu-icon-btn" data-tour="settings" onClick={onOpenSettings} aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </nav>

        {readingProgress != null && readingProgress > 0 && (
          <div className="reading-progress-bar" title={`${readingProgress}% complete`}>
            <div className="reading-progress-fill" style={{ width: `${readingProgress}%` }} />
          </div>
        )}
      </header>
    )
  }

  // Desktop header — new menu bar design
  return (
    <header className="header" ref={menuRef}>
      <div className="header-left">
        <h1 className="logo">Tinct</h1>
        <span className="separator">&middot;</span>
        <span className="book-title">{bookTitle}</span>
        <span className="separator">&middot;</span>
        <span className="author">{bookAuthor}</span>
      </div>

      <nav className="menu-bar">
        <button className="menu-icon-btn" data-tour="library" onClick={onOpenStore} title="Library">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </button>

        {splitViewAvailable && (
          <button
            className={`menu-icon-btn ${splitView ? 'menu-icon-active' : ''}`}
            data-tour="compare"
            onClick={onToggleSplitView}
            title={splitView ? 'Single view' : 'Compare editions'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="2" width="14" height="12" rx="1.5" />
              <line x1="8" y1="2" x2="8" y2="14" />
            </svg>
          </button>
        )}

        {onOpenSearch && (
          <button className="menu-icon-btn" onClick={onOpenSearch} title="Search in book">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4" />
              <line x1="10" y1="10" x2="14" y2="14" />
            </svg>
          </button>
        )}

        <button className="menu-icon-btn" data-tour="toc" onClick={onOpenToc} title="Table of contents">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="4" x2="13" y2="4" />
            <line x1="3" y1="8" x2="11" y2="8" />
            <line x1="3" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        {hasAudio && onToggleAudio && (
          <button
            className={`menu-icon-btn ${isAudioPlaying ? 'menu-icon-active' : ''}`}
            data-tour="audio"
            onClick={onToggleAudio}
            title={isAudioPlaying ? 'Hide audio player' : 'Show audio player'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
              <rect x="3" y="14" width="4" height="6" />
              <rect x="17" y="14" width="4" height="6" />
            </svg>
          </button>
        )}

        {onToggleFocusMode && (
          <button className="menu-icon-btn" onClick={onToggleFocusMode} title={focusMode ? 'Exit focus (Esc)' : 'Focus mode (F)'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            </svg>
          </button>
        )}

        <button className="menu-icon-btn" data-tour="settings" onClick={onOpenSettings} title="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </nav>
    </header>
  )
}
