/**
 * Anders, 19 Oct 2026, on /lab/addbook: "it's too hidden that this is indeed a chat field. Gloss does better."
 * A passage card ends as Gloss's does: an action row under the answer (copy, then the bin; there is no regenerate
 * action for a card), then an always-visible rounded, bordered field with the placeholder "Ask a follow-up", the mic
 * inside it on the right and a send button (an up-arrow in a filled rounded square) that is off until there is text.
 * The page's behaviour (visible without focus, Enter and the button send, dictation) is in scripts/margin-check.mjs
 * (cards-gloss, column-page).
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Card = { id: string; kind: string; page: number; rects: number[][]; text: string; at: number; turns?: Array<{ role: string; content: string }>; data?: Record<string, unknown> }
interface MarginApi { html: { cardHtml(card: Card, o: Record<string, unknown>): string; followHtml(o?: Record<string, unknown>): string; wholeHtml(body: string, o?: Record<string, unknown>): string } }
let M: MarginApi, P: unknown
const css = readFileSync(ROOT + 'app/public/lab/addbook/css/margin.css', 'utf8')
const reader = readFileSync(ROOT + 'app/public/lab/addbook/js/reader.js', 'utf8')
beforeAll(async () => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  M = (globalThis as unknown as { TinctMargin: MarginApi }).TinctMargin
  P = await import(ROOT + 'app/public/lab/margin/margin-parse.js')
})
const card = (kind: string, extra: Partial<Card> = {}): Card => ({ id: 'c1', kind, page: 3, rects: [[3, 0.1, 0.2, 0.5, 0.02]], text: 'A passage.', at: 1, turns: [{ role: 'assistant', content: 'The answer. More.' }], ...extra })

describe('the follow-up field', () => {
  it('is a box with the field, the mic and then send (disabled until there is text); placeholder "Ask a follow-up"', () => {
    const f = M.html.followHtml()
    expect(f).toMatch(/^<div class="mr-follow has-field"><div class="mr-follow__box"><span class="mr-follow__field"><textarea class="mr-follow__input" rows="1" enterkeyhint="send" placeholder="Ask a follow-up" aria-label="Follow up" spellcheck="false" autocorrect="off" autocomplete="off"><\/textarea><\/span><button type="button" class="mr-follow__mic" data-c="mic" aria-label="Dictate" aria-pressed="false"><svg[^]*?<\/svg><\/button><button type="button" class="mr-follow__send" data-c="send" aria-label="Send" disabled><svg[^]*?<\/svg><\/button><\/div><\/div>$/)
    // Mic, Talk (21 Oct 2026: every card's field), send, in that order; a quiz's answer field passes talk: false.
    expect(f).toMatch(/data-c="mic"[^]*?<\/button><button type="button" class="mr-follow__talk" data-c="talk" aria-label="Talk about this"><svg[^>]*><rect[^]*?<\/svg><\/button><button type="button" class="mr-follow__send"/)
    expect(M.html.followHtml({ talk: false })).not.toContain('data-c="talk"')
    // The send icon is the selection bar's up-arrow, in the icons' stroke.
    expect(f).toContain('<path d="M9 14V4M4.5 8.5 9 4l4.5 4.5"/>')
    expect(f).not.toContain('mr-card__delete')
  })
  it('every passage card ends with it; the whole-document Chat and a quiz answer name what they ask for', () => {
    for (const kind of ['explain', 'simplify', 'counterpoint', 'factcheck', 'ask', 'figure']) {
      const html = M.html.cardHtml(card(kind), { open: true, P })
      expect(html, kind).toMatch(/<div class="mr-follow has-field"><div class="mr-follow__box">.*placeholder="Ask a follow-up".*data-c="mic".*data-c="send".*<\/div><\/div>$/)
    }
    expect(M.html.wholeHtml('')).toContain('placeholder="Ask about the whole PDF" aria-label="Ask about the whole PDF"')
    expect(M.html.wholeHtml('', { doc: 'epub' })).toContain('placeholder="Ask about the whole book"')
    const quiz = M.html.cardHtml(card('quiz', { turns: [], data: { questions: [{ q: 'Q?', answer: 'A', why: '', cite: '' }], i: 0, results: [] } }), { open: true, P })
    expect(quiz).toContain('placeholder="Your answer" aria-label="Your answer"')
    expect(quiz).toContain('data-c="show">Show answer</button></div>')
    // A quiz step with nothing to type and no link has no empty follow-up line.
    const writing = M.html.cardHtml(card('quiz', { turns: [], data: { questions: [{ q: 'Q?', answer: 'A', why: '', cite: '' }], i: 1, results: [{ answer: 'A', verdict: 'right' }] } }), { open: true, P, writing: true })
    expect(writing).toContain('Writing the next question')
    expect(writing).not.toContain('mr-follow')
    expect(writing).toContain('class="mr-card__delete"')
    // A quiz's answer field has no Talk (it is an answer, not a question).
    expect(quiz).not.toContain('data-c="talk"')
  })
  it('the action row under the answer: copy alone; the bin in the head beside Minimise (21 Oct 2026)', () => {
    const html = M.html.cardHtml(card('explain'), { open: true, P })
    expect(html).toMatch(/<div class="mr-card__acts"><button type="button" class="mr-card__copy" data-c="copy" aria-label="Copy"><svg[^]*?<\/svg><\/button><\/div>/)
    expect(html).toMatch(/aria-label="Minimise"><svg[^]*?<\/svg><\/button><button type="button" class="mr-card__delete" data-c="delete" aria-label="Delete"><svg[^]*?<\/svg><\/button><\/div>/)
    // A pill card (a recap) has no action row at all: its field is its only row.
    const recap = M.html.cardHtml(card('ask', { data: { pill: 'recap' } }), { open: true, P })
    expect(recap).not.toContain('mr-card__acts')
    expect(recap).not.toContain('data-c="copy"')
    expect(recap).toContain('data-c="talk"')
  })
  it('is drawn visible in every look: a border and radius from the look\'s tokens, the placeholder in the hint colour', () => {
    expect(css).toMatch(/\.mr-follow__box \{[^}]*border: 1px solid var\(--mr-field-line\); border-radius: 12px; background: var\(--mr-field\);/)
    expect(css).toMatch(/\.mr-follow__input::placeholder \{ color: var\(--mr-hint\); opacity: 1;/)
    // Each look defines the field's colours (paper, night, e-ink; book its own field shade), after the reference
    // stylesheet, which stays unchanged.
    expect(css).toContain('.mr { --mr-field: #fdfbf7; --mr-field-line: rgba(32, 26, 19, .26); }')
    expect(css).toContain('.lab.is-book-theme .mr { --mr-field: #f8f2e6; }')
    expect(css).toContain('.lab.is-night .mr { --mr-field: #171411; --mr-field-line: rgba(214, 204, 191, .26); }')
    expect(css).toContain('html[data-eink="true"] .mr, html[data-pdf-theme="eink"] .mr { --mr-field: #fff; --mr-field-line: #111; }')
    // No hairline above the follow-up line any more: the box is the line (the last .mr-follow rule wins).
    const last = [...css.matchAll(/^\.mr-follow \{[^}]*\}/gm)].pop()![0]
    expect(last).toBe('.mr-follow { flex-wrap: wrap; gap: 8px 12px; padding-top: 0; border-top: 0; }')
    // Send: a filled rounded square in the ink, off until there is text; 28px targets for send and the mic.
    expect(css).toMatch(/\.mr-follow__send \{[^}]*width: 28px; height: 28px;[^}]*border-radius: 8px; background: var\(--mr-ink\); color: var\(--mr-card\);/)
    expect(css).toMatch(/\.mr-follow__send:disabled \{ opacity: \.3;/)
    expect(css).toMatch(/\.mr-follow__mic \{[^}]*width: 28px; height: 28px;/)
    // No mono, no capitals in the field's rules.
    const rules = css.split('\n').filter(l => /mr-follow__(box|send|input::placeholder)/.test(l)).join('\n')
    expect(rules).not.toMatch(/mono|uppercase|letter-spacing/i)
  })
  it('the page: the button sends as Enter does, and the field\'s words turn send on', () => {
    expect(reader).toContain("if (c === 'send') { const f = b.closest('.mr-follow')?.querySelector('.mr-follow__input'); if (f) sendFollow(f); return }")
    expect(reader).toMatch(/if \(e\.key !== 'Enter' \|\| e\.shiftKey \|\| e\.isComposing\) return;\n {4}e\.preventDefault\(\);\n {4}sendFollow\(e\.target\);/)
    expect(reader).toContain("if (send) send.disabled = !t.value.trim();")
  })
  it('is mirrored to addbooks/web/src', () => {
    for (const f of ['css/margin.css', 'js/margin.js', 'js/reader.js', 'index.html', 'margin-fixture.html']) {
      expect(readFileSync(ROOT + 'addbooks/web/src/' + f, 'utf8'), f).toBe(readFileSync(ROOT + 'app/public/lab/addbook/' + f, 'utf8'))
    }
  })
})
