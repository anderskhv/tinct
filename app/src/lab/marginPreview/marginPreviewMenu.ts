/**
 * The margin preview's t menu, the part the page answers (Anders, 21 Oct 2026: the desktop t menu is Tinct's
 * normal menu, Library and Profile included). The frame (public/lab/addbook/js/reader.js) reaches it through
 * `window.TinctMarginPreview.menu`: Profile opens the account cards over this page (openCards.ts, as the book
 * reader opens them), and Reading settings reads and sets the book reader's edition choices. Voice and speed
 * are the player's (useMarginListen.ts). Library is a plain top-window visit to /library, made by the frame.
 */
import { getBook } from '../../data/bookRegistry'
import { editionHold } from '../../data/editionAvailability'
import { labCurrentPath } from '../labAccountPrompt'
import { readCachedSupabaseUser } from '../labLibraryBoot'
import { LAB_PREFS_KEY, labSignInUrl, parseLabPrefs, writeLabPrefs, type LabPrefs } from '../labPrefs'
import { marginParagraphWords, marginPreviewCompareEdition, marginPreviewReturnHref, type MarginPreviewBook } from './marginPreviewModel'
import { chapterWordFraction, editionSwitchReturn, leadingPreface, rememberEditionSwitch } from '../labEditionSwitch'
import { chapterAnchorMap, loadEditionAnchors, placeAtWordOffset, wordOffsetOfPlace } from '../labEditionAnchors'

export interface MarginMenuChoice { value: string; label: string }

/** Reading settings' edition rows: the edition read here, and the one Compare shows beside it ('' for none). */
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
  /** The t menu's AI settings row: the dialog opens over this page (openAiSettingsLayer.tsx). */
  openAiSettings: (opts: { dark: boolean }) => void
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
    openAiSettings: ({ dark }) => {
      void import('../openAiSettingsLayer').then(layer => layer.openAiSettingsLayer({ dark, userId: readCachedSupabaseUser()?.id ?? null }))
        .catch(() => { /* offline before first use: nothing opened */ })
    },
    reading: () => pending.then(model => (book ? marginReadingChoices(book, model.editionKey, readPrefs()) : null), () => null),
    setEdition: (editionKey, at) => {
      void pending.then(async model => {
        if (!book || editionKey === model.editionKey || !book.editions.some(e => e.key === editionKey)) return
        const chapter = model.chapters[Math.max(0, at.page - 1)]
        if (!chapter) return
        writeLabPrefs({ ...readPrefs(), primaryEdition: editionKey }, 'desktop')
        const here = { paragraphIndex: at.para || 0, wordIndex: at.word || 0 }
        const lineUp = (key: string) => book.editions.find(e => e.key === key)?.aligned !== false
        let place = here
        if (!(lineUp(model.editionKey) && lineUp(editionKey)) && chapter.paragraphs.length) {
          // Editions whose paragraphs do not line up share only the chapter (labEditionSwitch.ts): going straight
          // back opens the very place left; otherwise the place is carried as how far into the chapter it is, and
          // the page that opens the other edition lands it (marginPreviewLoad).
          const back = editionSwitchReturn({ bookId, chapterNumber: chapter.number, editionKey: model.editionKey, targetEditionKey: editionKey, place: here },
            { samePlace: (landed, current) => landed.paragraphIndex === current.paragraphIndex })
          if (back) { place = back; rememberEditionSwitch(null) }
          else {
            place = { paragraphIndex: 0, wordIndex: 0 }
            const counts = chapter.paragraphs.map(marginParagraphWords)
            // Through the book's anchors when it has them for these two editions; else by share of the chapter.
            const file = await loadEditionAnchors(bookId).catch(() => null)
            const target = file?.chapters?.[String(chapter.number)]?.[editionKey === file.b ? 'b' : 'a']
            const anchors = file && target && (editionKey === file.a || editionKey === file.b)
              ? chapterAnchorMap(file, { bookId, chapterNumber: chapter.number, from: { edition: model.editionKey, counts }, to: { edition: editionKey, counts: target }, aligned: lineUp })
              : null
            // With anchors the other edition's word counts are known (the file's), so the place is named in the link
            // and whichever reader opens it lands there; without, the page that opens the edition lands the share.
            if (anchors && target) place = placeAtWordOffset(target, anchors.map(wordOffsetOfPlace(counts, here)))
            rememberEditionSwitch({
              bookId, chapterNumber: chapter.number, fraction: chapterWordFraction(counts, here, leadingPreface(chapter.paragraphs.map(p => p.text))),
              from: { editionKey: model.editionKey, ...here }, to: anchors && target ? { editionKey, ...place } : { editionKey },
            })
          }
        } else rememberEditionSwitch(null)
        window.location.assign(marginPreviewReturnHref(bookId, { editionKey, chapterNumber: chapter.number, ...place }))
      }, () => {})
    },
    setCompareEdition: editionKey => {
      const prefs = readPrefs()
      writeLabPrefs({ ...prefs, compareEdition: editionKey || prefs.compareEdition, compareOpen: editionKey !== '', compareChosen: true }, 'desktop')
    },
  }
}
