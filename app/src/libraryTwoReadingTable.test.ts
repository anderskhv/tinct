// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module of the library page
import { keepShownOrder, firstPaintRecord, FIRST_PAINT_KEY } from '../public/lab/library_2/reading-table-first-paint.js'

const row = (bookId: string, extra: Record<string, unknown> = {}) => ({ bookId, title: bookId, author: '', cover: `/lab/library_2/assets/${bookId}.jpg`, tone: null, chapterLabel: 'Chapter 1', headline: '', percent: 10, recap: null, ...extra })

describe('reading table: the account read reconciles quietly (2026-10-10)', () => {
  it('keeps the shown order when the fresh table holds the same books in another order, carrying the fresh facts', () => {
    const shown = { mode: 'returning', reading: [row('frankenstein'), row('pride-and-prejudice')], finished: [] }
    const fresh = { mode: 'returning', reading: [row('pride-and-prejudice', { percent: 2.3 }), row('frankenstein', { percent: 4.7, recap: 'Victor returns to Geneva.' })], finished: [], shelfReading: [] as unknown[] }
    fresh.shelfReading = fresh.reading
    const result = keepShownOrder(shown, fresh)
    expect(result.reading.map((b: { bookId: string }) => b.bookId)).toEqual(['frankenstein', 'pride-and-prejudice'])
    expect(result.reading[0].recap).toBe('Victor returns to Geneva.')
    expect(result.reading[1].percent).toBe(2.3)
    expect(result.shelfReading).toBe(result.reading)
    expect(result).not.toBe(fresh)
  })
  it('returns the fresh table as it is when the books differ or the order already agrees', () => {
    const shown = { mode: 'returning', reading: [row('frankenstein')], finished: [] }
    const added = { mode: 'returning', reading: [row('pride-and-prejudice'), row('frankenstein')], finished: [] }
    expect(keepShownOrder(shown, added)).toBe(added)
    const same = { mode: 'returning', reading: [row('frankenstein')], finished: [] }
    expect(keepShownOrder(shown, same)).toBe(same)
    expect(keepShownOrder(null, same)).toBe(same)
  })
})

describe('reading table: the record boot.js preloads the shown book from', () => {
  const cover = (book: { cover: string }) => book.cover
  function view(current: number, spine: string | null) {
    const el = document.createElement('div')
    el.innerHTML = [0, 1].map(i => `<button class="rt-b${i === current ? ' is-current' : ''}" data-i="${i}"><span class="rt-spine"${spine && i === current ? ` data-binding="${spine}"` : ''}></span></button>`).join('')
    return el
  }
  it('names the account, the shown book, its cover and spine texture, and nothing about the reading', () => {
    const table = { reading: [row('frankenstein', { percent: 42, recap: 'secret' }), row('meditations')] }
    expect(firstPaintRecord(table, view(0, 'green'), 'reader-a', cover)).toEqual({ v: 1, owner: 'reader-a', bookId: 'frankenstein', cover: '/lab/library_2/assets/frankenstein.jpg', spine: 'green' })
    expect(firstPaintRecord(table, view(1, 'navy'), 'reader-a', cover)).toEqual({ v: 1, owner: 'reader-a', bookId: 'meditations', cover: '/lab/library_2/assets/meditations.jpg', spine: 'navy' })
    expect(FIRST_PAINT_KEY).toBe('tinct:library-2-first-paint')
  })
  it('a paper spine is not a texture; an unknown binding leaves the spine out', () => {
    const table = { reading: [row('frankenstein')] }
    expect(firstPaintRecord(table, view(0, 'paper'), 'reader-a')?.spine).toBeNull()
    expect(firstPaintRecord(table, view(0, null), 'reader-a')?.spine).toBeNull()
  })
  it('writes nothing for a signed-out device or a reader\'s own book, whose cover stays on this device', () => {
    expect(firstPaintRecord({ reading: [row('frankenstein')] }, view(0, 'green'), null)).toBeNull()
    const own = { reading: [row('userbook-abc', { own: true, cover: 'data:image/jpeg;base64,AAAA' })] }
    expect(firstPaintRecord(own, view(0, 'green'), 'reader-a')).toBeNull()
  })
})

// ---- The first paint's desk (2026-10-10): boot.js draws the remembered table before any module runs ----
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { resolve } from 'node:path'
// @ts-expect-error -- plain browser module of the library page
import { markup, deskCover } from '../public/lab/library_2/reading-table-markup.js'
// @ts-expect-error -- plain browser module of the library page
import { deskRecord } from '../public/lab/library_2/reading-table-first-paint.js'
// @ts-expect-error -- plain browser module of the library page
import { fitHeroTitle } from '../public/lab/library_2/hero-title.js'
// @ts-expect-error -- plain browser module of the library page
import { renderBookMetadata } from '../public/lab/library_2/book-metadata.js'

