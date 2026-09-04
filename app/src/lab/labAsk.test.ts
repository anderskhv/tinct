import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { VOICE_AGENT_POLICY, VOICE_TOOLS } from '../voice/context'
import {
  applyLabVoiceTurn,
  isStuckRepeatedLine,
  ASSISTANT_PACE_SPEED,
  buildLabAskInstructions,
  isResumeListenCommand,
  LAB_VOICE_TOOLS,
  labTypedPace,
  labTypedResume,
  labTypedSkip,
  labTypedSpeed,
  labConversationState,
  numberedLabChapter,
  parseAssistantPace,
  parseSetPlaybackSpeedArguments,
  resolveLabPlaybackSkip,
} from './labAsk'

describe('lab conversation state', () => {
  it('stays idle when the session failed', () => {
    expect(labConversationState({
      voiceState: 'answering',
      error: 'Sign in to ask by voice.',
      starting: true,
    })).toBe('idle')
  })

  it('goes connecting the moment start is requested', () => {
    expect(labConversationState({ voiceState: 'reading' })).toBe('idle')
    expect(labConversationState({ voiceState: 'reading', starting: true })).toBe('connecting')
    expect(labConversationState({ voiceState: 'conversation_idle' })).toBe('listening')
    expect(labConversationState({ voiceState: 'resume_pending' })).toBe('preparing')
  })

  it('maps observed lifecycle activity instead of inferring synthetic thinking', () => {
    expect(labConversationState({ voiceState: 'listening' })).toBe('listening')
    expect(labConversationState({ voiceState: 'answering' })).toBe('speaking')
    expect(labConversationState({ voiceState: 'conversation_idle', activity: 'listening' })).toBe('listening')
    expect(labConversationState({ voiceState: 'answering', activity: 'checking_text' })).toBe('checking')
    expect(labConversationState({ voiceState: 'answering', activity: 'preparing_answer' })).toBe('preparing')
    expect(labConversationState({ voiceState: 'resume_pending' })).toBe('preparing')
  })
})

describe('lab ask context', () => {
  const paragraphs = [
    'Tell me, O Muse, of that ingenious hero.',
    'So now all who escaped death in battle or by shipwreck had got safely home except Ulysses.',
    'Now Neptune had gone off to the Ethiopians.',
  ]

  it('numbers the full chapter so paragraph 2 is in the payload', () => {
    const numbered = numberedLabChapter(paragraphs)
    expect(numbered).toContain('[1] Tell me, O Muse')
    expect(numbered).toContain('[2] So now all who escaped death')
    expect(numbered).toContain('[3] Now Neptune')
  })

  it('sends the whole chapter and refuses later plot', () => {
    const instructions = buildLabAskInstructions({
      bookTitle: 'The Odyssey',
      bookAuthor: 'Homer',
      chapterLabel: 'Book 1',
      paragraphs,
      paragraphIndex: 0,
      readingAngle: 'homecoming',
    })
    expect(instructions).toContain('[2] So now all who escaped death')
    expect(instructions).toContain('only have this chapter so far')
    expect(instructions).toContain('call resume_audiobook')
    expect(instructions).toContain('Never say you cannot control playback')
    expect(instructions).toContain('call set_assistant_pace')
    expect(instructions).toContain('Never say you cannot change your pace')
    expect(instructions).toContain('Answer directly and concisely')
    expect(instructions).toContain('Never praise the question or the reader')
    expect(instructions).toContain('talk slower')
    expect(instructions).toContain('slower please')
    expect(instructions).toContain('call set_playback_speed')
    expect(instructions).toContain('Never say you cannot control speed')
    expect(instructions).toContain('Never tell them to use a podcast app')
    expect(instructions).toContain('call next_chapter or previous_chapter')
    expect(instructions).toContain('call restart_chapter')
    expect(instructions).toContain('Genesis 1 then Genesis 2')
    expect(instructions).toContain('call next_paragraph or previous_paragraph')
    expect(instructions).toContain('The app resumes the audiobook after you finish speaking')
    expect(instructions).toContain('Do not resume after a normal book question')
    expect(instructions).toContain('Do not ask them to paste')
    expect(instructions).toContain('Do not say you lack the book')
    expect(instructions).toContain('no Book 3')
    expect(instructions).toContain('no ending')
    expect(instructions).toContain('Reading angle: homecoming')
    expect(instructions).not.toContain(VOICE_AGENT_POLICY)
    expect(instructions).not.toContain('Speak for about 20')
    expect(instructions).toContain('resume_audiobook')
    expect(instructions).not.toContain('return control to audiobook')
    expect(instructions).toContain('Do not greet')
    expect(instructions).toContain('Do not say hello')
    expect(instructions).not.toMatch(/Hey there/i)
    expect(instructions).not.toMatch(/Good to hear from you/i)
    expect(instructions).not.toContain("I'm listening.")
  })

  it('leaves production in-car instructions on the AudioStrip path', () => {
    const strip = readFileSync(resolve(__dirname, '../components/AudioStrip.tsx'), 'utf8')
    const session = readFileSync(resolve(__dirname, '../hooks/useVoiceSession.ts'), 'utf8')
    const context = readFileSync(resolve(__dirname, '../voice/context.ts'), 'utf8')
    expect(context).toContain('Speak for about 20–30 seconds')
    expect(context).toContain('resume_audiobook')
    expect(session).toContain('Production AudioStrip leaves this unset')
    expect(strip).not.toContain("from '../lab/")
    expect(strip).not.toContain('buildLabAskInstructions')
  })
})

