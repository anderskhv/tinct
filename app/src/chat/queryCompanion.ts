import { apiUrl } from '../utils/apiUrl'
import type { CompanionSystemBlock } from './companionPrompt'

export interface CompanionMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface QueryCompanionInput {
  authToken: string
  system: string | CompanionSystemBlock[]
  messages: CompanionMessage[]
  maxTokens?: number
}

export interface QueryCompanionResult {
  text: string
  status: number
  error?: string
}

/**
 * Same /api/chat path production typed Chat uses. Lab Talk and typed Ask
 * call this so Claude, not Realtime, writes the companion answer.
 */
export async function queryCompanion(input: QueryCompanionInput): Promise<QueryCompanionResult> {
  const response = await fetch(apiUrl('/api/chat'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.authToken}`,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: input.maxTokens ?? 1024,
      system: input.system,
      messages: input.messages,
    }),
  })

  const data = await response.json().catch(() => ({})) as {
    error?: { message?: string } | string
    content?: Array<{ text?: string }>
  }

  if (!response.ok) {
    const error = typeof data.error === 'string'
      ? data.error
      : data.error?.message || 'Companion unavailable'
    return { text: '', status: response.status, error }
  }

  return {
    text: data.content?.[0]?.text?.trim() || '',
    status: response.status,
  }
}
