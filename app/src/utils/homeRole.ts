import { registerPlugin, Capacitor } from '@capacitor/core'

interface HomeRolePlugin {
  isHomeRoleHeld(): Promise<{ supported: boolean; isHome: boolean }>
  requestHomeRole(): Promise<{ granted: boolean }>
  /** Open Android's default-Home-app picker so the user can release Tinct
   *  (or pick a different launcher) without digging through Settings. */
  openHomeAppSettings(): Promise<void>
}

const HomeRole = registerPlugin<HomeRolePlugin>('HomeRole')

/** Whether we're running in the Capacitor Android build. Web/iOS return false. */
export function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export async function isHomeApp(): Promise<boolean> {
  if (!isAndroidNative()) return false
  try {
    const res = await HomeRole.isHomeRoleHeld()
    return !!res?.isHome
  } catch {
    return false
  }
}

export async function requestHomeApp(): Promise<boolean> {
  if (!isAndroidNative()) return false
  try {
    const res = await HomeRole.requestHomeRole()
    return !!res?.granted
  } catch {
    return false
  }
}

/** Open Android's "default Home app" picker. Use this to let a user who set
 *  Tinct as their launcher release it and choose a different one. No-op on
 *  web / iOS. */
export async function openHomeAppSettings(): Promise<void> {
  if (!isAndroidNative()) return
  try {
    await HomeRole.openHomeAppSettings()
  } catch (e) {
    console.warn('[homeRole] could not open home settings:', e)
  }
}