describe('lab voice phase is not a timer', () => {
  it('only maps the live voice machine, including cancellable connecting', () => {
    expect(labConversationState({ voiceState: 'reading', starting: true })).toBe('connecting')
    expect(labConversationState({ voiceState: 'reading', starting: false })).toBe('idle')
    expect(labConversationState({ voiceState: 'listening', starting: false })).toBe('listening')
    expect(labConversationState({ voiceState: 'reading', starting: true, error: 'stopped' })).toBe('idle')
  })
})

describe('resume listen command', () => {
  it('matches a small phrase list and ignores punctuation', () => {
    expect(isResumeListenCommand('Go back to the audiobook.')).toBe(true)
    expect(isResumeListenCommand('resume the audio')).toBe(true)
    expect(isResumeListenCommand('back to listening')).toBe(true)
    expect(isResumeListenCommand('no further questions')).toBe(true)
    expect(isResumeListenCommand('Who is Telemachus?')).toBe(false)
    expect(isResumeListenCommand('go back to audio book now')).toBe(false)
  })

  it('honors a typed resume tag without matching the user sentence', () => {
    expect(labTypedResume('See you in the chapter. [[resume_audiobook]]')).toEqual({
      text: 'See you in the chapter.',
      resume: true,
    })
    expect(labTypedResume('Calypso holds him.')).toEqual({
      text: 'Calypso holds him.',
      resume: false,
    })
  })

  it('honors a typed set_playback_speed tag', () => {
    expect(labTypedSpeed('Playing at two times. [[set_playback_speed:2]]')).toEqual({
      text: 'Playing at two times.',
      speed: 2,
    })
    expect(labTypedSpeed('Calypso holds him.')).toEqual({
      text: 'Calypso holds him.',
      speed: null,
    })
    expect(parseSetPlaybackSpeedArguments('{"rate":1.5}')).toBe(1.5)
    expect(parseSetPlaybackSpeedArguments('{"rate":3}')).toBe(3)
    expect(parseSetPlaybackSpeedArguments('{"rate":3.01}')).toBeNull()
  })

  it('honors typed chapter and paragraph skip tags', () => {
    expect(labTypedSkip('Starting over. [[restart_chapter]]')).toEqual({
      text: 'Starting over.',
      skip: 'restart_chapter',
    })
    expect(labTypedSkip('Genesis 2. [[next_chapter]]')).toEqual({
      text: 'Genesis 2.',
      skip: 'next_chapter',
    })
    expect(labTypedSkip('Back one paragraph. [[previous_paragraph]]')).toEqual({
      text: 'Back one paragraph.',
      skip: 'previous_paragraph',
    })
    expect(labTypedSkip('Calypso holds him.')).toEqual({
      text: 'Calypso holds him.',
      skip: null,
    })
  })
})

