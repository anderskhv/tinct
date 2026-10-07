export function LabChapterEnd({ hasNext, busy = false, measuring = false, docked = false, recap = true, onContinue, onDiscuss, finishedCard }: {
  hasNext: boolean; busy?: boolean; measuring?: boolean; docked?: boolean
  /** False where no recap can be offered (a reader's own book, once its next chapter is open). */
  recap?: boolean
  onContinue?: () => void; onDiscuss?: () => void
  /** Social ship 3: at the end of a book, the "Finished {book}" reading card to share. Absent while the switch is off. */
  finishedCard?: { label: string; busy: boolean; note: string; onShare: () => void }
}) {
  return <section className={`lab-chapter-end${docked ? ' is-docked' : ''}`} data-testid={measuring ? undefined : "lab-chapter-end"} aria-label="Chapter finished"
    onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
    <div className="lab-chapter-end-actions">
      {recap && <button type="button" className="lab-chapter-recap" disabled={busy} tabIndex={onDiscuss ? 0 : -1} aria-label="Recap this chapter" onClick={onDiscuss}>
        <span><span className="lab-chapter-primer-mark" aria-hidden="true">✧</span>Recap</span>
      </button>}
      {hasNext && <button type="button" tabIndex={onContinue ? 0 : -1} onClick={onContinue}>
        Next chapter <span aria-hidden="true">→</span>
      </button>}
      {!hasNext && finishedCard && <button type="button" className="lab-chapter-finished-card" data-testid="lab-finished-card" disabled={finishedCard.busy} onClick={finishedCard.onShare}>
        {finishedCard.label} <span aria-hidden="true">↗</span>
      </button>}
    </div>
    {!hasNext && finishedCard?.note && <p className="lab-chapter-finished-note" role="status">{finishedCard.note}</p>}
  </section>
}
