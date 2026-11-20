import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BOOKS } from '../data/bookRegistry'
import availability from '../data/editionAvailability.json'
import manifest from '../data/chapterPages.generated.json'
import notes from '../data/editionNotes.generated.json'
import { SEO_INDEX_ALLOWLIST } from '../data/seoIndexAllowlist'
import { editionNoteText, editionSource } from '../data/editionSources'
import {
  chapterLabels, chapterOwnLabel, chapterPagePlans, chapterPageTitle, renderChapterPages, renderShelfHubs,
} from './chapterPages'
import { paragraphPlainText } from './scenePages'
import { curlyQuotes } from './bookStructure'
import { JSDOM } from 'jsdom'

const edition = (id: string, key: string) => JSON.parse(readFileSync(`public/data/editions/${id}-${key}.json`, 'utf8'))
const book = (id: string) => BOOKS.find(entry => entry.id === id)!
const plans = chapterPagePlans({
  available: (id, key) => !(availability.editions as Record<string, unknown>)[`${id}/${key}`] && existsSync(`public/data/editions/${id}-${key}.json`),
  wholeHolds: availability.wholeBooks,
  publisherPermissions: JSON.parse(readFileSync('src/data/publisherPermissions.json', 'utf8')).books,
  machineMade: new Set(['fear-and-trembling/original-en']),
})
const planOf = (id: string) => plans.find(plan => plan.book.id === id)

describe('which books get chapter pages', () => {
  it('every book with an unheld Modern English edition, except the Shakespeare plays, held and in-copyright books', () => {
    expect(planOf('moby-dick')).toBeTruthy()
    expect(planOf('odyssey')).toBeTruthy()
    for (const id of ['hamlet', 'king-lear', 'the-tempest']) expect(planOf(id), id).toBeUndefined()
    for (const id of availability.wholeBooks) expect(planOf(id), id).toBeUndefined()
    expect(planOf('bible')).toBeUndefined()
    expect(planOf('the-sovereign-child')).toBeUndefined()
    for (const plan of plans) expect(plan.book.author, plan.book.id).not.toBe('William Shakespeare')
    // The committed manifest is what the build wrote from the same plan.
    expect(Object.keys(manifest.books).sort()).toEqual(plans.map(plan => plan.book.id).sort())
  })

  it('indexes only the allowlist, and only a book whose source the registry names', () => {
    // Wave 2 (Anders, 19 Nov 2026): the Odyssey, the Oresteia, the Histories and Beowulf.
    expect(SEO_INDEX_ALLOWLIST).toHaveLength(19)
    const indexable = plans.filter(plan => plan.indexable).map(plan => plan.book.id).sort()
    expect(indexable).toEqual(SEO_INDEX_ALLOWLIST.filter(id => id !== 'ivan-ilyich').slice().sort())
    // The Maudes' Ivan Ilyich has no year in the registry: its source is unknown, so it cannot be indexed.
    expect(editionSource(book('ivan-ilyich'))).toBeNull()
    expect(planOf('ivan-ilyich')!.indexable).toBe(false)
    for (const plan of plans) expect((manifest.books as Record<string, { indexable: boolean }>)[plan.book.id].indexable, plan.book.id).toBe(plan.indexable)
  })

  it('sets the original beside the Modern English: original-en, else the book\'s own-language original', () => {
    expect(planOf('moby-dick')!.originalKey).toBe('original-en')
    expect(planOf('master-and-margarita')!.originalKey).toBe('original-ru')
    // Fear and Trembling's "original-en" is machine-made: never shown as an original.
    expect(planOf('fear-and-trembling')!.originalKey).toBe('original-da')
  })
})

