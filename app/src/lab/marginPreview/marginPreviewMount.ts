/**
 * Where margin view opens (Anders, 20 Oct 2026; the default reader since 22 Oct 2026): on a phone it is not a
 * new reader. A registered book opens the book reader as it is today, with the new selection bar, the bottom
 * cards and the chapter pills (`marginPhone`). On a desktop it is the margin reader's frame (MarginPreview.tsx).
 * The device's Classic reader choice, or a link with its own rules, keeps the book reader unchanged.
 *
 * A phone reads the decision (marginPreviewFlag.ts) without its address change: only the Classic reader choice
 * is stored, and the address and the library's hand-off stay for the book reader, which reads them itself.
 */
import { marginPreviewBookForPage, marginPreviewDecisionForPage } from './marginPreviewFlag'

export type MarginPreviewMount = 'frame' | 'phone' | null

/** Pure: the frame on a desktop, the book reader in marginPhone mode on a phone, or nothing. */
export function marginPreviewMount(input: { bookId: string | null; phone: boolean }): MarginPreviewMount {
  if (!input.bookId) return null
  return input.phone ? 'phone' : 'frame'
}

/**
 * Decide for this page. A desktop applies the flag's decision (marginPreviewBookForPage); a phone stores only
 * the Classic reader choice.
 */
export function marginPreviewMountForPage(isPreviewBook: (bookId: string) => boolean, phone: boolean): { mount: MarginPreviewMount; bookId: string | null } {
  if (!phone) {
    const bookId = marginPreviewBookForPage(isPreviewBook)
    return { mount: marginPreviewMount({ bookId, phone }), bookId }
  }
  if (typeof window === 'undefined') return { mount: null, bookId: null }
  const decision = marginPreviewDecisionForPage(isPreviewBook)
  return { mount: marginPreviewMount({ bookId: decision.bookId, phone }), bookId: decision.bookId }
}
