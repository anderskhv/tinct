import { describe, expect, it, vi } from 'vitest'
import { VOICE_AGENT_POLICY } from '../voice/context'
import {
  ASK_COMPANION_TOOL,
  LAB_ASK_COMPANION_TOOL,
  LAB_HOP_FALLBACK,
  LAB_HOP_MAX_TOKENS,
  LAB_HOP_SPOKEN_LENGTH,
  SPEAK_COMPANION_VERBATIM,
  buildCompanionHopUserContent,
  buildLabTalkInstructions,
  companionHopLooksIncomplete,
  companionSpeakInstructions,
  directCompanionAnswer,
  firstSpeakableChunk,
  isLabPlaybackUtterance,
  playbackToolForUtterance,
  queryLabCompanion,
  remainderAfterSpeakable,
  remainingCompanionSpeech,
  shouldEscalateToCompanion,
  spokenCompanionAnswer,
} from './labCompanion'
import { LAB_VOICE_TOOLS } from './labAsk'

const CONTEXT = {
  bookTitle: 'The Odyssey',
  bookAuthor: 'Homer',
  chapterLabel: 'Book 1',
  paragraphs: [
    'Tell me, O Muse, of that ingenious hero.',
    'So now all who escaped death in battle or by shipwreck had got safely home except Ulysses.',
    'Now Neptune had gone off to the Ethiopians.',
  ],
  paragraphIndex: 0,
  readingAngle: 'homecoming',
}

describe('lab escalate gate', () => {
  it('does not escalate playback commands or tiny confirms', () => {
    expect(isLabPlaybackUtterance('go faster')).toBe(true)
    expect(isLabPlaybackUtterance('next chapter')).toBe(true)
    expect(isLabPlaybackUtterance('play this chapter from the beginning')).toBe(true)
    expect(isLabPlaybackUtterance('resume')).toBe(true)
    expect(isLabPlaybackUtterance('skip ahead')).toBe(true)
    expect(shouldEscalateToCompanion('go faster')).toBe(false)
    expect(shouldEscalateToCompanion('next chapter')).toBe(false)
    expect(shouldEscalateToCompanion('resume')).toBe(false)
    expect(shouldEscalateToCompanion('skip')).toBe(false)
    expect(shouldEscalateToCompanion('play')).toBe(false)
    expect(shouldEscalateToCompanion('ok')).toBe(false)
    expect(shouldEscalateToCompanion('thanks')).toBe(false)
    expect(shouldEscalateToCompanion('yes')).toBe(false)
  })

  it('escalates book questions that need a mind', () => {
    expect(shouldEscalateToCompanion('what does this mean')).toBe(true)
    expect(shouldEscalateToCompanion('Compare Athena and Telemachus here.')).toBe(true)
    expect(shouldEscalateToCompanion('What is the theological argument in this council?')).toBe(true)
    expect(shouldEscalateToCompanion('Who is Calypso in this opening?')).toBe(true)
    expect(shouldEscalateToCompanion('Why does Poseidon stay away?')).toBe(true)
  })
})

describe('lab talk tools', () => {
  it('includes ask_companion and keeps playback tools off that hop', () => {
    const names = LAB_VOICE_TOOLS.map(tool => tool.name)
    expect(names).toContain(ASK_COMPANION_TOOL)
    expect(LAB_ASK_COMPANION_TOOL.name).toBe('ask_companion')
    expect(names).toContain('set_playback_speed')
    expect(names).toContain('next_chapter')
    expect(names).toContain('restart_chapter')
    expect(names).toContain('resume_audiobook')
    expect(names).toContain('end_voice_session')
    expect(playbackToolForUtterance('go faster')).toBe('set_playback_speed')
    expect(playbackToolForUtterance('next chapter')).toBe('next_chapter')
    expect(playbackToolForUtterance('I missed that, play this chapter from the beginning')).toBe('restart_chapter')
    expect(playbackToolForUtterance('resume')).toBe('resume_audiobook')
  })
})

