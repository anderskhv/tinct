export interface AttributionSnapshot {
  landing_path?: string
  landing_referrer?: string
  first_seen_at?: string
  last_seen_at?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  fbclid?: string
  msclkid?: string
  ttclid?: string
  rdt_cid?: string
}

const FIRST_TOUCH_KEY = 'tinct:first-touch'
const LAST_TOUCH_KEY = 'tinct:last-touch'

const TRACKED_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
  'ttclid',
  'rdt_cid',
] as const

function readSnapshot(key: string): AttributionSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as AttributionSnapshot : null
  } catch {
    return null
  }
}

function writeSnapshot(key: string, value: AttributionSnapshot): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

function currentSnapshot(): AttributionSnapshot | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const captured: AttributionSnapshot = {}
  for (const key of TRACKED_PARAMS) {
    const value = params.get(key)
    if (value) captured[key] = value.slice(0, 250)
  }

  const hasTrackedParam = Object.keys(captured).length > 0
  const referrer = document.referrer || ''
  if (!hasTrackedParam && !referrer) return null

  const now = new Date().toISOString()
  return {
    landing_path: `${window.location.pathname}${window.location.search}`,
    landing_referrer: referrer || undefined,
    first_seen_at: now,
    last_seen_at: now,
    ...captured,
  }
}

export function captureAttribution(): void {
  const snapshot = currentSnapshot()
  if (!snapshot) return

  if (!readSnapshot(FIRST_TOUCH_KEY)) {
    writeSnapshot(FIRST_TOUCH_KEY, snapshot)
  }

  const previousLastTouch = readSnapshot(LAST_TOUCH_KEY)
  writeSnapshot(LAST_TOUCH_KEY, {
    ...previousLastTouch,
    ...snapshot,
    first_seen_at: previousLastTouch?.first_seen_at || snapshot.first_seen_at,
    last_seen_at: snapshot.last_seen_at,
  })
}

export function getAttributionPayload(): { first_touch: AttributionSnapshot | null; last_touch: AttributionSnapshot | null } {
  captureAttribution()
  return {
    first_touch: readSnapshot(FIRST_TOUCH_KEY),
    last_touch: readSnapshot(LAST_TOUCH_KEY),
  }
}

export function flattenAttributionForMetadata(snapshot: AttributionSnapshot | null): Record<string, string> {
  if (!snapshot) return {}
  const metadata: Record<string, string> = {}
  for (const [key, value] of Object.entries(snapshot)) {
    if (typeof value === 'string' && value) metadata[`attr_${key}`] = value.slice(0, 500)
  }
  return metadata
}
