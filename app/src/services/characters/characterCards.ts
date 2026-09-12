export interface PassagePoint { chapterNumber: number; paragraphIndex: number; offset: number }
interface Snapshot { availableAt: PassagePoint; name: string; subtitle: string; body: string }
interface Character { id: string; kind: string; storyRole: string; roleVisibleAt: PassagePoint; firstMention: PassagePoint; snapshots: Snapshot[] }
interface Mention { characterId: string; chapterNumber: number; paragraphIndex: number; startOffset: number; endOffset: number; text: string }
export interface CharacterEdition { sourceSha256: string; paragraphHashes: Record<string, string[]>; characters: Character[]; mentions: Mention[] }
export interface CharacterAsset { schemaVersion: number; bookId: string; language: string; normalization: string; offsetUnit: string; editions: Record<string, CharacterEdition> }
export interface ReleasedCard { id: string; kind: string; role: string | null; name: string; subtitle: string; body: string }
export interface CharacterSelection { card: ReleasedCard; cutoff: PassagePoint; gallery: { card: ReleasedCard; inPassage: boolean }[] }
export interface VerifiedCharacters { edition: CharacterEdition; paragraphs: Record<string, string[]> }
export const normalizeParagraph = (text: string) => text.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
export const comparePoint = (a: PassagePoint, b: PassagePoint) => a.chapterNumber - b.chapterNumber || a.paragraphIndex - b.paragraphIndex || a.offset - b.offset
export async function sha256(data: string | ArrayBuffer): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('')
}
const EN = ['original-en', 'modern-en']
/**
 * Released character packages: the editions each package was reviewed against,
 * and the release revision that versions its sidecar URL. Bump the revision when
 * a package is re-published so readers stop hitting the immutable old URL.
 */
