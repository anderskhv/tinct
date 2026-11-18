import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
// @ts-expect-error a plain .mjs build script, no types
import { buildNoteMd, NOTE_MD_OUT } from '../../../scripts/build-note-md.mjs'

describe('the margin frame’s note formatting (public/lab/addbook/js/note-md.js)', () => {
  it('is built from the reader’s own source: run `node scripts/build-note-md.mjs` after changing src/lab/notes', () => {
    expect(readFileSync(NOTE_MD_OUT, 'utf8')).toBe(buildNoteMd())
  })

})
