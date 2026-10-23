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
  PdfOriginalSurface: ({ onDocument, onOutline, onPageText, onVisiblePlace, onPageEnd, onSelection, requestedPlace }: {
    onDocument: (count: number) => void; onPageText: (page: number, text: string) => void
    onOutline?: (outline: Array<{ title: string; page: number; items: [] }>) => void
    onVisiblePlace: (place: { page: number; frac: number }) => void
    onPageEnd?: (page: number, atEnd: boolean) => void
    onSelection: (selection: { page: number; text: string; rects: [number, number, number, number, number][] }) => void
    requestedPlace?: { page: number; frac: number }
  }) => {
    useEffect(() => { onDocument(3); onPageText(1, 'A page with usable text.'); onVisiblePlace({ page: 1, frac: .3 }) }, [])
    const openFinal = () => { onDocument(60); onOutline?.([{ title: 'Introduction', page: 1, items: [] }, { title: 'Chapter One', page: 11, items: [] }, { title: 'Chapter Two', page: 31, items: [] }]); onPageText(30, 'Last text on unit page 30.'); onVisiblePlace({ page: 30, frac: 0 }); onPageEnd?.(30, false) }
    return <div><button onClick={() => onSelection({ page: 1, text: 'Selected PDF sentence.', rects: [[1, .1, .2, .3, .04]] })}>Select PDF text</button><button onClick={() => onVisiblePlace({ page: 2, frac: 0 })}>Move to PDF page 2</button><button onClick={() => { onDocument(60); onOutline?.([{ title: 'Introduction', page: 1, items: [] }, { title: 'Chapter One', page: 11, items: [] }, { title: 'Chapter Two', page: 31, items: [] }]); onPageText(14, 'Real extracted text on page 14.'); onVisiblePlace({ page: 14, frac: 0 }); onPageEnd?.(14, false) }}>Open outlined page 14</button><button onClick={openFinal}>Open final page top</button><button onClick={() => { openFinal(); onPageEnd?.(30, true) }}>Finish outlined unit</button><output data-testid="requested-pdf-place">{requestedPlace?.page || 0}</output><output data-testid="requested-pdf-frac">{requestedPlace?.frac ?? 0}</output></div>
  },
}))
vi.mock('../../../components/reader/SelectionDeskBar', () => ({
  SelectionDeskBar: ({ onAskQuestion, onExplain, onSwatch, onNote, onMore }: { onAskQuestion: (s: string) => void; onExplain: () => void; onSwatch: (c: 'sage') => void; onNote: () => void; onMore: (id: 'quiz' | 'define') => void }) => <div>
    <button onClick={() => onAskQuestion('Why?')}>Ask this PDF</button><button onClick={onExplain}>Explain this PDF</button>
    <button onClick={() => onSwatch('sage')}>Highlight sage</button><button onClick={onNote}>Note PDF</button><button onClick={() => onMore('quiz')}>Quiz this PDF</button><button onClick={() => onMore('define')}>Define this PDF</button>
  </div>,
}))
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

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

it('renders structured contextual Define in the card and Notebook while retaining the exact raw answer in export', async () => {
  const raw = JSON.stringify({ kind: 'place', name: 'The crossing', description: 'A river crossing mentioned on this original page.' })
  const cards: PdfOriginalReaderServices['cards'] = []
  const services: PdfOriginalReaderServices = {
    marks: [], cards, saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true), removeMark: vi.fn(() => null), removeCard: vi.fn(() => null),
    ask: vi.fn(async () => raw), saveCard: vi.fn(() => false),
    saveCardWithId: vi.fn((selection, kind, answer) => {
      cards.push({ id: 'define-1', page: selection.page, text: selection.text, kind,
        turns: [{ role: 'user', content: selection.text }, { role: 'assistant', content: answer }], at: 17 })
      return 'define-1'
    }),
  }
  const writeText = vi.fn(async (_text: string) => {})
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Select PDF text'))
  fireEvent.click(screen.getByText('Define this PDF'))
  expect(await screen.findByText('A river crossing mentioned on this original page.')).toBeTruthy()
  expect(screen.getByText('Place')).toBeTruthy()
  expect(screen.queryByText(raw)).toBeNull()
  expect(services.saveCardWithId).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }), 'define', raw, undefined)
  fireEvent.keyDown(window, { key: 'Escape' })
  fireEvent.click(screen.getByText('Notebook'))
  expect(screen.getByText('A river crossing mentioned on this original page.')).toBeTruthy()
  fireEvent.click(screen.getByText('Copy all'))
  await waitFor(() => expect(writeText).toHaveBeenCalled())
  expect(writeText.mock.calls[0][0]).toContain(raw)
  fireEvent.click(screen.getByText('Original PDF page 1 · define'))
  expect(screen.getByTestId('popup-contextual-place').textContent).toContain('A river crossing mentioned on this original page.')
})

