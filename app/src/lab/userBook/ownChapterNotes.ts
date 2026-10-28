import { readOwnedPrimerCache, keepOwnedPrimerCache, userBookOwner } from './userBookStore'
import type { SavedPrimer } from '../../bookPrimers/model'
import { parseGeneratedPrimer } from '../../bookPrimers/parse'
import { BOOK_PRIMER_PROMPT_VERSION, primerKey, type PrimerIdentity } from '../../bookPrimers/model'
/**
 * Primer and Recap on a reader's own book in the book reader (the phone's chapter pills; One Tinct, 22 Oct 2026).
 *
 * A Tinct book's chapter notes come from `/api/lab-chapter-notes`, which reads the edition on the server and caches
 * the notes for every reader. An own book's text is not on the server and its id never leaves the device, so its
 * notes take the path the margin reader's own-book pills take (public/lab/addbook/js/tinct-api.js): the chapter's
 * text is sent from this device in the companion request (`/api/chat` signed in, `/api/lab-chat` signed out), with
 * no book id, no edition and nothing cached on the server. Primer is the companion's chapter action `primer`
 * (companionRequest.ts parsePrimerRequest: an own EPUB's context, `kind: 'epub'`, its text as pages); Recap is the
 * margin reader's recap instruction as an `ask` (reader.js pillRules). Owner-qualified EPUB primers use the
 * structured book-primer view; their identity stays on this device and they bypass the legacy beats cache.
 * Legacy notes are kept on this device only (labChapterNotes.ts, under the book's local key).
 */
import { parseChapterNotesBeats, type ChapterNotesBeat, type ChapterNotesKind } from '../../chapterNotes'
import { parsePrimer, type Primer } from '../../companion/primerParse'
import { apiUrl } from '../../utils/apiUrl'
import { internalTrafficHeaders } from '../../utils/internalTraffic'
import { readableParagraph } from '../labFigures'
import { isAllowanceUsedResponse } from '../labAiAllowance'
import { AI_RESTING_ERROR_TYPE, labChatErrorType, readAnthropicResponse } from '../labCompanion'
import type { ChapterNotesResult } from '../labChapterNotes'

/** What an own book's chapter note is made from: all of it on this device. */
export interface OwnChapterNotesSource {
  bookTitle: string
  bookAuthor?: string
  chapterNumber: number
  chapterTitle: string
  paragraphs: readonly string[]
  /** Present only for a whole-book primer, in the stored edition order. */
  bookChapters?: ReadonlyArray<{ number: number; title: string; paragraphs: readonly string[] }>
  structured?: { ownerId: string; uploadId: string; workId: string; editionId: string; language: string }
}

/** The kinds made this way: Primer (the heading's pill) and Recap (the chapter end's). */
export type OwnChapterNotesKind = Extract<ChapterNotesKind, 'primer' | 'end'>
export const isOwnChapterNotesKind = (kind: ChapterNotesKind): kind is OwnChapterNotesKind => kind === 'primer' || kind === 'end'

// The Worker's bounds (tinct-api.js): a page of at most 20,000 characters, 200,000 in all.
const PAGE_CHARS = 19_000
const CONTEXT_CHARS = 190_000

class IncompleteChapterSourceError extends Error {}

/** The chapter's text as the companion's pages ({ n, text }), its paragraphs kept whole where they fit. */
export function ownChapterPages(paragraphs: readonly string[]): Array<{ n: number; text: string }> {
  const pages: Array<{ n: number; text: string }> = []
  let current = '', total = 0
  const push = () => { if (current.trim()) pages.push({ n: pages.length + 1, text: current.trim() }); current = '' }
  for (const raw of paragraphs) {
    const text = readableParagraph(String(raw || '')).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!text) continue
    if (total + text.length > CONTEXT_CHARS) throw new IncompleteChapterSourceError('The complete chapter exceeds the context limit')
    total += text.length
    if (current && current.length + text.length + 2 > PAGE_CHARS) push()
    for (let at = 0; at < text.length; at += PAGE_CHARS) {
      const part = text.slice(at, at + PAGE_CHARS)
      if (part.length === PAGE_CHARS) { push(); pages.push({ n: pages.length + 1, text: part }) } else current = current ? `${current}\n\n${part}` : part
    }
  }
  push()
  if (!pages.length) throw new IncompleteChapterSourceError('The chapter has no readable text')
  return pages
}

