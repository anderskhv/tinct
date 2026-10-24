// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

const requests = vi.hoisted(() => ({
  pending: [] as { word: string; resolve: (answer: string) => void }[],
  saved: [] as string[],
}))
vi.mock('./useLabAsk', async importOriginal => {
  const original = await importOriginal<typeof import('./useLabAsk')>()
  return { ...original, useLabAsk: (...args: Parameters<typeof original.useLabAsk>) => {
    const ask = original.useLabAsk(...args)
    return { ...ask,
      explainSelection: (input: Parameters<typeof ask.explainSelection>[0]) => input.intent === 'define'
        ? new Promise<string>(resolve => { requests.pending.push({ word: input.text, resolve }) })
        : Promise.reject(new Error('Only definition responses are controlled in this test')),
      saveCard: (card: Parameters<typeof ask.saveCard>[0]) => { requests.saved.push(card.text); return true },
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
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  fireEvent.keyDown(window, { key: 'Escape' })
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
