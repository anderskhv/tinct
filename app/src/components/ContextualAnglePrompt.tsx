import { useState, useEffect } from 'react'

interface ContextualAnglePromptProps {
  bookId: string
  onSetAngle: () => void
  onSkip: () => void
}

function storageKey(bookId: string) {
  return `tinct-ctx-angle-dismissed-${bookId}`
}

export function ContextualAnglePrompt({ bookId, onSetAngle, onSkip }: ContextualAnglePromptProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey(bookId))) setDismissed(true)
      else setDismissed(false)
    } catch { /* ignore */ }
  }, [bookId])

  function persistDismiss() {
    try { localStorage.setItem(storageKey(bookId), '1') } catch { /* ignore */ }
  }

  function handleSetAngle() {
    persistDismiss()
    setDismissed(true)
    onSetAngle()
  }

  function handleSkip() {
    persistDismiss()
    setDismissed(true)
    onSkip()
  }

  if (dismissed) return null

  return (
    <div className="ctx-angle-card" role="dialog" aria-labelledby="ctx-angle-title">
      <h3 className="ctx-angle-title" id="ctx-angle-title">Set an angle first?</h3>
      <p className="ctx-angle-body">
        Your answers get sharper when the AI knows what draws you in. The adventure, a theme, a question you want answered. Takes 10 seconds, or skip.
      </p>
      <div className="ctx-angle-actions">
        <button className="ctx-angle-primary" onClick={handleSetAngle}>Set an angle →</button>
        <button className="ctx-angle-secondary" onClick={handleSkip}>Just ask</button>
      </div>
    </div>
  )
}
