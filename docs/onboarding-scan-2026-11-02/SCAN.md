# Account onboarding scan, 2 November 2026

This scan was read-only. It covers `origin/main` at `8f40d5a2` and production https://tinct.app, loaded signed out in a throwaway Playwright Chromium profile. No account was created and no form was submitted.

Steps 2 and 3 were rendered from production's own code. To reach them, a fake local session was used, and every `/api/*` and Supabase request was intercepted and mocked, so nothing was sent. `/api/profile` was given a 700 ms delay to stand in for the authenticated round trip. Screenshots are in this folder. All line references point to `origin/main`.

Timing method:
- **Phone:** iPhone 13 profile, 150 ms RTT, about 1.2 MB/s, 4x CPU throttle.
- **Desktop:** 1440x900, no throttling.
- **"Interactive":** the moment `#tinct-lab-sign-in[data-ready=true]` is set. The page sets it after `getSession` and the display-profile styles have loaded.

## 1. Entry points

| Entry | Lands on | returnTo kept | Ref |
|---|---|---|---|
| Landing "Sign in" | `/app?signin=1`, then a 302 to `/sign-in` (one extra hop, about 0.45 s) | no; defaults to `/library` | `app/public/landing.html:243`, `src/worker/routes/seo.ts:491-494` |
| Library top-bar "Sign in" / "Account" | `/sign-in?returnTo=/library` | yes | `public/lab/library_2/app.js:186` |
| Library: add a book or paste text while signed out | `/sign-in?returnTo=<shelf or ?add=id>` | yes | `public/lab/library_2/app.js:280`, `add-to-tinct.js:28-32` |
| Library assistant (AI) gate | `?mode=create` or sign-in | yes | `src/labLibraryAssistant.tsx:423-426` |
| Reader: 11th anonymous AI action (Explain/Chat), Talk after the daily guest trial, audio "unauthenticated", Catch me up | account sheet, then "Create free account" (`?mode=create`) or "Sign in" | yes, the current reader URL | `src/lab/LabAccountPrompt.tsx:58-63`, `src/lab/labAccountPrompt.ts:148-158`, `src/lab/LabApp.tsx:4751,4760,5007,5430,6593` |
| Reader: second-book nudge "create a free account" | `?mode=create` | yes | `src/lab/LabAccountPrompt.tsx:81` |
| Highlights / notes | **no gate**; stored on the device and adopted at first sign-in | n/a | `src/lab/labDeviceIdentity.ts:14-21` |
| Premium / Account | `/sign-in?mode=account`, which signs in first and then opens the Account card | yes | `src/labSignIn.ts:41-42`, `add-to-tinct.js:111-112` |
| Share links `/@handle` (Follow, Report) | `/sign-in?returnTo=/@handle` (sign-in mode, not create) | yes | `src/social/profilePageView.ts:77,128` |
| Lifecycle emails (checkout) | `/sign-in?mode=account` | n/a | `src/worker/lifecycle/engine.ts:33` |

**What carries across sign-up.** `returnTo` is checked against an allow-list (`src/lab/labSignInReturn.ts:17-31`), and the reader returns to the same `/read/<book>` URL. The device's signed-out position, highlights and chat are adopted on the first sign-in (`labDeviceIdentity.ts:43-57`, `useLabPositionSync.ts:344-358`). The most recent book becomes the default picture/background hint (`socialClient.ts:195-205`). The held-back AI turn is not replayed after sign-up; the reader has to ask again.

Minor: `labSignIn.ts:304` recognises `/phone` and `/desktop` returns, but the allow-list (`labSignInReturn.ts:17`) drops them to `/library`.

## 2. Current flow, screen by screen

