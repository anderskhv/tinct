#!/usr/bin/env node
/**
 * After `vite build`: the library's boot.js learns which bundles the reading
 * engine (/lab/library-2-reading.js) imports, so a returning reader's page
 * fetches them with the HTML instead of after the engine has been parsed.
 * A `<link rel=modulepreload>` fetches only the named module, never its
 * imports, so the engine's own bundles started one round trip late
 * (2026-10-10 measurement: 3.7 s to 4.4 s on 4G before the desk could read
 * its data).
 *
 * Replaces the `/*__BRIDGE_DEPS__*​/[]` marker in dist/lab/library_2/boot.js
 * with the sorted list of the engine's static imports (transitively, within
 * dist/). Pure functions are exported for the unit test; the stamp runs only
 * when this file is the entry.
 */
const fs = require('fs')
const path = require('path')

const BRIDGE_URL = '/lab/library-2-reading.js'
const MARKER = '/*__BRIDGE_DEPS__*/[]'
const IMPORT_RE = /\bimport\s*(?:[^'";]*?\bfrom\s*)?["']([^"']+)["']|\bexport\s*(?:\*|\{[^}]*\})\s*from\s*["']([^"']+)["']/g

/** Static import specifiers of one module's source, resolved to site paths. */
function staticImports(source, moduleUrl) {
  const found = []
  for (const match of source.matchAll(IMPORT_RE)) {
    const spec = match[1] || match[2]
    if (!spec || /^(?:https?:)?\/\//.test(spec)) continue
    const resolved = new URL(spec, 'https://tinct.app' + moduleUrl).pathname
    if (!found.includes(resolved)) found.push(resolved)
  }
  return found
}

/**
 * Every module the bridge imports, transitively, as site paths (sorted). `read`
 * returns a module's source for a site path, or null when it is not a built file.
 */
function bridgeDependencies(read, entry = BRIDGE_URL) {
  const seen = new Set()
  const visit = url => {
    const source = read(url)
    if (source == null) return
    for (const dep of staticImports(source, url)) {
      if (seen.has(dep) || dep === entry) continue
      seen.add(dep)
      visit(dep)
    }
  }
  visit(entry)
  return [...seen].sort()
}

function stampBoot(bootSource, deps) {
  if (!bootSource.includes(MARKER)) throw new Error('boot.js has no bridge-dependency marker')
  return bootSource.replace(MARKER, JSON.stringify(deps))
}

function main() {
  const dist = path.resolve(__dirname, '..', 'dist')
  const read = url => {
    const file = path.join(dist, url)
    return file.startsWith(dist + path.sep) && fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
  }
  const deps = bridgeDependencies(read)
  if (!deps.length) throw new Error(`No imports found for ${BRIDGE_URL}; was the library built?`)
  const bootPath = path.join(dist, 'lab', 'library_2', 'boot.js')
  fs.writeFileSync(bootPath, stampBoot(fs.readFileSync(bootPath, 'utf8'), deps))
  console.log(`Stamped ${deps.length} reading-engine bundles into lab/library_2/boot.js`)
}

module.exports = { BRIDGE_URL, MARKER, staticImports, bridgeDependencies, stampBoot }

if (require.main === module) main()
