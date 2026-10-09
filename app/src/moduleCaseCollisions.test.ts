import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// macOS and Windows disks ignore case. Vite tries extensions in this order,
// so an extensionless `./LabTalkSpeed` found labTalkSpeed.ts there while
// Linux found LabTalkSpeed.tsx, and the macOS build failed (#374).
const EXTENSIONS = ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
const SOURCE = /\.(ts|tsx)$/
const IMPORT = /(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : sources(path)
    return SOURCE.test(name) ? [path] : []
  })
}

const listing = new Map<string, string[]>()
function filesIn(dir: string): string[] {
  if (!listing.has(dir)) {
    try { listing.set(dir, readdirSync(dir)) } catch { listing.set(dir, []) }
  }
  return listing.get(dir)!
}

/** The file an extensionless import resolves to, matching names exactly or ignoring case. */
function resolveImport(base: string, ignoreCase: boolean): string | null {
  const dir = dirname(base)
  const stem = base.slice(dir.length + 1)
  const names = filesIn(dir)
  for (const ext of EXTENSIONS) {
    const want = stem + ext
    const hit = names.find(name => ignoreCase ? name.toLowerCase() === want.toLowerCase() : name === want)
    if (hit) return join(dir, hit)
  }
  return null
}

describe('relative imports', () => {
  it('resolve to the same file on case-insensitive disks', () => {
    const root = __dirname
    const wrong: string[] = []
    for (const file of sources(root)) {
      for (const match of readFileSync(file, 'utf8').matchAll(IMPORT)) {
        const spec = match[1]
        if (/\.[a-z]+$/i.test(spec.split('/').pop() ?? '')) continue
        const base = resolve(dirname(file), spec)
        const exact = resolveImport(base, false)
        const loose = resolveImport(base, true)
        if (exact && loose && exact !== loose) wrong.push(`${relative(root, file)}: '${spec}' → ${relative(root, loose)} instead of ${relative(root, exact)}`)
      }
    }
    expect(wrong).toEqual([])
  })
})