| # | Screen | Phone time to interactive | Desktop | Taps / fields | Screenshot |
|---|---|---|---|---|---|
| 1 | **Sign in** (cold): eyebrow "WELCOME BACK", "Sign in", "Return to your saved books and reading places.", Continue with Google, "or with email", Email, Password (Show), Sign in, "Forgot password?", "No account? Create one free" | **2.6 s** (TTFB 254 ms, 365 KB) | **0.9 s** (TTFB 114 ms) | | `phone-01-sign-in.jpg`, `desktop-01-sign-in.jpg` |
| 1a | **Create** (tap "Create one free", 130 ms client switch; or a cold `?mode=create` deep link from the reader: 1.55 s phone / 0.86 s desktop): "1 of 3", "Create your account", "Free. Your first month includes audiobooks and the reading companion.", Google, email, password (Show), unticked consent "Email me about my reading progress and ideas for what to read next. Stop any time.", **Create account**, "By creating an account you agree to the Terms and confirm you've read the Privacy notice.", "I already have an account" | as above | | Google: 1 tap. Email: 2 fields + 1 tap (+1 optional tick) | `phone-02-create-step1.jpg`, `phone-02b-…scrolled.jpg`, `desktop-02-…` |
| 1b | **Forgot**: "Reset your password", "We'll email you a secure reset link.", Email, "Send reset link", "Back to sign in". Sends a Supabase recovery link back to `/sign-in?mode=reset` → "Set a new password" (new + confirm, minimum 8) | instant | | | `phone-03-forgot.jpg` |
| 2 | **Your profile** ("2 of 3"): banner (scene) with a camera button, round picture with a camera button, "Your name", hidden picture row and scene row, "Who can see you?" Public ✓ / Private, "Others see you once you confirm your email…", Continue, Skip | renders once `GET /api/profile` returns: **2.4 s** phone / 1.65 s desktop from navigation with a 700 ms mock; the real call is a Worker verifyUser plus 3-5 sequential PostgREST calls | | 0 taps needed (Continue); name, picture and background are optional | `phone-04-step2-profile.jpg`, `-05-…scenes-open`, `-06-…scene-tapped`, `-07-…pictures-open` |
| 3 | **Your reading** ("3 of 3"): "Which languages do you read in?" English ✓ / Dansk; "Which version should new books open in?" Modern English ✓ "The same book, in today's English." / Human originals or translations "The original text, or a published translation."; Start reading, Skip | Continue waits for the POST, plus uploads if any (about 0.85 s with the 700 ms mock) | | 1 tap | `phone-08-step3-reading.jpg` |
| 4 | Back at `returnTo` (reader or library); "Start reading" waits for its own POST first | | | | — |

**Fastest path today (Google, new reader):** 1 tap → Google account chooser (1-2 taps) → back to `/sign-in`, which loads again (phone ≈ 2.6 s) → `GET /api/profile` → step 2 → Continue (waits for POST) → step 3 → Start reading (waits for POST) → the reader loads again. That is about **5-6 taps, 3 full page loads and 3 blocking API round trips: roughly 8-12 s on a phone**.

**Email path:** 2 fields, typing the email and a password of 6+ characters, then 3 taps through steps 1-3, about the same wall time plus typing.

**Error copy.** Errors are raw Supabase messages passed straight through (`signInErrorMessage`, `src/services/browserAuthStorage.ts:40-43`), for example "Invalid login credentials", "User already registered", "Unable to validate email address: invalid format", "email rate limit exceeded". Two exceptions have their own wording: storage quota, and providers that are not enabled (`labSignInProviders.ts:68-75`).

**Password rules:**
- Sign-up has no client-side rule. The form is `novalidate` (`sign-in/index.html:28`), so `minlength="8"` (`:31`) is never enforced, and the server minimum is whatever the Supabase project has (default 6).
- Reset enforces 8 characters (`src/labSignIn.ts:186`), so the two disagree.
- No strength meter or requirements line.

## 3. Friction, ranked by impact

