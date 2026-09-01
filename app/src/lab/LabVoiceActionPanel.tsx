import type { VoiceTinctView } from '../voice/tinctTools'
import type { LabVoiceActionEntry } from './labVoiceControls'

const VIEW_LABELS: Record<VoiceTinctView, string> = {
  read: 'Book',
  library: 'Library preview',
  reading_history: 'Reading history preview',
  pricing: 'Pricing preview',
  settings: 'Settings',
  chat: 'Chat',
  cast: 'Cast',
}

export interface LabVoiceActionPanelProps {
  active: boolean
  view: VoiceTinctView
  darkMode: boolean
  fontSize: number
  audioSpeed: number
  fixtureEnabled: boolean
  onFixtureEnabled: (enabled: boolean) => void
  actions: LabVoiceActionEntry[]
}

function compactArguments(arguments_: Record<string, unknown>): string {
  const entries = Object.entries(arguments_)
  if (entries.length === 0) return '—'
  return entries.map(([key, value]) => `${key}=${String(value)}`).join(', ')
}

export function LabVoiceActionPanel({
  active,
  view,
  darkMode,
  fontSize,
  audioSpeed,
  fixtureEnabled,
  onFixtureEnabled,
  actions,
}: LabVoiceActionPanelProps) {
  if (!active) return null
  return (
    <section className="lab-voice-actions" data-testid="lab-voice-actions" aria-label="Voice action lab">
      <div className="lab-voice-actions-head">
        <strong>Voice action lab</strong>
        <button
          type="button"
          className="lab-voice-fixture"
          aria-pressed={fixtureEnabled}
          onClick={() => onFixtureEnabled(!fixtureEnabled)}
          data-testid="lab-voice-history-fixture"
        >
          Yesterday demo: {fixtureEnabled ? 'on' : 'off'}
        </button>
      </div>
      <p className="lab-voice-actions-state" data-testid="lab-voice-action-state">
        {VIEW_LABELS[view]} · {darkMode ? 'dark' : 'light'} · {fontSize.toFixed(2)}rem · {audioSpeed}×
      </p>
      {view === 'library' && <p className="lab-voice-surface">Lab preview: your Library would be open here.</p>}
      {view === 'reading_history' && <p className="lab-voice-surface">Lab preview: Reading history is open. Ask “What did I read yesterday?”</p>}
      {view === 'pricing' && <p className="lab-voice-surface">Lab preview: Pricing is open without leaving Talk.</p>}
      {actions.length === 0 ? (
        <p className="lab-voice-actions-empty">Try “turn on dark mode”, “make the font larger”, or “what did I read yesterday?”</p>
      ) : (
        <ol className="lab-voice-action-list">
          {actions.slice(-4).reverse().map(action => (
            <li key={action.id} data-ok={action.ok ? 'true' : 'false'}>
              <code>{action.tool}</code>
              <span>{compactArguments(action.arguments)}</span>
              <strong>{action.outcome}</strong>
              <small>origin {action.originatingTurn}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
