/**
 * The own-book margin reader's saved-highlight bar goes like the book reader's (Anders, 11 Nov 2026):
 * at the first scroll or wheel turn, and on the desktop when the mouse leaves it, with the same numbers.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { HIGHLIGHT_MENU_LEAVE_MS, HIGHLIGHT_MENU_LEAVE_SLACK_PX, insideHighlightMenu } from './lab/labHighlightMenuLeave'

const require = createRequire(import.meta.url)
require(resolve(__dirname, '../public/lab/addbook/js/margin.js'))
const M = (globalThis as unknown as { TinctMargin: {
  MENU_LEAVE: { ms: number; slack: number }
  insideMenu(x: number, y: number, boxes: Array<{ left: number; top: number; right: number; bottom: number }>, slack?: number): boolean
} }).TinctMargin
const readerJs = readFileSync(resolve(__dirname, '../public/lab/addbook/js/reader.js'), 'utf8')

describe('own-book margin reader: a saved highlight bar leaves as in the book reader', () => {
  it('uses the book reader’s grace and slack', () => {
    expect(M.MENU_LEAVE).toEqual({ ms: HIGHLIGHT_MENU_LEAVE_MS, slack: HIGHLIGHT_MENU_LEAVE_SLACK_PX })
  })

  it('inside the bar means inside its box grown by the slack, like the book reader', () => {
    const boxes = [{ left: 100, top: 100, right: 300, bottom: 144 }]
    for (const [x, y] of [[100, 100], [90, 95], [312, 156], [313, 120], [200, 157], [87, 120], [0, 0]] as const) {
      expect(M.insideMenu(x, y, boxes)).toBe(insideHighlightMenu(x, y, boxes))
    }
    expect(M.insideMenu(312, 156, boxes)).toBe(true)
    expect(M.insideMenu(313, 120, boxes)).toBe(false)
    expect(M.insideMenu(150, 120, [{ left: 0, top: 0, right: 0, bottom: 0 }])).toBe(false)
  })

  it('reader.js closes a saved highlight bar on scroll and wheel, and watches the mouse only on a fine pointer', () => {
    expect(readerJs).toMatch(/savedBar\(\) && !mrPointerDown\) \{ marginClose\(\); return \}/)
    expect(readerJs).toMatch(/addEventListener\('wheel'/)
    expect(readerJs).toMatch(/\(hover: hover\) and \(pointer: fine\)/)
    expect(readerJs).toMatch(/if \(e\.pointerType !== 'mouse'\) return/)
    expect(readerJs).toMatch(/m\.leaveStop\?\.\(\)|leaveStop\?\.\(\)/)
  })
})
