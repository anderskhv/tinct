import { ICONS } from '../cards/cardStack'
/** Approved 22 October profile and reading steps. Choices stay on this
 * device until Continue / Start reading. Skip saves no profile choice; it records only that the step
 * was offered (prompted_at), so it is not offered again by itself (profileStepOffer.ts). */
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
  chooseGooglePhoto,
  currentBookHint,
  fetchOwnProfile,
  paintAvatar,
  rememberNewBooksOpenIn,
  photoInMemory,
  preparePhoto,
  saveProfile,
  socialProfilesOn,
  uploadProfileImage,
  type OwnProfile,
} from './socialClient'
import { initialReadingLanguages, toggleReadingLanguage, type ReadingLanguage } from './readingLanguages'
import { photoAccept } from './photoAccept'
import { markProfileStepOffered } from './profileStepOffer'
import { PHOTO_COPY } from './photoFile'
import { CARDS_COPY } from '../cards/cardsCopy'

export const SIGNUP_CONSENT_KEY = 'tinct:signup-consent'

/** Stock pictures of women among the choices (Anders, 14 October 2026): Longbourn's reader and The Awakening's cover. */
export const SIGNUP_WOMEN_PICTURES: readonly { kind: PictureKind; value: string; label: string }[] = [
  { kind: 'set', value: 'longbourn', label: 'Longbourn' },
  { kind: 'cover', value: 'the-awakening', label: 'The Awakening' },
]

