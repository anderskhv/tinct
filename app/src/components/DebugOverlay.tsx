import { useEffect, useState } from 'react'

/**
 * In-app debug overlay so we can see __tinctNavDebug on devices where
 * DevTools isn't available (Boox APK, mobile WebView). Triggered by a
 * long-press on the running-footer page label — see Reader.tsx for the
 * gesture wiring. Renders the latest entries as a copyable JSON blob with
 * a "Copy to clipboard" button so Anders can paste the result back
 * without USB debugging.
 */
export function DebugOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [snapshot, setSnapshot] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const w = window as Window & { tinctDebug?: () => unknown }
    const data = w.tinctDebug ? w.tinctDebug() : { error: 'tinctDebug() not available' }
    setSnapshot(JSON.stringify(data, null, 2))
    setCopied(false)
  }, [open])

  if (!open) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snapshot)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may be blocked in some WebView configs — fall back
      // to a manual select. The textarea below is already selectable.
      const ta = document.getElementById('tinct-debug-textarea') as HTMLTextAreaElement | null
      if (ta) {
        ta.focus()
        ta.select()
      }
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--paper, #ece7db)',
          color: 'var(--ink, #0b0b0b)',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '80vh',
          borderRadius: 8,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontSize: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Tinct debug snapshot</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={copy}
              style={{
                padding: '6px 14px',
                background: 'var(--accent, #1f4a5c)',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontFamily: 'inherit',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid var(--ink, #0b0b0b)',
                color: 'var(--ink, #0b0b0b)',
                borderRadius: 4,
                fontFamily: 'inherit',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
        <textarea
          id="tinct-debug-textarea"
          readOnly
          value={snapshot}
          style={{
            flex: 1,
            minHeight: 300,
            fontFamily: 'inherit',
            fontSize: 11,
            padding: 8,
            border: '1px solid rgba(0,0,0,0.2)',
            borderRadius: 4,
            resize: 'none',
            background: 'white',
            color: '#000',
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
          Long-press the chapter footer at the bottom to open this. Use Copy
          to send the JSON back to Claude for diagnosis.
        </div>
      </div>
    </div>
  )
}
