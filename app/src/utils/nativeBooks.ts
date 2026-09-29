import downloadStyle from './nativeBooks.css?inline'
import { registerPlugin } from '@capacitor/core'
import { BOOKS } from '../data/bookRegistry'
import { PRE_READER_CATALOGUE, LAB_COVER_ART_BOOK_IDS, type PreReaderBookViewModel, type SerializablePreReaderCatalogue } from '../preReader/catalogue'
import type { Book } from '../types'
import { isNativeCapacitor } from './nativePlatform'

type Entry = { id: string; revision: string; bytes: number; book: Book; view: PreReaderBookViewModel }
type Snapshot = { schema: 1; books: Entry[]; catalogue: SerializablePreReaderCatalogue; ready: string[] }
interface NativeBooksPlugin {
  snapshot(): Promise<Snapshot>
  refresh(): Promise<Snapshot>
  download(input: { bookId: string }): Promise<Snapshot>
  cancel(): Promise<void>
  addListener(event: 'progress', handler: (value: { bookId: string; bytes: number; total: number }) => void): Promise<{ remove(): Promise<void> }>
}
const store = registerPlugin<NativeBooksPlugin>('NativeBooks')
let snapshot: Snapshot | null = null
let initialization: Promise<void> | null = null
let refresh: Promise<Snapshot> | null = null
const downloads = new Map<string, Promise<void>>()

export function applyNativeBookCatalogue(value: Snapshot): void {
  if (value.schema !== 1 || !Array.isArray(value.books) || !Array.isArray(value.catalogue?.books)) throw new Error('This library requires a newer app.')
  for (const entry of value.books) {
    if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(entry.id) || entry.book.id !== entry.id || entry.view.id !== entry.id
      || !Array.isArray(entry.book.editions) || entry.book.editions.some(edition => edition.language === 'da')) throw new Error('Unsupported library entry.')
  }
  const byId = PRE_READER_CATALOGUE.booksById as Map<string, PreReaderBookViewModel>
  for (const entry of value.books) {
    const existing = BOOKS.find(book => book.id === entry.id)
    if (existing) Object.assign(existing, entry.book)
    else BOOKS.push(entry.book)
    const oldView = byId.get(entry.id)
    if (oldView) Object.assign(oldView, entry.view)
    else { PRE_READER_CATALOGUE.books.push(entry.view); byId.set(entry.id, entry.view) }
    if (!LAB_COVER_ART_BOOK_IDS.includes(entry.id)) (LAB_COVER_ART_BOOK_IDS as string[]).push(entry.id)
  }
  PRE_READER_CATALOGUE.houses = value.catalogue.houses.map(house => ({
    ...house,
    shelves: house.shelves.map(shelf => ({ ...shelf, books: shelf.bookIds.flatMap(id => byId.get(id) ? [byId.get(id)!] : []) })),
  }))
  snapshot = value
}
export function initializeNativeBooks(): Promise<void> {
  if (!isNativeCapacitor()) return Promise.resolve()
  initialization ??= store.snapshot().then(applyNativeBookCatalogue).catch(error => { initialization = null; throw error })
  return initialization
}
export async function nativeLibraryCatalogue(): Promise<SerializablePreReaderCatalogue | null> {
  if (!isNativeCapacitor()) return null
  await initializeNativeBooks()
  if (navigator.onLine) {
    refresh ??= store.refresh().finally(() => { refresh = null })
    // Offline and slow networks must not hold the local library hostage.
    const newer = await Promise.race([refresh.catch(() => null), new Promise<null>(resolve => setTimeout(() => resolve(null), 1200))])
    if (newer) applyNativeBookCatalogue(newer)
  }
  return snapshot!.catalogue
}
export async function ensureNativeBook(bookId: string): Promise<void> {
  if (!isNativeCapacitor()) return
  await initializeNativeBooks()
  if (snapshot?.ready.includes(bookId)) return
  if (downloads.has(bookId)) return downloads.get(bookId)!
  const job = (async () => {
    let entry = snapshot!.books.find(book => book.id === bookId)
    if (!entry) { applyNativeBookCatalogue(await store.refresh()); entry = snapshot!.books.find(book => book.id === bookId) }
    if (!entry) throw new Error('This book is not available in this app yet.')
    if (!document.getElementById('native-book-download-style')) {
      const style = document.createElement('style'); style.id = 'native-book-download-style'; style.textContent = downloadStyle; document.head.append(style)
    }
    const panel = document.createElement('dialog')
    panel.className = 'native-book-download'
    const title = document.createElement('p'), detail = document.createElement('p'), progress = document.createElement('progress'), cancel = document.createElement('button')
    title.textContent = 'Downloading ' + entry.book.title
    detail.textContent = 'Available offline when finished · ' + Math.max(1, Math.ceil(entry.bytes / 1048576)) + ' MB'
    progress.max = entry.bytes; progress.value = 0; progress.setAttribute('aria-label', 'Download progress')
    cancel.type = 'button'; cancel.textContent = 'Cancel'
    const stop = () => { cancel.disabled = true; cancel.textContent = 'Cancelling…'; void store.cancel() }
    cancel.onclick = stop
    panel.addEventListener('cancel', event => { event.preventDefault(); stop() })
    panel.append(title, detail, progress, cancel); document.body.append(panel); panel.showModal()
    let listener: { remove(): Promise<void> } | undefined
    try {
      listener = await store.addListener('progress', value => {
        if (value.bookId === bookId) { progress.max = value.total; progress.value = value.bytes }
      })
      applyNativeBookCatalogue(await store.download({ bookId }))
    } finally { await listener?.remove(); panel.close(); panel.remove() }
  })()
  downloads.set(bookId, job)
  try { await job } finally { downloads.delete(bookId) }
}

if (typeof window !== 'undefined') {
  ;(window as Window & { __tinctNativeBooks?: unknown }).__tinctNativeBooks = { catalogue: nativeLibraryCatalogue, ensure: ensureNativeBook, initialize: initializeNativeBooks }
}
