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
    const observeMedia = () => {
      if (!document.documentElement) return
      new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
        mute(node)
        if (node instanceof Element) node.querySelectorAll('audio,video').forEach(mute)
      }))).observe(document.documentElement, { childList: true, subtree: true })
    }
    if (document.documentElement) observeMedia()
    else addEventListener('DOMContentLoaded', observeMedia, { once: true })
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
      chapter: root.dataset.chapter,
      chrome: root.dataset.chromeState,
      playing: root.dataset.playing,
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

async function stablePageState(page, timeout = 10000) {
  const deadline = Date.now() + timeout
  let previous = null
  let stableSamples = 0
  while (Date.now() < deadline) {
    const current = await pageState(page)
    const signature = JSON.stringify({
      place: current.place,
      edition: current.edition,
      lang: current.lang,
      keys: current.keys,
      fragments: current.fragments.map(fragment => fragment.text),
    })
    stableSamples = signature === previous ? stableSamples + 1 : 0
    if (stableSamples >= 3) return current
    previous = signature
    await page.waitForTimeout(250)
  }
  throw new Error('reader page did not settle before the acceptance deadline')
}

async function turn(page, key) {
  await page.keyboard.press(key)
  await page.waitForTimeout(450)
  return pageState(page)
}

async function locateTrailingSplit(page, maxTurns = 100) {
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
        const wordIndex = Number(previous.dataset.wordIndex)
        const nextVisible = document.querySelectorAll(`[data-testid="lab-word"][data-paragraph-index="${paragraphIndex}"][data-word-index="${wordIndex + 1}"]`)
        if (nextVisible.length === 0) return {
          fragment: fragment.textContent.trim(),
          previousKey: `${paragraphIndex}:${wordIndex}`,
          paragraphIndex,
        }
      }
      return null
    })
    if (split) return { ...split, before: await pageState(page), turnIndex }
    await turn(page, 'ArrowRight')
  }
  throw new Error(`No page-edge split found in ${maxTurns} page turns`)
}

