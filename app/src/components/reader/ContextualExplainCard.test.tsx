// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ContextualExplainCard } from './ContextualExplainCard'

afterEach(cleanup)

it('requests once across parent rerenders and opens an unsent follow-up', async () => {
  const first = vi.fn(async (onDelta: (text: string) => void) => {
    onDelta('A partial thought')
    return 'A complete explanation.'
  })
  const onAsk = vi.fn()
  const { rerender } = render(<ContextualExplainCard passage="The passage." request={first} onAsk={onAsk} onClose={vi.fn()} />)
  await screen.findByText('A complete explanation.')
  rerender(<ContextualExplainCard passage="The passage." request={vi.fn(first)} onAsk={onAsk} onClose={vi.fn()} />)
  expect(first).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole('button', { name: /Chat about this explanation/ }))
  expect(onAsk).toHaveBeenCalledOnce()
})

it('keeps the passage on failure and retries only when asked', async () => {
  const request = vi.fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce('Recovered explanation.')
  render(<ContextualExplainCard passage="Still visible." request={request} onAsk={vi.fn()} onClose={vi.fn()} />)
  expect(await screen.findByText('Still visible.')).toBeTruthy()
  await screen.findByText(/couldn’t be loaded/)
  expect(request).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  await waitFor(() => expect(screen.getByText('Recovered explanation.')).toBeTruthy())
  expect(request).toHaveBeenCalledTimes(2)
})

it('renders the full formatted explanation and passes the exact answer to Chat', async () => {
  const answer = '**Bold** and ***emphasised***.\n\n' + 'A long explanation. '.repeat(70)
  const onAsk = vi.fn()
  const { container } = render(<ContextualExplainCard passage="Selected text" request={async () => answer} onAsk={onAsk} onClose={vi.fn()} />)
  await screen.findByText('Bold')
  expect(container.querySelector('strong em')?.textContent).toBe('emphasised')
  expect(container.textContent).toContain('A long explanation. '.repeat(70).trim())
  expect(screen.queryByText('A little more')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Chat about this explanation' }))
  expect(onAsk).toHaveBeenCalledWith(answer)
})
