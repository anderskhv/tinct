import { describe, expect, it } from 'vitest'
import { LAB_COPY } from './labCopy'

describe('lab copy', () => {
  it('names Play, Chat, Talk, Read, and This book', () => {
    expect(LAB_COPY.play).toBe('Play')
    expect(LAB_COPY.listen).toBe('Listen')
    expect(LAB_COPY.hear).toBe('Listen')
    expect(LAB_COPY.read).toBe('Read')
    expect(LAB_COPY.talk).toBe('Talk')
    expect(LAB_COPY.chat).toBe('Chat')
    expect(LAB_COPY.listenNow).toBe('Listen')
    expect(LAB_COPY.connecting).toBe('Starting')
    expect(LAB_COPY.readyToSpeak).toBe('Ready to speak')
    expect(LAB_COPY.voiceStartFailed).toBe("Couldn't start voice. Type a question instead.")
    expect(LAB_COPY.inTheBook).toBe('This book')
    expect(LAB_COPY.castShort).toBe('People')
    expect(LAB_COPY.wordmark).toBe('Tinct')
    expect(LAB_COPY.library).toBe('Library')
    expect(LAB_COPY.reading).toBe('Reading')
    expect(LAB_COPY.layout).toBe('Layout')
    expect(LAB_COPY.sendLabel).toBe('Send')
  })
})
