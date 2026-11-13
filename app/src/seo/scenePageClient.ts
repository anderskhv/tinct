/**
 * The scene page's script (built to /read/scene-page.js, a module). The page is static; this only does what a
 * static page cannot: show the reader's selection bar over a selection, send a typed question, and hand every
 * reader-only action over to /reader at this scene with the visitor's attribution (utm tags and click ids) kept.
 * It never imports or hydrates the reader and never reads or writes a reading position.
 */
import { isInternal } from '../../public/lab/internal-traffic.js'
import { captureAttribution, readAttributionPayload, TRACKED_PARAMS } from '../utils/attribution'
import { SCENE_HANDOFF_EDITION, SCENE_QUESTION_MAX, sceneHandoffHash, type SceneHandoffAction, type SceneSelection } from '../lab/labSceneHandoff'

/** Character spans of the words in a paragraph's text, as the reader counts words (/\S+/). */
export function wordSpans(text: string): Array<[number, number]> {
  const spans: Array<[number, number]> = []
  const re = /\S+/g
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) spans.push([match.index, match.index + match[0].length])
  return spans
}

/** The campaign parameters of `search` that an attribution touch records, in order. */
export function attributionParams(search: string): Array<[string, string]> {
  const params = new URLSearchParams(search)
  const kept: Array<[string, string]> = []
  for (const key of TRACKED_PARAMS) {
    const value = params.get(key)
    if (value) kept.push([key, value.slice(0, 250)])
  }
  return kept
}

/** `href` with the visitor's attribution parameters added to its query (before any hash), never twice. */
export function withAttribution(href: string, search: string, origin = 'https://tinct.app'): string {
  const kept = attributionParams(search)
  if (!kept.length) return href
  const url = new URL(href, origin)
  for (const [key, value] of kept) if (!url.searchParams.has(key)) url.searchParams.set(key, value)
  return url.pathname + url.search + url.hash
}

/** The reader at this scene doing `action`; a selection opens the reader at its first word. */
export function readerHandoffHref(input: {
  bookId: string; chapterNumber: number; action: SceneHandoffAction; search: string
  selection?: SceneSelection; question?: string; atParagraph?: number
}): string {
  const query = new URLSearchParams({ book: input.bookId, chapter: String(input.chapterNumber), edition: SCENE_HANDOFF_EDITION })
  const at = input.selection ? { paragraph: input.selection.paragraphIndex, word: input.selection.wordIndex } : input.atParagraph ? { paragraph: input.atParagraph, word: 0 } : null
  if (at) {
    query.set('paragraph', String(at.paragraph))
    if (at.word) query.set('word', String(at.word))
  }
  for (const [key, value] of attributionParams(input.search)) query.set(key, value)
  return `/reader?${query.toString()}${sceneHandoffHash({ action: input.action, selection: input.selection, question: input.question?.slice(0, SCENE_QUESTION_MAX) })}`
}

/**
 * A DOM selection as reader words: the first word it touches to the last, within the scene's modern text only
 * (`p[data-p]` in the stage). A selection that starts or ends inside a word takes the whole word, as the reader's
 * own selection does. Null for anything else (the original text, the heading, the margin).
 */
