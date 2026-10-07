/**
 * The AI allowance switch (Anders, 2026-10-05). The one place to turn the
 * allowance on: set this to true, run the tests, merge.
 *
 * Off (today): nothing is gated, nothing extra is read, the usage bar is not
 * shown, /terms answers 404 and is neither linked nor in the sitemap, and
 * pricing copy keeps its current wording.
 * On: the Worker gates paid AI features at zero (worker/lib/aiAllowance.ts),
 * the account sheet shows the usage bar, /terms is served, linked from /about
 * and /privacy and listed in the sitemap, and pricing copy describes the
 * allowance.
 *
 * Shared by the Worker, the reader bundle and the build scripts
 * (scripts/ai-allowance-switch.cjs reads this line), so all three always
 * agree. Keep it a plain `true` or `false` literal.
 */
export const AI_ALLOWANCE_ENFORCED = false
