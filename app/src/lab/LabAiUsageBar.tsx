import { useEffect, useState } from 'react'
import {
  AI_USAGE_COPY,
  aiUsageNote,
  fetchAiAllowance,
  startTopUpCheckout,
  type AiAllowance,
  type TopUpPack,
} from './labAiAllowance'

/**
 * The reader's AI usage bar on the account sheet. Renders nothing for a
 * signed-out reader, while the allowance is switched off, or when the usage
 * cannot be read.
 */
export function LabAiUsageBar({ token }: { token: string | null }) {
  const [allowance, setAllowance] = useState<AiAllowance | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setAllowance(null)
    if (!token) return
    let live = true
    void fetchAiAllowance(token).then(result => { if (live) setAllowance(result) })
    return () => { live = false }
  }, [token])

  if (!token || !allowance) return null

  const topUp = async (pack: TopUpPack) => {
    setBusy(true)
    setFailed(false)
    const url = await startTopUpCheckout(token, pack)
    if (url) {
      window.location.assign(url)
      return
    }
    setBusy(false)
    setFailed(true)
  }
  const percent = Math.round(allowance.usedFraction * 100)

  return (
    <div className="lab-v2-ai-usage" data-testid="lab-v2-ai-usage" data-state={allowance.state}>
      <p className="lab-v2-group-label">{AI_USAGE_COPY.label}</p>
      <div
        className="lab-v2-ai-usage-track"
        role="meter"
        aria-label={AI_USAGE_COPY.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span className="lab-v2-ai-usage-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="lab-v2-note" data-testid="lab-v2-ai-usage-note">{aiUsageNote(allowance)}</p>
      {allowance.state === 'used_up' && (
        <div className="lab-v2-rows">
          <button type="button" className="lab-v2-row is-link" data-testid="lab-v2-top-up" disabled={busy} onClick={() => void topUp('chat_pack_100')}>
            <span className="lab-v2-row-label">{AI_USAGE_COPY.topUp}</span>
          </button>
          <button type="button" className="lab-v2-row is-link" data-testid="lab-v2-top-up-more" disabled={busy} onClick={() => void topUp('chat_pack_200')}>
            <span className="lab-v2-row-label">{AI_USAGE_COPY.topUpMore}</span>
          </button>
        </div>
      )}
      {failed && <p className="lab-v2-note" role="status">{AI_USAGE_COPY.topUpFailed}</p>}
    </div>
  )
}
