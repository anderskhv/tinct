// Tinct Service Worker — offline caching for app shell, editions, and audio.
//
// Strategy:
//   - App shell:
//       Network-first for navigations with cached /app.html fallback. The
//       deployed dist/sw.js is stamped after build with the exact current
//       bundle/font URLs and a cache name derived from those URLs.
//   - Editions (/data/editions/*.json and /data/editions-chapters/*.json):
//       Stale-while-revalidate. Serve cached immediately for speed, but
//       always fetch in the background and replace the cached copy. Means
//       a corrupt or partial cached entry self-heals on the next load.
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

const APP_SHELL_PRECACHE_SET = new Set(APP_SHELL_PRECACHE_URLS)

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  const isSameOrigin = url.origin === self.location.origin
  if (isSameOrigin && isAppShellNavigation(event.request, url)) {
    event.respondWith(handleAppShellNavigation(event.request))
    return
  }

  if (isSameOrigin && APP_SHELL_PRECACHE_SET.has(url.pathname)) {
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
          if (response.ok) cache.put(event.request, response.clone())
          return response
        }).catch(() => offlineFallback())
      })
    )
  )
})

function isAppShellNavigation(request, url) {
  if (request.mode !== 'navigate') return false
  if (url.pathname === '/app' || url.pathname === '/app.html' || url.pathname === '/admin/metrics') return true
  if (url.pathname === '/read' || /^\/read\/[a-z0-9-]+\/?$/i.test(url.pathname)) return true
  return false
}

async function handleAppShellNavigation(request) {
  try {
    const response = await fetch(request)
    if (response.ok) return response
  } catch {
    // Fall back below.
  }

  const cache = await caches.open(APP_SHELL_CACHE_NAME)
  const cached = await cache.match('/app.html')
  if (cached) return cached
  return new Response('Offline', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

async function handlePrecachedAppAsset(request) {
  const cache = await caches.open(APP_SHELL_CACHE_NAME)
  const cached = await cache.match(new URL(request.url).pathname)
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
      const start = Math.min(range.start, size - 1)
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
      const cached = await cache.match(canonicalRequest)
      if (cached) return cached
      return offlineFallback()
    }
  }

  const cached = await cache.match(canonicalRequest)
  const networkPromise = fetch(canonicalRequest).then(response => {
    if (response.ok) {
      cache.put(canonicalRequest, response.clone()).catch(() => {})
    }
    return response
  }).catch(() => null)

  if (cached) {
    networkPromise.catch(() => {})
    return cached
  }

  const network = await networkPromise
  if (network) return network
  return offlineFallback()
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
    )
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
    if (response.ok) await cache.put(url, response)
  }))
}

// Listen for download requests from the main thread
self.addEventListener('message', (event) => {
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
