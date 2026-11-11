/**
 * A saved highlight's menu (its colours, waiting for a change) goes when the mouse leaves it, on the desktop
 * (Anders, 11 Nov 2026). Careful, so it never flickers and never surprises:
 * - a mouse only: a finger or a pen never closes it this way;
 * - only once the pointer has been on the menu (the click that made the highlight is on it; a click on a highlight
 *   in the text is not, so that menu waits for the pointer to come to it first);
 * - a few pixels of slack around the menu, and a short grace that coming back cancels;
 * - never while a mouse button is down, and never while the keyboard is in the menu (a focused field, a tabbed-to
 *   button).
 */
export const HIGHLIGHT_MENU_LEAVE_MS = 280
export const HIGHLIGHT_MENU_LEAVE_SLACK_PX = 12

export interface LeaveBox { left: number; top: number; right: number; bottom: number }

/** Inside any of the menu's boxes, each grown by the slack. */
export function insideHighlightMenu(x: number, y: number, boxes: LeaveBox[], slack = HIGHLIGHT_MENU_LEAVE_SLACK_PX): boolean {
  return boxes.some(box => box.right > box.left && box.bottom > box.top
    && x >= box.left - slack && x <= box.right + slack && y >= box.top - slack && y <= box.bottom + slack)
}

export interface HighlightMenuLeaveOptions {
  /** The menu's boxes in the window now: the bar and, when open, its ••• menu. Empty: not on screen. */
  boxes: () => LeaveBox[]
  /** The keyboard is in the menu: it stays. */
  keyboardInside: () => boolean
  onLeave: () => void
  graceMs?: number
  slackPx?: number
}

/** Watches the mouse from now until the returned function is called. */
export function watchHighlightMenuLeave({ boxes, keyboardInside, onLeave, graceMs = HIGHLIGHT_MENU_LEAVE_MS, slackPx = HIGHLIGHT_MENU_LEAVE_SLACK_PX }: HighlightMenuLeaveOptions): () => void {
  let entered = false, timer: ReturnType<typeof setTimeout> | null = null, buttons = 0
  const cancel = () => { if (timer) clearTimeout(timer); timer = null }
  const see = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    buttons = event.type === 'pointerup' ? 0 : event.buttons
    const inside = insideHighlightMenu(event.clientX, event.clientY, boxes(), slackPx)
    if (inside) { entered = true; cancel(); return }
    if (!entered || buttons || timer) return
    timer = setTimeout(() => {
      timer = null
      if (buttons || keyboardInside()) return
      onLeave()
    }, graceMs)
  }
  const types = ['pointermove', 'pointerdown', 'pointerup'] as const
  types.forEach(type => window.addEventListener(type, see, true))
  return () => { cancel(); types.forEach(type => window.removeEventListener(type, see, true)) }
}

/** The selection menu's boxes: the desktop bar (or the classic pop-up) and its open ••• menu. */
export function highlightMenuBoxes(root: ParentNode = document): LeaveBox[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('.selection-popup, .selection-popup [role="menu"], [role="toolbar"][data-bar-state], [role="toolbar"][data-bar-state] [role="menu"]'))
  return nodes.map(node => node.getBoundingClientRect()).map(rect => ({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }))
}

/** The keyboard is in the menu: a text field has the focus, or a control was reached with the keyboard. */
export function highlightMenuHasKeyboard(root: Document = document): boolean {
  const active = root.activeElement
  if (!(active instanceof HTMLElement) || !active.closest('.selection-popup, [role="toolbar"][data-bar-state]')) return false
  if (active.matches('input, textarea, [contenteditable="true"]')) return true
  try { return active.matches(':focus-visible') } catch { return false }
}

/**
 * How far the reader scrolls before the selection menu goes: a saved highlight's menu at once (Anders, 11 Nov 2026);
 * a fresh selection's only after a few lines, so a nudge of the page never drops what was just selected (2 Nov 2026).
 */
export const SELECTION_MENU_SCROLL_PX = 48
export function selectionMenuScrollGone(movedPx: number, highlighted: boolean): boolean {
  return Math.abs(movedPx) > (highlighted ? 0 : SELECTION_MENU_SCROLL_PX)
}
