/**
 * Keys for the desktop selection bar (SelectionDeskBar): Explain, Ask, Note
 * and Highlight, the same actions as its buttons.
 *
 * Where typing over a selection starts a question (the shared reader's
 * type-to-ask), a bare letter is the question's first character, so E, A
 * and H take Alt (Option on a Mac); N stays a bare key there, as in the
 * margin reader (DECISIONS 2026-10-15: a question rarely starts with a bare N).
 * Where typing does not start Ask (the classic reader), the bare letters work
 * too. Ctrl/Cmd combinations are always the browser's.
 */
export type DeskBarShortcut = 'explain' | 'ask' | 'note' | 'highlight'

const LETTERS: Record<string, DeskBarShortcut> = { e: 'explain', a: 'ask', n: 'note', h: 'highlight' }
const KEY_OF: Record<DeskBarShortcut, string> = { explain: 'E', ask: 'A', note: 'N', highlight: 'H' }

type KeyInput = Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey' | 'isComposing' | 'repeat' | 'defaultPrevented'> & { keyCode?: number }

/** Which bar action a keydown asks for, if any. `typeToAsk`: typing on this bar starts a question. */
export function deskBarShortcut(event: KeyInput, typeToAsk: boolean): DeskBarShortcut | null {
  if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.repeat) return null
  if (event.ctrlKey || event.metaKey || event.shiftKey) return null
  if (event.altKey) {
    // Option+E on a Mac types a dead key or a symbol: the key's position names the letter.
    const letter = /^[a-z]$/i.test(event.key) ? event.key.toLowerCase() : /^Key[A-Z]$/.test(event.code) ? event.code.slice(3).toLowerCase() : ''
    return LETTERS[letter] ?? null
  }
  const action = LETTERS[event.key.toLowerCase()] ?? null
  if (!action) return null
  return !typeToAsk || action === 'note' ? action : null
}

/** Whether this platform names Alt "Option" (⌥). */
export function deskBarUsesOption(platform = typeof navigator !== 'undefined' ? navigator.platform || navigator.userAgent : ''): boolean {
  return /Mac|iPhone|iPad|iPod/i.test(platform)
}

/** The key shown in the button's tooltip, and its aria-keyshortcuts value. */
export function deskBarShortcutLabel(action: DeskBarShortcut, typeToAsk: boolean, option = deskBarUsesOption()): { hint: string; aria: string } {
  const key = KEY_OF[action]
  const alt = `${option ? '⌥' : 'Alt+'}${key}`
  if (typeToAsk && action !== 'note') return { hint: alt, aria: `Alt+${key}` }
  return { hint: key, aria: `${key} Alt+${key}` }
}
