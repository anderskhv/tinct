// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabV2Sheet } from './LabV2Sheet.tsx'
import { DEFAULT_LAB_PREFS, type LabPrefs } from './labPrefs'
import type { NarrationPilotInfo } from './labNarration'

afterEach(cleanup)

const grok: NarrationPilotInfo = {
  enabled: true,
  provider: 'grok',
  voices: [
    { key: 'f', label: 'Ara', persona: 'female' },
    { key: 'm', label: 'Helios', persona: 'male' },
    { key: 'orion', label: 'Orion', persona: 'male' },
    { key: 'eve', label: 'Eve', persona: 'female' },
  ],
}

function sheet(prefs: LabPrefs, voice: string, onAccountVoice?: () => void) {
  const onPrefs = vi.fn()
  render(<LabV2Sheet layer="audio" onLayer={vi.fn()} onClose={vi.fn()} prefs={prefs} onPrefs={onPrefs}
    editions={[]} narrationPilot={{ info: grok, voice }} onAccountVoice={onAccountVoice} />)
  return { onPrefs, select: screen.getByTestId('lab-v2-narration-voice') as HTMLSelectElement }
}

describe('voice row for a signed-out reader', () => {
  it('asks for an account for Orion and Eve and leaves the stored voice alone', () => {
    const onAccountVoice = vi.fn()
    const { onPrefs, select } = sheet(DEFAULT_LAB_PREFS, 'm', onAccountVoice)
    for (const value of ['orion', 'eve']) fireEvent.change(select, { target: { value } })
    expect(onAccountVoice).toHaveBeenCalledTimes(2)
    expect(onPrefs).not.toHaveBeenCalled()
    fireEvent.change(select, { target: { value: 'female' } })
    expect(onPrefs).toHaveBeenCalledWith(expect.objectContaining({ voicePersona: 'female', audiobookVoice: null }))
  })

  it('shows the voice a guest actually hears, not a stored Orion or Eve', () => {
    const { select } = sheet({ ...DEFAULT_LAB_PREFS, voicePersona: 'female', audiobookVoice: 'orion', voicePersonaChosen: true }, 'm', vi.fn())
    expect(select.value).toBe('male')
    expect(select.closest('.lab-v2-row')?.querySelector('.lab-v2-value')?.textContent).toContain('Helios · Male')
  })

  it('keeps Orion and Eve selectable when signed in', () => {
    const { onPrefs, select } = sheet({ ...DEFAULT_LAB_PREFS, audiobookVoice: 'eve' }, 'eve')
    expect(select.value).toBe('eve')
    fireEvent.change(select, { target: { value: 'orion' } })
    expect(onPrefs).toHaveBeenCalledWith(expect.objectContaining({ audiobookVoice: 'orion', voicePersonaChosen: true }))
  })
})
