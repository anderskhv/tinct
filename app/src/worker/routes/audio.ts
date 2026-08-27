import { jsonResponse } from '../lib/responses'

export type AudioEnv = {
  AUDIO_BUCKET?: R2Bucket
  ASSETS?: { fetch: (request: Request) => Promise<Response> }
}

/** Validates a path parameter for audio endpoints.
 * Accepts paths used by the audio engine:
 *   - `disclaimer-{lang}.mp3` (single segment, root-level files)
 *   - `{bookId}/{edition}/ch{N}/{file}.{ext}` (the canonical per-chapter layout)
 *   - `{bookId}/{edition}/{file}.{ext}` (legacy flat layout)
 * Each segment is letters/digits/dots/hyphens/underscores. Rejects path
 * traversal (`..`), absolute paths, query/hash injection. */
function isValidAudioPath(p: string): boolean {
  if (!p || p.length > 200) return false
  if (p.includes('..') || p.startsWith('/') || p.includes('//')) return false
  const segment = '[a-zA-Z0-9._-]+'
  return new RegExp(`^${segment}(?:/${segment}){0,3}$`).test(p)
}

export async function handleAudioManifest(request: Request, env: AudioEnv): Promise<Response> {
  const url = new URL(request.url)
  const path = url.searchParams.get('path')
  if (!isValidAudioPath(path || '')) return jsonResponse({ error: 'Invalid path' }, 400, request)
  if (!env.AUDIO_BUCKET) return jsonResponse({ error: 'Audio unavailable' }, 503, request)

  const object = await env.AUDIO_BUCKET.get(path!)
  if (!object) return new Response('Not found', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } })

  return new Response(object.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

export async function handleAudioFile(request: Request, env: AudioEnv): Promise<Response> {
  const url = new URL(request.url)
  const path = url.searchParams.get('path')
  if (!isValidAudioPath(path || '')) return jsonResponse({ error: 'Invalid path' }, 400, request)
  if (!env.AUDIO_BUCKET) return jsonResponse({ error: 'Audio unavailable' }, 503, request)

  const rangeHeader = request.headers.get('range')
  if (rangeHeader) {
    const head = await env.AUDIO_BUCKET.head(path!)
    if (!head) return new Response('Not found', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } })

    const parsed = parseByteRange(rangeHeader, head.size)
    if (!parsed) {
      return new Response('Invalid range', {
        status: 416,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Range': `bytes */${head.size}`,
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    const object = await env.AUDIO_BUCKET.get(path!, {
      range: { offset: parsed.start, length: parsed.end - parsed.start + 1 },
    })
    if (!object) return new Response('Not found', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } })

    return new Response(object.body, {
      status: 206,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(parsed.end - parsed.start + 1),
        'Content-Range': `bytes ${parsed.start}-${parsed.end}/${head.size}`,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=604800',
      },
    })
  }

  const object = await env.AUDIO_BUCKET.get(path!)
  if (object) {
    const isJson = path!.endsWith('.json')
    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type': isJson ? 'application/json' : 'audio/mpeg',
        'Content-Length': String(object.size),
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': isJson ? 'public, max-age=86400' : 'public, max-age=604800',
      },
    })
  }

  const fromAssets = await readAudioAsset(request, env, path!)
  if (fromAssets) return fromAssets
  return new Response('Not found', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } })
}

/** Word sidecars may live in worker assets when R2 has none. Same /api/audio-file path. */
export async function readAudioAsset(request: Request, env: AudioEnv, path: string): Promise<Response | null> {
  if (!env.ASSETS || !path.endsWith('/words.json')) return null
  const asset = await env.ASSETS.fetch(new Request(new URL(`/audio/${path}`, request.url)))
  if (!asset.ok) return null
  return new Response(asset.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

export function parseByteRange(rangeHeader: string, size: number): { start: number; end: number } | null {
  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/)
  if (!match || size <= 0) return null

  const startRaw = match[1]
  const endRaw = match[2]
  if (!startRaw && !endRaw) return null

  let start: number
  let end: number

  if (!startRaw) {
    const suffixLength = Number(endRaw)
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null
    start = Math.max(0, size - suffixLength)
    end = size - 1
  } else {
    start = Number(startRaw)
    end = endRaw ? Number(endRaw) : size - 1
  }

  if (!Number.isInteger(start) || !Number.isInteger(end)) return null
  if (start < 0 || end < start || start >= size) return null

  return { start, end: Math.min(end, size - 1) }
}