export function selectionToWords(range: Range, stage: Element): SceneSelection | null {
  const paragraphs = [...stage.querySelectorAll<HTMLElement>('p[data-p]')].filter(p => range.intersectsNode(p))
  if (!paragraphs.length) return null
  const offsetIn = (p: Element, node: Node, offset: number) => {
    const before = p.ownerDocument.createRange()
    before.setStart(p, 0)
    before.setEnd(node, offset)
    return before.toString().length
  }
  type Place = { paragraphIndex: number; wordIndex: number }
  let start: Place | null = null
  for (const p of paragraphs) {
    const from = p.contains(range.startContainer) ? offsetIn(p, range.startContainer, range.startOffset) : 0
    const index = wordSpans(p.textContent || '').findIndex(([, end]) => end > from)
    if (index >= 0) { start = { paragraphIndex: Number(p.dataset.p), wordIndex: index }; break }
  }
  let end: Place | null = null
  for (const p of [...paragraphs].reverse()) {
    const text = p.textContent || ''
    const to = p.contains(range.endContainer) ? offsetIn(p, range.endContainer, range.endOffset) : text.length
    const spans = wordSpans(text)
    let index = -1
    spans.forEach(([begin], at) => { if (begin < to) index = at })
    if (index >= 0) { end = { paragraphIndex: Number(p.dataset.p), wordIndex: index }; break }
  }
  if (!start || !end) return null
  if (end.paragraphIndex < start.paragraphIndex || (end.paragraphIndex === start.paragraphIndex && end.wordIndex < start.wordIndex)) return null
  return { paragraphIndex: start.paragraphIndex, wordIndex: start.wordIndex, endParagraphIndex: end.paragraphIndex, endWordIndex: end.wordIndex }
}

// ===== First-party analytics (the library funnel's wire format, surface "scene") =====

