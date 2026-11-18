/**
 * The margin view's frame, started as soon as the page knows it shows one (main.tsx), not once the margin view's
 * own code has loaded (the first chapter first, 22 Oct 2026: the frame's page and its scripts waited about 0.4 s on
 * a 4x slower CPU for MarginPreview's chunk). MarginPreview takes this frame over. The frame asks the page for the
 * book (js/tinct-book.js waits for `window.TinctMarginPreview`), so starting it early changes nothing it reads.
 * Kept import-free: it is part of the reader's main bundle.
 */
// book.html (served as /lab/addbook/book): the margin reader's page without the PDF-only scripts (round 2).
export const MARGIN_PREVIEW_FRAME_SRC = '/lab/addbook/book?tinctBook='

export function marginPreviewFrameSrc(bookId: string): string {
  return MARGIN_PREVIEW_FRAME_SRC + encodeURIComponent(bookId)
}

/** The frame, as MarginPreview draws it, in `parent` now. -> it, or null without a document */
export function startMarginPreviewFrame(bookId: string, parent: HTMLElement | null = typeof document === 'undefined' ? null : document.body): HTMLIFrameElement | null {
  if (!parent) return null
  const frame = document.createElement('iframe')
  frame.dataset.testid = 'margin-preview-frame'
  frame.title = 'Margin preview'
  frame.src = marginPreviewFrameSrc(bookId)
  frame.allow = 'fullscreen; clipboard-write'
  Object.assign(frame.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', border: '0', display: 'block', background: 'var(--paper, #ece7db)' })
  parent.appendChild(frame)
  return frame
}
