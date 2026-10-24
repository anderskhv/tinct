// Built reader acceptance: passage notes reuse one source highlight in every desktop layout.
// Isolated, muted, API calls mocked, and no requests leave the supplied origin.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { markInternal } from './lib/internalTraffic.cjs'

const origin = process.env.TINCT_ORIGIN || 'http://127.0.0.1:3001'
const expectedBundle = process.env.TINCT_EXPECTED_BUNDLE || ''
const output = process.env.TINCT_NOTES_OUTPUT || '/tmp/tinct-shared-reader-notes'
await fs.mkdir(output, { recursive: true })
const browser = await markInternal(await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] }))
const results = []
try {
  for (const layout of ['margin', 'two-page', 'compare']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
    try {
      const page = await context.newPage(), errors = [], requests = []
      page.on('pageerror', error => errors.push(error.message))
      await page.route('**/*', async route => {
        const url = new URL(route.request().url())
        if (url.origin !== origin) return route.abort()
        if (url.pathname === '/api/lab-chat' || url.pathname === '/api/chat') {
          requests.push(route.request().postDataJSON())
          const text = 'A saved answer to the reader’s note and question.'
          return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\ndata: {"type":"message_stop"}\n\n` })
        }
        if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 404, json: {} })
        return route.continue()
      })
      await page.addInitScript(() => localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en', compareEdition: 'bsb-en', compareOpen: true, compareChosen: true, fontFamily: 'garamond', fontSize: 1, fontSizeExplicit: true, theme: 'book' })))
      const response = await page.goto(`${origin}/reader?book=bible&chapter=1&edition=kjv-en&sharedReader=1&layout=desktop&view=${layout}`, { waitUntil: 'domcontentloaded' })
      assert.equal(response.status(), 200)
      if (expectedBundle) assert((await response.text()).includes(expectedBundle), `must exercise built ${expectedBundle}`)
      await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true', null, { timeout: 45000 })
      await page.evaluate(() => document.fonts.ready)
      if (await page.getByTestId('lab-chapter-cover').isVisible().catch(() => false)) await page.keyboard.press('ArrowRight')
      const scope = layout === 'compare' ? '.lab-book-col-compare ' : layout === 'margin' ? '.continuous-reader ' : ''
      const words = page.locator(`${scope}[data-testid="lab-word"]:visible`)
      await words.nth(14).waitFor()
      const source = await words.nth(5).evaluate(word => ({ paragraphIndex: Number(word.dataset.paragraphIndex), fromWord: Number(word.dataset.wordIndex) }))
      const select = async () => {
        const first = await words.nth(5).boundingBox(), last = await words.nth(14).boundingBox()
        assert(first && last)
        await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
        await page.mouse.down()
        await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 12 })
        await page.mouse.up()
        await page.getByTestId('lab-dbar-note').waitFor()
      }
      await select()
      const before = await words.nth(5).boundingBox()
      await page.getByTestId('lab-dbar-note').click()
      const card = layout === 'margin' ? page.locator('[data-testid="source-margin-item"][data-open="true"]') : page.locator('.lab-desktop-card[data-kind="note"]')
      const dismiss = async () => {
        if (layout === 'margin') {
          const id = await card.getAttribute('data-card-id')
          await card.getByTestId('source-margin-minimise').click()
          assert.equal(await page.locator(`[data-testid="source-margin-item"][data-card-id="${id}"]`).getAttribute('data-open'), 'false', 'note folds without losing its source row')
        } else await card.getByRole('button', { name: 'Close card', exact: true }).click()
      }
      await card.waitFor()
      assert.equal(await page.locator('.selection-popup[data-popup-mode="note"], .lab-dnote').count(), 0, 'no legacy note editor')
      const after = await words.nth(5).boundingBox()
      assert.deepEqual(after, before, 'opening a note never reflows the source')
      await page.getByRole('textbox', { name: 'Highlight note' }).fill(`A ${layout} source note`)
      await page.screenshot({ path: `${output}/${layout}-note-created.png` })
      await dismiss()
      await page.waitForFunction(note => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').some(mark => mark.note === note), `A ${layout} source note`)
      const created = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]'))
      assert.equal(created.length, 1)
      assert.equal(created[0].bookId, 'bible')
      assert.equal(created[0].paragraphIndex, source.paragraphIndex)
      assert.equal(created[0].fromWord, source.fromWord)
      assert.equal(created[0].editionKey, layout === 'compare' ? 'bsb-en' : 'kjv-en')
      await select()
      await page.getByTestId('lab-dbar-note').click()
      await card.waitFor()
      assert.equal(await page.getByRole('textbox', { name: 'Highlight note' }).inputValue(), `A ${layout} source note`)
      await page.getByRole('textbox', { name: 'Highlight note' }).fill(`An edited ${layout} source note`)
      await dismiss()
      const edited = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]'))
      assert.equal(edited.length, 1)
      assert.equal(edited[0].id, created[0].id)
      assert.equal(edited[0].note, `An edited ${layout} source note`)
      if (layout === 'margin') {
        await page.reload({ waitUntil: 'domcontentloaded' })
        await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
        const persistedRow = page.locator(`[data-testid="source-margin-item"][data-card-id="highlight:${edited[0].id}"]`)
        await persistedRow.getByTestId('source-margin-open').click()
        const persistedEditor = persistedRow.getByRole('textbox', { name: 'Highlight note', exact: true })
        assert.equal(await persistedEditor.inputValue(), 'An edited margin source note', 'reloaded saved row initializes its note editor')
        await page.waitForTimeout(650)
        assert.equal(await persistedEditor.inputValue(), 'An edited margin source note', 'autosave never overwrites a reloaded note with an empty draft')
        assert.equal(await page.evaluate(id => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').find(mark => mark.id === id)?.note, edited[0].id), 'An edited margin source note')
        await persistedRow.getByTestId('source-margin-minimise').click()
        await select()
        await page.getByTestId('lab-dbar-note').click()
        await card.waitFor()
        await card.getByTestId('lab-phone-card-input').fill('Ask about this note')
        await card.getByTestId('lab-phone-card-send').click()
        await page.getByText('A saved answer to the reader’s note and question.', { exact: true }).waitFor()
        await page.waitForFunction(id => !JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]').find(mark => mark.id === id)?.note, edited[0].id)
        const remainingMarks = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]'))
        assert(remainingMarks.length <= 1 && (!remainingMarks.length || remainingMarks[0].id === edited[0].id), 'conversion preserves an existing colored highlight without duplication')
        const askCards = await page.evaluate(() => JSON.parse(localStorage.getItem('tinct:chat-history:bible') || '[]').filter(entry => entry.card?.kind === 'ask' && !entry.card.gone))
        assert.equal(askCards.length, 1, 'successful note-to-Ask keeps one answer identity')
        assert(JSON.stringify(askCards[0]).includes('An edited margin source note') && JSON.stringify(askCards[0]).includes('Ask about this note'), 'saved Ask preserves original note and question context')
        assert.equal(requests.length, 1)
        assert(JSON.stringify(requests[0]).includes('An edited margin source note'), 'request receives the note context')
        await page.reload({ waitUntil: 'domcontentloaded' })
        await page.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
        const saved = page.locator(`[data-testid="source-margin-item"][data-card-id="${askCards[0].id}"]`)
        await saved.waitFor()
        if (await saved.getAttribute('data-open') !== 'true') await saved.getByTestId('source-margin-open').click()
        await saved.getByText('A saved answer to the reader’s note and question.', { exact: true }).waitFor()
        assert.equal(requests.length, 1, 'reloaded Ask uses saved answer without generating again')
        await page.screenshot({ path: `${output}/margin-note-to-ask-restored.png` })
      }
      assert.deepEqual(errors, [])
      results.push({ layout, source: { bookId: edited[0].bookId, chapterNumber: edited[0].chapterNumber, editionKey: edited[0].editionKey, paragraphIndex: edited[0].paragraphIndex, fromWord: edited[0].fromWord, toWord: edited[0].toWord }, oneHighlight: true, noReflow: true, createReopenEditPersist: true })
    } finally { await context.close() }
  }
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ expectedBundle, results }, null, 2))
  console.log(JSON.stringify({ output, expectedBundle, results }, null, 2))
} finally { await browser.close() }
