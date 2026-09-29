# Android sign-in return

The native shell uses Supabase PKCE and opens OAuth through Capacitor Browser. App URL events and cold-start URLs are checked against the exact package, callback path, pending random flow and expiry before exchanging the code. Tokens are never passed through the app URL or logged. The completed session returns through the existing sign-in identity reconciliation before reopening the reader. Email confirmation and password recovery use the same handler. Website redirects are unchanged.

Required Supabase redirect allowlist entries (configuration has not been changed):

- `app.tinct.reader://auth/callback?flow=*`
- `app.tinct.reader.review://auth/callback?flow=*`

The review package has its own Android scheme. These entries must be enabled in Supabase before real OAuth/email returns can pass; no service-role writes or auth-configuration changes are performed by this PR. Test the real configured provider, cancellation/retry, cold launch, email confirmation, password recovery and resuming the original book before claiming end-to-end authentication acceptance.

Mocked tests cover code exchange, wrong-package/wrong-flow/expired callbacks, duplicate callbacks, warm/cold launch handlers, error redaction and unchanged website behavior. No real provider account is used by these tests.

References: [Capacitor App](https://capacitorjs.com/docs/apis/app), [Capacitor Browser](https://capacitorjs.com/docs/apis/browser), [Supabase mobile deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking), [Supabase PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow).
