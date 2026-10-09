import { LAB_COPY } from './labCopy'

/**
 * The line a refused recap, chapter note or Catch me up entry shows at zero
 * (LAB_COPY.balanceEmpty). With `onTopUp` (the reader opens the account
 * cards, where You offers the top-ups) the line is that link.
 */
export function LabBalanceEmptyLine({ onTopUp, testId }: { onTopUp?: () => void; testId: string }) {
  return onTopUp
    ? <button type="button" className="lab-catch-up-balance is-link" data-testid={testId} onClick={onTopUp}>{LAB_COPY.balanceEmpty}</button>
    : <p className="lab-catch-up-balance" data-testid={testId}>{LAB_COPY.balanceEmpty}</p>
}
