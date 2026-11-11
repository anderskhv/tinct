import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { chapterAnchorMap, mapPlaceThroughAnchors, placeAtWordOffset, wordOffsetOfPlace, type EditionAnchorFile } from './labEditionAnchors'
import { anchorToken, buildChapterAnchors, buildEditionAnchorFile } from './labEditionAnchorsBuild'
import { tokenizeHearingWords } from './labHearing'
import { buildProportionalAlignment } from './labVerseAlignment'
import odysseyAnchors from '../data/editionAnchors/odyssey.json'

const edition = (name: string) => JSON.parse(readFileSync(resolve(__dirname, `../../public/data/editions/${name}.json`), 'utf8')) as { chapters: Array<{ number: number; paragraphs: string[] }> }
const butler = edition('odyssey-original-en')
const pope = edition('odyssey-verse-en')
const modern = edition('odyssey-modern-en')
const file = odysseyAnchors as unknown as EditionAnchorFile
const chapterOf = (data: typeof butler, number: number) => data.chapters.find(chapter => chapter.number === number)!.paragraphs
const counts = (paragraphs: string[]) => paragraphs.map(text => tokenizeHearingWords(text).length)
const words = (paragraphs: string[]) => paragraphs.flatMap(text => tokenizeHearingWords(text).map(word => word.text))
const aligned = (key: string) => key !== 'verse-en'
const mapOf = (number: number, from: [string, string[]], to: [string, string[]]) => chapterAnchorMap(file, {
  bookId: 'odyssey', chapterNumber: number, aligned,
  from: { edition: from[0], counts: counts(from[1]) }, to: { edition: to[0], counts: counts(to[1]) },
})

describe('anchor tokens', () => {
  it('spell a word as both translations might', () => {
    expect(anchorToken('Phæacians,')).toBe('phaeacian')
    expect(anchorToken('stretch’d')).toBe('stretched')
    // The final s goes from names too, in both texts alike, which is all an anchor needs.
    expect(anchorToken('Alcinous’s')).toBe(anchorToken('Alcinous'))
    expect(anchorToken('“Laodamas”')).toBe(anchorToken('Laodamas,'))
    expect(anchorToken('harbours,')).toBe(anchorToken('harbour'))
  })
})

describe('building anchors', () => {
  const a = ['The maid brought a golden ewer and a silver basin for his hands today.', 'Then Pontonous mixed the wine and every man made his offering there.', 'At last Laodamas rose from the carven seat beside the hearth again.']
  const b = ['A golden ewer the handmaid brings,\nand pours it on his hands;', 'Pontonous heard, and mixed the bowl,\nthe goblet moves around;', 'And from his seat Laodamas removed,\nbeside the hearth he stood.']

  it('rise in both texts, start at the start and end at the two ends', () => {
    const built = buildChapterAnchors(a, b)
    expect(built.a).toEqual(counts(a))
    expect(built.b).toEqual(counts(b))
    expect(built.anchors[0]).toEqual([0, 0])
    expect(built.anchors[built.anchors.length - 1]).toEqual([words(a).length, words(b).length])
    for (let i = 1; i < built.anchors.length; i += 1) {
      expect(built.anchors[i][0]).toBeGreaterThan(built.anchors[i - 1][0])
      expect(built.anchors[i][1]).toBeGreaterThan(built.anchors[i - 1][1])
    }
  })
  it('is deterministic', () => {
    expect(buildChapterAnchors(a, b)).toEqual(buildChapterAnchors(a, b))
  })
  it('texts with nothing in common still get their two ends', () => {
    expect(buildChapterAnchors(['one two three four'], ['uno dos tres']).anchors).toEqual([[0, 0], [4, 3]])
  })
})

