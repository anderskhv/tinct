/**
 * The Shakespeare page (`/shakespeare`; mockup approved by Anders, 27 Nov 2026): the About page's layout with one
 * thing on show, Shakespeare in the original and in modern English. Beside the headline a short passage of Hamlet,
 * Act 3, Scene 1 in both editions (side by side on the desktop; on a phone one at a time, behind an Original / Modern
 * switch, as the phone reader has no Both view); under it every play whose Modern English edition is live, each
 * cover opening the play in the reader's free mode. No Questions section (Anders, 27 Nov 2026).
 *
 * Nothing on it is typed in by hand that the repository already holds: the plays and their count come from the
 * registry, and the passage is cut from the two edition files (its verse lines from the play's line file).
 *
 * Built by scripts/seo/build-shakespeare.mjs into public/shakespeare.html (generated in `prebuild`, not committed);
 * its look is the About page's stylesheet (public/lab/try/try.css) plus public/lab/shakespeare/shakespeare.css, and
 * its behaviour public/lab/shakespeare/shakespeare.js.
 */
import { BOOKS } from '../data/bookRegistry'
import { LIBRARY_BOOK_META } from '../data/libraryTaxonomy'
import type { Book } from '../types'
import { freeReaderHref, hasLiveModernEnglish } from './modernEnglishPage'

export const SHAKESPEARE_PATH = '/shakespeare'
/** The `ref` the page's reader links carry (the reader's free mode reads it; freeMode.ts FREE_MODE_HUBS). */
export const SHAKESPEARE_REF = 'shakespeare'

export interface ShakespearePlay {
  id: string
  title: string
  href: string
}

/**
 * The order of the covers: the ten the approved mockup shows, then the rest by how widely they are read. A play
 * not named here (one added to the registry later) follows them, in registry order.
 */
export const PLAY_ORDER: readonly string[] = [
  'hamlet', 'macbeth', 'romeo-and-juliet', 'othello', 'king-lear', 'midsummer', 'twelfth-night', 'the-tempest',
  'much-ado-about-nothing', 'julius-caesar',
  'merchant-of-venice', 'as-you-like-it', 'taming-of-the-shrew', 'richard-iii', 'henry-v', 'antony-and-cleopatra',
  'winters-tale', 'measure-for-measure', 'comedy-of-errors', 'coriolanus', 'merry-wives-of-windsor', 'henry-iv-part-2',
  'cymbeline',
]

/** A Shakespeare play: by him, and on one of the library's Shakespeare shelves (tragedy, comedy, history, romance). */
function isShakespearePlay(book: Book, shelvesOf: Map<string, readonly string[]>): boolean {
  return book.author === 'William Shakespeare' && (shelvesOf.get(book.id) ?? []).some(shelf => shelf.startsWith('shakespeare-'))
}

/** Every Shakespeare play in the registry whose Modern English edition is live, in the page's order. */
export function shakespearePlays(books: Book[] = BOOKS): ShakespearePlay[] {
  const shelvesOf = new Map<string, readonly string[]>(LIBRARY_BOOK_META.map(entry => [entry.id, entry.shelves]))
  const rank = (id: string) => { const at = PLAY_ORDER.indexOf(id); return at < 0 ? PLAY_ORDER.length : at }
  return books
    .filter(book => isShakespearePlay(book, shelvesOf) && hasLiveModernEnglish(book))
    .map((book, index) => ({ book, index }))
    .sort((a, b) => rank(a.book.id) - rank(b.book.id) || a.index - b.index)
    .map(({ book }) => ({ id: book.id, title: book.title, href: freeReaderHref(book.id, SHAKESPEARE_REF) }))
}

// ---- The passage: Hamlet, Act 3, Scene 1, cut from the edition files ----

export interface EditionFile {
  chapters: Array<{ number: number; title: string; paragraphs: string[] }>
}
/** `{bookId}-lines.json`: chapter number -> paragraph index -> the character offsets where a verse line begins. */
export interface VerseLineFile {
  edition: string
  chapters: Record<string, Record<string, number[]>>
}

/**
 * Where the passage is and where its rows begin. These are only places in the text: every word shown is sliced
 * from the edition files, so a change to an edition changes the page, and a place that can no longer be found
 * fails the build rather than showing something else.
 */
