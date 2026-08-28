import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import {
  parseLabPositionState,
  type LabPositionState,
} from '../../lab/labPosition'

export type LabPositionEnv = {
  RATE_LIMIT?: KVNamespace
}

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: LabPositionEnv, request: Request) => Promise<VerifiedUser | null>

const KV_PREFIX = 'lab-position:'
const MAX_BODY_BYTES = 16_384

function kvKey(userId: string): string {
  return `${KV_PREFIX}${userId}`
}

async function readStored(env: LabPositionEnv, userId: string): Promise<LabPositionState> {
  const raw = await env.RATE_LIMIT?.get(kvKey(userId), 'json')
  return parseLabPositionState(raw, userId)
}

export async function handleLabPosition(
  request: Request,
  env: LabPositionEnv,
  verifyUser: VerifyUser,
): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'PUT') {
    return jsonResponse({ error: 'Method not allowed' }, 405, request)
  }

  const user = await verifyUser(env, request)
  if (!user || !isValidUUID(user.id)) {
    return jsonResponse({ error: 'Unauthorized' }, 401, request)
  }

  if (request.method === 'GET') {
    return jsonResponse(await readStored(env, user.id), 200, request)
  }

  if (!env.RATE_LIMIT) {
    return jsonResponse({ error: 'Not configured' }, 503, request)
  }

  const rawText = await request.text()
  if (rawText.length > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Payload too large' }, 413, request)
  }

  let parsed: unknown
  try {
    parsed = rawText ? JSON.parse(rawText) : null
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request)
  }

  const incoming = parseLabPositionState(parsed, user.id)
  const current = await readStored(env, user.id)
  // Chapter existence is a client concern. Server last-write-wins per biblical
  // book so two devices cannot clobber each other's Romans/Genesis pins.
  const stored = mergeWithoutChapterGate(current, incoming)
  await env.RATE_LIMIT.put(kvKey(user.id), JSON.stringify(stored))
  return jsonResponse(stored, 200, request)
}

function mergeWithoutChapterGate(local: LabPositionState, cloud: LabPositionState): LabPositionState {
  const books = { ...local.books }
  for (const [bookId, incoming] of Object.entries(cloud.books)) {
    if (incoming.bookId !== bookId) continue
    const existing = books[bookId]
    if (!existing || incoming.updatedAt > existing.updatedAt || (incoming.updatedAt === existing.updatedAt && incoming.rev > existing.rev)) {
      books[bookId] = incoming
    }
  }
  let lastSettledBookId = local.lastSettledBookId
  let lastSettledAt = local.lastSettledAt
  if (cloud.lastSettledAt > local.lastSettledAt && cloud.lastSettledBookId && books[cloud.lastSettledBookId]) {
    lastSettledBookId = cloud.lastSettledBookId
    lastSettledAt = cloud.lastSettledAt
  }
  return {
    books,
    lastSettledBookId,
    lastSettledAt,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
    deviceId: cloud.deviceId || local.deviceId,
  }
}

export { mergeWithoutChapterGate }
