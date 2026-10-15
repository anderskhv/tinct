/**
 * The light half of the account cards, for pages that may never open them:
 * the stored session (read directly, no lock, no network) and an old link's
 * `?card=` on load. The cards themselves (openCards.ts, the views and their
 * styles) load when a card is opened.
 */
import { supabase } from '../services/supabase'
import { isNativeCapacitor } from '../utils/nativePlatform'
import { CARD_PARAM, isCardName, type CardName } from './cardRoutes'
import type { CardsSession } from './cardViews'

export type StoredAuthSession = { access_token?: unknown; expires_at?: unknown; user?: { id?: unknown; email?: unknown; user_metadata?: Record<string, unknown> } | null }

export function toCardsSession(session: StoredAuthSession | null | undefined): CardsSession | null {
  if (!session || typeof session.access_token !== 'string' || !session.access_token) return null
  const meta = (session.user?.user_metadata ?? {}) as Record<string, unknown>
  const named = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : null
  return { token: session.access_token, userId: typeof session.user?.id === 'string' ? session.user.id : null, email: typeof session.user?.email === 'string' ? session.user.email : null, accountName: named }
}

/** The configured session key, else the default `sb-<ref>-auth-token` this browser holds, if any. */
export function sessionStorageKey(): string | null {
  const key = (supabase?.auth as unknown as { storageKey?: unknown })?.storageKey
  if (typeof key === 'string' && key) return key
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i)
      if (name && /^sb-[a-z0-9]+-auth-token$/.test(name)) return name
    }
  } catch { /* storage blocked */ }
  return null
}

/**
 * The session Supabase keeps in this browser, read directly (no lock, no
 * network), so a tap on the picture opens the cards at once. `fresh` is false
 * once the access token has expired: the cards then paint from the device cache
 * and load only with the token Supabase hands back.
 */
export function storedSession(): { session: CardsSession; fresh: boolean } | null {
  if (!supabase || isNativeCapacitor()) return null
  try {
    const key = sessionStorageKey()
    if (!key) return null
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuthSession & { currentSession?: StoredAuthSession }
    const stored = parsed.currentSession ?? parsed
    const session = toCardsSession(stored)
    if (!session) return null
    const expiresAt = typeof stored.expires_at === 'number' ? stored.expires_at * 1000 : 0
    return { session, fresh: expiresAt > Date.now() + 30_000 }
  } catch {
    return null
  }
}

/** The card named in the page's URL (from an old link), removed from the URL without a reload. */
export function consumeCardParam(): CardName | null {
  try {
    const url = new URL(location.href)
    const name = url.searchParams.get(CARD_PARAM)
    if (!name) return null
    url.searchParams.delete(CARD_PARAM)
    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`)
    return isCardName(name) ? name : null
  } catch {
    return null
  }
}
