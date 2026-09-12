#!/usr/bin/env python3
"""Apply the round-1 independent-review corrections to Book X.

Reads book10/candidate-v1.json (frozen), applies the substitutions in CHANGES
(each must match exactly once in its paragraph), writes candidate-v2.json,
candidate-v2-readable.md and changes-v1-to-v2.md, and prints a per-paragraph
word diff so every changed passage can be verified against source-book10.json.
Same pattern as scripts/build_book9_v2.py.

The bracket arithmetic that finding C1 found wrong is asserted here rather than
written out in prose only: the folds are enumerated one by one and the totals
must reconcile with the source's own bracket count, so the numeral cannot drift
away from the list again.
"""
import json, os, hashlib, difflib, re

HERE = os.path.dirname(os.path.abspath(__file__))
B10 = os.path.join(HERE, '..', 'book10')
N = 38

# (paragraph number, finding id, old text, new text) — applied in order
CHANGES = [
 (15, '15.1', 'as in a state, a political community.',
               'as in a state.'),
 (21, '21.1', 'that "this or that loves—is wont—to be produced?"',
               'that "this or that loves"—is wont—"to be produced?"'),
 (32, '32.1', 'You, only determine to live no longer unless you are such.',
               'Only determine to live no longer unless you are such.'),
 (33, '33.1', 'which, as to this material, our life, can be done or said',
               'which, as to this material—our life—can be done or said'),
 (36, '36.1', 'that there shall not be by him when he is dying',
               'that there shall not be beside him when he is dying'),
 (36, '36.2', 'at least some one to say to himself',
               'at least someone to say to himself'),
]

# The four dagger clauses (0-based index, clause in source, clause in v2)
DAGGERS = [
 (8,  'those holy principles of thine.', 'those holy principles of yours.'),
 (18, 'when they are imperious and arrogant', 'when they are imperious and arrogant'),
 (24, 'who is grieved or angry or afraid, is dissatisfied',
      'who is grieved or angry or afraid, is discontented'),
 (30, 'Satyron the Socratic, think of either', 'Satyron the Socratic, think of either'),
]

# --- the bracket arithmetic, asserted rather than asserted-in-prose (C1) -----
# Every fold in the book, one entry per bracket, spot-checked by the words it
# folded in. Fourteen after finding 15.1 is applied; fifteen before it.
FOLDS = [
 (5,  'a concourse of',              'X.6 "[a concourse of]"'),
 (5,  'is a system',                 'X.6 "[is a system]"'),
 (6,  'as an efficient power',       'X.7 "[as an efficient power]"'),
 (6,  'has received the accretion',  'X.7 "[the accretion]"'),
 (6,  'this which your mother brought forth', 'X.7 "[which thy mother brought forth]"'),
 (6,  'particular quality of change','X.7 "[of change]"'),
 (7,  'laudable',                    'X.8 "[laudable]"'),
 (10, 'this part of philosophy',     'X.11 "[of philosophy]"'),
 (12, 'a good god within—happiness', 'X.13 "[happiness]"'),
 (14, 'to live thus, as men do',     'X.15 "[as men do]"'),
 (20, 'is wont',                     'X.21 "[is wont]"'),
 (30, 'for your activity',           'X.31 "[for thy activity]"'),
 (31, 'does reason allow you to live','X.32 "[thee to live]"'),
 (32, 'our life',                    'X.33 "[our life]"'),
]
D11_DROPS = [
 (1,  '[social]',                'social',             'X.2 "[social]"'),
 (14, '[political community]',   'political community','X.15 "[political community]" (finding 15.1)'),
 (32, 'law [order]',             'order',              'X.33 "[order]"'),
]
NOTE_DROPS = [
 (22, 'omitted in the translation', 'translation',
      'X.23 "[The three last words are omitted in the translation.]" (D13)'),
]

