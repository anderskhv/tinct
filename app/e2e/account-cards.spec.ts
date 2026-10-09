import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The account cards (docs/social/CARDS-BRIEF.md, approved 9 October 2026) in
 * the browser, against mocked Worker routes: every card opens over the reader
 * and over the library without a page load, back goes back one, the cross
 * closes all, and the book's page is unchanged after closing.
 *
 * Run: start `vite` with VITE_SUPABASE_URL=http://127.0.0.1:5287/sb
 * VITE_SUPABASE_ANON_KEY=anon-test VITE_AUDIO_BASE_URL=http://127.0.0.1:5287
 * on port 5287, then
 * PW_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test -c e2e/playwright.account-cards.config.ts
 * ARTIFACT_DIR=<dir> saves a screenshot of every card, in both themes.
 */
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || ''
const USER = '11111111-1111-4111-8111-111111111111'
const ASSETS = '/lab/library_2/assets'

function day(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** About twelve weeks of reading, heavier lately. */
function ledgerRows() {
  const rows: Array<{ day: string; bookId: string; read: number; listen: number }> = []
  for (let offset = -82; offset <= 0; offset += 1) {
    if (offset > -6 || (offset * 7) % 3 !== 0) {
      const minutes = 12 + ((offset * 37) % 30 + 30) % 30 + (offset > -21 ? 22 : 0)
      const bookId = offset > -20 ? 'frankenstein' : offset > -32 ? 'the-prince' : offset > -50 ? 'meditations' : offset > -68 ? 'notes-from-underground' : 'jekyll-and-hyde'
      rows.push({ day: day(offset), bookId, read: minutes * 60, listen: offset % 4 === 0 ? 600 : 0 })
    }
  }
  return rows
}

const place = (bookId: string, chapter: number, updatedAt: number) => ({ bookId, headerBook: bookId, chapterNumber: chapter, sequentialChapter: chapter, paragraphIndex: 0, wordIndex: 0, pageIndex: 0, primaryEditionKey: 'modern-en', updatedAt, deviceId: 'cloud', rev: 1 })
const range = (n: number) => Array.from({ length: n }, (_, index) => index + 1)

function positionRecord() {
  const now = Date.now()
  return {
    books: { frankenstein: place('frankenstein', 14, now - 3_600_000), 'the-prince': place('the-prince', 9, now - 20 * 86_400_000) },
    finished: { meditations: range(12), 'notes-from-underground': range(11), 'jekyll-and-hyde': range(10) },
    hidden: {}, owner: USER, lastSettledBookId: 'frankenstein', lastSettledAt: now - 3_600_000, updatedAt: now - 3_600_000, deviceId: 'cloud',
  }
}

const set = (book: string, pos = '50% 35%') => ({ src: `${ASSETS}/${book}.jpg`, pos, cover: true, private: false, initial: '' })
const initial = (letter: string) => ({ src: null, pos: '', cover: false, private: false, initial: letter })

function ownProfile(overrides: Record<string, unknown> = {}) {
  return {
    handle: 'anders', link: 'tinct.app/@anders', name: 'Anders',
    picture: { kind: 'set', value: 'stoic', url: null, review: 'none' },
    background: { kind: 'set', value: 'stoic', url: null, review: 'none' },
    visibility: 'friends', effectiveVisibility: 'friends', showReading: true, showTime: true, onLeaderboard: true,
    newBooksOpenIn: 'modern', setUp: true, needsSetup: false, shouldPrompt: false, emailConfirmed: true, emailOptIn: false, googlePhoto: false,
    ...overrides,
  }
}

export interface Mocks { posts: Array<{ url: string; body: unknown }>; profile: Record<string, unknown> }

export async function prepare(page: Page, options: { night?: boolean; profile?: Record<string, unknown> } = {}): Promise<Mocks> {
  const mocks: Mocks = { posts: [], profile: ownProfile(options.profile) }
  await page.route(url => !['localhost', '127.0.0.1'].includes(url.hostname), route => route.abort())
  await page.route('**/sb/**', route => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/auth/v1/user')) return route.fulfill({ json: { id: USER, email: 'anders@example.com', aud: 'authenticated' } })
    return route.fulfill({ json: [] })
  })
  // The allowance is switched off in the shipped bundle; the cards are shown with it on.
  await page.route('**/src/aiAllowanceSwitch.ts*', route => route.fulfill({ contentType: 'text/javascript', body: 'export const AI_ALLOWANCE_ENFORCED = true\n' }))
  // The Worker's switch markers (SOCIAL_PROFILES, SOCIAL_FRIENDS) on the pages it serves.
  for (const pattern of ['**/reader', '**/reader?*', '**/library', '**/library?*']) {
    await page.route(pattern, async route => {
      if (route.request().resourceType() !== 'document') return route.fallback()
      const response = await route.fetch()
      const html = (await response.text()).replace('</head>', '<meta name="tinct-social" content="1"><meta name="tinct-friends" content="1"></head>')
      return route.fulfill({ response, body: html, headers: { ...response.headers(), 'content-type': 'text/html' } })
    })
  }
  await page.route('**/api/profile', async route => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      mocks.posts.push({ url: '/api/profile', body })
      Object.assign(mocks.profile, body)
    }
    return route.fulfill({ json: { enabled: true, available: true, profile: mocks.profile } })
  })
  await page.route('**/api/profile?*', route => route.fulfill({ json: { enabled: true, available: true, profile: mocks.profile } }))
  await page.route('**/api/reading-time/status', route => route.fulfill({ json: { enabled: true } }))
  await page.route('**/api/reading-time', route => route.fulfill({ json: { enabled: true, rows: ledgerRows() } }))
  await page.route('**/api/reading-time/beat', route => route.fulfill({ json: { enabled: true, credited: { read: 0, listen: 0 } } }))
  await page.route('**/api/reading-time/flush', route => route.fulfill({ json: { enabled: true, credited: 0 } }))
  await page.route('**/api/lab-position', route => route.fulfill({ json: positionRecord() }))
  await page.route('**/api/ai-allowance', route => route.fulfill({ json: { enabled: true, usedFraction: 0.6, monthUsedFraction: 0.85, topUpLeftFraction: 0.64, state: 'low', resetsAt: '2026-11-05T12:00:00.000Z', hasTopUp: true, topUps: ['chat_pack_200', 'top_up_10'] } }))
  await page.route('**/api/balance', route => route.fulfill({ json: { balance: 0, isSubscribed: true } }))
  await page.route('**/api/events**', route => route.fulfill({ status: 204, body: '' }))
  await page.route('**/api/subscription-info', route => route.fulfill({ json: { subscription_status: 'active', intervals: ['month', 'year'] } }))
  await page.route('**/api/social/rank', route => route.fulfill({ json: { rank: 3, total: 5, seconds: 22200 } }))
  await page.route('**/api/social/board?*', route => {
    const tab = new URL(route.request().url()).searchParams.get('tab')
    const entry = (rank: number, name: string, picture: unknown, seconds: number, me = false) => ({ rank, name, picture, seconds, duration: '', me })
    return route.fulfill({ json: {
      tab, window: { start: day(-6), end: day(1) }, refreshedAt: null, total: 5, meShown: true, everyoneOpen: true,
      me: entry(3, 'Anders', set('meditations', '50% 34%'), 22200, true),
      entries: [
        entry(1, 'Sofie Berg', set('crime-and-punishment', '50% 38%'), 34800),
        entry(2, 'Jonas Lund', initial('J'), 26100),
        entry(3, 'Anders', set('meditations', '50% 34%'), 22200, true),
        entry(4, 'Maja Holm', set('pride-and-prejudice', '50% 32%'), 17400),
        entry(5, 'Thomas Krag', initial('T'), 9000),
      ],
    } })
  })
  const person = (handle: string, name: string, picture: unknown, relation: string, book: string | null = null) => ({ handle, name, link: `tinct.app/@${handle}`, picture, relation, book })
  await page.route('**/api/social/find', route => route.fulfill({ json: {
    followingYou: [person('ellen', 'Ellen Ravn', initial('E'), 'followed')],
    alsoReading: [person('maja', 'Maja Holm', set('pride-and-prejudice', '50% 32%'), 'friend', 'Frankenstein'), person('karl', 'Karl Ny', set('odyssey', '30% 60%'), 'stranger', 'Frankenstein')],
    link: 'tinct.app/@anders', everyoneOpen: true,
  } }))
  await page.route('**/api/social/find?q=*', route => route.fulfill({ json: { results: [person('karl', 'Karl Ny', set('odyssey', '30% 60%'), 'stranger')] } }))
  await page.route('**/api/social/follow', route => { mocks.posts.push({ url: '/api/social/follow', body: route.request().postDataJSON() }); return route.fulfill({ json: { relation: 'friend', followsYou: true } }) })
  await page.route('**/api/social/profile/*', route => route.fulfill({ json: { profile: {
    handle: 'maja', name: 'Maja Holm', link: 'tinct.app/@maja', picture: set('pride-and-prejudice', '50% 32%'),
    banner: { src: `${ASSETS}/scene-pride-and-prejudice-phone.jpg`, private: false }, relation: 'friend', followsYou: true, limited: false,
    time: { last7: '4 h 50 m', year: '96 h' },
    readingNow: [{ bookId: 'pride-and-prejudice', title: 'Pride and Prejudice', cover: null, progress: 'Ch. 41 of 61', hours: '22 h' }, { bookId: 'odyssey', title: 'The Odyssey', cover: null, progress: 'Ch. 5 of 24', hours: '4 h 10 m' }],
    finished: ['Crime and Punishment', 'Frankenstein', 'Jane Eyre', 'Meditations', 'Candide', 'The Prince', 'Emma', 'The Iliad', 'Persuasion', 'Middlemarch', 'Walden'].map((title, i) => ({ bookId: `b${i}`, title, cover: null, progress: null, hours: `${12 - i} h` })),
  } } }))
  await page.addInitScript(({ user, night }) => {
    try {
      const now = Math.floor(Date.now() / 1000)
      localStorage.setItem('sb-127-auth-token', JSON.stringify({
        access_token: 'test-token', refresh_token: 'refresh', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600,
        user: { id: user, email: 'anders@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: { full_name: 'Anders' } },
      }))
      document.cookie = 'tinct_auth=1; Path=/'
      localStorage.setItem('tinct-lab-prefs', JSON.stringify(night ? { theme: 'dark', darkMode: true } : { theme: 'light', darkMode: false }))
    } catch { /* private */ }
  }, { user: USER, night: options.night ?? false })
  return mocks
}

