// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { readAllLabBookChats } from './labChatHistory'
import { fallbackLabSource } from './labSource'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear(); window.history.replaceState(null, '', '/') })
it.each(['two-page', 'margin'])('submits desktop Ask on the correct surface without moving the book in %s', async view => {
  const requests: unknown[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes('/api/lab-chat') || String(input).includes('/api/chat')) {
      requests.push(JSON.parse(String(init?.body)))
      return new Response('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A local passage answer."}}\n\ndata: {"type":"message_stop"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })
    }
    return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } })
  }))
  window.history.replaceState(null, '', `/reader?sharedReader=1&layout=desktop&view=${view}`)
  render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root'), place = root.getAttribute('data-place')
  const words = screen.getAllByTestId('lab-word'), selected = words.slice(1, 4).map(w => w.textContent?.trim()).join(' ')
  fireEvent.pointerDown(words[1], { pointerId: 51, pointerType: 'mouse', button: 0, clientX: 100, clientY: 200 })
  fireEvent.pointerMove(words[3], { pointerId: 51, pointerType: 'mouse', clientX: 240, clientY: 200 })
  fireEvent.pointerUp(words[3], { pointerId: 51, pointerType: 'mouse', clientX: 240, clientY: 200 })
  fireEvent.click(screen.getByTestId('lab-dbar-ask'))
  const field = screen.getByTestId('lab-dbar-ask-field')
  expect(document.activeElement).toBe(field)
  fireEvent.change(field, { target: { value: 'Why these words?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }))
  await waitFor(() => expect(requests).toHaveLength(1))
  await waitFor(() => expect(screen.getByText('A local passage answer.')).toBeTruthy())
  if (view === 'margin') {
    expect(document.querySelector('.source-margin-item[data-open="true"] .lab-pcard-body')).toBeTruthy()
    expect(document.querySelector('.lab-ask')).toBeNull()
  } else {
  expect(document.querySelector('.lab-desktop-card[data-kind="ask"], .source-margin-item[data-open="true"] .lab-pcard-answer')).toBeNull()
  expect(document.querySelector('.lab-ask')).toBeTruthy()
  }
  expect(root.getAttribute('data-place')).toBe(place)
  expect(JSON.stringify(requests[0])).toContain('Why these words?')
  expect(JSON.stringify(requests[0])).toContain(selected)
  await waitFor(() => expect(readAllLabBookChats().flatMap(row => row.messages).filter(message => message.content === 'Why these words?')).toHaveLength(1))
  expect(readAllLabBookChats().flatMap(row => row.messages).filter(message => message.content === 'A local passage answer.')).toHaveLength(1)
  if (view === 'margin') fireEvent.click(screen.getByTestId('source-margin-minimise'))
  else fireEvent.click(screen.getByTestId('lab-desktop-companion-close'))
  fireEvent.pointerDown(words[5], { pointerId: 52, pointerType: 'mouse', button: 0, clientX: 100, clientY: 200 })
  fireEvent.pointerMove(words[7], { pointerId: 52, pointerType: 'mouse', clientX: 240, clientY: 200 })
  fireEvent.pointerUp(words[7], { pointerId: 52, pointerType: 'mouse', clientX: 240, clientY: 200 })
  fireEvent.click(screen.getByTestId('lab-dbar-ask'))
  fireEvent.change(screen.getByTestId('lab-dbar-ask-field'), { target: { value: 'Why this different passage?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }))
  await waitFor(() => expect(requests).toHaveLength(2))
  await waitFor(() => expect(readAllLabBookChats().filter(row => row.messages.some(message => message.content.startsWith('Why ')))).toHaveLength(2))
  const rows = readAllLabBookChats()
  expect(rows.find(row => row.messages.some(message => message.content === 'Why these words?'))?.id)
    .not.toBe(rows.find(row => row.messages.some(message => message.content === 'Why this different passage?'))?.id)
  if (view === 'margin') {
    const margin = within(document.querySelector('.source-margin-item[data-open="true"]') as HTMLElement)
    fireEvent.change(margin.getByTestId('lab-phone-card-input'), { target: { value: 'A follow-up in the margin?' } })
    fireEvent.click(margin.getByTestId('lab-phone-card-send'))
    await waitFor(() => expect(requests).toHaveLength(3))
    await waitFor(() => expect(readAllLabBookChats().flatMap(row => row.messages).filter(message => message.content === 'A follow-up in the margin?')).toHaveLength(1))
    expect(document.querySelector('.lab-ask')).toBeNull()
    expect(document.querySelector('.source-margin-item[data-open="true"] .lab-pcard-body')).toBeTruthy()
    expect(readAllLabBookChats().find(row => row.messages.some(message => message.content === 'Why this different passage?'))?.messages.some(message => message.content === 'A follow-up in the margin?')).toBe(true)
    expect(root.getAttribute('data-place')).toBe(place)
  }
})

it.each(['explain', 'simplify', 'counterpoint', 'factcheck'].flatMap(action => ['two-page', 'margin'].map(view => ({ action, view }))))('keeps $action follow-ups on the $view surface, including after reload', async ({ action, view }) => {
  const legacyCopy = JSON.stringify({ preserved: { answer: 'An older answer with no verified backup.', at: 1 } })
  localStorage.setItem('tinct:explanations', legacyCopy)
  const requests: unknown[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes('/api/lab-chat') || String(input).includes('/api/chat')) {
      requests.push(JSON.parse(String(init?.body)))
      return new Response('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A local passage answer."}}\n\ndata: {"type":"message_stop"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })
    }
    return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } })
  }))
  window.history.replaceState(null, '', `/reader?sharedReader=1&layout=desktop&view=${view}`)
  render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root'), place = root.getAttribute('data-place')
  const words = screen.getAllByTestId('lab-word'), selected = words.slice(1, 4).map(w => w.textContent?.trim()).join(' ')
  fireEvent.pointerDown(words[1], { pointerId: 51, pointerType: 'mouse', button: 0, clientX: 100, clientY: 200 })
  fireEvent.pointerMove(words[3], { pointerId: 51, pointerType: 'mouse', clientX: 240, clientY: 200 })
  fireEvent.pointerUp(words[3], { pointerId: 51, pointerType: 'mouse', clientX: 240, clientY: 200 })
  if (action === 'counterpoint' || action === 'factcheck') {
    fireEvent.click(screen.getByTestId('lab-dbar-more'))
    fireEvent.click(screen.getByTestId(`lab-dmore-${action}`))
  } else fireEvent.click(screen.getByTestId(`lab-dbar-${action}`))
  await waitFor(() => expect(screen.getByText('A local passage answer.')).toBeTruthy())
  await waitFor(() => expect(readAllLabBookChats().flatMap(row => row.messages).some(message => message.content === 'A local passage answer.')).toBe(true))
  expect(localStorage.getItem('tinct:explanations')).toBe(legacyCopy)
  const field = screen.getByTestId('lab-phone-card-input')
  fireEvent.change(field, { target: { value: 'Why these words?' } })
  fireEvent.click(screen.getByTestId('lab-phone-card-send'))
  await waitFor(() => expect(requests).toHaveLength(2))
  await waitFor(() => expect(screen.getAllByText('A local passage answer.').length).toBeGreaterThan(0))
  if (view === 'margin') {
    expect(document.querySelector('.lab-ask')).toBeNull()
    expect(document.querySelector('.source-margin-item[data-open="true"] .lab-pcard-body')).toBeTruthy()
    expect(screen.getByTestId('lab-phone-card-input')).toBeTruthy()
  } else {
    expect(document.querySelector('.lab-desktop-card[data-kind="ask"]')).toBeNull()
    expect(document.querySelector('.lab-ask')).toBeTruthy()
    expect(screen.queryAllByTestId('lab-phone-card-input').filter(node => !node.closest('[hidden]'))).toHaveLength(0)
  }
  expect(screen.getAllByText('Why these words?').filter(node => !node.closest('[hidden]'))).toHaveLength(1)
  expect(root.getAttribute('data-place')).toBe(place)
  expect(JSON.stringify(requests[1])).toContain('Why these words?')
  expect(JSON.stringify(requests[1])).toContain(selected)
  fireEvent.change(screen.getByTestId(view === 'margin' ? 'lab-phone-card-input' : 'lab-ask-input'), { target: { value: 'And one more question?' } })
  fireEvent.click(screen.getByTestId(view === 'margin' ? 'lab-phone-card-send' : 'lab-ask-send'))
  await waitFor(() => expect(requests).toHaveLength(3))
  await waitFor(() => expect(screen.getAllByText('And one more question?').filter(node => !node.closest('[hidden]'))).toHaveLength(1))
  expect(root.getAttribute('data-place')).toBe(place)
  expect(JSON.stringify(requests[2])).toContain('Why these words?')
  if (view === 'margin') {
    await waitFor(() => expect(readAllLabBookChats().flatMap(row => row.messages).some(message => message.content === 'And one more question?')).toBe(true))
    cleanup()
    render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} sharedReader />)
    fireEvent.click(await screen.findByTestId('source-margin-open'))
    fireEvent.change(screen.getByTestId('lab-phone-card-input'), { target: { value: 'Continue after reopening?' } })
    fireEvent.click(screen.getByTestId('lab-phone-card-send'))
    await waitFor(() => expect(requests).toHaveLength(4))
    expect(document.querySelector('.lab-ask')).toBeNull()
    expect(document.querySelector('.source-margin-item[data-open="true"]')).toBeTruthy()
    expect(JSON.stringify(requests[3])).toContain('And one more question?')
    await waitFor(() => expect(readAllLabBookChats().flatMap(row => row.messages).some(message => message.content === 'Continue after reopening?')).toBe(true))
    expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe(place)
  }
  fireEvent.change(screen.getByTestId(view === 'margin' ? 'lab-phone-card-input' : 'lab-ask-input'), { target: { value: 'Unsent draft to discard' } })
  fireEvent.click(screen.getByTestId(view === 'margin' ? 'source-margin-minimise' : 'lab-desktop-companion-close'))
  expect(root.getAttribute('data-place')).toBe(place)
  if (view === 'margin') {
    fireEvent.click(screen.getByTestId('source-margin-open'))
    expect(screen.queryByText('Continue discussion')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect((screen.getByTestId('lab-ask-input') as HTMLTextAreaElement).value).toBe('')
    expect(requests).toHaveLength(4)
    expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe(place)
  }
})