/** boot.js in a bare context: its desk helpers (window.__library2Boot.deskPlaceholder) and nothing else. */
function bootDesk() {
  const source = readFileSync(resolve(process.cwd(), 'public/lab/library_2/boot.js'), 'utf8')
  const window: Record<string, any> = {}
  runInNewContext(source, { window, location: { pathname: '/library', search: '' }, localStorage: { length: 0, key: () => null, getItem: () => null, setItem() {} }, sessionStorage: { getItem: () => null, setItem() {} },
    document: { cookie: '', documentElement: { style: { setProperty() {} }, classList: { add() {} }, dataset: {} }, head: { append() {} }, createElement: () => ({}) }, URLSearchParams, Date, innerWidth: 393, innerHeight: 734, fetch: () => Promise.resolve({ ok: true, json: async () => ({}) }), matchMedia: () => ({ matches: false }), navigator: { userAgent: '' } })
  return window.__library2Boot.deskPlaceholder as { model: (record: unknown, owner: string, storage: Storage, session: Storage, now: number) => any; markup: (model: unknown) => string }
}
const storageOf = (entries: Record<string, unknown>) => ({ getItem: (key: string) => (key in entries ? JSON.stringify(entries[key]) : null) }) as unknown as Storage

/** A node tree as `tag.class[data-…]` lines (ids, text and the chosen/away state left out), so two renderings compare. */
function skeleton(root: Element): string[] {
  const lines: string[] = []
  const walk = (el: Element, depth: number) => {
    if (el.tagName === 'DIALOG') return
    const data = [...el.attributes].filter(a => a.name.startsWith('data-') && a.name !== 'data-fit').map(a => `${a.name}=${a.value}`).sort().join(',')
    const classes = [...el.classList].filter(c => !['is-current', 'is-away', 'active'].includes(c)).sort().join('.')
    lines.push(`${' '.repeat(depth)}${el.tagName.toLowerCase()}${classes ? '.' + classes : ''}${data ? `[${data}]` : ''}`)
    // The metadata line's spans are catalogue facts the table fills (and fades in); the placeholder keeps the line's height only.
    if (el.classList.contains('rt-book-metadata')) return
    for (const child of el.children) walk(child, depth + 1)
  }
  for (const child of root.children) walk(child, 0)
  return lines
}