export async function openReader(page: Page) {
  await page.goto('/reader?book=frankenstein', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('lab-super')).toBeVisible({ timeout: 90_000 })
  await page.waitForTimeout(800)
  await page.evaluate(() => { (window as unknown as { __stay: number }).__stay = 1 })
}

export async function openYouFromReader(page: Page) {
  await page.getByTestId('lab-super').click()
  await page.getByTestId('lab-super-row-account').click()
  await expect(page.locator('.tc-card[data-card="you"]')).toBeVisible()
}

const top = (page: Page, id: string) => page.locator(`.tc-card[data-card="${id}"]:not(.is-under)`)

async function shot(page: Page, name: string) {
  if (!ARTIFACT_DIR) return
  mkdirSync(ARTIFACT_DIR, { recursive: true })
  await page.waitForTimeout(450)
  await page.screenshot({ path: join(ARTIFACT_DIR, `${name}-${test.info().project.name}.png`) })
}

/** No element in the cards overflows its box or is cut off. */
async function nothingCut(page: Page) {
  const problems = await page.evaluate(() => {
    const out: string[] = []
    for (const node of document.querySelectorAll<HTMLElement>('.tc-card:not(.is-under) .tc-l, .tc-card:not(.is-under) .tc-lt, .tc-card:not(.is-under) .tc-v, .tc-card:not(.is-under) .tc-seg button, .tc-card:not(.is-under) .tc-btn, .tc-card:not(.is-under) .tc-nm b, .tc-card:not(.is-under) .tc-three b')) {
      if (node.scrollWidth > node.clientWidth + 1) out.push(`${node.className}: ${node.textContent}`)
    }
    const card = document.querySelector<HTMLElement>('.tc-card:not(.is-under)')
    if (card && card.scrollWidth > card.clientWidth + 1) out.push('card scrolls sideways')
    return out
  })
  expect(problems).toEqual([])
}