describe('talk instructions stay direct and concise', () => {
  it('keeps Realtime on tools without praise or narrated-process filler', () => {
    const talk = buildLabTalkInstructions(CONTEXT)
    expect(talk).toContain(ASK_COMPANION_TOOL)
    expect(talk).toContain('call ask_companion immediately and stay silent')
    expect(talk).toContain('Do not praise the question or narrate your process')
    expect(talk).toContain('speak its answer once')
    expect(talk).toContain(`Never call ${ASK_COMPANION_TOOL} for those`)
    expect(talk).toContain('only have this chapter so far')
    expect(talk).toContain('The reader is on paragraph 1 of 3')
    expect(talk).toContain('Reading angle: homecoming')
    expect(talk).not.toContain(VOICE_AGENT_POLICY)
    expect(talk).not.toContain('Speak for about 20')
  })
})

describe('tool result is what she is told to speak', () => {
  it('puts Claude\'s answer in the spoken instructions', () => {
    const answer = 'Telemachus is being given a path.'
    const instructions = companionSpeakInstructions(answer)
    expect(instructions).toContain(SPEAK_COMPANION_VERBATIM)
    expect(instructions).toContain(answer)
    expect(instructions).toContain('Speak only the answer below, once')
    expect(SPEAK_COMPANION_VERBATIM).not.toMatch(/the answer I received|good question/i)
  })
})

describe('spoken-length hop', () => {
  it('asks Claude for a few spoken sentences with room for a complete thought', () => {
    expect(LAB_HOP_SPOKEN_LENGTH).toMatch(/two to four spoken sentences/)
    expect(LAB_HOP_SPOKEN_LENGTH).toMatch(/reader explicitly asks for depth/)
    expect(LAB_HOP_SPOKEN_LENGTH).toMatch(/Finish the thought/)
    expect(LAB_HOP_MAX_TOKENS).toBeGreaterThan(256)
    expect(LAB_HOP_MAX_TOKENS).toBeLessThanOrEqual(1024)
    expect(firstSpeakableChunk('Athena is already beside him.')).toBe('Athena is already beside him.')
    expect(firstSpeakableChunk('Hi.')).toBeNull()
    expect(remainderAfterSpeakable(
      'Athena is already beside him.',
      'Athena is already beside him. The council is about homecoming.',
    )).toBe('The council is about homecoming.')
    expect(remainingCompanionSpeech(
      'Athena is already beside him',
      'Athena is already beside him. The council is about homecoming.',
    )).toBe('The council is about homecoming.')
    expect(remainingCompanionSpeech(
      'Athena is already beside him.',
      'Athena stands beside him. The council is about homecoming.',
    )).toBe('Athena stands beside him. The council is about homecoming.')
    expect(companionHopLooksIncomplete('Keller would treat Genesis 1 as primarily a theological statement', 'max_tokens')).toBe(true)
    expect(companionHopLooksIncomplete('Keller would treat Genesis 1 as a theological statement.')).toBe(false)
    expect(spokenCompanionAnswer('Keller would treat Genesis 1 as a theological statement. He would then')).toBe('Keller would treat Genesis 1 as a theological statement.')
    expect(directCompanionAnswer('Good question. Let me think. The frame is twice removed from the event.')).toBe('The frame is twice removed from the event.')
  })
})

