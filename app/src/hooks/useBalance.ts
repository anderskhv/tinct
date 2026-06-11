import { useState, useCallback, useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
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

interface UseBalanceOptions {
  authLoading?: boolean
  likelyAuthenticated?: boolean
}

export function useBalance(
  session: Session | null,
  profile: UserProfile | null,
  user?: User | null,
  options: UseBalanceOptions = {},
): UseBalanceReturn {
  const authPendingForKnownUser = !session && options.authLoading && options.likelyAuthenticated
  const isAnonymous = !session && !authPendingForKnownUser

  const [localDeducted, setLocalDeducted] = useState(0)

  // Reset local deductions when profile updates from server
  useEffect(() => {
    setLocalDeducted(0)
  }, [profile?.messages_used_this_period, profile?.message_balance])

  // Mirror worker.ts: 30-day Premium trial from account creation
  const createdAt = user?.created_at ? new Date(user.created_at) : null
  const isInTrial = createdAt
    ? (30 - Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))) > 0
    : false

  const isSubscribed = authPendingForKnownUser ||
    profile?.subscription_status === 'active' ||
    (profile?.subscription_status === 'canceled' &&
     !!profile?.subscription_period_end &&
     new Date(profile.subscription_period_end) > new Date()) ||
    isInTrial

  const monthlyUsed = (profile?.messages_used_this_period || 0) + localDeducted
  const monthlyRemaining = isSubscribed ? Math.max(0, MONTHLY_MESSAGE_LIMIT - monthlyUsed) : 0
  const messageBalance = Math.max(0, (profile?.message_balance || 0) - Math.max(0, localDeducted - Math.max(0, MONTHLY_MESSAGE_LIMIT - (profile?.messages_used_this_period || 0))))

  const messagesRemaining = authPendingForKnownUser
    ? MONTHLY_MESSAGE_LIMIT
    : monthlyRemaining + messageBalance
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
