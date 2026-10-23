// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'
import type { LoadedUserBook } from './userBook/userBookStore'
import { USER_EDITION_FORMAT, USER_EDITION_CONVERTER } from './userBook/userEdition'

vi.mock('./LabContentsV2', () => ({ LabContentsV2: ({ legacyOwnEpubItems }: { legacyOwnEpubItems?: { id: string }[] }) => (
  <div data-testid="legacy-notebook-bridge">{legacyOwnEpubItems?.map(item => item.id).join(',') ?? 'none'}</div>
) }))

afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); vi.restoreAllMocks() })

const own = (kind?: 'epub' | 'pdf'): LoadedUserBook => ({
  hex: '0123456789abcdef01234567', bookId: 'userbook-0123456789abcdef01234567',
  kind, images: new Map(), place: null, edition: {
    format: USER_EDITION_FORMAT, converter: USER_EDITION_CONVERTER,
    source: kind === 'pdf' ? 'pdf' : 'epub', title: 'Owned book', author: 'Fixture', language: 'en',
    chapters: [{ number: 1, title: 'Opening', paragraphs: ['Owned source words'], kinds: [], links: [], figures: [] }],
  } as LoadedUserBook['edition'],
})
const legacy = [{ id: 'claimed-old-epub-mark', kind: 'highlight' as const, text: 'Old quote', page: 3, at: 100 }]

it('projects claimed legacy EPUB marks when the loader omits kind, but not for PDFs or the public reader', () => {
  for (const [kind, shared, expected] of [[undefined, true, 'claimed-old-epub-mark'], ['pdf', true, 'none'], [undefined, false, 'none']] as const) {
    const view = render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null}
      userBook={own(kind)} sharedReader={shared} legacyOwnEpubItems={legacy} />)
    expect(screen.getByTestId('legacy-notebook-bridge').textContent).toBe(expected)
    view.unmount()
  }
})