export const DEMO_PASSAGE = {
  bookId: 'hamlet',
  scene: 'Act 3, Scene 1',
  /** The speech, by how it begins in the original. The modern edition's is the same paragraph (aligned editions). */
  speech: 'HAMLET. To be, or not to be',
  original: { rows: ['HAMLET. To be', 'Whether', 'To die—to sleep', 'To die, to sleep.', 'For in that sleep'], last: 'Must give us pause.' },
  modern: { rows: ['HAMLET. To be', 'Is it nobler', 'To die — to sleep', 'To die, to sleep.', 'Because in that sleep'], last: 'must give us pause.' },
} as const

export interface ShakespeareDemoRow {
  /** The original, one entry per verse line (or part of one, where a sentence ends inside a line). */
  original: string[]
  modern: string
}

export interface ShakespeareDemo {
  bookId: string
  title: string
  /** "Act 3, Scene 1". */
  scene: string
  rows: ShakespeareDemoRow[]
}

/** The `[from, to)` character ranges of the rows that begin at each of `rows`, the last ending with `last`. */
function rowRanges(text: string, rows: readonly string[], last: string, what: string): Array<[number, number]> {
  const starts: number[] = []
  for (const row of rows) {
    const from = starts.length ? starts[starts.length - 1] + 1 : 0
    const at = text.indexOf(row, from)
    if (at < 0) throw new Error(`[shakespeare] ${what}: "${row}" is no longer in the passage`)
    starts.push(at)
  }
  const lastAt = text.indexOf(last, starts[starts.length - 1])
  if (lastAt < 0) throw new Error(`[shakespeare] ${what}: "${last}" is no longer in the passage`)
  const end = lastAt + last.length
  return starts.map((start, index) => [start, index + 1 < starts.length ? starts[index + 1] : end])
}

/** The passage shown beside the headline, row by row, from the two editions of the play. */
export function shakespeareDemo(original: EditionFile, modern: EditionFile, lines: VerseLineFile | null, book: Pick<Book, 'id' | 'title'>): ShakespeareDemo {
  const { scene, speech } = DEMO_PASSAGE
  const chapterAt = original.chapters.findIndex(chapter => chapter.title === scene || chapter.title.startsWith(`${scene} `))
  if (chapterAt < 0) throw new Error(`[shakespeare] ${book.id} has no "${scene}"`)
  const chapter = original.chapters[chapterAt]
  const paragraphAt = chapter.paragraphs.findIndex(paragraph => paragraph.startsWith(speech))
  if (paragraphAt < 0) throw new Error(`[shakespeare] "${speech}" is not in ${book.id}, ${scene}`)
  const originalText = chapter.paragraphs[paragraphAt]
  const modernChapter = modern.chapters[chapterAt]
  const modernText = modernChapter?.number === chapter.number ? modernChapter.paragraphs[paragraphAt] : undefined
  if (!modernText || !modernText.startsWith(DEMO_PASSAGE.modern.rows[0])) throw new Error(`[shakespeare] the modern edition of ${book.id} has no matching speech in ${scene}`)

  // A verse line begins at each offset; one that does not fall on a word boundary is not used.
  const offsets = (lines?.edition === 'original-en' ? lines.chapters[String(chapter.number)]?.[String(paragraphAt)] ?? [] : [])
    .filter(offset => offset > 0 && offset < originalText.length && originalText[offset - 1] === ' ' && originalText[offset] !== ' ')
  const originalRanges = rowRanges(originalText, DEMO_PASSAGE.original.rows, DEMO_PASSAGE.original.last, 'the original')
  const modernRanges = rowRanges(modernText, DEMO_PASSAGE.modern.rows, DEMO_PASSAGE.modern.last, 'the modern English')
  const rows = originalRanges.map(([from, to], index) => {
    const cuts = [from, ...offsets.filter(offset => offset > from && offset < to), to]
    const verse = cuts.slice(1).map((cut, at) => originalText.slice(cuts[at], cut).trim()).filter(Boolean)
    return { original: verse, modern: modernText.slice(modernRanges[index][0], modernRanges[index][1]).trim() }
  })
  return { bookId: book.id, title: book.title, scene, rows }
}

// ---- The page ----

const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export interface ShakespearePageAssets {
  /** Versioned addresses: the design tokens, the About page's stylesheet, then the page's own stylesheet and script. */
  tokens: string
  about: string
  css: string
  js: string
}

export interface ShakespearePageContent {
  plays: ShakespearePlay[]
  demo: ShakespeareDemo
}

