// Tinct Service Worker — offline caching for editions and audio.
//
// Strategy:
//   - Editions (/data/editions/*.json):
//       Stale-while-revalidate. Serve cached immediately for speed, but
//       always fetch in the background and replace the cached copy. Means
//       a corrupt or partial cached entry self-heals on the next load.
//       A request that includes the `fresh=1` query param skips the cache
//       entirely and forces a network fetch — used by the loader as an
//       explicit retry when it sees malformed data.
//   - Audio (R2): cache-first. Files are immutable per chapter.
//
// Cache version is bumped to v2 to evict any v1 entries that were poisoned
// under the previous cache-first-no-revalidate policy.
// Bump this version any time stale-cached HTML or JS is causing the
// browser to serve an old bundle after a deploy. The activation handler
// below deletes any cache whose name doesn't match CACHE_NAME, so a
// version bump aggressively wipes the old app.html (which references the
// old JS bundle hash) and forces a fresh fetch on next navigation.
const CACHE_NAME = 'tinct-offline-v3'

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  const isEdition = url.pathname.startsWith('/data/editions/')
  const isAudio = url.hostname.includes('r2.dev') || url.pathname.startsWith('/audio/')
  if (!isEdition && !isAudio) return

  if (isEdition) {
    const forceFresh = url.searchParams.get('fresh') === '1'
    event.respondWith(handleEdition(event.request, forceFresh))
    return
  }

  // Audio: cache-first
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
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
})

// Skip waiting — activate immediately
self.addEventListener('install', () => {
  self.skipWaiting()
})

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
