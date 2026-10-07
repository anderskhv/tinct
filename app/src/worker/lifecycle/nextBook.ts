/**
 * "Your next book" content (books/wip/reader-acclaim, copied to ./content):
 * picks the pairing target and the cards for one finished or stalled book,
 * following pairings.json `rules`, HANDOFF.md "Integration requirements" and
 * email-copy.md "Card presentation rules".
 *
 * - Targets in order; skip one that is not live (missing from the catalogue,
 *   not discoverable, or `blocked_until` set), that the reader already opened,
 *   or whose library hook is missing. Fall back to the next.
 * - Lead card only when verified, meant to lead, about this book, and with no
 *   open pre-send check; otherwise lead with the classic acclaim quote
 *   (next-book-classic-lead) and rewrite the subject to match.
 * - A `display` card puts its display line in `lead_quote` with no label.
 */
import pairingsJson from './content/pairings.json'
import cardsJson from './content/cards.json'
import { isBookTemporarilyHeld } from '../../data/editionAvailability'

export interface Card {
  id: string
  book_id: string
  person: string
  label: string
  quote: string
  context: string
  date: string | null
  recheck: string
  use: string
  display?: string
  pre_send_check?: string
}

export interface PairingTarget {
  book_id: string
  lead_card: string | null
  reason: string
  subject: string
  classic_acclaim?: { source: string; from: string }
  blocked_until?: string
}

export interface Pairing { after: string; next: PairingTarget[] }

export const PAIRINGS = (pairingsJson as { pairings: Pairing[] }).pairings
export const CARDS = new Map((cardsJson as { cards: Card[] }).cards.map(card => [card.id, card]))

/**
 * Cards whose pre-send check (a screenshot of a page behind a bot wall) is
 * still open (HANDOFF.md "Open items"). Such a card never leads: the email
 * falls back to the classic quote. Add an id to CLEARED_PRE_SEND_CHECKS once
 * Anders has the screenshot.
 */
const OPEN_CHECKS_WITHOUT_FIELD = new Set(['C07'])
export const CLEARED_PRE_SEND_CHECKS: ReadonlySet<string> = new Set<string>()

export interface CatalogueBook {
  id: string
  title: string
  author?: string
  discoveryAvailable?: boolean
}

export interface Acclaim { quote: string; source: string; context: string }

export interface NextBookLoaders {
  /** Library introduction hook text (lab/library_2/intro-data/{id}.json `hook.text`). */
  hook(bookId: string): Promise<string | null>
  /** Onboarding acclaim entries (data/onboarding/{id}.json `acclaim`). */
  acclaim(bookId: string): Promise<Acclaim[] | null>
}

export interface NextBookChoice {
  template: 'next-book' | 'next-book-classic-lead'
  targetId: string
  vars: Record<string, string>
}

function leadCardFor(target: PairingTarget): Card | null {
  const card = target.lead_card ? CARDS.get(target.lead_card) : undefined
  if (!card || card.recheck !== 'verified' || card.use !== 'lead' || card.book_id !== target.book_id) return null
  const openCheck = Boolean(card.pre_send_check) || OPEN_CHECKS_WITHOUT_FIELD.has(card.id)
  if (openCheck && !CLEARED_PRE_SEND_CHECKS.has(card.id)) return null
  return card
}

function cardContext(card: Card): string {
  const year = card.date?.slice(0, 4)
  return year && !/\b\d{4}\b/.test(card.context) ? `${card.context}, ${year}` : card.context
}

function surname(person: string): string {
  const words = person.replace(/\(.*?\)/g, '').trim().split(/\s+/)
  return words[words.length - 1] || person
}

/** `{Classic person} on {Target}: "{short fragment}"` (email-copy.md), with an ellipsis when shortened. */
export function classicSubject(classic: Acclaim, targetTitle: string): string {
  const words = classic.quote.trim().split(/\s+/)
  const fragment = words.length <= 8 ? classic.quote.trim() : `${words.slice(0, 8).join(' ').replace(/[,;:.]+$/, '')}…`
  return `${surname(classic.source)} on ${targetTitle}: "${fragment}"`
}

export function openingLine(opening: 'finished' | 'stalled', sourceTitle: string): string {
  const title = `<em>${sourceTitle.replace(/[<>&]/g, '')}</em>`
  return opening === 'finished'
    ? `You finished ${title}.`
    : `Not every book suits every moment. If ${title} has stalled, this one may be the better fit for now.`
}

export async function chooseNextBook(input: {
  sourceId: string
  sourceTitle: string
  opening: 'finished' | 'stalled'
  opened: ReadonlySet<string>
  books: ReadonlyMap<string, CatalogueBook>
  loaders: NextBookLoaders
  startUrl(bookId: string): string
  art(bookId: string): { art_url: string; art_alt: string }
}): Promise<NextBookChoice | null> {
  const pairing = PAIRINGS.find(entry => entry.after === input.sourceId)
  if (!pairing) return null
  for (const target of pairing.next) {
    const book = input.books.get(target.book_id)
    if (!book || book.discoveryAvailable === false || target.blocked_until || isBookTemporarilyHeld(target.book_id)) continue
    if (input.opened.has(target.book_id)) continue
    const hook = (await input.loaders.hook(target.book_id))?.trim()
    if (!hook) continue
    let classic: Acclaim | null = null
    if (target.classic_acclaim) {
      const entries = await input.loaders.acclaim(target.book_id)
      classic = entries?.find(entry => entry.source === target.classic_acclaim!.source) ?? null
    }
    const lead = leadCardFor(target)
    const common = {
      opening_line: openingLine(input.opening, input.sourceTitle),
      target_title: book.title,
      target_author: book.author ?? '',
      reason: target.reason,
      hook,
      start_url: input.startUrl(target.book_id),
      classic_quote: classic?.quote ?? '',
      classic_source: classic?.source ?? '',
      classic_context: classic?.context ?? '',
      ...input.art(target.book_id),
    }
    if (lead) {
      return {
        template: 'next-book',
        targetId: target.book_id,
        vars: {
          ...common,
          subject: target.subject,
          lead_quote: lead.display ?? lead.quote,
          lead_label: lead.display ? '' : lead.label,
          lead_person: lead.person,
          lead_context: cardContext(lead),
        },
      }
    }
    if (classic) {
      return {
        template: 'next-book-classic-lead',
        targetId: target.book_id,
        // A pairing written without a lead card already has the classic subject.
        vars: { ...common, subject: target.lead_card === null ? target.subject : classicSubject(classic, book.title) },
      }
    }
  }
  return null
}
