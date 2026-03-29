// Public R2 bucket — hardcoded because it's not a secret and must be available
// in all build environments (local dev, Cloudflare Pages, CI).
// The /audio fallback caused the play button to vanish whenever the env var was missing.
export const AUDIO_BASE_URL = import.meta.env.VITE_AUDIO_BASE_URL || 'https://pub-c34df89c93284423a39b03537595c2e2.r2.dev'
