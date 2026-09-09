# Chapter-end Chat — 9 September 2026

Implementation of the [approved brief](design/chapter-end-chat-handoff-2026-09-09.md) and its illustrative mockup against the current production LabApp reader. Release verification is recorded below.

## Behavior and boundaries

The final passage offers “Discuss this chapter” and “Prepare for next”. They open the existing Chat and submit only “Recap this chapter.” or “Prepare me for the next chapter.” The book header, composer, dictation Stop control, voice control and Back to book behavior are retained. No action runs merely because the controls appear. Final chapters offer discussion only.

The click captures the current book, edition, chapter, paragraph and chapter source. Preparation resolves the successor from the actual chapter list and loads that exact chapter in the selected reading edition. It fails with Try again if the source is unavailable. It never navigates, changes playback speed, or emits a completion write. Existing audio interruption handles opening Chat.

Immutable action identity is optional metadata in the existing book-scoped chat JSON. It survives local/cloud history parsing and is supplied privately on later text/voice requests, so an old “next chapter” is not rebound to the currently open chapter. Visible messages do not contain internal instructions or source payloads. Preparation receives no personalized conversation history. Discussion may use the existing available conversation history; this does not add durable memory.

Typed requests retain their captured book and chapter across asynchronous work. A response arriving under a different open book is discarded. The hook and persistence writer reject mismatched book IDs; the existing voice session's literal `lab` identity retains its established normalization. Duplicate taps share the existing pending-request guard. Retry retains the original tuple and user message without adding another user turn. Account and balance gates remain in force.

## Pagination choice

Controls sit after source text, outside the measured source tree and audio/highlight anchors. The established mobile and desktop page maps remain unchanged. A full final page may scroll vertically to reveal the actions; this does not create a separate empty/action page or split source text. On that overflowing terminal page, vertical touch movement scrolls the content; Compare remains accessible through the existing menu. The normal forward page gesture/button remains available. This narrow terminal-page exception avoids changing the stable source pagination for every chapter.

## Preparation review

These are **authored expected examples**, reviewed against the repository's actual edition text. They are not outputs from a production model evaluation. Browser tests intercept Chat with authored fixture replies; no Anthropic API was called during development. The same reusable instruction is used for every chapter; there are no per-chapter prompts, numeric verse cutoffs, or reader-profile assumptions.

### Jeremiah 35, King James edition, after Jeremiah 34

> Jeremiah 35 opens during the reign of Jehoiakim. Jeremiah is told to bring the Rechabites into a room in the Jerusalem Temple and offer them wine. The chapter begins with that meeting.

Grounding: `app/public/data/editions-chapters/bible-kjv-en/ch0780.json`, opening paragraph; previous chapter is `ch0779.json`. The actual registry successor is chapter 780. The conservative example omits chronology beyond the explicitly supplied reign. It does not reveal the refusal, the family's explanation, Jeremiah's comparison or the final pronouncement. The approved fuller chronology example remains a valid target when that context is verified.

### Jane Eyre, Chapter 26, original English, after Chapter 25

> It is the morning of Jane and Rochester's wedding. Sophie is helping Jane dress, and Rochester is impatient to leave. Jane narrates the preparations and their journey to the church.

Grounding: `app/public/data/editions-chapters/jane-eyre-original-en/ch0026.json`. The opening concerns wedding preparations and arrival at church. Omit the objection, Rochester's existing marriage, Bertha's identity and the subsequent attic scene. Even a vague warning that a secret will disrupt the wedding would preview the revelation and is excluded. There is no need for a character gallery or advice about names.

### The Republic, Book 2, original English, after Book 1

> The discussion continues with Glaucon, who is not satisfied that Socrates has shown justice to be better than injustice. He asks whether justice is valuable in itself, for its consequences, or both. That distinction frames the opening exchange.

Grounding: `app/public/data/editions/the-republic-original-en.json`, Book 2's opening exchange. This is an argument, so orientation explains the immediate question rather than inventing a scene or moral. Omit the ring example, the later city-building argument and eventual conclusions. No personalization is needed.

