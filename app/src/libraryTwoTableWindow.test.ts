// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module of the library page
import { tableWindow } from '../public/lab/library_2/table-window.js'

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
    expect(js).toMatch(/classList\.toggle\('is-away', i < from \|\| i > to\)/)
    // A hidden book is not a tap target either.
    expect(js).toMatch(/if\(book\.classList\.contains\('is-away'\)\)return false/)
    expect(css).toMatch(/\.rt-b\.is-away\{[^}]*visibility:hidden[^}]*pointer-events:none/)
    expect(css).toMatch(/\.reading-table\.has-many \.rt-dots\{display:flex/)
    // Room for the remove × before the first spine on either side.
    expect(js).toMatch(/Math\.max\(H \* 0\.08, options\.onRemoveReading \? 24 : 0\)/)
  })
})
