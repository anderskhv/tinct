import { useEffect, useState } from 'react'

/** Reading chrome quiets during motion, then returns as soon as reading resumes. */
export function useReadingScrollActivity(host: HTMLElement | null, enabled = true) {
  const [scrolling, setScrolling] = useState(false)
  useEffect(() => {
    setScrolling(false)
    if (!host || !enabled) return
    let idle: ReturnType<typeof setTimeout> | undefined
    const end = () => { clearTimeout(idle); setScrolling(false) }
    const scroll = () => {
      setScrolling(true)
      clearTimeout(idle)
      idle = setTimeout(end, 180)
    }
    host.addEventListener('scroll', scroll, { passive: true })
    return () => {
      clearTimeout(idle)
      host.removeEventListener('scroll', scroll)
    }
  }, [host, enabled])
  return scrolling
}
