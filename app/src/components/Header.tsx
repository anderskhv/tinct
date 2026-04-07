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
                  <div className="mobile-menu-item">
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
                          <option value="section">of section</option>
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
        {/* Icon buttons */}
        {splitViewAvailable && (
          <button
            className={`menu-icon-btn ${splitView ? 'menu-icon-active' : ''}`}
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

        <button className="menu-icon-btn" onClick={onOpenToc} title="Table of contents">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="4" x2="13" y2="4" />
            <line x1="3" y1="8" x2="11" y2="8" />
            <line x1="3" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        <span className="menu-divider" />

        {/* Text buttons — order: Library, Format, Settings */}
        <button className="menu-item" onClick={onOpenStore}>Library</button>

        <div className="menu-item-wrapper">
          <button
            className={`menu-item ${menuOpen === 'format' ? 'menu-item-active' : ''}`}
            onClick={() => setMenuOpen(menuOpen === 'format' ? null : 'format')}
          >
            Format
          </button>
          {menuOpen === 'format' && (
            <div className="menu-dropdown">
              <div className="menu-dropdown-section">
                <span className="menu-dropdown-label">Theme</span>
                <div className="menu-dropdown-row">
                  <button
                    className={`menu-toggle-btn ${!darkMode ? 'menu-toggle-active' : ''}`}
                    onClick={() => { if (darkMode) onToggleDarkMode() }}
                  >Light</button>
                  <button
                    className={`menu-toggle-btn ${darkMode ? 'menu-toggle-active' : ''}`}
                    onClick={() => { if (!darkMode) onToggleDarkMode() }}
                  >Dark</button>
                </div>
              </div>
              <div className="menu-dropdown-section">
                <span className="menu-dropdown-label">Font size</span>
                <div className="menu-dropdown-row">
                  {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map(s => (
                    <button
                      key={s}
                      className={`menu-toggle-btn ${fontSize === s ? 'menu-toggle-active' : ''}`}
                      onClick={() => onFontSizeChange(s)}
                    >
                      {s === 'small' ? 'S' : s === 'medium' ? 'M' : s === 'large' ? 'L' : 'XL'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="menu-dropdown-section">
                <span className="menu-dropdown-label">Font</span>
                <div className="menu-dropdown-row">
                  {(['garamond', 'baskerville', 'sourceserif'] as FontFamily[]).map(f => (
                    <button
                      key={f}
                      className={`menu-toggle-btn ${fontFamily === f ? 'menu-toggle-active' : ''}`}
                      onClick={() => onFontFamilyChange(f)}
                    >
                      {f === 'garamond' ? 'Garamond' : f === 'baskerville' ? 'Baskerville' : 'Source Serif'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="menu-item" onClick={onOpenSettings}>Settings</button>

        {onOpenDownloads && (
          <button className="menu-icon-btn" onClick={onOpenDownloads} title={isBookDownloaded ? 'Downloaded for offline' : 'Download for offline'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v8M5 7l3 3 3-3" />
              <path d="M2 12v2h12v-2" />
            </svg>
            {isBookDownloaded && <span className="menu-icon-dot" />}
          </button>
        )}

        {/* Account / Sign in */}
        <div className="menu-item-wrapper">
          {user ? (
            <>
              <button
                className={`menu-item ${menuOpen === 'account' ? 'menu-item-active' : ''}`}
                onClick={() => setMenuOpen(menuOpen === 'account' ? null : 'account')}
              >
                Account
              </button>
              {menuOpen === 'account' && (
                <div className="menu-dropdown menu-dropdown-account">
                  <div className="menu-dropdown-section">
                    <span className="menu-dropdown-label">{user.email}</span>
                  </div>
                  <button className="menu-dropdown-link" onClick={() => { onOpenUsage(); setMenuOpen(null) }}>
                    Credits & usage
                  </button>
                  {onResetPassword && user.email && (
                    resetSent ? (
                      <span className="menu-dropdown-label" style={{ padding: '6px 12px', color: 'var(--accent)', fontSize: '0.85rem' }}>
                        Reset email sent
                      </span>
                    ) : (
                      <button className="menu-dropdown-link" onClick={async () => {
                        await onResetPassword(user.email!)
                        setResetSent(true)
                        setTimeout(() => setResetSent(false), 5000)
                      }}>
                        Change password
                      </button>
                    )
                  )}
                  <button className="menu-dropdown-link menu-dropdown-signout" onClick={() => { onSignOut(); setMenuOpen(null) }}>
                    Sign out
                  </button>
                  {onDeleteAccount && (
                    showDeleteConfirm ? (
                      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.8rem', margin: '0 0 8px', color: 'var(--text-secondary)' }}>
                          Permanently delete your account and all data?
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="menu-dropdown-link" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, textAlign: 'center' }}>
                            Cancel
                          </button>
                          <button className="menu-dropdown-link menu-dropdown-signout" onClick={() => { onDeleteAccount(); setMenuOpen(null); setShowDeleteConfirm(false) }} style={{ flex: 1, textAlign: 'center', color: '#c0392b' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="menu-dropdown-link" onClick={() => setShowDeleteConfirm(true)} style={{ color: 'var(--text-secondary)' }}>
                        Delete account
                      </button>
                    )
                  )}
                </div>
              )}
            </>
          ) : (
            <button className="menu-item" onClick={onSignIn}>Sign in</button>
          )}
        </div>
      </nav>
    </header>
  )
}
