import { wipeLabDeviceUserData } from './labSignOut'

/**
 * Which account this device is signed in as (lab).
 *
 * Sign-out wipes the device (`wipeLabDeviceUserData`) so the next reader
 * inherits nothing. That covers the ordinary case, but not the one that
 * produced the 2026-09-07 confusion: a reader who signs in with a *second
 * provider* makes a second account, and any account whose session simply
 * expires never runs the sign-out wipe at all. The device would then hand the
 * new account the previous one's chat, highlights, journal and place.
 *
 * So the sign-in page records the account here and compares on every visit:
 *
 *  - no record            → first sign-in on this device. Nothing is wiped:
 *                           what is here was read signed out and is the new
 *                           account's to adopt.
 *  - same account         → nothing to do.
 *  - a different account  → the previous reader never signed out. Wipe before
 *                           the new account touches anything.
 *
 * The key lives in the `tinct:` namespace on purpose: sign-out clears it with
 * everything else, so a clean sign-out leaves the device adoptable again.
 */
export const LAB_DEVICE_USER_KEY = 'tinct:lab-device-user'

export type LabIdentityChange = 'signed-out' | 'first-sign-in' | 'same-account' | 'switched'

export interface LabDeviceIdentityDeps {
  read: (key: string) => string | null
  write: (key: string, value: string) => void
  wipe: () => void
}

function browserDeps(): LabDeviceIdentityDeps {
  return {
    read: key => { try { return localStorage.getItem(key) } catch { return null } },
    write: (key, value) => { try { localStorage.setItem(key, value) } catch { /* private mode */ } },
    wipe: wipeLabDeviceUserData,
  }
}

export function reconcileLabDeviceIdentity(
  userId: string | null | undefined,
  deps: LabDeviceIdentityDeps = browserDeps(),
): LabIdentityChange {
  if (!userId) return 'signed-out'
  const previous = deps.read(LAB_DEVICE_USER_KEY)
  if (previous === userId) return 'same-account'
  if (previous === null) {
    deps.write(LAB_DEVICE_USER_KEY, userId)
    return 'first-sign-in'
  }
  deps.wipe()
  // After the wipe: it clears this key with the rest of the `tinct:` namespace.
  deps.write(LAB_DEVICE_USER_KEY, userId)
  return 'switched'
}
