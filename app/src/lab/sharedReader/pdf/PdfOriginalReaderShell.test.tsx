// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import { createRequire } from 'node:module'
import { PdfOriginalReaderShell, contentsPages, contentsUnitIndexes, type PdfOriginalReaderServices } from './PdfOriginalReaderShell'
import { readLabPrefs, writeLabPrefs } from '../../labPrefs'
import type { PdfOriginalUnitRules } from './pdfOriginalUnits'

const require = createRequire(import.meta.url)
require('../../../../public/lab/addbook/js/margin.js')
const margin = (globalThis as typeof globalThis & { TinctMargin: PdfOriginalUnitRules }).TinctMargin

vi.mock('./PdfOriginalSurface', () => ({
  PdfOriginalSurface: ({ onDocument, onOutline, onPageText, onVisiblePlace, onSelection, requestedPlace }: {
    onDocument: (count: number) => void; onPageText: (page: number, text: string) => void
    onOutline?: (outline: Array<{ title: string; page: number; items: [] }>) => void
    onVisiblePlace: (place: { page: number; frac: number }) => void
    onSelection: (selection: { page: number; text: string; rects: [number, number, number, number, number][] }) => void
    requestedPlace?: { page: number; frac: number }
  }) => {
    useEffect(() => { onDocument(3); onPageText(1, 'A page with usable text.'); onVisiblePlace({ page: 1, frac: .3 }) }, [])
    return <div><button onClick={() => onSelection({ page: 1, text: 'Selected PDF sentence.', rects: [[1, .1, .2, .3, .04]] })}>Select PDF text</button><button onClick={() => onVisiblePlace({ page: 2, frac: 0 })}>Move to PDF page 2</button><button onClick={() => { onDocument(60); onOutline?.([{ title: 'Introduction', page: 1, items: [] }, { title: 'Chapter One', page: 11, items: [] }, { title: 'Chapter Two', page: 31, items: [] }]); onPageText(14, 'Real extracted text on page 14.'); onVisiblePlace({ page: 14, frac: 0 }) }}>Open outlined page 14</button><output data-testid="requested-pdf-place">{requestedPlace?.page || 0}</output><output data-testid="requested-pdf-frac">{requestedPlace?.frac ?? 0}</output></div>
  },
}))
vi.mock('../../../components/reader/SelectionDeskBar', () => ({
  SelectionDeskBar: ({ onAskQuestion, onExplain, onSwatch, onNote, onMore }: { onAskQuestion: (s: string) => void; onExplain: () => void; onSwatch: (c: 'sage') => void; onNote: () => void; onMore: (id: 'quiz') => void }) => <div>
    <button onClick={() => onAskQuestion('Why?')}>Ask this PDF</button><button onClick={onExplain}>Explain this PDF</button>
    <button onClick={() => onSwatch('sage')}>Highlight sage</button><button onClick={onNote}>Note PDF</button><button onClick={() => onMore('quiz')}>Quiz this PDF</button>
  </div>,
}))
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })

it('bounds a long PDF Contents list while retaining the current page and direct page jump', () => {
  const list = contentsPages(5000, 2450)
  expect(list).toContain(1)
  expect(list).toContain(2450)
  expect(list).toContain(5000)
  expect(list.length).toBeLessThan(35)
  expect(contentsUnitIndexes(400, 210)).toEqual(expect.arrayContaining([0, 210, 399]))
  expect(contentsUnitIndexes(400, 210).length).toBeLessThan(30)
})

it('keeps page/rect source context in selection actions, saves a completed card once, and reopens it from Notebook', async () => {
  const cards: PdfOriginalReaderServices['cards'] = []
  const ask = vi.fn(async (_selection: Parameters<PdfOriginalReaderServices['ask']>[0], _intent: string, _question?: string) => 'An answer grounded in the selected sentence.')
  const saveCard = vi.fn((selection: Parameters<PdfOriginalReaderServices['saveCard']>[0], kind: string, answer: string, _options?: Parameters<PdfOriginalReaderServices['saveCard']>[3]) => { cards.push({ id: 'saved-1', page: selection.page, text: selection.text, kind,
    turns: [{ role: 'user', content: 'Why?' }, { role: 'assistant', content: answer }], at: 12 }); return true })
  const services: PdfOriginalReaderServices = { marks: [], cards, saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), ask, saveCard }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Select PDF text'))
  fireEvent.click(screen.getByText('Ask this PDF'))
  await screen.findByText('An answer grounded in the selected sentence.')
  expect(ask).toHaveBeenCalledTimes(1)
  expect(ask.mock.calls[0][0]).toEqual({ page: 1, text: 'Selected PDF sentence.', rects: [[1, .1, .2, .3, .04]] })
  expect(saveCard).toHaveBeenCalledTimes(1)
  expect(saveCard.mock.calls[0][3]).toEqual({ question: 'Why?' })
  fireEvent.keyDown(window, { key: 'Escape' })
  fireEvent.click(screen.getByText('Notebook'))
  expect(screen.getByText('Original PDF page 1 · ask')).toBeTruthy()
  fireEvent.click(screen.getByText('Original PDF page 1 · ask'))
  expect(screen.getByTestId('requested-pdf-place').textContent).toBe('1')
  expect(screen.getByText('An answer grounded in the selected sentence.')).toBeTruthy()
})

