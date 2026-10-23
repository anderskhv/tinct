/** Private, per-URL entry for the shared reader rollout. Never persisted. */
export const SHARED_READER_PARAM = 'sharedReader'

export function sharedReaderEnabled(search: string): boolean {
  return new URLSearchParams(search).get(SHARED_READER_PARAM) === '1'
}

/** Let the existing no-book Continue decision see its ordinary query. */
export function sharedReaderContinueSearch(search: string): string {
  const params = new URLSearchParams(search)
  params.delete(SHARED_READER_PARAM)
  const rest = params.toString()
  return rest ? `?${rest}` : ''
}

/** Carry the private entry through internal reader redirects, never other destinations. */
export function sharedReaderDestination(destination: string): string {
  if (!destination.startsWith('/') || destination.startsWith('//')) return destination
  const url = new URL(destination, 'https://tinct.app')
  if (url.pathname !== '/reader') return destination
  url.searchParams.set(SHARED_READER_PARAM, '1')
  return `${url.pathname}${url.search}${url.hash}`
}
