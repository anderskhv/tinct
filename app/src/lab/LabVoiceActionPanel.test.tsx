// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabVoiceActionPanel } from './LabVoiceActionPanel'

afterEach(cleanup)

describe('LabVoiceActionPanel', () => {
  it('shows visible state, fixture control, tool arguments, origin, and undo outcome', () => {
    const onFixtureEnabled = vi.fn()
    render(
      <LabVoiceActionPanel
        active
        view="reading_history"
        darkMode
        fontSize={1.45}
        audioSpeed={1.5}
        fixtureEnabled
        onFixtureEnabled={onFixtureEnabled}
        actions={[{
          id: 'undo-1',
          tool: 'undo_last_tinct_action',
          arguments: {},
          ok: true,
          outcome: 'Undid audiobook speed change',
          originatingTurn: 'speed-1',
          undoResult: 'Undid audiobook speed change',
        }]}
      />,
    )

    expect(screen.getByTestId('lab-voice-action-state').textContent).toContain('Reading history preview · dark · 1.45rem · 1.5×')
    expect(screen.getByText('undo_last_tinct_action')).toBeTruthy()
    expect(screen.getByText('Undid audiobook speed change')).toBeTruthy()
    expect(screen.getByText('origin speed-1')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lab-voice-history-fixture'))
    expect(onFixtureEnabled).toHaveBeenCalledWith(false)
  })

  it('stays out of production and inactive Lab UI when Talk is closed', () => {
    const { container } = render(
      <LabVoiceActionPanel
        active={false}
        view="read"
        darkMode={false}
        fontSize={1.3}
        audioSpeed={1}
        fixtureEnabled
        onFixtureEnabled={() => {}}
        actions={[]}
      />,
    )
    expect(container.childElementCount).toBe(0)
  })
})
