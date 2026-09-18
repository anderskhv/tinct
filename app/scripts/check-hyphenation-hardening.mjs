import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const live = process.env.HYPHENATION_LIVE === '1'
const origin = 'https://tinct.app'
const output = 'artifacts/hyphenation-hardening'
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
await fs.mkdir(output, { recursive: true })

const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] })
const results = []

async function routeBuiltApp(page, delayEnglish) {
  await page.route('**/*', async route => {
    const request = route.request()
    if (request.method() !== 'GET') return route.abort()
    const url = new URL(request.url())
    if (/\/assets\/en-us-[^/]+\.js$/.test(url.pathname)) await delayEnglish()
    if (live) return route.continue()
    if (url.origin !== origin) return route.continue()
    const pathname = ['/reader', '/lab/phone', '/lab/desktop'].includes(url.pathname) ? '/app.html' : url.pathname
    const filename = path.resolve('dist', `.${pathname}`)
    if (!filename.startsWith(`${path.resolve('dist')}/`)) return route.abort()
    try {
      if ((await fs.stat(filename)).isFile()) return route.fulfill({ path: filename })
    } catch {}
    return route.continue()
  })
}

async function boot(page, handoff) {
  await page.addInitScript(value => {
    if (!sessionStorage.getItem('qa:hyphenation-booted')) {
      localStorage.removeItem('tinct-lab-position')
      localStorage.removeItem('tinct:lab-position')
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify(value))
      sessionStorage.setItem('qa:hyphenation-booted', 'true')
    }
    navigator.mediaDevices?.getUserMedia && Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => { throw new Error('Microphone disabled for hyphenation acceptance') },
    })
    const mute = node => { if (node instanceof HTMLMediaElement) node.muted = true }
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      mute(node)
      if (node instanceof Element) node.querySelectorAll('audio,video').forEach(mute)
    }))).observe(document.documentElement, { childList: true, subtree: true })
  }, handoff)
  await page.goto(`${origin}/reader?chrome=v2`, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('lab-root').waitFor({ timeout: 45000 })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(900)
}

async function pageState(page) {
  return page.getByTestId('lab-root').evaluate(root => {
    const visible = [...root.querySelectorAll('[data-testid="lab-word"]')].filter(node => {
      const rect = node.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    })
    return {
      place: root.dataset.place,
      edition: root.dataset.readerEdition,
      lang: root.lang,
      keys: visible.map(node => `${node.dataset.paragraphIndex}:${node.dataset.wordIndex}`),
      fragments: [...root.querySelectorAll('[data-testid="lab-word-fragment"]')].filter(node => {
        const rect = node.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      }).map(node => ({ text: node.textContent.trim(), left: node.getBoundingClientRect().left })),
    }
  })
}

async function turn(page, key) {
  await page.keyboard.press(key)
  await page.waitForTimeout(450)
  return pageState(page)
}

async function locateTrailingSplit(page, maxTurns = 40) {
  for (let turnIndex = 0; turnIndex < maxTurns; turnIndex += 1) {
    const split = await page.evaluate(() => {
      const fragments = [...document.querySelectorAll('[data-testid="lab-word-fragment"]')]
        .filter(node => { const rect = node.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 })
        .sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left)
      for (const fragment of fragments) {
        const line = fragment.closest('[data-paragraph-index]') || fragment.parentElement
        const owned = [...line.querySelectorAll('[data-testid="lab-word"][data-word-index]')]
        const previous = owned.at(-1)
        if (!previous) continue
        const paragraphIndex = Number(previous.dataset.paragraphIndex)
        const wordIndex = Number(previous.dataset.wordIndex) + 1
        const target = document.querySelectorAll(`[data-testid="lab-word"][data-paragraph-index="${paragraphIndex}"][data-word-index="${wordIndex}"]`)
        if (target.length === 0) return {
          fragment: fragment.textContent.trim(),
          previousKey: `${paragraphIndex}:${wordIndex - 1}`,
          targetKey: `${paragraphIndex}:${wordIndex}`,
        }
      }
      return null
    })
    if (split) return { ...split, before: await pageState(page), turnIndex }
    await turn(page, 'ArrowRight')
  }
  throw new Error(`No page-edge split found in ${maxTurns} page turns`)
}

