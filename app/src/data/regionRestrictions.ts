/**
 * Books Tinct does not serve in some countries (`Book.restrictedCountries`):
 * works in the public domain where Tinct operates (Denmark/EU) but probably
 * still protected elsewhere, where our editions are derivative works.
 *
 * The rule (Anders, 16 Nov 2026): refuse only when the request's country is
 * known and listed. A missing or unknown country is allowed (fail open). The
 * country is decided per request and never stored, logged or sent anywhere.
 */
import { ALL_BOOKS } from './bookRegistry'
import type { Book } from '../types'

/** Book id → the countries it is not served in. Only books with a restriction appear. */
export function restrictionsFrom(books: Book[]): ReadonlyMap<string, ReadonlySet<string>> {
  const map = new Map<string, ReadonlySet<string>>()
  for (const book of books) {
    const countries = (book.restrictedCountries ?? []).map(code => code.toUpperCase()).filter(code => /^[A-Z]{2}$/.test(code))
    if (countries.length) map.set(book.id, new Set(countries))
  }
  return map
}

export const BOOK_COUNTRY_RESTRICTIONS = restrictionsFrom(ALL_BOOKS)

/** Every country some book is restricted in: for any other request the gate does nothing at all. */
export const RESTRICTED_COUNTRIES: ReadonlySet<string> = new Set([...BOOK_COUNTRY_RESTRICTIONS.values()].flatMap(set => [...set]))

/**
 * A two-letter country code, or null when it is missing or not a real
 * country. Cloudflare uses XX for "unknown" and T1 for Tor; both are unknown
 * here, and unknown is allowed.
 */
export function normalizeCountry(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const code = raw.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code) || code === 'XX' || code === 'T1') return null
  return code
}

/** Whether `bookId` has a country restriction at all (its responses must not be shared between countries). */
export function bookHasCountryRestriction(bookId: string, restrictions = BOOK_COUNTRY_RESTRICTIONS): boolean {
  return restrictions.has(bookId)
}

/** Whether `bookId` is not served to a request from `country`. Unknown country: never. */
export function isBookRestrictedIn(bookId: string, country: string | null, restrictions = BOOK_COUNTRY_RESTRICTIONS): boolean {
  if (!country) return false
  return restrictions.get(bookId)?.has(country) ?? false
}

/** The books not served to a request from `country`, sorted. Empty for an unknown country. */
export function restrictedBookIdsIn(country: string | null, restrictions = BOOK_COUNTRY_RESTRICTIONS): string[] {
  if (!country) return []
  return [...restrictions].filter(([, countries]) => countries.has(country)).map(([id]) => id).sort()
}
