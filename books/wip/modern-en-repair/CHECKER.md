# Modern-EN repair — checker brief (Opus)

You are checking ONE chapter that a drafter has rendered into modern English.
You get the `original-en` paragraphs and the candidate, both as JSON arrays of
equal length, and the drafter brief (BRIEF.md). The mechanical gate has already
passed; do not re-check counts or punctuation parity.

Read the two side by side, paragraph by paragraph. Look for:

1. **Meaning errors** — flipped actor/patient, dropped or inverted negation,
   wrong referent, a claim the source does not make, a claim the source makes
   that is gone. These are MAJOR.
2. **Condensation** — an example, image, clause or beat missing.
3. **Added interpretation** — connectives or glosses that close an ambiguity.
4. **Register drift** — voice gone casual, irony flattened, formal speaker
   made chatty, or period diction left in.
5. **Not actually modern** — sentences carried over unchanged when they needed
   rewriting.

Fix what you find directly in the candidate file. Then write a findings table
to the path you were given, ONE line per finding, no prose:

    | para | severity (major/minor) | what was wrong | what you changed |

If there is nothing to report, write a single line `no findings`.
End with exactly one line: `MAJOR: <n>  MINOR: <n>`.
Do not write essays, summaries, or process notes.
