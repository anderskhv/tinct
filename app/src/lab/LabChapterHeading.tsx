import type { ReactNode } from 'react'
import { bookOpening } from './labParagraphStyle'
import { unitName, useMarginPhone, type MarginBookStart } from './marginPhone/marginPhoneContext'

/**
 * Shared by visible pages and inert measurement surfaces. A reader's own book
 * opens with its title, subtitle and author above its first chapter's heading
 * (labParagraphStyle); every other chapter heading is just the heading.
 */
const sameWords = (a: string, b: string) => {
  const bare = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
  return bare(a) !== '' && bare(a) === bare(b)
}

/** The start actions' icons, drawn on a 16px grid in the UI's line weight. */
export function StartActionIcon({ name }: { name: 'primer' | 'summary' | 'angle' | 'quiz' }) {
  const body = {
    // A compass: where the book or chapter is going.
    primer: <><circle cx="8" cy="8" r="6" /><path d="M10.4 5.6 9 9 5.6 10.4 7 7z" /></>,
    // Three lines: what it holds, in brief.
    summary: <path d="M3 4.5h10M3 8h10M3 11.5h6.5" />,
    // A target: what the reader wants to notice.
    angle: <><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="3" /><circle cx="8" cy="8" r=".6" /></>,
    // A question mark.
    quiz: <><path d="M5.9 6a2.2 2.2 0 1 1 3.3 1.9c-.8.5-1.2.9-1.2 1.8v.3" /><circle cx="8" cy="12.3" r=".5" /></>,
  }[name]
  return <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="lab-start-icon">{body}</svg>
}

interface Segment { key: string; icon: 'primer' | 'summary' | 'angle' | 'quiz'; label: string; aria: string; testId: string; run?: (anchor: DOMRect) => void }

/** One soft pill of segments (approved option C): paper-tone fill, no border, hairlines between. */
function StartPill({ kind, segments, measuring, busy, testId }: { kind: 'book' | 'chapter'; segments: Segment[]; measuring: boolean; busy: boolean; testId: string }): ReactNode {
  return <div className={`lab-start-pill is-${kind}`} role="group" aria-label={kind === 'book' ? 'The whole book' : 'This chapter'} data-testid={measuring ? undefined : testId}>
    {segments.map(segment => <button key={segment.key} type="button" className="lab-start-seg" data-testid={measuring ? undefined : segment.testId}
      disabled={busy} tabIndex={measuring ? -1 : 0} aria-label={segment.aria}
      onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()}
      onClick={event => { event.stopPropagation(); if (!measuring) segment.run?.(event.currentTarget.getBoundingClientRect()) }}>
      <StartActionIcon name={segment.icon} /><span>{segment.label}</span>
    </button>)}
  </div>
}

function bookSegments(book: MarginBookStart): Segment[] {
  return [
    ...(book.primer ? [{ key: 'primer', icon: 'primer' as const, label: 'Primer', aria: `Primer for ${book.title}`, testId: 'lab-book-primer', run: () => book.onPrimer?.() }] : []),
    { key: 'summary', icon: 'summary', label: 'Summary', aria: `Summary of ${book.title}`, testId: 'lab-book-summary', run: () => book.onSummary?.() },
    { key: 'angle', icon: 'angle', label: 'Reading angle', aria: 'Reading angle', testId: 'lab-book-angle', run: () => book.onAngle?.() },
  ]
}

export function LabChapterHeading({ title, preview = false, busy = false, measuring = false, onPreview }: {
  title: string; preview?: boolean; busy?: boolean; measuring?: boolean; onPreview?: () => void
}) {
  const opening = bookOpening(title)
  // A first chapter named as the book (a PDF's text before its first heading) is not named twice.
  const repeats = !!opening && sameWords(opening.title, title)
  const margin = useMarginPhone()
  // The phone's start actions (approved mockup, 9 Nov 2026): soft pills under the book's opening and the heading.
  const phone = preview && margin?.layout === 'phone'
  // layout 'desktop': the Margin reader keeps its headings bare; these actions are its margin's start cards.
  // The phone's margin mode before the start actions: ✧ Primer · ✧ Catch me up on the heading's line, beside it.
  const chips = preview && !!margin && !margin.layout
  const book = phone && margin?.book && margin.book.firstChapterTitle === title ? margin.book : null
  return <header className={`lab-passage-header${chips || (preview && !margin) ? ' has-preview' : ''}${phone ? ' has-start-pills' : ''}${preview && title.length > 64 ? ' is-long-title' : ''}${opening || book ? ' has-book-opening' : ''}`}>
    {opening && <div className="lab-book-opening" data-testid={measuring ? undefined : 'lab-book-opening'}>
      <p className="lab-book-opening-title">{opening.title}</p>
      {opening.subtitle && <p className="lab-book-opening-subtitle">{opening.subtitle}</p>}
      {opening.author && <p className="lab-book-opening-author">{opening.author}</p>}
      {book && <StartPill kind="book" segments={bookSegments(book)} measuring={measuring} busy={busy} testId="lab-book-start" />}
    </div>}
    {!opening && book && <div className="lab-book-opening is-tinct" data-testid={measuring ? undefined : 'lab-book-opening'}>
      <p className="lab-book-opening-title">{book.title}</p>
      {book.author && <p className="lab-book-opening-author">{book.author}</p>}
      <StartPill kind="book" segments={bookSegments(book)} measuring={measuring} busy={busy} testId="lab-book-start" />
    </div>}
    {/* Kept, hidden, when it repeats the opening: the paginators read its face from it. */}
    <h1 className="lab-passage-headline" data-testid={measuring ? undefined : "lab-passage-headline"} hidden={repeats || undefined}>{title}</h1>
    {phone && margin && <StartPill kind="chapter" measuring={measuring} busy={busy} testId="lab-unit-start" segments={[
      { key: 'primer', icon: 'primer', label: 'Primer', aria: `Primer for ${title}`, testId: 'lab-unit-primer', run: () => onPreview?.() },
      ...(margin.summary !== false ? [{ key: 'summary', icon: 'summary' as const, label: 'Summary', aria: `Summary of ${unitName(title)} so far`, testId: 'lab-unit-summary', run: () => margin.onSummary?.() }] : []),
      { key: 'quiz', icon: 'quiz', label: 'Quiz', aria: `Quiz me on ${unitName(title)}`, testId: 'lab-unit-start-quiz', run: (anchor: DOMRect) => margin.onQuiz?.(anchor) },
    ]} />}
    {chips && margin && <div className="lab-unit-pills is-start" data-testid={measuring ? undefined : 'lab-unit-start'}>
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
