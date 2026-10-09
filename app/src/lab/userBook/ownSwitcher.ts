/**
 * The book switcher's rows for pages outside the Tinct reader (the PDF viewer
 * on /lab/addbook/, which loads this as part of /lab/library-add.js): the same
 * "Reading now" list the reader's LabBookSwitcher shows, from this device only.
 * Tinct's books come from the local position record and reading memory, with
 * titles and covers from /lab/catalogue.json; the reader's own books (EPUB and
 * PDF) from Add a book's IndexedDB (ownShelf.ts). Nothing is sent anywhere;
 * own-book ids never leave the device.
 */
import { readCachedSupabaseUser } from '../labLibraryBoot'
import { readLabPositionLocal } from '../labPositionStore'
import { accountLabPositionRecord } from '../labPosition'
import { LAB_READER_HANDOFF_KEY } from '../labReaderHandoff'
import { readDeviceReadingMemory } from '../../readingMemory'
import { continueHandoff } from '../../preReader/continueHandoff'
import { ownQuickBookRows, quickBookCompletedIds, quickBookPositions, quickBookRows, withOwnBookRows, type QuickBookCatalogueEntry, type QuickBookRow } from '../../preReader/quickBookSwitcher'
import { ownReadingNow, readOwnShelf } from './ownShelf'

export interface SwitcherRows { rows: QuickBookRow[]; error: string }

/** Reading now: Tinct's books and the reader's own, most recently read first. */
export async function switcherRows(fetchImpl: typeof fetch = fetch, storage: Storage = localStorage): Promise<SwitcherRows> {
  const viewer = readCachedSupabaseUser()?.id ?? null
  const ownRows = await readOwnShelf(viewer).then(books => ownQuickBookRows(ownReadingNow(books)), () => [] as QuickBookRow[])
  let tinctRows: QuickBookRow[] = []
  let error = ''
  try {
    const response = await fetchImpl('/lab/catalogue.json')
    if (!response.ok) throw new Error(String(response.status))
    const payload = await response.json() as { books?: QuickBookCatalogueEntry[] }
    if (!Array.isArray(payload.books)) throw new Error('Invalid catalogue')
    const local = accountLabPositionRecord(readLabPositionLocal(), null, viewer)
    tinctRows = quickBookRows({
      catalogue: payload.books,
      positions: quickBookPositions(local, payload.books, key => storage.getItem(key)),
      memory: readDeviceReadingMemory(),
      viewer,
      completedBookIds: quickBookCompletedIds(storage),
    })
  } catch {
    error = 'Showing your own books only.'
  }
  return { rows: withOwnBookRows(tinctRows, ownRows), error }
}

/**
 * Where a row opens: an own book at its own URL; a Tinct book in the reader,
 * at its saved place, through the same handoff the reader's switcher uses.
 * Returns the URL to go to, or null when the place cannot be handed over.
 */
export function switcherTarget(row: QuickBookRow, session: Pick<Storage, 'setItem'> = sessionStorage): string | null {
  if (row.href) return row.href
  const intent = continueHandoff(row.target)
  if (!intent) return null
  try { session.setItem(LAB_READER_HANDOFF_KEY, JSON.stringify(intent)) } catch { return null }
  return '/reader'
}
