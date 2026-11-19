/**
 * File types the photo pickers ask for.
 *
 * iPhone and iPad: JPEG, PNG or WebP only, so iOS hands a HEIC photo over as
 * JPEG. Naming image/heic (or .heic) there makes iOS hand over the HEIC
 * original instead, so HEIC is never named on iOS.
 *
 * Everywhere else (Windows, Mac, Android, ChromeOS, Linux) nothing converts,
 * and a list without HEIC greys HEIC photos out in the system picker: HEIC is
 * named (type and extension) so the photo can be chosen, and the page then
 * reads it if this browser can, or says plainly that it cannot.
 *
 * No spaces after the commas: Android's WebView passes each piece on to the
 * system picker untrimmed.
 */
export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp'
export const PHOTO_ACCEPT_WIDE = `${PHOTO_ACCEPT},image/heic,image/heif,.heic,.heif`

export interface PlatformHint {
  userAgent?: string
  platform?: string
  maxTouchPoints?: number
}

const currentNavigator = (): PlatformHint | undefined => (typeof navigator === 'undefined' ? undefined : navigator)

/** iPhone, iPod or iPad, including an iPad that presents itself as a Mac (iPadOS 13+). */
export function isAppleTouchDevice(nav: PlatformHint | undefined = currentNavigator()): boolean {
  if (!nav) return false
  const ua = nav.userAgent || ''
  if (/\b(iPad|iPhone|iPod)\b/.test(ua)) return true
  const mac = nav.platform === 'MacIntel' || /\bMacintosh\b/.test(ua)
  return mac && (nav.maxTouchPoints ?? 0) > 1
}

/** The accept list for this device's photo pickers. */
export function photoAccept(nav: PlatformHint | undefined = currentNavigator()): string {
  return isAppleTouchDevice(nav) ? PHOTO_ACCEPT : PHOTO_ACCEPT_WIDE
}
