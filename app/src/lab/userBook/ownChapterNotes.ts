/**
 * Primer and Recap on a reader's own book in the book reader (the phone's chapter pills; One Tinct, 22 Oct 2026).
 *
 * A Tinct book's chapter notes come from `/api/lab-chapter-notes`, which reads the edition on the server and caches
 * the notes for every reader. An own book's text is not on the server and its id never leaves the device, so its
 * notes take the path the margin reader's own-book pills take (public/lab/addbook/js/tinct-api.js): the chapter's
 * text is sent from this device in the companion request (`/api/chat` signed in, `/api/lab-chat` signed out), with
 * no book id, no edition and nothing cached on the server. Primer is the companion's chapter action `primer`
 * (companionRequest.ts parsePrimerRequest: an own EPUB's context, `kind: 'epub'`, its text as pages); Recap is the
 * margin reader's recap instruction as an `ask` (reader.js pillRules). Both are shown as the same titled beats.
 * The beats are kept on this device only (labChapterNotes.ts, under the book's local key).
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
}

/** The kinds made this way: Primer (the heading's pill) and Recap (the chapter end's). */
export type OwnChapterNotesKind = Extract<ChapterNotesKind, 'primer' | 'end'>
export const isOwnChapterNotesKind = (kind: ChapterNotesKind): kind is OwnChapterNotesKind => kind === 'primer' || kind === 'end'

// The Worker's bounds (tinct-api.js): a page of at most 20,000 characters, 200,000 in all.
const PAGE_CHARS = 19_000
const CONTEXT_CHARS = 190_000

/** The chapter's text as the companion's pages ({ n, text }), its paragraphs kept whole where they fit. */
export function ownChapterPages(paragraphs: readonly string[]): Array<{ n: number; text: string }> {
  const pages: Array<{ n: number; text: string }> = []
  let current = '', total = 0
  const push = () => { if (current.trim()) pages.push({ n: pages.length + 1, text: current.trim() }); current = '' }
  for (const raw of paragraphs) {
    const text = readableParagraph(String(raw || '')).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!text) continue
    if (total + text.length > CONTEXT_CHARS) break
    total += text.length
    if (current && current.length + text.length + 2 > PAGE_CHARS) push()
    for (let at = 0; at < text.length; at += PAGE_CHARS) {
      const part = text.slice(at, at + PAGE_CHARS)
      if (part.length === PAGE_CHARS) { push(); pages.push({ n: pages.length + 1, text: part }) } else current = current ? `${current}\n\n${part}` : part
    }
  }
  push()
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
  const context = {
    bookTitle: source.bookTitle.slice(0, 300) || 'Your book',
    bookAuthor: (source.bookAuthor || '').slice(0, 300),
    chapterLabel: source.chapterTitle.slice(0, 300) || 'This chapter',
    kind: 'epub',
    pages: ownChapterPages(source.paragraphs),
    paragraphIndex: 0,
    lookups: false,
  }
  if (kind === 'primer') {
    return {
      stream: false, max_tokens: 1600,
      messages: [{ role: 'user', content: 'Please answer.' }],
      companion: { intent: 'chapter', context, chapter: { action: { kind: 'primer', unitKey: `chapter-${source.chapterNumber}`, unitTitle: context.chapterLabel, unitKind: 'chapter' } } },
    }
  }
  return {
    stream: false, max_tokens: 1600,
    messages: [{ role: 'user', content: `${ownRecapInstruction(source)}\n\nPlease answer.` }],
    companion: { intent: 'ask', context },
  }
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

type FetchLike = (url: string, init: RequestInit) => Promise<Response>

/** Primer or Recap for an own book's chapter, made from this device's text. Never throws. */
export async function fetchOwnChapterNotes(kind: OwnChapterNotesKind, source: OwnChapterNotesSource, options: { readToken?: () => Promise<string | null>; fetchImpl?: FetchLike } = {}): Promise<ChapterNotesResult> {
  const fetchImpl: FetchLike | null = options.fetchImpl ?? (typeof fetch === 'function' ? (url, init) => fetch(url, init) : null)
  if (!fetchImpl) return { ok: false, status: 0 }
  try {
    const token = options.readToken ? await options.readToken().catch(() => null) : null
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...internalTrafficHeaders() }
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetchImpl(apiUrl(token ? '/api/chat' : '/api/lab-chat'), { method: 'POST', headers, body: JSON.stringify(ownChapterNotesBody(kind, source)) })
    if (!response.ok) {
      if (await isAllowanceUsedResponse(response.clone())) return { ok: false, status: response.status, allowanceUsed: true }
      if (response.status === 503 && await labChatErrorType(response) === AI_RESTING_ERROR_TYPE) return { ok: false, status: response.status, resting: true }
      return { ok: false, status: response.status }
    }
    const text = await readAnthropicResponse(response)
    const beats = kind === 'primer' ? (() => { const primer = parsePrimer(text); return primer ? primerBeats(primer) : null })() : recapBeats(text)
    return beats ? { ok: true, beats } : { ok: false, status: response.status }
  } catch {
    return { ok: false, status: 0 }
  }
}
