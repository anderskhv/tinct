import { test } from 'node:test'
import assert from 'node:assert/strict'
import { laneFor } from './release-lane.mjs'

const lane = (...files) => laneFor(files).lane

test('standalone pages, their own tests and docs take the page lane', () => {
  assert.equal(lane('app/public/try.html', 'app/public/lab/try/try.js', 'app/public/lab/try/try.css',
    'app/public/lab/try/frames/phone-01.webp', 'app/public/lab/try/reader-demo.js', 'app/src/tryPage.test.ts'), 'page')
  assert.equal(lane('app/public/landing.html'), 'page')
  assert.equal(lane('app/public/privacy.html', 'DECISIONS.md'), 'page')
  assert.equal(lane('app/public/byob.html', 'app/public/byob.js'), 'page')
  assert.equal(lane('app/public/modern-english.html', 'app/public/modern-english/hero.webp'), 'page')
  assert.equal(lane('docs/try-page/BRIEF.md', 'docs/try-page/screenshots/hints-phone-1-arrival.png', 'AGENTS.md'), 'page')
})

test('one file outside the pages among page files takes the full lane', () => {
  for (const other of ['app/src/lab/LabApp.tsx', 'app/src/lab/tryDemo/tryDemo.ts', 'app/src/worker/routes/seo.ts', 'app/src/worker.ts',
    'app/src/hooks/useAuth.ts', 'app/src/termsPage.test.ts', 'app/package.json', 'app/package-lock.json', 'package.json',
    'app/vite.config.ts', 'app/wrangler.jsonc', 'app/scripts/capture-try-frames.cjs', 'scripts/release-lane.mjs',
    'scripts/ci-suites.mjs', '.github/workflows/deploy.yml', '.github/workflows/helios-warm.yml', 'supabase/migrations/001.sql',
    'workers/narration/index.ts', 'app/public/sw.js', 'app/public/app.html', 'app/public/lab/library_2/app.js',
    'app/public/data/editions/frankenstein-original-en.json', 'app/public/terms.html', 'app/public/landing2.html',
    'docs/margin/layout-check.mjs', 'docs/margin/BRIEF.md', 'docs/notes.json', 'books/README.md', 'app/README.md'])
    assert.equal(lane('app/public/try.html', other, 'DECISIONS.md'), 'full', other)
})

test('look-alike paths take the full lane', () => {
  for (const file of ['app/public/try.html.map', 'app/public/lab/tryout/x.js', 'app/public/lab/try', 'app/public/landing.htm',
    'app/public/byob.css', 'app/src/tryPage.test.tsx', 'app/src/lab/tryPage.test.ts', 'docs/x.mjs', 'docs/x.js', 'x/DECISIONS.md'])
    assert.equal(lane(file), 'full', file)
})

test('no changed files takes the full lane', () => {
  assert.equal(lane(), 'full')
})