async function resolveSplitOwner(page, split, bookId, editionKey) {
  return page.evaluate(async ({ split, bookId, editionKey }) => {
    const chapterNumber = Number(document.querySelector('[data-testid="lab-root"]')?.getAttribute('data-chapter'))
    if (!Number.isInteger(chapterNumber)) throw new Error('Reader chapter is unavailable')
    const manifest = await fetch(`/data/editions-chapters/${bookId}-${editionKey}/manifest.json`).then(response => response.json())
    const chapter = manifest.chapters.find(item => item.number === chapterNumber)
    const data = await fetch(`/data/editions-chapters/${bookId}-${editionKey}/${chapter.path}`).then(response => response.json())
    const sourceWords = data.paragraphs[split.paragraphIndex].trim().split(/\s+/u).map(word => word.replace(/^_+|_+$/g, ''))
    const candidates = [...document.querySelectorAll(`[data-testid="lab-word"][data-paragraph-index="${split.paragraphIndex}"][data-word-index]`)]
      .filter(node => { const rect = node.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 })
      .map(node => ({ node, wordIndex: Number(node.dataset.wordIndex), remainder: node.textContent.trim() }))
    // Resolve ownership from the visible continuation, then independently
    // require the reconstructed word to exist in the source. Narration sidecar
    // indices stay in source-token coordinates; silent verse markers simply
    // never become the current spoken word.
    const owner = candidates.find(({ remainder }) => sourceWords.includes(`${split.fragment}${remainder}`))
    if (!owner) throw new Error(`Could not resolve the owning word for fragment ${JSON.stringify(split.fragment)}: ${JSON.stringify(candidates.slice(0, 8).map(({ wordIndex, remainder }) => ({ wordIndex, remainder })))}`)
    const fullWord = `${split.fragment}${owner.remainder}`
    const sourceIndex = owner.wordIndex
    if (sourceWords[sourceIndex] !== fullWord) throw new Error(`Resolved owner ${owner.wordIndex} does not match source word ${JSON.stringify(sourceWords[sourceIndex])}`)
    return {
      targetKey: `${split.paragraphIndex}:${owner.wordIndex}`,
      audioTargetKey: `${split.paragraphIndex}:${owner.wordIndex}`,
      fullWord,
      remainder: owner.remainder,
    }
  }, { split, bookId, editionKey })
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
    const readingStage = page.getByTestId('lab-reading-stage')
    const audioTargetKey = split.audioTargetKey
    const [targetParagraph, targetWord] = audioTargetKey.split(':').map(Number)
    const target = readingStage.locator(`.lab-hearing-word[data-paragraph-index="${targetParagraph}"][data-word-index="${targetWord}"]:visible`).last()
    await target.waitFor({ timeout: 10000 })
    // Starting playback can briefly retain the paused paint before the audio
    // source reports its first real time. Wait for that stale paint to move,
    // then exercise the real rendered-word seek. Doing this in that order
    // distinguishes the click result from the paint retained while paused.
    await page.waitForFunction(({ paragraph, word }) => {
      const current = [...document.querySelectorAll('[data-testid="lab-reading-stage"] .lab-hearing-word.is-current[data-paragraph-index][data-word-index]')]
        .find(node => {
          const rect = node.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0 && !node.closest('.lab-page-measure')
        })
      return current
        && (Number(current.dataset.paragraphIndex) !== paragraph || Number(current.dataset.wordIndex) !== word)
    }, { paragraph: targetParagraph, word: targetWord }, { timeout: 10000 })
    await target.dispatchEvent('click')
    await readingStage.locator(`.lab-hearing-word.is-current[data-paragraph-index="${targetParagraph}"][data-word-index="${targetWord}"]:visible`).first().waitFor({ timeout: 10000 })
    // The owning page begins with the complete word whose display-only opening
    // was painted on the prior page. Starting narration here proves the real
    // audio paint belongs to that full logical word, never to the fragment.
    const deadline = Date.now() + 30000
    while (Date.now() < deadline) {
      const current = await readingStage.locator('.lab-hearing-word.is-current[data-paragraph-index][data-word-index]').evaluateAll(nodes => nodes.filter(node => {
        const rect = node.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && !node.closest('.lab-page-measure')
      }).map(node => `${node.dataset.paragraphIndex}:${node.dataset.wordIndex}`))
      const key = current[0]
      if (key && result.sequence.at(-1) !== key) result.sequence.push(key)
      if (result.sequence.includes(audioTargetKey)) {
        const targetAt = result.sequence.indexOf(audioTargetKey)
        const after = result.sequence[targetAt + 1]
        if (after || Date.now() + 700 >= deadline) break
      }
      await page.waitForTimeout(25)
    }
    assert(result.sequence.includes(audioTargetKey), `audio follow must reach the split word ${audioTargetKey} on its owning page: ${JSON.stringify(result.sequence)}`)
    const targetAt = result.sequence.indexOf(audioTargetKey)
    const numeric = result.sequence.slice(targetAt).map(value => value.split(':').map(Number))
    for (let index = 1; index < numeric.length; index += 1) {
      const [priorP, priorW] = numeric[index - 1]
      const [nextP, nextW] = numeric[index]
      assert(nextP > priorP || nextP === priorP && nextW > priorW, `audio follow must never move backward or duplicate after the split owner: ${JSON.stringify(result.sequence)}`)
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
  const before = await pageState(page)
  const next = await turn(page, 'ArrowRight')
  const resolved = await resolveSplitOwner(page, split, 'bible', 'kjv-en')
  split.targetKey = resolved.targetKey
  split.audioTargetKey = resolved.audioTargetKey
  const fullWord = resolved.fullWord
  const [paragraphIndex, wordIndex] = split.targetKey.split(':')
  const owner = page.locator(`[data-testid="lab-word"][data-paragraph-index="${paragraphIndex}"][data-word-index="${wordIndex}"]`)
  await owner.waitFor({ timeout: 10000 })
  const remainder = (await owner.first().textContent()).trim()
  assert.equal(`${split.fragment}${remainder}`, fullWord, 'visible fragments must reconstruct the source word')
  assert.equal(await owner.count(), 1, 'the logical word must be owned exactly once')
  const back = await turn(page, 'ArrowLeft')
  const invariants = await assertFragmentInvariants(page, split, fullWord)
  await page.screenshot({ path: `${output}/${live ? 'production' : 'candidate'}-${name}-split.png` })
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
  const audio = name === 'desktop'
    ? await exerciseAudioAcrossSplit(page, split)
    : { service: 'production audio API', actual: false, limit: 'shared audio-follow path exercised on desktop', sequence: [] }
  const afterAudio = await pageState(page)
  if (name === 'desktop' && !audio.actual) {
    assert.equal(afterAudio.chapter, reloaded.chapter, 'failed audio start must preserve the chapter')
    assert.equal(afterAudio.place, reloaded.place, 'failed audio start must preserve the exact reading position')
    assert.deepEqual(afterAudio.keys, reloaded.keys, 'failed audio start must preserve the visible page')
  }
  const splitAgain = await turn(page, 'ArrowLeft')
  const splitReturn = { name, split, before, next, forward, reloaded, afterAudio, audio, splitAgain }
  await fs.writeFile(`${output}/${live ? 'production' : 'candidate'}-${name}-split-return.json`, JSON.stringify(splitReturn, null, 2) + '\n')
  if (!splitAgain.fragments.some(fragment => fragment.text === split.fragment)) {
    await page.screenshot({ path: `${output}/${live ? 'production' : 'candidate'}-${name}-split-return-failure.png` })
    console.error('SPLIT_RETURN_FAILURE', JSON.stringify(splitReturn))
  }
  assert(splitAgain.fragments.some(fragment => fragment.text === split.fragment), 'audio proof must return to the same split page')
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
  await page.getByTestId('lab-super-row-editions').click()
  await page.getByTestId('lab-v2-main-edition').click()
  await page.locator('[data-edition="modern-da"]').click()
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-testid="lab-root"]')
    return root?.dataset.readerEdition === 'modern-da' && root.lang === 'da'
  }, null, { timeout: 45000 })
  await page.waitForFunction(() => [...performance.getEntriesByType('resource')].some(entry => /\/assets\/da-[^/]+\.js$/.test(new URL(entry.name).pathname)), null, { timeout: 30000 })
  const danish = await stablePageState(page)
  assert.equal(danish.place, before.place, 'EN to DA must preserve logical position')
  const danishKeys = danish.keys
  englishReleased = true
  releaseEnglish()
  const afterStaleEnglish = await stablePageState(page)
  assert.equal(afterStaleEnglish.edition, 'modern-da', 'late English patterns must not replace Danish')
  assert.equal(afterStaleEnglish.lang, 'da')
  assert.deepEqual(afterStaleEnglish.keys, danishKeys, 'late English completion must not repaginate the Danish edition')
  await page.screenshot({ path: `${output}/${live ? 'production' : 'candidate'}-${name}-danish.png` })
  await page.getByTestId('lab-v2-main-edition').click()
  await page.locator('[data-edition="original-en"]').click()
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
