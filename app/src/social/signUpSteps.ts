import { ICONS } from '../cards/cardStack'
/** Approved 22 October profile and reading steps. Choices stay on this
 * device until Continue / Start reading. Skip performs no account write. */
import {
  EMAIL_CONSENT_TEXT,
  EMAIL_CONSENT_VERSION,
  NEW_BOOKS_COPY,
  PICTURE_SETS,
  pictureView,
  type NewBooksOpenIn,
  type PictureKind,
  type Visibility,
} from './profileRules'
import {
  currentBookHint,
  fetchOwnProfile,
  ownPictureView,
  ownBackground,
  paintBackground,
  paintAvatar,
  rememberNewBooksOpenIn,
  photoInMemory,
  photoUploadMessage,
  preparePhoto,
  saveProfile,
  socialProfilesOn,
  uploadProfileImage,
  type OwnProfile,
} from './socialClient'
import { initialReadingLanguages, toggleReadingLanguage, type ReadingLanguage } from './readingLanguages'
import { photoAccept } from './photoAccept'
import { PHOTO_COPY } from './photoFile'
import { CARDS_COPY } from '../cards/cardsCopy'

export const SIGNUP_CONSENT_KEY = 'tinct:signup-consent'

/** Stock pictures of women among the choices (Anders, 14 October 2026): Longbourn's reader and The Awakening's cover. */
export const SIGNUP_WOMEN_PICTURES: readonly { kind: PictureKind; value: string; label: string }[] = [
  { kind: 'set', value: 'longbourn', label: 'Longbourn' },
  { kind: 'cover', value: 'the-awakening', label: 'The Awakening' },
]

