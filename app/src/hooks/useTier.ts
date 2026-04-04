import { useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '../services/supabase'
import type { Tier, Feature, UserProfile } from '../types'
import { FEATURE_ACCESS } from '../types'

interface UseTierReturn {
  tier: Tier
  isTrial: boolean
  trialDaysRemaining: number
  canUse: (feature: Feature) => boolean
}

export function useTier(user: User | null, profile: UserProfile | null): UseTierReturn {
  return useMemo(() => {
    // Dev mode: no Supabase configured → premium (unblocked dev)
    if (!isSupabaseConfigured()) {
      return {
        tier: 'premium' as Tier,
        isTrial: false,
        trialDaysRemaining: 0,
        canUse: () => true,
      }
    }

    // No user → 'none'
    if (!user) {
      const tier: Tier = 'none'
      return {
        tier,
        isTrial: false,
        trialDaysRemaining: 0,
        canUse: (feature: Feature) => FEATURE_ACCESS[feature].includes(tier),
      }
    }

    // Active subscription → premium
    if (profile?.subscription_status === 'active') {
      return {
        tier: 'premium' as Tier,
        isTrial: false,
        trialDaysRemaining: 0,
        canUse: () => true,
      }
    }

    // Canceled subscription but still within paid period → premium
    if (profile?.subscription_status === 'canceled' && profile?.subscription_period_end) {
      const periodEnd = new Date(profile.subscription_period_end)
      if (periodEnd > new Date()) {
        return {
          tier: 'premium' as Tier,
          isTrial: false,
          trialDaysRemaining: 0,
          canUse: () => true,
        }
      }
    }

    // Check trial: account created within 30 days
    const createdAt = user.created_at ? new Date(user.created_at) : null
    if (createdAt) {
      const now = new Date()
      const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceCreation <= 30) {
        const remaining = Math.ceil(30 - daysSinceCreation)
        return {
          tier: 'premium' as Tier,
          isTrial: true,
          trialDaysRemaining: remaining,
          canUse: () => true,
        }
      }
    }

    // Authenticated but no subscription, trial expired → free
    const tier: Tier = 'free'
    return {
      tier,
      isTrial: false,
      trialDaysRemaining: 0,
      canUse: (feature: Feature) => FEATURE_ACCESS[feature].includes(tier),
    }
  }, [user, profile])
}
