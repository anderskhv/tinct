import { RECAP_PREPARATION_ROUTE, type RecapCandidate, type RecapQueueUpdate } from '../../recapPreparation'
import { isValidUUID } from '../lib/security'
import { jsonResponse } from '../lib/responses'
import { parseRecapRequest } from './labRecap'
import type { RecapPreparationCoordinator } from '../recapPreparationCoordinator'
export interface RecapPreparationEnv { RECAP_PREPARATION?: DurableObjectNamespace<RecapPreparationCoordinator> }
type VerifyUser = (env: any, request: Request) => Promise<{ id: string } | null>
export async function handleRecapPreparation(request: Request, env: RecapPreparationEnv, verifyUser: VerifyUser): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error:'Method not allowed' },405,request)
  const user = await verifyUser(env,request)
  if (!user || !isValidUUID(user.id)) return jsonResponse({ error:'Unauthorized' },401,request)
  if (!env.RECAP_PREPARATION) return jsonResponse({ error:'Unavailable' },503,request)
  const raw = await request.text()
  if (raw.length > 40_000) return jsonResponse({ error:'Too large' },413,request)
  let body: any
  try { body=JSON.parse(raw) } catch { return jsonResponse({ error:'Invalid JSON' },400,request) }
  let update: RecapQueueUpdate
  if (body?.kind === 'presence') {
    const target = parseRecapRequest(body.request)
    if (!target || target.editionKey.endsWith('-da') || typeof body.clientId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(body.clientId)
      || !Number.isSafeInteger(body.sequence) || body.sequence < 0 || typeof body.active !== 'boolean') return jsonResponse({error:'Invalid presence'},400,request)
    update = { kind:'presence', clientId:body.clientId, sequence:body.sequence, active:body.active, request:{ ...target, previousChapterNumber:target.previousChapterNumber ?? undefined, bookTitle:target.bookTitle ?? undefined } }
  } else if (body?.kind === 'shelf' && Array.isArray(body.candidates) && body.candidates.length <= 100) {
    const candidates: RecapCandidate[] = []
    for (const candidate of body.candidates) {
      const target = parseRecapRequest(candidate?.request)
      if (!target || target.editionKey.endsWith('-da') || !Number.isFinite(candidate.lastActiveAt) || candidate.lastActiveAt < 0) return jsonResponse({error:'Invalid shelf'},400,request)
      candidates.push({ request:{ ...target, previousChapterNumber:target.previousChapterNumber ?? undefined, bookTitle:target.bookTitle ?? undefined }, lastActiveAt:candidate.lastActiveAt })
    }
    update = { kind:'shelf', candidates }
  } else return jsonResponse({ error:'Invalid preparation request' },400,request)
  const coordinator = env.RECAP_PREPARATION.getByName(user.id)
  await coordinator.update(update,user.id)
  const summaries = update.kind === 'shelf' ? (await Promise.all(update.candidates.map(async candidate => ({
    request:candidate.request, response:await coordinator.lookup(candidate.request),
  })))).filter(item => item.response) : []
  return jsonResponse({ ok:true, route:RECAP_PREPARATION_ROUTE, summaries },200,request)
}
