import { describe, expect, it } from 'vitest'
import { deskBarShortcut, deskBarShortcutLabel, deskBarUsesOption } from './deskBarShortcuts'

const key = (k: string, extra: Partial<KeyboardEvent> = {}) => ({ key: k, code: /^[a-z]$/i.test(k) ? `Key${k.toUpperCase()}` : '', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, isComposing: false, repeat: false, defaultPrevented: false, ...extra }) as KeyboardEvent

describe('selection bar keys', () => {
  it('maps E, A, N and H to Explain, Ask, Note and Highlight where typing does not start Ask', () => {
    expect(['e', 'a', 'n', 'h', 'E'].map(k => deskBarShortcut(key(k), false))).toEqual(['explain', 'ask', 'note', 'highlight', 'explain'])
    expect(['x', 's', 'z', '1', ' ', 'Enter'].map(k => deskBarShortcut(key(k), false))).toEqual([null, null, null, null, null, null])
  })

  it('leaves bare letters to the question where typing starts Ask, except N (as the margin reader)', () => {
    expect(['e', 'a', 'h', 'w'].map(k => deskBarShortcut(key(k), true))).toEqual([null, null, null, null])
    expect(deskBarShortcut(key('n'), true)).toBe('note')
  })

  it('takes Alt/Option with the letter in both readers, by key position when Option types a symbol', () => {
    expect(deskBarShortcut(key('e', { altKey: true }), true)).toBe('explain')
    expect(deskBarShortcut(key('Dead', { altKey: true, code: 'KeyE' }), true)).toBe('explain')
    expect(deskBarShortcut(key('å', { altKey: true, code: 'KeyA' }), true)).toBe('ask')
    expect(deskBarShortcut(key('˙', { altKey: true, code: 'KeyH' }), false)).toBe('highlight')
    expect(deskBarShortcut(key('n', { altKey: true }), true)).toBe('note')
  })

  it('never takes browser combinations, Shift, repeats, composition or handled keys', () => {
    for (const extra of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { repeat: true }, { isComposing: true }, { defaultPrevented: true }, { keyCode: 229 }, { altKey: true, shiftKey: true }] as Partial<KeyboardEvent>[]) {
      expect(deskBarShortcut(key('e', extra), false)).toBeNull()
    }
  })

  it('shows the key each bar answers to', () => {
    expect(deskBarShortcutLabel('explain', false, false)).toEqual({ hint: 'E', aria: 'E Alt+E' })
    expect(deskBarShortcutLabel('explain', true, false)).toEqual({ hint: 'Alt+E', aria: 'Alt+E' })
    expect(deskBarShortcutLabel('highlight', true, true)).toEqual({ hint: '⌥H', aria: 'Alt+H' })
    expect(deskBarShortcutLabel('note', true, true)).toEqual({ hint: 'N', aria: 'N Alt+N' })
    expect(deskBarUsesOption('MacIntel')).toBe(true)
    expect(deskBarUsesOption('Win32')).toBe(false)
  })
})
