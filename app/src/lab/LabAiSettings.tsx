import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  AI_INSTRUCTIONS_MAX_CHARS,
  AI_LENGTHS,
  AI_LENGTH_ACTIONS,
  AI_LENGTH_DEFAULTS,
  AI_INSTRUCTION_ACTIONS,
  cleanInstruction,
  type AiInstructionAction,
  type AiLength,
  type AiLengthAction,
  type AiSettings,
} from '../aiSettings'
import { useAiSettings } from './labAiPrefs'
import { READING_ANGLE_MAX_CHARS, useReadingAngle } from './labReadingAngle'
import { SavedNote, useSavedNote } from './LabSavedNote'
import { PhoneIcon } from './marginPhone/LabPhoneCard'
import { useLabDictation, type LabDictationOptions } from './useLabDictation'
import './aiSettingsDialog.css'

/** The dialog's words (two tabs, Anders, 11 Nov 2026). */
export const AI_SETTINGS_COPY = {
  title: 'AI settings',
  general: 'General',
  book: 'This book',
  length: 'Length',
  lengths: { brief: 'Brief', standard: 'Standard', detailed: 'Detailed' } as Record<AiLength, string>,
  rows: { explain: 'Explain', ask: 'Ask', primer: 'Primer', summary: 'Summary and Recap' } as Record<AiLengthAction, string>,
  phoneRows: { explain: 'Explain', ask: 'Ask', primer: 'Primer', summary: 'Summary' } as Record<AiLengthAction, string>,
  rowLabel: { explain: 'Explain', ask: 'Ask', primer: 'Primer', summary: 'Summary' } as Record<AiLengthAction, string>,
  reset: 'Reset to defaults',
  bookScope: 'Anything set here applies to this book only.',
  yourInstructions: 'Your instructions',
  upload: 'Upload .md',
  instructionsHint: 'Loaded as context in every AI interaction: answers, explanations, summaries, quizzes and Talk.',
  perAction: 'Per action (optional): Explain, Ask, Primer, Summary, Recap, Quiz me, Counterpoint',
  actions: { explain: 'Explain', ask: 'Ask', primer: 'Primer', summary: 'Summary', recap: 'Recap', quiz: 'Quiz me', counterpoint: 'Counterpoint' } as Record<AiInstructionAction, string>,
  readingAngle: 'Reading angle',
  readingAngleHint: 'Why you are reading this book, or what you want to get out of it. Every Explain, Ask, Primer and Summary in this book is written with it in mind.',
  readingAnglePlaceholder: 'For example: I\u2019m preparing a seminar on this book. Or: I want to follow how the main character changes.',
  uploadCut: `The file was longer than ${AI_INSTRUCTIONS_MAX_CHARS} characters: its first ${AI_INSTRUCTIONS_MAX_CHARS} are kept.`,
  uploadFailed: 'That file could not be read. Choose a .md or .txt file.',
  close: 'Close',
  back: 'Back',
}

export type AiSettingsTab = 'general' | 'book'

export interface LabAiSettingsProps {
  onClose: () => void
  /** The phone: a full screen with a back arrow instead of the desktop dialog. */
  phone?: boolean
  dark?: boolean
  /** The open book: its id as its reading angle is kept, and its title. Without one (Profile from the library) there is General only. */
  book?: { id: string; title: string } | null
  /** The tab to open on; 'book' needs a book. */
  tab?: AiSettingsTab
  /** Put the caret in the reading angle (a "Set reading angle" entry). */
  focusAngle?: boolean
  /** Dictation into the reading angle, where the reader's page has it (useLabDictation's own options). */
  dictation?: Pick<LabDictationOptions, 'signedIn' | 'getAuthToken'> | null
}

/**
 * AI settings (Anders, 11 Nov 2026): General (Length per action, then the
 * reader's own instructions) and This book (the same Length grid, each row
 * "Same as General" until set, then the book's reading angle). A dialog on
 * the desktop, a full screen on the phone. Every change is kept at once
 * (labAiPrefs.ts, labAiAccount.ts, labReadingAngle.ts), on this device and,
 * signed in, with the account.
 */
