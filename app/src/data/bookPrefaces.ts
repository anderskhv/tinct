/** Reviewed English editorial texts, independent of the selected edition.
 * Source/approval versions: docs/design/approved-prefaces/README.md. */
export interface BookPreface { bookId: string; language: 'en'; preview: string; paragraphs: string[] }
const sources = import.meta.glob('./prefaces/*.txt', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const prefaces = new Map<string, BookPreface>(Object.entries(sources).map(([path, text]) => {
  const bookId = path.split('/').at(-1)!.replace(/\.txt$/, '')
  const paragraphs = text.trim().split(/\n\s*\n/)
  const preview = paragraphs[0].match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || paragraphs[0]
  return [bookId, { bookId, language: 'en', preview, paragraphs }]
}))
export function getBookPreface(bookId: string): BookPreface | undefined { return prefaces.get(bookId) }
