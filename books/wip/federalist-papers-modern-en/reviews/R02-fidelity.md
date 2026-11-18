# R02 fidelity and accessibility review: Federalist Nos. 8, 9, 10, 11, 12

Reviewer: R02. Source: `source-original-en.json`; candidates: `batches/ch08.json` to `ch12.json`.

## Scope
Every paragraph read side by side with its source: No. 8 (15 paragraphs), No. 9 (17), No. 10 (23), No. 11 (15), No. 12 (13). Total 83 of 83. Paragraph counts match the source in each paper. Scripted checks also run: no non-ASCII characters and no "--" in any candidate; all digits/figures in the source present; capitalized emphasis words preserved (only paragraph-initial lead words normalized); ch9 p6-p11 and p16 (Montesquieu quotation and footnote), ch11 p14 and ch12 p12 are byte-identical to the source, as the quotation rule requires. Footnote markers "(1)" are in place (ch8 p4, ch9 p6, ch11 p13, ch12 p10).

## Findings
| id | location | severity | what / why |
|---|---|---|---|
| F1 | ch10 p2 | BLOCKING | Source "There are two methods of curing the mischiefs of faction". Candidate "Faction can be cured in two ways." Drops "the mischiefs of" (STYLE-NOTE: harms) and so says faction itself can be cured, contrary to Madison's argument (causes cannot be removed; p12 "no cure for the mischiefs of faction"). Fix in R02-fixes.json. |
| F2 | ch10 p11 | MINOR | Source "Evidently by one of two only." Candidate "Evidently by only one of two." reads as "one, not both" instead of "one of only two means". Fix supplied. |
| F3 | ch11 p2 | MINOR | After splitting the dash sentence, candidate "Such people can also appreciate the immense difference..." makes "Such people" the three million Americans; source subject is "those who are able to appreciate". Fix supplied. |
| F4 | ch12 p11 | MINOR | Source "it may be enough the subject of conjecture, to occasion the oppression of individuals". Candidate "it may be enough a matter of guesswork to cause" is stilted and hard to parse. Fix supplied. |
| F5 | ch8 p14 | MINOR | "heretofore framed in America" left archaic in Publius's own footnote prose. Fix: "framed in America so far". |
| F6 | ch9 p1 | MINOR | Source "the portraits they have sketched"; candidate "the portraits these writers sketched" supplies an agent with no antecedent. Fix: passive, keeps the openness. |
| F7 | ch10 p19 | NIT | "less to be dreaded in the former than in the latter" rendered "less to be feared in a republic." (comparative term dropped). Fix supplied. |
| F8 | ch10 p5 | NIT | "at liberty to exercise it" -> "free to use it"; loses the word "liberty" that p3-p4 develop. Optional fix supplied. |
| F9 | ch9 p0 | NIT | "we behold them with a mixture of regret, arising from the reflection that" -> "with regret mixed in, because we reflect": awkward. Fix supplied. |
| F10 | ch8 p1 | NIT | "malignant aspect to liberty" -> "threatening aspect toward liberty": slightly softer; no fix. |
| F11 | ch8 p5 | NIT | "adventitious superiority" -> "artificial superiority": sense is acquired/accidental, not manufactured; acceptable, no fix. |
| F12 | ch9 p5 | NIT | "reconciling the advantages of monarchy with those of republicanism" -> "combining": acceptable. |
| F13 | ch9 p13 | NIT | Passive "A distinction ... has been raised" -> "Some have drawn a distinction": agent inferred; acceptable. |
| F14 | ch10 p0 | NIT | "specious declamations" -> "plausible speeches" loses the pejorative; "candid review" -> "honest review" (STYLE-NOTE: fair); "unwarrantable partiality" kept as "unwarranted partiality" (note: bias). No fix. |
| F15 | ch11 p8 | NIT | "more powerful partners" -> "more powerful parties". Acceptable. |
| F16 | ch12 p0 | NIT | "have been sufficiently delineated" -> "We have now said enough about": fine. |
| F17 | ch12 p1 | NIT | "augment that article" (land) -> "increase the thing that is the fruitful parent": vague referent; acceptable in context. |

