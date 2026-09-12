/** Entry presentation only: no reader state or persistence. */
export function fullShelf(catalogue) {
  const byId = new Map(catalogue.books.map(book => [book.id, book]))
  return [...new Set([...(catalogue.popular || []), ...catalogue.books.map(book => book.id)])].map(id => byId.get(id)).filter(book => book && book.discoveryAvailable !== false)
}
export const normalizePassage = text => String(text || '').replace(/\s+/g, ' ').trim()
const wordCount = text => (text ? normalizePassage(text).split(/\s+/).length : 0)

/** A stage direction, a scene/act heading or a running title is the same words
 * in every edition, so a picker built on one shows no difference between the
 * editions it is asking the reader to choose between (Macbeth opened with
 * `[Thunder and Lightning. Enter three Witches.]` on both sides). Only the
 * book's own prose or dialogue makes a sample. */
export function isSampleProse(text) {
  const passage = normalizePassage(text)
  if (!passage) return false
  if (/^[[(].*[\])]$/.test(passage)) return false
  if (/^(act|scene|chapter|part|book|canto|prologue|epilogue|induction)\b[\s.:—-]*[ivxlcdm\d]*\.?$/i.test(passage)) return false
  if (passage === passage.toUpperCase() && !/[.?!]/.test(passage)) return false
  return wordCount(passage) >= 4
}

const SAMPLE_DEPTH = 8
const SAMPLE_DEPTH_DEEP = 20

/** Whole aligned paragraphs are the fallback; never guess sentence alignment.
 * The approved Odyssey excerpt has independently reviewed ends in both editions.
 * If either source changes, display their full shared paragraph instead. */
export function pairedSamples(bookId, keys, payloads) {
  const paragraphs = payloads.map(p => p?.paragraphs || p?.chapters?.[0]?.paragraphs || [])
  if (paragraphs.some(p => !p.length)) return keys.map(() => null)
  let index = 0
  if (bookId === 'odyssey') index = 1
  else {
    const textsAt = i => paragraphs.map(p => normalizePassage(p[i]))
    const indices = depth => Array.from({length: Math.min(depth, ...paragraphs.map(p => p.length))}, (_, i) => i)
    const byLength = (a,b) => {
      const distance = i => textsAt(i).reduce((sum,text) => sum + Math.abs(wordCount(text) - 50),0)
      return distance(a)-distance(b) || a-b
    }
    // The book's own words come first; a verse play may not reach its own
    // dialogue inside the opening handful of paragraphs, so widen the search
    // rather than fall back to the stage direction at index 0.
    let prose = indices(SAMPLE_DEPTH).filter(i => textsAt(i).every(isSampleProse))
    if (!prose.length) prose = indices(SAMPLE_DEPTH_DEEP).filter(i => textsAt(i).every(isSampleProse))
    // A passage that reads identically in every edition demonstrates nothing.
    const distinct = prose.filter(i => new Set(textsAt(i)).size === paragraphs.length)
    const substantial = distinct.filter(i => textsAt(i).every(text => wordCount(text) >= 15))
    index = [...substantial].sort(byLength)[0]
      ?? [...distinct].sort(byLength)[0]
      ?? [...prose].sort(byLength)[0]
      ?? 0
  }
  const full = paragraphs.map(p => normalizePassage(p[index]))
  const endings = {'original-en':'wanted to marry him.', 'modern-en':'wanting to marry him.'}
  const reviewed = bookId === 'odyssey' && keys.every((key,i) => endings[key] && full[i].includes(endings[key]))
  return full.map((text,i) => ({full:text, short:reviewed ? text.slice(0,text.indexOf(endings[keys[i]])+endings[keys[i]].length) : text, paragraphIndex:index}))
}
