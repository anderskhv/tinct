// @vitest-environment jsdom
/**
 * A web article pasted into Tinct (Paste text, public/lab/library_2/paste-text.js), as Anders
 * pasted one on 4 Nov 2026: site menu, title, counters, numbered sections "I."–"IV." with
 * sub-sections "i." and "ii." under the last, a paywall, teasers for other articles and the
 * site's footer. Synthetic text with the same structure; the article itself is not kept here.
 *
 * Conversion rules 12 (userEdition.ts): only top-level headings start chapters, a short
 * section opens the chapter after it, a short piece is one chapter. Every case also converts
 * under rules 11, which must stay what a book converted before was.
 */
import { describe, expect, it } from 'vitest'
import { epubToEdition } from './lab/userBook/epubEdition'
import { USER_EDITION_CONVERTER } from './lab/userBook/userEdition'
// @ts-expect-error -- shared browser module
import { chromeUnits, pasteEpub, preview } from '../public/lab/library_2/paste-text.js'

const data = (file: File) => new Promise<Uint8Array>((resolve, reject) => {
  const reader = new FileReader(); reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer)); reader.onerror = () => reject(reader.error); reader.readAsArrayBuffer(file)
})
const convert = async (source: string, format: string, rules?: number) =>
  epubToEdition(await data(pasteEpub({ source, format, title: 'Notes From the Lodge Lectures' })), rules ? { rules } : {})

/** A paragraph of `words` words (about), its sentences told apart by `tag`. */
const para = (tag: string, words: number) => Array.from({ length: Math.ceil(words / 12) }, (_, i) =>
  `In part ${tag} the speaker made point ${i + 1} about the long history of the idea, slowly.`).join(' ')
const paras = (tag: string, count: number, words: number) => Array.from({ length: count }, (_, i) => para(`${tag}-${i + 1}`, words))

const MENU = ['Lodge Review', 'Technology', 'Politics', 'Culture', 'Newsletters', 'Subscribe', 'Sign In', 'Gift a Sub 🎁', 'Store', 'Lodge Review', 'Search', 'Take Archive', 'About', 'Writers', 'Careers', 'Powered by Substack']
const COUNTERS = ['202 ', 'Likes', '31 ', 'Comments', 'Share']
const CAPTION = 'An old fresco of the gathering in the hall, painted circa 1499.'
const TAIL = ['Enter your email to continue reading', 'Sign up for free', 'Already have an account? Sign In', '', 'Continue Reading', '',
  'Two Students Argued About the Campus Lectures.Oct 2', 'in an op-ed, the students called the whole affair a collective frenzy that helped nobody at all.', 'Jo Writer', '86 Likes', '19 Comments', '',
  'The Official Anthem of the Season’s RevivalOct 23', 'the cases have sparked a resurgence of online debate about the old lectures and their meaning.', 'Riley North', '62 Likes', '16 Comments']
const FOOTER = ['Terms & Conditions', 'Cookie Policy', 'X (Twitter)', 'Facebook', 'Instagram', 'RSS', 'Newsletter', 'Advertise', 'All rights reserved. © 2026 Lodge Review']
const CHROME = [...MENU, ...COUNTERS, ...TAIL, ...FOOTER].map(line => line.trim()).filter(Boolean)

/** The article's sections: [heading, level, paragraphs]. `long` makes it a long read (over 2,500 words). */
function article(long: boolean): Array<[string | null, number, string[]]> {
  const n = long ? 3 : 1
  return [
    [null, 0, [para('intro', 40), para('intro2', 70)]],
    ['I. The arrival', 2, paras('one', 2 * n, 150)],
    ['II. Prophecy of the end', 2, [...paras('two', 2 * n, 150), CAPTION, para('two-after', 80)]],
    ['III. A view of history', 2, paras('three', 2 * n, 150)],
    ['IV. Signs of the (end) times', 2, [para('four', 50), para('four2', 50)]],
    ['i. The figure and the battle', 3, paras('sub-one', 2 * n, 160)],
    ['ii. One world as a plausible tyranny', 3, long ? paras('sub-two', 3, 140) : []],
  ]
}

