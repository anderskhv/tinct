import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { grokWordSegments } from '../src/narration/grokTimestamps.ts'

const text = 'I paid $5 in 2026. “Do not fear,” she said—then paused. The café was quiet.'
const out = 'artifacts/grok-provider'
await fs.mkdir(out, { recursive: true })
const report = []
for (const voice of ['ara', 'helios', 'orion', 'eve']) {
  const started = performance.now()
  const response = await fetch('https://api.x.ai/v1/tts', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.XAI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice_id: voice, language: 'en', with_timestamps: true, text_normalization: true,
      output_format: { codec: 'mp3', sample_rate: 24000, bit_rate: 128000 }, speed: 1 }),
    signal: AbortSignal.timeout(90000),
  })
  assert.equal(response.status, 200, 'Grok HTTP status')
  const payload = await response.json()
  const latencyMs = Math.round(performance.now() - started)
  const words = grokWordSegments(payload, text)
  const audio = Buffer.from(payload.audio, 'base64')
  assert.ok(audio.length > 800)
  await fs.writeFile(out + '/' + voice + '.mp3', audio)
  await fs.writeFile(out + '/' + voice + '.json', JSON.stringify({ ...payload, audio: undefined, text, words, latencyMs }, null, 2))
  report.push({ voice, latencyMs, duration: payload.duration, audioBytes: audio.length, matchedText: true, words: words.length })
}
await fs.writeFile(out + '/report.json', JSON.stringify(report, null, 2))
console.log(JSON.stringify(report))
