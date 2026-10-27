// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

const requests = vi.hoisted(() => ({
  pending: [] as { word: string; resolve: (answer: string) => void }[],
  saved: [] as string[],
  saveSucceeds: true,
  realSave: false,
}))
vi.mock('./useLabAsk', async importOriginal => {
  const original = await importOriginal<typeof import('./useLabAsk')>()
  return { ...original, useLabAsk: (...args: Parameters<typeof original.useLabAsk>) => {
    const ask = original.useLabAsk(...args)
    return { ...ask,
      explainSelection: (input: Parameters<typeof ask.explainSelection>[0]) => input.intent === 'define'
        ? new Promise<string>(resolve => { requests.pending.push({ word: input.text, resolve }) })
        : Promise.reject(new Error('Only definition responses are controlled in this test')),
      saveCard: (card: Parameters<typeof ask.saveCard>[0]) => { requests.saved.push(card.text); return requests.realSave ? ask.saveCard(card) : requests.saveSucceeds },
    }
  } }
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
  requests.pending.length = 0
  requests.saved.length = 0
  requests.saveSucceeds = true
  requests.realSave = false
})

function tapWord(index: number, pointerId: number) {
  const word = screen.getAllByTestId('lab-word')[index]
  fireEvent.pointerDown(word, { pointerId, pointerType: 'mouse', clientX: 150, clientY: 200 })
  fireEvent.pointerUp(word, { pointerId, pointerType: 'mouse', clientX: 150, clientY: 200 })
}

it('ignores a late definition from a superseded word and saves only the current answer', async () => {
  window.history.replaceState(null, '', '/reader?book=odyssey&sharedReader=1&layout=phone')
  const source = fallbackLabSource()
  const text = 'A short chapter has words to select and explain.'
  render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source, bookId: 'odyssey', paragraphs: [text], followParagraphs: [{ index: 0, text }],
  }} authToken={null} sharedReader marginPhone />)

  tapWord(1, 51)
  await waitFor(() => expect(requests.pending.map(item => item.word)).toEqual(['short']))
  fireEvent.click(screen.getByTestId('lab-phone-card-delete'))
  await waitFor(() => expect(screen.queryByTestId('lab-phone-bar')).toBeNull())
  tapWord(2, 52)
  await waitFor(() => expect(requests.pending.map(item => item.word)).toEqual(['short', 'chapter']))

  await act(async () => { requests.pending[0].resolve('{"kind":"definition","definition":"The first answer."}') })
  expect(requests.saved).toEqual([])
  expect(screen.queryByText('The first answer.')).toBeNull()

  await act(async () => { requests.pending[1].resolve('{"kind":"definition","definition":"The current answer."}') })
  await waitFor(() => expect(requests.saved).toEqual(['chapter']))
  expect(screen.getByText('The current answer.')).toBeTruthy()
})


it('retries saving a completed definition without asking for another answer', async () => {
  requests.saveSucceeds = false
  window.history.replaceState(null, '', '/reader?book=odyssey&sharedReader=1&layout=phone')
  const source = fallbackLabSource(), text = 'A short chapter has words to select and explain.'
  render(<LabApp pathname="/reader" search={window.location.search} source={{ ...source, bookId: 'odyssey', paragraphs: [text], followParagraphs: [{ index: 0, text }] }} authToken={null} sharedReader marginPhone />)
  tapWord(1, 51)
  await waitFor(() => expect(requests.pending).toHaveLength(1))
  await act(async () => { requests.pending[0].resolve('{"kind":"definition","definition":"The retained definition."}') })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Retry saving' })).toBeTruthy())
  requests.saveSucceeds = true
  requests.realSave = false
  fireEvent.click(screen.getByRole('button', { name: 'Retry saving' }))
  expect(requests.saved).toEqual(['short', 'short'])
  expect(requests.pending).toHaveLength(1)
  expect(screen.queryByRole('button', { name: 'Retry saving' })).toBeNull()
  expect(screen.getByText('The retained definition.')).toBeTruthy()
})

it('persists a completed tapped definition through the real card writer', async () => {
  requests.realSave = true
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1&layout=phone')
  const source = fallbackLabSource()
  const text = 'Phinehas stood firm in his zeal.'
  render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source, bookId: 'bible', chapterNumber: 944, chapterLabel: 'Sirach 45',
    paragraphs: [text], followParagraphs: [{ index: 0, text }],
  }} authToken={null} sharedReader marginPhone />)
  tapWord(0, 71)
  await waitFor(() => expect(requests.pending).toHaveLength(1))
  const answer = JSON.stringify({ kind: 'person', name: 'Phinehas', importance: 'minor', subtitle: 'Priest', body: 'A priest praised here for his zeal.' })
  await act(async () => { requests.pending[0].resolve(answer) })
  await waitFor(() => expect(requests.saved).toEqual(['Phinehas']))
  expect(screen.queryByText(/This answer could not be saved/)).toBeNull()
  const rows = JSON.parse(localStorage.getItem('tinct:chat-history:bible') || '[]')
  expect(rows).toHaveLength(1)
  expect(rows[0].card.kind).toBe('define')
  expect(rows[0].messages.at(-1).content).toBe(answer)
})

it('identifies a device quota failure and copies only a content-free save reason', async () => {
  requests.realSave = true
  const copy = vi.fn(async (_text: string) => {})
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: copy } })
  const setItem = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    if (key === 'tinct:chat-history:odyssey') throw new DOMException('synthetic limit', 'QuotaExceededError')
    setItem.call(this, key, value)
  })
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  window.history.replaceState(null, '', '/reader?book=odyssey&sharedReader=1&layout=phone')
  const source = fallbackLabSource(), text = 'A short chapter has words.'
  render(<LabApp pathname="/reader" search={window.location.search} source={{ ...source, bookId: 'odyssey', paragraphs: [text], followParagraphs: [{ index: 0, text }] }} authToken={null} sharedReader marginPhone />)
  tapWord(1, 81)
  await waitFor(() => expect(requests.pending).toHaveLength(1))
  await act(async () => { requests.pending[0].resolve('{"kind":"definition","definition":"A private answer never included in save details."}') })
  expect(screen.getByText(/Tinct’s storage on this device is full/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Copy save details' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save details copied' })).toBeTruthy())
  expect(copy).toHaveBeenCalledWith('Tinct answer save: quota')
  expect(requests.pending).toHaveLength(1)
})
