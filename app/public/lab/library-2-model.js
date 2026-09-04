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

export function wholeBookProgress(book, resume, progressRecord = null, completed = false) {
  if (completed) return 100
  const structure = book?.readingStructure
  if (!structure?.chapters?.length || !Number.isFinite(structure.totalParagraphs) || structure.totalParagraphs <= 0) return null
  const index = chapterIndex(structure, resume?.chapterNumber || 1)
  const chapter = structure.chapters[index]
  const prior = structure.chapters.slice(0, index).reduce((sum, item) => sum + item.paragraphCount, 0)
  const pageFraction = Number.isInteger(resume?.page) && Number.isInteger(resume?.totalPages) && resume.totalPages > 0
    ? clamp((resume.page + clamp(Number(resume.scrollFraction) || 0, 0, 1)) / resume.totalPages, 0, 1)
    : 0
  const canonicalFraction = Number.isFinite(resume?.scrollFraction)
    ? clamp(resume.scrollFraction, 0, 1)
    : pageFraction
  const paragraphFraction = Number.isInteger(resume?.paragraphIndex) && chapter.paragraphCount > 0
    ? clamp(resume.paragraphIndex / chapter.paragraphCount, 0, 1)
    : 0
  let completedUnits = prior + Math.max(canonicalFraction, paragraphFraction) * chapter.paragraphCount
  const highest = Number.isInteger(progressRecord?.highestCompletedChapter)
    ? clamp(progressRecord.highestCompletedChapter, 0, structure.chapters.length)
    : 0
  if (highest > 0) {
    completedUnits = Math.max(completedUnits, structure.chapters.slice(0, highest).reduce((sum, item) => sum + item.paragraphCount, 0))
  }
  return clamp((completedUnits / structure.totalParagraphs) * 100, 0, 99.9)
}

export function formatWholeBookProgress(percent) {
  if (percent === null || !Number.isFinite(percent)) return 'Continue reading'
  if (percent > 0 && percent < 1) return '<1% read'
  return `${Math.round(percent)}% read`
}