1. **Scene picker is broken (P1, step 2).**
   - The CSS in `src/social/signUpSteps.ts` has two rules of equal specificity: `.social-backgrounds button{…background-image:var(--scene)…color:white}` (`:60`) and `.social-pictures button{width:44px;height:44px;padding:0;border-radius:50%;background:transparent}` (`:75`). The scene buttons carry both classes and `:75` comes later, so its `background` shorthand wipes the thumbnail.
   - The same happens to layout: `.social-pictures{display:flex}` (`:74`) overrides `.social-backgrounds{display:grid}` (`:59`).
   - Measured in production: each scene button is 44x72 px, `background-image: none`, transparent, with white `text-shadow` text. The result is "At sea / Stoic / Florence" as white text on cream with no thumbnails (`phone-05-step2-scenes-open.jpg`).
   - Scene buttons also have no selected state (no `aria-pressed`, `:264-274`). The only feedback is the banner image changing above, often off-screen on a phone, after a 100-140 KB room image loads (446 ms throttled). So a tap looks like nothing happened.
   - Fix: scope the selector (`.social-pictures.social-backgrounds button`, or put the scene rules after `:75`) and set `aria-pressed` with a ring.
2. **Picture row downloads about 2.9 MB of full book covers (step 2).**
   - Each round avatar is a full cover JPEG scaled to 260% (`profileRules.ts:309`, `socialClient.ts:163-181`): odyssey 628 KB, meditations 454 KB, the-prince 544 KB, pride-and-prejudice 733 KB, the-awakening 553 KB.
   - On a throttled phone they took 1.1-2.3 s to arrive after the camera tap. The hero avatar alone is about 600 KB on first paint.
   - Fix: 96-144 px avatar crops (≈10 KB each), plus about 240x120 scene thumbnails.
3. **Three blocking network waits with no visible progress.**
   - After "Create account", `completeSignIn` starts the steps without awaiting them (`labSignIn.ts:125`). `finally{setBusy(false)}` (`:196-198`) then re-enables the step-1 form while `GET /api/profile` is still in flight (`signUpSteps.ts:218`).
   - A second tap on "Create account" calls `signUp` again and shows "User already registered".
   - Continue (`:392-414`) and Start reading (`:420-427`) each `await saveProfile` and then any uploads before moving on. The buttons are only disabled; there is no wait ring, contrary to the 2026-10-10 wait-ring decision.
   - Nothing on step 2 needs a server answer before step 3 can show.
4. **Too many steps and choices for a reader who came to read.** Name, picture, background, visibility, languages and edition are all asked before the book reopens. Every one of them already has a sensible default (the book hint, Public→Friends until confirmed, browser languages, Modern), and all of them are in Settings.
5. **Public by default, leaderboard included.** Step 2 pre-selects "Public" (`signUpSteps.ts:229, 352-355`). Continue without touching it posts `visibility:everyone, showReading, showTime, onLeaderboard: true` (captured from the mock). Email accounts silently count as Friends until confirmed. This is approved (14/22 Oct), but it is a consequential default sitting on a "just tap Continue" screen.
6. **Google sign-up from the Sign in screen skips the Terms line and the consent box.**
   - The Terms/Privacy line and the email opt-in show only in `create` mode (`sign-in/index.html:33,35`; `labSignIn.ts:81`).
   - A new reader who taps "Continue with Google" on the default Sign in screen (every share link, the library button, the landing link) creates an account without seeing either. They land on "2 of 3" without ever having seen "1 of 3".
   - **Needs a legal check.**
7. **Google consent lost on Skip.**
   - For OAuth, the opt-in rides in `sessionStorage` (`signUpSteps.ts:166-171`). It is taken at step 2 (`:220`) and sent only with Continue (`:390,395`).
   - Skip (`:415-418`), or the `fallbackWelcome` path (`:219`), drops it, so a ticked box is never recorded.
   - Email sign-ups are unaffected: the opt-in is in the `signUp` metadata (`labSignIn.ts:168-170`) and recorded by a trigger.
