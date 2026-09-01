import type { ReactNode } from 'react'
import type { Edition, FontFamily, ProgressMetric, ProgressScope } from '../types'
import { LAB_COPY } from './labCopy'
import {
  LAB_FONT_FAMILIES,
  LAB_FONT_SIZES,
  LAB_LIBRARY_URL,
  type LabPrefs,
} from './labPrefs'

type SheetSection = 'reading' | 'layout'

function Seg({
  options,
  active,
  onChange,
  testId,
}: {
  options: { value: string; label: string }[]
  active: string
  onChange: (value: string) => void
  testId?: string
}) {
  return (
    <div className="lab-ss-seg" data-testid={testId}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          className={`lab-ss-seg-item${option.value === active ? ' is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Row({
  label,
  hint,
  control,
}: {
  label: string
  hint?: string
  control: ReactNode
}) {
  return (
    <div className="lab-ss-row">
      <div className="lab-ss-row-text">
        <div className="lab-ss-row-label">{label}</div>
        {hint ? <div className="lab-ss-row-hint">{hint}</div> : null}
      </div>
      <div className="lab-ss-row-control">{control}</div>
    </div>
  )
}

export interface LabSettingsSheetProps {
  open: boolean
  section: SheetSection
  onSection: (section: SheetSection) => void
  onClose: () => void
  prefs: LabPrefs
  onPrefs: (prefs: LabPrefs) => void
  editions: Edition[]
  audioEditions: Edition[]
  onOpenThisBook?: () => void
}

export function LabSettingsSheet({
  open,
  section,
  onSection,
  onClose,
  prefs,
  onPrefs,
  editions,
  audioEditions,
  onOpenThisBook,
}: LabSettingsSheetProps) {
  if (!open) return null
  return (
    <div className="lab-ss-overlay" data-testid="lab-settings-sheet" onClick={onClose}>
      <div className="lab-ss-sheet" onClick={event => event.stopPropagation()}>
        <div className="lab-ss-head">
          <h2 className="lab-ss-title">{LAB_COPY.settings}</h2>
          <button type="button" className="lab-ss-close" onClick={onClose} aria-label="Close settings">×</button>
        </div>
        <nav className="lab-ss-nav" aria-label="Settings">
          <a
            className="lab-ss-nav-item"
            href={LAB_LIBRARY_URL}
            data-testid="lab-settings-library"
          >
            {LAB_COPY.library}
          </a>
          <button
            type="button"
            className={`lab-ss-nav-item${section === 'reading' ? ' is-active' : ''}`}
            data-testid="lab-settings-reading"
            onClick={() => onSection('reading')}
          >
            {LAB_COPY.reading}
          </button>
          <button
            type="button"
            className={`lab-ss-nav-item${section === 'layout' ? ' is-active' : ''}`}
            data-testid="lab-settings-layout"
            onClick={() => onSection('layout')}
          >
            {LAB_COPY.layout}
          </button>
        </nav>
        <div className="lab-ss-body">
          {section === 'reading' ? (
            <div className="lab-ss-reading">
              <Row
                label="Text & audio edition"
                hint="The edition you read and hear. Narration follows this edition."
                control={(
                  <select
                    className="lab-ss-select"
                    data-testid="lab-primary-edition"
                    value={prefs.primaryEdition}
                    onChange={event => onPrefs({ ...prefs, primaryEdition: event.target.value })}
                  >
                    {editions.map(edition => (
                      <option key={edition.key} value={edition.key}>{edition.label}</option>
                    ))}
                  </select>
                )}
              />
              <Row
                label="Compare edition"
                hint="The edition Compare opens on mobile and shows beside the page on desktop."
                control={(
                  <select
                    className="lab-ss-select"
                    data-testid="lab-compare-edition"
                    value={prefs.compareEdition}
                    onChange={event => onPrefs({ ...prefs, compareEdition: event.target.value })}
                  >
                    {editions.map(edition => (
                      <option key={edition.key} value={edition.key}>{edition.label}</option>
                    ))}
                  </select>
                )}
              />
              <Row
                label="Compare"
                hint="Add Compare to the mobile reader and split the desktop page."
                control={(
                  <button
                    type="button"
                    className={`lab-ss-toggle${prefs.compareOpen ? ' is-on' : ''}`}
                    data-testid="lab-compare"
                    aria-pressed={prefs.compareOpen}
                    onClick={() => onPrefs({ ...prefs, compareOpen: !prefs.compareOpen })}
                  >
                    <span className="lab-ss-toggle-knob" />
                  </button>
                )}
              />
              {audioEditions.length > 0 && prefs.audioEdition !== prefs.primaryEdition && (
                <Row
                  label="Audiobook fallback"
                  hint="Used only when the text edition has no narration."
                  control={(
                    <select
                      className="lab-ss-select"
                      data-testid="lab-audio-edition"
                      value={prefs.audioEdition}
                      onChange={event => onPrefs({ ...prefs, audioEdition: event.target.value })}
                    >
                      {audioEditions.map(edition => (
                        <option key={edition.key} value={edition.key}>{edition.label}</option>
                      ))}
                    </select>
                  )}
                />
              )}
              {onOpenThisBook && (
                <button
                  type="button"
                  className="lab-ss-link"
                  data-testid="lab-in-the-book"
                  onClick={onOpenThisBook}
                >
                  {LAB_COPY.inTheBook}
                </button>
              )}
            </div>
          ) : (
            <div className="lab-ss-layout">
              <Row
                label="Theme"
                hint="The colour of paper + ink."
                control={(
                  <Seg
                    testId="lab-theme"
                    options={[{ value: 'paper', label: 'Paper' }, { value: 'night', label: 'Night' }]}
                    active={prefs.darkMode ? 'night' : 'paper'}
                    onChange={value => onPrefs({ ...prefs, darkMode: value === 'night' })}
                  />
                )}
              />
              <Row
                label="Font"
                hint="Serif for the book."
                control={(
                  <Seg
                    testId="lab-font"
                    options={LAB_FONT_FAMILIES.map(family => ({
                      value: family,
                      label: family === 'sourceserif' ? 'Source' : family[0].toUpperCase() + family.slice(1),
                    }))}
                    active={prefs.fontFamily}
                    onChange={value => onPrefs({ ...prefs, fontFamily: value as FontFamily })}
                  />
                )}
              />
              <Row
                label="Size"
                hint="From compact to extra large."
                control={(
                  <div className="lab-ss-sizes" data-testid="lab-font-size">
                    {LAB_FONT_SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        className={`lab-ss-size${Math.abs(prefs.fontSize - size) < 0.01 ? ' is-active' : ''}`}
                        aria-label={`Font size ${size}`}
                        onClick={() => onPrefs({ ...prefs, fontSize: size })}
                      >
                        A
                      </button>
                    ))}
                  </div>
                )}
              />
              <div className="lab-ss-group">
                <div className="lab-ss-row-label">Progress</div>
                <div className="lab-ss-row-hint">What the bottom strip shows.</div>
                <div className="lab-ss-group-row">
                  <span className="lab-ss-sub">Show</span>
                  <Seg
                    testId="lab-progress-metric"
                    options={[
                      { value: 'percent', label: '%' },
                      { value: 'time', label: 'Time' },
                      { value: 'page', label: 'Page' },
                      { value: 'location', label: 'Loc' },
                    ]}
                    active={prefs.progressDisplay.metric}
                    onChange={value => onPrefs({
                      ...prefs,
                      progressDisplay: { ...prefs.progressDisplay, metric: value as ProgressMetric },
                    })}
                  />
                </div>
                <div className="lab-ss-group-row">
                  <span className="lab-ss-sub">Of</span>
                  <Seg
                    testId="lab-progress-scope"
                    options={[
                      { value: 'book', label: 'Book' },
                      { value: 'section', label: 'Section' },
                      { value: 'chapter', label: 'Chapter' },
                    ]}
                    active={prefs.progressDisplay.scope}
                    onChange={value => onPrefs({
                      ...prefs,
                      progressDisplay: { ...prefs.progressDisplay, scope: value as ProgressScope },
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
