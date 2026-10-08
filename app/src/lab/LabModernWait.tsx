/**
 * What the reader shows while an added book's Modern English edition is being
 * written (labModernEdition.ts):
 *
 * - LabModernWait covers the page while the paragraphs on it are not written
 *   yet (or the purchase is being confirmed): the book, the chapter, how far
 *   the chapter is and an estimate. Never the original text. After a while it
 *   offers the original meanwhile, named as the original.
 * - LabModernReadyNotice, for a reader who chose the original meanwhile (the
 *   folio reads "Original text · …", LabApp readingFootLabel): once Modern
 *   English is ready where they are, a notice that switches at the same
 *   paragraph.
 *
 * Both sit over the page (absolutely placed in the page wrap), so neither
 * changes the page's size or pagination. System UI for chrome, Playfair for the
 * one title; no mono.
 */
export interface LabModernWaitView {
  kind: 'purchase' | 'writing' | 'unavailable'
  offerOriginal: boolean
  done: number
  total: number | null
  estimate: string | null
}

export const MODERN_WAIT_COPY = {
  eyebrow: 'Tinct Modern English',
  purchase: 'Confirming your purchase.',
  writing: 'Writing this page.',
  unavailable: 'Modern English for this chapter could not be written yet.',
  progress: (done: number, total: number) => `${done.toLocaleString('en-US')} of ${total.toLocaleString('en-US')} paragraphs in this chapter written`,
  readOriginal: 'Read the original meanwhile',
  readOriginalNow: 'Read the original',
  originalFine: 'You’ll see a note when Modern English is ready here.',
  originalLabel: 'Original text',
  ready: 'Modern English is ready',
  switch: 'Switch',
  dismiss: 'Dismiss',
} as const

export function LabModernWait({ wait, bookTitle, chapterTitle, onReadOriginal }: {
  wait: LabModernWaitView
  bookTitle: string
  chapterTitle: string
  onReadOriginal: () => void
}) {
  const copy = MODERN_WAIT_COPY
  const total = wait.total && wait.total > 0 ? wait.total : null
  const share = total ? Math.min(1, wait.done / total) : 0
  const line = wait.kind === 'purchase' ? copy.purchase
    : wait.kind === 'unavailable' ? copy.unavailable
    : wait.estimate ? `${copy.writing} ${wait.estimate}.` : copy.writing
  return (
    <div className="lab-modern-wait" data-testid="lab-modern-wait" data-kind={wait.kind}>
      <div className="lab-modern-wait__inner">
        <p className="lab-modern-wait__eyebrow">{copy.eyebrow}</p>
        <h2 className="lab-modern-wait__title">{bookTitle}</h2>
        {chapterTitle && wait.kind !== 'purchase' && <p className="lab-modern-wait__chapter">{chapterTitle}</p>}
        <p className="lab-modern-wait__line" role="status" aria-live="polite" data-testid="lab-modern-wait-line">{line}</p>
        {wait.kind === 'writing' && (
          <div className="lab-modern-wait__progress">
            <div className="lab-modern-wait__bar" role="progressbar" aria-label="Chapter written" aria-valuemin={0} aria-valuemax={total ?? undefined} aria-valuenow={total ? wait.done : undefined}>
              <span style={{ width: `${Math.round(share * 1000) / 10}%` }} />
            </div>
            {total && <p className="lab-modern-wait__meta" data-testid="lab-modern-wait-progress">{copy.progress(wait.done, total)}</p>}
          </div>
        )}
        {wait.offerOriginal && (
          <div className="lab-modern-wait__original">
            <button type="button" className="lab-modern-wait__button" data-testid="lab-modern-read-original" onClick={onReadOriginal}>
              {wait.kind === 'unavailable' ? copy.readOriginalNow : copy.readOriginal}
            </button>
            <p className="lab-modern-wait__fine">{copy.originalFine}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function LabModernReadyNotice({ onSwitch, onDismiss }: {
  onSwitch: () => void
  onDismiss: () => void
}) {
  const copy = MODERN_WAIT_COPY
  return (
    <div className="lab-modern-ready" role="status" data-testid="lab-modern-ready">
      <span>{copy.ready}</span>
      <button type="button" className="lab-modern-ready__switch" data-testid="lab-modern-ready-switch" onClick={onSwitch}>{copy.switch}</button>
      <button type="button" className="lab-modern-ready__close" aria-label={copy.dismiss} onClick={onDismiss}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
    </div>
  )
}
