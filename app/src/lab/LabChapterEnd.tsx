import { useMarginPhone } from './marginPhone/marginPhoneContext'

export function LabChapterEnd({ hasNext, busy = false, measuring = false, docked = false, recap = true, note = true, onContinue, onDiscuss, onNote, finishedCard }: {
  /** The chapter's title (measuring copies pass it too). */
  chapterTitle?: string
  hasNext: boolean; busy?: boolean; measuring?: boolean; docked?: boolean
  /** False where no recap can be offered (a reader's own book, once its next chapter is open). */
  recap?: boolean
  /** The chapter note pill (a private note on the whole chapter); shown in measuring copies too, so the layout matches. */
  note?: boolean
  onContinue?: () => void; onDiscuss?: () => void
  /** Opens the note editor for this chapter; the pill's box places it on the desktop. */
  onNote?: (pill: DOMRect) => void
  /** Social ship 3: at the end of a book, the "Finished {book}" reading card to share. Absent while the switch is off. */
  finishedCard?: { label: string; busy: boolean; note: string; onShare: () => void }
}) {
  // The phone's margin mode: ✧ Recap · ✧ Quiz me · Note, with no label above them.
  const margin = useMarginPhone()
  return <section className={`lab-chapter-end${docked ? ' is-docked' : ''}`} data-testid={measuring ? undefined : "lab-chapter-end"} aria-label="Chapter finished"
    onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
    <div className="lab-chapter-end-actions">
      {recap && <button type="button" className="lab-chapter-recap" disabled={busy} tabIndex={onDiscuss ? 0 : -1} aria-label="Recap this chapter" onClick={onDiscuss}>
        <span><span className="lab-chapter-primer-mark" aria-hidden="true">✧</span>Recap</span>
      </button>}
      {margin && recap && <button type="button" className="lab-chapter-recap" data-testid={measuring ? undefined : 'lab-unit-quiz'} tabIndex={measuring ? -1 : 0} aria-label="Quiz me on this chapter" onClick={() => { if (!measuring) margin.onQuiz?.() }}>
        <span><span className="lab-chapter-primer-mark" aria-hidden="true">✧</span>Quiz me</span>
      </button>}
      {note && <button type="button" className="lab-chapter-note" data-testid={measuring ? undefined : 'lab-chapter-note-open'} tabIndex={onNote ? 0 : -1} aria-label="Chapter note"
        onClick={event => onNote?.(event.currentTarget.getBoundingClientRect())}>
        <span>Note</span>
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
