import { DurableObject } from 'cloudflare:workers'

/** One object per content identity, or per billing month. Only short atomic
 * SQL operations run here; provider I/O stays outside the coordinator.
 */
export class NarrationCoordinator extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env)
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS lease (id INTEGER PRIMARY KEY, token TEXT, expires INTEGER)')
    ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS spend (day TEXT PRIMARY KEY, bytes INTEGER NOT NULL)')
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
  usage(): { day: string; bytes: number }[] {
    return this.ctx.storage.sql.exec<{ day: string; bytes: number }>('SELECT day, bytes FROM spend ORDER BY day').toArray()
  }
}
