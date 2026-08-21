import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, cpSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appRoot = fileURLToPath(new URL('../..', import.meta.url))
const launcher = join(appRoot, 'scripts/align-paragraph-words.mjs')
const fixtureDir = join(appRoot, 'scripts/fixtures/word-align')

function run(args: string[]) {
  return spawnSync(process.execPath, [launcher, ...args], {
    encoding: 'utf8',
    cwd: appRoot,
  })
}

describe('align-paragraph-words CLI', () => {
  it('rejects interpolation backends without writing output', () => {
    const result = run([
      '--book', 'odyssey',
      '--edition', 'original-en',
      '--chapter', '1',
      '--backend', 'interpolate',
    ])
    expect(result.status).not.toBe(0)
    expect(result.stderr).toMatch(/not a production path/)
  })

  it('writes a sidecar from the checked-in clip + Whisper fixture', () => {
    const work = mkdtempSync(join(tmpdir(), 'tinct-align-'))
    cpSync(fixtureDir, work, { recursive: true })
    const sidecarPath = join(work, 'words-out.json')
    const result = run([
      '--book', 'odyssey',
      '--edition', 'original-en',
      '--chapter', '1',
      '--edition-json', join(work, 'odyssey-original-en.json'),
      '--audio-dir', work,
      '--backend', 'fixture',
      '--out-sidecar', sidecarPath,
    ])
    expect(result.status, result.stderr || result.stdout).toBe(0)
    expect(existsSync(sidecarPath)).toBe(true)
    const sidecar = JSON.parse(readFileSync(sidecarPath, 'utf8'))
    expect(sidecar.chapter).toBe(1)
    expect(sidecar.bookId).toBe('odyssey')
    expect(sidecar.editionKey).toBe('original-en')
    expect(sidecar.paragraphs[0].words.map((w: { text: string }) => w.text)).toEqual([
      'Tell', 'me,', 'O', 'Muse.',
    ])
    expect(sidecar.paragraphs[0].words[0].start).toBe(0.08)
    const rawManifest = JSON.parse(readFileSync(join(work, 'manifest.json'), 'utf8'))
    expect(rawManifest.paragraphs[0].words).toBeUndefined()
  })
})
