/** Build default is OFF; a release candidate can opt in with VITE_SHARED_READER_DEFAULT=1. */
export const SHARED_READER_PARAM = 'sharedReader'
export const SHARED_READER_DEFAULT = import.meta.env.VITE_SHARED_READER_DEFAULT === '1'

export function sharedReaderEnabled(search: string, defaultOn = SHARED_READER_DEFAULT): boolean {
  const override = new URLSearchParams(search).get(SHARED_READER_PARAM)
  return override === '1' ? true : override === '0' ? false : defaultOn
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
