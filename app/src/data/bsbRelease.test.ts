import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BIBLE } from './bookRegistry'
import { LAB_EDITION_KEY } from '../lab/labSource'

// Accepted staging artifact 10644337757 (run 35611959342, PR #131): the
// published edition must be those bytes, never a regenerated approximation.
const ACCEPTED_SHA256 = '8da0bc1ae32d9c2e05ba5811d953e24bdff8351913ad8f2199142ca0081c61d9'
const edition = resolve(__dirname, '../../public/data/editions/bible-bsb-en.json')

describe('Berean Standard Bible release', () => {
  it('publishes the accepted BSB bytes with the accepted structure', () => {
    const raw = readFileSync(edition)
    expect(createHash('sha256').update(raw).digest('hex')).toBe(ACCEPTED_SHA256)
    const data = JSON.parse(raw.toString('utf8')) as { chapters: { paragraphs: string[] }[] }
    expect(data.chapters).toHaveLength(1189)
    expect(data.chapters.reduce((sum, chapter) => sum + chapter.paragraphs.length, 0)).toBe(38464)
    // 31,086 nonempty verses; the 16 official empty references stay empty.
    const verses = data.chapters.flatMap(chapter => chapter.paragraphs)
      .reduce((sum, paragraph) => sum + (paragraph.match(/(?:^|\s)[⁰¹²³⁴⁵⁶⁷⁸⁹]+(?=\s)/g)?.length ?? 0), 0)
    expect(verses).toBe(31086)
  })

  it('is the default for new Bible readers while KJV and WEB stay available', () => {
    expect(LAB_EDITION_KEY).toBe('bsb-en')
    expect(BIBLE.editions.map(e => e.key)).toEqual(['bsb-en', 'kjv-en', 'web-en', 'webc-en'])
  })
})
