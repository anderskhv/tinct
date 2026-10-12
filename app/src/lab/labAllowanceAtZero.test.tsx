// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Chapter notes, Catch me up and its recap refused at zero (402
// { error: 'allowance_used' }). The shipped switch is off
// (src/aiAllowanceSwitch.ts); these tests flip a copy of it to pin both states.
const switchState = vi.hoisted(() => ({ on: false }))
vi.mock('../aiAllowanceSwitch', () => ({ get AI_ALLOWANCE_ENFORCED() { return switchState.on } }))

vi.setConfig({ testTimeout: 30_000 })
const slow = { timeout: 8_000 }

import type { ChapterNotesRequest } from '../chapterNotes'
import { CATCH_UP_ROUTE } from '../catchUp'
import { LabBalanceEmptyLine } from './LabAiUsageBar'
import { LabCatchUpSheet } from './LabCatchUpSheet'
import { LabChapterNotesSheet } from './LabChapterNotesSheet'
import { isAllowanceUsedResponse } from './labAiAllowance'
import { fetchCatchUpEntry, resetCatchUpMemory } from './labCatchUp'
import { fetchChapterNotes } from './labChapterNotes'
import { LAB_COPY } from './labCopy'

const BALANCE_EMPTY = 'Your AI chat balance is empty. Top up to continue.'
const refused = { status: 402, body: { error: 'allowance_used' } }

