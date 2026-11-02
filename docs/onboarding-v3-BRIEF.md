# Onboarding v3: brief for Coder (draft, 2 November 2026)

Status: a draft for Anders. Send it to Coder only on his go.

- **Mockups:** https://claude.ai/artifact/WBZi32qK94yJrptqvNBkR2
- **Scan of today's flow:** `docs/onboarding-scan-2026-11-02/SCAN.md`, with screenshots.
- **Real screenshots of the returning-reader flow:** `docs/social/returning-flow-screens-2026-11-02/`.

**Goal:** from the first tap to the first page in two taps, one code and two short steps. No passwords, no spinners, and the reader never loses their place.

## The flow

1. **Keep your place** (a sheet over the book or the library, not a separate page). It holds:
   - Continue with Google;
   - "or";
   - an email field with Continue with email, where `autocomplete="email webauthn"` lets a saved passkey fill in;
   - "No password. We email you a 6-digit code, or you use a saved passkey.";
   - the Terms and privacy line, shown for every method (today Google sign-up from the Sign in screen skips it).

   The email-consent tick moves to Settings and the welcome email. It is never lost on Skip, as it is today.
2. **Check your email.** Six boxes with `autocomplete="one-time-code"` and `inputmode="numeric"`; the sign-in goes through on the sixth digit. There is "Open Gmail" when the address is a Gmail address, and "Change" plus "Send a new code" after 30 s. The code also confirms the email, which ends unconfirmed accounts for new sign-ups.
3. **Your profile** ("1 of 2", Skip at the top right). There is **no background by default**, to keep friction low (Anders, 2 Nov).
   - **Header:** "Your profile", then the round picture with a camera badge next to the name. The picture is the Google photo if there is one, otherwise the initial.
   - **Name:** large Playfair text on a single underline, prefilled from Google and empty otherwise. An empty name never blocks the step. Today Continue with an empty name returns 422 "Please choose another name."; instead, save without a name or prompt gently on the field.
   - **"+ Add a background":** a quiet text button. A tap opens a "Background" strip: **Upload** first, then the scene thumbnails, plus "None". Thumbnails are about 78×54 px, from images of about 30 KB each, preloaded. A tap adds or swaps the banner above the picture instantly and shows a selected ring. Uploading a banner uses the existing background upload. Today the strip is broken: the rule at `signUpSteps.ts:75` overrides the scene rule at `:60`, so the buttons are 44×72 px with no image.
   - **Picture:** tapping it opens a "Picture" strip: **Upload** first, then cover crops of about 15 KB each. Today the picture row downloads about 2.9 MB of full covers.
   - **Public | Private:** a segmented control with one line under it. Public sets Everyone, show reading, show time and the leaderboard; Private turns all of them off.
   - **Continue** moves on at once and saves in the background, retrying if it fails. No waiting on the network.
4. **How do you read?** ("2 of 2", Skip):
   - **Languages:** chips with written labels, English and Dansk, both allowed.
   - **New books open in:** **Modern translation**, "AI-generated, in today's language. Easier to read.", or **Original**, "The author's own words, or a published human translation."
   - **Start reading** returns the reader to their book at their place, or to the library.
5. **Back in the book,** with the toast "You're in. Your place and notes now follow you."

**Returning readers:**
- What's new, then Continue, then the same steps 3 and 4. The counter reads "1 of 2", not today's "2 of 3".
- Readers who already set up a profile see the card only.

## Later

- **Passkey offer** at the second sign-in, or after the first day of reading: "Sign in faster next time" with Save a passkey or Not now. Settings gets a "Signing in: Google · passkey" row.
- **This needs a supabase-js upgrade** from 2.100.1 to at least 2.117, where passkeys are stable, and passkeys switched on in the Supabase project. It is a dependency change, so Anders must approve it. Passkeys sign readers in but cannot create accounts.
- **Apple sign-in** is not included. It needs an Apple Developer account and a key renewed every 6 months.

## Settings

- **Languages:** the row becomes labelled chips, English and Dansk, replacing the two unlabelled switches at `cardViews.ts:1171`.
- **"New books open in: Modern · Original"**, with the footnote: "Modern is an AI-generated translation in today's language; Original is the author's text or a published human translation." The same words go in sign-up, Settings and the reader's edition picker.

## Before building (Anders, Supabase dashboard)

1. **Check whether auth emails go through custom SMTP** (Brevo) or Supabase's default sender. The default is heavily rate-limited, so password resets may not be reaching readers today, and email codes would not work either. If needed, set SMTP to Brevo.
2. **Change the "Magic Link" email template** to show `{{ .Token }}`, the 6-digit code.
3. **Leave "Confirm email" off.** Email codes confirm the address by themselves.

## Also fix

- **Double account creation.** After "Create account" the form is re-enabled while the profile is still loading (`labSignIn.ts:125,196`), so a second tap shows "User already registered". The new flow has no password form, but keep the button disabled until the sign-in completes.
- **Log the 9 May "Confirm email off" decision** in DECISIONS.md, together with this change.
- **The You card:** put the name and the pencil on one line.

## Tests

1. **Every path:** Google, an email code, and an existing account signing in by code. Each lands back in the book at the same place.
2. **The code:**
   - fills in from autocomplete;
   - a wrong code shows an error;
   - after expiry, "Send a new code" works;
   - the Supabase OTP rate limit shows a calm message.
3. **The profile step:**
   - Skip at either step saves nothing;
   - an empty name never blocks;
   - Public and Private set exactly their four settings;
   - the scene and picture strips load their small images and respond on the first tap.
4. **Layout and speed:** `checkLayout` on phone and desktop; time from the email code to the book under 3 s on a throttled phone.
5. **Privacy:** privacy.html stays accurate. Show Anders any changed wording before release.