describe('lab voice tools', () => {
  it('gives lab the resume and speed tools and honors the model call', () => {
    const ask = readFileSync(resolve(__dirname, 'useLabAsk.ts'), 'utf8')
    const controller = readFileSync(resolve(__dirname, '../voice/VoiceSessionController.ts'), 'utf8')
    const context = readFileSync(resolve(__dirname, '../voice/context.ts'), 'utf8')
    expect(ask).toContain('LAB_VOICE_TOOLS')
    expect(ask).toContain('honorModelResume: true')
    expect(ask).toContain('onSetPlaybackSpeed')
    expect(ask).not.toContain('tools: []')
    expect(controller).toContain('this.honorModelResume || shouldHonorModelResume')
    expect(controller).toContain("name === 'set_playback_speed'")
    expect(controller).toContain('this.honorModelResume')
    expect(LAB_VOICE_TOOLS.some(tool => tool.name === 'set_playback_speed')).toBe(true)
    expect(LAB_VOICE_TOOLS.some(tool => tool.name === 'set_assistant_pace')).toBe(true)
    expect(LAB_VOICE_TOOLS.some(tool => tool.name === 'next_chapter')).toBe(true)
    expect(LAB_VOICE_TOOLS.some(tool => tool.name === 'previous_chapter')).toBe(true)
    expect(LAB_VOICE_TOOLS.some(tool => tool.name === 'restart_chapter')).toBe(true)
    expect(LAB_VOICE_TOOLS.some(tool => tool.name === 'next_paragraph')).toBe(true)
    expect(LAB_VOICE_TOOLS.some(tool => tool.name === 'previous_paragraph')).toBe(true)
    expect(LAB_VOICE_TOOLS.some(tool => tool.name === 'ask_companion')).toBe(true)
    expect(VOICE_TOOLS.some(tool => tool.name === 'set_playback_speed')).toBe(false)
    expect(VOICE_TOOLS.some(tool => tool.name === 'set_assistant_pace')).toBe(false)
    expect(VOICE_TOOLS.some(tool => tool.name === 'next_chapter')).toBe(false)
    expect(context).not.toContain('set_playback_speed')
    expect(context).not.toContain('set_assistant_pace')
    expect(context).not.toContain('next_chapter')
    expect(controller).toContain('isLabPlaybackSkip(name)')
    expect(controller).toContain('continueAfterPlaybackAdjust')
    expect(ask).toContain('onPlaybackSkip')
    expect(ask).toContain('skipPlayback')
    expect(ask).toContain('onSetAssistantPace')
    expect(ask).toContain('onCompanionAsk')
    expect(ask).toContain('talkInstructions')
    expect(controller).toContain('ASK_COMPANION_TOOL')
    expect(controller).toContain("name === 'set_assistant_pace'")
    expect(controller).toContain('audio.output')
    expect(controller).toContain('ASSISTANT_PACE_SPEED')
  })
})

describe('assistant pace', () => {
  it('parses slow, normal, and fast without touching book rates', () => {
    expect(parseAssistantPace('{"pace":"slow"}')).toBe('slow')
    expect(parseAssistantPace('fast')).toBe('fast')
    expect(parseAssistantPace('{"pace":"normal"}')).toBe('normal')
    expect(parseAssistantPace('{"pace":"2x"}')).toBeNull()
    expect(ASSISTANT_PACE_SPEED.slow).toBe(0.8)
    expect(ASSISTANT_PACE_SPEED.normal).toBe(1)
    expect(ASSISTANT_PACE_SPEED.fast).toBe(1.25)
    expect(labTypedPace('I will speak more slowly. [[set_assistant_pace:slow]]')).toEqual({
      text: 'I will speak more slowly.',
      pace: 'slow',
    })
    expect(labTypedPace('Calypso holds him.')).toEqual({
      text: 'Calypso holds him.',
      pace: null,
    })
  })
})

