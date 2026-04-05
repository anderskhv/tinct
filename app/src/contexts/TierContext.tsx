import { createContext, useContext, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { useTier } from '../hooks/useTier'
import type { Tier, Feature, UserProfile } from '../types'

interface TierContextValue {
  tier: Tier
  isTrial: boolean
  trialDaysRemaining: number
  trialExpired: boolean
  canUse: (feature: Feature) => boolean
}

const TierContext = createContext<TierContextValue>({
  tier: 'none',
  isTrial: false,
  trialDaysRemaining: 0,
  trialExpired: false,
  canUse: () => false,
})

export function TierProvider({ user, profile, children }: { user: User | null; profile: UserProfile | null; children: ReactNode }) {
  const tierValue = useTier(user, profile)
  return <TierContext.Provider value={tierValue}>{children}</TierContext.Provider>
}

export function useTierContext() {
  return useContext(TierContext)
}
