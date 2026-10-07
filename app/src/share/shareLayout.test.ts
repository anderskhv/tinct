import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { tokenizeWithEmphasis } from '../lab/labEmphasis'
import { parseFontMetrics } from './fontMetrics'
import {
  QUOTE_CARDS,
  SHARE_ELLIPSIS,
  buildPassage,
  composeSharePage,
  isValidShareRange,
  shareRangeText,
  tokenizeParagraph,
  type ShareContent,
  type ShareOptions,
  type ShareRange,
} from './shareLayout'
import { renderShareSvg } from './shareSvg'

const root = resolve(__dirname, '../..')
const font = (name: string) => parseFontMetrics(readFileSync(resolve(root, `public/fonts/share/${name}.ttf`)))
const fonts = { regular: font('EBGaramond-Regular'), semibold: font('EBGaramond-SemiBold'), italic: font('EBGaramond-Italic') }
// Frankenstein, chapter 5 (edition chapter 9): the mockup's passages.
const paragraphs: string[] = JSON.parse(readFileSync(resolve(root, 'public/data/editions/frankenstein-original-en.json'), 'utf8')).chapters[8].paragraphs

function wordAt(p: number, phrase: string): number {
  const words = tokenizeParagraph(paragraphs[p]).map(token => token.text)
  const wanted = phrase.split(' ')
  const index = words.findIndex((_, i) => wanted.every((word, k) => words[i + k] === word))
  if (index < 0) throw new Error(`missing: ${phrase}`)
  return index
}

const SHORT: ShareRange = { paragraphIndex: 2, fromWord: wordAt(2, 'the beauty of the dream'), endParagraphIndex: 2, toWord: wordAt(2, 'filled my heart.') + 3 }
const LONG: ShareRange = { paragraphIndex: 1, fromWord: 0, endParagraphIndex: 2, toWord: wordAt(2, 'monster whom I had created.') + 5 }
const OVER: ShareRange = { paragraphIndex: 1, fromWord: 0, endParagraphIndex: 5, toWord: tokenizeParagraph(paragraphs[5]).length }

const content = (range: ShareRange): ShareContent => ({ bookTitle: 'Frankenstein', chapterLabel: 'Chapter 5', credit: 'Original (1831)', paragraphs, range })
const options = (format: ShareOptions['format'], extra: Partial<ShareOptions> = {}): ShareOptions => ({ format, look: 'paper', context: true, tagline: true, ...extra })

function placedHighlight(page: ReturnType<typeof composeSharePage>): string {
  return page.layout.lines.flatMap(line => line.words.filter(word => word.hl).map(word => word.text)).join(' ')
}

describe('share highlight: tokens and ranges', () => {
  it('counts words exactly as the reader does', () => {
    for (const paragraph of paragraphs) expect(tokenizeParagraph(paragraph).map(token => token.text)).toEqual(tokenizeWithEmphasis(paragraph).map(word => word.text))
    expect(tokenizeParagraph('He was _very_ tired.').map(token => [token.text, token.italic])).toEqual([['He', false], ['was', false], ['very', true], ['tired.', false]])
  })

  it('accepts only ranges that exist in the chapter', () => {
    expect(isValidShareRange(paragraphs, SHORT)).toBe(true)
    expect(isValidShareRange(paragraphs, LONG)).toBe(true)
    expect(isValidShareRange(paragraphs, { ...SHORT, toWord: SHORT.fromWord })).toBe(false)
    expect(isValidShareRange(paragraphs, { ...SHORT, paragraphIndex: 3, endParagraphIndex: 2 })).toBe(false)
    expect(isValidShareRange(paragraphs, { ...SHORT, endParagraphIndex: paragraphs.length })).toBe(false)
    expect(isValidShareRange(paragraphs, { ...SHORT, toWord: 10_000 })).toBe(false)
    expect(isValidShareRange(paragraphs, { ...SHORT, fromWord: -1 })).toBe(false)
    expect(isValidShareRange(paragraphs, { ...SHORT, fromWord: 1.5 })).toBe(false)
    expect(isValidShareRange(paragraphs, { paragraphIndex: 0, fromWord: 0, endParagraphIndex: paragraphs.length - 1, toWord: 1 }, 50)).toBe(false)
    expect(shareRangeText(paragraphs, SHORT)).toBe('the beauty of the dream vanished, and breathless horror and disgust filled my heart.')
  })

  it('opens one sentence before the highlight, with … mid-paragraph', () => {
    const passage = buildPassage(paragraphs, SHORT, true)
    expect(passage[0].tokens[0].text).toBe(`${SHARE_ELLIPSIS}I`)
    expect(passage[0].tokens.slice(0, 4).map(token => token.text).join(' ')).toBe(`${SHARE_ELLIPSIS}I had desired it`)
    // A highlight that starts a paragraph opens on the last sentence of the one before.
    const long = buildPassage(paragraphs, LONG, true)
    expect(long[0].tokens.every(token => !token.hl)).toBe(true)
    expect(long[1].tokens[0]).toMatchObject({ text: 'How', hl: true })
  })

  it('shows the quote alone with … where it starts or ends mid-sentence', () => {
    const passage = buildPassage(paragraphs, { ...SHORT, toWord: SHORT.toWord - 1 }, false)
    const words = passage.flatMap(paragraph => paragraph.tokens)
    expect(words.every(token => token.hl)).toBe(true)
    expect(words[0].text).toBe(`${SHARE_ELLIPSIS}the`)
    expect(words[words.length - 1].text).toBe(`my${SHARE_ELLIPSIS}`)
  })
})

