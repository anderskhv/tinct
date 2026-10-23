/** Private source-word cards and ordinary Talk in one atomic owner-qualified local record. */
import type { ChatConversation, ChatMessage } from '../../types'
import { LAB_CHAT_MAX_MESSAGES_PER_BOOK, mergeChatConversations, parseChatConversations } from '../labChatHistory'
import { cardConversationId } from '../marginPreview/marginPreviewCards'
import { ownTextCardDraft, type OwnTextCardDraft, type SharedReaderCard } from '../sharedReader/sharedReaderCards'
import { ownBookToken, type FetchLike } from './ownAccount'
import { userBookId } from './userBookId'
import { userBookOwner } from './userBookStore'
import { editionSource, type UserBookEdition } from './userEdition'

type Gone = { id: string; gone: true; u: number }
export type EpubPageCard = { v: 'epub-page-v1'; id: string; page: number; text: string; kind: OwnTextCardDraft['kind']; turns: OwnTextCardDraft['turns']; at: number; u?: number;
  data?: Record<string, unknown>; note?: string; color?: string; mark?: string; rects?: number[][]; span?: [number, number, number]; free?: boolean; unitNote?: boolean; unit?: string }
export type OwnTextCardItem = OwnTextCardDraft | EpubPageCard | Gone
type Canonical = { conversations: ChatConversation[]; items: OwnTextCardItem[]; rev: number; dirty: boolean; blocked?: boolean }
const CANONICAL = 'tinct-addbook:text-cards-canonical:'
const UNASSIGNED = 'tinct-addbook:text-cards-unassigned:'
const ADOPTED = 'tinct-addbook:text-cards-adopted:'
const LEGACY_OWNER = 'tinct-addbook:text-cards-owner:'
const legacyKey = (hex: string) => `tinct:chat-history:${userBookId(hex)}`
const originalTalk = (row: ChatConversation) => row.id.startsWith('pdf-original-')
const key = (hex: string, owner: string, fileId?: string | null) => `${CANONICAL}${owner}:${hex}${fileId ? ':' + fileId : ''}`
const stamp = (item: OwnTextCardItem) => 'gone' in item ? item.u : item.u ?? item.at
const validTime = (n: unknown): n is number => Number.isSafeInteger(n) && (n as number) > 0
const stable = (value: unknown): string => JSON.stringify(value, (_key, nested: unknown) => nested && typeof nested === 'object' && !Array.isArray(nested)
  ? Object.fromEntries(Object.entries(nested).sort(([a], [b]) => a.localeCompare(b))) : nested)

export function mergeOwnTextCards(a: OwnTextCardItem[], b: OwnTextCardItem[]): OwnTextCardItem[] {
  const map = new Map<string, OwnTextCardItem>()
  for (const item of [...a, ...b]) {
    const old = map.get(item.id)
    if (!old || stamp(item) > stamp(old) || stamp(item) === stamp(old) && 'gone' in item) map.set(item.id, item)
  }
  return [...map.values()].sort((x, y) => x.id.localeCompare(y.id))
}

function parseCanonical(value: unknown, hex: string): Canonical | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  if (!Array.isArray(raw.conversations) || !Array.isArray(raw.items) || !Number.isInteger(raw.rev) || (raw.rev as number) < 0) return null
  // Validate the complete saved conversation list rather than silently dropping unknown rows.
  const parsed = parseChatConversations(raw.conversations, userBookId(hex))
  if (parsed.length !== raw.conversations.length || raw.conversations.some((row, i) => {
    if (!row || row.bookId !== userBookId(hex) || !Array.isArray(row.messages) || row.messages.length !== parsed[i].messages.length) return true
    if (row.card && !parsed[i].card) return true
    // A sanitizer must not quietly replace a saved private answer with a shortened one.
    return stable(row) !== stable(parsed[i])
  })) return null
  if (raw.items.some(item => {
    if (!item || typeof item !== 'object' || !/^[A-Za-z0-9_-]{4,120}$/.test(item.id)) return true
    if (item.gone === true) return !validTime(item.u)
    if (item.v !== 'text-v1' && item.v !== 'epub-page-v1') return true
    if (!validTime(item.at) || !Array.isArray(item.turns) || item.turns.some((turn: unknown) => !turn || typeof turn !== 'object'
      || !['user', 'assistant'].includes((turn as { role?: string }).role ?? '') || typeof (turn as { content?: unknown }).content !== 'string')) return true
    return item.v === 'text-v1' ? !item.anchor || typeof item.anchor !== 'object' || !Number.isInteger(item.anchor.converter)
      : !Number.isInteger(item.page) || item.page < 1
  })) return null
  return { conversations: raw.conversations as ChatConversation[], items: raw.items as OwnTextCardItem[],
    rev: raw.rev as number, dirty: raw.dirty === true, ...(typeof raw.blocked === 'boolean' ? { blocked: raw.blocked } : {}) }
}
function stored(hex: string, owner: string, fileId?: string | null): Canonical | null {
  try { return parseCanonical(JSON.parse(localStorage.getItem(key(hex, owner, fileId)) || 'null'), hex) } catch { return null }
}

