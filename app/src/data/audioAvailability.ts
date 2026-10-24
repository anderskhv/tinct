import { editionHold, isBookTemporarilyHeld, isEditionLanguageOffered } from './editionAvailability'
import manifest from './audioAvailability.json'
/** Reversible discovery policy. Never use this to reject saved text locations. */
const held = new Set(manifest.held_editions.map(edition => edition.key))
const heldChapters = new Map(manifest.held_chapters.map(entry => [entry.key, new Set(entry.chapters)]))
const heldBooks = new Set(manifest.held_books)
export const isAudioHeld = (bookId: string, editionKey: string, chapter?: number): boolean => {
  const key = `${bookId}/${editionKey}`
  return held.has(key) || (chapter !== undefined && Boolean(heldChapters.get(key)?.has(chapter)))
}
export const isBookDiscoverable = (bookId: string): boolean => !isBookTemporarilyHeld(bookId) && (bookId === 'faust-part-1' || !heldBooks.has(bookId))
/**
 * Books held from browsing that a typed search still finds (Anders,
 * 2026-10-08: War and Peace). Search only: shelves, the empty search list,
 * links, the librarian and emails keep the hold.
 */
export const SEARCH_ONLY_BOOKS: ReadonlySet<string> = new Set(['war-and-peace'])
export const isBookSearchable = (bookId: string): boolean => isBookDiscoverable(bookId) || (!isBookTemporarilyHeld(bookId) && SEARCH_ONLY_BOOKS.has(bookId))
/**
 * Text discovery. Recording holds (the 2026-09-10 structural audio audit) keep
 * old recordings from playing; they no longer hide the text, which narration
 * now streams from (approved default editions, 2026-09-25). Danish stays out
 * of discovery under the English-first language scope, except the editions on
 * the explicit OFFERED_DANISH_EDITIONS allowlist (editionAvailability.ts).
 */
export const isEditionDiscoverable = (bookId: string, edition: { key: string; language: string }): boolean => isEditionLanguageOffered(bookId, edition) && !editionHold(bookId, edition.key)
/**
 * Editions published after the recorded (Kokoro/Bella) audio was made: they
 * are narrated by streaming only and have no chapter manifest, word sidecar
 * or MP3 on R2. Asking for one is a guaranteed 404 in the console, so the
 * reader never does. A test keeps this in step with the 2026-09-11 audio
 * census, the last inventory of recorded audio.
 */
export const STREAMED_ONLY_AUDIO_EDITIONS: ReadonlySet<string> = new Set([
  'alice-in-wonderland/modern-en',
  'alice-in-wonderland/original-en',
  'arabian-nights/modern-en',
  'arabian-nights/original-en',
  'bible/bsb-en',
  'bible/webc-en',
  'grimms-fairy-tales/modern-en',
  'grimms-fairy-tales/original-en',
  'middlemarch/modern-en',
  'middlemarch/original-en',
  'sense-and-sensibility/modern-en',
  'sense-and-sensibility/original-en',
  'to-the-lighthouse/modern-en',
  'to-the-lighthouse/original-en',
  'wuthering-heights/modern-en',
  'wuthering-heights/original-en',
])
/**
 * Text-only editions: no recording and no narration (`hasAudio: false`).
 * Offered Danish editions, including the reviewed 2026-10-24 additions: narration is disabled
 * (docs/audiobook-architecture-2026-09-21.md), so nothing is ever recorded.
 */
export const TEXT_ONLY_EDITIONS: ReadonlySet<string> = new Set([
  'to-the-lighthouse/modern-da',
  'a-little-princess/modern-da',
  'around-the-world-80-days/modern-da',
  'jungle-book/modern-da',
  'grimms-fairy-tales/modern-da',
  'arabian-nights/modern-da',
  'pride-and-prejudice/modern-da',
  'moby-dick/modern-da',
  'crime-and-punishment/modern-da',
  'the-prince/modern-da',
  'confessions/modern-da',
  'alice-in-wonderland/modern-da',
  'bacchae/modern-da',
  'magna-carta/modern-da',
  'medea/modern-da',
  'meditations/modern-da',
  'middlemarch/modern-da',
  'the-art-of-war/modern-da',
  'wuthering-heights/modern-da',
])
/** Whether an edition has recorded chapter audio (manifest, sidecar, MP3s) to ask for. */
export const hasRecordedAudio = (bookId: string, editionKey: string): boolean => !STREAMED_ONLY_AUDIO_EDITIONS.has(`${bookId}/${editionKey}`) && !TEXT_ONLY_EDITIONS.has(`${bookId}/${editionKey}`)
