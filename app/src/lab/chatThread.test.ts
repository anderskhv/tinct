// @vitest-environment jsdom
// The shared chat thread (public/lab/chat-thread.js): the model both readers use.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bindPress, composerKey, cutQuote, dayLabel, HINT_TEXT, isAway, keptCopyIndex, lastQuestion, PRESS_FADE_MS, PRESS_HOLD_MS,
  QUOTE_LIMIT, takeHint, threadHtml, threadRows, timeLabel,
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
  it('moves to the new answer, and is on none while the new one is still arriving', () => {
    expect(keptCopyIndex([q, a])).toBe(1)
    expect(keptCopyIndex([q, a, q])).toBe(1)
    expect(keptCopyIndex([q, a, q, a], true)).toBe(-1)
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
    expect(HINT_TEXT).toBe('Return sends · Shift-Return new line · ↑ last question · Esc closes')
  })
  it('the Latest pill shows only more than a screen up', () => {
    expect(isAway({ scrollHeight: 3000, scrollTop: 1000, clientHeight: 500 })).toBe(true)
    expect(isAway({ scrollHeight: 3000, scrollTop: 2100, clientHeight: 500 })).toBe(false)
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
  it('no labels or stamps under messages; a divider on the page change; the quote above the bubble; a cursor while streaming', () => {
    const host = document.createElement('div')
    host.innerHTML = threadHtml(turns, { now: NOW, streaming: true })
    expect(host.querySelectorAll('.tc-divider')).toHaveLength(1)
    expect(host.querySelector('.tc-divider')!.textContent).toBe('Page 13 · 9 October')
    expect(host.querySelector('.tc-q .tc-quote')!.nextElementSibling!.className).toBe('tc-bubble')
    expect(host.querySelector('.tc-a.is-streaming .tc-acts')).toBeNull()
    expect(host.querySelectorAll('.tc-acts.is-kept')).toHaveLength(0)
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
