import { apiUrl } from '../utils/apiUrl'
import {
  LAB_POSITION_DEVICE_KEY,
  LAB_POSITION_DIRTY_KEY,
  LAB_POSITION_STORAGE_KEY,
  emptyLabPositionState,
  mergeLabPositionStatesByTime,
  parseLabPositionState,
  type LabPositionState,
} from './labPosition'

const IDB_NAME = 'tinct-lab'
const IDB_STORE = 'kv'
const IDB_KEY = 'position'

export function createLabDeviceId(): string {
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes)
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function readLabDeviceId(): string {
  if (typeof localStorage === 'undefined') return createLabDeviceId()
  try {
    const existing = localStorage.getItem(LAB_POSITION_DEVICE_KEY)
    if (existing) return existing
    const next = createLabDeviceId()
    localStorage.setItem(LAB_POSITION_DEVICE_KEY, next)
    return next
  } catch {
    return createLabDeviceId()
  }
}

export function readLabPositionLocal(deviceId = readLabDeviceId()): LabPositionState {
  if (typeof localStorage === 'undefined') return emptyLabPositionState(deviceId)
  try {
    const raw = localStorage.getItem(LAB_POSITION_STORAGE_KEY)
    if (!raw) return emptyLabPositionState(deviceId)
    return parseLabPositionState(JSON.parse(raw), deviceId)
  } catch {
    return emptyLabPositionState(deviceId)
  }
}

function idbAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openIdb(): Promise<IDBDatabase | null> {
  if (!idbAvailable()) return Promise.resolve(null)
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function writeIdb(state: LabPositionState): Promise<void> {
  const db = await openIdb()
  if (!db) return
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).put(state, IDB_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    } catch {
      resolve()
    } finally {
      db.close()
    }
  })
}

/**
 * Merge-before-write. Another tab (or a stale in-memory state after a cloud
 * apply) may hold an older record; the newer per-book place and the newer
 * settle survive whichever tab writes last. Returns what was stored.
 */
export function writeLabPositionLocal(state: LabPositionState): LabPositionState {
  let merged = state
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(LAB_POSITION_STORAGE_KEY)
      if (raw) merged = mergeLabPositionStatesByTime(parseLabPositionState(JSON.parse(raw), state.deviceId), state)
    } catch { /* unreadable record: overwrite it */ }
    try {
      localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(merged))
    } catch { /* quota / private mode */ }
  }
  void writeIdb(merged)
  return merged
}

export function clearLabPositionLocal(): void {
  try { localStorage.removeItem(LAB_POSITION_STORAGE_KEY) } catch { /* jsdom */ }
  try { localStorage.removeItem(LAB_POSITION_DIRTY_KEY) } catch { /* jsdom */ }
}

export function readLabPositionDirty(): boolean {
  try { return localStorage.getItem(LAB_POSITION_DIRTY_KEY) === '1' } catch { return false }
}

function writeLabPositionDirty(dirty: boolean): void {
  try {
    if (dirty) localStorage.setItem(LAB_POSITION_DIRTY_KEY, '1')
    else localStorage.removeItem(LAB_POSITION_DIRTY_KEY)
  } catch { /* jsdom / private mode */ }
}

export async function fetchLabPositionCloud(token: string | null | undefined): Promise<LabPositionState | null> {
  if (!token) return null
  try {
    const res = await fetch(apiUrl('/api/lab-position'), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return parseLabPositionState(await res.json(), readLabDeviceId())
  } catch {
    return null
  }
}

export interface LabPositionPutOptions {
  /** Let the request outlive the page (hide / pagehide). */
  keepalive?: boolean
}

export async function putLabPositionCloud(
  token: string | null | undefined,
  state: LabPositionState,
  options: LabPositionPutOptions = {},
): Promise<boolean> {
  if (!token) return false
  try {
    const res = await fetch(apiUrl('/api/lab-position'), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(state),
      ...(options.keepalive ? { keepalive: true } : {}),
    })
    return res.ok
  } catch {
    return false
  }
}

export function createLabPositionSync(opts: {
  token?: string | null
  online?: () => boolean
  put?: typeof putLabPositionCloud
}) {
  // The dirty flag survives reloads so a PUT that failed (or never ran while
  // offline) is retried on the next load or `online`, not forgotten.
  let dirty = readLabPositionDirty()
  let last: LabPositionState | null = null
  const put = opts.put ?? putLabPositionCloud
  const isOnline = opts.online ?? (() => typeof navigator === 'undefined' || navigator.onLine)

  const markDirty = (next: boolean) => {
    dirty = next
    writeLabPositionDirty(next)
  }

  return {
    persist(state: LabPositionState, options: LabPositionPutOptions = {}) {
      last = writeLabPositionLocal(state)
      if (!opts.token) return
      if (!isOnline()) {
        markDirty(true)
        return
      }
      void put(opts.token, state, options).then((ok) => {
        markDirty(!ok)
      })
    },
    async flush() {
      if (!opts.token) return false
      const state = last ?? readLabPositionLocal()
      if (!state.updatedAt) return false
      const ok = await put(opts.token, state)
      if (ok) markDirty(false)
      return ok
    },
    isDirty: () => dirty,
    canWriteCloud: () => Boolean(opts.token),
  }
}
