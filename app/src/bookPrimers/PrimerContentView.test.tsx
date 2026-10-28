// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PrimerContentView } from './PrimerContentView'
import type { SavedPrimer } from './model'
afterEach(cleanup)
const primer: SavedPrimer = {
  identity: { scope: { kind: 'public' }, workId: 'work', editionId: 'edition', sourceVersion: 'v1', unitId: 'letter-1', type: 'chapter', language: 'en' },
  content: { opening: 'An opening letter addresses a reader.', structure: [], peopleAndIdeas: [], helpfulContext: [], usefulReferences: [], whatToNotice: [{ title: 'The address', explanation: 'Notice whom the letter addresses.', quotes: [{ text: 'Dear reader', passageId: 'letter-1:p1' }] }] },
  resources: [], origin: 'approved', createdAt: '2026-10-28', promptVersion: '1',
}
it('uses native disclosure and source callbacks without approval labels or empty rows', () => {
  const onPassage = vi.fn(), onDiscuss = vi.fn()
  render(<PrimerContentView primer={primer} onPassage={onPassage} onDiscuss={onDiscuss} />)
  expect(screen.getByText(primer.content.opening)).toBeTruthy()
  expect(screen.queryByText('Structure')).toBeNull()
  expect(screen.queryByText('Watch & explore')).toBeNull()
  expect(screen.queryByText('approved')).toBeNull()
  expect(screen.getByText('What to notice').tagName).toBe('SUMMARY')
  fireEvent.click(screen.getByText('Read passage'))
  expect(onPassage).toHaveBeenCalledWith('letter-1:p1', 'Dear reader')
  fireEvent.click(screen.getByText('Discuss this'))
  expect(onDiscuss).toHaveBeenCalledOnce()
})
