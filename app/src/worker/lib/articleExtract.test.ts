import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { decodeEntities, extractArticle, type ExtractedArticle } from './articleExtract'

const fixture = (name: string) => readFileSync(new URL(`../__fixtures__/articles/${name}.html`, import.meta.url), 'utf8')
const article = (name: string, url = `https://www.example.org/${name}/story`) => {
  const result = extractArticle(fixture(name), url)
  if ('refused' in result) throw new Error(`refused: ${result.refused}`)
  return result as ExtractedArticle
}

describe('the readable article in a fetched page', () => {
  it('news page: title, byline and site from the page; the story without nav, ads, cookies, share bar, related links, newsletter or comments', () => {
    const a = article('news')
    expect(a).toMatchObject({ title: 'The quiet return of the river otter', author: 'Maren Holt', siteName: 'The Northern Ledger' })
    expect(a.html).toContain('<p>For most of the last century, the river that runs through the old mill town')
    expect(a.html).toContain('“People think of otters as shy,” said Ilse Brand')
    expect(a.html).toContain('spraints — otter droppings')
    expect(a.html).toContain('Many of them, Brand suspects, would not believe it if they did.</p>')
    expect(a.html).toContain('<figcaption>An otter photographed below the footbridge in April.</figcaption>')
    for (const chrome of ['cookies', 'Accept all', 'Opinion', 'Subscribe', 'Advertisement', 'Sponsored', 'Share on', 'Herons nest', 'Related', 'morning briefing', 'Comments', 'Wonderful news', 'More from', 'Council approves', 'All rights reserved', 'Privacy', 'not text', 'gtag'])
      expect(a.html).not.toContain(chrome)
    // The title is the book's heading, not repeated in its text.
    expect(a.html).not.toContain('<h2>The quiet return')
    expect(a.words).toBeGreaterThan(300)
    expect(a.html.match(/<p>/g)!.length).toBeGreaterThanOrEqual(8)
  })

  it('blog with headings: h2/h3 kept in order, list, quote and code kept, sidebar and share links left out', () => {
    const a = article('blog')
    expect(a).toMatchObject({ title: 'Notes on keeping a commonplace book', author: 'Tomas Ward', siteName: 'Field Notes' })
    const order = ['<h2>Why by hand</h2>', '<h3>What I copy</h3>', '<li>Sentences I want to remember', '<h2>Organising it</h2>', '<blockquote><p>Read not to contradict', '<pre>index:\n  weather', 'If you want to start']
    const at = order.map(part => a.html.indexOf(part))
    expect(at.every(i => i >= 0)).toBe(true)
    expect([...at].sort((x, y) => x - y)).toEqual(at)
    for (const chrome of ['Recent posts', 'On reading slowly', 'small house by the sea', 'Share this post', 'Archive', 'RSS', 'Terms'])
      expect(a.html).not.toContain(chrome)
    // A heading's own anchor link is not kept as a link.
    expect(a.html).not.toContain('#why-by-hand')
  })

  it('a home page of teasers has no article: refused, not a book of headlines', () => {
    expect(extractArticle(fixture('home'), 'https://harbour.example.org/')).toEqual({ refused: 'no_text' })
  })

  it('a page built by JavaScript shares no text: refused', () => {
    expect(extractArticle(fixture('spa'), 'https://app.example.org/read/1')).toEqual({ refused: 'no_text' })
  })

  it('a paywalled page showing only its opening: refused', () => {
    expect(extractArticle(fixture('paywall'), 'https://review.example.org/census')).toEqual({ refused: 'paywall' })
  })

  it('keeps safe inline emphasis and absolute links; drops scripts, images and event handlers', () => {
    const prose = 'This sentence is long enough to count as the body of an article that someone might want to read in Tinct. '.repeat(3)
    const html = `<html><head><title>Plain page</title></head><body><article><h1>Plain page</h1>
      <p onclick="steal()">${prose} It links <a href="/next" onclick="x()">to the next part</a> and has <em>emphasis</em>, <b>weight</b> and <img src="x.png" onerror="alert(1)">nothing else.</p>
      <p>${prose}<script>alert(1)</script></p><p>${prose} <a href="javascript:alert(1)">bad link</a></p></article></body></html>`
    const a = extractArticle(html, 'https://example.org/a/') as ExtractedArticle
    expect(a.title).toBe('Plain page')
    expect(a.html).toContain('<a href="https://example.org/next">to the next part</a>')
    expect(a.html).toContain('<em>emphasis</em>')
    expect(a.html).toContain('<strong>weight</strong>')
    expect(a.html).toContain('bad link')
    for (const bad of ['onclick', 'onerror', 'javascript:', '<img', '<script', 'alert(1)', 'steal'])
      expect(a.html).not.toContain(bad)
  })

  it('finds the densest block on a page without article or main elements', () => {
    const prose = (n: number) => `Paragraph ${n} carries the argument forward with several clauses, a few examples drawn from the lower valley, and a conclusion that leads, more or less directly, into the next one.`
    const html = `<html><head><title>Essay on rivers — River Society</title><meta property="og:site_name" content="River Society"></head><body>
      <div id="menu"><a href="/">Home</a> <a href="/join">Join</a></div>
      <div class="col"><p>Short note in a side column.</p></div>
      <div class="col">${[1, 2, 3, 4, 5, 6].map(n => `<p>${prose(n)}</p>`).join('')}</div></body></html>`
    const a = extractArticle(html, 'https://rivers.example.org/essay') as ExtractedArticle
    expect(a.title).toBe('Essay on rivers')
    expect(a.html).toContain('Paragraph 1 carries')
    expect(a.html).toContain('Paragraph 6 carries')
    expect(a.html).not.toContain('Short note')
    expect(a.html).not.toContain('Join')
  })

  it('decodes named and numeric entities', () => {
    expect(decodeEntities('caf&eacute; &amp; &#8220;quotes&#x201D; &mdash; &unknown;')).toBe('café & “quotes” — &unknown;')
  })
})
