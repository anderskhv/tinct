/**
 * The room the returning reader's library paints by the hour (the table
 * scenes), and each room's colour: the average of its painting, so a page
 * fading towards the library, or the library's hero before the painting has
 * decoded, shows that colour and not the discovery library's green.
 * boot.js (public/lab/library_2) carries the same rule and map; a test holds
 * them equal.
 */
export const LIBRARY_ROOM_COLOURS = { morning: '#352619', afternoon: '#2d1e15', evening: '#2d1709', night: '#21150f' } as const
export type LibraryRoom = keyof typeof LIBRARY_ROOM_COLOURS

export function libraryRoomForHour(hour: number): LibraryRoom {
  return hour >= 6 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : hour >= 17 && hour < 21 ? 'evening' : 'night'
}

/**
 * Whether the library will open as the returning reader's desk (the table
 * scene), by the same hint boot.js uses: a saved table, saved places, or the
 * signed-in cookie; not for a book link or the shelf view; and not after a
 * recent discovery visit that was not the reader's own doing.
 */
export function libraryOpensReturning(url: string, win: { document: { cookie: string }; localStorage?: Storage | null; sessionStorage?: Storage | null }): boolean {
  let target: URL
  try { target = new URL(url, 'https://tinct.app') } catch { return false }
  if (target.searchParams.has('book') || target.searchParams.get('view') === 'shelf' || target.searchParams.get('view') === 'new' || target.searchParams.has('demo')) return false
  const read = (storage: Storage | null | undefined, key: string) => { try { return storage?.getItem(key) ?? null } catch { return null } }
  const saved = read(win.localStorage, 'tinct-library-2-reading-table')
  const positions = read(win.localStorage, 'tinct-lab-position') || ''
  const signed = /(?:^|;\s*)tinct_auth=1(?:;|$)/.test(win.document.cookie || '')
  let hint = Boolean(saved) || /"books":\{"/.test(positions) || signed
  try {
    const visit = JSON.parse(read(win.sessionStorage, 'tinct:library-2-visit') || 'null') as { at?: number; mode?: string; auto?: boolean } | null
    let localBooks = 0
    try { localBooks = Object.keys((JSON.parse(positions || '{}') as { books?: Record<string, unknown> }).books || {}).length } catch { /* unreadable */ }
    if (visit && typeof visit.at === 'number' && Date.now() - visit.at < 4 * 60 * 60 * 1000 && visit.mode === 'discovery' && !(visit.auto && localBooks >= 2)) hint = false
  } catch { /* no visit record */ }
  return hint
}
