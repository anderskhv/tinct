/** Owned EPUB text marks. One account/file controller, never the PDF page-mark set. */
import type { LabHighlight } from '../labHighlights'
import { readLabHighlights, writeLabHighlights } from '../labHighlights'
import { ownBookToken, type FetchLike } from './ownAccount'
import { userBookId } from './userBookId'
import { userBookOwner } from './userBookStore'
import type { UserBookEdition } from './userEdition'
import { editionSource } from './userEdition'

type Anchor = { editionKey: string; converter: number; chapterNumber: number } & (
  | { kind: 'chapter' }
  | { kind: 'range'; paragraphIndex: number; fromWord: number; endParagraphIndex: number; toWord: number }
)
export type TextMark = { v: 'text-v1'; id: string; anchor: Anchor; text: string; color: string; at: number; u?: number; note?: string; groupId?: string; groupText?: string }
export type EpubPageMark = { v: 'epub-page-v1'; id: string; page: number; start?: number; end?: number; text: string; color: string; note?: string; at: number; u?: number }
export type Gone = { id: string; gone: true; u: number }
export type TextItem = TextMark | EpubPageMark | Gone
const ID = /^[A-Za-z0-9_-]{4,120}$/
const COLORS = new Set(['gold', 'rose', 'sage', 'sky', 'lavender'])
const PREFIX = 'tinct-addbook:text-marks-sync:'
const ACTIVE_PREFIX = 'tinct-addbook:text-marks-owner:'
const LOCAL_PREFIX = 'tinct-addbook:text-marks-local:'
const UNASSIGNED_PREFIX = 'tinct-addbook:text-marks-unassigned:'
const ADOPTED_PREFIX = 'tinct-addbook:text-marks-adopted:'
const PREVIOUS_PREFIX = 'tinct-addbook:text-marks-previous:'
const QUARANTINE_PREFIX = 'tinct-addbook:text-marks-quarantine:'
const CANONICAL_PREFIX = 'tinct-addbook:text-marks-canonical:'
type CanonicalMarks = { marks: LabHighlight[]; items: TextItem[]; rev: number; dirty: boolean }
const canonicalKey = (hex: string, owner: string, fileId: string) => `${CANONICAL_PREFIX}${owner}:${hex}:${fileId}`
function validCanonicalMarks(value: unknown, hex: string): value is CanonicalMarks {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<CanonicalMarks>
  if (!Array.isArray(record.marks) || !Array.isArray(record.items) || !Number.isInteger(record.rev) || record.rev! < 0 || typeof record.dirty !== 'boolean') return false
  const markKeys = new Set(['id', 'groupId', 'groupText', 'bookId', 'editionKey', 'chapterNumber', 'paragraphIndex', 'fromWord', 'endParagraphIndex', 'toWord', 'color', 'note', 'text', 'kept', 'updatedAt', 'kind'])
  if (record.marks.some(mark => !mark || typeof mark !== 'object' || Object.keys(mark).some(key => !markKeys.has(key))
    || mark.bookId !== userBookId(hex) || !ID.test(mark.id) || !COLORS.has(mark.color)
    || !Number.isInteger(mark.chapterNumber) || mark.chapterNumber < 1
    || ![mark.paragraphIndex, mark.fromWord, mark.endParagraphIndex, mark.toWord].every(n => Number.isInteger(n) && n >= 0)
    || mark.text !== undefined && typeof mark.text !== 'string' || mark.note !== undefined && typeof mark.note !== 'string')) return false
  return !record.items.some(item => {
    if (!item || typeof item !== 'object' || !ID.test(item.id)) return true
    if ('gone' in item) return item.gone !== true || !time(item.u)
    if (item.v === 'epub-page-v1') return !Number.isInteger(item.page) || item.page < 1 || !time(item.at)
      || typeof item.text !== 'string' || typeof item.color !== 'string'
    if (item.v !== 'text-v1' || !time(item.at) || !item.anchor || typeof item.anchor !== 'object') return true
    const anchor = item.anchor
    return !Number.isInteger(anchor.converter) || !Number.isInteger(anchor.chapterNumber)
      || (anchor.kind !== 'chapter' && (anchor.kind !== 'range' || ![anchor.paragraphIndex, anchor.fromWord, anchor.endParagraphIndex, anchor.toWord]
        .every(n => Number.isInteger(n) && n >= 0)))
  })
}
const EVENT = 'tinct:own-text-marks'
const controllers = new Map<string, OwnTextMarksSync>()
const guarded = new Set<string>()
const generationGuarded = new Set<string>()
const time = (n: unknown): n is number => Number.isSafeInteger(n) && (n as number) > 0
const stamp = (item: TextItem) => 'gone' in item ? item.u : item.u ?? item.at

