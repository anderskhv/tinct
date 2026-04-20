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
          <span className="separator">&middot;</span>
          <span className="mobile-book-author">{bookAuthor}</span>
        </div>

        <div className="header-right">
          {hasAudio && onToggleAudio && (
            <button
              className={`icon-button header-audio-btn ${isAudioPlaying ? 'header-audio-playing' : ''}`}
              onClick={onToggleAudio}
              aria-label={isAudioPlaying ? 'Pause audiobook' : 'Play audiobook'}
            >
              {isAudioPlaying ? <span className="icon-pause-sm" /> : <span className="icon-play-sm" />}
            </button>
          )}
          {onOpenSearch && (
            <button
              className="icon-button"
              onClick={onOpenSearch}
              aria-label="Search"
              style={{ fontSize: '1rem' }}
            >
              &#x1F50D;
            </button>
          )}
          <button
            className="icon-button"
            onClick={onOpenToc}
            aria-label="Table of Contents"
            style={{ fontSize: '1.1rem' }}
          >
            ☰
          </button>
          <button
            className="icon-button mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Settings"
          >
            {mobileMenuOpen ? '✕' : '⋮'}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu-content" onClick={e => e.stopPropagation()}>
              {/* --- BROWSE LIBRARY (always visible) --- */}
              <div className="mobile-menu-item">
                <button className="mobile-menu-library-btn" onClick={() => { onOpenStore(); setMobileMenuOpen(false) }}>
                  Browse Library
                </button>
              </div>

              {onOpenDownloads && (
                <div className="mobile-menu-item">
                  <button className="mobile-menu-library-btn" onClick={() => { onOpenDownloads(); setMobileMenuOpen(false) }}>
                    Offline Reading {isBookDownloaded ? '✓' : ''}
                  </button>
                </div>
              )}

              {/* --- FORMAT (open by default) --- */}
              <div
                className="mobile-menu-section-header mobile-menu-collapsible"
                onClick={() => setMobileSections(s => ({ ...s, format: !s.format }))}
              >
                <span>Format</span>
                <span className="mobile-menu-chevron">{mobileSections.format ? '▾' : '▸'}</span>
              </div>

              {mobileSections.format && (
                <>
                  <div className="mobile-menu-item theme-toggle-section">
                    <label className="mobile-menu-label">Theme</label>
                    <div className="mobile-menu-row">
                      <button
                        className={`mobile-menu-toggle-btn ${!darkMode ? 'mobile-menu-toggle-btn-active' : ''}`}
                        onClick={() => { if (darkMode) onToggleDarkMode() }}
                      >Light</button>
                      <button
                        className={`mobile-menu-toggle-btn ${darkMode ? 'mobile-menu-toggle-btn-active' : ''}`}
                        onClick={() => { if (!darkMode) onToggleDarkMode() }}
                      >Dark</button>
                    </div>
                  </div>

                  <div className="mobile-menu-item">
                    <label className="mobile-menu-label">Font size</label>
                    <div className="mobile-menu-row">
                      {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map(s => (
                        <button
                          key={s}
                          className={`mobile-menu-toggle-btn ${fontSize === s ? 'mobile-menu-toggle-btn-active' : ''}`}
                          onClick={() => onFontSizeChange(s)}
                        >
                          {s === 'small' ? 'S' : s === 'medium' ? 'M' : s === 'large' ? 'L' : 'XL'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mobile-menu-item">
                    <label className="mobile-menu-label">Font</label>
                    <div className="mobile-menu-row">
                      {(['garamond', 'baskerville', 'sourceserif'] as FontFamily[]).map(f => (
                        <button
                          key={f}
                          className={`mobile-menu-toggle-btn ${fontFamily === f ? 'mobile-menu-toggle-btn-active' : ''}`}
                          onClick={() => onFontFamilyChange(f)}
                        >
                          {f === 'garamond' ? 'Garamond' : f === 'baskerville' ? 'Baskerville' : 'Source'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* --- READING (closed by default) --- */}
              <div
                className="mobile-menu-section-header mobile-menu-collapsible"
                onClick={() => setMobileSections(s => ({ ...s, reading: !s.reading }))}
              >
                <span>Reading</span>
                <span className="mobile-menu-chevron">{mobileSections.reading ? '▾' : '▸'}</span>
              </div>

              {mobileSections.reading && (
                <>
                  <div className="mobile-menu-item">
                    <label className="mobile-menu-label">Edition</label>
                    <select
                      className="mobile-menu-select"
                      value={currentEditionKey}
                      onChange={e => {
                        const ed = allEditions.find(ed => ed.key === e.target.value)
                        if (ed) {
                          onLanguageChange(ed.language)
                          onStyleChange(ed.style)
                        }
                      }}
                    >
                      {allEditions.map(ed => (
                        <option key={ed.key} value={ed.key}>{ed.label}</option>
                      ))}
                    </select>
                  </div>

                  {alignedEditions && alignedEditions.length > 0 && (
                    <div className="mobile-menu-item">
                      <label className="mobile-menu-label">Compare edition</label>
                      <select
                        className="mobile-menu-select"
                        value={splitEditionKey || ''}
                        onChange={e => onSplitEditionChange?.(e.target.value)}
                      >
                        {alignedEditions.map(ed => (
                          <option key={ed.key} value={ed.key}>{ed.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {audioEditions && audioEditions.length > 0 && (
                    <div className="mobile-menu-item">
                      <label className="mobile-menu-label">Audiobook</label>
                      <select
                        className="mobile-menu-select"
                        value={audioEditionKey || currentEditionKey}
                        onChange={e => onAudioEditionChange?.(e.target.value)}
                      >
                        <option value="none">No audiobook</option>
                        {audioEditions.map(ed => (
                          <option key={ed.key} value={ed.key}>{ed.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mobile-menu-item mobile-menu-item-col">
                    <label className="mobile-menu-label">Reading angle</label>
                    <textarea
                      className="mobile-menu-textarea"
                      value={localObjective}
                      onChange={e => setLocalObjective(e.target.value)}
                      onBlur={() => {
                        if (localObjective.trim() !== readingObjective) {
                          onSaveObjective?.(localObjective.trim())
                        }
                      }}
                      placeholder="e.g. Leadership lessons, mythology connections..."
                      rows={2}
                    />
                  </div>

                  {progressDisplay && onProgressDisplayChange && (
                    <div className="mobile-menu-item">
                      <label className="mobile-menu-label">Reading progress</label>
                      <div className="mobile-menu-row">
                        <select
                          className="mobile-menu-select"
                          value={progressDisplay.metric}
                          onChange={e => onProgressDisplayChange({ ...progressDisplay, metric: e.target.value as ProgressMetric })}
                          style={{ flex: 1 }}
                        >
                          <option value="percent">Percentage</option>
                          <option value="time">Time left</option>
                          <option value="page">Page</option>
                          <option value="location">Location</option>
                        </select>
                        <select
                          className="mobile-menu-select"
                          value={progressDisplay.scope}
                          onChange={e => onProgressDisplayChange({ ...progressDisplay, scope: e.target.value as ProgressScope })}
                          style={{ flex: 1 }}
                        >
                          <option value="book">of book</option>
                          {hasSections && <option value="section">of section</option>}
                          <option value="chapter">of chapter</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* --- ACCOUNT (closed by default) --- */}
              <div
                className="mobile-menu-section-header mobile-menu-collapsible"
                onClick={() => setMobileSections(s => ({ ...s, account: !s.account }))}
              >
                <span>Account</span>
                <span className="mobile-menu-chevron">{mobileSections.account ? '▾' : '▸'}</span>
              </div>

              {mobileSections.account && (
                <>
                  <div className="mobile-menu-item">
                    <BalanceIndicator
                      messagesRemaining={messagesRemaining}
                      hasBalance={hasBalance}
                      isAnonymous={isAnonymous}
                      onTopUp={onOpenUsage}
                      onSignIn={onSignIn}
                    />
                  </div>

                  <div className="mobile-menu-item">
                    {user ? (
                      <button className="mobile-menu-auth" onClick={() => { onSignOut(); setMobileMenuOpen(false) }}>
                        Sign out ({user.email})
                      </button>
                    ) : (
                      <button className="mobile-menu-auth" onClick={() => { onSignIn(); setMobileMenuOpen(false) }}>
                        Sign in
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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
        {onOpenSearch && (
          <button className="menu-icon-btn" onClick={onOpenSearch} title="Search in book">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4" />
              <line x1="10" y1="10" x2="14" y2="14" />
            </svg>
          </button>
        )}

        {hasAudio && onToggleAudio && (
          <button
            className={`menu-icon-btn ${isAudioPlaying ? 'menu-icon-active' : ''}`}
            onClick={onToggleAudio}
            title={isAudioPlaying ? 'Pause audiobook' : 'Listen'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
              <rect x="3" y="14" width="4" height="6" />
              <rect x="17" y="14" width="4" height="6" />
            </svg>
          </button>
        )}

        <button className="menu-icon-btn" onClick={onOpenSettings} title="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </nav>
    </header>
  )
}
