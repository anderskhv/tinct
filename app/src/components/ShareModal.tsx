import { useEffect, useRef, useState } from 'react'

interface ShareModalProps {
  text: string
  author: string
  bookTitle: string
  theme: 'light' | 'dark'
  onClose: () => void
}

const CANVAS_W = 800
const CANVAS_H = 480

const PALETTE = {
  light: {
    bg: '#faf7f2',
    text: '#2c1f0e',
    attr: '#7a6a55',
    logo: 'rgba(60,40,10,0.12)',
  },
  dark: {
    bg: '#2a1f14',
    text: '#f0e8d8',
    attr: '#c8b896',
    logo: 'rgba(240,232,216,0.15)',
  },
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function renderCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  author: string,
  bookTitle: string,
  theme: 'light' | 'dark',
  showLogo: boolean,
) {
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')!
  const pal = PALETTE[theme]

  // Background
  ctx.fillStyle = pal.bg
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // Quote text — serif, large
  const PAD = 64
  const maxTextW = CANVAS_W - PAD * 2

  // Truncate very long text for display
  const displayText = text.length > 400 ? text.slice(0, 397) + '…' : text

  // Try to fit text at decreasing font sizes
  let fontSize = 34
  let lines: string[] = []
  while (fontSize >= 18) {
    ctx.font = `italic ${fontSize}px Georgia, serif`
    lines = wrapText(ctx, displayText, maxTextW)
    if (lines.length <= 7) break
    fontSize -= 2
  }

  const lineHeight = fontSize * 1.45
  const textBlockH = lines.length * lineHeight
  const attrH = 40
  const totalContentH = textBlockH + 24 + attrH // 24px gap between text and attr
  const startY = (CANVAS_H - totalContentH) / 2

  ctx.fillStyle = pal.text
  ctx.font = `italic ${fontSize}px Georgia, serif`
  ctx.textBaseline = 'top'
  lines.forEach((line, i) => {
    ctx.fillText(line, PAD, startY + i * lineHeight)
  })

  // Attribution
  const attrY = startY + textBlockH + 24
  ctx.font = `600 13px -apple-system, Helvetica, Arial, sans-serif`
  ctx.fillStyle = pal.attr
  ctx.textBaseline = 'middle'
  const attrText = `— ${author.toUpperCase()}, ${bookTitle.toUpperCase()}`
  ctx.fillText(attrText, PAD, attrY + attrH / 2)

  // Subtle Tinct wordmark — bottom right
  if (showLogo) {
    ctx.font = `400 11px -apple-system, Helvetica, Arial, sans-serif`
    ctx.fillStyle = pal.logo
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'right'
    ctx.fillText('tinct', CANVAS_W - PAD, CANVAS_H - 22)
    ctx.textAlign = 'left'
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas to blob failed'))
    }, 'image/png')
  })
}

export function ShareModal({ text, author, bookTitle, theme, onClose }: ShareModalProps) {
  const [tab, setTab] = useState<'image' | 'text'>('image')
  const [showLogo, setShowLogo] = useState(true)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Re-render canvas when inputs change
  useEffect(() => {
    if (canvasRef.current) {
      renderCanvas(canvasRef.current, text, author, bookTitle, theme, showLogo)
    }
  }, [text, author, bookTitle, theme, showLogo])

  const textContent = `"${text}"\n— ${author}, ${bookTitle}`

  const handleShareImage = async () => {
    if (!canvasRef.current) return
    try {
      const blob = await canvasToBlob(canvasRef.current)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'tinct-quote.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] })
          return
        }
      }
      // Desktop fallback: copy to clipboard
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Last resort: open in new tab
      const url = canvasRef.current.toDataURL('image/png')
      window.open(url, '_blank')
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select and copy
      const ta = document.createElement('textarea')
      ta.value = textContent
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
  const imageButtonLabel = isMobile ? 'Share image' : 'Copy image'

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-card" onClick={e => e.stopPropagation()}>
        <div className="share-modal-header">
          <span className="share-modal-title">Share quote</span>
          <button className="share-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="share-modal-tabs">
          <button
            className={`share-tab-btn ${tab === 'image' ? 'active' : ''}`}
            onClick={() => setTab('image')}
          >Image</button>
          <button
            className={`share-tab-btn ${tab === 'text' ? 'active' : ''}`}
            onClick={() => setTab('text')}
          >Text</button>
        </div>

        <div className="share-modal-body">
          {tab === 'image' && (
            <>
              <div className="share-canvas-wrapper">
                <canvas ref={canvasRef} />
              </div>
              <div className="share-modal-controls">
                <label className="share-logo-toggle">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={e => setShowLogo(e.target.checked)}
                  />
                  Show Tinct logo
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`share-copy-feedback ${copied ? 'visible' : ''}`}>
                    Copied!
                  </span>
                  <button className="share-action-btn" onClick={handleShareImage}>
                    {imageButtonLabel}
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === 'text' && (
            <>
              <div className="share-text-preview">{textContent}</div>
              <div className="share-modal-controls">
                <div />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`share-copy-feedback ${copied ? 'visible' : ''}`}>
                    Copied!
                  </span>
                  <button className="share-action-btn" onClick={handleCopyText}>
                    Copy text
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
