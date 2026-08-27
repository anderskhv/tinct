import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import {
  emptyLabChatHistoryState,
  mergeLabChatHistoryStates,
  parseLabChatHistoryState,
  type LabChatHistoryState,
} from '../../lab/labTalkHistory'

export type LabChatHistoryEnv = {
  RATE_LIMIT?: KVNamespace
}

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: LabChatHistoryEnv, request: Request) => Promise<VerifiedUser | null>

const KV_PREFIX = 'lab-chat-history:'
const MAX_BODY_BYTES = 262_144

function kvKey(userId: string): string {
  return `${KV_PREFIX}${userId}`
}

async function readStored(env: LabChatHistoryEnv, userId: string): Promise<LabChatHistoryState> {
  const raw = await env.RATE_LIMIT?.get(kvKey(userId), 'json')
  return raw == null ? emptyLabChatHistoryState() : parseLabChatHistoryState(raw)
}

export async function handleLabChatHistory(
  request: Request,
  env: LabChatHistoryEnv,
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

  const incoming = parseLabChatHistoryState(parsed)
  const current = await readStored(env, user.id)
  const stored = mergeLabChatHistoryStates(current, incoming)
  await env.RATE_LIMIT.put(kvKey(user.id), JSON.stringify(stored))
  return jsonResponse(stored, 200, request)
}
