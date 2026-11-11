import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  AI_INSTRUCTIONS_MAX_CHARS,
  AI_LENGTHS,
  AI_LENGTH_ACTIONS,
  AI_INSTRUCTION_ACTIONS,
  cleanInstruction,
  defaultAiSettings,
  type AiAnswerLanguage,
  type AiInstructionAction,
  type AiLength,
  type AiLengthAction,
  type AiSettings,
} from '../aiSettings'
import { useAiSettings } from './labAiPrefs'
import './aiSettingsDialog.css'

/** The approved mock's words (10 Nov 2026). */
export const AI_SETTINGS_COPY = {
  title: 'AI settings',
  general: 'General',
  custom: 'Custom',
  length: 'Length',
  lengths: { brief: 'Brief', standard: 'Standard', detailed: 'Detailed' } as Record<AiLength, string>,
  lengthHints: { brief: 'A sentence or two', standard: 'A short paragraph or a short page', detailed: 'Section by section, with context' } as Record<AiLength, string>,
  rows: { explain: 'Explain', ask: 'Ask', primer: 'Primer', summary: 'Summary and Recap' } as Record<AiLengthAction, string>,
  phoneRows: { explain: 'Explain', ask: 'Ask', primer: 'Primer', summary: 'Summary' } as Record<AiLengthAction, string>,
  rowLabel: { explain: 'Explain', ask: 'Ask', primer: 'Primer', summary: 'Summary' } as Record<AiLengthAction, string>,
  detailedNote: 'Detailed uses more of your monthly AI allowance.',
  answerIn: 'Answer in',
  languages: { auto: 'The language I ask in', en: 'English', da: 'Dansk' } as Record<AiAnswerLanguage, string>,
  reset: 'Reset to defaults',
  yourInstructions: 'Your instructions',
  upload: 'Upload .md',
  instructionsHint: 'Loaded as context in every AI interaction: answers, explanations, summaries, quizzes and Talk.',
  perAction: 'Per action (optional): Explain, Ask, Primer, Summary, Recap, Quiz me, Counterpoint',
  actions: { explain: 'Explain', ask: 'Ask', primer: 'Primer', summary: 'Summary', recap: 'Recap', quiz: 'Quiz me', counterpoint: 'Counterpoint' } as Record<AiInstructionAction, string>,
  uploadCut: `The file was longer than ${AI_INSTRUCTIONS_MAX_CHARS} characters: its first ${AI_INSTRUCTIONS_MAX_CHARS} are kept.`,
  uploadFailed: 'That file could not be read. Choose a .md or .txt file.',
  close: 'Close',
  back: 'Back',
}

type Tab = 'general' | 'custom'

export interface LabAiSettingsProps {
  onClose: () => void
  /** The phone: a full screen with a back arrow instead of the desktop dialog. */
  phone?: boolean
  dark?: boolean
}

/**
 * AI settings, as mocked and approved (10 Nov 2026): General (Length per
 * action, Answer in, Reset to defaults) and Custom (the reader's own
 * instructions, an optional box per action). A dialog on the desktop, a full
 * screen on the phone. Every change is kept at once (labAiPrefs.ts, labAiAccount.ts), on this
 * device and, signed in, with the account.
 */
export function LabAiSettings({ onClose, phone = false, dark = false }: LabAiSettingsProps) {
  const [settings, setSettings] = useAiSettings()
  const [tab, setTab] = useState<Tab>('general')
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const closeLatest = useRef(onClose); closeLatest.current = onClose

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeLatest.current() } }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
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
        {AI_LENGTHS.map(length => <span key={length} className="lab-ai-col" title={AI_SETTINGS_COPY.lengthHints[length]}>{AI_SETTINGS_COPY.lengths[length]}</span>)}
        {AI_LENGTH_ACTIONS.map(action => <LengthRow key={action} label={rows[action]} action={action} value={settings.length[action]} onChange={setLength} />)}
      </div>
      <p className="lab-ai-note" data-testid="ai-settings-detailed-note">{AI_SETTINGS_COPY.detailedNote}</p>
      <label className="lab-ai-language">
        <span className="lab-ai-heading">{AI_SETTINGS_COPY.answerIn}</span>
        <select value={settings.language} onChange={event => change({ language: event.target.value as AiAnswerLanguage })} data-testid="ai-settings-language">
          {(['auto', 'en', 'da'] as const).map(value => <option key={value} value={value}>{AI_SETTINGS_COPY.languages[value]}</option>)}
        </select>
      </label>
      <div className="lab-ai-reset">
        <button type="button" className="lab-ai-link" data-testid="ai-settings-reset" onClick={() => { const fresh = defaultAiSettings(); setSettings({ ...fresh, instructions: settings.instructions, perAction: settings.perAction }) }}>{AI_SETTINGS_COPY.reset}</button>
      </div>
    </div>
  )
  const custom = (
    <div className="lab-ai-panel" role="tabpanel" aria-label={AI_SETTINGS_COPY.custom} data-testid="ai-settings-custom">
      <div className="lab-ai-field">
        <div className="lab-ai-field-top">
          <label htmlFor="lab-ai-instructions" className="lab-ai-heading">{AI_SETTINGS_COPY.yourInstructions}</label>
          <button type="button" className="lab-ai-pill" data-testid="ai-settings-upload" onClick={() => fileRef.current?.click()}>{AI_SETTINGS_COPY.upload}</button>
          <input ref={fileRef} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" hidden onChange={upload} data-testid="ai-settings-file" />
        </div>
        <span className="lab-ai-hint">{AI_SETTINGS_COPY.instructionsHint}</span>
        <textarea id="lab-ai-instructions" rows={5} maxLength={AI_INSTRUCTIONS_MAX_CHARS} value={settings.instructions}
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

  const tabs = (
    <div role="tablist" aria-label={AI_SETTINGS_COPY.title} className="lab-ai-tabs">
      {(['general', 'custom'] as const).map(id => (
        <button key={id} type="button" role="tab" aria-selected={tab === id} className="lab-ai-tab" data-testid={`ai-settings-tab-${id}`} onClick={() => setTab(id)}>
          {id === 'general' ? AI_SETTINGS_COPY.general : AI_SETTINGS_COPY.custom}
        </button>
      ))}
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
      {tab === 'general' ? general : custom}
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
        <button key={length} type="button" className="lab-ai-choice" aria-pressed={on} title={AI_SETTINGS_COPY.lengthHints[length]}
          aria-label={`${AI_SETTINGS_COPY.rowLabel[action]}: ${AI_SETTINGS_COPY.lengths[length]}`} data-testid={`ai-length-${action}-${length}`}
          onClick={() => onChange(action, length)}>
          <span aria-hidden="true">{on ? '●' : '○'}</span>
        </button>
      )
    })}
  </>
}
