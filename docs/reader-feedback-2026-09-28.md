# Reader feedback fixes, September 28, 2026

## Report and causes

The eight supplied screenshots cover Proverbs 20 and Zechariah 7 pagination,
Bible chat location and retrieval, a punctuation-joined definition, and the
contrast between an Ezra 8 primer and a more useful follow-up.

- BSB poetic lines were justified as independent prose paragraphs. The measured
  paginator could split a short verse pair or leave a one-word sentence opener.
- Bible history shares the registry book id. Ordinary historical turns lacked
  chapter context even though the request's live chapter was correct.
- Search scanned at most 24 nearby chapter shards. A four-round model tool loop
  could not reliably read seven chapters one at a time. Long excerpts had no
  direct continuation. Contradictory instructions also treated spoiler policy
  as an inability to know the rest of the book.
- Whitespace/audio tokens such as `Sherebiah—a` were used as dictionary headwords.
- Primer instructions named things to notice without consistently asking why
  an easily missed detail matters.

## Changes

Poetic Bible lines are left aligned, with short verse groups kept together when
an empty measured page can hold them. Sentence openers of one or two words move
forward to the next page. Source text, audio token counts and saved locations
remain unchanged.

Each typed question carries its current location; earlier-chapter messages have
historical location metadata only in the model payload. Reliable general knowledge
is available directly, not only after a failed lookup. Retrieval supplements
familiar summaries and explanations when precision or uncertainty calls for it.
Missing excerpts alone are not treated as uncertainty. Retrieval accepts ranges
of up to 14 chapters, with paragraph and character continuations. Whole-edition
search takes one static asset request rather than hundreds of shard requests,
checks chapter labels against the manifest, and reports fallback coverage
honestly. Existing request/subrequest and model-round budgets remain in place.

Dictionary lookup resolves the lexical word under the pointer inside a token.
Temporary lookup highlighting excludes adjoining punctuation; saved highlight
coordinates still use the original source words. The AI definition footer is
removed. Primers and recaps prioritize a consequential detail and its meaning,
while distinguishing interpretation and respecting unsolicited-spoiler limits.

## Verification

- Full Vitest suite: 2,845 passed, one skipped.
- Production build and bundle verification passed with CI public configuration.
- Silent isolated Chromium phone checks use real BSB chapters and a mocked
  definition response: poetic alignment, complete verse pair, correct lookup
  headword, exact lexical highlight and removed footer.
- Range retrieval, distant name search, continuation, source-word coverage and
  Ezra-to-Zechariah request identity have regressions.
- `app/scripts/check-reader-feedback.mjs` runs in PR verification and production
  deployment. Screenshots and results are uploaded with reader acceptance.
- No Anthropic development calls were made, as required by AGENTS.md. Generated
  primer/recap quality is therefore not claimed as a live-provider acceptance.

Local visual evidence: `app/artifacts/reader-feedback-20260928/`.
Release status is recorded in the PR and GitHub Actions deployment.
