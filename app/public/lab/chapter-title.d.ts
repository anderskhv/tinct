// Types for chapter-title.js (imported by the reader bundle, the EPUB converter and the Worker).
export interface ChapterTitleOptions { language?: string | null }
export function romanValue(text: string): number | null
export function normalizeChapterTitle(title: string, options?: ChapterTitleOptions): string
export function normalizeTitleList<T extends string | null | undefined>(titles: T[], options?: ChapterTitleOptions): T[]
export function normalizeChapterTitles<T extends { title: string }>(chapters: T[], options?: ChapterTitleOptions): T[]
