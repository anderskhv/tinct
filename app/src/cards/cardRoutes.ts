/**
 * Old account URLs keep working (links in emails): each redirects to the
 * library, or to the reader page it came from, with `?card=<name>`, and the
 * page opens that card over itself (openCards.ts consumeCardParam).
 *
 *   /you                     -> You
 *   /you?view=settings (…)   -> Settings
 *   /your-reading            -> Your reading
 *   /friends                 -> Leaderboard (?tab=find -> Find readers)
 *   /sign-in?mode=account    -> Account (handled by the sign-in page, which signs in first)
 *
 * Pure; shared by the Worker and the dev server.
 */
export const CARD_PARAM = 'card'

export type CardName = 'you' | 'reading' | 'leaderboard' | 'find' | 'settings' | 'account'
const CARD_NAMES: ReadonlySet<string> = new Set<CardName>(['you', 'reading', 'leaderboard', 'find', 'settings', 'account'])

export function isCardName(value: unknown): value is CardName {
  return typeof value === 'string' && CARD_NAMES.has(value)
}

/** Where a card may open: the library, or a reader URL (same rules as sign-in's return). */
function cardHost(raw: string | null): string {
  if (!raw || raw.includes('\\') || !raw.startsWith('/') || raw.startsWith('//')) return '/library'
  try {
    const url = new URL(raw, 'https://tinct.app')
    if (/^\/(?:reader|read\/[A-Za-z0-9_-]+(?:\/\d+)?)\/?$/.test(url.pathname) || url.pathname === '/library' || url.pathname === '/') {
      url.searchParams.delete(CARD_PARAM)
      return `${url.pathname}${url.search}`
    }
  } catch { /* fall through */ }
  return '/library'
}

/** `/library?card=you`, or the reader URL with the card added. */
export function cardUrl(card: CardName, host: string | null = null): string {
  const base = cardHost(host)
  const url = new URL(base, 'https://tinct.app')
  url.searchParams.set(CARD_PARAM, card)
  return `${url.pathname}${url.search}`
}

const YOU_VIEWS: Record<string, CardName> = {
  settings: 'settings', visibility: 'settings', showReading: 'settings', showTime: 'settings', onLeaderboard: 'settings',
  emails: 'settings', newBooks: 'settings', name: 'settings', handle: 'settings', blocked: 'settings',
}

/** The redirect for an old account page, or null. */
export function accountPageRedirect(pathname: string, search: string): string | null {
  const params = new URLSearchParams(search)
  const back = params.get('returnTo') || params.get('return')
  if (pathname === '/you' || pathname === '/you/') {
    return cardUrl(YOU_VIEWS[params.get('view') || ''] ?? 'you', back)
  }
  if (pathname === '/your-reading' || pathname === '/your-reading/') return cardUrl('reading', back)
  if (pathname === '/friends' || pathname === '/friends/') return cardUrl(params.get('tab') === 'find' ? 'find' : 'leaderboard', back)
  return null
}
