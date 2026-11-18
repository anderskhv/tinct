/**
 * A pasted text (Paste text, Insert link, a .txt file) is added as an EPUB that
 * public/lab/library_2/paste-text.js `pasteEpub` writes: one document, stored
 * uncompressed, its package naming that one document "chapter". Its chapters are
 * the sections of one piece of writing, so book scroll runs them on with no gap
 * between them (sharedReader/bookScroll.ts, Anders 13 Nov 2026).
 *
 * Told from the file itself, so a pasted text added before this was written is
 * recognised too; nothing is stored or converted again.
 */
const PASTED_PACKAGE = '<manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine>'
/** The package follows the mimetype and container entries, at the start of the file. */
const LOOK_BYTES = 16 * 1024

export function isPastedEpub(bytes: ArrayBuffer | Uint8Array | null | undefined): boolean {
  if (!bytes) return false
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  if (view.length < 4 || view[0] !== 0x50 || view[1] !== 0x4b) return false
  let head = ''
  try { head = new TextDecoder('utf-8', { fatal: false }).decode(view.subarray(0, LOOK_BYTES)) } catch { return false }
  return head.includes('OEBPS/content.opf') && head.includes(PASTED_PACKAGE)
}
