// A book's printed table of contents, set as text ("CONTENTS. / PAGE / Of Providence 1 /
// Of Anger. I. 48 / " II. 76"), left out of imported books: the reader has its own
// chapter menu, and a page of page numbers that lead nowhere is not part of the text.
//
// Used where a public-domain or own EPUB becomes chapters: the EPUB converter
// (src/lab/userBook/epubEdition.ts, which never makes a chapter of the EPUB's
// navigation document in the first place) and the Worker's Add to Tinct publish
// (worker/routes/publicBooks.ts), for Project Gutenberg and Wikisource alike.
// No browser APIs.
//
// A contents is found two ways:
//   - under a contents heading (CONTENTS, TABLE OF CONTENTS, …), as the chapter's own
//     title or a heading inside it: a run of short lines most of which read as entries;
//   - without a heading, only when nearly every line is an entry and most of them name
//     the book's own chapters (a list of the chapters, nothing else).
// An entry ends with a page number ("… 22", "…… xiv"), starts with a ditto mark (" II. 76),
// is numbered ("CHAPTER I. …", "IV OLIVER …", "3. …"), or names one of the book's chapters.
// Prose (long paragraphs, sentences) never reads as an entry, nor do poems' line numbers
// alone, so a short chapter with numbers or numbered verse is left as it is.

