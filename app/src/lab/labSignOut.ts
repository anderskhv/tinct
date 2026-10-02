import { clearDeviceReadingMemory } from '../readingMemory/deviceStore'
import { clearLocalUserData } from '../services/storage'
import { clearLabPositionMirror } from './labPositionStore'

/**
 * Sign-out on a shared device must not leave the previous reader's recap,
 * place, chat or highlights for the next person. `clearLocalUserData` already
 * wipes every `tinct:` / `tinct-` key except device-level preferences
 * (`tinct-lab-prefs` is on its preserve list; the device id is wiped so the
 * next reader on this device is not linked to the last); the
 * reading-memory and IndexedDB wipes are explicit so they do not depend on a
 * key prefix staying in that namespace.
 */
export function wipeLabDeviceUserData(): void {
  clearLocalUserData()
  clearDeviceReadingMemory()
  clearLabPositionMirror()
}
