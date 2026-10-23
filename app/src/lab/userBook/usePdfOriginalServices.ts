/** Owner-bound Original PDF page geometry, separate from PDF Tinct-text anchors. */
import { createElement, useEffect, useRef, useState } from 'react'
import type { HighlightColor } from '../../types'
import type { OwnCard, OwnMark, OwnMarkGone } from '../../worker/routes/userBooks'
import type { PdfOriginalReaderServices } from '../sharedReader/pdf/PdfOriginalReaderShell'
import type { PdfOriginalFollow, PdfOriginalSelection } from '../sharedReader/pdf/PdfOriginalSurface'
import { readAnthropicResponse } from '../labCompanion'
import { apiUrl } from '../../utils/apiUrl'
import { internalTrafficHeaders } from '../../utils/internalTraffic'
import { listAccountBooks, ownBookToken, type FetchLike } from './ownAccount'
import { loadOwnedPdfBytes, readOwnedBookFileId, userBookOwner } from './userBookStore'
import { openPdfOriginalBytes } from '../sharedReader/pdf/PdfOriginalSurface'
import { loadPdfEngine } from './pdfEdition'
import { useMarginListen, type MarginListenApi } from '../marginPreview/useMarginListen'
import { userBookId } from './userBookId'
import { PdfOriginalTalkCard, pdfTalkConversations } from './PdfOriginalTalkCard'
import { OwnTextCardsSync, unassignedOwnTextCardCount } from './ownTextCardsSync'