APPLIED = (
 '## The six minor findings — all applied\n\n'
 'The round-1 verdict was *Accept after corrections* with **0 substantive** findings, and the reviewer calls '
 'Book X "the cleanest book in the package so far as prose", with every difference between Long and the '
 'candidate accounted for by a documented decision. All six minor findings are applied. Two of them change no '
 'word of the text at all (1.1 and C1 are record corrections) and one adds a decision row to the ledger (23.1); '
 'three change the text (15.1, 21.1, 32.1).\n\n'
 '**21.1 — applied, the reviewer\'s repair taken as proposed.** X.21\'s fold of Long\'s "[is wont]" is '
 '**confirmed** by the reviewer — the meditation *is* the double sense of one Greek verb, so dropping the gloss '
 'would delete the observation rather than remove a note about Long\'s choices — but v1\'s execution put the '
 'gloss **inside the quotation marks**: `that "this or that loves—is wont—to be produced?"`. Long\'s '
 'square brackets were the universally understood signal "not part of the quoted text"; em dashes are not, so '
 'removing the brackets removed the signal and the candidate credited common speech with words common speech '
 'does not use — which is the one thing the meditation cannot afford, since its whole point is that the saying '
 'is exactly what people say and the second sense is supplied from outside it. v2 reads\n\n'
 '> And is not this too said that "this or that loves"—is wont—"to be produced?"\n\n'
 'Every word, Long\'s order, his quotation marks and his question mark where he puts it; the gloss now stands '
 'outside the quotation, where his brackets stood. The reviewer\'s alternative — leave the wording and record '
 'why the dashes sit inside — was rejected: a record cannot restore a typographic signal to a reader who never '
 'reads the record, and the reviewer prefers the repair.\n\n'
 '**32.1 — applied; the reviewer rules against the drafter and the ruling is right.** v1 had '
 '"**You, only determine** to live no longer unless you are such", borrowing the vocative comma from the repair '
 'the Book IX round-1 review made at IX.40. The reviewer separates the two passages and the distinction holds: '
 'at IX.40 the fronted pronoun does rhetorical work, because the passage is an *alternation* ("One man prays '
 'thus: … You, pray thus: …") and the comma preserves a contrast that would otherwise vanish. **X.32 '
 'has no contrast at all.** The fronted "You," therefore carries nothing, and a bare vocative "You," before an '
 'imperative reads as a summons to a stranger rather than as self-address, which is the one register Anders\'s '
 'brief rules out. Worse, "You, only determine…" can be read for a beat as "only *you* determine…", '
 'the reverse of the sense. v2 reads **"Only determine to live no longer unless you are such."** — a true '
 'imperative, unambiguous in mood, self-addressed like every other imperative in the edition, with Long\'s '
 '"only" exactly where he has it. The self-address is not lost: no imperative in this edition carries an overt '
 'pronoun, and the sentences on either side ("this is altogether in your power", "if you are not such") hold the '
 'second person firmly. The reviewer\'s alternative "Do only determine…" was weighed and declined with the '
 'reviewer, who likes it less: "Do only determine" reads as a concession ("do at least"), a shade off Long\'s '
 'force. **The IX.40 repair is not thereby narrowed for other books; it is localised**, and the line now on '
 'record is that the vocative comma is licensed where a fronted pronoun carries a contrast and not merely where '
 'a "do + thou" imperative needs modernising.\n\n'
 '**15.1 — applied, and the D11 line is now drawn the same way in both places.** v1 folded X.15\'s '
 '"[political community]" as an apposition on "a state" while dropping X.2\'s "[social]" under D11, and the '
 'reviewer names this "the one place where I think the D11 line is drawn inconsistently". It is. The two are '
 'the same shape: a second English rendering of one Greek word beside the primary rendering Long has already '
 'given. The operative test the drafter itself stated — *does the meditation\'s point survive the drop?* '
 '— answers the same way in both: X.15\'s point is that the world is the community one lives in, so that '
 'place is indifferent, and it survives entire in "if he lives everywhere in the world as in a state." Nor does '
 'the X.33 "[order]" consideration save the fold: Long uses neither "state" nor "political community" again in '
 'the section, so no folded gloss would dangle and none is needed. **Dropped under D11**, listed with X.2 and '
 'X.33. Deciding the two the same way is the point of the finding; deciding them differently in silence was the '
 'defect. The consequence for the counts is carried through every file: **fourteen folds, three D11 drops, one '
 'translator\'s note, eighteen brackets.**\n\n'
 '**23.1 — applied: the ledger gains D13.** The drop of X.23\'s "[The three last words are omitted in the '
 'translation.]" is **upheld** — it is Long in his own voice telling his reader what he did with Plato\'s '
 'Greek, the same species as a cross-reference or a footnote, and folding it would have Marcus say that three '
 'words are omitted from a translation he did not write. But the reviewer is right that the package had no rule '
 'for it: D11 covers bracketed *alternative renderings* and the glossary\'s bracket rule covers *supplements* '
 '(folded), *cross-references* and *verse citations* (dropped). A translator\'s note about the translator\'s own '
 'practice is a **third kind**, and a drafter of Books XI–XII reading D11 literally would have had no rule '
 'and would naturally have folded it. **D13 is added to `../00-progress-ledger.md`**, worded to generalise '
 'beyond this one bracket — the test is *whose voice the bracket is in and what it is about* — and '
 'with the X.21 limit written into it, so that a bracket which is also the only place in the English where a '
 'sense of Marcus\'s own exists is still folded. `continuity.md`\'s X.23 entry now cites **D13**, not D11.\n\n'
 '**C1 — applied, and the arithmetic is now asserted by the build so it cannot drift again.** Four files and '
 'the `README.md` check block\'s own comment said **sixteen** folds. Sixteen folds + two D11 drops + one '
 'translator\'s note is nineteen, one more than the eighteen brackets the same sentences assert and the '
 'mechanical check verifies. **The true v1 count was fifteen**, as the reviewer recounted from the source; the '
 '*list* in `continuity.md` was right all along and only the numeral above it was wrong, and the check block '
 'was labelled "the sixteen folds" while spot-checking thirteen of them, which is how the error survived a '
 'draft, a freeze and a self-check. **With finding 15.1 applied the v2 count is fourteen**, with three D11 '
 'drops and one translator\'s note — the reviewer\'s own arithmetic for that case. Corrected in '
 '`continuity.md` (both places), `README.md` (prose and check-block comment), `review-instructions.md` (with a '
 'dated note, so the round-1 brief is not silently rewritten), `provenance.json` (`supplements_folded`) and '
 '`../00-progress-ledger.md`. `scripts/build_book10_v2.py` and the `README.md` check block now **enumerate '
 'every fold individually and assert that folds + D11 drops + translator\'s note equals the source\'s own '
 'bracket count**, so a numeral that disagrees with the list is a build failure rather than a reading error.\n\n'
 '**1.1 — applied as a record correction; no word changes.** X.1\'s wording stands: the reviewer agrees the '
 'comma after "Will you" is rightly removed ("Will you, then, my soul," would give four comma-separated '
 'fragments before the verb). But it was **the only punctuation change in Book X that `continuity.md` did not '
 'list**, in a sheet that lists every other one exhaustively, so a later collator would find a change with no '
 'record. The X.1 entry now records it and the tally is corrected to **five removed** (X.1, X.6, X.20, X.33 '
 '×2), one raised to a semicolon, two added.'
)

