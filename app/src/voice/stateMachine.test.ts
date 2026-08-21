import { describe, expect, it } from 'vitest'
import { classifyVoiceUtterance, shouldHonorModelResume } from './intents'
import { INITIAL_VOICE_SNAPSHOT, reduceVoiceSession, shouldResumeAudiobookOnEnterReading } from './stateMachine'
import { buildVoiceReaderContext, nearbyParagraphWindow } from './context'

function play(events: Parameters<typeof reduceVoiceSession>[1][]) {
  return events.reduce(reduceVoiceSession, INITIAL_VOICE_SNAPSHOT)
}

describe('voice session state machine', () => {
  it('can start already in conversation mode so a pause does not resume the book', () => {
    const listening = play([{ type: 'START', mode: 'conversation' }])
    expect(listening).toEqual({ state: 'listening', mode: 'conversation' })

    const afterAnswer = play([
      { type: 'START', mode: 'conversation' },
      { type: 'ASSISTANT_SPEECH_START' },
      { type: 'ASSISTANT_SPEECH_END' },
    ])
    expect(afterAnswer).toEqual({ state: 'conversation_idle', mode: 'conversation' })
    expect(reduceVoiceSession(afterAnswer, { type: 'RESUME_WINDOW_ELAPSED' }).state).toBe('conversation_idle')
  })

  it('follows the Quick Questions default path', () => {
    const snapshot = play([
      { type: 'START' },
      { type: 'USER_SPEECH_START' },
      { type: 'USER_SPEECH_END' },
      { type: 'ASSISTANT_SPEECH_START' },
      { type: 'ASSISTANT_SPEECH_END' },
    ])
    expect(snapshot).toEqual({ state: 'resume_pending', mode: 'quick' })

    const resumed = reduceVoiceSession(snapshot, { type: 'RESUME_WINDOW_ELAPSED' })
    expect(resumed).toEqual(INITIAL_VOICE_SNAPSHOT)
    expect(shouldResumeAudiobookOnEnterReading(snapshot, resumed)).toBe(true)
  })

  it('cancels resume_pending on speech, mic tap, or hold intent', () => {
    const pending = play([
      { type: 'START' },
      { type: 'ASSISTANT_SPEECH_START' },
      { type: 'ASSISTANT_SPEECH_END' },
    ])
    expect(pending.state).toBe('resume_pending')

    expect(reduceVoiceSession(pending, { type: 'USER_SPEECH_START' }).state).toBe('listening')
    expect(reduceVoiceSession(pending, { type: 'MIC_TAP' }).state).toBe('listening')
    expect(reduceVoiceSession(pending, { type: 'INTENT', intent: 'hold_session' }).state).toBe('listening')
  })

  it('honors explicit resume from any active state', () => {
    const answering = play([
      { type: 'START' },
      { type: 'ASSISTANT_SPEECH_START' },
    ])
    const next = reduceVoiceSession(answering, { type: 'EXPLICIT_RESUME' })
    expect(next.state).toBe('reading')
    expect(shouldResumeAudiobookOnEnterReading(answering, next)).toBe(true)
  })

  it('opens conversation_idle for open-ended prompts and exits on timeout', () => {
    const idle = play([
      { type: 'START' },
      { type: 'INTENT', intent: 'open_conversation' },
    ])
    expect(idle).toEqual({ state: 'conversation_idle', mode: 'conversation' })

    const afterAnswer = play([
      { type: 'START' },
      { type: 'INTENT', intent: 'open_conversation' },
      { type: 'ASSISTANT_SPEECH_START' },
      { type: 'ASSISTANT_SPEECH_END' },
    ])
    expect(afterAnswer).toEqual({ state: 'conversation_idle', mode: 'conversation' })

    const timedOut = reduceVoiceSession(afterAnswer, { type: 'CONVERSATION_TIMEOUT' })
    expect(timedOut.state).toBe('reading')
  })

  it('does not let a late resume tick fire after the user kept talking', () => {
    const listening = play([
      { type: 'START' },
      { type: 'ASSISTANT_SPEECH_START' },
      { type: 'ASSISTANT_SPEECH_END' },
      { type: 'USER_SPEECH_START' },
    ])
    expect(listening.state).toBe('listening')
    expect(reduceVoiceSession(listening, { type: 'RESUME_WINDOW_ELAPSED' }).state).toBe('listening')
  })

  it('leaves voice from listening when the mic is tapped again', () => {
    const listening = play([{ type: 'START' }])
    expect(reduceVoiceSession(listening, { type: 'MIC_TAP' }).state).toBe('reading')
  })
})

describe('voice intents', () => {
  it('classifies resume, hold, and open-conversation phrases', () => {
    expect(classifyVoiceUtterance('Back to the book.')).toBe('resume_audiobook')
    expect(classifyVoiceUtterance('thanks')).toBe('resume_audiobook')
    expect(classifyVoiceUtterance("that's enough")).toBe('resume_audiobook')
    expect(classifyVoiceUtterance('wait')).toBe('hold_session')
    expect(classifyVoiceUtterance("don't resume yet")).toBe('hold_session')
    expect(classifyVoiceUtterance('I have another question')).toBe('hold_session')
    expect(classifyVoiceUtterance('help me think through this')).toBe('open_conversation')
    expect(classifyVoiceUtterance('What should I notice here?')).toBe('open_conversation')
    expect(classifyVoiceUtterance('Who is speaking in this paragraph?')).toBe('none')
  })

  it('does not let the model resume from vibes', () => {
    expect(shouldHonorModelResume('none')).toBe(false)
    expect(shouldHonorModelResume('open_conversation')).toBe(false)
    expect(shouldHonorModelResume('hold_session')).toBe(false)
    expect(shouldHonorModelResume('resume_audiobook')).toBe(true)
  })
})

describe('voice reader context', () => {
  it('keeps nearby paragraphs tight and never dumps a whole chapter', () => {
    const paragraphs = Array.from({ length: 20 }, (_, i) => `Paragraph ${i + 1} ${'lorem '.repeat(80)}`)
    const nearby = nearbyParagraphWindow(paragraphs, 10)
    expect(nearby).toHaveLength(4)
    expect(nearby.join(' ')).not.toContain('Paragraph 1 ')
    expect(nearby.join(' ')).not.toContain('Paragraph 20 ')

    const context = buildVoiceReaderContext({
      bookTitle: 'The Odyssey',
      bookAuthor: 'Homer',
      chapterLabel: 'Book 5',
      readingAngle: 'hospitality',
      currentParagraph: paragraphs[10],
      nearbyParagraphs: nearby,
      visibleText: paragraphs.slice(8, 13).join(' '),
    })

    expect(context).toContain('The Odyssey')
    expect(context).toContain('Book 5')
    expect(context).toContain('hospitality')
    expect(context.length).toBeLessThan(3500)
    expect(context).not.toContain(paragraphs[0].slice(0, 40))
  })
})