const STYLE = `
.auth-page.is-social .auth-top{position:relative}
.social-step [hidden]{display:none!important}
.social-steps{position:absolute;right:clamp(18px,4vw,54px);top:50%;transform:translateY(-50%);color:#9fb0b8;font-size:12px}
.social-steps[hidden]{display:none}
.social-pw{position:relative;display:block}
.social-pw input{padding-right:64px}
.social-pw-toggle{position:absolute;right:6px;bottom:6px;height:40px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:#5e574e;font-size:12px;cursor:pointer;text-decoration:underline}
.auth-page[data-mode=profile] form,.auth-page[data-mode=reading] form{display:none}
.auth-page[data-mode=profile] [data-auth-providers],.auth-page[data-mode=reading] [data-auth-providers],.auth-page[data-mode=profile] .auth-or,.auth-page[data-mode=reading] .auth-or{display:none}
.social-step{position:relative}
.social-step:not([hidden]){display:flow-root}
.social-step[hidden]{display:none}
.social-step h1{margin:6px 0 14px}
.social-counter{display:flex;justify-content:space-between;align-items:center;color:#6b6357;font-size:14px}
.social-skip-top{min-height:44px;margin:-10px -10px -10px 0;padding:0 10px;border:0;background:none;color:#6b6357;font:inherit;cursor:pointer}
.social-banner{height:150px;margin:-32px -32px 14px;background-size:cover;background-position:center;border-radius:19px 19px 0 0}
.social-banner[hidden]{display:none}
/* With a background (mockup "background added"): the counter and Skip sit on the banner, the picture overlaps its foot. */
.social-step.has-social-banner h1{display:none}
.has-social-banner .social-counter{position:absolute;top:-22px;left:0;right:0;z-index:1;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)}
.has-social-banner .social-skip-top{color:#fff}
.has-social-banner .social-banner{box-shadow:inset 0 70px 50px -40px rgba(0,0,0,.45)}
.has-social-banner .social-identity{margin-top:-50px}
.auth-card:has(.social-step){min-width:0;max-width:100%}
.social-step,.social-strip{min-width:0;max-width:100%}
.social-identity{display:flex;align-items:flex-end;gap:14px;margin-top:4px;position:relative}
.social-hero-picture{position:relative;flex:none;width:92px;height:92px;padding:0;border:0;border-radius:50%;background:none;cursor:pointer}
.social-hero-picture .tinct-avatar{width:92px;height:92px;font-size:36px;box-shadow:0 0 0 4px var(--paper)}
.social-badge{position:absolute;right:-2px;bottom:0;width:30px;height:30px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 1px 4px rgba(0,0,0,.25);color:#1d1a16}
.social-badge svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.3}
/* The name wraps instead of scrolling out of sight (tester, 9 Nov 2026): a one-row textarea that grows; past two lines at 28px it drops to 22px. */
.social-name{flex:1;min-width:0;display:flex;align-items:flex-end;min-height:50px;padding-bottom:6px;border-bottom:1.5px solid rgba(29,26,22,.25)}
.social-name:focus-within{border-bottom-color:#1d1a16}
.social-name-input{display:block;width:100%;min-width:0;height:auto;border:0;outline:0;background:transparent;color:#1d1a16;font:600 28px/1.2 'Playfair Display',Georgia,serif;padding:0;resize:none;overflow:hidden;overflow-wrap:break-word}
.social-name-input.is-long{font-size:22px}
.social-name-input::placeholder{color:#a39a8b;font-weight:500}
.social-add-background{display:block;margin:12px 0 0;min-height:40px;padding:0;border:0;background:none;color:#1f4a5c;font-size:15px;cursor:pointer}
.social-add-background[hidden]{display:none}
.social-strip{margin-top:14px}
.social-strip[hidden]{display:none}
.social-strip-head{display:flex;justify-content:space-between;align-items:center;color:#6b6357;font-size:13px;margin-bottom:8px}
.social-strip-none{min-height:32px;padding:0 4px;border:0;background:none;color:#6b6357;font:inherit;cursor:pointer}
.social-strip-row{display:flex;gap:10px;overflow-x:auto;padding:4px;margin:0 -4px;scrollbar-width:none}
.social-strip-row::-webkit-scrollbar{display:none}
.social-file{display:none}
.social-upload-tile{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0;border:1.5px dashed #b3aa9b;background:transparent;color:#6b6357;font-size:12px;cursor:pointer}
.social-upload-tile svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.social-upload-tile.is-background{width:78px;height:54px;border-radius:10px}
.social-upload-tile.is-picture{width:54px;height:54px;border-radius:50%}
.social-upload-tile[aria-busy=true]{opacity:.6}
.social-scene{flex:none;width:78px;height:54px;padding:0;border:0;border-radius:10px;overflow:hidden;background:#e3dacb;cursor:pointer}
.social-scene img{display:block;width:100%;height:100%;object-fit:cover}
.social-picture{flex:none;width:54px;height:54px;padding:0;border:0;border-radius:50%;background:none;cursor:pointer}
.social-picture .tinct-avatar{width:54px;height:54px;font-size:22px}
.social-scene[aria-pressed=true],.social-picture[aria-pressed=true]{box-shadow:0 0 0 2px var(--paper),0 0 0 4px #1d1a16}
.social-label{display:block;margin:18px 0 8px;color:#6b6357;font-size:13px}
.social-segment{display:flex;padding:4px;border-radius:13px;background:rgba(29,26,22,.07)}
.social-segment button{flex:1;min-height:42px;border:0;border-radius:10px;background:transparent;color:#6b6357;font:16px var(--sans);cursor:pointer}
.social-segment button[aria-checked=true]{background:#fff;color:#1d1a16;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.social-note{margin:8px 0 0;color:#6b6357;font-size:14px;line-height:1.45}
.social-note[hidden]{display:none}
.social-chips{display:flex;gap:10px;flex-wrap:wrap}
.social-chip{min-height:44px;padding:0 18px;border:0;border-radius:22px;background:#fff;box-shadow:inset 0 0 0 1px rgba(29,26,22,.14);color:#1d1a16;font:500 16px var(--sans);cursor:pointer}
.social-chip[aria-pressed=true]{background:#1d1a16;color:#f6f1e7;box-shadow:none}
.social-chip[aria-pressed=true]::before{content:"✓ "}
.social-options{display:grid;gap:10px}
.social-option{display:flex;gap:14px;align-items:center;width:100%;padding:14px 16px;border:0;border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1px rgba(29,26,22,.14);text-align:left;color:#1d1a16;font-family:var(--sans);cursor:pointer}
.social-option[aria-checked=true]{box-shadow:inset 0 0 0 2px #1d1a16}
.social-option strong{display:block;font-size:17px;font-weight:600}
.social-option small{display:block;margin-top:3px;color:#6b6357;font-size:14px;line-height:1.4}
.social-radio{flex:none;width:22px;height:22px;border-radius:50%;box-shadow:inset 0 0 0 1.5px #b3aa9b}
.social-option[aria-checked=true] .social-radio{box-shadow:inset 0 0 0 7px #1d1a16}
.social-step .auth-primary{margin-top:22px}
.tinct-avatar{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:50%;background-color:#18241a;background-repeat:no-repeat;background-size:cover;color:#e8d59e;font:500 18px/1 'Playfair Display',Georgia,serif;overflow:hidden}
.tinct-avatar[data-kind=initial]{background-image:linear-gradient(150deg,#2a3a2a,#18241a)}
@media(max-width:520px){.social-banner{margin:-26px -20px 14px;border-radius:20px 20px 0 0}.has-social-banner .social-counter{top:-14px}}
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

/** "1 of 2" / "2 of 2" sits in each step's own top row now (onboarding v3); the top bar shows none. */
export function updateStepCounter(root: HTMLElement | null, mode: string): void {
  const steps = root?.querySelector<HTMLElement>('[data-social-steps]')
  if (!steps) return
  const step = mode === 'profile' ? 1 : mode === 'reading' ? 2 : 0
  steps.hidden = true
  steps.textContent = step ? `${step} of 2` : ''
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

/** Continue and Start reading never wait on the network: the saves run behind, retried, in order (onboarding v3). */
const SAVE_TRIES = 3
async function withRetry(run: () => Promise<{ ok: boolean }>): Promise<boolean> {
  for (let attempt = 0; attempt < SAVE_TRIES; attempt += 1) {
    if ((await run()).ok) return true
    await new Promise(resolve => setTimeout(resolve, 600 * (attempt + 1)))
  }
  return false
}
/** How long Start reading lets a still-running picture upload finish before going on anyway. */
const UPLOAD_GRACE_MS = 8_000

const UPLOAD_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V5M7.5 9.5 12 5l4.5 4.5M5 19h14"/></svg>'

/** The step's choices that Public and Private set together (the brief: exactly these four). */
export function visibilityChoices(visibility: 'everyone' | 'only_me'): { visibility: Visibility; showReading: boolean; showTime: boolean; onLeaderboard: boolean } {
  const on = visibility === 'everyone'
  return { visibility, showReading: on, showTime: on, onLeaderboard: on }
}

export interface ProfileStepsOptions {
  /** The Google account's own photo (session user_metadata), shown first when there is one. */
  googlePhotoUrl?: string | null
  /** The account, for this device's "offered" mark (profileStepOffer.ts). */
  userId?: string | null
}

/**
 * After sign-in: "Your profile" (1 of 2) and "How do you read?" (2 of 2), as the approved mockup (2 Nov 2026).
 * Falls back to today's welcome screen when profiles cannot be read.
 */
export async function startProfileSteps(root: HTMLElement, token: string, hooks: SignInHooks, options: ProfileStepsOptions = {}): Promise<void> {
  const card = root.querySelector<HTMLElement>('.auth-card')
  const result = await fetchOwnProfile(token, currentBookHint())
  if (!card || !result.ok) { hooks.fallbackWelcome(); return }
  const profile: OwnProfile = result.profile
  const googlePhoto = profile.googlePhoto && options.googlePhotoUrl ? options.googlePhotoUrl : null

  // ---- 1 of 2: your profile ----
  // The picture: the Google photo if there is one, else the initial (the brief); a set or cover from the strip.
  let picture: { kind: PictureKind; value: string | null } = googlePhoto ? { kind: 'google', value: null } : { kind: 'initial', value: null }
  // No background by default (Anders, 2 Nov): one is added from "+ Add a background".
  let background: { kind: 'set'; value: string } | { kind: 'library'; value: null } | { kind: 'upload'; value: null } | null = null
  let visibility: 'everyone' | 'only_me' = 'everyone'
  const pendingPhotos: Partial<Record<'picture' | 'background', Blob>> = {}
  const previewUrls: string[] = []

  // A one-row textarea, not an input, so a long name wraps and stays readable; Enter and pasted line breaks never make a second paragraph.
  const nameInput = el('textarea', { name: 'profileName', rows: 1, value: profile.name === 'Reader' ? '' : profile.name, placeholder: 'Your name', maxLength: 40, autocomplete: 'name', className: 'social-name-input' })
  nameInput.setAttribute('aria-label', 'Your name')
  nameInput.setAttribute('enterkeyhint', 'done')
  const fitName = () => {
    if (!nameInput.isConnected || !nameInput.clientWidth) return
    nameInput.classList.remove('is-long')
    nameInput.style.height = 'auto'
    const line = parseFloat(getComputedStyle(nameInput).lineHeight) || 34
    if (nameInput.scrollHeight > line * 2.5) nameInput.classList.add('is-long')
    nameInput.style.height = 'auto'
    nameInput.style.height = `${nameInput.scrollHeight}px`
  }
  nameInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); nameInput.blur() } })
  nameInput.addEventListener('input', () => {
    if (/[\r\n]/.test(nameInput.value)) nameInput.value = nameInput.value.replace(/\s*[\r\n]+\s*/g, ' ')
    fitName()
  })
  // The step starts hidden, so it is fitted when it gets a width (and again when the width changes).
  if (typeof ResizeObserver !== 'undefined') {
    let width = 0
    // Fitted in the next frame: changing the height inside the callback would be a ResizeObserver loop.
    new ResizeObserver(() => { if (nameInput.clientWidth !== width) { width = nameInput.clientWidth; requestAnimationFrame(fitName) } }).observe(nameInput)
  }
  const heroAvatar = el('span', { className: 'social-hero-avatar' })
  const paintHero = () => {
    if (picture.kind === 'google' && googlePhoto) { heroAvatar.className = 'tinct-avatar social-hero-avatar'; heroAvatar.dataset.kind = 'photo'; heroAvatar.textContent = ''; heroAvatar.style.backgroundImage = `url("${googlePhoto}")`; heroAvatar.style.backgroundSize = 'cover'; return }
    if (picture.kind === 'upload' && uploadedPreview) { heroAvatar.style.backgroundImage = `url("${uploadedPreview}")`; heroAvatar.style.backgroundSize = 'cover'; heroAvatar.textContent = ''; return }
    paintAvatar(heroAvatar, pictureView(picture.kind, picture.value, nameInput.value || profile.name), token, 'l')
  }
  let uploadedPreview: string | null = null
  const pictureButton = el('button', { type: 'button', className: 'social-hero-picture', ariaLabel: 'Change picture' }, heroAvatar)
  pictureButton.insertAdjacentHTML('beforeend', `<span class="social-badge" aria-hidden="true">${ICONS.cam}</span>`)
  pictureButton.setAttribute('aria-expanded', 'false')

  const banner = el('div', { className: 'social-banner', hidden: true })
  const counter = (step: 1 | 2, skip: HTMLButtonElement) => el('div', { className: 'social-counter' }, el('span', {}, `${step} of 2`), skip)
  const skipProfile = el('button', { type: 'button', className: 'social-skip-top', dataset: { socialSkip: '' } }, 'Skip')

  // The strips: one open at a time, under the identity row.
  const strip = (label: string, extra?: HTMLElement) => {
    const row = el('div', { className: 'social-strip-row' })
    const box = el('div', { className: 'social-strip', hidden: true }, el('div', { className: 'social-strip-head' }, el('span', {}, label), ...(extra ? [extra] : [])), row)
    return { box, row }
  }
  const noneButton = el('button', { type: 'button', className: 'social-strip-none' }, 'None')
  const backgrounds = strip('Background', noneButton)
  const pictures = strip('Picture')
  const addBackground = el('button', { type: 'button', className: 'social-add-background', dataset: { socialAddBackground: '' } }, '+ Add a background')
  const openStrip = (which: 'background' | 'picture' | null) => {
    backgrounds.box.hidden = which !== 'background'
    pictures.box.hidden = which !== 'picture'
    pictureButton.setAttribute('aria-expanded', String(which === 'picture'))
    addBackground.hidden = which === 'background' || background !== null
  }
  addBackground.addEventListener('click', () => openStrip('background'))
  pictureButton.addEventListener('click', () => openStrip(pictures.box.hidden ? 'picture' : null))

  const pressed = (row: HTMLElement, chosen: HTMLElement | null) => row.querySelectorAll<HTMLButtonElement>('button[aria-pressed]').forEach(button => button.setAttribute('aria-pressed', String(button === chosen)))
  const showBanner = (src: string | null) => {
    banner.hidden = !src
    if (src) banner.style.backgroundImage = `url("${src}")`
    // On the profile step only: the reading step keeps its own plain counter.
    banner.parentElement?.classList.toggle('has-social-banner', !!src)
  }

  // Upload tiles come first in both strips (the brief), while the Worker accepts uploads.
  const uploadTile = (slot: 'picture' | 'background') => {
    const field = el('input', { type: 'file', accept: photoAccept(), tabIndex: -1, className: 'social-file' })
    field.setAttribute('aria-hidden', 'true')
    const tile = el('button', { type: 'button', className: `social-upload-tile is-${slot}`, ariaLabel: slot === 'picture' ? CARDS_COPY.uploadPicture : CARDS_COPY.uploadBackground, dataset: { socialUpload: slot } })
    tile.innerHTML = UPLOAD_ICON + (slot === 'background' ? '<span>Upload</span>' : '')
    tile.addEventListener('click', () => field.click())
    field.addEventListener('change', async () => {
      const chosen = field.files?.[0]
      if (!chosen) { field.value = ''; return }
      tile.setAttribute('aria-busy', 'true')
      hooks.setStatus()
      let prepared: Awaited<ReturnType<typeof preparePhoto>>
      try {
        // Read into memory before the input is cleared (iPadOS may release a converted HEIC; photoInMemory).
        const photo = await photoInMemory(chosen)
        prepared = photo ? await preparePhoto(photo, slot) : { ok: false, message: PHOTO_COPY.unreadable }
      } finally {
        field.value = ''
        tile.removeAttribute('aria-busy')
      }
      if (!prepared.ok) { hooks.setStatus(prepared.message, 'error'); return }
      pendingPhotos[slot] = prepared.image
      const preview = URL.createObjectURL(prepared.image)
      previewUrls.push(preview)
      if (slot === 'background') {
        background = { kind: 'upload', value: null }
        showBanner(preview)
        pressed(backgrounds.row, null)
      } else {
        uploadedPreview = preview
        picture = { kind: 'upload', value: null }
        pressed(pictures.row, null)
        paintHero()
      }
    })
    return [tile, field]
  }
  if (profile.uploads === true) {
    backgrounds.row.append(...uploadTile('background'))
    pictures.row.append(...uploadTile('picture'))
  }

  // Scenes: small banners (profile/scene-*.jpg, about 25 KB), loaded as soon as the step shows.
  const hint = PICTURE_SETS.find(set => set.bookId === currentBookHint())
  const sets = [...(hint ? [hint] : []), ...PICTURE_SETS.filter(set => set !== hint)]
  for (const set of sets) {
    const image = el('img', { src: set.scene, alt: '', decoding: 'async' })
    const button = el('button', { type: 'button', className: 'social-scene', ariaLabel: `Background: ${set.label}` }, image)
    button.setAttribute('aria-pressed', 'false')
    button.addEventListener('click', () => {
      background = { kind: 'set', value: set.id }
      delete pendingPhotos.background
      showBanner(set.scene)
      pressed(backgrounds.row, button)
    })
    backgrounds.row.append(button)
  }
  noneButton.addEventListener('click', () => {
    background = null
    delete pendingPhotos.background
    showBanner(null)
    pressed(backgrounds.row, null)
    openStrip(null)
  })

  // Pictures: disc-sized crops (avatarCrops), the Google photo and the initial.
  const pictureChoice = (label: string, next: { kind: PictureKind; value: string | null }, paint: (avatar: HTMLElement) => void) => {
    const avatar = el('span')
    paint(avatar)
    const button = el('button', { type: 'button', className: 'social-picture', ariaLabel: label }, avatar)
    button.setAttribute('aria-pressed', String(next.kind === picture.kind && next.value === picture.value))
    button.addEventListener('click', () => { picture = next; pressed(pictures.row, button); paintHero() })
    pictures.row.append(button)
    return avatar
  }
  if (googlePhoto) pictureChoice('Picture: your Google photo', { kind: 'google', value: null }, avatar => { avatar.className = 'tinct-avatar'; avatar.dataset.kind = 'photo'; avatar.style.backgroundImage = `url("${googlePhoto}")`; avatar.style.backgroundSize = 'cover' })
  const initialAvatar = pictureChoice('Picture: your initial', { kind: 'initial', value: null }, avatar => paintAvatar(avatar, pictureView('initial', null, nameInput.value || profile.name), token, 's'))
  for (const set of sets) pictureChoice(`Picture: ${set.label}`, { kind: 'set', value: set.id }, avatar => paintAvatar(avatar, pictureView('set', set.id, ''), token, 's'))
  for (const woman of SIGNUP_WOMEN_PICTURES) {
    if (woman.kind === 'cover') pictureChoice(`Picture: ${woman.label}`, { kind: woman.kind, value: woman.value }, avatar => paintAvatar(avatar, pictureView(woman.kind, woman.value, ''), token, 's'))
  }
  nameInput.addEventListener('input', () => {
    paintAvatar(initialAvatar, pictureView('initial', null, nameInput.value || profile.name), token, 's')
    if (picture.kind === 'initial') paintHero()
  })
  paintHero()

  // Public | Private: a segmented control with one line under it.
  const visibilityLine = el('p', { className: 'social-note' })
  const segment = el('div', { className: 'social-segment' })
  segment.setAttribute('role', 'radiogroup'); segment.setAttribute('aria-label', 'Who can see you')
  const segments = (['everyone', 'only_me'] as const).map(value => {
    const button = el('button', { type: 'button', dataset: { visibility: value } }, value === 'everyone' ? 'Public' : 'Private')
    button.setAttribute('role', 'radio')
    button.addEventListener('click', () => { visibility = value; paintVisibility() })
    return button
  })
  segment.append(...segments)
  const paintVisibility = () => {
    segments.forEach(button => button.setAttribute('aria-checked', String(button.dataset.visibility === visibility)))
    visibilityLine.textContent = visibility === 'everyone'
      ? (profile.emailConfirmed ? 'Others see your profile, what you read and your place on the leaderboard.' : 'Others see your profile, what you read and your place on the leaderboard once your email is confirmed.')
      : 'Only you see your profile and reading.'
  }
  paintVisibility()

  const continueButton = el('button', { type: 'button', className: 'auth-primary', dataset: { socialContinue: '' } }, 'Continue')
  const step2 = el('div', { className: 'social-step', dataset: { modeCopy: 'profile' }, hidden: true },
    banner, counter(1, skipProfile), el('h1', {}, 'Your profile'),
    el('div', { className: 'social-identity' }, pictureButton, el('label', { className: 'social-name' }, nameInput)),
    addBackground, backgrounds.box, pictures.box,
    el('span', { className: 'social-label' }, 'Who can see you'), segment, visibilityLine,
    continueButton)

  // ---- 2 of 2: how do you read? ----
  let newBooks: NewBooksOpenIn = profile.newBooksOpenIn || 'modern'
  let languages = initialReadingLanguages(navigator.languages ?? [navigator.language])
  const languageChoices = el('div', { className: 'social-chips' })
  languageChoices.setAttribute('role', 'group'); languageChoices.setAttribute('aria-label', 'Languages')
  const languageButtons = (['en', 'da'] as const).map(language => {
    const button = el('button', { type: 'button', className: 'social-chip', dataset: { language } }, language === 'en' ? 'English' : 'Dansk')
    button.addEventListener('click', () => { languages = toggleReadingLanguage(languages, language); paintLanguages() })
    return button
  })
  const paintLanguages = () => languageButtons.forEach(button => button.setAttribute('aria-pressed', String(languages.includes(button.dataset.language as ReadingLanguage))))
  paintLanguages()
  languageChoices.append(...languageButtons)
  const editionChoices = el('div', { className: 'social-options' })
  editionChoices.setAttribute('role', 'radiogroup'); editionChoices.setAttribute('aria-label', 'New books open in')
  const editionButtons = (['modern', 'human'] as const).map(value => {
    const button = el('button', { type: 'button', className: 'social-option', dataset: { value } },
      el('span', { className: 'social-radio' }), el('span', {}, el('strong', {}, NEW_BOOKS_COPY[value].label), el('small', {}, NEW_BOOKS_COPY[value].line)))
    button.setAttribute('role', 'radio')
    button.addEventListener('click', () => { newBooks = value; paintEditions() })
    return button
  })
  const paintEditions = () => editionButtons.forEach(button => button.setAttribute('aria-checked', String(button.dataset.value === newBooks)))
  paintEditions()
  editionChoices.append(...editionButtons)
  const readingSkip = el('button', { type: 'button', className: 'social-skip-top', dataset: { socialReadingSkip: '' } }, 'Skip')
  const startButton = el('button', { type: 'button', className: 'auth-primary', dataset: { socialStart: '' } }, 'Start reading')
  const step3 = el('div', { className: 'social-step', dataset: { modeCopy: 'reading' }, hidden: true },
    counter(2, readingSkip), el('h1', {}, 'How do you read?'),
    el('span', { className: 'social-label' }, 'Languages'), languageChoices,
    el('span', { className: 'social-label' }, 'New books open in'), editionChoices,
    el('p', { className: 'social-note' }, 'You can change this for any book while you read, in Book settings.'),
    startButton)

  card.querySelector('[data-auth-status]')?.before(step2, step3)
  hooks.setMode('profile')
  // Offered once (profileStepOffer.ts): this device remembers it now, the account on Skip.
  markProfileStepOffered(options.userId)
  let offered: Promise<boolean> | null = null

  // ---- Saving, behind the steps ----
  let profileSave: Promise<boolean> | null = null
  const releasePreviews = () => { previewUrls.forEach(url => URL.revokeObjectURL(url)); previewUrls.length = 0 }
  continueButton.addEventListener('click', () => {
    const body: Record<string, unknown> = { ...visibilityChoices(visibility), setUp: true }
    // An empty name is not sent: it never blocks the step (routes/profiles.ts keeps the name).
    if (nameInput.value.trim()) body.name = nameInput.value.trim()
    if (picture.kind !== 'upload' && picture.kind !== 'google') body.picture = picture
    if (background?.kind === 'set') body.background = background
    const photos = { ...pendingPhotos }
    const wantsGoogle = picture.kind === 'google'
    profileSave = (async () => {
      if (!await withRetry(() => saveProfile(token, body))) return false
      if (wantsGoogle) await withRetry(() => chooseGooglePhoto(token))
      for (const slot of ['background', 'picture'] as const) {
        const image = photos[slot]
        if (!image || (slot === 'picture' && picture.kind !== 'upload')) continue
        await withRetry(() => uploadProfileImage(token, slot, image))
      }
      releasePreviews()
      return true
    })()
    hooks.setStatus()
    hooks.setMode('reading')
  })
  skipProfile.addEventListener('click', () => {
    // Skip saves no profile choice (the name, the picture, the Google photo included, and visibility stay as
    // they were); it records only that the step was offered, so the library does not bring it back.
    if (profile.shouldPrompt && !offered) offered = withRetry(() => saveProfile(token, { prompted: true }))
    releasePreviews()
    hooks.setStatus()
    hooks.setMode('reading')
  })
  readingSkip.addEventListener('click', async () => {
    readingSkip.disabled = startButton.disabled = true
    await Promise.race([Promise.all([offered, profileSave]), new Promise(resolve => setTimeout(resolve, UPLOAD_GRACE_MS))])
    hooks.finish()
  })
  startButton.addEventListener('click', async () => {
    readingSkip.disabled = startButton.disabled = true
    rememberNewBooksOpenIn(newBooks)
    // Small and sent with keepalive: it completes even as the page goes back to the book.
    void saveProfile(token, { newBooksOpenIn: newBooks, readingLanguages: languages }, (input, init) => fetch(input, { ...init, keepalive: true }))
    await Promise.race([Promise.all([offered, profileSave]), new Promise(resolve => setTimeout(resolve, UPLOAD_GRACE_MS))])
    hooks.finish()
  })
}
