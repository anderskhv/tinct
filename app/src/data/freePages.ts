/**
 * The free pages' addresses: one page per language, each listing the books of one edition and opening the reader's
 * free reading mode (src/seo/modernEnglishPage.ts renders them; src/lab/freeMode reads the `ref` they link with).
 *
 * A page's slug is both its path (`/{slug}`) and the `ref` its book links carry. To rename the Danish page, change
 * DANISH_FREE_PAGE_SLUG and DANISH_FREE_PAGE_HEADLINE here; the generated file's name in app/.gitignore, the dev route
 * in vite.config.ts and the Worker's route follow the slug (freePages.test.ts checks the two hand-kept files).
 */
export const MODERN_ENGLISH_PAGE_SLUG = 'modern-english'

/** "Klassikere på nutidsdansk" (Anders, 23 Nov 2026). */
export const DANISH_FREE_PAGE_SLUG = 'nutidsdansk'
/** The Danish page's headline; `count` is the number of books rounded down to the nearest ten. */
export const DANISH_FREE_PAGE_HEADLINE = (count: number): string => `${count}+ klassikere på nutidsdansk. Gratis.`
