// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  render: vi.fn(),
  preview: vi.fn(() => ({ mount: null, bookId: null })),
  prepare: vi.fn(async () => null as string | null),
  migrate: vi.fn(async () => {}),
  latest: vi.fn(async () => null as string | null),
  frame: vi.fn(),
}))

vi.mock('./utils/internalTraffic', () => ({}))
vi.mock('./utils/nativeBooks', () => ({ initializeNativeBooks: vi.fn() }))
vi.mock('./utils/publicBooks', () => ({ READER_HANDOFF_KEY: 'tinct:reader-handoff', preparePublicBooksForReader: mocks.prepare }))
vi.mock('./utils/nativeEntry', () => ({ nativeEntryDestination: () => null }))
vi.mock('./utils/registerReaderOffline', () => ({ registerReaderOffline: vi.fn() }))
vi.mock('../public/lab/display-profile.js', () => ({ readEinkProfile: () => false }))
vi.mock('react-dom/client', () => ({ default: { createRoot: () => ({ render: mocks.render }) } }))
vi.mock('./lab/LabApp', () => ({ LabApp: () => null }))
vi.mock('./lab/userBook/userBookId', () => ({ userBookFromSearch: (search: string) => new URLSearchParams(search).get('userBook') }))
vi.mock('./lab/marginPreview/marginPreviewMount', () => ({ marginPreviewMountForPage: mocks.preview }))
vi.mock('./lab/labChrome', () => ({ isLabPhoneSurface: () => false, labPhoneSurfaceInput: () => ({}) }))
vi.mock('./lab/labRoute', () => ({ labLayoutOverride: () => null }))
vi.mock('./lab/marginPreview/marginPreviewModel', () => ({ isMarginPreviewBook: () => true }))
vi.mock('./data/bookRegistry', () => ({ getBook: () => ({ id: 'frankenstein' }) }))
vi.mock('./lab/labLibraryBoot', () => ({ readCachedSupabaseUser: () => null }))
vi.mock('./utils/nativePlatform', () => ({ isNativeCapacitor: () => false }))
vi.mock('./utils/libraryPreviewWarmup', () => ({ warmLibraryPreview: vi.fn() }))
vi.mock('./cards/warmCards', () => ({ warmAccountCards: vi.fn() }))
vi.mock('./utils/readerLoadTrace', () => ({ startReaderLoadTrace: vi.fn() }))
vi.mock('./lab/labStoredContentMigrations', () => ({ storedContentMigrations: mocks.migrate }))
vi.mock('./lab/continueLatest', () => ({ continueLatestDestination: mocks.latest }))
vi.mock('./desktopCommands', () => ({ loadDesktopExperience: vi.fn() }))
vi.mock('./utils/staleChunkRecovery', () => ({ installStaleChunkRecovery: vi.fn() }))
vi.mock('./lab/marginPreview/marginPreviewFrame', () => ({ startMarginPreviewFrame: mocks.frame }))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  document.body.innerHTML = '<div id="root"></div>'
})
afterEach(() => {
  window.history.replaceState(null, '', '/')
  localStorage.clear()
  sessionStorage.clear()
})

async function enter(search: string) {
  window.history.replaceState(null, '', `/reader${search}`)
  await import('./main')
  await vi.waitFor(() => expect(mocks.render).toHaveBeenCalledTimes(1))
  const strict = mocks.render.mock.lastCall?.[0]
  return strict.props.children
}

it('bypasses the old preview before its sticky opt-in or chapter handoff can be consumed', async () => {
  const search = '?book=frankenstein&chapter=3&paragraph=4&word=8&margin=1&sharedReader=1'
  localStorage.setItem('tinct:margin-preview', '1')
  sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'frankenstein' }))
  const child = await enter(search)
  expect(mocks.prepare).toHaveBeenCalledOnce()
  expect(mocks.migrate).toHaveBeenCalledOnce()
  expect(mocks.preview).not.toHaveBeenCalled()
  expect(mocks.frame).not.toHaveBeenCalled()
  expect(child.props.sharedReader).toBe(true)
  expect(window.location.search).toBe(search)
  expect(localStorage.getItem('tinct:margin-preview')).toBe('1')
  expect(sessionStorage.getItem('tinct:lab-reader-handoff')).not.toBeNull()
})

it('keeps flag-off routing through the old preview entry', async () => {
  const child = await enter('?book=frankenstein&margin=1')
  expect(mocks.preview).toHaveBeenCalledOnce()
  expect(mocks.migrate).toHaveBeenCalledOnce()
  expect(child.props.sharedReader).toBeUndefined()
})

it('keeps an own-book link on the existing UserBookReader route even with the private switch', async () => {
  const child = await enter('?userBook=abcdef&sharedReader=1&pages=1')
  expect(mocks.preview).not.toHaveBeenCalled()
  expect(mocks.prepare).not.toHaveBeenCalled()
  expect(child.props.children.props.hex).toBe('abcdef')
  expect(child.props.children.props.sharedReader).toBe(true)
  expect(window.location.search).toBe('?userBook=abcdef&sharedReader=1&pages=1')
})

it('offers Continue its ordinary no-book query when the private switch is present', async () => {
  await enter('?layout=desktop&sharedReader=1')
  expect(mocks.latest).toHaveBeenCalledWith({ pathname: '/reader', search: '?layout=desktop' })
  expect(mocks.preview).not.toHaveBeenCalled()
})
