/**
 * The margin preview's t menu, the part the page answers (Anders, 21 Oct 2026: the desktop t menu is Tinct's
 * normal menu, Library and Profile included). The frame (public/lab/addbook/js/reader.js) reaches it through
 * `window.TinctMarginPreview.menu`: Profile opens the account cards over this page (openCards.ts, as the book
 * reader opens them), and Book settings reads and sets the book reader's edition choices. Voice and speed
 * are the player's (useMarginListen.ts). Library is a plain top-window visit to /library, made by the frame.
 */
import { getBook } from '../../data/bookRegistry'
import { editionHold } from '../../data/editionAvailability'
import { labCurrentPath } from '../labAccountPrompt'
import { LAB_PREFS_KEY, labSignInUrl, parseLabPrefs, writeLabPrefs, type LabPrefs } from '../labPrefs'
import { marginPreviewCompareEdition, marginPreviewReturnHref, type MarginPreviewBook } from './marginPreviewModel'

export interface MarginMenuChoice { value: string; label: string }

/** Book settings' edition rows: the edition read here, and the one Compare shows beside it ('' for none). */
export interface MarginReadingChoices {
  edition: string
  editions: MarginMenuChoice[]
  compareEdition: string
  compareEditions: MarginMenuChoice[]
}

/** A place in the frame's terms: its page (one per chapter), paragraph and word. */
export interface MarginFramePlace { page: number; para: number; word: number }

export interface MarginPreviewMenuApi {
  openProfile: (opts: { dark: boolean }) => void
  reading: () => Promise<MarginReadingChoices | null>
  /** Read in another edition: the preview opens again at the same chapter, paragraph and word. */
  setEdition: (editionKey: string, at: MarginFramePlace) => void
  setCompareEdition: (editionKey: string) => void
}

function readPrefs(): LabPrefs {
  let raw: unknown = null
  try { raw = JSON.parse(localStorage.getItem(LAB_PREFS_KEY) || 'null') } catch { /* defaults */ }
  return parseLabPrefs(raw, 'desktop')
}

/** The edition choices for this book, as the book reader's Book editions offers them (held editions left out). */
export function marginReadingChoices(book: NonNullable<ReturnType<typeof getBook>>, editionKey: string, prefs: Pick<LabPrefs, 'compareOpen' | 'compareEdition'>): MarginReadingChoices {
  const usable = book.editions.filter(edition => !editionHold(book.id, edition.key))
  const editions = usable.map(edition => ({ value: edition.key, label: edition.label }))
  const others = editions.filter(edition => edition.value !== editionKey)
  const compare = prefs.compareOpen ? marginPreviewCompareEdition(book, prefs, editionKey) ?? '' : ''
  return { edition: editionKey, editions, compareEdition: others.some(o => o.value === compare) ? compare : '', compareEditions: [{ value: '', label: 'None' }, ...others] }
}

/** The account cards' code, fetched the first time Profile opens. */
let cardsModule: Promise<typeof import('../../cards/openCards')> | null = null
const loadCards = () => (cardsModule ??= import('../../cards/openCards').catch(error => { cardsModule = null; throw error }))

export function marginPreviewMenu(bookId: string, pending: Promise<MarginPreviewBook>): MarginPreviewMenuApi {
  const book = getBook(bookId)
  return {
    openProfile: ({ dark }) => {
      void loadCards().then(cards => {
        if (cards.accountCardsOpen()) return true
        return cards.openAccountCards({ start: 'you', dark, deskTop: 76 })
      }).then(opened => {
        // Signed out: the account lives behind sign-in.
        if (!opened) window.location.assign(labSignInUrl(labCurrentPath()))
      }, () => { /* the cards' code could not load (offline before first use): nothing opened */ })
    },
    reading: () => pending.then(model => (book ? marginReadingChoices(book, model.editionKey, readPrefs()) : null), () => null),
    setEdition: (editionKey, at) => {
      void pending.then(model => {
        if (!book || editionKey === model.editionKey || !book.editions.some(e => e.key === editionKey)) return
        const chapter = model.chapters[Math.max(0, at.page - 1)]
        if (!chapter) return
        writeLabPrefs({ ...readPrefs(), primaryEdition: editionKey }, 'desktop')
        window.location.assign(marginPreviewReturnHref(bookId, { editionKey, chapterNumber: chapter.number, paragraphIndex: at.para || 0, wordIndex: at.word || 0 }))
      }, () => {})
    },
    setCompareEdition: editionKey => {
      const prefs = readPrefs()
      writeLabPrefs({ ...prefs, compareEdition: editionKey || prefs.compareEdition, compareOpen: editionKey !== '', compareChosen: true }, 'desktop')
    },
  }
}
