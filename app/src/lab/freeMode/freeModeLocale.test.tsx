// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getBook } from '../../data/bookRegistry'
import { DANISH_FREE_PAGE_SLUG } from '../../data/freePages'
import { freeModeHandoff } from '../labReaderHandoff'
import {
  FREE_MODE_HOME,
  FREE_MODE_LOCALE,
  freeModeCandidates,
  freeModeEditionFor,
  freeModeEditions,
  freeModeMenuRows,
  freeModePair,
  freeModeSourceLine,
  otherFreeModeEdition,
  withFreeMode,
} from './freeMode'
import { FREE_MODE_DANISH, FREE_MODE_ENGLISH, danishGenitive, freeModeLocaleFor } from './freeModeLocale'
import { LabFreeModeCopyBar, LabFreeModeEditions, LabFreeModePhoneBand } from './LabFreeMode'

afterEach(cleanup)

// Free reading mode in Danish (freeModeLocale.ts): chosen by the Danish page's `ref`, it reads the Danish edition and
// the English original, goes back to the Danish page and draws its own chrome in Danish. English is untouched.
const DA = FREE_MODE_DANISH

describe('free reading mode takes its language from the page it came from', () => {
  it('is Danish from the Danish page and English from anywhere else', () => {
    expect(freeModeLocaleFor(`?book=meditations&mode=free&ref=${DANISH_FREE_PAGE_SLUG}`)).toBe(DA)
    expect(freeModeLocaleFor('?book=meditations&mode=free&ref=modern-english')).toBe(FREE_MODE_ENGLISH)
    expect(freeModeLocaleFor('?book=meditations&mode=free')).toBe(FREE_MODE_ENGLISH)
    expect(freeModeLocaleFor('?book=meditations&mode=free&ref=newsletter')).toBe(FREE_MODE_ENGLISH)
    // This test page has no ref: the page's own language is English, as before.
    expect(FREE_MODE_LOCALE).toBe(FREE_MODE_ENGLISH)
    expect(FREE_MODE_HOME).toBe('/modern-english')
    expect(DA.home).toBe(`/${DANISH_FREE_PAGE_SLUG}`)
  })

  it('keeps the Danish ref on the next book it opens, and adds none in English', () => {
    expect(withFreeMode('/reader?book=hamlet', DA)).toBe(`/reader?book=hamlet&mode=free&ref=${DANISH_FREE_PAGE_SLUG}`)
    expect(withFreeMode('/reader?book=hamlet', FREE_MODE_ENGLISH)).toBe('/reader?book=hamlet&mode=free')
    expect(withFreeMode('/library', DA)).toBe('/library')
  })
})

describe('the editions Danish free mode reads', () => {
  const meditations = getBook('meditations')!

  it('reads the Danish edition and the English original, Danish first unless the saved place is in the original', () => {
    const candidates = freeModeCandidates('meditations', meditations.editions, DA)
    expect(freeModePair(candidates, DA)).toEqual({ original: 'original-en', modern: 'modern-da' })
    expect(freeModeEditions(candidates, DA).map(edition => edition.key).sort()).toEqual(['modern-da', 'original-en'])
    expect(freeModeEditionFor(candidates, undefined, DA)).toBe('modern-da')
    expect(freeModeEditionFor(candidates, 'original-en', DA)).toBe('original-en')
    // A place saved in Modern English is not one of the two: the book opens in Danish.
    expect(freeModeEditionFor(candidates, 'modern-en', DA)).toBe('modern-da')
    expect(otherFreeModeEdition('modern-da', candidates, DA)).toBe('original-en')
    expect(otherFreeModeEdition('original-en', candidates, DA)).toBe('modern-da')
  })

  it('hands the reader the Danish edition with the English original beside it', () => {
    expect(freeModeHandoff('meditations', DA)).toMatchObject({ bookId: 'meditations', primaryEditionKey: 'modern-da', compareEditionKey: 'original-en', resumeLatest: true })
    expect(freeModeHandoff('meditations', FREE_MODE_ENGLISH)).toMatchObject({ primaryEditionKey: 'modern-en', compareEditionKey: 'original-en' })
  })

  it('never opens a Danish edition that is not published: such a book reads in English', () => {
    const withUnpublished = [{ key: 'original-en' }, { key: 'modern-en' }, { key: 'modern-da' }]
    // pride-and-prejudice has no offered Danish edition, so a Danish file on it is held and left out.
    const candidates = freeModeCandidates('pride-and-prejudice', withUnpublished, DA)
    expect(candidates.map(edition => edition.key)).toEqual(['original-en', 'modern-en'])
    expect(freeModePair(candidates, DA)).toEqual({ original: 'original-en', modern: 'modern-en' })
    expect(freeModeEditionFor(candidates, undefined, DA)).toBe('modern-en')
    expect(otherFreeModeEdition('original-en', candidates, DA)).toBe('modern-en')
  })

  it('leaves English free mode exactly as it was', () => {
    expect(freeModeCandidates('meditations', meditations.editions, FREE_MODE_ENGLISH)).toBe(meditations.editions)
    expect(freeModeEditions(meditations.editions, FREE_MODE_ENGLISH).map(edition => edition.key).sort()).toEqual(['modern-en', 'original-en'])
    expect(freeModeEditionFor(meditations.editions, 'modern-da', FREE_MODE_ENGLISH)).toBe('modern-en')
    expect(otherFreeModeEdition('original-en', undefined, FREE_MODE_ENGLISH)).toBe('modern-en')
    expect(freeModeMenuRows(FREE_MODE_ENGLISH).map(row => row.label)).toEqual(['Appearance', 'Book settings', 'Library'])
  })
})

