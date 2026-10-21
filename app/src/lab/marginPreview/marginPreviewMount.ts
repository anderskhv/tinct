/**
 * Where the margin preview opens (Anders, 20 Oct 2026): on a phone it is not a
 * new reader. `/reader?book=<id>&margin=1` (or the sticky opt-in) opens the
 * book reader as it is today, with the new selection bar, the bottom cards and
 * the chapter pills (`marginPhone`). On a desktop it stays the margin reader's
 * frame (MarginPreview.tsx). Without the flag or the opt-in nothing changes.
 *
 * The flag's own decision (marginPreviewFlag.ts) is untouched. A phone reads
 * it without applying it: only the sticky opt-in is stored, and the address
 * and the library's hand-off stay for the book reader, which opens exactly as
 * it would without the flag.
 */
import { decideMarginPreview, handoffBookIdOf, marginPreviewBookForPage, MARGIN_PREVIEW_KEY } from './marginPreviewFlag'
import { LAB_READER_HANDOFF_KEY } from '../labReaderHandoff'

export type MarginPreviewMount = 'frame' | 'phone' | null

/** Pure: the frame on a desktop, the book reader in marginPhone mode on a phone, or nothing. */
export function marginPreviewMount(input: { bookId: string | null; phone: boolean }): MarginPreviewMount {
  if (!input.bookId) return null
  return input.phone ? 'phone' : 'frame'
}

/**
 * Decide for this page. A desktop applies the flag's decision as before
 * (marginPreviewBookForPage); a phone stores only the opt-in.
 */
export function marginPreviewMountForPage(isPreviewBook: (bookId: string) => boolean, phone: boolean): { mount: MarginPreviewMount; bookId: string | null } {
  if (!phone) {
    const bookId = marginPreviewBookForPage(isPreviewBook)
    return { mount: marginPreviewMount({ bookId, phone }), bookId }
  }
  if (typeof window === 'undefined') return { mount: null, bookId: null }
  let sticky = false
  try { sticky = localStorage.getItem(MARGIN_PREVIEW_KEY) === '1' } catch { /* no opt-in */ }
  const search = window.location.search
  if (!sticky && !new URLSearchParams(search).has('margin')) return { mount: null, bookId: null }
  let handoff: string | null = null
  try { handoff = sessionStorage.getItem(LAB_READER_HANDOFF_KEY) } catch { /* none */ }
  const decision = decideMarginPreview({ search, sticky, handoffBookId: handoffBookIdOf(handoff), isPreviewBook })
  try {
    if (decision.sticky === 'on') localStorage.setItem(MARGIN_PREVIEW_KEY, '1')
    if (decision.sticky === 'off') localStorage.removeItem(MARGIN_PREVIEW_KEY)
  } catch { /* a device convenience only */ }
  return { mount: marginPreviewMount({ bookId: decision.bookId, phone }), bookId: decision.bookId }
}
