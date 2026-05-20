# Tinct Mobile Strategy

**Last updated:** 2026-05-19

This document is the working plan for Android and iOS. It exists to keep the web app, Android app, and iOS app moving as one product without letting installed apps drift behind web changes.

Store-policy and fee claims in this document were last checked against official Apple / Google documentation on 2026-05-19. Re-check before any store submission or billing implementation.

## Position

Tinct should have native apps because the product is becoming more than a website:

- Deep reading benefits from a dedicated full-screen reading container.
- Offline reading is a real product value for public-domain books.
- Audio needs better mobile behavior than browsers reliably provide.
- The "talk to book" direction belongs naturally in an app: microphone access, voice input, spoken responses, audio session control, and a lower-friction return to the current passage.
- A home-screen app supports reading habit better than a browser tab.
- Native subscriptions can reduce purchase friction at the $3/month price point.

The mobile goal is not to build three separate products. The goal is one Tinct experience with thin native shells.

## Architecture

Use Capacitor for Android and iOS:

```text
React/Vite app
  |
  |-- Web: tinct.app
  |-- Android: Capacitor shell
  |-- iOS: Capacitor shell
```

The React app remains the source of truth. Native shells should handle packaging, store distribution, native billing, native auth redirects, safe areas, audio/session behavior, and later voice capabilities. Reader logic, book data loading, position handling, chat UI, Feed, Cast, and onboarding should stay shared unless there is a clear platform constraint.

Current repo state:

- Android Capacitor project exists at `app/android`.
- Capacitor config exists at `app/capacitor.config.ts`.
- The current native app ID is `app.tinct.reader`.
- iOS has not been added yet.
- Native-aware code already exists, but platform checks are scattered across app code.

## One-Way Doors

Some mobile decisions become expensive to change after store distribution begins.

Native identity:

- Android package / Capacitor `appId` is currently `app.tinct.reader`.
- Changing it after Play distribution means a new listing/package identity, lost install continuity, and likely lost reviews.
- The iOS bundle ID should intentionally match the same identity pattern before TestFlight.
- Confirm this name before closed testing or external TestFlight.

Billing:

- Backend entitlement is portable across platforms, but payment relationships are not.
- A user subscribed through StoreKit remains a StoreKit subscriber until they cancel through Apple; a Play subscriber remains a Play subscriber until they cancel through Google.
- Tinct cannot silently migrate native subscribers to Stripe later.
- We accept this lock-in only if native purchase friction is more important than unified billing control at the current $3/month price.

## Decision: Android First, iOS Second

Ship Android first.

Reasons:

- Android Capacitor is already present.
- Android is the fastest way to prove the mobile workflow.
- Android/e-ink is already part of the product direction.
- Google Play setup is lighter than Apple Developer + Xcode + StoreKit.
- iOS adds useful pressure later, but it should not block learning from Android.

Target sequence:

1. Harden Android app workflow.
2. Add native billing abstraction before billing logic spreads.
3. Add client version handshake before native users accumulate.
4. Ship Android internal testing / closed testing.
5. Add iOS once the Android workflow is boring.

Calendar constraint:

- If Anders is away without a laptop for an extended period, mobile must stay in a low-risk state.
- Do not start Play closed/open testing, TestFlight external testing, or app-store review inside the three weeks before travel unless someone can respond quickly to policy, signing, or review issues.
- Internal-only testing is acceptable before travel if it does not start a public/review clock.

## Decision: Bundled App Runtime

Prefer bundled Capacitor assets over a live webview that loads `tinct.app`.

Reasons:

- Offline reading matters for Tinct.
- The app should open even without network.
- App review is safer when the app is not just a hosted website wrapper.
- Native audio and "talk to book" features will be easier to reason about when the app has a real native runtime.

Tradeoff:

- Bundled apps can fall behind web unless the release workflow prevents it.
- The backend must remain backwards-compatible with installed app versions.
- Web deploys cannot assume every app user has the newest bundle.
- Offline is not all-or-nothing: reading, downloaded books, highlights, notes, journal, and last-known entitlement should degrade gracefully; chat, subscription changes, and fresh sync require network.

This means mobile discipline is an API/versioning problem more than a codebase problem.

Bundled app shell is not the same thing as offline library. Offline reading needs an explicit storage contract:

- what ships inside the app bundle,
- what downloads after install,
- where downloaded books/audio live,
- how cache/schema versions migrate,
- what works when the network is absent or unreliable.