const DEVICE_KEY = 'tinct-lab-device-id'
const SESSION_KEY = 'tinct-funnel-session'
function newId(): string {
  try { if (crypto.randomUUID) return crypto.randomUUID() } catch { /* older browsers */ }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`.padEnd(16, '0')
}
function stored(storage: () => Storage, key: string): string {
  try {
    const store = storage()
    let value = store.getItem(key)
    if (!value) { value = newId(); store.setItem(key, value) }
    return value
  } catch { return newId() }
}
function analyticsOn(): boolean {
  return !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !navigator.webdriver
}
function send(events: Array<{ name: string; props?: Record<string, string | number | boolean> }>): void {
  try {
    if (!analyticsOn()) return
    const internal = (() => { try { return isInternal() } catch { return false } })()
    const body = JSON.stringify({
      deviceId: stored(() => localStorage, DEVICE_KEY).replace(/[^A-Za-z0-9_-]/g, ''),
      sessionId: stored(() => sessionStorage, SESSION_KEY).replace(/-/g, ''),
      surface: 'scene', path: location.pathname, referrer: document.referrer,
      attribution: readAttributionPayload(),
      events: events.map(event => internal ? { ...event, props: { ...event.props, internal: true } } : event),
    })
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/events', new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return
    void fetch('/api/events', { method: 'POST', keepalive: true, body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(() => {})
  } catch { /* analytics never blocks the page */ }
}

// ===== The page =====

const MORE_ICON = '<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false" class="lab-picon"><circle cx="4" cy="9" r=".9"></circle><circle cx="9" cy="9" r=".9"></circle><circle cx="14" cy="9" r=".9"></circle></svg>'

export function startScenePage(doc: Document = document): void {
  const root = doc.querySelector<HTMLElement>('[data-scene-page]')
  const stage = root?.querySelector<HTMLElement>('[data-scene-modern]')
  if (!root || !stage) return
  const bookId = root.dataset.bookId || ''
  const chapterNumber = Number(root.dataset.chapter)
  const search = location.search
  // The visitor's first touch is this page (a search result, a shared link), as it would have been the reader.
  try { captureAttribution() } catch { /* storage is optional */ }

  const go = (action: SceneHandoffAction, extra: { selection?: SceneSelection; question?: string; atParagraph?: number } = {}) => {
    send([{ name: 'scene_handoff', props: { action, book: bookId, chapter: chapterNumber } }])
    location.assign(readerHandoffHref({ bookId, chapterNumber, action, search, ...extra }))
  }

  // Links keep the visitor's attribution: into the reader, to the library, to the neighbouring scenes.
  for (const link of root.querySelectorAll<HTMLAnchorElement>('a[data-scene-action], a[data-scene-keep]')) {
    link.setAttribute('href', withAttribution(link.getAttribute('href') || '/', search, location.origin))
    const action = link.dataset.sceneAction as SceneHandoffAction | undefined
    if (action) link.addEventListener('click', () => send([{ name: 'scene_handoff', props: { action, book: bookId, chapter: chapterNumber } }]))
  }
  for (const button of root.querySelectorAll<HTMLButtonElement>('button[data-scene-action]')) {
    button.addEventListener('click', () => go(button.dataset.sceneAction as SceneHandoffAction))
  }
  // The reader's ask field (PhoneFollow): it grows with the question, Enter sends, Shift+Enter breaks the line.
  for (const form of root.querySelectorAll<HTMLFormElement>('form[data-scene-ask]')) {
    const field = form.querySelector('textarea')!
    const sendButton = form.querySelector<HTMLButtonElement>('button[type="submit"]')!
    const size = () => { field.style.height = 'auto'; field.style.height = `${Math.max(24, Math.min(96, field.scrollHeight))}px` }
    const submit = () => {
      const question = field.value.trim()
      if (question) go('ask', { question })
    }
    field.addEventListener('input', () => { sendButton.disabled = !field.value.trim(); size() })
    field.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); submit() }
    })
    form.addEventListener('submit', event => { event.preventDefault(); submit() })
    size()
  }

  // The reader's selection bar over a selection in the modern text.
  const bar = doc.createElement('div')
  bar.className = 'selection-popup is-lab is-desk-bar lab-pbar is-desk scene-selection-bar'
  bar.setAttribute('role', 'toolbar')
  bar.setAttribute('aria-label', 'Selection')
  bar.hidden = true
  bar.innerHTML = '<button type="button" class="lab-pbar-item is-ask" data-act="ask">Ask</button><span class="lab-pbar-sep" aria-hidden="true"></span>'
    + '<button type="button" class="lab-pbar-item is-text" data-act="explain">Explain</button><button type="button" class="lab-pbar-item is-text" data-act="simplify">Simplify</button>'
    + `<button type="button" class="lab-pbar-item" data-act="more" aria-label="More">${MORE_ICON}</button>`
  root.appendChild(bar)
  let picked: SceneSelection | null = null
  const hide = () => { bar.hidden = true; picked = null }
  const place = () => {
    const selection = doc.getSelection()
    if (!selection || selection.isCollapsed || !selection.rangeCount || !selection.toString().trim()) { hide(); return }
    const range = selection.getRangeAt(0)
    if (!stage.contains(range.commonAncestorContainer) && !range.intersectsNode(stage)) { hide(); return }
    if (!stage.contains(range.startContainer) || !stage.contains(range.endContainer)) { hide(); return }
    picked = selectionToWords(range, stage)
    if (!picked) { hide(); return }
    bar.hidden = false
    const rect = range.getBoundingClientRect()
    const box = root.getBoundingClientRect()
    const header = root.querySelector('.lab-header')?.getBoundingClientRect().bottom ?? 0
    const width = bar.offsetWidth
    const height = bar.offsetHeight
    const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 8), window.innerWidth - width - 8)
    const above = rect.top - height - 10
    const top = above >= header + 4 ? above : rect.bottom + 10
    bar.style.left = `${left - box.left}px`
    bar.style.top = `${top - box.top}px`
  }
  let timer = 0
  doc.addEventListener('selectionchange', () => { window.clearTimeout(timer); timer = window.setTimeout(place, 120) })
  window.addEventListener('resize', () => { if (!bar.hidden) place() })
  doc.addEventListener('keydown', event => { if (event.key === 'Escape') hide() })
  // Keep the selection while the bar is pressed.
  bar.addEventListener('mousedown', event => event.preventDefault())
  bar.addEventListener('click', event => {
    const action = (event.target as Element | null)?.closest<HTMLElement>('[data-act]')?.dataset.act as SceneHandoffAction | undefined
    if (action && picked) go(action, { selection: picked })
  })

  send([{ name: 'pageview', props: { book: bookId, chapter: chapterNumber } }])
}

if (typeof document !== 'undefined' && !(globalThis as { __tinctSceneNoStart?: boolean }).__tinctSceneNoStart) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => startScenePage())
  else startScenePage()
}
