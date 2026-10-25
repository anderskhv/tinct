// Final pre-Codex behavior acceptance for catalogue Margin and authorized paged/phone differences.
// All AI/API traffic is mocked; an isolated muted browser reads the exact local build.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { assertBareDesktopHeader, assertNaturalCardBody, assertNoRepeatedQuote, assertRailScrollsWithSource, sourceRailGeometry, settlePaint, enforceReaderBundle } from './lib/readerParityAssertions.mjs'
const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5175'
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = process.env.TINCT_PARITY_OUTPUT || '/tmp/tinct-reader-restored-parity'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] }))
const observations = []
let activePage
try {
  for (const layout of (process.env.TINCT_PARITY_LAYOUTS || 'margin,two-page,compare,phone').split(',')) {
    const phone = layout === 'phone'
    const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone, reducedMotion: 'reduce', serviceWorkers: 'block' })
    const page = await context.newPage(), errors = [], requests = []
    activePage = page
    let longAnswer = false, delayedRoute = null
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (await enforceReaderBundle(route, expectedBundle)) return
      if (url.pathname === '/api/lab-chat' || url.pathname === '/api/chat') {
        requests.push(route.request().postDataJSON())
        const request = requests.at(-1)
        if (JSON.stringify(request).includes('Delay first source response')) { delayedRoute = route; return }
        const intent = request?.companion?.intent
        const text = intent === 'quiz' ? JSON.stringify({ questions: [1, 2, 3].map(n => ({ q: `Local source question ${n}?`, answer: 'The selected source.', why: 'The source wording supports it.' })) })
          : intent === 'quiz_check' ? JSON.stringify({ verdict: 'nearly', feedback: 'Reconsider the source wording before moving on.' })
          : longAnswer ? Array.from({ length: 20 }, (_, index) => `Source point ${index + 1}: this is a complete local answer attached to the selected source. The narrator’s words remain available in the reading column while the discussion grows beside them.`).join('\n\n') : 'A complete local answer remains attached to this source passage.'
        return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n` })
      }
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
      return route.continue()
    })
    await page.addInitScript(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'book', primaryEdition: 'original-en', audioEdition: 'original-en', compareEdition: 'modern-en', compareOpen: true, compareChosen: true })))
    const ready = () => page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
    const wordSelector = '[data-testid="lab-word"]:visible'
    const select = async (host, from = 2, to = 11) => {
      const words = host.locator(wordSelector)
      await words.nth(to).waitFor()
      const onscreen = await words.evaluateAll(nodes => nodes.flatMap((node, index) => { const rect = node.getBoundingClientRect(); return rect.top >= 70 && rect.bottom <= window.innerHeight - 90 ? [index] : [] }))
      assert(onscreen.length > to, 'selection has enough source words inside the actual viewport')
      const a = await words.nth(onscreen[from]).boundingBox(), b = await words.nth(onscreen[to]).boundingBox()
      assert(a && b)
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); await page.mouse.up()
    }
    await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=3&word=4&sharedReader=1&layout=${phone ? 'phone' : 'desktop'}${phone ? '' : `&view=${layout}`}`, { waitUntil: 'domcontentloaded' })
    await ready(); await page.evaluate(() => document.fonts.ready); await settlePaint(page)
    const root = page.locator('.lab'), initialPlace = await root.getAttribute('data-place')
    if (!phone) await assertBareDesktopHeader(page)
    if (layout === 'margin') {
      const host = page.getByTestId('continuous-reader')
      await select(host)
      await page.getByTestId('lab-dbar-explain').click()
      const item = host.locator('[data-testid="source-margin-item"][data-open="true"]')
      await item.getByText('A complete local answer remains attached to this source passage.').waitFor()
      const firstId = await item.getAttribute('data-card-id')
      assert(firstId)
      await assertNoRepeatedQuote(item); await assertNaturalCardBody(item)
      const firstGeometry = await sourceRailGeometry(page, host)
      const textBoundary = await host.locator('.continuous-reader-window').first().boundingBox()
      const activeBox = await item.boundingBox()
      assert(textBoundary && activeBox && activeBox.x >= textBoundary.x + textBoundary.width + 10, 'rail starts beyond the reading column, not beside a selected word endpoint')
      assert.equal(await root.getAttribute('data-place'), initialPlace, 'opening a card preserves source coordinate')
      const follow = item.getByTestId('lab-phone-card-input')
      await follow.fill('A draft kept beside this source.')
      await follow.press('Escape')
      assert.equal(await follow.inputValue(), 'A draft kept beside this source.', 'Escape preserves the follow-up draft')
      assert.equal(await follow.evaluate(node => document.activeElement === node), false, 'first Escape releases typing focus')
      assert.equal(await item.getAttribute('data-open'), 'true', 'first Escape leaves the source card open')
      await page.keyboard.press('Escape')
      const escaped = host.locator(`[data-testid="source-margin-item"][data-card-id="${firstId}"]`)
      assert.equal(await escaped.getAttribute('data-open'), 'false', 'second Escape minimises the card')
      await escaped.getByTestId('source-margin-open').click()
      assert.equal(await follow.inputValue(), 'A draft kept beside this source.', 'reopening preserves the draft')
      longAnswer = true
      await follow.fill('Keep explaining beside this passage.')
      await item.getByTestId('lab-phone-card-send').click()
      await item.getByText(/Source point 20:/).waitFor()
      await assertNaturalCardBody(item)
      assert.equal(await root.getAttribute('data-place'), initialPlace, 'long follow-up does not move reading position')
      await host.evaluate(node => { node.scrollTop = 0; node.dispatchEvent(new Event('scroll', { bubbles: true })) })
      await settlePaint(page)
      const sourceScrollBeforeTail = await host.evaluate(node => node.scrollTop)
      const wheelRead = []
      const railBox = await item.boundingBox(), viewport = await host.boundingBox()
      assert(railBox && viewport)
      await page.mouse.move(railBox.x + railBox.width / 2, viewport.y + viewport.height / 2)
      let reachedTail = false
      for (let step = 0; step < 40; step++) {
        await page.mouse.wheel(0, Math.floor(viewport.height * .4))
        await settlePaint(page)
        const tail = await item.getByText(/Source point 20:/).boundingBox()
        const state = await item.evaluate(node => ({ visibility: getComputedStyle(node).visibility, open: node.dataset.open }))
        assert(state.visibility === 'visible' && state.open === 'true', 'answer remains open and visible throughout physical wheel reading')
        wheelRead.push({ scroll: await host.evaluate(node => node.scrollTop), tailTop: tail?.y, tailBottom: tail ? tail.y + tail.height : null })
        if (tail && tail.y >= viewport.y && tail.y + tail.height <= viewport.y + viewport.height) { reachedTail = true; break }
      }
      assert(reachedTail, `physical wheel steps reach the long answer tail without virtual-source disappearance: ${JSON.stringify(wheelRead)}`)
      await settlePaint(page)
      assert(await host.evaluate(node => node.scrollTop) > sourceScrollBeforeTail, 'long answer is reached by scrolling the actual source host')
      assert.equal(await item.evaluate(node => getComputedStyle(node).visibility), 'visible', 'offscreen source does not hide its still-reachable rail answer')
      await item.getByText(/Source point 20:/).waitFor({ state: 'visible' })
      await assertNaturalCardBody(item)
      await page.screenshot({ path: `${output}/margin-long-in-document.png` })
      await host.evaluate((node, top) => { node.scrollTop = top; node.dispatchEvent(new Event('scroll', { bubbles: true })) }, sourceScrollBeforeTail)
      await settlePaint(page)
      await item.getByTestId('source-margin-minimise').click()
      const first = host.locator(`[data-testid="source-margin-item"][data-card-id="${firstId}"]`)
      assert.equal(await first.getAttribute('data-open'), 'false', 'Minimise retains the source row')
      longAnswer = false
      await select(host, 18, 28)
      await page.getByTestId('lab-dbar-explain').click()
      await host.locator('[data-testid="source-margin-item"][data-open="true"]').getByText('A complete local answer remains attached to this source passage.').waitFor()
      assert.equal(await host.getByTestId('source-margin-item').count(), 2, 'separate answers retain two source cards')
      assert.equal(await first.getAttribute('data-open'), 'false')
      await first.getByTestId('source-margin-open').click()
      assert.equal(await first.getAttribute('data-open'), 'true', 'folded row reopens its original answer')
      assert.equal(await host.locator('[data-testid="source-margin-item"][data-open="true"]').count(), 1)
      await assertRailScrollsWithSource(page, host, first, host.locator('.is-card-passage').first())
      const finalGeometry = await sourceRailGeometry(page, host)
      await page.screenshot({ path: `${output}/margin-open-and-folded.png` })
      await first.getByTestId('source-margin-minimise').click()
      // Saved source spans explicitly expose their identity so this checks passage reopening, not Notebook recovery.
      await host.locator(`[data-source-card-id="${firstId}"]`).first().click()
      await page.screenshot({ path: `${output}/margin-source-tap.png` })
      await page.waitForFunction(id => document.querySelector(`[data-testid="source-margin-item"][data-card-id="${id}"]`)?.dataset.open === 'true', firstId, { timeout: 5000 })
      assert.equal(await first.getAttribute('data-open'), 'true', 'tapping saved source words reopens that card')
      const requestCountBeforeReload = requests.length
      await page.reload({ waitUntil: 'domcontentloaded' }); await ready()
      await host.getByTestId('source-margin-item').nth(1).waitFor()
      assert.equal(await host.getByTestId('source-margin-item').count(), 2, 'source rail restores saved cards after reload')
      assert.equal(requests.length, requestCountBeforeReload, 'reopening saved answers never generates them again')
      const activeAfterReload = host.locator('[data-testid="source-margin-item"][data-open="true"]')
      if (await activeAfterReload.count()) await activeAfterReload.getByTestId('source-margin-minimise').click()
      const room = await host.locator('.source-margin-room').boundingBox()
      assert(room)
      await page.mouse.click(room.x + Math.min(100, room.width / 2), 650)
      const freeNote = host.locator('[data-testid="source-margin-item"][data-open="true"]')
      await freeNote.getByRole('textbox', { name: 'Highlight note', exact: true }).fill('A free margin note beside this source.')
      const freeId = await freeNote.getAttribute('data-card-id')
      assert(freeId)
      await freeNote.getByTestId('source-margin-minimise').click()
      const foldedFree = host.locator(`[data-testid="source-margin-item"][data-card-id="${freeId}"]`)
      await foldedFree.getByTestId('source-margin-open').click()
      assert.equal(await foldedFree.getByRole('textbox', { name: 'Highlight note', exact: true }).inputValue(), 'A free margin note beside this source.', 'free margin note autosaves and reopens')
      await foldedFree.getByRole('button', { name: /^Delete / }).click()
      assert.equal(await foldedFree.count(), 0, 'delete removes the margin note row')
      await page.getByRole('button', { name: 'Undo', exact: true }).click()
      await foldedFree.waitFor()
      assert.equal(await host.getByTestId('source-margin-item').count(), 3, 'Undo restores the same free note beside both saved answers')
      await page.reload({ waitUntil: 'domcontentloaded' }); await ready()
      await foldedFree.getByTestId('source-margin-open').click()
      const restoredFreeEditor = foldedFree.getByRole('textbox', { name: 'Highlight note', exact: true })
      assert.equal(await restoredFreeEditor.inputValue(), 'A free margin note beside this source.', 'reloaded free note initializes its editor')
      await page.waitForTimeout(650)
      assert.equal(await restoredFreeEditor.inputValue(), 'A free margin note beside this source.', 'free note survives the autosave interval after reload')
      assert.equal(await page.evaluate(id => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').find(mark => `highlight:${mark.id}` === id)?.note, freeId), 'A free margin note beside this source.', 'persisted free note is not erased by reopening')
      // A late answer must stay with the Ask that requested it even if another card is opened.
      const createAsk = async (from, to, question) => {
        const open = host.locator('[data-testid="source-margin-item"][data-open="true"]')
        if (await open.count()) await open.getByTestId('source-margin-minimise').click()
        await select(host, from, to)
        await page.getByTestId('lab-dbar-ask').click()
        const active = host.locator('[data-testid="source-margin-item"][data-open="true"]')
        await active.getByTestId('lab-phone-card-input').fill(question)
        assert.equal(await page.getByTestId('lab-dbar-ask-field').count(), 0, 'shared Ask opens its source card directly')
        await active.getByTestId('lab-phone-card-send').click()
        await active.getByText('A complete local answer remains attached to this source passage.', { exact: true }).waitFor()
        const id = await active.getAttribute('data-card-id')
        assert(id)
        return host.locator(`[data-testid="source-margin-item"][data-card-id="${id}"]`)
      }
      const askOne = await createAsk(42, 51, 'First independent source question.')
      const askTwo = await createAsk(60, 69, 'Second independent source question.')
      await askTwo.getByTestId('source-margin-minimise').click()
      await askOne.getByTestId('source-margin-open').click()
      await askOne.getByTestId('lab-phone-card-input').fill('Delay first source response')
      await askOne.getByTestId('lab-phone-card-send').click()
      for (let tick = 0; tick < 100 && !delayedRoute; tick++) await page.waitForTimeout(20)
      assert(delayedRoute, 'first Ask follow-up request is actually pending')
      await askTwo.getByTestId('source-margin-open').click()
      assert.equal(await askTwo.getByText('Delay first source response', { exact: true }).count(), 0, 'pending question does not leak to another source card')
      const isolatedAnswer = 'This delayed answer belongs only to the first source.'
      await delayedRoute.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: isolatedAnswer } })}\n\ndata: {"type":"message_stop"}\n\n` })
      await page.waitForFunction(text => (localStorage.getItem('tinct:chat-history:frankenstein') || '').includes(text), isolatedAnswer)
      assert.equal(await askTwo.getByText(isolatedAnswer, { exact: true }).count(), 0, 'late answer never appears in the second open Ask')
      await askOne.getByTestId('source-margin-open').click()
      await askOne.getByText(isolatedAnswer, { exact: true }).waitFor()
      const isolatedRows = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]'))
      const firstAskId = await askOne.getAttribute('data-card-id'), secondAskId = await askTwo.getAttribute('data-card-id')
      assert(JSON.stringify(isolatedRows.find(row => row.id === firstAskId)).includes(isolatedAnswer), 'late answer persists under the requesting Ask identity')
      assert(!JSON.stringify(isolatedRows.find(row => row.id === secondAskId)).includes(isolatedAnswer), 'other Ask remains isolated in persistence')
      await page.screenshot({ path: `${output}/margin-cross-card-isolation.png` })
      observations.push({ layout, firstGeometry, finalGeometry, wheelRead })
      // Text start/end actions are always visible, unlike PDF heading-hover actions.
      await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await ready()
      await page.getByTestId('lab-unit-primer').waitFor()
      await page.getByTestId('lab-unit-catchup').waitFor()
      const minimap = page.getByRole('slider', { name: 'Book position', exact: true })
      await minimap.waitFor()
      assert(Number(await minimap.getAttribute('aria-valuenow')) < 100, 'whole-book map has later chapters beyond the current source')
      assert.equal(await minimap.locator('circle, [data-map-saved]').count(), 0, 'ordinary ebook map has no annotation dots')
      assert(await minimap.locator('[data-map-chapter]').count() > 0, 'ordinary ebook map retains whole-book chapter geometry')
      await minimap.focus(); await minimap.press('Home')
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.chapter === '1')
      await ready()
      assert.equal(await root.getAttribute('data-chapter'), '1', 'whole-book Home reaches the first chapter')
      await page.goto(`${origin}/reader?book=bible&edition=kjv-en&chapter=2&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await ready()
      const chapterMap = page.getByRole('slider', { name: 'Chapter position', exact: true })
      await chapterMap.waitFor()
      assert.equal(await root.getAttribute('data-book-id'), 'bible')
      assert.equal(await root.getAttribute('data-chapter'), '2')
      assert.equal(await page.getByRole('slider', { name: 'Book position', exact: true }).count(), 0)
      assert.equal(await chapterMap.locator('circle, [data-map-saved], [data-map-chapter]').count(), 0, 'Bible map contains only this chapter source lines and visible range')
      // data-place mirrors a ref and can lag when the whole short chapter already fits onscreen.
      // Check persisted semantic source and slider state rather than require a parent repaint.
      const biblePlace = () => page.evaluate(() => {
        const at = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.genesis
        return at ? `${at.chapterNumber}/${at.paragraphIndex}:${at.wordIndex}` : null
      })
      await chapterMap.focus(); await chapterMap.press('End')
      await page.waitForFunction(() => {
        const at = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.genesis
        return at?.chapterNumber === 2 && (at.paragraphIndex > 0 || at.wordIndex > 0)
      })
      const chapterEnd = await biblePlace()
      await chapterMap.press('ArrowDown'); await chapterMap.press('PageDown')
      assert.equal(await root.getAttribute('data-chapter'), '2', 'forward keys cannot leave the Bible chapter')
      assert.equal(await biblePlace(), chapterEnd, 'forward keys clamp at the final source word')
      const mapBox = await chapterMap.boundingBox()
      assert(mapBox)
      await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height - 1)
      await page.waitForFunction(end => {
        const at = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.genesis
        return at && `${at.chapterNumber}/${at.paragraphIndex}:${at.wordIndex}` === end
      }, chapterEnd)
      await chapterMap.focus(); await chapterMap.press('Home')
      await page.waitForFunction(() => {
        const at = JSON.parse(localStorage.getItem('tinct-lab-position') || '{}').books?.genesis
        return at?.chapterNumber === 2 && at.paragraphIndex === 0 && at.wordIndex === 0
      })
      assert.equal(await chapterMap.getAttribute('aria-valuenow'), '0', 'Home updates the accessible chapter position')
      await chapterMap.press('ArrowUp'); await chapterMap.press('PageUp')
      assert.equal(await root.getAttribute('data-chapter'), '2', 'backward keys cannot leave the Bible chapter')
      assert.equal(await biblePlace(), '2/0:0', 'backward keys clamp at the first source word')
      await page.screenshot({ path: `${output}/bible-chapter-minimap.png` })
      await page.goto(`${origin}/reader?book=frankenstein&edition=original-en&chapter=2&paragraph=0&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await ready()
      for (let step = 0; step < 24 && !(await host.getByTestId('lab-unit-quiz').count()); step++) {
        await host.evaluate(node => { node.scrollTop = node.scrollHeight; node.dispatchEvent(new Event('scroll', { bubbles: true })) })
        await page.waitForTimeout(80)
      }
      for (const name of ['Recap this chapter', 'Quiz me on this chapter', 'Chapter note']) await host.getByRole('button', { name, exact: true }).waitFor()
      await page.screenshot({ path: `${output}/ebook-end-actions.png` })
      await page.goto(`${origin}/reader?book=bold-conjectures-volume-2&edition=original-en&chapter=7&paragraph=8&word=0&view=margin&sharedReader=1&layout=desktop`, { waitUntil: 'domcontentloaded' }); await ready()
      const reference = host.locator('[data-testid="lab-word"][data-paragraph-index="8"]').filter({ hasText: /^Fig\.?$/ }).first()
      await reference.waitFor()
      const placeBeforePeek = await root.getAttribute('data-place')
      await reference.hover()
      await page.getByRole('tooltip').getByText(/Mach.Zehnder/).waitFor()
      await page.getByRole('tooltip').locator('img').waitFor()
      assert.equal(await root.getAttribute('data-place'), placeBeforePeek, 'figure-reference hover never changes source position')
      await page.screenshot({ path: `${output}/figure-reference-hover.png` })
      await page.mouse.move(3, 3)
      await page.getByRole('tooltip').waitFor({ state: 'hidden' })

    } else if (phone) {
      assert.equal(await page.getByTestId('lab-header-aa').count(), 0)
      await select(page.locator('.lab'))
      await page.getByTestId('lab-pbar-explain').click()
      await page.getByTestId('lab-phone-card-dock').waitFor()
      assert.equal(await page.getByTestId('source-margin-rail').count(), 0, 'phone retains its bottom card')
      assert.equal(await root.getAttribute('data-place'), initialPlace)
      await page.screenshot({ path: `${output}/phone-unchanged.png` })
      await page.keyboard.press('Escape')
      await select(page.locator('.lab'))
      await page.getByTestId('lab-pbar-more').click()
      await page.getByRole('menuitem', { name: 'Quiz me', exact: true }).click()
      await page.getByTestId('lab-phone-quiz-question').getByText('Local source question 1?').waitFor()
      for (let attempt = 0; attempt < 4; attempt++) {
        await page.getByTestId('lab-phone-card-input').fill(`Source answer attempt ${attempt + 1}`)
        await page.getByTestId('lab-phone-card-send').click()
        await page.getByText('Nearly.', { exact: true }).waitFor()
        await page.waitForFunction(() => { const next = document.querySelector('[data-testid="lab-phone-quiz-next"]'); return next && !next.disabled })
      }
      assert.equal(await page.getByTestId('lab-phone-card-input').count(), 0, 'three graded follow-ups exhaust the reply field')
      await page.getByTestId('lab-phone-quiz-next').waitFor()
      const checks = requests.filter(request => request?.companion?.intent === 'quiz_check')
      assert.equal(checks.length, 4, 'initial answer plus three follow-ups each submit once')
      const finalCheck = JSON.stringify(checks.at(-1))
      assert(finalCheck.includes('Source answer attempt 1') && finalCheck.includes('Source answer attempt 3'), 'grader receives the earlier answer and feedback turns')
      assert.equal(await root.getAttribute('data-place'), initialPlace, 'grading does not turn the reading page')
      await page.screenshot({ path: `${output}/phone-quiz-graded-followups.png` })
    } else {
      const passage = page.locator('.lab-passage').first(), firstWord = passage.locator(wordSelector).first()
      const before = await firstWord.boundingBox()
      await select(passage)
      await page.getByTestId('lab-dbar-explain').click()
      const card = page.locator('.lab-desktop-card[data-kind="explain"]')
      await card.getByText('A complete local answer remains attached to this source passage.').waitFor()
      const after = await firstWord.boundingBox()
      assert.deepEqual(after, before, `${layout} response does not reflow the reading leaves`)
      assert.equal(await page.getByTestId('source-margin-rail').count(), 0, `${layout} stays a floating response`)
      assert.equal(await root.getAttribute('data-place'), initialPlace)
      await assertNoRepeatedQuote(card)
      await page.screenshot({ path: `${output}/${layout}-no-reflow.png` })
    }
    assert.deepEqual(errors, [])
    await context.close()
  }
  await fs.writeFile(`${output}/observations.json`, JSON.stringify(observations, null, 2))
  console.log(`Reader source-contract acceptance passed for ${process.env.TINCT_PARITY_LAYOUTS || 'margin,two-page,compare,phone'}. ${output}`)
} catch (error) {
  if (activePage && !activePage.isClosed()) console.error('Source failure state', JSON.stringify(await activePage.evaluate(() => ({ place: document.querySelector('.lab')?.dataset.place, url: location.href }))))
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: `${output}/failure.png` }).catch(() => {})
  throw error
} finally { await browser.close() }