it('keeps a malformed saved structured primer available without showing JSON as default reading text', () => {
  const raw = '{"gist":"unfinished", "claims": ['
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [{ id: 'old-primer', page: 1, text: 'Opening pages', kind: 'primer', turns: [{ role: 'user', content: 'Prepare me.' }, { role: 'assistant', content: raw }], at: 5 }],
    saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true), removeMark: vi.fn(() => null), removeCard: vi.fn(() => null),
    saveCard: vi.fn(() => false), ask: vi.fn(async () => null),
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Notebook'))
  fireEvent.click(screen.getByText('Original PDF page 1 · primer'))
  expect(screen.getByText('This primer could not be formatted.')).toBeTruthy()
  const details = screen.getAllByText('Show original answer')[0].closest('details')!
  expect(details.open).toBe(false)
  expect(details.textContent).toContain(raw)
  fireEvent.click(details.querySelector('summary')!)
  expect(details.open).toBe(true)
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
  const structuredPrimer = JSON.stringify({ gist: 'These pages introduce the central argument.', claims: ['First claim.', 'Second claim.', 'Third claim.'], keepInMind: ['Watch the distinction.'], map: [{ title: 'Opening', pages: 'p. 11' }, { title: 'Middle', pages: 'p. 12' }, { title: 'Close', pages: 'p. 30' }] })
  const askUnit = vi.fn(async (_source: Parameters<NonNullable<PdfOriginalReaderServices['askUnit']>>[0], action: string) => action === 'primer' ? structuredPrimer : `${action} from original pages.`)
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
  expect(await screen.findByText('These pages introduce the central argument.')).toBeTruthy()
  expect(screen.getByText('Key claims')).toBeTruthy()
  expect(screen.getByText('Keep in mind')).toBeTruthy()
  expect(screen.queryByText(structuredPrimer)).toBeNull()
  const primer = askUnit.mock.calls[0][0]
  expect(primer).toEqual({ unit: { key: 'outline-1', title: 'Chapter One', from: 11, to: 30 },
    atPage: 14, pages: Array.from({ length: 20 }, (_, index) => ({ n: index + 11, text: `Real extracted text on page ${index + 11}.` })) })
  expect(saveUnitCard).toHaveBeenCalledWith(primer, 'primer', structuredPrimer)
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

it('does not send or save a Primer when a later required page exceeds the full-page bound', async () => {
  const askUnit = vi.fn(async () => 'A misleading partial primer.')
  const saveUnitCard = vi.fn(() => true)
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), saveCard: vi.fn(() => false), ask: vi.fn(async () => null),
    getPageText: vi.fn(async page => page === 12 ? 'x'.repeat(6001) : `Full page ${page}.`), askUnit, saveUnitCard,
  }
  render(<PdfOriginalReaderShell title="Outlined PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} unitRules={margin} />)
  fireEvent.click(screen.getByText('Open outlined page 14'))
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByText('Primer · Chapter One'))
  expect(await screen.findByText('These pages contain more text than this action can safely send.')).toBeTruthy()
  expect(askUnit).not.toHaveBeenCalled()
  expect(saveUnitCard).not.toHaveBeenCalled()
})

