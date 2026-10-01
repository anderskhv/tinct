/**
 * Classic script in the reader HTML head (see `readerBootScript` in
 * vite.config.ts). Runs before first paint and before the app bundle has
 * downloaded. It never writes storage and never fails the page.
 */
import { CHAPTER_SHARDED_EDITION_IDS } from '../data/editionShardRegistry'
import {
  LAB_THEME_PAPER,
  READER_BOOT_DEFAULT_FACE_URL,
  READER_BOOT_POSITION_PREFETCH,
  READER_BOOT_HANDOFF_KEY,
  READER_BOOT_PREFS_KEY,
  readerBootEink,
  readerBootHandoff,
  readerBootPositionToken,
  readerBootPreloads,
  readerBootTheme,
  readerBootUsesDefaultFace,
} from './readerBoot'

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key)
  } catch {
    return null
  }
}

function preload(href: string, as: 'fetch' | 'font'): void {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = href
  // Matches fetch()'s default mode and credentials, so the loader reuses it.
  link.crossOrigin = 'anonymous'
  if (as === 'font') link.type = 'font/woff2'
  document.head.appendChild(link)
}

try {
  if (location.pathname === '/reader') {
    const prefs = read(() => localStorage, READER_BOOT_PREFS_KEY)
    const root = document.documentElement
    const theme = readerBootTheme(
      prefs,
      typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches,
      readerBootEink(location.search, read(() => localStorage, 'tinct:display-profile')),
    )
    if (theme) {
      // The same attributes LabApp sets on mount, set before the first paint.
      root.setAttribute('data-theme', theme)
      root.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
      root.style.backgroundColor = LAB_THEME_PAPER[theme]
    }
    const handoff = readerBootHandoff(read(() => sessionStorage, READER_BOOT_HANDOFF_KEY))
    if (handoff) {
      for (const href of readerBootPreloads(handoff, {
        version: __BUILD_VERSION__,
        shardedEditionIds: CHAPTER_SHARDED_EDITION_IDS,
        shardWindowDisabled: read(() => localStorage, 'tinct:chapter-sharded-editions') === '0',
      })) preload(href, 'fetch')
    }
    if (readerBootUsesDefaultFace(prefs)) preload(READER_BOOT_DEFAULT_FACE_URL, 'font')
    // The signed-in reader's cloud position, started before the bundle runs.
    if (navigator.onLine !== false) {
      const entries: Array<[string, string | null]> = []
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sb-')) entries.push([key, localStorage.getItem(key)])
      }
      const token = readerBootPositionToken(entries, Date.now() / 1000)
      if (token) {
        const body = fetch('/api/lab-position', { method: 'GET', headers: { Authorization: `Bearer ${token}` } })
          .then(res => (res.ok ? res.json() : null))
          .catch(() => null)
        ;(window as unknown as Record<string, unknown>)[READER_BOOT_POSITION_PREFETCH] = { token, at: Date.now(), body }
      }
    }
  }
} catch {
  // Optional: the app does all of this again on its own.
}
