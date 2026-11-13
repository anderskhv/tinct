/**
 * The scene pages the build wrote (scripts/seo/build-scene-pages.mjs; manifest committed beside the book data).
 * The Worker serves /read/{bookId}/{scene} only for a scene in this list, and sends a play's retired chapter-N
 * address to the scene page of that chapter.
 */
import manifest from '../../data/scenePages.generated.json'

type SceneEntry = { chapter: number; slug: string; title: string }
const BOOKS = (manifest as { books: Record<string, SceneEntry[]> }).books

export function isScenePage(bookId: string, slug: string): boolean {
  return !!BOOKS[bookId]?.some(scene => scene.slug === slug)
}

/** `/read/{bookId}/{scene}` for the scene that is chapter `chapter` of the book's editions, or null. */
export function scenePageForChapter(bookId: string, chapter: number): string | null {
  const scene = BOOKS[bookId]?.find(entry => entry.chapter === chapter)
  return scene ? `/read/${bookId}/${scene.slug}` : null
}

/** Every scene of a book, in reading order (empty for a book without scene pages). */
export function scenePagesOf(bookId: string): readonly SceneEntry[] {
  return BOOKS[bookId] ?? []
}