const STYLE = `
.auth-page.is-social[data-mode=create] .auth-eyebrow{display:none}
.auth-page.is-social .auth-or{text-transform:none;font-size:11px}
.auth-page.is-social .auth-top{position:relative}
.social-profile-banner{height:110px;position:relative;background-size:cover;background-position:center;border-radius:14px}
.social-profile-identity{display:flex;gap:16px;align-items:center;margin:-24px 12px 14px;position:relative}
.social-profile-picture{position:relative;flex:none}
.social-profile-picture .tinct-avatar{width:72px;height:72px;border:3px solid #f6f1e6}
.social-profile-identity .auth-field{flex:1;min-width:0;margin:24px 0 0}
.social-camera,.social-name-pencil{border:0;border-radius:50%;padding:8px;background:#f6f1e6;color:#332e27;cursor:pointer}
.social-camera{position:absolute;right:-4px;bottom:0}
.social-background-camera{right:8px;bottom:8px}
.social-name-pencil{margin-left:8px}
.social-camera svg,.social-name-pencil svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.4}
.social-step [hidden]{display:none!important}
.social-pictures[hidden]{display:none}
.social-backgrounds{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
.social-backgrounds button{width:auto;min-height:72px;height:auto;border-radius:8px;background-size:cover;background-position:center;color:white;text-shadow:0 1px 4px #000;padding:8px;font-size:12px}
.social-pictures .social-upload-choice{width:100%;height:40px;min-height:40px;grid-column:1/-1;border-radius:8px;color:#332e27;text-shadow:none;background:#eee7d8}
.social-pictures input[type=file]{display:none}
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
.social-uploads{display:flex;flex-wrap:wrap;gap:4px 16px;align-items:center;margin-top:6px}
.social-uploads button{min-height:40px;padding:0;border:0;background:transparent;color:#625b52;font-size:12px;text-decoration:underline;cursor:pointer}
.social-uploads button:disabled{opacity:.55;cursor:default}
.social-uploads input{display:none}
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
  let picture: { kind: PictureKind; value: string | null } = { kind: profile.picture.kind, value: profile.picture.value }
  let uploadedPreview: string | null = null
  // Public is a form default only; the account stays private until Continue.
  let visibility: Visibility = 'everyone'

  const pictures = el('div', { className: 'social-pictures' })
  const pictureButtons: HTMLButtonElement[] = []
  const choosePicture = (button: HTMLButtonElement, next: { kind: PictureKind; value: string | null }) => {
    picture = next
    paintAvatar(heroAvatar, pictureView(next.kind, next.value, nameInput.value || profile.name), token)
    if (next.kind === 'upload' && uploadedPreview) heroAvatar.style.backgroundImage = `url("${uploadedPreview}")`
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
  const nameInput = el('input', { name: 'profileName', type: 'text', value: profile.name === 'Reader' ? '' : profile.name, placeholder: 'Your name', maxLength: 40, autocomplete: 'name' })
  const heroAvatar = el('span', { className: 'social-profile-avatar' })
  paintAvatar(heroAvatar, ownPictureView(profile), token)
  const banner = el('div', { className: 'social-profile-banner' })
  paintBackground(banner, ownBackground(profile), token)
  const pictureCamera = el('button', { type: 'button', className: 'social-camera', ariaLabel: 'Choose picture' })
  pictureCamera.innerHTML = ICONS.cam
  pictureCamera.addEventListener('click', () => { pictures.hidden = !pictures.hidden })
  pictures.hidden = true
  const backgroundChoices = el('div', { className: 'social-pictures social-backgrounds', hidden: true })
  let backgroundChoice: { kind: 'set'; value: string } | null = null
  const backgroundCamera = el('button', { type: 'button', className: 'social-camera social-background-camera', ariaLabel: 'Choose background' })
  backgroundCamera.innerHTML = ICONS.cam
  backgroundCamera.addEventListener('click', () => { backgroundChoices.hidden = !backgroundChoices.hidden })
  banner.append(backgroundCamera)
  for (const set of sets) {
    const button = el('button', { type: 'button', ariaLabel: `Background: ${set.label}` }, set.label)
    paintBackground(button, ownBackground({ background: { kind: 'set', value: set.id, url: null, review: 'none' } }), token)
    button.addEventListener('click', () => {
      backgroundChoice = { kind: 'set', value: set.id }
      delete pendingPhotos.background
      backgroundUploaded = false
      paintBackground(banner, ownBackground({ background: { kind: 'set', value: set.id, url: null, review: 'none' } }), token)
    })
    backgroundChoices.append(button)
  }
  const nameText = el('span', {}, nameInput.value)
  const pencil = el('button', { type: 'button', className: 'social-name-pencil', ariaLabel: 'Edit name' })
  pencil.innerHTML = ICONS.pencil
  nameInput.hidden = !!nameInput.value
  nameText.hidden = pencil.hidden = !nameInput.value
  pencil.addEventListener('click', () => { nameInput.hidden = false; nameText.hidden = pencil.hidden = true; nameInput.focus() })
  const hero = el('div', { className: 'social-profile-hero' }, banner,
    el('div', { className: 'social-profile-identity' }, el('div', { className: 'social-profile-picture' }, heroAvatar, pictureCamera),
      el('label', { className: 'auth-field' }, nameText, pencil, nameInput)))
  for (const set of sets) addPicture(`Picture: ${set.label}`, { kind: 'set', value: set.id })
  for (const woman of SIGNUP_WOMEN_PICTURES) {
    if (!sets.some(set => woman.kind === 'set' && set.id === woman.value)) addPicture(`Picture: ${woman.label}`, { kind: woman.kind, value: woman.value })
  }
  const initial = addPicture('Picture: your initial', { kind: 'initial', value: null })
  nameInput.addEventListener('input', () => paintAvatar(initial.avatar, pictureView('initial', null, nameInput.value || profile.name), token))

  // Prepare uploads locally; only Continue may send them to the account.
  let uploadedPicture: { button: HTMLButtonElement; avatar: HTMLElement } | null = null
  let backgroundUploaded = false
  const pendingPhotos: Partial<Record<'picture' | 'background', Blob>> = {}
  const previewUrls: string[] = []
  const releasePreviews = () => { previewUrls.forEach(url => URL.revokeObjectURL(url)); previewUrls.length = 0 }
  const uploads = profile.uploads === true ? el('div', { className: 'social-uploads', dataset: { socialUploads: '' } }) : null
  if (uploads) {
    pictures.dataset.socialUploads = ''
    backgroundChoices.dataset.socialUploads = ''
    for (const slot of ['picture', 'background'] as const) {
      const field = el('input', { type: 'file', accept: photoAccept(), tabIndex: -1 })
      field.setAttribute('aria-hidden', 'true')
      const label = slot === 'picture' ? CARDS_COPY.uploadPicture : CARDS_COPY.uploadBackground
      const trigger = el('button', { type: 'button', className: 'social-upload-choice', dataset: { socialUpload: slot } }, label)
      trigger.addEventListener('click', () => field.click())
      field.addEventListener('change', async () => {
        const chosen = field.files?.[0]
        if (!chosen) { field.value = ''; return }
        busy(true)
        trigger.disabled = true
        trigger.setAttribute('aria-busy', 'true')
        hooks.setStatus()
        let prepared: Awaited<ReturnType<typeof preparePhoto>>
        try {
          // Read into memory before the input is cleared (iPadOS may release a converted HEIC; photoInMemory).
          const photo = await photoInMemory(chosen)
          // Every failure says why: the photo's own problem, or the upload's.
          prepared = photo ? await preparePhoto(photo, slot) : { ok: false, message: PHOTO_COPY.unreadable }

        } finally {
          field.value = ''
          busy(false)
          trigger.disabled = false
          trigger.removeAttribute('aria-busy')
        }
        if (!prepared.ok) { hooks.setStatus(prepared.message, 'error'); return }
        pendingPhotos[slot] = prepared.image
        const preview = URL.createObjectURL(prepared.image)
        previewUrls.push(preview)
        if (slot === 'background') { backgroundUploaded = true; banner.style.backgroundImage = `url("${preview}")`; return }
        // The local preview joins the choices; it has not been uploaded.
        if (!uploadedPicture) {
          const avatar = el('span')
          const button = el('button', { type: 'button', ariaLabel: CARDS_COPY.uploadPicture }, avatar)
          button.addEventListener('click', () => choosePicture(button, { kind: 'upload', value: null }))
          pictureButtons.push(button)
          pictures.prepend(button)
          uploadedPicture = { button, avatar }
        }
        uploadedPreview = preview
        uploadedPicture.avatar.className = 'tinct-avatar'
        uploadedPicture.avatar.style.backgroundImage = `url("${preview}")`
        choosePicture(uploadedPicture.button, { kind: 'upload', value: null })
        heroAvatar.style.backgroundImage = `url("${preview}")`
      })
      ;(slot === 'picture' ? pictures : backgroundChoices).append(trigger, field)
    }
  }

  const everyoneNote = el('p', { className: 'social-note', hidden: profile.emailConfirmed }, 'Others see you once you confirm your email. You can change this any time in Settings.')
  const visibilityList = tickList<Visibility>('Who can see you?', [
    { value: 'everyone', label: 'Public', line: 'Your profile, reading and place on the leaderboard.' },
    { value: 'only_me', label: 'Private', line: 'Only you.' },
  ], visibility, value => { visibility = value })

  const continueButton = el('button', { type: 'button', className: 'auth-primary', dataset: { socialContinue: '' } }, 'Continue')
  const skipButton = el('button', { type: 'button', className: 'social-skip', dataset: { socialSkip: '' } }, 'Skip')
  const step2 = el('div', { className: 'social-step', dataset: { modeCopy: 'profile' }, hidden: true },
    el('h1', {}, 'Your profile'),
    hero, pictures, backgroundChoices,
    el('span', { className: 'social-label' }, 'Who can see you?'), visibilityList, everyoneNote,
    continueButton, skipButton)

  // ---- Step 3: Modern English or human translations? ----
  let newBooks: NewBooksOpenIn = profile.newBooksOpenIn || 'modern'
  let languages = initialReadingLanguages(navigator.languages ?? [navigator.language])
  const languageChoices = el('div', { className: 'social-ticks' })
  languageChoices.setAttribute('role', 'group'); languageChoices.setAttribute('aria-label', 'Which languages do you read in?')
  const languageButtons = (['en', 'da'] as const).map(language => {
    const button = el('button', { type: 'button', className: 'social-tick', dataset: { language } }, language === 'en' ? 'English' : 'Dansk', el('span', { className: 'social-check' }, '✓'))
    button.setAttribute('role', 'checkbox'); button.setAttribute('aria-checked', String(languages.includes(language)))
    button.addEventListener('click', () => { languages = toggleReadingLanguage(languages, language); languageButtons.forEach(other => other.setAttribute('aria-checked', String(languages.includes(other.dataset.language as ReadingLanguage)))) })
    return button
  })
  languageChoices.append(...languageButtons)
  const readingSkip = el('button', { type: 'button', className: 'social-skip', dataset: { socialReadingSkip: '' } }, 'Skip')
  const startButton = el('button', { type: 'button', className: 'auth-primary', dataset: { socialStart: '' } }, 'Start reading')
  const step3 = el('div', { className: 'social-step', dataset: { modeCopy: 'reading' }, hidden: true },
    el('h1', {}, 'Your reading'),
    el('p', { className: 'social-label' }, 'Which languages do you read in?'), languageChoices,
    el('p', { className: 'social-label' }, 'Which version should new books open in?'),
    tickList<NewBooksOpenIn>('New books open in', (['modern', 'human'] as const).map(value => ({ value, label: NEW_BOOKS_COPY[value].label, line: NEW_BOOKS_COPY[value].line })), newBooks, value => { newBooks = value }),
    startButton, readingSkip)

  card.querySelector('[data-auth-status]')?.before(step2, step3)
  hooks.setMode('profile')

  const busy = (on: boolean) => { [continueButton, skipButton, startButton, readingSkip].forEach(button => { button.disabled = on }) }
  const consentBody = consent ? { consent } : {}

  continueButton.addEventListener('click', async () => {
    busy(true)
    hooks.setStatus()
    const body: Record<string, unknown> = { ...consentBody, name: nameInput.value, visibility, showReading: visibility === 'everyone', showTime: visibility === 'everyone', onLeaderboard: visibility === 'everyone', setUp: true }
    // Uploaded image bytes are sent only after the profile choices succeed.
    if (picture.kind !== 'upload' && picture.kind !== 'google') body.picture = picture
    // A set brings its background with it, unless the reader uploaded their own.
    if (backgroundChoice && !backgroundUploaded) body.background = backgroundChoice
    const saved = await saveProfile(token, body)
    if (!saved.ok) { busy(false); hooks.setStatus(saved.message || CARDS_COPY.saveFailed, 'error'); return }
    profile = saved.profile
    for (const slot of ['background', 'picture'] as const) {
      const image = pendingPhotos[slot]
      if (!image || (slot === 'picture' && picture.kind !== 'upload')) continue
      const uploaded = await uploadProfileImage(token, slot, image)
      if (!uploaded.ok) { busy(false); hooks.setStatus(photoUploadMessage(uploaded, CARDS_COPY.saveFailed), 'error'); return }
      delete pendingPhotos[slot]
      profile = uploaded.profile
    }
    busy(false)
    releasePreviews()
    hooks.setMode('reading')
  })
  skipButton.addEventListener('click', () => {
    releasePreviews()
    hooks.setMode('reading')
  })
  readingSkip.addEventListener('click', () => hooks.finish())
  startButton.addEventListener('click', async () => {
    busy(true)
    const saved = await saveProfile(token, { newBooksOpenIn: newBooks, readingLanguages: languages })
    busy(false)
    if (!saved.ok) { hooks.setStatus(saved.message || CARDS_COPY.saveFailed, 'error'); return }
    rememberNewBooksOpenIn(newBooks)
    hooks.finish()
  })
}