describe('share highlight: fitting (SPEC.md order)', () => {
  it('keeps a short highlight at reader size on one page', () => {
    const phone = composeSharePage(content(SHORT), options('phone'), fonts)
    expect(phone).toMatchObject({ mode: 'single', scale: 1, cut: false })
    const desktop = composeSharePage(content(SHORT), options('desktop'), fonts)
    expect(desktop).toMatchObject({ mode: 'single', scale: 1, cut: false })
    expect(placedHighlight(desktop)).toBe(shareRangeText(paragraphs, SHORT))
  })

  it('moves a long highlight to the spread and shrinks it, never below 75%', () => {
    const page = composeSharePage(content(LONG), options('desktop'), fonts)
    expect(page.mode).toBe('spread')
    expect(page.cut).toBe(false)
    expect(page.scale).toBeLessThan(0.9)
    expect(page.scale).toBeGreaterThanOrEqual(0.75)
    expect(placedHighlight(page)).toBe(shareRangeText(paragraphs, LONG))
    expect(page.pageNumbers).toHaveLength(2)
  })

  it('cuts an over-long highlight at a sentence at 75%, without changing the words', () => {
    for (const format of ['phone', 'desktop', 'og'] as const) {
      const page = composeSharePage(content(OVER), options(format), fonts)
      expect(page.cut).toBe(true)
      expect(page.scale).toBe(0.75)
      const shown = placedHighlight(page)
      expect(shown.endsWith(SHARE_ELLIPSIS)).toBe(true)
      const words = shown.slice(0, -1)
      expect(shareRangeText(paragraphs, OVER).startsWith(words)).toBe(true)
      expect(/[.!?]["”’)]*$/.test(words)).toBe(true)
    }
  })

  it('never shrinks the single desktop page; it goes to the spread instead', () => {
    const page = composeSharePage(content(LONG), options('desktop', { tagline: false }), fonts)
    expect(page.mode).toBe('spread')
    expect(page.frame.canvas).toEqual({ width: 1600, height: 1000 })
  })

  it('centres a quote shown alone in the link preview', () => {
    const page = composeSharePage(content(SHORT), options('og', { context: false }), fonts)
    expect(page.frame.canvas).toEqual({ width: 1200, height: 630 })
    expect(page.offsetY).toBeGreaterThan(20)
    expect(page.layout.lines.flatMap(line => line.words).every(word => word.hl)).toBe(true)
  })

  it('justifies full lines to the text box edge', () => {
    const page = composeSharePage(content(SHORT), options('phone'), fonts)
    const width = page.frame.text.width
    const full = page.layout.lines.slice(0, -1).filter(line => line.words.length > 1)
    for (const line of full.slice(0, 3)) {
      const last = line.words[line.words.length - 1]
      expect(Math.abs(last.x + last.width - width)).toBeLessThan(0.5)
    }
  })
})

describe('share highlight: the quote card (surrounding text off)', () => {
  const TINY: ShareRange = { paragraphIndex: 2, fromWord: wordAt(2, 'the beauty of the dream'), endParagraphIndex: 2, toWord: wordAt(2, 'the beauty of the dream') + 5 }
  const MEDIUM: ShareRange = { paragraphIndex: 3, fromWord: 0, endParagraphIndex: 3, toWord: tokenizeParagraph(paragraphs[3]).length }

  it('sizes the card to the quote: its height follows the text', () => {
    for (const format of ['phone', 'desktop'] as const) {
      const spec = QUOTE_CARDS[format]
      const short = composeSharePage(content(SHORT), options(format, { context: false }), fonts)
      const long = composeSharePage(content(MEDIUM), options(format, { context: false }), fonts)
      for (const page of [short, long]) {
        expect(page.mode).toBe('quote')
        expect(page.frame.canvas.width).toBe(spec.width)
        // The card is the text plus fixed margins, header and footer, within the format's range.
        const chrome = page.frame.canvas.height - page.frame.text.height
        expect(page.frame.canvas.height).toBeGreaterThanOrEqual(spec.minHeight)
        expect(page.frame.canvas.height).toBeLessThanOrEqual(spec.maxHeight)
        if (page.frame.canvas.height > spec.minHeight) expect(Math.abs(page.frame.canvas.height - (chrome + page.layout.usedHeight))).toBeLessThanOrEqual(1)
        expect(page.offsetY).toBeLessThanOrEqual(page.frame.text.height / 2)
        expect(page.frame.page).toBeUndefined()
        expect(page.pageNumbers).toEqual([])
        expect(page.cut).toBe(false)
      }
      expect(placedHighlight(short)).toBe(`${SHARE_ELLIPSIS}${shareRangeText(paragraphs, SHORT)}`)
      expect(placedHighlight(long)).toBe(shareRangeText(paragraphs, MEDIUM))
      expect(long.frame.canvas.height).toBeGreaterThan(short.frame.canvas.height)
      expect(long.layout.lines.length).toBeGreaterThan(short.layout.lines.length)
    }
  })

  it('reads a short quote large and shrinks a long one, never below the smallest size', () => {
    for (const format of ['phone', 'desktop'] as const) {
      const spec = QUOTE_CARDS[format]
      const tiny = composeSharePage(content(TINY), options(format, { context: false }), fonts)
      const long = composeSharePage(content(MEDIUM), options(format, { context: false }), fonts)
      expect(tiny.layout.fontSize).toBe(spec.maxSize)
      expect(long.layout.fontSize).toBeLessThan(spec.maxSize)
      expect(long.layout.fontSize).toBeGreaterThanOrEqual(spec.minSize)
      // A quote shorter than the smallest card is centred in it.
      expect(tiny.frame.canvas.height).toBe(spec.minHeight)
      expect(tiny.offsetY).toBeGreaterThan(0)
      // Every line stays inside the margins.
      for (const line of [...tiny.layout.lines, ...long.layout.lines]) {
        const last = line.words[line.words.length - 1]
        expect(last.x + last.width).toBeLessThanOrEqual(long.frame.text.width + 0.5)
      }
    }
  })

  it('hands a quote too long for the card to the page, which never loses more words', () => {
    // Desktop: the spread shows all of it, as before the card existed.
    const desktop = composeSharePage(content(LONG), options('desktop', { context: false }), fonts)
    expect(desktop.mode).toBe('spread')
    expect(desktop.cut).toBe(false)
    expect(placedHighlight(desktop)).toBe(shareRangeText(paragraphs, LONG))
    // Over-long anywhere: the page's 75% floor and sentence cut.
    for (const format of ['phone', 'desktop'] as const) {
      const page = composeSharePage(content(OVER), options(format, { context: false }), fonts)
      expect(page.mode).not.toBe('quote')
      expect(page.cut).toBe(true)
      expect(page.scale).toBe(0.75)
      const shown = placedHighlight(page)
      expect(shown.endsWith(SHARE_ELLIPSIS)).toBe(true)
      expect(shareRangeText(paragraphs, OVER).startsWith(shown.slice(0, -1))).toBe(true)
      expect(/[.!?]["”’)]*$/.test(shown.slice(0, -1))).toBe(true)
    }
  })

  it('keeps attribution small: book and chapter, the credit only for a translation, no page number', () => {
    const own = renderShareSvg(composeSharePage({ ...content(SHORT), creditOnQuote: false }, options('desktop', { context: false }), fonts), fonts)
    expect(own).toContain('Frankenstein')
    expect(own).toContain('Chapter 5')
    expect(own).toContain('Read free at tinct.app')
    expect(own).not.toContain('Original (1831)')
    expect(own).not.toContain('>1</text>')
    const translated = composeSharePage({ ...content(SHORT), credit: 'World English Bible, Catholic Edition', creditOnQuote: true }, options('phone', { context: false, tagline: false }), fonts)
    const svg = renderShareSvg(translated, fonts)
    expect(svg).toContain('World English Bible, Catholic Edition')
    expect(svg).not.toContain('Read free at tinct.app')
    expect(translated.frame.header.size).toBeLessThan(translated.layout.fontSize / 2)
    // The page (surrounding text on) always carries the credit.
    expect(renderShareSvg(composeSharePage({ ...content(SHORT), creditOnQuote: false }, options('desktop'), fonts), fonts)).toContain('Original (1831)')
    // With neither tagline nor credit, the card has no footer.
    const bare = composeSharePage({ ...content(SHORT), creditOnQuote: false }, options('phone', { context: false, tagline: false }), fonts)
    expect(bare.frame.footer.boxHeight).toBe(0)
  })
})

describe('share highlight: drawing', () => {
  it('draws the reader page with no user identity, in each look', () => {
    for (const look of ['paper', 'night', 'eink'] as const) {
      const svg = renderShareSvg(composeSharePage(content(SHORT), options('phone', { look }), fonts), fonts)
      expect(svg).toContain('Frankenstein')
      expect(svg).toContain('Read free at tinct.app')
      expect(svg).toContain('Original (1831)')
      expect(svg).toContain('font-weight="600"')
    }
    const noTag = renderShareSvg(composeSharePage(content(SHORT), options('phone', { tagline: false }), fonts), fonts)
    expect(noTag).not.toContain('Read free at tinct.app')
    expect(noTag).toContain('Original (1831)')
  })

  it('escapes text for SVG', () => {
    const svg = renderShareSvg(composeSharePage({ ...content(SHORT), bookTitle: 'A <b>&</b> "B"' }, options('og'), fonts), fonts)
    expect(svg).toContain('A &lt;b&gt;&amp;&lt;/b&gt; &quot;B&quot;')
  })
})
