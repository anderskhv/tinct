import { DurableObject } from 'cloudflare:workers'

/** One object per content identity, or per billing month. Only short atomic
 * SQL operations run here; provider I/O stays outside the coordinator.
 */
export class NarrationCoordinator extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env)
    this.createTables()
  }
  private createTables(): void {
    this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS lease (id INTEGER PRIMARY KEY, token TEXT, expires INTEGER)')
    this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS spend (day TEXT PRIMARY KEY, bytes INTEGER NOT NULL)')
  }
  claim(token: string): boolean {
    const now = Date.now()
    this.ctx.storage.sql.exec('INSERT INTO lease VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET token=excluded.token, expires=excluded.expires WHERE lease.expires <= ?', token, now + 120000, now)
    return this.ctx.storage.sql.exec<{ token: string }>('SELECT token FROM lease WHERE id=1').one().token === token
  }
  release(token: string): void {
    this.ctx.storage.sql.exec('DELETE FROM lease WHERE id=1 AND token=?', token)
  }
  reserve(day: string, bytes: number, dailyLimit: number, monthlyLimit: number): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isSafeInteger(bytes) || bytes <= 0) return false
    return this.ctx.storage.transactionSync(() => {
      const rows = this.ctx.storage.sql.exec<{ day: string; bytes: number }>('SELECT day, bytes FROM spend').toArray()
      const daily = rows.find(row => row.day === day)?.bytes ?? 0
      const monthly = rows.reduce((sum, row) => sum + row.bytes, 0)
      if (daily + bytes > dailyLimit || monthly + bytes > monthlyLimit) return false
      this.ctx.storage.sql.exec('INSERT INTO spend VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET bytes=bytes+excluded.bytes', day, bytes)
      return true
    })
  }
  /**
   * Own-book narration, one object per account (`own-user:{userId}`): a
   * calendar-month (UTC) ceiling over the rows of that month only. Rows older
   * than the previous month are dropped, so the object holds at most two
   * months of daily byte counts and nothing else.
   */
  reserveMonth(day: string, bytes: number, monthlyLimit: number): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isSafeInteger(bytes) || bytes <= 0) return false
    return this.ctx.storage.transactionSync(() => {
      const month = day.slice(0, 7)
      const previous = new Date(Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 2, 1)).toISOString().slice(0, 7)
      this.ctx.storage.sql.exec('DELETE FROM spend WHERE day < ?', previous + '-01')
      const rows = this.ctx.storage.sql.exec<{ day: string; bytes: number }>('SELECT day, bytes FROM spend').toArray()
      const monthly = rows.filter(row => row.day.startsWith(month)).reduce((sum, row) => sum + row.bytes, 0)
      if (monthly + bytes > monthlyLimit) return false
      this.ctx.storage.sql.exec('INSERT INTO spend VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET bytes=bytes+excluded.bytes', day, bytes)
      return true
    })
  }
  /** Gives back a reservation another ceiling refused (never below zero). */
  refund(day: string, bytes: number): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isSafeInteger(bytes) || bytes <= 0) return
    this.ctx.storage.sql.exec('UPDATE spend SET bytes = MAX(0, bytes - ?) WHERE day = ?', bytes, day)
  }
  /** Account deletion: everything this object holds. */
  async purge(): Promise<void> {
    await this.ctx.storage.deleteAll()
    this.createTables()
  }
  usage(): { day: string; bytes: number }[] {
    return this.ctx.storage.sql.exec<{ day: string; bytes: number }>('SELECT day, bytes FROM spend ORDER BY day').toArray()
  }
}
