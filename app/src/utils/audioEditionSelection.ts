import type { Edition } from '../types'

/**
 * Narration may fall back to another edition only when it keeps the language
 * the reader selected. An edition with its own audio always narrates itself.
 */
export function matchingAudioEditions(primaryEditionKey: string, editions: Edition[]): Edition[] {
  const primary = editions.find(edition => edition.key === primaryEditionKey)
  if (!primary) return []
  return editions.filter(edition => edition.hasAudio && edition.language === primary.language)
}

export function resolveAudioEditionKey(
  requestedAudioEditionKey: string | null | undefined,
  primaryEditionKey: string,
  editions: Edition[],
): string {
  const candidates = matchingAudioEditions(primaryEditionKey, editions)
  if (candidates.some(edition => edition.key === primaryEditionKey)) return primaryEditionKey
  if (requestedAudioEditionKey && candidates.some(edition => edition.key === requestedAudioEditionKey)) {
    return requestedAudioEditionKey
  }
  return candidates[0]?.key ?? primaryEditionKey
}

export function resolvedAudioIsAvailable(
  audioEditionKey: string,
  primaryEditionKey: string,
  editions: Edition[],
): boolean {
  return matchingAudioEditions(primaryEditionKey, editions).some(edition => edition.key === audioEditionKey)
}