/** The canonical record alone authorizes UI and network. Hash-only history has no owner proof. */
export function ownTextCardsBelongTo(hex: string, owner: string | null, fileId?: string | null): boolean {
  return !!owner && userBookOwner() === owner && !!stored(hex, owner, fileId)
}
export function readOwnedTextChat(hex: string, owner: string, fileId?: string | null): ChatConversation[] {
  return ownTextCardsBelongTo(hex, owner, fileId) ? parseChatConversations(stored(hex, owner, fileId)!.conversations, userBookId(hex)) : []
}

function archiveLegacy(hex: string, owner: string): void {
  const raw: unknown = JSON.parse(localStorage.getItem(legacyKey(hex)) || '[]')
  if (!Array.isArray(raw)) throw new Error('legacy chat unreadable')
  const prior = localStorage.getItem(LEGACY_OWNER + hex)
  const alreadyOwned = raw.length > 0 && Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
    .some(k => k?.startsWith(CANONICAL) && (k.endsWith(':' + hex) || k.includes(':' + hex + ':')) && (() => {
      try {
        const ownerCopy = parseCanonical(JSON.parse(localStorage.getItem(k) || 'null'), hex)
        const known = new Set(ownerCopy?.conversations.map(row => JSON.stringify(row)) ?? [])
        return raw.every(row => known.has(JSON.stringify(row)))
      } catch { return false }
    })())
  if (!prior && raw.length && !alreadyOwned) {
    const old: unknown = JSON.parse(localStorage.getItem(UNASSIGNED + hex) || '[]')
    if (!Array.isArray(old)) throw new Error('legacy chat archive unreadable')
    const seen = new Set(old.map(row => JSON.stringify(row)))
    localStorage.setItem(UNASSIGNED + hex, JSON.stringify([...old, ...raw.filter(row => !seen.has(JSON.stringify(row)))]))
  }
  // Only a navigation hint for the flag-off reader; private React never trusts it.
  try { localStorage.setItem(LEGACY_OWNER + hex, owner) } catch { /* canonical owner record is authoritative */ }
}

export function unassignedOwnTextCardCount(hex: string, owner: string, fileId?: string | null): number {
  try {
    if (userBookOwner() !== owner || localStorage.getItem(ADOPTED + owner + ':' + hex)) return 0
    const raw: unknown = JSON.parse(localStorage.getItem(UNASSIGNED + hex) || '[]')
    if (!Array.isArray(raw)) return 0
    const seen = new Set((stored(hex, owner, fileId)?.conversations ?? []).map(row => JSON.stringify(row)))
    return raw.filter(row => !seen.has(JSON.stringify(row))).length
  } catch { return 0 }
}
export function adoptUnassignedOwnTextCards(hex: string, owner: string, fileId?: string | null): boolean {
  if (!ownTextCardsBelongTo(hex, owner, fileId)) return false
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(UNASSIGNED + hex) || '[]')
    if (!Array.isArray(raw) || !raw.length || raw.some(row => !row || row.bookId !== userBookId(hex))) return false
    const current = stored(hex, owner, fileId)!, byId = new Map(current.conversations.map(row => [row.id, row]))
    if (raw.some(row => byId.has(row.id) && JSON.stringify(byId.get(row.id)) !== JSON.stringify(row))) return false
    const conversations = [...current.conversations, ...raw.filter(row => !byId.has(row.id))]
    const candidate = { ...current, conversations }
    if (!parseCanonical(candidate, hex)) return false
    const next = JSON.stringify(candidate)
    localStorage.setItem(key(hex, owner, fileId), next)
    if (localStorage.getItem(key(hex, owner, fileId)) !== next) return false
    try { localStorage.setItem(ADOPTED + owner + ':' + hex, '1') } catch { /* deduped by canonical data next time */ }
    return true
  } catch { return false }
}

