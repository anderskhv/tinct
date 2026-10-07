/**
 * Editions whose text comes under a licence that asks for attribution where
 * the text is published. Everything else is public domain (or Tinct's own
 * rendering of a public-domain text) and needs none.
 *
 * Source of truth: the comments on these editions in bookRegistry.ts and
 * docs/replacement-release-2026-10-01.md. Keep this list in step with them
 * when an edition is added or replaced.
 */

export interface EditionLicence {
  /** Who the text is credited to, as the licence asks. */
  attribution: string
  licence: string
  licenceUrl: string
}

const WIKISOURCE_BY_SA: Omit<EditionLicence, 'attribution'> = {
  licence: 'CC BY-SA 4.0',
  licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
}

const EDITION_LICENCES: Record<string, EditionLicence> = {
  // Arthur S. Way, The Tragedies of Euripides in English Verse (Macmillan, 1894 and 1898),
  // from the Wikisource transcription. Tinct's Modern English is shared under the same licence.
  'medea/original-en': { attribution: 'Text: Wikisource contributors', ...WIKISOURCE_BY_SA },
  'medea/modern-en': { attribution: 'Adapted from the Wikisource transcription (Wikisource contributors)', ...WIKISOURCE_BY_SA },
  'bacchae/original-en': { attribution: 'Text: Wikisource contributors', ...WIKISOURCE_BY_SA },
  'bacchae/modern-en': { attribution: 'Adapted from the Wikisource transcription (Wikisource contributors)', ...WIKISOURCE_BY_SA },
}

export function editionLicence(bookId: string, editionKey: string): EditionLicence | null {
  return EDITION_LICENCES[`${bookId}/${editionKey}`] ?? null
}
