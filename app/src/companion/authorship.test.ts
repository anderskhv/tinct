import { describe, expect, it } from 'vitest'
import { buildCompanionSystem, parseCompanionRequest } from './companionRequest'
import { chapterAuthorship, promptAuthor, sourceAuthorship } from './authorship'
import { buildLabTalkReference } from '../lab/labDirectVoice'
import { buildLabTalkInstructions, buildCompanionHopUserContent } from '../lab/labCompanion'
import { createChapterChatRequest } from '../lab/labChapterChat'
import { buildGrokReaderReference } from '../voice/grokConfig'
import { buildVoiceReaderContext } from '../voice/context'
import { userBookLabSource } from '../lab/userBook/userBookSource'
import { USER_EDITION_CONVERTER, USER_EDITION_FORMAT, type UserBookEdition } from '../lab/userBook/userEdition'

// No network: every prompt here is assembled locally, as the Worker assembles it.
const essays = {
  bookTitle: 'Bold Conjectures', bookAuthor: 'Sam Kuypers', chapterLabel: 'The Beginning of Infinity', chapterNumber: 2,
  editionLabel: 'EPUB', paragraphs: ['by David Deutsch', 'Progress that is both rapid and sustained has only ever happened once.'], paragraphIndex: 1,
  bookId: 'pd-bold', editionKey: 'original-en',
}
const odyssey = {
  bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 1', chapterNumber: 1,
  editionLabel: 'Butler', paragraphs: ['Tell me, O muse, of that ingenious hero.', 'Athena spoke.'], paragraphIndex: 1,
  bookId: 'odyssey', editionKey: 'original-en',
}

const system = (body: unknown) => buildCompanionSystem(parseCompanionRequest(body)!)