describe('the Odyssey’s anchors (Butler and Pope)', () => {
  it('are what the generator gives for the served texts (rebuild: node scripts/build-edition-anchors.mjs odyssey original-en verse-en)', () => {
    expect(file).toEqual(buildEditionAnchorFile('odyssey', { key: 'original-en', data: butler }, { key: 'verse-en', data: pope }))
    expect(Object.keys(file.chapters)).toHaveLength(24)
  })

  it('Book 7: named moments land on the same moment in the other translation', () => {
    const a = chapterOf(butler, 7)
    const b = chapterOf(pope, 7)
    const map = mapOf(7, ['original-en', a], ['verse-en', b])!
    const wb = words(b)
    const wa = words(a)
    const landsNear = (butlerPhrase: string, popeWord: string) => {
      const at = wa.join(' ').indexOf(butlerPhrase)
      expect(at, butlerPhrase).toBeGreaterThanOrEqual(0)
      const offset = wa.join(' ').slice(0, at).split(' ').filter(Boolean).length
      const to = map.map(offset)
      // Within three verse lines of the word that names the moment.
      expect(wb.slice(Math.max(0, to - 24), to + 24).join(' '), `${butlerPhrase} -> ${wb.slice(to, to + 8).join(' ')}`).toContain(popeWord)
    }
    landsNear('Pontonous then mixed wine and water', 'Pontonous')
    landsNear('When Alcinous heard this he took Ulysses by the hand', 'Laodamas')
    landsNear('Then he sat down on the hearth among the ashes', 'hearth')
    landsNear('“Queen Arete,” he exclaimed', 'Rhexenor')
    landsNear('I stayed with Calypso seven years', 'seven')
  })

  it('every chapter: the mapping never goes backwards, both ways, and the ends are the ends', () => {
    for (const { number, paragraphs: a } of butler.chapters) {
      const b = chapterOf(pope, number)
      for (const [from, to] of [[['original-en', a], ['verse-en', b]], [['verse-en', b], ['original-en', a]]] as Array<[[string, string[]], [string, string[]]]>) {
        const map = mapOf(number, from, to)!
        expect(map, `book ${number}`).not.toBeNull()
        const total = words(from[1]).length
        let last = 0
        for (let offset = 0; offset <= total; offset += 7) {
          const at = map.map(offset)
          expect(at).toBeGreaterThanOrEqual(last)
          last = at
        }
        expect(map.map(0)).toBe(0)
        expect(map.map(total)).toBe(words(to[1]).length)
      }
    }
  })

  it('Modern English reads through Butler: same paragraph, then the anchors', () => {
    const m = chapterOf(modern, 7)
    const a = chapterOf(butler, 7)
    const b = chapterOf(pope, 7)
    expect(m).toHaveLength(a.length)
    const viaModern = mapOf(7, ['modern-en', m], ['verse-en', b])!
    const viaButler = mapOf(7, ['original-en', a], ['verse-en', b])!
    // The start of each paragraph is the same moment in Butler and in the Modern English.
    let offsetM = 0
    let offsetA = 0
    a.forEach((_, i) => {
      expect(viaModern.map(offsetM)).toBe(viaButler.map(offsetA))
      offsetM += counts(m)[i]
      offsetA += counts(a)[i]
    })
    // And back: Pope to the Modern English lands in the paragraph Pope to Butler lands in.
    const back = mapOf(7, ['verse-en', b], ['modern-en', m])!
    const backButler = mapOf(7, ['verse-en', b], ['original-en', a])!
    for (const offset of [0, 400, 1200, 1900, 2600, 3300]) {
      expect(placeAtWordOffset(counts(m), back.map(offset)).paragraphIndex).toBe(placeAtWordOffset(counts(a), backButler.map(offset)).paragraphIndex)
    }
  })

  it('does not apply to texts it was not counted against, another book, or a pair it does not hold', () => {
    const a = chapterOf(butler, 7)
    const b = chapterOf(pope, 7)
    expect(mapOf(7, ['original-en', [...a.slice(0, -1), `${a[a.length - 1]} more words`]], ['verse-en', b])).toBeNull()
    expect(mapOf(7, ['original-en', a], ['verse-en', b.slice(1)])).toBeNull()
    expect(mapOf(7, ['original-en', a], ['modern-en', chapterOf(modern, 7)])).toBeNull()
    expect(mapOf(99, ['original-en', a], ['verse-en', b])).toBeNull()
    expect(chapterAnchorMap(file, { bookId: 'iliad', chapterNumber: 7, aligned, from: { edition: 'original-en', counts: counts(a) }, to: { edition: 'verse-en', counts: counts(b) } })).toBeNull()
    expect(chapterAnchorMap(null, { bookId: 'odyssey', chapterNumber: 7, aligned, from: { edition: 'original-en', counts: counts(a) }, to: { edition: 'verse-en', counts: counts(b) } })).toBeNull()
  })

  it('a place carried through the anchors stays in the chapter; Compare still shows every word once', () => {
    const a = chapterOf(butler, 7)
    const b = chapterOf(pope, 7)
    const map = mapOf(7, ['original-en', a], ['verse-en', b])!
    expect(mapPlaceThroughAnchors(map, counts(a), counts(b), { paragraphIndex: 0, wordIndex: 0 })).toEqual({ paragraphIndex: 0, wordIndex: 0 })
    const last = mapPlaceThroughAnchors(map, counts(a), counts(b), { paragraphIndex: 999, wordIndex: 99999 })
    expect(last.paragraphIndex).toBe(b.length - 1)
    expect(wordOffsetOfPlace(counts(a), { paragraphIndex: 1, wordIndex: 3 })).toBe(counts(a)[0] + 3)
    for (const [primary, compare, anchors] of [[a, b, map], [b, a, mapOf(7, ['verse-en', b], ['original-en', a])!]] as const) {
      const alignment = buildProportionalAlignment(primary, compare, anchors)!
      const target = compare.map(text => tokenizeHearingWords(text).map(word => word.text))
      // Any page slicing: every nine words.
      const shown = primary.flatMap((text, paragraphIndex) => {
        const n = tokenizeHearingWords(text).length
        const out: string[] = []
        for (let from = 0; from < n; from += 9) for (const piece of alignment.pieces({ paragraphIndex, from, to: Math.min(n, from + 9) })) out.push(...target[piece.paragraphIndex].slice(piece.from, piece.to))
        return out
      })
      expect(shown).toEqual(target.flat())
    }
  })
})
