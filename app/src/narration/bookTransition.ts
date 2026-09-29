/** Spoken navigation UI, separate from accepted edition text and paragraph IDs. */
export interface TransitionChapter { number?: number; title?: string }
export function bibleBookTransition(bookId: string, chapters: TransitionChapter[], current: number) {
  if (bookId !== 'bible') return null
  const at = chapters.findIndex(chapter => chapter.number === current)
  if (at < 0 || at + 1 >= chapters.length) return null
  const outgoing = chapters[at], incoming = chapters[at + 1]
  const parse = (title: unknown) => typeof title === 'string' && title.length <= 100
    ? title.trim().match(/^(.+\S)\s+([1-9]\d*)$/) : null
  const from = parse(outgoing.title), to = parse(incoming.title)
  if (!from || !to || to[2] !== '1' || from[1] === to[1]
    || !Number.isInteger(incoming.number) || incoming.number! < 1 || incoming.number === current) return null
  return {
    nextChapter: incoming.number!,
    completedBook: from[1], nextBook: to[1],
    text: `You have completed ${from[1]}. Next book: ${to[1]}.`,
  }
}
