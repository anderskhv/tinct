/** Entry presentation only: no reader state or persistence. */
export function fullShelf(catalogue) {
  const byId = new Map(catalogue.books.map(book => [book.id, book]))
  return [...new Set([...(catalogue.popular || []), ...catalogue.books.map(book => book.id)])].map(id => byId.get(id)).filter(Boolean)
}
export const normalizePassage = text => String(text || '').replace(/\s+/g, ' ').trim()
/** Whole aligned paragraphs are the fallback; never guess sentence alignment.
 * The approved Odyssey excerpt has independently reviewed ends in both editions.
 * If either source changes, display their full shared paragraph instead. */
export function pairedSamples(bookId, keys, payloads) {
  const paragraphs = payloads.map(p => p?.paragraphs || p?.chapters?.[0]?.paragraphs || [])
  if (paragraphs.some(p => !p.length)) return keys.map(() => null)
  let index = 0
  if (bookId === 'odyssey') index = 1
  else {
    const candidates = Array.from({length: Math.min(8, ...paragraphs.map(p => p.length))}, (_, i) => i)
    index = candidates.filter(i => paragraphs.every(p => normalizePassage(p[i]).split(/\s+/).length >= 15)).sort((a,b) => {
      const distance = i => paragraphs.reduce((sum,p) => sum + Math.abs(normalizePassage(p[i]).split(/\s+/).length - 50),0)
      return distance(a)-distance(b) || a-b
    })[0] ?? 0
  }
  const full = paragraphs.map(p => normalizePassage(p[index]))
  const endings = {'original-en':'wanted to marry him.', 'modern-en':'wanting to marry him.'}
  const reviewed = bookId === 'odyssey' && keys.every((key,i) => endings[key] && full[i].includes(endings[key]))
  return full.map((text,i) => ({full:text, short:reviewed ? text.slice(0,text.indexOf(endings[keys[i]])+endings[keys[i]].length) : text, paragraphIndex:index}))
}
