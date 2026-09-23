import { useEffect, useState, type ReactNode } from 'react'
import { editionDifficulty, readerEditionLabel } from './editionDifficulty'
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
  LAB_V2_SHEET_TITLES,
  LAB_V2_THEMES,
  labAlignmentValue,
  labFontValue,
  type LabV2SheetLayer,
} from './labV2Sheet'

export interface LabV2SheetProps {
  bookId?: string
  phoneShakespeare?: boolean
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
export function LabV2Sheet({ narrationPilot, bookId = 'bible', phoneShakespeare = false, layer, onLayer, onClose, prefs, onPrefs, editions, audioEditions = matchingAudioEditions(prefs.primaryEdition, editions), compare = null, returnTo }: LabV2SheetProps) {
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
  const editionName = (key: string) => {
    const edition = editions.find(item => item.key === key)
    return edition ? readerEditionLabel(edition) : key
  }
  const picker = layer === 'mainEdition' || layer === 'audioEdition' || layer === 'compareEdition'
  const choices = layer === 'audioEdition' ? audioEditions
    : layer === 'compareEdition' ? editions.filter(edition => edition.key !== prefs.primaryEdition) : editions
  const selected = layer === 'mainEdition' ? prefs.primaryEdition
    : layer === 'audioEdition' ? prefs.audioFollowsPrimary === false ? prefs.audioEdition : ''
    : prefs.compareOpen ? prefs.compareEdition : ''
  const choose = (key: string) => {
    if (layer === 'mainEdition') onPrefs({ ...prefs, primaryEdition: key, compareOpen: prefs.compareOpen && prefs.compareEdition !== key })
    else if (layer === 'audioEdition') onPrefs({ ...prefs, audioEdition: key || prefs.primaryEdition, audioFollowsPrimary: key === '' })
    else onPrefs({ ...prefs, compareEdition: key || prefs.compareEdition, compareOpen: key !== '' })
    onLayer('editions')
  }
  const editionRow = (label: string, target: LabV2SheetLayer, value: string, testId: string) => (
    <button type="button" className="lab-v2-row lab-v2-edition-link" data-testid={testId} onClick={() => onLayer(target)}>
      <span className="lab-v2-edition-text"><span className="lab-v2-row-label">{label}</span><span className="lab-v2-edition-current">{value}</span></span>
      <span aria-hidden="true">›</span>
    </button>
  )

  const head = layer === 'reading' || layer === 'account' || layer === 'editions'
    ? (
      <div className="lab-v2-head is-titled" data-reader-window-handle>
        <h2 className="lab-v2-title">{LAB_V2_SHEET_TITLES[layer]}</h2>
        <button type="button" className="lab-v2-dismiss" data-testid="lab-v2-sheet-close" aria-label="Close" onClick={onClose}>×</button>
      </div>
    )
    : (
      <div className="lab-v2-head is-centred" data-reader-window-handle>
        {picker ? (
          <button type="button" className="lab-v2-back" data-testid="lab-v2-sheet-back" onClick={() => onLayer('editions')}>‹ Editions</button>
        ) : layer === 'font' ? (
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
                    label="Voice"
                    testId="lab-v2-narration-voice"
                    value={narrationPilot?.info?.provider === 'grok' ? prefs.audiobookVoice || prefs.voicePersona : prefs.voicePersona}
                    options={narrationPilot?.info?.provider === 'grok' ? [
                      { value: 'female', label: 'Ara · Female' },
                      { value: 'male', label: 'Helios · Male' },
                      { value: 'orion', label: 'Orion · Male' },
                      { value: 'eve', label: 'Eve · Female' },
                    ] : [{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]}
                    onChange={value => onPrefs(value === 'orion' || value === 'eve'
                      ? { ...prefs, audiobookVoice: value }
                      : { ...prefs, audiobookVoice: null, voicePersona: value === 'male' ? 'male' : 'female' })}
                  />
                <SelectRow label="Speed" testId="lab-v2-audio-speed" value={String(prefs.audioSpeed)}
                  options={[...new Set([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, prefs.audioSpeed])].sort((a, b) => a - b).map(value => ({ value: String(value), label: value + '×' }))}
                  onChange={value => onPrefs({ ...prefs, audioSpeed: Number(value) })} />
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

          {layer === 'editions' && (
            <div className="lab-v2-editions">
              {editionRow('Main version', 'mainEdition', editionName(prefs.primaryEdition), 'lab-v2-main-edition')}
              {editionRow('Audiobook version', 'audioEdition', prefs.audioFollowsPrimary === false ? editionName(prefs.audioEdition) : 'Follow main version', 'lab-v2-audio-edition')}
              <div className="lab-v2-edition-divider" />
              {editionRow('Compare version', 'compareEdition', prefs.compareOpen ? editionName(prefs.compareEdition) : 'None', 'lab-v2-compare-edition')}
              {compare && prefs.compareOpen && (
                <button type="button" className="lab-v2-row is-toggle" role="switch" aria-checked={compare.active}
                  data-testid="lab-v2-show-compare" onClick={compare.onToggle}>
                  <span className="lab-v2-row-label">Show compare</span>
                  <span className="lab-v2-switch" aria-hidden="true"><span className="lab-v2-switch-knob" /></span>
                </button>
              )}
            </div>
          )}
          {picker && (
            <div className="lab-v2-edition-choices" role="group" aria-label={LAB_V2_SHEET_TITLES[layer]}>
              {layer !== 'mainEdition' && (
                <button type="button" className="lab-v2-edition-option" aria-pressed={selected === ''} onClick={() => choose('')}>
                  <span>{layer === 'audioEdition' ? 'Follow main version' : 'None'}</span>
                  <span className="lab-v2-edition-check" aria-hidden="true">{selected === '' ? '✓' : ''}</span>
                </button>
              )}
              {choices.map(edition => {
                const difficulty = editionDifficulty(bookId, edition)
                return <button key={edition.key} type="button" className="lab-v2-edition-option" aria-pressed={selected === edition.key}
                  data-edition={edition.key} onClick={() => choose(edition.key)}>
                  <span className="lab-v2-edition-name">{readerEditionLabel(edition)}
                    {difficulty && <span className="lab-v2-difficulty" title="Reading difficulty">{difficulty}</span>}
                    {edition.key === 'modern-en' && <span className="lab-v2-difficulty">AI-generated</span>}
                  </span>
                  <span className="lab-v2-edition-check" aria-hidden="true">{selected === edition.key ? '✓' : ''}</span>
                </button>
              })}
            </div>
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
                    onChange={event => onPrefs({ ...prefs, alignment: event.target.value as LabTextAlignment, alignmentExplicit: true })}
                  >
                    <option value="justify">Justified</option>
                    <option value="left">Left</option>
                  </select>
                </div>
              </Group>
              {phoneShakespeare && <Group label="Shakespeare">
                <div className="lab-v2-row is-select">
                  <span className="lab-v2-row-icon" aria-hidden="true"><ParagraphIcon /></span>
                  <span className="lab-v2-row-label">Shakespeare layout</span>
                  <Value>{prefs.shakespeareLayout === 'flowing' ? 'Flowing text' : 'Verse lines'}</Value>
                  <select className="lab-v2-row-select" aria-label="Shakespeare layout" value={prefs.shakespeareLayout || 'verse'} onChange={event => onPrefs({ ...prefs, shakespeareLayout: event.target.value as 'verse' | 'flowing' })}>
                    <option value="verse">Verse lines</option><option value="flowing">Flowing text</option>
                  </select>
                </div>
              </Group>}
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