8. **Unconfirmed email has no way forward in the UI.**
   - With `mailer_autoconfirm: true` (confirmed live, below), Supabase never verifies the address.
   - Tinct's soft confirmation (`profiles.email_confirmed_at`) is sent once by the Worker on the first `GET /api/profile` (`routes/profiles.ts:503-512`, Brevo via `confirmLink.ts`), within 48 h of sign-up.
   - `POST /api/profile/confirm-link` exists (`profiles.ts:601`), but **no client code calls it**: there is no "Resend" anywhere.
   - Step 2's note "Others see you once you confirm your email" gives no action to take.
9. **Typo'd email = orphan account.**
   - The session is issued at once, so the reader reads and syncs normally under a wrong address.
   - Password reset and the confirmation email go to the typo, and no UI shows or changes the email.
   - The account becomes unrecoverable on the next device or after sign-out.
10. **Password field markup.** It keeps `autocomplete="current-password"` in create mode (`sign-in/index.html:31`; `setMode` never switches it), so iOS and Chrome do not offer a generated strong password. The rules mismatch is covered in section 2 (6 vs 8 characters).
11. **"Settings → I read in" shows two unlabeled switches.**
    - `cardViews.ts:1171-1174` puts two `toggle()`s in one row. `toggle()` (`:223-228`) renders an empty `<button role=switch>` with only an `aria-label`, so sighted readers see "I read in ◯ ◯" with no English/Dansk text.
    - Turning off the only language is a silent no-op (`readingLanguages.ts` `toggleReadingLanguage`).
    - Step 3 does this correctly, with labelled tick rows. Use a labelled two-option tick list or segmented control. Since Danish is optional per STRATEGY, consider hiding the row unless `da` is in the browser languages.
12. **Edition wording disagrees across three places.**

    | Where | Modern | Human |
    |---|---|---|
    | Sign-up step 3 (`NEW_BOOKS_COPY`, `profileRules.ts:35-38`; question `signUpSteps.ts:382`) | "Modern English" / "The same book, in today's English." | "Human originals or translations" / "The original text, or a published translation." |
    | Settings "New books open in" (`cardViews.ts:1183`; `cardsCopy.ts:46-49`) | "Modern" | "Original", plus foot "Modern is Tinct's English rewrite; Original is the source text or a published translation." |
    | Reader edition picker (`editionDifficulty.ts:123`) | "Tinct Modern English" | |
    | Also using "human" wording | `privacy.html:150` ("human originals and translations"), `publicBooks.ts:449` and `preReader/catalogue.ts:289` ("Human translation by …"), `landing.html:256` ("A human translation + a modern AI translation") | |

    "Human originals" is odd (every original is human). The step-3 Modern line never says it is Tinct's AI rewrite; the Settings foot does say it is Tinct's rewrite. Suggest one pair everywhere: **"Modern English: Tinct's rewrite in today's English"** and **"Original: the author's text, or a published translation"**, defined once in `NEW_BOOKS_COPY` and reused by `cardsCopy`. If the privacy wording changes, `privacy.html:150` must follow (Privacy section of AGENTS.md).
13. **Design-system breaks on the auth page.**
    - All-caps eyebrows "WELCOME BACK" and "PASSWORD RECOVERY" (`sign-in/index.html:12` `.auth-eyebrow{text-transform:uppercase}`). With profiles on, create mode hides the eyebrow and "or with email" is lower-cased (`signUpSteps.ts:44-45`); sign-in and forgot still show the caps eyebrow.
    - The titles use an Iowan/Palatino stack instead of Playfair Display.
14. **Back link inside steps 2-3 reads "← Library".** It leaves the flow, where the account already exists, with no confirmation. That is fine as an escape, but it is labelled as if nothing happened.
15. **Landing "Sign in" costs an extra redirect** (`/app?signin=1` → 302 → `/sign-in`, about 0.45 s).
16. **Share-link visitors are sent to Sign in, not Create** (`profilePageView.ts:77`). A first-time follower has to find "Create one free".

## 4. Email confirmation today

