/**
 * The reader's Profile sheet (social ship 2, flows.html "2 · From inside a
 * book"): picture, name, "tinct.app/@name · who can see you" and the tier at
 * the top; then rows to You and Settings (the library-look pages). An account
 * from before profiles also gets a quiet "Set up your profile" row.
 *
 * Shown only while profiles are on and the reader's profile could be read;
 * otherwise the sheet keeps today's Account card and rows.
 */
import { useEffect, useRef, useState } from 'react'
import { VISIBILITY_COPY } from './profileRules'
import { fetchOwnProfile, ownPictureView, paintAvatar, socialProfilesOn, type OwnProfile } from './socialClient'
import './labProfileSheet.css'

/** The reader's own profile while the sheet is open, or null (off, signed out, unavailable). */
export function useSheetProfile(token: string | null, active: boolean): OwnProfile | null {
  const [profile, setProfile] = useState<OwnProfile | null>(null)
  useEffect(() => {
    if (!active || !token || !socialProfilesOn()) return
    let live = true
    void fetchOwnProfile(token).then(result => { if (live) setProfile(result.ok ? result.profile : null) })
    return () => { live = false }
  }, [token, active])
  return token ? profile : null
}

function youUrl(view: '' | 'settings', returnTo: string): string {
  const query = new URLSearchParams()
  if (view) query.set('view', view)
  query.set('returnTo', returnTo)
  return `/you?${query.toString()}`
}

export function LabProfileSheetHead({ profile, token, premium }: { profile: OwnProfile; token: string; premium: boolean }) {
  const avatar = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (avatar.current) paintAvatar(avatar.current, ownPictureView(profile), token)
  }, [profile, token])
  return (
    <div className="lab-v2-profile-card" data-testid="lab-v2-profile-card">
      <span ref={avatar} className="lab-v2-profile-avatar" aria-hidden="true" />
      <span className="lab-v2-profile-text">
        <strong>{profile.name}</strong>
        <em>{profile.link} · {VISIBILITY_COPY[profile.effectiveVisibility].short}</em>
      </span>
      <span className="lab-v2-profile-tier">{premium ? 'Premium' : 'Free'}</span>
    </div>
  )
}

export function LabProfileSheetRows({ profile, returnTo }: { profile: OwnProfile; returnTo: string }) {
  return (
    <div className="lab-v2-rows" data-testid="lab-v2-profile-rows">
      {profile.needsSetup && (
        <a className="lab-v2-row is-link" data-testid="lab-v2-profile-setup" href={youUrl('settings', returnTo)}>
          <span className="lab-v2-row-label">Set up your profile</span>
          <span className="lab-v2-value"><span className="lab-v2-value-chevron" aria-hidden="true">›</span></span>
        </a>
      )}
      <a className="lab-v2-row is-link" data-testid="lab-v2-profile-you" href={youUrl('', returnTo)}>
        <span className="lab-v2-row-label">You</span>
        <span className="lab-v2-value"><span className="lab-v2-value-chevron" aria-hidden="true">›</span></span>
      </a>
      <a className="lab-v2-row is-link" data-testid="lab-v2-profile-settings" href={youUrl('settings', returnTo)}>
        <span className="lab-v2-row-label">Settings</span>
        <span className="lab-v2-value"><span className="lab-v2-value-chevron" aria-hidden="true">›</span></span>
      </a>
    </div>
  )
}