async function sourceWord(page, bookId, editionKey, chapterNumber, targetKey) {
  return page.evaluate(async ({ bookId, editionKey, chapterNumber, targetKey }) => {
    const manifest = await fetch(`/data/editions-chapters/${bookId}-${editionKey}/manifest.json`).then(response => response.json())
    const chapter = manifest.chapters.find(item => item.number === chapterNumber)
    const data = await fetch(`/data/editions-chapters/${bookId}-${editionKey}/${chapter.path}`).then(response => response.json())
    const [paragraphIndex, wordIndex] = targetKey.split(':').map(Number)
    return data.paragraphs[paragraphIndex].trim().split(/\s+/u)[wordIndex].replace(/^_+|_+$/g, '')
  }, { bookId, editionKey, chapterNumber, targetKey })
}

async function assertFragmentInvariants(page, split, fullWord) {
  const evidence = await page.evaluate(({ fragmentText, targetKey, fullWord }) => {
    const fragment = [...document.querySelectorAll('[data-testid="lab-word-fragment"]')]
      .find(node => node.textContent.trim() === fragmentText)
    const [paragraphIndex, wordIndex] = targetKey.split(':')
    assertNode(fragment, 'fragment must remain visible')
    const range = document.createRange()
    range.selectNodeContents(fragment.closest('.lab-passage'))
    const selection = getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    const copied = selection.toString()
    selection.removeAllRanges()
    return {
      ariaHidden: fragment.getAttribute('aria-hidden'),
      wordIndex: fragment.getAttribute('data-word-index'),
      paragraphIndex: fragment.getAttribute('data-paragraph-index'),
      userSelect: getComputedStyle(fragment).userSelect,
      generatedHyphen: getComputedStyle(fragment, '::after').content,
      textContent: fragment.textContent,
      copied,
      targetOwnedHere: document.querySelectorAll(`[data-testid="lab-word"][data-paragraph-index="${paragraphIndex}"][data-word-index="${wordIndex}"]`).length,
      fullWordOccurrences: [...document.querySelectorAll('[data-testid="lab-word"]')].filter(node => node.textContent.trim() === fullWord).length,
    }
    function assertNode(value, message) { if (!value) throw new Error(message) }
  }, { fragmentText: split.fragment, targetKey: split.targetKey, fullWord })
  assert.equal(evidence.ariaHidden, 'true')
  assert.equal(evidence.wordIndex, null)
  assert.equal(evidence.paragraphIndex, null)
  assert.equal(evidence.userSelect, 'none')
  assert.match(evidence.generatedHyphen, /2010|‐/u)
  assert(!/[\u2010\u00ad]/u.test(evidence.textContent), 'synthetic hyphen must not enter textContent')
  assert(!/[\u2010\u00ad]/u.test(evidence.copied), 'synthetic hyphen must not enter copied text')
  assert.equal(evidence.targetOwnedHere, 0, 'split word belongs to the next page only')
  const aria = await page.getByTestId('lab-word-fragment').filter({ hasText: split.fragment }).first().ariaSnapshot()
  assert.equal(aria.trim(), '', 'display fragment must be absent from the accessibility tree')
  return evidence
}