it('appends a saved PDF card follow-up to the same source card and reopens its ordered turns', async () => {
  const cards: PdfOriginalReaderServices['cards'] = []
  const askCardFollow = vi.fn(async (_id: string, _question: string) => 'The follow-up answer.')
  const appendCardTurn = vi.fn((id: string, question: string, answer: string) => {
    const card = cards.find(item => item.id === id)!
    card.turns.push({ role: 'user', content: question }, { role: 'assistant', content: answer })
    return true
  })
  const services: PdfOriginalReaderServices = {
    marks: [], cards, saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true), removeMark: vi.fn(() => null), removeCard: vi.fn(() => null),
    ask: vi.fn(async () => 'First source answer.'), saveCard: vi.fn(() => { throw new Error('must use ID path') }),
    saveCardWithId: vi.fn((selection, kind, answer) => { cards.push({ id: 'card-1', page: selection.page, text: selection.text, rects: selection.rects, kind,
      turns: [{ role: 'user', content: selection.text }, { role: 'assistant', content: answer }], at: 11 }); return 'card-1' }),
    askCardFollow, appendCardTurn,
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Select PDF text'))
  fireEvent.click(screen.getByText('Explain this PDF'))
  await screen.findByText('First source answer.')
  fireEvent.change(screen.getByLabelText('Follow up'), { target: { value: 'And why?' } })
  fireEvent.click(screen.getByTestId('lab-phone-card-send'))
  await screen.findByText('The follow-up answer.')
  expect(askCardFollow).toHaveBeenCalledOnce()
  expect(askCardFollow.mock.calls[0][0]).toBe('card-1')
  expect(appendCardTurn).toHaveBeenCalledOnce()
  expect(appendCardTurn).toHaveBeenCalledWith('card-1', 'And why?', 'The follow-up answer.')
  fireEvent.keyDown(window, { key: 'Escape' })
  fireEvent.click(screen.getByText('Notebook'))
  fireEvent.click(screen.getByText('Original PDF page 1 · explain'))
  expect(screen.getByLabelText('Follow up')).toBeTruthy()
  expect(screen.getByText('And why?')).toBeTruthy()
  expect(screen.getByText('The follow-up answer.')).toBeTruthy()
})

