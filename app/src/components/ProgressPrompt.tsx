import { useState, useEffect } from 'react'

interface ProgressPromptProps {
  bookId: string
  onCreateAccount: () => void
  onDismiss?: () => void
}

function storageKey(bookId: string) {
  return `tinct-progress-prompt-dismissed-${bookId}`
}

export function ProgressPrompt({ bookId, onCreateAccount, onDismiss }: ProgressPromptProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey(bookId))) {
        setDismissed(true)
      } else {
        setDismissed(false)
      }
    } catch { /* ignore */ }
  }, [bookId])

  function handleKeepReading() {
    setDismissed(true)
    try { localStorage.setItem(storageKey(bookId), '1') } catch { /* ignore */ }
    onDismiss?.()
  }

  function handleCreateAccount() {
    setDismissed(true)
    try { localStorage.setItem(storageKey(bookId), '1') } catch { /* ignore */ }
    onCreateAccount()
  }

  if (dismissed) return null

  return (
    <div className="progress-prompt-overlay">
      <div className="progress-prompt-card" role="dialog" aria-labelledby="progress-prompt-title">
        <div className="progress-prompt-eyebrow">End of Chapter 1</div>
        <h3 className="progress-prompt-title" id="progress-prompt-title"><em>Pick this up tomorrow.</em></h3>
        <p className="progress-prompt-body">
          On your phone, on an e-reader, anywhere. Open the full library. Free account, 10 seconds, no card.
        </p>
        <div className="progress-prompt-actions">
          <button className="progress-prompt-primary" onClick={handleCreateAccount}>Create account</button>
          <button className="progress-prompt-secondary" onClick={handleKeepReading}>Keep reading</button>
        </div>
      </div>
    </div>
  )
}