describe('lab voice transcript bubbles', () => {
  it('keeps each speaker on their own bubble and will not shrink a longer draft', () => {
    const greeting = { id: 'g', role: 'assistant' as const, content: "I'm listening.", source: 'voice' as const }
    const user = { id: 'u', role: 'user' as const, content: 'Why is this book interesting for gardening?', source: 'voice' as const }
    const draft = { id: 'a1', role: 'assistant' as const, content: 'Absolutely, the opening is full of homecoming and earth.', source: 'voice' as const }
    const stub = { id: 'a2', role: 'assistant' as const, content: 'Absolutely', source: 'voice' as const, cancelled: true }
    const afterGreeting = applyLabVoiceTurn([], greeting)
    const afterUser = applyLabVoiceTurn(afterGreeting, user)
    const afterDraft = applyLabVoiceTurn(afterUser, draft)
    const afterCancel = applyLabVoiceTurn(afterDraft, stub)
    expect(afterCancel.map(turn => [turn.role, turn.content])).toEqual([
      ['assistant', "I'm listening."],
      ['user', 'Why is this book interesting for gardening?'],
      ['assistant', 'Absolutely, the opening is full of homecoming and earth.'],
    ])
    expect(afterCancel[2].cancelled).toBe(true)
    expect(afterCancel[1].content).not.toContain('Absolutely')
  })

  it('does not display a greeting stuck to itself or finalized twice', () => {
    const greeting = { id: 'g', role: 'assistant' as const, content: "I'm listening.", source: 'voice' as const }
    const doubled = { id: 'g2', role: 'assistant' as const, content: "I'm listening.I'm listening.", source: 'voice' as const }
    const again = { id: 'g3', role: 'assistant' as const, content: "I'm listening.", source: 'voice' as const }
    const afterFirst = applyLabVoiceTurn([], greeting)
    const afterDouble = applyLabVoiceTurn(afterFirst, doubled)
    const afterAgain = applyLabVoiceTurn(afterDouble, again)
    expect(afterDouble.map(turn => turn.content)).toEqual(["I'm listening."])
    expect(afterAgain.map(turn => turn.content)).toEqual(["I'm listening."])
    expect(isStuckRepeatedLine("I'm listening.", "I'm listening.I'm listening.")).toBe(true)
    expect(isStuckRepeatedLine("I'm listening.", "I'm listening. listening.")).toBe(true)
    expect(isStuckRepeatedLine("I'm listening.", "Absolutely, the opening is homecoming.")).toBe(false)
    const leftover = { id: 'g4', role: 'assistant' as const, content: "I'm listening. listening.", source: 'voice' as const }
    expect(applyLabVoiceTurn(afterFirst, leftover).map(turn => turn.content)).toEqual(["I'm listening."])
  })

  it('does not append a second greeting after the user has spoken', () => {
    const greeting = { id: 'g', role: 'assistant' as const, content: "I'm listening.", source: 'voice' as const }
    const user = { id: 'u', role: 'user' as const, content: 'Can we go back to the audiobook?', source: 'voice' as const }
    const again = { id: 'g2', role: 'assistant' as const, content: "I'm listening.", source: 'voice' as const }
    const afterUser = applyLabVoiceTurn(applyLabVoiceTurn([], greeting), user)
    expect(applyLabVoiceTurn(afterUser, again)).toEqual(afterUser)
  })

  it('appends a later user turn after interrupt instead of pinning the first line', () => {
    const first = { id: 'u1', role: 'user' as const, content: 'Hey, how are you?', source: 'voice' as const }
    const reply = { id: 'a1', role: 'assistant' as const, content: "I'm well — still on Book 1.", source: 'voice' as const }
    const second = { id: 'u2', role: 'user' as const, content: "I'm thinking about reading the Bible", source: 'voice' as const }
    const afterFirst = applyLabVoiceTurn([], first)
    const afterReply = applyLabVoiceTurn(afterFirst, reply)
    const afterSecond = applyLabVoiceTurn(afterReply, second)
    const backToBack = applyLabVoiceTurn(afterFirst, second)
    expect(afterSecond.map(turn => turn.content)).toEqual([
      'Hey, how are you?',
      "I'm well — still on Book 1.",
      "I'm thinking about reading the Bible",
    ])
    expect(backToBack.map(turn => [turn.role, turn.content])).toEqual([
      ['user', 'Hey, how are you?'],
      ['user', "I'm thinking about reading the Bible"],
    ])
  })

  it('does not replace a user bubble with cancelled assistant text', () => {
    const user = { id: 'u', role: 'user' as const, content: 'Tell me about the garden.', source: 'voice' as const }
    const stub = { id: 'a', role: 'assistant' as const, content: 'Absolutely', source: 'voice' as const, cancelled: true }
    const next = applyLabVoiceTurn([user], stub)
    expect(next).toHaveLength(2)
    expect(next[0]).toEqual(user)
    expect(next[1].role).toBe('assistant')
    expect(next[1].content).toBe('Absolutely')
  })
})

