import { useState, useCallback, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { UserProfile } from '../types'

// Cost per message: ~$0.014 API cost, 2.5x markup = $0.034
const COST_PER_MESSAGE_CENTS = 3.4
const FREE_BALANCE_CENTS = 200 // $2.00 free tier

// Anonymous usage tracking (localStorage)
const ANON_USAGE_KEY = 'tinct:anon-usage-cents'

interface UseBalanceReturn {
  /** Remaining balance in cents */
  balanceCents: number
  /** Approximate messages remaining */
  messagesRemaining: number
  /** Whether user has sufficient balance for a message */
  hasBalance: boolean
  /** Deduct cost after a successful API call */
  deductUsage: (inputTokens: number, outputTokens: number) => void
  /** Whether this is an anonymous (non-authenticated) user */
  isAnonymous: boolean
}

function getAnonUsageCents(): number {
  try {
    return parseFloat(localStorage.getItem(ANON_USAGE_KEY) || '0')
  } catch {
    return 0
  }
}

function setAnonUsageCents(cents: number): void {
  try {
    localStorage.setItem(ANON_USAGE_KEY, String(cents))
  } catch {
    // ignore
  }
}

/** Calculate actual cost based on token counts. Sonnet pricing: $3/M input, $15/M output */
function calculateCostCents(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 300  // $3/M = 300 cents/M
  const outputCost = (outputTokens / 1_000_000) * 1500 // $15/M = 1500 cents/M
  const apiCost = inputCost + outputCost
  return apiCost * 2.5 // 2.5x markup
}

export function useBalance(
  session: Session | null,
  profile: UserProfile | null,
): UseBalanceReturn {
  const isAnonymous = !session

  // For authenticated users, balance comes from profile
  // For anonymous users, balance = FREE_BALANCE_CENTS - used
  const [anonUsed, setAnonUsed] = useState(getAnonUsageCents)

  // Refresh anon usage from localStorage on mount
  useEffect(() => {
    setAnonUsed(getAnonUsageCents())
  }, [])

  const balanceCents = isAnonymous
    ? Math.max(0, FREE_BALANCE_CENTS - anonUsed)
    : (profile?.token_balance_cents ?? 0)

  const messagesRemaining = Math.floor(balanceCents / COST_PER_MESSAGE_CENTS)
  const hasBalance = balanceCents >= COST_PER_MESSAGE_CENTS

  const deductUsage = useCallback((inputTokens: number, outputTokens: number) => {
    const cost = calculateCostCents(inputTokens, outputTokens)

    if (isAnonymous) {
      const newUsed = anonUsed + cost
      setAnonUsed(newUsed)
      setAnonUsageCents(newUsed)
    }
    // For authenticated users, the server deducts from profile.
    // We optimistically update local state — refreshProfile will sync.
  }, [isAnonymous, anonUsed])

  return {
    balanceCents,
    messagesRemaining,
    hasBalance,
    deductUsage,
    isAnonymous,
  }
}
