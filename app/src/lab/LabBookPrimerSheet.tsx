import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReaderWindow } from './useReaderWindow'
import { LabPhoneCard } from './marginPhone/LabPhoneCard'
import './labCatchUp.css'

/** The whole book's Primer, from the book's start actions (Anders, 9 Nov 2026). */
export const BOOK_PRIMER_TITLE = 'Primer'

/**
 * A Tinct book's introduction as the library shows it (`/lab/library_2/primer-data/<id>.en.json`, authored and
 * reviewed per book, no AI): its opening, how the book unfolds, and its people. Static: costs nothing to open.
 */
export interface BookPrimerData {
  opening: string
  structure: Array<{ title: string; text: string }>
  people: Array<{ name: string; role?: string }>
}

export function bookPrimerUrl(bookId: string): string {
  return `/lab/library_2/primer-data/${encodeURIComponent(bookId)}.en.json`
}

const memory = new Map<string, BookPrimerData | null>()

/** Only the fields the card draws, each checked; anything malformed is no primer. */
export function parseBookPrimer(raw: unknown): BookPrimerData | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  if (typeof value.opening !== 'string' || !value.opening.trim()) return null
  const rows = (list: unknown) => Array.isArray(list) ? list.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object') : []
  return {
    opening: value.opening.trim(),
    structure: rows(value.structure).filter(row => typeof row.title === 'string' && typeof row.text === 'string').map(row => ({ title: String(row.title), text: String(row.text) })),
    people: rows(value.people).filter(row => typeof row.name === 'string').map(row => ({ name: String(row.name), ...(typeof row.role === 'string' ? { role: row.role } : {}) })),
  }
}

export async function loadBookPrimer(bookId: string, fetchImpl: typeof fetch = fetch): Promise<BookPrimerData | null> {
  if (memory.has(bookId)) return memory.get(bookId) ?? null
  try {
    const response = await fetchImpl(bookPrimerUrl(bookId))
    const data = response.ok ? parseBookPrimer(await response.json()) : null
    memory.set(bookId, data)
    return data
  } catch {
    return null
  }
}

/** Whether the book has an introduction to show (read once per page; the pill offers Primer only then). */
export function useBookPrimerAvailable(bookId: string | null): boolean {
  const [available, setAvailable] = useState(() => !!bookId && !!memory.get(bookId))
  useEffect(() => {
    if (!bookId) { setAvailable(false); return }
    let live = true
    void loadBookPrimer(bookId).then(data => { if (live) setAvailable(!!data) })
    return () => { live = false }
  }, [bookId])
  return available
}

export function bookPrimerText(title: string, data: BookPrimerData): string {
  return [`${title}`, data.opening, ...data.structure.map(row => `${row.title}: ${row.text}`)].join('\n\n')
}

export function LabBookPrimerSheet({ bookId, bookTitle, card, embedded = false, onClose, follow, thread, onReady }: {
  bookId: string
  bookTitle: string
  /** The phone: shown as the bottom card with this label. */
  card?: { label: string }
  embedded?: boolean
  onClose: () => void
  follow?: (shown: () => string) => ReactNode
  thread?: ReactNode
  onReady?: (text: string) => void
}) {
  const [data, setData] = useState<BookPrimerData | null | undefined>(() => memory.get(bookId))
  const windowRef = useReaderWindow<HTMLElement>('catchup', !card && !embedded)
  useEffect(() => {
    let live = true
    void loadBookPrimer(bookId).then(result => { if (live) setData(result) })
    return () => { live = false }
  }, [bookId])
  useEffect(() => {
    if (embedded || card) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, embedded, onClose])
  const shown = () => data ? bookPrimerText(`${BOOK_PRIMER_TITLE} · ${bookTitle}`, data) : ''
  const readyRef = useRef(onReady); readyRef.current = onReady
  useEffect(() => { if (data) readyRef.current?.(bookPrimerText(`${BOOK_PRIMER_TITLE} · ${bookTitle}`, data)) }, [data, bookTitle])
  const body = (
    <div className="lab-v2-sheet-body lab-book-primer" data-testid="lab-book-primer-body">
      {data === undefined ? <span className="lab-catch-up-placeholder" aria-hidden="true"><i /><i /><i /></span>
        : data === null ? <p className="lab-book-primer-none">This book has no primer yet.</p>
          : <>
            <p className="lab-book-primer-opening">{data.opening}</p>
            {data.structure.length > 0 && <ol className="lab-book-primer-parts">
              {data.structure.map(row => <li key={row.title}><h3>{row.title}</h3><p>{row.text}</p></li>)}
            </ol>}
            {data.people.length > 0 && <>
              <h3 className="lab-book-primer-head">People</h3>
              <ul className="lab-book-primer-people">
                {data.people.map(person => <li key={person.name}><strong>{person.name}</strong>{person.role ? ` · ${person.role}` : ''}</li>)}
              </ul>
            </>}
          </>}
      {thread}
    </div>
  )
  if (embedded) return <>{body}{follow?.(shown)}</>
  if (card) return <LabPhoneCard label={card.label} kind="book-primer" onClose={onClose} foot={follow?.(shown)} testId="lab-phone-card">{body}</LabPhoneCard>
  return (
    <div className="lab-v2-sheet-layer lab-catch-up-layer" data-testid="lab-book-primer-layer">
      <button type="button" className="lab-super-scrim" aria-label="Close" onClick={onClose} />
      <section ref={windowRef} className="lab-v2-sheet lab-catch-up" data-testid="lab-book-primer" aria-label={`${BOOK_PRIMER_TITLE} · ${bookTitle}`}>
        <div className="lab-v2-head is-titled" data-reader-window-handle>
          <h2 className="lab-v2-title">{BOOK_PRIMER_TITLE}</h2>
          <button type="button" className="lab-v2-dismiss" aria-label="Close" onClick={onClose}>×</button>
        </div>
        {body}
        {follow && <div className="lab-catch-up-foot is-follow">{follow(shown)}</div>}
      </section>
    </div>
  )
}
