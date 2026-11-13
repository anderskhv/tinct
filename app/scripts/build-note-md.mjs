#!/usr/bin/env node
/**
 * Builds the margin frame's note formatting (public/lab/addbook/js/note-md.js) from the reader's own source
 * (src/lab/notes/noteMdFrame.ts, noteMarkdown.ts, noteEditor.ts), so both run the same rules. The frame is plain
 * classic scripts with no build step: this writes one IIFE that sets `window.TinctNoteMd` (on `globalThis` too, for
 * margin.js's unit tests). Run after changing those files:
 *
 *   node scripts/build-note-md.mjs
 *
 * src/lab/notes/noteMdFrame.test.ts fails when the built file is out of date.
 */
import { buildSync } from 'esbuild'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const NOTE_MD_OUT = path.join(app, 'public/lab/addbook/js/note-md.js')

export function buildNoteMd() {
  const result = buildSync({
    entryPoints: [path.join(app, 'src/lab/notes/noteMdFrame.ts')],
    bundle: true, write: false, format: 'iife', globalName: 'TinctNoteMd', target: 'es2019', charset: 'utf8',
    legalComments: 'none', minify: false, logLevel: 'silent',
  })
  const body = result.outputFiles[0].text
  return `// Built by scripts/build-note-md.mjs from src/lab/notes/noteMdFrame.ts. Do not edit: change the source and run it again.\n${body}(typeof self !== 'undefined' ? self : globalThis).TinctNoteMd = TinctNoteMd;\n`
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const next = buildNoteMd()
  let before = ''
  try { before = readFileSync(NOTE_MD_OUT, 'utf8') } catch { /* first build */ }
  if (before !== next) writeFileSync(NOTE_MD_OUT, next)
  console.log(before === next ? 'note-md.js is up to date' : 'wrote public/lab/addbook/js/note-md.js')
}
