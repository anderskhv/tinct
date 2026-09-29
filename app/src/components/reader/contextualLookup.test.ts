import { describe, expect, it } from 'vitest'
import { parseContextualLookup } from './contextualLookup'

describe('contextual lookup response', () => {
  it('keeps uncertainty explicit instead of guessing importance', () => {
    expect(parseContextualLookup(JSON.stringify({kind:'person',name:'A name',importance:'uncertain',subtitle:'Local role',body:'Local context'}))).toMatchObject({kind:'person',importance:'uncertain'})
  })
  it('rejects malformed, incomplete and unrecognised person cards', () => {
    for (const value of ['{"kind":"person"', '{"kind":"person","name":"A"}', '{"kind":"person","name":"A","subtitle":"B","body":"C","importance":"famous"}', '[]', 'null']) expect(parseContextualLookup(value)).toBeNull()
  })
  it('accepts fenced JSON and the previous plain-text response format', () => {
    expect(parseContextualLookup('\x60\x60\x60json\n{"kind":"definition","definition":"A meaning."}\n\x60\x60\x60')).toEqual({kind:'definition',definition:'A meaning.'})
    expect(parseContextualLookup('noun. A meaning.')).toEqual({kind:'definition',definition:'noun. A meaning.'})
  })
})
