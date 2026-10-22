/**
 * Sign-up steps 2 and 3 and the step-1 changes on /sign-in (social ship 2,
 * flows.html "3 · Signing up"; steps 2 and 3 redrawn by the profile-flow brief
 * and its mockups, Anders 22 Oct 2026). Runs only when the Worker marks the
 * page (SOCIAL_PROFILES on); otherwise the sign-in page is exactly as before.
 *
 * Step 1 (create account): "1 of 3", one password field with show/hide, the
 *   new consent line above the button, stored with its wording version.
 * Step 2 (your profile), built like the You card: the background with its
 *   camera, the round picture with its camera, and the name beside it (empty,
 *   "Your name", while the profile still has the neutral "Reader"; a set name
 *   shows with a pencil and edits in place). "Who can see you?": Public
 *   (preselected) or Private. Nothing is saved before Continue (an uploaded
 *   photo is held in the page until then); Skip saves no profile choice.
 *   Continue with Public: Everyone, and Show what I'm reading, Show my reading
 *   time and Leaderboard on. Private: Only me, all three off. Both mark the
 *   profile set up. The consent from step 1 is saved either way.
 * Step 3 (your reading): the languages read in (English, Dansk; at least one)
 *   and the version new books open in. Start reading returns to where the
 *   reader was.
 *
 * A returning reader reaches step 2 from the library's What's-new card
 * (/sign-in?mode=profile): then the counter reads "1 of 2", "2 of 2".
 *
 * Every failure falls back to today's path: the reader is never stuck here.
 */
import {
  EMAIL_CONSENT_TEXT,
  EMAIL_CONSENT_VERSION,
  NEUTRAL_NAME,
  NEW_BOOKS_COPY,
  PICTURE_SETS,
  READING_LANGUAGES,
  READING_LANGUAGE_COPY,
  LIBRARY_BACKGROUND,
  backgroundView,
  cleanReadingLanguages,
  defaultReadingLanguages,
  pictureView,
  toggleReadingLanguage,
  type BackgroundKind,
  type NewBooksOpenIn,
  type PictureKind,
  type ReadingLanguage,
} from './profileRules'
import {
  currentBookHint,
  fetchOwnProfile,
  ownBackground,
  ownPictureView,
  paintAvatar,
  privateImageUrl,
  rememberNewBooksOpenIn,
  rememberReadingLanguages,
  photoInMemory,
  photoUploadMessage,
  preparePhoto,
  saveProfile,
  socialProfilesOn,
  uploadProfileImage,
  type OwnProfile,
} from './socialClient'
import { photoAccept } from './photoAccept'
import { PHOTO_COPY } from './photoFile'
import { CARDS_COPY } from '../cards/cardsCopy'

export const SIGNUP_CONSENT_KEY = 'tinct:signup-consent'

/** Stock pictures of women among the choices (Anders, 14 October 2026): Longbourn's reader and The Awakening's cover. */
export const SIGNUP_WOMEN_PICTURES: readonly { kind: PictureKind; value: string; label: string }[] = [
  { kind: 'set', value: 'longbourn', label: 'Longbourn' },
  { kind: 'cover', value: 'the-awakening', label: 'The Awakening' },
]

/** The profile and reading steps' words (V2Profile and V2Originals mockups, 22 Oct 2026). */
export const PROFILE_STEP_COPY = {
  namePlaceholder: 'Your name',
  whoCanSee: 'Who can see you?',
  public: { label: 'Public', line: 'Your profile, reading and place on the leaderboard.' },
  private: { label: 'Private', line: 'Only you.' },
  unconfirmed: 'Others see you once you confirm your email. You can change this any time in Settings.',
  continue: 'Continue',
  skip: 'Skip',
  readingTitle: 'Your reading',
  languages: 'Which languages do you read in?',
  version: 'Which version should new books open in?',
  start: 'Start reading',
  pictureTitle: 'Choose a picture',
  backgroundTitle: 'Choose a background',
  libraryBackground: 'The library',
} as const

