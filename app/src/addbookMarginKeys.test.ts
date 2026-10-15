/**
 * The PDF reader's margin, PR 4: the keys over a selection (docs/margin/BRIEF.md "Keys (desktop)";
 * DECISIONS.md 2026-10-15). With a selection, N is the note on it and every other printable key
 * opens Ask with that character; nothing happens with Cmd, Ctrl or Alt or while a field has the keys.
 * And the stylesheet's e-ink and target rules keep the reference's values. No DOM events, no network.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Key = Partial<{ key: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean; isComposing: boolean }>
interface MarginApi { selectionKey(e: Key, o?: { inField?: boolean }): { action: 'note' } | { action: 'ask'; ch: string } | null }
let M: MarginApi
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  M = (globalThis as unknown as { TinctMargin: MarginApi }).TinctMargin
})

describe('keys over a selection', () => {
  it('N (either case) is the note; any other printable key is Ask with that character', () => {
    expect(M.selectionKey({ key: 'n' })).toEqual({ action: 'note' })
    expect(M.selectionKey({ key: 'N' })).toEqual({ action: 'note' })
    expect(M.selectionKey({ key: 'W' })).toEqual({ action: 'ask', ch: 'W' })
    expect(M.selectionKey({ key: 'b' })).toEqual({ action: 'ask', ch: 'b' })
    expect(M.selectionKey({ key: '?' })).toEqual({ action: 'ask', ch: '?' })
    expect(M.selectionKey({ key: 'é' })).toEqual({ action: 'ask', ch: 'é' })
  })
  it('never with Cmd, Ctrl or Alt, never while a field has the keys, never for space, named keys or an IME', () => {
    for (const mod of ['metaKey', 'ctrlKey', 'altKey'] as const) expect(M.selectionKey({ key: 'n', [mod]: true })).toBeNull()
    expect(M.selectionKey({ key: 'n' }, { inField: true })).toBeNull()
    expect(M.selectionKey({ key: 'a' }, { inField: true })).toBeNull()
    expect(M.selectionKey({ key: ' ' })).toBeNull()
    expect(M.selectionKey({ key: 'Enter' })).toBeNull()
    expect(M.selectionKey({ key: 'ArrowDown' })).toBeNull()
    expect(M.selectionKey({ key: 'n', isComposing: true })).toBeNull()
  })
})

describe('the stylesheet’s PR 4 rules', () => {
  const css = readFileSync(ROOT + 'app/public/lab/addbook/css/margin.css', 'utf8')
  it('e-ink draws the outlines and rules the shared e-ink profile removes (it drops every box-shadow)', () => {
    expect(readFileSync(ROOT + 'app/public/lab/display-profile.css', 'utf8')).toContain('box-shadow:none!important')
    expect(css).toMatch(/:is\(html\[data-eink="true"\], html\[data-pdf-theme="eink"\]\) :is\(\.mr-card\.is-open, \.mr-primer, \.mr-sheet\) \{ outline: 1px solid var\(--mr-ink\)/)
    expect(css).toMatch(/\.mr-card\.is-folded \{ background: linear-gradient\(var\(--mr-hair\), var\(--mr-hair\)\) left top \/ 1\.5px 100% no-repeat; \}/)
  })
  // FIXES-2026-10-15 PR C: every target at least 28px (it was 24px round an icon).
  it('the colours keep their 20px dot and its ring inside a 28px target; copy, the mics, the quiz links and the handle are 28px', () => {
    expect(css).toContain('button.mr-swatch { width: 28px; height: 28px; margin: 0 1px; padding: 4px; background-clip: content-box !important; }')
    expect(css).toContain('.mr-card__acts button { width: 28px; height: 28px;')
    expect(css).toMatch(/\.mr-follow__mic, \.mr-foot \.mr-follow__mic \{[^}]*width: 28px; height: 28px;/)
    expect(css).toMatch(/\.mr-follow__link \{[^}]*min-height: 28px;/)
    expect(css).toMatch(/\.mr-sheet__grab \{ width: 56px; height: 28px;/)
    expect(css).toMatch(/\.mr-related__row \{[^}]*min-height: 28px;/)
    expect(css).not.toMatch(/(?:width|height): 24px/)
  })
})
