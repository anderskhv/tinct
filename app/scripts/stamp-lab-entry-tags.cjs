#!/usr/bin/env node
/**
 * After `vite build` (and after every other step that edits dist/lab files):
 * the cache tags (`?v=`) on references to Vite's fixed-name entries under
 * /lab/ (lab/library-add.js, lab/library-2-reading.js, ...) are derived from
 * the emitted file's own content.
 *
 * Why: the Worker serves a tagged /lab/*.js for a day plus a week of
 * stale-while-revalidate (src/worker/lib/staticCache.ts). An entry imports
 * content-hashed chunks, which are gone after the next deploy. A hand-kept
 * tag that is not bumped when the entry is rebuilt keeps returning readers on
 * the old entry, whose imports then 404 (15 Oct 2026: the book switcher's
 * ownSwitcher-*.js and quickBookSwitcher-*.js).
 *
 * The tag of a built entry is the first 10 hex characters of the sha256 of the
 * emitted file. A cached static file that references an entry with a tag (for
 * example lab/library_2/add-to-tinct.js, which is itself tagged in
 * lab/library_2/app.js) changes when that tag changes, so its own tag is
 * derived from its new content too, up the chain to the pages (HTML is never
 * cached by tag and is only rewritten). Files that import each other with tags
 * share one tag, the hash of all of them. Files outside a chain to a built
 * entry keep their hand-kept tags; source files in public/ are never touched.
 *
 * Untagged references (`import('/lab/native-books.js')`, `<script
 * src="/lab/account-cards.js">`) are left untagged: an untagged fixed name
 * revalidates on every load, so it is never stale, and Vite's own chunks
 * import some entries by their plain name, which a tag would turn into a
 * second module instance.
 *
 * Add a book's pages and scripts (public/lab/addbook) carry no hand tags: every
 * `?v=` there is the literal `?v=__TINCT_BUILD__`, which the first pass below
 * replaces in every html and js file under dist/lab/addbook with the build's bundle hash (the
 * `index-*.js` hash the deploy job records), so the Worker's day cache busts on
 * every deploy. The dev server and the tests read public/ directly and request
 * the literal placeholder, which the Worker and Vite serve like any tag.
 * scripts/verify-bundle.cjs fails if a placeholder is left in dist.
 *
 * Pure functions are exported for the unit tests and for
 * scripts/verify-bundle.cjs; the stamp runs only when this file is the entry.
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Mirrors TAGGED_CODE in src/worker/lib/staticCache.ts: the files a tag caches.
const TAG_CACHED = /^(?:lab|omarchy)\/[\w\-./]+\.(?:js|css)$/
const TEXT_FILE = /\.(?:js|mjs|css|html)$/
// A quoted reference with a cache tag: 'x.js?v=tag', "/lab/x.css?v=tag".
const TAGGED_REF = /(["'`])([^"'`\s<>()?#]+\.(?:js|css))\?v=([\w.-]*)\1/g
const PLACEHOLDER = '__TINCT_TAG__'
// Add a book's one build stamp (public/lab/addbook), replaced in dist by stampBuild.
const BUILD_PLACEHOLDER = '__TINCT_BUILD__'
const BUILD_STAMPED = /^lab\/addbook\/.+\.(?:html|js)$/

function sha10(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 10)
}

function baseOf(relPath, source) {
  const site = '/' + relPath
  if (relPath.endsWith('.html')) {
    const base = source.match(/<base\s[^>]*href=["']([^"']+)["']/i)
    if (base) return new URL(base[1], 'https://tinct.app' + site).pathname
  }
  return site
}

/** The dist path (no leading slash) a reference names, or null when it is not a local file reference. */
function resolveRef(spec, relPath, base) {
  if (/^[a-z][\w+.-]*:/i.test(spec) || spec.startsWith('//')) return null
  // A module's bare string is text, not a URL (only HTML and CSS resolve bare names).
  if (!relPath.endsWith('.html') && !relPath.endsWith('.css') && !/^\.{0,2}\//.test(spec)) return null
  return new URL(spec, 'https://tinct.app' + base).pathname.slice(1)
}

/** Each tagged reference in a file, resolved: { start, end, quote, spec, tag, target }. */
function taggedRefs(relPath, source) {
  const base = baseOf(relPath, source)
  const refs = []
  for (const m of source.matchAll(TAGGED_REF)) {
    const target = resolveRef(m[2], relPath, base)
    if (target) refs.push({ start: m.index, end: m.index + m[0].length, quote: m[1], spec: m[2], tag: m[3], target })
  }
  return refs
}

function rewrite(relPath, source, tagFor) {
  let out = ''
  let at = 0
  for (const ref of taggedRefs(relPath, source)) {
    const tag = tagFor(ref.target)
    if (tag == null) continue
    out += source.slice(at, ref.start) + `${ref.quote}${ref.spec}?v=${tag}${ref.quote}`
    at = ref.end
  }
  return out + source.slice(at)
}

/**
 * The stamped dist. `files` maps a dist path (no leading slash) to its text;
 * `entries` lists the built fixed-name entries. Returns { files, tags }, where
 * files holds the new text of every file and tags each derived tag.
 */
function stampTags(files, entries) {
  const names = Object.keys(files).sort()
  const out = { ...files }
  const edges = new Map(names.map(name => [name, [...new Set(taggedRefs(name, files[name]).map(r => r.target).filter(t => t in files))]]))

  // The files whose tag must follow content: the entries and every tag-cached file with a tagged chain to one.
  const targets = new Set(entries.filter(name => name in files))
  for (let grew = true; grew;) {
    grew = false
    for (const name of names) {
      if (targets.has(name) || !TAG_CACHED.test(name)) continue
      if (edges.get(name).some(t => targets.has(t))) { targets.add(name); grew = true }
    }
  }

  // Tarjan's strongly connected components over the targets; each component
  // is emitted after every component it references, so its tags are final.
  const tags = {}
  const index = new Map(), low = new Map(), stack = [], onStack = new Set()
  let counter = 0
  const finish = component => {
    const members = new Set(component)
    for (const name of component) out[name] = rewrite(name, out[name], t => members.has(t) ? PLACEHOLDER : tags[t])
    const selfRef = component.length === 1 && edges.get(component[0]).includes(component[0])
    const tag = component.length === 1 && !selfRef
      ? sha10(out[component[0]])
      : sha10([...component].sort().map(name => `${name}\0${out[name]}`).join('\0'))
    for (const name of component) tags[name] = tag
    for (const name of component) out[name] = out[name].split(PLACEHOLDER).join(tag)
  }
  const visit = name => {
    index.set(name, counter); low.set(name, counter); counter++
    stack.push(name); onStack.add(name)
    for (const next of edges.get(name)) {
      if (!targets.has(next)) continue
      if (!index.has(next)) { visit(next); low.set(name, Math.min(low.get(name), low.get(next))) }
      else if (onStack.has(next)) low.set(name, Math.min(low.get(name), index.get(next)))
    }
    if (low.get(name) === index.get(name)) {
      const component = []
      let member
      do { member = stack.pop(); onStack.delete(member); component.push(member) } while (member !== name)
      finish(component)
    }
  }
  for (const name of names) if (targets.has(name) && !index.has(name)) visit(name)

  // Every other file (the pages, sw.js, ...) only takes the new tags.
  for (const name of names) if (!targets.has(name)) out[name] = rewrite(name, out[name], t => tags[t])
  return { files: out, tags }
}

/** References in `files` whose tag is not the one stampTags derives: [{ file, ref, tag, expected }]. */
function staleTags(files, entries) {
  const { files: stamped, tags } = stampTags(files, entries)
  const stale = []
  for (const name of Object.keys(files).sort()) {
    if (stamped[name] === files[name]) continue
    for (const ref of taggedRefs(name, files[name])) {
      if (ref.target in tags && ref.tag !== tags[ref.target]) stale.push({ file: name, ref: ref.spec, tag: ref.tag, expected: tags[ref.target] })
    }
  }
  return stale
}

function walk(dir, rel = '') {
  const found = []
  for (const entry of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const name = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) found.push(...walk(dir, name))
    else found.push(name)
  }
  return found
}

