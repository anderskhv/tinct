import { DurableObject } from 'cloudflare:workers'
import { emptyRecapQueue, preparedRecap, recapPreparationIdentity, recapQueueNext, updateRecapQueue, type RecapQueueState, type RecapQueueUpdate } from '../recapPreparation'
import type { LabRecapRequest, LabRecapResponse } from '../recapSummary'
import { handleLabRecap, type LabRecapEnv } from './routes/labRecap'

/** One account's optional recap work. No positions, tokens or annotations are written here. */
export class RecapPreparationCoordinator extends DurableObject<LabRecapEnv> {
  constructor(ctx: DurableObjectState, env: LabRecapEnv) {
    super(ctx, env)
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS recap_state (id INTEGER PRIMARY KEY, value TEXT NOT NULL)')
  }
  private read(): RecapQueueState {
    const rows = this.ctx.storage.sql.exec<{ value: string }>('SELECT value FROM recap_state WHERE id=1').toArray()
    return rows.length ? JSON.parse(rows[0].value) : emptyRecapQueue()
  }
  private save(state: RecapQueueState): void {
    this.ctx.storage.sql.exec('INSERT INTO recap_state VALUES (1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value', JSON.stringify(state))
  }
  private async schedule(): Promise<void> {
    const next = recapQueueNext(this.read(), Date.now())
    if (next) await this.ctx.storage.setAlarm(Math.max(Date.now()+1000,next.at))
    else await this.ctx.storage.deleteAlarm()
  }
  async update(update: RecapQueueUpdate): Promise<void> {
    this.save(updateRecapQueue(this.read(), update, Date.now()))
    await this.schedule()
  }
  lookup(request: LabRecapRequest): LabRecapResponse | null {
    return preparedRecap(this.read(), request, Date.now())
  }
  async alarm(): Promise<void> {
    const now = Date.now(), state = this.read(), next = recapQueueNext(state, now)
    if (!next || next.at > now) { await this.schedule(); return }
    const entry = state.entries[next.bookId], identity = recapPreparationIdentity(entry.request)
    const day = new Date(now).toISOString().slice(0,10)
    // Persist the bounded attempt before any external call, including across alarm retries.
    state.day = day; state.generated = (this.read().day === day ? state.generated : 0)+1
    state.entries[next.bookId] = { ...entry, attempts: entry.attempts+1, due: now+60_000 }
    this.save(state)
    let result: LabRecapResponse | null = null
    const pending: Promise<unknown>[] = []
    try {
      const response = await handleLabRecap(new Request('https://tinct.app/api/lab-recap', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(entry.request),
      }), this.env, { waitUntil: (promise: Promise<unknown>) => pending.push(promise) } as unknown as ExecutionContext, async () => true)
      if (response.ok) result = await response.json() as LabRecapResponse
      await Promise.allSettled(pending)
    } catch { /* Retry is bounded and never blocks reading. */ }
    const latest = this.read(), current = latest.entries[next.bookId]
    if (current && recapPreparationIdentity(current.request) === identity && result) {
      latest.entries[next.bookId] = { ...current, result }
      this.save(latest)
    }
    console.log(JSON.stringify({ event:'recap_preparation', outcome:result ? 'ready' : 'retry', attempt:entry.attempts+1 }))
    await this.schedule()
  }
}
