import type { LabLibrarianTabDock, LabLibrarianTabMode, LabLibrarianTabPrefs, LabMargins } from './labPrefs'
import { labMarginScale } from './labPrefs'

/**
 * The librarian tab: a small pull tab flush against the reader's edge, in the
 * page margin (approved 2026-10-07; mock: librarian-dot study G "Margin tab").
 *
 * Geometry is pure so the one promise that matters can be tested at every
 * margin: the tab never reaches the text. It is as wide as the margin allows,
 * keeping at least 5px of paper before the text, between 12 and 18px.
 */

/** Paper kept between the tab and the text. */
export const LIBRARIAN_TAB_GAP = 5
export const LIBRARIAN_TAB_MIN_WIDTH = 12
export const LIBRARIAN_TAB_MAX_WIDTH = 18
export const LIBRARIAN_TAB_HEIGHT = 40
/** The first-run peek: the tab stretches along the edge to this height. */
export const LIBRARIAN_TAB_PEEK_HEIGHT = 60
export const LIBRARIAN_TAB_PEEK_MS = 1000
export const LIBRARIAN_TAB_PEEK_DELAY_MS = 700
/** The invisible tap band around the tab. */
export const LIBRARIAN_TAB_BAND_WIDTH = 40
export const LIBRARIAN_TAB_BAND_MIN_HEIGHT = 44
export const LIBRARIAN_TAB_LONG_PRESS_MS = 450
/** Movement beyond this is a drag, not a tap. */
export const LIBRARIAN_TAB_TAP_SLOP = 6
/** Pulled this far from the edge, the tab lets go and becomes the orb. */
export const LIBRARIAN_TAB_RELEASE = 56
/** The share of a pull the docked tab follows: the edge holds on to it. */
export const LIBRARIAN_TAB_STICK = 0.38
/** Brought this close to either edge, the orb is taken back. */
export const LIBRARIAN_TAB_CATCH = 26
export const LIBRARIAN_TAB_ORB = 46
export const LIBRARIAN_TAB_UNDO_MS = 6000
/** The hide target, bottom centre while dragging. */
export const LIBRARIAN_TAB_TARGET = 52
export const LIBRARIAN_TAB_TARGET_BOTTOM = 34
export const LIBRARIAN_TAB_TARGET_CATCH = 44
/** The seen-once key for the first-run peek. */
export const LIBRARIAN_TAB_PEEK_SEEN = 'librarian-tab-peek'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

/**
 * The visible width of the tab for a margin of `margin` px, or null when the
 * margin is too narrow to hold even the smallest tab without touching text.
 */
export function librarianTabWidth(margin: number): number | null {
  if (!Number.isFinite(margin) || margin < LIBRARIAN_TAB_MIN_WIDTH + 1) return null
  return Math.min(margin - 1, clamp(margin - LIBRARIAN_TAB_GAP, LIBRARIAN_TAB_MIN_WIDTH, LIBRARIAN_TAB_MAX_WIDTH))
}

/** The icon inside the tab: never wider than the tab leaves room for. */
export function librarianTabIconSize(width: number): number {
  return Math.max(6, Math.min(12, width - 3))
}

/**
 * The phone reader's side margin in px, as `--lab-reader-margin` sets it in
 * LabApp (1.1 / 1.55 / 2.2rem, or 1.55rem × a numeric scale).
 */
export function labPhoneReaderMargin(margins: LabMargins, rootFontPx = 16): number {
  const rem = typeof margins === 'number' ? 1.55 * margins : margins === 'narrow' ? 1.1 : margins === 'wide' ? 2.2 : 1.55
  return rem * rootFontPx
}

/**
 * The desktop leaf's side padding in px, as `--desktop-pad-x` sets it in
 * lab.css: clamp(28px, 3vw, 64px) × scale, or 24px × scale up to 1100px wide.
 */
export function labDesktopReaderMargin(margins: LabMargins, viewportWidth: number): number {
  const scale = labMarginScale(margins)
  if (viewportWidth <= 1100) return 24 * scale
  return clamp(viewportWidth * 0.03, 28, 64) * scale
}

export interface LibrarianTabFrame {
  /** The reading surface the tab docks against, viewport px. */
  left: number
  right: number
  top: number
  bottom: number
  /** Paper between that edge and the text on each side, px. */
  marginLeft: number
  marginRight: number
}

export interface LibrarianTabRect { left: number; top: number; width: number; height: number }

/** The vertical range the tab's centre may take: clear of the frame's ends. */
export function librarianTabYRange(frame: LibrarianTabFrame, height = LIBRARIAN_TAB_HEIGHT): [number, number] {
  const pad = Math.max(LIBRARIAN_TAB_BAND_MIN_HEIGHT, height) / 2 + 8
  const min = frame.top + pad
  const max = frame.bottom - pad
  return max >= min ? [min, max] : [(frame.top + frame.bottom) / 2, (frame.top + frame.bottom) / 2]
}

/**
 * Keep the tab's centre out of vertical zones on its edge that something else
 * owns (the desktop page-turn buttons), moving it to the nearer side.
 */
