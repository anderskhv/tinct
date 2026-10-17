// Tinct Service Worker — offline caching for app shell, editions, and audio.
//
// Strategy:
//   - App shell:
//       Network-first for /reader navigations; the cached /reader page is used
//       only when the network request itself fails (offline). Redirects,
//       404s and 5xx responses always pass through. The
//       deployed dist/sw.js is stamped after build with the exact current
//       bundle/font URLs and a cache name derived from those URLs.
//   - Editions (/data/editions/*.json and /data/editions-chapters/*.json):
//       Stale-while-revalidate. Serve cached immediately for speed, but
//       always fetch in the background and replace the cached copy. Means
//       a corrupt or partial cached entry self-heals on the next load.
//       Offline, a file cached under another build's ?v= answers too.
//       A request that includes the `fresh=1` query param skips the cache
//       entirely and forces a network fetch — used by the loader as an
//       explicit retry when it sees malformed data.
//   - Audio (Worker): cache-first. Files are immutable per chapter.
//
// Cache version is bumped to v2 to evict any v1 entries that were poisoned
// under the previous cache-first-no-revalidate policy.
// Bump this version any time stale-cached HTML or JS is causing the
// browser to serve an old bundle after a deploy. The activation handler
// below deletes any cache whose name doesn't match CACHE_NAME, so a
// version bump aggressively wipes the old app.html (which references the
// old JS bundle hash) and forces a fresh fetch on next navigation.
const CACHE_NAME = 'tinct-offline-v3'
const APP_SHELL_CACHE_NAME = 'tinct-app-shell-dev'
const APP_SHELL_PRECACHE_URLS = []
// Bundles the reader imports only on demand (stamped like the list above).
// Fetched at install after the list above, and again (any missing) whenever a
// book is saved for offline reading (CACHE_APP_SHELL below).
const APP_SHELL_LAZY_URLS = []

const APP_SHELL_PRECACHE_SET = new Set([...APP_SHELL_PRECACHE_URLS, ...APP_SHELL_LAZY_URLS])
// The page an offline /reader load is answered with. It is the reader page
// itself, cached at install: /app.html is redirected by the Worker (to /app,
// then the library), so a copy cached under that name was the library page and
// carried redirected=true, which browsers refuse as a navigation response.
const READER_SHELL_URL = '/reader'

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  const isSameOrigin = url.origin === self.location.origin
  if (isSameOrigin && isAppShellNavigation(event.request, url)) {
    event.respondWith(handleAppShellNavigation(event.request))
    return
  }

  if (isSameOrigin && isLibraryNavigation(event.request, url)) {
    event.respondWith(handleLibraryNavigation(event.request))
    return
  }

  if (isSameOrigin && APP_SHELL_PRECACHE_SET.has(url.pathname) && url.pathname !== READER_SHELL_URL) {
    event.respondWith(handlePrecachedAppAsset(event.request))
    return
  }

  const isEdition = url.pathname.startsWith('/data/editions/') || url.pathname.startsWith('/data/editions-chapters/')
  const isAudio = url.pathname.startsWith('/api/audio-file') || url.pathname.startsWith('/api/audio-manifest')
  if (!isEdition && !isAudio) return

  if (isEdition) {
    const forceFresh = url.searchParams.get('fresh') === '1'
    event.respondWith(handleEdition(event.request, forceFresh))
    return
  }

  // Manifests and word timings can be repaired or regenerated independently
  // from immutable MP3s. A cache-first response here left long-lived iPhones
  // pinned to stale timing JSON, so a refresh still showed paragraph fallback.
  // Prefer the network for this small metadata and retain cache only for true
  // offline use.
  const audioPath = url.searchParams.get('path') || ''
  const isAudioMetadata = url.pathname.startsWith('/api/audio-manifest') || audioPath.endsWith('.json')
  if (isAudioMetadata) {
    event.respondWith(handleAudioMetadata(event.request))
    return
  }

  // Audio: cache-first. Mobile media elements often request MP3s with byte
  // ranges; when a full file is cached, satisfy those ranges locally instead
  // of bypassing the cache and streaming over the network.
  if (event.request.headers.has('range')) {
    event.respondWith(handleAudioRange(event.request, event))
    return
  }
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached
        return fetch(event.request).then(response => {
          if (response.status === 200) event.waitUntil(cache.put(event.request, response.clone()).catch(() => {}))
          return response
        }).catch(() => offlineFallback())
      })
    )
  )
})

async function handleAudioMetadata(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const fresh = await fetch(request, { cache: 'no-store' })
    if (fresh.ok) await cache.put(request, fresh.clone())
    return fresh
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return offlineFallback()
  }
}

function isAppShellNavigation(request, url) {
  if (request.mode !== 'navigate') return false
  if (url.pathname === '/reader') return true
  if (url.pathname === '/admin/metrics') return true
  return false
}

// The library and the home page need the network. Offline, they send the
// reader to the cached reader page, which opens the book last read at its
// saved place. A library ?book= link is not carried over: /reader?book=bible
// opens Genesis 1 until the cloud record answers, which it cannot offline.
function isLibraryNavigation(request, url) {
  if (request.mode !== 'navigate') return false
  return url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/library' || url.pathname === '/library/'
}

