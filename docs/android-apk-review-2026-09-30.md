# Android APK review — 2026-09-30

Review of the newest built APK. It is a review only: no app code, Supabase
configuration or signing material was changed.

## What was reviewed

| | |
|---|---|
| Artifact | `tinct-android-review`, Android APK acceptance run #49 (`36625107856`), 2026-09-29 20:15–20:25 UTC |
| Source | PR #231 head `679cccbd`. Its tree is identical to `main` at `3aad7958`. `main` has 3 later web-only commits (#257–#259) that are not in this APK |
| APK | `app-debug.apk`, 102.2 MB, SHA-256 `b985bf8a…c832e` (matches the CI size report) |
| Identity | `app.tinct.reader.review`, `1.1-eink-review`, versionCode 2, minSdk 24, targetSdk 36, debuggable |
| Signing | APK signature v2 only, `CN=Android Debug`, certificate created 2026-09-29 20:19:24 UTC, during the build step |
| Signed release | The **Signed Android APK** workflow has never run. There are no GitHub releases |

Method: I decoded the manifest and certificate with androguard, listed and sized
every asset, read all native Java and native JavaScript bridges, and went through
the CI evidence (results JSON, 76k-line logcat, screenshots). I re-ran the
project's own public sign-in redirect probe today. I compared the bundled book
catalogue with production and benchmarked the catalogue JSON work on a JVM.
There was no physical device or emulator in this environment.

## Verdict

The native layer is careful work: encrypted PKCE sign-in, hash-verified atomic
downloads, a correct media-playback foreground service, and release signing that
refuses to fall back to the debug key. Emulator acceptance passed every stage.
There were no crashes or ANRs in the logcat. The APK contains no secrets (only
the public Supabase `anon` key) and no source maps.

It is **not ready as a user-facing build** for two reasons:

- Google sign-in and password reset cannot return to the app (finding 1).
- Review builds cannot be installed over each other without wiping local data (finding 2).

## Findings

### 1. Blocker — Google sign-in and password reset never return to the app

Supabase does not allow either native callback URL. It redirects both to
`https://tinct.app`:

- CI artifact `native-auth-configuration.json` (Sep 29): `allowed: false` for both `app.tinct.reader.review` and `app.tinct.reader`.
- `app/scripts/android/check-auth-config.mjs` re-run today (Sep 30): same result, HTTP 302 to `https://tinct.app`.

Effect in the APK:

- **Continue with Google** finishes in the browser on tinct.app, and the app never receives the code.
- A password-reset email lands on the website instead of the app.
- Email + password sign-in and sign-up still work, because they need no redirect.

The acceptance run is green because the probe only records the result and never
asserts it. The emulator auth tests inject synthetic `error=access_denied`
callbacks and never go through Supabase.

Fix:

1. Add `app.tinct.reader://auth/callback?flow=*` and `app.tinct.reader.review://auth/callback?flow=*` in Supabase → Authentication → URL Configuration, as listed in `docs/android-auth-return-2026-09-29.md`.
2. Re-run the probe and expect `allowed: true`.
3. Make the probe fail the job, at least in `android-release.yml`.

### 2. High — every review APK has a different signing key, so review builds cannot update each other

The Gradle debug key is generated fresh on each GitHub runner. The certificate
start time falls inside this run's build step. Consequences:

- Installing the next review APK over this one fails with a signature mismatch.
- The only way through is to uninstall, which deletes downloaded books, the saved sign-in and any local-only reading data.
- `docs/android-release.md` says not to uninstall to resolve a signing mismatch, so the documented review channel cannot be used for repeated testing on a device.

Fix: keep one stable review keystore as its own GitHub secret, separate from
the permanent release key, and sign `assembleDebug` with it. Also stop
hard-coding `versionCode 2` (`app/android/app/build.gradle:17`); derive it from
the run number, or every release needs a manual bump.

### 3. Medium — Tinct can become the Home screen, but the app has no control to set or undo it

`AndroidManifest.xml:29` makes `MainActivity` a `HOME` launcher candidate. This
is in `main`, so the production package gets it too. The only UI that requests
or releases the role (`HomeRolePrompt`, the Home-app row in `SettingsSheet`) is
in the legacy `App.tsx`. The native app never renders it: every native route
goes to library_2 or `LabApp`, and nothing in `src/lab` or `public/lab`
references the Home role.

Where Android shows the "Select a Home app" chooser (common on e-ink and
non-Google devices), a reader who picks Tinct → Always gets a Home screen with
no app list and no in-app way back. The only exit is system Settings.

Decide: either remove the HOME filter until the lab settings expose
request/release, or port the Home-app row into `LabSettingsSheet`.

### 4. Medium — every page load waits on a 3.2 MB catalogue round trip

`main.tsx:60` awaits `initializeNativeBooks()` before the first render of every
document, including `/reader`. On the native side, `NativeBooksStore.snapshot()`
(`:134`) does the following to the 3.29 M-character catalogue:

