import { RECAP_PROMPT_VERSION, type LabRecapRequest, type LabRecapResponse } from './recapSummary'

export const RECAP_PREPARATION_ROUTE = '/api/recap-preparation'
export const RECAP_PREPARATION_DELAY_MS = 5 * 60 * 1000
export const RECAP_PRESENCE_LEASE_MS = 90_000
export interface RecapCandidate { request: LabRecapRequest; lastActiveAt: number }
export interface RecapQueueEntry extends RecapCandidate { due: number; attempts: number; result?: LabRecapResponse }
export interface RecapQueueState {
  entries: Record<string, RecapQueueEntry>
  clients: Record<string, { sequence: number; bookId: string | null; until: number }>
  day: string
  generated: number
}
export type RecapQueueUpdate =
  | { kind: 'presence'; clientId: string; sequence: number; active: boolean; request: LabRecapRequest }
  | { kind: 'shelf'; candidates: RecapCandidate[] }
export function emptyRecapQueue(): RecapQueueState { return { entries: {}, clients: {}, day: '', generated: 0 } }
export function recapPreparationIdentity(request: LabRecapRequest): string {
  return JSON.stringify([RECAP_PROMPT_VERSION, request.bookId, request.editionKey, request.chapterNumber, request.paragraphIndex, request.completed === true, request.previousChapterNumber ?? null])
}
export function updateRecapQueue(state: RecapQueueState, update: RecapQueueUpdate, now: number): RecapQueueState {
  const entries = { ...state.entries }, clients = { ...state.clients }
  const offer = (candidate: RecapCandidate, touched: boolean) => {
    const old = entries[candidate.request.bookId]
    const at = Math.min(now, Math.max(0, candidate.lastActiveAt))
    // A slow library snapshot cannot replace a newer reader observation.
    if (old && at < old.lastActiveAt) return
    const same = old && recapPreparationIdentity(old.request) === recapPreparationIdentity(candidate.request)
    entries[candidate.request.bookId] = { request: candidate.request, lastActiveAt: at,
      due: at + RECAP_PREPARATION_DELAY_MS, attempts: same && !touched ? old.attempts : 0,
      ...(same && old.result ? { result: old.result } : {}) }
  }
  if (update.kind === 'presence') {
    const previous = clients[update.clientId]
    if (previous && previous.sequence >= update.sequence) return state
    if (previous?.bookId && previous.bookId !== update.request.bookId && entries[previous.bookId]) {
      entries[previous.bookId] = { ...entries[previous.bookId], lastActiveAt: now, due: now + RECAP_PREPARATION_DELAY_MS }
    }
    offer({ request: update.request, lastActiveAt: now }, update.active)
    clients[update.clientId] = { sequence: update.sequence, bookId: update.active ? update.request.bookId : null, until: now + RECAP_PRESENCE_LEASE_MS }
  } else {
    const ids = new Set(update.candidates.map(candidate => candidate.request.bookId))
    for (const [id, entry] of Object.entries(entries)) {
      const live = Object.values(clients).some(client => client.bookId === id && client.until > now)
      // Removing a shelf item removes only optional preparation, never reading data.
      if (!ids.has(id) && !live && entry.lastActiveAt < now - RECAP_PREPARATION_DELAY_MS) delete entries[id]
    }
    update.candidates.forEach(candidate => offer(candidate, false))
  }
  const keptClients = Object.fromEntries(Object.entries(clients).sort((a,b) => b[1].until-a[1].until).slice(0,20))
  const keptEntries = Object.fromEntries(Object.entries(entries).sort((a,b) => b[1].lastActiveAt-a[1].lastActiveAt).slice(0,100))
  return { ...state, entries: keptEntries, clients: keptClients }
}
export function recapQueueNext(state: RecapQueueState, now: number): { bookId: string; at: number } | null {
  const day = new Date(now).toISOString().slice(0,10)
  if (state.day === day && state.generated >= 60) return null
  const pending = Object.entries(state.entries).filter(([,entry]) => !entry.result && entry.attempts < 3).map(([bookId,entry]) => {
    const lease = Math.max(0, ...Object.values(state.clients).filter(client => client.bookId === bookId).map(client => client.until))
    return { bookId, at: Math.max(entry.due, lease) }
  }).sort((a,b) => a.at-b.at)
  return pending[0] ?? null
}
export function preparedRecap(state: RecapQueueState, request: LabRecapRequest, now: number): LabRecapResponse | null {
  if (Object.values(state.clients).some(client => client.bookId === request.bookId && client.until > now)) return null
  const entry = state.entries[request.bookId]
  return entry?.result && recapPreparationIdentity(entry.request) === recapPreparationIdentity(request) ? entry.result : null
}
