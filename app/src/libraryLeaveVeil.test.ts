import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { expect, it, vi } from 'vitest'
import { LAB_THEME_PAPER, readerBootTheme } from './lab/readerBoot'

const source = readFileSync(new URL('../public/lab/library_2/boot.js', import.meta.url), 'utf8')

/** The paper the library's leave veil is given, or null for its default. */
function veil(prefs: unknown, systemDark = false, eink = false): string | null {
  const records = new Map<string, string>()
  if (prefs !== undefined) records.set('tinct-lab-prefs', typeof prefs === 'string' ? prefs : JSON.stringify(prefs))
  if (eink) records.set('tinct:display-profile', 'eink')
  const setProperty = vi.fn()
  runInNewContext(source, {
    window: {},
    location: { pathname: '/library', search: '', replace: vi.fn() },
    localStorage: { length: records.size, key: (i: number) => [...records.keys()][i], getItem: (key: string) => records.get(key) ?? null, setItem: vi.fn() },
    sessionStorage: { getItem: () => null, setItem: vi.fn() },
    document: { cookie: '', documentElement: { style: { visibility: '', setProperty }, classList: { add: vi.fn() }, dataset: {} }, head: { append: vi.fn() }, createElement: () => ({}) },
    matchMedia: () => ({ matches: systemDark }),
    URLSearchParams, Date, innerWidth: 1440, innerHeight: 900,
    fetch: vi.fn(async () => ({ ok: true, json: async () => [] })),
  })
  const call = setProperty.mock.calls.find(([name]) => name === '--reader-paper')
  return call ? call[1] as string : null
}

const both = (theme: string) => ({ version: 2, shared: {}, phone: { theme }, desktop: { theme } })

it('gives a dark or book reader their own paper as the library fades out', () => {
  expect(veil(both('dark'))).toBe(LAB_THEME_PAPER.dark)
  expect(veil(both('book'))).toBe(LAB_THEME_PAPER.book)
  expect(veil(both('system'), true)).toBe(LAB_THEME_PAPER.dark)
  expect(veil({ darkMode: true })).toBe(LAB_THEME_PAPER.dark)
})

it('keeps the default light veil when the reader is light, unknown, layout-dependent or e-ink', () => {
  expect(veil(both('light'))).toBeNull()
  expect(veil(undefined)).toBeNull()
  expect(veil('{broken')).toBeNull()
  expect(veil({ version: 2, shared: {}, phone: { theme: 'dark' }, desktop: { theme: 'light' } })).toBeNull()
  expect(veil(both('dark'), false, true)).toBeNull()
})

it('agrees with the reader’s own boot resolution', () => {
  const cases: Array<[unknown, boolean]> = [[both('dark'), false], [both('system'), true], [both('book'), false], [{ theme: 'dark' }, false], [{ darkMode: false }, true], [undefined, true]]
  for (const [prefs, dark] of cases) {
    const theme = readerBootTheme(prefs === undefined ? null : JSON.stringify(prefs), dark, false)
    const expected = theme === 'dark' || theme === 'book' ? LAB_THEME_PAPER[theme] : null
    expect(veil(prefs, dark)).toBe(expected)
  }
})
