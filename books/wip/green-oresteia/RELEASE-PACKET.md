# Release Packet — The Oresteia (Aeschylus)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-oresteia/candidate.json`
- **Target live path:** `app/public/data/editions/oresteia-modern-en.json`
- **Accepted sha256:** `8daaaf8606b4e9d24bf6d4e2a759ca4464df42f0d547bf993cb55b91fa36b371`
- **Structure:** 26 chapters, 771 paragraphs, matches `source.json`
  exactly.

## Validation / review evidence

All evidence lives in `books/wip/green-oresteia/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `ACCEPTANCE-RECORD.md` | Full 2-round coverage table, defect list, deliberately-preserved items, final hash, model/settings notes |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

Two rounds. This is a translated Greek trilogy — `source.json` is
itself a public-domain English translation, so fidelity is to that
translation's exact printed wording. Round 1 (Sonnet) verified source
completeness against known missing-content risks (this batch had just
hit that problem twice), fixed 13 defects (12 genuinely-obscure archaic
words from the source translation's own diction, modernized for
accessibility, plus one meaning-narrowing mistranslation: "rapine"
rendered "rape," inconsistent with a correctly-rendered sibling
occurrence), and self-certified clean with two inaccurate claims (a
miscounted chapter-1 paragraph total; "zero archaic terms remain").
Round 2 (independent Opus adversarial verification) rebuilt every
sweep from source rather than reusing round 1's lists, read all 771
paragraph pairs word-for-word end to end, confirmed all 13 fixes, and
found 3 more narrow defects: a one-character-typo meaning inversion
("Cureless" rendered "curseless," inverting an "incurable" curse into
"without a curse" in a speech about the house's compounding curse), a
missed sibling of round 1's own "weird" fix (2 occurrences, 1 fixed by
round 1), and a dropped bracket pair around an interjected cry (source's
own punctuation convention, preserved at 3 other locations). All three
narrow/mechanical, fixed directly with reasoning documented. The
"erasure of source's own printed forms" class that hard-parked 3
Shakespeare plays this batch was specifically tested for and found
absent; the trilogy's extremely dark content (Thyestean cannibalism,
the Iphigenia sacrifice, the murder scene, the Furies' threats, Apollo's
mutilation catalogue) was verified intact at full force; the choric
odes' elevated formal register was confirmed preserved, not flattened.

## Relationship to currently-live text

A paragraph-level diff against the current live `oresteia-modern-en.json`
shows the accepted text differs in 16 of 771 paragraphs (13 round-1 +
3 round-2 fixes).

## Audio invalidation

No English audio currently exists for `oresteia`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`: ~22
period/archaic words retained from the source translation's own
diction, inconsistently modernized in places (fane, laver, lustral,
glaive, kine, etc.) — logged explicitly as an accessibility-polish item
for a future pass rather than fixed now, since none produces a false
reading and several sit in the text's deliberate ritual/sacrificial
register. One obscure adynaton (ch5 ¶22, "Be steel deep-dyed") left as
a close paraphrase rather than re-rendered, to avoid making an already-
difficult line worse.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
