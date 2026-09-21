import { useEffect } from 'react'

/** Custom reader ranges remain copyable after the native selection is cleared.
 * Input fields and text selected within a panel retain normal browser copying. */
export function useReaderSelectionCopy(text: string | null) {
  useEffect(() => {
    if (!text) return
    const ownsCopy = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : document.activeElement
      if (element?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) return false
      const native = window.getSelection()
      return !native || native.isCollapsed
    }
    const copy = (event: ClipboardEvent) => {
      if (!ownsCopy(event.target) || !event.clipboardData) return
      event.clipboardData.setData('text/plain', text)
      event.preventDefault()
    }
    const key = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'c' || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || !ownsCopy(event.target)) return
      // Keyboard copying must work even with no native DOM Range. Keep the
      // menu and its paint in place, as a normal text selection would.
      if (navigator.clipboard?.writeText) {
        event.preventDefault()
        void navigator.clipboard.writeText(text).catch(() => {
          // Browser Copy dispatches the handler above in restrictive contexts.
          document.execCommand('copy')
        })
      }
    }
    document.addEventListener('copy', copy, true)
    window.addEventListener('keydown', key, true)
    return () => {
      document.removeEventListener('copy', copy, true)
      window.removeEventListener('keydown', key, true)
    }
  }, [text])
}
