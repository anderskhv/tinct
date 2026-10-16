/**
 * The bytes production must serve for the library's reviewed files, derived
 * from this checkout the way `npm run build` and the Worker derive them.
 *
 * Production does not serve public/lab/library_2/ byte for byte:
 * - scripts/stamp-library-bridge-preloads.cjs writes the reading engine's
 *   bundles into boot.js, and scripts/stamp-lab-entry-tags.cjs (#449, 15 Oct
 *   2026) replaces the `?v=` tags on every file with a tagged chain to a built
 *   /lab entry (app.js, catalogue.js, ...) with tags taken from content;
 * - index.html is answered only at /library (the asset URL is a 308 since
 *   #261, 30 Sep 2026), composed by the Worker (routes/seo.ts) and, while
 *   profiles are on, marked by routes/socialPages.ts.
 *
 * Vite builds are not reproducible (__BUILD_VERSION__ is the build time), so
 * the built entries and the reading engine's bundles are read from production
 * and every other input comes from this checkout. The stamps and the Worker
 * route are the repository's own code, so a reviewed file that differs from
 * the release in anything but those derived parts still fails.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { stampTags, taggedRefs } = require('../stamp-lab-entry-tags.cjs')
const { BRIDGE_URL, staticImports, bridgeDependencies, stampBoot } = require('../stamp-library-bridge-preloads.cjs')

const TEXT_FILE = /\.(?:js|mjs|css|html)$/
const BUILT_ENTRY = /^lab\/[^/]+\.js$/

function walk(dir, rel = '') {
  return fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap(entry => {
    const name = rel ? `${rel}/${entry.name}` : entry.name
    return entry.isDirectory() ? walk(dir, name) : [name]
  })
}

async function fetchText(origin, sitePath) {
  // The query keeps a shared cache from answering with an older deploy's copy.
  const response = await fetch(`${origin}${sitePath}?release=${Date.now()}`)
  return response.status === 200 ? response.text() : null
}

/** The Worker's page code, bundled in memory (as other checks bundle src/ with esbuild). */
async function workerPages(appRoot) {
  const { build } = await import('esbuild')
  const result = await build({
    stdin: {
      contents: [
        "export { handleSeoAndStaticRequest } from './src/worker/routes/seo.ts'",
        "export { withSocialMarkers, SOCIAL_META } from './src/worker/routes/socialPages.ts'",
        "export { FRIENDS_META } from './src/worker/routes/social.ts'",
      ].join('\n'),
      resolveDir: appRoot,
      loader: 'ts',
    },
    bundle: true,
    platform: 'neutral',
    format: 'esm',
    mainFields: ['module', 'main'],
    // The share-card renderer's WebAssembly is never reached from a page route.
    loader: { '.wasm': 'empty' },
    write: false,
    logLevel: 'error',
  })
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'))
}

/**
 * { files, libraryPage }: `files` maps a dist path (lab/library_2/app.js) to
 * the text production must serve for it, for every public text file the build
 * stamps; `libraryPage(live)` returns the HTML /library must serve, given the
 * live page (only to read which Worker switches are on).
 */
export async function liveLibraryRelease({ appRoot, origin }) {
  const publicDir = path.join(appRoot, 'public')
  const files = {}
  for (const name of walk(publicDir)) {
    if (TEXT_FILE.test(name) && !name.startsWith('assets/')) files[name] = fs.readFileSync(path.join(publicDir, name), 'utf8')
  }

  // Vite's fixed-name entries: lab/*.js with no file in public/, as readDist finds them in dist.
  const entries = new Set([BRIDGE_URL.slice(1)])
  for (const [name, source] of Object.entries(files)) {
    for (const ref of taggedRefs(name, source)) if (BUILT_ENTRY.test(ref.target) && !(ref.target in files)) entries.add(ref.target)
  }
  for (const entry of entries) {
    const text = await fetchText(origin, '/' + entry)
    if (text == null) throw new Error(`${origin}/${entry} is not served`)
    files[entry] = text
  }

  // boot.js: the reading engine's static imports, transitively, from production.
  const built = new Map()
  const crawl = async url => {
    if (built.has(url)) return
    const text = url === BRIDGE_URL ? files[BRIDGE_URL.slice(1)] : await fetchText(origin, url)
    built.set(url, text)
    if (text != null) for (const dep of staticImports(text, url)) await crawl(dep)
  }
  await crawl(BRIDGE_URL)
  const boot = 'lab/library_2/boot.js'
  files[boot] = stampBoot(files[boot], bridgeDependencies(url => built.get(url) ?? null))

  const { files: stamped } = stampTags(files, [...entries])

  const pages = await workerPages(appRoot)
  async function libraryPage(live) {
    const assets = {
      fetch: async request => new URL(request.url).pathname === '/lab/library_2/'
        ? new Response(stamped['lab/library_2/index.html'], { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        : new Response('Not found', { status: 404 }),
    }
    const request = new Request(`${origin}/library`)
    const ctx = { waitUntil() {}, passThroughOnException() {} }
    let page = await pages.handleSeoAndStaticRequest(request, { ASSETS: assets }, ctx)
    // SOCIAL_PROFILES / SOCIAL_FRIENDS are Worker settings, not files: follow production's.
    if (live.includes(pages.SOCIAL_META)) page = await pages.withSocialMarkers(page, request, live.includes(pages.FRIENDS_META) ? pages.FRIENDS_META : '')
    if (page.status !== 200) throw new Error(`/library composed from this checkout answered ${page.status}`)
    return page.text()
  }

  return { files: stamped, libraryPage }
}
