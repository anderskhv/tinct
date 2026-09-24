/** Shared by visible pages and inert measurement surfaces. */
export function LabChapterHeading({ title, preview = false, busy = false, measuring = false, onPreview }: {
  title: string; preview?: boolean; busy?: boolean; measuring?: boolean; onPreview?: () => void
}) {
  return <header className={`lab-passage-header${preview ? ' has-preview' : ''}`}>
    <h1 className="lab-passage-headline" data-testid={measuring ? undefined : "lab-passage-headline"}>{title}</h1>
    {preview && <button type="button" className="lab-chapter-preview" disabled={busy}
      tabIndex={onPreview ? 0 : -1} aria-label={`Preview ${title}`}
      onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()}
      onClick={event => { event.stopPropagation(); onPreview?.() }}>
      <span>Preview</span>
    </button>}
  </header>
}
