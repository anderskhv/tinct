import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { hyphenationBreaks, loadHyphenator } from '../lab/labHyphenate'
import { PLAN_GAP_EM, PLAN_MAX_RUN, PLAN_SECOND_GAP_EM } from '../lab/labHyphenPlan'
import { tokenizeWithEmphasis } from '../lab/labEmphasis'
import { parseFontMetrics } from './fontMetrics'
import { englishShareBreaks } from './shareHyphenate'
import {
  QUOTE_CARDS,
  SERIES_FLOOR_SIZE,
  SERIES_MAX_CARDS,
  SHARE_HYPHEN_GAP_EM,
  SHARE_HYPHEN_MAX_RUN,
  SHARE_HYPHEN_SECOND_GAP_EM,
  SHARE_ELLIPSIS,
  SHARE_TAGLINE,
  buildPassage,
  layoutColumns,

  composeShareCards,
  composeSharePage,
  isValidShareRange,
  superscriptRuns,
  shareRangeText,
  tokenizeParagraph,
  type ShareContent,
  type ShareOptions,
  type ShareRange,
} from './shareLayout'
import { SHARE_PALETTES, renderShareSvg } from './shareSvg'

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

const content = (range: ShareRange): ShareContent => ({ bookTitle: 'Frankenstein', chapterLabel: 'Chapter 5', paragraphs, range })
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

  it('never fits a long highlight into a two-page spread: it becomes single pages at reader size', () => {
    for (const format of ['phone', 'desktop'] as const) {
      const cards = composeShareCards(content(LONG), options(format), fonts)
      expect(cards.length).toBeGreaterThan(1)
      expect(cards.length).toBeLessThanOrEqual(SERIES_MAX_CARDS)
      cards.forEach((card, k) => {
        // Desktop at reader size; the phone's smaller page needs more than four at reader size, so all four are set a little smaller.
        expect(card).toMatchObject({ mode: 'single', scale: cards[0].scale, cut: false, series: { index: k + 1, count: cards.length } })
        if (format === 'desktop') expect(card.scale).toBe(1)
        else expect(card.scale).toBeGreaterThanOrEqual(0.75)
        expect(card.frame.canvas).toEqual(format === 'phone' ? { width: 1080, height: 1350 } : { width: 1600, height: 1000 })
        expect(card.layout.fontSize).toBeCloseTo(card.frame.baseSize * card.scale, 6)

        expect(card.layout.usedHeight).toBeLessThanOrEqual(card.frame.text.height + 0.5)
        if (format === 'desktop') {
          // One page, never the two-page spread, numbered on from the first.
          expect(card.frame.page!.width).toBeLessThan(card.frame.canvas.width * 0.6)
          expect(card.pageNumbers).toEqual([cards[0].pageNumbers[0] + k])
          expect(renderShareSvg(card, fonts)).not.toContain('linearGradient')
        }
      })
      // Every highlighted word, once, in order.
      expect(cards.map(placedHighlight).join(' ')).toBe(shareRangeText(paragraphs, LONG))
      // One image is the series' first page.
      expect(composeSharePage(content(LONG), options(format), fonts).layout).toEqual(cards[0].layout)
    }
  })

  it('cuts an over-long highlight at a sentence at 75%, without changing the words', () => {
    // Phone and desktop: past four pages even at 75%, the four pages are cut. The link preview: one image.
    const all = paragraphs.slice(0, 12)
    const hugeRange: ShareRange = { paragraphIndex: 0, fromWord: 0, endParagraphIndex: all.length - 1, toWord: tokenizeParagraph(all[all.length - 1]).length }
    const huge: ShareContent = { ...content(OVER), paragraphs: all, range: hugeRange }
    const cases: Array<[ReturnType<typeof composeSharePage>[], string]> = [
      [[composeSharePage(content(OVER), options('og'), fonts)], shareRangeText(paragraphs, OVER)],
      [composeShareCards(huge, options('phone'), fonts), shareRangeText(all, hugeRange)],
      [composeShareCards(huge, options('desktop'), fonts), shareRangeText(all, hugeRange)],
    ]
    for (const [pages, text] of cases) {
      expect(pages.length).toBeLessThanOrEqual(SERIES_MAX_CARDS)
      for (const page of pages) expect(page).toMatchObject({ cut: true, scale: 0.75 })
      const shown = pages.map(placedHighlight).join(' ')
      expect(shown.endsWith(SHARE_ELLIPSIS)).toBe(true)
      const words = shown.slice(0, -1)
      expect(text.startsWith(words)).toBe(true)
      expect(/[.!?]["”’)]*$/.test(words)).toBe(true)
    }
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

  // One image only (composeSharePage). The share itself sets such a quote as a
  // series of cards (composeShareCards, below); this page is its last resort.
  it('as one image, hands a quote too long for the card to the page, which never loses more words', () => {
    // Desktop: the single page, never a spread.
    const desktop = composeSharePage(content(OVER), options('desktop', { context: false }), fonts)
    expect(desktop.mode).toBe('single')
    expect(desktop.frame.page!.width).toBeLessThan(desktop.frame.canvas.width * 0.6)
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

  it('keeps attribution small: book and chapter only, no page number', () => {
    const own = renderShareSvg(composeSharePage(content(SHORT), options('desktop', { context: false }), fonts), fonts)
    expect(own).toContain('Frankenstein')
    expect(own).toContain('Chapter 5')
    expect(own).toContain('Read free at tinct.app')
    expect(own).not.toContain('>1</text>')
    const card = composeSharePage(content(SHORT), options('phone', { context: false, tagline: false }), fonts)
    expect(renderShareSvg(card, fonts)).not.toContain('Read free at tinct.app')
    expect(card.frame.header.size).toBeLessThan(card.layout.fontSize / 2)
    // Without the tagline, the card has no footer.
    expect(card.frame.footer.boxHeight).toBe(0)
  })
})

describe('share highlight: drawing', () => {
  it('draws the reader page with no user identity and no edition line, in each look', () => {
    for (const look of ['paper', 'book', 'night', 'eink'] as const) {
      for (const context of [true, false]) for (const format of ['phone', 'desktop', 'og'] as const) {
        const svg = renderShareSvg(composeSharePage(content(SHORT), options(format, { look, context }), fonts), fonts)
        expect(svg).toContain('Frankenstein')
        expect(svg).toContain('Chapter 5')
        expect(svg).toContain('Read free at tinct.app')
        expect(svg).toContain('font-weight="600"')
        expect(svg).not.toContain('Original (1831)')
      }
    }
    const noTag = renderShareSvg(composeSharePage(content(SHORT), options('phone', { tagline: false }), fonts), fonts)
    expect(noTag).not.toContain('Read free at tinct.app')
    expect(noTag).toContain('Frankenstein')
  })

  it('escapes text for SVG', () => {
    const svg = renderShareSvg(composeSharePage({ ...content(SHORT), bookTitle: 'A <b>&</b> "B"' }, options('og'), fonts), fonts)
    expect(svg).toContain('A &lt;b&gt;&amp;&lt;/b&gt; &quot;B&quot;')
  })
})

describe('share highlight: colours follow the reader page', () => {
  // Paper and highlight as the live reader paints them (lab.css, display-profile.css).
  const PAGE = {
    paper: { paper: '#ece7db', highlight: '#dcca98' },
    book: { paper: '#e7dcc7', highlight: '#dcca98' },
    night: { paper: '#171411', highlight: '#5c4a2e' },
    eink: { paper: '#ffffff', highlight: '#dcca98' },
  } as const

  it('draws the card on the theme paper with the page highlight', () => {
    for (const look of Object.keys(PAGE) as Array<keyof typeof PAGE>) {
      for (const context of [false, true]) {
        const svg = renderShareSvg(composeSharePage(content(SHORT), options('phone', { look, context }), fonts), fonts)
        expect(svg).toContain(`<rect width="1080" height="`)
        expect(svg).toMatch(new RegExp(`<rect width="1080" height="\\d+" fill="${PAGE[look].paper}"/>`))
        expect(svg).toContain(`fill="${PAGE[look].highlight}"/>`)
      }
    }
  })
})

describe('share highlight: verse numbers', () => {
  // Psalms 19 in the World English Bible, Catholic Edition: "⁷ The LORD’s law is perfect, …"
  const psalm: string[] = JSON.parse(readFileSync(resolve(root, 'public/data/editions/bible-webc-en.json'), 'utf8')).chapters.find((chapter: { number: number }) => chapter.number === 497).paragraphs
  const psalmContent = (range: ShareRange): ShareContent => ({ bookTitle: 'The Bible', chapterLabel: 'Psalms 19', paragraphs: psalm, range })
  const words = tokenizeParagraph(psalm[2]).map(token => token.text)
  const SUPERSCRIPTS = /[\u2070\u00b9\u00b2\u00b3\u2074-\u2079]/
  const textOf = (svg: string) => [...svg.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map(match => match[1]).join(' ')

  it('drops the verse number that opens a quote', () => {
    expect(words.slice(0, 3)).toEqual(['\u2077', 'The', 'LORD\u2019s'])
    const range: ShareRange = { paragraphIndex: 2, fromWord: 0, endParagraphIndex: 2, toWord: 9 }
    for (const format of ['phone', 'desktop', 'og'] as const) {
      const page = composeSharePage(psalmContent(range), options(format, { context: false }), fonts)
      expect(placedHighlight(page)).toBe('The LORD\u2019s law is perfect, restoring the soul.')
      const svg = renderShareSvg(page, fonts)
      expect(SUPERSCRIPTS.test(svg)).toBe(false)
      expect(svg).not.toContain('<tspan')
    }
    // Mid-verse quotes have no marker to drop, and the words are unchanged.
    const mid = buildPassage(psalm, { paragraphIndex: 2, fromWord: 1, endParagraphIndex: 2, toWord: 9 }, false)
    expect(mid[0].tokens[0].text).toBe('The')
  })

  it('draws verse numbers inside a quote as small raised regular digits', () => {
    const from = words.indexOf('soul.') - 2
    const to = words.indexOf('\u2078') + 3
    const range: ShareRange = { paragraphIndex: 2, fromWord: from, endParagraphIndex: 2, toWord: to }
    expect(words.slice(from, to).join(' ')).toContain('soul. The LORD\u2019s covenant is sure, making wise the simple. \u2078 The LORD\u2019s')
    expect(superscriptRuns('\u00b9\u2070')).toEqual([{ text: '10', sup: true }])
    for (const format of ['phone', 'desktop', 'og'] as const) for (const context of [false, true]) {
      const page = composeSharePage(psalmContent(range), options(format, { context }), fonts)
      const svg = renderShareSvg(page, fonts)
      expect(SUPERSCRIPTS.test(svg)).toBe(false)
      const marker = page.layout.lines.flatMap(line => line.words).find(word => word.text === '\u2078')!
      expect(marker).toBeDefined()
      // Narrower than the regular digit: drawn at the smaller size.
      const eight = fonts.semibold.advance('8'.codePointAt(0)!) / fonts.semibold.unitsPerEm * page.layout.fontSize
      expect(marker.width).toBeLessThan(eight * 0.7)
      // Raised above the baseline of its own word (the <text> element's y), at the smaller size.
      const drawn = svg.match(/<text x="[\d.]+" y="([\d.]+)"[^>]*><tspan y="([\d.]+)" font-size="([\d.]+)">8<\/tspan><\/text>/)
      expect(drawn).not.toBeNull()
      expect(Number(drawn![2])).toBeLessThan(Number(drawn![1]))
      expect(Number(drawn![3])).toBeLessThan(page.layout.fontSize * 0.7)
      expect(textOf(svg)).toContain('The LORD\u2019s covenant')
    }
  })
})

describe('share highlight: hyphenation (the phone reader plan)', () => {
  const psalm: string[] = JSON.parse(readFileSync(resolve(root, 'public/data/editions/bible-webc-en.json'), 'utf8')).chapters.find((chapter: { number: number }) => chapter.number === 497).paragraphs
  const psalmContent = (language: string | undefined, range: ShareRange): ShareContent => ({ bookTitle: 'The Bible', chapterLabel: 'Psalms 19', language, paragraphs: psalm, range })
  const psalmPage = (range: ShareRange, language: string | undefined, extra: Partial<ShareOptions> = {}, hyphenate?: (word: string) => number[], format: ShareOptions['format'] = 'phone') => composeSharePage(
    psalmContent(language, range), options(format, { tagline: false, ...extra }), fonts, hyphenate)
  // Verse 7: the page opens on "…There is nothing hidden from its heat." (Anders's example).
  const VERSE_7: ShareRange = { paragraphIndex: 2, fromWord: 0, endParagraphIndex: 2, toWord: 9 }
  // "The LORD’s commandment is pure, enlightening the eyes." (verse 8)
  const COMMANDMENT: ShareRange = { paragraphIndex: 2, fromWord: 27, endParagraphIndex: 2, toWord: 35 }
  // Verses 1–11: long enough for the desktop spread.
  const HEAVENS: ShareRange = { paragraphIndex: 1, fromWord: 0, endParagraphIndex: 2, toWord: tokenizeParagraph(psalm[2]).length }
  // Verses 7 and 8 on one desktop page (verse 7 alone is two lines there, now nothing follows the highlight).
  const DESKTOP_PAGE: ShareRange = { paragraphIndex: 2, fromWord: 0, endParagraphIndex: 2, toWord: 53 }
  const page = (language: string | undefined, extra: Partial<ShareOptions> = {}, hyphenate?: (word: string) => number[], format: ShareOptions['format'] = 'phone') => psalmPage(format === 'desktop' ? DESKTOP_PAGE : VERSE_7, language, extra, hyphenate, format)
  // What the Worker uses; the same breaks as the phone reader's (checked below).
  const breaks = englishShareBreaks
  type Composed = ReturnType<typeof composeSharePage>
  /** Widest gap between two words on each line, in ems. */
  const widestGaps = (composed: Composed) => composed.layout.lines.map(line => {
    let widest = 0
    for (let k = 0; k + 1 < line.words.length; k++) widest = Math.max(widest, line.words[k + 1].x - line.words[k].x - line.words[k].width)
    return widest / composed.layout.fontSize
  })
  const VERSE = /^[⁰¹²³⁴-⁹]+$/
  const DASH = /[-‐‑–—]/
  /** The placed words, each hyphenated head joined to its tail (a head the page ends on stays partial). */
  const rejoined = (composed: Composed, only: (hl: boolean) => boolean = () => true) => {
    const words: string[] = []
    let head = ''
    for (const line of composed.layout.lines) for (const word of line.words) {
      if (!only(word.hl)) continue
      if (word.hyphen) { head = word.text.slice(0, -1); continue }
      words.push(head + word.text)
      head = ''
    }
    return words
  }
  /** labHyphenPlan's rules, on one page: `before` is the same page unhyphenated. */
  const expectReaderRules = (before: Composed, after: Composed) => {
    const lines = after.layout.lines
    // Never more than two hyphenated lines in a row.
    let run = 0
    for (const line of lines) { run = line.words[line.words.length - 1].hyphen ? run + 1 : 0; expect(run).toBeLessThanOrEqual(SHARE_HYPHEN_MAX_RUN) }
    lines.forEach((line, index) => {
      // Only a line's last word is ever a head, drawn with its hyphen.
      expect(line.words.slice(0, -1).some(word => word.hyphen)).toBe(false)
      const last = line.words[line.words.length - 1]
      if (!last.hyphen) return
      expect(last.text.endsWith('-')).toBe(true)
      // Two letters before the break and three after; never in a number or a word with its own hyphen.
      const head = last.text.slice(0, -1)
      expect(head.replace(/^[^\p{L}]*/u, '').length).toBeGreaterThanOrEqual(2)
      expect(/\d|[⁰¹²³⁴-⁹]/.test(head) || DASH.test(head)).toBe(false)
      const tail = lines[index + 1]?.words[0]
      if (tail) {
        expect(tail.text.replace(/[^\p{L}’']+$/u, '').length).toBeGreaterThanOrEqual(3)
        expect(/\d/.test(tail.text) || DASH.test(tail.text)).toBe(false)
      }
    })
    // The words are the page's own, in order.
    const plain = before.layout.lines.flatMap(line => line.words.map(word => word.text))
    const words = rejoined(after)
    const shared = Math.min(plain.length, words.length)
    expect(shared).toBeGreaterThan(10)
    expect(words.slice(0, shared)).toEqual(plain.slice(0, shared))
    // A verse number never ends a line.
    for (const composed of [before, after]) for (const line of composed.layout.lines.slice(0, -1)) {
      expect(VERSE.test(line.words[line.words.length - 1].text)).toBe(false)
    }
  }

  beforeAll(async () => { await loadHyphenator('en') })

  it('breaks words exactly where the phone reader does (en-us patterns and the syllable fallback)', () => {
    const words = new Set([...psalm, ...paragraphs].flatMap(paragraph => tokenizeParagraph(paragraph).map(token => token.text)))
    for (const word of ['Zechariah', 'Kutuzov', 'Amariah’s', 'Gateshead', 'multitudes']) words.add(word)
    let broken = 0
    for (const word of words) {
      const reader = hyphenationBreaks(word, 'en', true)
      expect(englishShareBreaks(word), word).toEqual(reader)
      if (reader.length) broken++
    }
    expect(broken).toBeGreaterThan(100)
    // The fallback is in: a name the patterns leave whole is still broken.
    expect(hyphenationBreaks('Zechariah', 'en', false)).toEqual([])
    expect(englishShareBreaks('Zechariah').length).toBeGreaterThan(0)
  })

  it('follows the phone reader plan’s thresholds and break rules', () => {
    expect(SHARE_HYPHEN_GAP_EM).toBe(PLAN_GAP_EM)
    expect(SHARE_HYPHEN_SECOND_GAP_EM).toBe(PLAN_SECOND_GAP_EM)
    expect(SHARE_HYPHEN_MAX_RUN).toBe(PLAN_MAX_RUN)
    for (const word of ['¹⁰', '1000000', 'twenty-third', 'well-known']) expect(breaks(word)).toEqual([])
    for (const word of ['enlightening', 'commandment', 'ordinances', 'righteous', 'honeycomb']) {
      for (const at of breaks(word)) {
        expect(at).toBeGreaterThanOrEqual(2)
        expect(word.length - at).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('leaves fewer lines with a gap over 1.6× the font size on the Psalms 19 page', () => {
    const wide = (composed: Composed) => widestGaps(composed).filter(gap => gap > 1.6).length
    let widesBefore = 0
    let widesAfter = 0
    for (const range of [VERSE_7, COMMANDMENT]) {
      const before = psalmPage(range, 'en')
      const after = psalmPage(range, 'en', {}, breaks)
      widesBefore += wide(before)
      widesAfter += wide(after)
      expect(wide(after)).toBeLessThanOrEqual(wide(before))
      expectReaderRules(before, after)
    }
    // Before: "commandment is pure," spread across a whole phone line.
    expect(wide(psalmPage(COMMANDMENT, 'en'))).toBeGreaterThanOrEqual(1)
    expect(widesAfter).toBeLessThan(widesBefore)
    expect(widesAfter).toBe(0)
  })

  it('hyphenates loose justified lines on the Psalms 19 page, as the phone reader does', () => {
    // Anders's page as it was drawn before trailing context was dropped: verse 7
    // highlighted, the rest of the paragraph greyed after it. The page itself
    // now stops at the highlight; this keeps the hyphenation check on a full
    // page of the reader's own text.
    const reference = page('en')
    const tokens = tokenizeParagraph(psalm[2]).slice(VERSE_7.toWord)
    const passage = [...buildPassage(psalm, VERSE_7, true)]
    passage[passage.length - 1] = { tokens: [...passage[passage.length - 1].tokens, ...tokens] }
    const box = { width: reference.frame.text.width, height: reference.frame.text.height, columns: 1, gap: 0 }
    const fullPage = (hyphenate?: (word: string) => number[]): Composed => ({ ...reference, layout: layoutColumns(passage, fonts, reference.frame.baseSize, box, hyphenate) })
    const before = fullPage()
    const after = fullPage(breaks)
    // Loose: a gap wider than the reader plan's threshold (0.55em, space included; a
    // normal space in this face is 0.2em).
    const loose = (composed: Composed) => widestGaps(composed).filter(gap => gap > SHARE_HYPHEN_GAP_EM).length
    expect(loose(before)).toBeGreaterThanOrEqual(5)
    expect(loose(after)).toBe(0)
    expect(Math.max(...widestGaps(before))).toBeGreaterThan(1)
    expect(Math.max(...widestGaps(after))).toBeLessThanOrEqual(SHARE_HYPHEN_GAP_EM)
    expect(after.layout.lines.filter(line => line.words[line.words.length - 1].hyphen).length).toBeGreaterThanOrEqual(2)
    expectReaderRules(before, after)
    // The whole highlight is placed (its opening verse number is the page's own), on the page as drawn too.
    expect(rejoined(after, hl => hl)).toEqual(shareRangeText(psalm, VERSE_7).split(' '))
    expect(rejoined(page('en', {}, breaks), hl => hl)).toEqual(shareRangeText(psalm, VERSE_7).split(' '))
  })

  it('draws the hyphen at each break', () => {
    const composed = page('en', {}, breaks)
    const svg = renderShareSvg(composed, fonts)
    const heads = composed.layout.lines.map(line => line.words[line.words.length - 1]).filter(word => word.hyphen)
    expect(heads.length).toBeGreaterThan(0)
    for (const head of heads) expect(svg).toContain(`>${head.text}</text>`)
  })

  const hyphenated = (composed: Composed) => composed.layout.lines.some(line => line.words.some(word => word.hyphen))

  it('hyphenates the desktop page, every page of a series and the justified quote card, and leaves other languages alone', () => {
    const desktop = page('en', {}, breaks, 'desktop')
    expect(desktop.mode).toBe('single')
    expect(hyphenated(desktop)).toBe(true)
    expectReaderRules(page('en', {}, undefined, 'desktop'), desktop)
    // A series of single pages (never a spread), hyphenated as the reader is.
    const series = composeShareCards(psalmContent('en', HEAVENS), options('desktop', { tagline: false }), fonts, breaks)
    expect(series.length).toBeGreaterThan(1)
    expect(series.every(composed => composed.mode === 'single' && !composed.cut)).toBe(true)
    expect(series.some(hyphenated)).toBe(true)
    // The quote card, one or a series, is justified like the reader, so it is hyphenated too.
    for (const format of ['phone', 'desktop'] as const) {
      const cards = [page('en', { context: false }, breaks, format), ...composeShareCards(psalmContent('en', HEAVENS), options(format, { context: false }), fonts, breaks)]
      expect(cards.every(composed => composed.mode === 'quote')).toBe(true)
      expect(cards.some(hyphenated)).toBe(true)
    }
    for (const language of ['da', undefined]) {
      expect(hyphenated(page(language, {}, breaks))).toBe(false)
      expect(hyphenated(page(language, { context: false }, breaks))).toBe(false)
    }
  })
})

describe('share highlight: a series of cards for a long quote', () => {
  // Anders's example: Notes from Underground (Garnett 1918), Part 1, Chapter 8,
  // "In short, one may say anything about the history of the world…" through "…piano-key!".
  const notes: { title: string; paragraphs: string[] } = JSON.parse(readFileSync(resolve(root, 'public/data/editions/notes-from-underground-original-en.json'), 'utf8')).chapters.find((chapter: { number: number }) => chapter.number === 8)
  const words = tokenizeParagraph(notes.paragraphs[3]).map(token => token.text)
  const from = words.findIndex((word, index) => word === 'In' && words[index + 1] === 'short,')
  const to = words.findIndex((word, index) => index > from && word === 'piano-key!') + 1
  const NOTES: ShareRange = { paragraphIndex: 3, fromWord: from, endParagraphIndex: 3, toWord: to }
  const notesContent: ShareContent = { bookTitle: 'Notes from Underground', chapterLabel: notes.title, language: 'en', paragraphs: notes.paragraphs, range: NOTES }
  const cardWords = (page: ReturnType<typeof composeSharePage>) => page.layout.lines.flatMap(line => line.words.map(word => word.text))
  const lastOf = (list: string[]) => list[list.length - 1]
  /** A word without the "…" a split mid-sentence adds. */
  const bare = (word: string) => word.replace(new RegExp(`^${SHARE_ELLIPSIS}|${SHARE_ELLIPSIS}$`, 'g'), '')

  it('splits Anders’s long quote at sentences, losing no words, one size on every card', () => {
    expect(notesContent.chapterLabel).toBe('Part 1, Chapter 8')
    expect(words[to - 1]).toBe('piano-key!')
    const quote = shareRangeText(notes.paragraphs, NOTES).split(' ')
    expect(quote[0]).toBe('In')
    for (const format of ['phone', 'desktop'] as const) for (const tagline of [false, true]) {
      const cards = composeShareCards(notesContent, options(format, { look: 'night', context: false, tagline }), fonts)
      expect(cards.length).toBeGreaterThanOrEqual(2)
      expect(cards.length).toBeLessThanOrEqual(SERIES_MAX_CARDS)
      // Readable: the card's own smallest size or larger, the same on every card.
      expect(cards[0].layout.fontSize).toBeGreaterThanOrEqual(QUOTE_CARDS[format].minSize)
      for (const card of cards) {
        expect(card.mode).toBe('quote')
        expect(card.layout.fontSize).toBe(cards[0].layout.fontSize)
        expect(card.frame.canvas).toEqual(cards[0].frame.canvas)
        expect(card.layout.fits).toBe(true)
        expect(card.layout.usedHeight).toBeLessThanOrEqual(card.frame.text.height + 0.5)
        expect(card.options.look).toBe('night')
        expect(card.layout.lines.flatMap(line => line.words).every(word => word.hl)).toBe(true)
      }
      // Every word in order, none twice, unchanged; each card but the last ends on a sentence.
      expect(cards.flatMap(cardWords)).toEqual(quote)
      for (const card of cards.slice(0, -1)) expect(/[.!?]["”’)]*$/.test(lastOf(cardWords(card)))).toBe(true)
      expect(cards.map(card => card.series)).toEqual(cards.map((_, k) => ({ index: k + 1, count: cards.length })))
      // The credit, when chosen, on every card (Copy image copies the card in view).
      expect(cards.map(card => card.options.tagline)).toEqual(cards.map(() => tagline))
    }
  })

  it('draws book · chapter on every card, the credit on every card when chosen, and never a "1/3"', () => {
    for (const tagline of [true, false]) {
      const cards = composeShareCards(notesContent, options('phone', { look: 'night', context: false, tagline }), fonts)
      expect(cards.length).toBeGreaterThan(1)
      const svgs = cards.map(card => renderShareSvg(card, fonts))
      svgs.forEach(svg => {
        expect(svg).toContain('Notes from Underground')
        expect(svg).toContain('Part 1, Chapter 8')
        // The count is the share sheet's UI, not part of the copied/shared image.
        expect(svg).not.toMatch(/>\d\/\d<\/text>/)
        expect(svg.includes(SHARE_TAGLINE)).toBe(tagline)
        expect(svg).toContain(`fill="${SHARE_PALETTES.night.highlight}"`)
        expect(svg).toContain(`fill="${SHARE_PALETTES.night.paper}"`)
      })
    }
  })

  it('shows no counter on a single card, and keeps the page and spread for surrounding text', () => {
    const [card, ...rest] = composeShareCards(content(SHORT), options('phone', { context: false }), fonts)
    expect(rest).toEqual([])
    expect(card.series).toBeUndefined()
    expect(renderShareSvg(card, fonts)).not.toMatch(/>\d\/\d<\/text>/)
    expect(composeShareCards(content(SHORT), options('phone'), fonts).map(page => page.mode)).toEqual(['single'])
    expect(composeShareCards(content(SHORT), options('phone'), fonts)[0].series).toBeUndefined()
    // A long highlight with surrounding text: single pages, never a spread.
    for (const format of ['phone', 'desktop'] as const) {
      const pages = composeShareCards(notesContent, options(format), fonts)
      expect(pages.length).toBeGreaterThan(1)
      expect(pages.every(page => page.mode === 'single')).toBe(true)
    }
  })

  it('with surrounding text, sets Anders’s long highlight as single pages: context only at the very start, nothing after the highlight', () => {
    const quote = shareRangeText(notes.paragraphs, NOTES).split(' ')
    for (const format of ['phone', 'desktop'] as const) for (const tagline of [false, true]) {
      const pages = composeShareCards(notesContent, options(format, { tagline }), fonts, englishShareBreaks)
      expect(pages.length).toBeGreaterThanOrEqual(2)
      expect(pages.length).toBeLessThanOrEqual(SERIES_MAX_CARDS)
      const placed = pages.map(page => page.layout.lines.flatMap(line => line.words))
      pages.forEach((page, k) => {
        expect(page.mode).toBe('single')
        expect(page.series).toEqual({ index: k + 1, count: pages.length })
        // One size on every page: the reader's, or no smaller than 75% of it.
        expect(page.layout.fontSize).toBe(pages[0].layout.fontSize)
        expect(page.scale).toBeGreaterThanOrEqual(0.75)
        expect(page.cut).toBe(false)
        expect(page.layout.usedHeight).toBeLessThanOrEqual(page.frame.text.height + 0.5)
        expect(page.offsetY).toBe(0)
        // Continuation pages are all highlight: no context line, and no rule or fold drawn.
        if (k > 0) expect(placed[k].every(word => word.hl)).toBe(true)
        const svg = renderShareSvg(page, fonts)
        expect(svg).not.toContain('linearGradient')
        expect(svg).not.toContain('<line')
        expect(svg.includes(SHARE_TAGLINE)).toBe(tagline)
      })
      // The leading context opens the first page.
      expect(placed[0][0].hl).toBe(false)
      // The last page ends on the highlight's last word: no trailing context line.
      const last = placed[placed.length - 1]
      expect(last[last.length - 1]).toMatchObject({ hl: true, text: 'piano-key!' })
      // Every highlighted word in order, once (a word broken at a line end rejoined).
      const shown: string[] = []
      let head = ''
      for (const word of placed.flat()) {
        if (!word.hl) continue
        if (word.hyphen) { head = word.text.slice(0, -1); continue }
        shown.push(head + word.text)
        head = ''
      }
      expect(shown).toEqual(quote)
    }
  })

  it('draws no trailing context after a highlight, ending mid-sentence with "…"', () => {
    const tokens = buildPassage(paragraphs, SHORT, true).flatMap(paragraph => paragraph.tokens)
    expect(tokens[tokens.length - 1]).toMatchObject({ text: 'heart.', hl: true })
    const mid = buildPassage(paragraphs, { ...SHORT, toWord: SHORT.toWord - 1 }, true).flatMap(paragraph => paragraph.tokens)
    expect(mid[mid.length - 1]).toMatchObject({ text: `my${SHARE_ELLIPSIS}`, hl: true })
    for (const format of ['phone', 'desktop', 'og'] as const) {
      const page = composeSharePage(content(SHORT), options(format), fonts)
      const placed = page.layout.lines.flatMap(line => line.words)
      expect(placed[placed.length - 1].hl).toBe(true)
      // A lone page is centred, now nothing follows the highlight.
      expect(page.offsetY).toBeGreaterThan(0)
    }
  })

  it('splits a sentence too long for one card at its clauses, still losing no words', () => {
    // One sentence of 400 words, with commas but no full stop until the end.
    const sentence = Array.from({ length: 40 }, (_, k) => `the ${k % 2 ? 'patient' : 'restless'} reader turned the page again and again,`).join(' ').replace(/,$/, '.')
    const long: ShareContent = { bookTitle: 'Test', chapterLabel: 'One', language: 'en', paragraphs: [sentence], range: { paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: tokenizeParagraph(sentence).length } }
    const cards = composeShareCards(long, options('phone', { context: false }), fonts)
    expect(cards.length).toBeGreaterThan(1)
    expect(cards.length).toBeLessThanOrEqual(SERIES_MAX_CARDS)
    expect(cards.flatMap(cardWords).map(bare)).toEqual(sentence.split(' '))
    cards.slice(0, -1).forEach((card, k) => {
      // A clause ends the card, "…" says the sentence goes on, and the next card opens with "…".
      expect(lastOf(cardWords(card)).endsWith(`,${SHARE_ELLIPSIS}`)).toBe(true)
      expect(cardWords(cards[k + 1])[0].startsWith(SHARE_ELLIPSIS)).toBe(true)
    })
  })

  it('caps a very long quote at four cards with smaller type; past the floor, the page takes it', () => {
    // Frankenstein chapter 5, paragraphs 2–6 (about 740 words).
    for (const format of ['phone', 'desktop'] as const) {
      const cards = composeShareCards(content(OVER), options(format, { context: false }), fonts)
      expect(cards.every(card => card.mode === 'quote')).toBe(true)
      expect(cards.length).toBeGreaterThan(1)
      expect(cards.length).toBeLessThanOrEqual(SERIES_MAX_CARDS)
      expect(cards[0].layout.fontSize).toBeGreaterThanOrEqual(SERIES_FLOOR_SIZE[format])
      expect(cards.flatMap(cardWords).map(bare)).toEqual(shareRangeText(paragraphs, OVER).split(' '))
    }
    // On the phone that is more than four cards at the card's smallest size: four, smaller.
    const phone = composeShareCards(content(OVER), options('phone', { context: false }), fonts)
    expect(phone).toHaveLength(SERIES_MAX_CARDS)
    expect(phone[0].layout.fontSize).toBeLessThan(QUOTE_CARDS.phone.minSize)
    // Far past four cards even at the floor: one image, the page with its 75% floor and sentence cut.
    const all = paragraphs.slice(0, 12)
    const huge: ShareContent = { bookTitle: 'Frankenstein', chapterLabel: 'Chapter 5', paragraphs: all, range: { paragraphIndex: 0, fromWord: 0, endParagraphIndex: all.length - 1, toWord: tokenizeParagraph(all[all.length - 1]).length } }
    const fallback = composeShareCards(huge, options('phone', { context: false }), fonts)
    expect(fallback).toHaveLength(1)
    expect(fallback[0].mode).toBe('single')
    expect(fallback[0].cut).toBe(true)
    expect(fallback[0].series).toBeUndefined()
  })

  it('opens the link preview on the first card’s text, ending in "…"', () => {
    for (const format of ['phone', 'desktop'] as const) {
      const [first] = composeShareCards(notesContent, options(format, { context: false }), fonts)
      const og = composeSharePage(notesContent, options('og', { context: false, cardFormat: format }), fonts)
      expect(og.frame.canvas).toEqual({ width: 1200, height: 630 })
      const shown = cardWords(og)
      const firstWords = cardWords(first)
      expect(lastOf(shown).endsWith(SHARE_ELLIPSIS)).toBe(true)
      expect(shown.length).toBeLessThanOrEqual(firstWords.length)
      expect(shown.slice(0, -1)).toEqual(firstWords.slice(0, shown.length - 1))
      expect(bare(lastOf(shown))).toBe(firstWords[shown.length - 1])
    }
    // A single card's preview is as before.
    const single = composeSharePage(content(SHORT), options('og', { context: false, cardFormat: 'phone' }), fonts)
    expect(cardWords(single)).toEqual(cardWords(composeSharePage(content(SHORT), options('og', { context: false }), fonts)))
  })
})

describe('share highlight: follows the reader (alignment, highlight colour)', () => {
  const MEDIUM: ShareRange = { paragraphIndex: 3, fromWord: 0, endParagraphIndex: 3, toWord: tokenizeParagraph(paragraphs[3]).length }
  const english = (range: ShareRange): ShareContent => ({ ...content(range), language: 'en' })
  /** Whether each line's last word reaches the right edge of the text box. */
  const reachesEdge = (page: ReturnType<typeof composeSharePage>) => page.layout.lines.map(line => {
    const last = line.words[line.words.length - 1]
    return Math.abs(last.x + last.width - page.frame.text.width) < 0.5
  })

  beforeAll(async () => { await loadHyphenator('en') })

  it('justifies the card (hyphenated, each paragraph’s last line left) when the reader is justified', () => {
    for (const format of ['phone', 'desktop'] as const) for (const context of [false, true]) {
      for (const align of [undefined, 'justify'] as const) {
        const page = composeSharePage(english(MEDIUM), options(format, { context, align }), fonts, englishShareBreaks)
        const edges = reachesEdge(page)
        // Every line but the paragraph's last reaches the right edge; the last is set left.
        expect(edges.slice(0, -1).every(Boolean)).toBe(true)
        expect(edges[edges.length - 1]).toBe(false)
        expect(page.layout.lines[page.layout.lines.length - 1].words[0].x).toBe(0)
      }
    }
    // The justified card breaks loose lines as the reader does.
    const cards = [MEDIUM, LONG].flatMap(range => composeShareCards(english(range), options('phone', { context: false }), fonts, englishShareBreaks))
    expect(cards.some(card => card.layout.lines.some(line => line.words.some(word => word.hyphen)))).toBe(true)
  })

  it('sets the card left-aligned, unhyphenated, when the reader is left-aligned', () => {
    for (const format of ['phone', 'desktop'] as const) for (const context of [false, true]) {
      const pages = [MEDIUM, LONG].flatMap(range => composeShareCards(english(range), options(format, { context, align: 'left' }), fonts, englishShareBreaks))
      for (const page of pages) {
        expect(page.layout.lines.some(line => line.words.some(word => word.hyphen))).toBe(false)
        // Ragged right: normal word spaces only.
        for (const line of page.layout.lines) for (let k = 0; k + 1 < line.words.length; k++) {
          const gap = line.words[k + 1].x - line.words[k].x - line.words[k].width
          expect(gap / page.layout.fontSize).toBeLessThan(0.3)
        }
      }
      expect(pages.some(page => reachesEdge(page).slice(0, -1).some(edge => !edge))).toBe(true)
    }
  })

  it('draws no highlight colour when it is turned off, keeping the words and their weight', () => {
    for (const look of ['paper', 'night'] as const) for (const context of [false, true]) for (const format of ['phone', 'desktop', 'og'] as const) {
      const on = renderShareSvg(composeSharePage(content(SHORT), options(format, { look, context }), fonts), fonts)
      const off = renderShareSvg(composeSharePage(content(SHORT), options(format, { look, context, highlight: false }), fonts), fonts)
      expect(on).toContain(`fill="${SHARE_PALETTES[look].highlight}"/>`)
      expect(off).not.toContain(`fill="${SHARE_PALETTES[look].highlight}"`)
      expect(off).toContain('font-weight="600"')
      expect(off.match(/<text /g)?.length).toBe(on.match(/<text /g)?.length)
    }
    // Every card of a series, too.
    for (const context of [false, true]) {
      const cards = composeShareCards(content(LONG), options('phone', { context, highlight: false }), fonts)
      expect(cards.length).toBeGreaterThan(1)
      for (const card of cards) expect(renderShareSvg(card, fonts)).not.toContain(`fill="${SHARE_PALETTES.paper.highlight}"`)
    }
  })
})
