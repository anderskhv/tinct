import { describe, expect, it } from 'vitest'
import { NARRATION_REPLAY_KEY, readNarrationReplay, storeNarrationReplay } from './narrationReplayCache'
import type { NarrationParagraphState } from './labNarration'
const hash = 'a'.repeat(64)
const scope = { bookId: 'bible', editionKey: 'web-en', chapter: 7, identity: 'b'.repeat(64) }
function storage() {
  const values = new Map<string,string>()
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key,value) } }
}
function paragraph(): NarrationParagraphState {
  return { paragraph: 0, status: 'ready', textHash: hash, chunkCount: 1, readyChunks: 1, chunks: [
    { index: 0, wordFrom: 0, wordTo: 2, ready: true, hash, url: '/api/audio-file?path=' + encodeURIComponent('narration/grok/blob/' + hash + '.mp3'), duration: 1.5 },
  ] }
}
describe('persistent narration metadata', () => {
  it('survives a fresh reader and separates exact configuration/book/edition/chapter identities', () => {
    const device = storage()
    storeNarrationReplay(scope, [paragraph()], device)
    expect(readNarrationReplay(scope, device)).toEqual([paragraph()])
    for (const changed of [{ identity: 'c'.repeat(64) }, { bookId: 'ezra' }, { editionKey: 'bsb-en' }, { chapter: 8 }, { identity: null }]) {
      expect(readNarrationReplay({ ...scope, ...changed }, device)).toEqual([])
    }
  })
  it('never retains incomplete clips or arbitrary audio URLs', () => {
    const device = storage()
    const partial = { ...paragraph(), status: 'partial' as const }
    const wrong = paragraph(); wrong.chunks[0].url = 'https://example.org/audio.mp3'
    storeNarrationReplay(scope, [partial, wrong], device)
    expect(readNarrationReplay(scope, device)).toEqual([])
    device.setItem(NARRATION_REPLAY_KEY, 'corrupt')
    expect(readNarrationReplay(scope, device)).toEqual([])
  })
  it('replaces changed text metadata and tolerates blocked device storage', () => {
    const device = storage(), updated = { ...paragraph(), textHash: 'd'.repeat(64) }
    storeNarrationReplay(scope, [paragraph()], device)
    storeNarrationReplay(scope, [updated], device)
    expect(readNarrationReplay(scope, device)).toEqual([updated])
    expect(() => storeNarrationReplay(scope, [paragraph()], {getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}})).not.toThrow()
  })
})
