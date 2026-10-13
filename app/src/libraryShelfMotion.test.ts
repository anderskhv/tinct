// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// @ts-expect-error -- plain browser module of the library page
import { recordRects, playFlip, fadeOut, markGone, MOVE_MS, LEAVE_MS } from '../public/lab/library_2/shelf-motion.js'

type Box = { left: number; top: number }
/** A card whose on-screen box the test sets (jsdom has no layout). */
function card(key: string, box: Box) {
  const el = document.createElement('article')
  el.dataset.flipKey = key
  let at = box
  el.getBoundingClientRect = () => ({ left: at.left, top: at.top, width: 100, height: 150, right: at.left + 100, bottom: at.top + 150, x: at.left, y: at.top, toJSON() {} }) as DOMRect
  return Object.assign(el, { moveTo: (next: Box) => { at = next } })
}
const keyOf = (el: HTMLElement) => el.dataset.flipKey

describe('removing a book from a shelf glides the others into place (FLIP)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('records each card\'s box by key', () => {
    const a = card('a', { left: 0, top: 0 }), b = card('b', { left: 120, top: 0 })
    const rects = recordRects([a, b], keyOf)
    expect([...rects.keys()]).toEqual(['a', 'b'])
    expect(rects.get('b').left).toBe(120)
  })

  it('starts each moved card where it was, glides it with a transform, then clears it', async () => {
    // Three in a row; the rightmost (c) is removed, so nothing after it moves...
    // here the first (a) is removed: b and c each move one place left, d wraps up a row.
    const b = card('b', { left: 120, top: 0 }), c = card('c', { left: 240, top: 0 }), d = card('d', { left: 0, top: 170 })
    const before = recordRects([b, c, d], keyOf)
    b.moveTo({ left: 0, top: 0 }); c.moveTo({ left: 120, top: 0 }); d.moveTo({ left: 240, top: 0 })
    const { moved, done } = playFlip([b, c, d], before, keyOf, { reduced: false })
    expect(moved).toEqual([b, c, d])
    // Inverted and released in the same frame: the transition carries it from the old box.
    expect(b.style.transition).toBe(`transform ${MOVE_MS}ms cubic-bezier(.2,.8,.2,1)`)
    expect(b.style.transform).toBe('')
    vi.advanceTimersByTime(MOVE_MS + 50)
    await done
    for (const el of [b, c, d]) { expect(el.style.transform).toBe(''); expect(el.style.transition).toBe('') }
  })

  it('applies the inverting transform before the glide', () => {
    const b = card('b', { left: 240, top: 170 })
    const before = recordRects([b], keyOf)
    b.moveTo({ left: 0, top: 0 })
    const seen: string[] = []
    // offsetWidth is the reflow between Invert and Play: the inverted transform is in place then.
    Object.defineProperty(b, 'offsetWidth', { get() { seen.push(b.style.transform); return 0 } })
    playFlip([b], before, keyOf, { reduced: false })
    expect(seen.at(-1)).toBe('translate(240.0px,170.0px)')
  })

  it('leaves cards that did not move, and new cards, alone', () => {
    const a = card('a', { left: 0, top: 0 }), fresh = card('new', { left: 120, top: 0 })
    const before = recordRects([a], keyOf)
    const { moved } = playFlip([a, fresh], before, keyOf, { reduced: false })
    expect(moved).toEqual([])
    expect(a.style.transform).toBe('')
    expect(fresh.style.transform).toBe('')
  })

  it('a second removal mid-glide carries on from where the card is, and clears once', async () => {
    const c = card('c', { left: 240, top: 0 })
    let before = recordRects([c], keyOf)
    c.moveTo({ left: 120, top: 0 })
    const first = playFlip([c], before, keyOf, { reduced: false })
    vi.advanceTimersByTime(100)
    // Mid-glide the card is seen part-way; then another book goes and it moves on again.
    c.moveTo({ left: 180, top: 0 }); before = recordRects([c], keyOf)
    c.moveTo({ left: 0, top: 0 })
    const second = playFlip([c], before, keyOf, { reduced: false })
    expect(second.moved).toEqual([c])
    expect(c.style.transition).toContain('transform')
    // The first glide's clean-up must not cut the second one short.
    vi.advanceTimersByTime(MOVE_MS - 60)
    await first.done
    expect(c.style.transition).toContain('transform')
    vi.advanceTimersByTime(200)
    await second.done
    expect(c.style.transform).toBe('')
    expect(c.style.transition).toBe('')
  })

  it('reduced motion: no transform at all', () => {
    const b = card('b', { left: 120, top: 0 })
    const before = recordRects([b], keyOf)
    b.moveTo({ left: 0, top: 0 })
    const { moved } = playFlip([b], before, keyOf, { reduced: true })
    expect(moved).toEqual([])
    expect(b.style.transform).toBe('')
  })

  it('the leaving card stops taking taps at once, then fades and shrinks', async () => {
    const gone = card('x', { left: 0, top: 0 })
    let finished = false
    fadeOut(gone, { reduced: false }).then(() => { finished = true })
    expect(gone.style.pointerEvents).toBe('none')
    expect(gone.getAttribute('aria-hidden')).toBe('true')
    expect(gone.style.opacity).toBe('0')
    expect(gone.style.transform).toBe('scale(.86)')
    vi.advanceTimersByTime(LEAVE_MS)
    await Promise.resolve()
    expect(finished).toBe(true)
    const again = card('y', { left: 0, top: 0 }); markGone(again)
    expect(again.style.opacity).toBe('0')
  })

  it('a 3D book keeps its own transform and fades face by face', () => {
    const book = document.createElement('button')
    book.style.transform = 'translate3d(10px,0,0) rotateY(90deg)'
    const face = document.createElement('span'); book.append(face)
    fadeOut(book, { reduced: false, transform: book.style.transform, faces: book.children })
    expect(book.style.transform).toBe('translate3d(10px,0,0) rotateY(90deg) scale(.86)')
    expect(book.style.opacity).toBe('')
    expect(face.style.opacity).toBe('0')
  })
})

