// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { afterEach, expect, test, vi } from 'vitest'
import { bootPreloads, libraryPageAssets, warmLibraryPreview } from './libraryPreviewWarmup'

const INDEX = readFileSync('public/lab/library_2/index.html', 'utf8')
const BOOT = readFileSync('public/lab/library_2/boot.js', 'utf8')

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  sessionStorage.clear()
  localStorage.clear()
})

function setup(saveData = false, readerReady = true, effectiveType = '4g') {
  document.body.replaceChildren()
  if (readerReady) document.body.innerHTML = '<div data-reader-ready="true"></div>'
  vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
  vi.stubGlobal('requestIdleCallback', (run: () => void) => { run(); return 1 })
  // The warm-up waits a settle time after the reader is ready; tests run it at once.
  const realSetTimeout = globalThis.setTimeout
  vi.stubGlobal('setTimeout', ((fn: () => void, ms?: number, ...rest: unknown[]) => realSetTimeout(fn, ms === 3000 ? 0 : ms, ...rest)) as typeof setTimeout)
  Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData, effectiveType } })
  const requests = vi.fn(async (url: string) => ({
    text: async () => url.endsWith('index.html') ? INDEX : /\/boot\.js/.test(url) ? BOOT : '',
    arrayBuffer: async () => new ArrayBuffer(0),
  }))
  vi.stubGlobal('fetch', requests)
  return requests
}

const warmed = (requests: ReturnType<typeof setup>) => requests.mock.calls.map(call => String(call[0]))
/** The warm-up starts a tick after the (stubbed) settle time. */
const started = () => new Promise(resolve => setTimeout(resolve, 0))

