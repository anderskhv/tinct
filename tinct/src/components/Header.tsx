import { useState, useRef, useEffect } from 'react'
import type { Book, Language, Style, FontSize, FontFamily, Section } from '../types'
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
  // ToC
  onOpenToc: () => void
  // Settings (opens onboarding/settings modal)
  onOpenSettings: () => void
  // Sections (hierarchical ToC)
  sections?: Section[]
  // Mobile
  isMobile?: boolean
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
  onOpenToc,
  onOpenSettings,
  sections,
  isMobile,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  if (isMobile) {
    return (
      <header className="header header-mobile">
        <div className="header-left">
          <h1 className="logo">Tinct</h1>
        </div>

        <div className="header-center">
          <button
            className="chapter-nav"
            disabled={currentChapter <= 1}
            onClick={() => onChapterChange(currentChapter - 1)}
          >&larr;</button>
          <select
            className="chapter-select"
            value={currentChapter}
            onChange={e => onChapterChange(Number(e.target.value))}
          >
            {sections && sections.length > 0 ? (
              flattenSectionsForSelect(sections, chapterLabels).map(group => (
                <optgroup key={group.label} label={group.label}>
                  {group.chapters.map(n => (
                    <option key={n} value={n}>{chapterLabels[n - 1] || `Ch ${n}`}</option>
                  ))}
                </optgroup>
              ))
            ) : (
              Array.from({ length: totalChapters }, (_, i) => (
                <option key={i + 1} value={i + 1}>{chapterLabels[i] || `Ch ${i + 1}`}</option>
              ))
            )}
          </select>
          <button
            className="chapter-nav"
            disabled={currentChapter >= totalChapters}
            onClick={() => onChapterChange(currentChapter + 1)}
          >&rarr;</button>
        </div>

        <div className="header-right">
          <button
            className="icon-button mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu-content" onClick={e => e.stopPropagation()}>
              {books.length > 1 && (
                <div className="mobile-menu-item">
                  <label className="mobile-menu-label">Book</label>
                  <select
                    className="mobile-menu-select"
                    value={currentBookId}
                    onChange={e => { onBookChange(e.target.value); setMobileMenuOpen(false) }}
                  >
                    {books.map(b => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mobile-menu-item">
                <label className="mobile-menu-label">Language</label>
                <div className="lang-toggle">
                  <button className={`lang-button ${language === 'en' ? 'lang-active' : ''}`} onClick={() => onLanguageChange('en')}>EN</button>
                  <button className={`lang-button ${language === 'da' ? 'lang-active' : ''}`} onClick={() => onLanguageChange('da')}>DA</button>
                </div>
              </div>

              <div className="mobile-menu-item">
                <label className="mobile-menu-label">Edition</label>
                <select
                  className="mobile-menu-select"
                  value={style}
                  onChange={e => onStyleChange(e.target.value as Style)}
                >
                  {availableStyles.map(s => (
                    <option key={s.style} value={s.style}>{s.label}</option>
                  ))}
                </select>
              </div>

              {splitViewAvailable && (
                <div className="mobile-menu-item">
                  <label className="mobile-menu-label">Compare view</label>
                  <button
                    className={`mobile-menu-toggle ${splitView ? 'mobile-menu-toggle-on' : ''}`}
                    onClick={onToggleSplitView}
                  >
                    {splitView ? 'On' : 'Off'}
                  </button>
                </div>
              )}

              <div className="mobile-menu-item">
                <label className="mobile-menu-label">Dark mode</label>
                <button
                  className={`mobile-menu-toggle ${darkMode ? 'mobile-menu-toggle-on' : ''}`}
                  onClick={onToggleDarkMode}
                >
                  {darkMode ? 'On' : 'Off'}
                </button>
              </div>

              {onOpenNotes && (
                <div className="mobile-menu-item">
                  <button className="mobile-menu-auth" onClick={() => { onOpenNotes(); setMobileMenuOpen(false) }}>
                    Notes & Highlights
                  </button>
                </div>
              )}

              {onOpenCast && (
                <div className="mobile-menu-item">
                  <button className="mobile-menu-auth" onClick={() => { onOpenCast(); setMobileMenuOpen(false) }}>
                    Cast
                  </button>
                </div>
              )}

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
                <button className="mobile-menu-auth" onClick={() => { onOpenStore(); setMobileMenuOpen(false) }}>
                  Browse books
                </button>
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

        <button className="menu-icon-btn" onClick={onOpenToc} title="Table of contents">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="4" x2="13" y2="4" />
            <line x1="3" y1="8" x2="11" y2="8" />
            <line x1="3" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        <span className="menu-divider" />

        {/* Text buttons */}
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

        <button className="menu-item" onClick={onOpenStore}>Library</button>

        <button className="menu-item" onClick={onOpenSettings}>Settings</button>

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
