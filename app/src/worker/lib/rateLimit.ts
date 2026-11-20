import type { UsageCoordinator } from '../usageCoordinator'

export type UsageEnv = { USAGE_COORDINATOR?: DurableObjectNamespace<UsageCoordinator> }

/**
 * Route handlers take this shape. The second argument is kept for handler
 * compatibility and is not used: counting lives in the usage coordinator.
 */
export type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export const RATE_LIMIT_WINDOW_MS = 60_000
export const RATE_LIMIT_MAX = 10
/**
 * A signed-in reader's chat requests (`chat:{userId}`), raised from 10 on
 * 15 Oct 2026 (Anders). Explain, Define and the never-charged checks don't
 * count, and internal and test accounts are never limited (routes/chat.ts).
 * Source research keeps its own 6 a minute; signed-out lab chat keeps
 * RATE_LIMIT_MAX.
 */
export const CHAT_RATE_LIMIT_PER_MINUTE = 60

export class RateLimitUnavailableError extends Error {
  constructor() {
    super('Rate limit service unavailable')
    this.name = 'RateLimitUnavailableError'
  }
}

function logRateLimitUnavailable(reason: string, startedAt: number, error?: unknown): void {
  // Never log keys, exception messages or stacks: they can contain reader IDs/IPs.
  const flags = error && typeof error === 'object' ? error as Record<string, unknown> : {}
  console.warn(JSON.stringify({ event: 'rate_limit_unavailable', reason,
    elapsedMs: Math.max(0, Date.now() - startedAt),
    retryable: flags.retryable === true, overloaded: flags.overloaded === true, remote: flags.remote === true,
  }))
}

/**
 * Atomic fixed-window limiter. Fails closed: a missing binding or a
 * coordinator error refuses the request instead of letting it through.
 */
export function createRateLimiter(env: UsageEnv, options: { throwOnUnavailable?: boolean } = {}): CheckRateLimit {
  return async (key, _kv, maxRequests = RATE_LIMIT_MAX) => {
    const startedAt = Date.now()
    const namespace = env.USAGE_COORDINATOR
    if (!namespace) {
      logRateLimitUnavailable('binding_missing', startedAt)
      if (options.throwOnUnavailable) throw new RateLimitUnavailableError()
      return false
    }
    try {
      return await namespace.getByName(`rl:${key}`).hit(maxRequests, RATE_LIMIT_WINDOW_MS)
    } catch (error) {
      logRateLimitUnavailable('coordinator_error', startedAt, error)
      if (options.throwOnUnavailable) throw new RateLimitUnavailableError()
      return false
    }
  }
}
