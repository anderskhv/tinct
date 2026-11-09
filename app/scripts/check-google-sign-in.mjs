/**
 * Google sign-in on tinct.app, end to end in a real browser against a local
 * build (src/lab/googleSignIn.ts, src/worker/routes/googleAuth.ts).
 *
 * The page is served from dist/ under https://tinct.app. The Worker's three
 * Google routes run from the real route module (bundled here with esbuild).
 * Google's screen, Google's token endpoint and Supabase are fixtures: no real
 * Google or Supabase request leaves the browser or this process.
 *
 *   configured   Continue with Google -> accounts.google.com URL (redirect_uri
 *                on this origin, S256, hashed nonce) -> Google answers with a
 *                code -> exchange -> signInWithIdToken (raw nonce) -> the
 *                reader is signed in at the exact place they came from.
 *   cancelled    Google answers access_denied -> the sign-in sheet with a notice.
 *   unconfigured The Worker has no client id/secret -> Supabase's own OAuth.
 *
 * Usage (from app/, after npm run build):
 *   node scripts/check-google-sign-in.mjs [outputDir]
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
const output = path.resolve(process.argv[2] || path.join(appDir, 'artifacts/google-sign-in'))
await fs.mkdir(output, { recursive: true })

// The real Worker route module, so the browser exercises the shipped code.
const bundled = path.join(output, 'googleAuth.route.mjs')
await build({ entryPoints: [path.join(appDir, 'src/worker/routes/googleAuth.ts')], bundle: true, format: 'esm', platform: 'neutral', outfile: bundled, logLevel: 'silent' })
const { handleGoogleAuth, isGoogleAuthPath } = await import(pathToFileURL(bundled).href)

const origin = 'https://tinct.app'
const CLIENT_ID = 'fixture-client.apps.googleusercontent.com'
const user = { id: '00000000-0000-4000-8000-000000000002', email: 'fixture@example.com', aud: 'authenticated', role: 'authenticated',
  created_at: '2026-01-01T00:00:00Z', last_sign_in_at: '2026-11-09T10:00:00Z', email_confirmed_at: '2026-01-01T00:00:00Z',
  app_metadata: { provider: 'google', providers: ['google'] }, user_metadata: {}, identities: [] }
const sessionFor = reader => {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const token = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'), Buffer.from(JSON.stringify({ sub: reader.id, exp, role: 'authenticated' })).toString('base64url'), 'fixture-only'].join('.')
  return { access_token: token, refresh_token: 'fixture-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: reader }
}
const sha256Hex = text => createHash('sha256').update(text).digest('hex')
const s256 = text => createHash('sha256').update(text).digest('base64url')

async function run(name, { configured, googleAnswer }) {
  const browser = await markInternal(await chromium.launch({ headless: true }))
  const seen = { google: null, googleToken: [], exchange: [], idToken: [], supabaseAuthorize: null, external: [], errors: [] }
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })
    const page = await context.newPage()
    page.on('pageerror', error => seen.errors.push(error.message))
    const env = configured ? { GOOGLE_OAUTH_CLIENT_ID: CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET: 'fixture-secret' } : {}
    // Google's token endpoint, as the Worker calls it.
    const googleTokenFetch = async (url, init) => {
      const form = Object.fromEntries(new URLSearchParams(String(init.body)))
      seen.googleToken.push({ url, form })
      const pending = seen.google
      const ok = form.code === 'fixture-code' && form.client_secret === 'fixture-secret' && pending && s256(form.code_verifier) === pending.searchParams.get('code_challenge')
      if (!ok) return Response.json({ error: 'invalid_grant' }, { status: 400 })
      return Response.json({ access_token: 'ya29.fixture', id_token: `fixture.id-token.${pending.searchParams.get('nonce')}`, expires_in: 3599, token_type: 'Bearer' })
    }
    await page.route('**/*', async route => {
      const request = route.request()
      const url = new URL(request.url())
      if (url.hostname === 'accounts.google.com') {
        // Google's screen: answer at once with the reader's choice.
        seen.google = url
        const back = new URL(url.searchParams.get('redirect_uri'))
        if (googleAnswer === 'cancel') back.searchParams.set('error', 'access_denied')
        else back.searchParams.set('code', 'fixture-code')
        back.searchParams.set('state', url.searchParams.get('state'))
        back.searchParams.set('scope', 'email profile openid')
        // Google's screen goes on to the redirect_uri with the reader's answer.
        return route.fulfill({ contentType: 'text/html', body: `<p>Google (fixture)</p><script>location.replace(${JSON.stringify(back.toString())})</script>` })
      }
      if (url.hostname.endsWith('.supabase.co')) {
        if (url.pathname.endsWith('/auth/v1/token') && url.searchParams.get('grant_type') === 'id_token') {
          seen.idToken.push(request.postDataJSON())
          return route.fulfill({ json: sessionFor(user) })
        }
        if (url.pathname.endsWith('/auth/v1/authorize')) {
          seen.supabaseAuthorize = url
          return route.fulfill({ contentType: 'text/html', body: '<p data-supabase-authorize>Supabase authorize (fixture)</p>' })
        }
        if (url.pathname.endsWith('/auth/v1/user')) return route.fulfill({ json: user })
        return route.fulfill({ json: [] })
      }
      if (url.origin !== origin) { seen.external.push(url.origin); return route.abort() }
      if (isGoogleAuthPath(url.pathname)) {
        const body = request.method() === 'POST' ? request.postData() : undefined
        if (url.pathname.endsWith('/exchange')) seen.exchange.push(JSON.parse(body))
        try {
          const workerRequest = new Request(url, { method: request.method(), headers: request.headers(), body })
          const response = await handleGoogleAuth(workerRequest, env, { checkRateLimit: async () => true, fetcher: googleTokenFetch })
          return await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) })
        } catch (error) {
          seen.errors.push(`route ${url.pathname}: ${error.message}`)
          return route.abort()
        }
      }
      if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 204, body: '' })
      if (url.pathname === '/reader') return route.fulfill({ contentType: 'text/html', body: '<p data-reader-fixture>Reader</p>' })
      const relative = url.pathname === '/sign-in' || url.pathname === '/sign-in/' ? '/lab/sign-in/index.html' : url.pathname
      const file = path.resolve(dist, '.' + relative)
      if (!file.startsWith(dist + path.sep)) return route.abort()
      try { return await route.fulfill({ path: file }) } catch { return route.abort() }
    })

    await page.goto(`${origin}/sign-in?returnTo=${encodeURIComponent('/reader?book=bible#p12')}`)
    await page.waitForSelector('#tinct-lab-sign-in[data-ready="true"]')
    await page.screenshot({ path: path.join(output, `${name}-1-sheet.png`) })
    await page.getByRole('button', { name: 'Continue with Google' }).click()

    if (!configured) {
      await page.waitForSelector('[data-supabase-authorize]')
      assert.equal(seen.google, null, 'unconfigured: never goes to Google directly')
      assert.equal(seen.supabaseAuthorize.searchParams.get('provider'), 'google')
      assert.equal(seen.supabaseAuthorize.searchParams.get('redirect_to'), `${origin}/sign-in?callback=oauth&returnTo=${encodeURIComponent('/reader?book=bible#p12')}`)
      assert.equal(seen.exchange.length, 0)
      return { name, ok: true, supabaseAuthorize: seen.supabaseAuthorize.toString(), external: seen.external, errors: seen.errors }
    }

    const google = await (async () => { for (let i = 0; i < 100 && !seen.google; i++) await page.waitForTimeout(50); return seen.google })()
    assert.ok(google, 'went to accounts.google.com')
    assert.equal(google.origin + google.pathname, 'https://accounts.google.com/o/oauth2/v2/auth')
    assert.equal(google.searchParams.get('client_id'), CLIENT_ID)
    assert.equal(google.searchParams.get('redirect_uri'), `${origin}/auth/google/callback`)
    assert.equal(google.searchParams.get('response_type'), 'code')
    assert.equal(google.searchParams.get('scope'), 'openid email profile')
    assert.equal(google.searchParams.get('code_challenge_method'), 'S256')
    assert.match(google.searchParams.get('code_challenge'), /^[A-Za-z0-9_-]{43}$/)
    assert.match(google.searchParams.get('nonce'), /^[0-9a-f]{64}$/)
    assert.equal(seen.supabaseAuthorize, null, 'Supabase authorize is not used')

    if (googleAnswer === 'cancel') {
      await page.waitForSelector('[data-auth-status][data-tone="error"]:not([hidden])')
      await page.waitForSelector('#tinct-lab-sign-in[data-ready="true"]')
      const notice = await page.textContent('[data-auth-status]')
      assert.equal(notice, 'Google sign-in was cancelled. Try again, or use your email below.')
      assert.equal(new URL(page.url()).pathname, '/sign-in')
      assert.equal(new URL(page.url()).hash, '')
      assert.equal(new URL(page.url()).searchParams.get('returnTo'), '/reader?book=bible#p12')
      assert.equal(await page.getByRole('button', { name: 'Continue with Google' }).isEnabled(), true)
      assert.equal(seen.exchange.length, 0)
      await page.screenshot({ path: path.join(output, `${name}-2-notice.png`) })
      return { name, ok: true, notice, google: google.toString(), external: seen.external, errors: seen.errors }
    }

    await page.waitForSelector('[data-reader-fixture]')
    const landed = new URL(page.url())
    assert.equal(landed.pathname + landed.search + landed.hash, '/reader?book=bible#p12')
    assert.equal(seen.exchange.length, 1)
    assert.equal(seen.exchange[0].redirectUri, `${origin}/auth/google/callback`)
    assert.equal(seen.googleToken[0].url, 'https://oauth2.googleapis.com/token')
    assert.equal(seen.idToken.length, 1)
    const sent = seen.idToken[0]
    assert.equal(sent.provider, 'google')
    assert.equal(sent.id_token, `fixture.id-token.${google.searchParams.get('nonce')}`)
    assert.equal(sha256Hex(sent.nonce), google.searchParams.get('nonce'), 'Supabase gets the raw nonce whose SHA-256 Google got')
    assert.equal(sent.access_token, undefined, 'only the ID token reaches the browser and Supabase')
    const stored = await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('sb-') && key.endsWith('-auth-token')))
    const cookie = (await context.cookies(origin)).find(item => item.name === 'tinct_auth')
    await page.screenshot({ path: path.join(output, `${name}-2-landed.png`) })
    assert.ok(cookie, 'signed-in cookie set (landing page redirect rule)')
    return { name, ok: true, landed: landed.toString(), google: google.toString(), supabaseBody: { ...sent, id_token: '(fixture)', nonce: `(raw, ${sent.nonce.length} chars)` }, stored, external: seen.external, errors: seen.errors }
  } catch (error) {
    const page = browser.contexts()[0]?.pages()[0]
    if (page) {
      await page.screenshot({ path: path.join(output, `${name}-failed.png`) }).catch(() => {})
      console.error(JSON.stringify({ name, url: page.url(), notice: await page.textContent('[data-auth-status]').catch(() => null), exchange: seen.exchange.length, googleToken: seen.googleToken.length, idToken: seen.idToken.length, external: seen.external, errors: seen.errors }))
    }
    throw error
  } finally {
    await browser.close()
  }
}

const results = []
for (const [name, options] of [
  ['configured', { configured: true, googleAnswer: 'code' }],
  ['cancelled', { configured: true, googleAnswer: 'cancel' }],
  ['unconfigured', { configured: false }],
]) {
  results.push(await run(name, options))
  console.log(`✓ ${name}`)
}
await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
