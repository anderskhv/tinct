import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { bridgeDependencies, stampBoot, staticImports, MARKER } = require('../scripts/stamp-library-bridge-preloads.cjs') as {
  bridgeDependencies: (read: (url: string) => string | null, entry?: string) => string[]
  stampBoot: (boot: string, deps: string[]) => string
  staticImports: (source: string, url: string) => string[]
  MARKER: string
}

const built: Record<string, string> = {
  '/lab/library-2-reading.js': 'import{a as b}from"../assets/labAuth-Dv0hYOe9.js";import"../assets/cloud-DKJncyOw.js";import{c}from"../assets/shared-index-DEwtTf7j.js";const x=()=>import("/lab/native-books.js");',
  '/assets/labAuth-Dv0hYOe9.js': 'import{s}from"./supabase-uUM7RQ8s.js";export*from"./authCookie-BLkU2oHV.js";',
  '/assets/cloud-DKJncyOw.js': 'import{s}from"./supabase-uUM7RQ8s.js";export const c=1',
  '/assets/shared-index-DEwtTf7j.js': 'export const c=2',
  '/assets/supabase-uUM7RQ8s.js': 'export const s=3',
  '/assets/authCookie-BLkU2oHV.js': 'export const a=4',
}

describe('stamp-library-bridge-preloads', () => {
  it('finds the static imports of built modules, resolved against the module itself', () => {
    expect(staticImports(built['/lab/library-2-reading.js'], '/lab/library-2-reading.js')).toEqual([
      '/assets/labAuth-Dv0hYOe9.js', '/assets/cloud-DKJncyOw.js', '/assets/shared-index-DEwtTf7j.js',
    ])
    expect(staticImports(built['/assets/labAuth-Dv0hYOe9.js'], '/assets/labAuth-Dv0hYOe9.js')).toEqual(['/assets/supabase-uUM7RQ8s.js', '/assets/authCookie-BLkU2oHV.js'])
  })
  it('lists the reading engine\'s bundles transitively, once each, sorted, without dynamic imports or the entry', () => {
    expect(bridgeDependencies(url => built[url] ?? null)).toEqual([
      '/assets/authCookie-BLkU2oHV.js', '/assets/cloud-DKJncyOw.js', '/assets/labAuth-Dv0hYOe9.js', '/assets/shared-index-DEwtTf7j.js', '/assets/supabase-uUM7RQ8s.js',
    ])
  })
  it('replaces the marker in boot.js with the list and refuses a boot.js without it', () => {
    const boot = `for(const dep of ${MARKER}){preload(dep)}`
    expect(stampBoot(boot, ['/assets/a-12345678.js'])).toBe('for(const dep of ["/assets/a-12345678.js"]){preload(dep)}')
    expect(() => stampBoot('nothing here', [])).toThrow(/marker/)
  })
  it('the source boot.js carries the marker exactly once, so the build can stamp it', async () => {
    const { readFileSync } = await import('node:fs')
    const boot = readFileSync(new URL('../public/lab/library_2/boot.js', import.meta.url), 'utf8')
    expect(boot.split(MARKER).length).toBe(2)
  })
})
