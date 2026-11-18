// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PdfBookSwitcher } from './PdfBookSwitcher'
const mocks = vi.hoisted(() => ({ shelf: vi.fn(), account: vi.fn(), handoff: vi.fn(), catalogueRows: vi.fn(() => []), assign: vi.fn() }))
vi.mock('../../LabBookSwitcher', () => ({ LabBookSwitcher: ({ rows, loading, error, onSelect }: any) => <div><span>{loading ? 'loading' : 'ready'}</span><span>{error}</span>{rows.map((row: any) => <button key={row.bookId} onClick={() => onSelect(row)}>{row.title}</button>)}</div> }))
vi.mock('../../userBook/ownShelf', () => ({ readOwnShelf: mocks.shelf, ownReadingNow: (rows: unknown) => rows }))
vi.mock('../../userBook/ownSync', () => ({ ownReadingNowWithAccount: mocks.account }))
vi.mock('../../../preReader/quickBookSwitcher', () => ({ ownQuickBookRows: (rows: unknown) => rows, withOwnBookRows: (rows: unknown[], own: unknown[]) => [...rows, ...own], quickBookRows: mocks.catalogueRows, quickBookPositions: () => ({}), quickBookCompletedIds: () => new Set() }))
vi.mock('../../../utils/publicBooks', () => ({ registeredPublicEntries: () => [], fetchPublicBooksIndex: () => Promise.resolve([]) }))
vi.mock('../../../preReader/continueHandoff', () => ({ continueHandoff: mocks.handoff }))
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.clearAllMocks(); sessionStorage.clear() })
const pending = () => new Promise<any>(() => {})
const row = (title: string) => ({ bookId: title, title, href: '/reader?userBook=12345678', target: {} })
const props = { owner: 'owner-a', bookId: 'userbook-12345678', title: 'Current PDF', chapterLabel: 'Chapter One', onClose: () => {} }
const setup = () => { vi.stubGlobal('fetch', vi.fn(pending)); mocks.shelf.mockResolvedValue([]); mocks.account.mockImplementation(pending); mocks.catalogueRows.mockReturnValue([]) }
it('paints the local shelf while remote loading hangs and bounds its loading state', async () => {
  vi.useFakeTimers(); setup(); mocks.shelf.mockResolvedValue([row('Local book')])
  render(<PdfBookSwitcher {...props} beforeLeave={() => {}} />)
  await act(async () => {})
  expect(screen.getByText('Local book')).toBeTruthy()
  await act(async () => { vi.advanceTimersByTime(4000) })
  expect(screen.getByText('ready')).toBeTruthy()
  expect(screen.getByText('Showing books saved on this device.')).toBeTruthy()
})
it('suppresses stale owner rows and late account responses after an owner change', async () => {
  setup(); let oldResolve: (value: unknown) => void = () => {}
  mocks.shelf.mockImplementation((owner: string) => Promise.resolve([row(owner)]))
  mocks.account.mockImplementation((owner: string) => owner === 'owner-a' ? new Promise(resolve => { oldResolve = resolve }) : pending())
  const { rerender } = render(<PdfBookSwitcher {...props} beforeLeave={() => {}} />)
  await act(async () => {}); expect(screen.getByText('owner-a')).toBeTruthy()
  rerender(<PdfBookSwitcher {...props} owner="owner-b" beforeLeave={() => {}} />)
  expect(screen.queryByText('owner-a')).toBeNull()
  await act(async () => { oldResolve([row('stale account book')]) })
  expect(screen.queryByText('stale account book')).toBeNull()
  expect(screen.getByText('owner-b')).toBeTruthy()
  expect(mocks.shelf).toHaveBeenLastCalledWith('owner-b')
})
it('does not leave or save the outgoing source if the target handoff cannot be established', async () => {
  setup(); mocks.catalogueRows.mockReturnValue([{ bookId: 'bad', title: 'Unavailable book', target: {} }] as never); mocks.handoff.mockReturnValue(null)
  const beforeLeave = vi.fn()
  render(<PdfBookSwitcher {...props} beforeLeave={beforeLeave} />)
  fireEvent.click(screen.getByText('Unavailable book'))
  expect(beforeLeave).not.toHaveBeenCalled()
  expect(screen.getByText('That saved place is temporarily unavailable.')).toBeTruthy()
})
it('saves the current PDF source before navigating to a selected own book', async () => {
  setup(); mocks.shelf.mockResolvedValue([row('Own book')]); const beforeLeave = vi.fn()
  const actualWindow = window
  vi.stubGlobal('window', new Proxy(actualWindow, { get: (target, key) => key === 'location' ? { assign: mocks.assign } : Reflect.get(target, key) }))
  render(<PdfBookSwitcher {...props} beforeLeave={beforeLeave} />)
  await act(async () => {})
  fireEvent.click(screen.getByText('Own book'))
  expect(beforeLeave).toHaveBeenCalledOnce()
  expect(mocks.assign).toHaveBeenCalledWith('/reader?userBook=12345678&sharedReader=1')
  expect(beforeLeave.mock.invocationCallOrder[0]).toBeLessThan(mocks.assign.mock.invocationCallOrder[0])
})
it('clears its fallback deadline after both catalogue and account finish', async () => {
  vi.useFakeTimers(); setup(); mocks.account.mockResolvedValue([])
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ books: [] }) })))
  render(<PdfBookSwitcher {...props} beforeLeave={() => {}} />)
  await act(async () => {})
  expect(screen.getByText('ready')).toBeTruthy()
  await act(async () => { vi.advanceTimersByTime(5000) })
  expect(screen.queryByText('Showing books saved on this device.')).toBeNull()
})
