// Reader-playback check: drives the app's own follow code over a candidate or
// published sidecar and reports whether the reader would actually highlight
// words, paragraph by paragraph, across a swept playback timeline.
//
// verify_timings.py proves the sidecar agrees with the edition text at 0.85.
// It cannot prove the reader will use it: labFollow.alignTimedWordsToText
// requires an exact whitespace-token match against the RAW edition paragraph,
// and silently falls back to paragraph-level follow when that fails. A chapter
// that fails here would ship as "published" while highlighting nothing.
//
// Read-only. Takes its inputs from production plus a local candidate file.
//
//   node --experimental-strip-types tools/audio-highlight/playback_check.mjs \
//     candidates.json [report.json]
//
// Exits non-zero if any chapter would fail to highlight.

import { readFileSync, mkdtempSync, writeFileSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import the reader's follow code from app/src, unmodified. Node's type
// stripping cannot resolve TypeScript's extensionless specifiers, so the two
// files are staged into a temp directory with the specifier spelled out. The
// bytes are the app's own; nothing here is a second implementation.
const LAB = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'app', 'src', 'lab')
const staged = mkdtempSync(join(tmpdir(), 'tinct-follow-'))
copyFileSync(join(LAB, 'tokenGroupCoverage.ts'), join(staged, 'tokenGroupCoverage.ts'))
writeFileSync(join(staged, 'labFollow.ts'),
  readFileSync(join(LAB, 'labFollow.ts'), 'utf8')
    .replace("from './tokenGroupCoverage'", "from './tokenGroupCoverage.ts'"))
const {
  followParagraphFromManifest,
  mergeSidecarWords,
  followAtTime,
  paragraphDurationSeconds,
} = await import(join(staged, 'labFollow.ts'))

const BASE = 'https://tinct.app'

async function getJson(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'tinct-playback-check/1.0' } })
      if (response.ok) return await response.json()
      if (response.status < 500) return null
    } catch {}
    await new Promise(r => setTimeout(r, 400 * (attempt + 1)))
  }
  return null
}

const editionCache = new Map()
async function editionText(bookId, edition) {
  const key = `${bookId}-${edition}`
  if (!editionCache.has(key)) {
    editionCache.set(key, await getJson(`${BASE}/data/editions/${key}.json`))
  }
  return editionCache.get(key)
}

async function checkChapter({ bookId, edition, chapter, path }) {
  const key = `${bookId}/${edition}/ch${chapter}`
  const failures = []

  const text = await editionText(bookId, edition)
  const chapterEntry = (text?.chapters || []).find(c => c.number === chapter)
  if (!chapterEntry) return { key, failures: ['edition has no such chapter'] }
  const texts = (chapterEntry.paragraphs || []).map(p => (typeof p === 'string' ? p : p?.text || ''))

  const manifest = await getJson(
    `${BASE}/api/audio-manifest?path=${encodeURIComponent(`${key}/manifest.json`)}`)
  if (!manifest) return { key, failures: ['manifest unavailable'] }

  const sidecar = path
    ? JSON.parse(readFileSync(path, 'utf8'))
    : await getJson(`${BASE}/api/audio-file?path=${encodeURIComponent(`${key}/words.json`)}&timing=2`)
  if (!sidecar) return { key, failures: ['sidecar unavailable'] }

  // Exactly what the reader builds: manifest paragraphs, then sidecar merge.
  const byIndex = new Map()
  for (const entry of manifest.paragraphs || []) {
    if (typeof entry.paragraph === 'number' && entry.paragraph >= 0) byIndex.set(entry.paragraph, entry)
  }
  const base = texts.map((t, i) => followParagraphFromManifest(i, t, byIndex.get(i)))
  const merged = mergeSidecarWords(base, sidecar, chapter)

  // Every spoken paragraph must come out of the merge carrying word timings.
  const spoken = [...byIndex.keys()].sort((a, b) => a - b)
  const unhighlighted = spoken.filter(i => !(merged[i]?.words?.length > 0))
  if (unhighlighted.length) {
    failures.push(
      `reader drops word highlighting on ${unhighlighted.length}/${spoken.length} spoken paragraphs ` +
      `(first: ${unhighlighted.slice(0, 6).join(', ')})`)
  }

  // Sweep the chapter timeline and confirm the highlight advances in order.
  const playable = merged.filter(p => p.words?.length > 0 || byIndex.has(p.index))
  const total = playable.reduce((sum, p) => sum + (paragraphDurationSeconds(p) || 0), 0)
  let previous = null
  let wordTargets = 0
  let regressions = 0
  for (let t = 0; t <= total; t += 0.25) {
    const target = followAtTime(playable, t)
    if (target.kind === 'word') {
      wordTargets++
      if (previous && target.paragraphIndex === previous.paragraphIndex &&
          target.wordIndex < previous.wordIndex) regressions++
      previous = target
    }
  }
  if (total > 0 && wordTargets === 0) failures.push('playback sweep highlighted no words')
  if (regressions) failures.push(`highlight moved backwards ${regressions} times during playback`)

  return {
    key,
    failures,
    spokenParagraphs: spoken.length,
    highlightedParagraphs: spoken.length - unhighlighted.length,
    sweptSeconds: Number(total.toFixed(1)),
    wordTargets,
  }
}

const args = process.argv.slice(2)
const targets = JSON.parse(readFileSync(args[0], 'utf8'))
const results = []
for (const target of targets) {
  const result = await checkChapter(target)
  results.push(result)
  const verdict = result.failures.length ? 'FAIL' : 'pass'
  console.log(`${verdict.padEnd(5)} ${result.key}  ` +
    `${result.highlightedParagraphs ?? '?'}/${result.spokenParagraphs ?? '?'} paragraphs, ` +
    `${result.wordTargets ?? 0} word targets over ${result.sweptSeconds ?? 0}s`)
  for (const failure of result.failures) console.log(`        ${failure}`)
}
if (args[1]) {
  const { writeFileSync } = await import('node:fs')
  writeFileSync(args[1], JSON.stringify(results, null, 1))
}
const failed = results.filter(r => r.failures.length)
console.log(`\n${results.length - failed.length}/${results.length} chapters would highlight in the reader`)
process.exit(failed.length ? 1 : 0)
