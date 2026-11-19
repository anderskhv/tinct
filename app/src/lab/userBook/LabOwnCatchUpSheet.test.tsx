// @vitest-environment jsdom
//
// The whole book's Summary on an own book never fails silently: a failure says why above Retry
// (13 Nov 2026). The Worker is a stub; no provider is reached.
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabOwnCatchUpSheet } from './LabOwnCatchUpSheet'

const HEX = 'ab12cd34ef56ab12cd34ef56'
const chapters = [
  { number: 1, title: 'About the Author', paragraphs: ['David Deutsch is a physicist.'] },
  { number: 2, title: 'The Theory of Everything', paragraphs: ['Explanation is the point of science.', 'More text.'] },
]

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

function open(post: () => Response) {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
    (init?.method ?? 'GET') === 'GET' ? Response.json({ steps: [], current: null }) : post()))
  render(<LabOwnCatchUpSheet embedded wholeBook bookHex={HEX} bookTitle="The Fabric of Reality" chapters={chapters} chapterNumber={1} paragraphIndex={0} completed
    readToken={async () => 'token'} onClose={() => {}} onChat={() => {}} onTalk={() => {}} />)
}

it('a failed whole-book Summary says why, with Retry', async () => {
  open(() => Response.json({ error: 'Not found' }, { status: 404 }))
  expect((await screen.findByTestId('lab-catch-up-reason')).textContent).toBe('This book is not in your account’s library, so it cannot be summarised.')
  expect(screen.getByTestId('lab-catch-up-retry')).toBeTruthy()
  expect(screen.getByText('The whole book')).toBeTruthy()
})

it('a finished whole-book Summary shows the recap and no reason', async () => {
  open(() => Response.json({ recap: 'Deutsch argues that explanation is the point of science.', chapter: 2, complete: true, cached: false }))
  expect(await screen.findByText('Deutsch argues that explanation is the point of science.')).toBeTruthy()
  expect(screen.queryByTestId('lab-catch-up-reason')).toBeNull()
})

it('embedded in a margin card it is the timeline only: no sheet layer, no floating window of its own', async () => {
  open(() => Response.json({ recap: 'Deutsch argues that explanation is the point of science.', chapter: 2, complete: true, cached: false }))
  await screen.findByText('Deutsch argues that explanation is the point of science.')
  expect(screen.queryByTestId('lab-catch-up-layer')).toBeNull()
  expect(screen.queryByTestId('lab-catch-up')).toBeNull()
  expect(document.querySelector('[data-reader-window]')).toBeNull()
})
