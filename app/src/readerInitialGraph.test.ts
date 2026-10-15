import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The reader's first page downloads only what that page needs (15 Oct 2026,
// cold open on a slow phone). This walks the static imports from the reader
// entry (src/main.tsx) the way the bundler does: `import()` starts a chunk of
// its own, and type-only imports vanish. Anything listed below is reached only
// through `import()`, so it is not in the first page's module graph (nor in the
// reader HTML's modulepreloads, which list exactly that graph).

const app = resolve(__dirname, '..')
const EXTENSIONS = ['', '.ts', '.tsx', '.js', '.mjs', '.json', '/index.ts', '/index.tsx', '/index.js']

function resolveImport(from: string, spec: string): string | null {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return null // a package
  const clean = spec.replace(/\?.*$/, '')
  const base = clean.startsWith('/') ? resolve(app, 'public', `.${clean}`) : resolve(dirname(from), clean)
  for (const extension of EXTENSIONS) {
    const file = base + extension
    if (existsSync(file) && !file.endsWith('/')) {
      try { readFileSync(file); return file } catch { /* a directory */ }
    }
  }
  return null
}

/** Value imports of one module: no `import type`, no all-`type` specifier lists, no `import()`. */
function staticImports(source: string): string[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const found: string[] = []
  const clause = /(^|[;\n])\s*(import|export)\s+(?!type\b)((?:(?!\b(?:import|export)\b)[^'";])*?)\s*from\s*['"]([^'"]+)['"]/g
  for (const match of code.matchAll(clause)) {
    const names = match[3].trim()
    if (match[2] === 'export' && !/^(\*|\{)/.test(names)) continue
    const braced = /^\{([\s\S]*)\}$/.exec(names)
    if (braced && braced[1].split(',').map(name => name.trim()).filter(Boolean).every(name => name.startsWith('type '))) continue
    found.push(match[4])
  }
  for (const match of code.matchAll(/(^|[;\n])\s*import\s*['"]([^'"]+)['"]/g)) found.push(match[2])
  return found
}

function initialGraph(entry: string): Set<string> {
  const seen = new Set<string>()
  const visit = (file: string) => {
    if (seen.has(file)) return
    seen.add(file)
    if (!/\.(tsx?|m?js)$/.test(file)) return
    for (const spec of staticImports(readFileSync(file, 'utf8'))) {
      const target = resolveImport(file, spec)
      if (target) visit(target)
    }
  }
  visit(entry)
  return new Set([...seen].map(file => relative(app, file)))
}

describe('the reader entry’s first-page module graph', () => {
  const graph = initialGraph(resolve(app, 'src/main.tsx'))

  it('is walked through the reader itself', () => {
    expect(graph.has('src/lab/LabApp.tsx')).toBe(true)
    expect(graph.has('src/lab/LabNativePaginator.tsx')).toBe(true)
    expect(graph.has('src/hooks/useVoiceSession.ts')).toBe(true)
  })

  it('leaves out Talk’s session code: it loads when Talk is used', () => {
    expect(graph.has('src/voice/GrokVoiceSessionController.ts')).toBe(false)
  })

  it('leaves out the Symposium coordinate map: it loads for a reader with Symposium data to move', () => {
    expect(graph.has('src/data/symposiumCoordinateMap.json')).toBe(false)
  })

  it('leaves out the account cards’ views and the metrics dashboard', () => {
    expect(graph.has('src/cards/openCards.ts')).toBe(false)
    expect(graph.has('src/cards/cardViews.ts')).toBe(false)
    expect(graph.has('src/AdminApp.tsx')).toBe(false)
    expect(graph.has('src/components/AdminMetricsDashboard.tsx')).toBe(false)
  })
})