function stubFetch(respond: (url: string) => { status: number; body: unknown }) {
  const fetchMock = vi.fn(async (url: string) => {
    const { status, body } = respond(url)
    return { ok: status >= 200 && status < 300, status, json: async () => body }
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const response = (status: number, body: unknown) => ({ ok: status < 300, status, json: async () => body })

let run = 0
beforeEach(() => { run += 1; switchState.on = true; localStorage.clear(); resetCatchUpMemory() })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('the copy', () => {
  it('is the existing chat line, unchanged', () => {
    expect(LAB_COPY.balanceEmpty).toBe(BALANCE_EMPTY)
  })
})

describe('isAllowanceUsedResponse', () => {
  it('is the 402 allowance refusal only', async () => {
    expect(await isAllowanceUsedResponse(response(402, { error: 'allowance_used' }))).toBe(true)
    expect(await isAllowanceUsedResponse(response(402, { error: 'other' }))).toBe(false)
    expect(await isAllowanceUsedResponse(response(503, { error: 'allowance_used' }))).toBe(false)
    expect(await isAllowanceUsedResponse({ status: 402, json: async () => { throw new Error('not json') } })).toBe(false)
  })

  it('is always false while the switch is off, without reading the body', async () => {
    switchState.on = false
    const json = vi.fn(async () => ({ error: 'allowance_used' }))
    expect(await isAllowanceUsedResponse({ status: 402, json })).toBe(false)
    expect(json).not.toHaveBeenCalled()
  })
})

describe('clients', () => {
  const notes: ChapterNotesRequest = { bookId: 'plain', editionKey: 'e', chapterNumber: 2, kind: 'end', bookTitle: 'Plain' }
  const unit = { kind: 'unit', key: 'ch-1', title: 'Chapter 1', request: { bookId: 'plain', editionKey: 'e', unitId: 'ch-1' } } as unknown as Parameters<typeof fetchCatchUpEntry>[0]
  const current = { kind: 'current', key: 'current', title: 'Chapter 2', request: { bookId: 'plain', editionKey: 'e', chapterNumber: 2, paragraphIndex: 3, completed: false, brief: true } } as unknown as Parameters<typeof fetchCatchUpEntry>[0]
  const fetchImpl = async () => response(refused.status, refused.body)

  it('mark a refusal at zero while the switch is on', async () => {
    expect(await fetchChapterNotes(notes, { fetchImpl })).toEqual({ ok: false, status: 402, allowanceUsed: true })
    expect(await fetchCatchUpEntry(unit, { fetchImpl })).toEqual({ ok: false, status: 402, allowanceUsed: true })
    expect(await fetchCatchUpEntry(current, { fetchImpl })).toEqual({ ok: false, status: 402, allowanceUsed: true })
  })

  it('return exactly what they did before while the switch is off', async () => {
    switchState.on = false
    expect(await fetchChapterNotes(notes, { fetchImpl })).toEqual({ ok: false, status: 402 })
    expect(await fetchCatchUpEntry(unit, { fetchImpl })).toEqual({ ok: false, status: 402 })
    expect(await fetchCatchUpEntry(current, { fetchImpl })).toEqual({ ok: false, status: 402 })
  })

  it('leave other failures as they were', async () => {
    const busy = async () => response(503, { error: 'ai_resting' })
    expect(await fetchChapterNotes(notes, { fetchImpl: busy })).toEqual({ ok: false, status: 503 })
    expect(await fetchCatchUpEntry(unit, { fetchImpl: busy })).toEqual({ ok: false, status: 503 })
  })
})

describe('LabBalanceEmptyLine', () => {
  it('links to the top-up when one is offered, otherwise is plain text', () => {
    const onTopUp = vi.fn()
    const { unmount } = render(<LabBalanceEmptyLine onTopUp={onTopUp} testId="line" />)
    const link = screen.getByTestId('line')
    expect(link.tagName).toBe('BUTTON')
    expect(link.textContent).toBe(BALANCE_EMPTY)
    fireEvent.click(link)
    expect(onTopUp).toHaveBeenCalledTimes(1)
    unmount()
    render(<LabBalanceEmptyLine testId="line" />)
    expect(screen.getByTestId('line').tagName).toBe('P')
    expect(screen.getByTestId('line').textContent).toBe(BALANCE_EMPTY)
  })
})

describe('LabChapterNotesSheet at zero', () => {
  const request = (): ChapterNotesRequest => ({ bookId: 'plain', editionKey: `n${run}`, chapterNumber: 4, kind: 'primer', bookTitle: 'Plain' })
  const renderSheet = (onTopUp?: () => void) => render(
    <LabChapterNotesSheet request={request()} title="Primer" onClose={vi.fn()} onChat={vi.fn()} onTalk={vi.fn()} onTopUp={onTopUp} />,
  )

  it('shows the balance line, linked to the top-up, above Retry', async () => {
    stubFetch(() => refused)
    const onTopUp = vi.fn()
    renderSheet(onTopUp)
    const line = await screen.findByTestId('lab-chapter-notes-balance', {}, slow)
    expect(line.textContent).toBe(BALANCE_EMPTY)
    expect(screen.getByTestId('lab-chapter-notes-retry').textContent).toBe('Retry')
    fireEvent.click(line)
    expect(onTopUp).toHaveBeenCalledTimes(1)
  })

  it('shows only Retry while the switch is off', async () => {
    switchState.on = false
    stubFetch(() => refused)
    renderSheet(vi.fn())
    await screen.findByTestId('lab-chapter-notes-retry', {}, slow)
    expect(screen.queryByTestId('lab-chapter-notes-balance')).toBeNull()
    expect(screen.queryByText(BALANCE_EMPTY)).toBeNull()
  })

  it('shows only Retry for any other failure', async () => {
    stubFetch(() => ({ status: 503, body: { error: 'ai_resting' } }))
    renderSheet(vi.fn())
    await screen.findByTestId('lab-chapter-notes-retry', {}, slow)
    expect(screen.queryByTestId('lab-chapter-notes-balance')).toBeNull()
  })
})

describe('LabCatchUpSheet at zero', () => {
  const chapters = Array.from({ length: 4 }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}` }))
  const renderSheet = (onTopUp?: () => void) => render(
    <LabCatchUpSheet bookId="plain" editionKey={`c${run}`} bookTitle="Plain" chapters={chapters}
      chapterNumber={4} paragraphIndex={4} completed={false} onClose={vi.fn()} onChat={vi.fn()} onTalk={vi.fn()} onTopUp={onTopUp} />,
  )

  // At chapter 4 the timeline is chapters 1, 2 and 3 (the current chapter is never recapped).
  it('shows the balance line on each refused entry, and keeps cached entries', async () => {
    stubFetch(() => refused)
    const onTopUp = vi.fn()
    renderSheet(onTopUp)
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-balance')).toHaveLength(3), slow)
    for (const line of screen.getAllByTestId('lab-catch-up-balance')) expect(line.textContent).toBe(BALANCE_EMPTY)
    expect(screen.getAllByTestId('lab-catch-up-retry')).toHaveLength(3)
    fireEvent.click(screen.getAllByTestId('lab-catch-up-balance')[2])
    expect(onTopUp).toHaveBeenCalledTimes(1)
  })

  it('shows the line on refused entries only; served entries read as before', async () => {
    let calls = 0
    stubFetch(() => ++calls === 3 ? refused : { status: 200, body: { summary: 'Recap of an earlier chapter.' } })
    renderSheet(vi.fn())
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-balance')).toHaveLength(1), slow)
    expect(screen.getAllByText('Recap of an earlier chapter.')).toHaveLength(2)
    const current = screen.getAllByTestId('lab-catch-up-entry').at(-1)!
    expect(current.querySelector('[data-testid="lab-catch-up-balance"]')).toBeTruthy()
  })

  it('shows only Retry while the switch is off', async () => {
    switchState.on = false
    stubFetch(() => refused)
    renderSheet(vi.fn())
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-retry')).toHaveLength(3), slow)
    expect(screen.queryByTestId('lab-catch-up-balance')).toBeNull()
    expect(screen.queryByText(BALANCE_EMPTY)).toBeNull()
  })
})