async function exerciseAudioAcrossSplit(page, split) {
  const result = { service: 'production audio API', actual: false, limit: null, sequence: [] }
  try {
    await page.getByTestId('lab-v2-play').click()
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.playing === 'true', null, { timeout: 20000 })
  } catch (error) {
    result.limit = String(error?.message || error)
    return result
  }
  try {
    const [targetParagraph, targetWord] = split.targetKey.split(':').map(Number)
    const seekWord = Math.max(0, targetWord - 3)
    const readingStage = page.getByTestId('lab-reading-stage')
    const previous = readingStage.locator(`.lab-passage.is-inline-hearing [data-testid="lab-word"][data-paragraph-index="${targetParagraph}"][data-word-index="${seekWord}"]`).first()
    // The native paginator keeps an off-screen measuring copy of the words.
    // Seek through the visible inline-hearing page so this reaches the app's
    // real seekAudioToWord handler, rather than clicking the inert copy.
    await previous.evaluate(node => node.click())
    const deadline = Date.now() + 20000
    while (Date.now() < deadline) {
      const current = await readingStage.locator('.lab-passage.is-inline-hearing [data-testid="lab-word"].is-current').evaluateAll(nodes => nodes.map(node => `${node.dataset.paragraphIndex}:${node.dataset.wordIndex}`))
      const key = current[0]
      if (key && result.sequence.at(-1) !== key) result.sequence.push(key)
      if (result.sequence.includes(split.targetKey)) {
        const targetAt = result.sequence.indexOf(split.targetKey)
        const after = result.sequence[targetAt + 1]
        if (after || Date.now() + 700 >= deadline) break
      }
      await page.waitForTimeout(25)
    }
    assert(result.sequence.some(value => {
      const [paragraphIndex, wordIndex] = value.split(':').map(Number)
      return paragraphIndex === targetParagraph && wordIndex < targetWord
    }), `audio follow must be observed before the split: ${JSON.stringify(result.sequence)}`)
    assert(result.sequence.includes(split.targetKey), 'audio follow must reach the split word on its owning page')
    const numeric = result.sequence.map(value => value.split(':').map(Number))
    for (let index = 1; index < numeric.length; index += 1) {
      const [priorP, priorW] = numeric[index - 1]
      const [nextP, nextW] = numeric[index]
      assert(nextP > priorP || nextP === priorP && nextW > priorW, 'audio follow must never move backward or duplicate')
    }
    assert.equal(await page.locator('[data-testid="lab-word-fragment"].is-current').count(), 0)
    result.actual = true
    return result
  } finally {
    if (await page.getByTestId('lab-root').getAttribute('data-playing') === 'true') await page.getByTestId('lab-v2-play').click().catch(() => {})
  }
}

async function splitRestoreAcceptance(name, viewport) {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await routeBuiltApp(page, async () => {})
  await boot(page, {
    kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'kjv-en',
    savedPlace: { bookId: 'bible', chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, page: 0 },
  })
  const split = await locateTrailingSplit(page)
  const fullWord = await sourceWord(page, 'bible', 'kjv-en', 1, split.targetKey)
  const invariants = await assertFragmentInvariants(page, split, fullWord)
  await page.screenshot({ path: `${output}/${live ? 'production' : 'candidate'}-${name}-split.png` })
  const before = await pageState(page)
  const next = await turn(page, 'ArrowRight')
  const [paragraphIndex, wordIndex] = split.targetKey.split(':')
  const owner = page.locator(`[data-testid="lab-word"][data-paragraph-index="${paragraphIndex}"][data-word-index="${wordIndex}"]`)
  await owner.waitFor({ timeout: 10000 })
  const remainder = (await owner.first().textContent()).trim()
  assert.equal(`${split.fragment}${remainder}`, fullWord, 'visible fragments must reconstruct the source word')
  assert.equal(await owner.count(), 1, 'the logical word must be owned exactly once')
  const back = await turn(page, 'ArrowLeft')
  assert.deepEqual(back.keys, before.keys, 'back must restore the identical logical page')
  assert.deepEqual(back.fragments, before.fragments, 'back must restore the identical split')
  const forward = await turn(page, 'ArrowRight')
  assert.deepEqual(forward.keys, next.keys, 'forward must restore the identical next page')
  await page.waitForTimeout(900)
  const restorePlace = forward.place
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady === 'true', null, { timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1000)
  const reloaded = await pageState(page)
  assert.equal(reloaded.place, restorePlace, 'reload must preserve the logical reading position')
  assert(reloaded.keys.includes(split.targetKey), 'reload must restore the owning word in view')
  await page.screenshot({ path: `${output}/${live ? 'production' : 'candidate'}-${name}-restored.png` })
  const splitAgain = await turn(page, 'ArrowLeft')
  assert(splitAgain.fragments.some(fragment => fragment.text === split.fragment), 'audio proof must return to the same split page')
  const audio = await exerciseAudioAcrossSplit(page, split)
  const bundle = await page.locator('script[src]').evaluateAll(nodes => nodes.map(node => new URL(node.src).pathname).find(value => /\/assets\/index-[^/]+\.js$/.test(value)))
  if (expectedBundle) assert.equal(bundle, expectedBundle)
  assert.deepEqual(errors, [], 'reader must not raise browser errors')
  await context.close()
  return { name, viewport, bundle, split, fullWord, invariants, audio, restorePlace, reloadedPlace: reloaded.place }
}

