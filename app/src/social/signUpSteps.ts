/**
 * Sign-up steps 2 and 3 and the step-1 changes on /sign-in (social ship 2,
 * flows.html "3 · Signing up"). Runs only when the Worker marks the page
 * (SOCIAL_PROFILES on); otherwise the sign-in page is exactly as before.
 *
 * Step 1 (create account): "1 of 3", one password field with show/hide, the
 *   new consent line above the button, stored with its wording version.
 * Step 2 (your profile): picture (a set or the initial; no uploads at launch), name
 *   (prefilled), who can see your reading (Friends preselected). Continue, or
 *   Skip (Only me).
 * Step 3: "Modern English or human translations?" sets New books open in.
 *   Start reading returns to where the reader was. No welcome toast (cut by
 *   Anders, 7 October 2026).
 *
 * Every failure falls back to today's path: the reader is never stuck here.
 */
import {
  EMAIL_CONSENT_TEXT,
  EMAIL_CONSENT_VERSION,
  NEW_BOOKS_COPY,
  PICTURE_SETS,
  VISIBILITY_COPY,
  pictureForBook,
  pictureView,
  type NewBooksOpenIn,
  type PictureKind,
  type Visibility,
} from './profileRules'
import {
  currentBookHint,
  fetchOwnProfile,
  paintAvatar,
  rememberNewBooksOpenIn,
  saveProfile,
  socialProfilesOn,
  type OwnProfile,
} from './socialClient'

export const SIGNUP_CONSENT_KEY = 'tinct:signup-consent'

const STYLE = `
.auth-page.is-social[data-mode=create] .auth-eyebrow{display:none}
.auth-page.is-social .auth-or{text-transform:none;font-size:11px}
.auth-page.is-social .auth-top{position:relative}
.social-steps{position:absolute;right:clamp(18px,4vw,54px);top:50%;transform:translateY(-50%);color:#9fb0b8;font-size:12px}
.social-steps[hidden]{display:none}
.social-pw{position:relative;display:block}
.social-pw input{padding-right:64px}
.social-pw-toggle{position:absolute;right:6px;bottom:6px;height:34px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:#5e574e;font-size:12px;cursor:pointer;text-decoration:underline}
.auth-page.is-social [data-email-optin-field]{margin-top:12px}
.auth-page[data-mode=profile] form,.auth-page[data-mode=reading] form{display:none}
.auth-page[data-mode=profile] [data-auth-providers],.auth-page[data-mode=reading] [data-auth-providers],.auth-page[data-mode=profile] .auth-or,.auth-page[data-mode=reading] .auth-or{display:none}
.social-step h1{margin:0 0 8px;font:500 30px/1.1 var(--serif);letter-spacing:-.02em}
.social-step .auth-copy{margin-bottom:14px}
.social-label{display:block;margin:14px 0 7px;color:#625b52;font-size:12px}
.social-pictures{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
.social-pictures button{width:44px;height:44px;padding:0;border:0;border-radius:50%;cursor:pointer;background:transparent}
.social-pictures button[aria-pressed=true] .tinct-avatar{box-shadow:0 0 0 2px #f6f1e6,0 0 0 3.5px #332e27}
.tinct-avatar{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:50%;background-color:#18241a;background-repeat:no-repeat;color:#e8d59e;font:500 18px/1 var(--serif);box-shadow:0 0 0 1px #ddd4c3;overflow:hidden}
.tinct-avatar[data-kind=initial]{background-image:linear-gradient(150deg,#2a3a2a,#18241a)}
.social-step .auth-field input{font-size:16px}
.social-ticks{margin:0;padding:0;border:0;border-top:1px solid #e3dacb}
.social-tick{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;padding:9px 2px;border:0;border-bottom:1px solid #e3dacb;background:transparent;color:#2d2924;text-align:left;font-size:14px;cursor:pointer}
.social-tick small{display:block;margin-top:2px;color:#8a8274;font-size:12px}
.social-tick .social-check{color:#332e27;font-size:15px;visibility:hidden}
.social-tick[aria-checked=true] .social-check{visibility:visible}
.social-note{margin:10px 0 0;color:#6b645a;font-size:12px;line-height:1.45}
.social-note[hidden]{display:none}
.social-skip{display:block;width:100%;min-height:40px;margin-top:6px;border:0;background:transparent;color:#625b52;font-size:13px;cursor:pointer}
`

interface SignInHooks {
  setMode: (mode: string) => void
  setStatus: (message?: string, tone?: 'error' | 'success' | 'neutral') => void
  finish: () => void
  /** Today's welcome screen: the fallback when profiles cannot be reached. */
  fallbackWelcome: () => void
}

