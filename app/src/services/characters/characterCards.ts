import { editionWholeUrl } from '../../data/editionUrls'
import { CHAPTER_SHARDED_EDITION_IDS } from '../../data/editionShardRegistry'
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
export const characterReleases: Record<string, { editions: string[]; revision: string; perEdition?: boolean }> = {
  'to-the-lighthouse': { editions: EN, revision: '2026-09-25.1' },
  // 2026-10-02.1 — independently accepted packages, published 2026-10-03
  'alice-in-wonderland': { editions: EN, revision: '2026-10-02.1' },
  'wuthering-heights': { editions: EN, revision: '2026-10-02.1' },
  middlemarch: { editions: EN, revision: '2026-10-02.1' },
  'sense-and-sensibility': { editions: EN, revision: '2026-10-02.1' },
  // 2026-09-09.2 — pilots
  'the-awakening': { editions: EN, revision: '2026-09-09.2' },
  // 2026-09-30.1 — every appearance linked in four editions. The 16.5 MB package
  // is served as one sidecar per edition (see characterAssetPath) so a reader
  // downloads only the edition that is open.
  // 2026-10-21.1 — own cards for the sons of Absalom (1 Macc 11:70, 13:11), whose
  // unlinked names drew a confident namesake from the contextual lookup.
  bible: { editions: ['kjv-en', 'web-en', 'bsb-en', 'webc-en'], revision: '2026-10-21.1', perEdition: true },
  // 2026-09-10.1 — Hamlet, Macbeth, four philosophy/reference, nine plays
  hamlet: { editions: EN, revision: '2026-09-10.1' },
  macbeth: { editions: EN, revision: '2026-09-30.1' },
  crito: { editions: EN, revision: '2026-09-10.1' },
  apology: { editions: EN, revision: '2026-09-10.1' },
  'the-manual': { editions: EN, revision: '2026-09-10.1' },
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
  'kant-groundwork': { editions: EN, revision: '2026-10-01.1' },
  'descartes-meditations': { editions: EN, revision: '2026-09-11.1' },
  // 2026-09-11.2 — bulk release of the validated queue
  'a-little-princess': { editions: EN, revision: '2026-10-01.1' },
  antigone: { editions: EN, revision: '2026-09-11.2' },
  'around-the-world-80-days': { editions: EN, revision: '2026-10-01.1' },
  bacchae: { editions: EN, revision: '2026-10-01.2' },
  beowulf: { editions: EN, revision: '2026-09-11.2' },
  candide: { editions: EN, revision: '2026-09-23.1' },
  'comedy-of-errors': { editions: EN, revision: '2026-09-11.2' },
  'communist-manifesto': { editions: EN, revision: '2026-10-01.1' },
  'discourse-on-inequality': { editions: EN, revision: '2026-09-11.2' },
  'frederick-douglass': { editions: EN, revision: '2026-09-11.2' },
  gilgamesh: { editions: EN, revision: '2026-09-11.2' },
  'heart-of-darkness': { editions: EN, revision: '2026-10-01.1' },
  'hume-enquiry': { editions: EN, revision: '2026-10-01.1' },
  'ivan-ilyich': { editions: EN, revision: '2026-09-11.2' },
  'jekyll-and-hyde': { editions: EN, revision: '2026-09-24.1' },
  'julius-caesar': { editions: EN, revision: '2026-09-24.1' },
  'jungle-book': { editions: EN, revision: '2026-10-01.1' },
  'king-lear': { editions: EN, revision: '2026-09-11.2' },
  medea: { editions: EN, revision: '2026-10-01.2' },
  'merchant-of-venice': { editions: EN, revision: '2026-09-11.2' },
  midsummer: { editions: EN, revision: '2026-09-11.2' },
  'much-ado-about-nothing': { editions: EN, revision: 'text-2026-10-21.1' },
  'notes-from-underground': { editions: EN, revision: '2026-10-01.1' },
  'oedipus-at-colonus': { editions: EN, revision: '2026-09-11.2' },
  'oedipus-rex': { editions: EN, revision: '2026-09-11.2' },
  'on-liberty': { editions: EN, revision: 'text-2026-10-01.1' },
  oresteia: { editions: EN, revision: '2026-09-11.2' },
  othello: { editions: EN, revision: '2026-09-11.2' },
  phaedo: { editions: EN, revision: '2026-09-11.2' },
  phaedrus: { editions: EN, revision: 'text-2026-10-21.1' },
  poetics: { editions: EN, revision: '2026-09-11.2' },
  'romeo-and-juliet': { editions: EN, revision: 'text-2026-10-21.1' },
  'social-contract': { editions: EN, revision: '2026-09-11.2' },
  symposium: { editions: EN, revision: '2026-09-25.1' },
  'the-prince': { editions: EN, revision: '2026-09-24.1' },
  'twelfth-night': { editions: EN, revision: '2026-09-11.2' },
  utilitarianism: { editions: EN, revision: '2026-09-11.2' },
  werther: { editions: EN, revision: '2026-09-11.2' },
  // 2026-09-12.1 — novels and prose works
  frankenstein: { editions: EN, revision: '2026-09-23.2' },
  'pride-and-prejudice': { editions: EN, revision: '2026-09-25.1' },
  'jane-eyre': { editions: EN, revision: '2026-09-25.1' },
  'great-expectations': { editions: EN, revision: '2026-09-12.1' },
  'treasure-island': { editions: EN, revision: '2026-09-12.1' },
  'moby-dick': { editions: EN, revision: '2026-09-30.1' },
  'crime-and-punishment': { editions: EN, revision: '2026-09-24.1' },
  'anna-karenina': { editions: EN, revision: '2026-09-12.1' },
  'brothers-karamazov': { editions: EN, revision: '2026-09-12.1' },
  'don-quixote': { editions: EN, revision: '2026-09-12.1' },
  'war-and-peace': { editions: EN, revision: 'text-2026-10-07.1' },
  ulysses: { editions: EN, revision: '2026-09-12.1' },
  'niels-lyhne': { editions: EN, revision: '2026-10-01.1' },
  walden: { editions: EN, revision: 'text-2026-10-01.1' },
  // 2026-09-12.1 — epics, plays, histories and ancient works
  iliad: { editions: EN, revision: 'text-2026-10-21.3' },
  odyssey: { editions: EN, revision: '2026-09-12.1' },
  'the-aeneid': { editions: EN, revision: '2026-09-12.1' },
  'divine-comedy': { editions: EN, revision: '2026-09-12.1' },
  'paradise-lost': { editions: EN, revision: '2026-09-12.1' },
  'faust-part-1': { editions: EN, revision: '2026-09-30.1' },
  'the-histories': { editions: EN, revision: '2026-09-12.1' },
  'peloponnesian-war': { editions: EN, revision: '2026-09-12.1' },
  'the-republic': { editions: EN, revision: 'text-2026-10-21.1' },
  // 2026-09-12.2 — re-anchored onto the re-based Meditations text (Long 1862,
  // 487 paragraphs). Figures and descriptions unchanged; hashes, offsets and
  // two spellings recomputed by scripts/reanchor-meditations-characters.py.
  meditations: { editions: EN, revision: '2026-09-24.1' },
  confessions: { editions: EN, revision: '2026-09-25.1' },
  'as-you-like-it': { editions: EN, revision: '2026-09-30.1' },
  'taming-of-the-shrew': { editions: EN, revision: '2026-09-12.1' },
  'the-tempest': { editions: EN, revision: '2026-09-12.1' },
  // 2026-09-12.1 — philosophy, political theory and religious works
  'nicomachean-ethics': { editions: EN, revision: '2026-09-12.1' },
  'aristotle-politics': { editions: EN, revision: '2026-10-01.1' },
  leviathan: { editions: EN, revision: '2026-09-12.1' },
  'second-treatise': { editions: EN, revision: '2026-09-30.1' },
  'beyond-good-and-evil': { editions: EN, revision: '2026-10-01.1' },
  'genealogy-of-morals': { editions: EN, revision: '2026-09-12.1' },
  'democracy-in-america': { editions: EN, revision: '2026-09-12.1' },
  'essays-montaigne': { editions: EN, revision: '2026-09-12.1' },
  'federalist-papers': { editions: EN, revision: 'text-2026-10-21.3' },
  'wealth-of-nations': { editions: EN, revision: '2026-09-12.1' },
  'vindication-rights-of-woman': { editions: EN, revision: '2026-09-30.2' },
  'imitation-of-christ': { editions: EN, revision: '2026-09-12.1' },
  jerusalem: { editions: EN, revision: '2026-09-30.1' },
  'fear-and-trembling': { editions: ['modern-en'], revision: '2026-09-30.1' },
}
/** Public path of the character package a reader needs for one edition. */
export const characterAssetPath = (bookId: string, editionKey: string) =>
  characterReleases[bookId]?.perEdition ? `/data/characters/${bookId}.v1.${editionKey}.json` : `/data/characters/${bookId}.v1.json`
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
/** One request per package URL: a book whose package covers both editions is asked for once, not once per edition. */
const assetLoads = new Map<string, Promise<CharacterAsset | null>>()
function loadAsset(url: string): Promise<CharacterAsset | null> {
  if (!assetLoads.has(url)) {
    const pending = fetch(url).then(response => (response.ok ? response.json() as Promise<CharacterAsset> : null)).catch(() => null)
    assetLoads.set(url, pending)
    // A failed request is asked again by the next reader of the package.
    void pending.then(asset => { if (!asset) assetLoads.delete(url) })
  }
  return assetLoads.get(url)!
}
/**
 * The whole edition the package is checked against. For an edition the reader
 * itself reads whole, this is the reader's own URL (editionUrls.ts, with the
 * build version the edition loader appends), so the copy it already
 * downloaded serves the check from the browser cache instead of a second
 * download under another tag. A chapter-sharded edition (the Bible, the long
 * novels) is read by chapter, so its whole file is fetched only here, under
 * the package's release revision, which stays cached across app releases.
 * Either tag changes when the text can, so neither is an immutable old copy.
 */
