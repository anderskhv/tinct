import manifest from './danishRights.json'

export interface DanishRightsReview {
  bookId: string
  editionKey: string
  reviewStatus: string
  basis: string
  contributorsComplete: boolean
  contributors: Array<{ name: string; role: string; deathYear: number | null; evidence: string }>
  editionAuditComplete: boolean
  specialCasesResolved: boolean
  scope: string
  sourceSha256: string
  editionSha256: string
  evidence: string[]
}

/** Conservative product gate, not a complete implementation of copyright law.
 * Unknown data, anonymous works, special terms and licences require review.
 * A catalogue's US public-domain flag never grants eligibility here. */
export function eligibleInDenmark(review: DanishRightsReview | undefined, year = new Date().getUTCFullYear()): boolean {
  if (!review || review.reviewStatus !== 'eligible-under-policy'
    || review.basis !== 'named-contributors-life-plus-70'
    || review.contributorsComplete !== true || review.editionAuditComplete !== true || review.specialCasesResolved !== true
    || review.scope !== 'original-text-only' || !review.evidence.length
    || !/^[a-f0-9]{64}$/.test(review.sourceSha256) || !/^[a-f0-9]{64}$/.test(review.editionSha256)
    || !review.contributors.length || !Number.isInteger(year)) return false
  return review.contributors.every(person => person.name && person.role && person.evidence
    && Number.isInteger(person.deathYear) && person.deathYear !== null
    && person.deathYear <= year - 71)
}

export function danishRightsReview(bookId: string, editionKey: string): DanishRightsReview | undefined {
  if (manifest.jurisdiction !== 'DK' || manifest.policyVersion !== 1) return undefined
  return manifest.editions.find(review => review.bookId === bookId && review.editionKey === editionKey)
}

/** True for `/data/editions/{bookId}-{editionKey}.json` of a currently eligible Add import. */
export function isReviewedImportEditionPath(pathname: string): boolean {
  if (manifest.jurisdiction !== 'DK' || manifest.policyVersion !== 1) return false
  const filename = pathname.startsWith('/data/editions/') ? pathname.slice('/data/editions/'.length) : ''
  return manifest.editions.some(review => filename === `${review.bookId}-${review.editionKey}.json` && eligibleInDenmark(review))
}
