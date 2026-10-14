import { describe, expect, it } from 'vitest'
import { editionShardManifestUrl, editionShardUrl, editionWholeUrl } from '../data/editionUrls'
import {
  isOfflineBookUrl,
  offlineBookExtraUrls,
  offlineBookSaved,
  offlineChapterUrls,
  offlineEditionEntry,
  offlineEditionIsSharded,
  offlineEditionKeys,
} from './labOfflineBook'

// The download list must be exactly what the loaders request, or the service
// worker's cache never answers them offline.
describe('offline book download list', () => {
  it('asks for a sharded edition by its manifest, as loadEditionWindow does', () => {
    expect(offlineEditionIsSharded('anna-karenina', 'original-en')).toBe(true)
    expect(offlineEditionEntry('anna-karenina', 'original-en', 'b1')).toEqual({
      editionKey: 'original-en',
      manifestUrl: editionShardManifestUrl('anna-karenina', 'original-en', 'b1'),
    })
    expect(offlineEditionEntry('anna-karenina', 'original-en', 'b1').manifestUrl).toBe('/data/editions-chapters/anna-karenina-original-en/manifest.json?v=b1')
  })

  it('asks for an unsharded edition (or a reader who turned shards off) by its whole-book JSON', () => {
    expect(offlineEditionEntry('the-awakening', 'original-en', 'b1')).toEqual({
      editionKey: 'original-en',
      wholeUrl: editionWholeUrl('the-awakening', 'original-en', 'b1'),
    })
    expect(offlineEditionEntry('anna-karenina', 'original-en', 'b1', true).wholeUrl).toBe('/data/editions/anna-karenina-original-en.json?v=b1')
  })

  it('always loads the Bible by chapter, as its own loader does', () => {
    expect(offlineEditionIsSharded('bible', 'bsb-en', true)).toBe(true)
    expect(offlineEditionEntry('bible', 'web-en', 'b1').manifestUrl).toBe('/data/editions-chapters/bible-web-en/manifest.json?v=b1')
  })

  it('lists every chapter a manifest names, by its path, else by its number', () => {
    const manifest = { chapters: [
      { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
      { number: 2, title: 'Genesis 2' },
      { number: 1189, title: 'Revelation 22', path: 'ch1189.json' },
      { title: 'no number' },
      { number: 1, title: 'duplicate', path: 'ch0001.json' },
    ] }
    expect(offlineChapterUrls('bible', 'bsb-en', 'b1', manifest)).toEqual([
      editionShardUrl('bible', 'bsb-en', 'ch0001.json', 'b1'),
      '/data/editions-chapters/bible-bsb-en/ch0002.json?v=b1',
      '/data/editions-chapters/bible-bsb-en/ch1189.json?v=b1',
    ])
    expect(offlineChapterUrls('bible', 'bsb-en', 'b1', null)).toEqual([])
    expect(offlineChapterUrls('bible', 'bsb-en', 'b1', { chapters: 'x' })).toEqual([])
  })

  it('adds the cast, and verse lines only for a book that has them', () => {
    expect(offlineBookExtraUrls('hamlet', 'b 1', true)).toEqual(['/data/editions/hamlet-threads.json?v=b%201', '/data/editions/hamlet-lines.json?v=b%201'])
    expect(offlineBookExtraUrls('frankenstein', 'b1', false)).toEqual(['/data/editions/frankenstein-threads.json?v=b1'])
    expect(offlineBookExtraUrls('confessions', 'b1', false)).toEqual([])
    expect(offlineBookExtraUrls('pd-ws-en-q30055204-12ry0ne', 'b1', false)).toEqual([])
  })

  it('saves the main edition, plus compare when it differs', () => {
    expect(offlineEditionKeys('bsb-en', 'web-en')).toEqual(['bsb-en', 'web-en'])
    expect(offlineEditionKeys('bsb-en', 'bsb-en')).toEqual(['bsb-en'])
    expect(offlineEditionKeys('original-en', null)).toEqual(['original-en'])
  })

  it('Remove touches only this book’s saved editions', () => {
    const editions = ['bsb-en', 'web-en']
    expect(isOfflineBookUrl('https://tinct.app/data/editions-chapters/bible-bsb-en/ch0001.json?v=b1', 'bible', editions)).toBe(true)
    expect(isOfflineBookUrl('https://tinct.app/data/editions/bible-threads.json?v=b1', 'bible', editions)).toBe(true)
    expect(isOfflineBookUrl('https://tinct.app/data/editions-chapters/bible-kjv-en/ch0001.json?v=b1', 'bible', editions)).toBe(false)
    expect(isOfflineBookUrl('https://tinct.app/data/editions-chapters/bible-bsb-en-x/ch0001.json', 'bible', editions)).toBe(false)
    expect(isOfflineBookUrl('https://tinct.app/data/editions/frankenstein-original-en.json?v=b1', 'bible', editions)).toBe(false)
  })

  it('counts as saved only for this build and every edition now open', () => {
    const record = { editions: ['bsb-en', 'web-en'], version: 'b1', files: 10, savedAt: 1 }
    expect(offlineBookSaved('bible', ['bsb-en', 'web-en'], 'b1', record)).toBe(true)
    expect(offlineBookSaved('bible', ['bsb-en'], 'b1', record)).toBe(true)
    expect(offlineBookSaved('bible', ['bsb-en', 'kjv-en'], 'b1', record)).toBe(false)
    expect(offlineBookSaved('bible', ['bsb-en'], 'b2', record)).toBe(false)
    expect(offlineBookSaved('bible', ['bsb-en'], 'b1', undefined)).toBe(false)
  })
})