/** dist's text files outside assets/ (Vite's hashed chunks never carry tags) and the built entries under lab/. */
function readDist(dist, publicDir) {
  const all = walk(dist)
  const files = {}
  for (const name of all) if (TEXT_FILE.test(name) && !name.startsWith('assets/')) files[name] = fs.readFileSync(path.join(dist, name), 'utf8')
  // A fixed-name lab/*.js with no file in public/ is one of Vite's entries (vite.config.ts entryFileNames).
  const entries = all.filter(name => /^lab\/[^/]+\.js$/.test(name) && !fs.existsSync(path.join(publicDir, name))).sort()
  return { files, entries }
}

/** The build's bundle hash: the hash part of the `/assets/index-<hash>.js` app.html loads. */
function bundleHash(appHtml) {
  const m = String(appHtml || '').match(/\/assets\/index-([A-Za-z0-9_-]+)\.js/)
  return m ? m[1] : null
}

/**
 * Add a book's files with `__TINCT_BUILD__` replaced by `stamp`. Runs before
 * stampTags, so a reference on a chain to a built entry (reader.js's
 * /lab/library-add.js) still takes its content-derived tag.
 */
function stampBuild(files, stamp) {
  if (!/^[\w.-]+$/.test(stamp || '')) throw new Error(`Not a cache tag: ${stamp}`)
  const out = { ...files }
  const stamped = []
  for (const name of Object.keys(files).sort()) {
    if (!BUILD_STAMPED.test(name) || !files[name].includes(BUILD_PLACEHOLDER)) continue
    out[name] = files[name].split(BUILD_PLACEHOLDER).join(stamp)
    stamped.push(name)
  }
  return { files: out, stamped }
}

function main() {
  const root = path.resolve(__dirname, '..')
  const dist = path.join(root, 'dist')
  const { files, entries } = readDist(dist, path.join(root, 'public'))
  if (!entries.includes('lab/library-add.js')) throw new Error(`No built lab entries found in ${dist}; was the app built?`)
  const stamp = bundleHash(files['app.html'])
  if (!stamp) throw new Error(`No /assets/index-*.js in ${path.join(dist, 'app.html')}; was the app built?`)
  const build = stampBuild(files, stamp)
  const { files: stamped, tags } = stampTags(build.files, entries)
  let changed = 0
  for (const name of Object.keys(files)) {
    if (stamped[name] === files[name]) continue
    fs.writeFileSync(path.join(dist, name), stamped[name])
    changed++
  }
  const derived = Object.keys(tags).filter(name => !entries.includes(name))
  console.log(`[lab tags] build stamp ${stamp} in ${build.stamped.length} Add a book files; ${entries.length} built entries, ${derived.length} files on a chain to one, ${changed} files rewritten`)
}

module.exports = { stampTags, staleTags, taggedRefs, readDist, sha10, stampBuild, bundleHash, BUILD_PLACEHOLDER }

if (require.main === module) main()
