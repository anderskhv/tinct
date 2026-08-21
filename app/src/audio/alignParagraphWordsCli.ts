/**
 * Align paragraph MP3s to edition text with Whisper word timestamps.
 * Does not recut audio. Writes a words.json sidecar (and optionally
 * patches manifest.json). Interpolation is rejected.
 *
 * Run via app/scripts/align-paragraph-words.mjs
 */

import { spawnSync } from 'node:child_process'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  alignParagraphWords,
  assertProductionAlignerBackend,
  sidecarFromManifest,
  mergeWordsIntoManifest,
} from './alignWords'
import type { AudioManifest, AudioWord } from './wordTimings'
import { parseAudioWords } from './wordTimings'

type EditionFile = {
  chapters: Array<{ number: number; title?: string; paragraphs: string[] }>
}

function die(message: string, code = 1): never {
  console.error(message)
  process.exit(code)
}

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      out[key] = true
    } else {
      out[key] = next
      i++
    }
  }
  return out
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function repoRootFromHere(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), '../..')
}

function loadFixtureWords(fixturePath: string): AudioWord[] {
  const raw = readJson<unknown>(fixturePath)
  const words = Array.isArray(raw)
    ? parseAudioWords(raw)
    : parseAudioWords((raw as { words?: unknown }).words)
  if (!words) die(`Fixture ${fixturePath} has no usable words[]`)
  return words
}

function runWhisper(audioPath: string, language: string, helperPath: string): AudioWord[] {
  const result = spawnSync('python3', [helperPath, audioPath, '--language', language], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    die(result.stderr || `Whisper helper failed for ${audioPath}`, result.status ?? 2)
  }
  const words = parseAudioWords(JSON.parse(result.stdout))
  if (!words) die(`Whisper helper returned no word windows for ${audioPath}`)
  return words
}

async function fetchAudio(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, buf)
}

export async function main(argv = process.argv.slice(2)): Promise<void> {
  const args = parseArgs(argv)
  const backend = String(args.backend || 'whisper')
  assertProductionAlignerBackend(backend)

  const book = String(args.book || '')
  const edition = String(args.edition || '')
  const chapter = Number(args.chapter)
  if (!book || !edition || !Number.isInteger(chapter) || chapter < 1) {
    die('Usage: --book odyssey --edition original-en --chapter 1 [--audio-dir DIR] [--backend whisper|fixture]')
  }

  const root = String(args.root || repoRootFromHere())
  const editionJson = String(
    args['edition-json']
    || join(root, 'public/data/editions', `${book}-${edition}.json`),
  )
  const audioDir = String(
    args['audio-dir']
    || join(root, 'tts/audio', book, edition, `ch${chapter}`),
  )
  const language = String(args.language || (edition.endsWith('-da') ? 'da' : 'en'))
  const limit = args.limit !== undefined ? Number(args.limit) : Infinity
  const fetchMissing = Boolean(args['fetch-audio'])
  const inManifest = Boolean(args['in-manifest'])
  const origin = String(args.origin || 'https://tinct.app')

  if (!existsSync(editionJson)) die(`Edition JSON not found: ${editionJson}`)
  const editionData = readJson<EditionFile>(editionJson)
  const chapterEntry = editionData.chapters.find(ch => ch.number === chapter)
  if (!chapterEntry) die(`Chapter ${chapter} missing from ${editionJson}`)

  const manifestPath = join(audioDir, 'manifest.json')
  if (!existsSync(manifestPath) && fetchMissing) {
    const url = `${origin}/api/audio-manifest?path=${encodeURIComponent(`${book}/${edition}/ch${chapter}/manifest.json`)}`
    await fetchAudio(url, manifestPath)
  }
  if (!existsSync(manifestPath)) {
    die(
      `Chapter manifest not found: ${manifestPath}\n`
      + 'Copy Odyssey Book 1 audio from Anders\'s Mac '
      + `(app/tts/audio/${book}/${edition}/ch${chapter}) `
      + 'or pass --fetch-audio to pull via the public worker API.',
    )
  }

  const manifest = readJson<AudioManifest>(manifestPath)
  const helperPath = String(
    args['whisper-helper']
    || join(root, 'scripts/whisper-word-timestamps.py'),
  )
  const fixturePath = args.fixture ? String(args.fixture) : join(audioDir, 'whisper-words.json')

  const wordsByParagraph = new Map<number, AudioWord[]>()
  let alignedCount = 0

  for (const para of manifest.paragraphs) {
    if (para.paragraph < 0) continue
    if (alignedCount >= limit) break
    const source = chapterEntry.paragraphs[para.paragraph]
    if (typeof source !== 'string' || !source.trim()) continue

    const audioPath = join(audioDir, para.file)
    if (!existsSync(audioPath) && fetchMissing) {
      const url = `${origin}/api/audio-file?path=${encodeURIComponent(`${book}/${edition}/ch${chapter}/${para.file}`)}`
      try {
        await fetchAudio(url, audioPath)
      } catch (err) {
        console.warn(`Skip p${para.paragraph}: ${err}`)
        continue
      }
    }
    if (!existsSync(audioPath)) {
      console.warn(`Skip p${para.paragraph}: missing ${audioPath}`)
      continue
    }

    let aligned: AudioWord[]
    if (backend === 'fixture') {
      const perFile = join(audioDir, para.file.replace(/\.[^.]+$/, '') + '.whisper.json')
      const path = existsSync(perFile) ? perFile : fixturePath
      if (!existsSync(path)) die(`Fixture words not found: ${path}`)
      aligned = loadFixtureWords(path)
    } else if (backend === 'whisper') {
      aligned = runWhisper(audioPath, language, helperPath)
    } else {
      die(`Unknown backend "${backend}". Use whisper or fixture.`)
    }

    const mapped = alignParagraphWords(source, aligned, para.duration)
    if (mapped.length === 0) {
      console.warn(`Skip p${para.paragraph}: aligner coverage too low`)
      continue
    }
    wordsByParagraph.set(para.paragraph, mapped)
    alignedCount += 1
    console.log(`aligned p${para.paragraph}: ${mapped.length} words ← ${para.file}`)
  }

  const merged = mergeWordsIntoManifest(manifest, wordsByParagraph)
  const sidecar = sidecarFromManifest(merged, { bookId: book, editionKey: edition })
  const sidecarPath = String(args['out-sidecar'] || join(audioDir, 'words.json'))
  mkdirSync(dirname(sidecarPath), { recursive: true })
  writeFileSync(sidecarPath, JSON.stringify(sidecar, null, 2) + '\n')
  console.log(`wrote sidecar ${sidecarPath} (${sidecar.paragraphs.length} paragraphs)`)

  if (inManifest) {
    writeFileSync(manifestPath, JSON.stringify(merged, null, 2) + '\n')
    console.log(`patched ${manifestPath}`)
  }
}

const launchedDirectly = typeof process.argv[1] === 'string'
  && fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (launchedDirectly) {
  main().catch(err => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
