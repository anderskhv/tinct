/** Legacy Add-a-book EPUB page/character annotations, retained beside source-word records. */
import type { LabHighlight } from '../labHighlights'
import { readLabHighlights } from '../labHighlights'
import { readOwnedEpubBytes, userBookOwner } from './userBookStore'
import { userBookId } from './userBookId'
import { importOwnTextMarks, ownTextMarksCanonical, readOwnedTextMarks, type EpubPageMark, type OwnTextMarksSync } from './ownTextMarksSync'
import type { EpubPageCard, OwnTextCardsSync } from './ownTextCardsSync'
import type { UserBookEdition } from './userEdition'

const PREFIX = 'tinct-addbook:'
const CLAIM = PREFIX + 'legacy-epub-owner:'
const BACKUP = PREFIX + 'legacy-epub-annotations:'
const MIGRATED = PREFIX + 'legacy-epub-migrated:'
const STATIC = PREFIX + 'static-epub-'
const GUEST = STATIC + 'guest-'
const QUARANTINE = PREFIX + 'legacy-epub-backup-quarantine:'
type LegacyRecord = { id: string; page?: number; start?: number; end?: number; text?: string; note?: string; color?: string; at?: number; u?: number; kind?: string; gone?: boolean;
  turns?: Array<{ role?: string; content?: string; at?: number; display?: string }>; data?: unknown; rects?: unknown; span?: unknown;
  mark?: unknown; free?: unknown; unitNote?: unknown; unit?: unknown }
type LegacyCopy = { marks: LegacyRecord[]; cards: LegacyRecord[] }
export type LegacyOwnEpubItem = { id: string; kind: 'highlight' | 'card'; text: string; note?: string; page: number; at: number;
  turns?: Array<{ role: 'user' | 'assistant'; content: string; at?: number }>; data?: Record<string, unknown> }

function readArray(key: string): LegacyRecord[] {
  try { const raw = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(raw) ? raw : [] } catch { return [] }
}
function local(hex: string): LegacyCopy {
  return { marks: readArray(PREFIX + 'hl:epub:' + hex), cards: readArray(PREFIX + 'cards:epub:' + hex) }
}
function exactRaw(hex: string): LegacyCopy | null {
  try {
    const marks = JSON.parse(localStorage.getItem(PREFIX + 'hl:epub:' + hex) || '[]')
    const cards = JSON.parse(localStorage.getItem(PREFIX + 'cards:epub:' + hex) || '[]')
    return Array.isArray(marks) && Array.isArray(cards) ? { marks, cards } : null
  } catch { return null }
}
function ownerBackup(hex: string, owner: string): LegacyCopy | null {
  try {
    const saved = JSON.parse(localStorage.getItem(BACKUP + owner + ':' + hex) || 'null')
    return saved && Array.isArray(saved.marks) && Array.isArray(saved.cards) ? saved : null
  } catch { return null }
}
function changedClaimedRaw(hex: string, owner: string): { backup: LegacyCopy; raw: LegacyCopy } | null {
  if (localStorage.getItem(CLAIM + hex) !== owner) return null
  const backup = ownerBackup(hex, owner), raw = exactRaw(hex)
  return backup && raw && JSON.stringify(backup) !== JSON.stringify(raw) ? { backup, raw } : null
}
function recoverableClaimedRaw(hex: string, owner: string): LegacyCopy | null {
  if (localStorage.getItem(CLAIM + hex) !== owner || ownerBackup(hex, owner)) return null
  const raw = exactRaw(hex)
  return raw && (raw.marks.length || raw.cards.length) ? raw : null
}
function mergeRows<T extends { id?: string; u?: number; at?: number }>(older: T[], newer: T[]): T[] {
  const rows = new Map<string, T>()
  for (const row of [...older, ...newer]) {
    const key = typeof row?.id === 'string' ? row.id : JSON.stringify(row), prior = rows.get(key)
    if (!prior || Number(row?.u ?? row?.at ?? 0) >= Number(prior?.u ?? prior?.at ?? 0)) rows.set(key, row)
  }
  return [...rows.values()]
}
function claimed(hex: string, owner: string): boolean {
  try { return userBookOwner() === owner && (localStorage.getItem(CLAIM + hex) === owner
    || localStorage.getItem(STATIC + 'marks:' + owner + ':' + hex) !== null
    || localStorage.getItem(STATIC + 'cards:' + owner + ':' + hex) !== null) } catch { return false }
}
function copy(hex: string, owner: string): LegacyCopy {
  if (!claimed(hex, owner)) return { marks: [], cards: [] }
  const backup = localStorage.getItem(CLAIM + hex) === owner ? ownerBackup(hex, owner) : null
  return { marks: mergeRows(backup?.marks ?? [], readArray(STATIC + 'marks:' + owner + ':' + hex)),
    cards: mergeRows(backup?.cards ?? [], readArray(STATIC + 'cards:' + owner + ':' + hex)) }
}
function migratedIds(hex: string, owner: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(MIGRATED + owner + ':' + hex) || '[]')
    return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : []
  } catch { return [] }
}

