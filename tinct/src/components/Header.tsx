import type { Book, Language, Style } from '../types'
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
  /** Editions available for the current language */
  availableStyles: { style: Style; label: string }[]
  currentChapter: number
  totalChapters: number
  chapterLabels: string[]
  onChapterChange: (n: number) => void
  splitView: boolean
  onToggleSplitView: () => void
  /** Whether split view is available (needs aligned editions) */
  splitViewAvailable: boolean
  darkMode: boolean
  onToggleDarkMode: () => void
  onTogglePanel: () => void
  panelOpen: boolean
  /** Reading progress 0-100 */
  readingProgress?: number
  // Auth & billing
  user: User | null
  messagesRemaining: number
  hasBalance: boolean
  isAnonymous: boolean
  onSignIn: () => void
  onSignOut: () => void
  onOpenUsage: () => void
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
  onTogglePanel,
  panelOpen,
  readingProgress,
  user,
  messagesRemaining,
  hasBalance,
  isAnonymous,
  onSignIn,
  onSignOut,
  onOpenUsage,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">Tinct</h1>
        {books.length > 1 ? (
          <select
            className="book-select"
            value={currentBookId}
            onChange={e => onBookChange(e.target.value)}
          >
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
            ))}
          </select>
        ) : (
          <>
            <span className="book-title">{bookTitle}</span>
            <span className="separator">&middot;</span>
            <span className="author">{bookAuthor}</span>
          </>
        )}
      </div>

      <div className="header-center">
        <button
          className="chapter-nav"
          disabled={currentChapter <= 1}
          onClick={() => onChapterChange(currentChapter - 1)}
          aria-label="Previous chapter"
        >
          &larr;
        </button>
        <select
          className="chapter-select"
          value={currentChapter}
          onChange={e => onChapterChange(Number(e.target.value))}
        >
          {Array.from({ length: totalChapters }, (_, i) => (
            <option key={i + 1} value={i + 1}>{chapterLabels[i] || `Chapter ${i + 1}`}</option>
          ))}
        </select>
        <button
          className="chapter-nav"
          disabled={currentChapter >= totalChapters}
          onClick={() => onChapterChange(currentChapter + 1)}
          aria-label="Next chapter"
        >
          &rarr;
        </button>
      </div>

      <div className="header-right">
        {/* Language toggle */}
        <div className="lang-toggle">
          <button
            className={`lang-button ${language === 'en' ? 'lang-active' : ''}`}
            onClick={() => onLanguageChange('en')}
          >
            EN
          </button>
          <button
            className={`lang-button ${language === 'da' ? 'lang-active' : ''}`}
            onClick={() => onLanguageChange('da')}
          >
            DA
          </button>
        </div>

        {/* Style dropdown */}
        <select
          className="translation-select"
          value={style}
          onChange={e => onStyleChange(e.target.value as Style)}
        >
          {availableStyles.map(s => (
            <option key={s.style} value={s.style}>{s.label}</option>
          ))}
        </select>

        {/* Split view toggle */}
        {splitViewAvailable && (
          <button
            className={`icon-button ${splitView ? 'icon-button-active' : ''}`}
            onClick={onToggleSplitView}
            title={splitView ? 'Single view' : 'Split view'}
          >
            {splitView ? '⊡' : '⊞'}
          </button>
        )}

        <button
          className="icon-button"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? '☀' : '☽'}
        </button>

        {/* Balance indicator */}
        <BalanceIndicator
          messagesRemaining={messagesRemaining}
          hasBalance={hasBalance}
          isAnonymous={isAnonymous}
          onTopUp={onOpenUsage}
          onSignIn={onSignIn}
        />

        {/* Auth button */}
        {user ? (
          <button
            className="user-avatar"
            onClick={onSignOut}
            title={`Signed in as ${user.email}. Click to sign out.`}
          >
            {(user.email || 'U')[0].toUpperCase()}
          </button>
        ) : (
          <button
            className="auth-button"
            onClick={onSignIn}
          >
            Sign in
          </button>
        )}

        <button
          className="icon-button panel-toggle"
          onClick={onTogglePanel}
          title={panelOpen ? 'Close panel' : 'Open panel'}
        >
          {panelOpen ? '▷' : '◁'}
        </button>
      </div>

      {readingProgress != null && readingProgress > 0 && (
        <div className="reading-progress-bar" title={`${readingProgress}% complete`}>
          <div className="reading-progress-fill" style={{ width: `${readingProgress}%` }} />
        </div>
      )}
    </header>
  )
}
