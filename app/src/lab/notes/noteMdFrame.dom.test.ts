// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const NOTE_MD_OUT = resolve(__dirname, '../../../public/lab/addbook/js/note-md.js')

describe('the margin frame’s note field', () => {
  it('makes a <tinct-note> field that answers as a textarea and shows its row only while writing', async () => {
    // The built file, as the frame loads it (a classic script).
    new Function(readFileSync(NOTE_MD_OUT, 'utf8'))()
    const api = (globalThis as unknown as { TinctNoteMd: { noteHtml(md: string): string } }).TinctNoteMd
    expect(api.noteHtml('**a** <b>')).toBe('<p><strong>a</strong> &lt;b&gt;</p>')
    document.body.innerHTML = '<tinct-note><div class="mr-note-edit" data-note-field>- one\n  - *two*</div></tinct-note>'
    const field = document.querySelector('.mr-note-edit') as HTMLElement & { value: string; setSelectionRange(a: number, z?: number): void }
    expect(field.getAttribute('contenteditable')).toBe('true')
    expect(field.value).toBe('- one\n  - *two*')
    expect(field.querySelector('em')?.textContent).toBe('two')
    expect(document.querySelectorAll('tinct-note .tn-fmt button').length).toBe(3)
    field.value = 'plain'
    expect(field.textContent).toBe('plain')
  })
})