/** The source range must belong to this exact conversion; invalid/long records stay local, never truncated. */
export function textMarkOf(highlight: LabHighlight, hex: string, edition: UserBookEdition): TextMark | null {
  if (highlight.bookId !== userBookId(hex) || !ID.test(highlight.id) || !COLORS.has(highlight.color)) return null
  const chapter = edition.chapters.find(c => c.number === highlight.chapterNumber)
  if (!chapter || !Number.isInteger(edition.converter) || edition.converter < 1 || edition.converter > 1000) return null
  const editionKey = highlight.editionKey
  if (!editionKey || !/^(?:own|own-en|own-da)$/.test(editionKey)) return null
  const chapterNote = highlight.kind === 'chapter'
  if (!chapterNote && (!Number.isInteger(highlight.paragraphIndex) || !Number.isInteger(highlight.endParagraphIndex)
    || highlight.paragraphIndex < 0 || highlight.endParagraphIndex < highlight.paragraphIndex || highlight.endParagraphIndex >= chapter.paragraphs.length
    || !Number.isInteger(highlight.fromWord) || !Number.isInteger(highlight.toWord) || highlight.fromWord < 0
    || highlight.toWord <= 0 || highlight.paragraphIndex === highlight.endParagraphIndex && highlight.toWord <= highlight.fromWord)) return null
  const anchor: Anchor = chapterNote
    ? { editionKey, converter: edition.converter, chapterNumber: chapter.number, kind: 'chapter' }
    : { editionKey, converter: edition.converter, chapterNumber: chapter.number, kind: 'range', paragraphIndex: highlight.paragraphIndex, fromWord: highlight.fromWord, endParagraphIndex: highlight.endParagraphIndex, toWord: highlight.toWord }
  const created = Number(highlight.id.match(/^hl-(\d+)/)?.[1])
  const at = time(created) ? created : time(highlight.updatedAt) ? highlight.updatedAt : 1
  if (!time(at) || (highlight.text ?? '').length > 2000 || (highlight.note ?? '').length > 4000
    || highlight.groupId && !ID.test(highlight.groupId) || (highlight.groupText ?? '').length > 4000) return null
  return { v: 'text-v1', id: highlight.id, anchor, text: highlight.text ?? '', color: highlight.color, at,
    ...(highlight.updatedAt && highlight.updatedAt > at ? { u: highlight.updatedAt } : {}),
    ...(highlight.note ? { note: highlight.note } : {}),
    ...(highlight.groupId ? { groupId: highlight.groupId } : {}),
    ...(highlight.groupId && highlight.groupText ? { groupText: highlight.groupText } : {}) }
}

function labMarkOf(item: TextMark | EpubPageMark, hex: string, edition: UserBookEdition): LabHighlight | null {
  if (item.v !== 'text-v1') return null
  const a = item.anchor
  if (a.converter !== edition.converter || !edition.chapters.some(c => c.number === a.chapterNumber)) return null
  return { id: item.id, bookId: userBookId(hex), editionKey: a.editionKey, chapterNumber: a.chapterNumber,
    paragraphIndex: a.kind === 'chapter' ? 0 : a.paragraphIndex, fromWord: a.kind === 'chapter' ? 0 : a.fromWord,
    endParagraphIndex: a.kind === 'chapter' ? 0 : a.endParagraphIndex, toWord: a.kind === 'chapter' ? 0 : a.toWord,
    color: item.color as LabHighlight['color'], text: item.text, ...(a.kind === 'chapter' ? { kind: 'chapter' as const } : {}),
    ...(item.note ? { note: item.note } : {}), ...(item.groupId ? { groupId: item.groupId } : {}),
    ...(item.groupText ? { groupText: item.groupText } : {}), updatedAt: item.u ?? item.at }
}

export function mergeTextItems(a: TextItem[], b: TextItem[]): TextItem[] {
  const map = new Map<string, TextItem>()
  for (const item of [...a, ...b]) {
    const prior = map.get(item.id)
    if (!prior || stamp(item) > stamp(prior) || stamp(item) === stamp(prior) && 'gone' in item) map.set(item.id, item)
  }
  return [...map.values()].sort((x, y) => x.id.localeCompare(y.id))
}

