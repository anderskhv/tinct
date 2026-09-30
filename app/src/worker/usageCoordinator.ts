import { DurableObject } from 'cloudflare:workers'

/**
 * Atomic request windows and spend reservations. One object per rate-limit
 * key (`rl:<key>`) or per spend budget (`spend:<name>:<month>`). Every method
 * is a short synchronous SQL transaction with no await between read and
 * write, so concurrent requests to the same object cannot both pass a limit.
 */
export class UsageCoordinator extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env)
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS request_window (id INTEGER PRIMARY KEY, reset_at INTEGER NOT NULL, count INTEGER NOT NULL)')
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS spend (day TEXT PRIMARY KEY, units INTEGER NOT NULL)')
  }

  /** Count one request in a fixed window. `false` = over the limit (nothing counted). */
  async hit(limit: number, windowMs: number): Promise<boolean> {
    if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1000) return false
    const now = Date.now()
    const outcome = this.ctx.storage.transactionSync(() => {
      const row = this.ctx.storage.sql.exec<{ reset_at: number; count: number }>('SELECT reset_at, count FROM request_window WHERE id=1').toArray()[0]
      if (!row || now >= row.reset_at) {
        this.ctx.storage.sql.exec('INSERT INTO request_window VALUES (1, ?, 1) ON CONFLICT(id) DO UPDATE SET reset_at=excluded.reset_at, count=1', now + windowMs)
        return { allowed: true, resetAt: now + windowMs }
      }
      if (row.count >= limit) return { allowed: false, resetAt: row.reset_at }
      this.ctx.storage.sql.exec('UPDATE request_window SET count=count+1 WHERE id=1')
      return { allowed: true, resetAt: row.reset_at }
    })
    // Idle windows are cleared so per-caller objects do not keep storage.
    if (await this.ctx.storage.getAlarm() === null) await this.ctx.storage.setAlarm(outcome.resetAt + windowMs)
    return outcome.allowed
  }

  /** Reserve `units` against a daily limit. `false` = the reservation would exceed it. */
  reserve(day: string, units: number, dailyLimit: number): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isSafeInteger(units) || units <= 0 || !Number.isSafeInteger(dailyLimit)) return false
    return this.ctx.storage.transactionSync(() => {
      const used = this.ctx.storage.sql.exec<{ units: number }>('SELECT units FROM spend WHERE day=?', day).toArray()[0]?.units ?? 0
      if (used + units > dailyLimit) return false
      this.ctx.storage.sql.exec('INSERT INTO spend VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET units=units+excluded.units', day, units)
      return true
    })
  }

  usage(): { day: string; units: number }[] {
    return this.ctx.storage.sql.exec<{ day: string; units: number }>('SELECT day, units FROM spend ORDER BY day').toArray()
  }

  async alarm(): Promise<void> {
    const row = this.ctx.storage.sql.exec<{ reset_at: number }>('SELECT reset_at FROM request_window WHERE id=1').toArray()[0]
    const hasSpend = this.ctx.storage.sql.exec<{ n: number }>('SELECT COUNT(*) AS n FROM spend').one().n > 0
    if (row && Date.now() < row.reset_at) {
      await this.ctx.storage.setAlarm(row.reset_at)
      return
    }
    if (!hasSpend) await this.ctx.storage.deleteAll()
    else this.ctx.storage.sql.exec('DELETE FROM request_window')
  }
}
