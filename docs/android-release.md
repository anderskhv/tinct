# Android APK release

Tinct uses the shared library and reader inside its Capacitor Android app. E-ink is an explicit display preference shared across the library, reader and account pages. The base contains the Bible and Frankenstein, five reader fonts, dictionaries, cover artwork and existing annotation recovery assets. Other published books download when opened.

Downloaded books are hash checked and activated atomically. Already installed text remains pinned; adding a book or edition never clears private reading records. APK review builds use `app.tinct.reader.review`, separately from the production package `app.tinct.reader`.

## Signing and delivery

The **Android APK acceptance** workflow builds an installable review APK and runs isolated emulator acceptance. The review key is temporary; this artifact is not a permanent update channel. Do not uninstall an older app to resolve a signing mismatch.

The **Signed Android APK** workflow runs manually on main after the PR checks and native acceptance pass. It uses the existing permanent app signing key from these GitHub Actions secrets:

- `TINCT_ANDROID_KEYSTORE_BASE64`
- `TINCT_ANDROID_STORE_PASSWORD`
- `TINCT_ANDROID_KEY_ALIAS`
- `TINCT_ANDROID_KEY_PASSWORD`

The keystore is decoded only into the runner's temporary directory with restricted permissions and removed after signing. It is never included in uploaded artifacts. The workflow verifies the APK signature and publishes the APK plus SHA-256 checksum. Gradle refuses release packaging when permanent signing configuration is missing; it never substitutes the review key.

Before the first permanent release, confirm whether an existing distributed app/key must be preserved. Retain the permanent keystore in secure owner-controlled backup, independently of GitHub. A later APK must use the compatible package/signing identity and a higher version code to update an existing installation.

## Authentication configuration

Follow [Android sign-in return](android-auth-return-2026-09-29.md). The public redirect-configuration probe cancels before Google sign-in and checks the returned destination without accessing an account. It is not a real-provider sign-in test.

## Acceptance limits

The emulator uses synthetic narration and isolated account services. It does not generate paid narration, modify a real account or prove physical e-ink refresh, battery usage, Bluetooth behavior or long-duration Android background survival. Record those results separately; do not label an emulator screenshot as a physical reader test.

References: [Android app signing](https://developer.android.com/studio/publish/app-signing), [Android command-line builds](https://developer.android.com/build/building-cmdline).