type Item = OwnMark | OwnCard | OwnMarkGone
type SetName = 'marks' | 'cards'
export type PdfOriginalUnitSource = { unit: { key: string; title: string; from: number; to: number }; pages: Array<{ n: number; text: string }>; atPage: number }
export type PdfOriginalUnitAction = 'primer' | 'catchup' | 'recap'
type SavedSet<T extends Item> = { items: T[]; rev: number; dirty: boolean }
const FILE_ID = /^[0-9a-f]{32}$/
const HEX = /^[0-9a-f]{24}$/
const key = (name: SetName, owner: string, fileId: string, hex: string) => `tinct-addbook:pdf-original-${name}:${owner}:${fileId}:${hex}`
const gone = (item: Item): item is OwnMarkGone => 'gone' in item
const updated = (item: Item) => gone(item) ? item.u : item.u ?? item.at
const merge = <T extends Item>(a: T[], b: T[]): T[] => {
  const byId = new Map<string, T>()
  for (const item of [...a, ...b]) {
    const prior = byId.get(item.id)
    if (!prior || updated(item) > updated(prior) || updated(item) === updated(prior) && gone(item)) byId.set(item.id, item)
  }
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id))
}
const fresh = <T extends Item>(): SavedSet<T> => ({ items: [], rev: 0, dirty: false })
const unitFields = (data: unknown, page: number): boolean => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  const d = data as Record<string, unknown>
  if (d.action === 'recap' && Object.keys(d).length === 1) return true // older page recap
  if (!['primer', 'catchup', 'recap', 'quiz', 'note'].includes(String(d.action))
    || Object.keys(d).some(field => !['action', 'unit', 'source'].includes(field))
    || !d.unit || typeof d.unit !== 'object' || Array.isArray(d.unit)
    || !d.source || typeof d.source !== 'object' || Array.isArray(d.source)) return false
  const u = d.unit as Record<string, unknown>, s = d.source as Record<string, unknown>
  const positive = (n: unknown): n is number => Number.isSafeInteger(n) && (n as number) > 0
  return Object.keys(u).every(field => ['key', 'title', 'from', 'to'].includes(field))
    && Object.keys(s).every(field => ['from', 'to'].includes(field))
    && typeof u.key === 'string' && !!u.key && u.key.length <= 120
    && typeof u.title === 'string' && !!u.title.trim() && u.title.length <= 300
    && positive(u.from) && positive(u.to) && u.to >= u.from && positive(s.from) && positive(s.to) && s.to >= s.from
    && page >= u.from && page <= u.to && (d.action === 'catchup' ? s.to < page : s.from >= u.from && s.to <= u.to)
}
const validUnitSource = (source: PdfOriginalUnitSource, action: PdfOriginalUnitAction): boolean => {
  const { unit, pages, atPage } = source
  if (!Array.isArray(pages) || !pages.length || pages.length > 20 || !Number.isInteger(atPage)
    || !pages.every((page, index) => Number.isInteger(page.n) && page.n === pages[0].n + index
      && typeof page.text === 'string' && page.text.length <= 6000)
    || !pages.some(page => page.text.trim()) || pages.reduce((sum, page) => sum + page.text.length, 0) > 36_000) return false
  return unitFields({ action, unit, source: { from: pages[0].n, to: pages[pages.length - 1].n } }, atPage)
}
const atMost = (value: unknown, limit: number): value is string => typeof value === 'string' && value.length <= limit
const validItem = (name: SetName, item: unknown): item is Item => {
  if (!item || typeof item !== 'object') return false
  const row = item as Record<string, unknown>
  if (typeof row.id !== 'string' || !/^[0-9a-z]{4,32}$/.test(row.id)) return false
  if (row.gone === true) return Object.keys(row).every(field => ['id', 'gone', 'u'].includes(field))
    && Number.isSafeInteger(row.u) && (row.u as number) > 0
  if (!Number.isSafeInteger(row.page) || (row.page as number) < 1 || !Number.isSafeInteger(row.at) || (row.at as number) < 1
    || row.u !== undefined && (!Number.isSafeInteger(row.u) || (row.u as number) < 1)
    || !atMost(row.text, 2000) || !Array.isArray(row.rects) || row.rects.length > 400
    || (!row.rects.length && !(name === 'cards' && row.pageOnly === true
      && row.kind === ((row.data as { action?: string } | undefined)?.action === 'quiz' ? 'quiz' : 'ask')
      && unitFields(row.data, row.page as number)))) return false
  if (!row.rects.every((rect: unknown) => Array.isArray(rect) && rect.length === (name === 'marks' ? 4 : 5)
    && rect.slice(name === 'marks' ? 0 : 1).every(n => typeof n === 'number' && Number.isFinite(n) && n >= -1 && n <= 2)
    && (name === 'marks' || Number.isSafeInteger(rect[0]) && rect[0] > 0)
    && rect.slice(name === 'marks' ? 0 : 1).every(n => Math.round(n * 10_000) / 10_000 === n))) return false
  return name === 'marks' ? Object.keys(row).every(field => ['id', 'page', 'rects', 'text', 'color', 'at', 'u', 'note', 'box', 'kind', 'withNote'].includes(field))
      && typeof row.color === 'string' && ['gold', 'rose', 'sage', 'sky', 'lavender'].includes(row.color)
      && (row.note === undefined || atMost(row.note, 4000) && row.note.length > 0)
      && (row.withNote === undefined || !!row.note)
      && (row.box === undefined || row.box === true)
      && (row.kind === undefined || ['figure', 'formula', 'snip'].includes(String(row.kind)))
      && (row.withNote === undefined || row.withNote === true)
    : typeof row.kind === 'string' && ['explain', 'simplify', 'ask', 'define', 'factcheck', 'counterpoint', 'quiz', 'related', 'figure'].includes(row.kind)
      && Object.keys(row).every(field => ['id', 'kind', 'page', 'pageOnly', 'rects', 'text', 'turns', 'data', 'at', 'u'].includes(field))
      && (row.pageOnly === undefined || row.pageOnly === true && row.rects.length === 0
        && row.kind === ((row.data as { action?: string } | undefined)?.action === 'quiz' ? 'quiz' : 'ask')
        && unitFields(row.data, row.page as number))
      && (row.rects.length !== 0 || row.pageOnly === true)
      && Array.isArray(row.turns) && row.turns.length <= 40 && row.turns.every((turn: unknown) => !!turn && typeof turn === 'object'
        && Object.keys(turn).every(field => ['role', 'content', 'at', 'display'].includes(field))
        && ['user', 'assistant'].includes((turn as { role?: string }).role || '')
        && atMost((turn as { content?: unknown }).content, 12_000)
        && ((turn as { at?: unknown }).at === undefined || Number.isSafeInteger((turn as { at?: unknown }).at) && (turn as { at: number }).at > 0)
        && ((turn as { display?: unknown }).display === undefined || atMost((turn as { display?: unknown }).display, 2000)))
      && (row.data === undefined || !!row.data && typeof row.data === 'object' && !Array.isArray(row.data) && JSON.stringify(row.data).length <= 16_000)
      && (!row.pageOnly || (row.data as { action?: string } | undefined)?.action !== 'quiz'
        || row.turns.length >= 2 && row.turns[0].role === 'assistant' && !!row.turns[0].content.trim()
          && row.turns[1].role === 'assistant' && !!row.turns[1].content.trim())
      && (!row.pageOnly || (row.data as { action?: string } | undefined)?.action !== 'note'
        || row.turns.some(turn => turn.role === 'user' && !!turn.content.trim()))
}
const parse = <T extends Item>(name: SetName, raw: string | null): SavedSet<T> | null => {
  if (!raw) return fresh<T>()
  try {
    const data = JSON.parse(raw) as SavedSet<T>
    return Array.isArray(data.items) && data.items.length <= (name === 'marks' ? 5000 : 2000)
      && JSON.stringify({ [name]: data.items, rev: data.rev, expectedFileId: '0'.repeat(32) }).length <= 2 * 1024 * 1024
      && data.items.every(item => validItem(name, item))
      && new Set(data.items.map(item => item.id)).size === data.items.length
      && Number.isInteger(data.rev) && data.rev >= 0 && typeof data.dirty === 'boolean' ? data : null
  } catch { return null }
}

