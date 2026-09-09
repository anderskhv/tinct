export function LabChapterEnd({ label, hasNext, busy, onDiscuss, onPrepare }: {
  label: string; hasNext: boolean; busy: boolean
  onDiscuss: () => void; onPrepare: () => void
}) {
  return <section className="lab-chapter-end" data-testid="lab-chapter-end" aria-label="Chapter finished"
    onPointerDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
    <p className="lab-chapter-end-label">End of {/^\d+$/.test(label) ? `chapter ${label}` : label}</p>
    <div className="lab-chapter-end-actions">
      <button type="button" disabled={busy} onClick={onDiscuss}>Discuss this chapter <span aria-hidden="true">↗</span></button>
      {hasNext && <button type="button" disabled={busy} onClick={onPrepare}>Prepare for next <span aria-hidden="true">↗</span></button>}
    </div>
  </section>
}
