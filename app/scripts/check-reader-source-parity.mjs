// Final pre-Codex behavior acceptance for catalogue Margin and authorized paged/phone differences.
// All AI/API traffic is mocked; an isolated muted browser reads the exact local build.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium, webkit, devices } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
import { assertBareDesktopHeader, assertNaturalCardBody, assertNoRepeatedQuote, assertRailScrollsWithSource, sourceRailGeometry, settlePaint, enforceReaderBundle } from './lib/readerParityAssertions.mjs'
const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:5175'
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = process.env.TINCT_PARITY_OUTPUT || '/tmp/tinct-reader-restored-parity'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await (process.env.TINCT_PARITY_ENGINE === 'webkit' ? webkit : chromium).launch({ headless: true, ...(process.env.TINCT_PARITY_ENGINE === 'webkit' ? {} : {args: ['--mute-audio', '--autoplay-policy=user-gesture-required']}) }))
const observations = []
let activePage
let activeErrors = []
try {
  for (const layout of (process.env.TINCT_PARITY_LAYOUTS || 'margin,two-page,compare,phone').split(',')) {
    const phone = layout === 'phone'
    const context = await browser.newContext({ ...(phone ? devices['iPhone 13'] : {}), viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone, reducedMotion: 'reduce', serviceWorkers: 'block' })
    const page = await context.newPage(), errors = [], requests = []
    activePage = page
    activeErrors = errors
    let longAnswer = false, delayedRoute = null, failPhoneFollow = false
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.text().startsWith('PAINT_SHRINK')) console.log(message.text()) })
    await page.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (await enforceReaderBundle(route, expectedBundle)) return
      if (url.pathname === '/api/lab-chat' || url.pathname === '/api/chat') {
        requests.push(route.request().postDataJSON())
        const request = requests.at(-1)
        if (JSON.stringify(request).includes('Delay first source response')) { delayedRoute = route; return }
        if (failPhoneFollow && JSON.stringify(request).includes('Phone follow-up retry check')) return route.fulfill({status:400,json:{error:'Synthetic follow-up failure'}})
        const intent = request?.companion?.intent
        const text = intent === 'quiz' ? JSON.stringify({ questions: [1, 2, 3].map(n => ({ q: `Local source question ${n}?`, answer: 'The selected source.', why: 'The source wording supports it.' })) })
          : intent === 'quiz_check' ? JSON.stringify({ verdict: 'nearly', feedback: 'Reconsider the source wording before moving on.' })
          : intent === 'define' ? JSON.stringify({kind:'definition', definition:'A short local definition of this word in its passage.'})
          : longAnswer ? Array.from({ length: 20 }, (_, index) => `Source point ${index + 1}: this is a complete local answer attached to the selected source. The narrator’s words remain available in the reading column while the discussion grows beside them.`).join('\n\n') : 'A complete local answer remains attached to this source passage.'
        return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n` })
      }
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
      return route.continue()
    })
    if (phone) await page.addInitScript(() => {
      Object.defineProperty(navigator, 'standalone', { configurable: true, value: true })
      const originalMatchMedia = window.matchMedia.bind(window)
      window.matchMedia = query => {
        const result = originalMatchMedia(query)
        if (query === '(display-mode: standalone)') Object.defineProperty(result, 'matches', { value: true })
        return result
      }
    })
    await page.addInitScript(phone => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ ...(phone ? {fontSize:1.3,fontSizeExplicit:true} : {}), theme: 'book', primaryEdition: 'original-en', audioEdition: 'original-en', compareEdition: 'modern-en', compareOpen: true, compareChosen: true })), phone)
    const ready = () => page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
    const wordSelector = '[data-testid="lab-word"]:visible'
    const select = async (host, from = 2, to = 11) => {
      const words = host.locator(wordSelector)
      await words.nth(to).waitFor()
      const onscreen = await words.evaluateAll(nodes => nodes.flatMap((node, index) => {
        const rect = node.getBoundingClientRect()
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
        return rect.left >= 0 && rect.right <= window.innerWidth && rect.top >= 70
          && rect.bottom <= window.innerHeight - 90 && hit && (hit === node || node.contains(hit)) ? [index] : []
      }))
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
      longAnswer = true
      await select(host)
      await page.getByTestId('lab-dbar-explain').click()
      const item = host.locator('[data-testid="source-margin-item"][data-open="true"]')
      await item.getByText(/Source point 20:/).waitFor()
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
      // Filling an offscreen field scrolls it into view; that explicit fixture
      // interaction is separate from folding/reopening the discussion.
      await settlePaint(page)
      assert.equal(await item.evaluate(node => getComputedStyle(node).visibility), 'visible', 'scrolling to a long card input keeps its source window and card mounted')
      // Return the fold/reopen target to the viewport before testing that those
      // actions themselves do not navigate. Clicking an offscreen header is a
      // separate browser scroll, just like filling the offscreen input above.
      await item.getByTestId('source-margin-open').scrollIntoViewIfNeeded()
      await follow.evaluate(node => node.focus({ preventScroll: true }))
      await page.waitForTimeout(600)
      await settlePaint(page)
      const placeBeforeFold = await root.getAttribute('data-place')
      await page.keyboard.press('Escape')
      const escaped = host.locator(`[data-testid="source-margin-item"][data-card-id="${firstId}"]`)
      assert.equal(await escaped.getAttribute('data-open'), 'false', 'one Escape folds the card while typing')
      await escaped.getByTestId('source-margin-open').click()
      assert.equal(await follow.inputValue(), '', 'reopening discards the unsent draft')
      await item.getByText(/Source point 20:/).waitFor()
      await assertNaturalCardBody(item)
      assert.equal(await root.getAttribute('data-place'), placeBeforeFold, 'folding and reopening the long card does not move reading position')
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
      await follow.fill('Keep explaining beside this passage.')
      await page.waitForTimeout(600)
      await settlePaint(page)
      // WebKit fill can leave the long card's send button below the viewport.
      // Bring the actual click target into view before capturing the handoff anchor.
      await item.getByTestId('lab-phone-card-send').scrollIntoViewIfNeeded()
      await settlePaint(page)
      const placeBeforeChat = await root.getAttribute('data-place')
      await item.getByTestId('lab-phone-card-send').click()
      await item.getByText('Keep explaining beside this passage.', {exact:true}).waitFor()
      await item.getByText(/Source point 20:/).nth(1).waitFor()
      assert.equal(await page.getByTestId('lab-ask-pane').count(), 0, 'margin follow-up stays in its source card')
      assert.equal(await item.getByText('Keep explaining beside this passage.', {exact:true}).count(), 1, 'card follow-up appears exactly once')
      assert.equal(await root.getAttribute('data-place'), placeBeforeChat, 'margin follow-up preserves reading position')
      await page.waitForFunction(id => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]').some(row => row.id === id && row.messages.some(message => message.content === 'Keep explaining beside this passage.')), firstId)
      const first = host.locator(`[data-testid="source-margin-item"][data-card-id="${firstId}"]`)
      assert.equal(await first.getAttribute('data-open'), 'true', 'follow-up keeps the source card open')
      await first.getByTestId('source-margin-minimise').click()
      assert.equal(await first.getAttribute('data-open'), 'false', 'Minimise retains the source row')
      longAnswer = false
      await select(host, 18, 28)
      await page.getByTestId('lab-dbar-explain').click()
      await host.locator('[data-testid="source-margin-item"][data-open="true"]').getByText('A complete local answer remains attached to this source passage.').waitFor()
      assert.equal(await host.getByTestId('source-margin-item').count(), 2, 'separate answers retain two source cards')
      assert.equal(await first.getAttribute('data-open'), 'false')
      await first.getByTestId('source-margin-open').click()
      assert.equal(await first.getAttribute('data-open'), 'true', 'folded row reopens its original answer')
      const beforeContinue = await root.getAttribute('data-place'), beforeContinueRequests = requests.length
      assert.equal(await first.getByRole('button',{name:'Continue discussion',exact:true}).count(), 0, 'margin composer replaces the redundant Chat handoff link')
      await page.getByTestId('lab-super').click()
      await page.getByTestId('lab-super-row-chat').click()
      await page.getByTestId('lab-ask-pane').waitFor()
      assert.equal(requests.length,beforeContinueRequests,'explicit menu Chat opens without a generation request')
      assert.equal(await root.getAttribute('data-place'),beforeContinue,'explicit menu Chat leaves the source position unchanged')
      await page.getByTestId('lab-desktop-companion-close').click()
      await first.getByTestId('source-margin-open').click()
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
      const secondId = await host.getByTestId('source-margin-item').nth(1).getAttribute('data-card-id')
      const savedSecond = await page.evaluate(id => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]').find(row => row.id === id), secondId)
      assert(savedSecond?.card?.anchor, 'saved explanation retains its exact source anchor')
      const beforeNotebookCard = await root.getAttribute('data-place')
      await page.getByTestId('lab-header-notebook').click()
      await page.getByTestId(`contents-chat-${secondId}`).click()
      const savedCard = page.locator('.lab-desktop-card').filter({has:page.getByRole('button',{name:'Show passage',exact:true})})
      await savedCard.getByText('A complete local answer remains attached to this source passage.',{exact:true}).waitFor()
      assert.equal(await root.getAttribute('data-place'),beforeNotebookCard,'opening an undiscussed Notebook card preserves place')
      assert.equal(requests.length,requestCountBeforeReload,'Notebook reuses the saved answer')
      await savedCard.getByRole('button',{name:'Show passage',exact:true}).click()
      await page.waitForFunction(() => !!document.querySelector('.is-notebook-passage'))
      const flashed = await page.locator('.is-notebook-passage').evaluateAll(nodes => nodes.map(node => ({paragraph:Number(node.dataset.paragraphIndex),word:Number(node.dataset.wordIndex)})))
      const anchor = savedSecond.card.anchor
      assert(flashed.length > 0 && flashed.every(({paragraph,word}) => paragraph >= anchor.paragraphIndex && paragraph <= anchor.endParagraphIndex && (paragraph !== anchor.paragraphIndex || word >= anchor.fromWord) && (paragraph !== anchor.endParagraphIndex || word < anchor.toWord)), 'Show passage highlights only the saved source range')
      assert.equal(await root.getAttribute('data-place'),`${anchor.paragraphIndex}:${anchor.fromWord}`,'explicit Show passage lands at its exact source')
      await page.screenshot({path:`${output}/notebook-source-flash.png`})
      await page.locator('.is-notebook-passage').first().waitFor({state:'detached'})
      await page.getByTestId('lab-notebook-return').click()
      await page.waitForFunction(place => document.querySelector('[data-testid="lab-root"]')?.getAttribute('data-place') === place, beforeNotebookCard)
      assert.equal(await page.getByTestId('lab-notebook-return').count(), 0, 'return pill consumes the saved pre-notebook position')
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
      await page.getByTestId('lab-header-notebook').click()
      const notebook = page.getByRole('region', { name: 'Notebook', exact: true })
      const freeNoteRow = notebook.getByTestId(`contents-highlight-${freeId.replace(/^highlight:/, '')}`)
      await freeNoteRow.getByText('A free margin note beside this source.', { exact: true }).waitFor()
      assert.equal(await freeNoteRow.getByTestId('lab-wait').count(), 0, 'a point note has no quotation to load and never shows a source spinner')
      await page.screenshot({ path: `${output}/notebook-free-note.png` })
      await notebook.getByRole('button', { name: 'Close overlay', exact: true }).click()
      // Margin Ask stays beside its source and also retains its identity in chronological Chat.
      const closeChat = async () => {
        const close = page.getByTestId('lab-desktop-companion-close')
        if (await close.isVisible()) await close.click()
      }
      const openDiscussion = async id => {
        await closeChat()
        await page.getByTestId('lab-header-notebook').click()
        await page.getByTestId(`contents-chat-${id}`).click()
        await page.getByTestId('lab-ask-pane').waitFor()
      }
      const createAsk = async (from, to, question) => {
        await closeChat()
        const open = host.locator('[data-testid="source-margin-item"][data-open="true"]')
        if (await open.count()) await open.getByTestId('source-margin-minimise').click()
        await select(host, from, to)
        await page.getByTestId('lab-dbar-ask').click()
        await page.getByTestId('lab-dbar-ask-field').fill(question)
        const placeBeforeAsk = await root.getAttribute('data-place')
        await page.getByRole('button', {name:'Send question',exact:true}).click()
        await open.getByText('A complete local answer remains attached to this source passage.', { exact: true }).last().waitFor()
        assert.equal(await open.count(), 1, 'margin Ask keeps one source card open')
        assert.equal(await open.getByText(question, { exact: true }).count(), 1, 'margin question appears once')
        assert.equal(await page.getByTestId('lab-ask-pane').count(), 0, 'margin Ask does not open Chat')
        assert.equal(await root.getAttribute('data-place'), placeBeforeAsk, 'margin Ask preserves reading place')
        await page.waitForFunction(question => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]').some(row => row.messages.some(message => message.content === question)), question)
        return page.evaluate(question => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]').find(row => row.messages.some(message => message.content === question)).id, question)
      }
      const firstAskId = await createAsk(42, 51, 'First independent source question.')
      const secondAskId = await createAsk(60, 69, 'Second independent source question.')
      assert.notEqual(firstAskId, secondAskId)
      await openDiscussion(firstAskId)
      const beforeDiscussion = await root.getAttribute('data-place')
      await page.getByTestId('lab-ask-input').fill('Delay first source response')
      await page.getByTestId('lab-ask-send').click()
      for (let tick = 0; tick < 100 && !delayedRoute; tick++) await page.waitForTimeout(20)
      assert(delayedRoute, 'first Ask follow-up request is actually pending')
      await openDiscussion(secondAskId)
      const isolatedAnswer = 'This delayed answer belongs only to the first source.'
      await delayedRoute.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: isolatedAnswer } })}\n\ndata: {"type":"message_stop"}\n\n` })
      await page.waitForFunction(text => (localStorage.getItem('tinct:chat-history:frankenstein') || '').includes(text), isolatedAnswer)
      const isolatedRows = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]'))
      assert(JSON.stringify(isolatedRows.find(row => row.id === firstAskId)).includes(isolatedAnswer), 'late answer persists under the requesting Ask identity')
      assert(!JSON.stringify(isolatedRows.find(row => row.id === secondAskId)).includes(isolatedAnswer), 'other Ask remains isolated in persistence')
      assert.equal(await page.getByTestId('lab-ask-pane').getByText(isolatedAnswer, {exact:true}).count(), 1, 'chronological Chat shows the late answer once')
      assert.equal(await root.getAttribute('data-place'), beforeDiscussion, 'switching discussions never moves the book')
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
      // End first writes the requested final word; the source tracker then
      // commits the visible top word when the short chapter clamps its scroll.
      // Verify the physical end and settled source, not the transient requested endpoint.
      // Whole paragraphs can leave an earlier paragraph at the viewport top.
      await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
      await page.waitForTimeout(600)
      const physicalEnd = () => host.evaluate(node => ({scroll:node.scrollTop,height:node.scrollHeight,viewport:node.clientHeight,last:[...node.querySelectorAll('[data-testid="lab-word"]')].at(-1)?.getBoundingClientRect().toJSON()}))
      const endBeforeKeys = await physicalEnd()
      const chapterEnd = await biblePlace()
      await chapterMap.press('ArrowDown'); await chapterMap.press('PageDown')
      await settlePaint(page)
      assert.equal(await root.getAttribute('data-chapter'), '2', 'forward keys cannot leave the Bible chapter')
      await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
      await page.waitForTimeout(600)
      const endAfterKeys = await physicalEnd()
      observations.push({ layout: 'bible-chapter-end', chapterEnd, after: await biblePlace(), endBeforeKeys, endAfterKeys })
      assert.deepEqual(endAfterKeys,endBeforeKeys,'forward keys retain the physical chapter end and visible source ink')
      assert.equal(await biblePlace(), chapterEnd, 'forward keys preserve the settled chapter-end source coordinate')
      const mapBox = await chapterMap.boundingBox()
      assert(mapBox)
      await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height - 1)
      await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
      await page.waitForTimeout(600)
      assert.deepEqual(await physicalEnd(), endBeforeKeys, 'bottom map click retains the same physical end and visible source')
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
      await host.hover()
      for (let step = 0; step < 24 && !(await host.getByTestId('lab-unit-quiz').count()); step++) {
        await page.mouse.wheel(0, await host.evaluate(node => Math.floor(node.clientHeight * .8)))
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
      longAnswer = true
      assert.equal(await page.getByTestId('lab-header-aa').count(), 0)
      await select(page.locator('.lab'))
      await page.getByTestId('lab-pbar-explain').click()
      await page.getByTestId('lab-phone-card-dock').waitFor()
      assert.equal(await page.getByTestId('source-margin-rail').count(), 0, 'phone retains its bottom card')
      assert.equal(await root.getAttribute('data-place'), initialPlace)
      await page.screenshot({ path: `${output}/phone-unchanged.png` })
      await page.getByTestId('lab-phone-card-dock').getByText(/Source point 20:/).waitFor()
      longAnswer = false
      failPhoneFollow = true
      await page.getByTestId('lab-phone-card-input').fill('Phone follow-up retry check')
      await page.getByTestId('lab-phone-card-send').click()
      // A follow-up stays in its card until the card is closed (Anders, 29 Oct 2026); Chat does not open.
      const phoneCard = page.getByTestId('lab-phone-card-dock')
      await phoneCard.getByRole('button', {name:'Try again',exact:true}).waitFor()
      assert.equal(await page.getByTestId('lab-ask-pane').count(), 0, 'a phone follow-up does not hand over to Chat')
      assert.equal(await phoneCard.getByText('Phone follow-up retry check',{exact:true}).count(),1,'failed sent question stays once in the card')
      assert.equal(await page.getByTestId('lab-phone-card-input').inputValue(),'','the card composer is empty after sending')
      assert.equal(await root.getAttribute('data-place'),initialPlace,'a card follow-up leaves reading position unchanged')
      failPhoneFollow = false
      await phoneCard.getByRole('button',{name:'Try again',exact:true}).click()
      await phoneCard.getByRole('button',{name:'Try again',exact:true}).waitFor({state:'hidden'})
      assert.equal(await phoneCard.getByText('Phone follow-up retry check',{exact:true}).count(),1,'Retry reuses the sent question')
      assert.equal(await page.getByTestId('lab-phone-card-input').inputValue(),'','one empty composer remains after Retry')
      assert.equal(await root.getAttribute('data-place'),initialPlace)
      await page.screenshot({path:`${output}/phone-followup-retry.png`})
      await page.keyboard.press('Escape')
      await phoneCard.waitFor({ state: 'hidden' }).catch(async () => { await page.getByTestId('lab-phone-card-scrim').click({ position: { x: 20, y: 20 } }); await phoneCard.waitFor({ state: 'hidden' }) })
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
      // Reported iPhone sequence: Romans 1, Explain → follow-up → close → previous page.
      await page.goto(`${origin}/reader?book=bible&edition=web-en&chapter=1047&paragraph=0&word=0&layout=phone&sharedReader=1&qaLayoutTrace=1`, {waitUntil:'domcontentloaded'})
      await ready(); await settlePaint(page)
      await page.screenshot({path:`${output}/romans-before-chat.png`})
      const visibleSourceInk = () => page.locator('.lab-page-wrap [data-testid="lab-word"]').evaluateAll(nodes => nodes.filter(node => !node.closest('.lab-page-measure')).map(node => `${node.dataset.paragraphIndex}:${node.dataset.wordIndex}:${node.textContent}`).join('|'))
      const openingInkBeforeCard = await visibleSourceInk()
      await page.getByTestId('lab-page-next').evaluate(button => button.click())
      // Pagination may yield beyond two animation frames. Establish that the
      // requested next leaf has rendered before recording Define's reference
      // page; otherwise its delayed turn is attributed to opening the card.
      await page.waitForFunction(opening => {
        const ink = [...document.querySelectorAll('.lab-page-wrap [data-testid="lab-word"]')]
          .filter(node => !node.closest('.lab-page-measure'))
          .map(node => `${node.dataset.paragraphIndex}:${node.dataset.wordIndex}:${node.textContent}`).join('|')
        return ink.length > 0 && ink !== opening
      }, openingInkBeforeCard)
      await settlePaint(page)
      const inkBeforePhoneCard = await visibleSourceInk()
      // A directly closed Define has never entered Chat, so it does not have
      // Chat's preserved page-prefix guard. Exercise that separate writer path.
      const defineWords=page.locator('.lab-page-wrap [data-testid="lab-word"]')
      const defineIndex=await defineWords.evaluateAll(nodes=>nodes.findIndex(node=>{
        const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y)
        return !node.closest('.lab-page-measure')&&/^[a-z]{4,}$/i.test(node.textContent?.trim()||'')&&r.top>140&&r.bottom<500&&r.left>=0&&r.right<=innerWidth&&hit&&(hit===node||node.contains(hit))
      }))
      assert(defineIndex>=0,'an unobscured ordinary source word is available for direct Define')
      const defineWord=defineWords.nth(defineIndex),defineBox=await defineWord.boundingBox()
      const definePointer={pointerId:71,pointerType:'touch',isPrimary:true,bubbles:true,button:0,clientX:defineBox.x+defineBox.width/2,clientY:defineBox.y+defineBox.height/2}
      // A quick mouse click can turn the leaf in touch mode. Use the real
      // long-press word selection, as in the mobile card acceptance suite.
      await defineWord.dispatchEvent('pointerdown',definePointer)
      await page.waitForTimeout(350)
      await defineWord.dispatchEvent('pointerup',definePointer)
      await page.getByTestId('lab-phone-card-dock').getByText('A short local definition of this word in its passage.', {exact:true}).waitFor()
      assert.equal(await visibleSourceInk(),inkBeforePhoneCard,'opening Define does not turn the source page')
      await page.getByTestId('lab-phone-card-input').focus()
      await page.evaluate(() => {
        const viewport = window.visualViewport, originalHeight = viewport.height
        window.__restoreDefineViewport = () => { Object.defineProperty(viewport, 'height', {configurable:true, value:originalHeight}); viewport.dispatchEvent(new Event('resize')) }
        Object.defineProperty(viewport, 'height', {configurable:true, value:Math.max(300, originalHeight - 330)})
        viewport.dispatchEvent(new Event('resize'))
      })
      await settlePaint(page)
      await page.getByTestId('lab-phone-card-delete').click()
      await settlePaint(page)
      assert.equal(await visibleSourceInk(), inkBeforePhoneCard, 'closing Define preserves the full page while the keyboard is departing')
      await page.getByTestId('lab-page-prev').evaluate(button => button.click())
      await settlePaint(page)
      await page.screenshot({path:`${output}/romans-after-direct-define.png`})
      assert.equal(await visibleSourceInk(), openingInkBeforeCard, 'previous page keeps all prose after Define closes before keyboard resize finishes')
      await page.evaluate(() => window.__restoreDefineViewport())
      await settlePaint(page)
      await page.getByTestId('lab-page-next').evaluate(button => button.click())
      await settlePaint(page)
      await select(page.locator('.lab'))
      await page.getByTestId('lab-pbar-explain').click()
      await page.getByTestId('lab-phone-card-dock').getByText('A complete local answer remains attached to this source passage.').waitFor()
      await page.getByTestId('lab-phone-card-input').focus()
      // Headless browsers have no software keyboard. Drive its visual-viewport
      // resize while keeping the layout viewport fixed, as on an iPhone.
      await page.evaluate(() => {
        const viewport = window.visualViewport
        if (!viewport) throw new Error('Phone regression needs visualViewport')
        const originalHeight = viewport.height
        window.__restorePhoneViewport = () => { Object.defineProperty(viewport, 'height', {configurable:true, value:originalHeight}); viewport.dispatchEvent(new Event('resize')) }
        Object.defineProperty(viewport, 'height', {configurable:true, value:Math.max(300, originalHeight - 330)})
        viewport.dispatchEvent(new Event('resize'))
      })
      await settlePaint(page)
      await page.getByTestId('lab-phone-card-input').fill('What does promised mean?')
      await page.getByTestId('lab-phone-card-send').click()
      // The follow-up answers in its card (29 Oct 2026); Chat does not open.
      await page.getByTestId('lab-phone-card-dock').getByText('What does promised mean?', {exact:true}).waitFor()
      assert.equal(await page.getByTestId('lab-ask-pane').count(), 0, 'a card follow-up does not open Chat')
      // A Home Screen keyboard can remain reduced for frames after closing
      // the card. Closing must not repaginate against that temporary height.
      await page.getByTestId('lab-phone-card-input').blur()
      // Tapping the page above the card closes it, as on the phone.
      await page.mouse.click(195, 120)
      await page.getByTestId('lab-phone-card-dock').waitFor({ state: 'hidden' })
      await settlePaint(page)
      await page.evaluate(() => window.__restorePhoneViewport())
      await settlePaint(page)
      await page.screenshot({path:`${output}/romans-page-after-close-keyboard.png`})
      assert.equal(await visibleSourceInk(), inkBeforePhoneCard, 'closing the card after a follow-up, with a departing keyboard, preserves every source word on the current page')
      await page.getByTestId('lab-page-prev').evaluate(button => button.click())
      await settlePaint(page)
      await page.screenshot({path:`${output}/romans-back-after-chat.png`})
      const openingInk = await page.locator('.lab-page-wrap .lab-passage').evaluateAll(nodes => nodes.filter(node => !node.closest('.lab-page-measure')).map(node => node.textContent).join(' '))
      assert.ok(openingInk.includes('Paul') && openingInk.includes('servant'), `Romans opening retains prose after chat/back: ${openingInk.slice(0,500)}`)

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
  console.error('Source runtime errors', JSON.stringify(activeErrors))
  if (activePage && !activePage.isClosed()) console.error('Source failure state', JSON.stringify(await activePage.evaluate(() => ({ title: document.title, readyState: document.readyState, readerCount: document.querySelectorAll('.lab').length, wordCount: document.querySelectorAll('[data-testid=lab-word]').length, place: document.querySelector('.lab')?.dataset.place, url: location.href, view: document.querySelector('.lab')?.className, selection: getSelection()?.toString(), toolbars: [...document.querySelectorAll('[data-testid*=bar]')].map(node => ({testId: node.dataset.testid, rect: node.getBoundingClientRect().toJSON()})) }))))
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: `${output}/failure.png` }).catch(() => {})
  throw error
} finally { await browser.close() }
