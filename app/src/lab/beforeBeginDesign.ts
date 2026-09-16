export function prepareBeforeBeginDesign() {
  if (!import.meta.env.DEV || !new URLSearchParams(location.search).has('beforeBeginDraft')) return
  sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'the-histories', primaryEditionKey: 'modern-en', compareEditionKey: 'original-en' }))
  const originalFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.href)
    if (/^\/api\/(?:lab-)?(?:chat|voice-session)$/.test(url.pathname)) return Promise.resolve(new Response(JSON.stringify({ error: 'Sending is unavailable in this design preview.' }), { status: 503, headers: { 'Content-Type': 'application/json' } }))
    return originalFetch(input, init)
  }
}