OPTIONAL = (
 '## The five optional findings — three applied, two recorded and left\n\n'
 '**9.1 — left, and now recorded.** X.9 keeps Long\'s "gravity" in "when will you enjoy simplicity, when '
 'gravity". The reviewer raises it only so the decision is on the record and says plainly it would not change '
 'it, and that is the right disposition: the dominant modern sense of "gravity" is the physical one and the '
 'word can read for a beat as the wrong noun, but Marcus uses it as a **virtue-name** standing in a list of '
 'virtue-names, and the list\'s own parallelism ("when simplicity, when gravity") recovers the sense within two '
 'words. The alternatives are worse in the two available directions: "seriousness" flattens a name into a '
 'description, and "weight" imports a reading Long does not give. The word is current English in this sense, it '
 'is Long\'s, and the package\'s standing rule is that Long\'s own current word stands unless something is '
 'wrong with it. Recorded at X.9 in `continuity.md` as considered rather than passed over — which is the '
 'part of the finding that was a real gap.\n\n'
 '**33.1 — applied.** X.33 "What is that which, as to this material, our life, can be done or said…" '
 '→ "What is that which, as to this material**—our life—**can be done or said…". Four '
 'commas in eleven words held the relative "which … can be done" open across two nested appositives before '
 'the reader reached the verb. The em dashes are not a new device in this book: X.13\'s and X.21\'s appositions '
 'are set exactly so, and the fold at X.33 is the same kind of thing. Every word and Long\'s order are kept; '
 'nothing is added. Applied under **D8** — `continuity.md`\'s X.33 entry described the fold but recorded '
 '**no considered reason** for preferring commas, so there was no reason on record better than the '
 'reviewer\'s, and D8 directs that a minor or optional finding is applied in that case. The reviewer\'s counter '
 '("a drafter who prefers to keep dashes rare in this book has a good reason to leave it") would have been that '
 'reason had it been recorded before the draft froze; it was not.\n\n'
 '**34.1 — no change, record only, exactly as the reviewer proposes.** X.34\'s `For example:— "Leaves, '
 'some the wind scatters on the ground— So is the race of men."` is **byte-identical to the staged '
 'original**: the two em dashes each followed by a space are the verse-join showing through, not a drafting '
 'choice, and the second is Long\'s line-end dash from PG 6305–6306. Touching it would mean touching the '
 'verse-joining rule, which is a `../PROVENANCE.md` §4 matter affecting the joined verse in five other '
 'books (V.31, V.33, VII.40–51, XI.6/31/32, XII.3), and re-opening a rule that five accepted books were '
 'drafted under, for a typographic nicety, is the wrong trade. `continuity.md` now records at X.34 that the two '
 'spaced dashes are inherited from the join and are deliberate, and that the package\'s "em dashes without '
 'spaces" rule governs the candidate\'s own dashes, not the source\'s.\n\n'
 '**36.1 — applied.** X.36 "there shall not be **by him** when he is dying" → "there shall not be '
 '**beside him** when he is dying". The "shall" itself is untouched and stays defended (the negative '
 'consecutive subjunctive of the VIII.32 class); the word repaired is the preposition. Long means *at his '
 'side*, and "be by him" in modern English reads first as agentive — something done **by** him — and '
 'only on a second pass as locative, at the opening of the longest meditation in the second half of the book '
 'and inside a long correlative the reader is already holding open. This is the same class of change as "like '
 'to an axe" → "like an axe" at X.38 and "in fine" → "in short" at X.26: an English usage that has '
 'gone dead or changed meaning, replaced by the word for what Long says. One word, Long\'s sense exactly, '
 'nothing added. Applied under D8: `continuity.md`\'s X.36 entry recorded considered reasons for "perchance", '
 '"benevolent" and the "shall", but none for "by him".\n\n'
 '**36.2 — applied.** X.36 "at least **some one** to say to himself" → "at least **someone** to say '
 'to himself". PG prints the pronoun as two words and v1 followed. But the base-text ruling at X.36 is about '
 '**"least" against "last"**, not about the space, and it is untouched by this: the candidate still reads "at '
 'least", still against Standard Ebooks\' "at last". The two-word form is a typographic convention of 1862 of '
 'exactly the kind this package already normalises — American spelling, straight quotation marks, em '
 'dashes — and it is not a reading, since no sense of the sentence turns on it. Leaving it would have been '
 'defensible only if named as such in `continuity.md`, which is the reviewer\'s own condition; normalising is '
 'the cleaner of the two and matches what the package does everywhere else. Recorded at X.36 and in the '
 '`continuity.md` note on typographic normalisation.'
)

