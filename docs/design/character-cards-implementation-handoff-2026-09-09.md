# Character cards: implementation handoff

**2026-09-09 — approved interaction and prepared content pilot.** Anders asked to proceed with preparing the handoff and a complete *The Awakening* pilot here before app implementation. This document supersedes exploratory interaction/role suggestions in the earlier Dante, Awakening and War and Peace notes. No app implementation or deployment is claimed by this handoff.

## Reader experience

Long-press an unmarked character name to open a compact reminder. No underline, colored text, icon, first-use hint or tutorial. Use the existing selection gesture. A recognized name opens the character card in place of the initial dictionary definition, with dictionary lookup and existing selection/highlight actions still accessible. Ordinary words retain their current behavior. Existing highlights and deliberate multi-character or multi-paragraph selections retain editing/selection behavior.

The card shows the released display name, a small role label when safe, a short identifying subtitle, and one short reminder. Recognition comes first: “the pianist…” or “the young man staying at the cottages…”, with relationships explained rather than chains of unfamiliar names. No plot analysis, future outcomes, lists of search hits, or advice telling readers that someone is safe to ignore.

Roles: **Central figure / Major figure / Supporting figure / Mentioned in passing**. Roles are editorial whole-book judgments, not a count of mentions or importance in the current scene. Hide a role when it would reveal future importance. Use the entity kind to present cultural references naturally. Do not label historical or philosophical people as fictional characters.

Provide “Character gallery” from the card. Gallery uses the same frozen passage cutoff and distinguishes people in the current passage from others introduced by that point. Do not show future names, aliases, plot-changing relationships, whole-book totals or unreleased role ordering. Family/group entries must not create misleading person counts. A permanent main-menu entry was suggested elsewhere but has not been approved; do not expand navigation scope as part of the pilot.

## Pilot input

[Content documentation](../../books/characters/README.md), [pilot and limitations](../../books/characters/the-awakening/README.md), [editorial reading copy](../../books/characters/the-awakening/cards.md), [compiled asset](../../books/characters/the-awakening/characters.v1.json), [lookup contract](../../books/characters/lookup_reference.py), [regression tests](../../books/characters/test_characters.py).

The pilot spans all 39 chapters: 86 editorial entries and 263 authored descriptions. Original and modern English bindings are separate. Modern English has 85 entries because one original reference is omitted. This is an authored first pass, not independent editorial approval. Review counts/fingerprints in the generated report. Current [library inventory](../../books/characters/library-coverage.md) contains every published book and explicitly records the remaining 99 as not started.

## Implementation path

1. Add a typed, lazy-loaded character sidecar and a pure resolver. Stage only the reviewed pilot initially. Check book ID, edition ID, schema/normalization version and source fingerprint. Fail closed to normal selection when unsupported, stale or ambiguous. Do not ship the authoring worksheets as reader UI.
2. Insert recognition before the existing dictionary request. In `app/src/components/Reader.tsx`, `openSelectionPopup` currently calls `defaultPopupMode` and may immediately call `beginDefine`. The selection already carries paragraph index, offsets and segments. Use those anchors; do not infer identity from the selected string alone.
3. Extend the existing popup with character display and gallery access. `app/src/components/SelectionPopup.tsx` owns popup modes and positioning; `reader/selectionPopupMode.ts` decides default behavior. Keep highlight-edit precedence. Reuse mobile placement/accessibility patterns.
4. Review `SplitReader.tsx` separately: Compare has its own selection path and both mobile reader views remain mounted. Only the active same-book/edition view may open a card. Do not assume changing Reader covers Compare.
5. Add the filtered gallery using released snapshot fields only. Freeze the initiating location; dismiss or invalidate on book/edition/chapter changes. Opening a card or gallery must not navigate, seek audio, change page totals, write progress or lose selection/reading position.

