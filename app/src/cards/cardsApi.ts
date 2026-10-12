/**
 * The account cards' data, from the existing endpoints only (Anders,
 * 9 October 2026: no new privacy model, no new endpoints):
 *
 *   GET/POST /api/profile                 the reader's profile (socialClient.ts)
 *   GET  /api/reading-time                the ledger -> readingTimeStats (one source for every figure)
 *   GET  /lab/catalogue.json + positions  Reading now / Finished: the library's own list (preReader/readingNow.ts)
 *   GET  /api/social/rank                 "3rd of 5"
 *   GET  /api/social/board?tab=           the leaderboard (Friends | Everyone)
 *   GET  /api/social/find(?q=)            Following you, Also reading your books, search, invite link
 *   GET  /api/social/profile/{handle}     a reader's profile
 *   POST /api/social/follow|unfollow      Follow, Follow back, unfollow
 *   GET  /api/ai-allowance                AI credits (labAiAllowance.ts)
 *   GET  /api/subscription-info           the plan (labPremiumOffer.ts)
 *   POST /api/create-portal               Stripe's billing portal
 *   POST /api/account/delete              Delete account (worker/routes/accountDelete.ts)
 *
 * Every call resolves (never throws).
 */
import { LAB_CATALOGUE_URL } from '../../public/lab/library-model.js'
import { accountLabPositionRecord, type LabPositionState } from '../lab/labPosition'
import { fetchLabPositionCloud, readLabPositionLocal } from '../lab/labPositionStore'
import { fetchReadingTime, readPending, withPending } from '../lab/labReadingTime'
import { localDay, readingTimeStats, weekBooks, type ReadingTimeStats } from '../readingTime/model'
import { PRIVATE_BOOK_LABEL, isPrivateBucket } from '../readingTime/privateBook'
import type { CatalogueEntry } from '../readingTime/yourReading'
import { completedBookIdsIn } from '../preReader/libraryCompletion'
import { productionPlaces, withProductionPlaces } from '../preReader/productionPositions'
import { readingNowList } from '../preReader/readingNow'
import type { LibraryBookInfo } from '../preReader/libraryRecap'
import { readDeviceReadingMemory } from '../readingMemory/deviceStore'
import { readShelfMembership } from '../libraryTwoSaved'
import { apiUrl } from '../utils/apiUrl'

export { fetchOwnProfile, saveProfile, type OwnProfile } from '../social/socialClient'
export { blockedReaderId, fetchBoard, fetchFind, fetchProfile, fetchRank, searchReaders, socialAction, unblockReader, type BoardData, type BoardEntry, type FindRow } from '../social/friendsClient'
export type { ProfilePageData, ProfileBook, ProfilePicture } from '../social/profilePageView'

const POSITION_DEVICE_ID = 'lab-your-reading'

export interface ReadingBook {
  bookId: string
  title: string
  /** Reading now: how far through the book's chapters the place is (0..1); null when unknown. */
  fraction: number | null
}

/** Your reading: the ledger's figures, and the books exactly as the library lists them. */
/** One week of the chart: each book read that week and its time, most time first. */
export interface ReadingWeek {
  start: string
  books: Array<{ bookId: string; title: string; seconds: number }>
}

export interface ReadingLoad {
  stats: ReadingTimeStats
  readingNow: ReadingBook[]
  finished: ReadingBook[]
  /** The books behind each of stats.weeks (absent in a cache written before 12 Oct 2026). */
  weeks?: ReadingWeek[]
}

async function loadCatalogue(fetchImpl: typeof fetch): Promise<Map<string, CatalogueEntry>> {
  try {
    const response = await fetchImpl(LAB_CATALOGUE_URL)
    if (!response.ok) return new Map()
    const data = await response.json() as { books?: CatalogueEntry[] }
    return new Map((data.books ?? []).map(book => [book.id, book]))
  } catch {
    return new Map()
  }
}

async function loadPositions(token: string, userId: string | null): Promise<LabPositionState | null> {
  try {
    const local = readLabPositionLocal(POSITION_DEVICE_ID)
    const cloud = await fetchLabPositionCloud(token).catch(() => null)
    return accountLabPositionRecord(local, cloud, userId)
  } catch {
    return null
  }
}

