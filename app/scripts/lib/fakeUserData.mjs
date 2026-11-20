// A mocked Supabase `user_data` table for browser checks (no network): the PostgREST reads the reader makes
// (`key=eq.`, `key=in.()`, `key=like.`, `or=(key.eq.X,key.like.X:*)`, `select=`, single-object Accept) and the
// `commit_user_data` RPC with the rules of supabase/migrations/20261022_disk_io_audit.sql: an unchanged value is
// applied at the current rev without a write, a NULL expected rev overwrites, 0 inserts, a mismatch is a conflict
// answered with the server row. Highlights and chat are one row per chapter since 14 Nov 2026
// (src/lab/userDataShards.ts); `book(base)` lists one book's rows, the old whole-book row first.

const copy = value => value === undefined ? value : JSON.parse(JSON.stringify(value))

function likeTest(pattern) {
  const body = pattern.replace(/\*/g, '%').split('').map(c => c === '%' ? '.*' : c === '_' ? '.' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')
  const re = new RegExp(`^${body}$`, 's')
  return key => re.test(key)
}

function unquote(value) {
  return value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1).replace(/\\(.)/g, '$1') : value
}

function splitTree(tree) {
  const parts = []
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

function keyFilter(op, raw) {
  if (op === 'eq') { const value = unquote(raw); return key => key === value }
  if (op === 'like') return likeTest(unquote(raw))
  if (op === 'in') { const values = new Set(splitTree(raw.replace(/^\(|\)$/g, '')).map(unquote)); return key => values.has(key) }
  throw new Error('fake user_data: unsupported operator ' + op)
}

export function createUserDataFake() {
  const rows = new Map()
  const commits = []
  const reads = []
  let clock = Date.now()
  const stamp = () => new Date(clock += 1000).toISOString()
  const fake = {
    rows,
    commits,
    reads,
    set(key, value, rev = 1) { rows.set(key, { key, value: copy(value), rev, updated_at: stamp() }) },
    get(key) { return rows.get(key) },
    /** One book's rows: the old whole-book row, then its chapter rows. */
    book(base) { return [...rows.values()].filter(row => row.key === base || (row.key.startsWith(base + ':') && !row.key.slice(base.length + 1).includes(':'))).sort((a, b) => (a.key === base ? -1 : b.key === base ? 1 : a.key < b.key ? -1 : 1)) },
    /** An old reader tab: one whole-book row, read and committed with its rev. */
    oldTabCommit(key, change) {
      const current = rows.get(key)
      const next = change(copy(current?.value ?? null))
      return fake.commit({ p_key: key, p_value: next, p_expected_rev: current?.rev ?? 0 }, 'old-tab')
    },
    commit(body, who = 'page') {
      const value = copy(body.p_value)
      commits.push({ key: body.p_key, expectedRev: body.p_expected_rev, bytes: Buffer.byteLength(JSON.stringify(body.p_value ?? null)), who })
      const current = rows.get(body.p_key)
      if (current) {
        if (body.p_expected_rev !== null && body.p_expected_rev !== current.rev) return [{ ...copy(current), applied: false, conflict: true }]
        if (JSON.stringify(current.value) === JSON.stringify(value)) return [{ ...copy(current), applied: true, conflict: false }]
        const next = { key: body.p_key, value, rev: current.rev + 1, updated_at: stamp() }
        rows.set(body.p_key, next)
        return [{ ...copy(next), applied: true, conflict: false }]
      }
      if (body.p_expected_rev !== null && body.p_expected_rev !== 0) return [{ key: body.p_key, value: null, rev: null, updated_at: null, applied: false, conflict: true }]
      const next = { key: body.p_key, value, rev: 1, updated_at: stamp() }
      rows.set(body.p_key, next)
      return [{ ...copy(next), applied: true, conflict: false }]
    },
    select(url) {
      const tests = []
      for (const [name, raw] of url.searchParams) {
        if (name === 'key') { const dot = raw.indexOf('.'); tests.push(keyFilter(raw.slice(0, dot), raw.slice(dot + 1))) }
        if (name === 'or') {
          const any = splitTree(raw.replace(/^\(|\)$/g, '')).map(part => {
            const [column, op] = part.split('.', 2)
            if (column !== 'key') throw new Error('fake user_data: unsupported column ' + column)
            return keyFilter(op, part.slice(column.length + op.length + 2))
          })
          tests.push(key => any.some(test => test(key)))
        }
      }
      const columns = (url.searchParams.get('select') || '*').split(',').map(c => c.trim())
      reads.push({ query: url.search, at: Date.now() })
      return [...rows.values()].filter(row => tests.every(test => test(row.key))).sort((a, b) => (a.key < b.key ? -1 : 1))
        .map(row => columns.includes('*') ? copy(row) : Object.fromEntries(columns.map(c => [c, copy(row[c])])))
    },
    /** Answer a routed Supabase REST request; false when it is not one of these two. */
    async handle(route) {
      const req = route.request(), url = new URL(req.url())
      if (url.pathname.endsWith('/rpc/commit_user_data')) { await route.fulfill({ json: fake.commit(req.postDataJSON()) }); return true }
      if (url.pathname.endsWith('/rest/v1/user_data') && req.method() === 'GET') {
        const found = fake.select(url)
        await route.fulfill({ json: req.headers().accept?.includes('vnd.pgrst.object') ? (found[0] ?? null) : found })
        return true
      }
      return false
    },
  }
  return fake
}

/** The marks of one book as a reader merges its rows: newest copy per id, tombstones remove. */
export function bookMarks(fake, base) {
  const live = new Map(), gone = new Set()
  for (const row of fake.book(base)) {
    for (const t of row.value?.deleted ?? []) gone.add(t.id)
    for (const h of row.value?.highlights ?? []) {
      const at = h.updatedAt ?? 0, current = live.get(h.id)
      if (!current || at > (current.updatedAt ?? 0)) live.set(h.id, h)
    }
  }
  return [...live.values()].filter(h => !gone.has(h.id))
}

/**
 * The conversations of one book across its rows, by id, as the reader merges them (labChatHistory
 * mergeChatConversations, simplified): later rows win fields, messages are a union, the newer card copy wins and a
 * deleted card (a tombstone) keeps no messages.
 */
export function bookChats(fake, base) {
  const byId = new Map()
  for (const row of fake.book(base)) for (const c of row.value ?? []) {
    const current = byId.get(c.id)
    if (!current) { byId.set(c.id, c); continue }
    const card = !current.card || !c.card ? (c.card ?? current.card) : c.card.u !== current.card.u ? (c.card.u > current.card.u ? c.card : current.card) : (c.card.gone ? c.card : current.card.gone ? current.card : c.card)
    const messages = card?.gone ? [] : [...new Map([...current.messages, ...c.messages].map(m => [m.id, m])).values()]
    byId.set(c.id, { ...current, ...c, ...(card ? { card } : {}), messages })
  }
  return [...byId.values()]
}