function applyToLocal(items: TextItem[], hex: string, edition: UserBookEdition, owner: string): void {
  const bookId = userBookId(hex)
  const known = new Map(items.map(item => [item.id, item]))
  const next = readLabHighlights().filter(mark => {
    if (mark.bookId !== bookId) return true
    const item = known.get(mark.id)
    return !item || !('gone' in item) && !labMarkOf(item, hex, edition)
  })
  for (const item of items) if (!('gone' in item)) {
    const mark = labMarkOf(item, hex, edition)
    if (mark) next.push(mark)
  }
  try {
    if (!ownTextMarksBelongTo(hex, owner)) return
    const previous = localStorage.getItem(LOCAL_PREFIX + owner + ':' + hex)
    if (previous === null) return
    localStorage.setItem(PREVIOUS_PREFIX + owner + ':' + hex, previous)
    localStorage.setItem(LOCAL_PREFIX + owner + ':' + hex, JSON.stringify(next.filter(mark => mark.bookId === bookId)))
    localStorage.setItem('tinct-lab-highlights', JSON.stringify(next))
    if (ownTextMarksBelongTo(hex, owner)) localStorage.removeItem(PREVIOUS_PREFIX + owner + ':' + hex)
  } catch { return /* the owner gate fails closed; canonical backup remains */ }
  if (ownTextMarksBelongTo(hex, owner) && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT, { detail: { bookId, items, edition } }))
}

/** An exact owner-qualified payload is already accounted for, even when a global marker write failed. */
function ownerBackupMatches(hex: string, scoped: LabHighlight[]): boolean {
  const value = JSON.stringify(scoped), suffix = ':' + hex
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.endsWith(suffix) && (key.startsWith(LOCAL_PREFIX) || key.startsWith(PREVIOUS_PREFIX)) && localStorage.getItem(key) === value) return true
  }
  return false
}

/** Global React highlights predate owner tags. Archive unowned data; never upload it to a guessed account. */
function activateOwner(hex: string, owner: string): void {
  const bookId = userBookId(hex), key = ACTIVE_PREFIX + hex
  const prior = localStorage.getItem(key)
  // `readLabHighlights` performs a one-time legacy cleanup write. Ownership
  // switching must only read here, so a quota error cannot turn its catch into [].
  const raw = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]') as unknown
  if (!Array.isArray(raw)) throw new Error('private marks storage unreadable')
  const all = raw as LabHighlight[], scoped = all.filter(mark => mark?.bookId === bookId)
  const backed = localStorage.getItem(LOCAL_PREFIX + owner + ':' + hex)
  if (backed !== null && backed === JSON.stringify(scoped)) return
  if (scoped.length) {
    // A marker whose backup differs may be the remnant of a failed two-key
    // switch. Never attribute those global marks to the marker's owner.
    const priorBackup = prior && localStorage.getItem(LOCAL_PREFIX + prior + ':' + hex)
    if (!ownerBackupMatches(hex, scoped)) {
      const archive = prior ? `${QUARANTINE_PREFIX}${prior}:${hex}` : UNASSIGNED_PREFIX + hex
      // If storage is full, do not risk moving the only copy.
      const old = JSON.parse(localStorage.getItem(archive) || '[]') as unknown
      if (!Array.isArray(old)) throw new Error('private marks archive unreadable')
      const seen = new Set(old.map(item => JSON.stringify(item)))
      localStorage.setItem(archive, JSON.stringify([...old, ...scoped.filter(item => !seen.has(JSON.stringify(item)))]))
    }
  }
  let incoming: LabHighlight[] = []
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_PREFIX + owner + ':' + hex) || '[]')
    if (Array.isArray(raw)) incoming = raw.filter(mark => mark?.bookId === bookId)
  } catch { /* no trusted owner-scoped records */ }
  const next = JSON.stringify([...all.filter(mark => mark.bookId !== bookId), ...incoming])
  localStorage.setItem(LOCAL_PREFIX + owner + ':' + hex, JSON.stringify(incoming))
  // setItem is atomic: if quota rejects the replacement, all catalogue marks
  // and the previous owner's copy remain in place. The scoped UI gate hides it.
  localStorage.setItem('tinct-lab-highlights', next)
  if (localStorage.getItem('tinct-lab-highlights') !== next) throw new Error('private marks storage unavailable')
  // Informational for old cleanup clients. The owner-qualified backup and
  // exact projection proof, not this separately written key, authorize reads.
  try { localStorage.setItem(key, owner) } catch { /* the projection itself is already owner-proven */ }
}