async function languageAcceptance(name, viewport) {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' })
  const page = await context.newPage()
  let releaseEnglish
  let englishReleased = false
  const englishGate = new Promise(resolve => { releaseEnglish = resolve })
  const patternRequests = []
  page.on('request', request => {
    const pathname = new URL(request.url()).pathname
    if (/\/assets\/(?:en-us|da)-[^/]+\.js$/.test(pathname)) patternRequests.push(pathname)
  })
  await routeBuiltApp(page, async () => { if (!englishReleased) await englishGate })
  await boot(page, {
    kind: 'open-reader', bookId: 'great-expectations', primaryEditionKey: 'original-en',
    savedPlace: { bookId: 'great-expectations', chapterNumber: 1, paragraphIndex: 4, wordIndex: 0, page: 0 },
  })
  const before = await pageState(page)
  assert(patternRequests.some(value => value.includes('/en-us-')), 'English patterns must be requested lazily')
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-settings').click()
  await page.getByTestId('lab-v2-main-edition').selectOption('modern-da')
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    return root?.dataset.readerEdition === 'modern-da' && root.lang === 'da'
  }, null, { timeout: 45000 })
  await page.waitForFunction(() => [...performance.getEntriesByType('resource')].some(entry => /\/assets\/da-[^/]+\.js$/.test(new URL(entry.name).pathname)), null, { timeout: 30000 })
  await page.waitForTimeout(900)
  const danish = await pageState(page)
  assert.equal(danish.place, before.place, 'EN to DA must preserve logical position')
  const danishKeys = danish.keys
  englishReleased = true
  releaseEnglish()
  await page.waitForTimeout(1200)
  const afterStaleEnglish = await pageState(page)
  assert.equal(afterStaleEnglish.edition, 'modern-da', 'late English patterns must not replace Danish')
  assert.equal(afterStaleEnglish.lang, 'da')
  assert.deepEqual(afterStaleEnglish.keys, danishKeys, 'late English completion must not repaginate the Danish edition')
  await page.screenshot({ path: `${output}/${live ? 'production' : 'candidate'}-${name}-danish.png` })
  await page.getByTestId('lab-v2-main-edition').selectOption('original-en')
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    return root?.dataset.readerEdition === 'original-en' && root.lang === 'en'
  }, null, { timeout: 45000 })
  await page.waitForTimeout(900)
  const english = await pageState(page)
  assert.equal(english.place, before.place, 'DA to EN must preserve logical position')
  assert(patternRequests.some(value => value.includes('/da-')), 'Danish patterns must be requested lazily')
  await page.screenshot({ path: `${output}/${live ? 'production' : 'candidate'}-${name}-english.png` })
  await context.close()
  return { name, viewport, before, danish, afterStaleEnglish, english, patternRequests: [...new Set(patternRequests)] }
}

try {
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['phone', { width: 390, height: 844 }],
  ]) {
    results.push({ splitRestore: await splitRestoreAcceptance(name, viewport) })
    results.push({ languageSwitch: await languageAcceptance(name, viewport) })
  }
  await fs.writeFile(`${output}/${live ? 'production' : 'candidate'}-acceptance.json`, `${JSON.stringify(results, null, 2)}\n`)
  console.log(JSON.stringify({ live, output, results }, null, 2))
} finally {
  await browser.close()
}
