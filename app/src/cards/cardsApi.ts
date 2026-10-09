/**
 * The account cards' data, from the existing endpoints only (Anders,
 * 9 October 2026: no new privacy model, no new endpoints):
 *
 *   GET/POST /api/profile                 the reader's profile (socialClient.ts)
 *   GET  /api/reading-time                the ledger -> readingTimeStats (one source for every figure)
 *   GET  /lab/catalogue.json + positions  Reading now / Finished (yourReadingView)
 *   GET  /api/social/rank                 "3rd of 5"
 *   GET  /api/social/board?tab=           the leaderboard (Friends | Everyone)
 *   GET  /api/social/find(?q=)            Following you, Also reading your books, search, invite link
 *   GET  /api/social/profile/{handle}     a reader's profile
 *   POST /api/social/follow|unfollow      Follow, Follow back, unfollow
 *   GET  /api/ai-allowance                AI credits (labAiAllowance.ts)
 *   GET  /api/subscription-info           the plan (labPremiumOffer.ts)
 *   POST /api/create-portal               Stripe's billing portal
 *
 * Every call resolves (never throws).
 */
import { LAB_CATALOGUE_URL } from '../../public/lab/library-model.js'
import { accountLabPositionRecord, type LabPositionState } from '../lab/labPosition'
import { fetchLabPositionCloud, readLabPositionLocal } from '../lab/labPositionStore'
import { fetchReadingTime, readPending, withPending } from '../lab/labReadingTime'
import { localDay, readingTimeStats, type ReadingTimeStats } from '../readingTime/model'
import { yourReadingView, type CatalogueEntry, type YourReadingView } from '../readingTime/yourReading'
import { completedBookIdsIn } from '../preReader/libraryCompletion'
import { productionPlaces, withProductionPlaces } from '../preReader/productionPositions'
import { apiUrl } from '../utils/apiUrl'

export { fetchOwnProfile, saveProfile, type OwnProfile } from '../social/socialClient'
export { blockedReaderId, fetchBoard, fetchFind, fetchProfile, fetchRank, searchReaders, socialAction, unblockReader, type BoardData, type BoardEntry, type FindRow } from '../social/friendsClient'
export type { ProfilePageData, ProfileBook, ProfilePicture } from '../social/profilePageView'

const POSITION_DEVICE_ID = 'lab-your-reading'

export interface ReadingLoad { stats: ReadingTimeStats; view: YourReadingView }

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
  const stats = readingTimeStats(withPending(summary.rows, readPending(userId)), localDay())
  const local = (() => { try { return localStorage } catch { return null } })()
  const places = positions ? withProductionPlaces(positions, productionPlaces({ bookIds: catalogue.keys(), read: key => local?.getItem(key) ?? null })) : null
  const view = yourReadingView({ stats, positions: places, catalogue, completedBookIds: completedBookIdsIn(local) })
  return { stats, view }
}

/** Stripe's billing portal (existing /api/create-portal). */
export async function openBillingPortal(token: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  try {
    const res = await fetchImpl(apiUrl('/api/create-portal'), { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' })
    const data = await res.json().catch(() => ({})) as { url?: unknown }
    return res.ok && typeof data.url === 'string' && data.url.startsWith('https://') ? data.url : null
  } catch {
    return null
  }
}
