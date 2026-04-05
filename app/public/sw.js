// Tinct Service Worker — offline caching for editions and audio
const CACHE_NAME = 'tinct-offline-v1'

// Cache-first for edition data and audio files
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only intercept edition data and audio requests
  const isEdition = url.pathname.startsWith('/data/editions/')
  const isAudio = url.hostname.includes('r2.dev') || url.pathname.startsWith('/audio/')

  if (!isEdition && !isAudio) return

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached
        return fetch(event.request).then(response => {
          // Only cache successful responses
          if (response.ok) {
            cache.put(event.request, response.clone())
          }
          return response
        }).catch(() => {
          // Offline and not cached — return a meaningful error
          return new Response(JSON.stringify({ error: 'offline', message: 'This content is not available offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
        })
      })
    )
  )
})

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