export function ownTextMarksBelongTo(hex: string, owner: string | null): boolean {
  try {
    if (!owner || userBookOwner() !== owner) return false
    const canonical = controllers.get(owner + ':' + hex)
    if (canonical?.fileId) return canonical.isTrusted()
    if (generationGuarded.has(hex)) return false
    const backup = localStorage.getItem(LOCAL_PREFIX + owner + ':' + hex)
    if (backup === null) return false
    const raw = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')
    return Array.isArray(raw) && JSON.stringify(raw.filter(mark => mark?.bookId === userBookId(hex))) === backup
  } catch { return false }
}
export const ownTextMarksGuarded = (hex: string) => guarded.has(hex)
export const ownTextMarksCanonical = (hex: string) => generationGuarded.has(hex)
export function guardOwnTextMarks(hex: string): void { guarded.add(hex); generationGuarded.add(hex) }
export function releaseOwnTextMarksGuard(hex: string): void { guarded.delete(hex); generationGuarded.delete(hex) }
export function readOwnedTextMarks(hex: string, owner: string | null): LabHighlight[] {
  const controller = owner ? controllers.get(owner + ':' + hex) : null
  return controller?.fileId && controller.isTrusted() ? controller.read() : []
}

/** Import a verified older mark without letting the owner backup and React projection diverge. */
export function importOwnTextMarks(hex: string, owner: string, marks: LabHighlight[]): boolean {
  const controller = controllers.get(owner + ':' + hex)
  if (controller?.fileId) return controller.importMarks(marks)
  if (!ownTextMarksBelongTo(hex, owner)) return false
  try {
    const all = readLabHighlights(), known = new Set(all.map(item => item.id))
    const next = [...all, ...marks.filter(mark => mark.bookId === userBookId(hex) && !known.has(mark.id))]
    const backed = JSON.stringify(next.filter(mark => mark.bookId === userBookId(hex)))
    const originalBackup = localStorage.getItem(LOCAL_PREFIX + owner + ':' + hex)
    if (originalBackup === null) return false
    localStorage.setItem(PREVIOUS_PREFIX + owner + ':' + hex, originalBackup)
    localStorage.setItem(LOCAL_PREFIX + owner + ':' + hex, backed)
    try { localStorage.setItem('tinct-lab-highlights', JSON.stringify(next)) }
    catch {
      if (originalBackup !== null) localStorage.setItem(LOCAL_PREFIX + owner + ':' + hex, originalBackup)
      return false
    }
    if (ownTextMarksBelongTo(hex, owner)) {
      localStorage.removeItem(PREVIOUS_PREFIX + owner + ':' + hex)
      return true
    }
    return false
  } catch { return false }
}

/** Explicit recovery of pre-owner React marks; no account silently claims them. */
export function unassignedOwnTextMarkCount(hex: string, owner: string): number {
  try {
    if (localStorage.getItem(ADOPTED_PREFIX + owner + ':' + hex)) return 0
    const list = JSON.parse(localStorage.getItem(UNASSIGNED_PREFIX + hex) || '[]')
    return Array.isArray(list) ? list.filter(mark => mark?.bookId === userBookId(hex)).length : 0
  } catch { return 0 }
}

export function adoptUnassignedOwnTextMarks(hex: string, owner: string): boolean {
  if (userBookOwner() !== owner || !ownTextMarksBelongTo(hex, owner)) return false
  const controller = controllers.get(owner + ':' + hex)
  if (controller?.fileId) {
    try {
      const legacy: unknown = JSON.parse(localStorage.getItem(UNASSIGNED_PREFIX + hex) || '[]')
      if (!Array.isArray(legacy) || !legacy.length || legacy.some(mark => mark?.bookId !== userBookId(hex))) return false
      const known = new Map(controller.read().map(mark => [mark.id, mark]))
      if (legacy.some(mark => known.has(mark.id) && JSON.stringify(known.get(mark.id)) !== JSON.stringify(mark))) return false
      if (!controller.importMarks(legacy)) return false
      try { localStorage.setItem(ADOPTED_PREFIX + owner + ':' + hex, '1') } catch { /* canonical data is sufficient */ }
      return true
    } catch { return false }
  }
  try {
    const legacy = JSON.parse(localStorage.getItem(UNASSIGNED_PREFIX + hex) || '[]') as LabHighlight[]
    if (!Array.isArray(legacy) || !legacy.length || !legacy.every(mark => mark?.bookId === userBookId(hex))) return false
    const all = readLabHighlights(), ids = new Map(all.map(mark => [mark.id, mark]))
    // A conflicting ID cannot be silently replaced or conflated with another owner's annotation.
    if (legacy.some(mark => ids.has(mark.id) && JSON.stringify(ids.get(mark.id)) !== JSON.stringify(mark))) return false
    const next = [...all, ...legacy.filter(mark => !ids.has(mark.id))]
    const previous = localStorage.getItem(LOCAL_PREFIX + owner + ':' + hex)
    if (previous === null) return false
    localStorage.setItem(PREVIOUS_PREFIX + owner + ':' + hex, previous)
    localStorage.setItem(LOCAL_PREFIX + owner + ':' + hex, JSON.stringify(next.filter(mark => mark.bookId === userBookId(hex))))
    localStorage.setItem('tinct-lab-highlights', JSON.stringify(next))
    if (!ownTextMarksBelongTo(hex, owner)) return false
    localStorage.removeItem(PREVIOUS_PREFIX + owner + ':' + hex)
    localStorage.setItem(ADOPTED_PREFIX + owner + ':' + hex, '1')
    return true
  } catch { return false }
}