describe('the chrome Danish free mode draws', () => {
  const EDITIONS = [{ key: 'original-en' }, { key: 'modern-da' }]

  it('has a t menu of Udseende, Bogindstillinger and Bibliotek, with the same rows', () => {
    expect(freeModeMenuRows(DA).map(row => row.label)).toEqual(['Udseende', 'Bogindstillinger', 'Bibliotek'])
    expect(freeModeMenuRows(DA).map(row => row.id)).toEqual(['text', 'editions', 'library'])
  })

  it('offers Dansk, Engelsk and Begge on the desktop and no Begge on the phone', () => {
    const { unmount } = render(<LabFreeModeEditions editions={EDITIONS} current="modern-da" both onChoose={() => {}} locale={DA} />)
    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(['Dansk', 'Engelsk', 'Begge'])
    expect(screen.getByRole('group').getAttribute('aria-label')).toBe('Udgave')
    expect(screen.getByRole('button', { name: 'Dansk' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Dansk' }).getAttribute('data-view')).toBe('modern-da')
    unmount()
    render(<LabFreeModePhoneBand editions={EDITIONS} current="original-en" progressLabel="40 / 266 of book" onChoose={() => {}} locale={DA} />)
    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(['Dansk', 'Engelsk'])
    expect(screen.getByRole('button', { name: 'Engelsk' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('draws no switch for a book with only one of the two', () => {
    render(<LabFreeModeEditions editions={[{ key: 'modern-da' }]} current="modern-da" both onChoose={() => {}} locale={DA} />)
    expect(screen.queryByTestId('lab-free-editions')).toBeNull()
  })

  it('says Kopiér on a selection', () => {
    render(<LabFreeModeCopyBar text="Tekst" x={200} y={200} onDone={() => {}} locale={DA} />)
    expect(screen.getByRole('button').textContent).toBe('Kopiér')
    expect(screen.getByRole('toolbar').getAttribute('aria-label')).toBe('Markering')
  })

  it('names the Danish source under the heading from the registry', () => {
    expect(freeModeSourceLine(getBook('meditations')!, DA)).toBe('Nutidsdansk lavet med AI ud fra George Longs engelske oversættelse fra 1862')
    expect(freeModeSourceLine(getBook('hamlet')!, DA)).toBe('Nutidsdansk lavet med AI ud fra William Shakespeares engelske original')
    expect(freeModeSourceLine(getBook('master-and-margarita')!, DA)).toBe('Nutidsdansk lavet med AI ud fra den russiske original')
    // A book with no published Danish reads in English, and its line says so.
    expect(freeModeSourceLine(getBook('pride-and-prejudice')!, DA)).toBe('Modern English made with AI from Jane Austen’s original')
    expect(freeModeSourceLine(getBook('meditations')!, FREE_MODE_ENGLISH)).toBe('Modern English made with AI from George Long’s 1862 translation')
  })

  it('writes names in the Danish genitive', () => {
    expect(danishGenitive('George Long')).toBe('George Longs')
    expect(danishGenitive('Marcus Aurelius')).toBe('Marcus Aurelius’')
    expect(danishGenitive('Samuel Moore (edited by Engels)')).toBe('Samuel Moores')
    expect(danishGenitive('Edgar Taylor and Marian Edwardes')).toBe('Edgar Taylor og Marian Edwardes’')
  })

  it('has every string of the English table in Danish', () => {
    const keys = (value: object): string[] => Object.entries(value).flatMap(([key, inner]) => typeof inner === 'object' ? keys(inner).map(sub => `${key}.${sub}`) : [key])
    const danish = new Set(keys(DA.strings))
    for (const key of keys(FREE_MODE_ENGLISH.strings)) if (key !== 'editions.modern-en') expect(danish.has(key), key).toBe(true)
    expect(Object.values(DA.strings.menu).concat(DA.strings.copy, DA.strings.back, DA.strings.nextChapter).join(' ')).not.toMatch(/\b(?:Library|Appearance|Copy|Back|Next)\b/)
  })
})