it('uses the existing interactive quiz body and saves only after a completed source-page quiz', async () => {
  const quiz = JSON.stringify({ questions: [{ q: 'What was selected?', answer: 'A sentence.' }] })
  const ask = vi.fn(async () => quiz)
  const check = vi.fn(async (_source: Parameters<NonNullable<PdfOriginalReaderServices['askQuizCheck']>>[0], _quiz: Parameters<NonNullable<PdfOriginalReaderServices['askQuizCheck']>>[1]) => JSON.stringify({ verdict: 'right', feedback: 'Exactly.' }))
  const saveCard = vi.fn((_source: Parameters<PdfOriginalReaderServices['saveCard']>[0], _kind: string, _answer: string, _options?: Parameters<PdfOriginalReaderServices['saveCard']>[3]) => true)
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), ask, askQuizCheck: check, saveCard,
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Select PDF text'))
  fireEvent.click(screen.getByText('Quiz this PDF'))
  expect(await screen.findByText('What was selected?')).toBeTruthy()
  expect(saveCard).not.toHaveBeenCalled()
  fireEvent.change(screen.getByRole('textbox', { name: 'Your answer' }), { target: { value: 'A sentence.' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  await screen.findByText('Exactly.')
  expect(check).toHaveBeenCalledWith({ page: 1, text: 'Selected PDF sentence.', rects: [[1, .1, .2, .3, .04]] },
    { question: 'What was selected?', expected: 'A sentence.', why: undefined, answer: 'A sentence.' })
  fireEvent.click(screen.getByText('See your score →'))
  await waitFor(() => expect(saveCard).toHaveBeenCalledOnce())
  expect(saveCard.mock.calls[0][1]).toBe('quiz')
  expect(saveCard.mock.calls[0][2]).toContain('What was selected?')
  expect(saveCard.mock.calls[0][3]).toEqual({ data: { generatedQuiz: quiz } })
})

it('does not save a quiz when its answer check finishes after the card was dismissed', async () => {
  let finishCheck!: (text: string) => void
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null),
    ask: vi.fn(async () => JSON.stringify({ questions: [{ q: 'One question?', answer: 'One answer.' }] })),
    askQuizCheck: vi.fn(() => new Promise<string>(resolve => { finishCheck = resolve })), saveCard: vi.fn(() => true),
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Select PDF text'))
  fireEvent.click(screen.getByText('Quiz this PDF'))
  await screen.findByText('One question?')
  fireEvent.change(screen.getByRole('textbox', { name: 'Your answer' }), { target: { value: 'One answer.' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  expect(services.askQuizCheck).toHaveBeenCalledOnce()
  fireEvent.keyDown(window, { key: 'Escape' })
  finishCheck(JSON.stringify({ verdict: 'right', feedback: 'Yes.' }))
  await waitFor(() => expect(screen.queryByText('One question?')).toBeNull())
  expect(services.saveCard).not.toHaveBeenCalled()
})

it('aborts a dismissed answer and never saves a late provider response', async () => {
  let answer!: (value: string) => void
  const ask = vi.fn((_source: Parameters<PdfOriginalReaderServices['ask']>[0], _kind: string, _question?: string, signal?: AbortSignal) =>
    new Promise<string>(resolve => { answer = resolve; signal?.addEventListener('abort', () => resolve('A late answer.')) }))
  const saveCard = vi.fn(() => true)
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), ask, saveCard,
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Select PDF text'))
  fireEvent.click(screen.getByText('Explain this PDF'))
  expect(ask).toHaveBeenCalledOnce()
  fireEvent.keyDown(window, { key: 'Escape' })
  answer('A late answer.')
  await waitFor(() => expect(screen.queryByText('A late answer.')).toBeNull())
  expect(ask.mock.calls[0][3]?.aborted).toBe(true)
  expect(saveCard).not.toHaveBeenCalled()
})

it('shows live private Talk only with usable page text and tears it down on page change', () => {
  const unmount = vi.fn()
  const TalkCard = ({ page, text }: { page: number; text: string; onClose: () => void }) => {
    useEffect(() => () => unmount(), [])
    return <p>Talking about page {page}: {text}</p>
  }
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), ask: vi.fn(async () => null), saveCard: vi.fn(() => false), TalkCard,
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByText('Talk'))
  expect(screen.getByText('Talking about page 1: A page with usable text.')).toBeTruthy()
  fireEvent.click(screen.getByText('Move to PDF page 2'))
  expect(screen.queryByText('Talking about page 1: A page with usable text.')).toBeNull()
  expect(unmount).toHaveBeenCalledOnce()
})

it('offers page navigation and theme selection, but page actions only when pdf.js supplies usable text', async () => {
  writeLabPrefs({ ...readLabPrefs('desktop'), theme: 'dark' }, 'desktop')
  render(<PdfOriginalReaderShell title="Scan" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} />)
  expect(screen.getByTestId('lab-root').getAttribute('data-theme')).toBe('dark')
  fireEvent.click(screen.getByText('Contents'))
  fireEvent.click(await screen.findByText('Page 3'))
  expect(screen.getByTestId('requested-pdf-place').textContent).toBe('3')
  fireEvent.click(screen.getByLabelText('Reading settings'))
  fireEvent.click(screen.getByLabelText('Book'))
  expect(screen.getByTestId('lab-root').getAttribute('data-theme')).toBe('book')
  expect(readLabPrefs('desktop').theme).toBe('book')
  expect(localStorage.getItem('tinct-pdf-original-theme')).toBeNull()
  fireEvent.click(screen.getByLabelText('Close panel'))
  fireEvent.click(screen.getByTestId('lab-super'))
  await waitFor(() => expect(screen.queryByText('Summarize this page')).toBeNull())
})