describe('reading table: the first paint\'s placeholder is the table\'s own structure (2026-10-10)', () => {
  const rows = [
    row('frankenstein', { title: 'Frankenstein', wordCount: 75000, percent: 42, recap: 'Victor returns to Geneva.', chapterLabel: 'Letter 4', headline: 'You’re at the start of Letter 4' }),
    row('pd-en-leaves-of-grass', { title: 'Leaves of Grass: the 1855 edition', cover: null, wordCount: 120000, percent: 3, recap: null, headline: 'You’re at the start of Book 1' }),
    row('meditations', { title: 'Meditations', wordCount: 45000, percent: null, recap: null, headline: '' }),
  ]
  const table = { mode: 'returning', reading: rows, finished: [] }
  // The desk's cover rule (the painting's 480 px copy), as the table records it.
  const coverOf = deskCover
  /** The real table's markup with what its drawing adds (a sampled binding, the covers' shapes). */
  function drawn() {
    const view = document.createElement('div')
    view.className = 'reading-table is-ready'
    view.innerHTML = markup(table)
    const hero = document.createElement('section')
    hero.append(view)
    Object.defineProperty(hero, 'clientWidth', { value: 393 }); Object.defineProperty(hero, 'clientHeight', { value: 702 })
    view.querySelectorAll<HTMLElement>('.rt-b').forEach((box, i) => {
      box.style.setProperty('--bw', i === 1 ? '128.2px' : '160.0px'); box.style.setProperty('--bh', '240.0px')
      if (i === 0) {
        // The table sampled a navy binding for the first cover after decoding it.
        box.style.setProperty('--binding', '#253c5c')
        const spine = box.querySelector<HTMLElement>('.rt-spine')!; spine.dataset.binding = 'navy'
        spine.style.background = `linear-gradient(90deg,#0009,#0000 16%,#ffffff14 44%,#0000 64%,#0009),url('assets/spines/spine-navy.jpg') 50% 50%/100% 100%,#253c5c`
        box.querySelector<HTMLElement>('.rt-refl-spine')!.style.background = `url('assets/spines/spine-navy.jpg') 50% 50%/100% 100%,#253c5c`
        box.classList.add('is-current')
      }
    })
    // What show() adds for the shown book: its fitted title, metadata and recap state.
    fitHeroTitle(view.querySelector('#rt-title'), rows[0].title)
    renderBookMetadata(view.querySelector('#rt-book-metadata'), rows[0], { percent: rows[0].percent })
    view.querySelector('#rt-more')!.classList.add('is-hidden')
    return { view, hero }
  }
  it('deskRecord names every book\'s binding, colour, shape, spine title and public cover, and the hero\'s size', () => {
    const { view, hero } = drawn()
    const record = deskRecord(table, view, 'reader-a', coverOf, hero)
    expect(record).toMatchObject({ v: 2, owner: 'reader-a', bookId: 'frankenstein', cover: '/lab/library_2/assets/covers/frankenstein-480.webp', spine: 'navy', hero: { w: 393, h: 702 } })
    expect(record.art.frankenstein).toEqual({ t: 'Frankenstein', b: 'navy', c: '#253c5c', a: 0.666667, u: '/lab/library_2/assets/covers/frankenstein-480.webp' })
    expect(record.art['pd-en-leaves-of-grass']).toEqual({ t: 'Leaves of Grass', b: 'paper', c: '#e6dfca', a: 0.534167, u: null })
    expect(record.art.meditations.b).toMatch(/^[a-z]+$/)
    // Nothing about the reading beyond what the device's table snapshot already holds: no percent, recap or place here.
    expect(JSON.stringify(record)).not.toMatch(/Geneva|Letter 4|percent|recap|headline/)
  })
  it('deskRecord is null before the table has been laid out, or for a signed-out device', () => {
    const view = document.createElement('div'); view.innerHTML = markup(table); view.querySelector('.rt-b')!.classList.add('is-current')
    const hero = document.createElement('section'); hero.append(view)
    Object.defineProperty(hero, 'clientWidth', { value: 393 }); Object.defineProperty(hero, 'clientHeight', { value: 702 })
    expect(deskRecord(table, view, 'reader-a', coverOf, hero)).toBeNull()
    const ready = drawn()
    expect(deskRecord(table, ready.view, null, coverOf, ready.hero)).toBeNull()
  })
  it('boot.js renders the recorded desk with the table\'s structure, styles, spine titles and the shown cover', () => {
    const { view, hero } = drawn()
    const record = deskRecord(table, view, 'reader-a', coverOf, hero)
    const desk = bootDesk()
    const model = desk.model(record, 'reader-a', storageOf({ 'tinct:library-2-table:reader-a': table }), storageOf({}), Date.now())
    expect(model.current).toBe(0)
    const placeholder = document.createElement('div')
    placeholder.innerHTML = desk.markup(model)
    expect(skeleton(placeholder)).toEqual(skeleton(view))
    const real = [...view.querySelectorAll<HTMLElement>('.rt-b')], twins = [...placeholder.querySelectorAll<HTMLElement>('.rt-b')]
    const styleOf = (box: HTMLElement) => ['--dr', '--ribbon', '--binding', '--p'].map(p => `${p}:${box.style.getPropertyValue(p)}`).join(';') + ';--tl:' + box.querySelector<HTMLElement>('.rt-spine')!.style.getPropertyValue('--tl')
    real.forEach((box, i) => {
      const twin = twins[i]
      expect(styleOf(twin), `book ${i}`).toBe(styleOf(box))
      expect(twin.querySelector('.rt-spine em')!.textContent).toBe(box.querySelector('.rt-spine em')!.textContent)
      expect(twin.querySelector<HTMLElement>('.rt-spine')!.style.background).toBe(box.querySelector<HTMLElement>('.rt-spine')!.style.background)
      expect(twin.querySelector<HTMLElement>('.rt-refl-spine')!.style.background).toBe(box.querySelector<HTMLElement>('.rt-refl-spine')!.style.background)
      expect(twin.querySelector('.rt-spine em')!.getAttribute('style')).toBe(box.querySelector('.rt-spine em')!.getAttribute('style'))
      expect(twin.querySelector('.rt-gilt')!.getAttribute('style')).toBe(box.querySelector('.rt-gilt')!.getAttribute('style'))
      // Only the shown book's cover is fetched; the spine-out books carry no image.
      expect(twin.querySelector('img')!.getAttribute('src')).toBe(i === 0 ? '/lab/library_2/assets/covers/frankenstein-480.webp' : null)
      expect(twin.style.getPropertyValue('--cover')).toBe(i === 0 ? box.style.getPropertyValue('--cover') : '')
    })
    // The shown book's facts, as the table first paints them from the same snapshot.
    expect(placeholder.querySelector('h1')!.textContent).toBe('Frankenstein')
    expect(placeholder.querySelector('h1')!.getAttribute('data-fit')).toBe('0')
    expect(placeholder.querySelector('.rt-meta')!.textContent).toBe('Letter 442%')
    expect(placeholder.querySelector('.rt-recap p')!.textContent).toBe('Victor returns to Geneva.')
    expect(placeholder.querySelector('.rt-continue')!.textContent).toBe('Continue')
    expect(placeholder.querySelectorAll('.rt-dots button')).toHaveLength(3)
    expect(placeholder.querySelector('.rt-dots .active')!.getAttribute('data-i')).toBe('0')
    // No ids: the table finds its own parts by id, and the harness its state.
    expect(placeholder.querySelector('[id]')).toBeNull()
  })
})