/** Device mark of the library's profile-step offer (libraryCards.ts LEGACY_SETUP_KEY_PREFIX). */
const PROFILE_STEP_OFFERED_PREFIX = 'tinct:profile-step-offered:'

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
.auth-page[data-mode=profile] .auth-card,.auth-page[data-mode=reading] .auth-card{padding:0;overflow:hidden;border-radius:26px;background:#f4f0e6;color:#1e1b16;font-family:var(--sans)}
.auth-page[data-mode=profile] .auth-status,.auth-page[data-mode=reading] .auth-status{margin:0 22px 18px}
.social-step[hidden]{display:none}
.social-body{display:flex;flex-direction:column;gap:6px;padding:18px 22px 22px}
.social-step h1{margin:0 0 8px;font:500 34px/1.12 var(--serif);letter-spacing:-.02em}
.social-reading{padding:30px 26px 22px}
.social-q{margin:0;padding:4px 4px 6px;color:#6f675b;font-size:15px}
.social-reading .social-q+.social-langs{margin-bottom:14px}
.social-banner{position:relative;height:150px;background:#2d2218 center/cover no-repeat}
.social-cam{position:absolute;display:grid;place-items:center;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:#f5f1e8;color:#111;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer}
.social-cam svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round}
.social-banner .social-cam{right:14px;top:14px}
.social-who{position:relative;display:flex;align-items:flex-end;gap:14px;margin-top:-46px;padding:0 22px}
.social-av{position:relative;flex:none;width:96px;height:96px;padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}
.social-av .tinct-avatar{width:96px;height:96px;box-shadow:0 0 0 4px #f4f0e6;font-size:36px}
.social-av .social-cam{right:-4px;bottom:-2px}
.social-name{flex:1;min-width:0;padding-bottom:4px}
.social-name input{display:block;width:100%;height:46px;box-sizing:border-box;padding:0 12px;border:0;border-radius:10px;background:#fffdf8;box-shadow:0 0 0 2px #2f2b26;color:#1e1b16;font:600 24px/1.2 "Playfair Display",Georgia,serif;outline:none}
.social-name input::placeholder{color:#8f8678;opacity:1}
.social-name-b{display:flex;align-items:center;gap:8px;max-width:100%;min-height:46px;padding:0 4px;border:0;background:transparent;color:#1e1b16;font:700 24px/1.2 "Playfair Display",Georgia,serif;text-align:left;cursor:text}
.social-name-b b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:inherit}
.social-name-b svg{flex:none;width:16px;height:16px;fill:none;stroke:#6f675b;stroke-width:1.4;stroke-linejoin:round;stroke-linecap:round}
.social-picker{margin:14px 22px 0;padding:12px;border-radius:14px;background:#ebe5d8}
.social-picker[hidden]{display:none}
.social-picker b{display:block;margin:0 0 9px;font-size:13px;font-weight:600}
.social-pictures{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
.social-pictures button{width:44px;height:44px;padding:0;border:0;border-radius:50%;cursor:pointer;background:transparent}
.social-pictures.is-bg button{width:72px;height:44px;border-radius:8px;background:#2d2218 center/cover no-repeat}
.social-pictures button[aria-pressed=true] .tinct-avatar,.social-pictures.is-bg button[aria-pressed=true]{box-shadow:0 0 0 2px #ebe5d8,0 0 0 3.5px #332e27}
.tinct-avatar{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:50%;background-color:#18241a;background-repeat:no-repeat;color:#e8d59e;font:500 18px/1 var(--serif);box-shadow:0 0 0 1px #ddd4c3;overflow:hidden}
.tinct-avatar[data-kind=initial]{background-image:linear-gradient(150deg,#2a3a2a,#18241a)}
.social-upload{display:block;min-height:40px;margin-top:6px;padding:0;border:0;background:transparent;color:#5e574e;font-size:13px;text-decoration:underline;cursor:pointer}
.social-upload:disabled{opacity:.55;cursor:default}
.social-picker input[type=file]{display:none}
.social-ticks{margin:0;padding:0;border:0;border-bottom:1px solid rgba(30,27,22,.12)}
.social-tick{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:56px;padding:14px 4px;border:0;border-top:1px solid rgba(30,27,22,.12);background:transparent;color:#1e1b16;text-align:left;font-size:18px;cursor:pointer}
.social-tick small{display:block;margin-top:3px;color:#6f675b;font-size:15px;line-height:1.35}
.social-tick .social-check{flex:none;color:#1e1b16;font-size:20px;visibility:hidden}
.social-tick[aria-checked=true] .social-check{visibility:visible}
.social-langs{display:flex;gap:10px}
.social-lang{flex:1;display:flex;align-items:center;gap:10px;height:52px;padding:0 14px;border:0;border-radius:12px;background:#fffdf8;box-shadow:0 0 0 1px rgba(30,27,22,.25);color:#1e1b16;font-size:18px;cursor:pointer}
.social-lang[aria-checked=true]{box-shadow:0 0 0 2px #2f2b26}
.social-lang span{display:grid;place-items:center;flex:none;width:24px;height:24px;box-sizing:border-box;border-radius:6px;border:1.5px solid rgba(30,27,22,.35);color:#f4f0e6;font-size:15px}
.social-lang[aria-checked=true] span{border:0;background:#2f2b26}
.social-note{margin:0;padding:8px 4px 0;color:#6f675b;font-size:14px;line-height:1.4}
.social-note[hidden]{display:none}
.auth-page[data-mode=profile] .auth-primary,.auth-page[data-mode=reading] .auth-primary{min-height:54px;margin-top:14px;border-radius:12px;background:#2f2b26;color:#f4f0e6;font:500 19px var(--sans)}
.social-skip{display:block;width:100%;min-height:44px;margin-top:2px;border:0;background:transparent;color:#625b52;font-size:16px;cursor:pointer}
@media(max-width:520px){.auth-page[data-mode=profile] .auth-card,.auth-page[data-mode=reading] .auth-card{padding:0;border-radius:26px}}
`

/** The camera on the background and the picture (the You card's). */
const CAMERA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>'
/** The pencil beside a set name. */
const PENCIL = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M9.6 2.4l2 2L5 11l-2.6.6L3 9z"/><path d="M8.4 3.6l2 2"/></svg>'

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
  // A returning reader comes to the profile step from the library (no account step): two steps.
  const returning = root?.dataset.socialFlow === 'returning'
  const step = mode === 'create' ? 1 : mode === 'profile' ? 2 : mode === 'reading' ? 3 : 0
  steps.hidden = !step
  steps.textContent = !step ? '' : returning ? `${step - 1} of 2` : `${step} of 3`
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

function camera(label: string, slot: string): HTMLButtonElement {
  const button = el('button', { type: 'button', className: 'social-cam', ariaLabel: label, innerHTML: CAMERA, dataset: { socialCamera: slot } })
  return button
}

/** The self-hosted fonts (Playfair Display for the name), once. */
function loadFonts(): void {
  if (document.querySelector('link[data-social-fonts]')) return
  const link = el('link', { rel: 'stylesheet', href: '/fonts/tinct-fonts.css', dataset: { socialFonts: '' } })
  document.head.append(link)
}

/** The visibility a profile step choice saves (brief section 3). */
export function visibilityChoice(choice: 'public' | 'private'): { visibility: 'everyone' | 'only_me'; showReading: boolean; showTime: boolean; onLeaderboard: boolean } {
  const on = choice === 'public'
  return { visibility: on ? 'everyone' : 'only_me', showReading: on, showTime: on, onLeaderboard: on }
}

type Photo = { blob: Blob; preview: string }

/**
 * After a new account is created, or for a returning reader whose profile was
 * never set up: steps 2 and 3. Falls back to today's welcome screen when
 * profiles cannot be read.
 */
export async function startProfileSteps(root: HTMLElement, token: string, hooks: SignInHooks): Promise<void> {
  const card = root.querySelector<HTMLElement>('.auth-card')
  // Reached from the library (no account step this visit): the two-step counter.
  if (new URLSearchParams(location.search).get('mode') === 'profile') root.dataset.socialFlow = 'returning'
  const result = await fetchOwnProfile(token, currentBookHint())
  if (!card || !result.ok) { hooks.fallbackWelcome(); return }
  loadFonts()
  const consent = takeSignupConsent()
  let profile: OwnProfile = result.profile

  // ---- Step 2: your profile ----
  const hint = PICTURE_SETS.find(set => set.id === profile.picture.value)
  const sets = [...(hint ? [hint] : []), ...PICTURE_SETS.filter(set => set !== hint)].slice(0, 3)
  const storedPhoto = profile.picture.kind === 'upload' || profile.picture.kind === 'google'
  let picture: { kind: PictureKind; value: string | null } = storedPhoto
    ? { kind: profile.picture.kind, value: null }
    : { kind: profile.picture.kind, value: profile.picture.value }
  // A profile that only has its initial starts on the first set's picture (shown, saved only on Continue).
  if (picture.kind === 'initial' && !hint) picture = { kind: 'set', value: sets[0].id }
  let background: { kind: BackgroundKind; value: string | null } = { kind: profile.background.kind, value: profile.background.value }
  /** The reader chose a background themselves; until then a chosen set brings its own. */
  let backgroundChosen = profile.background.kind === 'upload' || profile.setUp
  if (!backgroundChosen && picture.kind === 'set') background = { kind: 'set', value: picture.value }
  /** Photos chosen here, uploaded only on Continue. */
  const photos: { picture: Photo | null; background: Photo | null } = { picture: null, background: null }
  let choice: 'public' | 'private' = 'public'

  // The background, as on the You card.
  const banner = el('div', { className: 'social-banner', dataset: { socialBanner: '' } })
  const paintBanner = () => {
    if (photos.background) { banner.style.backgroundImage = `url("${photos.background.preview}")`; return }
    const view = background.kind === 'upload' ? ownBackground(profile) : backgroundView(background.kind, background.value)
    if (view.private) void privateImageUrl(token, view.src).then(src => { if (src) banner.style.backgroundImage = `url("${src}")` })
    else banner.style.backgroundImage = `url("${view.src}")`
  }
  const bannerCamera = camera(CARDS_COPY.changeBackground, 'background')
  banner.append(bannerCamera)

  // The round picture and the name beside it.
  const avatar = el('span')
  const pictureButton = el('button', { type: 'button', className: 'social-av', ariaLabel: CARDS_COPY.choosePicture, dataset: { socialCamera: 'picture' } }, avatar)
  pictureButton.insertAdjacentHTML('beforeend', `<span class="social-cam" aria-hidden="true">${CAMERA}</span>`)
  const neutral = profile.name === NEUTRAL_NAME
  const nameInput = el('input', { name: 'profileName', type: 'text', value: neutral ? '' : profile.name, maxLength: 40, autocomplete: 'name', placeholder: PROFILE_STEP_COPY.namePlaceholder })
  nameInput.setAttribute('aria-label', CARDS_COPY.nameLabel)
  const nameBox = el('div', { className: 'social-name' })
  const showName = (editing: boolean) => {
    if (editing || !nameInput.value.trim()) { nameBox.replaceChildren(nameInput); return }
    const text = el('button', { type: 'button', className: 'social-name-b', ariaLabel: CARDS_COPY.changeName, dataset: { socialName: '' } }, el('b', {}, nameInput.value.trim()))
    text.insertAdjacentHTML('beforeend', PENCIL)
    text.addEventListener('click', () => { showName(true); nameInput.focus(); nameInput.select() })
    nameBox.replaceChildren(text)
  }
  // A set name shows as text with a pencil; the neutral "Reader" opens as the empty field.
  showName(false)
  nameInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); nameInput.blur() } })
  nameInput.addEventListener('blur', () => { if (nameInput.value.trim()) showName(false) })
  nameInput.addEventListener('input', paintPicture)
  function paintPicture() {
    if (picture.kind === 'upload' && photos.picture) {
      avatar.classList.add('tinct-avatar')
      avatar.textContent = ''
      avatar.dataset.kind = 'photo'
      avatar.style.backgroundSize = 'cover'
      avatar.style.backgroundPosition = '50% 50%'
      avatar.style.backgroundImage = `url("${photos.picture.preview}")`
      return
    }
    const name = nameInput.value.trim() || profile.name
    paintAvatar(avatar, picture.kind === 'upload' || picture.kind === 'google' ? ownPictureView(profile) : pictureView(picture.kind, picture.value, name), token)
  }
  const who = el('div', { className: 'social-who' }, pictureButton, nameBox)

  // The choices behind the two cameras: stock pictures or backgrounds, and an upload while the Worker accepts them.
  const picker = el('div', { className: 'social-picker', hidden: true, dataset: { socialPicker: '' } })
  let pickerSlot: 'picture' | 'background' | null = null
  const uploadsOn = profile.uploads === true
  const files = { picture: el('input', { type: 'file', accept: photoAccept(), tabIndex: -1 }), background: el('input', { type: 'file', accept: photoAccept(), tabIndex: -1 }) }
  const closePicker = () => { picker.hidden = true; pickerSlot = null }
  const openPicker = (slot: 'picture' | 'background') => {
    if (pickerSlot === slot) { closePicker(); return }
    pickerSlot = slot
    const grid = el('div', { className: `social-pictures${slot === 'background' ? ' is-bg' : ''}` })
    const add = (label: string, pressed: boolean, paint: (button: HTMLButtonElement) => void, choose: () => void) => {
      const button = el('button', { type: 'button', ariaLabel: label })
      button.setAttribute('aria-pressed', String(pressed))
      paint(button)
      button.addEventListener('click', () => { choose(); closePicker() })
      grid.append(button)
    }
    if (slot === 'picture') {
      const choices: { label: string; kind: PictureKind; value: string | null }[] = [
        ...sets.map(set => ({ label: `Picture: ${set.label}`, kind: 'set' as PictureKind, value: set.id })),
        ...SIGNUP_WOMEN_PICTURES.filter(woman => !sets.some(set => woman.kind === 'set' && set.id === woman.value)).map(woman => ({ label: `Picture: ${woman.label}`, kind: woman.kind, value: woman.value })),
        { label: 'Picture: your initial', kind: 'initial', value: null },
      ]
      if (storedPhoto) choices.unshift({ label: CARDS_COPY.uploadPicture, kind: profile.picture.kind, value: null })
      for (const option of choices) {
        add(option.label, option.kind === picture.kind && option.value === picture.value && !photos.picture,
          button => {
            const face = el('span')
            paintAvatar(face, option.kind === 'upload' || option.kind === 'google' ? ownPictureView(profile) : pictureView(option.kind, option.value, nameInput.value.trim() || profile.name), token)
            button.append(face)
          },
          () => {
            picture = { kind: option.kind, value: option.value }
            photos.picture = null
            // Until the reader picks a background, a set brings its own and anything else keeps the profile's.
            if (!backgroundChosen) {
              background = option.kind === 'set' ? { kind: 'set', value: option.value } : { kind: profile.background.kind, value: profile.background.value }
              paintBanner()
            }
            paintPicture()
          })
      }
    } else {
      const choices: { label: string; kind: BackgroundKind; value: string | null; src: string }[] = [
        ...PICTURE_SETS.map(set => ({ label: `Background: ${set.label}`, kind: 'set' as BackgroundKind, value: set.id, src: set.room })),
        { label: `Background: ${PROFILE_STEP_COPY.libraryBackground}`, kind: 'library', value: null, src: LIBRARY_BACKGROUND },
      ]
      for (const option of choices) {
        add(option.label, option.kind === background.kind && option.value === background.value && !photos.background,
          button => { button.style.backgroundImage = `url("${option.src}")` },
          () => { background = { kind: option.kind, value: option.value }; backgroundChosen = true; photos.background = null; paintBanner() })
      }
    }
    const parts: Node[] = [el('b', {}, slot === 'picture' ? PROFILE_STEP_COPY.pictureTitle : PROFILE_STEP_COPY.backgroundTitle), grid]
    if (uploadsOn) {
      const upload = el('button', { type: 'button', className: 'social-upload', dataset: { socialUpload: slot } }, slot === 'picture' ? CARDS_COPY.uploadPicture : CARDS_COPY.uploadBackground)
      upload.addEventListener('click', () => files[slot].click())
      parts.push(upload)
    }
    picker.replaceChildren(...parts)
    picker.hidden = false
  }
  pictureButton.addEventListener('click', () => openPicker('picture'))
  bannerCamera.addEventListener('click', () => openPicker('background'))
  for (const slot of ['picture', 'background'] as const) {
    const field = files[slot]
    field.setAttribute('aria-hidden', 'true')
    field.addEventListener('change', async () => {
      const chosen = field.files?.[0]
      if (!chosen) { field.value = ''; return }
      const trigger = picker.querySelector<HTMLButtonElement>(`[data-social-upload="${slot}"]`)
      if (trigger) { trigger.disabled = true; trigger.setAttribute('aria-busy', 'true') }
      hooks.setStatus()
      let prepared: Awaited<ReturnType<typeof preparePhoto>>
      try {
        // Read into memory before the input is cleared (iPadOS may release a converted HEIC; photoInMemory).
        const photo = await photoInMemory(chosen)
        prepared = photo ? await preparePhoto(photo, slot) : { ok: false, message: PHOTO_COPY.unreadable }
      } finally {
        field.value = ''
        if (trigger) { trigger.disabled = false; trigger.removeAttribute('aria-busy') }
      }
      if (!prepared.ok) { hooks.setStatus(prepared.message, 'error'); return }
      // Held here and shown; uploaded only when the reader presses Continue.
      const kept = { blob: prepared.image, preview: URL.createObjectURL(prepared.image) }
      if (slot === 'picture') { photos.picture = kept; picture = { kind: 'upload', value: null }; paintPicture() }
      else { photos.background = kept; background = { kind: 'upload', value: null }; backgroundChosen = true; paintBanner() }
      closePicker()
    })
    picker.after(field)
  }

  // Who can see you.
  const unconfirmed = el('p', { className: 'social-note', hidden: profile.emailConfirmed }, PROFILE_STEP_COPY.unconfirmed)
  const visibilityList = tickList<'public' | 'private'>(PROFILE_STEP_COPY.whoCanSee, [
    { value: 'public', label: PROFILE_STEP_COPY.public.label, line: PROFILE_STEP_COPY.public.line },
    { value: 'private', label: PROFILE_STEP_COPY.private.label, line: PROFILE_STEP_COPY.private.line },
  ], choice, value => {
    choice = value
    // The line is about others seeing you: not for Private.
    unconfirmed.hidden = profile.emailConfirmed || value === 'private'
  })

  const continueButton = el('button', { type: 'button', className: 'auth-primary', dataset: { socialContinue: '' } }, PROFILE_STEP_COPY.continue)
  const skipButton = el('button', { type: 'button', className: 'social-skip', dataset: { socialSkip: '' } }, PROFILE_STEP_COPY.skip)
  const step2 = el('div', { className: 'social-step', dataset: { modeCopy: 'profile' }, hidden: true },
    banner, who, picker,
    el('div', { className: 'social-body' },
      el('p', { className: 'social-q' }, PROFILE_STEP_COPY.whoCanSee), visibilityList, unconfirmed,
      continueButton, skipButton))
  for (const field of Object.values(files)) step2.append(field)
  paintBanner()
  paintPicture()

  // ---- Step 3: your reading ----
  let languages: ReadingLanguage[] = profile.setUp ? cleanReadingLanguages(profile.readingLanguages) ?? ['en'] : defaultReadingLanguages(typeof navigator === 'undefined' ? [] : [...(navigator.languages ?? []), navigator.language].filter(Boolean))
  let newBooks: NewBooksOpenIn = profile.newBooksOpenIn || 'modern'
  const languageBoxes = el('div', { className: 'social-langs', dataset: { socialLanguages: '' } })
  languageBoxes.setAttribute('role', 'group')
  languageBoxes.setAttribute('aria-label', PROFILE_STEP_COPY.languages)
  const languageButtons = READING_LANGUAGES.map(language => {
    const box = el('button', { type: 'button', className: 'social-lang', dataset: { value: language } }, el('span', { ariaHidden: 'true' }), READING_LANGUAGE_COPY[language])
    box.setAttribute('role', 'checkbox')
    box.addEventListener('click', () => { languages = toggleReadingLanguage(languages, language); paintLanguages() })
    languageBoxes.append(box)
    return box
  })
  const paintLanguages = () => languageButtons.forEach(box => {
    const on = languages.includes(box.dataset.value as ReadingLanguage)
    box.setAttribute('aria-checked', String(on))
    box.querySelector('span')!.textContent = on ? '✓' : ''
  })
  paintLanguages()
  const startButton = el('button', { type: 'button', className: 'auth-primary', dataset: { socialStart: '' } }, PROFILE_STEP_COPY.start)
  const step3 = el('div', { className: 'social-step social-reading', dataset: { modeCopy: 'reading' }, hidden: true },
    el('h1', {}, PROFILE_STEP_COPY.readingTitle),
    el('p', { className: 'social-q' }, PROFILE_STEP_COPY.languages), languageBoxes,
    el('p', { className: 'social-q' }, PROFILE_STEP_COPY.version),
    tickList<NewBooksOpenIn>(PROFILE_STEP_COPY.version, (['modern', 'human'] as const).map(value => ({ value, label: NEW_BOOKS_COPY[value].label, line: NEW_BOOKS_COPY[value].line })), newBooks, value => { newBooks = value }),
    startButton)

  card.querySelector('[data-auth-status]')?.before(step2, step3)
  hooks.setMode('profile')

  const busy = (on: boolean) => { [continueButton, skipButton, startButton, bannerCamera, pictureButton].forEach(button => { button.disabled = on }) }
  const consentBody = consent ? { consent } : {}

  continueButton.addEventListener('click', async () => {
    busy(true)
    hooks.setStatus()
    try {
      // The photos chosen here go up first; nothing was stored before this press.
      for (const slot of ['picture', 'background'] as const) {
        const photo = photos[slot]
        if (!photo) continue
        const saved = await uploadProfileImage(token, slot, photo.blob)
        if (!saved.ok) { hooks.setStatus(photoUploadMessage(saved, CARDS_COPY.saveFailed), 'error'); return }
        profile = saved.profile
        photos[slot] = null
      }
      const body: Record<string, unknown> = { ...consentBody, ...visibilityChoice(choice), setUp: true }
      const name = nameInput.value.trim()
      if (name && name !== profile.name) body.name = name
      if (picture.kind !== 'upload' && picture.kind !== 'google') body.picture = picture
      if (background.kind !== 'upload' && (background.kind !== profile.background.kind || background.value !== profile.background.value)) body.background = background
      const saved = await saveProfile(token, body)
      if (!saved.ok) {
        if (saved.reason === 'invalid') { hooks.setStatus(saved.message || 'Please check your profile.', 'error'); return }
        hooks.setMode('reading')
        return
      }
      profile = saved.profile
      hooks.setMode('reading')
    } finally {
      busy(false)
    }
  })
  skipButton.addEventListener('click', async () => {
    busy(true)
    // Skip saves no profile choice: only the consent from the account step, and
    // that the step was offered, so the library does not offer it again.
    markOffered(token)
    await saveProfile(token, { ...consentBody, prompted: true })
    busy(false)
    hooks.setMode('reading')
  })
  startButton.addEventListener('click', async () => {
    busy(true)
    rememberNewBooksOpenIn(newBooks)
    rememberReadingLanguages(languages)
    await saveProfile(token, { newBooksOpenIn: newBooks, readingLanguages: languages })
    hooks.finish()
  })
}

/** This device offered the step (the library's mark), keyed by the account in the token. */
function markOffered(token: string): void {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { sub?: unknown }
    if (typeof payload.sub === 'string') localStorage.setItem(PROFILE_STEP_OFFERED_PREFIX + payload.sub, '1')
  } catch { /* not a JWT or private mode: the account's prompted mark still stands */ }
}