/** One atomic owner/file-generation journal per set, including tombstones and the server revision. */
export class PdfOriginalGeometry implements PdfOriginalReaderServices {
  private talkComponent: NonNullable<PdfOriginalReaderServices['TalkCard']> = props => createElement(PdfOriginalTalkCard,
    { ...props, hex: this.hex, owner: this.owner, fileId: this.fileId, chat: this.chat!,
      title: this.bookMetadata.title, author: this.bookMetadata.author })
  get TalkCard(): PdfOriginalReaderServices['TalkCard'] { return this.trusted() && this.chat ? this.talkComponent : undefined }
  readonly chat: OwnTextCardsSync | null
  private marksSet: SavedSet<OwnMark | OwnMarkGone>
  private cardsSet: SavedSet<OwnCard | OwnMarkGone>
  private live = true
  private staleGeneration = false
  private listeners = new Set<() => void>()
  private timers: Partial<Record<SetName, ReturnType<typeof setTimeout>>> = {}
  private running: Partial<Record<SetName, Promise<void>>> = {}
  private retries: Record<SetName, number> = { marks: 0, cards: 0 }
  private pageTexts = new Map<number, string>()
  private lastUnitAnswer: { source: string; action: PdfOriginalUnitAction; answer: string } | null = null
  private lastUnitQuiz: { source: string; answer: string } | null = null
  private bookMetadata: { title: string; author: string } = { title: 'Your PDF', author: '' }
  private savedCardId: string | null = null
  private pages = 0
  private unsubscribePlayer: (() => void) | null = null
  private unsubscribeChat: (() => void) | null = null
  constructor(readonly hex: string, readonly owner: string, readonly fileId: string,
    private readonly token: () => Promise<string | null> = ownBookToken, private readonly fetchImpl: FetchLike = fetch,
    private readonly player?: Pick<MarginListenApi, 'attachOwn' | 'play' | 'snapshot'> & Partial<Pick<MarginListenApi, 'subscribe' | 'pause' | 'resume' | 'setSpeed'>>,
    metadata?: { title: string; author: string }) {
    // Native window.fetch needs Window as its receiver. Calling this.fetchImpl()
    // otherwise throws before any marks/cards or companion request is sent.
    this.fetchImpl = fetchImpl.bind(globalThis) as FetchLike
    this.setBookMetadata(metadata)
    if (!HEX.test(hex) || !FILE_ID.test(fileId) || userBookOwner() !== owner) throw new Error('PDF owner unavailable')
    const marks = parse<OwnMark | OwnMarkGone>('marks', localStorage.getItem(key('marks', owner, fileId, hex)))
    const cards = parse<OwnCard | OwnMarkGone>('cards', localStorage.getItem(key('cards', owner, fileId, hex)))
    if (!marks || !cards) throw new Error('Private PDF journal unreadable')
    this.marksSet = marks; this.cardsSet = cards
    try {
      this.chat = new OwnTextCardsSync(hex, owner, null, token, fetchImpl, fileId)
      this.unsubscribeChat = this.chat.subscribe(() => this.changed())
    } catch { this.chat = null /* A damaged Talk journal cannot hide healthy PDF geometry. */ }
    this.player?.attachOwn?.({
      chapters: () => Array.from({ length: this.pages }, (_, index) => ({ number: index + 1, title: `Original PDF page ${index + 1}` })),
      chapter: async page => {
        if (!this.trusted() || page < 1 || page > this.pages) return null
        const text = this.pageTexts.get(page) ?? await this.loadPageText(page)
        return this.trusted() && text ? { number: page, title: `Original PDF page ${page}`, paragraphs: [text] } : null
      },
    })
    if ('subscribe' in (this.player ?? {})) this.unsubscribePlayer = (this.player as MarginListenApi).subscribe(() => this.changed())
  }
  private async loadPageText(page: number): Promise<string> {
    const bytes = await loadOwnedPdfBytes(this.hex, this.owner)
    if (!bytes || !this.trusted()) return ''
    const engine = await loadPdfEngine()
    const pdf = await openPdfOriginalBytes(bytes, engine.pdfjs as unknown as Parameters<typeof openPdfOriginalBytes>[1])
    try {
      if (page > pdf.numPages) return ''
      const content = await (await pdf.getPage(page)).getTextContent()
      const text = content.items.map(item => item.str).join(' ').trim()
      this.pageTexts.set(page, text)
      return text
    } finally { await pdf.destroy() }
  }
  setPdfPageText = (page: number, text: string, pages: number) => {
    if (!this.trusted() || !Number.isInteger(page) || page < 1 || !Number.isInteger(pages) || pages < page) return
    this.pages = pages
    this.pageTexts.set(page, text)
  }
  getPageText = async (page: number): Promise<string> => {
    if (!this.trusted() || !Number.isInteger(page) || page < 1 || page > this.pages) return ''
    return this.pageTexts.get(page) ?? this.loadPageText(page)
  }
  askUnit = async (source: PdfOriginalUnitSource, action: PdfOriginalUnitAction, signal?: AbortSignal, onDelta?: (text: string) => void): Promise<string | null> => {
    this.lastUnitAnswer = null
    if (!this.trusted() || !validUnitSource(source, action)) return null
    const token = await this.token()
    if (!token || !await this.currentGeneration(token)) return null
    for (const page of source.pages) if (await this.getPageText(page.n) !== page.text || !this.trusted()) return null
    const context = { kind: 'pdf', bookTitle: this.bookMetadata.title, bookAuthor: this.bookMetadata.author, chapterLabel: source.unit.title,
      pageNumber: source.atPage, pages: source.pages, paragraphIndex: 0, lookups: false }
    const question = action === 'primer' ? `Prepare me to read ${source.unit.title}.`
      : action === 'catchup' ? `Catch me up before original PDF page ${source.atPage}.`
        : `Summarize ${source.unit.title}.`
    const companion = action === 'primer'
      ? { intent: 'chapter', context, chapter: { action: { kind: 'primer', unitKey: source.unit.key, unitTitle: source.unit.title } } }
      : { intent: 'ask', context }
    try {
      const response = await this.fetchImpl(apiUrl('/api/chat'), { method: 'POST', signal,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...internalTrafficHeaders() },
        body: JSON.stringify({ stream: true, messages: [{ role: 'user', content: question }], companion }) })
      if (!response.ok || !this.trusted()) return null
      const answer = await readAnthropicResponse(response, onDelta)
      if (!answer?.trim() || !this.trusted()) return null
      this.lastUnitAnswer = { source: JSON.stringify(source), action, answer }
      return answer
    } catch { return null }
  }
  saveUnitCard = (source: PdfOriginalUnitSource, action: PdfOriginalUnitAction, answer: string): boolean => {
    if (!this.trusted() || !validUnitSource(source, action) || this.lastUnitAnswer?.source !== JSON.stringify(source)
      || this.lastUnitAnswer.action !== action || this.lastUnitAnswer.answer !== answer) return false
    this.lastUnitAnswer = null
    const title = source.unit.title.trim()
    return this.saveCard({ page: source.atPage, text: title, rects: [] }, action, answer, {
      question: action === 'primer' ? `Prepare me to read ${title}.` : action === 'catchup' ? `Catch me up before page ${source.atPage}.` : `Summarize ${title}.`,
      data: { action, unit: source.unit, source: { from: source.pages[0].n, to: source.pages[source.pages.length - 1].n } },
    })
  }
  saveUnitCardWithId = (source: PdfOriginalUnitSource, action: PdfOriginalUnitAction, answer: string): string | null =>
    this.saveUnitCard(source, action, answer) ? this.savedCardId : null
  private verifiedUnitPages = async (source: PdfOriginalUnitSource): Promise<boolean> => {
    if (!this.trusted() || !validUnitSource(source, 'recap') || source.atPage !== source.unit.to
      || source.pages[0].n !== source.unit.from || source.pages[source.pages.length - 1].n !== source.unit.to) return false
    for (const page of source.pages) if (await this.getPageText(page.n) !== page.text || !this.trusted()) return false
    return true
  }
  askUnitQuiz = async (source: PdfOriginalUnitSource, signal?: AbortSignal, onDelta?: (text: string) => void): Promise<string | null> => {
    this.lastUnitQuiz = null
    if (!await this.verifiedUnitPages(source)) return null
    const token = await this.token()
    if (!token || !await this.currentGeneration(token) || signal?.aborted) return null
    try {
      const response = await this.fetchImpl(apiUrl('/api/chat'), { method: 'POST', signal,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...internalTrafficHeaders() },
        body: JSON.stringify({ stream: true, messages: [{ role: 'user', content: `Quiz me on ${source.unit.title}.` }],
          companion: { intent: 'quiz', context: { kind: 'pdf', bookTitle: this.bookMetadata.title, bookAuthor: this.bookMetadata.author, chapterLabel: source.unit.title,
            pageNumber: source.atPage, pages: source.pages, paragraphIndex: 0, lookups: false } } }) })
      if (!response.ok || !this.trusted()) return null
      const answer = await readAnthropicResponse(response, onDelta)
      if (!answer?.trim() || signal?.aborted || !this.trusted()) return null
      this.lastUnitQuiz = { source: JSON.stringify(source), answer }
      return answer
    } catch { return null }
  }
  askUnitQuizCheck = async (source: PdfOriginalUnitSource, quiz: { question: string; expected: string; why?: string; answer: string }): Promise<string | null> => {
    if (this.lastUnitQuiz?.source !== JSON.stringify(source) || !await this.verifiedUnitPages(source)) return null
    const token = await this.token()
    if (!token || !await this.currentGeneration(token)) return null
    try {
      const response = await this.fetchImpl(apiUrl('/api/chat'), { method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...internalTrafficHeaders() },
        body: JSON.stringify({ stream: true, messages: [{ role: 'user', content: 'Please mark my answer.' }],
          companion: { intent: 'quiz_check', context: { kind: 'pdf', bookTitle: this.bookMetadata.title, bookAuthor: this.bookMetadata.author, chapterLabel: source.unit.title,
            pageNumber: source.atPage, pages: source.pages, paragraphIndex: 0, lookups: false }, quiz } }) })
      if (!response.ok || !this.trusted()) return null
      return await readAnthropicResponse(response)
    } catch { return null }
  }
  saveUnitQuizCardWithId = (source: PdfOriginalUnitSource, summary: string, generatedQuiz: string): string | null => {
    if (!this.trusted() || !validUnitSource(source, 'recap') || source.atPage !== source.unit.to
      || source.pages[0].n !== source.unit.from || source.pages[source.pages.length - 1].n !== source.unit.to
      || this.lastUnitQuiz?.source !== JSON.stringify(source) || this.lastUnitQuiz.answer !== generatedQuiz
      || !summary.trim() || summary.length > 12_000 || generatedQuiz.length > 12_000) return null
    this.lastUnitQuiz = null
    return this.saveCardWithId({ page: source.atPage, text: source.unit.title.trim(), rects: [] }, 'quiz', summary, {
      turns: [{ role: 'assistant', content: generatedQuiz }, { role: 'assistant', content: summary }],
      data: { action: 'quiz', unit: source.unit, source: { from: source.pages[0].n, to: source.pages[source.pages.length - 1].n } },
    })
  }
  saveUnitNote = (source: { unit: PdfOriginalUnitSource['unit']; atPage: number; source: { from: number; to: number } }, note: string): string | null => {
    if (!this.trusted() || source.atPage !== source.unit.to || !unitFields({ action: 'note', unit: source.unit, source: source.source }, source.atPage)
      || !note.trim() || note.length > 4000) return null
    return this.saveCardWithId({ page: source.atPage, text: source.unit.title.trim(), rects: [] }, 'note', note, {
      turns: [{ role: 'user', content: note }], data: { action: 'note', unit: source.unit, source: source.source },
    })
  }
  get listen(): PdfOriginalReaderServices['listen'] {
    if (!this.trusted() || !this.player || this.player.snapshot().available === false) return undefined
    return (page, text) => {
      if (!this.trusted() || this.player?.snapshot().available === false || !text.trim()) return
      this.pageTexts.set(page, text)
      this.player?.play({ chapterNumber: page, paragraphIndex: 0, wordIndex: 0 })
    }
  }
  get audio(): PdfOriginalReaderServices['audio'] {
    if (!this.trusted() || !this.player) return undefined
    const snapshot = this.player.snapshot()
    return { speed: snapshot.speed, playing: snapshot.playing, available: snapshot.available === true,
      setSpeed: speed => { if (this.trusted() && Number.isFinite(speed) && speed >= .5 && speed <= 2) this.player?.setSpeed?.(speed) },
      pause: () => { if (this.trusted()) this.player?.pause?.() },
      resume: () => this.trusted() && this.player?.resume?.() === true }
  }
  get heardPage(): number | null {
    const snapshot = this.player?.snapshot()
    return this.trusted() && snapshot?.playing && Number.isInteger(snapshot.chapterNumber)
      && snapshot.chapterNumber! >= 1 && snapshot.chapterNumber! <= this.pages ? snapshot.chapterNumber : null
  }
  get follow(): PdfOriginalFollow | null {
    const page = this.heardPage, snapshot = this.player?.snapshot(), wordIndex = snapshot?.follow?.wordIndex
    const text = page !== null ? this.pageTexts.get(page) : null
    return page !== null && snapshot?.follow?.paragraphIndex === 0 && Number.isInteger(wordIndex) && wordIndex! >= 0 && text
      ? { page, wordIndex: wordIndex!, text } : null
  }
  private trusted() { return this.live && !this.staleGeneration && userBookOwner() === this.owner }
  setBookMetadata(metadata?: { title: string; author: string }) {
    this.bookMetadata = { title: typeof metadata?.title === 'string' && metadata.title.trim() ? metadata.title.trim().slice(0, 200) : 'Your PDF',
      author: typeof metadata?.author === 'string' ? metadata.author.trim().slice(0, 200) : '' }
  }
  get marks() { return this.trusted() ? this.marksSet.items.filter((m): m is OwnMark => !gone(m)) : [] }
  get cards() { return this.trusted() ? this.cardsSet.items.filter((c): c is OwnCard => !gone(c)).map(c => ({
    id: c.id, page: c.page, text: c.text, kind: typeof c.data?.action === 'string' ? c.data.action : c.kind,
    turns: c.turns.map(turn => ({ role: turn.role, content: turn.content })), at: c.at, data: c.data, rects: c.rects,
  })) : [] }
  get talkConversations() { return this.trusted() && this.chat ? pdfTalkConversations(this.chat.readAll()) : [] }
  get recoverableTalkCount() { return this.trusted() && this.chat ? unassignedOwnTextCardCount(this.hex, this.owner, this.fileId) : 0 }
  adoptRecoverableTalk = () => {
    if (!this.trusted() || !this.chat?.adoptUnassigned()) return false
    this.changed()
    return true
  }
  subscribe = (notify: () => void) => { this.listeners.add(notify); return () => { this.listeners.delete(notify) } }
  private changed() { for (const notify of this.listeners) notify() }
  private commit(name: SetName, state: SavedSet<Item>): boolean {
    if (!this.trusted()) return false
    try {
      const text = JSON.stringify(state), storageKey = key(name, this.owner, this.fileId, this.hex)
      localStorage.setItem(storageKey, text)
      if (localStorage.getItem(storageKey) !== text) return false
      if (name === 'marks') this.marksSet = state as SavedSet<OwnMark | OwnMarkGone>
      else this.cardsSet = state as SavedSet<OwnCard | OwnMarkGone>
      this.changed()
      return true
    } catch { return false }
  }
  private queue(name: SetName, delay = 1500) {
    if (this.timers[name]) clearTimeout(this.timers[name])
    this.timers[name] = setTimeout(() => { delete this.timers[name]; void this.sync(name) }, delay)
  }
  private putLocal<T extends Item>(name: SetName, item: T): boolean {
    const prior = name === 'marks' ? this.marksSet : this.cardsSet
    const next = { items: merge(prior.items as T[], [item]), rev: prior.rev, dirty: true }
    if (!parse(name, JSON.stringify(next)) || !this.commit(name, next)) return false
    this.queue(name)
    return true
  }
  saveHighlight = (selection: PdfOriginalSelection, color: HighlightColor) => this.saveMark(selection, color)
  saveNote = (selection: PdfOriginalSelection, note: string) => this.saveMark(selection, 'gold', note)
  private saveMark(selection: PdfOriginalSelection, color: HighlightColor, note?: string): boolean {
    const rects = selection.rects.filter(rect => rect[0] === selection.page && rect.slice(1).every(Number.isFinite) && rect[3] > 0 && rect[4] > 0)
      .map(([, x, y, w, h]) => [x, y, w, h].map(n => Math.round(n * 10_000) / 10_000))
    if (!rects.length || rects.length !== selection.rects.length || rects.length > 400
      || !selection.text.trim() || selection.text.length > 2000 || note && (!note.trim() || note.length > 4000)) return false
    const now = Date.now(), id = crypto.randomUUID().replace(/-/g, '').slice(0, 24)
    return this.putLocal('marks', { id, page: selection.page, rects, text: selection.text, color, at: now, u: now, ...(note ? { note } : {}) })
  }
  removeMark = (id: string): (() => void) | null => {
    const old = this.marks.find(item => item.id === id)
    if (!old) return null
    const time = Math.max(Date.now(), updated(old) + 1)
    if (!this.putLocal('marks', { id, gone: true, u: time })) return null
    return () => this.putLocal('marks', { ...old, u: Math.max(Date.now(), time + 1) })
  }
  saveCard: PdfOriginalReaderServices['saveCard'] = (selection, kind, answer, options) => {
    this.savedCardId = null
    const mapped = kind === 'recap' || kind === 'catchup' || kind === 'primer' || kind === 'note' ? 'ask' : kind
    if (!['explain', 'simplify', 'ask', 'define', 'factcheck', 'counterpoint', 'quiz', 'related', 'figure'].includes(mapped)
      || !answer.trim() || !Number.isInteger(selection.page) || selection.page < 1) return false
    const rects = selection.rects.filter(rect => rect[0] === selection.page && rect.slice(1).every(Number.isFinite))
      .map(([page, ...box]) => [page, ...box.map(n => Math.round(n * 10_000) / 10_000)])
    const pageOnly = ['primer', 'catchup', 'recap', 'quiz', 'note'].includes(kind) && selection.rects.length === 0
    const time = Date.now(), id = crypto.randomUUID().replace(/-/g, '').slice(0, 24)
    const turns = options?.turns?.length ? options.turns : [
      { role: 'user' as const, content: options?.question || selection.text || `Original PDF page ${selection.page}` },
      { role: 'assistant' as const, content: answer },
    ]
    const data = { ...(options?.data ?? {}), ...(mapped !== kind ? { action: kind } : {}) }
    if ((!rects.length && !pageOnly) || rects.length !== selection.rects.length || rects.length > 400
      || selection.text.length > 2000 || turns.length > 40 || turns.some(turn => turn.content.length > 12_000)
      || JSON.stringify(data).length > 16_000) return false
    const saved = this.putLocal('cards', { id, kind: mapped as OwnCard['kind'], page: selection.page,
      rects, text: selection.text, turns,
      at: time, u: time, ...(pageOnly ? { pageOnly: true } : {}), ...(Object.keys(data).length ? { data } : {}) })
    if (saved) this.savedCardId = id
    return saved
  }
  saveCardWithId: NonNullable<PdfOriginalReaderServices['saveCardWithId']> = (selection, kind, answer, options) =>
    this.saveCard(selection, kind, answer, options) ? this.savedCardId : null
  appendCardTurn = (id: string, question: string, answer: string): boolean => {
    const prior = this.cardsSet.items.find((item): item is OwnCard => !gone(item) && item.id === id)
    if (!this.trusted() || !prior || !question.trim() || question.length > 12_000 || !answer.trim() || answer.length > 12_000
      || prior.turns.length > 38) return false
    const time = Math.max(Date.now(), updated(prior) + 1)
    return this.putLocal('cards', { ...prior, turns: [...prior.turns, { role: 'user', content: question, at: time },
      { role: 'assistant', content: answer, at: time + 1 }], u: time + 1 })
  }
  askCardFollow = async (id: string, question: string, signal?: AbortSignal, onDelta?: (text: string) => void): Promise<string | null> => {
    const card = this.cardsSet.items.find((item): item is OwnCard => !gone(item) && item.id === id)
    if (!this.trusted() || !card || !question.trim() || question.length > 4000) return null
    const token = await this.token()
    if (!token || !await this.currentGeneration(token) || signal?.aborted) return null
    const raw = await this.getPageText(card.page)
    if (!raw.trim() || raw.length > 6000 || !this.trusted()) return null
    const pages = [{ n: card.page, text: raw }]
    const prior = card.turns.slice(-8).map(turn => ({ role: turn.role, content: turn.content.slice(0, 4000) }))
    try {
      const response = await this.fetchImpl(apiUrl('/api/chat'), { method: 'POST', signal,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...internalTrafficHeaders() },
        body: JSON.stringify({ stream: true, messages: [...prior, { role: 'user', content: question }],
          companion: { intent: 'ask', context: { kind: 'pdf', bookTitle: this.bookMetadata.title, bookAuthor: this.bookMetadata.author,
            chapterLabel: `Original PDF page ${card.page}`, pageNumber: card.page, pages, paragraphIndex: 0, lookups: false },
            selection: card.pageOnly ? undefined : card.text.slice(0, 4000) } }) })
      if (!response.ok || !this.trusted()) return null
      const answer = await readAnthropicResponse(response, onDelta)
      return !signal?.aborted && this.trusted() ? answer : null
    } catch { return null }
  }
  removeCard = (id: string): (() => void) | null => {
    const old = this.cardsSet.items.find((item): item is OwnCard => !gone(item) && item.id === id)
    if (!old || !this.trusted()) return null
    const time = Math.max(Date.now(), updated(old) + 1)
    if (!this.putLocal('cards', { id, gone: true, u: time })) return null
    return () => this.putLocal('cards', { ...old, u: Math.max(Date.now(), time + 1) })
  }
  private async currentGeneration(token: string): Promise<boolean> {
    const books = await listAccountBooks(token, this.fetchImpl)
    if (!books || !this.trusted()) return false
    if (books.some(book => book.type === 'pdf' && book.id === this.fileId && book.sha256.slice(0, 24) === this.hex)) return true
    this.staleGeneration = true
    this.changed()
    return false
  }
  async open() { await Promise.all([this.sync('marks'), this.sync('cards')]) }
  async sync(name: SetName): Promise<void> {
    if (this.running[name]) return this.running[name]
    const task = this.doSync(name).finally(() => {
      if (this.running[name] === task) delete this.running[name]
      const current = name === 'marks' ? this.marksSet : this.cardsSet
      if (current.dirty && this.trusted() && !this.timers[name]) {
        // A timer may have fired during the in-flight request. Keep the offline
        // journal pending with bounded backoff until reconnect or this owner leaves.
        this.retries[name] = Math.min(this.retries[name] + 1, 5)
        this.queue(name, Math.min(30_000, 1500 * 2 ** (this.retries[name] - 1)))
      } else if (!current.dirty) this.retries[name] = 0
    })
    this.running[name] = task
    return task
  }
  private async doSync(name: SetName): Promise<void> {
    if (!this.trusted()) return
    const token = await this.token()
    if (!token || !await this.currentGeneration(token)) return
    const route = `/api/user-books/${name}/${this.hex}`
    const call = async (method: string, body?: object) => {
      const response = await this.fetchImpl(route, { method, cache: 'no-store', credentials: 'same-origin',
        headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
      return { status: response.status, data: await response.json().catch(() => ({})) as { rev?: number; fileId?: string; error?: string; marks?: OwnMark[]; cards?: OwnCard[] } }
    }
    try {
      const incoming = await call('GET')
      if (incoming.status === 404 && this.trusted()) { this.staleGeneration = true; this.changed(); return }
      if (incoming.status === 409 && incoming.data.error === 'generation_conflict' || incoming.status === 200 && incoming.data.fileId && incoming.data.fileId !== this.fileId) {
        this.staleGeneration = true; this.changed(); return
      }
      if (incoming.status !== 200 || incoming.data.fileId !== this.fileId || !Number.isInteger(incoming.data.rev) || !Array.isArray(incoming.data[name]) || !this.trusted()) return
      let current = name === 'marks' ? this.marksSet : this.cardsSet
      const remote = incoming.data[name] as Item[]
      const combined = merge(current.items, remote)
      if (!this.commit(name, { items: combined, rev: incoming.data.rev!, dirty: current.dirty || JSON.stringify(combined) !== JSON.stringify(remote) })) return
      for (let attempt = 0; attempt < 3; attempt++) {
        current = name === 'marks' ? this.marksSet : this.cardsSet
        if (!current.dirty || !this.trusted() || !await this.currentGeneration(token)) return
        const sent = JSON.stringify(current.items)
        const result = await call('PUT', { [name]: current.items, rev: current.rev, expectedFileId: this.fileId })
        if (!this.trusted()) return
        if (result.data.error === 'generation_conflict' || result.data.fileId && result.data.fileId !== this.fileId) {
          this.staleGeneration = true; this.changed(); return
        }
        if (result.status === 404) { this.staleGeneration = true; this.changed(); return }
        if (result.data.fileId !== this.fileId) return
        if (result.status === 200 && Number.isInteger(result.data.rev)) {
          // A note made while PUT was awaiting must not be overwritten by its older snapshot.
          const latest = name === 'marks' ? this.marksSet : this.cardsSet
          if (!this.commit(name, { ...latest, rev: result.data.rev!, dirty: JSON.stringify(latest.items) !== sent })) return
          if ((name === 'marks' ? this.marksSet : this.cardsSet).dirty) this.queue(name)
        } else if (result.status === 409 && Number.isInteger(result.data.rev) && Array.isArray(result.data[name])) {
          const latest = name === 'marks' ? this.marksSet : this.cardsSet
          if (!this.commit(name, { items: merge(latest.items, result.data[name] as Item[]), rev: result.data.rev!, dirty: true })) return
        } else return
      }
    } catch { /* offline: one owner/file-generation journal remains dirty */ }
  }
  ask: PdfOriginalReaderServices['ask'] = async (selection, intent, question, signal, onDelta) => {
    if (!this.trusted() || !selection.text.trim()) return null
    const token = await this.token()
    if (!token || !await this.currentGeneration(token)) return null
    const action = intent === 'recap' || intent === 'catchup' ? 'ask' : intent
    if (!['ask', 'explain', 'define', 'simplify', 'factcheck', 'counterpoint', 'quiz', 'related'].includes(action)) return null
    const text = selection.text.slice(0, 9000)
    const request = {
      stream: true,
      messages: [{ role: 'user', content: question || (intent === 'recap' ? `Summarize original PDF page ${selection.page}.` : intent === 'catchup' ? `Catch me up through original PDF page ${selection.page}.` : 'Please answer.') }],
      companion: { intent: action, context: { kind: 'pdf', bookTitle: this.bookMetadata.title, bookAuthor: this.bookMetadata.author, chapterLabel: `Original PDF page ${selection.page}`,
        pageNumber: selection.page, pages: [{ n: selection.page, text }], paragraphIndex: 0, lookups: false },
        selection: text },
    }
    try {
      const response = await this.fetchImpl(apiUrl('/api/chat'), { method: 'POST', signal, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...internalTrafficHeaders() }, body: JSON.stringify(request) })
      if (!response.ok || !this.trusted()) return null
      const answer = await readAnthropicResponse(response, onDelta)
      return this.trusted() ? answer : null
    } catch { return null }
  }
  askQuizCheck: NonNullable<PdfOriginalReaderServices['askQuizCheck']> = async (selection, quiz) => {
    if (!this.trusted() || !selection.text.trim()) return null
    const token = await this.token()
    if (!token || !await this.currentGeneration(token)) return null
    try {
      const response = await this.fetchImpl(apiUrl('/api/chat'), { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...internalTrafficHeaders() },
        body: JSON.stringify({ stream: true, messages: [{ role: 'user', content: 'Please mark my answer.' }], companion: {
          intent: 'quiz_check', context: { kind: 'pdf', bookTitle: this.bookMetadata.title, bookAuthor: this.bookMetadata.author, chapterLabel: `Original PDF page ${selection.page}`, pageNumber: selection.page,
            pages: [{ n: selection.page, text: selection.text.slice(0, 9000) }], paragraphIndex: 0, lookups: false }, selection: selection.text.slice(0, 4000), quiz,
        } }),
      })
      if (!response.ok || !this.trusted()) return null
      const answer = await readAnthropicResponse(response)
      return this.trusted() ? answer : null
    } catch { return null }
  }
  dispose() { this.live = false; this.unsubscribePlayer?.(); this.unsubscribeChat?.(); this.chat?.dispose(); for (const timer of Object.values(this.timers)) clearTimeout(timer); this.listeners.clear() }
}