/** Ambiguous pre-owner records require an explicit choice before any account can see/import them. */
export function unclaimedLegacyEpubCount(hex: string, owner: string): number {
  if (userBookOwner() !== owner) return 0
  try { return (localStorage.getItem(CLAIM + hex) ? 0 : local(hex).marks.length + local(hex).cards.length)
    + (changedClaimedRaw(hex, owner) ? 1 : 0)
    + (recoverableClaimedRaw(hex, owner) ? 1 : 0)
    + readArray(GUEST + 'marks:' + hex).length + readArray(GUEST + 'cards:' + hex).length } catch { return 0 }
}
export function claimLegacyEpubAnnotations(hex: string, owner: string): boolean {
  if (userBookOwner() !== owner) return false
  try {
    const existing = localStorage.getItem(CLAIM + hex)
    let attached = false
    // Guest rows are a separate, explicitly chosen source. Even when another
    // account owns the old hash-only projection, attaching these rows never
    // changes that account's claim or backup.
    for (const kind of ['marks', 'cards'] as const) {
      const guestKey = GUEST + kind + ':' + hex, guest = readArray(guestKey)
      if (!guest.length) continue
      const scoped = STATIC + kind + ':' + owner + ':' + hex, owned = readArray(scoped)
      const known = new Set(owned.map(row => JSON.stringify(row)))
      localStorage.setItem(scoped, JSON.stringify([...owned, ...guest.filter(row => !known.has(JSON.stringify(row)))]))
      localStorage.removeItem(guestKey)
      attached = true
    }
    const changed = changedClaimedRaw(hex, owner)
    if (changed) {
      // This is only called after the reader chose to attach uncertain older
      // annotations. Keep the former exact backup and the changed raw rows in
      // the owner's scoped copy before establishing a new exact raw backup.
      for (const kind of ['marks', 'cards'] as const) {
        const scoped = STATIC + kind + ':' + owner + ':' + hex
        localStorage.setItem(scoped, JSON.stringify(mergeRows(readArray(scoped),
          mergeRows(changed.backup[kind], changed.raw[kind]))))
      }
      localStorage.setItem(BACKUP + owner + ':' + hex, JSON.stringify(changed.raw))
      attached = true
    }
    const recovered = recoverableClaimedRaw(hex, owner)
    if (recovered) {
      const before = localStorage.getItem(BACKUP + owner + ':' + hex)
      if (before !== null) localStorage.setItem(QUARANTINE + owner + ':' + hex, before)
      localStorage.setItem(BACKUP + owner + ':' + hex, JSON.stringify(recovered))
      attached = true
    }
    if (existing && existing !== owner) return attached
    const records = local(hex)
    if (!existing && (records.marks.length || records.cards.length)) {
      localStorage.setItem(BACKUP + owner + ':' + hex, JSON.stringify(records))
      localStorage.setItem(CLAIM + hex, owner)
      attached = true
    }
    return attached
  } catch { return false }
}

const compact = (s: string) => s.replace(/\s+/g, ' ').trim()
const word = (s: string) => compact(s.replace(/_/g, '')).toLocaleLowerCase()
type SourceRange = { chapterNumber: number; paragraphIndex: number; fromWord: number; endParagraphIndex: number; toWord: number }

/** Require one full-word sequence in the entire converted edition; punctuation and partial words cannot be guessed. */
export function uniqueLegacyWordRange(text: string, edition: UserBookEdition): SourceRange | null {
  const quote = compact(text).split(' ').map(word)
  if (!quote.length || quote.some(value => !value)) return null
  let found: SourceRange | null = null
  for (const chapter of edition.chapters) {
    const words = chapter.paragraphs.flatMap((paragraph, paragraphIndex) => paragraph.split(/\s+/).filter(Boolean)
      .map((value, wordIndex) => ({ value: word(value), paragraphIndex, wordIndex })))
    for (let i = 0; i + quote.length <= words.length; i++) {
      if (!quote.every((value, k) => words[i + k].value === value)) continue
      if (found) return null
      const first = words[i], last = words[i + quote.length - 1]
      found = { chapterNumber: chapter.number, paragraphIndex: first.paragraphIndex, fromWord: first.wordIndex,
        endParagraphIndex: last.paragraphIndex, toWord: last.wordIndex + 1 }
    }
  }
  return found
}

