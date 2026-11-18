// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { bookMetadata, eraLabel } from '../public/lab/library_2/book-metadata.js'
import { fitHeroTitle, heroTitleStep, HERO_TITLE_STEPS } from '../public/lab/library_2/hero-title.js'
import { conciseChapterLabel, positionLine } from './preReader/recapPosition'

describe('the reading-table hero', () => {
  it('writes an added book’s bare year as Tinct’s books write an era, and keeps catalogued eras', () => {
    expect(eraLabel('60')).toBe('c. 60 AD')
    expect(eraLabel('-430')).toBe('c. 430 BC')
    expect(eraLabel('1200')).toBe('c. 1200')
    expect(eraLabel('1818')).toBe('1818')
    expect(eraLabel('0')).toBe('')
    for (const kept of ['458 BC', 'c. 700 BC', 'c. 175 AD', 'c. 1000', '1776–1791', '']) expect(eraLabel(kept)).toBe(kept)
    expect(bookMetadata({ displayYear: '60', wordCount: 51000 }, { percent: 4 })).toBe('c. 60 AD · ~5 hours left')
  })

  it('steps a long title’s type down instead of clipping it', () => {
    expect(heroTitleStep('Hamlet')).toBe(0)
    expect(heroTitleStep('Frankenstein; or, the modern prometheus')).toBe(1)
    expect(heroTitleStep('Minor Dialogues, Together With the Dialogue on Clemency')).toBe(2)
    expect(heroTitleStep('x'.repeat(200))).toBe(HERO_TITLE_STEPS)
    const h1 = document.createElement('h1')
    const title = 'Minor Dialogues, Together With the Dialogue on Clemency'
    fitHeroTitle(h1, title)
    // The whole title is in the heading, from its first word.
    expect(h1.textContent).toBe(title)
    expect(h1.dataset.fit).toBe('2')
  })

  it('steps further down while the title still needs more than three lines', () => {
    const h1 = document.createElement('h1')
    document.body.append(h1)
    let overflowFrom = 3
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get() { return Number((this as HTMLElement).parentElement?.dataset.fit) < overflowFrom ? 200 : 100 } })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return 100 } })
    try {
      expect(fitHeroTitle(h1, 'Minor Dialogues, Together With the Dialogue on Clemency')).toBe(3)
      overflowFrom = 99
      expect(fitHeroTitle(h1, 'Hamlet')).toBe(HERO_TITLE_STEPS)
    } finally {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollHeight
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight
      h1.remove()
    }
  })

  it('names a long chapter by its first sentence in “Where you left off”', () => {
    const label = 'The First Book of the Dialogues of L. Annaeus Seneca, Addressed to Lucilius. “Why, Though There Is a Providence, Some Misfortunes Befall Good Men.”'
    const short = conciseChapterLabel(label)
    expect(short.length).toBeLessThanOrEqual(60)
    expect(short.startsWith('The First Book of the Dialogues of L. Annaeus Seneca')).toBe(true)
    expect(short.endsWith('…')).toBe(true)
    expect(positionLine('start', short)).toBe(`You’re at the start of ${short}`)
    expect(conciseChapterLabel('Book One. On Anger: Its Nature, Its Causes, and How a Wise Man Should Answer It in Every Case')).toBe('Book One')
    expect(conciseChapterLabel('Chapter 7')).toBe('Chapter 7')
  })
})
