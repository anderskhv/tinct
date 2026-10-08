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

  // One image only (composeSharePage). The share itself sets such a quote as a
  // series of cards (composeShareCards, below); this page is its last resort.
  it('as one image, hands a quote too long for the card to the page, which never loses more words', () => {
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
  const page = (language: string | undefined, extra: Partial<ShareOptions> = {}, hyphenate?: (word: string) => number[], format: ShareOptions['format'] = 'phone') => psalmPage(VERSE_7, language, extra, hyphenate, format)
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
    const before = page('en')
    const after = page('en', {}, breaks)
    // Loose: a gap wider than the reader plan's threshold (0.55em, space included; a
    // normal space in this face is 0.2em).
    const loose = (composed: Composed) => widestGaps(composed).filter(gap => gap > SHARE_HYPHEN_GAP_EM).length
    expect(loose(before)).toBeGreaterThanOrEqual(5)
    expect(loose(after)).toBe(0)
    expect(Math.max(...widestGaps(before))).toBeGreaterThan(1)
    expect(Math.max(...widestGaps(after))).toBeLessThanOrEqual(SHARE_HYPHEN_GAP_EM)
    expect(after.layout.lines.filter(line => line.words[line.words.length - 1].hyphen).length).toBeGreaterThanOrEqual(2)
    expectReaderRules(before, after)
    // The whole highlight is placed (its opening verse number is the page's own).
    expect(rejoined(after, hl => hl)).toEqual(shareRangeText(psalm, VERSE_7).split(' '))
  })

  it('draws the hyphen at each break', () => {
    const composed = page('en', {}, breaks)
    const svg = renderShareSvg(composed, fonts)
    const heads = composed.layout.lines.map(line => line.words[line.words.length - 1]).filter(word => word.hyphen)
    expect(heads.length).toBeGreaterThan(0)
    for (const head of heads) expect(svg).toContain(`>${head.text}</text>`)
  })

  it('hyphenates the desktop page and spread too, and leaves the quote card and other languages alone', () => {
    const desktop = page('en', {}, breaks, 'desktop')
    expect(desktop.mode).toBe('single')
    expect(desktop.layout.lines.some(line => line.words.some(word => word.hyphen))).toBe(true)
    expectReaderRules(page('en', {}, undefined, 'desktop'), desktop)
    const spread = psalmPage(HEAVENS, 'en', {}, breaks, 'desktop')
    expect(spread.mode).toBe('spread')
    expect(spread.cut).toBe(false)
    expect(spread.layout.lines.some(line => line.words.some(word => word.hyphen))).toBe(true)
    expectReaderRules(psalmPage(HEAVENS, 'en', {}, undefined, 'desktop'), spread)
    // The quote card, one or a series, stays ragged right and unhyphenated.
    for (const format of ['phone', 'desktop'] as const) {
      const card = page('en', { context: false }, breaks, format)
      expect(card.mode).toBe('quote')
      for (const composed of [card, ...composeShareCards(psalmContent('en', HEAVENS), options(format, { context: false }), fonts, breaks)]) {
        expect(composed.mode).toBe('quote')
        expect(composed.layout.lines.some(line => line.words.some(word => word.hyphen))).toBe(false)
      }
    }
    for (const language of ['da', undefined]) {
      expect(page(language, {}, breaks).layout.lines.some(line => line.words.some(word => word.hyphen))).toBe(false)
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
    expect(composeShareCards(content(LONG), options('desktop'), fonts).map(page => page.mode)).toEqual(['spread'])
    expect(composeShareCards(content(SHORT), options('phone'), fonts).map(page => page.mode)).toEqual(['single'])
    expect(composeShareCards(notesContent, options('phone'), fonts)).toHaveLength(1)
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
