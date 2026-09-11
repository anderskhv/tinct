import { describe, expect, it } from 'vitest'
import {
  LAB_CALL_CAPTION_CHARS,
  LAB_CALL_COPY,
  labCallCaption,
  labCallCue,
  labCallRestore,
  labCallUtterance,
  labCallView,
  type LabCallInput,
  type LabCallView,
} from './labVoiceCall'

/**
 * The call surface is driven by two independent streams of session facts:
 * transport events and microphone/assistant events. These replay them the way
 * the session reports them, and assert the surface can never claim more than
 * the events support.
 */
function view(overrides: Partial<LabCallInput> = {}): LabCallView {
  return labCallView({
    connection: 'connected',
    activity: 'listening',
    micMuted: false,
    ...overrides,
  })
}

describe('the call view', () => {
  it('starts at Listening once the connection is up and the mic is live', () => {
    const live = view()
    expect(live.status).toBe('listening')
    expect(live.statusText).toBe('Listening.')
    expect(live.motion).toBe('breathe')
    expect(live.broken).toBe(false)
    expect(live.connectionText).toBe(LAB_CALL_COPY.connectionConnected)
  })

  it('turns a broken ring while the assistant works, and says Thinking', () => {
    for (const activity of ['thinking', 'checking', 'preparing'] as const) {
      const working = view({ activity })
      expect(working.status).toBe('thinking')
      expect(working.statusText).toBe('Thinking.')
      expect(working.motion).toBe('rotate')
      expect(working.broken).toBe(true)
    }
  })

  it('pulses with the assistant while she speaks', () => {
    const speaking = view({ activity: 'speaking' })
    expect(speaking.status).toBe('speaking')
    expect(speaking.statusText).toBe('Speaking.')
    // `pulse` is the contract that the circle follows real audio; no other
    // status may claim it.
    expect(speaking.motion).toBe('pulse')
  })

  it('reports the connection separately from what is happening on it', () => {
    expect(view({ connection: 'connecting', activity: 'listening' }).connectionText)
      .toBe(LAB_CALL_COPY.connectionConnecting)
    expect(view({ activity: 'speaking' }).connectionText).toBe(LAB_CALL_COPY.connectionConnected)
    expect(view({ connection: 'disconnected', activity: 'speaking' }).connectionText)
      .toBe(LAB_CALL_COPY.connectionLost)
  })

  describe('when the transport is gone', () => {
    // Every activity the session could still be carrying, including the one
    // that would otherwise read as a live microphone.
    const activities = ['idle', 'connecting', 'listening', 'thinking', 'speaking', 'checking', 'preparing'] as const

    it('can never render Listening, whatever the last activity event said', () => {
      for (const activity of activities) {
        for (const micMuted of [false, true]) {
          const dropped = view({ connection: 'disconnected', activity, micMuted })
          expect(dropped.status).toBe('disconnected')
          expect(dropped.statusText).toBe('Disconnected')
          expect(dropped.statusText).not.toBe('Listening.')
          expect(dropped.motion).toBe('still')
          expect(dropped.broken).toBe(true)
          expect(dropped.connected).toBe(false)
          expect(dropped.showReconnect).toBe(true)
        }
      }
    })

    it('treats no session at all the same as a dropped one', () => {
      const none = view({ connection: 'idle', activity: 'listening' })
      expect(none.status).toBe('disconnected')
      expect(none.showReconnect).toBe(true)
    })
  })

  it('shows Connecting, not Listening, before the transport is up', () => {
    for (const activity of ['idle', 'connecting', 'listening'] as const) {
      const opening = view({ connection: 'connecting', activity })
      expect(opening.status).toBe('connecting')
      expect(opening.statusText).toBe('Connecting.')
      expect(opening.connected).toBe(false)
      expect(opening.showReconnect).toBe(false)
    }
  })

  describe('mute', () => {
    it('says the microphone is off and keeps the connected status', () => {
      const muted = view({ micMuted: true })
      expect(muted.status).toBe('muted')
      expect(muted.statusText).toBe('Microphone off')
      expect(muted.connected).toBe(true)
      expect(muted.connectionText).toBe(LAB_CALL_COPY.connectionConnected)
      expect(muted.micOff).toBe(true)
      // A muted circle must not breathe: breathing is what listening looks like.
      expect(muted.motion).toBe('still')
    })

    it('lets the assistant go on speaking, carrying the closed mic alongside', () => {
      const speakingMuted = view({ activity: 'speaking', micMuted: true })
      expect(speakingMuted.status).toBe('speaking')
      expect(speakingMuted.statusText).toBe('Speaking.')
      expect(speakingMuted.micOff).toBe(true)
      expect(speakingMuted.connected).toBe(true)
    })

    it('never offers Reconnect while the line is up', () => {
      expect(view({ micMuted: true }).showReconnect).toBe(false)
    })
  })
})

