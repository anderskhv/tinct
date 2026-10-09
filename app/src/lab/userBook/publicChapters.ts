/**
 * A converted EPUB's chapters as Add to Tinct sends them (libraryAdd.ts): the
 * text, what each paragraph is beyond prose (`kinds`: verse lines, a poem's
 * title), and a chapter's own writer. An added book publishes no pictures, so
 * a picture's place in the text becomes its caption, or nothing; its kinds
 * stay in step. The Worker checks every paragraph against the EPUB
 * (worker/lib/epubSource.ts). Pure.
 */
import type { UserBookChapter } from './userEdition'

/** A picture's place in the text: `\uFFFC` + its id, the paragraph's only word (labFigures.ts figureToken; not imported, so this page loads nothing of the reader's). */
const FIGURE_MARK = '\uFFFC'
const isFigureToken = (text: string) => text.length > 1 && text[0] === FIGURE_MARK && !/\s/.test(text)

export interface PublicChapterUpload {
  number: number
  title: string
  paragraphs: string[]
  kinds?: Array<NonNullable<UserBookChapter['kinds']>[number]>
  author?: string
}

/**
 * The longest paragraph sent. The Worker refuses a book with any paragraph over
 * 60,000 characters (publicBooks.ts LIMITS); Montaigne's Essays (pg:3600) keep a
 * 68,000-character <pre> block, so the add failed as "could not be read from its
 * library" (production QA, 9 Oct 2026). Longer ones are split, at a blank line,
 * else a line break, else a sentence end, else a space; each piece is still the
 * source's own text, so the Worker's check against the EPUB holds.
 */
export const PUBLIC_PARAGRAPH_CHARS = 20_000

export function splitLongParagraph(text: string, max = PUBLIC_PARAGRAPH_CHARS): string[] {
  const pieces: string[] = []
  let rest = text
  while (rest.length > max) {
    const window = rest.slice(0, max)
    const at = [/\n\s*\n(?=\S)/g, /\n(?=\S)/g, /[.!?;:][”’"')\]]*\s+(?=\S)/g, /\s+(?=\S)/g]
      .map(pattern => { let found = -1; for (const match of window.matchAll(pattern)) if (match.index! > max / 4) found = match.index! + match[0].length; return found })
      .find(found => found > 0) ?? max
    const head = rest.slice(0, at).trim()
    if (head) pieces.push(head)
    rest = rest.slice(at)
  }
  const tail = rest.trim()
  if (tail || !pieces.length) pieces.push(tail || text)
  return pieces
}

export function publicChapters(chapters: UserBookChapter[]): PublicChapterUpload[] {
  return chapters.map(chapter => {
    const captions = new Map((chapter.figures ?? []).map(figure => [figure.id, figure.caption ?? '']))
    const paragraphs: string[] = []
    const kinds: NonNullable<PublicChapterUpload['kinds']> = []
    chapter.paragraphs.forEach((text, index) => {
      if (isFigureToken(text)) {
        const caption = (captions.get(text.slice(FIGURE_MARK.length)) ?? '').trim()
        if (caption) { paragraphs.push(caption); kinds.push(null) }
        return
      }
      for (const piece of splitLongParagraph(text)) {
        paragraphs.push(piece)
        kinds.push(chapter.kinds?.[index] ?? null)
      }
    })
    return {
      number: chapter.number,
      title: chapter.title,
      paragraphs,
      ...(kinds.some(Boolean) ? { kinds } : {}),
      ...(chapter.author ? { author: chapter.author } : {}),
    }
  })
}
