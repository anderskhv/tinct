// Isolated, muted visual acceptance for the wider margin reader and quiet header.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'node:http'
import { enforceReaderBundle } from './lib/readerParityAssertions.mjs'
import { chromium } from '@playwright/test'
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
const output = process.env.TINCT_REFINEMENT_OUTPUT || '/tmp/tinct-margin-refinements'
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
    await page.goto(`${origin}/reader?book=frankenstein&chapter=2&paragraph=3&word=4&sharedReader=1&layout=desktop&view=margin`)
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
      await page.screenshot({ path: `${output}/book-1440-activity.png` })
      assert.equal(await page.locator('[data-testid="source-margin-item"][data-open="true"]').count(), 1, 'existing explanation is open before selecting the next source')
      await select()
      await page.keyboard.type('Why this passage?')
      const field = page.getByTestId('lab-dbar-ask-field')
      await field.waitFor()
      assert.equal(await field.inputValue(), 'Why this passage?', 'typing from selected source retains every character in the inline composer')
      await page.screenshot({ path: `${output}/inline-ask.png` })
      await field.press('Enter')
      const openAskCard = page.locator('[data-testid="source-margin-item"][data-open="true"]')
      await openAskCard.waitFor()
      const askCardId = await openAskCard.getAttribute('data-card-id')
      const askCard = page.locator(`[data-testid="source-margin-item"][data-card-id="${askCardId}"]`)
      const question = 'Why this passage?'
      await askCard.getByText('A local explanation of this selected passage.', { exact: true }).waitFor()
      const questionRows = () => page.getByTestId('source-margin-rail').getByText(question, { exact: true })
      assert.equal(await questionRows().count(), 1, 'one submitted question renders once after its answer')
      await page.keyboard.press('Escape')
      await askCard.getByTestId('source-margin-open').click()
      assert.equal(await questionRows().count(), 1, 'collapse and reopen never duplicate the question')
      await page.waitForFunction(question => (localStorage.getItem('tinct:chat-history:frankenstein') || '').includes(question), question)
      await page.reload()
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
      await askCard.waitFor({ state: 'attached' })
      const savedAskMarker = page.locator('.source-minimap-card[aria-label^="Ask"]')
      await savedAskMarker.focus({ timeout: 5000 }).catch(async error => { await page.screenshot({ path: `${output}/question-reload-debug.png` }); console.error(JSON.stringify(await page.evaluate(() => ({ map: document.querySelector('.source-minimap')?.outerHTML, cards: [...document.querySelectorAll('[data-testid="source-margin-item"]')].map(n => ({ id:n.dataset.cardId,open:n.dataset.open,text:n.textContent?.slice(0,180) })), history: localStorage.getItem('tinct:chat-history:frankenstein') })))); throw error })
      await page.keyboard.press('Enter')
      await askCard.waitFor()
      if (await askCard.getAttribute('data-open') !== 'true') await askCard.getByTestId('source-margin-open').click()
      await askCard.getByText('A local explanation of this selected passage.', { exact: true }).waitFor()
      assert.equal(await questionRows().count(), 1, 'reload and saved-card hydration render the question once')
      await page.screenshot({ path: `${output}/question-reload-before-follow.png` })
      await askCard.getByTestId('lab-phone-card-input').fill(question, { timeout: 5000 }).catch(async error => { await page.screenshot({ path: `${output}/question-reload-follow-debug.png` }); console.error('fill-failure', JSON.stringify(await askCard.evaluate(node => ({ open:node.dataset.open,html:node.outerHTML.slice(-2500),hostScroll:document.querySelector('[data-testid="continuous-reader"]').scrollTop })))); throw error })
      await askCard.getByTestId('lab-phone-card-input').press('Enter')
      await page.waitForFunction(question => [...document.querySelectorAll('[data-testid="source-margin-rail"] .lab-pcard-you')].filter(node => node.textContent?.trim() === question).length >= 2, question)
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
      const chat = page.locator('[data-testid="source-margin-item"][data-open="true"]')
      const chatField = chat.getByTestId('lab-phone-card-input')
      await chatField.waitFor()
      assert.equal(await chatField.evaluate(node => document.activeElement === node), true, 'menu Chat is ready to type')
      assert.equal(await chatField.inputValue(), 'Chat at current place', 'menu Chat accepts immediate typing without losing characters')
      const chatBox = await chat.boundingBox(), hostBox = await host.boundingBox()
      assert(chatBox && hostBox && chatBox.y >= hostBox.y && chatBox.y < hostBox.y + hostBox.height, 'menu Chat opens beside current reading viewport')
      assert.equal(await host.evaluate(node => node.scrollTop), beforeChat.top, 'menu Chat does not move reading position')
      assert.equal(await page.locator('.lab-hearing-word.is-selecting').count(), 0, 'menu Chat needs no selected passage')
      await page.screenshot({ path: `${output}/book-1440-menu-chat.png` })
      const chatId = await chat.getAttribute('data-card-id')
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
          return node.checkVisibility() && r.top > 80 && r.bottom < innerHeight - 100 && r.left >= 0 && r.right <= innerWidth
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
      await page.getByTestId('lab-dbar-more').click()
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
      const restoredChat = page.locator(`[data-testid="source-margin-item"][data-card-id="${chatId}"]`)
      await restoredChat.waitFor()
      if (await restoredChat.getAttribute('data-open') !== 'true') await restoredChat.getByTestId('source-margin-open').click()
      assert.equal(await restoredChat.getByTestId('lab-phone-card-input').inputValue(), 'Chat at current place', 'layout roundtrip retains the margin draft')
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
  await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ passed: results.length, output, results }))
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)) }