Checked and clean: all figures (three millions of people, 3/15/20 per cent, four million gallons x 1 shilling = 200,000 pounds, twenty-three Lycian cities with 3/2/1 votes, twenty thousand patrols). No omitted enumerations or dropped qualifiers found beyond the items above.

## No. 10 fixed-term check (as requested)
- Faction definition (p1): word for word identical to the source, in the same structure ("a number of citizens, whether amounting to a majority or a minority of the whole, who are united and actuated by some common impulse of passion, or of interest, adverse to the rights of other citizens, or to the permanent and aggregate interests of the community"). Only change: source misprint "adversed" -> "adverse", matching STYLE-NOTE's own quotation. Verdict: acceptable as a spelling-level fix; listed as an open issue. "Faction" is never rendered "party"/"group"; "factious" -> "factional" in p0, p15, p19, p21.
- Pure democracy (p12): "a pure democracy, by which I mean a society consisting of a small number of citizens who assemble and administer the government in person" is exact (only a comma dropped). "Such democracies" retained.
- Republic (p13): "A republic, by which I mean a government in which the scheme of representation takes place" is exact.
- p14 and p15-p22: democracy/republic never swapped; "republican principle" (p10), "republican remedy ... republican government" (p22) intact. "Pure democracy" kept in p13.
- p19 (+1 republic flagged by lead): source "republican than of democratic government" is rendered "a republic ... than a democracy". No drift: it is the same two terms in noun form (see F7 for the dropped comparative).
- p18 "federal Constitution", "national", "State legislatures" retained (candidate adds "legislature" after "the national" to complete the ellipsis; acceptable).

## Verdicts on the lead's pre-flagged items in my range
- ch10 p19 republic/democracy +1: OK (above).
- ch10 p5 liberty lost: "at liberty to exercise" -> "free to use". Acceptable (idiom, not the abstract term); optional restore (F8).
- ch10 p1 "adversed" -> "adverse": acceptable, structure exact.
- ch9 p15 "civilian" -> "jurist": acceptable (civilian = scholar of civil law; sense preserved).
- ch11 p13 "will will": the candidate silently drops the duplicate ("Disunion will add another victim"). Trivial typo repair; acceptable, listed as open issue.
- ch12 p10 "this State": kept as printed (Publius means New York; adding the name would be an addition). Acceptable.
- ch8 p9 "magistrate" -> "public official": correct per STYLE-NOTE.
- ch12 p6 "Union" gained: source "As far as this would be conducive" refers to "a general Union"; candidate's "Union" names the referent. OK.
- Other flagged items (federal/national counts, energy, emolument, "--" leftovers, vanished emphasis caps) do not occur in Nos. 8-12; federal and national counts in these papers equal the source.

## Open issues (suspected source misprints and silent repairs)
1. ch10 p1 source "adversed" (for "adverse"): rendered "adverse".
2. ch11 p3 source "privileges in the markets of those islands elsewhere" (probably "and elsewhere"): candidate inserts "and elsewhere". Reasonable but it is a repair; flag for the lead.
3. ch11 p13 source "Disunion will will add": duplicate dropped.
4. ch9 p15 source "the most, delicate species": stray comma, dropped.
5. ch10 p20 source "is enjoyed by a large over a small republic,--is enjoyed by the Union": rendered with "and of the Union". Fine.

## Conclusions
- No. 8: no BLOCKING or MINOR defects except the archaic "heretofore" (F5); faithful, complete.
- No. 9: faithful and complete; quotations verbatim; one small referent addition (F6).
- No. 10: one BLOCKING (F1, "mischiefs" dropped, ch10 p2) and one MINOR (F2); definitions of faction, pure democracy and republic exact; democracy/republic terminology consistent throughout.
- No. 11: faithful; one MINOR referent slip from sentence splitting (F3); one source repair to confirm (ch11 p3).
- No. 12: faithful; one MINOR awkward rendering (F4).

Counts: BLOCKING 1, MINOR 5, NIT 11.
