/**
 * The super-menu's row set and the surface every V2 panel is drawn on.
 *
 * Row order and the absence of a Play row are locked on the reader-chrome
 * canvas: the menu is the other way into the things the top bar does not hold,
 * and Play already sits in the top bar. No section headers, no sub-labels.
 */

export type LabSuperMenuId = 'chat' | 'talk' | 'library' | 'settings' | 'account'

export interface LabSuperMenuRow {
  id: LabSuperMenuId
  label: string
  /** A chevron says the row opens a layer rather than doing something. */
  chevron?: boolean
  /** The rule that separates what is in this book from what is around it. */
  ruleBefore?: boolean
}

/**
 * Five rows. Compare is not one of them (2026-09-19): on the phone it is a
 * swipe away, and on both chromes it is a switch in Reading settings.
 */
export function labSuperMenuRows(_input: { phone?: boolean } = {}): LabSuperMenuRow[] {
  return [
    { id: 'chat', label: 'Chat' },
    { id: 'talk', label: 'Talk' },
    { id: 'library', label: 'Library', ruleBefore: true },
    { id: 'settings', label: 'Reading settings', chevron: true },
    { id: 'account', label: 'Account', chevron: true },
  ]
}

/**
 * The surface. Genuinely see-through: a fill of the paper colour over a blur
 * that lives in the panel, never on the page. The page behind gets only a
 * light dim, so its words stay readable through every panel — the transport
 * and the compare card use the same values.
 */
export const LAB_PANEL_BLUR_PX = 16
/** Fill of the paper colour, on the light palette. */
export const LAB_PANEL_FILL_PAPER = 0.35
/** Night needs more fill for the labels to hold at the same legibility. */
export const LAB_PANEL_FILL_NIGHT = 0.45
/** The top of the panel is denser, so the first row's label never sits on the thinnest part. */
export const LAB_PANEL_TOP_BOOST = 0.09
/** The dim over the page. Light enough that the page is still a page. */
export const LAB_PAGE_DIM_PAPER = 0.08
export const LAB_PAGE_DIM_NIGHT = 0.14

/** Matter: a 56 px icon gutter, 22 px monoline icons, 17 px labels, 52 px rows. */
export const LAB_MENU_GUTTER_PX = 56
export const LAB_MENU_ICON_PX = 22
export const LAB_MENU_LABEL_PX = 17
export const LAB_MENU_ROW_PX = 52