/** Step 1 changes and the account page link. Returns false (and touches nothing) when profiles are off. */
export function enhanceSignInPage(root: HTMLElement | null): boolean {
  if (!root || !socialProfilesOn()) return false
  root.classList.add('is-social')
  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.append(style)

  // "1 of 3" in the top bar while creating an account.
  const steps = document.createElement('span')
  steps.className = 'social-steps'
  steps.dataset.socialSteps = ''
  root.querySelector('.auth-top')?.append(steps)

  // Step 1 copy (flows.html).
  const create = root.querySelector<HTMLElement>('[data-mode-copy="create"]')
  if (create?.querySelector('h1')) {
    create.querySelector('h1')!.textContent = 'Create your account'
    const copy = create.querySelector('.auth-copy')
    if (copy) copy.textContent = 'Free. Your first month includes audiobooks and the reading companion.'
  }
  const submitCreate = root.querySelector<HTMLElement>('[data-auth-submit] [data-mode-copy="create"]')
  if (submitCreate) submitCreate.textContent = 'Create account'

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

  // The consent line: Anders's wording, unticked, above the button so it is
  // seen before the account is created (Anders, 14 October 2026).
  const consent = root.querySelector<HTMLElement>('[data-email-optin-field]')
  const consentText = consent?.querySelector('span')
  if (consent && consentText) consentText.textContent = EMAIL_CONSENT_TEXT

  return true
}

export function updateStepCounter(root: HTMLElement | null, mode: string): void {
  const steps = root?.querySelector<HTMLElement>('[data-social-steps]')
  if (!steps) return
  const step = mode === 'create' ? 1 : mode === 'profile' ? 2 : mode === 'reading' ? 3 : 0
  steps.hidden = !step
  steps.textContent = step ? `${step} of 3` : ''
}

/** Remember the consent choice across the Google round-trip; it is saved once the account exists. */
export function rememberSignupConsent(root: HTMLElement | null): void {
  const box = root?.querySelector<HTMLInputElement>('[name=emailOptIn]')
  try {
    sessionStorage.setItem(SIGNUP_CONSENT_KEY, JSON.stringify({ optIn: box?.checked === true, version: EMAIL_CONSENT_VERSION }))
  } catch { /* private mode: the reader can switch reading emails on in Settings */ }
}

function takeSignupConsent(): { optIn: boolean; version: string } | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(SIGNUP_CONSENT_KEY) || 'null')
    sessionStorage.removeItem(SIGNUP_CONSENT_KEY)
    return value && typeof value.optIn === 'boolean' && typeof value.version === 'string' ? value : null
  } catch {
    return null
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { dataset?: Record<string, string> } = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  const { dataset, ...rest } = props
  Object.assign(node, rest)
  if (dataset) Object.assign(node.dataset, dataset)
  node.append(...children)
  return node
}

function tickList<T extends string>(name: string, options: { value: T; label: string; line?: string }[], selected: T, onChoose: (value: T) => void): HTMLElement {
  const list = el('div', { className: 'social-ticks' })
  list.setAttribute('role', 'radiogroup')
  list.setAttribute('aria-label', name)
  const buttons = options.map(option => {
    const button = el('button', { type: 'button', className: 'social-tick', dataset: { value: option.value } },
      el('span', {}, option.label, ...(option.line ? [el('small', {}, option.line)] : [])),
      el('span', { className: 'social-check' }, '✓'))
    button.setAttribute('role', 'radio')
    button.setAttribute('aria-checked', String(option.value === selected))
    button.addEventListener('click', () => {
      buttons.forEach(other => other.setAttribute('aria-checked', String(other === button)))
      onChoose(option.value)
    })
    return button
  })
  list.append(...buttons)
  return list
}

/**
 * After a new account is created: steps 2 and 3. Falls back to today's
 * welcome screen when profiles cannot be read.
 */
