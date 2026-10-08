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
      paragraphs.push(text)
      kinds.push(chapter.kinds?.[index] ?? null)
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