/** The brief's type rules: no monospace and no capitals-only labels anywhere in the cards. */
async function typeRules(page: Page) {
  const bad = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.tcards *')].flatMap(node => {
    const style = getComputedStyle(node)
    const text = [...node.childNodes].filter(child => child.nodeType === 3).map(child => child.textContent).join('').trim()
    const issues: string[] = []
    if (/mono/i.test(style.fontFamily)) issues.push(`monospace: ${text}`)
    if (style.textTransform === 'uppercase' || (text.length > 3 && /[A-Z]/.test(text) && text === text.toUpperCase() && /^[A-Z ]+$/.test(text))) issues.push(`capitals: ${text}`)
    return issues
  }))
  expect(bad).toEqual([])
}

for (const night of [false, true]) {
  const theme = night ? 'dark' : 'light'
  test(`every card over the reader (${theme}), without a page load`, async ({ page }) => {
    const mocks = await prepare(page, { night })
    await openReader(page)
    const before = await page.evaluate(() => ({ nav: performance.getEntriesByType('navigation').length, url: location.href, page: (document.querySelector('[data-testid="lab-root"]') as HTMLElement | null)?.innerText.slice(0, 400) ?? null }))
    await openYouFromReader(page)
    await expect(page.locator('.tc-card[data-card="you"] .tc-nm b')).toHaveText('Anders')
    await expect(page.getByTestId('you-reading')).toContainText(' h ')
    await expect(page.getByTestId('you-leaderboard')).toContainText('3rd of 5')
    await expect(page.getByTestId('you-top-up-bar')).toContainText('64%')
    await expect(page.locator('.tc-badge')).toHaveText('1')
    await nothingCut(page); await typeRules(page)
    await shot(page, `reader-you-${theme}`)

    await page.getByTestId('you-picture').click()
    await expect(page.getByTestId('card-menu')).toBeVisible()
    await shot(page, `reader-picture-menu-${theme}`)
    await page.getByTestId('menu-choose').click()
    await expect(top(page, 'picture')).toBeVisible()
    await expect(page.locator('[data-testid="picture-grid"] button')).toHaveCount(8)
    await shot(page, `reader-choose-picture-${theme}`)
    await page.locator('.tc-card[data-card="picture"] [data-testid="card-back"]').click()

    await page.getByTestId('you-reading').click()
    await expect(top(page, 'reading')).toBeVisible()
    await expect(page.getByTestId('reading-total')).toBeVisible()
    await nothingCut(page); await typeRules(page)
    await shot(page, `reader-reading-${theme}`)
    await top(page, 'reading').getByTestId('card-back').click()

    await page.getByTestId('you-leaderboard').click()
    await expect(page.getByTestId('board-me')).toContainText('You')
    await expect(page.getByTestId('board-rows').locator('.tc-r')).toHaveCount(5)
    // Rows carry no link (privacy notice): nothing to tap.
    expect(await page.getByTestId('board-rows').locator('button').count()).toBe(0)
    await nothingCut(page); await typeRules(page)
    await shot(page, `reader-leaderboard-${theme}`)
    await page.getByTestId('board-find').click()
    await expect(top(page, 'find')).toBeVisible()
    await expect(page.getByTestId('following-you-row-button')).toHaveText('Follow back')
    await nothingCut(page); await typeRules(page)
    await shot(page, `reader-find-${theme}`)

    await page.getByTestId('reader-row').first().click()
    await expect(top(page, 'profile')).toBeVisible()
    await expect(page.locator('.tc-card[data-card="profile"] .tc-nm')).toContainText('Follows you')
    await expect(page.getByTestId('profile-more')).toHaveText('9 more')
    await nothingCut(page); await typeRules(page)
    await shot(page, `reader-profile-${theme}`)
    // Back one at a time: profile -> find -> leaderboard -> you.
    await top(page, 'profile').getByTestId('card-back').click()
    await expect(top(page, 'find')).toBeVisible()
    await top(page, 'find').getByTestId('card-back').click()
    await top(page, 'leaderboard').getByTestId('card-back').click()
    await expect(top(page, 'you')).toBeVisible()

    await page.getByTestId('you-settings').click()
    await expect(top(page, 'settings')).toBeVisible()
    await nothingCut(page); await typeRules(page)
    await shot(page, `reader-settings-${theme}`)
    await page.getByTestId('info-leaderboard').click()
    await expect(page.getByTestId('card-tip')).toBeVisible()
    await shot(page, `reader-settings-tip-${theme}`)
    await page.mouse.click(5, 5)
    await expect(page.getByTestId('card-tip')).toHaveCount(0)
    // Changes post at once; Only me takes the reader off the board and disables the switch.
    await page.getByTestId('settings-visibility').locator('[data-value="only_me"]').click()
    await expect(page.getByTestId('settings-leaderboard')).toBeDisabled()
    await expect.poll(() => mocks.posts.filter(post => post.url === '/api/profile').length).toBeGreaterThan(0)
    expect(mocks.posts.find(post => post.url === '/api/profile')?.body).toMatchObject({ visibility: 'only_me', onLeaderboard: false })

    // The cross closes everything; the reader never left.
    await top(page, 'settings').getByTestId('card-close').click()
    await expect(page.locator('.tcards')).toHaveCount(0)
    const after = await page.evaluate(() => ({ nav: performance.getEntriesByType('navigation').length, url: location.href, page: (document.querySelector('[data-testid="lab-root"]') as HTMLElement | null)?.innerText.slice(0, 400) ?? null, stay: (window as unknown as { __stay?: number }).__stay }))
    expect(after).toEqual({ ...before, stay: 1 })
  })
}

