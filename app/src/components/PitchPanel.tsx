import type { Tier } from '../types'

/**
 * Inline pitch panel rendered when an anonymous / free / out-of-messages user
 * lands on a locked feature tab (Chat / Feed / Cast). Replaces the previous
 * "tab is hidden entirely" behavior — the user now sees the tab, taps it,
 * and gets a state-aware pitch with the right CTA.
 *
 * Audio uses a separate popover (AudioPitchPopover) because it doesn't have
 * a tab-level surface to fill.
 *
 * Locked at:
 *   - Chat: anonymous OR free-trial-expired OR premium-out-of-messages
 *   - Feed: anonymous OR free-trial-expired
 *   - Cast: anonymous OR free-trial-expired
 *
 * State machine — caller computes which `kind` based on tier + messagesRemaining:
 *   - 'anonymous'        → no account at all → "Create a free account"
 *   - 'free-post-trial'  → free tier, trial used up → "Upgrade to Premium"
 *   - 'out-of-messages'  → Premium but used 100 messages → "Top up"  (chat only)
 */

export type PitchKind = 'anonymous' | 'free-post-trial' | 'out-of-messages'
export type PitchFeature = 'chat' | 'feed' | 'cast'

export interface PitchPanelProps {
  feature: PitchFeature
  kind: PitchKind
  /** Trigger account-creation modal (anonymous → signup with trial). */
  onCreateAccount?: () => void
  /** Trigger sign-in modal (anonymous returning users). */
  onSignIn?: () => void
  /** Open the pricing/upgrade flow (post-trial → Premium). */
  onUpgrade?: () => void
  /** Open the top-up purchase flow (out-of-messages). */
  onTopUp?: (pack: '100' | '200') => void
  /** When messages reset (out-of-messages display). ISO string or human "Jun 6". */
  resetDate?: string
}

export function PitchPanel(props: PitchPanelProps) {
  const { feature, kind } = props
  return (
    <div className="pitch-panel">
      <div className="pitch-panel-content">
        {feature === 'chat' && <ChatPitchBody {...props} />}
        {feature === 'feed' && <FeedPitchBody {...props} />}
        {feature === 'cast' && <CastPitchBody {...props} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-feature copy. Voice rules from the 2026-05-06 design pass:
//   - Declarative, no aphorisms, no parallelism rhythms
//   - Anonymous pitches: no example bullets (kept short — drafts agreed with user)
//   - Free-post-trial: shorter still — they already know what the feature does
// ─────────────────────────────────────────────────────────────────────────────

function ChatPitchBody({ kind, onCreateAccount, onSignIn, onUpgrade, onTopUp, resetDate }: PitchPanelProps) {
  if (kind === 'anonymous') {
    return (
      <>
        <h2 className="pitch-headline">Ask the book anything</h2>
        <p className="pitch-body">
          Tinct's AI companion reads alongside you. Ask about a passage that's slowing you down,
          a character you've forgotten, a reference you want unpacked. It knows where you are in
          the text and answers in context.
        </p>
        <button className="pitch-cta-primary" onClick={onCreateAccount}>Create a free account</button>
        <p className="pitch-fineprint">Includes a 30-day Premium trial. No card required.</p>
        <button className="pitch-cta-secondary" onClick={onSignIn}>Already have an account? Sign in</button>
      </>
    )
  }
  if (kind === 'free-post-trial') {
    return (
      <>
        <h2 className="pitch-headline">Get your reading companion back</h2>
        <p className="pitch-body">
          AI chat is part of Premium. The companion that knew your last chapter is one click away.
        </p>
        <button className="pitch-cta-primary" onClick={onUpgrade}>Upgrade to Premium — $3/mo</button>
        <p className="pitch-fineprint">100 chat messages, audiobook, Cast, journal, offline reading.</p>
      </>
    )
  }
  // out-of-messages
  return (
    <>
      <h2 className="pitch-headline">Out of messages this month</h2>
      <p className="pitch-body">
        You've used all 100 chat messages on your monthly Premium plan. Top up for more, or wait
        for your monthly reset{resetDate ? ` on ${resetDate}` : ''}.
      </p>
      <div className="pitch-cta-row">
        <button className="pitch-cta-primary" onClick={() => onTopUp?.('100')}>+100 messages — $3</button>
        <button className="pitch-cta-primary" onClick={() => onTopUp?.('200')}>+200 messages — $5</button>
      </div>
    </>
  )
}

function FeedPitchBody({ kind, onCreateAccount, onSignIn, onUpgrade }: PitchPanelProps) {
  if (kind === 'anonymous') {
    return (
      <>
        <h2 className="pitch-headline">Your reading, kept</h2>
        <p className="pitch-body">
          The Feed gathers everything from a book — what you've read, the lines you stopped on,
          journal entries, notes, and chat history. Saved to your account.
        </p>
        <button className="pitch-cta-primary" onClick={onCreateAccount}>Create a free account</button>
        <p className="pitch-fineprint">Your Feed starts here.</p>
        <button className="pitch-cta-secondary" onClick={onSignIn}>Already have an account? Sign in</button>
      </>
    )
  }
  // free-post-trial
  return (
    <>
      <h2 className="pitch-headline">Keep building your Feed</h2>
      <p className="pitch-body">
        Highlights, journal, and chat history are part of Premium. Your existing Feed is preserved —
        upgrade to keep adding to it.
      </p>
      <button className="pitch-cta-primary" onClick={onUpgrade}>Upgrade to Premium — $3/mo</button>
    </>
  )
}

function CastPitchBody({ kind, onCreateAccount, onSignIn, onUpgrade }: PitchPanelProps) {
  if (kind === 'anonymous') {
    return (
      <>
        <h2 className="pitch-headline">Never lose track of who's who</h2>
        <p className="pitch-body">
          Cast tracks every character and concept in the book, scoped to where you are. Open it any
          time to see who's in this chapter, who they were last time you met them, and where else
          they appear.
        </p>
        <button className="pitch-cta-primary" onClick={onCreateAccount}>Create a free account</button>
        <p className="pitch-fineprint">Cast included free for 30 days.</p>
        <button className="pitch-cta-secondary" onClick={onSignIn}>Already have an account? Sign in</button>
      </>
    )
  }
  // free-post-trial
  return (
    <>
      <h2 className="pitch-headline">Cast follows you back</h2>
      <p className="pitch-body">
        Character tracking is part of Premium. Pick up where you left off in any book.
      </p>
      <button className="pitch-cta-primary" onClick={onUpgrade}>Upgrade to Premium — $3/mo</button>
    </>
  )
}

/**
 * Pure helper: derive the pitch kind from the user's tier + balance state.
 * Returns null when the feature is unlocked (caller renders the real feature).
 *
 *   - No user            → 'anonymous'
 *   - 'free' tier        → 'free-post-trial' (Premium trial expired or never used)
 *   - 'premium' + chat with 0 messages → 'out-of-messages' (chat only)
 *   - 'premium' otherwise → null (unlocked)
 */
export function pitchKindFor(args: {
  feature: PitchFeature
  tier: Tier
  hasBalance?: boolean
}): PitchKind | null {
  const { feature, tier, hasBalance } = args
  if (tier === 'none') return 'anonymous'
  if (tier === 'free') return 'free-post-trial'
  // Premium
  if (feature === 'chat' && hasBalance === false) return 'out-of-messages'
  return null
}
