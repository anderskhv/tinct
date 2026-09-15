const { webkit, chromium } = require('playwright')
const fs = require('fs')
const assert = require('assert')

;(async () => {
  const base = process.argv[2] || 'http://localhost:5197'
  const out = process.argv[3] || '/tmp/popup-local'
  fs.mkdirSync(out, { recursive: true })
  const results = []

  for (const [name, engine, width] of [['phone', webkit, 390], ['desktop', chromium, 1440]]) {
    const browser = await engine.launch()
    const page = await browser.newPage({ viewport: { width, height: name === 'phone' ? 844 : 950 }, hasTouch: name === 'phone', isMobile: name === 'phone' })
    await page.addInitScript(() => {
      localStorage.setItem('tinct-highlight-color', 'sky')
      localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'original-en', compareEdition: 'modern-en', compareOpen: true, theme: 'light' }))
      sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({ kind: 'open-reader', bookId: 'hamlet', primaryEditionKey: 'original-en', compareEditionKey: 'modern-en', savedPlace: { bookId: 'hamlet', chapterNumber: 3, paragraphIndex: 1, page: 0 } }))
    })
    await page.route('**/api/lab-chat', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: [{ text: 'The passage turns private doubt into a question about action.' }] }),
    }))
    await page.goto(base + (name === 'phone' ? '/lab/phone?chrome=v2' : '/reader'))
    await page.locator('.lab-hearing-word').first().waitFor()
    await page.waitForTimeout(1_200)

    const marks = () => page.evaluate(() => JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]'))
    const words = page.locator('[data-testid="lab-reading-stage"] .lab-hearing-word')
    const open = async locator => {
      await locator.scrollIntoViewIfNeeded()
      if (name === 'phone') {
        const box = await locator.boundingBox()
        await locator.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', clientX: box.x + box.width / 2, clientY: box.y + box.height / 2, bubbles: true })
        await page.waitForTimeout(450)
        await locator.dispatchEvent('pointerup', { pointerId: 7, pointerType: 'touch', clientX: box.x + box.width / 2, clientY: box.y + box.height / 2, bubbles: true })
      } else {
        await locator.click()
      }
      await page.locator('.selection-popup').waitFor()
    }

    await open(words.nth(1))
    assert.equal((await marks()).length, 0, 'selection alone must not save')
    await page.getByRole('button', { name: 'More actions', exact: true }).click()
    assert.deepEqual((await page.locator('.popup-menu-action').allTextContents()).map(text => text.replace('✧', '')), ['Explain', 'Highlight & note', 'Copy'])
    await page.getByRole('button', { name: 'Highlight & note', exact: true }).click()
    assert.equal((await marks()).length, 1, 'Highlight & note saves immediately')
    assert.equal((await marks())[0].color, 'sky', 'new highlight uses last colour')
    assert.notEqual(await page.locator('.popup-textarea').evaluate(node => node === document.activeElement), true, 'note must not autofocus')
    const id = (await marks())[0].id
    await page.getByRole('button', { name: 'Highlight Rose', exact: true }).click()
    assert.equal((await marks())[0].id, id, 'recolour keeps highlight identity')
    await page.locator('.popup-textarea').fill('A remembered passage')
    await page.getByRole('button', { name: 'Done', exact: true }).click()
    assert.equal((await marks())[0].note, 'A remembered passage')

    if (name === 'phone') {
      const marked = words.nth(1)
      const box = await marked.boundingBox()
      await marked.dispatchEvent('pointerdown', { pointerId: 8, pointerType: 'touch', clientX: box.x + box.width / 2, clientY: box.y + box.height / 2, bubbles: true })
      await marked.dispatchEvent('pointerup', { pointerId: 8, pointerType: 'touch', clientX: box.x + box.width / 2, clientY: box.y + box.height / 2, bubbles: true })
      await page.locator('.selection-popup').waitFor()
    } else {
      await open(words.nth(1))
    }
    assert.equal((await page.locator('.popup-menu-action').first().textContent()).trim(), 'Delete highlight')
    await page.getByRole('button', { name: 'Delete highlight', exact: true }).click()
    assert.equal((await marks()).length, 0)

    const selected = (await words.nth(5).textContent()).trim()
    await open(words.nth(5))
    await page.getByRole('button', { name: 'More actions', exact: true }).click()
    await page.getByRole('button', { name: 'Explain', exact: true }).click()
    await page.getByText('The passage turns private doubt into a question about action.').waitFor()
    assert.equal((await marks()).length, 0, 'explanation must not save a highlight')
    await page.screenshot({ path: `${out}/${name}-explain.png` })
    await page.getByRole('button', { name: /Ask a follow-up/ }).click()
    assert.equal(await page.locator('.selection-popup').count(), 0)
    assert.equal(await page.getByTestId('lab-ask-input').inputValue(), '')
    assert.equal((await page.getByTestId('lab-ask-attachment').innerText()).includes(selected), true)
    results.push({ name, passed: true })
    await browser.close()
  }

  fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2))
  console.log('PASS menu, direct saved-highlight delete, same-id recolour, note, explanation and unsent follow-up')
})().catch(error => { console.error(error); process.exit(1) })