describe('the call cues', () => {
  it('sounds readiness the first time the microphone is live', () => {
    const connecting = view({ connection: 'connecting', activity: 'connecting' })
    expect(labCallCue(connecting, view())).toBe('ready')
  })

  it('stays silent on the ordinary turn-taking', () => {
    expect(labCallCue(view({ activity: 'speaking' }), view())).toBeNull()
    expect(labCallCue(view({ micMuted: true }), view())).toBeNull()
    expect(labCallCue(view(), view({ activity: 'thinking' }))).toBeNull()
  })

  it('announces a drop of a call that had connected', () => {
    expect(labCallCue(view(), view({ connection: 'disconnected' }))).toBe('dropped')
    expect(labCallCue(view({ activity: 'speaking' }), view({ connection: 'disconnected' }))).toBe('dropped')
  })

  it('does not announce a drop for a start that never connected', () => {
    const connecting = view({ connection: 'connecting', activity: 'connecting' })
    expect(labCallCue(connecting, view({ connection: 'disconnected' }))).toBeNull()
  })

  it('sounds readiness again after a reconnection', () => {
    const dropped = view({ connection: 'disconnected' })
    expect(labCallCue(dropped, view())).toBe('ready')
  })

  it('says nothing on the first view of a call', () => {
    expect(labCallCue(null, view())).toBeNull()
  })

  it('does not repeat itself while nothing changes', () => {
    const dropped = view({ connection: 'disconnected' })
    expect(labCallCue(dropped, dropped)).toBeNull()
    expect(labCallCue(view(), view())).toBeNull()
  })
})

describe('the reading place the dialogue began from', () => {
  const anchor = {
    bookId: 'bible',
    chapterNumber: 3,
    pageIndex: 2,
    paragraphIndex: 7,
    wordIndex: 4,
  }

  it('restores nothing when the call left the reader where it found them', () => {
    expect(labCallRestore(anchor, { bookId: 'bible', chapterNumber: 3, pageIndex: 2 }))
      .toEqual({ kind: 'none' })
  })

  it('restores the page when the call moved within the chapter', () => {
    expect(labCallRestore(anchor, { bookId: 'bible', chapterNumber: 3, pageIndex: 5 })).toEqual({
      kind: 'page',
      pageIndex: 2,
      paragraphIndex: 7,
      wordIndex: 4,
    })
  })

  it('restores the chapter when the call moved out of it', () => {
    expect(labCallRestore(anchor, { bookId: 'bible', chapterNumber: 9, pageIndex: 0 })).toEqual({
      kind: 'chapter',
      chapterNumber: 3,
      pageIndex: 2,
      paragraphIndex: 7,
      wordIndex: 4,
    })
  })

  it('never writes a place across books', () => {
    expect(labCallRestore(anchor, { bookId: 'odyssey', chapterNumber: 1, pageIndex: 0 }))
      .toEqual({ kind: 'none' })
  })

  it('restores nothing when no dialogue place was captured', () => {
    expect(labCallRestore(null, { bookId: 'bible', chapterNumber: 3, pageIndex: 2 }))
      .toEqual({ kind: 'none' })
  })
})

describe('the caption under the status word', () => {
  const turns = [
    { role: 'user' as const, content: 'Why the real name?' },
    { role: 'assistant' as const, content: 'Pride,   mostly.\nHe has just won.' },
  ]

  it('is what she is saying while she speaks, as one line', () => {
    expect(labCallUtterance(turns)).toBe('Pride, mostly. He has just won.')
    expect(labCallCaption({ status: 'speaking' }, labCallUtterance(turns))).toBe('Pride, mostly. He has just won.')
  })

  it('keeps the tail of a long utterance behind an ellipsis', () => {
    const long = `${'The name is what lets Polyphemus curse him to Poseidon, and that curse shapes the next ten years. '.repeat(3)}Pride wins.`
    const line = labCallUtterance([{ role: 'assistant', content: long }])!
    expect(line.startsWith('\u2026')).toBe(true)
    expect(line.endsWith('Pride wins.')).toBe(true)
    expect(line.length).toBeLessThanOrEqual(LAB_CALL_CAPTION_CHARS + 1)
  })

  it('invites the reader while the microphone is open', () => {
    expect(labCallCaption({ status: 'listening' }, 'earlier reply')).toBe(LAB_CALL_COPY.askAboutPage)
  })

  it('says nothing more while connecting, thinking, muted or dropped', () => {
    for (const status of ['connecting', 'thinking', 'muted', 'disconnected'] as const) {
      expect(labCallCaption({ status }, 'earlier reply')).toBeNull()
    }
  })

  it('has nothing to say before she has spoken', () => {
    expect(labCallUtterance([])).toBeNull()
    expect(labCallUtterance([{ role: 'user', content: 'Hello' }])).toBeNull()
    expect(labCallCaption({ status: 'speaking' }, null)).toBeNull()
  })
})