it('Copy all exports every PDF mark and ordered card Q/A even when the Notebook is filtered', async () => {
  const writeText = vi.fn(async (_text: string) => {})
  const restore = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const services: PdfOriginalReaderServices = {
    marks: [{ id: 'mark-one', page: 1, rects: [[.1, .45, .2, .03]], text: 'A marked line.', note: 'My note.', color: 'sage', at: 10 }],
    cards: [{ id: 'card-one', page: 2, text: 'A passage on page 2.', kind: 'quiz', at: 11, rects: [[2, .1, .62, .3, .04]],
      turns: [{ role: 'user', content: 'Why?' }, { role: 'assistant', content: 'Because.' }, { role: 'user', content: 'And then?' }, { role: 'assistant', content: 'It follows.' }] }],
    saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true), removeMark: vi.fn(() => null), removeCard: vi.fn(() => restore),
    saveCard: vi.fn(() => true), ask: vi.fn(async () => null),
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Notebook'))
  fireEvent.click(screen.getByText('My notes'))
  expect(screen.queryByText('Original PDF page 2 · quiz')).toBeNull()
  fireEvent.click(screen.getByText('Copy all'))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  const markdown = writeText.mock.calls[0][0]
  expect(markdown).toContain('2 entries')
  expect(markdown).toContain('> A marked line.')
  expect(markdown).toContain('My note.')
  expect(markdown).toMatch(/\*\*Q\.\*\* Why\?[\s\S]*\*\*A\.\*\* Because\.[\s\S]*\*\*Q\.\*\* And then\?[\s\S]*\*\*A\.\*\* It follows\./)
  fireEvent.click(screen.getByText('AI'))
  fireEvent.click(screen.getByRole('button', { name: 'Delete quiz on page 2' }))
  expect(screen.queryByText('Original PDF page 2 · quiz')).toBeNull()
  fireEvent.click(screen.getByText('Copy all'))
  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2))
  expect(writeText.mock.calls[1][0]).not.toContain('It follows.')
  fireEvent.click(screen.getByText('Undo'))
  expect(screen.getByText('Could not restore entry.')).toBeTruthy()
  expect(screen.queryByText('Original PDF page 2 · quiz')).toBeNull()
  fireEvent.click(screen.getByText('Undo'))
  expect(restore).toHaveBeenCalledTimes(2)
  fireEvent.click(screen.getByText('Original PDF page 2 · quiz'))
  expect(screen.getByTestId('requested-pdf-place').textContent).toBe('2')
  expect(screen.getByTestId('requested-pdf-frac').textContent).toBe('0.62')
})

