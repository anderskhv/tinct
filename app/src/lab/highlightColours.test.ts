import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const index = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
const lab = readFileSync(resolve(process.cwd(), 'src/lab/lab.css'), 'utf8')

const NAMES = ['gold', 'rose', 'sage', 'sky', 'lavender'] as const

/** Every `--highlight-<name>` value in index.css, light block first. */
function tokens(name: string): string[] {
  return [...index.matchAll(new RegExp(`--highlight-${name}:\\s*(#[0-9a-f]{6})`, 'gi'))].map(m => m[1].toLowerCase())
}

function rgb(hex: string) {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
}

function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Body ink on the mark. --ink is #0b0b0b. */
function inkContrast(hex: string) {
  const bg = luminance(hex), ink = luminance('#0b0b0b')
  return (Math.max(bg, ink) + 0.05) / (Math.min(bg, ink) + 0.05)
}

describe('highlight colours', () => {
  it('have exactly one definition, which every surface reads', () => {
    for (const name of NAMES) expect(tokens(name)).toHaveLength(2)
    // The lab reader used to repeat the five as literals, which is how the
    // phone and the desktop could drift apart. It reads the tokens now.
    const marks = [...lab.matchAll(/\.lab-hearing-word\.is-hl-\w+\s*\{\s*background:\s*([^;]+);/g)].map(m => m[1].trim())
    expect(marks.length).toBe(10)
    expect(marks.every(value => value.startsWith('var(--highlight-'))).toBe(true)
  })

  it('has a warm sage: still the green one, but sitting on the cream', () => {
    const [light, dark] = tokens('sage')
    const [r, g, b] = rgb(light)
    // Green is still the dominant channel, by a margin, so it reads as green.
    expect(g).toBeGreaterThan(r + 12)
    expect(g).toBeGreaterThan(b + 12)
    // Warm: blue pulled back below red, which the old #d0e8d0 (r === b) was not.
    expect(b).toBeLessThan(r - 10)
    const [dr, dg, db] = rgb(dark)
    expect(dg).toBeGreaterThan(db + 12)
    expect(db).toBeLessThan(dr)
  })

  it('keeps the ink on it as readable as on the other four', () => {
    const light = NAMES.map(name => inkContrast(tokens(name)[0]))
    const sage = inkContrast(tokens('sage')[0])
    expect(sage).toBeGreaterThan(7) // AAA for body text, with room to spare
    expect(sage).toBeGreaterThanOrEqual(Math.min(...light))
  })

  it('keeps the five distinguishable, green from gold especially', () => {
    // Red/green confusion collapses the hue difference, so the two warm marks
    // have to separate by lightness as well. They separate more than they did
    // when sage was #d0e8d0 (luminance 0.758 against gold's 0.802).
    const gold = luminance(tokens('gold')[0])
    const sage = luminance(tokens('sage')[0])
    expect(Math.abs(gold - sage)).toBeGreaterThan(0.044)
    const values = NAMES.map(name => tokens(name)[0])
    expect(new Set(values).size).toBe(5)
  })
})
