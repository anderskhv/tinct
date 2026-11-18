import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SUITES, suitesFor } from './ci-suites.mjs'

const run = (...files) => suitesFor(files).suites

test('the reader, shared code, dependencies, workflows, build and Worker entry run everything', () => {
  for (const file of ['app/src/lab/LabApp.tsx', 'app/src/lab/labPosition.ts', 'app/src/narration/narrationCore.ts', 'app/src/utils/storage.ts',
    'app/package.json', 'app/package-lock.json', '.github/workflows/verify.yml', 'app/vite.config.ts', 'app/src/worker.ts',
    'app/wrangler.jsonc', 'scripts/ci-suites.mjs', 'app/scripts/lib/internalTraffic.cjs', 'app/public/sw.js', 'app/public/data/editions/frankenstein-original-en.json'])
    assert.deepEqual(run(file), SUITES, file)
})

test('an unclassified file among narrow ones runs everything', () => {
  assert.deepEqual(run('docs/notes.md', 'app/public/lab/library_2/app.js', 'books/wip/new-book/notes.json'), SUITES)
})

test('library-only skips Shakespeare, inline audio and the reader panels', () => {
  const s = run('app/public/lab/library_2/index.html', 'app/public/lab/library-2-model.js')
  for (const skipped of ['shakespeare', 'audio', 'panels', 'typeset']) assert(!s.includes(skipped), skipped)
  assert(s.includes('library') && s.includes('featured'))
})

test('Worker-only skips the margin and the library browser checks', () => {
  const s = run('app/src/worker/routes/narration.ts', 'app/src/worker.narrationEnsureLatency.test.ts')
  for (const skipped of ['margin', 'library', 'featured']) assert(!s.includes(skipped), skipped)
  assert(s.includes('panels') && s.includes('audio'))
})

test('docs-only runs unit tests only', () => {
  assert.deepEqual(run('docs/release-speed.md', 'README.md', 'books/README.md'), [])
})

test('the margin check alone, and the margin reader with the library that loads it', () => {
  assert.deepEqual(run('docs/margin/layout-check.mjs', 'app/scripts/margin-check.mjs', 'app/src/addbookMargin.test.ts'), ['margin'])
  assert.deepEqual(run('app/public/lab/addbook/js/reader.js'), ['signin', 'library', 'featured', 'margin'])
  assert.deepEqual(run('app/public/lab/margin/margin.css'), SUITES)
})

test('a check script runs its own check', () => {
  assert.deepEqual(run('app/scripts/check-inline-audio-loading.mjs'), ['audio'])
  assert.deepEqual(run('app/scripts/check-reader-panels.mjs'), ['panels', 'featured'])
})

test('no changed files runs everything', () => {
  assert.deepEqual(run(), SUITES)
})
