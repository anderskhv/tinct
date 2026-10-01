// Local stand-in for the xAI TTS endpoint and Supabase auth, for muted pilot QA.
// Never contacts a real provider. Usage: node narration-mock-server.mjs <port>
// Control: POST /__control {"failNext": n} makes the next n TTS calls answer 503.
import http from 'node:http'
import { execFileSync } from 'node:child_process'

const port = Number(process.argv[2] || 9911)
export const SIGNED_IN_TOKEN = 'tinct-qa-signed-in'
const USER = { id: '22222222-2222-4222-8222-222222222222', email: 'qa-reader@example.com' }
const mp3Cache = new Map()
const state = { ttsCalls: [], failNext: 0 }

function silentMp3(seconds) {
  const key = seconds.toFixed(1)
  if (!mp3Cache.has(key)) {
    mp3Cache.set(key, execFileSync('ffmpeg', ['-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono',
      '-t', key, '-c:a', 'libmp3lame', '-b:a', '48k', '-f', 'mp3', 'pipe:1'], { maxBuffer: 64 << 20 }))
  }
  return mp3Cache.get(key)
}

function mp3FrameSeconds(bytes) {
  // MPEG-2 Layer III at 24 kHz: 576 samples per frame. Count frames to match the Worker's measurement.
  let frames = 0
  for (let i = 0; i + 4 <= bytes.length;) {
    if (bytes[i] === 0xff && (bytes[i + 1] & 0xe0) === 0xe0) {
      const bitrate = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160][bytes[i + 2] >> 4]
      const padding = (bytes[i + 2] >> 1) & 1
      const length = Math.floor(72 * bitrate * 1000 / 24000) + padding
      if (!bitrate || length < 4) { i++; continue }
      frames++; i += length
    } else i++
  }
  return frames * 576 / 24000
}

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type })
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body))
}

const server = http.createServer(async (req, res) => {
  let raw = ''
  for await (const part of req) raw += part
  const url = new URL(req.url, 'http://local')
  if (url.pathname === '/__control') {
    if (req.method === 'POST') Object.assign(state, JSON.parse(raw || '{}'))
    return send(res, 200, { ttsCalls: state.ttsCalls, failNext: state.failNext })
  }
  if (url.pathname === '/auth/v1/user') {
    return req.headers.authorization === `Bearer ${SIGNED_IN_TOKEN}` ? send(res, 200, USER) : send(res, 401, { error: 'invalid' })
  }
  if (url.pathname.startsWith('/rest/v1/')) return send(res, req.method === 'GET' ? 200 : 201, req.method === 'GET' ? [] : '')
  if (url.pathname === '/v1/tts' && req.method === 'POST') {
    const body = JSON.parse(raw)
    state.ttsCalls.push({ at: new Date().toISOString(), voice: body.voice_id, chars: body.text.length, text: body.text.slice(0, 60) })
    if (state.failNext > 0) { state.failNext--; return send(res, 503, { error: 'mock busy' }) }
    const audio = silentMp3(Math.max(1, body.text.length / 14))
    const duration = mp3FrameSeconds(audio)
    const chars = Array.from(body.text)
    const step = duration / chars.length
    return send(res, 200, { audio: audio.toString('base64'), duration,
      audio_timestamps: { graph_chars: chars, graph_times: chars.map((_, i) => [i * step, (i + 1) * step]) } })
  }
  send(res, 404, { error: 'not mocked' })
})
server.listen(port, '127.0.0.1', () => console.log(`narration mock on ${port}`))
