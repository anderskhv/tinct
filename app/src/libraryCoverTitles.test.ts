// @vitest-environment jsdom
// A home row's cover has its title and author written under it (Anders, 27 Nov 2026: on several covers neither can
// be read at shelf size). library_2/book-metadata.js renders the caption; app.js asks for it on the home rows only.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module of the library page
import { renderBookMetadata } from '../public/lab/library_2/book-metadata.js'

const lib = (file: string) => readFileSync(resolve(__dirname, '../public/lab/library_2', file), 'utf8')
const lines = (element: Element) => [...element.children].map(child => [child.className, child.textContent])
const caption = (book: Record<string, unknown>, options: Record<string, unknown>) => {
  const element = document.createElement('span')
  renderBookMetadata(element, book, options)
  return element
}
const KARAMAZOV = { id: 'brothers-karamazov', title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', displayYear: '1880', wordCount: 341700 }

describe('the caption under a cover', () => {
  it('on a home row: the title, the author, then the year and reading time, and no category label', () => {
    expect(lines(caption(KARAMAZOV, { compact: true, title: true }))).toEqual([
      ['metadata-title', 'The Brothers Karamazov'],
      ['metadata-author', 'Fyodor Dostoevsky'],
      ['metadata-details', '1880~33.5h'],
    ])
  })

  it('elsewhere it is unchanged: the category label, then the year and reading time', () => {
    expect(lines(caption(KARAMAZOV, { compact: true }))).toEqual([
      ['metadata-category', 'Fiction'],
      ['metadata-details', '1880~33.5h'],
    ])
  })

  it('writes no empty line for a book without an author, and none for a missing title', () => {
    expect(lines(caption({ ...KARAMAZOV, author: '  ' }, { compact: true, title: true })).map(([name]) => name)).toEqual(['metadata-title', 'metadata-details'])
    expect(lines(caption({ ...KARAMAZOV, title: undefined }, { compact: true, title: true })).map(([name]) => name)).toEqual(['metadata-author', 'metadata-details'])
  })

  it('takes a title as text, never as markup', () => {
    const element = caption({ ...KARAMAZOV, title: '<img src=x onerror=alert(1)>' }, { compact: true, title: true })
    expect(element.querySelector('img')).toBeNull()
    expect(element.querySelector('.metadata-title')?.textContent).toBe('<img src=x onerror=alert(1)>')
  })

  it('a second render replaces the first: one title, one author', () => {
    const element = caption(KARAMAZOV, { compact: true, title: true })
    renderBookMetadata(element, KARAMAZOV, { compact: true, title: true })
    expect(element.querySelectorAll('.metadata-title, .metadata-author')).toHaveLength(2)
  })
})

describe('where the library asks for it', () => {
  const app = lib('app.js')

  it('both kinds of home row (Featured, and a row per house or shelf) draw titled covers', () => {
    expect(app).toContain('indices.forEach(i=>row.append(titledCover(books[i])));')
    expect(app).toContain('bookIds.forEach(id=>row.append(titledCover(books.find(b=>b.id===id))));')
    expect(app).toMatch(/function titledCover\(book\)\{const wrap=coverButton\(book\);wrap\.classList\.add\('is-titled'\);[^}]*meta\.dataset\.titled='1';renderBookMetadata\(meta,book,\{compact:true,title:true\}\);return wrap;\}/)
  })

  it('a caption redrawn when the catalogue arrives keeps its title', () => {
    expect(app).toContain("renderBookMetadata(meta,book,{compact:true,title:meta.dataset.titled==='1'});")
  })

  it('the pages that already write the title beside the cover do not get it twice', () => {
    // My shelf and a collection write an h2 and the author; search writes its own lines.
    expect(app).toContain("card.append(coverButton(book),el('h2','',book.title),el('p','',book.author));")
    expect(app).toContain("const b=coverButton(book,'search-result');b.append(el('span','',book.title),el('small','',book.author));")
    expect(app.match(/titledCover\(/g)).toHaveLength(3)
  })
})

describe('how it is set', () => {
  const css = lib('styles.css')

  it('in EB Garamond, from the two files the app already serves, under a name of its own', () => {
    const faces = [...css.matchAll(/@font-face\{font-family:'Tinct Shelf Garamond';[^}]*src:url\((\/fonts\/[^)]+\.woff2)\)/g)].map(match => match[1])
    expect(faces).toHaveLength(2)
    for (const file of faces) expect(existsSync(resolve(__dirname, '../public', '.' + file)), file).toBe(true)
    expect(css).toMatch(/\.cover-metadata \.metadata-title \{ font:500 17px\/1\.2 'Tinct Shelf Garamond','EB Garamond',Georgia/)
    expect(css).toMatch(/\.cover-metadata \.metadata-author \{ font:15px\/1\.3 'Tinct Shelf Garamond','EB Garamond',Georgia/)
    // The library still does not load the app's whole font sheet.
    expect(lib('index.html')).not.toContain('tinct-fonts.css')
  })

  it('a long title wraps to three lines at most and a long author to two: neither is cut where it would fit', () => {
    expect(css).toMatch(/\.metadata-title \{[^}]*-webkit-line-clamp:3;[^}]*overflow:hidden/)
    expect(css).toMatch(/\.metadata-author \{[^}]*-webkit-line-clamp:2;[^}]*overflow:hidden/)
    expect(css).not.toMatch(/\.metadata-author \{[^}]*white-space:nowrap/)
  })

  it('the year and reading time sit at the foot of the card, level along a row', () => {
    expect(css).toContain('.book-row .card-wrap.is-titled { display:flex; flex-direction:column; }')
    expect(css).toMatch(/\.cover-metadata\[data-titled\] \{ flex:1;/)
    expect(css).toMatch(/\.cover-metadata\[data-titled\] \.metadata-details \{ margin-top:auto;/)
  })
})
