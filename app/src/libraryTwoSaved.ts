/** The library's To read shelf. No reading position or completion writes. */
import { supabase } from './services/supabase'
import { coerceRev, versionedWriteApplied } from './services/supabaseStorage.versioning'
const PREFIX = 'library-shelf:'
const DEVICE = 'tinct:library-2-saved:'
type Change = { saved: boolean; at: number; tableHidden?: boolean }
type State = { items: Record<string, Change>; pending: Record<string, Change>; revisions?: Record<string, number> }
const empty = (): State => ({ items: {}, pending: {} })
let queue: Promise<unknown> = Promise.resolve()
let viewer: string | null | undefined

async function account(): Promise<string | null> {
  const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } }
  return data.session?.user.id ?? null
}
function read(owner: string | null): State {
  const cached = memory.get(owner ?? 'guest')
  if (cached) return cached
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
const volatileOwners = new Set<string>()
function write(owner: string | null, state: State) {
  memory.set(owner ?? 'guest', state)
  try { localStorage.setItem(DEVICE + (owner ?? 'guest'), JSON.stringify(state)); volatileOwners.delete(owner ?? 'guest') } catch { volatileOwners.add(owner ?? 'guest') }
}
function ids(state: State): string[] {
  return Object.entries(state.items).filter(([, item]) => item.saved).sort((a, b) => b[1].at - a[1].at).map(([id]) => id)
}
function acceptRow(state: State, id: string, row: { value?: Change | null; rev?: number | null }) {
  const revision = coerceRev(row.rev), known = state.revisions?.[id]
  if (known !== undefined && (revision === undefined || revision < known)) return
  if (revision !== undefined) (state.revisions ??= {})[id] = revision
  state.items[id] = { saved: row.value?.saved === true, at: Number(row.value?.at) || 0, ...(row.value?.tableHidden === true ? { tableHidden: true } : {}) }
}
function rememberRevision(state: State, id: string, raw: unknown) {
  const revision = coerceRev(raw)
  if (revision !== undefined) (state.revisions ??= {})[id] = Math.max(state.revisions?.[id] ?? 0, revision)
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
    for (const [id, row] of rows) if (!state.pending[id]) acceptRow(state, id, row)
    for (const [id, change] of Object.entries(state.pending)) {
      let row = rows.get(id)
      for (let attempt = 0; attempt < 3; attempt++) {
        if (await account() !== owner) throw new Error('Account changed')
        if (state.pending[id] !== change) break
        // A queued removal from an older visit must not delete a later re-add
        // on another device, including a value returned by a CAS conflict.
        if (!change.saved && row?.value?.saved === true && Number(row.value.at) > change.at) {
          delete state.pending[id]
          acceptRow(state, id, row)
          break
        }
        const { data: result, error: failed } = await client.rpc('commit_user_data', {
          p_user_id: owner, p_key: PREFIX + id, p_value: change.saved ? change : null,
          p_expected_rev: row?.rev ?? null,
        })
        if (failed) break
        const committed = Array.isArray(result) ? result[0] : result
        if (versionedWriteApplied(committed)) { rememberRevision(state, id, committed.rev); if (state.pending[id] === change) delete state.pending[id]; break }
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
export async function loadSavedBooks(options: { onCached?: (value: { ids: string[]; synced: boolean }) => void } = {}) {
  const owner = await account(), state = read(owner)
  watchAccount(owner)
  write(owner, state)
  options.onCached?.({ ids: ids(state), synced: false })
  return serialize(async () => {
    if (await account() !== owner) throw new Error('Account changed')
    const synced = await sync(owner, state)
    if (await account() !== owner) throw new Error('Account changed')
    write(owner, state)
    return { ids: ids(state), synced }
  })
}
export async function setSavedBook(id: string, saved: boolean, options: { tableHidden?: boolean } = {}) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('Invalid book')
  const owner = await account(), state = read(owner)
  watchAccount(owner)
  const change: Change = { saved, at: Date.now(), ...(saved && options.tableHidden ? { tableHidden: true } : {}) }
  state.items[id] = change
  if (owner) state.pending[id] = change
  // Persist each click before joining the cloud queue. A slow request must
  // never delay the next click's durability or overwrite a newer action.
  write(owner, state)
  return serialize(async () => {
    if (await account() !== owner) throw new Error('Account changed')
    const synced = await sync(owner, state)
    if (await account() !== owner) throw new Error('Account changed')
    write(owner, state)
    return { ids: ids(state), synced }
  })
}

/** Explicit membership overrides inferred reading history without deleting it. */
export async function loadShelfMembership() {
  await loadSavedBooks()
  const owner = await account()
  const state = read(owner)
  return {
    removed: Object.entries(state.items).filter(([, item]) => !item.saved).map(([id]) => id),
    tableHidden: Object.entries(state.items).filter(([, item]) => item.saved && item.tableHidden).map(([id]) => id),
  }
}
