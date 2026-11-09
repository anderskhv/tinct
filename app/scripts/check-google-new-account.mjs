/**
 * A new account through Google on tinct.app, in a real browser against a local
 * build (Anders's report, 9 Nov 2026):
 *
 *   1. Back from Google, /sign-in?callback=google must show "Signing you in…"
 *      from the first frame until the profile step: no frame may show the
 *      sign-in form (Continue with Google, the email field).
 *   2. Skip on "Your profile" (and on "How do you read?") is remembered for the
 *      account: the library never sends the reader to the profile step by
 *      itself, the top-bar picture opens the You card, and that holds after a
 *      reload and on a second device (a fresh browser with the same session).
 *      Nothing is saved for the profile: the picture stays the empty disc,
 *      the Google photo is used only if the reader chooses it.
 *
 * Served from dist/ under https://tinct.app with the Worker's profiles marker.
 * The Worker's Google routes and profile routes run from the real route
 * modules (bundled with esbuild), the profile store is in memory. Google's
 * screen, Google's token endpoint and Supabase are fixtures: no real request
 * leaves the browser or this process.
 *
 * Usage (from app/, after npm run build):
 *   node scripts/check-google-new-account.mjs [outputDir]
 */
import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { markInternal } from './lib/internalTraffic.cjs'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(appDir, 'dist')
const output = path.resolve(process.argv[2] || path.join(appDir, 'artifacts/google-new-account'))
await fs.mkdir(output, { recursive: true })

async function routeModule(name, entry) {
  const outfile = path.join(output, `${name}.route.mjs`)
  await build({ entryPoints: [path.join(appDir, entry)], bundle: true, format: 'esm', platform: 'neutral', outfile, logLevel: 'silent', mainFields: ['module', 'main'] })
  return import(pathToFileURL(outfile).href)
}
const { handleGoogleAuth, isGoogleAuthPath } = await routeModule('googleAuth', 'src/worker/routes/googleAuth.ts')
const { handleProfiles, isProfileApiPath } = await routeModule('profiles', 'src/worker/routes/profiles.ts')
const { withSocialMarkers } = await routeModule('socialPages', 'src/worker/routes/socialPages.ts')

