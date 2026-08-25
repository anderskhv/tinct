import { describe, expect, it, vi } from 'vitest'
import { VOICE_AGENT_POLICY } from '../voice/context'
import {
  ASK_READING_COMPANION_TOOL,
  LAB_COVER_LINES,
  LAB_TALK_TOOLS,
  NEXT_CHAPTER_TOOL,
  RESUME_LISTENING_TOOL,
  SET_PLAYBACK_SPEED_TOOL,
  SKIP_PARAGRAPH_TOOL,
  buildLabAskInstructions,
  buildLabTalkInstructions,
  decideHearResume,
  handleLabTalkTool,
  isLabPlaybackCommand,
  pickLabCoverLine,
  runEscalatedCompanionTurn,
  shouldEscalateToCompanion,
} from './labCompanion'

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
  it('does not escalate playback commands', () => {
    expect(isLabPlaybackCommand('go faster')).toBe(true)
    expect(isLabPlaybackCommand('next chapter')).toBe(true)
    expect(isLabPlaybackCommand('resume')).toBe(true)
    expect(isLabPlaybackCommand('skip ahead')).toBe(true)
    expect(shouldEscalateToCompanion('go faster')).toBe(false)
    expect(shouldEscalateToCompanion('next chapter')).toBe(false)
    expect(shouldEscalateToCompanion('resume')).toBe(false)
    expect(shouldEscalateToCompanion('skip')).toBe(false)
    expect(shouldEscalateToCompanion('play')).toBe(false)
  })

  it('escalates book questions that need a mind', () => {
    expect(shouldEscalateToCompanion('what does this mean')).toBe(true)
    expect(shouldEscalateToCompanion('Compare Athena and Telemachus here.')).toBe(true)
    expect(shouldEscalateToCompanion('What is the theological argument in this council?')).toBe(true)
    expect(shouldEscalateToCompanion('Who is Calypso in this opening?')).toBe(true)
  })
})

describe('typed companion prompt', () => {
  it('reuses the production companion voice and spoiler-safe chapter', () => {
    const instructions = buildLabAskInstructions(CONTEXT)
    expect(instructions).toContain('built-in reading companion for Tinct')
    expect(instructions).toContain('[2] So now all who escaped death')
    expect(instructions).toContain('only have this chapter so far')
    expect(instructions).toContain('Do not ask them to paste')
    expect(instructions).toContain('no Book 3')
    expect(instructions).toContain('The reader\'s reading angle: "homecoming"')
    expect(instructions).toContain('as far as paragraph 1 of 3')
    expect(instructions).not.toContain(VOICE_AGENT_POLICY)
    expect(instructions).not.toContain('resume_audiobook')
  })
})

describe('talk instructions stay the ear and mouth', () => {
  it('keeps Realtime on tools and cover, not the in-car brief', () => {
    const talk = buildLabTalkInstructions(CONTEXT)
    expect(talk).toContain("I'm listening")
    expect(talk).toContain(ASK_READING_COMPANION_TOOL)
    expect(talk).toContain('looking at the passage')
    expect(talk).toContain('Do not invent a thinner substitute')
    expect(talk).toContain('Never call ask_reading_companion for those')
    expect(talk).not.toContain(VOICE_AGENT_POLICY)
    expect(talk).toContain('Do not call resume_audiobook')
    expect(LAB_TALK_TOOLS.map(tool => tool.name)).not.toContain('resume_audiobook')
    expect(LAB_TALK_TOOLS.map(tool => tool.name)).toEqual([
      SET_PLAYBACK_SPEED_TOOL,
      SKIP_PARAGRAPH_TOOL,
      NEXT_CHAPTER_TOOL,
      RESUME_LISTENING_TOOL,
      ASK_READING_COMPANION_TOOL,
    ])
  })
})

