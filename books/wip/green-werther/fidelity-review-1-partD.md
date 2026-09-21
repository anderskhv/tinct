# Fidelity Review — The Sorrows of Young Werther (modern-en) — Round 1, Part D (final)

**Chapters covered:** 62–84 ("September 5, 1772" through "The Editor to
the Reader" — the close of Book Two and the full editorial narrative,
including the embedded Ossian recitation and Werther's suicide letters).

## Method / Coverage statement

Every paragraph in chapters 62–84 read individually and in full, source
against candidate, in original order, including all 122 paragraphs of
Ch. 84 (the editorial narrative) and the full embedded Ossian poem
(candidate paragraphs 458–481 in the whole-book numbering used in the
accessibility review). None sampled or skimmed. This completes full,
non-sampled, paragraph-by-paragraph coverage of the entire 84-chapter,
354-paragraph book across Parts A–D.

## Findings

### Ch. 84, para 87 — unlicensed content addition (BLOCKING)

- **Source (candidate paragraph 487 in the whole-book numbering; this is
  the letter Werther writes on the morning of his death, about the
  flowers Charlotte once sent him):** "...but those impressions grew
  fainter, and were at length effaced."
- **Candidate:** "...But ah, those impressions passed, as the feeling of
  his God's grace slowly fades from the heart of the believer, given to
  him in full heavenly fullness through holy and visible signs."
- **What's wrong:** The source sentence in `source.json` ends plainly
  ("grew fainter, and were at length effaced"). The candidate replaces
  that ending with an entirely new simile — impressions fading "as the
  feeling of ... God's grace slowly fades from the heart of the
  believer, given to him in full heavenly fullness through holy and
  visible signs" — introducing religious/sacramental imagery (grace,
  "holy and visible signs," i.e. an implicit Eucharist reference) that
  is simply not present in the locked source paragraph at all. This is
  a textbook case of the protocol's "Additions" check: "is there any
  claim, image, or detail in the candidate that is not licensed by the
  source." It is worth noting for the record that this simile **does**
  appear in the actual, fuller original-German Goethe text and in some
  more complete English translations (the Eucharist-grace comparison is
  a well-known line from this passage of the novel) — so this reads like
  the drafter (consciously or not) importing detail from a different,
  more complete translation or from the German original rather than
  working only from the locked `source.json` anchor. Per
  `TRANSLATION_PROTOCOL.md`: "Anchor to one identified source edition.
  Never import remembered detail from another translation." Whatever the
  cause, the candidate paragraph now says something the anchor text does
  not say.
- **Severity: BLOCKING** per the protocol's own definition (an addition
  not licensed by the source), even though the added content is
  arguably "more faithful to Goethe" than the specific English
  translation this project locked as its anchor. This is exactly the
  kind of case the protocol is written to catch — a well-intentioned
  addition is still an addition against the declared anchor.
- **Recommended fix:** The merge owner should decide, and document the
  decision in the acceptance record, between two options: (a) trim the
  clause back to match the anchor exactly ("...but those impressions
  passed, and were at length effaced," or similar minimal modernization
  with no added simile), or (b) explicitly ratify the richer wording as
  a deliberate, disclosed departure from `source.json` on the grounds
  that it restores authorial content missing from this particular public
  domain translation — the same kind of judgment call this program has
  made explicitly before (e.g. the Candide and Descartes' Meditations
  entries in `GREEN-LIBRARY-TRACKER.md` both note similar anchor-fidelity
  edge cases and ratify them in the open rather than silently). Either
  is defensible; leaving it undocumented is not.

No other defects — blocking or non-blocking — were found in this range.
Specific checks against the task brief's Werther-specific concerns:

- **Emotional register arc.** The editorial narrative (Ch. 84) is
  rendered in a visibly cooler, more procedural register than the
  letters — "We grant that Albert often left his wife's room..." / "A
  vein was opened in his arm, for good measure" — while Werther's own
  embedded letters within that same chapter (Dec. 12, 15, 20, and the
  final suicide letters) keep his full effusive, exclamation-heavy,
  self-interrupting voice. The candidate does not flatten this
  register shift; if anything it sharpens it (e.g. the added "for good
  measure" gives the autopsy-adjacent sentence a clinical flatness the
  source's plainer "A vein was opened in his right arm" already had, but
  the candidate leans into it slightly more, which supports rather than
  undermines the intended contrast).
