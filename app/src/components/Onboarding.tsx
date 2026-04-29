import { useState, useEffect } from 'react'
import type { Language, Style, Edition, EditionKey, ProgressDisplay, ProgressMetric, ProgressScope } from '../types'

interface OnboardingProps {
  onComplete: (objective: string) => void
  /** When true, shows as settings modal with close button and pre-populated values */
  isSettings?: boolean
  onClose?: () => void
  // All editions for the current book (settings mode)
  allEditions?: Edition[]
  // Current selections
  primaryEditionKey?: EditionKey
  onPrimaryEditionChange?: (key: EditionKey) => void
  // Legacy props (still used for non-settings onboarding flow)
  language?: Language
  onLanguageChange?: (lang: Language) => void
  style?: Style
  onStyleChange?: (style: Style) => void
  availableStyles?: { style: Style; label: string }[]
  initialObjective?: string
  // Split pane
  splitEditionKey?: EditionKey
  onSplitEditionChange?: (key: EditionKey) => void
  alignedEditions?: Edition[]
  splitView?: boolean
  onToggleSplitView?: () => void
  // Audiobook
  audioEditions?: Edition[]
  audioEditionKey?: EditionKey
  onAudioEditionChange?: (key: EditionKey) => void
  // Progress display
  progressDisplay?: ProgressDisplay
  onProgressDisplayChange?: (pd: ProgressDisplay) => void
  hasSections?: boolean
}

const LANG_LABELS: Record<string, string> = { en: 'English', da: 'Danish' }

function editionDisplayLabel(ed: Edition): string {
  return `${ed.label} — ${LANG_LABELS[ed.language] || ed.language}`
}

