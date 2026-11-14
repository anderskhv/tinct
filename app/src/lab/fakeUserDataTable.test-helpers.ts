/**
 * An in-memory `user_data` table behind the Supabase calls the reader makes: `select` with `eq`, `or`
 * (`key.eq.X,key.like.X:*`), `in` and `like` filters (awaited as a list or through `maybeSingle`), and the
 * `commit_user_data` RPC with the rules of 20261022_disk_io_audit.sql (an unchanged value is applied at the
 * current rev without a write; a NULL expected rev overwrites; 0 inserts; a mismatch is a conflict that returns
 * the server row). One user. Values are deep-copied in and out, as JSON over the network would.
 */
export interface FakeUserDataRow {
  key: string
  value: unknown
  rev: number
  updated_at: string
}

export interface FakeUserDataCall {
  kind: 'select' | 'commit'
  /** The filter (select) or key (commit). */
  target: string
  columns?: string
  expectedRev?: number | null
}

type Answer = { data: unknown; error: { message: string; code?: string } | null }

const copy = <T>(value: T): T => (value === undefined ? value : JSON.parse(JSON.stringify(value)))

function likeToRegExp(pattern: string): RegExp {
  // PostgREST maps `*` to `%`; `%` and `_` are SQL wildcards.
  const body = pattern.replace(/\*/g, '%').split('').map(c => c === '%' ? '.*' : c === '_' ? '.' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')
  return new RegExp(`^${body}$`, 's')
}

function splitTree(tree: string): string[] {
  const parts: string[] = []
  let depth = 0, quoted = false, current = ''
  for (const c of tree) {
    if (c === '"') quoted = !quoted
    if (!quoted && c === '(') depth++
    if (!quoted && c === ')') depth--
    if (!quoted && depth === 0 && c === ',') { parts.push(current); current = ''; continue }
    current += c
  }
  if (current) parts.push(current)
  return parts
}

function condition(text: string): (row: FakeUserDataRow) => boolean {
  const first = text.indexOf('.'), second = text.indexOf('.', first + 1)
  const column = text.slice(0, first), op = text.slice(first + 1, second)
  let value = text.slice(second + 1)
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\(.)/g, '$1')
  if (column !== 'key') throw new Error(`fake user_data: unsupported column ${column}`)
  if (op === 'eq') return row => row.key === value
  if (op === 'like') { const re = likeToRegExp(value); return row => re.test(row.key) }
  throw new Error(`fake user_data: unsupported operator ${op}`)
}

