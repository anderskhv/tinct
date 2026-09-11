export function normalizeLibraryText(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function titleKey(value) {
  return normalizeLibraryText(value).replace(/^(the|a|an)\s+/, '')
}

export function searchPublishedBooks(books, rawQuery) {
  const query = normalizeLibraryText(rawQuery)
  if (!query) return [...books]
  const exact = books.filter(book => normalizeLibraryText(book.title) === query || titleKey(book.title) === titleKey(query))
  if (exact.length) return exact
  return books.map(book => {
    const title = normalizeLibraryText(book.title)
    const author = normalizeLibraryText(book.author)
    const titleMatch = title.includes(query) || titleKey(book.title).includes(titleKey(query))
    const authorMatch = author.includes(query)
    if (!titleMatch && !authorMatch) return null
    return {
      book,
      score: (title.startsWith(query) ? 500 : titleMatch ? 300 : 0)
        + (author.startsWith(query) ? 240 : authorMatch ? 160 : 0),
    }
  }).filter(Boolean)
    .sort((left, right) => right.score - left.score || left.book.catalogueIndex - right.book.catalogueIndex)
    .map(result => result.book)
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function chapterIndex(structure, chapterNumber) {
  const exact = structure.chapters.findIndex(chapter => chapter.number === chapterNumber)
  return exact >= 0 ? exact : clamp(Math.trunc(chapterNumber || 1) - 1, 0, structure.chapters.length - 1)
}

/**
 * Books read out of order. Their "N% read" is the paragraph-weighted set of
 * chapters the reader has finished, not the distance of the current place
 * from the front cover (decision 2026-09-11: position for every book except
 * the Bible; the Bible uses finished chapters).
 */
export const NONLINEAR_BOOK_IDS = new Set(['bible'])

export function isNonlinearBook(bookId) {
  return NONLINEAR_BOOK_IDS.has(bookId)
}

/** How far into `chapter` the resume record sits, 0..1, viewport-independent when it can be. */
function chapterFraction(resume, chapter) {
  const pageFraction = Number.isInteger(resume?.page) && Number.isInteger(resume?.totalPages) && resume.totalPages > 0
    ? clamp((resume.page + clamp(Number(resume.scrollFraction) || 0, 0, 1)) / resume.totalPages, 0, 1)
    : 0
  const canonicalFraction = Number.isFinite(resume?.scrollFraction)
    ? clamp(resume.scrollFraction, 0, 1)
    : pageFraction
  const paragraphFraction = Number.isInteger(resume?.paragraphIndex) && chapter.paragraphCount > 0
    ? clamp(resume.paragraphIndex / chapter.paragraphCount, 0, 1)
    : 0
  return Math.max(canonicalFraction, paragraphFraction)
}

/**
 * Whole-book progress, in paragraphs read over paragraphs in the book.
 *
 *  - Linear books: every chapter before the resume chapter, plus the fraction
 *    of the resume chapter the place sits at. The legacy reader's monotonic
 *    `highestCompletedChapter` high-water mark is NOT consulted: one visit to
 *    Hebrews claimed Genesis→Philemon as read forever ("97% read" at Proverbs
 *    18), and for a linear book the place already says how far the reader is.
 *  - Non-linear books (the Bible): the paragraphs of every finished chapter
 *    (`options.finishedChapters`, sequential numbers from the reader's
 *    finished record and completed reading-memory sessions), plus the
 *    fraction of the resume chapter when it is not itself finished.
 *    Paragraph-weighted, so Psalm 117 and Psalm 119 are not worth the same.
 *    A missed completion reads low, never high.
 *
 * `options.completed` (an explicit book-completed mark) is 100 for both.
 */
export function wholeBookProgress(book, resume, options = {}) {
  if (options.completed) return 100
  const structure = book?.readingStructure
  if (!structure?.chapters?.length || !Number.isFinite(structure.totalParagraphs) || structure.totalParagraphs <= 0) return null
  const index = chapterIndex(structure, resume?.chapterNumber || 1)
  const chapter = structure.chapters[index]
  let completedUnits
  if (isNonlinearBook(book?.id)) {
    const finished = new Set(Array.isArray(options.finishedChapters) ? options.finishedChapters : [])
    completedUnits = structure.chapters.reduce((sum, item) => sum + (finished.has(item.number) ? item.paragraphCount : 0), 0)
    if (!finished.has(chapter.number)) completedUnits += chapterFraction(resume, chapter) * chapter.paragraphCount
  } else {
    const prior = structure.chapters.slice(0, index).reduce((sum, item) => sum + item.paragraphCount, 0)
    completedUnits = prior + chapterFraction(resume, chapter) * chapter.paragraphCount
  }
  return clamp((completedUnits / structure.totalParagraphs) * 100, 0, 99.9)
}

export function formatWholeBookProgress(percent) {
  if (percent === null || !Number.isFinite(percent)) return 'Continue reading'
  if (percent > 0 && percent < 1) return '<1% read'
  return `${Math.round(percent)}% read`
}
