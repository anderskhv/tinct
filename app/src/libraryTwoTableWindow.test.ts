// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module of the library page
import { tableWindow, bookBox } from '../public/lab/library_2/table-window.js'

const spines = (count: number, width = 30) => Array.from({ length: count }, () => width)

describe('the reading table with many books in progress', () => {
  it('stands every book when they fit (1 and 3 books)', () => {
    expect(tableWindow(spines(1), 0, 600)).toEqual({ from: 0, to: 0 })
    expect(tableWindow(spines(3), 1, 600)).toEqual({ from: 0, to: 2 })
    expect(tableWindow(spines(3), 0, 600)).toEqual({ from: 0, to: 2 })
  })

  it('shows only the nearest books that fit the room, balanced around the chosen one', () => {
    // A phone: room for four spines of ten books.
    expect(tableWindow(spines(10), 5, 120)).toEqual({ from: 3, to: 7 })
    // At either end the window runs to the one side that has books.
    expect(tableWindow(spines(10), 0, 120)).toEqual({ from: 0, to: 4 })
    expect(tableWindow(spines(10), 9, 120)).toEqual({ from: 5, to: 9 })
    // Six books, room for five spines: all six stand.
    expect(tableWindow(spines(6), 2, 150)).toEqual({ from: 0, to: 5 })
  })

  it('never stands more than eight spines, however wide the stage', () => {
    for (const current of [0, 5, 11]) {
      const { from, to } = tableWindow(spines(12), current, 10_000)
      expect(to - from).toBe(8)
      expect(current).toBeGreaterThanOrEqual(from)
      expect(current).toBeLessThanOrEqual(to)
    }
  })

  it('keeps the chosen book even with no room beside it, and never overruns the room', () => {
    expect(tableWindow(spines(10), 4, 0)).toEqual({ from: 4, to: 4 })
    const costs = [40, 12, 55, 20, 33, 18, 60, 25, 30, 15]
    for (let current = 0; current < costs.length; current++) {
      const { from, to } = tableWindow(costs, current, 100)
      const used = costs.slice(from, to + 1).reduce((sum, cost) => sum + cost, 0) - costs[current]
      expect(used).toBeLessThanOrEqual(100)
    }
  })

  it('hides books beyond the window and gives phones the dots once there are many books', () => {
    const js = readFileSync(resolve(__dirname, '../public/lab/library_2/reading-table.js'), 'utf8')
    const css = readFileSync(resolve(__dirname, '../public/lab/library_2/styles.css'), 'utf8')
    // The geometry is table-layout.js (shared with the first paint's placeholder in boot.js, 2026-10-10).
    const layout = readFileSync(resolve(__dirname, '../public/lab/library_2/table-layout.js'), 'utf8')
    expect(layout).toMatch(/away: i < from \|\| i > to/)
    expect(js).toMatch(/classList\.toggle\('is-away', box\.away\)/)
    // A hidden book is not a tap target either.
    expect(js).toMatch(/if\(book\.classList\.contains\('is-away'\)\)return false/)
    expect(css).toMatch(/\.rt-b\.is-away\{[^}]*visibility:hidden[^}]*pointer-events:none/)
    expect(css).toMatch(/\.reading-table\.has-many \.rt-dots\{display:flex/)
    // Room for the remove × before the first spine on either side.
    expect(layout).toMatch(/Math\.max\(H \* 0\.08, removable \? 24 : 0\)/)
    expect(js).toMatch(/removable: !!options\.onRemoveReading/)
  })

  it('stands each book in its own cover\'s shape, never stretched or cropped (The Beginning of Infinity, 2026-10-09)', () => {
    const H = 300
    const shape = (aspect: number) => { const { w, h } = bookBox(H, aspect); return w / h }
    // A tall EPUB cover (1600×2560), the library's 2:3 and a wide cover: each keeps its shape.
    for (const aspect of [0.5, 0.625, 2 / 3, 0.707, 0.8, 1]) expect(shape(aspect)).toBeCloseTo(aspect, 6)
    // Up to 3:4 every book stands the table's full height; wider ones are no wider than 0.75 of it, so shorter.
    expect(bookBox(H, 0.625)).toEqual({ w: 187.5, h: 300 })
    expect(bookBox(H, 2 / 3).h).toBeCloseTo(300, 6)
    expect(bookBox(H, 0.8)).toEqual({ w: 225, h: 281.25 })
    for (const aspect of [0.3, 0.5, 0.625, 0.8, 1, 1.41, 4]) {
      const { w, h } = bookBox(H, aspect)
      expect(h).toBeLessThanOrEqual(H + 1e-9)
      expect(w).toBeLessThanOrEqual(H * 0.75 + 1e-9)
    }
    // Beyond the bounds the face is held to them (the painting is letterboxed inside it).
    expect(shape(1.41)).toBeCloseTo(1, 6)
    expect(shape(0.3)).toBeCloseTo(0.5, 6)
    // Not known yet (not loaded, broken): the library's 2:3.
    for (const unknown of [NaN, 0, Infinity, undefined]) expect(bookBox(H, unknown as unknown as number)).toEqual(bookBox(H, 2 / 3))
  })

  it('shows a cover whole on the table: contained in its face, never object-fit: cover', () => {
    const js = readFileSync(resolve(__dirname, '../public/lab/library_2/reading-table.js'), 'utf8')
    const css = readFileSync(resolve(__dirname, '../public/lab/library_2/styles.css'), 'utf8')
    expect(css).toMatch(/\.rt-front img\{[^}]*object-fit:contain/)
    expect(css).not.toMatch(/\.rt-front img\{[^}]*object-fit:cover/)
    // The reflection is the same painting, contained the same way.
    expect(css).toMatch(/\.rt-refl-front\{[^}]*var\(--cover\) 50% 50%\/contain no-repeat/)
    // Each book's size follows its own cover once that cover has loaded.
    expect(js).toMatch(/naturalWidth \/ img\.naturalHeight/)
    expect(js).toMatch(/aspect: aspects\[i\]/)
    expect(readFileSync(resolve(__dirname, '../public/lab/library_2/table-layout.js'), 'utf8')).toMatch(/bookBox\(H, books\[i\]\.aspect\)/)
  })
})
