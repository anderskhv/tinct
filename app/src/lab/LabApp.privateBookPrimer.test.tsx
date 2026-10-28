// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'
import type { LoadedUserBook } from './userBook/userBookStore'
import { USER_EDITION_FORMAT, USER_EDITION_CONVERTER } from './userBook/userEdition'
const capture = vi.hoisted(() => ({ notes: null as any }))
vi.mock('./LabContentsV2', () => ({ LabContentsV2: ({ onOpenIntroduction }: any) => onOpenIntroduction ? <button onClick={onOpenIntroduction}>Private book primer</button> : null }))
vi.mock('./LabChapterNotesSheet', () => ({ LabChapterNotesSheet: (props: any) => { capture.notes = props; return <div>Whole book opened</div> } }))
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); capture.notes = null })
const book: LoadedUserBook = { hex: '0123456789abcdef01234567', bookId: 'userbook-0123456789abcdef01234567', kind: 'epub', images: new Map(), place: null, edition: {
 format: USER_EDITION_FORMAT, converter: USER_EDITION_CONVERTER, source: 'epub', title: 'Letters', author: 'Fixture', language: 'en',
 chapters: [{ number: 1, title: 'First letter', paragraphs: ['First letter source.'] }, { number: 2, title: 'Second letter', paragraphs: ['Second letter source.'] }],
} as LoadedUserBook['edition'] }
it('opens the complete owned edition in the existing primer sheet without leaving the reader', () => {
 render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} userBook={book} userBookOwner="owner" sharedReader />)
 fireEvent.click(screen.getByText('Private book primer'))
 expect(screen.getByText('Whole book opened')).toBeTruthy()
 expect(capture.notes.request.primerType).toBe('book')
 expect(capture.notes.own.bookChapters).toEqual(book.edition.chapters)
 expect(capture.notes.own.structured).toMatchObject({ ownerId: 'owner', uploadId: book.hex, workId: book.bookId })
})
it('does not offer this EPUB feature to PDFs or without the upload owner', () => {
 for (const [kind, owner] of [['pdf', 'owner'], ['epub', undefined]] as const) {
  const view = render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} userBook={{ ...book, kind }} userBookOwner={owner} sharedReader />)
  expect(screen.queryByText('Private book primer')).toBeNull(); view.unmount()
 }
})
