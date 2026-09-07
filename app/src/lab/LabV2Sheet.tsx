import { useEffect, useState, type ReactNode } from 'react'
import type { Edition } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useBalance } from '../hooks/useBalance'
import {
  LAB_MAX_FONT_SIZE,
  LAB_MIN_FONT_SIZE,
  labAccountUrl,
  labFontFamilyCss,
  labReadingFont,
  labSignInUrl,
  type LabFontFamily,
  type LabPrefs,
  type LabTextAlignment,
} from './labPrefs'
import {
  LAB_FONT_PICKER_GROUPS,
  LAB_LINE_SPACINGS,
  LAB_MARGIN_STEPS,
  LAB_PARAGRAPH_SPACINGS,
  LAB_V2_SHEET_TITLES,
  LAB_V2_THEMES,
  labAlignmentValue,
  labFontValue,
  labLineSpacingValue,
  labMarginsValue,
  labParagraphSpacingValue,
  labStepAt,
  labStepIndex,
  type LabV2SheetLayer,
} from './labV2Sheet'

export interface LabV2SheetProps {
  layer: LabV2SheetLayer | null
  onLayer: (layer: LabV2SheetLayer) => void
  onClose: () => void
  prefs: LabPrefs
  onPrefs: (prefs: LabPrefs) => void
  editions: Edition[]
  /** Current reader path; the sign-in page returns here. */
  returnTo?: string
}

/** A row's value and chevron, right-aligned in the mono the canvas uses. */
function Value({ children }: { children: ReactNode }) {
  return (
    <span className="lab-v2-value">
      {children}
      <span className="lab-v2-value-chevron" aria-hidden="true">›</span>
    </span>
  )
}

/**
 * A row whose value is a choice. The value and its chevron are what the eye
 * reads; the control over them is a real select, so the keyboard, the screen
 * reader and the platform picker all work without a fifth layer being
 * invented to hold a list of two.
 */
function SelectRow({
  label, value, options, onChange, testId,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  testId?: string
}) {
  const selected = options.find(option => option.value === value)
  return (
    <div className="lab-v2-row is-select">
      <span className="lab-v2-row-label">{label}</span>
      <Value>{selected?.label ?? value}</Value>
      <select
        className="lab-v2-row-select"
        aria-label={label}
        data-testid={testId}
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}

/** A row whose value is a step on a short scale. */
function StepRow({
  label, icon, steps, value, onChange, display, testId,
}: {
  label: string
  icon: ReactNode
  steps: readonly string[]
  value: string
  onChange: (value: string) => void
  display: string
  testId?: string
}) {
  const index = labStepIndex(steps as string[], value)
  return (
    <div className="lab-v2-row is-step">
      <span className="lab-v2-row-icon" aria-hidden="true">{icon}</span>
      <input
        className="lab-v2-slider"
        type="range"
        aria-label={label}
        data-testid={testId}
        min={0}
        max={steps.length - 1}
        step={1}
        value={index}
        onChange={event => onChange(labStepAt(steps as string[], Number(event.target.value)))}
      />
      <span className="lab-v2-step-value">{display}</span>
    </div>
  )
}

function Group({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <>
      {label && <p className="lab-v2-group-label">{label}</p>}
      <div className="lab-v2-group">{children}</div>
    </>
  )
}

const FontIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19 9.5 5l5.5 14M6 14.5h7M17 19V9M17 9c2 0 3 .9 3 2.4V19" />
  </svg>
)
const AlignIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
)
const LineIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16M20 4.5 22 7l-2 2.5M20 14.5 22 17l-2 2.5" />
  </svg>
)
const ParagraphIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 6h16M4 10h16M4 16h16M4 20h10" />
  </svg>
)
const MarginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 4v16M17 4v16M10 9h4M10 15h4" />
  </svg>
)
const TuneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M4 7h7M15 7h5M4 17h5M13 17h7" />
    <circle cx="13" cy="7" r="2" />
    <circle cx="11" cy="17" r="2" />
  </svg>
)

/**
 * The V2 bottom sheet.
 *
 * One box, four layers, one height. Every layer draws on the same surface as
 * the menu — a fill of the paper colour over a blur the sheet carries itself,
 * over a page that is dimmed and never blurred, so the words of the page read
 * through it while a setting is being changed.
 */
