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

it.each(['two-page', 'margin'])('hands an Explain follow-up into chat once without moving the book in %s', async view => {
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
  fireEvent.click(screen.getByTestId('lab-dbar-explain'))
  await waitFor(() => expect(screen.getByText('A local passage answer.')).toBeTruthy())
  const field = screen.getByTestId('lab-phone-card-input')
  fireEvent.change(field, { target: { value: 'Why these words?' } })
  fireEvent.click(screen.getByTestId('lab-phone-card-send'))
  await waitFor(() => expect(requests).toHaveLength(2))
  await waitFor(() => expect(screen.getAllByText('A local passage answer.').length).toBeGreaterThan(0))
  expect(document.querySelector('.lab-desktop-card[data-kind="ask"], .source-margin-item[data-open="true"] .lab-pcard-answer')).toBeNull()
  expect(document.querySelector('.lab-ask')).toBeTruthy()
  expect(screen.getAllByText('Why these words?').filter(node => !node.closest('[hidden]'))).toHaveLength(1)
  expect(screen.queryAllByTestId('lab-phone-card-input').filter(node => !node.closest('[hidden]'))).toHaveLength(0)
  expect(root.getAttribute('data-place')).toBe(place)
  expect(JSON.stringify(requests[1])).toContain('Why these words?')
  expect(JSON.stringify(requests[1])).toContain(selected)
  fireEvent.change(screen.getByTestId('lab-ask-input'), { target: { value: 'And one more question?' } })
  fireEvent.click(screen.getByTestId('lab-ask-send'))
  await waitFor(() => expect(requests).toHaveLength(3))
  await waitFor(() => expect(screen.getAllByText('And one more question?').filter(node => !node.closest('[hidden]'))).toHaveLength(1))
  expect(root.getAttribute('data-place')).toBe(place)
  expect(JSON.stringify(requests[2])).toContain('Why these words?')
  fireEvent.change(screen.getByTestId('lab-ask-input'), { target: { value: 'Unsent draft to discard' } })
  fireEvent.click(screen.getByTestId('lab-desktop-companion-close'))
  expect(root.getAttribute('data-place')).toBe(place)
  if (view === 'margin') {
    fireEvent.click(screen.getByTestId('source-margin-open'))
    fireEvent.click(screen.getByText('Continue discussion'))
    expect(screen.getByTestId('lab-ask-pane')).toBeTruthy()
    expect((screen.getByTestId('lab-ask-input') as HTMLTextAreaElement).value).toBe('')
    expect(requests).toHaveLength(3)
    expect(root.getAttribute('data-place')).toBe(place)
  }
})