export async function startProfileSteps(root: HTMLElement, token: string, hooks: SignInHooks): Promise<void> {
  const card = root.querySelector<HTMLElement>('.auth-card')
  const result = await fetchOwnProfile(token, currentBookHint())
  if (!card || !result.ok) { hooks.fallbackWelcome(); return }
  const consent = takeSignupConsent()
  let profile: OwnProfile = result.profile

  // ---- Step 2: your profile ----
  const hint = PICTURE_SETS.find(set => set.id === profile.picture.value)
  const sets = [...(hint ? [hint] : []), ...PICTURE_SETS.filter(set => set !== hint)].slice(0, 3)
  let picture: { kind: PictureKind; value: string | null } = profile.picture.kind === 'set' || profile.picture.kind === 'cover' || profile.picture.kind === 'initial'
    ? { kind: profile.picture.kind, value: profile.picture.value }
    : pictureForBook(null)
  if (picture.kind === 'initial' && !hint) picture = { kind: 'set', value: sets[0].id }
  // A new profile is Only me until the reader picks otherwise (privacy notice).
  let visibility: Visibility = 'only_me'

  const pictures = el('div', { className: 'social-pictures' })
  const pictureButtons: HTMLButtonElement[] = []
  const choosePicture = (button: HTMLButtonElement, next: { kind: PictureKind; value: string | null }) => {
    picture = next
    pictureButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)))
  }
  const addPicture = (label: string, next: { kind: PictureKind; value: string | null }) => {
    const avatar = el('span')
    paintAvatar(avatar, pictureView(next.kind, next.value, nameInput.value || profile.name), token)
    const button = el('button', { type: 'button', ariaLabel: label }, avatar)
    button.setAttribute('aria-pressed', String(next.kind === picture.kind && next.value === picture.value))
    button.addEventListener('click', () => choosePicture(button, next))
    pictureButtons.push(button)
    pictures.append(button)
    return { button, avatar }
  }
  const nameInput = el('input', { name: 'profileName', type: 'text', value: profile.name, maxLength: 40, autocomplete: 'name' })
  for (const set of sets) addPicture(`Picture: ${set.label}`, { kind: 'set', value: set.id })
  const initial = addPicture('Picture: your initial', { kind: 'initial', value: null })
  nameInput.addEventListener('input', () => paintAvatar(initial.avatar, pictureView('initial', null, nameInput.value || profile.name), token))
  // No photo uploads at launch (8 Oct 2026): a set, a cover detail or the initial.

  const everyoneNote = el('p', { className: 'social-note', hidden: true }, 'Everyone starts once you confirm your email. Until then, friends can see you.')
  const visibilityList = tickList<Visibility>('Who can see your reading', [
    { value: 'only_me', label: VISIBILITY_COPY.only_me.label },
    { value: 'friends', label: VISIBILITY_COPY.friends.label, line: 'people you both follow' },
    { value: 'everyone', label: VISIBILITY_COPY.everyone.label },
  ], visibility, value => {
    visibility = value
    everyoneNote.hidden = !(value === 'everyone' && !profile.emailConfirmed)
  })

  const continueButton = el('button', { type: 'button', className: 'auth-primary', dataset: { socialContinue: '' } }, 'Continue')
  const skipButton = el('button', { type: 'button', className: 'social-skip', dataset: { socialSkip: '' } }, 'Skip')
  const step2 = el('div', { className: 'social-step', dataset: { modeCopy: 'profile' }, hidden: true },
    el('h1', {}, 'Your profile'),
    el('span', { className: 'social-label' }, 'Picture'), pictures,
    el('label', { className: 'auth-field' }, 'Name', nameInput),
    el('span', { className: 'social-label' }, 'Who can see your reading'), visibilityList, everyoneNote,
    continueButton, skipButton)

  // ---- Step 3: Modern English or human translations? ----
  let newBooks: NewBooksOpenIn = profile.newBooksOpenIn || 'modern'
  const startButton = el('button', { type: 'button', className: 'auth-primary', dataset: { socialStart: '' } }, 'Start reading')
  const step3 = el('div', { className: 'social-step', dataset: { modeCopy: 'reading' }, hidden: true },
    el('h1', {}, 'Modern English or human translations?'),
    el('p', { className: 'auth-copy' }, 'Which version should new books open in? You can switch any book, any time.'),
    tickList<NewBooksOpenIn>('New books open in', (['modern', 'human'] as const).map(value => ({ value, label: NEW_BOOKS_COPY[value].label, line: NEW_BOOKS_COPY[value].line })), newBooks, value => { newBooks = value }),
    startButton)

  card.querySelector('[data-auth-status]')?.before(step2, step3)
  hooks.setMode('profile')

  const busy = (on: boolean) => { [continueButton, skipButton, startButton].forEach(button => { button.disabled = on }) }
  const consentBody = consent ? { consent } : {}

  continueButton.addEventListener('click', async () => {
    busy(true)
    hooks.setStatus()
    const body: Record<string, unknown> = { ...consentBody, name: nameInput.value, visibility, setUp: true }
    body.picture = picture
    // A set brings its background with it.
    if (picture.kind === 'set') body.background = { kind: 'set', value: picture.value }
    const saved = await saveProfile(token, body)
    busy(false)
    if (!saved.ok) {
      if (saved.reason === 'invalid') { hooks.setStatus(saved.message || 'Please check your profile.', 'error'); return }
      hooks.setMode('reading')
      return
    }
    profile = saved.profile
    hooks.setMode('reading')
  })
  skipButton.addEventListener('click', async () => {
    busy(true)
    // Skip for now = Only me.
    await saveProfile(token, { ...consentBody, skip: true })
    busy(false)
    hooks.setMode('reading')
  })
  startButton.addEventListener('click', async () => {
    busy(true)
    rememberNewBooksOpenIn(newBooks)
    await saveProfile(token, { newBooksOpenIn: newBooks })
    hooks.finish()
  })
}
