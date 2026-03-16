import type { TranslationKey } from '../types'

interface HeaderProps {
  currentTranslation: TranslationKey
  onTranslationChange: (t: TranslationKey) => void
  currentChapter: number
  totalChapters: number
  onChapterChange: (n: number) => void
  darkMode: boolean
  onToggleDarkMode: () => void
  onTogglePanel: () => void
  panelOpen: boolean
}

export function Header({
  currentTranslation,
  onTranslationChange,
  currentChapter,
  totalChapters,
  onChapterChange,
  darkMode,
  onToggleDarkMode,
  onTogglePanel,
  panelOpen,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">Tinct</h1>
        <span className="book-title">The Odyssey</span>
        <span className="separator">·</span>
        <span className="author">Homer</span>
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
            <option key={i + 1} value={i + 1}>Book {toRoman(i + 1)}</option>
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
        <select
          className="translation-select"
          value={currentTranslation}
          onChange={e => onTranslationChange(e.target.value as TranslationKey)}
        >
          <option value="butler">Butler (Prose, 1900)</option>
          <option value="pope">Pope (Verse, 1726)</option>
        </select>

        <button
          className="icon-button"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? '☀' : '☽'}
        </button>

        <button
          className="icon-button panel-toggle"
          onClick={onTogglePanel}
          title={panelOpen ? 'Close panel' : 'Open panel'}
        >
          {panelOpen ? '▷' : '◁'}
        </button>
      </div>
    </header>
  )
}

function toRoman(num: number): string {
  const romans: [number, string][] = [
    [24, 'XXIV'], [23, 'XXIII'], [22, 'XXII'], [21, 'XXI'], [20, 'XX'],
    [19, 'XIX'], [18, 'XVIII'], [17, 'XVII'], [16, 'XVI'], [15, 'XV'],
    [14, 'XIV'], [13, 'XIII'], [12, 'XII'], [11, 'XI'], [10, 'X'],
    [9, 'IX'], [8, 'VIII'], [7, 'VII'], [6, 'VI'], [5, 'V'],
    [4, 'IV'], [3, 'III'], [2, 'II'], [1, 'I'],
  ]
  for (const [value, roman] of romans) {
    if (num === value) return roman
  }
  return String(num)
}
