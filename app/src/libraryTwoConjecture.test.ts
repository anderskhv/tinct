// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CONJECTURE_BOOKS } from './data/bookRegistry'
import {
  CONJECTURE_DEFAULT, CONJECTURE_IDS, conjectureOpening, conjectureProgress, isConjectureAddress, mountConjectureHero, progressChipLabel,
} from '../public/lab/library_2/conjecture-hero.js'

const row = (bookId: string, extra: Record<string, unknown> = {}) => ({ bookId, chapterLabel: 'Chapter 2', percent: 8, ...extra })

describe('the Conjecture Institute link (/conjecture)', () => {
  it('shows the registry’s five Conjecture books, in its order', () => {
    expect(CONJECTURE_IDS).toEqual(CONJECTURE_BOOKS.map(book => book.id))
    expect(CONJECTURE_IDS).toContain(CONJECTURE_DEFAULT)
  })

  it('answers /conjecture and /library?collection=conjecture, and nothing else', () => {
    expect(isConjectureAddress('/conjecture')).toBe(true)
    expect(isConjectureAddress('/conjecture/')).toBe(true)
    expect(isConjectureAddress('/library', '?collection=conjecture')).toBe(true)
    expect(isConjectureAddress('/library', '')).toBe(false)
    expect(isConjectureAddress('/', '?collection=conjecture')).toBe(false)
    expect(isConjectureAddress('/conjectures')).toBe(false)
  })

  it('signed out, opens on Bold Conjectures, Volume I, whatever this device has read', () => {
    expect(conjectureOpening({ signedIn: false, reading: [] })).toBe('bold-conjectures-volume-1')
    expect(conjectureOpening({ signedIn: false, reading: [row('lords-of-the-cosmos')] })).toBe('bold-conjectures-volume-1')
  })

  it('signed in, opens on the Conjecture book read most recently, else Bold Conjectures, Volume I', () => {
    // The reading list is newest first; other books before it do not count.
    expect(conjectureOpening({ signedIn: true, reading: [row('frankenstein'), row('lords-of-the-cosmos'), row('the-farthest-reaches')] })).toBe('lords-of-the-cosmos')
    // A row's own time decides when the rows carry one.
    expect(conjectureOpening({ signedIn: true, reading: [row('lords-of-the-cosmos', { lastActiveAt: 100 }), row('the-sovereign-child', { lastActiveAt: 300 })] })).toBe('the-sovereign-child')
    expect(conjectureOpening({ signedIn: true, reading: [row('frankenstein'), row('hamlet')] })).toBe('bold-conjectures-volume-1')
    expect(conjectureOpening({ signedIn: true, reading: undefined as never })).toBe('bold-conjectures-volume-1')
  })

  it('writes the gold progress chip as "Chapter N · NN% read"', () => {
    expect(progressChipLabel(conjectureProgress([row('lords-of-the-cosmos', { chapterLabel: 'Chapter 4', percent: 31.4 })], 'lords-of-the-cosmos'))).toBe('Chapter 4 · 31% read')
    expect(progressChipLabel(conjectureProgress([row('lords-of-the-cosmos', { percent: 0.4 })], 'lords-of-the-cosmos'))).toBe('Chapter 2 · <1% read')
    expect(progressChipLabel(conjectureProgress([row('lords-of-the-cosmos', { percent: null })], 'lords-of-the-cosmos'))).toBe('Chapter 2')
    expect(conjectureProgress([row('hamlet')], 'lords-of-the-cosmos')).toBeNull()
  })

  function mount(signedIn: boolean) {
    document.body.innerHTML = '<section id="hero"></section>'
    const hero = document.getElementById('hero')!
    const open = vi.fn()
    const books = CONJECTURE_BOOKS.map(book => ({ id: book.id, title: book.title, author: book.author, summary: book.description, cover: `/covers/v2/${book.id}.webp`, readingTime: '~3 hours to read' }))
    const view = mountConjectureHero({ hero, books, signedIn: () => signedIn, open })!
    return { hero, open, view }
  }

  it('signed out: the cover opens the shown book; a small cover puts its book on the table', () => {
    const { hero, open, view } = mount(false)
    expect(hero.querySelector('.conj-title')!.textContent).toBe('Bold Conjectures, Volume I')
    expect(hero.querySelector('.conj-logo img')!.getAttribute('alt')).toBe('Conjecture Institute')
    // No Read button and no permission line on the hero.
    expect(hero.querySelectorAll('.conj button').length).toBe(6)
    expect(hero.textContent).not.toMatch(/permission|public domain/i)
    const strip = [...hero.querySelectorAll<HTMLButtonElement>('.conj-th')]
    expect(strip.map(b => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true', 'false', 'false'])
    expect(hero.querySelectorAll('.conj-chip').length).toBe(1)
    strip[4].click()
    expect(view.current.id).toBe('the-farthest-reaches')
    expect(hero.querySelector('.conj-title')!.textContent).toBe('The Farthest Reaches')
    expect(strip[4].getAttribute('aria-pressed')).toBe('true')
    expect(hero.querySelector('.conj-big')!.getAttribute('aria-label')).toBe('Open The Farthest Reaches')
    ;(hero.querySelector('.conj-big') as HTMLButtonElement).click()
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ id: 'the-farthest-reaches' }))
    // Signed out, progress on this device is not shown.
    view.setReading([row('lords-of-the-cosmos')])
    expect(hero.querySelectorAll('.conj-pb:not([hidden])').length).toBe(0)
  })

  it('signed in: moves to the most recent book when the reading list arrives, with its chip and bar', () => {
    const { hero, view } = mount(true)
    expect(view.current.id).toBe('bold-conjectures-volume-1')
    view.setReading([row('lords-of-the-cosmos', { chapterLabel: 'Chapter 4', percent: 31 }), row('bold-conjectures-volume-1')])
    expect(view.current.id).toBe('lords-of-the-cosmos')
    expect([...hero.querySelectorAll('.conj-chip')].map(c => c.textContent)).toEqual(['~3 hours to read', 'Chapter 4 · 31% read'])
    expect(hero.querySelector('.conj-big')!.getAttribute('aria-label')).toBe('Continue Lords of the Cosmos')
    expect(hero.querySelectorAll('.conj-pb:not([hidden])').length).toBe(2)
    // A book the reader chose stays chosen when the list refreshes.
    view.move(1)
    expect(view.current.id).toBe('bold-conjectures-volume-1')
    view.setReading([row('lords-of-the-cosmos')])
    expect(view.current.id).toBe('bold-conjectures-volume-1')
  })

  it('boot.js keeps the desk and the book link off the Conjecture page, and never sends it to the landing page', () => {
    const boot = readFileSync(resolve(process.cwd(), 'public/lab/library_2/boot.js'), 'utf8')
    expect(boot).toContain("get('collection')==='conjecture'")
    expect(boot).toMatch(/get\('view'\)==='new'\|\|conjecture\)hint=false/)
    expect(boot).toContain('const linked=conjecture?null:')
    expect(boot).not.toContain('landing')
  })
})
