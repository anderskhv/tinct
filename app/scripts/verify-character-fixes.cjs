// Read-only verification against the real Lab reader: real production
// reader code, real character assets, mocked /api/** only (no chat/account
// calls). No app code is modified by this script.
const { chromium } = require('playwright')
const fs = require('node:fs')
const assert = require('node:assert/strict')

const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5197'
const dir = process.env.ARTIFACT_DIR || '/tmp/tinct-verify-character-fixes'
fs.mkdirSync(dir, { recursive: true })

function normalized(text) {
  return text.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
}

// [book, edition, chapterNumber, characterId, expectedName, label]
const CASES = [
  // Bible: the exact homonym-conflation fixes from this session.
  ['bible', 'kjv-en', 931, 'herod-the-great', 'Herod', 'herod-the-great-not-antipas'],
  ['bible', 'kjv-en', 975, 'mary-mother-of-jesus', 'Mary', 'mary-mother-not-bethany'],
  ['bible', 'kjv-en', 983, 'mary-of-bethany', 'Mary', 'mary-bethany-not-mother'],
  ['bible', 'kjv-en', 1019, 'john-apostle', 'John', 'john-apostle-not-baptist'],
  ['bible', 'kjv-en', 932, 'john-the-baptist', 'John', 'john-baptist-not-apostle'],
  // Bible: a bulk TIPNR addition and the Zidkijah/Zedekiah cross-edition alias.
  ['bible', 'kjv-en', 774, 'zedekiah-son-of-maaseiah', 'Zedekiah', 'zedekiah-son-of-maaseiah'],
  // Republic: the gyges/ring-of-gyges split and a new mythological figure.
  ['the-republic', 'original-en', 2, 'gyges', 'Gyges', 'gyges-not-ring'],
  ['the-republic', 'original-en', 1, 'themistocles', 'Themistocles', 'themistocles-new'],
  // War and Peace: a major new addition.
  ['war-and-peace', 'original-en', 4, 'anna-mikhaylovna', undefined, 'anna-mikhaylovna-new'],
  // Don Quixote / Great Expectations: this session's screening fixes.
  ['don-quixote', 'original-en', undefined, 'anselmo', 'Anselmo', 'anselmo-new'],
  ['great-expectations', 'original-en', undefined, 'magwitch', undefined, 'provis-alias'],
  // 10-random-books batch: essays-montaigne, divine-comedy, ulysses fixes,
  // plus one sanity-check tap each on 3 books judged clean (no fix made).
  ['essays-montaigne', 'original-en', undefined, 'cicero', 'Cicero', 'cicero-new'],
  ['essays-montaigne', 'modern-en', undefined, 'the-body-and-experience', undefined, 'body-experience-modern-alias'],
  ['divine-comedy', 'original-en', undefined, 'saint-peter', undefined, 'saint-peter-new'],
  ['divine-comedy', 'modern-en', undefined, 'virgil', undefined, 'virgil-modern-alias'],
  ['ulysses', 'original-en', undefined, 'joe-hynes', undefined, 'joe-hynes-new'],
  ['ulysses', 'original-en', undefined, 'corny-kelleher', undefined, 'corny-kelleher-new'],
  ['frankenstein', 'original-en', undefined, 'henry-clerval', undefined, 'sanity-frankenstein'],
  ['midsummer', 'original-en', undefined, 'puck', undefined, 'sanity-midsummer'],
  ['oedipus-at-colonus', 'original-en', undefined, 'theseus', undefined, 'sanity-oedipus-colonus'],
  // round 3: crime-and-punishment patronymic-spelling fix + 6 more books
  ['crime-and-punishment', 'original-en', undefined, 'raskolnikov', undefined, 'raskolnikov-patronymic'],
  ['crime-and-punishment', 'original-en', undefined, 'luzhin', undefined, 'luzhin-patronymic'],
  ['anna-karenina', 'original-en', undefined, 'varenka', undefined, 'varenka-new'],
  ['iliad', 'original-en', undefined, 'meriones', undefined, 'meriones-new'],
  ['iliad', 'modern-en', undefined, 'odysseus', undefined, 'iliad-modern-alias-sanity'],
  ['the-histories', 'modern-en', undefined, 'amasis', undefined, 'amasis-new'],
  ['odyssey', 'original-en', undefined, 'aegisthus', undefined, 'aegisthus-new'],
  ['odyssey', 'original-en', undefined, 'mentor', undefined, 'mentor-new'],
  ['the-aeneid', 'original-en', undefined, 'mezentius', undefined, 'mezentius-new'],
  ['confessions', 'original-en', undefined, 'moses', undefined, 'confessions-moses-new'],
  ['brothers-karamazov', 'original-en', undefined, 'nikolay-parfenovitch', undefined, 'nikolay-parfenovitch-new'],
  ['brothers-karamazov', 'original-en', undefined, 'pyotr-ilyitch', undefined, 'pyotr-ilyitch-new'],
  // round 4: Shakespeare ALL-CAPS speaker-label occurrence-linking gap
  // (as-you-like-it, taming-of-the-shrew, the-tempest 96-100% unbound;
  // merry-wives-of-windsor 40% unbound on the short-form "PAGE" label).
  ['as-you-like-it', 'original-en', 1, 'rosalind', undefined, 'speaker-label-rosalind'],
  ['as-you-like-it', 'original-en', 1, 'orlando', undefined, 'speaker-label-orlando'],
  ['taming-of-the-shrew', 'original-en', 2, 'petruchio', undefined, 'speaker-label-petruchio'],
  ['taming-of-the-shrew', 'original-en', 1, 'katherina', undefined, 'speaker-label-katherina'],
  ['the-tempest', 'original-en', 2, 'prospero', undefined, 'speaker-label-prospero'],
  ['the-tempest', 'original-en', 2, 'ariel', undefined, 'speaker-label-ariel'],
  ['merry-wives-of-windsor', 'original-en', 1, 'page', 'Page', 'mww-short-form-page'],
  ['merry-wives-of-windsor', 'original-en', undefined, 'falstaff', undefined, 'mww-sanity-falstaff'],
  // round 3 continued: 5 more books screened, real gaps fixed
  ['jerusalem', 'original-en', undefined, 'brita', undefined, 'brita-new'],
  ['jerusalem', 'original-en', undefined, 'mother-stina', undefined, 'mother-stina-new'],
  ['fear-and-trembling', 'original-en', undefined, 'agnete', undefined, 'agnete-new'],
  ['niels-lyhne', 'original-en', undefined, 'frithjof', undefined, 'frithjof-new'],
  ['niels-lyhne', 'original-en', undefined, 'hjerrild', undefined, 'hjerrild-new'],
  ['genealogy-of-morals', 'original-en', undefined, 'schopenhauer', undefined, 'schopenhauer-new'],
  ['moby-dick', 'original-en', undefined, 'jonah', undefined, 'jonah-new'],
]

