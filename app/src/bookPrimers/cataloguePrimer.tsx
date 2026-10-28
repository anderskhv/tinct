import { createRoot } from 'react-dom/client'
import { PrimerContentView } from './PrimerContentView'
import { fetchChapterNotes } from '../lab/labChapterNotes'

/** Mount the reader's exact book content in the catalogue paper, without moving its place. */
export function mountCataloguePrimer(target: HTMLElement, book: { id: string; editionKey: string; language: string }, readToken: () => Promise<string | null>) {
  const root = createRoot(target)
  let disposed = false
  const load = async () => {
    root.render(<p role="status">Preparing your book primer…</p>)
    const result = await fetchChapterNotes({ bookId: book.id, editionKey: book.editionKey, chapterNumber: 1, kind: 'primer', format: 'structured-primer', primerType: 'book', language: book.language }, { readToken })
    if (disposed) return
    if (result.ok && result.primer) root.render(<PrimerContentView primer={result.primer} />)
    else {
      const unavailable = !result.ok && result.sourceUnavailable
      const message = unavailable ? 'A primer for the complete book is not available for this edition. You can still begin reading.'
        : !result.ok && result.allowanceUsed ? 'Your AI allowance is used for now. You can still begin reading.'
        : 'The book primer could not load. You can still begin reading.'
      root.render(<div><p role="status">{message}</p>{!unavailable && !(!result.ok && result.allowanceUsed) && <button type="button" onClick={() => void load()}>Try again</button>}</div>)
    }
  }
  void load()
  return () => { disposed = true; root.unmount() }
}