- **Supabase setting.** It is off in production. `GET /auth/v1/settings` reports `"mailer_autoconfirm": true`; `signUp` returns a session at once, so the "Check your email…" branch (`labSignIn.ts:176-178`) is dead code while that holds. The 2026-05-09 decision cited in the brief is **not** in `DECISIONS.md` on main; only `CLAUDE.md:69` ("Supabase email confirmation is off") records it.
- **Supabase's own `auth.users.email_confirmed_at`.** It is not used for anything. With autoconfirm, Supabase stamps it at sign-up, so it means nothing. `adminAccounts.ts:271` only displays it.
- **Tinct's `profiles.email_confirmed_at`.** This is the soft confirmation, added in `supabase/migrations/20261008_profiles.sql:29`. It is set:
  - for Google accounts by the consent trigger (`:51-53`), by a backfill (`:62-67`) and lazily (`profiles.ts:202-210`);
  - for email accounts only via the signed `/confirm?t=` link (`routes/emailLinks.ts:107-110`), sent once automatically (`profiles.ts:503-512`, `sendSignUpConfirmation` `:640-660`, 48 h window, `confirmLink.ts:89`).

  What depends on it:
  - "Everyone" counts as "Friends" until it is set: `effectiveVisibility` (`profileRules.ts:326-327`) and the `public_profile_cards` and leaderboard views (`20261008_profiles.sql:197`, `20261009_leaderboard_internal.sql:50`).
  - Find readers treats an unconfirmed Everyone as Friends (DECISIONS 2026-10-19).
  - Lifecycle emails: the welcome vs welcome-google template, and reading emails need it (`lifecycle/engine.ts:112-115, 394-397`; DECISIONS 2026-10-08).
  - The step-2 note (`signUpSteps.ts:351`).
- **Password reset.** It relies on Supabase's own recovery email and works regardless of confirmation, so a typo'd address cannot reset.
- **Apple and other OIDC providers** would not be treated as confirmed: `isGoogleAccount` and the trigger only check `provider = 'google'`.

## 5. Supabase auth capabilities

**Live project settings** (public `GET https://yazjyiqsxjystvpkyouk.supabase.co/auth/v1/settings`, 2 Nov 2026): providers `email: true`, `google: true`, `apple: false`, `github: false`, `anonymous_users: false`, `phone: false`; `mailer_autoconfirm: true`; `disable_signup: false`; **`passkeys_enabled: false`**.

**Installed client:** `app/package.json:37` `^2.99.3`; the lockfile and the production bundle are **@supabase/supabase-js / auth-js 2.100.1** (26 Mar 2026). There is no `node_modules` in this checkout. Latest is 2.118.0 (15 Oct 2026).

| Capability | In 2.100.1? | Needs | Docs |
|---|---|---|---|
| **Email OTP, 6-digit code** | Yes: `signInWithOtp({ email, options: { shouldCreateUser: true } })` + `verifyOtp({ email, token, type: 'email' })` | Add `{{ .Token }}` to the **Magic Link** email template; set OTP expiry (default 1 h; 10-15 min suggested). The same call signs up new readers, so it replaces both email+password and "forgot password". | https://supabase.com/docs/guides/auth/auth-email-passwordless |
| **Magic link** | Yes (the same `signInWithOtp` with `emailRedirectTo`) | Redirect URL allow-list (already `https://tinct.app/sign-in*`). Breaks across devices and in-app browsers; a code is better. | same |
| **Passkeys (first-party, not only MFA)** | **No.** 2.100.1 has WebAuthn only as an MFA factor (`mfa.enroll({factorType:'webauthn'})`). First-party `signInWithPasskey()` / `registerPasskey()` / `auth.passkey.*` arrived in **2.105.0** behind `experimental: { passkey: true }`. From **2.117.0** the flag is ignored and passkeys are on by default (`lib/types.d.ts` `ExperimentalFeatureFlags`); the docs still say "experimental / beta" (changelog 28 May 2026). | Upgrade to ≥ 2.117 (a new-dependency-version decision for Anders); Dashboard → Authentication → Passkeys on; RP ID `tinct.app` (it cannot change later without invalidating passkeys), origins `https://tinct.app`. **Passkeys cannot create accounts**: registration needs a confirmed, signed-in, non-anonymous user, so they are a second sign-in method offered after the first sign-in, and they are only useful once email is truly confirmed (an OTP sign-in confirms it). Supports Conditional UI (`mediation: 'conditional'`, passkey autofill on the email field). | https://supabase.com/docs/guides/auth/passkeys, https://supabase.com/changelog/46458-passkeys-for-supabase-auth-beta |
| **Sign in with Apple** | Yes (OAuth; markup and code already exist, hidden at `labSignInProviders.ts:40`) | Apple Developer account: App ID, Services ID, .p8 key. **The client secret must be regenerated every 6 months** or sign-in breaks. Web OAuth does not return the name; it may return a private-relay email. Also extend the "confirmed" rule beyond Google (`profiles.ts` `isGoogleAccount`, migration trigger). | https://supabase.com/docs/guides/auth/social-login/auth-apple |
| Google One Tap / `signInWithIdToken` | Yes | Google Identity Services script (a new external script) plus a nonce; it saves the full-page redirect round trip. | https://supabase.com/docs/guides/auth/social-login/auth-google |

