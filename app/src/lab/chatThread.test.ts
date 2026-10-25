// @vitest-environment jsdom
// The shared chat thread (public/lab/chat-thread.js): the model both readers use.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bindPress, composerKey, cutQuote, dayLabel, fadeInWords, fitSpacer, HINT_TEXT, isAway, isBelow, keptCopyIndex, lastQuestion, latestPill, PRESS_FADE_MS, PRESS_HOLD_MS,
  QUESTION_PEEK, questionTop, QUOTE_LIMIT, TOP_CLEAR, BACK_TO_BOOK_HTML, takeHint, threadHtml, threadRows, timeLabel, WORD_FADE_MS,
} from '../../public/lab/chat-thread.js'

const NOW = new Date(2026, 9, 9, 15, 0).getTime()
const OCT3 = new Date(2026, 9, 3, 10, 24).getTime()
const OCT9 = new Date(2026, 9, 9, 9, 5).getTime()

afterEach(() => { vi.useRealTimers() })

describe('dividers: only when the chapter (or page) or the calendar day changes', () => {
  it('a thread with messages from two chapters and two days shows exactly two dividers', () => {
    const turns = [
      { role: 'user' as const, at: OCT3, place: 'The Window · 1' },
      { role: 'assistant' as const, at: OCT3 + 1000, place: 'The Window · 1' },
      { role: 'user' as const, at: OCT3 + 60_000, place: 'The Window · 2' },
      { role: 'assistant' as const, at: OCT3 + 61_000, place: 'The Window · 2' },
      { role: 'user' as const, at: OCT9, place: 'The Window · 2' },
      { role: 'assistant' as const, at: OCT9 + 1000, place: 'The Window · 2' },
    ]
    const dividers = threadRows(turns, { now: NOW }).filter(row => row.type === 'divider')
    expect(dividers.map(row => row.type === 'divider' && row.label)).toEqual(['The Window · 2 · 3 October', 'The Window · 2 · 9 October'])
  })

  it('the same chapter on the same day shows none', () => {
    const turns = [0, 1, 2, 3].map(i => ({ role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', at: OCT9 + i * 1000, place: 'Chapter 14' }))
    expect(threadRows(turns, { now: NOW }).filter(row => row.type === 'divider')).toHaveLength(0)
  })

  it('names the page in the PDF reader and the year only when it is not this year', () => {
    const turns = [
      { role: 'user' as const, at: OCT9, place: 'Page 11' },
      { role: 'user' as const, at: OCT9 + 5, place: 'Page 12' },
      { role: 'user' as const, at: new Date(2025, 2, 1).getTime(), place: 'Page 12' },
    ]
    expect(threadRows(turns, { now: NOW }).flatMap(row => row.type === 'divider' ? [row.label] : [])).toEqual(['Page 12 · 9 October', 'Page 12 · 1 March 2025'])
  })

  it('a turn without a time or place (an answer still arriving) never starts a divider by itself', () => {
    const turns = [{ role: 'user' as const, at: OCT9, place: 'Chapter 2' }, { role: 'assistant' as const }]
    expect(threadRows(turns, { now: NOW }).filter(row => row.type === 'divider')).toHaveLength(0)
  })
})

describe('labels', () => {
  it('time on the row: "10:24" today, "3 Oct, 10:24" before; day in the divider', () => {
    expect(timeLabel(OCT9, NOW)).toBe('09:05')
    expect(timeLabel(OCT3, NOW)).toBe('3 Oct, 10:24')
    expect(dayLabel(OCT3, NOW)).toBe('3 October')
  })

  it('cuts a quoted passage at 240 characters with an ellipsis', () => {
    const long = 'word '.repeat(100)
    const cut = cutQuote(long)
    expect(cut.length).toBeLessThanOrEqual(QUOTE_LIMIT)
    expect(cut.endsWith('…')).toBe(true)
    expect(cutQuote('“But you’ll have to be up with the lark,” she added.')).toBe('“But you’ll have to be up with the lark,” she added.')
  })
})

describe('the newest answer keeps its copy mark until a newer one exists', () => {
  const q = { role: 'user' as const }
  const a = { role: 'assistant' as const }
  it('moves to the new answer once it finishes; while it arrives the previous answer keeps it', () => {
    expect(keptCopyIndex([q, a])).toBe(1)
    expect(keptCopyIndex([q, a, q])).toBe(1)
    expect(keptCopyIndex([q, a, q, a], true)).toBe(1)
    expect(keptCopyIndex([q, a], true)).toBe(-1)
    expect(keptCopyIndex([q, a, q, a])).toBe(3)
    expect(keptCopyIndex([q])).toBe(-1)
  })
  it('↑ recalls the last question', () => {
    expect(lastQuestion([{ role: 'user', content: 'one' }, { role: 'assistant', content: 'x' }, { role: 'user', content: 'two' }, { role: 'assistant', content: 'y' }])).toBe('two')
  })
})

describe('composer keys', () => {
  it('Return sends, Shift-Return is a new line, ↑ recalls only when empty, Escape closes on the desktop', () => {
    expect(composerKey({ key: 'Enter' })).toBe('send')
    expect(composerKey({ key: 'Enter', shiftKey: true })).toBeNull()
    expect(composerKey({ key: 'Enter', isComposing: true })).toBeNull()
    expect(composerKey({ key: 'ArrowUp' }, { empty: true })).toBe('recall')
    expect(composerKey({ key: 'ArrowUp' }, { empty: false })).toBeNull()
    expect(composerKey({ key: 'Escape' })).toBe('close')
  })
  it('the phone keeps its keyboard’s Return as a new line; Cmd/Ctrl-Return sends', () => {
    expect(composerKey({ key: 'Enter' }, { phone: true })).toBeNull()
    expect(composerKey({ key: 'Enter', metaKey: true }, { phone: true })).toBe('send')
    expect(composerKey({ key: 'Escape' }, { phone: true })).toBeNull()
  })
  it('the hint shows once per session', () => {
    const store = new Map<string, string>()
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v) } }
    expect(takeHint(storage)).toBe(true)
    expect(takeHint(storage)).toBe(false)
    expect(HINT_TEXT).toBe('Return sends · Shift-Return new line · ↑ last question')
  })
  it('the Latest pill shows only more than a screen up', () => {
    expect(isAway({ scrollHeight: 3000, scrollTop: 1000, clientHeight: 500 })).toBe(true)
    expect(isAway({ scrollHeight: 3000, scrollTop: 2100, clientHeight: 500 })).toBe(false)
  })
  it('measures from the newest message, not from the clean writing space below it', () => {
    const thread = document.createElement('div')
    thread.innerHTML = '<div class="tc-turn"></div><div class="tc-spacer" style="height: 500px"></div>'
    Object.defineProperty(thread, 'scrollHeight', { value: 3000 })
    Object.defineProperty(thread, 'clientHeight', { value: 500 })
    // Just scrolled up from the clean opening so the last messages fill the window: not "away".
    thread.scrollTop = 2000
    expect(isAway(thread)).toBe(false)
    thread.scrollTop = 1400
    expect(isAway(thread)).toBe(true)
  })
})

