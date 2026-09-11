// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { LAB_ACCESSIBILITY_FONTS, LAB_PREFS_KEY, LAB_READING_FONTS, readLabPrefs } from './labPrefs'
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

afterEach(() => {
  cleanup()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

function openReading() {
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-settings'))
  return screen.getByTestId('lab-v2-sheet')
}

function openSheet() {
  render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={fallbackLabSource()} authToken={null} />)
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

    const compare = screen.getByTestId('lab-v2-compare-edition') as HTMLSelectElement
    const other = [...compare.options].map(option => option.value).find(value => value !== compare.value)!
    fireEvent.change(compare, { target: { value: other } })
    expect(readLabPrefs().compareEdition).toBe(other)

    const before = readLabPrefs().compareOpen
    fireEvent.click(screen.getByTestId('lab-v2-show-compare'))
    expect(readLabPrefs().compareOpen).toBe(!before)
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

  it('moves each scale a step at a time and names the step it lands on', () => {
    openSheet()
    fireEvent.click(screen.getByTestId('lab-v2-advanced'))
    fireEvent.change(screen.getByTestId('lab-v2-line-spacing'), { target: { value: '2' } })
    expect(readLabPrefs().lineSpacing).toBe('open')
    expect(screen.getByTestId('lab-v2-sheet').textContent).toContain(labLineSpacingValue('open'))

    fireEvent.change(screen.getByTestId('lab-v2-margins'), { target: { value: '0' } })
    expect(readLabPrefs().margins).toBe('narrow')
    expect(screen.getByTestId('lab-v2-sheet').textContent).toContain(labMarginsValue('narrow'))

    fireEvent.change(screen.getByTestId('lab-v2-paragraph-spacing'), { target: { value: '2' } })
    expect(readLabPrefs().paragraphSpacing).toBe('generous')
    expect(screen.getByTestId('lab-v2-sheet').textContent).toContain(labParagraphSpacingValue('generous'))

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
  it('opens on the same sheet, and its last row sits on the rows above it', () => {
    render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={fallbackLabSource()} authToken={null} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-account'))
    expect(layer()).toBe('account')
    expect(screen.getByTestId('lab-v2-account-card')).toBeTruthy()
    // Signed out there is no password to reset; the row that remains is the
    // sign-in one, and it is a `lab-v2-row` like every row above it — which
    // is the whole of the alignment fix.
    const link = screen.getByTestId('lab-v2-account-sign-in')
    expect(link.classList.contains('lab-v2-row')).toBe(true)
  })
})
