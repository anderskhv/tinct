// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { warmLibraryPreview } from './libraryPreviewWarmup'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  sessionStorage.clear()
})

function setup(saveData = false, readerReady = true) {
  document.body.replaceChildren()
  if (readerReady) document.body.innerHTML = '<div data-reader-ready="true"></div>'
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
  expect(requests).toHaveBeenCalledWith(urls[0], expect.objectContaining({ priority: 'low', signal: expect.any(AbortSignal) }))
})

test('does not spend bandwidth when Save Data is enabled', () => {
  const requests = setup(true)
  warmLibraryPreview()
  expect(requests).not.toHaveBeenCalled()
})

test('preloads the public library for ordinary reader visits', () => {
  const requests = setup()
  warmLibraryPreview()
  expect(requests).toHaveBeenCalled()
})

test('aborts active downloads and stops further batches after leaving the page', async () => {
  setup()
  let release!: () => void
  const body = new Promise<void>(resolve => { release = resolve })
  const requests = vi.fn(async (_url: string, _options: RequestInit) => ({ arrayBuffer: () => body }))
  vi.stubGlobal('fetch', requests)
  warmLibraryPreview()
  expect(requests).toHaveBeenCalledTimes(2)
  const signal = requests.mock.calls[0][1].signal
  window.dispatchEvent(new Event('pagehide'))
  expect(signal?.aborted).toBe(true)
  release()
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(requests).toHaveBeenCalledTimes(2)
})

test('stops when a request rejects before pagehide, as WebKit does at navigation start', async () => {
  setup()
  let reject!: (reason: Error) => void
  const first = new Promise<never>((_resolve, fail) => { reject = fail })
  const requests = vi.fn((_url: string, _options: RequestInit) => first)
  vi.stubGlobal('fetch', requests)
  warmLibraryPreview()
  expect(requests).toHaveBeenCalledTimes(2)
  reject(new TypeError('Load failed'))
  await new Promise(resolve => setTimeout(resolve,0))
  expect(requests.mock.calls[0][1].signal?.aborted).toBe(true)
  expect(requests).toHaveBeenCalledTimes(2)
})

test('waits for the reader’s first page before warming the library', async () => {
  vi.useFakeTimers()
  try {
    const requests = setup(false, false)
    warmLibraryPreview()
    await vi.advanceTimersByTimeAsync(2000)
    expect(requests).not.toHaveBeenCalled()
    document.body.innerHTML = '<div data-reader-ready="true"></div>'
    await vi.advanceTimersByTimeAsync(300)
    expect(requests).toHaveBeenCalled()
  } finally {
    vi.useRealTimers()
  }
})

test('warms anyway once a reader that never becomes ready has had its time', async () => {
  vi.useFakeTimers()
  try {
    const requests = setup(false, false)
    warmLibraryPreview()
    await vi.advanceTimersByTimeAsync(10500)
    expect(requests).toHaveBeenCalled()
  } finally {
    vi.useRealTimers()
  }
})