/** The margin reader's Recap instruction (reader.js pillRules), for an own book's chapter. */
export function ownRecapInstruction(source: OwnChapterNotesSource): string {
  const by = source.bookAuthor ? ` by ${source.bookAuthor}` : ''
  return `You are Tinct's reading companion. The reader is reading their own copy of an EPUB titled "${source.bookTitle}"${by}. They have confirmed they are entitled to use it. They have just finished the chapter "${source.chapterTitle}".\nRecap it for them: its main points and how they connect, then what it leaves open or sets up for what follows. Write two short paragraphs of plain prose, no headings, lists or preamble, at most 160 words in all. Ground it in the book and cite no pages; say nothing that is not in it. Name the text by what it is ("this chapter", "this essay", "this section") or by its title, or start straight with its content; never call it a "unit".`
}

/**
 * The request body: the companion's structured request, with the chapter's text as an own EPUB's pages and no
 * book id or edition (a request naming a bookId cannot parse as a primer; companionRequest.ts).
 */
export function ownChapterNotesBody(kind: OwnChapterNotesKind, source: OwnChapterNotesSource): Record<string, unknown> {
  if (kind === 'primer' && source.structured && (Object.values(source.structured).some(value => !value.trim()) || !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(source.structured.language))) throw new IncompleteChapterSourceError('The private source identity is incomplete')
  const context = {
    bookTitle: source.bookTitle.slice(0, 300) || 'Your book',
    bookAuthor: (source.bookAuthor || '').slice(0, 300),
    chapterLabel: source.chapterTitle.slice(0, 300) || 'This chapter',
    kind: 'epub',
    pages: source.bookChapters && source.structured ? [{ n: 1, text: 'Complete book text is supplied in structuredPrimer.passages.' }] : ownChapterPages(source.paragraphs),
    paragraphIndex: 0,
    lookups: false,
  }
  if (kind === 'primer') {
    const structuredPrimer = source.structured ? { language: source.structured.language, passages: ownPrimerPassages(source), ...(source.bookChapters ? { type: 'book', units: source.bookChapters.map(c => ({ id: `chapter-${c.number}`, label: c.title })) } : {}) } : undefined
    return {
      stream: false, max_tokens: 1600,
      messages: [{ role: 'user', content: 'Please answer.' }],
      companion: { intent: 'chapter', context, chapter: { ...(structuredPrimer ? { structuredPrimer } : {}), action: { kind: 'primer', unitKey: `chapter-${source.chapterNumber}`, unitTitle: context.chapterLabel, unitKind: 'chapter' } } },
    }
  }
  return {
    stream: false, max_tokens: 1600,
    messages: [{ role: 'user', content: `${ownRecapInstruction(source)}\n\nPlease answer.` }],
    companion: { intent: 'ask', context },
  }
}

function ownPrimerPassages(source: OwnChapterNotesSource) {
  const chapters = source.bookChapters ?? [{ number: source.chapterNumber, title: source.chapterTitle, paragraphs: source.paragraphs }]
  if (!chapters.length || chapters.length > 5000 || new Set(chapters.map(c => c.number)).size !== chapters.length) throw new IncompleteChapterSourceError('The book map is incomplete')
  let total = 0
  const passages = chapters.flatMap(chapter => {
    if (!Number.isSafeInteger(chapter.number) || chapter.number < 1) throw new IncompleteChapterSourceError('Invalid source section')
    const items = chapter.paragraphs.map((raw, index) => ({ id: `chapter-${chapter.number}:paragraph-${index}`, text: readableParagraph(raw).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() })).filter(p => p.text)
    if (!items.length) throw new IncompleteChapterSourceError('A source section has no readable text')
    for (const item of items) total += item.text.length
    return items
  })
  if (total > (source.bookChapters ? 560000 : CONTEXT_CHARS) || passages.length > 10000) throw new IncompleteChapterSourceError('The complete source exceeds the context limit')
  return passages
}

const itemText = (item: Primer['sections'][number]['items'][number]) => 'term' in item ? `${item.term}: ${item.meaning}` : item.text.replace(/\s*\{[^}]*\}\s*/g, ' ').trim()

/** A primer as the card's beats: its gist, then each section's items in one line (the map is the Contents' job). */
export function primerBeats(primer: Primer): ChapterNotesBeat[] | null {
  return parseChapterNotesBeats({ beats: [
    { title: 'In brief', text: primer.gist },
    ...primer.sections.map(section => ({ title: section.title, text: section.items.map(itemText).filter(Boolean).join(' · ') })),
  ] })
}