test('warms exactly what the library page lists, so the list can never drift from the page again', async () => {
  const requests = setup()
  warmLibraryPreview()
  const expected = libraryPageAssets(INDEX)
  expect(expected.length).toBeGreaterThan(30)
  expect(expected).toContain('/lab/library_2/boot.js' + /boot\.js(\?v=[^"]+)/.exec(INDEX)![1])
  expect(expected).toContain('/lab/library_2/app.js' + /app\.js(\?v=[^"]+)/.exec(INDEX)![1])
  expect(expected.some(url => /bookshelf\.css\?v=/.test(url))).toBe(true)
  await vi.waitFor(() => expect(warmed(requests)).toEqual(expect.arrayContaining(expected)))
  // Nothing under a tag the page (or its boot.js) does not use.
  const known = new Set([...expected, ...bootPreloads(BOOT)])
  for (const url of warmed(requests)) if (/\?v=/.test(url)) expect(known).toContain(url)
  expect(warmed(requests)).toContain('/lab/catalogue.json')
})

test('warms the engine bundles that the built boot.js preloads for a returning reader, after the page', async () => {
  // The build stamps the bundle list into boot.js (stamp-library-bridge-preloads.cjs); the source has only the bridge.
  expect(bootPreloads(BOOT)).toEqual([/library-2-reading\.js\?v=[^"'`]+/.exec(BOOT)![0].replace(/^/, '/lab/')])
  const stamped = BOOT + "\n;['/assets/index-AbCdEf12.js','/assets/reader-Zz9yY8xX.js'].forEach(h=>{const l=document.createElement('link');l.rel='modulepreload';l.href=h;});"
  const requests = setup()
  requests.mockImplementation(async (url: string) => ({
    text: async () => url.endsWith('index.html') ? INDEX : /\/boot\.js/.test(url) ? stamped : '',
    arrayBuffer: async () => new ArrayBuffer(0),
  }))
  warmLibraryPreview()
  const bundles = bootPreloads(stamped)
  expect(bundles).toEqual(['/lab/library-2-reading.js?v=' + /library-2-reading\.js\?v=([^"'`]+)/.exec(BOOT)![1], '/assets/index-AbCdEf12.js', '/assets/reader-Zz9yY8xX.js'])
  await vi.waitFor(() => expect(warmed(requests)).toEqual(expect.arrayContaining(bundles)))
  const urls = warmed(requests)
  expect(urls.indexOf('/assets/index-AbCdEf12.js')).toBeGreaterThan(urls.findIndex(url => /app\.js\?v=/.test(url)))
})

test('warms the page and the room first, then the desk the device will paint, accepting public same-origin artwork only', async () => {
  const requests = setup()
  localStorage.setItem('tinct:library-2-first-paint', JSON.stringify({
    v: 2, owner: 'a', bookId: 'frankenstein', cover: '/lab/library_2/assets/covers/frankenstein-480.webp', spine: 'green',
    art: { frankenstein: { u: '/lab/library_2/assets/covers/frankenstein-480.webp' }, odyssey: { u: '/covers/v2/odyssey.webp' }, own: { u: null } },
  }))
  sessionStorage.setItem('tinct:library-2-artwork', JSON.stringify([
    '/lab/library_2/assets/to-the-lighthouse.jpg', '/covers/v2/hamlet.webp',
    '/covers/v2/hamlet.webp', 'https://example.org/cover.jpg', '/api/private.jpg',
    '/covers/hamlet.webp?token=private', null,
  ]))
  warmLibraryPreview()
  await vi.waitFor(() => expect(requests.mock.calls.length).toBeGreaterThan(25))
  const urls = warmed(requests)
  expect(urls[0]).toBe('/lab/library_2/index.html')
  expect(urls[1]).toMatch(/^\/lab\/library_2\/assets\/table-(morning|afternoon|evening|night)-(wide|phone)\.jpg$/)
  expect(urls[2]).toBe('/lab/library_2/assets/covers/frankenstein-480.webp')
  expect(urls[3]).toBe('/covers/v2/odyssey.webp')
  expect(urls.slice(4, 6)).toEqual(['/lab/library_2/assets/to-the-lighthouse.jpg', '/covers/v2/hamlet.webp'])
  expect(urls.filter(url => url === '/covers/v2/hamlet.webp')).toHaveLength(1)
  expect(urls.some(url => /example|private|token=/.test(url))).toBe(false)
  expect(requests).toHaveBeenCalledWith(urls[0], expect.objectContaining({ priority: 'low', signal: expect.any(AbortSignal) }))
})

test('does not spend bandwidth when Save Data is enabled', () => {
  const requests = setup(true)
  warmLibraryPreview()
  expect(requests).not.toHaveBeenCalled()
})

test('does not spend bandwidth on a 2G-class connection', () => {
  const requests = setup(false, true, '2g')
  warmLibraryPreview()
  expect(requests).not.toHaveBeenCalled()
  const slow = setup(false, true, 'slow-2g')
  warmLibraryPreview()
  expect(slow).not.toHaveBeenCalled()
})

test('starts no earlier than three seconds after the reader is on screen', () => {
  vi.useFakeTimers()
  try {
    document.body.innerHTML = '<div data-reader-ready="true"></div>'
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
    vi.stubGlobal('requestIdleCallback', (run: () => void) => { run(); return 1 })
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: false, effectiveType: '4g' } })
    const requests = vi.fn(async () => ({ text: async () => INDEX, arrayBuffer: async () => new ArrayBuffer(0) }))
    vi.stubGlobal('fetch', requests)
    warmLibraryPreview()
    vi.advanceTimersByTime(2900)
    expect(requests).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(requests).toHaveBeenCalled()
  } finally {
    vi.useRealTimers()
  }
})

test('preloads the public library for ordinary reader visits', async () => {
  const requests = setup()
  warmLibraryPreview()
  await started()
  expect(requests).toHaveBeenCalled()
})

test('aborts active downloads and stops further batches after leaving the page', async () => {
  setup()
  let release!: () => void
  const body = new Promise<string>(resolve => { release = () => resolve(INDEX) })
  const requests = vi.fn(async (_url: string, _options: RequestInit) => ({ text: () => body, arrayBuffer: () => body }))
  vi.stubGlobal('fetch', requests)
  warmLibraryPreview()
  await started()
  expect(requests).toHaveBeenCalledTimes(2)
  const signal = requests.mock.calls[0][1].signal
  window.dispatchEvent(new Event('pagehide'))
  expect(signal?.aborted).toBe(true)
  release()
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(requests).toHaveBeenCalledTimes(2)
})

test('stops as a navigation starts (beforeunload), before pagehide: WebKit refuses and logs every request issued between the two', async () => {
  setup()
  let release!: () => void
  const body = new Promise<string>(resolve => { release = () => resolve(INDEX) })
  const requests = vi.fn(async (_url: string, _options: RequestInit) => ({ text: () => body, arrayBuffer: () => body }))
  vi.stubGlobal('fetch', requests)
  warmLibraryPreview()
  await started()
  expect(requests).toHaveBeenCalledTimes(2)
  window.dispatchEvent(new Event('beforeunload'))
  expect(requests.mock.calls[0][1].signal?.aborted).toBe(true)
  release()
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(requests).toHaveBeenCalledTimes(2)
})

test('stops when a request rejects before pagehide, as WebKit does at navigation start', async () => {
  setup()
  let reject!: (reason: Error) => void
  const failing = new Promise<never>((_resolve, r) => { reject = r })
  const requests = vi.fn(async () => ({ text: () => failing, arrayBuffer: () => failing }))
  vi.stubGlobal('fetch', requests)
  warmLibraryPreview()
  await started()
  expect(requests).toHaveBeenCalledTimes(2)
  reject(new Error('cancelled'))
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(requests).toHaveBeenCalledTimes(2)
})

test('waits for the reader to be ready before warming, bounded', () => {
  vi.useFakeTimers()
  try {
    const requests = setup(false, false)
    warmLibraryPreview()
    expect(requests).not.toHaveBeenCalled()
    document.body.innerHTML = '<div data-reader-ready="true"></div>'
    vi.advanceTimersByTime(300 + 3000)
    expect(requests).toHaveBeenCalled()
  } finally {
    vi.useRealTimers()
  }
})