**Email delivery: verify before any OTP launch.** Tinct's own emails (confirmation, lifecycle) go through Brevo's HTTP API (`src/worker/routes/emails.ts:33`). Supabase's auth emails (password reset today; OTP codes tomorrow) are sent by whatever SMTP the Supabase project has. Nothing in the repo says custom SMTP is configured, and it cannot be read from the public settings endpoint.

Supabase's **default SMTP sends only to the project team's own addresses ("Email address not authorized") at about 2 messages per hour** (https://supabase.com/docs/guides/auth/auth-smtp). If that is still the case, **password reset is silently broken for every real reader today**. Anders should check Dashboard → Authentication → Emails → SMTP Settings. If it is not set, configure Brevo SMTP (`smtp-relay.brevo.com:587`, Brevo SMTP key, sender `no-reply@tinct.app`). Then raise Authentication → Rate Limits → "emails sent" from the custom-SMTP default of 30/h to something like 100-300/h, and keep OTP "once per 60 s per address". Brevo as Supabase's SMTP is a new data path, but the same processor already in `privacy.html`.

## 6. Steps 2 and 3 in detail (after #624)

- **How pictures are chosen.**
  - `GET /api/profile?book=<hint>` creates the profile with the set matching the last-read book (`pictureForBook`, `profileRules.ts:282-287`).
  - Step 2 shows that set first, then the others, sliced to **3 sets** (`signUpSteps.ts:224-225`). It then adds Longbourn and The Awakening "pictures of women" (`:37-41, 285-287`), the initial (`:288`) and, if uploads are on, "Upload a picture".
  - Choosing a set picture does **not** change the background; choosing a scene does not change the picture. Yet the server comment says "a set brings its background with it" (`:398`).
- **Scenes.** The same 3 sets, labelled by set name (Stoic / At sea / Florence / …). Each tap repaints the banner `--scene` with the 100-140 KB `room-*-phone.jpg`. The rendering bug is described in section 3 #1.
- **Both choosers open from the camera icons** (`:256, 262`), stack under the hero and push Continue below the fold on a phone (`phone-07`).
- **Saving is awaited, not optimistic.**
  - Continue: `POST /api/profile` with consent, name, visibility, switches, picture and background, then sequential `POST /api/profile/image` per pending upload, then step 3 (`:392-414`). Errors stay on step 2.
  - Start reading: `POST /api/profile {newBooksOpenIn, readingLanguages}`, then `rememberNewBooksOpenIn`, then navigation (`:420-427`).
  - Skip on step 3 saves nothing, so the device keeps the defaults it remembered from the GET (`socialClient.ts:72-74`).
- **Waits per Continue:**
  - Step 1→2: `signUp` (or the OAuth round trip plus a page reload), then `GET /api/profile` (Worker: verifyUser plus `ownProfile` create, `flagInternal`, `accountState` with possible update, deferred confirmation send).
  - Step 2→3: 1 POST plus 0-2 image uploads.
  - Step 3→reader: 1 POST plus a full navigation.
  - None of these show a ring.

## 7. Recommendations for a fast flow

Target: **one screen, 2 taps (Google) or 1 field + 6 digits (email), back in the book in under 5 s on a phone.**

1. **One "Continue" screen, no password.**
   - Show "Continue with Google" (later also Apple) plus one email field and "Email me a code". `signInWithOtp` then shows a 6-digit input on the same card: `autocomplete="one-time-code"`, `inputmode="numeric"`, auto-submit on the 6th digit, "Resend in 60 s", "Use a different email".
   - New or existing reader is the same path, so the sign-in/create toggle and "Forgot password?" disappear.
   - Keep email+password sign-in behind "Use a password" for existing password accounts during the transition.
   - Entering the code **proves the address**, so set `profiles.email_confirmed_at` when the session's AMR is `otp` (or the auth user's `email_confirmed_at` once autoconfirm is turned off). Typo'd orphans and the Everyone→Friends limbo end for new accounts.
