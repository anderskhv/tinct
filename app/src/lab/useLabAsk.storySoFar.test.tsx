// @vitest-environment jsdom
//
// Talk's prepared story so far, through the hook the reader uses: fetched when
// the book opens, handed to the voice session as its prompt, and following the
// reader's chapter. The voice session itself is stubbed; nothing is opened.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useLabAsk, type UseLabAskOptions } from './useLabAsk'
import { GROK_STORY_SO_FAR_RULE, GROK_VOICE_INSTRUCTIONS, buildGrokVoiceInstructions } from '../voice/grokConfig'
import { resetStorySoFarCache, type StorySoFarFile } from '../voice/storySoFar'

const captured = vi.hoisted(() => ({ options: null as { reference?: string; instructions?: string } | null }))
vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../hooks/useVoiceSession', () => ({ useVoiceSession: (options: { reference?: string; instructions?: string }) => {
  captured.options = options
  return { state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }
} }))

const raw = readFileSync(resolve(__dirname, '../../public/data/story-so-far/sense-and-sensibility.json'), 'utf8')
const file = JSON.parse(raw) as StorySoFarFile
const STORY_URL = '/data/story-so-far/sense-and-sensibility.json'
const base: UseLabAskOptions = { bookId: 'sense-and-sensibility', editionKey: 'modern-en', editionLabel: 'Modern English', bookTitle: 'Sense and Sensibility', bookAuthor: 'Jane Austen', chapterLabel: 'Chapter 15', chapterNumber: 15, paragraphs: ['First.', 'Second.', 'Third.'], paragraphIndex: 1, signedIn: false, authToken: null, userId: null, voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'] }
const storyFetches = (fetcher: ReturnType<typeof vi.fn>) => fetcher.mock.calls.filter(call => String(call[0]).startsWith(STORY_URL))
const sentSummaries = (prompt: string) => file.chapters.filter(entry => prompt.includes(JSON.stringify(entry.summary).slice(1, -1))).map(entry => entry.number)
const upTo = (chapter: number) => Array.from({ length: chapter - 1 }, (_, index) => index + 1)

beforeEach(() => { resetStorySoFarCache(); captured.options = null })
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); resetStorySoFarCache() })

it('gives Talk the chapters before the reader\'s, with the rule, and follows the reader to another chapter', async () => {
  const fetcher = vi.fn(async (input: unknown) => String(input).startsWith(STORY_URL) ? new Response(raw, { status: 200 }) : new Response('{}', { status: 404 }))
  vi.stubGlobal('fetch', fetcher)
  const { rerender } = renderHook((options: UseLabAskOptions) => useLabAsk(options), { initialProps: base })
  // Before the file arrives Talk has exactly what it has today: reference only.
  expect(captured.options!.instructions).toBeUndefined()
  expect(captured.options!.reference).not.toContain('storySoFar')
  await waitFor(() => expect(captured.options!.instructions).toBeDefined())
  expect(storyFetches(fetcher)).toHaveLength(1)

  let prompt = captured.options!.instructions!
  expect(prompt.startsWith(`${GROK_VOICE_INSTRUCTIONS}\n${GROK_STORY_SO_FAR_RULE}\n\n`)).toBe(true)
  expect(prompt.endsWith(captured.options!.reference!)).toBe(true)
  expect(sentSummaries(prompt)).toEqual(upTo(15))

  rerender({ ...base, chapterNumber: 30, chapterLabel: 'Chapter 30' })
  prompt = captured.options!.instructions!
  expect(sentSummaries(prompt)).toEqual(upTo(30))
  expect(prompt.length).toBeLessThan(65_536)

  // Back at an earlier chapter the later summaries are gone again.
  rerender({ ...base, chapterNumber: 5, chapterLabel: 'Chapter 5' })
  expect(sentSummaries(captured.options!.instructions!)).toEqual(upTo(5))

  // At chapter 1 nothing has happened yet: the plain Tinct prompt, still set explicitly
  // so that a live session drops the prompt it was given for a later chapter.
  rerender({ ...base, chapterNumber: 1, chapterLabel: 'Chapter 1' })
  expect(captured.options!.instructions).toBe(buildGrokVoiceInstructions(captured.options!.reference!))
  expect(captured.options!.instructions).not.toContain(GROK_STORY_SO_FAR_RULE)
  expect(sentSummaries(captured.options!.instructions!)).toEqual([])
  expect(storyFetches(fetcher)).toHaveLength(1)
})

it('leaves Talk as it is when the file is missing', async () => {
  const fetcher = vi.fn(async () => new Response('Not found', { status: 404 }))
  vi.stubGlobal('fetch', fetcher)
  renderHook(() => useLabAsk(base))
  await waitFor(() => expect(storyFetches(fetcher)).toHaveLength(1))
  await new Promise(done => setTimeout(done, 20))
  expect(captured.options!.instructions).toBeUndefined()
  expect(captured.options!.reference).not.toContain('storySoFar')
})

it('never asks for a story file for another book, or for a reader\'s own book', async () => {
  const fetcher = vi.fn(async () => new Response('{}', { status: 404 }))
  vi.stubGlobal('fetch', fetcher)
  const { rerender } = renderHook((options: UseLabAskOptions) => useLabAsk(options), { initialProps: { ...base, bookId: 'emma', bookTitle: 'Emma' } })
  rerender({ ...base, bookId: 'bible', editionKey: 'kjv-en', bookTitle: 'The Bible' })
  await new Promise(done => setTimeout(done, 20))
  expect(fetcher.mock.calls.filter(call => String(call[0]).includes('story-so-far'))).toHaveLength(0)
  expect(captured.options!.instructions).toBeUndefined()
  expect(captured.options!.reference).not.toContain('storySoFar')
})
