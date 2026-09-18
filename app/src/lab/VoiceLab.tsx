import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiUrl } from '../utils/apiUrl'
import { STREAMED_VOICE_EXPERIMENT, CURRENT_VOICE_EXPERIMENT, LIGHT_VOICE_EXPERIMENT, INSIGHT_VOICE_EXPERIMENT, INSIGHT_REASONED_EXPERIMENT, VOICE_LAB_MODELS, parseVoiceExperiment, type VoiceDiagnostic, type VoiceExperiment } from '../voice/voiceLab'
import { LabApp } from './LabApp'
import './voiceLab.css'

export function VoiceLab() {
  const { session } = useAuth()
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied'>('checking')
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<'settings' | 'results'>('settings')
  const [draft, setDraft] = useState<VoiceExperiment>({ ...STREAMED_VOICE_EXPERIMENT })
  const [presets, setPresets] = useState<VoiceExperiment[]>([])
  const [events, setEvents] = useState<VoiceDiagnostic[]>([])
  const [active, setActive] = useState(false)
  const [notice, setNotice] = useState('')
  const lastInput = useRef<number | null>(null)
  const presetKey = session?.user.id ? `tinct:voice-lab-presets:${session.user.id}` : null
  useEffect(() => {
    let cancelled = false
    setAccess('checking')
    if (!session?.access_token) { setAccess('denied'); return }
    fetch(apiUrl('/api/voice-lab'), { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(async r => r.ok && (await r.json()).allowed === true)
      .then(allowed => { if (!cancelled) setAccess(allowed ? 'allowed' : 'denied') })
      .catch(() => { if (!cancelled) setAccess('denied') })
    return () => { cancelled = true }
  }, [session?.access_token])
  useEffect(() => {
    setEvents([]); setActive(false); setDraft({ ...STREAMED_VOICE_EXPERIMENT })
    try {
      const raw: unknown = presetKey ? JSON.parse(localStorage.getItem(presetKey) || '[]') : []
      setPresets(Array.isArray(raw) ? raw.map(parseVoiceExperiment).filter((p): p is VoiceExperiment => !!p).slice(-12) : [])
    } catch { setPresets([]) }
  }, [presetKey])
  const diagnose = useCallback((event: VoiceDiagnostic) => {
    setEvents(previous => [...previous, event].slice(-5000))
    if (event.type === 'call.started') { setActive(true); lastInput.current = null }
    if (event.type === 'call.ended') setActive(false)
    if (event.type === 'user.transcript') lastInput.current = event.at
  }, [])
  const savePreset = () => {
    if (!presetKey || !parseVoiceExperiment(draft)) { setNotice('Give the preset a name and both prompts.'); return }
    const next = [...presets.filter(p => p.label !== draft.label), { ...draft }].slice(-12)
    try { localStorage.setItem(presetKey, JSON.stringify(next)); setPresets(next); setNotice('Preset saved on this device.') }
    catch { setNotice('Could not save on this device. Export the test instead.') }
  }
  const exportTest = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), voiceModel: 'See each call.started settings: chain = Sol + Marin TTS; other presets = GPT Live1', timing: 'Client event receipt times; useful-answer marks are manual and include observer delay.', events }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob), link = document.createElement('a')
    link.href = url; link.download = `tinct-voice-test-${Date.now()}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const lastCall = events.map(e => e.type).lastIndexOf('call.started')
  const callEvents = events.slice(Math.max(0, lastCall))
  const started = callEvents[0]?.at ?? 0
  const transcript = (type: string) => callEvents.filter(e => e.type === type).map(e => e.text || '').join('')
  const spokenTurns: { role: string; text: string }[] = []
  for (const event of callEvents) {
    if (!['user.transcript', 'assistant.transcript'].includes(event.type)) continue
    const role = event.type.startsWith('user') ? 'You' : 'Tinct'
    const last = spokenTurns[spokenTurns.length - 1]
    if (last?.role === role) last.text += event.text || ''
    else spokenTurns.push({ role, text: event.text || '' })
  }
  if (access !== 'allowed') return <main className="voice-lab-gate"><h1>Voice test room</h1><p>{access === 'checking' ? 'Checking access…' : 'Sign in with a Tinct administrator account to use this private test room.'}</p><a href="/lab/sign-in/?returnTo=%2Flab%2Fvoice">Sign in</a> · <a href="/reader">Back to reader</a></main>
  return <>
    <LabApp pathname="/reader" search="" voiceExperiment={draft} onVoiceDiagnostic={diagnose} />
    <button className="voice-lab-toggle" onClick={() => setOpen(!open)}>{open ? 'Hide test controls' : `Voice test${active ? ' · recording diagnostics' : ''}`}</button>
    {open && <aside className="voice-lab-panel" aria-label="Voice test controls">
      <h1>Voice test room</h1>
      <p><strong>Isolated voice preview.</strong> Start with Sol — streamed voice; the Live presets remain available for comparison. Production reader changes are not included here.</p>
      <p>Choose a passage in the reader, hide these controls, then open Talk. Settings apply to the next call. Reader controls act on your real book.</p>
      <nav><button aria-pressed={tab === 'settings'} onClick={() => setTab('settings')}>Settings</button><button aria-pressed={tab === 'results'} onClick={() => setTab('results')}>Results ({events.filter(e => e.type === 'call.started').length})</button></nav>
      {tab === 'settings' ? <>
        <fieldset disabled={active}>
          <legend>{active ? 'End the call before changing settings' : 'Next call'}</legend>
          <label>Preset<select aria-label="Preset" value="" onChange={e => { const presets_ = [CURRENT_VOICE_EXPERIMENT, LIGHT_VOICE_EXPERIMENT, INSIGHT_VOICE_EXPERIMENT, INSIGHT_REASONED_EXPERIMENT, ...presets]; const selected = presets_[Number(e.target.value)]; if (selected) setDraft({ ...selected }) }}><option value="" disabled>Choose a preset…</option>{[CURRENT_VOICE_EXPERIMENT, LIGHT_VOICE_EXPERIMENT, INSIGHT_VOICE_EXPERIMENT, INSIGHT_REASONED_EXPERIMENT, ...presets].map((p, i) => <option key={i} value={i}>{p.label}</option>)}</select></label>
          <label>Test name<input value={draft.label} maxLength={100} onChange={e => setDraft({ ...draft, label: e.target.value })} /></label>
          <p>{draft.transport === 'chain' ? 'Voice: Sol writes; Marin speaks. Low reasoning effort, streamed speech. The speaking prompt below is descriptive; edit the reasoning prompt to change answers.' : 'Voice: GPT Live1.'}</p>
          <label>Reasoning model<select disabled={draft.transport === 'chain'} value={draft.model} onChange={e => setDraft({ ...draft, model: e.target.value as VoiceExperiment['model'] })}>{VOICE_LAB_MODELS.map(model => <option key={model}>{model}</option>)}</select></label>
          <label>Speaking prompt<textarea readOnly={draft.transport === 'chain'} rows={9} maxLength={16000} value={draft.frontend} onChange={e => setDraft({ ...draft, frontend: e.target.value })} /></label>
          <label>Reasoning prompt<textarea rows={10} maxLength={16000} value={draft.backend} onChange={e => setDraft({ ...draft, backend: e.target.value })} /></label>
          <p><code>{'{{reader_context}}'}</code> inserts the current production instructions and recent chat context. <code>{'{{passage}}'}</code> inserts only the book, location and nearby text. The exact resolved prompt appears in Results.</p>
          <button onClick={savePreset}>Save preset</button>
        </fieldset>
        <p role="status">{notice}</p>
        <details><summary>Suggested comparisons</summary><ol><li>Odyssey, Book 6: why does Athena involve Nausicaa? Challenge the first interpretation, then ask what the text actually establishes.</li><li>Job: challenge the friends’ reasoning, ask for a different explanation, then ask about Keller’s documented view.</li><li>Interrupt and correct a name. Check that it answers the correction.</li><li>Ask to resume the audiobook; verify the control worked.</li></ol><p>Keep the passage and questions the same. Change prompts first, then the reasoning model. Tests use your normal voice allowance.</p></details>
      </> : <>
        <div className="voice-lab-actions"><button onClick={exportTest} disabled={!events.length}>Export all tests</button><button disabled={active || !events.length} onClick={() => setEvents([])}>Clear results</button><button disabled={!active || !lastInput.current} onClick={() => diagnose({ at: Date.now(), type: 'useful-answer.mark', durationMs: Date.now() - (lastInput.current ?? Date.now()) })}>Mark useful answer</button></div>
        <p>Timing is measured from received transcript events, not the audio waveform. Mark the first useful answer as you hear it; this includes your reaction time. Results stay in this tab until exported or cleared. Voice tests do not save to book chat history.</p>
        <details><summary>Exact call settings and resolved prompt</summary><pre>{JSON.stringify(callEvents.find(e => e.type === 'call.started'), null, 2)}</pre></details>
        <h2>Spoken transcript</h2>{spokenTurns.map((turn, i) => <p key={i}><strong>{turn.role}: </strong>{turn.text}</p>)}
        <h2>Reasoning model answer</h2><pre>{transcript('backend.text') || 'No backend text received yet.'}</pre>
        <h2>Tools and timing</h2>{callEvents.filter(e => !e.type.endsWith('.transcript') && e.type !== 'backend.text' && e.type !== 'call.started').map((e, i) => <details key={i}><summary>{((e.at - started) / 1000).toFixed(1)}s · {e.type}{e.durationMs != null ? ` · ${(e.durationMs / 1000).toFixed(2)}s` : ''}</summary><pre>{e.instructions || e.text || e.id}</pre></details>)}
      </>}
    </aside>}
  </>
}
