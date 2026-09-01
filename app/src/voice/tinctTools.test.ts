import { describe, expect, it, vi } from 'vitest'
import { TinctVoiceToolController, type TinctVoiceToolAdapter, type VoiceTinctView } from './tinctTools'

interface ViewState { view: VoiceTinctView }

function setup() {
  let view: VoiceTinctView = 'read'
  let theme: 'light' | 'dark' = 'light'
  let fontSize = 1.3
  let speed = 1
  const adapter: TinctVoiceToolAdapter<ViewState> = {
    getViewSnapshot: () => ({ view }),
    openView: next => { view = next },
    restoreView: snapshot => { view = snapshot.view },
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
      activities: [{ book_title: 'The Odyssey', chapter_title: 'Book 5', excerpt: 'Calypso lets Odysseus go.' }],
    })),
  }
  return {
    controller: new TinctVoiceToolController(adapter),
    state: () => ({ view, theme, fontSize, speed }),
    adapter,
  }
}

describe('TinctVoiceToolController', () => {
  it('changes theme and naturally undoes the originating turn', async () => {
    const { controller, state } = setup()
    const changed = await controller.execute('set_tinct_theme', { theme: 'dark' }, 'turn-theme')
    expect(state().theme).toBe('dark')
    expect(changed.output).toMatchObject({ changed: true, originating_turn: 'turn-theme' })

    const undone = await controller.execute('undo_last_tinct_action', {}, 'turn-undo')
    expect(state().theme).toBe('light')
    expect(undone.output).toMatchObject({ ok: true, originating_turn: 'turn-theme' })
  })

  it('undoes changes in reverse order', async () => {
    const { controller, state } = setup()
    await controller.execute('open_tinct_view', { view: 'library' }, 'turn-library')
    await controller.execute('set_reader_font_size', { size: 'larger' }, 'turn-font')
    expect(state()).toMatchObject({ view: 'library', fontSize: 1.45 })

    await controller.execute('undo_last_tinct_action', {}, 'undo-font')
    expect(state()).toMatchObject({ view: 'library', fontSize: 1.3 })
    await controller.execute('undo_last_tinct_action', {}, 'undo-view')
    expect(state().view).toBe('read')
  })

  it('moves audiobook speed by supported steps and can put it back', async () => {
    const { controller, state } = setup()
    await controller.execute('set_audiobook_speed', { speed: 'faster' }, 'turn-speed')
    expect(state().speed).toBe(1.25)
    await controller.execute('undo_last_tinct_action', {}, 'turn-undo')
    expect(state().speed).toBe(1)
  })

  it('returns reading history with recap instructions', async () => {
    const { controller, adapter } = setup()
    const result = await controller.execute('get_reading_history', { period: 'yesterday', book_query: 'Odyssey' }, 'turn-history')
    expect(adapter.getReadingHistory).toHaveBeenCalledWith('yesterday', 'Odyssey')
    expect(result.output).toMatchObject({ ok: true, period: 'yesterday' })
    expect(result.responseInstructions).toContain('5–15 second recap')
  })

  it('does not invent an undo entry when a setting was already active', async () => {
    const { controller } = setup()
    const unchanged = await controller.execute('set_tinct_theme', { theme: 'light' }, 'turn-theme')
    expect(unchanged.output).toMatchObject({ changed: false, undo_available: false })
    const undo = await controller.execute('undo_last_tinct_action', {}, 'turn-undo')
    expect(undo.output).toMatchObject({ ok: false, error: 'nothing_to_undo' })
  })

  it('clears undo history when a new voice session starts', async () => {
    const { controller } = setup()
    await controller.execute('set_tinct_theme', { theme: 'dark' }, 'turn-theme')
    controller.resetUndo()
    const undo = await controller.execute('undo_last_tinct_action', {}, 'turn-undo')
    expect(undo.output).toMatchObject({ ok: false, error: 'nothing_to_undo' })
  })
})
