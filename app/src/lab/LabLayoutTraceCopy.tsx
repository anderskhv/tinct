import { useState } from 'react'
import { layoutTraceEntries, layoutTraceJson } from './labLayoutTrace'

/**
 * "Copy trace", at the foot of the t menu while the layout trace is on
 * (?layoutTrace=1, labLayoutTrace.ts). Copies the whole buffer as compact
 * JSON; when the clipboard refuses, shows it in a text area to select by hand.
 */
export function LabLayoutTraceCopy() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle')
  const [text, setText] = useState('')
  const count = layoutTraceEntries().length
  const copy = async () => {
    const json = layoutTraceJson()
    setText(json)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard')
      await navigator.clipboard.writeText(json)
      setStatus('copied')
    } catch {
      setStatus('manual')
    }
  }
  return (
    <div className="lab-trace-copy" data-testid="lab-trace-copy">
      <button type="button" className="lab-trace-copy-button" data-testid="lab-trace-copy-button" onClick={() => { void copy() }}>
        <span>Copy trace</span>
        <span className="lab-trace-copy-status" data-testid="lab-trace-copy-status">
          {status === 'copied' ? 'Copied' : status === 'manual' ? 'Select below' : `${count} entries`}
        </span>
      </button>
      {status === 'manual' && (
        <textarea
          className="lab-trace-copy-text"
          data-testid="lab-trace-copy-text"
          aria-label="Layout trace"
          readOnly
          value={text}
          onFocus={event => event.currentTarget.select()}
        />
      )}
    </div>
  )
}
