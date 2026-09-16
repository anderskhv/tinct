# Before you begin — cover-background revision

Status: local design revision requested by Anders on September 16; review pending. This does not change the locked Explain design or authorize deployment from this worktree.

## Requested changes implemented

- Keep the existing full-screen cover. The Before you begin subtitle is now “Read the preface. Meet the characters. Ask or talk.”
- Preparation uses that same cover as its background, behind a warm, almost-opaque paper panel. It no longer displays a second miniature cover or repeats the book title.
- Back/forward arrows replace the long navigation labels. Accessible labels preserve Back to cover and Start/Continue reading semantics.
- Heading: Preface. Use the existing full-preface reading font and size. The collapsed view clamps the actual first paragraph to three rendered lines; expanding reveals the same text once, followed by the remaining paragraphs. Never render the separate preview summary above it.
- Characters is a collapsed heading with an expand control. Expanded view contains brief identities, with no later-event biography.
- Bottom companion bar pairs the existing Chat and Talk icons in the rounded translucent control style. These navigate to distinct modes, so they are buttons, not literal radio inputs.
- Chat opens the existing composer, with three question pills above it: what to notice at the beginning, the main characters, and finding an interesting angle. A pill fills an unsent editable draft. Submitting or closing clears the preparation-suggestion state.
- Talk uses the existing handleTalk path, with no new voice interface. No microphone/voice session was started during this task.

## Character content boundary

The Histories has no chapter-one entries in the existing chapter-filtered cast, explaining the empty section in the supplied screenshot. Its reviewed character package exists at app/public/data/characters/the-histories.v1.json, but the snapshots begin later and contain future events. The local draft uses four brief identity-only introductions condensed from that package: Croesus (Lydian king known for wealth), Cyrus (founder of the Persian Empire), Xerxes (Persian king, son of Darius), Themistocles (Athenian statesman). These are explicitly local editorial samples, not a new universal spoiler-safe gallery mechanism. Before production, approve a book-entry identity layer; do not remove snapshot cutoffs or expose whole late-book cards. Other books retain their supplied cast and an honest empty state.

## Source and scope

Latest screenshot-matching source found in /private/tmp/tinct-reader-feedback-20260916, commit 93cee51b. This revision is isolated at /private/tmp/tinct-before-begin-design-0916 on codex/before-begin-design-0916. The Explain worktree and active reader owner's source were left intact.

No navigation/persistence writer changed. Shared TalkIcon was moved into LabReaderIcons and reused. Preparation delegates Back/Read/Chat/Talk to the existing callbacks. The development-only beforeBeginDraft query loads The Histories through the existing reader handoff and blocks model endpoints; no API keys or production model changes.

## Review and checks

Preview: http://127.0.0.1:5201/reader?beforeBeginDraft=1 (desktop); /lab/phone?chrome=v2&beforeBeginDraft=1 (phone). Click Before you begin.

Browser script: app/scripts/check-before-begin-design.cjs. Fresh muted headless Chromium at 1440×950 and touch WebKit at 390×844 checked actual cover/preparation/full preface/characters/Chat/question draft. Checks assert exactly three rendered lines, no repeated opening, optional character expansion and no generation requests. Voice routing is exercised through its component callback test, not a live microphone.

43 focused tests pass across LabBookPreface, LabChapterCover and LabAskPane. Build and verify-bundle pass. Screenshots and checks.json: output/before-begin-design-2026-09-16/. Browser emulation is not physical-device verification. This remains local-only and has not been sent as a locked design or released.

## Second review — unified menu and expandable people

Anders requests consistent expansion and one menu containing the companion actions. Preface now expands/collapses through +/− on its heading, matching Characters; the separate Read full preface link is removed. Each character name also has its own +/− control, revealing the brief identity and, for this Histories sample, an additional short orientation paragraph. These paragraphs retain the local editorial-sample status above and avoid future plot outcomes.

Customize your introduction is a third section inside the same panel, with the existing Chat/Talk buttons directly beneath its heading. The detached bottom companion bar is removed. Chat still opens the real composer with unsent question suggestions; Talk retains the existing callback. This is a design revision for review, not another locked or deployed release.

## Third review — introduction and editions

- Label is now **Design your own introduction**, with Chat and Talk inside the same menu.
- Panel opacity reduced from 96% to 88% so the cover remains visible.
- Final row is **Select your editions**, using the same plus/minus disclosure pattern.
- Local Histories entry defaults to `modern-en` (displayed here as Tinct Modern English AI) and `original-en` (Macaulay, 1890). Macaulay is the only human translation registered for this book; this prototype does not introduce a catalog-wide accessibility ranking.
- Selectors use the existing `updatePrefs` path, with audio edition synchronization and the existing chapter-preserving edition reload. Selecting the current secondary as primary swaps the pair. Secondary can also be None. Compare is available without switching the active reading view.
- Defaults are scoped to the explicit development preview entry, not a reset of existing reader preferences elsewhere.
- Checked phone WebKit and desktop Chromium: defaults, pair changes, disclosures, three-line preface, individual character expansion, and draft-only Chat suggestions. No model requests made. 44 focused component tests pass. Local-only, review pending.

## Fourth review — Apple-inspired menu material

Menu-only CSS treatment: warm graduated frosting, 30px outer corners, illuminated rim, layered soft shadow, circular translucent arrow controls, glass Chat/Talk capsule, quieter separators and pressed states. Contents and callbacks remain the same. Strong blur works in Chromium; WebKit receives a denser tint because the tested native dialog does not visually blur its sibling image despite reporting backdrop-filter support. Reduced transparency and motion preferences have fallbacks. Phone WebKit and desktop Chromium interaction checks pass; 44 focused tests pass. Local preview only.

## Fifth review — preface control alignment

Moved the Preface disclosure into a dedicated right-hand column, centred on the three-line introduction (measured within 0.01px in mobile Chromium). Expanded state keeps the collapse control near the opening. Reduced menu tint opacity by a further 4–5 percentage points. Phone/desktop browser checks, 44 focused tests, build and bundle verification pass (`index-B-jogE3V.js`).

## Sixth review — clearer glass and shaded controls

Reduced panel opacity another 7–13 percentage points. Chat and Talk now have individual gently shaded rounded surfaces within their shared capsule. Both arrow buttons use the same warm shading, highlighted top edge, soft drop shadow and inset pressed feedback. Existing text, alignment and actions preserved. Phone WebKit and desktop Chromium checks plus 44 focused tests pass; build/bundle verification passes (`index-DX9a3Oks.js`). Local only.

## Seventh review — ungrouped button surfaces

Removed the outer Chat/Talk capsule border, fill and shadow. Individual shaded buttons remain together within the menu, with a 10px gap. Captured mobile (390×844 WebKit) and desktop (1440×950 Chromium) examples. Browser interaction checks and 44 focused tests pass. Local only.

## Eighth review — desktop space and stronger frosting

Restored stronger panel opacity (70–82%; denser WebKit tint). At widths of 1000px and above, the menu uses a capped 1120px two-column layout: up to ten lines from the first two preface paragraphs left; Characters open with short identities and expandable details right. Chat/Talk and editions occupy the corresponding lower columns. Mobile retains the three-line preface and collapsed character section. Resizing updates the responsive presentation. 44 component tests and build/bundle verification pass (`index-DI3Xlqox.js`). Browser checks account for the paragraph gap in the longer preview. Local only, desktop proposal for review.