The instruction supplies the actual next text, asks for opening setup rather than outcome or eventual significance, and explicitly excludes later revelations. Long sources respect the existing system cap and carry an explicit instruction to retrieve missing text when needed. Semantic spoiler judgment remains model-dependent; deterministic tests verify identity, source transport and prompt boundaries, not universal output quality.

## Verification and deployment

Shipped from clean commit `09435135` on `codex/reader-stabilization-20260908`. The unrelated main-checkout work was preserved.

- Full suite: **146 files / 1,582 tests passed**. Focused coverage includes source/display separation, actual nonconsecutive successor, final-chapter UI, duplicate taps, missing source and retry, account-gated replay, balance errors, command suppression, history restoration and wrong-book writes.
- `npm run build` and `npm run verify-bundle` passed, then the approved `npm run deploy` repeated both gates and succeeded using Node 24. This was a direct npm deployment; there is no GitHub Actions run for this release.
- Live tinct.app: WebKit 390×844 phone, WebKit 360×640 phone with 1.8 font preference, and Chrome 1440×950 desktop. Both actions, actual Jeremiah 34→35 source identity, short visible requests, intact composer controls, existing history, exact source-word/place return, reload and ordinary next-chapter navigation passed.
- Live mobile and desktop Compare: discussion uses the active mobile comparison edition or desktop primary edition, as intended. Final Revelation 22 offers Discuss only. Actual audiobook playback pauses when Chat opens; returning uses the existing resume behavior and retains the chapter.
- `/lab/phone` entry also opened and was captured. The new feature is on the current V2 `/reader`, as specified by the brief; the legacy phone lab entry is not redesigned.
- Existing mobile audio/Compare regression: full Jeremiah 43–44 word coverage, stable forward/back pages, footer clearance, Compare restoration, audio browsing/resize/return all passed locally. Existing desktop regression passed full Democracy in America Read/Compare coverage and alignment, cold-font first-paint stability, refreshes, audio controls and cover containment.
- **15/15 production smoke checks passed**. Live HTML references `index-CK0sHDd_.js`; downloaded bytes match the deployed build exactly.

Worker version: `b4c15b14-f723-4162-83c4-dc0cdc8bafd5`.
Bundle SHA256: `b9e9a36b4c6a5525f6d21602e3f0541abefaefbc9d8a41d92622e42d2716feb3`.

Walkthrough screenshots, request/state results and verification logs:
`/Users/andershvelplund/.codex/visualizations/2026/09/09/tinct-chapter-chat/`

Repeat with `app/scripts/check-chapter-chat.cjs` and `check-chapter-chat-edges.cjs`, using `TEST_ORIGIN=https://tinct.app` and an `ARTIFACT_DIR`. They use isolated browser contexts, actual book data and intercepted Chat responses; no real user account is written and no model call is made. Physical iPhone testing and live model-output evaluation were not performed.

A separate pre-existing content issue was observed during the final-chapter fixture: the Bible WEB edition's Revelation 22 includes Project Gutenberg license material in its last paragraph. Final-chapter playback checks therefore use the clean KJV text, and WEB Compare is checked in Jeremiah 34. This release does not alter edition content. That content cleanup remains separate from this feature.

## Approved panel revision — September 9

Anders approved mobile and desktop wireframes replacing the detached heading and
emoji-arrow buttons with one integrated panel. The heading now reads “End of
chapter” in muted italic EB Garamond. “Continue to next chapter” comes first with
a warm fill and the reader's monochrome chevron; discussion and preparation are
quieter rows. Both next-chapter actions are absent on the final chapter.

Continue calls the existing forward-navigation path, including registry successor
lookup, chapter completion and start landing; it neither opens Chat nor calls a
model. Busy Chat never disables Continue. Existing discussion/preparation request
identity and persistence are unchanged. The desktop terminal scroller now ends
above the fixed page numbers; its content measurement area is preserved by an
equal padding adjustment. Source pagination and audio anchors are unchanged.

Verification before shipping: 146 test files / 1,586 tests passed; build and
verify-bundle passed. Local WebKit phone and small phone with large text, plus
Chromium desktop, passed discussion, preparation, return/reload position and
Continue to the actual next chapter at 0:0 without a Chat call. Production
verification will be appended after deployment.
