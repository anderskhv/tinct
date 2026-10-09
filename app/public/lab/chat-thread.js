// The reader's chat thread: one component for both readers (Anders, 9 Oct 2026;
// docs/chat/BRIEF.md and docs/chat/mockup.html, "The thread, measured").
//
// Shared, like chapter-title.js, by the book reader (React, src/lab/LabAskPane.tsx,
// imported through the bundle) and the PDF reader for a reader's own books
// (plain JS, public/lab/addbook/js/reader.js, `import('/lab/chat-thread.js?v=…')`).
// Its stylesheet is chat-thread.css next to it. This module owns everything the
// two homes share:
//   - the thread model: which rows are dividers ("{chapter or page} · {day}"),
//     the time on the hover/press row, the passage quote cut at 240 characters,
//     and which answer keeps its copy mark;
//   - the markup: `threadHtml` renders it for the PDF reader, and the React
//     thread renders the same classes from the same rows (a test compares them);
//   - the behaviour: composer keys (Return sends, Shift-Return new line, ↑
//     recalls the last question, Escape closes), the composer growing to five
//     lines, press-and-hold on the phone, the "Latest" pill, the once-a-session
//     keyboard hint;
//   - the icons.
// No browser globals at import time; the DOM helpers take the nodes they work on.

export const QUOTE_LIMIT = 240
export const COMPOSER_LINES = 5
/** Press-and-hold on the phone reveals the row after this long… */
export const PRESS_HOLD_MS = 450
/** …and it fades this long after it appeared (or at once on scroll). */
export const PRESS_FADE_MS = 3000
export const HINT_TEXT = 'Return sends · Shift-Return new line · ↑ last question · Esc closes'
export const HINT_SESSION_KEY = 'tinct:chat-hint-shown'

const svg = (viewBox, body, size = 17, extra = '') =>
  `<svg width="${size}" height="${size}" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${body}</svg>`

/** The marks the thread uses, as the mockup draws them. */
export const ICONS = {
  close: svg('0 0 14 14', '<path d="M3 3l8 8M11 3l-8 8"/>', 12, ' stroke-width="1.6"'),
  copy: svg('0 0 18 18', '<rect x="6" y="6" width="9" height="9" rx="1.8"/><path d="M12 6V4.5A1.5 1.5 0 0 0 10.5 3h-6A1.5 1.5 0 0 0 3 4.5v6A1.5 1.5 0 0 0 4.5 12H6"/>', 17, ' stroke-width="1.7"'),
  copied: svg('0 0 18 18', '<path d="M4 9.5 7.5 13 14 5.5"/>', 17, ' stroke-width="1.7"'),
  mic: svg('0 0 18 18', '<rect x="6.5" y="2.5" width="5" height="8.5" rx="2.5"/><path d="M4 9a5 5 0 0 0 10 0M9 14v2M6.5 16h5"/>', 17, ' stroke-width="1.7"'),
  stop: svg('0 0 18 18', '<rect x="4.5" y="4.5" width="9" height="9" rx="1.5" fill="currentColor" stroke="none"/>', 17),
  talk: svg('0 0 18 18', '<path d="M4 7v4M7 4.5v9M10 6.5v5M13 3.5v11M16 8v2"/>', 17, ' stroke-width="1.7"'),
  send: svg('0 0 18 18', '<path d="M9 14V4M4.5 8.5 9 4l4.5 4.5"/>', 17, ' stroke-width="1.7"'),
  down: svg('0 0 12 12', '<path d="M6 2v8M2.5 6.5 6 10l3.5-3.5"/>', 12, ' stroke-width="2.2"'),
  collapse: '<svg width="10" height="16" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5 6.5 7l-5 5.5"/></svg>',
  attach: svg('0 0 18 18', '<path d="m14.5 8.6-5.3 5.3a3.4 3.4 0 0 1-4.8-4.8l5.6-5.6a2.2 2.2 0 0 1 3.2 3.2l-5.6 5.6a1 1 0 0 1-1.5-1.5l5-5"/>', 17, ' stroke-width="1.7"'),
}

/** A highlighted passage as the thread quotes it: at most 240 characters, then "…". */
export function cutQuote(text) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length <= QUOTE_LIMIT) return clean
  return clean.slice(0, QUOTE_LIMIT - 1).replace(/\s+\S*$/, '') + '…'
}

