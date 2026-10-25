/**
 * The super-menu's row set and the surface every V2 panel is drawn on.
 *
 * Row order and the absence of a Play row are locked on the reader-chrome
 * canvas: the menu is the other way into the things the top bar does not hold,
 * and Play already sits in the top bar. No section headers, no sub-labels.
 */

export type LabSuperMenuId = 'librarian' | 'conversation' | 'chat' | 'talk' | 'summarize' | 'catchup' | 'notebook' | 'text' | 'editions' | 'audio' | 'library' | 'account'

export interface LabSuperMenuRow {
  id: LabSuperMenuId
  label: string
  /** A chevron says the row opens a layer rather than doing something. */
  chevron?: boolean
  /** The rule that separates what is in this book from what is around it. */
  ruleBefore?: boolean
  /**
   * Chat · Talk share one row, with a clearly labelled button for each mode.
   */
  modes?: Array<'chat' | 'talk'>
}

/**
 * The settings groups, one model for every surface (Anders, 22 Oct 2026): the book reader's t menu and sheet
 * (LabSuperMenu.tsx, LabV2Sheet.tsx: `id`, and the sheet layer it opens) and the margin reader's
 * (public/lab/addbook/js/reader.js MENU_LABEL: `frame`). labSuperMenu.test.ts holds reader.js to these names.
 * - Appearance: font, size, alignment, spacing, margins, theme and eligible desktop layouts
 *   (Margin, Two-page, Compare). The desktop margin reader has its own top-bar Aa button.
 * - Book settings: main and compare version, a play's layout, or a PDF's Original pages
 *   (whichever source choices apply to the book).
 * - Audio settings: voice, speed, audiobook version.
 */
export const LAB_SETTINGS_GROUPS = [
  { id: 'text', frame: 'aa', layer: 'reading', label: 'Appearance' },
  { id: 'editions', frame: 'book', layer: 'editions', label: 'Book settings' },
  { id: 'audio', frame: 'audio', layer: 'audio', label: 'Audio settings' },
] as const satisfies ReadonlyArray<{ id: LabSuperMenuId; frame: string; layer: string; label: string }>

/** The reader's highlights, notes and cards: the desktop margin reader's top-bar button, the phone's t menu row. */
export const LAB_NOTEBOOK_LABEL = 'Notebook'

const SETTINGS_ROWS: LabSuperMenuRow[] = LAB_SETTINGS_GROUPS.map((group, index) => ({ id: group.id, label: group.label, chevron: true, ...(index === 0 ? { ruleBefore: true } : {}) }))

/**
 * The phone's t menu (iPhone feedback, 20 Oct 2026; the settings groups of 22 Oct): Chat · Talk on one row;
 * Summarize, Catch me up and Notebook (the Contents' highlights and notes); Aa, Book settings and Audio settings;
 * then Library and Profile. The phone has no top-bar Aa or Notebook, so everything is here.
 */
function phoneRows(privateBook: boolean): LabSuperMenuRow[] {
  return [
    { id: 'conversation', label: '', modes: ['chat', 'talk'] },
    { id: 'summarize', label: 'Summarize' },
    { id: 'catchup', label: 'Catch me up' },
    { id: 'notebook', label: LAB_NOTEBOOK_LABEL },
    ...SETTINGS_ROWS,
    { id: 'library', label: privateBook ? 'Your books' : 'Library', ruleBefore: true },
    { id: 'account', label: 'Profile', chevron: true },
  ]
}

/**
 * Chapter actions (Catch me up, approved 2026-09-30, sits right under
 * Summarize), the settings groups, then library (phone only) and account.
 */
export function labSuperMenuRows({ phone = false, privateBook = false, ownPdf = false, noCatchUp = false, sharedReader = false }: {
  phone?: boolean; privateBook?: boolean; ownPdf?: boolean
  /** Shared source identity; Notebook uses its dedicated desktop button. */
  sharedReader?: boolean
  /** A book's first chapter (or its front matter) on the phone: nothing to catch up on yet. */
  noCatchUp?: boolean
} = {}): LabSuperMenuRow[] {
  const all: LabSuperMenuRow[] = phone ? phoneRows(privateBook) : [
    // Match the phone: two explicit actions, with their existing destinations.
    { id: 'conversation', label: '', modes: ['chat', 'talk'] },
    { id: 'summarize', label: 'Summarize' },
    { id: 'catchup', label: 'Catch me up' },
    ...SETTINGS_ROWS,
    // Desktop has the back arrow at the top left instead of a Library row (2026-10-01).
    { id: 'account', label: 'Profile', chevron: true, ruleBefore: true },
  ]
  const rows = noCatchUp ? all.filter(row => row.id !== 'catchup') : all
  // A reader's own book (userBook/): Chat, Talk and Catch me up as for any
  // book (2026-10-08; its recap is built from this device's text, one chapter
  // at a time). Book settings appears only for separate source choices (PDF
  // Original pages or EPUB Margin source); desktop layout choices stay in Aa
  // even when a book has only one source. Its Audio settings stay.
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