const SHARDED = new Set<string>(CHAPTER_SHARDED_EDITION_IDS)
function editionTextUrl(bookId: string, editionKey: string): string {
  const version = bookId === 'bible' || SHARDED.has(`${bookId}-${editionKey}`)
    ? characterReleases[bookId].revision
    : typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'dev'
  return editionWholeUrl(bookId, editionKey, version)
}
export function loadCharacters(bookId?: string, editionKey?: string): Promise<VerifiedCharacters | null> {
  if (!bookId || !editionKey || !supportedEditions(bookId)?.includes(editionKey)) return Promise.resolve(null)
  const key = `${bookId}:${editionKey}`
  if (!loads.has(key)) loads.set(key, (async () => {
    try {
      const [asset, source] = await Promise.all([loadAsset(`${characterAssetPath(bookId, editionKey)}?v=${characterReleases[bookId].revision}`), fetch(editionTextUrl(bookId, editionKey))])
      if (!asset || !source.ok) return null
      return await verifyCharacters(asset, bookId, editionKey, await source.arrayBuffer())
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
  let matches = mentions.filter(m => m.startOffset <= start && m.endOffset >= end && text !== '')
  // The reader selects whitespace tokens, so a dash can join a reviewed name
  // to another word (e.g. Poole—and). Accept only a complete reviewed span
  // bounded by a dash or the selection edge, never a substring/alias guess.
  const selected = normalizeParagraph(text).slice(start, end)
  if (!matches.length && !/\s/.test(selected) && /[—–]/.test(selected)) {
    const overlapping = mentions.filter(m => m.startOffset < end && m.endOffset > start)
    if (new Set(overlapping.map(m => m.characterId)).size !== 1) return null
    matches = overlapping.filter(m => m.startOffset >= start && m.endOffset <= end
      && (m.startOffset === start || /[—–]/.test(selected[m.startOffset - start - 1]))
      && (m.endOffset === end || /[—–]/.test(selected[m.endOffset - start])))
  }
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
/** A tapped name that two or more cards in this book carry, with the cards released at that point. */
export interface NamesakeNotice { name: string; candidates: ReleasedCard[] }
const mentionName = (text: string) => text.replace(/[’']s$/, '')
/**
 * For a name no reviewed mention claims on its own (an unlinked namesake such as
 * "Jonathan the son of Absalom", or a tie between two spans): the cards that
 * carry the same name, so the reader is told the name is shared instead of a
 * guess at which one it is. Only capitalised names, only people (not a nation
 * or a place that shares the name), and only cards already
 * released at the tap, so the notice reveals nothing the cards would not.
 */
export function namesakesAt(data: VerifiedCharacters | null, chapterNumber: number, paragraphIndex: number, start: number, end: number, text: string): NamesakeNotice | null {
  if (!data || start < 0 || end <= start || normalizeParagraph(text) !== data.paragraphs[chapterNumber]?.[paragraphIndex]) return null
  if (resolveCharacter(data, chapterNumber, paragraphIndex, start, end, text)) return null
  const name = mentionName(normalizeParagraph(text).slice(start, end))
  if (!/^\p{Lu}\p{Ll}/u.test(name)) return null
  const people = new Set(data.edition.characters.filter(c => ['person', 'spirit', 'deity'].includes(c.kind)).map(c => c.id))
  const ids = new Set(data.edition.mentions.filter(m => people.has(m.characterId) && mentionName(m.text) === name).map(m => m.characterId))
  if (ids.size < 2) return null
  const cutoff = { chapterNumber, paragraphIndex, offset: end }
  const candidates = data.edition.characters.flatMap(c => {
    const card = ids.has(c.id) ? releasedCard(data.edition, c.id, cutoff) : null
    return card ? [card] : []
  })
  return candidates.length >= 2 ? { name, candidates } : null
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
