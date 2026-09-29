import { readSupabaseAccessToken } from '../lab/labAuth'
import { RECAP_PREPARATION_ROUTE, type RecapCandidate, type RecapQueueUpdate } from '../recapPreparation'
import { recapCacheKey, type LabRecapRequest, type LabRecapResponse } from '../recapSummary'
import { storeRecapSummary } from './recapSummaryClient'
import { apiUrl } from '../utils/apiUrl'
export async function sendRecapPreparation(update: RecapQueueUpdate, token: string, keepalive = false): Promise<void> {
  const response = await fetch(apiUrl(RECAP_PREPARATION_ROUTE), { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token }, body:JSON.stringify(update), keepalive })
  if (!response.ok || update.kind !== 'shelf') return
  if (await readSupabaseAccessToken() !== token) return
  const payload = await response.json() as { summaries?: Array<{ request:LabRecapRequest; response:LabRecapResponse }> }
  for (const item of payload.summaries ?? []) {
    if (!item.response?.summary || !item.response.coverage) continue
    const target = item.request
    const key = recapCacheKey({ bookId:target.bookId, editionKey:target.editionKey,
      chapterNumber:target.chapterNumber, paragraphIndex:target.paragraphIndex,
      completed:target.completed === true, paragraphCount:item.response.coverage.paragraphCount,
      previousChapterNumber:target.previousChapterNumber ?? null })
    try { storeRecapSummary(localStorage,key,item.response.summary,Date.now()) } catch { /* Optional device cache. */ }
  }
}
export function prepareShelfRecaps(candidates: RecapCandidate[], token: string): Promise<void> {
  return sendRecapPreparation({ kind:'shelf', candidates:candidates.slice(0,100) }, token)
}
