/**
 * Which books search engines may index beyond their book page (Anders, 16 Nov 2026,
 * docs/seo-chapter-pages-brief-2026-11-16.md).
 *
 * Every book with an unheld Modern English edition has chapter pages at /read/{book}/chapter-N, and every
 * reader can open them. Only a book listed here gets them indexed: a self-canonical, no robots tag, and a
 * place in the sitemap. Every other book's chapter pages carry `noindex, follow` (meta tag and X-Robots-Tag)
 * and stay out of the sitemap. Later waves are switched on by adding ids here, after Search Console results.
 *
 * A book whose edition source is unknown (no translator and year in the registry, see editionSources.ts)
 * cannot be indexed even when listed: the build leaves its pages `noindex, follow` and names it.
 */
export const SEO_INDEX_ALLOWLIST: readonly string[] = [
  // Wave 1 (16 Nov 2026)
  'crime-and-punishment',
  'brothers-karamazov',
  'anna-karenina',
  'notes-from-underground',
  'war-and-peace',
  'ivan-ilyich',
  'pride-and-prejudice',
  'sense-and-sensibility',
  'jane-eyre',
  'wuthering-heights',
  'middlemarch',
  'moby-dick',
  'frankenstein',
  'great-expectations',
  'heart-of-darkness',
  // Wave 2 (19 Nov 2026, docs/seo-brief-2026-11-19.md). master-and-margarita is left out (Anders, 20 Nov 2026): it is
  // blocked in the US and Russia, where most crawling happens; its note is approved and shown all the same.
  'odyssey',
  'oresteia',
  'the-histories',
  'beowulf',
]
