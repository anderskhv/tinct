/*
 * The reader inside the /try page (docs/try-page/BRIEF.md): demo mode.
 *
 * Loaded first in the reader's head, only for /reader?demo=try (the Worker and the dev server add this script for
 * that address alone), and active only while the page is framed by /try on the same origin. It runs before the
 * reader's own boot script and bundle, so everything they do sees it:
 *
 * - Storage: localStorage and sessionStorage are replaced by stores in memory. The reader's place, history,
 *   highlights, cards, chat, AI counter, preferences and the margin opt-in all live and die with this frame; the
 *   visitor's real browser storage is never read or written (so a signed-in session, a saved place or a guest's own
 *   reading never shows here, and nothing from here reaches the real reader). The one exception is `carryOver`,
 *   which the page calls only when the visitor asks to create an account or sign in: it copies this conversation
 *   into the device's guest chat so it comes along (the reader's usual guest-to-account path).
 * - Network: every request that would write (any POST/PUT/PATCH/DELETE to /api/ other than the AI routes below,
 *   sendBeacon, Supabase writes) is answered here with 204 and never sent. AI requests carry
 *   `X-Tinct-Surface: try`, which puts them on the page's own daily budget (worker/lib/aiSpend.ts).
 * - Scripted answers: the step 1 Explain of "Begin the morning … unsocial." and the Book 2 Summary are answered from
 *   meditations-2.json, written ahead of time; nothing is sent for them.
 * - Out of AI (the visitor's free questions, or the page's day): the page is told, and shows its sign-up card; the
 *   request is held, never answered with an error.
 */
