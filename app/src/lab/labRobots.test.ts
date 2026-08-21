import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('lab robots policy', () => {
  it('disallows /lab in robots.txt', () => {
    const robots = readFileSync(resolve(__dirname, '../../public/robots.txt'), 'utf8')
    expect(robots).toMatch(/Disallow:\s*\/lab\b/)
    expect(robots).toMatch(/Disallow:\s*\/lab\//)
  })
})
