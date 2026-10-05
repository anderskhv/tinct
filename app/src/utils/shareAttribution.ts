import { trackFunnel } from './funnel'

/** Set by public/share-open.js when a reader arrives from a /q/{id} link. */
export const SHARE_ARRIVAL_KEY = 'tinct:share-arrival'

/** A sign-up from a reader who arrived through a shared highlight. */
export function trackShareLinkSignup(): void {
  let share: string | null = null
  try {
    share = sessionStorage.getItem(SHARE_ARRIVAL_KEY)
    if (share) sessionStorage.removeItem(SHARE_ARRIVAL_KEY)
  } catch {
    return
  }
  if (share && /^[a-hj-km-np-z2-9]{7}$/.test(share)) trackFunnel('share_link_signup', { share_id: share })
}