it('includes device-only Talk turns in PDF Notebook export without offering deletion', async () => {
  const writeText = vi.fn(async (_text: string) => {})
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], talkConversations: [{ id: 'talk-1', page: 1, at: 10, localOnly: true,
      turns: [{ role: 'user', content: 'What does this say?' }, { role: 'assistant', content: 'It describes a page.' }] }],
    saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true), removeMark: vi.fn(() => null), removeCard: vi.fn(() => null),
    saveCard: vi.fn(() => false), ask: vi.fn(async () => null),
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Notebook'))
  expect(screen.getByText('Original PDF page 1 · Talk · Saved on this device')).toBeTruthy()
  expect(screen.queryByRole('button', { name: /Delete Talk/ })).toBeNull()
  fireEvent.click(screen.getByText('Copy all'))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  expect(writeText.mock.calls[0][0]).toMatch(/Saved on this device[\s\S]*\*\*Q\.\*\* What does this say\?[\s\S]*\*\*A\.\*\* It describes a page\./)
  fireEvent.click(screen.getByText('Original PDF page 1 · Talk · Saved on this device'))
  expect(screen.getByText(/You: What does this say/)).toBeTruthy()
})

it('requires an explicit owner claim before older unassigned Talk turns appear', () => {
  const adoptRecoverableTalk = vi.fn(() => true)
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], talkConversations: [], recoverableTalkCount: 1, adoptRecoverableTalk,
    saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true), removeMark: vi.fn(() => null), removeCard: vi.fn(() => null),
    saveCard: vi.fn(() => false), ask: vi.fn(async () => null),
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Notebook'))
  expect(screen.getByText(/older Talk conversation has no account label/)).toBeTruthy()
  expect(adoptRecoverableTalk).not.toHaveBeenCalled()
  fireEvent.click(screen.getByText('Attach older Talk conversations'))
  expect(adoptRecoverableTalk).toHaveBeenCalledOnce()
})

it('grounds Primer and Catch me up in real contiguous unit pages and saves exact page ranges once', async () => {
  const askUnit = vi.fn(async (_source: Parameters<NonNullable<PdfOriginalReaderServices['askUnit']>>[0], action: string) => `${action} from original pages.`)
  const saveUnitCard = vi.fn(() => true)
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), saveCard: vi.fn(() => false), ask: vi.fn(async () => null),
    getPageText: vi.fn(async page => `Real extracted text on page ${page}.`), askUnit, saveUnitCard,
  }
  render(<PdfOriginalReaderShell title="Outlined PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} unitRules={margin} />)
  fireEvent.click(screen.getByText('Open outlined page 14'))
  fireEvent.click(screen.getByRole('button', { name: 'Contents' }))
  expect(screen.getByRole('group', { name: 'Reading sections' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Chapter Two · page 31' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Close panel' }))
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByText('Primer · Chapter One'))
  expect(await screen.findByText('primer from original pages.')).toBeTruthy()
  const primer = askUnit.mock.calls[0][0]
  expect(primer).toEqual({ unit: { key: 'outline-1', title: 'Chapter One', from: 11, to: 30 },
    atPage: 14, pages: Array.from({ length: 20 }, (_, index) => ({ n: index + 11, text: `Real extracted text on page ${index + 11}.` })) })
  expect(saveUnitCard).toHaveBeenCalledWith(primer, 'primer', 'primer from original pages.')
  fireEvent.keyDown(window, { key: 'Escape' })
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByText('Catch me up'))
  expect(await screen.findByText('catchup from original pages.')).toBeTruthy()
  const catchup = askUnit.mock.calls[1][0]
  expect(catchup.pages.map(page => page.n)).toEqual(Array.from({ length: 10 }, (_, index) => index + 1))
  expect(catchup.atPage).toBe(14)
  expect(saveUnitCard).toHaveBeenCalledWith(catchup, 'catchup', 'catchup from original pages.')
  expect(saveUnitCard).toHaveBeenCalledTimes(2)
})
