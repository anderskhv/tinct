// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { warmLibraryPreview } from './libraryPreviewWarmup'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  sessionStorage.clear()
  document.cookie = 'tinct_library_preview=;max-age=0'
})

function setup(saveData = false) {
  document.cookie = 'tinct_library_preview=1'
  vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
  vi.stubGlobal('requestIdleCallback', (run: () => void) => { run(); return 1 })
  Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData } })
  const requests = vi.fn(async () => ({ arrayBuffer: async () => new ArrayBuffer(0) }))
  vi.stubGlobal('fetch', requests)
  return requests
}

test('warms the room and selected cover before scripts, accepting public same-origin artwork only', async () => {
  const requests = setup()
  sessionStorage.setItem('tinct:library-2-artwork', JSON.stringify([
    '/lab/library_2/assets/to-the-lighthouse.jpg', '/covers/v2/hamlet.webp',
    '/covers/v2/hamlet.webp', 'https://example.org/cover.jpg', '/api/private.jpg',
    '/covers/hamlet.webp?token=private', null,
  ]))
  warmLibraryPreview()
  await vi.waitFor(() => expect(requests.mock.calls.length).toBeGreaterThan(25))
  const urls = requests.mock.calls.map(call => (call as unknown as [string])[0])
  expect(urls[0]).toMatch(/^\/lab\/library_2\/assets\/table-(morning|afternoon|evening|night)-(wide|phone)\.jpg$/)
  expect(urls[1]).toBe('/lab/library_2/assets/to-the-lighthouse.jpg')
  expect(urls[2]).toBe('/covers/v2/hamlet.webp')
  expect(urls.filter(url => url === '/covers/v2/hamlet.webp')).toHaveLength(1)
  expect(urls.some(url => /example|private|token=/.test(url))).toBe(false)
  expect(requests).toHaveBeenCalledWith(urls[0], { priority: 'low' })
})

test('does not spend bandwidth when Save Data is enabled', () => {
  const requests = setup(true)
  warmLibraryPreview()
  expect(requests).not.toHaveBeenCalled()
})

test('preloads the public library for ordinary reader visits', () => {
  const requests = setup()
  document.cookie = 'tinct_library_preview=;max-age=0'
  warmLibraryPreview()
  expect(requests).toHaveBeenCalled()
})
