import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { build } = require('../scripts/build-about-page.cjs') as { build: () => string }
const manifest = JSON.parse(readFileSync('public/lab/library_2/author-images.json', 'utf8')) as { images: Array<{ authorName: string; sourcePage: string }> }

describe('/about', () => {
  it('is the committed output of build-about-page.cjs', () => {
    expect(readFileSync('public/about.html', 'utf8')).toBe(build())
  })

  it('credits every author portrait the library uses', () => {
    const html = build()
    for (const image of manifest.images) {
      expect(html, image.authorName).toContain(image.sourcePage.replace(/&/g, '&amp;'))
    }
  })

  it('is self-canonical and indexable, with one h1', () => {
    const html = build()
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/about">')
    expect(html).not.toMatch(/name="robots"/)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
  })
})
