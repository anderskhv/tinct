export function LabChapterEnd({ hasNext, busy = false, measuring = false, onContinue, onDiscuss }: {
  hasNext: boolean; busy?: boolean; measuring?: boolean
  onContinue?: () => void; onDiscuss?: () => void
}) {
  return <section className="lab-chapter-end" data-testid={measuring ? undefined : "lab-chapter-end"} aria-label="Chapter finished"
    onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
    <div className="lab-chapter-end-actions">
      <button type="button" className="lab-chapter-recap" disabled={busy} tabIndex={onDiscuss ? 0 : -1} aria-label="Recap this chapter" onClick={onDiscuss}>
        <span><span className="lab-chapter-primer-mark" aria-hidden="true">✧</span>Recap</span>
      </button>
      {hasNext && <button type="button" tabIndex={onContinue ? 0 : -1} onClick={onContinue}>
        Next chapter <span aria-hidden="true">→</span>
      </button>}
    </div>
  </section>
}
