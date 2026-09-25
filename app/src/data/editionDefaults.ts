import { editionDifficulty } from '../lab/editionDifficulty'
import type { Edition } from '../types'

/**
 * Default editions, approved 2026-09-25. One policy for every entry point:
 * the library, handoffs, the reader and the legacy app.
 *
 * - Read: Tinct Modern English; the Bible reads the Berean Standard Bible.
 *   The audiobook follows the main edition.
 * - Compare: the original for more recent English works (1700 on, e.g.
 *   Pride and Prejudice, The Awakening); otherwise the easiest-to-read human
 *   translation, by the reviewed difficulty ratings.
 *
 * These are defaults only. A reader's saved edition for a book always wins.
 */
type EditionLike = Pick<Edition, 'key' | 'style' | 'language'> & { aligned?: boolean }

const DIFFICULTY_RANK = { Easy: 0, Medium: 1, Hard: 2 } as const
const RECENT_ENGLISH_FROM = 1700

export function defaultPrimaryEditionKey(bookId: string, editions: readonly EditionLike[]): string | undefined {
  const byKey = (key: string) => editions.find(edition => edition.key === key)?.key
  return (bookId === 'bible' ? byKey('bsb-en') : undefined)
    ?? byKey('modern-en')
    ?? editions.find(edition => edition.style === 'modern' && edition.language === 'en')?.key
    ?? byKey('original-en')
    ?? editions.find(edition => edition.language === 'en')?.key
    ?? editions[0]?.key
}

export function defaultCompareEditionKey(
  bookId: string,
  editions: readonly EditionLike[],
  primaryKey: string | undefined,
  year?: number | null,
): string | undefined {
  const comparable = editions.filter(edition => edition.key !== primaryKey && edition.aligned !== false)
  const human = comparable.filter(edition => edition.style !== 'modern' && edition.language === 'en')
  // An English work has no non-English original in the catalogue.
  const englishWork = !editions.some(edition => edition.style === 'original' && edition.language !== 'en')
  const original = human.find(edition => edition.key === 'original-en')
  if (englishWork && original && typeof year === 'number' && year >= RECENT_ENGLISH_FROM) return original.key
  const rank = (edition: EditionLike) => {
    const rated = editionDifficulty(bookId, edition as Edition)
    return rated ? DIFFICULTY_RANK[rated] : DIFFICULTY_RANK.Medium
  }
  // Stable: equal ratings keep registry order.
  const easiest = human.map((edition, index) => ({ edition, index }))
    .sort((a, b) => rank(a.edition) - rank(b.edition) || a.index - b.index)[0]?.edition
  return easiest?.key ?? comparable[0]?.key
}