export function listenOwnTextMarks(bookId: string, receive: (items: TextItem[], edition: UserBookEdition) => void): () => void {
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ bookId: string; items: TextItem[]; edition: UserBookEdition }>).detail
    if (detail?.bookId === bookId) receive(detail.items, detail.edition)
  }
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}

export function mergeIncomingLabMarks(current: LabHighlight[], items: TextItem[], hex: string, edition: UserBookEdition): LabHighlight[] {
  const known = new Map(items.map(item => [item.id, item]))
  const next = current.filter(mark => {
    if (mark.bookId !== userBookId(hex)) return true
    const item = known.get(mark.id)
    return !item || !('gone' in item) && !labMarkOf(item, hex, edition)
  })
  for (const item of items) if (!('gone' in item)) {
    const mark = labMarkOf(item, hex, edition)
    if (mark) next.push(mark)
  }
  return next
}

export class OwnTextMarksSync {
  private items: TextItem[] = []
  private rev = 0
  private dirty = false
  private running: Promise<void> | null = null
  private retryMs = 1500
  private timer: ReturnType<typeof setTimeout> | null = null
  private live = true
  private canonical: CanonicalMarks | null = null
  private invalidGeneration = false
  constructor(readonly hex: string, readonly owner: string, readonly edition: UserBookEdition,
    private readonly token: () => Promise<string | null> = ownBookToken, private readonly fetchImpl: FetchLike = fetch,
    readonly fileId?: string | null) {
    if (fileId) {
      if (!/^[0-9a-f]{32}$/.test(fileId) || userBookOwner() !== owner) throw new Error('private mark generation unavailable')
      const key = canonicalKey(hex, owner, fileId), raw = localStorage.getItem(key)
      const parsed: unknown = raw ? JSON.parse(raw) : null
      if (raw && !validCanonicalMarks(parsed, hex)) throw new Error('private marks canonical unreadable')
      const initial: CanonicalMarks = parsed as CanonicalMarks ?? { marks: [], items: [], rev: 0, dirty: false }
      if (!raw) { const value = JSON.stringify(initial); localStorage.setItem(key, value); if (localStorage.getItem(key) !== value) throw new Error('private marks canonical unavailable') }
      this.canonical = initial
      this.archiveUnknownLegacy()
      return
    }
    if (userBookOwner() === owner) activateOwner(hex, owner)
    try {
      const saved = JSON.parse(localStorage.getItem(PREFIX + owner + ':' + hex) || 'null')
      if (saved && Array.isArray(saved.items) && Number.isInteger(saved.rev) && saved.rev >= 0) { this.items = saved.items; this.rev = saved.rev; this.dirty = !!saved.dirty }
    } catch { /* retain the local highlights independently */ }
  }
  private archiveUnknownLegacy() {
    try {
      if (localStorage.getItem(ACTIVE_PREFIX + this.hex)) return
      const raw: unknown = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')
      if (!Array.isArray(raw)) return
      const scoped = raw.filter(mark => mark?.bookId === userBookId(this.hex)) as LabHighlight[]
      if (!scoped.length) return
      for (let i = 0; i < localStorage.length; i++) {
        const item = localStorage.key(i)
        if (item?.startsWith(CANONICAL_PREFIX) && item.includes(':' + this.hex + ':') && item !== canonicalKey(this.hex, this.owner, this.fileId!)) return
        if (item?.startsWith(LOCAL_PREFIX) && item.endsWith(':' + this.hex)) return
      }
      const archived: unknown = JSON.parse(localStorage.getItem(UNASSIGNED_PREFIX + this.hex) || '[]')
      if (!Array.isArray(archived)) return
      const known = new Set(archived.map(mark => JSON.stringify(mark)))
      localStorage.setItem(UNASSIGNED_PREFIX + this.hex, JSON.stringify([...archived, ...scoped.filter(mark => !known.has(JSON.stringify(mark)))]))
    } catch { /* original global data is left intact */ }
  }
  isTrusted(): boolean {
    if (!this.live || this.invalidGeneration || userBookOwner() !== this.owner || !this.fileId || !this.canonical) return false
    try { return localStorage.getItem(canonicalKey(this.hex, this.owner, this.fileId)) === JSON.stringify(this.canonical) } catch { return false }
  }
  read(): LabHighlight[] { return this.isTrusted() ? this.canonical!.marks : [] }
  pageMarks(): EpubPageMark[] { return this.isTrusted() && editionSource(this.edition) === 'epub'
    ? this.canonical!.items.filter((item): item is EpubPageMark => !('gone' in item) && item.v === 'epub-page-v1') : [] }
  private commitCanonical(next: CanonicalMarks): boolean {
    if (!this.isTrusted() || !this.fileId || !validCanonicalMarks(next, this.hex)) return false
    try {
      const value = JSON.stringify(next), key = canonicalKey(this.hex, this.owner, this.fileId)
      localStorage.setItem(key, value)
      if (localStorage.getItem(key) !== value) return false
      this.canonical = next
      return true
    } catch { return false }
  }
  importMarks(marks: LabHighlight[]): boolean {
    if (!this.isTrusted()) return false
    const before = this.read(), known = new Set(before.map(mark => mark.id))
    const prior = new Map(this.canonical!.items.map(item => [item.id, item]))
    // A later edit of the original page must stay unresolved; conversion may
    // replace only the very page record whose source and note were verified.
    if (marks.some(mark => {
      const old = prior.get(mark.id)
      return old && !('gone' in old) && old.v === 'epub-page-v1'
        && (old.text !== (mark.text ?? '') || old.color !== mark.color || (old.note ?? '') !== (mark.note ?? '')
          || stamp(old) > (mark.updatedAt ?? 0))
    })) return false
    const scoped = marks.filter(mark => mark.bookId === userBookId(this.hex) && !known.has(mark.id)).map(mark => {
      const old = prior.get(mark.id)
      return old && ('gone' in old || old.v === 'epub-page-v1') && (mark.updatedAt ?? 0) <= stamp(old)
        ? { ...mark, updatedAt: stamp(old) + 1 } : mark
    })
    if (scoped.some(mark => !textMarkOf(mark, this.hex, this.edition))) return false
    if (!this.localCanonical([...before, ...scoped], false)) return false
    return marks.every(mark => this.canonical!.items.some(item => item.id === mark.id && !('gone' in item) && item.v === 'text-v1'))
  }
  importPageMarks(marks: EpubPageMark[]): boolean {
    if (!this.isTrusted() || editionSource(this.edition) !== 'epub') return false
    const known = new Set(this.canonical!.items.map(item => item.id))
    const additions = marks.filter(mark => !known.has(mark.id))
    if (!additions.length) return true
    const next = { ...this.canonical!, items: mergeTextItems(this.canonical!.items, additions), dirty: true }
    if (!this.commitCanonical(next)) return false
    this.scheduleCanonical()
    return true
  }
  private localCanonical(list: LabHighlight[], trackRemovals: boolean): boolean {
    if (!this.isTrusted()) return false
    const current = this.canonical!, marks = list.filter(mark => mark.bookId === userBookId(this.hex))
    const valid = marks.map(mark => textMarkOf(mark, this.hex, this.edition))
    if (valid.some(mark => !mark)) return false
    const ids = new Set(marks.map(mark => mark.id))
    const removed: Gone[] = trackRemovals ? current.items.filter((item): item is TextMark => !('gone' in item) && item.v === 'text-v1' && item.anchor.converter === this.edition.converter && !ids.has(item.id))
      .map(item => ({ id: item.id, gone: true, u: Math.max(Date.now(), stamp(item) + 1) })) : []
    const items = mergeTextItems(current.items, [...valid as TextMark[], ...removed])
    const changed = JSON.stringify(items) !== JSON.stringify(current.items)
    if (!changed && JSON.stringify(marks) === JSON.stringify(current.marks)) return true
    const next = { ...current, marks, items, dirty: current.dirty || changed }
    if (!this.commitCanonical(next)) return false
    if (next.dirty) this.scheduleCanonical()
    return true
  }
  private scheduleCanonical() { if (this.timer) clearTimeout(this.timer); this.timer = setTimeout(() => { this.timer = null; void this.sync() }, 1500) }
  private usable() { return this.fileId ? this.isTrusted() : this.live && userBookOwner() === this.owner && ownTextMarksBelongTo(this.hex, this.owner) }
  private save() { try { localStorage.setItem(PREFIX + this.owner + ':' + this.hex, JSON.stringify({ items: this.items, rev: this.rev, dirty: this.dirty })) } catch { /* local marks remain */ } }
  private local(list: LabHighlight[], trackRemovals = true) {
    const marks = list.filter(mark => mark.bookId === userBookId(this.hex))
    const valid = marks.map(mark => textMarkOf(mark, this.hex, this.edition))
    // One unsupported mark blocks a write of a partial set. It stays on this device for a later migration.
    if (valid.some(mark => !mark)) return false
    const existing = new Map(this.items.map(item => [item.id, item]))
    const live = valid as TextMark[]
    const ids = new Set(live.map(mark => mark.id))
    const removed: Gone[] = trackRemovals ? this.items.filter((item): item is TextMark => !('gone' in item) && item.v === 'text-v1' && item.anchor.converter === this.edition.converter && !ids.has(item.id))
      .map(item => ({ id: item.id, gone: true, u: Math.max(Date.now(), stamp(item) + 1) }))
      : []
    const merged = mergeTextItems(this.items, [...live.map(mark => {
      const prior = existing.get(mark.id)
      return prior && !('gone' in prior) && JSON.stringify({ ...prior, at: 0, u: 0 }) === JSON.stringify({ ...mark, at: 0, u: 0 }) ? prior : mark
    }), ...removed])
    if (JSON.stringify(merged) !== JSON.stringify(this.items)) { this.items = merged; this.dirty = true; this.save() }
    return true
  }
  /** Before the first React paint: reconcile this device and account; an unavailable account never blocks reading. */
  async open(): Promise<void> {
    if (!this.usable()) return
    if (this.fileId) { await this.sync(); return }
    if (!this.local(readLabHighlights(), false)) return
    await this.sync()
  }
  changed(list: LabHighlight[]): boolean {
    if (this.fileId) return this.localCanonical(list, true)
    if (!this.usable() || !this.local(list)) return false
    try {
      // The hook can unmount before React's persistence effect after a delete.
      // Commit the owner backup and projected list here, before navigation;
      // journal tombstones were already saved by `local` above. On a failed
      // second write the gate closes rather than uploading a partial set.
      const raw = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]') as LabHighlight[]
      if (!Array.isArray(raw)) return false
      const scoped = list.filter(mark => mark.bookId === userBookId(this.hex))
      const previous = localStorage.getItem(LOCAL_PREFIX + this.owner + ':' + this.hex)
      if (previous === null) return false
      localStorage.setItem(PREVIOUS_PREFIX + this.owner + ':' + this.hex, previous)
      localStorage.setItem(LOCAL_PREFIX + this.owner + ':' + this.hex, JSON.stringify(scoped))
      localStorage.setItem('tinct-lab-highlights', JSON.stringify([...raw.filter(mark => mark.bookId !== userBookId(this.hex)), ...scoped]))
      if (this.usable()) localStorage.removeItem(PREVIOUS_PREFIX + this.owner + ':' + this.hex)
    } catch { return false }
    if (!this.usable()) return false
    if (!this.dirty) return true
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => { this.timer = null; void this.sync() }, 1500)
    return true
  }
  async sync(): Promise<void> {
    if (this.running) return this.running
    this.running = this.doSync().finally(() => {
      this.running = null
      if (!this.fileId) return
      if (this.isTrusted() && this.canonical?.dirty && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
        if (this.timer) clearTimeout(this.timer)
        const delay = this.retryMs
        this.retryMs = Math.min(this.retryMs * 2, 30_000)
        this.timer = setTimeout(() => { this.timer = null; void this.sync() }, delay)
      } else if (!this.canonical?.dirty) this.retryMs = 1500
    })
    return this.running
  }
  private async doSync(): Promise<void> {
    if (this.fileId) { await this.syncCanonical(); return }
    if (!this.usable()) return
    const token = await this.token()
    if (!token || !this.usable()) return
    // PDF Tinct text has source-word anchors, which must never enter the
    // original page-rectangle marks generation.
    const url = `/api/user-books/${editionSource(this.edition) === 'epub' ? 'marks' : 'text-marks'}/${this.hex}`
    const call = async (method: string, body?: object) => {
      const response = await this.fetchImpl(url, { method, credentials: 'same-origin', cache: 'no-store', headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
      return { status: response.status, data: await response.json().catch(() => ({})) as { marks?: TextItem[]; rev?: number } }
    }
    try {
      const initial = await call('GET')
      if (initial.status !== 200 || !Array.isArray(initial.data.marks) || !Number.isInteger(initial.data.rev) || !this.usable()) return
      this.rev = initial.data.rev!
      const before = JSON.stringify(this.items)
      this.items = mergeTextItems(this.items, initial.data.marks)
      this.dirty ||= before !== JSON.stringify(initial.data.marks)
      this.save()
      applyToLocal(this.items, this.hex, this.edition, this.owner)
      for (let attempt = 0; attempt < 3 && this.dirty && this.usable(); attempt++) {
        const sent = JSON.stringify(this.items)
        const response = await call('PUT', { marks: this.items, rev: this.rev })
        if (!this.usable()) return
        if (response.status === 200 && Number.isInteger(response.data.rev)) {
          this.rev = response.data.rev!
          this.dirty = JSON.stringify(this.items) !== sent
          this.save()
          continue
        }
        if (response.status !== 409 || !Array.isArray(response.data.marks) || !Number.isInteger(response.data.rev)) return
        this.rev = response.data.rev!
        this.items = mergeTextItems(this.items, response.data.marks)
        this.save()
        applyToLocal(this.items, this.hex, this.edition, this.owner)
      }
    } catch { /* offline: dirty set and local records remain */ }
  }
  private async syncCanonical(): Promise<void> {
    if (!this.isTrusted()) return
    const token = await this.token()
    if (!token || !this.isTrusted()) return
    const url = `/api/user-books/${editionSource(this.edition) === 'epub' ? 'marks' : 'text-marks'}/${this.hex}`
    const call = async (method: string, body?: object) => {
      const response = await this.fetchImpl(url, { method, credentials: 'same-origin', cache: 'no-store',
        headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}) })
      return { status: response.status, data: await response.json().catch(() => ({})) as { marks?: TextItem[]; rev?: number; fileId?: string; error?: string } }
    }
    const integrate = (remote: TextItem[], rev: number): boolean => {
      const old = this.canonical!, items = mergeTextItems(old.items, remote)
      const marks = mergeIncomingLabMarks(old.marks, items, this.hex, this.edition).filter(mark => mark.bookId === userBookId(this.hex))
      const next = { marks, items, rev, dirty: old.dirty || JSON.stringify(items) !== JSON.stringify(remote) }
      if (!this.commitCanonical(next)) return false
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT, { detail: { bookId: userBookId(this.hex), items, edition: this.edition } }))
      return true
    }
    try {
      const initial = await call('GET')
      if (initial.status !== 200 || !Array.isArray(initial.data.marks) || !Number.isInteger(initial.data.rev) || !this.isTrusted()) return
      if (initial.data.fileId !== this.fileId) { this.invalidateCanonical(); return }
      if (!integrate(initial.data.marks, initial.data.rev!)) return
      for (let attempt = 0; attempt < 3 && this.isTrusted() && this.canonical!.dirty; attempt++) {
        const sent = JSON.stringify(this.canonical!.items)
        const response = await call('PUT', { marks: this.canonical!.items, rev: this.canonical!.rev, expectedFileId: this.fileId })
        if (response.data.error === 'generation_conflict'
          || (response.status === 200 || response.status === 409) && response.data.fileId !== this.fileId) { this.invalidateCanonical(); return }
        if (!this.isTrusted()) return
        if (response.status === 200 && Number.isInteger(response.data.rev)) {
          if (!this.commitCanonical({ ...this.canonical!, rev: response.data.rev!, dirty: JSON.stringify(this.canonical!.items) !== sent })) return
          continue
        }
        if (response.status !== 409 || !Array.isArray(response.data.marks) || !Number.isInteger(response.data.rev)) return
        if (!integrate(response.data.marks, response.data.rev!)) return
      }
    } catch { /* offline: canonical owner generation remains local */ }
  }
  private invalidateCanonical() {
    this.invalidGeneration = true
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT, { detail: { bookId: userBookId(this.hex), items: [], edition: this.edition, invalid: true } }))
  }
  dispose() { this.live = false; if (this.timer) clearTimeout(this.timer); controllers.delete(this.owner + ':' + this.hex) }
}

export function startOwnTextMarksSync(hex: string, owner: string, edition: UserBookEdition, fileId?: string | null): OwnTextMarksSync {
  guarded.add(hex)
  if (fileId) generationGuarded.add(hex)
  const key = owner + ':' + hex
  controllers.get(key)?.dispose()
  const controller = new OwnTextMarksSync(hex, owner, edition, undefined, undefined, fileId)
  controllers.set(key, controller)
  return controller
}
export function noteOwnTextMarks(hex: string, list: LabHighlight[]): boolean {
  let updated = false
  for (const controller of controllers.values()) if (controller.hex === hex) updated = controller.changed(list) || updated
  return updated
}