const origin = 'https://tinct.app'
const CLIENT_ID = 'fixture-client.apps.googleusercontent.com'
const GOOGLE_PHOTO = 'https://lh3.googleusercontent.com/a/fixture-photo=s96-c'
const now = new Date().toISOString()
const user = {
  id: '00000000-0000-4000-8000-0000000000a1', email: 'new.reader@example.com', aud: 'authenticated', role: 'authenticated',
  created_at: now, last_sign_in_at: now, email_confirmed_at: now,
  app_metadata: { provider: 'google', providers: ['google'] },
  user_metadata: { full_name: 'Nora Fixture', name: 'Nora Fixture', avatar_url: GOOGLE_PHOTO, picture: GOOGLE_PHOTO },
  identities: [{ provider: 'google' }],
}
const sessionFor = reader => {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const token = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'), Buffer.from(JSON.stringify({ sub: reader.id, exp, role: 'authenticated' })).toString('base64url'), 'fixture-only'].join('.')
  return { access_token: token, refresh_token: 'fixture-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: reader }
}
const s256 = text => createHash('sha256').update(text).digest('base64url')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/** reader_profiles and profiles in memory, as worker.profiles.test.ts keeps them. */
const store = {
  profiles: new Map(),
  accounts: new Map([[user.id, { email: user.email, email_opt_in: false, email_confirmed_at: now, email_consent_version: null }]]),
  writes: [],
  async getOwn(id) { return this.profiles.get(id) ?? null },
  async getAccount(id) { return this.accounts.get(id) ?? null },
  async takenHandles(candidates) { return new Set([...this.profiles.values()].map(row => row.handle).filter(handle => candidates.includes(handle))) },
  async create(row) { if (this.profiles.has(row.id)) return 'taken'; this.profiles.set(row.id, { ...row }); return 'ok' },
  async update(id, patch) { this.writes.push(patch); this.profiles.set(id, { ...this.profiles.get(id), ...patch }); return 'ok' },
  async updateAccount(id, patch) { this.accounts.set(id, { ...this.accounts.get(id), ...patch }) },
  async getCardByHandle() { return null },
  async getCardById() { return null },
  async relation() { return { viewerFollowsOwner: false, ownerFollowsViewer: false, blocked: false } },
}

const seen = { google: null, exchange: 0, idToken: 0, external: new Set(), errors: [], routed: new WeakSet(), unrouted: [] }

async function wire(context) {
  const env = { GOOGLE_OAUTH_CLIENT_ID: CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET: 'fixture-secret', SOCIAL_PROFILES: '1', SOCIAL_PHOTO_UPLOADS: '0' }
  const googleTokenFetch = async (url, init) => {
    const form = Object.fromEntries(new URLSearchParams(String(init.body)))
    const pending = seen.google
    const ok = form.code === 'fixture-code' && pending && s256(form.code_verifier) === pending.searchParams.get('code_challenge')
    if (!ok) return Response.json({ error: 'invalid_grant' }, { status: 400 })
    return Response.json({ access_token: 'ya29.fixture', id_token: `fixture.id-token.${pending.searchParams.get('nonce')}`, expires_in: 3599, token_type: 'Bearer' })
  }
  // Nothing may reach a real server: every request the browser finished must have come through the route.
  context.on('requestfinished', request => { if (!seen.routed.has(request) && !request.url().startsWith('data:')) seen.unrouted.push(request.url()) })
  await context.route('**/*', async route => {
    const request = route.request()
    seen.routed.add(request)
    const url = new URL(request.url())
    if (url.hostname === 'accounts.google.com') {
      seen.google = url
      const back = new URL(url.searchParams.get('redirect_uri'))
      back.searchParams.set('code', 'fixture-code')
      back.searchParams.set('state', url.searchParams.get('state'))
      return route.fulfill({ contentType: 'text/html', body: `<p>Google (fixture)</p><script>location.replace(${JSON.stringify(back.toString())})</script>` })
    }
    if (url.hostname === 'lh3.googleusercontent.com') {
      // A 1x1 photo: the profile step offers it, the library must not show it after Skip.
      return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') })
    }
    if (url.hostname.endsWith('.supabase.co')) {
      if (url.pathname.endsWith('/auth/v1/token') && url.searchParams.get('grant_type') === 'id_token') {
        seen.idToken++
        await wait(300) // Supabase's own round trip
        return route.fulfill({ json: sessionFor(user) })
      }
      if (url.pathname.endsWith('/auth/v1/token')) return route.fulfill({ json: sessionFor(user) })
      if (url.pathname.endsWith('/auth/v1/user')) return route.fulfill({ json: user })
      return route.fulfill({ json: [] })
    }
    if (url.origin !== origin) { seen.external.add(url.origin); return route.abort() }
    const body = request.method() === 'GET' || request.method() === 'HEAD' ? undefined : request.postDataBuffer() ?? undefined
    const workerRequest = () => new Request(url, { method: request.method(), headers: request.headers(), body })
    const answer = async response => {
      // Playwright does not route the request a fulfilled redirect leads to: it would go to the real
      // tinct.app. The browser is sent on by the page instead, so the next page is this build's too.
      const location = response.status >= 300 && response.status < 400 ? response.headers.get('location') : null
      if (location) return route.fulfill({ contentType: 'text/html', body: `<script>location.replace(${JSON.stringify(new URL(location, url).toString())})</script>` })
      return route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) })
    }
    try {
      if (isGoogleAuthPath(url.pathname)) {
        if (url.pathname.endsWith('/exchange')) { seen.exchange++; await wait(700) } // Google's token endpoint, through the Worker
        return await answer(await handleGoogleAuth(workerRequest(), env, { checkRateLimit: async () => true, fetcher: googleTokenFetch }))
      }
      if (isProfileApiPath(url.pathname)) {
        await wait(150)
        return await answer(await handleProfiles(workerRequest(), env, { store, verifyUser: async () => user }))
      }
    } catch (error) {
      seen.errors.push(`route ${url.pathname}: ${error.message}`)
      return route.abort()
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 204, body: '' })
    const pagePath = url.pathname === '/sign-in' || url.pathname === '/sign-in/' ? '/lab/sign-in/index.html'
      : url.pathname === '/library' || url.pathname === '/library/' || url.pathname === '/' ? '/lab/library_2/index.html' : null
    const file = path.resolve(dist, '.' + (pagePath ?? url.pathname))
    if (!file.startsWith(dist + path.sep)) return route.abort()
    if (pagePath) {
      const html = await fs.readFile(file, 'utf8')
      const marked = await withSocialMarkers(new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }), new Request(url))
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: await marked.text() })
    }
    try { return await route.fulfill({ path: file }) } catch { return route.fulfill({ status: 404, body: '' }) }
  })
}

