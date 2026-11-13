// Isolated, muted visual acceptance for the wider margin reader and quiet header.
// The touch section (Surface Duo report, 6 Nov 2026) opens the Margin reader on
// touch screens with no mouse (Surface Duo spanned, phone landscape, iPad
// upright) and drives real finger drags (Chromium CDP touch events): a drag on
// the text scrolls the book and moves the saved place, a finger that rests
// before it moves still scrolls, a long press still selects, and a tap or drag
// in the blank margin makes no note while a still hold there starts one. With WebKit installed it also checks the
// iPad in WebKit (taps and the text's touch-action; Playwright has no WebKit
// touch drag). The mouse's blank-margin note is checked in the desktop loop.
// The desktop loop opens the one-chapter Margin reader with ?bookScroll=0 (whole-book scroll, on for every desktop
// reader since 13 Nov 2026, has its own check: check-book-scroll.mjs).
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { enforceReaderBundle, openFoldedCardInPlace } from './lib/readerParityAssertions.mjs'
import { chromium, webkit, devices } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'
const dist = path.resolve(process.env.TINCT_DIST || 'dist')
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = process.env.TINCT_ORIGIN || `http://127.0.0.1:${server.address().port}`
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = process.env.TINCT_REFINEMENT_OUTPUT || 'artifacts/margin-refinements'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio'] }))
const results = []
try {
  for (const width of [1440, 1920]) for (const theme of ['book', 'light', 'dark']) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) return route.abort()
      if (await enforceReaderBundle(route, expectedBundle)) return
      if (/\/api\/(?:lab-chat|chat)$/.test(url.pathname)) {
        const request = route.request().postDataJSON()
        const answer = request.companion?.intent === 'quiz'
          ? JSON.stringify({ ideas: ['one'], thesis: 'a local fixture', questions: [{ idea: 0, q: 'What does this source passage describe?', answer: 'A local source answer', why: '', cite: '' }] })
          : 'A local explanation of this selected passage.'
        return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: answer } })}\n\ndata: {"type":"message_stop"}\n\n` })
      }
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
      return route.continue()
    })
    await page.addInitScript(theme => {
      localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme, primaryEdition: 'original-en' }))
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => { throw Error('Microphone disabled during isolated acceptance') } })
    }, theme)
    await page.goto(`${origin}/reader?book=frankenstein&chapter=2&paragraph=3&word=4&sharedReader=1&layout=desktop&view=margin&bookScroll=0`)
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
    const host = page.getByTestId('continuous-reader')
    await host.waitFor()
    assert.equal(await page.locator('.lab-page-turn').count(), 0, 'desktop margin has no footer page-turn controls')
    await page.getByTestId('source-map-progress').waitFor()
    const readerViewport = await host.boundingBox()
    assert(readerViewport && readerViewport.y + readerViewport.height >= 978, 'margin reading area uses the space reclaimed from the footer')
    await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
    assert.equal(await host.locator('.continuous-reader-paper').count(), 1, 'bounded windows share one continuous paper surface')
    const paperPaint = await host.evaluate(node => ({
      shadow: getComputedStyle(node.querySelector('.continuous-reader-paper')).boxShadow,
      slices: [...node.querySelectorAll('.continuous-reader-window')].map(slice => getComputedStyle(slice).boxShadow),
    }))
    assert.notEqual(paperPaint.shadow, 'none', 'continuous paper retains its edge treatment')
    assert(paperPaint.slices.every(shadow => shadow === 'none'), 'source-window boundaries do not paint horizontal shadow seams')
    const geometry = await page.locator('.continuous-reader-window').first().evaluate(node => {
      const box = node.getBoundingClientRect(), css = getComputedStyle(node)
      return { left: box.left, right: box.right, width: box.width, measure: box.width - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight) }
    })
    assert(geometry.measure > 608, `reading measure exceeds previous 38rem: ${JSON.stringify(geometry)}`)
    assert(geometry.measure <= 840 && width - geometry.right >= 300, 'reading measure stays bounded with room for margin notes')
    const notebook = page.getByTestId('lab-header-notebook')
    const notebookBox = await notebook.boundingBox(), playBox = await page.locator('.lab-header .lab-v2-play').boundingBox()
    assert(notebookBox && playBox && notebookBox.x + notebookBox.width <= playBox.x + 1, 'Notebook sits immediately left of Play')
    assert.equal(await notebook.locator('svg').count(), 1, 'Notebook uses shared icon')
    assert.equal((await notebook.innerText()).trim(), '', 'Notebook has no visible text label')
    const readColors = () => page.locator('.lab-header-book').evaluate(node => ({ actual: getComputedStyle(node).color, ink: getComputedStyle(node.closest('.lab')).getPropertyValue('--lab-ink').trim() }))
    const idle = await readColors()
    await page.mouse.move(geometry.left + 160, 400)
    await page.mouse.wheel(0, 400)
    await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readingScroll === 'true')
    const scrolling = await readColors()
    assert.equal(scrolling.actual, idle.actual, 'header stays quietly muted while scrolling')
    await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color === color, idle.actual)
    assert.equal((await readColors()).actual, idle.actual, 'header stays muted when scrolling ends')
    await page.locator('.lab-header-book').hover()
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color !== color, idle.actual)
    const hovered = await readColors()
    assert.notEqual(hovered.actual, idle.actual, 'header gains ink on hover')
    await page.mouse.move(geometry.left + 160, 400)
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color === color, idle.actual)
    await notebook.focus()
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color !== color, idle.actual)
    assert.notEqual((await readColors()).actual, idle.actual, 'header gains ink for keyboard focus')
    await notebook.evaluate(node => node.blur())
    await page.waitForFunction(color => getComputedStyle(document.querySelector('.lab-header-book')).color === color, idle.actual)
    assert.equal(await page.locator('.source-minimap circle').count(), 0, 'no unexplained minimap dots')
    const opacity = await page.locator('.source-minimap-line').first().evaluate(node => +getComputedStyle(node).opacity)
    assert(opacity >= .5, 'minimap lines remain visible')
    if (width === 1440 && theme === 'book') {
      await host.evaluate(node => { node.scrollTop = 0; node.dispatchEvent(new Event('scroll')) })
      let selectionIndex = 0
      const select = async () => {
        await page.waitForFunction(() => !document.querySelector('.lab')?.dataset.readingScroll)
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const words = host.locator('[data-testid="lab-word"]:visible')
        const selectionPass = selectionIndex++
        const offset = selectionPass * 20 + 5
        const visible = await words.evaluateAll(nodes => {
          const host = document.querySelector('[data-testid="continuous-reader"]').getBoundingClientRect()
          const header = document.querySelector('.lab-header').getBoundingClientRect()
          return nodes.flatMap((node, index) => {
            const box = node.getBoundingClientRect()
            return box.top >= Math.max(host.top, header.bottom) + 8 && box.bottom <= host.bottom - 20 && box.left >= host.left && box.right <= host.right
              ? [{ index, paragraph: Number(node.dataset.paragraphIndex), word: Number(node.dataset.wordIndex), x: box.x, y: box.y, width: box.width, height: box.height }] : []
          })
        })
        // The Ask regression crosses paragraphs with a smaller ending word index.
        const first = selectionPass === 2 ? visible.find(word => word.paragraph === 2 && word.word === 41) : visible[offset]
        const last = selectionPass === 2 ? visible.find(word => word.paragraph === 3 && word.word === 8) : visible[offset + 9]
        assert(first && last, `settled viewport has enough selectable source words: ${visible.length}`)
        const targetHits = await page.evaluate(({ first, last }) => [first, last].map(box => {
          const node = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('[data-testid="lab-word"]')
          return Number(node?.getAttribute('data-paragraph-index')) === box.paragraph && Number(node?.getAttribute('data-word-index')) === box.word
        }), { first, last })
        assert(targetHits.every(Boolean), 'both real drag endpoints hit their source words')
        await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
        await page.mouse.down()
        await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 12 })
        await page.mouse.up()
        await page.getByTestId('lab-desk-bar').waitFor({ timeout: 5000 }).catch(async error => { await page.screenshot({ path: `${output}/selection-debug.png` }); console.error(JSON.stringify(await page.evaluate(() => ({ selection: window.getSelection()?.toString(), bars: [...document.querySelectorAll('[data-testid]')].map(n => n.getAttribute('data-testid')).filter(n => /bar|card|margin/.test(n)), words: [...document.querySelectorAll('.continuous-reader [data-testid="lab-word"]')].slice(0,16).map(n => { const r=n.getBoundingClientRect(); return [n.textContent,r.x,r.y] }) })))); throw error })
      }
      await select()
      await page.getByTestId('lab-dbar-highlight').click()
      await page.locator('.source-minimap-activity').first().waitFor()
      await page.keyboard.press('Escape')
      await select()
      await page.getByTestId('lab-dbar-explain').click()
      await page.getByText('A local explanation of this selected passage.', { exact: true }).waitFor()
      await page.locator('.source-minimap-card').first().waitFor()
      assert.equal((await page.locator('[data-testid="source-margin-item"][data-open="true"]').getByTestId('source-margin-open').innerText()).trim(), 'Explain', 'margin action label omits chapter provenance')
      const leaders = await page.locator('.source-margin-leaders path').evaluateAll(paths => {
        const host = document.querySelector('[data-testid="continuous-reader"]'), hostBox = host.getBoundingClientRect()
        const borders = [...document.querySelectorAll('.continuous-reader-window')].map(node => node.getBoundingClientRect().right - hostBox.left + host.scrollLeft)
        return paths.map(node => ({ path: node.getAttribute('d'), borders }))
      })
      assert(leaders.length > 0, 'explanation has a source connector')
      for (const leader of leaders) {
        const start = Number(leader.path.match(/^M\s*([\d.-]+)/)?.[1])
        assert(leader.borders.some(border => Math.abs(border - start) <= 1), `source connector begins at page border: ${JSON.stringify(leader)}`)
      }
      assert.equal(await page.locator('.source-margin-leaders circle').count(), 0, 'source connector has no dot inside reading text')
      // One place opens and minimises, and opening keeps the folded line's type and place (tester, 9 Nov 2026).
      const explainCard = page.locator(`[data-testid="source-margin-item"][data-card-id="${await page.locator('[data-testid="source-margin-item"][data-open="true"]').getAttribute('data-card-id')}"]`)
      await explainCard.getByTestId('source-margin-minimise').click()
      await page.screenshot({ path: `${output}/book-1440-explain-folded.png` })
      await openFoldedCardInPlace(page, explainCard)
      await page.screenshot({ path: `${output}/book-1440-activity.png` })
      assert.equal(await page.locator('[data-testid="source-margin-item"][data-open="true"]').count(), 1, 'existing explanation is open before selecting the next source')
      await select()
      await page.keyboard.type('Why this passage?')
      const field = page.getByTestId('lab-dbar-ask-field')
      await field.waitFor()
      assert.equal(await field.inputValue(), 'Why this passage?', 'typing from selected source retains every character in the inline composer')
      await page.screenshot({ path: `${output}/inline-ask.png` })
      const placeBeforeAsk = await page.locator('.lab').getAttribute('data-place')
      await field.press('Enter')
      const askChat = page.getByTestId('lab-ask-pane')
      const question = 'Why this passage?'
      const askRail = page.locator('[data-testid="source-margin-item"][data-open="true"]')
      await askRail.getByText('A local explanation of this selected passage.', { exact: true }).last().waitFor()
      const questionRows = () => askChat.getByText(question, { exact: true })
      assert.equal(await askRail.getByText(question, { exact: true }).count(), 1, 'one submitted question renders once beside its source')
      assert.equal(await askRail.count(), 1, 'Ask keeps one margin card open')
      assert.equal(await askChat.count(), 0, 'margin Ask does not open Chat')
      assert.equal(await page.locator('.lab').getAttribute('data-place'), placeBeforeAsk, 'margin Ask preserves reading place')
      const askCard = page.locator(`[data-testid="source-margin-item"][data-card-id="${await askRail.getAttribute('data-card-id')}"]`)
      await askCard.getByTestId('source-margin-minimise').click()
      await openFoldedCardInPlace(page, askCard)
      assert.equal(await page.locator('.lab').getAttribute('data-place'), placeBeforeAsk, 'folding and opening an Ask keeps the reading place')
      await page.waitForFunction(question => (localStorage.getItem('tinct:chat-history:frankenstein') || '').includes(question), question)
      const askId = await page.evaluate(question => JSON.parse(localStorage.getItem('tinct:chat-history:frankenstein') || '[]').find(row => row.messages.some(message => message.content === question))?.id, question)
      assert(askId, 'Ask persists a source discussion')
      await page.reload()
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
      const placeBeforeNotebook = await page.locator('.lab').getAttribute('data-place')
      await page.getByTestId('lab-header-notebook').click()
      await page.getByTestId(`contents-chat-${askId}`).click()
      await askChat.waitFor()
      assert.equal(await page.locator('.lab').getAttribute('data-place'), placeBeforeNotebook, 'Notebook discussion opens without moving the book')
      assert.equal(await questionRows().count(), 1, 'reload and saved discussion hydration render the question once')
      await page.screenshot({ path: `${output}/question-reload-before-follow.png` })
      await page.getByTestId('lab-ask-input').fill(question)
      await page.getByTestId('lab-ask-send').click()
      await page.waitForFunction(question => [...document.querySelectorAll('[data-testid="lab-ask-turn-user"]')].filter(node => node.querySelector('.tc-bubble')?.textContent?.trim() === question).length >= 2, question)
      assert.equal(await questionRows().count(), 2, 'deliberately sending the same question later remains a distinct turn')
      await page.screenshot({ path: `${output}/book-1440-question-roundtrip.png` })
      await page.keyboard.press('Escape')
      const map = page.getByRole('slider', { name: 'Book position', exact: true })
      for (const position of ['top', 'middle', 'end']) {
        const band = await map.evaluate(node => ({ start: Number(node.querySelector(':scope > .source-minimap-line')?.getAttribute('y1')), end: Number(node.querySelector('[data-map-chapter="3"] .source-minimap-line')?.getAttribute('y1')) }))
        assert(band.end > band.start, 'current chapter has a truthful map band')
        const y = position === 'top' ? band.start + .01 : position === 'end' ? band.end - .02 : (band.start + band.end) / 2
        const box = await map.boundingBox(); assert(box)
        await page.mouse.click(box.x + 1, box.y + box.height * y / 600)
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const sourceViewport = await host.boundingBox(); assert(sourceViewport)
        const blank = { x: sourceViewport.x + sourceViewport.width - 25, y: 400 }
        const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.className, blank)
        assert.equal(typeof hit, 'string', 'blank margin has a concrete surface')
        assert(hit.includes('source-margin-room'), `blank margin remains covered at ${position}: ${hit}`)
        await page.mouse.click(blank.x, blank.y)
        const note = page.getByRole('textbox', { name: 'Highlight note', exact: true })
        await note.waitFor()
        await note.fill(`A free margin note at ${position}`)
        await page.waitForFunction(text => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').some(mark => mark.note === text), `A free margin note at ${position}`)
        await page.keyboard.press('Escape')
        await page.mouse.move(blank.x, 550)
        await page.mouse.down()
        await page.mouse.move(blank.x - 15, 650, { steps: 8 })
        await page.mouse.up()
        assert.equal(await page.evaluate(() => window.getSelection()?.toString() || ''), '', `blank margin drag cannot select reading text at ${position}`)
        await page.keyboard.press('Escape')
      }
      await page.evaluate(() => window.getSelection()?.removeAllRanges())
      const beforeChat = await host.evaluate(node => ({ top: node.scrollTop, selected: node.querySelectorAll('.is-selecting').length }))
      await page.getByTestId('lab-super').click()
      await page.getByTestId('lab-super-row-talk').waitFor()
      await page.getByTestId('lab-super-row-chat').click()
      await page.keyboard.type('Chat at current place')
      const chat = page.getByTestId('lab-ask-pane')
      const chatField = page.getByTestId('lab-ask-input')
      await chatField.waitFor()
      assert.equal(await chatField.evaluate(node => document.activeElement === node), true, 'menu Chat is ready to type')
      assert.equal(await chatField.inputValue(), 'Chat at current place', 'menu Chat accepts immediate typing without losing characters')
      const chatBox = await chat.boundingBox(), hostBox = await host.boundingBox()
      assert(chatBox && hostBox && chatBox.y >= hostBox.y && chatBox.y < hostBox.y + hostBox.height, 'menu Chat opens beside current reading viewport')
      assert.equal(await host.evaluate(node => node.scrollTop), beforeChat.top, 'menu Chat does not move reading position')
      assert.equal(await page.locator('.lab-hearing-word.is-selecting').count(), 0, 'menu Chat needs no selected passage')
      await page.screenshot({ path: `${output}/book-1440-menu-chat.png` })
      await page.getByTestId('lab-desktop-companion-close').click()
      const placeBeforeLayout = await map.getAttribute('aria-valuenow')
      await page.getByTestId('lab-header-aa').click()
      await page.getByTestId('lab-v2-layout-two-page').click()
      await host.waitFor({ state: 'hidden' })
      assert.equal(await page.locator('.source-margin-rail').count(), 0, 'margin thread never overlays the two-page leaves')
      assert(await page.locator('.lab-page-turn').count() > 0, 'two-page reader retains page-turn controls')
      assert.equal(await page.locator('.lab-desktop-card[data-kind="ask"]').count(), 0, 'margin thread stays collapsed in the paged reader')
      const stablePagedWords = await page.waitForFunction(() => {
        const words = [...document.querySelectorAll('[data-testid="lab-word"]')].flatMap(node => {
          const r = node.getBoundingClientRect()
          const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
          return node.checkVisibility() && r.top > 80 && r.bottom < innerHeight - 100 && r.left >= 0 && r.right <= innerWidth
            && hit && (hit === node || node.contains(hit))
            ? [{ x:r.x,y:r.y,width:r.width,height:r.height }] : []
        })
        const signature = JSON.stringify(words)
        const prior = window.__refinementPagedGeometry
        const frames = prior?.signature === signature ? prior.frames + 1 : 0
        window.__refinementPagedGeometry = { signature, frames }
        return words.length >= 2 && frames >= 3 ? words : false
      }, null, { polling: 'raf' })
      const pagedWords = await stablePagedWords.jsonValue()
      const quizFirst = pagedWords[pagedWords.length >= 15 ? 5 : 0], quizLast = pagedWords[pagedWords.length >= 15 ? 14 : Math.min(9, pagedWords.length - 1)]
      if (!quizFirst || !quizLast) { await page.screenshot({ path: `${output}/paged-source-debug.png` }); console.error('paged-source', JSON.stringify(await page.evaluate(() => ({root:document.querySelector('.lab')?.dataset,panels:[...document.querySelectorAll('[role=dialog]')].map(n=>n.getAttribute('aria-label')), words:[...document.querySelectorAll('[data-testid="lab-word"]')].slice(0,20).map(n=>({text:n.textContent,rect:n.getBoundingClientRect().toJSON(),display:getComputedStyle(n).display,visibility:getComputedStyle(n).visibility,html:n.parentElement.outerHTML.slice(0,200)}))})))) }
      assert(quizFirst && quizLast, 'two-page reader exposes source words for quiz selection')
      await page.mouse.move(quizFirst.x + quizFirst.width / 2, quizFirst.y + quizFirst.height / 2)
      await page.mouse.down(); await page.mouse.move(quizLast.x + quizLast.width / 2, quizLast.y + quizLast.height / 2, { steps: 12 }); await page.mouse.up()
      await page.getByTestId('lab-dbar-more').click().catch(async error => {
        await page.screenshot({ path: `${output}/paged-selection-failure.png` })
        await fs.writeFile(`${output}/paged-selection-failure.json`, JSON.stringify(await page.evaluate(({ first, last }) => ({
          first, last, selected: window.getSelection()?.toString(), root: document.querySelector('.lab')?.dataset,
          hits: [first, last].map(point => document.elementFromPoint(point.x + point.width / 2, point.y + point.height / 2)?.outerHTML),
          popups: [...document.querySelectorAll('[role="dialog"], [data-testid="lab-dbar-more"]')].map(node => node.outerHTML),
        }), { first: quizFirst, last: quizLast }), null, 2))
        throw error
      })
      await page.getByRole('menuitem', { name: /Quiz me/ }).click()
      const quiz = page.locator('.lab-desktop-card[data-kind="quiz"]')
      await quiz.getByText('What does this source passage describe?', { exact: true }).waitFor()
      const dragOverlay = async overlay => {
        const before = await overlay.boundingBox(), handle = await overlay.locator('[data-reader-window-handle]').boundingBox()
        assert(before && handle)
        const dx = before.x + before.width + 100 < width ? 100 : -100
        const dy = before.y + before.height + 55 < 1000 ? 55 : -55
        await page.mouse.move(handle.x + 35, handle.y + handle.height / 2)
        await page.mouse.down(); await page.mouse.move(handle.x + 35 + dx, handle.y + handle.height / 2 + dy, { steps: 10 }); await page.mouse.up()
        const after = await overlay.boundingBox()
        assert(after && Math.abs(after.x - before.x) > 60 && Math.abs(after.y - before.y) > 25, `overlay moves with its header drag: ${JSON.stringify({before,after,dx,dy})}`)
      }
      await dragOverlay(quiz)
      await page.screenshot({ path: `${output}/book-1440-draggable-quiz.png` })
      await page.keyboard.press('Escape')
      await page.getByTestId('lab-header-aa').click()
      await page.getByTestId('lab-v2-layout-margin').click()
      await host.waitFor()
      await page.getByTestId('lab-super').click()
      await page.getByTestId('lab-super-row-chat').click()
      await chatField.waitFor()
      assert.equal(await chatField.inputValue(), '', 'leaving Chat discards the unsent draft across layout changes')
      assert(Math.abs(Number(await map.getAttribute('aria-valuenow')) - Number(placeBeforeLayout)) <= 1, 'layout roundtrip retains source position')
      await page.keyboard.press('Escape')
      let releaseVoiceTicket
      const voiceTicket = new Promise(resolve => { releaseVoiceTicket = resolve })
      const ticketTimeout = setTimeout(releaseVoiceTicket, 5000)
      await page.evaluate(() => Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: () => new Promise(() => {}) }))
      await page.route('**/api/*voice-session', async route => {
        await voiceTicket
        await route.fulfill({ status: 503, json: { error: 'Voice disabled in isolated acceptance' } }).catch(() => {})
      })
      try {
        await page.getByTestId('lab-super').click()
        await page.getByTestId('lab-super-row-talk').click()
        const talk = page.getByTestId('lab-voice-panel')
        await talk.waitFor()
        await dragOverlay(talk)
        await page.screenshot({ path: `${output}/book-1440-draggable-talk.png` })
        await page.getByRole('button', { name: /End (?:call|conversation)/ }).click()
      } finally { clearTimeout(ticketTimeout); releaseVoiceTicket() }
    }
    await page.screenshot({ path: `${output}/${theme}-${width}.png` })
    await notebook.click()
    await page.getByRole('region', { name: 'Notebook', exact: true }).waitFor()
    assert.deepEqual(errors, [])
    results.push({ width, theme, geometry, idle: idle.actual, scrolling: scrolling.actual, opacity })
    await context.close()
  }
  results.push(...await touchMargin())
  await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ passed: results.length, output, results }))
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)) }

async function touchMargin() {
  const duoUA = 'Mozilla/5.0 (Linux; Android 11.0; Surface Duo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  const touchDevices = [
    ['duo-spanned', chromium, { viewport: { width: 1114, height: 705 }, screen: { width: 1114, height: 705 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true, userAgent: duoUA }],
    ['pixel-7-landscape', chromium, devices['Pixel 7 landscape']],
    ['ipad-pro-11-portrait', chromium, devices['iPad Pro 11']],
    ['ipad-pro-11-portrait-webkit', webkit, devices['iPad Pro 11']],
    ['duo-single-phone', chromium, { viewport: { width: 540, height: 720 }, screen: { width: 540, height: 720 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true, userAgent: duoUA }],
  ]
  const out = []
  for (const [name, engine, { defaultBrowserType, ...device }] of touchDevices) {
    let touchBrowser
    try { touchBrowser = await markInternal(await engine.launch({ headless: true })) } catch (error) {
      if (engine === webkit) { console.log(`touch: ${name} skipped, WebKit is not installed`); continue }
      throw error
    }
    try {
      const context = await touchBrowser.newContext({ ...device, reducedMotion: 'reduce', serviceWorkers: 'block' })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.route('**/*', async route => {
        const url = new URL(route.request().url())
        if (url.origin !== origin) return route.abort()
        if (await enforceReaderBundle(route, expectedBundle)) return
        if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
        return route.continue()
      })
      await page.addInitScript(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ theme: 'light', primaryEdition: 'original-en' })))
      // No layout in the link: the device's own default decides (4 Nov 2026).
      await page.goto(`${origin}/reader?book=frankenstein&chapter=2&paragraph=3&word=4&sharedReader=1`)
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true'
        && document.querySelectorAll('[data-testid="lab-word"]').length > 40)
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(1200)
      if (name === 'duo-single-phone') {
        // The paginated phone page is unchanged: its words own the touch (swipes, long press).
        assert.equal(await page.getByTestId('continuous-reader').count(), 0, `${name}: a single Duo screen keeps the phone reader`)
        const action = await page.locator('.lab-passage [data-testid="lab-word"]').first().evaluate(node => getComputedStyle(node).touchAction)
        assert.equal(action, 'pinch-zoom', `${name}: phone page words still own the touch`)
        out.push({ touch: name, action })
        await context.close()
        continue
      }
      const host = page.getByTestId('continuous-reader')
      await host.waitFor()
      await page.screenshot({ path: `${output}/touch-${name}-open.png` })
      const textAction = await host.locator('[data-testid="lab-word"]').first().evaluate(node => getComputedStyle(node).touchAction)
      assert.equal(textAction, 'pan-y pinch-zoom', `${name}: Margin text lets a finger scroll`)
      const word = async () => host.locator('[data-testid="lab-word"]').evaluateAll(nodes => {
        const box = nodes.map(node => node.getBoundingClientRect()).filter(box => box.width > 18 && box.top > innerHeight * .4 && box.bottom < innerHeight * .6)
        const pick = box[Math.floor(box.length / 2)]
        return pick && { x: pick.x + pick.width / 2, y: pick.y + pick.height / 2 }
      })
      const room = await page.locator('.source-margin-room').boundingBox()
      assert(room, `${name}: the margin has its blank room`)
      const blank = { x: Math.min(device.viewport.width - 24, room.x + room.width * .6), y: Math.round(device.viewport.height * .55) }
      const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.className || '', blank)
      assert(String(hit).includes('source-margin-room'), `${name}: the probe lands in the blank margin (${hit})`)
      const notes = () => page.evaluate(() => ({ editors: document.querySelectorAll('textarea[aria-label="Highlight note"], .lab-pcard-note').length, saved: JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').length }))
      const selected = () => page.evaluate(() => document.querySelectorAll('[data-testid="continuous-reader"] .is-selecting').length + document.querySelectorAll('[data-testid^="lab-dbar-"]').length)
      await page.touchscreen.tap(blank.x, blank.y)
      await page.waitForTimeout(600)
      assert.deepEqual(await notes(), { editors: 0, saved: 0 }, `${name}: a finger tap in the blank margin makes no note`)
      if (engine === webkit) {
        await page.screenshot({ path: `${output}/touch-${name}-margin-tap.png` })
        out.push({ touch: name, textAction, marginTap: 'no note' })
        assert.deepEqual(errors, [])
        await context.close()
        continue
      }
      const cdp = await context.newCDPSession(page)
      const finger = async (from, to, { holdMs = 0, steps = 12 } = {}) => {
        const at = (x, y) => [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }]
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(from.x, from.y) })
        if (holdMs) await page.waitForTimeout(holdMs)
        for (let i = 1; i <= steps; i++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps) })
          await page.waitForTimeout(16)
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
        await page.waitForTimeout(700)
      }
      const top = () => host.evaluate(node => node.scrollTop)
      const d = Math.round(Math.min(130, device.viewport.height * .25))
      const place0 = await page.locator('.lab').getAttribute('data-place')
      const start = await word(); assert(start, `${name}: a word to touch`)
      const top0 = await top()
      await finger({ x: start.x, y: start.y + d }, { x: start.x + 6, y: start.y - d })
      const top1 = await top()
      assert(top1 - top0 > d, `${name}: a finger drag on the text scrolls the book (${top0} -> ${top1})`)
      assert.equal(await selected(), 0, `${name}: scrolling the text selects nothing`)
      await page.waitForFunction(place => document.querySelector('.lab')?.dataset.place !== place, place0)
      // A finger that settles on a word before it moves is still scrolling (the page's 160 ms press would select here).
      const rest = await word()
      await finger({ x: rest.x, y: rest.y + d }, { x: rest.x, y: rest.y - d }, { holdMs: 250 })
      const top2 = await top()
      assert(top2 - top1 > d, `${name}: a drag after a short rest still scrolls (${top1} -> ${top2})`)
      assert.equal(await selected(), 0, `${name}: a short rest before the drag selects nothing`)
      await finger({ x: rest.x, y: rest.y - d }, { x: rest.x - 4, y: rest.y + d }, { steps: 6 })
      assert(await top() < top2 - d, `${name}: a drag down scrolls back`)
      await page.screenshot({ path: `${output}/touch-${name}-scrolled.png` })
      const top3 = await top()
      await finger({ x: blank.x, y: blank.y + d }, { x: blank.x, y: blank.y - d })
      assert(await top() - top3 > d, `${name}: a finger drag in the margin scrolls too`)
      assert.deepEqual(await notes(), { editors: 0, saved: 0 }, `${name}: a drag in the margin makes no note`)
      // Press a word with more words to its right on the same line, so the
      // 70px slide reaches them. A long press on a line's last word that slides
      // into the margin stays one word, and one word opens Define by design.
      const press = await host.locator('[data-testid="lab-word"]').evaluateAll(nodes => {
        const boxes = nodes.map(node => node.getBoundingClientRect()).filter(box => box.width > 18 && box.top > innerHeight * .3 && box.bottom < innerHeight * .7)
        // A word with another word at least 90px further along its own visual line.
        const pick = boxes.find(box => boxes.some(other => Math.abs(other.top - box.top) < 4 && other.left - (box.x + box.width / 2) >= 90))
        return pick && { x: pick.x + pick.width / 2, y: pick.y + pick.height / 2 }
      })
      assert(press, `${name}: a full line to long-press`)
      await finger(press, { x: press.x + 70, y: press.y }, { holdMs: 700, steps: 8 })
      await page.getByTestId('lab-dbar-highlight').waitFor({ timeout: 5000 })
      await page.screenshot({ path: `${output}/touch-${name}-long-press.png` })
      // A finger held still in the blank margin starts a note (Anders, 6 Nov 2026).
      await page.keyboard.press('Escape')
      await page.getByTestId('lab-dbar-highlight').waitFor({ state: 'hidden', timeout: 5000 })
      const held = { x: blank.x, y: Math.round(device.viewport.height * .45) }
      assert(String(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.className || '', held)).includes('source-margin-room'), `${name}: the hold lands in the blank margin`)
      await finger(held, held, { holdMs: 800, steps: 1 })
      await page.waitForFunction(() => document.querySelectorAll('textarea[aria-label="Highlight note"], .lab-pcard-note').length > 0, null, { timeout: 5000 })
      // Still open after the finger has lifted (its tap once folded the new card).
      await page.waitForTimeout(800)
      assert((await notes()).editors > 0, `${name}: the held note stays open after the finger lifts`)
      await page.screenshot({ path: `${output}/touch-${name}-margin-hold-note.png` })
      out.push({ touch: name, textAction, scrolled: [top0, top1, top2], marginTap: 'no note', longPress: 'selection bar', marginHold: 'note' })
      assert.deepEqual(errors, [])
      await context.close()
    } finally { await touchBrowser.close() }
  }
  return out
}