describe('signed-out lab hop', () => {
  it('posts question plus book place to /api/lab-chat without a bearer', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ content: [{ text: 'Paul wrote Romans.' }] }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const hop = buildCompanionHopUserContent({
      ...CONTEXT,
      question: 'Who is speaking in this opening?',
    })
    expect(hop).toContain('Who is speaking in this opening?')
    expect(hop).toContain('Book: The Odyssey by Homer')
    expect(hop).toContain('Chapter: Book 1')
    expect(hop).toContain('How far read: paragraph 1 of 3')
    expect(hop).toContain('So now all who escaped death')

    const result = await queryLabCompanion({
      authToken: null,
      system: 'only have this chapter so far',
      question: 'Who is speaking in this opening?',
      context: CONTEXT,
    })

    expect(result).toMatchObject({ status: 'completed', answer: 'Paul wrote Romans.', attempts: 1 })
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/lab-chat')
    expect(String(fetchMock.mock.calls[0][0])).not.toMatch(/\/api\/chat$/)
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.headers).not.toHaveProperty('Authorization')
    const body = JSON.parse(String(init.body)) as {
      model: string
      stream?: boolean
      max_tokens: number
      system: string
      messages: Array<{ content: string }>
    }
    expect(body.model).toBe('claude-sonnet-4-6')
    expect(body.stream).toBe(true)
    expect(body.max_tokens).toBe(LAB_HOP_MAX_TOKENS)
    expect(body.system).toContain('only have this chapter so far')
    expect(body.system).toContain(LAB_HOP_SPOKEN_LENGTH)
    expect(body.messages[0].content).toContain('Who is speaking in this opening?')
    expect(body.messages[0].content).toContain('How far read: paragraph 1 of 3')
    vi.unstubAllGlobals()
  })

  it('speaks the first sentence before the stream finishes', async () => {
    const encoder = new TextEncoder()
    const chunks = [
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Athena is already beside him."}}\n\n',
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":" The council is about homecoming."}}\n\n',
    ]
    let pull = 0
    let firstAtPull = -1
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        if (pull >= chunks.length) {
          controller.close()
          return
        }
        await new Promise(resolve => setTimeout(resolve, 15))
        controller.enqueue(encoder.encode(chunks[pull]))
        pull += 1
      },
    })
    vi.stubGlobal('fetch', vi.fn(async () => new Response(stream, {
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
    })))

    const first = queryLabCompanion({
      authToken: null,
      system: 'only have this chapter so far',
      question: 'Who is Athena here?',
      context: CONTEXT,
      onFirstSpeakable: () => {
        if (firstAtPull < 0) firstAtPull = pull
      },
    })
    const result = await first
    expect(result.answer).toBe('Athena is already beside him. The council is about homecoming.')
    expect(firstAtPull).toBeGreaterThan(0)
    expect(firstAtPull).toBeLessThan(2)
    vi.unstubAllGlobals()
  })

  it('asks the companion again once when the first hop is cut off', async () => {
    const encoder = new TextEncoder()
    const truncated = 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Keller would treat Genesis 1 as primarily a theological statement"}}\n\ndata: {"type":"message_delta","delta":{"stop_reason":"max_tokens"}}\n\n'
    const complete = 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Keller would treat Genesis 1 as a theological statement of God\'s good world."}}\n\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}\n\n'
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(encoder.encode(truncated), {
        status: 200,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      }))
      .mockResolvedValueOnce(new Response(encoder.encode(complete), {
        status: 200,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await queryLabCompanion({
      authToken: null,
      system: 'only have this chapter so far',
      question: 'How would Tim Keller read this Genesis 1?',
      context: CONTEXT,
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result).toMatchObject({
      status: 'completed',
      answer: "Keller would treat Genesis 1 as a theological statement of God's good world.",
      attempts: 2,
    })
    expect(result.answer).not.toMatch(/cut off|the answer I received/i)
    vi.unstubAllGlobals()
  })

  it('never returns a partial answer after both attempts are incomplete', async () => {
    const encoder = new TextEncoder()
    const truncated = 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"The frame asks us to notice"}}\n\ndata: {"type":"message_delta","delta":{"stop_reason":"max_tokens"}}\n\n'
    const fetchMock = vi.fn(async () => new Response(encoder.encode(truncated), {
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
    }))
    vi.stubGlobal('fetch', fetchMock)
    const retries: string[] = []

    const result = await queryLabCompanion({
      authToken: null,
      system: 'only have this chapter so far',
      question: 'What should I notice?',
      context: CONTEXT,
      onRetry: reason => retries.push(reason),
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(retries).toEqual(['incomplete'])
    expect(result).toMatchObject({ status: 'failed', answer: LAB_HOP_FALLBACK, attempts: 2, failureReason: 'incomplete' })
    expect(result.answer).not.toContain('frame asks')
    vi.unstubAllGlobals()
  })
})