/** As copied from the page: plain text, a paragraph on each line, the site around it. */
function plainPage(long: boolean, chrome = true): string {
  const lines = [...(chrome ? [...MENU.slice(0, 4), '', ...MENU.slice(4), ''] : []), 'Notes From the Lodge Lectures', 'we are in a strange era; the speaker wants you to read the old books and think harder.', 'G. B. Writer', 'Oct 25, 2026', CAPTION, ...(chrome ? COUNTERS : [])]
  for (const [heading, , body] of article(long)) {
    if (heading) lines.push(heading)
    for (const line of body) lines.push(...(line === CAPTION ? ['', line] : [line]))
  }
  return [...lines, ...(chrome ? [...TAIL, ...FOOTER] : [])].join('\n')
}

/** As copied from the page: its HTML (`same`: sub-sections set at the sections' own level). */
function htmlPage(long: boolean, { chrome = true, same = false } = {}): string {
  const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const out: string[] = []
  if (chrome) out.push(`<div class="topbar">${MENU.map(item => `<div><a href="https://example.com/">${esc(item)}</a></div>`).join('')}</div>`)
  out.push('<article><h1>Notes From the Lodge Lectures</h1><h3 class="subtitle">we are in a strange era; the speaker wants you to read the old books and think harder.</h3>',
    '<div class="byline"><a href="https://example.com/w">G. B. Writer</a></div><div>Oct 25, 2026</div>', `<figure><img src="https://example.com/a.jpg"><figcaption>${CAPTION}</figcaption></figure>`)
  if (chrome) out.push(COUNTERS.map(item => `<div class="ufi"><div class="label">${item}</div></div>`).join(''))
  for (const [heading, level, body] of article(long)) {
    if (heading) out.push(`<h${same ? 2 : level}>${esc(heading)}</h${same ? 2 : level}>`)
    for (const line of body) out.push(line === CAPTION ? `<figure><img src="https://example.com/a.jpg"><figcaption>${CAPTION}</figcaption></figure>` : `<p>${esc(line)}</p>`)
  }
  out.push('</article>')
  if (chrome) out.push(`<div class="paywall">${TAIL.filter(Boolean).map(item => `<div><a href="https://example.com/s">${esc(item)}</a></div>`).join('')}</div>`,
    `<footer>${FOOTER.map(item => `<div><a href="https://example.com/f">${esc(item)}</a></div>`).join('')}</footer>`)
  return out.join('\n')
}

const words = (edition: { chapters: Array<{ paragraphs: string[] }> }) => edition.chapters.flatMap(chapter => chapter.paragraphs).join(' ').split(/\s+/).length
const outline = (edition: { chapters: Array<{ title: string; paragraphs: string[]; kinds?: Array<string | null> }> }) =>
  edition.chapters.map(chapter => [chapter.title, chapter.paragraphs.filter((_, i) => chapter.kinds?.[i] === 'heading')])

describe('chapters of a pasted article (rules 12)', () => {
  it('cuts a long read only at its top-level sections: "i." and "ii." stay inside IV', async () => {
    expect(USER_EDITION_CONVERTER).toBe(12)
    const expected = [
      // The article's opening (title, subtitle, byline, picture, two paragraphs) before its first section.
      ['Notes From the Lodge Lectures'],
      ['1. The arrival', []],
      ['2. Prophecy of the end', []],
      ['3. A view of history', []],
      ['4. Signs of the (end) times', ['i. The figure and the battle', 'ii. One world as a plausible tyranny']],
    ]
    for (const [source, format] of [[htmlPage(true), 'html'], [htmlPage(true, { same: true }), 'html'], [plainPage(true), 'plain']]) {
      const edition = await convert(source, format)
      expect(words(edition)).toBeGreaterThan(2500)
      expect(edition.converter).toBe(12)
      // The opening's subtitle is a heading in the HTML and a paragraph in plain text; the chapters are the same.
      expect(outline(edition).map((entry, index) => index ? entry : [entry[0]])).toEqual(expected)
    }
  })

  it('keeps a book converted before exactly as it was: under rules 11 "i." still opens a chapter of its own', async () => {
    const edition = await convert(htmlPage(true, { chrome: false }), 'html', 11)
    expect(edition.converter).toBe(11)
    const titles = edition.chapters.map(chapter => chapter.title)
    expect(titles).toContain('4. Signs of the (end) times')
    expect(titles.length).toBeGreaterThan(4)
    expect(edition.chapters.find(chapter => chapter.title === '4. Signs of the (end) times')!.paragraphs).toHaveLength(2)
  })

  it('keeps a short piece in one chapter, its headings inside it', async () => {
    for (const [source, format] of [[htmlPage(false), 'html'], [plainPage(false), 'plain']]) {
      const edition = await convert(source, format)
      expect(words(edition)).toBeLessThan(2500)
      expect(outline(edition)).toEqual([['Notes From the Lodge Lectures', expect.arrayContaining(['I. The arrival', 'II. Prophecy of the end', 'III. A view of history', 'IV. Signs of the (end) times', 'i. The figure and the battle', 'ii. One world as a plausible tyranny'])]])
    }
  })

  it('lets a short section open the chapter after it, and a short last section join the one before', async () => {
    const section = (title: string, words: number) => `<h2>${title}</h2>` + paras(title, Math.max(1, Math.round(words / 150)), Math.min(words, 150)).map(text => `<p>${text}</p>`).join('')
    const source = section('A brief opening', 100) + section('The long middle', 900) + section('Another long part', 900) + section('A third long part', 900) + section('A closing word', 100)
    const edition = await convert(source, 'html')
    expect(outline(edition)).toEqual([
      // The book's title over the first section stays there as it did under rules 11.
      ['A brief opening', ['Notes From the Lodge Lectures', 'The long middle']],
      ['Another long part', []],
      ['A third long part', ['A closing word']],
    ])
    // Rules 11: every heading opened its own chapter.
    expect((await convert(source, 'html', 11)).chapters).toHaveLength(5)
  })
})

