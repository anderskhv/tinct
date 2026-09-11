import { afterEach, describe, expect, it, vi } from 'vitest'
import { labVoicePhaseLabel, nextLabVoiceGate } from './labChrome'
import { LAB_VOICE_TOOLS, labConversationState } from './labAsk'
import {
  buildLabTalkInstructions,
  LAB_COVER_LINES,
  LAB_HOP_MAX_TOKENS,
  LAB_HOP_SPOKEN_LENGTH,
  pickLabCoverLine,
  SPEAK_CLAUDE_VERBATIM,
  LAB_HOLDING_LINE,
  LAB_TALK_HOLDING_POLICY,
} from './labCompanion'
import {
  buildLabTalkInstructionsV2,
  companionSpeakInstructionsV2,
  failureSpeakInstructionsV2,
  LAB_ASK_COMPANION_TOOL_V2,
  LAB_HOP_MAX_TOKENS_V2,
  LAB_HOP_SPOKEN_LENGTH_V2,
  LAB_V2_BANNED_OPENERS,
  LAB_V2_COMPANION_POLICY,
  LAB_VOICE_TOOLS_V2,
  labConversationStateV2,
  labVoicePhaseLabelV2,
  queryLabCompanionV2,
  SPEAK_COMPANION_VERBATIM_V2,
  signOffInstructionsV2,
} from './labVoiceV2'
import { VOICE_V2_FAILURE_LINE } from '../voice/v2/voiceV2'

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

function sse(text: string, stopReason = 'end_turn'): Response {
  const body = `data: {"type":"content_block_delta","delta":{"type":"text_delta","text":${JSON.stringify(text)}}}\n\ndata: {"type":"message_delta","delta":{"stop_reason":"${stopReason}"}}\n\n`
  return new Response(new TextEncoder().encode(body), {
    status: 200,
    headers: { 'content-type': 'text/event-stream; charset=utf-8' },
  })
}

describe('voice v2 instructions are concise and direct', () => {
  it('never scripts praise, narrated process, or a cover line', () => {
    const text = buildLabTalkInstructionsV2(CONTEXT).toLowerCase()
    for (const banned of LAB_V2_BANNED_OPENERS) {
      expect(text.includes(`"${banned}`) || text.includes(`say exactly "${banned}`)).toBe(false)
    }
    expect(text).not.toContain('good question. let me look that up')
    expect(text).not.toContain('say a short looking-at-the-passage line')
    expect(text).toContain('answer directly')
    expect(text).toContain('never praise the question')
    expect(text).toContain('say nothing until it returns')
    expect(text).toContain('never answer a book question yourself')
    expect(text).toContain(LAB_TALK_HOLDING_POLICY.toLowerCase())
    expect(text).toContain('never say you only have what is here')
    expect(text).toContain('the odyssey by homer')
    expect(text).toContain('tell me, o muse')
  })

  it('keeps the explicit-goodbye rule and the bare-thanks exception', () => {
    const text = buildLabTalkInstructionsV2(CONTEXT)
    expect(text).toContain('call end_voice_session')
    expect(text).toContain('A bare thanks or thank you is not a goodbye')
    expect(signOffInstructionsV2()).toContain('one short natural goodbye')
  })

  it('tells the companion hop the same thing', () => {
    expect(LAB_V2_COMPANION_POLICY).toMatch(/never praise/i)
    expect(LAB_V2_COMPANION_POLICY).toContain('"good question"')
    expect(LAB_HOP_SPOKEN_LENGTH_V2).toMatch(/finish the thought/i)
    expect(LAB_HOP_MAX_TOKENS_V2).toBeGreaterThan(LAB_HOP_MAX_TOKENS)
  })

  it('speaks the companion answer once and the failure line verbatim', () => {
    const spoken = companionSpeakInstructionsV2('Athena is already beside him.')
    expect(spoken.startsWith(SPEAK_COMPANION_VERBATIM_V2)).toBe(true)
    expect(spoken).toContain('once')
    expect(spoken).not.toMatch(/good question|let me look|the answer I received/i)
    expect(spoken.endsWith('Athena is already beside him.')).toBe(true)
    expect(failureSpeakInstructionsV2()).toContain(VOICE_V2_FAILURE_LINE)
  })

  it('replaces only the companion tool description and keeps every playback tool', () => {
    const v1Names = LAB_VOICE_TOOLS.map(tool => (tool as { name: string }).name)
    const v2Names = LAB_VOICE_TOOLS_V2.map(tool => (tool as { name: string }).name)
    expect(v2Names).toEqual(v1Names)
    expect(LAB_ASK_COMPANION_TOOL_V2.description).toContain('say nothing until it returns')
    expect(LAB_ASK_COMPANION_TOOL_V2.description).not.toMatch(/looking-at-the-passage/i)
  })
})

