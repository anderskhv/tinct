import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { liveLibraryRelease } from '../scripts/lib/liveLibraryRelease.mjs'

// The post-deploy reviewed-introductions check compares production with what
// this checkout builds and the Worker serves (scripts/lib/liveLibraryRelease.mjs).
// Production is faked: each built entry is a tiny module, the reading engine
// imports one hashed bundle.
const origin = 'https://tinct.app'
const sha10 = (text: string) => createHash('sha256').update(text).digest('hex').slice(0, 10)
const entrySource = (path: string) => path === '/lab/library-2-reading.js'
  ? 'import"../assets/engine-abc123.js";export const reading=1'
  : `export const entry=${JSON.stringify(path)}`
const untag = (text: string) => text.replace(/\?v=[\w.-]*/g, '?v=')

function fakeProduction() {
  vi.stubGlobal('fetch', async (input: string) => {
    const path = new URL(input).pathname
    if (/^\/lab\/[^/]+\.js$/.test(path)) return new Response(entrySource(path), { status: 200 })
    if (path === '/assets/engine-abc123.js') return new Response('export{}', { status: 200 })
    return new Response('Not found', { status: 404 })
  })
}

afterEach(() => vi.unstubAllGlobals())

describe('live library release', () => {
  it('derives app.js tags from the served entries and changes nothing else', async () => {
    fakeProduction()
    const release = await liveLibraryRelease({ appRoot: process.cwd(), origin })
    const source = readFileSync('public/lab/library_2/app.js', 'utf8')
    const stamped = release.files['lab/library_2/app.js']
    expect(stamped).not.toBe(source)
    expect(untag(stamped)).toBe(untag(source))
    expect(stamped).toContain(`/lab/library-2-assistant.js?v=${sha10(entrySource('/lab/library-2-assistant.js'))}'`)
    expect(release.files['lab/library_2/boot.js']).toContain('["/assets/engine-abc123.js"]')
    // A file with no chain to a built entry is served as committed.
    expect(release.files['lab/library_2/reviewed-introductions.js']).toBe(readFileSync('public/lab/library_2/reviewed-introductions.js', 'utf8'))
  }, 60_000)

  it('composes /library through the Worker from the stamped index.html', async () => {
    fakeProduction()
    const release = await liveLibraryRelease({ appRoot: process.cwd(), origin })
    const plain = await release.libraryPage('<html><head></head></html>')
    expect(plain).toContain('<link rel="icon" href="/brand/20260921/favicon.svg"')
    expect(plain).toContain(`app.js?v=${sha10(release.files['lab/library_2/app.js'])}"`)
    expect(plain).not.toContain('tinct-social')
    const social = await release.libraryPage('<meta name="tinct-social" content="1">')
    expect(social).toContain('<meta name="tinct-social" content="1"></head>')
    expect(social).not.toContain('tinct-friends')
  }, 60_000)
})
