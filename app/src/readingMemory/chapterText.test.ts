import { describe, expect, it } from 'vitest'
import { chapterShardPath, loadChapterText } from './chapterText'

function fetchFrom(routes: Record<string, unknown>) {
  const calls: string[] = []
  const fetchImpl = async (url: string) => {
    calls.push(url)
    const hit = routes[url.split('?')[0]]
    return { ok: hit !== undefined, json: async () => hit }
  }
  return { fetchImpl, calls }
}

describe('chapter text resolver', () => {
  it('pads shard paths like the edition manifests', () => {
    expect(chapterShardPath(1)).toBe('ch0001.json')
    expect(chapterShardPath(1147)).toBe('ch1147.json')
  })

  it('reads the chapter shard first', async () => {
    const { fetchImpl, calls } = fetchFrom({
      '/data/editions-chapters/bible-kjv-en/ch1147.json': { number: 1147, title: 'James 1', paragraphs: ['James, a servant'] },
    })
    const chapter = await loadChapterText({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1147, fetchImpl, version: 'abc' })
    expect(chapter).toEqual({ title: 'James 1', paragraphs: ['James, a servant'] })
    expect(calls).toEqual(['/data/editions-chapters/bible-kjv-en/ch1147.json?v=abc'])
  })

  it('falls back when a registered shard is unavailable', async () => {
    const {fetchImpl,calls}=fetchFrom({'/data/editions/bible-kjv-en.json':{chapters:[{number:1,title:'Genesis 1',paragraphs:['In the beginning']}]}})
    expect(await loadChapterText({bookId:'bible',editionKey:'kjv-en',chapterNumber:1,fetchImpl})).toEqual({title:'Genesis 1',paragraphs:['In the beginning']})
    expect(calls).toEqual(['/data/editions-chapters/bible-kjv-en/ch0001.json','/data/editions/bible-kjv-en.json'])
  })

  it('loads unsharded editions directly and returns null for a missing chapter', async () => {
    const { fetchImpl, calls } = fetchFrom({
      '/data/editions/plato-republic-original-en.json': { chapters: [{ number: 1, title: 'Book I', paragraphs: ['I went down yesterday'] }] },
    })
    const chapter = await loadChapterText({ bookId: 'plato-republic', editionKey: 'original-en', chapterNumber: 1, fetchImpl })
    expect(chapter).toEqual({ title: 'Book I', paragraphs: ['I went down yesterday'] })
    expect(calls).toEqual([
      '/data/editions/plato-republic-original-en.json',
    ])
    expect(await loadChapterText({ bookId: 'plato-republic', editionKey: 'original-en', chapterNumber: 9, fetchImpl })).toBeNull()
  })
})
