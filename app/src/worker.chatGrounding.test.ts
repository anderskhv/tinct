import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleLabChat } from './worker/routes/chat'
import { buildCompanionSystemParts, parseCompanionRequest } from './companion/companionRequest'
import {
  LAB_ASK_CHECKED_SPECIFICS_RULE,
  LAB_ASK_GROUND_FIRST_RULE,
  LAB_ASK_POLICY,
  LAB_ASK_RECHECK_RULE,
  paragraphVerses,
} from './companion/labAskPrompt'
import { MARGIN_GROUNDING_RULES, MARGIN_GROUND_FIRST_RULE, MARGIN_LAB_ASK_POLICY, MARGIN_RECHECK_RULE } from './companion/marginPrompts'
import { MARGIN_RULES } from './companion/marginContext'

// Anders, 21 Oct 2026 ("go on chat"): at 1 Maccabees 13:11 a reader asked "Is this the same Jonathan that was
// captured?" and Chat answered from memory. The rules ground "this" in the reader's place; they sit in the
// cached prefix, and the place is marked after the breakpoint.
const MACCABEES_13 = [
  '¹ Simon heard that Tryphon had gathered together a mighty army to come into the land of Judah and destroy it utterly.',
  '⁷ The spirit of the people revived as soon as they heard these words.',
  '¹⁰ He gathered together all the men of war, and hurried to finish the walls of Jerusalem. He fortified it all around. ¹¹ He sent Jonathan the son of Absalom, and with him a great army, to Joppa.',
  '¹² Tryphon left Ptolemais with a mighty army to enter into the land of Judah, and Jonathan was with him under guard.',
]
const RULES = [LAB_ASK_GROUND_FIRST_RULE, LAB_ASK_CHECKED_SPECIFICS_RULE, LAB_ASK_RECHECK_RULE]

const count = (text: string, part: string) => text.split(part).length - 1

function askContext(paragraphIndex: number) {
  return {
    bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: '1 Maccabees 13', paragraphs: MACCABEES_13, paragraphIndex,
    bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 900,
  }
}

function askParts(paragraphIndex: number) {
  const request = parseCompanionRequest({ intent: 'ask', context: askContext(paragraphIndex) })
  expect(request).not.toBeNull()
  return buildCompanionSystemParts(request!)!
}

describe('grounding rules in the reader Chat prompt', () => {
  it('holds each rule once, in the cached part, never in the part that moves', () => {
    for (const rule of RULES) expect(count(LAB_ASK_POLICY, rule), rule).toBe(1)
    const parts = askParts(2)
    for (const rule of RULES) {
      expect(count(parts.stable, rule), rule).toBe(1)
      expect(parts.volatile).not.toContain(rule)
    }
  })

  it('marks the verses the reader is at, before the paragraph, after the breakpoint', () => {
    const { stable, volatile } = askParts(2)
    expect(volatile).toContain('The reader is on paragraph 3 of 4.')
    expect(volatile).toContain('The reader is at: 1 Maccabees 13, verses 10 to 11, the current paragraph below.\n\nCurrent paragraph [3]:\n"¹⁰ He gathered')
    expect(count(volatile, 'The reader is at:')).toBe(1)
    expect(stable).not.toMatch(/^The reader is at:/m)
    expect(askParts(3).volatile).toContain('The reader is at: 1 Maccabees 13, verse 12, the current paragraph below.')
  })

  it('names the chapter alone for prose, and never reads a footnote mark as a verse', () => {
    expect(paragraphVerses('Call me Ishmael. Some years ago¹ I went to sea.')).toBeNull()
    expect(paragraphVerses('²¹ Then Zedekiah the king commanded.')).toBe('verse 21')
    expect(paragraphVerses('¹ In the beginning. ² The earth was formless. ³ God said.')).toBe('verses 1 to 3')
    const request = parseCompanionRequest({ intent: 'ask', context: { bookTitle: 'Moby-Dick', bookAuthor: 'Herman Melville', chapterLabel: 'Chapter 1', paragraphs: ['Call me Ishmael.'], paragraphIndex: 0 } })!
    expect(buildCompanionSystemParts(request)!.volatile).toContain('The reader is at: Chapter 1, the current paragraph below.')
  })

  it('keeps the cached part byte for byte when the reader moves within the chapter', () => {
    expect(askParts(0).stable).toBe(askParts(3).stable)
  })

  it('gives the margin the same rules, its re-check without "I was wrong" (a margin answer stands alone)', () => {
    expect(count(MARGIN_LAB_ASK_POLICY, LAB_ASK_GROUND_FIRST_RULE)).toBe(1)
    expect(count(MARGIN_LAB_ASK_POLICY, LAB_ASK_CHECKED_SPECIFICS_RULE)).toBe(1)
    expect(count(MARGIN_LAB_ASK_POLICY, MARGIN_RECHECK_RULE)).toBe(1)
    expect(MARGIN_LAB_ASK_POLICY).not.toContain(LAB_ASK_RECHECK_RULE)
    for (const rule of MARGIN_GROUNDING_RULES) expect(count(MARGIN_RULES, rule), rule).toBe(1)
    expect(MARGIN_GROUND_FIRST_RULE).not.toContain('The reader is at:')
    expect(MARGIN_RULES).not.toContain('I was wrong')
  })
})

describe('grounding rules through the Worker', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the same cached prefix for two messages of one conversation, the place after it', async () => {
    const assets = {
      fetch: async (request: Request) => {
        const path = new URL(request.url).pathname
        if (path.endsWith('/manifest.json')) {
          return Response.json({ chapters: Array.from({ length: 900 }, (_, i) => ({ number: i + 1, title: i === 899 ? '1 Maccabees 13' : `Chapter ${i + 1}`, path: `ch${String(i + 1).padStart(4, '0')}.json` })), sections: [] })
        }
        return new Response('not found', { status: 404 })
      },
    }
    const bodies: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) !== 'https://api.anthropic.com/v1/messages') return Response.json({ error: 'unexpected fetch' }, { status: 500 })
      bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
      return Response.json({ id: 'msg', type: 'message', role: 'assistant', content: [{ type: 'text', text: 'Verse 11 names Jonathan the son of Absalom.' }], stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 } })
    }))
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext
    const ask = (messages: Array<{ role: string; content: string }>) => handleLabChat(
      new Request('https://tinct.app/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages, companion: { intent: 'ask', context: askContext(2) } }),
      }),
      { ANTHROPIC_API_KEY: 'anthropic-key', ASSETS: assets } as never,
      ctx,
      async () => true,
      async () => true,
    )

    const first = [{ role: 'user', content: 'Is this the same Jonathan that was captured?' }]
    expect((await ask(first)).status).toBe(200)
    expect((await ask([...first, { role: 'assistant', content: 'Verse 11 names Jonathan the son of Absalom.' }, { role: 'user', content: 'Are you sure?' }])).status).toBe(200)

    expect(bodies).toHaveLength(2)
    const [one, two] = bodies.map(body => body.system as Array<{ type: string; text: string; cache_control?: unknown }>)
    expect(one).toHaveLength(2)
    expect(one[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(one[1].cache_control).toBeUndefined()
    for (const rule of RULES) expect(count(one[0].text, rule), rule).toBe(1)
    expect(one[1].text).toContain('The reader is at: 1 Maccabees 13, verses 10 to 11, the current paragraph below.')
    expect(two[0]).toEqual(one[0])
    expect((bodies[1].messages as unknown[]).length).toBe(3)
  })
})