(function () {
  'use strict'
  var params
  try { params = new URLSearchParams(location.search) } catch (e) { return }
  if (params.get('demo') !== 'try') return
  var host = null
  try { if (window.parent !== window && window.parent.location.origin === location.origin && window.parent.location.pathname === '/try') host = window.parent } catch (e) { host = null }
  if (!host) return

  // ---- Storage in memory ----------------------------------------------------------------------------------------
  function memoryStorage() {
    var map = new Map()
    var api = {
      get length() { return map.size },
      key: function (index) { var keys = Array.from(map.keys()); return index >= 0 && index < keys.length ? keys[index] : null },
      getItem: function (key) { key = String(key); return map.has(key) ? map.get(key) : null },
      setItem: function (key, value) { map.set(String(key), String(value)) },
      removeItem: function (key) { map.delete(String(key)) },
      clear: function () { map.clear() },
    }
    return new Proxy(api, {
      get: function (target, prop) {
        if (prop in target) { var value = target[prop]; return typeof value === 'function' ? value.bind(target) : value }
        return typeof prop === 'string' && map.has(prop) ? map.get(prop) : undefined
      },
      set: function (target, prop, value) { if (prop in target) return false; map.set(String(prop), String(value)); return true },
      deleteProperty: function (target, prop) { map.delete(String(prop)); return true },
      has: function (target, prop) { return prop in target || map.has(String(prop)) },
      ownKeys: function () { return Array.from(map.keys()) },
      getOwnPropertyDescriptor: function (target, prop) {
        return map.has(String(prop)) ? { value: map.get(String(prop)), writable: true, enumerable: true, configurable: true } : undefined
      },
    })
  }
  var realLocal = null
  try { realLocal = window.localStorage } catch (e) { realLocal = null }
  var local = memoryStorage()
  var session = memoryStorage()
  try {
    Object.defineProperty(window, 'localStorage', { value: local, configurable: true })
    Object.defineProperty(window, 'sessionStorage', { value: session, configurable: true })
  } catch (e) {
    // Storage could not be replaced: this frame must not run as the demo.
    location.replace('about:blank')
    return
  }

  // ---- Talking to the page --------------------------------------------------------------------------------------
  function tell(message) {
    try { host.postMessage(Object.assign({ source: 'tinct-try-reader' }, message), location.origin) } catch (e) { /* page gone */ }
  }

  // ---- Network ----------------------------------------------------------------------------------------------------
  var AI_ROUTES = ['/api/lab-chat', '/api/lab-chapter-notes', '/api/lab-recap', '/api/lab-catch-up', '/api/lab-voice-session', '/api/narration/ensure']
  var SCRIPT_URL = '/lab/try/meditations-2.json'
  var scripted = null
  function loadScript() {
    if (!scripted) scripted = realFetch(SCRIPT_URL, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null }).catch(function () { scripted = null; return null })
    return scripted
  }
  var realFetch = window.fetch.bind(window)
  var norm = function (text) { return String(text || '').replace(/^\s*\d+\.\s*/, '').replace(/\s+/g, ' ').trim() }

  function sseAnswer(text, signal) {
    var parts = text.match(/[^\s]+\s*/g) || [text]
    var encoder = new TextEncoder()
    var index = 0
    var stream = new ReadableStream({
      pull: function (controller) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            if (signal && signal.aborted) { controller.error(new DOMException('Aborted', 'AbortError')); resolve(); return }
            if (index >= parts.length) {
              controller.enqueue(encoder.encode('data: {"type":"message_stop"}\n\n'))
              controller.close(); resolve(); return
            }
            var chunk = parts.slice(index, index + 3).join('')
            index += 3
            controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: chunk } }) + '\n\n'))
            resolve()
          }, index === 0 ? 450 : 28)
        })
      },
    })
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
  }

  /** A request the page's sign-up card replaces: it waits, unanswered, until the reader gives up on it. */
  function held(signal) {
    return new Promise(function (resolve, reject) {
      if (signal) signal.addEventListener('abort', function () { reject(new DOMException('Aborted', 'AbortError')) }, { once: true })
    })
  }

  function bodyJson(init) {
    try { return init && typeof init.body === 'string' ? JSON.parse(init.body) : null } catch (e) { return null }
  }

  window.fetch = function (input, init) {
    var url
    var method = (init && init.method) || (input && typeof input === 'object' && input.method) || 'GET'
    try { url = new URL(typeof input === 'string' ? input : input && input.url ? input.url : String(input), location.href) } catch (e) { return realFetch(input, init) }
    method = String(method).toUpperCase()
    var write = method !== 'GET' && method !== 'HEAD'
    var sameOrigin = url.origin === location.origin
    var supabase = /\.supabase\.co$/.test(url.hostname)
    if (supabase && write) return Promise.resolve(new Response(null, { status: 204 }))
    if (!sameOrigin || !url.pathname.startsWith('/api/')) return realFetch(input, init)
    var ai = AI_ROUTES.indexOf(url.pathname) >= 0
    if (write && !ai) return Promise.resolve(new Response(null, { status: 204 }))
    if (!ai) return realFetch(input, init)
    var signal = init && init.signal
    var body = bodyJson(init)
    var companion = body && body.companion
    // The scripted Explain and Summary: free and instant, from the file written ahead of time.
    if (url.pathname === '/api/lab-chat' && companion && companion.intent === 'explain' && companion.context && companion.context.chapterNumber === 2 && /^Meditations$/.test(companion.context.bookTitle || '')) {
      var selection = norm(companion.selection)
      return loadScript().then(function (data) {
        if (data && selection === norm(data.explain.selection)) { tell({ type: 'ai', intent: 'explain', scripted: true }); return sseAnswer(data.explain.answer, signal) }
        return live()
      })
    }
    if (url.pathname === '/api/lab-chapter-notes' && body && body.bookId === 'meditations' && body.chapterNumber === 2 && body.kind === 'end' && (body.editionKey === 'original-en' || body.editionKey === 'modern-en')) {
      return loadScript().then(function (data) {
        if (data) { tell({ type: 'ai', intent: 'summary', scripted: true }); return new Response(JSON.stringify(data.summary), { status: 200, headers: { 'Content-Type': 'application/json' } }) }
        return live()
      })
    }
    return live()

    function live() {
      var headers = new Headers((init && init.headers) || (input && typeof input === 'object' && input.headers) || undefined)
      headers.set('X-Tinct-Surface', 'try')
      if (url.pathname !== '/api/narration/ensure') tell({ type: 'ai', intent: companion && companion.intent || url.pathname.slice(5), scripted: false })
      return realFetch(input, Object.assign({}, init || {}, { headers: headers })).then(function (response) {
        if (url.pathname === '/api/narration/ensure') return response
        // Out of AI for today (the page's budget, the rate limit or the Talk trial): the page's card, never an error.
        if (response.status === 503 || response.status === 429 || response.status === 402) {
          tell({ type: 'limit', route: url.pathname, status: response.status })
          return held(signal)
        }
        return response
      })
    }
  }
  if (navigator.sendBeacon) {
    try { Object.defineProperty(navigator, 'sendBeacon', { value: function () { return true }, configurable: true }) } catch (e) { /* left as is */ }
  }

  // ---- Carry-over on sign-up --------------------------------------------------------------------------------------
  /** Copy this conversation (Meditations' chat, which holds the margin cards) into the device's guest chat. */
  function carryOver() {
    if (!realLocal) return false
    var key = 'tinct:chat-history:meditations'
    var demo = local.getItem(key)
    if (!demo) return false
    try {
      var mine = JSON.parse(demo)
      var kept = []
      try { kept = JSON.parse(realLocal.getItem(key) || '[]') } catch (e) { kept = [] }
      if (!Array.isArray(mine)) return false
      if (!Array.isArray(kept)) kept = []
      var ids = new Set(kept.map(function (item) { return item && item.id }))
      realLocal.setItem(key, JSON.stringify(kept.concat(mine.filter(function (item) { return item && !ids.has(item.id) }))))
      return true
    } catch (e) { return false }
  }

  window.__TINCT_TRY_DEMO__ = Object.freeze({ surface: 'try', tell: tell, carryOver: carryOver })
})()
