# R12 fidelity and accessibility review: Nos. 62-66

Scope: ch62 (18 paragraphs), ch63 (20), ch64 (15), ch65 (11), ch66 (14). 78 paragraphs, all read side by side against `source-original-en.json`. Paragraph counts match 1:1 in every chapter. Automated checks run on all 78: no curly quotes, no "--", no ellipses; all footnote markers kept (ch66 p2 "(1)", p13 "1."); all digits and figures unchanged; no "magistrate" (except ch66 p11, below), "emolument" or "judicial review" added.

Note: the brief says `package/...`; files are actually directly under the folder, no `package/` level.

## Findings

| id | where | sev | what / why |
|---|---|---|---|
| F1 | ch64 p3 | BLOCKING | Conditional turned into assertion. Source: "If the observation be well founded, that wise kings will always be served by able ministers, it is fair to argue, that as an assembly of select electors possess...". Candidate: "It is well founded to say that wise kings will always be served by able ministers. It is fair to argue, then, that...". The premise is now asserted, not hypothesized. |
| F2 | ch62 p17 | MINOR | Source "that diminution of attachment and reverence" and "flattering hopes". Candidate "the loss of attachment" overstates (diminution is partial) and drops "flattering". |
| F3 | ch63 p4 | MINOR | Source "answer for places or improvements which could not be accomplished in less than half a dozen years". Candidate "answer for improvements" drops "places". |
| F4 | ch63 p11 | MINOR | Emphasis caps moved: source "annually ELECTED BY THE PEOPLE AT LARGE" / "annually ELECTED BY THE PEOPLE"; candidate "ELECTED ANNUALLY BY ..." caps ANNUALLY, which the source does not. |
| F5 | ch63 p12 | MINOR | Same as F4 (two places: "WHOLE BODY OF THE PEOPLE" and "ELECTED BY THE PEOPLE"). |
| F6 | ch65 p10 | MINOR | Source "his more CONCEITED NEIGHBOR"; candidate "CONCEITED neighbor". NEIGHBOR must stay capitalized (pre-flagged). |
| F7 | ch66 p11 | MINOR | "the Chief Magistrate of the Union" (the President) left as printed; STYLE-NOTE requires "chief executive". Fix gives "the Chief Executive of the Union" (capitalized to follow the source's capitalized title). |
| F8 | ch63 p10 | NIT | "officers whom the people elected, who REPRESENTED the people" is clumsy, and REPRESENTING became REPRESENTED. Restored to the source structure. |
| F9 | ch62 p13 | NIT | "nations have fewer benevolent feelings ... and so are under fewer restraints" adds a causal "so"; source has parallel "also". |
| F10 | ch66 p3 | NIT | "least inconvenience" keeps archaic sense; style table says drawback. |

Unflagged minor observations, no fix needed: ch63 p6 two rhetorical questions became exclamations ("how salutary will be" and "What bitter anguish ... might have escaped"), assertion unchanged. ch64 p9 adds "they say" (clarifying attribution to the objectors, no new claim). ch64 p4 drops "necessarily" in "must necessarily be inadequate". ch65 p1 "pre-existing factions" -> "existing". ch65 p9 "adopted only with caution" adds "only". ch62 p3 "The only option" -> "choice", fine.

## Verdicts on pre-flagged items in range

- ch62 p4 "sovereign lost": source "sovereignty ... residuary sovereignty"; candidate "share of sovereignty ... preserving that share". The idea is kept, the term appears once and the second is a pronominal "share". Accepted.
- ch63 p9 "republic +1": source "the American and other republics"; candidate "the American republic and other republics". Fine; both are republican governments, no democracy/republic swap. Accepted.
- ch63 p10 REPRESENTING vanished: the emphasis survives as REPRESENTED (and "democracies" stays "democracies", EXECUTIVE kept). Accepted, with F8 as optional restoration.
- ch63 p11 "first of four, and afterwards of six hundred": kept as printed. Accepted (source possible dropped "hundred", not touched).
- ch63 p16 "federal +1": source 5 "federal" uses; candidate 6 because "against the latter" became "do not apply to the federal one". Meaning identical. Accepted.
- ch64 p3 "genius" -> "talent" ("brilliant appearances of genius and patriotism" -> "brilliant displays of talent and patriotism"): genius here is individual brilliance, not the "genius of a government"; "talent" is acceptable. Accepted (the real defect in p3 is F1).
- ch64 p7 "heretofore" -> "in the past": good.
- ch65 p7 "perpetual ostracism" -> "perpetual banishment": acceptable (figurative "from the esteem and confidence ... of his country"; "emoluments" -> "pay" per table). No fix. Note "ostracism" would also be fine.
- ch65 p7 "emoluments": rendered "pay", correct.
- ch66 p11 "Chief Magistrate of the Union kept": rejected, see F7.
- ch65 p0-ch66 judicial/magistrate terms elsewhere: no other "magistrate"; no "judicial review" label.

## Open issues (suspected source misprints)

- ch64 p5: source "There are a few who will not admit that the affairs of trade and navigation should be regulated by a system...". Probably "There are few who will not admit" (the surrounding sentence, "they who assent ... will see", requires it). Candidate renders "Few will deny", i.e. the probable intended sense, silently. Literal source reading would be "A few will not admit". Lead to decide; no fix issued because "few will deny" is the evident sense and the difference is small.
- ch63 p11: "first of four, and afterwards of six hundred" probably lacks "hundred" after "four"; candidate keeps it as printed. OK.

## Conclusions

- No. 62: faithful, accessible; one MINOR (F2) and one NIT (F9).
- No. 63: faithful; MINOR emphasis-caps and "places" issues (F3-F5), one NIT (F8).
- No. 64: one BLOCKING (F1, conditional made assertion); otherwise faithful.
- No. 65: faithful; one MINOR (F6, NEIGHBOR caps).
- No. 66: faithful; one MINOR (F7, chief magistrate) and one NIT (F10).
