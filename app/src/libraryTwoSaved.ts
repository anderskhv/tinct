/** The library's To read shelf. No reading position or completion writes. */
import { supabase } from './services/supabase'
import { versionedWriteApplied } from './services/supabaseStorage.versioning'
const PREFIX = 'library-shelf:'
const DEVICE = 'tinct:library-2-saved:'
type Change = { saved: boolean; at: number }
type State = { items: Record<string, Change>; pending: Record<string, Change> }
const empty = (): State => ({ items: {}, pending: {} })
let queue: Promise<unknown> = Promise.resolve()
let viewer: string | null | undefined

async function account(): Promise<string | null> {
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } }
  return data.session?.user.id ?? null
}
function read(owner: string | null): State {
  try {
    const value = JSON.parse(localStorage.getItem(DEVICE + (owner ?? 'guest')) || 'null')
    if (value?.items && value?.pending) return value
    // The old unscoped list belongs to the guest device, never automatically to
    // whichever account happens to sign in next. Keep the source for recovery.
    if (!owner) {
      const legacy = JSON.parse(localStorage.getItem('tinct-library-2-to-read') || '[]')
      const state = empty()
      if (Array.isArray(legacy)) for (const id of legacy) if (typeof id === 'string') state.items[id] = { saved: true, at: 0 }
      return state
    }
  } catch { /* Blocked storage still permits an in-memory shelf for this visit. */ }
  return memory.get(owner ?? 'guest') ?? empty()
}
const memory = new Map<string, State>()
function write(owner: string | null, state: State) {
  memory.set(owner ?? 'guest', state)
  try { localStorage.setItem(DEVICE + (owner ?? 'guest'), JSON.stringify(state)) } catch { /* private browsing */ }
}
function ids(state: State): string[] {
  return Object.entries(state.items).filter(([, item]) => item.saved).sort((a, b) => b[1].at - a[1].at).map(([id]) => id)
}
async function sync(owner: string | null, state: State): Promise<boolean> {
  if (!owner || !supabase) return true
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false
  const client = supabase
  try {
    const { data, error } = await client.from('user_data').select('key,value,rev').eq('user_id', owner).like('key', PREFIX + '%')
    if (error) return false
    if (await account() !== owner) throw new Error('Account changed')
    const rows = new Map((data ?? []).map(row => [row.key.slice(PREFIX.length), row]))
    // Cloud tombstones remove items on every device; only unacknowledged local
    // actions override the server. Never resurrect a deleted remote book.
    for (const [id, row] of rows) if (!state.pending[id]) state.items[id] = { saved: row.value?.saved === true, at: Number(row.value?.at) || 0 }
    for (const [id, change] of Object.entries(state.pending)) {
      let row = rows.get(id)
      for (let attempt = 0; attempt < 3; attempt++) {
        if (await account() !== owner) throw new Error('Account changed')
        const { data: result, error: failed } = await client.rpc('commit_user_data', {
          p_user_id: owner, p_key: PREFIX + id, p_value: change.saved ? change : null,
          p_expected_rev: row?.rev ?? null,
        })
        if (failed) break
        const committed = Array.isArray(result) ? result[0] : result
        if (versionedWriteApplied(committed)) { delete state.pending[id]; break }
        row = committed
      }
    }
    return Object.keys(state.pending).length === 0
  } catch { return false }
}
function serialize<T>(work: () => Promise<T>): Promise<T> {
  const result = queue.then(work, work)
  queue = result.catch(() => {})
  return result
}
function watchAccount(owner: string | null) {
  if (viewer !== undefined) return
  viewer = owner
  supabase?.auth.onAuthStateChange((_event, session) => {
    if ((session?.user.id ?? null) !== viewer) location.reload()
  })
}
export function loadSavedBooks() {
  return serialize(async () => {
    const owner = await account(), state = read(owner)
    watchAccount(owner)
    const synced = await sync(owner, state)
    if (await account() !== owner) throw new Error('Account changed')
    write(owner, state)
    return { ids: ids(state), synced }
  })
}
export function setSavedBook(id: string, saved: boolean) {
  return serialize(async () => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('Invalid book')
    const owner = await account(), state = read(owner)
    const change = { saved, at: Date.now() }
    state.items[id] = change
    if (owner) state.pending[id] = change
    write(owner, state)
    const synced = await sync(owner, state)
    if (await account() !== owner) throw new Error('Account changed')
    write(owner, state)
    return { ids: ids(state), synced }
  })
}