it('offers after-unit Recap and Note on the finished source unit, retaining its complete page range', async () => {
  const askUnit = vi.fn(async (_source: Parameters<NonNullable<PdfOriginalReaderServices['askUnit']>>[0], _action: string) => 'Complete chapter recap.')
  const saveUnitCardWithId = vi.fn(() => 'recap-1')
  const saveUnitNote = vi.fn(() => 'note-1')
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), saveCard: vi.fn(() => false), ask: vi.fn(async () => null),
    getPageText: vi.fn(async page => `Actual page ${page}.`), askUnit, saveUnitCard: vi.fn(() => false), saveUnitCardWithId, saveUnitNote,
  }
  render(<PdfOriginalReaderShell title="Outlined PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} unitRules={margin} />)
  fireEvent.click(screen.getByText('Open outlined page 14'))
  expect(screen.queryByRole('complementary', { name: 'After Chapter One' })).toBeNull()
  fireEvent.click(screen.getByText('Open final page top'))
  expect(screen.queryByRole('complementary', { name: 'After Chapter One' })).toBeNull()
  fireEvent.click(screen.getByText('Finish outlined unit'))
  expect(screen.getByRole('complementary', { name: 'After Chapter One' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Recap' }))
  expect(await screen.findByText('Complete chapter recap.')).toBeTruthy()
  expect(askUnit.mock.calls[0][0].pages.map(page => page.n)).toEqual(Array.from({ length: 20 }, (_, index) => index + 11))
  expect(askUnit.mock.calls[0][1]).toBe('recap')
  expect(saveUnitCardWithId).toHaveBeenCalledOnce()
  fireEvent.keyDown(window, { key: 'Escape' })
  fireEvent.click(screen.getByRole('button', { name: 'Note' }))
  fireEvent.change(screen.getByLabelText('Your note on this section'), { target: { value: 'My note on the completed unit.' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
  expect(saveUnitNote).toHaveBeenCalledWith({ unit: { key: 'outline-1', title: 'Chapter One', from: 11, to: 30 },
    atPage: 30, source: { from: 11, to: 30 } }, 'My note on the completed unit.')
})

it('checks a finished-unit quiz against its actual full source and saves only the completed result', async () => {
  const quiz = JSON.stringify({ questions: [{ q: 'What ends the unit?', answer: 'The last page.' }] })
  const askUnitQuiz = vi.fn(async (_source: Parameters<NonNullable<PdfOriginalReaderServices['askUnitQuiz']>>[0]) => quiz)
  const askUnitQuizCheck = vi.fn(async () => JSON.stringify({ verdict: 'right', feedback: 'Correct.' }))
  const saveUnitQuizCardWithId = vi.fn((_source: Parameters<NonNullable<PdfOriginalReaderServices['saveUnitQuizCardWithId']>>[0], _summary: string, _generated: string) => 'quiz-1')
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), saveCard: vi.fn(() => false), ask: vi.fn(async () => null),
    getPageText: vi.fn(async page => `Actual page ${page}.`), askUnitQuiz, askUnitQuizCheck, saveUnitQuizCardWithId,
  }
  render(<PdfOriginalReaderShell title="Outlined PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} unitRules={margin} />)
  fireEvent.click(screen.getByText('Finish outlined unit'))
  fireEvent.click(screen.getByRole('button', { name: 'Quiz me' }))
  expect(await screen.findByText('What ends the unit?')).toBeTruthy()
  expect(askUnitQuiz.mock.calls[0][0].pages.map(page => page.n)).toEqual(Array.from({ length: 20 }, (_, index) => index + 11))
  expect(saveUnitQuizCardWithId).not.toHaveBeenCalled()
  fireEvent.change(screen.getByRole('textbox', { name: 'Your answer' }), { target: { value: 'The last page.' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  expect(await screen.findByText('Correct.')).toBeTruthy()
  expect(askUnitQuizCheck).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByText('See your score →'))
  await waitFor(() => expect(saveUnitQuizCardWithId).toHaveBeenCalledOnce())
  expect(saveUnitQuizCardWithId.mock.calls[0][1]).toContain('What ends the unit?')
  expect(saveUnitQuizCardWithId.mock.calls[0][2]).toBe(quiz)
})

it('uses the common phone selection bar and its accessible More actions for original PDF text', async () => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('max-width'), addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  const ask = vi.fn(async (_source: Parameters<PdfOriginalReaderServices['ask']>[0], _intent: string) => 'A definition from the original PDF.')
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [], saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true),
    removeMark: vi.fn(() => null), removeCard: vi.fn(() => null), saveCard: vi.fn(() => true), ask,
  }
  render(<PdfOriginalReaderShell title="Phone PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Select PDF text'))
  expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
  fireEvent.click(screen.getByTestId('lab-pbar-more'))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Define' }))
  expect(await screen.findByText('A definition from the original PDF.')).toBeTruthy()
  expect(ask.mock.calls[0][1]).toBe('define')
  expect(ask.mock.calls[0][0].rects).toEqual([[1, .1, .2, .3, .04]])
})

it('renders an after-unit PDF Note as prose in Notebook and export, retaining its source pages', async () => {
  const writeText = vi.fn(async (_text: string) => {})
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const services: PdfOriginalReaderServices = {
    marks: [], cards: [{ id: 'note-1', page: 2, kind: 'note', text: 'Section title', at: 10, rects: [],
      data: { action: 'note', unit: { key: 'all', title: 'Section title', from: 1, to: 2 }, source: { from: 1, to: 2 } },
      turns: [{ role: 'user', content: 'My thought about the section.' }, { role: 'assistant', content: 'A response to the note.' },
        { role: 'user', content: 'A later follow-up.' }, { role: 'assistant', content: 'A second response.' }] }],
    saveHighlight: vi.fn(() => true), saveNote: vi.fn(() => true), removeMark: vi.fn(() => null), removeCard: vi.fn(() => null),
    ask: vi.fn(async () => null), saveCard: vi.fn(() => false),
  }
  render(<PdfOriginalReaderShell title="Own PDF" bytes={async () => new ArrayBuffer(4)} onVisiblePlace={() => {}} services={services} />)
  fireEvent.click(screen.getByText('Notebook'))
  fireEvent.click(screen.getByText('Copy all'))
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
  expect(writeText.mock.calls[0][0]).toMatch(/## Note · Original PDF page 2[\s\S]*Source · Original PDF pages 1–2[\s\S]*My thought about the section\./)
  expect(writeText.mock.calls[0][0]).not.toContain('**Q.** My thought')
  expect(writeText.mock.calls[0][0]).toMatch(/My thought about the section\.[\s\S]*\*\*A\.\*\* A response to the note\.[\s\S]*\*\*Q\.\*\* A later follow-up\.[\s\S]*\*\*A\.\*\* A second response\./)
  fireEvent.click(screen.getByText('My notes'))
  expect(screen.getByText('Original PDF page 2 · Note')).toBeTruthy()
  fireEvent.click(screen.getByText('AI'))
  expect(screen.queryByText('Original PDF page 2 · Note')).toBeNull()
  fireEvent.click(screen.getByText('My notes'))
  fireEvent.click(screen.getByText('Original PDF page 2 · Note'))
  expect(screen.getByTestId('lab-phone-card-body').textContent).toContain('My thought about the section.')
  expect(screen.getByTestId('lab-phone-card-body').textContent).toContain('Source · Original PDF pages 1–2')
  expect(screen.getByTestId('lab-phone-card-body').textContent).toContain('A second response.')
})
