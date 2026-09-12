// Chat history: what the reader sees when the panel opens on a months-old
// Bible thread, and when the account's history arrives after first paint.
//
// No model calls: every /api/** route and the whole stubbed Supabase origin
// are fulfilled locally. Run against a built `dist` served on BASE.
//
//   node scripts/check-chat-history-order.cjs http://127.0.0.1:4204 ../docs/verification/chat-history-order-2026-09-12
//
// The build under test must carry VITE_SUPABASE_URL=https://stub.supabase.test
// so the signed-in path runs against the stub instead of a real project.

const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const BASE = process.argv[2] || 'http://127.0.0.1:4204'
const OUT = process.argv[3] || '/tmp/tinct-chat-history-order'
const EXECUTABLE = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium'
const LABEL = process.env.SHOT_LABEL || 'after'
/** Milliseconds the stubbed account row takes to come back — a big Bible thread on a phone. */
const CLOUD_DELAY_MS = Number(process.env.CLOUD_DELAY_MS || 3500)

const PROVERBS_18 = 646
const MATTHEW_5 = 934
const JEREMIAH_50 = 795
const PSALMS_23 = 501
const GENESIS_1 = 1

const USER_ID = '3f1a6e64-2b1e-4a4f-9a7a-2c6f8b0d4e51'
const DAY = 24 * 60 * 60 * 1000

function message(id, role, content, timestamp, chapterNumber) {
  return { id, role, content, timestamp, bookId: 'bible', chapterNumber, paragraphIndex: 0 }
}

function conversation(id, chapterNumber, timestamp, exchange) {
  const messages = exchange.flatMap(([question, answer], i) => [
    message(`${id}-u${i}`, 'user', question, timestamp + i * 60_000, chapterNumber),
    ...(answer ? [message(`${id}-a${i}`, 'assistant', answer, timestamp + i * 60_000 + 20_000, chapterNumber)] : []),
  ])
  return {
    id,
    bookId: 'bible',
    chapterNumber,
    paragraphIndex: 0,
    startTimestamp: messages[0].timestamp,
    endTimestamp: messages[messages.length - 1].timestamp,
    preview: messages[0].content.slice(0, 77),
    messages,
  }
}

/** What this device has stored: months of Bible chats, none of them from today. */
function storedOnDevice(now) {
  const may = Date.parse('2026-05-25T10:04:00Z')
  return [
    conversation('conv-gen', GENESIS_1, now - 190 * DAY, [
      ['What does "without form, and void" mean?', 'It renders tohu wa-bohu — the earth as waste and empty before it is ordered.'],
    ]),
    conversation('conv-ps', PSALMS_23, now - 96 * DAY, [
      ['Why a shepherd and not a king here?', 'The psalm takes the smallest office in Israel and makes it the picture of God.'],
      ['Is the valley about death or about danger?', 'The Hebrew is "valley of deep shadow"; death is one reading of it, not the only one.'],
    ]),
    // The conversation Anders was shown on 12 September while reading Proverbs.
    conversation('conv-matt', MATTHEW_5, may, [
      ['Hvorfor taler Jesus om skilsmisse i vers 32?', 'Fordi Bjergprædikenen skærper loven i stedet for at lempe den. Moses tillod skilsmissebrevet; her føres spørgsmålet tilbage til ægteskabets hensigt.'],
      ['Og hvad med at sværge i vers 33?', 'Samme bevægelse. Eden var et redskab til at gøre nogle ord mere bindende end andre; Jesus lader al tale være bindende, så eden bliver overflødig.'],
    ]),
  ]
}

/** Pad a thread out to the per-book cap, to time a big Bible row against a small one. */
function padToCap(conversations, now) {
  const count = Number(process.env.CLOUD_MESSAGES || 0)
  if (!count) return conversations
  const filler = []
  const body = 'The chapter turns on a single word, and the older translations disagree about which sense of it is meant here. '.repeat(5)
  for (let i = 0; filler.reduce((sum, c) => sum + c.messages.length, 0) < count; i++) {
    filler.push(conversation(`conv-fill-${i}`, 200 + i, now - (330 - i) * DAY, [[`Filler question ${i} about this chapter?`, body]]))
  }
  return [...filler, ...conversations]
}

/** What the account has: everything above, plus today's turns in Jeremiah. */
function storedInCloud(now) {
  return padToCap([
    ...storedOnDevice(now),
    conversation('conv-jer', JEREMIAH_50, now - 30 * 60_000, [
      // Stored with no answer: the Bible search failure of 12 September.
      ['who was it that conquered the babylonnians?', null],
      ['and what happened to the city itself?', 'Cyrus took Babylon in 539 BC; the city was not sacked, and the exiles were sent home the next year.'],
    ]),
  ], now)
}

