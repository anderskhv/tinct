export function LabChapterEnd({ hasNext, busy = false, onContinue, onDiscuss }: {
  hasNext: boolean; busy?: boolean
  onContinue?: () => void; onDiscuss?: () => void
}) {
  return <section className="lab-chapter-end" data-testid="lab-chapter-end" aria-label="Chapter finished"
    onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
    <div className="lab-chapter-end-actions">
      <button type="button" disabled={busy} tabIndex={onDiscuss ? 0 : -1} onClick={onDiscuss}>Recap this chapter</button>
      {hasNext && <button type="button" tabIndex={onContinue ? 0 : -1} onClick={onContinue}>
        Next chapter <span aria-hidden="true">→</span>
      </button>}
    </div>
  </section>
}