RULINGS = (
 '## The reviewer\'s rulings — every flagged decision settled, none left open\n\n'
 'Nine further items were referred to the reviewer or arose in the review, and the drafter is upheld on every '
 'one but X.32. `continuity.md` and `provenance.json` move all of them out of the flagged section.\n\n'
 '**1. X.15 "Let men see" for PG\'s "Let me see" — UPHELD, and settled.** Four independent grounds '
 'converge, as the reviewer puts it: the clause is one half of a parallel pair with "let them know" and '
 'changing subject mid-pair is motiveless; "them" is left without an antecedent under "let me see"; the section '
 'is about how Marcus is *seen* by those among whom he lives; and a dropped single letter is the commonest '
 'class of transcription slip. Standard Ebooks reads "men". Same class as VIII.37 "Fergamus"/"Pergamus" and '
 'IX.34 "pool souls"/"poor souls", both upheld at round 1 of their books. It stays **the one departure from '
 'PG\'s letters in Book X**, recorded in three places.\n\n'
 '**2. X.9 "Mimi" kept untranslated — UPHELD, and no gloss exception is warranted.** It is Long\'s text, '
 'not apparatus: he prints the Latin genre name and explains it only in a footnote this package drops. "Mimes" '
 'would import the footnote\'s content *and* mislead, since a modern "mime" is a silent performer rather than '
 'the broad farce Marcus means; a bracketed or appositive gloss would be exactly the imported-footnote content '
 'the no-glosses rule exists to prevent. The reader meets an unfamiliar proper noun first in a list of five '
 'distractions and takes it as a kind of show, which is close enough to right. Kept, ungloss\'d, on the IX.2 '
 '"the next best voyage, as the saying is" precedent.\n\n'
 '**3. Long\'s comma inside the X.25 dagger clause — CONFIRMED, kept.** "And he also who is grieved or '
 'angry or afraid, is discontented because…" The comma closes a long relative subject, which is ordinary '
 'nineteenth-century practice and creates no misreading — a rhythm mark, not a syntax error waiting to '
 'trip anyone — and it falls **at the dagger**, where the settled practice (VI.50, VII.16, VIII.51, '
 'IX.6/26/27) is that the clause stands as Long has it with only pronouns and glossary renderings changed. '
 'Removing it would be a stylistic change inside a dagger clause, which is the exact thing the Book VIII '
 'reviewer reverted at VIII.51.\n\n'
 '**4. X.21\'s "[is wont]" folded rather than dropped — CONFIRMED** (the execution repaired; finding '
 '21.1 above). In form a D11 case, in substance not one: Long\'s bracket is the only place in the English where '
 'the verb\'s second sense exists at all, and without it the sentence has no point. The VII.13 / VIII.57 '
 'principle in another form.\n\n'
 '**5. X.2 "[social]" and X.33 "[order]" dropped — CONFIRMED**, on the drafter\'s own test: X.2\'s ladder '
 'of natures survives with "a political being", and X.33\'s chain survives with "law", which Long then uses '
 'four more times, so a single folded "order" would dangle. X.15 is now decided the same way (finding 15.1).\n\n'
 '**6. X.6 and X.36, PG right against Standard Ebooks — both CONFIRMED.** SE\'s "turn **an** my efforts" '
 'is not English and is plainly a slip for "all", which is also what the argument needs (a total redirection, '
 'not a partial one). SE\'s "at **last** someone" would put "at last" twice inside eleven words and flattens '
 'Long\'s concessive "at least" into a temporal.\n\n'
 '**7. The "thou are" slip present in both base texts — correctly invisible.** PG has it at X.32 "thou '
 'are not simple", SE at "thou are not good"; each text gets right the clause the other gets wrong, both become '
 '"you are" under the thou-rule, and neither reaches the candidate. Recording it anyway is confirmed as the '
 'right call, so that a later collator does not think one text was silently preferred.\n\n'
 '**8. PG\'s Latin name forms at X.27 — CONFIRMED.** D6 governs, the accepted Book IX already keeps '
 '"Philippus" at IX.29, and "Hadrianus / Antoninus / Philippus / Alexander / Croesus" is a consistent set as '
 'Long prints it; modernising two of five would produce a mixed roll.\n\n'
 '**9. Standard Ebooks\' five typographic paragraph breaks ignored — CONFIRMED.** None is a section '
 'break: PG prints each section whole, no text differs on either side of any break, 38 is the standard section '
 'count, and a 39th or 43rd paragraph would break the 487-paragraph alignment the package is built on. The '
 'IX.28 ruling.\n\n'
 '**10. The "shall" audit passed.** The reviewer classified all 23 of Long\'s "shall / shalt" independently and '
 'matched the drafter\'s report exactly: six kept (X.6\'s five first-person "I shall"; X.36\'s negative '
 'consecutive subjunctive) and seventeen removed, every one a plain future. The two hard cases are confirmed '
 'right: X.11\'s indirect "what any man shall say or think about him" and X.32\'s direct "who is he that shall '
 'hinder thee" are both **rhetorical futures**, not deliberative questions, so the clause widened at Book IX '
 'acceptance never fires in Book X. The rule\'s edge — X.1\'s positive consecutive clause removed while '
 'X.36\'s negative one is kept — is consistent under the rule\'s letter (the rule names the *negative* '
 'consecutive subjunctive) and under its spirit, and the reviewer raises no finding on it. **Book X adds no new '
 'case to the three third-person plain futures already standing in accepted books** (III.9, VII.8, VII.24), '
 'which remain in the ledger under "Open, not blocking" and are not reopened here.\n\n'
 '**11. The step-1 no-rebuild finding — UPHELD by the stronger method, and the reconstruction\'s own '
 'rules audited.** The reviewer did not re-run either script. It audited `scripts/verify_book10_source.py`\'s '
 '*rules* against the raw PG range first, on the ground that a reconstruction sharing a blind spot with the '
 'build proves nothing, and tested the three rules that can fail silently: (a) the footnote-consumption rule '
 'cannot have swallowed Long\'s Homer couplet, because an independent listing of **every maximal indented run** '
 'in the range with its indentation profile finds **twelve** runs, eleven of them footnote runs indented four '
 'spaces (the footnote-[B] Odyssey quatrain at seven, inside run 6009–6036), and the twelfth — '
 '6305–6307 — indented **five**, containing no footnote opener and adjacent to no footnote run (the '
 'nearest preceding ends at 6269, the nearest following opens at 6319); (b) the join-unnumbered-blocks rule '
 'cannot hide a running head, page number or catchword, because absorbed text would show as an extra word in a '
 'diff and none did, and independently there are **no standalone short flush-left lines in the range at all** '
 '(the drafter\'s "exactly one" counted the `X.` header at 5865, which sits *outside* the range — a '
 'harmless off-by-placement, noted); (c) a flush-left footnote body of the VII.45 kind would have shown as an '
 'inserted paragraph or inserted words, and none did. The marker recount reconciles exactly: **16** `[A-D]` '
 'markers in flush-left lines **+ 1** at the end of the indented verse line 6306 = **17** for **17** indented '
 'footnote openers in eleven runs. "The drafter\'s class-by-class account is exactly right, including the '
 'seventeenth marker inside the verse." Running the reconstruction then reproduces its claim: 38 paragraphs, '
 'and four differing paragraphs — X.9, X.19, X.25, X.31 — **each differing only by one `+`**, the '
 'four documented dagger marks. **No rebuild is needed and no accepted book is reopened.**\n\n'
 '**12. The word ratio and the five identical paragraphs — ruled on directly, not accepted on '
 'explanation.** Book ratio **0.9943** recomputed. The 0.88 minimum at X.23 is **entirely** the nine-word '
 'translator\'s note: with the note set aside the meditation is 57 source words against the candidate\'s 58 '
 '(1.02), and every clause, all three places and Plato\'s sentence entire are present. "There is no compression '
 'anywhere in the book." And the five byte-identical paragraphs (X.16, X.17, X.18, X.19, X.35) are a **real '
 'result, not an omission**: each was checked against the accessibility standard on its own and contains no '
 'thou-form, no archaic inflection, no glossary term, no bracket, no cross-reference and no dagger-affected '
 'wording. "Long\'s English in those five is already the modern edition\'s English. Leaving them identical is '
 'correct; changing them would have been the error."\n\n'
 '**13. Nothing imported from other translations — confirmed by an independent test.** The complete list '
 'of words the candidate uses that occur nowhere in Long\'s Book X is **eleven**, each documented; a candidate '
 'that borrowed phrasing would show clusters of such words. The reviewer checked the seven passages most likely '
 'to attract a familiar modern rendering and found each keeps a Long-specific turn that Hays, Farquharson and '
 'Staniforth do not have.'
)

