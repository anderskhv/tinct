# Whole-library preface release — 9 September 2026

All 100 current published canonical book IDs now have their exact supplied English preface. Added 94 text files; the six earlier approved texts remain byte-identical. No prose was generated or edited. The six prior texts are user-approved, Notes from Underground retains the accepted second comparison, and the other 93 retain their agent-reviewed batch provenance. This content release changes no reader, character, navigation or position behavior.

Every imported body matches both its source file and manifest SHA256. The registry coverage regression checks all 100 IDs and hashes; unknown/noncanonical aliases remain unsupported. Only body text enters the application; research and review metadata remain documentation. Existing static preface loading/preview behavior is unchanged.

## Verification

- 148 test files / 1,597 tests passed; build and verify-bundle passed.
- Local and production WebKit 390×844, WebKit 360×640 with large dark text, and Chromium 1440×950: Oedipus Rex (shortest new text), Notes from Underground (longest), and Democracy in America passed fresh cover, full preface, Begin, resumed cover, Continue, Back and reload checks: nine configurations each. Screenshots inspected.
- Production Chrome/WebKit saved-position and Compare checks passed for Odyssey and Democracy in America, with unchanged stored progress, Back, reload and subsequent Awakening book handoff.
- Real production Odyssey audiobook was playing before opening the preface. Its audio source, paused clock and exact reader position were preserved on Continue. No model call or real account writes were made in verification.
- Production /lab/phone opened and captured; new prefaces use the actual /reader feature.
- All 15 production smoke tests passed. Live bundle bytes match the deployed build exactly.

Shipped from clean content commit `c7b89865` through Node 24 `CI=1 npm run deploy` (existing CI public-client configuration fallback). Direct deployment succeeded; no GitHub Actions run was used.

Worker version: `7ab37d06-88af-4ff7-927e-b064962b8de1`.
Bundle: `assets/index-BTgxhhj7.js`.
SHA256: `a37be26f8aa7e3c7ae2aa85fd138d0c8ee27eeabe5048438478465b30c15f5a9`.

Artifacts: `/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-library-prefaces/` (production, edges-production, audio-production, local, bundle.json and lab-phone screenshot).

The representative browser checks do not claim that all 100 prefaces were individually visually reviewed or newly editorially approved. Character cards remain a separate implementation.
