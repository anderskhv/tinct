import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  editionChapterShardManifestUrl,
  editionDataUrl,
  isChapterShardedEdition,
  loadEditionWindow,
} from './editionLoader'

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('editionLoader chapter shards', () => {
  beforeEach(() => {
    vi.stubGlobal('__BUILD_VERSION__', 'dev')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads a chapter window from shards without fetching whole-book JSON', async () => {
    const requested: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      requested.push(url)
      if (url.includes('/api/edition-patches')) return jsonResponse([])
      if (url.includes('/manifest.json')) {
        return jsonResponse({
          format: 'tinct-edition-chapters-v1',
          bookId: 'anna-karenina',
          editionKey: 'modern-en',
          chapters: [
            { number: 1, title: 'One', path: 'ch0001.json', paragraphCount: 1 },
            { number: 2, title: 'Two', path: 'ch0002.json', paragraphCount: 1 },
            { number: 3, title: 'Three', path: 'ch0003.json', paragraphCount: 1 },
            { number: 4, title: 'Four', path: 'ch0004.json', paragraphCount: 1 },
          ],
        })
      }
      const chapterMatch = url.match(/ch000(\d)\.json/)
      if (chapterMatch) {
        return jsonResponse({ paragraphs: [`chapter ${chapterMatch[1]}`] })
      }
      return new Response('not found', { status: 404 })
    }))

    const data = await loadEditionWindow('anna-karenina', 'modern-en', 2, { bypassCache: true })

    expect(data.windowed).toEqual({ complete: false, centerChapter: 2, loadedChapters: [1, 2, 3] })
    expect(data.chapters.map(ch => ch.paragraphs)).toEqual([
      ['chapter 1'],
      ['chapter 2'],
      ['chapter 3'],
      [],
    ])
    expect(requested.some(url => url.includes('/data/editions/anna-karenina-modern-en.json'))).toBe(false)
  })

  it('keeps sharded and whole-book URLs explicit for prefetch callers', () => {
    expect(isChapterShardedEdition('anna-karenina', 'modern-en')).toBe(true)
    expect(editionChapterShardManifestUrl('anna-karenina', 'modern-en'))
      .toBe('/data/editions-chapters/anna-karenina-modern-en/manifest.json?v=dev')
    expect(editionDataUrl('odyssey', 'modern-en'))
      .toBe('/data/editions/odyssey-modern-en.json?v=dev')
  })

  it('starts patch lookup with the shard load and reuses it across chapter windows', async () => {
    const requested: string[] = []
    let patchCalls = 0
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      requested.push(url)
      if (url.includes('/api/edition-patches')) {
        patchCalls += 1
        return jsonResponse([
          { chapter_number: 11, paragraph_index: 0, patched_text: 'patched chapter 11' },
        ])
      }
      if (url.includes('/manifest.json')) {
        return jsonResponse({
          format: 'tinct-edition-chapters-v1',
          bookId: 'war-and-peace',
          editionKey: 'modern-en',
          chapters: [
            { number: 10, title: 'Ten', path: 'ch0010.json', paragraphCount: 1 },
            { number: 11, title: 'Eleven', path: 'ch0011.json', paragraphCount: 1 },
            { number: 12, title: 'Twelve', path: 'ch0012.json', paragraphCount: 1 },
            { number: 13, title: 'Thirteen', path: 'ch0013.json', paragraphCount: 1 },
          ],
        })
      }
      const chapterMatch = url.match(/ch00(\d+)\.json/)
      if (chapterMatch) {
        return jsonResponse({ paragraphs: [`original chapter ${Number(chapterMatch[1])}`] })
      }
      return new Response('not found', { status: 404 })
    }))

    const first = await loadEditionWindow('war-and-peace', 'modern-en', 11)
    const second = await loadEditionWindow('war-and-peace', 'modern-en', 12)

    expect(requested[0]).toContain('/api/edition-patches')
    expect(first.chapters.find(ch => ch.number === 11)?.paragraphs[0]).toBe('patched chapter 11')
    expect(second.chapters.find(ch => ch.number === 11)?.paragraphs[0]).toBe('patched chapter 11')
    expect(patchCalls).toBe(1)
  })
})
