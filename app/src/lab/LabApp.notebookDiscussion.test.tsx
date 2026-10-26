// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