/** A recap's prose as the card's beats: its main points, then what it sets up (the two paragraphs it is asked for). */
export function recapBeats(text: string): ChapterNotesBeat[] | null {
  const paragraphs = text.replace(/^#+\s.*$/gm, '').replace(/\*\*?|__/g, '').split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean)
  if (!paragraphs.length) return null
  const [first, ...rest] = paragraphs
  return parseChapterNotesBeats({ beats: [
    { title: 'Main points', text: first },
    ...(rest.length ? [{ title: 'What it sets up', text: rest.join(' ') }] : []),
  ] })
}

function structuredResult(primer: SavedPrimer): ChapterNotesResult {
  const { content } = primer
  const topics = [content.structure, content.peopleAndIdeas, content.helpfulContext, content.whatToNotice, content.usefulReferences].flat()
  const beats = [{ title: 'Primer', text: content.opening }, ...topics.map(t => ({ title: t.title, text: [t.explanation, t.takeaway, ...(t.quotes ?? []).map(q => q.text)].filter(Boolean).join('\n\n') }))]
  return { ok: true, beats, primer }
}

type FetchLike = (url: string, init: RequestInit) => Promise<Response>

/** Primer or Recap for an own book's chapter, made from this device's text. Never throws. */
export async function fetchOwnChapterNotes(kind: OwnChapterNotesKind, source: OwnChapterNotesSource, options: { readToken?: () => Promise<string | null>; fetchImpl?: FetchLike } = {}): Promise<ChapterNotesResult> {
  const fetchImpl: FetchLike | null = options.fetchImpl ?? (typeof fetch === 'function' ? (url, init) => fetch(url, init) : null)
  if (!fetchImpl) return { ok: false, status: 0 }
  try {
    // Validate the entire source before obtaining credentials or sending any text.
    const body = ownChapterNotesBody(kind, source)
    const passages = ownPrimerPassages(source)
    let identity: PrimerIdentity | undefined
    let cache: Awaited<ReturnType<typeof readOwnedPrimerCache>> = null
    if (kind === 'primer' && source.structured) {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ title: source.chapterTitle, units: source.bookChapters?.map(c => ({ id: `chapter-${c.number}`, label: c.title })), passages })))
      identity = { scope: { kind: 'private', ownerId: source.structured.ownerId, uploadId: source.structured.uploadId }, workId: source.structured.workId, editionId: source.structured.editionId, language: source.structured.language, sourceVersion: Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join(''), unitId: source.bookChapters ? null : `chapter-${source.chapterNumber}`, type: source.bookChapters ? 'book' : 'chapter' }
      primerKey(identity)
      cache = await readOwnedPrimerCache(source.structured.uploadId, source.structured.ownerId).catch(() => null)
      // Editorial revision identifiers are independent of generation prompt versions.
      // Prefer human copy even when a generated entry appears earlier in storage.
      const entries = cache?.entries ?? []
      const preferred = [...entries.filter(entry => entry?.origin === 'manual' || entry?.origin === 'approved'), ...entries.filter(entry => entry?.origin === 'generated')]
      for (const entry of preferred) {
        try {
          if (primerKey(entry.identity) !== primerKey(identity) || (entry.origin === 'generated' && entry.promptVersion !== BOOK_PRIMER_PROMPT_VERSION)) continue
          const content = parseGeneratedPrimer(JSON.stringify(entry.content), passages)
          return structuredResult({ ...entry, content, resources: [] })
        } catch { /* unreadable or stale derived cache: generate from current source */ }
      }
    }
    const token = options.readToken ? await options.readToken().catch(() => null) : null
    if (source.structured && userBookOwner() !== source.structured.ownerId) return { ok: false, status: 0 }
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...internalTrafficHeaders() }
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetchImpl(apiUrl(token ? '/api/chat' : '/api/lab-chat'), { method: 'POST', headers, body: JSON.stringify(body) })
    if (!response.ok) {
      if (await isAllowanceUsedResponse(response.clone())) return { ok: false, status: response.status, allowanceUsed: true }
      if (response.status === 503 && await labChatErrorType(response) === AI_RESTING_ERROR_TYPE) return { ok: false, status: response.status, resting: true }
      return { ok: false, status: response.status }
    }
    const text = await readAnthropicResponse(response, undefined, { requireComplete: true })
    if (kind === 'primer' && source.structured) {
      const passages = ownPrimerPassages(source)
      const content = parseGeneratedPrimer(text, passages)

      const primer: SavedPrimer = { identity: identity!, content, resources: [], origin: 'generated', createdAt: new Date().toISOString(), promptVersion: BOOK_PRIMER_PROMPT_VERSION }
      if (cache) await keepOwnedPrimerCache(source.structured.uploadId, source.structured.ownerId, cache.fileId, primer, passages).catch(() => {})
      return structuredResult(primer)
    }
    const beats = kind === 'primer' ? (() => { const primer = parsePrimer(text); return primer ? primerBeats(primer) : null })() : recapBeats(text)
    return beats ? { ok: true, beats } : { ok: false, status: response.status }
  } catch (error) {
    if (error instanceof IncompleteChapterSourceError) return { ok: false, status: 0, sourceUnavailable: true }
    return { ok: false, status: 0 }
  }
}