export function createFakeUserDataTable() {
  const rows = new Map<string, FakeUserDataRow>()
  const calls: FakeUserDataCall[] = []
  let clock = Date.UTC(2026, 10, 14, 9)
  const stamp = () => new Date(clock += 1000).toISOString()
  const table = {
    rows,
    calls,
    /** Answer the next selects yourself (a hung or stale read): return undefined to answer normally. */
    onSelect: null as null | ((call: FakeUserDataCall) => PromiseLike<Answer> | undefined),
    /** The next book read (an `or=` listing) answers from these rows instead: a stale replica or cache. */
    staleNextRead: null as null | Map<string, FakeUserDataRow>,
    /** Fail commits (offline); return an error message or null. */
    onCommit: null as null | ((key: string) => string | null),
    set(key: string, value: unknown, rev = 1) {
      rows.set(key, { key, value: copy(value), rev, updated_at: stamp() })
    },
    value(key: string): unknown {
      return copy(rows.get(key)?.value)
    },
    /** Keys of one book: the old whole-book row and its shards. */
    keysOf(base: string): string[] {
      return [...rows.keys()].filter(key => key === base || (key.startsWith(base + ':') && !key.slice(base.length + 1).includes(':'))).sort()
    },
    commits(prefix = ''): FakeUserDataCall[] {
      return calls.filter(call => call.kind === 'commit' && call.target.startsWith(prefix))
    },
    clear() { rows.clear(); calls.length = 0; table.onSelect = null; table.onCommit = null; table.staleNextRead = null },
    client: {
      from(_table: string) {
        const filters: ((row: FakeUserDataRow) => boolean)[] = []
        const described: string[] = []
        let columns = '*'
        const run = (single: boolean): PromiseLike<Answer> => {
          const call: FakeUserDataCall = { kind: 'select', target: described.join('&'), columns }
          calls.push(call)
          const custom = table.onSelect?.(call)
          if (custom) return custom
          let source = rows
          if (table.staleNextRead && call.target.includes('or=')) { source = table.staleNextRead; table.staleNextRead = null }
          const picked = [...source.values()].filter(row => filters.every(test => test(row))).sort((a, b) => (a.key < b.key ? -1 : 1))
          const shaped = picked.map(row => {
            if (columns === '*') return copy(row)
            const out: Record<string, unknown> = {}
            for (const name of columns.split(',').map(part => part.trim())) out[name] = copy((row as unknown as Record<string, unknown>)[name])
            return out
          })
          return Promise.resolve({ data: single ? (shaped[0] ?? null) : shaped, error: null })
        }
        const withAbort = (promise: PromiseLike<Answer>) => Object.assign(promise, { abortSignal: () => promise })
        const builder = {
          select(cols = '*') { columns = cols.replace(/\s+/g, ''); columns = columns.split(',').join(','); return builder },
          eq(column: string, value: string) {
            described.push(`${column}=eq.${value}`)
            if (column === 'key') filters.push(row => row.key === value)
            return builder
          },
          or(tree: string) {
            described.push(`or=(${tree})`)
            const any = splitTree(tree).map(condition)
            filters.push(row => any.some(test => test(row)))
            return builder
          },
          in(column: string, values: string[]) {
            described.push(`${column}=in.(${values.join(',')})`)
            const set = new Set(values)
            filters.push(row => set.has(row.key))
            return builder
          },
          like(column: string, pattern: string) {
            described.push(`${column}=like.${pattern}`)
            const re = likeToRegExp(pattern)
            filters.push(row => re.test(row.key))
            return builder
          },
          maybeSingle: () => withAbort(run(true)),
          abortSignal: () => builder,
          then<A, B>(resolve: (value: Answer) => A, reject?: (reason: unknown) => B) { return run(false).then(resolve, reject) },
        }
        return builder
      },
      rpc(name: string, args: { p_user_id: string; p_key: string; p_value: unknown; p_expected_rev: number | null }) {
        const answer = (): Answer => {
          if (name !== 'commit_user_data') return { data: null, error: { message: 'unknown rpc' } }
          calls.push({ kind: 'commit', target: args.p_key, expectedRev: args.p_expected_rev })
          const failure = table.onCommit?.(args.p_key)
          if (failure) return { data: null, error: { message: failure } }
          const current = rows.get(args.p_key)
          const value = copy(args.p_value)
          const same = current && JSON.stringify(current.value) === JSON.stringify(value)
          if (current) {
            if (args.p_expected_rev !== null && args.p_expected_rev !== current.rev) return { data: [{ ...copy(current), applied: false, conflict: true }], error: null }
            if (same) return { data: [{ ...copy(current), applied: true, conflict: false }], error: null }
            const next = { key: args.p_key, value, rev: current.rev + 1, updated_at: stamp() }
            rows.set(args.p_key, next)
            return { data: [{ ...copy(next), applied: true, conflict: false }], error: null }
          }
          if (args.p_expected_rev !== null && args.p_expected_rev !== 0) return { data: [{ key: args.p_key, value: null, rev: null, updated_at: null, applied: false, conflict: true }], error: null }
          const next = { key: args.p_key, value, rev: 1, updated_at: stamp() }
          rows.set(args.p_key, next)
          return { data: [{ ...copy(next), applied: true, conflict: false }], error: null }
        }
        const promise = Promise.resolve().then(answer)
        return Object.assign(promise, { abortSignal: () => promise })
      },
    },
  }
  return table
}

export type FakeUserDataTable = ReturnType<typeof createFakeUserDataTable>

/** One table per test file, for `vi.mock('../services/supabase', ...)` factories. */
export const fakeUserDataTable = createFakeUserDataTable()