it.each(['define', 'primer', 'recap', 'catchup'])('keeps a saved %s card follow-up in the margin with shared history', async kind => {
  const requests: unknown[] = []
  const original = kind === 'define' ? JSON.stringify({ kind: 'definition', definition: 'A saved definition.' }) : 'A saved unit answer.'
  const id = 'mc_saved-follow'
  localStorage.setItem('tinct:chat-history:bible', JSON.stringify([{
    id, bookId: 'bible', chapterNumber: 1, paragraphIndex: 0, startTimestamp: 1000, endTimestamp: 1001,
    preview: original, messages: [{ id: 'saved-answer', role: 'assistant', content: original, timestamp: 1001, bookId: 'bible', chapterNumber: 1 }],
    card: { id: 'saved-follow', kind, chapterNumber: 1, at: 1000, u: 1001, text: 'A saved source passage', anchor: { editionKey: 'bsb-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 1, endParagraphIndex: 0, toWord: 4 } },
  }]))
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes('/api/lab-chat') || String(input).includes('/api/chat')) {
      requests.push(JSON.parse(String(init?.body)))
      return new Response('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A saved-card follow-up answer."}}\n\ndata: {"type":"message_stop"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })
    }
    return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } })
  }))
  window.history.replaceState(null, '', '/reader?sharedReader=1&layout=desktop&view=margin')
  render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root'), place = root.getAttribute('data-place')
  fireEvent.click(await screen.findByTestId('source-margin-open'))
  fireEvent.change(screen.getByTestId('lab-phone-card-input'), { target: { value: 'Continue this saved card?' } })
  fireEvent.click(screen.getByTestId('lab-phone-card-send'))
  await waitFor(() => expect(requests).toHaveLength(1))
  expect(document.querySelector('.lab-ask')).toBeNull()
  expect(document.querySelector('.source-margin-item[data-open="true"]')?.getAttribute('data-card-id')).toBe(id)
  expect(JSON.stringify(requests[0])).toContain('A saved source passage')
  expect(JSON.stringify(requests[0])).toContain(kind === 'define' ? 'A saved definition.' : original)
  await waitFor(() => expect(readAllLabBookChats().find(row => row.id === id)?.messages.some(message => message.content === 'A saved-card follow-up answer.')).toBe(true))
  expect(root.getAttribute('data-place')).toBe(place)
})
