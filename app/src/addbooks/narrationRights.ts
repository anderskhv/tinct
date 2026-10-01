import manifest from './narrationRights.json'
import danishManifest from './danishRights.json'
import { danishRightsReview, eligibleInDenmark } from './danishRights'

export interface NarrationRightsRecord {
  bookId: string
  editionKey: string
  status: string
  scope: string
  territories: string[]
  textReview: { jurisdiction: string; editionSha256: string }
  provider: string
  model: string
  voices: string[]
  providerTerms: { outputOwnership: string; restrictions: string[] }
  disclosure: string
  evidence: string[]
}

/**
 * Add imports live outside the public catalogue (ids in the `pd-<n>` namespace
 * or any edition with an Add rights record). Their narration needs its own
 * clearance; the text review alone never permits audio.
 */
export function isAddImportBook(bookId: string): boolean {
  return /^pd-\d+$/.test(bookId)
    || danishManifest.editions.some(review => review.bookId === bookId)
    || manifest.editions.some(record => record.bookId === bookId)
}

export function narrationRightsRecord(bookId: string, editionKey: string): NarrationRightsRecord | undefined {
  if (manifest.policyVersion !== 1) return undefined
  return manifest.editions.find(record => record.bookId === bookId && record.editionKey === editionKey)
}

/**
 * Fail-closed: generated narration of an Add import is permitted only with a
 * cleared record for the exact edition, provider and voice, tied to the same
 * edition hash as a still-eligible text review.
 */
export function importNarrationCleared(
  bookId: string, editionKey: string, provider: string | undefined, voiceId?: string,
  record = narrationRightsRecord(bookId, editionKey),
  textReview = danishRightsReview(bookId, editionKey),
): boolean {
  if (!record || record.status !== 'cleared-under-policy' || record.scope !== 'generated-narration-of-reviewed-text') return false
  if (!record.territories.length || !record.evidence.length || !record.disclosure) return false
  if (record.providerTerms?.outputOwnership !== 'assigned-to-customer') return false
  if (!provider || record.provider !== provider) return false
  if (voiceId !== undefined && !record.voices.includes(voiceId)) return false
  if (!textReview || !eligibleInDenmark(textReview)) return false
  return record.textReview.jurisdiction === 'DK' && /^[a-f0-9]{64}$/.test(record.textReview.editionSha256)
    && record.textReview.editionSha256 === textReview.editionSha256
}
