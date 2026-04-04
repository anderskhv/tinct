import { useState, useCallback, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { UserProfile } from '../types'

const MONTHLY_MESSAGE_LIMIT = 100

interface UseBalanceReturn {
  /** Messages remaining (monthly quota + purchased packs) */
  messagesRemaining: number
  /** Monthly quota remaining (out of 100) */
  monthlyRemaining: number
  /** Extra messages from purchased packs */
  messageBalance: number
  /** Whether user has at least 1 message remaining */
  hasBalance: boolean
  /** Deduct one message after a successful API call */
  deductUsage: () => void
  /** Whether this is an anonymous (non-authenticated) user */
  isAnonymous: boolean
  /** Whether the user has an active subscription */
  isSubscribed: boolean
}

export function useBalance(
  session: Session | null,
  profile: UserProfile | null,
): UseBalanceReturn {
  const isAnonymous = !session

  const [localDeducted, setLocalDeducted] = useState(0)

  // Reset local deductions when profile updates from server
  useEffect(() => {
    setLocalDeducted(0)
  }, [profile?.messages_used_this_period, profile?.message_balance])

  const isSubscribed = profile?.subscription_status === 'active' ||
    (profile?.subscription_status === 'canceled' &&
     !!profile?.subscription_period_end &&
     new Date(profile.subscription_period_end) > new Date())

  const monthlyUsed = (profile?.messages_used_this_period || 0) + localDeducted
  const monthlyRemaining = isSubscribed ? Math.max(0, MONTHLY_MESSAGE_LIMIT - monthlyUsed) : 0
  const messageBalance = Math.max(0, (profile?.message_balance || 0) - Math.max(0, localDeducted - Math.max(0, MONTHLY_MESSAGE_LIMIT - (profile?.messages_used_this_period || 0))))

  const messagesRemaining = monthlyRemaining + messageBalance
  const hasBalance = isAnonymous ? false : messagesRemaining > 0

  const deductUsage = useCallback(() => {
    if (isAnonymous) return
    setLocalDeducted(prev => prev + 1)
  }, [isAnonymous])

  return {
    messagesRemaining,
    monthlyRemaining,
    messageBalance,
    hasBalance,
    deductUsage,
    isAnonymous,
    isSubscribed,
  }
}
