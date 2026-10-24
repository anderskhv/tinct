// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear(); window.history.replaceState(null, '', '/') })
it('submits desktop Ask once with the selected passage and keeps its answer anchored in the reader', async () => {
  const requests: unknown[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes('/api/lab-chat') || String(input).includes('/api/chat')) {
      requests.push(JSON.parse(String(init?.body)))
      return new Response('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A local passage answer."}}\n\ndata: {"type":"message_stop"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })
    }
    return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } })
  }))
  window.history.replaceState(null, '', '/reader?sharedReader=1&layout=desktop')
  render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root'), place = root.getAttribute('data-place')
  const words = screen.getAllByTestId('lab-word'), selected = words.slice(1, 4).map(w => w.textContent?.trim()).join(' ')
  fireEvent.pointerDown(words[1], { pointerId: 51, pointerType: 'mouse', button: 0, clientX: 100, clientY: 200 })
  fireEvent.pointerMove(words[3], { pointerId: 51, pointerType: 'mouse', clientX: 240, clientY: 200 })
  fireEvent.pointerUp(words[3], { pointerId: 51, pointerType: 'mouse', clientX: 240, clientY: 200 })
  fireEvent.click(screen.getByTestId('lab-dbar-ask'))
  const field = screen.getByTestId('lab-phone-card-input')
  fireEvent.change(field, { target: { value: 'Why these words?' } })
  fireEvent.click(screen.getByTestId('lab-phone-card-send'))
  await waitFor(() => expect(requests).toHaveLength(1))
  await waitFor(() => expect(screen.getByText('A local passage answer.')).toBeTruthy())
  expect(document.querySelector('.lab-desktop-card[data-kind="ask"]')).toBeTruthy()
  expect(document.querySelector('.lab-ask')).toBeNull()
  expect(root.getAttribute('data-place')).toBe(place)
  expect(JSON.stringify(requests[0])).toContain('Why these words?')
  expect(JSON.stringify(requests[0])).toContain(selected)
})
