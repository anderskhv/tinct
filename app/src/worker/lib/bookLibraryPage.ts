// Book links in the library. `/read/<id>` and `/library?book=<id>` both show
// that book in the library's hero from the first paint. The library page stays
// one static file; these functions fill its hero, and for `/read/<id>` also
// carry the generated book page's search metadata and crawlable text
// (app/scripts/generate-sitemap.cjs, `buildBookIndexPage`).
//
// Kept free of imports so the browser acceptance script can run the exact
// composition against a local build (scripts/check-library-public.mjs).

export interface LibraryBookHero {
  id: string
  title: string
  author: string
  question: string
  cover: string | null
}

export interface GeneratedBookPage {
  hero: LibraryBookHero
  /** Title, description, canonical, Open Graph/Twitter tags and JSON-LD. */
  seoHead: string
  /** The book's crawlable text: hook, chapter links and opening. */
  about: string
}

const escape = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const between = (html: string, name: string): string | null => {
  const open = `<!--tinct:${name}-->`, close = `<!--/tinct:${name}-->`
  const start = html.indexOf(open), end = html.indexOf(close)
  return start >= 0 && end > start ? html.slice(start + open.length, end).trim() : null
}

/** The parts of a generated `/read/<id>/book.html` the library page reuses, or null. */
export function readGeneratedBookPage(html: string, bookId: string): GeneratedBookPage | null {
  const json = html.match(/<script type="application\/json" id="tinct-book-hero">([\s\S]*?)<\/script>/)?.[1]
  const seoHead = between(html, 'seo'), about = between(html, 'about')
  if (!json || !seoHead || !about) return null
  try {
    const data = JSON.parse(json) as Partial<LibraryBookHero>
    if (data.id !== bookId || typeof data.title !== 'string' || typeof data.author !== 'string') return null
    return {
      hero: {
        id: data.id,
        title: data.title,
        author: data.author,
        question: typeof data.question === 'string' ? data.question : '',
        cover: typeof data.cover === 'string' && /^\/covers\/[a-z0-9/._-]+$/i.test(data.cover) ? data.cover : null,
      },
      seoHead,
      about,
    }
  } catch {
    return null
  }
}

/**
 * The library page with `hero`'s book in the hero instead of the default
 * featured book. `data-linked-book` tells the page the hero is already filled;
 * its genre and reading time arrive with the catalogue.
 */
export function prefillLibraryHero(html: string, hero: LibraryBookHero): string {
  const title = escape(hero.title)
  return html
    .replace(/<html\b([^>]*)>/i, (_tag, attributes: string) => `<html${attributes.replace(/\sdata-linked-book="[^"]*"/, '')} data-linked-book="${escape(hero.id)}">`)
    .replace(/(<p class="author" id="hero-author">)[^<]*(<\/p>)/, `$1${escape(hero.author)}’s$2`)
    .replace(/(<h1 id="hero-title">)[^<]*(<\/h1>)/, `$1${title}$2`)
    .replace(/(<p class="question">)[^<]*(<\/p>)/, `$1${escape(hero.question)}$2`)
    .replace(/(<span id="hero-genre">)[^<]*(<\/span>)/, '$1$2')
    .replace(/(<span id="hero-time">)[^<]*(<\/span>)/, '$1$2')
    .replace(/(<button id="hero-book"[^>]*aria-label=")[^"]*(")/, `$1Open ${title}$2`)
    .replace(/<img id="hero-cover-preview"([^>]*)>/, (_tag, attributes: string) => `<img id="hero-cover-preview"${attributes.replace(/\ssrc="[^"]*"/, '')}${hero.cover ? ` src="${escape(hero.cover)}"` : ''}>`)
    .replace(/(<canvas class="cover" data-book=")[^"]*(")/, `$1${escape(hero.id)}$2`)
}

/**
 * The public book page: the library experience with this book in the hero,
 * the generated page's search metadata in the head, and the book's text in an
 * about section after the shelves.
 */
export function composeBookLibraryPage(libraryHtml: string, book: GeneratedBookPage): string {
  const head = libraryHtml
    .replace(/<meta\s+name="robots"[^>]*>/i, '')
    .replace(/<title>[^<]*<\/title>/i, '')
    .replace('</head>', `${book.seoHead}</head>`)
  // The library already has its <main>; the generated page's own becomes a block.
  const text = book.about.replace(/^<main>/, '<div class="book-about-text">').replace(/<\/main>$/, '</div>')
  const about = `<section id="book-about" class="book-about" aria-label="${escape(book.hero.title)}">${text}</section>`
  return prefillLibraryHero(head, book.hero).replace('<div id="shelves"></div>', `<div id="shelves"></div>${about}`)
}
