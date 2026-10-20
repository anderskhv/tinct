import { bookOpening } from './labParagraphStyle'
import { unitName, useMarginPhone } from './marginPhone/marginPhoneContext'

/**
 * Shared by visible pages and inert measurement surfaces. A reader's own book
 * opens with its title, subtitle and author above its first chapter's heading
 * (labParagraphStyle); every other chapter heading is just the heading.
 */
const sameWords = (a: string, b: string) => {
  const bare = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
  return bare(a) !== '' && bare(a) === bare(b)
}

export function LabChapterHeading({ title, preview = false, busy = false, measuring = false, onPreview }: {
  title: string; preview?: boolean; busy?: boolean; measuring?: boolean; onPreview?: () => void
}) {
  const opening = bookOpening(title)
  // A first chapter named as the book (a PDF's text before its first heading) is not named twice.
  const repeats = !!opening && sameWords(opening.title, title)
  // The phone's margin mode: "Starting <chapter>" with ✧ Primer · ✧ Catch me up below the heading, in place of the Primer chip.
  const margin = useMarginPhone()
  return <header className={`lab-passage-header${preview ? ' has-preview' : ''}${preview && title.length > 64 ? ' is-long-title' : ''}${opening ? ' has-book-opening' : ''}`}>
    {opening && <div className="lab-book-opening" data-testid={measuring ? undefined : 'lab-book-opening'}>
      <p className="lab-book-opening-title">{opening.title}</p>
      {opening.subtitle && <p className="lab-book-opening-subtitle">{opening.subtitle}</p>}
      {opening.author && <p className="lab-book-opening-author">{opening.author}</p>}
    </div>}
    {/* Kept, hidden, when it repeats the opening: the paginators read its face from it. */}
    <h1 className="lab-passage-headline" data-testid={measuring ? undefined : "lab-passage-headline"} hidden={repeats || undefined}>{title}</h1>
    {preview && margin && <div className="lab-unit-pills is-start" data-testid={measuring ? undefined : 'lab-unit-start'}>
      <p className="lab-unit-k">Starting {unitName(title)}</p>
      <div className="lab-unit-acts">
        <button type="button" className="lab-chapter-preview" data-testid={measuring ? undefined : 'lab-unit-primer'} disabled={busy}
          tabIndex={onPreview ? 0 : -1} aria-label={`Primer for ${title}`}
          onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()}
          onClick={event => { event.stopPropagation(); onPreview?.() }}>
          <span><span className="lab-chapter-primer-mark" aria-hidden="true">✧</span>Primer</span>
        </button>
        {margin.catchUp !== false && <button type="button" className="lab-chapter-preview" data-testid={measuring ? undefined : 'lab-unit-catchup'} disabled={busy}
          tabIndex={measuring ? -1 : 0} aria-label={`Catch me up on what came before ${unitName(title)}`}
          onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()}
          onClick={event => { event.stopPropagation(); if (!measuring) margin.onCatchUp?.() }}>
          <span><span className="lab-chapter-primer-mark" aria-hidden="true">✧</span>Catch me up</span>
        </button>}
      </div>
    </div>}
    {preview && !margin && <button type="button" className="lab-chapter-preview" disabled={busy}
      tabIndex={onPreview ? 0 : -1} aria-label={`Primer for ${title}`}
      onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()}
      onClick={event => { event.stopPropagation(); onPreview?.() }}>
      <span><span className="lab-chapter-primer-mark" aria-hidden="true">✧</span>Primer</span>
    </button>}
  </header>
}
