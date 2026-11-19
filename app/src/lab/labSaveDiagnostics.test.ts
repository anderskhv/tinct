// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { answerSaveDetails } from './labSaveDiagnostics'

afterEach(() => { vi.restoreAllMocks(); localStorage.clear() })

it('copies aggregate sizes without reader content, identifiers, keys or storage writes', () => {
  const entries = [
    ['tinct:chat-history:private-book', 'secret conversation 🐻'],
    ['tinct:notes:private-book', 'secret annotation'],
    ['sb-private-account', 'secret token'],
  ]
  for (const [key, value] of entries) localStorage.setItem(key, value)
  const write = vi.spyOn(Storage.prototype, 'setItem')
  const remove = vi.spyOn(Storage.prototype, 'removeItem')
  const clear = vi.spyOn(Storage.prototype, 'clear')
  const details = answerSaveDetails('quota', true)
  expect(details).toContain('Account save confirmed: yes')
  for (const [index, label] of ['Chat history', 'Other Tinct data', 'Other site data'].entries()) {
    expect(details).toContain(`${label}: 1 entries; ${2 * (entries[index][0].length + entries[index][1].length)} bytes`)
  }
  for (const [key, value] of entries) { expect(details).not.toContain(key); expect(details).not.toContain(value) }
  expect(details).toContain('not browser quota or free space')
  expect(write).not.toHaveBeenCalled()
  expect(remove).not.toHaveBeenCalled()
  expect(clear).not.toHaveBeenCalled()
})

it('handles denied storage without leaking the exception or implying an account save', () => {
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('private account identifier') })
  expect(answerSaveDetails('untrusted details', false)).toBe('Tinct answer save: unknown\nAccount save confirmed: no\nLocalStorage snapshot: unavailable')
})

it('discards a partial scan if access fails midway', () => {
  localStorage.setItem('tinct:chat-history:private-book', 'private answer')
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('private data', 'SecurityError') })
  expect(answerSaveDetails('access', false)).toBe('Tinct answer save: access\nAccount save confirmed: no\nLocalStorage snapshot: unavailable')
})