function conversationOf(item: OwnTextCardDraft, hex: string): ChatConversation | null {
  if (!item.turns.length) return null
  const id = cardConversationId(item.id), bookId = userBookId(hex), chapterNumber = item.anchor.chapterNumber
  const anchor = item.anchor.kind === 'range' ? { editionKey: item.anchor.editionKey, chapterNumber,
    paragraphIndex: item.anchor.paragraphIndex, fromWord: item.anchor.fromWord,
    endParagraphIndex: item.anchor.endParagraphIndex, toWord: item.anchor.toWord } : undefined
  const messages: ChatMessage[] = item.turns.map((turn, index) => ({ id: `${id}:${index}`, role: turn.role, content: turn.content,
    timestamp: Math.max(item.at + index, turn.at ?? item.at + index), bookId, chapterNumber,
    ...(anchor ? { paragraphIndex: anchor.paragraphIndex } : {}), ...(index === 0 && item.text ? { highlightedText: item.text } : {}) }))
  return { id, bookId, chapterNumber, ...(anchor ? { paragraphIndex: anchor.paragraphIndex } : {}),
    startTimestamp: messages[0].timestamp, endTimestamp: messages[messages.length - 1].timestamp,
    messages, preview: messages[0].content.slice(0, 80), card: { id: item.id, kind: item.kind, chapterNumber,
      at: item.at, u: item.u, ...(anchor ? { anchor } : {}), ...(item.text ? { text: item.text } : {}), ...(item.data ? { data: item.data } : {}) } }
}

function cardOf(row: ChatConversation, hex: string, edition: UserBookEdition): OwnTextCardDraft | null {
  const c = row.card
  if (!c || c.gone || row.bookId !== userBookId(hex) || !validTime(c.at) || !validTime(c.u)) return null
  const editionKey = c.anchor?.editionKey ?? (edition.language === 'da' ? 'own-da' : edition.language === 'en' ? 'own-en' : 'own')
  if (!/^(?:own|own-en|own-da)$/.test(editionKey)) return null
  return ownTextCardDraft({ source: { kind: 'own-text', bookId: userBookId(hex), ownHex: hex, converter: edition.converter, editionKey: editionKey as 'own' | 'own-en' | 'own-da' },
    id: c.id, kind: c.kind as SharedReaderCard['kind'], chapterNumber: c.chapterNumber, ...(c.anchor ? { anchor: c.anchor } : {}),
    text: c.text, turns: row.messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({ role: m.role as 'user' | 'assistant', content: m.content, at: m.timestamp })),
    data: c.data, at: c.at, u: c.u })
}

/** A remote correction replaces only matching cards; ordinary Talk and unprojectable cards remain local. */
function project(items: OwnTextCardItem[], hex: string, edition: UserBookEdition, local: ChatConversation[]): ChatConversation[] {
  const known = new Map(items.map(item => [item.id, item]))
  const next = local.filter(row => {
    if (!row.card) return true
    const item = known.get(row.card.id)
    return !item || !('gone' in item) && (item.v !== 'text-v1' || item.anchor.converter !== edition.converter || !item.turns.length)
  })
  for (const item of items) if (!('gone' in item) && item.v === 'text-v1' && item.anchor.converter === edition.converter) {
    const rendered = conversationOf(item, hex)
    if (rendered) next.push(rendered)
  }
  return next
}