/** Validate the old character offset against the exact static EPUB parser page before using the converted range. */
export function verifiedLegacyEpubMark(mark: LegacyRecord, pages: readonly string[], hex: string, edition: UserBookEdition): LabHighlight | null {
  if (mark.gone || typeof mark.id !== 'string' || !/^[A-Za-z0-9_-]{4,120}$/.test(mark.id)
    || !Number.isInteger(mark.page) || (mark.page ?? 0) < 1 || (mark.page ?? 0) > pages.length
    || !Number.isInteger(mark.start) || !Number.isInteger(mark.end) || (mark.start ?? -1) < 0 || (mark.end ?? 0) <= (mark.start ?? 0)
    || typeof mark.text !== 'string' || !['gold', 'rose', 'sage', 'sky', 'lavender'].includes(mark.color ?? '')
    || !Number.isSafeInteger(mark.at) || (mark.at ?? 0) <= 0 || (mark.note ?? '').length > 4000) return null
  const original = pages[mark.page! - 1]
  if (mark.end! > original.length || compact(original.slice(mark.start!, mark.end!)) !== compact(mark.text)) return null
  const range = uniqueLegacyWordRange(mark.text, edition)
  if (!range) return null
  return { id: mark.id, bookId: userBookId(hex), editionKey: edition.language === 'da' ? 'own-da' : 'own-en', ...range,
    text: mark.text, color: mark.color as LabHighlight['color'], ...(mark.note ? { note: mark.note } : {}), updatedAt: mark.u ?? mark.at }
}

let parserLoading: Promise<{ parse: (bytes: ArrayBuffer) => Promise<{ chapters: Array<{ node: HTMLElement }> }> } | null> | null = null
async function oldParser() {
  const global = window as Window & { TinctEpub?: { parse: (bytes: ArrayBuffer) => Promise<{ chapters: Array<{ node: HTMLElement }> }> } }
  if (global.TinctEpub) return global.TinctEpub
  parserLoading ??= new Promise(resolve => {
    const script = document.createElement('script')
    script.src = '/lab/addbook/js/epub.js'
    script.onload = () => resolve(global.TinctEpub ?? null)
    script.onerror = () => resolve(null)
    document.head.appendChild(script)
  })
  return parserLoading
}

/** Idempotent, lossless import. Original records remain available for Notebook and rollback. */
export async function migrateVerifiedLegacyEpubMarks(hex: string, owner: string, edition: UserBookEdition): Promise<number> {
  const records = copy(hex, owner)
  if (!records.marks.length) return 0
  const bytes = await readOwnedEpubBytes(hex, owner)
  const parser = bytes && await oldParser()
  if (!bytes || !parser || !claimed(hex, owner)) return 0
  let pages: string[]
  try { pages = (await parser.parse(bytes)).chapters.map(chapter => chapter.node.textContent || '') } catch { return 0 }
  const imported = records.marks.map(mark => verifiedLegacyEpubMark(mark, pages, hex, edition)).filter((mark): mark is LabHighlight => !!mark)
  const current = ownTextMarksCanonical(hex) ? readOwnedTextMarks(hex, owner) : readLabHighlights()
  const ids = new Map(current.map(mark => [mark.id, mark]))
  // Existing same IDs can be locally edited. Never replace those changes with the old static copy.
  const additions = imported.filter(mark => !ids.has(mark.id))
  const accepted = imported.filter(mark => !ids.has(mark.id) || (ids.get(mark.id)?.bookId === userBookId(hex)
    && ids.get(mark.id)?.text === mark.text && ids.get(mark.id)?.color === mark.color && (ids.get(mark.id)?.note ?? '') === (mark.note ?? '')))
  if (!additions.length && !accepted.length) return 0
  try {
    if (!importOwnTextMarks(hex, owner, additions)) return 0
    localStorage.setItem(MIGRATED + owner + ':' + hex, JSON.stringify([...new Set([...migratedIds(hex, owner), ...accepted.map(item => item.id)])]))
    return additions.length
  } catch { return 0 }
}