Do not rely on the web service worker as the only native offline strategy. Capacitor can access native APIs when needed, including filesystem and network capabilities, and native downloaded content may need a native-backed storage layer.

Asset size matters. Google Play currently lists a 200MB base-module compressed download limit and larger limits for feature modules / asset packs; bundled audio or large libraries may require Play Asset Delivery or post-install downloads rather than the base app bundle.

## Decision: Native IAP For Apps

Use platform in-app purchases for Premium inside Android and iOS.

Reasons:

- Lower purchase friction for phone users.
- Cleaner App Store / Play Store review path.
- Apple and Google handle cancellation, tax, refunds, and payment failures.
- At $3/month, the conversion lift is likely worth more than avoiding the platform fee.

Expected fee model:

- Apple Small Business Program: 15% if Tinct qualifies under the current threshold.
- Google Play subscriptions: generally 15% for auto-renewing subscriptions.
- Net before tax/currency effects is roughly $2.55 on a $3.00 subscription at 15%.

Stripe remains the web billing provider. Native billing should not leak through the app.

Entitlement must be owned by Tinct's backend, not by Stripe, StoreKit, or Google Play directly. Payment providers are activation paths; Supabase/API entitlement is the source of truth. This prevents the support failure where a reader who subscribed on web installs the iOS app and sees a free account, or a native subscriber signs in on web and loses Premium. StoreKit/Play purchases should be verified server-side, mapped to the Tinct user, and reflected in the same entitlement API that Stripe-backed users already depend on.

Create a payment abstraction:

```text
BillingProvider
  |
  |-- WebBillingProvider: Stripe checkout / customer portal
  |-- AndroidBillingProvider: Google Play Billing
  |-- IOSBillingProvider: StoreKit
```

The product code should ask for capabilities:

- current entitlement
- subscribe
- restore purchases
- manage subscription
- purchase top-up, if top-ups remain part of mobile billing

It should not know whether the provider is Stripe, Google Play, or StoreKit.

Entitlement identity rules must be designed before native billing ships:

- A web subscriber who installs Android/iOS should see Premium after signing in.
- A native subscriber who opens web should see Premium after signing in.
- IAP purchase before sign-in must either be blocked or have an explicit account-linking flow.
- Restore purchases must handle "this store purchase is already linked to another Tinct account" without silently granting duplicate access.
- Refunds, cancellations, grace periods, billing retry, and revocations must flow from Stripe/StoreKit/Play into the same entitlement state.
- Native free trials may not map exactly to the current Stripe-managed 30-day trial. Apple and Google have their own trial eligibility and account-level rules, so native trial policy must be chosen explicitly.

## Platform Abstraction

Centralize platform detection before adding iOS-specific branches. This is urgent existing tech debt, not a future cleanup.

Current direct native/Capacitor checks exist in:

- `app/src/main.tsx`
- `app/src/utils/apiUrl.ts`
- `app/src/utils/audioUrl.ts`
- `app/src/utils/homeRole.ts`
- `app/src/components/BottomBar.tsx`
- `app/src/worker.ts`

Current user-agent/mobile detection also exists in:

- `app/src/main.tsx`
- `app/src/components/ShareModal.tsx`
- `app/src/utils/analytics.ts`

Recommended structure:

```text
app/src/platform/
  runtime.ts
  capabilities.ts
  urls.ts
  billing.ts
  audio.ts
```

The rest of the app should use named capabilities:

```ts
platform.isNative
platform.isAndroid
platform.isIOS
platform.isEink
platform.supportsHomeRole
platform.supportsNativeBilling
platform.supportsOfflineBooks
platform.apiBaseUrl
platform.audioBaseUrl
```

Avoid new direct checks like:

```ts
(window as any).Capacitor
navigator.userAgent
Capacitor.getPlatform()
```

Scattered checks are the path to subtle Android/iOS differences. Central capabilities make it clear which behavior is intentional.

Also centralize Worker calls:

```text
app/src/platform/apiClient.ts
```

All app-to-Worker calls should go through one `apiFetch` wrapper. Components and hooks should not call `/api/*` directly. This wrapper is the enforcement point for native/web base URLs, auth headers, client-version headers, update-required handling, and consistent offline errors.

## Version Handshake

Every native request should identify the installed client.

Send headers from app-originated API calls:

```text
X-Tinct-Client: web | android | ios
X-Tinct-Client-Version: 1.2.3
X-Tinct-Client-Build: 42
```

The Worker should maintain a minimum supported version per native platform:

```json
{
  "android": {
    "minVersion": "1.0.0",
    "recommendedVersion": "1.1.0"
  },
  "ios": {
    "minVersion": "1.0.0",
    "recommendedVersion": "1.1.0"
  }
}
```

If a client is too old, return a structured response:

```json
{
  "error": "client_update_required",
  "message": "Please update Tinct to continue.",
  "platform": "android",
  "minVersion": "1.2.0"
}
```

App UI should show a friendly update gate instead of failing inside the reader, chat, auth, or billing flow.

Rule:

```text
Never deploy a breaking API or data-contract change until old native clients are either still supported or intentionally gated by min-client-version.
```

The first Android build that reaches testers must already include update-required response handling, even if the server initially sets `minVersion` to `1.0.0` and gates nothing. Without that code in v1.0.0, the first installed cohort cannot be cleanly forced forward later.

## Release Discipline

The goal is not to ship all three surfaces every time. The goal is to never deploy web/API in a way that strands installed apps.

Use this rule:

```text
Every web deploy must verify native compatibility.
Every native-impacting release must queue native builds.
Every breaking API change must bump or check min-client-version first.
Every week, build/open the native apps even if no native work happened.
```

Native-impacting changes include:

- API request/response contract changes.
- Auth redirect changes.
- Billing or entitlement changes.
- Audio endpoint changes.
- Offline storage format changes.
- Book data schema changes consumed by bundled app code.
- Reader position, pagination, sync, or chapter navigation changes.
- Capacitor config/plugin changes.
- Native permissions, icons, splash screens, safe-area handling, or store metadata.

Non-native-impacting changes may ship web-only after native compatibility checks pass:

- Landing page copy.
- SEO page copy.
- Static marketing pages.
- Content additions that old app code can safely ignore.
- Server fixes that preserve existing contracts.

The weekly heartbeat exists to catch silent native/toolchain drift: Capacitor plugin changes, Gradle changes, Play Console requirements, Xcode/CocoaPods changes once iOS exists, signing/certificate issues, and store privacy metadata drift. It should be short: build, sync, launch, open a book, play audio, confirm auth/entitlement state, and record the result in `SESSION.md` or the release checklist.

Capacitor and native plugin versions should be pinned intentionally. Do not casually float native plugin versions as part of unrelated app work. Major upgrades for Capacitor, Gradle/Android Gradle Plugin, Kotlin, Xcode, CocoaPods, StoreKit, or Play Billing should be scheduled as maintenance work with a native smoke test, not mixed into product changes.

## Proposed Scripts

Existing scripts in `app/package.json` already cover the current web and Android basics:

```json
{
  "build": "vite build && mv dist/index.html dist/app.html && cp dist/landing.html dist/index.html",
  "build:android": "CAPACITOR=true vite build && npx cap sync android",
  "android:open": "npx cap open android",
  "android:run": "CAPACITOR=true vite build && npx cap sync android && npx cap run android"
}
```

Add only the missing orchestration scripts:

```json
{
  "verify:native": "npm run build:android",
  "verify:all": "npm run build && npm run verify-bundle && npm run verify:native",
  "native:heartbeat": "npm run verify:native"
}
```

When iOS exists, add explicit iOS scripts and extend `verify:native`:

```json
{
  "build:ios": "CAPACITOR=true vite build && npx cap sync ios",
  "ios:open": "npx cap open ios",
  "verify:native": "CAPACITOR=true vite build && npx cap sync android && npx cap sync ios"
}
```

Do not make store submission part of the default web deploy. Store submission should be an explicit release step.

`verify:native` catches JS build and Capacitor sync drift. The weekly heartbeat should go further and build/open the native project so Gradle/Xcode/signing failures are caught before release week.

## Native Smoke Test

Before a native release, verify:

- App launches from a cold start.
- Last-read book opens correctly.
- Saved position loads and writes.
- Chapter advance opens next chapter at page 1.
- Chapter retreat opens previous chapter at last page.
- Read and Compare stay chapter-scoped.
- Mobile hidden views do not commit stale page state.
- Chat opens only when explicitly selected.
- API calls reach the deployed Worker.
- Native OAuth redirects work for Supabase/Google sign-in and do not get stuck on `capacitor://`, `https://localhost`, or the wrong deep-link origin.
- Audio manifest loads.
- Audio file plays.
- Audio proxy bandwidth is understood. Capacitor audio currently routes through the Worker for CORS/private R2 access, so mobile audio usage can increase Worker/R2 traffic and cost.
- Offline book opens after network is disabled.
- Auth sign-in and sign-out work.
- Premium entitlement state displays correctly.
- Subscribe / restore / manage subscription paths work for the platform.
- Android e-ink behavior is still intentional.
- iOS safe areas do not clip reader controls.
- Store privacy requirements are current: iOS privacy manifest / App Privacy answers and Play Console Data Safety form.

For reader-position changes, also follow `AGENTS.md` reader invariants and add a focused regression when practical.

For voice features, privacy requirements expand. Microphone permission, transcript handling, AI processing, retention, deletion, and whether voice data is used for improvement/training must be reflected in app privacy declarations and Tinct's privacy policy before release.

## Talk To Book Direction

The mobile app should prepare for a voice-first companion without forcing it into the first release.

Likely phases:

1. Text chat remains the default companion.
2. Add push-to-talk input for the current passage.
3. Add spoken answers with clear controls and interruption handling.
4. Add a "conversation while reading/listening" mode.
5. Add character/book-specific voice experiences only after the base interaction works.

Architecture implications:

- Chat context must remain anchored to current book, chapter, page, and selected paragraph.
- Voice should use the same entitlement and usage accounting as text chat unless a separate cost model is chosen.
- Audio playback and voice response must coordinate so the audiobook pauses/resumes predictably.
- Native microphone permission state should live behind the platform abstraction.
- Old web chat code should not know about StoreKit, Play Billing, Android audio focus, or iOS audio sessions.

Open design choices before implementation:

- speech-to-text provider,
- text-to-speech provider,
- whether spoken answers count as chat messages or a separate quota,
- whether voice mode can run while audiobook playback is active,
- what is stored as transcript/history,
- how microphone permission failure degrades.

## Initial Engineering Plan

Phase 0: Mobile preflight

- Confirm `app.tinct.reader` is the permanent Android package / iOS bundle identity.
- Confirm Play Console enrollment and account standing.
- Confirm whether Android v1 targets general Android phone/tablet, Boox/e-ink, or both equally.
- Decide whether mobile Premium includes top-ups or subscription-only access at first.
- Decide native trial policy instead of assuming Stripe's 30-day trial maps cleanly.
- Decide trip-safe timing: internal-only before travel, or wait until after travel for review/public testing.

Phase 1: Android hardening

- Centralize platform detection.
- Centralize API/audio URL selection.
- Introduce shared `apiFetch` for all Worker calls.
- Add native client version metadata.
- Add Worker-side client version parsing.
- Add update-required response handling in the app before v1.0.0 reaches testers.
- Add `verify:native` and `verify:all`.
- Document Android internal testing steps.

Phase 2: Billing abstraction

- Introduce `BillingProvider`.
- Move current Stripe assumptions behind web billing provider.
- Define native entitlement sync contract.
- Decide how top-ups work on mobile before implementing IAP.
- Add Android Play Billing provider.

Phase 3: Android release

- Configure app icon, splash, permissions, signing, and Play listing.
- Run native smoke test.
- Ship to internal testing first.
- Fix issues before closed/open testing.
- Do not start closed/open testing near a travel window unless support coverage exists.

Phase 4: iOS project

This has real-world setup lead time. Apple Developer enrollment costs $99/year, can require organization verification / D-U-N-S details depending on account type, can take days, and requires a Mac with current Xcode. Start that setup before iOS work becomes schedule-critical.

- Enroll / verify Apple Developer setup.
- Add `app/ios` with Capacitor.
- Add iOS safe-area and auth redirect checks.
- Add StoreKit provider.
- Run simulator and device smoke tests.
- Ship to TestFlight.

## Open Questions

- Should mobile include top-up packs, or should mobile Premium be a simpler subscription-only product at first?
- Which books/audio assets are bundled for true offline use versus downloaded after install?
- Should Android e-ink remain the primary Android target, or should phone/tablet Android get equal design priority from the first release?
- What is the minimum acceptable offline mode for v1: current book only, selected books, or full library metadata?
- What is the first "talk to book" mobile feature: push-to-talk question input, spoken answers, or both?