export class OwnTextCardsSync {
  private state: Canonical
  private live = true
  private timer: ReturnType<typeof setTimeout> | null = null
  private running: Promise<void> | null = null
  private retryMs = 1500
  private subscribers = new Set<(rows: ChatConversation[]) => void>()
  private invalidGeneration = false
  constructor(readonly hex: string, readonly owner: string, readonly edition: UserBookEdition | null,
    private readonly token: () => Promise<string | null> = ownBookToken, private readonly fetchImpl: FetchLike = fetch,
    readonly fileId?: string | null) {
    if (fileId && !/^[0-9a-f]{32}$/.test(fileId)) throw new Error('private book generation unavailable')
    if (userBookOwner() !== owner) throw new Error('private chat owner changed')
    archiveLegacy(hex, owner)
    let state = stored(hex, owner, fileId)
    if (!state) {
      if (localStorage.getItem(key(hex, owner, fileId)) !== null) throw new Error('private chat canonical unreadable')
      const fresh: Canonical = { conversations: [], items: [], rev: 0, dirty: false }
      const raw = JSON.stringify(fresh)
      localStorage.setItem(key(hex, owner, fileId), raw)
      if (localStorage.getItem(key(hex, owner, fileId)) !== raw) throw new Error('private chat canonical unavailable')
      state = fresh
    }
    this.state = state
  }
  isTrusted(): boolean {
    if (!this.live || this.invalidGeneration || userBookOwner() !== this.owner) return false
    try { return localStorage.getItem(key(this.hex, this.owner, this.fileId)) === JSON.stringify(this.state) } catch { return false }
  }
  readAll(): ChatConversation[] { return this.isTrusted() ? parseChatConversations(stored(this.hex, this.owner, this.fileId)!.conversations, userBookId(this.hex)) : [] }
  read(): ChatConversation[] {
    const all = this.readAll()
    return !this.edition ? all.filter(originalTalk)
      : editionSource(this.edition) === 'pdf' ? all.filter(row => !originalTalk(row)) : all
  }
  adoptUnassigned(): boolean {
    if (!this.isTrusted() || !adoptUnassignedOwnTextCards(this.hex, this.owner, this.fileId)) return false
    const next = stored(this.hex, this.owner, this.fileId)
    if (!next) return false
    this.state = next
    for (const subscriber of this.subscribers) subscriber(this.read())
    return true
  }
  pageCards(): EpubPageCard[] { return this.isTrusted() && this.edition && editionSource(this.edition) === 'epub'
    ? this.state.items.filter((item): item is EpubPageCard => !('gone' in item) && item.v === 'epub-page-v1') : [] }
  subscribe(fn: (rows: ChatConversation[]) => void): () => void { this.subscribers.add(fn); return () => { this.subscribers.delete(fn) } }
  private commit(next: Canonical): boolean {
    if (!this.isTrusted() || !parseCanonical(next, this.hex)) return false
    try {
      const raw = JSON.stringify(next)
      localStorage.setItem(key(this.hex, this.owner, this.fileId), raw)
      if (localStorage.getItem(key(this.hex, this.owner, this.fileId)) !== raw) return false
      this.state = next
      const rows = this.read()
      for (const subscriber of this.subscribers) subscriber(rows)
      return true
    } catch { return false }
  }
  /** Normal Talk/card writes never infer deletion from a truncated UI list. */
  persist(rows: ChatConversation[]): boolean {
    if (!this.isTrusted() || rows.some(row => row.bookId !== userBookId(this.hex))) return false
    const edition = this.edition
    if (!edition) {
      if (rows.some(row => !originalTalk(row))) return false
      const conversations = [...this.state.conversations.filter(row => !originalTalk(row)), ...rows]
      if (conversations.reduce((sum, row) => sum + row.messages.length, 0) > LAB_CHAT_MAX_MESSAGES_PER_BOOK) return false
      return this.commit({ ...this.state, conversations })
    }
    if (editionSource(edition) === 'pdf' && rows.some(originalTalk)) return false
    const conversations = editionSource(edition) === 'pdf'
      ? [...this.state.conversations.filter(originalTalk), ...rows] : rows
    if (conversations.reduce((sum, row) => sum + row.messages.length, 0) > LAB_CHAT_MAX_MESSAGES_PER_BOOK) return false
    const cards = rows.filter(row => row.card), valid = cards.map(row => cardOf(row, this.hex, edition))
    const blocked = valid.some(item => !item)
    const items = blocked ? this.state.items : mergeOwnTextCards(this.state.items, valid as OwnTextCardDraft[])
    const next = { ...this.state, conversations, items, dirty: this.state.dirty || JSON.stringify(items) !== JSON.stringify(this.state.items), blocked }
    if (!this.commit(next)) return false
    if (next.dirty && !next.blocked) this.schedule()
    return true
  }
  saveCard(card: SharedReaderCard): ChatConversation[] | null {
    if (!this.edition || !this.isTrusted() || card.source.kind !== 'own-text' || card.source.ownHex !== this.hex || card.source.converter !== this.edition.converter) return null
    const item = ownTextCardDraft(card)
    if (!item || !this.edition.chapters.some(ch => ch.number === item.anchor.chapterNumber)) return null
    const rendered = conversationOf(item, this.hex)
    if (!rendered) return null
    const next = mergeChatConversations(this.read(), [rendered])
    return this.persist(next) ? next : null
  }
  /** Claim representable original-page cards in the same owner/file revision set; never invent a word anchor. */
  importPageCards(cards: EpubPageCard[]): boolean {
    if (!this.edition || !this.isTrusted() || editionSource(this.edition) !== 'epub') return false
    const known = new Set(this.state.items.map(item => item.id))
    const additions = cards.filter(card => !known.has(card.id))
    if (!additions.length) return true
    const next = { ...this.state, items: mergeOwnTextCards(this.state.items, additions), dirty: true }
    if (!this.commit(next)) return false
    this.schedule()
    return true
  }
  deleteCard(conversationId: string): (() => boolean) | null {
    if (!this.edition || !this.isTrusted()) return null
    const before = this.read(), prior = before.find(row => row.id === conversationId && row.card && !row.card.gone)
    if (!prior?.card) return null
    const gone: Gone = { id: prior.card.id, gone: true, u: Math.max(Date.now(), prior.card.u + 1) }
    const next = { ...this.state, conversations: before.filter(row => row.id !== conversationId),
      items: mergeOwnTextCards(this.state.items, [gone]), dirty: true }
    if (!this.commit(next)) return null
    this.schedule()
    return () => {
      if (!this.isTrusted()) return false
      const card = { ...prior.card!, u: Math.max(Date.now(), gone.u + 1) }
      const rows = mergeChatConversations(this.read(), [{ ...prior, card }])
      return this.persist(rows)
    }
  }
  private schedule() { if (this.timer) clearTimeout(this.timer); this.timer = setTimeout(() => { this.timer = null; void this.sync() }, 1500) }
  async open(): Promise<void> { if (this.edition) await this.sync() }
  async sync(): Promise<void> {
    if (!this.edition) return
    if (this.running) return this.running
    this.running = this.doSync().finally(() => {
      this.running = null
      if (this.isTrusted() && this.state.dirty && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
        if (this.timer) clearTimeout(this.timer)
        const delay = this.retryMs
        this.retryMs = Math.min(this.retryMs * 2, 30_000)
        this.timer = setTimeout(() => { this.timer = null; void this.sync() }, delay)
      } else if (!this.state.dirty) this.retryMs = 1500
    })
    return this.running
  }
  private async doSync(): Promise<void> {
    if (!this.edition || !this.isTrusted()) return
    const token = await this.token()
    if (!token || !this.isTrusted()) return
    const url = `/api/user-books/${editionSource(this.edition) === 'epub' ? 'cards' : 'text-cards'}/${this.hex}`
    const call = async (method: string, body?: object) => {
      const response = await this.fetchImpl(url, { method, credentials: 'same-origin', cache: 'no-store', headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
      return { status: response.status, data: await response.json().catch(() => ({})) as { cards?: OwnTextCardItem[]; rev?: number; fileId?: string; error?: string } }
    }
    try {
      const initial = await call('GET')
      if (initial.status !== 200 || !Array.isArray(initial.data.cards) || !Number.isInteger(initial.data.rev) || !this.isTrusted()) return
      if (this.fileId && initial.data.fileId !== this.fileId) { this.invalidateGeneration(); return }
      const merged = mergeOwnTextCards(this.state.items, initial.data.cards)
      const next = { ...this.state, rev: initial.data.rev!, items: merged,
        dirty: this.state.dirty || JSON.stringify(merged) !== JSON.stringify(initial.data.cards),
        conversations: project(merged, this.hex, this.edition, this.state.conversations) }
      if (!this.commit(next) || next.blocked) return
      for (let i = 0; i < 3 && this.state.dirty && this.isTrusted(); i++) {
        const sent = JSON.stringify(this.state.items)
        const response = await call('PUT', { cards: this.state.items, rev: this.state.rev, ...(this.fileId ? { expectedFileId: this.fileId } : {}) })
        if (!this.isTrusted()) return
        if (this.fileId && (response.data.error === 'generation_conflict'
          || (response.status === 200 || response.status === 409) && response.data.fileId !== this.fileId)) { this.invalidateGeneration(); return }
        if (response.status === 200 && Number.isInteger(response.data.rev)) {
          if (!this.commit({ ...this.state, rev: response.data.rev!, dirty: JSON.stringify(this.state.items) !== sent })) return
          continue
        }
        if (response.status !== 409 || !Array.isArray(response.data.cards) || !Number.isInteger(response.data.rev)) return
        const items = mergeOwnTextCards(this.state.items, response.data.cards)
        if (!this.commit({ ...this.state, rev: response.data.rev!, items,
          conversations: project(items, this.hex, this.edition, this.state.conversations), dirty: true })) return
      }
    } catch { /* offline: atomic local record remains */ }
  }
  private invalidateGeneration() {
    this.invalidGeneration = true
    for (const subscriber of this.subscribers) subscriber([])
  }
  dispose() { this.live = false; if (this.timer) clearTimeout(this.timer); this.subscribers.clear() }
}
