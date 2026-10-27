import type { VerifiedPrimerResource } from './model'
/** Accept only complete editorial verification records, never generated suggestions. */
export function usablePrimerResource(value: VerifiedPrimerResource): boolean {
  try {
    const url = new URL(value.url)
    return url.protocol === 'https:' && !url.username && !url.password
      && !/(^|\/)(search|results)(\/|$)/i.test(url.pathname)
      && [value.title, value.creator, value.format, value.relevance, value.spoilerNote].every(text => typeof text === 'string' && text.trim().length > 0)
      && Number.isFinite(Date.parse(value.verifiedAt))
      && (value.durationSeconds === undefined || Number.isInteger(value.durationSeconds) && value.durationSeconds > 0)
  } catch { return false }
}
