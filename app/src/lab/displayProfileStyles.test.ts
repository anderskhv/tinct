// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'
import { displayProfileStylesReady } from './displayProfileStyles'

afterEach(() => { document.head.innerHTML = ''; vi.useRealTimers() })

function profileLink() {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = '/lab/display-profile.css'
  link.dataset.displayProfile = ''
  document.head.append(link)
  return link
}

async function settled(promise: Promise<void>) {
  let done = false
  void promise.then(() => { done = true })
  for (let i = 0; i < 4; i++) await Promise.resolve()
  return done
}

test('a page without the e-ink stylesheet is not held', async () => {
  expect(await settled(displayProfileStylesReady())).toBe(true)
})

test('waits for the e-ink stylesheet to load', async () => {
  const link = profileLink()
  const ready = displayProfileStylesReady()
  expect(await settled(ready)).toBe(false)
  link.dispatchEvent(new Event('load'))
  expect(await settled(ready)).toBe(true)
})

test('a failed stylesheet does not hold the page', async () => {
  const link = profileLink()
  const ready = displayProfileStylesReady()
  link.dispatchEvent(new Event('error'))
  expect(await settled(ready)).toBe(true)
})

test('a stylesheet that never reports stops holding the page', async () => {
  vi.useFakeTimers()
  profileLink()
  const ready = displayProfileStylesReady(document, 4000)
  expect(await settled(ready)).toBe(false)
  vi.advanceTimersByTime(4000)
  expect(await settled(ready)).toBe(true)
})

test('the sign-in page links the e-ink stylesheet in its head, before any script runs', () => {
  const html = readFileSync(resolve(__dirname, '../../public/lab/sign-in/index.html'), 'utf8')
  const head = html.slice(0, html.indexOf('</head>'))
  const link = head.search(/<link rel="stylesheet" href="\/lab\/display-profile\.css" data-display-profile>/)
  expect(link).toBeGreaterThan(-1)
  expect(link).toBeLessThan(head.indexOf('<script'))
})
