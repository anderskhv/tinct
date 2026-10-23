// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { OwnTextCardsSync } from './ownTextCardsSync'
import { PdfOriginalTalkCard, pdfTalkConversations } from './PdfOriginalTalkCard'
import { appendLabChatTurnTo } from '../labChatHistory'
import { USER_EDITION_FORMAT, PDF_TEXT_CONVERTER } from './userEdition'

const HEX = 'ab'.repeat(12), FILE = '1'.repeat(32), OWNER = 'owner-a'
const mocks = vi.hoisted(() => ({ start: vi.fn(async () => ({})), stop: vi.fn(), options: null as null | { recordMessage: (message: unknown) => void } }))
vi.mock('../../hooks/useVoiceSession', () => ({ useVoiceSession: (options: unknown) => {
  mocks.options = options as typeof mocks.options
  return { start: mocks.start, stop: mocks.stop, activity: 'idle', connection: 'idle', micMuted: false,
    isActive: false, error: null, getAssistantLevel: () => null, setMicMuted: vi.fn() }
} }))
vi.mock('./ownAccount', async importOriginal => {
  const actual = await importOriginal<typeof import('./ownAccount')>()
  return { ...actual, ownBookToken: async () => 'token', listAccountBooks: async () => [{ id: FILE, type: 'pdf', sha256: HEX + '0'.repeat(40) }] }
})
const auth = (owner: string) => localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: owner } }))
beforeEach(() => { localStorage.clear(); auth(OWNER); mocks.start.mockClear(); mocks.stop.mockClear(); mocks.options = null })
afterEach(() => { cleanup(); localStorage.clear() })

it('starts existing Talk only on a reader tap, persists turns into the shared private canonical chat, and stops on close', async () => {
  const textMode = new OwnTextCardsSync(HEX, OWNER, { format: USER_EDITION_FORMAT, converter: PDF_TEXT_CONVERTER,
    source: 'pdf', title: 'Book', author: '', language: 'en', chapters: [], droppedImages: 0 }, async () => null, vi.fn() as typeof fetch, FILE)
  const textRow = appendLabChatTurnTo([], `userbook-${HEX}`, { id: 'textvoice', role: 'user', content: 'Tinct text chapter three',
    timestamp: Date.now(), bookId: `userbook-${HEX}`, source: 'voice' }, 3)
  expect(textMode.persist(textRow)).toBe(true)
  textMode.dispose()
  const chat = new OwnTextCardsSync(HEX, OWNER, null, async () => null, vi.fn() as typeof fetch, FILE)
  const close = vi.fn()
  const { unmount, rerender } = render(<PdfOriginalTalkCard hex={HEX} owner={OWNER} fileId={FILE} chat={chat} page={3} text="Private original page." onClose={close} />)
  expect(mocks.start).not.toHaveBeenCalled()
  const start = await screen.findByRole('button', { name: 'Start Talk' })
  await vi.waitFor(() => expect(start.hasAttribute('disabled')).toBe(false))
  fireEvent.click(start)
  expect(mocks.start).toHaveBeenCalledTimes(1)
  act(() => mocks.options?.recordMessage({ id: 'voice1', role: 'user', content: 'What does this page say?', timestamp: Date.now(), bookId: `userbook-${HEX}`, source: 'voice' }))
  expect(pdfTalkConversations(chat.read())).toMatchObject([{ page: 3, localOnly: true, turns: [{ content: 'What does this page say?' }] }])
  expect(chat.readAll()).toHaveLength(2)
  expect(pdfTalkConversations(chat.readAll())).toMatchObject([
    { page: null, turns: [{ content: 'Tinct text chapter three' }] },
    { page: 3, turns: [{ content: 'What does this page say?' }] },
  ])
  expect(screen.getByText('Saved on this device')).toBeTruthy()
  auth('owner-b')
  rerender(<PdfOriginalTalkCard hex={HEX} owner={OWNER} fileId={FILE} chat={chat} page={3} text="Private original page." onClose={close} />)
  expect(screen.queryByText('What does this page say?')).toBeNull()
  act(() => mocks.options?.recordMessage({ id: 'voice2', role: 'assistant', content: 'Private answer.', timestamp: Date.now(), bookId: `userbook-${HEX}`, source: 'voice' }))
  expect(chat.read()).toEqual([])
  unmount()
  expect(mocks.stop).toHaveBeenCalled()
  chat.dispose()
})
