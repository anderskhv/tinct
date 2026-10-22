/**
 * The margin view's cards in the book's chat history (marginPreviewCards.ts): the device mirror
 * (`tinct:chat-history:{bookId}`) and, signed in, the versioned account row, through the book reader's own chat
 * writer (createLabChatCloudWriter: one commit at a time, a conflict merged). Each write rewrites the book's whole
 * row, so the account copy goes a moment after the last change (CARD_CLOUD_DEBOUNCE_MS) and at once on leaving;
 * the device copy at once. Cards from the account (another device) reach the frame on open and on return to the tab.
 */
import { useEffect, useMemo, useRef } from 'react'
import type { ChatConversation } from '../../types'
import {
  createLabChatCloudWriter,
  createLabChatHistoryCloud,
  mergeChatConversations,
  readLabBookChat,
  sameChatConversations,
  writeLabBookChat,
} from '../labChatHistory'
import { changedCardConversations, marginCards, type MarginCard, type MarginCardScope } from './marginPreviewCards'
import type { MarginPreviewBook } from './marginPreviewModel'

export const CARD_CLOUD_DEBOUNCE_MS = 4_000
export const previewCardsKey = (bookId: string) => `tinct-addbook:cards:preview:${bookId}`

export interface MarginCardsBridge {
  list(): MarginCard[]
  put(list: MarginCard[]): void
  /** The frame returns false when it keeps its own list for now (a change of its own on the way). */
  listen(cb: (list: MarginCard[]) => boolean | void): () => void
}

const loadedChapters = (model: MarginPreviewBook) => new Set(model.chapters.filter(c => !c.pending).map(c => c.number))
const sameSet = (a: Set<number>, b: Set<number>) => a.size === b.size && [...a].every(n => b.has(n))

/** Once: the preview's own cards (kept on this device before) join the book's chat history; the local key goes. */
export function migratePreviewCardsLocal(scope: MarginCardScope, storage: Storage = localStorage): number {
  let legacy: unknown = null
  try { legacy = JSON.parse(storage.getItem(previewCardsKey(scope.bookId)) || 'null') } catch { legacy = null }
  if (!Array.isArray(legacy)) return 0
  const current = readLabBookChat(scope.bookId)
  const add = changedCardConversations(current, legacy as MarginCard[], scope)
  if (add.length) writeLabBookChat(scope.bookId, mergeChatConversations(current, add))
  try { storage.removeItem(previewCardsKey(scope.bookId)) } catch { /* tried again next time */ }
  return add.length
}

export function useMarginPreviewCards(model: MarginPreviewBook, userId: string | null): MarginCardsBridge {
  const scope = useMemo<MarginCardScope>(() => ({ bookId: model.bookId, editionKey: model.editionKey, chapters: model.chapters }), [model])
  const bookId = model.bookId
  const migrated = useRef(false)
  if (!migrated.current) { migrated.current = true; migratePreviewCardsLocal(scope) }
  const listeners = useRef(new Set<(list: MarginCard[]) => boolean | void>())
  const writerRef = useRef<ReturnType<typeof createLabChatCloudWriter> | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shownRef = useRef('')
  // Chapters on demand (the Bible): the chapters loaded when the frame last took a list. Cards in chapters loaded
  // since are handed to it (once it has no change of its own waiting).
  const coveredRef = useRef<Set<number> | null>(model.lazy ? loadedChapters(model) : null)

  const tell = (conversations: ChatConversation[]) => {
    const list = marginCards(conversations, scope)
    const text = JSON.stringify(list)
    const loaded = coveredRef.current ? loadedChapters(model) : null
    const grown = !!loaded && !sameSet(loaded, coveredRef.current!)
    if (text === shownRef.current && !grown) return
    shownRef.current = text
    let taken = true
    for (const cb of listeners.current) if (cb(list) === false) taken = false
    if (loaded && taken) coveredRef.current = loaded
  }
  const tellRef = useRef(tell)
  tellRef.current = tell
  const flush = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    writerRef.current?.push(bookId, readLabBookChat(bookId))
  }
  const flushRef = useRef(flush)
  flushRef.current = flush

  useEffect(() => {
    const cloud = userId ? createLabChatHistoryCloud(userId) : null
    if (!cloud) { writerRef.current = null; return }
    const writer = createLabChatCloudWriter(cloud)
    writerRef.current = writer
    let live = true
    const run = () => { void writer.sync(bookId, undefined, () => live).then(merged => { if (live) tellRef.current(merged) }) }
    run()
    const onVisible = () => {
      if (document.visibilityState === 'visible') run()
      else if (timer.current) flushRef.current()
    }
    const onHide = () => { if (timer.current) flushRef.current() }
    window.addEventListener('online', run)
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      live = false
      if (timer.current) flushRef.current()
      if (writerRef.current === writer) writerRef.current = null
      window.removeEventListener('online', run)
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [bookId, userId])

  // Chapters loaded (the Bible): the cards in them go to the frame.
  useEffect(() => model.lazy?.subscribe(() => tellRef.current(readLabBookChat(bookId))), [bookId, model])

  // The book reader in another tab of this device.
  useEffect(() => {
    const key = `tinct:chat-history:${bookId}`
    const onStorage = (event: StorageEvent) => { if (event.key === key) tellRef.current(readLabBookChat(bookId)) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [bookId])

  return useMemo<MarginCardsBridge>(() => ({
    list() {
      const list = marginCards(readLabBookChat(bookId), scope)
      shownRef.current = JSON.stringify(list)
      if (coveredRef.current) coveredRef.current = loadedChapters(model)
      return list
    },
    put(list) {
      const current = readLabBookChat(bookId)
      const changed = changedCardConversations(current, list, scope)
      const covered = coveredRef.current
      if (covered && !sameSet(loadedChapters(model), covered)) queueMicrotask(() => tellRef.current(readLabBookChat(bookId)))
      if (!changed.length) return
      const next = mergeChatConversations(current, changed)
      if (sameChatConversations(current, next)) return
      writeLabBookChat(bookId, next)
      shownRef.current = JSON.stringify(marginCards(next, scope))
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => flushRef.current(), CARD_CLOUD_DEBOUNCE_MS)
    },
    listen(cb) {
      listeners.current.add(cb)
      return () => { listeners.current.delete(cb) }
    },
  }), [bookId, model, scope])
}