describe('calm answer (Anders, 10 Oct 2026): the question near the top once, then nothing moves', () => {
  const threadOf = (contentHeight: number, client = 600) => {
    const thread = document.createElement('div')
    thread.innerHTML = '<div class="tc-turn" id="q"></div><div class="tc-spacer" style="height: 0px"></div>'
    Object.defineProperty(thread, 'scrollHeight', { configurable: true, get: () => contentHeight + (parseFloat((thread.querySelector('.tc-spacer') as HTMLElement).style.height) || 0) })
    Object.defineProperty(thread, 'clientHeight', { value: client })
    return thread
  }
  it('places the question a little below the top, leaving some of the previous answer visible', () => {
    const thread = threadOf(2100)
    thread.scrollTop = 1500
    const row = thread.querySelector('#q')!
    row.getBoundingClientRect = () => ({ top: 500 } as DOMRect)
    thread.getBoundingClientRect = () => ({ top: 0 } as DOMRect)
    // 500px below the window's top at scrollTop 1500: the question starts at 2000.
    expect(questionTop(thread, row)).toBe(2000 - Math.min(QUESTION_PEEK, 120))
    // A short desktop box still keeps the strip under "Back to book" and a line above the question.
    const small = threadOf(2100, 300)
    small.scrollTop = 1500
    expect(questionTop(small, row)).toBe(2000 - (TOP_CLEAR + 24))
  })
  it('the writing space lets the thread reach that place, and shrinks as the answer grows', () => {
    const thread = threadOf(2100)
    fitSpacer(thread, 1900)
    expect(thread.scrollHeight - thread.clientHeight).toBe(1900)
    const grown = threadOf(2400)
    fitSpacer(grown, 1900)
    expect(parseFloat((grown.querySelector('.tc-spacer') as HTMLElement).style.height)).toBe(100)
    const long = threadOf(4000)
    fitSpacer(long, 1900)
    expect((long.querySelector('.tc-spacer') as HTMLElement).style.height).toBe('0px')
  })
  it('the Latest pill shows once the answer runs past the foot of the window', () => {
    const thread = threadOf(2400)
    thread.scrollTop = 1900
    fitSpacer(thread, 1900)
    expect(isBelow(thread)).toBe(false)
    const long = threadOf(2700)
    long.scrollTop = 1900
    expect(isBelow(long)).toBe(true)
  })
  it('the Latest pill (latestPill): never where the view was put, only after the reader scrolled up and more arrived below', () => {
    let height = 2400
    const thread = { scrollTop: 0, clientHeight: 600, get scrollHeight() { return height } }
    const pill = latestPill()
    // Placed: a question held near the top, its answer running past the foot.
    thread.scrollTop = 1800
    pill.placed(thread)
    height = 3200
    expect(pill.shows(thread, false)).toBe(false)
    // The reader follows the answer down: no pill.
    thread.scrollTop = 2000
    height = 3400
    expect(pill.shows(thread, true)).toBe(false)
    // Scrolled up above where the view was put: nothing new yet.
    thread.scrollTop = 1200
    expect(pill.shows(thread, true)).toBe(false)
    // More arrives below: the pill, and it stays while they read up there.
    height = 3600
    expect(pill.shows(thread, true)).toBe(true)
    expect(pill.shows(thread, true)).toBe(true)
    // At the newest line: gone.
    thread.scrollTop = 3000
    expect(pill.shows(thread, true)).toBe(false)
    // Placed again (a new question sent): gone even if more arrives.
    thread.scrollTop = 1200
    pill.placed(thread)
    height = 4000
    expect(pill.shows(thread, false)).toBe(false)
  })
  it('the PDF reader uses the same pill rule', () => {
    const reader = readFileSync(resolve(__dirname, '../../public/lab/addbook/js/reader.js'), 'utf8')
    expect(reader).toMatch(/latestPill\(\)\.shows\(thread, chat\.anchor == null \|\| chat\.pinTop == null\)/)
    expect(reader).not.toMatch(/TC\.isBelow\(thread\)/)
  })
  it('the PDF reader holds the question too: no follow while the answer arrives, and the reader’s own scroll lets go', () => {
    const reader = readFileSync(resolve(__dirname, '../../public/lab/addbook/js/reader.js'), 'utf8')
    const live = reader.slice(reader.indexOf('function liveText('), reader.indexOf('async function ask('))
    expect(live).toMatch(/holdQuestion\(false\)/)
    expect(live).toMatch(/TC\.fadeInWords\(/)
    expect(live).not.toMatch(/tc-cursor/)
    expect(reader).toMatch(/chat\.anchor = chat\.turns\.length - 1; chat\.placeAnchor = true;/)
    expect(reader).toMatch(/if \(chat\.pinTop != null && Math\.abs\(thread\.scrollTop - chat\.pinTop\) > 1\) chat\.pinTop = null/)
  })
})

describe('"Back to book" instead of the faint × (Anders, 10 Oct 2026)', () => {
  const css = readFileSync(resolve(__dirname, '../../public/lab/chat-thread.css'), 'utf8')
  it('is the pre-redesign pill: "← Back to book", EB Garamond 14px, 36px tall, top left', () => {
    expect(BACK_TO_BOOK_HTML).toBe('<span aria-hidden="true">←</span> Back to book')
    const rule = css.match(/\.tc \.tc-back \{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/font:\s*400 14px\/1\.2 var\(--tc-gara\)/)
    expect(rule).toMatch(/min-height:\s*36px/)
    expect(rule).toMatch(/border-radius:\s*18px/)
    expect(rule).toMatch(/top:\s*10px/)
    expect(css).not.toMatch(/\.tc-close/)
  })
  it('never covers the first line: the thread starts below it (padding and fade)', () => {
    const top = Number(css.match(/\.tc \.tc-back \{[^}]*top:\s*(\d+)px/)?.[1])
    const height = Number(css.match(/\.tc \.tc-back \{[^}]*min-height:\s*(\d+)px/)?.[1])
    expect(top + height).toBeLessThan(TOP_CLEAR)
    expect(css).toMatch(new RegExp(`\\.tc \\.tc-thread \\{[^}]*padding:\\s*${TOP_CLEAR}px var\\(--tc-pad\\) 2px`))
    expect(css).toMatch(new RegExp(`\\.tc \\.tc-fade \\{[^}]*height:\\s*${TOP_CLEAR}px`))
  })
  it('e-ink: an outline, no fill; the PDF reader uses the same control and handler', () => {
    expect(css).toMatch(/html\[data-eink="true"\] \.tc :is\(\.tc-bubble, \.tc-back\)[^{]*\{[^}]*background:\s*transparent/)
    const reader = readFileSync(resolve(__dirname, '../../public/lab/addbook/js/reader.js'), 'utf8')
    expect(reader).toContain('<button type="button" class="tc-back" data-reader-window-control data-x>${TC.BACK_TO_BOOK_HTML}</button>')
    expect(reader).toContain("el.querySelector('[data-x]').onclick = closeChat;")
  })
})

describe('streaming without a cursor (Anders, 10 Oct 2026)', () => {
  it('waits with three faint dots, then the words that just arrived fade in, and a re-render continues the fade', () => {
    const host = document.createElement('div')
    host.innerHTML = threadHtml([{ role: 'user', text: 'Why?', at: OCT9 }, { role: 'assistant', text: '' }], { now: NOW, streaming: true })
    expect(host.querySelectorAll('.tc-wait i')).toHaveLength(3)
    expect(host.querySelector('.tc-cursor')).toBeNull()

    const md = document.createElement('div')
    const seen: number[] = []
    md.innerHTML = '<p>Neither, quite.</p>'
    fadeInWords(md, seen, 1000)
    expect([...md.querySelectorAll('.tc-w')].map(n => n.textContent)).toEqual(['Neither,', 'quite.'])
    // The whole answer is drawn again with more text, 200ms later.
    md.innerHTML = '<p>Neither, quite. He <em>loves</em> both.</p>'
    fadeInWords(md, seen, 1200)
    const words = [...md.querySelectorAll<HTMLElement>('.tc-w')]
    expect(words.map(n => n.textContent)).toEqual(['Neither,', 'quite.', 'He', 'loves', 'both.'])
    expect(words[0].style.animationDelay).toBe('-200ms')
    expect(words[2].style.animationDelay).toBe('')
    expect(md.textContent).toBe('Neither, quite. He loves both.')
    // Long since faded: plain text again.
    md.innerHTML = '<p>Neither, quite. He <em>loves</em> both.</p>'
    fadeInWords(md, seen, 1200 + WORD_FADE_MS)
    expect(md.querySelectorAll('.tc-w')).toHaveLength(0)
  })
  it('no blinking anywhere: the composer uses the system caret in the muted ink, and nothing in the thread blinks', () => {
    const css = readFileSync(resolve(__dirname, '../../public/lab/chat-thread.css'), 'utf8')
    expect(css).not.toMatch(/tc-blink|steps\(1\)/)
    expect(css).not.toMatch(/\.tc-field\.is-empty::before/)
    expect(css).not.toMatch(/caret-color:\s*transparent/)
    expect(css.match(/\.tc \.tc-input \{([^}]*)\}/)?.[1]).toMatch(/caret-color:\s*var\(--tc-muted\)/)
    // Reduced motion: the dots and words are still.
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*\.tc-wait i, \.tc \.tc-a\.is-streaming \.tc-w \{ animation: none !important; \}/)
  })
  it('type one pixel larger: answers 18px (17px desktop), bubbles 17px (16px desktop)', () => {
    const css = readFileSync(resolve(__dirname, '../../public/lab/chat-thread.css'), 'utf8')
    expect(css).toMatch(/--tc-answer: 18px; --tc-question: 17px;/)
    expect(css).toMatch(/\.lab\.is-desktop \.tc \{[^}]*--tc-answer: 17px; --tc-question: 16px;/)
  })
})

describe('press-and-hold row (phone)', () => {
  it('is hidden by default, shown on press-and-hold, and fades after three seconds or on scroll', () => {
    vi.useFakeTimers()
    const thread = document.createElement('div')
    thread.innerHTML = threadHtml([
      { role: 'user', text: 'Who is James?', at: OCT9 },
      { role: 'assistant', text: 'The youngest son.', at: OCT9 + 1000 },
    ], { now: NOW })
    document.body.append(thread)
    const off = bindPress(thread)
    const question = thread.querySelector('.tc-q') as HTMLElement
    expect(thread.querySelector('[data-pressed]')).toBeNull()
    question.querySelector('.tc-bubble')!.dispatchEvent(Object.assign(new Event('pointerdown', { bubbles: true }), { pointerType: 'touch' }))
    vi.advanceTimersByTime(PRESS_HOLD_MS - 10)
    expect(question.hasAttribute('data-pressed')).toBe(false)
    vi.advanceTimersByTime(20)
    expect(question.getAttribute('data-pressed')).toBe('true')
    vi.advanceTimersByTime(PRESS_FADE_MS)
    expect(question.hasAttribute('data-pressed')).toBe(false)
    question.dispatchEvent(Object.assign(new Event('pointerdown', { bubbles: true }), { pointerType: 'touch' }))
    vi.advanceTimersByTime(PRESS_HOLD_MS)
    expect(question.hasAttribute('data-pressed')).toBe(true)
    thread.dispatchEvent(new Event('scroll'))
    expect(question.hasAttribute('data-pressed')).toBe(false)
    // A mouse never presses: the desktop row is hover (CSS).
    question.dispatchEvent(Object.assign(new Event('pointerdown', { bubbles: true }), { pointerType: 'mouse' }))
    vi.advanceTimersByTime(PRESS_HOLD_MS * 2)
    expect(question.hasAttribute('data-pressed')).toBe(false)
    off()
    thread.remove()
  })
})

describe('threadHtml (the PDF reader’s markup)', () => {
  const turns = [
    { role: 'user' as const, text: 'Who does the narrator side with?', at: OCT9, place: 'Page 12', quote: 'compare with the father’s line' },
    { role: 'assistant' as const, text: 'Neither, quite.', html: '<p>Neither, quite.</p>', at: OCT9 + 1000, place: 'Page 12' },
    { role: 'user' as const, text: 'Why?', at: OCT9 + 2000, place: 'Page 13' },
    { role: 'assistant' as const, text: 'Because', html: '<p>Because</p>', place: 'Page 13' },
  ]
  it('no labels or stamps under messages; a divider on the page change; the quote above the bubble; nothing under a streaming answer', () => {
    const host = document.createElement('div')
    host.innerHTML = threadHtml(turns, { now: NOW, streaming: true })
    expect(host.querySelectorAll('.tc-divider')).toHaveLength(1)
    expect(host.querySelector('.tc-divider')!.textContent).toBe('Page 13 · 9 October')
    expect(host.querySelector('.tc-q .tc-quote')!.nextElementSibling!.className).toBe('tc-bubble')
    expect(host.querySelector('.tc-a.is-streaming .tc-acts')).toBeNull()
    // The previous answer keeps its mark while the new one arrives (nothing above the question moves).
    expect([...host.querySelectorAll('.tc-acts.is-kept')].map(n => n.closest('[data-turn]')!.getAttribute('data-turn'))).toEqual(['1'])
    expect(host.textContent).not.toMatch(/\bYou\b|\bTinct\b|thinking|on the way/)
    host.innerHTML = threadHtml(turns, { now: NOW })
    expect([...host.querySelectorAll('.tc-acts.is-kept')].map(n => n.closest('[data-turn]')!.getAttribute('data-turn'))).toEqual(['3'])
  })
})

describe('the thread’s look: the book’s type, nothing else', () => {
  const css = readFileSync(resolve(__dirname, '../../public/lab/chat-thread.css'), 'utf8')
  const js = readFileSync(resolve(__dirname, '../../public/lab/chat-thread.js'), 'utf8')
  it('never monospace, never uppercase, never the accent colour', () => {
    expect(css).not.toMatch(/monospace|Plex Mono|ui-monospace/i)
    expect(css).not.toMatch(/text-transform\s*:\s*uppercase|font-variant[^;]*small-caps/i)
    expect(css).not.toMatch(/#1f4a5c|31\s*,\s*74\s*,\s*92|--[\w-]*accent/i)
    expect(css).toMatch(/EB Garamond/)
  })
  it('carries no empty-state copy: no welcome line, suggestions or placeholder', () => {
    expect(js + css).not.toMatch(/Ask about this|placeholder=|Suggested|Welcome|How can I help/i)
  })
  it('notices in the thread (a failed save, a dictation or Talk line) are quiet italics: EB Garamond, no box, fill or shadow', () => {
    const rule = css.match(/\.tc \.tc-status \{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/font:\s*italic 13px\/1\.4 var\(--tc-gara\)/)
    expect(rule).toMatch(/background:\s*none/)
    expect(rule).toMatch(/box-shadow:\s*none/)
    expect(rule).toMatch(/border:\s*0/)
    expect(rule).toMatch(/position:\s*static/)
    // The PDF reader's toast ("Kept on this device only: …") joins the phone chat as one of these lines.
    const reader = readFileSync(resolve(__dirname, '../../public/lab/addbook/js/reader.js'), 'utf8')
    expect(reader).toMatch(/t\.className = inChat \? 'tc-status byob-toast is-in-chat'/)
    // A toast already showing when Chat opens moves into the chat as well.
    expect(reader).toMatch(/if \(shown\) placeToast\(shown\)/)
  })
  it('e-ink: no fills or shadows', () => {
    const eink = css.split('\n').filter(line => line.includes('data-eink'))
    expect(eink.length).toBeGreaterThan(0)
    expect(css).toMatch(/html\[data-eink="true"\][^{]*\.tc-bubble[^{]*\{[^}]*background:\s*transparent/)
    expect(css).toMatch(/html\[data-eink="true"\][^{]*\{[^}]*box-shadow:\s*none/)
  })
})