describe('lab playback skip place', () => {
  const chapters = [
    { number: 1, title: 'Genesis 1' },
    { number: 2, title: 'Genesis 2' },
  ]

  it('walks sequential Bible chapters and clamps paragraph ends', () => {
    expect(resolveLabPlaybackSkip({
      kind: 'restart_chapter',
      chapterNumber: 2,
      paragraphIndex: 4,
      paragraphCount: 6,
      chapters,
    })).toEqual({ chapterNumber: 2, paragraphIndex: 0, landing: 'start', chapterChanged: false })
    expect(resolveLabPlaybackSkip({
      kind: 'next_chapter',
      chapterNumber: 1,
      paragraphIndex: 3,
      paragraphCount: 8,
      chapters,
    })).toEqual({ chapterNumber: 2, paragraphIndex: 0, landing: 'start', chapterChanged: true })
    expect(resolveLabPlaybackSkip({
      kind: 'previous_chapter',
      chapterNumber: 2,
      paragraphIndex: 4,
      paragraphCount: 6,
      chapters,
    })).toEqual({ chapterNumber: 1, paragraphIndex: 0, landing: 'start', chapterChanged: true })
    expect(resolveLabPlaybackSkip({
      kind: 'next_paragraph',
      chapterNumber: 1,
      paragraphIndex: 0,
      paragraphCount: 3,
      chapters,
    })).toEqual({ chapterNumber: 1, paragraphIndex: 1, landing: 'start', chapterChanged: false })
    expect(resolveLabPlaybackSkip({
      kind: 'next_paragraph',
      chapterNumber: 1,
      paragraphIndex: 2,
      paragraphCount: 3,
      chapters,
    })).toEqual({ chapterNumber: 1, paragraphIndex: 2, landing: 'start', chapterChanged: false })
    expect(resolveLabPlaybackSkip({
      kind: 'previous_paragraph',
      chapterNumber: 1,
      paragraphIndex: 1,
      paragraphCount: 3,
      chapters,
    })).toEqual({ chapterNumber: 1, paragraphIndex: 0, landing: 'start', chapterChanged: false })
    expect(resolveLabPlaybackSkip({
      kind: 'previous_paragraph',
      chapterNumber: 2,
      paragraphIndex: 0,
      paragraphCount: 4,
      chapters,
    })).toEqual({ chapterNumber: 1, paragraphIndex: 0, landing: 'end', chapterChanged: true })
    expect(resolveLabPlaybackSkip({
      kind: 'previous_paragraph',
      chapterNumber: 1,
      paragraphIndex: 0,
      paragraphCount: 3,
      chapters,
    })).toEqual({ chapterNumber: 1, paragraphIndex: 0, landing: 'start', chapterChanged: false })
  })
})