const CONTENTS_HEADING = /^(?:(?:the\s+)?(?:table\s+of\s+)?contents?(?:\s+of\s+(?:the\s+)?(?:volume|vol|book|part)\b.*)?|(?:detailed|analytical|general)\s+contents|list\s+of\s+(?:chapters|contents)|index\s+of\s+chapters|chapters(?:\s*\([^)]*\))?|inhalt|inhaltsverzeichnis|table\s+des\s+mati[eè]res|[ií]ndice|innehåll|indhold|innhold|sisällys(?:luettelo)?|spis\s+treści)$/iu
/** Column headers of a printed contents: "PAGE", "CHAP. PAGE", "Page". */
const COLUMN_HEADER = /^(?:(?:chap(?:ter)?|page|pages|p|pp|book|part|no)\.?\s*){1,3}$/iu
const LABEL_START = /^(?:chapter|chap|book|part|volume|vol|act|scene|canto|letter|section|stave|essay|lecture|discourse|sermon|dialogue|oration|epistle|ode|psalm|appendix)\.?\s+(?:\d{1,4}|[ivxlcdm]{1,8}|the\s+\p{L}+|[a-z]+(?:-[a-z]+)?)\b/iu
const BARE_ROMAN_START = /^[IVXLC]{1,8}(?:[.:)]|\s+[—–-]|\s)\s*\S/u
const ARABIC_START = /^\d{1,3}[.)]?\s+[\p{Lu}“"‘(_]/u
const DITTO = /^(?:["”〃]|''|do\.)\s*\S/u
/** A page reference at the end of an entry: "… 22", "…… 22", "… xiv", "… 48." */
const PAGE_END = /(?:\s*(?:\.\s*){2,}|\s+)(?:\d{1,4}|[ivxlc]{1,7})\.?$/u

const plainText = text => String(text || '').replace(/(^|\s)_|_(\s|$)/g, '$1$2').replace(/\s+/g, ' ').trim()
const words = text => (text.match(/\S+/g) || []).length
const key = text => plainText(text).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

/** Whether `text` is a contents heading ("CONTENTS.", "Table of Contents", "5CONTENTS."). */
export function isContentsHeading(text) {
  const t = plainText(text).replace(/^\d{1,4}(?=\p{Lu}\p{L})/u, '').replace(/[.:]+$/, '').trim()
  return t.length > 0 && t.length <= 60 && CONTENTS_HEADING.test(t)
}

/**
 * The book's chapter titles as keys (four letters or more), built once per book, for
 * "names one of the book's chapters". A chapter is asked about the others' titles, so
 * its own key is left out (`exclude`) unless another chapter has the same title.
 *
 * Built once rather than per chapter, and asked by lookup rather than title by title:
 * the per-chapter list made a book of N chapters cost N² (Gutenberg Add to Tinct check,
 * 2026-10-09: the Worker's publish spent ~15 s here on a 1,200-chapter book and ~26 s
 * in all on Shakespeare's Complete Works, near its CPU limit). The answers are the same.
 */
function titleIndex(titles) {
  const keys = (titles || []).map(key)
  const counts = new Map()
  for (const k of keys) if (k.length >= 4) counts.set(k, (counts.get(k) || 0) + 1)
  // Every key once, each between newlines: a run of whole words found in it is in one title.
  let joined = '\n'
  let longest = 0
  for (const k of counts.keys()) {
    joined += ` ${k} \n`
    if (k.includes(' ')) longest = Math.max(longest, k.split(' ').length)
  }
  return { keys, counts, joined, longest }
}

/** The index as chapter `index` asks it: every other chapter's title. */
function othersOf(names, index) {
  const own = index == null ? '' : names.keys[index]
  return { ...names, exclude: own && names.counts.get(own) === 1 ? own : null }
}

/** How many distinct titles the asking chapter sees. */
const titleCount = names => names.counts.size - (names.exclude ? 1 : 0)

/** Whether a line names a chapter: equal, or one contains the other as whole words (two words or more). */
function namesChapter(line, names) {
  const k = key(line.replace(PAGE_END, ''))
  if (!k || k.length < 4) return false
  const other = title => title !== names.exclude
  if (names.counts.has(k) && other(k)) return true
  if (!k.includes(' ')) return false
  // The line within a title.
  const needle = ` ${k} `
  for (let at = names.joined.indexOf(needle); at >= 0; at = names.joined.indexOf(needle, at + 1)) {
    const start = names.joined.lastIndexOf('\n', at) + 2
    if (other(names.joined.slice(start, names.joined.indexOf('\n', at) - 1))) return true
  }
  // A title of two words or more within the line.
  const parts = k.split(' ')
  for (let length = 2; length <= Math.min(names.longest, parts.length); length++) {
    for (let from = 0; from + length <= parts.length; from++) {
      const title = parts.slice(from, from + length).join(' ')
      if (names.counts.has(title) && other(title)) return true
    }
  }
  return false
}

/** How a line reads in a contents: 'header' (PAGE), 'entry', or null. */
function lineKind(text, names, underHeading) {
  const t = plainText(text)
  if (!t) return 'header'
  // A column header, or a contents table's number cell read as a line of its own ("1.", "57").
  if (COLUMN_HEADER.test(t) || /^(?:\d{1,4}|[ivxlcdm]{1,7}|[IVXLCDM]{1,7})\.?$/u.test(t)) return 'header'
  const n = words(t)
  if (n > 45) return null
  if (DITTO.test(t)) return 'entry'
  if (n <= 25 && PAGE_END.test(t) && /\p{L}/u.test(t.replace(PAGE_END, ''))) {
    // A page number, never a year closing a sentence ("… born in 1805.").
    const page = t.match(/(\d{1,4}|[ivxlc]{1,7})\.?$/u)?.[1] || ''
    const sentence = /[.!?]\s*$/.test(t) && /^\d{4}$/.test(page)
    if (!sentence) return 'entry'
  }
  if (LABEL_START.test(t) || ARABIC_START.test(t)) return 'entry'
  if (BARE_ROMAN_START.test(t) && !/^I\s+\p{Ll}/u.test(t)) return 'entry'
  if (namesChapter(t, names)) return 'entry'
  // Under a contents heading, a short title-like line (no sentence) is an entry too.
  if (underHeading && n <= 14 && !/[.!?;]["”’)]?$/.test(t.replace(/\b(?:\p{L}|mr|mrs|dr|st)\.$/iu, '')) && /^[\p{Lu}“"‘(\d]/u.test(t)) return 'entry'
  return null
}

/**
 * The printed contents in a chapter's paragraphs, as [start, end) to remove, or null.
 * `titles` are the book's chapter titles (others than this one); `heading` says the
 * chapter's own title is a contents heading. (`names`, from dropPrintedContents: the
 * whole book's titles indexed once, as this chapter sees them.)
 */
export function printedContentsRange(paragraphs, { titles = [], heading = false, names: indexed = null, front = false } = {}) {
  if (!Array.isArray(paragraphs) || !paragraphs.length) return null
  const names = indexed || othersOf(titleIndex(titles), null)
  const scan = (from, underHeading, skipLead) => {
    let entries = 0, others = 0, last = -1, lead = 0, i = from
    for (; i < paragraphs.length; i++) {
      const text = paragraphs[i]
      if (typeof text !== 'string') break
      if (words(plainText(text)) > 45) break
      const kind = lineKind(text, names, underHeading)
      if (kind === 'header') continue
      if (kind === 'entry') { entries++; last = i; continue }
      // A title page before the first entry (book title, author, translator) is not counted.
      if (!entries && skipLead && lead < 6) { lead++; continue }
      others++
      // A sentence of prose, or two lines in a row that are not entries, end the contents.
      if (entries && words(plainText(text)) > 20) break
      if (i + 1 < paragraphs.length && lineKind(paragraphs[i + 1], names, underHeading) !== 'entry') break
    }
    return { entries, others, last }
  }
  // The chapter's title is the contents heading: its text from the start.
  if (heading) {
    const { entries, others, last } = scan(0, true, true)
    if (entries >= 3 && entries / (entries + others) >= 0.6) return endRange(paragraphs, 0, last)
    return null
  }
  // A contents heading inside the chapter (after a title page, say).
  for (let at = 0; at < Math.min(paragraphs.length, 400); at++) {
    if (!isContentsHeading(paragraphs[at])) continue
    const { entries, others, last } = scan(at + 1, true, false)
    if (entries >= 3 && entries / (entries + others) >= 0.6) return endRange(paragraphs, at, last)
  }
  // No heading: a list of the book's own chapters and nothing else.
  const listed = titleCount(names) >= 3 && paragraphs.length >= 5 && paragraphs.length <= 600 && (() => {
    let entries = 0, named = 0, counted = 0
    const allowed = Math.floor(paragraphs.length * 0.1)
    for (const text of paragraphs) {
      // Prose gives itself away at once: stop at the first long paragraph or too many non-entries.
      if (typeof text !== 'string' || words(plainText(text)) > 45) return null
      const kind = lineKind(text, names, false)
      if (kind === 'header') continue
      counted++
      if (kind === 'entry') entries++
      else if (counted - entries > allowed) return null
      if (namesChapter(plainText(text), names)) named++
    }
    return counted >= 5 && entries / counted >= 0.9 && named >= 5 && named / counted >= 0.6
  })()
  if (listed) return [0, paragraphs.length]
  // The book's opening chapter, a title page over its contents without a heading (Memoirs of
  // Victor Hugo, 2026-10-12: "By Victor Hugo", then 84 lines of parts and dates, 48 of them the
  // book's own chapter titles): short lines only, and many of them name the book's chapters.
  if (front && titleCount(names) >= 10 && paragraphs.length >= 10 && paragraphs.length <= 600) {
    let counted = 0, named = 0
    for (const text of paragraphs) {
      if (typeof text !== 'string' || words(plainText(text)) > 12) return null
      if (lineKind(text, names, false) === 'header') continue
      counted++
      if (namesChapter(plainText(text), names)) named++
    }
    if (counted >= 10 && named >= 10 && named / counted >= 0.4) return [0, paragraphs.length]
  }
  return null
}

/** The range through the last entry, with a short leftover at the chapter's end (a bookmarks line). */
function endRange(paragraphs, start, last) {
  let end = last + 1
  // The last entry's page number, set as a line of its own ("285").
  while (end < paragraphs.length && /^(?:\d{1,4}|[ivxlcdm]{1,7})\.?$/u.test(plainText(paragraphs[end]))) end++
  const rest = paragraphs.slice(end)
  if (rest.length && rest.length <= 2 && rest.every(text => words(plainText(text)) <= 6)) end = paragraphs.length
  return [start, end]
}

/** A chapter left with nothing but a few short lines (the title page above a contents) is dropped whole. */
function onlyTitleLines(paragraphs) {
  return paragraphs.length <= 6 && paragraphs.every(text => typeof text === 'string' && words(plainText(text)) <= 12)
}

/**
 * Chapters without their printed contents. A chapter that is a contents is dropped; a
 * contents inside a chapter is cut out of it (with its kinds, links and figures kept in
 * step). Chapters are renumbered 1…n. Returns the same array when nothing was found.
 */
export function dropPrintedContents(chapters) {
  if (!Array.isArray(chapters) || chapters.length < 2) return chapters
  const book = titleIndex(chapters.map(chapter => chapter?.title || ''))
  let changed = false
  const out = []
  chapters.forEach((chapter, index) => {
    if (!chapter || !Array.isArray(chapter.paragraphs)) { out.push(chapter); return }
    const heading = isContentsHeading(chapter.title)
    const range = printedContentsRange(chapter.paragraphs, { names: othersOf(book, index), heading, front: index === 0 })
    if (!range) { out.push(chapter); return }
    changed = true
    const [start, end] = range
    const kept = chapter.paragraphs.filter((_, i) => i < start || i >= end)
    if (!kept.length || ((heading || start <= 6) && onlyTitleLines(kept) && chapter.paragraphs.slice(0, start).every(text => words(plainText(text)) <= 12))) return
    out.push(cutParagraphs(chapter, start, end))
  })
  // A book is never left without chapters.
  if (!changed || !out.some(chapter => chapter?.paragraphs?.length)) return chapters
  return out.map((chapter, index) => chapter && chapter.number !== index + 1 ? { ...chapter, number: index + 1 } : chapter)
}

/** `chapter` without paragraphs [start, end), its per-paragraph structure kept in step. */
function cutParagraphs(chapter, start, end) {
  const width = end - start
  const next = { ...chapter, paragraphs: chapter.paragraphs.filter((_, i) => i < start || i >= end) }
  if (Array.isArray(chapter.kinds)) next.kinds = chapter.kinds.filter((_, i) => i < start || i >= end)
  if (Array.isArray(chapter.links)) {
    next.links = chapter.links.filter(link => link[0] < start || link[0] >= end).map(link => link[0] >= end ? [link[0] - width, ...link.slice(1)] : link)
    if (!next.links.length) delete next.links
  }
  if (Array.isArray(chapter.figures)) {
    // A figure's paragraph is its token (a mark and the figure's id, src/lab/labFigures.ts).
    const removed = chapter.paragraphs.slice(start, end)
    next.figures = chapter.figures.filter(figure => !figure?.id || !removed.some(text => text.endsWith(figure.id) && text.length <= figure.id.length + 4))
    if (!next.figures.length) delete next.figures
  }
  return next
}
