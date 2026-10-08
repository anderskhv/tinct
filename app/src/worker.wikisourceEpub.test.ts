import { describe, expect, it } from 'vitest'
import { MAX_WIKISOURCE_PAGES, cleanWikisourceHtml, stripLinks, subpageLinks, wikisourceEpub, wikisourcePages } from './worker/lib/wikisourceEpub'
import { epubSourceLetters, letters } from './worker/lib/epubSource'

const PROSE = 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness. '.repeat(30)
const api = (pages: Record<string, string>, seen: string[] = []) => (async (input: string) => {
  const page = new URL(input).searchParams.get('page')!
  seen.push(page)
  if (!(page in pages)) return Response.json({ error: { code: 'missingtitle' } })
  return Response.json({ parse: { title: page, text: `<div class="mw-parser-output">${pages[page]}</div>` } })
}) as unknown as typeof fetch
const link = (title: string) => `<a href="/wiki/${encodeURIComponent(title.replace(/ /g, '_')).replace(/%2F/g, '/')}">${title.split('/').pop()}</a>`

describe('Wikisource works from the wiki API (worker/lib/wikisourceEpub.ts)', () => {
  it('leaves out Wikisource\'s furniture, pictures and attributes, keeping the text and nesting', () => {
    const html = '<div class="ws-noexport"><style>.a{}</style></div><div class="wst-header ws-header"><div><a href="/wiki/X">Back</a></div></div><p class="x" style="y">One <i>two</i><span class="pagenum ws-pagenum">12</span> three &amp; four & five<sup class="reference"><a href="#n">[1]</a></sup></p><figure><img src="a.png"/><figcaption>Fig</figcaption></figure><table id="headertemplate"><tr><td>nav</td></tr></table><p>Six<br>seven</p>'
    const clean = stripLinks(cleanWikisourceHtml(html))
    expect(clean).toBe('<p>One <i>two</i> three &amp; four &amp; five</p><p>Six<br/>seven</p>')
  })

  it('lists subpages in the order the contents give them, once, and nothing outside the work', () => {
    const html = `${link('Book/Chapter 2')} ${link('Book/Chapter 1')} ${link('Book/Chapter 2')} ${link('Other/Chapter 1')} <a href="/wiki/Book/Chapter_3#x">3</a>`
    expect(subpageLinks(html, 'Book')).toEqual(['Book/Chapter 2', 'Book/Chapter 1', 'Book/Chapter 3'])
  })

  it('reads a volume page that only lists its chapters as those chapters; a single page work is the page itself', async () => {
    const signal = AbortSignal.timeout(5000)
    const pages = await wikisourcePages({ lang: 'en', page: 'Book' }, {
      signal, maxBytes: 10_000_000,
      fetchImpl: api({
        Book: `<ul><li>${link('Book/Volume 1')}</li><li>${link('Book/Epilogue')}</li></ul>`,
        'Book/Volume 1': `<ul><li>${link('Book/Volume 1/Chapter 1')}</li><li>${link('Book/Volume 1/Chapter 2')}</li></ul>`,
        'Book/Volume 1/Chapter 1': `<p>${PROSE}</p>`,
        'Book/Volume 1/Chapter 2': `<p>${PROSE}</p>`,
        'Book/Epilogue': `<p>${PROSE}</p>`,
      }),
    })
    expect(pages.map(page => page.title)).toEqual(['Book/Volume 1/Chapter 1', 'Book/Volume 1/Chapter 2', 'Book/Epilogue'])
    const single = await wikisourcePages({ lang: 'en', page: 'Poem' }, { signal, maxBytes: 10_000_000, fetchImpl: api({ Poem: `<p>${PROSE}</p>` }) })
    expect(single).toHaveLength(1)
    await expect(wikisourcePages({ lang: 'en', page: 'Missing' }, { signal, maxBytes: 10_000_000, fetchImpl: api({}) })).rejects.toMatchObject({ code: 'not_found' })
  })

  it('refuses a work of more pages than one import may read, before reading them', async () => {
    const seen: string[] = []
    const many = Array.from({ length: MAX_WIKISOURCE_PAGES }, (_, i) => link(`Big/Part ${i + 1}`)).join(' ')
    await expect(wikisourcePages({ lang: 'en', page: 'Big' }, { signal: AbortSignal.timeout(5000), maxBytes: 10_000_000, fetchImpl: api({ Big: many }, seen) })).rejects.toMatchObject({ code: 'source_too_large' })
    expect(seen).toEqual(['Big'])
  })

  it('makes an EPUB whose every word the Worker\'s source check can find', async () => {
    const epub = await wikisourceEpub({ title: 'Book & Co', author: 'A. Writer', lang: 'en', sourceUrl: 'https://en.wikisource.org/wiki/Book' }, [{ title: 'Book/One', label: 'Chapter One', html: `<p>${PROSE}</p>` }])
    expect(new TextDecoder().decode(epub.subarray(30, 38))).toBe('mimetype')
    const source = await epubSourceLetters(epub)
    expect(source).toContain(letters('Chapter One'))
    expect(source).toContain(letters(PROSE.slice(0, 200)))
  })
})
