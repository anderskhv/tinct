import { describe, expect, it } from 'vitest'
import { LAB_HIGHLIGHT_UNDO_LIMIT, labHighlightRestoreIds, labHighlightUndoMessage, pushLabHighlightUndo, type LabHighlightUndoEntry } from './labHighlightUndo'
import type { LabHighlight } from './labHighlights'

const mark = (id: string, extra: Partial<LabHighlight> = {}): LabHighlight => ({ id, chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 2, color: 'gold', ...extra })

describe('the highlight undo stack', () => {
  it('keeps actions newest last, up to its limit', () => {
    let stack: LabHighlightUndoEntry[] = []
    for (let i = 0; i < LAB_HIGHLIGHT_UNDO_LIMIT + 5; i++) stack = pushLabHighlightUndo(stack, { kind: 'create', ids: [`h${i}`] })
    expect(stack).toHaveLength(LAB_HIGHLIGHT_UNDO_LIMIT)
    expect(stack[stack.length - 1]).toEqual({ kind: 'create', ids: [`h${LAB_HIGHLIGHT_UNDO_LIMIT + 4}`] })
    expect(stack[0]).toEqual({ kind: 'create', ids: ['h5'] })
  })

  it('folds repeated edits of one note or one colour into the first, so undo returns to what was there before', () => {
    let stack = pushLabHighlightUndo([], { kind: 'note', id: 'a', note: '' })
    stack = pushLabHighlightUndo(stack, { kind: 'note', id: 'a', note: 'h' })
    stack = pushLabHighlightUndo(stack, { kind: 'note', id: 'a', note: 'he' })
    expect(stack).toEqual([{ kind: 'note', id: 'a', note: '' }])
    stack = pushLabHighlightUndo(stack, { kind: 'color', id: 'a', color: 'gold' })
    stack = pushLabHighlightUndo(stack, { kind: 'color', id: 'a', color: 'rose' })
    expect(stack).toEqual([{ kind: 'note', id: 'a', note: '' }, { kind: 'color', id: 'a', color: 'gold' }])
    stack = pushLabHighlightUndo(stack, { kind: 'chapter-note', chapterNumber: 3, note: 'old' })
    stack = pushLabHighlightUndo(stack, { kind: 'chapter-note', chapterNumber: 3, note: 'older draft' })
    expect(stack[stack.length - 1]).toEqual({ kind: 'chapter-note', chapterNumber: 3, note: 'old' })
  })

  it('counts a note or colour on a mark just made as part of making it', () => {
    let stack = pushLabHighlightUndo([], { kind: 'create', ids: ['new'] })
    stack = pushLabHighlightUndo(stack, { kind: 'note', id: 'new', note: '' })
    stack = pushLabHighlightUndo(stack, { kind: 'color', id: 'new', color: 'gold' })
    expect(stack).toEqual([{ kind: 'create', ids: ['new'] }])
  })

  it('keeps a deletion after a creation as its own step', () => {
    let stack = pushLabHighlightUndo([], { kind: 'create', ids: ['new'] })
    stack = pushLabHighlightUndo(stack, { kind: 'delete', marks: [mark('new')] })
    expect(stack.map(entry => entry.kind)).toEqual(['create', 'delete'])
  })

  it('ignores empty steps and never mutates the stack it was given', () => {
    const stack: LabHighlightUndoEntry[] = [{ kind: 'create', ids: ['a'] }]
    expect(pushLabHighlightUndo(stack, { kind: 'create', ids: [] })).toEqual(stack)
    expect(pushLabHighlightUndo(stack, { kind: 'delete', marks: [] })).toEqual(stack)
    pushLabHighlightUndo(stack, { kind: 'create', ids: ['b'] })
    expect(stack).toEqual([{ kind: 'create', ids: ['a'] }])
  })

  it('names what was undone', () => {
    expect(labHighlightUndoMessage({ kind: 'create', ids: ['a'] })).toBe('Highlight removed')
    expect(labHighlightUndoMessage({ kind: 'delete', marks: [mark('a')] })).toBe('Highlight restored')
    expect(labHighlightUndoMessage({ kind: 'delete', marks: [mark('a', { note: 'mine' })] })).toBe('Note restored')
    expect(labHighlightUndoMessage({ kind: 'color', id: 'a', color: 'gold' })).toBe('Colour changed back')
    expect(labHighlightUndoMessage({ kind: 'note', id: 'a', note: '' })).toBe('Note changed back')
    expect(labHighlightUndoMessage({ kind: 'chapter-note', chapterNumber: 1, note: '' })).toBe('Chapter note removed')
  })
})

describe('ids for restored marks', () => {
  it('gives a tombstoned mark a new id with its old creation time, and keeps any other id', () => {
    const ids = labHighlightRestoreIds([mark('hl-1780000000000-abc123'), mark('legacy'), mark('kept')], new Set(['hl-1780000000000-abc123', 'legacy']), () => 'zz9')
    expect(ids.get('hl-1780000000000-abc123')).toBe('hl-1780000000000-zz9')
    expect(ids.get('legacy')).toBe('legacy-rzz9')
    expect(ids.get('kept')).toBe('kept')
  })
})
