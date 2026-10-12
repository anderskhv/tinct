import { useLayoutEffect, type RefObject } from 'react'
import { labKeyboardInsetPx } from './labChrome'

export const LAB_KEYBOARD_INSET_VAR = '--lab-keyboard-inset'

/**
 * Keep `--lab-keyboard-inset` on a fixed sheet equal to the height the
 * software keyboard takes from the bottom of the window (visualViewport), so
 * the sheet sits directly on the keyboard and its field stays in view.
 */
export function useLabKeyboardDock(ref: RefObject<HTMLElement | null>, active: boolean): void {
  useLayoutEffect(() => {
    const el = ref.current
    if (!active || !el || typeof window === 'undefined') return
    const viewport = window.visualViewport
    const apply = () => el.style.setProperty(LAB_KEYBOARD_INSET_VAR, `${labKeyboardInsetPx(window.visualViewport, window.innerHeight)}px`)
    apply()
    viewport?.addEventListener('resize', apply)
    viewport?.addEventListener('scroll', apply)
    window.addEventListener('resize', apply)
    return () => {
      viewport?.removeEventListener('resize', apply)
      viewport?.removeEventListener('scroll', apply)
      window.removeEventListener('resize', apply)
      el.style.removeProperty(LAB_KEYBOARD_INSET_VAR)
    }
  }, [active, ref])
}