export const SHAKESPEARE_COPY = {
  title: 'Shakespeare in the original and in modern English, free | Tinct',
  ogTitle: 'Shakespeare in the original and in modern English, free',
  description: (count: number) => `${count} Shakespeare plays, every line as he wrote it next to the same line in modern English. Free to read.`,
  h1: 'Shakespeare as he wrote it, and in plain English.',
  sub: 'Every line as he wrote it, next to the same line in plain English.',
  pick: 'Pick a play',
  plays: (count: number) => `All ${count} plays`,
  playsSub: 'Every one in the original and in modern English, free.',
  original: 'As written',
  modern: 'In modern English',
} as const

/** How many covers load with the page (the first row on a desktop); the rest load as they come near. */
const EAGER_COVERS = 9

export function renderShakespearePage(assets: ShakespearePageAssets, content: ShakespearePageContent): string {
  const { plays, demo } = content
  const copy = SHAKESPEARE_COPY
  const description = copy.description(plays.length)
  const canonical = `https://tinct.app${SHAKESPEARE_PATH}`
  const row = (entry: ShakespeareDemoRow) => '<div class="shk-row">'
    + `<p class="shk-original">${entry.original.map(line => `<span class="shk-line">${esc(line)}</span>`).join(' ')}</p>`
    + `<p class="shk-modern">${esc(entry.modern)}</p></div>`
  const cover = (play: ShakespearePlay, index: number) => `<li><a href="${esc(play.href)}">`
    + `<img src="/covers/v2/${play.id}.webp" alt="" width="300" height="450"${index < EAGER_COVERS ? '' : ' loading="lazy"'} decoding="async">`
    + `<span>${esc(play.title)}</span></a></li>`
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(copy.title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(copy.ogTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tinct">
<link rel="stylesheet" href="/fonts/tinct-fonts.css">
<link rel="stylesheet" href="${esc(assets.tokens)}">
<link rel="stylesheet" href="${esc(assets.about)}">
<link rel="stylesheet" href="${esc(assets.css)}">
<script type="module" src="/lab/internal-traffic.js"></script>
<script src="${esc(assets.js)}" defer></script>
</head>
<body class="try shk">
<div class="try-backdrop" aria-hidden="true"></div>
<!-- The Shakespeare page (src/seo/shakespearePage.ts; Anders, 27 Nov 2026): the About page's layout, listed at ${SHAKESPEARE_PATH}. Generated by scripts/seo/build-shakespeare.mjs. -->
<header class="try-nav">
  <a class="try-logo" href="/library" aria-label="Tinct library">Tinct.</a>
  <a class="shk-signin" href="/sign-in">Sign in</a>
</header>
<main>
<div class="shk-hero">
  <div class="shk-stage">
    <div class="shk-intro">
      <h1 class="shk-headline">${esc(copy.h1)}</h1>
      <p class="shk-sub">${esc(copy.sub)}</p>
    </div>
    <div class="shk-show">
      <!-- ${esc(demo.title)}, ${esc(demo.scene)}, from Tinct's Original and Modern English editions (shakespeareDemo). Desktop: both, side by side. Phone: one at a time. -->
      <section class="shk-reader" data-shk-reader data-view="original" aria-label="${esc(`${demo.title}, ${demo.scene}: ${copy.original.toLowerCase()} and ${copy.modern.toLowerCase()}`)}">
        <div class="shk-bar">
          <span class="shk-book">${esc(demo.title)}</span>
          <span class="shk-scene">· ${esc(demo.scene)} <span aria-hidden="true">∨</span></span>
          <span class="shk-switch" role="group" aria-label="Edition"><button type="button" data-shk-view="original" aria-pressed="true">Original</button><button type="button" data-shk-view="modern" aria-pressed="false">Modern</button></span>
        </div>
        <div class="shk-text">
          <div class="shk-heads"><span>${esc(copy.original)}</span><span>${esc(copy.modern)}</span></div>
          ${demo.rows.map(row).join('\n          ')}
        </div>
      </section>
    </div>
    <a class="shk-pick" href="#plays">${esc(copy.pick)} <span aria-hidden="true">↓</span></a>
  </div>
</div>

<section class="shk-plays" id="plays" aria-labelledby="plays-title">
  <h2 id="plays-title">${esc(copy.plays(plays.length))}</h2>
  <p>${esc(copy.playsSub)}</p>
  <ul class="shk-covers">
    ${plays.map(cover).join('\n    ')}
  </ul>
</section>
</main>

<footer class="try-footer">
  <span class="try-footer-mark">Tinct</span>
  <nav aria-label="Footer">
    <a href="/library">Library</a><a href="/about">About</a><a href="/credits">Credits</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:contact@tinct.app">Contact</a><a href="/copyright">Copyright</a>
  </nav>
</footer>
</body>
</html>
`
}