- deep-copies it (`new JSONObject(index.toString())`);
- rebuilds it as `new JSObject(snapshot.toString())`;
- and Capacitor serializes it again for the bridge.

That is about 3 serializations and 2 parses per page load. Measured with
org.json on a warm 2.8 GHz Xeon JVM: 69 ms per serialization and 92 ms per
parse, so about 390 ms before the WebView even parses the result. On an
e-ink-class ARM chip, expect 1–3 s. The emulator logcat shows frame skips of
244–276 frames during the first library load. The emulator uses software
rendering, so that is suggestive, not proof.

Separately, every library visit calls `refresh()` (`nativeBooks.ts:56`). Each call:

- downloads the whole catalogue again (318 KB gzip). The server sends an ETag, but the app never sends `If-None-Match`;
- rewrites 3.2 MB to flash;
- and takes another snapshot.

Fix:

1. Let JavaScript read the bundled `native-books/index.json` as a normal asset.
2. Have the plugin return only `ready`, `readyEditions` and the pinned entries.
3. Cache the serialized snapshot.
4. Make the refresh conditional on the ETag.
5. Time `/reader` to ready on the real device.

### 5. Medium — Android Back never closes an open menu

There is no `backButton` listener and no history entry for sheets or dialogs:
no `pushState` or `popstate` in `src/lab` or `public/lab/library_2`. So
Capacitor's default runs: Back leaves the page, taking reader → library as a
full reload. It exits the app when the reader was opened with
`location.replace` (the resume path in `library_2/boot.js:24`).

The same applies to the download dialog: its `cancel` handler never fires from
Back, so the download keeps going with no UI. E-ink readers have hardware Back
keys, so readers will hit this.

Fix: register `App.addListener('backButton')`. Close the top-most overlay
first, otherwise go back or leave.

### 6. Medium (risk) — older system WebViews on e-ink devices

The bundle uses APIs that Vite's default target does not polyfill:

| API | Needs Chrome | Used for |
|---|---|---|
| `crypto.randomUUID` | 92 | starting Google sign-in (`nativeAuth.ts:92`) and creating highlights |
| `Array.prototype.at` | 92 | |
| `Object.hasOwn` | 93 | |
| `AbortSignal.timeout` | 103 | |

It also uses CSS that needs newer engines: `svh`/`dvh` (108), `:has()` (105)
and `color-mix()` (111).

Acceptance only runs on API 35 with a current WebView. With minSdk 24, devices
without Google Play and with an old WebView will partly fail.

Fix:

1. Check the WebView version on the target e-reader (`navigator.userAgent`).
2. Add a startup version gate with an "Update Android System WebView" message.
3. Polyfill `randomUUID`.
4. Consider an API 30 emulator job.

### 7. Medium — CI can release native changes that were never tested

- `android-apk.yml` runs only for `app/android/**`, `capacitor.config.ts` and `app/scripts/android/**`. All native JavaScript lives in `app/src/**` and `app/public/lab/**` (sign-in, downloads, media session, reader), and changes there never trigger the emulator suite. #257–#259 changed the bundled app with no APK run.
- `android-release.yml` signs `main` without running the emulator acceptance for that commit.
- `testDebugUnitTest` / `testReleaseUnitTest` only run Capacitor's template `ExampleUnitTest` (`assertEquals(4, 2 + 2)`). There are no JVM tests for `NativeBooksStore` or `NativeAuthStoragePlugin`.
- The sign-in redirect probe is not asserted (finding 1).

### 8. Low — download edge cases

- **A stale catalogue breaks downloads.** Downloads use whichever catalogue was refreshed last. Manifests are addressed by content and plain static assets, so after a deploy changes a book, the old manifest returns 404 (or the hashes stop matching). The user gets a generic "could not be downloaded" error with no refresh-and-retry. The APK's catalogue matches production exactly today, so this is latent until the next book-content deploy. Fix: on 404 or "Publication changed", refresh once and retry.
- **Cancel can cancel the wrong thing.** Refresh and download share one executor (`NativeBooksPlugin.java:13`) and one `cancelled` flag. A Cancel pressed while the download is queued behind a refresh cancels the refresh; the download then resets the flag (`NativeBooksStore.java:191`) and runs anyway, with the button stuck on "Cancelling…".
- **Storage is never reclaimed.** Downloaded books cannot be removed, and old revision and `.partial` folders are never cleaned up. Adding an edition to an installed book copies all of its files into a new revision (for the bundled Bible, about 45 MB of assets).
- **Packs carry text twice.** Sharded editions are included both as the whole edition and as chapter files: 35 MB of the 183 MB on-demand total.

### 9. Low — about 20 MB of website-only files in the APK

`prepare-assets.mjs:13` removes only `read/`, `sitemap.xml` and `robots.txt`.
Also shipped, but never reached by any native page:

| Files | Size | Why unused |
|---|---|---|
| `assets/about-v20` | 12.1 MB | About-page media; `about.html` is not linked from native pages |
| `hero-bg.png` | 3.7 MB | referenced nowhere |
| `og-image.png` | 0.8 MB | website only |
| `hero-devices.png`, `demo-screens/` | 0.8 MB | website only |
| Old library art (`room.jpg`, `room-wide.jpg`, `original.jpg`, `plate.jpg`, `to-the-lighthouse.jpg`) | about 1.5 MB | replaced by newer images |

