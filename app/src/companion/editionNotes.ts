/**
 * Hidden companion notes about an edition's own numbering. They are context
 * for chat and Talk only, never shown in the reader. Pure: shared by the lab
 * client (Talk reference) and the Worker (chat system prompt).
 */

/**
 * The Catholic edition (webc-en) keeps Esther's Greek additions in story order
 * inside Esther 1–10, in square brackets, and gives Daniel's Greek chapters
 * their own titles. Locations checked against
 * public/data/editions/bible-webc-en.json on 2026-10-07:
 *  - Esther 1 opens with the bracketed dream (old 11:2–12) and plot (12:1–6).
 *  - Esther 3: bracketed first letter between verses 13 and 14 (old 13:1–7).
 *  - Esther 4: bracketed prayers of Mordecai and Esther from verse 18 to the end
 *    (old 13:8–18, 14:1–19).
 *  - Esther 5 opens with the Greek account of Esther before the king, unbracketed
 *    (old 15:1–16).
 *  - Esther 8: bracketed second letter within verse 13 (old 16:1–24).
 *  - Esther 10: bracketed from verse 4 to the end, including the closing note
 *    (old 10:4–13, 11:1).
 *  - "Daniel (Greek) 13" (Susanna) and "Daniel (Greek) 14" (Bel and the Dragon).
 *  - Daniel 3 carries verses 24–90 (Prayer of Azariah, Song of the Three).
 */
export const WEBC_NUMBERING_NOTE = [
  'Edition note (World English Bible, Catholic Edition), for locating passages only; mention it only when the reader\'s numbering needs it.',
  'This edition keeps the Greek additions to Esther in story order inside Esther 1–10, marked with square brackets. Some Catholic reading plans and older Bibles (Vulgate, Douay-Rheims, RSV-CE) number them Esther 10:4–16:24 instead. Map that numbering as follows:',
  '- 10:4–13 and 11:1 (Mordecai\'s dream explained; the closing note): end of Esther 10, bracketed, from verse 4.',
  '- 11:2–12 (Mordecai\'s dream) and 12:1–6 (the eunuchs\' plot): start of Esther 1, bracketed.',
  '- 13:1–7 (the king\'s first letter): Esther 3, bracketed, between verses 13 and 14.',
  '- 13:8–18 (Mordecai\'s prayer) and 14:1–19 (Esther\'s prayer): end of Esther 4, bracketed, from verse 18.',
  '- 15:1–16 (Esther goes before the king): start of Esther 5.',
  '- 16:1–24 (the king\'s second letter): Esther 8, bracketed, within verse 13.',
  'Daniel 13 (Susanna) and Daniel 14 (Bel and the Dragon) are titled "Daniel (Greek) 13" and "Daniel (Greek) 14". The Prayer of Azariah and the Song of the Three (Daniel 3:24–90) are inside Daniel 3.',
].join('\n')

function isCatholicBibleEdition(bookId: string | undefined, editionKey: string | undefined): boolean {
  return bookId === 'bible' && typeof editionKey === 'string' && /^(bible-)?webc(-|$)/.test(editionKey)
}

/** The hidden numbering note for this book and edition, or null when there is none. */
export function editionNumberingNote(bookId: string | undefined, editionKey: string | undefined): string | null {
  return isCatholicBibleEdition(bookId, editionKey) ? WEBC_NUMBERING_NOTE : null
}
