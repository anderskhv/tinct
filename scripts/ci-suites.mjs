#!/usr/bin/env node
// Which verify.yml suites a pull request needs, from the files it changes.
//
//   node scripts/ci-suites.mjs                 changed files from git (HEAD^1..HEAD: a PR's merge commit)
//   node scripts/ci-suites.mjs --files a b c   the given files (tests, a dry run)
//
// Prints `<suite>=true|false` lines (for $GITHUB_OUTPUT), then `reason=…`. Only a pull_request (GITHUB_EVENT_NAME)
// is ever narrowed: a push, the nightly schedule and a manual run get every suite. A file runs everything unless a
// rule below names it, and the reader, shared code, dependencies, the workflows, the build and the Worker entry
// always run everything. Unit tests (the `app` job) run for every change, so they are not a suite here.
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

export const SUITES = ['signin', 'panels', 'library', 'featured', 'audio', 'shakespeare', 'typeset', 'margin']
const ALL = SUITES

// First match wins. `null` suites = everything.
const FULL = null
export const RULES = [
  // Always everything: the reader and its place, dependencies, the workflows and this script, the build, the Worker entry.
  [/^\.github\//, FULL],
  [/^scripts\/(ci-suites|cloud-setup)\b/, FULL],
  [/(^|\/)package(-lock)?\.json$/, FULL],
  [/^app\/(vite\.config|tsconfig|wrangler\.jsonc|index\.html|vitest)/, FULL],
  [/^app\/src\/worker\.ts$/, FULL],
  [/^app\/src\/lab\//, FULL],
  [/^app\/scripts\/lib\//, FULL],
  // The margin reader (PDFs and EPUBs of the reader's own): its layout check. The library loads its add engine
  // (library_2/add-to-tinct.js, bookshelf.js), so a change to it runs the library's checks too.
  [/^app\/public\/lab\/addbook\//, ['margin', 'library', 'featured', 'signin']],
  [/^addbooks\//, ['margin']],
  [/^docs\/margin\//, ['margin']],
  [/^app\/scripts\/margin-check\.mjs$/, ['margin']],
  [/^app\/src\/addbook[A-Za-z0-9]*\.test\.ts$/, ['margin']],
  // The library: its browser checks, the featured preview, sign-in (which starts there) and the margin reader
  // (its add engine reads the library's models).
  [/^app\/public\/lab\/(library_2|featured)\//, ['library', 'featured', 'signin', 'margin']],
  [/^app\/public\/lab\/(library-model|library-2-model|featured-preview)\.(js|css)$/, ['library', 'featured', 'signin', 'margin']],
  // The Worker (not its entry): everything but the margin and the library's browser checks. Before a deploy the
  // browser checks run the built client without the Worker, so these are kept only as a margin of safety.
  [/^app\/src\/worker\//, ['signin', 'panels', 'audio', 'shakespeare', 'typeset']],
  [/^app\/src\/worker\.[A-Za-z0-9]+\.test\.ts$/, ['signin', 'panels', 'audio', 'shakespeare', 'typeset']],
  // A check's own script: that check.
  [/^app\/scripts\/check-sign-in\.mjs$/, ['signin']],
  [/^app\/scripts\/check-reader-panels\.mjs$/, ['panels', 'featured']],
  [/^app\/scripts\/check-(reader-feedback|book-transition)\.mjs$/, ['panels']],
  [/^app\/scripts\/check-library-public\.mjs$/, ['library']],
  [/^app\/scripts\/check-featured-preview\.mjs$/, ['featured']],
  [/^app\/scripts\/check-inline-audio-loading\.mjs$/, ['audio']],
  [/^app\/scripts\/check-shakespeare-layout\.mjs$/, ['shakespeare']],
  [/^app\/scripts\/check-(hyphenation-hardening|page-break-lines)\.mjs$/, ['typeset']],
  // The reading benchmark has its own job, run on every change.
  [/^benchmarks\//, []],
  // Writing about the code: unit tests (and the docs check) only.
  [/^docs\/.*\.(md|png|jpe?g|gif|svg|txt)$/, []],
  [/^(?!app\/public\/).*\.md$/, []],
]

export function suitesFor(files) {
  if (!files.length) return { suites: ALL, reason: 'no changed files found: everything' }
  const need = new Set()
  for (const file of files) {
    const rule = RULES.find(([pattern]) => pattern.test(file))
    if (!rule) return { suites: ALL, reason: `${file} is not classified: everything` }
    if (rule[1] === FULL) return { suites: ALL, reason: `${file} runs everything` }
    for (const suite of rule[1]) need.add(suite)
  }
  return { suites: SUITES.filter(s => need.has(s)), reason: `${files.length} file(s): ${need.size ? [...need].join(', ') : 'unit tests only'}` }
}

function changedFiles() {
  try {
    return execFileSync('git', ['diff', '--name-only', 'HEAD^1', 'HEAD'], { encoding: 'utf8' }).split('\n').filter(Boolean)
  } catch { return [] }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const at = process.argv.indexOf('--files')
  const event = process.env.GITHUB_EVENT_NAME || (at > 0 ? 'pull_request' : '')
  const { suites, reason } = event !== 'pull_request'
    ? { suites: ALL, reason: `${event || 'not a pull request'}: everything` }
    : suitesFor(at > 0 ? process.argv.slice(at + 1) : changedFiles())
  for (const suite of SUITES) console.log(`${suite}=${suites.includes(suite)}`)
  console.log(`reason=${reason}`)
}