2. **Show the Terms line and consent box on that single screen** for every method, Google included (fixes #6). Send the opt-in with the first profile request regardless of Skip (fixes #7).
3. **Drop steps 2-3 from the critical path.**
   - Return to `returnTo` immediately after the session exists.
   - Create the profile with defaults server-side: the set from the book hint; visibility **Friends** or Only me until the reader picks one; languages from the browser; Modern.
   - Offer "Set up your profile" once later, outside a book (the existing `shouldPrompt` mechanism), and keep the edition choice in the reader's edition picker and Settings.
   - If steps 2-3 stay, make them optimistic: advance at once, save in the background with `keepalive`, and show errors in Settings.
4. **If step 2 stays, fix the scene picker** (scoped CSS, real thumbnails, selected ring), serve small avatar and scene crops (about 2.9 MB down to under 100 KB), and open one chooser at a time.
5. **Passkeys as phase 2.** After an upgrade to supabase-js ≥ 2.117 and Dashboard → Passkeys (RP ID `tinct.app`), offer "Sign in faster next time with a passkey" once after the first verified sign-in (`registerPasskey()`). Add `autocomplete="username webauthn"` on the email field with `signInWithPasskey({ options: { mediation: 'conditional' } })` so returning readers get autofill. Passkeys cannot replace sign-up, so OTP + Google remains the front door.
6. **Before any of this: confirm Supabase custom SMTP** (Brevo) and its rate limits (section 5). OTP depends on Supabase auth email entirely.
7. **Small fixes worth doing regardless:**
   - Set `autocomplete="new-password"` in create mode and align the minimum with reset.
   - Map Supabase errors to Tinct copy; "User already registered" should say "That email already has an account. Sign in, or continue with Google if you used it before."
   - Keep the create form busy until step 2 renders.
   - Label the "I read in" switches.
   - Unify the edition copy.
   - Use sentence-case eyebrows.
   - Point share-link Follow at `?mode=create`.
   - Link the landing "Sign in" straight to `/sign-in`.
   - Add a "Resend confirmation" control calling `/api/profile/confirm-link` while unconfirmed accounts exist.
   - Log the 2026-05-09 "Confirm email off" decision in `DECISIONS.md`.

Items that need Anders before any build (AGENTS "Ask Anders first"): changing the sign-up UX paradigm, the supabase-js upgrade, Apple Developer and SMTP dashboard changes, and the visibility default.

## Screenshots

`phone-*` and `desktop-*`: `01-sign-in`, `02-create-step1` (`02b` scrolled, phone), `03-forgot`, `04-step2-profile`, `05-step2-scenes-open`, `06-step2-scene-tapped`, `07-step2-pictures-open`, `08-step3-reading`. Steps 2-3 are production code with mocked network and a fake local session; no request reached the API or Supabase.
