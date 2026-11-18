// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { onlyFieldEdits } from './phoneCardPassage'

// Typing a follow-up rewrites the controlled textarea's text node on every key; the passage observers skip that
// (Anders, 12 Nov 2026: typing in a margin card lagged while every word of the chapter was repainted per key).
it('counts a textarea\'s own text change as a field edit, and a passage change as not', async () => {
  document.body.innerHTML = '<div id="root"><p><span data-testid="lab-word">word</span></p><div class="card"><textarea></textarea></div></div>'
  const root = document.getElementById('root')!
  const seen: MutationRecord[][] = []
  const observer = new MutationObserver(records => { seen.push(records) })
  observer.observe(root, { childList: true, subtree: true })
  root.querySelector('textarea')!.defaultValue = 'a typed question'
  await Promise.resolve()
  expect(seen).toHaveLength(1)
  expect(onlyFieldEdits(seen[0])).toBe(true)
  root.querySelector('p')!.append(document.createElement('span'))
  await Promise.resolve()
  expect(onlyFieldEdits(seen[1])).toBe(false)
  observer.disconnect()
})
