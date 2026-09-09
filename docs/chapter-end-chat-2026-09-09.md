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

Pending final deployment confirmation.
