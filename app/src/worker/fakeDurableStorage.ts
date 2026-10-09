/**
 * Test stand-in for a SQLite-backed Durable Object's state: real SQLite
 * (node:sqlite, in memory) behind `storage.sql.exec`, `transactionSync`,
 * `deleteAll` and the alarm API, plus `waitUntil`. `durableNamespace` hands out
 * one live instance per name, as `getByName` does. Tests only.
 */
import { createRequire } from 'node:module'

const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as { DatabaseSync: new (path: string) => any }

export function fakeDurableState() {
  const db = new DatabaseSync(':memory:')
  let alarm: number | null = null
  const waits: Promise<unknown>[] = []
  const exec = (query: string, ...bindings: unknown[]) => {
    const rows = /^\s*SELECT/i.test(query) ? db.prepare(query).all(...bindings).map((row: object) => ({ ...row })) : (db.prepare(query).run(...bindings), [])
    return { toArray: () => rows, one: () => rows[0] }
  }
  const storage = {
    sql: { exec },
    transactionSync<T>(fn: () => T): T {
      db.exec('BEGIN')
      try { const value = fn(); db.exec('COMMIT'); return value } catch (error) { db.exec('ROLLBACK'); throw error }
    },
    async deleteAll() {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as Array<{ name: string }>
      for (const { name } of tables) db.exec(`DROP TABLE IF EXISTS "${name}"`)
      alarm = null
    },
    async getAlarm() { return alarm },
    async setAlarm(at: number) { alarm = at },
    async deleteAlarm() { alarm = null },
  }
  const state = { storage, waitUntil: (promise: Promise<unknown>) => { waits.push(promise) } }
  return { state: state as unknown as DurableObjectState, storage, alarm: () => alarm, waits, tables: () => (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as Array<{ name: string }>).map(row => row.name) }
}

export function durableNamespace<T>(make: (state: DurableObjectState, name: string) => T) {
  const instances = new Map<string, { object: T; fake: ReturnType<typeof fakeDurableState> }>()
  const getByName = (name: string) => {
    let entry = instances.get(name)
    if (!entry) {
      const fake = fakeDurableState()
      entry = { object: make(fake.state, name), fake }
      instances.set(name, entry)
    }
    return entry.object
  }
  return { namespace: { getByName } as unknown as DurableObjectNamespace & { getByName: (name: string) => T }, instances, getByName }
}
