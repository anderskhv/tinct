import { readEinkProfile, setEinkProfile } from '../../public/lab/display-profile.js'
import { useEffect, useState, type ReactNode } from 'react'
import { editionDifficulty, readerEditionLabel } from './editionDifficulty'
import { bibleEditionHasChapter } from '../data/bibleEditionChapters'
import { useReaderWindow } from './useReaderWindow'
import { matchingAudioEditions } from '../utils/audioEditionSelection'
import type { Edition } from '../types'
import type { NarrationPilotInfo } from './labNarration'
import {
  labLineHeight, labMarginScale, labParagraphGap, restoreLabAppearance,
  LAB_MAX_FONT_SIZE,
  LAB_MIN_FONT_SIZE,
  labFontFamilyCss,
  labReadingFont,
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
  labPrefsForMainEdition,
  type LabV2SheetLayer,
} from './labV2Sheet'
import { getBook } from '../data/bookRegistry'
import { LabOfflineRow } from './LabOfflineRow'
import { offlineEditionKeys } from './labOfflineBook'
import { isUserBookId } from './userBook/userBookId'

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
   * Compare needs something to pair; say so instead of hiding the switch.
   * 'verses': a Bible pair with no shared verse numbers (desktop side by side).
   * 'paragraphs': an edition whose paragraphs do not match the other's.
   */
  compareUnavailable?: false | 'verses' | 'paragraphs' | 'chapter' | 'numbering'
  /** The Bible chapter open in the reader: versions without it are shown but cannot be chosen as the main version. */
  chapterNumber?: number
  /**
   * Fish narration pilot row, present only for a reader who opted in with
   * `?narration=fish` (docs/fish-audio-pilot-2026-09-18.md).
   */
  narrationPilot?: { info: NarrationPilotInfo | null; voice: string | null } | null
  /**
   * Present for a signed-out reader: Orion and Eve need an account, so
   * choosing one asks for it (the listening account sheet) and leaves the
   * stored voice as it is. Guests narrate with Ara or Helios.
   */
  onAccountVoice?: () => void
  /**
   * An added public-domain book's Modern English edition, offered for purchase
   * under the main-version choices (labModernEdition.ts). Absent when not offered.
   */
  modernOffer?: { price: string; busy?: boolean; onBuy: () => void }
  /** A reader's own PDF: Book editions picks between its Tinct text and its Original pages only. */
  ownPdf?: boolean
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
export function LabV2Sheet({ narrationPilot, onAccountVoice, bookId = 'bible', phoneShakespeare = false, layer, onLayer, onClose, prefs, onPrefs, editions, audioEditions = matchingAudioEditions(prefs.primaryEdition, editions), compare = null, compareUnavailable = false, chapterNumber, modernOffer, ownPdf = false }: LabV2SheetProps) {
  const [eink, updateEink] = useState(readEinkProfile)
  const [einkOffered] = useState(readEinkProfile)
  useEffect(() => {
    const update = () => updateEink(document.documentElement.dataset.eink === 'true')
    window.addEventListener('tinct:display-profile', update)
    return () => window.removeEventListener('tinct:display-profile', update)
  }, [])
  const windowRef = useReaderWindow<HTMLElement>('settings', !!layer)
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

  // Catch me up is its own sheet (LabCatchUpSheet) and the account is the account cards
  // (src/cards, opened by LabApp); both share the layer so every overlay guard applies.
  if (!layer || layer === 'catchup' || layer === 'account') return null

  const font = labReadingFont(prefs.fontFamily)
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
    if (layer === 'mainEdition') onPrefs(labPrefsForMainEdition(prefs, key, bookId, editions, getBook(bookId)?.year))
    else if (layer === 'audioEdition') onPrefs({ ...prefs, audioEdition: key || prefs.primaryEdition, audioFollowsPrimary: key === '' })
    else onPrefs({ ...prefs, compareEdition: key || prefs.compareEdition, compareOpen: key !== '', compareChosen: true })
    onLayer('editions')
  }
  const editionRow = (label: string, target: LabV2SheetLayer, value: string, testId: string) => (
    <button type="button" className="lab-v2-row lab-v2-edition-link" data-testid={testId} onClick={() => onLayer(target)}>
      <span className="lab-v2-edition-text"><span className="lab-v2-row-label">{label}</span><span className="lab-v2-edition-current">{value}</span></span>
      <span aria-hidden="true">›</span>
    </button>
  )

  const head = layer === 'reading' || layer === 'editions'
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
        ) : layer === 'advanced' ? (
          <button type="button" className="lab-v2-back" data-testid="lab-v2-sheet-back" onClick={() => onLayer('reading')}>‹ Settings</button>
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
                    className={`lab-v2-theme is-${theme}${!eink && prefs.theme === theme ? ' is-active' : ''}`}
                    data-testid={`lab-v2-theme-${theme}`}
                    aria-pressed={!eink && prefs.theme === theme}
                    onClick={() => { setEinkProfile(false); window.dispatchEvent(new Event('tinct:appearance-reset')); onPrefs({ ...prefs, theme, darkMode: theme === 'dark' }) }}
                  >
                    <span className="lab-v2-theme-face">Aa</span>
                    <span className="lab-v2-theme-label">{label}</span>
                  </button>
                ))}
                {/* E-ink is the display profile of e-readers (set by the device or ?eink=1), not a theme to pick on phones or desktops. */}
                {(eink || einkOffered) && <button type="button" className={`lab-v2-theme is-eink${eink ? ' is-active' : ''}`} data-testid="lab-v2-theme-eink" aria-pressed={eink}
                  onClick={() => { window.dispatchEvent(new Event('tinct:appearance-reset')); setEinkProfile(true); onPrefs({ ...prefs, theme:'light', darkMode:false }) }}>
                  <span className="lab-v2-theme-face">Aa</span><span className="lab-v2-theme-label">E-ink</span>
                </button>}
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
                  onChange={event => onPrefs({ ...prefs, fontSize: Number(event.target.value), fontSizeExplicit: true })}
                />
                <span className="lab-v2-size-large" aria-hidden="true">A</span>
              </div>
              <div className="lab-v2-rows">

                  <SelectRow
                    label="Voice"
                    testId="lab-v2-narration-voice"
                    value={narrationPilot?.info?.provider !== 'grok' ? prefs.voicePersona
                      : onAccountVoice ? (narrationPilot?.voice === 'm' ? 'male' : narrationPilot?.voice === 'f' ? 'female' : prefs.voicePersona)
                      : prefs.audiobookVoice || prefs.voicePersona}
                    options={narrationPilot?.info?.provider === 'grok' ? [
                      { value: 'female', label: 'Ara · Female' },
                      { value: 'male', label: 'Helios · Male' },
                      { value: 'orion', label: 'Orion · Male' },
                      { value: 'eve', label: 'Eve · Female' },
                    ] : [{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]}
                    onChange={value => {
                      if (value !== 'orion' && value !== 'eve') onPrefs({ ...prefs, audiobookVoice: null, voicePersona: value === 'male' ? 'male' : 'female', voicePersonaChosen: true })
                      else if (onAccountVoice) onAccountVoice()
                      else onPrefs({ ...prefs, audiobookVoice: value, voicePersonaChosen: true })
                    }}
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
              {!ownPdf && <>
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
              {compareUnavailable && (
                <p className="lab-v2-row-note" data-testid="lab-v2-compare-unavailable">
                  {compareUnavailable === 'verses'
                    ? 'Side by side isn’t available for these two versions: they share no verse numbers to pair.'
                    : compareUnavailable === 'chapter'
                      ? `The ${editionName(prefs.compareEdition)} doesn’t include this book, so there is nothing to compare here.`
                      : compareUnavailable === 'numbering'
                        ? 'These versions number this chapter differently (the Greek text adds verses), so Compare isn’t available here.'
                        : 'Compare isn’t available for these two versions: their paragraphs don’t line up.'}
                </p>
              )}
              </>}
              {bookId && !ownPdf && !isUserBookId(bookId) && <>
                <div className="lab-v2-edition-divider" />
                <LabOfflineRow bookId={bookId}
                  editionKeys={offlineEditionKeys(prefs.primaryEdition, prefs.compareOpen ? prefs.compareEdition : null)}
                  hasVerseLines={editions.some(edition => edition.hasVerseLines)} />
              </>}
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
                // A Bible version without this chapter (Tobit outside the Catholic edition) cannot be the main version here.
                const missing = layer === 'mainEdition' && bookId === 'bible' && chapterNumber != null && !bibleEditionHasChapter(edition.key, chapterNumber)
                return <button key={edition.key} type="button" className="lab-v2-edition-option" aria-pressed={selected === edition.key}
                  data-edition={edition.key} disabled={missing} onClick={() => choose(edition.key)}>
                  <span className="lab-v2-edition-name">{readerEditionLabel(edition)}
                    {difficulty && <span className="lab-v2-difficulty" title="Reading difficulty">{difficulty}</span>}
                    {edition.style === 'modern' && <span className="lab-v2-difficulty">AI-generated</span>}
                    {missing && <span className="lab-v2-difficulty" data-testid="lab-v2-edition-missing-chapter">Doesn’t include this book</span>}
                  </span>
                  <span className="lab-v2-edition-check" aria-hidden="true">{selected === edition.key ? '✓' : ''}</span>
                </button>
              })}
              {layer === 'mainEdition' && modernOffer && (
                <button type="button" className="lab-v2-edition-option" data-testid="lab-v2-modern-offer"
                  disabled={modernOffer.busy} onClick={modernOffer.onBuy}>
                  <span className="lab-v2-edition-name">Tinct Modern English
                    <span className="lab-v2-difficulty">{modernOffer.price}</span>
                  </span>
                  <span className="lab-v2-edition-check" aria-hidden="true" />
                </button>
              )}
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

          {(layer === 'reading' || layer === 'advanced') && <button type="button" className="lab-v2-restore" onClick={() => onPrefs(restoreLabAppearance(prefs))}>Restore defaults</button>}
        </div>
      </section>
    </div>
  )
}