test('the library: the picture in the top bar opens the dark cards over the page', async ({ page }) => {
  await prepare(page)
  await page.goto('/library', { waitUntil: 'domcontentloaded' })
  const you = page.locator('#sign-in.cards-you')
  await expect(you).toBeVisible({ timeout: 60_000 })
  const search = await page.locator('#search-toggle svg').boundingBox()
  const picture = await you.locator('.tinct-avatar').boundingBox()
  expect(Math.abs((picture?.width ?? 0) - (search?.width ?? 0))).toBeLessThanOrEqual(2)
  await page.evaluate(() => { (window as unknown as { __stay: number }).__stay = 1 })
  await you.click()
  await expect(page.locator('.tcards.is-dark .tc-card[data-card="you"]')).toBeVisible()
  await expect(page.getByTestId('you-reading')).toBeVisible()
  await shot(page, 'library-you-dark')
  for (const [row, id] of [['you-reading', 'reading'], ['you-leaderboard', 'leaderboard'], ['you-find', 'find'], ['you-settings', 'settings']] as const) {
    await page.getByTestId(row).click()
    await expect(top(page, id)).toBeVisible()
    await shot(page, `library-${id}-dark`)
    await top(page, id).getByTestId('card-back').click()
  }
  await page.keyboard.press('Escape')
  await expect(page.locator('.tcards')).toHaveCount(0)
  expect(await page.evaluate(() => (window as unknown as { __stay?: number }).__stay)).toBe(1)
})

test('an old link opens its card over the library', async ({ page }) => {
  await prepare(page)
  await page.goto('/friends?tab=find', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/library$/, { timeout: 60_000 })
  await expect(top(page, 'find')).toBeVisible({ timeout: 60_000 })
  await top(page, 'find').getByTestId('card-back').click()
  await expect(top(page, 'you')).toBeVisible()
})
