import { useEffect, useState } from 'react'
import {
  AI_USAGE_COPY,
  aiUsageNote,
  fetchAiAllowance,
  offersTopUps,
  startTopUpCheckout,
  type AiAllowance,
  type TopUpPack,
} from './labAiAllowance'
import { LAB_COPY } from './labCopy'
import './labAiUsageBar.css'

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
    <section className="lab-ai-usage" data-testid="lab-v2-ai-usage" data-state={allowance.state} aria-label={AI_USAGE_COPY.label}>
      <div className="lab-ai-usage-meter">
        <p className="lab-ai-usage-label">{AI_USAGE_COPY.label}</p>
        <div className="lab-ai-usage-track" role="meter" aria-label={AI_USAGE_COPY.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span className="lab-ai-usage-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="lab-ai-usage-note" data-testid="lab-v2-ai-usage-note">{aiUsageNote(allowance)}</p>
      </div>
      {offersTopUps(allowance) && (
        <div className="lab-ai-usage-pills">
          {/* "$5" and "$10" pills, each only while the Worker sells it. */}
          {allowance.topUps.includes('chat_pack_200') && (
            <button type="button" className="lab-ai-usage-pill" data-testid="lab-v2-top-up" aria-label={AI_USAGE_COPY.topUpAction} disabled={busy} onClick={() => void topUp('chat_pack_200')}>
              <span>{AI_USAGE_COPY.topUp}</span>
            </button>
          )}
          {allowance.topUps.includes('top_up_10') && (
            <button type="button" className="lab-ai-usage-pill" data-testid="lab-v2-top-up-more" aria-label={AI_USAGE_COPY.topUpMoreAction} disabled={busy} onClick={() => void topUp('top_up_10')}>
              <span>{AI_USAGE_COPY.topUpMore}</span>
            </button>
          )}
        </div>
      )}
      {failed && <p className="lab-ai-usage-note" role="status">{AI_USAGE_COPY.topUpFailed}</p>}
    </section>
  )
}

/**
 * The line a refused recap, chapter note or Catch me up entry shows at zero
 * (LAB_COPY.balanceEmpty). With `onTopUp` (the reader opens its account
 * sheet, where the usage bar offers the top-ups) the line is that link.
 */
export function LabBalanceEmptyLine({ onTopUp, testId }: { onTopUp?: () => void; testId: string }) {
  return onTopUp
    ? <button type="button" className="lab-catch-up-balance is-link" data-testid={testId} onClick={onTopUp}>{LAB_COPY.balanceEmpty}</button>
    : <p className="lab-catch-up-balance" data-testid={testId}>{LAB_COPY.balanceEmpty}</p>
}