const markFields = new Set(['id', 'page', 'start', 'end', 'text', 'color', 'at', 'u', 'note'])
const cardFields = new Set(['id', 'page', 'text', 'kind', 'turns', 'data', 'at', 'u', 'note', 'color', 'mark', 'rects', 'span', 'free', 'unitNote', 'unit'])
const cardKinds = new Set(['explain', 'simplify', 'ask', 'define', 'factcheck', 'counterpoint', 'quiz', 'related', 'figure', 'primer', 'recap', 'catchup', 'note'])
const colors = new Set(['gold', 'rose', 'sage', 'sky', 'lavender'])
const idOk = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9_-]{4,120}$/.test(id)
const timeOk = (n: unknown): n is number => Number.isSafeInteger(n) && (n as number) > 0
const indexOk = (n: unknown, max: number): n is number => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= max
const fieldsOk = (value: object, fields: Set<string>) => Object.keys(value).every(key => fields.has(key))

function pageMarkOf(record: LegacyRecord): EpubPageMark | null {
  if (!fieldsOk(record, markFields) || !idOk(record.id) || !indexOk(record.page, 1_000_000) || !record.page
    || typeof record.text !== 'string' || record.text.length > 2000 || !colors.has(record.color ?? '') || !timeOk(record.at)
    || record.u !== undefined && !timeOk(record.u) || record.note !== undefined && (typeof record.note !== 'string' || record.note.length > 4000)
    || (record.start === undefined) !== (record.end === undefined)
    || record.start !== undefined && (!indexOk(record.start, 100_000_000) || !indexOk(record.end, 100_000_000) || record.end! <= record.start)) return null
  return { v: 'epub-page-v1', ...record, page: record.page, text: record.text, color: record.color!, at: record.at }
}

function pageCardOf(record: LegacyRecord): EpubPageCard | null {
  if (!fieldsOk(record, cardFields) || !idOk(record.id) || !indexOk(record.page, 1_000_000) || !record.page
    || typeof record.text !== 'string' || record.text.length > 2000 || !cardKinds.has(record.kind ?? '') || !timeOk(record.at)
    || record.u !== undefined && !timeOk(record.u) || record.note !== undefined && (typeof record.note !== 'string' || record.note.length > 4000)
    || record.color !== undefined && !colors.has(record.color) || record.mark !== undefined && !idOk(record.mark)
    || record.free !== undefined && typeof record.free !== 'boolean' || record.unitNote !== undefined && typeof record.unitNote !== 'boolean'
    || record.unit !== undefined && (typeof record.unit !== 'string' || record.unit.length > 120)
    || !Array.isArray(record.turns) || record.turns.length > 40
    || record.turns.some(turn => !turn || !fieldsOk(turn, new Set(['role', 'content', 'at', 'display']))
      || (turn.role !== 'user' && turn.role !== 'assistant') || typeof turn.content !== 'string' || turn.content.length > 12_000
      || turn.at !== undefined && !timeOk(turn.at) || turn.display !== undefined && (typeof turn.display !== 'string' || turn.display.length > 2000))) return null
  if (record.data !== undefined) {
    if (!record.data || typeof record.data !== 'object' || Array.isArray(record.data)) return null
    try { if (JSON.stringify(record.data).length > 16_000) return null } catch { return null }
  }
  if (record.span !== undefined && (!Array.isArray(record.span) || record.span.length !== 3 || !indexOk(record.span[0], 1_000_000)
    || !record.span[0] || !indexOk(record.span[1], 100_000_000) || !indexOk(record.span[2], 100_000_000) || record.span[2] <= record.span[1])) return null
  if (record.rects !== undefined && (!Array.isArray(record.rects) || record.rects.length > 400
    || record.rects.some(rect => !Array.isArray(rect) || ![4, 5].includes(rect.length) || rect.length === 5 && (!indexOk(rect[0], 1_000_000) || !rect[0])
      || rect.slice(rect.length === 5 ? 1 : 0).some(n => typeof n !== 'number' || !Number.isFinite(n) || n < -1 || n > 2)))) return null
  return { v: 'epub-page-v1', ...record, page: record.page, text: record.text, kind: record.kind as EpubPageCard['kind'], turns: record.turns as EpubPageCard['turns'], at: record.at,
    ...(record.data !== undefined ? { data: record.data as Record<string, unknown> } : {}), ...(record.rects !== undefined ? { rects: record.rects as number[][] } : {}),
    ...(record.span !== undefined ? { span: record.span as [number, number, number] } : {}) } as EpubPageCard
}