export function Onboarding({
  onComplete,
  isSettings,
  onClose,
  allEditions,
  primaryEditionKey,
  onPrimaryEditionChange,
  language,
  onLanguageChange,
  style,
  onStyleChange,
  availableStyles,
  initialObjective,
  splitEditionKey,
  onSplitEditionChange,
  alignedEditions,
  splitView,
  onToggleSplitView,
  audioEditions,
  audioEditionKey,
  onAudioEditionChange,
  progressDisplay,
  onProgressDisplayChange,
  hasSections,
}: OnboardingProps) {
  const [objective, setObjective] = useState(initialObjective || '')
  // Sync if initialObjective arrives later (e.g., after Supabase loads)
  useEffect(() => {
    if (initialObjective && !objective) setObjective(initialObjective)
  }, [initialObjective])

  const handleStart = () => {
    onComplete(objective.trim())
    if (isSettings && onClose) onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleStart()
    }
  }

  // Group editions by language for the dropdown
  const groupedEditions = allEditions
    ? Object.entries(
        allEditions.reduce((acc, ed) => {
          const lang = LANG_LABELS[ed.language] || ed.language
          if (!acc[lang]) acc[lang] = []
          acc[lang].push(ed)
          return acc
        }, {} as Record<string, Edition[]>)
      )
    : []

  // Aligned editions for side-by-side (exclude current primary)
  const splitOptions = alignedEditions?.filter(ed => ed.key !== primaryEditionKey) || []

  return (
    <div className="onboarding" onClick={isSettings ? onClose : undefined}>
      <div className="onboarding-card" onClick={e => e.stopPropagation()}>
        {isSettings && onClose && (
          <button className="onboarding-close" onClick={onClose}>&times;</button>
        )}

        <h1 className="onboarding-heading">
          {isSettings ? 'Settings' : 'Welcome to Tinct'}
        </h1>

        {!isSettings && (
          <div className="onboarding-features">
            <p className="onboarding-intro">
              A reading companion for deep engagement with literary classics.
            </p>

            <ul className="onboarding-list">
              <li>
                <strong>Multiple versions</strong> — read in the original, modern English, or Danish. Switch anytime.
              </li>
              <li>
                <strong>Side-by-side view</strong> — compare two versions paragraph by paragraph, like No Fear Shakespeare.
              </li>
              <li>
                <strong>AI companion</strong> — highlight any passage to get context, explanation, and connections. Or just ask a question.
              </li>
              <li>
                <strong>Highlights & notes</strong> — mark passages in five colors, take notes, and build a reading journal as you go.
              </li>
            </ul>
          </div>
        )}

        {/* Settings mode: unified edition dropdowns */}
        {isSettings && allEditions && onPrimaryEditionChange && (
          <div className="onboarding-settings-section">
            <div className="onboarding-setting">
              <label className="onboarding-label">Primary edition</label>
              <select
                className="onboarding-select"
                value={primaryEditionKey}
                onChange={e => onPrimaryEditionChange(e.target.value)}
              >
                {groupedEditions.map(([lang, editions]) => (
                  <optgroup key={lang} label={lang}>
                    {editions.map(ed => (
                      <option key={ed.key} value={ed.key}>{ed.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Side-by-side edition */}
            {splitOptions.length > 0 && onSplitEditionChange && onToggleSplitView && (
              <div className="onboarding-setting">
                <label className="onboarding-label">Side-by-side edition</label>
                <div className="onboarding-split-row">
                  <select
                    className="onboarding-select"
                    value={splitEditionKey}
                    onChange={e => onSplitEditionChange(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {splitOptions.map(ed => (
                      <option key={ed.key} value={ed.key}>{editionDisplayLabel(ed)}</option>
                    ))}
                  </select>
                  <button
                    className={`onboarding-toggle-btn onboarding-toggle-match ${splitView ? 'onboarding-toggle-active' : ''}`}
                    onClick={onToggleSplitView}
                  >
                    {splitView ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            )}

            {/* Audiobook edition */}
            {audioEditions && audioEditions.length > 0 && onAudioEditionChange && (
              <div className="onboarding-setting">
                <label className="onboarding-label">Audiobook edition</label>
                <select
                  className="onboarding-select"
                  value={audioEditionKey}
                  onChange={e => onAudioEditionChange(e.target.value)}
                >
                  {audioEditions.map(ed => (
                    <option key={ed.key} value={ed.key}>{editionDisplayLabel(ed)}</option>
                  ))}
                </select>
                <p className="onboarding-sublabel" style={{ marginTop: 6, marginBottom: 0 }}>
                  Narrated by AI — expect occasional pronunciation quirks.
                </p>
              </div>
            )}

            {/* Progress display */}
            {progressDisplay && onProgressDisplayChange && (
              <div className="onboarding-setting">
                <label className="onboarding-label">Reading progress</label>
                <div className="onboarding-progress-row">
                  <select
                    className="onboarding-select"
                    value={progressDisplay.metric}
                    onChange={e => onProgressDisplayChange({ ...progressDisplay, metric: e.target.value as ProgressMetric })}
                    style={{ flex: 1 }}
                  >
                    <option value="percent">Percentage</option>
                    <option value="time">Time remaining</option>
                    <option value="page">Page number</option>
                    <option value="location">Location</option>
                  </select>
                  <select
                    className="onboarding-select"
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
          </div>
        )}

        {/* Non-settings onboarding: edition picker */}
        {!isSettings && onLanguageChange && onStyleChange && availableStyles && (
          <div className="onboarding-settings-section">
            <div className="onboarding-setting">
              <label className="onboarding-label">Which edition would you like to read?</label>
              <p className="onboarding-sublabel">
                Pick your main reading language and style. You can switch anytime, or compare editions side-by-side in Settings.
              </p>
              <div className="onboarding-toggle-row">
                <button
                  className={`onboarding-toggle-btn ${language === 'en' ? 'onboarding-toggle-active' : ''}`}
                  onClick={() => onLanguageChange('en')}
                >English</button>
                <button
                  className={`onboarding-toggle-btn ${language === 'da' ? 'onboarding-toggle-active' : ''}`}
                  onClick={() => onLanguageChange('da')}
                >Danish</button>
              </div>
            </div>

            <div className="onboarding-setting">
              <select
                className="onboarding-select"
                value={style}
                onChange={e => onStyleChange(e.target.value as Style)}
              >
                {availableStyles.map(s => (
                  <option key={s.style} value={s.style}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="onboarding-objective">
          <label className="onboarding-label" htmlFor="reading-objective">
            What's your reading angle?
          </label>
          <p className="onboarding-sublabel">
            Optional — helps the AI connect ideas to what interests you most.
          </p>
          <textarea
            id="reading-objective"
            className="onboarding-input"
            value={objective}
            onChange={e => setObjective(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "Leadership and decision-making", "Mythology and religion", "How ancient themes echo in modern life"'
            rows={3}
          />
        </div>

        <button className="onboarding-start" onClick={handleStart}>
          {isSettings ? 'Save' : 'Start reading'}
        </button>
      </div>
    </div>
  )
}
