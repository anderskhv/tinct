/**
 * The super-menu's row set and the surface every V2 panel is drawn on.
 *
 * Row order and the absence of a Play row are locked on the reader-chrome
 * canvas: the menu is the other way into the things the top bar does not hold,
 * and Play already sits in the top bar. No section headers, no sub-labels.
 */

export type LabSuperMenuId = 'librarian' | 'conversation' | 'chat' | 'talk' | 'summarize' | 'catchup' | 'text' | 'editions' | 'audio' | 'library' | 'account'

export interface LabSuperMenuRow {
  id: LabSuperMenuId
  label: string
  /** A chevron says the row opens a layer rather than doing something. */
  chevron?: boolean
  /** The rule that separates what is in this book from what is around it. */
  ruleBefore?: boolean
  /**
   * The Librarian row (desktop) and the phone's Chat · Talk row: the modes it
   * offers. On the desktop they are icons beside the row's body (which opens
   * the reader's default mode); on the phone they are the row's two halves.
   */
  modes?: Array<'chat' | 'talk'>
}

/**
 * The three settings groups, named and filled the same on every platform (Anders, 22 Oct 2026): Aa (themes,
 * size and Advanced settings: font, alignment, spacing, margins), Book settings (main and compare version,
 * Show compare, Margin, a play's layout, offline) and Audio settings (audiobook version, voice, speed).
 */
const SETTINGS_ROWS: LabSuperMenuRow[] = [
  { id: 'text', label: 'Aa', chevron: true, ruleBefore: true },
  { id: 'editions', label: 'Book settings', chevron: true },
  { id: 'audio', label: 'Audio settings', chevron: true },
]

/**
 * The phone's t menu (iPhone feedback, 20 Oct 2026; the settings groups of 22 Oct): Chat · Talk on one row;
 * Summarize and Catch me up; Aa, Book settings and Audio settings; then Library and Profile.
 */
function phoneRows(privateBook: boolean): LabSuperMenuRow[] {
  return [
    { id: 'conversation', label: '', modes: ['chat', 'talk'] },
    { id: 'summarize', label: 'Summarize' },
    { id: 'catchup', label: 'Catch me up' },
    ...SETTINGS_ROWS,
    { id: 'library', label: privateBook ? 'Your books' : 'Library', ruleBefore: true },
    { id: 'account', label: 'Profile', chevron: true },
  ]
}

/**
 * Chapter actions (Catch me up, approved 2026-09-30, sits right under
 * Summarize), the settings groups, then library (phone only) and account.
 */
export function labSuperMenuRows({ phone = false, privateBook = false, ownPdf = false, noCatchUp = false }: {
  phone?: boolean; privateBook?: boolean; ownPdf?: boolean
  /** A book's first chapter (or its front matter) on the phone: nothing to catch up on yet. */
  noCatchUp?: boolean
} = {}): LabSuperMenuRow[] {
  const all: LabSuperMenuRow[] = phone ? phoneRows(privateBook) : [
    // One row for both conversations (Anders, 2026-10-07): always here, so
    // the only way to the librarian since the margin tab went (2026-10-08).
    { id: 'librarian', label: 'Librarian', modes: ['chat', 'talk'] },
    { id: 'summarize', label: 'Summarize' },
    { id: 'catchup', label: 'Catch me up' },
    ...SETTINGS_ROWS,
    // Desktop has the back arrow at the top left instead of a Library row (2026-10-01).
    { id: 'account', label: 'Profile', chevron: true, ruleBefore: true },
  ]
  const rows = noCatchUp ? all.filter(row => row.id !== 'catchup') : all
  // A reader's own book (userBook/): Chat, Talk and Catch me up as for any
  // book (2026-10-08; its recap is built from this device's text, one chapter
  // at a time), but one edition, so no Book settings, except a PDF's: its
  // Tinct text and its Original pages (2026-10-09). Its Audio settings stay.
  return privateBook ? rows.filter(row => !USER_BOOK_HIDDEN_ROWS.has(row.id) || (ownPdf && row.id === 'editions')) : rows
}

const USER_BOOK_HIDDEN_ROWS = new Set<LabSuperMenuId>(['editions'])

/**
 * The surface. Genuinely see-through: a fill of the paper colour over a blur
 * that lives in the panel, never on the page. The page behind gets only a
 * light dim. The fill keeps labels readable even without blur — the transport
 * and the compare card use the same values.
 */
export const LAB_PANEL_BLUR_PX = 16
/** Fill of the paper colour, on the light palette. */
export const LAB_PANEL_FILL_PAPER = 0.86
/** Night needs more fill for the labels to hold at the same legibility. */
export const LAB_PANEL_FILL_NIGHT = 0.88
/** The top of the panel is denser, so the first row's label never sits on the thinnest part. */
export const LAB_PANEL_TOP_BOOST = 0.06
/** The dim over the page. Light enough that the page is still a page. */
export const LAB_PAGE_DIM_PAPER = 0.08
export const LAB_PAGE_DIM_NIGHT = 0.14

/** Matter: a 40 px icon gutter, 18 px monoline icons, 16 px labels, 44 px rows. */
export const LAB_MENU_GUTTER_PX = 40
export const LAB_MENU_ICON_PX = 18
export const LAB_MENU_LABEL_PX = 16
export const LAB_MENU_ROW_PX = 44
