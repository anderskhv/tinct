#!/usr/bin/env node
/**
 * Launcher for the TypeScript aligner. Node 22+ strips types.
 *
 * Odyssey Book 1 (Butler original-en) on Anders's Mac:
 *   see align-paragraph-words.md
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const cli = resolve(here, '../src/audio/alignParagraphWordsCli.ts')
const result = spawnSync(
  process.execPath,
  ['--experimental-strip-types', '--no-warnings=ExperimentalWarning', cli, ...process.argv.slice(2)],
  { stdio: 'inherit' },
)
process.exit(result.status ?? 1)
