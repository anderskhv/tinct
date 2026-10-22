# R16 fidelity and accessibility review: Nos. 83, 84, 85

Scope: ch83 (39 paragraphs), ch84 (28), ch85 (18). Total 85 paragraphs, all read side by side against `source-original-en.json`. Paragraph counts match source in all three chapters (39/28/18). Programmatic checks run on top of the read: term counts (Union, liberty, federal, national, republic, faction, magistrate, emolument, energy, sovereign, genius, several), lost emphasis capitals, curly quotes and "--", 75% word-count floor, verbatim comparison of every quotation of 25+ characters. Results: no curly quotes or "--"; no paragraph under 75%; every legal, Blackstone, Hume-style and constitutional quotation (ch84 p3, p4, p6, p7, p10, p15; ch85 p0, p12, p14) matches the source word for word. No "judicial review" label, no "emolument" in own prose (ch84 p3 has it only inside the quoted Constitution, correct).

## Findings

| id | where | sev | what / why |
|---|---|---|---|
| R16-01 | ch83 p17 | BLOCKING | Source "more or at least as much might have been hazarded by taking the system of any one State for a standard, as by omitting a provision". Candidate "as much, or at least as much, might have been risked" drops "more" (comparative claim weakened, phrase self-duplicating). Fixed in fixes.json. |
| R16-02 | ch83 p32 | MINOR | Source "They have tended to show that ...; that even in far the greatest proportion ...; that it is in no case abolished(3) ...". Candidate: "They have shown that" twice. Hedge "tended to show" raised to "shown". Fixed. |
| R16-03 | ch83 p34 | MINOR | "the general GENIUS of a government" left as GENIUS; STYLE table says character/spirit. Replaced by CHARACTER (capitals kept). |
| R16-04 | ch83 p35 | MINOR | Source "sounds not a little harsh and extraordinary"; candidate "sounds harsh and extraordinary" drops the intensifier. Fixed: "more than a little harsh". |
| R16-05 | ch84 p22 | MINOR | "Congress has made requisitions" without the gloss STYLE-NOTE requires where the sentence needs it. Added "or formal requests for money". |
| R16-06 | ch84 p26 | MINOR | Footnote 3. Source is corrupt: "the extent must depend on legislative discretion, respecting the liberty of the press, will give it no greater security". Candidate invents "and declarations" and "their extent" to repair it. Render as the source stands (fixes.json) and treat as open issue. Also source order "nowhere enjoys greater liberty" restored. |
| R16-07 | ch85 p4 | MINOR | Source "whether ... the proposed Constitution has not been satisfactorily vindicated ...; and whether it has not been shown to be worthy". Candidate makes two neutral questions, losing the leading negative. Fixed, single sentence kept. |
| R16-08 | ch85 p9 | MINOR | "obtain subsequent than previous amendments" became "later amendments ... than earlier ones", which reads as later vs earlier amendments, not after vs before adoption. Fixed: "amendments ... after it is adopted than before". |
| R16-09 | ch85 p2 | NIT | Candidate adds "First ... Sixth" to a semicolon list that the source does not number. Harmless and aids reading, but not in source; no fix proposed. |
| R16-10 | ch83 p9 | NIT | "popular magistrates" -> "popular public officials" is awkward but follows the table. |
| R16-11 | ch83 p20 | NIT | "There would of course be always danger" -> "There would therefore always be a danger": connective changed. |
| R16-12 | ch83 p23 | NIT | "not only fail to bring ... . It would also tend" splits a "not only ... but also" across sentences; clear enough. |
| R16-13 | ch85 p7 | NIT | "precarious state" -> "uncertain state" slightly weaker. |
| R16-14 | ch85 p12 | NIT | "at any rate" -> "at all" (THIRTEEN STATES); marginal shift. |
| R16-15 | ch83 p32 | NIT | Footnote marker "(3)" moved from after "abolished" to after "it" in "abolishes it(3)"; same sentence, harmless. |
| R16-16 | ch83 p25 | NIT | Quotation gains a comma ("either of them, request it"); punctuation only, accepted. |

## Verdicts on pre-flagged items in my range

- ch83 p4 liberty lost (2 -> 1): "at liberty either to adopt" -> "free either to adopt" is the non-political sense; "at full liberty" kept. Fine, no change.
- ch83 p18 "heretofore": the word is Hamilton's quoted/mentioned term ("Trial by jury shall be as heretofore"; "the term heretofore could relate"). It must stay as printed. Candidate is correct; no modernization wanted. Lead's note ("left in Hamilton's own gloss: modernize") does not apply: it is a word cited from the Pennsylvania minority's proposal.
- ch84 p24 and p27 "Vide" -> "See": acceptable. ch84 p25 "Idem" -> "The same work": acceptable.
- ch84 p26 footnote 3 corrupt source: confirmed invented "and declarations"; fix supplied (R16-06). Open issue below.
- ch85 p12 "the Union lost": the only difference is lowercase "a union on points" -> "uniting"; no Union reference lost. Fine.
- Emphasis caps in my range: all kept (ch83 p18 OBJECT, p34 GENIUS->CHARACTER, p37 SPECIAL; ch84 p4 TITLES OF NOBILITY, BULWARK, p7 MAGNA CHARTA, WE, THE PEOPLE, p11 A BILL OF RIGHTS; ch85 p12 THIRTEEN STATES, p14 EXPERIENCE, TIME, FEELING, PRODIGY, POWERFUL INDIVIDUALS, A NATION / NATIONAL GOVERNMENT, p16 TEN).
- magistrate: ch83 p8 "magistrate" -> "public official" (deed before a magistrate; per table), p9 "popular magistrates" -> "popular public officials", p14 "standing body of magistrates" -> "standing body of judges" (correct: judges are meant). Fine.
- Fixed terms: federal (ch83 p4, p6, p15, p18, ch84 p17, p19), national, Union, republican, "the individual States" for "several" all consistent. No term drift found. No federal/national/democracy/republic changes in my range.

## Open issues (suspected source defects, keep as served)

1. ch84 p26 (footnote 3): the clause "must depend on legislative discretion, respecting the liberty of the press, will give it no greater security than it will have without them" is syntactically broken in the source (words dropped between "discretion," and "respecting"; "them" has no antecedent).
2. ch83 p16: "plurality of chancellors" and ch84 p20 "if any thing" are fine; no other misprints found.

## Conclusions per paper

- No. 83: all 39 paragraphs checked; one BLOCKING (p17 dropped "more"), three MINOR (p32, p34, p35). Otherwise faithful and readable.
- No. 84: all 28 checked; two MINOR (p22 gloss, p26 invented repair). All quotations verbatim, footnotes 1-4 markers and prefixes intact.
- No. 85: all 18 checked; two MINOR (p4, p9). Article V quote and Hume quote verbatim, capitals and footnote markers intact.
