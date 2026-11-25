/**
 * A signed-out reader's listening trial (Anders, 25 Nov 2026): five minutes of
 * playback per device per UTC day, then the audio account sheet. Signed-in
 * readers are not counted.
 *
 * This device's mark holds today's listened seconds (actual playback, counted
 * by useLabListenTrial), so the reader stops at 5:00 and a second attempt that
 * day goes straight to the sheet, as Talk's day mark does. The Worker enforces
 * the trial on its own (worker/lib/listenTrial.ts) and only ever serves a
 * guest narration that already exists.
 */

/** Today's listened seconds on this device. In the `tinct:` namespace `clearLocalUserData` wipes. */
export const LAB_LISTEN_TRIAL_KEY = 'tinct:lab-listen-trial'
/** The reader's five minutes (the Worker's LISTEN_TRIAL_SECONDS). */
export const LISTEN_TRIAL_SECONDS = 300

export interface ListenTrialStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function browserStorage(): ListenTrialStorage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

/** The UTC day, as the Worker counts days. */
export function listenTrialDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

/** Seconds this device has listened while signed out today (0 on a new day or unreadable storage). */
export function listenTrialSeconds(storage: ListenTrialStorage | null = browserStorage(), now = Date.now()): number {
  try {
    const value = JSON.parse(storage?.getItem(LAB_LISTEN_TRIAL_KEY) || 'null') as { day?: unknown; seconds?: unknown } | null
    if (!value || value.day !== listenTrialDay(now) || typeof value.seconds !== 'number' || !Number.isFinite(value.seconds)) return 0
    return Math.max(0, Math.min(LISTEN_TRIAL_SECONDS, value.seconds))
  } catch {
    return 0
  }
}

/** Add listened seconds to today's mark; the new total. */
export function addListenTrialSeconds(seconds: number, storage: ListenTrialStorage | null = browserStorage(), now = Date.now()): number {
  const total = Math.min(LISTEN_TRIAL_SECONDS, listenTrialSeconds(storage, now) + Math.max(0, Number.isFinite(seconds) ? seconds : 0))
  try { storage?.setItem(LAB_LISTEN_TRIAL_KEY, JSON.stringify({ day: listenTrialDay(now), seconds: Math.round(total * 10) / 10 })) } catch { /* private mode: the Worker still limits */ }
  return total
}

/** Today's trial is used (the reader reached 5:00, or the Worker said so). */
export function markListenTrialUsed(storage: ListenTrialStorage | null = browserStorage(), now = Date.now()): void {
  try { storage?.setItem(LAB_LISTEN_TRIAL_KEY, JSON.stringify({ day: listenTrialDay(now), seconds: LISTEN_TRIAL_SECONDS })) } catch { /* private mode */ }
}

export function listenTrialUsedToday(storage: ListenTrialStorage | null = browserStorage(), now = Date.now()): boolean {
  return listenTrialSeconds(storage, now) >= LISTEN_TRIAL_SECONDS
}
