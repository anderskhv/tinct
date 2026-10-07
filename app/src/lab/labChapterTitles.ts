/**
 * Chapter titles as the reader shows them: Tinct's house style
 * (public/lab/chapter-title.js), applied when a book loads, so a built-in,
 * added or own book reads "Chapter 1 — M. Myriel" however its text writes it.
 * Edition files are never rewritten; chapter identity is the number, not the title.
 * The Bible keeps its own titles ("Psalms 19", "1 Kings 3"), which the rules leave as they are anyway.
 */
import { normalizeChapterTitle, normalizeChapterTitles } from '../../public/lab/chapter-title.js'
import type { Section } from '../types'
import type { LabSource } from './labSource'

export { normalizeChapterTitle }

export function houseStyleChapters<T extends { title: string }>(chapters: T[], language?: string | null): T[] {
  return normalizeChapterTitles(chapters, { language })
}

/** Contents sections ("Part I") in the same style, so "Part 1, Chapter 2" still files under "Part 1". */
export function houseStyleSections(sections: Section[] | undefined, language?: string | null): Section[] | undefined {
  return sections?.map(section => ({
    ...section,
    title: normalizeChapterTitle(section.title, { language }),
    ...(section.sections ? { sections: houseStyleSections(section.sections, language) } : {}),
  }))
}

/** A loaded book with its chapter titles in house style (the chapter on screen and the Contents). */
export function houseStyleSource(source: LabSource, language?: string | null): LabSource {
  const title = (text: string) => normalizeChapterTitle(text, { language })
  return {
    ...source,
    chapterLabel: title(source.chapterLabel),
    chapterTitle: title(source.chapterTitle),
    headerChapter: title(source.headerChapter),
    chapters: houseStyleChapters(source.chapters, language),
    ...(source.sections ? { sections: houseStyleSections(source.sections, language) } : {}),
  }
}