export const characterReleases: Record<string, { editions: string[]; revision: string }> = {
  // 2026-09-09.2 — pilots
  'the-awakening': { editions: EN, revision: '2026-09-09.2' },
  bible: { editions: ['kjv-en', 'web-en'], revision: '2026-09-09.2' },
  // 2026-09-10.1 — Hamlet, Macbeth, four philosophy/reference, nine plays
  hamlet: { editions: EN, revision: '2026-09-10.1' },
  macbeth: { editions: EN, revision: '2026-09-10.1' },
  crito: { editions: EN, revision: '2026-09-10.1' },
  apology: { editions: EN, revision: '2026-09-10.1' },
  'the-manual': { editions: EN, revision: '2026-09-10.1' },
  'the-art-of-war': { editions: EN, revision: '2026-09-10.1' },
  'measure-for-measure': { editions: EN, revision: '2026-09-10.1' },
  'henry-v': { editions: EN, revision: '2026-09-10.1' },
  'winters-tale': { editions: EN, revision: '2026-09-10.1' },
  cymbeline: { editions: EN, revision: '2026-09-10.1' },
  coriolanus: { editions: EN, revision: '2026-09-10.1' },
  'antony-and-cleopatra': { editions: EN, revision: '2026-09-10.1' },
  'richard-iii': { editions: EN, revision: '2026-09-10.1' },
  'henry-iv-part-2': { editions: EN, revision: '2026-09-10.1' },
  'merry-wives-of-windsor': { editions: EN, revision: '2026-09-10.1' },
  // 2026-09-11.1 — three reference packages
  'us-founding-documents': { editions: EN, revision: '2026-09-11.1' },
  'kant-groundwork': { editions: EN, revision: '2026-09-11.1' },
  'descartes-meditations': { editions: EN, revision: '2026-09-11.1' },
  // 2026-09-11.2 — bulk release of the validated queue
  'a-little-princess': { editions: EN, revision: '2026-09-11.2' },
  antigone: { editions: EN, revision: '2026-09-11.2' },
  'around-the-world-80-days': { editions: EN, revision: '2026-09-11.2' },
  bacchae: { editions: EN, revision: '2026-09-11.2' },
  beowulf: { editions: EN, revision: '2026-09-11.2' },
  candide: { editions: EN, revision: '2026-09-11.2' },
  'comedy-of-errors': { editions: EN, revision: '2026-09-11.2' },
  'communist-manifesto': { editions: EN, revision: '2026-09-11.2' },
  'discourse-on-inequality': { editions: EN, revision: '2026-09-11.2' },
  'frederick-douglass': { editions: EN, revision: '2026-09-11.2' },
  gilgamesh: { editions: EN, revision: '2026-09-11.2' },
  'heart-of-darkness': { editions: EN, revision: '2026-09-11.2' },
  'hume-enquiry': { editions: EN, revision: '2026-09-11.2' },
  'ivan-ilyich': { editions: EN, revision: '2026-09-11.2' },
  'jekyll-and-hyde': { editions: EN, revision: '2026-09-11.2' },
  'julius-caesar': { editions: EN, revision: '2026-09-11.2' },
  'jungle-book': { editions: EN, revision: '2026-09-11.2' },
  'king-lear': { editions: EN, revision: '2026-09-11.2' },
  medea: { editions: EN, revision: '2026-09-11.2' },
  'merchant-of-venice': { editions: EN, revision: '2026-09-11.2' },
  midsummer: { editions: EN, revision: '2026-09-11.2' },
  'much-ado-about-nothing': { editions: EN, revision: '2026-09-11.2' },
  'notes-from-underground': { editions: EN, revision: '2026-09-11.2' },
  'oedipus-at-colonus': { editions: EN, revision: '2026-09-11.2' },
  'oedipus-rex': { editions: EN, revision: '2026-09-11.2' },
  'on-liberty': { editions: EN, revision: '2026-09-11.2' },
  oresteia: { editions: EN, revision: '2026-09-11.2' },
  othello: { editions: EN, revision: '2026-09-11.2' },
  phaedo: { editions: EN, revision: '2026-09-11.2' },
  phaedrus: { editions: EN, revision: '2026-09-11.2' },
  poetics: { editions: EN, revision: '2026-09-11.2' },
  'romeo-and-juliet': { editions: EN, revision: '2026-09-11.2' },
  'social-contract': { editions: EN, revision: '2026-09-11.2' },
  symposium: { editions: EN, revision: '2026-09-11.2' },
  'the-prince': { editions: EN, revision: '2026-09-11.2' },
  'twelfth-night': { editions: EN, revision: '2026-09-11.2' },
  utilitarianism: { editions: EN, revision: '2026-09-11.2' },
  werther: { editions: EN, revision: '2026-09-11.2' },
  // 2026-09-12.1 — epics, plays, histories and ancient works
  iliad: { editions: EN, revision: '2026-09-12.1' },
}
const supportedEditions = (bookId: string): string[] | undefined => characterReleases[bookId]?.editions
export async function verifyCharacters(asset: CharacterAsset, bookId: string, editionKey: string, raw: ArrayBuffer): Promise<VerifiedCharacters | null> {
  if (!supportedEditions(bookId)?.includes(editionKey) || asset.bookId !== bookId || asset.schemaVersion !== 1 || asset.language !== 'en' || asset.normalization !== 'prose-reader-v1' || asset.offsetUnit !== 'utf16') return null
  const edition = asset.editions?.[editionKey]
  if (!edition || !Array.isArray(edition.characters) || !Array.isArray(edition.mentions) || !edition.paragraphHashes || await sha256(raw) !== edition.sourceSha256) return null
  const source = JSON.parse(new TextDecoder().decode(raw)) as { chapters: { number: number; paragraphs: string[] }[] }
  const paragraphs: Record<string, string[]> = {}
  for (const chapter of source.chapters) {
    const texts = chapter.paragraphs.map(normalizeParagraph)
    const hashes = await Promise.all(texts.map(sha256))
    if (JSON.stringify(hashes) !== JSON.stringify(edition.paragraphHashes[chapter.number])) return null
    paragraphs[chapter.number] = texts
  }
  const validPoint = (point: PassagePoint) => point && Number.isInteger(point.chapterNumber) && Number.isInteger(point.paragraphIndex) && Number.isInteger(point.offset) && point.offset >= 0 && paragraphs[point.chapterNumber]?.[point.paragraphIndex] !== undefined && point.offset <= paragraphs[point.chapterNumber][point.paragraphIndex].length
  const ids = new Set<string>()
  for (const character of edition.characters) {
    if (!character || typeof character.id !== 'string' || ids.has(character.id) || typeof character.kind !== 'string' || !['central', 'major', 'supporting', 'reference'].includes(character.storyRole) || !validPoint(character.firstMention) || !validPoint(character.roleVisibleAt) || !Array.isArray(character.snapshots) || !character.snapshots.length) return null
    ids.add(character.id)
    for (const snapshot of character.snapshots) if (!snapshot || !validPoint(snapshot.availableAt) || comparePoint(snapshot.availableAt, character.firstMention) < 0 || !['name', 'subtitle', 'body'].every(key => typeof snapshot[key as keyof Snapshot] === 'string')) return null
  }
  for (const mention of edition.mentions) {
    if (!mention || !ids.has(mention.characterId) || !Number.isInteger(mention.startOffset) || !Number.isInteger(mention.endOffset) || mention.startOffset < 0 || mention.endOffset <= mention.startOffset || paragraphs[mention.chapterNumber]?.[mention.paragraphIndex]?.slice(mention.startOffset, mention.endOffset) !== mention.text) return null
  }
  return { edition, paragraphs }
}
const loads = new Map<string, Promise<VerifiedCharacters | null>>()
export function loadCharacters(bookId?: string, editionKey?: string): Promise<VerifiedCharacters | null> {
  if (!bookId || !editionKey || !supportedEditions(bookId)?.includes(editionKey)) return Promise.resolve(null)
  const key = `${bookId}:${editionKey}`
  if (!loads.has(key)) loads.set(key, (async () => {
    try {
      const [asset, source] = await Promise.all([fetch(`/data/characters/${bookId}.v1.json?v=${characterReleases[bookId].revision}`), fetch(`/data/editions/${bookId}-${editionKey}.json`)])
      if (!asset.ok || !source.ok) return null
      return await verifyCharacters(await asset.json(), bookId, editionKey, await source.arrayBuffer())
    } catch { return null }
  })())
  return loads.get(key)!
}
export function releasedCard(edition: CharacterEdition, id: string, cutoff: PassagePoint): ReleasedCard | null {
  const character = edition.characters.find(c => c.id === id)
  if (!character || comparePoint(character.firstMention, cutoff) > 0) return null
  const snapshot = character.snapshots.filter(s => comparePoint(s.availableAt, cutoff) <= 0).sort((a, b) => comparePoint(b.availableAt, a.availableAt))[0]
  if (!snapshot) return null
  return { id, kind: character.kind, role: comparePoint(character.roleVisibleAt, cutoff) <= 0 ? character.storyRole : null, name: snapshot.name, subtitle: snapshot.subtitle, body: snapshot.body }
}
export function resolveCharacter(data: VerifiedCharacters | null, chapterNumber: number, paragraphIndex: number, start: number, end: number, text: string, existingHighlight = false): CharacterSelection | null {
  if (!data || existingHighlight || start < 0 || end <= start || normalizeParagraph(text) !== data.paragraphs[chapterNumber]?.[paragraphIndex]) return null
  const mentions = data.edition.mentions.filter(m => m.chapterNumber === chapterNumber && m.paragraphIndex === paragraphIndex)
  const matches = mentions.filter(m => m.startOffset <= start && m.endOffset >= end && text !== '')
  const width = Math.min(...matches.map(m => m.endOffset - m.startOffset))
  const closest = matches.filter(m => m.endOffset - m.startOffset === width)
  if (new Set(closest.map(m => m.characterId)).size !== 1) return null
  const mention = closest[0]
  const cutoff = { chapterNumber, paragraphIndex, offset: mention.endOffset }
  const card = releasedCard(data.edition, mention.characterId, cutoff)
  if (!card) return null
  const gallery = data.edition.characters.flatMap(c => {
    const entry = releasedCard(data.edition, c.id, cutoff)
    return entry ? [{ card: entry, inPassage: mentions.some(m => m.characterId === c.id && m.endOffset <= cutoff.offset) }] : []
  })
  return { card, cutoff, gallery }
}
/** Word anchors in the current reader are exclusive at the end; punctuation is not part of a name. */
export function wordSelectionOffsets(text: string, from: number, to: number): [number, number] | null {
  const normalized = normalizeParagraph(text)
  const words = Array.from(normalized.matchAll(/\S+/g))
  if (from < 0 || to <= from || !words[from] || !words[to - 1]) return null
  let start = words[from].index!, end = words[to - 1].index! + words[to - 1][0].length
  while (start < end && /[“”"'([{_]/.test(normalized[start])) start++
  while (end > start && /[.,;:!?…”"')\]}_]/.test(normalized[end - 1])) end--
  // A possessive suffix is grammar outside the reviewed name, never an alias guess.
  if (/[’']s$/.test(normalized.slice(start, end))) end -= 2
  return [start, end]
}