/** Only exact, supported original-page records enter the account's revision set; raw backup remains intact. */
export function syncClaimedLegacyEpubPages(hex: string, owner: string, marks: OwnTextMarksSync | null, cards: OwnTextCardsSync | null): { queued: number; keptLocal: number } {
  const backup = copy(hex, owner), migrated = new Set(migratedIds(hex, owner))
  const originalMarks = backup.marks.filter(mark => !mark.gone && !migrated.has(mark.id))
  const originalCards = backup.cards.filter(card => !card.gone)
  const eligibleMarks = originalMarks.map(pageMarkOf), eligibleCards = originalCards.map(pageCardOf)
  const parsedMarks = eligibleMarks.filter((item): item is EpubPageMark => !!item)
  const parsedCards = eligibleCards.filter((item): item is EpubPageCard => !!item)
  const marksSaved = !parsedMarks.length || !!marks?.importPageMarks(parsedMarks)
  const cardsSaved = !parsedCards.length || !!cards?.importPageCards(parsedCards)
  return { queued: (marksSaved ? parsedMarks.length : 0) + (cardsSaved ? parsedCards.length : 0),
    keptLocal: eligibleMarks.filter(item => !item).length + eligibleCards.filter(item => !item).length
      + (marksSaved ? 0 : parsedMarks.length) + (cardsSaved ? 0 : parsedCards.length) }
}

/** Account page variants appear in Notebook on another device without inventing source-word coordinates. */
export function allLegacyEpubNotebookItems(hex: string, owner: string, marks: OwnTextMarksSync | null, cards: OwnTextCardsSync | null): LegacyOwnEpubItem[] {
  const local = unresolvedLegacyEpubItems(hex, owner)
  const known = new Set(local.map(item => `${item.kind}:${item.id}`))
  const remote: LegacyOwnEpubItem[] = [
    ...(marks?.pageMarks() ?? []).map(mark => ({ id: mark.id, kind: 'highlight' as const, page: mark.page, text: mark.text,
      ...(mark.note ? { note: mark.note } : {}), at: mark.at })),
    ...(cards?.pageCards() ?? []).map(card => ({ id: card.id, kind: 'card' as const, page: card.page, text: card.text,
      ...(card.note ? { note: card.note } : {}), turns: card.turns, ...(card.data ? { data: card.data } : {}), at: card.at })),
  ]
  return [...local, ...remote.filter(item => !known.has(`${item.kind}:${item.id}`))]
}

/** Every original row stays visible if not safely placed, with its page label and note. */
export function unresolvedLegacyEpubItems(hex: string, owner: string): LegacyOwnEpubItem[] {
  const records = copy(hex, owner)
  const migrated = new Set(migratedIds(hex, owner))
  const current = new Map((ownTextMarksCanonical(hex) ? readOwnedTextMarks(hex, owner) : readLabHighlights())
    .filter(mark => mark.bookId === userBookId(hex)).map(mark => [mark.id, mark]))
  // A cached older static reader may edit a mark after its ID was migrated.
  // The existing source-word mark stays untouched; show the newer page note
  // as an explicit Notebook conflict instead of silently treating its ID as
  // proof that the changed content was imported.
  const needsReview = (mark: LegacyRecord) => {
    if (!migrated.has(mark.id)) return true
    const saved = current.get(mark.id)
    return !saved || (mark.u ?? mark.at ?? 0) > (saved.updatedAt ?? 0)
      && (saved.text !== mark.text || saved.color !== mark.color || (saved.note ?? '') !== (mark.note ?? ''))
  }
  return [...records.marks.filter(mark => !mark.gone && needsReview(mark)).map(mark => ({ ...mark, kind: 'highlight' as const })),
    ...records.cards.filter(card => !card.gone).map(card => ({ ...card, kind: 'card' as const }))]
    .filter(record => typeof record.id === 'string' && Number.isInteger(record.page) && (record.page ?? 0) > 0)
    .map(record => {
      // Static cards keep the AI answer and follow-ups in `turns`, not `note`.
      // Show a bounded inert transcript in the shared Notebook; the full raw
      // card remains in the owner-scoped backup for recovery/export.
      const turns = record.kind === 'card' && Array.isArray(record.turns)
        ? record.turns.slice(0, 40).filter(turn => (turn?.role === 'assistant' || turn?.role === 'user') && typeof turn.content === 'string' && turn.content)
          .map(turn => ({ role: turn.role as 'user' | 'assistant', content: turn.content!.slice(0, 12000), ...(Number.isSafeInteger(turn.at) && (turn.at ?? 0) > 0 ? { at: turn.at } : {}) })) : []
      let data: Record<string, unknown> | undefined
      if (record.kind === 'card' && record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
        try { const json = JSON.stringify(record.data); if (json.length <= 16000) data = JSON.parse(json) } catch { /* raw backup retains details */ }
      }
      return { id: record.id, kind: record.kind, text: record.text ?? '', ...(record.note ? { note: record.note } : {}),
        ...(turns.length ? { turns } : {}), ...(data ? { data } : {}), page: record.page!, at: record.at ?? 0 }
    })
}