async function handleLibraryNavigation(request) {
  try {
    return await fetch(request)
  } catch {
    // Offline: fall back below.
  }
  const cache = await caches.open(APP_SHELL_CACHE_NAME)
  if (!(await cache.match(READER_SHELL_URL))) {
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
  const target = READER_SHELL_URL
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<meta http-equiv="refresh" content="0;url=' + target + '"><script>location.replace(' + JSON.stringify(target) + ')</script>',
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  )
}

async function handleAppShellNavigation(request) {
  // Any answer from the server is the answer: a redirect (navigations use
  // redirect:'manual', so it arrives as an opaqueredirect with ok === false),
  // a 404 or a 5xx must reach the browser untouched. Only a network failure
  // (fetch throws) means the reader is genuinely offline and gets the shell.
  try {
    return await fetch(request)
  } catch {
    // Offline: fall back below.
  }

  const cache = await caches.open(APP_SHELL_CACHE_NAME)
  const cached = await cache.match(READER_SHELL_URL)
  if (cached) return unredirected(cached)
  return new Response('Offline', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

// A content-hashed file never changes, so the cached copy is always right.
// A fixed-name module (/lab/native-books.js) changes with every build, and the
// hashed bundles import it by minified export names: a cached copy from an
// older build made those imports fail ("Your shelves could not load", a
// reader that never starts). Fixed names are network-first; the cache is the
// offline fallback.
const CONTENT_HASHED = /-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2)$/

async function handlePrecachedAppAsset(request) {
  const cache = await caches.open(APP_SHELL_CACHE_NAME)
  const path = new URL(request.url).pathname
  if (!CONTENT_HASHED.test(path) && path.endsWith('.js')) {
    try {
      const response = await fetch(request)
      if (response.ok) await cache.put(path, response.clone())
      return response
    } catch {
      const offline = await cache.match(path)
      if (offline) return offline
      throw new Error('offline')
    }
  }
  const cached = await cache.match(path)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) await cache.put(new URL(request.url).pathname, response.clone())
  return response
}

async function handleAudioRange(request, event) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request.url)
  if (cached && cached.ok) {
    const buffer = await cached.arrayBuffer()
    const range = parseRange(request.headers.get('range'), buffer.byteLength)
    if (range) {
      const size = buffer.byteLength
      if (range.start >= size) return new Response(null, {status:416, headers:{'Content-Range':`bytes */${size}`}})
      const start = range.start
      const end = Math.min(range.end, size - 1)
      if (start <= end) {
        return new Response(buffer.slice(start, end + 1), {
          status: 206,
          headers: {
            'Content-Type': cached.headers.get('Content-Type') || 'audio/mpeg',
            'Content-Length': String(end - start + 1),
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
          },
        })
      }
    }
  }

  const network = fetch(request)
  event.waitUntil(warmAudioCache(request.url))
  return network.catch(() => offlineFallback())
}

function warmAudioCache(url) {
  return caches.open(CACHE_NAME).then(cache =>
    cache.match(url).then(cached => {
      if (cached) return
      return fetch(url).then(response => {
        if (response.ok) return cache.put(url, response)
      })
    })
  ).catch(() => {})
}

function parseRange(rangeHeader, fallbackSize) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader || '')
  if (!match) return null
  const startRaw = match[1]
  const endRaw = match[2]
  if (!startRaw && !endRaw) return null

  if (!startRaw) {
    const suffix = Number(endRaw)
    if (!Number.isFinite(suffix) || suffix <= 0 || fallbackSize <= 0) return null
    return { start: Math.max(0, fallbackSize - suffix), end: fallbackSize - 1 }
  }

  const start = Number(startRaw)
  const end = endRaw ? Number(endRaw) : Number.MAX_SAFE_INTEGER
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start) return null
  return { start, end }
}

async function handleEdition(request, forceFresh) {
  const cache = await caches.open(CACHE_NAME)

  // Strip the cache-busting query so we cache by the canonical URL.
  const canonicalUrl = new URL(request.url)
  canonicalUrl.searchParams.delete('fresh')
  const canonicalRequest = new Request(canonicalUrl.toString(), { method: 'GET' })

  if (forceFresh) {
    try {
      const fresh = await fetch(canonicalUrl.toString(), { cache: 'no-store' })
      if (fresh.ok) await cache.put(canonicalRequest, fresh.clone())
      return fresh
    } catch {
      const cached = await cache.match(canonicalRequest) || await cache.match(canonicalRequest, { ignoreSearch: true })
      if (cached) return cached
      return offlineFallback()
    }
  }

  const cached = await cache.match(canonicalRequest)
  const networkPromise = fetch(canonicalRequest).then(response => {
    if (response.ok) {
      const stored = cache.put(canonicalRequest, response.clone())
      // First request under this build's ?v=: the copies earlier builds left go.
      const tidied = cached ? stored : stored.then(() => dropOtherVersions(cache, canonicalRequest))
      tidied.catch(() => {})
    }
    return response
  }).catch(() => null)

  if (cached) {
    networkPromise.catch(() => {})
    return cached
  }

  const network = await networkPromise
  if (network) return network
  // Offline, and nothing under this ?v=: a deploy changed the build version
  // since the book was saved (every build stamps a new one). The copy saved
  // under the earlier version is the same file, almost always the same text.
  const anyVersion = await cache.match(canonicalRequest, { ignoreSearch: true })
  if (anyVersion) return anyVersion
  return offlineFallback()
}