function findMention(book, edition, characterId, chapterHint) {
  const asset = JSON.parse(fs.readFileSync(`public/data/characters/${book}.v1.json`, 'utf8'))
  const ed = asset.editions[edition]
  const candidates = ed.mentions.filter(m => m.characterId === characterId && (chapterHint === undefined || m.chapterNumber === chapterHint))
  assert.ok(candidates.length, `no mention found for ${book}/${edition}/${characterId} (chapter hint ${chapterHint})`)
  const m = candidates[0]
  const character = ed.characters.find(c => c.id === characterId)
  assert.ok(character, `no character record for ${characterId}`)
  return { m, character, asset }
}

async function run(conf, engine) {
  const b = await engine.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
  const results = []
  try {
    for (const [book, edition, chapterHint, characterId, expectedNameSubstring, label] of CASES) {
      const { m, character } = findMention(book, edition, characterId, chapterHint)
      const source = JSON.parse(fs.readFileSync(`public/data/editions/${book}-${edition}.json`, 'utf8'))
      const chapter = source.chapters.find(c => c.number === m.chapterNumber)
      const text = normalized(chapter.paragraphs[m.paragraphIndex])
      const wordIndex = [...text.matchAll(/\S+/g)].findIndex(w => w.index < m.endOffset && w.index + w[0].length > m.startOffset)
      assert.ok(wordIndex >= 0, `${label}: could not locate word index`)

      const p = await b.newPage({ viewport: conf.width ? { width: conf.width, height: conf.height } : undefined, isMobile: conf.name === 'phone', hasTouch: conf.name === 'phone' })
      p.setDefaultTimeout(15000)
      const pageErrors = []
      p.on('pageerror', e => pageErrors.push(e.message))
      await p.route('**/api/**', r => r.fulfill({ status: 404, body: '{}' }))
      await p.addInitScript(({ book, edition, ch, paragraphIndex }) => {
        sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
          kind: 'open-reader', bookId: book, primaryEditionKey: edition,
          savedPlace: { bookId: book, chapterNumber: ch, paragraphIndex, page: 0 },
        }))
      }, { book, edition, ch: m.chapterNumber, paragraphIndex: m.paragraphIndex })

      await p.goto(origin + '/reader')
      await p.waitForFunction(() => document.querySelector('.lab')?.dataset.readerReady === 'true')
      await p.waitForTimeout(1000)

      // Multiple .lab-page-wrap containers can exist in the DOM at once
      // (adjacent pages pre-rendered for pagination); .first() plus a raw
      // coordinate check is not enough to confirm the match is the actual
      // visible, tappable instance -- confirm elementFromPoint at the
      // candidate's own center resolves back to this same element.
      const word = p.locator(`.lab-page-wrap [data-paragraph-index="${m.paragraphIndex}"][data-word-index="${wordIndex}"]`).first()
      const onPage = async () => {
        if (!(await word.count())) return false
        const box = await word.boundingBox()
        const vp = p.viewportSize()
        if (!box || box.x < 0 || box.y < 0 || box.x + box.width > vp.width || box.y + box.height > vp.height) return false
        return word.evaluate((el, { cx, cy }) => {
          const top = document.elementFromPoint(cx, cy)
          return !!top && (top === el || el.contains(top) || top.contains(el))
        }, { cx: box.x + box.width / 2, cy: box.y + box.height / 2 })
      }
      let paged = false
      for (let i = 0; i < 25 && !(await onPage()); i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(180); paged = true }
      const found = await onPage()
      if (!found) {
        await p.screenshot({ path: `${dir}/${conf.name}-${label}-notfound.png` })
        results.push({ label, status: 'WORD_NOT_FOUND_ON_ANY_PAGE', device: conf.name, book, characterId })
        await p.close(); continue
      }

      if (conf.name === 'desktop') await word.click()
      else {
        const box = await word.boundingBox()
        await word.dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 1, clientX: box.x + 3, clientY: box.y + 3 })
        await p.waitForTimeout(300)
        await word.dispatchEvent('pointerup', { pointerType: 'touch', pointerId: 1, clientX: box.x + 3, clientY: box.y + 3 })
      }

      let popupText = null, status = 'PASS'
      try {
        await p.locator('[data-popup-mode="character"]').waitFor({ timeout: 5000 })
        popupText = await p.locator('.popup-character h2').innerText().catch(() => null)
        const expected = expectedNameSubstring || character.snapshots[0].name
        if (!popupText || !popupText.includes(expected)) status = `WRONG_NAME (got "${popupText}", expected to include "${expected}")`
      } catch (e) {
        status = 'NO_CARD_OPENED'
      }
      if (pageErrors.length) status += ` + JS_ERRORS: ${pageErrors.join('; ')}`
      await p.screenshot({ path: `${dir}/${conf.name}-${label}.png` })
      results.push({ label, status, device: conf.name, book, characterId, expectedName: expectedNameSubstring || character.snapshots[0].name, gotName: popupText, paged })
      await p.close()
    }
  } finally {
    await b.close()
  }
  return results
}

;(async () => {
  const all = []
  all.push(...await run({ name: 'desktop', width: 1440, height: 950 }, chromium))
  all.push(...await run({ name: 'phone', width: 390, height: 844 }, chromium))
  fs.writeFileSync(`${dir}/results.json`, JSON.stringify(all, null, 2))
  const failures = all.filter(r => r.status !== 'PASS')
  console.log(JSON.stringify(all, null, 2))
  console.log(`\n${all.length - failures.length}/${all.length} passed.`)
  if (failures.length) { console.log('FAILURES:', JSON.stringify(failures, null, 2)); process.exitCode = 1 }
})().catch(e => { console.error(e); process.exitCode = 1 })
