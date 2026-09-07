/**
 * The four layers of the V2 bottom sheet, and the values they name.
 *
 * Reading settings, Advanced settings, the font picker and Account are one
 * sheet at one height. That is the whole point of them: moving between layers
 * must never resize the window, so the page above stays exactly where it is
 * while a change lands on it.
 */

import {
  LAB_ACCESSIBILITY_FONTS,
  LAB_FONT_LABELS,
  LAB_READING_FONTS,
  type LabFontFamily,
  type LabLineSpacing,
  type LabMargins,
  type LabParagraphSpacing,
  type LabTextAlignment,
  type LabTheme,
} from './labPrefs'

export type LabV2SheetLayer = 'reading' | 'advanced' | 'font' | 'account'

/**
 * One height, in pixels, for every layer. Capped against the viewport so a
 * short window still shows the page above the sheet — the cap applies to all
 * four equally, so they stay the same height as each other.
 */
export const LAB_V2_SHEET_HEIGHT_PX = 452

/** The sheets take more fill than the menu: they carry more, and smaller, type. */
export const LAB_SHEET_FILL_PAPER = 0.46
export const LAB_SHEET_FILL_NIGHT = 0.52

/** Reading settings offers three themes. "Match system" is not one of them. */
export const LAB_V2_THEMES: Array<{ theme: LabTheme; label: string }> = [
  { theme: 'book', label: 'Book' },
  { theme: 'light', label: 'Light' },
  { theme: 'dark', label: 'Dark' },
]

/**
 * Advanced's three sliders. Each is a short ordered scale, so the control is
 * an index into it and the value beside it is that step's name.
 */
export const LAB_LINE_SPACINGS: LabLineSpacing[] = ['compact', 'comfortable', 'open']
export const LAB_PARAGRAPH_SPACINGS: LabParagraphSpacing[] = ['compact', 'standard', 'generous']
export const LAB_MARGIN_STEPS: LabMargins[] = ['narrow', 'medium', 'wide']

/** The line heights these steps actually set on the page, in the canvas's comma decimal. */
const LINE_SPACING_VALUES: Record<LabLineSpacing, string> = {
  compact: '1,34',
  comfortable: '1,48',
  open: '1,62',
}

function titleCase(value: string): string {
  return value[0].toUpperCase() + value.slice(1)
}

export function labLineSpacingValue(value: LabLineSpacing): string {
  return LINE_SPACING_VALUES[value]
}

export function labParagraphSpacingValue(value: LabParagraphSpacing): string {
  return titleCase(value)
}

export function labMarginsValue(value: LabMargins): string {
  return titleCase(value)
}

export function labAlignmentValue(value: LabTextAlignment): string {
  return value === 'justify' ? 'Justified' : 'Left'
}

export function labFontValue(family: LabFontFamily): string {
  return LAB_FONT_LABELS[family]
}

/** A step index that never leaves the scale, whatever a stored value says. */
export function labStepIndex<T>(steps: T[], value: T): number {
  const index = steps.indexOf(value)
  return index < 0 ? Math.floor(steps.length / 2) : index
}

export function labStepAt<T>(steps: T[], index: number): T {
  return steps[Math.max(0, Math.min(steps.length - 1, Math.round(index)))]
}

export interface LabFontPickerGroup {
  /** A small-caps label above the group. The reading faces need none. */
  label?: string
  fonts: LabFontFamily[]
}

/**
 * The picker's groups. Atkinson Hyperlegible sits in its own group under an
 * "Accessibility" label: present as an answer to a need, never presented as a
 * fifth taste.
 */
export const LAB_FONT_PICKER_GROUPS: LabFontPickerGroup[] = [
  { label: 'Reading font', fonts: LAB_READING_FONTS },
  { label: 'Accessibility', fonts: LAB_ACCESSIBILITY_FONTS },
]

export const LAB_V2_SHEET_TITLES: Record<LabV2SheetLayer, string> = {
  reading: 'Reading settings',
  advanced: 'Advanced settings',
  font: 'Font',
  account: 'Account',
}