describe('no-dead-air cover', () => {
  it('speaks a looking-at-the-passage line before the hop completes', async () => {
    const spoken: string[] = []
    let queryStarted = false
    let coveredBeforeQuery = false
    const hop = runEscalatedCompanionTurn({
      question: 'what does this mean',
      alreadySpeaking: false,
      speakCover: (line) => {
        spoken.push(line)
        return true
      },
      query: async () => {
        queryStarted = true
        coveredBeforeQuery = spoken.length > 0
        await new Promise(resolve => setTimeout(resolve, 20))
        return 'The council is about the unseen homecoming.'
      },
    })

    await Promise.resolve()
    expect(spoken[0]).toBe(pickLabCoverLine())
    expect(LAB_COVER_LINES).toContain(spoken[0])
    expect(spoken[0]).not.toMatch(/please hold|one moment please|searching/i)
    expect(queryStarted).toBe(true)
    expect(coveredBeforeQuery).toBe(true)

    const result = await hop
    expect(result.covered).toBe(true)
    expect(result.answer).toContain('unseen homecoming')
  })

  it('does not invent a hold-music cover when she is already speaking', async () => {
    const speakCover = vi.fn(() => true)
    const result = await runEscalatedCompanionTurn({
      question: 'what does this mean',
      alreadySpeaking: true,
      speakCover,
      query: async () => 'Athena is already beside him.',
    })
    expect(speakCover).not.toHaveBeenCalled()
    expect(result.covered).toBe(true)
  })
})

describe('lab talk tools', () => {
  it('runs playback tools without calling Claude', async () => {
    const queryCompanion = vi.fn(async () => 'should not run')
    const onPlayback = vi.fn(() => ({ ok: true, note: '1.5x' }))
    const faster = await handleLabTalkTool({
      name: SET_PLAYBACK_SPEED_TOOL,
      args: JSON.stringify({ rate: 1.5 }),
      alreadySpeaking: false,
      speakCover: vi.fn(() => true),
      queryCompanion,
      onPlayback,
    })
    const next = await handleLabTalkTool({
      name: NEXT_CHAPTER_TOOL,
      args: '{}',
      alreadySpeaking: false,
      speakCover: vi.fn(() => true),
      queryCompanion,
      onPlayback,
    })
    const resume = await handleLabTalkTool({
      name: RESUME_LISTENING_TOOL,
      args: '{}',
      alreadySpeaking: false,
      speakCover: vi.fn(() => true),
      queryCompanion,
      onPlayback,
    })

    expect(queryCompanion).not.toHaveBeenCalled()
    expect(onPlayback).toHaveBeenCalledWith({ type: 'speed', rate: 1.5 })
    expect(onPlayback).toHaveBeenCalledWith({ type: 'next_chapter' })
    expect(onPlayback).toHaveBeenCalledWith({ type: 'resume' })
    expect(faster.queriedClaude).toBe(false)
    expect(next.queriedClaude).toBe(false)
    expect(resume.queriedClaude).toBe(false)
    expect(resume.scheduleHearResume).toBe(true)
  })

  it('reroutes a playback question if Realtime asked Claude by mistake', async () => {
    const queryCompanion = vi.fn(async () => 'should not run')
    const onPlayback = vi.fn(() => ({ ok: true }))
    const result = await handleLabTalkTool({
      name: ASK_READING_COMPANION_TOOL,
      args: JSON.stringify({ question: 'go faster' }),
      alreadySpeaking: false,
      speakCover: vi.fn(() => true),
      queryCompanion,
      onPlayback,
    })
    expect(queryCompanion).not.toHaveBeenCalled()
    expect(onPlayback).toHaveBeenCalledWith({ type: 'speed', rate: 1.5 })
    expect(result.queriedClaude).toBe(false)
  })

  it('covers then queries Claude for a hard book question', async () => {
    const spoken: string[] = []
    const queryCompanion = vi.fn(async () => 'Telemachus is being given a path.')
    const result = await handleLabTalkTool({
      name: ASK_READING_COMPANION_TOOL,
      args: JSON.stringify({ question: 'what does this mean' }),
      alreadySpeaking: false,
      speakCover: (line) => {
        spoken.push(line)
        return true
      },
      queryCompanion,
      onPlayback: () => ({ ok: true }),
    })
    expect(spoken).toHaveLength(1)
    expect(queryCompanion).toHaveBeenCalledWith('what does this mean')
    expect(result.queriedClaude).toBe(true)
    expect(result.output).toContain('Telemachus is being given a path.')
    expect(result.responseInstructions).toContain('Do not invent a thinner substitute')
  })
})

describe('resume after spoken confirm', () => {
  it('waits until she has finished speaking', () => {
    expect(decideHearResume({ pending: true, sawSpeaking: false, state: 'listening' })).toBe('wait')
    expect(decideHearResume({ pending: true, sawSpeaking: false, state: 'speaking' })).toBe('wait')
    expect(decideHearResume({ pending: true, sawSpeaking: true, state: 'speaking' })).toBe('wait')
    expect(decideHearResume({ pending: true, sawSpeaking: true, state: 'listening' })).toBe('resume')
  })
})