/** Every frame of the sign-in page after Google: what the reader could see. */
function watchFrames() {
  if (!/^\/sign-in\/?$/.test(location.pathname) || !/[?&]callback=google(?:&|$)/.test(location.search)) return
  const frames = []
  window.__signInFrames = frames
  const visible = selector => { const node = document.querySelector(selector); return Boolean(node && node.checkVisibility?.({ checkVisibilityCSS: true }) && node.getBoundingClientRect().height > 0) }
  const tick = () => {
    if (document.body) {
      const root = document.getElementById('tinct-lab-sign-in')
      const shown = [...document.querySelectorAll('h1')].find(node => node.checkVisibility?.({ checkVisibilityCSS: true }))
      frames.push({ t: Math.round(performance.now()), busy: document.documentElement.getAttribute('data-sign-in-busy'), mode: root?.dataset.mode ?? null, title: shown?.textContent?.trim() ?? null,
        google: visible('[data-oauth="google"]'), email: visible('[name="email"]'), profile: visible('[data-social-skip]') })
    }
    if (!frames.at(-1)?.profile) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

const browser = await markInternal(await chromium.launch({ headless: true }))
const result = { failures: [] }
/** A behaviour that is wrong is recorded and the walk goes on, so one run shows every problem. */
const check = (ok, message) => { if (!ok) result.failures.push(message) }
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })
  await wire(context)
  await context.addInitScript(watchFrames)
  const page = await context.newPage()
  page.on('pageerror', error => seen.errors.push(`${new URL(page.url()).pathname}: ${error.message}`))
  const navigations = []
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations.push(frame.url().replace(origin, '')) })

  // ---- 1. The return from Google ----
  await page.goto(`${origin}/sign-in?returnTo=${encodeURIComponent('/library')}`)
  await page.waitForSelector('#tinct-lab-sign-in[data-ready="true"]')
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await page.waitForURL(/callback=google/, { timeout: 10_000 })
  const shots = []
  for (let i = 0; i < 40; i++) {
    const file = `return-${String(i).padStart(2, '0')}.png`
    await page.screenshot({ path: path.join(output, file) }).catch(() => {})
    shots.push(file)
    if (await page.locator('[data-social-skip]').isVisible().catch(() => false)) break
    await page.waitForTimeout(100)
  }
  await page.waitForSelector('[data-social-skip]', { state: 'visible' })
  const frames = await page.evaluate(() => window.__signInFrames ?? [])
  const formFrames = frames.filter(frame => frame.google || frame.email)
  result.return = { frames: frames.length, formFrames: formFrames.length, firstFrames: frames.slice(0, 3), titles: [...new Set(frames.map(frame => frame.title))], screenshots: shots.length }
  await page.screenshot({ path: path.join(output, 'profile-step.png') })
  assert.equal(seen.exchange, 1, 'the code was exchanged once')
  check(formFrames.length === 0, `no frame after Google shows the sign-in form (saw ${formFrames.length} of ${frames.length}: ${JSON.stringify(formFrames.slice(0, 3))})`)
  check(frames.length > 0 && frames[0].title === 'Signing you in…', `the first frame says "Signing you in…" (got ${JSON.stringify(frames[0])})`)
  assert.ok(await page.locator('[aria-label="Picture: your Google photo"]').count() === 1, 'the Google photo is offered as a choice')

  // ---- 2. Skip, Skip, the library ----
  await page.click('[data-social-skip]')
  await page.waitForSelector('[data-social-reading-skip]', { state: 'visible' })
  await page.click('[data-social-reading-skip]')
  await page.waitForURL(url => new URL(url).pathname === '/library', { timeout: 15_000 })
  const row = () => store.profiles.get(user.id)
  result.afterSkip = { prompted_at: Boolean(row()?.prompted_at), set_up_at: row()?.set_up_at ?? null, picture: row()?.picture_kind, visibility: row()?.visibility, writes: store.writes }

  const libraryHolds = async label => {
    await page.waitForSelector('#sign-in.cards-you', { timeout: 15_000 }).catch(() => {})
    await page.waitForTimeout(2500) // the profile read and anything it might start
    if (new URL(page.url()).pathname !== '/library') {
      check(false, `${label}: the library sent the reader to ${page.url().replace(origin, '')} by itself`)
      await page.screenshot({ path: path.join(output, `${label}-sent-away.png`) })
      await page.goto(`${origin}/library`)
      await page.waitForSelector('#sign-in.cards-you', { timeout: 15_000 })
      await page.waitForTimeout(2500)
    }
    await page.screenshot({ path: path.join(output, `${label}-library.png`) })
    if (new URL(page.url()).pathname !== '/library') { check(false, `${label}: sent away again (${page.url()})`); return null }
    await page.click('#sign-in')
    const opened = await page.waitForSelector('[data-testid="account-cards"] [data-card="you"]', { timeout: 10_000 }).then(() => true, () => false)
    await page.waitForTimeout(800)
    check(opened && new URL(page.url()).pathname === '/library', `${label}: the picture opens the You card (opened ${opened}, now ${page.url().replace(origin, '')})`)
    await page.screenshot({ path: path.join(output, `${label}-you-card.png`) })
    const avatar = await page.evaluate(() => { const node = document.querySelector('#sign-in .tinct-avatar'); return node ? { kind: node.dataset.kind ?? null, image: getComputedStyle(node).backgroundImage } : null })
    check(!String(avatar?.image).includes('googleusercontent'), `${label}: the Google photo is not used after Skip`)
    return avatar
  }
  result.library = await libraryHolds('first')
  await page.reload()
  result.reload = await libraryHolds('reload')

  // A second device: the same account, a browser that has never seen the step.
  const auth = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith('sb-'))))
  const other = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' })
  await wire(other)
  await other.addCookies([{ name: 'tinct_auth', value: '1', url: origin }])
  await other.addInitScript(entries => { for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value) }, auth)
  const second = await other.newPage()
  second.on('pageerror', error => seen.errors.push(`second ${new URL(second.url()).pathname}: ${error.message}`))
  await second.goto(`${origin}/library`)
  await second.waitForSelector('#sign-in.cards-you', { timeout: 15_000 })
  await second.waitForTimeout(2500)
  check(new URL(second.url()).pathname === '/library', `second device: no profile step (now ${second.url().replace(origin, '')})`)
  await second.screenshot({ path: path.join(output, 'second-device-library.png') })
  result.secondDevice = { url: second.url().replace(origin, '') }
  result.navigations = navigations
  const fromLibrary = navigations.slice(navigations.indexOf('/library'))
  check(!fromLibrary.some(url => url.includes('mode=profile')), `the library never sends the reader to /sign-in?mode=profile (${fromLibrary.join(' → ')})`)
  check(result.afterSkip.prompted_at, 'Skip recorded that the step was offered (prompted_at)')
  check(result.afterSkip.set_up_at === null, 'Skip saved no profile (set_up_at stays empty)')
  check(result.afterSkip.visibility === 'only_me', 'Skip left the profile private')
  check(result.afterSkip.picture !== 'google', 'Skip did not choose the Google photo')
  check(seen.unrouted.length === 0, `every request was served by this check, none by a real server (${seen.unrouted.slice(0, 3).join(', ')})`)
  result.ok = result.failures.length === 0
} catch (error) {
  result.ok = false
  result.error = error.message
  for (const context of browser.contexts()) for (const page of context.pages()) await page.screenshot({ path: path.join(output, `failed-${context.pages().indexOf(page)}.png`) }).catch(() => {})
} finally {
  result.external = [...seen.external]
  result.errors = seen.errors
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
  await browser.close()
}
if (!result.ok) process.exit(1)
console.log('✓ google new account')
