import { useId, useLayoutEffect, type RefObject } from 'react'

type PaintRect = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom' | 'height'>
/** Fill only subpixel cracks between touching rows, never paragraph/line spacing. */
export function highlightSeams(rects: PaintRect[], fontSize: number, pixel = 1): Array<{left:number;top:number;width:number;height:number}> {
  const rows: Array<{left:number;right:number;top:number;bottom:number}> = []
  for (const rect of [...rects].filter(r => r.height >= fontSize && r.right > r.left).sort((a,b) => a.top-b.top || a.left-b.left)) {
    const row = rows.find(r => Math.abs(r.top-rect.top) < 1)
    if (row) { row.left=Math.min(row.left,rect.left); row.right=Math.max(row.right,rect.right); row.bottom=Math.max(row.bottom,rect.bottom) }
    else rows.push({left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom})
  }
  return rows.slice(1).flatMap((next,index) => {
    const previous=rows[index], gap=next.top-previous.bottom
    const left=Math.max(previous.left,next.left), right=Math.min(previous.right,next.right)
    if (gap < -1 || gap > 1.5 || right <= left) return []
    const top=Math.floor(Math.min(previous.bottom,next.top)/pixel)*pixel-pixel
    const bottom=Math.ceil(Math.max(previous.bottom,next.top)/pixel)*pixel+pixel
    return [{left,top,width:right-left,height:bottom-top}]
  })
}

/** Paint a single text range across words and spaces, without changing line layout. */
export function useTextRangeHighlights(ref: RefObject<HTMLElement | null>) {
  const prefix = 'tinct' + useId().replace(/[^a-zA-Z0-9]/g, '')
  useLayoutEffect(() => {
    const root = ref.current
    const registry = (globalThis.CSS as typeof CSS & { highlights?: Map<string, unknown> })?.highlights
    const HighlightClass = (globalThis as unknown as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight
    if (!root || !registry || !HighlightClass) return
    const colors = {
      warm: ['gold', '#f5e6c8', '#5c4a2e'], rose: ['rose', '#f5d0d0', '#5c3030'],
      sage: ['sage', '#cde3b4', '#4a5c2e'], sky: ['sky', '#d0e0f5', '#2e3a5c'],
      lavender: ['lavender', '#e0d0f5', '#3a2e5c'],
    }
    const ranges: Record<string, Range[]> = {}
    const runs: Array<{ line: Element; color: string; range: Range }> = []
    // Never join separate paragraphs, Compare columns or facing pages.
    for (const line of root.querySelectorAll('.lab-hearing-line')) {
      let color: string | undefined
      let range: Range | undefined
      for (const word of line.querySelectorAll('[data-testid="lab-word"]')) {
        const next = word.classList.contains('is-selecting') ? 'warm'
          : Object.keys(colors).find(key => word.classList.contains(`is-hl-${key}`))
        if (!next) { color = undefined; range = undefined; continue }
        if (next !== color || !range) {
          range = document.createRange()
          range.setStart(word, 0)
          ;(ranges[next] ??= []).push(range)
          runs.push({ line, color: next, range })
        }
        range.setEnd(word, word.childNodes.length)
        color = next
      }
    }
    const style = document.createElement('style')
    style.textContent = Object.entries(colors).map(([color, [token, light, dark]]) => {
      const name = `${prefix}-${color}`
      registry.set(name, new HighlightClass(...(ranges[color] ?? [])))
      return `.lab ::highlight(${name}){background-color:var(--highlight-${token},${light});color:inherit}.lab.is-night ::highlight(${name}){background-color:var(--highlight-${token},${dark})}`
    }).join('\n')
    document.head.append(style)
    root.classList.add('has-text-range-highlights')
    // Native ::highlight backgrounds round each row separately. Fractional
    // line-height can leave a one-device-pixel paper slit between full rows.
    // A paint-only underlay joins those edges without changing text metrics,
    // verse geometry, selection ranges, or deliberate line/paragraph spacing.
    const layers: HTMLElement[] = []
    const paintSeams = () => {
      layers.splice(0).forEach(layer => layer.remove())
      if (!root.isConnected) return
      for (const {line,color,range} of runs) {
        if (typeof range.getClientRects !== 'function') continue
        const box=line.getBoundingClientRect(), fontSize=parseFloat(getComputedStyle(line).fontSize)
        for (const seam of highlightSeams([...range.getClientRects()],fontSize,1/(window.devicePixelRatio || 1))) {
          const layer=document.createElement('span')
          layer.className='lab-highlight-seam'
          layer.setAttribute('aria-hidden','true')
          const [token,light,dark]=colors[color as keyof typeof colors]
          const fallback=root.closest('.is-night') ? dark : light
          Object.assign(layer.style,{left:`${seam.left-box.left}px`,top:`${seam.top-box.top}px`,width:`${seam.width}px`,height:`${seam.height}px`,background:`var(--highlight-${token},${fallback})`})
          line.append(layer)
          layers.push(layer)
        }
      }
    }
    // Continued-tail alignment runs in a later layout effect; measure after it.
    let frame=requestAnimationFrame(paintSeams)
    const observer=typeof ResizeObserver==='function' ? new ResizeObserver(() => {
      cancelAnimationFrame(frame); frame=requestAnimationFrame(paintSeams)
    }) : null
    observer?.observe(root)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      layers.forEach(layer=>layer.remove())
      root.classList.remove('has-text-range-highlights')
      for (const color of Object.keys(colors)) registry.delete(`${prefix}-${color}`)
      style.remove()
    }
  })
}
