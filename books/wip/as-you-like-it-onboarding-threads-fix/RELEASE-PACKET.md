# Release Packet — As You Like It, threads re-keying and onboarding correction

Status: candidate, awaiting independent review. Not published. Content
dependency relayed from Codex for the already-accepted As You Like It
completeness repair (`books/wip/as-you-like-it-completeness-repair/`,
`books/wip/as-you-like-it-modern-da-repair/`).

## What this fixes

Two items flagged as open in the accepted completeness repair's own
release notes, never previously actioned:

1. **`as-you-like-it-threads.json`** was still keyed by the OLD 17-chapter
   numbering. Every entry needed re-deriving against the accepted 23-chapter
   structure; 5 old chapters (2, 8, 12, 14, 17) were split into two new
   chapters each, requiring an editorial judgment call on which half each
   thread entry's content actually belongs to.
2. **`as-you-like-it.json` / `as-you-like-it.da.json` onboarding**:
   `openingChapterLabel` already (partially, apparently pre-emptively)
   said "Act I, Scene I", but `openingText` still quoted the OLD opening
   (Rosalind and Celia's court dialogue, now chapter 2/"Act 1, Scene 2")
   instead of the real, now-restored Act 1 Scene 1 opening (Orlando and
   Adam, Oliver's orchard). Same defect in both English and Danish
   onboarding.

## Method — threads re-keying

12 of 17 old chapters map 1:1 to a single new chapter (straightforward
key substitution per the correspondence table in
`as-you-like-it-completeness-repair/RELEASE-PACKET.md`). For the 5 split
chapters, each entry was placed by reading the actual scene content at
BOTH new-chapter halves and matching the thread summary's plot content
to the scene it actually describes — not by default/guessing:

| Old ch | Splits into | Placed at | Why |
|---|---|---|---|
| 2 | new 3 (Act 1 Sc 3, still at court) / new 4 (Act 2 Sc 1, Duke Senior's forest) | **3** | Rosalind's/Celia's banishment-and-escape-planning entries describe events that happen at court, before the flight — confirmed new 4 contains Duke Senior's forest scene, unrelated to their planning. |
| 8 | new 10 (Act 2 Sc 7, forest feast, Jaques' "seven ages" speech) / new 11 (Act 3 Sc 1, palace, Duke Frederick/Oliver) | **10** | Orlando's/Jaques'/Touchstone's entries all describe the feast and Jaques' speech; confirmed new 11 (5 paragraphs) is a different plot thread (Duke Frederick ordering Oliver to find Orlando) that doesn't feature any of these 5 characters at all. |
| 12 | new 15 (Act 3 Sc 5, Silvius/Phebe confrontation) / new 16 (Act 4 Sc 1, Rosalind/Orlando wooing scene) | **15** | Rosalind's entry describes the Silvius/Phebe scolding scene directly; confirmed new 16 (84 paragraphs) contains no mention of Silvius or Phebe at all — it's a different scene. |
| 14 | new 18 (Act 4 Sc 3, Oliver brings the bloody cloth, Rosalind faints) / new 19 (Act 5 Sc 1, Touchstone/William) | **18** for Rosalind and Orlando; **19** for Touchstone | Rosalind's and Orlando's old-14 entries (the lion/bloody-cloth/fainting content) match new 18 exactly; confirmed new 18 contains no "William" mention. Touchstone's old-14 entry ("encounters the rustic William... threatens him") is a DIFFERENT scene entirely — confirmed new 19 contains "William" and new 18 doesn't. This is the one entry that does NOT follow the chapter-wide default; it needed its own character-specific placement. |
| 17 | new 22 (Act 5 Sc 4, reunion/mass wedding) / new 23 (Epilogue, 4 paragraphs) | **22** | All four characters' old-17 entries (Rosalind orchestrating the finale, Orlando's marriage, Jaques' withdrawal, Touchstone's wedding/speech) describe content that happens in the Act 5 Scene 4 reunion, confirmed against the chapter text. |

**Gap identified, not silently filled**: after this re-keying, new chapter
23 (Epilogue — Rosalind's direct-address closing speech to the audience)
has ZERO thread coverage from any of the 5 characters' existing entries.
This is a genuine, newly-structural chapter (it didn't exist as its own
chapter before this book's completeness repair — it was previously
merged into old chapter 17) that has no prior thread content to re-key,
because no old-chapter entry ever described it. This package does NOT
invent a new thread entry to fill that gap — doing so would be authoring
new interpretive content, not re-keying existing content, and this
package's brief was placement, not new authorship. **Flagged for Anders/
Codex**: whether a minimal factual epilogue entry for Rosalind (the only
character present) should be authored as a small separate content task.

## Method — onboarding correction

Both `openingChapterLabel` fields corrected to the accurate scene setting
("Act I, Scene I — Oliver's orchard" / "Akt I, Scene I — Frugthave ved
Olivers hus", matching the accepted candidate's own chapter-1 caption
paragraph exactly). Both `openingText` fields replaced with the real
Act 1 Scene 1 opening (Orlando's monologue to Adam), quoted directly from
the accepted `modern-en`/`modern-da` candidates, trimmed to the same
approximate length/shape as the previous (now-corrected) excerpt.

## Candidates

| File | sha256 |
|---|---|
| `threads/as-you-like-it-threads.json` | see below |
| `onboarding/as-you-like-it.json` | see below |
| `onboarding/as-you-like-it.da.json` | see below |

(Hashes computed and recorded in `ACCEPTANCE-RECORD.md` after independent
review, per this project's convention of finalizing hashes alongside the
review verdict.)

## What independent review should check

1. Re-derive the 5 split-chapter placements independently by reading the
   same scene content and confirming the placement table above is
   correct, not just plausible.
2. Confirm all 25 re-keyed entries (5 characters × their respective
   chapter counts) land on valid chapter numbers within 1-23 and that no
   entry was dropped or duplicated in the re-keying.
3. Confirm the onboarding `openingText` in both languages is a faithful,
   correctly-quoted excerpt from the accepted candidates (not a
   paraphrase), and that `openingChapterLabel` matches the actual chapter
   1 caption paragraph.
4. Confirm the Epilogue thread gap is real (not an oversight this
   package should have filled) and that no other new-chapter gap was
   missed elsewhere in the 23-chapter structure.

## Scope note

This package does not touch character cards (`as-you-like-it.v1.json`) —
that was not named in the relayed dependency for this book (only Faust's
character cards were named). If Codex finds As You Like It's character
card also needs re-anchoring against the new structure, that is a
separate, not-yet-scoped content task.
