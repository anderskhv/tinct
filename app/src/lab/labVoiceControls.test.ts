import { describe, expect, it, vi } from 'vitest'
import { TinctVoiceToolController, type VoiceTinctView } from '../voice/tinctTools'
import { LAB_VOICE_TOOLS } from './labAsk'
import { bibleFallbackSource } from './labSource'
import {
  buildLabVoiceControlInstructions,
  createLabVoiceToolAdapter,
  getLabVoiceReadingHistory,
  labVoiceActionEntry,
  mergeLabVoiceTools,
  type LabVoiceViewSnapshot,
} from './labVoiceControls'

describe('Lab production voice-tool bridge', () => {
  it('keeps Lab playback/navigation/companion tools and adds the production controls once', () => {
    const names = mergeLabVoiceTools(LAB_VOICE_TOOLS)
      .map(tool => (tool as { name?: string }).name)
      .filter(Boolean)

    expect(names).toContain('resume_audiobook')
    expect(names).toContain('set_assistant_pace')
    expect(names).toContain('next_chapter')
    expect(names).toContain('next_paragraph')
    expect(names).toContain('ask_companion')
    expect(names).toContain('get_reading_history')
    expect(names).toContain('set_tinct_theme')
    expect(names).toContain('set_reader_font_size')
    expect(names).toContain('set_audiobook_speed')
    expect(names).toContain('undo_last_tinct_action')
    expect(names).not.toContain('set_playback_speed')
    expect(new Set(names).size).toBe(names.length)
  })

  it('keeps Talk open after controls and reserves ending for an explicit reader request', () => {
    const instructions = buildLabVoiceControlInstructions('Base Lab prompt', [
      { role: 'user', content: 'Why is light called good?' },
      { role: 'assistant', content: 'It marks order emerging from the formless deep.' },
    ])
    expect(instructions).toContain('Only end Talk or resume the book when the reader explicitly asks')
    expect(instructions).toContain('After every non-resume tool result, remain in the conversation')
    expect(instructions).toContain('call set_audiobook_speed so the change can be undone')
    expect(instructions).toContain('Never claim to change device brightness')
    expect(instructions).toContain('[Recent Lab conversation]')
    expect(instructions).toContain('Reader: Why is light called good?')
    expect(instructions).toContain('Refer back naturally')
  })

  it('uses a deterministic, exact yesterday fixture without writing production history', async () => {
    const source = bibleFallbackSource()
    const result = await getLabVoiceReadingHistory({
      period: 'yesterday',
      source,
      paragraphIndex: 0,
      fixtureEnabled: true,
      now: new Date('2026-09-01T12:00:00+02:00').getTime(),
      logs: [],
    })

    expect(result.activities).toHaveLength(1)
    expect(result.lab_fixture_used).toBe(true)
    expect(result.activities[0]).toMatchObject({
      book_id: 'bible',
      chapter_number: source.chapterNumber,
      passage_excerpt: expect.stringContaining('In the beginning'),
      lab_fixture: true,
    })
    expect(String(result.activities[0].started_at)).toContain('2026-08-31')
  })

  it('returns an honest empty result when the Lab fixture is off or the period has no seed', async () => {
    const source = bibleFallbackSource()
    const disabled = await getLabVoiceReadingHistory({
      period: 'yesterday',
      source,
      paragraphIndex: 0,
      fixtureEnabled: false,
      logs: [],
    })
    const today = await getLabVoiceReadingHistory({
      period: 'today',
      source,
      paragraphIndex: 0,
      fixtureEnabled: true,
      logs: [],
    })
    const wrongBook = await getLabVoiceReadingHistory({
      period: 'last_session',
      bookQuery: 'The Odyssey',
      source,
      paragraphIndex: 0,
      fixtureEnabled: true,
      logs: [],
    })

    expect(disabled.activities).toEqual([])
    expect(today.activities).toEqual([])
    expect(wrongBook.activities).toEqual([])
  })

  it('binds every Lab adapter action and keeps undo scoped to the current Talk session', async () => {
    let view: VoiceTinctView = 'read'
    let theme: 'light' | 'dark' = 'light'
    let fontSize = 1.3
    let speed = 1
    const snapshot = (): LabVoiceViewSnapshot => ({
      view,
      phoneAskOpen: false,
      desktopAskOpen: false,
      gearOpen: false,
      tocOpen: false,
      inTheBookOpen: false,
      peekBook: false,
      settingsSection: 'reading',
    })
    const adapter = createLabVoiceToolAdapter<LabVoiceViewSnapshot>({
      getViewSnapshot: snapshot,
      openView: next => { view = next },
      restoreView: previous => { view = previous.view },
      getTheme: () => theme,
      setTheme: next => { theme = next },
      getFontSize: () => fontSize,
      setFontSize: next => { fontSize = next },
      getAudioSpeed: () => speed,
      setAudioSpeed: next => { speed = next },
      getReadingHistory: vi.fn(async period => ({
        ok: true,
        period,
        period_label: 'yesterday',
        activities: [{ passage_excerpt: 'Exact passage' }],
      })),
    })
    const controller = new TinctVoiceToolController(adapter)

    await controller.execute('open_tinct_view', { view: 'library' }, 'open-1')
    expect(view).toBe('library')
    await controller.execute('set_tinct_theme', { theme: 'dark' }, 'theme-1')
    expect(theme).toBe('dark')
    await controller.execute('set_reader_font_size', { size: 'larger' }, 'font-1')
    expect(fontSize).toBe(1.45)
    await controller.execute('set_audiobook_speed', { speed: '1.5x' }, 'speed-1')
    expect(speed).toBe(1.5)
    const history = await controller.execute('get_reading_history', { period: 'yesterday' }, 'history-1')
    expect(history.output.activities).toHaveLength(1)

    await controller.execute('undo_last_tinct_action', {}, 'undo-speed')
    expect(speed).toBe(1)
    controller.resetUndo()
    const emptyUndo = await controller.execute('undo_last_tinct_action', {}, 'new-session')
    expect(emptyUndo.output).toMatchObject({ ok: false, error: 'nothing_to_undo' })
  })

  it('formats tool origin and undo outcome for the visible Lab action log', () => {
    const entry = labVoiceActionEntry('undo_last_tinct_action', {}, 'undo-2', {
      output: { ok: true, undone: 'dark mode', originating_turn: 'theme-1' },
    })
    expect(entry).toMatchObject({
      tool: 'undo_last_tinct_action',
      outcome: 'Undid dark mode',
      originatingTurn: 'theme-1',
      undoResult: 'Undid dark mode',
    })
  })
})