/** The shell only sees a service after its local file ID or account copy proves the generation. */
export function usePdfOriginalServices(hex: string, owner: string | null, enabled: boolean,
  metadata?: { title: string; author: string }): PdfOriginalReaderServices | null {
  const [service, setService] = useState<PdfOriginalGeometry | null>(null)
  const metadataRef = useRef(metadata)
  metadataRef.current = metadata
  const player = useMarginListen({ bookId: userBookId(hex), editionKey: enabled ? 'own' : null, own: enabled ? { hex } : null })
  useEffect(() => { service?.setBookMetadata(metadata) }, [service, metadata?.title, metadata?.author])
  useEffect(() => {
    if (!enabled || !owner || !HEX.test(hex) || userBookOwner() !== owner) { setService(null); return }
    let live = true, active: PdfOriginalGeometry | null = null
    void (async () => {
      const localId = await readOwnedBookFileId(hex, owner)
      const token = await ownBookToken()
      const account = token ? await listAccountBooks(token) : null
      if (!live || userBookOwner() !== owner) return
      const file = account?.find(item => item.type === 'pdf' && item.sha256.slice(0, 24) === hex)
      // A successful account listing is authoritative: it may reveal delete/reupload.
      const fileId = account ? file?.id : localId
      if (!fileId || !FILE_ID.test(fileId)) return
      active = new PdfOriginalGeometry(hex, owner, fileId, ownBookToken, fetch, player, metadataRef.current)
      setService(active)
      void active.open()
    })().catch(() => { if (live) setService(null) })
    return () => { live = false; active?.dispose(); setService(null) }
    // The player's command interface is stable through re-renders; reopening it would reset narration.
  }, [hex, owner, enabled])
  return enabled && service?.hex === hex && service.owner === owner ? service : null
}