function authSession(now) {
  const claims = Buffer.from(JSON.stringify({ sub: USER_ID, role: 'authenticated', exp: Math.floor(now / 1000) + 3600 })).toString('base64url')
  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${claims}.stub`
  return {
    access_token: token,
    refresh_token: 'stub-refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(now / 1000) + 3600,
    user: {
      id: USER_ID,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'reader@example.test',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date(now - 300 * DAY).toISOString(),
    },
  }
}

async function stub(page, now, timings) {
  await page.route('**/api/**', route => route.fulfill({ status: 404, contentType: 'application/json', body: '{}' }))
  await page.route('https://stub.supabase.test/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/rest/v1/user_data') && url.includes('chat-history')) {
      await new Promise(resolve => setTimeout(resolve, CLOUD_DELAY_MS))
      timings.cloudResolvedAt = Date.now()
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Range': '0-0/1' },
        body: JSON.stringify({ key: 'chat-history:bible', value: storedInCloud(now), rev: 7 }),
      })
    }
    if (url.includes('/rest/v1/rpc/commit_user_data')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ applied: true, conflict: false, rev: 8, value: storedInCloud(now) }]) })
    }
    if (url.includes('/auth/v1/')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(authSession(now)) })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
}

async function openPanel(page, phone) {
  if (phone) {
    await page.getByTestId('lab-super').click()
    await page.getByTestId('lab-super-row-chat').click()
  } else {
    await page.getByTestId('lab-desktop-chat').click()
  }
  await page.getByTestId('lab-ask-thread').waitFor()
}

async function firstVisibleTurn(page) {
  return page.evaluate(() => {
    const thread = document.querySelector('[data-testid="lab-ask-thread"]')
    if (!thread) return null
    const box = thread.getBoundingClientRect()
    const rows = Array.from(thread.querySelectorAll('.lab-ask-turn'))
    const first = rows.find(row => row.getBoundingClientRect().bottom > box.top + 4)
    const last = rows[rows.length - 1]
    return {
      turns: rows.length,
      firstVisible: first ? first.textContent.trim().slice(0, 90) : null,
      lastInThread: last ? last.textContent.trim().slice(0, 90) : null,
      atBottom: thread.scrollHeight - thread.scrollTop - thread.clientHeight <= 80,
      syncing: !!document.querySelector('[data-testid="lab-ask-syncing"]'),
      dividers: Array.from(thread.querySelectorAll('[data-testid="lab-ask-location"]')).map(node => node.textContent.trim()),
      unanswered: thread.querySelectorAll('[data-testid="lab-ask-unanswered"]').length,
    }
  })
}

async function run(browser, { phone, viewport }) {
  const now = Date.now()
  const timings = {}
  const page = await browser.newPage({ viewport, isMobile: phone, hasTouch: phone, deviceScaleFactor: phone ? 2 : 1 })
  page.setDefaultTimeout(30_000)
  await stub(page, now, timings)
  await page.addInitScript(([device, session, chapter]) => {
    localStorage.setItem('tinct:chat-history:bible', JSON.stringify(device))
    localStorage.setItem('sb-stub-auth-token', JSON.stringify(session))
    localStorage.setItem('tinct:last-user-id', session.user.id)
    localStorage.setItem('lab-chat-history-legacy-cloud-migrated', JSON.stringify(session.user.id))
    sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
      kind: 'open-reader',
      bookId: 'bible',
      primaryEditionKey: 'kjv-en',
      compareEditionKey: 'web-en',
      savedPlace: { bookId: 'bible', chapterNumber: chapter, paragraphIndex: 0, page: 0 },
    }))
  }, [storedOnDevice(now), authSession(now), PROVERBS_18])

  await page.goto(`${BASE}/${phone ? 'lab/phone?chrome=v2' : 'lab/desktop'}`, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('lab-book').waitFor()
  await page.waitForTimeout(2000)

  const openedAt = Date.now()
  await openPanel(page, phone)
  await page.waitForTimeout(400)
  const onOpen = await firstVisibleTurn(page)
  const name = `${LABEL}-${phone ? 'phone-393x852' : 'desktop-1440x900'}`
  await page.screenshot({ path: path.join(OUT, `${name}-on-open.png`) })

  await page.getByText('Cyrus took Babylon in 539 BC', { exact: false }).waitFor()
  const newestOnScreenAt = Date.now()
  await page.waitForTimeout(600)
  const afterCloud = await firstVisibleTurn(page)
  await page.screenshot({ path: path.join(OUT, `${name}-after-cloud.png`) })
  await page.close()

  return {
    surface: phone ? 'phone 393x852' : 'desktop 1440x900',
    cloudBytes: JSON.stringify(storedInCloud(now)).length,
    cloudLatencyMs: timings.cloudResolvedAt ? timings.cloudResolvedAt - openedAt : null,
    /** Panel open → today's turn on screen. The stub's own delay is CLOUD_DELAY_MS of it. */
    staleWindowMs: newestOnScreenAt - openedAt,
    onOpen,
    afterCloud,
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ executablePath: EXECUTABLE })
  const results = []
  try {
    results.push(await run(browser, { phone: true, viewport: { width: 393, height: 852 } }))
    results.push(await run(browser, { phone: false, viewport: { width: 1440, height: 900 } }))
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(OUT, `${LABEL}-results.json`), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))

  if (LABEL !== 'before') {
    for (const result of results) {
      if (CLOUD_DELAY_MS > 0) assert.ok(result.onOpen.syncing, `${result.surface}: the panel must say the account history is still coming`)
      assert.ok(!result.afterCloud.syncing, `${result.surface}: the notice must clear once it lands`)
      assert.match(result.afterCloud.lastInThread, /Cyrus took Babylon/, `${result.surface}: the thread must end on today's turn`)
      assert.ok(result.afterCloud.atBottom, `${result.surface}: the reader must be looking at the newest turn`)
      assert.equal(result.afterCloud.unanswered, 1, `${result.surface}: the question that got no answer must be marked`)
      assert.ok(result.afterCloud.dividers.some(text => /Matthew 5 · /.test(text)), `${result.surface}: an old chapter divider must carry its date`)
    }
    console.log('OK — the panel ends on the most recent turn, and says so while it is still catching up.')
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
