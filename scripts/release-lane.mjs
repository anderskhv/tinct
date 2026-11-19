#!/usr/bin/env node
// Which release path a push to main may take (deploy.yml `gate`), from the files it changes since the nearest
// first-parent ancestor whose tree a passing verify run recorded.
//
//   git diff --name-only --no-renames -z <verified> HEAD | node scripts/release-lane.mjs
//   node scripts/release-lane.mjs --files a b c
//
// Prints `lane=page|full`, then `reason=…`. `page` (the page lane, Anders 19 Nov 2026): every file is a standalone
// static page, that page's own unit test, or writing about the code. The deploy job then still runs `npm test`,
// the build, verify-bundle, every acceptance group and the automatic rollback; it only stops waiting for main's
// full verify run (the reader's browser suites). Anything else, and an empty list, is `full`.
// Use --no-renames: a rename would otherwise list only its destination and hide the file it moved out of.
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

// Standalone pages: served as-is from app/public, no reader code, no Worker route of their own.
export const PAGE_FILES = [
  /^app\/public\/try\.html$/,
  /^app\/public\/lab\/try\/.+$/,
  /^app\/public\/landing\.html$/,
  /^app\/public\/modern-english[^/]*\.(html|js|css)$/,
  /^app\/public\/modern-english[^/]*\/.+$/,
  /^app\/public\/byob\.(html|js)$/,
  /^app\/public\/privacy\.html$/,
  // Those pages' own unit tests (npm test runs them in the deploy job before go-live).
  /^app\/src\/(try|landing|byob|privacy|modernEnglish)Page\.test\.ts$/,
  // Writing about the code: Markdown at the root (DECISIONS.md, AGENTS.md, …) and docs/ (not docs/margin/, which
  // holds the margin's layout check).
  /^[^/]+\.md$/,
  /^docs\/(?!margin\/).+\.(md|png|jpe?g|gif|svg|webp|txt)$/,
]

export function laneFor(files) {
  if (!files.length) return { lane: 'full', reason: 'no changed files found: full' }
  for (const file of files) {
    if (!PAGE_FILES.some(pattern => pattern.test(file))) return { lane: 'full', reason: `${file} is not a standalone page or docs: full` }
  }
  return { lane: 'page', reason: `${files.length} file(s), all standalone pages or docs` }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const at = process.argv.indexOf('--files')
  const files = at > 0
    ? process.argv.slice(at + 1)
    : readFileSync(0, 'utf8').split(/[\0\n]/).filter(Boolean)
  const { lane, reason } = laneFor(files)
  console.log(`lane=${lane}`)
  console.log(`reason=${reason}`)
}
