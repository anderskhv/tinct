/**
 * The scene page's first-paint script (built to /read/scene-layout.js; a classic script that is the first child
 * of the page's `.lab` root, so it runs before the text is painted). It picks the reader's own layout and theme,
 * by the reader's own rules (readerBoot.ts, as the reader's boot does): the phone reader's surface on a phone,
 * the desktop margin reader elsewhere; the reader's chosen theme, else the system's. It reads the appearance
 * preferences only, never a reading position, and writes nothing.
 */
import { LAB_PHONE_QUERY, LAB_THEME_PAPER, READER_BOOT_PREFS_KEY, readerBootProfile, readerBootTheme, type LabResolvedTheme } from '../lab/readerBoot'

export function applySceneLayout(lab: HTMLElement, env: {
  prefs: string | null; systemDark: boolean; phone: boolean
}): { phone: boolean; theme: LabResolvedTheme } {
  const profile = env.phone ? 'phone' : 'desktop'
  const theme = readerBootTheme(env.prefs, env.systemDark, false, profile) ?? (env.systemDark ? 'dark' : 'light')
  if (env.phone) {
    lab.classList.remove('is-desktop')
    lab.classList.add('is-phone', 'has-phone-chrome', 'has-reader-controls', 'is-margin-phone')
    lab.dataset.labLayout = 'phone'
    lab.dataset.readerControls = 'visible'
  }
  // The attributes LabApp sets on its root and on <html> for the same theme.
  lab.dataset.theme = theme
  lab.classList.toggle('is-night', theme === 'dark')
  lab.classList.toggle('is-book-theme', theme === 'book')
  lab.classList.toggle('is-white-theme', theme === 'white')
  const root = lab.ownerDocument.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
  root.style.backgroundColor = LAB_THEME_PAPER[theme]
  root.style.setProperty('--scene-room', LAB_THEME_PAPER[theme])
  return { phone: env.phone, theme }
}

function run(): void {
  const lab = document.currentScript?.parentElement
  if (!lab) return
  let prefs: string | null = null
  try { prefs = localStorage.getItem(READER_BOOT_PREFS_KEY) } catch { /* storage is optional */ }
  const media = (query: string) => typeof matchMedia === 'function' && matchMedia(query).matches
  const phone = readerBootProfile({
    userAgent: navigator.userAgent,
    innerWidth: window.innerWidth,
    maxTouchPoints: navigator.maxTouchPoints,
    screenWidth: typeof screen !== 'undefined' ? screen.width : undefined,
    matchMediaPhone: media(LAB_PHONE_QUERY),
  }) === 'phone'
  applySceneLayout(lab, { prefs, systemDark: media('(prefers-color-scheme: dark)'), phone })
}

if (typeof document !== 'undefined' && document.currentScript) {
  try { run() } catch { /* the desktop light page stays */ }
}
