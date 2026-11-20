import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')

/** Every rule body whose selector list names this class (any prefix, any state). */
function rulesFor(className: string): string[] {
  const bodies: string[] = []
  const pattern = /([^{}]+)\{([^{}]*)\}/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(css))) {
    const selectors = match[1].split(',').map(part => part.trim())
    if (selectors.some(selector => new RegExp(`\\.${className}(?![\\w-])`).test(selector))) bodies.push(match[2])
  }
  return bodies
}

/**
 * The reader's Aa, Book settings and Audio settings sheets are UI chrome: system UI,
 * never mono (docs/design-system.md, rule 1). An iPhone showed the edition
 * values ("Tinct Modern English", "Follow main version") in a monospace face
 * (14 Oct 2026). The phone's visually hidden status line is chrome too, and a
 * mono face there cost the first paint a font download.
 */
describe('reader sheet type', () => {
  const chrome = [
    'lab-status',
    'lab-v2-edition-current',
    'lab-v2-difficulty',
    'lab-v2-back',
    'lab-v2-theme-label',
    'lab-v2-value',
    'lab-v2-step-value',
    'lab-v2-group-label',
    'lab-v2-pill',
    'lab-v2-version-pill',
    'lab-talk-speed-step',
  ]

  it.each(chrome)('.%s is never set in a monospace face', className => {
    const rules = rulesFor(className)
    expect(rules.length).toBeGreaterThan(0)
    for (const body of rules) expect(body).not.toMatch(/monospace|Plex Mono|Menlo/i)
  })

  it('sets the edition values in the system UI face', () => {
    const [value] = rulesFor('lab-v2-edition-current')
    expect(value).toMatch(/font: 12px\/1\.4 system-ui/)
  })
})
