export function LabChapterEnd({ hasNext, busy, onContinue, onDiscuss, onPrepare }: {
  hasNext: boolean; busy: boolean
  onContinue: () => void; onDiscuss: () => void; onPrepare: () => void
}) {
  return <section className="lab-chapter-end" data-testid="lab-chapter-end" aria-label="Chapter finished"
    onPointerDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
    <h2 className="lab-chapter-end-label">End of chapter</h2>
    <div className="lab-chapter-end-actions">
      {hasNext && <button type="button" className="lab-chapter-end-continue" onClick={onContinue}>
        <span>Continue to next chapter</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>}
      <button type="button" disabled={busy} onClick={onDiscuss}>Recap this chapter</button>
      {hasNext && <button type="button" disabled={busy} onClick={onPrepare}>Prepare for the next chapter</button>}
    </div>
  </section>
}
