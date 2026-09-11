# Continuity sheet — Macbeth, Act 1 Scene 1 (candidate v1, frozen)

Written alongside drafting `candidate-v1.json`. Term renderings follow
`../GLOSSARY.md`; this sheet records paragraph-level decisions specific to
this scene and the two known source anomalies from `../PROVENANCE.md`.

## Source

- `source-ch01.json`, chapter `number: 1`, title "Act 1, Scene 1 — A Desert
  Place", `section: "Act I"`, 12 paragraphs. Extracted verbatim from
  `app/public/data/editions/macbeth-original-en.json` (sha256 in
  `provenance.json`).
- The whole scene was read in full before any paragraph was drafted: three
  Witches, ten lines of exchange bracketed by two stage directions. It is
  the play's cold open — riddle, not exposition — and sets the "fair is
  foul" inversion that runs through the whole play.
- Known source anomaly (see `../PROVENANCE.md` §3): the served scene title
  is "A Desert Place," where PG #1533/#100 (the identified textual source)
  print "An open Place." The candidate keeps the served title verbatim, per
  this task's scope (draft against the served original as served).

## Paragraph-level decisions

| ID | Source | Candidate | Decision |
|---|---|---|---|
| B01-P001 | `[Thunder and Lightning. Enter three Witches.]` | (unchanged) | Stage direction, copied verbatim. |
| B01-P002 | "When shall we three meet again? In thunder, lightning, or in rain?" | "When will we three meet again? In thunder, lightning, or in rain?" | Only "shall" → "will" modernised; the line is otherwise already plain English and is not paraphrased further (`GLOSSARY.md`, famous/plain lines kept close). |
| B01-P003 | "When the hurlyburly's done, When the battle's lost and won." | "When the uproar is over, when the battle is lost and won." | "hurlyburly" → "uproar," new glossary row. Rhyme with "won" is not reproducible in prose and is not attempted — the JSON holds no verse lineation to rhyme within (`WORKFLOW.md`). |
| B01-P004 | "That will be ere the set of sun." | "That will be before the sun sets." | "ere" modernised; image (sunset) unchanged. |
| B01-P005 | "Where the place?" | "Where shall we meet?" | Elliptical archaic question ("Where the place?" omits a verb) expanded to a complete, natural modern question; no content added beyond what "the place" implies (a meeting place), matching the reply "Upon the heath." |
| B01-P006 | "Upon the heath." | "On the heath." | "Upon" → "on"; no other change. |
| B01-P007 | "There to meet with Macbeth." | "There, to meet Macbeth." | "meet with" → "meet" (current idiom); "Macbeth" unchanged. |
| B01-P008 | "I come, Graymalkin!" | "I'm coming, Graymalkin!" | Tense modernised; "Graymalkin" (the familiar's name) unchanged. |
| B01-P009 | "Paddock calls." | "Paddock is calling." | Tense modernised; "Paddock" unchanged. |
| B01-P010 | "Anon." | "Coming." | New glossary row: "Anon" now reads as archaic or is misread as "anonymous"; "Coming" is the plain one-word equivalent, matching the brevity of the exchange. |
| B01-P011 | "Fair is foul, and foul is fair: Hover through the fog and filthy air." | "Fair is foul, and foul is fair: hover through the fog and filthy air." | The play's thesis-couplet, already plain modern English; kept essentially verbatim (only the sentence-internal capital after the colon lowercased for normal prose punctuation) rather than paraphrased into something duller. Not flattened, per `WORKFLOW.md`. |
| B01-P012 | `[Exeunt.]` | (unchanged) | Stage direction, copied verbatim. |

## Word ratio

Chapter ratio 89/87 = 1.023. Every paragraph checked individually in
`../PROVENANCE.md` §5; the lowest (B01-P007, 0.857) is a five-word source
line rendered in four words ("There to meet with Macbeth." → "There, to meet
Macbeth.") — "with" is a function word carrying no content of its own once
"meet" takes its modern intransitive-to-transitive form; nothing is lost.

## Open, not blocking

- The "A Desert Place" vs. "An open Place" heading discrepancy is a
  play-wide, not scene-specific, matter — see `../PROVENANCE.md` §3 and
  "Needs Anders" in `../00-progress-ledger.md`. Not resolved here; the
  candidate keeps the served title.
