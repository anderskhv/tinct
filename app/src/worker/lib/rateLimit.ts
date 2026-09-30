import type { UsageCoordinator } from '../usageCoordinator'

export type UsageEnv = { USAGE_COORDINATOR?: DurableObjectNamespace<UsageCoordinator> }

/**
 * Route handlers take this shape. The second argument is kept for handler
 * compatibility and is not used: counting lives in the usage coordinator.
 */
export type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export const RATE_LIMIT_WINDOW_MS = 60_000
export const RATE_LIMIT_MAX = 10

function logRateLimitUnavailable(reason: string): void {
  console.warn(JSON.stringify({ event: 'rate_limit_unavailable', reason }))
}

/**
 * Atomic fixed-window limiter. Fails closed: a missing binding or a
 * coordinator error refuses the request instead of letting it through.
 */
export function createRateLimiter(env: UsageEnv): CheckRateLimit {
  return async (key, _kv, maxRequests = RATE_LIMIT_MAX) => {
    const namespace = env.USAGE_COORDINATOR
    if (!namespace) {
      logRateLimitUnavailable('binding_missing')
      return false
    }
    try {
      return await namespace.getByName(`rl:${key}`).hit(maxRequests, RATE_LIMIT_WINDOW_MS)
    } catch {
      logRateLimitUnavailable('coordinator_error')
      return false
    }
  }
}
