// @vitest-environment jsdom
/**
 * Continue opens the latest thing read (desktop, 20 Oct 2026): Add a book's viewer names the
 * own book it just read in this device's library snapshot (`tinct:lab-library-boot`), through
 * /lab/library-add.js rememberJustRead, so the library leads with it from its first paint.
 * Local only; phones unchanged.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./services/supabase', () => ({ supabase: { auth: { getSession: async () => ({ data: { session: null } }) } } }))

const ROOT = resolve(__dirname, '../..') + '/'
const READER = readFileSync(ROOT + 'app/public/lab/addbook/js/reader.js', 'utf8')
const HEX = 'a'.repeat(24)

afterEach(() => localStorage.clear())

describe('the viewer’s book just read', () => {
  it('rememberJustRead writes the snapshot hero for the own book, for this account, and nothing else', async () => {
    localStorage.setItem('sb-x-auth-token', JSON.stringify({ user: { id: 'u-1', email: 'r@example.com' } }))
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const { rememberJustRead } = await import('./libraryAdd')
    rememberJustRead({ hex: HEX, title: 'A Paper', chapterLabel: 'p. 5 of 8' }, Date.now())
    const snapshot = JSON.parse(localStorage.getItem('tinct:lab-library-boot')!)
    expect(snapshot.userId).toBe('u-1')
    expect(snapshot.hero).toMatchObject({ bookId: 'userbook-' + HEX, title: 'A Paper', chapterLabel: 'p. 5 of 8', coverSrc: null })
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('ignores anything that is not an own book’s hex', async () => {
    const { rememberJustRead } = await import('./libraryAdd')
    rememberJustRead({ hex: 'emma', title: 'Emma', chapterLabel: 'Chapter 1' })
    rememberJustRead({ hex: HEX, title: '', chapterLabel: 'p. 1 of 2' })
    expect(localStorage.getItem('tinct:lab-library-boot')).toBeNull()
  })

  it('the viewer names it on a move and on leaving, on the desktop only', () => {
    const hook = READER.slice(READER.indexOf('const justRead = {'), READER.indexOf('};', READER.indexOf('const justRead = {')))
    expect(hook).toContain('note() { if (isPhone()) return;')
    expect(hook).toContain('isPhone()')
    expect(hook).toContain('rememberJustRead')
    expect(READER).toMatch(/if \(moved\) justRead\.note\(\);/)
    expect(READER).toMatch(/function leavePlace\(\) \{[^\n]*justRead\.leave\(\);/)
    // Byte-identical mirror (addbooks/web/src).
    expect(readFileSync(ROOT + 'addbooks/web/src/js/reader.js', 'utf8')).toBe(READER)
  })
})
