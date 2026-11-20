import { useEffect, useRef } from 'react'
import type { FindRow } from '../social/friendsClient'
import type { MenuRequest } from '../social/followRequests'
import { paintAvatar } from '../social/socialClient'
import { followButton } from '../cards/cardsRules'
import { CARDS_COPY } from '../cards/cardsCopy'

/** A follow back from the menu: waiting for the Worker, answered, or refused. */
export type MenuFollowBack = 'idle' | 'pending' | 'done' | 'failed'

export interface LabMenuRequestProps {
  request: MenuRequest<FindRow>
  followBack: MenuFollowBack
  getToken: () => Promise<string | null>
  /** One request: follow them back in place (the Following you call). */
  onFollowBack: () => void
  /** Several: Find readers, where Following you lists them. */
  onOpenRequests: () => void
}

/** The requester's picture, as Following you draws it (initial, painting or private photo). */
function Picture({ row, getToken }: { row: FindRow; getToken: () => Promise<string | null> }) {
  const ref = useRef<HTMLSpanElement>(null)
  const tokenRef = useRef(getToken)
  tokenRef.current = getToken
  const picture = row.picture
  useEffect(() => {
    const node = ref.current
    if (!node || !picture) return
    const initial = picture.initial || (row.name.trim() || row.handle).slice(0, 1).toUpperCase()
    if (!picture.src) { paintAvatar(node, { kind: 'initial', initial }, null); return }
    const src = picture.src
    let live = true
    const paint = (token: string | null) => { if (live) paintAvatar(node, { kind: 'image', src, pos: picture.pos, cover: picture.cover, private: picture.private }, token, 's') }
    if (picture.private) void tokenRef.current().then(paint, () => {})
    else paint(null)
    return () => { live = false }
  }, [picture, row.name, row.handle])
  return <span ref={ref} className="lab-super-request-av" data-testid="lab-super-request-picture" aria-hidden="true" />
}

/**
 * The t menu's first row while a follow request is due (Anders, 16 Nov 2026):
 * "{name} wants to follow you" with Follow back, or "{name} and {n} others
 * want to follow you" opening Following you. Names and pictures are what
 * Following you already shows the reader.
 */
export function LabMenuRequest({ request, followBack, getToken, onFollowBack, onOpenRequests }: LabMenuRequestProps) {
  if (request.others > 0) {
    return (
      <button type="button" className="lab-super-request is-many" data-testid="lab-super-request" data-count={request.others + 1} onClick={onOpenRequests}>
        <Picture row={request.first} getToken={getToken} />
        <span className="lab-super-request-line" data-testid="lab-super-request-line">{request.line}</span>
        <span className="lab-super-row-chevron" aria-hidden="true">›</span>
      </button>
    )
  }
  // The Following you button's words: Follow back, then Friends (cardsRules.followButton).
  const friends = followBack === 'pending' || followBack === 'done'
  const label = followButton(friends ? 'friend' : 'followed')?.label ?? ''
  return (
    <div className="lab-super-request" data-testid="lab-super-request" data-count={1} data-follow-back={followBack}>
      <Picture row={request.first} getToken={getToken} />
      <div className="lab-super-request-body">
        <span className="lab-super-request-line" data-testid="lab-super-request-line">{request.line}</span>
        <button
          type="button"
          className={`lab-super-request-button${friends ? ' is-done' : ''}`}
          data-testid="lab-super-request-follow"
          disabled={friends}
          onClick={onFollowBack}
        >{label}</button>
        {followBack === 'failed' && <span className="lab-super-request-status" role="status" data-testid="lab-super-request-status">{CARDS_COPY.actionFailed}</span>}
      </div>
    </div>
  )
}
