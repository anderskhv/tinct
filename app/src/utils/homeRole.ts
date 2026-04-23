import { registerPlugin, Capacitor } from '@capacitor/core'

interface HomeRolePlugin {
  isHomeRoleHeld(): Promise<{ supported: boolean; isHome: boolean }>
  requestHomeRole(): Promise<{ granted: boolean }>
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