describe('the edition note', () => {
  it('uses Anders\'s exact wording, filled from the registry', () => {
    expect(editionNoteText(editionSource(book('crime-and-punishment'))!)).toBe("Tinct's modern English is drafted with AI from Constance Garnett's public-domain translation (1914), then checked by a separate AI review against that translation. The original is one tap away, and if you spot a mistake, tell us.")
    expect(editionNoteText(editionSource(book('moby-dick'))!)).toBe("Tinct's modern English is drafted with AI from Herman Melville's original text, then checked by a separate AI review against it. The original is one tap away, and if you spot a mistake, tell us.")
    expect((notes.books as Record<string, string>)['moby-dick']).toBe("<strong>How this edition was made.</strong> Tinct's modern English is drafted with AI from Herman Melville's original text, then checked by a separate AI review against it. The original is one tap away, and if you spot a mistake, tell us.")
    // Every note is one of the two sentences with only the registry's values filled in.
    const translated = /^<strong>How this edition was made\.<\/strong> Tinct's modern English is drafted with AI from (.+)'s public-domain translation \((\d{3,4})\), then checked by a separate AI review against that translation\. The original is one tap away, and if you spot a mistake, tell us\.$/
    const english = /^<strong>How this edition was made\.<\/strong> Tinct's modern English is drafted with AI from (.+)'s original text, then checked by a separate AI review against it\. The original is one tap away, and if you spot a mistake, tell us\.$/
    for (const [id, note] of Object.entries(notes.books as Record<string, string>)) {
      const source = editionSource(book(id))!
      // Tinct's own translations carry their own approved note (Anders, 20 Nov 2026), tested below.
      if (source.kind === 'tinct-translation') continue
      const match = note.match(source.kind === 'translation' ? translated : english)
      expect(match, id).toBeTruthy()
      expect(match![1].replace(/&amp;/g, '&'), id).toBe(source.kind === 'translation' ? source.translator : source.author)
    }
  })

  // Anders, 20 Nov 2026: Tinct's own translation of The Master and Margarita gets its own note; it stays unindexed.
  it('notes Tinct\'s own translation of The Master and Margarita, and keeps it out of the index', () => {
    expect(editionNoteText(editionSource(book('master-and-margarita'))!)).toBe("Tinct's modern English is translated with AI directly from Bulgakov's Russian text (L. M. Yanovskaya's edition, 1990). The original is one tap away, and if you spot a mistake, tell us.")
    expect(planOf('master-and-margarita')!.indexable).toBe(false)
    expect(SEO_INDEX_ALLOWLIST).not.toContain('master-and-margarita')
  })

  it('has no note for a book whose source is unknown', () => {
    for (const id of ['ivan-ilyich', 'imitation-of-christ', 'fear-and-trembling', 'pinocchio', 'grimms-fairy-tales', 'arabian-nights']) {
      expect(editionSource(book(id)), id).toBeNull()
      expect((notes.books as Record<string, string>)[id], id).toBeUndefined()
    }
  })
})

describe('chapter titles', () => {
  it.each([
    ['Chapter 1 — Loomings', 'Chapter 1'],
    ['Book One (1805) — Chapter 1', 'Book One (1805), Chapter 1'],
    ['Part 1, Chapter 1', 'Part 1, Chapter 1'],
    ['Epilogue, Chapter 2', 'Epilogue, Chapter 2'],
    ['Book I: Miss Brooke — Chapter I', 'Book I: Miss Brooke, Chapter I'],
    ['Book 1 — The gods in council—Athena’s visit to Ithaca', 'Book 1'],
    ["Epilogue — The Drama's Done", 'Epilogue'],
    ['Letter 1', 'Letter 1'],
    ['Chapter XXXIV', 'Chapter XXXIV'],
    ['Chapter 1. Of Sense', 'Chapter 1'],
    ['Inferno, Canto 1', 'Inferno, Canto 1'],
    ['Sara', null],
    ['I. Fyodor Pavlovitch Karamazov', null],
    ['1. Never talk to strangers', null],
  ])('%s → %s', (title, label) => expect(chapterOwnLabel(title)).toBe(label))

  it('uses the book\'s own labels only when every chapter has a distinct one, else Chapter N', () => {
    expect(chapterLabels(edition('moby-dick', 'modern-en').chapters).get(136)).toBe('Epilogue')
    // Anna Karenina numbers its chapters within each part: "Chapter 19" twice.
    expect(chapterLabels(edition('anna-karenina', 'modern-en').chapters).get(239)).toBe('Chapter 239')
    expect(chapterPageTitle({ id: 'war-and-peace', title: 'War and Peace', author: 'Leo Tolstoy' }, 'Book One (1805), Chapter 1')).toBe('War and Peace, Book One (1805), Chapter 1: full text in modern English | Tinct')
    expect(chapterPageTitle({ id: 'jane-eyre', title: 'Jane Eyre', author: 'Charlotte Brontë' }, 'Chapter 26', 38)).toBe('Jane Eyre, Chapter 26 of 38: full text in modern English | Tinct')
  })
})

