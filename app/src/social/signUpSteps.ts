/**
 * The sign-in sheet while profiles are on (the Worker's tinct-social marker).
 *
 * Sign-up is one step since 24 Nov 2026 (Anders): Google or an email code, then
 * straight back to the reader's place. The "Your profile" and "How do you read?"
 * steps that followed (approved 22 Oct and 2 Nov 2026) are gone; the profile is
 * made silently, Only me, on its first read (worker/routes/profiles.ts), and
 * reading languages and the edition new books open in stay in Settings.
 * What is left here is the password field's show/hide.
 */
import { socialProfilesOn } from './socialClient'

const STYLE = `
.social-pw{position:relative;display:block}
.social-pw input{padding-right:64px}
.social-pw-toggle{position:absolute;right:6px;bottom:6px;height:40px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:#5e574e;font-size:12px;cursor:pointer;text-decoration:underline}
`

/** The password field's show/hide. Returns false (and touches nothing) when profiles are off. */
export function enhanceSignInPage(root: HTMLElement | null): boolean {
  if (!root || !socialProfilesOn()) return false
  root.classList.add('is-social')
  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.append(style)

  // One password field with show/hide.
  const password = root.querySelector<HTMLInputElement>('[name=password]')
  const field = password?.closest<HTMLElement>('[data-password-field]')
  if (password && field) {
    const wrap = document.createElement('span')
    wrap.className = 'social-pw'
    password.replaceWith(wrap)
    wrap.append(password)
    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = 'social-pw-toggle'
    toggle.textContent = 'Show'
    toggle.setAttribute('aria-label', 'Show password')
    toggle.addEventListener('click', () => {
      const show = password.type === 'password'
      password.type = show ? 'text' : 'password'
      toggle.textContent = show ? 'Hide' : 'Show'
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password')
    })
    wrap.append(toggle)
  }

  return true
}