export function LabAiSettings({ onClose, phone = false, dark = false, book = null, tab: firstTab = 'general', focusAngle = false, dictation = null }: LabAiSettingsProps) {
  const [settings, setSettings] = useAiSettings()
  const [tab, setTab] = useState<AiSettingsTab>(book && firstTab === 'book' ? 'book' : 'general')
  const [notice, setNotice] = useState('')
  const [angle, setAngle] = useReadingAngle(book?.id ?? null)
  // Every change is saved as it is made; the dialog says so once, quietly, by its tabs.
  const saved = useSavedNote(JSON.stringify([settings, angle]))
  const fileRef = useRef<HTMLInputElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const closeLatest = useRef(onClose); closeLatest.current = onClose

  useEffect(() => {
    if (!(focusAngle && book && firstTab === 'book')) closeRef.current?.focus({ preventScroll: true })
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeLatest.current() } }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
    // The first focus only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const change = (patch: Partial<AiSettings>) => setSettings({ ...settings, ...patch })
  const setLength = (action: AiLengthAction, length: AiLength) => change({ length: { ...settings.length, [action]: length } })
  const setPerAction = (action: AiInstructionAction, text: string) => change({ perAction: { ...settings.perAction, [action]: cleanInstruction(text) } })
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    void file.text().then(text => {
      const kept = cleanInstruction(text.trim())
      change({ instructions: kept })
      setNotice(text.trim().length > AI_INSTRUCTIONS_MAX_CHARS ? AI_SETTINGS_COPY.uploadCut : '')
    }, () => setNotice(AI_SETTINGS_COPY.uploadFailed))
  }

  const rows = phone ? AI_SETTINGS_COPY.phoneRows : AI_SETTINGS_COPY.rows
  const general = (
    <div className="lab-ai-panel" role="tabpanel" aria-label={AI_SETTINGS_COPY.general} data-testid="ai-settings-general">
      <div className="lab-ai-grid" role="group" aria-label={AI_SETTINGS_COPY.length}>
        <span className="lab-ai-heading">{AI_SETTINGS_COPY.length}</span>
        {/* Plain column labels: no hint, no tooltip (Anders, 11 Nov 2026). */}
        {AI_LENGTHS.map(length => <span key={length} className="lab-ai-col" data-testid={`ai-length-head-${length}`}>{AI_SETTINGS_COPY.lengths[length]}</span>)}
        {AI_LENGTH_ACTIONS.map(action => <LengthRow key={action} label={rows[action]} action={action} value={settings.length[action]} onChange={setLength} />)}
      </div>
      <div className="lab-ai-reset">
        <button type="button" className="lab-ai-link" data-testid="ai-settings-reset" onClick={() => change({ length: { ...AI_LENGTH_DEFAULTS } })}>{AI_SETTINGS_COPY.reset}</button>
      </div>
      <div className="lab-ai-rule" />
      <div className="lab-ai-field">
        <div className="lab-ai-field-top">
          <label htmlFor="lab-ai-instructions" className="lab-ai-heading">{AI_SETTINGS_COPY.yourInstructions}</label>
          <button type="button" className="lab-ai-pill" data-testid="ai-settings-upload" onClick={() => fileRef.current?.click()}>{AI_SETTINGS_COPY.upload}</button>
          <input ref={fileRef} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" hidden onChange={upload} data-testid="ai-settings-file" />
        </div>
        <span className="lab-ai-hint">{AI_SETTINGS_COPY.instructionsHint}</span>
        <textarea id="lab-ai-instructions" rows={4} maxLength={AI_INSTRUCTIONS_MAX_CHARS} value={settings.instructions}
          onChange={event => { setNotice(''); change({ instructions: cleanInstruction(event.target.value) }) }} data-testid="ai-settings-instructions" />
        {notice && <span className="lab-ai-notice" role="status" data-testid="ai-settings-notice">{notice}</span>}
      </div>
      <details className="lab-ai-per-action" open={AI_INSTRUCTION_ACTIONS.some(action => settings.perAction[action]?.trim()) || undefined}>
        <summary>{AI_SETTINGS_COPY.perAction}</summary>
        {AI_INSTRUCTION_ACTIONS.map(action => (
          <label key={action} className="lab-ai-field">
            <span className="lab-ai-sub">{AI_SETTINGS_COPY.actions[action]}</span>
            <textarea rows={2} maxLength={AI_INSTRUCTIONS_MAX_CHARS} value={settings.perAction[action] ?? ''}
              onChange={event => setPerAction(action, event.target.value)} data-testid={`ai-settings-action-${action}`} />
          </label>
        ))}
      </details>
    </div>
  )
  const thisBook = book && (
    <div className="lab-ai-panel" role="tabpanel" aria-label={AI_SETTINGS_COPY.book} data-testid="ai-settings-book">
      <p className="lab-ai-note" data-testid="ai-settings-book-scope">{book.title ? `${book.title}. ` : ''}{AI_SETTINGS_COPY.bookScope}</p>
      {/* The reading angle leads: it is what makes this tab the book's own, and "Set reading angle" opens straight to it
          (user test 12 Nov 2026: on the phone the length grid came first and read as the wrong place). */}
      <AngleField value={angle} onChange={setAngle} focus={focusAngle && firstTab === 'book'} bookId={book.id} dictation={dictation} />
    </div>
  )

  const tabs = (
    <div role="tablist" aria-label={AI_SETTINGS_COPY.title} className="lab-ai-tabs">
      {(book ? ['general', 'book'] as const : ['general'] as const).map(id => (
        <button key={id} type="button" role="tab" aria-selected={tab === id} className="lab-ai-tab" data-testid={`ai-settings-tab-${id}`} onClick={() => setTab(id)}>
          {id === 'general' ? AI_SETTINGS_COPY.general : AI_SETTINGS_COPY.book}
        </button>
      ))}
      <SavedNote shown={saved} testId="ai-settings-saved" />
    </div>
  )

  const surface = (
    <section className="lab-ai-settings" aria-labelledby="lab-ai-title" role="dialog" aria-modal="true" data-testid="ai-settings" onClick={event => event.stopPropagation()}>
      <div className="lab-ai-top">
        {phone && <button ref={closeRef} type="button" className="lab-ai-back" aria-label={AI_SETTINGS_COPY.back} data-testid="ai-settings-close" onClick={onClose}>‹</button>}
        <h1 id="lab-ai-title">{AI_SETTINGS_COPY.title}</h1>
        {!phone && <button ref={closeRef} type="button" className="lab-ai-close" aria-label={AI_SETTINGS_COPY.close} data-testid="ai-settings-close" onClick={onClose}>×</button>}
      </div>
      {tabs}
      {tab === 'book' && thisBook ? thisBook : general}
    </section>
  )

  return (
    <div className={`lab-ai-layer${phone ? ' is-phone' : ''}${dark ? ' is-dark' : ''}`} data-testid="ai-settings-layer" onClick={phone ? undefined : onClose}>
      {surface}
    </div>
  )
}