describe('every removal path uses the motion', () => {
  const lib = (file: string) => readFileSync(resolve(__dirname, '../public/lab/library_2/' + file), 'utf8')
  it('My shelf, the reading table and the shelf study keep their books and glide them', () => {
    const app = lib('app.js'), table = lib('reading-table.js'), view = lib('bookshelf-view.js')
    // My shelf: the leaving book fades during the save, then the re-render plays FLIP with the scroll kept.
    for (const path of ['removeFromMyShelf', 'removeOwnFromReading', 'deleteOwnBook']) expect(app).toMatch(new RegExp(`function ${path}[\\s\\S]{0,400}leaveShelf\\(`))
    expect(app).toMatch(/playFlip\(shelfNodes\(\),before,shelfKey/)
    expect(app).toMatch(/scrollTo\(\{top:y,behavior:'instant'\}\)/)
    // The desk takes books off in place and hands the choice to a neighbour.
    expect(table).toMatch(/view\.removeBooks\(ids\.filter/)
    expect(table).toMatch(/slice\(current\+1\)\.find/)
    expect(view).toMatch(/playFlip\(root\.querySelectorAll\('\.volume'\)/)
  })
  it('the changed modules share one cache tag', () => {
    // Shelf motion and cover shape (20261009cover) are unchanged since; one shelf truth
    // (20261009owncover) changed the reading table, My shelf, covers and titles above them;
    // own-book covers and the account cards both changed app.js. Recognising scanned PDFs
    // (20261010libperf) then changed add-to-tinct.js, styles.css and the reading/add bundles, and
    // every module above them on the way to index.html; the wait ring (20261013orbmid, wait-ring.js)
    // changed add-to-tinct.js, app.js and styles.css again; cover-assets.js stays under 20261009owncover.
    const motion = '20261009cover', tag = '20261009owncover', ocr = '20261013orbmid'
    expect(lib('index.html')).toContain(`app.js?v=${ocr}`)
    expect(lib('index.html')).toContain(`styles.css?v=${ocr}`)
    expect(lib('app.js')).toContain(`bookshelf.js?v=${ocr}`)
    expect(lib('app.js')).toContain(`catalogue.js?v=${ocr}`)
    expect(lib('app.js')).toContain(`add-to-tinct.js?v=${ocr}`)
    expect(lib('app.js')).toContain(`shelf-motion.js?v=${motion}`)
    expect(lib('bookshelf.js')).toContain(`reading-table.js?v=${ocr}`)
    expect(lib('bookshelf.js')).toContain(`bookshelf-view.js?v=${ocr}`)
    expect(lib('bookshelf.js')).toContain(`catalogue.js?v=${ocr}`)
    expect(lib('bookshelf-view.js')).toContain(`reading-table.js?v=${ocr}`)
    expect(lib('bookshelf-view.js')).toContain(`shelf-motion.js?v=${motion}`)
    expect(lib('reading-table.js')).toContain(`shelf-motion.js?v=${motion}`)
    expect(lib('reading-table.js')).toContain(`table-window.js?v=${motion}`)
    expect(lib('reading-table.js')).toContain(`catalogue.js?v=${ocr}`)
    expect(lib('reading-table.js')).toContain(`cover-assets.js?v=${tag}`)
    expect(lib('catalogue.js')).toContain(`cover-assets.js?v=${tag}`)
    expect(lib('catalogue.js')).toContain(`add-to-tinct.js?v=${ocr}`)
    expect(lib('catalogue.js')).toContain(`library-2-reading.js?v=${ocr}`)
    expect(lib('boot.js')).toContain(`library-2-reading.js?v=${ocr}`)
    // A module imported under two tags would load twice: every importer names the same one.
    const files = ['app.js', 'bookshelf.js', 'bookshelf-view.js', 'reading-table.js', 'catalogue.js', 'add-to-tinct.js', 'cover-assets.js', 'spine.js']
    const tags = new Map<string, Set<string>>()
    for (const file of files) for (const [, name, version] of lib(file).matchAll(/['"]\.{1,2}\/([\w./-]+\.js)\?v=(\w+)['"]/g)) {
      if (!tags.has(name)) tags.set(name, new Set())
      tags.get(name)!.add(version)
    }
    for (const [name, versions] of tags) expect([...versions], name).toHaveLength(1)
  })
})