describe('prompt authorship', () => {
  it('names the chapter’s own writer in a collection, never the editor, for Chat and Explain', () => {
    const authorship = { collection: true, chapterAuthor: 'David Deutsch' }
    for (const prompt of [
      system({ intent: 'ask', context: { ...essays, authorship } }),
      system({ intent: 'explain', context: { ...essays, authorship }, selection: 'rapid and sustained' }),
    ]) {
      expect(prompt).toContain('Right now reading: Bold Conjectures (a collection by several writers) — The Beginning of Infinity (EPUB).')
      expect(prompt).toContain('this chapter is by David Deutsch. Name David Deutsch as its author')
      expect(prompt).not.toContain('Bold Conjectures by Sam Kuypers')
    }
  })

  it('says “the author” for a collection’s chapter without a byline', () => {
    const prompt = system({ intent: 'ask', context: { ...essays, authorship: { collection: true } } })
    expect(prompt).toContain('this chapter names no writer. Refer to its writer as "the author"; never attribute it to the book\'s credit (Sam Kuypers)')
    expect(prompt).not.toContain('by Sam Kuypers')
    expect(promptAuthor('Sam Kuypers', { collection: true })).toBe('the author')
  })

  it('leaves a single-author book’s prompt exactly as before', () => {
    const plain = system({ intent: 'ask', context: odyssey })
    expect(plain).toContain('Right now reading: The Odyssey by Homer — Book 1 (Butler).')
    expect(plain).not.toContain('Authorship:')
    // A malformed authorship is no authorship.
    expect(system({ intent: 'ask', context: { ...odyssey, authorship: { collection: 'yes', chapterAuthor: 'X Y' } } })).toBe(plain)
    expect(chapterAuthorship({}, {})).toBeUndefined()
  })

  it('bounds the chapter writer a request carries', () => {
    const parsed = parseCompanionRequest({ intent: 'ask', context: { ...essays, authorship: { collection: true, chapterAuthor: `<b>${'N'.repeat(500)}` } } })!
    expect(parsed.context!.authorship!.chapterAuthor).toHaveLength(120)
    expect(parsed.context!.authorship!.chapterAuthor).not.toMatch(/[<>]/)
  })

  it('a chapter action names the writer of the chapter it is about; Primer and Prepare included', () => {
    const chapters = [{ number: 2, title: 'The Beginning of Infinity', author: 'David Deutsch' }, { number: 3, title: 'On Conjecture', author: 'Brett Hall' }, { number: 4, title: 'Afterword' }]
    const context = { ...essays, authorship: { collection: true as const, chapterAuthor: 'David Deutsch' } }
    const preview = createChapterChatRequest('preview', context, chapters)!
    expect(preview.context.authorship).toEqual({ collection: true, chapterAuthor: 'David Deutsch' })
    const prepare = createChapterChatRequest('prepare', context, chapters)!
    expect(prepare.context.authorship).toEqual({ collection: true, chapterAuthor: 'Brett Hall' })
    const prompt = system({ intent: 'chapter', context: prepare.context, chapter: { action: prepare.action, target: ['An interview with Brett Hall', 'We sat down.'] } })
    expect(prompt).toContain('"author":"Brett Hall"')
    expect(prompt).toContain('the next chapter is by Brett Hall')
    const lastContext = { ...essays, chapterNumber: 3, chapterLabel: 'On Conjecture', authorship: { collection: true as const, chapterAuthor: 'Brett Hall' } }
    const unnamed = createChapterChatRequest('prepare', lastContext, chapters)!
    expect(unnamed.context.authorship).toEqual({ collection: true })
    expect(system({ intent: 'chapter', context: unnamed.context, chapter: { action: unnamed.action, target: ['Thanks.'] } })).toContain('"author":"the author"')
    // One author's book: no authorship travels.
    expect(createChapterChatRequest('preview', odyssey, [{ number: 1, title: 'Book 1' }])!.context.authorship).toBeUndefined()
  })

  it('Talk’s persona context and the voice references name the chapter’s writer', () => {
    const authorship = { collection: true as const, chapterAuthor: 'David Deutsch' }
    expect(JSON.parse(buildLabTalkReference({ ...essays, authorship }, [])).author).toBe('David Deutsch')
    expect(JSON.parse(buildLabTalkReference(odyssey, [])).author).toBe('Homer')
    expect(JSON.parse(buildLabTalkReference(odyssey, [])).authorship).toBeUndefined()
    const voice = { ...essays, chapterLabel: essays.chapterLabel, authorship }
    expect(JSON.parse(buildGrokReaderReference(voice)).author).toBe('David Deutsch')
    expect(buildVoiceReaderContext({ ...voice, authorship: { collection: true } })).toContain('names no writer. Refer to its writer as "the author"')
    expect(buildLabTalkInstructions({ ...essays, authorship })).toContain('this chapter is by David Deutsch')
    expect(buildCompanionHopUserContent({ ...odyssey, question: 'Who?' })).toContain('Book: The Odyssey by Homer')
  })

  it('a loaded book carries its collection flag and each chapter’s writer to the reader', () => {
    const edition: UserBookEdition = {
      format: USER_EDITION_FORMAT, converter: USER_EDITION_CONVERTER, title: 'Bold Conjectures', author: 'Sam Kuypers', collection: true, language: 'en', droppedImages: 0,
      chapters: [
        { number: 1, title: 'Introduction', paragraphs: ['This book collects essays.'] },
        { number: 2, title: 'The Beginning of Infinity', paragraphs: ['by David Deutsch', 'Progress.'], kinds: ['byline', null], author: 'David Deutsch' },
      ],
    }
    const source = userBookLabSource('user-bold', edition, 2)
    expect(source.collection).toBe(true)
    expect(sourceAuthorship(source, 2)).toEqual({ collection: true, chapterAuthor: 'David Deutsch' })
    expect(sourceAuthorship(source, 1)).toEqual({ collection: true })
    const single = userBookLabSource('user-one', { ...edition, collection: undefined, chapters: [edition.chapters[0]] }, 1)
    expect(single.collection).toBeUndefined()
    expect(sourceAuthorship(single, 1)).toBeUndefined()
  })
})