const finite = at => typeof at === 'number' && Number.isFinite(at)
const dayKey = at => { const d = new Date(at); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` }
const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' })
const dayYearFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const shortDayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const clockFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** "3 October"; the year only when it is not this year's. */
export function dayLabel(at, now = Date.now()) {
  if (!finite(at)) return ''
  return new Date(at).getFullYear() === new Date(now).getFullYear() ? dayFormat.format(at) : dayYearFormat.format(at)
}

/** The hover/press row's time: "10:24" today, "3 Oct, 10:24" before. */
export function timeLabel(at, now = Date.now()) {
  if (!finite(at)) return ''
  const clock = clockFormat.format(at)
  if (dayKey(at) === dayKey(now)) return clock
  const day = new Date(at).getFullYear() === new Date(now).getFullYear() ? shortDayFormat.format(at) : dayYearFormat.format(at)
  return `${day}, ${clock}`
}

/** "{chapter label} · {day}" ("The Window · 1 · 3 October", "Page 12 · 9 October"). */
export function dividerLabel(place, at, now = Date.now()) {
  return [place, dayLabel(at, now)].filter(Boolean).join(' · ')
}

/**
 * The thread as rows. Each turn is `{ role, at?, place? }` (`place` the
 * chapter label in the book reader, "Page 12" in the PDF reader). A divider
 * comes before a turn only when its place or its calendar day differs from
 * the turn before it: the first turn, and turns that continue the same
 * chapter on the same day, get none. A turn with no place (or no time) keeps
 * the previous one's, so it never starts a divider by itself.
 */
export function threadRows(turns, { now = Date.now() } = {}) {
  const rows = []
  let place = null
  let day = null
  let at = null
  turns.forEach((turn, index) => {
    const nextPlace = turn.place || place
    const nextAt = finite(turn.at) ? turn.at : at
    const nextDay = finite(nextAt) ? dayKey(nextAt) : day
    if (index > 0 && (nextPlace !== place || nextDay !== day) && (nextPlace || nextDay)) {
      rows.push({ type: 'divider', key: `divider-${index}`, label: dividerLabel(nextPlace, nextAt, now) })
    }
    rows.push({ type: 'turn', key: `turn-${index}`, index })
    place = nextPlace
    day = nextDay
    at = nextAt
  })
  return rows
}

/**
 * The answer that keeps its copy mark: the newest answer, until a newer one
 * exists. While an answer is still arriving it is the newest, and its marks
 * appear only when it finishes, so no answer shows one. -1: none.
 */
export function keptCopyIndex(turns, streaming = false) {
  for (let i = turns.length - 1; i >= 0; i--) {
    if (turns[i].role !== 'assistant') continue
    return streaming && i === turns.length - 1 ? -1 : i
  }
  return -1
}

/** The reader's last question, for ↑ in an empty composer. */
export function lastQuestion(turns, textOf = turn => turn.content) {
  for (let i = turns.length - 1; i >= 0; i--) if (turns[i].role === 'user') return textOf(turns[i]) || ''
  return ''
}

/**
 * What a key in the composer does. Return sends (Shift-Return is a new
 * line); on the phone sheet Return stays a new line and only Cmd/Ctrl-Return
 * sends, so a phone's keyboard keeps its own Return. ↑ in an empty composer
 * recalls the last question. Escape closes on the desktop.
 */
export function composerKey(event, { phone = false, empty = false } = {}) {
  if (event.isComposing) return null
  if (event.key === 'Enter') {
    if (event.metaKey || event.ctrlKey) return 'send'
    if (phone || event.shiftKey || event.altKey) return null
    return 'send'
  }
  if (event.key === 'ArrowUp' && empty && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) return 'recall'
  if (event.key === 'Escape' && !phone) return 'close'
  return null
}

/**
 * Grow the composer with its text to five lines, then scroll inside. The
 * field carries no scrollbar until it is actually clipped: measuring
 * collapses it for a moment, and an overflowing textarea would flash one.
 * Returns the pixel cap.
 */
export function fitComposer(field, lines = COMPOSER_LINES) {
  const style = field.ownerDocument?.defaultView?.getComputedStyle?.(field)
  const lineHeight = parseFloat(style?.lineHeight) || 22.4
  const pad = (parseFloat(style?.paddingTop) || 0) + (parseFloat(style?.paddingBottom) || 0)
  const cap = Math.round(lineHeight * lines + pad)
  field.style.overflowY = 'hidden'
  field.style.height = '0px'
  const content = field.scrollHeight
  field.style.height = `${Math.min(content, cap) || ''}px`
  if (!content) field.style.height = ''
  if (content > cap) field.style.overflowY = 'auto'
  return cap
}

/** True the first time in a session (and marks it): the desktop keyboard hint shows once. */
export function takeHint(storage) {
  try {
    if (!storage || storage.getItem(HINT_SESSION_KEY)) return false
    storage.setItem(HINT_SESSION_KEY, '1')
    return true
  } catch { return false }
}

/** Scrolled up more than one screen from the newest line: the "Latest" pill shows. */
export function isAway(node) {
  return node.scrollHeight - node.scrollTop - node.clientHeight > node.clientHeight
}

/**
 * Press-and-hold on a message (touch) reveals its row; it fades after three
 * seconds, on scroll, or on the next press. Desktop hover is plain CSS.
 * Rows are `[data-chat-row]`; the revealed one carries `data-pressed`.
 * Returns a function that removes the listeners.
 */
export function bindPress(thread, { holdMs = PRESS_HOLD_MS, fadeMs = PRESS_FADE_MS } = {}) {
  let hold = 0
  let fade = 0
  const clear = () => {
    clearTimeout(fade)
    thread.querySelectorAll('[data-pressed]').forEach(node => node.removeAttribute('data-pressed'))
  }
  const cancel = () => { clearTimeout(hold); hold = 0 }
  const down = event => {
    if (event.pointerType === 'mouse') return
    const row = event.target?.closest?.('[data-chat-row]')
    cancel()
    if (!row || !thread.contains(row)) { clear(); return }
    hold = setTimeout(() => {
      hold = 0
      clear()
      row.setAttribute('data-pressed', 'true')
      fade = setTimeout(clear, fadeMs)
    }, holdMs)
  }
  const scroll = () => { cancel(); clear() }
  const move = event => { if (hold && event.pointerType !== 'mouse' && (Math.abs(event.movementX || 0) + Math.abs(event.movementY || 0)) > 6) cancel() }
  thread.addEventListener('pointerdown', down)
  thread.addEventListener('pointerup', cancel)
  thread.addEventListener('pointercancel', cancel)
  thread.addEventListener('pointermove', move)
  thread.addEventListener('scroll', scroll, { passive: true })
  return () => {
    cancel(); clear()
    thread.removeEventListener('pointerdown', down)
    thread.removeEventListener('pointerup', cancel)
    thread.removeEventListener('pointercancel', cancel)
    thread.removeEventListener('pointermove', move)
    thread.removeEventListener('scroll', scroll)
  }
}

const escapeHtml = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

/**
 * The thread's markup, for a reader without React (the PDF reader). The
 * React thread renders the same elements and classes from `threadRows`.
 * `turns` are `{ role, text, html?, at?, place?, quote?, note?, extra? }`:
 * `html` the answer's rendered Markdown, `note` a faint line under a
 * question (one that got no answer), `extra` trusted markup above the bubble
 * (attached images). `streaming`: the last answer is still arriving.
 */
export function threadHtml(turns, { now = Date.now(), streaming = false } = {}) {
  const kept = keptCopyIndex(turns, streaming)
  return threadRows(turns, { now }).map(row => {
    if (row.type === 'divider') return `<p class="tc-divider" data-testid="lab-ask-location">${escapeHtml(row.label)}</p>`
    const i = row.index
    const turn = turns[i]
    const live = streaming && i === turns.length - 1 && turn.role === 'assistant'
    const time = finite(turn.at) ? `<time class="tc-time" datetime="${new Date(turn.at).toISOString()}">${escapeHtml(timeLabel(turn.at, now))}</time>` : ''
    const acts = live ? '' : `<div class="tc-acts${i === kept ? ' is-kept' : ''}"><button type="button" class="tc-mark tc-copy" data-copy="${i}" aria-label="${turn.role === 'user' ? 'Copy question' : 'Copy answer'}">${ICONS.copy}</button>${time}</div>`
    if (turn.role === 'user') {
      const quote = turn.quote ? `<button type="button" class="tc-quote" data-quote="${i}">${escapeHtml(cutQuote(turn.quote))}</button>` : ''
      const note = turn.note ? `<span class="tc-note">${escapeHtml(turn.note)}</span>` : ''
      return `<div class="tc-turn tc-q${turn.quote ? ' has-quote' : ''}" data-chat-row data-turn="${i}">${quote}${turn.extra || ''}<div class="tc-bubble">${escapeHtml(turn.text)}</div>${note}${acts}</div>`
    }
    const body = turn.html ?? `<p>${escapeHtml(turn.text)}</p>`
    return `<div class="tc-turn tc-a${live ? ' is-streaming' : ''}" data-chat-row data-turn="${i}"><div class="tc-answer"><div class="tc-md">${body}</div>${live && !String(turn.text || '').trim() ? '<span class="tc-cursor" aria-hidden="true"></span>' : ''}</div>${acts}</div>`
  }).join('')
}
