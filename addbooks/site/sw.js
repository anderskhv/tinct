const CACHE = 'tinct-addbooks-v2';
const SHELL = ['./','./index.html','./style.css','./app.js','./search.js','./search-worker.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([self.clients.claim(), caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('tinct-addbooks-') && key!==CACHE).map(key=>caches.delete(key))))]));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const local = url.origin === location.origin;
  // Covers come from many libraries; cache any HTTPS image, but no other third-party request.
  const allowed = local || ['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname) || (url.protocol === 'https:' && event.request.destination === 'image');
  if (!allowed) return;
  // Fresh local assets/catalogue online, cached fallback offline. Covers/fonts cache first.
  event.respondWith((async()=>{
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    if (!local && cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok || response.type === 'opaque') {
        event.waitUntil(cache.put(event.request,response.clone()).catch(()=>{}));
        return response;
      }
      return cached || response;
    } catch(error) {
      if (cached) return cached;
      throw error;
    }
  })());
});