Also shipped:

- **Development files:** `library_2/checks/reading-room.test.mjs`, `shelf-study/art-prompt.txt`, READMEs.
- **Danish data:** 92 Danish onboarding files and `frankenstein-modern-da.json`, even though the native catalogue rejects Danish editions.
- **Heavy author images:** 19.5 MB, up to 1.5 MB each (`plato.png` is a 960×1440 RGBA PNG). Converting them to WebP would shrink them several-fold.

### 10. Low — cleanup and hardening

- **Dead selection-toolbar code.** `MainActivity.java:67-71` uses reflection to install an empty selection toolbar, but `setCustomSelectionActionModeCallback` exists only on `TextView` (checked against the SDK stubs). The resulting `NoSuchMethodException` is silently caught, so the code never runs. Impact is small because the reader suppresses native selection in JavaScript. Remove it, or use `onActionModeStarted`.
- **Unneeded mixed content.** `capacitor.config.ts:17` sets `allowMixedContent: true`. The bundle has no plain-HTTP hosts and audio is HTTPS, so the setting is unneeded.
- **Backup is implicit.** `allowBackup="true"` with no `dataExtractionRules`. Sign-in and downloads are correctly in no-backup storage, but WebView storage (reading data) is backed up. Make that an explicit choice.
- **Two API hosts.** The native API uses `tinct.ahvelplund.workers.dev` (`apiUrl.ts:6`), while downloads use `tinct.app`. Turning off workers.dev would break the app; use one origin.
- **Unreadable sign-in file.** If the saved sign-in cannot be decrypted, every read fails until the next sign-in overwrites it. Delete the file and return "not found" instead.
- **Headphone unplug.** Nothing handles `ACTION_AUDIO_BECOMING_NOISY`. Verify on a device that unplugging headphones pauses narration.
- **Bluetooth.** Chromium logs a missing `BLUETOOTH_CONNECT`, so Talk may not use Bluetooth headsets.
- **Notification look.** The notification uses the generic system play icon and has no artwork.
- **Stale comment.** The `RECORD_AUDIO` comment still mentions the Web Speech API.
- **Unused file sharing.** The template FileProvider exposes the external-storage root and is unused.
- **Reader header at phone width.** The emulator screenshots show the title cut to "Fra…" and the chapter chip reduced to an ellipsis at phone width. The 600 px e-ink capture shows "Frankenstein · Letter 3". Check the phone header.

## What is solid

- **Sign-in:**
  - PKCE; the callback must match the exact package, `auth/callback`, the random flow ID and the expiry.
  - Tokens in a URL fragment are rejected.
  - Sign-in state is stored with AES-GCM from the Android Keystore, bound to its key name, in no-backup storage, limited to allowed key names.
  - Sign-out is recorded as a tombstone, so an old WebView copy cannot bring the session back.
- **Downloads:**
  - The manifest hash is checked against the catalogue revision, and every file is checked for size and SHA-256.
  - File paths are limited to the book's own folders.
  - Redirects are refused, and responses are capped at the expected size.
  - A book only goes live once every file has passed.
  - Request interception looks up exact paths only, so there is no path traversal.
- **Narration:**
  - Uses the media-playback foreground service type with its permission, and immutable PendingIntents.
  - The media-session notification is exempt from Android 13's notification permission.
  - The wake lock has a time limit and is released on pause.
  - Every play goes back through `start`, so playback is always in the foreground.
- **Release signing:**
  - Gradle refuses release packaging without the permanent key.
  - The workflow decodes the keystore with `umask 077`, deletes it afterwards, runs `apksigner verify` and publishes SHA-256 sums.
  - The review network config allows plain HTTP only to `127.0.0.1`.
- **Emulator acceptance (all green):**
  - offline library and reader;
  - PAGE_DOWN key turns the page in 209 ms;
  - state survives a force-close;
  - downloads, including rejecting a corrupt transfer and recovering on retry;
  - narration crosses a chapter with the screen off (11 s);
  - lock-screen session, and pause/resume from system media controls.

## Not verified here

- Real Google sign-in (blocked by finding 1).
- Physical e-ink refresh and page keys.
- Battery use, Doze, and background survival beyond 11 s.
- Bluetooth.
- Performance on the target device.

The review APK is also 3 web commits behind `main`.

## Needs your decision

1. **Supabase redirect URLs.** Add the two native callback URLs in the Supabase dashboard (finding 1). Recommended: yes. This is what unblocks Google sign-in and password reset in the app.
2. **Home-screen option.** Keep the Home-launcher option only once the lab settings can turn it on and off; until then, remove it from the manifest (finding 3). Recommended: remove for now.
3. **Stable review key.** Add a stable review signing key as a GitHub secret so review builds update in place (finding 2). Recommended: yes.
