import { bookOpening } from './labParagraphStyle'

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
  return <header className={`lab-passage-header${preview ? ' has-preview' : ''}${preview && title.length > 64 ? ' is-long-title' : ''}${opening ? ' has-book-opening' : ''}`}>
    {opening && <div className="lab-book-opening" data-testid={measuring ? undefined : 'lab-book-opening'}>
      <p className="lab-book-opening-title">{opening.title}</p>
      {opening.subtitle && <p className="lab-book-opening-subtitle">{opening.subtitle}</p>}
      {opening.author && <p className="lab-book-opening-author">{opening.author}</p>}
    </div>}
    {!repeats && <h1 className="lab-passage-headline" data-testid={measuring ? undefined : "lab-passage-headline"}>{title}</h1>}
    {preview && <button type="button" className="lab-chapter-preview" disabled={busy}
      tabIndex={onPreview ? 0 : -1} aria-label={`Primer for ${title}`}
      onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()}
      onClick={event => { event.stopPropagation(); onPreview?.() }}>
      <span><span className="lab-chapter-primer-mark" aria-hidden="true">✧</span>Primer</span>
    </button>}
  </header>
}
