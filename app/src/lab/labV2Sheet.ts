/**
 * The four layers of the V2 bottom sheet, and the values they name.
 *
 * Aa, Book settings, Audio settings, Advanced settings, the font picker and
 * Account are one sheet at one height. That is the whole point of them: moving between layers
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
  type LabPrefs,
  type LabTheme,
} from './labPrefs'
import { defaultCompareEditionKey } from '../data/editionDefaults'
import { LAB_SETTINGS_GROUPS } from './labSuperMenu'
import type { Edition } from '../types'

export type LabV2SheetLayer = 'reading' | 'advanced' | 'font' | 'account' | 'editions' | 'audio' | 'mainEdition' | 'audioEdition' | 'compareEdition' | 'catchup'

/**
 * One height, in pixels, for every layer. Capped against the viewport so a
 * short window still shows the page above the sheet — the cap applies to all
 * four equally, so they stay the same height as each other.
 */
export const LAB_V2_SHEET_HEIGHT_PX = 452

/** The sheets take more fill than the menu: they carry more, and smaller, type. */
export const LAB_SHEET_FILL_PAPER = 0.9
export const LAB_SHEET_FILL_NIGHT = 0.9

/** Aa offers three themes. "Match system" is not one of them. */
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
  return typeof value === 'number' ? value.toFixed(2).replace('.', ',') : LINE_SPACING_VALUES[value]
}

export function labParagraphSpacingValue(value: LabParagraphSpacing): string {
  return typeof value === 'number' ? value.toFixed(2).replace('.', ',') : titleCase(value)
}

export function labMarginsValue(value: LabMargins): string {
  return typeof value === 'number' ? value.toFixed(2).replace('.', ',') : titleCase(value)
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

const groupTitle = (layer: 'reading' | 'editions' | 'audio') => LAB_SETTINGS_GROUPS.find(group => group.layer === layer)!.label

/**
 * The settings groups (Anders, 22 Oct 2026), named by the one model (labSuperMenu.ts LAB_SETTINGS_GROUPS): Aa
 * ('reading': the themes, size and Advanced settings), Book settings ('editions') and Audio settings ('audio').
 */
export const LAB_V2_SHEET_TITLES: Record<LabV2SheetLayer, string> = {
  reading: groupTitle('reading'),
  editions: groupTitle('editions'),
  audio: groupTitle('audio'),
  mainEdition: 'Main version',
  audioEdition: 'Audiobook version',
  compareEdition: 'Compare version',
  advanced: 'Advanced settings',
  font: 'Font',
  account: 'Account',
  catchup: 'Catch me up',
}

export function labV2SheetTitle(layer: LabV2SheetLayer): string {
  return LAB_V2_SHEET_TITLES[layer]
}

/**
 * How long the version pill stays: in over 120ms, held to the second, out
 * over the last 300ms. Reduced motion shows it without the fade for the same
 * time. The CSS animation and the clock that removes the element agree.
 */
export const LAB_V2_VERSION_PILL_MS = 2600

/**
 * Prefs after the reader picks a new main edition. When the new main is the
 * edition Compare was showing, Compare pairs with another edition rather than
 * turning off: with one other edition the two swap, otherwise the book's
 * paired default, else the previous main. A Compare the reader turned off
 * (None) stays off.
 */
export function labPrefsForMainEdition(
  prefs: LabPrefs,
  key: string,
  bookId: string,
  editions: readonly Pick<Edition, 'key' | 'style' | 'language'>[],
  year?: number | null,
): LabPrefs {
  if (prefs.compareEdition !== key) return { ...prefs, primaryEdition: key }
  if (prefs.compareChosen && !prefs.compareOpen) return { ...prefs, primaryEdition: key, compareOpen: false }
  const others = editions.filter(edition => edition.key !== key)
  const previous = others.find(edition => edition.key === prefs.primaryEdition)?.key
  const pair = others.length === 1
    ? others[0].key
    : defaultCompareEditionKey(bookId, others, key, year) ?? previous ?? others[0]?.key
  if (!pair) return { ...prefs, primaryEdition: key, compareOpen: false }
  return { ...prefs, primaryEdition: key, compareEdition: pair, compareOpen: prefs.compareOpen }
}