async function dropOtherVersions(cache, request) {
  const variants = await cache.keys(request, { ignoreSearch: true })
  await Promise.all(variants.filter(variant => variant.url !== request.url).map(variant => cache.delete(variant)))
}

function offlineFallback() {
  return new Response(
    JSON.stringify({ error: 'offline', message: 'This content is not available offline' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } },
  )
}

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== APP_SHELL_CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Skip waiting — activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(precacheAppShell())
})

async function precacheAppShell() {
  if (!APP_SHELL_PRECACHE_URLS.length) return
  const cache = await caches.open(APP_SHELL_CACHE_NAME)
  await Promise.allSettled(APP_SHELL_PRECACHE_URLS.map(async (url) => {
    const response = await fetch(url, { cache: 'no-store' })
    if (response.ok) await cache.put(url, await unredirected(response))
  }))
  // Every book a reader opens is saved for offline reading in the background
  // (src/lab/labOfflineBook.ts), so the bundles it opens on demand (Contents,
  // the sheets) are part of the shell too: a deploy must not leave a flight-mode
  // reader with a reader page whose Contents cannot load. They are small.
  await Promise.allSettled(APP_SHELL_LAZY_URLS.map(async (url) => {
    const response = await fetch(url, { cache: 'no-store' })
    if (response.ok) await cache.put(url, await unredirected(response))
  }))
}

async function cacheWholeAppShell() {
  const cache = await caches.open(APP_SHELL_CACHE_NAME)
  const urls = [...APP_SHELL_PRECACHE_URLS, ...APP_SHELL_LAZY_URLS]
  const results = await Promise.allSettled(urls.map(async (url) => {
    // Hashed files never change; the page and fixed-name modules are refreshed.
    if (url !== READER_SHELL_URL && CONTENT_HASHED.test(url) && await cache.match(url)) return
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error(url)
    await cache.put(url, await unredirected(response))
  }))
  if (!(await cache.match(READER_SHELL_URL))) return false
  return results.every(result => result.status === 'fulfilled')
}

// A response that arrived through a redirect cannot answer a navigation
// (browsers fail the load with ERR_FAILED). Same body and headers, no flag.
async function unredirected(response) {
  if (!response.redirected) return response
  return new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers: response.headers })
}

// Listen for download requests from the main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

  // "Make available offline": the reader page, every bundle (lazy ones too)
  // and the fonts, answered on the message port once all are in the cache.
  if (event.data?.type === 'CACHE_APP_SHELL') {
    const port = event.ports && event.ports[0]
    event.waitUntil(cacheWholeAppShell().then(
      ok => port && port.postMessage({ ok }),
      () => port && port.postMessage({ ok: false }),
    ))
    return
  }

  if (event.data?.type === 'CACHE_URLS') {
    const urls = event.data.urls
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache =>
        Promise.allSettled(
          urls.map(url =>
            cache.match(url).then(existing => {
              if (existing) return // Already cached
              return fetch(url).then(response => {
                if (response.ok) cache.put(url, response)
              })
            })
          )
        ).then(results => {
          const succeeded = results.filter(r => r.status === 'fulfilled').length
          // Notify main thread of completion
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'CACHE_COMPLETE',
                total: urls.length,
                succeeded,
                requestId: event.data.requestId,
              })
            })
          })
        })
      )
    )
  }

  if (event.data?.type === 'DELETE_CACHE') {
    const urlPrefix = event.data.urlPrefix
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache =>
        cache.keys().then(requests =>
          Promise.all(
            requests
              .filter(req => req.url.includes(urlPrefix))
              .map(req => cache.delete(req))
          )
        )
      ).then(() => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'DELETE_COMPLETE',
              urlPrefix,
              requestId: event.data.requestId,
            })
          })
        })
      })
    )
  }

  if (event.data?.type === 'CHECK_CACHED') {
    const url = event.data.url
    caches.open(CACHE_NAME).then(cache =>
      cache.match(url).then(response => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_CHECK_RESULT',
              url,
              cached: !!response,
              requestId: event.data.requestId,
            })
          })
        })
      })
    )
  }

  if (event.data?.type === 'GET_CACHE_SIZE') {
    caches.open(CACHE_NAME).then(cache =>
      cache.keys().then(async requests => {
        let totalSize = 0
        for (const req of requests) {
          const res = await cache.match(req)
          if (res) {
            const blob = await res.clone().blob()
            totalSize += blob.size
          }
        }
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_SIZE_RESULT',
              sizeBytes: totalSize,
              fileCount: requests.length,
              requestId: event.data.requestId,
            })
          })
        })
      })
    )
  }
})
