/**
 * Live Fish Audio probe — the Stage 2 measurements for the pilot.
 *
 * Skipped unless FISH_AUDIO_API_KEY is in the environment. When it runs it
 * spends real money (a few thousand text bytes per voice), so it is never
 * part of `npm test` in CI. It narrates Odyssey Book 1 paragraphs 0 and 18
 * (the long quoted speech with names) with each configured voice, records
 * time to first byte / full response, bytes billed, and how many display
 * tokens Fish's alignment covers, and writes MP3 samples plus a JSON report
 * to output/narration-pilot/ for human audition.
 *
 *   NARRATION_LIVE_PROBE=1 FISH_AUDIO_API_KEY=… npx vitest run src/narration/narration.live.test.ts
 */
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  DEFAULT_NARRATION_SETTINGS,
  absoluteSegments,
  alignSegmentsToTokens,
  chunkNarrationText,
  narrationTextForParagraph,
  parseFishTimestampSse,
  utf8ByteLength,
  validateNarrationAsset,
} from './narrationCore'

// Opt in explicitly: the key alone must not turn `npm test` into a paid call.
const API_KEY = process.env.NARRATION_LIVE_PROBE === '1' ? process.env.FISH_AUDIO_API_KEY : undefined
const MODEL = process.env.NARRATION_MODEL || 's2.1-pro'
const VOICES = [
  { key: 'a', id: process.env.NARRATION_VOICE_A_ID || 'bbb58d698b5f46719fd04688dfac7359', label: 'Nathan' },
  { key: 'b', id: process.env.NARRATION_VOICE_B_ID || 'f6a19fe5ab494e1fa51bb1476d583a44', label: 'Abby' },
]
const PARAGRAPH_INDEXES = (process.env.NARRATION_PROBE_PARAGRAPHS || '0,18').split(',').map(Number)
const EDITION = process.env.NARRATION_PROBE_EDITION || 'original-en'
/** With NARRATION_PROBE_CHUNK=1 only each paragraph's first sentence group is narrated (what a reader waits for). */
const CHUNK_ONLY = process.env.NARRATION_PROBE_CHUNK === '1'

const describeLive = API_KEY ? describe : describe.skip

describeLive('Fish Audio live probe (spends money; needs NARRATION_LIVE_PROBE=1 and FISH_AUDIO_API_KEY)', () => {
  it('narrates Odyssey Book 1 sample paragraphs and measures latency, bytes and timing coverage', async () => {
    const edition = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../public/data/editions/odyssey-${EDITION}.json`), 'utf8')) as { chapters: Array<{ paragraphs: string[] }> }
    const outDir = path.resolve(__dirname, '../../../output/narration-pilot')
    fs.mkdirSync(outDir, { recursive: true })
    const report: Record<string, unknown>[] = []
    for (const voice of VOICES) {
      for (const index of PARAGRAPH_INDEXES) {
        const whole = narrationTextForParagraph(edition.chapters[0].paragraphs[index])
        const text = CHUNK_ONLY ? chunkNarrationText(whole)[0].text : whole
        const startedAt = performance.now()
        const response = await fetch('https://api.fish.audio/v1/tts/stream/with-timestamp', {
          method: 'POST',
          headers: { Authorization: `Bearer ${API_KEY}`, model: MODEL, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
          body: JSON.stringify({
            text, reference_id: voice.id, format: 'mp3', mp3_bitrate: DEFAULT_NARRATION_SETTINGS.mp3Bitrate,
            latency: DEFAULT_NARRATION_SETTINGS.latency, normalize: DEFAULT_NARRATION_SETTINGS.normalize,
            temperature: DEFAULT_NARRATION_SETTINGS.temperature, top_p: DEFAULT_NARRATION_SETTINGS.topP,
            prosody: { speed: DEFAULT_NARRATION_SETTINGS.speed }, chunk_length: DEFAULT_NARRATION_SETTINGS.chunkLength,
          }),
        })
        expect(response.status, `${voice.label} p${index}: ${await response.clone().text().catch(() => '')}`).toBe(200)
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let body = ''
        let firstAudioAt: number | null = null
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          body += decoder.decode(value, { stream: true })
          if (firstAudioAt == null && body.includes('"audio_base64":"')) firstAudioAt = performance.now()
        }
        const finishedAt = performance.now()
        const stream = parseFishTimestampSse(body)
        const absolute = absoluteSegments(stream.snapshots)
        const validation = validateNarrationAsset({ text, audio: stream.audio, reportedDuration: absolute.duration, segments: absolute.segments })
        const aligned = alignSegmentsToTokens(text.split(' '), absolute.segments, validation.duration)
        const sample = path.join(outDir, `odyssey-${EDITION}-ch1-p${index}${CHUNK_ONLY ? '-chunk0' : ''}-${voice.key}-${voice.label.toLowerCase()}-${MODEL}.mp3`)
        fs.writeFileSync(sample, stream.audio)
        fs.writeFileSync(sample.replace(/\.mp3$/, '.segments.json'), JSON.stringify({ text, segments: absolute.segments, words: aligned.words }, null, 2))
        report.push({
          voice: voice.label, voiceId: voice.id, model: MODEL, edition: EDITION, paragraph: index, unit: CHUNK_ONLY ? 'chunk0' : 'paragraph',
          textChars: text.length, textBytes: utf8ByteLength(text), costUsd: (utf8ByteLength(text) / 1_000_000) * 15,
          msToFirstAudioByte: firstAudioAt == null ? null : Math.round(firstAudioAt - startedAt),
          msToComplete: Math.round(finishedAt - startedAt),
          audioBytes: stream.audio.length, reportedDuration: absolute.duration, measuredDuration: validation.measuredDuration,
          sseEvents: stream.events, chunks: stream.snapshots.length, providerSegments: absolute.segments.length,
          tokens: aligned.alignment.expectedWords, matchedTokens: aligned.alignment.matchedWords, matchRatio: aligned.alignment.matchRatio,
          timingsUsable: validation.timingsUsable, validation: validation.reasons, sample,
        })
        expect(validation.ok, `${voice.label} p${index}: ${validation.reasons.join(',')}`).toBe(true)
      }
    }
    const reportPath = path.join(outDir, `probe-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(JSON.stringify(report, null, 2))
    console.log(`report: ${reportPath}`)
  }, 300_000)
})
