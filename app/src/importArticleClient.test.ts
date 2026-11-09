// @vitest-environment jsdom
/**
 * A link pasted into Paste text imports the article (Anders, 9 Nov 2026): the paste field takes a link
 * or text; a link becomes the article through the same pasted-text pipeline (paste-text.js, own-add.js).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { epubToEdition } from './lab/userBook/epubEdition'
import { extractArticle, type ExtractedArticle } from './worker/lib/articleExtract'
// @ts-expect-error -- shared browser module
import { articleUrl, importedArticle, pasteEpub } from '../public/lab/library_2/paste-text.js'
// @ts-expect-error -- shared browser module
import { pasteBox } from '../public/lab/library_2/paste-box.js'
// @ts-expect-error -- shared browser module
import { draftFromLink, importArticle, pasteBook, pasteTooLong } from '../public/lab/library_2/own-add.js'

const data = (file: File) => new Promise<Uint8Array>((resolve, reject) => {
  const reader = new FileReader(); reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer)); reader.onerror = () => reject(reader.error); reader.readAsArrayBuffer(file)
})
const paste = (target: Element, plain: string, html = '') => {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & { clipboardData: { getData: (type: string) => string } }
  event.clipboardData = { getData: type => (type === 'text/html' ? html : type === 'text/plain' ? plain : '') }
  target.dispatchEvent(event)
  return event
}

describe('a pasted link or pasted text', () => {
  it('detects a single http(s) link and nothing else', () => {
    expect(articleUrl('https://www.example.org/2026/otters')).toBe('https://www.example.org/2026/otters')
    expect(articleUrl('  http://example.org/a?b=1#c \n')).toBe('http://example.org/a?b=1#c')
    for (const text of ['', 'www.example.org/otters', 'Read https://example.org/a today', 'https://example.org/a https://example.org/b', 'ftp://example.org/x', 'https://localhost/', 'javascript:alert(1)', 'https://user:pw@example.org/', 'The quiet return of the river otter'])
      expect(articleUrl(text)).toBe('')
  })

  it('the paste box keeps a pasted link as a link and says the article will be imported', () => {
    const box = pasteBox()
    document.body.append(box.wrap, box.meta)
    const event = paste(box.box, 'https://news.example.org/otters', '<a href="https://news.example.org/otters">https://news.example.org/otters</a>')
    expect(event.defaultPrevented).toBe(true)
    expect(box.read()).toMatchObject({ url: 'https://news.example.org/otters', title: '' })
    expect(box.meta.textContent).toBe('Link · Tinct imports the article from news.example.org')
    expect(box.box.dataset.placeholder).toBe('Paste your text or a link here')
  })

  it('pasted text behaves as before: cleaned, titled, no link', () => {
    const box = pasteBox()
    document.body.append(box.wrap, box.meta)
    const text = 'A short title\n\n' + 'This is the first paragraph of a pasted text, which mentions https://example.org/ but is not a link. '.repeat(3)
    paste(box.box, text)
    const read = box.read()
    expect(read.url).toBe('')
    expect(read.title).toBe('A short title')
    expect(read.text).toContain('which mentions https://example.org/')
    expect(box.meta.textContent).toMatch(/\d+ words$/)
  })

  it('an imported article becomes the same EPUB as pasted text, with its source named and linked', async () => {
    const page = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'worker/__fixtures__/articles/news.html'), 'utf8')
    const reply = { kind: 'html', url: 'https://news.example.org/otters', ...(extractArticle(page, 'https://news.example.org/otters') as ExtractedArticle) }
    const draft = importedArticle(reply)
    expect(draft).toMatchObject({ title: 'The quiet return of the river otter', author: 'Maren Holt', source: 'https://news.example.org/otters' })
    const file = pasteBook({ ...draft, uid: '' })
    const bytes = await data(file)
    const text = new TextDecoder('latin1').decode(bytes)
    expect(text).toContain('<dc:source>https://news.example.org/otters</dc:source>')
    expect(text).toContain('<dc:creator>Maren Holt</dc:creator>')
    const edition = await epubToEdition(bytes)
    expect(edition.title).toBe('The quiet return of the river otter')
    expect(edition.chapters).toHaveLength(1)
    const paragraphs = edition.chapters[0].paragraphs
    expect(paragraphs[0]).toBe('From The Northern Ledger')
    expect(paragraphs.some(p => p.startsWith('For most of the last century, the river'))).toBe(true)
    expect(paragraphs[paragraphs.length - 1]).toContain('would not believe it if they did.')
    expect(paragraphs.join('\n')).not.toMatch(/Advertisement|Comments|cookies|Share on/)
  })

  it('plain text from a link is read as a plain-text paste', () => {
    const draft = importedArticle({ kind: 'text', url: 'https://example.org/notes.txt', siteName: 'example.org', text: 'Notes on rivers\n\n' + 'A paragraph of notes about rivers and the animals in them. '.repeat(4) })
    expect(draft.title).toBe('Notes on rivers')
    expect(draft.html).toContain('<p>From <a href="https://example.org/notes.txt">example.org</a></p>')
    expect(draft.html).toContain('A paragraph of notes about rivers')
  })

  it('draftFromLink keeps a title the reader typed, otherwise the page’s own', async () => {
    const reply = { kind: 'html', url: 'https://example.org/a', title: 'Page title', author: 'A. Writer', siteName: 'Example', html: '<p>Body text.</p>' }
    const importer = vi.fn(async () => reply)
    expect(await draftFromLink({ url: 'https://example.org/a', title: '', uid: 'u' }, { importer })).toMatchObject({ title: 'Page title', author: 'A. Writer', source: 'https://example.org/a', uid: 'u' })
    expect((await draftFromLink({ url: 'https://example.org/a', title: 'My title', uid: '' }, { importer })).title).toBe('My title')
  })

  it('importArticle posts the link signed in and passes the honest refusal through', async () => {
    const ok = vi.fn(async () => new Response(JSON.stringify({ kind: 'html', url: 'https://example.org/a', title: 'T', html: '<p>x</p>' }), { status: 200 }))
    expect((await importArticle('https://example.org/a', { fetchImpl: ok, token: 'tok' })).title).toBe('T')
    const [path, init] = ok.mock.calls[0] as unknown as [string, RequestInit]
    expect(path).toBe('/api/import-article')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(JSON.parse(String(init.body))).toEqual({ url: 'https://example.org/a' })
    const refused = vi.fn(async () => new Response(JSON.stringify({ error: 'This page didn’t share its text. Paste the article text instead.', code: 'no_text' }), { status: 422 }))
    await expect(importArticle('https://example.org/a', { fetchImpl: refused, token: 'tok' })).rejects.toThrow('This page didn’t share its text. Paste the article text instead.')
    await expect(importArticle('https://example.org/a', { fetchImpl: ok, token: '' })).rejects.toMatchObject({ code: 'signed_out' })
    await expect(importArticle('https://example.org/a', { fetchImpl: async () => { throw new TypeError('offline') }, token: 'tok' })).rejects.toMatchObject({ code: 'offline' })
  })

  it('an article over the paste limit is refused with its own words', () => {
    expect(pasteTooLong('x'.repeat(250000), { imported: true })).toMatch(/^This article is too long to add/)
    expect(pasteTooLong('short', { imported: true })).toBe('')
    expect(pasteEpub).toBeTypeOf('function')
  })
})
