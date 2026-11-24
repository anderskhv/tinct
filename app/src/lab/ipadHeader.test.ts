import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// iPad: iOS Safari's scroll-edge blur faded through the transparent desktop
// header (Anders, 24 Nov 2026). The desktop layout under a finger gets the
// phone's opaque, pinned header and the visible viewport's height.
describe('the iPad header', () => {
  const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
  const block = css.slice(css.lastIndexOf('@media (hover: none) and (pointer: coarse) {'))

  it('is opaque and pinned on a touch screen without hover', () => {
    expect(block).toMatch(/\.lab\[data-chrome-version="v2"\]\.is-desktop \.lab-header \{\s*position: sticky;\s*top: 0;\s*background: var\(--lab-paper\);/)
  })

  it('sizes the reader to the visible viewport there', () => {
    expect(block).toMatch(/\.lab\[data-chrome-version="v2"\]\.is-desktop \{ height: 100svh; \}/)
  })
})
