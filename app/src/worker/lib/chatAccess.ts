export const MONTHLY_MESSAGE_LIMIT = 100

/**
 * Signed-in AI is open while the credit model is designed (Anders,
 * 2026-09-30): chat packs no longer exist, so the old message allowance
 * would only block readers. Rate limits, the guest ceiling and sign-in for
 * voice still apply. Set true to enforce the allowance again.
 */
export const AI_ALLOWANCE_ENFORCED = false

export type ChatProfile = {
  messages_used_this_period: number
  message_balance: number
  subscription_status: string | null
  subscription_period_end: string | null
  created_at: string | null
}

export function evaluateChatAccess(profile: ChatProfile | null, enforce = AI_ALLOWANCE_ENFORCED): { allowed: true } | { allowed: false; error: string } {
  if (!enforce || !profile) return { allowed: true }

  const accountCreatedAt = profile.created_at ? new Date(profile.created_at) : null
  const trialDaysRemaining = accountCreatedAt
    ? 30 - Math.floor((Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const isInTrial = trialDaysRemaining > 0
  const isSubscribed = profile.subscription_status === 'active' ||
    (profile.subscription_status === 'canceled' &&
     !!profile.subscription_period_end &&
     new Date(profile.subscription_period_end) > new Date()) ||
    isInTrial
  const monthlyRemaining = Math.max(0, MONTHLY_MESSAGE_LIMIT - (profile.messages_used_this_period || 0))
  const hasMessages = (isSubscribed && monthlyRemaining > 0) || (profile.message_balance || 0) > 0

  if (!hasMessages) {
    return { allowed: false, error: 'No messages remaining. Buy a chat pack to continue.' }
  }
  return { allowed: true }
}