- **Werther's self-deception/rationalization preserved, not corrected.**
  The suicide letters keep every one of Werther's specious moves intact:
  declaring the act "certainty" rather than "despair" ("It isn't despair
  — it's certainty that I've carried it through"), casting his death as
  a sacrifice "for" Charlotte and Albert's happiness, and the "Sin? Good
  — and I punish myself for it; I've tasted it in its whole heavenly
  bliss, this sin" passage (Ch. 84, para 89) — a self-serving inversion
  where he treats the "punishment" as itself a pleasure. None of this
  is smoothed into cleaner logic; the candidate's phrasing is if
  anything more legible as self-justification than the source's, simply
  because the sentences are shorter and the moves are easier to follow.
- **Charlotte and Albert's more restrained voices stay distinct from
  Werther's.** Charlotte's dialogue throughout Ch. 84 (the Christmas Eve
  confrontation, "Werther, you can, you must see us again — only govern
  yourself") stays measured and complete-sentenced against Werther's
  fragments and dashes in the same scene. Albert's two lines in this
  range ("Give him the pistols" / "I wish him a good journey") are kept
  exactly as flat and short as the source gives them — the candidate
  does not add warmth, hesitation, or explanation to Albert's line, which
  matters: the source's chilling flatness there is the point, and it
  survives.
- **Ossian recitation.** Checked line by line against the source's own
  (already archaic-register) Ossian text. The candidate modernizes
  vocabulary and syntax ("Rear the tomb" → "Dig the grave"; "Whither are
  ye gone to rest?" → "Where have you gone to rest?") while preserving
  every image, every repeated invocation, and the poem's own internal
  logic (Colma's monologue, the Armin/Daura/Arindal tragedy) in the same
  order with no additions or omissions. This is a real modernization,
  not a left-archaic island — it satisfies the protocol's requirement
  that quoted/embedded verse be modernized like everything else, while
  still reading as a distinct, more elevated register within the story
  (see the accessibility review for the reader-experience note on this).
- **Currency/detail changes elsewhere in this range.** None found beyond
  the two already logged in Parts A and C.

## Whole-book fidelity summary (all 84 chapters, 354 paragraphs)

**Coverage:** Every paragraph of the book — Preface, all 82 dated
letters, and the full 122-paragraph editorial narrative — was read
individually, in full, in original order, source against candidate, with
neighboring context always in view (each chapter was read contiguously,
so every packet's surrounding paragraphs were part of the same read).
Nothing was sampled or skimmed.

**Defects found across the whole book:**

- **1 blocking defect:** Ch. 84, para 87 — an unlicensed content addition
  (the "God's grace" / "holy and visible signs" simile) not present in
  the locked source anchor. See above for full detail and recommended
  fix options.
- **3 non-blocking notes:**
  - Ch. 23, para 1 — minor invented garment detail + a currency-word
    substitution ("crowns" → "thalers"), no meaning change.
  - Ch. 48, para 1 — a blanked-name placeholder letter changed (no
    factual content) plus one title substitution ("Chancellor" → "court
    councillor").
  - Ch. 64, final para — one added short clause ("She trusts me so!")
    that doesn't add new information beyond what the next sentence
    already states, found during the read-through recorded in this
    file's working notes (see candidate paragraph 334 in the
    whole-book numbering; source: "And why not? Because she knows how
    much I love her." → candidate: "And why not? — She trusts me so!
    She knows how I love her!").

**No instances found of:** actor/subject swaps, dropped or inverted
negations, causality reversals, altered conditions/scope, dropped
clauses/examples/numbers, silent "corrections" of names or facts to
historical standard, or unmodernized archaic-island quotations (the one
extended embedded quotation — Ossian — is deliberately and consistently
modernized while preserving its distinct register, as detailed above).

**Overall verdict: ACCEPT WITH FIXES REQUIRED.**

One blocking fix is needed: resolve Ch. 84 para 87 (either trim to the
source's plainer ending or explicitly ratify the richer wording as a
disclosed, deliberate departure from the anchor, per the two options
above). The three non-blocking notes may be left as-is or cleaned up at
the merge owner's discretion; none affect meaning, actor, causality, or
the book's emotional/psychological arc.

This review did **not** include the protocol's Step C (a second,
whole-chapter re-read specifically hunting for cross-boundary/recurring-
image issues) or Step D (apply fixes to the live candidate file, verify,
and pin an acceptance hash) — those were explicitly out of scope for this
task and remain to be done before Werther can be marked "Text accepted"
in `GREEN-LIBRARY-TRACKER.md`.