describe('web-page chrome around a pasted article', () => {
  it('leaves out the site and keeps every line of the article', async () => {
    for (const [source, format] of [[htmlPage(false), 'html'], [plainPage(false), 'plain'], [htmlPage(true), 'html'], [plainPage(true), 'plain']]) {
      const edition = await convert(source, format)
      const text = edition.chapters.flatMap(chapter => [chapter.title, ...chapter.paragraphs])
      for (const line of CHROME) expect(text, `${format}: ${line}`).not.toContain(line)
      // Every paragraph and heading of the article (a chapter's title as the reader numbers it: "1. The arrival").
      const all = text.join('\n').replace(/^\d\. /gm, '')
      for (const [heading, , body] of article(source.length > 20000)) for (const line of [heading?.replace(/^[IV]+\. /, ''), ...body].filter(Boolean)) expect(all).toContain(line!)
      // The caption set again in the prose is left out; the first one stays.
      expect(text.filter(line => line === CAPTION)).toHaveLength(1)
    }
  })

  it('converts the article pasted without the site exactly as the article pasted with it', async () => {
    for (const long of [false, true]) {
      expect((await convert(htmlPage(long), 'html')).chapters).toEqual((await convert(htmlPage(long, { chrome: false }), 'html')).chapters)
      expect((await convert(plainPage(long), 'plain')).chapters).toEqual((await convert(plainPage(long, false), 'plain')).chapters)
      // Without the site, only the caption set again in the prose is left out.
      expect(chromeUnits(plainPage(long, false).split('\n')).size).toBe(1)
    }
  })

  it('takes nothing from text that only looks like a menu, a counter or a footer', () => {
    const poem = ['Home', 'Search the hills', 'About the river', 'Share the bread', 'Sign in the snow', 'Love', 'and', 'Home'].join('\n')
    expect(chromeUnits(poem.split('\n')).size).toBe(0)
    // A refrain repeated in a stanza, a lone number, a sentence about sharing, a closing line about rights.
    const verse = ['O Captain my Captain our fearful trip is done', 'The ship has weathered every rack', 'O Captain my Captain our fearful trip is done', '', '2', '', 'She asked us to share what we had, and we did.', 'All the rights we had were reserved for the king.']
    expect(chromeUnits(verse).size).toBe(0)
    // A printed book: its contents names a chapter the text then opens with, and it ends on its copyright.
    const book = ['CONTENTS', '', 'CHAPTER I. Down the Long Hall', 'CHAPTER II. The Pool of Tears', '', '', 'CHAPTER I. Down the Long Hall', '',
      'She was beginning to get very tired of sitting by her sister on the bank,', 'and of having nothing to do.', '', 'THE END', '', 'Copyright © 1925 Jo Writer', 'All rights reserved.']
    expect(chromeUnits(book).size).toBe(0)
    // Printed text keeps its wrapped lines in one paragraph.
    expect(preview('A printed line that wraps\nonto the next printed line.', 'plain')).toBe('<p>A printed line that wraps<br/>onto the next printed line.</p>')
  })
})
