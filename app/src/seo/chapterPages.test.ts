import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const sitemap = require('../../scripts/generate-sitemap.cjs') as {
  loadPublicBooks: () => Array<{ id: string; title: string; author: string }>
  loadPreferredEdition: (bookId: string) => { file: string; data: { chapters: Array<{ title?: string; paragraphs?: string[] }> } } | null
  buildGeneratedChapterPage: (
    book: { id: string; title: string; author: string },
    edition: { data: { chapters: unknown[] } },
    chapter: { title?: string; paragraphs?: string[] },
    index: number,
    opts?: { totalChapters?: number },
  ) => string
  buildSitemap: (books: Array<{ id: string; title: string; author: string }>) => string
  textChapterBookIds: (books: Array<{ id: string }>) => Set<string>
}

describe('crawlable chapter pages', () => {
  it('embeds the authoritative Odyssey text with stable paragraph ids', () => {
    const books = sitemap.loadPublicBooks()
    const odyssey = books.find(book => book.id === 'odyssey')
    expect(odyssey).toBeTruthy()
    const edition = sitemap.loadPreferredEdition('odyssey')
    expect(edition?.data.chapters?.length).toBe(24)
    const chapter = edition!.data.chapters[0]
    const html = sitemap.buildGeneratedChapterPage(odyssey!, edition!, chapter, 0, { totalChapters: 24 })

    expect(html).toContain('Tell me, O Muse, of that ingenious hero')
    expect(html).toContain('id="p1"')
    expect(html).toContain('data-paragraph-index="0"')
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/read/odyssey/1">')
    expect(html).not.toContain('crawler-readable excerpt')
    expect(chapter.paragraphs?.length || 0).toBeGreaterThan(1)
    expect(html).toContain(`id="p${chapter.paragraphs!.length}"`)
  })

  it('lists Odyssey chapter URLs in the sitemap', () => {
    const books = sitemap.loadPublicBooks()
    expect(sitemap.textChapterBookIds(books).has('odyssey')).toBe(true)
    const xml = sitemap.buildSitemap(books)
    expect(xml).toContain('<loc>https://tinct.app/read/odyssey/1</loc>')
    expect(xml).toContain('<loc>https://tinct.app/read/odyssey/24</loc>')
    expect(xml).not.toContain('<loc>https://tinct.app/read/odyssey/25</loc>')
  })
})
