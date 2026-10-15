/**
 * The PDF reader's layouts (the Aa panel, 15 Oct 2026): the pure rules in
 * public/lab/addbook/js/reader-layout.js. Margin view or Focus view for a PDF, kept per device;
 * none for an EPUB (no margin yet); the reading place kept across a switch; Focus view's answers
 * in a pop-up window that stays inside the screen. No network and no AI.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Rect = { left: number; top: number; right: number; bottom: number }
type Place = { page: number; frac: number }
interface LayoutApi {
  DEFAULT: string
  TINCT_TEXT: string
  layoutOf(prefs: Record<string, unknown> | null, kind: string | null): string
  withLayout(prefs: Record<string, unknown> | null, layout: string): Record<string, unknown>
  options(kind: string | null, o?: { layout?: string; hasText?: boolean; tinctText?: string }): Array<{ id: string; label: string; on: boolean; leaves?: boolean }>
  surface(layout: string, o: { phone?: boolean; width?: number; narrow?: number }): string
  answerHost(surface: string): string | null
  switchLayout(from: string, to: string, o: { place: () => Place; apply: (to: string) => void; goTo: (p: Place) => void; save?: () => void }): Place | null
  placePopup(o: { frame: Rect; passage?: Rect | null; pageRight?: number | null; w?: number; h: number; phone?: boolean }): { left: number; top: number; width: number; maxHeight: number; side: string }
}
require(ROOT + 'app/public/lab/addbook/js/reader-layout.js')
const L = (globalThis as unknown as { TinctReaderLayout: LayoutApi }).TinctReaderLayout
const READER = readFileSync(ROOT + 'app/public/lab/addbook/js/reader.js', 'utf8')

describe('the layout choice', () => {
  it('is Margin view unless Focus view was chosen, and is kept with the device’s prefs', () => {
    expect(L.layoutOf(null, 'pdf')).toBe('margin')
    expect(L.layoutOf({ layout: 'nonsense' }, 'pdf')).toBe('margin')
    // As reader.js keeps it: tinct-addbook:prefs in localStorage, JSON.
    const storage = new Map<string, string>()
    const save = (p: Record<string, unknown>) => storage.set('tinct-addbook:prefs', JSON.stringify(p))
    const load = () => JSON.parse(storage.get('tinct-addbook:prefs') || 'null')
    save(L.withLayout({ trim: false, rate: 1.25 }, 'focus'))
    expect(load()).toEqual({ trim: false, rate: 1.25, layout: 'focus' })
    expect(L.layoutOf(load(), 'pdf')).toBe('focus')
    // Margin view, the default, is stored as no choice; the other prefs stay.
    save(L.withLayout(load(), 'margin'))
    expect(load()).toEqual({ trim: false, rate: 1.25 })
    expect(L.layoutOf(load(), 'pdf')).toBe('margin')
  })
  it('reader.js stores it in its prefs and reads it from there', () => {
    expect(READER).toContain('const viewLayout = () => RL.layoutOf(prefs, state.kind);')
    expect(READER).toMatch(/const next = RL\.withLayout\(prefs, to\); delete prefs\.layout; if \(next\.layout\) prefs\.layout = next\.layout; savePrefs\(\);/)
  })
})

describe('EPUBs', () => {
  it('have no Margin view (no margin yet) and no layout to choose; a stored Focus view does not apply', () => {
    expect(L.options('epub', { hasText: true })).toEqual([])
    expect(L.options('epub').some(o => /margin/i.test(o.label))).toBe(false)
    expect(L.layoutOf({ layout: 'focus' }, 'epub')).toBe('margin')
  })
  it('PDFs offer Margin view (default) and Focus view, and Convert to Tinct book when the PDF has a Tinct text', () => {
    expect(L.options('pdf').map(o => o.label)).toEqual(['Margin view (default)', 'Focus view'])
    expect(L.options('pdf', { layout: 'focus' }).filter(o => o.on).map(o => o.id)).toEqual(['focus'])
    const withText = L.options('pdf', { hasText: true })
    expect(withText.map(o => o.label)).toEqual(['Margin view (default)', 'Focus view', 'Convert to Tinct book'])
    expect(withText[2]).toMatchObject({ id: 'text', on: false, leaves: true })
    // The one switch that moves it to its own row instead.
    expect(L.TINCT_TEXT).toBe('layout')
    expect(L.options('pdf', { hasText: true, tinctText: 'row' }).map(o => o.id)).toEqual(['margin', 'focus'])
  })
})

describe('the reading place across a switch', () => {
  it('is read before the change and gone back to after it, then kept', () => {
    const calls: string[] = []
    let at: Place = { page: 7, frac: 0.42 }
    const kept = L.switchLayout('margin', 'focus', {
      place: () => { calls.push('place'); return { ...at } },
      // The change re-sizes the pages: the scroll position alone would now be another place.
      apply: to => { calls.push('apply ' + to); at = { page: 6, frac: 0.9 } },
      goTo: p => { calls.push(`goTo ${p.page} ${p.frac}`); at = p },
      save: () => calls.push('save'),
    })
    expect(calls).toEqual(['place', 'apply focus', 'goTo 7 0.42', 'save'])
    expect(kept).toEqual({ page: 7, frac: 0.42 })
    expect(at).toEqual({ page: 7, frac: 0.42 })
    // Back again, the same.
    L.switchLayout('focus', 'margin', { place: () => at, apply: () => { at = { page: 1, frac: 0 } }, goTo: p => { at = p } })
    expect(at).toEqual({ page: 7, frac: 0.42 })
  })
  it('does nothing when the layout is the same', () => {
    let touched = false
    expect(L.switchLayout('focus', 'focus', { place: () => { touched = true; return { page: 1, frac: 0 } }, apply: () => { touched = true }, goTo: () => { touched = true } })).toBeNull()
    expect(touched).toBe(false)
  })
})

describe('Focus view', () => {
  it('sends every answer to the pop-up window, at any width; Margin view keeps its column, marks and bottom card', () => {
    for (const o of [{ width: 1440 }, { width: 1024 }, { phone: true, width: 390 }]) {
      expect(L.surface('focus', o)).toBe('focus')
      expect(L.answerHost(L.surface('focus', o))).toBe('popup')
    }
    expect(L.answerHost(L.surface('margin', { width: 1440 }))).toBe('column')
    expect(L.answerHost(L.surface('margin', { width: 1024 }))).toBe('float')
    expect(L.answerHost(L.surface('margin', { phone: true, width: 390 }))).toBe('sheet')
  })
  it('reader.js draws Focus view’s cards, the whole-PDF chat and the primer in the pop-up', () => {
    expect(READER).toContain("if (mode === 'focus') return layoutFocus(vis);")
    expect(READER).toContain("placeFloat(vis.find(v => v.card.id === col.open), { popup: true });")
    expect(READER).toMatch(/if \(popup\) \{[^\n]*return placePopupEl\(el,/)
    expect(READER).toContain('return TinctReaderLayout.surface(viewLayout(), { phone: isPhone(), width: innerWidth, narrow: TinctMargin.COL.narrow });')
  })
  const inside = (r: { left: number; top: number; width: number }, h: number, f: Rect) => r.left >= f.left && r.left + r.width <= f.right && r.top >= f.top && r.top + h <= f.bottom
  const covers = (r: { left: number; top: number; width: number }, h: number, p: Rect) => Math.min(r.left + r.width, p.right) > Math.max(r.left, p.left) && Math.min(r.top + h, p.bottom) > Math.max(r.top, p.top)
  it('places the pop-up inside the screen and clear of its passage, desktop and phone', () => {
    const desk = { left: 0, top: 50, right: 1280, bottom: 800 }
    const phone = { left: 0, top: 46, right: 390, bottom: 844 }
    const cases: Array<[Rect, Rect, number, boolean, number | null]> = [
      [desk, { left: 400, top: 120, right: 800, bottom: 160 }, 300, false, 1040],
      [desk, { left: 400, top: 600, right: 800, bottom: 640 }, 300, false, 1040],
      [desk, { left: 400, top: 300, right: 800, bottom: 340 }, 2000, false, 1040],
      [phone, { left: 16, top: 120, right: 374, bottom: 150 }, 260, true, null],
      [phone, { left: 16, top: 700, right: 374, bottom: 730 }, 260, true, null],
      [phone, { left: 16, top: 400, right: 374, bottom: 430 }, 1200, true, null],
    ]
    for (const [frame, passage, h, isPhone, pageRight] of cases) {
      const at = L.placePopup({ frame, passage, pageRight, h, phone: isPhone })
      const shown = Math.min(h, at.maxHeight)
      expect(inside(at, shown, frame), JSON.stringify([passage, h, at])).toBe(true)
      expect(covers(at, shown, passage), JSON.stringify([passage, h, at])).toBe(false)
      expect(at.width).toBe(isPhone ? 366 : 380)
    }
  })
  it('sits beside the page when there is room right of it, level with the passage', () => {
    const at = L.placePopup({ frame: { left: 0, top: 50, right: 1440, bottom: 900 }, passage: { left: 400, top: 300, right: 800, bottom: 340 }, pageRight: 960, h: 400 })
    expect(at).toMatchObject({ left: 984, top: 296, side: 'beside' })
  })
  it('without a passage (the whole-PDF chat): centred at the top on the desktop, at the bottom on the phone', () => {
    expect(L.placePopup({ frame: { left: 0, top: 50, right: 1280, bottom: 800 }, h: 300 })).toMatchObject({ left: 450, top: 66, side: 'none' })
    expect(L.placePopup({ frame: { left: 0, top: 46, right: 390, bottom: 844 }, h: 300, phone: true })).toMatchObject({ left: 12, top: 532, side: 'none' })
  })
})

describe('the Aa panel', () => {
  it('replaces the Tinct text button in the top bar; Book editions leaves the t menu', () => {
    const html = readFileSync(ROOT + 'app/public/lab/addbook/index.html', 'utf8')
    expect(html).not.toContain('id="textBtn"')
    expect(html).toContain('<button type="button" class="byob-aa" id="aaBtn"')
    expect(html.indexOf('js/reader-layout.js?v=')).toBeGreaterThan(-1)
    expect(html.indexOf('js/reader-layout.js?v=')).toBeLessThan(html.indexOf('js/reader.js?v='))
    expect(READER).not.toContain("['editions', 'Book editions'")
  })
  it('the source copy (addbooks/web/src) matches the installed layout script', () => {
    expect(readFileSync(ROOT + 'addbooks/web/src/js/reader-layout.js', 'utf8')).toBe(readFileSync(ROOT + 'app/public/lab/addbook/js/reader-layout.js', 'utf8'))
  })
})