describe('a chapter page', () => {
  const moby = renderChapterPages({ book: book('moby-dick'), modern: edition('moby-dick', 'modern-en'), original: edition('moby-dick', 'original-en'), originalKey: 'original-en', note: (notes.books as Record<string, string>)['moby-dick'], indexable: true })
  const artOfWar = renderChapterPages({ book: book('the-art-of-war'), modern: edition('the-art-of-war', 'modern-en'), original: edition('the-art-of-war', 'original-en'), originalKey: 'original-en', note: null, indexable: false })

  // Since 19 Nov 2026 (docs/seo-brief-2026-11-19.md): "of N" titles, the first chapter's canonical is the book page,
  // curly quotes in the Modern English, Modern English alone by default with the original in the HTML behind a switch.
  it('is the whole chapter in both versions as HTML, indexable, the first chapter pointing at the book page', () => {
    const page = moby[0].html
    expect(moby).toHaveLength(136)
    expect(page).toContain('<title>Moby Dick, Chapter 1 of 135: full text in modern English | Tinct</title>')
    expect(page).toContain('<link rel="canonical" href="https://tinct.app/read/moby-dick">')
    expect(moby[1].html).toContain('<link rel="canonical" href="https://tinct.app/read/moby-dick/chapter-2">')
    expect(page).toContain('data-view="modern"')
    expect(page).not.toMatch(/name="robots"/)
    const modern = edition('moby-dick', 'modern-en').chapters[0].paragraphs as string[]
    const original = edition('moby-dick', 'original-en').chapters[0].paragraphs as string[]
    const text = page.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    for (const paragraph of [...modern.map(curlyQuotes), ...original]) expect(text).toContain(paragraphPlainText(paragraph).slice(0, 80))
    expect(page).toContain('<p class="chapter-col-head">Modern English</p>')
    expect(page).toContain('<p class="chapter-col-head" lang="en">Original (1851)</p>')
    expect(page).toContain("How this edition was made.</strong> Tinct's modern English is drafted with AI from Herman Melville's original text")
  })

  it('numbers only the Modern English paragraphs, as the reader counts them (selections hand over in its words)', () => {
    const page = moby[2].html
    const modern = edition('moby-dick', 'modern-en').chapters[2].paragraphs as string[]
    expect(page.match(/ data-p="/g)).toHaveLength(modern.length)
    expect(page).toContain(`id="lab-p-${modern.length - 1}" class="lab-hearing-line" data-p="${modern.length - 1}"`)
    expect(page).toMatch(/id="orig-p-0" class="lab-hearing-line">/)
  })

  it('navigates previous, next and contents, and hands over to the reader with Primer, Recap and the ask field', () => {
    const page = moby[1].html
    expect(page).toContain('<a href="/read/moby-dick" rel="prev" data-scene-keep>← Chapter 1</a>')
    expect(page).toContain('<a class="chapter-continue-link" href="/read/moby-dick/chapter-3" rel="next" data-scene-keep>Continue reading: Chapter 3 of 135 <span aria-hidden="true">→</span></a>')
    expect(page).toContain('<p class="chapter-saved" data-place-note hidden>Your place is saved on this device. No account needed.</p>')
    expect(page.indexOf('class="chapter-continue"')).toBeLessThan(page.indexOf('class="lab-chapter-end"'))
    expect(page).toContain('<a href="/read/moby-dick/chapter-3" rel="next" data-scene-keep>Chapter 3 →</a>')
    expect(page).toContain('<a class="scene-contents" href="/read/moby-dick#chapters" data-scene-keep>Contents</a>')
    expect(page).toContain('href="/reader?book=moby-dick&amp;chapter=2&amp;edition=modern-en#scene=primer" data-scene-action="primer"')
    expect(page).toContain('Primer for Chapter 2')
    expect(page).toContain('Highlight any passage to have it explained, simplified, or to ask about it.')
    expect(page).toContain('data-scene-ask')
    expect(page).toContain('<script type="module" src="__TINCT_SCENE_ASSET_scene-page.js__"></script>')
  })

  it('is noindex, follow for a book not on the allowlist, and has no note when the source is unknown', () => {
    expect(artOfWar[1].html).toContain('<meta name="robots" content="noindex, follow">')
    expect(artOfWar[1].html).toContain('<link rel="canonical" href="https://tinct.app/read/the-art-of-war/chapter-2">')
    expect(artOfWar[1].html).not.toContain('How this edition was made.')
  })
})

describe('shelf hubs', () => {
  const hubs = renderShelfHubs({
    books: [
      { id: 'crime-and-punishment', title: 'Crime and Punishment', modern: true, cover: '/covers/v2/crime-and-punishment.webp' },
      { id: 'master-and-margarita', title: 'The Master and Margarita', modern: true, cover: null },
      { id: 'the-sovereign-child', title: 'The Sovereign Child', modern: false, cover: null },
      { id: 'meditations', title: 'Meditations', modern: true, cover: null },
    ],
    indexableBooks: new Set(['crime-and-punishment']),
  })
  const hub = (id: string) => hubs.find(entry => entry.shelfId === id)!

  it('are a one-line heading and the shelf\'s books (title, cover, link), nothing written', () => {
    const russians = hub('russian-novels')
    expect(russians.heading).toBe('The Russians in modern English')
    expect(russians.bookIds).toEqual(['crime-and-punishment', 'master-and-margarita'])
    const body = russians.html.slice(russians.html.indexOf('<body>'))
    // Every shelf hub links /modern-english (docs/seo-brief-2026-11-19.md §6).
    expect(body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).toBe('tinct Every classic in modern English Library The Russians in modern English Crime and Punishment The Master and Margarita')
    expect(body).toContain('<a href="/read/crime-and-punishment"><img src="/covers/v2/crime-and-punishment.webp"')
    expect(russians.html).not.toContain('name="description"')
  })

  it('are indexable only when they list an allowlisted book', () => {
    expect(hub('russian-novels').indexable).toBe(true)
    expect(hub('russian-novels').html).not.toMatch(/name="robots"/)
    expect(hub('stoics').indexable).toBe(false)
    expect(hub('stoics').html).toContain('<meta name="robots" content="noindex, follow">')
    // "in modern English" only when every book listed has it.
    expect(hub('critical-rationalism').heading).toBe('Critical Rationalism')
  })
})

describe('the book page', () => {
  const pages = renderChapterPages({ book: book('jane-eyre'), modern: edition('jane-eyre', 'modern-en'), original: edition('jane-eyre', 'original-en'), originalKey: 'original-en', note: (notes.books as Record<string, string>)['jane-eyre'], indexable: true, bookPage: true })
  const doc = new JSDOM(pages[0].html).window.document

  it('is the first chapter under the book\'s header, with the plain chapter list below (docs/seo-brief-2026-11-19.md §1, §3, §4)', () => {
    expect(pages[0].chapterNumber).toBe(0)
    expect(pages).toHaveLength(39)
    expect(doc.title).toBe('Read Jane Eyre online free, in modern English | Tinct')
    expect(doc.querySelector('meta[name="description"]')!.getAttribute('content')).toBe("Jane Eyre has 38 chapters. Read the full text free online in modern English beside Charlotte Brontë's original. No sign-up, no ads.")
    expect(doc.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://tinct.app/read/jane-eyre')
    expect(doc.querySelector('h1')!.textContent).toBe('Jane Eyre')
    expect(doc.querySelector('.book-head-author')!.textContent).toBe('Charlotte Brontë')
    expect(doc.querySelector('#book-structure')!.textContent).toBe('38 chapters')
    expect(doc.querySelector('h2.lab-passage-headline')!.textContent).toBe('Chapter 1 of 38')
    expect(doc.querySelectorAll('.chapter-col-modern p[data-p]').length).toBe(edition('jane-eyre', 'modern-en').chapters[0].paragraphs.length)
    expect(doc.querySelectorAll('.chapter-col-original p[id^="orig-p-"]').length).toBe(edition('jane-eyre', 'original-en').chapters[0].paragraphs.length)
    const list = [...doc.querySelectorAll('#chapters ol > li > a')]
    expect(list).toHaveLength(38)
    expect(list[0].getAttribute('href')).toBe('/read/jane-eyre')
    expect(list[25].getAttribute('href')).toBe('/read/jane-eyre/chapter-26')
  })

  it('puts no prompt before the text and offers the switch on desktop and phone', () => {
    expect([...doc.querySelectorAll('.chapter-view-switch.is-desk button')].map(b => `${b.textContent}:${b.getAttribute('aria-pressed')}`)).toEqual(['Original:false', 'Modern:true', 'Both:false'])
    expect([...doc.querySelectorAll('.chapter-view-switch.is-phone button')].map(b => b.textContent)).toEqual(['Modern English', 'Original'])
    expect(doc.querySelector('.lab-header-controls')!.firstElementChild!.classList.contains('chapter-view-switch')).toBe(true)
    expect(pages[0].html).not.toMatch(/reading angle|sign up|onboarding/i)
  })

  it('counts chapter 26 of 38', () => {
    const page = new JSDOM(pages[26].html).window.document
    expect(page.title).toBe('Jane Eyre, Chapter 26 of 38: full text in modern English | Tinct')
    expect(page.querySelector('h1')!.textContent).toBe('Chapter 26 of 38')
    expect(page.querySelector('.lab-header-chapter-label')!.textContent).toBe('Chapter 26 of 38')
    expect(page.querySelector('meta[name="description"]')!.getAttribute('content')).toBe('Read Chapter 26 of Jane Eyre free, in modern English beside the original. No sign-up.')
  })
})