NOT_CHANGED = (
 '**Findings applied: all six minor (1.1, 15.1, 21.1, 23.1, 32.1, C1) and three of the five optional (33.1, '
 '36.1, 36.2). Left as drafted with the reason recorded: 9.1 ("gravity", which the reviewer would leave) and '
 '34.1 (X.34\'s inherited spaced dashes, which the reviewer asks be recorded, not changed).** There was no '
 'substantive finding. Every one of the eleven findings is answered either way, as step 6 requires. Of the '
 'reviewer\'s unnumbered "also noted" remarks, none required a change: they are confirmations of renderings the '
 'glossary or `continuity.md` already fixes — "more plain to see", "preservation", the recast close of '
 'X.1, "I love as you love" at X.21, the folded "[thee to live]" at X.32, "like an axe" at X.38, and the two '
 'commas added at X.37.'
)

FLOW = (
 '**Flow read (step 7):** `candidate-v2-readable.md` read continuously X.1–X.38 after the build. No '
 'change was made from it. The five corrected passages read without a snag in place. X.15 now runs "For it '
 'makes no difference whether a man lives there or here, if he lives everywhere in the world as in a state. Let '
 'men see, let them know a real man who lives according to nature." — three short sentences where the '
 'apposition had been a fourth clause, and the meditation\'s turn from place to being seen is faster for it. '
 'X.21\'s close, "And is not this too said that \\"this or that loves\\"—is wont—\\"to be '
 'produced?\\"", now sets the saying and the gloss apart by eye, so the pun is visible in the typography as it '
 'was in Long\'s brackets. X.32\'s "Only determine to live no longer unless you are such." is a plain command '
 'standing between "who is he that will hinder you from being good and simple?" and "For neither does reason '
 'allow you to live, if you are not such." — the sentence is harder now than it was with the pronoun in '
 'front of it, which is the right direction. X.33 opens on two commas instead of four. X.36\'s first sentence '
 'lands its locative on the first reading: "There is no man so fortunate that there shall not be beside him '
 'when he is dying some who are pleased with what is going to happen."\n\n'
 'The book still reads as one self-address in one voice. The long argumentative sections (X.1, X.6, X.7, X.8, '
 'X.31, X.33, X.36) run long, and the run of one-line meditations in the middle (X.14, X.16, X.17, X.18, X.20, '
 'X.22) still lands as a change of tempo, which is much of what Book X is. Terminology was checked across the '
 'accepted books at the read: "the whole" and "the universe" never drift into each other (X.1, X.6 passim, '
 'X.7); "the ruling part" (X.24, X.38) and "the intelligent part" (X.8) stay distinct, as the reviewer '
 'confirmed they should; "the universal reason" (X.7) and "the universal nature" (X.20) keep their own shapes; '
 '"reason" is never "rationality"; "a political being" (X.2) and "a state" (X.15) sit under the rows extended '
 'and applied for this book; "a good god within—happiness" (X.13) follows VII.17; "according to nature" '
 'and "in accordance with" are used on the rule stated in `continuity.md`; "impressions", "opinion", '
 '"disturbance", "change", "kindness" and "the common good" are as the glossary and the nine earlier '
 'acceptances have them. Long\'s own uncommon but current words stand because they are his: "gimlet", '
 '"putrefaction", "magnanimous", "equanimity", "after-times", "gravity". The four dagger clauses leave their '
 'sentences exactly as obscure as Long leaves them, and X.25 keeps his comma after "afraid". Five paragraphs '
 'are still byte-identical to Long. Nothing else changed; see `ACCEPTANCE.md`.'
)


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def main():
    v1 = json.load(open(os.path.join(B10, 'candidate-v1.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(B10, 'source-book10.json'), encoding='utf-8'))
    assert sha(os.path.join(B10, 'candidate-v1.json')) == \
        '95ce5f7c67cb2ba7a2403c95d0b97b85827c35f4ab375cb98f5fbe9a11995c5d', 'v1 is frozen'
    paras = list(v1['paragraphs'])
    log = []
    for n, fid, old, new in CHANGES:
        i = n - 1
        assert paras[i].count(old) == 1, (n, fid, old)
        paras[i] = paras[i].replace(old, new)
        log.append((n, fid, old, new))
    v2 = {'number': v1['number'], 'title': v1['title'], 'paragraphs': paras}
    assert len(paras) == N and all(p.startswith(f'{i+1}. ') for i, p in enumerate(paras))

    # --- bracket arithmetic (finding C1), asserted from the list, not the numeral
    total_brackets = sum(p.count('[') for p in src['paragraphs'])
    assert total_brackets == 18, total_brackets
    for k, needle, label in FOLDS:
        assert needle in paras[k], ('fold missing', label, needle)
    for k, in_src, gone, label in D11_DROPS:
        assert in_src in src['paragraphs'][k], ('D11 source', label)
        assert gone not in paras[k], ('D11 not dropped', label)
    for k, in_src, gone, label in NOTE_DROPS:
        assert in_src in src['paragraphs'][k], ('D13 source', label)
        assert gone not in paras[k], ('D13 not dropped', label)
    assert len(FOLDS) == 14 and len(D11_DROPS) == 3 and len(NOTE_DROPS) == 1
    assert len(FOLDS) + len(D11_DROPS) + len(NOTE_DROPS) == total_brackets, (
        'bracket arithmetic: %d folds + %d D11 drops + %d translator note != %d brackets'
        % (len(FOLDS), len(D11_DROPS), len(NOTE_DROPS), total_brackets))
    assert not any('[' in p for p in paras)
    assert not any(re.search(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\. ', p) for p in paras)

    # --- the four dagger clauses, and X.25's comma inside one of them
    for k, s_, c_ in DAGGERS:
        assert s_ in src['paragraphs'][k] and c_ in paras[k], k
    assert 'or afraid, is discontented' in paras[24]

    # --- the corrections themselves
    assert 'as in a state.' in paras[14] and 'political community' not in paras[14]
    assert 'that "this or that loves"—is wont—"to be produced?"' in paras[20]
    assert 'loves—is wont—to be produced' not in paras[20]
    assert paras[31].startswith('32. ') and 'You, only determine' not in paras[31]
    assert 'Only determine to live no longer unless you are such.' in paras[31]
    assert 'this material—our life—can be done' in paras[32]
    assert 'shall not be beside him when he is dying' in paras[35]
    assert 'at least someone to say' in paras[35] and 'at least some one' not in paras[35]

    # --- unchanged by v2: the base-text calls and the "shall" inventory
    assert 'Let me see' in src['paragraphs'][14] and 'Let men see' in paras[14]
    assert 'turn all my efforts' in paras[5]
    assert 'Hadrianus' in paras[26] and 'Philippus' in paras[26]
    assert 'Mimi' in paras[8]
    assert 'when gravity' in paras[8]                      # finding 9.1, left as drafted
    assert 'ground— So is the race of men.' in paras[33]   # finding 34.1, record only
    assert paras[33] == src['paragraphs'][33].replace('thy children', 'your children') \
        .replace('those who shall receive', 'those who will receive') \
        .replace('thou avoidest and pursuest', 'you avoid and pursue') \
        .replace('thou shalt close thy eyes', 'you will close your eyes') \
        .replace('attended thee to thy grave', 'attended you to your grave')
    assert sum(len(re.findall(r'\bshal[lt]\b', p)) for p in src['paragraphs']) == 23
    assert [i + 1 for i, p in enumerate(paras) if re.search(r'\bshall\b', p)] == [6, 36]
    assert paras[5].count('I shall') == 5
    assert not any(re.search(r'\b(?:you|he|she|it|they) shall\b', p) for p in paras)
    assert not any(re.search(r'\b(thou|thy|thee|thyself|shalt|hast|art|dost|wilt|wast)\b', p)
                   for p in paras)
    # five paragraphs still byte-identical to Long
    ident = [i + 1 for i, (s_, c_) in enumerate(zip(src['paragraphs'], paras)) if s_ == c_]
    assert ident == [16, 17, 18, 19, 35], ident

    json.dump(v2, open(os.path.join(B10, 'candidate-v2.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

    lines = ['# Meditations, Book 10 — modern-English candidate v2', '',
             f'**Title:** {v2["title"]}', '',
             'Candidate v1 with the round-1 independent-review corrections applied (see '
             '`changes-v1-to-v2.md`). Paragraph IDs `B10-Pxxx` are for reference only; the leading number is '
             'part of the text.', '']
    for i, p in enumerate(paras):
        lines += [f'**[B10-P{i+1:03d}]**', '', p, '']
    open(os.path.join(B10, 'candidate-v2-readable.md'), 'w', encoding='utf-8').write('\n'.join(lines))

    ch = ['# Changes v1 → v2 — Meditations, Book X', '',
          'Every change made to `candidate-v1.json` to produce `candidate-v2.json`, by paragraph ID, with the '
          'round-1 finding it answers (`review/findings-v1.md`). Applied mechanically by '
          '`scripts/build_book10_v2.py`; each "old" string matched exactly once in its paragraph. Paragraphs '
          'not listed are byte-identical between v1 and v2.', '',
          '| Paragraph | Finding | v1 | v2 |', '|---|---|---|---|']
    for n, fid, old, new in log:
        ch.append(f'| B10-P{n:03d} (X.{n}) | {fid} | {old} | {new} |')
    changed = sorted({n for n, *_ in log})
    ch += ['', f'**Paragraphs changed:** {len(changed)} of {N} '
           f'({", ".join("X." + str(n) for n in changed)}). Unchanged: '
           + ', '.join('X.' + str(n) for n in range(1, N + 1) if n not in changed) + '.', '',
           '**Record-only findings (no word of the text changes):** 1.1 (the X.1 comma removal recorded in '
           '`continuity.md` and the punctuation tally corrected to five removed), 23.1 (**D13** added to '
           '`../00-progress-ledger.md`; `continuity.md`\'s X.23 entry now cites D13), C1 (sixteen → **fourteen** '
           'folds after 15.1, in `continuity.md`, `README.md`, `review-instructions.md`, `provenance.json` and '
           'the ledger, with the arithmetic now asserted by this script and by the `README.md` check block), '
           '9.1 (X.9 "gravity" recorded as considered and left) and 34.1 (X.34\'s inherited spaced dashes '
           'recorded as deliberate).', '',
           f'**Bracket arithmetic after v2:** {len(FOLDS)} folded + {len(D11_DROPS)} dropped under D11 + '
           f'{len(NOTE_DROPS)} translator\'s note dropped under D13 = **{total_brackets}** brackets in Long\'s '
           'Book X. Asserted by the build from the enumerated list, so the numeral cannot drift from it again.',
           '', NOT_CHANGED, '', APPLIED, '', OPTIONAL, '', RULINGS, '', FLOW, '',
           f'**Hashes:** candidate-v1.json `{sha(os.path.join(B10, "candidate-v1.json"))}`; candidate-v2.json '
           f'`{sha(os.path.join(B10, "candidate-v2.json"))}`.']
    open(os.path.join(B10, 'changes-v1-to-v2.md'), 'w', encoding='utf-8').write('\n'.join(ch) + '\n')

    print('paragraphs changed:', changed)
    for n in changed:
        a = v1['paragraphs'][n - 1].split()
        b = paras[n - 1].split()
        d = [x for x in difflib.ndiff(a, b) if x[0] in '+-']
        print(f'X.{n}: ' + ' '.join(d))
    print('brackets %d = %d folds + %d D11 + %d note' %
          (total_brackets, len(FOLDS), len(D11_DROPS), len(NOTE_DROPS)))
    print('v1 sha256', sha(os.path.join(B10, 'candidate-v1.json')))
    print('v2 sha256', sha(os.path.join(B10, 'candidate-v2.json')))
    sw = sum(len(p.split()) for p in src['paragraphs'])
    cw = sum(len(p.split()) for p in paras)
    print('words source', sw, 'v2', cw, 'ratio %.4f' % (cw / sw))
    ratios = sorted((len(c.split()) / len(s.split()), i + 1)
                    for i, (s, c) in enumerate(zip(src['paragraphs'], paras)))
    print('min paragraph ratios', ['X.%d %.2f' % (n, r) for r, n in ratios[:4]])
    print('max paragraph ratio', 'X.%d %.2f' % (ratios[-1][1], ratios[-1][0]))


if __name__ == '__main__':
    main()
