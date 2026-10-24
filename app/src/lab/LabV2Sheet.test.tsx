// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
const accountCards = vi.hoisted(() => ({ open: vi.fn(async (_options: { start?: string }) => true) }))
vi.mock('../cards/openCards', async importOriginal => ({ ...await importOriginal<typeof import('../cards/openCards')>(), openAccountCards: accountCards.open }))
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { THE_HISTORIES } from '../data/bookRegistry'
import { DEFAULT_LAB_PREFS, writeLabPrefs, LAB_ACCESSIBILITY_FONTS, LAB_PREFS_KEY, LAB_READING_FONTS, readLabPrefs } from './labPrefs'
import {
  LAB_V2_SHEET_HEIGHT_PX,
  LAB_V2_THEMES,
  labAlignmentValue,
  labLineSpacingValue,
  labMarginsValue,
  labParagraphSpacingValue,
  labStepAt,
  labStepIndex,
} from './labV2Sheet'

// Talk's session code and the account cards load on demand in the reader
// (first use). Loaded here up front so a busy machine's first transform of
// those modules is not counted against a waitFor below.
beforeAll(async () => {
  await import('../cards/openCards')
})

afterEach(() => {
  cleanup()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

/** The t menu's Aa row: the settings layer (themes, size, Advanced settings). */
function openReading() {
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-text'))
  return screen.getByTestId('lab-v2-sheet')
}

function openSheet() {
  render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
  return openReading()
}

const layer = () => screen.getByTestId('lab-v2-sheet').getAttribute('data-layer')

describe('the sheet', () => {
  it('is one box at one height, whatever layer is showing', () => {
    const sheet = openSheet()
    // Layers are a state of one element, not four elements: switching cannot
    // resize the window because there is nothing else to resize to.
    expect(layer()).toBe('reading')
    fireEvent.click(screen.getByTestId('lab-v2-advanced'))
    expect(layer()).toBe('advanced')
    expect(screen.getAllByTestId('lab-v2-sheet')).toHaveLength(1)
    expect(screen.getByTestId('lab-v2-sheet')).toBe(sheet)
    fireEvent.click(screen.getByTestId('lab-v2-font-row'))
    expect(layer()).toBe('font')
    expect(screen.getByTestId('lab-v2-sheet')).toBe(sheet)
    fireEvent.click(screen.getByTestId('lab-v2-sheet-back'))
    expect(layer()).toBe('advanced')
    // Advanced settings returns to Aa rather than closing the sheet.
    fireEvent.click(screen.getByTestId('lab-v2-sheet-back'))
    expect(layer()).toBe('reading')
    expect(screen.getByTestId('lab-v2-sheet')).toBe(sheet)
    expect(LAB_V2_SHEET_HEIGHT_PX).toBe(452)
  })

  it('closes from the ×, the confirm and the page behind', () => {
    openSheet()
    fireEvent.click(screen.getByTestId('lab-v2-sheet-close'))
    expect(screen.queryByTestId('lab-v2-sheet')).toBeNull()

    openReading()
    fireEvent.click(screen.getByTestId('lab-v2-sheet-scrim'))
    expect(screen.queryByTestId('lab-v2-sheet')).toBeNull()

    openReading()
    fireEvent.click(screen.getByTestId('lab-v2-advanced'))
    fireEvent.click(screen.getByTestId('lab-v2-sheet-confirm'))
    expect(screen.queryByTestId('lab-v2-sheet')).toBeNull()
  })
})

describe('reading settings', () => {
  it('offers Book, Light and Dark — and no pill row across the top', () => {
    openSheet()
    for (const { theme } of LAB_V2_THEMES) expect(screen.getByTestId(`lab-v2-theme-${theme}`)).toBeTruthy()
    expect(screen.queryByTestId('lab-v2-theme-system')).toBeNull()
    expect(LAB_V2_THEMES.map(entry => entry.theme)).toEqual(['book', 'light', 'dark'])
    // The head carries the title and the ×, and nothing else.
    expect(screen.getByTestId('lab-v2-sheet').querySelectorAll('.lab-v2-head button')).toHaveLength(1)
  })

  it('writes a theme, a size and the two editions straight through to the store', () => {
    openSheet()
    fireEvent.click(screen.getByTestId('lab-v2-theme-dark'))
    expect(readLabPrefs().theme).toBe('dark')

    fireEvent.change(screen.getByTestId('lab-v2-size'), { target: { value: '1.8' } })
    expect(readLabPrefs().fontSize).toBeCloseTo(1.8)

    expect(screen.queryByTestId('lab-v2-main-edition')).toBeNull()
    // The voice and speed are Audio settings', the editions Book settings'.
    expect(screen.queryByTestId('lab-v2-narration-voice')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-v2-sheet-close'))
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-audio'))
    fireEvent.change(screen.getByTestId('lab-v2-narration-voice'), { target: { value: 'male' } })
    expect(readLabPrefs().voicePersona).toBe('male')
    fireEvent.change(screen.getByTestId('lab-v2-audio-speed'), { target: { value: '1.25' } })
    expect(readLabPrefs().audioSpeed).toBe(1.25)
    expect(screen.queryByTestId('lab-v2-compare-edition')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-v2-sheet-close'))
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-editions'))
    expect(screen.queryByTestId('lab-v2-narration-voice')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-v2-compare-edition'))
    const option = screen.getByTestId('lab-v2-sheet').querySelector<HTMLButtonElement>('[data-edition]')!
    const other = option.dataset.edition
    fireEvent.click(option)
    expect(readLabPrefs().compareEdition).toBe(other)
    expect(readLabPrefs().compareOpen).toBe(true)
    fireEvent.click(screen.getByTestId('lab-v2-compare-edition'))
    fireEvent.click(screen.getByRole('button', { name: 'None' }))
    expect(readLabPrefs().compareOpen).toBe(false)
    expect(localStorage.getItem(LAB_PREFS_KEY)).toBeTruthy()
  })
})

describe('advanced settings', () => {
  it('holds font, alignment, line spacing, paragraph spacing and margins — and nothing else', () => {
    openSheet()
    fireEvent.click(screen.getByTestId('lab-v2-advanced'))
    for (const id of ['lab-v2-font-row', 'lab-v2-alignment', 'lab-v2-line-spacing', 'lab-v2-paragraph-spacing', 'lab-v2-margins']) {
      expect(screen.getByTestId(id)).toBeTruthy()
    }
    // Character and word spacing are cut, and there is no preview block.
    const body = screen.getByTestId('lab-v2-sheet').textContent ?? ''
    expect(body).not.toMatch(/character spacing/i)
    expect(body).not.toMatch(/word spacing/i)
    expect(screen.getByTestId('lab-v2-sheet').querySelector('.lab-passage')).toBeNull()
  })

  it('accepts continuous spacing, decimal commas, and bounded numeric values', () => {
    openSheet()
    fireEvent.click(screen.getByTestId('lab-v2-advanced'))
    fireEvent.change(screen.getByTestId('lab-v2-line-spacing'), { target: { value: '1.57' } })
    expect(readLabPrefs().lineSpacing).toBe(1.57)
    const lineValue = screen.getByRole('textbox', { name: 'Line spacing value' })
    fireEvent.change(lineValue, { target: { value: '1,63' } })
    fireEvent.blur(lineValue)
    expect(readLabPrefs().lineSpacing).toBe(1.63)
    fireEvent.change(lineValue, { target: { value: '99' } })
    fireEvent.blur(lineValue)
    expect(readLabPrefs().lineSpacing).toBe(1.9)
    fireEvent.change(screen.getByTestId('lab-v2-margins'), { target: { value: '0.85' } })
    expect(readLabPrefs().margins).toBe(0.85)
    fireEvent.change(screen.getByTestId('lab-v2-paragraph-spacing'), { target: { value: '0.42' } })
    expect(readLabPrefs().paragraphSpacing).toBe(0.42)
    fireEvent.change(screen.getByTestId('lab-v2-alignment'), { target: { value: 'left' } })
    expect(readLabPrefs().alignment).toBe('left')
    expect(screen.getByTestId('lab-v2-sheet').textContent).toContain(labAlignmentValue('left'))
  })

  it('never leaves a scale, whatever value it is handed', () => {
    const steps = ['a', 'b', 'c']
    expect(labStepIndex(steps, 'c')).toBe(2)
    expect(labStepIndex(steps, 'nope')).toBe(1)
    expect(labStepAt(steps, -4)).toBe('a')
    expect(labStepAt(steps, 99)).toBe('c')
  })
})

describe('the font picker', () => {
  it('sets every name in its own face, Atkinson under Accessibility', () => {
    openSheet()
    fireEvent.click(screen.getByTestId('lab-v2-advanced'))
    fireEvent.click(screen.getByTestId('lab-v2-font-row'))
    for (const family of [...LAB_READING_FONTS, ...LAB_ACCESSIBILITY_FONTS]) {
      const row = screen.getByTestId(`lab-v2-font-${family}`)
      expect(row.querySelector('.lab-v2-font-name')!.getAttribute('style')).toContain('font-family')
    }
    const groups = [...screen.getByTestId('lab-v2-sheet').querySelectorAll('.lab-v2-group-label')]
      .map(node => node.textContent)
    expect(groups).toEqual(['Reading font', 'Accessibility'])
    // Atkinson is not one of the four reading faces.
    const reading = screen.getByTestId('lab-v2-sheet').querySelectorAll('.lab-v2-group')[0]
    expect(reading.querySelector('[data-testid="lab-v2-font-atkinson"]')).toBeNull()
  })

  it('starts checked on Literata and moves the check with the pick', () => {
    openSheet()
    fireEvent.click(screen.getByTestId('lab-v2-advanced'))
    expect(screen.getByTestId('lab-v2-font-row').textContent).toContain('Literata')
    fireEvent.click(screen.getByTestId('lab-v2-font-row'))
    expect(screen.getByTestId('lab-v2-font-literata').getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(screen.getByTestId('lab-v2-font-atkinson'))
    expect(readLabPrefs().fontFamily).toBe('atkinson')
    expect(screen.getByTestId('lab-v2-font-atkinson').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('lab-v2-font-literata').getAttribute('aria-pressed')).toBe('false')
    // And it reaches the page, not just the picker.
    expect(screen.getByTestId('lab-root').getAttribute('style')).toContain('Atkinson Hyperlegible')
  })
})

describe('account', () => {
  it('is the account cards now: the sheet stays closed and the cards open over the reader', async () => {
    accountCards.open.mockClear()
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-account'))
    expect(screen.queryByTestId('lab-v2-sheet')).toBeNull()
    await waitFor(() => expect(accountCards.open).toHaveBeenCalledTimes(1))
  })
})

it('makes audiobook following an explicit setting in the current reader menu', () => {
  openSheet()
  fireEvent.click(screen.getByTestId('lab-v2-sheet-close'))
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-audio'))
  fireEvent.click(screen.getByTestId('lab-v2-audio-edition'))
  expect(screen.getByRole('button', { name: 'Follow main version' }).getAttribute('aria-pressed')).toBe('true')
})

it('restores a non-Bible audiobook before opening reader settings', () => {
  writeLabPrefs({ ...DEFAULT_LAB_PREFS, primaryEdition: 'modern-en', audioEdition: 'original-en', audioFollowsPrimary: false }, 'phone')
  render(<LabApp pathname="/lab/phone" source={{ ...fallbackLabSource(), bookId: 'the-histories', bookTitle: 'The Histories', editions: THE_HISTORIES.editions }} authToken={null} />)
  openReading()
  fireEvent.click(screen.getByTestId('lab-v2-sheet-close'))
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-editions'))
  expect(screen.getByTestId('lab-v2-main-edition').textContent).toContain('Tinct Modern English')
  fireEvent.click(screen.getByTestId('lab-v2-sheet-close'))
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-audio'))
  fireEvent.click(screen.getByTestId('lab-v2-audio-edition'))
  expect(screen.getByTestId('lab-v2-sheet').querySelector('[data-edition="original-en"]')?.getAttribute('aria-pressed')).toBe('true')
  // The audiobook picker goes back to Audio settings, not Book settings.
  fireEvent.click(screen.getByTestId('lab-v2-sheet-back'))
  expect(screen.getByTestId('lab-v2-sheet').getAttribute('aria-label')).toBe('Audio settings')
})

describe('the settings groups (22 Oct 2026): the same on the phone and the desktop', () => {
  it('Book settings: editions, then offline; Audio settings: audiobook version, voice, speed; a reader’s own book: voice and speed only', async () => {
    const { LabV2Sheet } = await import('./LabV2Sheet.tsx')
    const base = { bookId: THE_HISTORIES.id, onLayer: () => {}, onClose: () => {}, prefs: DEFAULT_LAB_PREFS, onPrefs: () => {}, editions: THE_HISTORIES.editions }
    const labels = () => [...screen.getByTestId('lab-v2-sheet').querySelectorAll('.lab-v2-row-label')].map(node => node.textContent)
    let view = render(<LabV2Sheet {...base} layer="editions" />)
    expect(screen.getByTestId('lab-v2-sheet').getAttribute('aria-label')).toBe('Book settings')
    expect(screen.getByRole('heading').textContent).toBe('Book settings')
    expect(labels().slice(0, 2)).toEqual(['Main version', 'Compare version'])
    expect(labels()).not.toContain('Voice')
    expect(labels()).not.toContain('Audiobook version')
    view.unmount()
    view = render(<LabV2Sheet {...base} layer="audio" />)
    expect(screen.getByTestId('lab-v2-sheet').getAttribute('aria-label')).toBe('Audio settings')
    expect(screen.getByRole('heading').textContent).toBe('Audio settings')
    expect(labels()).toEqual(['Audiobook version', 'Voice', 'Speed'])
    view.unmount()
    view = render(<LabV2Sheet {...base} layer="reading" />)
    expect(screen.getByTestId('lab-v2-sheet').getAttribute('aria-label')).toBe('Appearance')
    expect(screen.getByRole('heading').textContent).toBe('Appearance')
    expect(screen.queryByTestId('lab-v2-narration-voice')).toBeNull()
    expect(screen.queryByTestId('lab-v2-main-edition')).toBeNull()
    view.unmount()
    render(<LabV2Sheet {...base} bookId="user-0123456789abcdef01234567" editionRows={false} layer="audio" />)
    expect(screen.queryByTestId('lab-v2-audio-edition')).toBeNull()
    expect(labels()).toEqual(['Voice', 'Speed'])
  })

  it('a play’s layout is a Book setting, not an Advanced one', async () => {
    const { LabV2Sheet } = await import('./LabV2Sheet.tsx')
    const base = { bookId: THE_HISTORIES.id, onLayer: () => {}, onClose: () => {}, prefs: DEFAULT_LAB_PREFS, onPrefs: () => {}, editions: THE_HISTORIES.editions, phoneShakespeare: true }
    const view = render(<LabV2Sheet {...base} layer="advanced" />)
    expect(screen.queryByLabelText('Shakespeare layout')).toBeNull()
    view.unmount()
    render(<LabV2Sheet {...base} layer="editions" />)
    expect(screen.getByLabelText('Shakespeare layout')).toBeTruthy()
  })
})
