#!/usr/bin/env node
/**
 * Deploy guard for the fixed-name modules under /lab/ (run by
 * scripts/verify-bundle.cjs before every deploy):
 *
 * 1. Every module a served /lab/**.js or /assets/*.js imports exists in dist
 *    (static `from`, side-effect `import`, `import()`, `new URL(..., import.meta.url)`
 *    and Vite's preload lists). A missing chunk is the 15 Oct 2026 outage: a
 *    stale lab/library-add.js importing ownSwitcher-*.js that no longer existed.
 * 2. No dist file references a built entry (or a file on a chain to one) with
 *    a cache tag other than the one scripts/stamp-lab-entry-tags.cjs derives
 *    from the content.
 *
 * Usage: node scripts/check-lab-bundle.cjs [dist]
 */
const fs = require('fs')
const path = require('path')
const { readDist, staleTags } = require('./stamp-lab-entry-tags.cjs')

const SPECIFIERS = [
  /\bfrom\s*["']([^"'\n]+)["']/g,
  /\bimport\s*["']([^"'\n]+)["']/g,
  /\bimport\s*\(\s*["']([^"'\n]+)["']\s*\)/g,
  /\bnew\s+URL\(\s*["']([^"'\n]+)["']\s*,\s*import\.meta\.url\s*\)/g,
]
// Vite's dynamic-import preload list: paths relative to the site root.
const PRELOAD_LIST = /__vite__mapDeps=\(i,m=__vite__mapDeps,d=\(m\.f\|\|\(m\.f=\[([^\]]*)\]/g

/** The dist paths (no leading slash) a module's source imports. */
function moduleReferences(relPath, source) {
  const found = new Set()
  const add = (spec, base) => {
    if (!/^\.{0,2}\//.test(spec) || spec.startsWith('//')) return
    found.add(new URL(spec, 'https://tinct.app' + base).pathname.slice(1))
  }
  for (const pattern of SPECIFIERS) for (const m of source.matchAll(pattern)) add(m[1], '/' + relPath)
  for (const m of source.matchAll(PRELOAD_LIST)) {
    for (const item of m[1].matchAll(/["']([^"']+)["']/g)) add(item[1].startsWith('/') ? item[1] : '/' + item[1], '/')
  }
  return [...found].sort()
}

/** [{ file, missing }] for each module whose import names no file. `exists(distPath)` answers for a path. */
function missingImports(modules, exists) {
  const problems = []
  for (const name of Object.keys(modules).sort()) {
    for (const target of moduleReferences(name, modules[name])) {
      if (!exists(target)) problems.push({ file: name, missing: target })
    }
  }
  return problems
}

function servedModules(dist) {
  const modules = {}
  const add = rel => { modules[rel] = fs.readFileSync(path.join(dist, rel), 'utf8') }
  const walk = rel => {
    for (const entry of fs.readdirSync(path.join(dist, rel), { withFileTypes: true })) {
      const name = `${rel}/${entry.name}`
      if (entry.isDirectory()) walk(name)
      else if (/\.m?js$/.test(entry.name)) add(name)
    }
  }
  if (fs.existsSync(path.join(dist, 'lab'))) walk('lab')
  if (fs.existsSync(path.join(dist, 'assets'))) {
    for (const name of fs.readdirSync(path.join(dist, 'assets'))) if (/\.m?js$/.test(name)) add(`assets/${name}`)
  }
  return modules
}

/** Every problem in a built dist, as printable lines (empty when the bundle is sound). */
function checkDist(dist, publicDir) {
  const lines = []
  const exists = rel => {
    const file = path.join(dist, rel)
    return file.startsWith(dist + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()
  }
  for (const { file, missing } of missingImports(servedModules(dist), exists)) {
    lines.push(`/${file} imports /${missing}, which is not in dist`)
  }
  const { files, entries } = readDist(dist, publicDir)
  if (!entries.length) lines.push('no built entries found under dist/lab/')
  for (const { file, ref, tag, expected } of staleTags(files, entries)) {
    lines.push(`/${file} references ${ref}?v=${tag}; the built file's tag is ${expected}`)
  }
  return lines
}

module.exports = { moduleReferences, missingImports, checkDist }

if (require.main === module) {
  const root = path.resolve(__dirname, '..')
  const dist = path.resolve(process.argv[2] || path.join(root, 'dist'))
  const problems = checkDist(dist, path.join(root, 'public'))
  if (problems.length) {
    console.error('✗ lab bundle check failed:')
    for (const line of problems) console.error('  •', line)
    process.exit(1)
  }
  console.log('✓ lab bundle: every import exists and every entry tag matches its content')
}