export function LabV2Sheet({ layer, onLayer, onClose, prefs, onPrefs, editions, returnTo }: LabV2SheetProps) {
  const auth = useAuth()
  const balance = useBalance(auth.session, auth.profile, auth.user, {
    authLoading: auth.isLoading,
    likelyAuthenticated: auth.likelyAuthenticated,
  })
  const [resetStatus, setResetStatus] = useState('')

  useEffect(() => {
    if (!layer) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [layer, onClose])

  if (!layer) return null

  const font = labReadingFont(prefs.fontFamily, true)
  const editionOptions = editions.map(edition => ({ value: edition.key, label: edition.label }))

  const head = layer === 'reading' || layer === 'account'
    ? (
      <div className="lab-v2-head is-titled">
        <h2 className="lab-v2-title">{LAB_V2_SHEET_TITLES[layer]}</h2>
        <button type="button" className="lab-v2-dismiss" data-testid="lab-v2-sheet-close" aria-label="Close" onClick={onClose}>×</button>
      </div>
    )
    : (
      <div className="lab-v2-head is-centred">
        {layer === 'font' ? (
          <button type="button" className="lab-v2-back" data-testid="lab-v2-sheet-back" onClick={() => onLayer('advanced')}>‹ Advanced</button>
        ) : (
          <button type="button" className="lab-v2-dismiss" data-testid="lab-v2-sheet-close" aria-label="Close" onClick={onClose}>×</button>
        )}
        <h2 className="lab-v2-title">{LAB_V2_SHEET_TITLES[layer]}</h2>
        <button type="button" className="lab-v2-confirm" data-testid="lab-v2-sheet-confirm" aria-label="Done" onClick={onClose}>✓</button>
      </div>
    )

  return (
    <div className="lab-v2-sheet-layer" data-testid="lab-v2-sheet-layer">
      <button
        type="button"
        className="lab-super-scrim"
        data-testid="lab-v2-sheet-scrim"
        aria-label="Close"
        onClick={onClose}
      />
      <section
        className="lab-v2-sheet"
        data-testid="lab-v2-sheet"
        data-layer={layer}
        aria-label={LAB_V2_SHEET_TITLES[layer]}
      >
        {head}
        <div className="lab-v2-sheet-body">
          {layer === 'reading' && (
            <>
              <div className="lab-v2-themes" data-testid="lab-v2-themes">
                {LAB_V2_THEMES.map(({ theme, label }) => (
                  <button
                    key={theme}
                    type="button"
                    className={`lab-v2-theme is-${theme}${prefs.theme === theme ? ' is-active' : ''}`}
                    data-testid={`lab-v2-theme-${theme}`}
                    aria-pressed={prefs.theme === theme}
                    onClick={() => onPrefs({ ...prefs, theme, darkMode: theme === 'dark' })}
                  >
                    <span className="lab-v2-theme-face">Aa</span>
                    <span className="lab-v2-theme-label">{label}</span>
                  </button>
                ))}
              </div>
              <div className="lab-v2-size">
                <span className="lab-v2-size-small" aria-hidden="true">A</span>
                <input
                  className="lab-v2-slider"
                  type="range"
                  aria-label="Text size"
                  data-testid="lab-v2-size"
                  min={LAB_MIN_FONT_SIZE}
                  max={LAB_MAX_FONT_SIZE}
                  step={0.1}
                  value={prefs.fontSize}
                  onChange={event => onPrefs({ ...prefs, fontSize: Number(event.target.value) })}
                />
                <span className="lab-v2-size-large" aria-hidden="true">A</span>
              </div>
              <div className="lab-v2-rows">
                <SelectRow
                  label="Main version"
                  testId="lab-v2-main-edition"
                  value={prefs.primaryEdition}
                  options={editionOptions}
                  onChange={value => onPrefs({ ...prefs, primaryEdition: value })}
                />
                <SelectRow
                  label="Compare edition"
                  testId="lab-v2-compare-edition"
                  value={prefs.compareEdition}
                  options={editionOptions}
                  onChange={value => onPrefs({ ...prefs, compareEdition: value })}
                />
                <div className="lab-v2-row">
                  <span className="lab-v2-row-label">Show Compare</span>
                  <button
                    type="button"
                    className={`lab-v2-toggle${prefs.compareOpen ? ' is-on' : ''}`}
                    data-testid="lab-v2-show-compare"
                    aria-pressed={prefs.compareOpen}
                    aria-label="Show Compare"
                    onClick={() => onPrefs({ ...prefs, compareOpen: !prefs.compareOpen })}
                  >
                    <span className="lab-v2-toggle-knob" />
                  </button>
                </div>
              </div>
              <div className="lab-v2-foot">
                <button
                  type="button"
                  className="lab-v2-pill"
                  data-testid="lab-v2-advanced"
                  onClick={() => onLayer('advanced')}
                >
                  <TuneIcon />
                  Advanced settings
                </button>
              </div>
            </>
          )}

          {layer === 'advanced' && (
            <>
              <Group label="Text">
                <button
                  type="button"
                  className="lab-v2-row is-link"
                  data-testid="lab-v2-font-row"
                  onClick={() => onLayer('font')}
                >
                  <span className="lab-v2-row-icon" aria-hidden="true"><FontIcon /></span>
                  <span className="lab-v2-row-label">Font</span>
                  <Value>{labFontValue(font)}</Value>
                </button>
                <div className="lab-v2-row is-select">
                  <span className="lab-v2-row-icon" aria-hidden="true"><AlignIcon /></span>
                  <span className="lab-v2-row-label">Alignment</span>
                  <Value>{labAlignmentValue(prefs.alignment)}</Value>
                  <select
                    className="lab-v2-row-select"
                    aria-label="Alignment"
                    data-testid="lab-v2-alignment"
                    value={prefs.alignment}
                    onChange={event => onPrefs({ ...prefs, alignment: event.target.value as LabTextAlignment })}
                  >
                    <option value="justify">Justified</option>
                    <option value="left">Left</option>
                  </select>
                </div>
              </Group>
              <Group label="Line spacing">
                <StepRow
                  label="Line spacing"
                  testId="lab-v2-line-spacing"
                  icon={<LineIcon />}
                  steps={LAB_LINE_SPACINGS}
                  value={prefs.lineSpacing}
                  display={labLineSpacingValue(prefs.lineSpacing)}
                  onChange={value => onPrefs({ ...prefs, lineSpacing: value as LabPrefs['lineSpacing'] })}
                />
              </Group>
              <Group label="Paragraph spacing">
                <StepRow
                  label="Paragraph spacing"
                  testId="lab-v2-paragraph-spacing"
                  icon={<ParagraphIcon />}
                  steps={LAB_PARAGRAPH_SPACINGS}
                  value={prefs.paragraphSpacing}
                  display={labParagraphSpacingValue(prefs.paragraphSpacing)}
                  onChange={value => onPrefs({ ...prefs, paragraphSpacing: value as LabPrefs['paragraphSpacing'] })}
                />
              </Group>
              <Group label="Margins">
                <StepRow
                  label="Margins"
                  testId="lab-v2-margins"
                  icon={<MarginIcon />}
                  steps={LAB_MARGIN_STEPS}
                  value={prefs.margins}
                  display={labMarginsValue(prefs.margins)}
                  onChange={value => onPrefs({ ...prefs, margins: value as LabPrefs['margins'] })}
                />
              </Group>
            </>
          )}

          {layer === 'font' && (
            <>
              {LAB_FONT_PICKER_GROUPS.map(group => (
                <Group key={group.label ?? 'fonts'} label={group.label}>
                  {group.fonts.map(family => (
                    <button
                      key={family}
                      type="button"
                      className="lab-v2-row is-font"
                      data-testid={`lab-v2-font-${family}`}
                      aria-pressed={family === font}
                      onClick={() => onPrefs({ ...prefs, fontFamily: family as LabFontFamily })}
                    >
                      <span className="lab-v2-font-name" style={{ fontFamily: labFontFamilyCss(family) }}>
                        {labFontValue(family)}
                      </span>
                      <span className={`lab-v2-check${family === font ? ' is-on' : ''}`} aria-hidden="true">✓</span>
                    </button>
                  ))}
                </Group>
              ))}
              <p className="lab-v2-note">Each name is set in its own face. The page behind changes as you pick.</p>
            </>
          )}

          {layer === 'account' && (
            <>
              <div className="lab-v2-account-card" data-testid="lab-v2-account-card">
                <strong>{auth.user?.email || 'Reader account'}</strong>
                <span>{auth.user ? (balance.isSubscribed ? 'Premium account' : 'Free account') : 'Reading locally'}</span>
              </div>
              <div className="lab-v2-rows">
                <div className="lab-v2-row">
                  <span className="lab-v2-row-label">AI credits remaining</span>
                  <span className="lab-v2-value is-plain">
                    {auth.user ? balance.messagesRemaining.toLocaleString('en-US') : '—'}
                  </span>
                </div>
              </div>
              <div className="lab-v2-year">
                <p className="lab-v2-group-label">This year</p>
                <div className="lab-v2-year-stats">
                  <span><strong>{labReadingHours()}</strong> hours</span>
                  <span><strong>{labPagesTurned()}</strong> pages</span>
                  <span><strong>{auth.user ? '1' : '—'}</strong> books</span>
                </div>
              </div>
              <div className="lab-v2-rows">
                <a
                  className="lab-v2-row is-link"
                  data-testid={auth.user ? 'lab-v2-account-manage' : 'lab-v2-account-sign-in'}
                  href={auth.user ? labAccountUrl(returnTo) : labSignInUrl(returnTo)}
                >
                  <span className="lab-v2-row-label">{auth.user ? 'Manage account' : 'Sign in or create a free account'}</span>
                  <Value>{''}</Value>
                </a>
                {auth.user?.email && (
                  // The row the canvas notes as off the gutter. It sits on the
                  // same left edge as every row above it now.
                  <button
                    type="button"
                    className="lab-v2-row is-link"
                    data-testid="lab-v2-reset-password"
                    onClick={async () => {
                      const result = await auth.resetPassword(auth.user!.email!)
                      setResetStatus(result.error || 'Password reset email sent.')
                    }}
                  >
                    <span className="lab-v2-row-label">Reset password</span>
                  </button>
                )}
              </div>
              {resetStatus && <p className="lab-v2-note" role="status">{resetStatus}</p>}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function labReadingHours(): string {
  const seconds = readCounter('tinct-lab-reading-seconds')
  return seconds < 3600 ? '<1' : String(Math.round(seconds / 3600))
}

function labPagesTurned(): string {
  return readCounter('tinct-lab-page-turns').toLocaleString('en-US')
}

function readCounter(key: string): number {
  try {
    return Math.max(0, Number(localStorage.getItem(key) || 0))
  } catch {
    return 0
  }
}