function LengthRow({ label, action, value, onChange }: { label: string; action: AiLengthAction; value: AiLength; onChange: (action: AiLengthAction, length: AiLength) => void }) {
  return <>
    <span className="lab-ai-row">{label}</span>
    {AI_LENGTHS.map(length => {
      const on = value === length
      return (
        <button key={length} type="button" className="lab-ai-choice" aria-pressed={on}
          aria-label={`${AI_SETTINGS_COPY.rowLabel[action]}: ${AI_SETTINGS_COPY.lengths[length]}`} data-testid={`ai-length-${action}-${length}`}
          onClick={() => onChange(action, length)}>
          <span aria-hidden="true">{on ? '●' : '○'}</span>
        </button>
      )
    })}
  </>
}

/** The book's reading angle (labReadingAngle.ts): the one place it is set, saved as it is typed, with dictation where the page has it. */
function AngleField({ value, onChange, focus, bookId, dictation }: { value: string; onChange: (value: string) => void; focus: boolean; bookId: string; dictation: LabAiSettingsProps['dictation'] }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (!focus) return
    const field = ref.current
    if (!field) return
    field.focus({ preventScroll: true })
    field.setSelectionRange(field.value.length, field.value.length)
  }, [focus])
  return (
    <div className="lab-ai-field">
      <label htmlFor="lab-ai-angle" className="lab-ai-heading">{AI_SETTINGS_COPY.readingAngle}</label>
      <span className="lab-ai-hint">{AI_SETTINGS_COPY.readingAngleHint}</span>
      <span className={`lab-ai-angle-box${dictation ? ' has-mic' : ''}`}>
        <textarea ref={ref} id="lab-ai-angle" rows={3} maxLength={READING_ANGLE_MAX_CHARS} value={value} placeholder={AI_SETTINGS_COPY.readingAnglePlaceholder}
          onChange={event => onChange(event.target.value)} data-testid="ai-settings-angle" />
        {dictation && <AngleMic bookId={bookId} value={value} onChange={onChange} dictation={dictation} />}
      </span>
    </div>
  )
}

function AngleMic({ bookId, value, onChange, dictation }: { bookId: string; value: string; onChange: (value: string) => void; dictation: NonNullable<LabAiSettingsProps['dictation']> }) {
  const mic = useLabDictation(bookId, text => onChange(text.slice(0, READING_ANGLE_MAX_CHARS)), { signedIn: dictation.signedIn, getAuthToken: dictation.getAuthToken })
  const on = mic.state !== 'idle'
  return (
    <button type="button" className="lab-ai-mic" data-testid="ai-settings-angle-mic" aria-pressed={on}
      aria-label={on ? 'Stop dictation' : 'Dictate your reading angle'} onClick={() => mic.toggle(value)}><PhoneIcon name="mic" /></button>
  )
}
