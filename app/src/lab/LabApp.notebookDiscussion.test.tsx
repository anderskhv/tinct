// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'
import { catalogueCardConversation } from './sharedReader/sharedReaderCards'
import { writeLabBookChat } from './labChatHistory'
import type { ChatConversation } from '../types'
const fixture = vi.hoisted(() => ({ row: null as ChatConversation | null }))
vi.mock('./LabContentsV2', () => ({ LabContentsV2: ({ onContinueConversation }: { onContinueConversation: (row: ChatConversation) => void }) => <button onClick={() => onContinueConversation(fixture.row!)}>Open saved entry</button> }))
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); vi.unstubAllGlobals(); window.history.replaceState(null, '', '/') })
it.each([false, true])('opens an earlier-chapter Notebook entry without moving reading position (discussed=%s)', discussed => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
  fixture.row = catalogueCardConversation({ source: { kind: 'catalogue', bookId: 'bible' }, id: 'earlier', kind: 'explain', chapterNumber: 1,
    text: 'Exact earlier passage', turns: [{ role: 'assistant', content: 'Original saved answer.' }, ...(discussed ? [{ role: 'user' as const, content: 'Why earlier?' }, { role: 'assistant' as const, content: 'Earlier follow-up answer.' }] : [])], at: 1000, u: 1000 })!
  writeLabBookChat('bible', [fixture.row])
  window.history.replaceState(null, '', '/reader?sharedReader=1&layout=desktop&view=margin')
  render(<LabApp pathname="/reader" source={{ ...fallbackLabSource(), chapterNumber: 2, chapterLabel: 'Book 2', chapters: [{number:1,title:'Book 1'},{number:2,title:'Book 2'}] }} authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root'), place = root.getAttribute('data-place')
  fireEvent.click(screen.getByText('Open saved entry'))
  expect(root.getAttribute('data-place')).toBe(place)
  expect(screen.getByText('Original saved answer.')).toBeTruthy()
  expect(!!document.querySelector('.lab-ask')).toBe(discussed)
  expect(!!screen.queryByText('Show passage')).toBe(!discussed)
  const field = screen.getByTestId(discussed ? 'lab-ask-input' : 'lab-phone-card-input')
  fireEvent.change(field, { target: { value: 'Do not keep this unsent draft' } })
  fireEvent.click(screen.getByText('Open saved entry'))
  expect((screen.getByTestId(discussed ? 'lab-ask-input' : 'lab-phone-card-input') as HTMLTextAreaElement).value).toBe('')
  expect(root.getAttribute('data-place')).toBe(place)
})


it('highlights a mobile saved Define destination and returns to the pre-jump position', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
  const source = fallbackLabSource()
  fixture.row = catalogueCardConversation({ source: { kind: 'catalogue', bookId: 'bible' }, id: 'saved-definition', kind: 'define', chapterNumber: source.chapterNumber,
    anchor: { editionKey: 'web-en', chapterNumber: source.chapterNumber, paragraphIndex: 0, endParagraphIndex: 0, fromWord: 3, toWord: 4 },
    text: 'saved word', turns: [{ role: 'assistant', content: '{"kind":"definition","definition":"A saved meaning."}' }], at: 1000, u: 1000 })!
  writeLabBookChat('bible', [fixture.row])
  window.history.replaceState(null, '', '/reader?sharedReader=1&layout=phone')
  render(<LabApp pathname="/reader" source={source} authToken={null} sharedReader marginPhone />)
  const root = screen.getByTestId('lab-root'), originalPlace = root.getAttribute('data-place')
  fireEvent.click(screen.getByText('Open saved entry'))
  expect(root.getAttribute('data-place')).toBe(originalPlace)
  fireEvent.click(screen.getByText('Show passage'))
  // The destination can mount after its position commits; the passage cue is
  // then painted by its MutationObserver. Assert the completed visible state.
  await waitFor(() => {
    expect(root.getAttribute('data-place')).toBe('0:3')
    expect(document.querySelector('[data-word-index="3"].is-notebook-passage')).toBeTruthy()
  })
  fireEvent.click(screen.getByTestId('lab-notebook-return'))
  await waitFor(() => expect(root.getAttribute('data-place')).toBe(originalPlace))
  expect(screen.queryByTestId('lab-notebook-return')).toBeNull()
})