/** Your reading: the ledger's figures, and the books as the library's shelves count them. Null without the ledger. */
export async function loadReading(token: string, userId: string | null, fetchImpl: typeof fetch = fetch): Promise<ReadingLoad | null> {
  const [summary, catalogue, positions] = await Promise.all([
    fetchReadingTime(token, fetchImpl),
    loadCatalogue(fetchImpl),
    loadPositions(token, userId),
  ])
  if (!summary) return null
  const rows = withPending(summary.rows, readPending(userId))
  const stats = readingTimeStats(rows, localDay())
  const local = (() => { try { return localStorage } catch { return null } })()
  const places = positions ? withProductionPlaces(positions, productionPlaces({ bookIds: catalogue.keys(), read: key => local?.getItem(key) ?? null })) : null
  const books = new Map<string, LibraryBookInfo>([...catalogue.values()].map(book => [book.id, {
    id: book.id,
    title: book.title,
    chapters: (book.readingStructure?.chapters ?? []).map(chapter => ({ number: chapter.number, title: chapter.title, paragraphCount: chapter.paragraphCount ?? 0 })),
  }]))
  // The library's one list (reading table, My shelf, the book switcher): the same
  // books, the same finished rule, the same removals and order.
  const list = readingNowList({
    memory: readDeviceReadingMemory(),
    viewer: userId,
    positions: places,
    books,
    completedBookIds: completedBookIdsIn(local),
    membership: (() => { try { return readShelfMembership(userId) } catch { return null } })(),
  })
  const title = (bookId: string) => catalogue.get(bookId)?.title ?? null
  const fraction = (bookId: string, chapterNumber: number) => {
    const chapters = books.get(bookId)?.chapters ?? []
    const index = chapters.findIndex(chapter => chapter.number === chapterNumber)
    return index >= 0 && chapters.length > 0 ? (index + 1) / chapters.length : null
  }
  // An own book is only ever "a private book"; a book the catalogue does not name is left out, as in Reading now.
  const weekTitle = (bookId: string) => isPrivateBucket(bookId) ? PRIVATE_BOOK_LABEL.replace(/^./, c => c.toUpperCase()) : title(bookId)
  const perWeek = weekBooks(rows, stats.weeks.map(week => week.start))
  return {
    stats,
    weeks: stats.weeks.map(week => ({
      start: week.start,
      books: (perWeek.get(week.start) ?? []).flatMap(book => { const name = weekTitle(book.bookId); return name ? [{ bookId: book.bookId, title: name, seconds: book.seconds }] : [] }),
    })),
    readingNow: list.readingNow.flatMap(row => { const name = title(row.bookId); return name ? [{ bookId: row.bookId, title: name, fraction: fraction(row.bookId, row.target.chapterNumber) }] : [] }),
    finished: list.finished.flatMap(row => { const name = title(row.bookId); return name ? [{ bookId: row.bookId, title: name, fraction: null }] : [] }),
  }
}

/** Stripe's billing portal (existing /api/create-portal). */
/** The phrase the Worker requires before it deletes an account (worker/routes/accountDelete.ts). */
export const ACCOUNT_DELETE_CONFIRM = 'delete-my-account'

/**
 * Delete the signed-in reader's own account and everything held for it.
 * True once the account is gone (the caller then signs out); false when it
 * still exists, so the reader can try again.
 */
export async function deleteOwnAccount(token: string, userId: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const res = await fetchImpl(apiUrl('/api/account/delete'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: ACCOUNT_DELETE_CONFIRM, userId }),
    })
    const data = await res.json().catch(() => ({})) as { deleted?: unknown }
    return res.ok && data.deleted === true
  } catch {
    return false
  }
}

export async function openBillingPortal(token: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  try {
    const res = await fetchImpl(apiUrl('/api/create-portal'), { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' })
    const data = await res.json().catch(() => ({})) as { url?: unknown }
    return res.ok && typeof data.url === 'string' && data.url.startsWith('https://') ? data.url : null
  } catch {
    return null
  }
}
