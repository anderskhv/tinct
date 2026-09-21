import { useEffect, useState, type ReactNode } from 'react'
import { useReaderWindow } from './useReaderWindow'
import { matchingAudioEditions } from '../utils/audioEditionSelection'
import type { Edition } from '../types'
import type { NarrationPilotInfo } from './labNarration'
import { useAuth } from '../hooks/useAuth'
import { useBalance } from '../hooks/useBalance'
import {
  labLineHeight, labMarginScale, labParagraphGap, restoreLabAppearance,
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
  audioEditions?: Edition[]
  /** Present once a compare edition is chosen: the switch between the main and compare page. */
  compare?: { active: boolean; onToggle: () => void } | null
  /**
   * Fish narration pilot row, present only for a reader who opted in with
   * `?narration=fish` (docs/fish-audio-pilot-2026-09-18.md).
   */
  narrationPilot?: { info: NarrationPilotInfo | null; voice: string | null } | null
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

/** The editable value and slider share the same bounded numeric preference. */
function LayoutSlider({ label, icon, value, min, max, step, onChange, testId }: {
  label: string; icon: ReactNode; value: number; min: number; max: number; step: number;
  onChange: (value: number) => void; testId: string
}) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])
  const commit = () => {
    const parsed = Number(draft.trim().replace(',', '.'))
    if (!draft.trim() || !Number.isFinite(parsed)) { setDraft(String(value)); return }
    const next = Math.round(Math.max(min, Math.min(max, parsed)) / step) * step
    const rounded = Number(next.toFixed(2))
    setDraft(String(rounded)); onChange(rounded)
  }
  return <div className="lab-v2-layout-slider">
    <span aria-hidden="true">{icon}</span>
    <input type="range" className="lab-v2-slider" aria-label={label} data-testid={testId}
      min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} />
    <input className="lab-v2-layout-value" inputMode="decimal" aria-label={label + ' value'}
      value={draft} onChange={event => setDraft(event.target.value)} onBlur={commit}
      onKeyDown={event => { if (event.key === 'Enter') { commit(); event.currentTarget.blur() } }} />
  </div>
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
export function LabV2Sheet({ layer, onLayer, onClose, prefs, onPrefs, editions, audioEditions, compare = matchingAudioEditions(prefs.primaryEdition, editions), narrationPilot = null, returnTo }: LabV2SheetProps) {
  const windowRef = useReaderWindow<HTMLElement>('settings', !!layer)
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
  const editionOptions = editions.map(edition => ({ value: edition.key, label: edition.label.replace(/^Modern English$/i, 'Tinct Modern English') }))

  const head = layer === 'reading' || layer === 'account'
    ? (
      <div className="lab-v2-head is-titled" data-reader-window-handle>
        <h2 className="lab-v2-title">{LAB_V2_SHEET_TITLES[layer]}</h2>
        <button type="button" className="lab-v2-dismiss" data-testid="lab-v2-sheet-close" aria-label="Close" onClick={onClose}>×</button>
      </div>
    )
    : (
      <div className="lab-v2-head is-centred" data-reader-window-handle>
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
        ref={windowRef}
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
                  onChange={value => onPrefs({ ...prefs, primaryEdition: value, compareOpen: prefs.compareOpen && prefs.compareEdition !== value })}
                />
                <SelectRow
                  label="Compare edition"
                  testId="lab-v2-compare-edition"
                  value={prefs.compareOpen ? prefs.compareEdition : ''}
                  options={[{ value: '', label: 'None' }, ...editionOptions.filter(option => option.value !== prefs.primaryEdition)]}
                  onChange={value => onPrefs({ ...prefs, compareEdition: value || prefs.compareEdition, compareOpen: value !== '' })}
                />
                {compare && prefs.compareOpen && (
                  <button
                    type="button"
                    className="lab-v2-row is-toggle"
                    role="switch"
                    aria-checked={compare.active}
                    data-testid="lab-v2-show-compare"
                    onClick={compare.onToggle}
                  >
                    <span className="lab-v2-row-label">Show compare version</span>
                    <span className="lab-v2-switch" aria-hidden="true"><span className="lab-v2-switch-knob" /></span>
                  </button>
                )}
                <SelectRow
                  label="Audiobook"
                  testId="lab-v2-audio-edition"
                  value={prefs.audioFollowsPrimary === false ? prefs.audioEdition : ''}
                  options={[{ value: '', label: 'Follow primary edition' }, ...audioEditions.map(edition => ({ value: edition.key, label: edition.label }))]}
                  onChange={value => onPrefs({ ...prefs, audioEdition: value || prefs.primaryEdition, audioFollowsPrimary: value === '' })}
                />
                {narrationPilot && (
                  <SelectRow
                    label="Narration pilot"
                    testId="lab-v2-narration-voice"
                    value={narrationPilot.info?.enabled && narrationPilot.voice ? narrationPilot.voice : ''}
                    options={[
                      { value: '', label: narrationPilot.info?.enabled ? 'Off' : 'Not set up on this server' },
                      ...(narrationPilot.info?.voices ?? []).map(voice => ({ value: voice.key, label: voice.label })),
                    ]}
                    onChange={value => onPrefs(value
                      ? { ...prefs, narrationProvider: 'fish', narrationVoice: value }
                      : { ...prefs, narrationProvider: null })}
                  />
                )}
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
                <LayoutSlider label="Line spacing" testId="lab-v2-line-spacing" icon={<LineIcon />}
                  value={labLineHeight(prefs.lineSpacing)} min={1.25} max={1.9} step={.01}
                  onChange={value => onPrefs({ ...prefs, lineSpacing: value })} />
              </Group>
              <Group label="Paragraph spacing">
                <LayoutSlider label="Paragraph spacing" testId="lab-v2-paragraph-spacing" icon={<ParagraphIcon />}
                  value={labParagraphGap(prefs.paragraphSpacing)} min={.08} max={.8} step={.01}
                  onChange={value => onPrefs({ ...prefs, paragraphSpacing: value })} />
              </Group>
              <Group label="Margins">
                <LayoutSlider label="Margins" testId="lab-v2-margins" icon={<MarginIcon />}
                  value={labMarginScale(prefs.margins)} min={.7} max={1.45} step={.01}
                  onChange={value => onPrefs({ ...prefs, margins: value })} />
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
          {(layer === 'reading' || layer === 'advanced') && <button type="button" className="lab-v2-restore" onClick={() => onPrefs(restoreLabAppearance(prefs))}>Restore defaults</button>}
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
