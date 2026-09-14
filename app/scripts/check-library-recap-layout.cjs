// Real Library UI with fixture account/positions/recaps. No provider/network API calls.
// TEST_ORIGIN may target production; all APIs and non-origin requests are mocked or blocked.
const { chromium, webkit } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:4315'
const artifacts = process.env.ARTIFACT_DIR || '/tmp/tinct-library-recap-layout-evidence'
const engine = process.env.ENGINE || 'chromium'
const supabase = 'https://yazjyiqsxjystvpkyouk.supabase.co'
const user = { id: '11111111-1111-4111-8111-111111111111', email: 'fixture@example.invalid', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }
const exp = Math.floor(Date.now() / 1000) + 3600
const token = [{ alg: 'HS256', typ: 'JWT' }, { sub: user.id, exp, role: 'authenticated' }, 'fixture'].map(x => typeof x === 'string' ? x : Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')
const now = Date.now()
const pin = (bookId, days, extra = {}) => ({ bookId, headerBook: bookId, chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 2, wordIndex: 4, primaryEditionKey: 'original-en', deviceId: 'fixture', rev: 1, updatedAt: now - days * 86400000, ...extra })
const books = {
  'imitation-of-christ': pin('imitation-of-christ', 2),
  proverbs: pin('proverbs', 3, { headerBook: 'Proverbs', chapterNumber: 17, sequentialChapter: 645, primaryEditionKey: 'modern-da' }),
  'the-republic': pin('the-republic', 4),
}
const positions = { owner: user.id, books, finished: {}, hidden: {}, lastSettledBookId: 'imitation-of-christ', lastSettledAt: books['imitation-of-christ'].updatedAt, updatedAt: books['imitation-of-christ'].updatedAt, deviceId: 'fixture' }
const longSummary = 'Fixture recap for layout verification. A short reminder of the ideas you last read appears here, with more context available only when you choose Expand. '.repeat(6)
async function main() {
  fs.mkdirSync(artifacts, { recursive: true })
  const browser = await (engine === 'webkit' ? webkit : chromium).launch()
  const results = []
  try {
    for (const [name, width, height, scheme] of [['mobile-dark',390,844,'dark'],['mobile-light',390,844,'light'],['desktop-dark',1180,820,'dark'],['desktop-light',1440,900,'light']]) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 600, hasTouch: width < 600, colorScheme: scheme, reducedMotion: 'reduce' })
      let releaseLong, releaseShort
      const longGate = new Promise(resolve => { releaseLong = resolve })
      const shortGate = new Promise(resolve => { releaseShort = resolve })
      const calls = [], writes = []
      await page.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url())
        if (url.origin === supabase) return route.fulfill({ json: url.pathname.includes('/auth/') ? user : [] })
        if (url.pathname.startsWith('/api/')) {
          if (url.pathname === '/api/lab-position') {
            if (request.method() !== 'GET') writes.push(request.postDataJSON())
            return route.fulfill({ json: positions })
          }
          if (url.pathname === '/api/lab-recap') {
            const body = request.postDataJSON(); calls.push(body.bookId)
            await (body.bookId === 'imitation-of-christ' ? longGate : shortGate)
            return route.fulfill({ json: { summary: body.bookId === 'imitation-of-christ' ? longSummary : 'Fixture recap: a brief reminder.', coverage: { chapterNumber: body.chapterNumber, throughParagraph: body.paragraphIndex, paragraphCount: 20, complete: false, fromChapterNumber: null }, model: 'fixture', version: 'lab-recap-v1', cached: false } })
          }
          return route.fulfill({ status:404, json:{} })
        }
        if (url.origin !== new URL(origin).origin) return route.abort()
        return route.continue()
      })
      await page.addInitScript(({user,token,exp,positions,scheme}) => {
        localStorage.clear(); sessionStorage.clear()
        localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify({ access_token:token, refresh_token:'fixture',expires_at:exp,expires_in:3600,token_type:'bearer',user }))
        localStorage.setItem('tinct-lab-position',JSON.stringify(positions))
        // Library intentionally keeps its own navy palette under either OS color scheme.
      }, {user,token,exp,positions,scheme})
      try {
        await page.goto(origin + (origin.includes('127.0.0.1') ? '/lab/library' : '/library'))
        const section = page.locator('[data-reading-memory-recap]')
        await page.waitForFunction(() => document.querySelector('[data-reading-memory-recap]')?.dataset.book === 'imitation-of-christ')
        await page.evaluate(() => document.fonts.ready)
        await page.locator('[data-now-shelf] img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode().catch(()=>{}))))
        const geometry = async () => page.evaluate(() => {
          const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { top:r.top + scrollY, height:r.height, bottom:r.bottom + scrollY } }
          return {cta:rect('.lib-now-cta'),caption:rect('[data-now-caption]'),section:rect('[data-reading-memory-recap]'),shelf:rect('[data-now-shelf]')}
        })
        const baseline = await geometry()
        const stable = async phase => {
          const current = await geometry()
          for (const item of ['cta','caption','section','shelf']) for (const edge of ['top','height','bottom']) assert.ok(Math.abs(current[item][edge] - baseline[item][edge]) < 1, `${name} ${phase} ${item}.${edge}: ${baseline[item][edge]} -> ${current[item][edge]}`)
          return current
        }
        assert.match(await page.getByTestId('lab-recap-eyebrow').innerText(), /2 days ago/)
        assert.equal(await page.locator('[data-now-caption]').evaluate(el=>el.classList.contains('lib-boot-skel')), false)
        assert.equal(await page.getByTestId('lab-recap-eyebrow').evaluate(el => getComputedStyle(el).textTransform), 'none')
        assert.equal(await page.getByTestId('lab-recap-headline').evaluate(el=>getComputedStyle(el).fontSize), '16px')
        await page.locator('[data-recap-open="bible"]').click()
        await page.waitForFunction(() => document.querySelector('[data-reading-memory-recap]')?.dataset.book === 'bible')
        await stable('no recap')
        releaseLong()
        await page.waitForTimeout(150)
        assert.equal(await page.getByTestId('lab-recap-summary').getAttribute('hidden'), '')
        assert.equal(await page.locator('.lib-recap-summary-text').textContent(), '', 'Late prior-book response must not fill current book')
        await page.screenshot({path:path.join(artifacts,`${engine}-${name}-no-recap.png`),fullPage:true})
        await page.locator('[data-recap-open="imitation-of-christ"]').click()
        await page.waitForFunction(() => document.querySelector('.lib-recap-summary')?.classList.contains('is-shown'))
        await stable('cached long recap')
        const summary = page.getByTestId('lab-recap-summary')
        assert.equal(await summary.getAttribute('aria-expanded'),'false')
        assert.equal(await page.locator('.lib-recap-summary-more').innerText(),'Expand')
        await page.screenshot({path:path.join(artifacts,`${engine}-${name}-recap.png`),fullPage:true})
        await summary.click()
        assert.equal(await summary.getAttribute('aria-expanded'),'true')
        assert.ok((await geometry()).caption.height > baseline.caption.height)
        // Same-caption refresh must retain the Collapse affordance.
        await page.evaluate(() => window.dispatchEvent(new Event('focus')))
        await page.waitForTimeout(200)
        assert.equal(await summary.getAttribute('aria-expanded'),'true')
        assert.equal(await summary.isEnabled(),true)
        await summary.click()
        await stable('collapsed again')
        await summary.click()
        await page.locator('[data-recap-open="the-republic"]').click()
        await page.waitForFunction(() => document.querySelector('[data-reading-memory-recap]')?.dataset.book === 'the-republic')
        await stable('switched from expanded')
        await page.waitForTimeout(800)
        releaseShort()
        await page.waitForFunction(() => document.querySelector('.lib-recap-summary-text')?.textContent === 'Fixture recap: a brief reminder.')
        await stable('delayed short recap')
        assert.equal(await summary.isDisabled(),true)
        assert.equal(await page.locator('.lib-recap-summary-more').textContent(),'')
        assert.deepEqual(calls.sort(), ['imitation-of-christ','the-republic'])
        assert.equal(writes.length,0,'Selecting and expanding books cannot write reading positions')
        results.push({name,width,height,geometry:baseline,recapCalls:calls,positionWrites:writes.length,checks:['pending','no-recap','stale-response','long-cached','expand','refresh-open','collapse','switch-expanded','delayed-short']})
      } catch (error) {
        await page.screenshot({path:path.join(artifacts,`${engine}-${name}-failure.png`),fullPage:true})
        fs.writeFileSync(path.join(artifacts,'failure.json'),JSON.stringify({calls,error:String(error),html:await page.locator('[data-reading-memory-recap]').innerHTML()},null,2))
        throw error
      } finally { releaseLong();releaseShort();await page.close() }
    }
  } finally { await browser.close() }
  fs.writeFileSync(path.join(artifacts,`${engine}-results.json`),JSON.stringify(results,null,2))
  console.log(JSON.stringify(results))
}
main().catch(error=>{console.error(error);process.exitCode=1})