export function librarianTabAvoid(y: number, zones: Array<[number, number]>, range: [number, number]): number {
  let next = clamp(y, range[0], range[1])
  for (const [from, to] of zones) {
    if (next <= from || next >= to) continue
    const up = from
    const down = to
    const prefer = next - from < to - next ? up : down
    const other = prefer === up ? down : up
    next = prefer >= range[0] && prefer <= range[1] ? prefer : clamp(other, range[0], range[1])
  }
  return next
}

/** The visible tab, docked: flush against the edge, never into the text. */
export function librarianTabRect(
  frame: LibrarianTabFrame,
  dock: LabLibrarianTabDock,
  height = LIBRARIAN_TAB_HEIGHT,
): LibrarianTabRect | null {
  const width = librarianTabWidth(dock.side === 'right' ? frame.marginRight : frame.marginLeft)
  if (width == null) return null
  const range = librarianTabYRange(frame, height)
  const centre = clamp(frame.top + dock.y * (frame.bottom - frame.top), range[0], range[1])
  const left = dock.side === 'right' ? frame.right - width : frame.left
  return { left, top: centre - height / 2, width, height }
}

/** The tap band: 40px wide from the edge, at least 44px tall. */
export function librarianTabBand(frame: LibrarianTabFrame, tab: LibrarianTabRect, side: 'left' | 'right'): LibrarianTabRect {
  const height = Math.max(LIBRARIAN_TAB_BAND_MIN_HEIGHT, tab.height)
  const top = tab.top + tab.height / 2 - height / 2
  const left = side === 'right' ? frame.right - LIBRARIAN_TAB_BAND_WIDTH : frame.left
  return { left, top, width: LIBRARIAN_TAB_BAND_WIDTH, height }
}

/** The dock a drop at (x, y) settles to: the nearer side, the height as a share of the frame. */
export function librarianTabDockFromDrop(frame: LibrarianTabFrame, x: number, y: number): LabLibrarianTabDock {
  const side = x < (frame.left + frame.right) / 2 ? 'left' : 'right'
  const range = librarianTabYRange(frame)
  const span = Math.max(1, frame.bottom - frame.top)
  return { side, y: Math.round(((clamp(y, range[0], range[1]) - frame.top) / span) * 1000) / 1000 }
}

/** How far a pointer pulls away from the docked edge (0 when pushed into it). */
export function librarianTabPull(frame: LibrarianTabFrame, side: 'left' | 'right', x: number): number {
  return Math.max(0, side === 'right' ? frame.right - x : x - frame.left)
}

/** The rubber band: the docked tab stretches by a share of the pull until it lets go. */
export function librarianTabStretch(pull: number): number {
  return Math.min(pull, LIBRARIAN_TAB_RELEASE) * LIBRARIAN_TAB_STICK
}

export function librarianTabReleased(pull: number): boolean {
  return pull > LIBRARIAN_TAB_RELEASE
}

/** The hide target's centre, bottom centre of the viewport. */
export function librarianTabTargetCentre(viewportWidth: number, viewportHeight: number): { x: number; y: number } {
  return { x: viewportWidth / 2, y: viewportHeight - LIBRARIAN_TAB_TARGET_BOTTOM - LIBRARIAN_TAB_TARGET / 2 }
}

export function librarianTabOverTarget(x: number, y: number, viewportWidth: number, viewportHeight: number): boolean {
  const centre = librarianTabTargetCentre(viewportWidth, viewportHeight)
  return Math.hypot(x - centre.x, y - centre.y) <= LIBRARIAN_TAB_TARGET_CATCH
}

export function otherLibrarianMode(mode: LabLibrarianTabMode): LabLibrarianTabMode {
  return mode === 'chat' ? 'talk' : 'chat'
}

/**
 * What a tap opens. Talk is not offered for a reader's own book (its text is
 * never sent to the voice provider), so a tab set to Talk opens Chat there.
 */
export function librarianTabTapMode(prefs: Pick<LabLibrarianTabPrefs, 'librarianTabOpens'>, talkAvailable = true): LabLibrarianTabMode {
  return prefs.librarianTabOpens === 'talk' && !talkAvailable ? 'chat' : prefs.librarianTabOpens
}

/** What a long press opens: the other mode, only with the Long press setting on. */
export function librarianTabLongPressMode(
  prefs: Pick<LabLibrarianTabPrefs, 'librarianTabOpens' | 'librarianTabLongPress'>,
  talkAvailable = true,
): LabLibrarianTabMode | null {
  if (!prefs.librarianTabLongPress) return null
  const other = otherLibrarianMode(librarianTabTapMode(prefs, talkAvailable))
  return other === 'talk' && !talkAvailable ? null : other
}

/**
 * Whether the tab is drawn. It is for signed-in readers who have not hidden
 * it, on a laid-out page with nothing in front of it.
 */
export function librarianTabShown(input: {
  enabled: boolean
  signedIn: boolean
  readerReady: boolean
  /** Chat or Talk open (a minimized desktop chat does not count). */
  conversationOpen: boolean
  /** Any sheet, menu, card, prompt or onboarding in front of the page. */
  overlayOpen: boolean
}): boolean {
  return input.enabled && input.signedIn && input.readerReady && !input.conversationOpen && !input.overlayOpen
}