describe('voice v1 stays byte-for-byte on its own instructions', () => {
  it('still scripts the V1 cover line and verbatim brief', () => {
    const v1 = buildLabTalkInstructions(CONTEXT)
    expect(v1).toContain(`say exactly "${LAB_HOLDING_LINE}"`)
    expect(v1).toContain('You do not do the deep thinking.')
    expect(LAB_COVER_LINES).toEqual([LAB_HOLDING_LINE])
    expect(pickLabCoverLine()).toBe(LAB_HOLDING_LINE)
    expect(SPEAK_CLAUDE_VERBATIM).toContain('the answer I received')
    expect(LAB_HOP_SPOKEN_LENGTH).toBe('Answer for the ear in a few spoken sentences unless the reader asked for more. Finish the thought. Do not write a long essay.')
  })

  it('never derives a V2 composer state from the V1 machine', () => {
    const states = ['reading', 'listening', 'answering', 'resume_pending', 'conversation_idle'] as const
    for (const voiceState of states) {
      for (const starting of [true, false]) {
        const state = labConversationState({ voiceState, starting })
        expect(['idle', 'connecting', 'listening', 'thinking', 'speaking']).toContain(state)
      }
    }
    expect(labConversationState({ voiceState: 'conversation_idle' })).toBe('thinking')
  })

  it('keeps the V1 phase labels and gate unchanged while accepting the V2 phases', () => {
    expect(labVoicePhaseLabel('connecting')).toBe('Connecting')
    expect(labVoicePhaseLabel('listening')).toBe('Listening')
    expect(labVoicePhaseLabel('thinking')).toBe('Thinking')
    expect(labVoicePhaseLabel('speaking')).toBe('Speaking')
    expect(labVoicePhaseLabel('idle')).toBeNull()
    expect(labVoicePhaseLabel('checking')).toBe('Checking text')
    expect(labVoicePhaseLabel('preparing')).toBe('Preparing answer')
    expect(nextLabVoiceGate('connecting', 'checking', true)).toBe('off')
    expect(nextLabVoiceGate('connecting', 'preparing', true)).toBe('off')
  })
})

describe('voice v2 composer state', () => {
  it('maps every activity phase to exactly one composer state', () => {
    expect(labConversationStateV2({ activity: 'idle' })).toBe('idle')
    expect(labConversationStateV2({ activity: 'idle', starting: true })).toBe('connecting')
    expect(labConversationStateV2({ activity: 'connecting' })).toBe('connecting')
    expect(labConversationStateV2({ activity: 'listening' })).toBe('listening')
    expect(labConversationStateV2({ activity: 'checking_text' })).toBe('checking')
    expect(labConversationStateV2({ activity: 'preparing_answer' })).toBe('preparing')
    expect(labConversationStateV2({ activity: 'speaking' })).toBe('speaking')
    expect(labConversationStateV2({ activity: 'speaking', starting: true })).toBe('speaking')
  })

  it('labels the composer with the five V2 words only', () => {
    expect(labVoicePhaseLabelV2('connecting')).toBe('Connecting')
    expect(labVoicePhaseLabelV2('listening')).toBe('Listening')
    expect(labVoicePhaseLabelV2('checking')).toBe('Checking text')
    expect(labVoicePhaseLabelV2('preparing')).toBe('Preparing answer')
    expect(labVoicePhaseLabelV2('speaking')).toBe('Speaking')
    expect(labVoicePhaseLabelV2('idle')).toBeNull()
  })
})

describe('voice v2 companion hop', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns one complete, filler-free answer with the V2 length brief', async () => {
    const fetchMock = vi.fn(async () => sse('Great question! Athena is already beside him. The council is about homecoming.'))
    vi.stubGlobal('fetch', fetchMock)
    const result = await queryLabCompanionV2({
      authToken: null,
      system: 'only have this chapter so far',
      question: 'Who is Athena here?',
      context: CONTEXT,
    })
    expect(result).toEqual({
      status: 'completed',
      answer: 'Athena is already beside him. The council is about homecoming.',
      attempts: 1,
      stopReason: 'end_turn',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const init = fetchMock.mock.calls[0][1] as RequestInit
    const body = JSON.parse(String(init.body)) as { max_tokens: number; system: string; stream: boolean }
    expect(body.max_tokens).toBe(LAB_HOP_MAX_TOKENS_V2)
    expect(body.stream).toBe(true)
    expect(body.system).toContain('only have this chapter so far')
    expect(body.system).toContain(LAB_V2_COMPANION_POLICY)
    expect(body.system).toContain(LAB_HOP_SPOKEN_LENGTH_V2)
    expect(body.system).not.toContain(LAB_HOP_SPOKEN_LENGTH)
  })

  it('retries a cut-off answer once and completes on the second attempt', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(sse('Keller would treat Genesis 1 as primarily a theological', 'max_tokens'))
      .mockResolvedValueOnce(sse("Keller treats Genesis 1 as a theological statement of God's good world."))
    vi.stubGlobal('fetch', fetchMock)
    const retries: string[] = []
    const result = await queryLabCompanionV2({
      authToken: null,
      system: 's',
      question: 'How would Keller read this?',
      context: CONTEXT,
      onRetry: reason => retries.push(reason),
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(retries).toEqual(['incomplete'])
    expect(result.status).toBe('completed')
    expect(result.attempts).toBe(2)
    expect(result.answer).toBe("Keller treats Genesis 1 as a theological statement of God's good world.")
  })

  it('fails explicitly instead of speaking a truncated answer when both attempts are cut off', async () => {
    const fetchMock = vi.fn(async () => sse('An answer that never finishes because the model ran out of', 'max_tokens'))
    vi.stubGlobal('fetch', fetchMock)
    const result = await queryLabCompanionV2({
      authToken: null,
      system: 's',
      question: 'What does this mean?',
      context: CONTEXT,
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.status).toBe('failed')
    expect(result.failureReason).toBe('incomplete')
    expect(result.answer).toBe('')
  })

  it('fails explicitly when the request itself fails twice', async () => {
    const fetchMock = vi.fn(async () => { throw new Error('network') })
    vi.stubGlobal('fetch', fetchMock)
    const result = await queryLabCompanionV2({
      authToken: null,
      system: 's',
      question: 'What does this mean?',
      context: CONTEXT,
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result).toMatchObject({ status: 'failed', answer: '', attempts: 2, failureReason: 'request_failed' })
  })

  it('fails explicitly on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })))
    const result = await queryLabCompanionV2({
      authToken: 'token',
      system: 's',
      question: 'Why does Neptune leave?',
      context: CONTEXT,
    })
    expect(result.status).toBe('failed')
    expect(result.failureReason).toBe('request_failed')
  })
})