At inspection, Reader uses a 320 ms mobile long-press threshold with custom selection and Android/Boox selection-change fallback. Preserve that path; do not install a competing recognizer. Prose paragraph normalization replaces newlines and repeated ASCII spaces. Compiled offsets use UTF-16, matching JavaScript. No inline wrappers are required; avoid markup that changes pagination or text geometry. Recheck these paths in the actual implementation checkout because unrelated reader work may have advanced.

## Spoiler boundary

For a name selection, the conservative cutoff is the end of the resolved mention in the active paragraph. Choose the newest snapshot available at or before that point. A later snapshot at paragraph end is not available merely because its paragraph is visible. For gallery entry through that card, inherit its cutoff. Never use chapter-end knowledge, maximum historical progress, another edition’s offsets, or a cloud-synced “furthest read” value. Returning to an earlier passage restores earlier reminders. Describe the boundary as “at this passage”; navigation does not prove the reader has read every preceding word.

First-encounter cards supply minimal editorial identification without later actions or outcomes. Full reminders update at selected paragraph ends, not every mention. Story-role visibility has its own boundary. Aliases are lookup data, not a list automatically exposed in the card. Source evidence is an editorial review aid; mechanical gates cannot prove prose is spoiler-free.

Resolve only explicit spans. A single name token inside a full-name span can resolve that person. Prefer the narrowest containing reviewed span; exact relationship selections may resolve a different person than their nested name. If the selection crosses unrelated spans, is ambiguous, or belongs to an existing highlight, preserve normal controls. Never silently guess from a surname or substring.

Validate the complete edition fingerprint at load time and paragraph hashes before matching. Unsupported data must leave selection functional. A late asset response must not replace a popup after dismissal or after the reader switches context. Load outside the reader’s critical render path; no live LLM call is necessary per tap. Existing Threads summaries and mention snippets are not spoiler-safe replacements.

## Acceptance checks for the coding agent

- Unmarked names; no tutorial/hint; ordinary tap behavior unchanged; long press resolves full names and a token within them.
- Edna vs Léonce, boys’ grandmother vs Mrs. Pontellier, Ratignolle and Highcamp family members resolve correctly; nested relationship selections have explicit tests.
- First occurrence, immediately before/at update boundaries, hidden Arobin role, earlier-passage return and unseen gallery entries are tested in both English editions.
- A changed paragraph/source fingerprint, missing asset, unsupported edition, ambiguous phrase and slow response all preserve usable ordinary selection.
- Existing highlight editing, dictionary alternative, multiword selection, screen-reader/keyboard access and dismissal work.
- Read and Compare remain at the same position with unchanged pagination; no stale inactive-view popup; audio keeps its position; book/edition switch cannot reveal another book’s card.
- Review early, middle and late pilot cards in the actual mobile UI. Do not treat passing automated tests as independent factual or spoiler review.

Run the content checks documented in books/characters/README.md, focused app regressions, then the repository’s normal tests/build/verify-bundle/deploy/production checks for app work. Use an isolated reconciled checkout; the current shared checkout contains unrelated changes. This preparation task changes no application code and requires no deployment.

## Library rollout

Prove the full interaction with the pilot before mass authoring. For each published book, read its actual edition, inventory names, classify roles independently of frequency, author first encounters and meaningful reminder changes, resolve aliases, and review spoiler boundaries. Reuse descriptions only after verifying edition alignment. Track coverage and known omissions explicitly. Scripture, histories, philosophy, poetry and plays need appropriate entity categories and normalization; do not force the novel model onto them. Keep obscure figures eligible for short cards. Do not invoke development content-generation APIs or the legacy edition generator.

Next owner action: coding agent implements the pilot from this handoff. Remaining-library content authoring follows the validated contract; no claim that those books have been prepared yet.

## Implementation follow-through — September 9

The app pilot is now implemented in an isolated release checkout. Current status,
verification and release evidence are maintained in
[the pilot release report](../character-cards-release-2026-09-09.md). The content
preparation statements above describe the original handoff, not the later release.
